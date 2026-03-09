// components/clothing-card/clothing-card.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 衣物图片
    image: {
      type: String,
      value: '/images/default-cloth.png'
    },
    // 衣物名称
    name: {
      type: String,
      value: '未命名'
    },
    // 分类
    category: {
      type: String,
      value: ''
    },
    // 颜色
    color: {
      type: String,
      value: ''
    },
    // 季节
    season: {
      type: String,
      value: ''
    },
    // 是否显示选中状态
    selected: {
      type: Boolean,
      value: false
    },
    // 是否显示删除按钮
    showDelete: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 分类映射
    categoryMap: {
      'top': '上装',
      'bottom': '下装',
      'dress': '连衣裙',
      'outer': '外套',
      'shoes': '鞋履',
      'accessory': '配饰'
    },
    // 季节映射
    seasonMap: {
      'spring': '春',
      'summer': '夏',
      'autumn': '秋',
      'winter': '冬'
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 点击卡片
    onTap: function () {
      this.triggerEvent('tap', {
        image: this.data.image,
        name: this.data.name,
        category: this.data.category
      });
    },

    // 长按卡片
    onLongPress: function () {
      this.triggerEvent('longpress', {
        image: this.data.image,
        name: this.data.name,
        category: this.data.category
      });
    },

    // 删除
    onDelete: function (e) {
      e.stopPropagation();
      this.triggerEvent('delete', {
        image: this.data.image,
        name: this.data.name,
        category: this.data.category
      });
    }
  }
});
