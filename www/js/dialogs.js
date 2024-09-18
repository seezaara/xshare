async function add_custom_user() {
    var setting =
        `<div style="width: 400px;">
    <style>
        .modal .icon {
            color: var(--icon);
        }

        .modal input:disabled {
            opacity:.2
        }
        .modal input:not(input[type="submit"], input[type="button"]) {
            height: 35px;
            width: 80%;
            background-color: var(--item);
            border: none;
            border-radius: 5px;
            font-size: 18px;
            padding: 4px 8px;
            color:  var(--text);
        }
        .modal textarea { 
            width: 80%;
            background-color: var(--item);
            border: none;
            border-radius: 5px;
            font-size: 18px;
            padding: 4px 8px;
            color:  var(--text);
        }

        .modal input[type="submit"] {
            width: 150px;
            padding: 5px;
            background-color: var(--item);
            border: none;
            border-radius: 5px;
            font-size: 20px;
            color:  var(--text);
        }

        .modal input[type="button"],
        .modal button {
            background-color: var(--item);
            border: none;
            color: var(--text);
            padding: 4px;
            border-radius: 5px;
            font-size: 18px;
            margin: 4px 8px;
            padding: 2px 10px;
        }
    </style>
    <div style="width: 30px;height: 30px;background-color: var(--item);padding: 3px;margin: 15px;">
        <span class="material-icons icon" dialog_close>close</span>
    </div>
    <div class="erorrmessage"></div>
    <div style="margin: 15px;">
        <form action="" dialog_call="submit">
            <div class="row">
                <span class="material-icons icon" style="margin: 10px;">wifi</span>
                <input type="text" placeholder="192.168.1.1:1111" name="ip">
            </div>
            <br>
            <br>
            <div class="alignv"><input type="submit" value="add"></div>
        </form>
    </div>
</div>`
    Dialog(setting, function (e, form) {
        event.preventDefault();
        try {
            form.querySelector('input[type="submit"]').disabled = true
            var data = new FormData(e)
            data = Object.fromEntries(data);
            server.add_friend(...data.ip.split(":"), function (userdata) {
                if (userdata == false) {
                    return alert("can't connect to " + data.ip)
                }
                tab.addFirends(userdata.name, data.ip)
                dialog_close()
            })

        } catch (e) {
            alert(e)
            dialog_close()
        }
    })

}
async function inputDialog(t, nm, func) {
    var setting =
        `<div style="width: 400px;">
    <style>
        .ft, .fl{padding-bottom:16px;border-bottom:solid 2px var(--line);margin:12px 15px 8px 15px;font-size:18px}
      .fl{font-weight:700}
        .modal .icon {
            color: var(--icon);
        }

        .modal input:disabled {
            opacity:.2
        }
        .modal input:not(input[type="submit"], input[type="button"]) {
            height: 35px;
            width: 80%;
            background-color: var(--item);
            border: none;
            border-radius: 5px;
            font-size: 18px;
            padding: 4px 8px;
            color:  var(--text);
        }
        .modal textarea { 
            width: 80%;
            background-color: var(--item);
            border: none;
            border-radius: 5px;
            font-size: 18px;
            padding: 4px 8px;
            color:  var(--text);
        }

        .modal input[type="submit"] {
            width: 150px;
            padding: 5px;
            background-color: var(--item);
            border: none;
            border-radius: 5px;
            font-size: 20px;
            color:  var(--text);
        }

        .modal input[type="button"],
        .modal button {
            background-color: var(--item);
            border: none;
            color: var(--text);
            padding: 4px;
            border-radius: 5px;
            font-size: 18px;
            margin: 4px 8px;
            padding: 2px 10px;
        }
    </style>
    <div style="width: 30px;height: 30px;background-color: var(--item);padding: 3px;margin: 15px;">
        <span class="material-icons icon" dialog_close>close</span>
    </div>
    <div class="erorrmessage"></div>
    <div style="margin: 15px;">
        <form action="" dialog_call="submit">
            <div class="fl">${t}</div>
            <div class="row">
                <span class="" style="margin: 10px;">name: </span>
                <input type="text" value="${nm}" name="ip">
            </div>
            <br>
            <br>
            <div class="alignv"><input type="submit" value="Accept"></div>
        </form>
    </div>
</div>`
    Dialog(setting, function (e, form) {
        event.preventDefault();
        try {
            form.querySelector('input[type="submit"]').disabled = true
            var data = new FormData(e)
            data = Object.fromEntries(data);
            func(data.ip)
            dialog_close()
        } catch (e) {
            alert(e)
            dialog_close()
        }
    })

}
async function setting_dialog() {
    var srcs = ""
    for (var path of userdata.sources) {
        srcs += '<input class="added" name="sources[]" value="' + path + '">'
    }
    var setting =
        `<div style="width: 400px;">
    <style>
        .modal .icon {
            color: var(--icon);
        }

        .modal input:not(input[type="submit"], input[type="button"]) {
            height: 35px;
            width: 80%;
            background-color: var(--item);
            border: none;
            border-radius: 5px;
            font-size: 18px;
            padding: 4px 8px;
            color:  var(--text);
        }
        .modal textarea { 
            width: 80%;
            background-color: var(--item);
            border: none;
            border-radius: 5px;
            font-size: 18px;
            padding: 4px 8px;
            color:  var(--text);
        }

        .modal input[type="submit"] {
            width: 150px;
            padding: 5px;
            background-color: var(--item);
            border: none;
            border-radius: 5px;
            font-size: 20px;
            color:  var(--text);
        }

        .modal input[type="button"],
        .modal button {
            background-color: var(--item);
            border: none;
            color: var(--text);
            padding: 4px;
            border-radius: 5px;
            font-size: 18px;
            margin: 4px 8px;
            padding: 2px 10px;
        }
    </style>
    <div style="width: 30px;height: 30px;background-color: var(--item);padding: 3px;margin: 15px;">
        <span class="material-icons icon" dialog_close>close</span>
    </div>
    <div class="erorrmessage"></div>
    <div style="margin: 15px;">
        <form action="" dialog_call="submit">
            <div class="row">
                <span class="material-icons icon" style="margin: 10px;">person</span>
                <input type="text" placeholder="display name" name="display_name" value="${userdata.display_name}">
            </div>
            <div class="row">
                <span class="material-icons icon" style="margin: 10px;">folder</span>
                <input type="button" value="Add" class="add_folder">
                <div class="added_list">${srcs}</div>
            </div>
            <div class="row">
                <span style="width: 45px; height: 20px; font-size: 19px">data</span>
                <textarea name="data" id="" cols="30" rows="10">${JSON.stringify(userdata.data)}</textarea>
            </div>

            <div class="row">
                <input type="checkbox" name="localhost" style="width: 45px; height: 20px; margin-right: 15px;" ${userdata.localhost ? "checked" : ''}>
                <label for="">
                    listening on localhost (127.0.0.1)
                </label>
            </div>
            <div class="row">
                <input type="checkbox" name="multipleApp" style="width: 45px; height: 20px; margin-right: 15px;" ${userdata.multipleApp ? "checked" : ''}>
                <label for="">
                    multi app on one ip address
                </label>
            </div>
            <div class="row">
                <input type="checkbox" name="darkmode" style="width: 45px; height: 20px; margin-right: 15px;" ${userdata.darkmode ? "checked" : ''}>
                <label for="">
                    dark mode
                </label>
            </div>
            <br>
            <br>
            <div class="alignv"><input type="submit" value="save"></div>
        </form>
    </div>
</div>`
    Dialog(setting, function (e) {
        event.preventDefault();
        var data = new FormData(e)
        var object = {};
        data.forEach((value, key) => {
            if (key.substring(key.length - 2) == '[]') {
                key = key.substring(0, key.length - 2)
                if (!Array.isArray(object[key])) {
                    object[key] = [value];
                    return
                }
                object[key].push(value)
                return;
            }
            object[key] = value;
        });
        if (!object.sources) {
            object.sources = []
        }
        try {
            object.data = JSON.parse(object.data)
        } catch (e) {
            $(".erorrmessage").innerHTML = e
            return
        }
        dialog_close()
        localStorage.setItem("userdatas", JSON.stringify(object))
        reload()
    })
    var i = 0
    $(".add_folder").onclick = function () {
        api("showOpenDialog", {
            properties: ['openDirectory']
        }).then(function (path) {
            if (!path)
                return
            path = path.filePaths[0]
            // var name = path.substr(path.lastIndexOf('\\') + 1)

            $(".added_list").append('<input class="added" name="sources[]" value="' + path + '">')
        });
    }
    $(".added_list").live('.added', 'click', function (e) {
        e.preventDefault()
        this.remove()
    })
}


