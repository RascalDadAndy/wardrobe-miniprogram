# 智能穿搭助手 - 数据库设计文档

## 概述

本文档描述了"智能穿搭助手"微信小程序的云开发数据库设计方案，包含5个核心集合的数据结构、索引设计和权限规则。

---

## 集合关系图

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│     users       │────▶│  clothing_items  │◄────│     outfits     │
│   (用户集合)     │     │    (衣物集合)     │     │   (搭配集合)     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │                        │
         │                       ▼                        │
         │              ┌──────────────────┐              │
         └─────────────▶│  tryon_records   │◄─────────────┘
                        │   (试衣记录)      │
                        └──────────────────┘
                                   │
                                   ▼
                        ┌──────────────────┐
                        │   suggestions    │
                        │  (穿搭建议)       │
                        └──────────────────┘
```

---

## 1. users - 用户集合

存储用户基本信息和偏好设置

### 字段定义

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| _openid | string | 是 | - | 微信用户唯一标识 |
| nickName | string | 否 | '' | 用户昵称 |
| avatarUrl | string | 否 | '' | 头像URL |
| gender | number | 否 | 0 | 性别：0-未知，1-男，2-女 |
| birthday | date | 否 | null | 生日 |
| height | number | 否 | null | 身高(cm) |
| weight | number | 否 | null | 体重(kg) |
| bodyType | string | 否 | '' | 体型：slim-偏瘦，normal-标准，athletic-健美，curvy-丰满 |
| stylePreference | array | 否 | [] | 风格偏好：['casual', 'formal', 'sporty', ...] |
| colorPreference | array | 否 | [] | 颜色偏好：['black', 'white', 'blue', ...] |
| skinTone | string | 否 | '' | 肤色：fair-白皙，medium-中等，dark-深色 |
| location | string | 否 | '' | 所在城市 |
| isVIP | boolean | 否 | false | 是否VIP用户 |
| vipExpireAt | date | 否 | null | VIP过期时间 |
| dailyTryonLimit | number | 否 | 5 | 每日试衣次数限制 |
| clothingCount | number | 否 | 0 | 衣物总数统计 |
| outfitCount | number | 否 | 0 | 搭配方案总数统计 |
| createdAt | date | 是 | 当前时间 | 创建时间 |
| updatedAt | date | 是 | 当前时间 | 更新时间 |

### 索引设计

```javascript
// 主键索引（自动创建）
{ _openid: 1 }

// 查询优化索引
{ isVIP: 1, createdAt: -1 }  // VIP用户筛选
{ clothingCount: -1 }         // 活跃用户排序
```

---

## 2. clothing_items - 衣物集合

存储用户上传的衣物信息

### 字段定义

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| _openid | string | 是 | - | 所属用户openid |
| name | string | 是 | - | 衣物名称 |
| description | string | 否 | '' | 衣物描述 |
| category | string | 是 | - | 分类：top-上衣，bottom-下装，dress-连衣裙，outerwear-外套，shoes-鞋子，accessory-配饰 |
| subCategory | string | 否 | '' | 子分类，如：tshirt, shirt, jeans, skirt等 |
| images | array | 是 | [] | 图片URL数组 |
| coverImage | string | 是 | - | 封面图片URL |
| colors | array | 否 | [] | 颜色数组，如：['black', 'white'] |
| mainColor | string | 否 | '' | 主色调 |
| patterns | array | 否 | [] | 图案：solid-纯色，striped-条纹，plaid-格纹，floral-花卉等 |
| materials | array | 否 | [] | 材质：cotton-棉，wool-羊毛，silk-丝绸等 |
| seasons | array | 否 | [] | 适用季节：spring, summer, autumn, winter |
| occasions | array | 否 | [] | 适用场合：casual-休闲，work-工作，party-聚会等 |
| tags | array | 否 | [] | 自定义标签数组 |
| brand | string | 否 | '' | 品牌 |
| price | number | 否 | null | 价格 |
| purchaseDate | date | 否 | null | 购买日期 |
| size | string | 否 | '' | 尺码 |
| isFavorite | boolean | 否 | false | 是否收藏 |
| wearCount | number | 否 | 0 | 穿着次数统计 |
| lastWornAt | date | 否 | null | 最后穿着时间 |
| status | number | 否 | 1 | 状态：1-正常，0-已删除，2-送洗中 |
| aiAnalysis | object | 否 | {} | AI分析结果 |
| aiAnalysis.style | string | 否 | '' | AI识别的风格 |
| aiAnalysis.features | array | 否 | [] | AI识别的特征 |
| aiAnalysis.confidence | number | 否 | 0 | AI识别置信度 |
| createdAt | date | 是 | 当前时间 | 创建时间 |
| updatedAt | date | 是 | 当前时间 | 更新时间 |

### 分类枚举值

```javascript
const CATEGORY = {
  TOP: 'top',           // 上衣
  BOTTOM: 'bottom',     // 下装
  DRESS: 'dress',       // 连衣裙
  OUTERWEAR: 'outerwear', // 外套
  SHOES: 'shoes',       // 鞋子
  ACCESSORY: 'accessory' // 配饰
};

