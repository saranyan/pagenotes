/*
 * Copyright 2012 Google Inc. All Rights Reserved.
 * @author manugarg@google.com (Manu Garg)

 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *

 * Directive for JSLint, so that it doesn't complain about these names not being
 * defined.
 */
/*global chrome, document, localStorage, window */

var bgPage = chrome.extension.getBackgroundPage();

// Global variable for selected tab.
var tab;

function e(id) {
  return document.getElementById(id);
}

function enableEdit() {
  e('notes').contentEditable = true;
  e('notes').style.color = '#000';
  e('notes').style.backgroundColor = '#FFFFFF';
  e('notes').style.minHeight = '32px';
  e('notes').focus();
  e('edit').innerHTML = 'Save';
}

function afterEdit() {
  e('notes').contentEditable = false;
  e('notes').style.color = '#111';
  e('notes').style.backgroundColor = '#EFEFEF';
  e('notes').style.minHeight = '';
  saveNotes();
  e('edit').innerHTML = 'Edit';
  window.close();
}

function editButton() {
  if (e('edit').innerHTML.trim() === 'Save') {
    afterEdit();
  } else if (e('edit').innerHTML.trim() === 'Edit') {
    enableEdit();
  }
}

function saveNotes() {
  var data = e('notes').innerHTML.replace(/&nbsp;/gi, ' ').trim();
  if (e('sitelevel').checked === false) {
    bgPage.pageNotes.set(tab.url, data);
  } else {
    bgPage.pageNotes.remove(tab.url);
    bgPage.pageNotes.set(tab.host(), data);
  }
  bgPage.updateBadgeForTab(tab);
  localStorage.lastModTime = new Date().getTime();
}

function handleSiteLevelToggle() {
  // Handle this toggle, only if we are not in edit mode already.
  // This button reads 'Save' in edit mode.
  if (e('edit').innerHTML.trim() === 'Edit') {
    if (e('sitelevel').checked === false) {
      bgPage.pageNotes.set(tab.url, bgPage.pageNotes.get(tab.host()));
    } else {
      bgPage.pageNotes.set(tab.host(), bgPage.pageNotes.get(tab.url));
      bgPage.pageNotes.remove(tab.url);
    }
  }
}

function setupEventHandlers() {
  e('edit').addEventListener('click', editButton);
  document.addEventListener('keydown', function (event) {
    if (event.which === 13 && !event.shiftKey) {
      event.target.blur();
      event.preventDefault();
      afterEdit();
    }
  }, true);
  e('sitelevel').addEventListener('change', handleSiteLevelToggle);
}

function fixDeleteButton(key) {
  if (key === ''){
    e('delete').disabled = true;
    return;
  }
  callback = function () {
    bgPage.updateBadgeForTab(tab);
    window.close();
  };
  e('control-div').replaceChild(
      bgPage.deleteButton(
          'Delete', key, callback,
          'Are you sure you want to delete notes for this page? '),
      e('delete'));
}

function updatePopUpForTab(currentTab) {
  tab = currentTab;
  tab.host = function () {
    return bgPage.getHostFromUrl(tab.url);
  };
  e('sitelevel_label').innerHTML = 'Apply to "' + tab.host() + '"';
  // Get notes for the current tab and display.
  var key = '';
  if (bgPage.pageNotes.get(tab.url)) {
    e('notes').innerHTML = bgPage.pageNotes.get(tab.url);
    key = tab.url;
  } else if (bgPage.pageNotes.get(tab.host())) {
    e('notes').innerHTML = bgPage.pageNotes.get(tab.host());
    e('sitelevel').checked = true;
    key = tab.host();
  } else {
    enableEdit();
  }
  fixDeleteButton(key);

  if (!localStorage.gFile) {
    document.getElementById("setup-sync").style.visibility = "";
  }
}

window.setTimeout(function () { e('sitelevel').blur(); }, 100);

document.addEventListener('DOMContentLoaded', function () {
  setupEventHandlers();
  chrome.tabs.getSelected(null, updatePopUpForTab);
});
