"""
MatSci Nexus — Document Plagiarism / Duplicate Paragraph Checker & Word Diff Engine
Supports PDF, Word (.docx), and plain text.
"""

import io
import re
import difflib
from typing import List, Dict, Tuple, Optional
import pypdf
import docx


def extract_text_from_file_bytes(filename: str, content: bytes) -> Tuple[str, List[str]]:
    """
    Extracts plain text and clean paragraphs from PDF, DOCX, or TXT file bytes.
    """
    filename_lower = filename.lower()
    paragraphs = []

    if filename_lower.endswith(".docx"):
        try:
            doc = docx.Document(io.BytesIO(content))
            for p in doc.paragraphs:
                txt = p.text.strip()
                if txt:
                    paragraphs.append(txt)
            for table in doc.tables:
                for row in table.rows:
                    row_txt = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
                    if row_txt:
                        paragraphs.append(row_txt)
        except Exception as e:
            paragraphs.append(f"Error parsing Word file: {str(e)}")

    elif filename_lower.endswith(".pdf"):
        try:
            reader = pypdf.PdfReader(io.BytesIO(content))
            for page_idx, page in enumerate(reader.pages):
                page_text = page.extract_text() or ""
                # Split page text into natural paragraphs
                raw_paras = re.split(r"\n\s*\n", page_text)
                for p in raw_paras:
                    cleaned = re.sub(r"\s+", " ", p).strip()
                    if cleaned and len(cleaned) > 20:
                        paragraphs.append(cleaned)
        except Exception as e:
            paragraphs.append(f"Error parsing PDF file: {str(e)}")

    else:
        # Plain text / fallback
        try:
            raw_text = content.decode("utf-8")
        except UnicodeDecodeError:
            raw_text = content.decode("latin-1", errors="ignore")
        for p in re.split(r"\n\s*\n", raw_text):
            cleaned = re.sub(r"\s+", " ", p).strip()
            if cleaned:
                paragraphs.append(cleaned)

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


def check_manuscript_duplicates(
    paragraphs: List[str],
    library_corpus: List[Dict],
    custom_reference_paragraphs: Optional[List[str]] = None
) -> Dict:
    """
    Checks manuscript paragraphs for duplicate/copied content against:
    1. Literature Library (Abstracts, titles, notes)
    2. Internal repetition (within the same document)
    3. Custom reference document (if uploaded)
    """
    results = []
    total_score_sum = 0.0
    high_risk_count = 0
    mod_risk_count = 0

    for idx, p in enumerate(paragraphs):
        p_clean = p.strip()
        if len(p_clean) < 30:
            continue

        best_match = {
            "score": 0.0,
            "source_type": "None",
            "source_title": "",
            "source_text": "",
            "longest_phrase": "",
            "metrics": {}
        }

        # Check against literature library
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
                    "longest_phrase": sim["longest_phrase"],
                    "metrics": sim
                }

        # Check against custom reference document if provided
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
                        "longest_phrase": sim["longest_phrase"],
                        "metrics": sim
                    }

        # Check for internal repetition within the document itself
        for other_idx, other_p in enumerate(paragraphs):
            if other_idx == idx:
                continue
            sim = compute_paragraph_similarity(p_clean, other_p)
            # Higher threshold for internal match
            if sim["score"] > 0.65 and sim["score"] > best_match["score"]:
                best_match = {
                    "score": sim["score"],
                    "source_type": "Internal Document Repetition",
                    "source_title": f"Paragraph #{other_idx + 1} in this manuscript",
                    "source_text": other_p,
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

        results.append({
            "paragraph_index": idx + 1,
            "text": p_clean,
            "similarity_pct": pct,
            "level": match_level,
            "source_type": best_match["source_type"],
            "source_title": best_match["source_title"],
            "source_text": best_match["source_text"][:360] + ("..." if len(best_match["source_text"]) > 360 else ""),
            "longest_identical_phrase": best_match["longest_phrase"]
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
