import os
import json
import PyPDF2
import nltk
from nltk.corpus import stopwords
from nltk.probability import FreqDist
import spacy

def extract_text_from_pdf(pdf_path):
    if not os.path.exists(pdf_path):
        print(f"File not found: {pdf_path}")
        return ""
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        return ''.join([page.extract_text() for page in reader.pages if page.extract_text()])

def clean_and_lemmatize(text, nlp):
    try:
        stop_words = set(stopwords.words("german"))
    except LookupError:
        nltk.download("stopwords")
        stop_words = set(stopwords.words("german"))
        
    # Strictly filter out bureaucratic/procedural filler words
    custom_stopwords = {
        'sowie', 'müssen', 'insbesondere', 'dazu', 'weiteren', 'weitere',
        'werden', 'können', 'soll', 'sollen', 'unserer', 'unsere', 'mehr', 'ab',
        'dafür', 'dabei', 'deshalb', 'beispiel', 'beim', 'ebene', 'besser',
        'jahr', 'jahren', 'rahmen', 'gelten', 'bereich', 'bereichen', 'weiterhin',
        'wichtig', 'land', 'setzen', 'schaffen', 'stärken', 'unterstützen',
        'fördern', 'ermöglichen', 'verbessern', 'stellen', 'nutzen', 'weiterentwickeln',
        'erhöhen', 'einsetzen', 'entwickeln', 'umsetzen', 'entsprechend', 'deutschland', 'deutsch',
        'bund', 'gemeinsam', 'bestehend', 'international', 'öffentlich', 'national', 'mensch',
        'menschen', 'stark', 'schnell', 'finanziell', 'wirtschaft', 'zusammenarbeit', 'sorgen',
        'ziel', 'ziele', 'maßnahme', 'maßnahmen', 'umsetzung', 'möglichkeit', 'möglichkeiten',
        'bundesregierung', 'aufgabe', 'aufgaben', 'leistung', 'leistungen', 'entwicklung',
        'stärkung', 'reform', 'reformen', 'bereich', 'bereiche', 'rahmen', 'ebene',
        'notwendig', 'zentral', 'wichtig', 'weitere', 'entsprechend', 'bestehend',
        'neu', 'schnell', 'fair', 'sichern', 'erleichtern', 'bleiben', 'schützen',
        'tragen', 'erreichen', 'schaffen', 'bringen', 'fortsetzen', 'schließen',
        # New additions to remove bureaucratic jargon and units of measurement
        'euro', 'prozent', 'blick', 'besonderer', 'grundlage', 'voraussetzung',
        'rahmenbedingung', 'einsatz', 'instrument', 'regelung', 'verfahren',
        'partner', 'gesetzlich', 'staatlich', 'politisch', 'unabhängig', 
        'standard', 'anreiz', 'klein', 'zugang', 'besonderen', 'besondere', 'voraussetzungen'
    }
    
    spacy_stopwords = nlp.Defaults.stop_words
    all_stopwords = stop_words.union(spacy_stopwords).union(custom_stopwords)
    
    doc = nlp(text)
    allowed_pos = {"NOUN", "ADJ", "PROPN"}
    
    lemmas = []
    for token in doc:
        if token.is_alpha and token.pos_ in allowed_pos:
            lemma = token.lemma_.lower()
            if lemma not in all_stopwords and len(lemma) > 3:
                if lemma == "digitalisierung":
                    lemma = "digital"
                lemmas.append(lemma)
    return lemmas

def run_dictionary_analysis(text, dictionary):
    # Analyze density of custom policy concepts
    text_lower = text.lower()
    # Normalize spacing
    text_clean = " ".join(text_lower.split())
    total_words = len(text_clean.split())
    results = {}
    
    for concept, keywords in dictionary.items():
        count = 0
        matches = {}
        for kw in keywords:
            if kw == "steuer":
                # Find all words containing 'steuer'
                import re
                all_matches = re.findall(r'\b\w*steuer\w*\b', text_clean)
                # Exclude steering-related terms
                excludes = ["steuerung", "steuernd", "gesteuert", "nachsteuern", "entgegensteuern", "wegsteuern", "steuerungswirkung"]
                filtered_matches = [w for w in all_matches if not any(ex in w for ex in excludes)]
                kw_count = len(filtered_matches)
                if kw_count > 0:
                    from collections import Counter
                    for w, c in Counter(filtered_matches).items():
                        matches[w] = c
                    count += kw_count
            else:
                # Simple substring/word boundary count for stems
                kw_count = text_clean.count(kw)
                if kw_count > 0:
                    matches[kw] = kw_count
                    count += kw_count
                
        # Normalize density per 10,000 words
        density = (count / total_words) * 10000 if total_words > 0 else 0
        results[concept] = {
            "count": count,
            "density": round(density, 2),
            "matches": matches
        }
    return results

