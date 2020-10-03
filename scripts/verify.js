var gl = document.getElementById('getLink');
var statusEle = document.getElementById('status');
var box = document.getElementById('box');
var btnGroup2 = document.getElementById('btnGroup2');
var btnGroup3 = document.getElementById('btnGroup3');
gl.onclick = () => {
    if(!gl.className.match('genericButton')) return false;
    chrome.tabs.create({active: true, url: gl.href});
};
chrome.storage.sync.get('spotifyAPITokenFD', function(object, items) {
    var samplePing = new XMLHttpRequest();
    samplePing.open(`GET`, `https://api.spotify.com/v1/me`, true);
    samplePing.onload = function() {
        try{
        var response = JSON.parse(this.response);
        if(this.status == 401) {
            statusEle.innerText = 'Your session has expired. Please reauthorize.';
        } else if(this.status == 200) {
            statusEle.innerText = 'Ready for use. (Access to ' + response.display_name + `${response.country ? `, Country: ${response.country}` : ``})`;
            chrome.storage.sync.set({country: response.country})
            gl.innerText='Reauthorize';
            var seeAll = document.createElement('a');
            seeAll.className = 'genericButton noSelect round';
            seeAll.id = 'seeAll';
            seeAll.innerText = 'See all songs.';
            chrome.storage.sync.get('seeAll', function(obj) {
                seeAll.className = `${obj.seeAll ? `disabledButton` : `genericButton`} noSelect round`;
            })
            var seeCnt = document.createElement('a');
            seeCnt.className = 'genericButton noSelect round';
            seeCnt.id = 'seeCnt';
            seeCnt.innerText = 'See region locked songs.';
            chrome.storage.sync.get('seeCnt', function(obj) {
                seeCnt.className = `${obj.seeCnt ? `disabledButton` : `genericButton`} noSelect round`;
            })
            var txt = document.createElement('div');
            txt.innerText = 'Go to an artist\'s discography page for changes to take effect!';
            txt.className = 'noSelect'
            btnGroup2.append(seeAll, seeCnt);
            seeAll.onclick = () => {
                try{
                    if(seeAll.className.match('genericButton')) {
                        seeAll.className = 'disabledButton noSelect round';
                        seeCnt.className = 'genericButton noSelect round';
                        chrome.storage.sync.set({
                            seeAll: true,
                            seeCnt: false,
                        });
                    } else {
                        seeAll.className = 'genericButton noSelect round';
                        seeCnt.className = 'genericButton noSelect round';
                        chrome.storage.sync.set({
                            seeAll: false,
                            seeCnt: false,
                        });
                    };
                } finally {
                    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
                        var tab = tabs[0];
                        chrome.runtime.sendMessage({run: 'spotifyDiscographyRequest', data: {url: tab.url, id: tab.id}});
                    })
                }
            };
            seeCnt.onclick = () => {
                try{
                    if(seeCnt.className.match('genericButton')) {
                        seeCnt.className = 'disabledButton noSelect round';
                        seeAll.className = 'genericButton noSelect round';
                        chrome.storage.sync.set({
                            seeAll: false,
                            seeCnt: true,
                        });
                    } else {
                        seeCnt.className = 'genericButton noSelect round';
                        seeAll.className = 'genericButton noSelect round';
                        chrome.storage.sync.set({
                            seeAll: false,
                            seeCnt: false,
                        });
                    };
                } finally {
                    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
                        var tab = tabs[0];
                        chrome.runtime.sendMessage({run: 'spotifyDiscographyRequest', data: {url: tab.url, id: tab.id}});
                    })
                }
            };
            chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
                var url = tabs[0].url;
                if(!/(?<=^https:\/\/open\.spotify\.com\/artist\/).*?(?=\/discography)/gmi.test(url ? url : 'No URL')) {
                    btnGroup3.append(txt);
                    box.style='height: 100px;';
                };
            });
        } else statusEle.innerText = 'Unknown error, try reopening extension or reauthorize.';
        } catch {statusEle.innerText = 'Unknown error, try reopening extension or reauthorize.';};
    };
    samplePing.setRequestHeader('Authorization', 'Bearer ' + object.spotifyAPITokenFD || 'NoToken');
    samplePing.send();
});