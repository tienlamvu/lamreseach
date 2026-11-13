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

                # Crossref enrichment for DOIs
                if w_doi:
                    try:
                        cr_resp = requests.get(
                            f"https://api.crossref.org/works/{requests.utils.quote(w_doi)}",
                            headers={"User-Agent": "MatSciHub/1.0 (mailto:lamvt@skku.edu)"},
                            timeout=5
                        )
                        if cr_resp.status_code == 200:
                            cr_msg = cr_resp.json().get("message", {})
                            if not author_names and cr_msg.get("author"):
                                cr_authors = []
                                for a in cr_msg.get("author", []):
                                    given = a.get("given", "").strip()
                                    family = a.get("family", "").strip()
                                    if given and family:
                                        cr_authors.append(f"{given} {family}")
                                    elif family:
                                        cr_authors.append(family)
                                if cr_authors:
                                    w_authors = ", ".join(cr_authors)
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
