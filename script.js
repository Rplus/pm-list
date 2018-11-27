window.$ = document.querySelector.bind(document);
window.$$ = document.querySelectorAll.bind(document);

const toJSON = (d) => d.json();
window.lang = navigator.language.split('-')[0];

let elm = {
  app: $('.app'),
  list: $('.list'),
  saved: $('.saved-lists'),
  title: $('.title'),
  setName: $('.set-name'),
  export: $('.export'),
  exportLink: $('.export-link'),
};

let pmMap = {
  dex: [],
  elm: {},
  state: {},
};

let init = () => {
  let para = new URLSearchParams(location.search);
  let name = para.get('name') || localStorage.getItem('latestName') || '';
  let dex = para.get('dex') || '';
  let _dex;

  if (name) {
    list.name = name;
    _dex = localStorage.getItem(name) || '';
  }

  if (dex || _dex) {
    let allDex = `${dex}-${_dex}`.split('-').filter(Boolean);
    allDex = [...new Set(allDex)];
    pmMap.dex = allDex;


    allDex.forEach(dex => {
      updatePmState(dex, true);
    });
  }
  location.hash = '';
};

let renderSavedNames = () => {
  elm.saved.innerHTML =
  Object.keys(localStorage)
  .filter(name => name !== 'latestName')
  .map(name => {
    return (
      `<li>
        <button data-name="${name}" data-action="delete">x</button>
        <button data-name="${name}" data-action="replace">${name}</button>
      </li>`
    );
  }).join('');
};
renderSavedNames();

let list = {
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

elm.setName.addEventListener('click', () => {
  saveState();
  renderSavedNames();
});

elm.saved.addEventListener('click', (e) => {
  let target = e.target;

  if (!target.dataset || !target.dataset.action) {
    return;
  }
  switch (target.dataset.action) {
    case 'delete':
      localStorage.removeItem(target.dataset.name);
      renderSavedNames();
      break;

    case 'replace':
      list.name = target.dataset.name;

      let newState = localStorage.getItem(target.dataset.name);
      let newStates = newState.split('-');

      for (let dex in pmMap.state) {
        let oldPmState = pmMap.state[dex];
        let newPmState = (newStates.indexOf(dex) !== -1) ? 1 : 0;

        if (newPmState !== oldPmState) {
          updatePmState(dex, newPmState);
        }
      }
      break;

    default:
      break;
  }
});


let img = (dex) => {
  let index = dex - 1;
  let row = ~~(index / 28);
  let col = index % 28;
  return (
    `--pm-row: ${row}; --pm-col: ${col}`
  );
};

let genPM = (pm) => {
  return (
    `<div class="pm" data-dex="${pm.dex}" data-state="${pm.state}" style="${img(pm.dex)}">${pm.dex} ${pm.name}</div>`
  );
};

let renderList = (pms) => {
  elm.list.innerHTML = pms.map(genPM).join('');
  elm.list.addEventListener('click', clickPM);

  [].slice.apply($$('.pm')).forEach(pmElm => {
    let data = pmElm.dataset;
    pmMap.elm[data.dex] = pmElm;
    pmMap.state[data.dex] = +data.state;
  });

  init();
};

let clickPM = (e) => {
  let pm = e.target;
  if (!pm.classList.contains('pm')) {
    return;
  }
  updatePmState(pm.dataset.dex, !+pm.dataset.state);
};

let updatePmState = (dex, state) =>{
  let _state = state ? 1 : 0;
  pmMap.elm[dex].dataset.state = _state;
  pmMap.state[dex] = _state;
  console.log(dex, `${state} => ${_state}`);
  saveState();
};

let saveState = () => {
  let state = Object.keys(pmMap.state).filter(dex => pmMap.state[dex]).join('-');
  localStorage.setItem(list.name, state);
  list.name = list.name;
};

let remap = (data) => {
  let pms = [];
  for (let dex in data) {
    let name = data[dex][lang] || data[+dex].en;
    pms[+dex] = {
      name: name,
      dex: +dex,
      state: 0,
    };
  }
  return pms.filter(Boolean);
};

fetch('./pm-name.json').then(toJSON).then(remap).then(renderList);

elm.export.addEventListener('click', () => {
  saveState();
  let name = list.name;
  let para = new URLSearchParams({
    name: name,
    dex: localStorage.getItem(name),
  });
  elm.exportLink.href = '/';
  elm.exportLink.search = para.toString();
  elm.exportLink.innerText = '...';

  let url = `https://script.google.com/macros/s/AKfycbzpbnnYoIv28lkcezbaj170ot7nNkHZMUvI7FI5UBUaQrdD3Kw/exec?url=${encodeURIComponent(elm.exportLink.href)}`;

  fetch(url)
  .then(d => d.text())
  .then(d => {
    console.log(d);
    elm.exportLink.href = d;
    elm.exportLink.innerText = `${name}: ${d}`;
  });
});