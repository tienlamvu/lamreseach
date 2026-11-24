import json
import re
import math
import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import requests as ext_requests
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, List
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from backend.database import init_db, get_connection
from backend.services import clean_doi, fetch_doi_metadata, sync_orcid_profile, sync_scholar_profile
from backend.pptx_generator import build_weekly_report_pptx
from backend.doc_tools import (
    extract_text_from_file_bytes,
    check_manuscript_duplicates,
    compare_two_word_documents,
)

app = FastAPI(
    title="MatSci Nexus — PhD Research & Lab Management Suite",
    version="2.0.0",
)

import inspect as _inspect

_cors_kwargs = dict(
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
if "allow_private_network" in _inspect.signature(CORSMiddleware.__init__).parameters:
    _cors_kwargs["allow_private_network"] = True
app.add_middleware(CORSMiddleware, **_cors_kwargs)


@app.middleware("http")
async def add_private_network_access_header(request: Request, call_next):
    """Ensure Private Network Access header is present for HTTPS -> local 127.0.0.1 bridge."""
    response = await call_next(request)
    response.headers["Access-Control-Allow-Private-Network"] = "true"
    return response

FRONTEND_DIR = Path(__file__).parent / "frontend"


@app.on_event("startup")
def on_startup():
    init_db()


# ============================================================================
# Pydantic Models
# ============================================================================

class DOILookupRequest(BaseModel):
    doi: str
    auto_save: bool = True


class PaperCreate(BaseModel):
    doi: Optional[str] = ""
    title: str
    authors: Optional[str] = ""
    journal: Optional[str] = ""
    year: Optional[int] = 2026
    volume: Optional[str] = ""
    issue: Optional[str] = ""
    pages: Optional[str] = ""
    abstract: Optional[str] = ""
    url: Optional[str] = ""
    pdf_url: Optional[str] = ""
    citation_count: Optional[int] = 0
    material_system: Optional[str] = ""
    synthesis_method: Optional[str] = ""
    characterization_tags: Optional[str] = ""
    status: Optional[str] = "To Read"
    rating: Optional[int] = 4
    notes: Optional[str] = ""
    bibtex: Optional[str] = ""
    in_weekly_report: Optional[int] = 1


class NoteCreate(BaseModel):
    title: str
    category: Optional[str] = "Experiment / Synthesis"
    sample_id: Optional[str] = ""
    material_formula: Optional[str] = ""
    precursors: Optional[str] = ""
    conditions: Optional[str] = ""
    characterization_methods: Optional[str] = ""
    content: Optional[str] = ""
    key_findings: Optional[str] = ""
    tags: Optional[str] = ""
    pinned: Optional[int] = 0
    in_weekly_report: Optional[int] = 1


class ScheduleCreate(BaseModel):
    title: str
    event_type: Optional[str] = "Synthesis / Furnace"
    instrument_or_location: Optional[str] = ""
    start_date: str
    start_time: Optional[str] = "09:00"
    end_time: Optional[str] = "11:00"
    priority: Optional[str] = "Medium"
    status: Optional[str] = "Scheduled"
    sample_id: Optional[str] = ""
    description: Optional[str] = ""
    in_weekly_report: Optional[int] = 1


class WeeklyReportPayload(BaseModel):
    title: str = "Weekly Research Progress Report"
    week_start: str
    week_end: str
    presenter_name: str
    advisor_name: str
    lab_name: str
    university: str
    theme_color: str = "oxford_navy"
    summary_achievements: str
    experimental_results: list = []
    literature_review: list = []
    blockers_troubleshooting: str
    next_week_plan: str
    metrics: dict = {}


class ProfileUpdate(BaseModel):
    full_name: str
    title_role: str
    affiliation: str
    advisor: str
    research_focus: str
    orcid_id: Optional[str] = ""
    scholar_id: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    website: Optional[str] = ""
    location: Optional[str] = ""
    total_citations: Optional[int] = 0
    h_index: Optional[int] = 0
    i10_index: Optional[int] = 0
    bio: Optional[str] = ""
    education: Optional[list] = []
    experiences: Optional[list] = []
    publications: Optional[list] = []
    conferences: Optional[list] = []
    skills: Optional[dict] = {}
    awards: Optional[list] = []


class SyncOrcidRequest(BaseModel):
    orcid_id: str


class SyncScholarRequest(BaseModel):
    scholar_input: str


class StructureCreate(BaseModel):
    name: Optional[str] = "Crystal Structure"
    formula: Optional[str] = ""
    chemical_formula: Optional[str] = ""
    crystal_system: Optional[str] = "Cubic"
    space_group: Optional[str] = "Pm-3m (221)"
    a: Optional[float] = 4.006
    b: Optional[float] = 4.006
    c: Optional[float] = 4.006
    alpha: Optional[float] = 90.0
    beta: Optional[float] = 90.0
    gamma: Optional[float] = 90.0
    volume: Optional[float] = 64.29
    natoms: Optional[int] = 5
    cif_content: Optional[str] = ""
    raw_cif: Optional[str] = ""
    poscar_content: Optional[str] = ""
    poscar_text: Optional[str] = ""
    dft_code: Optional[str] = "VASP"
    functional: Optional[str] = "PBE"
    dft_functional: Optional[str] = ""
    ecut: Optional[float] = 520.0
    cutoff_energy: Optional[float] = None
    kpoints: Optional[str] = "8x8x8"
    bandgap: Optional[float] = 3.20
    bandgap_ev: Optional[float] = None
    bandgap_type: Optional[str] = "Direct"
    energy_per_atom: Optional[float] = -6.85
    total_energy_per_atom: Optional[float] = None
    magnetic_state: Optional[str] = "NM"
    materials_project_id: Optional[str] = ""
    mp_id: Optional[str] = ""
    structure_type: Optional[str] = "Bulk 3D"
    notes: Optional[str] = ""
    in_weekly_report: Optional[int] = 1


class CIFParseRequest(BaseModel):
    cif_text: str
    filename: Optional[str] = "structure.cif"


def _tokenize_cif_block_py(cif_text: str) -> dict:
    text = (cif_text or "").replace("\r\n", "\n").replace("\r", "\n")
    n = len(text)
    tokens = []
    i = 0
    while i < n:
        ch = text[i]
        if ch in (" ", "\t", "\n"):
            i += 1
            continue
        if ch == "#":
            while i < n and text[i] != "\n":
                i += 1
            continue
        if ch == ";" and (i == 0 or text[i - 1] == "\n"):
            i += 1
            start = i
            while i < n and not (text[i] == ";" and text[i - 1] == "\n"):
                i += 1
            tokens.append(("text", text[start:i].strip()))
            if i < n and text[i] == ";":
                i += 1
            continue
        if ch in ("'", '"'):
            q = ch
            i += 1
            start = i
            while i < n:
                if text[i] == q and (i + 1 == n or text[i + 1] in (" ", "\t", "\n")):
                    break
                if text[i] == "\n":
                    break
                i += 1
            tokens.append(("quoted", text[start:i]))
            if i < n and text[i] == q:
                i += 1
            continue
        start = i
        while i < n and text[i] not in (" ", "\t", "\n"):
            i += 1
        tokens.append(("word", text[start:i]))

    blocks = []
    cur = {"data_name": "", "tags": {}, "loops": []}
    idx = 0
    while idx < len(tokens):
        ttype, tval = tokens[idx]
        if ttype == "word" and tval.lower().startswith("data_"):
            if cur["data_name"] or cur["tags"] or cur["loops"]:
                blocks.append(cur)
            cur = {"data_name": tval[5:], "tags": {}, "loops": []}
            idx += 1
            continue
        if ttype == "word" and tval.lower() == "loop_":
            idx += 1
            headers = []
            while idx < len(tokens) and tokens[idx][0] == "word" and tokens[idx][1].startswith("_"):
                headers.append(tokens[idx][1].lower())
                idx += 1
            rows = []
            if headers:
                ncol = len(headers)
                buf = []
                while idx < len(tokens):
                    t2, v2 = tokens[idx]
                    v2l = v2.lower()
                    if t2 == "word" and (v2.startswith("_") or v2l in ("loop_", "stop_", "global_") or v2l.startswith(("data_", "save_"))):
                        break
                    buf.append(v2)
                    idx += 1
                    if len(buf) == ncol:
                        rows.append(buf[:])
                        buf.clear()
            cur["loops"].append({"headers": headers, "rows": rows})
            continue
        if ttype == "word" and tval.startswith("_"):
            tag = tval.lower()
            idx += 1
            if idx < len(tokens):
                t2, v2 = tokens[idx]
                if not (t2 == "word" and (v2.startswith("_") or v2.lower() == "loop_" or v2.lower().startswith("data_"))):
                    cur["tags"][tag] = v2
                    idx += 1
            continue
        idx += 1
    if cur["data_name"] or cur["tags"] or cur["loops"]:
        blocks.append(cur)

    for b in blocks:
        if any(any("atom_site_fract_x" in h or "atom_site_cartn_x" in h for h in lp["headers"]) for lp in b["loops"]):
            return b
    for b in blocks:
        if "_cell_length_a" in b["tags"]:
            return b
    return blocks[0] if blocks else {"data_name": "", "tags": {}, "loops": []}


def _parse_cif_num_py(raw):
    if raw is None:
        return None
    s = str(raw).strip().strip("'\"").strip()
    if not s or s in (".", "?"):
        return None
    s = re.sub(r"\(\d+\)", "", s).strip()
    if "/" in s:
        try:
            n_s, d_s = s.split("/", 1)
            dv = float(d_s)
            return float(n_s) / dv if dv != 0 else None
        except Exception:
            return None
    try:
        v = float(s)
        return v if math.isfinite(v) else None
    except Exception:
        return None


def _parse_symop_xyz_py(expr: str):
    cleaned = re.sub(r"\s+", "", str(expr or "").strip().strip("'\"")).lower()
    parts = cleaned.split(",")
    if len(parts) != 3:
        return None
    R = [[0.0, 0.0, 0.0], [0.0, 0.0, 0.0], [0.0, 0.0, 0.0]]
    t = [0.0, 0.0, 0.0]
    ax_map = {"x": 0, "y": 1, "z": 2}
    for row in range(3):
        p = parts[row]
        if not p:
            return None
        terms = re.findall(r"[+-]?[^+-]+", p)
        for term in terms:
            m_ax = re.match(r"^([+-]?)([0-9./]*)\*?([xyz])$", term)
            if m_ax:
                sgn = -1.0 if m_ax.group(1) == "-" else 1.0
                c_str = m_ax.group(2)
                coeff = _parse_cif_num_py(c_str) if c_str else 1.0
                if coeff is None:
                    return None
                R[row][ax_map[m_ax.group(3)]] += sgn * coeff
            else:
                num = _parse_cif_num_py(term)
                if num is None:
                    return None
                t[row] += num
        t[row] = t[row] % 1.0
        if t[row] < 1e-6 or t[row] > 1.0 - 1e-6:
            t[row] = 0.0
    det = (
        R[0][0] * (R[1][1] * R[2][2] - R[1][2] * R[2][1])
        - R[0][1] * (R[1][0] * R[2][2] - R[1][2] * R[2][0])
        + R[0][2] * (R[1][0] * R[2][1] - R[1][1] * R[2][0])
    )
    if abs(det) < 0.5:
        return None
    return (R, t, str(expr).strip().strip("'\""))


def parse_cif_string(cif_text: str) -> dict:
    """Spec-compliant CIF 1.1 parser with exact symmetry expansion and POSCAR generation."""
    block = _tokenize_cif_block_py(cif_text)
    tags = block.get("tags", {})

    def get_float(tag, default=0.0):
        v = _parse_cif_num_py(tags.get(tag))
        return v if v is not None else default

    a = get_float("_cell_length_a", 4.0)
    b = get_float("_cell_length_b", a)
    c = get_float("_cell_length_c", a)
    alpha = get_float("_cell_angle_alpha", 90.0)
    beta = get_float("_cell_angle_beta", 90.0)
    gamma = get_float("_cell_angle_gamma", 90.0)

    ar = math.radians(alpha)
    br = math.radians(beta)
    gr = math.radians(gamma)
    sin_g = math.sin(gr) if abs(math.sin(gr)) > 1e-12 else 1.0
    ax, ay, az = a, 0.0, 0.0
    bx, by, bz = b * math.cos(gr), b * sin_g, 0.0
    cx = c * math.cos(br)
    cy = c * (math.cos(ar) - math.cos(br) * math.cos(gr)) / sin_g
    cz = math.sqrt(max(0.0, c * c - cx * cx - cy * cy))
    vecs = ((ax, ay, az), (bx, by, bz), (cx, cy, cz))

    val_in_sqrt = 1.0 - math.cos(ar)**2 - math.cos(br)**2 - math.cos(gr)**2 + 2.0 * math.cos(ar) * math.cos(br) * math.cos(gr)
    calc_vol = a * b * c * math.sqrt(val_in_sqrt) if val_in_sqrt > 0 else a * b * c
    raw_vol = get_float("_cell_volume", 0.0)
    vol = round(raw_vol if raw_vol > 0 else calc_vol, 4)

    sg_hm = (tags.get("_symmetry_space_group_name_h-m") or tags.get("_space_group_name_h-m_alt") or "P 1").strip()
    sg_it_v = _parse_cif_num_py(tags.get("_space_group_it_number") or tags.get("_symmetry_int_tables_number"))
    sg_it = int(round(sg_it_v)) if sg_it_v is not None else 1
    space_group = f"{sg_hm} ({sg_it})" if (sg_hm and sg_it and f"({sg_it})" not in sg_hm) else (sg_hm or "P 1")

    raw_setting = (tags.get("_space_group_crystal_system") or tags.get("_symmetry_cell_setting") or "").strip()
    if raw_setting:
        crystal_system = raw_setting.capitalize()
    elif abs(a - b) < 0.02 and abs(b - c) < 0.02 and abs(alpha - 90) < 0.5 and abs(beta - 90) < 0.5 and abs(gamma - 90) < 0.5:
        crystal_system = "Cubic"
    elif abs(a - b) < 0.02 and abs(alpha - 90) < 0.5 and abs(beta - 90) < 0.5 and (abs(gamma - 120) < 0.5 or abs(gamma - 60) < 0.5):
        crystal_system = "Hexagonal"
    elif abs(a - b) < 0.02 and abs(alpha - 90) < 0.5 and abs(beta - 90) < 0.5 and abs(gamma - 90) < 0.5:
        crystal_system = "Tetragonal"
    elif abs(alpha - 90) < 0.5 and abs(beta - 90) < 0.5 and abs(gamma - 90) < 0.5:
        crystal_system = "Orthorhombic"
    elif abs(alpha - 90) < 0.5 and abs(gamma - 90) < 0.5:
        crystal_system = "Monoclinic"
    else:
        crystal_system = "Triclinic"

    # Extract explicit symmetry operations from CIF loop
    symops = []
    for lp in block.get("loops", []):
        hdrs = lp["headers"]
        s_idx = -1
        for i_h, h in enumerate(hdrs):
            if h in ("_space_group_symop_operation_xyz", "_symmetry_equiv_pos_as_xyz"):
                s_idx = i_h
                break
        if s_idx != -1:
            for row in lp["rows"]:
                op = _parse_symop_xyz_py(row[s_idx])
                if op:
                    symops.append(op)
    if not symops:
        symops = [([[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]], [0.0, 0.0, 0.0], "x, y, z")]

    # Parse asymmetric sites
    asymm = []
    for lp in block.get("loops", []):
        hdrs = lp["headers"]
        if "_atom_site_fract_x" not in hdrs or "_atom_site_fract_y" not in hdrs or "_atom_site_fract_z" not in hdrs:
            continue
        x_idx = hdrs.index("_atom_site_fract_x")
        y_idx = hdrs.index("_atom_site_fract_y")
        z_idx = hdrs.index("_atom_site_fract_z")
        type_idx = hdrs.index("_atom_site_type_symbol") if "_atom_site_type_symbol" in hdrs else -1
        label_idx = hdrs.index("_atom_site_label") if "_atom_site_label" in hdrs else -1
        occ_idx = hdrs.index("_atom_site_occupancy") if "_atom_site_occupancy" in hdrs else -1
        for row in lp["rows"]:
            fx = _parse_cif_num_py(row[x_idx])
            fy = _parse_cif_num_py(row[y_idx])
            fz = _parse_cif_num_py(row[z_idx])
            if fx is None or fy is None or fz is None:
                continue
            raw_type = row[type_idx] if type_idx != -1 else ""
            raw_lbl = row[label_idx] if label_idx != -1 else ""
            m_el = re.match(r"([A-Za-z]{1,2})", raw_type or "") or re.match(r"([A-Za-z]{1,2})", raw_lbl or "")
            sym = m_el.group(1).capitalize() if m_el else "X"
            lbl = raw_lbl if (raw_lbl and raw_lbl not in (".", "?")) else f"{sym}{len(asymm)+1}"
            occ_v = _parse_cif_num_py(row[occ_idx]) if occ_idx != -1 else 1.0
            occ = round(occ_v, 4) if (occ_v is not None and 0 < occ_v <= 1.05) else 1.0
            asymm.append({"element": sym, "label": lbl, "x": round(fx, 6), "y": round(fy, 6), "z": round(fz, 6), "occupancy": occ})
        if asymm:
            break

    # Expand asymmetric unit into full unit cell with periodic Cartesian deduplication
    def _wrap1(v):
        r = v % 1.0
        return 0.0 if (r < 1e-6 or r > 1.0 - 1e-6) else r

    def _min_dist(u1, v1, w1, u2, v2, w2):
        du = (u1 - u2) - round(u1 - u2)
        dv = (v1 - v2) - round(v1 - v2)
        dw = (w1 - w2) - round(w1 - w2)
        dx = du * vecs[0][0] + dv * vecs[1][0] + dw * vecs[2][0]
        dy = du * vecs[0][1] + dv * vecs[1][1] + dw * vecs[2][1]
        dz = du * vecs[0][2] + dv * vecs[1][2] + dw * vecs[2][2]
        return math.sqrt(dx * dx + dy * dy + dz * dz)

    atoms = []
    el_counts_run = {}
    for site in asymm:
        site_imgs = []
        for R, t, _ in symops:
            nu = _wrap1(R[0][0] * site["x"] + R[0][1] * site["y"] + R[0][2] * site["z"] + t[0])
            nv = _wrap1(R[1][0] * site["x"] + R[1][1] * site["y"] + R[1][2] * site["z"] + t[1])
            nw = _wrap1(R[2][0] * site["x"] + R[2][1] * site["y"] + R[2][2] * site["z"] + t[2])
            if any(_min_dist(nu, nv, nw, p["x"], p["y"], p["z"]) < 0.05 for p in site_imgs):
                continue
            if any(p["element"] == site["element"] and _min_dist(nu, nv, nw, p["x"], p["y"], p["z"]) < 0.05 for p in atoms):
                continue
            el_counts_run[site["element"]] = el_counts_run.get(site["element"], 0) + 1
            img = {
                "element": site["element"],
                "label": site["label"] if not site_imgs else f"{site['element']}{el_counts_run[site['element']]}",
                "x": round(nu, 6),
                "y": round(nv, 6),
                "z": round(nw, 6),
                "occupancy": site["occupancy"],
            }
            site_imgs.append(img)
            atoms.append(img)

    natoms = len(atoms)
    from collections import Counter
    if atoms:
        ec = Counter(at["element"] for at in atoms)
        g = 0
        for cnt in ec.values():
            g = math.gcd(g, cnt)
        g = g or 1
        formula = "".join(f"{el}{(cnt // g) if (cnt // g) > 1 else ''}" for el, cnt in ec.items())
    else:
        formula = (tags.get("_chemical_formula_sum") or tags.get("_chemical_name_common") or "UnknownFormula").replace(" ", "")

    # Build VASP POSCAR from full symmetry-expanded unit cell
    poscar_lines = [f"{formula} {crystal_system} {space_group}", "1.0"]
    poscar_lines.append(f"  {ax:14.8f} {ay:14.8f} {az:14.8f}")
    poscar_lines.append(f"  {bx:14.8f} {by:14.8f} {bz:14.8f}")
    poscar_lines.append(f"  {cx:14.8f} {cy:14.8f} {cz:14.8f}")

    if atoms:
        elem_order = []
        elem_map = {}
        for at in atoms:
            el = at["element"]
            if el not in elem_map:
                elem_order.append(el)
                elem_map[el] = []
            elem_map[el].append(at)
        poscar_lines.append(" " + " ".join(elem_order))
        poscar_lines.append(" " + " ".join(str(len(elem_map[el])) for el in elem_order))
        poscar_lines.append("Direct")
        for el in elem_order:
            for at in elem_map[el]:
                poscar_lines.append(f"  {at['x']:12.8f} {at['y']:12.8f} {at['z']:12.8f}")
    else:
        poscar_lines.extend([" X", " 1", "Direct", "  0.00000000   0.00000000   0.00000000"])

    poscar_content = "\n".join(poscar_lines) + "\n"

    return {
        "formula": formula,
        "name": f"{formula} ({crystal_system} {space_group.strip()})",
        "crystal_system": crystal_system,
        "space_group": space_group,
        "space_group_hm": sg_hm,
        "space_group_it": sg_it,
        "symops": [op[2] for op in symops],
        "asymmetric_atoms": asymm,
        "a": round(a, 6),
        "b": round(b, 6),
        "c": round(c, 6),
        "alpha": round(alpha, 4),
        "beta": round(beta, 4),
        "gamma": round(gamma, 4),
        "volume": round(vol, 4),
        "natoms": natoms,
        "cif_content": cif_text,
        "poscar_content": poscar_content,
        "atoms": atoms,
    }



class GoogleVerifyRequest(BaseModel):
    id_token: Optional[str] = ""
    access_token: Optional[str] = ""
    email: Optional[str] = ""
    name: Optional[str] = ""
    picture: Optional[str] = ""
    passcode: Optional[str] = ""


class AuthConfigUpdate(BaseModel):
    owner_email: str = "lamvt.skku@gmail.com"
    google_client_id: Optional[str] = ""
    email_relay_url: Optional[str] = ""


class EmailVerificationRequest(BaseModel):
    type: str  # "password_reset" or "registration_verify"
    to_email: str
    name: Optional[str] = "Researcher"
    otp_code: str
    reset_url: Optional[str] = ""


PRIMARY_OWNER_EMAIL = "lamvt.skku@gmail.com"
OWNER_SECURITY_PASSCODE = "skku2026"  # Master security passcode for lamvt.skku@gmail.com


def normalize_owner_email(raw_email: str) -> str:
    s = (raw_email or "").strip().lower().replace(",", ".")
    return s


# ============================================================================
# Helper: Profile Loader & Duplicate DOI Checker
# ============================================================================

def load_full_profile() -> dict:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM academic_profile WHERE id = 1")
    row = cur.fetchone()
    conn.close()
    if not row:
        return {}
    d = dict(row)
    d["education"] = json.loads(d.get("education_json") or "[]")
    d["experiences"] = json.loads(d.get("experiences_json") or "[]")
    d["publications"] = json.loads(d.get("publications_json") or "[]")
    d["conferences"] = json.loads(d.get("conferences_json") or "[]")
    d["skills"] = json.loads(d.get("skills_json") or "{}")
    d["awards"] = json.loads(d.get("awards_json") or "[]")
    d["owner_email"] = PRIMARY_OWNER_EMAIL
    return d


def find_existing_paper_by_doi(raw_doi: str, exclude_id: Optional[int] = None) -> Optional[dict]:
    if not raw_doi or not raw_doi.strip():
        return None
    normalized = clean_doi(raw_doi).lower().strip()
    if not normalized:
        return None
    conn = get_connection()
    cur = conn.cursor()
    if exclude_id is not None:
        cur.execute(
            "SELECT * FROM papers WHERE LOWER(TRIM(doi)) = ? AND id != ?",
            (normalized, exclude_id),
        )
    else:
        cur.execute(
            "SELECT * FROM papers WHERE LOWER(TRIM(doi)) = ?",
            (normalized,),
        )
    row = cur.fetchone()
    conn.close()
    return dict(row) if row else None


def dump_all_to_data_json():
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM papers ORDER BY id DESC")
        papers = [dict(r) for r in cur.fetchall()]
        cur.execute("SELECT * FROM cif_structures ORDER BY id DESC")
        structures = [dict(r) for r in cur.fetchall()]
        cur.execute("SELECT * FROM schedule_items ORDER BY start_date ASC, start_time ASC")
        schedule = [dict(r) for r in cur.fetchall()]
        conn.close()
        profile = load_full_profile()

        existing_users = {}
        existing_groups = {}
        target_path = Path(__file__).parent / "data.json"
        if target_path.exists():
            try:
                with open(target_path, "r", encoding="utf-8") as rf:
                    prior = json.load(rf)
                    existing_users = prior.get("users_registry") or {}
                    existing_groups = prior.get("user_groups") or {}
            except Exception:
                pass

        # Redact plaintext password hints so plain passwords are never written to data.json
        sanitized_users = {}
        for uk, uv in existing_users.items():
            if isinstance(uv, dict):
                uv_copy = dict(uv)
                if uv_copy.get("passwordPlainHint"):
                    uv_copy["passwordPlainHint"] = "••••••••"
                sanitized_users[uk] = uv_copy
            else:
                sanitized_users[uk] = uv

        obj = {
            "version": "4.0",
            "exported_at": datetime.now().isoformat(),
            "profile": profile,
            "papers": papers,
            "structures": structures,
            "schedule": schedule,
            "users_registry": sanitized_users,
            "user_groups": existing_groups,
        }
        for target in [FRONTEND_DIR / "data.json", Path(__file__).parent / "data.json"]:
            try:
                with open(target, "w", encoding="utf-8") as f:
                    json.dump(obj, f, indent=2, ensure_ascii=False)
            except Exception as write_err:
                print(f"Error writing to {target}: {write_err}")
    except Exception as e:
        print("Auto-export to data.json error:", e)



# ============================================================================
# Google Account Authentication & Owner Control API (Locked to lamvt.skku@gmail.com)
# ============================================================================

@app.get("/api/auth/config")
def get_auth_config():
    prof = load_full_profile()
    return {
        "owner_email": PRIMARY_OWNER_EMAIL,
        "google_client_id": prof.get("google_client_id") or "",
        "email_relay_url": prof.get("email_relay_url") or "",
    }


@app.put("/api/auth/config")
def update_auth_config(cfg: AuthConfigUpdate):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "UPDATE academic_profile SET owner_email = ?, google_client_id = ?, email_relay_url = ? WHERE id = 1",
        (PRIMARY_OWNER_EMAIL, (cfg.google_client_id or "").strip(), (cfg.email_relay_url or "").strip()),
    )
    conn.commit()
    conn.close()
    return get_auth_config()


