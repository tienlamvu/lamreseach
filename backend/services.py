import re
import html
import urllib.parse
import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "MatSciPhDHub/1.0 (Academic Research Manager; mailto:research@matsci-hub.org)",
    "Accept": "application/json",
}

SCHOLAR_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}


def clean_doi(raw_input: str) -> str:
    """Extract clean DOI string from URL or prefixed string."""
    s = raw_input.strip()
    s = re.sub(r"^https?://(dx\.)?doi\.org/", "", s, flags=re.IGNORECASE)
    s = re.sub(r"^doi:\s*", "", s, flags=re.IGNORECASE)
    # Match standard DOI pattern 10.xxxx/...
    match = re.search(r"(10\.\d{4,9}/[-._;()/:A-Za-z0-9]+)", s)
    if match:
        return match.group(1).rstrip(".")
    return s


def strip_xml_tags(text: str) -> str:
    if not text:
        return ""
    cleaned = re.sub(r"<[^>]+>", " ", text)
    cleaned = html.unescape(cleaned)
    return re.sub(r"\s+", " ", cleaned).strip()


def auto_detect_matsci_metadata(title: str, abstract: str) -> dict:
    """Heuristically extract Material Systems, Synthesis Method, and Characterizations from paper text."""
    combined = f"{title} {abstract}"
    combined_lower = combined.lower()

    # 1. Detect Characterization Techniques
    char_keywords = {
        "XRD": ["x-ray diffraction", "xrd", "rietveld", "synchrotron x-ray"],
        "SEM": ["scanning electron microscop", "sem", "fe-sem", "fesem", "eds", "edx"],
        "TEM": ["transmission electron microscop", "tem", "hr-tem", "hrtem", "stem", "saed"],
        "XPS": ["x-ray photoelectron", "xps", "core-level spectra"],
        "Raman": ["raman spectroscop", "raman scattering", "raman shift"],
        "FTIR": ["fourier transform infrared", "ftir", "ft-ir", "infrared spectroscop"],
        "AFM": ["atomic force microscop", "afm", "kelvin probe"],
        "EIS": ["electrochemical impedance", "eis", "nyquist", "ionic conductivity"],
        "Cyclic Voltammetry": ["cyclic voltammetry", "cv curve", "galvanostatic"],
        "UV-Vis": ["uv-vis", "ultraviolet-visible", "tauc plot", "bandgap", "photoluminescence", "pl spectra"],
        "BET": ["brunauer-emmett-teller", "bet surface area", "n2 adsorption", "pore size"],
        "DFT": ["density functional theory", "dft", "first-principles", "vasp", "ab initio"],
        "TGA/DSC": ["thermogravimetric", "tga", "differential scanning calorimetry", "dsc"],
        "NMR": ["nuclear magnetic resonance", "solid-state nmr", "mas nmr"],
        "ICP": ["icp-oes", "icp-ms", "inductively coupled plasma"],
    }
    detected_chars = []
    for tag, patterns in char_keywords.items():
        if any(p in combined_lower for p in patterns):
            detected_chars.append(tag)

    # 2. Detect Synthesis Method
    synth_keywords = {
        "Solid-State Reaction": ["solid-state reaction", "solid state reaction", "calcination", "sintering", "solid-state sintering"],
        "Hydrothermal / Solvothermal": ["hydrothermal", "solvothermal", "autoclave"],
        "Sol-Gel": ["sol-gel", "sol–gel", "pechini"],
        "Chemical Vapor Deposition (CVD)": ["chemical vapor deposition", "cvd", "pecvd", "mocvd"],
        "Atomic Layer Deposition (ALD)": ["atomic layer deposition", "ald"],
        "Wet Chemical / Etching": ["chemical etching", "wet etching", "co-precipitation", "coprecipitation"],
        "Ball Milling": ["ball milling", "mechanochemical", "high-energy milling"],
        "Spin Coating": ["spin-coating", "spin coating", "solution processing"],
        "Physical Vapor Deposition / Sputtering": ["magnetron sputtering", "pulsed laser deposition", "pld", "e-beam evaporation"],
        "Electrospinning": ["electrospinning", "electrospun"],
        "Mechanical Exfoliation": ["mechanical exfoliation", "scotch-tape", "liquid-phase exfoliation"],
        "DFT / Computational Modeling": ["density functional theory", "first-principles calculation", "molecular dynamics"],
    }
    detected_synth = ""
    for method, patterns in synth_keywords.items():
        if any(p in combined_lower for p in patterns):
            detected_synth = method
            break

    # 3. Detect Material System / Formula
    mat_candidates = []
    # Match common inorganic formulas like Li7La3Zr2O12, Ti3C2Tx, MoS2, LiFePO4, BaTiO3, CsPbBr3, Al2O3, TiO2, etc.
    formula_matches = re.findall(
        r"\b(?:[A-Z][a-z]?\d*(?:\.\d+)?){2,6}(?:T_?x|O_?\d*|[A-Z][a-z]?\d*)*\b",
        combined
    )
    blacklist = {"PhD", "USA", "DNA", "RNA", "LED", "FET", "TFT", " NMR", "XRD", "SEM", "TEM", "XPS", "CVD", "ALD", "DFT", "BET", "EIS"}
    for fm in formula_matches:
        if fm not in blacklist and any(c.isdigit() for c in fm) and len(fm) >= 3:
            if fm not in mat_candidates:
                mat_candidates.append(fm)

    # Named material families
    named_materials = [
        ("Perovskite", "Perovskite"),
        ("MXene", "MXene (Ti3C2Tx)"),
        ("Graphene", "Graphene / rGO"),
        ("Garnet", "Garnet Solid Electrolyte"),
        ("LLZO", "LLZO (Li7La3Zr2O12)"),
        ("MOF", "Metal-Organic Framework (MOF)"),
        ("High-Entropy Alloy", "High-Entropy Alloy (HEA)"),
        ("Zeolite", "Zeolite"),
        ("Carbon Nanotube", "CNT"),
        ("Quantum Dot", "Quantum Dots"),
    ]
    for kw, label in named_materials:
        if kw.lower() in combined_lower and label not in mat_candidates:
            mat_candidates.append(label)

    material_system = ", ".join(mat_candidates[:3]) if mat_candidates else "Advanced Functional Material"
    return {
        "material_system": material_system,
        "synthesis_method": detected_synth or "Experimental / Characterization",
        "characterization_tags": ", ".join(detected_chars) if detected_chars else "XRD, SEM",
    }