const SUB_CATEGORY = {
  // 上衣
  TSHIRT: 'tshirt',
  SHIRT: 'shirt',
  BLOUSE: 'blouse',
  SWEATER: 'sweater',
  HOODIE: 'hoodie',
  POLO: 'polo',
  TANK: 'tank',
  
  // 下装
  JEANS: 'jeans',
  PANTS: 'pants',
  SHORTS: 'shorts',
  SKIRT: 'skirt',
  
  // 外套
  JACKET: 'jacket',
  COAT: 'coat',
  BLAZER: 'blazer',
  CARDIGAN: 'cardigan',
  
  // 鞋子
  SNEAKERS: 'sneakers',
  BOOTS: 'boots',
  SANDALS: 'sandals',
  HEELS: 'heels',
  FLATS: 'flats',
  
  // 配饰
  BAG: 'bag',
  HAT: 'hat',
  SCARF: 'scarf',
  BELT: 'belt',
  JEWELRY: 'jewelry',
  WATCH: 'watch',
  GLASSES: 'glasses'
};
```

### 索引设计

```javascript
// 主键索引（自动创建）
{ _id: 1 }

// 用户衣物查询
{ _openid: 1, category: 1, createdAt: -1 }

// 分类筛选
{ category: 1, subCategory: 1 }

// 颜色筛选
{ mainColor: 1, _openid: 1 }

// 收藏查询
{ _openid: 1, isFavorite: 1 }

// 标签搜索
{ tags: 1 }

// 全文搜索（云开发支持）
{ name: 'text', description: 'text', tags: 'text' }
```

---

## 3. outfits - 搭配集合

存储用户创建的搭配方案

### 字段定义

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| _openid | string | 是 | - | 所属用户openid |
| name | string | 是 | - | 搭配名称 |
| description | string | 否 | '' | 搭配描述 |
| items | array | 是 | [] | 搭配包含的衣物ID数组 |
| itemsDetail | array | 否 | [] | 衣物详细信息（冗余存储，提高查询效率） |
| coverImage | string | 否 | '' | 搭配封面图（AI生成或用户上传） |
| category | string | 否 | 'casual' | 搭配类型：casual-休闲，formal-正式，sporty-运动等 |
| seasons | array | 否 | [] | 适用季节 |
| occasions | array | 否 | [] | 适用场合 |
| tags | array | 否 | [] | 标签 |
| isFavorite | boolean | 否 | false | 是否收藏 |
| wearCount | number | 否 | 0 | 穿着次数 |
| lastWornAt | date | 否 | null | 最后穿着时间 |
| rating | number | 否 | 0 | 用户评分（1-5） |
| aiScore | number | 否 | null | AI评分 |
| aiComment | string | 否 | '' | AI点评 |
| isShared | boolean | 否 | false | 是否分享到社区 |
| shareCount | number | 否 | 0 | 被收藏次数 |
| likeCount | number | 否 | 0 | 点赞数 |
| status | number | 否 | 1 | 状态：1-正常，0-已删除 |
| createdAt | date | 是 | 当前时间 | 创建时间 |
| updatedAt | date | 是 | 当前时间 | 更新时间 |

### itemsDetail 结构

```javascript
{
  itemId: '衣物ID',
  category: 'top',
  name: '白色T恤',
  image: '图片URL',
  color: 'white'
}
```

### 索引设计

```javascript
// 用户搭配查询
{ _openid: 1, createdAt: -1 }

// 分类筛选
{ category: 1, seasons: 1 }

// 收藏查询
{ _openid: 1, isFavorite: 1 }

// 社区分享
{ isShared: 1, likeCount: -1, createdAt: -1 }

// 标签搜索
{ tags: 1 }
```

---

## 4. tryon_records - 试衣记录集合

存储虚拟试衣的历史记录

### 字段定义

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| _openid | string | 是 | - | 所属用户openid |
| userPhoto | string | 是 | - | 用户照片URL |
| selectedItems | array | 是 | [] | 选择的衣物ID数组 |
| selectedItemsDetail | array | 否 | [] | 衣物详细信息 |
| resultImage | string | 否 | '' | 生成的试衣效果图URL |
| status | string | 是 | 'pending' | 状态：pending-处理中，success-成功，failed-失败 |
| aiModel | string | 否 | 'default' | 使用的AI模型 |
| processingTime | number | 否 | null | 处理耗时（秒） |
| errorMessage | string | 否 | '' | 错误信息 |
| isSaved | boolean | 否 | false | 是否保存到相册 |
| isShared | boolean | 否 | false | 是否分享 |
| rating | number | 否 | null | 用户满意度评分 |
| feedback | string | 否 | '' | 用户反馈 |
| createdAt | date | 是 | 当前时间 | 创建时间 |
| completedAt | date | 否 | null | 完成时间 |

### 索引设计

```javascript
// 用户试衣记录查询
{ _openid: 1, createdAt: -1 }

