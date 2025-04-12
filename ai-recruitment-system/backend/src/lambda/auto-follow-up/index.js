const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const ses = new AWS.SES({ region: process.env.REGION });

// メール送信テンプレート
const EMAIL_TEMPLATES = {
  APPLICATION_RECEIVED: {
    subject: '応募ありがとうございます - NeoCrea採用チーム',
    body: (candidateName) => `${candidateName}様

NeoCrea採用チームです。この度は弊社の求人にご応募いただき、誠にありがとうございます。
応募書類の確認が完了次第、選考プロセスについて詳細をご連絡いたします。

何かご質問がございましたら、お気軽にこのメールにご返信ください。

よろしくお願いいたします。
NeoCrea採用チーム`
  },
  INTERVIEW_SCHEDULED: {
    subject: '面接のご案内 - NeoCrea採用チーム',
    body: (candidateName, interviewDate) => `${candidateName}様

NeoCrea採用チームです。面接の日程が${interviewDate}に確定いたしました。
面接の詳細情報と準備いただきたい内容については別途ご連絡いたします。

何かご質問がございましたら、お気軽にこのメールにご返信ください。

よろしくお願いいたします。
NeoCrea採用チーム`
  },
  POST_INTERVIEW_FOLLOWUP: {
    subject: '面接へのご参加ありがとうございました - NeoCrea採用チーム',
    body: (candidateName) => `${candidateName}様

NeoCrea採用チームです。先日は面接にご参加いただき、誠にありがとうございました。
選考結果については、1週間以内にご連絡いたします。

何かご質問がございましたら、お気軽にこのメールにご返信ください。

よろしくお願いいたします。
NeoCrea採用チーム`
  },
  OFFER_SENT: {
    subject: '内定のご案内 - NeoCrea採用チーム',
    body: (candidateName) => `${candidateName}様

NeoCrea採用チームです。この度は内定おめでとうございます！
詳細な内定条件と今後の手続きについては、別途PDFで送付いたします。

内定のご返答期限は2週間となっております。何かご質問がございましたら、お気軽にこのメールにご返信ください。

よろしくお願いいたします。
NeoCrea採用チーム`
  }
};

/**
 * 候補者自動フォローアップLambda関数
 * 
 * この関数は、DynamoDBの更新イベントをトリガーとして実行され、
 * 採用プロセスの各段階にある候補者に対して自動的にフォローアップメールを送信します
 * 
 * @param {Object} event - DynamoDBストリームイベント
 * @returns {Object} - 処理結果の要約
 */
exports.handler = async (event) => {
  console.log('自動フォローアップLambda関数が開始されました');
  console.log('イベント:', JSON.stringify(event, null, 2));
  
  const followUpResults = [];
  
  try {
    // DynamoDBストリームからの各レコードを処理
    for (const record of event.Records) {
      // 新しいイメージ（更新後のデータ）を取得
      const newImage = record.dynamodb.NewImage;
      
      // 古いイメージ（更新前のデータ）を取得
      const oldImage = record.dynamodb.OldImage;
      
      // レコードが更新されていない場合はスキップ
      if (!newImage || !oldImage) {
        console.log('新しいイメージまたは古いイメージが存在しないため、レコードをスキップします');
        continue;
      }
      
      // DynamoDBのデータをJavaScriptオブジェクトに変換
      const newItem = AWS.DynamoDB.Converter.unmarshall(newImage);
      const oldItem = AWS.DynamoDB.Converter.unmarshall(oldImage);
      
      // 候補者のステータスが変更された場合のみ処理
      if (newItem.status !== oldItem.status) {
        console.log(`候補者 ${newItem.candidateId} のステータスが ${oldItem.status} から ${newItem.status} に変更されました`);
        
        // ステータスに基づいてフォローアップメールを送信
        const result = await sendFollowUpEmail(newItem);
        followUpResults.push(result);
      }
    }
    
    console.log('自動フォローアップ処理が完了しました');
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: '自動フォローアップ処理が完了しました',
        results: followUpResults
      })
    };
  } catch (error) {
    console.error('自動フォローアップ処理中にエラーが発生しました:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: '自動フォローアップ処理中にエラーが発生しました',
        error: error.message
      })
    };
  }
};

