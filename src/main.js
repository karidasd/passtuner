import { passMatrix, emergencyRescues, tasteInteractions } from './data.js';

// Application State
let activeFilter = 'all';
let searchQuery = '';

// DOM Elements
const matrixContainer = document.getElementById('matrix-cards-container');
const emergencyContainer = document.getElementById('emergency-container');
const tastesTableBody = document.getElementById('tastes-table-body');
const searchInput = document.getElementById('search-input');
const filterButtons = document.querySelectorAll('#category-filters .pill');
const navButtons = document.querySelectorAll('.nav-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

// Navigation Tabs Logic
navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetTab = btn.getAttribute('data-tab');
    
    navButtons.forEach(b => b.classList.remove('active'));
    tabPanes.forEach(p => p.classList.remove('active'));
    
    btn.classList.add('active');
    document.getElementById(`tab-${targetTab}`).classList.add('active');
  });
});

// Category Filter Logic
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.getAttribute('data-filter');
    renderMatrixCards();
  });
});

// Search Input Logic
searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value.toLowerCase().trim();
  renderMatrixCards();
});

// Render Pass Matrix Cards
function renderMatrixCards() {
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

// Render Emergency Rescues
function renderEmergency() {
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

// Lightbox Modal Logic
function setupLightboxModal() {
  const modal = document.getElementById('image-modal');
  const modalImg = document.getElementById('modal-img');
  const modalCaption = document.getElementById('modal-caption');
  const modalClose = document.getElementById('modal-close');

  if (!modal || !modalImg || !modalClose) return;

  // Open modal on image click
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

  // Close modal
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

// Initial Boot
document.addEventListener('DOMContentLoaded', () => {
  renderMatrixCards();
  renderEmergency();
  renderTastesTable();
  setupLightboxModal();
});
