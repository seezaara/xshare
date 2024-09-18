!function () {
    var divh = document.createElement("div")
    //========================
    var style = `
    .frame_bar {     
        --item: #f1f3f5;
        --tools: #e1e4e9;
        --filter-color: #d54f4f30;
        --off-color: #b6bdc3;
        --color: #fa8072;
    }
    `

    divh.innerHTML = `<style>${style}.frame_bar{display:flex!important;flex-flow:row;direction:rtl;background:var(--item);height:28px;z-index:5}.frame_bar_hide{display:none!important;}.frame_bar>div>div{background-color:var(--off-color);width:36px;height:28px;-webkit-mask-position:center;-webkit-mask-repeat:no-repeat;-webkit-mask-size:18px;overflow:hidden;display:inline-block}.frame_bar_2{display:none}.frame_bar_2:hover,.frame_bar_3:hover,.frame_bar_4:hover{background:var(--tools)}.frame_bar_1>div{-webkit-mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='none' d='M0 0h24v24H0V0z'/%3E%3Cpath d='M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z'/%3E%3C/svg%3E")}.frame_bar_2>div{-webkit-mask-image:url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!-- Generator: Adobe Illustrator 22.1.0, SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3E%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 24 24' style='enable-background:new 0 0 24 24;' xml:space='preserve'%3E%3Cpath d='M20.7,17.5c0.5,0,0.8-0.3,0.8-0.8V4.2c0-0.9-0.8-1.7-1.7-1.7H7.3c-0.4,0-0.8,0.3-0.8,0.8s0.3,0.8,0.8,0.8H19 c0.5,0,0.8,0.3,0.8,0.8v11.7C19.8,17.2,20.3,17.5,20.7,17.5z'/%3E%3Cpath d='M15.8,6.5H4.2c-0.9,0-1.7,0.8-1.7,1.8v11.7c0,0.8,0.8,1.6,1.7,1.6h11.7c0.9,0,1.7-0.8,1.7-1.7V8.2 C17.5,7.3,16.8,6.5,15.8,6.5z M15.8,19.1c0,0.5-0.3,0.8-0.8,0.8H5c-0.4,0-0.8-0.3-0.8-0.8V9c0-0.4,0.3-0.8,0.8-0.8h10 c0.4,0,0.8,0.3,0.8,0.8V19.1z'/%3E%3C/svg%3E%0A")}.frame_bar_3>div{-webkit-mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='24' viewBox='0 0 24 24' width='24'%3E%3Cpath d='M19,3H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z M19,18c0,0.5-0.5,1-1,1H6c-0.5,0-1-0.5-1-1V6c0-0.5,0.5-1,1-1h12c0.5,0,1,0.5,1,1V18z'/%3E%3C/svg%3E%0A")}.frame_bar_4>div{-webkit-mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='none' d='M0 0h24v24H0V0z'/%3E%3Cpath d='M18 13H6c-.55 0-1-.45-1-1s.45-1 1-1h12c.55 0 1 .45 1 1s-.45 1-1 1z'/%3E%3C/svg%3E")}.frame_bar_5{-webkit-app-region:drag;margin-top:5px;flex:1}.isMaximized .frame_bar_5{margin-top:0}.isMaximized .frame_bar_2{display:block}.isMaximized .frame_bar_3{display:none}.frame_bar_1:hover{background:var(--filter-color)!important}.frame_bar_1>div:hover{background:var(--color)!important}.parmain{height:calc(100% - 28px)}</style><div class="frame_bar"><div class="frame_bar_1"><div></div></div><div class="frame_bar_2"><div></div></div><div class="frame_bar_3"><div></div></div><div class="frame_bar_4"><div></div></div>${typeof __HEAD != "undefined" ? __HEAD : ""}<div class="frame_bar_5"></div></div>`
    document.body.insertBefore(divh, document.body.firstChild);



    document.querySelector(".frame_bar_1").addEventListener('click', function () {
        api("close");
    });
    document.querySelector(".frame_bar_4").addEventListener("click", function () {
        api("minimize");
    });
    document.querySelector(".frame_bar_2").addEventListener("click", function () {
        api("unmaximize");
    });
    document.querySelector(".frame_bar_3").addEventListener("click", function () {
        api("maximize");
    });
    // change icon when maximize or unmaximize 
    api("isMaximized").then(function (e) {
        windowsize(e)
    })

    on("maximize", function () {
        windowsize(true)
    })
    on("unmaximize", function () {
        windowsize(false)
    });

    on('enter-full-screen', function () {
        document.querySelector(".frame_bar").parentNode.classList.add("frame_bar_hide");
    })
    on('leave-full-screen', function () {
        document.querySelector(".frame_bar").parentNode.classList.remove("frame_bar_hide");
    });
    function windowsize(e) {
        if (e) {
            document.querySelector(".frame_bar").classList.add("isMaximized");
        } else {
            document.querySelector(".frame_bar").classList.remove("isMaximized");
        }
    }
}()