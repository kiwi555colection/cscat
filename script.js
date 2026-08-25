'use strict';

// ============================================================
// 🐾 CONTRACT ADDRESS — GANTI 2 BARIS DI BAWAH SETELAH LAUNCH
// ============================================================
const CA_ADDRESS = "0x385Ee4cDd9aE70F539F8712F69f53B4B5477018c";  // <-- Isi CA di sini, contoh: "0x1234abcd..." atau "So1a...xyz"
const CA_EXPLORER_URL = "https://www.ponsfamily.com/launchpad/0x385Ee4cDd9aE70F539F8712F69f53B4B5477018c";  // <-- Opsional, contoh: "https://etherscan.io/token/" atau "https://solscan.io/token/"
// ============================================================
// Kalau CA_ADDRESS masih kosong, UI otomatis nampilin "COMING SOON"
// Begitu diisi, top bar & hero card langsung aktif + tombol copy jalan
// ============================================================

// ============ DATA ============
const WEAPONS = [
  { id: 'awp',    tier: 's', icon: '🎯', name: 'AWP "Alpha Whisker"',  desc: 'One-shot pounce from mid distance',     dmg: 115, rate: '0.5/s',  cost: 4750, type: 'Sniper Rifle',   accuracy: 96, range: 98 },
  { id: 'ak',     tier: 's', icon: '🔫', name: 'AK-47 "Alley Cat"',    desc: "Meow-T's signature assault rifle",       dmg: 36,  rate: '10/s',   cost: 2700, type: 'Assault Rifle',  accuracy: 78, range: 82 },
  { id: 'm4',     tier: 's', icon: '🐾', name: 'M4-MEOW',              desc: 'Standard issue Purr-CT rifle',           dmg: 33,  rate: '10/s',   cost: 3100, type: 'Assault Rifle',  accuracy: 84, range: 80 },
  { id: 'deagle', tier: 'a', icon: '🦴', name: 'Deagle "Bone Crusher"', desc: 'High caliber pistol, one-tap head',    dmg: 54,  rate: '2.5/s',  cost: 700,  type: 'Heavy Pistol',   accuracy: 62, range: 60 },
  { id: 'yarn',   tier: 'a', icon: '🧶', name: 'Yarn Grenade',          desc: 'HE grenade, 4m radius area denial',     dmg: 98,  rate: 'throw',  cost: 300,  type: 'Grenade',        accuracy: null, range: 20 },
  { id: 'laser',  tier: 'a', icon: '💡', name: 'Laser Pointer',         desc: 'Flashbang — distracts all cats 3s',     dmg: 0,   rate: '3s stun',cost: 200,  type: 'Utility',        accuracy: null, range: 25 },
  { id: 'smoke',  tier: 'b', icon: '💨', name: 'Hairball Smoke',        desc: 'Smoke grenade, 18s cover',              dmg: 0,   rate: '18s',    cost: 300,  type: 'Utility',        accuracy: null, range: 22 },
  { id: 'knife',  tier: 'b', icon: '🗡️', name: 'Karambit Claw',         desc: 'Melee weapon, back-stab 100 dmg',       dmg: 55,  rate: 'melee',  cost: 0,    type: 'Melee',          accuracy: 100, range: 5  }
];

const MAPS = [
  { id: 'db', code: 'DE_DUST_BUNNY', title: 'DUST BUNNY',    mode: 'DEFUSAL', cls: 'map-1', sub: 'Middle-eastern alley classic', desc: 'Two-story alleyways, palm shadows, and the iconic B-tunnel choke. First cat to hold Long-A wins mid-control.',                        callouts: ['Long A', 'Cat Walk', 'Tuna Site', 'Mid Bunny', 'Pit'] },
  { id: 'lb', code: 'DE_LITTERBOX',  title: 'LITTERBOX',     mode: 'DEFUSAL', cls: 'map-2', sub: 'Underground sandbox arena',    desc: 'Verticality-heavy map. B-site sits in a covered pit; A-site is elevated with sightlines through the scratching-post pillars.',       callouts: ['Sand Pit', 'Scratch Post', 'Kitty Ramp', 'Hooded Site', 'Litter Middle'] },
  { id: 'fn', code: 'DE_FURNACE',    title: 'FURNACE',       mode: 'DEFUSAL', cls: 'map-3', sub: 'Italian rooftops, no water',   desc: 'Warm tiled roofs above a bakery. Molotov spam through the apartment windows and pray your teammate flashes banana.',                  callouts: ['Banana', 'Apartments', 'Hot Site', 'Boiler', 'Coffin'] },
  { id: 'cn', code: 'CS_CATNIP',     title: 'CATNIP FIELDS', mode: 'HOSTAGE', cls: 'map-4', sub: 'Rescue the Golden Retriever',  desc: 'Rescue map set in a rural catnip farm. Hostage (Buddy the Golden) is held in the barn. Two extraction points.',                        callouts: ['Barn', 'Silo', 'Field', 'Farmhouse', 'Rescue Zone'] }
];

