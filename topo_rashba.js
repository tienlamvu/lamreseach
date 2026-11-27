// ============================================================================
// Post-Data Processing — Sub-Tab 2: Rashba Splitting, Spin Texture,
// First Brillouin Zone (FBZ) & Topological Diagnostics Analyzer (v171)
// Supports CASTEP Non-Collinear SOC, CASTEP Collinear, VASP Non-Collinear
// PROCAR & direct spin-texture tables.
// ============================================================================

const TR_BOHR_TO_ANG = 0.529177210903;
const TR_HA_TO_EV = 27.211386245988;
const TR_HBAR2_OVER_2M0 = 3.80998212; // eV * Å^2

window.TOPO_RASHBA_STATE = {
  activeSubTab: "distances", // "distances" | "rashba"
  dataset: null,             // parsed calculation bundle
  analysis: null,            // computed Rashba / Spin / FBZ / Topology package
  panelGeoms: [],            // interactive hover & right-click rects
  zoom: { A: 1.0, B: 1.0, C: 1.0, D: 1.0 },
  zoomTarget: "all",         // "all" | "A" | "B" | "C" | "D"
  wheelZoomEnabled: false,
  dragBound: false,
  hoverBound: false
};

// ---------------- Sub-Tab Switcher inside Post-Data Processing ----------------

function switchPostDataSubTab(subKey) {
  const key = (subKey === "rashba") ? "rashba" : "distances";
  TOPO_RASHBA_STATE.activeSubTab = key;
  const pDist = document.getElementById("pd-subpane-distances");
  const pRash = document.getElementById("pd-subpane-rashba");
  const bDist = document.getElementById("pd-subtab-btn-distances");
  const bRash = document.getElementById("pd-subtab-btn-rashba");
  if (pDist) pDist.style.display = key === "distances" ? "block" : "none";
  if (pRash) pRash.style.display = key === "rashba" ? "block" : "none";
  if (bDist) bDist.classList.toggle("active", key === "distances");
  if (bRash) bRash.classList.toggle("active", key === "rashba");
  if (key === "rashba") {
    initTopoRashbaTab();
    renderTopoRashbaAll();
  } else if (typeof renderPostDataTab === "function") {
    renderPostDataTab();
  }
}
window.switchPostDataSubTab = switchPostDataSubTab;

function initTopoRashbaTab() {
  if (!TOPO_RASHBA_STATE.dragBound) {
    const dz = document.getElementById("tr-dropzone");
    if (dz) {
      TOPO_RASHBA_STATE.dragBound = true;
      dz.addEventListener("dragover", (e) => { e.preventDefault(); dz.classList.add("drag-over"); });
      dz.addEventListener("dragleave", () => dz.classList.remove("drag-over"));
      dz.addEventListener("drop", async (e) => {
        e.preventDefault();
        dz.classList.remove("drag-over");
        const files = Array.from(e.dataTransfer?.files || []);
        if (files.length) await loadTopoRashbaFileList(files);
      });
    }
  }
  if (!TOPO_RASHBA_STATE.hoverBound) {
    const canvas = document.getElementById("tr-main-canvas");
    if (canvas) {
      TOPO_RASHBA_STATE.hoverBound = true;
      canvas.addEventListener("mousemove", _trHandleCanvasHover);
      canvas.addEventListener("mouseleave", () => {
        const rd = document.getElementById("tr-plot-readout");
        if (rd && TOPO_RASHBA_STATE.analysis) {
          rd.innerHTML = "Hover over any of the 4 panels (Rashba Dispersion, ΔE(k) Splitting, 2D Spin Texture, or First Brillouin Zone) to inspect exact numerical values.";
        }
      });
      if (typeof CASTEP_PLOT_CTX_SPECS !== "undefined" && !CASTEP_PLOT_CTX_SPECS["tr-main-canvas"]) {
        CASTEP_PLOT_CTX_SPECS["tr-main-canvas"] = {
          label: "Rashba, Spin Texture & Brillouin Zone",
          pngName: "Rashba_Spin_Topology_Full.png",
          dataItems: []
        };
      }
      canvas.title = "Hover for exact values • Ctrl+Scroll (or Wheel Zoom) to zoom any panel • Double-click to reset zoom • Right-click to Copy HD Image or TSV";
      canvas.addEventListener("contextmenu", (ev) => {
        if (typeof showCastepPlotContextMenu === "function") {
          ev.preventDefault();
          showCastepPlotContextMenu("tr-main-canvas", ev.clientX, ev.clientY);
        }
      });
      canvas.addEventListener("wheel", (ev) => {
        if (!TOPO_RASHBA_STATE.analysis) return;
        if (!ev.ctrlKey && !TOPO_RASHBA_STATE.wheelZoomEnabled) return;
        const rect = canvas.getBoundingClientRect();
        const mx = ev.clientX - rect.left, my = ev.clientY - rect.top;
        const halfW = rect.width * 0.5, halfH = rect.height * 0.5;
        const hitId = (my < halfH) ? (mx < halfW ? "A" : "B") : (mx < halfW ? "C" : "D");
        ev.preventDefault();
        const factor = ev.deltaY < 0 ? 1.15 : (1 / 1.15);
        const target = (TOPO_RASHBA_STATE.zoomTarget === "all" && ev.shiftKey) ? "all" : hitId;
        if (target === "all") {
          ["A", "B", "C", "D"].forEach(k => {
            TOPO_RASHBA_STATE.zoom[k] = Math.max(0.35, Math.min(6.0, Number((TOPO_RASHBA_STATE.zoom[k] * factor).toFixed(3))));
          });
        } else {
          TOPO_RASHBA_STATE.zoom[hitId] = Math.max(0.35, Math.min(6.0, Number((TOPO_RASHBA_STATE.zoom[hitId] * factor).toFixed(3))));
          TOPO_RASHBA_STATE.zoomTarget = hitId;
          const sel = document.getElementById("tr-zoom-target");
          if (sel) sel.value = hitId;
        }
        syncTopoRashbaZoomUI();
        renderTopoRashbaAll();
      }, { passive: false });
      canvas.addEventListener("dblclick", (ev) => {
        if (!TOPO_RASHBA_STATE.analysis) return;
        const rect = canvas.getBoundingClientRect();
        const mx = ev.clientX - rect.left, my = ev.clientY - rect.top;
        const halfW = rect.width * 0.5, halfH = rect.height * 0.5;
        const hitId = (my < halfH) ? (mx < halfW ? "A" : "B") : (mx < halfW ? "C" : "D");
        TOPO_RASHBA_STATE.zoom[hitId] = 1.0;
        syncTopoRashbaZoomUI();
        renderTopoRashbaAll();
        if (typeof showToast === "function") showToast(`Reset Panel (${hitId.toLowerCase()}) zoom to 100%.`, "info");
      });
    }
  }
  syncTopoRashbaZoomUI();
  syncPostPlotFormatUI();
}
window.initTopoRashbaTab = initTopoRashbaTab;

// ---------------- Vector & Linear Algebra Helpers ----------------

function _trCross(a, b) { return [a[1]*b[2] - a[2]*b[1], a[2]*b[0] - a[0]*b[2], a[0]*b[1] - a[1]*b[0]]; }
function _trDot(a, b) { return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]; }
function _trNorm(a) { return Math.sqrt(a[0]*a[0] + a[1]*a[1] + a[2]*a[2]); }
function _trEsc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function _trReciprocalFromAngstrom(vecsA) {
  if (!vecsA || vecsA.length !== 3) return [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const a = vecsA[0], b = vecsA[1], c = vecsA[2];
  const bc = _trCross(b, c), ca = _trCross(c, a), ab = _trCross(a, b);
  const vol = _trDot(a, bc);
  if (Math.abs(vol) < 1e-10) return [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const f = (2.0 * Math.PI) / vol;
  return [
    [bc[0]*f, bc[1]*f, bc[2]*f],
    [ca[0]*f, ca[1]*f, ca[2]*f],
    [ab[0]*f, ab[1]*f, ab[2]*f]
  ];
}

function _trKFracToCart(k, B) {
  return [
    k[0]*B[0][0] + k[1]*B[1][0] + k[2]*B[2][0],
    k[0]*B[0][1] + k[1]*B[1][1] + k[2]*B[2][1],
    k[0]*B[0][2] + k[1]*B[1][2] + k[2]*B[2][2]
  ];
}

function _trSolveLinearSystem(A, b) {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
    }
    if (Math.abs(M[piv][col]) < 1e-14) return null;
    if (piv !== col) [M[col], M[piv]] = [M[piv], M[col]];
    const d = M[col][col];
    for (let j = col; j <= n; j++) M[col][j] /= d;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = M[r][col];
      for (let j = col; j <= n; j++) M[r][j] -= f * M[col][j];
    }
  }
  return M.map(r => r[n]);
}

// ---------------- CASTEP & Spin-Texture Parsers ----------------

function _trParseCastepBands(text, filename) {
  const lines = String(text || "").replace(/\r\n/g, "\n").split("\n");
  let nk = 0, ns = 1, nelec = null, nelecUp = null, nelecDn = null, nb = 0;
  let efHa = 0, efHa2 = null;
  let vecsBohr = [];
  const kpts = [];

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    if (!l) continue;
    let m;
    if ((m = l.match(/^Number of k-points\s+(\d+)/i))) { nk = parseInt(m[1], 10); continue; }
    if ((m = l.match(/^Number of spin components\s+(\d+)/i))) { ns = parseInt(m[1], 10); continue; }
    if ((m = l.match(/^Number of electrons\s+([\d.+-]+)(?:\s+([\d.+-]+))?/i))) {
      nelecUp = parseFloat(m[1]);
      if (m[2] !== undefined) { nelecDn = parseFloat(m[2]); nelec = nelecUp + nelecDn; }
      else nelec = nelecUp;
      continue;
    }
    if ((m = l.match(/^Number of eigenvalues\s+(\d+)/i))) { nb = parseInt(m[1], 10); continue; }
    if ((m = l.match(/^Fermi energ(?:y|ies)\s*\(in atomic units\)\s+([+-]?[\d.eE+-]+)(?:\s+([+-]?[\d.eE+-]+))?/i))) {
      efHa = parseFloat(m[1]);
      if (m[2] !== undefined) efHa2 = parseFloat(m[2]);
      continue;
    }
    if (/^Unit cell vectors/i.test(l)) {
      vecsBohr = [];
      for (let r = 1; r <= 3 && i + r < lines.length; r++) {
        const nums = lines[i + r].trim().split(/\s+/).map(Number);
        if (nums.length >= 3 && nums.every(Number.isFinite)) vecsBohr.push(nums.slice(0, 3));
      }
      i += 3;
      continue;
    }
    if ((m = l.match(/^K-point\s+(\d+)\s+([+-]?[\d.eE+-]+)\s+([+-]?[\d.eE+-]+)\s+([+-]?[\d.eE+-]+)\s+([+-]?[\d.eE+-]+)/i))) {
      const kIdx = parseInt(m[1], 10);
      const kv = [parseFloat(m[2]), parseFloat(m[3]), parseFloat(m[4])];
      const w = parseFloat(m[5]);
      const eBySpin = Array.from({ length: ns }, () => []);
      let curS = -1;
      let j = i + 1;
      while (j < lines.length) {
        const lj = lines[j].trim();
        if (!lj) { j++; continue; }
        if (/^K-point\s+\d+/i.test(lj)) break;
        const sm = lj.match(/^Spin component\s+(\d+)/i);
        if (sm) { curS = parseInt(sm[1], 10) - 1; j++; continue; }
        if (curS >= 0 && curS < ns) {
          const val = parseFloat(lj);
          if (Number.isFinite(val)) {
            const efRef = (curS === 1 && efHa2 !== null) ? efHa2 : efHa;
            eBySpin[curS].push((val - efRef) * TR_HA_TO_EV);
          }
        }
        j++;
      }
      kpts.push({ idx: kIdx, k: kv, w, e: eBySpin });
      i = j - 1;
    }
  }
  if (!kpts.length) return null;
  kpts.sort((a, b) => a.idx - b.idx);
  const vecsA = vecsBohr.length === 3
    ? vecsBohr.map(r => r.map(v => v * TR_BOHR_TO_ANG))
    : [[3.2, 0, 0], [-1.6, 2.77128, 0], [0, 0, 20.0]];

  return {
    sourceFile: filename || "BandStr.bands",
    nk: kpts.length,
    ns,
    nb: nb || (kpts[0]?.e?.[0]?.length || 0),
    nelec, nelecUp, nelecDn,
    efEv: efHa * TR_HA_TO_EV,
    vecsA,
    kpoints: kpts
  };
}

function _trParseCastepMeta(castepText, paramText, cellText) {
  const ct = String(castepText || "");
  const pt = String(paramText || "");
  const clt = String(cellText || "");
  const combined = ct + "\n" + pt;

  const isNonCollinearSoc =
    /spin_orbit_coupling\s*[:=]\s*true/i.test(combined) ||
    /spin-orbit\s+coupling\s*[:=]\s*on/i.test(combined) ||
    /spin_treatment\s*[:=]\s*vector/i.test(combined) ||
    /treating system as non-collinear/i.test(combined);

  const isCollinear =
    !isNonCollinearSoc && (
      /spin_polarized\s*[:=]\s*true/i.test(combined) ||
      /treating system as spin-polarized/i.test(combined)
    );

  // Space group & Hermann-Mauguin symbol
  let sgNum = null, sgName = "";
  const sgM = ct.match(/Full crystallographic space group\s*=\s*(\d+)\s*:\s*([^\n\r]+)/i)
           || ct.match(/Space group\s*=\s*(\d+)\s*:\s*([^\n\r]+)/i);
  if (sgM) {
    sgNum = parseInt(sgM[1], 10);
    sgName = sgM[2].trim().split(",")[0].trim();
  }

  // Integrated spin vector (Non-collinear Sx, Sy, Sz OR Collinear Sz)
  let netSpinVec = [0, 0, 0];
  let hasSpinVec = false;
  const ncSpinMatches = [...ct.matchAll(/2\*Integrated Spin Density\s*\(Sx,Sy,Sz\)\s*=\s*([+-]?[\d.eE+-]+)\s+([+-]?[\d.eE+-]+)\s+([+-]?[\d.eE+-]+)/gi)];
  if (ncSpinMatches.length) {
    const last = ncSpinMatches[ncSpinMatches.length - 1];
    // 2*Integrated Spin Density in hbar/2 == magnetic moment in mu_B
    netSpinVec = [parseFloat(last[1]), parseFloat(last[2]), parseFloat(last[3])];
    hasSpinVec = true;
  } else {
    const colSpinMatches = [...ct.matchAll(/Integrated Spin Density\s*=\s*([+-]?[\d.eE+-]+)/gi)];
    if (colSpinMatches.length) {
      const last = colSpinMatches[colSpinMatches.length - 1];
      netSpinVec = [0, 0, parseFloat(last[1]) * 2.0]; // hbar/2 -> mu_B approx
      hasSpinVec = true;
    }
  }

  // Non-collinear Mulliken Atomic Spin Vectors (Species | Ion | Charge | Spin | Quantisation axis ux uy uz)
  const atomicSpins = [];
  const mp = ct.lastIndexOf("Atomic Populations (Mulliken)");
  if (mp >= 0) {
    const block = ct.slice(mp, mp + 4500).split(/\r?\n/);
    for (const line of block) {
      if (/^={5,}|^-{5,}|^Bond\s+Population/i.test(line.trim())) {
        if (atomicSpins.length && /Bond\s+Population/i.test(line)) break;
        continue;
      }
      // Non-collinear "up:" row has: Element Ion up: s p d f Total Charge Spin ux uy uz
      const mNc = line.match(/^\s*([A-Z][a-z]?)\s+(\d+)\s+up:\s+[\d.-]+\s+[\d.-]+\s+[\d.-]+\s+[\d.-]+\s+[\d.-]+\s+([+-]?[\d.]+)\s+([+-]?[\d.]+)\s+([+-]?[\d.]+)\s+([+-]?[\d.]+)\s+([+-]?[\d.]+)/);
      if (mNc) {
        const el = mNc[1], ion = parseInt(mNc[2], 10);
        const charge = parseFloat(mNc[3]), mag = parseFloat(mNc[4]);
        const ux = parseFloat(mNc[5]), uy = parseFloat(mNc[6]), uz = parseFloat(mNc[7]);
        atomicSpins.push({
          label: `${el}${ion}`, element: el, ion, charge, mag,
          axis: [ux, uy, uz],
          vec: [mag * ux, mag * uy, mag * uz]
        });
        continue;
      }
      // Collinear row: Element Ion s p d f Total Charge Spin
      const mCol = line.match(/^\s*([A-Z][a-z]?)\s+(\d+)\s+[\d.-]+\s+[\d.-]+\s+[\d.-]+\s+[\d.-]+\s+[\d.-]+\s+([+-]?[\d.]+)\s+([+-]?[\d.]+)\s*$/);
      if (mCol) {
        const el = mCol[1], ion = parseInt(mCol[2], 10);
        const charge = parseFloat(mCol[3]), sz = parseFloat(mCol[4]);
        atomicSpins.push({
          label: `${el}${ion}`, element: el, ion, charge, mag: Math.abs(sz),
          axis: [0, 0, sz >= 0 ? 1 : -1],
          vec: [0, 0, sz]
        });
      }
    }
  }

  // External electric field from .cell
  let efield = null;
  const efM = clt.match(/%BLOCK\s+EXTERNAL_EFIELD[\s\S]*?([+-]?[\d.eE+-]+)\s+([+-]?[\d.eE+-]+)\s+([+-]?[\d.eE+-]+)[\s\S]*?%ENDBLOCK\s+EXTERNAL_EFIELD/i);
  if (efM) efield = [parseFloat(efM[1]), parseFloat(efM[2]), parseFloat(efM[3])];

  // Extract atoms from .cell to check out-of-plane inversion symmetry breaking (e.g. Janus S vs Se)
  const cellAtoms = [];
  const posM = clt.match(/%BLOCK\s+POSITIONS_FRAC([\s\S]*?)%ENDBLOCK\s+POSITIONS_FRAC/i);
  if (posM) {
    posM[1].split(/\r?\n/).forEach(ln => {
      const m = ln.trim().match(/^([A-Z][a-z]?)\s+([+-]?[\d.eE+-]+)\s+([+-]?[\d.eE+-]+)\s+([+-]?[\d.eE+-]+)/);
      if (m) cellAtoms.push({ element: m[1], f: [parseFloat(m[2]), parseFloat(m[3]), parseFloat(m[4])] });
    });
  }

  // Infer inversion symmetry breaking from Space Group OR polar Janus composition OR external E-field
  const centrosymSGs = new Set([2,10,11,12,13,14,15,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,83,84,85,86,87,88,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,147,148,162,163,164,165,166,167,175,176,191,192,193,194,200,201,202,203,204,205,206,221,222,223,224,225,226,227,228,229,230]);
  let inversionBroken = null;
  if (sgNum !== null && sgNum > 1) {
    inversionBroken = !centrosymSGs.has(sgNum);
  }
  if (efield && Math.hypot(...efield) > 1e-4) inversionBroken = true;
  if (inversionBroken === null && cellAtoms.length >= 2) {
    // Check vertical mirror/inversion asymmetry along z
    const zs = cellAtoms.map(a => a.f[2]);
    const zMid = (Math.min(...zs) + Math.max(...zs)) * 0.5;
    let asym = false;
    for (const a of cellAtoms) {
      const mirrorExists = cellAtoms.some(b => b.element === a.element && Math.abs((b.f[2] - zMid) + (a.f[2] - zMid)) < 0.025);
      if (!mirrorExists) { asym = true; break; }
    }
    inversionBroken = asym;
  }

  // Formula
  let formula = "";
  const srcAtoms = cellAtoms.length ? cellAtoms : atomicSpins;
  if (srcAtoms.length) {
    const cnt = {};
    srcAtoms.forEach(a => { cnt[a.element] = (cnt[a.element] || 0) + 1; });
    formula = Object.entries(cnt).map(([e, n]) => n > 1 ? `${e}${n}` : e).join("");
  }

  return {
    isNonCollinearSoc,
    isCollinear,
    sgNum,
    sgName,
    inversionBroken,
    netSpinVec,
    hasSpinVec,
    netSpinMag: _trNorm(netSpinVec),
    atomicSpins,
    efield,
    formula
  };
}

