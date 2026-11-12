"""
MatSci Nexus — Document Plagiarism / Duplicate Paragraph Checker & Word Diff Engine
Supports PDF, Word (.docx), and plain text.
"""

import io
import re
import difflib
import json
import urllib.request
import urllib.parse
from typing import List, Dict, Tuple, Optional
import pypdf
import docx


def normalize_manuscript(raw_text: str) -> List[str]:
    """
    Normalizes manuscript text into canonical, cohesive paragraphs for both PDF and Word files.
    Strips academic line numbers, page numbers, and running headers.
    """
    if not raw_text:
        return []
    text = re.sub(r'[ \t]+\d+[ \t]*(?=\r?\n|$)', '', raw_text)
    text = re.sub(r'^\s*\d+\s*$', '', text, flags=re.MULTILINE)
    text = text.replace('\u201c', '"').replace('\u201d', '"').replace('\u2018', "'").replace('\u2019', "'")
    text = text.replace('\u2013', '-').replace('\u2014', '-').replace('\u2212', '-')

    raw_lines = [l.strip() for l in text.splitlines() if l.strip()]
    paragraphs = []
    cur_lines = []

    for l in raw_lines:
        cur_lines.append(l)
        words_count = len(' '.join(cur_lines).split())
        is_terminal = bool(re.search(r'[\.\?\!]\s*$', l))
        is_heading = bool(re.match(r'^(Abstract|Introduction|Results|Discussion|Methods|Conclusions?|References|Computational Methods|\d+\.\s+[A-Z])\b', l, re.IGNORECASE))

        if (is_terminal and words_count >= 35) or (is_heading and words_count > 10):
            p_text = ' '.join(cur_lines).strip()
            p_text = re.sub(r'\s+', ' ', p_text)
            if len(p_text.split()) >= 10:
                paragraphs.append(p_text)
            cur_lines = []

    if cur_lines:
        p_text = re.sub(r'\s+', ' ', ' '.join(cur_lines).strip())
        if len(p_text.split()) >= 10:
            paragraphs.append(p_text)
    return paragraphs


def extract_text_from_file_bytes(filename: str, content: bytes) -> Tuple[str, List[str]]:
    """
    Extracts plain text and clean paragraphs from PDF, DOCX, or TXT file bytes.
    """
    filename_lower = filename.lower()
    raw_text = ""

    if filename_lower.endswith(".docx"):
        try:
            doc = docx.Document(io.BytesIO(content))
            lines = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
            for table in doc.tables:
                for row in table.rows:
                    row_txt = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
                    if row_txt:
                        lines.append(row_txt)
            raw_text = "\n".join(lines)
        except Exception as e:
            raw_text = f"Error parsing Word file: {str(e)}"

    elif filename_lower.endswith(".pdf"):
        try:
            reader = pypdf.PdfReader(io.BytesIO(content))
            pages = []
            for page in reader.pages:
                pages.append(page.extract_text() or "")
            raw_text = "\n".join(pages)
        except Exception as e:
            raw_text = f"Error parsing PDF file: {str(e)}"

    else:
        try:
            raw_text = content.decode("utf-8")
        except UnicodeDecodeError:
            raw_text = content.decode("latin-1", errors="ignore")

    paragraphs = normalize_manuscript(raw_text)
    full_text = "\n\n".join(paragraphs)
    return full_text, paragraphs


def tokenize_words(text: str) -> List[str]:
    """Tokenizes text into lowercase alphanumeric words."""
    return re.findall(r"\b[A-Za-z0-9_\u00C0-\u024F\u1EA0-\u1EF9\-]{2,}\b", text.lower())


def get_ngrams(words: List[str], n: int = 3) -> set:
    """Generates word n-grams as string tuples."""
    if len(words) < n:
        return set()
    return {tuple(words[i:i+n]) for i in range(len(words) - n + 1)}


def find_longest_common_substring(s1: str, s2: str) -> str:
    """Finds the longest verbatim identical substring between two texts."""
    matcher = difflib.SequenceMatcher(None, s1, s2)
    match = matcher.find_longest_match(0, len(s1), 0, len(s2))
    if match.size >= 15:
        return s1[match.a: match.a + match.size].strip()
    return ""