const TEAM_ROSTER = {
  t:  ['Shadow', 'Tabby', 'Nyan', 'Boots', 'Whiskers'],
  ct: ['Mittens', 'Bengal', 'Floof', 'Oreo', 'Ziggy']
};

const DIFFICULTIES = {
  easy:   { spawn: 950, life: 1800, size: 84, label: 'RECRUIT' },
  normal: { spawn: 680, life: 1200, size: 62, label: 'VETERAN' },
  hard:   { spawn: 460, life: 780,  size: 44, label: 'ELITE'   }
};

const EMOJIS = ['🐱','😺','😸','😻','🐈','🙀','😹','😼','🐈‍⬛'];

// ============ STATE ============
const state = {
  score: 0, misses: 0, combo: 0, bestCombo: 0, headshots: 0,
  gtime: 30, playing: false,
  difficulty: 'normal',
  soundOn: true,
  best: 0,
  currentSide: null,
  matchScore: { t: 13, ct: 11 },
  matchTime: 95
};

// Load persisted best score + sound preference
try {
  const savedBest = localStorage.getItem('cscat_best');
  if (savedBest) state.best = parseInt(savedBest, 10) || 0;
  const savedSound = localStorage.getItem('cscat_sound');
  if (savedSound === 'off') state.soundOn = false;
} catch (e) {}

