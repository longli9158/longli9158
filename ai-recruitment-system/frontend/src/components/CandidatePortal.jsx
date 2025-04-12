import React, { useState, useEffect } from 'react';
import { Calendar, Clock, FileText, MessageSquare, CheckCircle, ChevronRight, User, LogOut, Mail, Phone, MapPin, Briefcase, Award, Users } from 'lucide-react';

const CandidatePortal = () => {
  // 状態管理
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [applicationStatus, setApplicationStatus] = useState({});
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  
  // ログイン中のユーザー情報とアプリケーション状態を取得
  useEffect(() => {
    // モックデータを使用
    setTimeout(() => {
      const mockUser = {
        id: 'c123',
        firstName: '太郎',
        lastName: '山田',
        email: 'taro.yamada@example.com',
        phone: '080-1234-5678',
        location: '東京都渋谷区',
        position: 'フルスタックエンジニア',
        avatarUrl: null
      };
      
      const mockStatus = {
        currentStage: 'INTERVIEW_SCHEDULED',
        progress: 60,
        lastUpdated: '2025-04-05T09:30:00Z',
        stages: [
          { id: 'RESUME_SUBMITTED', name: '応募書類提出', completed: true, date: '2025-03-25T14:20:00Z' },
          { id: 'RESUME_SCREENING', name: '書類選考', completed: true, date: '2025-03-28T11:15:00Z' },
          { id: 'INTERVIEW_SCHEDULED', name: '一次面接', completed: false, date: '2025-04-10T13:00:00Z' },
          { id: 'TECHNICAL_INTERVIEW', name: '技術面接', completed: false, date: null },
          { id: 'FINAL_INTERVIEW', name: '最終面接', completed: false, date: null },
          { id: 'OFFER', name: '内定', completed: false, date: null }
        ]
      };
      
      const mockEvents = [
        {
          id: 'evt1',
          title: '一次面接',
          type: 'INTERVIEW',
          date: '2025-04-10T13:00:00Z',
          location: '東京オフィス または オンライン',
          description: '人事部の鈴木と30分程度の面接を行います。',
          participants: ['鈴木 HR担当']
        },
        {
          id: 'evt2',
          title: '候補者向けウェビナー: 企業文化について',
          type: 'WEBINAR',
          date: '2025-04-15T17:00:00Z',
          location: 'オンライン (Zoom)',
          description: '当社の企業文化や働き方について紹介するウェビナーです。',
          participants: ['佐藤 CTO', '高橋 エンジニアリングマネージャー']
        }
      ];
      
      const mockDocuments = [
        {
          id: 'doc1',
          name: '履歴書',
          type: 'RESUME',
          status: 'SUBMITTED',
          uploadDate: '2025-03-25T14:20:00Z',
          fileUrl: '#'
        },
        {
          id: 'doc2',
          name: '職務経歴書',
          type: 'CV',
          status: 'SUBMITTED',
          uploadDate: '2025-03-25T14:20:00Z',
          fileUrl: '#'
        },
        {
          id: 'doc3',
          name: '面接準備資料',
          type: 'PREPARATION',
          status: 'NEW',
          uploadDate: '2025-04-05T10:00:00Z',
          fileUrl: '#'
        }
      ];
      
      const mockMessages = [
        {
          id: 'msg1',
          sender: '採用担当 田中',
          date: '2025-04-05T09:30:00Z',
          subject: '一次面接のご案内',
          content: '山田様、一次面接の日程が確定しましたのでご連絡いたします。4月10日(木) 13:00より、当社東京オフィスまたはオンラインにて面接を実施いたします。ご希望の面接方法をお知らせください。',
          read: true
        },
        {
          id: 'msg2',
          sender: '採用担当 田中',
          date: '2025-04-02T14:15:00Z',
          subject: '書類選考通過のお知らせ',
          content: '山田様、この度は当社にご応募いただきありがとうございます。書類選考を通過されましたことをお知らせいたします。次のステップとして面接を実施したいと考えております。',
          read: true
        },
        {
          id: 'msg3',
          sender: 'システム通知',
          date: '2025-03-25T14:25:00Z',
          subject: '応募書類受領のお知らせ',
          content: '山田様、応募書類を受領いたしました。書類選考の結果は1週間以内にご連絡いたします。',
          read: true
        }
      ];
      
      setUser(mockUser);
      setApplicationStatus(mockStatus);
      setUpcomingEvents(mockEvents);
      setDocuments(mockDocuments);
      setMessages(mockMessages);
      setLoading(false);
    }, 1000);
  }, []);
  
  // 日付フォーマット
  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // イベントの日付を判定（過去か未来か）
  const isEventPast = (dateString) => {
    const eventDate = new Date(dateString);
    return eventDate < new Date();
  };
  
  // ステータスに対応する色を返す
  const getStatusColor = (status) => {
    switch (status) {
      case 'SUBMITTED':
        return 'bg-green-100 text-green-800';
      case 'NEW':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // ステージの進捗状況に応じたスタイルを返す
  const getStageStyle = (stage) => {
    if (stage.completed) {
      return 'bg-green-500 text-white';
    } else if (stage.id === applicationStatus.currentStage) {
      return 'bg-blue-500 text-white';
    } else {
      return 'bg-gray-200 text-gray-500';
    }
  };
  
  // イベントタイプに応じたアイコンを返す
  const getEventIcon = (type) => {
    switch (type) {
      case 'INTERVIEW':
        return <MessageSquare size={18} />;
      case 'WEBINAR':
        return <Users size={18} />;
      case 'DEADLINE':
        return <Clock size={18} />;
      default:
        return <Calendar size={18} />;
    }
  };
  
  // ローディング表示
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">ポータルを読み込んでいます...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-800">NeoCrea 採用ポータル</h1>
          </div>
          <div className="flex items-center">
            <div className="mr-4 text-right">
              <p className="text-sm font-medium text-gray-900">{user.lastName} {user.firstName}</p>
              <p className="text-xs text-gray-500">{user.position}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="プロフィール" className="h-8 w-8 rounded-full" />
              ) : (
                <span className="text-sm font-medium">{user.lastName.charAt(0)}</span>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1">
        {/* サイドバー */}
        <aside className="w-64 bg-white border-r border-gray-200">
          <nav className="mt-5 px-2">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full ${
                activeTab === 'dashboard' ? 'bg-blue-100 text-blue-900' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Calendar className={`mr-3 h-5 w-5 ${
                activeTab === 'dashboard' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
              }`} />
              ダッシュボード
            </button>
            
            <button 
              onClick={() => setActiveTab('documents')}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full ${
                activeTab === 'documents' ? 'bg-blue-100 text-blue-900' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileText className={`mr-3 h-5 w-5 ${
                activeTab === 'documents' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
              }`} />
              書類
            </button>
            
            <button 
              onClick={() => setActiveTab('messages')}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full ${
                activeTab === 'messages' ? 'bg-blue-100 text-blue-900' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <MessageSquare className={`mr-3 h-5 w-5 ${
                activeTab === 'messages' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
              }`} />
              メッセージ
              <span className={`ml-auto inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                messages.filter(msg => !msg.read).length > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {messages.filter(msg => !msg.read).length || 0}
              </span>
            </button>
            
            <button 
              onClick={() => setActiveTab('profile')}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full ${
                activeTab === 'profile' ? 'bg-blue-100 text-blue-900' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <User className={`mr-3 h-5 w-5 ${
                activeTab === 'profile' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
              }`} />
              プロフィール
            </button>
            
            <div className="pt-8">
              <button className="group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-red-600 hover:bg-red-50">
                <LogOut className="mr-3 h-5 w-5 text-red-500" />
                ログアウト
              </button>
            </div>
          </nav>
        </aside>
        
        {/* メインコンテンツ */}
        <main className="flex-1 p-6">
          {/* ダッシュボード */}
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">応募状況</h2>
              
              {/* 進捗状況 */}
              <div className="bg-white p-5 rounded-lg shadow mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">選考進捗状況</h3>
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                    <div style={{ width: `${applicationStatus.progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
                  </div>
                </div>
                
                <div className="mt-6 space-y-4">
                  {applicationStatus.stages && applicationStatus.stages.map((stage, index) => (
                    <div key={stage.id} className="flex items-center">
                      <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mr-3 ${getStageStyle(stage)}`}>
                        {stage.completed ? (
                          <CheckCircle size={16} />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-sm font-medium text-gray-900">{stage.name}</h4>
                        {stage.date && (
                          <p className="text-xs text-gray-500">{formatDate(stage.date)}</p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        {stage.id === applicationStatus.currentStage && (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">現在のステップ</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 今後の予定 */}
              <div className="bg-white p-5 rounded-lg shadow mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">今後の予定</h3>
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingEvents.map(event => (
                      <div key={event.id} className={`p-3 rounded-lg border ${isEventPast(event.date) ? 'border-gray-200 bg-gray-50' : 'border-blue-200 bg-blue-50'}`}>
                        <div className="flex items-start">
                          <div className={`flex-shrink-0 p-2 rounded-full ${isEventPast(event.date) ? 'bg-gray-200 text-gray-500' : 'bg-blue-200 text-blue-700'} mr-3`}>
                            {getEventIcon(event.type)}
                          </div>
                          <div className="flex-grow">
                            <h4 className={`text-sm font-medium ${isEventPast(event.date) ? 'text-gray-500' : 'text-gray-900'}`}>{event.title}</h4>
                            <p className="text-xs text-gray-500 mt-1">{formatDate(event.date)}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{event.location}</p>
                            <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                            
                            {event.participants && event.participants.length > 0 && (
                              <div className="mt-2">
                                <span className="text-xs text-gray-500">参加者:</span>
                                <div className="flex flex-wrap mt-1">
                                  {event.participants.map((participant, idx) => (
                                    <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mr-1 mb-1">
                                      {participant}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">現在予定されているイベントはありません。</p>
                )}
              </div>
            </div>
          )}
          
          {/* 書類タブ */}
          {activeTab === 'documents' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">書類</h2>
              
              <div className="bg-white p-5 rounded-lg shadow">
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-800">提出書類</h3>
                  <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                    新規アップロード
                  </button>
                </div>
                
                <div className="overflow-hidden border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          書類名
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          タイプ
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ステータス
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          アップロード日
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">アクション</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {documents.map(doc => (
                        <tr key={doc.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {{
                                'RESUME': '履歴書',
                                'CV': '職務経歴書',
                                'PREPARATION': '準備資料',
                                'OTHER': 'その他'
                              }[doc.type] || doc.type}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(doc.status)}`}>
                              {{
                                'SUBMITTED': '提出済',
                                'NEW': '新規',
                                'PENDING': '確認中',
                                'REJECTED': '再提出'
                              }[doc.status] || doc.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(doc.uploadDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <a href={doc.fileUrl} className="text-blue-600 hover:text-blue-900 mr-4">表示</a>
                            <a href="#" className="text-blue-600 hover:text-blue-900">更新</a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* メッセージタブ */}
          {activeTab === 'messages' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">メッセージ</h2>
              
              <div className="bg-white rounded-lg shadow">
                <div className="divide-y divide-gray-200">
                  {messages.length > 0 ? messages.map(message => (
                    <div key={message.id} className="p-5 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-base font-medium text-gray-900">{message.subject}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {message.sender} - {formatDate(message.date)}
                          </p>
                        </div>
                        {!message.read && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            新着
                          </span>
                        )}
                      </div>
                      <p className="mt-3 text-sm text-gray-600 line-clamp-2">{message.content}</p>
                      <div className="mt-3 flex">
                        <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                          続きを読む
                          <ChevronRight size={16} className="ml-1" />
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="p-5 text-center">
                      <p className="text-gray-500">メッセージはありません。</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* プロフィールタブ */}
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">プロフィール</h2>
              
              <div className="bg-white p-5 rounded-lg shadow mb-6">
                <div className="flex items-center mb-6">
                  <div className="h-16 w-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold mr-4">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="プロフィール" className="h-16 w-16 rounded-full" />
                    ) : (
                      <span>{user.lastName.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{user.lastName} {user.firstName}</h3>
                    <p className="text-sm text-gray-500">{user.position}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">連絡先情報</h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{user.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{user.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{user.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">応募情報</h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Briefcase className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{user.position}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">応募日: {formatDate(applicationStatus.stages && applicationStatus.stages[0].date)}</span>
                      </div>
                      <div className="flex items-center">
                        <Award className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          現在のステータス: 
                          {{
                            'RESUME_SUBMITTED': '書類提出済',
                            'RESUME_SCREENING': '書類選考中',
                            'INTERVIEW_SCHEDULED': '面接予定',
                            'TECHNICAL_INTERVIEW': '技術面接',
                            'FINAL_INTERVIEW': '最終面接',
                            'OFFER': '内定'
                          }[applicationStatus.currentStage] || applicationStatus.currentStage}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                    プロフィールを編集
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CandidatePortal;