def compute_paragraph_similarity(p1: str, p2: str) -> Dict:
    """
    Computes lexical similarity, n-gram overlap, and SequenceMatcher score between two paragraphs.
    """
    w1 = tokenize_words(p1)
    w2 = tokenize_words(p2)

    if not w1 or not w2:
        return {
            "score": 0.0,
            "jaccard": 0.0,
            "ngram_overlap": 0.0,
            "seq_ratio": 0.0,
            "longest_phrase": ""
        }

    # 1. Word Jaccard
    s1, s2 = set(w1), set(w2)
    union_len = len(s1.union(s2))
    jaccard = (len(s1.intersection(s2)) / union_len) if union_len > 0 else 0.0

    # 2. 3-Gram Overlap (Phrasing identity)
    ng1 = get_ngrams(w1, 3)
    ng2 = get_ngrams(w2, 3)
    ng_union = len(ng1.union(ng2))
    ngram_overlap = (len(ng1.intersection(ng2)) / ng_union) if ng_union > 0 else 0.0

    # 3. SequenceMatcher Ratio
    seq_ratio = difflib.SequenceMatcher(None, w1, w2).ratio()

    # 4. Longest Common Substring
    longest_phrase = find_longest_common_substring(p1, p2)

    # Weighted Composite Score
    composite = (0.25 * jaccard) + (0.45 * ngram_overlap) + (0.30 * seq_ratio)

    return {
        "score": round(composite, 4),
        "jaccard": round(jaccard, 3),
        "ngram_overlap": round(ngram_overlap, 3),
        "seq_ratio": round(seq_ratio, 3),
        "longest_phrase": longest_phrase
    }


