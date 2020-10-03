chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
      chrome.declarativeContent.onPageChanged.addRules([
        {
          conditions: [
            new chrome.declarativeContent.PageStateMatcher({
              pageUrl: { urlMatches: "open\.spotify\.com"}
            })
          ],
          actions: [ 
                new chrome.declarativeContent.ShowPageAction()
            ]
        }
      ]);
    });
  });

chrome.tabs.onActivated.addListener(function(info){
  chrome.tabs.get(info.tabId, function(change){
    if(!/^https:\/\/open\.spotify\.com/gmi.test(change ? typeof change.url == 'string' ? change.url : 'noURL' : 'noURL')){
      chrome.pageAction.setTitle({tabId: info.tabId, title: 'Spotify Full Discography (Inactive)'})
      chrome.pageAction.setPopup({tabId: info.tabId, popup: ''});
      chrome.pageAction.setIcon({path: {"16": "/icns/disabledIcon/disabledIcon16px.png","32": "/icns/disabledIcon/disabledIcon32px.png","48": "/icns/disabledIcon/disabledIcon48px.png","128": "/icns/disabledIcon/disabledIcon128px.png"}, tabId: info.tabId});
    }
    else{
      chrome.pageAction.setTitle({tabId: info.tabId, title: 'Spotify Full Discography (Idle)'});
      chrome.pageAction.setPopup({tabId: info.tabId, popup: 'scripts/html/popup.html'});
      chrome.pageAction.setIcon({path: {"16": "/icns/idleIcon/idleIcon16px.png","32": "/icns/idleIcon/idleIcon32px.png","48": "/icns/idleIcon/idleIcon48px.png","128": "/icns/idleIcon/idleIcon128px.png"}, tabId: info.tabId});
      if(/(?<=^https:\/\/open\.spotify\.com\/#access_token=).*?(?=&)/gmi.test(change.url)) {
        var token = change.url.match(/(?<=^https:\/\/open\.spotify\.com\/#access_token=).*?(?=&)/)[0];
        chrome.storage.sync.set({spotifyAPITokenFD: token});
      };
      if(/(?<=^https:\/\/open\.spotify\.com\/artist\/).*?(?=\/discography)/gmi.test(change.url)) {
        runApi(change.url, info.tabId);
      };
    };
    });
});
chrome.tabs.onUpdated.addListener(function (tabId, change, tab){
  if(!/^https:\/\/open\.spotify\.com/gmi.test(change ? typeof tab.url == 'string' ? tab.url : 'noURL' : 'noURL')){
      chrome.pageAction.setTitle({tabId: tabId, title: 'Spotify Full Discography (Inactive)'})
      chrome.pageAction.setPopup({tabId: tabId, popup: ''});
      chrome.pageAction.setIcon({path: {"16": "/icns/disabledIcon/disabledIcon16px.png","32": "/icns/disabledIcon/disabledIcon32px.png","48": "/icns/disabledIcon/disabledIcon48px.png","128": "/icns/disabledIcon/disabledIcon128px.png"}, tabId: tabId});
    }
    else{
      chrome.pageAction.setTitle({tabId: tabId, title: 'Spotify Full Discography (Idle)'});
      chrome.pageAction.setPopup({tabId: tabId, popup: 'scripts/html/popup.html'});
      chrome.pageAction.setIcon({path: {"16": "/icns/idleIcon/idleIcon16px.png","32": "/icns/idleIcon/idleIcon32px.png","48": "/icns/idleIcon/idleIcon48px.png","128": "/icns/idleIcon/idleIcon128px.png"}, tabId: tabId});
      if(/(?<=^https:\/\/open\.spotify\.com\/#access_token=).*?(?=&)/gmi.test(tab.url)) {
        var token = tab.url.match(/(?<=^https:\/\/open\.spotify\.com\/#access_token=).*?(?=&)/)[0];
        chrome.storage.sync.set({spotifyAPITokenFD: token});
      };
      if(/(?<=^https:\/\/open\.spotify\.com\/artist\/).*?(?=\/discography)/gmi.test(tab.url)) {
        runApi(tab.url, tabId);
      };
    };
});
chrome.runtime.onMessage.addListener(function(request, sender) {
  if(request.run == 'spotifyDiscographyRequest') {
    runApi(request.data.url, request.data.id);
  };
});

function runApi(url, id) {
  if(/(?<=^https:\/\/open\.spotify\.com\/artist\/).*?(?=\/discography)/gmi.test(url)) {
    console.log(id)
    chrome.pageAction.setTitle({tabId: id, title: 'Spotify Full Discography (Active)'});
    chrome.pageAction.setPopup({tabId: id, popup: 'scripts/html/popup.html'});
    chrome.pageAction.setIcon({path: {"16": "/icns/activeIcon/activeIcon16px.png","32": "/icns/activeIcon/activeIcon32px.png","48": "/icns/activeIcon/activeIcon48px.png","128": "/icns/activeIcon/activeIcon128px.png"}, tabId: id});
    var artist = url.match(/(?<=^https:\/\/open\.spotify\.com\/artist\/).*?(?=\/discography)/)[0];
    chrome.storage.sync.get(null, function(obj) {
      if(obj.seeAll) {
        runHttpRequest(artist, obj, 0, null, null);
      } else if(obj.seeCnt) {
        runHttpRequest(artist, obj, 0, obj.country || 'US', obj.country ? null : `Country not provided or given access defaulting to US as region.`);
      };
    });
  };
};

function runHttpRequest(artist, obj, offset, country, note, items) {
  if(!Array.isArray(items)) {
    items = [];
  };
  var baseURL = `https://api.spotify.com/v1/artists/${artist}/albums?offset=${offset}&limit=50&include_groups=album,single,compilation,appears_on${country ? `&market=${country}` : ``}`;
  var rq = new XMLHttpRequest();
  rq.open('GET', baseURL);
  rq.setRequestHeader('Authorization', 'Bearer ' + obj.spotifyAPITokenFD);
  rq.onload = function() {
    try{
      var data = JSON.parse(this.response);
      if(this.status == 401 || this.status == 404 || this.status == 400) {
        switch(this.status) {
          case 400:
            chrome.tabs.executeScript({code:`var bar = [...document.getElementsByClassName('ExtraControls')][0];var errTxt = document.createElement('div');errTxt.id='errtxtdiscography';errTxt.innerText = 'Discography Error: Bad Request';if(!document.getElementById('errtxtdiscography')){bar.parentNode.insertBefore(errTxt, bar)};setTimeout(() => {document.getElementById('errtxtdiscography').remove();}, 5000);`});
          break;
          case 401:
            chrome.tabs.executeScript({code:`var bar = [...document.getElementsByClassName('ExtraControls')][0];var errTxt = document.createElement('div');errTxt.id='errtxtdiscography';errTxt.innerText = 'Discography Error: Token expired';if(!document.getElementById('errtxtdiscography')){bar.parentNode.insertBefore(errTxt, bar)};setTimeout(() => {document.getElementById('errtxtdiscography').remove();}, 5000);`});
          break;
          case 404:
            chrome.tabs.executeScript({code:`var bar = [...document.getElementsByClassName('ExtraControls')][0];var errTxt = document.createElement('div');errTxt.id='errtxtdiscography';errTxt.innerText = 'Discography Error: Not found';if(!document.getElementById('errtxtdiscography')){bar.parentNode.insertBefore(errTxt, bar)};setTimeout(() => {document.getElementById('errtxtdiscography').remove();}, 5000);`});
          break;
        }
      } else if(this.status == 200) {
          items.push(data.items);
        if(data.items.length == 50) {
          runHttpRequest(artist, obj, offset + 50, country, note, items);
        } else {
          var data = JSON.stringify([].concat.apply([], items).sort((a, b) => parseInt(b.release_date.slice(0, 4)) - parseInt(a.release_date.slice(0, 4))));
          setTimeout(() => {
            chrome.tabs.executeScript({code:`var data = ${data}`}, function() {
              chrome.tabs.executeScript({file: '/scripts/inject.js'});
            });
          }, 100)
        };
      } else {
        runHttpRequest(artist, obj, offset, country, note, items);
      };
    } catch {
      runHttpRequest(artist, obj, offset, country, note, items);
    };
  };
  rq.send();
};