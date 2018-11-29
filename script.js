"use strict";function _toConsumableArray(e){if(Array.isArray(e)){for(var t=0,a=Array(e.length);t<e.length;t++)a[t]=e[t];return a}return Array.from(e)}window.$=document.querySelector.bind(document),window.$$=document.querySelectorAll.bind(document);var toJSON=function(e){return e.json()};window.lang=navigator.language.split("-")[0];var elm={app:$(".app"),list:$(".list"),saved:$(".saved-lists"),title:$(".title"),reset:$(".reset"),setName:$(".set-name"),"export":$(".export"),exportLink:$(".export-link")},pmMap={dex:[],elm:{},state:{}},init=function(){var e=new URLSearchParams(location.search),t=e.get("name")||localStorage.getItem("latestName")||"",a=e.get("dex")||"",n=void 0;if(t&&(list.name=t,n=localStorage.getItem("T="+t)||""),a||n){var r=(a+"-"+n).split("-").filter(Boolean);r=[].concat(_toConsumableArray(new Set(r))),pmMap.dex=r,r.forEach(function(e){updatePmState(e,!0)})}history.pushState(null,null,location.href.replace(location.search,""))},renderSavedNames=function(){elm.saved.innerHTML=Object.keys(localStorage).filter(function(e){return/^T\=/.test(e)}).map(function(e){return'<li>\n        <button data-name="'+e+'" data-action="delete">x</button>\n        <button data-name="'+e+'" data-action="replace">'+e.replace(/^T\=/,"")+"</button>\n      </li>"}).join("")};renderSavedNames();var list={set name(e){this.input.value!==e&&(this.input.value=e),localStorage.setItem("latestName",e)},get name(){return this.input.value},input:elm.title},updateMutilState=function(e){for(var t in pmMap.state){var a=pmMap.state[t],n=e.indexOf(t)!==-1?1:0;n!==a&&updatePmState(t,n)}};elm.reset.addEventListener("click",function(){var e=confirm("將清除 [ "+list.name+" ] 目前的勾選，是否繼續？");e&&updateMutilState([])}),elm.setName.addEventListener("click",function(){saveState(),renderSavedNames()}),elm.saved.addEventListener("click",function(e){var t=e.target;if(t.dataset&&t.dataset.action)switch(t.dataset.action){case"delete":var a=confirm("將刪除 [ "+t.dataset.name.replace(/^T\=/,"")+" ] 紀錄，是否繼續？");a&&localStorage.removeItem(t.dataset.name),renderSavedNames();break;case"replace":list.name=t.dataset.name.replace(/^T\=/,"");var n=localStorage.getItem(t.dataset.name),r=n.split("-");updateMutilState(r)}});var img=function(e){var t=e-1,a=~~(t/28),n=t%28;return"--pm-row: "+a+"; --pm-col: "+n},genPM=function(e){return'<div class="pm" data-dex="'+e.dex+'" data-state="'+e.state+'" style="'+img(e.dex)+'">'+e.dex+" "+e.name+"</div>"},renderList=function(e){elm.list.innerHTML=e.map(genPM).join(""),elm.list.addEventListener("click",clickPM),[].slice.apply($$(".pm")).forEach(function(e){var t=e.dataset;pmMap.elm[t.dex]=e,pmMap.state[t.dex]=+t.state}),init()},clickPM=function(e){var t=e.target;t.classList.contains("pm")&&updatePmState(t.dataset.dex,!+t.dataset.state)},updatePmState=function(e,t){var a=t?1:0;pmMap.elm[e].dataset.state=a,pmMap.state[e]=a,console.log(e,t+" => "+a),saveState()},saveState=function(){var e=Object.keys(pmMap.state).filter(function(e){return pmMap.state[e]}).join("-");localStorage.setItem("T="+list.name,e),list.name=list.name},remap=function(e){var t=[];for(var a in e){var n=e[a][lang]||e[+a].en;t[+a]={name:n,dex:+a,state:0}}return t.filter(Boolean)};fetch("./pm-name.json").then(toJSON).then(remap).then(renderList),elm["export"].addEventListener("click",function(){saveState();var e=list.name,t=new URLSearchParams({name:e,dex:localStorage.getItem("T="+e)});elm.exportLink.href="./",elm.exportLink.search=t.toString(),elm.exportLink.innerText="...";var a="https://cors-anywhere.herokuapp.com/tinyurl.com/api-create.php?url="+elm.exportLink.href;fetch(a).then(function(e){return e.text()}).then(function(t){console.log(t),elm.exportLink.href=t,elm.exportLink.innerText=e+": "+t})});