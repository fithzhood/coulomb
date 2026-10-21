/******************************************************************
 * Coulomb — ripasso a domande e risposte
 * Le domande stanno in coulomb-domande.js
 ******************************************************************/

const VER = ((document.currentScript && document.currentScript.src || '').match(/\?v=\d+/) || [''])[0];
const VERSIONE = (VER.match(/\d+/) || ['dev'])[0];

const $ = id => document.getElementById(id);
const nomeArg = id => (ARGOMENTI.find(a => a.id === id) || {}).nome || '';

let scelti = new Set(ARGOMENTI.map(a => a.id));
let quante = 10;

// il giro in corso
let giro = [];        // voci (fisse o generate) da istanziare
let i = 0;
let attuale = null;   // domanda istanziata
let esiti = [];       // { voce, q: domanda istanziata, scelta, ok }

/* ---------- memoria leggera (solo comodità) ---------- */

function leggi() {
  try {
    const m = JSON.parse(localStorage.getItem('coulomb') || '{}');
    if (Array.isArray(m.scelti) && m.scelti.length) scelti = new Set(m.scelti.filter(id => ARGOMENTI.some(a => a.id === id)));
    if ([10, 20, 30].includes(m.quante)) quante = m.quante;
  } catch (e) {}
}
function salva() {
  try { localStorage.setItem('coulomb', JSON.stringify({ scelti: [...scelti], quante })); } catch (e) {}
}

/* ---------- schermate ---------- */

function mostra(id) {
  document.querySelectorAll('.schermo').forEach(s => s.classList.toggle('attivo', s.id === id));
}

function disegnaHome() {
  $('argomenti').innerHTML = ARGOMENTI.map(a =>
    '<button class="chip' + (scelti.has(a.id) ? ' sel' : '') + '" data-id="' + a.id + '">' +
    '<span class="spunta"></span>' + a.nome + '</button>').join('');
  document.querySelectorAll('#quante button').forEach(b => b.classList.toggle('sel', +b.dataset.n === quante));
  $('inizia').disabled = scelti.size === 0;
  $('versione').textContent = 'v' + VERSIONE;
}

/* ---------- costruzione del giro ---------- */

function nuovoGiro(n) {
  const fisse = rimescola(FISSE.filter(v => scelti.has(v.t)));
  const gen = GENERATE.filter(v => scelti.has(v.t));
  let mazzo = fisse.slice();
  gen.forEach(g => { for (let k = 0; k < (g.peso || 1); k++) mazzo.push(g); });
  mazzo = rimescola(mazzo);
  // le fisse non si ripetono; gli esercizi sì (cambiano i numeri)
  const out = mazzo.slice(0, n);
  while (out.length < n && gen.length) out.push(caso(gen));
  return evitaDoppiVicini(out);
}

// due esercizi uguali di fila sono noiosi: si prova a separarli
function evitaDoppiVicini(a) {
  for (let t = 0; t < 3; t++) {
    for (let k = 1; k < a.length; k++) {
      if (a[k] === a[k - 1]) {
        const j = (k + 2 + Math.floor(Math.random() * a.length)) % a.length;
        [a[k], a[j]] = [a[j], a[k]];
      }
    }
  }
  return a;
}

function parti(voci) {
  giro = voci;
  i = 0;
  esiti = [];
  mostra('quiz');
  disegnaDomanda();
}

/* ---------- una domanda ---------- */

function disegnaDomanda() {
  const voce = giro[i];
  attuale = istanzia(voce);
  $('numero').textContent = 'Domanda ' + (i + 1) + ' di ' + giro.length;
  $('argomento').textContent = nomeArg(attuale.t);
  $('punti').textContent = esiti.filter(e => e.ok).length + ' ✓';
  $('pallini').innerHTML = giro.map((_, k) =>
    '<i class="' + (k < esiti.length ? (esiti[k].ok ? 'si' : 'no') : (k === i ? 'ora' : '')) + '"></i>').join('');
  $('domanda').innerHTML = fmt(attuale.d);
  $('opzioni').innerHTML = attuale.opz.map((o, k) =>
    '<button class="opz" data-k="' + k + '"><span class="lettera">' + 'ABCD'[k] + '</span><span>' + fmt(o.x) + '</span></button>').join('');
  $('esito').innerHTML = '';
  $('avanti').disabled = true;
  $('avanti').textContent = i === giro.length - 1 ? 'Vedi il risultato' : 'Avanti';
  $('corpo').scrollTop = 0;
}

