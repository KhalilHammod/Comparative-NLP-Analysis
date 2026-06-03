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
        'tragen', 'erreichen', 'schaffen', 'bringen', 'fortsetzen', 'schließen'
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
    total_words = len(text_lower.split())
    results = {}
    
    for concept, keywords in dictionary.items():
        count = 0
        matches = {}
        for kw in keywords:
            # Simple substring/word boundary count for stems
            kw_count = text_lower.count(kw)
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

def run_context_search(text, nlp, target_categories, window_size=5):
    # Perform semantic collocation search: neighboring ADJ/VERBs around target concepts
    doc = nlp(text)
    collocations = {cat: {} for cat in target_categories}
    allowed_pos = {"ADJ", "VERB"}
    
    try:
        german_stop = set(stopwords.words("german"))
    except LookupError:
        nltk.download("stopwords")
        german_stop = set(stopwords.words("german"))
        
    blacklist = {
        "müssen", "können", "sollen", "werden", "wollen", "haben", "geben", "stehen", "setzen", "bringen", "gehen", "sehen", "lassen", "kommen", "nehmen",
        "schaffen", "stärken", "fördern", "verbessern", "einsetzen", "umsetzen", "unterstützen", "sichern", "ausbauen", "erhöhen", "verringern", "anpassen",
        "fortführen", "weiterentwickeln", "fortsetzen", "regeln", "legen", "führen", "betreffen", "gehören", "gelten", "bleiben", "stellen", "liegen", "machen",
        "halten", "sein", "zusätzlich", "neu", "gut", "wichtig", "notwendig", "groß", "klein", "hoch", "niedrig", "stark", "schnell", "direkt", "indirekt",
        "gemeinsam", "einzeln", "verschieden", "allgemein", "breit", "eng", "klar", "deutlich", "weit", "nah", "möglich", "entsprechend", "beispielhaft",
        "insbesondere", "deutsch", "europäisch", "international", "national", "regional", "lokal", "kommunal", "global", "staatlich", "öffentlich",
        "deutschland", "sowie", "dabei", "dazu", "dafür"
    }
    custom_stops = german_stop.union(blacklist)
    
    for i, token in enumerate(doc):
        lemma = token.lemma_.lower()
        matched_cat = None
        for cat, checker in target_categories.items():
            if checker(lemma):
                matched_cat = cat
                break
        if matched_cat:
            # Look at a window of window_size tokens before and after
            start = max(0, i - window_size)
            end = min(len(doc), i + window_size + 1)
            
            for j in range(start, end):
                if j == i:
                    continue
                neighbor = doc[j]
                neighbor_lemma = neighbor.lemma_.lower()
                if neighbor.pos_ in allowed_pos and neighbor.is_alpha and neighbor_lemma not in custom_stops and len(neighbor_lemma) > 2:
                    collocations[matched_cat][neighbor_lemma] = collocations[matched_cat].get(neighbor_lemma, 0) + 1
                    
    # Format and sort top 5 neighbors for each concept
    formatted_results = {}
    for cat, neighbors in collocations.items():
        sorted_neighbors = sorted(neighbors.items(), key=lambda x: x[1], reverse=True)[:5]
        formatted_results[cat] = [{"word": n[0], "count": n[1]} for n in sorted_neighbors]
    return formatted_results

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
    
    # Stage 3: Semantic Context/Collocation Search
    print("Processing Stage 3: Semantic context analysis...")
    target_categories = {
        "migration_enforcement": lambda l: ("grenz" in l or "abschieb" in l or "rückführ" in l or "zurückweis" in l or "ausreise" in l) and not ("begrenz" in l or "wertgrenz" in l or "preisgrenz" in l or "altersgrenz" in l or "bagatellgrenz" in l or "minijobgrenz" in l or "grenzwert" in l or "kappungsgrenz" in l or "zuverdienstgrenze" in l),
        "klimaschutz": lambda l: "klima" in l or "energiewende" in l or "erneuerbar" in l,
        "investitionen": lambda l: "invest" in l or "schuldenbremse" in l,
        "digitalisierung": lambda l: "digital" in l or "bürokratieabbau" in l or "entbürokratisierung" in l or "bürokratierückbau" in l
    }
    colloc_results_2021 = run_context_search(text_2021, nlp, target_categories)
    colloc_results_2025 = run_context_search(text_2025, nlp, target_categories)
    
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
            contour_color="black"
        ).generate_from_frequencies(freq_2021)
        
        wc_2025 = WordCloud(
            width=800,
            height=800,
            background_color="white",
            mask=mask_image,
            contour_width=1,
            contour_color="black"
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
        "collocations": {
            "2021": colloc_results_2021,
            "2025": colloc_results_2025
        }
    }
    
    output_path = "coalition_words_data.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(structured_data, f, ensure_ascii=False, indent=2)
        
    print(f"Data successfully exported to {output_path}!")

if __name__ == "__main__":
    main()
