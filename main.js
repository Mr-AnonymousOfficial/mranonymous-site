function loadSections() {
  const main = document.getElementById('main-content');
  document.querySelectorAll('template[data-section]').forEach(tpl => {
    main.appendChild(tpl.content.cloneNode(true));
  });
  initObservers();
  loadServers();
}

function initObservers() {
  const fadeObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); fadeObs.unobserve(e.target); }
    });
  }, { threshold: 0.08 });

  const skillObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.skill-bar').forEach(b => {
          const w = b.style.width; b.style.width = '0';
          setTimeout(() => b.style.width = w, 80);
        });
        skillObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in').forEach(el => fadeObs.observe(el));
  document.querySelectorAll('.skills-grid').forEach(el => skillObs.observe(el));
}

const servers = [
  { game: 'FiveM',     name: 'Dangerous RP', ip: 'cfx.re', players: null, max: 64 },
  { game: 'Minecraft', name: 'MC Server',     ip: null,     players: null, max: 20 },
  { game: 'DayZ',      name: 'DayZ Server',   ip: null,     players: null, max: 60 },
  { game: 'Roblox',    name: 'Roblox Server', ip: null,     players: null, max: 50 },
];

function renderServers(data) {
  const grid = document.getElementById('servers-grid');
  if (!grid) return;
  grid.innerHTML = data.map(s => {
    const online = s.players !== null;
    const pct = online ? Math.round((s.players / s.max) * 100) : 0;
    return `
    <div class="server-card">
      <div class="server-top">
        <div class="server-game">${s.game}</div>
        <div class="status-dot ${online ? 'online' : 'offline'}"></div>
      </div>
      <div class="server-name">${s.name}</div>
      <div class="server-players">${online ? `${s.players} / ${s.max} players` : 'Offline'}</div>
      ${online ? `<div class="skill-bar-wrap" style="margin-top:0.6rem"><div class="skill-bar" style="width:${pct}%"></div></div>` : ''}
    </div>`;
  }).join('');
}

async function loadServers() {
  const data = JSON.parse(JSON.stringify(servers));
  try {
    const r = await fetch('https://servers-frontend.fivem.net/api/servers/single/rzz6jd', {
      signal: AbortSignal.timeout(4000)
    });
    if (r.ok) {
      const j = await r.json();
      const sv = j?.Data;
      if (sv) {
        data[0].players = sv.clients;
        data[0].max     = sv.sv_maxclients || 64;
        data[0].name    = sv.hostname || 'Dangerous RP';
      }
    }
  } catch (_) {}
  renderServers(data);
  const rt = document.getElementById('refresh-time');
  if (rt) rt.textContent = new Date().toLocaleTimeString('el-GR');
}

document.addEventListener('DOMContentLoaded', loadSections);