function _trParseDirectSpinTable(text, filename) {
  // Parse optional direct spin-texture table (kx ky [kz] E Sx Sy Sz)
  const lines = String(text || "").replace(/\r\n/g, "\n").split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("#"));
  if (lines.length < 4) return null;
  const pts = [];
  for (const l of lines) {
    const parts = l.split(/[\s,;]+/).map(Number);
    if (parts.length >= 6 && parts.slice(0, 6).every(Number.isFinite)) {
      if (parts.length >= 7 && Number.isFinite(parts[6])) {
        pts.push({ kx: parts[0], ky: parts[1], kz: parts[2], e: parts[3], sx: parts[4], sy: parts[5], sz: parts[6] });
      } else {
        pts.push({ kx: parts[0], ky: parts[1], kz: 0, e: parts[2], sx: parts[3], sy: parts[4], sz: parts[5] });
      }
    }
  }
  return pts.length >= 4 ? { sourceFile: filename, points: pts } : null;
}

// ---------------- File Upload & Import from Data Analysis ----------------

async function handleTopoRashbaFileUpload(event) {
  const files = Array.from(event.target?.files || []);
  if (!files.length) return;
  await loadTopoRashbaFileList(files);
  event.target.value = "";
}
window.handleTopoRashbaFileUpload = handleTopoRashbaFileUpload;

async function loadTopoRashbaFileList(files) {
  let bandStrFile = null, fallbackBandsFile = null;
  let castepFile = null, paramFile = null, cellFile = null, spinTexFile = null;

  for (const f of files) {
    const low = f.name.toLowerCase();
    if (low.endsWith("_bandstr.bands")) {
      bandStrFile = f;
    } else if (low.endsWith(".bands") && !low.endsWith("_dos.bands")) {
      if (!fallbackBandsFile) fallbackBandsFile = f;
    } else if (low.endsWith(".castep") && !low.endsWith("_bandstr.castep") && !low.endsWith("_dos.castep")) {
      castepFile = f;
    } else if (low.endsWith(".castep") && !castepFile) {
      castepFile = f;
    } else if (low.endsWith(".param") && !low.endsWith("_bandstr.param")) {
      paramFile = f;
    } else if (low.endsWith(".param") && !paramFile) {
      paramFile = f;
    } else if (low.endsWith(".cell") && !low.endsWith("_dos.cell")) {
      if (!cellFile || low.endsWith("_bandstr.cell")) cellFile = f;
    } else if (low.endsWith(".dat") || low.endsWith(".tsv") || low.endsWith(".csv") || low.includes("spin")) {
      if (!spinTexFile) spinTexFile = f;
    }
  }

  const useBands = bandStrFile || fallbackBandsFile;
  if (!useBands) {
    if (typeof showToast === "function") {
      showToast("Please include a CASTEP *_BandStr.bands (or *.bands) file from your Non-Collinear SOC or Collinear calculation.", "warning");
    }
    return;
  }

  const [bandsTxt, castepTxt, paramTxt, cellTxt, spinTxt] = await Promise.all([
    useBands.text(),
    castepFile ? castepFile.text() : Promise.resolve(""),
    paramFile ? paramFile.text() : Promise.resolve(""),
    cellFile ? cellFile.text() : Promise.resolve(""),
    spinTexFile ? spinTexFile.text() : Promise.resolve("")
  ]);

  const bands = _trParseCastepBands(bandsTxt, useBands.name);
  if (!bands) {
    if (typeof showToast === "function") showToast(`Could not parse k-points/eigenvalues from ${useBands.name}.`, "error");
    return;
  }
  const meta = _trParseCastepMeta(castepTxt, paramTxt, cellTxt);
  if (bands.ns >= 2) { meta.isCollinear = true; meta.isNonCollinearSoc = false; }
  const directSpin = spinTxt ? _trParseDirectSpinTable(spinTxt, spinTexFile.name) : null;

  const seed = useBands.name.replace(/_BandStr\.bands$/i, "").replace(/\.bands$/i, "");
  TOPO_RASHBA_STATE.dataset = {
    seed,
    material: meta.formula || seed,
    filesLoaded: [useBands.name, castepFile?.name, paramFile?.name, cellFile?.name, spinTexFile?.name].filter(Boolean),
    bands,
    meta,
    directSpin
  };

  _trPopulateSelectorsFromDataset();
  renderTopoRashbaAll();
  if (typeof showToast === "function") {
    const modeTag = meta.isNonCollinearSoc ? "Non-Collinear SOC" : (meta.isCollinear ? "Collinear Spin" : "Non-Spin");
    showToast(`Loaded ${useBands.name} (${modeTag}, ${bands.nk} k-pts, ${bands.nb} bands)!`, "success");
  }
}
window.loadTopoRashbaFileList = loadTopoRashbaFileList;

function importActiveCastepJobToTopoRashba() {
  const job = (window.CASTEP_STUDIO_STATE?.jobs || []).find(j => j.id === CASTEP_STUDIO_STATE.activeJobId);
  if (!job || (!job.bandstr_bands && !job.dos_bands)) {
    if (typeof showToast === "function") {
      showToast("No active CASTEP calculation with *.bands loaded in Data Analysis yet. Load a folder or select files directly here!", "warning");
    }
    return;
  }
  const srcB = job.bandstr_bands || job.dos_bands;
  const vecsA = (srcB.vecs_bohr && srcB.vecs_bohr.length === 3)
    ? srcB.vecs_bohr.map(r => r.map(v => v * TR_BOHR_TO_ANG))
    : [[3.2, 0, 0], [-1.6, 2.77128, 0], [0, 0, 20.0]];

  const kpts = (srcB.kpoints || []).map((kp, idx) => ({
    idx: idx + 1,
    k: kp.k || [0, 0, 0],
    w: kp.w || (1.0 / Math.max(1, srcB.kpoints.length)),
    e: kp.e || [[]]
  }));

  const bands = {
    sourceFile: job.bandstr_bands ? `${job.seed || "Job"}_BandStr.bands` : `${job.seed || "Job"}.bands`,
    nk: kpts.length,
    ns: srcB.ns || 1,
    nb: kpts[0]?.e?.[0]?.length || 0,
    nelec: srcB.nelec || null,
    efEv: srcB.ef_ev || 0,
    vecsA,
    kpoints: kpts
  };
  const meta = _trParseCastepMeta(job.castep_text || "", job.param_text || "", job.cell_text || "");
  if (bands.ns >= 2) { meta.isCollinear = true; meta.isNonCollinearSoc = false; }
  if (!meta.formula && (job.material || window.CASTEP_STUDIO_STATE?.structure?.formula)) {
    meta.formula = job.material || CASTEP_STUDIO_STATE.structure.formula;
  }

  TOPO_RASHBA_STATE.dataset = {
    seed: job.seed || "CASTEP",
    material: meta.formula || job.material || job.seed || "Material",
    filesLoaded: [bands.sourceFile, "(from Data Analysis)"],
    bands,
    meta,
    directSpin: null
  };
  _trPopulateSelectorsFromDataset();
  renderTopoRashbaAll();
  if (typeof showToast === "function") showToast(`Imported active Data Analysis job: ${TOPO_RASHBA_STATE.dataset.material}`, "success");
}
window.importActiveCastepJobToTopoRashba = importActiveCastepJobToTopoRashba;

function clearTopoRashbaData() {
  TOPO_RASHBA_STATE.dataset = null;
  TOPO_RASHBA_STATE.analysis = null;
  TOPO_RASHBA_STATE.panelGeoms = [];
  renderTopoRashbaAll();
}
window.clearTopoRashbaData = clearTopoRashbaData;

function resetTopoRashbaSettings() {
  const setVal = (id, v) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.type === "checkbox") el.checked = Boolean(v);
    else el.value = String(v);
  };
  setVal("tr-band-pair", "vbm");
  setVal("tr-kcenter-select", "auto");
  setVal("tr-dk-window", "0.22");
  setVal("tr-spin-model", "auto");
  setVal("tr-dresselhaus-ratio", "0.0");
  setVal("tr-ecut-ev", "0.08");
  setVal("tr-bz-res", "360");
  setVal("tr-show-berry", true);
  setVal("tr-fmt-cmap", "rdbu");
  setVal("tr-fmt-height", "780");
  setVal("tr-fmt-panel-letters", true);
  setVal("tr-fmt-iso-contours", true);
  setVal("tr-fmt-show-basis", true);
  setVal("tr-fmt-show-kpath", true);
  setVal("tr-fmt-show-legends", true);
  TOPO_RASHBA_STATE.zoom = { A: 1.0, B: 1.0, C: 1.0, D: 1.0 };
  TOPO_RASHBA_STATE.zoomTarget = "all";
  setVal("tr-zoom-target", "all");
  syncTopoRashbaZoomUI();
  renderTopoRashbaAll();
  if (typeof showToast === "function") showToast("Reset Rashba, Spin Texture, Zoom & Topology settings to defaults.", "info");
}
window.resetTopoRashbaSettings = resetTopoRashbaSettings;

// ---------------- Interactive Zoom & Publication Plot Format Controllers ----------------

function syncTopoRashbaZoomUI() {
  const t = TOPO_RASHBA_STATE.zoomTarget || "all";
  const z = TOPO_RASHBA_STATE.zoom;
  const val = t === "all" ? ((z.A + z.B + z.C + z.D) / 4) : (z[t] || 1.0);
  const pct = Math.round(val * 100);
  const badge = document.getElementById("tr-zoom-badge");
  if (badge) badge.textContent = `${pct}%`;
  const slider = document.getElementById("tr-zoom-slider");
  if (slider) slider.value = String(Number(val.toFixed(2)));
  const sel = document.getElementById("tr-zoom-target");
  if (sel && sel.value !== t) sel.value = t;
}
window.syncTopoRashbaZoomUI = syncTopoRashbaZoomUI;

function setTopoRashbaZoomTarget(target) {
  TOPO_RASHBA_STATE.zoomTarget = ["all", "A", "B", "C", "D"].includes(target) ? target : "all";
  syncTopoRashbaZoomUI();
}
window.setTopoRashbaZoomTarget = setTopoRashbaZoomTarget;

function stepTopoRashbaZoom(dir) {
  const factor = dir > 0 ? 1.2 : (1 / 1.2);
  const t = TOPO_RASHBA_STATE.zoomTarget || "all";
  const keys = t === "all" ? ["A", "B", "C", "D"] : [t];
  keys.forEach(k => {
    TOPO_RASHBA_STATE.zoom[k] = Math.max(0.35, Math.min(6.0, Number((TOPO_RASHBA_STATE.zoom[k] * factor).toFixed(3))));
  });
  syncTopoRashbaZoomUI();
  renderTopoRashbaAll();
}
window.stepTopoRashbaZoom = stepTopoRashbaZoom;

function setTopoRashbaZoomValue(rawVal) {
  const v = Math.max(0.35, Math.min(6.0, parseFloat(rawVal) || 1.0));
  const t = TOPO_RASHBA_STATE.zoomTarget || "all";
  const keys = t === "all" ? ["A", "B", "C", "D"] : [t];
  keys.forEach(k => { TOPO_RASHBA_STATE.zoom[k] = v; });
  syncTopoRashbaZoomUI();
  renderTopoRashbaAll();
}
window.setTopoRashbaZoomValue = setTopoRashbaZoomValue;

function resetTopoRashbaZoom(targetOverride = null) {
  const t = targetOverride || "all";
  const keys = t === "all" ? ["A", "B", "C", "D"] : [t];
  keys.forEach(k => { TOPO_RASHBA_STATE.zoom[k] = 1.0; });
  syncTopoRashbaZoomUI();
  renderTopoRashbaAll();
}
window.resetTopoRashbaZoom = resetTopoRashbaZoom;

function toggleTopoRashbaWheelZoom(checked) {
  TOPO_RASHBA_STATE.wheelZoomEnabled = !!checked;
  if (typeof showToast === "function") {
    showToast(checked ? "Wheel Zoom ON: scroll directly over any of the 4 panels to zoom in/out." : "Wheel Zoom OFF: hold Ctrl + Scroll to zoom panels.", "info");
  }
}
window.toggleTopoRashbaWheelZoom = toggleTopoRashbaWheelZoom;

function syncPostPlotFormatUI() {
  const st = typeof getCastepPlotStyle === "function" ? getCastepPlotStyle() : {
    preset: "journal_tnr", fontFamily: "'Times New Roman', Times, serif",
    titleSize: 14, axisLabelSize: 13, tickSize: 11.5, legendSize: 11,
    borderWidth: 1.5, lineWidth: 2.0, tickDir: "in", gridMode: "subtle", inkColor: "#000000", boldAxes: true, exportScale: 4
  };
  ["tr", "pd"].forEach(pfx => {
    const setV = (sfx, v) => {
      const el = document.getElementById(`${pfx}-fmt-${sfx}`);
      if (!el) return;
      if (el.type === "checkbox") el.checked = Boolean(v);
      else el.value = String(v);
    };
    setV("preset", st.preset || "journal_tnr");
    setV("font", st.fontFamily);
    setV("title-size", st.titleSize);
    setV("axis-size", st.axisLabelSize);
    setV("tick-size", st.tickSize);
    setV("border-w", st.borderWidth);
    setV("line-w", st.lineWidth);
    setV("tick-dir", st.tickDir);
    setV("grid", st.gridMode);
    setV("dpi", st.exportScale || 4);
    setV("bold-axes", !!st.boldAxes);
  });
}
window.syncPostPlotFormatUI = syncPostPlotFormatUI;

function applyPostPlotStylePreset(presetKey) {
  if (typeof applyCastepPlotStylePreset === "function") {
    applyCastepPlotStylePreset(presetKey);
  }
  syncPostPlotFormatUI();
  if (typeof renderPostDataTab === "function") renderPostDataTab();
  renderTopoRashbaAll();
}
window.applyPostPlotStylePreset = applyPostPlotStylePreset;

function updatePostPlotFormatFromUI(prefix = "tr") {
  const clamp = (v, lo, hi, fb) => { const n = parseFloat(v); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : fb; };
  const cur = typeof getCastepPlotStyle === "function" ? getCastepPlotStyle() : {};
  const g = (sfx) => document.getElementById(`${prefix}-fmt-${sfx}`);
  const next = {
    ...cur,
    preset: "custom",
    fontFamily: g("font")?.value || cur.fontFamily || "'Times New Roman', Times, serif",
    titleSize: clamp(g("title-size")?.value, 10, 22, cur.titleSize || 14),
    axisLabelSize: clamp(g("axis-size")?.value, 9, 20, cur.axisLabelSize || 13),
    tickSize: clamp(g("tick-size")?.value, 8, 18, cur.tickSize || 11.5),
    legendSize: clamp(g("tick-size")?.value ? (parseFloat(g("tick-size").value) - 0.5) : cur.legendSize, 8, 16, cur.legendSize || 11),
    borderWidth: clamp(g("border-w")?.value, 0.8, 3.5, cur.borderWidth || 1.5),
    lineWidth: clamp(g("line-w")?.value, 0.8, 4.0, cur.lineWidth || 2.0),
    tickDir: g("tick-dir")?.value || cur.tickDir || "in",
    gridMode: g("grid")?.value || cur.gridMode || "subtle",
    boldAxes: g("bold-axes") ? !!g("bold-axes").checked : (cur.boldAxes !== false),
    exportScale: clamp(g("dpi")?.value, 2, 6, cur.exportScale || 4)
  };
  if (typeof saveCastepPlotStyle === "function") saveCastepPlotStyle(next);
  if (typeof syncCastepPlotStyleUI === "function") syncCastepPlotStyleUI();
  syncPostPlotFormatUI();
  if (typeof rerenderAllActiveCastepPlots === "function") rerenderAllActiveCastepPlots();
  else {
    if (typeof renderPostDataTab === "function") renderPostDataTab();
    renderTopoRashbaAll();
  }
}
window.updatePostPlotFormatFromUI = updatePostPlotFormatFromUI;

function focusPostPlotFormatCard(prefix = null) {
  const pfx = prefix || (TOPO_RASHBA_STATE.activeSubTab === "rashba" ? "tr" : "pd");
  const det = document.getElementById(`${pfx}-format-details`);
  if (det) det.open = true;
  const card = document.getElementById(`${pfx}-format-card`);
  if (card) {
    syncPostPlotFormatUI();
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    card.classList.add("pd-card-flash");
    setTimeout(() => card.classList.remove("pd-card-flash"), 1400);
  }
}
window.focusPostPlotFormatCard = focusPostPlotFormatCard;

// ---------------- Exact 2D First Brillouin Zone (Wigner-Seitz Clipper) ----------------

function _trClipPolygonHalfPlane(poly, nx, ny, rhs) {
  // Keep points satisfying nx*x + ny*y <= rhs
  if (!poly.length) return [];
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const A = poly[i];
    const B = poly[(i + 1) % poly.length];
    const dA = nx * A[0] + ny * A[1] - rhs;
    const dB = nx * B[0] + ny * B[1] - rhs;
    const inA = dA <= 1e-9;
    const inB = dB <= 1e-9;
    if (inA && inB) {
      out.push(B);
    } else if (inA && !inB) {
      const t = dA / (dA - dB);
      out.push([A[0] + t * (B[0] - A[0]), A[1] + t * (B[1] - A[1])]);
    } else if (!inA && inB) {
      const t = dA / (dA - dB);
      out.push([A[0] + t * (B[0] - A[0]), A[1] + t * (B[1] - A[1])]);
      out.push(B);
    }
  }
  return out;
}