def run_stance_analysis(text, nlp):
    # Perform sentence-level policy stance analysis
    doc = nlp(text)
    sentences = list(doc.sents)
    
    # Define check functions for token lemmas (no generic 'schutz' match)
    migration_control = lambda l: ('grenz' in l or 'abschieb' in l or 'rückführ' in l or 'zurückweis' in l or 'ausreise' in l or 'schleuser' in l or l == 'haft' or l == 'gewahrsam' or 'obergrenze' in l) and not ('begrenz' in l or 'wertgrenz' in l or 'preisgrenz' in l or 'altersgrenz' in l or 'bagatellgrenz' in l or 'minijobgrenz' in l or 'grenzwert' in l or 'kappungsgrenz' in l or 'zuverdienstgrenze' in l)
    migration_humanitarian = lambda l: 'integration' in l or 'aufnahme' in l or 'bleiberecht' in l or 'geflücht' in l or 'humanitär' in l or 'teilhabe' in l or 'spurwechsel' in l or 'asyl' in l or 'flüchtling' in l
    
    climate_transformative = lambda l: 'klimaneutral' in l or 'transformation' in l or 'energiewende' in l or 'erneuerbar' in l or 'windkraft' in l or 'solar' in l or 'dekarbonis' in l or 'kohleausstieg' in l or 'ausbau' in l or 'ambitioniert' in l
    climate_market = lambda l: 'versorgungssicherheit' in l or 'wirtschaftlichkeit' in l or 'marktwirtschaftlich' in l or 'technologieoffen' in l or 'strompreis' in l or 'industrie' in l or 'stabilität' in l or 'gas' in l or 'wasserstoff' in l
    
    fiscal_investment = lambda l: 'investition' in l or 'zukunftsinvestition' in l or 'modernisierung' in l or 'sondervermögen' in l or 'infrastruktur' in l or 'förderung' in l
    fiscal_discipline = lambda l: 'schuldenbremse' in l or 'konsolidierung' in l or 'haushalt' in l or 'disziplin' in l or 'steuersenkung' in l or 'steuerentlastung' in l or 'abbau' in l or 'entlastung' in l
    
    # New Stance Lambdas
    foreign_diplomacy = lambda l: any(x in l for x in ['diplomat', 'abrüst', 'entwicklungszusammenarbeit', 'fried', 'multilateral', 'zivil', 'verhandlung'])
    foreign_defense = lambda l: any(x in l for x in ['bundeswehr', 'nato', 'rüst', 'verteidig', 'abschreckung', 'streitkräfte'])
    
    digital_infra = lambda l: any(x in l for x in ['digital', 'online', 'netz', 'breitband', 'glasfaser', 'daten', 'portal'])
    digital_debureaucracy = lambda l: any(x in l for x in ['bürokratie', 'entbürokrat', 'planungsbeschleunigung', 'abbau', 'vereinfach', 'beschleunigung'])
    
    results = {
        "migration": {"control": 0, "humanitarian": 0},
        "climate": {"transformative": 0, "market_pragmatic": 0},
        "fiscal": {"investment": 0, "discipline": 0},
        "foreign": {"diplomacy": 0, "defense": 0},
        "digital": {"infra": 0, "debureaucracy": 0}
    }
    
    for sent in sentences:
        c_score, h_score = 0, 0
        t_score, m_score = 0, 0
        i_score, d_score = 0, 0
        dipl_score, def_score = 0, 0
        infra_score, debur_score = 0, 0
        
        for token in sent:
            l = token.lemma_.lower()
            if migration_control(l):
                c_score += 1
            if migration_humanitarian(l):
                h_score += 1
            if climate_transformative(l):
                t_score += 1
            if climate_market(l):
                m_score += 1
            if fiscal_investment(l):
                i_score += 1
            if fiscal_discipline(l):
                d_score += 1
            if foreign_diplomacy(l):
                dipl_score += 1
            if foreign_defense(l):
                def_score += 1
            if digital_infra(l):
                infra_score += 1
            if digital_debureaucracy(l):
                debur_score += 1
                
        if c_score > h_score:
            results["migration"]["control"] += 1
        elif h_score > c_score:
            results["migration"]["humanitarian"] += 1
            
        if t_score > m_score:
            results["climate"]["transformative"] += 1
        elif m_score > t_score:
            results["climate"]["market_pragmatic"] += 1
            
        if i_score > d_score:
            results["fiscal"]["investment"] += 1
        elif d_score > i_score:
            results["fiscal"]["discipline"] += 1
            
        if dipl_score > def_score:
            results["foreign"]["diplomacy"] += 1
        elif def_score > dipl_score:
            results["foreign"]["defense"] += 1
            
        if infra_score > debur_score:
            results["digital"]["infra"] += 1
        elif debur_score > infra_score:
            results["digital"]["debureaucracy"] += 1
            
    return results

