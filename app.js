// app.js - Bilingual Unified Data Story

let allData = { 
  "exploratory": { "2021": [], "2025": [] }, 
  "dictionary": { "2021": {}, "2025": {} },
  "stances": { "2021": {}, "2025": {} }
};

const domains = [
  {
    key: "foreign",
    dictKey: "foreign_policy",
    title: { de: "Außenpolitik & Verteidigung", en: "Foreign Policy & Defense" },
    icon: "security",
    labels: {
      de: ["Diplomatie & Kooperation", "Verteidigung & Abschreckung"],
      en: ["Diplomacy & Cooperation", "Defense & Deterrence"]
    },
    classes: ["diplomacy", "defense"],
    defs: {
      de: [
        "Fokus auf Diplomatie, multilaterale Institutionen, Entwicklungszusammenarbeit, zivile Krisenprävention und Friedensverhandlungen.",
        "Fokus auf Stärkung der Bundeswehr, NATO-Bündnisverpflichtungen, militärische Abschreckung und Rüstungsinvestitionen."
      ],
      en: [
        "Focus on diplomacy, multilateral institutions, development cooperation, civil crisis prevention, and peace negotiations.",
        "Focus on strengthening the Bundeswehr, NATO alliance commitments, military deterrence, and defense investments."
      ]
    },
    stems: [
      "diplomat, abrüst, entwicklung, fried, multilateral, zivil, verhandlung",
      "bundeswehr, nato, rüst, verteidig, abschreckung, streitkräfte"
    ],
    hasStance: true,
    calcShift: (leftPct21, leftPct25, rightPct21, rightPct25, lang) => {
      const diff = rightPct25 - rightPct21; // Shift to Defense (right)
      const label = diff > 0 
        ? (lang === 'de' ? "Verschiebung zu Verteidigung & Abschreckung" : "Shift towards Defense & Deterrence")
        : (lang === 'de' ? "Verschiebung zu Diplomatie & Kooperation" : "Shift towards Diplomacy & Cooperation");
      return {
        diff: diff,
        text: `+${Math.abs(diff)}% ${label}`,
        class: diff > 0 ? "shift-text-defense" : "shift-text-diplomacy",
        icon: diff > 0 ? "trending_up" : "trending_down"
      };
    }
  },
  {
    key: "digital",
    dictKey: "digitalization_debureaucratization",
    title: { de: "Digitalisierung & Verwaltung", en: "Digitalization & Bureaucracy" },
    icon: "bolt",
    labels: {
      de: ["Digitalisierung & Infrastruktur", "Entbürokratisierung & Abbau"],
      en: ["Digitalization & Infrastructure", "Debureaucratization & Relief"]
    },
    classes: ["infra", "debureaucracy"],
    defs: {
      de: [
        "Fokus auf Modernisierung der Verwaltung durch Digitalisierung, Breitbandausbau, Online-Portale und datenbasierte Dienste.",
        "Fokus auf den Abbau von Vorschriften, Planungsbeschleunigung, Deregulierung und Vereinfachung administrativer Prozesse."
      ],
      en: [
        "Focus on modernizing administration through digitalization, broadband expansion, online portals, and data-driven services.",
        "Focus on reducing regulations, accelerating planning, deregulation, and simplifying administrative processes."
      ]
    },
    stems: [
      "digital, online, netz, breitband, glasfaser, daten, portal",
      "bürokratie, entbürokrat, planungsbeschleunigung, abbau, vereinfach, beschleunigung"
    ],
    hasStance: true,
    calcShift: (leftPct21, leftPct25, rightPct21, rightPct25, lang) => {
      const diff = rightPct25 - rightPct21; // Shift to Debureaucracy (right)
      const label = diff > 0 
        ? (lang === 'de' ? "Verschiebung zu Entbürokratisierung" : "Shift towards Debureaucratization")
        : (lang === 'de' ? "Verschiebung zu Verwaltungsdigitalisierung" : "Shift towards Digitalization");
      return {
        diff: diff,
        text: `+${Math.abs(diff)}% ${label}`,
        class: diff > 0 ? "shift-text-debureaucracy" : "shift-text-infra",
        icon: diff > 0 ? "trending_up" : "trending_down"
      };
    }
  },
  {
    key: "climate",
    dictKey: "climate_transition",
    title: { de: "Klimawende & Energiesicherheit", en: "Climate Transition & Security" },
    icon: "eco",
    labels: {
      de: ["Transformation & Ausbau", "Markt & Energiesicherheit"],
      en: ["Transformation & Expansion", "Market & Energy Security"]
    },
    classes: ["transformative", "market"],
    defs: {
      de: [
        "Fokus auf ökologischen Wendeausbau, Klimaneutralität, erneuerbare Energieträger und Dekarbonisierung.",
        "Fokus auf Wirtschaftlichkeit, Versorgungssicherheit, Technologieoffenheit und fossile Gas-/Kohle-Brücken."
      ],
      en: [
        "Focus on ecological transition expansion, climate neutrality, renewable energy sources, and decarbonization.",
        "Focus on economic efficiency, security of supply, technological openness, and fossil gas/coal bridges."
      ]
    },
    stems: [
      "klimaneutral, transformation, energiewende, erneuerbar, windkraft, solar, dekarbonis, kohleausstieg, ausbau, ambitioniert",
      "versorgungssicherheit, wirtschaftlichkeit, marktwirtschaftlich, technologieoffen, strompreis, industrie, stabilität, gas, wasserstoff"
    ],
    hasStance: true,
    calcShift: (leftPct21, leftPct25, rightPct21, rightPct25, lang) => {
      const diff = rightPct25 - rightPct21; // Shift to Market (right)
      const label = diff > 0 
        ? (lang === 'de' ? "Verschiebung zu Markt & Energiesicherheit" : "Shift towards Market & Security")
        : (lang === 'de' ? "Verschiebung zu Transformation" : "Shift towards Transformation");
      return {
        diff: diff,
        text: `+${Math.abs(diff)}% ${label}`,
        class: diff > 0 ? "shift-text-market" : "shift-text-transformative",
        icon: diff > 0 ? "trending_up" : "trending_down"
      };
    }
  },
  {
    key: "migration",
    dictKey: "migration_control",
    title: { de: "Migration & Integration", en: "Migration & Integration" },
    icon: "gavel",
    labels: {
      de: ["Kontrolle & Durchsetzung", "Humanitär & Integration"],
      en: ["Control & Enforcement", "Humanitarian & Integration"]
    },
    classes: ["control", "humanitarian"],
    defs: {
      de: [
        "Fokus auf Grenzschutz, Abschiebungserleichterung, Rückführung, Zurückweisungen und Haftgewahrsam.",
        "Fokus auf Asylverfahren, Bleiberechte, Aufnahme, Teilhabe, Flüchtlingsschutz und Integration."
      ],
      en: [
        "Focus on border protection, facilitation of deportations, repatriation, pushbacks, and detention.",
        "Focus on asylum procedures, right to remain, reception, participation, refugee protection, and integration."
      ]
    },
    stems: [
      "grenzkontroll, grenzschutz, abschieb, rückführ, zurückweis, ausreisepflicht, schleuser, haft, gewahrsam, obergrenze",
      "integration, aufnahme, bleiberecht, geflücht, humanitär, teilhabe, spurwechsel, asyl, flüchtling"
    ],
    hasStance: true,
    calcShift: (leftPct21, leftPct25, rightPct21, rightPct25, lang) => {
      const diff = leftPct25 - leftPct21; // Shift to Control (left)
      const label = diff > 0 
        ? (lang === 'de' ? "Verschiebung zu Kontrolle" : "Shift towards Control")
        : (lang === 'de' ? "Verschiebung zu Humanitär" : "Shift towards Humanitarian");
      return {
        diff: diff,
        text: `+${Math.abs(diff)}% ${label}`,
        class: diff > 0 ? "shift-text-enforcement" : "shift-text-humanitarian",
        icon: diff > 0 ? "trending_up" : "trending_down"
      };
    }
  },
  {
    key: "fiscal",
    dictKey: "fiscal_policy",
    title: { de: "Investition & Haushaltsregeln", en: "Investment & Fiscal Rules" },
    icon: "account_balance",
    labels: {
      de: ["Investition & Modernisierung", "Haushaltsdisziplin & Entlastung"],
      en: ["Investment & Modernization", "Fiscal Discipline & Relief"]
    },
    classes: ["investment", "discipline"],
    defs: {
      de: [
        "Fokus auf Zukunftsinvestitionen, Infrastruktur-Modernisierung, Sondervermögen und Förderprogramme.",
        "Fokus auf die Einhaltung der Schuldenbremse, Haushaltskonsolidierung, Schuldenabbau und Steuerentlastungen."
      ],
      en: [
        "Focus on investments in the future, infrastructure modernization, special funds, and subsidy programs.",
        "Focus on compliance with the debt brake, fiscal consolidation, debt reduction, and tax relief."
      ]
    },
    stems: [
      "investition, zukunftsinvestition, modernisierung, sondervermögen, infrastruktur, förderung",
      "schuldenbremse, konsolidierung, haushalt, disziplin, steuersenkung, steuerentlastung, abbau, entlastung"
    ],
    hasStance: true,
    calcShift: (leftPct21, leftPct25, rightPct21, rightPct25, lang) => {
      const diff = rightPct25 - rightPct21; // Shift to Discipline (right)
      const label = diff > 0 
        ? (lang === 'de' ? "Verschiebung zu Haushaltsdisziplin" : "Shift towards Fiscal Discipline")
        : (lang === 'de' ? "Verschiebung zu Investition" : "Shift towards Investment");
      return {
        diff: diff,
        text: `+${Math.abs(diff)}% ${label}`,
        class: diff > 0 ? "shift-text-discipline" : "shift-text-investment",
        icon: diff > 0 ? "trending_up" : "trending_down"
      };
    }
  },
  {
    key: "eu",
    dictKey: "eu_integration",
    title: { de: "Europäische Integration", en: "European Integration" },
    icon: "language",
    defs: {
      de: [
        "Verbindung und Einbettung Deutschlands in europäische Institutionen, Binnenmarkt und Schengen-Kooperation.",
        "Filterstämme zur Quantifizierung:"
      ],
      en: [
        "Germany's connection and embedding in European institutions, the single market, and Schengen cooperation.",
        "Filter stems for quantification:"
      ]
    },
    stems: [
      "europa, europä, binnenmarkt, schengen, souverän"
    ],
    hasStance: false
  },
  {
    key: "democracy",
    dictKey: "democratic_resilience",
    title: { de: "Demokratische Resilienz", en: "Democratic Resilience" },
    icon: "shield",
    defs: {
      de: [
        "Fokus auf Rechtsstaatlichkeit, Bekämpfung von Extremismus, Verfassungstreue und Funktionsfähigkeit der Justiz.",
        "Filterstämme zur Quantifizierung:"
      ],
      en: [
        "Focus on the rule of law, combating extremism, loyalty to the constitution, and the functioning of the judiciary.",
        "Filter stems for quantification:"
      ]
    },
    stems: [
      "demokrat, rechtsstaat, extremismus, verfassung, resilienz, justiz"
    ],
    hasStance: false
  }
];

