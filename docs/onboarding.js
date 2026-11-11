/* REQ-1.1：可跳过的首次偏好引导，不涉及账户或收藏数据。 */
(() => {
  const DONE = 'canteen_onboarding_v1';
  const dialog = document.createElement('dialog');
  dialog.className = 'welcome-dialog';
  dialog.setAttribute('aria-labelledby', 'welcome-title');
  document.body.append(dialog);
  const groups={'菜系风味':['日式','韩式','川湘','粤式'],'想吃什么':['炸物','烤肉','面食','盖饭','轻食','汤水','下饭'],'口味':['清淡','微辣','中辣','麻辣','酸甜','甜口','浓郁'],'饮食偏好':['高蛋白','少油','素食']};
  const aliases={日式:'日本 寿司',韩式:'韩世 韩国',炸物:'炸鸡 薯条',微辣:'辣椒',中辣:'辣椒',高蛋白:'蛋白质'};
  let draft, opener, category='菜系风味', query='', busy=false;
  function renderTags(){
    const root=dialog.querySelector('#welcome-tastes');root.replaceChildren();
    const options=query?TASTES.filter(t=>(t+' '+(aliases[t]||'')).includes(query)):groups[category];
    dialog.querySelector('#category-title').textContent=query?'搜索结果':category;
    const buttonFor=(t,remove=false)=>{
      const b=document.createElement('button');b.type='button';b.className='chip';b.textContent=t+(remove?' ×':'');b.classList.toggle('on',draft.tastes.includes(t));b.setAttribute('aria-pressed',String(draft.tastes.includes(t)));
      b.onclick=()=>{if(busy)return;draft.tastes=draft.tastes.includes(t)?draft.tastes.filter(x=>x!==t):[...draft.tastes,t];renderTags();};return b;
    };
    options.forEach(t=>root.append(buttonFor(t)));
    if(!options.length)root.textContent='没有找到标签，试试日式、炸物或辣。';
    const selected=dialog.querySelector('#selected-tags');selected.replaceChildren();draft.tastes.forEach(t=>selected.append(buttonFor(t,true)));
    if(!draft.tastes.length)selected.textContent='还没选？也可以直接开始浏览。';
    dialog.querySelector('#selected-count').textContent='已选 '+draft.tastes.length+' 项';
    const missing=draft.tastes.filter(t=>!DISHES.some(d=>d.tastes.includes(t)));
    dialog.querySelector('#coverage-note').textContent=missing.length?'当前样例菜单尚无这些标签的数据：'+missing.join('、')+'。会保存喜好，暂不声称匹配。':'匹配越多越靠前，不要求每道菜满足全部喜好。';
    dialog.querySelectorAll('[data-category]').forEach(b=>{b.classList.toggle('active',!query&&b.dataset.category===category);b.setAttribute('aria-pressed',String(!query&&b.dataset.category===category));});
  }
  function open() {
    opener = document.activeElement; category='菜系风味';query='';
    draft = { tastes: [...prefs.tastes], excluded: [...prefs.excluded] };
    dialog.innerHTML = '<p class="welcome-eyebrow">让第一餐更合心意</p><h2 id="welcome-title">今天想吃什么口味？</h2><p class="welcome-intro">选几项，让推荐更合你心意。也可以直接开始浏览。</p><h3>喜欢的口味 <small>可多选，也可不选</small></h3><div class="chips" id="welcome-tastes"></div><details><summary>需要避开的食材 <small>可不选 · 最多 5 项</small></summary><div class="chips" id="welcome-excludes"></div></details><p class="welcome-note">无需登录即可使用。偏好仅保存在当前浏览器，可随时在设置中调整。</p><p id="welcome-error" role="status"></p><div class="welcome-actions"><button class="btn btn-block" type="button" data-welcome-save>开始推荐</button><button class="btn btn-soft btn-block" type="button" data-welcome-skip>先随便看看</button></div>';
    dialog.classList.add('preference-picker');
    dialog.querySelector('#welcome-title').textContent='今天想吃哪一口？';
    dialog.querySelector('.welcome-intro').textContent='辣一点，也可以高蛋白。跨分类多选，随时能调整。';
    const tasteRoot=dialog.querySelector('#welcome-tastes');
    const heading=tasteRoot.previousElementSibling;heading.remove();
    const layout=document.createElement('div');layout.innerHTML='<label for="tag-search">搜索标签</label><input id="tag-search" type="search" placeholder="日式、炸鸡、辣椒…"><div class="preference-layout"><nav class="preference-categories" aria-label="偏好分类"></nav><section><h3 id="category-title"></h3></section></div><div class="selected-heading"><strong id="selected-count"></strong><button id="clear-tags" type="button">清空喜好</button></div><div class="chips" id="selected-tags"></div><p id="coverage-note" aria-live="polite"></p>';
    tasteRoot.before(layout);layout.querySelector('section').append(tasteRoot);
    for(const name of Object.keys(groups)){const b=document.createElement('button');b.type='button';b.textContent=name;b.dataset.category=name;b.onclick=()=>{category=name;query='';dialog.querySelector('#tag-search').value='';renderTags();};layout.querySelector('nav').append(b);}
    layout.querySelector('#tag-search').oninput=e=>{query=e.target.value.trim();renderTags();};
    layout.querySelector('#clear-tags').onclick=()=>{if(!busy){draft.tastes=[];renderTags();}};
    renderTags();
    for (const [id, values, key] of [['welcome-excludes', EXCLUDES, 'excluded']]) {
      const container = dialog.querySelector('#' + id);
      for (const value of values) {
        const button = document.createElement('button');
        button.type = 'button'; button.textContent = value;
        button.className = 'chip';
        const update = () => { const selected = draft[key].includes(value); button.classList.toggle('on', selected); button.setAttribute('aria-pressed', String(selected)); };
        update();
        button.addEventListener('click', () => {
          const selected = draft[key].includes(value);
          if (!selected && key === 'excluded' && draft[key].length >= 5) { dialog.querySelector('#welcome-error').textContent = '最多选择 5 项忌口，请先取消一项。'; return; }
          draft[key] = selected ? draft[key].filter(x => x !== value) : [...draft[key], value];
          dialog.querySelector('#welcome-error').textContent = ''; update();
        });
        container.append(button);
      }
    }
    dialog.showModal();
  }
  async function finish(commit) {
    if(busy)return;busy=true;
    const next = { ...prefs, tastes: draft.tastes, excluded: draft.excluded };
    try {
      if (commit) { localStorage.setItem(LS.prefs, JSON.stringify(next)); prefs = next; }
      localStorage.setItem(DONE, 'yes');
    } catch (e) {
      if (commit) { busy=false; dialog.querySelector('#welcome-error').textContent = '无法保存：'+e.message; return; }
      toast('本次已跳过；浏览器无法保存此选择，下次可能再次提示。');
    }
    
    busy=false;dialog.close();
    if (commit) { ui.kw = ''; ui.taste = ''; ui.selectedTastes=[]; location.hash = '#home'; route(); toast('已保存偏好，可在设置中随时调整。'); }
    else if (opener && opener.isConnected) opener.focus();
  }
  dialog.addEventListener('click', e => {
    if (e.target.closest('[data-welcome-save]')) finish(true);
    if (e.target.closest('[data-welcome-skip]')) finish(false);
  });
  dialog.addEventListener('cancel', e => { e.preventDefault(); finish(false); });
  document.addEventListener('click', e => { if (e.target.closest('[data-open-onboarding]')) open(); });
  (() => {
  try {
    // 已有保存记录（包括主动保存的空偏好）也不重复询问。
    if (!localStorage.getItem(DONE) && localStorage.getItem(LS.prefs) === null) open();
  } catch (_) { /* 存储不可用时，仍可通过设置页主动打开。 */ }
  })();
})();