function _trBuildReciprocalAndFBZ(vecsA, kpoints) {
  const B = _trReciprocalFromAngstrom(vecsA);
  // Pick the 2 in-plane reciprocal vectors (exclude the shortest b_i corresponding to vacuum axis in 2D slabs)
  const aNorms = vecsA.map(_trNorm);
  const bNorms = B.map(_trNorm);
  // Usually c (index 2) is the slab normal if aNorms[2] > 1.8 * max(aNorms[0], aNorms[1])
  const b1 = [B[0][0], B[0][1]];
  const b2 = [B[1][0], B[1][1]];
  const b1Len = Math.hypot(b1[0], b1[1]) || 1.0;
  const b2Len = Math.hypot(b2[0], b2[1]) || 1.0;
  const cosGammaStar = Math.max(-1, Math.min(1, (b1[0]*b2[0] + b1[1]*b2[1]) / (b1Len * b2Len)));
  const gammaStarDeg = Math.acos(cosGammaStar) * 180 / Math.PI;
  const isHex = Math.abs(b1Len - b2Len) / Math.max(b1Len, b2Len) < 0.035 && (Math.abs(gammaStarDeg - 60) < 3.5 || Math.abs(gammaStarDeg - 120) < 3.5);
  const isSquare = Math.abs(b1Len - b2Len) / Math.max(b1Len, b2Len) < 0.035 && Math.abs(gammaStarDeg - 90) < 3.0;
  const isRect = !isSquare && Math.abs(gammaStarDeg - 90) < 3.0;
  const latticeType = isHex ? "Hexagonal / Trigonal" : (isSquare ? "Square / Tetragonal" : (isRect ? "Rectangular / Orthorhombic" : "Oblique / Monoclinic"));

  // Exact Wigner-Seitz FBZ polygon via half-plane clipping
  const R = Math.max(b1Len, b2Len) * 1.8;
  let poly = [[-R, -R], [R, -R], [R, R], [-R, R]];
  for (let h = -2; h <= 2; h++) {
    for (let k = -2; k <= 2; k++) {
      if (h === 0 && k === 0) continue;
      const gx = h * b1[0] + k * b2[0];
      const gy = h * b1[1] + k * b2[1];
      const g2 = gx * gx + gy * gy;
      if (g2 < 1e-8) continue;
      poly = _trClipPolygonHalfPlane(poly, gx, gy, 0.5 * g2);
    }
  }
  // Remove near-duplicate vertices
  const cleanPoly = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], prev = cleanPoly[cleanPoly.length - 1];
    if (!prev || Math.hypot(p[0] - prev[0], p[1] - prev[1]) > 1e-4) cleanPoly.push(p);
  }
  if (cleanPoly.length > 2 && Math.hypot(cleanPoly[0][0] - cleanPoly[cleanPoly.length - 1][0], cleanPoly[0][1] - cleanPoly[cleanPoly.length - 1][1]) < 1e-4) {
    cleanPoly.pop();
  }

  // Canonical high-symmetry points in 2D Cartesian (Å^-1)
  const hsPts = [{ label: "Γ", xy: [0, 0], frac: [0, 0, 0] }];
  const cornersK = [];
  if (isHex && cleanPoly.length === 6) {
    // Alternating K (tau=+1) and K' (tau=-1) around the 6 vertices of the hexagon!
    cleanPoly.forEach((v, idx) => {
      const tau = idx % 2 === 0 ? 1 : -1;
      cornersK.push({ xy: v, tau, label: tau > 0 ? "K" : "K'" });
    });
    hsPts.push({ label: "K", xy: cleanPoly[0], frac: [1/3, 1/3, 0] });
    hsPts.push({ label: "K'", xy: cleanPoly[1], frac: [-1/3, 2/3, 0] });
    const mMid = [(cleanPoly[0][0] + cleanPoly[1][0]) * 0.5, (cleanPoly[0][1] + cleanPoly[1][1]) * 0.5];
    hsPts.push({ label: "M", xy: mMid, frac: [0.5, 0, 0] });
  } else if (cleanPoly.length >= 4) {
    const m1 = [(cleanPoly[0][0] + cleanPoly[1][0]) * 0.5, (cleanPoly[0][1] + cleanPoly[1][1]) * 0.5];
    const m2 = [(cleanPoly[1][0] + cleanPoly[2][0]) * 0.5, (cleanPoly[1][1] + cleanPoly[2][1]) * 0.5];
    hsPts.push({ label: "X", xy: m1, frac: [0.5, 0, 0] });
    hsPts.push({ label: isSquare ? "M" : "S", xy: cleanPoly[1], frac: [0.5, 0.5, 0] });
    if (!isSquare) hsPts.push({ label: "Y", xy: m2, frac: [0, 0.5, 0] });
  }

  // Fold any fractional k-point into the nearest Wigner-Seitz FBZ image in 2D Cartesian
  // (using a tiny first-quadrant tie-breaker + continuity bias so boundary points never jump to opposite edges!)
  const fold2D = (kFrac, prevXY = null) => {
    const c0 = _trKFracToCart(kFrac, B);
    let best = [c0[0], c0[1]], bestScore = Infinity;
    for (let h = -2; h <= 2; h++) {
      for (let k = -2; k <= 2; k++) {
        const px = c0[0] + h * b1[0] + k * b2[0];
        const py = c0[1] + h * b1[1] + k * b2[1];
        const d2 = px * px + py * py;
        // Prefer Wigner-Seitz interior; on exact boundary ties, prefer continuity with prevXY or +x/+y wedge
        const contTie = prevXY ? 1e-4 * ((px - prevXY[0]) ** 2 + (py - prevXY[1]) ** 2) : (-1e-5 * (px * 1.1 + py * 0.7));
        const score = d2 + contTie;
        if (score < bestScore) { bestScore = score; best = [px, py]; }
      }
    }
    return best;
  };

  // Label high-symmetry points along the actual DFT k-path (tight 0.0025 tolerance for ultra-dense Rashba meshes!)
  const labelKFrac = (k) => {
    const f = k.map(v => {
      let x = ((v % 1) + 1) % 1;
      if (x > 0.9975) x = 0;
      return x;
    });
    const d0 = (v) => Math.min(Math.abs(v), Math.abs(v - 1));
    const is0 = (v) => d0(v) < 0.0025;
    const isHalf = (v) => Math.abs(v - 0.5) < 0.0025;
    const isThird = (v) => Math.abs(v - 1/3) < 0.003;
    const isTwoThird = (v) => Math.abs(v - 2/3) < 0.003;

    if (is0(f[0]) && is0(f[1]) && is0(f[2])) return { label: "Γ", err: d0(f[0]) + d0(f[1]) + d0(f[2]) };
    if (is0(f[0]) && is0(f[1]) && isHalf(f[2])) return { label: "A", err: d0(f[0]) + d0(f[1]) + Math.abs(f[2] - 0.5) };
    if (isHex) {
      if (isThird(f[0]) && isThird(f[1]) && is0(f[2])) return { label: "K", err: Math.abs(f[0]-1/3) + Math.abs(f[1]-1/3) + d0(f[2]) };
      if (isTwoThird(f[0]) && isTwoThird(f[1]) && is0(f[2])) return { label: "K'", err: Math.abs(f[0]-2/3) + Math.abs(f[1]-2/3) + d0(f[2]) };
      if ((isTwoThird(f[0]) && isThird(f[1])) || (isThird(f[0]) && isTwoThird(f[1]))) {
        const err = Math.min(Math.abs(f[0]-2/3)+Math.abs(f[1]-1/3), Math.abs(f[0]-1/3)+Math.abs(f[1]-2/3));
        if (is0(f[2])) return { label: "K'", err: err + d0(f[2]) };
        if (isHalf(f[2])) return { label: "H'", err: err + Math.abs(f[2] - 0.5) };
      }
      if (isThird(f[0]) && isThird(f[1]) && isHalf(f[2])) return { label: "H", err: Math.abs(f[0]-1/3) + Math.abs(f[1]-1/3) + Math.abs(f[2]-0.5) };
      if ((isHalf(f[0]) && is0(f[1])) || (is0(f[0]) && isHalf(f[1])) || (isHalf(f[0]) && isHalf(f[1]))) {
        if (is0(f[2])) return { label: "M", err: d0(f[2]) };
        if (isHalf(f[2])) return { label: "L", err: Math.abs(f[2] - 0.5) };
      }
    } else {
      if (isHalf(f[0]) && is0(f[1]) && is0(f[2])) return { label: "X", err: Math.abs(f[0]-0.5) + d0(f[1]) + d0(f[2]) };
      if (is0(f[0]) && isHalf(f[1]) && is0(f[2])) return { label: "Y", err: d0(f[0]) + Math.abs(f[1]-0.5) + d0(f[2]) };
      if (isHalf(f[0]) && isHalf(f[1]) && is0(f[2])) return { label: isSquare ? "M" : "S", err: Math.abs(f[0]-0.5) + Math.abs(f[1]-0.5) + d0(f[2]) };
      if (is0(f[0]) && is0(f[1]) && isHalf(f[2])) return { label: "Z", err: d0(f[0]) + d0(f[1]) + Math.abs(f[2]-0.5) };
    }
    return null;
  };

  const kCartList = kpoints.map(kp => _trKFracToCart(kp.k, B));
  const kPath2D = [];
  let prevFolded = null;
  for (let i = 0; i < kpoints.length; i++) {
    const xy = fold2D(kpoints[i].k, prevFolded);
    kPath2D.push(xy);
    prevFolded = xy;
  }
  const pathHS = [];
  for (let i = 0; i < kpoints.length; i++) {
    const hit = labelKFrac(kpoints[i].k);
    const lbl = hit ? hit.label : null;
    const err = hit ? hit.err : 1.0;
    let isCorner = (i === 0 || i === kpoints.length - 1);
    if (!isCorner && i > 0 && i < kpoints.length - 1) {
      const v1 = [kCartList[i][0] - kCartList[i-1][0], kCartList[i][1] - kCartList[i-1][1], kCartList[i][2] - kCartList[i-1][2]];
      const v2 = [kCartList[i+1][0] - kCartList[i][0], kCartList[i+1][1] - kCartList[i][1], kCartList[i+1][2] - kCartList[i][2]];
      const n1 = _trNorm(v1), n2 = _trNorm(v2);
      if (n1 > 1e-6 && n2 > 1e-6 && _trDot(v1, v2) / (n1 * n2) < 0.96) isCorner = true;
    }
    if (lbl || isCorner) {
      const prev = pathHS[pathHS.length - 1];
      if (prev && lbl && prev.label === lbl && (i - prev.idx) <= 6) {
        // Keep the exact minimum-error point inside a dense cluster (e.g. exact [0,0,0] for Gamma!)
        if (err < prev.err) {
          prev.idx = i; prev.err = err; prev.frac = kpoints[i].k; prev.cart = kCartList[i]; prev.xy2D = kPath2D[i];
        }
      } else if (!prev || i - prev.idx >= 3 || (lbl && prev.label !== lbl)) {
        pathHS.push({
          idx: i,
          label: lbl || `P${pathHS.length + 1}`,
          err,
          frac: kpoints[i].k,
          cart: kCartList[i],
          xy2D: kPath2D[i]
        });
      }
    }
  }

  return {
    B, b1, b2, b1Len, b2Len, gammaStarDeg,
    latticeType, isHex, isSquare, isRect,
    is2DSlab: aNorms[2] > 1.8 * Math.max(aNorms[0], aNorms[1]),
    aNorms, bNorms,
    fbzPoly: cleanPoly,
    cornersK,
    hsPts,
    kCartList,
    kPath2D,
    pathHS
  };
}

// ---------------- Selector Hydration ----------------

function _trPopulateSelectorsFromDataset() {
  const ds = TOPO_RASHBA_STATE.dataset;
  if (!ds || !ds.bands) return;
  const fbz = _trBuildReciprocalAndFBZ(ds.bands.vecsA, ds.bands.kpoints);

  // Populate High-Symmetry Center selector
  const kcSel = document.getElementById("tr-kcenter-select");
  if (kcSel) {
    const opts = [`<option value="auto" selected>Auto (Γ / Band Extremum)</option>`];
    fbz.pathHS.forEach(p => {
      const fStr = `(${p.frac.map(v => v.toFixed(2)).join(",")})`;
      opts.push(`<option value="${p.idx}">${_trEsc(p.label)} [k#${p.idx + 1} ${fStr}]</option>`);
    });
    kcSel.innerHTML = opts.join("");
  }

  // Populate Band-Pair selector
  const bpSel = document.getElementById("tr-band-pair");
  if (bpSel) {
    const b = ds.bands;
    const isCol = b.ns >= 2;
    const opts = [
      `<option value="vbm" selected>VBM Doublet (Top Valence)</option>`,
      `<option value="cbm">CBM Doublet (Bottom Conduction)</option>`,
      `<option value="vbm2">VBM−1 Doublet (2nd Valence)</option>`,
      `<option value="cbm2">CBM+1 Doublet (2nd Conduction)</option>`
    ];
    // Find approximate VBM index to list nearby custom bands cleanly
    const vbmI = _trDetectVbmIndex(b);
    const lo = Math.max(0, vbmI - 5);
    const hi = Math.min(b.nb - (isCol ? 1 : 2), vbmI + 6);
    for (let bi = lo; bi <= hi; bi++) {
      if (isCol) opts.push(`<option value="custom:${bi}">Band #${bi + 1} (Spin ↑ vs ↓)</option>`);
      else opts.push(`<option value="custom:${bi}">Bands (#${bi + 1}, #${bi + 2})</option>`);
    }
    bpSel.innerHTML = opts.join("");
  }
}

function _trDetectVbmIndex(bands) {
  const kpts = bands.kpoints || [];
  const nb = bands.nb || 0;
  if (!kpts.length || !nb) return 0;
  // Prefer exact electron count when all bands are present (unfiltered .bands file)
  if (bands.ns === 1 && Number.isFinite(bands.nelec) && bands.nelec >= 2) {
    // In non-collinear SOC: 1 e- per spinor band -> VBM = round(nelec) - 1;
    // Check if band (nelec - 1) sits near or below 0 while band (nelec) sits above!
    const candSoc = Math.round(bands.nelec) - 1;
    if (candSoc >= 1 && candSoc + 1 < nb) {
      const maxSoc = Math.max(...kpts.map(kp => kp.e[0][candSoc]));
      const minNext = Math.min(...kpts.map(kp => kp.e[0][candSoc + 1]));
      if (maxSoc <= 0.15 && minNext >= -0.15) return candSoc;
    }
    const candNonSpin = Math.round(bands.nelec / 2) - 1;
    if (candNonSpin >= 1 && candNonSpin + 1 < nb) {
      const maxNS = Math.max(...kpts.map(kp => kp.e[0][candNonSpin]));
      const minNext = Math.min(...kpts.map(kp => kp.e[0][candNonSpin + 1]));
      if (maxNS <= 0.15 && minNext >= -0.15) return candNonSpin;
    }
  }
  // Fallback: highest band whose max energy <= +0.05 eV across spin 0
  let vbm = Math.max(1, Math.floor(nb / 2) - 1);
  for (let b = 0; b < nb; b++) {
    let bMax = -1e9;
    for (let i = 0; i < kpts.length; i++) {
      const v = kpts[i].e[0][b];
      if (v > bMax) bMax = v;
    }
    if (bMax <= 0.05) vbm = b;
  }
  return vbm;
}

// ---------------- Core Physics Engine: Rashba, Spin Texture, FBZ & Topology ----------------

