/**
 * 云函数：getSuggestion
 * 功能：获取AI穿搭建议和点评
 */

const cloud = require('wx-server-sdk');

// 初始化云开发环境
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

/**
 * 构建穿搭建议提示词
 * @param {Object} params - 参数
 * @returns {string} 提示词
 */
function buildSuggestionPrompt(params) {
  const {
    occasion,
    season,
    userStyle,
    selectedItems,
    userBodyType,
    userPreference,
    weather
  } = params;

  const occasionMap = {
    'casual': '日常休闲',
    'formal': '正式商务',
    'party': '派对聚会',
    'date': '约会',
    'workout': '运动健身',
    'vacation': '度假旅行',
    'interview': '面试求职',
    'wedding': '婚礼宴会'
  };

  const seasonMap = {
    'spring': '春季',
    'summer': '夏季',
    'autumn': '秋季',
    'winter': '冬季'
  };

  let prompt = `你是一位专业的时尚穿搭顾问。请为以下用户提供穿搭建议和点评：\n\n`;
  prompt += `【场合】${occasionMap[occasion] || occasion}\n`;
  prompt += `【季节】${seasonMap[season] || season}\n`;
  
  if (userBodyType) {
    prompt += `【体型】${userBodyType}\n`;
  }
  
  if (userStyle) {
    prompt += `【用户风格偏好】${userStyle}\n`;
  }
  
  if (weather) {
    prompt += `【天气情况】${weather}\n`;
  }

  if (selectedItems && selectedItems.length > 0) {
    prompt += `\n【已选衣物】\n`;
    selectedItems.forEach((item, index) => {
      prompt += `${index + 1}. ${item.name} - ${item.category} (${item.color})\n`;
    });
  }

  prompt += `\n请提供以下内容（使用JSON格式返回）：\n`;
  prompt += `1. overallRating: 整体搭配评分（1-10分）\n`;
  prompt += `2. comments: 简短点评（50字以内）\n`;
  prompt += `3. suggestions: 改进建议数组\n`;
  prompt += `4. colorAnalysis: 配色分析\n`;
  prompt += `5. styleTips: 风格建议数组\n`;
  prompt += `6. missingItems: 推荐补充的单品数组\n`;
  prompt += `7. alternativeOutfits: 备选搭配方案数组（2-3套）\n`;

  if (userPreference) {
    prompt += `\n【特殊要求】${userPreference}\n`;
  }

  return prompt;
}

/**
 * 解析AI返回的建议
 * @param {string} aiResponse - AI返回的文本
 * @returns {Object} 解析后的建议对象
 */
function parseSuggestion(aiResponse) {
  try {
    // 尝试直接解析JSON
    const parsed = JSON.parse(aiResponse);
    return {
      success: true,
      data: parsed
    };
  } catch (e) {
    // 如果不是纯JSON，尝试提取JSON部分
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          success: true,
          data: parsed
        };
      } catch (e2) {
        // 提取失败，返回原始文本
      }
    }
    
    // 返回结构化文本
    return {
      success: true,
      data: {
        rawResponse: aiResponse,
        overallRating: 7,
        comments: 'AI建议已生成',
        suggestions: [aiResponse.substring(0, 200)]
      }
    };
  }
}

/**
 * 主函数：云函数入口
 */
exports.main = async (event, context) => {
  const {
    occasion = 'casual',
    season = 'spring',
    userStyle = '',
    selectedItems = [],
    userBodyType = '',
    userPreference = '',
    weather = '',
    generateOutfit = false  // 是否生成完整搭配方案
  } = event;

  console.log('=== Get Suggestion Request ===');
  console.log('Params:', { occasion, season, userStyle, selectedItemsCount: selectedItems.length });

  try {
    // 构建提示词
    const prompt = buildSuggestionPrompt({
      occasion,
      season,
      userStyle,
      selectedItems,
      userBodyType,
      userPreference,
      weather
    });

    console.log('Prompt:', prompt);

    // 调用AI服务获取建议
    const aiResponse = await callAIService(prompt);
    
    if (!aiResponse.success) {
      throw new Error(aiResponse.message || 'AI服务调用失败');
    }

    // 解析建议
    const parsedSuggestion = parseSuggestion(aiResponse.content);

    if (!parsedSuggestion.success) {
      throw new Error('建议解析失败');
    }

    const suggestionData = parsedSuggestion.data;

    // 如果需要生成完整搭配方案
    let outfitPlan = null;
    if (generateOutfit) {
      outfitPlan = await generateOutfitPlan({
        occasion,
        season,
        userStyle,
        userBodyType,
        baseItems: selectedItems
      });
    }

    // 保存建议记录
    const db = cloud.database();
    await db.collection('suggestion_records').add({
      data: {
        occasion,
        season,
        selectedItems,
        suggestion: suggestionData,
        outfitPlan,
        createTime: db.serverDate(),
        _openid: cloud.getWXContext().OPENID
      }
    });

    return {
      success: true,
      code: 'SUCCESS',
      message: '穿搭建议获取成功',
      data: {
        suggestion: suggestionData,
        outfitPlan,
        timestamp: Date.now()
      }
    };

  } catch (error) {
    console.error('Get Suggestion Error:', error);
    
    return {
      success: false,
      code: 'SUGGESTION_ERROR',
      message: error.message || '获取穿搭建议失败，请稍后重试',
      data: null
    };
  }
};

/**
 * 调用AI服务
 * @param {string} prompt - 提示词
 * @returns {Promise<Object>} AI响应
 */
async function callAIService(prompt) {
  try {
    // 方案1: 使用微信小程序云开发的AI能力（如果可用）
    // const result = await cloud.callAI({
    //   model: 'gpt-4',
    //   messages: [{ role: 'user', content: prompt }]
    // });

    // 方案2: 调用外部AI API
    const axios = require('axios');
    const response = await axios.post('https://your-ai-service.com/api/chat', {
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: '你是一位专业的时尚穿搭顾问，擅长根据用户的体型、场合、季节等因素提供个性化的穿搭建议。请用中文回答，并尽量提供具体、实用的建议。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.AI_API_KEY || 'your-api-key'}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    return {
      success: true,
      content: response.data.choices[0].message.content
    };

  } catch (error) {
    console.error('AI Service Error:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * 生成完整搭配方案
 * @param {Object} params - 参数
 * @returns {Promise<Object>} 搭配方案
 */
async function generateOutfitPlan(params) {
  const { occasion, season, userStyle, userBodyType, baseItems } = params;

  const prompt = `请为${userBodyType || '普通'}体型用户设计一套${season === 'spring' ? '春季' : season === 'summer' ? '夏季' : season === 'autumn' ? '秋季' : '冬季'}的${occasion === 'casual' ? '休闲' : occasion === 'formal' ? '正式' : '特殊场合'}穿搭方案。

要求：
1. 列出上衣、下装、鞋子、配饰的具体搭配
2. 说明配色方案
3. 给出整体风格定位
4. 提供2-3个穿搭技巧

请用JSON格式返回。`;

  try {
    const aiResponse = await callAIService(prompt);
    const parsed = parseSuggestion(aiResponse.content);
    return parsed.data;
  } catch (error) {
    console.error('Generate Outfit Plan Error:', error);
    return null;
  }
}
