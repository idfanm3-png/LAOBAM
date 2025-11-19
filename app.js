// app.js
(() => {
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

  // 통화 표기
  function moneyUSD(v){ try{ return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(v);}catch(_){return `$${Math.round(v)}`}}
  function moneyKRWfromUSD(v){ const rate = 1400; return `${(Math.round(v*rate/100)*100).toLocaleString()}원`; }

  // 스켈레톤
  function insertSkeleton(containerId, n=8){
    const box = document.getElementById(containerId);
    if(!box) return;
    box.innerHTML = '';
    for(let i=0;i<n;i++){
      const c = document.createElement('div');
      c.className = 'card skel';
      c.innerHTML = `<div class="thumb"></div><div class="body"></div>`;
      box.appendChild(c);
    }
  }

  // 카드 템플릿 + 이미지 플레이스홀더
  function cardHTML(p){
    const badge = p.badge === 'event' ? '<span class="badge">EVENT</span>'
                : p.badge === 'best' ? '<span class="badge">BEST</span>' : '';
    const hit = Number(p.hit||0);
    const rating = p.rating ? `· ★ ${Number(p.rating).toFixed(1)}` : '';
    const price = `${moneyUSD(p.priceUSD)} <small>(${moneyKRWfromUSD(p.priceUSD)})</small>`;
    const thumbWebp = p.thumbnailWebp || '';
    const thumbJpg = p.thumbnail || '';
    const imgHTML = (thumbWebp || thumbJpg)
      ? `<picture>${thumbWebp?`<source srcset="${thumbWebp}" type="image/webp">`:''}<img src="${thumbJpg}" loading="lazy" decoding="async" alt=""></picture>`
      : `<div class="ph">NO IMAGE</div>`;

    return `
    <article class="card">
      <div class="thumb">
        ${imgHTML}
        <div class="badges">${badge}</div>
      </div>
      <div class="body">
        <h3>${p.title}</h3>
        <div class="meta"><span class="hit">${hit}</span><span>${p.category.toUpperCase()} ${rating}</span><span class="price">${price}</span></div>
        <p class="sum">${p.summary}</p>
      </div>
    </article>`;
  }

  function renderList(containerId, items){
    const box = document.getElementById(containerId);
    if(!box) return;
    box.innerHTML = items.map(cardHTML).join('');
  }

  // 드롭다운
  function bindDropdowns(){
    $$('.dropdown-toggle').forEach(btn=>{
      const panel = document.getElementById(btn.getAttribute('aria-controls'));
      const closeAll = ()=>$$('.dropdown-toggle').forEach(o=>{const p=document.getElementById(o.getAttribute('aria-controls')); o.setAttribute('aria-expanded','false'); p.hidden=true;});
      btn.addEventListener('click', (e)=>{
        e.stopPropagation();
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        closeAll();
        btn.setAttribute('aria-expanded', String(!expanded));
        panel.hidden = expanded;
      });
      document.addEventListener('click', closeAll);
      document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeAll(); });
    });
  }

  // 드로어 + 외부 클릭 닫기
  function bindDrawer(){
    const btn = $('#quickBtn');
    const drawer = $('#quickDrawer');
    const close = $('#quickClose');
    if(!btn || !drawer) return;

    function escClose(e){ if(e.key==='Escape') closeDrawer(); }
    function handleOutsideClick(e){ if(!drawer.contains(e.target) && e.target!==btn){ closeDrawer(); } }

    function open(){
      drawer.setAttribute('aria-hidden','false');
      btn.setAttribute('aria-expanded','true');
      drawer.focus();
      document.addEventListener('keydown', escClose);
      document.addEventListener('click', handleOutsideClick);
    }
    function closeDrawer(){
      drawer.setAttribute('aria-hidden','true');
      btn.setAttribute('aria-expanded','false');
      document.removeEventListener('keydown', escClose);
      document.removeEventListener('click', handleOutsideClick);
    }

    btn.addEventListener('click', ()=>{
      const openState = drawer.getAttribute('aria-hidden') === 'false';
      openState ? closeDrawer() : open();
    });
    close?.addEventListener('click', closeDrawer);
    drawer.addEventListener('click', (e)=>{ if(e.target===drawer) closeDrawer(); });
  }

  // 플로팅 CTA 토글 + 스크롤 조건 + 하단 섹션 근접 시 숨김
  function bindFloatingCTA(){
    const t = $('#floatCTA'), p = $('#floatPanel');
    const contact = $('#contact');
    if(!t || !p) return;

    t.addEventListener('click', (e)=>{
      e.stopPropagation();
      const ex = t.getAttribute('aria-expanded')==='true';
      t.setAttribute('aria-expanded', String(!ex));
      p.hidden = ex;
    });
    document.addEventListener('click',(e)=>{
      if(e.target!==t && !p.contains(e.target)){
        t.setAttribute('aria-expanded','false'); p.hidden = true;
      }
    });

    // 스크롤 200px 이후 노출
    function onScroll(){
      if(window.scrollY > 200) t.classList.add('show');
      else t.classList.remove('show');
    }
    window.addEventListener('scroll', onScroll, {passive:true});
    onScroll();

    // contact 섹션 보이면 버튼 숨김
    if('IntersectionObserver' in window && contact){
      const io = new IntersectionObserver(([entry])=>{
        if(entry.isIntersecting){ t.classList.remove('show'); t.setAttribute('aria-expanded','false'); p.hidden = true; }
      }, {root:null,threshold:0.2});
      io.observe(contact);
    }
  }

  // 스토리/공지/FAQ 더미
  const STORY = [
    {title:'라오스 골프 가이드', url:'https://blog.naver.com'},
    {title:'방비엥 황제투어 후기', url:'https://blog.naver.com'},
    {title:'비엔티안 맛집 7선', url:'https://blog.naver.com'}
  ];
  const NOTICE = [
    {title:'연말 성수기 예약 안내', date:'2025-11-01'},
    {title:'환율 변동 안내', date:'2025-10-20'}
  ];
  const FAQ = [
    {q:'당일 취소가 가능한가요?', a:'당일 취소 및 환불은 불가합니다.'},
    {q:'픽업은 어디에서 가능한가요?', a:'비엔티안 시내 및 왓타이 공항에서 가능합니다.'}
  ];

  function renderMisc(){
    const story = $('#storyList');
    const notice = $('#noticeList');
    const faq = $('#faqList');
    if(story) story.innerHTML = STORY.map(i=>`<li><a href="${i.url}" target="_blank" rel="noopener">${i.title}</a></li>`).join('');
    if(notice) notice.innerHTML = NOTICE.map(i=>`<li><span>${i.date}</span> · ${i.title}</li>`).join('');
    if(faq) faq.innerHTML = FAQ.map(i=>`<li><strong>${i.q}</strong><br>${i.a}</li>`).join('');
  }

  // 연락채널 자리표시자(후에 실제 링크로 교체)
  function wireContactLinks(){
    const kakao = '#'; const wa = '#'; const tg = '#';
    ['ctaKakao','floatKakao'].forEach(id=>{ const a = document.getElementById(id); if(a) a.href = kakao; });
    ['ctaWhatsApp','floatWhatsApp'].forEach(id=>{ const a = document.getElementById(id); if(a) a.href = wa; });
    ['ctaTelegram','floatTelegram'].forEach(id=>{ const a = document.getElementById(id); if(a) a.href = tg; });
  }

  // 데이터 로드(황제투어 우선)
  async function initIndex(){
    const bestBox = $('#bestList');
    const eventBox = $('#eventList');
    if(!bestBox && !eventBox) return;

    insertSkeleton('bestList', 8);
    insertSkeleton('eventList', 8);

    let data;
    try{
      const res = await fetch('/data/products.json', {cache:'no-store'});
      data = await res.json();
    }catch(e){
      console.error('products.json load failed', e);
      data = {products: []};
    }
    const items = data.products || [];

    const weighted = [...items].sort((a,b)=>{
      const wa = (a.category==='vip'?1000:0) + (a.hit||0);
      const wb = (b.category==='vip'?1000:0) + (b.hit||0);
      return wb - wa;
    });

    renderList('bestList', weighted.slice(0,8));
    renderList('eventList', items.filter(p=>p.badge==='event').slice(0,8));
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    bindDropdowns();
    bindDrawer();
    bindFloatingCTA();
    renderMisc();
    wireContactLinks();
    initIndex();
  });
})();
