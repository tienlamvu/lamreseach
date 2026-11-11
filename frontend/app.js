// ============================================================================
// MatSci Nexus — Frontend Application Controller (v2.0)
// Supports Full-Stack FastAPI Backend + Standalone GitHub Pages Fallback
// ============================================================================

let STATIC_MODE = false;

let STATE = {
  papers: [],
  notes: [],
  schedule: [],
  profile: {},
  expReportRows: [],
  litReportRows: [],
  precursors: [
    { formula: "Li2CO3", ratio: 3.2, excessPct: 10 },
    { formula: "La2O3", ratio: 1.5, excessPct: 0 },
    { formula: "ZrO2", ratio: 1.4, excessPct: 0 },
    { formula: "Ta2O5", ratio: 0.3, excessPct: 0 }
  ],
  selectedElement: ELEMENTS_DATA[2],
  auth: {
    isLoggedIn: false,
    email: "",
    name: "",
    picture: "",
    ownerEmail: "",
    googleClientId: ""
  }
};

const TAB_TITLES = {
  "dashboard": [
    "Research Command Center",
    "Materials Science & Engineering PhD Workflow, Synthesis Log & Literature Hub"
  ],
  "literature": [
    "Literature Library & DOI Auto-Import",
    "Fetch papers automatically via Crossref/OpenAlex with strict Duplicate DOI Prevention"
  ],
  "notes-schedule": [
    "Synthesis Notebook & Instrument Schedule",
    "Log sample batches, precursors, sintering profiles, XRD/SEM/XPS findings & facility bookings"
  ],
  "weekly-report": [
    "Weekly Group Meeting Report & PowerPoint (.pptx) Generator",
    "Compile weekly achievements, synthesis results, literature benchmarks & next week plan into a 16:9 slide deck"
  ],
  "toolkit": [
    "Materials Science Toolkit: Periodic Table & Calculators",
    "118-Element Crystallography Reference, Stoichiometry & Precursor Weigher, eV/nm Converter & XRD Bragg/Scherrer"
  ],
  "cv": [
    "Academic Curriculum Vitae (Scientific CV)",
    "Complete Materials Science PhD Academic CV — Education, Experience, Publications, Conferences, Skills & Awards"
  ],
  "profile": [
    "ORCID & Google Scholar Sync + Profile Settings",
    "Synchronize publications, citation metrics (h-index, i10-index) and academic contact details"
  ]
};

// ============================================================================
// Initialization & Auth Bootstrapping
// ============================================================================

document.addEventListener("DOMContentLoaded", async () => {
  initAuthSession();
  renderPeriodicTable();
  inspectElement(3); // Lithium
  renderPrecursorInputs();
  runStoichiometryCalc();
  updateEnergyConverter("ev");
  updateBragg("twotheta");

  await loadAllData();
  await autofillReportFromDatabase(true);
});

function showToast(msg, type = "info") {
  const container = document.getElementById("toast-container");
  const el = document.createElement("div");
  el.className = `toast ${type === "error" ? "toast-error" : type === "warn" ? "toast-warn" : ""}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => {
    el.remove();
  }, 4500);
}

function switchTab(tabId, btnEl) {
  document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));

  const target = document.getElementById(`tab-${tabId}`);
  if (target) target.classList.add("active");
  if (btnEl) btnEl.classList.add("active");

  if (TAB_TITLES[tabId]) {
    document.getElementById("page-heading").textContent = TAB_TITLES[tabId][0];
    document.getElementById("page-subheading").textContent = TAB_TITLES[tabId][1];
  }
}

function switchTabByName(tabId) {
  const btns = document.querySelectorAll(".nav-btn");
  const mapIdx = {
    "dashboard": 0,
    "literature": 1,
    "notes-schedule": 2,
    "weekly-report": 3,
    "toolkit": 4,
    "cv": 5,
    "profile": 6
  };
  switchTab(tabId, btns[mapIdx[tabId]]);
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("open");
}

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ============================================================================
// Google Account Owner Authentication & Access Control
// ============================================================================

function initAuthSession() {
  const saved = localStorage.getItem("matsci_owner_session");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      STATE.auth = { ...STATE.auth, ...parsed };
    } catch (e) {
      console.error(e);
    }
  } else {
    // Default initial owner session so user can test immediately, or sign out to test Visitor View
    STATE.auth = {
      isLoggedIn: true,
      email: "alex.chen@gmail.com",
      name: "Alex Chen (Owner)",
      picture: "",
      ownerEmail: "",
      googleClientId: ""
    };
    localStorage.setItem("matsci_owner_session", JSON.stringify(STATE.auth));
  }
  renderAuthHeader();
}

function renderAuthHeader() {
  const bar = document.getElementById("google-auth-bar");
  const indicator = document.getElementById("sidebar-auth-indicator");
  if (!bar) return;

  if (STATE.auth.isLoggedIn) {
    document.body.classList.remove("visitor-mode");
    if (indicator) {
      indicator.innerHTML = `<span style="color:#4ade80;">● Owner Verified (${escapeHtml(STATE.auth.email)})</span>`;
    }
    bar.innerHTML = `
      <div class="owner-pill" title="Signed in with Google Owner Account: ${escapeHtml(STATE.auth.email)}">
        <span>🔒 Owner: <strong>${escapeHtml(STATE.auth.name || STATE.auth.email)}</strong></span>
      </div>
      <button class="btn btn-outline btn-sm" onclick="openGoogleAuthModal()" title="Google Owner Settings">⚙️</button>
      <button class="btn btn-outline btn-sm" onclick="signOutGoogleOwner()" title="Switch to Read-Only Visitor View">Sign Out</button>
    `;
  } else {
    document.body.classList.add("visitor-mode");
    if (indicator) {
      indicator.innerHTML = `<span style="color:#fbbf24;">● Visitor Mode (Read-Only)</span>`;
    }
    bar.innerHTML = `
      <span class="visitor-pill">👁️ Visitor (Read-Only)</span>
      <button class="btn-google" onclick="openGoogleAuthModal()">
        <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
        Sign in with Google
      </button>
    `;
  }
}

function requireOwnerAuth() {
  if (STATE.auth.isLoggedIn) return true;
  showToast("🔒 Owner login required! Please sign in with your Google Account to modify data.", "warn");
  openGoogleAuthModal();
  return false;
}

function openGoogleAuthModal() {
  const modal = document.getElementById("google-auth-modal");
  document.getElementById("auth-google-email").value = STATE.auth.email || STATE.profile.owner_email || "";
  document.getElementById("auth-google-name").value = STATE.auth.name || STATE.profile.full_name || "";
  document.getElementById("cfg-owner-email").value = STATE.profile.owner_email || STATE.auth.ownerEmail || "";
  document.getElementById("cfg-google-client-id").value = STATE.profile.google_client_id || STATE.auth.googleClientId || "";

  // Render official Google Identity Services button if Client ID is configured
  const clientId = (STATE.profile.google_client_id || STATE.auth.googleClientId || "").trim();
  const wrapper = document.getElementById("g-id-button-wrapper");
  if (clientId && window.google && window.google.accounts && window.google.accounts.id) {
    wrapper.style.display = "flex";
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleCredentialResponse
    });
    window.google.accounts.id.renderButton(
      document.getElementById("g-id-signin-btn"),
      { theme: "outline", size: "large", text: "signin_with", shape: "pill" }
    );
  } else {
    wrapper.style.display = "none";
  }

  modal.classList.add("open");
}

async function handleGoogleCredentialResponse(response) {
  try {
    if (!STATIC_MODE) {
      const res = await fetch("/api/auth/google-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: response.credential })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Google authentication failed");
      completeOwnerLogin(data.email, data.name, data.picture, data.owner_email);
    } else {
      // Decode JWT payload in static GitHub Pages mode
      const payload = JSON.parse(atob(response.credential.split(".")[1]));
      const email = (payload.email || "").toLowerCase();
      const configuredOwner = (STATE.auth.ownerEmail || "").toLowerCase();
      if (configuredOwner && email !== configuredOwner) {
        throw new Error(`Access Denied: ${email} is not the registered Owner (${configuredOwner}).`);
      }
      completeOwnerLogin(email, payload.name || email, payload.picture || "", configuredOwner || email);
    }
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function handleDirectGoogleSignIn() {
  const email = document.getElementById("auth-google-email").value.trim().toLowerCase();
  const name = document.getElementById("auth-google-name").value.trim() || email.split("@")[0];
  if (!email || !email.includes("@")) {
    showToast("Please enter a valid Google email address (e.g. yourname@gmail.com).", "error");
    return;
  }

  try {
    if (!STATIC_MODE) {
      const res = await fetch("/api/auth/google-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Authentication rejected");
      completeOwnerLogin(data.email, data.name, "", data.owner_email);
    } else {
      const configuredOwner = (STATE.auth.ownerEmail || "").toLowerCase();
      if (configuredOwner && email !== configuredOwner) {
        throw new Error(`Access Denied: '${email}' does not match registered Owner (${configuredOwner}).`);
      }
      completeOwnerLogin(email, name, "", configuredOwner || email);
    }
  } catch (err) {
    showToast(err.message, "error");
  }
}

function completeOwnerLogin(email, name, picture, ownerEmail) {
  STATE.auth = {
    ...STATE.auth,
    isLoggedIn: true,
    email,
    name,
    picture,
    ownerEmail: ownerEmail || email
  };
  localStorage.setItem("matsci_owner_session", JSON.stringify(STATE.auth));
  renderAuthHeader();
  closeModal("google-auth-modal");
  showToast(`🔓 Signed in as Owner (${email}). Full management enabled!`);
}

function signOutGoogleOwner() {
  STATE.auth.isLoggedIn = false;
  localStorage.setItem("matsci_owner_session", JSON.stringify(STATE.auth));
  renderAuthHeader();
  showToast("Signed out. Switched to Read-Only Visitor Mode.");
}

async function saveOwnerAuthConfig() {
  const ownerEmail = document.getElementById("cfg-owner-email").value.trim().toLowerCase();
  const googleClientId = document.getElementById("cfg-google-client-id").value.trim();

  STATE.auth.ownerEmail = ownerEmail;
  STATE.auth.googleClientId = googleClientId;
  localStorage.setItem("matsci_owner_session", JSON.stringify(STATE.auth));

  if (!STATIC_MODE) {
    await fetch("/api/auth/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ owner_email: ownerEmail, google_client_id: googleClientId })
    });
  }
  showToast("Saved Owner Google Email & OAuth Client ID settings!");
  openGoogleAuthModal();
}

// ============================================================================
// Duplicate DOI Normalization & Warning Alert System
// ============================================================================

function normalizeDoiClient(rawInput) {
  if (!rawInput) return "";
  let s = rawInput.trim();
  s = s.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");
  s = s.replace(/^doi:\s*/i, "");
  const match = s.match(/(10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+)/);
  if (match) {
    return match[1].replace(/\.+$/, "").toLowerCase();
  }
  return s.toLowerCase();
}

function findDuplicatePaperClient(rawDoi, excludeId = null) {
  const norm = normalizeDoiClient(rawDoi);
  if (!norm) return null;
  return STATE.papers.find(p => {
    if (excludeId !== null && Number(p.id) === Number(excludeId)) return false;
    return normalizeDoiClient(p.doi) === norm;
  }) || null;
}

function showDuplicateDoiWarning(existingPaper, attemptedDoi) {
  const banner = document.getElementById("duplicate-doi-banner");
  const textEl = document.getElementById("duplicate-doi-text");
  const viewBtn = document.getElementById("duplicate-view-btn");

  const title = existingPaper?.title || "Existing Paper";
  const doi = existingPaper?.doi || attemptedDoi;
  textEl.innerHTML = `DOI <code>${escapeHtml(doi)}</code> has already been added previously: <strong>"${escapeHtml(title)}"</strong> (${escapeHtml(existingPaper?.journal || "")}, ${existingPaper?.year || ""}). Duplicate addition was blocked.`;
  banner.classList.add("show");

  viewBtn.onclick = () => {
    switchTabByName("literature");
    setTimeout(() => {
      const cardEl = document.getElementById(`paper-card-${existingPaper?.id}`);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
        cardEl.classList.add("duplicate-highlight");
        setTimeout(() => cardEl.classList.remove("duplicate-highlight"), 5000);
      }
    }, 100);
  };

  showToast(`⚠️ Duplicate DOI blocked! "${title.slice(0, 48)}..." is already in your library.`, "error");

  // If already on the literature tab, highlight the existing card immediately
  if (existingPaper?.id) {
    const cardEl = document.getElementById(`paper-card-${existingPaper.id}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
      cardEl.classList.add("duplicate-highlight");
      setTimeout(() => cardEl.classList.remove("duplicate-highlight"), 5000);
    }
  }
}

function hideDuplicateBanner() {
  document.getElementById("duplicate-doi-banner")?.classList.remove("show");
}

// ============================================================================
// Data Loading (Full-Stack API + Static GitHub Pages Fallback)
// ============================================================================