// ============ AUDIO ============
let audioCtx = null;
function initAudio() {
  if (audioCtx) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audioCtx = new AC();
  } catch (e) { audioCtx = null; }
}
function beep(freq, duration, type, gain) {
  if (!state.soundOn) return;
  initAudio();
  if (!audioCtx) return;
  try {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(gain || 0.05, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(g); g.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}
function soundHit()      { beep(720, 0.08, 'square', 0.06); }
function soundHeadshot() { beep(1200, 0.06, 'square', 0.08); setTimeout(() => beep(1600, 0.1, 'square', 0.06), 40); }
function soundMiss()     { beep(180, 0.12, 'sawtooth', 0.04); }
function soundClick()    { beep(500, 0.03, 'sine', 0.03); }

// ============ SOUND TOGGLE ============
const soundToggle = document.getElementById('soundToggle');
function updateSoundIcon() {
  soundToggle.textContent = state.soundOn ? '🔊' : '🔇';
  soundToggle.classList.toggle('muted', !state.soundOn);
}
updateSoundIcon();
soundToggle.addEventListener('click', () => {
  state.soundOn = !state.soundOn;
  updateSoundIcon();
  try { localStorage.setItem('cscat_sound', state.soundOn ? 'on' : 'off'); } catch (e) {}
  if (state.soundOn) { initAudio(); soundClick(); }
});

// ============ TOAST ============
const toast = document.getElementById('toast');
let toastTimer = null;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

// ============ CA (CONTRACT ADDRESS) ============
const caTopbar = document.getElementById('caTopbar');
const caTopbarBtn = document.getElementById('caTopbarBtn');
const caTopbarAddr = document.getElementById('caTopbarAddr');
const caTopbarHint = document.getElementById('caTopbarHint');
const heroCaCard = document.getElementById('heroCaCard');
const heroCaAddr = document.getElementById('heroCaAddr');
const heroCaBtn = document.getElementById('heroCaBtn');
const heroCaExplorer = document.getElementById('heroCaExplorer');

function shortenAddr(addr) {
  if (!addr || addr.length <= 14) return addr;
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

function copyCA() {
  if (!CA_ADDRESS) return;
  const doCopy = navigator.clipboard && navigator.clipboard.writeText
    ? navigator.clipboard.writeText(CA_ADDRESS)
    : new Promise((resolve, reject) => {
        try {
          const ta = document.createElement('textarea');
          ta.value = CA_ADDRESS;
          ta.style.position = 'fixed'; ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          resolve();
        } catch (e) { reject(e); }
      });

  doCopy.then(() => {
    showToast('📋 CA copied to clipboard');
    soundClick();
    caTopbar.classList.add('copied');
    heroCaCard.classList.add('copied');
    setTimeout(() => {
      caTopbar.classList.remove('copied');
      heroCaCard.classList.remove('copied');
    }, 800);
  }).catch(() => {
    showToast('Copy failed — pilih & copy manual');
  });
}

function initCA() {
  const isLive = CA_ADDRESS && CA_ADDRESS.length > 0;

  if (!isLive) {
    // Placeholder / pre-launch state
    caTopbarAddr.textContent = 'COMING SOON';
    caTopbarHint.textContent = '— reveal on launch';
    caTopbar.classList.add('disabled');
    heroCaAddr.textContent = 'COMING SOON';
    heroCaBtn.disabled = true;
    heroCaBtn.innerHTML = '<span>⏳</span> TBA';
    return;
  }

  // Live state — CA is set
  caTopbarAddr.textContent = shortenAddr(CA_ADDRESS);
  caTopbarHint.textContent = '— TAP TO COPY';
  caTopbarBtn.addEventListener('click', copyCA);

  heroCaAddr.textContent = CA_ADDRESS;
  heroCaBtn.disabled = false;
  heroCaBtn.innerHTML = '<span>📋</span> COPY';
  heroCaBtn.addEventListener('click', copyCA);

  if (CA_EXPLORER_URL) {
    heroCaExplorer.href = CA_EXPLORER_URL + CA_ADDRESS;
    heroCaExplorer.style.display = 'inline-flex';
  }
}
initCA();

// ============ TEAMS: JOIN ============
function joinTeam(side, ev) {
  if (ev) ev.stopPropagation();
  state.currentSide = side;
  document.querySelectorAll('.team-card').forEach(c => {
    c.classList.toggle('joined', c.dataset.team === side);
    const btn = c.querySelector('.join-btn');
    if (c.dataset.team === side) {
      btn.textContent = side === 't' ? 'JOINED MEOW-T ✓' : 'JOINED PURR-CT ✓';
    } else {
      btn.textContent = c.dataset.team === 't' ? 'JOIN MEOW-T' : 'JOIN PURR-CT';
    }
  });
  showToast('Deployed to ' + (side === 't' ? 'MEOW-T' : 'PURR-CT'));
  soundClick();
}
window.joinTeam = joinTeam; // expose for inline onclick

// ============ ROUND HUD: TIMER + KILL FEED ============
const timerEl = document.getElementById('timer');
const killfeed = document.getElementById('killfeed');
const tScoreEl = document.getElementById('tScore');
const ctScoreEl = document.getElementById('ctScore');

function updateMatchTimer() {
  state.matchTime--;
  if (state.matchTime <= 0) {
    state.matchTime = 115;
    if (Math.random() > 0.5) state.matchScore.t++; else state.matchScore.ct++;
    if (state.matchScore.t > 16 || state.matchScore.ct > 16) {
      state.matchScore.t = 0; state.matchScore.ct = 0;
    }
    tScoreEl.textContent = state.matchScore.t;
    ctScoreEl.textContent = state.matchScore.ct;
  }
  const m = Math.floor(state.matchTime / 60);
  const s = String(state.matchTime % 60).padStart(2, '0');
  timerEl.textContent = m + ':' + s;
  timerEl.classList.toggle('warn', state.matchTime < 20);
}
setInterval(updateMatchTimer, 1000);

function pushKill(attackerName, attackerSide, weaponIcon, targetName, targetSide, isHeadshot) {
  const item = document.createElement('div');
  item.className = 'kill-item';
  item.innerHTML =
    '<span class="attacker ' + attackerSide + '">' + attackerName + '</span>' +
    '<span class="weapon">' + weaponIcon + '</span>' +
    (isHeadshot ? '<span class="hs">💥</span>' : '') +
    '<span class="target ' + targetSide + '">' + targetName + '</span>';
  killfeed.appendChild(item);
  item.addEventListener('animationend', () => item.remove());
}

function randomScriptedKill() {
  const attackerSide = Math.random() > 0.5 ? 't' : 'ct';
  const targetSide = attackerSide === 't' ? 'ct' : 't';
  const attacker = TEAM_ROSTER[attackerSide][Math.floor(Math.random() * TEAM_ROSTER[attackerSide].length)];
  const target = TEAM_ROSTER[targetSide][Math.floor(Math.random() * TEAM_ROSTER[targetSide].length)];
  const validWeapons = WEAPONS.filter(w => w.dmg > 0);
  const weapon = validWeapons[Math.floor(Math.random() * validWeapons.length)];
  const isHeadshot = Math.random() > 0.6;
  pushKill(attacker, attackerSide, weapon.icon, target, targetSide, isHeadshot);
}
setTimeout(randomScriptedKill, 1200);
setTimeout(randomScriptedKill, 2400);
setInterval(randomScriptedKill, 3500);

// ============ ARSENAL: RENDER + FILTER + MODAL ============
const weaponsGrid = document.getElementById('weaponsGrid');

function renderWeapons(filter) {
  weaponsGrid.innerHTML = '';
  const list = filter === 'all' ? WEAPONS : WEAPONS.filter(w => w.tier === filter);
  list.forEach(w => {
    const card = document.createElement('div');
    card.className = 'weapon';
    card.innerHTML =
      '<span class="weapon-tier tier-' + w.tier + '">TIER ' + w.tier.toUpperCase() + '</span>' +
      '<span class="weapon-icon">' + w.icon + '</span>' +
      '<div class="weapon-name">' + w.name + '</div>' +
      '<div class="weapon-desc">' + w.desc + '</div>' +
      '<div class="weapon-stats">' +
        '<span data-label="DMG">' + w.dmg + '</span>' +
        '<span data-label="RATE">' + w.rate + '</span>' +
        '<span data-label="COST">$' + w.cost + '</span>' +
      '</div>';
    card.addEventListener('click', () => openWeaponModal(w));
    weaponsGrid.appendChild(card);
  });
}
renderWeapons('all');

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderWeapons(btn.dataset.filter);
    soundClick();
  });
});