const staticTranslations = {
  de: {
    "main-title": "Koalitionsverträge im Vergleich",
    "subtitle": "Vergleichende Textanalyse: Kabinett Scholz (2021) vs. Kabinett Merz (2025)",
    "sec1-heading": "1. Wortwolken & Thematische Schwerpunkte",
    "sec1-intro": "Auswahl der häufigsten sinntragenden Substantive und Adjektive (unter Ausschluss von Füllwörtern). Ziehen Sie den Schieberegler horizontal, um das Kabinett Scholz (2021, links) mit dem Kabinett Merz (2025, rechts) zu vergleichen.",
    "badge-2021": "Kabinett Scholz (2021)",
    "badge-2025": "Kabinett Merz (2025)",
    "sec2-heading": "2. Begriffsdichte & Inhaltliche Tendenzen",
    "sec2-intro": "Systematischer Vergleich der Politikbereiche. Zur besseren Übersicht ist die Analyse unterteilt in <strong>Fokusbereiche</strong> (mit inhaltlicher Ausrichtung) und <strong>weitere Themenbereiche</strong> (mit reiner Vorkommensdichte).",
    "sec2-sub1": "I. Fokusbereiche mit inhaltlicher Ausrichtung",
    "sec2-sub2": "II. Weitere Themenbereiche",
    "insights-heading": "Analytische Erkenntnisse",
    "insights-intro": "Diese wissenschaftliche Fallstudie untersucht die thematischen Schwerpunkte und ideologischen Richtungswechsel zwischen den Koalitionsverträgen von 2021 und 2025.",
    "insight-migration-title": "Migration & Integration",
    "insight-migration-text": "Die Vorkommensdichte migrationspolitischer Begrifflichkeiten bleibt zwischen beiden Regierungsabkommen stabil (ca. 29 Treffer pro 10.000 Wörter). Die Satzebenen-Polaritätsanalyse offenbart jedoch eine signifikante inhaltliche Neuausrichtung: Die relative Frequenz des restriktiven Kontroll- und Durchsetzungs-Framings steigt im Abkommen 2025 auf 37 % (gegenüber 28 % im Jahr 2021), während das humanitär-integrative Framing korrespondierend von 72 % auf 63 % zurückgeht.",
    "insight-climate-title": "Klimawende (Energiewende)",
    "insight-climate-text": "Die quantitative Analyse dokumentiert eine substanzielle De-Priorisierung der ökologischen Transformation im Koalitionsvertrag 2025. Die relative Begriffsfrequenz für Klimaschutz und Energiewende halbiert sich nahezu von 85,00 (2021) auf 42,62 Treffer pro 10.000 Wörter (2025). Dies indiziert eine programmatische Verschiebung von einer ökologisch-transformativen Ausrichtung hin zu einer markt- und energiesicherheitsorientierten Prioritätensetzung.",
    "insight-digital-title": "Digitalisierung & Bürokratie",
    "insight-digital-text": "Während administrative Reformvorhaben in beiden Dokumenten eine hohe Priorität einnehmen, zeigt die Polaritätsanalyse eine deutliche qualitative Verschiebung des Fokus. Der relative Anteil des Framings zur Entbürokratisierung und Planungsbeschleunigung steigt von 20 % im Jahr 2021 auf 37 % im Jahr 2025. Dies belegt eine Schwerpunktverschiebung von der reinen digitalen Infrastruktur-Implementierung hin zum Abbau regulativer Barrieren.",
    "insight-foreign-title": "Außenpolitik & Verteidigung",
    "insight-foreign-text": "Die Analyse der bereinigten Sicherheitsbegriffe verzeichnet eine Zunahme der außen- und verteidigungspolitischen Dichte um 23 % (von 19,90 auf 24,55 Treffer pro 10.000 Wörter). Auf inhaltlicher Ebene dokumentiert die Satzanalyse einen Epochenwechsel: Das im Jahr 2021 dominierende Framing der multilateralen Kooperation und Diplomatie (61 %) weicht im Jahr 2025 einem Fokus auf militärische Verteidigung und Abschreckung (62 %).",
    // UI elements inside cards
    "density-title": "Begriffsdichte (pro 10.000 Wörter)",
    "stance-title": "Inhaltliche Gewichtung & Ausrichtung",
    "btn-stems-toggle": "Details & Filterstämme",
    "filters-title": "Filterbegriffe",
    "scholz-label": "Kabinett Scholz (2021)",
    "merz-label": "Kabinett Merz (2025)",
    "theme-lab": "Lab Mode",
    "theme-journal": "Journal Mode"
  },
  en: {
    "main-title": "Coalition Agreements Comparison",
    "subtitle": "Comparative Text Analysis: Cabinet Scholz (2021) vs. Cabinet Merz (2025)",
    "sec1-heading": "1. Word Clouds & Thematic Priorities",
    "sec1-intro": "Selection of the most frequent meaningful nouns and adjectives (excluding stop words). Drag the slider horizontally to compare Cabinet Scholz (2021, left) with Cabinet Merz (2025, right).",
    "badge-2021": "Cabinet Scholz (2021)",
    "badge-2025": "Cabinet Merz (2025)",
    "sec2-heading": "2. Concept Density & Thematic Shifts",
    "sec2-intro": "Systematic comparison of policy areas. For a better overview, the analysis is divided into <strong>focus areas</strong> (with thematic stance analysis) and <strong>additional policy areas</strong> (with density metrics only).",
    "sec2-sub1": "I. Focus Areas with Thematic Orientation",
    "sec2-sub2": "II. Additional Policy Areas",
    "insights-heading": "Analytical Insights",
    "insights-intro": "This scientific case study examines the thematic priorities and ideological shifts between the coalition agreements of 2021 and 2025.",
    "insight-migration-title": "Migration & Integration",
    "insight-migration-text": "The occurrence density of migration-related terminology remains stable across both agreements (approx. 29 matches per 10,000 words). However, sentence-level stance polarity analysis reveals a significant ideological realignment: the relative frequency of the restrictive control and enforcement framing increases to 37% in the 2025 agreement (up from 28% in 2021), whereas the humanitarian-integrative framing declines from 72% to 63%.",
    "insight-climate-title": "Climate Transition (Energy)",
    "insight-climate-text": "The quantitative analysis documents a substantial de-prioritization of the ecological transition in the 2025 agreement. The relative term density for climate protection and the energy transition is nearly halved, dropping from 85.00 (2021) to 42.62 matches per 10,000 words (2025). This indices a programmatic shift from an ecologically transformative framing toward a market- and energy-security-oriented agenda.",
    "insight-digital-title": "Digitalization & Bureaucracy",
    "insight-digital-text": "While administrative reform remains a high priority in both documents, the stance analysis indicates a clear qualitative shift in focus. The relative share of debureaucratization and planning acceleration framing increases from 20% in 2021 to 37% in 2025. This documents a pivot from pure digital infrastructure implementation toward the dismantling of regulatory barriers.",
    "insight-foreign-title": "Foreign Policy & Defense",
    "insight-foreign-text": "The analysis of refined security terminology reveals a 23% increase in foreign and defense policy density (from 19.90 to 24.55 matches per 10,000 words). At the sentence level, the analysis documents a structural paradigm shift: the framing of multilateral cooperation and diplomacy, which dominated in 2021 (61%), is replaced by a focus on military defense and deterrence in 2025 (62%).",
    // UI elements inside cards
    "density-title": "Concept Density (per 10,000 words)",
    "stance-title": "Thematic Stance & Orientation",
    "btn-stems-toggle": "Details & Filter Stems",
    "filters-title": "Filter Terms",
    "scholz-label": "Cabinet Scholz (2021)",
    "merz-label": "Cabinet Merz (2025)",
    "theme-lab": "Lab Mode",
    "theme-journal": "Journal Mode"
  }
};

