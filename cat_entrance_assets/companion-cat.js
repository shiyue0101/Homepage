(() => {
  'use strict';
  const stageId = 'companion-cat-stage';
  if (document.getElementById(stageId)) return;
  const dialog = document.getElementById('intro-dialog');
  if (!dialog || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const stage = document.createElement('div');
  stage.id = stageId;
  stage.setAttribute('aria-hidden', 'true');
  const sprite = document.createElement('img');
  sprite.id = 'companion-cat-sprite';
  sprite.alt = '';
  sprite.draggable = false;
  stage.appendChild(sprite);
  document.body.appendChild(stage);

  const scriptUrl = document.currentScript?.src || new URL('cat_entrance_assets/companion-cat.js', location.href).href;
  const walk = Array.from({length:6},(_,i)=>new URL(`walk-frame-${i+1}.png`,scriptUrl).href);
  const sit = Array.from({length:4},(_,i)=>new URL(`sit-frame-${i+1}.png`,scriptUrl).href);
  [...walk,...sit].forEach(src=>{ const img=new Image(); img.src=src; });

  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const ease=t=>{ t=clamp(t,0,1); return t*t*(3-2*t); };
  const mobile=()=>window.matchMedia('(max-width: 1280px)').matches;
  let phase='waiting', phaseStart=0, raf=0, currentSrc='', active=false, progress=0;
  let coords=null, currentFrame=0;

  function onAbout() {
    const path=location.pathname.toLowerCase();
    if (/\/projects\/|\/project-/.test(path)) return false;
    const hash=decodeURIComponent(location.hash||'').toLowerCase();
    if (hash && !['#home','#/','#!/home','#!/','#top'].includes(hash)) return false;
    const section=dialog.closest('.page-section');
    if (section && !section.classList.contains('active') && section.id !== 'home') return false;
    if (getComputedStyle(dialog).display === 'none') return false;
    return true;
  }

  // On mobile the animation is an actual block AFTER the dialog, BEFORE the tip.
  // Its reserved height pushes following content down instead of covering text.
  function layout() {
    const isMobile=mobile();
    if (isMobile) {
      stage.classList.add('is-mobile');
      if (stage.previousElementSibling !== dialog) dialog.insertAdjacentElement('afterend',stage);
      stage.hidden=false;
      const available=stage.clientWidth || dialog.getBoundingClientRect().width || innerWidth;
      const width=clamp(available*.42,145,220);
      const spriteHeight=width*(298/523); // walk-frame dimensions
      const sitHeight=width*(454/663);
      const height=Math.ceil(Math.max(spriteHeight,sitHeight)+30);
      stage.style.height=height+'px';
      coords={width, left:(available-width)/2, bottom:8, startLeft:available+width, mobile:true};
    } else {
      stage.classList.remove('is-mobile');
      stage.style.height='';
      if (stage.parentElement!==document.body) document.body.appendChild(stage);
      const r=dialog.getBoundingClientRect();
      const width=clamp(innerWidth*.18,190,290);
      const rightSpace=Math.max(0,innerWidth-r.right);
      const left=clamp(r.right+(rightSpace-width)/2, r.right+8, innerWidth-width-12);
      const baseline=r.top+r.height*.87;
      coords={width,left,bottom:clamp(innerHeight-baseline,20,innerHeight*.27),startLeft:innerWidth+width,mobile:false};
    }
    sprite.style.width=coords.width+'px';
    stage.hidden=!onAbout() || !active;
    if (active) draw();
  }

  function draw() {
    if (!coords) return;
    const c=coords;
    const x=phase==='walk' ? c.startLeft+(c.left-c.startLeft)*ease(progress) : c.left;
    sprite.style.left=x+'px';
    sprite.style.bottom=c.bottom+'px';
    sprite.style.transform='none'; // walk frames and sit frames already face LEFT
    const src=phase==='walk'?walk[currentFrame]:sit[currentFrame];
    if (src && src!==currentSrc) { sprite.src=src; currentSrc=src; }
  }

  function tick(timestamp) {
    if (!active || !onAbout()) { stage.hidden=true; return; }
    stage.hidden=false;
    if (!phaseStart) phaseStart=timestamp;
    const elapsed=timestamp-phaseStart;
    if (phase==='walk') {
      progress=clamp(elapsed/3800,0,1);
      currentFrame=Math.floor(elapsed/180)%6;
      if (progress===1) { phase='sit'; phaseStart=timestamp; currentFrame=0; }
    } else if (phase==='sit') {
      currentFrame=Math.min(3,Math.floor(elapsed/220));
      if (elapsed>=880) { phase='done'; currentFrame=3; }
    }
    draw();
    if (phase!=='done') raf=requestAnimationFrame(tick);
  }

  function start() {
    if (active) return;
    active=true; phase='walk'; phaseStart=0; progress=0; currentFrame=0;
    layout();
    raf=requestAnimationFrame(tick);
  }
  window.addEventListener('home-typewriter-start',start,{once:true});
  function refresh() {
    layout();
    if (active && onAbout()) {
      stage.hidden=false;
      if (phase!=='done') { cancelAnimationFrame(raf); phaseStart=0; raf=requestAnimationFrame(tick); }
    }
  }
  window.addEventListener('resize',refresh,{passive:true});
  window.addEventListener('hashchange',refresh);
  window.addEventListener('popstate',refresh);
  // Navigation may switch .active without changing the URL immediately.
  const observer=new MutationObserver(()=>{
    const visible=active && onAbout();
    if(stage.hidden===visible) stage.hidden=!visible;
    if(visible && phase==='done') draw();
  });
  const page=dialog.closest('.page-section');
  if(page) observer.observe(page,{attributes:true,attributeFilter:['class','style']});
  layout();

  // COMPANION_ABOUT_VISIBILITY_V3
  // main.js sets #main to flex on About Me and none on all other pages.
  // Do not rely on location.hash, pushState or non-existent home.active.
  const aboutMain = document.getElementById('main');
  if (aboutMain) {
    const syncAboutCatVisibility = () => {
      const visible = getComputedStyle(aboutMain).display !== 'none';
      const catLayer = document.getElementById('companion-cat-stage');
      if (catLayer) catLayer.style.setProperty('display', visible ? 'block' : 'none', 'important');
    };
    const aboutCatObserver = new MutationObserver(syncAboutCatVisibility);
    aboutCatObserver.observe(aboutMain, { attributes: true, attributeFilter: ['style', 'class', 'hidden'] });
    syncAboutCatVisibility();
    window.addEventListener('pageshow', syncAboutCatVisibility);
  }
  // END COMPANION_ABOUT_VISIBILITY_V3
})();
