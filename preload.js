const {
    ipcRenderer,
    desktopCapturer
} = require("electron");

const contextBridge = { exposeInMainWorld: function (n, v) { window[n] = v } }


contextBridge.exposeInMainWorld("desktopCapturer", desktopCapturer);
contextBridge.exposeInMainWorld("stream_window", stream_window);
contextBridge.exposeInMainWorld("api", ipcRenderer.invoke);
contextBridge.exposeInMainWorld("on", function (name, func) {
    ipcRenderer.on(name, func)
});


window.navigator.mediaDevices.getDisplayMedia = async function (e, fun) {
    if (!("video" in e)) {
        e.video = {}
    }
    if (e.audio == true) {
        e.audio = {
            mandatory: {
                chromeMediaSource: 'desktop',
            }
        }
    }
    e.video.mandatory = {
        chromeMediaSource: 'desktop'
    }
    var lists = await api("desktopCapturerSources", { types: ['screen', 'window'] })
    if (fun)
        fun(lists, selected)
    else {
        for (var i of lists) {
            if (i.name == "Entire Screen" || i.name == "Screen 1")
                return selected(i.id)
        }
        return selected("screen:0:0")
    }
    function selected(index) {
        e.video.mandatory.chromeMediaSourceId = index
        return window.navigator.mediaDevices.getUserMedia(e)
    }
}

function stream_window(stream, close) {
    var wichon = true
    if (stream.getVideoTracks()[0]) {
        var videoTrack = stream.getVideoTracks()[0].getSettings();
        
        var win = window.open('screen.html', stream.id, 'width=' + videoTrack.width + ',height=' + videoTrack.height + ',frame=false,nodeIntegration=true,contextIsolation=false')
    } else {
        var videoTrack = stream.getAudioTracks()[0]
        var win = window.open('audio.html', stream.id, 'minWidth=200,minHeight=82,maxWidth=200,maxHeight=82,width=200,height=82,frame=false,nodeIntegration=true,contextIsolation=false')
    }
    win.onload = function () {
        win.document.querySelector("#media").srcObject = stream
        win.onbeforeunload = function () {
            if (win == undefined)
                return;
            win.document.querySelector("#media").srcObject = null
            setTimeout(function () {
                win = undefined
                if (wichon)
                    close()
            }, 100)
        }
    }
    return function () {
        if (win == undefined)
            return;
        wichon = false
        win.close()
    };
}