// ============ MAPS: RENDER + MODAL ============
const mapsGrid = document.getElementById('mapsGrid');
MAPS.forEach(m => {
  const card = document.createElement('div');
  card.className = 'map-card ' + m.cls;
  card.innerHTML =
    '<div class="map-overlay">' +
      '<div class="map-tag-row">' +
        '<span class="map-code">' + m.code + '</span>' +
        '<span class="map-mode">' + m.mode + '</span>' +
      '</div>' +
      '<div>' +
        '<div class="map-title">' + m.title + '</div>' +
        '<div class="map-sub">' + m.sub + '</div>' +
      '</div>' +
    '</div>';
  card.addEventListener('click', () => openMapModal(m));
  mapsGrid.appendChild(card);
});

// ============ MODAL ============
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');

function openWeaponModal(w) {
  soundClick();
  const statsHtml =
    '<div class="modal-stat"><span class="lbl">DAMAGE</span><span class="val">' + w.dmg + '</span></div>' +
    '<div class="modal-stat"><span class="lbl">FIRE RATE</span><span class="val">' + w.rate + '</span></div>' +
    '<div class="modal-stat"><span class="lbl">COST</span><span class="val">$' + w.cost + '</span></div>' +
    (w.accuracy !== null ? '<div class="modal-stat"><span class="lbl">ACCURACY</span><span class="val">' + w.accuracy + '</span></div>' : '') +
    '<div class="modal-stat"><span class="lbl">RANGE</span><span class="val">' + w.range + '</span></div>';
  modalContent.innerHTML =
    '<div class="modal-eyebrow">' + w.type.toUpperCase() + ' · TIER ' + w.tier.toUpperCase() + '</div>' +
    '<div class="modal-title">' + w.icon + ' ' + w.name + '</div>' +
    '<div class="modal-body">' + w.desc + '</div>' +
    '<div class="modal-stats">' + statsHtml + '</div>';
  modal.classList.add('open');
}