let currentLang = 'de';

document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
  initTheme();
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
    initSlider();
  } catch (error) {
    console.error("Could not fetch words data:", error);
  }
}

function renderAll() {
  const focusContainer = document.getElementById('focus-cards-container');
  const generalContainer = document.getElementById('general-cards-container');
  
  if (focusContainer) focusContainer.innerHTML = '';
  if (generalContainer) generalContainer.innerHTML = '';
  
  // Find max density across both years to scale bars uniformly
  let maxDensity = 1.0;
  if (allData.dictionary) {
    const densities2021 = Object.values(allData.dictionary["2021"] || {}).map(item => item.density || 0);
    const densities2025 = Object.values(allData.dictionary["2025"] || {}).map(item => item.density || 0);
    maxDensity = Math.max(...densities2021, ...densities2025, 1.0);
  }
  
  domains.forEach(dom => {
    // Stage 2 density data
    const item21 = (allData.dictionary["2021"] || {})[dom.dictKey] || { count: 0, density: 0 };
    const item25 = (allData.dictionary["2025"] || {})[dom.dictKey] || { count: 0, density: 0 };
    
    const pct21 = (item21.density / maxDensity) * 100;
    const pct25 = (item25.density / maxDensity) * 100;
    
    // Create unified card element
    const card = document.createElement('div');
    card.className = `domain-card ${dom.hasStance ? 'focus-card' : 'general-card'}`;
    
    let stanceHTML = '';
    
    if (dom.hasStance && allData.stances) {
      const counts21 = (allData.stances["2021"] || {})[dom.key] || {};
      const counts25 = (allData.stances["2025"] || {})[dom.key] || {};
      
      const keys21 = Object.keys(counts21);
      const leftVal21 = counts21[keys21[0]] || 0;
      const rightVal21 = counts21[keys21[1]] || 0;
      const total21 = leftVal21 + rightVal21;
      
      const leftPct21 = total21 > 0 ? Math.round((leftVal21 / total21) * 100) : 50;
      const rightPct21 = 100 - leftPct21;
      
      const keys25 = Object.keys(counts25);
      const leftVal25 = counts25[keys25[0]] || 0;
      const rightVal25 = counts25[keys25[1]] || 0;
      const total25 = leftVal25 + rightVal25;
      
      const leftPct25 = total25 > 0 ? Math.round((leftVal25 / total25) * 100) : 50;
      const rightPct25 = 100 - leftPct25;
      
      const shift = dom.calcShift(leftPct21, leftPct25, rightPct21, rightPct25, currentLang);
      
      // Determine short percentage indicators inside segments to avoid clipping
      const leftText21 = leftPct21 > 12 ? `${leftPct21}%` : '';
      const rightText21 = rightPct21 > 12 ? `${rightPct21}%` : '';
      const leftText25 = leftPct25 > 12 ? `${leftPct25}%` : '';
      const rightText25 = rightPct25 > 12 ? `${rightPct25}%` : '';
      
      stanceHTML = `
        <div class="domain-stance-sec">
          <div class="stance-sec-title">${staticTranslations[currentLang]['stance-title']}</div>
          
          <!-- Stance color legend -->
          <div class="stance-legend">
            <div class="legend-item">
              <span class="legend-color-box stance-seg-${dom.classes[0]}"></span>
              <span>${dom.labels[currentLang][0]}</span>
            </div>
            <div class="legend-item">
              <span class="legend-color-box stance-seg-${dom.classes[1]}"></span>
              <span>${dom.labels[currentLang][1]}</span>
            </div>
          </div>
          
          <div class="stance-comp-bars">
            <div class="stance-row">
              <div class="stance-meta">
                <span class="stance-year">${staticTranslations[currentLang]['scholz-label']}</span>
                <span style="font-weight:600">${leftPct21}% vs ${rightPct21}%</span>
              </div>
              <div class="stance-progress-bg">
                <div class="stance-seg stance-seg-${dom.classes[0]}" style="width: ${leftPct21}%" title="${dom.labels[currentLang][0]}: ${leftVal21} Sätze">
                  ${leftText21}
                </div>
                <div class="stance-seg stance-seg-${dom.classes[1]}" style="width: ${rightPct21}%" title="${dom.labels[currentLang][1]}: ${rightVal21} Sätze">
                  ${rightText21}
                </div>
              </div>
            </div>
            
            <div class="stance-row">
              <div class="stance-meta">
                <span class="stance-year">${staticTranslations[currentLang]['merz-label']}</span>
                <span style="font-weight:600">${leftPct25}% vs ${rightPct25}%</span>
              </div>
              <div class="stance-progress-bg">
                <div class="stance-seg stance-seg-${dom.classes[0]}" style="width: ${leftPct25}%" title="${dom.labels[currentLang][0]}: ${leftVal25} Sätze">
                  ${leftText25}
                </div>
                <div class="stance-seg stance-seg-${dom.classes[1]}" style="width: ${rightPct25}%" title="${dom.labels[currentLang][1]}: ${rightVal25} Sätze">
                  ${rightText25}
                </div>
              </div>
            </div>
          </div>
          
          <div class="stance-shift-badge">
            <span class="material-icons-round ${shift.class}">${shift.icon}</span>
            <span class="${shift.class}">${shift.text}</span>
          </div>
        </div>
      `;
    }
    
    const toggleButtonHTML = dom.hasStance ? `
        <!-- Stems drawer toggle -->
        <div>
          <button class="btn-stems-toggle" aria-expanded="false" aria-controls="drawer-${dom.key}" onclick="toggleStems(this)">
            <span>${staticTranslations[currentLang]['btn-stems-toggle']}</span>
            <span class="material-icons-round">expand_more</span>
          </button>
        </div>
    ` : '';
    
    const drawerHTML = dom.hasStance ? `
      <!-- Stems drawer stretches full width across the bottom grid columns -->
      <div class="stems-drawer" id="drawer-${dom.key}" hidden="until-found">
        <div class="stems-grid">
          <div class="stance-def-item border-${dom.classes[0]}">
            <div class="stance-card-header">
              <span class="legend-color-box stance-seg-${dom.classes[0]}"></span>
              <h4 class="stance-card-title">${dom.labels[currentLang][0]}</h4>
            </div>
            <p class="stance-card-desc">${dom.defs[currentLang][0]}</p>
            <div class="stance-card-filters">
              <span class="filters-title">${staticTranslations[currentLang]['filters-title']}</span>
              <div class="stems-chips-container">
                ${dom.stems[0].split(/\s*,\s*/).map(stem => `<span class="stem-chip">${stem}</span>`).join('')}
              </div>
            </div>
          </div>
          <div class="stance-def-item border-${dom.classes[1]}">
            <div class="stance-card-header">
              <span class="legend-color-box stance-seg-${dom.classes[1]}"></span>
              <h4 class="stance-card-title">${dom.labels[currentLang][1]}</h4>
            </div>
            <p class="stance-card-desc">${dom.defs[currentLang][1]}</p>
            ${dom.stems[1] ? `
            <div class="stance-card-filters">
              <span class="filters-title">${staticTranslations[currentLang]['filters-title']}</span>
              <div class="stems-chips-container">
                ${dom.stems[1].split(/\s*,\s*/).map(stem => `<span class="stem-chip">${stem}</span>`).join('')}
              </div>
            </div>` : ''}
          </div>
        </div>
      </div>
    ` : '';
    
    card.innerHTML = `
      <div class="domain-info">
        <h3 class="domain-title">
          <span class="material-icons-round" style="color: var(--color-${dom.dictKey}); font-size:1.45rem;">${dom.icon}</span>
          <span>${dom.title[currentLang]}</span>
        </h3>
        
        <!-- Stage 2 Density compare -->
        <div class="domain-density-sec">
          <div class="density-sec-title">${staticTranslations[currentLang]['density-title']}</div>
          
          <div class="density-comp-row">
            <div class="density-meta">
              <span class="density-label">${staticTranslations[currentLang]['scholz-label']}</span>
              <span class="density-value">${item21.density} <small style="font-size:0.7rem; color:var(--text-secondary)">/10k</small></span>
            </div>
            <div class="density-bar-bg">
              <div class="density-bar-fill fill-2021" style="width: ${pct21}%"></div>
            </div>
          </div>
          
          <div class="density-comp-row">
            <div class="density-meta">
              <span class="density-label">${staticTranslations[currentLang]['merz-label']}</span>
              <span class="density-value">${item25.density} <small style="font-size:0.7rem; color:var(--text-secondary)">/10k</small></span>
            </div>
            <div class="density-bar-bg">
              <div class="density-bar-fill fill-2025" style="width: ${pct25}%"></div>
            </div>
          </div>
        </div>
        
        ${toggleButtonHTML}
      </div>
      
      <!-- Stance visualizer block (only if hasStance is true) -->
      ${stanceHTML}
      
      ${drawerHTML}
    `;
    
    if (dom.hasStance && focusContainer) {
      focusContainer.appendChild(card);
    } else if (!dom.hasStance && generalContainer) {
      generalContainer.appendChild(card);
    }
  });

  // Polyfill / Fallback for browsers that do not support hidden="until-found"
  if (!('onbeforematch' in HTMLElement.prototype)) {
    document.querySelectorAll('[hidden="until-found"]').forEach((el) => {
      el.removeAttribute('hidden');
    });
  }
}

