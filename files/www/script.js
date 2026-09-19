// ==========================================================
//  Reika-OS · BIOS Edition
// ==========================================================

const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"]/g,
  c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---------- MOCK ----------
const MOCK = {
  version: { model:'Hopper (KN-3811)', title:'4.3.9', arch:'aarch64',
             release:'4.03.C.9.0-0', sandbox:'lts-4.3' },
  system:  { hostname:'Reika-OS', domainname:'lan', uptime:3600*27+60*14,
             cpuload:12, memtotal:524288, memfree:302144, memcache:82100,
             membuffers:12000, swaptotal:262144, swapfree:240000,
             conntotal:8192, connfree:6880 },
  rci: {}
};

const USE_MOCK = false;

function unwrapRci(raw) {
  let d = Array.isArray(raw) ? raw[0] : raw;
  while (d && typeof d === 'object' && !Array.isArray(d)) {
    const keys = Object.keys(d);
    if (keys.length === 1) { d = d[keys[0]]; continue; }
    break;
  }
  return d;
}

async function api(cmd, arg='') {
  if (USE_MOCK) {
    if (cmd === 'version') return MOCK.version;
    if (cmd === 'system')  return MOCK.system;
    if (cmd === 'rci')     return MOCK.rci[arg] || { error:'mock' };
    return { error:'mock' };
  }
  const url = `/cgi-bin/api?cmd=${encodeURIComponent(cmd)}&arg=${encodeURIComponent(arg)}`;
  const r = await fetch(url);
  const text = await r.text();
  let json;
  try { json = JSON.parse(text); }
  catch(e) { return { error:'invalid json', raw: text.slice(0,200) }; }

  if (cmd === 'version' || cmd === 'system' || cmd === 'interfaces'
      || cmd === 'clients' || cmd === 'dhcp' || cmd === 'usb'
      || cmd === 'dns' || cmd === 'processes') {
    return unwrapRci(json);
  }
  return json;
}

// ==========================================================
//  ЯПОНСКИЙ ГЕНЕРАТОР
// ==========================================================
function makeJpWeirdGenerator() {
  const HIRA = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんぁぃぅぇぉゃゅょっ';
  const KATA = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンヴヵヶ';
  const KANJI = '零一二三四五六七八九十百千万上下左右前後東西南北人女男心日月火水木金土空海風雷雨電光闇夢痛死生魂';
  const JP_PUNCT = '。、・「」『』〜？！ー（）';
  const KUB = ['くぶ','クブ','クーブ','ｸﾌﾞ','kub','くうぶ','キュブ','救武','空舞','区武'];
  const RAI = ['ライカ','らいか','ライカー','雷華','ﾗｲｶ','raika','雷火','羅衣華'];

  const pick = a => a[Math.floor(Math.random()*a.length)];
  const rnd  = n => Math.floor(Math.random()*n);

  function randHira(n){ let s=''; for(let i=0;i<n;i++) s+=pick(HIRA); return s; }
  function randKata(n){ let s=''; for(let i=0;i<n;i++) s+=pick(KATA); return s; }
  function randKanji(n){ let s=''; for(let i=0;i<n;i++) s+=pick(KANJI); return s; }

  return function randLine() {
    const r = Math.random();
    if (r < 0.08) return pick(KUB)+' '+pick(RAI)+' '+pick(KUB);
    if (r < 0.18) return randHira(10+rnd(24));
    if (r < 0.28) return randKata(10+rnd(22));
    if (r < 0.36) return randKanji(6+rnd(14));
    if (r < 0.44) return randHira(6)+randKata(6)+randKanji(4);
    if (r < 0.52) return randKata(8)+pick(JP_PUNCT)+randHira(8)+pick(JP_PUNCT);
    if (r < 0.60) return pick(RAI)+' '+randKata(8)+' '+pick(KUB);
    if (r < 0.68) return randKanji(4)+'。'+randKanji(4)+'。'+randKanji(4);
    if (r < 0.76) return pick(KUB).repeat(3+rnd(5));
    if (r < 0.84) return randHira(20+rnd(30))+pick(JP_PUNCT);
    if (r < 0.92) return pick(RAI)+pick(KUB)+randKata(6);
    return randKata(4)+' '+randKanji(3)+' '+randHira(6)+' '+pick(KUB);
  };
}

