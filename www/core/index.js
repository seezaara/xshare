
const RTC = require('./core/RTC'),
    file = require('./core/file'),
    server = require('./core/server'),
    pross = require('child_process'),
    crypto = require('crypto'),
    fs = require('fs'),
    os = require('os'),
    pathf = require('path'),
    download_path = os.homedir + "/Downloads/share/"

if (!fs.existsSync(download_path)) {
    fs.mkdirSync(download_path);
}

try {
    var userdata = JSON.parse(localStorage.getItem("userdatas") || '')
} catch (e) {
    var userdata = { "display_name": os.hostname(), "sources": [], "multipleApp": "", "data": [{ "ip": "192.168.1.", "start": 0, "end": 255 }] }
    localStorage.setItem("userdatas", JSON.stringify(userdata))
}
if (userdata.darkmode == "on")
    document.body.classList.add("dark")
file.sources(userdata.sources);

server.exec({
    myname: userdata.display_name,
    ips: userdata.data,
    ports: [
        49051,
        49141,
        40151,
        35151
    ],
    multipleApp: userdata.multipleApp == 'on', // search fore more then an app on an ip address
    localhost: userdata.localhost == 'on', // search fore more then an app on an ip address
    tmp: os.tmpdir() + "/xshare",
    onmessage: message,
    onupload: onupload,
    onconnect: onconnect,

})
function onupload(path, close) {
    return progress("upload", path.substr(path.lastIndexOf('\\') + 1), close)
}
function onconnect(addres) {
    log(addres.address + ":" + addres.port, "wifi")
}


// ================================ screen stream

async function start_capture(e = 0) {
    var stream = {};
    try {
        if (e == 2 || e == 3) {
            stream = await navigator.mediaDevices.getDisplayMedia({ video: { cursor: "always", }, audio: e == 3 });
        } else if (e == 0 || e == 1) {
            stream = await navigator.mediaDevices.getUserMedia({ video: e == 1, audio: e == 0 });
        }
    } catch (err) {
        alert("Error: " + err.message);
        return false
    }
    stream.close = function () {
        stream.getTracks().forEach(track => track.stop());
    }
    return stream
}


var rtc_pre;
var wins = []
function open_RTC(ip) {
    if (!rtc_pre)
        rtc_pre = RTC({
            onreq: send_data_call,
            onclose: closef,
            onstream: onstream
        });
    function onstream(e) {
        var win = stream_window(e, function () {
            rtc_pre.removestream(e.id)
        })
        wins.push(win)
        e.oninactive = function () {
            win()
        }
    }
    function closef() {
        rtc_pre = undefined;
        for (var i of wins)
            i()
        wins = []
    }
    function send_data_call(e) {
        server.send_to(ip, { q: "back_stream", data: e })
    }
}

var all_stream = {}
var rtc_start = {};
async function start_stream(ip, ele, close) {
    var aa = ["mic", "videocam", "screen_share"]
    if (close) {
        st_remove()
    } else {
        if (all_stream[ele.id] == undefined) {
            all_stream[ele.id] = ((await start_capture(aa.indexOf(ele.id))))
            if (all_stream[ele.id] == false) {
                return $('.box[data-id="' + ip + '"] #' + ele.id).clr("btn_active");
            }
        }
        if (rtc_start[ip] == undefined) {
            // server.send_to(ip, { q: "req_stream" })
            rtc_start[ip] = RTC({
                stream: all_stream[ele.id],
                onclose: closef,
                onreq: send_data_call,
                onremovestream: st_remove,
            });
            rtc_start[ip].ty = {}
        } else {
            rtc_start[ip].addstream(all_stream[ele.id])
        }
        rtc_start[ip].ty[ele.id] = true

        function send_data_call(e) {
            server.send_to(ip, { q: "set_stream", data: e })
        }
        function closef() {
            delete rtc_start[ip]
        }
    }
    function st_remove(id) {
        if (id) {
            var ind = -1;
            for (var i in all_stream) {
                if (all_stream[i].id == id) {
                    ind = i
                    break
                }
            }
            if (ind == -1)
                return;
        } else {
            ind = ele.id
        }

        if (rtc_start[ip]) {
            delete rtc_start[ip].ty[ind]
            rtc_start[ip].removestream(all_stream[ind].id)

        }
        $('.box[data-id="' + ip + '"] #' + ind).clr("btn_active")

        var other = false
        for (var i in rtc_start) {
            if (ind in rtc_start[i].ty) {
                other = true
                break
            }
        }
        if (other) {
            all_stream[ind].close()
            delete all_stream[ind]
        }
    }
}