function toggleStems(btn) {
  const card = btn.closest('.domain-card');
  const drawer = card.querySelector('.stems-drawer');
  const icon = btn.querySelector('.material-icons-round');
  const isExpanded = btn.getAttribute('aria-expanded') === 'true';
  
  if (isExpanded) {
    drawer.classList.remove('active');
    drawer.hidden = 'until-found';
    icon.textContent = 'expand_more';
    btn.setAttribute('aria-expanded', 'false');
  } else {
    drawer.classList.add('active');
    drawer.removeAttribute('hidden');
    icon.textContent = 'expand_less';
    btn.setAttribute('aria-expanded', 'true');
  }
}

// Listen to native browser searching to auto-expand collapsible details drawers
document.addEventListener('beforematch', (e) => {
  if (e.target.classList.contains('stems-drawer')) {
    e.target.classList.add('active');
    const card = e.target.closest('.domain-card');
    const btn = card.querySelector('.btn-stems-toggle');
    if (btn) {
      const icon = btn.querySelector('.material-icons-round');
      if (icon) icon.textContent = 'expand_less';
      btn.setAttribute('aria-expanded', 'true');
    }
  }
});

// Drag reveals word cloud split comparison slider
function initSlider() {
  const slider = document.getElementById('word-cloud-slider');
  const overlay = document.getElementById('img-2025-overlay');
  const handle = document.getElementById('slider-handle');
  
  if (!slider || !overlay || !handle) return;
  
  let isDragging = false;
  
  function setPosition(x) {
    const rect = slider.getBoundingClientRect();
    let percent = ((x - rect.left) / rect.width) * 100;
    if (percent < 0) percent = 0;
    if (percent > 100) percent = 100;
    overlay.style.clipPath = `inset(0 0 0 ${percent}%)`;
    handle.style.left = `${percent}%`;
    
    // Dynamically fade out badges as the handle crosses them
    const badge21 = document.getElementById('badge-2021');
    const badge25 = document.getElementById('badge-2025');
    if (badge21) {
      badge21.style.opacity = percent > 25 ? 1 : (percent / 25);
    }
    if (badge25) {
      badge25.style.opacity = percent < 75 ? 1 : ((100 - percent) / 25);
    }
  }
  
  slider.addEventListener('mousedown', (e) => {
    e.preventDefault(); // Prevent default text selection/image dragging
    isDragging = true;
    setPosition(e.clientX);
  });
  
  window.addEventListener('mouseup', () => {
    isDragging = false;
  });
  
  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    setPosition(e.clientX);
  });
  
  slider.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent standard mobile touch scroll when sliding
    isDragging = true;
    if (e.touches[0]) {
      setPosition(e.touches[0].clientX);
    }
  });
  
  window.addEventListener('touchend', () => {
    isDragging = false;
  });
  
  window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    if (e.touches[0]) {
      setPosition(e.touches[0].clientX);
    }
  });
}

