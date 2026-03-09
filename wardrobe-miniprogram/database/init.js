/**
 * 智能穿搭助手 - 数据库初始化云函数
 * 
 * 使用方法：
 * 1. 在微信开发者工具中创建云函数 initDatabase
 * 2. 将此代码复制到 index.js
 * 3. 部署并调用该云函数
 */

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

// 集合配置
const COLLECTIONS = {
  USERS: 'users',
  CLOTHING_ITEMS: 'clothing_items',
  OUTFITS: 'outfits',
  TRYON_RECORDS: 'tryon_records',
  SUGGESTIONS: 'suggestions'
};

// 权限配置
const PERMISSIONS = {
  [COLLECTIONS.USERS]: {
    read: true,
    write: true
  },
  [COLLECTIONS.CLOTHING_ITEMS]: {
    read: true,
    write: true
  },
  [COLLECTIONS.OUTFITS]: {
    read: true,
    write: true
  },
  [COLLECTIONS.TRYON_RECORDS]: {
    read: true,
    write: true
  },
  [COLLECTIONS.SUGGESTIONS]: {
    read: true,
    write: true
  }
};

/**
 * 主函数
 */
exports.main = async (event, context) => {
  const { action = 'initAll' } = event;
  
  console.log('数据库初始化开始，操作类型：', action);
  
  try {
    switch (action) {
      case 'initAll':
        return await initAll();
      case 'createCollections':
        return await createCollections();
      case 'setPermissions':
        return await setPermissions();
      case 'createIndexes':
        return await createIndexes();
      case 'seedData':
        return await seedData();
      case 'clearAll':
        return await clearAll();
      default:
        return {
          success: false,
          message: '未知操作类型'
        };
    }
  } catch (error) {
    console.error('初始化失败：', error);
    return {
      success: false,
      message: error.message,
      error: error
    };
  }
};

/**
 * 初始化所有
 */
async function initAll() {
  const results = {
    collections: null,
    permissions: null,
    indexes: null,
    seedData: null
  };
  
  // 1. 创建集合
  results.collections = await createCollections();
  
  // 2. 设置权限
  results.permissions = await setPermissions();
  
  // 3. 创建索引
  results.indexes = await createIndexes();
  
  // 4. 创建示例数据（可选）
  // results.seedData = await seedData();
  
  return {
    success: true,
    message: '数据库初始化完成',
    results
  };
}

/**
 * 创建集合
 */
async function createCollections() {
  const results = [];
  
  for (const [key, name] of Object.entries(COLLECTIONS)) {
    try {
      await db.createCollection(name);
      results.push({
        collection: name,
        success: true,
        message: '创建成功'
      });
      console.log(`集合 ${name} 创建成功`);
    } catch (error) {
      // 集合已存在
      if (error.message && error.message.includes('already exists')) {
        results.push({
          collection: name,
          success: true,
          message: '集合已存在'
        });
        console.log(`集合 ${name} 已存在`);
      } else {
        results.push({
          collection: name,
          success: false,
          message: error.message
        });
        console.error(`集合 ${name} 创建失败：`, error);
      }
    }
  }
  
  return {
    success: true,
    message: '集合创建完成',
    results
  };
}

/**
 * 设置权限
 * 注意：云开发权限需要通过控制台或 API 设置
 */
async function setPermissions() {
  // 云开发数据库权限说明：
  // 1. 所有用户可读，仅创建者可写
  // 2. 仅创建者可读写
  // 3. 所有用户可读，所有用户可写（不推荐）
  // 4. 自定义安全规则
  
  // 由于云函数无法直接修改权限，这里返回配置说明
  // 需要开发者手动在控制台配置
  
  const permissionConfig = {
    [COLLECTIONS.USERS]: {
      read: '仅创建者可读',
      write: '仅创建者可写',
      note: '用户隐私数据，严格保护'
    },
    [COLLECTIONS.CLOTHING_ITEMS]: {
      read: '仅创建者可读',
      write: '仅创建者可写',
      note: '用户私有衣物数据'
    },
    [COLLECTIONS.OUTFITS]: {
      read: '所有用户可读（分享时）',
      write: '仅创建者可写',
      note: '搭配方案，支持分享'
    },
    [COLLECTIONS.TRYON_RECORDS]: {
      read: '仅创建者可读',
      write: '仅创建者可写',
      note: '试衣记录，严格私有'
    },
    [COLLECTIONS.SUGGESTIONS]: {
      read: '仅创建者可读',
      write: '仅服务端可写',
      note: '系统生成的建议'
    }
  };
  
  return {
    success: true,
    message: '权限配置说明（请手动在控制台配置）',
    config: permissionConfig,
    consoleUrl: 'https://console.cloud.tencent.com/tcb/db/index'
  };
}