// ===================================================== code 
$(".frame_bar_10").on("click", add_custom_user)

$(".frame_bar_7").on("click", setting_dialog)


function refresh() {
    if ($(".frame_bar_6").clc("deactive"))
        return
    $(".frame_bar_6").cla("deactive");
    $("#left-section").innerHTML = ""
    server.refresh(function (ip, ports, data) {
        tab.addFirends(data.name, ip + ":" + ports)
    })
    setTimeout(() => {
        $(".frame_bar_6").clr("deactive");
    }, 8000);
}
$(".frame_bar_6").on("click", refresh)

setTimeout(() => {
    refresh()
}, 100);

$("#left-section").live("#mic,#videocam,#screen_share,#dns", "click", function () {
    var ip = this.parentNode.parentNode.getAttribute("data-id")
    if (this.id == "videocam" || this.id == "screen_share" || this.id == "mic") {
        if (this.clc("btn_active")) {
            this.clr("btn_active")
            start_stream(ip, this, true)
        } else {
            this.cla("btn_active")
            start_stream(ip, this, false)
        }
    } else if (this.id == "dns") {
        server.send_to(ip, { q: "file_server" })
    }
})
var index_files_data = []

tab.uplad_launch(function () {
    var ip = this.closest(".box").getAttribute("data-id")
    if (this.clc("single_launch")) {
        server.send_to(ip, { q: "file_upload", path: fack_path_access(ip, this.files[0].path), run: true })
    } else if (this.clc("single_upload")) {
        server.send_to(ip, { q: "file_upload", path: fack_path_access(ip, this.files[0].path), download: this.files[0].name })
    }
    this.value = null
})

$("#content_refresh").on("click", refresh_current)
function refresh_current() {
    if (index_files_data.ip == "false") {
        if (index_files_data.pos == 0) {
            file.exec().then(function (e) {
                tab.addTab('My', false, e.list, true)
            })
        } else {
            file.exec({ path: index_files_data.path }).then(function (e) {
                if (e.ok == 1)
                    tab.apend(index_files_data.ip, index_files_data.path, e.list)
            })
        }
    } else {
        if (index_files_data.pos == 0)
            server.send_to(index_files_data.ip, { q: "file_server" })
        else {
            server.send_to(index_files_data.ip, { q: "file_server", path: index_files_data.path })
        }
    }
}
// ================================================================================================ file manager header btns
$("#create_new_folder").on("click", function () {
    var path = index_files_data.path
    inputDialog("please write a name new folder", "new folder", function (e) {
        if (index_files_data.ip == "false") {
            file.exec_order({ newfolder: path + "/" + e })
            refresh_current()
        } else {
            server.send_to(index_files_data.ip, { q: "file", newfolder: path + "/" + e })
            refresh_current()
        }
    })
})
$("#add").on("click", function () {
    var path = index_files_data.path
    inputDialog("please write a name new file", "new file.txt", function (e) {
        if (index_files_data.ip == "false") {
            file.exec_order({ newfile: path + "/" + e })
            refresh_current()
        } else {
            server.send_to(index_files_data.ip, { q: "file", newfile: path + "/" + e })
            refresh_current()
        }
    })
})
$("#edit").on("click", function () {
    var path = index_files_data.path
    var name = path.substr(path.lastIndexOf('\\') + 1)
    var p = path.substr(0, path.lastIndexOf('\\'))
    inputDialog("please write a new name for \"" + name + "\" to change", name, function (e) {
        if (index_files_data.ip == "false") {
            file.exec_order({ rename: path, to: p + "/" + e })
            tab.parent()
            refresh_current()
        } else {
            server.send_to(index_files_data.ip, { q: "file", rename: path, to: p + "/" + e })
            tab.parent()
            refresh_current()
        }
    })
})
$("#content_copy").on("click", function () { })
$("#content_cut").on("click", function () { })
$("#content_paste").on("click", function () { })

$("#delete").on("click", function () {
    var path = index_files_data.path
    var name = path.substr(path.lastIndexOf('\\') + 1)
    dialogMess("Are you sure to delete \"" + name + "\" ?", function () {
        if (index_files_data.ip == "false") {
            file.exec_order({ delete: path })
            tab.parent()
            refresh_current()
        } else {
            server.send_to(index_files_data.ip, { q: "file", delete: path })
            tab.parent()
            refresh_current()
        }
    })
})

