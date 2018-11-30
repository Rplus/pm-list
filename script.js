window.$ = document.querySelector.bind(document);
window.$$ = document.querySelectorAll.bind(document);

const toJSON = (d) => d.json();
window.lang = navigator.language.split('-')[0];

let elm = {
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
  inverseCopy: $('.inverse-copy'),
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
    _dex = localStorage.getItem(`T=${name}`) || '';
  }

  if (dex || _dex) {
    let allDex = `${dex}-${_dex}`.split('-').filter(Boolean);
    allDex = [...new Set(allDex)];
    pmMap.dex = allDex;


    allDex.forEach(dex => {
      updatePmState(dex, true);
    });
  }

  history.pushState(null, null, location.href.replace(location.search, ''));
};

let renderSavedNames = () => {
  elm.saved.innerHTML =
  Object.keys(localStorage)
  .filter(name => /^T\=/.test(name))
  .map(name => {
    return (
      `<li>
        <button data-name="${name}" data-action="delete">x</button>
        <button data-name="${name}" data-action="replace">${name.replace(/^T\=/, '')}</button>
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

let updateMutilState = (newStates) => {
  for (let dex in pmMap.state) {
    let oldPmState = pmMap.state[dex];
    let newPmState = (newStates.indexOf(dex) !== -1) ? 1 : 0;

    if (newPmState !== oldPmState) {
      updatePmState(dex, newPmState);
    }
  }
};

elm.reset.addEventListener('click', () => {
  let ans = confirm(`將清除 [ ${list.name} ] 目前的勾選，是否繼續？`);
  if (!ans) {
    return;
  }
  updateMutilState([]);
});

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
      let ans = confirm(`將刪除 [ ${target.dataset.name.replace(/^T\=/, '')} ] 紀錄，是否繼續？`);
      ans && localStorage.removeItem(target.dataset.name);
      renderSavedNames();
      break;

    case 'replace':
      list.name = target.dataset.name.replace(/^T\=/, '');

      let newState = localStorage.getItem(target.dataset.name);
      let newStates = newState.split('-');

      updateMutilState(newStates);
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
  updateChecked();
};

let updateChecked = (checkedState = 1) => {
  let checked = Object.keys(pmMap.state).filter(dex => pmMap.state[dex] === checkedState);
  elm.checkedNum.value = checked.join();
  elm.copy.dataset.count = checked.length;
};

elm.inverseCopy.addEventListener('click', () => {
  elm.inverseCopy.dataset.checkedstate = +elm.inverseCopy.dataset.checkedstate ? 0 : 1;
  updateChecked(+elm.inverseCopy.dataset.checkedstate);
});

elm.copy.addEventListener('click', (e) => {
  elm.checkedNum.select();
  document.execCommand('copy');
  alert(`已複製!\n${elm.checkedNum.value}`);
  elm.checkedNum.blur();
});

let saveState = () => {
  let state = Object.keys(pmMap.state).filter(dex => pmMap.state[dex]).join('-');
  localStorage.setItem(`T=${list.name}`, state);
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
    dex: localStorage.getItem(`T=${name}`),
  });
  elm.exportLink.href = './';
  elm.exportLink.search = para.toString();
  elm.exportLink.innerText = '...';

  let url = `https://cors-anywhere.herokuapp.com/tinyurl.com/api-create.php?url=${elm.exportLink.href}`;

  fetch(url)
  .then(d => d.text())
  .then(d => {
    console.log(d);
    elm.exportLink.href = d;
    elm.exportLink.innerText = `${name}: ${d}`;
  });
});
