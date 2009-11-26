/*
 * 2009-11-21
 * This code is based on chromegestures (http://code.google.com/p/chromegestures/).
 */

var MgActions = {
  newWindow: function() {
    chrome.extension.sendRequest({action: "new_window"});
  },
  newTab: function() {
    window.open("http://www.google.com");
  },
  blankTab: function() {
    window.open("about:blank");
  },
  closeTab: function() {
    chrome.extension.sendRequest({action: "close_tab"});
  },
  historyBack: function() {
    history.back();
  },
  historyForward: function() {
    history.forward();
  },
  reload: function() {
    location.reload();
  },
  rightTab: function() {
    chrome.extension.sendRequest({action: "right_tab"});
  },
  leftTab: function() {
    chrome.extension.sendRequest({action: "left_tab"});
  },
  goToTop: function() {
    window.scrollTo(0, 0);
  },
  goToBottom: function() {
    var root = document.documentElement;
    window.scrollTo(0, root.scrollHeight - root.clientHeight);
  }
};

var Mg = {
  gestureDefs: {
    wheelDown: MgActions.rightTab,
    wheelUp: MgActions.leftTab,
    "U": MgActions.newTab,
    "D": MgActions.newWindow,
    "L": MgActions.historyBack,
    "R": MgActions.historyForward,
    "3,1": MgActions.historyBack,
    "1,3": MgActions.historyForward,
    "U,L": MgActions.leftTab,
    "U,R": MgActions.rightTab,
    "D,R": MgActions.closeTab,
    "U,D": MgActions.reload,
    "U,D,U": MgActions.goToTop,
    "D,U,D": MgActions.goToBottom
  },
  thresholds: {
    click: 1000,
    time: 30,
    squareOfDistance: 64
  },
  pb: null,  // Type of the butotn pressed before
  px: 0,
  py: 0,
  past: new Date(),
  gesture: [],
  clickGesturing: false,

  determineMotion: function (dx, dy) {
    var abs = {
      dx: Math.abs(dx),
      dy: Math.abs(dy)
    };
    if ((abs.dx * abs.dx + abs.dy * abs.dy) < Mg.thresholds.squareOfDistance) {
      return null;
    } else {
      document.oncontextmenu = function () { return false; };
    }
    if (abs.dy > abs.dx) {
      return dy < 0 ? "U" : "D";
    } else {
      return dx > 0 ? "R" : "L";
    }
  },

  mousemove: function(e) {
    var now = new Date(),
      x = e.clientX,
      y = e.clientY,
      dt = now.getTime() - Mg.past.getTime(),
      dx, dy, motion;
    if (dt < Mg.thresholds.time) {
      return;
    } else {
      dx = x - Mg.px;
      dy = y - Mg.py;
      Mg.px = x;
      Mg.py = y;
      motion = Mg.determineMotion(dx, dy);
      if (motion && motion != Mg.gesture[Mg.gesture.length - 1]) {
        if (Mg.gesture.length > 4) {
          Mg.gesture = [motion];
        } else {
          Mg.gesture.push(motion);
        }
        console.log(Mg.gesture.toString());
      }
      Mg.past = now;
    }
  },

  mousescroll: function(e) {
    document.oncontextmenu = function () { return false; };
    event.preventDefault();
    if (e.wheelDelta < 0) {
      Mg.gestureDefs.wheelDown();
    } else {
      Mg.gestureDefs.wheelUp();
    }
    return false;
  },

  mousedown: function(e) {
    var now = new Date(),
      dt = now.getTime() - Mg.past.getTime();

    if (e.which == 3) {
      document.oncontextmenu = function () { return true; };
      Mg.px = e.clientX;
      Mg.py = e.clientY;
      window.addEventListener("mousemove", Mg.mousemove);
      window.addEventListener("mousewheel", Mg.mousescroll);
    }

    if (dt < Mg.thresholds.click && Mg.pb != e.which) {
      Mg.gesture = [Mg.pb, e.which];
      Mg.clickGesturing = true;
    }
    Mg.pb = e.which;
    Mg.past = now;
  },

  removeGestureListener: function () {
    window.removeEventListener("mousemove", Mg.mousemove);
    window.removeEventListener("mousewheel", Mg.mousescroll);
    Mg.gesture = [];
  },

  mouseup: function(e) {
    var handler;

    if (e.which == 3) {
      e.preventDefault();
      e.stopPropagation();
      chrome.extension.sendRequest({action: "remove_gesture_listener"});
      handler = Mg.gestureDefs[Mg.gesture];
      Mg.removeGestureListener();
      if (handler) { handler(); }
    }

    if (Mg.clickGesturing) {
      document.oncontextmenu = function () { return false; };
      e.preventDefault();
      e.stopPropagation();
      Mg.clickGesturing = false;
      console.log("click " + Mg.gesture.toString());
    }
  },

  simulateMouseEvent: function (eventName, button) {
    var evt = document.createEvent("MouseEvents");
    evt.initMouseEvent(eventName, true, true,
                       window, 0, 0, 0, 0, 0,
                       false, false, false, false, button, null);
    document.documentElement.dispatchEvent(evt);
  },

  requestHandler: function(request, sender, sendResponse) {
    sendResponse({});
    switch (request.action) {
    case "right_button_down":
      Mg.simulateMouseEvent("mousedown", 2);
      break;
    case "remove_gesture_listener":
      Mg.removeGestureListener();
      break;
    case "update_parameter":
      Mg.thresholds = request.data.thresholds;
      break;
    }
  }
};

document.addEventListener("DOMContentLoaded", function () {
  chrome.extension.sendRequest(
    {action: "get_parameter"},
    function (response) {
      Mg.thresholds = response.thresholds;
    });
  
  window.addEventListener("mousedown", Mg.mousedown, false);
  window.addEventListener("mouseup", Mg.mouseup, false);
  chrome.extension.onRequest.addListener(Mg.requestHandler);
});