$("#download").on("click", function () {
    if (index_files_data.ip == "false")
        return alert("You can't download from your own host");
    var path = index_files_data.path
    var name = path.substr(path.lastIndexOf('\\') + 1)
    var pr = progress("download", name)
    var tmp = server.download(index_files_data.ip, path, function (load, total) {
        if (load === true) {
            path = download_path + name
            if (fs.existsSync(path))
                path = download_path + tmp.tmp.replace(/^.*[\\\/]/, '')
            file.exec_order({ rename: tmp.tmp, to: path }).then(function (e) {
                if (e.ok == 2)
                    pr(false)
            })
        } else
            pr(load, total)
    })
})
$("#multi_file_share,#file_share_folder").on("change", function () {
    if (index_files_data.ip == "false")
        return alert("You can't upload in your own host");
    var paths = []
    var topaths = []
    for (const i of this.files) {
        paths.push(fack_path_access(index_files_data.ip, i.path))
        topaths.push(index_files_data.path + "/" + (i.webkitRelativePath || i.name))
    }
    server.send_to(index_files_data.ip, { q: "direct_upload", path: paths, topath: topaths })
})

var counter = 0;
window.addEventListener("dragenter", function (e) {
    counter++;
    add_ddrag()
});
window.addEventListener("dragleave", function (e) {
    counter--;
    if (counter === 0) calcel_drag()
});
window.addEventListener("drop", calcel_drag);


function add_ddrag(e) {
    $("#upload").classList.add("draged")
    var ln = document.querySelectorAll("#launch_file")
    var up = document.querySelectorAll("#upload_file")
    for (let i = 0; i < ln.length; i++) {
        ln[i].classList.add("draged")
        up[i].classList.add("draged")
    }
}
function calcel_drag(e) {
    $("#upload").classList.remove("draged")
    var ln = document.querySelectorAll("#launch_file")
    var up = document.querySelectorAll("#upload_file")
    for (let i = 0; i < ln.length; i++) {
        ln[i].classList.remove("draged")
        up[i].classList.remove("draged")
    }
}
// ===================================================== file server
file.exec().then(function (e) {
    tab.addTab('My', false, e.list, true)
})
tab.tab_need(function (ip, path) {
    if (ip == "false") {
        file.exec({ path: path }).then(function (e) {
            if (e.ok == 1)
                tab.apend(ip, path, e.list)
        })
    } else
        server.send_to(ip, { q: "file_server", path: path })
})
tab.tab_file(function (ip, path) {
    if (ip == "false") {
        pross.exec('start "" "' + path + '"');
    } else {
        var pr = progress("download", path.substr(path.lastIndexOf('\\') + 1))
        var path = server.download(ip, path, function (load, total) {
            if (load === true) {
                pross.exec('start "" "' + path.tmp + '"');
            } else
                pr(load, total)
        })
    }
})
tab.tab_select(function (pos, ip, path) {
    index_files_data = { pos, ip, path }
    $(".toolbar").setAttribute("data-pos", pos)
})

server.tab_watch(function (ip, path, topath) {
    server.send_to(ip, { q: "file_upload", path: fack_path_access(ip, path), topath: topath })
})

// ========================================== check if firends access to download
var _access = {};
server.check_access(function (ip, path) {
    if (file.check_path(path)) {
        return path;
    } else if (ip in _access && path in _access[ip]) {
        path = _access[ip][path]
        delete _access[ip][path]
        if (Object.keys(_access[ip]).length == 0)
            delete _access[ip]
        return path;
    } else
        return false;
})

function fack_path_access(ip, path) {
    var fake_name = crypto.randomBytes(16).toString('hex') + "." + (path.substring(path.lastIndexOf('.') + 1, path.length));
    if (!(ip in _access))
        _access[ip] = {}
    _access[ip][fake_name] = path;
    return fake_name;
}

