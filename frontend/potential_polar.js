// ============================================================================
// CASTEP Electrostatic Potential Profile V(z) & Polarization Analytics Studio (v176)
// Supports Materials Studio *Potential Profile.xcd, CASTEP *.pot_fmt / *.epot_fmt,
// VASP LOCPOT, Gaussian *.cube, 2-col CSV/DAT, and CASTEP *.castep Berry-Phase
// Polarisation, PBC Dipole Correction, Iterative Hirshfeld, Mulliken & Born Z*.
// ============================================================================

const PP_EPS0_E_PER_V_ANG = 5.526349406e-3; // ε0 in e / (V·Å)
const PP_EPS0_PC_PER_M_V  = 8.8541878128;   // ε0 in pC / (m·V) = 8.8541878e-12 C/(m·V)
const PP_E_ANG_TO_DEBYE   = 4.80320471257;  // 1 e·Å = 4.8032047 Debye
const PP_BOHR_TO_ANG      = 0.529177210903;
const PP_HA_TO_EV         = 27.211386245988;
const PP_CM2_TO_E_PER_A2  = 1.0 / 16.02176634; // 1 C/m² = 0.0624150907 e/Å²
const PP_E_BOHR2_TO_CM2   = 57.21476575;       // 1 e/bohr² = 57.214766 C/m²

const PP_VDW_RADII = {
  H: 1.20, B: 1.92, C: 1.70, N: 1.55, O: 1.52, F: 1.47,
  Si: 2.10, P: 1.80, S: 1.80, Cl: 1.75, Ga: 1.87, Ge: 2.11, As: 1.85, Se: 1.90, Br: 1.85,
  In: 1.93, Sn: 2.17, Sb: 2.06, Te: 2.06, I: 1.98,
  Ti: 2.00, V: 2.00, Cr: 2.00, Mn: 2.00, Fe: 2.00, Co: 2.00, Ni: 1.63, Cu: 1.40, Zn: 1.39,
  Nb: 2.05, Mo: 2.10, W: 2.10, Pt: 1.75, Au: 1.66, Al: 1.84, Bi: 2.07
};

const PP_CPK = {
  H:  { fill: "#f8fafc", stroke: "#64748b", r: 0.55 },
  B:  { fill: "#f472b6", stroke: "#9d174d", r: 0.85 },
  C:  { fill: "#4b5563", stroke: "#111827", r: 0.80 },
  N:  { fill: "#60a5fa", stroke: "#1d4ed8", r: 0.78 },
  O:  { fill: "#ef4444", stroke: "#991b1b", r: 0.76 },
  Al: { fill: "#94a3b8", stroke: "#475569", r: 1.05 },
  Si: { fill: "#3b82f6", stroke: "#1e3a8a", r: 1.02 },
  P:  { fill: "#a855f7", stroke: "#6b21a8", r: 0.98 },
  S:  { fill: "#facc15", stroke: "#a16207", r: 0.96 },
  Se: { fill: "#84cc16", stroke: "#3f6212", r: 1.04 },
  Te: { fill: "#d97706", stroke: "#78350f", r: 1.12 },
  Mo: { fill: "#8b3d8b", stroke: "#4a1d4a", r: 1.24 },
  W:  { fill: "#38bdf8", stroke: "#075985", r: 1.24 },
  Mn: { fill: "#a78bfa", stroke: "#5b21b6", r: 1.15 },
  V:  { fill: "#94a3b8", stroke: "#334155", r: 1.15 },
  Cr: { fill: "#60a5fa", stroke: "#1e40af", r: 1.14 },
  Ti: { fill: "#9ca3af", stroke: "#374151", r: 1.18 },
  Nb: { fill: "#22d3ee", stroke: "#0e7490", r: 1.22 }
};

window.CASTEP_POT_POL_STATE = {
  overridePotential: null,    // manually uploaded Potential file (overrides job's)
  overridePolarCastep: null,  // manually uploaded Polarization .castep text
  overrideSourceName: "",
  lastAnalysis: null,
  zoom: 1.0,
  panX: 0,
  panelGeoms: [],
  bound: false
};

function _ppEsc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function _ppFmtFormulaHtml(f) {
  return _ppEsc(f || "Material").replace(/([A-Za-z\)])(\d+)/g, "$1<sub>$2</sub>");
}

function _ppFmtFormulaSci(f) {
  return String(f || "Material").replace(/([A-Za-z\)])(\d+)/g, "$1_{$2}");
}

// ============================================================================
// 1. Parsers: Potential Profile (.xcd / .pot_fmt / .cube / LOCPOT / .csv)
//             & Polarization (.castep Berry Phase, Dipole, Hirshfeld, Mulliken)
// ============================================================================

function parseCastepPotentialXcdText(xmlText, filename = "Potential Profile.xcd") {
  if (!xmlText || typeof xmlText !== "string") return null;
  const trimmed = xmlText.trim();
  if (!trimmed.includes("<SERIES_2D") && !trimmed.includes("<POINT_2D")) return null;

  const seriesList = [];
  const serRe = /<SERIES_2D\b([^>]*)>([\s\S]*?)<\/SERIES_2D>/gi;
  let sm;
  while ((sm = serRe.exec(trimmed)) !== null) {
    const attrs = sm[1] || "";
    const body = sm[2] || "";
    const nameM = attrs.match(/Name\s*=\s*"([^"]*)"/i);
    const name = nameM ? nameM[1].trim() : "";
    const pts = [];
    const ptRe = /XY\s*=\s*"([+-]?[\d.eE+-]+)\s*,\s*([+-]?[\d.eE+-]+)"/gi;
    let pm;
    while ((pm = ptRe.exec(body)) !== null) {
      const x = parseFloat(pm[1]), y = parseFloat(pm[2]);
      if (Number.isFinite(x) && Number.isFinite(y)) pts.push([x, y]);
    }
    if (pts.length) seriesList.push({ name, pts });
  }
  if (!seriesList.length) return null;

  // Main profile is the longest series (typically 100-500 points)
  let mainSeries = seriesList[0];
  for (const s of seriesList) {
    if (s.pts.length > mainSeries.pts.length) mainSeries = s;
  }
  if (mainSeries.pts.length < 8) return null;

  let fermiEv = null, vacSingleEv = null, vacTopEv = null, vacBotEv = null;
  for (const s of seriesList) {
    if (s === mainSeries) continue;
    const low = s.name.toLowerCase();
    const yAvg = s.pts.reduce((a, p) => a + p[1], 0) / s.pts.length;
    if (low.includes("fermi")) fermiEv = yAvg;
    else if (low.includes("top") && low.includes("vac")) vacTopEv = yAvg;
    else if (low.includes("bot") && low.includes("vac")) vacBotEv = yAvg;
    else if (low.includes("vac")) vacSingleEv = yAvg;
  }

  const titleM = trimmed.match(/<TITLE\b[^>]*Text\s*=\s*"([^"]*)"/i);
  const titleText = titleM ? titleM[1].replace(/\\n/g, " | ").trim() : "";
  const xAxisM = trimmed.match(/<AXIS_X\b[^>]*Title\s*=\s*"([^"]*)"/i);
  const xAxisTitle = xAxisM ? xAxisM[1].trim() : "Fractional coordinate";
  const isFractional = /frac/i.test(xAxisTitle) || (Math.abs(mainSeries.pts[mainSeries.pts.length - 1][0] - mainSeries.pts[0][0] - 1.0) < 0.05);

  const axisM = titleText.match(/along\s+([ABC])\s+axis/i);
  const axis = axisM ? axisM[1].toLowerCase() : "c";

  // Extract reported work functions from XCD title if present
  let titleWfSingle = null, titleWfTop = null, titleWfBot = null;
  const wfPairM = titleText.match(/Top\s+([+-]?[\d.]+)\s*eV\s+Bottom\s+([+-]?[\d.]+)\s*eV/i);
  if (wfPairM) {
    titleWfTop = parseFloat(wfPairM[1]);
    titleWfBot = parseFloat(wfPairM[2]);
  } else {
    const wfOneM = titleText.match(/Work\s+Function\s+([+-]?[\d.]+)\s*eV/i);
    if (wfOneM) titleWfSingle = parseFloat(wfOneM[1]);
  }

  return {
    sourceFile: filename,
    sourceFormat: "CASTEP XCD",
    axis,
    isFractional,
    xRaw: mainSeries.pts.map(p => p[0]),
    vRawEv: mainSeries.pts.map(p => p[1]),
    fermiEv,
    vacSingleEv,
    vacTopEv,
    vacBotEv,
    titleText,
    titleWfSingle,
    titleWfTop,
    titleWfBot
  };
}
window.parseCastepPotentialXcdText = parseCastepPotentialXcdText;

function parseCastepPotFmtText(txt, filename = "Potential.pot_fmt", axisPref = "c") {
  if (!txt || txt.length < 30) return null;
  const lines = txt.replace(/\r\n/g, "\n").split("\n");
  let ngx = 0, ngy = 0, ngz = 0;
  let isHartree = /hartree|ha\b|atomic\s+units/i.test(txt.slice(0, 1200));
  let isEv = /\bev\b/i.test(txt.slice(0, 1200));

  // Try header grid line: "nx ny nz ! fine FFT grid" or similar
  for (let i = 0; i < Math.min(40, lines.length); i++) {
    const l = lines[i].trim();
    const gm = l.match(/^(\d+)\s+(\d+)\s+(\d+)\s*(?:!.*grid|!.*fft|$)/i);
    if (gm) {
      const a = parseInt(gm[1], 10), b = parseInt(gm[2], 10), c = parseInt(gm[3], 10);
      if (a > 2 && b > 2 && c > 2 && a <= 1024 && b <= 1024 && c <= 1024) {
        ngx = a; ngy = b; ngz = c;
      }
    }
  }

  // Parse 4-column rows: ix iy iz V (1-based)
  const sumsZ = new Map(), cntsZ = new Map();
  let maxIx = 0, maxIy = 0, maxIz = 0, count = 0;
  let minV = Infinity, maxV = -Infinity;
  const axIdx = axisPref === "a" ? 0 : (axisPref === "b" ? 1 : 2);

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    if (!l || l.charCodeAt(0) > 57) continue;
    const p = l.split(/\s+/);
    if (p.length >= 4) {
      const ia = parseInt(p[0], 10), ib = parseInt(p[1], 10), ic = parseInt(p[2], 10), v = parseFloat(p[3]);
      if (ia > 0 && ib > 0 && ic > 0 && Number.isFinite(v)) {
        if (ia > maxIx) maxIx = ia;
        if (ib > maxIy) maxIy = ib;
        if (ic > maxIz) maxIz = ic;
        const key = axIdx === 0 ? ia : (axIdx === 1 ? ib : ic);
        sumsZ.set(key, (sumsZ.get(key) || 0) + v);
        cntsZ.set(key, (cntsZ.get(key) || 0) + 1);
        if (v < minV) minV = v;
        if (v > maxV) maxV = v;
        count++;
      }
    }
  }
  if (count < 16) return null;

  const nAxis = axIdx === 0 ? (ngx || maxIx) : (axIdx === 1 ? (ngy || maxIy) : (ngz || maxIz));
  // Heuristic unit detection: CASTEP .pot_fmt writes Hartree (span ~0.5-2.0 Ha) whereas eV spans ~10-40 eV
  const span = maxV - minV;
  const scale = (!isEv && (isHartree || (span > 0.05 && span < 3.0))) ? PP_HA_TO_EV : 1.0;

  const xRaw = [], vRawEv = [];
  const keys = Array.from(sumsZ.keys()).sort((a, b) => a - b);
  for (const k of keys) {
    xRaw.push((k - 1) / Math.max(1, nAxis));
    vRawEv.push((sumsZ.get(k) / Math.max(1, cntsZ.get(k))) * scale);
  }
  if (xRaw.length < 8) return null;
  // Append periodic closing point at 1.0
  if (xRaw[xRaw.length - 1] < 0.999) {
    xRaw.push(1.0);
    vRawEv.push(vRawEv[0]);
  }
  return {
    sourceFile: filename,
    sourceFormat: scale > 1.5 ? "CASTEP .pot_fmt (Ha→eV)" : "CASTEP .pot_fmt",
    axis: axisPref,
    isFractional: true,
    xRaw,
    vRawEv,
    fermiEv: null,
    vacSingleEv: null,
    vacTopEv: null,
    vacBotEv: null,
    titleText: `Planar-averaged potential (${ngx || maxIx}×${ngy || maxIy}×${ngz || maxIz} FFT grid)`
  };
}
window.parseCastepPotFmtText = parseCastepPotFmtText;

function parseGenericPotentialTableText(txt, filename = "Potential.csv") {
  if (!txt || txt.length < 16) return null;
  const lines = txt.replace(/\r\n/g, "\n").split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("#") && !l.startsWith("//"));
  const pts = [];
  for (const l of lines) {
    const parts = l.split(/[\s,;]+/).map(Number);
    if (parts.length >= 2 && Number.isFinite(parts[0]) && Number.isFinite(parts[1])) {
      pts.push([parts[0], parts[1]]);
    }
  }
  if (pts.length < 8) return null;
  const xSpan = Math.abs(pts[pts.length - 1][0] - pts[0][0]);
  const isFractional = xSpan > 0.5 && xSpan <= 1.05;
  return {
    sourceFile: filename,
    sourceFormat: "2-Col Table",
    axis: "c",
    isFractional,
    xRaw: pts.map(p => p[0]),
    vRawEv: pts.map(p => p[1]),
    fermiEv: null,
    vacSingleEv: null,
    vacTopEv: null,
    vacBotEv: null,
    titleText: filename
  };
}

