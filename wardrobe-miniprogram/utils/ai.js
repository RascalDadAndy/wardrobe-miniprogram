/**
 * AI工具函数封装
 * 提供统一的AI API调用接口、错误处理和结果格式化
 */

/**
 * 调用云函数 - 虚拟试衣
 * @param {Object} params - 参数
 * @param {string} params.userPhotoUrl - 用户照片URL
 * @param {string} params.clothingImageUrl - 衣物图片URL
 * @param {string} params.clothingType - 衣物类型
 * @param {string} params.clothingStyle - 衣物风格
 * @param {string} params.occasion - 场合
 * @param {string} params.userGender - 用户性别
 * @param {string} params.customDescription - 自定义描述
 * @returns {Promise<Object>} 试衣结果
 */
async function generateTryon(params) {
  const {
    userPhotoUrl,
    clothingImageUrl,
    clothingType = 'clothing',
    clothingStyle = '',
    occasion = 'casual',
    userGender = 'person',
    customDescription = ''
  } = params;

  // 参数校验
  if (!userPhotoUrl) {
    return {
      success: false,
      code: 'PARAM_ERROR',
      message: '请选择用户照片'
    };
  }

  if (!clothingImageUrl) {
    return {
      success: false,
      code: 'PARAM_ERROR',
      message: '请选择要试穿的衣物'
    };
  }

  try {
    const result = await wx.cloud.callFunction({
      name: 'generateTryon',
      data: {
        userPhotoUrl,
        clothingImageUrl,
        clothingType,
        clothingStyle,
        occasion,
        userGender,
        customDescription
      }
    });

    return result.result;
  } catch (error) {
    console.error('Generate Tryon Error:', error);
    return {
      success: false,
      code: 'CLOUD_FUNCTION_ERROR',
      message: error.message || '虚拟试衣调用失败'
    };
  }
}

/**
 * 调用云函数 - 获取穿搭建议
 * @param {Object} params - 参数
 * @param {string} params.occasion - 场合
 * @param {string} params.season - 季节
 * @param {string} params.userStyle - 用户风格偏好
 * @param {Array} params.selectedItems - 已选衣物列表
 * @param {string} params.userBodyType - 用户体型
 * @param {string} params.userPreference - 用户特殊要求
 * @param {string} params.weather - 天气情况
 * @param {boolean} params.generateOutfit - 是否生成完整搭配方案
 * @returns {Promise<Object>} 建议结果
 */
async function getSuggestion(params) {
  const {
    occasion = 'casual',
    season = 'spring',
    userStyle = '',
    selectedItems = [],
    userBodyType = '',
    userPreference = '',
    weather = '',
    generateOutfit = false
  } = params;

  try {
    const result = await wx.cloud.callFunction({
      name: 'getSuggestion',
      data: {
        occasion,
        season,
        userStyle,
        selectedItems,
        userBodyType,
        userPreference,
        weather,
        generateOutfit
      }
    });

    return result.result;
  } catch (error) {
    console.error('Get Suggestion Error:', error);
    return {
      success: false,
      code: 'CLOUD_FUNCTION_ERROR',
      message: error.message || '获取穿搭建议失败'
    };
  }
}

/**
 * 批量获取穿搭建议（用于多组搭配比较）
 * @param {Array} outfitGroups - 多组搭配
 * @param {Object} commonParams - 公共参数
 * @returns {Promise<Array>} 各组建议
 */
async function batchGetSuggestions(outfitGroups, commonParams) {
  const promises = outfitGroups.map(group => {
    return getSuggestion({
      ...commonParams,
      selectedItems: group.items,
      userPreference: group.preference || ''
    });
  });

  try {
    const results = await Promise.all(promises);
    return results.map((result, index) => ({
      groupId: outfitGroups[index].id,
      groupName: outfitGroups[index].name,
      ...result
    }));
  } catch (error) {
    console.error('Batch Get Suggestions Error:', error);
    return outfitGroups.map((group, index) => ({
      groupId: group.id,
      groupName: group.name,
      success: false,
      code: 'BATCH_ERROR',
      message: '批量获取建议失败'
    }));
  }
}

/**
 * 分析单品搭配可能性
 * @param {Object} item - 单品信息
 * @param {Array} wardrobe - 衣柜中的其他单品
 * @returns {Promise<Object>} 搭配分析结果
 */
async function analyzeItemCompatibility(item, wardrobe) {
  const prompt = `分析以下单品的搭配可能性：

单品：${item.name} (${item.category}, ${item.color}, ${item.style})

衣柜中的其他单品：
${wardrobe.map(w => `- ${w.name} (${w.category}, ${w.color})`).join('\n')}

请分析：
1. 该单品可以与哪些单品搭配
2. 适合什么场合
3. 配色建议
4. 搭配评分（1-10分）`;

  try {
    const result = await wx.cloud.callFunction({
      name: 'getSuggestion',
      data: {
        occasion: 'analysis',
        selectedItems: [item, ...wardrobe.slice(0, 5)],
        userPreference: prompt
      }
    });

    return result.result;
  } catch (error) {
    console.error('Analyze Compatibility Error:', error);
    return {
      success: false,
      code: 'ANALYSIS_ERROR',
      message: error.message || '搭配分析失败'
    };
  }
}

