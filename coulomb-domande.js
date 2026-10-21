/******************************************************************
 * Coulomb — le domande
 *
 * Scritte per chi ha DSA: frasi corte, una idea per frase,
 * niente domande "a trabocchetto" con la negazione,
 * dati uno per riga, spiegazioni a passi.
 *
 * Due tipi:
 *   - fisse: { t: argomento, d: domanda, ok: risposta giusta,
 *              no: [tre sbagliate], s: spiegazione }
 *   - generate: { t, gen: funzione } che a ogni chiamata
 *              restituisce { d, opz: [{ x, ok }], s } con numeri nuovi
 *
 * Mini-notazione dentro i testi (la converte fmt()):
 *   ^{-19}  esponente      _{0}  pedice      vec{F}  vettore
 *   fr{su¦giu}  frazione
 ******************************************************************/

const ARGOMENTI = [
  { id: 'carica',      nome: 'Carica elettrica' },
  { id: 'conduttori',  nome: 'Conduttori e isolanti' },
  { id: 'elettr',      nome: 'Elettrizzazione' },
  { id: 'coulomb',     nome: 'Legge di Coulomb' },
  { id: 'dielettrico', nome: 'Costante dielettrica' },
  { id: 'sovrapp',     nome: 'Tre cariche' },
  { id: 'esercizi',    nome: 'Esercizi con i numeri' }
];

/* ---------- numeri all'italiana ---------- */

const MENO = '−';

function virgola(s) { return String(s).replace('.', ','); }

// notazione scientifica con s cifre significative: "8,01 × 10^{-7}"
function sci(x, s) {
  if (x === 0) return '0';
  const segno = x < 0 ? MENO : '';
  x = Math.abs(x);
  let e = Math.floor(Math.log10(x));
  let m = +(x / Math.pow(10, e)).toFixed(s - 1);
  if (m >= 10) { m /= 10; e += 1; }
  const ms = virgola(m.toFixed(s - 1));
  return e === 0 ? segno + ms : segno + ms + ' × 10^{' + e + '}';
}

// una forza: decimale se "comoda", altrimenti notazione scientifica (2 cifre)
function forza(x) {
  if (x >= 0.1 && x < 1000) {
    const d = Math.max(0, 1 - Math.floor(Math.log10(x)));
    return virgola(Number(x.toPrecision(2)).toFixed(d));
  }
  return sci(x, 2);
}

// un numero semplice senza zeri inutili (3,6 → "3,6"; 0,04 → "0,04")
function semplice(x) { return virgola(String(Number(x.toPrecision(3)))); }

