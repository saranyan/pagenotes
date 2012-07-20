/**
 * @author manugarg@gmail.com (Manu Garg)
 */
function getPageNotes(key) {
  if (localStorage.getItem('pagenotes')) {
    var pagenotes = JSON.parse(localStorage.getItem('pagenotes'));
    if (key in pagenotes)
      return pagenotes[key];
  }
  return null;
}

function setPageNotes(key, value) {
  var pagenotes;
  if (localStorage.getItem('pagenotes')) {
    pagenotes = JSON.parse(localStorage.getItem('pagenotes'));
    pagenotes[key] = value;
  } else {
    pagenotes = {};
    pagenotes[key] = value;
  }
  localStorage.setItem('pagenotes', JSON.stringify(pagenotes));
}

function removePageNotes(key) {
  if (localStorage.getItem('pagenotes')) {
    var pagenotes = JSON.parse(localStorage.getItem('pagenotes'));
    delete pagenotes[key];
    localStorage.setItem('pagenotes', JSON.stringify(pagenotes));
  }
}

function getAllPageNotes() {
  return localStorage.getItem('pagenotes');
}

function setAllPageNotes(data) {
  localStorage.removeItem('pagenotes');
  localStorage.setItem('pagenotes', data);
}

function getHostFromUrl(url) {
  var a_element = document.createElement("a");
  a_element.href = url;
  return a_element.hostname;
}

