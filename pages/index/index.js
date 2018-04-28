var Zan = require('../../bower_components/zanui-weapp/dist/index');
const { Dialog,Toast } = require('../../bower_components/zanui-weapp/dist/index');
//获取应用实例
var app = getApp();
console.log('app',app)

Page(Object.assign({}, Zan.Stepper,Toast, {
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
    showBottomPopup: false,
    showPrice:0,
    initPrice:0,
    skuId:1,
    showPic:'',
    machineCode:'',
    amountId:0,
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
    console.log('scene',scene)
    if(options.scene){
      this.setData({
        machineCode:scene.split('=')[1]
      })
      wx.request({
      url: 'https://www.sangyiwen.top/machine/query', 
      method:'POST',
      data: {
        machineCode: !!t.data.machineCode ? t.data.machineCode : '123',
      },
      header: {
        'content-type': 'application/json' // 默认值
        },
      success: function(res) {
        wx.hideLoading()
         console.log('lsit',res.data);
         if(res.data.code == 200){
            t.setData({
              newShopList: res.data.value.productVoList
           })
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
     console.log('e',res)
     let t = this;
    this.setData({
      showBottomPopup: !this.data.showBottomPopup,
      initPrice:res.currentTarget.dataset.index+1 ? this.data.newShopList[res.currentTarget.dataset.index].salePrice : '',
      showPrice:res.currentTarget.dataset.index+1 ? this.data.newShopList[res.currentTarget.dataset.index].skuVoList[0].price : '',
      skuId:res.currentTarget.dataset.index+1 ? this.data.newShopList[res.currentTarget.dataset.index].skuVoList[0].id : '',
      stepper:res.currentTarget.dataset.index+1 ? Object.assign(t.data.stepper,{max:t.data.newShopList[res.currentTarget.dataset.index].remainder}) : t.data.stepper,
      stepper:res.currentTarget.dataset.index+1 ? Object.assign(t.data.stepper,{stepper:1}) : t.data.stepper,
      wineSaleAmountVoList:res.currentTarget.dataset.index+1 ? this.data.newShopList[res.currentTarget.dataset.index].skuVoList : '',
      showPic:res.currentTarget.dataset.index+1 ? this.data.newShopList[res.currentTarget.dataset.index].imageUrl : '',
    });

  },
  goBuy(){
    //关闭屏幕
    this.setData({
      showBottomPopup: !this.data.showBottomPopup
    })
    let orderCreat = 'https://www.sangyiwen.top/order/wine/create;JSESSIONID='+wx.getStorageSync("sessionId"),t=this;
    console.log('order',orderCreat)
    //调用订单支付接口
     wx.request({
      url: orderCreat, 
      method:'POST',
      data: {
        skuId: t.data.skuId,
        machineCode: !!t.data.machineCode ? t.data.machineCode : '123',
        amount:'1'
      },
      header: {
        'content-type': 'application/json' // 默认值
        },
      success: function(res) {
         console.log('pay',res.data);
         if(res.data.code == 200){
            //支付
          let pay = 'https://www.sangyiwen.top/order/tenpay;JSESSIONID='+wx.getStorageSync("sessionId");
          console.log(pay)
           wx.request({
              url: pay, //仅为示例，并非真实的接口地址
              method:'POST',
              data: {
                orderId: res.data.value.orderNo,
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
                                        t.showZanToast('付款成功，请取走您的美酒'); 
                                    },  
                                    'fail': function (err) {  
                                        // fail&&fail(err);  
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
}))