// ==========================================================
//  BOOT
// ==========================================================
const BOOTLOG_LINES = [
  'ReikaBIOS v4.3.9  (C) 2026 lunarshe11',
  'CPU: Reika-Core aarch64 @ 1200 MHz, 2 cores',
  'Memory Test : 524288K OK',
  'Cache : L1 32K, L2 256K, L3 1024K',
  '',
  'Detecting Primary Master  ... Reika-OS System Disk',
  'Detecting Primary Slave   ... None',
  'Detecting Secondary Master... None',
  'Detecting Secondary Slave ... None',
  'Detecting USB Storage     ... Kingston DataTraveler Duo',
  '  Capacity  ... 32 GB',
  '  Filesystem... ext4',
  '',
  'Initializing PCI devices ...',
  '  Bus 00:01.0  ... Ethernet Controller',
  '  Bus 00:02.0  ... Wireless Controller 2.4G',
  '  Bus 00:03.0  ... Wireless Controller 5G',
  '  Bus 00:04.0  ... USB xHCI Controller',
  '',
  'Mounting /opt             ... <span class="ok">OK</span>',
  'Mounting /var             ... <span class="ok">OK</span>',
  'Mounting /tmp             ... <span class="ok">OK</span>',
  'Loading kernel modules    ... <span class="ok">OK</span>',
  '  usb-storage  <span class="ok">OK</span>   cdc-ether  <span class="ok">OK</span>   bridge  <span class="ok">OK</span>',
  '  br_netfilter <span class="ok">OK</span>   nf_conntrack <span class="ok">OK</span>',
  '  rfkill       <span class="ok">OK</span>   cfg80211  <span class="ok">OK</span>   mac80211 <span class="ok">OK</span>',
  '',
  'Starting network services ...',
  '  br0  192.168.1.1/24    <span class="ok">UP</span>',
  '  eth0 203.0.113.42/24   <span class="ok">UP</span>',
  '  wlan0                 <span class="ok">UP</span>',
  '  wlan1                 <span class="ok">UP</span>',
  'Initializing RCI transport : POST 127.0.0.1:79',
  'RCI probe ... <span class="ok">OK</span>  (release 4.03.C.9.0-0)',
  '',
  'Loading kub               ... <span class="ok">OK</span>',
  'Loading reika-net         ... <span class="ok">OK</span>',
  'Loading reika-ui          ... <span class="ok">OK</span>',
  'Loading reika-sec         ... <span class="ok">OK</span>',
  'Loading reika-log         ... <span class="ok">OK</span>',
  '',
  'Checking filesystem       ... <span class="ok">OK</span>',
  'Checking user db          ... <span class="ok">OK</span>',
  'Starting system logger    ... <span class="ok">OK</span>',
  'Starting cron daemon      ... <span class="ok">OK</span>',
  'Starting ssh daemon       ... <span class="ok">OK</span>',
  '',
  'Welcome to <span class="ok">Reika-OS</span>',
  'Booting Reika-OS 4.3.9 ...',
];

async function bootSequence() {
  const post = $('post');
  const log = $('bootlog');

  const perLine = Math.floor(400 / BOOTLOG_LINES.length);
  for (const line of BOOTLOG_LINES) {
    log.innerHTML += line + '\n';
    await sleep(perLine);
  }

  log.textContent = '';
  await sleep(5600);
  post.classList.add('blue');
  await sleep(3500);

  $('boot-black').classList.add('hidden');
  $('boot-logo').classList.remove('hidden');

  setupHeartEgg();

  await sleep(3000);
  $('raika-text').textContent = 'R.A.I.K.A O.S';

  await sleep(7000);
  $('boot-logo').classList.add('hidden');

  await sleep(2000);
  post.remove();

  $('bios').classList.remove('hidden');
  $('bios-nav').classList.remove('hidden');
  await tabsBootSequence();

  loadMain();
  loadAdvanced();
  loadSecurity();
  loadBoot();
  startAutoRefresh();
}

