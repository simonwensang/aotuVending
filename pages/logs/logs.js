//logs.js
const util = require('../../utils/util.js');
var app = getApp();

Page({
  data: {
    orderList: [],
    hasData:true
  },
   onPullDownRefresh: function(){
      wx.request({
      url: 'https://www.sangyiwen.top/order/wine/query;JSESSIONID='+wx.getStorageSync("sessionId"), 
      method:'POST',
      data: {
        
      },
      header: {
        'content-type': 'application/json' // 默认值
        },
      success: function(res) {
         wx.stopPullDownRefresh()
         console.log('order',res.data.code);
         if(res.data.code == 200){
           if(res.data.value.length == 0){
             t.setData({
               hasData:false
             })
           }
           !!res.data.value && res.data.value.forEach(function(name,index) {
             name.createTime = util.formatTime( new Date(name.createTime))
           }, this);
            t.setData({
              orderList: res.data.value
            })
         }else{
           wx.showToast({title:res.data.msg,icon:'none'})
         }
        }
    })
  },
  onShow: function () {
    wx.showLoading({title:'加载中...'})
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
        wx.hideLoading()
         console.log('order',res.data.code);
         if(res.data.code == 200){
           if(res.data.value.length == 0){
             t.setData({
               hasData:false
             })
           }
           !!res.data.value && res.data.value.forEach(function(name,index) {
             name.createTime = util.formatTime( new Date(name.createTime))
           }, this);
            t.setData({
              orderList: res.data.value
            })
         }else{
           wx.showToast({title:res.data.msg,icon:'none'})
         }
        }
    })
  }
})