function parseCastepPolarizationData(castepText, paramText = "") {
  const txt = String(castepText || "");
  const ptxt = String(paramText || "");
  const out = {
    hasBerry: false,
    recipRows: [],         // [{ label, dir:[a,b,c], elec, ionic, total, quantum }] in C/m²
    cartBohr: null,        // { ionic:[x,y,z], elec:[x,y,z], total:[x,y,z] } in e/bohr²
    cartCm2: null,         // { ionic:[x,y,z], elec:[x,y,z], total:[x,y,z] } in C/m²
    dipoleCorrMode: "None",
    dipoleCorrDir: "",
    dipoleCorrEnergyEv: null,
    appliedEfield: null,   // [Ex, Ey, Ez] in eV/Å/e = V/Å
    fermiEv: null,
    cellVectors: null,     // 3x3 Å
    latticeParams: null,   // { a, b, c, alpha, beta, gamma }
    cellVolA3: null,
    spaceGroup: "",
    atoms: [],             // [{ el, ion, u, v, w }]
    mullikenCharges: [],   // [{ el, ion, charge }]
    hirshfeldCharges: [],  // [{ el, ion, charge }]
    bornCharges: [],       // [{ el, ion, tensor: [[...],[...],[...]] }]
    opticalEps: null,      // 3x3 optical dielectric if present
    staticEps: null        // 3x3 static dielectric if present
  };

  if (!txt && !ptxt) return out;

  // 1) Dipole correction & E-field metadata
  const dipModeM = txt.match(/periodic dipole correction\s*:\s*([^\r\n]+)/i) || ptxt.match(/dipole_correction\s*[:=]\s*([^\r\n#]+)/i);
  if (dipModeM) out.dipoleCorrMode = dipModeM[1].trim();
  const dipDirM = txt.match(/correcting slab dipole in direction\s*:\s*([XYZxyz])/i) || ptxt.match(/dipole_dir\s*[:=]\s*([XYZxyz])/i);
  if (dipDirM) out.dipoleCorrDir = dipDirM[1].trim().toUpperCase();
  const dipDeMatches = [...txt.matchAll(/Correcting PBC dipole-dipole[^:\n]*:\s*dE\s*=\s*([+-]?[\d.eE+-]+)\s*eV/gi)];
  if (dipDeMatches.length) out.dipoleCorrEnergyEv = parseFloat(dipDeMatches[dipDeMatches.length - 1][1]);

  const efM = txt.match(/External\s+electric\s+field[^\n]*?:\s*([+-]?[\d.eE+-]+)\s+([+-]?[\d.eE+-]+)\s+([+-]?[\d.eE+-]+)/i)
    || ptxt.match(/%block\s+external_efield[\s\S]*?([+-]?[\d.eE+-]+)\s+([+-]?[\d.eE+-]+)\s+([+-]?[\d.eE+-]+)/i);
  if (efM) {
    out.appliedEfield = [parseFloat(efM[1]), parseFloat(efM[2]), parseFloat(efM[3])];
  }

  // Last SCF Fermi energy
  const scfLines = txt.split(/\r?\n/).filter(l => l.includes("<-- SCF"));
  for (let i = scfLines.length - 1; i >= 0; i--) {
    const fm = scfLines[i].match(/^\s*\d+\s+[+-]?[\d.eE+-]+\s+([+-]?[\d.eE+-]+)/);
    if (fm) {
      const fv = parseFloat(fm[1]);
      if (Number.isFinite(fv)) { out.fermiEv = fv; break; }
    }
  }
  const sgM = txt.match(/Full crystallographic space group\s*=\s*([^\r\n]+)/i) || txt.match(/Space group of crystal\s*=\s*([^\r\n]+)/i);
  if (sgM) out.spaceGroup = sgM[1].trim();

  // 2) Last Unit Cell block (Real Lattice, Lattice parameters, Volume, Fractional Atoms)
  const realLatMatches = [...txt.matchAll(/Real Lattice\(A\)[\s\S]*?\r?\n\s*([+-]?[\d.]+)\s+([+-]?[\d.]+)\s+([+-]?[\d.]+)[^\n]*\r?\n\s*([+-]?[\d.]+)\s+([+-]?[\d.]+)\s+([+-]?[\d.]+)[^\n]*\r?\n\s*([+-]?[\d.]+)\s+([+-]?[\d.]+)\s+([+-]?[\d.]+)/gi)];
  if (realLatMatches.length) {
    const m = realLatMatches[realLatMatches.length - 1];
    out.cellVectors = [
      [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])],
      [parseFloat(m[4]), parseFloat(m[5]), parseFloat(m[6])],
      [parseFloat(m[7]), parseFloat(m[8]), parseFloat(m[9])]
    ];
  }
  const abcMatches = [...txt.matchAll(/a\s*=\s*([\d.]+)\s+alpha\s*=\s*([\d.]+)[\s\S]*?b\s*=\s*([\d.]+)\s+beta\s*=\s*([\d.]+)[\s\S]*?c\s*=\s*([\d.]+)\s+gamma\s*=\s*([\d.]+)/gi)];
  if (abcMatches.length) {
    const m = abcMatches[abcMatches.length - 1];
    out.latticeParams = {
      a: parseFloat(m[1]), alpha: parseFloat(m[2]),
      b: parseFloat(m[3]), beta: parseFloat(m[4]),
      c: parseFloat(m[5]), gamma: parseFloat(m[6])
    };
  }
  const volMatches = [...txt.matchAll(/Current cell volume\s*=\s*([\d.]+)/gi)];
  if (volMatches.length) out.cellVolA3 = parseFloat(volMatches[volMatches.length - 1][1]);

  // Fractional coordinates of atoms (last occurrence)
  const atomBlocks = [...txt.matchAll(/Fractional coordinates of atoms[\s\S]*?x-+\s*x\r?\n([\s\S]*?)x{10,}/gi)];
  if (atomBlocks.length) {
    const body = atomBlocks[atomBlocks.length - 1][1];
    for (const line of body.split(/\r?\n/)) {
      const am = line.match(/x\s+([A-Za-z]{1,2})\s+(\d+)\s+([+-]?[\d.]+)\s+([+-]?[\d.]+)\s+([+-]?[\d.]+)\s+x/);
      if (am) {
        out.atoms.push({
          el: am[1], ion: parseInt(am[2], 10),
          u: parseFloat(am[3]), v: parseFloat(am[4]), w: parseFloat(am[5])
        });
      }
    }
  }

  // 3) Berry Phase Polarisation Block (exact CASTEP format!)
  const berryIdx = txt.lastIndexOf("Berry phase polarisation calculation");
  if (berryIdx !== -1) {
    const sec = txt.slice(berryIdx, berryIdx + 3500);
    const gRe = /G_(\d):\s*\(\s*([+-]?[\d.]+)\s*,\s*([+-]?[\d.]+)\s*,\s*([+-]?[\d.]+)\s*\)\s+([+-]?[\d.]+)\s+([+-]?[\d.]+)\s+([+-]?[\d.]+)\s*\(\s*([+-]?[\d.]+)\s*\)/g;
    let gm;
    while ((gm = gRe.exec(sec)) !== null) {
      out.recipRows.push({
        label: `G_${gm[1]}`,
        dir: [parseFloat(gm[2]), parseFloat(gm[3]), parseFloat(gm[4])],
        elec: parseFloat(gm[5]),
        ionic: parseFloat(gm[6]),
        total: parseFloat(gm[7]),
        quantum: parseFloat(gm[8])
      });
    }
    const parseCartSet = (unitRe) => {
      const iM = sec.match(new RegExp(`Ionic\\s+Polarisation\\s*\\(Cartesian Basis\\):\\s*([+-]?[\\d.]+)\\s+([+-]?[\\d.]+)\\s+([+-]?[\\d.]+)\\s*\\(${unitRe}\\)`, "i"));
      const eM = sec.match(new RegExp(`Elec\\s+Polarisation\\s*\\(Cartesian Basis\\):\\s*([+-]?[\\d.]+)\\s+([+-]?[\\d.]+)\\s+([+-]?[\\d.]+)\\s*\\(${unitRe}\\)`, "i"));
      const tM = sec.match(new RegExp(`Total\\s+Polarisation\\s*\\(Cartesian Basis\\):\\s*([+-]?[\\d.]+)\\s+([+-]?[\\d.]+)\\s+([+-]?[\\d.]+)\\s*\\(${unitRe}\\)`, "i"));
      if (!tM) return null;
      return {
        ionic: iM ? [parseFloat(iM[1]), parseFloat(iM[2]), parseFloat(iM[3])] : [0, 0, 0],
        elec:  eM ? [parseFloat(eM[1]), parseFloat(eM[2]), parseFloat(eM[3])] : [0, 0, 0],
        total: [parseFloat(tM[1]), parseFloat(tM[2]), parseFloat(tM[3])]
      };
    };
    out.cartBohr = parseCartSet("e/bohr\\^2");
    out.cartCm2  = parseCartSet("C/m\\^2");
    if (out.cartCm2 || out.cartBohr || out.recipRows.length) out.hasBerry = true;
  }

  // 4) Mulliken Atomic Charges (last table)
  const mulBlocks = [...txt.matchAll(/Atomic Populations \(Mulliken\)[\s\S]*?={10,}\r?\n([\s\S]*?)={10,}/gi)];
  if (mulBlocks.length) {
    const body = mulBlocks[mulBlocks.length - 1][1];
    for (const line of body.split(/\r?\n/)) {
      const m = line.trim().match(/^([A-Za-z]{1,2})\s+(\d+)\s+([+-]?[\d.]+)\s+([+-]?[\d.]+)\s+([+-]?[\d.]+)\s+([+-]?[\d.]+)\s+([+-]?[\d.]+)\s+([+-]?[\d.]+)/);
      if (m) {
        out.mullikenCharges.push({ el: m[1], ion: parseInt(m[2], 10), charge: parseFloat(m[8]) });
      }
    }
  }

  // 5) Iterative / Standard Hirshfeld Charges (last table)
  const hirBlocks = [...txt.matchAll(/Hirshfeld Analysis[\s\S]*?={10,}\r?\n([\s\S]*?)={10,}/gi)];
  if (hirBlocks.length) {
    const body = hirBlocks[hirBlocks.length - 1][1];
    for (const line of body.split(/\r?\n/)) {
      const m = line.trim().match(/^([A-Za-z]{1,2})\s+(\d+)\s+([+-]?[\d.]+)/);
      if (m) {
        out.hirshfeldCharges.push({ el: m[1], ion: parseInt(m[2], 10), charge: parseFloat(m[3]) });
      }
    }
  }

  // 6) Optional Born Effective Charges (from DFPT Phonon/E-field CASTEP runs)
  const bornIdx = txt.lastIndexOf("Born Effective Charges");
  if (bornIdx !== -1) {
    const bSec = txt.slice(bornIdx, bornIdx + 4000);
    const bLines = bSec.split(/\r?\n/);
    for (let i = 0; i < bLines.length - 2; i++) {
      const m1 = bLines[i].trim().match(/^([A-Za-z]{1,2})\s+(\d+)\s+([+-]?[\d.]+)\s+([+-]?[\d.]+)\s+([+-]?[\d.]+)/);
      if (m1) {
        const m2 = bLines[i + 1].trim().match(/^([+-]?[\d.]+)\s+([+-]?[\d.]+)\s+([+-]?[\d.]+)/);
        const m3 = bLines[i + 2].trim().match(/^([+-]?[\d.]+)\s+([+-]?[\d.]+)\s+([+-]?[\d.]+)/);
        if (m2 && m3) {
          out.bornCharges.push({
            el: m1[1], ion: parseInt(m1[2], 10),
            tensor: [
              [parseFloat(m1[3]), parseFloat(m1[4]), parseFloat(m1[5])],
              [parseFloat(m2[1]), parseFloat(m2[2]), parseFloat(m2[3])],
              [parseFloat(m3[1]), parseFloat(m3[2]), parseFloat(m3[3])]
            ]
          });
          i += 2;
        }
      }
    }
  }

  return out;
}
window.parseCastepPolarizationData = parseCastepPolarizationData;

// ============================================================================
// 2. Core Physics Engine: Slab Auto-Centering, Work Functions, Potential Wells,
//    Helmholtz Dipole & Cross-Method Polarization Synthesis
// ============================================================================

function _ppGetActiveJob() {
  const st = window.CASTEP_STUDIO_STATE;
  if (!st || !Array.isArray(st.jobs)) return null;
  return st.jobs.find(j => j.id === st.activeJobId) || null;
}

function _ppExtractCrystalInfo(job, polar) {
  let vecs = polar?.cellVectors || null;
  let atoms = (polar?.atoms || []).map(a => ({ ...a }));
  let formula = job?.material || job?.seed || "";
  let vol = polar?.cellVolA3 || null;

  // Fallback to active CASTEP_STUDIO_STATE structure or job cell/xsd
  const stStruct = window.CASTEP_STUDIO_STATE?.structure;
  if ((!vecs || !atoms.length) && stStruct && stStruct.vectors && stStruct.atoms?.length) {
    if (!vecs) vecs = stStruct.vectors;
    if (!atoms.length) {
      atoms = stStruct.atoms.map((a, idx) => ({
        el: a.element || a.el || "X",
        ion: idx + 1,
        u: a.x ?? a.u ?? 0,
        v: a.y ?? a.v ?? 0,
        w: a.z ?? a.w ?? 0
      }));
    }
    if (!formula && stStruct.formula) formula = stStruct.formula;
  }
  if (!vecs && job?.cell_text && typeof parseCastepCellText === "function") {
    const ps = parseCastepCellText(job.cell_text, job.seed);
    if (ps?.vectors) vecs = ps.vectors;
    if (!atoms.length && ps?.atoms?.length) {
      atoms = ps.atoms.map((a, idx) => ({ el: a.element, ion: idx + 1, u: a.x, v: a.y, w: a.z }));
    }
    if (!formula && ps?.formula) formula = ps.formula;
  }
  if (!vecs) vecs = [[3.268, 0, 0], [-1.634, 2.830, 0], [0, 0, 18.752]];

  const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
  const dot = (a, b) => a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
  const norm = (a) => Math.hypot(a[0], a[1], a[2]);
  const aLen = norm(vecs[0]), bLen = norm(vecs[1]), cLen = norm(vecs[2]);
  if (!vol || vol <= 0) vol = Math.abs(dot(vecs[0], cross(vecs[1], vecs[2]))) || (aLen * bLen * cLen);
  const areaXY = norm(cross(vecs[0], vecs[1])) || (vol / Math.max(1e-6, cLen));

  // Unwrap atomic z coordinates across PBC so the slab is contiguous
  const mod1 = (x) => ((x % 1) + 1) % 1;
  let atomsUnwrapped = atoms.map(a => ({ ...a, wMod: mod1(a.w) }));
  if (atomsUnwrapped.length >= 2) {
    const sortedW = [...atomsUnwrapped].map(a => a.wMod).sort((a, b) => a - b);
    let maxGap = -1, cutW = 0;
    for (let i = 0; i < sortedW.length; i++) {
      const next = (i + 1 < sortedW.length) ? sortedW[i + 1] : (sortedW[0] + 1.0);
      const gap = next - sortedW[i];
      if (gap > maxGap) { maxGap = gap; cutW = mod1(sortedW[i] + gap * 0.5); }
    }
    atomsUnwrapped = atomsUnwrapped.map(a => {
      let wu = a.wMod - cutW;
      if (wu < 0) wu += 1.0;
      return { ...a, wSlab: wu, zSlabA: wu * cLen };
    });
    const meanZ = atomsUnwrapped.reduce((s, a) => s + a.zSlabA, 0) / atomsUnwrapped.length;
    atomsUnwrapped.forEach(a => { a.dzRelA = a.zSlabA - meanZ; });
  } else if (atomsUnwrapped.length === 1) {
    atomsUnwrapped[0].wSlab = 0.5;
    atomsUnwrapped[0].zSlabA = 0.5 * cLen;
    atomsUnwrapped[0].dzRelA = 0;
  }

  // Group atoms into distinct atomic layers along z (tolerance 0.20 Å)
  const sortedByZ = [...atomsUnwrapped].sort((a, b) => a.zSlabA - b.zSlabA);
  const layers = [];
  for (const at of sortedByZ) {
    const last = layers[layers.length - 1];
    if (last && Math.abs(at.zSlabA - last.meanZA) <= 0.22) {
      last.atoms.push(at);
      last.meanZA = last.atoms.reduce((s, x) => s + x.zSlabA, 0) / last.atoms.length;
      if (!last.els.includes(at.el)) last.els.push(at.el);
    } else {
      layers.push({ meanZA: at.zSlabA, els: [at.el], atoms: [at] });
    }
  }
  layers.forEach(L => { L.label = L.els.join("/"); });

  const dOuterA = layers.length >= 2 ? (layers[layers.length - 1].meanZA - layers[0].meanZA) : 0;
  const rTop = layers.length ? (PP_VDW_RADII[layers[layers.length - 1].els[0]] || 1.85) : 1.85;
  const rBot = layers.length ? (PP_VDW_RADII[layers[0].els[0]] || 1.85) : 1.85;
  const tEffAutoA = layers.length >= 2 ? (dOuterA + rTop + rBot) : Math.min(cLen, 6.5);

  // Build formula if missing
  if (!formula && atoms.length) {
    const cnt = {};
    atoms.forEach(a => { cnt[a.el] = (cnt[a.el] || 0) + 1; });
    formula = Object.entries(cnt).map(([e, n]) => n > 1 ? `${e}${n}` : e).join("");
  }

  return {
    formula: formula || "Structure",
    vecs, aLen, bLen, cLen, vol, areaXY,
    atoms: atomsUnwrapped,
    layers,
    dOuterA,
    tEffAutoA
  };
}

function _ppProcessPotentialCurve(rawPot, crys, opts) {
  if (!rawPot || !rawPot.xRaw || rawPot.xRaw.length < 8) return null;
  const cLen = rawPot.axis === "a" ? crys.aLen : (rawPot.axis === "b" ? crys.bLen : crys.cLen);

  // Normalize x to [0, 1) periodic grid
  const nRaw = rawPot.xRaw.length;
  const xMin0 = rawPot.xRaw[0], xMax0 = rawPot.xRaw[nRaw - 1];
  const rawSpan = Math.max(1e-6, xMax0 - xMin0);

  // Drop duplicate periodic endpoint if first and last coincide
  let uArr = [], vArr = [];
  for (let i = 0; i < nRaw; i++) {
    const u = rawPot.isFractional ? ((rawPot.xRaw[i] % 1) + 1) % 1 : (rawPot.xRaw[i] - xMin0) / rawSpan;
    if (i === nRaw - 1 && Math.abs(((rawPot.xRaw[i] - rawPot.xRaw[0]) % 1)) < 1e-3 && rawPot.isFractional) continue;
    uArr.push(u);
    vArr.push(rawPot.vRawEv[i]);
  }
  // Sort by u in [0, 1)
  const order = uArr.map((u, i) => ({ u, v: vArr[i] })).sort((a, b) => a.u - b.u);
  const N = order.length;

  // Auto-detect vacuum center: find the contiguous region where V(u) is near the top 18% of its range (vacuum plateau)
  // AND farthest from the deepest atomic potential well!
  const vMin = Math.min(...order.map(p => p.v));
  const vMax = Math.max(...order.map(p => p.v));
  const vSpan = Math.max(1e-4, vMax - vMin);

  // Compute circular center of mass of the atomic slab weight w_slab = max(0, (vMax - v) / vSpan)^2
  let sumSin = 0, sumCos = 0, sumW = 0;
  for (let i = 0; i < N; i++) {
    const wSlab = Math.pow(Math.max(0, (vMax - order[i].v) / vSpan), 2.5);
    const ang = order[i].u * 2 * Math.PI;
    sumCos += wSlab * Math.cos(ang);
    sumSin += wSlab * Math.sin(ang);
    sumW += wSlab;
  }
  let slabCenterU = 0.5;
  if (sumW > 1e-6 && Math.hypot(sumCos, sumSin) > 1e-5) {
    slabCenterU = (Math.atan2(sumSin, sumCos) / (2 * Math.PI) + 1) % 1;
  }
  // Putting the slab center at u = 0.50 means shifting u -> (u - slabCenterU + 0.5) mod 1
  const autoShiftU = opts.autoCenter ? ((0.5 - slabCenterU + 1) % 1) : 0;
  const userShiftU = ((opts.shiftPct || 0) / 100) % 1;
  const totalShiftU = (autoShiftU + userShiftU + 2) % 1;

  let shifted = order.map(p => {
    let uNew = (p.u + totalShiftU) % 1;
    if (opts.flipZ) uNew = (1.0 - uNew) % 1;
    return { u: uNew, v: p.v };
  }).sort((a, b) => a.u - b.u);

  // Append clean periodic closing point at u = 1.0
  if (shifted.length && shifted[shifted.length - 1].u < 0.999) {
    shifted.push({ u: 1.0, v: shifted[0].v });
  }

  // Detect Left & Right Vacuum Plateaus directly from shifted curve
  // Exclude edge 4% (where CASTEP's self-consistent dipole step kink sits) and central slab region (where V < vMax - 0.16*vSpan)
  const vacThresh = vMax - 0.16 * vSpan;
  // Find slab interval [uSlabL, uSlabR] around u = 0.5
  let uSlabL = 0.35, uSlabR = 0.65;
  const wellIdx = shifted.reduce((bi, p, i) => (p.v < shifted[bi].v ? i : bi), 0);
  let iL = wellIdx, iR = wellIdx;
  while (iL > 0 && shifted[iL].v < vacThresh) iL--;
  while (iR < shifted.length - 1 && shifted[iR].v < vacThresh) iR++;
  uSlabL = shifted[iL].u;
  uSlabR = shifted[iR].u;

  // Flat plateau sampling windows safely inside the actual vacuum span (handles both wide & narrow vacuum slabs!)
  const lStart = Math.min(0.06, Math.max(0.015, uSlabL * 0.25));
  const lEnd = Math.max(lStart + 0.015, uSlabL - Math.min(0.04, uSlabL * 0.25));
  const rSpan = Math.max(0.02, 1.0 - uSlabR);
  const rStart = Math.min(0.985, uSlabR + Math.min(0.04, rSpan * 0.25));
  const rEnd = Math.max(rStart + 0.015, 1.0 - Math.min(0.06, rSpan * 0.25));

  const leftVacPts = shifted.filter(p => p.u >= lStart && p.u <= lEnd);
  const rightVacPts = shifted.filter(p => p.u >= rStart && p.u <= rEnd);

  const percentile = (arr, q = 0.75) => {
    if (!arr.length) return null;
    const s = [...arr].sort((a, b) => a - b);
    const idx = Math.min(s.length - 1, Math.max(0, Math.round((s.length - 1) * q)));
    return s[idx];
  };
  let vacLeftEv = percentile(leftVacPts.map(p => p.v), 0.78);
  let vacRightEv = percentile(rightVacPts.map(p => p.v), 0.78);

  // Respect exact XCD vacuum levels (asymmetric Top/Bottom OR symmetric single Vacuum level)
  if (Number.isFinite(rawPot.vacTopEv) && Number.isFinite(rawPot.vacBotEv) && Number.isFinite(vacLeftEv) && Number.isFinite(vacRightEv)) {
    const hiX = Math.max(rawPot.vacTopEv, rawPot.vacBotEv);
    const loX = Math.min(rawPot.vacTopEv, rawPot.vacBotEv);
    if (vacLeftEv >= vacRightEv) { vacLeftEv = hiX; vacRightEv = loX; }
    else { vacLeftEv = loX; vacRightEv = hiX; }
  } else if (Number.isFinite(rawPot.vacSingleEv) && (vacLeftEv === null || vacRightEv === null || Math.abs(vacLeftEv - vacRightEv) < 0.28)) {
    vacLeftEv = rawPot.vacSingleEv;
    vacRightEv = rawPot.vacSingleEv;
  } else if (vacLeftEv === null && vacRightEv === null) {
    const fallbackVac = Number.isFinite(rawPot.vacSingleEv) ? rawPot.vacSingleEv : vMax;
    vacLeftEv = fallbackVac; vacRightEv = fallbackVac;
  } else {
    if (vacLeftEv === null) vacLeftEv = vacRightEv;
    if (vacRightEv === null) vacRightEv = vacLeftEv;
  }

  const vacAvgEv = 0.5 * (vacLeftEv + vacRightEv);
  const deltaPhiEv = vacLeftEv - vacRightEv; // signed: >0 means Left vacuum is higher -> E_in points Left -> Right (toward lower electron potential / higher electrostatic potential? Wait: V_el = -e*phi, so higher V_el = higher work function -> electron potential higher on Left -> E_in points Right->Left or Left->Right; we report |ΔΦ| and exact sign!)

  const fermiEv = Number.isFinite(rawPot.fermiEv) ? rawPot.fermiEv : (Number.isFinite(opts.fallbackFermiEv) ? opts.fallbackFermiEv : null);
  const wfLeftEv = fermiEv !== null ? (vacLeftEv - fermiEv) : null;
  const wfRightEv = fermiEv !== null ? (vacRightEv - fermiEv) : null;

  // Find distinct atomic potential wells (local minima inside the slab region)
  const wells = [];
  for (let i = 2; i < shifted.length - 2; i++) {
    const p = shifted[i];
    if (p.u < Math.max(0.05, uSlabL - 0.03) || p.u > Math.min(0.95, uSlabR + 0.03)) continue;
    if (p.v > vMax - 0.35 * vSpan) continue;
    if (p.v <= shifted[i - 1].v && p.v <= shifted[i + 1].v && (p.v < shifted[i - 2].v || p.v < shifted[i + 2].v)) {
      const prev = wells[wells.length - 1];
      if (prev && Math.abs((p.u - prev.u) * cLen) < 0.45) {
        if (p.v < prev.v) wells[wells.length - 1] = { u: p.u, zA: p.u * cLen, v: p.v };
      } else {
        wells.push({ u: p.u, zA: p.u * cLen, v: p.v });
      }
    }
  }
  const outerWellLeft = wells.length >= 2 ? wells[0] : (wells[0] || null);
  const outerWellRight = wells.length >= 2 ? wells[wells.length - 1] : null;
  const deltaVWellEv = (outerWellLeft && outerWellRight) ? Math.abs(outerWellRight.v - outerWellLeft.v) : 0;

  // Apply zero reference shift for display
  let vRefOffset = 0;
  let yRefLabel = "Raw CASTEP";
  if (opts.zeroRef === "fermi" && fermiEv !== null) { vRefOffset = -fermiEv; yRefLabel = "E_F = 0"; }
  else if (opts.zeroRef === "vac_avg") { vRefOffset = -vacAvgEv; yRefLabel = "V_vac,avg = 0"; }
  else if (opts.zeroRef === "vac_left") { vRefOffset = -vacLeftEv; yRefLabel = "V_vac,L = 0"; }

  const pts = shifted.map(p => ({
    u: p.u,
    zA: p.u * cLen,
    vRaw: p.v,
    vPlot: p.v + vRefOffset
  }));

  // Helmholtz 2D Slab Dipole & Polarization directly from ΔΦ!
  // Exact electrostatics: ΔΦ (eV) = e * μ_z / (ε0 * A) = P_2D,z / ε0
  const dSlabA = Math.max(0.5, crys.dOuterA || (outerWellLeft && outerWellRight ? Math.abs(outerWellRight.zA - outerWellLeft.zA) : 3.2));
  const helmMuEAng = PP_EPS0_E_PER_V_ANG * crys.areaXY * deltaPhiEv;  // e·Å
  const helmMuDebye = helmMuEAng * PP_E_ANG_TO_DEBYE;                 // Debye
  const helmP2DpCm = PP_EPS0_PC_PER_M_V * deltaPhiEv;                 // pC/m
  const helmP3DCellCm2 = (helmP2DpCm * 1e-12) / (cLen * 1e-10);       // C/m²
  const helmEinVA = Math.abs(deltaPhiEv) / dSlabA;                    // V/Å
  const helmEinMVcm = helmEinVA * 100.0;                              // MV/cm (1 V/Å = 100 MV/cm)

  return {
    sourceFile: rawPot.sourceFile,
    sourceFormat: rawPot.sourceFormat,
    axis: rawPot.axis,
    cLen,
    pts,
    vRefOffset,
    yRefLabel,
    fermiEv,
    fermiPlot: fermiEv !== null ? fermiEv + vRefOffset : null,
    vacLeftEv, vacRightEv, vacAvgEv,
    vacLeftPlot: vacLeftEv + vRefOffset,
    vacRightPlot: vacRightEv + vRefOffset,
    wfLeftEv, wfRightEv,
    deltaPhiEv,
    uSlabL, uSlabR,
    wells: wells.map(w => ({ ...w, vPlot: w.v + vRefOffset })),
    outerWellLeft: outerWellLeft ? { ...outerWellLeft, vPlot: outerWellLeft.v + vRefOffset } : null,
    outerWellRight: outerWellRight ? { ...outerWellRight, vPlot: outerWellRight.v + vRefOffset } : null,
    deltaVWellEv,
    dSlabA,
    helmholtz: {
      muEAng: helmMuEAng,
      muDebye: helmMuDebye,
      p2DpCm: helmP2DpCm,
      p3DCellCm2: helmP3DCellCm2,
      einVA: helmEinVA,
      einMVcm: helmEinMVcm
    }
  };
}

function computeCastepPotPolAnalysis() {
  const job = _ppGetActiveJob();
  const st = CASTEP_POT_POL_STATE;

  // Read UI options
  const opts = {
    layout: document.getElementById("castep-pot-layout")?.value || "dual",
    xUnit: document.getElementById("castep-pot-xunit")?.value || "angstrom",
    zeroRef: document.getElementById("castep-pot-zref")?.value || "raw",
    annotMode: document.getElementById("castep-pot-annot")?.value || "both",
    autoCenter: document.getElementById("castep-pot-autocenter")?.checked !== false,
    flipZ: !!document.getElementById("castep-pot-flipz")?.checked,
    shiftPct: parseFloat(document.getElementById("castep-pot-shift")?.value || "0") || 0,
    showInset: document.getElementById("castep-pot-inset")?.checked !== false,
    showFermiVac: document.getElementById("castep-pot-guides")?.checked !== false,
    curveColor: document.getElementById("castep-pot-color")?.value || "#7c5cb8",
    tEffInput: parseFloat(document.getElementById("castep-pot-teff")?.value || "0") || 0
  };

  const castepText = st.overridePolarCastep || job?.castep_text || "";
  const paramText = job?.param_text || "";
  const polar = parseCastepPolarizationData(castepText, paramText);
  const crys = _ppExtractCrystalInfo(job, polar);
  const tEffA = opts.tEffInput > 0.5 ? opts.tEffInput : crys.tEffAutoA;

  // Potential source priority: manual override -> job.potential_xcd -> job.potential_data
  let rawPot = st.overridePotential || null;
  if (!rawPot && job?.potential_xcd && job.potential_xcd.xRaw) rawPot = job.potential_xcd;
  if (!rawPot && job?.potential_xcd_text) rawPot = parseCastepPotentialXcdText(job.potential_xcd_text, job.potential_xcd_file || "Potential Profile.xcd");

  const pot = _ppProcessPotentialCurve(rawPot, crys, { ...opts, fallbackFermiEv: polar.fermiEv });

  // Synthesize Berry-Phase Polarization across ALL scientific units
  let berrySummary = null;
  if (polar.hasBerry) {
    const cVec = polar.cartCm2 ? polar.cartCm2.total : (polar.cartBohr ? polar.cartBohr.total.map(v => v * PP_E_BOHR2_TO_CM2) : [0, 0, 0]);
    const cIonic = polar.cartCm2 ? polar.cartCm2.ionic : (polar.cartBohr ? polar.cartBohr.ionic.map(v => v * PP_E_BOHR2_TO_CM2) : [0, 0, 0]);
    const cElec = polar.cartCm2 ? polar.cartCm2.elec : (polar.cartBohr ? polar.cartBohr.elec.map(v => v * PP_E_BOHR2_TO_CM2) : [0, 0, 0]);
    const px = cVec[0], py = cVec[1], pz = cVec[2];
    const pMag = Math.hypot(px, py, pz);
    // 2D sheet polarization (C/m -> pC/m = *1e12): P_2D = P_3D_cell (C/m²) * c (Å * 1e-10 m) * 1e12 = P_3D_cell * c * 100
    const p2Dz_pCm = pz * crys.cLen * 100.0;
    const p2Dx_pCm = px * crys.cLen * 100.0;
    const p2Dy_pCm = py * crys.cLen * 100.0;
    // Effective 3D slab polarization (μC/cm² = C/m² * 100): P_3D_slab = P_3D_cell * (c / t_eff)
    const slabRatio = crys.cLen / Math.max(0.5, tEffA);
    const pSlabZ_uCcm2 = pz * slabRatio * 100.0;
    // Unit-cell dipole moment: μ (e·Å) = P_3D (e/Å²) * V_cell (Å³)
    const pz_eA2 = pz * PP_CM2_TO_E_PER_A2;
    const muZ_eAng = pz_eA2 * crys.vol;
    const muX_eAng = px * PP_CM2_TO_E_PER_A2 * crys.vol;
    const muY_eAng = py * PP_CM2_TO_E_PER_A2 * crys.vol;
    const muZ_Debye = muZ_eAng * PP_E_ANG_TO_DEBYE;
    const muMag_Debye = Math.hypot(muX_eAng, muY_eAng, muZ_eAng) * PP_E_ANG_TO_DEBYE;
    // Equivalent Helmholtz ΔΦ and built-in E_in implied by Berry P_2D,z
    const dPhiEquivEv = p2Dz_pCm / PP_EPS0_PC_PER_M_V;
    const einVA = Math.abs(dPhiEquivEv) / Math.max(0.5, crys.dOuterA || 3.2);

    berrySummary = {
      ionicCm2: cIonic, elecCm2: cElec, totalCm2: cVec,
      px, py, pz, pMag,
      pz_uCcm2: pz * 100.0,
      pz_eA2,
      p2Dx_pCm, p2Dy_pCm, p2Dz_pCm,
      pSlabZ_uCcm2,
      muX_eAng, muY_eAng, muZ_eAng,
      muZ_Debye, muMag_Debye,
      dPhiEquivEv,
      einVA,
      einMVcm: einVA * 100.0
    };
  }

  // Point-Charge Ionic Dipole Moments from Mulliken & Iterative Hirshfeld charges
  const computeChargeDipole = (chargeArr) => {
    if (!chargeArr || !chargeArr.length || !crys.atoms.length) return null;
    let muZ = 0, sumQ = 0;
    const perAtom = [];
    for (const qItem of chargeArr) {
      const at = crys.atoms.find(a => a.el === qItem.el && a.ion === qItem.ion);
      if (!at) continue;
      const contrib = qItem.charge * at.dzRelA;
      muZ += contrib;
      sumQ += qItem.charge;
      perAtom.push({ el: qItem.el, ion: qItem.ion, zSlabA: at.zSlabA, dzRelA: at.dzRelA, q: qItem.charge, muContrib: contrib });
    }
    if (!perAtom.length) return null;
    const muDebye = muZ * PP_E_ANG_TO_DEBYE;
    // pC/m: (muZ [e·Å] * 1.6021766e-19 * 1e-10) / (areaXY [Å²] * 1e-20) * 1e12 = (muZ / areaXY) * 1602.1766
    const p2DpCm = (muZ / Math.max(1e-4, crys.areaXY)) * 1602.176634;
    return { muEAng: muZ, muDebye, p2DpCm, sumQ, perAtom };
  };
  const hirshfeldDipole = computeChargeDipole(polar.hirshfeldCharges);
  const mullikenDipole = computeChargeDipole(polar.mullikenCharges);

  // Build atomic charge comparison rows
  const atomChargeRows = crys.atoms.map(at => {
    const mQ = polar.mullikenCharges.find(c => c.el === at.el && c.ion === at.ion)?.charge ?? null;
    const hQ = polar.hirshfeldCharges.find(c => c.el === at.el && c.ion === at.ion)?.charge ?? null;
    const bZ = polar.bornCharges.find(c => c.el === at.el && c.ion === at.ion)?.tensor?.[2]?.[2] ?? null;
    return {
      label: `${at.el}${at.ion}`, el: at.el, ion: at.ion,
      zSlabA: at.zSlabA, dzRelA: at.dzRelA,
      mullikenQ: mQ, hirshfeldQ: hQ, bornZzz: bZ,
      muHirsh: hQ !== null ? hQ * at.dzRelA : null
    };
  }).sort((a, b) => a.zSlabA - b.zSlabA);

  // Scan ALL loaded jobs in workspace for Multi-Job Polarization / ΔΦ comparison table!
  const multiJobRows = [];
  for (const j of (window.CASTEP_STUDIO_STATE?.jobs || [])) {
    if (!j.castep_text && !j.potential_xcd && !j.potential_xcd_text) continue;
    const jp = parseCastepPolarizationData(j.castep_text || "", j.param_text || "");
    const jPotRaw = j.potential_xcd || (j.potential_xcd_text ? parseCastepPotentialXcdText(j.potential_xcd_text, j.potential_xcd_file || "Potential.xcd") : null);
    if (!jp.hasBerry && !jPotRaw) continue;
    const jc = _ppExtractCrystalInfo(j, jp);
    const jPot = jPotRaw ? _ppProcessPotentialCurve(jPotRaw, jc, { autoCenter: true, flipZ: false, shiftPct: 0, zeroRef: "raw", fallbackFermiEv: jp.fermiEv }) : null;
    const pzCm2 = jp.hasBerry ? (jp.cartCm2 ? jp.cartCm2.total[2] : (jp.cartBohr ? jp.cartBohr.total[2] * PP_E_BOHR2_TO_CM2 : null)) : null;
    const pz_eA2 = pzCm2 !== null ? pzCm2 * PP_CM2_TO_E_PER_A2 : null;
    const muZ_eA = pz_eA2 !== null ? pz_eA2 * jc.vol : (jPot ? jPot.helmholtz.muEAng : null);
    const muZ_D = muZ_eA !== null ? muZ_eA * PP_E_ANG_TO_DEBYE : null;
    const p2D_pCm = pzCm2 !== null ? (pzCm2 * jc.cLen * 100.0) : (jPot ? jPot.helmholtz.p2DpCm : null);
    multiJobRows.push({
      jobId: j.id,
      title: j.title || j.seed || "Job",
      efieldZ: jp.appliedEfield ? jp.appliedEfield[2] : null,
      deltaPhiEv: jPot ? jPot.deltaPhiEv : null,
      pzCm2, pz_eA2, p2D_pCm, muZ_eA, muZ_D,
      hasBerry: jp.hasBerry, hasPot: !!jPot
    });
  }

  return {
    jobTitle: st.overrideSourceName || job?.title || job?.seed || crys.formula,
    seed: (job?.seed || crys.formula || "CASTEP").replace(/[^\w.-]+/g, "_"),
    opts,
    crys,
    tEffA,
    polar,
    pot,
    berrySummary,
    hirshfeldDipole,
    mullikenDipole,
    atomChargeRows,
    multiJobRows
  };
}

// ============================================================================
// 3. Publication High-DPI Canvas Renderer (Matching PRB / Nature Figure (e)!)
// ============================================================================

function _ppDrawGlossyAtom(ctx, x, y, r, fillHex, strokeHex) {
  const grad = ctx.createRadialGradient(x - r * 0.32, y - r * 0.32, r * 0.12, x, y, r);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(0.28, fillHex);
  grad.addColorStop(1, strokeHex);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = strokeHex;
  ctx.lineWidth = 0.7;
  ctx.stroke();
}

function _ppDrawDoubleArrowV(ctx, x, y1, y2, color, label, fontSpec, labelRight = true) {
  const top = Math.min(y1, y2), bot = Math.max(y1, y2);
  if (bot - top < 8) return;
  ctx.save();
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(x, top + 4); ctx.lineTo(x, bot - 4); ctx.stroke();
  // Arrowheads
  const ah = 5.5, aw = 3.2;
  ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x - aw, top + ah); ctx.lineTo(x + aw, top + ah); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x, bot); ctx.lineTo(x - aw, bot - ah); ctx.lineTo(x + aw, bot - ah); ctx.closePath(); ctx.fill();
  if (label) {
    ctx.font = fontSpec;
    ctx.fillStyle = "#0f172a";
    ctx.textAlign = labelRight ? "left" : "right";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x + (labelRight ? 7 : -7), 0.5 * (top + bot));
  }
  ctx.restore();
}

