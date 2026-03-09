// utils/db.js - 数据库操作封装（支持云开发和本地存储）

const app = getApp();

/**
 * 数据库操作类
 * 自动判断使用云开发还是本地存储
 */
class Database {
  constructor() {
    this.isCloud = false;
    this.db = null;
    this.init();
  }

  // 初始化
  init() {
    const globalData = app.globalData;
    if (globalData && globalData.cloudInitialized) {
      this.isCloud = true;
      this.db = wx.cloud.database();
      console.log('使用云开发数据库');
    } else {
      this.isCloud = false;
      console.log('使用本地存储模式');
    }
  }

  /**
   * 添加数据
   * @param {string} collection 集合名
   * @param {Object} data 数据对象
   * @returns {Promise}
   */
  add(collection, data) {
    return new Promise((resolve, reject) => {
      // 添加时间戳
      const item = {
        ...data,
        _id: data._id || this.generateId(),
        createTime: new Date(),
        updateTime: new Date()
      };

      if (this.isCloud) {
        // 云开发模式
        this.db.collection(collection).add({
          data: item,
          success: res => {
            resolve({ _id: res._id, ...item });
          },
          fail: err => {
            console.error('云开发添加失败，切换到本地:', err);
            this.addToLocal(collection, item).then(resolve).catch(reject);
          }
        });
      } else {
        // 本地存储模式
        this.addToLocal(collection, item).then(resolve).catch(reject);
      }
    });
  }

  /**
   * 本地存储添加
   */
  addToLocal(collection, item) {
    return new Promise((resolve, reject) => {
      try {
        const key = `db_${collection}`;
        let list = wx.getStorageSync(key) || [];
        list.push(item);
        wx.setStorageSync(key, list);
        resolve(item);
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * 查询数据
   * @param {string} collection 集合名
   * @param {Object} where 查询条件
   * @param {Object} options 选项（limit, skip, orderBy）
   * @returns {Promise<Array>}
   */
  query(collection, where = {}, options = {}) {
    return new Promise((resolve, reject) => {
      if (this.isCloud) {
        // 云开发模式
        let query = this.db.collection(collection).where(where);
        
        // 排序
        if (options.orderBy) {
          query = query.orderBy(options.orderBy.field, options.orderBy.order);
        } else {
          query = query.orderBy('createTime', 'desc');
        }
        
        // 分页
        if (options.skip) {
          query = query.skip(options.skip);
        }
        if (options.limit) {
          query = query.limit(options.limit);
        }

        query.get({
          success: res => {
            resolve(res.data);
          },
          fail: err => {
            console.error('云开发查询失败，切换到本地:', err);
            this.queryFromLocal(collection, where, options).then(resolve).catch(reject);
          }
        });
      } else {
        // 本地存储模式
        this.queryFromLocal(collection, where, options).then(resolve).catch(reject);
      }
    });
  }

  /**
   * 本地存储查询
   */
  queryFromLocal(collection, where, options) {
    return new Promise((resolve) => {
      const key = `db_${collection}`;
      let list = wx.getStorageSync(key) || [];
      
      // 筛选
      if (Object.keys(where).length > 0) {
        list = list.filter(item => {
          for (let key in where) {
            if (item[key] !== where[key]) {
              return false;
            }
          }
          return true;
        });
      }
      
      // 排序（默认按创建时间倒序）
      list.sort((a, b) => {
        const timeA = a.createTime ? new Date(a.createTime).getTime() : 0;
        const timeB = b.createTime ? new Date(b.createTime).getTime() : 0;
        return timeB - timeA;
      });
      
      // 分页
      if (options.skip) {
        list = list.slice(options.skip);
      }
      if (options.limit) {
        list = list.slice(0, options.limit);
      }
      
      resolve(list);
    });
  }

  /**
   * 获取单条数据
   * @param {string} collection 集合名
   * @param {string} id 数据ID
   * @returns {Promise<Object>}
   */
  getById(collection, id) {
    return new Promise((resolve, reject) => {
      if (this.isCloud) {
        this.db.collection(collection).doc(id).get({
          success: res => {
            resolve(res.data);
          },
          fail: err => {
            this.getByIdFromLocal(collection, id).then(resolve).catch(reject);
          }
        });
      } else {
        this.getByIdFromLocal(collection, id).then(resolve).catch(reject);
      }
    });
  }

  /**
   * 本地存储获取单条
   */
  getByIdFromLocal(collection, id) {
    return new Promise((resolve, reject) => {
      const key = `db_${collection}`;
      const list = wx.getStorageSync(key) || [];
      const item = list.find(item => item._id === id);
      if (item) {
        resolve(item);
      } else {
        reject(new Error('数据不存在'));
      }
    });
  }

  /**
   * 更新数据
   * @param {string} collection 集合名
   * @param {string} id 数据ID
   * @param {Object} data 更新数据
   * @returns {Promise}
   */
  update(collection, id, data) {
    return new Promise((resolve, reject) => {
      const updateData = {
        ...data,
        updateTime: new Date()
      };

      if (this.isCloud) {
        this.db.collection(collection).doc(id).update({
          data: updateData,
          success: res => {
            resolve(res);
          },
          fail: err => {
            this.updateToLocal(collection, id, updateData).then(resolve).catch(reject);
          }
        });
      } else {
        this.updateToLocal(collection, id, updateData).then(resolve).catch(reject);
      }
    });
  }

  /**
   * 本地存储更新
   */
  updateToLocal(collection, id, data) {
    return new Promise((resolve, reject) => {
      try {
        const key = `db_${collection}`;
        let list = wx.getStorageSync(key) || [];
        const index = list.findIndex(item => item._id === id);
        if (index !== -1) {
          list[index] = { ...list[index], ...data };
          wx.setStorageSync(key, list);
          resolve(list[index]);
        } else {
          reject(new Error('数据不存在'));
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * 删除数据
   * @param {string} collection 集合名
   * @param {string} id 数据ID
   * @returns {Promise}
   */
  remove(collection, id) {
    return new Promise((resolve, reject) => {
      if (this.isCloud) {
        this.db.collection(collection).doc(id).remove({
          success: res => {
            resolve(res);
          },
          fail: err => {
            this.removeFromLocal(collection, id).then(resolve).catch(reject);
          }
        });
      } else {
        this.removeFromLocal(collection, id).then(resolve).catch(reject);
      }
    });
  }

  /**
   * 本地存储删除
   */
  removeFromLocal(collection, id) {
    return new Promise((resolve, reject) => {
      try {
        const key = `db_${collection}`;
        let list = wx.getStorageSync(key) || [];
        const index = list.findIndex(item => item._id === id);
        if (index !== -1) {
          list.splice(index, 1);
          wx.setStorageSync(key, list);
          resolve({ removed: true });
        } else {
          reject(new Error('数据不存在'));
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * 生成唯一ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  /**
   * 获取数量
   * @param {string} collection 集合名
   * @param {Object} where 查询条件
   * @returns {Promise<number>}
   */
  count(collection, where = {}) {
    return new Promise((resolve) => {
      this.query(collection, where).then(list => {
        resolve(list.length);
      }).catch(() => {
        resolve(0);
      });
    });
  }
}

// 导出单例
const db = new Database();

module.exports = db;
