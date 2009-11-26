/*
 * 2009-11-21
 * This code is based on ChromeGuestures
 * http://ss-o.net/chrome_extension/
 * http://bitbucket.org/os0x/chromeguestures/
 */

window.MgData = {
  thresholds: {
    click: 1000,
    time: 30,
    squareOfDistance: 64
  }  
};

window.MgHelper = {
  DEFAULT_THRESHOLDS: {
    click: 1000,
    time: 30,
    squareOfDistance: 64
  },
  saveData: function () {
    localStorage.MgData = JSON.stringify(window.MgData);
  }
};

function switchToRightTab(tab) {
  chrome.tabs.getAllInWindow(
    tab.windowId,
    function (tabs) {
      tabs.forEach(function (_t, i) {
        if (_t.id === tab.id) {
          var newtab = tabs[i + 1] || tabs[0];
          if (newtab) {
            chrome.tabs.update(newtab.id, { selected: true });
            chrome.tabs.sendRequest(tab.id, {action: "remove_gesture_listener"});
            chrome.tabs.sendRequest(newtab.id, {action: "right_button_down"});
          }
        }
      });
    });
}

function switchToLeftTab(tab) {
  chrome.tabs.getAllInWindow(
    tab.windowId,
    function (tabs) {
      tabs.forEach(function (_t, i) {
        if (_t.id === tab.id) {
          var newtab = tabs[i - 1] || tabs[tabs.length - 1];
          if (newtab) {
            chrome.tabs.update(newtab.id, { selected: true });
            chrome.tabs.sendRequest(tab.id, {action: "remove_gesture_listener"});
            chrome.tabs.sendRequest(newtab.id, {action: "right_button_down"});
          }
        }
      });
    });
}

function removeGestureListener() {
  chrome.tabs.getSelected(
    null,
    function(tab) {
      chrome.tabs.sendRequest(tab.id, {action: "remove_gesture_listener"});
    });
}

function newWindow() {
  chrome.windows.create({ url: "http://www.google.com/" });
}

function closeTab(tab) {
  chrome.tabs.remove(tab.id);
}

function updateParameterAllTab() {
  chrome.windows.getAll({ populate: true },
                        function (_windows) {
                          _windows.forEach(function (_window) {
                            _window.tabs.forEach(function (_tab) {
                              chrome.tabs.sendRequest(_tab.id, {action: "update_parameter", data: window.MgData});
                            });
                          });
                        });
}

function messageDispatcher(request, sender, sendResponse) {
  response = {};
  switch (request.action) {
  case "right_tab":
    switchToRightTab(sender.tab);
    break;
  case "left_tab":
    switchToLeftTab(sender.tab);
    break;
  case "remove_gesture_listener":
    removeGestureListener();
    break;
  case "new_window":
    newWindow();
    break;
  case "close_tab":
    closeTab(sender.tab);
    break;
  case "get_parameter":
    response = { thresholds: window.MgData.thresholds };
    break;
  case "update_parameter_all":
    updateParameterAllTab();
    break;
  }
  sendResponse(response);
}

window.addEventListener("load", function () {
  if (! localStorage.MgData) {
    window.MgData = { thresholds: window.MgHelper.DEFAULT_THRESHOLDS };
    localStorage.MgData = JSON.stringify(window.MgData);
  }
  window.MgData = JSON.parse(localStorage.MgData);
  
  chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
    messageDispatcher(request, sender, sendResponse);
  });
});