async function loadAllData() {
  try {
    const dashProbe = await fetch("/api/dashboard");
    if (!dashProbe.ok) throw new Error("Static mode fallback");
    const dashRes = await dashProbe.json();
    const [papersRes, notesRes, schedRes, profRes] = await Promise.all([
      fetch("/api/papers").then(r => r.json()),
      fetch("/api/notes").then(r => r.json()),
      fetch("/api/schedule").then(r => r.json()),
      fetch("/api/profile").then(r => r.json())
    ]);

    STATIC_MODE = false;
    STATE.papers = papersRes;
    STATE.notes = notesRes;
    STATE.schedule = schedRes;
    STATE.profile = profRes;

    renderDashboard(dashRes);
    renderPapersList();
    renderNotesList();
    renderScheduleList();
    renderProfile(profRes);
    renderAcademicCvSheet(profRes);
  } catch (err) {
    // Running on GitHub Pages or static file server without FastAPI backend
    STATIC_MODE = true;
    loadStaticFallbackData();
  }
}

function loadStaticFallbackData() {
  const saved = localStorage.getItem("matsci_static_db_v2");
  if (saved) {
    const parsed = JSON.parse(saved);
    STATE.papers = parsed.papers || [];
    STATE.notes = parsed.notes || [];
    STATE.schedule = parsed.schedule || [];
    STATE.profile = parsed.profile || {};
  } else {
    // Seed default Materials Science data for GitHub Pages
    STATE.papers = [
      {
        id: 1,
        doi: "10.1038/s41563-019-0431-3",
        title: "Fundamentals of inorganic solid-state electrolytes for batteries",
        authors: "Jun Soo Kim, Yoon Seok Jung, Gerbrand Ceder et al.",
        journal: "Nature Materials",
        year: 2019,
        volume: "18",
        pages: "1278-1291",
        abstract: "Solid-state electrolytes are key components for next-generation all-solid-state batteries with high energy density and safety.",
        citation_count: 1420,
        material_system: "Li7La3Zr2O12 (LLZO), Li10GeP2S12",
        synthesis_method: "Solid-State Reaction",
        characterization_tags: "XRD, EIS, Neutron Diffraction, DFT",
        status: "Key Reference",
        notes: "Essential benchmark for activation energy (Ea ~ 0.30 eV) of garnet vs argyrodite phases.",
        in_weekly_report: 1
      },
      {
        id: 2,
        doi: "10.1021/acs.chemmater.0c04125",
        title: "Ta-Doped Li7La3Zr2O12 Garnet Solid Electrolytes: Role of Excess Li and Sintering Atmosphere",
        authors: "M. Balaish, J. L. M. Rupp et al.",
        journal: "Chemistry of Materials",
        year: 2021,
        volume: "33",
        pages: "2104-2118",
        abstract: "Systematic investigation of Li6.4La3Zr1.4Ta0.6O12 sintered under flowing O2 vs Ar with 10 wt% excess Li2CO3.",
        citation_count: 215,
        material_system: "Li6.4La3Zr1.4Ta0.6O12 (LLZTO)",
        synthesis_method: "Solid-State Sintering",
        characterization_tags: "XRD, SEM, Raman, EIS",
        status: "Read",
        notes: "Explains why 10% excess Li2CO3 suppresses La2Zr2O7 pyrochlore impurity at 1140 °C.",
        in_weekly_report: 1
      }
    ];
    STATE.notes = [
      {
        id: 1,
        title: "LLZTO-2026-04: Solid-State Sintering with 10 wt% Excess Li2CO3",
        category: "Experiment / Synthesis",
        sample_id: "LLZTO-2026-04",
        material_formula: "Li6.4La3Zr1.4Ta0.6O12",
        precursors: "Li2CO3 (1.425 g, +10% excess), La2O3 (2.681 g), ZrO2 (0.946 g), Ta2O5 (0.728 g)",
        conditions: "Calcined 900 °C 6h → CIP 250 MPa → Sintered 1140 °C 12h in O2",
        characterization_methods: "XRD, SEM, EIS, Archimedes Density",
        key_findings: "Pure cubic garnet Ia-3d phase achieved; relative density 95.8%; σ = 0.84 mS/cm.",
        content: "Zero pyrochlore reflection at 28.6° in Cu Kα XRD scan.",
        pinned: 1,
        in_weekly_report: 1
      }
    ];
    const todayStr = new Date().toISOString().split("T")[0];
    STATE.schedule = [
      {
        id: 1,
        title: "Powder & Pellet XRD Phase Analysis",
        event_type: "Characterization (XRD/SEM/TEM/XPS)",
        instrument_or_location: "Bruker D8 Advance XRD (Cu Kα)",
        start_date: todayStr,
        start_time: "10:00",
        end_time: "12:00",
        status: "Completed",
        sample_id: "LLZTO-2026-04",
        description: "2θ = 10° to 80°, step 0.02° for Rietveld refinement.",
        in_weekly_report: 1
      }
    ];
    STATE.profile = {
      full_name: "Alex Chen",
      title_role: "Ph.D. Candidate in Materials Science & Engineering",
      affiliation: "Nanomaterials & Energy Storage Laboratory",
      advisor: "Prof. Sarah Jenkins",
      research_focus: "Solid-State Electrolytes (LLZO), 2D MXenes, In-situ XRD & XPS Characterization",
      orcid_id: "0000-0002-1825-0097",
      scholar_id: "",
      email: "alex.chen@matsci.edu",
      phone: "+1 (555) 234-5678",
      website: "https://github.com/alexchen-matsci",
      location: "Department of Materials Science & Engineering",
      total_citations: 87,
      h_index: 3,
      i10_index: 3,
      bio: "Ph.D. researcher investigating ionic conductivity, grain boundary impedance, and phase stability of solid-state electrolytes and 2D functional nanomaterials.",
      education: [
        {
          degree: "Ph.D. Candidate in Materials Science & Engineering",
          institution: "Advanced Materials Research Institute",
          period: "2024 – Present",
          details: "Thesis: Defect Engineering and Interfacial Stabilization in Solid-State Oxide & Halide Electrolytes"
        }
      ],
      experiences: [
        {
          role: "Graduate Research Assistant",
          organization: "Nanomaterials & Energy Storage Laboratory",
          period: "2024 – Present",
          description: "Solid-state garnet electrolyte synthesis (LLZTO), ALD surface coating, XRD Rietveld refinement, and XPS depth profiling."
        }
      ],
      publications: [
        {
          title: "Interfacial Engineering of Garnet-Type Li7La3Zr2O12 Solid Electrolytes via Ultrathin ALD Al2O3 Coating",
          authors: "A. Chen, M. K. Patel, S. Jenkins",
          journal: "Advanced Energy Materials",
          year: 2026,
          doi: "10.1002/aenm.202600412",
          citations: 14,
          source: "ORCID / Scholar"
        }
      ],
      conferences: [
        {
          title: "Suppressing Li Dendrite Propagation at Garnet Solid Electrolyte Interfaces via ALD",
          event: "MRS Fall Meeting & Exhibit (Boston, MA)",
          type: "Oral Presentation",
          year: 2025
        }
      ],
      skills: {
        synthesis: "Solid-State Reaction & High-Temp Sintering, Atomic Layer Deposition (ALD), Hydrothermal, Sol-Gel, Ball Milling, Ar-Glovebox Cell Assembly",
        characterization: "Powder & Thin-Film XRD (Rietveld GSAS-II), FE-SEM/EDS, HR-TEM/SAED, XPS (CasaXPS), Raman, FTIR, EIS (EC-Lab), BET",
        computational: "Python (NumPy, SciPy, Pymatgen), DFT (VASP), VESTA, OriginPro, LaTeX"
      },
      awards: [
        {
          title: "Graduate Research Fellowship in Advanced Energy Materials",
          issuer: "Materials Research Institute",
          year: 2025,
          details: "Full doctoral fellowship for top 5% PhD candidates."
        }
      ]
    };
    saveStaticDb();
  }

  const dashData = {
    stats: {
      total_papers: STATE.papers.length,
      papers_read: STATE.papers.filter(p => ["Read", "Key Reference", "Cited in Thesis"].includes(p.status)).length,
      total_notes: STATE.notes.length,
      synthesis_batches: STATE.notes.filter(n => n.sample_id).length,
      upcoming_tasks: STATE.schedule.filter(s => s.status !== "Completed").length,
      completed_tasks: STATE.schedule.filter(s => s.status === "Completed").length,
      total_citations: STATE.profile.total_citations || 0,
      h_index: STATE.profile.h_index || 0
    },
    recent_papers: STATE.papers.slice(0, 4),
    recent_notes: STATE.notes.slice(0, 4),
    upcoming_schedule: STATE.schedule.slice(0, 6),
    profile: STATE.profile
  };

  renderDashboard(dashData);
  renderPapersList();
  renderNotesList();
  renderScheduleList();
  renderProfile(STATE.profile);
  renderAcademicCvSheet(STATE.profile);
}

function saveStaticDb() {
  localStorage.setItem("matsci_static_db_v2", JSON.stringify({
    papers: STATE.papers,
    notes: STATE.notes,
    schedule: STATE.schedule,
    profile: STATE.profile
  }));
}

// ============================================================================
// Dashboard Rendering
// ============================================================================

function renderDashboard(dash) {
  const s = dash.stats || {};
  const kpiEl = document.getElementById("dashboard-kpis");
  kpiEl.innerHTML = `
    <div class="kpi-card">
      <div class="kpi-label">Literature Library</div>
      <div class="kpi-value" style="color:#2563eb;">${s.total_papers || 0}</div>
      <div class="kpi-sub"><strong>${s.papers_read || 0}</strong> Read / Key References</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Synthesis &amp; Lab Notes</div>
      <div class="kpi-value" style="color:#0d9488;">${s.total_notes || 0}</div>
      <div class="kpi-sub"><strong>${s.synthesis_batches || 0}</strong> Sample Batches Tracked</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Lab Schedule &amp; Slots</div>
      <div class="kpi-value" style="color:#d97706;">${s.upcoming_tasks || 0}</div>
      <div class="kpi-sub">Active / <strong>${s.completed_tasks || 0}</strong> Completed This Week</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Citation Impact</div>
      <div class="kpi-value" style="color:#7c3aed;">${s.total_citations || 0}</div>
      <div class="kpi-sub">h-index: <strong>${s.h_index || 0}</strong> (ORCID / Scholar)</div>
    </div>
  `;

  const schedList = document.getElementById("dashboard-schedule-list");
  if (!dash.upcoming_schedule || dash.upcoming_schedule.length === 0) {
    schedList.innerHTML = `<div style="color:var(--text-muted); font-size:13px;">No scheduled sessions yet.</div>`;
  } else {
    schedList.innerHTML = dash.upcoming_schedule.slice(0, 4).map(item => `
      <div class="item-card" style="padding:12px 14px; margin-bottom:10px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
          <div>
            <div class="item-title" style="font-size:14px;">${escapeHtml(item.title)}</div>
            <div class="item-meta" style="margin-bottom:4px;">
              📍 ${escapeHtml(item.instrument_or_location || "Lab")} &nbsp;|&nbsp; 🕒 ${escapeHtml(item.start_date)} (${escapeHtml(item.start_time)}–${escapeHtml(item.end_time)})
            </div>
          </div>
          <span class="badge ${item.status === 'Completed' ? 'badge-green' : item.status === 'In Progress' ? 'badge-amber' : 'badge-blue'}">
            ${escapeHtml(item.status)}
          </span>
        </div>
        ${item.sample_id ? `<span class="badge badge-purple" style="margin-top:4px;">Sample: ${escapeHtml(item.sample_id)}</span>` : ""}
      </div>
    `).join("");
  }

  const notesList = document.getElementById("dashboard-notes-list");
  if (!dash.recent_notes || dash.recent_notes.length === 0) {
    notesList.innerHTML = `<div style="color:var(--text-muted); font-size:13px;">No lab notes recorded yet.</div>`;
  } else {
    notesList.innerHTML = dash.recent_notes.slice(0, 3).map(n => `
      <div class="item-card" style="padding:12px 14px; margin-bottom:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span class="badge badge-blue">${escapeHtml(n.category)}</span>
          ${n.sample_id ? `<span class="badge badge-purple">ID: ${escapeHtml(n.sample_id)}</span>` : ""}
        </div>
        <div class="item-title" style="font-size:14px; margin-top:6px;">${escapeHtml(n.title)}</div>
        <div style="font-size:12.5px; color:var(--text-secondary); margin-top:4px;">
          <strong>Finding:</strong> ${escapeHtml(n.key_findings || n.conditions || "")}
        </div>
      </div>
    `).join("");
  }

  const papersList = document.getElementById("dashboard-papers-list");
  if (!dash.recent_papers || dash.recent_papers.length === 0) {
    papersList.innerHTML = `<div style="color:var(--text-muted); font-size:13px;">No papers in library yet. Paste a DOI above!</div>`;
  } else {
    papersList.innerHTML = `<div class="grid-3">` + dash.recent_papers.slice(0, 3).map(p => `
      <div class="item-card" style="margin-bottom:0; display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <div style="display:flex; justify-content:space-between; gap:6px; margin-bottom:6px;">
            <span class="badge badge-green">${escapeHtml(p.status)}</span>
            <span style="font-size:11.5px; color:var(--text-muted);">Cited: ${p.citation_count || 0}</span>
          </div>
          <div class="item-title" style="font-size:14px;">${escapeHtml(p.title)}</div>
          <div class="item-meta">${escapeHtml(p.authors)} — <em>${escapeHtml(p.journal)}</em> (${p.year || ""})</div>
        </div>
        <div class="item-tags">
          ${p.material_system ? `<span class="badge badge-purple">⚛️ ${escapeHtml(p.material_system)}</span>` : ""}
          ${p.characterization_tags ? `<span class="badge badge-slate">🔬 ${escapeHtml(p.characterization_tags)}</span>` : ""}
        </div>
      </div>
    `).join("") + `</div>`;
  }
}

