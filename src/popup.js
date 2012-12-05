define(function(require, exports, module) {

    var $ = require('$');
    var Overlay = require('overlay');


    // Popup 是可触发 Overlay 型 UI 组件
    var Popup = Overlay.extend({

        attrs: {
            // 触发元素
            trigger: {
                value: null, // required
                getter: function(val) {
                    return $(val);
                }
            },

            // 触发类型
            triggerType: 'hover', // or click or focus

            // 默认的定位参数
            align: {
                baseXY: [0, '100%'],
                selfXY: [0, 0]
            },
 
            // 延迟触发和隐藏时间
            delay: 70,

            // 是否能够触发
            // 可以通过set('disabled', true)关闭
            disabled: false,

            // 基本的动画效果，可选 fade|slide
            effect: '',

            // 动画的持续时间
            duration: 250

        },

        setup: function() {
            Popup.superclass.setup.call(this);
            this._bindTrigger();
            this._blurHide(this.get('trigger'));
        },

        show: function() {
            if (this.get('disabled')) {
                return;
            }

            // 若从未渲染，则调用 render
            (!this.rendered) && this.render();

            var align = this.get('align');
            align.baseElement = this.activeTrigger;
            this.set('align', align);

            this.set('visible', true);
        },

        toggle: function() {
            this[this.get('visible') ? 'hide' : 'show']();
        },

        _bindTrigger: function() {
            var trigger = this.get('trigger');
            var triggerType = this.get('triggerType');
            var delay = this.get('delay');

            var showTimer, hideTimer;
            var that = this;

            if (triggerType === 'click') {
                trigger.on(triggerType, function(e) {
                    e.preventDefault();

                    // 标识当前点击的元素
                    that.activeTrigger = $(this);
                    that.toggle();
                });
            }
            else if (triggerType === 'focus') {
                trigger.on('focus', function() {
                    // 标识当前点击的元素
                    that.activeTrigger = $(this);
                    that.show();
                }).on('blur', function() {
                    setTimeout(function() {
                        (!that._downOnElement) && that.hide();
                        that._downOnElement = false;
                    }, delay);
                });;

                // 为了当input blur时能够选择和操作弹出层上的内容
                this.element.on('mousedown', function(e) {
                    that._downOnElement = true;
                });
            }
            // 默认是 hover
            else {
                trigger.hover(function() {
                    clearTimeout(hideTimer);

                    // 标识当前点击的元素
                    that.activeTrigger = $(this);
                    showTimer = setTimeout(function() {
                        that.show();
                    }, delay);
                }, leaveHandler);

                // 鼠标在悬浮层上时不消失
                this.element.hover(function() {
                    clearTimeout(hideTimer);
                }, leaveHandler);
            }

            function leaveHandler() {
                clearTimeout(showTimer);

                if (that.get('visible')) {
                    hideTimer = setTimeout(function() {
                        that.hide();
                    }, delay);
                }
            }
        },

        _onRenderVisible: function(val) {
            var fade = (this.get('effect').indexOf('fade') !== -1);
            var slide = (this.get('effect').indexOf('slide') !== -1);
            var animConfig = {};
            slide && (animConfig.height = (val ? 'show' : 'hide' ));
            fade && (animConfig.opacity = (val ? 'show' : 'hide' ));

            if (fade || slide) {
                this.element.animate(animConfig, this.get('duration'));
                this.element.css({
                    'visibility': 'visible'
                });
            } else {
                this.element[val ? 'show' : 'hide']();
            }
        }
    });

    module.exports = Popup;

});
