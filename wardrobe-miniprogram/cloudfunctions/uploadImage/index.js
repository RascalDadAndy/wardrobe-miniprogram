// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 云函数入口函数
exports.main = async (event, context) => {
  const { fileID } = event;
  
  try {
    // 获取图片临时链接
    const result = await cloud.getTempFileURL({
      fileList: [fileID]
    });
    
    return {
      code: 0,
      message: 'success',
      data: {
        tempFileURL: result.fileList[0].tempFileURL,
        fileID: result.fileList[0].fileID
      }
    };
  } catch (err) {
    return {
      code: -1,
      message: err.message,
      data: null
    };
  }
};
