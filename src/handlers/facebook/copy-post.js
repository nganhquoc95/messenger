const { clipboard } = require('electron');

const copyPost = (portalWin, params) => {
    try {
        // find a sensible post container at the clicked point and copy its innerText
        portalWin.webContents.executeJavaScript(`(function(){
                try{
                    var x = ${params.x || 0};
                    var y = ${params.y || 0};
                    var el = document.elementFromPoint(x, y) || document.body;
                    var selectors = ['[role="article"]','article','[data-pagelet^="FeedUnit_"]','[data-testid="post_message"]','.story_body_container','div[data-ft]'];
                    function findAncestorMatching(node){
                        var cur = node;
                        while(cur && cur !== document.body){
                            for(var i=0;i<selectors.length;i++){
                                try{ if(cur.matches && cur.matches(selectors[i])) return cur; }catch(e){}
                            }
                            cur = cur.parentElement;
                        }
                        return null;
                    }
                    var post = findAncestorMatching(el) || (function(){ var cur=el; while(cur && cur!==document.body){ if((cur.innerText||'').trim().length>20) return cur; cur=cur.parentElement;} return document.body; })();
                    return (post && (post.innerText || '').trim()) || '';
                }catch(e){ return ''; }
            })()`)
            .then(text => { if (text && text.trim()) { try { clipboard.writeText(text); } catch (e) { } } });
    } catch (e) { /* ignore */ }
}

module.exports = copyPost;