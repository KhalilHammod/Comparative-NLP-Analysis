// app.js

let currentView = 'cloud'; // 'cloud' (exploratory), 'list' (dictionary), or 'colloc' (context)
let allData = { 
  "exploratory": { "2021": [], "2025": [] }, 
  "dictionary": { "2021": {}, "2025": {} },
  "collocations": { "2021": {}, "2025": {} }
};

// Map concept keys to human readable labels
const conceptLabels = {
  "migration_control": "Migration & Grenzkontrolle",
  "climate_transition": "Klimawende (Energiewende)",
  "fiscal_policy": "Fiskalpolitik & Investition",
  "eu_integration": "Europäische Integration",
  "foreign_policy": "Außenpolitik & Verteidigung",
  "democratic_resilience": "Demokratische Resilienz",
  "digitalization_debureaucratization": "Digitalisierung & Entbürokratisierung"
};

document.addEventListener('DOMContentLoaded', () => {
  fetchData();
});

async function fetchData() {
  try {
    const response = await fetch('coalition_words_data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    allData = await response.json();
    renderAll();
  } catch (error) {
    console.error("Could not fetch words data:", error);
    renderAll();
  }
}

function renderAll() {
  renderDataset('2021');
  renderDataset('2025');
}

function renderDataset(year) {
  const containerCloud = document.getElementById(`cloud-${year}`);
  const containerList = document.getElementById(`list-${year}`);
  const containerColloc = document.getElementById(`colloc-${year}`);
  
  if (currentView === 'cloud') {
    // Stage 1 exploratory clouds are static map PNGs embedded in index.html, no JS rendering required.
    return;
  }
  
  if (currentView === 'colloc') {
    // Render Stage 3 Context/Collocations
    containerColloc.innerHTML = '';
    const collocData = allData.collocations ? (allData.collocations[year] || {}) : {};
    
    const collocLabels = {
      "migration_enforcement": "Migration & Grenzkontrolle",
      "klimaschutz": "Klimawende & Umweltschutz",
      "investitionen": "Investition & Fiskalpolitik",
      "digitalisierung": "Digitalisierung & Bürokratie"
    };
    
    Object.keys(collocLabels).forEach(key => {
      const neighbors = collocData[key] || [];
      const label = collocLabels[key];
      const card = document.createElement('div');
      card.className = 'colloc-card';
      
      let listItemsHTML = '';
      if (neighbors.length === 0) {
        listItemsHTML = `<li class="colloc-item"><span class="colloc-item-word" style="color:var(--text-secondary); font-style: italic;">Keine Kookkurrenzen gefunden</span></li>`;
      } else {
        neighbors.forEach(n => {
          listItemsHTML += `
            <li class="colloc-item">
              <span class="colloc-item-word">${n.word}</span>
              <span class="colloc-item-count">${n.count}</span>
            </li>
          `;
        });
      }
      
      card.innerHTML = `
        <h4 class="colloc-word-title">
          <span>${label}</span>
          <span class="material-icons-round" style="font-size:1.1rem; color:var(--text-secondary)">bubble_chart</span>
        </h4>
        <ul class="colloc-list">
          ${listItemsHTML}
        </ul>
      `;
      containerColloc.appendChild(card);
    });
    return;
  }
  
  // Render Stage 2 Dictionary list
  containerList.innerHTML = '';
  const dictData = allData.dictionary ? (allData.dictionary[year] || {}) : {};
  
  // Find max density across both years to scale bars uniformly
  let maxDensity = 1.0;
  if (allData.dictionary) {
    const densities2021 = Object.values(allData.dictionary["2021"] || {}).map(item => item.density || 0);
    const densities2025 = Object.values(allData.dictionary["2025"] || {}).map(item => item.density || 0);
    maxDensity = Math.max(...densities2021, ...densities2025, 1.0);
  }
  
  Object.keys(conceptLabels).forEach(conceptKey => {
    const item = dictData[conceptKey] || { count: 0, density: 0 };
    const percentage = (item.density / maxDensity) * 100;
    const label = conceptLabels[conceptKey];
    
    const row = document.createElement('div');
    row.className = 'list-row';
    row.innerHTML = `
      <span class="word-label cat-${conceptKey}">${label}</span>
      <span class="word-count">${item.density} <small style="font-size:0.7rem; color:var(--text-secondary)">/10k</small></span>
      <div class="chart-bar-bg">
        <div class="chart-bar-fill bg-${conceptKey}" style="width: ${percentage}%"></div>
      </div>
    `;
    containerList.appendChild(row);
  });
}

function switchView(view) {
  currentView = view;
  
  // Update Buttons
  document.getElementById('btn-cloud').classList.toggle('active', view === 'cloud');
  document.getElementById('btn-list').classList.toggle('active', view === 'list');
  document.getElementById('btn-colloc').classList.toggle('active', view === 'colloc');
  
  // Toggle Containers
  const sections = document.querySelectorAll('.view-section');
  sections.forEach(sec => {
    if (sec.id.startsWith(view)) {
      sec.style.display = view === 'cloud' ? 'flex' : 'block';
    } else {
      sec.style.display = 'none';
    }
  });
  
  renderAll();
}