function computeTopoRashbaAnalysis() {
  const ds = TOPO_RASHBA_STATE.dataset;
  if (!ds || !ds.bands) return null;
  const bands = ds.bands;
  const meta = ds.meta;
  const kpts = bands.kpoints;
  const nk = bands.nk;
  const isCol = bands.ns >= 2;
  const fbz = _trBuildReciprocalAndFBZ(bands.vecsA, kpts);

  // 1) Global Band Gap & VBM/CBM Detection
  const vbmIdx = _trDetectVbmIndex(bands);
  const cbmIdx = Math.min(bands.nb - 1, vbmIdx + 1);

  let vbmE = -1e9, vbmK = 0, cbmE = 1e9, cbmK = 0;
  let minDirectGap = 1e9, minDirectK = 0;
  let crossesFermi = false;

  for (let b = 0; b < bands.nb; b++) {
    let bMin = 1e9, bMax = -1e9;
    for (let s = 0; s < bands.ns; s++) {
      for (let i = 0; i < nk; i++) {
        const ev = kpts[i].e[s]?.[b];
        if (!Number.isFinite(ev)) continue;
        if (ev < bMin) bMin = ev;
        if (ev > bMax) bMax = ev;
      }
    }
    if (bMin < -0.02 && bMax > 0.02) crossesFermi = true;
  }

  for (let i = 0; i < nk; i++) {
    const ev = isCol
      ? Math.max(kpts[i].e[0][vbmIdx] ?? -1e9, kpts[i].e[1]?.[vbmIdx] ?? -1e9)
      : (kpts[i].e[0][vbmIdx] ?? -1e9);
    const ec = isCol
      ? Math.min(kpts[i].e[0][cbmIdx] ?? 1e9, kpts[i].e[1]?.[cbmIdx] ?? 1e9)
      : (kpts[i].e[0][cbmIdx] ?? 1e9);
    if (ev > vbmE) { vbmE = ev; vbmK = i; }
    if (ec < cbmE) { cbmE = ec; cbmK = i; }
    const dg = ec - ev;
    if (dg < minDirectGap) { minDirectGap = dg; minDirectK = i; }
  }
  const globalGap = crossesFermi ? 0.0 : Math.max(0.0, cbmE - vbmE);
  const isDirectGap = !crossesFermi && (Math.abs(vbmK - cbmK) <= 2);

  // Shift energy zero: VBM = 0 for semiconductors, E_F = 0 for metals
  const eShift = (!crossesFermi && globalGap >= 0.03) ? -vbmE : 0.0;
  const zeroRefLabel = (!crossesFermi && globalGap >= 0.03) ? "VBM = 0.000 eV" : "E_F = 0.000 eV";

  // 2) Select Active Band Pair (E_lower, E_upper)
  const bpChoice = document.getElementById("tr-band-pair")?.value || "vbm";
  let bLo = Math.max(0, vbmIdx - 1), bHi = vbmIdx, isConductionPair = false, pairLabel = "VBM Doublet";
  if (isCol) {
    if (bpChoice === "cbm") { bLo = cbmIdx; bHi = cbmIdx; isConductionPair = true; pairLabel = `CBM (Band #${cbmIdx + 1}, ↑ vs ↓)`; }
    else if (bpChoice === "vbm2") { bLo = Math.max(0, vbmIdx - 1); bHi = bLo; pairLabel = `VBM−1 (Band #${bLo + 1}, ↑ vs ↓)`; }
    else if (bpChoice === "cbm2") { bLo = Math.min(bands.nb - 1, cbmIdx + 1); bHi = bLo; isConductionPair = true; pairLabel = `CBM+1 (Band #${bLo + 1}, ↑ vs ↓)`; }
    else if (bpChoice.startsWith("custom:")) { bLo = parseInt(bpChoice.slice(7), 10) || vbmIdx; bHi = bLo; isConductionPair = bLo >= cbmIdx; pairLabel = `Band #${bLo + 1} (↑ vs ↓)`; }
    else { bLo = vbmIdx; bHi = vbmIdx; pairLabel = `VBM (Band #${vbmIdx + 1}, ↑ vs ↓)`; }
  } else {
    if (bpChoice === "cbm") { bLo = cbmIdx; bHi = Math.min(bands.nb - 1, cbmIdx + 1); isConductionPair = true; pairLabel = `CBM Doublet (#${bLo + 1}, #${bHi + 1})`; }
    else if (bpChoice === "vbm2") { bLo = Math.max(0, vbmIdx - 3); bHi = Math.max(1, vbmIdx - 2); pairLabel = `VBM−1 Doublet (#${bLo + 1}, #${bHi + 1})`; }
    else if (bpChoice === "cbm2") { bLo = Math.min(bands.nb - 2, cbmIdx + 2); bHi = bLo + 1; isConductionPair = true; pairLabel = `CBM+1 Doublet (#${bLo + 1}, #${bHi + 1})`; }
    else if (bpChoice.startsWith("custom:")) { bLo = Math.max(0, Math.min(bands.nb - 2, parseInt(bpChoice.slice(7), 10) || (vbmIdx - 1))); bHi = bLo + 1; isConductionPair = bLo >= cbmIdx; pairLabel = `Bands (#${bLo + 1}, #${bHi + 1})`; }
    else { bLo = Math.max(0, vbmIdx - 1); bHi = vbmIdx; pairLabel = `VBM Doublet (#${bLo + 1}, #${bHi + 1})`; }
  }

  const getPairE = (i) => {
    if (isCol) {
      const eu = (kpts[i].e[0][bLo] ?? 0) + eShift;
      const ed = (kpts[i].e[1]?.[bLo] ?? eu) + eShift;
      return eu <= ed ? [eu, ed] : [ed, eu];
    }
    const e1 = (kpts[i].e[0][bLo] ?? 0) + eShift;
    const e2 = (kpts[i].e[0][bHi] ?? e1) + eShift;
    return e1 <= e2 ? [e1, e2] : [e2, e1];
  };

  // 3) Select High-Symmetry Center k0 (default: Gamma if present, else extremum of chosen pair)
  const kcChoice = document.getElementById("tr-kcenter-select")?.value || "auto";
  let k0Idx = 0;
  let k0Label = "Γ";
  if (kcChoice !== "auto" && Number.isFinite(parseInt(kcChoice, 10))) {
    k0Idx = Math.max(0, Math.min(nk - 1, parseInt(kcChoice, 10)));
    const found = fbz.pathHS.find(p => p.idx === k0Idx);
    k0Label = found ? found.label : `k#${k0Idx + 1}`;
  } else {
    const gammaPt = fbz.pathHS.find(p => p.label === "Γ");
    if (gammaPt) {
      k0Idx = gammaPt.idx;
      k0Label = "Γ";
    } else {
      k0Idx = isConductionPair ? cbmK : vbmK;
      const near = fbz.pathHS.reduce((best, p) => (!best || Math.abs(p.idx - k0Idx) < Math.abs(best.idx - k0Idx)) ? p : best, null);
      k0Label = near && Math.abs(near.idx - k0Idx) <= 4 ? near.label : `k#${k0Idx + 1}`;
    }
  }

  // 4) Extract Signed k-Path Slice Around k0 within dkWin (Å^-1)
  const dkWin = Math.max(0.04, Math.min(1.2, parseFloat(document.getElementById("tr-dk-window")?.value) || 0.22));
  const k0Cart = fbz.kCartList[k0Idx];
  const slicePts = [];

  // Walk left from k0Idx and right from k0Idx while monotonic distance <= dkWin and before hitting another high-sym discontinuity
  const collectSide = (dir) => {
    const arr = [];
    let prevDist = 0;
    for (let step = 1; step < nk; step++) {
      const idx = k0Idx + dir * step;
      if (idx < 0 || idx >= nk) break;
      const c = fbz.kCartList[idx];
      const dist = Math.hypot(c[0] - k0Cart[0], c[1] - k0Cart[1], c[2] - k0Cart[2]);
      if (dist > dkWin) break;
      if (dist < prevDist - 1e-4) break; // folded back
      prevDist = dist;
      const [eLo, eHi] = getPairE(idx);
      arr.push({ idx, s: dir * dist, absK: dist, eLo, eHi, eAvg: 0.5 * (eLo + eHi), dE: Math.max(0, eHi - eLo) });
    }
    return arr;
  };
  const leftSide = collectSide(-1).reverse();
  const [eLo0, eHi0] = getPairE(k0Idx);
  const centerPt = { idx: k0Idx, s: 0, absK: 0, eLo: eLo0, eHi: eHi0, eAvg: 0.5 * (eLo0 + eHi0), dE: Math.max(0, eHi0 - eLo0) };
  const rightSide = collectSide(1);
  slicePts.push(...leftSide, centerPt, ...rightSide);

  // Determine left/right neighbor high-symmetry labels for axis labeling (e.g. K ← Γ → K')
  const leftHS = [...fbz.pathHS].reverse().find(p => p.idx < k0Idx);
  const rightHS = fbz.pathHS.find(p => p.idx > k0Idx);
  const leftAxisLbl = leftHS ? leftHS.label : "−k";
  const rightAxisLbl = rightHS ? rightHS.label : "+k";

  // 5) Direct Mexican-Hat Extremum Quantification (E_R, k_R, alpha_R = 2 E_R / k_R)
  // For valence bands: look for maximum of upper branch eHi strictly away from k0
  // For conduction bands: look for minimum of lower branch eLo strictly away from k0
  const findSideExtremum = (pts) => {
    if (pts.length < 3) return { ER: 0, kR: 0, alphaR: 0, sExt: 0, eExt: isConductionPair ? eLo0 : eHi0 };
    const all = pts[0].s < 0 ? [...pts, centerPt] : [centerPt, ...pts];
    let bestI = 0;
    for (let i = 1; i < all.length; i++) {
      if (isConductionPair) {
        if (all[i].eLo < all[bestI].eLo) bestI = i;
      } else {
        if (all[i].eHi > all[bestI].eHi) bestI = i;
      }
    }
    // Check if extremum is strictly interior (not pinned at boundary dkWin or at k0)
    const bestPt = all[bestI];
    const atCenter = Math.abs(bestPt.s) < 1e-5;
    const atOuterEdge = (pts[0].s < 0 && bestI === 0) || (pts[0].s > 0 && bestI === all.length - 1);
    if (atCenter || atOuterEdge) {
      return { ER: 0, kR: 0, alphaR: 0, sExt: 0, eExt: isConductionPair ? eLo0 : eHi0, interior: false };
    }
    // 3-point quadratic vertex refinement
    const pL = all[bestI - 1], pC = all[bestI], pR = all[bestI + 1];
    const yL = isConductionPair ? pL.eLo : pL.eHi;
    const yC = isConductionPair ? pC.eLo : pC.eHi;
    const yR = isConductionPair ? pR.eLo : pR.eHi;
    const x1 = pL.s, x2 = pC.s, x3 = pR.s;
    const sol = _trSolveLinearSystem([[x1*x1, x1, 1], [x2*x2, x2, 1], [x3*x3, x3, 1]], [yL, yC, yR]);
    let sExt = pC.s, eExt = yC;
    if (sol && Math.abs(sol[0]) > 1e-9) {
      const sv = -sol[1] / (2 * sol[0]);
      if (sv >= Math.min(x1, x3) && sv <= Math.max(x1, x3)) {
        sExt = sv;
        eExt = sol[0]*sv*sv + sol[1]*sv + sol[2];
      }
    }
    const ER = Math.max(0, isConductionPair ? (eLo0 - eExt) : (eExt - eHi0));
    const kR = Math.abs(sExt);
    const alphaR = kR > 1e-5 ? (2.0 * ER / kR) : 0;
    return { ER, kR, alphaR, sExt, eExt, interior: ER > 1e-5 };
  };

  const extLeft = findSideExtremum(leftSide);
  const extRight = findSideExtremum(rightSide);
  const extBest = (extRight.ER >= extLeft.ER) ? extRight : extLeft;

  // 6) Exact Bychkov-Rashba + Cubic Warping + Zeeman Splitting Fit:
  //    dE(k) = sqrt(Delta_Z^2 + (2*alpha_R*|k| + 2*gamma_3*|k|^3)^2)
  //    E_avg(k) = E0 + A*k^2  ->  m* = hbar^2 / (2*A)
  const deltaZ = centerPt.dE; // eV at k0
  const fitSplittingBranch = (pts) => {
    const valid = pts.filter(p => p.absK > 1e-4);
    if (valid.length < 2) return { alpha: 0, gamma3: 0, r2: 0, isMagPoly: false, c1: 0, c2: 0 };
    const meanY = valid.reduce((a, p) => a + p.dE, 0) / valid.length;
    let ssTot = 0;
    for (const p of valid) ssTot += Math.pow(p.dE - meanY, 2);

    // 1) Classic Bychkov-Rashba + Cubic fit: dE(k) = sqrt(Delta_Z^2 + (2*alpha_R*k + 2*gamma_3*k^3)^2)
    let s11 = 0, s12 = 0, s22 = 0, b1 = 0, b2 = 0;
    let linNum = 0, linDen = 0;
    for (const p of valid) {
      const y = Math.sqrt(Math.max(0, p.dE * p.dE - deltaZ * deltaZ));
      const x1 = 2.0 * p.absK;
      const x2 = 2.0 * p.absK * p.absK * p.absK;
      s11 += x1 * x1; s12 += x1 * x2; s22 += x2 * x2;
      b1 += x1 * y; b2 += x2 * y;
      linNum += x1 * y; linDen += x1 * x1;
    }
    let alpha = linDen > 1e-12 ? (linNum / linDen) : 0;
    let gamma3 = 0;
    if (valid.length >= 4) {
      const sol = _trSolveLinearSystem([[s11, s12], [s12, s22]], [b1, b2]);
      if (sol && Number.isFinite(sol[0]) && sol[0] >= 0) {
        alpha = sol[0];
        gamma3 = sol[1];
      }
    }
    let ssRes = 0;
    for (const p of valid) {
      const pred = Math.sqrt(deltaZ * deltaZ + Math.pow(2 * alpha * p.absK + 2 * gamma3 * Math.pow(p.absK, 3), 2));
      ssRes += Math.pow(p.dE - pred, 2);
    }
    const r2Rashba = ssTot > 1e-12 ? Math.max(0, 1.0 - ssRes / ssTot) : 1.0;

    // 2) For magnetic / large-Zeeman systems (Delta_Z >= 20 meV) where bands can converge below Delta_Z,
    //    also check smooth quadratic splitting dE(k) = Delta_Z + c1*k + c2*k^2
    if (deltaZ >= 0.02 && r2Rashba < 0.5) {
      let q11 = 0, q12 = 0, q22 = 0, qb1 = 0, qb2 = 0;
      for (const p of valid) {
        const y = p.dE - deltaZ;
        const k1 = p.absK, k2 = k1 * k1;
        q11 += k1 * k1; q12 += k1 * k2; q22 += k2 * k2;
        qb1 += k1 * y; qb2 += k2 * y;
      }
      const solQ = _trSolveLinearSystem([[q11, q12], [q12, q22]], [qb1, qb2]);
      if (solQ && Number.isFinite(solQ[0])) {
        let ssResQ = 0;
        for (const p of valid) {
          const pred = Math.max(0, deltaZ + solQ[0] * p.absK + solQ[1] * p.absK * p.absK);
          ssResQ += Math.pow(p.dE - pred, 2);
        }
        const r2Q = ssTot > 1e-12 ? Math.max(0, 1.0 - ssResQ / ssTot) : 1.0;
        if (r2Q > r2Rashba) {
          return { alpha: Math.abs(solQ[0]) * 0.5, gamma3: solQ[1] * 0.5, r2: r2Q, isMagPoly: true, c1: solQ[0], c2: solQ[1] };
        }
      }
    }
    return { alpha: Math.max(0, alpha), gamma3, r2: r2Rashba, isMagPoly: false, c1: 0, c2: 0 };
  };

  const fitAll = fitSplittingBranch(slicePts);
  const fitLeft = fitSplittingBranch(leftSide);
  const fitRight = fitSplittingBranch(rightSide);

  // Parabolic average effective mass m* around k0: E_avg(k) = E0 + A * k^2
  let mStar = 0.5;
  let e0Avg = centerPt.eAvg, quadA = isConductionPair ? 4.0 : -4.0;
  const parPts = slicePts.filter(p => p.absK <= Math.min(dkWin, 0.16));
  if (parPts.length >= 3) {
    let sx0 = 0, sx2 = 0, sx4 = 0, sy0 = 0, sy2 = 0;
    for (const p of parPts) {
      const k2 = p.absK * p.absK;
      sx0 += 1; sx2 += k2; sx4 += k2 * k2;
      sy0 += p.eAvg; sy2 += k2 * p.eAvg;
    }
    const solP = _trSolveLinearSystem([[sx0, sx2], [sx2, sx4]], [sy0, sy2]);
    if (solP && Math.abs(solP[1]) > 1e-3) {
      e0Avg = solP[0];
      quadA = solP[1];
      mStar = TR_HBAR2_OVER_2M0 / Math.abs(quadA);
    }
  }
  const mStarClamped = Math.max(0.02, Math.min(25.0, mStar));

  // Self-consistent Rashba parameters
  const alphaR = (extBest.interior && extBest.ER > 0.0005 && fitAll.alpha < 1e-4) ? extBest.alphaR : fitAll.alpha;
  const kRFit = (alphaR > 1e-5) ? (alphaR / (2.0 * Math.max(0.05, Math.abs(quadA)))) : 0;
  const ERFit = 0.5 * alphaR * kRFit; // eV
  const kRDisplay = extBest.interior ? extBest.kR : kRFit;
  const ERDisplay = extBest.interior ? extBest.ER : ERFit;
  const rashbaMethodTag = extBest.interior ? "Direct Extremum + k·p Fit" : "Bychkov-Rashba k·p Splitting Fit";
  // Spin precession length L_s = pi * hbar^2 / (2 * m* * alpha_R) = pi / (2 * k_R) in nm
  const spinPrecessionNm = (kRFit > 1e-5) ? (Math.PI / (2.0 * kRFit) * 0.1) : Infinity;

  // 7) High-Symmetry & Valley SOC Splitting Table
  const hsSplittings = fbz.pathHS.map(p => {
    const evLo = isCol ? Math.min(kpts[p.idx].e[0][vbmIdx], kpts[p.idx].e[1]?.[vbmIdx] ?? 0) : kpts[p.idx].e[0][Math.max(0, vbmIdx - 1)];
    const evHi = isCol ? Math.max(kpts[p.idx].e[0][vbmIdx], kpts[p.idx].e[1]?.[vbmIdx] ?? 0) : kpts[p.idx].e[0][vbmIdx];
    const ecLo = isCol ? Math.min(kpts[p.idx].e[0][cbmIdx], kpts[p.idx].e[1]?.[cbmIdx] ?? 0) : kpts[p.idx].e[0][cbmIdx];
    const ecHi = isCol ? Math.max(kpts[p.idx].e[0][cbmIdx], kpts[p.idx].e[1]?.[cbmIdx] ?? 0) : kpts[p.idx].e[0][Math.min(bands.nb - 1, cbmIdx + 1)];
    return {
      idx: p.idx,
      label: p.label,
      frac: p.frac,
      evTop: evHi + eShift,
      ecBot: ecLo + eShift,
      dEvMeV: Math.abs(evHi - evLo) * 1000,
      dEcMeV: Math.abs(ecHi - ecLo) * 1000,
      localGapEv: Math.max(0, ecLo - evHi)
    };
  });

  const kPtInfo = hsSplittings.find(h => h.label === "K");
  const kpPtInfo = hsSplittings.find(h => h.label === "K'");
  const valleySplitVMeV = (kPtInfo && kpPtInfo) ? (kPtInfo.evTop - kpPtInfo.evTop) * 1000 : 0;
  const valleySplitCMeV = (kPtInfo && kpPtInfo) ? (kPtInfo.ecBot - kpPtInfo.ecBot) * 1000 : 0;
  const dEvKMeV = kPtInfo ? kPtInfo.dEvMeV : (hsSplittings[0]?.dEvMeV || 0);
  const dEcKMeV = kPtInfo ? kPtInfo.dEcMeV : (hsSplittings[0]?.dEcMeV || 0);

  // 8) Symmetry, Time-Reversal & Topological Classification
  const trsBroken = (meta.netSpinMag > 0.05) || (isCol && Math.abs(valleySplitVMeV) > 2.0) || (deltaZ * 1000 > 10.0 && k0Label === "Γ");
  const pBroken = meta.inversionBroken === true || (alphaR > 0.005) || (fbz.isHex && dEvKMeV > 20.0);

  // Auto-select Spin Texture Hamiltonian model
  const userSpinModel = document.getElementById("tr-spin-model")?.value || "auto";
  let spinModel = userSpinModel;
  if (spinModel === "auto") {
    if (ds.directSpin && ds.directSpin.points.length >= 6) spinModel = "direct";
    else if (k0Label === "K" || k0Label === "K'") spinModel = "zeeman_valley";
    else if (k0Label === "H" || k0Label === "H'") spinModel = "weyl_radial";
    else spinModel = "rashba";
  }
  const dressRatio = parseFloat(document.getElementById("tr-dresselhaus-ratio")?.value) || 0.0;
  const eCutUser = Math.max(0.005, Math.min(2.0, parseFloat(document.getElementById("tr-ecut-ev")?.value) || 0.08));

  // Build 2D Spin Texture Iso-Energy Contours & Spin Vectors
  const spinTex = _trBuildSpinTexture({
    spinModel,
    directSpin: ds.directSpin,
    alphaR: Math.max(alphaR, 0.015),
    alphaRIsRaw: alphaR > 1e-4,
    betaD: Math.max(alphaR, 0.015) * dressRatio,
    gamma3: fitAll.gamma3,
    deltaZ: (spinModel === "zeeman_valley") ? Math.max(deltaZ, (dEvKMeV * 0.001) || 0.14) : deltaZ,
    quadA: Math.abs(quadA) > 0.05 ? Math.abs(quadA) : 3.8,
    eCut: eCutUser,
    isConductionPair,
    k0Label
  });

  // 9) Massive-Dirac 2D Berry Curvature Ω_z(k) in First Brillouin Zone
  // Estimate Dirac velocity v_F from band dispersion near K (or minimum direct gap point)
  const diracGap = Math.max(0.08, (kPtInfo ? kPtInfo.localGapEv : globalGap) || 1.2);
  let hbarVF = 3.5; // eV*Å typical 2D TMD / graphene-family scale
  const refKIdx = kPtInfo ? kPtInfo.idx : minDirectK;
  if (refKIdx >= 0 && refKIdx < nk) {
    const nIdx = (refKIdx + 4 < nk) ? refKIdx + 4 : Math.max(0, refKIdx - 4);
    const dkRef = Math.hypot(
      fbz.kCartList[nIdx][0] - fbz.kCartList[refKIdx][0],
      fbz.kCartList[nIdx][1] - fbz.kCartList[refKIdx][1]
    );
    const dEEdge = Math.abs((kpts[nIdx].e[0][cbmIdx] - kpts[nIdx].e[0][vbmIdx]) - (kpts[refKIdx].e[0][cbmIdx] - kpts[refKIdx].e[0][vbmIdx]));
    if (dkRef > 0.01 && dEEdge > 0.005) {
      const est = Math.sqrt(Math.max(0.25, ((diracGap * 0.5 + dEEdge * 0.5) ** 2 - (diracGap * 0.5) ** 2))) / dkRef;
      if (Number.isFinite(est) && est >= 0.8 && est <= 12.0) hbarVF = est;
    }
  }
  const deltaK = Math.max(0.06, diracGap);
  const deltaKp = Math.max(0.06, diracGap + Math.abs(valleySplitVMeV - valleySplitCMeV) * 0.001);
  // Peak Berry curvature at K: |Omega_z(K)| = 2 * (hbar*vF)^2 / Delta^2  (Å^2)
  const omegaPeakK = (pBroken && fbz.isHex) ? (2.0 * hbarVF * hbarVF / (deltaK * deltaK)) : 0.0;
  const omegaPeakKp = (pBroken && fbz.isHex) ? -(2.0 * hbarVF * hbarVF / (deltaKp * deltaKp)) : 0.0;
  const valleyChern = (pBroken && fbz.isHex) ? 1 : 0; // C_v = C_K - C_K' = (+1/2) - (-1/2) = 1
  const hasAVHE = pBroken && trsBroken && fbz.isHex;
  const diracAlert = minDirectGap < 0.06;

  return {
    material: ds.material,
    seed: ds.seed,
    filesLoaded: ds.filesLoaded,
    regime: meta.isNonCollinearSoc ? "Non-Collinear SOC" : (isCol ? "Collinear Spin-Polarized" : "Non-Spin (No SOC)"),
    isCol,
    meta,
    fbz,
    zeroRefLabel,
    eShift,
    globalGap,
    isDirectGap,
    minDirectGap,
    minDirectKLabel: fbz.pathHS.reduce((best, p) => (!best || Math.abs(p.idx - minDirectK) < Math.abs(best.idx - minDirectK)) ? p : best, null)?.label || `k#${minDirectK + 1}`,
    crossesFermi,
    vbmIdx, cbmIdx,
    pairLabel, isConductionPair,
    k0Idx, k0Label, leftAxisLbl, rightAxisLbl, dkWin,
    slicePts,
    extLeft, extRight, extBest,
    deltaZ,
    alphaR,
    alphaRLeft: fitLeft.alpha,
    alphaRRight: fitRight.alpha,
    gamma3: fitAll.gamma3,
    fitR2: fitAll.r2,
    e0Avg, quadA,
    mStar: mStarClamped,
    kRFit, ERFit,
    kRDisplay, ERDisplay,
    rashbaMethodTag,
    spinPrecessionNm,
    hsSplittings,
    dEvKMeV, dEcKMeV,
    valleySplitVMeV, valleySplitCMeV,
    pBroken, trsBroken,
    spinModel, dressRatio, eCutUser,
    spinTex,
    hbarVF, deltaK, deltaKp,
    omegaPeakK, omegaPeakKp,
    valleyChern, hasAVHE, diracAlert
  };
}

