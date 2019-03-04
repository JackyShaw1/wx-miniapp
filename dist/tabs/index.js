
var _my$getSystemInfoSync = wx.getSystemInfoSync(),
  windowWidth = _my$getSystemInfoSync.windowWidth;

Component({
    externalClasses: ['i-class'],

    relations: {
        '../tab/index': {
            type: 'child',
            linked () {
                this.changeCurrent();
            },
            linkChanged () {
                this.changeCurrent();
            },
            unlinked () {
                this.changeCurrent();
            }
        }
    },

    properties: {
        current: {
            type: String,
            value: '',
            observer: 'changeCurrent'
        },
        color: {
            type: String,
            value: ''
        },
        scroll: {
            type: Boolean,
            value: false
        },
        fixed: {
            type: Boolean,
            value: false
        },
        tabs: {
          type: Array,
          value: []
        }
    },
    data: {
      windowWidth: windowWidth,
      tabWidth: 0.25,
      autoplay: false,
      animation: false
    },
    lifetimes: {
      attached: function () {
        var tabs = this.properties.tabs;
        this.setData({
          tabWidth: tabs.length > 3 ? 0.25 : 1 / tabs.length,
          animation: true,
          autoplay: true
        });
      },
      moved: function () { },
      detached: function () { },
    },

    methods: {
        changeCurrent (val = this.data.current) {
            let items = this.getRelationNodes('../tab/index');
            const len = items.length;

            if (len > 0) {
                items.forEach(item => {
                    item.changeScroll(this.data.scroll);
                    item.changeCurrent(item.data.key === val);
                    item.changeCurrentColor(this.data.color);
                });
            }
        },
        emitEvent (key) {
            this.triggerEvent('change', { key });
        }
    }
});
