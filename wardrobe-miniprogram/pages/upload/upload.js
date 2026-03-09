// pages/upload/upload.js - 上传页面
const app = getApp();
const db = require('../../utils/db');

Page({
  data: {
    // 图片相关
    tempImagePath: '',
    uploadedImageUrl: '',
    
    // 表单数据
    formData: {
      name: '',
      category: '',
      subCategory: '',
      color: '',
      pattern: '',
      material: '',
      season: [],
      occasion: [],
      style: '',
      brand: '',
      price: '',
      purchaseDate: '',
      size: '',
      tags: [],
      notes: ''
    },
    
    // 选项数据
    categories: [
      { id: 'top', name: '上装', subCategories: ['T恤', '衬衫', '卫衣', '毛衣', '背心', 'POLO衫'] },
      { id: 'bottom', name: '下装', subCategories: ['牛仔裤', '休闲裤', '短裤', '裙子', '运动裤', '西裤'] },
      { id: 'dress', name: '连衣裙', subCategories: ['长裙', '短裙', '礼服', '吊带裙', '半身裙'] },
      { id: 'outer', name: '外套', subCategories: ['夹克', '风衣', '大衣', '羽绒服', '西装', '皮衣'] },
      { id: 'shoes', name: '鞋履', subCategories: ['运动鞋', '休闲鞋', '皮鞋', '靴子', '凉鞋', '高跟鞋'] },
      { id: 'accessory', name: '配饰', subCategories: ['包包', '帽子', '围巾', '腰带', '首饰', '眼镜'] }
    ],
    colors: [
      { id: 'white', name: '白色', color: '#FFFFFF' },
      { id: 'black', name: '黑色', color: '#000000' },
      { id: 'gray', name: '灰色', color: '#808080' },
      { id: 'red', name: '红色', color: '#FF0000' },
      { id: 'orange', name: '橙色', color: '#FFA500' },
      { id: 'yellow', name: '黄色', color: '#FFFF00' },
      { id: 'green', name: '绿色', color: '#008000' },
      { id: 'blue', name: '蓝色', color: '#0000FF' },
      { id: 'purple', name: '紫色', color: '#800080' },
      { id: 'pink', name: '粉色', color: '#FFC0CB' },
      { id: 'brown', name: '棕色', color: '#8B4513' },
      { id: 'beige', name: '米色', color: '#F5F5DC' },
      { id: 'navy', name: '藏青', color: '#000080' },
      { id: 'multi', name: '多色', color: 'linear-gradient(45deg, #FF0000, #00FF00, #0000FF)' }
    ],
    patterns: ['纯色', '条纹', '格子', '印花', '波点', '迷彩', '几何', '花卉', '动物纹', '其他'],
    materials: ['棉', '麻', '丝', '毛', '涤纶', '尼龙', '牛仔', '皮革', '混纺', '其他'],
    seasons: [
      { id: 'spring', name: '春' },
      { id: 'summer', name: '夏' },
      { id: 'autumn', name: '秋' },
      { id: 'winter', name: '冬' }
    ],
    occasions: [
      { id: 'casual', name: '日常休闲' },
      { id: 'work', name: '职场通勤' },
      { id: 'formal', name: '正式场合' },
      { id: 'sport', name: '运动健身' },
      { id: 'party', name: '聚会派对' },
      { id: 'travel', name: '旅行度假' }
    ],
    styles: ['简约', '复古', '街头', '优雅', '甜美', '酷帅', '文艺', '运动', '商务', '其他'],
    
    // 状态
    currentStep: 1, // 1:拍照 2:编辑信息
    isUploading: false,
    uploadProgress: 0,
    isAnalyzing: false,
    showSubCategory: false,
    tagInput: '',
    currentSubCategories: []
  },

  onLoad: function (options) {
    // 页面加载时检查是否有传入的图片
    if (options.imagePath) {
      this.setData({
        tempImagePath: options.imagePath
      });
    }
  },

  onShow: function () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      });
    }
  },

  // 选择图片来源
  onChooseImageSource: function () {
    wx.showActionSheet({
      itemList: ['拍照', '从相册选择'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.takePhoto();
        } else {
          this.chooseFromAlbum();
        }
      }
    });
  },

  // 拍照
  takePhoto: function () {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera'],
      camera: 'back',
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.setData({
          tempImagePath: tempFilePath,
          currentStep: 2
        });
        // 自动分析图片
        this.analyzeImage(tempFilePath);
      },
      fail: (err) => {
        console.error('拍照失败:', err);
      }
    });
  },

  // 从相册选择
  chooseFromAlbum: function () {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.setData({
          tempImagePath: tempFilePath,
          currentStep: 2
        });
        // 自动分析图片
        this.analyzeImage(tempFilePath);
      },
      fail: (err) => {
        console.error('选择图片失败:', err);
      }
    });
  },

  // 分析图片（模拟AI识别）
  analyzeImage: function (imagePath) {
    this.setData({ isAnalyzing: true });
    
    // 模拟AI分析延迟
    setTimeout(() => {
      // 模拟识别结果
      const mockResult = {
        category: 'top',
        subCategory: 'T恤',
        color: 'white',
        pattern: '纯色',
        material: '棉',
        season: ['spring', 'summer'],
        confidence: 0.85
      };

      this.setData({
        'formData.category': mockResult.category,
        'formData.subCategory': mockResult.subCategory,
        'formData.color': mockResult.color,
        'formData.pattern': mockResult.pattern,
        'formData.material': mockResult.material,
        'formData.season': mockResult.season,
        isAnalyzing: false
      });

      wx.showToast({
        title: '识别完成',
        icon: 'success'
      });
    }, 1500);
  },

  // 重新选择图片
  onRetake: function () {
    this.setData({
      tempImagePath: '',
      currentStep: 1
    });
  },

  // 表单输入
  onInputChange: function (e) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    this.setData({
      [`formData.${field}`]: value
    });
  },

  // 选择分类
  onCategorySelect: function (e) {
    const { id } = e.currentTarget.dataset;
    const category = this.data.categories.find(c => c.id === id);
    this.setData({
      'formData.category': id,
      'formData.subCategory': '',
      showSubCategory: true,
      currentSubCategories: category ? category.subCategories : []
    });
  },

  // 选择子分类
  onSubCategorySelect: function (e) {
    const { name } = e.currentTarget.dataset;
    this.setData({
      'formData.subCategory': name,
      showSubCategory: false
    });
  },

  // 选择颜色
  onColorSelect: function (e) {
    const { id } = e.currentTarget.dataset;
    this.setData({
      'formData.color': id
    });
  },

  // 选择图案
  onPatternSelect: function (e) {
    const { pattern } = e.currentTarget.dataset;
    this.setData({
      'formData.pattern': pattern
    });
  },

  // 选择材质
  onMaterialSelect: function (e) {
    const { material } = e.currentTarget.dataset;
    this.setData({
      'formData.material': material
    });
  },

  // 选择季节
  onSeasonToggle: function (e) {
    const { id } = e.currentTarget.dataset;
    const seasons = this.data.formData.season;
    const index = seasons.indexOf(id);
    
    if (index > -1) {
      seasons.splice(index, 1);
    } else {
      seasons.push(id);
    }
    
    this.setData({
      'formData.season': seasons
    });
  },

  // 选择场合
  onOccasionToggle: function (e) {
    const { id } = e.currentTarget.dataset;
    const occasions = this.data.formData.occasion;
    const index = occasions.indexOf(id);
    
    if (index > -1) {
      occasions.splice(index, 1);
    } else {
      occasions.push(id);
    }
    
    this.setData({
      'formData.occasion': occasions
    });
  },

  // 选择风格
  onStyleSelect: function (e) {
    const { style } = e.currentTarget.dataset;
    this.setData({
      'formData.style': style
    });
  },

  // 标签输入
  onTagInput: function (e) {
    this.setData({
      tagInput: e.detail.value
    });
  },

  // 添加标签
  onAddTag: function () {
    const tag = this.data.tagInput.trim();
    if (!tag) return;
    
    const tags = this.data.formData.tags;
    if (tags.includes(tag)) {
      wx.showToast({ title: '标签已存在', icon: 'none' });
      return;
    }
    
    tags.push(tag);
    this.setData({
      'formData.tags': tags,
      tagInput: ''
    });
  },

  // 删除标签
  onRemoveTag: function (e) {
    const { index } = e.currentTarget.dataset;
    const tags = this.data.formData.tags;
    tags.splice(index, 1);
    this.setData({
      'formData.tags': tags
    });
  },

  // 验证表单
  validateForm: function () {
    const { name, category, color } = this.data.formData;
    
    if (!this.data.tempImagePath) {
      wx.showToast({ title: '请先上传图片', icon: 'none' });
      return false;
    }
    
    if (!name.trim()) {
      wx.showToast({ title: '请输入衣物名称', icon: 'none' });
      return false;
    }
    
    if (!category) {
      wx.showToast({ title: '请选择分类', icon: 'none' });
      return false;
    }
    
    if (!color) {
      wx.showToast({ title: '请选择颜色', icon: 'none' });
      return false;
    }
    
    return true;
  },

  // 提交表单
  onSubmit: function () {
    if (!this.validateForm()) return;
    
    this.setData({ isUploading: true });
    
    // 先上传图片到云存储
    this.uploadImage()
      .then(imageUrl => {
        // 保存衣物信息到数据库
        return this.saveClothingData(imageUrl);
      })
      .then(() => {
        this.setData({ isUploading: false });
        app.showSuccess('添加成功');
        
        // 延迟返回
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      })
      .catch(err => {
        console.error('保存失败:', err);
        this.setData({ isUploading: false });
        app.handleError(err, '保存失败');
      });
  },

  // 上传图片到云存储（或本地保存）
  uploadImage: function () {
    return new Promise((resolve, reject) => {
      // 如果没有云开发，直接保存本地路径
      if (!app.globalData.cloudInitialized) {
        console.log('本地模式：使用本地图片路径');
        resolve(this.data.tempImagePath);
        return;
      }
      
      const cloudPath = `clothes/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
      
      wx.cloud.uploadFile({
        cloudPath: cloudPath,
        filePath: this.data.tempImagePath,
        success: res => {
          resolve(res.fileID);
        },
        fail: err => {
          console.warn('云存储上传失败，使用本地路径:', err);
          resolve(this.data.tempImagePath);
        }
      });
    });
  },

  // 保存衣物数据到数据库
  saveClothingData: function (imageUrl) {
    return new Promise((resolve, reject) => {
      const data = {
        ...this.data.formData,
        imageUrl: imageUrl,
        isLocalImage: !app.globalData.cloudInitialized
      };
      
      db.add('clothing_items', data)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          reject(err);
        });
    });
  },

  // 取消
  onCancel: function () {
    wx.showModal({
      title: '确认取消',
      content: '确定要放弃当前编辑吗？',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack();
        }
      }
    });
  }
});