def generate_bibtex(doi: str, title: str, authors_list: list, journal: str, year: int, volume: str, pages: str) -> str:
    first_author = "Author"
    if authors_list:
        last_part = authors_list[0].split()[-1]
        first_author = re.sub(r"[^A-Za-z]", "", last_part) or "Author"
    first_word = re.sub(r"[^A-Za-z]", "", (title or "Paper").split()[0])
    cite_key = f"{first_author}{year or 2026}{first_word}"
    author_bibtex = " and ".join(authors_list) if authors_list else "Unknown"

    lines = [f"@article{{{cite_key},"]
    lines.append(f"  title = {{{title}}},")
    lines.append(f"  author = {{{author_bibtex}}},")
    if journal:
        lines.append(f"  journal = {{{journal}}},")
    if year:
        lines.append(f"  year = {{{year}}},")
    if volume:
        lines.append(f"  volume = {{{volume}}},")
    if pages:
        lines.append(f"  pages = {{{pages}}},")
    if doi:
        lines.append(f"  doi = {{{doi}}}")
    lines.append("}")
    return "\n".join(lines)


def fetch_doi_metadata(raw_doi: str) -> dict:
    """Fetch complete paper metadata from Crossref + OpenAlex/Semantic Scholar fallback."""
    doi = clean_doi(raw_doi)
    if not doi:
        raise ValueError("Please provide a valid DOI string or URL.")

    encoded_doi = urllib.parse.quote(doi, safe="")
    crossref_url = f"https://api.crossref.org/works/{encoded_doi}"

    title = ""
    authors_list = []
    journal = ""
    year = None
    volume = ""
    issue = ""
    pages = ""
    abstract = ""
    url = f"https://doi.org/{doi}"
    pdf_url = ""
    citation_count = 0

    # 1. Query Crossref API
    try:
        resp = requests.get(crossref_url, headers=HEADERS, timeout=10)
        if resp.status_code == 200:
            msg = resp.json().get("message", {})
            titles = msg.get("title", [])
            title = titles[0] if titles else ""

            for a in msg.get("author", []):
                given = a.get("given", "")
                family = a.get("family", "")
                full = f"{given} {family}".strip() or a.get("name", "")
                if full:
                    authors_list.append(full)

            containers = msg.get("container-title", [])
            journal = containers[0] if containers else msg.get("publisher", "")

            # Extract publication year
            for date_field in ["published-print", "published-online", "issued", "created"]:
                date_parts = msg.get(date_field, {}).get("date-parts", [[]])
                if date_parts and date_parts[0]:
                    year = int(date_parts[0][0])
                    break

            volume = str(msg.get("volume", "") or "")
            issue = str(msg.get("issue", "") or "")
            pages = str(msg.get("page", "") or msg.get("article-number", "") or "")
            abstract = strip_xml_tags(msg.get("abstract", ""))
            citation_count = int(msg.get("is-referenced-by-count", 0) or 0)

            for link in msg.get("link", []):
                if "pdf" in (link.get("content-type", "") or "").lower():
                    pdf_url = link.get("URL", "")
                    break
    except Exception:
        pass

    # 2. Enrich with OpenAlex if abstract is missing or title wasn't found
    if not title or not abstract:
        try:
            oa_url = f"https://api.openalex.org/works/https://doi.org/{doi}"
            oa_resp = requests.get(oa_url, headers=HEADERS, timeout=8)
            if oa_resp.status_code == 200:
                oa = oa_resp.json()
                if not title:
                    title = oa.get("title", "")
                if not year:
                    year = oa.get("publication_year")
                if not citation_count:
                    citation_count = oa.get("cited_by_count", 0)
                if not journal:
                    loc = oa.get("primary_location") or {}
                    src = loc.get("source") or {}
                    journal = src.get("display_name", "")
                if not pdf_url:
                    oa_info = oa.get("open_access") or {}
                    pdf_url = oa_info.get("oa_url") or ""
                if not authors_list:
                    for auth in oa.get("authorships", []):
                        name = (auth.get("author") or {}).get("display_name")
                        if name:
                            authors_list.append(name)
                if not abstract and oa.get("abstract_inverted_index"):
                    inv = oa["abstract_inverted_index"]
                    word_positions = []
                    for word, positions in inv.items():
                        for pos in positions:
                            word_positions.append((pos, word))
                    word_positions.sort(key=lambda x: x[0])
                    abstract = " ".join(w for _, w in word_positions)
        except Exception:
            pass

    # 3. Fallback to Semantic Scholar if still missing title/abstract
    if not title or not abstract:
        try:
            s2_url = f"https://api.semanticscholar.org/graph/v1/paper/DOI:{doi}?fields=title,abstract,citationCount,openAccessPdf,year,venue,authors"
            s2_resp = requests.get(s2_url, headers=HEADERS, timeout=8)
            if s2_resp.status_code == 200:
                s2 = s2_resp.json()
                if not title:
                    title = s2.get("title", "")
                if not abstract:
                    abstract = s2.get("abstract") or ""
                if not year:
                    year = s2.get("year")
                if not journal:
                    journal = s2.get("venue") or ""
                if not citation_count:
                    citation_count = s2.get("citationCount") or 0
                if not pdf_url and s2.get("openAccessPdf"):
                    pdf_url = s2["openAccessPdf"].get("url") or ""
                if not authors_list and s2.get("authors"):
                    authors_list = [a.get("name", "") for a in s2["authors"] if a.get("name")]
        except Exception:
            pass

    if not title:
        raise ValueError(f"Could not resolve metadata for DOI '{doi}'. Please check the DOI or enter details manually.")

    matsci_meta = auto_detect_matsci_metadata(title, abstract)
    bibtex = generate_bibtex(doi, title, authors_list, journal, year, volume, pages)

    authors_display = ", ".join(authors_list[:6])
    if len(authors_list) > 6:
        authors_display += " et al."

    return {
        "doi": doi,
        "title": title,
        "authors": authors_display or "Unknown Authors",
        "journal": journal or "Academic Journal",
        "year": year or 2026,
        "volume": volume,
        "issue": issue,
        "pages": pages,
        "abstract": abstract or "No abstract available from publisher metadata.",
        "url": url,
        "pdf_url": pdf_url,
        "citation_count": citation_count,
        "material_system": matsci_meta["material_system"],
        "synthesis_method": matsci_meta["synthesis_method"],
        "characterization_tags": matsci_meta["characterization_tags"],
        "bibtex": bibtex,
    }



