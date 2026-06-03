# 📊 German Coalition Agreements: Three-Stage Comparative NLP Case Study

This case study compares and analyzes the structural priorities of two consecutive German federal governing agreements using a three-stage Computational Social Science NLP workflow:
- **Kabinett Scholz (2021-2025)**: SPD, Alliance 90/The Greens, FDP
- **Kabinett Merz (2025-2029)**: CDU/CSU, SPD

🔗 **[Live Interactive Dashboard](https://khalilhammod.github.io/Comparative-NLP-Analysis/)**

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

### Stage 3: Policy Stance Polarity Analysis
To resolve the ambiguity of raw text counts and misleading collocations for outsiders, we implement a sentence-level Policy Stance Polarity classifier. Using SpaCy token lemmas, we scan each sentence containing target policy terms and classify its framing into two contrasting ideological stances:
1. **Migration & Grenzkontrolle**: *Control & Enforcement* (border security, deportations) vs. *Humanitarian & Integration* (inclusion, refugee rights).
2. **Klimawende**: *Transformative & Ambitious* (ecological transition, renewables expansion) vs. *Market & Energiesicherheit* (economic viability, gas/coal security).
3. **Fiskalpolitik**: *Investment & Modernisierung* (public capital expansion) vs. *Haushaltsdisziplin & Entlastung* (debt brake compliance, tax relief).

This provides a transparent, quantifiable percentage breakdown of the governing cabinet's policy stance.

---

## 📈 Key Comparative Findings

- **Migration & Integration**: Overall migration policy density remains stable at around **30 matches per 10k words** in both agreements. However, Stage 3 stance polarity reveals a dramatic ideological shift: the Control & Enforcement stance rose from **28%** in 2021 to **37%** in 2025, while the Humanitarian & Integration stance fell from **72%** to **63%**.
- **Climate Transition & Environment**: Environmental policy density **halves** in 2025 (dropping from **90.14** to **46.15** per 10k words), indicating a clear political shift and a significant toning-down of green transformation initiatives.
- **Fiscal Policy**: Shows a strong increase (from **73.57** to **85.23** per 10k words), demonstrating the elevated priority of debt rules, fiscal consolidation, and structural investment frameworks.