@app.post("/api/auth/send-verification-email")
def api_send_verification_email(req: EmailVerificationRequest):
    smtp_host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.environ.get("SMTP_PORT", "587"))
    smtp_user = os.environ.get("SMTP_USER", "").strip()
    smtp_pass = os.environ.get("SMTP_PASS", "").strip()
    sender = os.environ.get("SMTP_FROM", smtp_user or "lamvt.skku@gmail.com")

    is_reset = req.type == "password_reset"
    action_title = "Password Reset" if is_reset else "Email Verification"
    subject = f"[MatSci Nexus] {action_title} Code ({req.otp_code})"

    html_body = f"""<!DOCTYPE html>
<html>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; background-color:#f1f5f9; margin:0; padding:24px 12px;">
  <div style="max-width:560px; margin:0 auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; box-shadow:0 4px 16px rgba(0,0,0,0.06);">
    <div style="background:linear-gradient(135deg,#1e3a8a,#2563eb); color:#ffffff; padding:20px 24px;">
      <h2 style="margin:0; font-size:19px; font-weight:700;">MatSci Nexus &bull; Account Security</h2>
      <p style="margin:4px 0 0; font-size:12.5px; opacity:0.85;">Sungkyunkwan University (SKKU) &bull; Vu Tien Lam Research Group</p>
    </div>
    <div style="padding:24px; color:#1e293b; font-size:14px; line-height:1.6;">
      <p style="margin-top:0;">Hello <strong>{req.name or 'Researcher'}</strong>,</p>
      <p>We received a request to {'reset the account password' if is_reset else 'verify the registered email'} for <code>{req.to_email}</code>.</p>
      <div style="background:#eff6ff; border:1.5px dashed #3b82f6; border-radius:10px; padding:18px; text-align:center; margin:20px 0;">
        <div style="font-size:11.5px; font-weight:700; color:#1e40af; text-transform:uppercase; letter-spacing:1px;">6-Digit Security Verification Code</div>
        <div style="font-size:32px; font-weight:900; letter-spacing:6px; font-family:Consolas,monospace; color:#1e3a8a; margin:8px 0;">{req.otp_code}</div>
        <div style="font-size:11.5px; color:#64748b;">Valid for 15 minutes. Never disclose this confidential code to anyone.</div>
      </div>
      {f'<p style="text-align:center; margin:18px 0;"><a href="{req.reset_url}" style="background:#2563eb; color:#ffffff; padding:10px 22px; border-radius:6px; text-decoration:none; font-weight:700; display:inline-block;">Click Here to Direct Reset &rarr;</a></p>' if req.reset_url else ''}
      <p style="font-size:12px; color:#64748b; margin-top:24px; border-top:1px solid #f1f5f9; padding-top:14px;">
        If you did not request this verification, please ignore this email. Your account credentials remain secure.
      </p>
    </div>
  </div>
</body>
</html>"""

    delivery_channel = "server_log"
    if smtp_user and smtp_pass:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"MatSci Nexus <{sender}>"
            msg["To"] = req.to_email
            msg.attach(MIMEText(html_body, "html"))

            with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as s:
                s.starttls()
                s.login(smtp_user, smtp_pass)
                s.send_message(msg)
            delivery_channel = "smtp_delivered"
        except Exception as e:
            delivery_channel = f"smtp_failed: {str(e)}"

    # CRITICAL: Never return the plain OTP code in client response!
    return {
        "status": "dispatched",
        "to_email": req.to_email,
        "type": req.type,
        "channel": delivery_channel,
    }


@app.post("/api/auth/google-verify")
def verify_google_login(req: GoogleVerifyRequest):
    email = ""
    name = ""
    picture = ""

    # 1. Verify Google OAuth 2.0 ID Token if provided
    if req.id_token:
        try:
            resp = ext_requests.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={req.id_token}",
                timeout=8,
            )
            if resp.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid Google OAuth ID Token.")
            token_data = resp.json()
            email = normalize_owner_email(token_data.get("email") or "")
            name = token_data.get("name") or "Vu Tien Lam"
            picture = token_data.get("picture") or ""
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Google token verification error: {str(e)}")
    # 2. Verify Google OAuth 2.0 Access Token (from Google Calendar OAuth popup)
    elif req.access_token:
        try:
            resp = ext_requests.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {req.access_token}"},
                timeout=8,
            )
            if resp.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid Google OAuth Access Token.")
            user_data = resp.json()
            email = normalize_owner_email(user_data.get("email") or "")
            name = user_data.get("name") or "Vu Tien Lam"
            picture = user_data.get("picture") or ""
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Google access token error: {str(e)}")
    elif req.passcode:
        # 3. Master Administrator Security Passcode verification
        if req.passcode.strip() != OWNER_SECURITY_PASSCODE:
            raise HTTPException(status_code=401, detail="Incorrect Administrator Security Passcode.")
        raw_e = normalize_owner_email(req.email or PRIMARY_OWNER_EMAIL)
        if raw_e != PRIMARY_OWNER_EMAIL:
            raise HTTPException(status_code=403, detail=f"Access Denied: Only {PRIMARY_OWNER_EMAIL} is authorized.")
        email = PRIMARY_OWNER_EMAIL
        name = (req.name or "").strip() or "Vu Tien Lam"
        picture = req.picture or ""
    else:
        raise HTTPException(
            status_code=401,
            detail="Authentication failed: Genuine Google Sign-In (OAuth 2.0 token) or Administrator Security Passcode is required.",
        )

    is_owner = (email.lower() == PRIMARY_OWNER_EMAIL.lower())

    return {
        "authenticated": True,
        "is_owner": is_owner,
        "role": "admin" if is_owner else "user",
        "email": email,
        "name": name,
        "picture": picture,
        "owner_email": PRIMARY_OWNER_EMAIL,
    }


# ============================================================================
# Dashboard API
# ============================================================================

@app.get("/api/dashboard")
def get_dashboard():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT * FROM papers ORDER BY id DESC")
    papers = [dict(r) for r in cur.fetchall()]

    cur.execute("SELECT * FROM cif_structures ORDER BY id DESC")
    structures = [dict(r) for r in cur.fetchall()]

    cur.execute("SELECT * FROM notes ORDER BY pinned DESC, id DESC")
    notes = [dict(r) for r in cur.fetchall()]

    cur.execute("SELECT * FROM schedule_items ORDER BY start_date ASC, start_time ASC")
    schedule = [dict(r) for r in cur.fetchall()]

    conn.close()
    profile = load_full_profile()

    return {
        "stats": {
            "total_papers": len(papers),
            "papers_read": sum(1 for p in papers if p.get("status") in ("Read", "Key Reference", "Cited in Thesis")),
            "total_structures": len(structures),
            "total_notes": len(notes),
            "upcoming_tasks": sum(1 for s in schedule if s.get("status") != "Completed"),
            "completed_tasks": sum(1 for s in schedule if s.get("status") == "Completed"),
            "total_citations": profile.get("total_citations", 0),
            "h_index": profile.get("h_index", 0),
        },
        "recent_papers": papers[:4],
        "recent_structures": structures[:4],
        "recent_notes": notes[:4],
        "upcoming_schedule": schedule[:6],
        "profile": profile,
    }


# ============================================================================
# Literature / DOI API (with Duplicate DOI Prevention)
# ============================================================================

@app.get("/api/papers")
def list_papers():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM papers ORDER BY id DESC")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows


@app.post("/api/papers/doi")
def add_or_resolve_doi(req: DOILookupRequest):
    cleaned = clean_doi(req.doi)
    if not cleaned:
        raise HTTPException(status_code=400, detail="Please provide a valid DOI string or URL.")

    # 1. Check for duplicate DOI BEFORE inserting (only when auto_save is True)
    if req.auto_save:
        existing = find_existing_paper_by_doi(cleaned)
        if existing:
            return JSONResponse(
                status_code=409,
                content={
                    "detail": f"Duplicate DOI detected! The paper \"{existing['title']}\" (DOI: {existing['doi']}) is already in your library and cannot be added again.",
                    "duplicate": True,
                    "existing_paper": existing,
                },
            )

    # 2. Fetch metadata from Crossref / OpenAlex / Semantic Scholar
    try:
        meta = fetch_doi_metadata(cleaned)
    except ValueError as e:
        existing = find_existing_paper_by_doi(cleaned)
        if existing and not req.auto_save:
            return existing
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        existing = find_existing_paper_by_doi(cleaned)
        if existing and not req.auto_save:
            return existing
        raise HTTPException(status_code=500, detail=f"DOI lookup error: {str(e)}")

    if not req.auto_save:
        return meta

    # Double-check resolved DOI against database when auto_save is True
    existing_resolved = find_existing_paper_by_doi(meta["doi"])
    if existing_resolved:
        return JSONResponse(
            status_code=409,
            content={
                "detail": f"Duplicate DOI detected! The paper \"{existing_resolved['title']}\" (DOI: {existing_resolved['doi']}) is already in your library.",
                "duplicate": True,
                "existing_paper": existing_resolved,
            },
        )

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO papers (
            doi, title, authors, journal, year, volume, issue, pages,
            abstract, url, pdf_url, citation_count, material_system,
            synthesis_method, characterization_tags, status, rating,
            notes, bibtex, in_weekly_report
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        meta["doi"],
        meta["title"],
        meta["authors"],
        meta["journal"],
        meta["year"],
        meta["volume"],
        meta["issue"],
        meta["pages"],
        meta["abstract"],
        meta["url"],
        meta["pdf_url"],
        meta["citation_count"],
        meta["material_system"],
        meta["synthesis_method"],
        meta["characterization_tags"],
        "To Read",
        4,
        "",
        meta["bibtex"],
        1,
    ))
    new_id = cur.lastrowid
    conn.commit()
    cur.execute("SELECT * FROM papers WHERE id = ?", (new_id,))
    saved = dict(cur.fetchone())
    conn.close()
    return saved


@app.post("/api/papers")
def create_paper(paper: PaperCreate):
    cleaned_doi = clean_doi(paper.doi) if paper.doi else ""
    if cleaned_doi:
        existing = find_existing_paper_by_doi(cleaned_doi)
        if existing:
            return JSONResponse(
                status_code=409,
                content={
                    "detail": f"Duplicate DOI detected! The paper \"{existing['title']}\" (DOI: {existing['doi']}) already exists in your library.",
                    "duplicate": True,
                    "existing_paper": existing,
                },
            )

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO papers (
            doi, title, authors, journal, year, volume, issue, pages,
            abstract, url, pdf_url, citation_count, material_system,
            synthesis_method, characterization_tags, status, rating,
            notes, bibtex, in_weekly_report
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        cleaned_doi, paper.title, paper.authors, paper.journal, paper.year,
        paper.volume, paper.issue, paper.pages, paper.abstract, paper.url,
        paper.pdf_url, paper.citation_count, paper.material_system,
        paper.synthesis_method, paper.characterization_tags, paper.status,
        paper.rating, paper.notes, paper.bibtex, paper.in_weekly_report
    ))
    new_id = cur.lastrowid
    conn.commit()
    cur.execute("SELECT * FROM papers WHERE id = ?", (new_id,))
    row = dict(cur.fetchone())
    conn.close()
    dump_all_to_data_json()
    return row


