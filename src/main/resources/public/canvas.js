//初期値（サイズ、色、アルファ値、マウス）の決定
var size = 5;
var color = "#555555";
var alpha = 1.0;

var canvas = document.getElementById("main_canvas");
var ctx = canvas.getContext('2d');

var locations = new Array();

var selectId;

// canvas初期化
clearCanvas();

// イベントリスナ
canvas.addEventListener('mousemove', function (e) {
    if (e.buttons === 1 || e.witch === 1) {
        var rect = e.target.getBoundingClientRect();
        var X = ~~(e.clientX - rect.left);
        var Y = ~~(e.clientY - rect.top);
        sendDraw("paint", size, color, alpha, X, Y);
    }
}, false);
canvas.addEventListener('mousedown', function (e) {
    if (e.button === 0) {
        var rect = e.target.getBoundingClientRect();
        var X = ~~(e.clientX - rect.left);
        var Y = ~~(e.clientY - rect.top);
        clickProcess(X, Y);
    }
}, false);
canvas.addEventListener('mouseup', sendDrawEnd, false);
canvas.addEventListener('mouseout', sendDrawEnd, false);

if (window.TouchEvent) {
    canvas.addEventListener('touchstart', function (e) {
        var touches = e.touches.item(0);
        var rect = e.target.getBoundingClientRect();
        var X = ~~(touches.clientX - rect.left);
        var Y = ~~(touches.clientY - rect.top);
        clickProcess(X, Y);
    }, false);
    canvas.addEventListener('touchmove', function (e) {
        e.preventDefault();
        var touches = e.touches.item(0);
        var rect = e.target.getBoundingClientRect();
        var X = ~~(touches.clientX - rect.left);
        var Y = ~~(touches.clientY - rect.top);
        sendDraw("paint", size, color, alpha, X, Y);
    }, false);
    canvas.addEventListener('touchend', sendDrawEnd, false);
    canvas.addEventListener('touchcancel', sendDrawEnd, false);
}

function sendDrawEnd() {
    sendDraw("paint", "DrawEnd");
}

function clickProcess(X, Y) {
    if (selectId != undefined) {
        switch (selectId) {
            case "spoit":
                var spoitImage = ctx.getImageData(X, Y, 1, 1);
                colorInput.value = '#' + (((256 + spoitImage.data[0] << 8) + spoitImage.data[1] << 8) + spoitImage.data[2]).toString(16).slice(1);
                onInputColor();
                break;
            case "fill":
                sendDraw("fill", 0, color, alpha, X, Y);
                break;
        }
        toggleSelectable(undefined);
    } else {
        sendDraw("paint", size, color, alpha, X, Y);
    }
}

function toggleSelectable(id) {
    var list = document.getElementsByClassName("selectable");
    for (var i = 0; i < list.length; i++) {
        list[i].style.border = "1px solid #dddddd";
    }
    if (id != undefined) document.getElementById(id).style.border = "1px solid #00BFFF";
    selectId = id;
}

function draw(sessionId, Size, Color, Alpha, X, Y) {
    ctx.beginPath();
    ctx.globalAlpha = Alpha;
    ctx.strokeStyle = Color;
    if (locations[sessionId] == undefined) {
        locations[sessionId] = new Object();
    }
    var location = locations[sessionId];
    location.X1 = location.X1 || X;
    location.Y1 = location.Y1 || Y;
    ctx.lineWidth = Size;
    ctx.lineCap = 'round';
    ctx.moveTo(location.X1, location.Y1);
    ctx.lineTo(X, Y);
    ctx.stroke();
    location.X1 = X;
    location.Y1 = Y;
    ctx.fill();
}

function drawEnd(sessionId) {
    if (locations[sessionId] == undefined) {
        locations[sessionId] = new Object();
    }
    var location = locations[sessionId];
    location.X1 = "";
    location.Y1 = "";
}

function removeDraw(sessionId) {
    locations[sessionId] = undefined;
}