KNOWN_COAUTHORS_MAP = {
    "D. Lee": "Daekwon Lee",
    "Lee, D.": "Daekwon Lee",
    "Lee Daekwon": "Daekwon Lee",
    "Daekwon Lee": "Daekwon Lee",
    "L. Daekwon": "Daekwon Lee",
    "Daekwon, L.": "Daekwon Lee",
    "Dang, B.T.": "Dang Ba Tung",
    "Ba Tung Dang": "Dang Ba Tung",
    "B. T. Dang": "Dang Ba Tung",
    "D. B. Tung": "Dang Ba Tung",
    "Tung, D. B.": "Dang Ba Tung",
    "Tung, D.B.": "Dang Ba Tung",
    "Dang Ba Tung": "Dang Ba Tung",
    "Dang, B. T.": "Dang Ba Tung",
    "D.B. Tung": "Dang Ba Tung",
    "B.T. Dang": "Dang Ba Tung",
    "Duc Dung Dang": "Dang Duc Dung",
    "Dang, D. D.": "Dang Duc Dung",
    "D. D. Dung": "Dang Duc Dung",
    "D. D. Dang": "Dang Duc Dung",
    "Dung, D.D.": "Dang Duc Dung",
    "Dang Duc Dung": "Dang Duc Dung",
    "D.D. Dang": "Dang Duc Dung",
    "Dang, D.D.": "Dang Duc Dung",
    "D.D. Dung": "Dang Duc Dung",
    "Dung, D. D.": "Dang Duc Dung",
    "D.T. Do": "Do Duc Tho",
    "Tho, D. D.": "Do Duc Tho",
    "Do Duc Tho": "Do Duc Tho",
    "D. D. Tho": "Do Duc Tho",
    "Duc Tho Do": "Do Duc Tho",
    "D.D. Tho": "Do Duc Tho",
    "Do, D. T.": "Do Duc Tho",
    "D. T. Do": "Do Duc Tho",
    "Tho, D.D.": "Do Duc Tho",
    "Do, D.T.": "Do Duc Tho",
    "Odkhuu Dorj": "Dorj Odkhuu",
    "Dorj, O.": "Dorj Odkhuu",
    "D. Odkhuu": "Dorj Odkhuu",
    "Dorj Odkhuu": "Dorj Odkhuu",
    "Odkhuu, D.": "Dorj Odkhuu",
    "O. Dorj": "Dorj Odkhuu",
    "Duc, D. D.": "Dang Duc Dung",
    "Dung Dang Duc": "Dang Duc Dung",
    "D. D. Duc": "Dang Duc Dung",
    "D.D. Duc": "Dang Duc Dung",
    "Duc, D.D.": "Dang Duc Dung",
    "Duong, Q. V.": "Duong Quoc Van",
    "Duong, Q.V.": "Duong Quoc Van",
    "Duong Quoc Van": "Duong Quoc Van",
    "D. Q. Van": "Duong Quoc Van",
    "Quoc Van Duong": "Duong Quoc Van",
    "D.Q. Van": "Duong Quoc Van",
    "Q. V. Duong": "Duong Quoc Van",
    "Q.V. Duong": "Duong Quoc Van",
    "Van, D. Q.": "Duong Quoc Van",
    "Van, D.Q.": "Duong Quoc Van",
    "Thiet, D.V.": "Duong Van Thiet",
    "Duong, V. T.": "Duong Van Thiet",
    "D. V. Thiet": "Duong Van Thiet",
    "V.T. Duong": "Duong Van Thiet",
    "Van Thiet Duong": "Duong Van Thiet",
    "D.V. Thiet": "Duong Van Thiet",
    "V. T. Duong": "Duong Van Thiet",
    "Duong Van Thiet": "Duong Van Thiet",
    "Duong, V.T.": "Duong Van Thiet",
    "Thiet, D. V.": "Duong Van Thiet",
    "Gul, H. Z.": "Hamza Zad Gul",
    "Z.G. Hamza": "Hamza Zad Gul",
    "Zad Gul Hamza": "Hamza Zad Gul",
    "H.Z. Gul": "Hamza Zad Gul",
    "Hamza Zad Gul": "Hamza Zad Gul",
    "H. Z. Gul": "Hamza Zad Gul",
    "Gul, H.Z.": "Hamza Zad Gul",
    "Hamza, Z. G.": "Hamza Zad Gul",
    "Hamza, Z.G.": "Hamza Zad Gul",
    "Z. G. Hamza": "Hamza Zad Gul",
    "Sik Kim Hang": "Hang Sik Kim",
    "S. K. Hang": "Hang Sik Kim",
    "Kim, H. S.": "Hang Sik Kim",
    "Hang, S. K.": "Hang Sik Kim",
    "Hang, S.K.": "Hang Sik Kim",
    "Kim, H.S.": "Hang Sik Kim",
    "H.S. Kim": "Hang Sik Kim",
    "H. S. Kim": "Hang Sik Kim",
    "Hang Sik Kim": "Hang Sik Kim",
    "S.K. Hang": "Hang Sik Kim",
    "Rho Heesuk": "Heesuk Rho",
    "Heesuk, R.": "Heesuk Rho",
    "H. Rho": "Heesuk Rho",
    "Rho, H.": "Heesuk Rho",
    "R. Heesuk": "Heesuk Rho",
    "Heesuk Rho": "Heesuk Rho",
    "Nguyen, H. L.": "Nguyen Huu Lam",
    "Lam Nguyen Huu": "Nguyen Huu Lam",
    "Nguyen, H.L.": "Nguyen Huu Lam",
    "Huu Lam Nguyen": "Nguyen Huu Lam",
    "H.L. Nguyen": "Nguyen Huu Lam",
    "L. N. Huu": "Nguyen Huu Lam",
    "Huu, L.N.": "Nguyen Huu Lam",
    "H. L. Nguyen": "Nguyen Huu Lam",
    "Huu, L. N.": "Nguyen Huu Lam",
    "L.N. Huu": "Nguyen Huu Lam",
    "Pal Singh Jitendra": "Jitendra Pal Singh",
    "Jitendra, P.S.": "Jitendra Pal Singh",
    "J.P. Singh": "Jitendra Pal Singh",
    "P. S. Jitendra": "Jitendra Pal Singh",
    "J. P. Singh": "Jitendra Pal Singh",
    "Singh, J.P.": "Jitendra Pal Singh",
    "Jitendra, P. S.": "Jitendra Pal Singh",
    "Jitendra Pal Singh": "Jitendra Pal Singh",
    "P.S. Jitendra": "Jitendra Pal Singh",
    "Singh, J. P.": "Jitendra Pal Singh",
    "K. K. Ki": "Ki Kang Kim",
    "Kim, K. K.": "Ki Kang Kim",
    "K.K. Ki": "Ki Kang Kim",
    "Kim, K.K.": "Ki Kang Kim",
    "K.K. Kim": "Ki Kang Kim",
    "Ki, K.K.": "Ki Kang Kim",
    "Ki, K. K.": "Ki Kang Kim",
    "Kang Kim Ki": "Ki Kang Kim",
    "Ki Kang Kim": "Ki Kang Kim",
    "K. K. Kim": "Ki Kang Kim",
    "H. D. Luong": "Luong Hong Dang",
    "Luong Hong Dang": "Luong Hong Dang",
    "Dang, L.H.": "Luong Hong Dang",
    "Dang, L. H.": "Luong Hong Dang",
    "L.H. Dang": "Luong Hong Dang",
    "Luong, H.D.": "Luong Hong Dang",
    "H.D. Luong": "Luong Hong Dang",
    "Luong, H. D.": "Luong Hong Dang",
    "Hong Dang Luong": "Luong Hong Dang",
    "L. H. Dang": "Luong Hong Dang",
    "L. T. K. Phuong": "Luong Thi Kim Phuong",
    "Phuong, L. T. K.": "Luong Thi Kim Phuong",
    "Luong, T.K.P.": "Luong Thi Kim Phuong",
    "Luong, T. K. P.": "Luong Thi Kim Phuong",
    "Luong Thi Kim Phuong": "Luong Thi Kim Phuong",
    "Phuong, L.T.K.": "Luong Thi Kim Phuong",
    "L.T.K. Phuong": "Luong Thi Kim Phuong",
    "T.K.P. Luong": "Luong Thi Kim Phuong",
    "T. K. P. Luong": "Luong Thi Kim Phuong",
    "Thi Kim Phuong Luong": "Luong Thi Kim Phuong",
    "Hue, M.M.": "Man Minh Hue",
    "Man Minh Hue": "Man Minh Hue",
    "M. H. Man": "Man Minh Hue",
    "M.M. Hue": "Man Minh Hue",
    "Man, M. H.": "Man Minh Hue",
    "Hue, M. M.": "Man Minh Hue",
    "Minh Hue Man": "Man Minh Hue",
    "M.H. Man": "Man Minh Hue",
    "M. M. Hue": "Man Minh Hue",
    "Man, M.H.": "Man Minh Hue",
    "Nguyen, M.C.": "Minh Chien Nguyen",
    "M. C. Nguyen": "Minh Chien Nguyen",
    "Chien Nguyen Minh": "Minh Chien Nguyen",
    "Nguyen, M. C.": "Minh Chien Nguyen",
    "Minh, C. N.": "Minh Chien Nguyen",
    "Minh Chien Nguyen": "Minh Chien Nguyen",
    "Minh, C.N.": "Minh Chien Nguyen",
    "M.C. Nguyen": "Minh Chien Nguyen",
    "C. N. Minh": "Minh Chien Nguyen",
    "C.N. Minh": "Minh Chien Nguyen",
    "Kim Minjeong": "Minjeong Kim",
    "M. Kim": "Minjeong Kim",
    "Minjeong, K.": "Minjeong Kim",
    "K. Minjeong": "Minjeong Kim",
    "Kim, M.": "Minjeong Kim",
    "Minjeong Kim": "Minjeong Kim",
    "D.Q. Ngo": "Ngo Duc Quan",
    "Duc Quan Ngo": "Ngo Duc Quan",
    "Ngo Duc Quan": "Ngo Duc Quan",
    "D. Q. Ngo": "Ngo Duc Quan",
    "Quan, N. D.": "Ngo Duc Quan",
    "Quan, N.D.": "Ngo Duc Quan",
    "N.D. Quan": "Ngo Duc Quan",
    "Ngo, D. Q.": "Ngo Duc Quan",
    "N. D. Quan": "Ngo Duc Quan",
    "Ngo, D.Q.": "Ngo Duc Quan",
    "Ngan, N.H.": "Ngo Huyen Ngan",
    "H. N. Ngo": "Ngo Huyen Ngan",
    "N. H. Ngan": "Ngo Huyen Ngan",
    "Ngo, H. N.": "Ngo Huyen Ngan",
    "H.N. Ngo": "Ngo Huyen Ngan",
    "Huyen Ngan Ngo": "Ngo Huyen Ngan",
    "Ngo, H.N.": "Ngo Huyen Ngan",
    "Ngo Huyen Ngan": "Ngo Huyen Ngan",
    "Ngan, N. H.": "Ngo Huyen Ngan",
    "N.H. Ngan": "Ngo Huyen Ngan",
    "Ngoc, T. D.": "Ngoc Thanh Duong",
    "T.D. Ngoc": "Ngoc Thanh Duong",
    "T. D. Ngoc": "Ngoc Thanh Duong",
    "Ngoc Thanh Duong": "Ngoc Thanh Duong",
    "Ngoc, T.D.": "Ngoc Thanh Duong",
    "Duong, N.T.": "Ngoc Thanh Duong",
    "Duong, N. T.": "Ngoc Thanh Duong",
    "N.T. Duong": "Ngoc Thanh Duong",
    "Thanh Duong Ngoc": "Ngoc Thanh Duong",
    "N. T. Duong": "Ngoc Thanh Duong",
    "Linh, N.H.": "Nguyen Hoang Linh",
    "N. H. Linh": "Nguyen Hoang Linh",
    "Nguyen Hoang Linh": "Nguyen Hoang Linh",
    "Hoang Linh Nguyen": "Nguyen Hoang Linh",
    "N.H. Linh": "Nguyen Hoang Linh",
    "Linh, N. H.": "Nguyen Hoang Linh",
    "Nguyen, H. T.": "Nguyen Hoang Tuan",
    "N. H. Thoan": "Nguyen Hoang Thoan",
    "Hoang Thoan Nguyen": "Nguyen Hoang Thoan",
    "Thoan, N.H.": "Nguyen Hoang Thoan",
    "H. T. Nguyen": "Nguyen Hoang Tuan",
    "N.H. Thoan": "Nguyen Hoang Thoan",
    "Nguyen Hoang Thoan": "Nguyen Hoang Thoan",
    "Thoan, N. H.": "Nguyen Hoang Thoan",
    "Nguyen, H.T.": "Nguyen Hoang Tuan",
    "H.T. Nguyen": "Nguyen Hoang Tuan",
    "N. H. Tuan": "Nguyen Hoang Tuan",
    "N.H. Tuan": "Nguyen Hoang Tuan",
    "Nguyen Hoang Tuan": "Nguyen Hoang Tuan",
    "Tuan, N. H.": "Nguyen Hoang Tuan",
    "Tuan, N.H.": "Nguyen Hoang Tuan",
    "Hoang Tuan Nguyen": "Nguyen Hoang Tuan",
    "Lam, N.H.": "Nguyen Huu Lam",
    "Nguyen Huu Lam": "Nguyen Huu Lam",
    "Lam, N. H.": "Nguyen Huu Lam",
    "N. H. Lam": "Nguyen Huu Lam",
    "N.H. Lam": "Nguyen Huu Lam",
    "Nguyen, M.Q.": "Nguyen Minh Quan",
    "Minh Quan Nguyen": "Nguyen Minh Quan",
    "N. M. Quan": "Nguyen Minh Quan",
    "M. Q. Nguyen": "Nguyen Minh Quan",
    "Quan, N. M.": "Nguyen Minh Quan",
    "Nguyen, M. Q.": "Nguyen Minh Quan",
    "Quan, N.M.": "Nguyen Minh Quan",
    "N.M. Quan": "Nguyen Minh Quan",
    "Nguyen Minh Quan": "Nguyen Minh Quan",
    "M.Q. Nguyen": "Nguyen Minh Quan",
    "Trung, N.N.": "Nguyen Ngoc Trung",
    "Nguyen, N. T.": "Nguyen Ngoc Trung",
    "N. T. Nguyen": "Nguyen Ngoc Trung",
    "Trung, N. N.": "Nguyen Ngoc Trung",
    "N.N. Trung": "Nguyen Ngoc Trung",
    "N.T. Nguyen": "Nguyen Ngoc Trung",
    "N. N. Trung": "Nguyen Ngoc Trung",
    "Nguyen Ngoc Trung": "Nguyen Ngoc Trung",
    "Nguyen, N.T.": "Nguyen Ngoc Trung",
    "Ngoc Trung Nguyen": "Nguyen Ngoc Trung",
    "Nguyen, Q.D.": "Nguyen Quoc Dung",
    "Quoc Dung Nguyen": "Nguyen Quoc Dung",
    "N.Q. Dung": "Nguyen Quoc Dung",
    "Q.D. Nguyen": "Nguyen Quoc Dung",
    "Dung, N. Q.": "Nguyen Quoc Dung",
    "N. Q. Dung": "Nguyen Quoc Dung",
    "Nguyen Quoc Dung": "Nguyen Quoc Dung",
    "Nguyen, Q. D.": "Nguyen Quoc Dung",
    "Dung, N.Q.": "Nguyen Quoc Dung",
    "Q. D. Nguyen": "Nguyen Quoc Dung",
    "Nguyen, T. T. T.": "Nguyen Thi Thu Trang",
    "Trang, N.T.T.": "Nguyen Thi Thu Trang",
    "N.T.T. Trang": "Nguyen Thi Thu Trang",
    "T.T.T. Nguyen": "Nguyen Thi Thu Trang",
    "N. T. T. Trang": "Nguyen Thi Thu Trang",
    "Nguyen Thi Thu Trang": "Nguyen Thi Thu Trang",
    "Nguyen, T.T.T.": "Nguyen Thi Thu Trang",
    "Trang, N. T. T.": "Nguyen Thi Thu Trang",
    "Thi Thu Trang Nguyen": "Nguyen Thi Thu Trang",
    "T. T. T. Nguyen": "Nguyen Thi Thu Trang",
    "Thi Trang Nguyen": "Nguyen Thi Trang",
    "N.T. Trang": "Nguyen Thi Trang",
    "Trang, N. T.": "Nguyen Thi Trang",
    "Nguyen, T. T.": "Nguyen Thi Trang",
    "Nguyen, T.T.": "Nguyen Thi Trang",
    "Nguyen Thi Trang": "Nguyen Thi Trang",
    "N. T. Trang": "Nguyen Thi Trang",
    "Trang, N.T.": "Nguyen Thi Trang",
    "T.T. Nguyen": "Nguyen Thi Trang",
    "T. T. Nguyen": "Nguyen Thi Trang",
    "Pham, D. L.": "Pham Dinh Luong",
    "Luong, P. D.": "Pham Dinh Luong",
    "D.L. Pham": "Pham Dinh Luong",
    "P.D. Luong": "Pham Dinh Luong",
    "Luong, P.D.": "Pham Dinh Luong",
    "Pham Dinh Luong": "Pham Dinh Luong",
    "Pham, D.L.": "Pham Dinh Luong",
    "Dinh Luong Pham": "Pham Dinh Luong",
    "P. D. Luong": "Pham Dinh Luong",
    "D. L. Pham": "Pham Dinh Luong",
    "Thi Huyen Pham": "Pham Thi Huyen",
    "P. T. Huyen": "Pham Thi Huyen",
    "Pham, T.H.": "Pham Thi Huyen",
    "Huyen, P. T.": "Pham Thi Huyen",
    "Huyen, P.T.": "Pham Thi Huyen",
    "T. H. Pham": "Pham Thi Huyen",
    "T.H. Pham": "Pham Thi Huyen",
    "Pham Thi Huyen": "Pham Thi Huyen",
    "P.T. Huyen": "Pham Thi Huyen",
    "Pham, T. H.": "Pham Thi Huyen",
    "V.V. Pham": "Pham Van Vinh",
    "Van Vinh Pham": "Pham Van Vinh",
    "Pham Van Vinh": "Pham Van Vinh",
    "Vinh, P. V.": "Phan Van Vinh",
    "V. V. Pham": "Pham Van Vinh",
    "Vinh, P.V.": "Pham Van Vinh",
    "P.V. Vinh": "Pham Van Vinh",
    "P. V. Vinh": "Phan Van Vinh",
    "Pham, V.V.": "Pham Van Vinh",
    "Pham, V. V.": "Pham Van Vinh",
    "V. V. Phan": "Phan Van Vinh",
    "Phan, V. V.": "Phan Van Vinh",
    "Van Vinh Phan": "Phan Van Vinh",
    "Phan, V.V.": "Phan Van Vinh",
    "V.V. Phan": "Phan Van Vinh",
    "Phan Van Vinh": "Phan Van Vinh",
    "Van Duong Quoc": "Duong Quoc Van",
    "V. D. Quoc": "Duong Quoc Van",
    "V.D. Quoc": "Duong Quoc Van",
    "Quoc, V.D.": "Duong Quoc Van",
    "Quoc, V. D.": "Duong Quoc Van",
    "Lim, S.C.": "Seong Chu Lim",
    "C.L. Seong": "Seong Chu Lim",
    "C. L. Seong": "Seong Chu Lim",
    "Seong Chu Lim": "Seong Chu Lim",
    "Lim, S. C.": "Seong Chu Lim",
    "S.C. Lim": "Seong Chu Lim",
    "S. C. Lim": "Seong Chu Lim",
    "Seong, C.L.": "Seong Chu Lim",
    "Seong, C. L.": "Seong Chu Lim",
    "Chu Lim Seong": "Seong Chu Lim",
    "Soo, H.C.": "Soo Ho Choi",
    "H. C. Soo": "Soo Ho Choi",
    "S.H. Choi": "Soo Ho Choi",
    "S. H. Choi": "Soo Ho Choi",
    "H.C. Soo": "Soo Ho Choi",
    "Choi, S. H.": "Soo Ho Choi",
    "Choi, S.H.": "Soo Ho Choi",
    "Soo Ho Choi": "Soo Ho Choi",
    "Ho Choi Soo": "Soo Ho Choi",
    "Soo, H. C.": "Soo Ho Choi",
    "K. Swathi": "Swathi Krishna",
    "Swathi, K.": "Swathi Krishna",
    "Krishna Swathi": "Swathi Krishna",
    "S. Krishna": "Swathi Krishna",
    "Swathi Krishna": "Swathi Krishna",
    "Krishna, S.": "Swathi Krishna",
    "T. U. Tran": "Thi Uyen Tran",
    "Thi, U.T.": "Thi Uyen Tran",
    "Thi Uyen Tran": "Thi Uyen Tran",
    "Tran, T.U.": "Thi Uyen Tran",
    "U. T. Thi": "Thi Uyen Tran",
    "T.U. Tran": "Thi Uyen Tran",
    "U.T. Thi": "Thi Uyen Tran",
    "Thi, U. T.": "Thi Uyen Tran",
    "Uyen Tran Thi": "Thi Uyen Tran",
    "Tran, T. U.": "Thi Uyen Tran",
    "L.V. Tien": "Vu Tien Lam",
    "Tien Lam Vu": "Vu Tien Lam",
    "T. L. Vu": "Vu Tien Lam",
    "T.L. Vu": "Vu Tien Lam",
    "Lam Vu Tien": "Vu Tien Lam",
    "Tien, L.V.": "Vu Tien Lam",
    "Vu, T.L.": "Vu Tien Lam",
    "Tien, L. V.": "Vu Tien Lam",
    "L. V. Tien": "Vu Tien Lam",
    "Vu, T. L.": "Vu Tien Lam",
    "D.D. Van": "Van Dam Do",
    "V. D. Do": "Van Dam Do",
    "V.D. Do": "Van Dam Do",
    "Do, V.D.": "Van Dam Do",
    "Do, V. D.": "Van Dam Do",
    "Van Dam Do": "Van Dam Do",
    "Van, D. D.": "Van Dam Do",
    "Dam Do Van": "Van Dam Do",
    "D. D. Van": "Van Dam Do",
    "Van, D.D.": "Van Dam Do",
    "V.H. Hoang": "Van Huy Hoang",
    "Van, H.H.": "Van Huy Hoang",
    "Van Huy Hoang": "Van Huy Hoang",
    "Huy Hoang Van": "Van Huy Hoang",
    "Van, H. H.": "Van Huy Hoang",
    "Hoang, V.H.": "Van Huy Hoang",
    "V. H. Hoang": "Van Huy Hoang",
    "H. H. Van": "Van Huy Hoang",
    "Hoang, V. H.": "Van Huy Hoang",
    "H.H. Van": "Van Huy Hoang",
    "K.D. Vu": "Vu Khac Dat",
    "Vu Khac Dat": "Vu Khac Dat",
    "V. K. Dat": "Vu Khac Dat",
    "Khac Dat Vu": "Vu Khac Dat",
    "Dat, V.K.": "Vu Khac Dat",
    "Vu, K.D.": "Vu Khac Dat",
    "Vu, K. D.": "Vu Khac Dat",
    "K. D. Vu": "Vu Khac Dat",
    "V.K. Dat": "Vu Khac Dat",
    "Dat, V. K.": "Vu Khac Dat",
    "Lam, V.T.": "Vu Tien Lam",
    "Lam, V. T.": "Vu Tien Lam",
    "V.T. Lam": "Vu Tien Lam",
    "V. T. Lam": "Vu Tien Lam",
    "Vu Tien Lam": "Vu Tien Lam",
    "J. Y. Woo": "Woo Jong Yu",
    "Yu, W. J.": "Woo Jong Yu",
    "W.J. Yu": "Woo Jong Yu",
    "Woo, J.Y.": "Woo Jong Yu",
    "Jong Yu Woo": "Woo Jong Yu",
    "Woo Jong Yu": "Woo Jong Yu",
    "Woo, J. Y.": "Woo Jong Yu",
    "W. J. Yu": "Woo Jong Yu",
    "J.Y. Woo": "Woo Jong Yu",
    "Yu, W.J.": "Woo Jong Yu",
    "Young-Min, K.": "Young-Min Kim",
    "Young-Min Kim": "Young-Min Kim",
    "K. Young-Min": "Young-Min Kim",
    "Y. Kim": "Young-Min Kim",
    "Kim Young-Min": "Young-Min Kim",
    "Kim, Y.": "Young-Min Kim",
    "D.U Lee": "Daekwon Lee",
    "Kim, Y.-M.": "Young-Min Kim",
    "Y.-M. Kim": "Young-Min Kim",
    "Kim Phuong, L.T.": "Luong Thi Kim Phuong"
}


