import React, { useState } from 'react';
import {
  Users, Briefcase, Code, Database, Cloud, Heart,
  Clock, Award, Building, XCircle, PlusCircle
} from 'lucide-react';

const CandidateMatchingForm = ({ candidate, onCandidateChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCandidate, setEditedCandidate] = useState({ ...candidate });

  // 編集モードの切り替え
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditedCandidate({ ...candidate });
    }
  };

  // 変更を保存
  const saveChanges = () => {
    onCandidateChange(editedCandidate);
    setIsEditing(false);
  };

  // フォーム入力処理
  const handleSkillChange = (category, index, value) => {
    const updatedSkills = { ...editedCandidate.skills };
    const categorySkills = [...updatedSkills[category]];
    categorySkills[index] = value;
    updatedSkills[category] = categorySkills;
    
    setEditedCandidate({
      ...editedCandidate,
      skills: updatedSkills
    });
  };

  // スキル追加
  const addSkill = (category) => {
    const updatedSkills = { ...editedCandidate.skills };
    updatedSkills[category] = [...updatedSkills[category], ''];
    
    setEditedCandidate({
      ...editedCandidate,
      skills: updatedSkills
    });
  };

  // スキル削除
  const removeSkill = (category, index) => {
    const updatedSkills = { ...editedCandidate.skills };
    updatedSkills[category] = updatedSkills[category].filter((_, i) => i !== index);
    
    setEditedCandidate({
      ...editedCandidate,
      skills: updatedSkills
    });
  };

  // 価値観変更
  const handleValueChange = (index, value) => {
    const updatedValues = [...editedCandidate.values];
    updatedValues[index] = value;
    
    setEditedCandidate({
      ...editedCandidate,
      values: updatedValues
    });
  };

  // 価値観追加
  const addValue = () => {
    setEditedCandidate({
      ...editedCandidate,
      values: [...editedCandidate.values, '']
    });
  };

  // 価値観削除
  const removeValue = (index) => {
    setEditedCandidate({
      ...editedCandidate,
      values: editedCandidate.values.filter((_, i) => i !== index)
    });
  };

  // 経験情報を更新
  const handleExperienceChange = (field, value) => {
    let parsedValue = value;
    if (field === 'total_years' || field === 'avg_project_scale') {
      parsedValue = parseFloat(value) || 0;
    } else if (field === 'has_management_exp') {
      parsedValue = value === 'true';
    }
    
    setEditedCandidate({
      ...editedCandidate,
      experience_analysis: {
        ...editedCandidate.experience_analysis,
        [field]: parsedValue
      }
    });
  };

  // 業界経験を更新
  const handleIndustryChange = (industry, years) => {
    const updatedIndustries = { ...editedCandidate.experience_analysis.industries };
    updatedIndustries[industry] = parseFloat(years) || 0;
    
    setEditedCandidate({
      ...editedCandidate,
      experience_analysis: {
        ...editedCandidate.experience_analysis,
        industries: updatedIndustries
      }
    });
  };

  // 業界追加
  const addIndustry = () => {
    const industryName = prompt('業界名を入力してください:');
    if (industryName && industryName.trim() !== '') {
      const updatedIndustries = { 
        ...editedCandidate.experience_analysis.industries,
        [industryName]: 0
      };
      
      setEditedCandidate({
        ...editedCandidate,
        experience_analysis: {
          ...editedCandidate.experience_analysis,
          industries: updatedIndustries
        }
      });
    }
  };

  // 業界削除
  const removeIndustry = (industry) => {
    const updatedIndustries = { ...editedCandidate.experience_analysis.industries };
    delete updatedIndustries[industry];
    
    setEditedCandidate({
      ...editedCandidate,
      experience_analysis: {
        ...editedCandidate.experience_analysis,
        industries: updatedIndustries
      }
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-lg text-gray-800">
          {isEditing ? "候補者情報を編集" : "候補者詳細"}
        </h3>
        <button
          onClick={toggleEditMode}
          className="px-3 py-1 text-sm rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          {isEditing ? "キャンセル" : "編集"}
        </button>
      </div>

      <div className="mb-4">
        <div className="flex items-center mb-2">
          <Users className="h-5 w-5 text-blue-500 mr-2" />
          <h4 className="font-medium text-gray-700">基本情報</h4>
        </div>
        {isEditing ? (
          <div className="pl-7 mb-4">
            <label className="block text-sm text-gray-600 mb-1">
              名前
            </label>
            <input
              type="text"
              value={editedCandidate.name}
              onChange={(e) => setEditedCandidate({ ...editedCandidate, name: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        ) : (
          <p className="pl-7 text-gray-700">{candidate.name}</p>
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-center mb-2">
          <Code className="h-5 w-5 text-indigo-500 mr-2" />
          <h4 className="font-medium text-gray-700">スキル</h4>
        </div>
        <div className="pl-7 space-y-4">
          {Object.entries(isEditing ? editedCandidate.skills : candidate.skills).map(([category, skills]) => (
            <div key={category} className="mb-3">
              <h5 className="text-sm font-medium text-gray-600 mb-1">{category}</h5>
              {isEditing ? (
                <div className="space-y-2">
                  {skills.map((skill, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => handleSkillChange(category, index, e.target.value)}
                        className="flex-grow p-1 border border-gray-300 rounded text-sm"
                      />
                      <button
                        onClick={() => removeSkill(category, index)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addSkill(category)}
                    className="flex items-center text-blue-500 hover:text-blue-700 text-sm"
                  >
                    <PlusCircle size={16} className="mr-1" />
                    追加
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mr-1 mb-1"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center mb-2">
          <Briefcase className="h-5 w-5 text-green-500 mr-2" />
          <h4 className="font-medium text-gray-700">経験</h4>
        </div>
        <div className="pl-7 space-y-3">
          {isEditing ? (
            <>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  総経験年数
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={editedCandidate.experience_analysis.total_years}
                  onChange={(e) => handleExperienceChange('total_years', e.target.value)}
                  className="w-full p-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  業界経験
                </label>
                {Object.entries(editedCandidate.experience_analysis.industries).map(([industry, years]) => (
                  <div key={industry} className="flex items-center mb-2">
                    <input
                      type="text"
                      value={industry}
                      readOnly
                      className="flex-grow p-1 border border-gray-300 rounded-l text-sm bg-gray-50"
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={years}
                      onChange={(e) => handleIndustryChange(industry, e.target.value)}
                      className="w-20 p-1 border border-gray-300 text-sm"
                      placeholder="年数"
                    />
                    <button
                      onClick={() => removeIndustry(industry)}
                      className="p-1 border border-gray-300 rounded-r text-red-500 hover:text-red-700 bg-gray-50"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addIndustry}
                  className="flex items-center text-blue-500 hover:text-blue-700 text-sm"
                >
                  <PlusCircle size={16} className="mr-1" />
                  業界追加
                </button>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  マネジメント経験
                </label>
                <select
                  value={editedCandidate.experience_analysis.has_management_exp.toString()}
                  onChange={(e) => handleExperienceChange('has_management_exp', e.target.value)}
                  className="w-full p-1 border border-gray-300 rounded text-sm"
                >
                  <option value="true">あり</option>
                  <option value="false">なし</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  平均プロジェクト規模 (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="1"
                  value={editedCandidate.experience_analysis.avg_project_scale}
                  onChange={(e) => handleExperienceChange('avg_project_scale', e.target.value)}
                  className="w-full p-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center mb-2">
                <Clock className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-700">
                  総経験年数: {candidate.experience_analysis.total_years}年
                </span>
              </div>
              <div className="mb-2">
                <div className="flex items-center mb-1">
                  <Building className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-700">業界経験:</span>
                </div>
                <div className="pl-6">
                  {Object.entries(candidate.experience_analysis.industries).map(([industry, years]) => (
                    <div key={industry} className="text-sm text-gray-600 mb-1">
                      • {industry}: {years}年
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center mb-2">
                <Award className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-700">
                  マネジメント経験: {candidate.experience_analysis.has_management_exp ? 'あり' : 'なし'}
                </span>
              </div>
              <div className="flex items-center">
                <Briefcase className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-700">
                  平均プロジェクト規模: {candidate.experience_analysis.avg_project_scale}/10
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center mb-2">
          <Heart className="h-5 w-5 text-red-500 mr-2" />
          <h4 className="font-medium text-gray-700">価値観・優先事項</h4>
        </div>
        <div className="pl-7">
          {isEditing ? (
            <div className="space-y-2">
              {editedCandidate.values.map((value, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleValueChange(index, e.target.value)}
                    className="flex-grow p-1 border border-gray-300 rounded text-sm"
                  />
                  <button
                    onClick={() => removeValue(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={addValue}
                className="flex items-center text-blue-500 hover:text-blue-700 text-sm"
              >
                <PlusCircle size={16} className="mr-1" />
                追加
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap">
              {candidate.values.map((value, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-1 mb-1"
                >
                  {value}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={saveChanges}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            変更を保存
          </button>
        </div>
      )}
    </div>
  );
};

export default CandidateMatchingForm; 