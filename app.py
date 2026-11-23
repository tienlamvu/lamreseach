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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


def parse_cif_string(cif_text: str) -> dict:
    """Parse raw Crystallographic Information File (CIF) and generate POSCAR format."""
    text = cif_text.replace("\r\n", "\n").replace("\r", "\n")

    def get_tag_val(tag_pattern, default=""):
        m = re.search(rf"^\s*{tag_pattern}\s+([^\n\r]+)", text, re.MULTILINE | re.IGNORECASE)
        if m:
            val = m.group(1).strip()
            val = re.sub(r"^['\"]|['\"]$", "", val).strip()
            val_clean = re.sub(r"\(\d+\)", "", val).strip()
            return val_clean
        return default

    formula = get_tag_val(r"_chemical_formula_sum") or get_tag_val(r"_chemical_name_common") or "Unknown Formula"
    formula = formula.replace(" ", "")
    space_group = get_tag_val(r"_symmetry_space_group_name_H-M") or get_tag_val(r"_space_group_name_H-M_alt") or "P 1"

    def parse_float(tag, default=0.0):
        val = get_tag_val(tag, "")
        try:
            return float(val)
        except Exception:
            return default

    a = parse_float(r"_cell_length_a", 4.0)
    b = parse_float(r"_cell_length_b", a)
    c = parse_float(r"_cell_length_c", a)
    alpha = parse_float(r"_cell_angle_alpha", 90.0)
    beta = parse_float(r"_cell_angle_beta", 90.0)
    gamma = parse_float(r"_cell_angle_gamma", 90.0)

    vol = parse_float(r"_cell_volume", 0.0)
    if vol <= 0.0 and a > 0 and b > 0 and c > 0:
        ar = math.radians(alpha)
        br = math.radians(beta)
        gr = math.radians(gamma)
        val_in_sqrt = 1 - math.cos(ar)**2 - math.cos(br)**2 - math.cos(gr)**2 + 2*math.cos(ar)*math.cos(br)*math.cos(gr)
        if val_in_sqrt > 0:
            vol = round(a * b * c * math.sqrt(val_in_sqrt), 2)
        else:
            vol = round(a * b * c, 2)

    if abs(a - b) < 0.01 and abs(b - c) < 0.01 and abs(alpha - 90) < 0.5 and abs(beta - 90) < 0.5 and abs(gamma - 90) < 0.5:
        crystal_system = "Cubic"
    elif abs(a - b) < 0.01 and abs(alpha - 90) < 0.5 and abs(beta - 90) < 0.5 and (abs(gamma - 120) < 0.5 or abs(gamma - 60) < 0.5):
        crystal_system = "Hexagonal"
    elif abs(a - b) < 0.01 and abs(alpha - 90) < 0.5 and abs(beta - 90) < 0.5 and abs(gamma - 90) < 0.5:
        crystal_system = "Tetragonal"
    elif abs(alpha - 90) < 0.5 and abs(beta - 90) < 0.5 and abs(gamma - 90) < 0.5:
        crystal_system = "Orthorhombic"
    elif abs(alpha - 90) < 0.5 and abs(gamma - 90) < 0.5:
        crystal_system = "Monoclinic"
    else:
        crystal_system = "Triclinic"

    atoms = []
    for loop_match in re.finditer(r"loop_\s+((?:_[^\s]+\s+)+)([\s\S]+?)(?=\n\s*(?:loop_|data_|#|\Z))", text + "\n", re.IGNORECASE):
        headers = [h.strip().lower() for h in loop_match.group(1).split() if h.startswith("_")]
        if not any("atom_site_fract_x" in h for h in headers):
            continue

        data_lines = [l.strip() for l in loop_match.group(2).split("\n") if l.strip() and not l.strip().startswith("#") and not l.strip().startswith("_")]
        type_idx = -1
        label_idx = -1
        x_idx = -1
        y_idx = -1
        z_idx = -1
        for i, h in enumerate(headers):
            if "atom_site_type_symbol" in h:
                type_idx = i
            elif "atom_site_label" in h:
                label_idx = i
            elif "atom_site_fract_x" in h:
                x_idx = i
            elif "atom_site_fract_y" in h:
                y_idx = i
            elif "atom_site_fract_z" in h:
                z_idx = i

        if x_idx != -1 and y_idx != -1 and z_idx != -1:
            for line in data_lines:
                parts = line.split()
                if len(parts) > max(type_idx, label_idx, x_idx, y_idx, z_idx):
                    sym = ""
                    if type_idx != -1:
                        sym = re.sub(r"[^A-Za-z]", "", parts[type_idx])
                    if not sym and label_idx != -1:
                        sym = re.sub(r"[^A-Za-z]", "", parts[label_idx])
                    if not sym:
                        sym = "X"
                    sym = sym.capitalize().strip()

                    def clean_fract(val_str):
                        s = re.sub(r"\(\d+\)", "", val_str).strip()
                        if "/" in s:
                            n, d = s.split("/")
                            return float(n) / float(d)
                        return float(s)

                    try:
                        fx = clean_fract(parts[x_idx])
                        fy = clean_fract(parts[y_idx])
                        fz = clean_fract(parts[z_idx])
                        lbl = parts[label_idx] if label_idx != -1 else sym
                        atoms.append({"element": sym, "label": lbl, "x": round(fx, 5), "y": round(fy, 5), "z": round(fz, 5)})
                    except Exception:
                        pass
            break

    natoms = len(atoms) if atoms else 5
    if atoms and (not formula or formula == "UnknownFormula"):
        from collections import Counter
        elem_counts = Counter(at["element"] for at in atoms)
        formula = "".join(f"{el}{cnt if cnt > 1 else ''}" for el, cnt in elem_counts.items())

    # Build POSCAR
    poscar_lines = [f"{formula} {crystal_system} {space_group}", "1.0"]
    ar = math.radians(alpha)
    br = math.radians(beta)
    gr = math.radians(gamma)
    ax, ay, az = a, 0.0, 0.0
    bx = b * math.cos(gr)
    by = b * math.sin(gr)
    bz = 0.0
    cx = c * math.cos(br)
    cy = c * (math.cos(ar) - math.cos(br) * math.cos(gr)) / (math.sin(gr) if math.sin(gr) != 0 else 1.0)
    cz_sq = c**2 - cx**2 - cy**2
    cz = math.sqrt(max(0.0, cz_sq))
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
        "a": round(a, 4),
        "b": round(b, 4),
        "c": round(c, 4),
        "alpha": round(alpha, 2),
        "beta": round(beta, 2),
        "gamma": round(gamma, 2),
        "volume": round(vol, 2),
        "natoms": natoms,
        "cif_content": cif_text,
        "poscar_content": poscar_content,
        "atoms": atoms[:50],
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
        i = 0
        while i < len(lines):
            l = lines[i].strip()
            if l.startswith("Number of k-points"):
                nk = int(l.split()[-1])
            elif l.startswith("Number of spin components"):
                ns = int(l.split()[-1])
            elif l.startswith("Number of electrons"):
                nelec = float(l.split()[3])
            elif l.startswith("Number of eigenvalues"):
                neig = int(l.split()[3])
            elif l.startswith("Fermi energ"):
                parts = l.split()
                for tok in reversed(parts):
                    try:
                        ef_ha = float(tok)
                        break
                    except Exception:
                        pass
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
                            ev_list.append(round((val_ha - ef_ha) * HA_EV, 4))
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
            vals = [kp["e"][0][b] for kp in kpts if b < len(kp["e"][0])]
            if vals and max(vals) >= -e_window and min(vals) <= e_window:
                keep_bands.append(b)
        all_e_by_k = [kp["e"] for kp in kpts]
        for kp in kpts:
            kp["e"] = [[round(sp[b], 4) for b in keep_bands if b < len(sp)] for sp in kp["e"]]
        return {
            "nk": len(kpts),
            "ns": ns,
            "neig": len(keep_bands),
            "total_bands": neig,
            "nelec": nelec,
            "ef_ha": round(ef_ha, 6),
            "ef_ev": round(ef_ha * HA_EV, 4),
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

        # Build fine energy histogram grid [-12.0, +8.0] eV (800 bins, dE = 0.025 eV)
        e_min, e_max, n_bins = -12.0, 8.0, 800
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


@app.get("/api/castep/gateway")
def api_castep_gateway_jobs(include_archived: bool = True, limit: int = 120):
    import glob
    import time
    import socket

    hostname = socket.gethostname().lower()
    gw_candidates = sorted(
        glob.glob(r"C:\ProgramData\BIOVIA\Materials Studio\*\Gateway-x64\root_default\dsd"),
        reverse=True,
    )
    gw_root = gw_candidates[0] if gw_candidates else ""
    if not gw_root or not os.path.isdir(gw_root):
        return {
            "connected": False,
            "gateway_host": f"{hostname}_18888",
            "gateway_root": "",
            "total_jobs": 0,
            "archived_total": 0,
            "jobs": [],
        }

    info_dir = os.path.join(gw_root, "jobs-info")
    arch_dir = os.path.join(gw_root, "jobs-info-archive")

    def _parse_sbj(path, is_archived=False):
        jid = os.path.splitext(os.path.basename(path))[0]
        item = {
            "job_id": jid,
            "description": jid,
            "server": "CASTEP",
            "owner": "",
            "status": "terminated",
            "create_ts": 0,
            "submitted": "-",
            "queue": "-",
            "queued_job_id": "-",
            "process_id": "-",
            "cpu_cores": 0,
            "job_directory": "",
            "is_archived": is_archived,
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
                            item["submitted"] = time.strftime(f"%a %b {day_num} %H:%M:%S %Y", t_st)
                        except Exception:
                            pass
                    elif k == "job-primary-processid":
                        item["process_id"] = v
                    elif k == "job-processid" and item["process_id"] == "-":
                        item["process_id"] = v
                    elif k == "job-cpu-number":
                        try:
                            item["cpu_cores"] = int(v)
                        except Exception:
                            pass
                    elif k == "job-directory":
                        item["job_directory"] = v.replace("/", "\\")
        except Exception:
            pass
        return item

    jobs = []
    if os.path.exists(info_dir):
        for p in sorted(glob.glob(os.path.join(info_dir, "*.sbj"))):
            jobs.append(_parse_sbj(p, False))
    arch_files = glob.glob(os.path.join(arch_dir, "*.sbj")) if os.path.exists(arch_dir) else []
    if include_archived and arch_files:
        arch = [_parse_sbj(p, True) for p in arch_files]
        arch.sort(key=lambda x: x["create_ts"], reverse=True)
        jobs.extend(arch[: max(0, limit - len(jobs))])

    return {
        "connected": True,
        "gateway_host": f"{hostname}_18888",
        "gateway_root": gw_root,
        "total_jobs": len(jobs),
        "archived_total": len(arch_files),
        "jobs": jobs[:limit],
    }


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

