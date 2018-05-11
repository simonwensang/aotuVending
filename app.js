App({
  onLaunch: function (path) {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log('code=====',res.code)
         wx.request({
          url: 'https://www.sangyiwen.top/login', 
          method:'GET',
          data: {
           code: res.code ,
          },
      header: {
        'content-type': 'application/json' // 默认值
        },
      success: function(res) {
        if(res.data.code == 200){
          //保存sessionId
          wx.setStorageSync("sessionId", res.data.value.sessionId)
        }else{
           wx.showToast({title:res.data.msg,icon:'none'})
        }
        }
    })
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  onShow:function(options){
      console.log('onShow======='+options.scene);
      if(options.scene == 1047 && options.scene == 1017){
        //不是扫描小程序码进去小程序的 提示扫描小程序码
        console.log('onshow======code');
        wx.showModal({
          title:'请扫码',
          content:'请扫描酒机上的小程序码进入小程序',
          showCancel:false,
          confirmText:'点击扫描',
          confirmColor:'#F3775D',
          success:function(res){
            if(res.confirm){
              wx.scanCode({
                onlyFromCamera: true,
                success: (res) => {
                 console.log('code===',res);
                 var path = res.path.split("?")[1];
                 wx.reLaunch({
                   url:'index?'+path
                 })
              }
            })
              }
          }
        })
      }
  },
  globalData: {
    userInfo: null
  }
})