function openMapModal(m) {
  soundClick();
  const callouts = m.callouts.map(c => '<span class="callout">' + c + '</span>').join('');
  modalContent.innerHTML =
    '<div class="modal-eyebrow">' + m.mode + ' · ' + m.code + '</div>' +
    '<div class="modal-title">' + m.title + '</div>' +
    '<div class="map-preview">' +
      '<div class="spawn t-spawn">T SPAWN</div>' +
      '<div class="spawn site">SITE ' + (m.mode === 'HOSTAGE' ? 'X' : 'A') + '</div>' +
      '<div class="spawn ct-spawn">CT SPAWN</div>' +
    '</div>' +
    '<div class="modal-body">' + m.desc + '</div>' +
    '<div class="modal-eyebrow" style="margin-top:16px">CALLOUTS</div>' +
    '<div class="callouts">' + callouts + '</div>';
  modal.classList.add('open');
}

function closeModal() { modal.classList.remove('open'); }
window.closeModal = closeModal;

modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ============ AIM TRAINER ============
const area = document.getElementById('area');
const crosshair = document.getElementById('crosshair');
const scoreEl = document.getElementById('score');
const missEl = document.getElementById('misses');
const timeEl = document.getElementById('gtime');
const bestEl = document.getElementById('best');
const comboEl = document.getElementById('combo');
const hsEl = document.getElementById('hs');
const msgEl = document.getElementById('msg');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBest');
bestEl.textContent = state.best;

let spawnInt = null;
let gameInt = null;
let comboResetTimer = null;

document.querySelectorAll('.diff-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (state.playing) { showToast('Finish this round first'); return; }
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.difficulty = btn.dataset.diff;
    soundClick();
    msgEl.innerHTML = 'Difficulty: <strong>' + DIFFICULTIES[state.difficulty].label + '</strong>. Hit START.';
  });
});

// Crosshair follow mouse
area.addEventListener('mousemove', e => {
  const rect = area.getBoundingClientRect();
  crosshair.style.left = (e.clientX - rect.left) + 'px';
  crosshair.style.top = (e.clientY - rect.top) + 'px';
});
area.addEventListener('touchmove', e => {
  if (e.touches.length === 0) return;
  const rect = area.getBoundingClientRect();
  const t = e.touches[0];
  crosshair.style.left = (t.clientX - rect.left) + 'px';
  crosshair.style.top = (t.clientY - rect.top) + 'px';
}, { passive: true });

function updateHUD() {
  scoreEl.textContent = state.score;
  missEl.textContent = state.misses;
  timeEl.textContent = state.gtime;
  comboEl.textContent = state.combo;
  hsEl.textContent = state.headshots;
}

function popScore(x, y, points, isHead) {
  const p = document.createElement('div');
  p.className = 'pop-score' + (isHead ? ' hs' : '');
  p.textContent = '+' + points + (isHead ? ' HS!' : '');
  p.style.left = x + 'px';
  p.style.top = y + 'px';
  area.appendChild(p);
  setTimeout(() => { if (p.parentNode) p.remove(); }, 800);
}

function spawnTarget() {
  if (!state.playing) return;
  const cfg = DIFFICULTIES[state.difficulty];
  const rect = area.getBoundingClientRect();
  const size = cfg.size;
  const padding = size / 2 + 10;
  const x = padding + Math.random() * Math.max(0, rect.width - padding * 2);
  const y = padding + Math.random() * Math.max(0, rect.height - padding * 2);

  const target = document.createElement('div');
  target.className = 'target';
  target.style.width = size + 'px';
  target.style.height = size + 'px';
  target.style.left = x + 'px';
  target.style.top = y + 'px';
  target.innerHTML =
    '<div class="target-body">' +
      '<span class="target-emoji">' + EMOJIS[Math.floor(Math.random() * EMOJIS.length)] + '</span>' +
    '</div>' +
    '<div class="target-head"></div>';

  let hit = false;
  const lifeTimer = setTimeout(() => {
    if (target.parentNode && !hit) {
      target.remove();
      onMiss();
    }
  }, cfg.life);

  const handleHit = (isHead) => {
    if (hit) return;
    hit = true;
    clearTimeout(lifeTimer);
    const px = parseFloat(target.style.left);
    const py = parseFloat(target.style.top);
    target.remove();
    onHit(isHead, px, py);
  };

  const headEl = target.querySelector('.target-head');
  const bodyEl = target.querySelector('.target-body');

  headEl.addEventListener('click', e => { e.stopPropagation(); handleHit(true); });
  headEl.addEventListener('touchstart', e => { e.stopPropagation(); e.preventDefault(); handleHit(true); }, { passive: false });
  bodyEl.addEventListener('click', e => { e.stopPropagation(); handleHit(false); });
  bodyEl.addEventListener('touchstart', e => { e.stopPropagation(); e.preventDefault(); handleHit(false); }, { passive: false });

  area.appendChild(target);
}