function _ppDrawSlabInset(ctx, xBox, yBox, wBox, hBox, an, st) {
  const layers = an.crys.layers || [];
  if (layers.length < 2) return;
  ctx.save();
  // Draw clean side-view schematic of slab layers aligned horizontally/vertically + E_in arrow!
  const nL = layers.length;
  // Compact vertical 3-unit-cell side-view motif inside top-center / left-vacuum empty zone (just like Fig. e!)
  const cx = xBox + wBox * 0.5, cy = yBox + hBox * 0.5;
  const maxSpanW = wBox * 0.62;
  const zMin = layers[0].meanZA, zMax = layers[nL - 1].meanZA;
  const zSpan = Math.max(0.5, zMax - zMin);

  // Horizontal coordinates mapped across the slab thickness (left = layer 0, right = layer n-1)
  const colX = layers.map(L => cx - maxSpanW * 0.5 + ((L.meanZA - zMin) / zSpan) * maxSpanW);
  const nRows = 2;
  const rowPitch = Math.min(28, (hBox * 0.52) / nRows);
  const yStart = cy - rowPitch * 0.5;

  // Draw bonds between adjacent layers
  for (let r = 0; r < nRows; r++) {
    const ryBase = yStart + r * rowPitch;
    for (let li = 0; li < nL - 1; li++) {
      const cA = PP_CPK[layers[li].els[0]] || { fill: "#64748b", stroke: "#334155", r: 0.95 };
      const cB = PP_CPK[layers[li + 1].els[0]] || { fill: "#64748b", stroke: "#334155", r: 0.95 };
      const x1 = colX[li], x2 = colX[li + 1];
      const y1 = ryBase + (li % 2 === 0 ? -rowPitch * 0.32 : rowPitch * 0.12);
      const y2 = ryBase + ((li + 1) % 2 === 0 ? -rowPitch * 0.32 : rowPitch * 0.12);
      const xm = 0.5 * (x1 + x2), ym = 0.5 * (y1 + y2);
      ctx.lineWidth = 2.6; ctx.lineCap = "round";
      ctx.strokeStyle = cA.fill; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(xm, ym); ctx.stroke();
      ctx.strokeStyle = cB.fill; ctx.beginPath(); ctx.moveTo(xm, ym); ctx.lineTo(x2, y2); ctx.stroke();
      // Diagonal cross-bond strictly between adjacent rows (no dangling stub!)
      if (r + 1 < nRows) {
        const yAlt = y1 + rowPitch;
        const ym2 = 0.5 * (yAlt + y2);
        ctx.strokeStyle = cA.fill; ctx.beginPath(); ctx.moveTo(x1, yAlt); ctx.lineTo(xm, ym2); ctx.stroke();
        ctx.strokeStyle = cB.fill; ctx.beginPath(); ctx.moveTo(xm, ym2); ctx.lineTo(x2, y2); ctx.stroke();
      }
    }
  }
  // Draw glossy spheres
  for (let r = 0; r < nRows; r++) {
    const ryBase = yStart + r * rowPitch;
    for (let li = 0; li < nL; li++) {
      const el = layers[li].els[0];
      const cpk = PP_CPK[el] || { fill: "#94a3b8", stroke: "#334155", r: 0.95 };
      const px = colX[li];
      const py = ryBase + (li % 2 === 0 ? -rowPitch * 0.32 : rowPitch * 0.12);
      _ppDrawGlossyAtom(ctx, px, py, 6.5 * cpk.r, cpk.fill, cpk.stroke);
      if (r === 0) {
        ctx.fillStyle = "#334155";
        ctx.font = `700 9.5px ${st.fontFamily}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(el, px, py - 8.5 * cpk.r);
      }
    }
  }

  // Built-in Electric Field E_in arrow underneath the inset!
  const dPhi = an.pot ? an.pot.deltaPhiEv : (an.berrySummary ? an.berrySummary.dPhiEquivEv : 0);
  if (Math.abs(dPhi) > 0.01) {
    const ay = yStart + nRows * rowPitch + 12;
    const xL = colX[0], xR = colX[nL - 1];
    // Arrow points from higher electron potential (lower electrostatic φ) toward lower electron potential (higher φ) -> dipole field direction
    const goRight = dPhi > 0;
    const ax1 = goRight ? xL : xR, ax2 = goRight ? xR : xL;
    ctx.strokeStyle = "#0f172a"; ctx.fillStyle = "#0f172a"; ctx.lineWidth = 2.0;
    ctx.beginPath(); ctx.moveTo(ax1, ay); ctx.lineTo(ax2, ay); ctx.stroke();
    const dir = goRight ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(ax2, ay);
    ctx.lineTo(ax2 - dir * 6.5, ay - 3.6);
    ctx.lineTo(ax2 - dir * 6.5, ay + 3.6);
    ctx.closePath(); ctx.fill();
    ctx.font = `italic 700 11.5px ${st.fontFamily}`;
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    if (typeof drawSciText === "function") drawSciText(ctx, "E_{in}", 0.5 * (ax1 + ax2), ay + 12);
    else ctx.fillText("E_in", 0.5 * (ax1 + ax2), ay + 4);
  }
  ctx.restore();
}

function _ppDrawPotentialPanel(ctx, rx, ry, rw, rh, an, st) {
  const pot = an.pot;
  const padL = 68, padR = 24, padT = 36, padB = 52;
  const x0 = rx + padL, y0 = ry + padT, w = rw - padL - padR, h = rh - padT - padB;
  const ff = st.fontFamily || '"Times New Roman", Times, serif';
  const axWeight = st.boldAxes ? "700 " : "";

  if (!pot) {
    ctx.save();
    ctx.fillStyle = "#f8fafc"; ctx.fillRect(x0, y0, w, h);
    ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 1; ctx.strokeRect(x0, y0, w, h);
    ctx.fillStyle = "#334155"; ctx.font = "700 13.5px Inter, sans-serif"; ctx.textAlign = "center";
    ctx.fillText("No Electrostatic Potential Profile Loaded", x0 + w / 2, y0 + h / 2 - 12);
    ctx.fillStyle = "#64748b"; ctx.font = "11.5px Inter, sans-serif";
    ctx.fillText("Load a CASTEP *Potential Profile.xcd or *.pot_fmt file via the toolbar button above.", x0 + w / 2, y0 + h / 2 + 12);
    ctx.restore();
    return { id: "POT", x0, y0, w, h };
  }

  const useAng = an.opts.xUnit !== "frac";
  const xFullMax = useAng ? pot.cLen : 1.0;
  const zFactor = CASTEP_POT_POL_STATE.zoom || 1.0;
  const xMid = 0.5 * xFullMax + (CASTEP_POT_POL_STATE.panX || 0);
  const xHalf = (0.5 * xFullMax) / zFactor;
  const xLo = Math.max(0, xMid - xHalf);
  const xHi = Math.min(xFullMax, xMid + xHalf);

  const vals = pot.pts.map(p => p.vPlot);
  let yMin = Math.min(...vals), yMax = Math.max(...vals);
  const ySpan = Math.max(2.0, yMax - yMin);
  yMin -= ySpan * 0.14;
  yMax += ySpan * 0.15;

  const toX = (xv) => x0 + ((xv - xLo) / Math.max(1e-6, xHi - xLo)) * w;
  const toY = (yv) => y0 + h * (1 - (yv - yMin) / Math.max(1e-6, yMax - yMin));

  // Nice ticks generator
  const niceTicks = (lo, hi, targetN = 6) => {
    const raw = (hi - lo) / Math.max(2, targetN);
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const norm = raw / mag;
    const step = norm <= 1.4 ? mag : (norm <= 3.0 ? 2 * mag : (norm <= 6.5 ? 5 * mag : 10 * mag));
    const start = Math.ceil(lo / step - 1e-9) * step;
    const major = [];
    for (let v = start; v <= hi + step * 1e-6; v += step) major.push(Math.abs(v) < step * 1e-6 ? 0 : Number(v.toPrecision(10)));
    return { major, step };
  };
  const xTickObj = niceTicks(xLo, xHi, useAng ? 6 : 5);
  const yTickObj = niceTicks(yMin, yMax, 5);

  // Optional grid
  if (typeof drawPubGridLines === "function") {
    drawPubGridLines(ctx, x0, y0, w, h, st, xTickObj.major.map(toX), yTickObj.major.map(toY));
  }

  ctx.save();
  ctx.beginPath(); ctx.rect(x0, y0, w, h); ctx.clip();

  // Optional Fermi Level & Left/Right Vacuum Level dashed guides
  if (an.opts.showFermiVac) {
    if (pot.fermiPlot !== null) {
      const pyF = toY(pot.fermiPlot);
      ctx.strokeStyle = "#dc2626"; ctx.lineWidth = 1.1; ctx.setLineDash([5, 3]);
      ctx.beginPath(); ctx.moveTo(x0, pyF); ctx.lineTo(x0 + w, pyF); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#dc2626"; ctx.font = `700 ${Math.max(9.5, (st.legendSize || 10.5))}px ${ff}`;
      ctx.textAlign = "right"; ctx.textBaseline = "bottom";
      if (typeof drawSciText === "function") drawSciText(ctx, `E_{F} (${pot.fermiPlot.toFixed(2)} eV)`, x0 + w - 6, pyF - 4);
      else ctx.fillText(`E_F (${pot.fermiPlot.toFixed(2)} eV)`, x0 + w - 6, pyF - 3);
    }
    const pyVL = toY(pot.vacLeftPlot), pyVR = toY(pot.vacRightPlot);
    ctx.strokeStyle = "rgba(15, 118, 110, 0.55)"; ctx.lineWidth = 1.0; ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(x0, pyVL); ctx.lineTo(toX(useAng ? pot.uSlabL * pot.cLen : pot.uSlabL), pyVL);
    ctx.moveTo(toX(useAng ? pot.uSlabR * pot.cLen : pot.uSlabR), pyVR); ctx.lineTo(x0 + w, pyVR);
    ctx.stroke(); ctx.setLineDash([]);
  }

  // Smooth Publication Potential Profile V(z) Curve (deep violet #7c5cb8 matching reference Fig. e!)
  ctx.strokeStyle = an.opts.curveColor || "#7c5cb8";
  ctx.lineWidth = Math.max(2.2, (st.lineWidth || 2.0) * 1.25);
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  ctx.beginPath();
  pot.pts.forEach((p, i) => {
    const px = toX(useAng ? p.zA : p.u), py = toY(p.vPlot);
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  });
  ctx.stroke();

  // Annotations: (1) Outer-Well ΔV_well (like "2.66 eV" in Fig. e!) and/or (2) Vacuum Step ΔΦ!
  const annot = an.opts.annotMode;
  const annFont = `700 ${Math.max(11, (st.legendSize || 11) + 0.5)}px ${ff}`;
  if ((annot === "both" || annot === "well") && pot.outerWellLeft && pot.outerWellRight && pot.deltaVWellEv > 0.02) {
    const wL = pot.outerWellLeft, wR = pot.outerWellRight;
    const lowW = wL.vPlot <= wR.vPlot ? wL : wR;
    const hiW = wL.vPlot <= wR.vPlot ? wR : wL;
    const yLoW = toY(lowW.vPlot), yHiW = toY(hiW.vPlot);
    const xBarL = toX(useAng ? Math.min(wL.zA, wR.zA) : Math.min(wL.u, wR.u)) - 8;
    const xBarR = toX(useAng ? Math.max(wL.zA, wR.zA) : Math.max(wL.u, wR.u)) + 44;
    ctx.strokeStyle = "#0f172a"; ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(xBarL, yLoW); ctx.lineTo(xBarR, yLoW);
    ctx.moveTo(Math.max(xBarL, toX(useAng ? hiW.zA : hiW.u) - 10), yHiW); ctx.lineTo(xBarR, yHiW);
    ctx.stroke();
    const xArr = Math.min(x0 + w - 62, toX(useAng ? Math.max(wL.zA, wR.zA) : Math.max(wL.u, wR.u)) + 12);
    _ppDrawDoubleArrowV(ctx, xArr, yHiW, yLoW, "#2563eb", `${pot.deltaVWellEv.toFixed(2)} eV`, annFont, true);
  }
  if ((annot === "both" || annot === "vac") && Math.abs(pot.deltaPhiEv) > 0.015) {
    const yVL = toY(pot.vacLeftPlot), yVR = toY(pot.vacRightPlot);
    const xMidVac = x0 + w * 0.78;
    ctx.strokeStyle = "#0f766e"; ctx.lineWidth = 1.2; ctx.setLineDash([4, 2]);
    ctx.beginPath();
    ctx.moveTo(toX(useAng ? pot.uSlabL * pot.cLen : pot.uSlabL), yVL); ctx.lineTo(xMidVac + 16, yVL);
    ctx.moveTo(xMidVac - 12, yVR); ctx.lineTo(xMidVac + 16, yVR);
    ctx.stroke(); ctx.setLineDash([]);
    if (Math.abs(yVL - yVR) >= 10) {
      _ppDrawDoubleArrowV(ctx, xMidVac + 4, yVL, yVR, "#0f766e", `ΔΦ = ${Math.abs(pot.deltaPhiEv).toFixed(3)} eV`, annFont, false);
    } else {
      ctx.fillStyle = "#0f766e"; ctx.font = annFont; ctx.textAlign = "right"; ctx.textBaseline = "bottom";
      ctx.fillText(`ΔΦ = ${Math.abs(pot.deltaPhiEv).toFixed(3)} eV`, x0 + w - 8, Math.min(yVL, yVR) - 5);
    }
  }

  // Optional Glossy Atomic Slab Schematic + Built-in Field E_in Arrow Inset inside Left Vacuum Space!
  if (an.opts.showInset && an.crys.layers.length >= 2) {
    const insetW = Math.min(130, w * 0.30);
    const insetH = Math.min(132, h * 0.44);
    const ix = x0 + 14;
    const iy = y0 + h * 0.44;
    _ppDrawSlabInset(ctx, ix, iy, insetW, insetH, an, st);
  }
  ctx.restore();

  // Axes Box + Major & Minor Ticks (OriginPro / PRB style!)
  ctx.save();
  ctx.strokeStyle = st.inkColor || "#000000";
  ctx.lineWidth = st.borderWidth || 1.6;
  ctx.strokeRect(x0, y0, w, h);
  if (st.tickDir !== "none") {
    const tl = st.tickLength || 5;
    const sgn = st.tickDir === "out" ? -1 : 1;
    ctx.lineWidth = Math.max(1.0, (st.borderWidth || 1.6) * 0.8);
    xTickObj.major.forEach(xv => {
      const px = toX(xv);
      if (px <= x0 + 1 || px >= x0 + w - 1) return;
      ctx.beginPath(); ctx.moveTo(px, y0 + h); ctx.lineTo(px, y0 + h - sgn * tl); ctx.moveTo(px, y0); ctx.lineTo(px, y0 + sgn * tl); ctx.stroke();
    });
    // Minor X ticks (midpoint)
    for (let i = 0; i < xTickObj.major.length - 1; i++) {
      const mx = toX(0.5 * (xTickObj.major[i] + xTickObj.major[i + 1]));
      if (mx > x0 + 2 && mx < x0 + w - 2) {
        ctx.beginPath(); ctx.moveTo(mx, y0 + h); ctx.lineTo(mx, y0 + h - sgn * (tl * 0.55)); ctx.moveTo(mx, y0); ctx.lineTo(mx, y0 + sgn * (tl * 0.55)); ctx.stroke();
      }
    }
    yTickObj.major.forEach(yv => {
      const py = toY(yv);
      if (py <= y0 + 1 || py >= y0 + h - 1) return;
      ctx.beginPath(); ctx.moveTo(x0, py); ctx.lineTo(x0 + sgn * tl, py); ctx.moveTo(x0 + w, py); ctx.lineTo(x0 + w - sgn * tl, py); ctx.stroke();
    });
    for (let i = 0; i < yTickObj.major.length - 1; i++) {
      const my = toY(0.5 * (yTickObj.major[i] + yTickObj.major[i + 1]));
      if (my > y0 + 2 && my < y0 + h - 2) {
        ctx.beginPath(); ctx.moveTo(x0, my); ctx.lineTo(x0 + sgn * (tl * 0.55), my); ctx.moveTo(x0 + w, my); ctx.lineTo(x0 + w - sgn * (tl * 0.55), my); ctx.stroke();
      }
    }
  }
  ctx.restore();

  // Title, Tick Labels & Axis Labels
  const tickPad = st.tickDir === "out" ? ((st.tickLength || 5) + 4) : 6;
  ctx.fillStyle = st.inkColor || "#000000";
  ctx.font = `${axWeight}${st.titleSize || 14}px ${ff}`;
  ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  const potTitle = `${_ppFmtFormulaSci(an.crys.formula)}: Planar-Averaged Electrostatic Potential V(${pot.axis === "c" ? "z" : pot.axis})`;
  if (typeof drawSciText === "function") drawSciText(ctx, potTitle, x0 + w / 2, ry + 22);
  else ctx.fillText(potTitle, x0 + w / 2, ry + 22);

  ctx.font = `${st.tickSize || 12}px ${ff}`;
  ctx.textAlign = "center"; ctx.textBaseline = "top";
  const decX = useAng ? (xTickObj.step < 1 ? 1 : 0) : 2;
  xTickObj.major.forEach(xv => ctx.fillText(xv.toFixed(decX), toX(xv), y0 + h + tickPad));
  ctx.font = `${axWeight}${st.axisLabelSize || 13}px ${ff}`;
  const xLbl = useAng ? `Distance along ${pot.axis}-axis, z (Å)` : `Fractional Coordinate (${pot.axis}/|${pot.axis}|)`;
  ctx.fillText(xLbl, x0 + w / 2, y0 + h + tickPad + (st.tickSize || 12) + 6);

  ctx.font = `${st.tickSize || 12}px ${ff}`;
  ctx.textAlign = "right"; ctx.textBaseline = "middle";
  const decY = yTickObj.step < 1 ? 1 : 0;
  yTickObj.major.forEach(yv => {
    const s = yv.toFixed(decY);
    ctx.fillText(typeof formatPubMinus === "function" ? formatPubMinus(s) : s.replace("-", "−"), x0 - tickPad, toY(yv));
  });
  ctx.save();
  ctx.translate(rx + 18, y0 + h / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center"; ctx.font = `${axWeight}${st.axisLabelSize || 13}px ${ff}`;
  const yLbl = pot.yRefLabel === "Raw CASTEP" ? "Potential (eV)" : `Potential (${pot.yRefLabel}, eV)`;
  ctx.fillText(yLbl, 0, 0);
  ctx.restore();

  return { id: "POT", x0, y0, w, h, xLo, xHi, yMin, yMax, useAng };
}

function _ppDrawPolarizationPanel(ctx, rx, ry, rw, rh, an, st) {
  const ff = st.fontFamily || '"Times New Roman", Times, serif';
  const axWeight = st.boldAxes ? "700 " : "";
  const padL = 62, padR = 20, padT = 36, padB = 50;
  const x0 = rx + padL, y0 = ry + padT, w = rw - padL - padR, h = rh - padT - padB;

  // Build Cross-Method Out-of-Plane Dipole Moment |μ_z| (Debye) & Berry Cartesian Decomposition!
  const methods = [];
  if (an.berrySummary) {
    methods.push({ label: "Berry Phase\n(Exact)", muD: an.berrySummary.muZ_Debye, p2D: an.berrySummary.p2Dz_pCm, col: "#7c3aed" });
  }
  if (an.pot) {
    methods.push({ label: "Helmholtz\nV(z) ΔΦ", muD: an.pot.helmholtz.muDebye, p2D: an.pot.helmholtz.p2DpCm, col: "#0d9488" });
  }
  if (an.hirshfeldDipole) {
    methods.push({ label: "Hirshfeld\nIonic", muD: an.hirshfeldDipole.muDebye, p2D: an.hirshfeldDipole.p2DpCm, col: "#2563eb" });
  }
  if (an.mullikenDipole) {
    methods.push({ label: "Mulliken\nIonic", muD: an.mullikenDipole.muDebye, p2D: an.mullikenDipole.p2DpCm, col: "#d97706" });
  }

  if (!methods.length) {
    ctx.save();
    ctx.fillStyle = "#f8fafc"; ctx.fillRect(x0, y0, w, h);
    ctx.strokeStyle = "#cbd5e1"; ctx.strokeRect(x0, y0, w, h);
    ctx.fillStyle = "#334155"; ctx.font = "700 13px Inter, sans-serif"; ctx.textAlign = "center";
    ctx.fillText("No Polarization / Charge Data Found", x0 + w / 2, y0 + h / 2 - 10);
    ctx.fillStyle = "#64748b"; ctx.font = "11px Inter, sans-serif";
    ctx.fillText("Load a CASTEP *.castep with calculate_polarisation: true or *Potential Profile.xcd", x0 + w / 2, y0 + h / 2 + 12);
    ctx.restore();
    return { id: "POL", x0, y0, w, h };
  }

  // Top 52% = Out-of-plane Dipole Moment μ_z (Debye) Comparison across Methods;
  // Bottom 48% (if Berry Phase present) = Cartesian Berry Components (P_x, P_y, P_z in C/m²)!
  const splitTwo = !!an.berrySummary;
  const topH = splitTwo ? Math.floor(h * 0.50) : h;
  const botY = y0 + topH + 34;
  const botH = splitTwo ? Math.max(70, h - topH - 34) : 0;

  // --- Sub-chart 1: Dipole Moment μ_z (Debye) Cross-Method Bar Chart ---
  const maxAbsD = Math.max(0.05, ...methods.map(m => Math.abs(m.muD))) * 1.28;
  const hasNeg = methods.some(m => m.muD < -1e-4);
  const yLo1 = hasNeg ? -maxAbsD : 0;
  const yHi1 = maxAbsD;
  const toY1 = (v) => y0 + topH * (1 - (v - yLo1) / (yHi1 - yLo1));
  const yZero1 = toY1(0);

  ctx.save();
  ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 0.9; ctx.setLineDash([3, 3]);
  [0.25, 0.5, 0.75].forEach(f => {
    const gy = y0 + topH * f;
    ctx.beginPath(); ctx.moveTo(x0, gy); ctx.lineTo(x0 + w, gy); ctx.stroke();
  });
  ctx.setLineDash([]);
  ctx.strokeStyle = "#64748b"; ctx.lineWidth = 1.0;
  ctx.beginPath(); ctx.moveTo(x0, yZero1); ctx.lineTo(x0 + w, yZero1); ctx.stroke();

  const slotW = w / methods.length;
  const barW = Math.min(48, slotW * 0.52);
  methods.forEach((m, i) => {
    const cx = x0 + (i + 0.5) * slotW;
    const yTop = Math.min(yZero1, toY1(m.muD));
    const bh = Math.max(2, Math.abs(toY1(m.muD) - yZero1));
    ctx.fillStyle = m.col;
    ctx.fillRect(cx - barW / 2, yTop, barW, bh);
    ctx.strokeStyle = "#0f172a"; ctx.lineWidth = 0.8;
    ctx.strokeRect(cx - barW / 2, yTop, barW, bh);

    // Value label
    ctx.fillStyle = "#0f172a"; ctx.font = `700 ${Math.max(9.5, (st.tickSize || 11) - 1)}px ${ff}`;
    ctx.textAlign = "center";
    if (m.muD >= 0) {
      ctx.textBaseline = "bottom";
      ctx.fillText(`${m.muD >= 0 ? "+" : ""}${m.muD.toFixed(3)} D`, cx, yTop - 3);
    } else {
      ctx.textBaseline = "top";
      ctx.fillText(`${m.muD.toFixed(3)} D`, cx, yTop + bh + 3);
    }

    // X Category Label
    ctx.fillStyle = "#334155"; ctx.font = `700 ${Math.max(9.5, (st.tickSize || 11) - 1)}px ${ff}`;
    ctx.textBaseline = "top";
    m.label.split("\n").forEach((ln, li) => {
      ctx.fillText(ln, cx, y0 + topH + 4 + li * 11.5);
    });
  });

  // Box & Y ticks for Sub-chart 1
  ctx.strokeStyle = st.inkColor || "#000000"; ctx.lineWidth = st.borderWidth || 1.5;
  ctx.strokeRect(x0, y0, w, topH);
  ctx.fillStyle = st.inkColor || "#000000"; ctx.font = `${Math.max(9.5, (st.tickSize || 11) - 0.5)}px ${ff}`;
  ctx.textAlign = "right"; ctx.textBaseline = "middle";
  [yLo1, 0.5 * (yLo1 + yHi1), yHi1].forEach(v => {
    const py = toY1(v);
    ctx.beginPath(); ctx.moveTo(x0, py); ctx.lineTo(x0 + 4, py); ctx.stroke();
    ctx.fillText(v.toFixed(2), x0 - 5, py);
  });

  ctx.save(); ctx.translate(rx + 16, y0 + topH / 2); ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center"; ctx.font = `${axWeight}${Math.max(10.5, (st.axisLabelSize || 12) - 0.5)}px ${ff}`;
  if (typeof drawSciText === "function") drawSciText(ctx, "Dipole μ_{z} (Debye)", 0, 0);
  else ctx.fillText("Dipole μ_z (Debye)", 0, 0);
  ctx.restore();

  ctx.font = `${axWeight}${st.titleSize || 13.5}px ${ff}`; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.fillText("Out-of-Plane Dipole & Berry Polarization", x0 + w / 2, ry + 22);

  // --- Sub-chart 2: Cartesian Berry-Phase Polarization Components (x, y, z) ---
  if (splitTwo && botH >= 65) {
    const bs = an.berrySummary;
    const comps = [
      { ax: "P_{x}", tot: bs.totalCm2[0], col: "#2563eb" },
      { ax: "P_{y}", tot: bs.totalCm2[1], col: "#0d9488" },
      { ax: "P_{z}", tot: bs.totalCm2[2], col: "#7c3aed" }
    ];
    const maxP = Math.max(0.01, ...comps.map(c => Math.abs(c.tot))) * 1.32;
    const toY2 = (v) => botY + botH * (1 - (v + maxP) / (2 * maxP));
    const yZ2 = toY2(0);

    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 1.0;
    ctx.beginPath(); ctx.moveTo(x0, yZ2); ctx.lineTo(x0 + w, yZ2); ctx.stroke();

    const sW2 = w / 3, bW2 = Math.min(44, sW2 * 0.45);
    comps.forEach((c, i) => {
      const cx = x0 + (i + 0.5) * sW2;
      const yt = Math.min(yZ2, toY2(c.tot));
      const bh = Math.max(2, Math.abs(toY2(c.tot) - yZ2));
      ctx.fillStyle = c.col; ctx.fillRect(cx - bW2 / 2, yt, bW2, bh);
      ctx.strokeStyle = "#0f172a"; ctx.lineWidth = 0.8; ctx.strokeRect(cx - bW2 / 2, yt, bW2, bh);
      ctx.fillStyle = "#0f172a"; ctx.font = `700 ${Math.max(9, (st.tickSize || 11) - 1.5)}px ${ff}`;
      ctx.textAlign = "center";
      ctx.textBaseline = c.tot >= 0 ? "bottom" : "top";
      ctx.fillText(`${c.tot >= 0 ? "+" : ""}${c.tot.toFixed(4)}`, cx, c.tot >= 0 ? yt - 2 : yt + bh + 2);
      ctx.fillStyle = "#334155"; ctx.textBaseline = "top";
      if (typeof drawSciText === "function") drawSciText(ctx, c.ax, cx, botY + botH + 13);
      else ctx.fillText(c.ax.replace(/[{}]/g, ""), cx, botY + botH + 4);
    });

    ctx.strokeStyle = st.inkColor || "#000000"; ctx.lineWidth = st.borderWidth || 1.5;
    ctx.strokeRect(x0, botY, w, botH);
    ctx.fillStyle = st.inkColor || "#000000"; ctx.font = `${Math.max(9, (st.tickSize || 11) - 1)}px ${ff}`;
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    [-maxP, 0, maxP].forEach(v => ctx.fillText(v.toFixed(2), x0 - 5, toY2(v)));

    ctx.save(); ctx.translate(rx + 16, botY + botH / 2); ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center"; ctx.font = `${axWeight}${Math.max(10, (st.axisLabelSize || 12) - 1)}px ${ff}`;
    ctx.fillText("Berry P (C/m²)", 0, 0);
    ctx.restore();
  }
  ctx.restore();

  return { id: "POL", x0, y0, w, h };
}

function _ppDrawMainCanvas(canvas, an) {
  const st = (typeof getCastepPlotStyle === "function") ? getCastepPlotStyle() : {
    fontFamily: '"Times New Roman", Times, Georgia, serif',
    titleSize: 14, axisLabelSize: 13, tickSize: 12, legendSize: 11,
    borderWidth: 1.7, lineWidth: 2.0, tickDir: "in", tickLength: 5,
    gridMode: "off", inkColor: "#000000", boldAxes: true
  };
  const parentW = canvas.parentElement ? (canvas.parentElement.clientWidth - 20) : 920;
  const width = Math.max(720, Math.floor(parentW));
  const height = 470;
  const dpr = (typeof getCastepCanvasDpr === "function") ? getCastepCanvasDpr(width, height) : Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.scale(dpr, dpr);
  if (typeof applyCrispCanvasQuality === "function") applyCrispCanvasQuality(ctx);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const layout = an.opts.layout || "dual";
  const geoms = [];
  const subRects = [];

  if (layout === "pot_only") {
    const gP = _ppDrawPotentialPanel(ctx, 0, 0, width, height, an, st);
    geoms.push(gP);
    subRects.push({ key: "pot_profile", label: "Electrostatic Potential V(z)", x: 0, y: 0, w: width, h: height, pngName: `${an.seed}_Potential_Profile.png`, buildExactTable: () => _ppBuildPotentialTable(an) });
  } else if (layout === "pol_only") {
    const gPol = _ppDrawPolarizationPanel(ctx, 0, 0, width, height, an, st);
    geoms.push(gPol);
    subRects.push({ key: "pol_summary", label: "Polarization & Dipole Comparison", x: 0, y: 0, w: width, h: height, pngName: `${an.seed}_Polarization.png`, buildExactTable: () => _ppBuildPolarizationTable(an) });
  } else {
    const leftW = Math.round(width * 0.58);
    const gP = _ppDrawPotentialPanel(ctx, 0, 0, leftW, height, an, st);
    const gPol = _ppDrawPolarizationPanel(ctx, leftW, 0, width - leftW, height, an, st);
    geoms.push(gP, gPol);
    subRects.push(
      { key: "pot_profile", label: "Electrostatic Potential V(z)", x: 0, y: 0, w: leftW, h: height, pngName: `${an.seed}_Potential_Profile.png`, buildExactTable: () => _ppBuildPotentialTable(an) },
      { key: "pol_summary", label: "Polarization & Dipole Comparison", x: leftW, y: 0, w: width - leftW, h: height, pngName: `${an.seed}_Polarization.png`, buildExactTable: () => _ppBuildPolarizationTable(an) }
    );
  }

  CASTEP_POT_POL_STATE.panelGeoms = geoms;
  canvas._subPanelRects = subRects;
  ctx.restore();
}

// ============================================================================
// 4. Master UI Renderer, Event Binding, Uploads & Export Suite
// ============================================================================

function initCastepPotentialPane() {
  if (CASTEP_POT_POL_STATE.bound) return;
  const canvas = document.getElementById("castep-potential-canvas");
  if (!canvas) return;
  CASTEP_POT_POL_STATE.bound = true;

  if (typeof CASTEP_PLOT_CTX_SPECS !== "undefined" && !CASTEP_PLOT_CTX_SPECS["castep-potential-canvas"]) {
    CASTEP_PLOT_CTX_SPECS["castep-potential-canvas"] = {
      label: "Electrostatic Potential & Polarization",
      pngName: "CASTEP_Potential_Polarization.png",
      dataItems: []
    };
  }
  canvas.title = "Hover over V(z) for exact potential values • Ctrl+Scroll to zoom • Double-click to reset • Right-click any sub-plot to Copy HD Image or TSV Data";
  canvas.addEventListener("contextmenu", (ev) => {
    if (typeof showCastepPlotContextMenu === "function") {
      ev.preventDefault();
      showCastepPlotContextMenu("castep-potential-canvas", ev.clientX, ev.clientY);
    }
  });
  canvas.addEventListener("mousemove", (ev) => {
    const an = CASTEP_POT_POL_STATE.lastAnalysis;
    const rd = document.getElementById("castep-pot-readout");
    if (!an || !an.pot || !rd) return;
    const g = (CASTEP_POT_POL_STATE.panelGeoms || []).find(p => p.id === "POT");
    if (!g) return;
    const br = canvas.getBoundingClientRect();
    const mx = ev.clientX - br.left, my = ev.clientY - br.top;
    if (mx < g.x0 || mx > g.x0 + g.w || my < g.y0 || my > g.y0 + g.h) return;
    const xVal = g.xLo + ((mx - g.x0) / g.w) * (g.xHi - g.xLo);
    const best = an.pot.pts.reduce((a, b) => {
      const xa = g.useAng ? a.zA : a.u, xb = g.useAng ? b.zA : b.u;
      return Math.abs(xb - xVal) < Math.abs(xa - xVal) ? b : a;
    });
    const relF = an.pot.fermiEv !== null ? ` • V − E<sub>F</sub> = <strong>${(best.vRaw - an.pot.fermiEv).toFixed(4)} eV</strong>` : "";
    rd.innerHTML = `<strong>Electrostatic Potential V(z)</strong> • z = <strong>${best.zA.toFixed(3)} Å</strong> (frac = ${best.u.toFixed(4)}) | <span style="color:#6d28d9; font-weight:700;">V(z) = ${best.vPlot.toFixed(4)} eV</span>${relF}`;
  });
  canvas.addEventListener("wheel", (ev) => {
    if (!ev.ctrlKey || !CASTEP_POT_POL_STATE.lastAnalysis?.pot) return;
    ev.preventDefault();
    zoomCastepPotentialPlot(ev.deltaY < 0 ? 1.2 : 1 / 1.2);
  }, { passive: false });
  canvas.addEventListener("dblclick", () => resetCastepPotentialZoom());
}

function renderCastepPotentialPane() {
  initCastepPotentialPane();
  const an = computeCastepPotPolAnalysis();
  CASTEP_POT_POL_STATE.lastAnalysis = an;

  // Populate default t_eff placeholder
  const teffEl = document.getElementById("castep-pot-teff");
  if (teffEl && !teffEl.value) teffEl.placeholder = `${an.crys.tEffAutoA.toFixed(2)} Å`;

  // 1) Top Summary Strip
  const strip = document.getElementById("castep-pot-summary-strip");
  if (strip) {
    const potTag = an.pot ? `<span style="color:#6d28d9; font-weight:700;">● Potential: ${_ppEsc(an.pot.sourceFile)}</span>` : `<span style="color:#64748b;">No Potential .xcd/.pot_fmt loaded</span>`;
    const polTag = an.berrySummary ? `<span style="color:#0f766e; font-weight:700;">● Berry Polarization: Active</span>` : `<span style="color:#64748b;">No Berry Phase table in .castep</span>`;
    const dipTag = an.polar.dipoleCorrMode && an.polar.dipoleCorrMode !== "None"
      ? `<span><strong>Dipole Corr:</strong> ${_ppEsc(an.polar.dipoleCorrMode)} (${_ppEsc(an.polar.dipoleCorrDir || "Z")}${an.polar.dipoleCorrEnergyEv !== null ? `, dE=${an.polar.dipoleCorrEnergyEv.toFixed(5)} eV` : ""})</span>`
      : "";
    strip.innerHTML = `
      <span><strong>System:</strong> ${_ppFmtFormulaHtml(an.crys.formula)} (c = ${an.crys.cLen.toFixed(3)} Å, A = ${an.crys.areaXY.toFixed(3)} Å², V = ${an.crys.vol.toFixed(2)} Å³)</span>
      ${potTag}
      ${polTag}
      ${dipTag}
    `;
  }

  // 2) 4 Scientific KPI Cards
  const kpiBox = document.getElementById("castep-pot-kpi-grid");
  if (kpiBox) {
    const pot = an.pot;
    const bs = an.berrySummary;
    const dPhiDisp = pot ? `${Math.abs(pot.deltaPhiEv).toFixed(3)}` : (bs ? `${Math.abs(bs.dPhiEquivEv).toFixed(3)}*` : "—");
    const wfLTxt = pot?.wfLeftEv != null ? `${pot.wfLeftEv.toFixed(3)} eV` : "—";
    const wfRTxt = pot?.wfRightEv != null ? `${pot.wfRightEv.toFixed(3)} eV` : "—";
    const wellTxt = pot && pot.deltaVWellEv > 0.01 ? `${pot.deltaVWellEv.toFixed(2)} eV` : "—";
    const efTxt = pot?.fermiEv != null ? `${pot.fermiEv.toFixed(3)} eV` : (an.polar.fermiEv != null ? `${an.polar.fermiEv.toFixed(3)} eV` : "—");

    const p2DMain = bs ? `${bs.p2Dz_pCm.toFixed(3)}` : (pot ? `${pot.helmholtz.p2DpCm.toFixed(3)}` : "—");
    const p2DSrc = bs ? "CASTEP Berry Phase (Exact)" : (pot ? "Helmholtz from V(z) ΔΦ" : "Load .castep or Potential.xcd");

    const muMainD = bs ? `${bs.muZ_Debye.toFixed(4)}` : (pot ? `${pot.helmholtz.muDebye.toFixed(4)}` : "—");
    const muMainEA = bs ? `${bs.muZ_eAng.toFixed(5)} e·Å` : (pot ? `${pot.helmholtz.muEAng.toFixed(5)} e·Å` : "—");
    const einVA = pot ? `${pot.helmholtz.einVA.toFixed(4)} V/Å` : (bs ? `${bs.einVA.toFixed(4)} V/Å` : "—");
    const einMV = pot ? `${pot.helmholtz.einMVcm.toFixed(2)} MV/cm` : (bs ? `${bs.einMVcm.toFixed(2)} MV/cm` : "—");

    kpiBox.innerHTML = `
      <div class="tr-kpi-card" style="border-top-color:#7c3aed;">
        <div class="tr-kpi-hd">⚡ Electrostatic Potential &amp; Work Function</div>
        <div class="tr-kpi-main" style="color:#6d28d9;">ΔΦ = ${dPhiDisp} <span class="tr-unit">eV</span></div>
        <div class="tr-kpi-grid-rows">
          <span>Φ<sub>Left</sub>: <strong>${wfLTxt}</strong></span>
          <span>Φ<sub>Right</sub>: <strong>${wfRTxt}</strong></span>
          <span>ΔV<sub>well</sub>: <strong>${wellTxt}</strong></span>
          <span>E<sub>F</sub>: <strong>${efTxt}</strong></span>
        </div>
        <div class="tr-kpi-note">${pot ? `${_ppEsc(pot.sourceFormat)} • ${pot.pts.length} pts • ${pot.wells.length} atomic well(s)` : "Upload *Potential Profile.xcd or *.pot_fmt to resolve V(z)"}</div>
      </div>

      <div class="tr-kpi-card" style="border-top-color:#0d9488;">
        <div class="tr-kpi-hd">🧲 2D &amp; 3D Spontaneous Polarization</div>
        <div class="tr-kpi-main" style="color:#0f766e;">P<sub>2D,z</sub> = ${p2DMain} <span class="tr-unit">pC/m</span></div>
        <div class="tr-kpi-grid-rows">
          <span>P<sub>3D,z</sub> (cell): <strong>${bs ? bs.pz.toFixed(5) + " C/m²" : "—"}</strong></span>
          <span>P<sub>z</sub> (e/Å²): <strong>${bs ? bs.pz_eA2.toExponential(3) : "—"}</strong></span>
          <span>P<sub>3D,slab</sub>: <strong>${bs ? bs.pSlabZ_uCcm2.toFixed(3) + " μC/cm²" : "—"}</strong></span>
          <span>|P<sub>xy</sub>|: <strong>${bs ? Math.hypot(bs.px, bs.py).toFixed(4) + " C/m²" : "—"}</strong></span>
        </div>
        <div class="tr-kpi-note">${p2DSrc} • Slab t<sub>eff</sub> = ${an.tEffA.toFixed(2)} Å</div>
      </div>

      <div class="tr-kpi-card" style="border-top-color:#2563eb;">
        <div class="tr-kpi-hd">🔋 Dipole Moment μ<sub>z</sub> &amp; Built-In Field</div>
        <div class="tr-kpi-main" style="color:#1d4ed8;">μ<sub>z</sub> = ${muMainD} <span class="tr-unit">Debye</span></div>
        <div class="tr-kpi-grid-rows">
          <span>μ<sub>z</sub> (e·Å): <strong>${muMainEA}</strong></span>
          <span>E<sub>in</sub>: <strong>${einVA}</strong></span>
          <span>E<sub>in</sub> (MV/cm): <strong>${einMV}</strong></span>
          <span>Dipole dE: <strong>${an.polar.dipoleCorrEnergyEv !== null ? an.polar.dipoleCorrEnergyEv.toFixed(5) + " eV" : "—"}</strong></span>
        </div>
        <div class="tr-kpi-note">1 e·Å = 4.8032 D • d<sub>outer</sub> = ${an.crys.dOuterA.toFixed(3)} Å${an.polar.appliedEfield ? ` • E<sub>ext</sub>=(${an.polar.appliedEfield.map(v=>v.toFixed(2)).join(",")}) V/Å` : ""}</div>
      </div>

      <div class="tr-kpi-card" style="border-top-color:#d97706;">
        <div class="tr-kpi-hd">⚛️ Cross-Method Dipole Consistency</div>
        <div class="tr-kpi-main" style="color:#b45309;">${an.hirshfeldDipole ? `μ<sub>Hirsh</sub> = ${an.hirshfeldDipole.muDebye.toFixed(3)}` : (an.mullikenDipole ? `μ<sub>Mul</sub> = ${an.mullikenDipole.muDebye.toFixed(3)}` : "—")} <span class="tr-unit">Debye</span></div>
        <div class="tr-kpi-grid-rows">
          <span>Helmholtz: <strong>${pot ? pot.helmholtz.muDebye.toFixed(4) + " D" : "—"}</strong></span>
          <span>Berry Phase: <strong>${bs ? bs.muZ_Debye.toFixed(4) + " D" : "—"}</strong></span>
          <span>Hirshfeld: <strong>${an.hirshfeldDipole ? an.hirshfeldDipole.muDebye.toFixed(4) + " D" : "—"}</strong></span>
          <span>Mulliken: <strong>${an.mullikenDipole ? an.mullikenDipole.muDebye.toFixed(4) + " D" : "—"}</strong></span>
        </div>
        <div class="tr-kpi-note">Quantum Berry Phase &amp; Helmholtz ΔΦ include full electron-cloud redistribution; point-charge dipoles are ionic estimates.</div>
      </div>
    `;
  }

  // 3) Render High-DPI Canvas
  const canvas = document.getElementById("castep-potential-canvas");
  if (canvas) _ppDrawMainCanvas(canvas, an);

  // 4) Table 1: CASTEP Berry-Phase Polarization Tensor (Reciprocal + Cartesian)
  const berryTbody = document.getElementById("castep-pot-berry-tbody");
  if (berryTbody) {
    if (an.polar.hasBerry) {
      const rows = [];
      an.polar.recipRows.forEach(r => {
        const ratio = r.quantum > 1e-6 ? Math.abs(r.total) / r.quantum : 0;
        const flag = ratio > 0.35 ? ` <span style="color:#b45309; font-weight:700;" title="Close to ±Q/2 branch boundary — verify branch continuity">⚠️</span>` : "";
        rows.push(`
          <tr>
            <td><strong>${_ppEsc(r.label)}</strong> <span style="color:#64748b; font-size:10px;">(${r.dir.map(v=>v.toFixed(2)).join(",")})</span></td>
            <td>Recip.</td>
            <td>${r.ionic.toFixed(4)}</td>
            <td>${r.elec.toFixed(4)}</td>
            <td style="font-weight:800; color:#6d28d9;">${r.total.toFixed(4)}${flag}</td>
            <td>${r.quantum.toFixed(4)}</td>
            <td>${(r.total * an.crys.cLen * 100).toFixed(2)}</td>
          </tr>`);
      });
      if (an.berrySummary) {
        const bs = an.berrySummary;
        ["x", "y", "z"].forEach((ax, i) => {
          const tot = bs.totalCm2[i];
          const p2D = tot * an.crys.cLen * 100.0;
          rows.push(`
            <tr style="${ax === "z" ? "background:#f5f3ff;" : ""}">
              <td><strong>Cart. P<sub>${ax}</sub></strong></td>
              <td>Cartesian</td>
              <td>${bs.ionicCm2[i].toFixed(6)}</td>
              <td>${bs.elecCm2[i].toFixed(6)}</td>
              <td style="font-weight:800; color:${ax === "z" ? "#0f766e" : "#1e293b"};">${tot.toFixed(6)}</td>
              <td>${(tot * PP_CM2_TO_E_PER_A2).toExponential(3)} e/Å²</td>
              <td style="font-weight:700;">${p2D.toFixed(3)}</td>
            </tr>`);
        });
      }
      berryTbody.innerHTML = rows.join("");
    } else {
      berryTbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:12px; color:#64748b;">No CASTEP Berry-Phase polarization block found in active <code>*.castep</code>. Set <code>calculate_polarisation : true</code> in CASTEP or upload a <code>Polarization.castep</code> file above.</td></tr>`;
    }
  }

  // 5) Table 2: Atomic Layer Positions, Hirshfeld/Mulliken Charges & Dipole Contributions
  const chargeTbody = document.getElementById("castep-pot-charges-tbody");
  if (chargeTbody) {
    if (an.atomChargeRows.length) {
      chargeTbody.innerHTML = an.atomChargeRows.map(a => `
        <tr>
          <td><strong>${_ppEsc(a.label)}</strong></td>
          <td>${a.zSlabA.toFixed(3)}</td>
          <td>${a.dzRelA >= 0 ? "+" : ""}${a.dzRelA.toFixed(3)}</td>
          <td style="color:${a.mullikenQ < 0 ? "#2563eb" : "#dc2626"}; font-weight:700;">${a.mullikenQ !== null ? (a.mullikenQ >= 0 ? "+" : "") + a.mullikenQ.toFixed(3) : "—"}</td>
          <td style="color:${a.hirshfeldQ < 0 ? "#2563eb" : "#dc2626"}; font-weight:700;">${a.hirshfeldQ !== null ? (a.hirshfeldQ >= 0 ? "+" : "") + a.hirshfeldQ.toFixed(3) : "—"}</td>
          <td>${a.muHirsh !== null ? (a.muHirsh >= 0 ? "+" : "") + a.muHirsh.toFixed(4) : "—"}</td>
          <td>${a.bornZzz !== null ? a.bornZzz.toFixed(3) : "—"}</td>
        </tr>`).join("");
    } else {
      chargeTbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:12px; color:#64748b;">Load a CASTEP calculation to inspect atomic layer charges &amp; dipole contributions.</td></tr>`;
    }
  }

  // 6) Optional Table 3: Multi-Job Polarization & Electric-Field Sweep Summary (when >=2 workspace jobs have data!)
  const multiCard = document.getElementById("castep-pot-multijob-card");
  const multiTbody = document.getElementById("castep-pot-multijob-tbody");
  if (multiCard && multiTbody) {
    if (an.multiJobRows.length >= 2) {
      multiCard.style.display = "block";
      multiTbody.innerHTML = an.multiJobRows.map(r => `
        <tr style="cursor:pointer;" onclick="if(typeof loadCastepJobIntoStudio==='function') loadCastepJobIntoStudio('${_ppEsc(r.jobId)}')">
          <td><strong>${_ppEsc(r.title)}</strong></td>
          <td>${r.efieldZ !== null ? r.efieldZ.toFixed(2) : "—"}</td>
          <td>${r.deltaPhiEv !== null ? Math.abs(r.deltaPhiEv).toFixed(4) : "—"}</td>
          <td>${r.pzCm2 !== null ? r.pzCm2.toFixed(6) : "—"}</td>
          <td>${r.pz_eA2 !== null ? r.pz_eA2.toExponential(3) : "—"}</td>
          <td style="font-weight:700; color:#0f766e;">${r.p2D_pCm !== null ? r.p2D_pCm.toFixed(3) : "—"}</td>
          <td>${r.muZ_eA !== null ? r.muZ_eA.toFixed(5) : "—"}</td>
          <td style="font-weight:700; color:#6d28d9;">${r.muZ_D !== null ? r.muZ_D.toFixed(4) : "—"}</td>
        </tr>`).join("");
    } else {
      multiCard.style.display = "none";
    }
  }
}
window.renderCastepPotentialPane = renderCastepPotentialPane;

// ---------------- Interactive Controls, Uploads & Export ----------------

function zoomCastepPotentialPlot(factor) {
  CASTEP_POT_POL_STATE.zoom = Math.max(1.0, Math.min(8.0, Number(((CASTEP_POT_POL_STATE.zoom || 1.0) * factor).toFixed(3))));
  renderCastepPotentialPane();
}
window.zoomCastepPotentialPlot = zoomCastepPotentialPlot;

function resetCastepPotentialZoom() {
  CASTEP_POT_POL_STATE.zoom = 1.0;
  CASTEP_POT_POL_STATE.panX = 0;
  renderCastepPotentialPane();
}
window.resetCastepPotentialZoom = resetCastepPotentialZoom;

function resetCastepPotentialSettings() {
  const setV = (id, v) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.type === "checkbox") el.checked = Boolean(v);
    else el.value = String(v);
  };
  setV("castep-pot-layout", "dual");
  setV("castep-pot-xunit", "angstrom");
  setV("castep-pot-zref", "raw");
  setV("castep-pot-annot", "both");
  setV("castep-pot-autocenter", true);
  setV("castep-pot-flipz", false);
  setV("castep-pot-shift", "0");
  setV("castep-pot-inset", true);
  setV("castep-pot-guides", true);
  setV("castep-pot-color", "#7c5cb8");
  setV("castep-pot-teff", "");
  CASTEP_POT_POL_STATE.zoom = 1.0;
  CASTEP_POT_POL_STATE.panX = 0;
  renderCastepPotentialPane();
}
window.resetCastepPotentialSettings = resetCastepPotentialSettings;

