// pages/index/index.js - 首页
const app = getApp();

Page({
  data: {
    userInfo: null,
    isLogin: false,
    bannerList: [
      { id: 1, image: '/images/banner/banner1.jpg', title: '智能穿搭，从这里开始' },
      { id: 2, image: '/images/banner/banner2.jpg', title: 'AI试衣，预览你的时尚' },
      { id: 3, image: '/images/banner/banner3.jpg', title: '专业穿搭建议' }
    ],
    quickActions: [
      { id: 1, icon: '/images/icons/wardrobe.png', name: '我的衣柜', path: '/pages/wardrobe/wardrobe' },
      { id: 2, icon: '/images/icons/upload.png', name: '上传衣物', path: '/pages/upload/upload' },
      { id: 3, icon: '/images/icons/tryon.png', name: '虚拟试衣', path: '/pages/tryon/tryon' },
      { id: 4, icon: '/images/icons/suggestion.png', name: '穿搭建议', path: '/pages/suggestion/suggestion' }
    ],
    recentClothes: [],
    todaySuggestion: null,
    isLoading: true
  },

  onLoad: function (options) {
    this.checkLoginStatus();
    this.loadHomeData();
  },

  onShow: function () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      });
    }
    this.loadRecentClothes();
  },

  onPullDownRefresh: function () {
    this.loadHomeData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 检查登录状态
  checkLoginStatus: function () {
    const userInfo = app.globalData.userInfo;
    const openid = wx.getStorageSync('openid');
    this.setData({
      userInfo: userInfo,
      isLogin: !!openid
    });
  },

  // 加载首页数据
  loadHomeData: async function () {
    this.setData({ isLoading: true });
    try {
      await Promise.all([
        this.loadRecentClothes(),
        this.loadTodaySuggestion()
      ]);
    } catch (error) {
      console.error('加载首页数据失败:', error);
    } finally {
      this.setData({ isLoading: false });
    }
  },

  // 加载最近添加的衣物
  loadRecentClothes: function () {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database();
      db.collection('clothing_items')
        .orderBy('createTime', 'desc')
        .limit(6)
        .get()
        .then(res => {
          this.setData({
            recentClothes: res.data
          });
          resolve(res.data);
        })
        .catch(err => {
          console.error('加载最近衣物失败:', err);
          // 如果集合不存在，使用空数组
          this.setData({
            recentClothes: []
          });
          resolve([]);
        });
    });
  },

  // 加载今日穿搭建议
  loadTodaySuggestion: function () {
    return new Promise((resolve, reject) => {
      // 模拟今日穿搭建议数据
      const suggestion = {
        id: 1,
        title: '今日推荐：简约休闲风',
        description: '根据今日天气，推荐舒适休闲的穿搭风格',
        temperature: '22°C',
        weather: '多云',
        items: [
          { type: '上衣', name: '白色T恤' },
          { type: '外套', name: '牛仔外套' },
          { type: '裤子', name: '休闲裤' }
        ]
      };
      this.setData({
        todaySuggestion: suggestion
      });
      resolve(suggestion);
    });
  },

  // 获取用户信息
  getUserProfile: function () {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        app.globalData.userInfo = res.userInfo;
        this.setData({
          userInfo: res.userInfo,
          isLogin: true
        });
        // 保存用户信息到数据库
        this.saveUserInfo(res.userInfo);
      },
      fail: (err) => {
        console.error('获取用户信息失败:', err);
        wx.showToast({
          title: '需要授权才能使用完整功能',
          icon: 'none'
        });
      }
    });
  },

  // 保存用户信息
  saveUserInfo: function (userInfo) {
    const db = wx.cloud.database();
    db.collection('users').add({
      data: {
        ...userInfo,
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    }).catch(err => {
      console.error('保存用户信息失败:', err);
    });
  },

  // 快速操作点击
  onQuickActionTap: function (e) {
    const { path } = e.currentTarget.dataset;
    wx.navigateTo({
      url: path
    });
  },

  // 轮播图点击
  onBannerTap: function (e) {
    const { index } = e.currentTarget.dataset;
    const banner = this.data.bannerList[index];
    console.log('点击轮播图:', banner);
    // 根据轮播图内容跳转不同页面
    switch (index) {
      case 0:
        wx.navigateTo({ url: '/pages/wardrobe/wardrobe' });
        break;
      case 1:
        wx.navigateTo({ url: '/pages/tryon/tryon' });
        break;
      case 2:
        wx.navigateTo({ url: '/pages/suggestion/suggestion' });
        break;
    }
  },

  // 衣物卡片点击
  onClothTap: function (e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/wardrobe/wardrobe?id=${id}`
    });
  },

  // 查看更多
  onViewMore: function () {
    wx.switchTab({
      url: '/pages/wardrobe/wardrobe'
    });
  },

  // 使用今日推荐
  onUseSuggestion: function () {
    wx.navigateTo({
      url: '/pages/tryon/tryon?suggestionId=' + this.data.todaySuggestion.id
    });
  },

  // 分享
  onShareAppMessage: function () {
    return {
      title: '智能穿搭助手 - 你的私人穿搭顾问',
      path: '/pages/index/index',
      imageUrl: '/images/share.png'
    };
  }
});
