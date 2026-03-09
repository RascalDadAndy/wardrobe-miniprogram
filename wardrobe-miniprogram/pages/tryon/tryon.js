// 虚拟试衣页面逻辑 - 智能穿搭助手
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 当前步骤
    currentStep: 1,
    // 用户照片
    userPhoto: '',
    // 历史照片
    historyPhotos: [],
    // 是否显示历史照片弹窗
    showHistoryModal: false,
    // 拍照提示
    photoTips: [
      '请拍摄正面全身照',
      '背景简洁，光线充足',
      '身体保持自然站立',
      '避免穿着过于宽松的衣服'
    ],
    // 分类列表
    categories: [
      { value: 'all', name: '全部' },
      { value: 'top', name: '上衣' },
      { value: 'bottom', name: '裤子' },
      { value: 'dress', name: '裙子' },
      { value: 'outer', name: '外套' },
      { value: 'shoes', name: '鞋子' }
    ],
    // 当前分类
    currentCategory: 'all',
    // 衣物列表
    clothesList: [],
    // 筛选后的衣物
    filteredClothes: [],
    // 选中的衣物
    selectedClothes: [],
    // 是否正在生成
    isGenerating: false,
    // 生成进度
    generateProgress: 0,
    // 结果图片
    resultImage: '',
    // 是否显示对比
    showCompare: true,
    // 是否正在对比
    isComparing: false,
    // 是否有错误
    hasError: false,
    // 错误信息
    errorMessage: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 加载历史照片
    this.loadHistoryPhotos();
    // 加载衣物列表
    this.loadClothesList();
    
    // 如果传入clothesId，自动选中
    if (options.clothesId) {
      this.autoSelectClothes(parseInt(options.clothesId));
    }
  },

  /**
   * 加载历史照片
   */
  loadHistoryPhotos() {
    const historyPhotos = wx.getStorageSync('tryonHistoryPhotos') || [];
    this.setData({ historyPhotos });
  },

  /**
   * 加载衣物列表
   */
  loadClothesList() {
    const wardrobe = wx.getStorageSync('wardrobe') || [];
    const clothesList = wardrobe.map(item => ({
      ...item,
      selected: false
    }));
    
    this.setData({
      clothesList,
      filteredClothes: clothesList
    });
  },

  /**
   * 自动选中衣物
   */
  autoSelectClothes(clothesId) {
    const { clothesList } = this.data;
    const clothes = clothesList.find(item => item.id === clothesId);
    
    if (clothes) {
      this.setData({
        selectedClothes: [clothes]
      });
      // 自动跳转到步骤2
      setTimeout(() => {
        this.setData({ currentStep: 2 });
      }, 500);
    }
  },

  /**
   * 拍照
   */
  takePhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.setUserPhoto(tempFilePath);
      }
    });
  },

  /**
   * 从相册选择
   */
  chooseFromAlbum() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.setUserPhoto(tempFilePath);
      }
    });
  },

  /**
   * 设置用户照片
   */
  setUserPhoto(photoUrl) {
    this.setData({
      userPhoto: photoUrl
    });
    
    // 保存到历史照片
    this.saveToHistory(photoUrl);
  },

  /**
   * 保存到历史
   */
  saveToHistory(photoUrl) {
    let historyPhotos = wx.getStorageSync('tryonHistoryPhotos') || [];
    // 去重并限制数量
    historyPhotos = historyPhotos.filter(url => url !== photoUrl);
    historyPhotos.unshift(photoUrl);
    if (historyPhotos.length > 20) {
      historyPhotos = historyPhotos.slice(0, 20);
    }
    wx.setStorageSync('tryonHistoryPhotos', historyPhotos);
    this.setData({ historyPhotos });
  },

  /**
   * 重新选择照片
   */
  retakePhoto() {
    wx.showActionSheet({
      itemList: ['拍照', '从相册选择', '历史照片'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.takePhoto();
        } else if (res.tapIndex === 1) {
          this.chooseFromAlbum();
        } else {
          this.showHistoryModal();
        }
      }
    });
  },

  /**
   * 显示历史照片弹窗
   */
  showHistoryModal() {
    this.setData({
      showHistoryModal: true
    });
  },

  /**
   * 关闭历史照片弹窗
   */
  closeHistoryModal() {
    this.setData({
      showHistoryModal: false
    });
  },

  /**
   * 使用历史照片
   */
  useHistoryPhoto() {
    this.showHistoryModal();
  },

  /**
   * 选择历史照片
   */
  selectHistoryPhoto(e) {
    const index = e.currentTarget.dataset.index;
    const photoUrl = this.data.historyPhotos[index];
    this.setData({
      userPhoto: photoUrl,
      showHistoryModal: false
    });
  },

  /**
   * 跳转到步骤2
   */
  goToStep2() {
    this.setData({
      currentStep: 2
    });
  },

  /**
   * 跳转到步骤1
   */
  goToStep1() {
    this.setData({
      currentStep: 1
    });
  },

  /**
   * 选择分类
   */
  selectCategory(e) {
    const value = e.currentTarget.dataset.value;
    const { clothesList } = this.data;
    
    let filtered = clothesList;
    if (value !== 'all') {
      filtered = clothesList.filter(item => item.category === value);
    }
    
    this.setData({
      currentCategory: value,
      filteredClothes: filtered
    });
  },

  /**
   * 切换衣物选择
   */
  toggleClothesSelection(e) {
    const id = e.currentTarget.dataset.id;
    const { clothesList, selectedClothes } = this.data;
    
    // 更新衣物选中状态
    const updatedList = clothesList.map(item => {
      if (item.id === id) {
        return { ...item, selected: !item.selected };
      }
      return item;
    });
    
    // 更新选中列表
    const clothes = updatedList.find(item => item.id === id);
    let updatedSelected;
    
    if (clothes.selected) {
      // 限制最多选择3件
      if (selectedClothes.length >= 3) {
        wx.showToast({
          title: '最多选择3件衣物',
          icon: 'none'
        });
        return;
      }
      updatedSelected = [...selectedClothes, clothes];
    } else {
      updatedSelected = selectedClothes.filter(item => item.id !== id);
    }
    
    this.setData({
      clothesList: updatedList,
      filteredClothes: updatedList.filter(item => 
        this.data.currentCategory === 'all' || item.category === this.data.currentCategory
      ),
      selectedClothes: updatedSelected
    });
  },

  /**
   * 移除选中的衣物
   */
  removeClothes(e) {
    const id = e.currentTarget.dataset.id;
    const { clothesList, selectedClothes } = this.data;
    
    const updatedList = clothesList.map(item => {
      if (item.id === id) {
        return { ...item, selected: false };
      }
      return item;
    });
    
    this.setData({
      clothesList: updatedList,
      filteredClothes: updatedList.filter(item => 
        this.data.currentCategory === 'all' || item.category === this.data.currentCategory
      ),
      selectedClothes: selectedClothes.filter(item => item.id !== id)
    });
  },

  /**
   * 跳转到步骤3
   */
  goToStep3() {
    this.setData({
      currentStep: 3,
      isGenerating: true,
      generateProgress: 0,
      hasError: false,
      resultImage: ''
    });
    
    // 开始生成
    this.startGeneration();
  },

  /**
   * 开始生成
   */
  startGeneration() {
    // 模拟生成进度
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(progressInterval);
        this.onGenerationComplete();
      }
      this.setData({
        generateProgress: Math.floor(progress)
      });
    }, 500);
  },

  /**
   * 生成完成
   */
  onGenerationComplete() {
    // 模拟生成结果
    setTimeout(() => {
      this.setData({
        isGenerating: false,
        resultImage: '/images/tryon-result.jpg' // 实际项目中应为API返回的图片
      });
    }, 500);
  },

  /**
   * 预览结果
   */
  previewResult() {
    wx.previewImage({
      urls: [this.data.resultImage],
      current: this.data.resultImage
    });
  },

  /**
   * 切换对比
   */
  toggleCompare() {
    this.setData({
      isComparing: !this.data.isComparing
    });
  },

  /**
   * 保存结果
   */
  saveResult() {
    wx.saveImageToPhotosAlbum({
      filePath: this.data.resultImage,
      success: () => {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.log('保存失败:', err);
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 分享结果
   */
  shareResult() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  /**
   * 重新试衣
   */
  retryTryon() {
    this.setData({
      currentStep: 1,
      userPhoto: '',
      selectedClothes: [],
      resultImage: '',
      isComparing: false
    });
    
    // 重置衣物选中状态
    const clothesList = this.data.clothesList.map(item => ({
      ...item,
      selected: false
    }));
    
    this.setData({
      clothesList,
      filteredClothes: clothesList
    });
  },

  /**
   * 重新生成
   */
  retryGenerate() {
    this.setData({
      isGenerating: true,
      generateProgress: 0,
      hasError: false
    });
    this.startGeneration();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '看看我的虚拟试衣效果',
      path: '/pages/tryon/tryon',
      imageUrl: this.data.resultImage
    };
  }
});
