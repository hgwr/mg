var bg = chrome.extension.getBackgroundPage();

function $(s) { return document.getElementById(s); }

var fields = ['click', 'time', 'squareOfDistance'];

function update() {
  fields.forEach(function (k) {
    bg.MgData.thresholds[k] = $('thresholds_' + k).value;
  });
  bg.MgHelper.saveData();
  chrome.extension.sendRequest({action: "update_parameter_all"});
}

function restoreDefaults() {
  fields.forEach(function (k) {
    $('thresholds_' + k).value = bg.MgHelper.DEFAULT_THRESHOLDS[k];
  });
  update();
}

function prepareForm() {
  fields.forEach(function (k) {
    $('thresholds_' + k).value = bg.MgData.thresholds[k];
  });
}

function onload() {
  prepareForm();
  $('update').addEventListener('click', update);
  $('restoreDefaults').addEventListener('click', restoreDefaults);
}

window.addEventListener("load", onload);
