(function( window , document ){

    'use strict';

    //给hotcss开辟个命名空间
    var hotcss = {};

    (function() {
        //根据devicePixelRatio自定计算scale
        //可以有效解决移动端1px。
        var viewportEl = document.querySelector('meta[name="viewport"]'),
            hotcssEl = document.querySelector('meta[name="hotcss"]'),
            dpr = window.devicePixelRatio || 1,
            maxWidth = 767,
            designWidth = 0;

        dpr = 1;

        //允许通过自定义name为hotcss的meta头，通过initial-dpr来强制定义页面缩放
        if (hotcssEl) {
            var hotcssCon = hotcssEl.getAttribute('content');
            if (hotcssCon) {
                var initialDprMatch = hotcssCon.match(/initial\-dpr=([\d\.]+)/);
                if (initialDprMatch) {
                    dpr = parseFloat(initialDprMatch[1]);
                }
                var maxWidthMatch = hotcssCon.match(/max\-width=([\d\.]+)/);
                if (maxWidthMatch) {
                    maxWidth = parseFloat(maxWidthMatch[1]);
                }
                var designWidthMatch = hotcssCon.match(/design\-width=([\d\.]+)/);
                if (designWidthMatch) {
                    designWidth = parseFloat(designWidthMatch[1]);
                }
            }
        }

        document.documentElement.setAttribute('data-dpr', dpr);
        hotcss.dpr = dpr;

        document.documentElement.setAttribute('max-width', maxWidth);
        hotcss.maxWidth = maxWidth;

        if( designWidth ){
            document.documentElement.setAttribute('design-width', designWidth);
        }
        hotcss.designWidth = designWidth; // 保证px2rem 和 rem2px 不传第二个参数时, 获取hotcss.designWidth是undefined导致的NaN

        var scale = 1 / dpr,
            content = 'width=device-width, initial-scale=' + scale + ', minimum-scale=' + scale + ', maximum-scale=' + scale + ', user-scalable=no';

        if (viewportEl) {
            viewportEl.setAttribute('content', content);
        } else {
            viewportEl = document.createElement('meta');
            viewportEl.setAttribute('name', 'viewport');
            viewportEl.setAttribute('content', content);
            document.head.appendChild(viewportEl);
        }

    })();

    hotcss.px2rem = function( px , designWidth ){
        //预判将会在JS中用到尺寸，提供一个方法在JS中将px转为rem。
        if( !designWidth ){
            //如果在JS中大量用到此方法，直接定义 hotcss.designWidth 来定义设计图尺寸;
            //第二个参数设计图是多大。
            designWidth = parseInt(hotcss.designWidth , 10);
        }

        return parseInt(px,10)*320/designWidth/20;
    }

    hotcss.rem2px = function( rem , designWidth ){
        //新增一个rem2px的方法。用法和px2rem一致。
        if( !designWidth ){
            designWidth = parseInt(hotcss.designWidth , 10);
        }
        //rem可能为小数，这里不再做处理了
        return rem*20*designWidth/320;
    }

    hotcss.mresize = function(){
        //给HTML设置font-size。
        var innerWidth = document.documentElement.getBoundingClientRect().width || window.innerWidth;

        if( hotcss.maxWidth && (innerWidth/hotcss.dpr > hotcss.maxWidth) ){
            innerWidth = hotcss.maxWidth*hotcss.dpr;
        }

        if( !innerWidth ){ return false;}

        document.documentElement.style.fontSize = ( innerWidth*20/320 ) + 'px';

        hotcss.callback && hotcss.callback();
        
    };

    hotcss.mresize(); 
    //直接调用一次

    window.addEventListener( 'resize' , function(){
        clearTimeout( hotcss.tid );
        hotcss.tid = setTimeout( hotcss.mresize , 33 );
    } , false ); 
    //绑定resize的时候调用

    window.addEventListener( 'load' , hotcss.mresize , false ); 
    //防止不明原因的bug。load之后再调用一次。


    setTimeout(function(){
        hotcss.mresize(); 
        //防止某些机型怪异现象，异步再调用一次
    },333)

    window.hotcss = hotcss; 
    //命名空间。


})( window , document );


//解决Android 手机下, input 或 textarea 元素聚焦时, 输入法遮盖输入框bug
function androidInputBugFix() {
    if (/Android/gi.test(navigator.userAgent)) {
        window.addEventListener('resize', function () {
            if (document.activeElement.tagName == 'INPUT' || document.activeElement.tagName == 'TEXTAREA') {
                window.setTimeout(function () {
                    document.activeElement.scrollIntoViewIfNeeded();
                }, 0);
            }
        })
    }
};
androidInputBugFix();