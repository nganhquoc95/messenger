const preventOpenPost = (portalWin) => {
    // Prevent clicks that open posts when the user is selecting text or dragging
    portalWin.webContents.executeJavaScript(`
        (function(){
            try{
                var __mouseDownPos = null;
                var __suppressClickAfterSelection = false;

                document.addEventListener('mousedown', function(ev){
                    try{ __mouseDownPos = { x: ev.clientX, y: ev.clientY }; __suppressClickAfterSelection = false; }catch(e){}
                }, true);

                document.addEventListener('mouseup', function(ev){
                    try{
                        var sel = (window.getSelection && window.getSelection()) || null;
                        var text = sel ? (sel.toString && sel.toString() || '') : '';
                        var moved = false;
                        if(__mouseDownPos){
                            moved = Math.abs(ev.clientX - __mouseDownPos.x) > 3 || Math.abs(ev.clientY - __mouseDownPos.y) > 3;
                        }
                        if((text && text.trim().length > 0) || moved){
                            __suppressClickAfterSelection = true;
                            setTimeout(function(){ __suppressClickAfterSelection = false; }, 350);
                        }
                    }catch(e){}
                }, true);

                document.addEventListener('click', function(ev){
                    try{
                        if(__suppressClickAfterSelection){ ev.preventDefault(); ev.stopPropagation(); __suppressClickAfterSelection = false; }
                    }catch(e){}
                }, true);
            }catch(e){}
        })();
    `);
}

module.exports = preventOpenPost;