@app.put("/api/papers/{paper_id}")
def update_paper(paper_id: int, paper: PaperCreate):
    cleaned_doi = clean_doi(paper.doi) if paper.doi else ""
    if cleaned_doi:
        existing = find_existing_paper_by_doi(cleaned_doi, exclude_id=paper_id)
        if existing:
            return JSONResponse(
                status_code=409,
                content={
                    "detail": f"Duplicate DOI detected! Another paper \"{existing['title']}\" already uses DOI {existing['doi']}.",
                    "duplicate": True,
                    "existing_paper": existing,
                },
            )

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        UPDATE papers SET
            doi=?, title=?, authors=?, journal=?, year=?, volume=?, issue=?, pages=?,
            abstract=?, url=?, pdf_url=?, citation_count=?, material_system=?,
            synthesis_method=?, characterization_tags=?, status=?, rating=?,
            notes=?, bibtex=?, in_weekly_report=?
        WHERE id=?
    """, (
        cleaned_doi, paper.title, paper.authors, paper.journal, paper.year,
        paper.volume, paper.issue, paper.pages, paper.abstract, paper.url,
        paper.pdf_url, paper.citation_count, paper.material_system,
        paper.synthesis_method, paper.characterization_tags, paper.status,
        paper.rating, paper.notes, paper.bibtex, paper.in_weekly_report,
        paper_id
    ))
    conn.commit()
    cur.execute("SELECT * FROM papers WHERE id = ?", (paper_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Paper not found")
    dump_all_to_data_json()
    return dict(row)


@app.delete("/api/papers/{paper_id}")
def delete_paper(paper_id: int):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM papers WHERE id = ?", (paper_id,))
    conn.commit()
    conn.close()
    dump_all_to_data_json()
    return {"deleted": True, "id": paper_id}


# ============================================================================
# Lab Notes & Synthesis Log API
# ============================================================================

@app.get("/api/notes")
def list_notes():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM notes ORDER BY pinned DESC, id DESC")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows


@app.post("/api/notes")
def create_note(note: NoteCreate):
    conn = get_connection()
    cur = conn.cursor()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    cur.execute("""
        INSERT INTO notes (
            title, category, sample_id, material_formula, precursors,
            conditions, characterization_methods, content, key_findings,
            tags, pinned, in_weekly_report, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        note.title, note.category, note.sample_id, note.material_formula,
        note.precursors, note.conditions, note.characterization_methods,
        note.content, note.key_findings, note.tags, note.pinned,
        note.in_weekly_report, now_str, now_str
    ))
    new_id = cur.lastrowid
    conn.commit()
    cur.execute("SELECT * FROM notes WHERE id = ?", (new_id,))
    row = dict(cur.fetchone())
    conn.close()
    return row


