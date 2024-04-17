// TABS REMOVER listener - to purge memory
import data, { dataInit } from "./globals";
import { a } from "./core";

chrome.tabs.onRemoved.addListener(function (tabId) {
  a.offScreenDelete(tabId);
  // Object.prototype.hasOwnProperty.call(data.tabsGaines, a) &&
  //   data.tabsLevels[a].audioCtx.close().then(function () {
  //     delete data.tabsLevels[a];
  //     delete data.tabsGaines[a];
  //   });
});

// // CHROME SHORTCUTS
// chrome.commands.onCommand.addListener(function (command) {
//   if (command.indexOf('toggle-up') != -1) mainClicker(1);
//   if (command.indexOf('toggle-down') != -1) mainClicker(-1);
// });

async function increaseVolume() {
  onUserVolumeInteraction((_data:any) => {
    chrome.tabs.query(
      { currentWindow: true, active: true },
      function (tabArray) {
        var id = tabArray[0].id ?? -1;
        if (_data.tabsLevels.hasOwnProperty(id)) {
          var val = _data.tabsLevels[id] * 100;
          if (val <= 100) val = 150;
          else if (val <= 150) val = 300;
          else if (val <= 300) val = 500;
          else if (val <= 500) val = 800;
          else if (val <= 800) val = 100;

          _data.tabsLevels[id] = val / 100;
          a.volume(id, val);
        } else {
          chrome.browserAction.setIcon({ path: `assets/icons/icon1_${2}.png` });
          _data.tabsLevels[id] = 150 / 100;
          a.init(id, 150);
        }
      }
    );
  });
}

chrome.browserAction.onClicked.addListener(increaseVolume);

// // AUDIO CAPTURE CHANGES listener
// chrome.tabCapture.onStatusChanged.addListener(function (info) {
//   if (!data.user.fullscreen) return;
//   if (chrome.runtime.lastError) return;

//   console.log(data.user.fullscreen);
//   if (data.OS == 'mac' && info.fullscreen) {
//     chrome.windows.getCurrent(function (win) {
//       data.prevWindow = win;
//       console.log(win);
//       chrome.tabs.query({ currentWindow: true, active: true }, function (tab) {
//         data.prevWindow.tabIndex = tab[0].index;
//         if (!data.user.fullscreen)
//           chrome.windows.create(
//             {
//               type: 'popup',
//               state: 'maximized',
//               tabId: info.tabId,
//             },
//             function (e) {
//               console.log(e);
//               chrome.windows.update(e?.id ?? -1, { state: 'fullscreen' });
//             }
//           );
//       });
//     });
//   } else if (info.fullscreen && data.OS != 'mac') {
//     if (!data.prevFullScreen) {
//       chrome.windows.getCurrent(function (win) {
//         data.prevWindow = win;
//         if (data.user.fullscreen && win.id != undefined)
//           chrome.windows.update(win.id, { state: 'fullscreen' });
//       });
//     }
//   } else if (data.OS != 'mac' && data.prevWindow) {
//     chrome.windows.getCurrent(function (win) {
//       if (data.user.fullscreen && win.id != undefined)
//         chrome.windows.update(win.id, { state: data.prevWindow.state });
//     });
//   } else if (data.OS == 'mac' && data.prevWindow) {
//     if (!data.user.fullscreen)
//       chrome.tabs.move(
//         info.tabId,
//         { windowId: data.prevWindow.id, index: data.prevWindow.tabIndex },
//         () => {
//           chrome.tabs.update(info.tabId, { active: true, highlighted: true });
//         }
//       );
//   }

//   data.prevFullScreen = info.fullscreen;
// });

// NEW TABS listener - to mute if needed
chrome.tabs.onCreated.addListener(function (e) {
  if (data.user.muteall && e.id != undefined)
    chrome.tabs.update(e.id, {
      muted: !0,
    });
});

async function onUserVolumeInteraction(cb: Function) {
  const _data = await a.offScreenData();
  chrome.tabs.query(
    { currentWindow: true, active: true },
    async function (tabArray) {
      data.currentTab = tabArray[0];
      if (
        data.currentTab &&
        data.currentTab?.id &&
        !_data.tabsLevels[data.currentTab?.id]
        //  data.currentTab.audible &&
      ) {
        console.log("init again");
        _data.tabsLevels[data.currentTab?.id ?? -1] ??= 1;
        a.init(data.currentTab.id, 100, function () {
          console.log(" after init port.postMessage");
          cb(_data);
        });
      } else {
        console.log("port.postMessage", _data);
        cb(_data);
      }
    }
  );
}

// SIMPLE POPUP MESSAGES listener
chrome.runtime.onMessage.addListener(function (
  request: { how: string; endpoint: string; what: string; data: any },
  sender,
  sendResponse
) {
  if (request.endpoint == "settings") {
    data.user[request.how] = request.data;
    chrome.storage.local.set({ users: data.user });
    if (request.how == "disabled")
      request.data
        ? a.offScreenDisableAll()
        : a.init(data.currentTab?.id ?? -1, 100);
    if (request.how == "muteall") a.toMute(request.data);
    console.log(data.user);
  }
});
