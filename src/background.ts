var gainNode, audioCtx, streamer,
    tabsLevels = {},
    tabsGaines = {},
    hotkeysType = [true, true],
    fscreen = true,
    muteAll = false;

var a = {
    init: function(id, val, callback?) {
        tabsLevels[id] = parseFloat(val) / 100;
        if (Object.keys(tabsGaines).length < 6)
            chrome.tabCapture.capture({
                audio: !0,
                video: !1
            }, function(stream) {
                tabsGaines[id] = {};
                tabsGaines[id].audioCtx = new window.AudioContext;
                tabsGaines[id].streamer = stream;
                tabsGaines[id].source = tabsGaines[id].audioCtx.createMediaStreamSource(stream);
                tabsGaines[id].nodeGain = tabsGaines[id].audioCtx.createGain();
                tabsGaines[id].source.connect(tabsGaines[id].nodeGain);
                tabsGaines[id].nodeGain.connect(tabsGaines[id].audioCtx.destination);
                tabsGaines[id].nodeGain.gain.setTargetAtTime(tabsLevels[id], 0, 0.1);
                try{
                    callback();
                }catch(e){ }

            });
    },
    deInit: function(id) {
        tabsGaines[id].streamer.getAudioTracks().forEach(function(track) {
            track.stop();
        });
        Object.prototype.hasOwnProperty.call(tabsGaines, id) && tabsGaines[id].audioCtx.close()
            .then(function() {
                delete tabsGaines[id];
                delete tabsLevels[id];
            });
    },
    getTab: function(id) {
        if (tabsLevels.hasOwnProperty(id))
            return true;
        return false;
    },
    isMuted: function(callback) {
        return chrome.tabs.query({ currentWindow: true, active: true }, function(tabs) {
            if (chrome.runtime.lastError) {
                callback(false)
            }else{
                callback(tabs[0].mutedInfo.muted)
            }
        })
    },
    toMute: function(e) {
        chrome.tabs.query({}, function(tabs) {
            for (var i = 0; i < tabs.length; i++) {
                chrome.tabs.update(tabs[i].id, {
                    "muted": e
                });
            }
        });
    },
    volume: function(id, val) {
        tabsLevels[id] = parseFloat(val) / 100;
        tabsGaines[id].nodeGain.gain.setTargetAtTime(tabsLevels[id], 0, 0.1);
    }
}


chrome.runtime.onConnect.addListener(function(port) {
    // tabsGaines[tabArray[0].id].nodeGain.gain.value = parseFloat(gainLevels[tabsLevels[tabArray[0].id]]);

    port.onMessage.addListener(function(e) {
    	if(e.deInit) a.deInit(e.id);
        a.getTab(e.id) ? a.volume(e.id, e.val) : a.init(e.id, e.val);
    });
    // if (true) {}
    chrome.tabs.query({ currentWindow: true, active: true }, function(tabArray) {
        if (tabArray[0].audible && !a.getTab(tabArray[0].id)){
            a.isMuted(function(isMuted){
                a.init(tabArray[0].id, isMuted?0:100, function(){
                    port.postMessage({ tabsLevels: tabsLevels, curTab: tabArray[0] });
                })
            })
        }else{
            port.postMessage({ tabsLevels: tabsLevels, curTab: tabArray[0] });
        }
    })
})


chrome.tabs.onRemoved.addListener(function(a) {
    Object.prototype.hasOwnProperty.call(tabsGaines, a) && tabsGaines[a].audioCtx.close()
        .then(function() {
            delete tabsLevels[a];
            delete tabsGaines[a];
        })
});