function clearCastepPotentialOverrides() {
  CASTEP_POT_POL_STATE.overridePotential = null;
  CASTEP_POT_POL_STATE.overridePolarCastep = null;
  CASTEP_POT_POL_STATE.overrideSourceName = "";
  renderCastepPotentialPane();
}
window.clearCastepPotentialOverrides = clearCastepPotentialOverrides;

async function handleCastepPotentialFileUpload(event) {
  const files = Array.from(event?.target?.files || []);
  if (event?.target) event.target.value = "";
  if (!files.length) return;
  await loadCastepPotentialFilesList(files);
}
window.handleCastepPotentialFileUpload = handleCastepPotentialFileUpload;

async function loadCastepPotentialFilesList(files) {
  let loadedPot = false, loadedCastep = false;
  for (const f of files) {
    const low = f.name.toLowerCase();
    const txt = await f.text();
    if (low.endsWith(".xcd")) {
      const parsed = parseCastepPotentialXcdText(txt, f.name);
      if (parsed) {
        CASTEP_POT_POL_STATE.overridePotential = parsed;
        CASTEP_POT_POL_STATE.overrideSourceName = f.name;
        loadedPot = true;
      }
    } else if (low.endsWith(".pot_fmt") || low.endsWith(".epot_fmt")) {
      const parsed = parseCastepPotFmtText(txt, f.name, "c");
      if (parsed) {
        CASTEP_POT_POL_STATE.overridePotential = parsed;
        CASTEP_POT_POL_STATE.overrideSourceName = f.name;
        loadedPot = true;
      }
    } else if (low.endsWith(".castep")) {
      CASTEP_POT_POL_STATE.overridePolarCastep = txt;
      if (!CASTEP_POT_POL_STATE.overrideSourceName) CASTEP_POT_POL_STATE.overrideSourceName = f.name;
      loadedCastep = true;
    } else if (low.endsWith(".csv") || low.endsWith(".dat") || low.endsWith(".tsv") || low.endsWith(".txt")) {
      const parsed = parseGenericPotentialTableText(txt, f.name);
      if (parsed) {
        CASTEP_POT_POL_STATE.overridePotential = parsed;
        CASTEP_POT_POL_STATE.overrideSourceName = f.name;
        loadedPot = true;
      }
    }
  }
  renderCastepPotentialPane();
  if (typeof showToast === "function") {
    if (loadedPot || loadedCastep) {
      const what = [loadedPot ? "Potential Profile V(z)" : "", loadedCastep ? "CASTEP Polarization/Charges" : ""].filter(Boolean).join(" + ");
      showToast(`Loaded ${what}!`, "success");
    } else {
      showToast("No Potential (.xcd / .pot_fmt / .csv) or CASTEP (.castep) data recognized in selected files.", "warning");
    }
  }
}
window.loadCastepPotentialFilesList = loadCastepPotentialFilesList;