/**
 * 生成穿搭报告
 * @param {Array} tryonHistory - 试衣历史
 * @param {Array} suggestionHistory - 建议历史
 * @returns {Promise<Object>} 穿搭报告
 */
async function generateWardrobeReport(tryonHistory, suggestionHistory) {
  // 统计用户的穿搭偏好
  const occasionStats = {};
  const colorStats = {};
  const styleStats = {};

  tryonHistory.forEach(record => {
    // 统计场合
    if (record.occasion) {
      occasionStats[record.occasion] = (occasionStats[record.occasion] || 0) + 1;
    }
  });

  suggestionHistory.forEach(record => {
    // 统计季节偏好
    if (record.season) {
      // 处理季节统计
    }
  });

  const favoriteOccasion = Object.entries(occasionStats)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'casual';

  return {
    success: true,
    data: {
      totalTryons: tryonHistory.length,
      totalSuggestions: suggestionHistory.length,
      favoriteOccasion,
      occasionStats,
      colorStats,
      styleStats,
      reportDate: new Date().toISOString()
    }
  };
}

/**
 * 错误处理工具
 * @param {Error} error - 错误对象
 * @param {string} context - 错误上下文
 * @returns {Object} 格式化错误
 */
function handleAIError(error, context = '') {
  console.error(`AI Error [${context}]:`, error);

  const errorMap = {
    'PARAM_ERROR': {
      title: '参数错误',
      message: '请检查输入参数是否正确',
      action: '请重新选择照片或衣物后重试'
    },
    'GENERATE_ERROR': {
      title: '生成失败',
      message: '图像生成过程中出现错误',
      action: '请稍后重试或选择其他衣物'
    },
    'SUGGESTION_ERROR': {
      title: '建议获取失败',
      message: '无法获取穿搭建议',
      action: '请检查网络连接后重试'
    },
    'CLOUD_FUNCTION_ERROR': {
      title: '服务调用失败',
      message: '云函数调用出现异常',
      action: '请检查网络后重试'
    },
    'TIMEOUT_ERROR': {
      title: '请求超时',
      message: 'AI服务响应超时',
      action: '请稍后重试'
    }
  };

  const errorCode = error.message?.includes('timeout') ? 'TIMEOUT_ERROR' : 
                    error.code || 'UNKNOWN_ERROR';

  const errorInfo = errorMap[errorCode] || {
    title: '未知错误',
    message: error.message || '发生未知错误',
    action: '请稍后重试或联系客服'
  };

  return {
    success: false,
    code: errorCode,
    ...errorInfo
  };
}

/**
 * 格式化穿搭建议显示
 * @param {Object} suggestion - 建议数据
 * @returns {Object} 格式化后的建议
 */
function formatSuggestion(suggestion) {
  if (!suggestion) return null;

  const {
    overallRating = 0,
    comments = '',
    suggestions = [],
    colorAnalysis = '',
    styleTips = [],
    missingItems = [],
    alternativeOutfits = []
  } = suggestion;

  // 评分等级
  let ratingLevel = '一般';
  if (overallRating >= 9) ratingLevel = '完美';
  else if (overallRating >= 7) ratingLevel = '优秀';
  else if (overallRating >= 5) ratingLevel = '良好';
  else ratingLevel = '待改进';

  return {
    rating: {
      score: overallRating,
      level: ratingLevel,
      stars: Math.round(overallRating / 2) // 转换为5星制
    },
    comments,
    suggestions: Array.isArray(suggestions) ? suggestions : [suggestions],
    colorAnalysis,
    styleTips: Array.isArray(styleTips) ? styleTips : [styleTips],
    missingItems: Array.isArray(missingItems) ? missingItems : [],
    alternativeOutfits: Array.isArray(alternativeOutfits) ? alternativeOutfits : []
  };
}

/**
 * 显示加载状态
 * @param {string} title - 加载提示文字
 * @param {boolean} mask - 是否显示遮罩
 */
function showLoading(title = '加载中...', mask = true) {
  wx.showLoading({
    title,
    mask
  });
}

/**
 * 隐藏加载状态
 */
function hideLoading() {
  wx.hideLoading();
}

/**
 * 显示结果提示
 * @param {Object} result - 结果对象
 */
function showResultToast(result) {
  if (result.success) {
    wx.showToast({
      title: '操作成功',
      icon: 'success',
      duration: 2000
    });
  } else {
    wx.showModal({
      title: result.title || '提示',
      content: result.message || '操作失败',
      showCancel: false
    });
  }
}

// 导出模块
module.exports = {
  // 核心功能
  generateTryon,
  getSuggestion,
  batchGetSuggestions,
  analyzeItemCompatibility,
  generateWardrobeReport,
  
  // 工具函数
  handleAIError,
  formatSuggestion,
  showLoading,
  hideLoading,
  showResultToast
};
