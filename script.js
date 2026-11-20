/* ===== À MODIFIER ===== */
const CFG={
  wa:'2250595227090',            // WhatsApp (indicatif 225 + numéro)
  pay:'05 95 22 70 90',          // numéro MTN Money / Wave affiché
  date:'2026-11-22T19:00:00Z',   // jour J à 19h (heure d'Abidjan, UTC)
  maps:'https://www.google.com/maps/search/?api=1&query=5.401272,-4.002303'
};
/* ====================== */
const $=id=>document.getElementById(id),
wa=t=>`https://wa.me/${CFG.wa}?text=${encodeURIComponent(t)}`,
GOLD=['#ff7d00','#ffb066','#ffecd1','#1f8a9b','#ffffff'],
burst=()=>{if(typeof confetti==='function')confetti({particleCount:120,spread:85,origin:{y:.7},colors:GOLD})};

$('maps').href=CFG.maps;
$('wa1').href=wa('Salut Bamoro ! 👋');
$('wa2').href=wa('Joyeux anniversaire Bamoro ! 🎥 Je t\'envoie mon vœu en vidéo ici 👇');
$('wa3').href=wa('Salut Bamoro ! Je viens de t\'envoyer un cadeau 🎁 Voici la capture :');
$('num').textContent=CFG.pay;

/* Bandeau défilant */
$('mqi').innerHTML='<span>SANOGO</span><span>18 ANS</span><span>22.11.2026</span><span>ABIDJAN</span>'.repeat(4);

/* Compte à rebours */
const T=new Date(CFG.date).getTime();let iv;
function tick(){
  const d=T-Date.now();
  if(d<=0){$('cd').innerHTML='<div class="now">🎉 C’est aujourd’hui ! 🎉</div>';clearInterval(iv);burst();return}
  const v=[Math.floor(d/864e5),Math.floor(d/36e5)%24,Math.floor(d/6e4)%60,Math.floor(d/1e3)%60];
  $('cd').querySelectorAll('b').forEach((e,i)=>e.textContent=String(v[i]).padStart(2,'0'));
}
tick();iv=setInterval(tick,1000);

/* Confettis dorés qui tombent (hero uniquement) */
setInterval(()=>{
  if(document.hidden||scrollY>innerHeight||typeof confetti!=='function')return;
  confetti({particleCount:2,startVelocity:0,ticks:400,gravity:.5,drift:Math.random()-.5,scalar:1.1,
    origin:{x:Math.random(),y:-.05},colors:GOLD,disableForReducedMotion:true});
},350);

/* Vidéos de la galerie : lecture seulement quand elles sont visibles */
if(!matchMedia('(prefers-reduced-motion:reduce)').matches){
  const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting?e.target.play().catch(()=>{}):e.target.pause()),{threshold:.4});
  document.querySelectorAll('.gal video').forEach(v=>{v.muted=true;io.observe(v)});
}

/* Mur des vœux (localStorage) */
let ws=[];try{ws=JSON.parse(localStorage.getItem('voeux')||'[]')}catch(e){}
function draw(){
  const W=$('wall');W.innerHTML='';
  if(!ws.length){W.innerHTML='<p class="empty">Aucun vœu pour l’instant. Sois le premier à écrire un message !</p>';return}
  ws.forEach((w,i)=>{
    const c=document.createElement('article'),p=document.createElement('p'),n=document.createElement('b');
    c.className='wc c'+(i%4);p.textContent=w.m;n.textContent='— '+w.n;
    const x=document.createElement('button');x.type='button';x.className='x';x.textContent='Supprimer';x.setAttribute('aria-label','Supprimer le vœu de '+w.n);
    x.onclick=()=>{ws.splice(i,1);try{localStorage.setItem('voeux',JSON.stringify(ws))}catch(e){}draw()};
    c.append(p,n,x);W.append(c)});
}
draw();
$('wf').onsubmit=e=>{
  e.preventDefault();
  const n=$('wn').value.trim(),m=$('wm').value.trim();if(!n||!m)return;
  ws.unshift({n,m});ws=ws.slice(0,60);
  try{localStorage.setItem('voeux',JSON.stringify(ws))}catch(x){}
  draw();e.target.reset();
  $('wsend').hidden=false;$('wsl').href=wa(`Joyeux anniversaire Bamoro ! 🎂\n${m}\n— ${n}`);
  burst();
};

/* Cadeau */
$('pay').onclick=()=>$('dlg').showModal();
$('cl').onclick=()=>$('dlg').close();
$('cp').onclick=()=>{
  const ok=()=>$('cp').textContent='Numéro copié ✓';
  navigator.clipboard?navigator.clipboard.writeText(CFG.pay.replace(/\s/g,'')).then(ok,()=>{}):0;
};

