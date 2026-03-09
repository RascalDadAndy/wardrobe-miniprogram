// components/category-filter/category-filter.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 分类列表
    categories: {
      type: Array,
      value: []
    },
    // 当前选中的分类
    current: {
      type: String,
      value: 'all'
    },
    // 是否显示全部选项
    showAll: {
      type: Boolean,
      value: true
    },
    // 全部选项的名称
    allText: {
      type: String,
      value: '全部'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    scrollLeft: 0
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached: function () {
      // 如果显示全部选项，在categories开头添加
      if (this.properties.showAll && this.properties.categories.length > 0) {
        const hasAll = this.properties.categories.some(item => item.id === 'all');
        if (!hasAll) {
          const categories = [
            { id: 'all', name: this.properties.allText },
            ...this.properties.categories
          ];
          this.setData({ categories });
        }
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 选择分类
    onSelect: function (e) {
      const { id } = e.currentTarget.dataset;
      
      if (id === this.properties.current) return;
      
      this.triggerEvent('change', {
        category: id
      });
      
      // 滚动到可见区域
      this.scrollToItem(e.currentTarget);
    },

    // 滚动到指定元素
    scrollToItem: function (target) {
      const query = this.createSelectorQuery();
      query.select('.category-filter').boundingClientRect();
      query.selectViewport().scrollOffset();
      query.exec((res) => {
        const filterRect = res[0];
        const targetRect = target.getBoundingClientRect();
        
        // 计算滚动位置
        const scrollLeft = targetRect.left - filterRect.left - filterRect.width / 2 + targetRect.width / 2;
        
        this.setData({
          scrollLeft: Math.max(0, scrollLeft)
        });
      });
    }
  }
});
