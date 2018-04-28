//logs.js
const util = require('../../utils/util.js');
var app = getApp();

Page({
  data: {
    orderList: [],
    hasData:true
  },
   onPullDownRefresh: function(){
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
  toPay(e){
    let orderId = e.currentTarget.dataset.orderid;
       console.log('fffff',orderId);
         //支付
          let pay = 'https://www.sangyiwen.top/order/tenpay;JSESSIONID='+wx.getStorageSync("sessionId");
          console.log(pay)
           wx.request({
              url: pay, //仅为示例，并非真实的接口地址
              method:'POST',
              data: {
                orderId: orderId,
              },
              header: {
                'content-type': 'application/json' // 默认值
                },
              success: function(res) {
                if(res.data.code == 200){
                   console.log('pay',res.data.value);
                let datasss = {
                  'timeStamp': res.data.value.timeStamp,  
                                    'nonceStr': res.data.value.nonceStr,  
                                    'package': res.data.value.package,  
                                    'signType': 'MD5',  
                                    'paySign': res.data.value.sign, 
                };
                                  console.log('========',datasss)
                wx.requestPayment({  
                                    'timeStamp': res.data.value.timeStamp,  
                                    'nonceStr': res.data.value.nonceStr,  
                                    'package': res.data.value.package,  
                                    'signType': 'MD5',  
                                    'paySign': res.data.value.sign,  
                                    'success': function (succ) {  
                                         wx.showModal({
                                          title:'提示',
                                          content:'付款成功，请取走您的美酒',
                                          showCancel:false,
                                          confirmText:'好的',
                                          confirmColor:'#4485c5',  
                                          success:function(res){
                                            wx.reLaunch({
                                              url: 'logs'
                                            })
                                          }                        
                                        })
                                        // t.showZanToast('付款成功，请取走您的美酒'); 
                                    },
                                    'fail':function(data){
                                       t.showZanToast(data.errMsg); 
                                    }
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