async function message(req, ip) {
    if (req.q == "file_upload") {
        // update file  
        var serverreq
        var pr = progress("download", req.download, function () {
            serverreq.close()
        })
        serverreq = server.download(ip, req.path, function (load, total) {
            if (load === true) {
                if (req.download) {
                    req.topath = download_path + req.download
                    if (fs.existsSync(req.topath))
                        req.topath = download_path + serverreq.tmp.replace(/^.*[\\\/]/, '')
                }
                if (req.topath) {
                    file.exec_order({ rename: serverreq.tmp, to: req.topath }).then(function (e) {
                        if (e.ok == 2)
                            pr(false)
                        else if (req.run) {
                            pross.exec('start "" "' + req.topath + '"');
                        }
                    })
                } else if (req.run) {
                    pross.exec('start "" "' + serverreq.tmp + '"');
                }
            } else
                pr(load, total)
        })

    } else if (req.q == "direct_upload") {
        var serverreq
        var pr = progress("download", "0/" + req.topath.length + " - ", function () {
            serverreq.close()
            serverreq = false
        })
        for (const i in req.path) {
            if (serverreq === false)
                return pr(false)
            var totalcount = req.topath.length
            serverreq = server.download(ip, req.path[i], function (load, total) {
                if (load === false)
                    return pr(false)
                if (load !== true)
                    pr(load + (total * i), total * totalcount, (+i + 1) + "/" + totalcount + " - ")
            }, req.topath[i])
            await serverreq.wait
        }
    } else if (req.q == "file_reciver") {
        if (req.ok == 1) {
            tab.addTab(server.firends(ip).name, ip, req.list)
        }
        // download file
    } else if (req.q == "file_apend") {
        if (req.ok == 1)
            tab.apend(ip, req.path, req.list)
        // download file
    } else if (req.q == "file") {
        // file server 
        var out = await file.exec(req)
    } else if (req.q == "file_server") {
        // file server 
        var out = await file.exec(req)
        out.q = req.path ? "file_apend" : "file_reciver"
        out.path = req.path
        server.send_to(ip, out)
    } else if (req.q == 4) {
        // share screen 
    } else if (req.q == "req_stream") {
        // video camera 
    } else if (req.q == "set_stream") {
        // video camera   
        if (rtc_pre)
            rtc_pre.setdata(req.data)
        else {
            open_RTC(ip)
            rtc_pre.setdata(req.data)
        }
    } else if (req.q == "back_stream") {
        // video camera   
        if (rtc_start[ip])
            rtc_start[ip].setdata(req.data)
    }
};

//=============================================================== console
$(".console_expade").on("click", function () {
    if ($(".console").clc("expanded"))
        $(".console").clr("expanded")
    else
        $(".console").cla("expanded")
})


// =========================================================== recorder
$("#recorder_start").addEventListener("click", startRecording)
$("#recorder_stop").addEventListener("click", stopRecording)
var timeupdate_record = $("#timeupdate_record")
var interval
var recorder_stream;
var recorder_;

$("#mic_state").addEventListener("click", function (params) {
    if (this.classList.contains("state_on")) {
        this.classList.remove("state_on")
        this.innerHTML = "mic_off"
    } else {
        this.innerHTML = "mic"
        this.classList.add("state_on")
    }
})

async function startRecording() {
    if (recorder_stream != undefined)
        return;
    recorder_stream = await start_capture($("#mic_state").classList.contains("state_on") ? 3 : 2)
    recorder_ = new MediaRecorder(recorder_stream, {
        mimeType: "video/webm;codecs=H264"
    });
    recorder_.start();
    interval = timeupdate(timeupdate_record)
    $("#recorder_start").style.display = "none"
    $("#mic_state").style.display = "none"
    $("#recorder_stop").style.display = ""
}


function stopRecording() {
    recorder_.ondataavailable = save_record
    setTimeout(function () {
        if (recorder_ == undefined)
            return;
        recorder_.stop();
        recorder_ = undefined
        $("#recorder_start").style.display = ""
        $("#mic_state").style.display = ""
        $("#recorder_stop").style.display = "none"
    }, 700)
}
function save_record(e) {
    var name = ("record_" + new Date().getTime() + ".webm").replace(/\?.+/, '')
    save_blob(download_path + name, e.data)
        .then(function () { log(download_path + name, "cast") })
        .catch(function (e) { console.log(e); log("failed to save recorded file", 'cast') })
    recorder_stream.close();
    recorder_stream = undefined
    clearInterval(interval)
    timeupdate_record.innerHTML = " Screen record"
};
async function save_blob(filename, blob) {
    blob = await new Response(blob).arrayBuffer()
    return new Promise((resolve, reject) => {
        fs.writeFile(filename, new Uint8Array(blob), function (err) {
            if (err) return reject(err);
            resolve();
        });
    });
}
function timeupdate(timeupdate_record) {

    var totalSeconds = 0;

    function setTime() {
        ++totalSeconds;
        timeupdate_record.innerHTML = pad(parseInt(totalSeconds / 60)) + ":" + pad(totalSeconds % 60);
    }

    function pad(val) {
        var valString = val + "";
        if (valString.length < 2) {
            return "0" + valString;
        } else {
            return valString;
        }
    }
    return setInterval(setTime, 1000);
}