// 状态筛选（用于后台统计）
{ status: 1, createdAt: -1 }

// 成功记录查询
{ _openid: 1, status: 1, createdAt: -1 }
```

---

## 5. suggestions - 穿搭建议集合

存储系统生成的穿搭建议

### 字段定义

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| _openid | string | 是 | - | 所属用户openid |
| type | string | 是 | - | 建议类型：daily-每日推荐，occasion-场合搭配，seasonal-季节推荐，ai-智能推荐 |
| title | string | 是 | - | 建议标题 |
| content | string | 是 | - | 建议内容 |
| relatedItems | array | 否 | [] | 相关衣物ID数组 |
| relatedOutfit | string | 否 | null | 相关搭配方案ID |
| outfitImage | string | 否 | '' | 搭配效果图 |
| weather | object | 否 | null | 天气信息 |
| weather.temperature | number | 否 | - | 温度 |
| weather.condition | string | 否 | - | 天气状况 |
| weather.location | string | 否 | - | 地点 |
| occasion | string | 否 | '' | 场合 |
| score | number | 否 | null | 推荐评分 |
| reason | string | 否 | '' | 推荐理由 |
| isRead | boolean | 否 | false | 是否已读 |
| isApplied | boolean | 否 | false | 是否被采纳 |
| userFeedback | string | 否 | '' | 用户反馈 |
| createdAt | date | 是 | 当前时间 | 创建时间 |
| expireAt | date | 否 | null | 建议过期时间 |

### 索引设计

```javascript
// 用户建议查询
{ _openid: 1, type: 1, createdAt: -1 }

// 未读建议
{ _openid: 1, isRead: 1, createdAt: -1 }

// 类型筛选
{ type: 1, createdAt: -1 }

// 过期清理
{ expireAt: 1 }
```

---

## 权限规则设计

### 通用规则

```javascript
// 用户只能访问自己的数据
{
  read: "doc._openid == auth.openid",
  write: "doc._openid == auth.openid"
}
```

### 各集合权限配置

#### 1. users 集合

```json
{
  "read": "doc._openid == auth.openid",
  "write": "doc._openid == auth.openid",
  "create": true
}
```

#### 2. clothing_items 集合

```json
{
  "read": "doc._openid == auth.openid",
  "write": "doc._openid == auth.openid",
  "create": true,
  "delete": "doc._openid == auth.openid"
}
```

#### 3. outfits 集合

```json
{
  "read": "doc._openid == auth.openid || doc.isShared == true",
  "write": "doc._openid == auth.openid",
  "create": true,
  "delete": "doc._openid == auth.openid"
}
```

#### 4. tryon_records 集合

```json
{
  "read": "doc._openid == auth.openid",
  "write": "doc._openid == auth.openid",
  "create": true,
  "delete": "doc._openid == auth.openid"
}
```

#### 5. suggestions 集合

```json
{
  "read": "doc._openid == auth.openid",
  "write": "doc._openid == auth.openid",
  "create": false,  // 仅服务端创建
  "delete": "doc._openid == auth.openid"
}
```

---

## 数据安全考虑

### 1. 敏感信息保护
- 用户openid仅用于权限验证，不对外暴露
- 用户照片和衣物图片使用云存储私有URL
- VIP信息仅用户本人可见

### 2. 数据验证
- 所有写入操作在服务端进行数据校验
- 图片上传限制格式和大小
- 防止SQL注入（使用云开发SDK）

### 3. 访问控制
- 用户只能访问自己的衣物和搭配
- 分享的搭配仅展示公开字段
- 试衣记录严格私有

### 4. 数据备份
- 定期备份用户数据
- 重要操作记录日志
- 支持数据导出

---

## 性能优化建议

### 1. 分页查询
```javascript
// 推荐分页参数
const PAGE_SIZE = 20;

// 查询示例
db.collection('clothing_items')
  .where({ _openid: openid })
  .orderBy('createdAt', 'desc')
  .skip((page - 1) * PAGE_SIZE)
  .limit(PAGE_SIZE)
  .get();
```

### 2. 数据冗余
- outfits.itemsDetail 冗余存储衣物基本信息，减少关联查询
- users 中统计 clothingCount 和 outfitCount，避免实时计算

### 3. 缓存策略
- 用户基本信息本地缓存
- 衣物列表分页缓存
- 搭配方案封面图CDN加速

### 4. 定期清理
- 清理过期的suggestions
- 归档长时间未访问的tryon_records
- 删除已标记删除的数据

---

## 扩展设计

### 未来可能增加的集合

#### 1. community_outfits - 社区分享
存储用户分享到社区的搭配

#### 2. comments - 评论集合
社区搭配的评论

#### 3. notifications - 通知集合
用户通知消息

#### 4. style_templates - 风格模板
系统预设的风格模板

---

## 版本历史

| 版本 | 日期 | 修改内容 |
|------|------|----------|
| v1.0 | 2024-01 | 初始版本，包含5个核心集合 |
