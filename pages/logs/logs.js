//logs.js
const util = require('../../utils/util.js');
var app = getApp();

Page({
  data: {
    orderList: [],
    hasData:true,
    runDate:0
  },
  requestOrder(){
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
         wx.stopPullDownRefresh();
         wx.hideLoading();
         console.log('order',res.data.code);
         if(res.data.code == 200){
           if(res.data.value.length == 0){
             t.setData({
               hasData:false
             })
           }
           !!res.data.value && res.data.value.forEach(function(name,index) {
              name.createTimeDtate = util.formatTime( new Date(name.createTime));
              Object.assign(name,{'payTime':60-(Date.parse(new Date()) - name.createTime)/1000});
              if(name.status == 1 && name.status != 6 && 60-(Date.parse(new Date()) - name.createTime)/1000 < 0){
                  name.status = 6
                }
           }, this);
            var getPayTime = function(){
              !!t.data.runDate && clearTimeout(t.data.runDate);
               t.data.runDate = setTimeout(function(){
                  !!res.data.value && res.data.value.forEach(function(name,index){
                    Object.assign(name,{'payTime':60-(Date.parse(new Date()) - name.createTime)/1000});
                    if(name.status == 1 && name.status != 6 && 60-(Date.parse(new Date()) - name.createTime)/1000 < 0){
                       name.status = 6
                    }
                  });
                   t.setData({
                      orderList: res.data.value
                    });
                    getPayTime()
               },1000);
             };
            !!res.data.value && res.data.value.forEach(function(name,index){
                if(name.status == 1){
                  //有待支付的订单，执行倒计时
                   getPayTime();
                }
            });
            t.setData({
              orderList: res.data.value
            })
         }else{
           wx.showToast({title:res.data.msg,icon:'none'})
         }
        }
    })
  },
   onPullDownRefresh: function(){
     this.requestOrder()
  },
  onHide(){
    //清除定时器
    !!this.data.runDate && clearTimeout(this.data.runDate);
  },
  toPay(e){
    let orderId = e.currentTarget.dataset.orderid,t = this;
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
                                            t.requestOrder()
                                          }                        
                                        })
                                        // t.showZanToast('付款成功，请取走您的美酒'); 
                                    },
                                    'fail':function(data){
                                       wx.showToast({title:data.errMsg,icon:'none'})
                                      //  t.showZanToast(data.errMsg); 
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
    this.requestOrder()
  },
  goIndex: function(){
    let path = encodeURIComponent('machineCode='+wx.getStorageSync("machineCode"))
    wx.reLaunch({
      url: "../index/index?scene=" + path
    })
  }
})