async function tabsBootSequence() {
  const tabs = document.querySelectorAll('.nav-tab');
  const content = document.querySelector('.bios-content');

  const status = document.createElement('div');
  status.style.cssText =
    'font:11px/1.6 var(--mono);color:#aaa;padding:10px 14px;' +
    'border-bottom:1px dashed #00007a;white-space:pre-wrap;min-height:36px';
  content.parentNode.insertBefore(status, content);

  const NAMES = ['MAIN', 'ADVANCED', 'SECURITY', 'BOOT', 'TOOLS'];
  for (let i = 0; i < tabs.length; i++) {
    const name = NAMES[i] || tabs[i].textContent.toUpperCase();
    status.innerHTML +=
      `<span style="color:#55ffff">Loading</span> ${name} ... <span style="color:#55ff55">OK</span>\n`;
    await sleep(120);
  }
  status.innerHTML += `<span style="color:#55ffff">Ready.</span>`;
  await sleep(300);
  status.remove();
}

// ==========================================================
//  ПАСХАЛКА: 9 тапов по сердцу
// ==========================================================
function setupHeartEgg() {
  const heart = document.querySelector('.heart');
  if (!heart) return;
  let taps = 0;

  heart.onclick = async () => {
    taps++;
    if (taps !== 9) return;
    taps = 0;

    const post = $('post');
    post.classList.add('glitch');

    const stream = document.createElement('pre');
    stream.id = 'post-weird';
    document.body.appendChild(stream);

    const randLine = makeJpWeirdGenerator();
    const startedAt = Date.now();
    while (Date.now() - startedAt < 1000) {
      stream.innerHTML += randLine() + '\n';
      stream.scrollTop = stream.scrollHeight;
      await sleep(15 + Math.random() * 20);
    }

    stream.remove();
    post.classList.remove('glitch');

    $('raika-text').textContent = 'R.A.I.K.A O.S';
  };
}

// ==========================================================
//  TABS
// ==========================================================
document.querySelectorAll('.nav-tab').forEach(b => b.onclick = () => {
  document.querySelectorAll('.nav-tab').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  $('tab-' + b.dataset.tab).classList.add('active');
  $('bios-content').scrollTop = 0;
});

// ==========================================================
//  RENDER
// ==========================================================
function renderRows(container, rows) {
  container.innerHTML = rows.map(([label, value, cls]) =>
    `<div class="bios-row">
       <span class="bios-label">${esc(label)}</span>
       <span class="bios-val ${cls||''}">${esc(value)}</span>
     </div>`
  ).join('');
}

// ==========================================================
//  MAIN
// ==========================================================
async function loadMain() {
  pulseCorner(null);
  try {
    const v = await api('version');
    const s = await api('system');
    if (!v || typeof v !== 'object') throw new Error('no version data');
    if (!s || typeof s !== 'object') throw new Error('no system data');

    const upSec = Number(s.uptime) || 0;
    const d = Math.floor(upSec/86400), h = Math.floor(upSec%86400/3600), m = Math.floor(upSec%3600/60);
    const upStr = (d?d+'d ':'') + h + 'h ' + m + 'm';
    const mt = Number(s.memtotal)||0, mf = Number(s.memfree)||0;
    const mc = Number(s.memcache)||0, mb = Number(s.membuffers)||0;
    const memUsed = mt - mf - mc - mb;
    const memPct = mt ? Math.round(memUsed/mt*100) : 0;
    const ct = Number(s.conntotal)||0, cf = Number(s.connfree)||0;

    renderRows($('main-rows'), [
      ['System Model',     v.model || v.description || '—', ''],
      ['Firmware Version', v.title || '—',  ''],
      ['Release',          v.release || '—',''],
      ['Sandbox',          v.sandbox || '—',''],
      ['Architecture',     v.arch || '—',   ''],
      ['Hostname',         s.hostname || '—',''],
      ['Domain',           s.domainname || '—',''],
      ['Uptime',           upStr,           ''],
      ['CPU Load',         (s.cpuload ?? '—') + '%', (s.cpuload>90?'err':(s.cpuload>70?'warn':'ok'))],
      ['Memory',           mt ? (memPct+'%  ('+Math.round(memUsed/1024)+'/'+Math.round(mt/1024)+' MB)') : '—',
                            memPct>85?'err':(memPct>70?'warn':'ok')],
      ['Connections',      ct ? ((ct-cf)+' / '+ct) : '—', '']
    ]);

    $('bios-sub').textContent = (v.title||'—') + ' · ' + (v.arch||'—');
    pulseCorner('ok');
  } catch(e) {
    $('main-rows').innerHTML =
      `<div class="bios-row"><span class="bios-label">ERROR</span><span class="bios-val err">${esc(e.message)}</span></div>`;
    pulseCorner('nosignal');
  }
}