function clearCanvas() {
    ctx.beginPath();
    ctx.fillStyle = "#f5f5f5";
    ctx.globalAlpha = 1.0;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function createCoverCanvas(className) {
    var list = document.getElementsByClassName(className);
    for (var i = 0; i < list.length; i++) {
        list[i].parentNode.removeChild(list[i]);
    }
    var element = document.createElement("canvas");
    element.setAttribute("class", className + " coverCanvas");
    element.style.zIndex = document.getElementsByClassName("coverCanvas").length;
    element.width = canvas.width;
    element.height = canvas.height;
    var context2D = element.getContext("2d");
    context2D.beginPath();
    context2D.fillStyle = "#555555";
    context2D.globalAlpha = 0.5;
    context2D.fillRect(0, 0, element.width, element.height);
    return element;
}

document.onkeydown = function (e) {
    if (e.keyCode == 27) {
        var list = document.getElementsByClassName("specialCanvas");
        for (var i = 0; i < list.length; i++) {
            list[i].parentNode.removeChild(list[i]);
        }
        toggleSelectable(undefined);
    }
};

document.getElementById("downloadPng").addEventListener("click", openCanvasPng, false);

function openCanvasPng() {
    var type = 'image/png';
    var bin = atob(canvas.toDataURL(type).split(',')[1]);
    var buffer = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) {
        buffer[i] = bin.charCodeAt(i);
    }
    window.open(window.URL.createObjectURL(new Blob([buffer.buffer], {type: type})));
}

var mainStyle = document.styleSheets[0];

// size処理
var sizeInput = document.getElementById("size");
sizeInput.addEventListener("input", onInputSize, false);
function onInputSize() {
    size = sizeInput.value / 2.0;
    mainStyle.addRule('input[type="range"]#size::-webkit-slider-thumb:hover', "width: " + size + "px;");
    mainStyle.addRule('input[type="range"]#size::-webkit-slider-thumb:hover', "height: " + size + "px;");
    mainStyle.addRule('input[type="range"]#size::-webkit-slider-thumb:active', "width: " + size + "px;");
    mainStyle.addRule('input[type="range"]#size::-webkit-slider-thumb:active', "height: " + size + "px;");
    size /= 2.0;
    mainStyle.addRule('input[type="range"]#size::-webkit-slider-thumb:hover', "border-radius: " + size + "px;");
    mainStyle.addRule('input[type="range"]#size::-webkit-slider-thumb:active', "border-radius: " + size + "px;");
}
onInputSize();

//color処理
var colorInput = document.getElementById("color");
colorInput.addEventListener("input", onInputColor, false);
function onInputColor() {
    color = colorInput.value;
    mainStyle.addRule('input[type="range"]#size::-webkit-slider-thumb', "background-color: " + color + ";");
}
onInputColor();

// alpha処理
var range = document.getElementById("alpha");
var rangeValue = document.getElementById("alphavalue");
range.addEventListener("input", onInputRange, false);
function onInputRange() {
    alpha = range.value / 100.0;
    rangeValue.value = Math.floor(alpha * 10);
}
onInputRange();

// メニュー処理
var menuIcon = document.getElementsByClassName("menuicon");
for (var i = 0; i < menuIcon.length; i++) {
    menuIcon[i].addEventListener("click", canvasMenu, false)
}
function canvasMenu() {
    if (this.classList.contains("selectable")) {
        toggleSelectable(this.id);
        if (this.classList.contains("special")) {
            var coverCanvas = createCoverCanvas("specialCanvas");
            document.getElementById("canvases").appendChild(coverCanvas);
        }
    } else if (this.id.indexOf("color") + 1) {
        colorInput.value = "#" + this.id.slice(5, this.id.length);
        onInputColor();
    } else if (this.id.indexOf("clear") + 1) {
        if (confirm("すべて消去しますか？")) {
            sendDraw("paint", "AllClear");
        }
    }
}