/* RSVP */
document.querySelectorAll('[name=r]').forEach(r=>r.onchange=e=>$('kw').hidden=e.target.value!=='oui');
$('rsvp').onsubmit=e=>{
  e.preventDefault();
  const f=new FormData(e.target),n=f.get('n').trim(),ok=f.get('r')==='oui',k=ok?Math.max(1,+f.get('k')||1):0;
  try{localStorage.setItem('rsvp',JSON.stringify({n,ok,k}))}catch(x){}
  $('rmsg').hidden=false;
  $('rt').textContent=ok?'Merci, à très vite Loup !':'Merci de me prévenir, à très vite Loup !';
  $('rwa').href=wa(`Salut Bamoro ! C'est ${n}. `+(ok?`Je viens à ta fête (${k} personne${k>1?'s':''}) 🎉`:'Je ne peux pas venir, mais joyeux anniversaire ! 🎂'));
  if(ok)burst();
};

/* Musique : mélodie instrumentale Happy Birthday + fichier/lien personnalisé */
let musicMode='synth', audioContext=null, synthNodes=[], synthTimer=null, blobAudioUrl=null;
let musicPlaying=false;
const birthdayNotes=[
  ['G4',.5],['G4',.5],['A4',1],['G4',1],['C5',1],['B4',2],
  ['G4',.5],['G4',.5],['A4',1],['G4',1],['D5',1],['C5',2],
  ['G4',.5],['G4',.5],['G5',1],['E5',1],['C5',1],['B4',1],['A4',2],
  ['F5',.5],['F5',.5],['E5',1],['C5',1],['D5',1],['C5',2]
];
const noteHz={C4:261.63,D4:293.66,E4:329.63,F4:349.23,G4:392,A4:440,B4:493.88,C5:523.25,D5:587.33,E5:659.25,F5:698.46,G5:783.99};
const updateMusicUI=()=>{
  $('musicNoteIcon').textContent=musicPlaying?'Ⅱ':'♪';
  $('musicToggleBtn').classList.toggle('playing',musicPlaying);
  $('musicToggleBtn').setAttribute('aria-pressed',String(musicPlaying));
  $('musicToggleBtn').setAttribute('aria-label',musicPlaying?'Mettre la musique en pause':'Lancer la musique');
};
const setMusicLabel=name=>{$('musicLabel').textContent=name;$('musicLabel').title=name};
function playBirthdayMelody(){
  const AudioCtx=window.AudioContext||window.webkitAudioContext;
  if(!AudioCtx){$('musicFeedback').textContent='La lecture audio n’est pas prise en charge par ce navigateur.';return}
  audioContext=new AudioCtx();
  const beat=.39;
  const melodyDuration=birthdayNotes.reduce((sum,n)=>sum+n[1],0)*beat;
  const schedule=()=>{
    if(!musicPlaying||!audioContext)return;
    let t=audioContext.currentTime+.08;
    birthdayNotes.forEach(([note,duration])=>{
      const osc=audioContext.createOscillator();
      const gain=audioContext.createGain();
      osc.type='sine';osc.frequency.value=noteHz[note];
      gain.gain.setValueAtTime(.0001,t);
      gain.gain.exponentialRampToValueAtTime(.12,t+.025);
      gain.gain.setValueAtTime(.12,Math.max(t+.03,t+duration*beat-.06));
      gain.gain.exponentialRampToValueAtTime(.0001,t+duration*beat-.015);
      osc.connect(gain);gain.connect(audioContext.destination);
      osc.start(t);osc.stop(t+duration*beat);
      synthNodes.push(osc);t+=duration*beat;
    });
    synthTimer=setTimeout(schedule,melodyDuration*1000+180);
  };
  schedule();
}
function stopBirthdayMelody(){
  if(synthTimer){clearTimeout(synthTimer);synthTimer=null}
  synthNodes.forEach(node=>{try{node.stop()}catch(e){}});synthNodes=[];
  if(audioContext){const oldContext=audioContext;audioContext=null;oldContext.close().catch(()=>{})}
}
function stopCurrentMusic(){
  if(musicMode==='synth')stopBirthdayMelody();
  const audio=$('customAudio');audio.pause();
  musicPlaying=false;updateMusicUI();
}
async function toggleAudio(){
  if(musicPlaying){stopCurrentMusic();return}
  musicPlaying=true;updateMusicUI();
  if(musicMode==='custom'){
    try{await $('customAudio').play()}
    catch(e){musicPlaying=false;updateMusicUI();$('musicFeedback').textContent='Impossible de lire ce média. Vérifie le fichier ou le lien audio.'}
  }else{
    try{playBirthdayMelody()}
    catch(e){musicPlaying=false;updateMusicUI();$('musicFeedback').textContent='La mélodie ne peut pas être lue sur cet appareil.'}
  }
}
function openMusicModal(){
  $('musicModal').classList.add('open');$('musicModal').setAttribute('aria-hidden','false');
  $('musicFeedback').textContent='';
  setTimeout(()=>$('musicModal').querySelector('button').focus(),0);
}
function closeMusicModal(){
  $('musicModal').classList.remove('open');$('musicModal').setAttribute('aria-hidden','true');
  $('musicToggleBtn').focus();
}
function handleFileUpload(event){
  const file=event.target.files&&event.target.files[0];if(!file)return;
  if(!file.type.startsWith('audio/')){$('musicFeedback').textContent='Choisis un fichier audio valide.';event.target.value='';return}
  if(blobAudioUrl)URL.revokeObjectURL(blobAudioUrl);
  blobAudioUrl=URL.createObjectURL(file);
  $('customAudioUrl').value='';
  if(!$('customSongTitle').value.trim())$('customSongTitle').value=file.name.replace(/\.[^.]+$/,'');
  $('musicFeedback').textContent='Fichier prêt : '+file.name+'. Clique sur « Appliquer & jouer ». ';
}
async function applyCustomAudio(){
  const file=$('audioFileInput').files&&$('audioFileInput').files[0];
  const rawUrl=$('customAudioUrl').value.trim();
  let src='';
  if(file&&blobAudioUrl)src=blobAudioUrl;
  else if(rawUrl){
    try{const parsed=new URL(rawUrl);if(!['http:','https:'].includes(parsed.protocol))throw new Error('scheme');src=parsed.href}
    catch(e){$('musicFeedback').textContent='Entre une adresse audio valide commençant par https:// ou http://.';return}
  }else{$('musicFeedback').textContent='Importe un fichier audio ou colle un lien direct vers un fichier audio.';return}
  stopCurrentMusic();musicMode='custom';$('customAudio').src=src;$('customAudio').load();
  const title=$('customSongTitle').value.trim()||(file?file.name:decodeURIComponent(rawUrl.split('/').pop().split('?')[0]||'Ma chanson'));
  setMusicLabel(title);$('musicFeedback').textContent='Chargement de la musique…';
  try{
    await $('customAudio').play();musicPlaying=true;updateMusicUI();$('musicFeedback').textContent='Musique lancée : '+title;
  }catch(e){musicPlaying=false;updateMusicUI();$('musicFeedback').textContent='Le fichier est sélectionné, mais la lecture a échoué. Vérifie que le lien pointe directement vers un fichier audio MP3/WAV.'}
}
function resetToSynthMusic(){
  stopCurrentMusic();musicMode='synth';
  $('customAudio').removeAttribute('src');$('customAudio').load();
  $('audioFileInput').value='';$('customAudioUrl').value='';$('customSongTitle').value='';
  if(blobAudioUrl){URL.revokeObjectURL(blobAudioUrl);blobAudioUrl=null}
  setMusicLabel('Happy Birthday');$('musicFeedback').textContent='Mélodie instrumentale par défaut sélectionnée.';
  toggleAudio();
}
$('customAudio').addEventListener('play',()=>{if(musicMode==='custom'){musicPlaying=true;updateMusicUI()}});
$('customAudio').addEventListener('pause',()=>{if(musicMode==='custom'&&musicPlaying){musicPlaying=false;updateMusicUI()}});
$('customAudio').addEventListener('ended',()=>{musicPlaying=false;updateMusicUI()});
$('musicModal').addEventListener('click',e=>{if(e.target===$('musicModal'))closeMusicModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('musicModal').classList.contains('open'))closeMusicModal()});