// ==========================================================
//  ADVANCED
// ==========================================================
async function loadAdvanced() {
  try {
    const s = await api('system');
    renderRows($('adv-rows'), [
      ['memtotal',    s.memtotal ?? '—',    ''],
      ['memfree',     s.memfree ?? '—',     ''],
      ['memcache',    s.memcache ?? '—',    ''],
      ['membuffers',  s.membuffers ?? '—',  ''],
      ['swaptotal',   s.swaptotal ?? '—',   ''],
      ['swapfree',    s.swapfree ?? '—',    ''],
      ['conntotal',   s.conntotal ?? '—',   ''],
      ['connfree',    s.connfree ?? '—',    '']
    ]);
  } catch(e) {
    $('adv-rows').innerHTML =
      `<div class="bios-row"><span class="bios-label">ERROR</span><span class="bios-val err">${esc(e.message)}</span></div>`;
  }
}

// ==========================================================
//  SECURITY
// ==========================================================
async function loadSecurity() {
  try {
    let lines = [];
    try {
      const raw = await api('running-config');
      if (Array.isArray(raw)) {
        const inner = raw[0]?.parse || raw[0]?.show || raw[0];
        lines = inner?.message || [];
      } else if (raw?.parse?.message) {
        lines = raw.parse.message;
      } else if (raw?.message) {
        lines = raw.message;
      }
    } catch(e) {}

    const has  = re => lines.some(l => re.test(l));
    const find = re => {
      for (const l of lines) { const m = l.match(re); if (m) return m; }
      return null;
    };

    let procs = [];
    try {
      const p = await api('processes');
      procs = p?.process || p?.processes || [];
      if (!Array.isArray(procs) && typeof procs === 'object') procs = Object.values(procs);
    } catch(e) {}

    const procRunning = re => procs.some(pr => {
      const id = pr.id || pr.name || '';
      const st = String(pr.status || pr.state || pr.running || '').toLowerCase();
      return re.test(id) && (st.includes('run') || pr.running === true || pr.active === true);
    });

    const httpPortM = find(/ip http port (\d+)/);
    const httpPort  = httpPortM ? httpPortM[1] : '80';

    const hasSsl   = has(/ip http ssl enable/);
    const sslPortM = find(/ip http ssl port (\d+)/);
    const sslPort  = sslPortM ? sslPortM[1] : '443';

    const telnetOn = procRunning(/Telnet::Server|telnet/i);

    const lockM   = find(/ip http lockout-policy (\d+) (\d+) (\d+)/);
    const lockout = lockM ? (lockM[1]+' попыток / '+lockM[2]+' мин') : '—';

    renderRows($('sec-rows'), [
      ['Reika Basic Auth',   'Enabled (reika/os)',                'ok'],
      ['HTTP Port',          String(httpPort),                    ''],
      ['HTTPS',              hasSsl ? 'Enabled' : 'Disabled',     hasSsl?'ok':'warn'],
      ['HTTPS Port',         String(sslPort),                     ''],
      ['TELNET',             telnetOn ? 'Enabled' : 'Disabled',   telnetOn?'err':'ok'],
      ['Lockout Policy',     lockout,                             ''],
      ['Access Log',         '/opt/var/log/lighttpd/access.log',  '']
    ]);
  } catch(e) {
    $('sec-rows').innerHTML =
      `<div class="bios-row"><span class="bios-label">ERROR</span><span class="bios-val err">${esc(e.message)}</span></div>`;
  }
}