def query_internet_candidates_py(queries: List[str]) -> List[Dict]:
    """
    Queries OpenAlex Works API and CrossRef for scientific literature candidates.
    """
    candidates = []
    seen_dois = set()
    seen_titles = set()

    for q in queries:
        clean_q = re.sub(r"[^a-zA-Z0-9\s\-]", " ", q).strip()
        if len(clean_q) < 8:
            continue

        # 1. CrossRef REST API
        try:
            url_cr = f"https://api.crossref.org/works?rows=4&query={urllib.parse.quote(clean_q)}"
            req_cr = urllib.request.Request(url_cr, headers={"User-Agent": "MatSciPhDHub/2.0 (mailto:lamvt.skku@gmail.com)"})
            with urllib.request.urlopen(req_cr, timeout=5) as resp:
                cr_data = json.loads(resp.read().decode("utf-8"))
                for it in cr_data.get("message", {}).get("items", []):
                    doi = (it.get("DOI") or "").strip()
                    title = it.get("title", [""])[0] if isinstance(it.get("title"), list) else it.get("title", "")
                    title_norm = re.sub(r"[^a-z0-9]", "", title.lower())
                    if (doi and doi.lower() in seen_dois) or (title_norm and title_norm in seen_titles) or not title_norm:
                        continue
                    if doi: seen_dois.add(doi.lower())
                    if title_norm: seen_titles.add(title_norm)
                    venue = it.get("container-title", [""])[0] if isinstance(it.get("container-title"), list) else it.get("container-title", "")
                    year = str(it.get("created", {}).get("date-parts", [[None]])[0][0] or "")
                    authors = ", ".join(f"{a.get('given','')} {a.get('family','')}".strip() for a in it.get("author", [])[:3])
                    candidates.append({
                        "title": title or "Published Paper",
                        "doi": doi,
                        "journal": venue or "CrossRef Publication",
                        "year": year,
                        "authors": f"{authors} et al." if len(it.get("author", [])) > 3 else authors,
                        "abstract": it.get("abstract", "") or "",
                        "source_type": "CrossRef Index"
                    })
        except Exception:
            pass

        # 2. Europe PMC REST API
        try:
            url_ep = f"https://www.ebi.ac.uk/europepmc/webservices/rest/search?query={urllib.parse.quote(clean_q)}&format=json&pageSize=4"
            req_ep = urllib.request.Request(url_ep, headers={"User-Agent": "MatSciPhDHub/2.0"})
            with urllib.request.urlopen(req_ep, timeout=5) as resp:
                ep_data = json.loads(resp.read().decode("utf-8"))
                for it in ep_data.get("resultList", {}).get("result", []):
                    doi = (it.get("doi") or "").strip()
                    title = (it.get("title") or "").replace("<[^>]+>", "").strip()
                    title_norm = re.sub(r"[^a-z0-9]", "", title.lower())
                    if (doi and doi.lower() in seen_dois) or (title_norm and title_norm in seen_titles) or not title_norm:
                        continue
                    if doi: seen_dois.add(doi.lower())
                    if title_norm: seen_titles.add(title_norm)
                    candidates.append({
                        "title": title or "Peer-Reviewed Article",
                        "doi": doi,
                        "journal": it.get("journalTitle") or "Europe PMC Index",
                        "year": str(it.get("pubYear") or ""),
                        "authors": it.get("authorString") or "",
                        "abstract": it.get("abstractText", "") or "",
                        "source_type": "Europe PMC Index"
                    })
        except Exception:
            pass

        # 3. OpenAlex fallback
        try:
            url = f"https://api.openalex.org/works?search={urllib.parse.quote(clean_q)}&per_page=3"
            req = urllib.request.Request(url, headers={"User-Agent": "MatSciNexus/1.0 (mailto:lamvt.skku@gmail.com)"})
            with urllib.request.urlopen(req, timeout=5) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                for w in data.get("results", []):
                    doi = (w.get("doi") or "").replace("https://doi.org/", "").strip()
                    title = (w.get("title") or w.get("display_name") or "").strip()
                    title_norm = re.sub(r"[^a-z0-9]", "", title.lower())
                    if (doi and doi.lower() in seen_dois) or (title_norm and title_norm in seen_titles) or not title_norm:
                        continue
                    if doi: seen_dois.add(doi.lower())
                    if title_norm: seen_titles.add(title_norm)

                    # Reconstruct abstract
                    inv = w.get("abstract_inverted_index") or {}
                    w_pos = {}
                    for word, positions in inv.items():
                        for p in positions: w_pos[p] = word
                    ab_text = " ".join(w_pos[i] for i in sorted(w_pos.keys()))

                    venue = (w.get("primary_location") or {}).get("source", {}).get("display_name") or ""
                    year = str(w.get("publication_year") or "")
                    authors_list = [a.get("author", {}).get("display_name", "") for a in (w.get("authorships") or [])[:4]]
                    authors = ", ".join(filter(None, authors_list))

                    candidates.append({
                        "title": title or "Scholarly Article",
                        "doi": doi,
                        "journal": venue,
                        "year": year,
                        "authors": f"{authors} et al." if len(w.get("authorships") or []) > 4 else authors,
                        "abstract": ab_text,
                        "source_type": "Google Scholar & OpenAlex"
                    })
        except Exception:
            pass

    return candidates