@app.put("/api/notes/{note_id}")
def update_note(note_id: int, note: NoteCreate):
    conn = get_connection()
    cur = conn.cursor()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    cur.execute("""
        UPDATE notes SET
            title=?, category=?, sample_id=?, material_formula=?, precursors=?,
            conditions=?, characterization_methods=?, content=?, key_findings=?,
            tags=?, pinned=?, in_weekly_report=?, updated_at=?
        WHERE id=?
    """, (
        note.title, note.category, note.sample_id, note.material_formula,
        note.precursors, note.conditions, note.characterization_methods,
        note.content, note.key_findings, note.tags, note.pinned,
        note.in_weekly_report, now_str, note_id
    ))
    conn.commit()
    cur.execute("SELECT * FROM notes WHERE id = ?", (note_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Note not found")
    return dict(row)


@app.delete("/api/notes/{note_id}")
def delete_note(note_id: int):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM notes WHERE id = ?", (note_id,))
    conn.commit()
    conn.close()
    return {"deleted": True, "id": note_id}


# ============================================================================
# Crystal Structures & Simulation Database (*.cif) API
# ============================================================================

@app.get("/api/structures")
def list_structures(search: Optional[str] = "", system: Optional[str] = ""):
    conn = get_connection()
    cur = conn.cursor()
    query = "SELECT * FROM cif_structures"
    params = []
    conditions = []
    if search:
        s = f"%{search.strip()}%"
        conditions.append("(name LIKE ? OR formula LIKE ? OR space_group LIKE ? OR materials_project_id LIKE ? OR notes LIKE ?)")
        params.extend([s, s, s, s, s])
    if system and system != "ALL":
        conditions.append("crystal_system = ?")
        params.append(system)
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
    query += " ORDER BY id DESC"
    cur.execute(query, params)
    rows = []
    for r in cur.fetchall():
        d = dict(r)
        d["chemical_formula"] = d.get("formula") or ""
        d["raw_cif"] = d.get("cif_content") or ""
        d["poscar_text"] = d.get("poscar_content") or ""
        d["dft_functional"] = d.get("functional") or ""
        d["cutoff_energy"] = d.get("ecut") or 520
        d["bandgap_ev"] = d.get("bandgap") or 0.0
        d["total_energy_per_atom"] = d.get("energy_per_atom") or 0.0
        d["mp_id"] = d.get("materials_project_id") or ""
        rows.append(d)
    conn.close()
    return rows


@app.get("/api/structures/{struct_id}")
def get_structure(struct_id: int):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM cif_structures WHERE id = ?", (struct_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Structure not found")
    d = dict(row)
    d["chemical_formula"] = d.get("formula") or ""
    d["raw_cif"] = d.get("cif_content") or ""
    d["poscar_text"] = d.get("poscar_content") or ""
    d["dft_functional"] = d.get("functional") or ""
    d["cutoff_energy"] = d.get("ecut") or 520
    d["bandgap_ev"] = d.get("bandgap") or 0.0
    d["total_energy_per_atom"] = d.get("energy_per_atom") or 0.0
    d["mp_id"] = d.get("materials_project_id") or ""
    return d


@app.post("/api/structures")
def create_structure(s: StructureCreate):
    conn = get_connection()
    cur = conn.cursor()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")

    formula = (s.formula or s.chemical_formula or "Unknown Formula").strip()
    name = (s.name or formula or "Crystal Structure").strip()
    cif_content = s.cif_content or s.raw_cif or ""
    poscar_content = s.poscar_content or s.poscar_text or ""
    functional = s.functional or s.dft_functional or "PBE"
    ecut = s.ecut if s.cutoff_energy is None else s.cutoff_energy
    bandgap = s.bandgap if s.bandgap_ev is None else s.bandgap_ev
    energy_per_atom = s.energy_per_atom if s.total_energy_per_atom is None else s.total_energy_per_atom
    mp_id = s.materials_project_id or s.mp_id or ""

    cur.execute("""
        INSERT INTO cif_structures (
            name, formula, crystal_system, space_group,
            a, b, c, alpha, beta, gamma, volume, natoms,
            cif_content, poscar_content, dft_code, functional,
            ecut, kpoints, bandgap, bandgap_type, energy_per_atom,
            magnetic_state, materials_project_id, structure_type,
            notes, in_weekly_report, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        name, formula, s.crystal_system, s.space_group,
        s.a, s.b, s.c, s.alpha, s.beta, s.gamma, s.volume, s.natoms,
        cif_content, poscar_content, s.dft_code, functional,
        ecut, s.kpoints, bandgap, s.bandgap_type, energy_per_atom,
        s.magnetic_state, mp_id, s.structure_type,
        s.notes, s.in_weekly_report, now_str, now_str
    ))
    new_id = cur.lastrowid
    conn.commit()
    cur.execute("SELECT * FROM cif_structures WHERE id = ?", (new_id,))
    row = dict(cur.fetchone())
    conn.close()
    row["chemical_formula"] = row.get("formula") or ""
    row["raw_cif"] = row.get("cif_content") or ""
    row["poscar_text"] = row.get("poscar_content") or ""
    row["dft_functional"] = row.get("functional") or ""
    row["cutoff_energy"] = row.get("ecut") or 520
    row["bandgap_ev"] = row.get("bandgap") or 0.0
    row["total_energy_per_atom"] = row.get("energy_per_atom") or 0.0
    row["mp_id"] = row.get("materials_project_id") or ""
    dump_all_to_data_json()
    return row


@app.put("/api/structures/{struct_id}")
def update_structure(struct_id: int, s: StructureCreate):
    conn = get_connection()
    cur = conn.cursor()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")

    formula = (s.formula or s.chemical_formula or "Unknown Formula").strip()
    name = (s.name or formula or "Crystal Structure").strip()
    cif_content = s.cif_content or s.raw_cif or ""
    poscar_content = s.poscar_content or s.poscar_text or ""
    functional = s.functional or s.dft_functional or "PBE"
    ecut = s.ecut if s.cutoff_energy is None else s.cutoff_energy
    bandgap = s.bandgap if s.bandgap_ev is None else s.bandgap_ev
    energy_per_atom = s.energy_per_atom if s.total_energy_per_atom is None else s.total_energy_per_atom
    mp_id = s.materials_project_id or s.mp_id or ""

    cur.execute("""
        UPDATE cif_structures SET
            name=?, formula=?, crystal_system=?, space_group=?,
            a=?, b=?, c=?, alpha=?, beta=?, gamma=?, volume=?, natoms=?,
            cif_content=?, poscar_content=?, dft_code=?, functional=?,
            ecut=?, kpoints=?, bandgap=?, bandgap_type=?, energy_per_atom=?,
            magnetic_state=?, materials_project_id=?, structure_type=?,
            notes=?, in_weekly_report=?, updated_at=?
        WHERE id=?
    """, (
        name, formula, s.crystal_system, s.space_group,
        s.a, s.b, s.c, s.alpha, s.beta, s.gamma, s.volume, s.natoms,
        cif_content, poscar_content, s.dft_code, functional,
        ecut, s.kpoints, bandgap, s.bandgap_type, energy_per_atom,
        s.magnetic_state, mp_id, s.structure_type,
        s.notes, s.in_weekly_report, now_str, struct_id
    ))
    conn.commit()
    cur.execute("SELECT * FROM cif_structures WHERE id = ?", (struct_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Structure not found")
    d = dict(row)
    d["chemical_formula"] = d.get("formula") or ""
    d["raw_cif"] = d.get("cif_content") or ""
    d["poscar_text"] = d.get("poscar_content") or ""
    d["dft_functional"] = d.get("functional") or ""
    d["cutoff_energy"] = d.get("ecut") or 520
    d["bandgap_ev"] = d.get("bandgap") or 0.0
    d["total_energy_per_atom"] = d.get("energy_per_atom") or 0.0
    d["mp_id"] = d.get("materials_project_id") or ""
    dump_all_to_data_json()
    return d


@app.delete("/api/structures/{struct_id}")
def delete_structure(struct_id: int):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM cif_structures WHERE id = ?", (struct_id,))
    conn.commit()
    conn.close()
    dump_all_to_data_json()
    return {"deleted": True, "id": struct_id}


@app.post("/api/structures/parse-cif")
def parse_cif_endpoint(req: CIFParseRequest):
    if not req.cif_text or not req.cif_text.strip():
        raise HTTPException(status_code=400, detail="CIF text content is empty.")
    try:
        parsed = parse_cif_string(req.cif_text)
        return parsed
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CIF: {str(e)}")


# ============================================================================
# Work Schedule & Instrument Booking API
# ============================================================================

@app.get("/api/schedule")
def list_schedule():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM schedule_items ORDER BY start_date ASC, start_time ASC")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows


@app.post("/api/schedule")
def create_schedule_item(item: ScheduleCreate):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO schedule_items (
            title, event_type, instrument_or_location, start_date,
            start_time, end_time, priority, status, sample_id,
            description, in_weekly_report
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        item.title, item.event_type, item.instrument_or_location,
        item.start_date, item.start_time, item.end_time,
        item.priority, item.status, item.sample_id,
        item.description, item.in_weekly_report
    ))
    new_id = cur.lastrowid
    conn.commit()
    cur.execute("SELECT * FROM schedule_items WHERE id = ?", (new_id,))
    row = dict(cur.fetchone())
    conn.close()
    return row


@app.put("/api/schedule/{item_id}")
def update_schedule_item(item_id: int, item: ScheduleCreate):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        UPDATE schedule_items SET
            title=?, event_type=?, instrument_or_location=?, start_date=?,
            start_time=?, end_time=?, priority=?, status=?, sample_id=?,
            description=?, in_weekly_report=?
        WHERE id=?
    """, (
        item.title, item.event_type, item.instrument_or_location,
        item.start_date, item.start_time, item.end_time,
        item.priority, item.status, item.sample_id,
        item.description, item.in_weekly_report, item_id
    ))
    conn.commit()
    cur.execute("SELECT * FROM schedule_items WHERE id = ?", (item_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Schedule item not found")
    return dict(row)


@app.delete("/api/schedule/{item_id}")
def delete_schedule_item(item_id: int):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM schedule_items WHERE id = ?", (item_id,))
    conn.commit()
    conn.close()
    return {"deleted": True, "id": item_id}


# ============================================================================
# Weekly Report & PowerPoint (.pptx) Export API
# ============================================================================

@app.get("/api/reports/autofill")
def autofill_weekly_report():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT * FROM cif_structures WHERE in_weekly_report = 1 ORDER BY id DESC")
    rep_structs = [dict(r) for r in cur.fetchall()]

    cur.execute("SELECT * FROM notes WHERE in_weekly_report = 1 ORDER BY id DESC")
    rep_notes = [dict(r) for r in cur.fetchall()]

    cur.execute("SELECT * FROM papers WHERE in_weekly_report = 1 ORDER BY id DESC")
    rep_papers = [dict(r) for r in cur.fetchall()]

    cur.execute("SELECT * FROM schedule_items ORDER BY start_date ASC")
    all_sched = [dict(r) for r in cur.fetchall()]

    conn.close()
    prof = load_full_profile()

    today = datetime.now().date()
    monday = today - timedelta(days=today.weekday())
    friday = monday + timedelta(days=4)

    completed_lines = []
    for s in all_sched:
        if s.get("status") == "Completed" and s.get("in_weekly_report"):
            loc = f" ({s['instrument_or_location']})" if s.get("instrument_or_location") else ""
            completed_lines.append(f"Completed {s['title']}{loc}: {s.get('description', '')}".strip(": "))

    for st in rep_structs[:3]:
        completed_lines.append(f"Optimized {st['formula']} ({st['space_group']}): Eg = {st['bandgap']} eV ({st['bandgap_type']}), E_tot = {st['energy_per_atom']} eV/atom.")

    if not completed_lines:
        completed_lines = [
            "Completed first-principles DFT geometric relaxation and band structure calculations for BaTiO3 and BaSnO3 cubic perovskites.",
            "Constructed 2D monolayer MoS2 and Ti3C2Tx supercells; computed projected density of states (PDOS).",
            "Calculated frequency-dependent dielectric functions and optical absorption spectra.",
            "Reviewed literature on defect physics and transparent conducting perovskites."
        ]

    exp_rows = []
    if rep_structs:
        for s in rep_structs:
            exp_rows.append({
                "sample_id": s.get("formula") or "DFT-Cell",
                "material": f"{s.get('name', '')} [{s.get('space_group', '')}]",
                "conditions": f"{s.get('dft_code', 'VASP')} | {s.get('functional', 'PBE')} | Ecut={s.get('ecut', 520)} eV | {s.get('kpoints', '8x8x8')}",
                "methods": f"Bandgap: {s.get('bandgap', 0.0)} eV ({s.get('bandgap_type', 'Direct')})",
                "findings": s.get("notes") or f"Lattice relaxed: a={s.get('a')} Å, V={s.get('volume')} Å³, Energy={s.get('energy_per_atom')} eV/atom."
            })
    else:
        for n in rep_notes:
            exp_rows.append({
                "sample_id": n.get("sample_id") or "EXP-01",
                "material": n.get("material_formula") or n.get("title", "")[:30],
                "conditions": n.get("conditions") or "Standard protocol",
                "methods": n.get("characterization_methods") or "DFT / VASP",
                "findings": n.get("key_findings") or "Convergence confirmed."
            })

    lit_rows = []
    for p in rep_papers:
        lit_rows.append({
            "title": p.get("title", ""),
            "journal": f"{p.get('journal', '')} ({p.get('year', '')}) | DOI: {p.get('doi', '')}",
            "material": f"{p.get('material_system', '')} [{p.get('characterization_tags', '')}]",
            "takeaway": p.get("notes") or (p.get("abstract", "")[:160] + "...")
        })

    next_lines = []
    for s in all_sched:
        if s.get("status") in ("Scheduled", "In Progress"):
            loc = f" @ {s['instrument_or_location']}" if s.get("instrument_or_location") else ""
            next_lines.append(f"[{s['start_date']}] {s['title']}{loc} — {s.get('description', '')}".strip(" —"))

    if not next_lines:
        next_lines = [
            "Compute optical dielectric functions and absorption coefficients for doped cubic perovskite Ba1-xSrxSnO3.",
            "Perform ab-initio molecular dynamics (AIMD) at 300 K to evaluate lattice dynamic stability.",
            "Draft manuscript section on electronic structure and orbital hybridization."
        ]

    blockers = (
        "• High computational memory demand for hybrid functional (HSE06) band structure calculations on dense k-mesh.\n"
        "• Solution: Utilizing VASP k-point parallelization (KPAR=4) and irreducible k-points on the SKKU cluster.\n"
        "• Electronic convergence confirmed below 1e-6 eV and ionic forces below 0.01 eV/Å."
    )

    return {
        "title": "Weekly Research Progress Report",
        "week_start": monday.strftime("%Y-%m-%d"),
        "week_end": friday.strftime("%Y-%m-%d"),
        "presenter_name": prof.get("full_name", "Vu Tien Lam"),
        "advisor_name": prof.get("advisor", "Prof. Advisor"),
        "lab_name": prof.get("affiliation", "Department of Physics & Energy Materials"),
        "university": "Sungkyunkwan University (SKKU)",
        "theme_color": "oxford_navy",
        "summary_achievements": "\n".join(f"• {line}" for line in completed_lines[:6]),
        "experimental_results": exp_rows,
        "literature_review": lit_rows,
        "blockers_troubleshooting": blockers,
        "next_week_plan": "\n".join(f"• {line}" for line in next_lines[:6]),
        "metrics": {
            "samples_count": len(exp_rows),
            "characterizations_count": sum(len((r.get("methods") or "").split(",")) for r in exp_rows) or 4,
            "papers_count": len(lit_rows),
            "tasks_completed": sum(1 for s in all_sched if s.get("status") == "Completed"),
        }
    }


@app.post("/api/reports/export-pptx")
def export_weekly_report_pptx(payload: WeeklyReportPayload):
    data = payload.dict()
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO weekly_reports (
            title, week_start, week_end, presenter_name, advisor_name,
            lab_name, university, theme_color, summary_achievements,
            experimental_results_json, literature_review_json,
            blockers_troubleshooting, next_week_plan, metrics_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data["title"],
        data["week_start"],
        data["week_end"],
        data["presenter_name"],
        data["advisor_name"],
        data["lab_name"],
        data["university"],
        data["theme_color"],
        data["summary_achievements"],
        json.dumps(data["experimental_results"]),
        json.dumps(data["literature_review"]),
        data["blockers_troubleshooting"],
        data["next_week_plan"],
        json.dumps(data["metrics"]),
    ))
    conn.commit()
    conn.close()

    pptx_stream = build_weekly_report_pptx(data)
    filename = f"Weekly_Report_{data['week_end'].replace('-', '_')}.pptx"
    return StreamingResponse(
        pptx_stream,
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ============================================================================
# Academic CV & ORCID / Google Scholar Sync API
# ============================================================================

@app.get("/api/profile")
def get_profile():
    return load_full_profile()


@app.put("/api/profile")
def update_profile(prof: ProfileUpdate):
    conn = get_connection()
    cur = conn.cursor()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    cur.execute("""
        UPDATE academic_profile SET
            full_name=?, title_role=?, affiliation=?, advisor=?, research_focus=?,
            orcid_id=?, scholar_id=?, email=?, phone=?, website=?, location=?,
            total_citations=?, h_index=?, i10_index=?, bio=?,
            education_json=?, experiences_json=?, publications_json=?,
            conferences_json=?, skills_json=?, awards_json=?, last_synced_at=?
        WHERE id = 1
    """, (
        prof.full_name, prof.title_role, prof.affiliation, prof.advisor,
        prof.research_focus, prof.orcid_id, prof.scholar_id, prof.email,
        prof.phone, prof.website, prof.location,
        prof.total_citations, prof.h_index, prof.i10_index, prof.bio,
        json.dumps(prof.education or []),
        json.dumps(prof.experiences or []),
        json.dumps(prof.publications or []),
        json.dumps(prof.conferences or []),
        json.dumps(prof.skills or {}),
        json.dumps(prof.awards or []),
        now_str
    ))
    conn.commit()
    conn.close()
    dump_all_to_data_json()
    return load_full_profile()


@app.post("/api/profile/sync-orcid")
def sync_orcid(req: SyncOrcidRequest):
    try:
        synced = sync_orcid_profile(req.orcid_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ORCID sync failed: {str(e)}")

    current = load_full_profile()
    full_name = synced.get("full_name") or current.get("full_name")
    bio = synced.get("bio") or current.get("bio")
    edu = synced.get("education") if synced.get("education") else current.get("education", [])

    existing_pubs = current.get("publications", [])
    existing_titles = {p.get("title", "").lower().strip() for p in existing_pubs}
    existing_dois = {clean_doi(p.get("doi", "")).lower() for p in existing_pubs if p.get("doi")}
    merged_pubs = list(existing_pubs)
    added_count = 0
    for pub in synced.get("publications", []):
        t_key = pub.get("title", "").lower().strip()
        d_key = clean_doi(pub.get("doi", "")).lower() if pub.get("doi") else ""
        if d_key and d_key in existing_dois:
            continue
        if t_key and t_key not in existing_titles:
            merged_pubs.append(pub)
            existing_titles.add(t_key)
            if d_key:
                existing_dois.add(d_key)
            added_count += 1

    conn = get_connection()
    cur = conn.cursor()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    cur.execute("""
        UPDATE academic_profile SET
            orcid_id=?, full_name=?, bio=?, education_json=?, publications_json=?, last_synced_at=?
        WHERE id = 1
    """, (
        synced["orcid_id"],
        full_name,
        bio,
        json.dumps(edu),
        json.dumps(merged_pubs),
        now_str
    ))
    conn.commit()
    conn.close()
    dump_all_to_data_json()

    updated = load_full_profile()
    updated["sync_summary"] = f"Synced ORCID {synced['orcid_id']}: found {len(synced.get('publications', []))} works ({added_count} new added)."
    return updated


@app.post("/api/profile/sync-scholar")
def sync_scholar(req: SyncScholarRequest):
    current = load_full_profile()
    try:
        synced = sync_scholar_profile(req.scholar_input, fallback_author_name=current.get("full_name", ""))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scholar sync failed: {str(e)}")

    existing_pubs = current.get("publications", [])
    existing_by_title = {p.get("title", "").lower().strip(): p for p in existing_pubs}

    added_count = 0
    for pub in synced.get("publications", []):
        t_key = pub.get("title", "").lower().strip()
        if not t_key:
            continue
        if t_key in existing_by_title:
            existing_by_title[t_key]["citations"] = max(
                int(existing_by_title[t_key].get("citations", 0)),
                int(pub.get("citations", 0))
            )
            if pub.get("doi") and not existing_by_title[t_key].get("doi"):
                existing_by_title[t_key]["doi"] = pub["doi"]
        else:
            existing_pubs.append(pub)
            existing_by_title[t_key] = pub
            added_count += 1

    conn = get_connection()
    cur = conn.cursor()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    cur.execute("""
        UPDATE academic_profile SET
            scholar_id=?, total_citations=?, h_index=?, i10_index=?, publications_json=?, last_synced_at=?
        WHERE id = 1
    """, (
        synced["scholar_id"],
        synced["total_citations"],
        synced["h_index"],
        synced["i10_index"],
        json.dumps(existing_pubs),
        now_str,
    ))
    conn.commit()
    conn.close()
    dump_all_to_data_json()

    updated = load_full_profile()
    updated["sync_summary"] = (
        f"Synced via {synced.get('provider', 'Google Scholar')}: "
        f"Citations={synced['total_citations']}, h-index={synced['h_index']}, i10-index={synced['i10_index']} "
        f"({added_count} new publications imported)."
    )
    return updated


# ============================================================================
# Manuscript Tools: Plagiarism & Duplicate Paragraph Checker + Word Doc Diff
# ============================================================================

@app.post("/api/documents/extract-text")
async def extract_doc_text_api(file: UploadFile = File(...)):
    content = await file.read()
    full_text, paragraphs = extract_text_from_file_bytes(file.filename, content)
    words = full_text.split()
    return {
        "filename": file.filename,
        "text": full_text,
        "paragraphs": paragraphs,
        "word_count": len(words),
        "paragraph_count": len(paragraphs),
    }


@app.post("/api/documents/check-duplicate")
async def check_duplicate_api(request: Request):
    content_type = request.headers.get("content-type", "")
    target_paragraphs = []
    custom_ref_paragraphs = None
    filename = "Pasted Manuscript"

    cross_internet = True
    if "multipart/form-data" in content_type or "application/x-www-form-urlencoded" in content_type:
        form = await request.form()
        file = form.get("file")
        ref_file = form.get("ref_file")
        text = form.get("text") or ""
        ref_text = form.get("ref_text") or ""
        if "cross_internet" in form:
            cross_internet = str(form.get("cross_internet")).lower() not in ("false", "0", "no")

        if file and hasattr(file, "filename") and file.filename:
            filename = file.filename
            content = await file.read()
            _, target_paragraphs = extract_text_from_file_bytes(file.filename, content)
        elif text:
            target_paragraphs = [p.strip() for p in re.split(r"\n\s*\n", str(text)) if p.strip()]

        if ref_file and hasattr(ref_file, "filename") and ref_file.filename:
            ref_content = await ref_file.read()
            _, custom_ref_paragraphs = extract_text_from_file_bytes(ref_file.filename, ref_content)
        elif ref_text:
            custom_ref_paragraphs = [p.strip() for p in re.split(r"\n\s*\n", str(ref_text)) if p.strip()]
    else:
        body = await request.json()
        raw_text = body.get("text", "")
        if "cross_internet" in body:
            cross_internet = bool(body.get("cross_internet"))
        if raw_text:
            target_paragraphs = [p.strip() for p in re.split(r"\n\s*\n", str(raw_text)) if p.strip()]
        ref_raw = body.get("ref_text", "")
        if ref_raw:
            custom_ref_paragraphs = [p.strip() for p in re.split(r"\n\s*\n", str(ref_raw)) if p.strip()]

    if not target_paragraphs:
        raise HTTPException(status_code=400, detail="Please upload a PDF/Word file or paste manuscript text to check.")

    # Load all literature library papers from database for cross-referencing
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, title, journal, year, doi, abstract, notes, material_system FROM papers")
    library_corpus = [dict(r) for r in cur.fetchall()]
    conn.close()

    analysis = check_manuscript_duplicates(
        paragraphs=target_paragraphs,
        library_corpus=library_corpus,
        custom_reference_paragraphs=custom_ref_paragraphs,
        cross_internet=cross_internet
    )
    analysis["filename"] = filename
    analysis["checked_against_library_papers"] = len(library_corpus)
    return analysis


@app.post("/api/documents/compare-word")
async def compare_word_documents_api(request: Request):
    content_type = request.headers.get("content-type", "")
    doc_a_name = "Document A (Original)"
    doc_b_name = "Document B (Revised)"
    doc_a_text = ""
    doc_b_text = ""
    doc_a_paras = []
    doc_b_paras = []

    if "multipart/form-data" in content_type or "application/x-www-form-urlencoded" in content_type:
        form = await request.form()
        file_a = form.get("file_a")
        file_b = form.get("file_b")
        text_a = form.get("text_a") or ""
        text_b = form.get("text_b") or ""

        if file_a and hasattr(file_a, "filename") and file_a.filename:
            doc_a_name = file_a.filename
            doc_a_text, doc_a_paras = extract_text_from_file_bytes(file_a.filename, await file_a.read())
        elif text_a:
            doc_a_text = str(text_a)
            doc_a_paras = [p.strip() for p in re.split(r"\n\s*\n", doc_a_text) if p.strip()]

        if file_b and hasattr(file_b, "filename") and file_b.filename:
            doc_b_name = file_b.filename
            doc_b_text, doc_b_paras = extract_text_from_file_bytes(file_b.filename, await file_b.read())
        elif text_b:
            doc_b_text = str(text_b)
            doc_b_paras = [p.strip() for p in re.split(r"\n\s*\n", doc_b_text) if p.strip()]
    else:
        body = await request.json()
        doc_a_text = str(body.get("text_a", ""))
        doc_b_text = str(body.get("text_b", ""))
        doc_a_name = body.get("name_a", "Document A (Original)")
        doc_b_name = body.get("name_b", "Document B (Revised)")
        doc_a_paras = [p.strip() for p in re.split(r"\n\s*\n", doc_a_text) if p.strip()]
        doc_b_paras = [p.strip() for p in re.split(r"\n\s*\n", doc_b_text) if p.strip()]

    if not doc_a_text or not doc_b_text:
        raise HTTPException(
            status_code=400,
            detail="Please provide both Document A and Document B (upload Word/PDF files or input text) to compare.",
        )

    diff_result = compare_two_word_documents(
        doc_a_text=doc_a_text,
        doc_b_text=doc_b_text,
        doc_a_paras=doc_a_paras,
        doc_b_paras=doc_b_paras,
    )
    diff_result["doc_a_name"] = doc_a_name
    diff_result["doc_b_name"] = doc_b_name
    return diff_result


# ============================================================================
# Materials Studio & CASTEP Simulation Studio Endpoints (Local Machine Bridge)
# ============================================================================

def _discover_default_castep_roots():
    candidates = [
        os.path.expanduser(r"~\Documents\Materials Studio Projects"),
        r"D:\DATA LAM\DATA TINH TOAN\2026",
        r"D:\Data_Server",
    ]
    return [p for p in candidates if p and os.path.isdir(p)]


def _detect_castep_processes():
    import subprocess
    procs = []
    try:
        out = subprocess.check_output(["tasklist", "/FO", "CSV"], text=True, errors="ignore", timeout=4)
        for line in out.splitlines():
            low = line.lower()
            if any(k in low for k in ["matstudio.exe", "castep", "dmol", "mpiexec", "smpd", "gateway"]):
                parts = [p.strip('"') for p in line.split('","')]
                if len(parts) >= 5:
                    procs.append({"name": parts[0], "pid": parts[1], "mem": parts[4]})
    except Exception:
        pass
    return procs


def _extract_cell_geometry_from_folder(folder: str, seed: str):
    """Return (volume_A3, c_length_A, lattice_vectors) from .cell or .castep in folder."""
    import math
    vol = None
    c_len = None
    vecs = None

    def _vecs_vol_c(v):
        a, b, c = v[0], v[1], v[2]
        cross_bc = (
            b[1]*c[2] - b[2]*c[1],
            b[2]*c[0] - b[0]*c[2],
            b[0]*c[1] - b[1]*c[0],
        )
        v_det = abs(a[0]*cross_bc[0] + a[1]*cross_bc[1] + a[2]*cross_bc[2])
        c_mag = math.sqrt(c[0]*c[0] + c[1]*c[1] + c[2]*c[2])
        return v_det, c_mag

    cell_path = os.path.join(folder, f"{seed}.cell")
    if not os.path.exists(cell_path):
        cands = [f for f in os.listdir(folder) if f.lower().endswith(".cell") and not f.lower().endswith(("_bandstr.cell", "_dos.cell", "_optics.cell"))]
        if cands:
            cell_path = os.path.join(folder, cands[0])
    if os.path.exists(cell_path):
        try:
            with open(cell_path, "r", encoding="latin1", errors="ignore") as f:
                txt = f.read()
            m_cart = re.search(r"%BLOCK\s+LATTICE_CART\s*(.*?)%ENDBLOCK\s+LATTICE_CART", txt, re.I | re.S)
            if m_cart:
                rows = []
                scale = 1.0
                for line in m_cart.group(1).splitlines():
                    line = line.split("#")[0].split("!")[0].strip()
                    if not line:
                        continue
                    if line.lower().startswith("bohr"):
                        scale = 0.529177210903
                        continue
                    if line.lower().startswith("ang"):
                        scale = 1.0
                        continue
                    parts = line.split()
                    if len(parts) >= 3:
                        try:
                            rows.append([float(parts[0])*scale, float(parts[1])*scale, float(parts[2])*scale])
                        except Exception:
                            pass
                if len(rows) >= 3:
                    vecs = rows[:3]
                    vol, c_len = _vecs_vol_c(vecs)
            if vol is None:
                m_abc = re.search(r"%BLOCK\s+LATTICE_ABC\s*(.*?)%ENDBLOCK\s+LATTICE_ABC", txt, re.I | re.S)
                if m_abc:
                    nums = []
                    scale = 1.0
                    for line in m_abc.group(1).splitlines():
                        line = line.split("#")[0].split("!")[0].strip()
                        if not line:
                            continue
                        if line.lower().startswith("bohr"):
                            scale = 0.529177210903
                            continue
                        if line.lower().startswith("ang"):
                            continue
                        for p in line.split():
                            try:
                                nums.append(float(p))
                            except Exception:
                                pass
                    if len(nums) >= 6:
                        a, b, c = nums[0]*scale, nums[1]*scale, nums[2]*scale
                        al, be, ga = math.radians(nums[3]), math.radians(nums[4]), math.radians(nums[5])
                        cal, cbe, cga = math.cos(al), math.cos(be), math.cos(ga)
                        vol = a * b * c * math.sqrt(max(1e-12, 1 - cal*cal - cbe*cbe - cga*cga + 2*cal*cbe*cga))
                        c_len = c
        except Exception:
            pass

    if vol is None:
        castep_path = os.path.join(folder, f"{seed}.castep")
        if os.path.exists(castep_path):
            try:
                with open(castep_path, "r", encoding="latin1", errors="ignore") as f:
                    txt = f.read(200000)
                mv = re.findall(r"Current cell volume\s*=\s*([\d.]+)\s*A\*\*3", txt)
                if mv:
                    vol = float(mv[-1])
                mc = re.findall(r"\bc\s*=\s*([\d.]+)\s+gamma\s*=", txt)
                if mc:
                    c_len = float(mc[-1])
            except Exception:
                pass

    return (vol if (vol and vol > 1e-6) else 1.0, c_len if (c_len and c_len > 1e-6) else 1.0, vecs)


def _normalize_castep_seed(filename: str):
    """Extract base CASTEP calculation seed by stripping standard Materials Studio suffixes."""
    name = filename
    lower = name.lower()
    for ext in (
        ".cell", ".param", ".castep", ".geom", ".bands", ".xcd", ".xsd", ".cif",
        ".chdiff", ".charg_frm", ".den_fmt", ".cube", ".pdos_bin", ".xyz", ".bib", ".ome_bin",
        ".pdos_bin", ".castep_bin", ".cst_esp", ".check", ".kptaux", ".trjaux", ".xgd"
    ):
        if lower.endswith(ext):
            name = name[:-len(ext)]
            break
    # Strip trailing copy counters like " (2)", " (3)"
    name = re.sub(r"\s*\(\d+\)\s*$", "", name).strip()
    # Strip Materials Studio chart & sub-calculation suffixes
    for suf in (
        " Optical Properties", " Partial Density of States", " Density of States",
        " Band Structure", " Convergence", " Energies", " Potential", " PDOS", " DOS",
        "_BandStr", "_DOS", "_Optics", "_Efield", "_Phonon", "_ELF", "_MagRes"
    ):
        if name.lower().endswith(suf.lower()) and len(name) > len(suf):
            name = name[:-len(suf)].strip()
            break
    return name or filename


def _parse_xcd_file_backend(xml_text: str, is_band: bool = False):
    if not xml_text:
        return None
    title_m = re.search(r'<TITLE[^>]*Text="([^"]*)"', xml_text)
    title = title_m.group(1).replace("\\n", " ").strip() if title_m else ""
    ax_x_m = re.search(r'<AXIS_X[^>]*Title="([^"]*)"', xml_text)
    ax_y_m = re.search(r'<AXIS_Y[^>]*Title="([^"]*)"', xml_text)
    ticks = []
    for tm in re.finditer(r'<TICK_LABEL\s+Position="([^"]+)"\s+Text="([^"]+)"', xml_text):
        try:
            ticks.append({"pos": round(float(tm.group(1)), 5), "label": tm.group(2)})
        except Exception:
            pass
    series_list = []
    for sm in re.finditer(r'<SERIES_2D\s+UniqueID="(\d+)"\s+Name="([^"]*)"\s+NumPoints="(\d+)"[^>]*>(.*?)</SERIES_2D>', xml_text, re.DOTALL):
        sname = sm.group(2).strip() or f"Series {sm.group(1)}"
        body = sm.group(4)
        segments = []
        cur_seg = []
        for pm in re.finditer(r'<POINT_2D\s+XY="([^,]+),([^"]+)"', body):
            try:
                x = float(pm.group(1))
                y = float(pm.group(2))
                if abs(y) > 1e100:
                    if cur_seg:
                        segments.append(cur_seg)
                        cur_seg = []
                else:
                    cur_seg.append([round(x, 5), round(y, 5)])
            except Exception:
                pass
        if cur_seg:
            segments.append(cur_seg)
        filtered = []
        for seg in segments:
            ys = [pt[1] for pt in seg]
            if not ys:
                continue
            if is_band and (max(ys) < -10.0 or min(ys) > 10.0):
                continue
            filtered.append(seg)
        series_list.append({"name": sname, "segments": filtered})
    return {
        "title": title,
        "xLabel": ax_x_m.group(1) if ax_x_m else "",
        "yLabel": ax_y_m.group(1) if ax_y_m else "",
        "ticks": ticks,
        "series": series_list,
    }


def _parse_castep_bands_backend(bands_path: str, e_window: float = 12.0):
    if not bands_path or not os.path.exists(bands_path):
        return None
    HA_EV = 27.211386245988
    try:
        with open(bands_path, "r", encoding="latin1", errors="ignore") as f:
            lines = f.readlines()
        nk = 0; ns = 1; neig = 0; ef_ha = 0.0; nelec = 0.0
        ef_ha_spins = []
        nelec_spins = []
        i = 0
        while i < len(lines):
            l = lines[i].strip()
            if l.startswith("Number of k-points"):
                nk = int(l.split()[-1])
            elif l.startswith("Number of spin components"):
                ns = int(l.split()[-1])
            elif l.startswith("Number of electrons"):
                nums = []
                for tok in l.split()[3:]:
                    try:
                        nums.append(float(tok))
                    except Exception:
                        pass
                if nums:
                    nelec_spins = nums
                    nelec = sum(nums) if len(nums) > 1 else nums[0]
            elif l.startswith("Number of eigenvalues"):
                neig = int(l.split()[3])
            elif l.startswith("Fermi energ"):
                nums = []
                for tok in l.split():
                    try:
                        nums.append(float(tok))
                    except Exception:
                        pass
                if nums:
                    ef_ha_spins = nums
                    ef_ha = sum(nums) / len(nums)
            elif l.startswith("Unit cell vectors"):
                i += 4
                break
            i += 1
        kpts = [None] * max(1, nk)
        while i < len(lines):
            l = lines[i].strip()
            if l.startswith("K-point"):
                p = l.split()
                kidx = int(p[1]) - 1
                kx, ky, kz, wt = float(p[2]), float(p[3]), float(p[4]), float(p[5])
                i += 1
                spins = []
                for s in range(ns):
                    if i < len(lines) and lines[i].strip().startswith("Spin component"):
                        i += 1
                    ev_list = []
                    for b in range(neig):
                        if i < len(lines):
                            val_ha = float(lines[i].strip())
                            ev_list.append(round((val_ha - ef_ha) * HA_EV, 5))
                            i += 1
                    spins.append(ev_list)
                if 0 <= kidx < len(kpts):
                    kpts[kidx] = {"k": [round(kx, 5), round(ky, 5), round(kz, 5)], "w": round(wt, 5), "e": spins}
            else:
                i += 1
        kpts = [k for k in kpts if k is not None]
        if not kpts:
            return None
        keep_bands = []
        for b in range(neig):
            vals = []
            for kp in kpts:
                for sp in kp["e"]:
                    if b < len(sp):
                        vals.append(sp[b])
            if vals and max(vals) >= -e_window and min(vals) <= e_window:
                keep_bands.append(b)
        all_e_by_k = [kp["e"] for kp in kpts]
        for kp in kpts:
            kp["e"] = [[round(sp[b], 5) for b in keep_bands if b < len(sp)] for sp in kp["e"]]
        return {
            "nk": len(kpts),
            "ns": ns,
            "neig": len(keep_bands),
            "total_bands": neig,
            "nelec": round(nelec, 4),
            "nelec_spins": [round(x, 4) for x in nelec_spins],
            "ef_ha": round(ef_ha, 6),
            "ef_ev": round(ef_ha * HA_EV, 5),
            "ef_ev_spins": [round(x * HA_EV, 5) for x in ef_ha_spins],
            "kpoints": kpts,
            "_all_e_by_k": all_e_by_k,
        }
    except Exception:
        return None



def _extract_species_order_from_folder(folder: str, seed: str):
    """Return ordered list of unique element symbols as they appear in .cell POSITIONS_FRAC or .castep."""
    order = []
    seen = set()
    cell_cands = [f"{seed}_DOS.cell", f"{seed}.cell"]
    for fn in os.listdir(folder):
        if fn.lower().endswith(".cell") and fn not in cell_cands:
            cell_cands.append(fn)
    for cf in cell_cands:
        fp = os.path.join(folder, cf)
        if not os.path.exists(fp):
            continue
        try:
            with open(fp, "r", encoding="latin1", errors="ignore") as f:
                txt = f.read()
            m = re.search(r"%BLOCK\s+POSITIONS_(?:FRAC|ABS)\s*(.*?)%ENDBLOCK\s+POSITIONS_(?:FRAC|ABS)", txt, re.I | re.S)
            if m:
                for line in m.group(1).splitlines():
                    line = line.split("#")[0].split("!")[0].strip()
                    parts = line.split()
                    if len(parts) >= 4:
                        el = re.sub(r"[^A-Za-z]", "", parts[0])[:2]
                        if el:
                            el = el[0].upper() + (el[1:].lower() if len(el) > 1 else "")
                            if el not in seen:
                                seen.add(el)
                                order.append(el)
                if order:
                    return order
        except Exception:
            pass
    return order


def _parse_pdos_bin_backend(pdos_path: str, bands_obj: dict, species_order: list):
    """
    Pure-Python parser for CASTEP binary Fortran unformatted *.pdos_bin files.
    Combines exact per-atom, per-orbital (s, p, d, f) projection weights with
    *_DOS.bands eigenvalues & k-point weights onto a fine 0.025 eV energy grid
    so frontend can instantaneously broaden & slice Atomic / Element / Orbital / Spin PDOS.
    """
    import struct
    if not pdos_path or not os.path.exists(pdos_path) or not bands_obj or not bands_obj.get("kpoints"):
        return None
    try:
        with open(pdos_path, "rb") as f:
            raw = f.read()
        total_len = len(raw)
        if total_len < 120:
            return None

        # Detect Big-Endian vs Little-Endian Fortran record marker
        r0_be = struct.unpack_from(">i", raw, 0)[0]
        endian = ">" if (r0_be == 8 and struct.unpack_from(">i", raw, 12)[0] == 8) else "<"

        pos = 0
        def read_rec():
            nonlocal pos
            if pos + 4 > total_len:
                return None
            rl = struct.unpack_from(f"{endian}i", raw, pos)[0]
            if rl < 0 or pos + 4 + rl + 4 > total_len:
                return None
            body = raw[pos + 4: pos + 4 + rl]
            pos += 4 + rl + 4
            return body

        _ver_b = read_rec()
        hdr_b = read_rec()
        if hdr_b is None:
            return None
        nk_b = read_rec(); ns_b = read_rec(); norb_b = read_rec(); neig_b = read_rec()
        if not (nk_b and ns_b and norb_b and neig_b):
            return None
        nk = struct.unpack(f"{endian}i", nk_b)[0]
        ns = struct.unpack(f"{endian}i", ns_b)[0]
        norb = struct.unpack(f"{endian}i", norb_b)[0]
        neig_max = struct.unpack(f"{endian}i", neig_b)[0]
        if nk <= 0 or ns <= 0 or norb <= 0 or norb > 10000:
            return None

        sp_b = read_rec(); ion_b = read_rec(); am_b = read_rec()
        if not (sp_b and ion_b and am_b):
            return None
        species_arr = struct.unpack(f"{endian}{norb}i", sp_b)
        ions_arr = struct.unpack(f"{endian}{norb}i", ion_b)
        am_arr = struct.unpack(f"{endian}{norb}i", am_b)

        l_names = {0: "s", 1: "p", 2: "d", 3: "f"}
        # Map each orbital index -> (channel_key: (species_symbol, ion_index, l_char))
        orb_to_chan = []
        chan_meta = {}
        for o in range(norb):
            sp_idx = species_arr[o]
            el = species_order[sp_idx - 1] if (1 <= sp_idx <= len(species_order)) else f"Sp{sp_idx}"
            ion = ions_arr[o]
            l_ch = l_names.get(am_arr[o], "s")
            ckey = f"{el}|{ion}|{l_ch}"
            orb_to_chan.append(ckey)
            if ckey not in chan_meta:
                chan_meta[ckey] = {"element": el, "ion": ion, "atom": f"{el}{ion}", "orbital": l_ch}

        # Build fine energy histogram grid [-20.0, +15.0] eV (1400 bins, dE = 0.025 eV)
        e_min, e_max, n_bins = -20.0, 15.0, 1400
        dE = (e_max - e_min) / n_bins
        inv_dE = 1.0 / dE
        chan_keys = sorted(chan_meta.keys(), key=lambda k: (chan_meta[k]["element"], chan_meta[k]["ion"], "spdf".find(chan_meta[k]["orbital"])))
        key_to_cidx = {k: i for i, k in enumerate(chan_keys)}
        orb_to_cidx = [key_to_cidx[ck] for ck in orb_to_chan]
        n_chans = len(chan_keys)

        # Allocate bins[spin][chan][bin] and total_bins[spin][bin]
        bins = [[[0.0] * n_bins for _ in range(n_chans)] for _ in range(ns)]
        total_bins = [[0.0] * n_bins for _ in range(ns)]

        # Index bands_obj kpoints for matching k-vectors or 1-based k_idx
        kpts_bands = bands_obj.get("kpoints") or []
        band_keep_indices = bands_obj.get("keep_indices")  # optional map from filtered band -> original band
        all_eig_by_k = bands_obj.get("all_e_by_k")  # full unfiltered eigenvalues if present

        # Spin degeneracy factor: 2 for non-spin-polarized, 1 per spin channel for collinear spin-polarized
        spin_deg = 1.0 if ns >= 2 else 2.0
        orb_fmt = f"{endian}{norb}d"

        for _ik in range(nk):
            krec = read_rec()
            if not krec or len(krec) < 28:
                break
            k_idx = struct.unpack_from(f"{endian}i", krec, 0)[0]
            kx, ky, kz = struct.unpack_from(f"{endian}3d", krec, 4)

            # Match corresponding kpoint in bands_obj (prefer exact k_idx-1 if coords match, else nearest k-vector)
            kp_match = None
            kp_idx_matched = -1
            if 1 <= k_idx <= len(kpts_bands):
                cand = kpts_bands[k_idx - 1]
                ck = cand.get("k", [0, 0, 0])
                if abs(ck[0] - kx) + abs(ck[1] - ky) + abs(ck[2] - kz) < 0.02:
                    kp_match = cand
                    kp_idx_matched = k_idx - 1
            if kp_match is None:
                best_d = 1e9
                for idx_b, cand in enumerate(kpts_bands):
                    ck = cand.get("k", [0, 0, 0])
                    d = abs(ck[0] - kx) + abs(ck[1] - ky) + abs(ck[2] - kz)
                    if d < best_d:
                        best_d = d
                        kp_match = cand
                        kp_idx_matched = idx_b

            wt = float(kp_match.get("w", 1.0 / nk)) if kp_match else (1.0 / nk)
            wt_eff = wt * spin_deg

            for _is in range(ns):
                s_b = read_rec(); nb_b = read_rec()
                if not (s_b and nb_b):
                    break
                s_idx = struct.unpack(f"{endian}i", s_b)[0] - 1
                nb = struct.unpack(f"{endian}i", nb_b)[0]
                if s_idx < 0 or s_idx >= ns:
                    s_idx = min(ns - 1, max(0, _is))

                # Full eigenvalue list for this (k, s)
                eig_list = None
                if all_eig_by_k and 0 <= kp_idx_matched < len(all_eig_by_k):
                    sp_e = all_eig_by_k[kp_idx_matched]
                    if s_idx < len(sp_e):
                        eig_list = sp_e[s_idx]
                elif kp_match and s_idx < len(kp_match.get("e", [])):
                    eig_list = kp_match["e"][s_idx]

                for b in range(nb):
                    wb = read_rec()
                    if not wb or len(wb) < norb * 8:
                        break
                    if not eig_list or b >= len(eig_list):
                        continue
                    ev = eig_list[b]
                    if ev < e_min or ev >= e_max:
                        continue
                    b_idx = int((ev - e_min) * inv_dE)
                    if b_idx < 0 or b_idx >= n_bins:
                        continue
                    total_bins[s_idx][b_idx] += wt_eff
                    w_vals = struct.unpack(orb_fmt, wb)
                    c_bins = bins[s_idx]
                    for o in range(norb):
                        wv = w_vals[o]
                        if wv > 1e-6:
                            c_bins[orb_to_cidx[o]][b_idx] += wt_eff * wv

        # Sparse-encode non-zero bins per channel to keep JSON compact and fast
        channels_out = []
        for cidx, ck in enumerate(chan_keys):
            meta = chan_meta[ck]
            ch_entry = {
                "element": meta["element"],
                "ion": meta["ion"],
                "atom": meta["atom"],
                "orbital": meta["orbital"],
                "up": [[i, round(v, 5)] for i, v in enumerate(bins[0][cidx]) if v > 1e-6],
            }
            if ns >= 2:
                ch_entry["dn"] = [[i, round(v, 5)] for i, v in enumerate(bins[1][cidx]) if v > 1e-6]
            channels_out.append(ch_entry)

        total_out = {
            "up": [[i, round(v, 5)] for i, v in enumerate(total_bins[0]) if v > 1e-6],
        }
        if ns >= 2:
            total_out["dn"] = [[i, round(v, 5)] for i, v in enumerate(total_bins[1]) if v > 1e-6]

        return {
            "source_file": os.path.basename(pdos_path),
            "nk": nk,
            "ns": ns,
            "norb": norb,
            "e_min": e_min,
            "e_max": e_max,
            "n_bins": n_bins,
            "dE": dE,
            "ef_ev": bands_obj.get("ef_ev", 0.0),
            "elements": species_order,
            "total_hist": total_out,
            "channels": channels_out,
        }
    except Exception:
        return None


def _summarize_volumetric_grid(raw_tuple, source_file: str, kind: str, cell_vol_a3: float, c_len_a: float):
    """
    Pure-Python (zero numpy dependency) conversion of a 3D CASTEP volumetric grid
    in raw electrons/cell units into exact physical e/A^3, planar-averaged DeltaRho(z) [e/A^3],
    linear density [e/A], and cumulative charge transfer DeltaQ(z) [e].
    """
    import math
    ngx, ngy, ngz, flat_cell = raw_tuple
    vol = cell_vol_a3 if (cell_vol_a3 and cell_vol_a3 > 1e-6) else 1.0
    c_len = c_len_a if (c_len_a and c_len_a > 1e-6) else 1.0
    has_real_vol = cell_vol_a3 is not None and cell_vol_a3 > 1e-3
    inv_vol = 1.0 / vol

    nxy = ngx * ngy
    total_pts = max(1, nxy * ngz)
    sum_z = [0.0] * ngz
    min_ea3 = 1e30
    max_ea3 = -1e30
    sum_cell = 0.0
    sum_sq_ea3 = 0.0

    # Fast indexed loop over flattened (ix * ngy + iy) * ngz + iz array
    for xy in range(nxy):
        base = xy * ngz
        for iz in range(ngz):
            v_cell = flat_cell[base + iz]
            sum_z[iz] += v_cell
            sum_cell += v_cell
            v_ea3 = v_cell * inv_vol
            if v_ea3 < min_ea3:
                min_ea3 = v_ea3
            if v_ea3 > max_ea3:
                max_ea3 = v_ea3
            sum_sq_ea3 += v_ea3 * v_ea3

    mean_ea3 = (sum_cell / total_pts) * inv_vol
    std_ea3 = math.sqrt(max(0.0, (sum_sq_ea3 / total_pts) - mean_ea3 * mean_ea3))

    planar_ea3 = []
    planar_ea = []
    delta_q_z = []
    cum_q = 0.0
    max_abs_dq = 0.0
    inv_nxy = 1.0 / max(1, nxy)
    inv_ngz = 1.0 / max(1, ngz)
    inv_c = 1.0 / c_len

    m_cells = [sum_z[iz] * inv_nxy for iz in range(ngz)]
    # Include periodic closing point z = c (wrap iz = 0) so trapezoidal integral ΔQ(0) = ΔQ(c) = 0 exactly
    cum_q = 0.0
    for iz in range(ngz + 1):
        m_cell = m_cells[iz % ngz]
        planar_ea3.append(m_cell * inv_vol)
        planar_ea.append(m_cell * inv_c)
        if iz == 0:
            cum_q = 0.0
        else:
            cum_q += 0.5 * (m_cells[iz - 1] + m_cell) * inv_ngz
        delta_q_z.append(cum_q)
        if abs(cum_q) > max_abs_dq:
            max_abs_dq = abs(cum_q)

    def _ds1d(arr, max_n=200):
        n = len(arr)
        if n <= max_n:
            return [round(float(x), 7) for x in arr]
        return [round(float(arr[int(round(i * (n - 1) / (max_n - 1)))]), 7) for i in range(max_n)]

    nx_s, ny_s, nz_s = min(20, ngx), min(20, ngy), min(44, ngz)
    ix_list = [int(round(i * (ngx - 1) / max(1, nx_s - 1))) if nx_s > 1 else 0 for i in range(nx_s)]
    iy_list = [int(round(j * (ngy - 1) / max(1, ny_s - 1))) if ny_s > 1 else 0 for j in range(ny_s)]
    iz_list = [int(round(k * (ngz - 1) / max(1, nz_s - 1))) if nz_s > 1 else 0 for k in range(nz_s)]

    sub_flat = []
    for ix in ix_list:
        for iy in iy_list:
            base = (ix * ngy + iy) * ngz
            for iz in iz_list:
                sub_flat.append(round(float(flat_cell[base + iz] * inv_vol), 6))

    return {
        "source_file": os.path.basename(source_file),
        "kind": kind,
        "unit": "e/Å³" if has_real_vol else "e/cell",
        "cell_volume_a3": round(float(vol), 4),
        "c_length_a": round(float(c_len), 4),
        "ngx": int(ngx),
        "ngy": int(ngy),
        "ngz": int(ngz),
        "sample_dims": [int(nx_s), int(ny_s), int(nz_s)],
        "min_val": round(float(min_ea3), 6),
        "max_val": round(float(max_ea3), 6),
        "std_val": round(float(std_ea3), 6),
        "mean_cell_electrons": round(float(sum_cell / total_pts), 6),
        "max_abs_dq_e": round(float(max_abs_dq), 6),
        "profile_z": _ds1d(planar_ea3, 200),
        "profile_z_linear": _ds1d(planar_ea, 200),
        "delta_q_z": _ds1d(delta_q_z, 200),
        "grid3d_flat": sub_flat,
    }


def _read_chdiff_grid_raw(filepath: str):
    import struct
    from array import array
    with open(filepath, "rb") as f:
        raw = f.read()
    if len(raw) < 28:
        return None
    endian = ">"
    rlen1, ngx, ngy, ngz, rlen1_end = struct.unpack(">5i", raw[:20])
    if rlen1 != 12 or rlen1_end != 12 or ngx <= 0 or ngy <= 0 or ngz <= 0 or ngx > 2048:
        endian = "<"
        rlen1, ngx, ngy, ngz, rlen1_end = struct.unpack("<5i", raw[:20])
        if rlen1 != 12 or rlen1_end != 12 or ngx <= 0 or ngy <= 0 or ngz <= 0 or ngx > 2048:
            return None

    flat = array("d", [0.0]) * (ngx * ngy * ngz)
    offset = 20
    total_len = len(raw)
    fmt_c128 = f"{endian}{ngz * 2}d"
    fmt_f64 = f"{endian}{ngz}d"
    rec_hdr_fmt = f"{endian}3i"

    for _ in range(ngx * ngy):
        if offset + 12 > total_len:
            break
        rlen, ix, iy = struct.unpack_from(rec_hdr_fmt, raw, offset)
        if offset + 4 + rlen + 4 > total_len:
            break
        if 1 <= ix <= ngx and 1 <= iy <= ngy:
            base = ((ix - 1) * ngy + (iy - 1)) * ngz
            if rlen == 8 + ngz * 16:
                vals = struct.unpack_from(fmt_c128, raw, offset + 12)
                for iz in range(ngz):
                    flat[base + iz] = vals[iz * 2]
            elif rlen == 8 + ngz * 8:
                vals = struct.unpack_from(fmt_f64, raw, offset + 12)
                for iz in range(ngz):
                    flat[base + iz] = vals[iz]
        offset += 4 + rlen + 4
    return (ngx, ngy, ngz, flat)


def _read_charg_frm_grid_raw(filepath: str):
    from array import array
    ia_list, ib_list, ic_list, val_list = [], [], [], []
    ngx = ngy = ngz = 0
    with open(filepath, "r", encoding="latin1", errors="ignore") as f:
        for line in f:
            parts = line.split()
            if len(parts) < 4:
                continue
            try:
                ia = int(parts[0]); ib = int(parts[1]); ic = int(parts[2]); val = float(parts[3])
                ia_list.append(ia); ib_list.append(ib); ic_list.append(ic); val_list.append(val)
                if ia > ngx: ngx = ia
                if ib > ngy: ngy = ib
                if ic > ngz: ngz = ic
            except Exception:
                continue
    if not val_list or ngx <= 0 or ngy <= 0 or ngz <= 0:
        return None
    flat = array("d", [0.0]) * (ngx * ngy * ngz)
    for ia, ib, ic, v in zip(ia_list, ib_list, ic_list, val_list):
        flat[((ia - 1) * ngy + (ib - 1)) * ngz + (ic - 1)] = v
    return (ngx, ngy, ngz, flat)


def _parse_chdiff_binary_backend(filepath: str, cell_vol_a3: float = 1.0, c_len_a: float = 1.0):
    if not filepath or not os.path.exists(filepath):
        return None
    try:
        raw_t = _read_chdiff_grid_raw(filepath)
        if raw_t is None:
            return None
        return _summarize_volumetric_grid(raw_t, filepath, "chdiff", cell_vol_a3, c_len_a)
    except Exception:
        return None


@app.get("/api/castep/scan")
def api_castep_scan(root_path: Optional[str] = None, limit: int = 120):
    import time
    req_path = (root_path or "").strip()
    if req_path:
        if not os.path.exists(req_path) or not os.path.isdir(req_path):
            raise HTTPException(status_code=404, detail=f"Directory not found on local machine: {req_path}")
        roots = [req_path]
    else:
        roots = _discover_default_castep_roots()

    procs = _detect_castep_processes()
    discovered = []
    relevant_exts = (
        ".cell", ".param", ".castep", ".geom", ".bands", ".xcd", ".xsd", ".cif",
        ".chdiff", ".charg_frm", ".den_fmt", ".cube", ".pdos_bin"
    )
    skip_dirs = {".git", "node_modules", "__pycache__", "$recycle.bin", "system volume information"}

    for base in roots:
        for cur_root, dirs, files in os.walk(base):
            dirs[:] = [d for d in dirs if d.lower() not in skip_dirs and not d.startswith(".")]
            rel_files = [f for f in files if f.lower().endswith(relevant_exts) or f.lower() == "status.txt"]
            if not rel_files:
                continue

            # Group files by base calculation seed within cur_root
            seed_groups = {}
            status_exists = any(f.lower() == "status.txt" for f in files)
            for fn in rel_files:
                if fn.lower() == "status.txt":
                    continue
                seed = _normalize_castep_seed(fn)
                seed_groups.setdefault(seed, []).append(fn)

            # Attach standalone Status.txt to all groups in the folder
            for seed, sfiles in seed_groups.items():
                has_struct_or_calc = any(
                    f.lower().endswith((".cell", ".castep", ".xsd", ".cif", ".chdiff", ".charg_frm", ".bands", ".xcd"))
                    for f in sfiles
                )
                if not has_struct_or_calc:
                    continue
                if status_exists and "Status.txt" not in sfiles:
                    sfiles.append("Status.txt")

                mtimes = []
                for f in sfiles:
                    try:
                        mtimes.append(os.path.getmtime(os.path.join(cur_root, f)))
                    except Exception:
                        pass
                max_mt = max(mtimes) if mtimes else 0

                has_castep = any(f.lower() == f"{seed.lower()}.castep" for f in sfiles)
                castep_completed = False
                if has_castep:
                    try:
                        with open(os.path.join(cur_root, f"{seed}.castep"), "rb") as cf:
                            cf.seek(0, os.SEEK_END)
                            sz = cf.tell()
                            cf.seek(max(0, sz - 4096))
                            tail = cf.read().decode("latin1", errors="ignore")
                            if "Total time" in tail or "finished" in tail.lower():
                                castep_completed = True
                    except Exception:
                        pass
                if castep_completed:
                    status_str = "Completed"
                elif status_exists and not castep_completed:
                    status_str = "Active / Running"
                elif has_castep:
                    status_str = "Completed"
                else:
                    status_str = "Input Ready"

                rel_proj = os.path.relpath(cur_root, base) if cur_root.startswith(base) else cur_root
                job_key = f"{cur_root}::{seed}"
                discovered.append({
                    "id": "local_" + str(abs(hash(job_key))),
                    "title": f"{seed} ({os.path.basename(cur_root)})",
                    "project": rel_proj.split(os.sep)[0] if os.sep in rel_proj else os.path.basename(base),
                    "folder": cur_root,
                    "seed": seed,
                    "status": status_str,
                    "mtime": max_mt,
                    "updated_at": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(max_mt)) if max_mt else "",
                    "files_list": sorted(sfiles),
                    "has_chdiff": any(f.lower().endswith(".chdiff") for f in sfiles),
                    "has_charg_frm": any(f.lower().endswith(".charg_frm") for f in sfiles),
                    "has_optics": any(("optical" in f.lower() and f.lower().endswith(".xcd")) or f.lower().endswith("_optics.bands") for f in sfiles),
                    "has_band_dos": any(f.lower().endswith(("_bandstr.bands", "_dos.bands")) or (("band structure" in f.lower() or "dos" in f.lower() or "density of states" in f.lower()) and f.lower().endswith(".xcd")) or f.lower().endswith(".pdos_bin") for f in sfiles),
                })

    discovered.sort(key=lambda x: x["mtime"], reverse=True)
    return {
        "ok": True,
        "processes": procs,
        "roots": roots,
        "total_found": len(discovered),
        "jobs": discovered[:limit],
    }


@app.get("/api/castep/job")
def api_castep_job_detail(folder: str, seed: Optional[str] = None):
    import time
    if not folder or not os.path.exists(folder):
        raise HTTPException(status_code=404, detail=f"Job directory not found: {folder}")
    all_files = sorted([f for f in os.listdir(folder) if os.path.isfile(os.path.join(folder, f))])
    if not seed:
        cells = [f[:-5] for f in all_files if f.lower().endswith(".cell") and not f.lower().endswith(("_bandstr.cell", "_dos.cell", "_optics.cell"))]
        casteps = [f[:-7] for f in all_files if f.lower().endswith(".castep") and not f.lower().endswith(("_bandstr.castep", "_dos.castep", "_optics.castep"))]
        seed = (casteps[0] if casteps else (cells[0] if cells else "CASTEP_Job"))

    def _read(fname, limit_b=500000):
        if not fname:
            return ""
        fp = os.path.join(folder, fname)
        if not os.path.exists(fp):
            return ""
        with open(fp, "r", encoding="latin1", errors="ignore") as f:
            return f.read(limit_b)

    def _find_match(pred):
        # Prefer files starting with seed
        for f in all_files:
            if f.lower().startswith(seed.lower()) and pred(f.lower()):
                return f
        for f in all_files:
            if pred(f.lower()):
                return f
        return None

    mtime = max([os.path.getmtime(os.path.join(folder, f)) for f in all_files]) if all_files else time.time()

    band_xcd_f = _find_match(lambda l: l.endswith(".xcd") and "band structure" in l)
    pdos_xcd_f = _find_match(lambda l: l.endswith(".xcd") and ("pdos" in l or "partial density of states" in l))
    dos_xcd_f = _find_match(lambda l: l.endswith(".xcd") and ("density of states" in l or " dos" in l or l == "dos.xcd") and "partial" not in l and "pdos" not in l)
    conv_xcd_f = _find_match(lambda l: l.endswith(".xcd") and "convergence" in l)
    ener_xcd_f = _find_match(lambda l: l.endswith(".xcd") and "energies" in l)

    band_xcd = _parse_xcd_file_backend(_read(band_xcd_f, 2500000), is_band=True)
    dos_xcd = _parse_xcd_file_backend(_read(dos_xcd_f, 2000000))
    pdos_xcd = _parse_xcd_file_backend(_read(pdos_xcd_f, 2000000))
    conv_xcd = _parse_xcd_file_backend(_read(conv_xcd_f, 500000))
    ener_xcd = _parse_xcd_file_backend(_read(ener_xcd_f, 500000))

    # Parse ALL optical .xcd files in the folder (Absorption, Re/Im Epsilon, Refractive, Reflectivity, Loss, Conductivity)
    opt_files = [
        f for f in all_files
        if f.lower().endswith(".xcd") and any(k in f.lower() for k in ("optical", "dielectric", "absorption", "reflectiv", "refractiv", "loss", "conductiv"))
    ]
    optical_xcds = []
    for ofn in opt_files:
        parsed_opt = _parse_xcd_file_backend(_read(ofn, 2000000))
        if parsed_opt and parsed_opt.get("series"):
            parsed_opt["filename"] = ofn
            optical_xcds.append(parsed_opt)
    optical_xcd = optical_xcds[0] if optical_xcds else None

    # Exact unit cell volume & c-axis for physical e/A^3 normalization of .chdiff / .charg_frm
    cell_vol_a3, c_len_a, _ = _extract_cell_geometry_from_folder(folder, seed)

    chdiff_fname = _find_match(lambda l: l.endswith(".chdiff"))
    chdiff_data = _parse_chdiff_binary_backend(os.path.join(folder, chdiff_fname), cell_vol_a3, c_len_a) if chdiff_fname else None
    charg_frm_files = [f for f in all_files if f.lower().endswith((".charg_frm", ".den_fmt", ".cube"))]

    bandstr_f = _find_match(lambda l: l.endswith("_bandstr.bands"))
    dos_bands_f = _find_match(lambda l: l.endswith("_dos.bands")) or _find_match(lambda l: l.endswith(".bands") and not l.endswith(("_bandstr.bands", "_optics.bands")))
    optics_bands_f = _find_match(lambda l: l.endswith("_optics.bands"))

    bandstr_bands = _parse_castep_bands_backend(os.path.join(folder, bandstr_f)) if bandstr_f else None
    dos_bands = _parse_castep_bands_backend(os.path.join(folder, dos_bands_f)) if dos_bands_f else None
    optics_bands = _parse_castep_bands_backend(os.path.join(folder, optics_bands_f)) if optics_bands_f else None

    pdos_bin_f = _find_match(lambda l: l.endswith("_dos.pdos_bin")) or _find_match(lambda l: l.endswith(".pdos_bin"))
    pdos_bin_data = None
    if pdos_bin_f:
        sp_order = _extract_species_order_from_folder(folder, seed)
        ref_bands = dos_bands or bandstr_bands
        if ref_bands:
            ref_with_all = dict(ref_bands)
            ref_with_all["all_e_by_k"] = ref_bands.get("_all_e_by_k")
            pdos_bin_data = _parse_pdos_bin_backend(os.path.join(folder, pdos_bin_f), ref_with_all, sp_order)

    # Strip temporary _all_e_by_k before serializing JSON
    for _bo in (bandstr_bands, dos_bands, optics_bands):
        if _bo and "_all_e_by_k" in _bo:
            del _bo["_all_e_by_k"]

    cif_f = _find_match(lambda l: l.endswith(".cif"))

    return {
        "folder": folder,
        "seed": seed,
        "updated_at": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(mtime)),
        "files_list": all_files,
        "cell_text": _read(_find_match(lambda l: l.endswith(".cell") and not l.endswith(("_bandstr.cell", "_dos.cell", "_optics.cell")))),
        "param_text": _read(_find_match(lambda l: l.endswith(".param") and not l.endswith(("_bandstr.param", "_dos.param", "_optics.param")))),
        "castep_text": _read(_find_match(lambda l: l.endswith(".castep") and not l.endswith(("_bandstr.castep", "_dos.castep", "_optics.castep"))), 2500000),
        "optics_castep_text": _read(_find_match(lambda l: l.endswith("_optics.castep")), 200000),
        "geom_text": _read(_find_match(lambda l: l.endswith(".geom")), 1000000),
        "status_text": _read("Status.txt"),
        "xsd_text": _read(_find_match(lambda l: l.endswith(".xsd")), 250000),
        "cif_text": _read(cif_f, 250000) if cif_f else "",
        "conv_xcd": conv_xcd,
        "ener_xcd": ener_xcd,
        "band_xcd": band_xcd,
        "dos_xcd": dos_xcd,
        "pdos_xcd": pdos_xcd,
        "pdos_bin_data": pdos_bin_data,
        "optical_xcd": optical_xcd,
        "optical_xcds": optical_xcds,
        "chdiff_data": chdiff_data,
        "charg_frm_files": charg_frm_files,
        "bandstr_bands": bandstr_bands,
        "dos_bands": dos_bands,
        "optics_bands": optics_bands,
    }


def _extract_atoms_frac_from_cell(folder: str, seed: str):
    cell_path = os.path.join(folder, f"{seed}.cell")
    if not os.path.exists(cell_path):
        cands = [f for f in os.listdir(folder) if f.lower().endswith(".cell") and not f.lower().endswith(("_bandstr.cell", "_dos.cell", "_optics.cell"))]
        if cands:
            cell_path = os.path.join(folder, cands[0])
    if not os.path.exists(cell_path):
        return []
    atoms = []
    try:
        with open(cell_path, "r", encoding="latin1", errors="ignore") as f:
            txt = f.read()
        m = re.search(r"%BLOCK\s+POSITIONS_FRAC\s*(.*?)%ENDBLOCK\s+POSITIONS_FRAC", txt, re.I | re.S)
        if m:
            for line in m.group(1).splitlines():
                line = line.split("#")[0].split("!")[0].strip()
                parts = line.split()
                if len(parts) >= 4:
                    el = re.sub(r"[^A-Za-z]", "", parts[0])[:2]
                    try:
                        atoms.append((el, float(parts[1]) % 1.0, float(parts[2]) % 1.0, float(parts[3]) % 1.0))
                    except Exception:
                        pass
    except Exception:
        pass
    return atoms


@app.get("/api/castep/charg-frm")
def api_castep_charg_frm(folder: str, filename: str, seed: Optional[str] = None, subtract_promol: bool = True):
    """Parse a CASTEP .charg_frm (or .chdiff) file on local disk into exact e/A^3 summary & 3D grid."""
    import math
    from array import array
    fp = os.path.join(folder, os.path.basename(filename))
    if not os.path.exists(fp):
        raise HTTPException(status_code=404, detail=f"File not found: {fp}")
    eff_seed = seed or _normalize_castep_seed(filename)
    cell_vol_a3, c_len_a, vecs = _extract_cell_geometry_from_folder(folder, eff_seed)
    if fp.lower().endswith(".chdiff"):
        grid = _read_chdiff_grid_raw(fp)
        kind = "chdiff"
    else:
        grid = _read_charg_frm_grid_raw(fp)
        kind = "charg_frm"
        if grid is not None and subtract_promol and vecs:
            atoms = _extract_atoms_frac_from_cell(folder, eff_seed)
            if atoms:
                ngx, ngy, ngz, flat = grid
                val_e = {"H":1,"Li":1,"B":3,"C":4,"N":5,"O":6,"F":7,"Na":1,"Mg":2,"Al":3,"Si":4,"P":5,"S":6,"Cl":7,"K":1,"Ti":4,"V":5,"Cr":6,"Mn":7,"Fe":8,"Co":9,"Ni":10,"Cu":11,"Zn":12,"Se":6,"Mo":6,"W":6,"Te":6}
                aV, bV, cV = vecs[0], vecs[1], vecs[2]
                # Sample down to fast promolecule subtraction on exact grid (using analytical Gaussian atom superposition)
                total_pts = ngx * ngy * ngz
                promol = array("d", [0.0]) * total_pts
                p_sum = 0.0
                orig_sum = sum(flat)
                atom_specs = [(u, v, w, float(val_e.get(el, 4)), 0.65) for (el, u, v, w) in atoms]
                for ix in range(ngx):
                    u = ix / ngx
                    for iy in range(ngy):
                        v = iy / ngy
                        base = (ix * ngy + iy) * ngz
                        for iz in range(ngz):
                            w = iz / ngz
                            val = 0.0
                            for au, av, aw, zv, sig in atom_specs:
                                du = u - au
                                if du > 0.5: du -= 1.0
                                elif du < -0.5: du += 1.0
                                dv = v - av
                                if dv > 0.5: dv -= 1.0
                                elif dv < -0.5: dv += 1.0
                                dw = w - aw
                                if dw > 0.5: dw -= 1.0
                                elif dw < -0.5: dw += 1.0
                                dx = du*aV[0] + dv*bV[0] + dw*cV[0]
                                dy = du*aV[1] + dv*bV[1] + dw*cV[1]
                                dz = du*aV[2] + dv*bV[2] + dw*cV[2]
                                r2 = dx*dx + dy*dy + dz*dz
                                arg = r2 / (2.0 * sig * sig)
                                if arg < 10.0:
                                    val += zv * math.exp(-arg)
                            promol[base + iz] = val
                            p_sum += val
                if p_sum > 1e-12:
                    sc = orig_sum / p_sum
                    diff = array("d", (flat[i] - promol[i] * sc for i in range(total_pts)))
                    grid = (ngx, ngy, ngz, diff)
                    kind = "charg_frm_promol"
    if grid is None:
        raise HTTPException(status_code=400, detail=f"Failed to parse volumetric grid in {filename}")
    return _summarize_volumetric_grid(grid, fp, kind, cell_vol_a3, c_len_a)


def _find_local_ms_gateway_root():
    import glob
    patterns = [
        r"C:\ProgramData\BIOVIA\Materials Studio\*\Gateway-x64\root_default\dsd",
        r"C:\ProgramData\BIOVIA\Materials Studio\*\Gateway\root_default\dsd",
        r"C:\Program Files (x86)\BIOVIA\Materials Studio*\etc\Gateway\root_default\dsd",
        r"C:\Program Files\BIOVIA\Materials Studio*\etc\Gateway\root_default\dsd",
        r"C:\Program Files (x86)\Accelrys\Materials Studio*\etc\Gateway\root_default\dsd",
    ]
    candidates = []
    for pat in patterns:
        candidates.extend(glob.glob(pat))
    candidates = sorted(set(candidates), reverse=True)
    for c in candidates:
        if os.path.isdir(c) and (
            os.path.isdir(os.path.join(c, "jobs-info"))
            or os.path.isdir(os.path.join(c, "conf"))
            or os.path.isdir(os.path.join(c, "servers-info"))
        ):
            return c
    return ""


def _parse_gw_kv_file(path: str):
    items = []
    kv = {}
    if not path or not os.path.isfile(path):
        return items, kv
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            for raw in f:
                line = raw.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                k = k.strip()
                v = v.strip()
                if not k:
                    continue
                kv[k] = v
                items.append({"key": k, "value": v})
    except Exception:
        pass
    return items, kv


def _parse_sbj_file(path: str, is_archived: bool = False, gw_root: str = ""):
    import time
    jid = os.path.splitext(os.path.basename(path))[0]
    item = {
        "job_id": jid,
        "description": jid,
        "server": "CASTEP",
        "owner": "",
        "status": "terminated",
        "create_ts": 0,
        "start_ts": 0,
        "finish_ts": 0,
        "submitted": "-",
        "queue": "-",
        "queued_job_id": "-",
        "process_id": "-",
        "cpu_cores": 0,
        "job_directory": "",
        "client_ip": "",
        "is_archived": is_archived,
        "has_local_files": False,
        "job_href": f"/dsd/jobs/{jid}/",
    }
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            for line in f:
                line = line.strip()
                if "=" not in line:
                    continue
                k, v = line.split("=", 1)
                k, v = k.strip().lower(), v.strip()
                if k == "job-description":
                    item["description"] = v
                elif k == "job-server":
                    item["server"] = v
                elif k == "job-uid":
                    item["owner"] = v
                elif k == "job-status":
                    item["status"] = v
                elif k == "job-create":
                    try:
                        ts = int(v)
                        item["create_ts"] = ts
                        t_st = time.localtime(ts)
                        day_num = int(time.strftime("%d", t_st))
                        item["submitted"] = time.strftime(f"%a %b {day_num:2d} %H:%M:%S %Y", t_st).replace("  ", " ")
                    except Exception:
                        pass
                elif k == "job-start":
                    try:
                        item["start_ts"] = int(v)
                    except Exception:
                        pass
                elif k == "job-finish":
                    try:
                        item["finish_ts"] = int(v)
                    except Exception:
                        pass
                elif k == "job-primary-processid":
                    item["process_id"] = v
                elif k == "job-processid" and item["process_id"] == "-":
                    item["process_id"] = v
                elif k == "job-queue" and v:
                    item["queue"] = v
                elif k == "job-queued-id" and v:
                    item["queued_job_id"] = v
                elif k == "job-cpu-number":
                    try:
                        item["cpu_cores"] = int(v)
                    except Exception:
                        pass
                elif k == "job-directory":
                    item["job_directory"] = v.replace("/", "\\")
                elif k == "job-client-ip":
                    item["client_ip"] = v
    except Exception:
        pass

    cand_dir = item["job_directory"] or (os.path.join(gw_root, "jobs", jid) if gw_root else "")
    if cand_dir and os.path.isdir(cand_dir):
        item["job_directory"] = cand_dir
        item["has_local_files"] = True
    return item


def _parse_local_sbs_servers(gw_root: str):
    import glob
    servers = []
    sbs_dir = os.path.join(gw_root, "servers-info") if gw_root else ""
    if not sbs_dir or not os.path.isdir(sbs_dir):
        return servers
    for p in sorted(glob.glob(os.path.join(sbs_dir, "*.sbs")), key=lambda x: os.path.basename(x).lower()):
        name = os.path.splitext(os.path.basename(p))[0]
        items, kv = _parse_gw_kv_file(p)
        ver_maj = kv.get("VersionMajor", "")
        ver_min = kv.get("VersionMinor", "")
        rev = kv.get("Revision", "")
        ver_str = f"{ver_maj}.{ver_min}" + (f".{rev}" if rev else "") if ver_maj else ""
        servers.append({
            "name": name,
            "category": kv.get("Category", "Other"),
            "description": kv.get("Description", f"{name} Server Application"),
            "version": ver_str or "Installed",
            "build_date": kv.get("Builddate", "-"),
            "executable": kv.get("server-executable", ""),
            "shell": kv.get("shell", ""),
            "wait_for_start": kv.get("WaitForStart", ""),
            "timeout": kv.get("Timeout", ""),
            "polling_interval": kv.get("MinimumPollingInterval", ""),
            "max_cores": kv.get("MaxCoresPerProcessor", "0"),
            "clean_tmp": kv.get("CleanTmp", ""),
            "sbs_file": os.path.basename(p),
            "details": items,
        })
    return servers


def _strip_html_tags(s: str) -> str:
    import html as _html
    txt = re.sub(r"<[^>]+>", " ", s or "")
    txt = _html.unescape(txt)
    return re.sub(r"\s+", " ", txt).strip()


DEFAULT_MS_GATEWAY_URL = "http://115.145.191.231:18888"


def _normalize_gateway_url(raw_url: Optional[str], default_url: str = DEFAULT_MS_GATEWAY_URL) -> str:
    s = (raw_url or "").strip().rstrip("/")
    if not s:
        return default_url
    # Strip accidental trailing /dsd/... path if pasted from native browser bar
    m_path = re.match(r"^(https?://[^/]+)/.*$", s, re.I)
    if m_path:
        s = m_path.group(1)
    # Support Materials Studio Gateway shorthand: 115.145.191.231_18888 or http://115.145.191.231_18888
    m_under = re.match(r"^(https?://)?([A-Za-z0-9.\-]+)_(\d{2,5})$", s, re.I)
    if m_under:
        proto = m_under.group(1) or "http://"
        s = f"{proto}{m_under.group(2)}:{m_under.group(3)}"
    elif not re.match(r"^https?://", s, re.I):
        s = "http://" + s
    return s.rstrip("/")


def _fetch_live_ms_gateway_http(gateway_url: str, timeout: float = 3.5):
    import urllib.request
    import html as _html

    base = _normalize_gateway_url(gateway_url)
    if not re.match(r"^https?://[A-Za-z0-9.\-_:\[\]]+$", base):
        return {"reachable": False, "error": "Invalid Gateway URL"}

    # Avoid Windows IPv6 ::1 2.0s TCP fallback timeout against BIOVIA Apache (IPv4-only listener)
    fetch_base = re.sub(r"^(https?://)localhost(?=:|$)", r"\g<1>127.0.0.1", base, flags=re.I)

    def _get(path: str):
        req = urllib.request.Request(
            fetch_base + path,
            headers={"User-Agent": "MatSciNexus-GatewayBridge/1.0"},
        )
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.read().decode("utf-8", errors="ignore")

    result = {
        "reachable": False,
        "gateway_url": base,
        "gateway_host": "",
        "page_generated": "",
        "jobs": [],
        "gateway_data": [],
        "installed_servers": [],
        "error": "",
    }

    try:
        jobs_html = _get("/dsd/commands/dsd_configuregw.pl?jobs=yes")
    except Exception as exc:
        result["error"] = str(exc)
        return result

    result["reachable"] = True

    m_title = re.search(r"<title>\s*Remote Gateway\s+([^<]+)</title>", jobs_html, re.I)
    if m_title:
        result["gateway_host"] = _html.unescape(m_title.group(1)).strip()

    m_gen = re.search(r"Page generated on\s+([^<]+)", jobs_html, re.I)
    if m_gen:
        result["page_generated"] = _strip_html_tags(m_gen.group(0))

    # Parse live Jobs table rows (note: Materials Studio nests tiny <table> inside <th> headers,
    # so slice from contenttables up to the footer <table class="main" instead of first </table>!)
    m_tbl_start = re.search(r'<table[^>]*class="[^"]*contenttables[^"]*"[^>]*>', jobs_html, re.I)
    if m_tbl_start:
        sub_html = jobs_html[m_tbl_start.end():]
        m_footer = re.search(r'<table[^>]*class="main"', sub_html, re.I)
        tbl_body = sub_html[:m_footer.start()] if m_footer else sub_html
        for tr_m in re.finditer(r"<tr>\s*<td(.*?)</tr>", tbl_body, re.I | re.S):
            row_html = "<td" + tr_m.group(1)
            tds = re.findall(r"<td([^>]*)>(.*?)</td>", row_html, re.I | re.S)
            if len(tds) < 9:
                continue
            desc = _strip_html_tags(tds[0][1])
            job_id = _strip_html_tags(tds[1][1])
            m_href = re.search(r'href="([^"]+)"', tds[1][1], re.I)
            job_href = _html.unescape(m_href.group(1)) if m_href else f"/dsd/jobs/{job_id}/"
            server = _strip_html_tags(tds[2][1]) or "CASTEP"
            owner = _strip_html_tags(tds[3][1]) or "-"
            status = _strip_html_tags(tds[4][1]) or "unknown"
            submitted = _strip_html_tags(tds[5][1]) or "-"
            m_ts = re.search(r'sorttable-customkey="(\d+)"', tds[5][0], re.I)
            create_ts = int(m_ts.group(1)) if m_ts else 0
            queue = _strip_html_tags(tds[6][1]) or "-"
            queued_job_id = _strip_html_tags(tds[7][1]) or "-"
            process_id = _strip_html_tags(tds[8][1]) or "-"
            action_html = tds[9][1] if len(tds) > 9 else ""
            has_remove = "deletejob=yes" in action_html.lower() or "remove" in action_html.lower()
            has_stop = "stopjob=yes" in action_html.lower() or "stop" in action_html.lower()
            if not job_id:
                continue
            result["jobs"].append({
                "job_id": job_id,
                "description": desc or job_id,
                "server": server,
                "owner": owner,
                "status": status,
                "create_ts": create_ts,
                "submitted": submitted,
                "queue": queue,
                "queued_job_id": queued_job_id,
                "process_id": process_id,
                "cpu_cores": 0,
                "job_directory": "",
                "job_href": job_href,
                "job_url": base + job_href if job_href.startswith("/") else job_href,
                "is_archived": False,
                "has_local_files": False,
                "has_remote_files": True,
                "can_remove": has_remove,
                "can_stop": has_stop,
            })

    # Parse live Gateway Data table
    try:
        gw_html = _get("/dsd/commands/dsd_configuregw.pl?file=gw-info.sbd")
        m_gtbl = re.search(r'<table[^>]*class="[^"]*contenttables[^"]*"[^>]*>(.*?)</table>', gw_html, re.I | re.S)
        if m_gtbl:
            for tr_m in re.finditer(r"<tr>(.*?)</tr>", m_gtbl.group(1), re.I | re.S):
                tds = re.findall(r"<td[^>]*>(.*?)</td>", tr_m.group(1), re.I | re.S)
                if len(tds) >= 2:
                    k = _strip_html_tags(tds[0])
                    v = _strip_html_tags(tds[1])
                    if k:
                        result["gateway_data"].append({"key": k, "value": v})
    except Exception:
        pass

    # Parse live Installed Servers table
    try:
        srv_html = _get("/dsd/commands/u/dsd_configure.pl")
        m_stbl = re.search(r'<table[^>]*class="[^"]*contenttables[^"]*"[^>]*>(.*?)</table>', srv_html, re.I | re.S)
        if m_stbl:
            for tr_m in re.finditer(r"<tr>(.*?)</tr>", m_stbl.group(1), re.I | re.S):
                tds = re.findall(r"<td[^>]*>(.*?)</td>", tr_m.group(1), re.I | re.S)
                if len(tds) >= 2:
                    sname = _strip_html_tags(tds[0])
                    scat = _strip_html_tags(tds[1])
                    m_shref = re.search(r'href="([^"]+)"', tds[0], re.I)
                    shref = _html.unescape(m_shref.group(1)) if m_shref else ""
                    m_sfile = re.search(r"[?&]file=([^&]+)", shref, re.I)
                    sbs_file = m_sfile.group(1) if m_sfile else f"{sname}.sbs"
                    if sname:
                        result["installed_servers"].append({
                            "name": sname,
                            "category": scat or "Other",
                            "sbs_file": sbs_file,
                            "detail_url": base + shref if shref.startswith("/") else shref,
                        })
    except Exception:
        pass

    return result


@app.get("/api/castep/gateway")
def api_castep_gateway_jobs(
    gateway_url: Optional[str] = None,
    include_archived: bool = False,
    limit: int = 500,
):
    import glob
    import socket
    from urllib.parse import urlparse

    hostname = socket.gethostname().lower()
    gw_root = _find_local_ms_gateway_root()

    # Load local conf/gw-info.sbd & servers-info/*.sbs when installed on this machine
    local_gw_items, local_gw_kv = _parse_gw_kv_file(os.path.join(gw_root, "conf", "gw-info.sbd")) if gw_root else ([], {})
    _, local_params_kv = _parse_gw_kv_file(os.path.join(gw_root, "conf", "gwparams.cfg")) if gw_root else ([], {})
    local_port = local_gw_kv.get("port") or local_params_kv.get("gw_port") or "18888"
    local_host_label = local_gw_kv.get("gatewayname") or f"{hostname}_{local_port}"

    target_url = _normalize_gateway_url(gateway_url, DEFAULT_MS_GATEWAY_URL)

    parsed_u = urlparse(target_url)
    req_host = (parsed_u.hostname or "").lower()
    is_local_target = req_host in (
        "localhost", "127.0.0.1", "::1", hostname,
        (local_gw_kv.get("hostname") or "").lower(),
        (local_gw_kv.get("ipaddress") or "").lower(),
    )

    # Probe live Materials Studio Remote Gateway HTTP server
    live = _fetch_live_ms_gateway_http(target_url, timeout=3.5)
    live_ok = bool(live.get("reachable"))

    # Parse local disk .sbj / .sbs when targeting this workstation
    disk_active_map = {}
    disk_active_list = []
    archived_list = []
    archived_total = 0
    local_servers_map = {}
    local_servers_list = []

    if is_local_target and gw_root:
        info_dir = os.path.join(gw_root, "jobs-info")
        arch_dir = os.path.join(gw_root, "jobs-info-archive")
        if os.path.isdir(info_dir):
            for p in sorted(glob.glob(os.path.join(info_dir, "*.sbj"))):
                rec = _parse_sbj_file(p, False, gw_root)
                disk_active_map[rec["job_id"]] = rec
                disk_active_list.append(rec)
        if os.path.isdir(arch_dir):
            arch_files = glob.glob(os.path.join(arch_dir, "*.sbj"))
            archived_total = len(arch_files)
            if include_archived and arch_files:
                arch_parsed = [_parse_sbj_file(p, True, gw_root) for p in arch_files]
                arch_parsed.sort(key=lambda x: x["create_ts"], reverse=True)
                archived_list = arch_parsed[:limit]
        local_servers_list = _parse_local_sbs_servers(gw_root)
        local_servers_map = {s["name"].lower(): s for s in local_servers_list}

    if not live_ok and not (is_local_target and gw_root):
        return {
            "connected": False,
            "live_http_reachable": False,
            "is_local_gateway": is_local_target,
            "source": "none",
            "gateway_url": target_url,
            "gateway_host": "",
            "gateway_ip": req_host,
            "gateway_root": "",
            "page_generated": "",
            "error": live.get("error") or "Materials Studio Remote Gateway not found.",
            "total_jobs": 0,
            "running_jobs": 0,
            "archived_total": 0,
            "jobs": [],
            "archived_jobs": [],
            "installed_servers": [],
            "gateway_data": [],
        }

    # Build final active jobs list (live HTTP is authoritative when reachable!)
    if live_ok:
        jobs = []
        for lj in live["jobs"]:
            dj = disk_active_map.get(lj["job_id"])
            if dj:
                lj["cpu_cores"] = dj.get("cpu_cores", 0)
                lj["job_directory"] = dj.get("job_directory", "")
                lj["has_local_files"] = dj.get("has_local_files", False)
                lj["start_ts"] = dj.get("start_ts", 0)
                lj["finish_ts"] = dj.get("finish_ts", 0)
                lj["client_ip"] = dj.get("client_ip", "")
            jobs.append(lj)
    else:
        jobs = disk_active_list

    # Sort running/starting/queued first, then newest create_ts descending
    def _job_sort_key(j):
        st = (j.get("status") or "").lower()
        is_active = 0 if any(k in st for k in ("running", "starting", "queued", "setup")) else 1
        return (is_active, -(j.get("create_ts") or 0), j.get("job_id") or "")

    jobs.sort(key=_job_sort_key)

    # Build final Installed Servers list
    if live_ok and live["installed_servers"]:
        installed_servers = []
        for ls in live["installed_servers"]:
            loc = local_servers_map.get(ls["name"].lower())
            if loc:
                merged = dict(loc)
                merged["category"] = ls.get("category") or loc.get("category")
                merged["sbs_file"] = ls.get("sbs_file") or loc.get("sbs_file", f"{ls['name']}.sbs")
                merged["detail_url"] = ls.get("detail_url", "")
                installed_servers.append(merged)
            else:
                installed_servers.append({
                    "name": ls["name"],
                    "category": ls.get("category", "Other"),
                    "description": f"{ls['name']} Server Application",
                    "version": "Installed",
                    "build_date": "-",
                    "executable": "",
                    "shell": "",
                    "wait_for_start": "",
                    "timeout": "",
                    "polling_interval": "",
                    "max_cores": "0",
                    "clean_tmp": "",
                    "sbs_file": ls.get("sbs_file") or f"{ls['name']}.sbs",
                    "detail_url": ls.get("detail_url", ""),
                    "details": [],
                })
    else:
        installed_servers = local_servers_list

    # Build final Gateway Data key-value table (filtering out internal _apacheroot unless useful)
    if live_ok and live["gateway_data"]:
        gateway_data = live["gateway_data"]
    else:
        gateway_data = [
            it for it in local_gw_items
            if not it["key"].startswith("_") and it["key"] not in ("versionmajor", "versionminor")
        ]

    gw_kv_live = {it["key"].lower(): it["value"] for it in gateway_data}
    gw_ip = gw_kv_live.get("ipaddress") or req_host

    final_host = live.get("gateway_host") or (local_host_label if is_local_target else f"{req_host}_{parsed_u.port or 18888}")
    running_cnt = sum(
        1 for j in jobs
        if any(k in (j.get("status") or "").lower() for k in ("running", "starting", "queued"))
    )

    return {
        "connected": True,
        "live_http_reachable": live_ok,
        "is_local_gateway": is_local_target,
        "source": "live_http+disk" if (live_ok and is_local_target and gw_root) else ("live_http" if live_ok else "local_disk"),
        "gateway_url": target_url,
        "gateway_host": final_host,
        "gateway_ip": gw_ip,
        "gateway_root": gw_root if is_local_target else "",
        "page_generated": live.get("page_generated", ""),
        "total_jobs": len(jobs),
        "running_jobs": running_cnt,
        "archived_total": archived_total,
        "jobs": jobs[:limit],
        "archived_jobs": archived_list,
        "installed_servers": installed_servers,
        "gateway_data": gateway_data,
        "local_processes": _detect_castep_processes() if is_local_target else [],
    }


@app.get("/api/castep/gateway/server-detail")
def api_castep_gateway_server_detail(
    server: str,
    gateway_url: Optional[str] = None,
    file: Optional[str] = None,
):
    import urllib.request
    import urllib.parse
    import html as _html

    srv = (server or "").strip()
    sbs_file = (file or f"{srv}.sbs").strip()
    if not re.match(r"^[A-Za-z0-9._-]{1,64}$", srv):
        raise HTTPException(status_code=400, detail="Invalid server name.")
    if not re.match(r"^[A-Za-z0-9._-]{1,80}$", sbs_file):
        raise HTTPException(status_code=400, detail="Invalid server .sbs filename.")

    target_url = _normalize_gateway_url(gateway_url, DEFAULT_MS_GATEWAY_URL)
    if not re.match(r"^https?://[A-Za-z0-9.\-_:\[\]]+$", target_url):
        raise HTTPException(status_code=400, detail="Invalid Gateway URL.")
    fetch_base = re.sub(r"^(https?://)localhost(?=:|$)", r"\g<1>127.0.0.1", target_url, flags=re.I)

    url = (
        f"{fetch_base}/dsd/commands/dsd_configuregw.pl"
        f"?server={urllib.parse.quote(srv)}&file={urllib.parse.quote(sbs_file)}"
    )
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "MatSciNexus-GatewayBridge/1.0"})
        with urllib.request.urlopen(req, timeout=4.0) as resp:
            page_html = resp.read().decode("utf-8", errors="ignore")
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Failed to fetch server detail from Gateway: {exc}")

    details = []
    kv = {}
    m_tbl = re.search(r'<table[^>]*class="[^"]*contenttables[^"]*"[^>]*>(.*?)</table>', page_html, re.I | re.S)
    if m_tbl:
        for tr_m in re.finditer(r"<tr>(.*?)</tr>", m_tbl.group(1), re.I | re.S):
            tds = re.findall(r"<td[^>]*>(.*?)</td>", tr_m.group(1), re.I | re.S)
            if len(tds) >= 2:
                k = _strip_html_tags(tds[0])
                v = _strip_html_tags(tds[1])
                if k:
                    details.append({"key": k, "value": v})
                    kv[k] = v

    ver_maj = kv.get("VersionMajor", "")
    ver_min = kv.get("VersionMinor", "")
    rev = kv.get("Revision", "")
    ver_str = f"{ver_maj}.{ver_min}" + (f".{rev}" if rev else "") if ver_maj else ""

    return {
        "ok": True,
        "server": srv,
        "gateway_url": target_url,
        "category": kv.get("Category", ""),
        "description": kv.get("Description", ""),
        "version": ver_str or "Installed",
        "build_date": kv.get("Builddate", "-"),
        "executable": kv.get("server-executable", ""),
        "shell": kv.get("shell", ""),
        "max_cores": kv.get("MaxCoresPerProcessor", "0"),
        "details": details,
    }


