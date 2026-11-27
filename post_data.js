// ============================================================================
// Post-Data Processing Engine: Multi-CIF Interlayer & Atomic Distance Analyzer
// (Batch CIF Loader, PBC Slab Unwrapping, Layer Clustering, Origin-Style Plot,
//  Live Side-View Crystal Schematic & Multi-Tab Excel/CSV/TSV Export — v162)
// ============================================================================

const POST_DATA_PALETTE = [
  "#333333", // d1: charcoal/black (matches reference)
  "#e53935", // d2: crimson red
  "#1e88e5", // d3: royal blue
  "#26a65b", // d4: emerald green
  "#9c64e8", // d5: violet purple
  "#d49b00", // d6: warm gold
  "#00897b", // d7: teal
  "#d81b60", // d8: magenta
  "#5e35b1", // d9: deep indigo
  "#f4511e", // d10: coral orange
  "#546e7a", // d11: blue-grey
  "#7cb342"  // d12: olive green
];

const POST_DATA_CPK = {
  H:  { fill: "#f8fafc", stroke: "#64748b", r: 0.55 },
  B:  { fill: "#f9a8d4", stroke: "#be185d", r: 0.85 },
  C:  { fill: "#4b5563", stroke: "#111827", r: 0.80 },
  N:  { fill: "#b0c4de", stroke: "#475569", r: 0.78 },
  O:  { fill: "#ef4444", stroke: "#991b1b", r: 0.76 },
  F:  { fill: "#86efac", stroke: "#15803d", r: 0.72 },
  Si: { fill: "#3b6ef5", stroke: "#1e3a8a", r: 1.05 },
  P:  { fill: "#c4a3c9", stroke: "#6b3e73", r: 1.00 },
  S:  { fill: "#facc15", stroke: "#a16207", r: 0.96 },
  Se: { fill: "#fb923c", stroke: "#9a3412", r: 1.06 },
  Te: { fill: "#d97706", stroke: "#78350f", r: 1.16 },
  Ti: { fill: "#94a3b8", stroke: "#334155", r: 1.18 },
  V:  { fill: "#a8a29e", stroke: "#44403c", r: 1.15 },
  Cr: { fill: "#60a5fa", stroke: "#1d4ed8", r: 1.14 },
  Mn: { fill: "#a78bfa", stroke: "#5b21b6", r: 1.14 },
  Fe: { fill: "#ea580c", stroke: "#7c2d12", r: 1.14 },
  Co: { fill: "#f472b6", stroke: "#9d174d", r: 1.12 },
  Ni: { fill: "#4ade80", stroke: "#166534", r: 1.10 },
  Cu: { fill: "#d97706", stroke: "#78350f", r: 1.10 },
  Zn: { fill: "#818cf8", stroke: "#3730a3", r: 1.08 },
  Ga: { fill: "#c084fc", stroke: "#6b21a8", r: 1.12 },
  Ge: { fill: "#2dd4bf", stroke: "#115e59", r: 1.12 },
  As: { fill: "#c084fc", stroke: "#581c87", r: 1.08 },
  Mo: { fill: "#9b7b9b", stroke: "#4a2c4a", r: 1.26 },
  W:  { fill: "#38bdf8", stroke: "#075985", r: 1.28 },
  Nb: { fill: "#67e8f9", stroke: "#155e75", r: 1.26 },
  Ta: { fill: "#60a5fa", stroke: "#1e3a8a", r: 1.26 },
  Pt: { fill: "#cbd5e1", stroke: "#475569", r: 1.24 },
  Au: { fill: "#fbbf24", stroke: "#92400e", r: 1.24 },
  K:  { fill: "#a855f7", stroke: "#581c87", r: 1.32 },
  Na: { fill: "#8b5cf6", stroke: "#4c1d95", r: 1.22 },
  Li: { fill: "#c084fc", stroke: "#6b21a8", r: 1.05 }
};

const POST_DATA_COV_RAD = {
  H: 0.31, B: 0.84, C: 0.76, N: 0.71, O: 0.66, F: 0.57,
  Si: 1.11, P: 1.07, S: 1.05, Se: 1.20, Te: 1.38,
  Ti: 1.60, V: 1.53, Cr: 1.39, Mn: 1.39, Fe: 1.32, Co: 1.26, Ni: 1.24, Cu: 1.32, Zn: 1.22,
  Ga: 1.22, Ge: 1.20, As: 1.19, Mo: 1.54, W: 1.62, Nb: 1.64, Ta: 1.70, Pt: 1.36, Au: 1.36,
  K: 2.03, Na: 1.66, Li: 1.28
};

window.POST_DATA_STATE = {
  items: [],            // [{ id, filename, xRaw, xVal, enabled, crystal, rawText }]
  hiddenSeries: new Set(),
  customLayerPairs: [], // [{ idxA, idxB }] — any two atomic layers (e.g. L1-L3 Se-S)
  customPairs: [],      // [{ aIdx, bIdx, label }] — custom 3D bond atom pairs
  lastResult: null,
  hoverInfo: null,
  dragBound: false
};

// ---------------- Math & Crystallography Helpers ----------------

function _pdCross(a, b) {
  return [a[1]*b[2] - a[2]*b[1], a[2]*b[0] - a[0]*b[2], a[0]*b[1] - a[1]*b[0]];
}
function _pdDot(a, b) { return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]; }
function _pdNorm(a) { return Math.sqrt(a[0]*a[0] + a[1]*a[1] + a[2]*a[2]); }
function _pdMod1(v) { const r = v - Math.floor(v); return r >= 0.999999 ? 0 : r; }

function _pdFracToCart(u, v, w, vecs) {
  return [
    u * vecs[0][0] + v * vecs[1][0] + w * vecs[2][0],
    u * vecs[0][1] + v * vecs[1][1] + w * vecs[2][1],
    u * vecs[0][2] + v * vecs[1][2] + w * vecs[2][2]
  ];
}

function _pdMinImageDist(a1, a2, vecs) {
  // Exact 3x3x3 periodic minimum image Cartesian distance (Å)
  const du0 = a2.x - a1.x, dv0 = a2.y - a1.y, dw0 = a2.z - a1.z;
  let best = Infinity;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      for (let k = -1; k <= 1; k++) {
        const c = _pdFracToCart(du0 + i, dv0 + j, dw0 + k, vecs);
        const d2 = c[0]*c[0] + c[1]*c[1] + c[2]*c[2];
        if (d2 < best) best = d2;
      }
    }
  }
  return Math.sqrt(best);
}

// ---------------- Smart Filename -> X Parameter Parser (LCP-Aware) ----------------

const POST_DATA_EXT_RE = /\.(cif|cell|xsd|castep|msi|car|vasp|xyz|extxyz)$/i;
const POST_DATA_VASP_NAME_RE = /^(poscar|contcar)([._-].*)?$/i;

function _pdIsSupportedStructureFile(filename) {
  const base = String(filename || "").replace(/^.*[\\/]/, "").trim();
  return POST_DATA_EXT_RE.test(base) || POST_DATA_VASP_NAME_RE.test(base);
}

function _pdStripStructureExt(name) {
  return String(name || "").replace(POST_DATA_EXT_RE, "").trim();
}

function _pdLongestCommonPrefix(strs) {
  if (!strs || strs.length < 2) return "";
  let pref = strs[0];
  for (let i = 1; i < strs.length; i++) {
    let j = 0;
    const s = strs[i];
    const maxL = Math.min(pref.length, s.length);
    while (j < maxL && pref[j] === s[j]) j++;
    pref = pref.slice(0, j);
    if (!pref) break;
  }
  // Never cut inside a signed number token (e.g. if all files start with "E-0.")
  pref = pref.replace(/[+-]?\d*\.?\d*$/, (m) => {
    if (!m) return "";
    if (strs.some(s => s === pref)) return m;
    return "";
  });
  return pref;
}

function _pdInferBatchXValues(filenames, relPaths = null, parsedItems = null) {
  const baseStems = filenames.map(fn => _pdStripStructureExt(String(fn || "").replace(/^.*[\\/]/, "")));
  // If multiple files share identical basenames (e.g. E_-0.5/Band-DOS.cell, E_0/Band-DOS.cell), use relative paths!
  const uniqueBases = new Set(baseStems.map(s => s.toLowerCase()));
  const useRel = Array.isArray(relPaths) && relPaths.length === filenames.length &&
    uniqueBases.size < filenames.length && relPaths.some(p => /[\\/]/.test(String(p || "")));
  const stems = useRel
    ? relPaths.map(p => _pdStripStructureExt(String(p || "").replace(/\\/g, "/")))
    : baseStems;

  const lcp = _pdLongestCommonPrefix(stems);
  const out = [];
  let parsedNumericCount = 0;

  for (let i = 0; i < stems.length; i++) {
    const stem = stems[i];
    const suf = lcp ? stem.slice(lcp.length).trim() : stem;
    let val = null;

    if (!suf || /^(pristine|zero|ref|orig|initial|0+|none|no[\s_-]*e|ef0)$/i.test(suf)) {
      val = 0.0;
      parsedNumericCount++;
    } else {
      const cleaned = suf.replace(/^[_\-\s=:,/]+(?=[+-]?\d)/, (m) => (m.endsWith("-") ? "-" : ""));
      const mAll = cleaned.match(/[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g);
      if (mAll && mAll.length) {
        val = parseFloat(mAll[mAll.length - 1]);
        parsedNumericCount++;
      } else {
        const mStem = stem.match(/[+-]?\d+(?:\.\d+)?/g);
        if (mStem && mStem.length) {
          val = parseFloat(mStem[mStem.length - 1]);
          parsedNumericCount++;
        }
      }
    }
    out.push(isFinite(val) ? val : null);
  }

  // Fallback / enrichment: if CASTEP .cell / .castep files have varying embedded EXTERNAL_EFIELD values
  // and filename parsing couldn't distinguish them, use the exact embedded E-field component!
  if (Array.isArray(parsedItems) && parsedItems.length === filenames.length) {
    const eVals = parsedItems.map(p => (p?.crystal && isFinite(p.crystal.efieldVal)) ? p.crystal.efieldVal : null);
    const nonNullE = eVals.filter(v => v !== null);
    const uniqueOut = new Set(out.filter(v => v !== null).map(v => Number(v).toFixed(6)));
    const uniqueE = new Set(nonNullE.map(v => Number(v).toFixed(6)));
    if (nonNullE.length === filenames.length && uniqueE.size > 1 && uniqueOut.size < Math.min(2, filenames.length)) {
      return eVals.map(v => Number(v.toFixed(6)));
    }
    for (let i = 0; i < out.length; i++) {
      if (out[i] === null && eVals[i] !== null) out[i] = Number(eVals[i].toFixed(6));
    }
  }

  return out.map((v, idx) => (isFinite(v) && v !== null) ? v : idx);
}

// ---------------- Multi-Format Crystal Structure Parsers ----------------
// Supports: *.cif, CASTEP *.cell, Materials Studio *.xsd (with full SpaceGroup symmetry expansion),
// CASTEP *.castep (Final Configuration), Materials Studio *.msi & *.car, VASP POSCAR/CONTCAR, *.xyz

function _pdInvert3x3(m) {
  const a = m[0][0], b = m[0][1], c = m[0][2];
  const d = m[1][0], e = m[1][1], f = m[1][2];
  const g = m[2][0], h = m[2][1], k = m[2][2];
  const det = a*(e*k - f*h) - b*(d*k - f*g) + c*(d*h - e*g);
  if (Math.abs(det) < 1e-12) return [[1,0,0],[0,1,0],[0,0,1]];
  const inv = 1 / det;
  return [
    [(e*k - f*h)*inv, (c*h - b*k)*inv, (b*f - c*e)*inv],
    [(f*g - d*k)*inv, (a*k - c*g)*inv, (c*d - a*f)*inv],
    [(d*h - e*g)*inv, (b*g - a*h)*inv, (a*e - b*d)*inv]
  ];
}

function _pdCartToFrac(x, y, z, vecs) {
  // vecs rows are a, b, c -> cart = [u,v,w] * vecs => [u,v,w] = cart * inv(vecs)
  const inv = _pdInvert3x3(vecs);
  return [
    x * inv[0][0] + y * inv[1][0] + z * inv[2][0],
    x * inv[0][1] + y * inv[1][1] + z * inv[2][1],
    x * inv[0][2] + y * inv[1][2] + z * inv[2][2]
  ];
}

function _pdVectorsToParams(vecs) {
  if (typeof castepVectorsToParams === "function") return castepVectorsToParams(vecs);
  const a = _pdNorm(vecs[0]), b = _pdNorm(vecs[1]), c = _pdNorm(vecs[2]);
  const clamp = v => Math.max(-1, Math.min(1, v));
  const rad2deg = 180 / Math.PI;
  const alpha = Math.acos(clamp(_pdDot(vecs[1], vecs[2]) / Math.max(1e-12, b * c))) * rad2deg;
  const beta  = Math.acos(clamp(_pdDot(vecs[0], vecs[2]) / Math.max(1e-12, a * c))) * rad2deg;
  const gamma = Math.acos(clamp(_pdDot(vecs[0], vecs[1]) / Math.max(1e-12, a * b))) * rad2deg;
  return { a, b, c, alpha, beta, gamma };
}

function _pdParamsToVectors(a, b, c, alpha, beta, gamma) {
  if (typeof castepParamsToVectors === "function") return castepParamsToVectors(a, b, c, alpha, beta, gamma);
  const d2r = Math.PI / 180;
  const al = alpha * d2r, be = beta * d2r, ga = gamma * d2r;
  const cosA = Math.cos(al), cosB = Math.cos(be), cosG = Math.cos(ga), sinG = Math.sin(ga) || 1;
  const cx = c * cosB;
  const cy = c * (cosA - cosB * cosG) / sinG;
  const cz = Math.sqrt(Math.max(1e-12, c * c - cx * cx - cy * cy));
  return [[a, 0, 0], [b * cosG, b * sinG, 0], [cx, cy, cz]];
}

function _pdCleanElement(raw) {
  if (typeof castepCleanElement === "function") return castepCleanElement(raw);
  const m = String(raw || "").trim().match(/^([A-Z][a-z]?)/);
  return m ? m[1] : "X";
}

function _pdComputeFormula(atoms) {
  if (typeof castepComputeFormula === "function") return castepComputeFormula(atoms);
  const counts = {};
  (atoms || []).forEach(a => { const e = a.element || "X"; counts[e] = (counts[e] || 0) + 1; });
  return Object.entries(counts).map(([e, n]) => n > 1 ? `${e}${n}` : e).join("") || "Unknown";
}

function _pdNormalizeCrystal(raw, formatTag, filename, extra = {}) {
  if (!raw || !Array.isArray(raw.atoms) || raw.atoms.length < 2) return null;
  const vecs = raw.vectors || (raw.a ? _pdParamsToVectors(raw.a, raw.b, raw.c, raw.alpha || 90, raw.beta || 90, raw.gamma || 90) : null);
  if (!vecs || vecs.length !== 3) return null;
  const lat = raw.lattice || (isFinite(raw.a) ? { a: raw.a, b: raw.b, c: raw.c, alpha: raw.alpha, beta: raw.beta, gamma: raw.gamma } : _pdVectorsToParams(vecs));
  const vol = Math.abs(_pdDot(vecs[0], _pdCross(vecs[1], vecs[2])));
  const elCount = {};
  const atoms = raw.atoms.map(at => {
    const el = _pdCleanElement(at.element || at.label || "X");
    elCount[el] = (elCount[el] || 0) + 1;
    return {
      element: el,
      label: at.label || `${el}${elCount[el]}`,
      x: Number(at.x),
      y: Number(at.y),
      z: Number(at.z)
    };
  }).filter(a => isFinite(a.x) && isFinite(a.y) && isFinite(a.z));
  if (atoms.length < 2) return null;
  const formula = (raw.formula && raw.formula !== "Unknown") ? raw.formula : _pdComputeFormula(atoms);
  return {
    filename,
    format: formatTag,
    formula,
    a: lat.a, b: lat.b, c: lat.c,
    alpha: lat.alpha, beta: lat.beta, gamma: lat.gamma,
    volume: vol,
    vectors: vecs,
    natoms: atoms.length,
    atoms,
    efieldVal: isFinite(extra.efieldVal) ? extra.efieldVal : null
  };
}

function _pdExpandXsdSymmetry(xsdText, baseAtoms) {
  // Materials Studio .xsd stores asymmetric atoms inside <IdentityMapping> and 3x4 affine fractional ops in <SpaceGroup Operators="..."/>
  const sgMatch = String(xsdText || "").match(/<SpaceGroup\b([^>]+)>/i);
  if (!sgMatch) return baseAtoms;
  const opsM = sgMatch[1].match(/Operators="([^"]+)"/i);
  if (!opsM || !opsM[1]) return baseAtoms;
  const opStrs = opsM[1].split(":").map(s => s.trim()).filter(Boolean);
  if (opStrs.length <= 1) return baseAtoms;

  const ops = opStrs.map(s => s.split(",").map(Number)).filter(arr => arr.length === 12 && arr.every(isFinite));
  if (ops.length <= 1) return baseAtoms;

  const expanded = [];
  const elCounter = {};
  const distMod1 = (a, b) => {
    let d = Math.abs(_pdMod1(a) - _pdMod1(b));
    return d > 0.5 ? 1 - d : d;
  };

  baseAtoms.forEach(at => {
    const u0 = _pdMod1(at.x), v0 = _pdMod1(at.y), w0 = _pdMod1(at.z);
    ops.forEach((op, oi) => {
      const u = _pdMod1(op[0]*u0 + op[1]*v0 + op[2]*w0 + op[3]);
      const v = _pdMod1(op[4]*u0 + op[5]*v0 + op[6]*w0 + op[7]);
      const w = _pdMod1(op[8]*u0 + op[9]*v0 + op[10]*w0 + op[11]);
      const exists = expanded.some(ex =>
        ex.element === at.element &&
        distMod1(ex.x, u) < 1.5e-3 &&
        distMod1(ex.y, v) < 1.5e-3 &&
        distMod1(ex.z, w) < 1.5e-3
      );
      if (!exists) {
        elCounter[at.element] = (elCounter[at.element] || 0) + 1;
        expanded.push({
          ...at,
          label: (oi === 0 && at.label) ? at.label : `${at.element}${elCounter[at.element]}`,
          x: u, y: v, z: w
        });
      }
    });
  });
  return expanded.length >= baseAtoms.length ? expanded : baseAtoms;
}