def check_manuscript_duplicates(
    paragraphs: List[str],
    library_corpus: List[Dict],
    custom_reference_paragraphs: Optional[List[str]] = None,
    cross_internet: bool = True
) -> Dict:
    """
    Checks manuscript paragraphs for duplicate/copied content against:
    1. Internet & Google Scholar Index (OpenAlex & CrossRef 250M+ Works)
    2. Literature Library (Abstracts, titles, notes)
    3. Internal repetition (within the same document)
    4. Custom reference document (if uploaded)
    """
    results = []
    total_score_sum = 0.0
    high_risk_count = 0
    mod_risk_count = 0

    internet_corpus = []
    if cross_internet and paragraphs:
        # Extract 2-4 candidate queries from abstract and body
        queries = []
        full_text = "\n\n".join(paragraphs)
        m_ab = re.search(r'abstract[\s:\-—]+(.*?)(?:\n\n|\.\s+[A-Z])', full_text, re.IGNORECASE | re.DOTALL)
        if m_ab:
            words = m_ab.group(1).replace("\n", " ").split()[:14]
            if len(words) >= 6:
                queries.append(" ".join(words))

        first_p = paragraphs[0].split("\n")[0]
        words_t = first_p.split()[:12]
        if len(words_t) >= 5:
            queries.append(" ".join(words_t))

        internet_corpus = query_internet_candidates_py(queries)

    for idx, p in enumerate(paragraphs):
        p_clean = p.strip()
        if len(p_clean) < 30:
            continue

        best_match = {
            "score": 0.0,
            "source_type": "None",
            "source_title": "",
            "source_text": "",
            "source_doi": "",
            "longest_phrase": "",
            "metrics": {}
        }

        # 1. Check against Internet & Google Scholar candidate corpus
        for paper in internet_corpus:
            ref_text = f"{paper.get('title', '')} {paper.get('abstract', '')}"
            if not ref_text.strip():
                continue
            sim = compute_paragraph_similarity(p_clean, ref_text)
            if sim["score"] > best_match["score"]:
                best_match = {
                    "score": sim["score"],
                    "source_type": "Internet & Google Scholar Index",
                    "source_title": f"{paper.get('title', 'Article')} ({paper.get('journal', '')} {paper.get('year', '')})",
                    "source_text": paper.get("abstract") or paper.get("title") or "",
                    "source_doi": paper.get("doi", ""),
                    "longest_phrase": sim["longest_phrase"],
                    "metrics": sim
                }

        # 2. Check against Literature Library
        for paper in library_corpus:
            corpus_parts = [
                paper.get("title", ""),
                paper.get("abstract", ""),
                paper.get("notes", "")
            ]
            full_ref = " ".join(filter(None, corpus_parts))
            if not full_ref:
                continue

            sim = compute_paragraph_similarity(p_clean, full_ref)
            if sim["score"] > best_match["score"]:
                best_match = {
                    "score": sim["score"],
                    "source_type": "Literature Library",
                    "source_title": f"{paper.get('title', 'Paper')} ({paper.get('journal', '')} {paper.get('year', '')})",
                    "source_text": paper.get("abstract") or paper.get("notes") or paper.get("title") or "",
                    "source_doi": paper.get("doi", ""),
                    "longest_phrase": sim["longest_phrase"],
                    "metrics": sim
                }

        # 3. Check against custom reference document if provided
        if custom_reference_paragraphs:
            for ref_p in custom_reference_paragraphs:
                if len(ref_p.strip()) < 20:
                    continue
                sim = compute_paragraph_similarity(p_clean, ref_p)
                if sim["score"] > best_match["score"]:
                    best_match = {
                        "score": sim["score"],
                        "source_type": "Reference Document",
                        "source_title": "Uploaded Comparison Document",
                        "source_text": ref_p,
                        "source_doi": "",
                        "longest_phrase": sim["longest_phrase"],
                        "metrics": sim
                    }

        # 4. Check for internal repetition within the document itself
        for other_idx, other_p in enumerate(paragraphs):
            if other_idx == idx:
                continue
            sim = compute_paragraph_similarity(p_clean, other_p)
            if sim["score"] > 0.65 and sim["score"] > best_match["score"]:
                best_match = {
                    "score": sim["score"],
                    "source_type": "Internal Document Repetition",
                    "source_title": f"Paragraph #{other_idx + 1} in this manuscript",
                    "source_text": other_p,
                    "source_doi": "",
                    "longest_phrase": sim["longest_phrase"],
                    "metrics": sim
                }

        pct = round(best_match["score"] * 100, 1)
        total_score_sum += pct

        match_level = "LOW"
        if pct >= 65.0:
            match_level = "HIGH"
            high_risk_count += 1
        elif pct >= 35.0:
            match_level = "MODERATE"
            mod_risk_count += 1

        scholar_q = best_match["longest_phrase"] or best_match["source_title"]
        scholar_url = f"https://scholar.google.com/scholar?q={urllib.parse.quote('\"' + scholar_q + '\"')}" if scholar_q else ""

        results.append({
            "paragraph_index": idx + 1,
            "text": p_clean,
            "similarity_pct": pct,
            "level": match_level,
            "source_type": best_match["source_type"],
            "source_title": best_match["source_title"],
            "source_doi": best_match.get("source_doi", ""),
            "source_text": best_match["source_text"][:360] + ("..." if len(best_match["source_text"]) > 360 else ""),
            "longest_identical_phrase": best_match["longest_phrase"],
            "scholar_url": scholar_url
        })

    valid_count = max(len(results), 1)
    overall_pct = round(total_score_sum / valid_count, 1)

    return {
        "overall_similarity_pct": overall_pct,
        "total_paragraphs": len(paragraphs),
        "analyzed_paragraphs": len(results),
        "high_risk_count": high_risk_count,
        "moderate_risk_count": mod_risk_count,
        "flagged_total": high_risk_count + mod_risk_count,
        "internet_sources_scanned": len(internet_corpus),
        "paragraphs": results
    }