/* ---------- lettura ad alta voce (strumento compensativo) ---------- */

const voce = window.speechSynthesis || null;
let vocaleIt = null;
function trovaVoce() {
  if (!voce) return;
  const tutte = voce.getVoices();
  vocaleIt = tutte.find(v => /^it/i.test(v.lang) && /google|natural|online/i.test(v.name)) ||
             tutte.find(v => /^it/i.test(v.lang)) || null;
}
if (voce) { trovaVoce(); voce.onvoiceschanged = trovaVoce; }

function leggiForte(testo) {
  if (!voce) return;
  voce.cancel();
  const u = new SpeechSynthesisUtterance(testo);
  u.lang = 'it-IT';
  if (vocaleIt) u.voice = vocaleIt;
  u.rate = 0.9;
  voce.speak(u);
}
function zitto() { if (voce) voce.cancel(); }

function testoDaLeggere() {
  if (!$('avanti').disabled) {
    const giusta = attuale.opz.find(o => o.ok).x;
    return 'La risposta giusta è: ' + parlato(giusta) + '. ' + parlato(attuale.s);
  }
  return parlato(attuale.d) + '. ' +
    attuale.opz.map((o, k) => 'Risposta ' + 'ABCD'[k] + ': ' + parlato(o.x) + '.').join(' ');
}

