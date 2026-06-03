# 📊 German Coalition Agreements: Three-Stage Comparative NLP Case Study

This case study compares and analyzes the structural priorities of two consecutive German federal governing agreements using a three-stage Computational Social Science NLP workflow:
- **Kabinett Scholz I (2021-2025)**: SPD, Alliance 90/The Greens, FDP
- **Kabinett 2025-2029 (Proposed Coalition)**: CDU/CSU and SPD

---

## 🧠 Methodology & NLP Pipeline

The text analysis is split into three distinct stages:

### Stage 1: General Exploratory Analysis (Word Clouds)
A general POS (Part-of-Speech) scan extracts nouns, proper nouns, and adjectives, filtering out standard grammatical stopwords and document-specific filler text (e.g. *ziel*, *maßnahme*, *umsetzung*, *prüfen*). The remaining tokens are visualized inside Germany-shaped map masks to highlight core terminology.

### Stage 2: Target Policy Dictionary Analysis
To avoid the ambiguity of raw term counts, we define a list of 7 core policy concepts using a custom German concept dictionary (`policy_dictionary.json`), refined to eliminate false positives (e.g., emission thresholds matching *grenz*) and generic terms (like *reform* or *verfahren*). We measure the density (frequency per 10,000 words) of each semantic concept:
1. `migration_control`: *grenzkontroll, grenzschutz, abschieb, rückführ, zurückweis, außengrenze, binnengrenze, ausreisepflicht, schleuser, asylverfahren*
2. `climate_transition`: *klima, klimaschutz, klimaneutral, energiewende, erneuerbar, windkraft, solar, wasserstoff, dekarbonis, kohleausstieg*
3. `fiscal_policy`: *investition, schuldenbremse, haushalt, finanz, steuer, entlastung, sondervermögen, subvention*
4. `eu_integration`: *eu-reform, binnenmarkt, europäische integration, souveränität, zusammenhalt in europa, europarecht*
5. `foreign_policy`: *außenpolitik, bündnisverteidigung, nato, bundeswehr, rüstung, verteidigungsausgaben*
6. `democratic_resilience`: *demokratie, rechtsstaat, extremismus, resilienz, verfassungsschutz*
7. `digitalization_debureaucratization`: *digitalisierung, bürokratieabbau, entbürokratisierung, bürokratierückbau, digitaler staat, modernisierung der verwaltung*

### Stage 3: Semantic Context & Collocation Search
To understand the framing around controversial policy areas, we perform a semantic context search. Rather than searching for isolated lemmas (which fails to capture German compound nouns), we match tokens against entire target concept stems (Migration Enforcement, Klimaschutz, Investitionen, and Digitalisierung). We extract neighboring adjectives (`ADJ`) and verbs (`VERB`) within a 5-word token window around matching concept terms to reveal the exact framing around these policy themes (e.g., highlighting *sicherstellen/ausweisen* for Migration, or *massiv/notwendig* for Investition).

---

## 📈 Key Comparative Findings

- **Migration Control**: By refining the dictionary to focus on border control and enforcement stems (eliminating emission limits like *flottengrenzwerte* and general terms like *Einwanderung*), the analysis reveals that migration control density **literally doubled** in the 2025 agreement compared to 2021 (rising from 2.98 to 6.09 per 10k words).
- **Climate Transition**: Environmental policy density **halved** in 2025 (dropping from 67.24 to 34.37 per 10k words), indicating a clear political shift and a significant toning-down of green transformation initiatives.
- **Fiscal Policy**: Shows a strong increase (from 13.22 to 21.41 per 10k words), demonstrating the elevated priority of debt rules, fiscal consolidation, and structural investment frameworks.

---

## 💻 Running the Dashboard Locally

1. Run the python script to clean the agreements, generate the masked word clouds, and compute the policy dictionary statistics:
   ```bash
   python3 process_pdfs.py
   ```
2. Start the HTTP server to serve the dashboard interface:
   ```bash
   python3 -m http.server 8000
   ```
3. Open **[http://localhost:8000](http://localhost:8000)** in your browser to explore the interactive visual comparison!
