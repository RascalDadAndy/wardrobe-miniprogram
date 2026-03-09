// app.js - 智能穿搭助手小程序入口
App({
  globalData: {
    userInfo: null,
    openid: null,
    cloudEnv: 'cloud1-6gdrkuux94b4b4ef', // 云开发环境ID，需替换为实际环境ID
    cloudInitialized: false,  // 云开发是否初始化成功
    useLocalMode: false,      // 是否使用本地存储模式
    themeColor: {
      primary: '#D4A574',      // 主色调 - 温暖棕色
      primaryDark: '#B8935F',  // 深主色
      primaryLight: '#E8D4C0', // 浅主色
      accent: '#E07B39',       // 强调色 - 橙色
      background: '#F5F0EB',   // 背景色 - 米白色
      surface: '#FFFFFF',      // 表面色 - 纯白
      text: '#333333',         // 主文字
      textSecondary: '#666666',// 次要文字
      textHint: '#999999',     // 提示文字
      divider: '#E0E0E0',      // 分割线
      success: '#4CAF50',      // 成功色
      warning: '#FFC107',      // 警告色
      error: '#F44336'         // 错误色
    }
  },

  onLaunch: function () {
    console.log('智能穿搭助手小程序启动');
    
    // 初始化云开发
    this.initCloud();
    
    // 初始化本地存储数据
    this.initLocalData();

    // 检查登录状态
    this.checkLoginStatus();

    // 获取系统信息
    this.getSystemInfo();
  },

  // 初始化云开发
  initCloud: function() {
    const that = this;
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用云开发功能，请升级到最新微信版本后重试。',
        showCancel: false
      });
      that.globalData.useLocalMode = true;
      return;
    }
    
    // 尝试初始化云开发
    try {
      wx.cloud.init({
        env: that.globalData.cloudEnv,
        traceUser: true
      });
      
      // 验证云开发是否可用
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
          console.log('云开发初始化成功:', res);
          that.globalData.cloudInitialized = true;
          that.globalData.openid = res.result.openid;
          wx.setStorageSync('openid', res.result.openid);
        },
        fail: err => {
          console.warn('云开发初始化失败，切换到本地模式:', err);
          that.globalData.cloudInitialized = false;
          that.globalData.useLocalMode = true;
          that.showLocalModeTip();
        }
      });
    } catch (e) {
      console.error('云开发初始化异常:', e);
      that.globalData.cloudInitialized = false;
      that.globalData.useLocalMode = true;
      that.showLocalModeTip();
    }
  },

  // 显示本地模式提示
  showLocalModeTip: function() {
    wx.showModal({
      title: '本地模式',
      content: '云开发未配置，已切换到本地存储模式。数据将保存在本地，部分功能受限。如需完整功能，请开通云开发并配置环境ID。',
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  // 初始化本地存储数据
  initLocalData: function() {
    // 检查并初始化衣物数据
    const clothingItems = wx.getStorageSync('clothing_items');
    if (!clothingItems) {
      wx.setStorageSync('clothing_items', []);
    }
    
    // 检查并初始化搭配数据
    const outfits = wx.getStorageSync('outfits');
    if (!outfits) {
      wx.setStorageSync('outfits', []);
    }
    
    // 检查并初始化试衣记录
    const tryonRecords = wx.getStorageSync('tryon_records');
    if (!tryonRecords) {
      wx.setStorageSync('tryon_records', []);
    }
    
    // 检查并初始化用户信息
    const userInfo = wx.getStorageSync('user_info');
    if (userInfo) {
      this.globalData.userInfo = userInfo;
    }
    
    console.log('本地数据初始化完成');
  },

  onShow: function (options) {
    console.log('小程序显示', options);
  },

  onHide: function () {
    console.log('小程序隐藏');
  },

  onError: function (msg) {
    console.error('小程序错误:', msg);
  },

  // 检查登录状态
  checkLoginStatus: function () {
    const that = this;
    wx.checkSession({
      success: function () {
        // session未过期，获取用户信息
        that.getUserInfo();
      },
      fail: function () {
        // session已过期，需要重新登录
        that.userLogin();
      }
    });
  },

  // 用户登录
  userLogin: function () {
    const that = this;
    wx.login({
      success: res => {
        if (res.code) {
          // 如果有云开发，调用云函数获取openid
          if (that.globalData.cloudInitialized) {
            wx.cloud.callFunction({
              name: 'login',
              data: {},
              success: res => {
                console.log('登录成功:', res.result);
                that.globalData.openid = res.result.openid;
                wx.setStorageSync('openid', res.result.openid);
              },
              fail: err => {
                console.error('登录失败:', err);
                // 生成本地openid
                that.generateLocalOpenid();
              }
            });
          } else {
            // 本地模式，生成临时openid
            that.generateLocalOpenid();
          }
        }
      }
    });
  },

  // 生成本地openid
  generateLocalOpenid: function() {
    let openid = wx.getStorageSync('openid');
    if (!openid) {
      openid = 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      wx.setStorageSync('openid', openid);
    }
    this.globalData.openid = openid;
    console.log('本地openid:', openid);
  },

  // 获取用户信息
  getUserInfo: function () {
    const that = this;
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: res => {
              that.globalData.userInfo = res.userInfo;
              console.log('获取用户信息成功:', res.userInfo);
            }
          });
        }
      }
    });
  },

  // 获取系统信息
  getSystemInfo: function () {
    wx.getSystemInfo({
      success: res => {
        this.globalData.systemInfo = res;
        this.globalData.statusBarHeight = res.statusBarHeight;
        this.globalData.screenWidth = res.screenWidth;
        this.globalData.screenHeight = res.screenHeight;
        console.log('系统信息:', res);
      }
    });
  },

  // 全局错误处理
  handleError: function (error, message) {
    console.error('应用错误:', error);
    wx.showToast({
      title: message || '操作失败，请重试',
      icon: 'none',
      duration: 2000
    });
  },

  // 全局成功提示
  showSuccess: function (message) {
    wx.showToast({
      title: message || '操作成功',
      icon: 'success',
      duration: 1500
    });
  }
});
