// 移动端导航开合控制
(function(){
  function init(){
    const toggle = document.getElementById('nav-toggle');
    const links = document.getElementById('nav-links');
    if(!toggle || !links) return;
    toggle.addEventListener('click', function(e){
      e.stopPropagation();
      links.classList.toggle('open');
    });
    // 点击外部关闭
    document.addEventListener('click', function(e){
      const header = document.querySelector('header.nav');
      if(!header) return;
      if(!header.contains(e.target)){
        links.classList.remove('open');
      }
    });
    // 视口变化时重置
    window.addEventListener('resize', function(){
      if(window.innerWidth > 560){
        links.classList.remove('open');
      }
    });
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  }else{ init(); }
})();