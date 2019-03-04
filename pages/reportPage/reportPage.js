import F2 from '@antv/wx-f2';
import mangerDrawChart from '../components/chart/manger-chart'
import earnProfitDrawChart from '../components/chart/earnProfit-chart'
import growUpDrawChart from '../components/chart/growUp-chart'
import dashBoardChart from '../components/chart/dashBoard-chart02'

Page({
  data: {
    dataObj: {
      baseInfo: null, // 基础数据
      scoreInfo: null,
      manger: null, // 经营稳定性评价
      earnProfit: null, // 获利能力评价
      performance: null, // 履约意愿评价
      growUp: null // 成长能力评价
    },
    creditRating: {
      rating: '',
      paraphrase: ''
    },
    earnProfitText: '', // 获利能力评价语
    growUpText: '', // 成长能力评价语;
    earnProfitDisplay: true,
    growUpDisplay: true,
    opts: {
      lazyLoad: true // 延迟加载组件
    },
    requestData: null // 异步请求获取的数据
  },
  onLoad(query) { // 页面加载
    let { nsrsbh } = query;
    this.setData({ nsrsbh: nsrsbh});
    // 根据纳税识别号获取企业报告信息
    let that = this;
    wx.getStorage({
      key: 'reportData',
      success: function (res) {
        let data = res.data;
        let {
          baseInfo,
          scoreInfo,
          manger,
          earnProfit,
          performance,
          growUp
        } = data.dataObj[nsrsbh];
        that.setData({
          dataObj: {
            baseInfo: baseInfo, // 基础数据
            scoreInfo: scoreInfo, // 评分
            manger: manger, // 经营稳定性评价
            earnProfit: earnProfit, // 获利能力评价
            performance: performance, // 履约意愿评价
            growUp: growUp, // 成长能力评价
          }
        });
        console.log(that.data.dataObj);
      },
      fail: function (res) {
        wx.alert({ title: '读取缓存失败', content: res });
      }
    })
  },
  computingMode(list) {
    /*
      return:
      0: 数据有问题;
      1: 数据下降
      2: 数据上升
      3: 数据稳定
     */
    if (list.length === 8) {
      let num01 = list[0], num02 = list[1], num03 = list[2], num04 = list[3], num05 = list[4], num06 = list[5], num07 = list[6], num08 = list[7];
      if ((num08 + num07 + num07 + num07) - (num01 + num02 + num03 + num04) < 0) { // 下降
        return 1;
      } else if ((num07 + num08) >= (num05 + num06) && (num05 + num06) >= (num03 + num04) && (num03 + num04) >= (num01 + num02)) { // 上升
        return 2;
      } else { // 稳定
        return 3;
      }

    } else {
      return 0;
    }
  },
  onReady() {
    let that = this;
    let ePList = this.data.dataObj.earnProfit;
    let gUList = this.data.dataObj.growUp;
    let ePListNew = [], gUListNew = [];
    ePList.forEach((val) => {
      ePListNew.push(val['TAX_AMOUNT_3M'])
    });
    gUList.forEach((val) => {
      gUListNew.push(val['SALES_AMOUNT_3M']);
    });
    let ePStatusValue = this.computingMode(ePListNew);
    if (ePStatusValue === 1) {
      this.setData({ earnProfitText: '企业获利能力下降，请及时调整' });
    } else if (ePStatusValue === 2) {
      this.setData({ earnProfitText: '企业获利能力持续提高，请继续保持' });
    } else if (ePStatusValue === 3) {
      this.setData({ earnProfitText: '企业获利能力保持稳定，请注意防范潜在风险' });
    } else {
      this.setData({ earnProfitText: '企业正处于初创阶段，获利能力有待观察', earnProfitDisplay: false });
    }

    let gUStatusValue = this.computingMode(gUListNew);
    if (gUStatusValue === 1) {
      this.setData({ growUpText: '成长能力有待提高，请及时调整.' });
    } else if (gUStatusValue === 2) {
      this.setData({ growUpText: '企业成长能力持续提高，请继续保持' });
    } else if (gUStatusValue === 3) {
      this.setData({ growUpText: '企业成长能力保持稳定，请注意防范异常情况' });
    } else {
      this.setData({ growUpText: '企业正处于初创阶段，成长能力有待观察', growUpDisplay: false });
    }


    /************************ 仪表盘 图表*********************/
    {
      let { score, curDate } = this.data.dataObj.scoreInfo;
      if (typeof score === 'number' && !isNaN(score)) {
        let newScore = (score * 100).toFixed(2);
        let pointerText = '';
        let paraphrase = '';
        if (newScore < 51.6) {
          newScore = 51.6;
          pointerText = 'A';
          paraphrase = '企业信用等级一般';
        } else if (newScore >= 51.6 && newScore < 57.8) {
          pointerText = 'A';
          paraphrase = '企业信用等级一般';
        } else if (newScore >= 57.8 && newScore < 65) {
          pointerText = 'AA';
          paraphrase = '企业信用等级良好';
        } else if (newScore >= 65 && newScore < 72.3) {
          pointerText = 'AAA';
          paraphrase = '企业信用等级较好';
        } else if (newScore >= 72.3 && newScore < 81.2) {
          pointerText = 'AAAA';
          paraphrase = '企业信用等级很好';
        } else if (newScore >= 81.2) {
          pointerText = 'AAAAA';
          paraphrase = '企业信用等级极好';
        }

        that.setData({
          creditRating: {
            rating: pointerText,
            paraphrase: paraphrase
          }
        });

        let data = [{
          pointer: pointerText,
          curDate: curDate,
          value: newScore,
          length: 2,
          y: 1.05
        }];
        this.selectComponent('#dashBored-chart').init((canvas, width, height) => {
          dashBoardChart(canvas, width, height, data);
        });
      }
    }
    
    /************************ 经营稳定 图表*********************/
    {
      let sold = parseInt(that.data.dataObj.manger.KYNX);
      let genre = '';
      if (sold >= 7) {
        genre = '企业经营稳定极好';
      } else if (sold >= 5 && sold < 7) {
        genre = '企业经营稳定很好';
      } else if (sold >= 3 && sold < 5) {
        genre = '企业经营稳定较好';
      } else if (sold >= 2 && sold < 3) {
        genre = '企业经营稳定良好';
      } else if (sold < 2) {
        genre = '企业经营稳定一般';
      }

      let data = [{
        genre: genre,
        sold: sold
      }];
      this.selectComponent('#manger-shapeChart').init((canvas, width, height) => {
        mangerDrawChart(canvas, width, height, data);
      });
     
    }
   

    /************************ 获利能力 图表*********************/
    {
      if (that.data.earnProfitDisplay) {
        let data = that.data.dataObj.earnProfit;
        this.selectComponent('#earnProfit-lineChart').init((canvas, width, height) => {
          earnProfitDrawChart(canvas, width, height, data);
        });
      }
    }
    /************************ 履约意见评价 图表*********************/
    {
      let sold = 0;
      let genre = '';
      let performance = that.data.dataObj.performance;
      if (performance == null) {
        sold = 5;
        genre = '履约意愿极好';
      } else {
        let wfwz_count = performance.wfwz_count;
        if (wfwz_count == 0) {
          sold = 5;
          genre = '履约意愿极好';
        } else if (wfwz_count > 0 && wfwz_count <= 3) {
          sold = 4;
          genre = '履约意愿很好';
        } else if (wfwz_count > 3 && wfwz_count <= 5) {
          sold = 3;
          genre = '履约意愿较好';
        } else if (wfwz_count > 5 && wfwz_count <= 7) {
          sold = 2;
          genre = '履约意愿良好';
        } else if (wfwz_count > 7) {
          sold = 1;
          genre = '履约意愿有待提高';
        }
      }

      let data = [{
        genre: genre,
        sold: sold
      }];
      this.selectComponent('#performance-shapeChart').init((canvas, width, height) => {
        mangerDrawChart(canvas, width, height, data);
      });
    }
   

    /************************ 成长能力 图表*********************/
    { 
      
        if (this.data.growUpDisplay) {
          let data = that.data.dataObj.growUp;
          this.selectComponent('#growUp-lineChart').init((canvas, width, height) => {
            growUpDrawChart(canvas, width, height, data);
          });
        }
    }
    

  },
  touchStart(e) {
    if (this.canvas) {
      this.canvas.emitEvent('touchstart', [e]);
    }
  },
  touchMove(e) {
    if (this.canvas) {
      this.canvas.emitEvent('touchmove', [e]);
    }
  },
  touchEnd(e) {
    if (this.canvas) {
      this.canvas.emitEvent('touchend', [e]);
    }
  },
  onShow() {


  }

});