// ============================================================================
// Literature Manager & Automatic DOI Fetch (with Duplicate DOI Detection)
// ============================================================================

function fillSampleDoi(doiStr) {
  document.getElementById("lit-doi-input").value = doiStr;
  handleLitDoiFetch();
}

async function handleQuickDoiAdd() {
  if (!requireOwnerAuth()) return;
  const input = document.getElementById("topbar-doi-input");
  const val = input.value.trim();
  if (!val) {
    showToast("Please enter a DOI link or identifier first.", "warn");
    return;
  }

  // Client-side pre-check for duplicate DOI
  const clientDup = findDuplicatePaperClient(val);
  if (clientDup) {
    showDuplicateDoiWarning(clientDup, val);
    return;
  }

  const btn = document.getElementById("topbar-doi-btn");
  btn.disabled = true;
  btn.textContent = "Fetching...";
  try {
    await importPaperByDoiCommon(val);
    input.value = "";
    switchTabByName("literature");
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "+ Fetch DOI";
  }
}

async function handleLitDoiFetch() {
  if (!requireOwnerAuth()) return;
  const input = document.getElementById("lit-doi-input");
  const val = input.value.trim();
  if (!val) {
    showToast("Please paste a valid DOI or URL.", "warn");
    return;
  }

  // Client-side pre-check for duplicate DOI
  const clientDup = findDuplicatePaperClient(val);
  if (clientDup) {
    showDuplicateDoiWarning(clientDup, val);
    return;
  }

  const btn = document.getElementById("lit-doi-btn");
  btn.disabled = true;
  btn.textContent = "⏳ Checking Duplicate & Resolving DOI...";
  try {
    await importPaperByDoiCommon(val);
    input.value = "";
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "⚡ Auto-Fetch & Add Paper";
  }
}

async function importPaperByDoiCommon(rawDoiInput) {
  hideDuplicateBanner();
  const dup = findDuplicatePaperClient(rawDoiInput);
  if (dup) {
    showDuplicateDoiWarning(dup, rawDoiInput);
    return;
  }

  if (!STATIC_MODE) {
    const res = await fetch("/api/papers/doi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doi: rawDoiInput, auto_save: true })
    });
    const data = await res.json();
    if (res.status === 409) {
      showDuplicateDoiWarning(data.existing_paper, rawDoiInput);
      return;
    }
    if (!res.ok) throw new Error(data.detail || "Could not resolve DOI");
    showToast(`✅ Added paper: "${data.title.slice(0, 60)}..."`);
    await loadAllData();
  } else {
    // Client-side Crossref lookup for GitHub Pages static mode
    const cleaned = normalizeDoiClient(rawDoiInput);
    const crRes = await fetch(`https://api.crossref.org/works/${encodeURIComponent(cleaned)}`);
    if (!crRes.ok) throw new Error(`DOI '${cleaned}' not found on Crossref.`);
    const msg = (await crRes.json()).message || {};
    const title = (msg.title && msg.title[0]) || "Untitled Paper";
    const authors = (msg.author || []).map(a => `${a.given || ""} ${a.family || ""}`.trim()).slice(0, 5).join(", ") || "Unknown";
    const journal = (msg["container-title"] && msg["container-title"][0]) || msg.publisher || "Journal";
    const year = msg.issued?.["date-parts"]?.[0]?.[0] || 2026;
    const newPaper = {
      id: Date.now(),
      doi: cleaned,
      title,
      authors,
      journal,
      year,
      volume: msg.volume || "",
      pages: msg.page || "",
      abstract: (msg.abstract || "").replace(/<[^>]+>/g, ""),
      citation_count: msg["is-referenced-by-count"] || 0,
      material_system: "Functional Material",
      synthesis_method: "Experimental",
      characterization_tags: "XRD, SEM",
      status: "To Read",
      notes: "",
      in_weekly_report: 1
    };
    STATE.papers.unshift(newPaper);
    saveStaticDb();
    showToast(`✅ Added paper: "${title.slice(0, 60)}..."`);
    loadStaticFallbackData();
  }
}

function renderPapersList() {
  const query = (document.getElementById("paper-search")?.value || "").toLowerCase();
  const statusFilter = document.getElementById("paper-status-filter")?.value || "ALL";

  const filtered = STATE.papers.filter(p => {
    if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
    if (!query) return true;
    const hay = `${p.title} ${p.authors} ${p.journal} ${p.doi} ${p.material_system} ${p.synthesis_method} ${p.characterization_tags} ${p.notes}`.toLowerCase();
    return hay.includes(query);
  });

  const container = document.getElementById("papers-list-container");
  if (filtered.length === 0) {
    container.innerHTML = `<div style="padding:20px; text-align:center; color:var(--text-muted);">No matching papers found. Paste a DOI above to auto-import!</div>`;
    return;
  }

  container.innerHTML = filtered.map(p => `
    <div class="item-card" id="paper-card-${p.id}">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px; flex-wrap:wrap;">
        <div style="flex:1; min-width:260px;">
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:6px;">
            <span class="badge ${p.status === 'Key Reference' ? 'badge-rose' : p.status === 'Read' ? 'badge-green' : 'badge-blue'}">${escapeHtml(p.status)}</span>
            ${p.in_weekly_report ? `<span class="badge badge-amber">📽️ In Weekly Report</span>` : ""}
            <span style="font-size:12px; color:var(--text-muted);">📈 Citations: <strong>${p.citation_count || 0}</strong></span>
            ${p.doi ? `<a href="https://doi.org/${encodeURIComponent(p.doi)}" target="_blank" style="font-size:12px; color:var(--primary); text-decoration:none; font-weight:600;">DOI: ${escapeHtml(p.doi)} ↗</a>` : ""}
          </div>
          <div class="item-title">${escapeHtml(p.title)}</div>
          <div class="item-meta">
            <strong>${escapeHtml(p.authors)}</strong> &nbsp;•&nbsp; <em>${escapeHtml(p.journal)}</em> (${p.year || ""})
            ${p.volume ? `, Vol. ${escapeHtml(p.volume)}` : ""}${p.pages ? `, pp. ${escapeHtml(p.pages)}` : ""}
          </div>
        </div>

        <div style="display:flex; gap:6px; align-items:center;">
          <button class="btn btn-outline btn-sm" onclick="copyPaperBibtex(${p.id})">BibTeX</button>
          <button class="btn btn-outline btn-sm owner-only-btn" onclick="openPaperModal(${p.id})">✏️ Edit</button>
          <button class="btn btn-danger btn-sm owner-only-btn" onclick="deletePaperItem(${p.id})">🗑️</button>
        </div>
      </div>

      ${p.abstract ? `<div style="font-size:12.5px; color:var(--text-secondary); margin:8px 0; line-height:1.45;">${escapeHtml(p.abstract.slice(0, 320))}${p.abstract.length > 320 ? "..." : ""}</div>` : ""}

      ${p.notes ? `<div style="background:#f8fafc; border-left:3px solid var(--primary); padding:8px 12px; font-size:12.5px; margin:8px 0; border-radius:4px;"><strong>PhD Takeaway / Note:</strong> ${escapeHtml(p.notes)}</div>` : ""}

      <div class="item-tags">
        ${p.material_system ? `<span class="badge badge-purple">⚛️ Material: ${escapeHtml(p.material_system)}</span>` : ""}
        ${p.synthesis_method ? `<span class="badge badge-blue">🔥 Synthesis: ${escapeHtml(p.synthesis_method)}</span>` : ""}
        ${(p.characterization_tags || "").split(",").filter(Boolean).map(t => `<span class="badge badge-slate">🔬 ${escapeHtml(t.trim())}</span>`).join("")}
      </div>
    </div>
  `).join("");
}

function openPaperModal(paperId = null) {
  if (!requireOwnerAuth()) return;
  const modal = document.getElementById("paper-modal");
  if (paperId) {
    const p = STATE.papers.find(x => x.id === paperId);
    if (!p) return;
    document.getElementById("paper-modal-title").textContent = "Edit Paper Details & Research Notes";
    document.getElementById("pm-id").value = p.id;
    document.getElementById("pm-title").value = p.title || "";
    document.getElementById("pm-authors").value = p.authors || "";
    document.getElementById("pm-journal").value = p.journal || "";
    document.getElementById("pm-year").value = p.year || 2026;
    document.getElementById("pm-doi").value = p.doi || "";
    document.getElementById("pm-material").value = p.material_system || "";
    document.getElementById("pm-synthesis").value = p.synthesis_method || "";
    document.getElementById("pm-char").value = p.characterization_tags || "";
    document.getElementById("pm-status").value = p.status || "To Read";
    document.getElementById("pm-notes").value = p.notes || "";
    document.getElementById("pm-abstract").value = p.abstract || "";
    document.getElementById("pm-weekly").checked = Boolean(p.in_weekly_report);
  } else {
    document.getElementById("paper-modal-title").textContent = "Add Paper Manually";
    document.getElementById("pm-id").value = "";
    document.getElementById("pm-title").value = "";
    document.getElementById("pm-authors").value = "";
    document.getElementById("pm-journal").value = "";
    document.getElementById("pm-year").value = 2026;
    document.getElementById("pm-doi").value = "";
    document.getElementById("pm-material").value = "";
    document.getElementById("pm-synthesis").value = "";
    document.getElementById("pm-char").value = "XRD, SEM, XPS";
    document.getElementById("pm-status").value = "To Read";
    document.getElementById("pm-notes").value = "";
    document.getElementById("pm-abstract").value = "";
    document.getElementById("pm-weekly").checked = true;
  }
  modal.classList.add("open");
}

async function savePaperFromModal() {
  if (!requireOwnerAuth()) return;
  const id = document.getElementById("pm-id").value;
  const existing = id ? STATE.papers.find(x => x.id === Number(id)) : {};
  const rawDoi = document.getElementById("pm-doi").value.trim();

  // Check duplicate DOI on manual add/edit
  if (rawDoi) {
    const dup = findDuplicatePaperClient(rawDoi, id ? Number(id) : null);
    if (dup) {
      closeModal("paper-modal");
      showDuplicateDoiWarning(dup, rawDoi);
      return;
    }
  }

  const payload = {
    ...existing,
    title: document.getElementById("pm-title").value.trim(),
    authors: document.getElementById("pm-authors").value.trim(),
    journal: document.getElementById("pm-journal").value.trim(),
    year: parseInt(document.getElementById("pm-year").value) || 2026,
    doi: rawDoi ? normalizeDoiClient(rawDoi) : "",
    material_system: document.getElementById("pm-material").value.trim(),
    synthesis_method: document.getElementById("pm-synthesis").value.trim(),
    characterization_tags: document.getElementById("pm-char").value.trim(),
    status: document.getElementById("pm-status").value,
    notes: document.getElementById("pm-notes").value.trim(),
    abstract: document.getElementById("pm-abstract").value.trim(),
    in_weekly_report: document.getElementById("pm-weekly").checked ? 1 : 0
  };
  if (!payload.title) {
    showToast("Paper Title is required.", "warn");
    return;
  }

  if (!STATIC_MODE) {
    const url = id ? `/api/papers/${id}` : "/api/papers";
    const method = id ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.status === 409) {
      closeModal("paper-modal");
      showDuplicateDoiWarning(data.existing_paper, rawDoi);
      return;
    }
    closeModal("paper-modal");
    showToast(id ? "Updated paper metadata." : "Added paper to library.");
    await loadAllData();
  } else {
    if (id) {
      const idx = STATE.papers.findIndex(x => x.id === Number(id));
      if (idx >= 0) STATE.papers[idx] = { ...STATE.papers[idx], ...payload };
    } else {
      STATE.papers.unshift({ ...payload, id: Date.now() });
    }
    saveStaticDb();
    closeModal("paper-modal");
    loadStaticFallbackData();
  }
}

async function deletePaperItem(id) {
  if (!requireOwnerAuth()) return;
  if (!STATIC_MODE) {
    await fetch(`/api/papers/${id}`, { method: "DELETE" });
    await loadAllData();
  } else {
    STATE.papers = STATE.papers.filter(x => x.id !== id);
    saveStaticDb();
    loadStaticFallbackData();
  }
  showToast("Removed paper from library.");
}

function copyPaperBibtex(id) {
  const p = STATE.papers.find(x => x.id === id);
  if (!p) return;
  const bib = p.bibtex || `@article{ref${p.id},\n  title={${p.title}},\n  author={${p.authors}},\n  journal={${p.journal}},\n  year={${p.year}},\n  doi={${p.doi}}\n}`;
  navigator.clipboard.writeText(bib);
  showToast("Copied BibTeX citation to clipboard!");
}

function exportAllBibtex() {
  const allBib = STATE.papers.map(p => p.bibtex || `@article{ref${p.id},\n  title={${p.title}},\n  author={${p.authors}},\n  journal={${p.journal}},\n  year={${p.year}},\n  doi={${p.doi}}\n}`).join("\n\n");
  navigator.clipboard.writeText(allBib);
  showToast(`Copied ${STATE.papers.length} BibTeX entries to clipboard!`);
}

// ============================================================================
// Lab Notes & Synthesis Log
// ============================================================================