function _trBuildSpinTexture(cfg) {
  const { spinModel, directSpin, alphaR, betaD, gamma3, deltaZ, quadA, eCut, isConductionPair } = cfg;

  if (spinModel === "direct" && directSpin && directSpin.points.length >= 4) {
    const pts = directSpin.points;
    let kMax = 0.1;
    pts.forEach(p => { kMax = Math.max(kMax, Math.abs(p.kx), Math.abs(p.ky)); });
    return {
      sourceTag: `Direct ⟨S⟩ (${directSpin.sourceFile})`,
      isDirect: true,
      kMax: kMax * 1.18,
      directPts: pts,
      outerContour: [],
      innerContour: [],
      windingNumber: 0,
      berryPhasePi: 0
    };
  }

  // Evaluate effective 2x2 Hamiltonian spin field h(kx, ky) = (hx, hy, hz)
  const evalH = (kx, ky) => {
    const k = Math.hypot(kx, ky);
    const th = Math.atan2(ky, kx);
    if (spinModel === "rashba_dresselhaus") {
      return [alphaR * ky + betaD * kx, -alphaR * kx - betaD * ky, 0.5 * deltaZ];
    }
    if (spinModel === "weyl_radial") {
      return [alphaR * kx, alphaR * ky, 0.5 * deltaZ];
    }
    if (spinModel === "zeeman_valley") {
      const tau = (cfg.k0Label === "K'") ? -1 : 1;
      return [alphaR * ky, -alphaR * kx, tau * 0.5 * deltaZ];
    }
    // Default: Bychkov-Rashba C3v with cubic out-of-plane Sz warping
    const hz = 0.5 * deltaZ + gamma3 * k * k * k * Math.cos(3 * th);
    return [alphaR * ky, -alphaR * kx, hz];
  };

  // Solve iso-energy radius k(theta) for outer branch (E_outer = A*k^2 - |h(k)| = eCut)
  // and inner branch (E_inner = A*k^2 + |h(k)| = eCut) via bisection
  const solveBranchRadius = (th, signBranch) => {
    const c = Math.cos(th), s = Math.sin(th);
    const f = (k) => {
      const h = evalH(k * c, k * s);
      return quadA * k * k + signBranch * Math.hypot(h[0], h[1], h[2]) - eCut;
    };
    // Outer branch (signBranch = -1) may dip below 0 first -> search past minimum
    let kLo = 0.0;
    if (signBranch < 0) {
      let bestK = 0, bestF = f(0);
      for (let step = 1; step <= 40; step++) {
        const kt = step * 0.015;
        const fv = f(kt);
        if (fv < bestF) { bestF = fv; bestK = kt; }
        if (fv > 0 && bestF < 0) { kLo = bestK; break; }
      }
      if (f(kLo) > 0) return null;
    } else {
      if (f(0) > 0) return null; // energy slice inside Zeeman gap
    }
    let kHi = Math.max(kLo + 0.05, 0.08);
    let guard = 0;
    while (f(kHi) < 0 && guard < 28) { kHi *= 1.45; guard++; }
    if (f(kHi) < 0) return null;
    for (let it = 0; it < 28; it++) {
      const mid = 0.5 * (kLo + kHi);
      if (f(mid) < 0) kLo = mid; else kHi = mid;
    }
    return 0.5 * (kLo + kHi);
  };

  const nAng = 64;
  const outerContour = [];
  const innerContour = [];
  let kMax = 0.06;

  for (let i = 0; i < nAng; i++) {
    const th = (i / nAng) * Math.PI * 2;
    const c = Math.cos(th), s = Math.sin(th);
    const rOut = solveBranchRadius(th, -1);
    if (rOut && rOut > 1e-4) {
      const kx = rOut * c, ky = rOut * s;
      const h = evalH(kx, ky);
      const hm = Math.hypot(h[0], h[1], h[2]) || 1;
      // Outer branch has spin anti-parallel (-h/|h|) for positive dispersion, flipped for hole
      const sgn = isConductionPair ? -1 : 1;
      outerContour.push({ th, kx, ky, sx: sgn * h[0] / hm, sy: sgn * h[1] / hm, sz: sgn * h[2] / hm });
      kMax = Math.max(kMax, Math.abs(kx), Math.abs(ky));
    }
    const rIn = solveBranchRadius(th, +1);
    if (rIn && rIn > 1e-4) {
      const kx = rIn * c, ky = rIn * s;
      const h = evalH(kx, ky);
      const hm = Math.hypot(h[0], h[1], h[2]) || 1;
      const sgn = isConductionPair ? 1 : -1;
      innerContour.push({ th, kx, ky, sx: sgn * h[0] / hm, sy: sgn * h[1] / hm, sz: sgn * h[2] / hm });
      kMax = Math.max(kMax, Math.abs(kx), Math.abs(ky));
    }
  }

  // Compute exact Spin Winding Number w_S = (1/2pi) * sum(dphi) along outer contour
  let windingNumber = 0;
  let avgCosTheta = 0;
  if (outerContour.length >= 8) {
    let accPhi = 0;
    let sumSz = 0;
    for (let i = 0; i < outerContour.length; i++) {
      const a = outerContour[i];
      const b = outerContour[(i + 1) % outerContour.length];
      sumSz += a.sz;
      const inA = Math.hypot(a.sx, a.sy), inB = Math.hypot(b.sx, b.sy);
      if (inA > 0.05 && inB > 0.05) {
        let dphi = Math.atan2(b.sy, b.sx) - Math.atan2(a.sy, a.sx);
        while (dphi > Math.PI) dphi -= 2 * Math.PI;
        while (dphi < -Math.PI) dphi += 2 * Math.PI;
        accPhi += dphi;
      }
    }
    windingNumber = Math.round(accPhi / (2 * Math.PI));
    avgCosTheta = Math.abs(sumSz / outerContour.length);
  }
  const berryPhasePi = Math.abs(windingNumber) * (1.0 - avgCosTheta); // in units of pi

  const modelNames = {
    rashba: "Bychkov-Rashba C₃ᵥ (k·p Fit)",
    rashba_dresselhaus: `Rashba + Dresselhaus (β/α = ${cfg.betaD ? (cfg.betaD / Math.max(1e-6, alphaR)).toFixed(2) : "0.00"})`,
    weyl_radial: "Chiral Radial / Weyl (k·p Fit)",
    zeeman_valley: "Valley Zeeman-Ising + Rashba (k·p Fit)"
  };

  return {
    sourceTag: modelNames[spinModel] || "k·p Spin Model",
    isDirect: false,
    kMax: kMax * 1.24,
    outerContour,
    innerContour,
    evalH,
    windingNumber,
    berryPhasePi
  };
}

// ---------------- Publication Color Maps & Style Helper ----------------

function _trGetPlotStyle() {
  const base = (typeof getCastepPlotStyle === "function") ? getCastepPlotStyle() : {
    fontFamily: "'Times New Roman', Times, serif",
    titleSize: 13.5, axisLabelSize: 12, tickSize: 11, legendSize: 10.5,
    borderWidth: 1.4, lineWidth: 2.0, tickDir: "in", tickLength: 5,
    gridMode: "subtle", inkColor: "#0f172a", boldAxes: true, exportScale: 4
  };
  const chk = (id, defVal = true) => {
    const el = document.getElementById(id);
    return el ? !!el.checked : defVal;
  };
  const figH = Math.max(600, Math.min(1080, parseInt(document.getElementById("tr-fmt-height")?.value || "780", 10) || 780));
  const cmap = document.getElementById("tr-fmt-cmap")?.value || "rdbu";
  return {
    fontFamily: base.fontFamily || "'Times New Roman', Times, serif",
    titleSize: Math.max(10, Math.min(20, (base.titleSize || 14) - 0.5)),
    axisLabelSize: Math.max(9.5, Math.min(18, (base.axisLabelSize || 13) - 1.0)),
    tickSize: Math.max(8.5, Math.min(16, (base.tickSize || 11.5) - 0.5)),
    legendSize: Math.max(8.5, Math.min(15, (base.legendSize || 11) - 0.5)),
    borderWidth: Math.max(0.8, Math.min(3.2, base.borderWidth || 1.4)),
    lineWidth: Math.max(0.9, Math.min(3.8, base.lineWidth || 2.0)),
    tickDir: base.tickDir || "in",
    tickLength: base.tickLength || 5,
    gridMode: base.gridMode || "subtle",
    inkColor: base.inkColor || "#0f172a",
    boldAxes: base.boldAxes !== false,
    cmap,
    figHeight: figH,
    panelLetters: chk("tr-fmt-panel-letters", true),
    isoContours: chk("tr-fmt-iso-contours", true),
    showBasis: chk("tr-fmt-show-basis", true),
    showKPath: chk("tr-fmt-show-kpath", true),
    showLegends: chk("tr-fmt-show-legends", true)
  };
}

function _trColorMapRGB(val, cmap = "rdbu", perceptualGamma = false) {
  const v = Math.max(-1, Math.min(1, val));
  const av = perceptualGamma ? Math.pow(Math.abs(v), 0.78) : Math.abs(v);
  const lerp = (a, b, t) => [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t)
  ];
  if (cmap === "viridis") {
    // Smooth perceptual viridis across [-1, +1] -> t in [0, 1]
    const t = 0.5 * (v + 1);
    const stops = [[68, 1, 84], [59, 82, 139], [33, 145, 140], [94, 201, 98], [253, 231, 37]];
    const scaled = t * (stops.length - 1);
    const i = Math.min(stops.length - 2, Math.floor(scaled));
    return lerp(stops[i], stops[i + 1], scaled - i);
  }
  const palettes = {
    rdbu:     { neg: [30, 92, 232],  mid: [255, 255, 255], pos: [216, 32, 38] },
    seismic:  { neg: [15, 35, 165],  mid: [255, 255, 255], pos: [195, 12, 22] },
    coolwarm: { neg: [59, 76, 192],  mid: [244, 245, 248], pos: [180, 4, 38] },
    puor:     { neg: [94, 60, 153],  mid: [255, 255, 255], pos: [230, 97, 1] },
    piyg:     { neg: [197, 27, 125], mid: [255, 255, 255], pos: [39, 100, 25] }
  };
  const pal = palettes[cmap] || palettes.rdbu;
  return v >= 0 ? lerp(pal.mid, pal.pos, av) : lerp(pal.mid, pal.neg, av);
}

function _trDivergingColor(val, cmap = "rdbu") {
  const [r, g, b] = _trColorMapRGB(val, cmap, false);
  return `rgb(${r},${g},${b})`;
}

function _trArrowColor(sz, cmap = "rdbu") {
  const v = Math.max(-1, Math.min(1, sz));
  if (cmap === "viridis") {
    const [r, g, b] = _trColorMapRGB(v, "viridis", false);
    return `rgb(${Math.round(r * 0.85)},${Math.round(g * 0.85)},${Math.round(b * 0.85)})`;
  }
  const [r, g, b] = _trColorMapRGB(v, cmap, false);
  // Keep arrows legible even near sz = 0 by mixing with slate #475569
  const mix = Math.min(1, Math.abs(v) * 1.15);
  const rr = Math.round(71 + (r - 71) * mix);
  const gg = Math.round(85 + (g - 85) * mix);
  const bb = Math.round(105 + (b - 105) * mix);
  return `rgb(${rr},${gg},${bb})`;
}

// ---------------- Master Renderer (KPIs + 2x2 High-DPI Canvas + Tables) ----------------

function renderTopoRashbaAll() {
  const analysis = computeTopoRashbaAnalysis();
  TOPO_RASHBA_STATE.analysis = analysis;

  const strip = document.getElementById("tr-summary-strip");
  const kpiBox = document.getElementById("tr-kpi-grid");
  const hsTbody = document.getElementById("tr-hs-tbody");
  const spinTbody = document.getElementById("tr-atomic-spin-tbody");
  const canvas = document.getElementById("tr-main-canvas");

  if (!analysis) {
    if (strip) {
      strip.innerHTML = `<span>Load CASTEP <strong>Non-Collinear SOC</strong> (<code>*_BandStr.bands</code> + <code>*.castep</code> + <code>*.param</code> + <code>*.cell</code>) or <strong>Collinear</strong> files, or click <strong>🔗 Import Active Job</strong> to analyze Rashba splitting, 2D spin texture, First Brillouin Zone &amp; topology.</span>`;
    }
    if (kpiBox) kpiBox.style.display = "none";
    if (hsTbody) hsTbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:14px; color:#64748b;">No band structure loaded yet.</td></tr>`;
    if (spinTbody) spinTbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:14px; color:#64748b;">Load a CASTEP <code>*.castep</code> file with Mulliken spin analysis to inspect atomic spin vectors (S<sub>x</sub>, S<sub>y</sub>, S<sub>z</sub>).</td></tr>`;
    if (canvas) _trDrawEmptyCanvas(canvas);
    return;
  }

  // 1) Update Top Summary Strip
  if (strip) {
    const regimeCol = analysis.meta.isNonCollinearSoc ? "#7c3aed" : (analysis.isCol ? "#dc2626" : "#475569");
    const sgStr = analysis.meta.sgNum ? `SG #${analysis.meta.sgNum} (${analysis.meta.sgName})` : analysis.fbz.latticeType;
    const efStr = analysis.meta.efield ? ` • E-field = (${analysis.meta.efield.map(v => v.toFixed(2)).join(", ")})` : "";
    strip.innerHTML = `
      <span><strong>Material:</strong> ${_trEsc(analysis.material)}</span>
      <span style="color:${regimeCol}; font-weight:700;">● ${_trEsc(analysis.regime)}</span>
      <span><strong>Symmetry:</strong> ${_trEsc(sgStr)}</span>
      <span><strong>E<sub>g</sub>:</strong> ${analysis.crossesFermi ? "Metallic (0 eV)" : `${analysis.globalGap.toFixed(3)} eV (${analysis.isDirectGap ? "Direct" : "Indirect"})`}</span>
      <span><strong>Zero:</strong> ${_trEsc(analysis.zeroRefLabel)}${_trEsc(efStr)}</span>
      <span style="margin-left:auto; font-size:11px; color:#64748b;">Files: ${_trEsc(analysis.filesLoaded.join(", "))}</span>
    `;
  }

  // 2) Update 4 Scientific KPI Cards
  if (kpiBox) {
    kpiBox.style.display = "grid";
    const lsTxt = Number.isFinite(analysis.spinPrecessionNm) && analysis.spinPrecessionNm < 9999
      ? `${analysis.spinPrecessionNm.toFixed(1)} nm`
      : "—";
    const anisoTxt = (analysis.alphaRLeft > 0 || analysis.alphaRRight > 0)
      ? `${analysis.alphaRLeft.toFixed(3)} (${analysis.leftAxisLbl}) / ${analysis.alphaRRight.toFixed(3)} (${analysis.rightAxisLbl})`
      : "—";
    const netS = analysis.meta.netSpinVec;
    const spinVecTxt = analysis.meta.hasSpinVec
      ? `(${netS[0].toFixed(3)}, ${netS[1].toFixed(3)}, ${netS[2].toFixed(3)}) μ<sub>B</sub>`
      : "0.000 μ<sub>B</sub>";

    kpiBox.innerHTML = `
      <div class="tr-kpi-card" style="border-top-color:#7c3aed;">
        <div class="tr-kpi-hd">🌀 Rashba &amp; Spin-Orbit Splitting (${_trEsc(analysis.k0Label)})</div>
        <div class="tr-kpi-main" style="color:#6d28d9;">α<sub>R</sub> = ${analysis.alphaR.toFixed(4)} <span class="tr-unit">eV·Å</span></div>
        <div class="tr-kpi-grid-rows">
          <span>E<sub>R</sub>: <strong>${(analysis.ERDisplay * 1000).toFixed(2)} meV</strong></span>
          <span>k<sub>R</sub>: <strong>${analysis.kRDisplay.toFixed(4)} Å⁻¹</strong></span>
          <span>γ<sub>3</sub> (cubic): <strong>${analysis.gamma3.toFixed(3)} eV·Å³</strong></span>
          <span>Δ<sub>Z</sub>(${_trEsc(analysis.k0Label)}): <strong>${(analysis.deltaZ * 1000).toFixed(2)} meV</strong></span>
          <span>m*: <strong>${analysis.mStar.toFixed(2)} m₀</strong></span>
          <span>L<sub>s</sub> (precess.): <strong>${lsTxt}</strong></span>
        </div>
        <div class="tr-kpi-note">${_trEsc(analysis.rashbaMethodTag)} • R² = ${analysis.fitR2.toFixed(4)} • Dir: ${_trEsc(anisoTxt)}</div>
      </div>

      <div class="tr-kpi-card" style="border-top-color:#dc2626;">
        <div class="tr-kpi-hd">🧭 Symmetry &amp; Spin Texture Invariants</div>
        <div class="tr-kpi-main" style="color:#b91c1c;">w<sub>S</sub> = ${analysis.spinTex.windingNumber >= 0 ? "+" : ""}${analysis.spinTex.windingNumber} <span class="tr-unit">(Berry γ<sub>B</sub> = ${analysis.spinTex.berryPhasePi.toFixed(2)}π)</span></div>
        <div class="tr-kpi-grid-rows">
          <span>Inversion 𝒫: <strong style="color:${analysis.pBroken ? "#dc2626" : "#0f766e"};">${analysis.pBroken ? "Broken" : "Preserved"}</strong></span>
          <span>Time-Rev. 𝒯: <strong style="color:${analysis.trsBroken ? "#dc2626" : "#0f766e"};">${analysis.trsBroken ? "Broken" : "Preserved"}</strong></span>
          <span>Lattice: <strong>${_trEsc(analysis.fbz.latticeType)}</strong></span>
          <span>Dim: <strong>${analysis.fbz.is2DSlab ? "2D Slab" : "3D Bulk"}</strong></span>
        </div>
        <div class="tr-kpi-note">Net Spin: ${spinVecTxt} • Model: ${_trEsc(analysis.spinTex.sourceTag)}</div>
      </div>

      <div class="tr-kpi-card" style="border-top-color:#0f766e;">
        <div class="tr-kpi-hd">🔷 Valley SOC &amp; Berry Curvature Ω<sub>z</sub>(k)</div>
        <div class="tr-kpi-main" style="color:#0f766e;">|Ω<sub>z</sub>(K)| ≈ ${analysis.omegaPeakK.toFixed(1)} <span class="tr-unit">Å²</span></div>
        <div class="tr-kpi-grid-rows">
          <span>ΔE<sub>v</sub>(K): <strong>${analysis.dEvKMeV.toFixed(1)} meV</strong></span>
          <span>ΔE<sub>c</sub>(K): <strong>${analysis.dEcKMeV.toFixed(1)} meV</strong></span>
          <span>Valley ΔE<sub>v</sub>(K−K′): <strong>${analysis.valleySplitVMeV.toFixed(2)} meV</strong></span>
          <span>Valley C<sub>v</sub>: <strong>${analysis.valleyChern > 0 ? "±1 (C_K = +½, C_K′ = −½)" : "0 (Centrosym.)"}</strong></span>
        </div>
        <div class="tr-kpi-note">${analysis.hasAVHE ? "⚡ Broken 𝒫 & 𝒯 → Anomalous Valley Hall Effect (AVHE) allowed!" : (analysis.pBroken && analysis.fbz.isHex ? "Spin-Valley Hall Effect (VHE) allowed at K / K′ corners." : "Zero net valley Berry curvature under preserved inversion 𝒫.")}</div>
      </div>

      <div class="tr-kpi-card" style="border-top-color:#2563eb;">
        <div class="tr-kpi-hd">⚛️ Band Topology &amp; FBZ Metrics</div>
        <div class="tr-kpi-main" style="color:#1d4ed8;">${analysis.diracAlert ? "Dirac / Weyl Near-Crossing" : (analysis.crossesFermi ? "Metallic / Spin-Split" : `E_g = ${analysis.globalGap.toFixed(3)} eV`)}</div>
        <div class="tr-kpi-grid-rows">
          <span>Min Direct E<sub>g</sub>: <strong>${analysis.minDirectGap.toFixed(3)} eV @ ${_trEsc(analysis.minDirectKLabel)}</strong></span>
          <span>|b₁|, |b₂|: <strong>${analysis.fbz.b1Len.toFixed(3)}, ${analysis.fbz.b2Len.toFixed(3)} Å⁻¹</strong></span>
          <span>ħv<sub>F</sub> (est.): <strong>${analysis.hbarVF.toFixed(2)} eV·Å</strong></span>
          <span>γ* (recip.): <strong>${analysis.fbz.gammaStarDeg.toFixed(1)}°</strong></span>
        </div>
        <div class="tr-kpi-note">Note: Symmetry &amp; massive-Dirac Berry diagnostics are derived from CASTEP eigenvalues; exact global ℤ₂ / Chern integer requires Wannier90/Z2Pack wavefunctions.</div>
      </div>
    `;
  }

  // 3) Render 2x2 High-DPI Publication Canvas
  if (canvas) _trDrawMainCanvas(canvas, analysis);

  // 4) Update High-Symmetry Splitting Table
  if (hsTbody) {
    hsTbody.innerHTML = analysis.hsSplittings.map(h => `
      <tr>
        <td><strong>${_trEsc(h.label)}</strong></td>
        <td style="font-family:monospace; font-size:11px;">(${h.frac.map(v => v.toFixed(3)).join(", ")})</td>
        <td>${h.evTop.toFixed(4)}</td>
        <td>${h.ecBot.toFixed(4)}</td>
        <td style="font-weight:700; color:#7c3aed;">${h.dEvMeV.toFixed(2)}</td>
        <td style="font-weight:700; color:#2563eb;">${h.dEcMeV.toFixed(2)}</td>
        <td>${h.localGapEv.toFixed(3)}</td>
      </tr>
    `).join("");
  }

  // 5) Update Atomic Non-Collinear Spin Vector Table
  if (spinTbody) {
    if (analysis.meta.atomicSpins.length) {
      spinTbody.innerHTML = analysis.meta.atomicSpins.map(a => `
        <tr>
          <td><strong>${_trEsc(a.label)}</strong></td>
          <td>${a.charge >= 0 ? "+" : ""}${a.charge.toFixed(3)}</td>
          <td style="font-weight:700;">${a.mag.toFixed(4)}</td>
          <td style="color:#dc2626;">${a.vec[0].toFixed(4)}</td>
          <td style="color:#16a34a;">${a.vec[1].toFixed(4)}</td>
          <td style="color:#2563eb; font-weight:700;">${a.vec[2].toFixed(4)}</td>
        </tr>
      `).join("");
    } else {
      spinTbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:12px; color:#64748b;">No Mulliken atomic spin table found in uploaded files (include <code>*.castep</code> to display per-atom spin vectors S<sub>x</sub>, S<sub>y</sub>, S<sub>z</sub>).</td></tr>`;
    }
  }
}
window.renderTopoRashbaAll = renderTopoRashbaAll;

