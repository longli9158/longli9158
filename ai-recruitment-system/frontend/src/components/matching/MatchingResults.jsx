import React from 'react';
import {
  Users, Briefcase, Code, Heart, CheckCircle,
  Award, Building, Star
} from 'lucide-react';

const MatchingResults = ({ candidate, job, results }) => {
  // マッチング結果のテキスト評価を取得
  const getMatchRating = (score) => {
    if (score >= 0.9) return { text: '非常に高い', color: 'text-green-600' };
    if (score >= 0.7) return { text: '高い', color: 'text-green-500' };
    if (score >= 0.5) return { text: '普通', color: 'text-yellow-500' };
    if (score >= 0.3) return { text: '低い', color: 'text-orange-500' };
    return { text: '非常に低い', color: 'text-red-500' };
  };

  // スコアバーの幅を計算
  const getScoreBarWidth = (score) => {
    return `${Math.round(score * 100)}%`;
  };
  
  // スコアバーの色を取得
  const getScoreBarColor = (score) => {
    if (score >= 0.7) return 'bg-green-500';
    if (score >= 0.5) return 'bg-yellow-500';
    if (score >= 0.3) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // 総合評価コメントを生成
  const getOverallComment = (score) => {
    if (score >= 0.9) return '候補者と求人の適合性は非常に高いです。採用を強く推奨します。';
    if (score >= 0.7) return '候補者は求人に適しています。採用を推奨します。';
    if (score >= 0.5) return '候補者は求人に対してある程度適合しています。さらなる評価が必要です。';
    if (score >= 0.3) return '候補者と求人の適合性は低めです。他の候補者も検討することを推奨します。';
    return '候補者と求人の適合性は非常に低いです。この候補者は推奨できません。';
  };

  // スキルマッチのハイライト（上位3つのスキルカテゴリ）
  const getTopSkillMatches = () => {
    if (!results.skill_details) return [];
    
    return Object.entries(results.skill_details)
      .sort((a, b) => b[1] - a[1])
      .filter(([_, score]) => score > 0)
      .slice(0, 3)
      .map(([category, score]) => ({
        category,
        score
      }));
  };

  // 経験マッチのハイライト
  const getExperienceHighlights = () => {
    if (!results.experience_details) return [];
    
    const highlights = [];
    const details = results.experience_details;
    
    if (details.experience_years >= 0.8) {
      highlights.push('経験年数が十分です');
    }
    
    if (details.industry_match >= 0.8) {
      highlights.push('業界経験が一致しています');
    }
    
    if (details.management_match >= 0.8) {
      highlights.push('マネジメント経験の要件を満たしています');
    }
    
    if (details.project_scale_match >= 0.8) {
      highlights.push('プロジェクト規模の経験が十分です');
    }
    
    return highlights;
  };

  // マッチング評価のグレード（A+～F）を取得
  const getMatchGrade = (score) => {
    if (score >= 0.9) return 'A+';
    if (score >= 0.8) return 'A';
    if (score >= 0.7) return 'B+';
    if (score >= 0.6) return 'B';
    if (score >= 0.5) return 'C+';
    if (score >= 0.4) return 'C';
    if (score >= 0.3) return 'D';
    return 'F';
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-lg text-gray-800">マッチング結果</h3>
          <div className="py-1 px-3 bg-blue-50 text-blue-700 rounded-full text-sm font-medium flex items-center">
            <Star className="w-4 h-4 mr-1 fill-current" />
            グレード: {getMatchGrade(results.overall_score)}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center mb-2">
              <Users className="h-5 w-5 text-blue-500 mr-2" />
              <h4 className="font-medium text-gray-700">候補者</h4>
            </div>
            <p className="text-gray-700 pl-7">{candidate.name}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center mb-2">
              <Briefcase className="h-5 w-5 text-blue-500 mr-2" />
              <h4 className="font-medium text-gray-700">求人</h4>
            </div>
            <p className="text-gray-700 pl-7">{job.job_title} - {job.company}</p>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-base font-medium text-gray-700 mb-3">総合スコア</h4>
          <div className="relative pt-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-xs font-semibold inline-block text-blue-600">
                  マッチ度: {Math.round(results.overall_score * 100)}%
                </span>
              </div>
              <div className="text-right">
                <span className={`text-xs font-semibold inline-block ${getMatchRating(results.overall_score).color}`}>
                  {getMatchRating(results.overall_score).text}
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
              <div
                style={{ width: getScoreBarWidth(results.overall_score) }}
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${getScoreBarColor(results.overall_score)}`}
              ></div>
            </div>
          </div>
          <p className="text-sm text-gray-600 italic">{getOverallComment(results.overall_score)}</p>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-base font-medium text-gray-700 mb-3">詳細スコア</h4>
        <div className="space-y-4">
          {/* スキルマッチ */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <Code className="h-4 w-4 text-indigo-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">スキルマッチ</span>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {Math.round(results.skill_score * 100)}%
              </span>
            </div>
            <div className="overflow-hidden h-2 mb-2 text-xs flex rounded bg-gray-200">
              <div
                style={{ width: getScoreBarWidth(results.skill_score) }}
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${getScoreBarColor(results.skill_score)}`}
              ></div>
            </div>
            {getTopSkillMatches().length > 0 && (
              <div className="flex flex-wrap mt-1">
                {getTopSkillMatches().map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mr-1 mb-1"
                  >
                    {skill.category}: {Math.round(skill.score * 100)}%
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 経験マッチ */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <Award className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">経験マッチ</span>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {Math.round(results.experience_score * 100)}%
              </span>
            </div>
            <div className="overflow-hidden h-2 mb-2 text-xs flex rounded bg-gray-200">
              <div
                style={{ width: getScoreBarWidth(results.experience_score) }}
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${getScoreBarColor(results.experience_score)}`}
              ></div>
            </div>
            {getExperienceHighlights().length > 0 && (
              <div className="flex flex-wrap mt-1">
                {getExperienceHighlights().map((highlight, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-1 mb-1"
                  >
                    <CheckCircle size={12} className="mr-1" />
                    {highlight}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 文化適合性 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <Heart className="h-4 w-4 text-red-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">文化適合性</span>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {Math.round(results.culture_fit_score * 100)}%
              </span>
            </div>
            <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
              <div
                style={{ width: getScoreBarWidth(results.culture_fit_score) }}
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${getScoreBarColor(results.culture_fit_score)}`}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-base font-medium text-gray-700 mb-3">推奨アクション</h4>
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
          <ul className="space-y-2 text-sm">
            {results.overall_score >= 0.7 && (
              <>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                  <span>次の選考ステップへ進めることを推奨します</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                  <span>早期に面接を設定してください</span>
                </li>
              </>
            )}
            
            {results.overall_score >= 0.5 && results.overall_score < 0.7 && (
              <>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                  <span>技術面接で詳細なスキル評価を行ってください</span>
                </li>
                {results.skill_score < 0.6 && (
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                    <span>技術スキルについて追加確認が必要です</span>
                  </li>
                )}
                {results.experience_score < 0.6 && (
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                    <span>過去の経験について詳しくヒアリングしてください</span>
                  </li>
                )}
              </>
            )}
            
            {results.overall_score < 0.5 && (
              <>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                  <span>他の候補者も検討することを推奨します</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                  <span>この候補者には別のポジションが適しているかもしれません</span>
                </li>
              </>
            )}
            
            {results.culture_fit_score < 0.5 && (
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                <span>企業文化への適合性について詳しく確認してください</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MatchingResults; 