function _pdExtractCastepCellEfield(cellText) {
  const m = String(cellText || "").match(/%BLOCK\s+EXTERNAL_EFIELD\s*\n([\s\S]*?)%ENDBLOCK\s+EXTERNAL_EFIELD/i);
  if (!m) return null;
  const rows = m[1].split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith("#") && !l.startsWith("!"));
  for (const r of rows) {
    const nums = r.split(/\s+/).map(Number).filter(isFinite);
    if (nums.length >= 3) {
      // Pick dominant component (typically Ez along stacking axis c)
      let best = nums[2];
      if (Math.abs(nums[0]) > Math.abs(best)) best = nums[0];
      if (Math.abs(nums[1]) > Math.abs(best)) best = nums[1];
      return Math.abs(best) < 1e-9 ? 0 : best;
    }
  }
  return null;
}

function _pdParseCastepOutputCrystal(castepText, filename) {
  const txt = String(castepText || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  // Find LAST Real Lattice(A) block (captures final optimized cell in GeomOpt!)
  const latMatches = [...txt.matchAll(/Real Lattice\(A\)[^\n]*\n([^\n]+)\n([^\n]+)\n([^\n]+)/gi)];
  if (!latMatches.length) return null;
  const lastLat = latMatches[latMatches.length - 1];
  const vecs = [1, 2, 3].map(idx => {
    const nums = lastLat[idx].trim().split(/\s+/).map(Number).filter(isFinite);
    return nums.length >= 3 ? [nums[0], nums[1], nums[2]] : null;
  });
  if (vecs.some(v => !v)) return null;

  // Find LAST Cell Contents fractional coordinates table (Final Configuration if GeomOpt!)
  const cellMatches = [...txt.matchAll(/Element\s+Atom\s+Fractional coordinates of atoms[\s\S]*?x-+x\n([\s\S]*?)x{20,}/gi)];
  if (!cellMatches.length) return null;
  const lastAtomsBlock = cellMatches[cellMatches.length - 1][1];
  const atoms = [];
  lastAtomsBlock.split("\n").forEach(line => {
    const m = line.match(/x\s+([A-Za-z]{1,2})\s+(\d+)\s+([+-]?\d+\.\d+)\s+([+-]?\d+\.\d+)\s+([+-]?\d+\.\d+)\s+x/);
    if (m) {
      atoms.push({
        element: _pdCleanElement(m[1]),
        label: `${_pdCleanElement(m[1])}${m[2]}`,
        x: parseFloat(m[3]),
        y: parseFloat(m[4]),
        z: parseFloat(m[5])
      });
    }
  });
  if (atoms.length < 2) return null;
  return _pdNormalizeCrystal({ vectors: vecs, atoms }, "CASTEP", filename);
}

function _pdParseMsiCrystal(msiText, filename) {
  // Materials Studio .msi text format: (A D A3 (x y z)), (A D B3 ...), (A D C3 ...), and Atom objects with ACL & XYZ
  const txt = String(msiText || "");
  const getVec = (tag) => {
    const m = txt.match(new RegExp(`\\(A\\s+D\\s+${tag}\\s+\\(\\s*([+-]?[\\d.eE+-]+)\\s+([+-]?[\\d.eE+-]+)\\s+([+-]?[\\d.eE+-]+)\\s*\\)\\s*\\)`, "i"));
    return m ? [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])] : null;
  };
  const vA = getVec("A3"), vB = getVec("B3"), vC = getVec("C3");
  if (!vA || !vB || !vC) return null;
  const vecs = [vA, vB, vC];
  const atoms = [];
  const atomBlocks = txt.split(/\(\d+\s+Atom\b/i).slice(1);
  atomBlocks.forEach((blk, idx) => {
    const aclM = blk.match(/\(A\s+C\s+ACL\s+"([^"]+)"\)/i);
    const xyzM = blk.match(/\(A\s+D\s+XYZ\s+\(\s*([+-]?[\d.eE+-]+)\s+([+-]?[\d.eE+-]+)\s+([+-]?[\d.eE+-]+)\s*\)\)/i);
    if (!aclM || !xyzM) return;
    const aclParts = aclM[1].trim().split(/\s+/);
    const el = _pdCleanElement(aclParts[aclParts.length - 1]);
    const lblM = blk.match(/\(A\s+C\s+Label\s+"([^"]+)"\)/i);
    const frac = _pdCartToFrac(parseFloat(xyzM[1]), parseFloat(xyzM[2]), parseFloat(xyzM[3]), vecs);
    atoms.push({ element: el, label: lblM ? lblM[1] : `${el}${idx + 1}`, x: frac[0], y: frac[1], z: frac[2] });
  });
  return _pdNormalizeCrystal({ vectors: vecs, atoms }, "MSI", filename);
}

function _pdParseCarCrystal(carText, filename) {
  // Materials Studio .car format: PBC a b c alpha beta gamma ... followed by atom lines (name x y z ... element)
  const lines = String(carText || "").replace(/\r\n/g, "\n").split("\n");
  let vecs = null;
  const atoms = [];
  for (const raw of lines) {
    const l = raw.trim();
    if (!l || l.startsWith("!") || l.startsWith("BIOSYM") || l.startsWith("PBC=ON") || l.startsWith("end")) continue;
    if (/^PBC\s+/i.test(l)) {
      const nums = l.replace(/^PBC\s+/i, "").split(/\s+/).map(Number).filter(isFinite);
      if (nums.length >= 6) vecs = _pdParamsToVectors(nums[0], nums[1], nums[2], nums[3], nums[4], nums[5]);
      continue;
    }
    const p = l.split(/\s+/);
    if (p.length >= 8 && isFinite(Number(p[1])) && isFinite(Number(p[2])) && isFinite(Number(p[3]))) {
      const el = _pdCleanElement(p[7]);
      const cx = parseFloat(p[1]), cy = parseFloat(p[2]), cz = parseFloat(p[3]);
      atoms.push({ element: el, label: p[0], cx, cy, cz });
    }
  }
  if (!vecs || atoms.length < 2) return null;
  const fracAtoms = atoms.map(a => {
    const f = _pdCartToFrac(a.cx, a.cy, a.cz, vecs);
    return { element: a.element, label: a.label, x: f[0], y: f[1], z: f[2] };
  });
  return _pdNormalizeCrystal({ vectors: vecs, atoms: fracAtoms }, "CAR", filename);
}

function _pdParsePoscarCrystal(posText, filename) {
  const lines = String(posText || "").replace(/\r\n/g, "\n").split("\n").map(l => l.trim());
  if (lines.length < 8) return null;
  const scale = parseFloat(lines[1]);
  if (!isFinite(scale) || scale === 0) return null;
  const vecs = [2, 3, 4].map(i => lines[i].split(/\s+/).slice(0, 3).map(v => parseFloat(v) * Math.abs(scale)));
  if (vecs.some(r => r.length < 3 || r.some(v => !isFinite(v)))) return null;
  if (scale < 0) {
    const vol = Math.abs(_pdDot(vecs[0], _pdCross(vecs[1], vecs[2])));
    const fac = Math.cbrt(Math.abs(scale) / Math.max(1e-12, vol));
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) vecs[i][j] *= fac;
  }
  let idx = 5;
  let symbols = [];
  const tok5 = lines[idx].split(/\s+/).filter(Boolean);
  if (tok5.every(t => /^[A-Za-z]{1,2}$/.test(t))) {
    symbols = tok5.map(_pdCleanElement);
    idx++;
  }
  const counts = (lines[idx] || "").split(/\s+/).map(Number).filter(n => Number.isInteger(n) && n > 0);
  if (!counts.length) return null;
  idx++;
  if (!symbols.length) symbols = counts.map((_, k) => `X${k + 1}`);
  if (/^s/i.test(lines[idx] || "")) idx++; // Selective dynamics
  const coordMode = (lines[idx] || "Direct").trim().toLowerCase();
  const isCart = coordMode.startsWith("c") || coordMode.startsWith("k");
  idx++;
  const atoms = [];
  for (let s = 0; s < counts.length; s++) {
    const el = symbols[s] || "X";
    for (let k = 0; k < counts[s] && idx < lines.length; k++, idx++) {
      const p = (lines[idx] || "").split(/\s+/).map(Number);
      if (p.length < 3 || !isFinite(p[0])) continue;
      let f = [p[0], p[1], p[2]];
      if (isCart) f = _pdCartToFrac(p[0] * Math.abs(scale), p[1] * Math.abs(scale), p[2] * Math.abs(scale), vecs);
      atoms.push({ element: el, label: `${el}${k + 1}`, x: f[0], y: f[1], z: f[2] });
    }
  }
  return _pdNormalizeCrystal({ vectors: vecs, atoms }, "VASP", filename);
}

function _pdParseXyzCrystal(xyzText, filename) {
  const lines = String(xyzText || "").replace(/\r\n/g, "\n").split("\n").map(l => l.trim()).filter(Boolean);
  if (lines.length < 4) return null;
  const nAtoms = parseInt(lines[0], 10);
  if (!isFinite(nAtoms) || nAtoms < 2) return null;
  const comment = lines[1] || "";
  let vecs = null;
  const latM = comment.match(/Lattice="([^"]+)"/i);
  if (latM) {
    const n = latM[1].trim().split(/\s+/).map(Number).filter(isFinite);
    if (n.length >= 9) vecs = [[n[0], n[1], n[2]], [n[3], n[4], n[5]], [n[6], n[7], n[8]]];
  }
  const cartAtoms = [];
  for (let i = 2; i < Math.min(lines.length, 2 + nAtoms); i++) {
    const p = lines[i].split(/\s+/);
    if (p.length >= 4 && isFinite(Number(p[1]))) {
      cartAtoms.push({ element: _pdCleanElement(p[0]), cx: parseFloat(p[1]), cy: parseFloat(p[2]), cz: parseFloat(p[3]) });
    }
  }
  if (cartAtoms.length < 2) return null;
  if (!vecs) {
    // Non-periodic XYZ fallback: wrap inside generous orthogonal box
    const xs = cartAtoms.map(a => a.cx), ys = cartAtoms.map(a => a.cy), zs = cartAtoms.map(a => a.cz);
    const pad = 12.0;
    vecs = [
      [Math.max(10, Math.max(...xs) - Math.min(...xs) + pad), 0, 0],
      [0, Math.max(10, Math.max(...ys) - Math.min(...ys) + pad), 0],
      [0, 0, Math.max(12, Math.max(...zs) - Math.min(...zs) + pad)]
    ];
  }
  const atoms = cartAtoms.map((a, i) => {
    const f = _pdCartToFrac(a.cx, a.cy, a.cz, vecs);
    return { element: a.element, label: `${a.element}${i + 1}`, x: f[0], y: f[1], z: f[2] };
  });
  return _pdNormalizeCrystal({ vectors: vecs, atoms }, "XYZ", filename);
}

function parsePostDataStructureFile(text, filename) {
  const base = String(filename || "").replace(/^.*[\\/]/, "").trim();
  const low = base.toLowerCase();
  if (low.endsWith(".cif")) {
    if (typeof parseCifFullCrystal !== "function") return null;
    const c = parseCifFullCrystal(text, base);
    return _pdNormalizeCrystal(c, "CIF", base);
  }
  if (low.endsWith(".cell")) {
    const ef = _pdExtractCastepCellEfield(text);
    const parsed = (typeof parseCastepCellText === "function") ? parseCastepCellText(text, base) : null;
    return _pdNormalizeCrystal(parsed, "CELL", base, { efieldVal: ef });
  }
  if (low.endsWith(".xsd")) {
    const parsed = (typeof parseMaterialsStudioXsd === "function") ? parseMaterialsStudioXsd(text, base) : null;
    if (!parsed || !parsed.atoms?.length) return null;
    const fullAtoms = _pdExpandXsdSymmetry(text, parsed.atoms);
    return _pdNormalizeCrystal({ ...parsed, atoms: fullAtoms, formula: _pdComputeFormula(fullAtoms) }, "XSD", base);
  }
  if (low.endsWith(".castep")) {
    return _pdParseCastepOutputCrystal(text, base);
  }
  if (low.endsWith(".msi")) {
    return _pdParseMsiCrystal(text, base);
  }
  if (low.endsWith(".car")) {
    return _pdParseCarCrystal(text, base);
  }
  if (low.endsWith(".vasp") || POST_DATA_VASP_NAME_RE.test(base)) {
    return _pdParsePoscarCrystal(text, base);
  }
  if (low.endsWith(".xyz") || low.endsWith(".extxyz")) {
    return _pdParseXyzCrystal(text, base);
  }
  return null;
}
window.parsePostDataStructureFile = parsePostDataStructureFile;

// ---------------- PBC Slab Unwrapping & Atomic Layer Clustering ----------------

function unwrapAndClusterCrystalLayers(crystal, axis = "c", layerTolA = 0.15, reverseOrder = false) {
  if (!crystal || !Array.isArray(crystal.atoms) || !crystal.atoms.length) return null;
  const vecs = crystal.vectors;
  const axIdx = axis === "a" ? 0 : (axis === "b" ? 1 : 2);
  const otherA = (axIdx + 1) % 3;
  const otherB = (axIdx + 2) % 3;

  // True perpendicular plane normal unit vector n_hat (handles non-orthogonal cells!)
  let nVec = _pdCross(vecs[otherA], vecs[otherB]);
  let nLen = _pdNorm(nVec);
  if (nLen < 1e-9) { nVec = [0, 0, 1]; nLen = 1; }
  if (_pdDot(nVec, vecs[axIdx]) < 0) nVec = [-nVec[0], -nVec[1], -nVec[2]];
  const nHat = [nVec[0] / nLen, nVec[1] / nLen, nVec[2] / nLen];
  const cellHeightA = Math.abs(_pdDot(vecs[axIdx], nHat)); // perpendicular repeat spacing along axis

  // 1) Find largest fractional gap along stacking axis (the vacuum gap) to unwrap PBC contiguously
  const fracCoords = crystal.atoms.map((a, idx) => {
    const f = axIdx === 0 ? a.x : (axIdx === 1 ? a.y : a.z);
    return { idx, f: _pdMod1(f) };
  }).sort((p, q) => p.f - q.f);

  let maxGap = -1, cutAfter = 0;
  for (let i = 0; i < fracCoords.length; i++) {
    const fCurr = fracCoords[i].f;
    const fNext = (i + 1 < fracCoords.length) ? fracCoords[i + 1].f : (fracCoords[0].f + 1.0);
    const gap = fNext - fCurr;
    if (gap > maxGap) {
      maxGap = gap;
      cutAfter = fCurr + 0.5 * gap; // Midpoint of largest vacuum gap
    }
  }
  const cutFrac = _pdMod1(cutAfter);

  // 2) Compute unwrapped fractional & Cartesian height h_A for every atom
  const unwrapped = crystal.atoms.map((a, idx) => {
    const u0 = _pdMod1(a.x), v0 = _pdMod1(a.y), w0 = _pdMod1(a.z);
    let fAxis = axIdx === 0 ? u0 : (axIdx === 1 ? v0 : w0);
    // Shift so cutFrac becomes the bottom (0) and the slab sits cleanly in (0, 1) without splitting
    let fShift = fAxis - cutFrac;
    if (fShift < 0) fShift += 1.0;
    const du = axIdx === 0 ? (fShift - u0) : 0;
    const dv = axIdx === 1 ? (fShift - v0) : 0;
    const dw = axIdx === 2 ? (fShift - w0) : 0;
    const cart = _pdFracToCart(u0 + du, v0 + dv, w0 + dw, vecs);
    const hA = _pdDot(cart, nHat);
    return {
      idx,
      element: a.element || "X",
      label: a.label || `${a.element || "X"}${idx + 1}`,
      u: u0, v: v0, w: w0,
      fUnwrapped: fShift,
      cart,
      hA
    };
  });

  // Sort along stacking axis: Default Top -> Bottom (descending hA, matches d1 at top!), or Bottom -> Top if reversed
  unwrapped.sort((a, b) => reverseOrder ? (a.hA - b.hA) : (b.hA - a.hA));

  // 3) Cluster consecutive atoms within layerTolA into atomic layers
  const tol = Math.max(0.01, Math.min(2.0, Number(layerTolA) || 0.15));
  const layers = [];
  unwrapped.forEach(at => {
    const prev = layers[layers.length - 1];
    if (prev && Math.abs(at.hA - prev.meanH) <= tol) {
      prev.atoms.push(at);
      prev.sumH += at.hA;
      prev.meanH = prev.sumH / prev.atoms.length;
      prev.minH = Math.min(prev.minH, at.hA);
      prev.maxH = Math.max(prev.maxH, at.hA);
    } else {
      layers.push({
        atoms: [at],
        sumH: at.hA,
        meanH: at.hA,
        minH: at.hA,
        maxH: at.hA
      });
    }
  });

  // Assign element composition label to each layer
  layers.forEach((L, li) => {
    const counts = {};
    L.atoms.forEach(at => { counts[at.element] = (counts[at.element] || 0) + 1; });
    const els = Object.keys(counts);
    L.layerIndex = li + 1;
    L.elements = els;
    L.elLabel = els.length === 1 ? els[0] : els.join("/");
    L.bucklingA = L.maxH - L.minH;
    L.atomLabels = L.atoms.map(a => a.label);
  });

  // 4) Interlayer spacings d_1, d_2, ..., d_{N-1} & total slab thickness
  const spacings = [];
  for (let i = 0; i < layers.length - 1; i++) {
    spacings.push({
      id: `d${i + 1}`,
      idx: i,
      fromLayer: layers[i],
      toLayer: layers[i + 1],
      pairName: `${layers[i].elLabel}–${layers[i + 1].elLabel}`,
      distA: Math.abs(layers[i].meanH - layers[i + 1].meanH)
    });
  }
  const totalThicknessA = layers.length >= 2 ? Math.abs(layers[0].meanH - layers[layers.length - 1].meanH) : 0;

  return {
    axis, axIdx, nHat, cellHeightA, maxGapA: maxGap * cellHeightA,
    unwrapped, layers, spacings, totalThicknessA
  };
}

