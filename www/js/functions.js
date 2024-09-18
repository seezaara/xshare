
window.$ = function (t) {
    var e = document.querySelectorAll(t);
    return 1 == e.length ? e[0] : e
}
HTMLElement.prototype.live = function (t, e, n) {
    return this.addEventListener(e, function (e) {
        var o = e.target.closest(t);
        null != o && n.call(o, e)
    }),
        this
}
HTMLElement.prototype.append = function (t, e) {
    return null != e ? "before" == t ? (this.insertAdjacentHTML("beforebegin", e),
        this.previousElementSibling) : "after" == t ? (this.insertAdjacentHTML("afterend", e),
            this.nextElementSibling) : "end" == t ? (this.insertAdjacentHTML("beforeend", e),
                this.lastElementChild) : (this.insertAdjacentHTML("afterbegin", e),
                    this.firstElementChild) : (this.insertAdjacentHTML("afterbegin", t),
                        this.firstElementChild)
}
HTMLElement.prototype.on = function (...e) {
    return this.addEventListener(...e)
}
NodeList.prototype.on = function (...e) {
    for (var t = 0; t < this.length; t++) this[t].addEventListener(...e)
}
HTMLElement.prototype.clc = function (e) {
    return this.classList.contains(e)
}
HTMLElement.prototype.cla = function (a) {
    this.classList.add(a)
}
HTMLElement.prototype.clr = function (a) {
    this.classList.remove(a)
}
NodeList.prototype.cla = function (a) {
    for (var t = 0; t < this.length; t++) this[t].classList.add(a)
}
NodeList.prototype.clr = function (a) {
    for (var t = 0; t < this.length; t++) this[t].classList.remove(a)
}

function log(name, icon) {
    $(".console_rec").append('<div class="row" style="padding: 5px 10px;width:100%">' + (icon ? '<span class="material-icons icon" style="color:var(--icon);margin-right:10px">' + icon + '</span>' : '') + '<div style="flex: 1;padding: 1px 5px;display: flex; user-select: text; background: var(--background);font-size: 15px;border-radius: 5px;">' + name + '</div></div>')
};

function reload() {
    window.location.reload()
}
function progress(icon, name, func) {
    if (name) {
        name += " - "
    } else
        name = ''
    var element = $(".console_rec").append('<div class="row" style="padding: 6px 10px;width:100%"><span class="material-icons icon" style="color:var(--icon);margin-right:10px">' + icon + '</span><div style="flex:1;display:flex;;height:16px;background:var(--hover_icon);border-radius: 14px;"><div class="progress" style="white-space: nowrap;padding: 0 10px;width:0%;text-align: center;height:16px;font-size: 14px;border-radius: 14px;background: #ffb74d;color: #5e5e60;line-height: .99;transition:900ms;"></div></div><span class="material-icons icon" style="color:var(--icon);margin-left:10px">cancel</span></div>')
    var close = element.children[2]
    if (func)
        close.addEventListener("click", function () {
            close.remove()
            func()
        })
    element = element.children[1].children[0]
    element.innerHTML = name + 0 + "%";
    return function (percent, total, newname) {
        newname = newname || name
        if (total != undefined) {
            percent = parseInt(percent * 100 / total)
        } else
            percent = false
        if (percent === false) {
            element.style.background = "#ff7043";
            element.style.color = "#fff";
            element.style.width = "100%"
            element.innerHTML = newname + "failed";
            close.remove()
            return
        }
        element.style.width = percent + "%"
        element.innerHTML = newname + percent + "%";
        element.style.background = "#ffb74d";
        element.style.color = "#5e5e60";
        if (percent >= 100) {
            element.style.color = "#fff";
            element.style.background = "#66bb6a";
            element.innerHTML = newname + "success";
            close.remove()
        }
    }
};

function req(url, data, opt) {
    if (opt == undefined) {
        opt = {}
    }
    opt.method = "post"
    if (data == undefined) {
        opt.method = 'get'
    } else if (typeof data == "object" && !(data instanceof FormData)) {
        data = new URLSearchParams(data)
    }
    return new Promise(function (res, rej) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4) {
                res(this.response, this.status);
            }
        }
        xhttp.responseType = opt.responseType;
        xhttp.onerror = opt.onerror
        xhttp.onabort = opt.onerror
        xhttp.ontimeout = opt.onerror
        xhttp.onprogress = opt.ondownload
        xhttp.upload.onprogress = opt.onupload
        xhttp.open(opt.method, url, true);
        xhttp.send(data);
    })
}