def main():
    print("Loading SpaCy German model...")
    nlp = spacy.load("de_core_news_sm")
    
    # Load Policy Dictionary
    with open("policy_dictionary.json", "r", encoding="utf-8") as f:
        dictionary = json.load(f)
        
    pdf_2021 = "Koalitionsvertrag_2021-2025.pdf"
    pdf_2025 = "Koalitionsvertrag-2025.pdf"
    
    print(f"Reading 2021 Agreement from {pdf_2021}...")
    text_2021 = extract_text_from_pdf(pdf_2021)
    
    print(f"Reading 2025 Agreement from {pdf_2025}...")
    text_2025 = extract_text_from_pdf(pdf_2025)
    
    # Stage 1: Exploratory analysis (word frequencies & clouds)
    print("Processing Stage 1: Exploratory analysis...")
    lemmas_2021 = clean_and_lemmatize(text_2021, nlp)
    freq_2021 = dict(FreqDist(lemmas_2021).most_common(50))
    
    lemmas_2025 = clean_and_lemmatize(text_2025, nlp)
    freq_2025 = dict(FreqDist(lemmas_2025).most_common(50))
    
    # Stage 2: Dictionary policy analysis
    print("Processing Stage 2: Dictionary analysis...")
    dict_results_2021 = run_dictionary_analysis(text_2021, dictionary)
    dict_results_2025 = run_dictionary_analysis(text_2025, dictionary)
    
    # Stage 3: Policy Stance analysis
    print("Processing Stage 3: Policy stance analysis...")
    stance_results_2021 = run_stance_analysis(text_2021, nlp)
    stance_results_2025 = run_stance_analysis(text_2025, nlp)
    
    # Renders and saves comparative Germany-masked word clouds
    print("Generating Germany-masked word clouds...")
    from PIL import Image
    import numpy as np
    from wordcloud import WordCloud
    
    try:
        mask_image = np.array(Image.open("g.png"))
        
        wc_2021 = WordCloud(
            width=800,
            height=800,
            background_color="white",
            mask=mask_image,
            contour_width=1,
            contour_color="black",
            prefer_horizontal=1.0
        ).generate_from_frequencies(freq_2021)
        
        wc_2025 = WordCloud(
            width=800,
            height=800,
            background_color="white",
            mask=mask_image,
            contour_width=1,
            contour_color="black",
            prefer_horizontal=1.0
        ).generate_from_frequencies(freq_2025)
        
        wc_2021.to_file("output_2021.png")
        wc_2025.to_file("output_2025.png")
        print("Germany-masked word clouds successfully exported!")
    except Exception as e:
        print(f"Error generating masked word clouds: {e}")
        
    # Export all structured data to JSON
    structured_data = {
        "exploratory": {
            "2021": [{"word": word, "count": count} for word, count in freq_2021.items()],
            "2025": [{"word": word, "count": count} for word, count in freq_2025.items()]
        },
        "dictionary": {
            "2021": dict_results_2021,
            "2025": dict_results_2025
        },
        "stances": {
            "2021": stance_results_2021,
            "2025": stance_results_2025
        }
    }
    
    output_path = "coalition_words_data.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(structured_data, f, ensure_ascii=False, indent=2)
        
    print(f"Data successfully exported to {output_path}!")

if __name__ == "__main__":
    main()
