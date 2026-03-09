// 个人中心页面逻辑 - 智能穿搭助手
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 用户信息
    userInfo: {
      nickName: '',
      avatarUrl: ''
    },
    // 用户ID
    userId: '',
    // 等级信息
    level: {
      name: '穿搭新手',
      progress: '1/10'
    },
    // 统计数据
    stats: {
      clothesCount: 0,
      outfitCount: 0,
      tryonCount: 0,
      favoriteCount: 0
    },
    // 通知开关
    notificationEnabled: true,
    // 缓存大小
    cacheSize: '0MB',
    // 版本号
    version: '1.0.0'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadUserInfo();
    this.loadStats();
    this.calculateCacheSize();
    this.getVersion();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.loadStats();
  },

  /**
   * 加载用户信息
   */
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo,
        userId: this.generateUserId()
      });
    }
  },

  /**
   * 生成用户ID
   */
  generateUserId() {
    let userId = wx.getStorageSync('userId');
    if (!userId) {
      userId = 'U' + Date.now().toString(36).toUpperCase();
      wx.setStorageSync('userId', userId);
    }
    return userId;
  },

  /**
   * 加载统计数据
   */
  loadStats() {
    const wardrobe = wx.getStorageSync('wardrobe') || [];
    const savedOutfits = wx.getStorageSync('savedOutfits') || [];
    const tryonHistory = wx.getStorageSync('tryonHistoryPhotos') || [];
    
    const favoriteCount = wardrobe.filter(item => item.isFavorite).length;
    
    this.setData({
      'stats.clothesCount': wardrobe.length,
      'stats.outfitCount': savedOutfits.length,
      'stats.tryonCount': tryonHistory.length,
      'stats.favoriteCount': favoriteCount
    });
    
    // 更新等级
    this.updateLevel(wardrobe.length);
  },

  /**
   * 更新等级
   */
  updateLevel(clothesCount) {
    const levels = [
      { name: '穿搭新手', min: 0, max: 5 },
      { name: '时尚学徒', min: 5, max: 15 },
      { name: '搭配达人', min: 15, max: 30 },
      { name: '潮流先锋', min: 30, max: 50 },
      { name: '时尚icon', min: 50, max: 999 }
    ];
    
    const currentLevel = levels.find(l => clothesCount >= l.min && clothesCount < l.max) || levels[0];
    const nextLevel = levels[levels.indexOf(currentLevel) + 1];
    const progress = nextLevel ? `${clothesCount - currentLevel.min}/${nextLevel.min - currentLevel.min}` : 'MAX';
    
    this.setData({
      level: {
        name: currentLevel.name,
        progress
      }
    });
  },

  /**
   * 计算缓存大小
   */
  calculateCacheSize() {
    // 模拟计算缓存大小
    const cacheSize = '12.5MB';
    this.setData({ cacheSize });
  },

  /**
   * 获取版本号
   */
  getVersion() {
    const accountInfo = wx.getAccountInfoSync();
    this.setData({
      version: accountInfo.miniProgram.version || '1.0.0'
    });
  },

  /**
   * 登录
   */
  login() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        const userInfo = res.userInfo;
        wx.setStorageSync('userInfo', userInfo);
        this.setData({
          userInfo,
          userId: this.generateUserId()
        });
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });
      },
      fail: () => {
        wx.showToast({
          title: '登录取消',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 更换头像
   */
  changeAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const avatarUrl = res.tempFiles[0].tempFilePath;
        const userInfo = { ...this.data.userInfo, avatarUrl };
        wx.setStorageSync('userInfo', userInfo);
        this.setData({ userInfo });
        wx.showToast({
          title: '更换成功',
          icon: 'success'
        });
      }
    });
  },

  /**
   * 跳转到衣柜
   */
  goToWardrobe() {
    wx.switchTab({
      url: '/pages/wardrobe/wardrobe'
    });
  },

  /**
   * 跳转到保存的搭配
   */
  goToSavedOutfits() {
    wx.navigateTo({
      url: '/pages/profile/saved-outfits'
    });
  },

  /**
   * 跳转到试衣记录
   */
  goToTryonHistory() {
    wx.navigateTo({
      url: '/pages/profile/tryon-history'
    });
  },

  /**
   * 跳转到收藏
   */
  goToFavorites() {
    wx.navigateTo({
      url: '/pages/wardrobe/wardrobe?filter=favorite'
    });
  },

  /**
   * 跳转到衣柜分析
   */
  goToWardrobeAnalysis() {
    wx.navigateTo({
      url: '/pages/profile/wardrobe-analysis'
    });
  },

  /**
   * 跳转到风格报告
   */
  goToStyleReport() {
    wx.navigateTo({
      url: '/pages/profile/style-report'
    });
  },

  /**
   * 跳转到穿搭日志
   */
  goToWearLog() {
    wx.navigateTo({
      url: '/pages/profile/wear-log'
    });
  },

  /**
   * 跳转到身材信息
   */
  goToBodyInfo() {
    wx.navigateTo({
      url: '/pages/profile/body-info'
    });
  },

  /**
   * 跳转到偏好设置
   */
  goToPreferences() {
    wx.navigateTo({
      url: '/pages/profile/preferences'
    });
  },

  /**
   * 切换通知
   */
  toggleNotification(e) {
    const enabled = e.detail.value;
    this.setData({ notificationEnabled: enabled });
    wx.setStorageSync('notificationEnabled', enabled);
    
    wx.showToast({
      title: enabled ? '已开启' : '已关闭',
      icon: 'none'
    });
  },

  /**
   * 清理缓存
   */
  clearCache() {
    wx.showModal({
      title: '清理缓存',
      content: '确定要清理缓存吗？清理后部分数据需要重新加载。',
      success: (res) => {
        if (res.confirm) {
          // 清理缓存
          wx.clearStorage({
            success: () => {
              // 保留用户信息
              const userInfo = this.data.userInfo;
              if (userInfo.nickName) {
                wx.setStorageSync('userInfo', userInfo);
              }
              
              this.setData({
                cacheSize: '0MB',
                'stats.clothesCount': 0,
                'stats.outfitCount': 0,
                'stats.tryonCount': 0,
                'stats.favoriteCount': 0
              });
              
              wx.showToast({
                title: '清理成功',
                icon: 'success'
              });
            }
          });
        }
      }
    });
  },

  /**
   * 跳转到帮助
   */
  goToHelp() {
    wx.navigateTo({
      url: '/pages/profile/help'
    });
  },

  /**
   * 跳转到反馈
   */
  goToFeedback() {
    wx.navigateTo({
      url: '/pages/profile/feedback'
    });
  },

  /**
   * 跳转到关于
   */
  goToAbout() {
    wx.navigateTo({
      url: '/pages/profile/about'
    });
  },

  /**
   * 退出登录
   */
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除用户信息
          wx.removeStorageSync('userInfo');
          
          this.setData({
            userInfo: { nickName: '', avatarUrl: '' },
            userId: ''
          });
          
          wx.showToast({
            title: '已退出',
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '智能穿搭助手 - 让穿搭更简单',
      path: '/pages/index/index',
      imageUrl: '/images/share-cover.jpg'
    };
  }
});
