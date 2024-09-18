const httpserver = require('http'),
    multiparty = require('multiparty'),
    net = require('net'),
    fs = require('fs'),
    parsedUrl = require('url'),
    crypto = require('crypto'),
    os = require('os');
const pathobj = require('path');


function donot() { };
//======================================= server.

var check_access_f
function check_access(f) {
    check_access_f = f
}
var tmp_list = {}
var dobj = {
    myips: [],
    myports: [],
    firends: {},
    myname: "",
    ports: [],
    onmessage: function (e) { console.log("onmessage", e) },
    onconnect: function (e) { console.log("onconnect", e) },
    onupload: function (e) { console.log("onupload", e) },
    multipleApp: false,
    localhost: false
}
function exec(obj) {
    dobj = { ...dobj, ...obj }
    if (!dobj.myname)
        dobj.myname = os.hostname()

    if (!fs.existsSync(dobj.tmp)) {
        fs.mkdirSync(dobj.tmp);
    } else {
        fs.readdir(dobj.tmp, (err, files) => {
            if (err) return console.log(err);
            for (const file of files) {
                fs.unlink(pathobj.join(dobj.tmp, file), err => {
                    if (err) return console.log(err);
                });
            }
        });
    }

    var whatch_puse = false;
    fs.watch(dobj.tmp, (eventType, filename) => {
        if (filename in tmp_list && eventType == "change" && !whatch_puse) {
            whatch_puse = true
            setTimeout(() => {
                tab_watch_f(tmp_list[filename][0], dobj.tmp + "/" + filename, tmp_list[filename][1]);
                whatch_puse = false
            }, 10);
        }
    })
    close_server()
    for (const ip of get_networks(dobj.localhost)) {
        server(ip, server_on_recive)
    }
}
function server_on_recive(req, res) {
    if (req.method == "POST" && typeof req.url != "undefined") {
        var urls = parsedUrl.parse(req.url, true)
        var opt = check_user_data(urls);
        if (opt.q == 0)
            res.end("this is xshare" + JSON.stringify({ name: dobj.myname }));
        else if (opt.q == 1)
            json_message(req, res, opt);
        else if (opt.q == 2)
            dl(req, res, opt);
        else if (opt.q == 3)
            upl(req, res, opt)
    }
}
// ====================================================================== http functions