/**
 * 创建索引
 */
async function createIndexes() {
  const results = [];
  
  // 索引配置
  const indexes = [
    // users 集合索引
    {
      collection: COLLECTIONS.USERS,
      name: 'idx_openid',
      keys: { _openid: 1 },
      unique: true
    },
    {
      collection: COLLECTIONS.USERS,
      name: 'idx_vip_created',
      keys: { isVIP: 1, createdAt: -1 }
    },
    
    // clothing_items 集合索引
    {
      collection: COLLECTIONS.CLOTHING_ITEMS,
      name: 'idx_user_category',
      keys: { _openid: 1, category: 1, createdAt: -1 }
    },
    {
      collection: COLLECTIONS.CLOTHING_ITEMS,
      name: 'idx_category_sub',
      keys: { category: 1, subCategory: 1 }
    },
    {
      collection: COLLECTIONS.CLOTHING_ITEMS,
      name: 'idx_color',
      keys: { mainColor: 1, _openid: 1 }
    },
    {
      collection: COLLECTIONS.CLOTHING_ITEMS,
      name: 'idx_favorite',
      keys: { _openid: 1, isFavorite: 1 }
    },
    {
      collection: COLLECTIONS.CLOTHING_ITEMS,
      name: 'idx_tags',
      keys: { tags: 1 }
    },
    
    // outfits 集合索引
    {
      collection: COLLECTIONS.OUTFITS,
      name: 'idx_user_created',
      keys: { _openid: 1, createdAt: -1 }
    },
    {
      collection: COLLECTIONS.OUTFITS,
      name: 'idx_category_seasons',
      keys: { category: 1, seasons: 1 }
    },
    {
      collection: COLLECTIONS.OUTFITS,
      name: 'idx_shared',
      keys: { isShared: 1, likeCount: -1, createdAt: -1 }
    },
    {
      collection: COLLECTIONS.OUTFITS,
      name: 'idx_outfit_tags',
      keys: { tags: 1 }
    },
    
    // tryon_records 集合索引
    {
      collection: COLLECTIONS.TRYON_RECORDS,
      name: 'idx_user_tryon',
      keys: { _openid: 1, createdAt: -1 }
    },
    {
      collection: COLLECTIONS.TRYON_RECORDS,
      name: 'idx_status',
      keys: { status: 1, createdAt: -1 }
    },
    
    // suggestions 集合索引
    {
      collection: COLLECTIONS.SUGGESTIONS,
      name: 'idx_user_type',
      keys: { _openid: 1, type: 1, createdAt: -1 }
    },
    {
      collection: COLLECTIONS.SUGGESTIONS,
      name: 'idx_unread',
      keys: { _openid: 1, isRead: 1, createdAt: -1 }
    },
    {
      collection: COLLECTIONS.SUGGESTIONS,
      name: 'idx_expire',
      keys: { expireAt: 1 }
    }
  ];
  
  for (const index of indexes) {
    try {
      await db.collection(index.collection).createIndex({
        name: index.name,
        keys: index.keys,
        unique: index.unique || false
      });
      results.push({
        collection: index.collection,
        name: index.name,
        success: true,
        message: '创建成功'
      });
      console.log(`索引 ${index.collection}.${index.name} 创建成功`);
    } catch (error) {
      // 索引已存在
      if (error.message && error.message.includes('already exists')) {
        results.push({
          collection: index.collection,
          name: index.name,
          success: true,
          message: '索引已存在'
        });
      } else {
        results.push({
          collection: index.collection,
          name: index.name,
          success: false,
          message: error.message
        });
        console.error(`索引 ${index.collection}.${index.name} 创建失败：`, error);
      }
    }
  }
  
  return {
    success: true,
    message: '索引创建完成',
    results
  };
}

/**
 * 创建示例数据
 */
