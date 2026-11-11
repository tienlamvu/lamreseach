import sqlite3
import json
from pathlib import Path
from datetime import datetime, timedelta

DB_PATH = Path(__file__).parent / "matsci_hub.db"


def get_connection():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def ensure_column(cursor, table: str, column: str, col_def: str):
    cursor.execute(f"PRAGMA table_info({table})")
    existing = {row["name"] for row in cursor.fetchall()}
    if column not in existing:
        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column} {col_def}")


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Literature / Papers table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS papers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        doi TEXT,
        title TEXT NOT NULL,
        authors TEXT,
        journal TEXT,
        year INTEGER,
        volume TEXT,
        issue TEXT,
        pages TEXT,
        abstract TEXT,
        url TEXT,
        pdf_url TEXT,
        citation_count INTEGER DEFAULT 0,
        material_system TEXT,
        synthesis_method TEXT,
        characterization_tags TEXT,
        status TEXT DEFAULT 'To Read',
        rating INTEGER DEFAULT 4,
        notes TEXT,
        bibtex TEXT,
        in_weekly_report INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 2. Lab Notes & Synthesis Log table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT DEFAULT 'Experiment / Synthesis',
        sample_id TEXT,
        material_formula TEXT,
        precursors TEXT,
        conditions TEXT,
        characterization_methods TEXT,
        content TEXT,
        key_findings TEXT,
        tags TEXT,
        pinned INTEGER DEFAULT 0,
        in_weekly_report INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 3. Schedule / Calendar / Tasks table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS schedule_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        event_type TEXT DEFAULT 'Synthesis / Furnace',
        instrument_or_location TEXT,
        start_date TEXT NOT NULL,
        start_time TEXT DEFAULT '09:00',
        end_time TEXT DEFAULT '11:00',
        priority TEXT DEFAULT 'Medium',
        status TEXT DEFAULT 'Scheduled',
        sample_id TEXT,
        description TEXT,
        in_weekly_report INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 4. Weekly Reports table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS weekly_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        week_start TEXT NOT NULL,
        week_end TEXT NOT NULL,
        presenter_name TEXT,
        advisor_name TEXT,
        lab_name TEXT,
        university TEXT,
        theme_color TEXT DEFAULT 'oxford_navy',
        summary_achievements TEXT,
        experimental_results_json TEXT,
        literature_review_json TEXT,
        blockers_troubleshooting TEXT,
        next_week_plan TEXT,
        metrics_json TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 5. Academic Profile & Scientific CV table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS academic_profile (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        full_name TEXT DEFAULT 'Alex Chen',
        title_role TEXT DEFAULT 'Ph.D. Candidate in Materials Science & Engineering',
        affiliation TEXT DEFAULT 'Department of Materials Science & Engineering',
        advisor TEXT DEFAULT 'Prof. Sarah Jenkins',
        research_focus TEXT DEFAULT 'Solid-State Batteries, Perovskite Optoelectronics & 2D MXene Catalysts',
        orcid_id TEXT DEFAULT '',
        scholar_id TEXT DEFAULT '',
        email TEXT DEFAULT 'alex.chen@university.edu',
        phone TEXT DEFAULT '+1 (555) 234-5678',
        website TEXT DEFAULT 'https://github.com/matsci-researcher',
        location TEXT DEFAULT 'Cambridge, MA / Materials Research Lab',
        total_citations INTEGER DEFAULT 0,
        h_index INTEGER DEFAULT 0,
        i10_index INTEGER DEFAULT 0,
        bio TEXT DEFAULT '',
        education_json TEXT DEFAULT '[]',
        experiences_json TEXT DEFAULT '[]',
        publications_json TEXT DEFAULT '[]',
        conferences_json TEXT DEFAULT '[]',
        skills_json TEXT DEFAULT '{}',
        awards_json TEXT DEFAULT '[]',
        owner_email TEXT DEFAULT '',
        google_client_id TEXT DEFAULT '',
        last_synced_at TEXT DEFAULT ''
    )
    """)

    # Ensure new CV & Auth columns exist if migrating an existing DB
    ensure_column(cursor, "academic_profile", "phone", "TEXT DEFAULT '+1 (555) 234-5678'")
    ensure_column(cursor, "academic_profile", "website", "TEXT DEFAULT 'https://github.com/matsci-researcher'")
    ensure_column(cursor, "academic_profile", "location", "TEXT DEFAULT 'Materials Research Institute'")
    ensure_column(cursor, "academic_profile", "experiences_json", "TEXT DEFAULT '[]'")
    ensure_column(cursor, "academic_profile", "conferences_json", "TEXT DEFAULT '[]'")
    ensure_column(cursor, "academic_profile", "skills_json", "TEXT DEFAULT '{}'")
    ensure_column(cursor, "academic_profile", "awards_json", "TEXT DEFAULT '[]'")
    ensure_column(cursor, "academic_profile", "owner_email", "TEXT DEFAULT ''")
    ensure_column(cursor, "academic_profile", "google_client_id", "TEXT DEFAULT ''")

    conn.commit()
    seed_initial_data(conn)
    conn.close()


def seed_initial_data(conn):
    cursor = conn.cursor()

    default_edu = [
        {
            "degree": "Ph.D. Candidate in Materials Science & Engineering",
            "institution": "Advanced Materials Research Institute",
            "period": "2024 – Present",
            "details": "Thesis: Defect Engineering and Interfacial Stabilization in Solid-State Oxide & Halide Electrolytes (GPA: 3.95/4.0)"
        },
        {
            "degree": "M.S. in Materials Science & Nanoengineering",
            "institution": "University of Science & Technology",
            "period": "2022 – 2024",
            "details": "Thesis: Hydrothermal Synthesis of 2D Transition Metal Dichalcogenides for Hybrid Supercapacitors"
        },
        {
            "degree": "B.Eng. in Materials Science & Metallurgy (Honors)",
            "institution": "National Polytechnic University",
            "period": "2018 – 2022",
            "details": "Graduated First-Class Honors; Senior Capstone on Perovskite Oxide Thin Films"
        }
    ]

    default_experiences = [
        {
            "role": "Graduate Research Assistant (Ph.D. Researcher)",
            "organization": "Nanomaterials & Energy Storage Laboratory (PI: Prof. Sarah Jenkins)",
            "period": "2024 – Present",
            "description": "Leading solid-state garnet electrolyte synthesis (LLZTO), thermal ALD surface modification, synchrotron XRD Rietveld refinement, and in-situ XPS interfacial analysis."
        },
        {
            "role": "Graduate Teaching Assistant — Crystallography & Diffraction (MATSCI 302)",
            "organization": "Department of Materials Science & Engineering",
            "period": "Fall 2025 – Spring 2026",
            "description": "Instructed weekly powder XRD laboratory sessions, Bragg/Scherrer phase indexing, and GSAS-II refinement tutorials for 45 undergraduate students."
        }
    ]

    default_pubs = [
        {
            "title": "Interfacial Engineering of Garnet-Type Li7La3Zr2O12 Solid Electrolytes via Ultrathin ALD Al2O3 Coating",
            "authors": "A. Chen, M. K. Patel, S. Jenkins",
            "journal": "Advanced Energy Materials",
            "year": 2026,
            "doi": "10.1002/aenm.202600412",
            "citations": 14,
            "source": "ORCID / Scholar"
        },
        {
            "title": "Vacancy-Mediated Ion Transport in Ta-Doped Cubic LLZO: Combined XRD Rietveld Refinement and EIS Study",
            "authors": "A. Chen, H. Tanaka, S. Jenkins",
            "journal": "Chemistry of Materials",
            "year": 2025,
            "doi": "10.1021/acs.chemmater.5c01189",
            "citations": 28,
            "source": "ORCID / Scholar"
        },
        {
            "title": "Defect-Controlled Synthesis of 2D Ti3C2Tx MXene Nanosheets for High-Rate Supercapacitors",
            "authors": "L. Nguyen, A. Chen, R. Gupta",
            "journal": "ACS Nano",
            "year": 2024,
            "doi": "10.1021/acsnano.4c00891",
            "citations": 45,
            "source": "Google Scholar"
        }
    ]

    default_conferences = [
        {
            "title": "Suppressing Li Dendrite Propagation at Garnet Solid Electrolyte Interfaces via Atomic Layer Deposition",
            "event": "MRS Fall Meeting & Exhibit (Boston, MA)",
            "type": "Oral Presentation",
            "year": 2025
        },
        {
            "title": "In-Situ Raman and XRD Investigation of Interlayer Expanded MoS2/Ti3C2Tx Heterostructures",
            "event": "Electrochemical Society (ECS) International Meeting",
            "type": "Poster Presentation (Best Poster Finalist)",
            "year": 2024
        }
    ]

    default_skills = {
        "synthesis": "Solid-State Reaction & High-Temp Sintering (up to 1600 °C), Atomic Layer Deposition (ALD), Hydrothermal/Solvothermal, Sol-Gel, Ball Milling, Cold Isostatic Pressing (CIP), Ar-Glovebox Coin/Swagelok Cell Assembly",
        "characterization": "Powder & Thin-Film XRD (Bruker D8, Rietveld Refinement via GSAS-II / FullProf), FE-SEM & EDS Mapping, HR-TEM & SAED, XPS Depth Profiling (CasaXPS), Raman & FTIR Spectroscopy, EIS / Cyclic Voltammetry (BioLogic EC-Lab), BET, TGA/DSC",
        "computational": "Python (NumPy, SciPy, Matplotlib, Pymatgen), Density Functional Theory (VASP), VESTA 3D Crystal Visualization, OriginPro, ImageJ, LaTeX"
    }

    default_awards = [
        {
            "title": "Graduate Research Fellowship in Advanced Energy Materials",
            "issuer": "Materials Research Institute",
            "year": 2025,
            "details": "Full doctoral tuition and stipend award for top 5% PhD candidates."
        },
        {
            "title": "Outstanding Symposium Poster Award",
            "issuer": "Symposium EN04 — Solid-State Batteries",
            "year": 2024,
            "details": "Recognized for excellence in interfacial XPS characterization."
        }
    ]

    cursor.execute("SELECT COUNT(*) as cnt FROM academic_profile")
    if cursor.fetchone()["cnt"] == 0:
        cursor.execute("""
            INSERT INTO academic_profile (
                id, full_name, title_role, affiliation, advisor, research_focus,
                orcid_id, scholar_id, email, phone, website, location,
                total_citations, h_index, i10_index, bio,
                education_json, experiences_json, publications_json,
                conferences_json, skills_json, awards_json,
                owner_email, google_client_id, last_synced_at
            ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "Alex Chen",
            "Ph.D. Candidate in Materials Science & Engineering",
            "Nanomaterials & Energy Storage Laboratory",
            "Prof. Sarah Jenkins",
            "Solid-State Electrolytes (LLZO), 2D MXenes, In-situ XRD & XPS Characterization",
            "0000-0002-1825-0097",
            "",
            "alex.chen@matsci.edu",
            "+1 (555) 234-5678",
            "https://github.com/alexchen-matsci",
            "Department of Materials Science & Engineering",
            87,
            3,
            3,
            "Ph.D. researcher investigating ionic conductivity, grain boundary impedance, and phase stability of solid-state electrolytes and 2D functional nanomaterials.",
            json.dumps(default_edu),
            json.dumps(default_experiences),
            json.dumps(default_pubs),
            json.dumps(default_conferences),
            json.dumps(default_skills),
            json.dumps(default_awards),
            "",
            "",
            datetime.now().strftime("%Y-%m-%d %H:%M")
        ))
    else:
        # Backfill empty CV arrays on existing DB row if needed
        cursor.execute("SELECT experiences_json, conferences_json, skills_json, awards_json FROM academic_profile WHERE id = 1")
        row = cursor.fetchone()
        if row:
            if not row["experiences_json"] or row["experiences_json"] == "[]":
                cursor.execute("UPDATE academic_profile SET experiences_json = ? WHERE id = 1", (json.dumps(default_experiences),))
            if not row["conferences_json"] or row["conferences_json"] == "[]":
                cursor.execute("UPDATE academic_profile SET conferences_json = ? WHERE id = 1", (json.dumps(default_conferences),))
            if not row["skills_json"] or row["skills_json"] == "{}":
                cursor.execute("UPDATE academic_profile SET skills_json = ? WHERE id = 1", (json.dumps(default_skills),))
            if not row["awards_json"] or row["awards_json"] == "[]":
                cursor.execute("UPDATE academic_profile SET awards_json = ? WHERE id = 1", (json.dumps(default_awards),))

    # Seed sample papers if empty
    cursor.execute("SELECT COUNT(*) as cnt FROM papers")
    if cursor.fetchone()["cnt"] == 0:
        sample_papers = [
            (
                "10.1038/s41563-019-0431-3",
                "Fundamentals of inorganic solid-state electrolytes for batteries",
                "Jun Soo Kim, Yoon Seok Jung, Gerbrand Ceder et al.",
                "Nature Materials",
                2019,
                "18",
                "12",
                "1278-1291",
                "Solid-state electrolytes are key components for next-generation all-solid-state batteries with high energy density and safety. Here we review structural motifs, ion migration mechanisms, and interfacial stability windows.",
                "https://doi.org/10.1038/s41563-019-0431-3",
                "",
                1420,
                "Li7La3Zr2O12 (LLZO), Li10GeP2S12",
                "Solid-State Reaction",
                "XRD, EIS, Neutron Diffraction, DFT",
                "Key Reference",
                5,
                "Essential benchmark for activation energy (Ea ~ 0.30 eV) and electrochemical stability window of garnet vs argyrodite phases.",
                "@article{Kim2019Fundamentals,\n  title={Fundamentals of inorganic solid-state electrolytes for batteries},\n  author={Kim, Jun Soo and Jung, Yoon Seok and Ceder, Gerbrand},\n  journal={Nature Materials},\n  year={2019},\n  doi={10.1038/s41563-019-0431-3}\n}",
                1
            ),
            (
                "10.1021/acs.chemmater.0c04125",
                "Ta-Doped Li7La3Zr2O12 Garnet Solid Electrolytes: Role of Excess Li and Sintering Atmosphere",
                "M. Balaish, J. L. M. Rupp et al.",
                "Chemistry of Materials",
                2021,
                "33",
                "6",
                "2104-2118",
                "Systematic investigation of Li6.4La3Zr1.4Ta0.6O12 sintered under flowing O2 vs Ar. Demonstrates that 10 wt% excess Li2CO3 suppresses pyrochlore La2Zr2O7 impurity formation during 1150 C calcination.",
                "https://doi.org/10.1021/acs.chemmater.0c04125",
                "",
                215,
                "Li6.4La3Zr1.4Ta0.6O12 (LLZTO)",
                "Solid-State Sintering",
                "XRD, SEM, Raman, EIS, ICP-OES",
                "Read",
                5,
                "Directly explains why our batch LLZTO-03 showed a weak La2Zr2O7 peak at 2θ = 28.6°. Need 10% excess LiOH·H2O and MgO crucible mother powder.",
                "@article{Balaish2021TaDoped,\n  title={Ta-Doped Li7La3Zr2O12 Garnet Solid Electrolytes},\n  author={Balaish, M. and Rupp, J. L. M.},\n  journal={Chemistry of Materials},\n  year={2021},\n  doi={10.1021/acs.chemmater.0c04125}\n}",
                1
            ),
            (
                "10.1038/ncomms14542",
                "2D Titanium Carbide (MXene) for High-Rate Electrochemical Energy Storage",
                "Yury Gogotsi, Michel W. Barsoum et al.",
                "Nature Communications",
                2017,
                "8",
                "1",
                "14542",
                "Delaminated Ti3C2Tx MXene films exhibit metallic conductivity (>5000 S/cm) and rapid intercalation pseudocapacitance in aqueous and organic electrolytes.",
                "https://doi.org/10.1038/ncomms14542",
                "",
                1890,
                "Ti3C2Tx MXene",
                "Wet Chemical Etching (LiF/HCl)",
                "XRD, TEM, XPS, Cyclic Voltammetry",
                "Reading",
                4,
                "Useful XPS F 1s and Ti 2p peak fitting parameters for surface termination (-O, -OH, -F) quantification.",
                "@article{Gogotsi2017MXene,\n  title={2D Titanium Carbide (MXene) for High-Rate Electrochemical Energy Storage},\n  author={Gogotsi, Yury and Barsoum, Michel W.},\n  journal={Nature Communications},\n  year={2017},\n  doi={10.1038/ncomms14542}\n}",
                0
            )
        ]
        cursor.executemany("""
            INSERT INTO papers (
                doi, title, authors, journal, year, volume, issue, pages,
                abstract, url, pdf_url, citation_count, material_system,
                synthesis_method, characterization_tags, status, rating,
                notes, bibtex, in_weekly_report
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, sample_papers)

    conn.commit()
