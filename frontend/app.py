import json
import requests as ext_requests
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from backend.database import init_db, get_connection
from backend.services import clean_doi, fetch_doi_metadata, sync_orcid_profile, sync_scholar_profile
from backend.pptx_generator import build_weekly_report_pptx

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


class GoogleVerifyRequest(BaseModel):
    id_token: Optional[str] = ""
    access_token: Optional[str] = ""
    email: Optional[str] = ""
    name: Optional[str] = ""
    picture: Optional[str] = ""


class AuthConfigUpdate(BaseModel):
    owner_email: str = "lamvt.skku@gmail.com"
    google_client_id: Optional[str] = ""


PRIMARY_OWNER_EMAIL = "lamvt.skku@gmail.com"


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


# ============================================================================
# Google Account Authentication & Owner Control API (Locked to lamvt.skku@gmail.com)
# ============================================================================

@app.get("/api/auth/config")
def get_auth_config():
    prof = load_full_profile()
    return {
        "owner_email": PRIMARY_OWNER_EMAIL,
        "google_client_id": prof.get("google_client_id") or "",
    }


@app.put("/api/auth/config")
def update_auth_config(cfg: AuthConfigUpdate):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "UPDATE academic_profile SET owner_email = ?, google_client_id = ? WHERE id = 1",
        (PRIMARY_OWNER_EMAIL, (cfg.google_client_id or "").strip()),
    )
    conn.commit()
    conn.close()
    return get_auth_config()


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
    else:
        email = normalize_owner_email(req.email or "")
        name = (req.name or "").strip() or "Vu Tien Lam"
        picture = req.picture or ""

    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Please sign in with your Google Account (lamvt.skku@gmail.com).")

    if email != PRIMARY_OWNER_EMAIL:
        raise HTTPException(
            status_code=403,
            detail=f"Access Denied: '{email}' is not authorized. Only the owner Google account ({PRIMARY_OWNER_EMAIL}) can manage this workspace.",
        )

    return {
        "authenticated": True,
        "is_owner": True,
        "email": PRIMARY_OWNER_EMAIL,
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
            "total_notes": len(notes),
            "synthesis_batches": sum(1 for n in notes if n.get("sample_id")),
            "upcoming_tasks": sum(1 for s in schedule if s.get("status") != "Completed"),
            "completed_tasks": sum(1 for s in schedule if s.get("status") == "Completed"),
            "total_citations": profile.get("total_citations", 0),
            "h_index": profile.get("h_index", 0),
        },
        "recent_papers": papers[:4],
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

    # 1. Check for duplicate DOI BEFORE inserting
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
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DOI lookup error: {str(e)}")

    # Double-check resolved DOI against database
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

    if not req.auto_save:
        return meta

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
    return dict(row)


@app.delete("/api/papers/{paper_id}")
def delete_paper(paper_id: int):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM papers WHERE id = ?", (paper_id,))
    conn.commit()
    conn.close()
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

    for n in rep_notes:
        if n.get("key_findings"):
            prefix = f"[{n['sample_id']}] " if n.get("sample_id") else ""
            completed_lines.append(f"{prefix}{n['key_findings']}")

    if not completed_lines:
        completed_lines = [
            "Synthesized target solid-state electrolyte pellets (LLZTO-2026-04) with 95.8% relative density.",
            "Completed powder XRD phase confirmation and XPS surface depth profiling.",
            "Reviewed key benchmark publications on excess Li stoichiometry and ALD surface engineering."
        ]

    exp_rows = []
    for n in rep_notes:
        exp_rows.append({
            "sample_id": n.get("sample_id") or "EXP-01",
            "material": n.get("material_formula") or n.get("title", "")[:30],
            "conditions": n.get("conditions") or "Standard synthesis protocol",
            "methods": n.get("characterization_methods") or "XRD, SEM",
            "findings": n.get("key_findings") or "Phase pure structure confirmed."
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
            "Perform FE-SEM cross-section imaging and EDS elemental mapping on ALD-coated pellets.",
            "Assemble Li | LLZTO-ALD | Li symmetric cells for critical current density (CCD) stripping/plating tests.",
            "Complete Rietveld refinement of XRD patterns using GSAS-II."
        ]

    blockers = (
        "• Trace surface Li2CO3 regeneration noticed after >15 min ambient exposure during sample mounting.\n"
        "• Mitigation: Implemented vacuum-sealed transfer holder directly from Ar glovebox to XPS intro chamber.\n"
        "• High-temperature tube furnace #1 thermocouple replacement scheduled; shifted sintering runs to Furnace #2."
    )

    return {
        "title": "Weekly Research Progress Report",
        "week_start": monday.strftime("%Y-%m-%d"),
        "week_end": friday.strftime("%Y-%m-%d"),
        "presenter_name": prof.get("full_name", "Alex Chen"),
        "advisor_name": prof.get("advisor", "Prof. Sarah Jenkins"),
        "lab_name": prof.get("affiliation", "Nanomaterials & Energy Storage Laboratory"),
        "university": "Department of Materials Science & Engineering",
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

    updated = load_full_profile()
    updated["sync_summary"] = (
        f"Synced via {synced.get('provider', 'Google Scholar')}: "
        f"Citations={synced['total_citations']}, h-index={synced['h_index']}, i10-index={synced['i10_index']} "
        f"({added_count} new publications imported)."
    )
    return updated


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

