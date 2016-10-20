/**
 * Created by syuchan on 2016/10/14.
 */
var keepAlive;
var mySessionId;
var webSocket = new WebSocket("ws://" + location.hostname + ":" + location.port + "/web/");

var modeIcon = document.getElementById("modeicon");
var modeText = document.getElementById("modetext");

webSocket.onopen = function (event) {
    keepAlive = setInterval(function () {
        webSocket.send("Keep-Alive");
    }, 150000);
    modeIcon.style.backgroundColor = "#00e676";
    modeText.innerHTML = "Server online";
};

webSocket.onclose = function (event) {
    clearInterval(keepAlive);
    appendChat("Application<br>WebSocket connection closed.", "application", true);
    count.innerHTML = "サーバーに接続できません";
    modeIcon.style.backgroundColor = "#e74c3c";
    modeText.innerHTML = "Server offline";
};

webSocket.onmessage = function (event) {
    onMessageProcess(JSON.parse(event.data));
};

var count = document.getElementById("sessioncount");

function onMessageProcess(json) {
    if (json.selfSessionId != undefined) {
        mySessionId = json.selfSessionId;
    }
    if (json.sessionCount == undefined) {
        count.innerHTML = "接続人数: " + json.sessionCountLoad + "人";
    } else {
        count.innerHTML = "接続人数: " + json.sessionCount + "人";
        switch (json.mode) {
            case "paint":
                if (json.size == "AllClear") {
                    canvasClear();
                } else if (json.size == "DrawEnd"){
                    drawEnd(json.sessionId);
                } else {
                    draw(json.sessionId, json.size, json.color, json.alpha, json.x, json.y);
                }
                break;
            case "chat":
                appendChat(json.text, json.sessionId, (json.sessionId == mySessionId));
                break;
            case "fill":
                ctx.globalAlpha = json.alpha;
                ctx.fillStyle = json.color;
                ctx.fillFlood(json.x, json.y, 40);
                break;
            case "close":
                removeDraw(json.sessionId);
                break;
        }
    }
}

function sendDraw(Mode, Size, Color, Alpha, X, Y) {
    var json = new Object();
    json.mode = Mode;
    json.size = Size;
    json.color = Color;
    json.alpha = Alpha;
    json.x = X;
    json.y = Y;
    send(json);
}

function sendChat() {
    var json = new Object();
    json.mode = "chat";
    var user = chatUserText.value;
    var text = chatText.value;
    if (text == undefined || text == "") return;
    json.text = (user == undefined || user == "" ? "匿名" : user) + "<br>" + text.replace("<", "&lt;").replace(">", "&gt;");
    send(json);
    chatText.value = "";
}

function send(object) {
    if (webSocket != undefined && webSocket.readyState != 3) {
        webSocket.send(JSON.stringify(object));
    } else {
        object.sessionCount = 1;
        object.sessionId = 1;
        onMessageProcess(object);
    }
}

