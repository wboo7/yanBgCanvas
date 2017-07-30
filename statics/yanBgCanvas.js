(function(){
    var defaults = {
        bubble:{
            scale:0.1
        },
        text:{
            text:'default',
            font:'bold 200px 微软雅黑',
            mass:6,
            doRadius:2,
            yOffset:50,
            start:'centerBottom' //.动画开始位置
        }
    };

    $.fn.yanBgCanvas = function(options){
        var $this = $(this);
        var width = $this.width();
        var height = $this.height();
        var z_index = 1;
        var theme;
        // Create canvas and set attributes
        var canvas            = document.createElement("canvas");
        var ctx               = canvas.getContext("2d");
        canvas.id             = "yanBgCanvas";
        canvas.width          = width;
        canvas.height         = height;
        canvas.style.zIndex   = z_index;
        canvas.style.position = "absolute";
        canvas.style.top      = 0;
        canvas.style.left      = 0;
        canvas.style.right      = 0;
        canvas.style.bottom      = 0;

        $(canvas).prependTo($this)

        if (typeof defaults[options.theme] != 'undefined') {
            theme = options.theme;
        }
        var effects = [];
        effects = $.extend(defaults[theme],options);

        var  requestFrame = window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };

        function bubble()
        {
            var animateHeader = true;
            function Circle() {
                var _this = this;

                // constructor
                (function() {
                    _this.pos = {};
                    init();

                })();

                function init() {
                    _this.pos.x = Math.random()*width;
                    _this.pos.y = height+Math.random()*100;
                    _this.alpha = 0.1+Math.random()*0.3;
                    _this.scale = effects.scale+Math.random()*0.3;
                    _this.velocity = Math.random();
                }

                this.draw = function() {
                    if(_this.alpha <= 0) {
                        init();
                    }
                    _this.pos.y -= _this.velocity;
                    _this.alpha -= 0.0005;
                    _this.scale += 0.0005;
                    ctx.beginPath();
                    ctx.arc(_this.pos.x, _this.pos.y, _this.scale*10, 0, 2 * Math.PI, false);
                    ctx.fillStyle = 'rgba(255,255,255,'+ _this.alpha+')';
                    ctx.fill();
                };
            }

            function animate() {
                if(animateHeader) {
                    ctx.clearRect(0,0,width,height);
                    for(var i in circles) {
                        circles[i].draw();
                    }
                }
                requestAnimationFrame(animate);
            }


            var circles = [];
            for(var x = 0; x < width*0.5; x++) {
                var c = new Circle();
                circles.push(c);
            }
            animate();


        }

        function text()
        {
            var animate_id ;
            var mass = effects.mass;
            var dotRadius = effects.doRadius;
            var text = effects.text;
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.font = effects.font;
            ctx.fillStyle='#000';
            ctx.fillText(text,canvas.width/2,canvas.height/2-effects.yOffset);
            var imageData = ctx.getImageData(0,0,canvas.width,canvas.height);

            // 缓动函数
            // t 当前时间
            // b 初始值
            // c 总位移
            // d 总时间
            var effectFunc = {
                easeInOutCubic: function (t, b, c, d) {
                    if ((t/=d/2) < 1) return c/2*t*t*t + b;
                    return c/2*((t-=2)*t*t + 2) + b;
                },
                easeInCirc: function (t, b, c, d) {
                    return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
                },
                easeOutQuad: function (t, b, c, d) {
                    return -c *(t/=d)*(t-2) + b;
                }
            }


            var startX,startY;
            switch (effects.start)
            {
                case 'leftTop':
                    startX = 0;
                    startY= 0;
                    break;
                case 'centerTop':
                    startX = canvas.width/2;
                    startY= 0;
                    break;
                case 'centerBottom':
                    startX = canvas.width/2;
                    startY= canvas.height;
                    break;
                case 'rightTop':
                    startX = canvas.width;
                    startY= 0;
                    break;
                case 'rightCenter':
                    startX = canvas.width;
                    startY= canvas.height/2;
                    break;
                case 'rightBottom':
                    startX = canvas.width;
                    startY= canvas.height;
                    break;
                case 'leftBottom':
                    startX = 0;
                    startY= canvas.height;
                    break;


            }

            function Dot(x,y,dotRadius)
            {
                var _this = this;
                _this.x = x;
                _this.y = y;
                _this.startX = startX;
                _this.startY = startY;
                _this.radius = 3;
                _this.currentFrame =0;
                _this.frameCount =Math.ceil(3000 / 16.66);
                _this.delay = this.frameCount*Math.random();
                _this.delayCount = 0;
            }

            var curX,curY;
            var effect = "easeInCirc";
            var finished = 0;

            Dot.prototype.draw = function(){

                ctx.save();
                ctx.beginPath();
                ctx.fillStyle='rgba(255,255,255,0.9)';
                if(this.currentFrame<this.frameCount)
                {
                    curX = effectFunc[effect](this.currentFrame, this.startX, this.x-this.startX, this.frameCount);
                    curY = effectFunc[effect](this.currentFrame, this.startY, this.y-this.startY, this.frameCount);

                    ctx.arc(curX, curY, this.radius, 0, 2*Math.PI);
                    this.currentFrame += 1;

                }
                else
                {
                    ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
                    finished += 1;
                }

                ctx.fill();
                ctx.restore();

            }
            var dotList = [];

            for(var x=0; x<imageData.width; x+=mass) {
                for(var y=0; y<imageData.height; y+=mass) {
                    var i = (y*imageData.width + x) * 4;
                    if(imageData.data[i+3] > 128 && imageData.data[i] < 100){
                        var dot = new Dot(x, y, dotRadius);
                        dotList.push(dot);
                    }
                }
            }


            function render()
            {
                ctx.clearRect(0,0,canvas.width,canvas.height);
                for(var i = 0;i<dotList.length;i++)
                {
                    var curDot = dotList[i];
                    if(curDot.delayCount < curDot.delay){
                        curDot.delayCount += 1;
                        continue;
                    }
                    curDot.draw();
                }

                animate_id = requestFrame(render);


            }
            render();





        }
        switch (theme)
        {
            case 'bubble':
                bubble();
                break;
            case 'text':
                text();
                break;
        }
    }
})();