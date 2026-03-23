// 动态渲染首页的“20种动物性格类型”卡片（仅名称+标签）
(function(){
  const labelMap = {
    DOM: '支配', STR: '力量', COM: '社交', SOL: '独处', AGI: '敏捷', SEC: '安全', AES: '审美'
  };

  function topTwoLabels(dims){
    const entries = Object.entries(dims || {});
    entries.sort((a,b)=>b[1]-a[1]);
    const [k1,v1] = entries[0] || [];
    const [k2,v2] = entries[1] || [];
    return [labelMap[k1]||k1, labelMap[k2]||k2].filter(Boolean);
  }

  function createCard(item){
    const card = document.createElement('article');
    card.className = 'type-card';

    const emoji = document.createElement('div');
    emoji.className = 'type-emoji';
    emoji.textContent = item.emoji;

    const name = document.createElement('div');
    name.className = 'type-name';
    name.textContent = `${item.name}型`;

    const tags = document.createElement('div');
    tags.className = 'type-tags';
    const [t1,t2] = topTwoLabels(item.dims);
    [t1,t2].forEach(t=>{
      if(!t) return;
      const span = document.createElement('span');
      span.className = 'tag';
      span.textContent = t;
      tags.appendChild(span);
    });

    card.appendChild(emoji);
    card.appendChild(name);
    card.appendChild(tags);
    return card;
  }

  async function render(){
    const grid = document.getElementById('type-grid');
    if(!grid) return;
    grid.innerHTML = '';
    try{
      const res = await fetch('animals.json');
      const animals = await res.json();
      animals.forEach(item=> grid.appendChild(createCard(item)));
    }catch(e){
      // 兜底：与文档一致的20种动物
      const fallback = [
        {name:'狗',emoji:'🐶'},{name:'猫',emoji:'🐱'},{name:'狼',emoji:'🐺'},{name:'狐',emoji:'🦊'},
        {name:'狮',emoji:'🦁'},{name:'熊',emoji:'🐻'},{name:'兔',emoji:'🐰'},{name:'仓鼠',emoji:'🐹'},
        {name:'天鹅',emoji:'🦢'},{name:'鹿',emoji:'🦌'},{name:'鹰',emoji:'🦅'},{name:'乌鸦',emoji:'🐦'},
        {name:'水豚',emoji:'🦫'},{name:'鲸',emoji:'🐋'},{name:'鹦鹉',emoji:'🦜'},{name:'章鱼',emoji:'🐙'},
        {name:'鲨鱼',emoji:'🦈'},{name:'海豚',emoji:'🐬'},{name:'浣熊',emoji:'🦝'},{name:'猫鼬',emoji:'🦡'}
      ];
      fallback.forEach(item=> grid.appendChild(createCard({ ...item, dims:{} })) );
    }
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', render);
  }else{ render(); }
})();