function renderNotesList() {
  const q = (document.getElementById("note-search")?.value || "").toLowerCase();
  const cat = document.getElementById("note-cat-filter")?.value || "ALL";

  const filtered = STATE.notes.filter(n => {
    if (cat !== "ALL" && n.category !== cat) return false;
    if (!q) return true;
    const hay = `${n.title} ${n.sample_id} ${n.material_formula} ${n.precursors} ${n.conditions} ${n.characterization_methods} ${n.key_findings} ${n.content}`.toLowerCase();
    return hay.includes(q);
  });

  const container = document.getElementById("notes-list-container");
  if (filtered.length === 0) {
    container.innerHTML = `<div style="padding:16px; text-align:center; color:var(--text-muted);">No matching lab notes found.</div>`;
    return;
  }

  container.innerHTML = filtered.map(n => `
    <div class="item-card">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
        <div>
          <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap; margin-bottom:6px;">
            ${n.pinned ? `<span class="badge badge-rose">📌 Pinned</span>` : ""}
            <span class="badge badge-blue">${escapeHtml(n.category)}</span>
            ${n.sample_id ? `<span class="badge badge-purple">Sample ID: ${escapeHtml(n.sample_id)}</span>` : ""}
            ${n.in_weekly_report ? `<span class="badge badge-amber">📽️ In Report</span>` : ""}
          </div>
          <div class="item-title">${escapeHtml(n.title)}</div>
        </div>
        <div style="display:flex; gap:6px;">
          <button class="btn btn-outline btn-sm owner-only-btn" onclick="openNoteModal(${n.id})">✏️</button>
          <button class="btn btn-danger btn-sm owner-only-btn" onclick="deleteNoteItem(${n.id})">🗑️</button>
        </div>
      </div>

      ${n.material_formula ? `<div style="font-size:12.5px; margin-top:4px;"><strong>Formula:</strong> <code>${escapeHtml(n.material_formula)}</code> &nbsp;|&nbsp; <strong>Methods:</strong> ${escapeHtml(n.characterization_methods || "N/A")}</div>` : ""}
      ${n.precursors ? `<div style="font-size:12px; color:var(--text-secondary); margin-top:4px;"><strong>Precursors:</strong> ${escapeHtml(n.precursors)}</div>` : ""}
      ${n.conditions ? `<div style="font-size:12px; color:var(--text-secondary); margin-top:3px;"><strong>Conditions:</strong> ${escapeHtml(n.conditions)}</div>` : ""}
      ${n.key_findings ? `<div style="background:#f0fdf4; border-left:3px solid #16a34a; padding:7px 10px; font-size:12.5px; color:#14532d; margin-top:8px; border-radius:4px;"><strong>Key Finding:</strong> ${escapeHtml(n.key_findings)}</div>` : ""}
      ${n.content ? `<div style="font-size:12.5px; color:var(--text-main); margin-top:8px; white-space:pre-line; background:#f8fafc; padding:8px 10px; border-radius:6px;">${escapeHtml(n.content)}</div>` : ""}
    </div>
  `).join("");
}

function openNoteModal(noteId = null) {
  if (!requireOwnerAuth()) return;
  const modal = document.getElementById("note-modal");
  if (noteId) {
    const n = STATE.notes.find(x => x.id === noteId);
    if (!n) return;
    document.getElementById("note-modal-title").textContent = "Edit Research / Synthesis Note";
    document.getElementById("nm-id").value = n.id;
    document.getElementById("nm-title").value = n.title || "";
    document.getElementById("nm-category").value = n.category || "Experiment / Synthesis";
    document.getElementById("nm-sample").value = n.sample_id || "";
    document.getElementById("nm-formula").value = n.material_formula || "";
    document.getElementById("nm-char").value = n.characterization_methods || "";
    document.getElementById("nm-precursors").value = n.precursors || "";
    document.getElementById("nm-conditions").value = n.conditions || "";
    document.getElementById("nm-findings").value = n.key_findings || "";
    document.getElementById("nm-content").value = n.content || "";
    document.getElementById("nm-pinned").checked = Boolean(n.pinned);
    document.getElementById("nm-weekly").checked = Boolean(n.in_weekly_report);
  } else {
    document.getElementById("note-modal-title").textContent = "New Research & Synthesis Note";
    document.getElementById("nm-id").value = "";
    document.getElementById("nm-title").value = "";
    document.getElementById("nm-category").value = "Experiment / Synthesis";
    document.getElementById("nm-sample").value = "";
    document.getElementById("nm-formula").value = "";
    document.getElementById("nm-char").value = "XRD, SEM, EIS";
    document.getElementById("nm-precursors").value = "";
    document.getElementById("nm-conditions").value = "";
    document.getElementById("nm-findings").value = "";
    document.getElementById("nm-content").value = "";
    document.getElementById("nm-pinned").checked = false;
    document.getElementById("nm-weekly").checked = true;
  }
  modal.classList.add("open");
}

async function saveNoteFromModal() {
  if (!requireOwnerAuth()) return;
  const id = document.getElementById("nm-id").value;
  const payload = {
    title: document.getElementById("nm-title").value.trim(),
    category: document.getElementById("nm-category").value,
    sample_id: document.getElementById("nm-sample").value.trim(),
    material_formula: document.getElementById("nm-formula").value.trim(),
    characterization_methods: document.getElementById("nm-char").value.trim(),
    precursors: document.getElementById("nm-precursors").value.trim(),
    conditions: document.getElementById("nm-conditions").value.trim(),
    key_findings: document.getElementById("nm-findings").value.trim(),
    content: document.getElementById("nm-content").value.trim(),
    tags: "",
    pinned: document.getElementById("nm-pinned").checked ? 1 : 0,
    in_weekly_report: document.getElementById("nm-weekly").checked ? 1 : 0
  };
  if (!payload.title) {
    showToast("Please provide a title for the lab note.", "warn");
    return;
  }

  if (!STATIC_MODE) {
    const url = id ? `/api/notes/${id}` : "/api/notes";
    const method = id ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    closeModal("note-modal");
    await loadAllData();
  } else {
    if (id) {
      const idx = STATE.notes.findIndex(x => x.id === Number(id));
      if (idx >= 0) STATE.notes[idx] = { ...STATE.notes[idx], ...payload };
    } else {
      STATE.notes.unshift({ ...payload, id: Date.now() });
    }
    saveStaticDb();
    closeModal("note-modal");
    loadStaticFallbackData();
  }
  showToast(id ? "Updated lab note." : "Saved new lab note.");
}

async function deleteNoteItem(id) {
  if (!requireOwnerAuth()) return;
  if (!STATIC_MODE) {
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    await loadAllData();
  } else {
    STATE.notes = STATE.notes.filter(x => x.id !== id);
    saveStaticDb();
    loadStaticFallbackData();
  }
  showToast("Deleted lab note.");
}

// ============================================================================
// Work Schedule & Instrument Booking
// ============================================================================

function renderScheduleList() {
  const statusFilter = document.getElementById("schedule-status-filter")?.value || "ALL";
  const filtered = STATE.schedule.filter(s => statusFilter === "ALL" || s.status === statusFilter);

  const container = document.getElementById("schedule-list-container");
  if (filtered.length === 0) {
    container.innerHTML = `<div style="padding:16px; text-align:center; color:var(--text-muted);">No schedule items found.</div>`;
    return;
  }

  container.innerHTML = filtered.map(s => `
    <div class="item-card">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
        <div>
          <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap; margin-bottom:5px;">
            <span class="badge ${s.status === 'Completed' ? 'badge-green' : s.status === 'In Progress' ? 'badge-amber' : 'badge-blue'}">${escapeHtml(s.status)}</span>
            <span class="badge badge-slate">${escapeHtml(s.event_type)}</span>
            ${s.sample_id ? `<span class="badge badge-purple">${escapeHtml(s.sample_id)}</span>` : ""}
          </div>
          <div class="item-title">${escapeHtml(s.title)}</div>
          <div class="item-meta">
            📅 <strong>${escapeHtml(s.start_date)}</strong> (${escapeHtml(s.start_time)} – ${escapeHtml(s.end_time)}) &nbsp;|&nbsp; 📍 ${escapeHtml(s.instrument_or_location || "Lab")}
          </div>
          ${s.description ? `<div style="font-size:12.5px; color:var(--text-secondary); margin-top:4px;">${escapeHtml(s.description)}</div>` : ""}
        </div>

        <div style="display:flex; gap:5px; align-items:center;">
          <button class="btn btn-outline btn-sm owner-only-btn" title="Cycle Status" onclick="cycleScheduleStatus(${s.id})">✓ Status</button>
          <button class="btn btn-outline btn-sm owner-only-btn" onclick="openScheduleModal(${s.id})">✏️</button>
          <button class="btn btn-danger btn-sm owner-only-btn" onclick="deleteScheduleItem(${s.id})">🗑️</button>
        </div>
      </div>
    </div>
  `).join("");
}

function openScheduleModal(itemId = null) {
  if (!requireOwnerAuth()) return;
  const modal = document.getElementById("schedule-modal");
  const todayStr = new Date().toISOString().split("T")[0];
  if (itemId) {
    const s = STATE.schedule.find(x => x.id === itemId);
    if (!s) return;
    document.getElementById("schedule-modal-title").textContent = "Edit Schedule / Instrument Slot";
    document.getElementById("sm-id").value = s.id;
    document.getElementById("sm-title").value = s.title || "";
    document.getElementById("sm-type").value = s.event_type || "Synthesis / Furnace";
    document.getElementById("sm-location").value = s.instrument_or_location || "";
    document.getElementById("sm-date").value = s.start_date || todayStr;
    document.getElementById("sm-start").value = s.start_time || "09:00";
    document.getElementById("sm-end").value = s.end_time || "11:30";
    document.getElementById("sm-sample").value = s.sample_id || "";
    document.getElementById("sm-status").value = s.status || "Scheduled";
    document.getElementById("sm-desc").value = s.description || "";
  } else {
    document.getElementById("schedule-modal-title").textContent = "Schedule Experiment / Instrument Slot";
    document.getElementById("sm-id").value = "";
    document.getElementById("sm-title").value = "";
    document.getElementById("sm-type").value = "Characterization (XRD/SEM/TEM/XPS)";
    document.getElementById("sm-location").value = "Bruker D8 Advance XRD";
    document.getElementById("sm-date").value = todayStr;
    document.getElementById("sm-start").value = "10:00";
    document.getElementById("sm-end").value = "12:00";
    document.getElementById("sm-sample").value = "";
    document.getElementById("sm-status").value = "Scheduled";
    document.getElementById("sm-desc").value = "";
  }
  modal.classList.add("open");
}

async function saveScheduleFromModal() {
  if (!requireOwnerAuth()) return;
  const id = document.getElementById("sm-id").value;
  const payload = {
    title: document.getElementById("sm-title").value.trim(),
    event_type: document.getElementById("sm-type").value,
    instrument_or_location: document.getElementById("sm-location").value.trim(),
    start_date: document.getElementById("sm-date").value,
    start_time: document.getElementById("sm-start").value,
    end_time: document.getElementById("sm-end").value,
    priority: "High",
    status: document.getElementById("sm-status").value,
    sample_id: document.getElementById("sm-sample").value.trim(),
    description: document.getElementById("sm-desc").value.trim(),
    in_weekly_report: 1
  };
  if (!payload.title || !payload.start_date) {
    showToast("Title and Date are required.", "warn");
    return;
  }

  if (!STATIC_MODE) {
    const url = id ? `/api/schedule/${id}` : "/api/schedule";
    const method = id ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    closeModal("schedule-modal");
    await loadAllData();
  } else {
    if (id) {
      const idx = STATE.schedule.findIndex(x => x.id === Number(id));
      if (idx >= 0) STATE.schedule[idx] = { ...STATE.schedule[idx], ...payload };
    } else {
      STATE.schedule.push({ ...payload, id: Date.now() });
    }
    saveStaticDb();
    closeModal("schedule-modal");
    loadStaticFallbackData();
  }
  showToast("Schedule updated.");
}