var tab = {
}
!function () {
    var lastpos = { pos: 0, ip: 0, path: 0, source: 0 }
    var reqfun = function () { };
    var reqfun2 = reqfun
    var reqfun3 = reqfun
    var reqfun4 = reqfun
    tab.tab_need = function (f) {
        reqfun = f
    }
    tab.parent = function () {
        var node = $(".folders .item_active")
        if (node.length != 0 && !node.clc("isfirsetitem")) {
            node.parentNode.parentNode.firstElementChild.click()
            node.parentNode.parentNode.firstElementChild.click()
        }
    }
    tab.tab_file = function (f) {
        reqfun2 = f
    }
    tab.tab_select = function (f) {
        reqfun3 = f
    }
    tab.uplad_launch = function (f) {
        reqfun4 = f
    }

    var change_pos = function (pos, ip, path, source, change = true) {
        if (change)
            lastpos = { pos, ip, path, source }
        reqfun3(pos, ip, path, source)
    }

    function change_tab() {
        if (lastpos.ip == $(".folders.active").getAttribute("data-id"))
            change_pos(lastpos.pos, lastpos.ip, lastpos.path, lastpos.source, false)
        else
            change_pos(0, 0, 0, 0, false)
    }
    $('.folders_holder').on('click', function (e) {
        if (!e.target.clc("folders")) {
            $(".folders .item_active").clr("item_active")
            change_pos(0, $(".folders.active").getAttribute("data-id"), 0, 0)
        }
    })
    $('.folders_holder').live('.folder-name', 'click', function () {
        if ($(".folders .item_active"))
            $(".folders .item_active").clr("item_active")
        this.cla("item_active")
        var isitem = this.clc("file-item")
        change_pos((this.clc("isfirsetitem") ? (isitem ? 1 : 2) : (isitem ? 3 : 4)), this.closest(".folders").getAttribute("data-id"), this.parentNode.getAttribute("data-id"), this.closest(".issource").getAttribute("data-id"))
        if (isitem) {
            return;
        }
        if (this.clc("notloaded")) {
            this.clr("notloaded")
            reqfun(this.closest(".folders").getAttribute("data-id"), this.parentNode.getAttribute("data-id"))
        }
        if (this.parentNode.clc('open'))
            this.parentNode.clr('open')
        else
            this.parentNode.cla('open')
    })
    $('.file-manager').live('.folder-name', 'contextmenu', function () {
        if ($(".folders .item_active"))
            $(".folders .item_active").clr("item_active")
        this.cla("item_active")
        var isitem = this.clc("file-item")
        change_pos((this.clc("isfirsetitem") ? (isitem ? 1 : 2) : (isitem ? 3 : 4)), this.closest(".folders").getAttribute("data-id"), this.parentNode.getAttribute("data-id"), this.closest(".issource").getAttribute("data-id"))
        if (isitem) {
            reqfun2(this.closest(".folders").getAttribute("data-id"), this.parentNode.getAttribute("data-id"))
        }
    })

    // < span class="material-icons icon ${data.t == 0 ? 'folder' : 'file'}" > ${ data.t == 0 ? 'folder' : 'description' }</span >
    // function createItem(id, data, parent) {
    //     let item = `<div class="item" data-id="${id}">
    //                     <div class="folder-name${data.t == 0 ? '' : ' file-item'}">
    //                         <span>${data.n}</span>
    //                     </div>
    //                 </div>`;
    //     parent.append('end', item);
    // }

    // function loop_child(inp, parent, parentdock) {
    //     if (parentdock == undefined)
    //         parentdock = parent
    //     for (let dir of inp) {
    //         if (typeof dir.c == 'undefined') {
    //             createItem(dir.i, dir_data[dir.i], parent)
    //         } else {
    //             createItem(dir.i, dir_data[dir.i], parent)
    //             loop_child(dir.c, parentdock.querySelector("div[data-id=\"" + dir.i + "\"]"), parentdock)
    //         }
    //     };
    // } 
    tab.apend = function (mainid, id, data) {
        var parent = $(`.folders[data-id="${mainid}"] .item[data-id="${id.replace(/\\/g, "\\\\")}"]`)
        if (parent.length == undefined)
            apend_child(data, parent)
        else
            for (var i of parent)
                apend_child(data, i)
    }

    function apend_child(inp, parent, is) {
        while (parent.children.length > 1) {
            parent.removeChild(parent.lastChild);
        }
        for (let dir of inp) {
            let item =
                `<div class="item ${is ? "issource" : ""}" data-id="${dir.path}">
                    <div class="folder-name ${is ? "isfirsetitem" : ""} ${dir.type == 1 ? 'notloaded' : 'file-item'}">
                        <span>${dir.name || dir.path}</span>
                    </div>
                </div>`;
            parent.append('end', item);
        };
    }

    var count = 0
    tab.addTab = function (tabname, ip, data, inp) {
        var elem = $(`.folders[data-id="${ip}"]`)
        if (elem.length == 0) {
            count++;
            let tabId = "_tabs" + count;
            let folders = `<div data-id="${ip}" class="folders ${inp ? "active" : ""}" id="${tabId}_folders"></div>`;
            let tabs = `<div class="tab ${inp ? "active" : ""}" id="${tabId}">${tabname}` + (!inp ? '<span class="material-icons icon close">clear</span>' : "") + `</div>`
            elem = $('.folders_holder').append('end', folders)
            $('.tabbar').append('end', tabs)
            apend_child(data, elem, true);
        } else {
            elem.innerHTML = ""
            apend_child(data, elem, true);
            // if (lastpos.ip == ip) {
            //     godeep= lastpos.path.substring(lastpos.source.length).split("\\")
            //     for ()
            //         console.log($(`.folders[data-id="${ip}"] .issource[data-id="${lastpos.source.replace(/\\/g, "\\\\")}"]`))
            // }
            // lastpos.ip 
        }
        // loop_child(data, elem);
    }

    tab.addFirends = function (tabname, tabId) {
        let box = `
        <div class="box" data-id="${tabId}">
            <div class="person">
                <span class="material-icons icon">account_circle</span>
                <span>${tabname}</span>
            </div>
            <div class="icons">
                <span class="material-icons icon" id="mic">mic</span>
                <span class="material-icons icon" id="videocam">videocam</span>
                <span class="material-icons icon" id="screen_share">screen_share</span>
                <span class="material-icons icon" id="dns">dns</span>
                <span class="material-icons icon drop-area" id="upload_file">
                    <input type="file" class="single_upload">upload</span>
                <span class="material-icons icon drop-area" id="launch_file">
                    <input type="file" class="single_launch">launch</span>
            </div>
        </div>
    `
        var out = $('#left-section').append('end', box)
        out.querySelectorAll(".single_upload,.single_launch").on("change", reqfun4)
        server.send_to(tabId, { q: "file_server" })
    }


    $('.tabbar').live('.tab', 'click', function (e) {
        if (e.target.clc("close"))
            return;
        if (this.clc('active'))
            return;
        $('.tabbar .tab').clr('active') 
        this.cla('active')
        let id = this.id;
        $(`.file-manager .folders`).clr('active')
        $(`#${id}_folders`).cla('active')
        change_tab()
    })
    $('.tabbar').live('.close', 'click', function () {
        let id = this.parentNode.id;
        let check = this.parentNode.clc('active');
        $(`#${id}`).remove();
        $(`#${id}_folders`).remove(); 
        if (!check)
            return;
        $('.tabbar').children[0].cla('active');
        id = $('.tabbar').children[0].id;
        $(`#${id}_folders`).cla('active');
    })
}()