function rispondi(k) {
  if (!$('avanti').disabled) return;          // già risposto
  const ok = attuale.opz[k].ok;
  esiti.push({ voce: giro[i], q: attuale, scelta: k, ok });
  document.querySelectorAll('.opz').forEach((b, j) => {
    b.disabled = true;
    if (attuale.opz[j].ok) { b.classList.add('giusta'); b.querySelector('.lettera').textContent = '✓'; }
    else if (j === k) { b.classList.add('sbagliata'); b.querySelector('.lettera').textContent = '✗'; }
    else b.classList.add('spenta');
  });
  $('esito').innerHTML =
    '<div class="titolo ' + (ok ? 'si">✓ Giusto!' : 'no">✗ Non è questa') + '</div>' +
    '<div class="spiega">' + fmt(attuale.s) + '</div>';
  $('punti').textContent = esiti.filter(e => e.ok).length + ' ✓';
  $('pallini').children[i].className = ok ? 'si' : 'no';
  $('avanti').disabled = false;
  // porta in vista la spiegazione senza far saltare tutto
  requestAnimationFrame(() => $('esito').scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
}

function avanti() {
  if ($('avanti').disabled) return;
  zitto();
  i++;
  if (i < giro.length) disegnaDomanda();
  else disegnaFine();
}

/* ---------- fine ---------- */

function disegnaFine() {
  const giuste = esiti.filter(e => e.ok).length, tot = esiti.length;
  const p = giuste / tot;
  $('voto').innerHTML = giuste + '<small> / ' + tot + '</small>';
  $('giudizio').textContent =
    p === 1 ? 'Tutto giusto!' :
    p >= .8 ? 'Molto bene. Ripassa solo quelle qui sotto.' :
    p >= .6 ? 'Ci sei quasi. Guarda quelle qui sotto e riprova.' :
    'Guarda con calma quelle qui sotto, poi riprova.';
  const sbagli = esiti.filter(e => !e.ok);
  $('errori').innerHTML = sbagli.length
    ? '<div class="etichetta">Da ripassare</div>' + sbagli.map(e => {
        const giusta = e.q.opz.find(o => o.ok).x;
        return '<div class="errore"><div class="d">' + fmt(e.q.d) + '</div>' +
          '<div class="r"><span class="no">✗ Tu: ' + fmt(e.q.opz[e.scelta].x) + '</span><span class="si">✓ Giusta: ' + fmt(giusta) + '</span></div></div>';
      }).join('')
    : '';
  $('ripetiErrori').style.display = sbagli.length ? '' : 'none';
  mostra('fine');
}

/* ---------- formulario ---------- */

const FORMULE = [
  { h: 'Carica elettrica', f: ['e = 1,602 × 10^{-19} C', 'q = n · e', 'n = fr{q¦e}'],
    n: 'Elettroni in più → carica negativa (−).<br>Elettroni persi → carica positiva (+).' },
  { h: 'Legge di Coulomb (nel vuoto)', f: ['F = k_{0} · fr{|Q_{1} · Q_{2}|¦r^{2}}', 'k_{0} = 8,99 × 10^{9} N·m^{2}/C^{2}'],
    n: 'F in newton, Q in coulomb, r in metri.<br>Segni uguali → si respingono.<br>Segni opposti → si attraggono.' },
  { h: 'In un materiale isolante', f: ['F_{mezzo} = fr{F_{vuoto}¦ε_{r}} = k_{0} · fr{|Q_{1} · Q_{2}|¦ε_{r} · r^{2}}'],
    n: 'Nel materiale la forza è sempre più piccola.' },
  { h: 'Tre o più cariche', f: ['vec{F}_{tot} = vec{F}_{1} + vec{F}_{2} + vec{F}_{3} + …'],
    n: 'Principio di sovrapposizione: calcolo una coppia alla volta, poi sommo le forze come frecce.' },
  { h: 'Conversioni', f: ['1 μC = 10^{-6} C', '1 cm = 10^{-2} m'],
    n: 'Distanza doppia → forza : 4.<br>Distanza tripla → forza : 9.<br>Distanza metà → forza × 4.' }
];

function disegnaFormule() {
  $('formuleCorpo').innerHTML = FORMULE.map(s =>
    '<div class="scheda"><h3>' + s.h + '</h3>' +
    s.f.map(f => '<div class="f">' + fmt(f) + '</div>').join('') +
    '<div class="n">' + fmt(s.n) + '</div></div>').join('');
}

/* ---------- eventi ---------- */

$('argomenti').addEventListener('click', ev => {
  const b = ev.target.closest('.chip');
  if (!b) return;
  const id = b.dataset.id;
  if (scelti.has(id)) scelti.delete(id); else scelti.add(id);
  salva();
  disegnaHome();
});

$('quante').addEventListener('click', ev => {
  const b = ev.target.closest('button');
  if (!b) return;
  quante = +b.dataset.n;
  salva();
  disegnaHome();
});

$('inizia').addEventListener('click', () => { if (scelti.size) parti(nuovoGiro(quante)); });
$('opzioni').addEventListener('click', ev => {
  const b = ev.target.closest('.opz');
  if (b) rispondi(+b.dataset.k);
});
$('avanti').addEventListener('click', avanti);
$('esci').addEventListener('click', () => { zitto(); disegnaHome(); mostra('home'); });
$('ascolta').addEventListener('click', () => {
  if (voce && voce.speaking) zitto(); else leggiForte(testoDaLeggere());
});
if (!voce) $('ascolta').style.display = 'none';
$('nuovoGiro').addEventListener('click', () => { disegnaHome(); mostra('home'); });
$('ripetiErrori').addEventListener('click', () => parti(rimescola(esiti.filter(e => !e.ok).map(e => e.voce))));
$('apriFormule').addEventListener('click', () => mostra('formule'));
$('chiudiFormule').addEventListener('click', () => mostra('home'));

document.addEventListener('keydown', ev => {
  if (!$('quiz').classList.contains('attivo')) return;
  const k = '1234'.indexOf(ev.key) >= 0 ? '1234'.indexOf(ev.key) : 'abcd'.indexOf(ev.key.toLowerCase());
  if (k >= 0 && k < attuale.opz.length) rispondi(k);
  else if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); avanti(); }
});

leggi();
disegnaHome();
disegnaFormule();
