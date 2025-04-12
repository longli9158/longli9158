import React, { useState } from 'react';
import {
  Briefcase, Code, Database, Cloud, Heart,
  Building, Award, XCircle, PlusCircle
} from 'lucide-react';

const JobRequirementsForm = ({ job, onJobChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedJob, setEditedJob] = useState({ ...job });

  // 編集モードの切り替え
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditedJob({ ...job });
    }
  };

  // 変更を保存
  const saveChanges = () => {
    onJobChange(editedJob);
    setIsEditing(false);
  };

  // 求人基本情報の更新
  const handleBasicInfoChange = (field, value) => {
    setEditedJob({
      ...editedJob,
      [field]: value
    });
  };

  // スキル要件の更新
  const handleSkillChange = (category, index, value) => {
    const updatedSkills = { ...editedJob.required_skills };
    const categorySkills = [...updatedSkills[category]];
    categorySkills[index] = value;
    updatedSkills[category] = categorySkills;
    
    setEditedJob({
      ...editedJob,
      required_skills: updatedSkills
    });
  };

  // スキル追加
  const addSkill = (category) => {
    const updatedSkills = { ...editedJob.required_skills };
    updatedSkills[category] = [...updatedSkills[category], ''];
    
    setEditedJob({
      ...editedJob,
      required_skills: updatedSkills
    });
  };

  // スキル削除
  const removeSkill = (category, index) => {
    const updatedSkills = { ...editedJob.required_skills };
    updatedSkills[category] = updatedSkills[category].filter((_, i) => i !== index);
    
    setEditedJob({
      ...editedJob,
      required_skills: updatedSkills
    });
  };

  // 経験要件の更新
  const handleExperienceChange = (field, value) => {
    let parsedValue = value;
    if (field === 'min_years' || field === 'min_project_scale') {
      parsedValue = parseFloat(value) || 0;
    } else if (field === 'requires_management') {
      parsedValue = value === 'true';
    }
    
    setEditedJob({
      ...editedJob,
      experience_requirements: {
        ...editedJob.experience_requirements,
        [field]: parsedValue
      }
    });
  };

  // 業界要件の更新
  const handleIndustryChange = (index, value) => {
    const updatedIndustries = [...editedJob.experience_requirements.preferred_industries];
    updatedIndustries[index] = value;
    
    setEditedJob({
      ...editedJob,
      experience_requirements: {
        ...editedJob.experience_requirements,
        preferred_industries: updatedIndustries
      }
    });
  };

  // 業界要件の追加
  const addIndustry = () => {
    setEditedJob({
      ...editedJob,
      experience_requirements: {
        ...editedJob.experience_requirements,
        preferred_industries: [...editedJob.experience_requirements.preferred_industries, '']
      }
    });
  };

  // 業界要件の削除
  const removeIndustry = (index) => {
    setEditedJob({
      ...editedJob,
      experience_requirements: {
        ...editedJob.experience_requirements,
        preferred_industries: editedJob.experience_requirements.preferred_industries.filter((_, i) => i !== index)
      }
    });
  };

  // 企業価値観の更新
  const handleValueChange = (index, value) => {
    const updatedValues = [...editedJob.company_values];
    updatedValues[index] = value;
    
    setEditedJob({
      ...editedJob,
      company_values: updatedValues
    });
  };

  // 企業価値観の追加
  const addValue = () => {
    setEditedJob({
      ...editedJob,
      company_values: [...editedJob.company_values, '']
    });
  };

  // 企業価値観の削除
  const removeValue = (index) => {
    setEditedJob({
      ...editedJob,
      company_values: editedJob.company_values.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-lg text-gray-800">
          {isEditing ? "求人情報を編集" : "求人詳細"}
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
          <Briefcase className="h-5 w-5 text-blue-500 mr-2" />
          <h4 className="font-medium text-gray-700">基本情報</h4>
        </div>
        {isEditing ? (
          <div className="pl-7 space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                職種名
              </label>
              <input
                type="text"
                value={editedJob.job_title}
                onChange={(e) => handleBasicInfoChange('job_title', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                企業名
              </label>
              <input
                type="text"
                value={editedJob.company}
                onChange={(e) => handleBasicInfoChange('company', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
        ) : (
          <div className="pl-7">
            <p className="text-gray-700 font-medium">{job.job_title}</p>
            <p className="text-gray-600">{job.company}</p>
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-center mb-2">
          <Code className="h-5 w-5 text-indigo-500 mr-2" />
          <h4 className="font-medium text-gray-700">必要スキル</h4>
        </div>
        <div className="pl-7 space-y-4">
          {Object.entries(isEditing ? editedJob.required_skills : job.required_skills).map(([category, skills]) => (
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
                  {skills.length > 0 ? (
                    skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mr-1 mb-1"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">指定なし</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center mb-2">
          <Briefcase className="h-5 w-5 text-green-500 mr-2" />
          <h4 className="font-medium text-gray-700">経験要件</h4>
        </div>
        <div className="pl-7 space-y-3">
          {isEditing ? (
            <>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  最低経験年数
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={editedJob.experience_requirements.min_years}
                  onChange={(e) => handleExperienceChange('min_years', e.target.value)}
                  className="w-full p-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  希望業界経験
                </label>
                {editedJob.experience_requirements.preferred_industries.map((industry, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <input
                      type="text"
                      value={industry}
                      onChange={(e) => handleIndustryChange(index, e.target.value)}
                      className="flex-grow p-1 border border-gray-300 rounded-l text-sm"
                    />
                    <button
                      onClick={() => removeIndustry(index)}
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
                  マネジメント経験必須
                </label>
                <select
                  value={editedJob.experience_requirements.requires_management.toString()}
                  onChange={(e) => handleExperienceChange('requires_management', e.target.value)}
                  className="w-full p-1 border border-gray-300 rounded text-sm"
                >
                  <option value="true">必須</option>
                  <option value="false">不要</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  最低プロジェクト規模 (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="1"
                  value={editedJob.experience_requirements.min_project_scale}
                  onChange={(e) => handleExperienceChange('min_project_scale', e.target.value)}
                  className="w-full p-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center mb-2">
                <Award className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-700">
                  最低経験年数: {job.experience_requirements.min_years}年以上
                </span>
              </div>
              <div className="mb-2">
                <div className="flex items-center mb-1">
                  <Building className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-700">希望業界経験:</span>
                </div>
                <div className="pl-6 flex flex-wrap">
                  {job.experience_requirements.preferred_industries.length > 0 ? (
                    job.experience_requirements.preferred_industries.map((industry, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-1 mb-1"
                      >
                        {industry}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">指定なし</span>
                  )}
                </div>
              </div>
              <div className="flex items-center mb-2">
                <Award className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-700">
                  マネジメント経験: {job.experience_requirements.requires_management ? '必須' : '不要'}
                </span>
              </div>
              <div className="flex items-center">
                <Briefcase className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-700">
                  最低プロジェクト規模: {job.experience_requirements.min_project_scale}/10
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center mb-2">
          <Heart className="h-5 w-5 text-red-500 mr-2" />
          <h4 className="font-medium text-gray-700">企業の価値観</h4>
        </div>
        <div className="pl-7">
          {isEditing ? (
            <div className="space-y-2">
              {editedJob.company_values.map((value, index) => (
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
              {job.company_values.map((value, index) => (
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

export default JobRequirementsForm; 