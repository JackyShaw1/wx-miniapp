// pages/linkForm/linkForm.js
Page({
  data: {
    companyName: '',
    nsrsbh: '',
    array: ['12个月', '24个月'],
    objectArray: [
      {
        id: 0,
        name: '12个月'
      },
      {
        id: 1,
        name: '24个月'
      }
    ],
    index: 0,
  },
  onLoad(query) {
    // let { nsrsbh, companyName } = query;
    // this.setData({ companyName: companyName, nsrsbh: nsrsbh });
  },
  formSubmit(e) {
    $Toast({
      content: '此功能还未开通'
    });
    console.log('form发生了submit事件，携带数据为：', e.detail.value);
  },
  bindPickerChange(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },
});