// Auto-detect distinct nearest-neighbor bond pairs in reference crystal (for Bond Distance mode)
function detectReferenceBondPairs(crystal) {
  if (!crystal || !crystal.atoms?.length) return [];
  const atoms = crystal.atoms;
  const vecs = crystal.vectors;
  const pairs = [];
  for (let i = 0; i < atoms.length; i++) {
    for (let j = i + 1; j < atoms.length; j++) {
      const rA = POST_DATA_COV_RAD[atoms[i].element] || 1.25;
      const rB = POST_DATA_COV_RAD[atoms[j].element] || 1.25;
      const cut = (rA + rB) * 1.24;
      const d = _pdMinImageDist(atoms[i], atoms[j], vecs);
      if (d > 0.45 && d <= cut) {
        pairs.push({
          aIdx: i, bIdx: j,
          label: `${atoms[i].label || atoms[i].element + (i + 1)}–${atoms[j].label || atoms[j].element + (j + 1)}`,
          elPair: `${atoms[i].element}–${atoms[j].element}`,
          refDistA: d
        });
      }
    }
  }
  pairs.sort((x, y) => x.refDistA - y.refDistA);
  return pairs.slice(0, 12);
}

// ---------------- Batch Analyzer & Linear Slope Regression ----------------

function readPostDataOptions() {
  const str = (id, def) => document.getElementById(id)?.value || def;
  const num = (id, def) => {
    const v = parseFloat(document.getElementById(id)?.value);
    return isFinite(v) ? v : def;
  };
  const chk = (id, def) => {
    const el = document.getElementById(id);
    return el ? !!el.checked : def;
  };
  return {
    measureMode: str("pd-measure-mode", "interlayer"), // "interlayer" | "bonds"
    metricMode: str("pd-metric-mode", "delta"),        // "delta" | "abs" | "pct"
    fitMode: str("pd-fit-mode", "connect"),            // "connect" | "spline" | "poly1" | "poly2" | "poly3" | "poly4" | "smooth" | "scatter"
    axis: str("pd-stack-axis", "c"),                   // "c" | "b" | "a"
    order: str("pd-layer-order", "top_down"),          // "top_down" | "bottom_up"
    layerTolA: Math.max(0.01, Math.min(2.0, num("pd-layer-tol", 0.15))),
    xScale: num("pd-x-scale", 1.0) || 1.0,
    refItemId: str("pd-ref-select", "auto"),
    viewAxis: str("pd-schematic-view", "a"),           // "a" | "b" | "110"
    xAxisLabel: str("pd-xlabel-input", "Electric Field E (V/Å)"),
    showPairLegend: chk("pd-show-pair-legend", false),
    showZeroLines: chk("pd-show-zero-lines", true),
    showD0OnSchematic: chk("pd-show-d0-schematic", false)
  };
}

function _pdLinearFit(xs, ys) {
  const n = xs.length;
  if (n < 2) return { slope: 0, intercept: ys[0] || 0, r2: 1 };
  let mx = 0, my = 0;
  for (let i = 0; i < n; i++) { mx += xs[i]; my += ys[i]; }
  mx /= n; my /= n;
  let num = 0, denX = 0, denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx, dy = ys[i] - my;
    num += dx * dy; denX += dx * dx; denY += dy * dy;
  }
  const slope = denX > 1e-18 ? num / denX : 0;
  const intercept = my - slope * mx;
  const r2 = (denX > 1e-18 && denY > 1e-18) ? Math.min(1, (num * num) / (denX * denY)) : 1;
  return { slope, intercept, r2 };
}

// ---------------- Curve Fitting & Smooth Interpolation Engine (v164) ----------------
// Supports: Monotone Cubic Spline (PCHIP), Polynomial OLS (Deg 1..4), Gaussian Kernel Smooth

function _pdSolveLinearSystem(A, b) {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
    }
    if (Math.abs(M[piv][col]) < 1e-14) return null;
    if (piv !== col) { const tmp = M[col]; M[col] = M[piv]; M[piv] = tmp; }
    const diag = M[col][col];
    for (let c = col; c <= n; c++) M[col][c] /= diag;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = M[r][col];
      for (let c = col; c <= n; c++) M[r][c] -= f * M[col][c];
    }
  }
  return M.map(row => row[n]);
}

function _pdPolyFit(xs, ys, deg) {
  const n = xs.length;
  const d = Math.max(1, Math.min(deg, n - 1));
  if (n < 2) return { degree: 0, coeffs: [ys[0] || 0], r2: 1, evalAt: () => ys[0] || 0, eqText: "const" };

  // Center & normalize X -> u = (x - mx) / sx for numerical stability!
  let mx = 0;
  for (let i = 0; i < n; i++) mx += xs[i];
  mx /= n;
  let sx = 0;
  for (let i = 0; i < n; i++) sx += (xs[i] - mx) * (xs[i] - mx);
  sx = Math.sqrt(sx / n) || 1.0;

  const us = xs.map(x => (x - mx) / sx);
  const m = d + 1;
  const A = Array.from({ length: m }, () => new Array(m).fill(0));
  const b = new Array(m).fill(0);
  for (let i = 0; i < n; i++) {
    const p = [1];
    for (let k = 1; k <= 2 * d; k++) p.push(p[k - 1] * us[i]);
    for (let r = 0; r < m; r++) {
      b[r] += p[r] * ys[i];
      for (let c = 0; c < m; c++) A[r][c] += p[r + c];
    }
  }
  // Tiny ridge regularization only if near-singular
  for (let r = 0; r < m; r++) A[r][r] += 1e-12;
  const uCoeffs = _pdSolveLinearSystem(A, b);
  if (!uCoeffs) {
    const lf = _pdLinearFit(xs, ys);
    return {
      degree: 1,
      coeffs: [lf.intercept, lf.slope],
      r2: lf.r2,
      evalAt: x => lf.intercept + lf.slope * x,
      eqText: _pdFormatPolyEquation([lf.intercept, lf.slope])
    };
  }

  // Convert u-basis polynomial sum_k uCoeffs[k] * ((x - mx)/sx)^k back to exact x-basis coeffs[0..d]
  const xCoeffs = new Array(m).fill(0);
  const binom = (nn, kk) => {
    let res = 1;
    for (let j = 1; j <= kk; j++) res = res * (nn - j + 1) / j;
    return res;
  };
  for (let k = 0; k <= d; k++) {
    const ck = uCoeffs[k] / Math.pow(sx, k);
    for (let j = 0; j <= k; j++) {
      xCoeffs[j] += ck * binom(k, j) * Math.pow(-mx, k - j);
    }
  }

  const evalAt = (x) => {
    let val = 0;
    for (let k = d; k >= 0; k--) val = val * x + xCoeffs[k];
    return val;
  };

  let my = 0;
  for (let i = 0; i < n; i++) my += ys[i];
  my /= n;
  let ssRes = 0, ssTot = 0;
  for (let i = 0; i < n; i++) {
    const e = ys[i] - evalAt(xs[i]);
    ssRes += e * e;
    ssTot += (ys[i] - my) * (ys[i] - my);
  }
  const r2 = ssTot > 1e-18 ? Math.max(0, Math.min(1, 1 - ssRes / ssTot)) : 1;
  return { degree: d, coeffs: xCoeffs, r2, evalAt, eqText: _pdFormatPolyEquation(xCoeffs) };
}

function _pdFormatPolyEquation(coeffs) {
  if (!coeffs || !coeffs.length) return "—";
  const sup = ["", "", "²", "³", "⁴"];
  const fmtNum = (v) => {
    const av = Math.abs(v);
    if (av >= 10) return av.toFixed(2);
    if (av >= 0.1) return av.toFixed(3);
    if (av >= 0.001) return av.toFixed(4);
    return av.toExponential(2);
  };
  const terms = [];
  for (let k = coeffs.length - 1; k >= 0; k--) {
    const c = coeffs[k];
    if (!isFinite(c) || (Math.abs(c) < 1e-9 && coeffs.length > 1 && k > 0)) continue;
    const sign = c < 0 ? "−" : (terms.length ? "+" : "");
    const xPart = k === 0 ? "" : (k === 1 ? "x" : `x${sup[k] || "^" + k}`);
    terms.push(`${terms.length ? " " : ""}${sign}${terms.length ? " " : ""}${fmtNum(c)}${xPart}`);
  }
  return terms.length ? `y = ${terms.join("")}` : "y = 0";
}

function _pdBuildPchipCurve(xs, ys, nSamples = 220) {
  // Fritsch-Carlson Monotone Piecewise Cubic Hermite Interpolation (zero overshoot!)
  const n = xs.length;
  if (n < 2) return xs.map((x, i) => [x, ys[i]]);
  if (n === 2) return [[xs[0], ys[0]], [xs[1], ys[1]]];

  // Collapse any duplicate X points by averaging Y so spline denominators are strictly positive
  const ux = [], uy = [];
  for (let i = 0; i < n; i++) {
    if (ux.length && Math.abs(xs[i] - ux[ux.length - 1]) < 1e-9) {
      uy[uy.length - 1] = 0.5 * (uy[uy.length - 1] + ys[i]);
    } else {
      ux.push(xs[i]); uy.push(ys[i]);
    }
  }
  const m = ux.length;
  if (m < 2) return ux.map((x, i) => [x, uy[i]]);
  if (m === 2) return [[ux[0], uy[0]], [ux[1], uy[1]]];

  const h = [], delta = [];
  for (let i = 0; i < m - 1; i++) {
    h.push(ux[i + 1] - ux[i]);
    delta.push((uy[i + 1] - uy[i]) / h[i]);
  }
  const d = new Array(m).fill(0);
  // Interior slopes (weighted harmonic mean when slopes share sign)
  for (let i = 1; i < m - 1; i++) {
    if (delta[i - 1] * delta[i] > 0) {
      const w1 = 2 * h[i] + h[i - 1];
      const w2 = h[i] + 2 * h[i - 1];
      d[i] = (w1 + w2) / (w1 / delta[i - 1] + w2 / delta[i]);
    } else {
      d[i] = 0;
    }
  }
  // Endpoint slopes (non-centered 3-point shape-preserving)
  const endSlope = (h0, h1, del0, del1) => {
    let s = ((2 * h0 + h1) * del0 - h0 * del1) / (h0 + h1);
    if (s * del0 <= 0) return 0;
    if (del0 * del1 <= 0 && Math.abs(s) > Math.abs(3 * del0)) return 3 * del0;
    return s;
  };
  d[0] = endSlope(h[0], h[1], delta[0], delta[1]);
  d[m - 1] = endSlope(h[m - 2], h[m - 3], delta[m - 2], delta[m - 3]);

  const pts = [];
  const x0 = ux[0], x1 = ux[m - 1];
  const steps = Math.max(80, nSamples);
  let seg = 0;
  for (let s = 0; s <= steps; s++) {
    const x = x0 + (x1 - x0) * (s / steps);
    while (seg < m - 2 && x > ux[seg + 1]) seg++;
    const hi = h[seg];
    const t = Math.max(0, Math.min(1, (x - ux[seg]) / hi));
    const t2 = t * t, t3 = t2 * t;
    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + t;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;
    const y = h00 * uy[seg] + h10 * hi * d[seg] + h01 * uy[seg + 1] + h11 * hi * d[seg + 1];
    pts.push([x, y]);
  }
  return pts;
}

function _pdBuildKernelSmoothCurve(xs, ys, nSamples = 200) {
  const n = xs.length;
  if (n < 2) return xs.map((x, i) => [x, ys[i]]);
  const x0 = xs[0], x1 = xs[n - 1];
  const span = Math.max(1e-9, x1 - x0);
  // Adaptive Gaussian local-linear (LOESS-like) smooth with bandwidth 0.16 * span
  const bw = Math.max(span * 0.16, span / Math.max(2, n - 1) * 1.35);
  const evalAt = (xq) => {
    let sw = 0, swx = 0, swy = 0, swxx = 0, swxy = 0;
    for (let i = 0; i < n; i++) {
      const dx = xs[i] - xq;
      const u = dx / bw;
      const w = Math.exp(-0.5 * u * u);
      sw += w; swx += w * dx; swy += w * ys[i];
      swxx += w * dx * dx; swxy += w * dx * ys[i];
    }
    const det = sw * swxx - swx * swx;
    if (Math.abs(det) > 1e-14) return (swxx * swy - swx * swxy) / det;
    return sw > 1e-14 ? swy / sw : 0;
  };
  let my = 0;
  for (let i = 0; i < n; i++) my += ys[i];
  my /= n;
  let ssRes = 0, ssTot = 0;
  for (let i = 0; i < n; i++) {
    const e = ys[i] - evalAt(xs[i]);
    ssRes += e * e; ssTot += (ys[i] - my) * (ys[i] - my);
  }
  const r2 = ssTot > 1e-18 ? Math.max(0, Math.min(1, 1 - ssRes / ssTot)) : 1;
  const pts = [];
  for (let s = 0; s <= nSamples; s++) {
    const x = x0 + span * (s / nSamples);
    pts.push([x, evalAt(x)]);
  }
  return { pts, r2, evalAt };
}

function _pdComputeSeriesCurveFit(xs, ys, fitMode) {
  if (!xs.length) return { mode: fitMode, pts: [], r2: NaN, eqText: "—", label: "—" };
  if (fitMode === "scatter") {
    return { mode: "scatter", pts: [], r2: NaN, eqText: "Scatter only", label: "Scatter" };
  }
  if (fitMode === "connect" || xs.length < 2) {
    return { mode: "connect", pts: xs.map((x, i) => [x, ys[i]]), r2: NaN, eqText: "Point-to-point", label: "Connect" };
  }
  if (fitMode === "spline") {
    return { mode: "spline", pts: _pdBuildPchipCurve(xs, ys, 220), r2: 1.0, eqText: "Monotone Cubic Spline (PCHIP)", label: "Spline" };
  }
  if (fitMode === "smooth") {
    const sm = _pdBuildKernelSmoothCurve(xs, ys, 200);
    return { mode: "smooth", pts: sm.pts, r2: sm.r2, eqText: `Local Linear Smooth (R² = ${sm.r2.toFixed(4)})`, label: "Smooth" };
  }
  const degMap = { poly1: 1, poly2: 2, poly3: 3, poly4: 4 };
  const deg = degMap[fitMode] || 1;
  const pf = _pdPolyFit(xs, ys, deg);
  const x0 = xs[0], x1 = xs[xs.length - 1];
  const pts = [];
  const N = 220;
  for (let s = 0; s <= N; s++) {
    const x = x0 + (x1 - x0) * (s / N);
    pts.push([x, pf.evalAt(x)]);
  }
  return {
    mode: fitMode,
    degree: pf.degree,
    coeffs: pf.coeffs,
    pts,
    r2: pf.r2,
    eqText: pf.eqText,
    label: `Poly ${pf.degree}`
  };
}

