import React from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts';

const MatchingVisualizer = ({ results }) => {
  // レーダーチャート用データの変換
  const getRadarData = () => {
    const skillDetails = results.skill_details || {};
    const experienceDetails = results.experience_details || {};
    
    // スキルカテゴリとスコア
    const skillCategories = Object.entries(skillDetails).map(([category, score]) => ({
      subject: getCategoryLabel(category),
      score: Math.round(score * 100),
      fullMark: 100
    }));
    
    // 経験要件とスコア
    const experienceCategories = Object.entries(experienceDetails).map(([category, score]) => ({
      subject: getExperienceCategoryLabel(category),
      score: Math.round(score * 100),
      fullMark: 100
    }));
    
    // 文化適合性
    const cultureFit = [{
      subject: '文化適合性',
      score: Math.round(results.culture_fit_score * 100),
      fullMark: 100
    }];
    
    // データを組み合わせて返す
    return [...skillCategories, ...experienceCategories, ...cultureFit];
  };
  
  // スキルカテゴリのラベルを取得
  const getCategoryLabel = (category) => {
    const labels = {
      'プログラミング言語': 'プログラミング',
      'フレームワーク': 'フレームワーク',
      'データベース': 'DB',
      'クラウド': 'クラウド',
      'ソフトスキル': 'ソフトスキル',
      'ビジネス': 'ビジネス'
    };
    return labels[category] || category;
  };
  
  // 経験カテゴリのラベルを取得
  const getExperienceCategoryLabel = (category) => {
    const labels = {
      'experience_years': '経験年数',
      'industry_match': '業界経験',
      'management_match': 'マネジメント',
      'project_scale_match': 'プロジェクト規模'
    };
    return labels[category] || category;
  };
  
  // 棒グラフ用のデータ
  const getBarData = () => {
    return [
      {
        name: 'スキル',
        score: Math.round(results.skill_score * 100)
      },
      {
        name: '経験',
        score: Math.round(results.experience_score * 100)
      },
      {
        name: '文化適合性',
        score: Math.round(results.culture_fit_score * 100)
      },
      {
        name: '総合',
        score: Math.round(results.overall_score * 100)
      }
    ];
  };
  
  // 棒グラフのカラーを取得
  const getBarColor = (score) => {
    if (score >= 70) return '#22c55e';  // green-500
    if (score >= 50) return '#eab308';  // yellow-500
    if (score >= 30) return '#f97316';  // orange-500
    return '#ef4444';  // red-500
  };
  
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="font-medium text-lg text-gray-800 mb-4">マッチング分析</h3>
      
      <div className="mb-6">
        <h4 className="text-base font-medium text-gray-700 mb-3">マッチングスコア</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={getBarData()}
              margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => [`${value}%`, 'スコア']} />
              <Bar
                dataKey="score"
                name="適合度"
                fill="#4f46e5"
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div>
        <h4 className="text-base font-medium text-gray-700 mb-3">詳細分析</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart outerRadius={100} data={getRadarData()}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#6b7280' }} />
              <Radar
                name="マッチ度"
                dataKey="score"
                stroke="#4f46e5"
                fill="#818cf8"
                fillOpacity={0.5}
              />
              <Tooltip formatter={(value) => [`${value}%`, 'マッチ度']} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="mt-4">
        <h4 className="text-base font-medium text-gray-700 mb-2">注目ポイント</h4>
        <div className="text-sm text-gray-600">
          {results.skill_score >= 0.7 && (
            <p className="mb-1">• スキルマッチが高く、職務に必要なスキルを十分に備えています。</p>
          )}
          {results.skill_score < 0.5 && (
            <p className="mb-1">• スキルマッチが低いため、研修や追加学習が必要かもしれません。</p>
          )}
          {results.experience_score >= 0.7 && (
            <p className="mb-1">• 経験レベルが要件を満たしており、即戦力となる可能性が高いです。</p>
          )}
          {results.experience_score < 0.5 && (
            <p className="mb-1">• 経験が十分でない可能性があります。メンタリングが必要かもしれません。</p>
          )}
          {results.culture_fit_score >= 0.7 && (
            <p className="mb-1">• 企業文化への適合性が高く、チームに馴染みやすいでしょう。</p>
          )}
          {results.culture_fit_score < 0.5 && (
            <p className="mb-1">• 文化適合性が低いため、入社後の定着に課題があるかもしれません。</p>
          )}
          {results.overall_score >= 0.8 && (
            <p className="mb-1 font-medium text-green-600">• 総合的に見て、非常に優れた候補者です。</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchingVisualizer; 