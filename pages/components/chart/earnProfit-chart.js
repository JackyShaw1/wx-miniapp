import F2 from '@antv/wx-f2';
// require('../../../plugin/f2-all.min.js');

export default function earnProfitDrawChart(canvas, width, height, data) {
    let chart = null;
    chart = new F2.Chart({
        el: canvas,
        width,
        height
    });
    chart.source(data, {
        TAX_AMOUNT_3M: {
            tickCount: 5,
            min: 0
        },
        ROW_ID_1: {
            range: [0, 1],
            tickCount: 4
        }
    });

    chart.tooltip({
        showCrosshairs: true,
        showItemMarker: false,
        onShow: function onShow(ev) {
            var items = ev.items;
            items[0].name = null;
            items[0].value =  items[0].value;
        }
    });

    chart.axis('TAX_AMOUNT_3M', false);
    chart.axis('ROW_ID_1', false);
    chart.area().position('ROW_ID_1*TAX_AMOUNT_3M');
    chart.line().position('ROW_ID_1*TAX_AMOUNT_3M');
    chart.render();
}