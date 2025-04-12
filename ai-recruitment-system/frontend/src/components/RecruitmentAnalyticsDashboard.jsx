import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  Users, Briefcase, UserCheck, Clock, Calendar, ChevronDown, 
  Filter, Download, RefreshCw, Share2, Search, TrendingUp
} from 'lucide-react';

// モックデータ
const mockOverviewData = {
  totalCandidates: 1258,
  activeCandidates: 423,
  hiredThisMonth: 24,
  openPositions: 38,
  timeToHire: 32, // 日数
  conversionRate: 68.5, // パーセント
};

const mockApplicationsData = [
  { month: '1月', applications: 120, hires: 12, interviews: 48 },
  { month: '2月', applications: 140, hires: 15, interviews: 52 },
  { month: '3月', applications: 135, hires: 14, interviews: 50 },
  { month: '4月', applications: 180, hires: 20, interviews: 65 },
  { month: '5月', applications: 150, hires: 17, interviews: 55 },
  { month: '6月', applications: 170, hires: 18, interviews: 60 },
  { month: '7月', applications: 190, hires: 22, interviews: 70 },
  { month: '8月', applications: 160, hires: 16, interviews: 58 },
  { month: '9月', applications: 175, hires: 19, interviews: 63 },
  { month: '10月', applications: 195, hires: 21, interviews: 72 },
  { month: '11月', applications: 185, hires: 19, interviews: 68 },
  { month: '12月', applications: 145, hires: 16, interviews: 54 },
];

const mockSourceData = [
  { name: '採用サイト', value: 35 },
  { name: 'リファラル', value: 25 },
  { name: '求人サイト', value: 20 },
  { name: 'SNS', value: 12 },
  { name: 'イベント', value: 8 },
];

const mockStageData = [
  { name: '応募', count: 1258 },
  { name: '書類選考', count: 845 },
  { name: '一次面接', count: 510 },
  { name: '二次面接', count: 320 },
  { name: '最終面接', count: 150 },
  { name: '内定', count: 85 },
  { name: '入社', count: 75 },
];

const mockDepartmentData = [
  { name: 'エンジニアリング', openings: 15, applications: 420, interviews: 120, hires: 10 },
  { name: '営業', openings: 8, applications: 280, interviews: 75, hires: 6 },
  { name: 'マーケティング', openings: 5, applications: 185, interviews: 50, hires: 4 },
  { name: '人事', openings: 3, applications: 95, interviews: 30, hires: 2 },
  { name: '財務', openings: 4, applications: 110, interviews: 35, hires: 3 },
  { name: 'デザイン', openings: 3, applications: 168, interviews: 45, hires: 2 },
];

const mockRejectionReasonsData = [
  { name: '経験不足', value: 32 },
  { name: 'スキルセットの不一致', value: 27 },
  { name: '文化的フィット感の欠如', value: 18 },
  { name: '給与期待値の不一致', value: 14 },
  { name: 'その他', value: 9 },
];