def _fetch_remote_gateway_job_detail(target_url: str, job_id: str):
    import urllib.request
    import urllib.parse
    import html as _html
    import tempfile
    import time

    fetch_base = re.sub(r"^(https?://)localhost(?=:|$)", r"\g<1>127.0.0.1", target_url, flags=re.I)
    dir_url = f"{fetch_base}/dsd/jobs/{job_id}/"
    try:
        req = urllib.request.Request(dir_url, headers={"User-Agent": "MatSciNexus-GatewayBridge/1.0"})
        with urllib.request.urlopen(req, timeout=5.0) as resp:
            dir_html = resp.read().decode("utf-8", errors="ignore")
    except Exception as exc:
        raise HTTPException(
            status_code=404,
            detail=f"Remote Gateway job directory {target_url}/dsd/jobs/{job_id}/ is not accessible: {exc}",
        )

    # Extract file links from Apache directory index
    file_map = {}  # display_name -> raw_href
    all_files = []
    for raw_href in re.findall(r'href="([^"]+)"', dir_html, re.I):
        h = _html.unescape(raw_href).strip()
        if not h or h.startswith(("?", "/", "http://", "https://", "#")) or h.endswith("/"):
            continue
        disp = urllib.parse.unquote(h)
        if "/" in disp or disp in (".", ".."):
            continue
        if disp not in file_map:
            file_map[disp] = h
            all_files.append(disp)

    if not all_files:
        raise HTTPException(
            status_code=404,
            detail=f"No accessible output files found in remote Gateway job {job_id} ({target_url}/dsd/jobs/{job_id}/).",
        )

    def _find_match(pred):
        for fn in all_files:
            if pred(fn.lower()):
                return fn
        return None

    def _fetch_bytes(fn: Optional[str], max_bytes: int = 1200000, append_tail: bool = False) -> bytes:
        if not fn or fn not in file_map:
            return b""
        f_url = dir_url + file_map[fn]
        try:
            req = urllib.request.Request(f_url, headers={"User-Agent": "MatSciNexus-GatewayBridge/1.0"})
            with urllib.request.urlopen(req, timeout=6.0) as resp:
                data = resp.read(max_bytes)
                total_len = int(resp.headers.get("Content-Length") or 0)
            if append_tail and total_len > max_bytes:
                try:
                    tail_sz = min(800000, total_len - max_bytes)
                    t_req = urllib.request.Request(
                        f_url,
                        headers={
                            "User-Agent": "MatSciNexus-GatewayBridge/1.0",
                            "Range": f"bytes=-{tail_sz}",
                        },
                    )
                    with urllib.request.urlopen(t_req, timeout=5.0) as tresp:
                        if getattr(tresp, "status", 200) in (200, 206):
                            data = data + b"\n... [truncated middle of remote log] ...\n" + tresp.read(tail_sz)
                except Exception:
                    pass
            return data
        except Exception:
            return b""

    def _fetch_text(fn: Optional[str], max_bytes: int = 1200000, append_tail: bool = False) -> str:
        raw = _fetch_bytes(fn, max_bytes=max_bytes, append_tail=append_tail)
        return raw.decode("utf-8", errors="ignore") if raw else ""

    def _fetch_bands(fn: Optional[str]):
        if not fn:
            return None
        raw = _fetch_bytes(fn, max_bytes=3000000)
        if not raw:
            return None
        tmp_path = None
        try:
            with tempfile.NamedTemporaryFile(mode="wb", suffix=".bands", delete=False) as tf:
                tf.write(raw)
                tmp_path = tf.name
            parsed = _parse_castep_bands_backend(tmp_path)
            if parsed and "_all_e_by_k" in parsed:
                del parsed["_all_e_by_k"]
            return parsed
        except Exception:
            return None
        finally:
            if tmp_path and os.path.exists(tmp_path):
                try:
                    os.unlink(tmp_path)
                except Exception:
                    pass

    cell_f = _find_match(lambda l: l.endswith(".cell") and not l.endswith(("_bandstr.cell", "_dos.cell", "_optics.cell")))
    param_f = _find_match(lambda l: l.endswith(".param") and not l.endswith(("_bandstr.param", "_dos.param", "_optics.param")))
    castep_f = _find_match(lambda l: l.endswith(".castep") and not l.endswith(("_bandstr.castep", "_dos.castep", "_optics.castep")))
    optics_castep_f = _find_match(lambda l: l.endswith("_optics.castep"))
    geom_f = _find_match(lambda l: l.endswith(".geom"))
    status_f = _find_match(lambda l: l == "status.txt") or _find_match(lambda l: l.endswith(".summary"))
    xsd_f = _find_match(lambda l: l.endswith(".xsd"))
    cif_f = _find_match(lambda l: l.endswith(".cif"))

    seed_src = cell_f or castep_f or param_f or job_id
    seed = _normalize_castep_seed(seed_src) if "." in seed_src else seed_src

    band_xcd_f = _find_match(lambda l: l.endswith(".xcd") and "band" in l)
    dos_xcd_f = _find_match(lambda l: l.endswith(".xcd") and "dos" in l and "pdos" not in l)
    pdos_xcd_f = _find_match(lambda l: l.endswith(".xcd") and "pdos" in l)
    conv_xcd_f = _find_match(lambda l: l.endswith(".xcd") and "conv" in l)
    ener_xcd_f = _find_match(lambda l: l.endswith(".xcd") and ("ener" in l or "energies" in l))

    bandstr_f = _find_match(lambda l: l.endswith("_bandstr.bands"))
    dos_bands_f = _find_match(lambda l: l.endswith("_dos.bands")) or _find_match(lambda l: l.endswith(".bands") and not l.endswith(("_bandstr.bands", "_optics.bands")))
    optics_bands_f = _find_match(lambda l: l.endswith("_optics.bands"))

    return {
        "folder": f"{target_url}/dsd/jobs/{job_id}/",
        "seed": seed,
        "gateway_job_id": job_id,
        "remote_gateway": True,
        "updated_at": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()),
        "files_list": all_files,
        "cell_text": _fetch_text(cell_f, 400000),
        "param_text": _fetch_text(param_f, 200000),
        "castep_text": _fetch_text(castep_f, 1500000, append_tail=True),
        "optics_castep_text": _fetch_text(optics_castep_f, 200000),
        "geom_text": _fetch_text(geom_f, 900000),
        "status_text": _fetch_text(status_f, 200000),
        "xsd_text": _fetch_text(xsd_f, 250000),
        "cif_text": _fetch_text(cif_f, 250000),
        "conv_xcd": _parse_xcd_file_backend(_fetch_text(conv_xcd_f, 500000)) if conv_xcd_f else None,
        "ener_xcd": _parse_xcd_file_backend(_fetch_text(ener_xcd_f, 500000)) if ener_xcd_f else None,
        "band_xcd": _parse_xcd_file_backend(_fetch_text(band_xcd_f, 1500000), is_band=True) if band_xcd_f else None,
        "dos_xcd": _parse_xcd_file_backend(_fetch_text(dos_xcd_f, 1500000)) if dos_xcd_f else None,
        "pdos_xcd": _parse_xcd_file_backend(_fetch_text(pdos_xcd_f, 1500000)) if pdos_xcd_f else None,
        "pdos_bin_data": None,
        "optical_xcd": None,
        "optical_xcds": [],
        "chdiff_data": None,
        "charg_frm_files": [f for f in all_files if f.lower().endswith((".charg_frm", ".den_fmt", ".cube"))],
        "bandstr_bands": _fetch_bands(bandstr_f),
        "dos_bands": _fetch_bands(dos_bands_f),
        "optics_bands": _fetch_bands(optics_bands_f),
    }