// ==========================================================
//  BOOT
// ==========================================================
async function loadBoot() {
  try {
    const v = await api('version').catch(()=>({}));
    const s = await api('system').catch(()=>({}));

    let slot = '1', backup = '—';
    try {
      const r1 = await api('rci', 'exec cat /proc/dual_image/boot_current');
      const m1 = r1?.parse?.message?.[0] || r1?.message?.[0] || r1?.[0]?.parse?.message?.[0];
      if (m1) slot = String(m1).trim();
    } catch(e) {}
    try {
      const r2 = await api('rci', 'exec cat /proc/dual_image/boot_backup');
      const m2 = r2?.parse?.message?.[0] || r2?.message?.[0] || r2?.[0]?.parse?.message?.[0];
      if (m2) backup = String(m2).trim();
    } catch(e) {}

    let upStr = '—';
    const sec = Number(s.uptime) || 0;
    if (sec) {
      const d = Math.floor(sec/86400), h = Math.floor(sec%86400/3600), m = Math.floor(sec%3600/60);
      upStr = (d?d+'d ':'') + h + 'h ' + m + 'm';
    }

    const slot2 = v.ndw4?.version || '—';
    const dual  = (v.ndw?.features || '').includes('dual_image');

    renderRows($('boot-rows'), [
      ['Active Firmware',    v.title || '—',   ''],
      ['Release',            v.release || '—', ''],
      ['Sandbox',            v.sandbox || '—', ''],
      ['Active Slot',        slot,             slot==='1'?'ok':'warn'],
      ['Backup Slot',        backup,           ''],
      ['Firmware (Slot 2)',  slot2,            ''],
      ['Dual Image',         dual ? 'Yes' : 'No', dual?'ok':''],
      ['Last Boot',          upStr + ' ago',   ''],
      ['Boot Device',        'Internal NAND',  '']
    ]);

    const box = $('boot-rows').parentNode;
    if (!box.querySelector('.bios-buttons')) {
      const btns = document.createElement('div');
      btns.className = 'bios-buttons';
      btns.style.cssText =
        'padding:12px;display:flex;gap:8px;flex-wrap:wrap;' +
        'border-top:1px dashed #00007a;margin-top:8px';
      btns.innerHTML =
        '<button class="bios-btn" data-act="save-config">Save Config</button>' +
        '<button class="bios-btn" data-act="reboot">Reboot</button>' +
        '<button class="bios-btn" data-act="shutdown">Shutdown</button>';
      box.appendChild(btns);

      btns.querySelectorAll('button').forEach(b => b.onclick = async () => {
        const a = b.dataset.act;
        if (a === 'save-config') {
          await api('save');
          b.textContent = 'Saved ✓';
          setTimeout(() => b.textContent = 'Save Config', 2000);
        }
        if (a === 'reboot')   openPowerModal('reboot');
        if (a === 'shutdown') openPowerModal('shutdown');
      });
    }
  } catch(e) {
    $('boot-rows').innerHTML =
      `<div class="bios-row"><span class="bios-label">ERROR</span><span class="bios-val err">${esc(e.message)}</span></div>`;
  }
}

// ==========================================================
//  RCI CONSOLE
// ==========================================================
$('rci-send').onclick = () => runRci($('rci-input').value.trim());
$('rci-input').onkeydown = e => {
  if (e.key === 'Enter') { e.preventDefault(); runRci(e.target.value.trim()); }
};

async function runRci(cmd) {
  if (!cmd) return;
  const out = $('rci-output');
  const cur = out.textContent.replace(/\n> _$/, '');

  const key = cmd.toLowerCase().trim();
  if (key === 'clear' || key === 'cls') {
    out.textContent = '> _';
    $('rci-input').value = '';
    return;
  }

  out.textContent = cur + '\n> ' + cmd + '\n\n…';
  out.scrollTop = out.scrollHeight;
  try {
    const r = await api('rci', cmd);
    out.textContent = cur + '\n> ' + cmd + '\n\n' + JSON.stringify(r, null, 2) + '\n\n> _';
    pulseCorner('ok');
  } catch(e) {
    out.textContent = cur + '\n> ' + cmd + '\n\nERROR: ' + e.message + '\n\n> _';
    pulseCorner('nosignal');
  }
  out.scrollTop = out.scrollHeight;
  $('rci-input').value = '';
  $('rci-input').focus();
}