// Light & Dark theme toggle
function toggleTheme() {
  const body = document.body;
  const btn = document.getElementById('theme-toggle-btn');
  const icon = document.getElementById('theme-icon');
  const text = document.getElementById('theme-text');
  
  if (body.classList.contains('theme-light')) {
    body.classList.remove('theme-light');
    body.classList.add('theme-dark');
    if (icon) icon.textContent = 'light_mode';
    if (text) text.textContent = staticTranslations[currentLang]['theme-journal'];
    localStorage.setItem('theme', 'dark');
  } else {
    body.classList.remove('theme-dark');
    body.classList.add('theme-light');
    if (icon) icon.textContent = 'dark_mode';
    if (text) text.textContent = staticTranslations[currentLang]['theme-lab'];
    localStorage.setItem('theme', 'light');
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const body = document.body;
  const icon = document.getElementById('theme-icon');
  const text = document.getElementById('theme-text');
  
  if (savedTheme === 'dark') {
    body.classList.remove('theme-light');
    body.classList.add('theme-dark');
    if (icon) icon.textContent = 'light_mode';
    if (text) text.textContent = staticTranslations[currentLang]['theme-journal'];
  } else {
    body.classList.remove('theme-dark');
    body.classList.add('theme-light');
    if (icon) icon.textContent = 'dark_mode';
    if (text) text.textContent = staticTranslations[currentLang]['theme-lab'];
  }
}

// Language Toggle & Localization Setup
function toggleLanguage() {
  currentLang = currentLang === 'de' ? 'en' : 'de';
  localStorage.setItem('lang', currentLang);
  updateLanguage();
  renderAll();
}

function initLanguage() {
  const savedLang = localStorage.getItem('lang');
  if (savedLang === 'de' || savedLang === 'en') {
    currentLang = savedLang;
  } else {
    const navLang = navigator.language || navigator.userLanguage;
    if (navLang && navLang.startsWith('en')) {
      currentLang = 'en';
    }
  }
  updateLanguage();
}

function updateLanguage() {
  const langText = document.getElementById('lang-text');
  if (langText) {
    langText.textContent = currentLang === 'de' ? 'EN' : 'DE';
  }
  
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (staticTranslations[currentLang] && staticTranslations[currentLang][key]) {
      const val = staticTranslations[currentLang][key];
      if (val.includes('<')) {
        el.innerHTML = val;
      } else {
        const iconSpan = el.querySelector('.material-icons-round');
        if (iconSpan) {
          const iconText = iconSpan.textContent;
          el.textContent = val;
          iconSpan.textContent = iconText;
          el.prepend(iconSpan);
        } else {
          el.textContent = val;
        }
      }
    }
  });

  // Keep theme toggle in sync with language
  const body = document.body;
  const themeText = document.getElementById('theme-text');
  if (themeText) {
    if (body.classList.contains('theme-dark')) {
      themeText.textContent = staticTranslations[currentLang]['theme-journal'];
    } else {
      themeText.textContent = staticTranslations[currentLang]['theme-lab'];
    }
  }
}
