// components/loading/loading.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 加载文本
    text: {
      type: String,
      value: '加载中...'
    },
    // 加载类型
    type: {
      type: String,
      value: 'default' // default, spinner, dots
    },
    // 是否全屏
    fullScreen: {
      type: Boolean,
      value: false
    },
    // 是否显示遮罩
    mask: {
      type: Boolean,
      value: false
    },
    // 遮罩颜色
    maskColor: {
      type: String,
      value: 'rgba(0, 0, 0, 0.5)'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
});
