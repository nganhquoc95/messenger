const hideOpenAppButtons = (portalWin) => {
    portalWin.webContents.executeJavaScript(`
        (function(){
            function hideOpenAppButtons(){
                document.querySelectorAll('.fixed-container.bottom').forEach(el => {
                    try{
                        const text = (el.innerText || el.textContent || '').toLowerCase();
                        if(text.includes('open app')){
                            el.classList.add('hidden');
                            el.style.display = 'none';
                            el.setAttribute('aria-hidden', 'true');
                        }
                    }catch(e){/* ignore cross-origin or read errors */}
                });
            }
            if(document.readyState === 'loading'){
                document.addEventListener('DOMContentLoaded', hideOpenAppButtons);
            } else {
                hideOpenAppButtons();
            }
            try{
                const observer = new MutationObserver(hideOpenAppButtons);
                observer.observe(document.documentElement || document.body, { childList: true, subtree: true });
            }catch(e){/* ignore if MutationObserver unavailable */}
        })();
    `);
}

module.exports = hideOpenAppButtons;