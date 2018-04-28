//logs.js
const util = require('../../utils/util.js');
var app = getApp();

Page({
  data: {
    orderList: []
  },
  onLoad: function () {
    let t = this;
    wx.request({
      url: 'https://www.sangyiwen.top/order/wine/query;JSESSIONID='+wx.getStorageSync("sessionId"), 
      method:'POST',
      data: {
        
      },
      header: {
        'content-type': 'application/json' // 默认值
        },
      success: function(res) {
         console.log('order',res.data);
         t.setData({
           orderList: res.data.value
         })
        }
    })
  }
})