// ============================================= script

function openFab(id) {
    var fab = document.getElementById(id);
    fab.classList.toggle("show");
}
function isFileDraged(e) {
    var dt = e.dataTransfer;
    return (dt.types && (dt.types.indexOf ? dt.types.indexOf('Files') != -1 : dt.types.contains('Files')))
}

var lastKey = null;
var counter = 0;

// $("#right-section").on("dragenter", function (e) {
//     e.preventDefault();
//     if (isFileDraged(e)) {
//         is_drag = e.target;
//         counter++;
//         $("#share-box_lunch").clr('active')
//         $("#share-box").clr('active')
//         if (e.target.closest("#share-box_lunch"))
//             $("#share-box_lunch").cla('active')
//         else if (e.target.closest("#share-box"))
//             $("#share-box").cla('active')

//         $(".share-box-parent").cla('active')
//     }
// });
// $("#right-section").on("dragleave", function (e) {
//     e.preventDefault();
//     counter--;
//     if (counter === 0) {
//         $(".share-box-parent").clr('active')
//     }
// });
// $("#right-section").on("dragover", function (e) {
//     e.preventDefault();
// });
// $("#right-section").on("drop", function (e) {
//     e.preventDefault();
//     counter--;
//     if (counter === 0) {
//         $(".share-box-parent").clr('active')
//     }
// });

// drag event for .boxes
// $(".box").on("dragover", function (e) {
//     if (isFileDraged(e)) {
//         this.cla('active')
//         window.clearTimeout(dragTimer);
//     }
// });
// $(".box").on("dragleave", function (e) {
//     let that = this
//     dragTimer = window.setTimeout(function () {
//         that.clr('active')
//     }, 100);
// });


window.addEventListener('keydown', function (event) {
    lastKey = event.code;
})
window.addEventListener('keyup', function (event) {
    lastKey = null;
})