/**
 * 候補者のステータスに基づいてフォローアップメールを送信する関数
 * 
 * @param {Object} candidate - 候補者情報
 * @returns {Object} - メール送信結果
 */
async function sendFollowUpEmail(candidate) {
  const { candidateId, status, email, fullName } = candidate;
  
  // ステータスに基づいてメールテンプレートを選択
  let emailTemplate;
  let additionalParams = {};
  
  switch (status) {
    case 'APPLICATION_RECEIVED':
      emailTemplate = EMAIL_TEMPLATES.APPLICATION_RECEIVED;
      break;
    case 'INTERVIEW_SCHEDULED':
      emailTemplate = EMAIL_TEMPLATES.INTERVIEW_SCHEDULED;
      additionalParams.interviewDate = candidate.interviewDate || '（日程調整中）';
      break;
    case 'INTERVIEW_COMPLETED':
      emailTemplate = EMAIL_TEMPLATES.POST_INTERVIEW_FOLLOWUP;
      break;
    case 'OFFER_SENT':
      emailTemplate = EMAIL_TEMPLATES.OFFER_SENT;
      break;
    default:
      // ステータスに対応するテンプレートがない場合はスキップ
      console.log(`候補者 ${candidateId} のステータス ${status} に対応するテンプレートがありません`);
      return {
        candidateId,
        status,
        sent: false,
        message: '対応するメールテンプレートがありません'
      };
  }
  
  try {
    // メール本文を生成
    let emailBody;
    if (status === 'INTERVIEW_SCHEDULED') {
      emailBody = emailTemplate.body(fullName, additionalParams.interviewDate);
    } else {
      emailBody = emailTemplate.body(fullName);
    }
    
    // SESを使用してメールを送信
    const params = {
      Source: process.env.SENDER_EMAIL || 'recruitment@neocrea.example.com',
      Destination: {
        ToAddresses: [email]
      },
      Message: {
        Subject: {
          Data: emailTemplate.subject
        },
        Body: {
          Text: {
            Data: emailBody
          }
        }
      }
    };
    
    await ses.sendEmail(params).promise();
    
    console.log(`候補者 ${candidateId} にフォローアップメールを送信しました`);
    
    // メール送信履歴をDynamoDBに記録
    await recordEmailHistory(candidateId, status, emailTemplate.subject);
    
    return {
      candidateId,
      status,
      sent: true,
      message: 'フォローアップメールを送信しました'
    };
  } catch (error) {
    console.error(`候補者 ${candidateId} へのメール送信中にエラーが発生しました:`, error);
    
    return {
      candidateId,
      status,
      sent: false,
      message: `メール送信エラー: ${error.message}`
    };
  }
}

/**
 * メール送信履歴をDynamoDBに記録する関数
 * 
 * @param {string} candidateId - 候補者ID
 * @param {string} status - 候補者ステータス
 * @param {string} emailSubject - 送信したメールの件名
 */
async function recordEmailHistory(candidateId, status, emailSubject) {
  const params = {
    TableName: process.env.EMAIL_HISTORY_TABLE || 'NeoCrea-EmailHistory',
    Item: {
      emailId: `${candidateId}-${Date.now()}`,
      candidateId,
      status,
      subject: emailSubject,
      sentAt: new Date().toISOString()
    }
  };
  
  try {
    await dynamoDB.put(params).promise();
    console.log(`候補者 ${candidateId} のメール送信履歴を記録しました`);
  } catch (error) {
    console.error(`メール送信履歴の記録中にエラーが発生しました:`, error);
    // 履歴記録に失敗してもメール送信自体は成功しているため、エラーはスローしない
  }
} 