

// path: "e:/New folder"                                                                get file list
// delete: "e:/New Text Document.txt"                                                   delete
// rename: "e:/New folder (2)", "to":"d:/New folder (2)", progress:function             move and rename to...
// copy: "e:/","to":"D:/New folder", progress:function                                  copy to...
// newfile: "E:/New folder5"}');                                                        new file
// newfolder: "e:/New folder324"}');                                                    get all resurces list

const fs = require('fs'),
    path = require('path')
var sources = []
function change_sources(src) {
    if (src) {
        sources = []
        for (var i of src) {
            sources.push(path.resolve(i).toLowerCase())
        }
    }
    return sources
}
async function exec_order(req = {}) {
    if (req.path) {
        var list = []
        var p = resolve(req.path);
        if (check_path_order(p)) {
            for (let e of fs.readdirSync(p, 'utf8')) {
                list.push(file_details(p + "\\" + e, e))
            }
        }
        list = list.filter(n => n)
        list.sort(sorts);
        return { ok: 1, list: list }
    } else if (req.delete) {
        var p = resolve(req.delete);
        if (check_path_order(p)) {
            try {
                if (fs.statSync(p).isDirectory())
                    fs.rmdirSync(p, { recursive: true });
                else
                    fs.unlinkSync(p);
                return { ok: 1 }
            } catch (e) {
                return { ok: 3 }
            }
        } else
            return { ok: 2 }
    } else if (req.rename && req.to) {
        var p = resolve(req.rename);
        var to = resolve(req.to);
        if (check_path_order(p) && check_path_order(parent(to))) {
            try {
                fs.renameSync(p, to);
                return { ok: 1 }
            } catch (e) {
                if (e.code == 'EXDEV') {
                    copy(p, to, function (total, load, totalsize, size) {
                        req.progress && req.progress(total, load, totalsize, size)
                        if (total == load) {
                            if (fs.statSync(p).isDirectory())
                                fs.rmdirSync(p, { recursive: true });
                            else
                                fs.unlinkSync(p);
                        }
                    });
                    return { ok: 3 }
                }
                return { ok: 4 }
            }
        } else
            return { ok: 2 }
    } else if (req.copy && req.to) {
        var p = resolve(req.copy);
        var to = resolve(req.to);
        if (check_path_order(p) && check_path_order(parent(to))) {
            copy(p, to, function (total, load, totalsize, size) {
                req.progress && req.progress(total, load, totalsize, size)
            });
            return { ok: 1 }
        }
    } else if (req.newfile || req.newfolder) {
        var p = resolve(req.newfile || req.newfolder);
        var s = parent(p);
        if (!fs.existsSync(p)) {
            if (req.newfile) {
                fs.closeSync(fs.openSync(p, 'w'));
            } else {
                fs.mkdirSync(p);
            }
            return { ok: 1 }
        }
    } else {
        var list = []
        for (let file of sources) {
            list.push(file_details(file, path.basename(file)))
        }
        list.sort(sorts);
        list = list.filter(n => n)
        return { ok: 1, list: list }
    }
    return { ok: 0 }
}
async function exec(req = {}) {
    if (req.path) {
        var list = []
        var p = resolve(req.path);
        if (check_path(p)) {
            for (let e of fs.readdirSync(p, 'utf8')) {
                list.push(file_details(p + "\\" + e, e))
            }
        }
        list = list.filter(n => n)
        list.sort(sorts);
        return { ok: 1, list: list }
    } else if (req.delete) {
        var p = resolve(req.delete);
        if (check_path(p)) {
            try {
                if (fs.statSync(p).isDirectory())
                    fs.rmdirSync(p, { recursive: true });
                else
                    fs.unlinkSync(p);
                return { ok: 1 }
            } catch (e) {
                return { ok: 3 }
            }
        } else
            return { ok: 2 }
    } else if (req.rename && req.to) {
        var p = resolve(req.rename);
        var to = resolve(req.to);
        if (check_path(p) && check_path(parent(to))) {
            try {
                fs.renameSync(p, to);
                return { ok: 1 }
            } catch (e) {
                if (e.code == 'EXDEV') {
                    copy(p, to, function (total, load, totalsize, size) {
                        req.progress && req.progress(total, load, totalsize, size)
                        if (total == load) {
                            if (fs.statSync(p).isDirectory())
                                fs.rmdirSync(p, { recursive: true });
                            else
                                fs.unlinkSync(p);
                        }
                    });
                    return { ok: 3 }
                }
                return { ok: 4 }
            }
        } else
            return { ok: 2 }
    } else if (req.copy && req.to) {
        var p = resolve(req.copy);
        var to = resolve(req.to);
        if (check_path(p) && check_path(parent(to))) {
            copy(p, to, function (total, load, totalsize, size) {
                req.progress && req.progress(total, load, totalsize, size)
            });
            return { ok: 1 }
        }
    } else if (req.newfile || req.newfolder) {
        var p = resolve(req.newfile || req.newfolder);
        var s = parent(p);
        if (check_path(s) && !fs.existsSync(p)) {
            if (req.newfile) {
                fs.closeSync(fs.openSync(p, 'w'));
            } else {
                fs.mkdirSync(p);
            }
            return { ok: 1 }
        }
    } else {
        var list = []
        for (let file of sources) {
            list.push(file_details(file, path.basename(file)))
        }
        list.sort(sorts);
        list = list.filter(n => n)
        return { ok: 1, list: list }
    }
    return { ok: 0 }
}
function resolve(p) {
    return path.resolve(p).toLowerCase();
}
function parent(p) {
    return resolve(p.split('\\').slice(0, -1).join('\\') + "\\")
}
function check_path_order(p) {
    return fs.existsSync(p)
}
function check_path(p) {
    for (let file of sources) {
        if (p.includes(file) && fs.existsSync(p)) {
            return true;
        }
    }
    return false;
}
function file_details(file, e) {
    if (fs.existsSync(file)) {
        const st = fs.statSync(file);
        return {
            name: e,
            path: path.resolve(file),
            type: st.isDirectory() ? 1 : 0,
            size: st.size,
            time: st.mtimeMs,
        };
    }
}
var count;
var copysize;
async function copy(src, dest, call, total, size) {
    if (total == undefined) {
        if (!fs.lstatSync(src).isDirectory()) {
            var size = fs.lstatSync(src).size
            call(1, 0, size, 0)
            await copy_bin(src, dest);
            call(1, 1, size, size)
            return
        }
        var { total, size } = dircount(src)
        count = 0
        copysize = 0
        call(total, count, size, copysize)
    }
    if (!fs.existsSync(dest))
        fs.mkdirSync(dest);
    var files = fs.readdirSync(src);
    for (var fil of files) {
        if (fs.existsSync(path.join(src, fil))) {
            var current = fs.lstatSync(path.join(src, fil));
            if (current.isDirectory()) {
                await copy(path.join(src, fil), path.join(dest, fil), call, total, size);
            } else if (current.isSymbolicLink()) {
                var symlink = fs.readlinkSync(path.join(src, fil));
                fs.symlink(symlink, path.join(dest, fil), function () { });
                copysize += current.size
                call(total, ++count, size, copysize)
            } else {
                await copy_bin(path.join(src, fil), path.join(dest, fil));
                copysize += current.size
                call(total, ++count, size, copysize)
            }
        }
    }

};
var dc_total;
var dc_size;
function dircount(dirPath, ist = 1) {
    var files = fs.readdirSync(dirPath)
    if (ist) {
        dc_total = 0
        dc_size = 0
    }
    for (var file of files) {
        if (fs.existsSync(dirPath + "/" + file)) {
            var st = fs.statSync(dirPath + "/" + file)
            if (st.isDirectory()) {
                dircount(dirPath + "/" + file, 0)
            } else {
                dc_total++;
                dc_size += st.size;
            }
        }
    }
    return { total: dc_total, size: dc_size };
}
function copy_bin(src, dest) {
    var oldFile = fs.createReadStream(src);
    var newFile = fs.createWriteStream(dest);
    oldFile.pipe(newFile)
    return new Promise(function (resolve) {
        oldFile.on('end', () => { resolve(); });
    });
};
function sorts(a, b) {
    if (a.type && !b.type) {
        return -1;
    }
    if (!a.type && b.type) {
        return 1;
    }
}
module.exports = {
    sources: change_sources,
    exec: exec,
    exec_order: exec_order,
    check_path: check_path
}