async function seedData() {
  const results = [];
  
  // 示例用户数据
  const sampleUser = {
    _openid: 'sample_openid_' + Date.now(),
    nickName: '穿搭达人',
    avatarUrl: 'https://example.com/avatar.jpg',
    gender: 2,
    height: 165,
    weight: 52,
    bodyType: 'normal',
    stylePreference: ['casual', 'elegant'],
    colorPreference: ['black', 'white', 'blue'],
    skinTone: 'medium',
    location: '上海',
    isVIP: false,
    dailyTryonLimit: 5,
    clothingCount: 0,
    outfitCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  try {
    const userRes = await db.collection(COLLECTIONS.USERS).add({
      data: sampleUser
    });
    results.push({
      collection: COLLECTIONS.USERS,
      id: userRes._id,
      success: true,
      message: '示例用户创建成功'
    });
    
    // 示例衣物数据
    const sampleClothingItems = [
      {
        _openid: sampleUser._openid,
        name: '白色基础T恤',
        description: '纯棉基础款白色T恤',
        category: 'top',
        subCategory: 'tshirt',
        images: ['https://example.com/tshirt1.jpg'],
        coverImage: 'https://example.com/tshirt1.jpg',
        colors: ['white'],
        mainColor: 'white',
        patterns: ['solid'],
        materials: ['cotton'],
        seasons: ['spring', 'summer'],
        occasions: ['casual'],
        tags: ['基础款', '百搭'],
        brand: 'Uniqlo',
        price: 99,
        size: 'M',
        isFavorite: true,
        wearCount: 5,
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _openid: sampleUser._openid,
        name: '蓝色牛仔裤',
        description: '经典直筒牛仔裤',
        category: 'bottom',
        subCategory: 'jeans',
        images: ['https://example.com/jeans1.jpg'],
        coverImage: 'https://example.com/jeans1.jpg',
        colors: ['blue'],
        mainColor: 'blue',
        patterns: ['solid'],
        materials: ['denim'],
        seasons: ['spring', 'autumn', 'winter'],
        occasions: ['casual'],
        tags: ['经典', '百搭'],
        brand: 'Levi\'s',
        price: 599,
        size: '28',
        isFavorite: false,
        wearCount: 3,
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _openid: sampleUser._openid,
        name: '黑色小西装',
        description: '修身款黑色西装外套',
        category: 'outerwear',
        subCategory: 'blazer',
        images: ['https://example.com/blazer1.jpg'],
        coverImage: 'https://example.com/blazer1.jpg',
        colors: ['black'],
        mainColor: 'black',
        patterns: ['solid'],
        materials: ['polyester'],
        seasons: ['spring', 'autumn', 'winter'],
        occasions: ['work', 'formal'],
        tags: ['职场', '正式'],
        brand: 'ZARA',
        price: 499,
        size: 'S',
        isFavorite: true,
        wearCount: 2,
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const clothingIds = [];
    for (const item of sampleClothingItems) {
      const res = await db.collection(COLLECTIONS.CLOTHING_ITEMS).add({
        data: item
      });
      clothingIds.push(res._id);
      results.push({
        collection: COLLECTIONS.CLOTHING_ITEMS,
        id: res._id,
        success: true,
        message: `衣物 ${item.name} 创建成功`
      });
    }
    
    // 示例搭配数据
    const sampleOutfit = {
      _openid: sampleUser._openid,
      name: '休闲日常搭配',
      description: '适合周末出游的休闲搭配',
      items: clothingIds.slice(0, 2),
      itemsDetail: sampleClothingItems.slice(0, 2).map((item, index) => ({
        itemId: clothingIds[index],
        category: item.category,
        name: item.name,
        image: item.coverImage,
        color: item.mainColor
      })),
      category: 'casual',
      seasons: ['spring', 'summer'],
      occasions: ['casual'],
      tags: ['休闲', '日常'],
      isFavorite: true,
      wearCount: 1,
      rating: 5,
      aiScore: 85,
      aiComment: '搭配协调，颜色搭配得当',
      isShared: false,
      status: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const outfitRes = await db.collection(COLLECTIONS.OUTFITS).add({
      data: sampleOutfit
    });
    results.push({
      collection: COLLECTIONS.OUTFITS,
      id: outfitRes._id,
      success: true,
      message: '示例搭配创建成功'
    });
    
    // 示例试衣记录
    const sampleTryon = {
      _openid: sampleUser._openid,
      userPhoto: 'https://example.com/user_photo.jpg',
      selectedItems: clothingIds.slice(0, 2),
      selectedItemsDetail: sampleClothingItems.slice(0, 2).map((item, index) => ({
        itemId: clothingIds[index],
        name: item.name,
        image: item.coverImage
      })),
      resultImage: 'https://example.com/tryon_result.jpg',
      status: 'success',
      aiModel: 'default',
      processingTime: 3.5,
      isSaved: true,
      isShared: false,
      rating: 4,
      createdAt: new Date(),
      completedAt: new Date()
    };
    
    const tryonRes = await db.collection(COLLECTIONS.TRYON_RECORDS).add({
      data: sampleTryon
    });
    results.push({
      collection: COLLECTIONS.TRYON_RECORDS,
      id: tryonRes._id,
      success: true,
      message: '示例试衣记录创建成功'
    });
    
    // 示例穿搭建议
    const sampleSuggestion = {
      _openid: sampleUser._openid,
      type: 'daily',
      title: '今日穿搭推荐',
      content: '今天天气晴朗，建议穿着白色T恤搭配蓝色牛仔裤，清新自然。',
      relatedItems: clothingIds.slice(0, 2),
      relatedOutfit: outfitRes._id,
      weather: {
        temperature: 25,
        condition: 'sunny',
        location: '上海'
      },
      occasion: 'casual',
      score: 90,
      reason: '根据天气和您的风格偏好推荐',
      isRead: false,
      isApplied: false,
      createdAt: new Date(),
      expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时后过期
    };
    
    const suggestionRes = await db.collection(COLLECTIONS.SUGGESTIONS).add({
      data: sampleSuggestion
    });
    results.push({
      collection: COLLECTIONS.SUGGESTIONS,
      id: suggestionRes._id,
      success: true,
      message: '示例穿搭建议创建成功'
    });
    
  } catch (error) {
    results.push({
      success: false,
      message: error.message
    });
  }
  
  return {
    success: true,
    message: '示例数据创建完成',
    results
  };
}

/**
 * 清空所有数据（谨慎使用）
 */
async function clearAll() {
  const results = [];
  
  for (const [key, name] of Object.entries(COLLECTIONS)) {
    try {
      // 删除集合中的所有文档
      const batchSize = 100;
      let deleted = 0;
      
      while (true) {
        const docs = await db.collection(name).limit(batchSize).get();
        if (docs.data.length === 0) break;
        
        for (const doc of docs.data) {
          await db.collection(name).doc(doc._id).remove();
          deleted++;
        }
      }
      
      results.push({
        collection: name,
        success: true,
        deleted: deleted,
        message: `已删除 ${deleted} 条记录`
      });
    } catch (error) {
      results.push({
        collection: name,
        success: false,
        message: error.message
      });
    }
  }
  
  return {
    success: true,
    message: '数据清空完成',
    results
  };
}

// ==================== 数据库操作工具函数 ====================

/**
 * 获取用户统计信息
 */
async function getUserStats(openid) {
  const clothingCount = await db.collection(COLLECTIONS.CLOTHING_ITEMS)
    .where({ _openid: openid })
    .count();
    
  const outfitCount = await db.collection(COLLECTIONS.OUTFITS)
    .where({ _openid: openid })
    .count();
    
  const tryonCount = await db.collection(COLLECTIONS.TRYON_RECORDS)
    .where({ _openid: openid })
    .count();
  
  return {
    clothingCount: clothingCount.total,
    outfitCount: outfitCount.total,
    tryonCount: tryonCount.total
  };
}

/**
 * 更新用户统计
 */
async function updateUserStats(openid) {
  const stats = await getUserStats(openid);
  
  await db.collection(COLLECTIONS.USERS)
    .where({ _openid: openid })
    .update({
      data: {
        clothingCount: stats.clothingCount,
        outfitCount: stats.outfitCount,
        updatedAt: new Date()
      }
    });
    
  return stats;
}

/**
 * 获取今日试衣次数
 */
async function getTodayTryonCount(openid) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const count = await db.collection(COLLECTIONS.TRYON_RECORDS)
    .where({
      _openid: openid,
      createdAt: _.gte(today)
    })
    .count();
    
  return count.total;
}

/**
 * 检查试衣限制
 */
async function checkTryonLimit(openid) {
  const user = await db.collection(COLLECTIONS.USERS)
    .where({ _openid: openid })
    .get();
    
  if (user.data.length === 0) {
    return { allowed: false, reason: '用户不存在' };
  }
  
  const userInfo = user.data[0];
  const todayCount = await getTodayTryonCount(openid);
  const limit = userInfo.isVIP ? 999 : userInfo.dailyTryonLimit;
  
  return {
    allowed: todayCount < limit,
    todayCount,
    limit,
    remaining: limit - todayCount
  };
}

// 导出工具函数供其他云函数使用
module.exports = {
  COLLECTIONS,
  getUserStats,
  updateUserStats,
  getTodayTryonCount,
  checkTryonLimit
};