function _ppBuildPotentialTable(an) {
  if (!an || !an.pot) return { title: "Electrostatic Potential V(z)", headers: ["z_A", "z_frac", "V_raw_eV", "V_plot_eV"], rows: [] };
  return {
    title: `Electrostatic Potential V(z) (${an.crys.formula})`,
    headers: ["z_A", "z_frac", "V_raw_eV", "V_plot_eV"],
    rows: an.pot.pts.map(p => [
      Number(p.zA.toFixed(6)), Number(p.u.toFixed(6)),
      Number(p.vRaw.toFixed(6)), Number(p.vPlot.toFixed(6))
    ])
  };
}

function _ppBuildPolarizationTable(an) {
  const rows = [];
  if (an.berrySummary) {
    const bs = an.berrySummary;
    rows.push(["Berry Phase (CASTEP Exact)", Number(bs.pz.toFixed(6)), Number(bs.pz_eA2.toExponential(4)), Number(bs.p2Dz_pCm.toFixed(4)), Number(bs.muZ_eAng.toFixed(6)), Number(bs.muZ_Debye.toFixed(5))]);
  }
  if (an.pot) {
    const h = an.pot.helmholtz;
    rows.push(["Helmholtz V(z) Delta_Phi", Number(h.p3DCellCm2.toFixed(6)), Number((h.p3DCellCm2 * PP_CM2_TO_E_PER_A2).toExponential(4)), Number(h.p2DpCm.toFixed(4)), Number(h.muEAng.toFixed(6)), Number(h.muDebye.toFixed(5))]);
  }
  if (an.hirshfeldDipole) {
    const hd = an.hirshfeldDipole;
    rows.push(["Iterative Hirshfeld Ionic", "", "", Number(hd.p2DpCm.toFixed(4)), Number(hd.muEAng.toFixed(6)), Number(hd.muDebye.toFixed(5))]);
  }
  if (an.mullikenDipole) {
    const md = an.mullikenDipole;
    rows.push(["Mulliken Ionic", "", "", Number(md.p2DpCm.toFixed(4)), Number(md.muEAng.toFixed(6)), Number(md.muDebye.toFixed(5))]);
  }
  return {
    title: `Polarization & Dipole Summary (${an.crys.formula})`,
    headers: ["Method", "P_3D_z_Cm2", "P_z_e_per_A2", "P_2D_z_pCm", "Dipole_mu_z_eA", "Dipole_mu_z_Debye"],
    rows
  };
}