function onHit(isHead, x, y) {
  state.combo++;
  if (state.combo > state.bestCombo) state.bestCombo = state.combo;
  const mult = state.combo >= 5 ? 3 : state.combo >= 3 ? 2 : 1;
  const points = (isHead ? 3 : 1) * mult;
  state.score += points;
  if (isHead) { state.headshots++; soundHeadshot(); } else { soundHit(); }
  popScore(x, y, points, isHead);
  updateHUD();
  clearTimeout(comboResetTimer);
  comboResetTimer = setTimeout(() => { state.combo = 0; updateHUD(); }, 2000);
}

function onMiss() {
  state.misses++;
  state.combo = 0;
  clearTimeout(comboResetTimer);
  soundMiss();
  updateHUD();
}

// Miss on empty area click
area.addEventListener('click', e => {
  if (!state.playing) return;
  if (e.target === area || e.target === crosshair || e.target.classList.contains('crosshair')) {
    onMiss();
  }
});

startBtn.addEventListener('click', () => {
  if (state.playing) return;
  initAudio();
  state.playing = true;
  state.score = 0;
  state.misses = 0;
  state.combo = 0;
  state.bestCombo = 0;
  state.headshots = 0;
  state.gtime = 30;
  updateHUD();
  msgEl.innerHTML = '<strong>ROUND LIVE</strong> — pounce accurate, avoid the misses!';
  startBtn.textContent = 'RUNNING...';
  startBtn.style.opacity = 0.5;

  const cfg = DIFFICULTIES[state.difficulty];
  spawnInt = setInterval(spawnTarget, cfg.spawn);
  gameInt = setInterval(() => {
    state.gtime--;
    updateHUD();
    if (state.gtime <= 0) endGame();
  }, 1000);
});

resetBtn.addEventListener('click', () => {
  if (state.playing) { showToast('Wait until the round ends'); return; }
  state.best = 0;
  bestEl.textContent = 0;
  try { localStorage.removeItem('cscat_best'); } catch (e) {}
  showToast('Best score reset');
  soundClick();
});

function endGame() {
  state.playing = false;
  clearInterval(gameInt);
  clearInterval(spawnInt);
  clearTimeout(comboResetTimer);
  document.querySelectorAll('.target, .pop-score').forEach(t => t.remove());

  const total = state.score;
  const rank =
    total >= 90 ? 'GLOBAL ELITE'    :
    total >= 65 ? 'SUPREME'         :
    total >= 45 ? 'LEGENDARY EAGLE' :
    total >= 25 ? 'GOLD NOVA'       :
                  'SILVER KITTEN';

  if (total > state.best) {
    state.best = total;
    bestEl.textContent = state.best;
    try { localStorage.setItem('cscat_best', String(state.best)); } catch (e) {}
    showToast('NEW BEST: ' + total + ' pts');
  }

  msgEl.innerHTML =
    'ROUND OVER — <strong>' + total + '</strong> pts · ' +
    '<strong>' + state.headshots + '</strong> HS · ' +
    'Best combo: <strong>' + state.bestCombo + '×</strong> · ' +
    'RANK: <strong>' + rank + '</strong>';
  startBtn.textContent = 'PLAY AGAIN';
  startBtn.style.opacity = 1;
}

// ============ CAMPAIGN COUNTDOWN ============
// Ganti tanggal & jam deadline di bawah (format: "YYYY-MM-DDTHH:MM:SS+07:00")
// +07:00 = WIB. Kalau mau UTC, pakai "Z"
const CAMPAIGN_DEADLINE = new Date("2026-08-26T23:59:59+07:00");

const countdownEl = document.getElementById('countdown');
function updateCountdown() {
  if (!countdownEl) return;
  const now = new Date();
  const diff = CAMPAIGN_DEADLINE - now;
  if (diff <= 0) {
    countdownEl.textContent = 'ENDED';
    countdownEl.style.color = 'var(--red)';
    return;
  }
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  countdownEl.textContent = hours + 'H ' + minutes + 'M ' + seconds + 'S';
}
updateCountdown();
setInterval(updateCountdown, 1000);