function caso(a) { return a[Math.floor(Math.random() * a.length)]; }
function intero(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function rimescola(a) {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function segnato(v, u) { return (v < 0 ? MENO : '+') + Math.abs(v) + ' ' + u; }
function passi(a) { return a.map((p, k) => '<span class="passo"><b>' + (k + 1) + '.</b> ' + p + '</span>').join(''); }

const E = 1.602e-19;
const K0 = 8.99e9;

/* ---------- domande fisse ---------- */

const FISSE = [
  // carica
  { t: 'carica', d: 'Quale particella ha carica <b>positiva</b>?',
    ok: 'Il protone', no: ['L’elettrone', 'Il neutrone', 'Nessuna'],
    s: 'Il protone è positivo (+).<br>L’elettrone è negativo (−).' },
  { t: 'carica', d: 'L’<b>elettrone</b> che carica ha?',
    ok: 'Negativa (−)', no: ['Positiva (+)', 'Nessuna carica', 'Dipende dall’atomo'],
    s: 'L’elettrone è sempre negativo (−).' },
  { t: 'carica', d: 'Quando un atomo è <b>neutro</b>?',
    ok: 'Quando ha tante cariche + quante cariche −',
    no: ['Quando non ha elettroni', 'Quando ha più protoni', 'Quando ha più elettroni'],
    s: 'Cariche + e cariche − sono in numero uguale.<br>Si bilanciano: l’atomo è neutro.' },
  { t: 'carica', d: 'Quanto vale la <b>carica fondamentale</b> e?',
    ok: '1,602 × 10^{-19} C', no: ['1,602 × 10^{19} C', '8,99 × 10^{9} C', '6,24 × 10^{18} C'],
    s: 'e = 1,602 × 10^{-19} C.<br>È la carica di un solo elettrone (senza il segno).<br>L’esponente è <b>negativo</b>: è un numero piccolissimo.' },
  { t: 'carica', d: 'Con quale unità si misura la <b>carica</b>?',
    ok: 'Coulomb (C)', no: ['Newton (N)', 'Volt (V)', 'Metro (m)'],
    s: 'La carica si misura in coulomb (C).<br>Il newton (N) serve per la forza.' },
  { t: 'carica', d: 'Quanto vale la carica di <b>un elettrone</b>?',
    ok: MENO + '1,602 × 10^{-19} C', no: ['+1,602 × 10^{-19} C', MENO + '1 C', MENO + '8,99 × 10^{9} C'],
    s: 'Elettrone = −e = −1,602 × 10^{-19} C.<br>Il segno è − perché l’elettrone è negativo.' },
  { t: 'carica', d: 'Quanto vale la carica di <b>un protone</b>?',
    ok: '+1,602 × 10^{-19} C', no: [MENO + '1,602 × 10^{-19} C', '+1 C', '0 C'],
    s: 'Protone = +e = +1,602 × 10^{-19} C.<br>Stesso numero dell’elettrone, ma positivo.' },
  { t: 'carica', d: 'La formula <b>q = n · e</b> che cosa dice?',
    ok: 'La carica è n volte la carica fondamentale',
    no: ['La carica è n più e', 'La carica non dipende dagli elettroni', 'Ogni corpo ha carica e'],
    s: 'n = numero di elettroni.<br>e = carica di un elettrone.<br>q = n · e: si moltiplica.' },
  { t: 'carica', d: 'Voglio trovare il <b>numero di elettroni</b> n.<br>Quale formula uso?',
    ok: 'n = q / e', no: ['n = q · e', 'n = e / q', 'n = q − e'],
    s: 'Parto da q = n · e.<br>Divido per e: n = fr{q¦e}.' },
  { t: 'carica', d: 'Quanto fa fr{1¦10^{-19}}?',
    ok: '10^{19}', no: ['10^{-19}', MENO + '10^{19}', '1'],
    s: 'Sposto la potenza da sotto a sopra.<br>L’esponente cambia segno: −19 diventa +19.' },
  { t: 'carica', d: 'Scrivi bene in notazione scientifica:<br>0,62422 × 10^{19}',
    ok: '6,2422 × 10^{18}', no: ['6,2422 × 10^{20}', '62,422 × 10^{18}', '0,62422 × 10^{18}'],
    s: 'Il primo numero deve stare fra 1 e 10.<br>0,62422 → 6,2422: è diventato 10 volte più grande.<br>Allora l’esponente scende di 1: 19 → 18.' },
  { t: 'carica', d: 'Quanto fa 10^{12} × 10^{-19}?',
    ok: '10^{-7}', no: ['10^{-31}', '10^{7}', '10^{31}'],
    s: 'Nella moltiplicazione gli esponenti si sommano.<br>12 + (−19) = −7.' },
  { t: 'carica', d: 'Un corpo ha <b>più elettroni</b> che protoni.<br>Com’è carico?',
    ok: 'Negativo (−)', no: ['Positivo (+)', 'Neutro', 'Dipende dal materiale'],
    s: 'Gli elettroni in più sono negativi.<br>Quindi il corpo è negativo.' },

  // conduttori e isolanti
  { t: 'conduttori', d: 'Che cos’è un <b>conduttore</b>?',
    ok: 'Un materiale dove l’elettricità passa facilmente',
    no: ['Un materiale che blocca l’elettricità', 'Un materiale senza elettroni', 'Un materiale sempre positivo'],
    s: 'Conduttore = l’elettricità passa facilmente.<br>Esempio: il rame.' },
  { t: 'conduttori', d: 'Nei conduttori l’elettricità passa facilmente.<br><b>Perché?</b>',
    ok: 'Gli elettroni sono più liberi di muoversi',
    no: ['I protoni cambiano atomo', 'Non contengono atomi', 'Sono sempre carichi'],
    s: 'Gli elettroni portano l’elettricità.<br>Nei conduttori si muovono più liberi.' },
  { t: 'conduttori', d: 'Quale materiale è un <b>conduttore</b>?',
    ok: 'Rame', no: ['Plastica', 'Gomma', 'Vetro'],
    s: 'Il rame è un conduttore.<br>Plastica, gomma e vetro sono isolanti.' },
  { t: 'conduttori', d: 'Quale materiale è un <b>isolante</b>?',
    ok: 'Gomma', no: ['Rame', 'Ferro', 'Argento'],
    s: 'Gomma e plastica sono isolanti.<br>I metalli sono conduttori.' },
  { t: 'conduttori', d: 'Che cosa fa un <b>isolante</b>?',
    ok: 'Blocca l’elettricità',
    no: ['Fa correre l’elettricità più veloce', 'Crea nuove cariche', 'Cambia il segno delle cariche'],
    s: 'Isolante = blocca l’elettricità.<br>Esempi: plastica, gomma.' },
  { t: 'conduttori', d: 'In un conduttore l’elettricità da dove a dove va?',
    ok: 'Dal polo negativo al polo positivo',
    no: ['Dal polo positivo al polo negativo', 'Sempre verso terra', 'Non si muove'],
    s: 'La portano gli elettroni, che sono negativi.<br>Partono dal polo − e vanno verso il polo +.' },

  // elettrizzazione
  { t: 'elettr', d: 'In quali <b>tre modi</b> si carica un corpo?',
    ok: 'Strofinio, contatto, induzione',
    no: ['Strofinio, calore, pressione', 'Solo per contatto', 'Contatto, magnete, luce'],
    s: 'I tre modi sono:<br>1. strofinio<br>2. contatto<br>3. induzione.' },
  { t: 'elettr', d: 'Strofino due oggetti.<br>Che cosa passa da uno all’altro?',
    ok: 'Gli elettroni', no: ['I protoni', 'Gli atomi interi', 'Niente'],
    s: 'Si spostano gli elettroni.<br>Un oggetto li perde, l’altro li prende.' },
  { t: 'elettr', d: 'Strofino due oggetti.<br>Quello che <b>prende</b> elettroni come diventa?',
    ok: 'Negativo (−)', no: ['Positivo (+)', 'Neutro', 'Isolante'],
    s: 'Prende elettroni → diventa negativo.<br>Perde elettroni → diventa positivo.' },
  { t: 'elettr', d: 'Strofino due oggetti.<br>Quello che <b>perde</b> elettroni come diventa?',
    ok: 'Positivo (+)', no: ['Negativo (−)', 'Neutro', 'Conduttore'],
    s: 'Perde elettroni (−).<br>Restano di più le cariche +.<br>Quindi diventa positivo.' },
  { t: 'elettr', d: 'Una bacchetta <b>negativa</b> tocca una sfera neutra.<br>Che cosa succede?',
    ok: 'Passano elettroni alla sfera: la sfera diventa negativa',
    no: ['La sfera perde elettroni: diventa positiva', 'Passano protoni: la sfera diventa positiva', 'Niente: la sfera resta neutra'],
    s: 'È l’elettrizzazione per <b>contatto</b>.<br>Gli elettroni passano dalla bacchetta alla sfera.' },
  { t: 'elettr', d: 'Che cos’è l’elettrizzazione per <b>induzione</b>?',
    ok: 'Caricare un oggetto senza toccarlo',
    no: ['Caricare un oggetto toccandolo', 'Caricare un oggetto strofinandolo', 'Scaricare un oggetto a terra'],
    s: 'Induzione = l’oggetto si carica senza contatto.<br>Basta avvicinare un corpo carico.' },
  { t: 'elettr', d: 'Avvicino una bacchetta <b>negativa</b> a una sfera neutra.<br>Non la tocco.<br>Dove vanno le cariche <b>positive</b> della sfera?',
    ok: 'Verso la bacchetta',
    no: ['Lontano dalla bacchetta', 'Restano ferme', 'Sulla bacchetta'],
    s: 'La bacchetta è negativa.<br>Le cariche + sono attratte: vanno verso la bacchetta.<br>Le cariche − vanno dalla parte opposta.' },
  { t: 'elettr', d: 'Induzione con bacchetta <b>negativa</b>.<br>Collego la sfera a terra con un filo.<br>Che cosa va a terra?',
    ok: 'Alcune cariche negative', no: ['Alcune cariche positive', 'Tutta la carica', 'Niente'],
    s: 'Le cariche − sono respinte dalla bacchetta.<br>Scappano a terra lungo il filo.' },
  { t: 'elettr', d: 'Induzione con bacchetta <b>negativa</b>.<br>Alla fine tolgo il filo.<br>Come resta la sfera?',
    ok: 'Positiva (+)', no: ['Negativa (−)', 'Neutra', 'Metà + e metà −'],
    s: 'Alcune cariche − sono andate a terra.<br>Restano di più le cariche +.<br>La sfera è positiva.' },
  { t: 'elettr', d: 'Che cos’è la <b>polarizzazione</b>?',
    ok: 'Le cariche delle molecole si spostano per poco tempo',
    no: ['Gli elettroni passano per sempre da un corpo all’altro', 'È lo strofinio', 'Il corpo perde tutti i protoni'],
    s: 'Polarizzazione = modifica <b>temporanea</b> delle cariche nelle molecole.<br>Dura finché il corpo carico è vicino.' },
  { t: 'elettr', d: 'Avvicino una bacchetta <b>negativa</b> alla plastica.<br>Che cosa compare sulla superficie della plastica?',
    ok: 'Una piccola carica positiva', no: ['Una piccola carica negativa', 'Nessuna carica', 'Una corrente'],
    s: 'Le molecole girano la parte + verso la bacchetta.<br>È la polarizzazione.' },

  // Coulomb
  { t: 'coulomb', d: 'Due sfere hanno cariche di <b>segno opposto</b> (+ e −).<br>Che cosa fanno?',
    ok: 'Si attraggono', no: ['Si respingono', 'Restano ferme', 'Si scambiano i protoni'],
    s: 'Segni opposti → si attraggono.<br>Segni uguali → si respingono.' },
  { t: 'coulomb', d: 'Due sfere sono <b>tutte e due negative</b>.<br>Che cosa fanno?',
    ok: 'Si respingono', no: ['Si attraggono', 'Restano ferme', 'Diventano neutre'],
    s: 'Segni uguali → si respingono.' },
  { t: 'coulomb', d: 'Q_{1} = +3 μC<br>Q_{2} = +5 μC<br>La forza è attrattiva o repulsiva?',
    ok: 'Repulsiva', no: ['Attrattiva', 'Non c’è forza', 'Attrattiva solo da vicino'],
    s: 'Tutte e due positive: segni uguali.<br>Segni uguali → repulsiva.' },
  { t: 'coulomb', d: 'Legge di Coulomb.<br>Che cosa c’è <b>sopra</b> la linea di frazione?',
    ok: 'Il prodotto delle cariche', no: ['La somma delle cariche', 'La distanza', 'La distanza al quadrato'],
    s: 'F = k_{0} · fr{|Q_{1} · Q_{2}|¦r^{2}}<br>Sopra: Q_{1} per Q_{2}.<br>Sotto: la distanza al quadrato.' },
  { t: 'coulomb', d: 'Legge di Coulomb.<br>Che cosa c’è <b>sotto</b> la linea di frazione?',
    ok: 'La distanza al quadrato (r^{2})', no: ['La distanza (r)', 'Il prodotto delle cariche', 'La carica fondamentale'],
    s: 'F = k_{0} · fr{|Q_{1} · Q_{2}|¦r^{2}}<br>Sotto c’è r^{2}.<br>Più le cariche sono lontane, più la forza è piccola.' },
  { t: 'coulomb', d: 'Su quale linea agisce la forza fra due cariche?',
    ok: 'Sulla retta che unisce le due cariche',
    no: ['Sempre in verticale', 'Di traverso alla retta che le unisce', 'Dipende dal materiale'],
    s: 'La forza va lungo la retta che unisce le due cariche.' },
  { t: 'coulomb', d: 'Quanto vale k_{0} nel vuoto?',
    ok: '8,99 × 10^{9} N·m^{2}/C^{2}',
    no: ['1,602 × 10^{-19} N·m^{2}/C^{2}', '8,99 × 10^{-9} N·m^{2}/C^{2}', '9,81 N·m^{2}/C^{2}'],
    s: 'k_{0} = 8,99 × 10^{9} N·m^{2}/C^{2}.<br>L’esponente è <b>positivo</b>: è un numero grandissimo.' },
  { t: 'coulomb', d: 'Con quale unità si misura la <b>forza</b> F?',
    ok: 'Newton (N)', no: ['Coulomb (C)', 'Metro (m)', 'N·m^{2}/C^{2}'],
    s: 'Forza → newton (N).<br>Carica → coulomb (C).<br>Distanza → metri (m).' },
  { t: 'coulomb', d: 'Nella formula, la distanza r in che unità va scritta?',
    ok: 'In metri (m)', no: ['In centimetri (cm)', 'In millimetri (mm)', 'In coulomb (C)'],
    s: 'Sempre in metri.<br>Se è in cm, prima la converto: 30 cm = 0,30 m.' },
  { t: 'coulomb', d: '2 μC quanti coulomb sono?',
    ok: '2 × 10^{-6} C', no: ['2 × 10^{6} C', '2 × 10^{-3} C', '2 × 10^{-9} C'],
    s: 'μ si legge «micro» e vuol dire 10^{-6}.<br>2 μC = 2 × 10^{-6} C.' },
  { t: 'coulomb', d: '30 cm quanti metri sono?',
    ok: '0,30 m', no: ['3,0 m', '0,030 m', '300 m'],
    s: 'Da cm a m divido per 100.<br>30 : 100 = 0,30 m.' },
  { t: 'coulomb', d: 'Nella formula c’è |Q_{1} · Q_{2}|.<br>A che cosa servono le <b>due stanghette</b> | |?',
    ok: 'Tolgono il segno: la forza viene sempre positiva',
    no: ['Rendono le cariche negative', 'Rendono la forza sempre attrattiva', 'Raddoppiano le cariche'],
    s: 'Le stanghette tolgono il segno (valore assoluto).<br>Il tipo di forza lo capisco prima, guardando i segni.' },
  { t: 'coulomb', d: 'Allontano due cariche.<br>Che cosa fa la forza?',
    ok: 'Diventa più debole, e molto in fretta', no: ['Diventa più forte', 'Resta uguale', 'Cambia segno'],
    s: 'La distanza è sotto, ed è al quadrato.<br>Per questo la forza cala in fretta.' },
  { t: 'coulomb', d: 'Le cariche diventano <b>più grandi</b>.<br>Che cosa fa la forza?',
    ok: 'Diventa più forte', no: ['Diventa più debole', 'Resta uguale', 'Diventa attrattiva'],
    s: 'Le cariche sono sopra la linea di frazione.<br>Più sono grandi, più la forza è forte.' },

  // costante dielettrica
  { t: 'dielettrico', d: 'Che cosa ci dice la costante dielettrica ε_{r}?',
    ok: 'Quanto un isolante indebolisce la forza fra le cariche',
    no: ['Quanti elettroni ha un materiale', 'Quanto corrono gli elettroni nei metalli', 'Quanto vale la carica e'],
    s: 'ε_{r} si legge «epsilon erre».<br>Dice quanto un isolante indebolisce la forza.' },
  { t: 'dielettrico', d: 'Due cariche passano dal vuoto <b>dentro un isolante</b>.<br>Che cosa fa la forza?',
    ok: 'Diminuisce', no: ['Aumenta', 'Resta uguale', 'Cambia verso'],
    s: 'Dentro un materiale la forza <b>diminuisce sempre</b>.' },
  { t: 'dielettrico', d: 'Dentro un isolante la forza diminuisce.<br><b>Perché?</b>',
    ok: 'Le molecole si girano e fanno da «scudo»',
    no: ['Il materiale mangia la carica', 'Le cariche si allontanano da sole', 'Il materiale fa crescere k_{0}'],
    s: 'Le molecole si orientano attorno alle cariche.<br>Fanno da scudo e la forza si indebolisce.' },
  { t: 'dielettrico', d: 'Quale formula vale <b>dentro un materiale</b>?',
    ok: 'F_{mezzo} = fr{F_{vuoto}¦ε_{r}}',
    no: ['F_{mezzo} = F_{vuoto} · ε_{r}', 'F_{mezzo} = F_{vuoto} − ε_{r}', 'F_{mezzo} = fr{ε_{r}¦F_{vuoto}}'],
    s: 'Si <b>divide</b> per ε_{r}.<br>Così la forza viene più piccola.' },
  { t: 'dielettrico', d: 'Quale di questi è un <b>dielettrico</b> (isolante)?',
    ok: 'Il vetro', no: ['Il rame', 'Il ferro', 'L’alluminio'],
    s: 'Dielettrici: acqua, vetro, legno.<br>I metalli sono conduttori.' },
  { t: 'dielettrico', d: 'C’è una carica <b>positiva</b> dentro un isolante.<br>Le molecole intorno quale parte le girano contro?',
    ok: 'La parte negativa', no: ['La parte positiva', 'Nessuna: stanno ferme', 'Un protone'],
    s: 'La carica + attira la parte − delle molecole.<br>Questo strato − la scherma un po’.' },
  { t: 'dielettrico', d: 'Un altro nome per «isolante»?',
    ok: 'Dielettrico', no: ['Conduttore', 'Polo', 'Coulomb'],
    s: 'Isolante e dielettrico vogliono dire la stessa cosa.' },

  // tre cariche
  { t: 'sovrapp', d: 'Su una carica agiscono <b>altre due</b> cariche.<br>Come trovo la forza totale?',
    ok: 'Sommo le forze delle due cariche, una coppia alla volta',
    no: ['Prendo solo la forza più grande', 'Sommo le cariche e uso Coulomb una volta', 'Moltiplico le due forze'],
    s: 'vec{F}_{tot} = vec{F}_{1} + vec{F}_{2} + …<br>Ogni coppia dà una forza. Poi le sommo, come frecce.' },
  { t: 'sovrapp', d: 'La forza totale è la somma delle singole forze.<br>Come si chiama questa regola?',
    ok: 'Principio di sovrapposizione', no: ['Principio di simmetria', 'Principio di induzione', 'Principio di polarizzazione'],
    s: 'Si chiama principio di sovrapposizione.<br>Si usa con tre o più cariche.' },
  { t: 'sovrapp', d: 'Fra due cariche c’è una forza.<br>Arriva una terza carica.<br>La forza fra le prime due cambia?',
    ok: 'No, resta uguale', no: ['Sì, si dimezza', 'Sì, sparisce', 'Sì, raddoppia'],
    s: 'Ogni carica agisce come se le altre non ci fossero.<br>Poi le forze si sommano.' },
  { t: 'sovrapp', d: 'Righello di 15 cm.<br>Ai due estremi: due cariche <b>positive uguali</b>.<br>Al centro: una carica <b>negativa</b>.<br>Quanto vale la forza totale sulla negativa?',
    ok: 'Zero', no: ['Il doppio di una forza', 'Spinge a destra', 'Spinge a sinistra'],
    s: 'La carica a sinistra la tira a sinistra.<br>La carica a destra la tira a destra.<br>Le due forze sono uguali: si annullano. Totale = 0.' },
  { t: 'sovrapp', d: 'Righello con la negativa al centro.<br>Perché le due forze si annullano?',
    ok: 'Sono uguali e vanno in versi opposti',
    no: ['La carica negativa è piccola', 'Le due positive si respingono', 'Il righello è isolante'],
    s: 'Cariche uguali e distanze uguali → forze uguali.<br>Una tira a sinistra, una a destra → si annullano.' },
  { t: 'sovrapp', d: 'Righello: q_{1} è positiva, a sinistra.<br>q_{3} è negativa, al centro.<br>Da che parte q_{1} tira q_{3}?',
    ok: 'A sinistra, verso q_{1}', no: ['A destra', 'In alto', 'Da nessuna parte'],
    s: 'Segni opposti → si attraggono.<br>q_{1} tira q_{3} verso di sé, cioè a sinistra.' },
  { t: 'sovrapp', d: 'Righello: al centro metto una carica <b>positiva</b>.<br>Quanto vale la forza totale su di lei?',
    ok: 'Zero', no: ['Spinge a sinistra', 'Spinge a destra', 'Il doppio di una forza'],
    s: 'Ora le due forze sono repulsive.<br>Ma sono ancora uguali e opposte → totale = 0.' },
  { t: 'sovrapp', d: 'Righello: la carica negativa è fra le due positive uguali.<br>Ma è <b>più vicina a q_{1}</b>.<br>Dove va la forza totale?',
    ok: 'Verso q_{1}', no: ['È zero', 'Verso q_{2}', 'In alto'],
    s: 'Più vicino = forza più forte.<br>Vince la forza di q_{1}.' }
];

/* ---------- domande generate ---------- */

// quattro opzioni tutte diverse, altrimenti si rigenera
function opzioniDiverse(opz) {
  return new Set(opz.map(o => o.x)).size === opz.length;
}

function genCaricaDaElettroni() {
  const a = intero(10, 99) / 10, b = intero(10, 15);
  const eccesso = Math.random() < 0.5;
  const n = a * Math.pow(10, b);
  const q = n * E * (eccesso ? -1 : 1);
  const s = v => sci(v, 3) + ' C';
  const sbagli = rimescola([
    s(-q),                                               // segno sbagliato
    s(Math.sign(q) * a * 1.602 * Math.pow(10, b + 19)),  // esponente di e col segno sbagliato
    s(Math.sign(q) * n / E),                             // diviso invece che moltiplicato
    s(q * 10)
  ]).slice(0, 3);
  return {
    d: 'Un corpo ' + (eccesso ? 'ha <b>in più</b>' : 'ha <b>perso</b>') + ' ' + sci(n, 2) + ' elettroni.<br>' +
       'Quanto vale la sua <b>carica</b>?',
    opz: [{ x: s(q), ok: true }].concat(sbagli.map(x => ({ x, ok: false }))),
    s: passi([
      'Formula: q = n · e',
      'q = ' + sci(n, 2) + ' × 1,602 × 10^{-19}',
      'Numeri: ' + virgola(a) + ' × 1,602. Esponenti: ' + b + ' + (−19) = ' + virgola(b - 19).replace('-', MENO),
      'Risultato: ' + s(Math.abs(q)),
      eccesso ? 'Elettroni <b>in più</b> → la carica è <b>negativa</b> (−).'
              : 'Elettroni <b>persi</b> → la carica è <b>positiva</b> (+).'
    ])
  };
}

function genElettroniDaCarica() {
  const a = intero(10, 99) / 10, b = caso([0, 3, 6, 6, 9]);
  const q = a * Math.pow(10, -b);
  const n = q / E;
  const qs = (b === 0 ? virgola(a.toFixed(1)) : sci(q, 2)) + ' C';
  const s = v => sci(v, 3);
  const sbagli = rimescola([
    s(q * E),                                    // moltiplicato invece che diviso
    s(a / 1.602 * Math.pow(10, -b - 19)),         // segno dell'esponente non cambiato
    s(n * 10),
    s(n / 10)
  ]).slice(0, 3);
  return {
    d: 'Voglio una carica di ' + MENO + qs + '.<br>Quanti <b>elettroni</b> servono?',
    opz: [{ x: s(n), ok: true }].concat(sbagli.map(x => ({ x, ok: false }))),
    s: passi([
      'Formula: n = fr{q¦e}. Il segno − lo lascio stare.',
      'n = fr{' + qs + '¦1,602 × 10^{-19} C}',
      '10^{-19} passa sopra e cambia segno: diventa 10^{19}',
      'Risultato: n = ' + s(n) + ' elettroni'
    ])
  };
}

function genCoulombVuoto() {
  const a = intero(1, 9), b = intero(1, 9);
  const q1 = a * caso([1, -1]), q2 = b * caso([1, -1]);
  const inCm = Math.random() < 0.4;
  const rcm = caso([10, 20, 25, 30, 40, 50, 60, 80]);
  const r = inCm ? rcm / 100 : caso([0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1.5, 2.0, 2.5, 3.0]);
  const F = K0 * a * b * 1e-12 / (r * r);
  const att = q1 * q2 < 0;
  const Fsb = inCm ? F / 1e4 : K0 * a * b * 1e-12 / r;  // cm non convertiti / r senza quadrato
  const tipo = v => v ? 'attrattiva' : 'repulsiva';
  const rs = inCm ? rcm + ' cm' : virgola(r) + ' m';
  const p = [att ? 'Segni opposti → <b>attrattiva</b>' : 'Segni uguali → <b>repulsiva</b>'];
  if (inCm) p.push('Converto: ' + rcm + ' cm = ' + virgola(r) + ' m');
  p.push('F = k_{0} · fr{|Q_{1} · Q_{2}|¦r^{2}}');
  p.push('F = 8,99 × 10^{9} · fr{' + (a * b) + ' × 10^{-12}¦' + virgola(Number((r * r).toPrecision(4))) + '}');
  p.push('Risultato: <b>' + forza(F) + ' N</b>');
  return {
    d: 'Due cariche nel vuoto:<br>Q_{1} = ' + segnato(q1, 'μC') + '<br>Q_{2} = ' + segnato(q2, 'μC') +
       '<br>distanza r = ' + rs + '<br>Quanto vale la <b>forza</b>? È attrattiva o repulsiva?',
    opz: [
      { x: forza(F) + ' N, ' + tipo(att), ok: true },
      { x: forza(F) + ' N, ' + tipo(!att), ok: false },
      { x: forza(Fsb) + ' N, ' + tipo(att), ok: false },
      { x: forza(Fsb) + ' N, ' + tipo(!att), ok: false }
    ],
    s: passi(p) + (inCm ? '' : '<span class="nota">Attenzione: r va al quadrato.</span>')
  };
}

function genCoulombMezzo() {
  const a = intero(1, 9), b = intero(1, 9);
  const q1 = a * caso([1, -1]), q2 = b * caso([1, -1]);
  const r = caso([0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1.5]);
  const m = caso([{ er: 2.0, n: '' }, { er: 4.0, n: '' }, { er: 5.0, n: '' }, { er: 6.0, n: ' (vetro)' }, { er: 80, n: ' (acqua)' }]);
  const Fv = K0 * a * b * 1e-12 / (r * r);
  const F = Fv / m.er;
  const f = v => forza(v) + ' N';
  const ers = m.er >= 10 ? String(m.er) : virgola(m.er.toFixed(1));
  return {
    d: 'Due cariche dentro un materiale' + m.n + ':<br>Q_{1} = ' + segnato(q1, 'μC') + '<br>Q_{2} = ' + segnato(q2, 'μC') +
       '<br>distanza r = ' + virgola(r.toFixed(1)) + ' m<br>ε_{r} = ' + ers + '<br>Quanto vale la <b>forza</b>?',
    opz: [
      { x: f(F), ok: true },
      { x: f(Fv), ok: false },                           // dimenticato ε_r
      { x: f(Fv * m.er), ok: false },                    // moltiplicato per ε_r
      { x: f(K0 * a * b * 1e-12 / r / m.er), ok: false } // dimenticato il quadrato
    ],
    s: passi([
      'F = fr{k_{0}¦ε_{r}} · fr{|Q_{1} · Q_{2}|¦r^{2}}',
      'F = fr{8,99 × 10^{9}¦' + ers + '} · fr{' + (a * b) + ' × 10^{-12}¦' + virgola(Number((r * r).toPrecision(4))) + '}',
      'Risultato: <b>' + f(F) + '</b>'
    ]) + '<span class="nota">Nel vuoto sarebbe ' + f(Fv) + '. Nel materiale è più piccola.</span>'
  };
}

const PROPORZIONI = [
  { d: 'la distanza <b>raddoppia</b>', k: 1 / 4, no: [1 / 2, 2, 4], s: 'La distanza è al quadrato: 2 × 2 = 4.<br>Sta sotto, quindi divido per 4.' },
  { d: 'la distanza <b>triplica</b>', k: 1 / 9, no: [1 / 3, 3, 9], s: 'La distanza è al quadrato: 3 × 3 = 9.<br>Sta sotto, quindi divido per 9.' },
  { d: 'la distanza diventa <b>metà</b>', k: 4, no: [2, 1 / 2, 1 / 4], s: 'Distanza più piccola → forza più forte.<br>Metà al quadrato fa un quarto: la forza × 4.' },
  { d: 'una carica <b>raddoppia</b>', k: 2, no: [4, 1 / 2, 1], s: 'Le cariche stanno sopra.<br>Una raddoppia → la forza raddoppia.' },
  { d: '<b>tutte e due</b> le cariche raddoppiano', k: 4, no: [2, 8, 1], s: '2 × 2 = 4.<br>La forza diventa 4 volte più grande.' },
  { d: 'una carica <b>triplica</b>', k: 3, no: [9, 1 / 3, 6], s: 'Le cariche stanno sopra.<br>Una triplica → la forza triplica.' },
  { d: 'una carica raddoppia <b>e</b> la distanza raddoppia', k: 1 / 2, no: [1, 2, 1 / 4], s: 'Carica doppia: × 2.<br>Distanza doppia: : 4.<br>In tutto: la forza diventa metà.' }
];

function genProporzioni() {
  const p = caso(PROPORZIONI);
  const F0 = caso([3.6, 7.2, 1.8, 0.36]);
  const f = v => semplice(v) + ' N';
  return {
    d: 'Fra due cariche c’è una forza di ' + f(F0) + '.<br>Ora ' + p.d + '.<br>Quanto diventa la forza?',
    opz: [{ x: f(F0 * p.k), ok: true }].concat(p.no.map(k => ({ x: f(F0 * k), ok: false }))),
    s: p.s + '<br>' + f(F0) + ' → <b>' + f(F0 * p.k) + '</b>'
  };
}

function genDielettricoSemplice() {
  const Fv = caso([1.2, 2.4, 3.6, 4.8, 0.6]);
  const er = caso([2, 3, 4, 6]);
  const f = v => semplice(v) + ' N';
  return {
    d: 'Nel vuoto la forza è ' + f(Fv) + '.<br>Metto le cariche in un materiale con ε_{r} = ' + er + '.<br>Quanto diventa la forza?',
    opz: [
      { x: f(Fv / er), ok: true },
      { x: f(Fv * er), ok: false },
      { x: f(Fv), ok: false },
      { x: f(Fv / (er * er)), ok: false }
    ],
    s: passi([
      'F_{mezzo} = fr{F_{vuoto}¦ε_{r}}',
      'F_{mezzo} = fr{' + f(Fv) + '¦' + er + '} = <b>' + f(Fv / er) + '</b>'
    ]) + '<span class="nota">Nel materiale la forza è sempre più piccola.</span>'
  };
}

const GENERATE = [
  { t: 'esercizi', nome: 'q = n · e', gen: genCaricaDaElettroni },
  { t: 'esercizi', nome: 'n = q / e', gen: genElettroniDaCarica },
  { t: 'esercizi', nome: 'Coulomb nel vuoto', gen: genCoulombVuoto },
  { t: 'esercizi', nome: 'Coulomb in un materiale', gen: genCoulombMezzo },
  { t: 'coulomb', nome: 'proporzioni', gen: genProporzioni },
  { t: 'dielettrico', nome: 'F / εr', gen: genDielettricoSemplice }
];

// produce una domanda pronta da mostrare: { t, d, opz, s }
function istanzia(voce) {
  if (voce.gen) {
    for (let i = 0; i < 30; i++) {
      const g = voce.gen();
      if (opzioniDiverse(g.opz)) return { t: voce.t, d: g.d, opz: rimescola(g.opz), s: g.s };
    }
  }
  const opz = [{ x: voce.ok, ok: true }].concat(voce.no.map(x => ({ x, ok: false })));
  return { t: voce.t, d: voce.d, opz: rimescola(opz), s: voce.s };
}

/* ---------- mini-notazione → HTML ---------- */

function fmt(s) {
  s = String(s);
  let prima;
  do {
    prima = s;
    s = s.replace(/fr\{((?:[^{}¦]|\{[^{}]*\})*)¦((?:[^{}¦]|\{[^{}]*\})*)\}/g,
      (m, su, giu) => '<span class="fr"><span>' + su + '</span><span>' + giu + '</span></span>');
  } while (s !== prima);
  s = s.replace(/\^\{([^}]*)\}/g, (m, e) => '<sup>' + e.replace(/-/g, MENO) + '</sup>');
  s = s.replace(/_\{([^}]*)\}/g, '<sub>$1</sub>');
  s = s.replace(/vec\{([^}]*)\}/g, '<span class="vet">$1</span>');
  return s;
}