async function copyCastepPotentialTSV() {
  const an = CASTEP_POT_POL_STATE.lastAnalysis;
  if (!an) return;
  const tbl = an.pot ? _ppBuildPotentialTable(an) : _ppBuildPolarizationTable(an);
  const tsv = [tbl.headers.join("\t"), ...tbl.rows.map(r => r.join("\t"))].join("\n");
  window._lastCastepPotExportInfo = { rows: tbl.rows.length, headers: tbl.headers };
  try {
    await navigator.clipboard.writeText(tsv);
    if (typeof showToast === "function") showToast(`Copied ${tbl.title} TSV (${tbl.rows.length} rows)!`, "success");
  } catch {
    if (typeof showToast === "function") showToast(`Prepared ${tbl.title} TSV (${tbl.rows.length} rows).`, "info");
  }
}
window.copyCastepPotentialTSV = copyCastepPotentialTSV;

function exportCastepPotentialCSV() {
  const an = CASTEP_POT_POL_STATE.lastAnalysis;
  if (!an) return;
  const tbl = an.pot ? _ppBuildPotentialTable(an) : _ppBuildPolarizationTable(an);
  const csv = [tbl.headers.join(","), ...tbl.rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${an.seed}_Potential_Polarization.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1500);
}
window.exportCastepPotentialCSV = exportCastepPotentialCSV;