@app.get("/api/castep/gateway/job/{job_id}")
def api_castep_gateway_job_detail(job_id: str, gateway_url: Optional[str] = None):
    import socket
    from urllib.parse import urlparse

    if not re.match(r"^[A-Za-z0-9_-]{2,24}$", job_id or ""):
        raise HTTPException(status_code=400, detail="Invalid Gateway Job Id.")

    target_url = _normalize_gateway_url(gateway_url, DEFAULT_MS_GATEWAY_URL)
    gw_root = _find_local_ms_gateway_root()
    hostname = socket.gethostname().lower()
    _, local_gw_kv = _parse_gw_kv_file(os.path.join(gw_root, "conf", "gw-info.sbd")) if gw_root else ([], {})
    req_host = (urlparse(target_url).hostname or "").lower()
    is_local_target = req_host in (
        "localhost", "127.0.0.1", "::1", hostname,
        (local_gw_kv.get("hostname") or "").lower(),
        (local_gw_kv.get("ipaddress") or "").lower(),
    )

    if is_local_target and gw_root:
        job_dir = ""
        for sub in ("jobs-info", "jobs-info-archive"):
            sbj_path = os.path.join(gw_root, sub, f"{job_id}.sbj")
            if os.path.isfile(sbj_path):
                rec = _parse_sbj_file(sbj_path, sub == "jobs-info-archive", gw_root)
                if rec.get("job_directory") and os.path.isdir(rec["job_directory"]):
                    job_dir = rec["job_directory"]
                    break
        if not job_dir:
            cand = os.path.join(gw_root, "jobs", job_id)
            if os.path.isdir(cand):
                job_dir = cand
        if job_dir and os.path.isdir(job_dir):
            detail = api_castep_job_detail(folder=job_dir)
            detail["gateway_job_id"] = job_id
            return detail

    # Remote Gateway (e.g. http://115.145.191.231:18888) or fallback via HTTP /dsd/jobs/{job_id}/
    return _fetch_remote_gateway_job_detail(target_url, job_id)