/* Écran d'ouverture */
$('open').onclick=()=>{
  $('gate').classList.add('out');document.body.classList.remove('lock');scrollTo(0,0);
  toggleAudio();setTimeout(burst,300);
};

/* Bougies */
const cds=$('cds'),cleft=$('cleft');let left=18;
for(let i=0;i<18;i++){const b=document.createElement('button');b.type='button';b.className='cn';b.setAttribute('aria-label','Éteindre la bougie '+(i+1));b.innerHTML='<i></i>';cds.append(b)}
cds.onclick=e=>{const b=e.target.closest('.cn');if(!b||b.classList.contains('off'))return;b.classList.add('off');left--;
  cleft.textContent=left?`Il reste ${left} bougie${left>1?'s':''}…`:'Joyeux anniversaire Bamoro ! 🎉';
  if(!left){burst();$('relight').hidden=false}};
$('relight').onclick=()=>{cds.querySelectorAll('.off').forEach(b=>b.classList.remove('off'));left=18;cleft.textContent='Il reste 18 bougies…';$('relight').hidden=true};

/* Galerie : toucher pour agrandir */
document.querySelectorAll('.gal figure').forEach(f=>{f.tabIndex=0;f.setAttribute('role','button');f.setAttribute('aria-label','Agrandir');
  f.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();f.click()}}});
$('gal').onclick=e=>{const f=e.target.closest('figure');if(!f)return;const m=f.firstElementChild.cloneNode(true);
  if(m.tagName==='VIDEO'){m.controls=true;m.autoplay=true;m.muted=true}
  $('lbm').replaceChildren(m);$('lb').showModal();if(m.play)m.play().catch(()=>{})};
$('lbc').onclick=()=>$('lb').close();
$('lb').addEventListener('close',()=>$('lbm').replaceChildren());

/* Partager l'invitation */
$('share').onclick=async()=>{const d={title:'Les 18 ans de Bamoro',text:`Viens fêter mes 18 ans le 22 novembre 2026 à 19h ! 📍 5°24'04.58"N 4°00'08.29"W`,url:location.href};
  try{if(navigator.share)await navigator.share(d);else{await navigator.clipboard.writeText(location.href);$('share').textContent='Lien copié ✓'}}catch(x){}};
