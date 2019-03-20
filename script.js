'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

window.$ = document.querySelector.bind(document);
window.$$ = document.querySelectorAll.bind(document);

var toJSON = function toJSON(d) {
  return d.json();
};
window.lang = navigator.language.split('-')[0];

var elm = {
  app: $('.app'),
  list: $('.list'),
  saved: $('.saved-lists'),
  title: $('.title'),
  reset: $('.reset'),
  setName: $('.set-name'),
  export: $('.export'),
  exportLink: $('.export-link'),
  checkedNum: $('.checked-num'),
  copy: $('.copy'),
  inverseCopy: $('.inverse-copy')
};

var pmMap = {
  dex: [],
  elm: {},
  state: {}
};

var init = function init() {
  var para = new URLSearchParams(location.search);
  var paraname = para.get('name');
  var paradex = para.get('dex') || '';
  var hasOldName = paraname && !!localStorage.getItem('T=' + paraname);
  var isOverwriteMode = hasOldName && confirm('Confirm to overwirte ' + paraname + '?');

  if (isOverwriteMode) {
    localStorage.setItem('T=' + paraname, paradex);
  }

  var name = isOverwriteMode ? paraname : localStorage.getItem('latestName') || '';
  var dex = localStorage.getItem('T=' + name) || '';

  if (name) {
    list.name = name;
  }

  if (dex) {
    var allDex = dex.split('-').filter(Boolean);
    allDex = [].concat(_toConsumableArray(new Set(allDex)));
    pmMap.dex = allDex;

    allDex.forEach(function (dex) {
      updatePmState(dex, true);
    });
  }

  history.pushState(null, null, location.href.replace(location.search, ''));
};

var renderSavedNames = function renderSavedNames() {
  elm.saved.innerHTML = Object.keys(localStorage).filter(function (name) {
    return (/^T\=/.test(name)
    );
  }).map(function (name) {
    return '<li>\n        <button data-name="' + name + '" data-action="delete">x</button>\n        <button data-name="' + name + '" data-action="replace">' + name.replace(/^T\=/, '') + '</button>\n      </li>';
  }).join('');
};
renderSavedNames();

var list = {
  set name(value) {
    if (this.input.value !== value) {
      this.input.value = value;
    }
    localStorage.setItem('latestName', value);
  },
  get name() {
    return this.input.value;
  },
  input: elm.title
};

var updateMutilState = function updateMutilState(newStates) {
  for (var dex in pmMap.state) {
    var oldPmState = pmMap.state[dex];
    var newPmState = newStates.indexOf(dex) !== -1 ? 1 : 0;

    if (newPmState !== oldPmState) {
      updatePmState(dex, newPmState);
    }
  }
};

elm.reset.addEventListener('click', function () {
  var ans = confirm('\u5C07\u6E05\u9664 [ ' + list.name + ' ] \u76EE\u524D\u7684\u52FE\u9078\uFF0C\u662F\u5426\u7E7C\u7E8C\uFF1F');
  if (!ans) {
    return;
  }
  updateMutilState([]);
});

elm.setName.addEventListener('click', function () {
  saveState();
  renderSavedNames();
});

elm.saved.addEventListener('click', function (e) {
  var target = e.target;

  if (!target.dataset || !target.dataset.action) {
    return;
  }
  switch (target.dataset.action) {
    case 'delete':
      var ans = confirm('\u5C07\u522A\u9664 [ ' + target.dataset.name.replace(/^T\=/, '') + ' ] \u7D00\u9304\uFF0C\u662F\u5426\u7E7C\u7E8C\uFF1F');
      ans && localStorage.removeItem(target.dataset.name);
      renderSavedNames();
      break;

    case 'replace':
      list.name = target.dataset.name.replace(/^T\=/, '');

      var newState = localStorage.getItem(target.dataset.name);
      var newStates = newState.split('-');

      updateMutilState(newStates);
      break;

    default:
      break;
  }
});

var img = function img(dex) {
  var index = dex - 1;
  var row = ~~(index / 28);
  var col = index % 28;
  return '--pm-row: ' + row + '; --pm-col: ' + col;
};

var genPM = function genPM(pm) {
  return '<div class="pm" data-dex="' + pm.dex + '" data-state="' + pm.state + '" style="' + img(pm.dex) + '">' + pm.dex + ' ' + pm.name + '</div>';
};

var renderList = function renderList(pms) {
  elm.list.innerHTML = pms.map(genPM).join('');
  elm.list.addEventListener('click', clickPM);

  [].slice.apply($$('.pm')).forEach(function (pmElm) {
    var data = pmElm.dataset;
    pmMap.elm[data.dex] = pmElm;
    pmMap.state[data.dex] = +data.state;
  });

  init();
};

var clickPM = function clickPM(e) {
  var pm = e.target;
  if (!pm.classList.contains('pm')) {
    return;
  }
  updatePmState(pm.dataset.dex, !+pm.dataset.state);
};

var updatePmState = function updatePmState(dex, state) {
  var _state = state ? 1 : 0;
  pmMap.elm[dex].dataset.state = _state;
  pmMap.state[dex] = _state;
  console.log(dex, state + ' => ' + _state);
  saveState();
  updateChecked();
};

var updateChecked = function updateChecked() {
  var checkedState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

  var checked = Object.keys(pmMap.state).filter(function (dex) {
    return pmMap.state[dex] === checkedState;
  });
  elm.checkedNum.value = checked.join();
  elm.copy.dataset.count = checked.length;
};

elm.inverseCopy.addEventListener('click', function () {
  elm.inverseCopy.dataset.checkedstate = +elm.inverseCopy.dataset.checkedstate ? 0 : 1;
  updateChecked(+elm.inverseCopy.dataset.checkedstate);
});

elm.copy.addEventListener('click', function (e) {
  elm.checkedNum.select();
  document.execCommand('copy');
  alert('\u5DF2\u8907\u88FD!\n' + elm.checkedNum.value);
  elm.checkedNum.blur();
});

var saveState = function saveState() {
  var state = Object.keys(pmMap.state).filter(function (dex) {
    return pmMap.state[dex];
  }).join('-');
  localStorage.setItem('T=' + list.name, state);
  list.name = list.name;
};

var remap = function remap(data) {
  var pms = [];
  for (var dex in data) {
    var name = data[dex][lang] || data[+dex].en;
    pms[+dex] = {
      name: name,
      dex: +dex,
      state: 0
    };
  }
  return pms.filter(Boolean);
};

fetch('./pm-name.json').then(toJSON).then(remap).then(renderList);

elm.export.addEventListener('click', function () {
  saveState();
  var name = list.name;
  var para = new URLSearchParams({
    name: name,
    dex: localStorage.getItem('T=' + name)
  });
  elm.exportLink.href = './';
  elm.exportLink.search = para.toString();
  elm.exportLink.innerText = '...';

  var url = 'https://cors-anywhere.herokuapp.com/tinyurl.com/api-create.php?url=' + elm.exportLink.href;

  fetch(url).then(function (d) {
    return d.text();
  }).then(function (d) {
    console.log(d);
    elm.exportLink.href = d;
    elm.exportLink.innerText = name + ': ' + d;
  });
});