// 塗りつぶし機能
var floodfill = (function () {
    function f(p, v, u, l, t, g, B) {
        var k = p.length;
        var q = [];
        var o = (v + u * g) * 4;
        var r = o, z = o, s, A, n = g * 4;
        var h = [p[o], p[o + 1], p[o + 2], p[o + 3]];
        if (!a(o, h, l, p, k, t)) {
            return false
        }
        q.push(o);
        while (q.length) {
            o = q.pop();
            if (e(o, h, l, p, k, t)) {
                r = o;
                z = o;
                A = parseInt(o / n) * n;
                s = A + n;
                while (A < z && A < (z -= 4) && e(z, h, l, p, k, t)) {
                }
                while (s > r && s > (r += 4) && e(r, h, l, p, k, t)) {
                }
                for (var m = z; m < r; m += 4) {
                    if (m - n >= 0 && a(m - n, h, l, p, k, t)) {
                        q.push(m - n)
                    }
                    if (m + n < k && a(m + n, h, l, p, k, t)) {
                        q.push(m + n)
                    }
                }
            }
        }
        return p
    }

    function a(j, l, h, m, k, g) {
        if (j < 0 || j >= k) {
            return false
        }
        if (m[j + 3] === 0 && h.a > 0) {
            return true
        }
        if (Math.abs(l[3] - h.a) <= g && Math.abs(l[0] - h.r) <= g && Math.abs(l[1] - h.g) <= g && Math.abs(l[2] - h.b) <= g) {
            return false
        }
        if ((l[3] === m[j + 3]) && (l[0] === m[j]) && (l[1] === m[j + 1]) && (l[2] === m[j + 2])) {
            return true
        }
        if (Math.abs(l[3] - m[j + 3]) <= (255 - g) && Math.abs(l[0] - m[j]) <= g && Math.abs(l[1] - m[j + 1]) <= g && Math.abs(l[2] - m[j + 2]) <= g) {
            return true
        }
        return false
    }

    function e(j, l, h, m, k, g) {
        if (a(j, l, h, m, k, g)) {
            m[j] = h.r;
            m[j + 1] = h.g;
            m[j + 2] = h.b;
            m[j + 3] = h.a;
            return true
        }
        return false
    }

    function b(j, n, m, i, k, g, o) {
        if (!j instanceof Uint8ClampedArray) {
            throw new Error("data must be an instance of Uint8ClampedArray")
        }
        if (isNaN(g) || g < 1) {
            throw new Error("argument 'width' must be a positive integer")
        }
        if (isNaN(o) || o < 1) {
            throw new Error("argument 'height' must be a positive integer")
        }
        if (isNaN(n) || n < 0) {
            throw new Error("argument 'x' must be a positive integer")
        }
        if (isNaN(m) || m < 0) {
            throw new Error("argument 'y' must be a positive integer")
        }
        if (g * o * 4 !== j.length) {
            throw new Error("width and height do not fit Uint8ClampedArray dimensions")
        }
        var l = Math.floor(n);
        var h = Math.floor(m);
        if (l !== n) {
            console.warn("x truncated from", n, "to", l)
        }
        if (h !== m) {
            console.warn("y truncated from", m, "to", h)
        }
        k = (!isNaN(k)) ? Math.min(Math.abs(Math.round(k)), 254) : 0;
        return f(j, l, h, i, k, g, o)
    }

    var d = function (l) {
        var h = document.createElement("div");
        var g = {r: 0, g: 0, b: 0, a: 0};
        h.style.color = l;
        h.style.display = "none";
        document.body.appendChild(h);
        var i = window.getComputedStyle(h, null).color;
        document.body.removeChild(h);
        var k = /([\.\d]+)/g;
        var j = i.match(k);
        if (j && j.length > 2) {
            g.r = parseInt(j[0]) || 0;
            g.g = parseInt(j[1]) || 0;
            g.b = parseInt(j[2]) || 0;
            g.a = Math.round((parseFloat(j[3]) || 1) * 255)
        }
        return g
    };

    function c(p, n, m, i, o, q, g) {
        var s = this;
        var k = d(this.fillStyle);
        i = (isNaN(i)) ? 0 : i;
        o = (isNaN(o)) ? 0 : o;
        q = (!isNaN(q) && q) ? Math.min(Math.abs(q), s.canvas.width) : s.canvas.width;
        g = (!isNaN(g) && g) ? Math.min(Math.abs(g), s.canvas.height) : s.canvas.height;
        var j = s.getImageData(i, o, q, g);
        var l = j.data;
        var h = j.width;
        var r = j.height;
        if (h > 0 && r > 0) {
            b(l, p, n, k, m, h, r);
            s.putImageData(j, i, o)
        }
    }

    if (typeof CanvasRenderingContext2D === "function") {
        CanvasRenderingContext2D.prototype.fillFlood = c
    }
    return b
})();