function dialogMess(t, f) {
    Dialog('<style>.dialog_check .ft,.dialog_check .fl{padding-bottom:16px;border-bottom:solid 2px var(--line);margin:12px 15px 8px 15px;font-size:18px}.dialog_check .fl{font-weight:700}.dialog_check .fb{padding:8px 15px;margin:10px 15px;font-size:18px;color:var(--color);display:inline-block;transition:.2s;cursor:pointer;border-radius:5px}.dialog_check .fb:active{background-color:var(--item)}</style><div class="dialog_check dir"><div class="fl">' + t + '</div><div class="fb" dialog_call>' + "Accept" + '</div><div class="fb" dialog_close>' + "cancel" + '</div></div>', function (e) {
        dialog_close()
        f(e)
    })
}
function dialogIcon(s, f, t, l) {
    if (t === 1 && l === undefined)
        var style = {
            top: "20px",
            right: utils.config.dir != "rtl" ? "20px" : "unset",
            left: utils.config.dir == "rtl" ? "20px" : "unset",
            transform: "unset",
        }
    else {
        var style = {
            top: "max(20%, min(80%," + t + "px))",
            left: "max(40%, " + l + "px)",
            transform: "translate(-110%, -50%)",
        }
    }
    var o = ""
    for (var i in s)
        o += '<div class="item" data-id="' + i + '" dialog_call><div class="icon ' + s[i][0] + '"></div><div>' + s[i][1] + '</div></div>'
    Dialog('<style>.dialog_icon  .icon {color: var(--off-color);width: 50px;height: 50px;font-family: chat_icons;font-style: normal;font-weight: normal;font-variant: normal;text-transform: none;font-size: 29px;display: flex;align-items: center;justify-content: center;-webkit-font-smoothing: antialiased;-moz-osx-font-smoothing: grayscale;}.dialog_icon .item{width:100%;display:flex;flex-flow:row;font-size:17px;padding:0 7.5px;align-items:center;transition:.2s}.dialog_icon .item:active,.dialog_icon .itemac{background:var(--tools)}.dialog_icon .item :first-child{width:32px;height:60px;margin:0 7.5px}.dialog_icon .item :last-child,.item :only-child{border-bottom:solid 1px var(--line);flex:1;padding-top:18px;padding-bottom:18.5px;margin:0 7.5px;height:auto}.dialog_icon .item:last-child div{border:none}</style><div class="dir dialog_icon">' + o + '</div>', function (e) {
        dialog_close()
        f(+e.getAttribute("data-id"))
    }, {
        style,
        mainstyle: {
            background: "#00000008"
        },
    })
}
function dialogCheck(t, ct, f) {
    Dialog('<style>.dialog_check .ft,.dialog_check .fl{padding-bottom:16px;border-bottom:solid 2px var(--line);margin:12px 15px 8px 15px;font-size:18px}.dialog_check .fl{font-weight:700}.dialog_check .fb{padding:8px 15px;margin:10px 15px;font-size:18px;color:var(--color);display:inline-block;transition:.2s;cursor:pointer;border-radius:5px}.dialog_check .fb:active{background-color:var(--item)}</style><div class="dir dialog_check"><div class="fl">' + t + '</div><label class="fl"><input type="checkbox">' + ct + '</label><br><div class="fb" dialog_call>' + "Accept" + '</div><div class="fb" dialog_close>' + "cancel" + '</div></div>', function (e) {
        dialog_close()
        f(e.parentNode.children[1].children[0].checked)
    })
}