def compare_two_word_documents(
    doc_a_text: str,
    doc_b_text: str,
    doc_a_paras: List[str],
    doc_b_paras: List[str]
) -> Dict:
    """
    Compares two Word (.docx) or PDF manuscripts:
    1. Overall lexical similarity index.
    2. Word additions, deletions, modifications.
    3. Side-by-side aligned paragraph diff.
    4. Tracked changes inline view (HTML with <ins> and <del> tags).
    """
    words_a = tokenize_words(doc_a_text)
    words_b = tokenize_words(doc_b_text)

    seq_matcher = difflib.SequenceMatcher(None, words_a, words_b)
    overall_similarity = round(seq_matcher.ratio() * 100, 1)

    # Word-level statistics
    words_added = 0
    words_deleted = 0
    words_equal = 0

    for tag, i1, i2, j1, j2 in seq_matcher.get_opcodes():
        if tag == "equal":
            words_equal += (i2 - i1)
        elif tag == "insert":
            words_added += (j2 - j1)
        elif tag == "delete":
            words_deleted += (i2 - i1)
        elif tag == "replace":
            words_deleted += (i2 - i1)
            words_added += (j2 - j1)

    # Paragraph alignment diff
    max_len = max(len(doc_a_paras), len(doc_b_paras))
    aligned_rows = []
    modified_paras_count = 0
    unchanged_paras_count = 0

    p_matcher = difflib.SequenceMatcher(None, doc_a_paras, doc_b_paras)

    for tag, i1, i2, j1, j2 in p_matcher.get_opcodes():
        if tag == "equal":
            for a_idx, b_idx in zip(range(i1, i2), range(j1, j2)):
                unchanged_paras_count += 1
                aligned_rows.append({
                    "status": "unchanged",
                    "para_a_num": a_idx + 1,
                    "para_b_num": b_idx + 1,
                    "para_a_text": doc_a_paras[a_idx],
                    "para_b_text": doc_b_paras[b_idx],
                    "text_a": doc_a_paras[a_idx],
                    "text_b": doc_b_paras[b_idx],
                    "diff_html": escape_html_str(doc_a_paras[a_idx])
                })
        elif tag == "replace":
            for a_idx, b_idx in zip(range(i1, i2), range(j1, j2)):
                modified_paras_count += 1
                inline_html = generate_inline_word_diff(doc_a_paras[a_idx], doc_b_paras[b_idx])
                aligned_rows.append({
                    "status": "modified",
                    "para_a_num": a_idx + 1,
                    "para_b_num": b_idx + 1,
                    "para_a_text": doc_a_paras[a_idx],
                    "para_b_text": doc_b_paras[b_idx],
                    "text_a": doc_a_paras[a_idx],
                    "text_b": doc_b_paras[b_idx],
                    "diff_html": inline_html
                })
            # Handle remainder if ranges unequal
            if (i2 - i1) > (j2 - j1):
                for a_idx in range(i1 + (j2 - j1), i2):
                    modified_paras_count += 1
                    aligned_rows.append({
                        "status": "deleted",
                        "para_a_num": a_idx + 1,
                        "para_b_num": "-",
                        "para_a_text": doc_a_paras[a_idx],
                        "para_b_text": "",
                        "text_a": doc_a_paras[a_idx],
                        "text_b": "",
                        "diff_html": f"<del class='diff-del'>{escape_html_str(doc_a_paras[a_idx])}</del>"
                    })
            elif (j2 - j1) > (i2 - i1):
                for b_idx in range(j1 + (i2 - i1), j2):
                    modified_paras_count += 1
                    aligned_rows.append({
                        "status": "added",
                        "para_a_num": "-",
                        "para_b_num": b_idx + 1,
                        "para_a_text": "",
                        "para_b_text": doc_b_paras[b_idx],
                        "text_a": "",
                        "text_b": doc_b_paras[b_idx],
                        "diff_html": f"<ins class='diff-ins'>{escape_html_str(doc_b_paras[b_idx])}</ins>"
                    })
        elif tag == "delete":
            for a_idx in range(i1, i2):
                modified_paras_count += 1
                aligned_rows.append({
                    "status": "deleted",
                    "para_a_num": a_idx + 1,
                    "para_b_num": "-",
                    "para_a_text": doc_a_paras[a_idx],
                    "para_b_text": "",
                    "text_a": doc_a_paras[a_idx],
                    "text_b": "",
                    "diff_html": f"<del class='diff-del'>{escape_html_str(doc_a_paras[a_idx])}</del>"
                })
        elif tag == "insert":
            for b_idx in range(j1, j2):
                modified_paras_count += 1
                aligned_rows.append({
                    "status": "added",
                    "para_a_num": "-",
                    "para_b_num": b_idx + 1,
                    "para_a_text": "",
                    "para_b_text": doc_b_paras[b_idx],
                    "text_a": "",
                    "text_b": doc_b_paras[b_idx],
                    "diff_html": f"<ins class='diff-ins'>{escape_html_str(doc_b_paras[b_idx])}</ins>"
                })

    inline_diff_html = generate_inline_word_diff(doc_a_text, doc_b_text)

    return {
        "similarity_pct": overall_similarity,
        "doc_a_word_count": len(words_a),
        "doc_b_word_count": len(words_b),
        "doc_a_words": len(words_a),
        "doc_b_words": len(words_b),
        "words_added": words_added,
        "added_words": words_added,
        "words_deleted": words_deleted,
        "deleted_words": words_deleted,
        "words_unchanged": words_equal,
        "modified_paragraphs": modified_paras_count,
        "unchanged_paragraphs": unchanged_paras_count,
        "total_rows": len(aligned_rows),
        "rows": aligned_rows,
        "side_by_side": aligned_rows,
        "track_changes_html": inline_diff_html
    }


def generate_inline_word_diff(text_a: str, text_b: str) -> str:
    """Produces HTML with <del> and <ins> tags for word-level differences."""
    words_a = text_a.split()
    words_b = text_b.split()
    matcher = difflib.SequenceMatcher(None, words_a, words_b)
    output = []

    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "equal":
            output.append(" ".join(escape_html_str(w) for w in words_a[i1:i2]))
        elif tag == "delete":
            deleted_str = " ".join(escape_html_str(w) for w in words_a[i1:i2])
            output.append(f"<del class='diff-del'>{deleted_str}</del>")
        elif tag == "insert":
            added_str = " ".join(escape_html_str(w) for w in words_b[j1:j2])
            output.append(f"<ins class='diff-ins'>{added_str}</ins>")
        elif tag == "replace":
            del_str = " ".join(escape_html_str(w) for w in words_a[i1:i2])
            ins_str = " ".join(escape_html_str(w) for w in words_b[j1:j2])
            output.append(f"<del class='diff-del'>{del_str}</del> <ins class='diff-ins'>{ins_str}</ins>")

    return " ".join(output)


def escape_html_str(s: str) -> str:
    return (
        s.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )
