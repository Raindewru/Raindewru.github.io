// 渲染首页的20个动物图标（从 animals.json 读取）
(function(){
  function createEmojiCard(name, emoji){
    const div = document.createElement('div');
    div.className = 'emoji-card';
    div.setAttribute('aria-label', name);
    div.title = name;
    div.textContent = emoji;
    return div;
  }

  async function render(){
    const container = document.getElementById('emoji-row');
    if(!container) return;
    container.innerHTML = '';
    try{
      const res = await fetch('animals.json');
      const animals = await res.json();
      // 仅渲染前20个（文件中本就为20项）
      animals.slice(0, 20).forEach(item => {
        container.appendChild(createEmojiCard(item.name, item.emoji));
      });
    }catch(e){
      // 兜底：若加载失败，使用与文档一致的20种动物集合
      const fallback = [
        {name:'狗',emoji:'🐶'},{name:'猫',emoji:'🐱'},{name:'狼',emoji:'🐺'},{name:'狐',emoji:'🦊'},
        {name:'狮',emoji:'🦁'},{name:'熊',emoji:'🐻'},{name:'兔',emoji:'🐰'},{name:'仓鼠',emoji:'🐹'},
        {name:'天鹅',emoji:'🦢'},{name:'鹿',emoji:'🦌'},{name:'鹰',emoji:'🦅'},{name:'乌鸦',emoji:'🐦'},
        {name:'水豚',emoji:'🦫'},{name:'鲸',emoji:'🐋'},{name:'鹦鹉',emoji:'🦜'},{name:'章鱼',emoji:'🐙'},
        {name:'鲨鱼',emoji:'🦈'},{name:'海豚',emoji:'🐬'},{name:'浣熊',emoji:'🦝'},{name:'猫鼬',emoji:'🦡'}
      ];
      fallback.forEach(item=>container.appendChild(createEmojiCard(item.name, item.emoji)));
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', render);
  }else{ render(); }
})();