/*
 * 2009-11-21
 * This code is based on ChromeGuestures
 * http://ss-o.net/chrome_extension/
 * http://bitbucket.org/os0x/chromeguestures/
 */

function switchToRightTab(tab) {
  chrome.tabs.getAllInWindow(tab.windowId,
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
  chrome.tabs.getAllInWindow(tab.windowId,
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
  chrome.tabs.getSelected(null,
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

function messageDispatcher(request, sender) {
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
  }
}

window.addEventListener("load", function () {
                          chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
                                                                   sendResponse({});
                                                                   messageDispatcher(request, sender);
                                                                 });
                        });
