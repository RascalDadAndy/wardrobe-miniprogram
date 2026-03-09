// 数据库集合初始化脚本
// 在微信开发者工具 Console 中运行

const collections = [
  'clothing_items',  // 衣物集合
  'outfits',         // 搭配方案
  'tryon_records',   // 试衣记录
  'suggestions',     // 穿搭建议
  'users'            // 用户集合
];

async function initCollections() {
  const db = wx.cloud.database();
  
  for (const name of collections) {
    try {
      await db.createCollection(name);
      console.log(`✅ 集合 ${name} 创建成功`);
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log(`⚠️ 集合 ${name} 已存在`);
      } else {
        console.error(`❌ 集合 ${name} 创建失败:`, err);
      }
    }
  }
  console.log('\n🎉 数据库初始化完成！');
}

initCollections();