async function cycleScheduleStatus(id) {
  if (!requireOwnerAuth()) return;
  const s = STATE.schedule.find(x => x.id === id);
  if (!s) return;
  const order = ["Scheduled", "In Progress", "Completed"];
  const nextStatus = order[(order.indexOf(s.status) + 1) % order.length];
  if (!STATIC_MODE) {
    await fetch(`/api/schedule/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...s, status: nextStatus })
    });
    await loadAllData();
  } else {
    s.status = nextStatus;
    saveStaticDb();
    loadStaticFallbackData();
  }
  showToast(`Task marked as "${nextStatus}".`);
}

async function deleteScheduleItem(id) {
  if (!requireOwnerAuth()) return;
  if (!STATIC_MODE) {
    await fetch(`/api/schedule/${id}`, { method: "DELETE" });
    await loadAllData();
  } else {
    STATE.schedule = STATE.schedule.filter(x => x.id !== id);
    saveStaticDb();
    loadStaticFallbackData();
  }
  showToast("Removed schedule item.");
}

// ============================================================================
// Academic CV Tab (Lý lịch khoa học) Rendering & Management
// ============================================================================

function renderAcademicCvSheet(prof) {
  const container = document.getElementById("cv-sheet-container");
  if (!container || !prof) return;

  const eduList = prof.education || [];
  const expList = prof.experiences || [];
  const pubList = prof.publications || [];
  const confList = prof.conferences || [];
  const skills = prof.skills || {};
  const awardsList = prof.awards || [];

  container.innerHTML = `
    <!-- CV Header -->
    <div class="cv-header-block">
      <div>
        <div class="cv-name">${escapeHtml(prof.full_name || "Alex Chen")}</div>
        <div class="cv-role">${escapeHtml(prof.title_role || "Ph.D. Candidate in Materials Science & Engineering")}</div>
        <div class="cv-affil">${escapeHtml(prof.affiliation || "")} • Advisor: <strong>${escapeHtml(prof.advisor || "")}</strong></div>
        <div style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap;">
          <span class="badge badge-blue">📊 Citations: ${prof.total_citations || 0}</span>
          <span class="badge badge-purple">📈 h-index: ${prof.h_index || 0}</span>
          <span class="badge badge-green">🏅 i10-index: ${prof.i10_index || 0}</span>
          ${prof.orcid_id ? `<a href="https://orcid.org/${encodeURIComponent(prof.orcid_id)}" target="_blank" class="badge badge-slate" style="text-decoration:none;">🟢 ORCID: ${escapeHtml(prof.orcid_id)} ↗</a>` : ""}
        </div>
      </div>

      <div class="cv-contact-box">
        <div>📧 ${escapeHtml(prof.email || "alex.chen@matsci.edu")}</div>
        <div>📞 ${escapeHtml(prof.phone || "+1 (555) 234-5678")}</div>
        <div>📍 ${escapeHtml(prof.location || "Department of Materials Science")}</div>
        ${prof.website ? `<div>🌐 <a href="${escapeHtml(prof.website)}" target="_blank" style="color:var(--primary); text-decoration:none;">${escapeHtml(prof.website)}</a></div>` : ""}
      </div>
    </div>

    <!-- Research Interests & Executive Summary -->
    <div class="cv-section">
      <div class="cv-section-title">
        <span>1. Research Profile &amp; Specialization</span>
      </div>
      <div style="font-size:13px; color:#1e293b; line-height:1.55;">
        <strong>Research Focus:</strong> <span style="color:var(--primary); font-weight:600;">${escapeHtml(prof.research_focus || "")}</span>
      </div>
      ${prof.bio ? `<div style="font-size:13px; color:#475569; margin-top:6px; line-height:1.55;">${escapeHtml(prof.bio)}</div>` : ""}
    </div>

    <!-- Education -->
    <div class="cv-section">
      <div class="cv-section-title">
        <span>2. Education &amp; Academic Training</span>
        <button class="btn btn-outline btn-sm no-print owner-only-btn" onclick="addCvEducation()">+ Add Degree</button>
      </div>
      ${eduList.map((e, i) => `
        <div class="cv-entry">
          <div class="cv-entry-head">
            <span>🎓 ${escapeHtml(e.degree)}</span>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:12.5px; color:var(--text-muted);">${escapeHtml(e.period)}</span>
              <button class="btn btn-danger btn-sm no-print owner-only-btn" onclick="removeCvItem('education', ${i})">✕</button>
            </div>
          </div>
          <div class="cv-entry-sub">${escapeHtml(e.institution)}</div>
          ${e.details ? `<div class="cv-entry-desc">${escapeHtml(e.details)}</div>` : ""}
        </div>
      `).join("")}
    </div>

    <!-- Research & Teaching Experience -->
    <div class="cv-section">
      <div class="cv-section-title">
        <span>3. Research &amp; Academic Appointments</span>
        <button class="btn btn-outline btn-sm no-print owner-only-btn" onclick="addCvExperience()">+ Add Position</button>
      </div>
      ${expList.map((ex, i) => `
        <div class="cv-entry">
          <div class="cv-entry-head">
            <span>🔬 ${escapeHtml(ex.role)}</span>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:12.5px; color:var(--text-muted);">${escapeHtml(ex.period)}</span>
              <button class="btn btn-danger btn-sm no-print owner-only-btn" onclick="removeCvItem('experiences', ${i})">✕</button>
            </div>
          </div>
          <div class="cv-entry-sub">${escapeHtml(ex.organization)}</div>
          ${ex.description ? `<div class="cv-entry-desc">${escapeHtml(ex.description)}</div>` : ""}
        </div>
      `).join("")}
    </div>

    <!-- Technical Skills in Materials Science -->
    <div class="cv-section">
      <div class="cv-section-title">
        <span>4. Experimental, Characterization &amp; Computational Skills</span>
        <button class="btn btn-outline btn-sm no-print owner-only-btn" onclick="openCvSkillsModal()">✏️ Edit Skills</button>
      </div>
      <div style="display:grid; grid-template-columns:1fr; gap:8px; font-size:13px; line-height:1.5;">
        <div style="background:#f8fafc; padding:10px 14px; border-radius:8px; border-left:3px solid #2563eb;">
          <strong>🔥 Synthesis &amp; Material Processing:</strong> ${escapeHtml(skills.synthesis || "Solid-State Sintering, Hydrothermal, Sol-Gel, ALD, Glovebox Cell Fabrication")}
        </div>
        <div style="background:#f8fafc; padding:10px 14px; border-radius:8px; border-left:3px solid #0d9488;">
          <strong>🔍 Characterization &amp; Analytical Techniques:</strong> ${escapeHtml(skills.characterization || "Powder/Thin-Film XRD (Rietveld GSAS-II), FE-SEM/EDS, HR-TEM/SAED, XPS, Raman, EIS")}
        </div>
        <div style="background:#f8fafc; padding:10px 14px; border-radius:8px; border-left:3px solid #7c3aed;">
          <strong>💻 Modeling, Crystallography &amp; Data Software:</strong> ${escapeHtml(skills.computational || "Python, VASP (DFT), VESTA, OriginPro, CasaXPS, EC-Lab, LaTeX")}
        </div>
      </div>
    </div>

    <!-- Peer-Reviewed Journal Publications -->
    <div class="cv-section">
      <div class="cv-section-title">
        <span>5. Peer-Reviewed Journal Publications (${pubList.length})</span>
        <button class="btn btn-outline btn-sm no-print owner-only-btn" onclick="addOwnPublicationModal()">+ Add Publication</button>
      </div>
      ${pubList.map((p, i) => `
        <div class="cv-entry">
          <div class="cv-entry-head">
            <span>[${i + 1}] ${escapeHtml(p.title)}</span>
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="badge badge-purple">Cited: ${p.citations || 0}</span>
              ${p.doi ? `<button class="btn btn-outline btn-sm no-print owner-only-btn" title="Import this DOI to Literature Library (duplicate-checked)" onclick="importPaperByDoiCommon('${escapeHtml(p.doi)}')">📥 +Library</button>` : ""}
              <button class="btn btn-danger btn-sm no-print owner-only-btn" onclick="removeOwnPub(${i})">✕</button>
            </div>
          </div>
          <div class="cv-entry-desc" style="color:#1e293b;">
            ${escapeHtml(p.authors || prof.full_name)} — <em><strong>${escapeHtml(p.journal)}</strong></em> (${p.year || ""})
            ${p.doi ? ` • <a href="https://doi.org/${encodeURIComponent(p.doi)}" target="_blank" style="color:var(--primary); font-weight:600; text-decoration:none;">DOI: ${escapeHtml(p.doi)} ↗</a>` : ""}
          </div>
        </div>
      `).join("")}
    </div>

    <!-- Conference Presentations -->
    <div class="cv-section">
      <div class="cv-section-title">
        <span>6. Conference Presentations &amp; Invited Talks</span>
        <button class="btn btn-outline btn-sm no-print owner-only-btn" onclick="addCvConference()">+ Add Presentation</button>
      </div>
      ${confList.map((c, i) => `
        <div class="cv-entry">
          <div class="cv-entry-head">
            <span>🎤 ${escapeHtml(c.title)}</span>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="badge badge-blue">${escapeHtml(c.type || "Oral")} (${c.year || 2025})</span>
              <button class="btn btn-danger btn-sm no-print owner-only-btn" onclick="removeCvItem('conferences', ${i})">✕</button>
            </div>
          </div>
          <div class="cv-entry-sub">${escapeHtml(c.event)}</div>
        </div>
      `).join("")}
    </div>

    <!-- Honors & Awards -->
    <div class="cv-section" style="margin-bottom:0;">
      <div class="cv-section-title">
        <span>7. Honors, Fellowships &amp; Academic Awards</span>
        <button class="btn btn-outline btn-sm no-print owner-only-btn" onclick="addCvAward()">+ Add Honor/Award</button>
      </div>
      ${awardsList.map((a, i) => `
        <div class="cv-entry">
          <div class="cv-entry-head">
            <span>🏆 ${escapeHtml(a.title)}</span>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:12.5px; color:var(--text-muted);">${escapeHtml(a.issuer)} (${a.year || 2025})</span>
              <button class="btn btn-danger btn-sm no-print owner-only-btn" onclick="removeCvItem('awards', ${i})">✕</button>
            </div>
          </div>
          ${a.details ? `<div class="cv-entry-desc">${escapeHtml(a.details)}</div>` : ""}
        </div>
      `).join("")}
    </div>
  `;
}

async function addCvEducation() {
  if (!requireOwnerAuth()) return;
  const degree = prompt("Degree Title (e.g., Ph.D. in Materials Science & Engineering):");
  if (!degree) return;
  const institution = prompt("University / Institution:", "Advanced Materials Research Institute") || "";
  const period = prompt("Period (e.g., 2024 – Present):", "2024 – Present") || "";
  const details = prompt("Thesis / Advisor / Honors details:", "") || "";

  STATE.profile.education = STATE.profile.education || [];
  STATE.profile.education.unshift({ degree, institution, period, details });
  await persistProfileState();
}

async function addCvExperience() {
  if (!requireOwnerAuth()) return;
  const role = prompt("Position / Role Title (e.g., Graduate Research Assistant):");
  if (!role) return;
  const organization = prompt("Laboratory / Organization:", STATE.profile.affiliation || "") || "";
  const period = prompt("Period (e.g., 2024 – Present):", "2024 – Present") || "";
  const description = prompt("Key Responsibilities & Achievements:", "") || "";

  STATE.profile.experiences = STATE.profile.experiences || [];
  STATE.profile.experiences.unshift({ role, organization, period, description });
  await persistProfileState();
}

async function addCvConference() {
  if (!requireOwnerAuth()) return;
  const title = prompt("Presentation Title:");
  if (!title) return;
  const event = prompt("Conference Name & Location (e.g., MRS Fall Meeting, Boston):", "MRS Fall Meeting") || "";
  const type = prompt("Presentation Type (Oral Presentation / Poster Presentation / Invited Talk):", "Oral Presentation") || "Oral Presentation";
  const year = parseInt(prompt("Year:", "2026")) || 2026;

  STATE.profile.conferences = STATE.profile.conferences || [];
  STATE.profile.conferences.unshift({ title, event, type, year });
  await persistProfileState();
}

async function addCvAward() {
  if (!requireOwnerAuth()) return;
  const title = prompt("Award / Fellowship Name:");
  if (!title) return;
  const issuer = prompt("Granting Institution / Society:", "Materials Research Society") || "";
  const year = parseInt(prompt("Year:", "2026")) || 2026;
  const details = prompt("Brief Description:", "") || "";

  STATE.profile.awards = STATE.profile.awards || [];
  STATE.profile.awards.unshift({ title, issuer, year, details });
  await persistProfileState();
}

async function removeCvItem(listKey, idx) {
  if (!requireOwnerAuth()) return;
  if (Array.isArray(STATE.profile[listKey])) {
    STATE.profile[listKey].splice(idx, 1);
    await persistProfileState();
  }
}

function openCvSkillsModal() {
  if (!requireOwnerAuth()) return;
  const skills = STATE.profile.skills || {};
  document.getElementById("cv-skill-synth").value = skills.synthesis || "";
  document.getElementById("cv-skill-char").value = skills.characterization || "";
  document.getElementById("cv-skill-comp").value = skills.computational || "";
  document.getElementById("cv-skills-modal").classList.add("open");
}

async function saveCvSkillsModal() {
  if (!requireOwnerAuth()) return;
  STATE.profile.skills = {
    synthesis: document.getElementById("cv-skill-synth").value.trim(),
    characterization: document.getElementById("cv-skill-char").value.trim(),
    computational: document.getElementById("cv-skill-comp").value.trim()
  };
  closeModal("cv-skills-modal");
  await persistProfileState();
  showToast("Updated Materials Science Technical Skills in CV!");
}

// ============================================================================
// Weekly Report Builder & PowerPoint (.pptx) Export
// ============================================================================

async function autofillReportFromDatabase(silent = false) {
  try {
    if (!STATIC_MODE) {
      const res = await fetch("/api/reports/autofill");
      const data = await res.json();
      populateReportForm(data);
    } else {
      const today = new Date().toISOString().split("T")[0];
      const data = {
        title: "Weekly Research Progress Report",
        week_start: today,
        week_end: today,
        presenter_name: STATE.profile.full_name || "Alex Chen",
        advisor_name: STATE.profile.advisor || "Prof. Sarah Jenkins",
        lab_name: STATE.profile.affiliation || "Nanomaterials & Energy Storage Lab",
        university: "Department of Materials Science & Engineering",
        summary_achievements: STATE.notes.map(n => `• [${n.sample_id || "EXP"}] ${n.key_findings || n.title}`).join("\n"),
        experimental_results: STATE.notes.map(n => ({
          sample_id: n.sample_id || "EXP-01",
          material: n.material_formula || "Material",
          conditions: n.conditions || "Standard sintering",
          methods: n.characterization_methods || "XRD, SEM",
          findings: n.key_findings || "Phase pure"
        })),
        literature_review: STATE.papers.map(p => ({
          title: p.title,
          journal: `${p.journal} (${p.year}) | DOI: ${p.doi}`,
          material: p.material_system,
          takeaway: p.notes || p.abstract?.slice(0, 120) || ""
        })),
        blockers_troubleshooting: "• Minimized ambient carbonate formation using argon transfer vessel.",
        next_week_plan: "• Complete FE-SEM cross-section mapping and symmetric coin-cell cycling."
      };
      populateReportForm(data);
    }
    if (!silent) {
      showToast("Compiled this week's synthesis notes, schedule tasks & papers into report!");
    }
  } catch (err) {
    console.error("Autofill failed:", err);
  }
}

function populateReportForm(data) {
  document.getElementById("rep-title").value = data.title || "Weekly Research Progress Report";
  document.getElementById("rep-start").value = data.week_start || "";
  document.getElementById("rep-end").value = data.week_end || "";
  document.getElementById("rep-presenter").value = data.presenter_name || "";
  document.getElementById("rep-advisor").value = data.advisor_name || "";
  document.getElementById("rep-lab").value = data.lab_name || "";
  document.getElementById("rep-uni").value = data.university || "";
  document.getElementById("rep-achievements").value = data.summary_achievements || "";
  document.getElementById("rep-blockers").value = data.blockers_troubleshooting || "";
  document.getElementById("rep-next-plan").value = data.next_week_plan || "";

  STATE.expReportRows = data.experimental_results || [];
  STATE.litReportRows = data.literature_review || [];

  renderExpReportRows();
  renderLitReportRows();
  updateSlidePreview();
}

function renderExpReportRows() {
  const container = document.getElementById("rep-exp-rows-container");
  container.innerHTML = STATE.expReportRows.map((r, idx) => `
    <div style="display:grid; grid-template-columns: 1.1fr 1.2fr 1.5fr 2fr auto; gap:6px; background:#f8fafc; padding:8px; border-radius:8px; border:1px solid var(--border-color);">
      <input type="text" placeholder="Sample ID" value="${escapeHtml(r.sample_id)}" oninput="STATE.expReportRows[${idx}].sample_id=this.value; updateSlidePreview()" />
      <input type="text" placeholder="Formula" value="${escapeHtml(r.material)}" oninput="STATE.expReportRows[${idx}].material=this.value; updateSlidePreview()" />
      <input type="text" placeholder="Conditions" value="${escapeHtml(r.conditions)}" oninput="STATE.expReportRows[${idx}].conditions=this.value; updateSlidePreview()" />
      <input type="text" placeholder="Key Findings" value="${escapeHtml(r.findings)}" oninput="STATE.expReportRows[${idx}].findings=this.value; updateSlidePreview()" />
      <button type="button" class="btn btn-danger btn-sm" onclick="STATE.expReportRows.splice(${idx},1); renderExpReportRows(); updateSlidePreview()">✕</button>
    </div>
  `).join("");
}

function addExpResultRow() {
  STATE.expReportRows.push({
    sample_id: `BATCH-0${STATE.expReportRows.length + 1}`,
    material: "Li6.4La3Zr1.4Ta0.6O12",
    conditions: "1140 °C 12h in O2",
    methods: "XRD, SEM, EIS",
    findings: "Phase pure cubic garnet; σ = 0.85 mS/cm"
  });
  renderExpReportRows();
  updateSlidePreview();
}

function renderLitReportRows() {
  const container = document.getElementById("rep-lit-rows-container");
  container.innerHTML = STATE.litReportRows.map((r, idx) => `
    <div style="display:grid; grid-template-columns: 1.8fr 1.2fr 2fr auto; gap:6px; background:#f8fafc; padding:8px; border-radius:8px; border:1px solid var(--border-color);">
      <input type="text" placeholder="Paper Title" value="${escapeHtml(r.title)}" oninput="STATE.litReportRows[${idx}].title=this.value; updateSlidePreview()" />
      <input type="text" placeholder="Journal (Year)" value="${escapeHtml(r.journal)}" oninput="STATE.litReportRows[${idx}].journal=this.value; updateSlidePreview()" />
      <input type="text" placeholder="Key Takeaway" value="${escapeHtml(r.takeaway)}" oninput="STATE.litReportRows[${idx}].takeaway=this.value; updateSlidePreview()" />
      <button type="button" class="btn btn-danger btn-sm" onclick="STATE.litReportRows.splice(${idx},1); renderLitReportRows(); updateSlidePreview()">✕</button>
    </div>
  `).join("");
}

function addLitReviewRow() {
  STATE.litReportRows.push({
    title: "New Benchmark Study in Materials Science",
    journal: "Advanced Materials (2026)",
    material: "Solid Electrolyte / 2D Material",
    takeaway: "Key insight applicable to our current experimental batch."
  });
  renderLitReportRows();
  updateSlidePreview();
}

function collectReportPayload() {
  return {
    title: document.getElementById("rep-title").value.trim() || "Weekly Research Progress Report",
    week_start: document.getElementById("rep-start").value || "2026-11-09",
    week_end: document.getElementById("rep-end").value || "2026-11-13",
    presenter_name: document.getElementById("rep-presenter").value.trim() || "Alex Chen",
    advisor_name: document.getElementById("rep-advisor").value.trim() || "Prof. Sarah Jenkins",
    lab_name: document.getElementById("rep-lab").value.trim() || "Nanomaterials & Energy Storage Lab",
    university: document.getElementById("rep-uni").value.trim() || "Department of Materials Science & Engineering",
    theme_color: document.getElementById("rep-theme").value || "oxford_navy",
    summary_achievements: document.getElementById("rep-achievements").value,
    experimental_results: STATE.expReportRows,
    literature_review: STATE.litReportRows,
    blockers_troubleshooting: document.getElementById("rep-blockers").value,
    next_week_plan: document.getElementById("rep-next-plan").value,
    metrics: {
      samples_count: STATE.expReportRows.length,
      characterizations_count: Math.max(STATE.expReportRows.length * 2, 4),
      papers_count: STATE.litReportRows.length,
      tasks_completed: STATE.schedule.filter(s => s.status === "Completed").length || 4
    }
  };
}

function updateSlidePreview() {
  const data = collectReportPayload();
  const themeColors = {
    oxford_navy: { head: "#0f172a", bar: "#2563eb" },
    mit_crimson: { head: "#18181b", bar: "#a31f34" },
    emerald_lab: { head: "#064e3b", bar: "#0d9488" },
    royal_indigo: { head: "#1e1b4b", bar: "#4f46e5" }
  };
  const tc = themeColors[data.theme_color] || themeColors.oxford_navy;

  const deck = document.getElementById("slide-preview-deck");
  deck.innerHTML = `
    <!-- Slide 1 -->
    <div class="slide-mock" style="background:${tc.head}; color:#fff; padding:18px 20px; border-left:8px solid ${tc.bar};">
      <div style="font-size:11px; text-transform:uppercase; color:#38bdf8; font-weight:700;">${escapeHtml(data.university)} • ${escapeHtml(data.lab_name)}</div>
      <div style="font-size:19px; font-weight:800; margin-top:6px;">${escapeHtml(data.title)}</div>
      <div style="font-size:12.5px; color:#cbd5e1; margin-top:4px;">Reporting Period: ${escapeHtml(data.week_start)} — ${escapeHtml(data.week_end)}</div>
      <div style="margin-top:12px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.15); font-size:12px; display:flex; justify-content:space-between;">
        <span><strong>Presenter:</strong> ${escapeHtml(data.presenter_name)}</span>
        <span><strong>PI:</strong> ${escapeHtml(data.advisor_name)}</span>
        <span>Slide 1 / 5</span>
      </div>
    </div>

    <!-- Slide 2 -->
    <div class="slide-mock">
      <div class="slide-mock-header" style="background:${tc.head}; border-bottom-color:${tc.bar};">
        <span>1. Executive Summary &amp; Completed Work</span>
        <span>Slide 2 / 5</span>
      </div>
      <div class="slide-mock-body">
        <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-bottom:10px;">
          <div style="background:#fff; padding:6px 10px; border-radius:6px; border:1px solid #e2e8f0;"><strong>${data.metrics.samples_count}</strong> Samples</div>
          <div style="background:#fff; padding:6px 10px; border-radius:6px; border:1px solid #e2e8f0;"><strong>${data.metrics.characterizations_count}</strong> Characterizations</div>
          <div style="background:#fff; padding:6px 10px; border-radius:6px; border:1px solid #e2e8f0;"><strong>${data.metrics.papers_count}</strong> Papers</div>
          <div style="background:#fff; padding:6px 10px; border-radius:6px; border:1px solid #e2e8f0;"><strong>${data.metrics.tasks_completed}</strong> Tasks Done</div>
        </div>
        <div style="white-space:pre-line; background:#fff; padding:10px; border-radius:6px; border:1px solid #e2e8f0;">${escapeHtml(data.summary_achievements)}</div>
      </div>
    </div>

    <!-- Slide 3 -->
    <div class="slide-mock">
      <div class="slide-mock-header" style="background:${tc.head}; border-bottom-color:${tc.bar};">
        <span>2. Experimental Synthesis &amp; Characterization Results</span>
        <span>Slide 3 / 5</span>
      </div>
      <div class="slide-mock-body">
        <table class="data-table" style="font-size:11.5px; background:#fff;">
          <thead>
            <tr>
              <th>Sample / Formula</th>
              <th>Processing Conditions</th>
              <th>Quantitative Findings</th>
            </tr>
          </thead>
          <tbody>
            ${data.experimental_results.map(r => `
              <tr>
                <td><strong>${escapeHtml(r.sample_id)}</strong><br/><span style="color:var(--text-muted);">${escapeHtml(r.material)}</span></td>
                <td>${escapeHtml(r.conditions)}</td>
                <td>${escapeHtml(r.findings)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Slide 4 -->
    <div class="slide-mock">
      <div class="slide-mock-header" style="background:${tc.head}; border-bottom-color:${tc.bar};">
        <span>3. Literature Review &amp; State-of-the-Art Benchmarking</span>
        <span>Slide 4 / 5</span>
      </div>
      <div class="slide-mock-body">
        ${data.literature_review.map((p, i) => `
          <div style="background:#fff; padding:8px 10px; border-radius:6px; border:1px solid #e2e8f0; margin-bottom:6px;">
            <div style="font-weight:700; color:${tc.head};">[${i + 1}] ${escapeHtml(p.title)}</div>
            <div style="font-size:11px; color:${tc.bar}; font-weight:600;">${escapeHtml(p.journal)}</div>
            <div style="font-size:11.5px; margin-top:2px;">${escapeHtml(p.takeaway)}</div>
          </div>
        `).join("")}
      </div>
    </div>

    <!-- Slide 5 -->
    <div class="slide-mock">
      <div class="slide-mock-header" style="background:${tc.head}; border-bottom-color:${tc.bar};">
        <span>4. Challenges, Troubleshooting &amp; Next Week Plan</span>
        <span>Slide 5 / 5</span>
      </div>
      <div class="slide-mock-body" style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <div style="background:#fff; padding:10px; border-radius:6px; border:1px solid #f59e0b;">
          <div style="font-weight:700; color:#b45309; margin-bottom:4px;">⚠️ Blockers &amp; Troubleshooting</div>
          <div style="white-space:pre-line; font-size:11.5px;">${escapeHtml(data.blockers_troubleshooting)}</div>
        </div>
        <div style="background:#fff; padding:10px; border-radius:6px; border:1px solid ${tc.bar};">
          <div style="font-weight:700; color:${tc.bar}; margin-bottom:4px;">🚀 Action Plan for Next Week</div>
          <div style="white-space:pre-line; font-size:11.5px;">${escapeHtml(data.next_week_plan)}</div>
        </div>
      </div>
    </div>
  `;
}

async function downloadWeeklyReportPptx() {
  const btn = document.getElementById("export-pptx-btn");
  btn.disabled = true;
  btn.textContent = "⏳ Generating .pptx...";
  try {
    const payload = collectReportPayload();
    if (!STATIC_MODE) {
      const res = await fetch("/api/reports/export-pptx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to generate PowerPoint presentation");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Weekly_Report_${payload.week_end.replace(/-/g, "_")}.pptx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } else if (window.PptxGenJS) {
      // Client-side PptxGenJS generation when hosted on GitHub Pages
      const pptx = new PptxGenJS();
      pptx.layout = "LAYOUT_16x9";
      const s1 = pptx.addSlide();
      s1.background = { color: "0F172A" };
      s1.addText(payload.university.toUpperCase(), { x: 0.8, y: 1.0, w: 11, h: 0.4, color: "38BDF8", fontSize: 13, bold: true });
      s1.addText(payload.title, { x: 0.8, y: 1.8, w: 11, h: 1.2, color: "FFFFFF", fontSize: 32, bold: true });
      s1.addText(`Period: ${payload.week_start} to ${payload.week_end} | Presenter: ${payload.presenter_name} | PI: ${payload.advisor_name}`, { x: 0.8, y: 3.4, w: 11, h: 0.8, color: "CBD5E1", fontSize: 16 });

      const s2 = pptx.addSlide();
      s2.addText("1. Executive Summary & Completed Work", { x: 0.5, y: 0.4, w: 12, h: 0.6, fontSize: 22, bold: true, color: "0F172A" });
      s2.addText(payload.summary_achievements, { x: 0.5, y: 1.3, w: 12, h: 4.8, fontSize: 14, color: "1E293B" });

      const s3 = pptx.addSlide();
      s3.addText("2. Experimental Synthesis & Characterization Results", { x: 0.5, y: 0.4, w: 12, h: 0.6, fontSize: 22, bold: true, color: "0F172A" });
      const rows = [["Sample ID", "Material", "Conditions", "Key Findings"]];
      payload.experimental_results.forEach(r => rows.push([r.sample_id, r.material, r.conditions, r.findings]));
      s3.addTable(rows, { x: 0.5, y: 1.3, w: 12.3, fontSize: 12, border: { pt: 1, color: "CBD5E1" } });

      const s4 = pptx.addSlide();
      s4.addText("3. Literature Review & Benchmarking", { x: 0.5, y: 0.4, w: 12, h: 0.6, fontSize: 22, bold: true, color: "0F172A" });
      const litText = payload.literature_review.map((p, i) => `[${i + 1}] ${p.title} (${p.journal})\nTakeaway: ${p.takeaway}`).join("\n\n");
      s4.addText(litText || "Literature reviewed this week.", { x: 0.5, y: 1.3, w: 12, h: 4.8, fontSize: 13, color: "1E293B" });

      const s5 = pptx.addSlide();
      s5.addText("4. Challenges, Troubleshooting & Next Week Plan", { x: 0.5, y: 0.4, w: 12, h: 0.6, fontSize: 22, bold: true, color: "0F172A" });
      s5.addText("Blockers & Troubleshooting:\n" + payload.blockers_troubleshooting, { x: 0.5, y: 1.3, w: 5.8, h: 4.8, fontSize: 13, color: "92400E" });
      s5.addText("Next Week Plan:\n" + payload.next_week_plan, { x: 6.7, y: 1.3, w: 5.8, h: 4.8, fontSize: 13, color: "1E40AF" });

      await pptx.writeFile({ fileName: `Weekly_Report_${payload.week_end.replace(/-/g, "_")}.pptx` });
    }
    showToast("Downloaded Group Meeting Weekly Report (.pptx)!");
  } catch (err) {
    showToast(`Export error: ${err.message}`, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "📥 Export PowerPoint (.pptx)";
  }
}

// ============================================================================
// Materials Science Toolkit: Periodic Table & Calculators
// ============================================================================

function renderPeriodicTable() {
  const grid = document.getElementById("periodic-table-grid");
  if (!grid) return;

  const posMap = {};
  ELEMENTS_DATA.forEach(el => {
    posMap[`${el.p}-${el.g}`] = el;
  });

  let html = "";
  for (let row = 1; row <= 9; row++) {
    for (let col = 1; col <= 18; col++) {
      const el = posMap[`${row}-${col}`];
      if (el) {
        html += `
          <div class="pt-cell cat-${el.cat}" onclick="inspectElement(${el.n})" title="${el.name} (${el.s}) — ${el.m} g/mol | Crystal: ${el.crys}">
            <div class="pt-num">${el.n}</div>
            <div class="pt-sym">${el.s}</div>
            <div class="pt-mass">${el.m.toFixed(el.m < 10 ? 2 : 1)}</div>
          </div>
        `;
      } else {
        if (row === 8 && col === 2) {
          html += `<div style="font-size:10px; font-weight:700; color:var(--text-muted); display:flex; align-items:center; justify-content:center;">57–71</div>`;
        } else if (row === 9 && col === 2) {
          html += `<div style="font-size:10px; font-weight:700; color:var(--text-muted); display:flex; align-items:center; justify-content:center;">89–103</div>`;
        } else {
          html += `<div></div>`;
        }
      }
    }
  }
  grid.innerHTML = html;
}

function inspectElement(atomicNumber) {
  const el = ELEMENTS_DATA.find(x => x.n === atomicNumber);
  if (!el) return;
  STATE.selectedElement = el;

  const box = document.getElementById("element-inspector");
  box.innerHTML = `
    <div style="display:flex; align-items:center; gap:16px;">
      <div class="cat-${el.cat}" style="width:64px; height:64px; border-radius:12px; display:flex; flex-direction:column; align-items:center; justify-content:center; border:1px solid rgba(0,0,0,0.1);">
        <div style="font-size:11px; font-weight:700;">${el.n}</div>
        <div style="font-size:24px; font-weight:800; line-height:1;">${el.s}</div>
      </div>
      <div>
        <div style="font-size:18px; font-weight:800; color:var(--text-main);">
          ${el.name} (${el.s})
          <span class="badge cat-${el.cat}" style="margin-left:6px; text-transform:capitalize;">${el.cat.replace("-", " ")}</span>
        </div>
        <div style="font-size:13px; color:var(--text-secondary); margin-top:4px;">
          <strong>Atomic Mass:</strong> ${el.m} g/mol &nbsp;|&nbsp;
          <strong>Electron Config:</strong> <code>${el.conf}</code> &nbsp;|&nbsp;
          <strong>Oxidation States:</strong> ${el.ox}
        </div>
        <div style="font-size:13px; color:var(--text-secondary); margin-top:3px;">
          <strong>Crystal Structure:</strong> ${el.crys} ${el.a ? `(a = ${el.a} Å)` : ""} &nbsp;|&nbsp;
          <strong>Melting Point:</strong> ${el.mp !== null ? `${el.mp} °C` : "N/A"} &nbsp;|&nbsp;
          <strong>Density:</strong> ${el.rho !== null ? `${el.rho} g/cm³` : "N/A"} &nbsp;|&nbsp;
          <strong>Electronegativity:</strong> ${el.en !== null ? el.en : "N/A"}
        </div>
      </div>
    </div>
    <div>
      <button class="btn btn-primary btn-sm" onclick="appendElementToFormula('${el.s}')">
        + Append ${el.s} to Stoichiometry Formula
      </button>
    </div>
  `;
}

function appendElementToFormula(sym) {
  const input = document.getElementById("calc-formula");
  input.value = (input.value || "") + sym;
  runStoichiometryCalc();
}

function setQuickFormula(formula, mass) {
  document.getElementById("calc-formula").value = formula;
  document.getElementById("calc-target-mass").value = mass;
  runStoichiometryCalc();
}

function runStoichiometryCalc() {
  const formulaStr = document.getElementById("calc-formula").value.trim();
  const targetMassG = parseFloat(document.getElementById("calc-target-mass").value) || 1.0;
  const outBox = document.getElementById("stoich-results-box");

  try {
    const counts = parseChemicalFormula(formulaStr);
    const symbols = Object.keys(counts);
    if (symbols.length === 0) {
      outBox.innerHTML = `<div style="color:var(--text-muted); font-size:13px;">Enter a chemical formula above.</div>`;
      return;
    }

    let molarMass = 0;
    let totalAtoms = 0;
    symbols.forEach(sym => {
      molarMass += counts[sym] * ELEMENT_BY_SYMBOL[sym].m;
      totalAtoms += counts[sym];
    });

    const targetMoles = targetMassG / molarMass;
    const targetMmol = targetMoles * 1000;

    let rowsHtml = symbols.map(sym => {
      const el = ELEMENT_BY_SYMBOL[sym];
      const stoich = counts[sym];
      const massContrib = stoich * el.m;
      const wtPct = (massContrib / molarMass) * 100;
      const atPct = (stoich / totalAtoms) * 100;
      const elemGram = (wtPct / 100) * targetMassG;
      return `
        <tr>
          <td><strong>${sym}</strong> (${el.name})</td>
          <td>${Number(stoich.toFixed(4))}</td>
          <td>${atPct.toFixed(2)} at.%</td>
          <td>${wtPct.toFixed(2)} wt.%</td>
          <td><strong>${elemGram.toFixed(4)} g</strong> (${(elemGram * 1000).toFixed(1)} mg)</td>
        </tr>
      `;
    }).join("");

    outBox.innerHTML = `
      <div style="background:#eff6ff; border:1px solid #bfdbfe; padding:10px 14px; border-radius:8px; margin-bottom:10px; display:flex; justify-content:space-between; flex-wrap:wrap; gap:8px; font-size:13px;">
        <span><strong>Molar Mass:</strong> <span style="color:var(--primary); font-weight:800;">${molarMass.toFixed(3)} g/mol</span></span>
        <span><strong>Target Moles:</strong> <strong>${targetMmol.toFixed(3)} mmol</strong> (${targetMassG.toFixed(2)} g)</span>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Element</th>
            <th>Stoich.</th>
            <th>Atomic %</th>
            <th>Weight %</th>
            <th>Mass in ${targetMassG} g Batch</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    `;

    updatePrecursorMasses(targetMoles);
  } catch (err) {
    outBox.innerHTML = `<div style="color:#e11d48; font-size:13px; padding:8px; background:#fff1f2; border-radius:6px;">⚠️ ${escapeHtml(err.message)}</div>`;
  }
}

function renderPrecursorInputs() {
  const container = document.getElementById("precursor-rows-container");
  if (!container) return;
  container.innerHTML = STATE.precursors.map((p, idx) => `
    <div style="display:grid; grid-template-columns: 1.5fr 1fr 1fr auto; gap:8px; margin-bottom:6px; align-items:center;">
      <input type="text" placeholder="Precursor (e.g. Li2CO3)" value="${escapeHtml(p.formula)}" oninput="STATE.precursors[${idx}].formula=this.value; runStoichiometryCalc()" style="padding:7px 10px; border:1px solid var(--border-color); border-radius:6px; font-size:12.5px;" />
      <input type="number" step="0.05" placeholder="Molar Ratio" value="${p.ratio}" oninput="STATE.precursors[${idx}].ratio=parseFloat(this.value)||0; runStoichiometryCalc()" style="padding:7px 10px; border:1px solid var(--border-color); border-radius:6px; font-size:12.5px;" title="Moles of precursor per 1 mole of target formula" />
      <input type="number" step="1" placeholder="Excess %" value="${p.excessPct}" oninput="STATE.precursors[${idx}].excessPct=parseFloat(this.value)||0; runStoichiometryCalc()" style="padding:7px 10px; border:1px solid var(--border-color); border-radius:6px; font-size:12.5px;" title="Excess % (e.g. +10% excess Li2CO3 for volatilization)" />
      <button class="btn btn-danger btn-sm" onclick="STATE.precursors.splice(${idx},1); renderPrecursorInputs(); runStoichiometryCalc()">✕</button>
    </div>
  `).join("");
}

function addPrecursorRow() {
  STATE.precursors.push({ formula: "Al2O3", ratio: 0.25, excessPct: 0 });
  renderPrecursorInputs();
  runStoichiometryCalc();
}

function updatePrecursorMasses(targetMoles) {
  const tableDiv = document.getElementById("precursor-summary-table");
  if (!tableDiv) return;

  let rows = "";
  for (const p of STATE.precursors) {
    try {
      const c = parseChemicalFormula(p.formula);
      let mw = 0;
      for (const [sym, cnt] of Object.entries(c)) {
        mw += cnt * ELEMENT_BY_SYMBOL[sym].m;
      }
      if (mw <= 0) continue;
      const molesNeeded = targetMoles * (p.ratio || 0) * (1 + (p.excessPct || 0) / 100.0);
      const gramsNeeded = molesNeeded * mw;
      rows += `
        <tr>
          <td><strong>${escapeHtml(p.formula)}</strong></td>
          <td>${mw.toFixed(2)} g/mol</td>
          <td>× ${p.ratio} ${p.excessPct ? `<span class="badge badge-amber">+${p.excessPct}% excess</span>` : ""}</td>
          <td><strong>${gramsNeeded.toFixed(4)} g</strong></td>
          <td style="color:var(--primary); font-weight:700;">${(gramsNeeded * 1000).toFixed(1)} mg</td>
        </tr>
      `;
    } catch {
      rows += `<tr><td colspan="5" style="color:#e11d48;">Invalid precursor formula: ${escapeHtml(p.formula)}</td></tr>`;
    }
  }

  tableDiv.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Precursor</th>
          <th>Molar Mass</th>
          <th>Molar Ratio</th>
          <th>Weigh Mass (g)</th>
          <th>Weigh Mass (mg)</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

// ============================================================================
// Photon Energy & XRD Bragg/Scherrer Calculators
// ============================================================================

function updateEnergyConverter(sourceField) {
  const HC = 1239.84193;
  let ev = 0;

  if (sourceField === "ev") {
    ev = parseFloat(document.getElementById("conv-ev").value) || 0;
  } else if (sourceField === "nm") {
    const nm = parseFloat(document.getElementById("conv-nm").value) || 0;
    ev = nm > 0 ? HC / nm : 0;
  } else if (sourceField === "ang") {
    const ang = parseFloat(document.getElementById("conv-ang").value) || 0;
    ev = ang > 0 ? (HC * 10) / ang : 0;
  } else if (sourceField === "cm") {
    const cm = parseFloat(document.getElementById("conv-cm").value) || 0;
    ev = cm / 8065.544;
  } else if (sourceField === "thz") {
    const thz = parseFloat(document.getElementById("conv-thz").value) || 0;
    ev = thz / 241.7989;
  }

  if (ev <= 0) return;
  const nm = HC / ev;
  const ang = nm * 10;
  const cm = ev * 8065.544;
  const thz = ev * 241.7989;
  const kelvin = ev * 11604.52;

  if (sourceField !== "ev") document.getElementById("conv-ev").value = ev.toFixed(4);
  if (sourceField !== "nm") document.getElementById("conv-nm").value = nm.toFixed(2);
  if (sourceField !== "ang") document.getElementById("conv-ang").value = ang.toFixed(1);
  if (sourceField !== "cm") document.getElementById("conv-cm").value = cm.toFixed(1);
  if (sourceField !== "thz") document.getElementById("conv-thz").value = thz.toFixed(2);
  document.getElementById("conv-kelvin").value = Math.round(kelvin);

  let regime = "Infrared / Vibrational (FTIR / Phonon)";
  if (ev >= 100) regime = "X-Ray Core-Level Regime (XPS / Synchrotron XRD)";
  else if (ev >= 3.2) regime = "Ultraviolet (UV) — Wide Bandgap Semiconductors (GaN, TiO2, ZnO)";
  else if (ev >= 1.65) regime = "Visible Spectrum — Optoelectronics / Perovskite Photovoltaics";
  else if (ev >= 0.8) regime = "Near-Infrared (NIR) — Narrow Bandgap (Si, Ge, InGaAs)";

  document.getElementById("spectral-regime-badge").textContent = `Spectral Regime: ${regime}`;
}

function handleXrdSourceChange() {
  const val = document.getElementById("xrd-source").value;
  document.getElementById("xrd-lambda").value = val;
  updateBragg("twotheta");
}

function updateBragg(mode) {
  const lambda = parseFloat(document.getElementById("xrd-lambda").value) || 1.54056;
  let twoTheta = parseFloat(document.getElementById("xrd-twotheta").value) || 30.0;
  let dSpacing = parseFloat(document.getElementById("xrd-d").value) || 2.9;
  const fwhmDeg = parseFloat(document.getElementById("xrd-fwhm").value) || 0.22;
  const kFactor = parseFloat(document.getElementById("xrd-k").value) || 0.90;

  if (mode === "twotheta") {
    const thetaRad = ((twoTheta / 2) * Math.PI) / 180.0;
    if (Math.sin(thetaRad) > 0) {
      dSpacing = lambda / (2 * Math.sin(thetaRad));
      document.getElementById("xrd-d").value = dSpacing.toFixed(4);
    }
  } else if (mode === "d") {
    const ratio = lambda / (2 * dSpacing);
    if (ratio > 0 && ratio <= 1) {
      const thetaRad = Math.asin(ratio);
      twoTheta = (thetaRad * 180.0 * 2) / Math.PI;
      document.getElementById("xrd-twotheta").value = twoTheta.toFixed(3);
    }
  }

  const thetaRad = ((twoTheta / 2) * Math.PI) / 180.0;
  const qVector = (4 * Math.PI * Math.sin(thetaRad)) / lambda;
  const betaRad = (fwhmDeg * Math.PI) / 180.0;
  const crystalliteNm = betaRad > 0 ? (kFactor * lambda) / (betaRad * Math.cos(thetaRad) * 10.0) : 0;

  document.getElementById("xrd-results-banner").innerHTML = `
    <strong>Interplanar Spacing $d$:</strong> ${dSpacing.toFixed(4)} Å (${(dSpacing / 10).toFixed(4)} nm) &nbsp;|&nbsp;
    <strong>Scattering Vector $q$:</strong> ${qVector.toFixed(3)} Å⁻¹ &nbsp;|&nbsp;
    <strong>Scherrer Crystallite Size $D$:</strong> <span style="color:#0d9488; font-weight:800;">${crystalliteNm.toFixed(1)} nm</span>
  `;
}

// ============================================================================
// Academic Profile & ORCID / Google Scholar Sync
// ============================================================================

function renderProfile(prof) {
  if (!prof) return;
  document.getElementById("sidebar-researcher-name").textContent = prof.full_name || "Alex Chen";
  document.getElementById("sidebar-researcher-role").textContent = prof.title_role || "Ph.D. Candidate";

  document.getElementById("prof-name").value = prof.full_name || "";
  document.getElementById("prof-role").value = prof.title_role || "";
  document.getElementById("prof-affiliation").value = prof.affiliation || "";
  document.getElementById("prof-advisor").value = prof.advisor || "";
  document.getElementById("prof-email").value = prof.email || "";
  document.getElementById("prof-phone").value = prof.phone || "";
  document.getElementById("prof-website").value = prof.website || "";
  document.getElementById("prof-location").value = prof.location || "";
  document.getElementById("prof-focus").value = prof.research_focus || "";
  document.getElementById("prof-citations").value = prof.total_citations || 0;
  document.getElementById("prof-hindex").value = prof.h_index || 0;
  document.getElementById("prof-i10index").value = prof.i10_index || 0;
  document.getElementById("prof-bio").value = prof.bio || "";
  document.getElementById("sync-orcid-input").value = prof.orcid_id || "";
  document.getElementById("sync-scholar-input").value = prof.scholar_id || "";

  document.getElementById("prof-last-synced").textContent = prof.last_synced_at
    ? `Last synced: ${prof.last_synced_at}`
    : "Ready to sync with ORCID & Google Scholar";

  const pubs = prof.publications || [];
  const pubContainer = document.getElementById("prof-publications-list");
  if (pubs.length === 0) {
    pubContainer.innerHTML = `<div style="color:var(--text-muted); font-size:13px;">No publications listed yet. Sync with ORCID or Google Scholar above!</div>`;
  } else {
    pubContainer.innerHTML = pubs.map((p, idx) => `
      <div class="item-card" style="padding:12px 14px;">
        <div style="display:flex; justify-content:space-between; gap:8px;">
          <div class="item-title" style="font-size:14px;">${escapeHtml(p.title)}</div>
          <span class="badge badge-purple">Citations: ${p.citations || 0}</span>
        </div>
        <div class="item-meta" style="margin-top:4px;">
          ${escapeHtml(p.authors || prof.full_name)} — <em>${escapeHtml(p.journal)}</em> (${p.year || ""})
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
          <span class="badge badge-slate">${escapeHtml(p.source || "Academic CV")}</span>
          <div style="display:flex; gap:8px; align-items:center;">
            ${p.doi ? `<a href="https://doi.org/${encodeURIComponent(p.doi)}" target="_blank" style="font-size:12px; color:var(--primary); font-weight:600; text-decoration:none;">DOI: ${escapeHtml(p.doi)} ↗</a>` : ""}
            <button class="btn btn-danger btn-sm owner-only-btn" onclick="removeOwnPub(${idx})">✕</button>
          </div>
        </div>
      </div>
    `).join("");
  }
}

async function persistProfileState() {
  const payload = {
    full_name: document.getElementById("prof-name").value.trim() || STATE.profile.full_name || "Alex Chen",
    title_role: document.getElementById("prof-role").value.trim() || STATE.profile.title_role || "",
    affiliation: document.getElementById("prof-affiliation").value.trim() || STATE.profile.affiliation || "",
    advisor: document.getElementById("prof-advisor").value.trim() || STATE.profile.advisor || "",
    research_focus: document.getElementById("prof-focus").value.trim() || STATE.profile.research_focus || "",
    orcid_id: document.getElementById("sync-orcid-input").value.trim() || STATE.profile.orcid_id || "",
    scholar_id: document.getElementById("sync-scholar-input").value.trim() || STATE.profile.scholar_id || "",
    email: document.getElementById("prof-email").value.trim() || STATE.profile.email || "",
    phone: document.getElementById("prof-phone").value.trim() || STATE.profile.phone || "",
    website: document.getElementById("prof-website").value.trim() || STATE.profile.website || "",
    location: document.getElementById("prof-location").value.trim() || STATE.profile.location || "",
    total_citations: parseInt(document.getElementById("prof-citations").value) || 0,
    h_index: parseInt(document.getElementById("prof-hindex").value) || 0,
    i10_index: parseInt(document.getElementById("prof-i10index").value) || 0,
    bio: document.getElementById("prof-bio").value.trim() || STATE.profile.bio || "",
    education: STATE.profile.education || [],
    experiences: STATE.profile.experiences || [],
    publications: STATE.profile.publications || [],
    conferences: STATE.profile.conferences || [],
    skills: STATE.profile.skills || {},
    awards: STATE.profile.awards || []
  };

  if (!STATIC_MODE) {
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const updated = await res.json();
    STATE.profile = updated;
    await loadAllData();
  } else {
    STATE.profile = { ...STATE.profile, ...payload };
    saveStaticDb();
    loadStaticFallbackData();
  }
}

async function saveProfileChanges() {
  if (!requireOwnerAuth()) return;
  await persistProfileState();
  showToast("Saved Academic CV & Profile!");
}

async function handleSyncOrcid() {
  if (!requireOwnerAuth()) return;
  const orcidInput = document.getElementById("sync-orcid-input").value.trim();
  if (!orcidInput) {
    showToast("Please enter an ORCID iD (e.g., 0000-0002-1825-0097).", "warn");
    return;
  }
  const btn = document.getElementById("btn-sync-orcid");
  btn.disabled = true;
  btn.textContent = "⏳ Syncing ORCID...";
  try {
    if (!STATIC_MODE) {
      const res = await fetch("/api/profile/sync-orcid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orcid_id: orcidInput })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "ORCID sync failed");
      STATE.profile = data;
      renderProfile(data);
      renderAcademicCvSheet(data);
      showToast(data.sync_summary || "Synced profile with ORCID!");
      await loadAllData();
    } else {
      const match = orcidInput.toUpperCase().match(/(\d{4}-\d{4}-\d{4}-\d{3}[\dX])/);
      if (!match) throw new Error("Invalid ORCID format.");
      const cleanId = match[1];
      const wRes = await fetch(`https://pub.orcid.org/v3.0/${cleanId}/works`, {
        headers: { "Accept": "application/json" }
      });
      if (!wRes.ok) throw new Error("Could not fetch ORCID works.");
      const wData = await wRes.json();
      const groups = wData.group || [];
      let added = 0;
      const existingTitles = new Set((STATE.profile.publications || []).map(p => p.title.toLowerCase()));
      groups.slice(0, 20).forEach(g => {
        const ws = (g["work-summary"] || [])[0];
        if (!ws) return;
        const t = ws.title?.title?.value || "";
        if (t && !existingTitles.has(t.toLowerCase())) {
          STATE.profile.publications.push({
            title: t,
            authors: STATE.profile.full_name,
            journal: ws["journal-title"]?.value || "Publication",
            year: parseInt(ws["publication-date"]?.year?.value) || 2025,
            doi: "",
            citations: 0,
            source: "ORCID"
          });
          existingTitles.add(t.toLowerCase());
          added++;
        }
      });
      STATE.profile.orcid_id = cleanId;
      saveStaticDb();
      loadStaticFallbackData();
      showToast(`Synced ORCID ${cleanId}: added ${added} new works to CV!`);
    }
  } catch (err) {
    showToast(`ORCID Error: ${err.message}`, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "🔄 Sync ORCID";
  }
}

async function handleSyncScholar() {
  if (!requireOwnerAuth()) return;
  const scholarInput = document.getElementById("sync-scholar-input").value.trim();
  if (!scholarInput) {
    showToast("Please enter a Google Scholar User ID, URL, or Researcher Name.", "warn");
    return;
  }
  const btn = document.getElementById("btn-sync-scholar");
  btn.disabled = true;
  btn.textContent = "⏳ Syncing Citations...";
  try {
    if (!STATIC_MODE) {
      const res = await fetch("/api/profile/sync-scholar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scholar_input: scholarInput })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Scholar sync failed");
      STATE.profile = data;
      renderProfile(data);
      renderAcademicCvSheet(data);
      showToast(data.sync_summary || "Synced citation metrics & publications!");
      await loadAllData();
    } else {
      const oaRes = await fetch(`https://api.openalex.org/authors?search=${encodeURIComponent(scholarInput)}&per-page=1`);
      const oaData = await oaRes.json();
      if (!oaData.results || !oaData.results.length) throw new Error("Author not found.");
      const author = oaData.results[0];
      STATE.profile.total_citations = author.cited_by_count || 0;
      STATE.profile.h_index = author.summary_stats?.h_index || 0;
      STATE.profile.i10_index = author.summary_stats?.i10_index || 0;
      saveStaticDb();
      loadStaticFallbackData();
      showToast(`Synced Citation Metrics: Citations=${STATE.profile.total_citations}, h-index=${STATE.profile.h_index}`);
    }
  } catch (err) {
    showToast(`Scholar Sync Error: ${err.message}`, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "🔄 Sync Scholar Metrics";
  }
}

async function addOwnPublicationModal() {
  if (!requireOwnerAuth()) return;
  const title = prompt("Enter Publication Title:");
  if (!title) return;
  const journal = prompt("Enter Journal / Conference Name:", "Advanced Materials");
  const year = parseInt(prompt("Enter Publication Year:", "2026")) || 2026;
  const doi = prompt("Enter DOI (optional):", "");

  STATE.profile.publications = STATE.profile.publications || [];
  STATE.profile.publications.unshift({
    title,
    authors: STATE.profile.full_name || "Alex Chen",
    journal: journal || "Journal",
    year,
    doi: doi ? normalizeDoiClient(doi) : "",
    citations: 0,
    source: "Academic CV"
  });
  await persistProfileState();
}

async function removeOwnPub(idx) {
  if (!requireOwnerAuth()) return;
  STATE.profile.publications.splice(idx, 1);
  await persistProfileState();
}