@app.post("/api/castep/gateway/remove")
async def api_castep_gateway_remove_job(request: Request):
    import urllib.request
    import html as _html

    body = await request.json()
    job_id = str(body.get("job_id") or "").strip()
    gateway_url = _normalize_gateway_url(body.get("gateway_url"), DEFAULT_MS_GATEWAY_URL)
    if not re.match(r"^[A-Za-z0-9_-]{2,24}$", job_id):
        raise HTTPException(status_code=400, detail="Invalid Gateway Job Id.")
    if not re.match(r"^https?://[A-Za-z0-9.\-_:\[\]]+$", gateway_url):
        raise HTTPException(status_code=400, detail="Invalid Gateway URL.")
    fetch_base = re.sub(r"^(https?://)localhost(?=:|$)", r"\g<1>127.0.0.1", gateway_url, flags=re.I)

    try:
        jobs_html = urllib.request.urlopen(
            f"{fetch_base}/dsd/commands/dsd_configuregw.pl?jobs=yes", timeout=3.5
        ).read().decode("utf-8", errors="ignore")
        m_del = re.search(
            rf'href="([^"]*deletejob=yes[^"]*job-id={re.escape(job_id)}[^"]*)"',
            jobs_html,
            re.I,
        )
        if not m_del:
            raise HTTPException(status_code=404, detail=f"Job {job_id} not found or cannot be removed on live Gateway.")
        del_href = _html.unescape(m_del.group(1))
        del_url = fetch_base + del_href if del_href.startswith("/") else del_href
        urllib.request.urlopen(del_url, timeout=5.0).read()
        return {"ok": True, "job_id": job_id, "removed_from_live_gateway": True}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Failed to remove job {job_id} on Gateway: {exc}")