def is_initials_only(s: str) -> bool:
    cleaned = re.sub(r'[\s\.\-]+', '', s or "")
    return len(cleaned) <= 4 and cleaned.isupper()


def expand_author_initials(raw_str: str) -> str:
    if not raw_str:
        return ""
    raw_parts = [p.strip() for p in re.split(r'[,;]', raw_str) if p.strip()]
    recombined = []
    i = 0
    while i < len(raw_parts):
        curr = raw_parts[i]
        if i + 1 < len(raw_parts) and is_initials_only(raw_parts[i + 1]):
            recombined.append(f"{curr}, {raw_parts[i + 1]}")
            i += 2
        else:
            recombined.append(curr)
            i += 1

    expanded = []
    for p in recombined:
        clean = re.sub(r'\s+', ' ', p).strip()
        matched = KNOWN_COAUTHORS_MAP.get(clean)
        if not matched:
            clean2 = re.sub(r',\s*', ', ', clean)
            matched = KNOWN_COAUTHORS_MAP.get(clean2)
        if not matched:
            matched = KNOWN_COAUTHORS_MAP.get(clean.replace('.', ''))
        expanded.append(matched if matched else clean)
    return ", ".join(expanded)


def get_author_quality(s: str) -> int:
    if not s or not s.strip():
        return 0
    score = 100
    has_init = bool(re.search(r'[A-Z]\.', s) or re.search(r',\s*[A-Z]\.', s) or re.search(r'[A-Z]\s+[A-Z]', s))
    if has_init:
        score -= 60
    parts = [p.strip() for p in re.split(r'[,;]', s) if p.strip()]
    score += len(parts) * 3
    words = [w for w in re.split(r'[\s,;]+', s) if len(w) > 2]
    score += len(words)
    return score


def sync_orcid_profile(raw_orcid: str) -> dict:
    """Fetch researcher biography, education/affiliations, and works from ORCID Public API v3.0."""
    match = re.search(r"(\d{4}-\d{4}-\d{4}-\d{3}[\dX])", raw_orcid.upper())
    if not match:
        raise ValueError("Invalid ORCID format. Expected XXXX-XXXX-XXXX-XXXX (e.g., 0000-0002-1825-0097).")
    orcid_id = match.group(1)

    base_url = f"https://pub.orcid.org/v3.0/{orcid_id}"
    orcid_headers = {"Accept": "application/json", "User-Agent": HEADERS["User-Agent"]}

    # 1. Fetch Person Details
    person_resp = requests.get(f"{base_url}/person", headers=orcid_headers, timeout=10)
    if person_resp.status_code != 200:
        raise ValueError(f"ORCID profile {orcid_id} not found (HTTP {person_resp.status_code}).")
    person_data = person_resp.json()

    name_obj = person_data.get("name") or {}
    given = (name_obj.get("given-names") or {}).get("value", "")
    family = (name_obj.get("family-name") or {}).get("value", "")
    credit = (name_obj.get("credit-name") or {}).get("value", "")
    full_name = credit or f"{given} {family}".strip() or "Researcher"

    bio_obj = person_data.get("biography") or {}
    bio = bio_obj.get("content") or ""

    # 2. Fetch Educations & Employments
    education_list = []
    try:
        edu_resp = requests.get(f"{base_url}/educations", headers=orcid_headers, timeout=8)
        if edu_resp.status_code == 200:
            groups = edu_resp.json().get("affiliation-group", [])
            for grp in groups:
                for summary_wrap in grp.get("summaries", []):
                    s = summary_wrap.get("education-summary", {})
                    role = s.get("role-title") or "Degree / Education"
                    org = (s.get("organization") or {}).get("name", "")
                    start_y = ((s.get("start-date") or {}).get("year") or {}).get("value", "")
                    end_y = ((s.get("end-date") or {}).get("year") or {}).get("value", "Present")
                    dept = s.get("department-name") or ""
                    education_list.append({
                        "degree": role,
                        "institution": org,
                        "period": f"{start_y} – {end_y}" if start_y else "Current",
                        "details": dept
                    })
    except Exception:
        pass

    # 3. Fetch Works
    publications = []
    try:
        works_resp = requests.get(f"{base_url}/works", headers=orcid_headers, timeout=10)
        if works_resp.status_code == 200:
            groups = works_resp.json().get("group", [])
            put_codes = []
            for grp in groups[:50]:
                summaries = grp.get("work-summary", [])
                if summaries and summaries[0].get("put-code"):
                    put_codes.append(str(summaries[0].get("put-code")))

            work_details_map = {}
            if put_codes:
                try:
                    bulk_csv = ",".join(put_codes[:50])
                    b_resp = requests.get(f"{base_url}/works/{bulk_csv}", headers=orcid_headers, timeout=15)
                    if b_resp.status_code == 200:
                        for item in b_resp.json().get("bulk", []):
                            w_item = item.get("work", {})
                            pc = str(w_item.get("put-code", ""))
                            if pc:
                                work_details_map[pc] = w_item
                except Exception:
                    pass

            for grp in groups[:50]:
                summaries = grp.get("work-summary", [])
                if not summaries:
                    continue
                ws = summaries[0]
                pc = str(ws.get("put-code", ""))
                work_detail = work_details_map.get(pc, ws)

                title_obj = (work_detail.get("title") or {}).get("title") or {}
                w_title = title_obj.get("value", "Untitled Work")
                journal_obj = work_detail.get("journal-title") or {}
                w_journal = journal_obj.get("value", "") or work_detail.get("type", "Publication").replace("_", " ").title()
                pub_date = work_detail.get("publication-date") or {}
                w_year = int(((pub_date.get("year") or {}).get("value") or 2026))

                w_doi = ""
                ext_ids = (work_detail.get("external-ids") or {}).get("external-id", [])
                for eid in ext_ids:
                    if (eid.get("external-id-type") or "").lower() == "doi":
                        w_doi = eid.get("external-id-value", "")
                        break

                # Extract all contributors / co-authors
                author_names = []
                contribs = (work_detail.get("contributors") or {}).get("contributor", [])
                for c in contribs:
                    c_name = ((c.get("credit-name") or {}).get("value") or "").strip()
                    if c_name:
                        author_names.append(c_name)

                w_authors = ", ".join(author_names) if author_names else full_name
                w_volume = ""
                w_issue = ""
                w_pages = ""
                w_citations = 0

                # Crossref & OpenAlex full metadata & author enrichment
                w_authors = expand_author_initials(w_authors)
                if w_doi:
                    clean_doi = clean_doi_str = w_doi.replace("https://doi.org/", "").strip()
                    cand_cr = ""
                    cand_oa = ""
                    try:
                        cr_resp = requests.get(
                            f"https://api.crossref.org/works/{requests.utils.quote(clean_doi)}?mailto=lamvt.skku@gmail.com",
                            headers={"User-Agent": "MatSciNexus/1.0 (mailto:lamvt.skku@gmail.com)"},
                            timeout=8
                        )
                        if cr_resp.status_code == 200:
                            cr_msg = cr_resp.json().get("message", {})
                            cr_authors = []
                            for a in cr_msg.get("author", []):
                                given = (a.get("given") or "").strip()
                                family = (a.get("family") or "").strip()
                                if given and family:
                                    cr_authors.append(f"{given} {family}")
                                elif family:
                                    cr_authors.append(family)
                            cand_cr = expand_author_initials(", ".join(cr_authors))
                            w_volume = str(cr_msg.get("volume") or "")
                            w_issue = str(cr_msg.get("issue") or "")
                            w_pages = str(cr_msg.get("page") or "")
                            w_citations = int(cr_msg.get("is-referenced-by-count") or 0)
                            if not w_journal or w_journal == "Publication":
                                ct = cr_msg.get("container-title", [])
                                if ct:
                                    w_journal = ct[0]
                    except Exception:
                        pass

                    try:
                        oa_resp = requests.get(
                            f"https://api.openalex.org/works/https://doi.org/{requests.utils.quote(clean_doi)}?mailto=lamvt.skku@gmail.com",
                            headers={"User-Agent": "MatSciNexus/1.0 (mailto:lamvt.skku@gmail.com)"},
                            timeout=8
                        )
                        if oa_resp.status_code == 200:
                            oa_data = oa_resp.json()
                            oa_names = [ash.get("author", {}).get("display_name", "").strip() for ash in oa_data.get("authorships", [])]
                            cand_oa = expand_author_initials(", ".join(filter(None, oa_names)))
                            if not w_volume:
                                w_volume = str(oa_data.get("biblio", {}).get("volume") or "")
                            if not w_issue:
                                w_issue = str(oa_data.get("biblio", {}).get("issue") or "")
                            if not w_pages:
                                w_pages = str(oa_data.get("biblio", {}).get("first_page") or "")
                            if not w_citations:
                                w_citations = int(oa_data.get("cited_by_count") or 0)
                            if not w_journal or w_journal == "Publication":
                                w_journal = (oa_data.get("primary_location") or {}).get("source", {}).get("display_name", "")
                    except Exception:
                        pass

                    candidates = [cand_cr, cand_oa, w_authors]
                    candidates = [c for c in candidates if c]
                    candidates.sort(key=get_author_quality, reverse=True)
                    if candidates:
                        w_authors = candidates[0]

                pub_entry = {
                    "title": w_title,
                    "authors": w_authors,
                    "journal": w_journal,
                    "year": w_year,
                    "doi": w_doi,
                    "citations": w_citations,
                    "source": "ORCID",
                    "visibility": "Public"
                }
                if w_volume:
                    pub_entry["volume"] = w_volume
                if w_issue:
                    pub_entry["issue"] = w_issue
                if w_pages:
                    pub_entry["pages"] = w_pages

                publications.append(pub_entry)
    except Exception:
        pass

    return {
        "orcid_id": orcid_id,
        "full_name": full_name,
        "bio": bio,
        "education": education_list,
        "publications": publications,
    }


def sync_scholar_profile(scholar_input: str, fallback_author_name: str = "") -> dict:
    """
    Sync Google Scholar profile metrics and publications.
    Supports Google Scholar User ID/URL or Author Name via Google Scholar + OpenAlex Author API fallback.
    """
    raw = scholar_input.strip()
    user_id = ""
    match = re.search(r"[?&]user=([A-Za-z0-9_-]+)", raw)
    if match:
        user_id = match.group(1)
    elif re.match(r"^[A-Za-z0-9_-]{8,16}$", raw) and " " not in raw:
        user_id = raw

    # 1. Try direct Google Scholar profile scraping if user_id is present
    if user_id:
        try:
            gs_url = f"https://scholar.google.com/citations?user={user_id}&hl=en&cstart=0&pagesize=30"
            resp = requests.get(gs_url, headers=SCHOLAR_HEADERS, timeout=10)
            if resp.status_code == 200 and "gsc_prf_in" in resp.text:
                soup = BeautifulSoup(resp.text, "html.parser")
                name_el = soup.select_one("#gsc_prf_in")
                aff_el = soup.select_one(".gsc_prf_il")
                stats_els = soup.select("td.gsc_rsb_std")

                total_citations = int(stats_els[0].text.strip()) if len(stats_els) >= 1 and stats_els[0].text.strip().isdigit() else 0
                h_index = int(stats_els[2].text.strip()) if len(stats_els) >= 3 and stats_els[2].text.strip().isdigit() else 0
                i10_index = int(stats_els[4].text.strip()) if len(stats_els) >= 5 and stats_els[4].text.strip().isdigit() else 0

                pubs = []
                for row in soup.select("tr.gsc_a_tr"):
                    t_el = row.select_one("a.gsc_a_at")
                    gray_els = row.select("div.gs_gray")
                    c_el = row.select_one("a.gsc_a_ac")
                    y_el = row.select_one("span.gsc_a_hc")
                    if t_el:
                        pubs.append({
                            "title": t_el.text.strip(),
                            "authors": gray_els[0].text.strip() if len(gray_els) > 0 else "",
                            "journal": gray_els[1].text.strip() if len(gray_els) > 1 else "",
                            "year": int(y_el.text.strip()) if (y_el and y_el.text.strip().isdigit()) else 2025,
                            "doi": "",
                            "citations": int(c_el.text.strip()) if (c_el and c_el.text.strip().isdigit()) else 0,
                            "source": "Google Scholar"
                        })

                return {
                    "scholar_id": user_id,
                    "full_name": name_el.text.strip() if name_el else fallback_author_name,
                    "affiliation": aff_el.text.strip() if aff_el else "",
                    "total_citations": total_citations,
                    "h_index": h_index,
                    "i10_index": i10_index,
                    "publications": pubs,
                    "provider": "Google Scholar Live"
                }
        except Exception:
            pass

    # 2. Fallback to OpenAlex Author API (works reliably for any researcher name or ORCID without CAPTCHA)
    query_name = raw if (" " in raw or not user_id) else (fallback_author_name or raw)
    if not query_name:
        raise ValueError("Please provide a Google Scholar ID/URL or Author Name to sync.")

    oa_search_url = f"https://api.openalex.org/authors?search={urllib.parse.quote(query_name)}&per-page=1"
    oa_resp = requests.get(oa_search_url, headers=HEADERS, timeout=10)
    if oa_resp.status_code != 200 or not oa_resp.json().get("results"):
        raise ValueError(f"Could not find author profile for '{query_name}'.")

    author = oa_resp.json()["results"][0]
    summary_stats = author.get("summary_stats") or {}
    total_citations = int(author.get("cited_by_count", 0) or 0)
    h_index = int(summary_stats.get("h_index", 0) or 0)
    i10_index = int(summary_stats.get("i10_index", 0) or 0)
    affs = author.get("affiliations") or []
    affiliation = ""
    if affs:
        affiliation = (affs[0].get("institution") or {}).get("display_name", "")

    # Fetch top works for this author from OpenAlex
    author_id = author.get("id", "").split("/")[-1]
    pubs = []
    if author_id:
        works_url = f"https://api.openalex.org/works?filter=author.id:{author_id}&sort=cited_by_count:desc&per-page=20"
        w_resp = requests.get(works_url, headers=HEADERS, timeout=10)
        if w_resp.status_code == 200:
            for w in w_resp.json().get("results", []):
                auth_names = [
                    (a.get("author") or {}).get("display_name", "")
                    for a in w.get("authorships", [])[:5]
                ]
                loc = w.get("primary_location") or {}
                src = loc.get("source") or {}
                w_doi = (w.get("doi") or "").replace("https://doi.org/", "")
                pubs.append({
                    "title": w.get("title") or "Untitled Publication",
                    "authors": ", ".join([n for n in auth_names if n]),
                    "journal": src.get("display_name") or "Journal",
                    "year": w.get("publication_year") or 2025,
                    "doi": w_doi,
                    "citations": int(w.get("cited_by_count", 0) or 0),
                    "source": "Scholar / OpenAlex"
                })

    return {
        "scholar_id": user_id or query_name,
        "full_name": author.get("display_name") or query_name,
        "affiliation": affiliation,
        "total_citations": total_citations,
        "h_index": h_index,
        "i10_index": i10_index,
        "publications": pubs,
        "provider": "Academic Citation Graph (OpenAlex/Scholar)"
    }