// ---------------- 2x2 High-DPI Canvas Renderer ----------------

function _trDrawEmptyCanvas(canvas) {
  const w = Math.max(640, Math.floor((canvas.parentElement?.clientWidth || 960) - 20));
  const h = 340;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
  canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
  const ctx = canvas.getContext("2d");
  ctx.save(); ctx.scale(dpr, dpr);
  ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#334155"; ctx.font = "700 15px Inter, sans-serif"; ctx.textAlign = "center";
  ctx.fillText("Rashba Splitting, 2D Spin Texture, First Brillouin Zone & Berry Curvature Studio", w / 2, h / 2 - 14);
  ctx.fillStyle = "#64748b"; ctx.font = "12.5px Inter, sans-serif";
  ctx.fillText("Drop CASTEP Non-Collinear SOC or Collinear files (*_BandStr.bands, *.castep, *.param, *.cell) above, or click '🔗 Import Active Job'.", w / 2, h / 2 + 12);
  ctx.restore();
}

function _trDrawMainCanvas(canvas, an) {
  const st = _trGetPlotStyle();
  const parentW = canvas.parentElement ? (canvas.parentElement.clientWidth - 20) : 960;
  const width = Math.max(760, Math.floor(parentW));
  const height = st.figHeight || 780;
  const dpr = typeof getCastepCanvasDpr === "function" ? getCastepCanvasDpr(width, height) : Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const halfW = Math.floor(width / 2);
  const halfH = Math.floor(height / 2);

  // Seamless publication 2x2 layout (no quadrant divider lines between panels)
  const gA = _trDrawPanelA_RashbaDispersion(ctx, 0, 0, halfW, halfH, an, st);
  const gB = _trDrawPanelB_SplittingFit(ctx, halfW, 0, width - halfW, halfH, an, st);
  const gC = _trDrawPanelC_SpinTexture(ctx, 0, halfH, halfW, height - halfH, an, st);
  const gD = _trDrawPanelD_FBZAndBerry(ctx, halfW, halfH, width - halfW, height - halfH, an, st);

  TOPO_RASHBA_STATE.panelGeoms = [gA, gB, gC, gD];

  // Wire right-click sub-panel copy & TSV export!
  canvas._subPanelRects = [
    { key: "rashba_disp", label: "Rashba / SOC Dispersion", x: 0, y: 0, w: halfW, h: halfH, pngName: `${an.seed}_Rashba_Dispersion.png`, buildExactTable: () => _trBuildTableDispersion(an) },
    { key: "rashba_split", label: "Spin Splitting ΔE(k) Fit", x: halfW, y: 0, w: width - halfW, h: halfH, pngName: `${an.seed}_Spin_Splitting_dE.png`, buildExactTable: () => _trBuildTableSplitting(an) },
    { key: "spin_tex", label: "2D Spin Texture", x: 0, y: halfH, w: halfW, h: height - halfH, pngName: `${an.seed}_Spin_Texture.png`, buildExactTable: () => _trBuildTableSpinTexture(an) },
    { key: "fbz_berry", label: "Brillouin Zone & Berry Ω_z", x: halfW, y: halfH, w: width - halfW, h: height - halfH, pngName: `${an.seed}_FBZ_Berry.png`, buildExactTable: () => _trBuildTableFBZBerry(an) }
  ];

  ctx.restore();
}

function _trDrawAxesBox(ctx, x0, y0, w, h, xTicks, yTicks, st) {
  const s = st || _trGetPlotStyle();
  ctx.save();
  ctx.strokeStyle = s.inkColor || "#0f172a";
  ctx.lineWidth = s.borderWidth || 1.35;
  ctx.setLineDash([]);
  ctx.strokeRect(x0, y0, w, h);
  if (s.tickDir !== "none") {
    const tl = s.tickLength || 5;
    const sgn = s.tickDir === "out" ? -1 : 1;
    ctx.lineWidth = Math.max(0.9, (s.borderWidth || 1.35) * 0.8);
    (xTicks || []).forEach(px => {
      if (px < x0 - 1 || px > x0 + w + 1) return;
      ctx.beginPath();
      ctx.moveTo(px, y0 + h); ctx.lineTo(px, y0 + h - sgn * tl);
      ctx.moveTo(px, y0); ctx.lineTo(px, y0 + sgn * tl);
      ctx.stroke();
    });
    (yTicks || []).forEach(py => {
      if (py < y0 - 1 || py > y0 + h + 1) return;
      ctx.beginPath();
      ctx.moveTo(x0, py); ctx.lineTo(x0 + sgn * tl, py);
      ctx.moveTo(x0 + w, py); ctx.lineTo(x0 + w - sgn * tl, py);
      ctx.stroke();
    });
  }
  ctx.restore();
}

