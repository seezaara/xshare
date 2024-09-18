
!function () {
    var main;
    var style = `
        .__dialog {
            width: 100%;
            height: 100%;
            background: #0000004d;
            left: 0;
            top: 0;
            position: fixed;
            z-index: 99;
        }

        .modal {
            user-select:none;
            min-width: 30px;
            left: 50%;
            top: 50%; 
            transform: translate(-50%, -50%); 
            position: absolute;
            background: var(--background);
            border-radius: 10px;
            overflow: hidden;
            z-index: 100;
        }`;
    var dialog_func;
    window.dialog_close = function () {
        main && main.remove()
        main = undefined
    }
    window.dialog_call = function (...a) {
        if (a[0] instanceof Event) {
            a = [this, document.querySelector(".modal"), a[0]]
        }
        if (dialog_func)
            dialog_func(...a);
    }
    window.Dialog = function (e, f, op = {}) {
        if (typeof f == "object") {
            op = f
            f = undefined
        }
        if (!op.element)
            op.element = document.body
        var element
        if (e instanceof HTMLElement) {
            element = e
            e = ''
        }
        dialog_func = f
        op.element.insertAdjacentHTML("beforeend", '<div class="__dialog"><style>' + style + '</style><div class="modal">' + e + '</div></div>')
        main = op.element.lastElementChild
        var dialog = main.lastElementChild
        for (const i in op.style) {
            dialog.style[i] = op.style[i]
        }
        for (const i in op.mainstyle) {
            main.style[i] = op.mainstyle[i]
        }
        main.addEventListener("click", function (e) {
            if (e.target == this && op.force != true)
                dialog_close()

        })
        main.addEventListener("contextmenu", function (e) {
            e.preventDefault();
            if (op.force != true)
                dialog_close()
        })
        if (element)
            dialog.appendChild(element)
        if (dialog.querySelector("[dialog_close]") != null) {
            dialog.querySelectorAll("[dialog_close]").forEach(function (item) { item.addEventListener(item.getAttribute("dialog_close") || "click", dialog_close); /*item.removeAttribute("dialog_close")*/ })
        }
        if (dialog.querySelector("[dialog_call]") != null) {
            dialog.querySelectorAll("[dialog_call]").forEach(function (item) { item.addEventListener(item.getAttribute("dialog_call") || "click", dialog_call); /*item.removeAttribute("dialog_call")*/ })
        }
        return dialog;
    }

}();


!function () {
    var childs = [];
    var parent;
    if (document.readyState === "complete" || document.readyState === "interactive") setTimeout(ready, 1);
    else document.addEventListener("DOMContentLoaded", ready);

    function ready() {
        var style = `
.pcmess {
	pointer-events: none;
	height: auto;
	display: block !important;
    position: fixed;
    bottom: 0;
    width:100%; 
    z-index: 1000000000;  
} 
.cmess {    
    pointer-events: none;
    width: fit-content;
    border-radius: 20px;
    background: rgba(170, 170, 170, .88);
    opacity: 0;
    max-width: 90%;
    padding: 4px 6px; 
    transition: opacity 200ms;
    font-size: 14px;
    position: relative;
    bottom: 40px;
    flex-flow: row;
    display: flex;
    z-index: 1000000;  
    margin: auto;
    margin-bottom: 12px;
}

.cmess .cmess-icon {
    font-family: 'Material Icons';
    font-weight: normal;
    font-style: normal;
    font-size: 26px;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -webkit-font-feature-settings: 'liga';
    -webkit-font-smoothing: antialiased; 
    padding: 0 2px; 
}
 
.cmess .cmess-content {
    display:flex;
    align-items:center;
    text-align:center;
    padding: 0 6px;
	flex: 1;
	line-height: 1.7;
    z-index: 1000000;  
}
`
        document.body.insertAdjacentHTML("beforeend", '<style>' + style + '</style><div class="pcmess"></div>')
        parent = document.body.lastElementChild
    }
    window.mess_log = function (e, icon = "icon_info_circle") {
        parent.insertAdjacentHTML("beforeend", '<div class="cmess" dir="auto"></div>')
        var element = parent.lastElementChild
        childs.push(element);
        element.innerHTML = '<span class="cmess-content">' + e + '</span><span class="cmess-icon ' + icon + '"></span>'
        element.style.opacity = "1";
        setTimeout(messClose, 1500 + (e.length * 60));
    }
    function messClose() {
        var element = childs.shift()
        element.style.opacity = "0";
        setTimeout(function () {
            element.remove();
        }, 400);
    }
}()