// ==========================================================
//  POWER MODAL
// ==========================================================
function openPowerModal(mode) {
  const m = $('logoff-modal');
  const head = $('modal-head');
  const line = $('modal-line');

  if (mode === 'reboot') {
    head.textContent = '⚠ Confirm Reboot';
    line.textContent = 'Do you want to reboot the router?';
  } else if (mode === 'shutdown') {
    head.textContent = '⚠ Confirm Shutdown';
    line.textContent = 'Do you want to shut down the router?';
  } else {
    head.textContent = '⚠ Confirm Logoff';
    line.textContent = 'Do you want to log off the current user?';
  }

  m.dataset.mode = mode;
  m.classList.add('show');
}

$('power-btn').onclick = () => openPowerModal('logoff');

$('logoff-no').onclick = () => {
  $('logoff-modal').classList.remove('show');
};

$('logoff-yes').onclick = () => {
  const mode = $('logoff-modal').dataset.mode || 'logoff';
  $('logoff-modal').classList.remove('show');
  runPowerAction(mode);
};

// ==========================================================
//  POWER ACTION
// ==========================================================
async function runPowerAction(mode) {
  const nav    = $('bios-nav');
  const header = document.querySelector('.bios-header');
  const panels = document.querySelectorAll('.panel');
  const screen = $('logoff-screen');

  if (mode === 'reboot')   { try { await api('reboot'); }   catch(e) {} }
  if (mode === 'shutdown') { try { await api('shutdown'); } catch(e) {} }

  nav.classList.add('hidden');
  await sleep(2500);
  header.style.visibility = 'hidden';
  panels.forEach(p => p.classList.remove('active'));
  await sleep(2000);

  screen.classList.remove('hidden');
  await sleep(1500);

  const LABEL = { logoff:'LOGOFF', reboot:'REBOOT', shutdown:'SHUTDOWN' }[mode];

  const stream1 = document.createElement('pre');
  stream1.id = 'logoff-stream';
  screen.appendChild(stream1);

  const WAVE1 = [
    `<span class="lbl">[ 0.000]</span> ${LABEL} sequence initiated`,
    `<span class="lbl">[ 0.012]</span> C̷P̷U̷:̷ Reika-Core aarch64 @ 1200 MHz`,
    `<span class="lbl">[ 0.021]</span> M̸e̸m̸:̸ 524288K/524288K available`,
    '<span class="ok">[ OK ]</span> M̷o̷u̷n̷t̷e̷d̷ /proc',
    '<span class="ok">[ OK ]</span> M̷o̷u̷n̷t̷e̷d̷ /sys',
    '<span class="ok">[ OK ]</span> M̷o̷u̷n̷t̷e̷d̷ /dev',
    '<span class="ok">[ OK ]</span> Reached target Basic System',
    '<span class="ok">[ OK ]</span> Reached target Network',
    '<span class="ok">[ OK ]</span> Started Reika RCI Service',
    `<span class="lbl">[LOG]</span> closing session 0x1A3F`,
    `<span class="lbl">[LOG]</span> flushing buffers`,
    `<span class="lbl">[LOG]</span> stopping daemon kub ... <span class="ok">OK</span>`,
    `<span class="lbl">[LOG]</span> stopping daemon link ... <span class="ok">OK</span>`,
    `<span class="lbl">[LOG]</span> stopping daemon sync ... <span class="ok">OK</span>`,
    `<span class="lbl">[LOG]</span> stopping daemon scan ... <span class="ok">OK</span>`,
    `<span class="lbl">[LOG]</span> stopping daemon load ... <span class="ok">OK</span>`,
    `<span class="lbl">[LOG]</span> stopping daemon verify ... <span class="ok">OK</span>`,
    `<span class="lbl">[LOG]</span> stopping daemon online ... <span class="ok">OK</span>`,
    `<span class="lbl">[LOG]</span> releasing RCI transport`,
    `<span class="lbl">[LOG]</span> dismounting /opt ... <span class="ok">OK</span>`,
    `<span class="lbl">[LOG]</span> dismounting /var ... <span class="ok">OK</span>`,
    `<span class="lbl">[LOG]</span> unmounting usb0 ... <span class="ok">OK</span>`,
    `<span class="lbl">[LOG]</span> clearing swap ... <span class="ok">OK</span>`,
    `<span class="lbl">[LOG]</span> closing tty`,
    `<span class="glitch">k̷u̷b̷ ̷d̷i̷s̷c̷o̷n̷n̷e̷c̷t̷e̷d̷</span>`,
    `<span class="glitch">l̷i̷n̷k̷ ̷l̷o̷s̷t̷</span>`,
    `<span class="warn">[WARN]</span> no heartbeat from kub`,
    `<span class="warn">[WARN]</span> no heartbeat from link`,
    `<span class="err">[FAIL]</span> session terminated`,
    `<span class="err">[FAIL]</span> broadcast message from root`,
    `<span class="err">[FAIL]</span> system going down NOW`,
    `<span class="glitch">R̸A̸I̸K̸A̸-̸O̸S̸ ̸o̸f̸f̸l̸i̸n̸e̸</span>`,
    `<span class="lbl">[KERN]</span> panic: no more signals`,
    `<span class="dim">mask off</span> <span class="dim">mask on</span>`,
    `login: _`
  ];

  for (const line of WAVE1) {
    stream1.innerHTML += line + '\n';
    await sleep(50);
  }
  await sleep(900);

  stream1.remove();
  const word = document.createElement('div');
  word.className = 'logoff-word';
  word.textContent = mode;
  if (mode.length > 7) word.style.fontSize = '32px';
  screen.appendChild(word);
  await sleep(2000);
  word.remove();

  const stream2 = document.createElement('pre');
  stream2.id = 'logoff-weird';
  screen.appendChild(stream2);
  screen.classList.add('glitching');

  const randLine = makeJpWeirdGenerator();
  let running = true;
  window.addEventListener('beforeunload', () => { running = false; });

  (async function infiniteWeird() {
    while (running) {
      stream2.innerHTML += randLine() + '\n';
      stream2.scrollTop = stream2.scrollHeight;
      await sleep(12 + Math.random() * 22);
    }
  })();

  await sleep(1500);
  screen.classList.add('artifacts');
  await sleep(1500);
  screen.classList.add('glitching-2');
  await sleep(1500);
  screen.classList.add('glitching-3');

  const overlay = document.createElement('div');
  overlay.id = 'wake-overlay';
  screen.appendChild(overlay);

  for (let i = 1; i <= 3; i++) {
    const w = document.createElement('div');
    w.className = 'wake-up w' + i;
    w.textContent = 'wake up';
    overlay.appendChild(w);
    await sleep(750);
  }
  await sleep(750);

  running = false;

  if (mode === 'reboot') {
    location.reload();
  } else if (mode === 'shutdown') {
    screen.classList.remove('glitching','glitching-2','glitching-3','artifacts');
    stream2.innerHTML = '';
    overlay.innerHTML = '';
    stream2.innerHTML =
      '\n\n\n\n  *** SYSTEM HALTED ***\n\n  It is now safe to turn off your router.\n';
  } else {
    window.location.href = 'https://duckduckgo.com';
  }
}

// ==========================================================
//  CORNER
// ==========================================================
let cornerTimer;
function pulseCorner(state) {
  clearTimeout(cornerTimer);
  const c = $('bios-corner');
  if (!state) { c.classList.remove('show'); return; }
  let src = '';
  if (state === 'nosignal') src = 'logo/nosignal.jpg';
  if (state === 'sad')      src = 'logo/sadsmile.jpg';
  if (!src) { c.classList.remove('show'); return; }
  c.innerHTML = `<img src="${src}" alt="">`;
  c.classList.add('show');
  cornerTimer = setTimeout(() => c.classList.remove('show'), 2500);
}

// ==========================================================
//  AUTO REFRESH
// ==========================================================
let refreshTimer;
function startAutoRefresh() {
  clearInterval(refreshTimer);
  refreshTimer = setInterval(() => {
    if ($('tab-main').classList.contains('active')) loadMain();
  }, 10000);
}

// ==========================================================
//  GO
// ==========================================================
bootSequence();