/* ---------- mini-notazione → parlato (per la lettura ad alta voce) ---------- */

function parlato(s) {
  s = String(s);
  s = s.replace(/<br>|<\/span><span class="passo">/g, '. ');
  s = s.replace(/<[^>]+>/g, ' ');
  let prima;
  do {
    prima = s;
    s = s.replace(/fr\{((?:[^{}¦]|\{[^{}]*\})*)¦((?:[^{}¦]|\{[^{}]*\})*)\}/g, ' $1 fratto $2 ');
  } while (s !== prima);
  s = s.replace(/\|([^|]*)\|/g, ' valore assoluto di $1 ');
  s = s.replace(/r\^\{2\}/g, ' erre al quadrato ');
  s = s.replace(/\^\{2\}/g, ' al quadrato ');
  s = s.replace(/\^\{-?([0-9]+)\}/g, (m, e) => ' alla ' + (m.includes('-') ? 'meno ' : '') + e + ' ');
  s = s.replace(/_\{([^}]*)\}/g, ' $1 ');
  s = s.replace(/vec\{([^}]*)\}/g, ' vettore $1 ');
  s = s.replace(/ε/g, ' epsilon ').replace(/k 0|k_0/g, 'k zero');
  s = s.replace(/N·m.*?C\s*al quadrato/g, ' newton per metro quadro su coulomb quadro');
  s = s.replace(/μC/g, ' microcoulomb').replace(/(\d)\s*C\b/g, '$1 coulomb').replace(/(\d)\s*N\b/g, '$1 newton');
  s = s.replace(/(\d)\s*cm\b/g, '$1 centimetri').replace(/(\d)\s*m\b/g, '$1 metri');
  s = s.replace(/ × /g, ' per ').replace(/ · /g, ' per ').replace(/·/g, ' per ');
  s = s.replace(/→/g, ', quindi ').replace(/−/g, ' meno ').replace(/\+(?=\s*\d)/g, ' più ');
  s = s.replace(/\(\+\)/g, '').replace(/\(−\)/g, '').replace(/\( meno \)/g, '');
  s = s.replace(/(\d) : (\d)/g, '$1 diviso $2').replace(/(^|[\s(=])-(\d)/g, '$1 meno $2');
  return s.replace(/\s+/g, ' ').trim();
}
