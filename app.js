const STORAGE_KEY = 'archimonstre_tracker_v1';
let SEED = null;

function defaultState(seed) {
  const captures = {};
  seed.archimonstres.forEach(function (a) {
    captures[a.id] = { capture: false };
  });
  return { captures: captures };
}

function loadState(seed) {
  const brut = localStorage.getItem(STORAGE_KEY);
  if (!brut) {
    return defaultState(seed);
  }
  try {
    const lu = JSON.parse(brut);
    const fusion = defaultState(seed);
    seed.archimonstres.forEach(function (a) {
      const e = lu.captures ? lu.captures[a.id] : null;
      if (e) {
        fusion.captures[a.id] = { capture: !!e.capture };
      }
    });
    return fusion;
  } catch (err) {
    return defaultState(seed);
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function pierresRequises(seed) {
  const totaux = {};
  seed.archimonstres.forEach(function (a) {
    totaux[a.pierre_dame_id] = (totaux[a.pierre_dame_id] || 0) + a.etapes;
  });
  return totaux;
}

async function chargerSeed() {
  const reponse = await fetch('archimonstre.json');
  if (!reponse.ok) {
    throw new Error('HTTP ' + reponse.status);
  }
  return reponse.json();
}

if (typeof document !== 'undefined') {
  let state = null;
  const zonesParId = {};
  const pierresParId = {};

  function el(id) {
    return document.getElementById(id);
  }

  function majStats() {
    const total = SEED.archimonstres.length;
    const faits = SEED.archimonstres.filter(function (a) {
      return state.captures[a.id].capture;
    }).length;
    const pct = Math.round(faits / total * 100);
    el('stats').textContent = faits + ' / ' + total + ' archimonstres capturés (' + pct + ' %)';
    el('progress-bar').style.width = pct + '%';
  }

  function majPierres() {
    const totaux = pierresRequises(SEED);
    el('pierres').textContent = 'Pierres requises : ' + SEED.pierres.map(function (p) {
      return p.nom + ' × ' + (totaux[p.id] || 0);
    }).join(', ');
  }

  function remplirSelects() {
    const selZone = el('filter-zone');
    SEED.zones.forEach(function (z) {
      const o = document.createElement('option');
      o.value = z.id;
      o.textContent = z.nom;
      selZone.appendChild(o);
    });
    const selPierre = el('filter-pierre');
    SEED.pierres.forEach(function (p) {
      const o = document.createElement('option');
      o.value = p.id;
      o.textContent = p.nom + ' (max ' + p.lvl_max + ')';
      selPierre.appendChild(o);
    });
  }

  const comparateurs = {
    nom: function (a, b) { return a.nom.localeCompare(b.nom); },
    lvl: function (a, b) { return (a.lvl_max - b.lvl_max) || a.nom.localeCompare(b.nom); },
    pierre: function (a, b) {
      return (pierresParId[a.pierre_dame_id].lvl_max - pierresParId[b.pierre_dame_id].lvl_max) || a.nom.localeCompare(b.nom);
    }
  };

  function archisFiltres() {
    const q = el('search').value.trim().toLowerCase();
    const zone = el('filter-zone').value;
    const pierre = el('filter-pierre').value;
    const statut = el('filter-statut').value;
    const liste = SEED.archimonstres.filter(function (a) {
      if (q && a.nom.toLowerCase().indexOf(q) === -1 && a.monstre.toLowerCase().indexOf(q) === -1) return false;
      if (zone && a.zones_ids.indexOf(Number(zone)) === -1) return false;
      if (pierre && String(a.pierre_dame_id) !== pierre) return false;
      if (statut === 'captures' && !state.captures[a.id].capture) return false;
      if (statut === 'non-captures' && state.captures[a.id].capture) return false;
      if (el('masquer-captures').checked && state.captures[a.id].capture) return false;
      return true;
    });
    const cmp = comparateurs[el('sort').value] || comparateurs.nom;
    return liste.sort(cmp);
  }

  function cellule(tr, texte) {
    const td = document.createElement('td');
    td.textContent = texte;
    tr.appendChild(td);
  }

  function ligne(a) {
    const tr = document.createElement('tr');
    const possede = state.captures[a.id];
    if (possede.capture) {
      tr.className = 'capture-ok';
    }

    const tdCheck = document.createElement('td');
    const check = document.createElement('input');
    check.type = 'checkbox';
    check.checked = possede.capture;
    check.addEventListener('change', function () {
      state.captures[a.id].capture = check.checked;
      saveState(state);
      majStats();
      render();
    });
    tdCheck.appendChild(check);
    tr.appendChild(tdCheck);

    cellule(tr, a.nom);
    cellule(tr, a.monstre);
    cellule(tr, a.lvl_min + ' - ' + a.lvl_max);
    cellule(tr, String(a.etapes));
    cellule(tr, a.pierre_dame);
    cellule(tr, a.zones_ids.map(function (zid) { return zonesParId[zid] || zid; }).join(', '));
    return tr;
  }

  function render() {
    const liste = archisFiltres();
    const tbody = el('liste');
    tbody.textContent = '';
    liste.forEach(function (a) {
      tbody.appendChild(ligne(a));
    });
    el('compteur').textContent = liste.length + ' affiché(s)';
  }

  async function init() {
    try {
      SEED = await chargerSeed();
    } catch (err) {
      el('stats').textContent = 'Impossible de charger archimonstre.json — ouvre la page via un serveur local (ex. : python3 -m http.server) puis recharge.';
      return;
    }
    SEED.zones.forEach(function (z) { zonesParId[z.id] = z.nom; });
    SEED.pierres.forEach(function (p) { pierresParId[p.id] = p; });
    state = loadState(SEED);
    remplirSelects();
    ['search', 'filter-zone', 'filter-pierre', 'filter-statut', 'masquer-captures', 'sort'].forEach(function (id) {
      el(id).addEventListener('input', render);
      el(id).addEventListener('change', render);
    });
    el('reset').addEventListener('click', function () {
      if (!confirm('Revenir à l\'état d\'origine de la base ?')) return;
      localStorage.removeItem(STORAGE_KEY);
      state = defaultState(SEED);
      saveState(state);
      render();
      majStats();
    });
    render();
    majStats();
    majPierres();
  }

  init();
}