function computePostDataAnalysis() {
  const opts = readPostDataOptions();
  const activeItems = (POST_DATA_STATE.items || [])
    .filter(it => it.enabled && it.crystal)
    .map(it => ({ ...it, xPlot: it.xVal * opts.xScale }))
    .sort((a, b) => a.xPlot - b.xPlot);

  if (!activeItems.length) return null;

  // Choose Reference Structure (explicit user choice OR structure closest to X = 0)
  let refItem = activeItems.find(it => it.id === opts.refItemId) || null;
  if (!refItem) {
    refItem = activeItems.reduce((best, cur) =>
      Math.abs(cur.xPlot) < Math.abs(best.xPlot) ? cur : best, activeItems[0]);
  }

  const reverseOrder = opts.order === "bottom_up";
  const refLayers = unwrapAndClusterCrystalLayers(refItem.crystal, opts.axis, opts.layerTolA, reverseOrder);
  if (!refLayers) return null;

  // Define tracked series descriptors
  let seriesDefs = [];
  if (opts.measureMode === "interlayer") {
    seriesDefs = refLayers.spacings.map((sp, idx) => ({
      id: sp.id,
      shortLabel: `d${idx + 1}`,
      sciLabel: `d_{${idx + 1}}`,
      pairName: sp.pairName,
      fullLabel: `d${idx + 1} (${sp.pairName})`,
      color: POST_DATA_PALETTE[idx % POST_DATA_PALETTE.length],
      refVal: sp.distA,
      kind: "interlayer",
      isCustom: false,
      idxA: idx,
      idxB: idx + 1,
      fromLayer: sp.fromLayer.layerIndex,
      toLayer: sp.toLayer.layerIndex
    }));

    // Append user-selected Custom Any-Two-Layer Distances (e.g. Se–S across L1–L3, or N–P across L1–L7)!
    const nLay = refLayers.layers.length;
    const seenCustom = new Set();
    (POST_DATA_STATE.customLayerPairs || []).forEach(cp => {
      const a = Math.min(cp.idxA, cp.idxB);
      const b = Math.max(cp.idxA, cp.idxB);
      if (a < 0 || b >= nLay || a >= b) return;
      const key = `${a}_${b}`;
      if (seenCustom.has(key)) return;
      seenCustom.add(key);
      const layA = refLayers.layers[a];
      const layB = refLayers.layers[b];
      const pairName = `${layA.elLabel}–${layB.elLabel}`;
      const cIdx = seriesDefs.length;
      seriesDefs.push({
        id: `L${a + 1}_${b + 1}`,
        shortLabel: `d${a + 1}-${b + 1}`,
        sciLabel: `d_{${a + 1}-${b + 1}}`,
        pairName,
        fullLabel: `d${a + 1}-${b + 1} (${pairName})`,
        color: POST_DATA_PALETTE[cIdx % POST_DATA_PALETTE.length],
        refVal: Math.abs(layA.meanH - layB.meanH),
        kind: "custom_layer",
        isCustom: true,
        idxA: a,
        idxB: b,
        fromLayer: layA.layerIndex,
        toLayer: layB.layerIndex
      });
    });
  } else {
    const autoPairs = detectReferenceBondPairs(refItem.crystal);
    const merged = [...autoPairs];
    (POST_DATA_STATE.customPairs || []).forEach(cp => {
      if (!merged.some(p => (p.aIdx === cp.aIdx && p.bIdx === cp.bIdx) || (p.aIdx === cp.bIdx && p.bIdx === cp.aIdx))) {
        const aA = refItem.crystal.atoms[cp.aIdx], aB = refItem.crystal.atoms[cp.bIdx];
        if (aA && aB) {
          merged.push({
            aIdx: cp.aIdx, bIdx: cp.bIdx,
            label: cp.label || `${aA.label}–${aB.label}`,
            elPair: `${aA.element}–${aB.element}`,
            refDistA: _pdMinImageDist(aA, aB, refItem.crystal.vectors)
          });
        }
      }
    });
    seriesDefs = merged.map((p, idx) => ({
      id: `b${idx + 1}`,
      shortLabel: `r${idx + 1}`,
      sciLabel: `r_{${idx + 1}}`,
      pairName: p.label,
      fullLabel: `r${idx + 1} (${p.label})`,
      color: POST_DATA_PALETTE[idx % POST_DATA_PALETTE.length],
      refVal: p.refDistA,
      kind: "bond",
      isCustom: idx >= autoPairs.length,
      aIdx: p.aIdx,
      bIdx: p.bIdx
    }));
  }

  // Evaluate EVERY structure cleanly!
  const refElSeq = refLayers.layers.map(l => l.elLabel).join("-");
  const rows = activeItems.map(it => {
    const lay = unwrapAndClusterCrystalLayers(it.crystal, opts.axis, opts.layerTolA, reverseOrder);
    // Check if an individual structure is inverted along stacking axis compared to reference (mirror element order)
    let useLay = lay;
    if (lay && lay.layers.length === refLayers.layers.length) {
      const elSeq = lay.layers.map(l => l.elLabel).join("-");
      const revSeq = [...lay.layers].reverse().map(l => l.elLabel).join("-");
      if (elSeq !== refElSeq && revSeq === refElSeq) {
        useLay = unwrapAndClusterCrystalLayers(it.crystal, opts.axis, opts.layerTolA, !reverseOrder);
      }
    }

    const absVals = {};
    const deltaVals = {};
    const pctVals = {};
    seriesDefs.forEach((sd, idx) => {
      let v = NaN;
      if (sd.kind === "interlayer") {
        if (useLay && useLay.spacings[idx]) v = useLay.spacings[idx].distA;
      } else if (sd.kind === "custom_layer") {
        if (useLay && useLay.layers[sd.idxA] && useLay.layers[sd.idxB]) {
          v = Math.abs(useLay.layers[sd.idxA].meanH - useLay.layers[sd.idxB].meanH);
        }
      } else {
        const aA = it.crystal.atoms[sd.aIdx], aB = it.crystal.atoms[sd.bIdx];
        if (aA && aB) v = _pdMinImageDist(aA, aB, it.crystal.vectors);
      }
      absVals[sd.id] = v;
      deltaVals[sd.id] = isFinite(v) && isFinite(sd.refVal) ? (v - sd.refVal) : NaN;
      pctVals[sd.id] = isFinite(v) && Math.abs(sd.refVal) > 1e-9 ? ((v - sd.refVal) / sd.refVal) * 100.0 : NaN;
    });

    const dTot = useLay ? useLay.totalThicknessA : NaN;
    return {
      id: it.id,
      filename: it.filename,
      xVal: it.xVal,
      xPlot: it.xPlot,
      isRef: it.id === refItem.id,
      formula: it.crystal.formula,
      a: it.crystal.a,
      b: it.crystal.b,
      c: it.crystal.c,
      nLayers: useLay ? useLay.layers.length : 0,
      totalThicknessA: dTot,
      deltaThicknessA: isFinite(dTot) ? (dTot - refLayers.totalThicknessA) : NaN,
      absVals, deltaVals, pctVals
    };
  });

  // Compute statistical summary, linear response slope dd_i/dX, AND active curve fit for each series!
  const seriesStats = seriesDefs.map(sd => {
    const valid = rows.filter(r => isFinite(r.absVals[sd.id]));
    const xs = valid.map(r => r.xPlot);
    const ysAbs = valid.map(r => r.absVals[sd.id]);
    const ysDel = valid.map(r => r.deltaVals[sd.id]);
    const ysPlot = valid.map(r =>
      opts.metricMode === "abs" ? r.absVals[sd.id] : (opts.metricMode === "pct" ? r.pctVals[sd.id] : r.deltaVals[sd.id])
    );
    const linFit = _pdLinearFit(xs, ysDel);
    const curveFit = _pdComputeSeriesCurveFit(xs, ysPlot, opts.fitMode);
    const minDel = ysDel.length ? Math.min(...ysDel) : 0;
    const maxDel = ysDel.length ? Math.max(...ysDel) : 0;
    const maxAbsDel = ysDel.length ? Math.max(...ysDel.map(Math.abs)) : 0;
    return {
      ...sd,
      nValid: valid.length,
      minAbs: ysAbs.length ? Math.min(...ysAbs) : NaN,
      maxAbs: ysAbs.length ? Math.max(...ysAbs) : NaN,
      minDel, maxDel, maxAbsDel,
      slope: linFit.slope,
      r2: linFit.r2,
      curveFit
    };
  });

  return {
    opts,
    refItem,
    refLayers,
    seriesDefs,
    seriesStats,
    rows,
    xMin: Math.min(...rows.map(r => r.xPlot)),
    xMax: Math.max(...rows.map(r => r.xPlot))
  };
}
window.computePostDataAnalysis = computePostDataAnalysis;

// ---------------- Publication-Grade Dual Canvas Renderer ----------------
// Left: OriginPro/Nature-quality Δd_i(E) plot with glossy 3D markers & bordered legend
// Right: Live Side-View Atomic Layer Schematic with CPK spheres, bonds, dashed planes & d1..dN labels!

function _pdDrawGlossySphere(ctx, x, y, r, fillHex, strokeHex) {
  ctx.save();
  const grad = ctx.createRadialGradient(x - r * 0.32, y - r * 0.34, r * 0.08, x, y, r);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(0.28, fillHex);
  grad.addColorStop(1, strokeHex || fillHex);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = strokeHex || "rgba(0,0,0,0.35)";
  ctx.lineWidth = Math.max(0.7, r * 0.10);
  ctx.stroke();
  ctx.restore();
}

function _pdDarkenHex(hex, factor = 0.55) {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex || "#333333");
  if (!m) return "#111111";
  const r = Math.round(parseInt(m[1], 16) * factor);
  const g = Math.round(parseInt(m[2], 16) * factor);
  const b = Math.round(parseInt(m[3], 16) * factor);
  return `rgb(${r},${g},${b})`;
}