function exportCastepPotentialXLSX() {
  const an = CASTEP_POT_POL_STATE.lastAnalysis;
  if (!an || typeof buildXlsxBlob !== "function") { exportCastepPotentialCSV(); return; }
  const summaryRows = [
    ["Material", an.crys.formula, ""],
    ["Cell c (A)", Number(an.crys.cLen.toFixed(5)), "A"],
    ["In-plane Area A (A^2)", Number(an.crys.areaXY.toFixed(5)), "A^2"],
    ["Cell Volume V (A^3)", Number(an.crys.vol.toFixed(5)), "A^3"],
    ["Outer Atomic Thickness d_outer", Number(an.crys.dOuterA.toFixed(4)), "A"],
    ["Effective Slab Thickness t_eff", Number(an.tEffA.toFixed(4)), "A"],
    ["Work Function Phi_Left", an.pot?.wfLeftEv != null ? Number(an.pot.wfLeftEv.toFixed(4)) : "", "eV"],
    ["Work Function Phi_Right", an.pot?.wfRightEv != null ? Number(an.pot.wfRightEv.toFixed(4)) : "", "eV"],
    ["Vacuum Dipole Step Delta_Phi", an.pot ? Number(an.pot.deltaPhiEv.toFixed(5)) : "", "eV"],
    ["Outer Well Difference Delta_V_well", an.pot ? Number(an.pot.deltaVWellEv.toFixed(4)) : "", "eV"],
    ["Dipole Correction Mode", an.polar.dipoleCorrMode, an.polar.dipoleCorrDir],
    ["Dipole Correction dE", an.polar.dipoleCorrEnergyEv !== null ? an.polar.dipoleCorrEnergyEv : "", "eV"]
  ];
  const sheets = [
    { name: "Summary", headers: ["Parameter", "Value", "Units"], rows: summaryRows },
    { name: "Polarization_Methods", ..._ppBuildPolarizationTable(an) }
  ];
  if (an.pot) sheets.push({ name: "Potential_Profile_Vz", ..._ppBuildPotentialTable(an) });
  if (an.atomChargeRows.length) {
    sheets.push({
      name: "Atomic_Charges_Dipole",
      headers: ["Atom", "z_slab_A", "dz_rel_A", "Mulliken_q_e", "Hirshfeld_q_e", "mu_Hirshfeld_eA", "Born_Zzz"],
      rows: an.atomChargeRows.map(a => [a.label, Number(a.zSlabA.toFixed(4)), Number(a.dzRelA.toFixed(4)), a.mullikenQ ?? "", a.hirshfeldQ ?? "", a.muHirsh != null ? Number(a.muHirsh.toFixed(5)) : "", a.bornZzz ?? ""])
    });
  }
  if (an.multiJobRows.length >= 2) {
    sheets.push({
      name: "Multi_Job_Polarization",
      headers: ["Job", "E_Field_VA", "Delta_Phi_eV", "P_z_Cm2", "P_z_eA2", "P_2D_pCm", "Dipole_mu_z_eA", "Dipole_mu_z_Debye"],
      rows: an.multiJobRows.map(r => [r.title, r.efieldZ ?? "", r.deltaPhiEv ?? "", r.pzCm2 ?? "", r.pz_eA2 ?? "", r.p2D_pCm ?? "", r.muZ_eA ?? "", r.muZ_D ?? ""])
    });
  }
  const blob = buildXlsxBlob(sheets);
  if (blob && typeof triggerBlobDownload === "function") {
    triggerBlobDownload(blob, `${an.seed}_Potential_Polarization.xlsx`);
    if (typeof showToast === "function") showToast(`Exported ${sheets.length}-sheet Excel workbook ${an.seed}_Potential_Polarization.xlsx!`, "success");
  }
}
window.exportCastepPotentialXLSX = exportCastepPotentialXLSX;
