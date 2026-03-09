// 穿搭建议页面逻辑 - 智能穿搭助手
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 场合列表
    occasions: [
      { value: 'daily', name: '日常', icon: '🏠' },
      { value: 'work', name: '职场', icon: '💼' },
      { value: 'date', name: '约会', icon: '💕' },
      { value: 'sport', name: '运动', icon: '🏃' },
      { value: 'party', name: '聚会', icon: '🎉' },
      { value: 'travel', name: '旅行', icon: '✈️' }
    ],
    // 季节列表
    seasons: [
      { value: 'spring', name: '春', icon: '🌸' },
      { value: 'summer', name: '夏', icon: '☀️' },
      { value: 'autumn', name: '秋', icon: '🍂' },
      { value: 'winter', name: '冬', icon: '❄️' }
    ],
    // 风格偏好
    stylePreferences: [
      { value: 'simple', name: '简约', selected: false },
      { value: 'elegant', name: '优雅', selected: false },
      { value: 'casual', name: '休闲', selected: false },
      { value: 'fashion', name: '时尚', selected: false },
      { value: 'cute', name: '可爱', selected: false },
      { value: 'cool', name: '酷帅', selected: false }
    ],
    // 选中的场合
    selectedOccasion: '',
    selectedOccasionName: '',
    // 选中的季节
    selectedSeason: '',
    selectedSeasonName: '',
    // 是否可以获取建议
    canGetSuggestion: false,
    // 是否正在加载
    isLoading: false,
    // 是否显示结果
    showResult: false,
    // 建议结果
    suggestion: {},
    // 历史建议
    suggestionHistory: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 加载历史建议
    this.loadHistory();
    
    // 如果传入clothesId，自动设置相关参数
    if (options.clothesId) {
      this.autoSetParams(parseInt(options.clothesId));
    }
  },

  /**
   * 加载历史建议
   */
  loadHistory() {
    const history = wx.getStorageSync('suggestionHistory') || [];
    this.setData({
      suggestionHistory: history.slice(0, 5)
    });
  },

  /**
   * 自动设置参数
   */
  autoSetParams(clothesId) {
    const wardrobe = wx.getStorageSync('wardrobe') || [];
    const clothes = wardrobe.find(item => item.id === clothesId);
    
    if (clothes) {
      // 根据衣物分类设置场合
      const occasionMap = {
        'top': 'daily',
        'bottom': 'daily',
        'dress': 'date',
        'outer': 'work',
        'shoes': 'sport',
        'accessory': 'party'
      };
      
      this.setData({
        selectedOccasion: occasionMap[clothes.category] || 'daily',
        selectedOccasionName: this.getOccasionName(occasionMap[clothes.category] || 'daily')
      });
      
      this.checkCanSubmit();
    }
  },

  /**
   * 获取场合名称
   */
  getOccasionName(value) {
    const occasion = this.data.occasions.find(item => item.value === value);
    return occasion ? occasion.name : '';
  },

  /**
   * 获取季节名称
   */
  getSeasonName(value) {
    const season = this.data.seasons.find(item => item.value === value);
    return season ? season.name : '';
  },

  /**
   * 选择场合
   */
  selectOccasion(e) {
    const value = e.currentTarget.dataset.value;
    const occasion = this.data.occasions.find(item => item.value === value);
    
    this.setData({
      selectedOccasion: value,
      selectedOccasionName: occasion.name
    });
    
    this.checkCanSubmit();
  },

  /**
   * 选择季节
   */
  selectSeason(e) {
    const value = e.currentTarget.dataset.value;
    const season = this.data.seasons.find(item => item.value === value);
    
    this.setData({
      selectedSeason: value,
      selectedSeasonName: season.name
    });
    
    this.checkCanSubmit();
  },

  /**
   * 切换风格
   */
  toggleStyle(e) {
    const value = e.currentTarget.dataset.value;
    const { stylePreferences } = this.data;
    
    const updated = stylePreferences.map(item => {
      if (item.value === value) {
        return { ...item, selected: !item.selected };
      }
      return item;
    });
    
    this.setData({
      stylePreferences: updated
    });
  },

  /**
   * 检查是否可以提交
   */
  checkCanSubmit() {
    const { selectedOccasion, selectedSeason } = this.data;
    const canGetSuggestion = selectedOccasion && selectedSeason;
    
    this.setData({ canGetSuggestion });
  },

  /**
   * 获取穿搭建议
   */
  getSuggestion() {
    if (!this.data.canGetSuggestion || this.data.isLoading) return;
    
    this.setData({ isLoading: true });
    
    // 模拟API调用
    setTimeout(() => {
      const suggestion = this.generateMockSuggestion();
      
      this.setData({
        isLoading: false,
        showResult: true,
        suggestion
      });
      
      // 保存到历史
      this.saveToHistory(suggestion);
    }, 2000);
  },

  /**
   * 生成模拟建议数据
   */
  generateMockSuggestion() {
    const { selectedOccasion, selectedOccasionName, selectedSeason, selectedSeasonName } = this.data;
    
    // 根据场合生成不同的建议
    const suggestionMap = {
      'daily': {
        outfitImage: '/images/suggestions/daily.jpg',
        score: 92,
        items: [
          { id: 1, name: '白色T恤', category: '上衣', image: '/images/clothes/tshirt-white.jpg', inWardrobe: true },
          { id: 2, name: '牛仔裤', category: '裤子', image: '/images/clothes/jeans.jpg', inWardrobe: true },
          { id: 3, name: '帆布鞋', category: '鞋子', image: '/images/clothes/sneakers.jpg', inWardrobe: false }
        ],
        comment: '这套搭配简约舒适，非常适合日常出行。白色T恤搭配牛仔裤是经典组合，既清爽又百搭。',
        tips: [
          '可以将T恤前摆稍微塞进裤子里，提升腰线',
          '搭配一条简约项链，增加精致感',
          '选择浅色系的包包，整体更加协调'
        ],
        colorAnalysis: {
          colors: [
            { value: '#FFFFFF', name: '白色' },
            { value: '#4169E1', name: '蓝色' },
            { value: '#8B4513', name: '棕色' }
          ],
          description: '蓝白配色清新自然，棕色点缀增添温暖感，整体色调和谐统一。'
        },
        scenes: ['逛街购物', '朋友聚会', '周末休闲', '咖啡厅']
      },
      'work': {
        outfitImage: '/images/suggestions/work.jpg',
        score: 95,
        items: [
          { id: 4, name: '白衬衫', category: '上衣', image: '/images/clothes/shirt-white.jpg', inWardrobe: true },
          { id: 5, name: '西装裤', category: '裤子', image: '/images/clothes/suit-pants.jpg', inWardrobe: true },
          { id: 6, name: '高跟鞋', category: '鞋子', image: '/images/clothes/heels.jpg', inWardrobe: true }
        ],
        comment: '职场穿搭讲究干练专业，这套搭配既正式又不失时尚感，非常适合商务场合。',
        tips: [
          '衬衫可以选择真丝材质，更显高级感',
          '配饰选择简约的金属色系',
          '妆容以淡妆为主，突出专业形象'
        ],
        colorAnalysis: {
          colors: [
            { value: '#FFFFFF', name: '白色' },
            { value: '#000000', name: '黑色' },
            { value: '#C0C0C0', name: '银色' }
          ],
          description: '经典的黑白配色永不过时，银色点缀增添现代感，彰显专业气质。'
        },
        scenes: ['商务会议', '客户拜访', '正式场合', '办公室']
      },
      'date': {
        outfitImage: '/images/suggestions/date.jpg',
        score: 90,
        items: [
          { id: 7, name: '碎花裙', category: '裙子', image: '/images/clothes/dress-floral.jpg', inWardrobe: true },
          { id: 8, name: '小外套', category: '外套', image: '/images/clothes/jacket-short.jpg', inWardrobe: false },
          { id: 9, name: '单鞋', category: '鞋子', image: '/images/clothes/flats.jpg', inWardrobe: true }
        ],
        comment: '碎花裙甜美浪漫，非常适合约会场合，既展现女性魅力又不失优雅。',
        tips: [
          '可以搭配一条细腰带，突出腰线',
          '选择小巧精致的耳环',
          '发型可以选择半扎或自然卷发'
        ],
        colorAnalysis: {
          colors: [
            { value: '#FFB6C1', name: '粉色' },
            { value: '#98FB98', name: '绿色' },
            { value: '#FFFFFF', name: '白色' }
          ],
          description: '粉色系温柔甜美，绿色点缀增添活力，整体配色浪漫清新。'
        },
        scenes: ['浪漫晚餐', '看电影', '公园散步', '约会']
      }
    };
    
    return suggestionMap[selectedOccasion] || suggestionMap['daily'];
  },

  /**
   * 保存到历史
   */
  saveToHistory(suggestion) {
    const { selectedOccasionName, selectedSeasonName } = this.data;
    
    const historyItem = {
      id: Date.now(),
      outfitImage: suggestion.outfitImage,
      occasion: selectedOccasionName,
      season: selectedSeasonName,
      date: this.formatDate(new Date()),
      suggestion
    };
    
    let history = wx.getStorageSync('suggestionHistory') || [];
    history.unshift(historyItem);
    
    // 限制历史数量
    if (history.length > 20) {
      history = history.slice(0, 20);
    }
    
    wx.setStorageSync('suggestionHistory', history);
    
    this.setData({
      suggestionHistory: history.slice(0, 5)
    });
  },

  /**
   * 格式化日期
   */
  formatDate(date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
  },

  /**
   * 预览搭配图
   */
  previewOutfit() {
    wx.previewImage({
      urls: [this.data.suggestion.outfitImage],
      current: this.data.suggestion.outfitImage
    });
  },

  /**
   * 虚拟试穿
   */
  tryOnOutfit() {
    const itemIds = this.data.suggestion.items
      .filter(item => item.inWardrobe)
      .map(item => item.id)
      .join(',');
    
    wx.navigateTo({
      url: `/pages/tryon/tryon?clothesIds=${itemIds}`
    });
  },

  /**
   * 保存搭配
   */
  saveOutfit() {
    const outfit = {
      id: Date.now(),
      ...this.data.suggestion,
      occasion: this.data.selectedOccasionName,
      season: this.data.selectedSeasonName,
      createTime: new Date().toISOString()
    };
    
    let savedOutfits = wx.getStorageSync('savedOutfits') || [];
    savedOutfits.push(outfit);
    wx.setStorageSync('savedOutfits', savedOutfits);
    
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    });
  },

  /**
   * 分享搭配
   */
  shareOutfit() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  /**
   * 重新选择
   */
  resetAndRetry() {
    this.setData({
      showResult: false,
      suggestion: {},
      selectedOccasion: '',
      selectedOccasionName: '',
      selectedSeason: '',
      selectedSeasonName: '',
      canGetSuggestion: false
    });
  },

  /**
   * 查看历史
   */
  viewHistory(e) {
    const id = e.currentTarget.dataset.id;
    const history = this.data.suggestionHistory.find(item => item.id === id);
    
    if (history) {
      this.setData({
        showResult: true,
        suggestion: history.suggestion,
        selectedOccasionName: history.occasion,
        selectedSeasonName: history.season
      });
    }
  },

  /**
   * 清空历史
   */
  clearHistory() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有历史建议吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('suggestionHistory');
          this.setData({
            suggestionHistory: []
          });
          wx.showToast({
            title: '已清空',
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
      title: `AI穿搭建议 - ${this.data.selectedOccasionName}穿搭`,
      path: '/pages/suggestion/suggestion',
      imageUrl: this.data.suggestion.outfitImage
    };
  }
});