function drawPostDataCanvas(res) {
  const canvas = document.getElementById("post-data-main-canvas");
  if (!canvas) return;
  const parentW = canvas.parentElement ? (canvas.parentElement.clientWidth - 24) : 960;
  const width = Math.max(580, Math.min(1260, Math.floor(parentW)));
  const height = 470;
  const dpr = (typeof getCastepCanvasDpr === "function") ? getCastepCanvasDpr(width, height) : Math.min(3, window.devicePixelRatio || 2);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.scale(dpr, dpr);
  if (typeof applyCrispCanvasQuality === "function") applyCrispCanvasQuality(ctx);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  if (!res || !res.rows.length) {
    ctx.fillStyle = "#334155";
    ctx.font = "700 15px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Load Multiple Optimized Crystal Structures to Analyze Interlayer & Atomic Distances", width / 2, height / 2 - 14);
    ctx.fillStyle = "#64748b";
    ctx.font = "12.5px Inter, sans-serif";
    ctx.fillText("Drop or select *.cif, CASTEP *.cell / *.castep, Materials Studio *.xsd / *.msi / *.car, POSCAR, or *.xyz files above.", width / 2, height / 2 + 12);
    canvas._subPanelRects = [];
    canvas._plotMeta = null;
    ctx.restore();
    return;
  }

  const st = (typeof getCastepPlotStyle === "function") ? getCastepPlotStyle() : {
    fontFamily: "'Times New Roman', Georgia, serif",
    inkColor: "#0f172a", titleSize: 15, axisLabelSize: 14, tickSize: 12, legendSize: 11.5,
    lineWidth: 1.8, tickDir: "out", tickLength: 5, boldAxisLabels: true
  };

  // Split canvas: Left 62% = Publication Line+Marker Plot; Right 38% = Live Atomic Layer Side-View Schematic
  const splitX = Math.round(width * 0.62);
  const padT = 36;
  const padB = 56;
  const padL = 74;
  const padRPlot = 22;
  const pw = Math.max(240, splitX - padL - padRPlot);
  const ph = height - padT - padB;
  const px = padL, py = padT;

  const metric = res.opts.metricMode;
  const isBond = res.opts.measureMode === "bonds";
  const sym = isBond ? "r" : "d";
  const yLabel = metric === "abs"
    ? (isBond ? "Bond Distance r (Å)" : "Interlayer Distance d (Å)")
    : (metric === "pct"
        ? (isBond ? "Relative Change Δr / r_{0} (%)" : "Relative Change Δd / d_{0} (%)")
        : (isBond ? "Bond Distance Change Δr (Å)" : "Interlayer Distance Change Δd (Å)"));

  const visibleSeries = res.seriesStats.filter(sd => !POST_DATA_STATE.hiddenSeries.has(sd.id));

  canvas._subPanelRects = [
    {
      key: "post_data_plot",
      label: isBond ? "Bond Distance vs. Parameter Plot" : "Interlayer Distance vs. Parameter Plot",
      x: 0, y: 0, w: splitX, h: height,
      plotKey: "post_data",
      pngName: `PostData_${isBond ? "Bond" : "Interlayer"}_Distances_Plot.png`,
      buildExactTable: () => buildPostDataPlotClipboardTable(res)
    },
    {
      key: "post_data_schematic",
      label: "Atomic Layer Side-View Schematic",
      x: splitX, y: 0, w: width - splitX, h: height,
      plotKey: "post_data",
      pngName: `PostData_${res.refItem.crystal.formula || "Crystal"}_Layer_Schematic.png`,
      buildExactTable: () => {
        const pkg = buildPostDataExportTables();
        return pkg ? { title: "Atomic Layer Slopes & Reference Spacings", headers: pkg.summarySheet.headers, rows: pkg.summarySheet.rows } : null;
      }
    }
  ];

  // ---------------- LEFT PANEL: OriginPro / Nature Publication Plot ----------------
  let xMin = res.xMin, xMax = res.xMax;
  if (Math.abs(xMax - xMin) < 1e-9) { xMin -= 1; xMax += 1; }
  const xPad = (xMax - xMin) * 0.06;
  const xLo = xMin - xPad, xHi = xMax + xPad;

  let yMin = Infinity, yMax = -Infinity;
  visibleSeries.forEach(sd => {
    res.rows.forEach(r => {
      const v = metric === "abs" ? r.absVals[sd.id] : (metric === "pct" ? r.pctVals[sd.id] : r.deltaVals[sd.id]);
      if (isFinite(v)) {
        if (v < yMin) yMin = v;
        if (v > yMax) yMax = v;
      }
    });
  });
  if (!isFinite(yMin) || !isFinite(yMax)) { yMin = -0.05; yMax = 0.05; }
  if (Math.abs(yMax - yMin) < 1e-6) { yMin -= 0.02; yMax += 0.02; }
  const ySpan = yMax - yMin;
  const yLo = yMin - ySpan * 0.10;
  const yHi = yMax + ySpan * 0.14;

  const toX = x => px + ((x - xLo) / (xHi - xLo)) * pw;
  const toY = y => py + ph - ((y - yLo) / (yHi - yLo)) * ph;

  // Nice tick generator (clean 1, 2, 5, 10 steps — never produces rounded duplicates!)
  const niceTicks = (lo, hi, targetN = 6) => {
    const rawStep = (hi - lo) / Math.max(2, targetN);
    const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const norm = rawStep / mag;
    let step = mag;
    if (norm <= 1.35) step = 1 * mag;
    else if (norm <= 3.0) step = 2 * mag;
    else if (norm <= 6.8) step = 5 * mag;
    else step = 10 * mag;
    const first = Math.ceil(lo / step - 1e-9) * step;
    const vals = [];
    for (let v = first; v <= hi + step * 1e-6; v += step) {
      vals.push(Math.abs(v) < step * 1e-6 ? 0 : Number(v.toPrecision(10)));
    }
    return { vals, step };
  };

  const xTickObj = niceTicks(xLo, xHi, 6);
  const yTickObj = niceTicks(yLo, yHi, 7);
  const xTicks = xTickObj.vals.map(toX);
  const yTicks = yTickObj.vals.map(toY);

  // Format chemical formula with subscripts (e.g. Si2MoP2N2 -> Si_{2}MoP_{2}N_{2})
  const fmtFormulaSci = (f) => String(f || "Crystal").replace(/([A-Za-z\)])(\d+)/g, "$1_{$2}");
  const formulaSci = fmtFormulaSci(res.refItem.crystal.formula);

  // Title
  ctx.fillStyle = st.inkColor;
  ctx.font = `700 ${st.titleSize}px ${st.fontFamily}`;
  ctx.textAlign = "center";
  const plotTitle = metric === "abs"
    ? `${formulaSci}: ${isBond ? "Bond Distances" : "Interlayer Spacings"} ${sym}_{i}`
    : (metric === "pct"
        ? `${formulaSci}: Relative ${isBond ? "Bond" : "Interlayer"} Strain Δ${sym}_{i}/${sym}_{0}`
        : `${formulaSci}: ${isBond ? "Bond" : "Interlayer"} Variation Δ${sym}_{i} = ${sym}_{i} − ${sym}_{i}(ref)`);
  if (typeof drawSciText === "function") drawSciText(ctx, plotTitle, px + pw / 2, py - 12);
  else ctx.fillText(plotTitle, px + pw / 2, py - 12);

  // Optional subtle grid
  if (typeof drawPubGridLines === "function") {
    drawPubGridLines(ctx, px, py, pw, ph, st, xTicks, yTicks);
  }

  ctx.save();
  ctx.beginPath(); ctx.rect(px, py, pw, ph); ctx.clip();

  // Zero reference guide lines
  if (res.opts.showZeroLines) {
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1.0;
    ctx.setLineDash([4, 3]);
    if (yLo < 0 && yHi > 0) {
      const y0 = Math.round(toY(0)) + 0.5;
      ctx.beginPath(); ctx.moveTo(px, y0); ctx.lineTo(px + pw, y0); ctx.stroke();
    }
    const xRef = res.refItem.xPlot;
    if (xRef > xLo && xRef < xHi) {
      const xr = Math.round(toX(xRef)) + 0.5;
      ctx.beginPath(); ctx.moveTo(xr, py); ctx.lineTo(xr, py + ph); ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  // Draw curves (connect / monotone spline / poly1..poly4 fit / kernel smooth / scatter) + glossy 3D circular markers!
  const fitMode = res.opts.fitMode || "connect";
  const isParamFit = /^poly[1-4]$/.test(fitMode) || fitMode === "smooth";
  const markerR = res.rows.length > 28 ? 3.8 : (res.rows.length > 16 ? 4.7 : 5.4);
  const plottedScreenPts = [];

  visibleSeries.forEach(sd => {
    const darkStroke = _pdDarkenHex(sd.color, 0.52);

    // 1) Draw connecting / smooth / fitted line curve (skipped in scatter-only mode)
    if (fitMode !== "scatter") {
      const curvePts = sd.curveFit && sd.curveFit.pts && sd.curveFit.pts.length >= 2
        ? sd.curveFit.pts
        : res.rows
            .map(r => [r.xPlot, metric === "abs" ? r.absVals[sd.id] : (metric === "pct" ? r.pctVals[sd.id] : r.deltaVals[sd.id])])
            .filter(p => isFinite(p[0]) && isFinite(p[1]));

      if (curvePts.length >= 2) {
        ctx.strokeStyle = sd.color;
        ctx.lineWidth = isParamFit ? Math.max(2.0, (st.lineWidth || 1.6) + 0.35) : Math.max(1.4, st.lineWidth || 1.6);
        ctx.beginPath();
        let started = false;
        curvePts.forEach(([xv, yv]) => {
          if (!isFinite(xv) || !isFinite(yv)) { started = false; return; }
          const cx = toX(xv), cy = toY(yv);
          if (!started) { ctx.moveTo(cx, cy); started = true; } else ctx.lineTo(cx, cy);
        });
        ctx.stroke();
      }
    }

    // 2) Draw glossy 3D circular markers at exact DFT data points
    res.rows.forEach(r => {
      const v = metric === "abs" ? r.absVals[sd.id] : (metric === "pct" ? r.pctVals[sd.id] : r.deltaVals[sd.id]);
      if (!isFinite(v)) return;
      const sxp = toX(r.xPlot), syp = toY(v);
      plottedScreenPts.push([sxp, syp]);
      _pdDrawGlossySphere(ctx, sxp, syp, markerR, sd.color, darkStroke);
    });
  });

  // Hover highlight vertical crosshair
  if (POST_DATA_STATE.hoverInfo && POST_DATA_STATE.hoverInfo.rowIdx >= 0) {
    const hr = res.rows[POST_DATA_STATE.hoverInfo.rowIdx];
    if (hr) {
      const hx = toX(hr.xPlot);
      ctx.strokeStyle = "rgba(15, 23, 42, 0.45)";
      ctx.lineWidth = 1.0;
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(hx, py); ctx.lineTo(hx, py + ph); ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  ctx.restore();

  // Crisp OriginPro outer axis frame + outward ticks
  const tickLen = 5;
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 1.25;
  ctx.strokeRect(px + 0.5, py + 0.5, pw, ph);
  ctx.beginPath();
  xTicks.forEach(tx => {
    ctx.moveTo(tx, py + ph); ctx.lineTo(tx, py + ph + tickLen);
    ctx.moveTo(tx, py); ctx.lineTo(tx, py + 3);
  });
  yTicks.forEach(ty => {
    ctx.moveTo(px, ty); ctx.lineTo(px - tickLen, ty);
    ctx.moveTo(px + pw, ty); ctx.lineTo(px + pw - 3, ty);
  });
  ctx.stroke();

  // Tick labels (exact decimal places derived from tick step — zero duplicate rounded labels!)
  const fmtTick = (v, step) => {
    const sClean = Number(step.toPrecision(4));
    const decStr = sClean.toFixed(6).replace(/0+$/, "");
    const dec = decStr.includes(".") ? Math.min(4, decStr.split(".")[1].length) : 0;
    const s = v.toFixed(dec);
    return (typeof formatPubMinus === "function") ? formatPubMinus(s) : s.replace("-", "−");
  };
  ctx.fillStyle = st.inkColor;
  ctx.font = `${st.tickSize}px ${st.fontFamily}`;
  xTickObj.vals.forEach((xv, i) => {
    ctx.textAlign = "center";
    ctx.fillText(fmtTick(xv, xTickObj.step), xTicks[i], py + ph + tickLen + st.tickSize + 2);
  });
  yTickObj.vals.forEach((yv, i) => {
    ctx.textAlign = "right";
    ctx.fillText(fmtTick(yv, yTickObj.step), px - tickLen - 4, yTicks[i] + st.tickSize * 0.34);
  });

  // Axis Labels
  ctx.font = `700 ${st.axisLabelSize}px ${st.fontFamily}`;
  ctx.textAlign = "center";
  if (typeof drawSciText === "function") drawSciText(ctx, res.opts.xAxisLabel, px + pw / 2, py + ph + tickLen + st.tickSize + st.axisLabelSize + 8);
  else ctx.fillText(res.opts.xAxisLabel, px + pw / 2, py + ph + tickLen + st.tickSize + st.axisLabelSize + 8);

  ctx.save();
  ctx.translate(px - 54, py + ph / 2);
  ctx.rotate(-Math.PI / 2);
  if (typeof drawSciText === "function") drawSciText(ctx, yLabel, 0, 0);
  else ctx.fillText(yLabel, 0, 0);
  ctx.restore();

  // OriginPro-Style Bordered Legend Box (Smart Collision-Free Corner Placement!)
  if (visibleSeries.length) {
    ctx.save();
    ctx.font = `600 ${Math.max(10.5, st.legendSize)}px ${st.fontFamily}`;
    const labels = visibleSeries.map(sd => {
      const base = (res.opts.showPairLegend || isBond || sd.kind === "custom_layer") ? sd.fullLabel : sd.shortLabel;
      if (isParamFit && sd.curveFit && isFinite(sd.curveFit.r2)) {
        return `${base} (R²=${sd.curveFit.r2.toFixed(3)})`;
      }
      return base;
    });
    const maxTxtW = Math.max(...labels.map(t => ctx.measureText(t).width));
    const legW = Math.min(pw * 0.56, maxTxtW + 44);
    const rowH = 17.5;
    const legH = visibleSeries.length * rowH + 10;

    // Score the 4 corners (TR, TL, BR, BL) to dodge plotted data curves automatically!
    const candidates = [
      { x: px + pw - legW - 7, y: py + 7 },              // Top-Right (preferred when clear)
      { x: px + 7, y: py + 7 },                          // Top-Left
      { x: px + pw - legW - 7, y: py + ph - legH - 7 },  // Bottom-Right
      { x: px + 7, y: py + ph - legH - 7 }               // Bottom-Left
    ];
    let bestCand = candidates[0], bestHits = Infinity;
    candidates.forEach(c => {
      let hits = 0;
      for (let i = 0; i < plottedScreenPts.length; i++) {
        const [sxP, syP] = plottedScreenPts[i];
        if (sxP >= c.x - 6 && sxP <= c.x + legW + 6 && syP >= c.y - 6 && syP <= c.y + legH + 6) hits++;
      }
      if (hits < bestHits) { bestHits = hits; bestCand = c; }
    });
    const legX = bestCand.x;
    const legY = bestCand.y;

    ctx.fillStyle = "rgba(255, 255, 255, 0.94)";
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 1.0;
    ctx.fillRect(legX, legY, legW, legH);
    ctx.strokeRect(legX, legY, legW, legH);
    ctx.textAlign = "left";
    visibleSeries.forEach((sd, i) => {
      const ly = legY + 13 + i * rowH;
      if (fitMode !== "scatter") {
        ctx.strokeStyle = sd.color;
        ctx.lineWidth = isParamFit ? 2.0 : 1.6;
        ctx.beginPath(); ctx.moveTo(legX + 7, ly - 3); ctx.lineTo(legX + 31, ly - 3); ctx.stroke();
      }
      _pdDrawGlossySphere(ctx, legX + 19, ly - 3, 4.3, sd.color, _pdDarkenHex(sd.color, 0.52));
      ctx.fillStyle = "#0f172a";
      ctx.fillText(labels[i], legX + 36, ly + 1);
    });
    ctx.restore();
  }

  // Save plot geometry for hover readout
  canvas._plotMeta = { px, py, pw, ph, xLo, xHi, yLo, yHi, toX, toY };

  // ---------------- RIGHT PANEL: Live Side-View Atomic Layer Schematic ----------------
  drawPostDataLayerSchematic(ctx, res, splitX + 8, 18, width - splitX - 18, height - 30, st);

  ctx.restore();
}

function drawPostDataLayerSchematic(ctx, res, sx, sy, sw, sh, st) {
  const refLay = res.refLayers;
  const crystal = res.refItem.crystal;
  if (!refLay || !refLay.layers.length) return;

  ctx.save();
  // Subtle panel divider & header
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1.0;
  ctx.beginPath(); ctx.moveTo(sx - 4, sy + 10); ctx.lineTo(sx - 4, sy + sh - 10); ctx.stroke();

  const fmtFormulaSci = (f) => String(f || "Ref").replace(/([A-Za-z\)])(\d+)/g, "$1_{$2}");
  ctx.fillStyle = st.inkColor || "#0f172a";
  ctx.font = `700 ${Math.max(12.5, (st.titleSize || 14) - 1)}px ${st.fontFamily}`;
  ctx.textAlign = "center";
  if (typeof drawSciText === "function") drawSciText(ctx, `Atomic Layer Schematic (${fmtFormulaSci(res.refItem.crystal.formula)})`, sx + sw / 2, sy + 14);
  else ctx.fillText(`Atomic Layer Schematic (${res.refItem.crystal.formula || "Ref"})`, sx + sw / 2, sy + 14);
  ctx.fillStyle = "#64748b";
  ctx.font = `600 10.5px Inter, sans-serif`;
  if (typeof drawSciText === "function") drawSciText(ctx, `Ref: X = ${res.refItem.xPlot} • ${refLay.layers.length} layers (${refLay.spacings.length} spacings) • D_{tot} = ${refLay.totalThicknessA.toFixed(3)} Å`, sx + sw / 2, sy + 30);
  else ctx.fillText(`Ref: X = ${res.refItem.xPlot} • ${refLay.layers.length} layers (${refLay.spacings.length} spacings) • Dtot = ${refLay.totalThicknessA.toFixed(3)} Å`, sx + sw / 2, sy + 30);

  // Build 2D side-view projection: horizontal = in-plane direction, vertical = stacking height hA
  const vecs = crystal.vectors;
  const axIdx = refLay.axIdx;
  const inA = (axIdx + 1) % 3;
  const inB = (axIdx + 2) % 3;
  const vA = vecs[inA], vB = vecs[inB];

  // Choose viewing direction (perpendicular to horizontal display axis hDir)
  let hVec = vB;
  if (res.opts.viewAxis === "b") hVec = vA;
  else if (res.opts.viewAxis === "110") hVec = [vA[0] + vB[0], vA[1] + vB[1], vA[2] + vB[2]];
  // Project hVec orthogonal to stacking normal nHat
  const nHat = refLay.nHat;
  const hDotN = _pdDot(hVec, nHat);
  const hProj = [hVec[0] - hDotN * nHat[0], hVec[1] - hDotN * nHat[1], hVec[2] - hDotN * nHat[2]];
  const hLen = _pdNorm(hProj) || 1.0;
  const hHat = [hProj[0] / hLen, hProj[1] / hLen, hProj[2] / hLen];
  const depthHat = _pdCross(hHat, nHat);

  // Tile 1 extra periodic image left/right along horizontal axis so bonding looks just like VESTA side-view!
  const cellSpanH = Math.max(2.4, Math.abs(_pdDot(vA, hHat)) + Math.abs(_pdDot(vB, hHat))) * 0.65;
  const baseAtoms = refLay.unwrapped;
  const hMinA = Math.min(...baseAtoms.map(a => a.hA));
  const hMaxA = Math.max(...baseAtoms.map(a => a.hA));
  const thickA = Math.max(1.5, hMaxA - hMinA);

  // Generate central unit cell + minimal periodic neighbors (clean single-cell VESTA slice matching reference!)
  const unitW = Math.max(2.5, Math.abs(_pdDot(res.opts.viewAxis === "b" ? vA : vB, hHat)));
  const tiled = [];
  baseAtoms.forEach((at, idx) => {
    for (let ia = -1; ia <= 1; ia++) {
      for (let ib = -1; ib <= 1; ib++) {
        const shift = [
          ia * vA[0] + ib * vB[0],
          ia * vA[1] + ib * vB[1],
          ia * vA[2] + ib * vB[2]
        ];
        const c = [at.cart[0] + shift[0], at.cart[1] + shift[1], at.cart[2] + shift[2]];
        const xH = _pdDot(c, hHat);
        const zD = _pdDot(c, depthHat);
        const isPrimary = (ia === 0 && ib === 0);
        if (xH >= -0.34 * unitW && xH <= 1.34 * unitW) {
          tiled.push({ ...at, origIdx: idx, xH, yV: at.hA, zD, isPrimary, cart3: c });
        }
      }
    }
  });
  // Deduplicate projected overlapping images cleanly (keep front-most depth)
  const projAtoms = [];
  tiled.sort((a, b) => b.zD - a.zD);
  tiled.forEach(at => {
    const dup = projAtoms.some(p => Math.abs(p.xH - at.xH) < 0.12 && Math.abs(p.yV - at.yV) < 0.12 && p.element === at.element);
    if (!dup) projAtoms.push(at);
  });

  // Coordinate mapping inside schematic box (leave room on left for element labels + custom brackets, right for d1..dN)
  const customLayerSeries = (res.seriesStats || []).filter(s => s.kind === "custom_layer");
  const extraLeft = customLayerSeries.length ? (42 + Math.min(3, customLayerSeries.length - 1) * 26) : 0;
  const boxL = sx + 54 + extraLeft;
  const boxR = sx + sw - (res.opts.showD0OnSchematic ? 96 : 56);
  const boxT = sy + 56;
  const boxB = sy + sh - 26;
  const boxW = Math.max(80, boxR - boxL);
  const boxH = Math.max(120, boxB - boxT);

  const xHmin = Math.min(0, ...projAtoms.map(a => a.xH));
  const xHmax = Math.max(unitW, ...projAtoms.map(a => a.xH));
  const xSpan = Math.max(2.0, xHmax - xHmin);
  const scale = Math.min(boxW / (xSpan * 1.12), boxH / (thickA * 1.18));
  const xMidWorld = 0.5 * (xHmin + xHmax);
  const yMidWorld = 0.5 * (hMinA + hMaxA);
  const cxBox = boxL + boxW * 0.5;
  const cyBox = boxT + boxH * 0.5;

  const isTopDown = res.opts.order !== "bottom_up";
  const toSX = xh => cxBox + (xh - xMidWorld) * scale;
  // Vertical screen mapping: if top_down, larger hA is at TOP (smaller screen Y); if bottom_up, larger hA at BOTTOM
  const toSY = yv => isTopDown
    ? (cyBox - (yv - yMidWorld) * scale)
    : (cyBox + (yv - yMidWorld) * scale);

  // 1) Draw vertical unit-cell border lines (crisp VESTA unit-cell boundary matching reference figure!)
  ctx.strokeStyle = "#64748b";
  ctx.lineWidth = 1.25;
  const u0X = toSX(0), u1X = toSX(unitW);
  const yTopBound = Math.min(toSY(hMaxA), toSY(hMinA)) - 22;
  const yBotBound = Math.max(toSY(hMaxA), toSY(hMinA)) + 22;
  ctx.beginPath();
  ctx.moveTo(u0X, yTopBound); ctx.lineTo(u0X, yBotBound);
  ctx.moveTo(u1X, yTopBound); ctx.lineTo(u1X, yBotBound);
  ctx.stroke();

  // 2) Draw horizontal dashed layer planes across each atomic layer!
  const planeX0 = boxL - 6;
  const planeX1 = boxR + 8;
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 1.05;
  ctx.setLineDash([3.5, 3]);
  refLay.layers.forEach(L => {
    const ly = Math.round(toSY(L.meanH)) + 0.5;
    ctx.beginPath(); ctx.moveTo(planeX0, ly); ctx.lineTo(planeX1, ly); ctx.stroke();
  });
  ctx.setLineDash([]);

  // 3) Draw covalent bonds between projected atoms (using true 3D distance cutoffs)
  for (let i = 0; i < projAtoms.length; i++) {
    for (let j = i + 1; j < projAtoms.length; j++) {
      const a = projAtoms[i], b = projAtoms[j];
      const dx = a.cart3[0] - b.cart3[0], dy = a.cart3[1] - b.cart3[1], dz = a.cart3[2] - b.cart3[2];
      const d3 = Math.sqrt(dx*dx + dy*dy + dz*dz);
      const rA = POST_DATA_COV_RAD[a.element] || 1.25;
      const rB = POST_DATA_COV_RAD[b.element] || 1.25;
      if (d3 > 0.45 && d3 <= (rA + rB) * 1.24) {
        const x1 = toSX(a.xH), y1 = toSY(a.yV);
        const x2 = toSX(b.xH), y2 = toSY(b.yV);
        const xm = 0.5 * (x1 + x2), ym = 0.5 * (y1 + y2);
        const cpkA = POST_DATA_CPK[a.element] || { fill: "#94a3b8", stroke: "#475569" };
        const cpkB = POST_DATA_CPK[b.element] || { fill: "#94a3b8", stroke: "#475569" };
        const bw = Math.max(2.6, Math.min(5.2, scale * 0.14));
        ctx.lineCap = "round";
        // Outer bond border
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = bw + 1.4;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        // Two-tone inner bond cylinder
        ctx.strokeStyle = cpkA.fill;
        ctx.lineWidth = bw;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(xm, ym); ctx.stroke();
        ctx.strokeStyle = cpkB.fill;
        ctx.beginPath(); ctx.moveTo(xm, ym); ctx.lineTo(x2, y2); ctx.stroke();
      }
    }
  }

  // 4) Draw 3D-shaded CPK spheres (sorted back-to-front by zD)
  const sortedAtoms = [...projAtoms].sort((a, b) => a.zD - b.zD);
  sortedAtoms.forEach(at => {
    const cpk = POST_DATA_CPK[at.element] || { fill: "#64748b", stroke: "#1e293b", r: 1.0 };
    const rad = Math.max(6.5, Math.min(16, cpk.r * scale * 0.34));
    _pdDrawGlossySphere(ctx, toSX(at.xH), toSY(at.yV), rad, cpk.fill, cpk.stroke);
  });

  // 5) Draw crisp Element Labels on the left of each layer (avoiding vertical collisions)
  ctx.font = `700 13px ${st.fontFamily}`;
  ctx.textAlign = "right";
  ctx.fillStyle = "#0f172a";
  let lastLblY = -1e9;
  refLay.layers.forEach(L => {
    let ly = toSY(L.meanH) + 4;
    if (Math.abs(ly - lastLblY) < 15) ly = lastLblY + (ly >= lastLblY ? 15 : -15);
    lastLblY = ly;
    ctx.fillText(L.elLabel, planeX0 - 6, ly);
  });

  // 5B) Draw Left-Side Brackets for Custom Non-Adjacent Layer Pairs (shorter inner, longer outer -> zero crossings!)
  if (customLayerSeries.length) {
    const orderedCustom = [...customLayerSeries].sort((a, b) => (a.idxB - a.idxA) - (b.idxB - b.idxA));
    let lastLeftMidY = -1e9;
    orderedCustom.forEach((csd, ci) => {
      const layA = refLay.layers[csd.idxA];
      const layB = refLay.layers[csd.idxB];
      if (!layA || !layB) return;
      const yA = toSY(layA.meanH);
      const yB = toSY(layB.meanH);
      const yTop = Math.min(yA, yB), yBot = Math.max(yA, yB);
      let yMid = 0.5 * (yTop + yBot);
      if (Math.abs(yMid - lastLeftMidY) < 18) yMid = lastLeftMidY + (yMid >= lastLeftMidY ? 18 : -18);
      lastLeftMidY = yMid;

      const isHidden = POST_DATA_STATE.hiddenSeries.has(csd.id);
      const col = isHidden ? "#cbd5e1" : csd.color;
      const bx = planeX0 - 32 - Math.min(3, ci) * 26;
      const tickW = 7;

      ctx.strokeStyle = col;
      ctx.lineWidth = 1.65;
      ctx.beginPath();
      ctx.moveTo(bx + tickW, yTop);
      ctx.lineTo(bx, yTop);
      ctx.lineTo(bx, yBot);
      ctx.lineTo(bx + tickW, yBot);
      ctx.moveTo(bx, yMid);
      ctx.lineTo(bx - 4, yMid);
      ctx.stroke();

      ctx.font = `700 11px ${st.fontFamily}`;
      ctx.textAlign = "right";
      const lbl = csd.pairName + (res.opts.showD0OnSchematic ? ` (${csd.refVal.toFixed(2)})` : "");
      // Crisp white halo behind label so nested brackets never obscure text
      ctx.save();
      ctx.lineJoin = "round";
      ctx.lineWidth = 3.6;
      ctx.strokeStyle = "rgba(255,255,255,0.95)";
      ctx.strokeText(lbl, bx - 6, yMid + 4);
      ctx.fillStyle = isHidden ? "#94a3b8" : csd.color;
      ctx.fillText(lbl, bx - 6, yMid + 4);
      ctx.restore();
    });
  }

  // 6) Draw crisp Right-Side Interlayer Spacing Labels d₁, d₂, ..., dₙ (color-coded to match the plot!)
  let lastDY = -1e9;
  refLay.spacings.forEach((sp, idx) => {
    const yA = toSY(sp.fromLayer.meanH);
    const yB = toSY(sp.toLayer.meanH);
    let yMid = 0.5 * (yA + yB);
    if (Math.abs(yMid - lastDY) < 16) yMid = lastDY + (yMid >= lastDY ? 16 : -16);
    lastDY = yMid;
    const col = POST_DATA_PALETTE[idx % POST_DATA_PALETTE.length];
    const isHidden = POST_DATA_STATE.hiddenSeries.has(sp.id);

    // Small vertical bracket ticks between layer planes
    if (Math.abs(yB - yA) >= 12) {
      const bx = planeX1 + 4;
      ctx.strokeStyle = isHidden ? "#cbd5e1" : col;
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.moveTo(bx, Math.min(yA, yB) + 2);
      ctx.lineTo(bx, Math.max(yA, yB) - 2);
      ctx.stroke();
    }

    ctx.fillStyle = isHidden ? "#94a3b8" : "#0f172a";
    ctx.textAlign = "left";
    ctx.font = `700 13.5px ${st.fontFamily}`;
    const dLabel = `d_{${idx + 1}}` + (res.opts.showD0OnSchematic ? ` (${sp.distA.toFixed(2)} Å)` : "");
    // Small colored dot matching plot curve!
    ctx.fillStyle = isHidden ? "#cbd5e1" : col;
    ctx.beginPath(); ctx.arc(planeX1 + 12, yMid - 1, 3.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = isHidden ? "#94a3b8" : "#0f172a";
    if (typeof drawSciText === "function") drawSciText(ctx, dLabel, planeX1 + 19, yMid + 4);
    else ctx.fillText(`d${idx + 1}` + (res.opts.showD0OnSchematic ? ` (${sp.distA.toFixed(2)} Å)` : ""), planeX1 + 19, yMid + 4);
  });

  ctx.restore();
}

// ---------------- Interactive UI Controller ----------------

function initPostDataTab() {
  const dropZone = document.getElementById("pd-cif-dropzone");
  if (dropZone && !POST_DATA_STATE.dragBound) {
    POST_DATA_STATE.dragBound = true;
    ["dragenter", "dragover"].forEach(evt => {
      dropZone.addEventListener(evt, e => {
        e.preventDefault(); e.stopPropagation();
        dropZone.classList.add("pd-drop-active");
      });
    });
    ["dragleave", "drop"].forEach(evt => {
      dropZone.addEventListener(evt, e => {
        e.preventDefault(); e.stopPropagation();
        dropZone.classList.remove("pd-drop-active");
      });
    });
    dropZone.addEventListener("drop", async e => {
      const files = Array.from(e.dataTransfer?.files || []).filter(f => _pdIsSupportedStructureFile(f.name));
      if (files.length) await loadPostDataStructureFiles(files, false, false);
      else if (typeof showToast === "function") showToast("Please drop supported structure files (*.cif, *.cell, *.xsd, *.castep, *.msi, *.car, POSCAR, *.xyz).", "warning");
    });
  }

  const canvas = document.getElementById("post-data-main-canvas");
  if (canvas && !canvas._pdMouseBound) {
    canvas._pdMouseBound = true;
    canvas.addEventListener("mousemove", e => {
      const res = POST_DATA_STATE.lastResult;
      const meta = canvas._plotMeta;
      const readout = document.getElementById("post-data-plot-readout");
      if (!res || !meta || !res.rows.length) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      if (mx < meta.px || mx > meta.px + meta.pw || my < meta.py || my > meta.py + meta.ph) {
        if (POST_DATA_STATE.hoverInfo) { POST_DATA_STATE.hoverInfo = null; drawPostDataCanvas(res); }
        return;
      }
      let bestI = 0, bestD = Infinity;
      res.rows.forEach((r, idx) => {
        const d = Math.abs(meta.toX(r.xPlot) - mx);
        if (d < bestD) { bestD = d; bestI = idx; }
      });
      if (!POST_DATA_STATE.hoverInfo || POST_DATA_STATE.hoverInfo.rowIdx !== bestI) {
        POST_DATA_STATE.hoverInfo = { rowIdx: bestI };
        drawPostDataCanvas(res);
        if (readout) {
          const r = res.rows[bestI];
          const mMode = res.opts.metricMode;
          const unit = mMode === "pct" ? "%" : "Å";
          const chips = res.seriesStats
            .filter(sd => !POST_DATA_STATE.hiddenSeries.has(sd.id))
            .map(sd => {
              const v = mMode === "abs" ? r.absVals[sd.id] : (mMode === "pct" ? r.pctVals[sd.id] : r.deltaVals[sd.id]);
              return `<span style="color:${sd.color}; font-weight:700;">${escapeHtml(sd.shortLabel)}: ${isFinite(v) ? (mMode !== "abs" && v >= 0 ? "+" : "") + v.toFixed(4) : "—"} ${unit}</span>`;
            }).join(" • ");
          readout.innerHTML = `<strong>${escapeHtml(r.filename)}</strong> (X = <strong>${r.xPlot}</strong>) &nbsp;|&nbsp; ${chips}`;
        }
      }
    });
    canvas.addEventListener("mouseleave", () => {
      if (POST_DATA_STATE.hoverInfo) {
        POST_DATA_STATE.hoverInfo = null;
        if (POST_DATA_STATE.lastResult) drawPostDataCanvas(POST_DATA_STATE.lastResult);
      }
    });
    // Right-click single-panel HD copy / PNG / TSV menu (integrates directly with existing studio context menu!)
    if (typeof CASTEP_PLOT_CTX_SPECS !== "undefined" && !CASTEP_PLOT_CTX_SPECS["post-data-main-canvas"]) {
      CASTEP_PLOT_CTX_SPECS["post-data-main-canvas"] = {
        label: "Interlayer & Bond Distance Analysis",
        pngName: "PostData_Interlayer_Distances_Full.png",
        dataItems: []
      };
    }
    canvas.title = "Hover over the plot for exact values • Right-click either sub-panel to Copy HD Image (400–600 DPI) or Copy Data (TSV)";
    canvas.addEventListener("contextmenu", ev => {
      if (typeof showCastepPlotContextMenu === "function") {
        ev.preventDefault();
        showCastepPlotContextMenu("post-data-main-canvas", ev.clientX, ev.clientY);
      }
    });
  }

  renderPostDataTab();
}
window.initPostDataTab = initPostDataTab;

async function handlePostDataCifUpload(event, append = false, isFolder = false) {
  const allFiles = Array.from(event?.target?.files || []);
  const files = allFiles.filter(f => _pdIsSupportedStructureFile(f.name));
  if (event?.target) event.target.value = "";
  if (!files.length) {
    if (typeof showToast === "function") showToast("No supported structure files (*.cif, *.cell, *.xsd, *.castep, *.msi, *.car, POSCAR, *.xyz) found.", "warning");
    return;
  }
  await loadPostDataStructureFiles(files, append, isFolder);
}
window.handlePostDataCifUpload = handlePostDataCifUpload;

function _pdFilterFolderFiles(files) {
  // When loading a Materials Studio / CASTEP project folder:
  // 1) Skip auxiliary non-geometry CASTEP files (_BandStr, _DOS, _Optics, _Efield, _Phonon) if main files exist.
  const mainFiles = files.filter(f => !/_(bandstr|dos|optics|efield|phonon)\.(cell|castep)$/i.test(f.name));
  const pool = mainFiles.length ? mainFiles : files;

  // 2) Deduplicate same-folder same-stem multi-format copies by relaxed-structure priority:
  //    .cif > .xsd > .castep (Final Config) > .cell > .msi > .car > POSCAR/.vasp > .xyz
  const prio = (name) => {
    const low = name.toLowerCase();
    if (low.endsWith(".cif")) return 1;
    if (low.endsWith(".xsd")) return 2;
    if (low.endsWith(".castep")) return 3;
    if (low.endsWith(".cell")) return 4;
    if (low.endsWith(".msi")) return 5;
    if (low.endsWith(".car")) return 6;
    if (low.endsWith(".vasp") || POST_DATA_VASP_NAME_RE.test(low)) return 7;
    return 8;
  };
  const byDirStem = new Map();
  pool.forEach(f => {
    const rel = String(f.webkitRelativePath || f.name).replace(/\\/g, "/");
    const dir = rel.includes("/") ? rel.slice(0, rel.lastIndexOf("/")) : "";
    const stem = _pdStripStructureExt(f.name).toLowerCase();
    const key = `${dir.toLowerCase()}::${stem}`;
    const prev = byDirStem.get(key);
    if (!prev || prio(f.name) < prio(prev.name)) byDirStem.set(key, f);
  });
  return Array.from(byDirStem.values());
}

async function loadPostDataStructureFiles(files, append = false, isFolder = false) {
  if (!files || !files.length) return;
  const candidateFiles = isFolder ? _pdFilterFolderFiles(files) : files;

  const parsedBatch = [];
  for (const f of candidateFiles) {
    try {
      const txt = await f.text();
      const crys = parsePostDataStructureFile(txt, f.name);
      if (crys && crys.atoms && crys.atoms.length >= 2) {
        parsedBatch.push({
          filename: f.name,
          relPath: f.webkitRelativePath || f.name,
          format: crys.format || "CIF",
          crystal: crys,
          rawText: txt
        });
      }
    } catch (err) {
      console.warn("Failed to parse structure file:", f.name, err);
    }
  }
  if (!parsedBatch.length) {
    if (typeof showToast === "function") showToast("Could not parse atomic coordinates from selected structure files.", "error");
    return;
  }

  const baseList = append ? [...POST_DATA_STATE.items] : [];
  const allNames = [...baseList.map(it => it.filename), ...parsedBatch.map(p => p.filename)];
  const allRelPaths = [...baseList.map(it => it.relPath || it.filename), ...parsedBatch.map(p => p.relPath)];
  const allItemsRef = [...baseList, ...parsedBatch];
  const inferredAll = _pdInferBatchXValues(allNames, allRelPaths, allItemsRef);

  if (!append) {
    POST_DATA_STATE.items = [];
    POST_DATA_STATE.hiddenSeries.clear();
    POST_DATA_STATE.customLayerPairs = [];
    POST_DATA_STATE.customPairs = [];
  }
  const startIdx = baseList.length;
  parsedBatch.forEach((p, idx) => {
    const xAuto = inferredAll[startIdx + idx];
    POST_DATA_STATE.items.push({
      id: `pd_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
      filename: p.filename,
      relPath: p.relPath,
      format: p.format,
      xRaw: xAuto,
      xVal: xAuto,
      enabled: true,
      crystal: p.crystal,
      rawText: p.rawText
    });
  });

  POST_DATA_STATE.items.sort((a, b) => a.xVal - b.xVal);
  renderPostDataTab();
  if (typeof showToast === "function") {
    const fmts = [...new Set(parsedBatch.map(p => p.format))].join("/");
    showToast(`Loaded ${parsedBatch.length} structure(s) [${fmts}] — auto-detected X values & atomic layers!`, "success");
  }
}
window.loadPostDataStructureFiles = loadPostDataStructureFiles;
window.loadPostDataCifFiles = loadPostDataStructureFiles;

function clearPostDataCifs() {
  POST_DATA_STATE.items = [];
  POST_DATA_STATE.hiddenSeries.clear();
  POST_DATA_STATE.customLayerPairs = [];
  POST_DATA_STATE.customPairs = [];
  POST_DATA_STATE.lastResult = null;
  renderPostDataTab();
  if (typeof showToast === "function") showToast("Cleared all loaded crystal structures.", "info");
}
window.clearPostDataCifs = clearPostDataCifs;

function resetPostDataSettings() {
  const setV = (id, v) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.type === "checkbox") el.checked = Boolean(v);
    else el.value = String(v);
  };
  setV("pd-measure-mode", "interlayer");
  setV("pd-metric-mode", "delta");
  setV("pd-fit-mode", "connect");
  setV("pd-stack-axis", "c");
  setV("pd-layer-order", "top_down");
  setV("pd-layer-tol", "0.15");
  setV("pd-x-scale", "1.0");
  setV("pd-ref-select", "auto");
  setV("pd-schematic-view", "a");
  setV("pd-xlabel-input", "Electric Field E (V/Å)");
  setV("pd-show-pair-legend", false);
  setV("pd-show-zero-lines", true);
  setV("pd-show-d0-schematic", false);
  POST_DATA_STATE.hiddenSeries.clear();
  POST_DATA_STATE.customLayerPairs = [];
  POST_DATA_STATE.items.forEach(it => { it.enabled = true; it.xVal = it.xRaw; });
  renderPostDataTab();
  if (typeof showToast === "function") showToast("Reset Post-Data Processing settings to initial defaults.", "info");
}
window.resetPostDataSettings = resetPostDataSettings;

function addPostDataCustomLayerPair() {
  const aEl = document.getElementById("pd-custom-layer-a");
  const bEl = document.getElementById("pd-custom-layer-b");
  const res = POST_DATA_STATE.lastResult;
  if (!aEl || !bEl || !res || !res.refLayers) return;
  const rawA = parseInt(aEl.value, 10), rawB = parseInt(bEl.value, 10);
  if (!isFinite(rawA) || !isFinite(rawB) || rawA === rawB) {
    if (typeof showToast === "function") showToast("Select two distinct atomic layers to track their interlayer spacing.", "warning");
    return;
  }
  const idxA = Math.min(rawA, rawB), idxB = Math.max(rawA, rawB);
  if (idxB - idxA === 1) {
    if (typeof showToast === "function") showToast(`Adjacent layers L${idxA + 1}–L${idxB + 1} are already tracked as d${idxA + 1}!`, "info");
    return;
  }
  if (POST_DATA_STATE.customLayerPairs.some(p => p.idxA === idxA && p.idxB === idxB)) {
    if (typeof showToast === "function") showToast(`Layer pair L${idxA + 1}–L${idxB + 1} is already added.`, "info");
    return;
  }
  POST_DATA_STATE.customLayerPairs.push({ idxA, idxB });
  const layA = res.refLayers.layers[idxA], layB = res.refLayers.layers[idxB];
  renderPostDataTab();
  if (typeof showToast === "function") {
    showToast(`Added custom layer distance d${idxA + 1}-${idxB + 1} (${layA?.elLabel || "L" + (idxA + 1)}–${layB?.elLabel || "L" + (idxB + 1)})!`, "success");
  }
}
window.addPostDataCustomLayerPair = addPostDataCustomLayerPair;

function addPostDataOuterLayerPair() {
  const res = POST_DATA_STATE.lastResult;
  if (!res || !res.refLayers || res.refLayers.layers.length < 3) {
    if (typeof showToast === "function") showToast("Requires a structure with at least 3 atomic layers.", "warning");
    return;
  }
  const idxA = 0, idxB = res.refLayers.layers.length - 1;
  if (POST_DATA_STATE.customLayerPairs.some(p => p.idxA === idxA && p.idxB === idxB)) {
    if (typeof showToast === "function") showToast("Outer slab pair (L1–Ln) is already added.", "info");
    return;
  }
  POST_DATA_STATE.customLayerPairs.push({ idxA, idxB });
  const layA = res.refLayers.layers[idxA], layB = res.refLayers.layers[idxB];
  renderPostDataTab();
  if (typeof showToast === "function") {
    showToast(`Added outer layer distance d1-${idxB + 1} (${layA.elLabel}–${layB.elLabel})!`, "success");
  }
}
window.addPostDataOuterLayerPair = addPostDataOuterLayerPair;

function removePostDataCustomLayerPair(idxA, idxB, ev) {
  if (ev && ev.stopPropagation) ev.stopPropagation();
  POST_DATA_STATE.customLayerPairs = POST_DATA_STATE.customLayerPairs.filter(p => !(p.idxA === idxA && p.idxB === idxB));
  POST_DATA_STATE.hiddenSeries.delete(`L${idxA + 1}_${idxB + 1}`);
  renderPostDataTab();
}
window.removePostDataCustomLayerPair = removePostDataCustomLayerPair;

function togglePostDataSeries(seriesId) {
  if (POST_DATA_STATE.hiddenSeries.has(seriesId)) POST_DATA_STATE.hiddenSeries.delete(seriesId);
  else POST_DATA_STATE.hiddenSeries.add(seriesId);
  renderPostDataTab();
}
window.togglePostDataSeries = togglePostDataSeries;

function updatePostDataItemX(itemId, rawVal) {
  const v = parseFloat(rawVal);
  const it = POST_DATA_STATE.items.find(x => x.id === itemId);
  if (it && isFinite(v)) {
    it.xVal = v;
    renderPostDataTab();
  }
}
window.updatePostDataItemX = updatePostDataItemX;

function togglePostDataItemEnabled(itemId, checked) {
  const it = POST_DATA_STATE.items.find(x => x.id === itemId);
  if (it) {
    it.enabled = Boolean(checked);
    renderPostDataTab();
  }
}
window.togglePostDataItemEnabled = togglePostDataItemEnabled;

function removePostDataItem(itemId) {
  POST_DATA_STATE.items = POST_DATA_STATE.items.filter(x => x.id !== itemId);
  renderPostDataTab();
}
window.removePostDataItem = removePostDataItem;

function addPostDataCustomBondPair() {
  const aEl = document.getElementById("pd-custom-atom-a");
  const bEl = document.getElementById("pd-custom-atom-b");
  const res = POST_DATA_STATE.lastResult;
  if (!aEl || !bEl || !res) return;
  const aIdx = parseInt(aEl.value, 10), bIdx = parseInt(bEl.value, 10);
  if (!isFinite(aIdx) || !isFinite(bIdx) || aIdx === bIdx) {
    if (typeof showToast === "function") showToast("Select two distinct atoms to track their 3D bond distance.", "warning");
    return;
  }
  const atoms = res.refItem.crystal.atoms;
  const lbl = `${atoms[aIdx]?.label || "A"}–${atoms[bIdx]?.label || "B"}`;
  POST_DATA_STATE.customPairs.push({ aIdx, bIdx, label: lbl });
  const modeEl = document.getElementById("pd-measure-mode");
  if (modeEl) modeEl.value = "bonds";
  renderPostDataTab();
  if (typeof showToast === "function") showToast(`Added custom bond pair ${lbl}!`, "success");
}
window.addPostDataCustomBondPair = addPostDataCustomBondPair;

function renderPostDataTab() {
  // Populate Reference Structure selector cleanly before computing
  const refSel = document.getElementById("pd-ref-select");
  if (refSel) {
    const prev = refSel.value || "auto";
    const scale = parseFloat(document.getElementById("pd-x-scale")?.value) || 1.0;
    const opts = [`<option value="auto">Auto (X ≈ 0)</option>`];
    [...POST_DATA_STATE.items].sort((a, b) => a.xVal - b.xVal).forEach(it => {
      opts.push(`<option value="${escapeHtml(it.id)}">${escapeHtml(it.filename)} (X=${(it.xVal * scale).toFixed(3).replace(/\.?0+$/, "") || "0"})</option>`);
    });
    refSel.innerHTML = opts.join("");
    refSel.value = (prev === "auto" || POST_DATA_STATE.items.some(it => it.id === prev)) ? prev : "auto";
  }

  const res = computePostDataAnalysis();
  POST_DATA_STATE.lastResult = res;

  // Toggle Custom Layer-Pair Bar (in Interlayer mode with >= 3 layers) & Custom Bond Bar (in Bonds mode)
  const customLayerWrap = document.getElementById("pd-custom-layer-row");
  if (customLayerWrap) {
    const showLay = res && res.opts.measureMode === "interlayer" && res.refLayers && res.refLayers.layers.length >= 3;
    customLayerWrap.style.display = showLay ? "flex" : "none";
    if (showLay) {
      const aSel = document.getElementById("pd-custom-layer-a");
      const bSel = document.getElementById("pd-custom-layer-b");
      const sig = `${res.refItem.id}_${res.refLayers.layers.map(l => l.elLabel).join("-")}_${res.opts.order}`;
      if (aSel && bSel && aSel.dataset.layerSig !== sig) {
        const layOpts = res.refLayers.layers.map((L, idx) =>
          `<option value="${idx}">L${idx + 1}: ${escapeHtml(L.elLabel)} (${L.meanH.toFixed(2)} Å)</option>`
        ).join("");
        aSel.innerHTML = layOpts;
        bSel.innerHTML = layOpts;
        aSel.selectedIndex = 0;
        bSel.selectedIndex = res.refLayers.layers.length - 1;
        aSel.dataset.layerSig = sig;
      }
      const outerBtn = document.getElementById("pd-outer-layer-btn");
      if (outerBtn) {
        const lFirst = res.refLayers.layers[0];
        const lLast = res.refLayers.layers[res.refLayers.layers.length - 1];
        outerBtn.textContent = `➕ ${lFirst.elLabel}–${lLast.elLabel} (L1–L${res.refLayers.layers.length})`;
      }
    }
  }

  const customBondWrap = document.getElementById("pd-custom-bond-row");
  if (customBondWrap) {
    const showBond = res && res.opts.measureMode === "bonds";
    customBondWrap.style.display = showBond ? "flex" : "none";
    if (showBond) {
      const aSel = document.getElementById("pd-custom-atom-a");
      const bSel = document.getElementById("pd-custom-atom-b");
      if (aSel && bSel && aSel.dataset.refId !== res.refItem.id) {
        const atomOpts = res.refItem.crystal.atoms.map((at, idx) =>
          `<option value="${idx}">${escapeHtml(at.label || at.element + (idx + 1))} (${escapeHtml(at.element)}, z=${at.z.toFixed(3)})</option>`
        ).join("");
        aSel.innerHTML = atomOpts;
        bSel.innerHTML = atomOpts;
        if (res.refItem.crystal.atoms.length > 1) bSel.selectedIndex = 1;
        aSel.dataset.refId = res.refItem.id;
      }
    }
  }

  // Reset hover readout text cleanly when metric/dataset changes so units never go stale
  const readoutEl = document.getElementById("post-data-plot-readout");
  if (readoutEl) {
    readoutEl.textContent = res ? "Hover over the plot to inspect exact values per structure." : "Load crystal structures to begin analysis.";
  }

  // 1) Top KPI Summary Strip
  const strip = document.getElementById("post-data-summary-strip");
  if (strip) {
    if (!res) {
      strip.innerHTML = `<span>Upload multiple optimized crystal structures (<code>*.cif</code>, <code>*.cell</code>, Materials Studio <code>*.xsd</code> / <code>*.msi</code> / <code>*.car</code>, <code>*.castep</code>, <code>POSCAR</code>, <code>*.xyz</code>) to automatically cluster atomic layers, track interlayer spacings <strong>d<sub>1</sub>, d<sub>2</sub>, …, d<sub>n</sub></strong> &amp; 3D bond distances, and generate publication-ready figures &amp; tables.</span>`;
    } else {
      const topMover = [...res.seriesStats].sort((a, b) => b.maxAbsDel - a.maxAbsDel)[0];
      const fmts = [...new Set(POST_DATA_STATE.items.filter(i => i.enabled).map(i => i.format || "CIF"))].join("/");
      strip.innerHTML = `
        <span><strong>System:</strong> ${escapeHtml(res.refItem.crystal.formula)} (${res.refItem.crystal.natoms} atoms/cell)</span>
        <span style="color:#0369a1;"><strong>Structures:</strong> ${res.rows.length} (${escapeHtml(fmts)} • X ∈ [${res.xMin}, ${res.xMax}])</span>
        <span style="color:#0f766e;"><strong>Ref (X<sub>0</sub>):</strong> ${escapeHtml(res.refItem.filename)} (X = ${res.refItem.xPlot})</span>
        <span style="color:#4f46e5;"><strong>Layers:</strong> ${res.refLayers.layers.length} (${res.refLayers.layers.map(l => l.elLabel).join("–")}) • D<sub>tot</sub> = ${res.refLayers.totalThicknessA.toFixed(3)} Å</span>
        ${topMover ? `<span style="color:#b45309;"><strong>Max Shift:</strong> ${escapeHtml(topMover.shortLabel)} (${escapeHtml(topMover.pairName)}) |Δ|<sub>max</sub> = ${topMover.maxAbsDel.toFixed(4)} Å</span>` : ""}
      `;
    }
  }

  // 2) Series Toggle Chips (Quick Show/Hide d1..dN + Removable Custom Layer Pairs!)
  const chipsEl = document.getElementById("post-data-series-chips");
  if (chipsEl) {
    if (!res || !res.seriesStats.length) {
      chipsEl.innerHTML = "";
    } else {
      chipsEl.innerHTML = `<span style="font-size:11px; font-weight:700; color:#475569; margin-right:4px;">Curves:</span>` +
        res.seriesStats.map(sd => {
          const off = POST_DATA_STATE.hiddenSeries.has(sd.id);
          const rmSpan = sd.kind === "custom_layer"
            ? `<span onclick="removePostDataCustomLayerPair(${sd.idxA}, ${sd.idxB}, event)" title="Remove custom layer pair" style="margin-left:5px; padding:0 3px; border-radius:3px; color:#dc2626; font-weight:900;">×</span>`
            : "";
          return `<button type="button" class="castep-preset-chip" onclick="togglePostDataSeries('${escapeHtml(sd.id)}')" style="border-color:${off ? "#cbd5e1" : sd.color}; color:${off ? "#94a3b8" : sd.color}; background:${off ? "#f8fafc" : "#ffffff"}; font-weight:700; opacity:${off ? 0.55 : 1};" title="Click to toggle ${escapeHtml(sd.fullLabel)} (d₀ = ${sd.refVal.toFixed(4)} Å)">
            <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${sd.color}; margin-right:4px;"></span>${escapeHtml(sd.shortLabel)} (${escapeHtml(sd.pairName)})${rmSpan}
          </button>`;
        }).join("");
    }
  }

  // 3) Render Publication Dual Canvas
  drawPostDataCanvas(res);

  // 4) Render Table 1: Complete Measured Data Table (X vs d1..dN + inline X editor)
  const thead = document.getElementById("post-data-table-head");
  const tbody = document.getElementById("post-data-table-body");
  const cntBadge = document.getElementById("post-data-rows-count");
  if (cntBadge) cntBadge.textContent = `${POST_DATA_STATE.items.length} structures`;
  if (thead && tbody) {
    if (!res) {
      thead.innerHTML = `<tr><th>On</th><th>Structure File</th><th>X Value</th><th>Interlayer Distances (Å)</th></tr>`;
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:18px; color:#64748b;">No structure files loaded yet. Drop or select <code>*.cif</code>, <code>*.cell</code>, <code>*.xsd</code>, <code>*.castep</code>, <code>*.msi</code>, <code>*.car</code>, or <code>POSCAR</code> files above.</td></tr>`;
    } else {
      const mMode = res.opts.metricMode;
      const unitLbl = mMode === "pct" ? "%" : "Å";
      const prefix = mMode === "abs" ? "" : (mMode === "pct" ? "Δ% " : "Δ");
      const allItemsSorted = [...POST_DATA_STATE.items].sort((a, b) => a.xVal - b.xVal);
      const rowById = new Map(res.rows.map(r => [r.id, r]));

      thead.innerHTML = `<tr>
        <th style="width:32px; text-align:center;">On</th>
        <th>Structure File</th>
        <th style="width:94px;">X Value</th>
        ${res.seriesStats.map(sd => `<th style="color:${sd.color};">${prefix}${escapeHtml(sd.shortLabel)}<br/><span style="font-size:9.5px; font-weight:600; color:#64748b;">${escapeHtml(sd.pairName)} (${unitLbl})</span></th>`).join("")}
        <th>D<sub>tot</sub> (Å)</th>
        <th>a / c (Å)</th>
        <th style="width:30px;"></th>
      </tr>`;

      const fmtBadgeStyle = {
        CIF: "background:#e0f2fe; color:#0369a1;",
        CELL: "background:#fef3c7; color:#b45309;",
        XSD: "background:#ede9fe; color:#6d28d9;",
        CASTEP: "background:#dcfce7; color:#15803d;",
        MSI: "background:#fae8ff; color:#a21caf;",
        CAR: "background:#fce7f3; color:#be185d;",
        VASP: "background:#e2e8f0; color:#334155;",
        XYZ: "background:#f1f5f9; color:#475569;"
      };

      tbody.innerHTML = allItemsSorted.map(it => {
        const r = rowById.get(it.id);
        const fmt = it.format || "CIF";
        const fmtTag = `<span class="pd-fmt-badge" style="${fmtBadgeStyle[fmt] || "background:#f1f5f9; color:#334155;"}">${escapeHtml(fmt)}</span>`;
        const refTag = r?.isRef ? `<span class="badge badge-blue" style="font-size:9px; margin-left:4px;">Ref</span>` : "";
        const rowBg = r?.isRef ? "background:#eff6ff; font-weight:700;" : (!it.enabled ? "opacity:0.45; background:#f8fafc;" : "");
        const cells = res.seriesStats.map(sd => {
          if (!r) return `<td style="color:#94a3b8;">—</td>`;
          const v = mMode === "abs" ? r.absVals[sd.id] : (mMode === "pct" ? r.pctVals[sd.id] : r.deltaVals[sd.id]);
          if (!isFinite(v)) return `<td>—</td>`;
          const txt = (mMode !== "abs" && v > 1e-7 ? "+" : "") + v.toFixed(mMode === "pct" ? 3 : 4);
          return `<td style="font-family:monospace; color:${sd.color}; font-weight:600;">${txt}</td>`;
        }).join("");
        return `<tr style="${rowBg}">
          <td style="text-align:center;"><input type="checkbox" ${it.enabled ? "checked" : ""} onchange="togglePostDataItemEnabled('${escapeHtml(it.id)}', this.checked)" /></td>
          <td style="font-weight:700; white-space:nowrap;">${fmtTag}${escapeHtml(it.filename)}${refTag}</td>
          <td><input type="number" step="0.1" value="${it.xVal}" class="castep-input-sm" style="width:76px; font-family:monospace;" onchange="updatePostDataItemX('${escapeHtml(it.id)}', this.value)" title="Edit parameter X value for this structure" /></td>
          ${cells}
          <td style="font-family:monospace;">${r && isFinite(r.totalThicknessA) ? r.totalThicknessA.toFixed(4) : "—"}</td>
          <td style="font-family:monospace; font-size:10.5px; color:#475569;">${it.crystal.a.toFixed(3)} / ${it.crystal.c.toFixed(2)}</td>
          <td><button type="button" class="castep-preset-chip" style="padding:1px 6px; color:#dc2626;" onclick="removePostDataItem('${escapeHtml(it.id)}')" title="Remove structure">×</button></td>
        </tr>`;
      }).join("");
    }
  }

  // 5) Render Table 2: Atomic Layer Definitions, Linear Slope & Active Curve Fit Summary
  const sumTbody = document.getElementById("post-data-summary-tbody");
  if (sumTbody) {
    if (!res || !res.seriesStats.length) {
      sumTbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:14px; color:#64748b;">Load crystal structures to inspect atomic layer definitions, linear slopes, and curve fits.</td></tr>`;
    } else {
      const activeFit = res.opts.fitMode || "connect";
      const useCurveR2 = /^poly[1-4]$/.test(activeFit) || activeFit === "smooth";
      sumTbody.innerHTML = res.seriesStats.map(sd => {
        const cf = sd.curveFit || {};
        const r2Disp = (useCurveR2 && isFinite(cf.r2)) ? cf.r2 : sd.r2;
        const eqDisp = cf.eqText || "Point-to-point";
        const customBadge = sd.kind === "custom_layer" ? ` <span class="pd-fmt-badge" style="background:#fef3c7; color:#b45309; margin-left:4px;">Custom</span>` : "";
        return `<tr>
          <td style="font-weight:800; color:${sd.color}; white-space:nowrap;"><span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${sd.color}; margin-right:5px;"></span>${escapeHtml(sd.shortLabel)}${customBadge}</td>
          <td style="font-weight:700; white-space:nowrap;">${escapeHtml(sd.pairName)}</td>
          <td style="font-family:monospace; font-weight:700;">${isFinite(sd.refVal) ? sd.refVal.toFixed(4) : "—"}</td>
          <td style="font-family:monospace;">${sd.minDel >= 0 ? "+" : ""}${sd.minDel.toFixed(4)}</td>
          <td style="font-family:monospace;">${sd.maxDel >= 0 ? "+" : ""}${sd.maxDel.toFixed(4)}</td>
          <td style="font-family:monospace; font-weight:700; color:#0369a1;">${sd.slope >= 0 ? "+" : ""}${sd.slope.toFixed(5)}</td>
          <td style="font-family:monospace; font-size:11px; color:#334155;">${escapeHtml(eqDisp)}</td>
          <td style="font-family:monospace; font-weight:700; color:${r2Disp >= 0.98 ? "#047857" : "#64748b"};">${isFinite(r2Disp) ? r2Disp.toFixed(4) : "—"}</td>
        </tr>`;
      }).join("");
    }
  }
}
window.renderPostDataTab = renderPostDataTab;

// ---------------- Publication Exports (Copy HD, Copy TSV, PNG, CSV, Multi-Tab Excel) ----------------

function buildPostDataExportTables() {
  const res = POST_DATA_STATE.lastResult;
  if (!res || !res.rows.length) return null;
  const xCol = res.opts.xAxisLabel.replace(/[^A-Za-z0-9_()/% .-]/g, "").trim() || "X_Param";
  const sIds = res.seriesStats;

  const deltaHeaders = ["CIF_File", xCol, ...sIds.map(s => `Delta_${s.shortLabel}_${s.pairName}_A`), "Delta_Dtot_A"];
  const deltaRows = res.rows.map(r => [
    r.filename, Number(r.xPlot.toFixed(6)),
    ...sIds.map(s => isFinite(r.deltaVals[s.id]) ? Number(r.deltaVals[s.id].toFixed(6)) : ""),
    isFinite(r.deltaThicknessA) ? Number(r.deltaThicknessA.toFixed(6)) : ""
  ]);

  const absHeaders = ["CIF_File", xCol, ...sIds.map(s => `${s.shortLabel}_${s.pairName}_A`), "Total_Thickness_A", "Lattice_a_A", "Lattice_b_A", "Lattice_c_A"];
  const absRows = res.rows.map(r => [
    r.filename, Number(r.xPlot.toFixed(6)),
    ...sIds.map(s => isFinite(r.absVals[s.id]) ? Number(r.absVals[s.id].toFixed(6)) : ""),
    isFinite(r.totalThicknessA) ? Number(r.totalThicknessA.toFixed(6)) : "",
    Number(r.a.toFixed(5)), Number(r.b.toFixed(5)), Number(r.c.toFixed(5))
  ]);

  const pctHeaders = ["CIF_File", xCol, ...sIds.map(s => `Pct_${s.shortLabel}_${s.pairName}`)];
  const pctRows = res.rows.map(r => [
    r.filename, Number(r.xPlot.toFixed(6)),
    ...sIds.map(s => isFinite(r.pctVals[s.id]) ? Number(r.pctVals[s.id].toFixed(4)) : "")
  ]);

  const summaryHeaders = ["Series", "Atomic_Pair", "Ref_d0_A", "Min_Delta_A", "Max_Delta_A", "Linear_Slope_A_per_X", "Active_Fit_Model", "Fit_R2"];
  const summaryRows = sIds.map(s => {
    const cf = s.curveFit || {};
    const r2Val = isFinite(cf.r2) ? cf.r2 : s.r2;
    return [
      s.shortLabel, s.pairName,
      Number(s.refVal.toFixed(6)), Number(s.minDel.toFixed(6)), Number(s.maxDel.toFixed(6)),
      Number(s.slope.toFixed(6)), cf.eqText || "Point-to-point", Number((isFinite(r2Val) ? r2Val : 0).toFixed(5))
    ];
  });

  // Also build dense Fitted Curve sheet when a Fit / Spline / Smooth curve is active!
  const fitMode = res.opts.fitMode || "connect";
  const hasFitCurve = fitMode !== "connect" && fitMode !== "scatter";
  let fitSheet = null;
  if (hasFitCurve) {
    const visibleAll = sIds.filter(sd => sd.curveFit && sd.curveFit.pts && sd.curveFit.pts.length >= 2);
    if (visibleAll.length) {
      const unitLbl = res.opts.metricMode === "pct" ? "%" : "Å";
      const fitLbl = visibleAll[0].curveFit.label || fitMode;
      const nFit = visibleAll[0].curveFit.pts.length;
      const fitHeaders = [
        `X_fit (${xCol})`,
        ...visibleAll.map(s => {
          const r2Str = isFinite(s.curveFit.r2) ? ` | R2=${s.curveFit.r2.toFixed(4)}` : "";
          return `${s.shortLabel}_${s.pairName}_Fit_${fitLbl} (${unitLbl}${r2Str})`;
        })
      ];
      const fitRows = [];
      for (let i = 0; i < nFit; i++) {
        const xVal = visibleAll[0].curveFit.pts[i][0];
        fitRows.push([
          Number(xVal.toFixed(6)),
          ...visibleAll.map(s => {
            const pt = s.curveFit.pts[i];
            return (pt && isFinite(pt[1])) ? Number(pt[1].toFixed(6)) : "";
          })
        ]);
      }
      fitSheet = { name: `Fitted_Curves_${fitLbl.replace(/\s+/g, "")}`, headers: fitHeaders, rows: fitRows };
    }
  }

  const seed = String(res.refItem.crystal.formula || "Crystal").replace(/[^A-Za-z0-9_-]/g, "_");
  return {
    seed,
    deltaSheet: { name: "Delta_d_vs_X", headers: deltaHeaders, rows: deltaRows },
    absSheet: { name: "Absolute_d_vs_X", headers: absHeaders, rows: absRows },
    pctSheet: { name: "Relative_Pct_vs_X", headers: pctHeaders, rows: pctRows },
    summarySheet: { name: "Layer_Slopes_Summary", headers: summaryHeaders, rows: summaryRows },
    fitSheet
  };
}
window.buildPostDataExportTables = buildPostDataExportTables;

function buildPostDataPlotClipboardTable(res) {
  if (!res || !res.rows || !res.rows.length) return null;
  const metric = res.opts.metricMode || "delta";
  const fitMode = res.opts.fitMode || "connect";
  const isBond = res.opts.measureMode === "bonds";
  const unit = metric === "pct" ? "%" : "Å";
  const metricTag = metric === "abs" ? "d" : (metric === "pct" ? "Δd/d0" : "Δd");
  const visible = res.seriesStats.filter(sd => !POST_DATA_STATE.hiddenSeries.has(sd.id));
  if (!visible.length) return null;

  const hasFit = fitMode !== "connect" && fitMode !== "scatter" &&
    visible.some(sd => sd.curveFit && sd.curveFit.pts && sd.curveFit.pts.length >= 2);
  const xLabel = res.opts.xAxisLabel || "X";
  const seriesName = (sd) => (res.opts.showPairLegend || isBond || sd.kind === "custom_layer") ? sd.fullLabel : `${sd.shortLabel} (${sd.pairName})`;

  const rawHeaders = [
    xLabel,
    ...visible.map(sd => `${seriesName(sd)} [${metricTag}, ${unit}]`)
  ];

  if (!hasFit) {
    const rows = res.rows.map(r => [
      Number(r.xPlot.toFixed(6)),
      ...visible.map(sd => {
        const v = metric === "abs" ? r.absVals[sd.id] : (metric === "pct" ? r.pctVals[sd.id] : r.deltaVals[sd.id]);
        return isFinite(v) ? Number(v.toFixed(6)) : "";
      })
    ]);
    return {
      title: isBond ? "Bond Distances vs. Parameter" : "Interlayer Distances vs. Parameter",
      headers: rawHeaders,
      rows
    };
  }

  // Side-by-side OriginPro-ready table: Raw DFT Scatter Data (left) + Dense Smooth Fitted Curves (right)!
  const fitRef = visible.find(sd => sd.curveFit && sd.curveFit.pts && sd.curveFit.pts.length >= 2);
  const fitLabel = fitRef?.curveFit?.label || fitMode;
  const nFit = fitRef ? fitRef.curveFit.pts.length : 0;
  const nRows = Math.max(res.rows.length, nFit);

  const fitHeaders = [
    `X_fit (${fitLabel})`,
    ...visible.map(sd => {
      const cf = sd.curveFit || {};
      const eqNote = (cf.eqText && cf.eqText !== "Point-to-point") ? ` | ${cf.eqText}` : "";
      const r2Note = isFinite(cf.r2) ? ` (R²=${cf.r2.toFixed(4)})` : "";
      return `${sd.shortLabel} Fit [${fitLabel}${r2Note}${eqNote}]`;
    })
  ];

  const headers = [...rawHeaders, ...fitHeaders];
  const rows = [];
  for (let i = 0; i < nRows; i++) {
    const r = res.rows[i];
    const leftCols = r
      ? [
          Number(r.xPlot.toFixed(6)),
          ...visible.map(sd => {
            const v = metric === "abs" ? r.absVals[sd.id] : (metric === "pct" ? r.pctVals[sd.id] : r.deltaVals[sd.id]);
            return isFinite(v) ? Number(v.toFixed(6)) : "";
          })
        ]
      : new Array(rawHeaders.length).fill("");

    const rightCols = (i < nFit && fitRef)
      ? [
          Number(fitRef.curveFit.pts[i][0].toFixed(6)),
          ...visible.map(sd => {
            const pt = sd.curveFit?.pts?.[i];
            return (pt && isFinite(pt[1])) ? Number(pt[1].toFixed(6)) : "";
          })
        ]
      : new Array(fitHeaders.length).fill("");

    rows.push([...leftCols, ...rightCols]);
  }

  return {
    title: `${isBond ? "Bond" : "Interlayer"} Plot Data + ${fitLabel} Curves`,
    headers,
    rows
  };
}
window.buildPostDataPlotClipboardTable = buildPostDataPlotClipboardTable;

async function copyPostDataTSV() {
  const res = POST_DATA_STATE.lastResult;
  if (!res) {
    if (typeof showToast === "function") showToast("No Post-Data results to copy.", "warning");
    return;
  }
  const tbl = buildPostDataPlotClipboardTable(res);
  if (!tbl || !tbl.rows.length) {
    if (typeof showToast === "function") showToast("No Post-Data results to copy.", "warning");
    return;
  }
  const tsv = [tbl.headers.join("\t"), ...tbl.rows.map(r => r.join("\t"))].join("\n");
  try {
    await navigator.clipboard.writeText(tsv);
    if (typeof showToast === "function") showToast(`Copied ${tbl.title} (${tbl.rows.length} rows × ${tbl.headers.length} cols, TSV) — paste directly into OriginPro / Excel!`, "success");
  } catch (_) {
    if (typeof showToast === "function") showToast("Clipboard blocked — use CSV or Excel export instead.", "warning");
  }
}
window.copyPostDataTSV = copyPostDataTSV;

function exportPostDataCSV() {
  const pkg = buildPostDataExportTables();
  const res = POST_DATA_STATE.lastResult;
  if (!pkg || !res) {
    if (typeof showToast === "function") showToast("No Post-Data results to export.", "warning");
    return;
  }
  const fitActive = res.opts.fitMode && res.opts.fitMode !== "connect" && res.opts.fitMode !== "scatter";
  const plotTbl = fitActive ? buildPostDataPlotClipboardTable(res) : null;
  const sheet = res.opts.metricMode === "abs" ? pkg.absSheet : (res.opts.metricMode === "pct" ? pkg.pctSheet : pkg.deltaSheet);
  const headers = plotTbl ? plotTbl.headers : sheet.headers;
  const rows = plotTbl ? plotTbl.rows : sheet.rows;
  const csv = (typeof buildCsvString === "function")
    ? buildCsvString(headers, rows)
    : [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const fname = `${pkg.seed}_${sheet.name}${fitActive ? "_" + res.opts.fitMode : ""}.csv`;
  triggerBlobDownload(new Blob([csv], { type: "text/csv;charset=utf-8" }), fname);
  if (typeof showToast === "function") showToast(`Exported ${fname} (${rows.length} rows × ${headers.length} cols)!`, "success");
}
window.exportPostDataCSV = exportPostDataCSV;

function exportPostDataXLSX() {
  const pkg = buildPostDataExportTables();
  if (!pkg || typeof buildXlsxBlob !== "function") {
    if (typeof showToast === "function") showToast("No Post-Data results to export.", "warning");
    return;
  }
  const sheets = [pkg.deltaSheet, pkg.absSheet, pkg.pctSheet, pkg.summarySheet];
  if (pkg.fitSheet) sheets.push(pkg.fitSheet);
  const blob = buildXlsxBlob(sheets);
  const fname = `${pkg.seed}_PostData_Interlayer_Distances.xlsx`;
  triggerBlobDownload(blob, fname);
  if (typeof showToast === "function") {
    showToast(`Exported multi-tab Excel workbook ${fname} (${sheets.map(s => s.name).join(" | ")})!`, "success");
  }
}
window.exportPostDataXLSX = exportPostDataXLSX;

async function copyPostDataHD(subPanelKey = null) {
  const res = POST_DATA_STATE.lastResult;
  if (!res) {
    if (typeof showToast === "function") showToast("No Post-Data figure to copy yet.", "warning");
    return;
  }
  const st = (typeof getCastepPlotStyle === "function") ? getCastepPlotStyle() : { exportScale: 4 };
  const scale = Number(st.exportScale || 4);
  window._castepRenderDprOverride = scale;
  drawPostDataCanvas(res);
  try {
    if (typeof copyCastepCanvasHD === "function") {
      await copyCastepCanvasHD("post-data-main-canvas", "Post-Data Interlayer Distance Plot", subPanelKey);
    }
  } finally {
    window._castepRenderDprOverride = null;
    drawPostDataCanvas(res);
  }
}
window.copyPostDataHD = copyPostDataHD;

async function exportPostDataPNG(subPanelKey = null) {
  const res = POST_DATA_STATE.lastResult;
  if (!res) {
    if (typeof showToast === "function") showToast("No Post-Data figure to export yet.", "warning");
    return;
  }
  const st = (typeof getCastepPlotStyle === "function") ? getCastepPlotStyle() : { exportScale: 4 };
  const scale = Number(st.exportScale || 4);
  const seed = String(res.refItem?.crystal?.formula || "Crystal").replace(/[^A-Za-z0-9_-]/g, "_");
  const modeTag = res.opts.measureMode === "bonds" ? "Bonds" : "Interlayer";
  window._castepRenderDprOverride = scale;
  drawPostDataCanvas(res);
  try {
    if (typeof exportCastepCanvasPNG === "function") {
      await exportCastepCanvasPNG("post-data-main-canvas", `${seed}_PostData_${modeTag}.png`, subPanelKey);
    }
  } finally {
    window._castepRenderDprOverride = null;
    drawPostDataCanvas(res);
  }
}
window.exportPostDataPNG = exportPostDataPNG;

window.addEventListener("resize", () => {
  const pane = document.getElementById("tab-post-data");
  if (pane && pane.classList.contains("active") && POST_DATA_STATE.lastResult) {
    drawPostDataCanvas(POST_DATA_STATE.lastResult);
  }
});