function check_user_data(e) {
    var out = {}
    if (e.pathname == "/handshake")
        out.q = 0
    else if (e.pathname == "/data")
        out.q = 1
    else if (e.pathname == "/download") {
        out = e.query
        out.q = 2
    } else if (e.pathname == "/upload") {
        out.oncrash = donot
        out.onsuccess = function () {
        }
        out.q = 3
    }
    return out
}
function dl(req, res, opt) {
    opt._server_port = JSON.parse(opt._server_port)
    opt._server_ip = JSON.parse(opt._server_ip)
    var ip = resolveip(req.connection.remoteAddress) + ":" + opt._server_port[opt._server_ip.indexOf(req.connection.remoteAddress)]
    var path = check_access_f(ip, opt.path)
    if (path === false) {
        res.statusCode = 404;
        res.end();
        return
    }
    var stat = fs.statSync(path)
    var size = stat.size
    if (!stat.isDirectory()) {
        var option = {}
        var fsop;
        var range = req.headers["range"]
        option['Accept-Ranges'] = 'bytes'
        option['Connection'] = 'keep-alive'
        option['Content-Disposition'] = 'attachment;'
        option['Content-type'] = 'application/octet-stream'
        option['Cache-Control'] = 'no-cache'
        if (typeof range != "undefined" && range.indexOf('bytes=') == 0) {
            range = range.substring(6)
            range = range.split('-')
            range[0] = parseInt(range[0])
            range[1] = parseInt(range[1]) || size - 1
            option['Content-Range'] = 'bytes ' + range[0] + '-' + range[1] + '/' + size
            option['Content-Length'] = size - range[0]
            fsop = { start: range[0], end: range[1] }
        } else {
            option['Content-Length'] = size
        }
        res.writeHeader(200, option);
        var fReadStream = fs.createReadStream(path, fsop);

        if (dobj.onupload) {
            var load = 0;
            const out = dobj.onupload(path, function () {
                req.socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
                fReadStream.destroy()
            })
            res.on("close", function () {
                if (load != size) {
                    out(false)
                    fReadStream.destroy()
                }
            })
            fReadStream.on('data', function (data) {
                load += data.length
                out(load, size)
            });
        }

        fReadStream.pipe(res)
    } else {
        res.statusCode = 404;
        res.end();
    }
}
function upl(req, res, opt) {
    var afname = opt.names
    var downfile = [];
    if (typeof afname != "undefined") {
        var form = new multiparty.Form();
        var haserror = false;
        var wstreamp;
        form.on('part', function (part) {
            var name = afname[part.name];
            delete afname[part.name];
            if (typeof name == "string" && part.filename) {
                var wstream;
                var checkfr = false;
                var dtln = 0;
                function ends() {
                    haserror = true
                    part.removeListener('data', datah);
                    part.removeListener('end', endd);
                    if (checkfr) {
                        checkfr = false;
                        wstream.end();
                        for (var i in downfile)
                            fs.unlink(downfile[i], donot);
                    }
                    opt.oncrash(urls.query)
                    req.socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
                }
                function datah(chunk) {
                    if (checkfr) {
                        dtln += chunk.length
                        if (dtln > 2e6) {
                            return ends();
                        }
                        wstream.write(chunk);
                    } else {
                        if (opt.ex[0] === chunk[0] &&
                            opt.ex[1] === chunk[1] &&
                            opt.ex[2] === chunk[2]) {
                            downfile.push(name);
                            wstream = fs.createWriteStream(name);
                            wstreamp = wstream
                            wstream.write(chunk);
                            checkfr = true;
                        } else {
                            ends();
                        }
                    }
                };
                var endd = function () {
                    part.removeListener('data', datah);
                    if (checkfr) {
                        wstream.end();
                    }
                }
                part.on('data', datah);
                part.once('end', endd);
                part.once('error', ends)
                part.resume();
            } else {
                for (var i in downfile)
                    fs.unlink(downfile[i], donot);
                haserror = true
                opt.oncrash(urls.query)
                req.socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
            }
        });
        form.once('error', donot)
        form.once('close', function () {
            if (haserror)
                return;
            if (wstreamp && !wstreamp.closed) {
                wstreamp.once('close', function () {
                    opt.onsuccess(urls.query);
                })
            } else {
                opt.onsuccess(urls.query);
            }
            res.writeHead(200);
            res.end('{"o":1}');
        });
        form.parse(req);
    } else
        req.socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
}

// ====================================================================== end fun server
// ====================================================================== server functions

function json_message(req, res, opt) {
    var body = '';
    req.on('data', function (data) {
        body += data;
        if (body.length > 1e6)
            req.connection.destroy();
    });
    req.on('end', function () {
        res.end('{"o":1}');
        spoil_message(body, resolveip(req.connection.remoteAddress));
    });
}
async function spoil_message(req, realip) {

    var e = {}
    try {
        e = JSON.parse((req));
    } catch (s) {
        if ((/("rq":)\d+/.test(req)))
            e = { o: 0, rq: +req.match(/"rq":(\d+)/)[1] }
        else
            return;
    }
    await dobj.onmessage(e, realip + ":" + e._server_port[e._server_ip.indexOf(realip)]);
}
function resolveip(ip) {
    return ip.includes("::ffff:") && ip.includes(".") ? ip.substring(7) : ip
}

// ====================================================================== end fun server
var main_servers = [];
async function server(ip, httpreq) {
    var srv = httpserver.createServer(httpreq)

    for (var port of dobj.ports) {
        if ((await port_is_use(port, ip)) == false) {
            srv.listen(port, ip, function (e) {
                if (e)
                    dobj.onconnect(false)
                else
                    dobj.onconnect(srv.address())
            });
            dobj.myips.push(ip)
            dobj.myports.push(port);
            main_servers.push(srv);
            break;
        }
    }
}

function close_server() {
    for (const server of main_servers) {
        server.close()
    }
    main_servers = []
}

function port_is_use(port, ip) {
    return new Promise((resolve) => {
        var server = net.createServer();
        server.once('error', function (err) {
            if (err.code === 'EADDRINUSE') {
                resolve(true);
            }
        });
        server.once('listening', function () {
            server.close();
            resolve(false);
        });
        server.listen(port, ip);
    });
}

// =========================================== refresh
function refresh(calb) {
    dobj.firends = {}
    for (var ip of dobj.ips) {
        for (let i = ip.start; i <= ip.end; i++) {
            _refresh(ip.ip + i, calb)
        }
    }
}