// カラー設定
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const RecruitmentAnalyticsDashboard = () => {
  // 状態管理
  const [timeRange, setTimeRange] = useState('今年');
  const [department, setDepartment] = useState('全部門');
  const [position, setPosition] = useState('全職種');
  const [loading, setLoading] = useState(true);

  // データ読み込み（モック）
  useEffect(() => {
    // API呼び出しのシミュレーション
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  // ローディング表示
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">分析データを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  // 数値フォーマット
  const formatNumber = (num) => {
    return new Intl.NumberFormat('ja-JP').format(num);
  };

  // パーセントフォーマット
  const formatPercent = (num) => {
    return `${num}%`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">採用分析ダッシュボード</h1>
        <p className="text-gray-500 mt-1">採用活動のリアルタイム分析と候補者パイプラインの可視化</p>
      </div>

      {/* フィルターセクション */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">期間</label>
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
            >
              <option>今日</option>
              <option>今週</option>
              <option>今月</option>
              <option>四半期</option>
              <option>今年</option>
              <option>過去1年</option>
              <option>カスタム...</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">部門</label>
          <div className="relative">
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
            >
              <option>全部門</option>
              <option>エンジニアリング</option>
              <option>営業</option>
              <option>マーケティング</option>
              <option>人事</option>
              <option>財務</option>
              <option>デザイン</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">職種</label>
          <div className="relative">
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
            >
              <option>全職種</option>
              <option>ソフトウェアエンジニア</option>
              <option>データサイエンティスト</option>
              <option>営業担当</option>
              <option>マーケティングマネージャー</option>
              <option>人事スペシャリスト</option>
              <option>経理担当</option>
              <option>UIデザイナー</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>

        <div className="ml-auto flex space-x-2">
          <button className="flex items-center text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded">
            <Filter size={16} className="mr-1" />
            詳細フィルター
          </button>
          <button className="flex items-center text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded">
            <Download size={16} className="mr-1" />
            エクスポート
          </button>
          <button className="flex items-center text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* 概要カード */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-start">
            <div className="p-2 bg-blue-100 rounded mr-3">
              <Users size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">総応募者数</h3>
              <p className="text-2xl font-bold text-gray-800">{formatNumber(mockOverviewData.totalCandidates)}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp size={12} className="mr-1" />
                前月比 +12.5%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-start">
            <div className="p-2 bg-green-100 rounded mr-3">
              <UserCheck size={20} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">選考中の候補者</h3>
              <p className="text-2xl font-bold text-gray-800">{formatNumber(mockOverviewData.activeCandidates)}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp size={12} className="mr-1" />
                前月比 +8.2%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-start">
            <div className="p-2 bg-purple-100 rounded mr-3">
              <Briefcase size={20} className="text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">今月の採用数</h3>
              <p className="text-2xl font-bold text-gray-800">{mockOverviewData.hiredThisMonth}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp size={12} className="mr-1" />
                前月比 +15.0%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-start">
            <div className="p-2 bg-yellow-100 rounded mr-3">
              <Briefcase size={20} className="text-yellow-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">募集中のポジション</h3>
              <p className="text-2xl font-bold text-gray-800">{mockOverviewData.openPositions}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp size={12} className="mr-1" />
                前月比 +5.6%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-start">
            <div className="p-2 bg-red-100 rounded mr-3">
              <Clock size={20} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">平均採用期間</h3>
              <p className="text-2xl font-bold text-gray-800">{mockOverviewData.timeToHire}日</p>
              <p className="text-xs text-red-600 flex items-center mt-1">
                <TrendingUp size={12} className="mr-1" />
                前月比 +2.1日
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-start">
            <div className="p-2 bg-indigo-100 rounded mr-3">
              <UserCheck size={20} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">面接→採用率</h3>
              <p className="text-2xl font-bold text-gray-800">{formatPercent(mockOverviewData.conversionRate)}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp size={12} className="mr-1" />
                前月比 +3.2%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* グラフセクション - 上段 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 応募トレンド */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-800">月別応募状況</h3>
            <div className="flex space-x-2">
              <button className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
                応募
              </button>
              <button className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                面接
              </button>
              <button className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                採用
              </button>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={mockApplicationsData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    value, 
                    name === 'applications' ? '応募数' : 
                    name === 'interviews' ? '面接数' : 
                    '採用数'
                  ]}
                />
                <Legend 
                  formatter={(value) => (
                    value === 'applications' ? '応募数' : 
                    value === 'interviews' ? '面接数' : 
                    '採用数'
                  )} 
                />
                <Bar dataKey="applications" fill="#0088FE" />
                <Bar dataKey="interviews" fill="#00C49F" />
                <Bar dataKey="hires" fill="#FFBB28" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 候補者パイプライン */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-800">候補者パイプライン</h3>
            <button className="text-sm text-blue-600 hover:text-blue-800">詳細 →</button>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={mockStageData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [formatNumber(value), '候補者数']} />
                <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* グラフセクション - 中段 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 採用ソース */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-800">採用ソース分布</h3>
            <button className="text-sm text-blue-600 hover:text-blue-800">詳細 →</button>
          </div>
          <div className="flex justify-center h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockSourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mockSourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, '割合']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 不採用理由 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-800">不採用理由の分布</h3>
            <button className="text-sm text-blue-600 hover:text-blue-800">詳細 →</button>
          </div>
          <div className="flex justify-center h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockRejectionReasonsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mockRejectionReasonsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, '割合']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 部門別採用状況 */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-gray-800">部門別採用状況</h3>
          <div className="flex space-x-2 items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="部門を検索..."
                className="pl-8 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-800">詳細 →</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  部門
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  募集ポジション
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  応募数
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  面接数
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  採用数
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  採用率
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">アクション</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockDepartmentData.map((dept, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{dept.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{dept.openings}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatNumber(dept.applications)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatNumber(dept.interviews)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{dept.hires}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatPercent((dept.hires / dept.interviews * 100).toFixed(1))}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900">詳細</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 推奨アクション */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-medium text-gray-800 mb-4">AI推奨アクション</h3>
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
            <h4 className="text-sm font-medium text-blue-800">エンジニアリング部門の応募数が増加しています</h4>
            <p className="text-sm text-blue-600 mt-1">前月比30%増加。一次面接のスケジュールを増やすことを検討してください。</p>
          </div>
          
          <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
            <h4 className="text-sm font-medium text-yellow-800">営業部門の面接→採用率が低下しています</h4>
            <p className="text-sm text-yellow-600 mt-1">前月比15%減少。面接プロセスの見直しを検討してください。</p>
          </div>
          
          <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded">
            <h4 className="text-sm font-medium text-green-800">リファラル採用の質が高い傾向にあります</h4>
            <p className="text-sm text-green-600 mt-1">リファラル候補者は最終面接通過率が25%高く、定着率も15%高い傾向にあります。社内リファラルプログラムの強化を検討してください。</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruitmentAnalyticsDashboard;
