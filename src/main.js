import { 
  passMatrix, 
  emergencyRescues, 
  tasteInteractions, 
  greekVarieties, 
  quizQuestions, 
  calculatorProfiles 
} from './data.js';

// Application State
let activeFilter = 'all';
let searchQuery = '';
let activeVarietyFilter = 'all';

// DOM Elements
const matrixContainer = document.getElementById('matrix-cards-container');
const emergencyContainer = document.getElementById('emergency-container');
const tastesTableBody = document.getElementById('tastes-table-body');
const searchInput = document.getElementById('search-input');
const filterButtons = document.querySelectorAll('#category-filters .pill');
const navButtons = document.querySelectorAll('.nav-btn');
const tabPanes = document.querySelectorAll('.tab-pane');
const printBtn = document.getElementById('btn-print-sheet');

// ==========================================================================
// 1. NAVIGATION TABS LOGIC
// ==========================================================================
navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetTab = btn.getAttribute('data-tab');
    
    navButtons.forEach(b => b.classList.remove('active'));
    tabPanes.forEach(p => p.classList.remove('active'));
    
    btn.classList.add('active');
    const targetPane = document.getElementById(`tab-${targetTab}`);
    if (targetPane) {
      targetPane.classList.add('active');
    }
  });
});

if (printBtn) {
  printBtn.addEventListener('click', () => {
    window.print();
  });
}

// ==========================================================================
// 2. PASS MATRIX LOGIC
// ==========================================================================
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.getAttribute('data-filter');
    renderMatrixCards();
  });
});

if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderMatrixCards();
  });
}

function renderMatrixCards() {
  if (!matrixContainer) return;
  const filtered = passMatrix.filter(item => {
    const matchesCategory = (activeFilter === 'all') || (item.category === activeFilter);
    const matchesSearch = !searchQuery || 
      item.dish.toLowerCase().includes(searchQuery) ||
      item.challenge.toLowerCase().includes(searchQuery) ||
      item.winningWine.toLowerCase().includes(searchQuery) ||
      item.calibration.toLowerCase().includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    matrixContainer.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #888;">
        <p style="font-size: 1.2rem; font-family: 'Cinzel', serif;">Δεν βρέθηκαν αποτελέσματα</p>
        <p style="font-size: 0.9rem;">Δοκιμάστε διαφορετικό όρο αναζήτησης ή επιλέξτε «Όλα».</p>
      </div>
    `;
    return;
  }

  matrixContainer.innerHTML = filtered.map(item => `
    <article class="matrix-card">
      <div class="card-header">
        <span class="card-tag">${getCategoryName(item.category)}</span>
        <h3 class="card-title">${item.dish}</h3>
      </div>
      <div class="card-body">
        <div class="info-row">
          <span class="info-label label-challenge">⚡ Γευστική Πρόκληση</span>
          <p class="info-content">${item.challenge}</p>
        </div>

        <div class="info-row">
          <span class="info-label label-enemy">⚠️ Οινικός Εχθρός (Αποτυχία)</span>
          <p class="info-content" style="color: #A82020;">${item.enemy}</p>
        </div>

        <div class="calibration-box">
          <strong>👨‍🍳 Chef's Calibration:</strong> ${item.calibration}
        </div>

        ${item.chemistry ? `
        <details class="chemistry-details">
          <summary>🔬 Χημεία Αρμονίας (Sommelier Rationale)</summary>
          <p class="chemistry-content">${item.chemistry}</p>
        </details>
        ` : ''}

        <div class="info-row" style="margin-top: auto; padding-top: 0.5rem;">
          <span class="info-label label-winning">🏆 Winning Pairing</span>
          <div class="wine-badge">
            ${item.winningWine}
          </div>
        </div>
      </div>
    </article>
  `).join('');
}

function getCategoryName(cat) {
  const names = {
    seafood: "🐟 Θαλασσινά & Οστρακοειδή",
    meat: "🥩 Κρεατικά & Κυνήγι",
    vegetables: "🍄 Λαχανικά & Ζυμαρικά",
    cheese: "🧀 Τυριά & Αλλαντικά",
    dessert: "🍫 Ζαχαροπλαστική",
    ethnic: "🥢 Ethnic & Kaiseki"
  };
  return names[cat] || cat;
}

// ==========================================================================
// 3. DYNAMIC PAIRING CALCULATOR LOGIC
// ==========================================================================
function setupCalculator() {
  const proteinSelect = document.getElementById('calc-protein');
  const techSelect = document.getElementById('calc-technique');
  const sauceSelect = document.getElementById('calc-sauce');
  const resultContainer = document.getElementById('calc-result-container');

  if (!proteinSelect || !techSelect || !sauceSelect || !resultContainer) return;

  function updateCalculation() {
    const pKey = proteinSelect.value;
    const tKey = techSelect.value;
    const sKey = sauceSelect.value;

    const p = calculatorProfiles.proteins[pKey] || { tanninMod: 2, acidMod: 3, bodyMod: 3, note: "" };
    const t = calculatorProfiles.techniques[tKey] || { tanninMod: 0, acidMod: 0, bodyMod: 0, tip: "" };
    const s = calculatorProfiles.sauces[sKey] || { tanninMod: 0, acidMod: 0, bodyMod: 0, tip: "" };

    // Calculate Scores (clamp 1 to 5)
    let tannins = Math.max(0, Math.min(5, Math.round((p.tanninMod + t.tanninMod + s.tanninMod) / 2)));
    let acidity = Math.max(1, Math.min(5, Math.round((p.acidMod + t.acidMod + s.acidMod) / 2.5)));
    let body = Math.max(1, Math.min(5, Math.round((p.bodyMod + t.bodyMod + s.bodyMod) / 2.5)));

    if (p.isSweet || sKey === 'sweet_honey') {
      tannins = Math.min(tannins, 2);
    }

    // Determine Wine Category & Varieties
    let wineType = "";
    let varieties = [];
    if (pKey === 'dessert' || sKey === 'sweet_honey') {
      wineType = "Επιδόρπιος / Γλυκύς Οίνος (Vinsanto, Samos Grand Cru, Port)";
      varieties = ["Vinsanto Σαντορίνης", "Μοσχάτο Σάμου", "Tawny Port", "Sauternes"];
    } else if (tannins >= 4) {
      wineType = "Στιβαρός Ερυθρός Οίνος Παλαίωσης με Υψηλές Τανίνες";
      varieties = ["Ξινόμαυρο Νάουσας ΠΟΠ", "Μαυροτράγανο Σαντορίνης", "Cabernet Sauvignon", "Syrah"];
    } else if (tannins === 3) {
      wineType = "Μέτριου Σώματος Βελούδινος Ερυθρός ή Πλούσιος Ερυθρωπός";
      varieties = ["Αγιωργίτικο Νεμέας ΠΟΠ", "Merlot", "Pinot Noir", "Γαστρονομικό Ροζέ Ξινόμαυρου"];
    } else if (acidity >= 4 && body >= 4) {
      wineType = "Πληθωρικός Λευκός Οίνος με Δρύινο Βαρέλι ή Sur Lie";
      varieties = ["Ασύρτικο Βαρελιού", "Chardonnay Βουργουνδίας", "Βιδιανό Κρήτης", "Chenin Blanc"];
    } else if (acidity >= 4) {
      wineType = "Τραγανός, Κοφτερός Λευκός Οίνος Δεξαμενής με Υψηλή Ορυκτότητα";
      varieties = ["Ασύρτικο Σαντορίνης", "Ρομπόλα Κεφαλληνίας", "Chablis Premier Cru", "Sauvignon Blanc"];
    } else {
      wineType = "Αρωματικός, Κομψός Λευκός ή Αφρώδης Οίνος";
      varieties = ["Μοσχοφίλερο Μαντινείας", "Σαββατιανό Παλαιών Κλημάτων", "Champagne Brut", "Riesling Trocken"];
    }

    const bodyLabels = ["Πολύ Ελαφρύ", "Ελαφρύ", "Μέτριο", "Γεμάτο", "Πληθωρικό"];
    const bodyText = bodyLabels[body - 1] || "Μέτριο";

    resultContainer.innerHTML = `
      <div class="meters-grid">
        <div class="meter-item">
          <span class="meter-label">Ανάγκη Τανινών</span>
          <span class="meter-val-badge">${tannins} / 5</span>
          <div class="meter-bar-track">
            <div class="meter-bar-fill fill-tannins" style="width: ${tannins * 20}%;"></div>
          </div>
        </div>

        <div class="meter-item">
          <span class="meter-label">Απαιτούμενη Οξύτητα</span>
          <span class="meter-val-badge">${acidity} / 5</span>
          <div class="meter-bar-track">
            <div class="meter-bar-fill fill-acidity" style="width: ${acidity * 20}%;"></div>
          </div>
        </div>

        <div class="meter-item">
          <span class="meter-label">Σώμα Οίνου</span>
          <span class="meter-val-badge">${bodyText}</span>
          <div class="meter-bar-track">
            <div class="meter-bar-fill fill-body" style="width: ${body * 20}%;"></div>
          </div>
        </div>
      </div>

      <div class="calc-recommendation-box">
        <h4 class="rec-title">🏆 Ιδανικό Στυλ Οίνου:</h4>
        <p><strong>${wineType}</strong></p>
        <div class="rec-wine-pills">
          ${varieties.map(v => `<span class="wine-pill-rec">${v}</span>`).join('')}
        </div>
      </div>

      <div class="calc-chef-tip-box">
        <strong>👨‍🍳 Chef's Pass Seasoning Calibration:</strong>
        <p>${p.note} ${t.tip} ${s.tip}</p>
      </div>
    `;
  }

  proteinSelect.addEventListener('change', updateCalculation);
  techSelect.addEventListener('change', updateCalculation);
  sauceSelect.addEventListener('change', updateCalculation);

  updateCalculation();
}

// ==========================================================================
// 4. DEGUSTATION MENU FLOW VALIDATOR LOGIC
// ==========================================================================
let degustationMenu = [];

function setupMenuValidator() {
  const timelineList = document.getElementById('course-timeline-list');
  const reportBox = document.getElementById('validator-report-box');
  const btnAdd = document.getElementById('btn-add-course');
  const btnClear = document.getElementById('btn-clear-menu');
  const presetClassic = document.getElementById('preset-classic');
  const presetSeafoodGame = document.getElementById('preset-seafood-game');
  const presetFaulty = document.getElementById('preset-faulty');

  if (!timelineList || !reportBox) return;

  function loadPreset(presetType) {
    if (presetType === 'classic') {
      degustationMenu = [
        { dish: "Ωμά Στρείδια Fine de Claire", wine: "Champagne Extra Brut", color: "sparkling", body: "light", sweetness: "dry" },
        { dish: "Ceviche Λαυράκι με Λάιμ & Μάνγκο", wine: "Μοσχοφίλερο Μαντινείας", color: "white", body: "light", sweetness: "dry" },
        { dish: "Σφυρίδα με Beurre Blanc & Σπαράγγια", wine: "Chardonnay Βουργουνδίας", color: "white", body: "full", sweetness: "dry" },
        { dish: "Φιλέτο Μόσχου Black Angus με Jus", wine: "Αγιωργίτικο Νεμέας Παλαιωμένο", color: "red_full", body: "full", sweetness: "dry" },
        { dish: "Τάρτα Πικρής Σοκολάτας Valrhona", wine: "Vinsanto Σαντορίνης 2015", color: "sweet", body: "full", sweetness: "sweet" }
      ];
    } else if (presetType === 'seafood-game') {
      degustationMenu = [
        { dish: "Tiradito Τόνου με Yuzu", wine: "Ασύρτικο Σαντορίνης", color: "white", body: "medium", sweetness: "dry" },
        { dish: "Χτένια Σοτέ σε Beurre Noisette", wine: "Βιδιανό Κρήτης Sur Lie", color: "white", body: "full", sweetness: "dry" },
        { dish: "Σολομός με Glaze Teriyaki", wine: "Pinot Noir Νέου Κόσμου", color: "red_light", body: "medium", sweetness: "dry" },
        { dish: "Στήθος Πάπιας με Σάλτσα Βύσσινο", wine: "Ξινόμαυρο Νάουσας", color: "red_full", body: "medium", sweetness: "dry" },
        { dish: "Αγριογούρουνο Στιφάδο με Τρούφα", wine: "Μαυροτράγανο Σαντορίνης", color: "red_full", body: "full", sweetness: "dry" },
        { dish: "Μιλφέιγ με Καραμελωμένα Μήλα", wine: "Μοσχάτο Σάμου Grand Cru", color: "sweet", body: "medium", sweetness: "sweet" }
      ];
    } else if (presetType === 'faulty') {
      // Inverted flow to test diagnostic warnings
      degustationMenu = [
        { dish: "Φουά Γκρα με Σύκα (Γλυκό Κρασί Πρώτο)", wine: "Sauternes Γλυκό", color: "sweet", body: "full", sweetness: "sweet" },
        { dish: "Στρείδια Belon (Ξηρό Κρασί Μετά από Γλυκό!)", wine: "Chablis Ξηρό", color: "white", body: "light", sweetness: "dry" },
        { dish: "Ribeye Steak (Στιβαρό Κόκκινο)", wine: "Cabernet Sauvignon", color: "red_full", body: "full", sweetness: "dry" },
        { dish: "Λαυράκι στον Ατμό (Λευκό μετά από Βαρύ Κόκκινο!)", wine: "Μοσχοφίλερο", color: "white", body: "light", sweetness: "dry" }
      ];
    }
    renderTimelineAndReport();
  }

  function renderTimelineAndReport() {
    // 1. Render Timeline
    if (degustationMenu.length === 0) {
      timelineList.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #888; background: white; border-radius: var(--radius-sm); border: 1px dashed var(--border-color);">
          <p>Το μενού είναι άδειο. Επιλέξτε ένα έτοιμο πρότυπο ή προσθέστε στάδια παραπάνω.</p>
        </div>
      `;
    } else {
      timelineList.innerHTML = degustationMenu.map((c, idx) => `
        <div class="timeline-card">
          <div class="timeline-step-badge">${idx + 1}</div>
          <div class="timeline-details">
            <div class="timeline-dish">${c.dish}</div>
            <div class="timeline-wine">🍷 ${c.wine}</div>
            <div class="timeline-tags">
              <span class="tag-mini">${getColorLabel(c.color)}</span>
              <span class="tag-mini">${getBodyLabel(c.body)}</span>
              <span class="tag-mini">${c.sweetness === 'sweet' ? '🍯 Γλυκό' : (c.sweetness === 'off_dry' ? '🥂 Ημίξηρο' : '🍇 Ξηρό')}</span>
            </div>
          </div>
          <button class="btn-remove-course" data-index="${idx}" title="Αφαίρεση σταδίου">&times;</button>
        </div>
      `).join('');

      // Wire delete buttons
      timelineList.querySelectorAll('.btn-remove-course').forEach(b => {
        b.addEventListener('click', () => {
          const idx = parseInt(b.getAttribute('data-index'), 10);
          degustationMenu.splice(idx, 1);
          renderTimelineAndReport();
        });
      });
    }

    // 2. Diagnostic Analysis
    const conflicts = [];
    let score = 100;

    for (let i = 0; i < degustationMenu.length - 1; i++) {
      const current = degustationMenu[i];
      const next = degustationMenu[i + 1];

      // Check A: Sweet before Dry rule
      if (current.sweetness === 'sweet' && next.sweetness === 'dry') {
        conflicts.push({
          type: 'error',
          title: `⚠️ Σοβαρή Σύγκρουση: Στάδιο ${i + 1} (${current.wine}) → Στάδιο ${i + 2} (${next.wine})`,
          text: `Παραβίαση του Κανόνα Γλυκύτητας: Σερβίρετε γλυκό κρασί πριν από ξηρό! Η ζάχαρη του πρώτου κρασιού κορεστεί τους υποδοχείς και θα κάνει το ξηρό κρασί να φαίνεται ανυπόφορα ξινό και στυφό.`
        });
        score -= 30;
      }

      // Check B: Heavy Red before Delicate White rule
      if (current.color === 'red_full' && (next.color === 'white' || next.color === 'sparkling')) {
        conflicts.push({
          type: 'error',
          title: `⚠️ Σύγκρουση Τανινών: Στάδιο ${i + 1} (${current.wine}) → Στάδιο ${i + 2} (${next.wine})`,
          text: `Παραβίαση Διαδοχής Χρώματος & Τανινών: Σερβίρετε στιβαρό ερυθρό κρασί πριν από λεπτό λευκό. Οι τανίνες και το σώμα του ερυθρού θα εξαφανίσουν εντελώς τη λεπτότητα του λευκού.`
        });
        score -= 25;
      }

      // Check C: Severe Body Drop rule
      if (current.body === 'full' && next.body === 'light') {
        conflicts.push({
          type: 'warning',
          title: `⚡ Προειδοποίηση Έντασης: Στάδιο ${i + 1} → Στάδιο ${i + 2}`,
          text: `Απότομη πτώση από γεμάτο σώμα σε ελαφρύ. Συνιστάται ομαλή κλιμάκωση (crescendo) από ελαφρύτερο σε πληθωρικότερο οίνο.`
        });
        score -= 15;
      }
    }

    score = Math.max(0, score);
    const isPerfect = conflicts.length === 0 && degustationMenu.length > 0;
    const bannerClass = isPerfect ? 'perfect' : (conflicts.some(c => c.type === 'error') ? 'has-errors' : '');

    reportBox.innerHTML = `
      <div class="score-banner ${bannerClass}">
        <div class="score-num">${degustationMenu.length > 0 ? score + '%' : '—'}</div>
        <div class="score-title">
          ${isPerfect ? '🌟 Άψογη Αρμονία Διαδοχής (Master Sommelier Level)' : (degustationMenu.length === 0 ? 'Προσθέστε Στάδια Μενού' : 'Εντοπίστηκαν Σφάλματα Διαδοχής')}
        </div>
      </div>

      <div class="report-conflicts-list">
        ${isPerfect ? `
          <div class="conflict-item success">
            <strong>✓ Όλοι οι Χρυσοί Κανόνες Διαδοχής τηρούνται:</strong>
            <p>Ξηρό πριν Γλυκό, Λευκό πριν Ερυθρό, και ομαλή κλιμάκωση σώματος και πολυπλοκότητας χωρίς κόπωση του ουρανίσκου.</p>
          </div>
        ` : ''}

        ${conflicts.map(c => `
          <div class="conflict-item ${c.type}">
            <strong>${c.title}</strong>
            <p>${c.text}</p>
          </div>
        `).join('')}

        ${degustationMenu.length === 0 ? `
          <div class="conflict-item warning">
            <p>Πατήστε ένα από τα κουμπιά προτύπων (π.χ. «5 Στάδια Classic») για άμεση επίδειξη του διαγνωστικού εργαλείου.</p>
          </div>
        ` : ''}
      </div>
    `;
  }

  function getColorLabel(c) {
    const map = { sparkling: "🍾 Αφρώδες", white: "🥂 Λευκό", rose: "🌸 Ροζέ", red_light: "🍷 Ελαφρύ Ερυθρό", red_full: "🍷 Στιβαρό Ερυθρό", sweet: "🍯 Επιδόρπιο" };
    return map[c] || c;
  }

  function getBodyLabel(b) {
    const map = { light: "Ελαφρύ Σώμα", medium: "Μέτριο Σώμα", full: "Γεμάτο Σώμα" };
    return map[b] || b;
  }

  // Add course manually
  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      const dishInput = document.getElementById('course-dish-input');
      const wineInput = document.getElementById('course-wine-input');
      const colorSelect = document.getElementById('course-color-select');
      const bodySelect = document.getElementById('course-body-select');
      const sweetSelect = document.getElementById('course-sweetness-select');

      const dish = dishInput.value.trim() || `Στάδιο ${degustationMenu.length + 1}`;
      const wine = wineInput.value.trim() || 'Επιλεγμένος Οίνος';

      degustationMenu.push({
        dish,
        wine,
        color: colorSelect.value,
        body: bodySelect.value,
        sweetness: sweetSelect.value
      });

      dishInput.value = '';
      wineInput.value = '';
      renderTimelineAndReport();
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      degustationMenu = [];
      renderTimelineAndReport();
    });
  }

  if (presetClassic) presetClassic.addEventListener('click', () => loadPreset('classic'));
  if (presetSeafoodGame) presetSeafoodGame.addEventListener('click', () => loadPreset('seafood-game'));
  if (presetFaulty) presetFaulty.addEventListener('click', () => loadPreset('faulty'));

  // Load classic by default
  loadPreset('classic');
}

// ==========================================================================
// 5. GREEK INDIGENOUS VARIETIES ATLAS
// ==========================================================================
function setupGreekVarieties() {
  const varietiesContainer = document.getElementById('varieties-container');
  const filterPills = document.querySelectorAll('#greek-variety-filters .pill');

  if (!varietiesContainer) return;

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeVarietyFilter = pill.getAttribute('data-vfilter');
      renderVarieties();
    });
  });

  function renderVarieties() {
    const filtered = greekVarieties.filter(v => {
      if (activeVarietyFilter === 'all') return true;
      if (activeVarietyFilter === 'greek') return v.origin === 'greek';
      if (activeVarietyFilter === 'international') return v.origin === 'international';
      return v.type === activeVarietyFilter;
    });

    varietiesContainer.innerHTML = filtered.map(v => `
      <article class="variety-card">
        <div class="variety-card-header">
          <div>
            <div style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.2rem;">
              <span style="font-size: 0.72rem; font-weight: 800; padding: 0.15rem 0.45rem; border-radius: 4px; background: #FAF7F2; border: 1px solid var(--border-color); color: var(--wine-accent);">
                ${v.origin === 'greek' ? '🇬🇷 ΓΗΓΕΝΗΣ' : '🌍 ΔΙΕΘΝΗΣ'}
              </span>
            </div>
            <h3 class="variety-name">${v.name}</h3>
            <span class="variety-region">📍 ${v.region}</span>
          </div>
          <span class="variety-type-tag ${v.type}">${v.colorLabel}</span>
        </div>

        <div class="variety-card-body">
          <div class="variety-meters-row">
            <div class="v-meter-item">
              <span class="v-meter-name">Οξύτητα</span>
              <span class="v-meter-dots">${'●'.repeat(Math.round(v.acidity))}${'○'.repeat(5 - Math.round(v.acidity))}</span>
            </div>
            <div class="v-meter-item">
              <span class="v-meter-name">Τανίνες</span>
              <span class="v-meter-dots">${'●'.repeat(Math.round(v.tannins))}${'○'.repeat(5 - Math.round(v.tannins))}</span>
            </div>
            <div class="v-meter-item">
              <span class="v-meter-name">Σώμα</span>
              <span class="v-meter-dots">${'●'.repeat(Math.round(v.body))}${'○'.repeat(5 - Math.round(v.body))}</span>
            </div>
            <div class="v-meter-item">
              <span class="v-meter-name">Αλκοόλ</span>
              <span class="v-meter-dots">${'●'.repeat(Math.round(v.alcohol))}${'○'.repeat(5 - Math.round(v.alcohol))}</span>
            </div>
          </div>

          <p class="variety-aromas"><strong>👃 Αρώματα:</strong> ${v.aromas}</p>
          <p class="variety-profile-text">«${v.profileText}»</p>

          <div class="pairings-duel">
            <div class="duel-col best">
              <h5>✓ Κορυφαίοι Συνδυασμοί</h5>
              <ul class="duel-list">
                ${v.bestPairings.map(p => `<li>• ${p}</li>`).join('')}
              </ul>
            </div>
            <div class="duel-col worst">
              <h5>⚠️ Απαγορευτικά (Εχθροί)</h5>
              <ul class="duel-list">
                ${v.worstPairings.map(p => `<li>• ${p}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>
      </article>
    `).join('');
  }

  renderVarieties();
}

// ==========================================================================
// 6. SOMMELIER EXAM QUIZ LOGIC
// ==========================================================================
function setupQuiz() {
  const quizWrapper = document.getElementById('quiz-wrapper');
  if (!quizWrapper) return;

  let currentQuestionIndex = 0;
  let userScore = 0;
  let hasAnswered = false;

  function renderQuestion() {
    if (currentQuestionIndex >= quizQuestions.length) {
      renderFinalScore();
      return;
    }

    const q = quizQuestions[currentQuestionIndex];
    hasAnswered = false;

    quizWrapper.innerHTML = `
      <div class="quiz-header-bar">
        <span class="quiz-progress-text">Ερώτηση ${currentQuestionIndex + 1} από ${quizQuestions.length}</span>
        <span class="quiz-score-live">Σκορ: ${userScore} / ${currentQuestionIndex}</span>
      </div>

      <h3 class="quiz-question-text">${q.question}</h3>

      <div class="quiz-options-list" id="quiz-options">
        ${q.options.map((opt, idx) => `
          <button class="quiz-option-btn" data-index="${idx}">
            <strong>${String.fromCharCode(65 + idx)}.</strong>
            <span>${opt}</span>
          </button>
        `).join('')}
      </div>

      <div id="quiz-feedback-container"></div>

      <div class="quiz-actions" id="quiz-actions-container" style="display: none;">
        <button class="btn-next-question" id="btn-next-q">
          ${currentQuestionIndex === quizQuestions.length - 1 ? 'Ολοκλήρωση & Αποτέλεσμα →' : 'Επόμενη Ερώτηση →'}
        </button>
      </div>
    `;

    const optionButtons = quizWrapper.querySelectorAll('.quiz-option-btn');
    const feedbackBox = document.getElementById('quiz-feedback-container');
    const actionsBox = document.getElementById('quiz-actions-container');
    const nextBtn = document.getElementById('btn-next-q');

    optionButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (hasAnswered) return;
        hasAnswered = true;

        const selectedIndex = parseInt(btn.getAttribute('data-index'), 10);
        const isCorrect = selectedIndex === q.correctIndex;

        if (isCorrect) {
          userScore++;
          btn.classList.add('correct');
          feedbackBox.innerHTML = `
            <div class="quiz-feedback-box correct">
              <strong>✓ Σωστή Απάντηση!</strong>
              <p>${q.explanation}</p>
            </div>
          `;
        } else {
          btn.classList.add('wrong');
          optionButtons[q.correctIndex].classList.add('correct');
          feedbackBox.innerHTML = `
            <div class="quiz-feedback-box wrong">
              <strong>✗ Λάθος Απάντηση.</strong>
              <p>${q.explanation}</p>
            </div>
          `;
        }

        optionButtons.forEach(b => b.disabled = true);
        actionsBox.style.display = 'flex';
      });
    });

    nextBtn.addEventListener('click', () => {
      currentQuestionIndex++;
      renderQuestion();
    });
  }

  function renderFinalScore() {
    const total = quizQuestions.length;
    const pct = Math.round((userScore / total) * 100);
    let rankBadge = "";
    if (pct >= 90) {
      rankBadge = `🏆 Master Sommelier / Executive Chef (Άριστα ${pct}%)`;
    } else if (pct >= 75) {
      rankBadge = `⭐ Senior Sommelier / Chef de Partie (Εξαιρετική Επίδοση ${pct}%)`;
    } else if (pct >= 60) {
      rankBadge = `🍷 Commis Sommelier / Σπουδαστής ΣΑΕΚ (Βάση Πιστοποίησης ${pct}%)`;
    } else {
      rankBadge = `📖 Χρειάζεται Επανάληψη του Συγγράμματος (${pct}%)`;
    }

    quizWrapper.innerHTML = `
      <div class="quiz-final-banner">
        <h3 style="font-family: 'Cinzel', serif; font-size: 1.8rem; color: var(--primary-burgundy); margin-bottom: 0.5rem;">
          Αποτέλεσμα Εξετάσεων Πιστοποίησης
        </h3>
        <div class="quiz-final-score">${userScore} / ${quizQuestions.length}</div>
        <div class="quiz-rank-badge">${rankBadge}</div>
        <p style="color: var(--text-muted); max-width: 600px; margin: 0 auto 2rem auto; font-size: 0.95rem;">
          Το τεστ βασίζεται στο σύγγραμμα <strong>«ΑΡΜΟΝΙΑ ΣΤΟ ΠΙΑΤΟ ΚΑΙ ΣΤΟ ΠΟΤΗΡΙ»</strong> του Οινολόγου Δημητρίου Καρύδα.
        </p>
        <button class="btn-restart-quiz" id="btn-restart-quiz">🔄 Επανάληψη Κουίζ</button>
      </div>
    `;

    document.getElementById('btn-restart-quiz').addEventListener('click', () => {
      currentQuestionIndex = 0;
      userScore = 0;
      renderQuestion();
    });
  }

  renderQuestion();
}

// ==========================================================================
// 7. LIGHTBOX MODAL LOGIC
// ==========================================================================
function setupLightboxModal() {
  const modal = document.getElementById('image-modal');
  const modalImg = document.getElementById('modal-img');
  const modalCaption = document.getElementById('modal-caption');
  const modalClose = document.getElementById('modal-close');

  if (!modal || !modalImg || !modalClose) return;

  document.querySelectorAll('.info-card-img-wrap').forEach(wrap => {
    wrap.addEventListener('click', () => {
      const img = wrap.querySelector('.infographic-img');
      const headerTitle = wrap.closest('.infographic-card')?.querySelector('h3')?.textContent || '';
      if (img) {
        modalImg.src = img.src;
        modalImg.alt = img.alt;
        modalCaption.textContent = headerTitle;
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
      }
    });
  });

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    modalImg.src = '';
  }

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

// Render Emergency Rescues
function renderEmergency() {
  if (!emergencyContainer) return;
  emergencyContainer.innerHTML = emergencyRescues.map(item => `
    <div class="emergency-item">
      <h3 class="emergency-symptom">🚨 ${item.symptom}</h3>
      <p class="emergency-cause"><strong>Αιτία κατάρρευσης:</strong> ${item.cause}</p>
      <div class="emergency-actions-title">Άμεση Δράση Διάσωσης στο Τραπέζι & στο Πάσο:</div>
      <ul class="emergency-actions">
        ${item.actions.map(act => `<li>${act}</li>`).join('')}
      </ul>
    </div>
  `).join('');
}

// Render 5 Tastes Table
function renderTastesTable() {
  if (!tastesTableBody) return;
  tastesTableBody.innerHTML = tasteInteractions.map(item => `
    <tr>
      <td><span class="taste-pill">${item.icon} ${item.taste}</span></td>
      <td><strong>${item.tannins}</strong></td>
      <td><strong>${item.acidity}</strong></td>
      <td><strong>${item.fruit}</strong></td>
      <td><strong>${item.alcohol}</strong></td>
      <td>${item.notes}</td>
    </tr>
  `).join('');
}

// ==========================================================================
// 8. INITIAL BOOT
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  renderMatrixCards();
  renderEmergency();
  renderTastesTable();
  setupCalculator();
  setupMenuValidator();
  setupGreekVarieties();
  setupQuiz();
  setupLightboxModal();
});
