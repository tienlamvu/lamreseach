# MatSci Nexus — PhD Research & Lab Management Suite

A full-stack English-language research management platform tailored for **Ph.D. Candidates in Materials Science & Engineering**.

## Key Features

1. **Research Command Center (Dashboard)**
   - Live KPIs for Literature Library, Synthesis & Lab Notes, Upcoming Instrument Schedule, and Citation Metrics (`h-index`, `i10-index`).
   - Quick Top-Bar DOI Resolver to import papers from anywhere in the workspace.

2. **Literature Library & Automatic DOI Import**
   - Paste any DOI or URL (`10.1038/...`, `https://doi.org/...`) to automatically fetch metadata via **Crossref API** and **OpenAlex / Semantic Scholar**.
   - Auto-extracts **Material System / Chemical Formula** (e.g., `Li7La3Zr2O12`, `Ti3C2Tx MXene`), **Synthesis Method**, and **Characterization Tags** (`XRD`, `SEM`, `TEM`, `XPS`, `EIS`, `DFT`, `Raman`).
   - One-click **BibTeX** export and **Include in Weekly Report** flag.

3. **Lab Notes, Synthesis Log & Instrument Schedule**
   - Record sample batches (`Sample ID`), precursors & stoichiometry, calcination/sintering conditions, characterization techniques, and quantitative findings.
   - Manage facility/instrument bookings (`Bruker D8 XRD`, `FE-SEM`, `XPS`, `Tube Furnace`) and meeting schedules.

4. **Group Meeting Weekly Report Builder & PowerPoint (`.pptx`) Export**
   - **Auto-Fill from Database**: Compiles completed tasks, synthesis/characterization findings, and reviewed papers from the current week.
   - **Live 5-Slide 16:9 Preview**:
     - Slide 1: Cover Slide (University, Lab, Title, Date Range, Presenter, PI)
     - Slide 2: Executive Summary, KPI Cards & Completed Work
     - Slide 3: Experimental Synthesis & Characterization Results Table
     - Slide 4: Literature Review & State-of-the-Art Benchmarking
     - Slide 5: Technical Challenges / Troubleshooting & Next Week Action Plan
   - **Export to `.pptx`**: Generates a formatted widescreen PowerPoint deck via `python-pptx` with 4 selectable academic themes (*Oxford Navy*, *MIT Crimson*, *Materials Emerald*, *Royal Indigo*).

5. **Materials Science Toolkit (Periodic Table & Calculators)**
   - **118-Element Interactive Periodic Table**: Inspect crystal structure (`BCC`, `FCC`, `HCP`, `Diamond`), lattice constant $a$ ($\text{\AA}$), melting point, density, electronegativity, and oxidation states.
   - **Stoichiometry, Molar Mass & Precursor Batch Weigher**: Supports doped/complex formulas (e.g. `Li6.4La3Zr1.4Ta0.6O12`, `La0.7Sr0.3MnO3`) and calculates exact precursor weighing masses in $\text{g}$ and $\text{mg}$ with optional volatile excess %.
   - **Spectroscopy Photon Converter**: Live conversion between $\text{eV}$, $\text{nm}$, $\text{\AA}$, $\text{cm}^{-1}$, $\text{THz}$, and $\text{K}$.
   - **XRD Bragg's Law ($n\lambda = 2d\sin\theta$) & Scherrer Crystallite Size ($D$) Calculator**.

6. **Academic CV & ORCID / Google Scholar Sync**
   - Synchronize biography, education, and publications live from **ORCID Public API v3.0** and **Google Scholar / OpenAlex Citation Graph**.

## Quick Start

Double-click `start_server.bat` or run:

```powershell
.\.venv\Scripts\python.exe -m uvicorn app:app --host 127.0.0.1 --port 8000
```

Then open **http://localhost:8000** in your browser.
