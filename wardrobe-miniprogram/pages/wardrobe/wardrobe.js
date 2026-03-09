// pages/wardrobe/wardrobe.js - 衣柜页面
const app = getApp();
const db = require('../../utils/db');

Page({
  data: {
    clothesList: [],
    categories: [
      { id: 'all', name: '全部', icon: '📦' },
      { id: 'top', name: '上装', icon: '👔' },
      { id: 'bottom', name: '下装', icon: '👖' },
      { id: 'dress', name: '连衣裙', icon: '👗' },
      { id: 'outer', name: '外套', icon: '🧥' },
      { id: 'shoes', name: '鞋履', icon: '👟' },
      { id: 'accessory', name: '配饰', icon: '👜' }
    ],
    currentCategory: 'all',
    sortOptions: [
      { id: 'newest', name: '最新添加' },
      { id: 'oldest', name: '最早添加' },
      { id: 'name', name: '名称排序' },
      { id: 'color', name: '颜色排序' }
    ],
    currentSort: 'newest',
    currentSortName: '最新添加',
    searchKeyword: '',
    isLoading: false,
    hasMore: true,
    pageSize: 20,
    pageNum: 1,
    totalCount: 0,
    selectedItems: [],
    isSelectionMode: false,
    viewMode: 'grid' // grid | list
  },

  onLoad: function (options) {
    this.loadClothesList();
  },

  onShow: function () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      });
    }
  },

  onPullDownRefresh: function () {
    this.setData({
      pageNum: 1,
      hasMore: true
    }, () => {
      this.loadClothesList().then(() => {
        wx.stopPullDownRefresh();
      });
    });
  },

  onReachBottom: function () {
    if (this.data.hasMore && !this.data.isLoading) {
      this.loadMoreClothes();
    }
  },

  // 加载衣物列表
  loadClothesList: function () {
    this.setData({ isLoading: true });
    return new Promise((resolve, reject) => {
      // 构建查询条件
      let where = {};
      
      // 分类筛选
      if (this.data.currentCategory !== 'all') {
        where.category = this.data.currentCategory;
      }

      // 搜索关键词（本地模式不支持正则，使用简单包含）
      if (this.data.searchKeyword) {
        where.name = this.data.searchKeyword;
      }

      // 查询选项
      let options = {
        limit: this.data.pageSize,
        skip: 0
      };

      // 排序
      switch (this.data.currentSort) {
        case 'newest':
          options.orderBy = { field: 'createTime', order: 'desc' };
          break;
        case 'oldest':
          options.orderBy = { field: 'createTime', order: 'asc' };
          break;
        case 'name':
          options.orderBy = { field: 'name', order: 'asc' };
          break;
        case 'color':
          options.orderBy = { field: 'color', order: 'asc' };
          break;
      }

      db.query('clothing_items', where, options)
        .then(data => {
          // 本地搜索过滤
          let result = data;
          if (this.data.searchKeyword && !app.globalData.cloudInitialized) {
            const keyword = this.data.searchKeyword.toLowerCase();
            result = data.filter(item => 
              item.name && item.name.toLowerCase().includes(keyword)
            );
          }
          
          this.setData({
            clothesList: result,
            isLoading: false,
            hasMore: result.length === this.data.pageSize
          });
          resolve(result);
        })
        .catch(err => {
          console.error('加载衣物列表失败:', err);
          this.setData({ isLoading: false });
          app.handleError(err, '加载失败');
          reject(err);
        });
    });
  },

  // 加载更多
  loadMoreClothes: function () {
    if (this.data.isLoading) return;
    
    this.setData({
      isLoading: true,
      pageNum: this.data.pageNum + 1
    });

    let where = {};
    if (this.data.currentCategory !== 'all') {
      where.category = this.data.currentCategory;
    }

    const options = {
      limit: this.data.pageSize,
      skip: (this.data.pageNum - 1) * this.data.pageSize,
      orderBy: { field: 'createTime', order: 'desc' }
    };

    db.query('clothing_items', where, options)
      .then(data => {
        const newList = this.data.clothesList.concat(data);
        this.setData({
          clothesList: newList,
          isLoading: false,
          hasMore: data.length === this.data.pageSize
        });
      })
      .catch(err => {
        console.error('加载更多失败:', err);
        this.setData({ isLoading: false });
      });
  },

  // 分类切换
  onCategoryChange: function (e) {
    const { category } = e.detail;
    this.setData({
      currentCategory: category,
      pageNum: 1,
      hasMore: true
    }, () => {
      this.loadClothesList();
    });
  },

  // 排序切换
  onSortChange: function (e) {
    const index = e.detail.value;
    const sortOption = this.data.sortOptions[index];
    this.setData({
      currentSort: sortOption.id,
      currentSortName: sortOption.name,
      pageNum: 1,
      hasMore: true
    }, () => {
      this.loadClothesList();
    });
  },

  // 搜索
  onSearch: function (e) {
    const keyword = e.detail.value;
    this.setData({
      searchKeyword: keyword,
      pageNum: 1,
      hasMore: true
    }, () => {
      this.loadClothesList();
    });
  },

  // 清除搜索
  onClearSearch: function () {
    this.setData({
      searchKeyword: '',
      pageNum: 1,
      hasMore: true
    }, () => {
      this.loadClothesList();
    });
  },

  // 切换视图模式
  onToggleViewMode: function () {
    this.setData({
      viewMode: this.data.viewMode === 'grid' ? 'list' : 'grid'
    });
  },

  // 进入选择模式
  onEnterSelectionMode: function () {
    this.setData({ isSelectionMode: true });
  },

  // 退出选择模式
  onExitSelectionMode: function () {
    this.setData({
      isSelectionMode: false,
      selectedItems: []
    });
  },

  // 选择/取消选择
  onSelectItem: function (e) {
    const { id } = e.currentTarget.dataset;
    const selectedItems = this.data.selectedItems;
    const index = selectedItems.indexOf(id);
    
    if (index > -1) {
      selectedItems.splice(index, 1);
    } else {
      selectedItems.push(id);
    }
    
    this.setData({ selectedItems });
  },

  // 全选
  onSelectAll: function () {
    const allIds = this.data.clothesList.map(item => item._id);
    this.setData({ selectedItems: allIds });
  },

  // 批量删除
  onBatchDelete: function () {
    const { selectedItems } = this.data;
    if (selectedItems.length === 0) {
      wx.showToast({ title: '请先选择衣物', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedItems.length} 件衣物吗？`,
      success: (res) => {
        if (res.confirm) {
          this.batchDeleteItems(selectedItems);
        }
      }
    });
  },

  // 执行批量删除
  batchDeleteItems: function (ids) {
    // 逐个删除
    const deletePromises = ids.map(id => {
      return db.remove('clothing_items', id);
    });

    Promise.all(deletePromises)
      .then(() => {
        app.showSuccess('删除成功');
        this.setData({
          selectedItems: [],
          isSelectionMode: false
        });
        this.loadClothesList();
      })
      .catch(err => {
        console.error('批量删除失败:', err);
        app.handleError(err, '删除失败');
      });
  },

  // 点击衣物卡片
  onClothTap: function (e) {
    if (this.data.isSelectionMode) {
      this.onSelectItem(e);
      return;
    }

    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/wardrobe/detail?id=${id}`
    });
  },

  // 长按衣物卡片
  onClothLongPress: function (e) {
    if (!this.data.isSelectionMode) {
      this.setData({ isSelectionMode: true });
      this.onSelectItem(e);
    }
  },

  // 去上传页面
  onGoUpload: function () {
    wx.navigateTo({
      url: '/pages/upload/upload'
    });
  },

  // 分享
  onShareAppMessage: function () {
    return {
      title: '我的智能衣柜',
      path: '/pages/wardrobe/wardrobe'
    };
  }
});
