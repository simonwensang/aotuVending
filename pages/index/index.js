//获取应用实例
var app = getApp();
const util = require('../../utils/util.js');

console.log('app',app)
Page( {
  data: {
    shopList:[
      {
        id: '00',
        name: '五粮液52度',
        price: '100',
        stock:'3'
      }, 
      {
        id: '01',
        name: '五粮液56度',
        price: '130',
        stock:'2'
      },
      {
        id: '02',
        name: '五粮液60度',
        price: '160',
        stock:'1'
      },
      {
        id: '03',
        name: '五粮液10度',
        price: '660',
        stock:'0'
      }
    ],
    newShopList:[],
    machineIsOffLine:false,
    hasData:true,
    showBottomPopup: false,
    showPrice:0,
    initPrice:0,
    productId:1,
    showPic:'',
    machineCode:'',
    amountId:0,
    amount:10,
    base64:'',
    stepper: {
      stepper: 1,
      min: 1,
      max: 20
    },
  },
  onLoad: function (options) {
    let t = this;
    wx.showLoading({title:'加载中...'})
    // wx.request({
    //   url: 'https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=9_fv2O4Mu04dMBOwQkGU0vmgkRz0Ix_BVJTwMU95okfDvjuNuYIaRieGSToig0y-0vAHEhJpdWg2bXg5dQ_dRpwxUjUprQSv2aIz5DkuRrdB05xKq5DWLiXQKBDwYJHSiAEAXVG', //仅为示例，并非真实的接口地址
    //   method:'POST',
    //   data: {
    //     scene: "machineCode=123" ,
    //     page:"pages/index/index"
    //   },
    //   header: {
    //     'content-type': 'application/json' // 默认值
    //     },
    //   success: function(res) {
    //      t.setData({
    //        base64: 'data:image/png;base64,iVBORw0KGgo='+res.data
    //      })
 
    //     }
    // })


    //获取打开当前页面所调用的 query 参数
    console.log('onLoad========',options)
    // if(!options.scene){
      // 没有获取到机器码，提示用户扫描二维码
//       this.showZanDialog({
//   content: '请扫描取酒机小程序码进入小程序',
//   showCancel: true,
//   confirmText:'点击扫码',
//   confirmColor:'red'
// }).then(() => {
//   console.log('=== dialog ===', 'type: confirm');
//   wx.scanCode({success:function(){
    
//   }})
// }).catch(() => {
//   console.log('=== dialog ===', 'type: cancel');
// });

//     }
    console.log('options',options.scene)
    //获取用户信息异步执行函数
    app.userInfoReadyCallback = function(res){
        app.globalData.userInfo = res.userInfo
    }
    //请求商品列表接口
    var scene = decodeURIComponent(options.scene);
    if(options.scene){
      wx.setStorageSync("machineCode", scene.split('=')[1])
      this.setData({
        machineCode:scene.split('=')[1]
      })
      console.log('wx.getStorageSync("sessionid")',wx.getStorageSync("sessionId"))
      wx.request({
      url: 'https://www.sangyiwen.top/machine/getMachineInfo/'+t.data.machineCode, 
      method:'GET',
      header: {
        'content-type': 'application/json', // 默认值
        'cookie':'JSESSIONID='+wx.getStorageSync("sessionId")
        },
      success: function(res) {
        wx.hideLoading()
         console.log('lsit',res.data);
         if(res.data.code == 200){
           if(!!res.data.dataMap){
            t.setData({
              newShopList: res.data.dataMap.dropListODTOList,
              machineIsOffLine:!!res.data.dataMap.isOffLine
            })
           }else{
            t.setData({
              hasData: false
            })
           }
         }else{
           wx.showToast({title:res.data.msg,icon:'none'})
         }
        }
    })

      //判断是否有库存
      let newList = []
      this.data.shopList.forEach(function(name,index){
        name.stock == 0 ? Object.assign(name,{'hasStock':false}) : Object.assign(name,{'hasStock':true});
        newList.push(name)
      });
      this.setData({shopList:newList});
    }else{
      wx.showToast({title:'未获取到机器码',icon:'none'})
    }
    
  },
   toggleBottomPopup(res) {
    let t = this;
    this.setData({
      showBottomPopup: !this.data.showBottomPopup,
      showPrice:util.accMul(this.data.newShopList[res.currentTarget.dataset.index].salePrice,10),
      showPic:this.data.newShopList[res.currentTarget.dataset.index].image,
      productName:this.data.newShopList[res.currentTarget.dataset.index].productName,
      initPrice:this.data.newShopList[res.currentTarget.dataset.index].salePrice,
      productId:this.data.newShopList[res.currentTarget.dataset.index].id,
      skuId:this.data.newShopList[res.currentTarget.dataset.index].skuId,
    });

  },
   onPullDownRefresh: function(){
    wx.stopPullDownRefresh()
  },
  goBuy(){
    //关闭屏幕
    this.setData({
      showBottomPopup: !this.data.showBottomPopup
    })
    let orderCreat = 'https://www.sangyiwen.top/order/wine/create;JSESSIONID='+wx.getStorageSync("sessionId"),t=this;
    // console.log('order',orderCreat)
    wx.showLoading({
      title: '加载中',
    })
    //调用订单支付接口
     wx.request({
      url: orderCreat, 
      method:'POST',
      data: {
        skuId: t.data.skuId,
        machineCode: t.data.machineCode,
        sellerAmount:t.data.amount
      },
      header: {
        'content-type': 'application/json' // 默认值
        },
      success: function(res) {
         console.log('pay',res.data);
         if(res.data.code == 200){
            //支付
          let pay = 'https://www.sangyiwen.top/order/tenpay;JSESSIONID='+wx.getStorageSync("sessionId");
          // console.log(pay)
           wx.request({
              url: pay, //仅为示例，并非真实的接口地址
              method:'POST',
              data: {
                orderId: res.data.dataMap.orderNo,
              },
              header: {
                'content-type': 'application/json' // 默认值
                },
              success: function(res) {
                if(res.data.code == 200){
                  //  console.log('pay',res.data.value);
                let datasss = {
                  'timeStamp': res.data.dataMap.timeStamp,  
                  'nonceStr': res.data.dataMap.nonceStr,  
                  'package': res.data.dataMap.package,  
                  'signType': 'MD5',  
                  'paySign': res.data.dataMap.sign, 
                };
                                  // console.log('========',datasss)
                wx.requestPayment({  
                                    'timeStamp': res.data.dataMap.timeStamp,  
                                    'nonceStr': res.data.dataMap.nonceStr,  
                                    'package': res.data.dataMap.package,  
                                    'signType': 'MD5',  
                                    'paySign': res.data.dataMap.sign,  
                                    'success': function (succ) { 
                                         wx.hideLoading();
                                         wx.showModal({
                                          title:'提示',
                                          content:'付款成功，请取走您的美酒',
                                          showCancel:false,
                                          confirmText:'好的',
                                          confirmColor:'#4485c5',                          
                                        })
                                        // t.showZanToast('付款成功，请取走您的美酒'); 
                                    },
                                    'fail':function(data){
                                      wx.hideLoading();
                                       wx.showModal({
                                          title:'提示',
                                          content:'请稍后在订单页面支付，如果超过一分钟未支付，交易将被取消呦!',
                                          showCancel:false,
                                          confirmText:'好的',
                                          confirmColor:'#4485c5',                          
                                        })
                                      // wx.showToast({title:data.errMsg,icon:'none'})
                                      //  t.showZanToast(data.errMsg); 
                                    }
                                }) 
                }else{
                  wx.showToast({title:res.data.msg,icon:'none'})
                }
                }
            })
         }else{
           wx.showToast({title:res.data.msg,icon:'none'})
         }
        },
    })
  },
  changeAmount(e){
    console.log('btn',e.currentTarget);
    this.setData({
      skuId:e.currentTarget.dataset.id,
      showPrice:e.currentTarget.dataset.price
    });


  },
  getCost(e){
    console.log('cost===',e);
    this.setData({
      showPrice:util.accMul(e.detail.value,this.data.initPrice),
      amount:e.detail.value
    })
  },
  cancelBuy(){
    this.setData({
      showBottomPopup: false
    });
  }
  // handleZanStepperChange(e) {
  //   var componentId = e.componentId;
  //   var stepper = e.stepper;
  //   var currentPrice = this.data.initPrice*stepper;
  //   console.log('stepper',this)
  //   this.setData({
  //     [`${componentId}.stepper`]: stepper,
  //     showPrice:currentPrice
  //   });
  // }
})