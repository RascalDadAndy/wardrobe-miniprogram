# 智能穿搭助手 - 微信小程序

一个基于微信原生开发的智能穿搭小程序，帮助用户管理衣柜、虚拟试衣、获取穿搭建议。

## 功能特性

- 📸 **衣柜管理**：上传、分类、管理个人衣物
- 🤖 **虚拟试衣**：AI生成穿搭效果图
- 💡 **穿搭建议**：基于天气和衣柜的智能推荐
- 🌤️ **天气联动**：根据天气推荐合适穿搭
- 📊 **数据统计**：穿搭记录和统计分析

## 技术栈

- 微信原生小程序开发
- 微信云开发（云函数 + 云数据库 + 云存储）
- CSS3 动画和过渡效果

## 项目结构

```
wardrobe-miniprogram/
├── app.js                  # 小程序入口
├── app.json                # 全局配置
├── app.wxss                # 全局样式
├── project.config.json     # 项目配置
├── sitemap.json            # 站点地图
├── cloudfunctions/         # 云函数目录
│   ├── login/              # 登录云函数
│   ├── uploadImage/        # 图片上传云函数
│   └── generateOutfit/     # 生成穿搭云函数
├── pages/                  # 页面目录
│   ├── index/              # 首页
│   ├── wardrobe/           # 衣柜页面
│   ├── upload/             # 上传页面
│   ├── tryon/              # 虚拟试衣页面
│   ├── suggestion/         # 穿搭建议页面
│   └── profile/            # 个人中心
├── components/             # 组件目录
│   ├── clothing-card/      # 衣物卡片组件
│   ├── category-filter/    # 分类筛选组件
│   └── loading/            # 加载组件
├── utils/                  # 工具函数
│   └── util.js
└── images/                 # 图片资源（需要自行添加）
```

## 配色方案

| 颜色 | 色值 | 用途 |
|------|------|------|
| 主色 | #D4A574 | 按钮、导航栏、强调 |
| 深主色 | #B8935F | 渐变、悬停状态 |
| 浅主色 | #E8D4C0 | 背景、标签 |
| 强调色 | #E07B39 | 悬浮按钮、特殊强调 |
| 背景色 | #F5F0EB | 页面背景 |

## 数据库集合

需要在云数据库中创建以下集合：

- `clothes` - 衣物数据
- `users` - 用户数据
- `outfitHistory` - 穿搭历史
- `favorites` - 收藏数据
- `tryonHistory` - 试衣记录

## 云开发配置

1. 在微信开发者工具中开通云开发
2. 创建云开发环境
3. 将 `app.js` 中的 `cloudEnv` 替换为实际环境ID
4. 部署云函数

## 开发说明

### 安装依赖

```bash
# 进入云函数目录安装依赖
cd cloudfunctions/login
npm install

cd ../uploadImage
npm install

cd ../generateOutfit
npm install
```

### 部署云函数

在微信开发者工具中：
1. 右键云函数文件夹
2. 选择"创建并部署：云端安装依赖"

### 图片资源

需要添加以下图片资源到 `images/` 目录：

```
images/
├── tabbar/                 # TabBar图标
│   ├── home.png
│   ├── home-active.png
│   ├── wardrobe.png
│   ├── wardrobe-active.png
│   ├── upload.png
│   ├── upload-active.png
│   ├── tryon.png
│   ├── tryon-active.png
│   ├── profile.png
│   └── profile-active.png
├── icons/                  # 功能图标
│   ├── camera-large.png
│   ├── search.png
│   ├── clear.png
│   ├── retake.png
│   ├── check.png
│   ├── check-white.png
│   ├── close.png
│   ├── delete.png
│   ├── add.png
│   ├── save.png
│   ├── share.png
│   ├── refresh.png
│   ├── arrow-right.png
│   ├── arrow-down.png
│   ├── edit.png
│   ├── heart.png
│   ├── location.png
│   ├── ai.png
│   ├── list-view.png
│   ├── grid-view.png
│   ├── user.png
│   ├── vip.png
│   ├── customer-service.png
│   └── settings.png
├── banner/                 # 轮播图
│   ├── banner1.jpg
│   ├── banner2.jpg
│   └── banner3.jpg
├── default-avatar.png      # 默认头像
├── default-cloth.png       # 默认衣物图
├── empty-clothes.png       # 空状态图
├── empty-wardrobe.png      # 空衣柜图
└── share.png               # 分享图
```

## 页面路由

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | /pages/index/index | 入口页面，展示推荐和快捷入口 |
| 衣柜 | /pages/wardrobe/wardrobe | 管理个人衣物 |
| 上传 | /pages/upload/upload | 上传新衣物 |
| 试衣 | /pages/tryon/tryon | 虚拟试衣功能 |
| 建议 | /pages/suggestion/suggestion | 穿搭建议 |
| 我的 | /pages/profile/profile | 个人中心 |

## 注意事项

1. 首次使用需要在 `app.js` 中配置正确的云开发环境ID
2. 需要在微信开发者工具中开通云开发服务
3. 图片资源需要自行准备或使用占位图
4. AI生图功能需要接入实际的生图API服务

## License

MIT