@app.post("/api/castep/save")
async def api_castep_save_files(request: Request):
    body = await request.json()
    folder = (body.get("folder") or "").strip()
    subfolder = (body.get("subfolder") or "").strip()
    files_dict = body.get("files") or {}
    if not folder:
        raise HTTPException(status_code=400, detail="Target folder path is required.")
    target_dir = os.path.join(folder, subfolder) if subfolder else folder
    try:
        os.makedirs(target_dir, exist_ok=True)
        saved_paths = []
        for fname, content_str in files_dict.items():
            safe_name = os.path.basename(fname)
            if not safe_name:
                continue
            out_fp = os.path.join(target_dir, safe_name)
            with open(out_fp, "w", encoding="utf-8", newline="\n") as f:
                f.write(str(content_str))
            saved_paths.append(out_fp)
        return {
            "ok": True,
            "target_dir": target_dir,
            "saved_files": saved_paths,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to write files to {target_dir}: {str(e)}")


# ============================================================================
# Static Frontend Serving (Supports both /static/* and relative paths for GitHub Pages)
# ============================================================================

app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")


@app.get("/")
def serve_index():
    return FileResponse(str(FRONTEND_DIR / "index.html"))


@app.get("/styles.css")
def serve_css():
    return FileResponse(str(FRONTEND_DIR / "styles.css"))


@app.get("/app.js")
def serve_js():
    return FileResponse(str(FRONTEND_DIR / "app.js"))


@app.get("/cif_engine.js")
def serve_cif_engine_js():
    return FileResponse(str(FRONTEND_DIR / "cif_engine.js"))


@app.get("/matsci_tools.js")
def serve_tools_js():
    return FileResponse(str(FRONTEND_DIR / "matsci_tools.js"))


@app.get("/index.html")
def serve_index_html():
    return FileResponse(str(FRONTEND_DIR / "index.html"))


@app.get("/data.json")
def serve_data_json():
    return FileResponse(str(FRONTEND_DIR / "data.json"))


@app.get("/profile_photo.jpg")
def serve_profile_photo():
    return FileResponse(str(FRONTEND_DIR / "profile_photo.jpg"))