// --- Panel A (Top-Left): Zoomed Rashba / SOC Band Dispersion around k0 ---
function _trDrawPanelA_RashbaDispersion(ctx, rx, ry, rw, rh, an, st) {
  const s = st || _trGetPlotStyle();
  const ff = s.fontFamily;
  const axWeight = s.boldAxes ? "700 " : "";
  const padL = 62, padR = 20, padT = 36, padB = 46;
  const x0 = rx + padL, y0 = ry + padT, w = rw - padL - padR, h = rh - padT - padB;
  const pts = an.slicePts;
  let sMin = -an.dkWin, sMax = an.dkWin;
  if (pts.length) {
    sMin = Math.min(...pts.map(p => p.s));
    sMax = Math.max(...pts.map(p => p.s));
    if (sMax - sMin < 1e-4) { sMin = -0.1; sMax = 0.1; }
  }
  let eMin = 1e9, eMax = -1e9;
  pts.forEach(p => { eMin = Math.min(eMin, p.eLo); eMax = Math.max(eMax, p.eHi); });
  if (!Number.isFinite(eMin) || eMax <= eMin) { eMin = -0.5; eMax = 0.5; }
  const ePad = Math.max(0.015, (eMax - eMin) * 0.18);
  eMin -= ePad; eMax += ePad;

  const zoomA = TOPO_RASHBA_STATE.zoom.A || 1.0;
  if (Math.abs(zoomA - 1.0) > 1e-3) {
    const sMid = (sMin < 0 && sMax > 0) ? 0 : 0.5 * (sMin + sMax);
    const sHalfL = (sMid - sMin) / zoomA, sHalfR = (sMax - sMid) / zoomA;
    sMin = sMid - sHalfL; sMax = sMid + sHalfR;
    const eMid = 0.5 * (eMin + eMax), eHalf = 0.5 * (eMax - eMin) / zoomA;
    eMin = eMid - eHalf; eMax = eMid + eHalf;
  }

  const sToX = (sv) => x0 + ((sv - sMin) / (sMax - sMin)) * w;
  const eToY = (ev) => y0 + h * (1 - (ev - eMin) / (eMax - eMin));

  const xTickVals = [sMin, sMin * 0.5, 0, sMax * 0.5, sMax].filter((v, i, arr) => v >= sMin - 1e-6 && v <= sMax + 1e-6 && (i === 0 || Math.abs(v - arr[i - 1]) > 1e-4));
  const yTickVals = [];
  for (let i = 0; i <= 4; i++) yTickVals.push(eMin + (eMax - eMin) * (i / 4));

  // Subtle grid & vertical k0 guide
  ctx.save();
  ctx.beginPath(); ctx.rect(x0, y0, w, h); ctx.clip();
  if (s.gridMode !== "off") {
    ctx.strokeStyle = s.gridMode === "normal" ? "#cbd5e1" : "#e5e7eb";
    ctx.lineWidth = s.gridMode === "normal" ? 0.9 : 0.75;
    ctx.setLineDash(s.gridMode === "normal" ? [] : [3, 3]);
    yTickVals.slice(1, -1).forEach(yv => {
      const py = eToY(yv);
      ctx.beginPath(); ctx.moveTo(x0, py); ctx.lineTo(x0 + w, py); ctx.stroke();
    });
    ctx.setLineDash([]);
  }
  const xZero = sToX(0);
  if (xZero >= x0 && xZero <= x0 + w) {
    ctx.beginPath(); ctx.setLineDash([4, 3]);
    ctx.moveTo(xZero, y0); ctx.lineTo(xZero, y0 + h);
    ctx.strokeStyle = "#64748b"; ctx.lineWidth = 0.9; ctx.stroke(); ctx.setLineDash([]);
  }

  // Fitted Bychkov-Rashba model curves (dashed gray-violet reference)
  if (an.alphaR > 1e-4 && pts.length >= 3) {
    ctx.strokeStyle = "rgba(124, 58, 237, 0.50)";
    ctx.lineWidth = Math.max(1.1, s.lineWidth * 0.72);
    ctx.setLineDash([5, 3]);
    for (const sgn of [-1, 1]) {
      ctx.beginPath();
      for (let i = 0; i <= 80; i++) {
        const sv = sMin + (sMax - sMin) * (i / 80);
        const ak = Math.abs(sv);
        const halfSplit = 0.5 * Math.sqrt(an.deltaZ * an.deltaZ + Math.pow(2 * an.alphaR * ak + 2 * an.gamma3 * ak * ak * ak, 2));
        const ev = an.e0Avg + an.quadA * ak * ak + sgn * halfSplit;
        const px = sToX(sv), py = eToY(ev);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  // DFT Lower branch (Solid Blue) & Upper branch (Solid Red)
  const drawBranch = (key, color) => {
    ctx.strokeStyle = color; ctx.lineWidth = s.lineWidth; ctx.setLineDash([]);
    ctx.beginPath();
    pts.forEach((p, i) => {
      const px = sToX(p.s), py = eToY(p[key]);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.stroke();
    ctx.fillStyle = color;
    const step = pts.length > 45 ? 2 : 1;
    const rad = Math.max(1.8, Math.min(3.3, s.lineWidth * 1.1));
    for (let i = 0; i < pts.length; i += step) {
      ctx.beginPath(); ctx.arc(sToX(pts[i].s), eToY(pts[i][key]), rad, 0, Math.PI * 2); ctx.fill();
    }
  };
  drawBranch("eLo", "#2563eb");
  drawBranch("eHi", "#dc2626");

  // Annotate E_R & k_R when direct extremum exists
  if (an.extBest.interior) {
    const pxExt = sToX(an.extBest.sExt);
    const pyExt = eToY(an.extBest.eExt);
    const py0 = eToY(an.isConductionPair ? an.slicePts.find(p => p.s === 0)?.eLo : an.slicePts.find(p => p.s === 0)?.eHi);
    ctx.strokeStyle = "#0f766e"; ctx.lineWidth = 1.4; ctx.setLineDash([3, 2]);
    ctx.beginPath();
    ctx.moveTo(xZero, py0); ctx.lineTo(pxExt, py0);
    ctx.moveTo(pxExt, py0); ctx.lineTo(pxExt, pyExt);
    ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#0f766e"; ctx.font = `700 ${Math.max(9.5, s.legendSize)}px ${ff}`;
    ctx.textAlign = an.extBest.sExt >= 0 ? "left" : "right";
    ctx.fillText(`E_R=${(an.extBest.ER * 1000).toFixed(1)} meV`, pxExt + (an.extBest.sExt >= 0 ? 5 : -5), (py0 + pyExt) * 0.5);
  }
  ctx.restore();

  // Axes & Ticks
  _trDrawAxesBox(ctx, x0, y0, w, h, xTickVals.map(sToX), yTickVals.map(eToY), s);

  // Title & Legend
  const pfxA = s.panelLetters ? "(a) " : "";
  ctx.fillStyle = s.inkColor; ctx.font = `${axWeight}${s.titleSize}px ${ff}`; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.fillText(`${pfxA}Rashba / SOC Dispersion near ${an.k0Label} (${an.pairLabel})`, x0 + w / 2, ry + 22);

  if (s.showLegends) {
    ctx.save();
    const lx = x0 + 8, ly = y0 + 8;
    const legFs = Math.max(9, s.legendSize);
    const rowStep = Math.round(legFs + 3.5);
    const boxH = rowStep * 3 + 8;
    const boxW = Math.round(Math.max(116, legFs * 11.4));
    ctx.fillStyle = "rgba(255,255,255,0.92)"; ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 0.8;
    ctx.fillRect(lx, ly, boxW, boxH); ctx.strokeRect(lx, ly, boxW, boxH);
    ctx.font = `700 ${legFs}px ${ff}`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.strokeStyle = "#dc2626"; ctx.lineWidth = s.lineWidth; ctx.beginPath(); ctx.moveTo(lx + 6, ly + 8); ctx.lineTo(lx + 20, ly + 8); ctx.stroke();
    ctx.fillStyle = s.inkColor; ctx.fillText(an.isCol ? "Spin ↑ (Upper)" : "E₊(k) Upper", lx + 25, ly + 8);
    ctx.strokeStyle = "#2563eb"; ctx.lineWidth = s.lineWidth; ctx.beginPath(); ctx.moveTo(lx + 6, ly + 8 + rowStep); ctx.lineTo(lx + 20, ly + 8 + rowStep); ctx.stroke();
    ctx.fillText(an.isCol ? "Spin ↓ (Lower)" : "E₋(k) Lower", lx + 25, ly + 8 + rowStep);
    ctx.strokeStyle = "#7c3aed"; ctx.lineWidth = 1.4; ctx.setLineDash([4, 2]); ctx.beginPath(); ctx.moveTo(lx + 6, ly + 8 + rowStep * 2); ctx.lineTo(lx + 20, ly + 8 + rowStep * 2); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillText("k·p Rashba Fit", lx + 25, ly + 8 + rowStep * 2);
    ctx.restore();
  }

  // Tick Labels
  const tickPad = s.tickDir === "out" ? (s.tickLength + 4) : 6;
  ctx.fillStyle = s.inkColor; ctx.font = `${s.tickSize}px ${ff}`; ctx.textAlign = "center"; ctx.textBaseline = "top";
  xTickVals.forEach(v => {
    const txt = Math.abs(v) < 1e-4 ? an.k0Label : v.toFixed(2);
    ctx.fillText(txt, sToX(v), y0 + h + tickPad);
  });
  ctx.font = `${axWeight}${s.axisLabelSize}px ${ff}`;
  ctx.fillText(`${an.leftAxisLbl}  ←  k − k(${an.k0Label}) (Å⁻¹)  →  ${an.rightAxisLbl}`, x0 + w / 2, y0 + h + tickPad + s.tickSize + 5);

  ctx.textAlign = "right"; ctx.textBaseline = "middle"; ctx.font = `${s.tickSize}px ${ff}`;
  yTickVals.forEach(v => ctx.fillText(v.toFixed(3), x0 - tickPad, eToY(v)));
  ctx.save(); ctx.translate(rx + 15, y0 + h / 2); ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center"; ctx.font = `${axWeight}${s.axisLabelSize}px ${ff}`;
  ctx.fillText("Energy E − E_ref (eV)", 0, 0);
  ctx.restore();

  return { id: "A", x0, y0, w, h, sMin, sMax, eMin, eMax };
}

// --- Panel B (Top-Right): Momentum-Dependent Spin Splitting ΔE(k) vs |k - k0| ---
function _trDrawPanelB_SplittingFit(ctx, rx, ry, rw, rh, an, st) {
  const s = st || _trGetPlotStyle();
  const ff = s.fontFamily;
  const axWeight = s.boldAxes ? "700 " : "";
  const padL = 62, padR = 20, padT = 36, padB = 46;
  const x0 = rx + padL, y0 = ry + padT, w = rw - padL - padR, h = rh - padT - padB;
  const pts = an.slicePts;
  const zoomB = TOPO_RASHBA_STATE.zoom.B || 1.0;
  const kMax = (Math.max(0.05, ...pts.map(p => p.absK)) * 1.05) / zoomB;
  const dEMaxMeV = (Math.max(5.0, ...pts.map(p => p.dE * 1000)) * 1.18) / zoomB;

  const kToX = (k) => x0 + (k / kMax) * w;
  const dToY = (mev) => y0 + h * (1 - mev / dEMaxMeV);

  ctx.save();
  ctx.beginPath(); ctx.rect(x0, y0, w, h); ctx.clip();

  // Grid
  if (s.gridMode !== "off") {
    ctx.strokeStyle = s.gridMode === "normal" ? "#cbd5e1" : "#f1f5f9";
    ctx.lineWidth = s.gridMode === "normal" ? 0.9 : 1;
    ctx.setLineDash(s.gridMode === "normal" ? [] : [3, 3]);
    for (let i = 1; i < 4; i++) {
      const gy = y0 + h * (i / 4);
      ctx.beginPath(); ctx.moveTo(x0, gy); ctx.lineTo(x0 + w, gy); ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  // Fitted Curve: dE = sqrt(Delta_Z^2 + (2*alpha_R*k + 2*gamma_3*k^3)^2)
  ctx.strokeStyle = "#7c3aed"; ctx.lineWidth = s.lineWidth;
  ctx.beginPath();
  for (let i = 0; i <= 80; i++) {
    const kv = kMax * (i / 80);
    const predMeV = Math.sqrt(an.deltaZ * an.deltaZ + Math.pow(2 * an.alphaR * kv + 2 * an.gamma3 * kv * kv * kv, 2)) * 1000;
    const px = kToX(kv), py = dToY(predMeV);
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Linear pure Rashba tangent 2 * alpha_R * k (dashed amber)
  if (an.alphaR > 1e-4) {
    ctx.strokeStyle = "#d97706"; ctx.lineWidth = Math.max(1.1, s.lineWidth * 0.7); ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(kToX(0), dToY(0));
    ctx.lineTo(kToX(kMax), dToY(2 * an.alphaR * kMax * 1000));
    ctx.stroke(); ctx.setLineDash([]);
  }

  // Raw DFT points (Left branch = Blue circles, Right branch = Red circles)
  const ptRad = Math.max(2.2, Math.min(4.0, s.lineWidth * 1.4));
  pts.forEach(p => {
    const px = kToX(p.absK), py = dToY(p.dE * 1000);
    ctx.beginPath(); ctx.arc(px, py, ptRad, 0, Math.PI * 2);
    ctx.fillStyle = p.s < 0 ? "#2563eb" : "#dc2626";
    ctx.fill();
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 0.8; ctx.stroke();
  });
  ctx.restore();

  const xTicks = [0, 0.25, 0.5, 0.75, 1.0].map(f => kToX(f * kMax));
  const yTicks = [0, 0.25, 0.5, 0.75, 1.0].map(f => dToY(f * dEMaxMeV));
  _trDrawAxesBox(ctx, x0, y0, w, h, xTicks, yTicks, s);

  const pfxB = s.panelLetters ? "(b) " : "";
  ctx.fillStyle = s.inkColor; ctx.font = `${axWeight}${s.titleSize}px ${ff}`; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.fillText(`${pfxB}Spin Splitting ΔE(k) & Rashba Fit around ${an.k0Label}`, x0 + w / 2, ry + 22);

  // Annotation box with exact fit metrics
  if (s.showLegends) {
    ctx.save();
    const bx = x0 + 8, by = y0 + 8;
    const legFs = Math.max(9, s.legendSize);
    const boxW = Math.round(Math.max(176, legFs * 17.4));
    const boxH = Math.round(legFs * 6.3 + 4);
    ctx.fillStyle = "rgba(255,255,255,0.93)"; ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 0.8;
    ctx.fillRect(bx, by, boxW, boxH); ctx.strokeRect(bx, by, boxW, boxH);
    ctx.font = `700 ${legFs}px ${ff}`; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#6d28d9"; ctx.fillText(`α_R = ${an.alphaR.toFixed(4)} eV·Å  (R² = ${an.fitR2.toFixed(3)})`, bx + 7, by + legFs + 4);
    ctx.fillStyle = s.inkColor; ctx.font = `${Math.max(8.5, legFs - 0.5)}px ${ff}`;
    ctx.fillText(`γ₃ = ${an.gamma3.toFixed(3)} eV·Å³  |  Δ_Z = ${(an.deltaZ * 1000).toFixed(2)} meV`, bx + 7, by + legFs * 2.5 + 4);
    ctx.fillStyle = "#dc2626"; ctx.fillText(`● → ${an.rightAxisLbl}: α = ${an.alphaRRight.toFixed(4)} eV·Å`, bx + 7, by + legFs * 4.0 + 4);
    ctx.fillStyle = "#2563eb"; ctx.fillText(`● → ${an.leftAxisLbl}: α = ${an.alphaRLeft.toFixed(4)} eV·Å`, bx + 7, by + legFs * 5.4 + 4);
    ctx.restore();
  }

  const tickPad = s.tickDir === "out" ? (s.tickLength + 4) : 6;
  ctx.fillStyle = s.inkColor; ctx.font = `${s.tickSize}px ${ff}`; ctx.textAlign = "center"; ctx.textBaseline = "top";
  [0, 0.25, 0.5, 0.75, 1.0].forEach(f => ctx.fillText((f * kMax).toFixed(2), kToX(f * kMax), y0 + h + tickPad));
  ctx.font = `${axWeight}${s.axisLabelSize}px ${ff}`;
  ctx.fillText(`|k − k(${an.k0Label})| (Å⁻¹)`, x0 + w / 2, y0 + h + tickPad + s.tickSize + 5);

  ctx.textAlign = "right"; ctx.textBaseline = "middle"; ctx.font = `${s.tickSize}px ${ff}`;
  [0, 0.25, 0.5, 0.75, 1.0].forEach(f => ctx.fillText((f * dEMaxMeV).toFixed(1), x0 - tickPad, dToY(f * dEMaxMeV)));
  ctx.save(); ctx.translate(rx + 15, y0 + h / 2); ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center"; ctx.font = `${axWeight}${s.axisLabelSize}px ${ff}`;
  ctx.fillText("Spin Splitting ΔE (meV)", 0, 0);
  ctx.restore();

  return { id: "B", x0, y0, w, h, kMax, dEMaxMeV };
}

// --- Panel C (Bottom-Left): 2D Spin Texture & Iso-Energy Contours ---
function _trDrawPanelC_SpinTexture(ctx, rx, ry, rw, rh, an, st) {
  const s = st || _trGetPlotStyle();
  const ff = s.fontFamily;
  const axWeight = s.boldAxes ? "700 " : "";
  const padL = 56, padR = 54, padT = 36, padB = 46;
  const availW = rw - padL - padR, availH = rh - padT - padB;
  const side = Math.min(availW, availH);
  const x0 = rx + padL + Math.floor((availW - side) * 0.5);
  const y0 = ry + padT + Math.floor((availH - side) * 0.5);
  const stex = an.spinTex;
  const zoomC = TOPO_RASHBA_STATE.zoom.C || 1.0;
  const kMax = (stex.kMax || 0.25) / zoomC;

  const kxToX = (kx) => x0 + ((kx + kMax) / (2 * kMax)) * side;
  const kyToY = (ky) => y0 + ((kMax - ky) / (2 * kMax)) * side;

  ctx.save();
  ctx.beginPath(); ctx.rect(x0, y0, side, side); ctx.clip();

  // Subtle radial polar grid & crosshair
  if (s.gridMode !== "off") {
    ctx.strokeStyle = s.gridMode === "normal" ? "#cbd5e1" : "#f1f5f9";
    ctx.lineWidth = 0.9;
    [0.33, 0.66].forEach(f => {
      ctx.beginPath(); ctx.arc(kxToX(0), kyToY(0), side * 0.5 * f, 0, Math.PI * 2); ctx.stroke();
    });
    ctx.strokeStyle = "#cbd5e1"; ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(x0, kyToY(0)); ctx.lineTo(x0 + side, kyToY(0));
    ctx.moveTo(kxToX(0), y0); ctx.lineTo(kxToX(0), y0 + side);
    ctx.stroke(); ctx.setLineDash([]);
  }

  const drawArrow = (px, py, sx, sy, sz, lenPx) => {
    const inPlane = Math.hypot(sx, sy);
    const col = _trArrowColor(sz, s.cmap);
    if (inPlane < 0.08) {
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = Math.max(1.1, s.lineWidth * 0.7);
      ctx.beginPath(); ctx.arc(px, py, 4.2, 0, Math.PI * 2); ctx.stroke();
      if (sz >= 0) {
        ctx.beginPath(); ctx.arc(px, py, 1.7, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.beginPath(); ctx.moveTo(px - 2.6, py - 2.6); ctx.lineTo(px + 2.6, py + 2.6);
        ctx.moveTo(px + 2.6, py - 2.6); ctx.lineTo(px - 2.6, py + 2.6); ctx.stroke();
      }
      return;
    }
    const dx = (sx / inPlane) * lenPx * Math.min(1, 0.45 + 0.55 * inPlane);
    const dy = -(sy / inPlane) * lenPx * Math.min(1, 0.45 + 0.55 * inPlane);
    const x1 = px - dx * 0.42, y1 = py - dy * 0.42;
    const x2 = px + dx * 0.58, y2 = py + dy * 0.58;
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = Math.max(1.3, s.lineWidth * 0.85);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const hl = 5.4;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - hl * Math.cos(ang - 0.46), y2 - hl * Math.sin(ang - 0.46));
    ctx.lineTo(x2 - hl * Math.cos(ang + 0.46), y2 - hl * Math.sin(ang + 0.46));
    ctx.closePath(); ctx.fill();
  };

  if (stex.isDirect && stex.directPts) {
    stex.directPts.forEach(p => {
      drawArrow(kxToX(p.kx), kyToY(p.ky), p.sx, p.sy, p.sz, 16);
    });
  } else {
    const drawContour = (arr, strokeCol, arrowStep, arrowLen) => {
      if (arr.length < 3) return;
      ctx.strokeStyle = strokeCol; ctx.lineWidth = Math.max(1.2, s.lineWidth * 0.8);
      ctx.beginPath();
      arr.forEach((p, i) => {
        const px = kxToX(p.kx), py = kyToY(p.ky);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.closePath(); ctx.stroke();
      for (let i = 0; i < arr.length; i += arrowStep) {
        const p = arr[i];
        drawArrow(kxToX(p.kx), kyToY(p.ky), p.sx, p.sy, p.sz, arrowLen);
      }
    };
    drawContour(stex.outerContour, "rgba(15, 23, 42, 0.42)", 4, 17);
    drawContour(stex.innerContour, "rgba(100, 116, 139, 0.45)", 4, 14);
  }
  ctx.restore();

  const ticks = [-kMax * 0.75, 0, kMax * 0.75];
  _trDrawAxesBox(ctx, x0, y0, side, side, ticks.map(kxToX), ticks.map(kyToY), s);

  // Vertical S_z Colorbar on right side of Panel C
  const cbX = x0 + side + 10, cbW = 10, cbY = y0 + 14, cbH = side - 28;
  for (let i = 0; i < cbH; i++) {
    const szVal = 1 - 2 * (i / Math.max(1, cbH - 1));
    ctx.fillStyle = _trArrowColor(szVal, s.cmap);
    ctx.fillRect(cbX, cbY + i, cbW, 1.5);
  }
  ctx.strokeStyle = "#334155"; ctx.lineWidth = 0.8; ctx.strokeRect(cbX, cbY, cbW, cbH);
  ctx.fillStyle = s.inkColor; ctx.font = `700 ${Math.max(8.5, s.tickSize - 1)}px ${ff}`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillText("+1", cbX + cbW + 3, cbY + 2);
  ctx.fillText("0", cbX + cbW + 3, cbY + cbH * 0.5);
  ctx.fillText("−1", cbX + cbW + 3, cbY + cbH - 2);
  if (typeof drawSciText === "function") drawSciText(ctx, "⟨S_{z}⟩", cbX - 2, cbY - 7);
  else ctx.fillText("⟨Sz⟩", cbX - 2, cbY - 8);

  // Title & Badge
  const pfxC = s.panelLetters ? "(c) " : "";
  ctx.fillStyle = s.inkColor; ctx.font = `${axWeight}${s.titleSize}px ${ff}`; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.fillText(`${pfxC}2D Spin Texture @ ΔE = ${(an.eCutUser * 1000).toFixed(0)} meV (${an.k0Label})`, rx + rw / 2, ry + 22);
  if (s.showLegends) {
    ctx.font = "700 9.5px Inter, sans-serif"; ctx.fillStyle = stex.isDirect ? "#15803d" : "#6d28d9";
    ctx.textAlign = "left";
    ctx.fillText(stex.sourceTag, x0 + 6, y0 + 13);
  }

  // Tick Labels
  const decC = kMax < 0.12 ? 3 : 2;
  const tickPad = s.tickDir === "out" ? (s.tickLength + 4) : 5;
  ctx.fillStyle = s.inkColor; ctx.font = `${Math.max(9, s.tickSize - 0.5)}px ${ff}`; ctx.textAlign = "center"; ctx.textBaseline = "top";
  ticks.forEach(v => ctx.fillText(Math.abs(v) < 1e-4 ? "0" : v.toFixed(decC), kxToX(v), y0 + side + tickPad));
  ctx.font = `${axWeight}${s.axisLabelSize}px ${ff}`;
  if (typeof drawSciText === "function") drawSciText(ctx, "k_{x} (Å^{-1})", x0 + side / 2, y0 + side + tickPad + s.tickSize + 13);
  else ctx.fillText("kx (Å⁻¹)", x0 + side / 2, y0 + side + tickPad + s.tickSize + 5);
  ctx.textAlign = "right"; ctx.textBaseline = "middle"; ctx.font = `${Math.max(9, s.tickSize - 0.5)}px ${ff}`;
  ticks.forEach(v => ctx.fillText(Math.abs(v) < 1e-4 ? "0" : v.toFixed(decC), x0 - tickPad, kyToY(v)));
  ctx.save(); ctx.translate(rx + 15, y0 + side / 2); ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center"; ctx.font = `${axWeight}${s.axisLabelSize}px ${ff}`;
  if (typeof drawSciText === "function") drawSciText(ctx, "k_{y} (Å^{-1})", 0, 0);
  else ctx.fillText("ky (Å⁻¹)", 0, 0);
  ctx.restore();

  return { id: "C", x0, y0, w: side, h: side, kMax };
}

// --- Panel D (Bottom-Right): Exact 2D First Brillouin Zone, k-Path & Berry Curvature Ω_z(k) ---
function _trDrawPanelD_FBZAndBerry(ctx, rx, ry, rw, rh, an, st) {
  const s = st || _trGetPlotStyle();
  const ff = s.fontFamily;
  const axWeight = s.boldAxes ? "700 " : "";
  const padL = 56, padR = 54, padT = 36, padB = 46;
  const availW = rw - padL - padR, availH = rh - padT - padB;
  const side = Math.min(availW, availH);
  const x0 = rx + padL + Math.floor((availW - side) * 0.5);
  const y0 = ry + padT + Math.floor((availH - side) * 0.5);
  const fbz = an.fbz;
  const showBerry = document.getElementById("tr-show-berry")?.checked !== false;

  // Auto-fit strictly to the actual First Brillouin Zone polygon radius (handles primitive cells AND large supercells!)
  let fbzMaxR = 0.05;
  fbz.fbzPoly.forEach(v => { fbzMaxR = Math.max(fbzMaxR, Math.abs(v[0]), Math.abs(v[1])); });
  const baseKLim = fbzMaxR > 0.06 ? (fbzMaxR * 1.24) : Math.max(0.25, Math.max(fbz.b1Len, fbz.b2Len) * 0.65);
  const zoomD = TOPO_RASHBA_STATE.zoom.D || 1.0;
  const kLim = baseKLim / zoomD;

  const kxToX = (kx) => x0 + ((kx + kLim) / (2 * kLim)) * side;
  const kyToY = (ky) => y0 + ((kLim - ky) / (2 * kLim)) * side;

  ctx.save();
  ctx.beginPath(); ctx.rect(x0, y0, side, side); ctx.clip();

  // Optional faint Cartesian grid inside Panel D when gridMode === "normal"
  if (s.gridMode === "normal") {
    ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(x0, kyToY(0)); ctx.lineTo(x0 + side, kyToY(0));
    ctx.moveTo(kxToX(0), y0); ctx.lineTo(kxToX(0), y0 + side);
    ctx.stroke();
  }

  // Ultra-High-Resolution Smooth Berry Curvature Ω_z(k) Pixel Buffer clipped strictly inside the Wigner-Seitz FBZ polygon!
  if (showBerry && fbz.fbzPoly.length >= 3 && an.pBroken && fbz.isHex && fbz.cornersK.length === 6) {
    ctx.save();
    ctx.beginPath();
    fbz.fbzPoly.forEach((v, i) => {
      const px = kxToX(v[0]), py = kyToY(v[1]);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.clip();

    const userRes = parseInt(document.getElementById("tr-bz-res")?.value || "360", 10) || 360;
    const isHiDpiExport = Number(window._castepRenderDprOverride || 0) >= 3;
    const gridN = isHiDpiExport ? Math.max(userRes, 520) : Math.max(120, Math.min(540, userRes));
    const off = document.createElement("canvas");
    off.width = gridN;
    off.height = gridN;
    const octx = off.getContext("2d");
    const img = octx.createImageData(gridN, gridN);
    const data = img.data;

    const omScale = Math.max(1e-3, an.omegaPeakK);
    const corners = fbz.cornersK;
    const hv2 = an.hbarVF * an.hbarVF;
    const mK = an.deltaK * 0.5, mK2 = mK * mK;
    const mKp = an.deltaKp * 0.5, mKp2 = mKp * mKp;
    const invGrid = 2.0 * kLim / gridN;
    const cmap = s.cmap || "rdbu";
    const drawIso = s.isoContours !== false;

    for (let iy = 0; iy < gridN; iy++) {
      const ky = kLim - (iy + 0.5) * invGrid;
      const rowOff = iy * gridN * 4;
      for (let ix = 0; ix < gridN; ix++) {
        const kx = -kLim + (ix + 0.5) * invGrid;
        let om = 0;
        for (let ci = 0; ci < 6; ci++) {
          const c = corners[ci];
          const dx = kx - c.xy[0], dy = ky - c.xy[1];
          const q2 = dx * dx + dy * dy;
          const m = c.tau > 0 ? mK : mKp;
          const m2 = c.tau > 0 ? mK2 : mKp2;
          const denom = m2 + hv2 * q2;
          om += c.tau * (2.0 * hv2 * m) / (denom * Math.sqrt(denom));
        }
        const v = Math.max(-1, Math.min(1, om / omScale));
        let [r, g, b] = _trColorMapRGB(v, cmap, true);
        if (drawIso) {
          const absLin = Math.abs(v);
          if (Math.abs(absLin - 0.25) < 0.012 || Math.abs(absLin - 0.50) < 0.014 || Math.abs(absLin - 0.75) < 0.015) {
            r = Math.round(r * 0.90); g = Math.round(g * 0.90); b = Math.round(b * 0.90);
          }
        }
        const idx = rowOff + ix * 4;
        data[idx] = r; data[idx + 1] = g; data[idx + 2] = b; data[idx + 3] = 255;
      }
    }
    octx.putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(off, x0, y0, side, side);
    ctx.restore();
  } else if (fbz.fbzPoly.length >= 3) {
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    fbz.fbzPoly.forEach((v, i) => {
      const px = kxToX(v[0]), py = kyToY(v[1]);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.closePath(); ctx.fill();
  }

  // Exact Wigner-Seitz First Brillouin Zone Boundary
  if (fbz.fbzPoly.length >= 3) {
    ctx.strokeStyle = s.inkColor; ctx.lineWidth = Math.max(1.5, s.borderWidth * 1.25);
    ctx.beginPath();
    fbz.fbzPoly.forEach((v, i) => {
      const px = kxToX(v[0]), py = kyToY(v[1]);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.closePath(); ctx.stroke();
  }

  // Reciprocal Basis Vectors b1, b2 (scaled nicely to 0.42 so they stay crisp inside frame)
  if (s.showBasis !== false) {
    const drawBasisVec = (vec, lbl, col) => {
      const x1 = kxToX(0), y1 = kyToY(0);
      const x2 = kxToX(vec[0] * 0.42), y2 = kyToY(vec[1] * 0.42);
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1.4;
      ctx.setLineDash([3, 2]);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      ctx.setLineDash([]);
      const ang = Math.atan2(y2 - y1, x2 - x1);
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - 6 * Math.cos(ang - 0.4), y2 - 6 * Math.sin(ang - 0.4));
      ctx.lineTo(x2 - 6 * Math.cos(ang + 0.4), y2 - 6 * Math.sin(ang + 0.4));
      ctx.closePath(); ctx.fill();
      ctx.font = `italic 700 ${Math.max(10, s.tickSize)}px ${ff}`;
      ctx.textAlign = "left";
      ctx.fillText(lbl, x2 + 4, y2 - 2);
    };
    drawBasisVec(fbz.b1, "b₁", "#475569");
    drawBasisVec(fbz.b2, "b₂", "#475569");
  }

  // Highlighted DFT k-Path inside the FBZ!
  if (s.showKPath !== false && fbz.kPath2D.length >= 2) {
    ctx.strokeStyle = "#0f766e"; ctx.lineWidth = Math.max(2.0, s.lineWidth * 1.2);
    ctx.beginPath();
    let prev = null;
    fbz.kPath2D.forEach((pt) => {
      const px = kxToX(pt[0]), py = kyToY(pt[1]);
      if (!prev || Math.hypot(pt[0] - prev[0], pt[1] - prev[1]) > baseKLim * 0.45) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
      prev = pt;
    });
    ctx.stroke();
  }

  // Canonical High-Symmetry Points + Active Center k0 Star
  fbz.hsPts.forEach(p => {
    const px = kxToX(p.xy[0]), py = kyToY(p.xy[1]);
    ctx.fillStyle = "#ffffff"; ctx.strokeStyle = s.inkColor; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(px, py, 3.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = s.inkColor; ctx.font = `700 ${Math.max(10.5, s.tickSize + 0.5)}px ${ff}`;
    if (p.label === "Γ") {
      ctx.textAlign = "right"; ctx.textBaseline = "top";
      ctx.fillText("Γ", px - 8, py + 7);
    } else {
      ctx.textAlign = p.xy[0] >= 0 ? "left" : "right";
      ctx.textBaseline = p.xy[1] >= 0 ? "bottom" : "top";
      ctx.fillText(p.label, px + (p.xy[0] >= 0 ? 6 : -6), py + (p.xy[1] >= 0 ? -4 : 4));
    }
  });

  // Mark active k0 center with vivid violet ring
  const k0xy = fbz.kPath2D[an.k0Idx];
  if (k0xy) {
    ctx.strokeStyle = "#7c3aed"; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.arc(kxToX(k0xy[0]), kyToY(k0xy[1]), 6.5, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();

  const ticks = [-kLim * 0.7, 0, kLim * 0.7];
  _trDrawAxesBox(ctx, x0, y0, side, side, ticks.map(kxToX), ticks.map(kyToY), s);

  // Berry Curvature Colorbar (if active)
  if (showBerry && an.pBroken && fbz.isHex) {
    const cbX = x0 + side + 10, cbW = 10, cbY = y0 + 14, cbH = side - 28;
    for (let i = 0; i < cbH; i++) {
      const v = 1 - 2 * (i / Math.max(1, cbH - 1));
      ctx.fillStyle = _trDivergingColor(v, s.cmap);
      ctx.fillRect(cbX, cbY + i, cbW, 1.5);
    }
    ctx.strokeStyle = "#334155"; ctx.lineWidth = 0.8; ctx.strokeRect(cbX, cbY, cbW, cbH);
    ctx.fillStyle = s.inkColor; ctx.font = `700 ${Math.max(8.5, s.tickSize - 1)}px ${ff}`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText(`+${an.omegaPeakK.toFixed(0)}`, cbX + cbW + 3, cbY + 2);
    ctx.fillText("0", cbX + cbW + 3, cbY + cbH * 0.5);
    ctx.fillText(`−${an.omegaPeakK.toFixed(0)}`, cbX + cbW + 3, cbY + cbH - 2);
    if (typeof drawSciText === "function") drawSciText(ctx, "Ω_{z} (Å^{2})", cbX - 4, cbY - 7);
    else ctx.fillText("Ωz (Å²)", cbX - 4, cbY - 8);
  }

  const pfxD = s.panelLetters ? "(d) " : "";
  ctx.fillStyle = s.inkColor; ctx.font = `${axWeight}${s.titleSize}px ${ff}`; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  if (typeof drawSciText === "function") drawSciText(ctx, `${pfxD}First Brillouin Zone, k-Path & Berry Curvature Ω_{z}(k)`, rx + rw / 2, ry + 22);
  else ctx.fillText(`${pfxD}First Brillouin Zone, k-Path & Berry Curvature Ωz(k)`, rx + rw / 2, ry + 22);

  const decD = kLim < 0.25 ? 3 : 2;
  const tickPad = s.tickDir === "out" ? (s.tickLength + 4) : 5;
  ctx.fillStyle = s.inkColor; ctx.font = `${Math.max(9, s.tickSize - 0.5)}px ${ff}`; ctx.textAlign = "center"; ctx.textBaseline = "top";
  ticks.forEach(v => ctx.fillText(Math.abs(v) < 1e-4 ? "0" : v.toFixed(decD), kxToX(v), y0 + side + tickPad));
  ctx.font = `${axWeight}${s.axisLabelSize}px ${ff}`;
  if (typeof drawSciText === "function") drawSciText(ctx, "k_{x} (Å^{-1})", x0 + side / 2, y0 + side + tickPad + s.tickSize + 13);
  else ctx.fillText("kx (Å⁻¹)", x0 + side / 2, y0 + side + tickPad + s.tickSize + 5);
  ctx.textAlign = "right"; ctx.textBaseline = "middle"; ctx.font = `${Math.max(9, s.tickSize - 0.5)}px ${ff}`;
  ticks.forEach(v => ctx.fillText(Math.abs(v) < 1e-4 ? "0" : v.toFixed(decD), x0 - tickPad, kyToY(v)));
  ctx.save(); ctx.translate(rx + 15, y0 + side / 2); ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center"; ctx.font = `${axWeight}${s.axisLabelSize}px ${ff}`;
  if (typeof drawSciText === "function") drawSciText(ctx, "k_{y} (Å^{-1})", 0, 0);
  else ctx.fillText("ky (Å⁻¹)", 0, 0);
  ctx.restore();

  return { id: "D", x0, y0, w: side, h: side, kLim };
}

// ---------------- Live Interactive Hover Readout ----------------

function _trHandleCanvasHover(e) {
  const an = TOPO_RASHBA_STATE.analysis;
  const rd = document.getElementById("tr-plot-readout");
  if (!an || !rd) return;
  const rect = e.target.getBoundingClientRect();
  const mx = e.clientX - rect.left, my = e.clientY - rect.top;
  const g = (TOPO_RASHBA_STATE.panelGeoms || []).find(p => mx >= p.x0 && mx <= p.x0 + p.w && my >= p.y0 && my <= p.y0 + p.h);
  if (!g) return;

  if (g.id === "A" && an.slicePts.length) {
    const sCur = g.sMin + ((mx - g.x0) / g.w) * (g.sMax - g.sMin);
    const best = an.slicePts.reduce((a, b) => Math.abs(b.s - sCur) < Math.abs(a.s - sCur) ? b : a);
    rd.innerHTML = `<strong>(a) Dispersion</strong> • k − k(${_trEsc(an.k0Label)}) = <strong>${best.s >= 0 ? "+" : ""}${best.s.toFixed(4)} Å⁻¹</strong> | <span style="color:#dc2626; font-weight:700;">E₊ = ${best.eHi.toFixed(4)} eV</span> • <span style="color:#2563eb; font-weight:700;">E₋ = ${best.eLo.toFixed(4)} eV</span> • <strong>ΔE = ${(best.dE * 1000).toFixed(2)} meV</strong>`;
  } else if (g.id === "B" && an.slicePts.length) {
    const kCur = ((mx - g.x0) / g.w) * g.kMax;
    const fitMeV = Math.sqrt(an.deltaZ * an.deltaZ + Math.pow(2 * an.alphaR * kCur + 2 * an.gamma3 * kCur * kCur * kCur, 2)) * 1000;
    rd.innerHTML = `<strong>(b) Spin Splitting</strong> • |k − k(${_trEsc(an.k0Label)})| = <strong>${kCur.toFixed(4)} Å⁻¹</strong> | <span style="color:#7c3aed; font-weight:700;">Fitted ΔE = ${fitMeV.toFixed(2)} meV</span> (α<sub>R</sub> = ${an.alphaR.toFixed(4)} eV·Å, γ<sub>3</sub> = ${an.gamma3.toFixed(3)} eV·Å³)`;
  } else if (g.id === "C") {
    const kx = -g.kMax + ((mx - g.x0) / g.w) * 2 * g.kMax;
    const ky = g.kMax - ((my - g.y0) / g.h) * 2 * g.kMax;
    if (an.spinTex.evalH) {
      const h = an.spinTex.evalH(kx, ky);
      const hm = Math.hypot(h[0], h[1], h[2]) || 1;
      const sx = h[0] / hm, sy = h[1] / hm, sz = h[2] / hm;
      const phiDeg = Math.atan2(sy, sx) * 180 / Math.PI;
      rd.innerHTML = `<strong>(c) 2D Spin Texture</strong> • (k<sub>x</sub>, k<sub>y</sub>) = (<strong>${kx.toFixed(3)}</strong>, <strong>${ky.toFixed(3)}</strong>) Å⁻¹ | <strong>⟨S⟩</strong> = (<span style="color:#dc2626;">${sx.toFixed(2)}</span>, <span style="color:#16a34a;">${sy.toFixed(2)}</span>, <span style="color:#2563eb;">${sz.toFixed(2)}</span>) • φ<sub>S</sub> = ${phiDeg.toFixed(1)}°`;
    }
  } else if (g.id === "D") {
    const kx = -g.kLim + ((mx - g.x0) / g.w) * 2 * g.kLim;
    const ky = g.kLim - ((my - g.y0) / g.h) * 2 * g.kLim;
    let om = 0;
    if (an.pBroken && an.fbz.isHex) {
      for (const c of an.fbz.cornersK) {
        const q2 = (kx - c.xy[0]) ** 2 + (ky - c.xy[1]) ** 2;
        const m = (c.tau > 0 ? an.deltaK : an.deltaKp) * 0.5;
        const hv = an.hbarVF;
        om += c.tau * (2 * hv * hv * m) / Math.pow(m * m + hv * hv * q2, 1.5);
      }
    }
    rd.innerHTML = `<strong>(d) First Brillouin Zone</strong> • (k<sub>x</sub>, k<sub>y</sub>) = (<strong>${kx.toFixed(3)}</strong>, <strong>${ky.toFixed(3)}</strong>) Å⁻¹ | <strong>Berry Curvature Ω<sub>z</sub>(k) ≈ ${om.toFixed(2)} Å²</strong>`;
  }
}

// ---------------- Data Table Builders & Export Suite (HD / TSV / PNG / CSV / XLSX) ----------------

function _trBuildTableDispersion(an) {
  return {
    title: `Rashba Dispersion near ${an.k0Label} (${an.material})`,
    headers: ["k_Offset_A-1", "Abs_k_A-1", "E_Lower_eV", "E_Upper_eV", "E_Avg_eV", "Delta_E_meV", "Fit_Delta_E_meV"],
    rows: an.slicePts.map(p => {
      const fMeV = Math.sqrt(an.deltaZ * an.deltaZ + Math.pow(2 * an.alphaR * p.absK + 2 * an.gamma3 * Math.pow(p.absK, 3), 2)) * 1000;
      return [
        Number(p.s.toFixed(6)), Number(p.absK.toFixed(6)),
        Number(p.eLo.toFixed(6)), Number(p.eHi.toFixed(6)), Number(p.eAvg.toFixed(6)),
        Number((p.dE * 1000).toFixed(4)), Number(fMeV.toFixed(4))
      ];
    })
  };
}

function _trBuildTableSplitting(an) {
  return _trBuildTableDispersion(an);
}

function _trBuildTableSpinTexture(an) {
  const rows = [];
  if (an.spinTex.isDirect && an.spinTex.directPts) {
    an.spinTex.directPts.forEach(p => rows.push(["Direct", p.kx, p.ky, p.sx, p.sy, p.sz]));
  } else {
    an.spinTex.outerContour.forEach(p => rows.push(["Outer", Number(p.kx.toFixed(6)), Number(p.ky.toFixed(6)), Number(p.sx.toFixed(5)), Number(p.sy.toFixed(5)), Number(p.sz.toFixed(5))]));
    an.spinTex.innerContour.forEach(p => rows.push(["Inner", Number(p.kx.toFixed(6)), Number(p.ky.toFixed(6)), Number(p.sx.toFixed(5)), Number(p.sy.toFixed(5)), Number(p.sz.toFixed(5))]));
  }
  return {
    title: `2D Spin Texture (${an.spinTex.sourceTag})`,
    headers: ["Contour", "kx_A-1", "ky_A-1", "Sx", "Sy", "Sz"],
    rows
  };
}

function _trBuildTableHighSym(an) {
  return {
    title: `High-Symmetry SOC Splittings (${an.material})`,
    headers: ["Point", "kx_frac", "ky_frac", "kz_frac", "VBM_eV", "CBM_eV", "dE_VBM_meV", "dE_CBM_meV", "Local_Gap_eV"],
    rows: an.hsSplittings.map(h => [
      h.label, Number(h.frac[0].toFixed(5)), Number(h.frac[1].toFixed(5)), Number(h.frac[2].toFixed(5)),
      Number(h.evTop.toFixed(5)), Number(h.ecBot.toFixed(5)),
      Number(h.dEvMeV.toFixed(3)), Number(h.dEcMeV.toFixed(3)), Number(h.localGapEv.toFixed(4))
    ])
  };
}

function _trBuildTableFBZBerry(an) {
  const fbz = an.fbz;
  const rows = [];
  if (an.pBroken && fbz.isHex && fbz.cornersK.length === 6) {
    let kLim = 0.05;
    fbz.fbzPoly.forEach(v => { kLim = Math.max(kLim, Math.abs(v[0]), Math.abs(v[1])); });
    const nG = 41;
    const hv2 = an.hbarVF * an.hbarVF;
    const mK = an.deltaK * 0.5, mK2 = mK * mK;
    const mKp = an.deltaKp * 0.5, mKp2 = mKp * mKp;
    const ptInPoly = (x, y, poly) => {
      let inside = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
        if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / ((yj - yi) || 1e-12) + xi)) inside = !inside;
      }
      return inside;
    };
    for (let iy = 0; iy < nG; iy++) {
      const ky = -kLim + (iy / (nG - 1)) * 2 * kLim;
      for (let ix = 0; ix < nG; ix++) {
        const kx = -kLim + (ix / (nG - 1)) * 2 * kLim;
        if (!ptInPoly(kx, ky, fbz.fbzPoly)) continue;
        let om = 0;
        for (const c of fbz.cornersK) {
          const q2 = (kx - c.xy[0]) ** 2 + (ky - c.xy[1]) ** 2;
          const m = c.tau > 0 ? mK : mKp;
          const m2 = c.tau > 0 ? mK2 : mKp2;
          const d = m2 + hv2 * q2;
          om += c.tau * (2 * hv2 * m) / (d * Math.sqrt(d));
        }
        rows.push([Number(kx.toFixed(5)), Number(ky.toFixed(5)), Number(om.toFixed(4))]);
      }
    }
    if (rows.length) {
      return {
        title: `First Brillouin Zone Berry Curvature Ω_z(kx, ky) (${an.material})`,
        headers: ["kx_A-1", "ky_A-1", "Berry_Omega_z_A2"],
        rows
      };
    }
  }
  return _trBuildTableHighSym(an);
}

function copyTopoRashbaHD() {
  if (!TOPO_RASHBA_STATE.analysis) return;
  if (typeof copyCastepCanvasHD === "function") copyCastepCanvasHD("tr-main-canvas", "Rashba, Spin Texture & FBZ");
}
window.copyTopoRashbaHD = copyTopoRashbaHD;

function exportTopoRashbaPNG() {
  const an = TOPO_RASHBA_STATE.analysis;
  if (!an) return;
  if (typeof exportCastepCanvasPNG === "function") exportCastepCanvasPNG("tr-main-canvas", `${an.seed}_Rashba_Spin_Topology.png`);
}
window.exportTopoRashbaPNG = exportTopoRashbaPNG;

async function copyTopoRashbaTSV() {
  const an = TOPO_RASHBA_STATE.analysis;
  if (!an) return;
  const tbl = _trBuildTableDispersion(an);
  const tsv = [tbl.headers.join("\t"), ...tbl.rows.map(r => r.join("\t"))].join("\n");
  window._lastTopoRashbaExportInfo = { rows: tbl.rows.length, cols: tbl.headers.length, headers: tbl.headers };
  try {
    await navigator.clipboard.writeText(tsv);
    if (typeof showToast === "function") showToast(`Copied Rashba dispersion & splitting TSV (${tbl.rows.length} rows)!`, "success");
  } catch {
    if (typeof showToast === "function") showToast("Prepared Rashba TSV (clipboard blocked by headless browser).", "info");
  }
}
window.copyTopoRashbaTSV = copyTopoRashbaTSV;

function exportTopoRashbaCSV() {
  const an = TOPO_RASHBA_STATE.analysis;
  if (!an) return;
  const tbl = _trBuildTableDispersion(an);
  const csv = [tbl.headers.join(","), ...tbl.rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${an.seed}_Rashba_SOC_Splitting.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1500);
}
window.exportTopoRashbaCSV = exportTopoRashbaCSV;

function exportTopoRashbaXLSX() {
  const an = TOPO_RASHBA_STATE.analysis;
  if (!an || typeof buildXlsxBlob !== "function") {
    exportTopoRashbaCSV();
    return;
  }
  const summarySheet = {
    name: "Rashba_Topology_Summary",
    headers: ["Parameter", "Value", "Units / Notes"],
    rows: [
      ["Material", an.material, an.regime],
      ["Space Group / Lattice", an.meta.sgNum ? `#${an.meta.sgNum} (${an.meta.sgName})` : an.fbz.latticeType, an.fbz.is2DSlab ? "2D Slab" : "3D Bulk"],
      ["Inversion Symmetry P", an.pBroken ? "Broken" : "Preserved", ""],
      ["Time-Reversal Symmetry T", an.trsBroken ? "Broken" : "Preserved", `|M| = ${an.meta.netSpinMag.toFixed(4)} mu_B`],
      ["Band Pair & Center", `${an.pairLabel} @ ${an.k0Label}`, an.rashbaMethodTag],
      ["Linear Rashba alpha_R", Number(an.alphaR.toFixed(5)), "eV*Angstrom"],
      ["Cubic Warping gamma_3", Number(an.gamma3.toFixed(5)), "eV*Angstrom^3"],
      ["Rashba Energy E_R", Number((an.ERDisplay * 1000).toFixed(4)), "meV"],
      ["Rashba Offset k_R", Number(an.kRDisplay.toFixed(5)), "Angstrom^-1"],
      ["Zero-k Zeeman Gap Delta_Z", Number((an.deltaZ * 1000).toFixed(4)), "meV"],
      ["Effective Mass m*", Number(an.mStar.toFixed(4)), "m_0"],
      ["Spin Precession Length L_s", Number.isFinite(an.spinPrecessionNm) ? Number(an.spinPrecessionNm.toFixed(2)) : "Inf", "nm"],
      ["Spin Winding Number w_S", an.spinTex.windingNumber, `Berry phase = ${an.spinTex.berryPhasePi.toFixed(3)} pi`],
      ["Valley SOC dE_v(K)", Number(an.dEvKMeV.toFixed(3)), "meV"],
      ["Valley SOC dE_c(K)", Number(an.dEcKMeV.toFixed(3)), "meV"],
      ["Valley Polarization dE_v(K-K')", Number(an.valleySplitVMeV.toFixed(3)), "meV"],
      ["Peak Berry Curvature |Omega_z(K)|", Number(an.omegaPeakK.toFixed(3)), "Angstrom^2 (Massive-Dirac estimate)"],
      ["Valley Chern Number C_v", an.valleyChern, an.hasAVHE ? "AVHE Allowed" : "VHE"]
    ]
  };
  const disp = _trBuildTableDispersion(an);
  const spin = _trBuildTableSpinTexture(an);
  const hs = _trBuildTableHighSym(an);
  const blob = buildXlsxBlob([
    summarySheet,
    { name: "Rashba_Dispersion", headers: disp.headers, rows: disp.rows },
    { name: "Spin_Texture", headers: spin.headers, rows: spin.rows },
    { name: "HighSym_Splittings", headers: hs.headers, rows: hs.rows }
  ]);
  if (blob && typeof triggerBlobDownload === "function") {
    triggerBlobDownload(blob, `${an.seed}_Rashba_Spin_Topology.xlsx`);
    if (typeof showToast === "function") showToast(`Exported 4-tab Excel workbook ${an.seed}_Rashba_Spin_Topology.xlsx!`, "success");
  }
}
window.exportTopoRashbaXLSX = exportTopoRashbaXLSX;