function _refresh(ip, calb, port = 0) {
    if (typeof dobj.ports[port] == "undefined")
        return;
    var client = new net.Socket();
    setTimeout(function () {
        if (!client.destroyed)
            client.destroy();
    }, 8000);
    client.setTimeout(4000)

    client.once('error', function (err) {
        // console.log(err)
        if (err.code === 'ECONNREFUSED') {
            // port is currently in use 
            _refresh(ip, calb, port + 1);
        }
    });
    client.connect(dobj.ports[port], ip, function () {
        if (dobj.myips.includes(ip) && dobj.myports.includes(dobj.ports[port])) {
            if (dobj.multipleApp)
                _refresh(ip, calb, port + 1);
            return
        }
        add_friend(ip, dobj.ports[port], function (data) {
            client.destroy();
            if (data == false)
                _refresh(ip, calb, port + 1);
            else {
                calb(ip, dobj.ports[port], data)
                if (dobj.multipleApp)
                    _refresh(ip, calb, port + 1);
            }

        })
    });
}
function add_friend(ip, port, calb) {
    send_to(ip + ":" + port, "is this xshare", "handshake", function (data) {
        data += ""
        if (data.substring(0, 14) == "this is xshare") {
            data = JSON.parse(data.substring(14))
            data._access = {}
            dobj.firends[ip + ":" + port] = data
            if (typeof calb == "function")
                calb(data)
        } else
            calb(false);
    }, calb)
}

// ====================================== exec

function send_to(ipinp, data, prmss, call, error) {
    if (call == undefined && prmss != undefined) {
        call = prmss
        prmss == undefined
    }
    var prms = "data"
    if (typeof data == "object") {
        data._server_port = dobj.myports
        data._server_ip = dobj.myips
        var data = JSON.stringify(data)
    }
    var xhr = new XMLHttpRequest();
    xhr.open('POST', "http://" + ipinp + "/" + (prmss || prms), true);
    if (call)
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    call(this.responseText);
                } else if (error) {
                    error(false)
                }
            }
        };
    xhr.send(data);
}
var tab_watch_f
function tab_watch(f) {
    tab_watch_f = f
}


function download(ipinp, path, call, direct) {
    for (var i in tmp_list) {
        if (tmp_list[i][0] == ipinp && tmp_list[i][1] == path)
            fs.unlink(dobj.tmp + "/" + i, donot)
    }
    var name = "is" + crypto.randomBytes(16).toString('hex') + "e." + (path.substring(path.lastIndexOf('.') + 1, path.length))
    var topath = direct || dobj.tmp + "/" + name;
    var inurl = parsedUrl.parse("http://" + ipinp + "/download?" + (new URLSearchParams({ path: path, _server_port: JSON.stringify(dobj.myports), _server_ip: JSON.stringify(dobj.myips) }).toString()));
    const http_option = {
        host: inurl.hostname,
        port: inurl.port,
        path: inurl.path,
        method: "post",
    }  
    fs.mkdirSync(pathobj.parse(topath).dir, {
        recursive: true,
    });
    const file = fs.createWriteStream(topath);
    var request;
    var wait = new Promise((resolve, reject) => {
        request = httpserver.request(http_option, function (pushResponse) {
            if (pushResponse.statusCode != 200)
                return resolve(false);
            var total = +pushResponse.headers["content-length"]
            var responselenght = 0;
            pushResponse.on('data', function (chunk) {
                file.write(chunk)
                responselenght += chunk.length;
                call(responselenght, total)
            });
            pushResponse.on('end', function () {
                file.end();
                resolve(true);
                setTimeout(() => {
                    tmp_list[name] = [ipinp, path]
                }, 200);
            });
            pushResponse.on('error', function () {
                file.end();
                resolve(false);
                fs.unlinkSync(topath)
            });
        }).on('error', function (e) {
            resolve(false);
        }).end();

    })
    wait.then(call)
    return {
        close: function () {
            request.destroy()
            file.end();
            fs.unlinkSync(topath)
        },
        wait: wait,
        tmp: topath,
        request
    };
}
function get_networks(is = false) {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    const results = []; // Or just '{}', an empty object

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === (typeof net.family === 'string' ? 'IPv4' : 4) && (is || !net.internal)) {
                results.unshift(net.address);
            }
        }
    }
    return results
}
module.exports = {
    refresh,
    check_access,
    send_to,
    exec,
    download,
    add_friend,
    tab_watch: tab_watch,
    firends: (ip) => ip ? dobj.firends[ip] : dobj.firends
}

