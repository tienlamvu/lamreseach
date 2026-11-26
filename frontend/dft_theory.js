/* ============================================================================
   DFT Theory Curriculum Module (v144) — Word Equation (Cambria) + Auto-Wrap
   Auto-Fetch DOI References + Academic Author/Updated Byline + Dual-Mode CMS
   ============================================================================ */

(function () {
  const STORAGE_KEY = "dft_theory_lectures_v2";
  const LEGACY_KEY = "dft_theory_lectures_v1";
  const ACTIVE_KEY = "dft_theory_active_lec";
  const DEFAULT_AUTHOR = "Vu Tien Lam";
  const DEFAULT_AFFILIATION = "Sungkyunkwan University";
  const DEFAULT_UPDATED_AT = "November 24, 2026";

  function formatEnglishDate(d = new Date()) {
    try {
      return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    } catch (_) {
      return DEFAULT_UPDATED_AT;
    }
  }

  function getDefaultLectureAuthor() {
    if (typeof STATE !== "undefined" && STATE.profile && STATE.profile.name) {
      return String(STATE.profile.name).trim() || DEFAULT_AUTHOR;
    }
    return DEFAULT_AUTHOR;
  }

  function getDefaultLectureAffiliation() {
    if (typeof STATE !== "undefined" && STATE.profile && STATE.profile.affiliation) {
      const raw = String(STATE.profile.affiliation).trim();
      if (raw) {
        const parts = raw.split(/\s*,\s*/).filter(Boolean);
        if (parts.length >= 2) {
          return `${parts[0]}, ${parts[parts.length - 1]}`;
        }
        return raw;
      }
    }
    return DEFAULT_AFFILIATION;
  }

  function escAttr(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function escHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  const vec = (s) => `<span class="dft-vec">${s}</span>`;
  const hat = (s) => `<span class="dft-hat">${s}</span>`;

  // Publication LaTeX / KaTeX display equation helper (cleanly editable in Visual & Code!)
  const eq = (tex, num, note = "") =>
    `<div class="dft-eq-box" data-eqnum="${escAttr(num)}"><div class="dft-eq-inner"><div class="dft-eq-math" data-tex="${escAttr(tex)}">${escHtml(tex)}</div><div class="dft-eq-num">(${escHtml(num)})</div></div>${note ? `<div class="dft-eq-note">${note}</div>` : ""}</div>`;

  const defBox = (title, body) =>
    `<div class="dft-callout dft-callout-def"><div class="dft-callout-title">&#128216; Definition &mdash; ${title}</div><div class="dft-callout-body">${body}</div></div>`;
  const tipBox = (title, body) =>
    `<div class="dft-callout dft-callout-tip"><div class="dft-callout-title">&#128161; Physical Insight &mdash; ${title}</div><div class="dft-callout-body">${body}</div></div>`;
  const labBox = (title, paneId, btnLabel, stepsHtml, extraBtns = "") =>
    `<div class="dft-lab-box">
      <div class="dft-lab-head">
        <div>
          <div class="dft-lab-eyebrow">HANDS-ON PRACTICE IN DATA ANALYSIS</div>
          <div class="dft-lab-title">&#129514; ${title}</div>
        </div>
        <div class="dft-lab-btns">
          <button type="button" class="btn btn-primary btn-sm" onclick="openCastepToolFromLecture('${paneId}')">&#128640; ${btnLabel} &rarr;</button>
          ${extraBtns}
        </div>
      </div>
      <div class="dft-lab-body">${stepsHtml}</div>
    </div>`;

  const TOOL_META_MAP = {
    builder: "3D View & Slab",
    files: "Param Builder & Files",
    gateway: "Gateway & Export",
    convergence: "Conv. & Forces",
    electronic: "Band & PDOS",
    transport: "m* & Drude",
    optics: "Optical Tab",
    chdiff: "Charge Diff (\u0394\u03c1)",
    mulliken: "Mulliken & Spin"
  };

  function cloneJson(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // =========================================================================
  // KATEX EQUATION ENGINE — UNIFIED WORD EQUATION (CAMBRIA) + AUTO LINE-WRAP
  // =========================================================================
  let _katexRetryTimer = null;

  // Split compound LaTeX display equations at top-level \qquad (outside {...} and \left...\right)
  function splitTopLevelQquad(tex) {
    const parts = [];
    let buf = "";
    let braceDepth = 0;
    let leftDepth = 0;
    let i = 0;
    while (i < tex.length) {
      const ch = tex[i];
      if (ch === "\\") {
        // Check \left / \right / \qquad
        if (tex.startsWith("\\left", i) && !/[a-zA-Z]/.test(tex[i + 5] || "")) {
          leftDepth++;
          buf += "\\left";
          i += 5;
          continue;
        }
        if (tex.startsWith("\\right", i) && !/[a-zA-Z]/.test(tex[i + 6] || "")) {
          leftDepth = Math.max(0, leftDepth - 1);
          buf += "\\right";
          i += 6;
          continue;
        }
        if (braceDepth === 0 && leftDepth === 0 && tex.startsWith("\\qquad", i) && !/[a-zA-Z]/.test(tex[i + 6] || "")) {
          if (buf.trim()) parts.push(buf.trim());
          buf = "";
          i += 6;
          continue;
        }
        // Keep escaped char together (e.g. \{, \}, \\)
        buf += tex.slice(i, i + 2);
        i += 2;
        continue;
      }
      if (ch === "{") braceDepth++;
      else if (ch === "}") braceDepth = Math.max(0, braceDepth - 1);
      buf += ch;
      i++;
    }
    if (buf.trim()) parts.push(buf.trim());
    return parts.length ? parts : [tex];
  }

  function renderSingleKatexNode(el, displayMode) {
    const tex = el.getAttribute("data-tex") || "";
    if (!tex) return false;
    if (typeof window.katex !== "undefined" && typeof window.katex.render === "function") {
      try {
        if (displayMode) {
          const segs = splitTopLevelQquad(tex);
          if (segs.length > 1) {
            el.innerHTML = "";
            const wrap = document.createElement("div");
            wrap.className = "dft-eq-seg-wrap";
            segs.forEach(seg => {
              const segEl = document.createElement("span");
              segEl.className = "dft-eq-seg";
              window.katex.render(seg, segEl, {
                displayMode: true,
                throwOnError: false,
                strict: "ignore",
                trust: false
              });
              wrap.appendChild(segEl);
            });
            el.appendChild(wrap);
            el.setAttribute("data-katex-rendered", "1");
            return true;
          }
        }
        window.katex.render(tex, el, {
          displayMode: Boolean(displayMode),
          throwOnError: false,
          strict: "ignore",
          trust: false
        });
        el.setAttribute("data-katex-rendered", "1");
        return true;
      } catch (err) {
        el.textContent = tex;
        return false;
      }
    }
    return false;
  }

  function upgradeRawDollarMathInTextNodes(rootEl) {
    if (!rootEl || typeof window.katex === "undefined") return;
    const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.includes("$")) return NodeFilter.FILTER_REJECT;
        const p = node.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        if (p.closest("code, pre, textarea, script, style, svg, .katex, .dft-eq-math, .dft-inline-math")) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    const re = /(\$\$[\s\S]+?\$\$|\$(?!\s)([^$\n]+?)(?<!\s)\$)/g;
    textNodes.forEach(tn => {
      const text = tn.nodeValue;
      if (!re.test(text)) return;
      re.lastIndex = 0;
      const frag = document.createDocumentFragment();
      let lastIdx = 0;
      let m;
      while ((m = re.exec(text)) !== null) {
        if (m.index > lastIdx) {
          frag.appendChild(document.createTextNode(text.slice(lastIdx, m.index)));
        }
        const token = m[0];
        const isDisp = token.startsWith("$$");
        const tex = isDisp ? token.slice(2, -2).trim() : token.slice(1, -1).trim();
        const span = document.createElement(isDisp ? "div" : "span");
        span.className = isDisp ? "dft-eq-math" : "dft-inline-math";
        span.setAttribute("data-tex", tex);
        renderSingleKatexNode(span, isDisp);
        frag.appendChild(span);
        lastIdx = re.lastIndex;
      }
      if (lastIdx < text.length) {
        frag.appendChild(document.createTextNode(text.slice(lastIdx)));
      }
      if (tn.parentNode) tn.parentNode.replaceChild(frag, tn);
    });
  }

  function decorateVisualEquationsForEditing(rootEl) {
    if (!rootEl) return;
    rootEl.querySelectorAll(".dft-eq-box").forEach(box => {
      box.setAttribute("contenteditable", "false");
      box.classList.add("dft-vis-eq-card");
      if (!box.querySelector(".dft-vis-eq-actions")) {
        const bar = document.createElement("div");
        bar.className = "dft-vis-eq-actions";
        bar.setAttribute("data-editor-ui", "1");
        bar.innerHTML = `<button type="button" class="dft-vis-eq-btn" onclick="openDftEquationBuilderForVisualNode(this.closest('.dft-eq-box'))" title="Edit equation in Word/LaTeX builder">&#9999;&#65039; Edit Eq</button><button type="button" class="dft-vis-eq-btn dft-vis-eq-del" onclick="removeDftVisualEquationNode(this.closest('.dft-eq-box'))" title="Remove equation">&times;</button>`;
        box.appendChild(bar);
      }
    });
    rootEl.querySelectorAll(".dft-inline-math[data-tex]").forEach(sp => {
      sp.setAttribute("contenteditable", "false");
      sp.classList.add("dft-vis-inline-eq");
      sp.title = "Double-click to edit inline equation";
    });
  }

  function renderDftMathInElement(rootEl, opts = {}) {
    if (!rootEl) return;
    if (typeof window.katex === "undefined") {
      if (!_katexRetryTimer) {
        _katexRetryTimer = setInterval(() => {
          if (typeof window.katex !== "undefined") {
            clearInterval(_katexRetryTimer);
            _katexRetryTimer = null;
            const stage = document.getElementById("dft-theory-lecture-stage");
            if (stage) renderDftMathInElement(stage);
            const vis = document.getElementById("dft-ed-visual");
            if (vis && vis.offsetParent !== null) renderDftMathInElement(vis, { editable: true });
          }
        }, 120);
        setTimeout(() => {
          if (_katexRetryTimer) { clearInterval(_katexRetryTimer); _katexRetryTimer = null; }
        }, 8000);
      }
      return;
    }

    rootEl.querySelectorAll(".dft-eq-math[data-tex]").forEach(el => {
      renderSingleKatexNode(el, true);
    });
    rootEl.querySelectorAll(".dft-inline-math[data-tex]").forEach(el => {
      renderSingleKatexNode(el, false);
    });
    if (!opts.skipDollarUpgrade) {
      upgradeRawDollarMathInTextNodes(rootEl);
    }
    if (opts.editable) {
      decorateVisualEquationsForEditing(rootEl);
    }
  }
  window.renderDftMathInElement = renderDftMathInElement;

  // =========================================================================
  // BUILT-IN 10-LECTURE CURRICULUM (TRUE LATEX/KATEX + PEER-REVIEWED DOIs)
  // =========================================================================
  const DEFAULT_LECTURES = [
    // =========================================================================
    // LECTURE 1: QUANTUM MANY-BODY PROBLEM & FOUNDATIONS OF DFT
    // =========================================================================
    {
      id: "lec1",
      num: 1,
      shortTab: "L1: Quantum & HK/KS",
      level: "Foundation",
      levelClass: "basic",
      readTime: "18 min",
      toolPane: "convergence",
      toolName: "Conv. & Forces",
      title: "Lecture 1: Quantum Many-Body Problem, Hohenberg–Kohn Theorems & Kohn–Sham DFT",
      subtitle: "From the exact 3N-dimensional Schrödinger equation and Levy–Lieb constrained search to the self-consistent Kohn–Sham orbital formalism and Pulay/Kerker SCF mixing.",
      keywords: "schrodinger born oppenheimer many-body hohenberg kohn levy lieb variational kohn-sham janak scf self-consistent field pulay kerker hartree density functional convergence",
      objectives: [
        "Explain why solving the interacting many-electron Schrödinger equation directly is exponentially intractable and derive the Born–Oppenheimer separation.",
        "Master the Hohenberg–Kohn theorems and Levy–Lieb constrained search establishing electron density n(r) as the exact ground-state variable.",
        "Derive the Kohn–Sham single-particle equations, Janak's theorem, and the physical distinction between KS eigenvalues and quasiparticle energies.",
        "Trace the Self-Consistent Field (SCF) loop including Pulay DIIS density mixing and Kerker preconditioning against charge sloshing."
      ],
      contentHtml: `
        <h3>1.1 The Many-Body Problem &amp; Born–Oppenheimer Approximation</h3>
        <p>Every equilibrium and dynamical property of a crystal, surface, or molecule—its lattice constants, electronic band gap, magnetism, optical spectrum, and catalytic activity—is governed by the non-relativistic time-independent <strong>many-body Schrödinger equation</strong> for <i>N</i> electrons at coordinates {${vec('r')}<sub><i>i</i></sub>} and <i>M</i> nuclei of charges <i>Z<sub>I</sub></i> and masses <i>M<sub>I</sub></i> at positions {${vec('R')}<sub><i>I</i></sub>}:</p>
        ${eq(String.raw`\hat{H}\,\Psi\!\left(\{\mathbf{r}_i\}, \{\mathbf{R}_I\}\right) = E\,\Psi\!\left(\{\mathbf{r}_i\}, \{\mathbf{R}_I\}\right)`, "1.1")}
        <p>In atomic units (&#8463; = <i>m</i><sub>e</sub> = <i>e</i> = 4&pi;&epsilon;<sub>0</sub> = 1, where lengths are in Bohr <i>a</i><sub>0</sub> = 0.529177 &Aring; and energies in Hartree 1 Ha = 27.211386 eV), the exact molecular or crystalline Hamiltonian comprises five distinct physical operators:</p>
        ${eq(String.raw`\hat{H} = -\frac{1}{2}\sum_{i=1}^{N}\nabla_i^2 - \sum_{I=1}^{M}\frac{1}{2M_I}\nabla_I^2 - \sum_{i,I}\frac{Z_I}{\left|\mathbf{r}_i - \mathbf{R}_I\right|} + \frac{1}{2}\sum_{i\neq j}\frac{1}{\left|\mathbf{r}_i - \mathbf{r}_j\right|} + \frac{1}{2}\sum_{I\neq J}\frac{Z_I Z_J}{\left|\mathbf{R}_I - \mathbf{R}_J\right|}`, "1.2",
          "Terms left to right: electronic kinetic energy <i>T</i><sub>e</sub>, nuclear kinetic energy <i>T</i><sub>n</sub>, electron–nucleus Coulomb attraction <i>V</i><sub>ne</sub>, electron–electron Coulomb repulsion <i>V</i><sub>ee</sub>, and nucleus–nucleus Ewald repulsion <i>E</i><sub>II</sub>.")}

        ${defBox("Born–Oppenheimer (Adiabatic) Approximation",
          "Because nuclei are 1,836 to &gt;400,000 times heavier than electrons (<i>M<sub>I</sub></i> &gg; <i>m</i><sub>e</sub>), electrons relax almost instantaneously to any nuclear displacement. Factoring the wavefunction as &Psi;({<b>r</b><sub><i>i</i></sub>}, {<b>R</b><sub><i>I</i></sub>}) &approx; &psi;<sub>el</sub>({<b>r</b><sub><i>i</i></sub>}; {<b>R</b><sub><i>I</i></sub>}) &chi;<sub>nuc</sub>({<b>R</b><sub><i>I</i></sub>}) decouples nuclear motion and solves the electronic problem at fixed nuclear positions {<b>R</b><sub><i>I</i></sub>}. The parametric electronic ground-state energy plus <i>E</i><sub>II</sub> defines the <strong>Potential Energy Surface (PES)</strong> <i>E</i>({<b>R</b><sub><i>I</i></sub>}).")}

        <p>Under the Born–Oppenheimer approximation, the clamped nuclei produce a static external potential <i>v</i><sub>ext</sub>(${vec('r')}) = &minus;&sum;<sub><i>I</i></sub> <i>Z<sub>I</sub></i> / |${vec('r')} &minus; ${vec('R')}<sub><i>I</i></sub>|, reducing Eq. (1.2) to the interacting electronic Hamiltonian:</p>
        ${eq(String.raw`\hat{H}_{\mathrm{el}} = \hat{T}_{\mathrm{e}} + \hat{V}_{\mathrm{ee}} + \sum_{i=1}^{N} v_{\mathrm{ext}}(\mathbf{r}_i)`, "1.3")}
        <p><strong>Why Wavefunction Methods Hit an Exponential Wall:</strong> Representing the antisymmetric wavefunction &psi;(${vec('r')}<sub>1</sub>, &hellip;, ${vec('r')}<sub><i>N</i></sub>) on a coarse 10-point 3D grid per electron requires 10<sup>3<i>N</i></sup> complex amplitudes. Even for a single Fe atom (<i>N</i> = 26), 10<sup>78</sup> numbers exceeds the count of atoms in the observable universe. Density Functional Theory bypasses this exponential barrier completely.</p>

        <h3>1.2 Electron Density, Hohenberg–Kohn Theorems &amp; Levy–Lieb Search</h3>
        <p>Instead of the 3<i>N</i>-dimensional wavefunction, DFT uses the <strong>3-dimensional electron number density</strong> <i>n</i>(${vec('r')})—a scalar physical observable depending on only three spatial coordinates (<i>x</i>, <i>y</i>, <i>z</i>):</p>
        ${eq(String.raw`n(\mathbf{r}) = N \int \mathrm{d}^3\mathbf{r}_2 \cdots \mathrm{d}^3\mathbf{r}_N \allowbreak\,\left|\psi(\mathbf{r}, \mathbf{r}_2, \dots, \mathbf{r}_N)\right|^2, \qquad \int n(\mathbf{r})\,\mathrm{d}^3\mathbf{r} = N`, "1.4")}

        <div class="dft-two-col">
          ${defBox("Hohenberg–Kohn Theorem I (Uniqueness)",
            "For any system of interacting electrons in a non-degenerate ground state, the ground-state density <i>n</i><sub>0</sub>(<b>r</b>) uniquely determines the external potential <i>v</i><sub>ext</sub>(<b>r</b>) up to a trivial additive constant. Hence <i>n</i><sub>0</sub>(<b>r</b>) uniquely determines the entire Hamiltonian, &psi;<sub>0</sub>[<i>n</i><sub>0</sub>], and <em>every</em> ground-state physical observable as a functional of <i>n</i>(<b>r</b>).")}
          ${defBox("Hohenberg–Kohn Theorem II (Variational Principle)",
            "A universal functional <i>F</i><sub>HK</sub>[<i>n</i>] independent of <i>v</i><sub>ext</sub>(<b>r</b>) exists such that <i>E</i>[<i>n</i>] = <i>F</i><sub>HK</sub>[<i>n</i>] + &int;<i>v</i><sub>ext</sub>(<b>r</b>)<i>n</i>(<b>r</b>)d<sup>3</sup><b>r</b> attains its exact global minimum <i>E</i><sub>0</sub> if and only if <i>n</i>(<b>r</b>) = <i>n</i><sub>0</sub>(<b>r</b>): <i>E</i>[<i>n</i>] &ge; <i>E</i>[<i>n</i><sub>0</sub>] = <i>E</i><sub>0</sub>.")}
        </div>
        <p>To eliminate the original <i>v</i>-representability restriction of Hohenberg and Kohn (1964) and cover degenerate ground states, Mel Levy (1979) and Elliott Lieb (1983) formulated the rigorous <strong>Constrained-Search Functional</strong> minimizing over all antisymmetric <i>N</i>-electron wavefunctions yielding a given density <i>n</i>(${vec('r')}):</p>
        ${eq(String.raw`F_{\mathrm{LL}}[n] = \min_{\psi \to n}\langle \psi | \hat{T}_{\mathrm{e}} + \hat{V}_{\mathrm{ee}} | \psi \rangle, \qquad E_0 = \min_{n}\left\{\, F_{\mathrm{LL}}[n] + \int v_{\mathrm{ext}}(\mathbf{r})\,n(\mathbf{r})\,\mathrm{d}^3\mathbf{r} \,\right\}`, "1.5")}

        <h3>1.3 The Kohn–Sham Ansatz (1965) &amp; Janak's Theorem</h3>
        <p>Although <i>F</i><sub>LL</sub>[<i>n</i>] is formally exact, direct density-only kinetic energy functionals (such as Thomas–Fermi) fail to reproduce atomic shell structure or chemical bonding. Walter Kohn and Lu Jeu Sham solved this by mapping the interacting system onto a <strong>fictitious system of <i>N</i> non-interacting electrons</strong> moving in an effective local potential <i>v</i><sub>eff</sub>(${vec('r')}) whose ground-state density equals the exact interacting density:</p>
        ${eq(String.raw`n(\mathbf{r}) = \sum_{i=1}^{N} f_i\,\left|\phi_i(\mathbf{r})\right|^2`, "1.6",
          "where &phi;<sub><i>i</i></sub>(<b>r</b>) are orthonormal Kohn–Sham orbitals and <i>f<sub>i</sub></i> &isin; [0, 2] (or [0, 1] per spin channel) are occupation numbers.")}
        <p>The Kohn–Sham total energy functional separates four explicitly computable pieces from a single remaining unknown term, the <strong>exchange–correlation functional</strong> <i>E</i><sub>xc</sub>[<i>n</i>]:</p>
        ${eq(String.raw`E_{\mathrm{KS}}[n] = T_{\mathrm{s}}\!\left[\{\phi_i\}\right] + \int v_{\mathrm{ext}}(\mathbf{r})\,n(\mathbf{r})\,\mathrm{d}^3\mathbf{r} + E_{\mathrm{H}}[n] + E_{\mathrm{xc}}[n] + E_{\mathrm{II}}`, "1.7")}
        ${eq(String.raw`T_{\mathrm{s}}\!\left[\{\phi_i\}\right] = -\frac{1}{2}\sum_{i=1}^{N} f_i \int \phi_i^*(\mathbf{r})\,\nabla^2\phi_i(\mathbf{r})\,\mathrm{d}^3\mathbf{r}, \qquad E_{\mathrm{H}}[n] = \frac{1}{2}\iint \frac{n(\mathbf{r})\,n(\mathbf{r}')}{\left|\mathbf{r} - \mathbf{r}'\right|}\,\mathrm{d}^3\mathbf{r}\,\mathrm{d}^3\mathbf{r}'`, "1.8")}
        <p>Imposing stationarity &delta;<i>E</i><sub>KS</sub> / &delta;&phi;<sub><i>i</i></sub>* = 0 with Lagrange multipliers &varepsilon;<sub><i>i</i></sub> enforcing orthonormality &lang;&phi;<sub><i>i</i></sub>|&phi;<sub><i>j</i></sub>&rang; = &delta;<sub><i>ij</i></sub> yields the <strong>Kohn–Sham single-particle equations</strong>:</p>
        ${eq(String.raw`\left[-\frac{\hbar^2}{2m_0}\nabla^2 + v_{\mathrm{eff}}(\mathbf{r})\right]\phi_i(\mathbf{r}) = \varepsilon_i\,\phi_i(\mathbf{r}), \qquad v_{\mathrm{eff}}(\mathbf{r}) = v_{\mathrm{ext}}(\mathbf{r}) + v_{\mathrm{H}}(\mathbf{r}) + \frac{\delta E_{\mathrm{xc}}[n]}{\delta n(\mathbf{r})}`, "1.9")}

        ${tipBox("Physical Meaning of Kohn–Sham Eigenvalues &amp; Janak's Theorem",
          "Strictly speaking, Kohn–Sham eigenvalues &varepsilon;<sub><i>i</i></sub> are Lagrange multipliers of the auxiliary non-interacting system, not exact single-electron removal energies. However, <strong>Janak's Theorem</strong> proves &part;<i>E</i><sub>KS</sub>/&part;<i>f<sub>i</sub></i> = &varepsilon;<sub><i>i</i></sub>, and for the exact functional the highest occupied eigenvalue equals the negative exact ionization potential (&varepsilon;<sub>HOMO</sub> = &minus;<i>I</i>). In practice, KS eigenvalues provide an excellent starting description of band dispersion and orbital ordering, while quantitative band gaps require Hybrid DFT (HSE06) or many-body <i>GW</i> corrections (Lecture 2).")}

        <h3>1.4 The Self-Consistent Field (SCF) Loop, Pulay Mixing &amp; Kerker Damping</h3>
        <p>Because <i>v</i><sub>H</sub>[<i>n</i>] and <i>v</i><sub>xc</sub>[<i>n</i>] depend on the output density <i>n</i><sub>out</sub>(${vec('r')}), Eq. (1.9) must be iterated to self-consistency. Simple linear mixing diverges in metallic slabs because the Hartree potential scales as 4&pi;/<i>q</i><sup>2</sup> at long wavelengths (<i>q</i> &rarr; 0), causing <strong>charge sloshing</strong>. Modern codes (CASTEP, VASP) combine <strong>Pulay DIIS</strong> with <strong>Kerker reciprocal-space preconditioning</strong>:</p>
        ${eq(String.raw`G_{\mathrm{Kerker}}(q) = A\,\frac{q^2}{q^2 + q_0^2}, \qquad n_{\mathrm{in}}^{(k+1)}(\mathbf{q}) = n_{\mathrm{opt}}^{(k)}(\mathbf{q}) + G_{\mathrm{Kerker}}(q)\,R_{\mathrm{opt}}^{(k)}(\mathbf{q})`, "1.10",
          "Kerker preconditioning damps long-wavelength <i>q</i> &rarr; 0 charge sloshing while accelerating short-wavelength convergence (controlled in CASTEP via <code>mix_charge_amp</code> and <code>mix_charge_gmax</code>).")}

        <div class="dft-diagram-wrap">
          <svg viewBox="0 0 860 155" width="100%" height="155" role="img" aria-label="Self-Consistent Field SCF Loop Flowchart">
            <defs>
              <marker id="dftArr1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#b45309"/>
              </marker>
            </defs>
            <rect x="8" y="22" width="128" height="58" rx="8" fill="#fdf3dc" stroke="#b45309" stroke-width="1.6"/>
            <text x="72" y="45" text-anchor="middle" font-size="11.5" font-weight="700" fill="#78350f">1. Initial Guess</text>
            <text x="72" y="62" text-anchor="middle" font-size="10.5" fill="#5c493c">n<tspan dy="3" font-size="8">in</tspan><tspan dy="-3">(r) from atoms</tspan></text>

            <line x1="136" y1="51" x2="168" y2="51" stroke="#b45309" stroke-width="1.8" marker-end="url(#dftArr1)"/>

            <rect x="172" y="22" width="144" height="58" rx="8" fill="#eff6ff" stroke="#1d4ed8" stroke-width="1.6"/>
            <text x="244" y="45" text-anchor="middle" font-size="11.5" font-weight="700" fill="#1e3a8a">2. Build Potential</text>
            <text x="244" y="62" text-anchor="middle" font-size="10.5" fill="#334155">v<tspan dy="3" font-size="8">eff</tspan><tspan dy="-3"> = v</tspan><tspan dy="3" font-size="8">ext</tspan><tspan dy="-3"> + v</tspan><tspan dy="3" font-size="8">H</tspan><tspan dy="-3"> + v</tspan><tspan dy="3" font-size="8">xc</tspan></text>

            <line x1="316" y1="51" x2="348" y2="51" stroke="#b45309" stroke-width="1.8" marker-end="url(#dftArr1)"/>

            <rect x="352" y="22" width="148" height="58" rx="8" fill="#eff6ff" stroke="#1d4ed8" stroke-width="1.6"/>
            <text x="426" y="45" text-anchor="middle" font-size="11.5" font-weight="700" fill="#1e3a8a">3. Solve KS Eqs.</text>
            <text x="426" y="62" text-anchor="middle" font-size="10.5" fill="#334155">H<tspan dy="3" font-size="8">KS</tspan><tspan dy="-3"> &phi;</tspan><tspan dy="3" font-size="8">i</tspan><tspan dy="-3"> = &varepsilon;</tspan><tspan dy="3" font-size="8">i</tspan><tspan dy="-3"> &phi;</tspan><tspan dy="3" font-size="8">i</tspan></text>

            <line x1="500" y1="51" x2="532" y2="51" stroke="#b45309" stroke-width="1.8" marker-end="url(#dftArr1)"/>

            <rect x="536" y="22" width="144" height="58" rx="8" fill="#eff6ff" stroke="#1d4ed8" stroke-width="1.6"/>
            <text x="608" y="45" text-anchor="middle" font-size="11.5" font-weight="700" fill="#1e3a8a">4. New Density</text>
            <text x="608" y="62" text-anchor="middle" font-size="10.5" fill="#334155">n<tspan dy="3" font-size="8">out</tspan><tspan dy="-3">(r) = &Sigma; f</tspan><tspan dy="3" font-size="8">i</tspan><tspan dy="-3"> |&phi;</tspan><tspan dy="3" font-size="8">i</tspan><tspan dy="-3">|&sup2;</tspan></text>

            <line x1="680" y1="51" x2="712" y2="51" stroke="#b45309" stroke-width="1.8" marker-end="url(#dftArr1)"/>

            <rect x="716" y="22" width="136" height="58" rx="8" fill="#ecfdf5" stroke="#047857" stroke-width="1.8"/>
            <text x="784" y="43" text-anchor="middle" font-size="11.5" font-weight="700" fill="#065f46">5. Converged?</text>
            <text x="784" y="59" text-anchor="middle" font-size="10" fill="#047857">|&Delta;E| &lt; tol &rarr; DONE!</text>
            <text x="784" y="72" text-anchor="middle" font-size="9.5" fill="#475569">Compute Forces, Bands</text>

            <path d="M 784 80 L 784 126 L 244 126 L 244 84" fill="none" stroke="#b45309" stroke-width="1.7" stroke-dasharray="5 3" marker-end="url(#dftArr1)"/>
            <rect x="345" y="110" width="340" height="30" rx="6" fill="#fffbeb" stroke="#d97706" stroke-width="1.2"/>
            <text x="515" y="129" text-anchor="middle" font-size="11" font-weight="700" fill="#92400e">NO &rarr; Pulay DIIS + Kerker Mixing: n<tspan dy="3" font-size="8">in</tspan><tspan dy="-3">&apos; = Mix(n</tspan><tspan dy="3" font-size="8">in</tspan><tspan dy="-3">, n</tspan><tspan dy="3" font-size="8">out</tspan><tspan dy="-3">)</tspan></text>
          </svg>
        </div>

        <table class="dft-table">
          <thead><tr><th>Symbol</th><th>Physical Meaning</th><th>Typical DFT / CASTEP Units</th></tr></thead>
          <tbody>
            <tr><td><i>n</i>(<b>r</b>)</td><td>Ground-state valence electron number density</td><td><i>e</i> / &Aring;<sup>3</sup> (or <i>e</i> / Bohr<sup>3</sup>)</td></tr>
            <tr><td>&phi;<sub><i>i</i></sub>(<b>r</b>), &varepsilon;<sub><i>i</i></sub></td><td>Kohn–Sham auxiliary orbitals &amp; eigenvalues</td><td>&Aring;<sup>&minus;3/2</sup>, eV (or Hartree)</td></tr>
            <tr><td><i>E</i><sub>H</sub>[<i>n</i>]</td><td>Classical electron–electron Coulomb (Hartree) repulsion energy</td><td>eV</td></tr>
            <tr><td><i>E</i><sub>xc</sub>[<i>n</i>]</td><td>Exchange–correlation energy (Pauli + correlation + kinetic diff.)</td><td>eV</td></tr>
            <tr><td>&Delta;<i>E</i> / atom</td><td>Total-energy change between consecutive SCF iterations</td><td>eV/atom (target &le; 5&times;10<sup>&minus;7</sup>)</td></tr>
          </tbody>
        </table>

        ${labBox("Inspect Live SCF Convergence &amp; Kohn–Sham Logs", "convergence", "Open Convergence Tab",
          `<ol class="dft-steps">
            <li>In <strong>Data Analysis &rarr; ⚡ Conv.</strong>, select any CASTEP job (for example, <code>J1+4 CASTEP Energy</code> or <code>KCoHCF+K</code>).</li>
            <li>Observe the <strong>Total Energy / Enthalpy vs. Iteration</strong> curve relaxing smoothly toward the variational minimum <i>E</i><sub>0</sub>, and the <strong>log<sub>10</sub>(&Delta;E / atom)</strong> curve crossing the green dashed <code>elec_energy_tol</code> threshold.</li>
            <li>Switch to <strong>📝 Files &rarr; .castep</strong> to inspect the exact SCF loop table (<code>Total Energy</code>, <code>Fermi Energy</code>, <code>Energy gain per atom</code>) and <strong>.param</strong> to tune <code>elec_energy_tol</code>, <code>mix_charge_amp</code>, and <code>max_scf_cycles</code>.</li>
          </ol>`,
          `<button type="button" class="btn btn-outline btn-sm" onclick="openCastepToolFromLecture('files')">&#128221; Open Files &amp; .param</button>`)}
      `,
      references: [
        { authors: "M. Born & R. Oppenheimer", title: "Zur Quantentheorie der Molekeln (On the Quantum Theory of Molecules)", venue: "Ann. Phys. 389, 457–484", year: "1927", doi: "10.1002/andp.19273892002" },
        { authors: "P. Hohenberg & W. Kohn", title: "Inhomogeneous Electron Gas", venue: "Phys. Rev. 136, B864–B871", year: "1964", doi: "10.1103/PhysRev.136.B864" },
        { authors: "W. Kohn & L. J. Sham", title: "Self-Consistent Equations Including Exchange and Correlation Effects", venue: "Phys. Rev. 140, A1133–A1138", year: "1965", doi: "10.1103/PhysRev.140.A1133" },
        { authors: "M. Levy", title: "Universal Variational Functionals of Electron Densities, First-Order Density Matrices, and Natural Spin-Orbitals", venue: "Proc. Natl. Acad. Sci. USA 76, 6062–6065", year: "1979", doi: "10.1073/pnas.76.12.6062" },
        { authors: "M. C. Payne, M. P. Teter, D. C. Allan, T. A. Arias & J. D. Joannopoulos", title: "Iterative Minimization Techniques for Ab Initio Total-Energy Calculations: Molecular Dynamics and Conjugate Gradients", venue: "Rev. Mod. Phys. 64, 1045–1097", year: "1992", doi: "10.1103/RevModPhys.64.1045" },
        { authors: "R. M. Martin", title: "Electronic Structure: Basic Theory and Practical Methods (2nd Edition)", venue: "Cambridge University Press", year: "2020", doi: "10.1017/9781108555586" }
      ]
    },

    // =========================================================================
    // LECTURE 2: EXCHANGE-CORRELATION FUNCTIONALS, DFT-D & DFT+U
    // =========================================================================
    {
      id: "lec2",
      num: 2,
      shortTab: "L2: XC, DFT-D & +U",
      level: "Basic → Interm.",
      levelClass: "basic",
      readTime: "18 min",
      toolPane: "files",
      toolName: "Param Builder & Files",
      title: "Lecture 2: Exchange–Correlation Functionals (Jacob's Ladder), Dispersion (DFT-D) &amp; DFT+U",
      subtitle: "How approximations to <i>E</i><sub>xc</sub>[<i>n</i>] govern fundamental band gaps, derivative discontinuity &Delta;<sub>xc</sub>, lattice constants, van der Waals binding, and strongly correlated 3d/4f magnetism.",
      keywords: "exchange correlation lda gga pbe pbesol meta-gga scan r2scan hybrid hse06 b3lyp jacob ladder self-interaction derivative discontinuity bandgap dispersion vdw grimme dft-d2 dft-d3 ts hubbard dft+u dudarev",
      objectives: [
        "Explain the physical decomposition of <i>E</i><sub>xc</sub>[<i>n</i>] into Fermi exchange, dynamical Coulomb correlation, and self-interaction cancellation.",
        "Navigate Perdew's Jacob's Ladder from LDA and GGA (PBE/PBEsol) to meta-GGA (SCAN/r²SCAN) and Screened Hybrids (HSE06).",
        "Diagnose the fundamental band-gap problem via the derivative discontinuity &Delta;<sub>xc</sub> and self-interaction error.",
        "Select appropriate van der Waals schemes (Grimme G06/D3, Tkatchenko–Scheffler) and Dudarev DFT+<i>U</i> parameters."
      ],
      contentHtml: `
        <h3>2.1 What Lives Inside <i>E</i><sub>xc</sub>[<i>n</i>] &amp; Why Semilocal Band Gaps Are Too Small</h3>
        <p>Kohn–Sham DFT is <em>formally exact</em>—all many-body quantum mechanics beyond classical electrostatics is concentrated into a single universal functional, <i>E</i><sub>xc</sub>[<i>n</i>]:</p>
        ${eq(String.raw`E_{\mathrm{xc}}[n] = \left(T_{\mathrm{e}}[n] - T_{\mathrm{s}}[n]\right) + \left(V_{\mathrm{ee}}[n] - E_{\mathrm{H}}[n]\right)`, "2.1",
          "<i>E</i><sub>xc</sub> accounts for: (1) Pauli Fermi exchange keeping parallel-spin electrons apart, (2) dynamical Coulomb correlation keeping antiparallel electrons apart, (3) exact cancellation of unphysical Hartree self-interaction, and (4) the interacting vs. non-interacting kinetic energy difference.")}
        <p>Even for the <em>exact</em> Kohn–Sham functional, the fundamental experimental band gap <i>E</i><sub>g</sub> = <i>I</i> &minus; <i>A</i> (ionization potential minus electron affinity) exceeds the Kohn–Sham eigenvalue gap <i>E</i><sub>g</sub><sup>KS</sup> = &varepsilon;<sub>CBM</sub> &minus; &varepsilon;<sub>VBM</sub> by the <strong>exchange–correlation derivative discontinuity</strong> &Delta;<sub>xc</sub> as electron number crosses an integer <i>N</i>:</p>
        ${eq(String.raw`E_{\mathrm{g}}^{\mathrm{exact}} = E_{\mathrm{g}}^{\mathrm{KS}} + \Delta_{\mathrm{xc}}, \qquad \Delta_{\mathrm{xc}} = \lim_{\eta \to 0^+}\!\left[\,v_{\mathrm{xc}}^{N+\eta}(\mathbf{r}) - v_{\mathrm{xc}}^{N-\eta}(\mathbf{r})\,\right]`, "2.2",
          "Because continuous semilocal functionals (LDA, PBE) have &Delta;<sub>xc</sub> = 0 and suffer from delocalization (self-interaction) error, they systematically underestimate semiconductor band gaps by 30–50%.")}

        <h3>2.2 Perdew's Jacob's Ladder of Exchange–Correlation Functionals</h3>
        <p>John Perdew organized XC approximations into five ascending rungs moving from the Hartree world toward "chemical accuracy" (1 kcal/mol &approx; 0.043 eV):</p>

        <div class="dft-diagram-wrap">
          <svg viewBox="0 0 860 190" width="100%" height="190" role="img" aria-label="Jacob's Ladder of DFT Functionals">
            <rect x="20" y="145" width="820" height="34" rx="6" fill="#fef3c7" stroke="#d97706" stroke-width="1.4"/>
            <text x="40" y="166" font-size="11.5" font-weight="800" fill="#92400e">Rung 1 — LDA (CA-PZ)</text>
            <text x="260" y="166" font-size="11" fill="#451a03">Depends only on local density n(r) &bull; Fast, overbinds crystals (~1–2% too short)</text>

            <rect x="45" y="106" width="770" height="34" rx="6" fill="#ffedd5" stroke="#ea580c" stroke-width="1.4"/>
            <text x="65" y="127" font-size="11.5" font-weight="800" fill="#9a3412">Rung 2 — GGA (PBE, PBEsol, RPBE)</text>
            <text x="310" y="127" font-size="11" fill="#431407">Uses n(r) and |&nabla;n(r)| &bull; Standard workhorse for geometry, phonons &amp; catalysis</text>

            <rect x="70" y="67" width="720" height="34" rx="6" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.4"/>
            <text x="90" y="88" font-size="11.5" font-weight="800" fill="#075985">Rung 3 — meta-GGA (SCAN, r&sup2;SCAN)</text>
            <text x="335" y="88" font-size="11" fill="#0c4a6e">Adds kinetic energy density &tau;(r) = &frac12;&Sigma;|&nabla;&phi;<tspan dy="3" font-size="8">i</tspan><tspan dy="-3">|&sup2;</tspan> &bull; Better lattice &amp; intermediate vdW</text>

            <rect x="95" y="28" width="670" height="34" rx="6" fill="#ede9fe" stroke="#7c3aed" stroke-width="1.6"/>
            <text x="115" y="49" font-size="11.5" font-weight="800" fill="#5b21b6">Rung 4 — Hybrid (HSE06, PBE0, B3LYP)</text>
            <text x="370" y="49" font-size="11" fill="#4c1d95">Mixes exact Hartree–Fock exchange E<tspan dy="3" font-size="8">x</tspan><tspan dy="-6" font-size="8">HF</tspan><tspan dy="3"> &bull; Accurate semiconductor E</tspan><tspan dy="3" font-size="8">g</tspan> &amp; defects</text>

            <text x="430" y="17" text-anchor="middle" font-size="11" font-weight="800" fill="#047857">&#8593; Higher Accuracy &amp; Computational Cost (Rung 5: RPA / Double Hybrids / GW) &#8593;</text>
          </svg>
        </div>

        <p><strong>1. Local Density Approximation (LDA):</strong> Models every local volume d<sup>3</sup>${vec('r')} as a homogeneous electron gas parameterized from Ceperley–Alder Quantum Monte Carlo data:</p>
        ${eq(String.raw`E_{\mathrm{xc}}^{\mathrm{LDA}}[n] = \int n(\mathbf{r})\,\varepsilon_{\mathrm{xc}}^{\mathrm{unif}}\!\left(n(\mathbf{r})\right)\mathrm{d}^3\mathbf{r}`, "2.3")}
        <p><strong>2. Generalized Gradient Approximation (GGA &mdash; PBE / PBEsol / RPBE):</strong> Modulates uniform exchange via an enhancement factor <i>F</i><sub>xc</sub>(<i>n</i>, <i>s</i>) depending on the dimensionless reduced density gradient <i>s</i> = |&nabla;<i>n</i>| / (2<i>k</i><sub>F</sub><i>n</i>):</p>
        ${eq(String.raw`E_{\mathrm{xc}}^{\mathrm{GGA}}[n] = \int n(\mathbf{r})\,\varepsilon_{\mathrm{x}}^{\mathrm{unif}}(n)\,F_{\mathrm{xc}}(n, s)\,\mathrm{d}^3\mathbf{r}`, "2.4")}
        <p><strong>3. Meta-GGA (SCAN / r<sup>2</sup>SCAN):</strong> Introduces the Kohn–Sham orbital kinetic energy density &tau;(${vec('r')}) = &frac12;&sum;<sub><i>i</i></sub>|&nabla;&phi;<sub><i>i</i></sub>|<sup>2</sup> through the dimensionless iso-orbital indicator &alpha;(${vec('r')}) that automatically recognizes bonding regimes:</p>
        ${eq(String.raw`\alpha(\mathbf{r}) = \frac{\tau(\mathbf{r}) - \tau^{\mathrm{W}}(\mathbf{r})}{\tau^{\mathrm{unif}}(\mathbf{r})}, \qquad \tau^{\mathrm{W}} = \frac{|\nabla n|^2}{8n}, \qquad \tau^{\mathrm{unif}} = \frac{3}{10}(3\pi^2)^{2/3}\,n^{5/3}`, "2.5",
          "&alpha; = 0 flags single-orbital covalent regions, &alpha; &approx; 1 flags metallic uniform regions, and &alpha; &gg; 1 flags weak non-covalent / van der Waals overlap—allowing SCAN to satisfy all 17 known exact semilocal constraints.")}
        <p><strong>4. Screened Range-Separated Hybrid Functional (HSE06):</strong> Splits the Coulomb interaction 1/<i>r</i> = erfc(&omega;<i>r</i>)/<i>r</i> + erf(&omega;<i>r</i>)/<i>r</i> (&omega; = 0.2 &Aring;<sup>&minus;1</sup>) and mixes 25% exact short-range Hartree–Fock exchange, restoring non-zero generalized KS derivative discontinuity and experimental-grade semiconductor band gaps:</p>
        ${eq(String.raw`E_{\mathrm{xc}}^{\mathrm{HSE06}} = \frac{1}{4}E_{\mathrm{x}}^{\mathrm{HF,SR}}(\omega) + \frac{3}{4}E_{\mathrm{x}}^{\mathrm{PBE,SR}}(\omega) + E_{\mathrm{x}}^{\mathrm{PBE,LR}}(\omega) + E_{\mathrm{c}}^{\mathrm{PBE}}`, "2.6")}

        <h3>2.3 Long-Range van der Waals Dispersion Corrections (DFT-D2/D3 &amp; TS)</h3>
        <p>Standard LDA and GGA functionals decay exponentially where electron clouds do not overlap and therefore <strong>completely omit</strong> long-range London dispersion (&minus;<i>C</i><sub>6</sub>/<i>R</i><sup>6</sup>) from correlated quantum dipole fluctuations. Without dispersion corrections, graphite, 2D heterobilayers (MoS<sub>2</sub>/WS<sub>2</sub>), and physisorbed molecules fail to bind at the correct interlayer distance! Pairwise DFT-D adds a damped asymptotic tail:</p>
        ${eq(String.raw`E_{\mathrm{DFT\text{-}D}} = E_{\mathrm{KS\text{-}DFT}} - s_6 \sum_{I < J}\frac{C_6^{IJ}}{R_{IJ}^6}\,f_{\mathrm{damp}}(R_{IJ})`, "2.7",
          "In CASTEP, <code>sedc_scheme: G06</code> activates Grimme DFT-D2 (fixed atomic <i>C</i><sub>6</sub>), <code>TS</code> activates Tkatchenko–Scheffler (environment-dependent Hirshfeld-volume-scaled <i>C</i><sub>6</sub><sup>eff</sup> and polarizabilities), and <code>MBD*</code> captures full many-body collective screening.")}

        <h3>2.4 Strongly Correlated 3<i>d</i>/4<i>f</i> Systems: Dudarev DFT+<i>U</i></h3>
        <p>For transition-metal oxides, Prussian Blue analogues (e.g. <code>KCoHCF</code>), and lanthanides with tightly localized 3<i>d</i> or 4<i>f</i> shells, GGA overly delocalizes electrons and can falsely predict magnetic insulators to be non-magnetic metals. The rotationally invariant <strong>Dudarev DFT+<i>U</i></strong> penalty discourages fractional orbital occupations <i>n<sub>m&sigma;</sub></i> &isin; (0, 1) and restores integer orbital occupancy and Mott/charge-transfer gaps:</p>
        ${eq(String.raw`E_{\mathrm{DFT}+U} = E_{\mathrm{DFT}} + \frac{U_{\mathrm{eff}}}{2}\sum_{I,\sigma}\sum_{m} n_{m\sigma}^I\left(1 - n_{m\sigma}^I\right), \qquad U_{\mathrm{eff}} = U - J`, "2.8",
          "Crucially, total energies computed with different <i>U</i><sub>eff</sub> values cannot be subtracted directly; keep <i>U</i><sub>eff</sub> identical (or justify via linear-response Cococcioni–de Gironcoli theory) when comparing polymorphs or redox phases.")}

        <table class="dft-table">
          <thead><tr><th>Functional / Method</th><th>Strengths</th><th>Known Limitations</th><th>Best Use Case in CASTEP</th></tr></thead>
          <tbody>
            <tr><td><strong>LDA (CA-PZ)</strong></td><td>Very fast, accurate phonon frequencies</td><td>Overbinds lattices (~1–2%), large gap underestimation</td><td>Quick screening, baseline comparisons</td></tr>
            <tr><td><strong>GGA-PBE + DFT-D (G06/TS)</strong></td><td>Balanced cost &amp; geometry, accurate vdW spacings</td><td>Underestimates <i>E</i><sub>g</sub> by ~30–50%</td><td>2D Janus/TMDC relaxation, adsorption, heterostructures</td></tr>
            <tr><td><strong>GGA-PBEsol</strong></td><td>Best semilocal bulk lattice constants &amp; surface energies</td><td>Less accurate molecular atomization energies</td><td>Bulk oxides, perovskites (BaTiO<sub>3</sub>, SrTiO<sub>3</sub>)</td></tr>
            <tr><td><strong>meta-GGA (SCAN / r<sup>2</sup>SCAN)</strong></td><td>Captures intermediate vdW &amp; phase energetics cleanly</td><td>Requires finer FFT grid &amp; higher <i>E</i><sub>cut</sub></td><td>Polymorph stability, batteries, layered oxides</td></tr>
            <tr><td><strong>HSE06 (Hybrid)</strong></td><td>Experimental-grade <i>E</i><sub>g</sub> &amp; optical onset</td><td>20–80&times; slower than PBE</td><td>Final semiconductor band gaps, defect levels, optics</td></tr>
            <tr><td><strong>PBE + <i>U</i></strong></td><td>Negligible extra cost, fixes 3<i>d</i>/4<i>f</i> localization</td><td>Requires justified <i>U</i><sub>eff</sub> (linear-response or lit.)</td><td>Fe, Co, Mn, Ni magnetic materials (e.g. KCoHCF)</td></tr>
          </tbody>
        </table>

        ${labBox("Configure XC Functional &amp; Dispersion Schemes in CASTEP", "files", "Open .param Builder",
          `<ol class="dft-steps">
            <li>Open <strong>Data Analysis &rarr; 📝 Files</strong> and inspect the left-hand <strong>CASTEP Calculation Parameter Builder</strong>.</li>
            <li>Select <strong>XC Functional</strong> (<code>GGA — PBE</code>, <code>PBEsol</code>, <code>LDA</code>, or <code>HSE06</code>) and <strong>DFT-D Dispersion</strong> (<code>Grimme G06</code> or <code>Tkatchenko–Scheffler TS</code>) for 2D layered systems like <code>Janus MoSi₂N₂P₂</code> or <code>WS₂/MoSe₂</code>.</li>
            <li>Click <strong>⚡ Update .param &amp; .cell Text</strong> to auto-generate production-ready CASTEP input keywords (<code>xc_functional</code>, <code>sedc_apply: true</code>, <code>sedc_scheme</code>).</li>
          </ol>`)}
      `,
      references: [
        { authors: "J. P. Perdew & A. Zunger", title: "Self-Interaction Correction to Density-Functional Approximations for Many-Electron Systems", venue: "Phys. Rev. B 23, 5048–5079", year: "1981", doi: "10.1103/PhysRevB.23.5048" },
        { authors: "J. P. Perdew, K. Burke & M. Ernzerhof", title: "Generalized Gradient Approximation Made Simple", venue: "Phys. Rev. Lett. 77, 3865–3868", year: "1996", doi: "10.1103/PhysRevLett.77.3865" },
        { authors: "J. Sun, A. Ruzsinszky & J. P. Perdew", title: "Strongly Constrained and Appropriately Normed Semilocal Density Functional (SCAN)", venue: "Phys. Rev. Lett. 115, 036402", year: "2015", doi: "10.1103/PhysRevLett.115.036402" },
        { authors: "J. Heyd, G. E. Scuseria & M. Ernzerhof", title: "Hybrid Functionals Based on a Screened Coulomb Potential (HSE06)", venue: "J. Chem. Phys. 118, 8207–8215 (Erratum 124, 219906, 2006)", year: "2003", doi: "10.1063/1.1564060" },
        { authors: "S. Grimme", title: "Semiempirical GGA-Type Density Functional Constructed with a Long-Range Dispersion Correction (DFT-D2 / G06)", venue: "J. Comput. Chem. 27, 1787–1799", year: "2006", doi: "10.1002/jcc.20495" },
        { authors: "A. Tkatchenko & M. Scheffler", title: "Accurate Molecular Van Der Waals Interactions from Ground-State Electron Density and Free-Atom Reference Data", venue: "Phys. Rev. Lett. 102, 073005", year: "2009", doi: "10.1103/PhysRevLett.102.073005" },
        { authors: "S. L. Dudarev, G. A. Botton, S. Y. Savrasov, C. J. Humphreys & A. P. Sutton", title: "Electron-Energy-Loss Spectra and the Structural Stability of Nickel Oxide: An LSDA+U Study", venue: "Phys. Rev. B 57, 1505–1509", year: "1998", doi: "10.1103/PhysRevB.57.1505" }
      ]
    },

    // =========================================================================
    // LECTURE 3: PERIODIC CRYSTALS, BLOCH'S THEOREM, PLANE WAVES & PSEUDOPOTENTIALS
    // =========================================================================
    {
      id: "lec3",
      num: 3,
      shortTab: "L3: Bloch & PW/PP",
      level: "Basic → Interm.",
      levelClass: "basic",
      readTime: "18 min",
      toolPane: "builder",
      toolName: "3D View & Slab",
      title: "Lecture 3: Periodic Crystals, Bloch's Theorem, Plane Waves, Pseudopotentials &amp; k-Sampling",
      subtitle: "How periodic boundary conditions reduce an infinite Avogadro-scale crystal to one unit cell, a plane-wave cutoff <i>E</i><sub>cut</sub>, PAW/USPP pseudopotentials, and an irreducible k-point grid.",
      keywords: "crystal lattice bravais reciprocal brillouin zone bloch theorem plane wave cutoff ecut pseudopotential ncpp uspp paw otfg monkhorst pack kpoint smearing methfessel paxton slab vacuum miller index",
      objectives: [
        "Relate real-space Bravais lattice vectors A to reciprocal-space vectors B and the First Brillouin Zone.",
        "Apply Bloch's theorem to expand crystal wavefunctions in a finite plane-wave basis set truncated systematically by <i>E</i><sub>cut</sub>.",
        "Understand Norm-Conserving (NCPP), Ultrasoft (USPP/OTFG), and Projector Augmented Wave (PAW) all-electron reconstruction.",
        "Design converged Monkhorst–Pack k-point meshes, metallic smearing with T &rarr; 0 extrapolation, and 2D slabs with vacuum."
      ],
      contentHtml: `
        <h3>3.1 Real-Space &amp; Reciprocal-Space Lattices</h3>
        <p>An ideal crystal repeats a finite <strong>unit cell</strong> defined by three lattice vectors ${vec('a')}<sub>1</sub>, ${vec('a')}<sub>2</sub>, ${vec('a')}<sub>3</sub> (volume &Omega; = |${vec('a')}<sub>1</sub> &middot; (${vec('a')}<sub>2</sub> &times; ${vec('a')}<sub>3</sub>)|). Every atom's Cartesian position is ${vec('r')} = <i>f</i><sub>1</sub>${vec('a')}<sub>1</sub> + <i>f</i><sub>2</sub>${vec('a')}<sub>2</sub> + <i>f</i><sub>3</sub>${vec('a')}<sub>3</sub> in fractional coordinates (<i>f</i><sub>1</sub>, <i>f</i><sub>2</sub>, <i>f</i><sub>3</sub>) &isin; [0, 1). The dual <strong>reciprocal lattice vectors</strong> ${vec('b')}<sub>1</sub>, ${vec('b')}<sub>2</sub>, ${vec('b')}<sub>3</sub> (units: &Aring;<sup>&minus;1</sup>) satisfy ${vec('b')}<sub><i>i</i></sub> &middot; ${vec('a')}<sub><i>j</i></sub> = 2&pi;&delta;<sub><i>ij</i></sub>:</p>
        ${eq(String.raw`\mathbf{b}_1 = \frac{2\pi}{\Omega}(\mathbf{a}_2 \times \mathbf{a}_3), \qquad \mathbf{b}_2 = \frac{2\pi}{\Omega}(\mathbf{a}_3 \times \mathbf{a}_1), \qquad \mathbf{b}_3 = \frac{2\pi}{\Omega}(\mathbf{a}_1 \times \mathbf{a}_2)`, "3.1")}
        <p>The Wigner–Seitz cell of the reciprocal lattice is the <strong>First Brillouin Zone (BZ)</strong>, enclosing every inequivalent crystal wavevector ${vec('k')}.</p>

        <h3>3.2 Bloch's Theorem &amp; Plane-Wave Basis Expansion</h3>
        ${defBox("Bloch's Theorem (1929)",
          "In any periodic potential <i>v</i><sub>eff</sub>(<b>r</b> + <b>R</b>) = <i>v</i><sub>eff</sub>(<b>r</b>), every Kohn–Sham eigenstate takes the form of a plane wave modulated by a cell-periodic function <i>u</i><sub><i>n</i><b>k</b></sub>(<b>r</b> + <b>R</b>) = <i>u</i><sub><i>n</i><b>k</b></sub>(<b>r</b>), indexed by band number <i>n</i> and wavevector <b>k</b> inside the First Brillouin Zone.")}
        <p>Expanding <i>u</i><sub><i>n</i>${vec('k')}}(${vec('r')}) as a Fourier series over reciprocal lattice vectors ${vec('G')} = <i>m</i><sub>1</sub>${vec('b')}<sub>1</sub> + <i>m</i><sub>2</sub>${vec('b')}<sub>2</sub> + <i>m</i><sub>3</sub>${vec('b')}<sub>3</sub> yields the universal <strong>plane-wave basis set</strong> of CASTEP, VASP, and Quantum ESPRESSO:</p>
        ${eq(String.raw`\psi_{n\mathbf{k}}(\mathbf{r}) = e^{i\mathbf{k}\cdot\mathbf{r}}\,u_{n\mathbf{k}}(\mathbf{r}) = \frac{1}{\sqrt{\Omega}}\sum_{\mathbf{G}} c_{n,\mathbf{k}+\mathbf{G}}\,e^{i(\mathbf{k}+\mathbf{G})\cdot\mathbf{r}}`, "3.2")}
        <p>The infinite Fourier expansion is truncated cleanly by one systematic convergence knob—the <strong>plane-wave kinetic energy cutoff <i>E</i><sub>cut</sub></strong> (eV):</p>
        ${eq(String.raw`\frac{\hbar^2}{2m_0}\left|\mathbf{k} + \mathbf{G}\right|^2 \le E_{\mathrm{cut}}`, "3.3",
          "Increasing <i>E</i><sub>cut</sub> monotonically refines spatial resolution everywhere in space uniformly—guaranteeing zero Pulay basis-derivative forces and zero Basis Set Superposition Error (BSSE).")}

        <h3>3.3 Pseudopotentials (NCPP, USPP) &amp; Projector Augmented Wave (PAW)</h3>
        <p>Close to an atomic nucleus (<i>r</i> &lt; <i>r<sub>c</sub></i>), valence wavefunctions oscillate rapidly to remain orthogonal to tightly bound core shells (1<i>s</i>, 2<i>s</i>, 2<i>p</i>, &hellip;), which would require prohibitive <i>E</i><sub>cut</sub> (&gt;10<sup>5</sup> eV). <strong>Pseudopotentials</strong> freeze the chemically inert core and replace the &minus;<i>Z</i>/<i>r</i> Coulomb singularity and nodal valence states inside cutoff radius <i>r<sub>c</sub></i> with a smooth, nodeless pseudo-wavefunction &psi;<sup>PS</sup>(<i>r</i>) matching the exact all-electron &psi;<sup>AE</sup>(<i>r</i>) identically for <i>r</i> &ge; <i>r<sub>c</sub></i>. Blöchl's <strong>PAW formalism</strong> further reconstructs the exact all-electron wavefunction via a linear transformation:</p>
        ${eq(String.raw`\left|\psi_n^{\mathrm{AE}}\right\rangle = \left|\tilde{\psi}_n\right\rangle + \sum_{i}\left(\left|\phi_i^{\mathrm{AE}}\right\rangle - \left|\tilde{\phi}_i\right\rangle\right)\left\langle \tilde{p}_i \middle| \tilde{\psi}_n \right\rangle`, "3.4",
          "PAW retains full core-region accuracy (essential for NMR, hyperfine fields, and 3<i>d</i>/4<i>f</i> magnetism) while keeping the low plane-wave cutoff of Ultrasoft pseudopotentials.")}

        <div class="dft-diagram-wrap">
          <svg viewBox="0 0 860 175" width="100%" height="175" role="img" aria-label="All-electron vs Pseudopotential schematic">
            <line x1="60" y1="145" x2="400" y2="145" stroke="#334155" stroke-width="1.4"/>
            <line x1="60" y1="20" x2="60" y2="150" stroke="#334155" stroke-width="1.4"/>
            <line x1="190" y1="22" x2="190" y2="145" stroke="#b45309" stroke-width="1.3" stroke-dasharray="4 3"/>
            <text x="190" y="162" text-anchor="middle" font-size="11" font-weight="700" fill="#b45309">r<tspan dy="3" font-size="8">c</tspan><tspan dy="-3"> (cutoff radius)</tspan></text>
            <text x="392" y="162" text-anchor="end" font-size="11" fill="#334155">Distance r</text>
            <text x="230" y="18" text-anchor="middle" font-size="12" font-weight="700" fill="#0f172a">Wavefunction &psi;(r): AE vs. Pseudo</text>
            <path d="M 60 145 Q 80 38 100 138 Q 122 175 142 95 Q 164 38 190 78 C 235 125 305 138 390 143" fill="none" stroke="#dc2626" stroke-width="1.8" stroke-dasharray="5 3"/>
            <path d="M 60 112 C 110 85 150 62 190 78 C 235 125 305 138 390 143" fill="none" stroke="#2563eb" stroke-width="2.4"/>
            <text x="285" y="55" font-size="10.5" font-weight="700" fill="#dc2626">--- All-Electron &psi;<tspan dy="3" font-size="8">AE</tspan><tspan dy="-3"> (oscillatory)</tspan></text>
            <text x="285" y="72" font-size="10.5" font-weight="700" fill="#2563eb">&mdash;&mdash; Pseudo &psi;<tspan dy="3" font-size="8">PS</tspan><tspan dy="-3"> (smooth, exact r &ge; r</tspan><tspan dy="3" font-size="8">c</tspan><tspan dy="-3">)</tspan></text>

            <line x1="470" y1="55" x2="820" y2="55" stroke="#334155" stroke-width="1.4"/>
            <line x1="470" y1="20" x2="470" y2="155" stroke="#334155" stroke-width="1.4"/>
            <line x1="600" y1="22" x2="600" y2="150" stroke="#b45309" stroke-width="1.3" stroke-dasharray="4 3"/>
            <text x="600" y="165" text-anchor="middle" font-size="11" font-weight="700" fill="#b45309">r<tspan dy="3" font-size="8">c</tspan></text>
            <text x="645" y="18" text-anchor="middle" font-size="12" font-weight="700" fill="#0f172a">Ionic Potential V(r): &minus;Z/r vs. V<tspan dy="3" font-size="8">PS</tspan></text>
            <path d="M 480 155 C 488 120 515 92 600 76 C 675 64 745 59 815 57" fill="none" stroke="#dc2626" stroke-width="1.8" stroke-dasharray="5 3"/>
            <path d="M 470 98 C 510 92 555 84 600 76 C 675 64 745 59 815 57" fill="none" stroke="#2563eb" stroke-width="2.4"/>
            <text x="665" y="112" font-size="10.5" font-weight="700" fill="#dc2626">--- Singular &minus;Z/r</text>
            <text x="665" y="129" font-size="10.5" font-weight="700" fill="#2563eb">&mdash;&mdash; Smooth V<tspan dy="3" font-size="8">PS</tspan><tspan dy="-3"> (low E</tspan><tspan dy="3" font-size="8">cut</tspan><tspan dy="-3">)</tspan></text>
          </svg>
        </div>

        <table class="dft-table">
          <thead><tr><th>Pseudopotential Type</th><th>Norm Conservation</th><th>Typical <i>E</i><sub>cut</sub> (eV)</th><th>Characteristics</th></tr></thead>
          <tbody>
            <tr><td><strong>Norm-Conserving (NCPP)</strong></td><td>Strict (&int;<sub>0</sub><sup><i>r<sub>c</sub></i></sup>|&psi;<sup>PS</sup>|<sup>2</sup> = &int;|&psi;<sup>AE</sup>|<sup>2</sup>)</td><td>700 – 1200 eV</td><td>Simple Hamiltonian; needed for some linear-response &amp; GW codes</td></tr>
            <tr><td><strong>Ultrasoft (USPP / CASTEP OTFG)</strong></td><td>Relaxed + augmentation charge</td><td>350 – 600 eV</td><td>Very smooth, fast for 3<i>d</i> transition metals, O, N, F</td></tr>
            <tr><td><strong>PAW (Projector Augmented Wave)</strong></td><td>Exact linear reconstruction &psi;<sup>AE</sup></td><td>400 – 600 eV</td><td>All-electron core accuracy at USPP cost (standard in VASP &amp; CASTEP)</td></tr>
          </tbody>
        </table>

        <h3>3.4 Brillouin-Zone Sampling, Metallic Smearing &amp; 2D Supercell Vacuum</h3>
        <p>Integrals over the First Brillouin Zone are discretized on a uniform <strong>Monkhorst–Pack k-mesh</strong> (<i>N</i><sub>1</sub> &times; <i>N</i><sub>2</sub> &times; <i>N</i><sub>3</sub>) folded by crystal symmetry into the Irreducible Brillouin Zone (IBZ) with weights <i>w</i><sub>${vec('k')}</sub> (&sum;<i>w</i><sub>${vec('k')}</sub> = 1):</p>
        ${eq(String.raw`\frac{1}{\Omega_{\mathrm{BZ}}}\int_{\mathrm{BZ}} g(\mathbf{k})\,\mathrm{d}^3\mathbf{k} \approx \sum_{\mathbf{k}\in\mathrm{IBZ}} w_{\mathbf{k}}\,g(\mathbf{k})`, "3.5",
          "Choose k-spacing &Delta;<i>k</i> &le; 0.03 &Aring;<sup>&minus;1</sup> for semiconductors (<i>N<sub>i</sub></i> &approx; |<b>b</b><sub><i>i</i></sub>| / 2&pi;&Delta;<i>k</i>) and &le; 0.02 &Aring;<sup>&minus;1</sup> for metals, with <i>N</i><sub>3</sub> = 1 along the vacuum axis of a 2D slab (vacuum &ge; 15–20 &Aring;).")}
        <p>In metals, the discontinuous Fermi-surface step function &Theta;(<i>E</i><sub>F</sub> &minus; <i>E</i>) converges slowly with k-points. Broadening occupations with a smearing width &sigma; (Gaussian, Methfessel–Paxton, or Cold Smearing) introduces a fictitious electronic entropy term &minus;<i>TS</i>; always report the <strong>0 K extrapolated energy</strong> (<code>Final energy, E-TS/2</code> in CASTEP / <code>energy(sigma->0)</code> in VASP):</p>
        ${eq(String.raw`F(T) = E(T) - TS, \qquad E(T \to 0) = \frac{1}{2}\big[E(T) + F(T)\big] = E(T) - \frac{1}{2}TS`, "3.6",
          "Keep |<i>TS</i>| &lt; 1 meV/atom so smearing does not distort equilibrium geometries or magnetic moments.")}

        ${labBox("Build Unit Cells, Cut (hkl) Surface Slabs &amp; Inspect Symmetry", "builder", "Open 3D VESTA Builder",
          `<ol class="dft-steps">
            <li>Open <strong>Data Analysis &rarr; 🧱 3D View</strong> and click the <strong>Cell &amp; Slab</strong> dock tab on the left.</li>
            <li>Upload any <code>.cif</code> or <code>.cell</code> file to verify exact VESTA space group, lattice vectors (<i>a</i>, <i>b</i>, <i>c</i>, &alpha;, &beta;, &gamma;), and boundary modes (<code>Complete</code> vs <code>In-Cell</code>).</li>
            <li>Create supercells (e.g., <code>2&times;2&times;1</code>), cleave Miller-index surfaces <code>(001)</code> / <code>(110)</code> / <code>(111)</code>, add a <strong>20 &Aring; vacuum layer</strong>, and export directly to <code>.cell</code>, <code>.cif</code>, <code>.xsd</code>, or VASP <code>POSCAR</code>.</li>
          </ol>`)}
      `,
      references: [
        { authors: "F. Bloch", title: "Über die Quantenmechanik der Elektronen in Kristallgittern (Quantum Mechanics of Electrons in Crystal Lattices)", venue: "Z. Phys. 52, 555–600", year: "1929", doi: "10.1007/BF01339455" },
        { authors: "H. J. Monkhorst & J. D. Pack", title: "Special Points for Brillouin-Zone Integrations", venue: "Phys. Rev. B 13, 5188–5192", year: "1976", doi: "10.1103/PhysRevB.13.5188" },
        { authors: "D. Vanderbilt", title: "Soft Self-Consistent Pseudopotentials in a Generalized Eigenvalue Formalism (USPP)", venue: "Phys. Rev. B 41, 7892–7895", year: "1990", doi: "10.1103/PhysRevB.41.7892" },
        { authors: "P. E. Blöchl", title: "Projector Augmented-Wave Method (PAW)", venue: "Phys. Rev. B 50, 17953–17979", year: "1994", doi: "10.1103/PhysRevB.50.17953" },
        { authors: "M. Methfessel & A. T. Paxton", title: "High-Precision Sampling for Brillouin-Zone Integration in Metals", venue: "Phys. Rev. B 40, 3616–3621", year: "1989", doi: "10.1103/PhysRevB.40.3616" },
        { authors: "S. J. Clark, M. D. Segall, C. J. Pickard, P. J. Hasnip, M. I. J. Probert, K. Refson & M. C. Payne", title: "First Principles Methods Using CASTEP", venue: "Z. Kristallogr. 220, 567–570", year: "2005", doi: "10.1524/zkri.220.5.567.65075" }
      ]
    },

    // =========================================================================
    // LECTURE 4: FORCES, STRESS, GEOMETRY OPTIMIZATION, PHONONS & CATALYSIS
    // =========================================================================
    {
      id: "lec4",
      num: 4,
      shortTab: "L4: Forces & Opt.",
      level: "Intermediate",
      levelClass: "interm",
      readTime: "18 min",
      toolPane: "convergence",
      toolName: "Conv. & Forces",
      title: "Lecture 4: Hellmann–Feynman Forces, Stress Tensor, Geometry Optimization, Phonons &amp; Catalysis",
      subtitle: "How DFT relaxes atomic positions and lattice parameters to mechanical equilibrium, verifies dynamical phonon stability, and predicts electrocatalytic Gibbs free energy pathways.",
      keywords: "hellmann feynman force stress tensor pulay geometry optimization bfgs lbfgs tpsd formation energy cohesive surface energy adsorption gibbs free energy zpe phonon dynamical matrix neb activation barrier che",
      objectives: [
        "Derive atomic forces from the Hellmann–Feynman theorem and understand why plane waves eliminate Pulay force artifacts.",
        "Define the Cauchy stress tensor, finite-basis Pulay stress correction, and BFGS / LBFGS relaxation criteria.",
        "Verify dynamical stability via the harmonic phonon dynamical matrix and reaction barriers via Climbing-Image NEB.",
        "Compute formation, surface, and adsorption Gibbs free energies using the Computational Hydrogen Electrode (CHE)."
      ],
      contentHtml: `
        <h3>4.1 The Hellmann–Feynman Force Theorem</h3>
        <p>Locating the equilibrium crystal structure requires the force ${vec('F')}<sub><i>I</i></sub> = &minus;&part;<i>E</i>/&part;${vec('R')}<sub><i>I</i></sub> acting on every nucleus <i>I</i>. Differentiating <i>E</i> = &lang;&Psi;|${hat('H')}|&Psi;&rang; appears to involve costly wavefunction derivatives &part;&Psi;/&part;${vec('R')}<sub><i>I</i></sub>. Remarkably, for any normalized eigenstate &lang;&Psi;|&Psi;&rang; = 1, those terms cancel identically:</p>
        ${eq(String.raw`\mathbf{F}_I = -\frac{\partial E}{\partial \mathbf{R}_I} = -\left\langle \Psi \left|\frac{\partial \hat{H}}{\partial \mathbf{R}_I}\right| \Psi \right\rangle \allowbreak = -\int n(\mathbf{r})\,\frac{\partial v_{\mathrm{ext}}(\mathbf{r})}{\partial \mathbf{R}_I}\,\mathrm{d}^3\mathbf{r} - \frac{\partial E_{\mathrm{II}}}{\partial \mathbf{R}_I}`, "4.1",
          "Because plane waves <i>e</i><sup><i>i</i>(<b>k</b>+<b>G</b>)&middot;<b>r</b></sup> do not depend on atomic coordinates <b>R</b><sub><i>I</i></sub>, there are zero Pulay basis-derivative forces once SCF is tightly converged.")}

        <h3>4.2 Stress Tensor &amp; Variable-Cell Relaxation</h3>
        <p>When relaxing both atomic coordinates and lattice vectors (<code>fix_all_cell: false</code>), the macroscopic <strong>Cauchy stress tensor</strong> &sigma;<sub>&alpha;&beta;</sub> is the energy derivative with respect to homogeneous strain &varepsilon;<sub>&alpha;&beta;</sub> (1 eV/&Aring;<sup>3</sup> = 160.21766 GPa):</p>
        ${eq(String.raw`\sigma_{\alpha\beta} = \frac{1}{\Omega}\frac{\partial E}{\partial \varepsilon_{\alpha\beta}}, \qquad H = E + P\Omega`, "4.2",
          "Under external hydrostatic pressure <i>P</i>, cell optimization minimizes the <strong>enthalpy</strong> <i>H</i> = <i>E</i> + <i>P</i>&Omega;. CASTEP applies an automatic finite-basis-set correction (<code>finite_basis_corr: 2</code>) to cancel Pulay stress caused by discrete jumps in the plane-wave count as &Omega; changes.")}

        <h3>4.3 Quasi-Newton Optimization (BFGS / LBFGS) &amp; Dynamical Phonon Stability</h3>
        <p>Near a local minimum of the Potential Energy Surface, quasi-Newton optimizers (<strong>BFGS</strong> / memory-efficient <strong>LBFGS</strong>) build an iterative inverse Hessian <b>H</b><sup>&minus;1</sup> from successive force vectors ${vec('g')}<sub><i>k</i></sub> = &minus;${vec('F')}<sub><i>k</i></sub> and advance along ${vec('p')}<sub><i>k</i></sub> = &minus;<b>H</b><sub><i>k</i></sub><sup>&minus;1</sup>${vec('g')}<sub><i>k</i></sub> until all four tolerances hold simultaneously:</p>
        <table class="dft-table">
          <thead><tr><th>Convergence Metric</th><th>CASTEP Keyword</th><th>Standard Accuracy</th><th>High-Precision (Phonons / Transport)</th></tr></thead>
          <tbody>
            <tr><td>Energy change per atom |&Delta;<i>E</i>/<i>N</i>|</td><td><code>geom_energy_tol</code></td><td>1.0&times;10<sup>&minus;5</sup> eV/atom</td><td>1.0&times;10<sup>&minus;6</sup> eV/atom</td></tr>
            <tr><td>Maximum ionic force max |<b>F</b><sub><i>I</i></sub>|</td><td><code>geom_force_tol</code></td><td>0.03 eV/&Aring;</td><td>&le; 0.01 eV/&Aring;</td></tr>
            <tr><td>Maximum ionic displacement max |&Delta;<b>R</b><sub><i>I</i></sub>|</td><td><code>geom_disp_tol</code></td><td>1.0&times;10<sup>&minus;3</sup> &Aring;</td><td>5.0&times;10<sup>&minus;4</sup> &Aring;</td></tr>
            <tr><td>Maximum stress component max |&sigma;<sub>&alpha;&beta;</sub>|</td><td><code>geom_stress_tol</code></td><td>0.05 GPa</td><td>&le; 0.02 GPa</td></tr>
          </tbody>
        </table>
        <p>Zero forces confirm a <em>stationary point</em>, not yet a true minimum. To prove <strong>dynamical stability</strong>, one diagonalizes the mass-weighted <strong>harmonic phonon dynamical matrix</strong> <b>D</b>(${vec('q')}) constructed from second-order force constants &Phi;<sub><i>I</i>&alpha;,<i>J</i>&beta;</sub> = &part;<sup>2</sup><i>E</i> / (&part;<i>u</i><sub><i>I</i>&alpha;</sub>&part;<i>u</i><sub><i>J</i>&beta;</sub>) via DFPT or finite supercell displacements:</p>
        ${eq(String.raw`D_{I\alpha,J\beta}(\mathbf{q}) = \frac{1}{\sqrt{M_I M_J}}\sum_{\mathbf{R}} \Phi_{I\alpha,J\beta}(\mathbf{0},\mathbf{R})\,e^{i\mathbf{q}\cdot\mathbf{R}}, \qquad \mathbf{D}(\mathbf{q})\,\mathbf{e}_\nu = \omega_\nu^2(\mathbf{q})\,\mathbf{e}_\nu`, "4.3",
          "All real frequencies (&omega;<sub>&nu;</sub><sup>2</sup> &ge; 0 throughout the BZ) confirm dynamical stability; imaginary modes (&omega;<sup>2</sup> &lt; 0, plotted negative) signal a spontaneous structural distortion or phase instability.")}

        <h3>4.4 Thermodynamic Stability, NEB Barriers &amp; Computational Hydrogen Electrode</h3>
        <p>Because absolute DFT energies depend on pseudopotential cores, every physical observable is evaluated as an <strong>energy difference</strong> using identical <i>E</i><sub>cut</sub>, functional, and k-density:</p>
        ${eq(String.raw`E_{\mathrm{f}} = \frac{1}{N_{\mathrm{tot}}}\left[E_{\mathrm{tot}}(\mathrm{A}_x\mathrm{B}_y) - x\mu_{\mathrm{A}} - y\mu_{\mathrm{B}}\right], \qquad \gamma_{\mathrm{surf}} = \frac{E_{\mathrm{slab}} - N_{\mathrm{slab}}E_{\mathrm{bulk}}}{2A_{\mathrm{surf}}}`, "4.4",
          "Negative formation energy <i>E</i><sub>f</sub> &lt; 0 indicates thermodynamic stability against elemental phases; &gamma;<sub>surf</sub> (J/m<sup>2</sup> or eV/&Aring;<sup>2</sup>) gives the cleavage cost of a surface of area <i>A</i><sub>surf</sub> (factor 2 accounts for top and bottom slab faces).")}
        ${eq(String.raw`E_{\mathrm{ads}} = E_{\mathrm{slab+ads}} - E_{\mathrm{slab}} - E_{\mathrm{ads(gas)}}, \qquad \Delta G(U) = E_{\mathrm{ads}} + \Delta E_{\mathrm{ZPE}} - T\Delta S - n e U_{\mathrm{RHE}}`, "4.5",
          "<strong>Computational Hydrogen Electrode (CHE):</strong> At pH = 0 and <i>U</i> = 0 V, (H<sup>+</sup> + <i>e</i><sup>&minus;</sup>) is in equilibrium with &frac12;H<sub>2</sub>(g). Zero-point energy &Delta;<i>E</i><sub>ZPE</sub> = &frac12;&sum;&#8463;&omega;<sub><i>i</i></sub> comes from vibrational frequency calculations; kinetic migration/reaction barriers <i>E</i><sub>a</sub> = <i>E</i><sub>TS</sub> &minus; <i>E</i><sub>IS</sub> are located along the minimum energy path using Climbing-Image NEB (CI-NEB).")}

        ${labBox("Track Optimization Forces &amp; Place Adsorbates on Surfaces", "convergence", "Open Convergence & Forces",
          `<ol class="dft-steps">
            <li>Open <strong>Data Analysis &rarr; ⚡ Conv.</strong> to inspect the live LBFGS/SCF energy trajectory and the <strong>Symmetrised Forces (eV/&Aring;)</strong> table for every atom.</li>
            <li>Open <strong>🧱 3D View</strong>, check <strong>Show atomic force vectors</strong> in the Style dock, and switch to the <strong>Adsorb</strong> dock to auto-detect <code>Top</code>, <code>Bridge</code>, and <code>3-/4-Fold Hollow</code> sites and place <code>*H</code>, <code>*OH</code>, <code>*OOH</code>, <code>CO</code>, or single adatoms at exact height <i>d<sub>z</sub></i>.</li>
          </ol>`,
          `<button type="button" class="btn btn-outline btn-sm" onclick="openCastepToolFromLecture('builder')">&#129521; Open 3D Adsorb Builder</button>`)}
      `,
      references: [
        { authors: "R. P. Feynman", title: "Forces in Molecules", venue: "Phys. Rev. 56, 340–343", year: "1939", doi: "10.1103/PhysRev.56.340" },
        { authors: "O. H. Nielsen & R. M. Martin", title: "Quantum-Mechanical Theory of Stress and Force", venue: "Phys. Rev. B 32, 3780–3791", year: "1985", doi: "10.1103/PhysRevB.32.3780" },
        { authors: "B. G. Pfrommer, M. Côté, S. G. Louie & M. L. Cohen", title: "Relaxation of Crystals with the Quasi-Newton Method", venue: "J. Comput. Phys. 131, 233–240", year: "1997", doi: "10.1006/jcph.1996.5612" },
        { authors: "S. Baroni, S. de Gironcoli, A. Dal Corso & P. Giannozzi", title: "Phonons and Related Crystal Properties from Density-Functional Perturbation Theory", venue: "Rev. Mod. Phys. 73, 515–562", year: "2001", doi: "10.1103/RevModPhys.73.515" },
        { authors: "G. Henkelman, B. P. Uberuaga & H. Jónsson", title: "A Climbing Image Nudged Elastic Band Method for Finding Saddle Points and Minimum Energy Paths", venue: "J. Chem. Phys. 113, 9901–9904", year: "2000", doi: "10.1063/1.1329672" },
        { authors: "J. K. Nørskov, J. Rossmeisl, A. Logadottir, L. Lindqvist, J. R. Kitchin, T. Bligaard & H. Jónsson", title: "Origin of the Overpotential for Oxygen Reduction at a Fuel-Cell Cathode (CHE Model)", venue: "J. Phys. Chem. B 108, 17886–17892", year: "2004", doi: "10.1021/jp047349j" }
      ]
    },

    // =========================================================================
    // LECTURE 5: ELECTRONIC BAND STRUCTURE, DOS / PDOS & CHEMICAL BONDING
    // =========================================================================
    {
      id: "lec5",
      num: 5,
      shortTab: "L5: Bands & PDOS",
      level: "Intermediate",
      levelClass: "interm",
      readTime: "16 min",
      toolPane: "electronic",
      toolName: "Band & PDOS",
      title: "Lecture 5: Electronic Band Structure, Density of States (DOS / PDOS) &amp; Orbital Hybridization",
      subtitle: "Reading <i>E<sub>n</sub></i>(<b>k</b>) dispersion relations along standard Brillouin-zone paths, spin polarization <i>P</i>(<i>E</i><sub>F</sub>), and decoding orbital bonding via projected DOS.",
      keywords: "band structure dispersion vbm cbm direct indirect bandgap semiconductor metal half-metal spin polarization dos density of states pdos projected orbital hybridization d-band center brillouin path",
      objectives: [
        "Interpret <i>E<sub>n</sub></i>(<b>k</b>) dispersion curves along standard high-symmetry BZ paths (&Gamma;&ndash;M&ndash;K&ndash;&Gamma;, &Gamma;&ndash;X&ndash;M&ndash;&Gamma;&ndash;R).",
        "Distinguish direct vs. indirect band gaps, metals, Dirac semimetals, semiconductors, insulators, and half-metals via <i>P</i>(<i>E</i><sub>F</sub>).",
        "Define Total DOS <i>g</i>(<i>E</i>) and Atomic/Orbital-Projected DOS (PDOS) from CASTEP <code>.pdos_bin</code> projection weights.",
        "Apply Hammer–Nørskov d-band center theory and PDOS overlap to diagnose covalent vs. ionic bonding."
      ],
      contentHtml: `
        <h3>5.1 Electronic Band Structure <i>E<sub>n</sub></i>(${vec('k')}) &amp; High-Symmetry BZ Paths</h3>
        <p>Solving the Kohn–Sham equation non-self-consistently at the converged density along high-symmetry lines of the First Brillouin Zone yields the <strong>electronic band structure</strong> <i>E<sub>n&sigma;</sub></i>(${vec('k')}) (band index <i>n</i>, spin &sigma; &isin; {&uarr;, &darr;}). Energies are referenced to the Fermi level <i>E</i><sub>F</sub> (metals) or the <strong>Valence Band Maximum (VBM)</strong> (semiconductors, so <i>E</i> &minus; <i>E</i><sub>VBM</sub> = 0 at VBM):</p>
        ${eq(String.raw`E_{\mathrm{g}} = \min_{\mathbf{k}} E_{\mathrm{CBM}}(\mathbf{k}) - \max_{\mathbf{k}} E_{\mathrm{VBM}}(\mathbf{k})`, "5.1",
          "If <b>k</b><sub>CBM</sub> = <b>k</b><sub>VBM</sub> (e.g., K &rarr; K in monolayer MoS<sub>2</sub> or Janus MoSi<sub>2</sub>N<sub>2</sub>P<sub>2</sub>), the gap is <strong>Direct</strong> (strong optical emission/absorption without phonon assistance). If <b>k</b><sub>CBM</sub> &ne; <b>k</b><sub>VBM</sub> (e.g., Si: &Gamma; &rarr; &Delta;), it is <strong>Indirect</strong>.")}

        <div class="dft-diagram-wrap">
          <svg viewBox="0 0 860 175" width="100%" height="175" role="img" aria-label="Direct vs Indirect Band Structure and Synchronized PDOS">
            <rect x="14" y="14" width="250" height="148" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.3"/>
            <text x="139" y="33" text-anchor="middle" font-size="11.5" font-weight="800" fill="#0f172a">Direct Semiconductor (k<tspan dy="2.5" font-size="8">CBM</tspan><tspan dy="-2.5"> = k</tspan><tspan dy="2.5" font-size="8">VBM</tspan><tspan dy="-2.5">)</tspan></text>
            <line x1="34" y1="95" x2="246" y2="95" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4 3"/>
            <text x="42" y="91" font-size="9" fill="#64748b">E<tspan dy="2" font-size="7">VBM</tspan><tspan dy="-2"> = 0</tspan></text>
            <path d="M 45 48 Q 140 84 235 48" fill="none" stroke="#2563eb" stroke-width="2.4"/>
            <path d="M 45 142 Q 140 96 235 142" fill="none" stroke="#dc2626" stroke-width="2.4"/>
            <line x1="140" y1="96" x2="140" y2="68" stroke="#059669" stroke-width="1.8"/>
            <polygon points="140,64 136,72 144,72" fill="#059669"/>
            <text x="148" y="84" font-size="10" font-weight="700" fill="#047857">E<tspan dy="2.5" font-size="7.5">g</tspan><tspan dy="-2.5"> (vertical)</tspan></text>
            <text x="140" y="155" text-anchor="middle" font-size="10" font-weight="700" fill="#334155">K (or &Gamma;)</text>

            <rect x="284" y="14" width="250" height="148" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.3"/>
            <text x="409" y="33" text-anchor="middle" font-size="11.5" font-weight="800" fill="#0f172a">Indirect Semiconductor (k<tspan dy="2.5" font-size="8">CBM</tspan><tspan dy="-2.5"> &ne; k</tspan><tspan dy="2.5" font-size="8">VBM</tspan><tspan dy="-2.5">)</tspan></text>
            <line x1="304" y1="98" x2="516" y2="98" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4 3"/>
            <path d="M 315 52 Q 365 82 415 74 Q 465 55 505 70" fill="none" stroke="#2563eb" stroke-width="2.4"/>
            <path d="M 315 138 Q 360 98 410 120 Q 465 145 505 128" fill="none" stroke="#dc2626" stroke-width="2.4"/>
            <line x1="362" y1="108" x2="458" y2="68" stroke="#d97706" stroke-width="1.8" stroke-dasharray="4 2"/>
            <circle cx="362" cy="108" r="3.5" fill="#dc2626"/>
            <circle cx="460" cy="64" r="3.5" fill="#2563eb"/>
            <text x="415" y="102" font-size="9.5" font-weight="700" fill="#b45309">+ Phonon q</text>
            <text x="362" y="155" text-anchor="middle" font-size="10" font-weight="700" fill="#334155">&Gamma;</text>
            <text x="460" y="155" text-anchor="middle" font-size="10" font-weight="700" fill="#334155">M / X</text>

            <rect x="554" y="14" width="292" height="148" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.3"/>
            <text x="700" y="33" text-anchor="middle" font-size="11.5" font-weight="800" fill="#0f172a">Spin-Mirrored PDOS (+&alpha; / &minus;&beta;)</text>
            <line x1="700" y1="42" x2="700" y2="152" stroke="#334155" stroke-width="1.3"/>
            <line x1="575" y1="95" x2="830" y2="95" stroke="#b45309" stroke-width="1.2" stroke-dasharray="4 3"/>
            <text x="828" y="91" text-anchor="end" font-size="9.5" font-weight="700" fill="#b45309">E<tspan dy="2" font-size="7">F</tspan></text>
            <path d="M 700 48 Q 765 56 720 74 Q 795 92 740 112 Q 775 130 700 148" fill="#dbeafe" fill-opacity="0.7" stroke="#2563eb" stroke-width="2"/>
            <path d="M 700 48 Q 635 58 688 74 L 700 82 L 700 110 L 642 124 Q 635 138 700 148" fill="#fee2e2" fill-opacity="0.7" stroke="#dc2626" stroke-width="2"/>
            <text x="765" y="54" text-anchor="middle" font-size="9.5" font-weight="700" fill="#1d4ed8">Spin &uarr; (Metal)</text>
            <text x="632" y="54" text-anchor="middle" font-size="9.5" font-weight="700" fill="#b91c1c">Spin &darr; (Gapped)</text>
            <text x="635" y="103" text-anchor="middle" font-size="9" font-weight="700" fill="#047857">P(E<tspan dy="2" font-size="7">F</tspan><tspan dy="-2">) = 100%</tspan></text>
          </svg>
        </div>

        <table class="dft-table">
          <thead><tr><th>Electronic Phase</th><th>Fermi Level Signature</th><th>Physical / Device Consequence</th></tr></thead>
          <tbody>
            <tr><td><strong>Metal</strong></td><td>Bands cross <i>E</i><sub>F</sub>; <i>g</i>(<i>E</i><sub>F</sub>) &gt; 0</td><td>High free-carrier conductivity; finite Drude &omega;<sub>p</sub></td></tr>
            <tr><td><strong>Semimetal / Dirac</strong></td><td>VBM &amp; CBM touch at discrete points (e.g. Graphene K)</td><td>Linear dispersion <i>E</i> = &plusmn;&#8463;<i>v</i><sub>F</sub><i>k</i>; ultrahigh mobility</td></tr>
            <tr><td><strong>Semiconductor</strong></td><td>0.05 eV &lt; <i>E</i><sub>g</sub> &lt; 3.5 eV</td><td>Tunable conductivity, photovoltaics, FETs, photocatalysis</td></tr>
            <tr><td><strong>Wide-Gap Insulator</strong></td><td><i>E</i><sub>g</sub> &gt; 3.5 eV</td><td>Transparent dielectrics, gate oxides</td></tr>
            <tr><td><strong>Half-Metal (Spin-Split)</strong></td><td>One spin channel metallic, opposite spin gapped (e.g., <code>KCoHCF+K</code>)</td><td>100% spin polarization at <i>E</i><sub>F</sub> &mdash; spintronics &amp; spin filters</td></tr>
          </tbody>
        </table>

        <h3>5.2 Total DOS, Projected DOS (<code>.pdos_bin</code>) &amp; Spin Polarization</h3>
        <p>The <strong>Total Electronic Density of States</strong> <i>g</i>(<i>E</i>) counts electronic states per unit energy per unit cell across the Brillouin Zone. For finite k-meshes, Dirac delta functions are broadened via Gaussian smearing &sigma; (typically 0.05–0.15 eV) or Blöchl's linear tetrahedron method:</p>
        ${eq(String.raw`g_\sigma(E) = \sum_{n,\mathbf{k}} g_{\mathrm{s}}\,w_{\mathbf{k}}\,\frac{1}{\sigma\sqrt{2\pi}}\exp\!\left[-\frac{(E - E_{n\mathbf{k}})^2}{2\sigma^2}\right]`, "5.2",
          "where <i>g</i><sub>s</sub> = 2 for non-spin-polarized calculations and <i>g</i><sub>s</sub> = 1 per spin channel (&alpha; &uarr; positive, &beta; &darr; mirrored negative) in collinear spin-polarized DFT.")}
        <p>To uncover <em>which atoms and angular-momentum shells</em> (<i>s</i>, <i>p</i>, <i>d</i>, <i>f</i>) compose the VBM and CBM, CASTEP projects Bloch states |&psi;<sub><i>n</i>${vec('k')}}&rang; onto localized atomic pseudo-orbitals |&chi;<sub><i>I</i>,<i>lm</i></sub>&rang; and saves the weights in binary <code>*.pdos_bin</code> files. For spin-polarized systems, the <strong>Fermi-level spin polarization</strong> <i>P</i>(<i>E</i><sub>F</sub>) quantifies spintronic half-metallicity:</p>
        ${eq(String.raw`g_{I,lm}(E) = \sum_{n,\mathbf{k}} g_{\mathrm{s}}\,w_{\mathbf{k}}\left|\langle \chi_{I,lm} | \psi_{n\mathbf{k}} \rangle\right|^2 \delta(E - E_{n\mathbf{k}}), \qquad P(E_{\mathrm{F}}) = \frac{g_\uparrow(E_{\mathrm{F}}) - g_\downarrow(E_{\mathrm{F}})}{g_\uparrow(E_{\mathrm{F}}) + g_\downarrow(E_{\mathrm{F}})}`, "5.3")}

        <table class="dft-table">
          <thead><tr><th>Crystal Lattice System</th><th>Standard High-Symmetry Path (Setyawan–Curtarolo)</th><th>Representative Materials</th></tr></thead>
          <tbody>
            <tr><td><strong>Hexagonal / 2D Honeycomb</strong></td><td>&Gamma;(0,0,0) &rarr; M(&frac12;,0,0) &rarr; K(&frac13;,&frac13;,0) &rarr; &Gamma;(0,0,0)</td><td>Graphene, MoS<sub>2</sub>, WS<sub>2</sub>, Janus MoSi<sub>2</sub>N<sub>2</sub>P<sub>2</sub></td></tr>
            <tr><td><strong>Simple Cubic (cP)</strong></td><td>&Gamma;(0,0,0) &rarr; X(0,&frac12;,0) &rarr; M(&frac12;,&frac12;,0) &rarr; &Gamma; &rarr; R(&frac12;,&frac12;,&frac12;)</td><td>Perovskites (SrTiO<sub>3</sub>), Prussian Blue (KCoHCF)</td></tr>
            <tr><td><strong>Face-Centered Cubic (cF)</strong></td><td>&Gamma; &rarr; X(&frac12;,0,&frac12;) &rarr; W(&frac12;,&frac14;,&frac34;) &rarr; K(&frac38;,&frac38;,&frac34;) &rarr; &Gamma; &rarr; L(&frac12;,&frac12;,&frac12;)</td><td>Si, GaAs, Cu, Au, MgO, rock-salt oxides</td></tr>
            <tr><td><strong>Tetragonal (tP)</strong></td><td>&Gamma; &rarr; X(0,&frac12;,0) &rarr; M(&frac12;,&frac12;,0) &rarr; &Gamma; &rarr; Z(0,0,&frac12;) &rarr; R(0,&frac12;,&frac12;) &rarr; A(&frac12;,&frac12;,&frac12;)</td><td>Rutile TiO<sub>2</sub>, BaTiO<sub>3</sub>, layered cuprates</td></tr>
          </tbody>
        </table>

        ${tipBox("Reading Orbital Hybridization &amp; the Hammer–Nørskov d-Band Center",
          "Coincident PDOS peaks from two species at the <em>exact same energy</em> (for instance, Mo-4<i>d</i> and N-2<i>p</i> in MoSi<sub>2</sub>N<sub>4</sub>, or Co-3<i>d</i> and C/N-2<i>p</i> in KCoHCF) prove strong <strong>covalent orbital hybridization</strong>. In transition-metal catalysis, the first moment of the projected <i>d</i>-states—the <strong>d-band center</strong> &varepsilon;<sub><i>d</i></sub> = &int;<i>E</i>&thinsp;<i>g<sub>d</sub></i>(<i>E</i>)d<i>E</i> / &int;<i>g<sub>d</sub></i>(<i>E</i>)d<i>E</i>—governs adsorbate binding: shifting &varepsilon;<sub><i>d</i></sub> upward toward <i>E</i><sub>F</sub> pushes antibonding states above <i>E</i><sub>F</sub>, depopulating them and strengthening chemisorption.")}

        ${labBox("Analyze Synchronized Band Structure &amp; Exact <code>.pdos_bin</code> PDOS", "electronic", "Open Band & PDOS Tab",
          `<ol class="dft-steps">
            <li>Open <strong>Data Analysis &rarr; 📈 Band &amp; PDOS</strong> and load a calculation containing <code>*_BandStr.bands</code> and <code>*_DOS.pdos_bin</code> (e.g., <code>KCoHCF+K</code> or <code>J1+4</code>).</li>
            <li>Keep <strong>Zero: VBM / Fermi</strong> enabled so Band Structure and PDOS share the exact aligned zero-energy reference.</li>
            <li>Switch <strong>PDOS</strong> between <code>Element + Orbital</code> (e.g., <code>Co-d</code>, <code>Fe-d</code>, <code>Mo-d</code>, <code>N-p</code>), <code>Orbital (s,p,d,f)</code>, and <code>Spin Mirror (+&alpha;/&minus;&beta;)</code> to inspect spin splitting and band-edge orbital character.</li>
            <li>Right-click either half of the canvas to copy <strong>Band Structure Only</strong> or <strong>PDOS Only</strong> at 400–600 DPI, or click <strong>⚡ Analyze m*, Mobility &amp; Drude &rarr;</strong> to continue into Lecture 6!</li>
          </ol>`)}
      `,
      references: [
        { authors: "W. Setyawan & S. Curtarolo", title: "High-Throughput Electronic Band Structure Calculations: Challenges and Tools", venue: "Comput. Mater. Sci. 49, 299–312", year: "2010", doi: "10.1016/j.commatsci.2010.05.010" },
        { authors: "P. E. Blöchl, O. Jepsen & O. K. Andersen", title: "Improved Tetrahedron Method for Brillouin-Zone Integrations", venue: "Phys. Rev. B 49, 16223–16233", year: "1994", doi: "10.1103/PhysRevB.49.16223" },
        { authors: "B. Hammer & J. K. Nørskov", title: "Why Gold Is the Noblest of All the Metals (d-Band Center Theory)", venue: "Nature 376, 238–240", year: "1995", doi: "10.1038/376238a0" },
        { authors: "R. A. de Groot, F. M. Mueller, P. G. van Engen & K. H. J. Buschow", title: "New Class of Materials: Half-Metallic Ferromagnets", venue: "Phys. Rev. Lett. 50, 2024–2027", year: "1983", doi: "10.1103/PhysRevLett.50.2024" },
        { authors: "N. W. Ashcroft & N. D. Mermin", title: "Solid State Physics (Ch. 8–12: Bloch Bands, Fermi Surfaces & Semiclassical Dynamics)", venue: "Holt, Rinehart & Winston (ISBN 978-0030839931)", year: "1976", doi: "" }
      ]
    },

    // =========================================================================
    // LECTURE 6: CARRIER EFFECTIVE MASS, SEMICONDUCTOR MOBILITY & DRUDE TRANSPORT
    // =========================================================================
    {
      id: "lec6",
      num: 6,
      shortTab: "L6: m*, \u03bc & Drude",
      level: "Interm. → Adv.",
      levelClass: "adv",
      readTime: "22 min",
      toolPane: "transport",
      toolName: "m* & Drude",
      title: "Lecture 6: Carrier Effective Mass (Band &amp; DOS), Semiconductor Mobility &amp; Drude Transport",
      subtitle: "Connecting band curvature, direct DFT DOS, acoustic/polar/impurity scattering, and Boltzmann–Drude effective mass &amp; relaxation time for electrons and holes.",
      keywords: "effective mass parabolic kane non-parabolic dos effective mass conductivity mass mobility bardeen shockley takagi deformation potential frohlich polar optical brooks herring impurity matthiessen drude effective mass relaxation time plasma frequency exciton einstein diffusion",
      objectives: [
        "Extract directional electron and hole effective masses <i>m</i>*<sub>e</sub>, <i>m</i>*<sub>h</sub> using Parabolic and Kane Non-Parabolic band-edge fits.",
        "Compute the DOS effective mass <i>m</i>*<sub>DOS</sub> both from valley degeneracy and directly via cumulative DFT DOS integration.",
        "Calculate 2D Takagi and 3D Bardeen–Shockley mobilities, Fröhlich polar-optical &amp; Brooks–Herring impurity scattering, Einstein diffusivity, and Wannier–Mott excitons.",
        "Derive and evaluate Drude effective mass <i>m</i>*<sub>Drude</sub>(<i>n</i>, <i>T</i>), Drude relaxation time &tau;<sub>e</sub>, &tau;<sub>h</sub>, plasma frequency &#8463;&omega;<sub>p</sub>, and optical conductivity &sigma;(&omega;)."
      ],
      contentHtml: `
        <h3>6.1 Semiclassical Dynamics &amp; Band-Edge Effective Mass Tensor</h3>
        <p>Under an external electric field, a Bloch electron wavepacket centered at wavevector ${vec('k')} propagates at group velocity ${vec('v')}<sub>g</sub> = (1/&#8463;)&nabla;<sub>${vec('k')}</sub><i>E<sub>n</sub></i>(${vec('k')}) and responds to crystal forces with an inertia set by band curvature—the <strong>inverse effective mass tensor</strong>:</p>
        ${eq(String.raw`\frac{1}{m^*_{\alpha\beta}} = \frac{1}{\hbar^2}\frac{\partial^2 E_n(\mathbf{k})}{\partial k_\alpha \partial k_\beta} \allowbreak\;\implies\; \frac{m^*}{m_0} = \frac{7.61996\;\mathrm{eV}\!\cdot\!\text{Å}^2}{\partial^2 E / \partial k^2}`, "6.1",
          "Steeply dispersing bands yield light, high-mobility carriers (small <i>m</i>*); flat localized bands (3<i>d</i>/4<i>f</i> states) yield heavy carriers (large <i>m</i>*). At the VBM, &part;<sup>2</sup><i>E</i>/&part;<i>k</i><sup>2</sup> &lt; 0, giving positive hole mass <i>m</i>*<sub>h</sub> = &minus;&#8463;<sup>2</sup>/(&part;<sup>2</sup><i>E</i>/&part;<i>k</i><sup>2</sup>) &gt; 0.")}
        <p>Away from the immediate band extremum (especially in narrow-gap semiconductors and heavily doped degenerate conductors), band coupling softens dispersion via the <strong>Kane Non-Parabolic Model</strong>:</p>
        ${eq(String.raw`\Delta E\left(1 + \alpha_{\mathrm{K}}\Delta E\right) = \frac{\hbar^2 q^2}{2m_0^*}, \qquad q = \left|\mathbf{k} - \mathbf{k}_0\right|`, "6.2",
          "where <i>m</i>*<sub>0</sub> is the band-edge effective mass and &alpha;<sub>K</sub> (eV<sup>&minus;1</sup>) is the non-parabolicity parameter (pure parabolic limit: &alpha;<sub>K</sub> = 0; two-band <b>k</b>&middot;<b>p</b> estimate: &alpha;<sub>K</sub> &approx; (1 &minus; <i>m</i>*<sub>0</sub>/<i>m</i><sub>0</sub>)<sup>2</sup> / <i>E</i><sub>g</sub>).")}

        <div class="dft-diagram-wrap">
          <svg viewBox="0 0 860 168" width="100%" height="168" role="img" aria-label="Parabolic vs Kane Non-Parabolic Dispersion and Drude Conductivity">
            <rect x="14" y="12" width="404" height="146" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.3"/>
            <text x="216" y="31" text-anchor="middle" font-size="11.5" font-weight="800" fill="#0f172a">Band-Edge Dispersion: Parabolic vs. Kane Non-Parabolic</text>
            <line x1="50" y1="138" x2="390" y2="138" stroke="#334155" stroke-width="1.3"/>
            <line x1="216" y1="42" x2="216" y2="142" stroke="#94a3b8" stroke-width="1.1" stroke-dasharray="4 3"/>
            <text x="216" y="152" text-anchor="middle" font-size="10" font-weight="700" fill="#334155">k<tspan dy="2" font-size="7.5">0</tspan><tspan dy="-2"> (CBM)</tspan></text>
            <text x="44" y="54" text-anchor="end" font-size="10" fill="#334155">&Delta;E</text>
            <path d="M 86 48 Q 216 218 346 48" fill="none" stroke="#2563eb" stroke-width="2.2" stroke-dasharray="5 3"/>
            <path d="M 60 72 Q 216 196 372 72" fill="none" stroke="#dc2626" stroke-width="2.3"/>
            <text x="216" y="54" text-anchor="middle" font-size="9.5" font-weight="700" fill="#2563eb">--- Parabolic (&alpha;<tspan dy="2" font-size="7">K</tspan><tspan dy="-2"> = 0, constant m*)</tspan></text>
            <text x="216" y="70" text-anchor="middle" font-size="9.5" font-weight="700" fill="#dc2626">&mdash;&mdash; Kane (&alpha;<tspan dy="2" font-size="7">K</tspan><tspan dy="-2"> &gt; 0, m* grows with E)</tspan></text>

            <rect x="442" y="12" width="404" height="146" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.3"/>
            <text x="644" y="31" text-anchor="middle" font-size="11.5" font-weight="800" fill="#0f172a">Drude Optical Conductivity &sigma;<tspan dy="2.5" font-size="8">1</tspan><tspan dy="-2.5">(&omega;) &amp; Damping &gamma;</tspan><tspan dy="2.5" font-size="8">D</tspan><tspan dy="-2.5"> = &hbar;/&tau;</tspan></text>
            <line x1="478" y1="138" x2="824" y2="138" stroke="#334155" stroke-width="1.3"/>
            <line x1="478" y1="44" x2="478" y2="138" stroke="#334155" stroke-width="1.3"/>
            <text x="820" y="152" text-anchor="end" font-size="10" fill="#334155">Photon Energy &hbar;&omega; (eV)</text>
            <text x="472" y="54" text-anchor="end" font-size="10" fill="#334155">&sigma;<tspan dy="2" font-size="7.5">1</tspan></text>
            <path d="M 478 52 C 500 54 516 118 565 130 C 630 135 730 137 820 137" fill="none" stroke="#059669" stroke-width="2.4"/>
            <path d="M 478 86 C 535 88 585 112 655 126 C 720 134 780 136 820 137" fill="none" stroke="#d97706" stroke-width="2.2" stroke-dasharray="5 3"/>
            <line x1="478" y1="95" x2="522" y2="95" stroke="#059669" stroke-width="1.3" stroke-dasharray="3 2"/>
            <text x="530" y="70" font-size="9.5" font-weight="700" fill="#047857">Long &tau; (high &mu;): sharp peak, small &gamma;<tspan dy="2" font-size="7">D</tspan></text>
            <text x="610" y="106" font-size="9.5" font-weight="700" fill="#b45309">Short &tau; (strong scattering): broad tail</text>
          </svg>
        </div>

        <h3>6.2 Conductivity Mass vs. Direct DFT DOS Effective Mass (2D &amp; 3D)</h3>
        <p>For anisotropic or multi-valley semiconductors with directional masses <i>m</i>*<sub>1</sub>, &hellip;, <i>m</i>*<sub><i>M</i></sub> and valley degeneracy <i>g<sub>v</sub></i> (e.g., <i>g<sub>v</sub></i> = 2 at hexagonal K/K&prime;, <i>g<sub>v</sub></i> = 6 in Si), electrical transport obeys the harmonic <strong>conductivity effective mass</strong> <i>m</i>*<sub>c</sub> = ((1/<i>M</i>)&sum;1/<i>m</i>*<sub><i>i</i></sub>)<sup>&minus;1</sup>, whereas thermodynamic carrier density obeys the <strong>DOS effective mass</strong> <i>m</i>*<sub>DOS</sub>. Crucially, <i>m</i>*<sub>DOS</sub> can be extracted <em>directly</em> from the cumulative DFT state count <i>N</i><sub>cell</sub>(&Delta;<i>E</i>) without assuming single-valley parabolicity:</p>
        ${eq(String.raw`\textbf{2D Slab:}\;\frac{m^*_{\mathrm{DOS}}}{m_0} = \frac{2\pi(\hbar^2/m_0)}{g_{\mathrm{s}}\,S_{\mathrm{cell}}}\frac{N_{\mathrm{cell}}(\Delta E)}{\Delta E}, \qquad \textbf{3D Bulk:}\;\frac{m^*_{\mathrm{DOS}}}{m_0} = \frac{\hbar^2}{2m_0\Delta E}\left(\frac{6\pi^2\,N_{\mathrm{cell}}(\Delta E)}{g_{\mathrm{s}}\,\Omega}\right)^{2/3}`, "6.3")}
        <p>From <i>m</i>*<sub>DOS,e</sub>, <i>m</i>*<sub>DOS,h</sub>, band gap <i>E</i><sub>g</sub>, and dielectric constant &varepsilon;<sub>r</sub>, we obtain the effective densities of states <i>N</i><sub>c</sub>(<i>T</i>), <i>N</i><sub>v</sub>(<i>T</i>), intrinsic carrier density <i>n<sub>i</sub></i>(<i>T</i>), and <strong>Wannier–Mott exciton binding energy</strong> <i>E</i><sub>b</sub> &amp; Bohr radius <i>a</i><sub>B</sub>*:</p>
        ${eq(String.raw`n_i(T) = \sqrt{N_{\mathrm{c}} N_{\mathrm{v}}}\,\exp\!\left(-\frac{E_{\mathrm{g}}}{2k_{\mathrm{B}}T}\right), \qquad \mu^*_{\mathrm{ex}} = \frac{m^*_{\mathrm{e}}\,m^*_{\mathrm{h}}}{m^*_{\mathrm{e}} + m^*_{\mathrm{h}}}, \qquad E_{\mathrm{b}}^{\mathrm{3D}} = 13.606\,\frac{\mu^*_{\mathrm{ex}}}{\varepsilon_{\mathrm{r}}^2}\;\mathrm{eV}, \qquad a_{\mathrm{B}}^* = a_0\,\frac{\varepsilon_{\mathrm{r}}}{\mu^*_{\mathrm{ex}}}`, "6.4")}

        <h3>6.3 Carrier Mobility (&mu;<sub>e</sub>, &mu;<sub>h</sub>), Multi-Channel Scattering &amp; Diffusion</h3>
        <p>In the relaxation-time approximation of the Boltzmann Transport Equation, scattering rates from acoustic phonons (ADP), polar optical phonons (POP), and ionized impurities (IMP) add via <strong>Matthiessen's Rule</strong>, and mobility connects directly to carrier diffusivity via the <strong>Einstein relation</strong>:</p>
        ${eq(String.raw`\frac{1}{\tau_{\mathrm{tot}}} = \frac{1}{\tau_{\mathrm{ADP}}} + \frac{1}{\tau_{\mathrm{POP}}} + \frac{1}{\tau_{\mathrm{IMP}}}, \qquad \mu_{\mathrm{tot}} = \frac{e\,\tau_{\mathrm{tot}}}{m^*_{\mathrm{Drude}}}, \qquad D_c = \frac{\mu_{\mathrm{tot}}\,k_{\mathrm{B}}T}{e}`, "6.5")}
        <p><strong>1. Acoustic Deformation Potential (Takagi 2D &amp; Bardeen–Shockley 3D):</strong> Longitudinal acoustic strain &varepsilon; shifts band edges by &Delta;<i>E</i><sub>edge</sub> = <i>E</i><sub>1</sub>&varepsilon;. Using in-plane stiffness <i>C</i><sub>2D</sub> = (1/<i>S</i><sub>0</sub>)(&part;<sup>2</sup><i>E</i>/&part;&varepsilon;<sup>2</sup>) (N/m) or bulk elastic constant <i>C</i><sub>3D</sub> = (1/&Omega;<sub>0</sub>)(&part;<sup>2</sup><i>E</i>/&part;&varepsilon;<sup>2</sup>) (GPa):</p>
        ${eq(String.raw`\mu_{\mathrm{ADP,2D}} = \frac{e\hbar^3 C_{\mathrm{2D}}}{k_{\mathrm{B}}T\,m^*_\alpha\,m^*_{\mathrm{d}}\,E_1^2}, \qquad \mu_{\mathrm{ADP,3D}} = \frac{2\sqrt{2\pi}\,e\hbar^4 C_{\mathrm{3D}}}{3\,(k_{\mathrm{B}}T)^{3/2}\,m^*_\alpha\,(m^*_{\mathrm{d}})^{3/2}\,E_1^2}`, "6.6")}
        <p><strong>2. Fr&ouml;hlich Polar Optical Phonon (POP) &amp; 3. Brooks–Herring Ionized Impurity (IMP):</strong> In polar crystals (&varepsilon;<sub>0</sub> &gt; &varepsilon;<sub>&infin;</sub>), LO phonons of energy &#8463;&omega;<sub>LO</sub> couple to carriers through the dimensionless Fr&ouml;hlich constant &alpha;<sub>F</sub>, while screened ionized impurities of density <i>N<sub>i</sub></i> dominate low-temperature transport (&gamma;<sub>BH</sub> = 24<i>m</i>*<i>k</i><sub>B</sub><i>T</i>/&hbar;<sup>2</sup>&beta;<sub>s</sub><sup>2</sup>):</p>
        ${eq(String.raw`\alpha_{\mathrm{F}} = \frac{e^2}{4\pi\varepsilon_0\hbar}\!\left(\frac{1}{\varepsilon_\infty} - \frac{1}{\varepsilon_0}\right)\!\sqrt{\frac{m^*}{2\hbar\omega_{\mathrm{LO}}}}, \qquad \tau_{\mathrm{POP}} \approx \frac{e^{\hbar\omega_{\mathrm{LO}}/k_{\mathrm{B}}T} - 1}{2\alpha_{\mathrm{F}}\omega_{\mathrm{LO}}}, \qquad \mu_{\mathrm{IMP}} \propto \frac{\varepsilon_0^2\,(k_{\mathrm{B}}T)^{3/2}}{N_i\sqrt{m^*}\left[\ln(1+\gamma_{\mathrm{BH}}) - \frac{\gamma_{\mathrm{BH}}}{1+\gamma_{\mathrm{BH}}}\right]}`, "6.7")}

        <h3>6.4 Drude Effective Mass (<i>m</i>*<sub>Drude</sub>) &amp; Drude Relaxation Time (&tau;<sub>e</sub>, &tau;<sub>h</sub>)</h3>
        <p>When a semiconductor is doped to electron density <i>n</i> or hole density <i>p</i> (or in a metal at <i>E</i><sub>F</sub>), free carriers oscillate collectively at the <strong>Drude plasma frequency</strong> &omega;<sub>p</sub> and generate an intraband optical conductivity &sigma;<sub>Drude</sub>(&omega;) and dielectric tail &varepsilon;<sup>Drude</sup>(&omega;):</p>
        ${eq(String.raw`\omega_{\mathrm{p},c}^2(\mu_c, T) = \frac{e^2}{\varepsilon_0\Omega}\sum_{n,\mathbf{k}} g_{\mathrm{s}}\,w_{\mathbf{k}}\,v_{n\mathbf{k}}^2\!\left(-\frac{\partial f_0}{\partial E}\right), \qquad m^*_{\mathrm{Drude},c}(n_c, T) = \frac{n_c\,e^2}{\varepsilon_0\,\omega_{\mathrm{p},c}^2}`, "6.8",
          "For non-parabolic Kane bands at degenerate Fermi energy <i>E</i><sub>F</sub>, <i>m</i>*<sub>Drude</sub>(<i>E</i><sub>F</sub>) = <i>m</i>*<sub>0</sub>(1 + 2&alpha;<sub>K</sub><i>E</i><sub>F</sub>)—the Drude mass increases monotonically with doping.")}
        ${eq(String.raw`\tau_c = \frac{\hbar}{\gamma_{\mathrm{D},c}} = \frac{\sigma_{0,c}\,m^*_{\mathrm{Drude},c}}{n_c\,e^2}, \qquad \varepsilon^{\mathrm{Drude}}(\omega) = \varepsilon_\infty - \frac{\omega_{\mathrm{p}}^2}{\omega(\omega + i\gamma_{\mathrm{D}})}, \qquad \sigma_{\mathrm{Drude}}(\omega) = \frac{n e^2 \tau / m^*_{\mathrm{Drude}}}{1 - i\omega\tau}`, "6.9",
          "Drude relaxation time &tau; (fs) maps directly onto the optical damping rate &gamma;<sub>D</sub> (eV) via &tau;[fs] = 0.65821 / &gamma;<sub>D</sub>[eV] and controls the carrier mean free path &ell; = <i>v</i><sub>rms</sub>&tau;.")}

        ${labBox("Compute Band/DOS Effective Mass, Mobility &amp; Drude &tau; on Real CASTEP Jobs", "transport", "Open m* & Drude Tab",
          `<ol class="dft-steps">
            <li>Open <strong>Data Analysis &rarr; 🚀 m* &amp; Drude</strong> with a semiconductor job (e.g., 2D Janus <code>J1+4</code>, <i>E</i><sub>g</sub> = 0.987 eV at K).</li>
            <li>Inspect the <strong>Conduction Band Edge (CBM)</strong> and <strong>Valence Band Edge (VBM)</strong> parabolic/Kane fits along <code>K &rarr; &Gamma;</code> and <code>K &rarr; M</code> (<i>m</i>*<sub>e</sub> = 0.648 <i>m</i><sub>0</sub>, <i>m</i>*<sub>h</sub> = 0.904 <i>m</i><sub>0</sub>, <i>R</i><sup>2</sup> = 0.985–0.998).</li>
            <li>Compare <strong>DOS Mass (Band)</strong> vs. <strong>DOS Mass (DFT DOS)</strong>, toggle <strong>POP</strong> &amp; <strong>IMP</strong> scattering, sweep <strong>Drude m*(n,p) &amp; &#8463;&omega;<sub>p</sub></strong> or <strong>Drude &varepsilon;(&omega;) &amp; &sigma;<sub>1</sub>(&omega;)</strong>, and click <strong>⚡ e<sup>&minus;</sup>/h<sup>+</sup> Drude &rarr; Optical</strong> to inject your computed &#8463;&omega;<sub>p</sub> and &gamma;<sub>D</sub> straight into the Optical tab!</li>
          </ol>`)}
      `,
      references: [
        { authors: "J. Bardeen & W. Shockley", title: "Deformation Potentials and Mobilities in Non-Polar Crystals", venue: "Phys. Rev. 80, 72–80", year: "1950", doi: "10.1103/PhysRev.80.72" },
        { authors: "S. Takagi, A. Toriumi, M. Iwase & H. Tango", title: "On the Universality of Inversion Layer Mobility in Si MOSFET's (2D Acoustic Deformation Potential)", venue: "IEEE Trans. Electron Devices 41, 2357–2362", year: "1994", doi: "10.1109/16.337449" },
        { authors: "E. O. Kane", title: "Band Structure of Indium Antimonide (Non-Parabolic Dispersion Model)", venue: "J. Phys. Chem. Solids 1, 249–261", year: "1957", doi: "10.1016/0022-3697(57)90013-6" },
        { authors: "H. Fröhlich", title: "Electrons in Lattice Fields (Polar Optical Phonon Coupling)", venue: "Adv. Phys. 3, 325–361", year: "1954", doi: "10.1080/00018735400101213" },
        { authors: "H. Brooks", title: "Theory of the Electrical Properties of Germanium and Silicon (Brooks–Herring Impurity Scattering)", venue: "Adv. Electron. Electron Phys. 7, 85–182", year: "1955", doi: "10.1016/S0065-2539(08)60957-9" },
        { authors: "G. K. H. Madsen & D. J. Singh", title: "BoltzTraP: A Code for Calculating Band-Structure Dependent Quantities", venue: "Comput. Phys. Commun. 175, 67–71", year: "2006", doi: "10.1016/j.cpc.2006.03.007" }
      ]
    },

    // =========================================================================
    // LECTURE 7: LINEAR-RESPONSE OPTICAL PROPERTIES & KRAMERS-KRONIG RELATIONS
    // =========================================================================
    {
      id: "lec7",
      num: 7,
      shortTab: "L7: Optical & KK",
      level: "Advanced",
      levelClass: "adv",
      readTime: "18 min",
      toolPane: "optics",
      toolName: "Optical Tab",
      title: "Lecture 7: Linear-Response Optical Properties, Dielectric Tensor &amp; Kramers–Kronig Relations",
      subtitle: "From dipole momentum matrix elements in CASTEP <code>*.ome_bin</code> to complex dielectric tensor &varepsilon;(&omega;), f-sum rule, polarization anisotropy, absorption &alpha;(&omega;), EELS, and Tauc gaps.",
      keywords: "optical properties dielectric function epsilon1 epsilon2 kramers kronig f-sum rule ome_bin momentum matrix dipole polarized unpolarized polycrystalline scissors levine allan absorption refractive index reflectivity eels loss function tauc plot gw bse exciton",
      objectives: [
        "Derive the interband imaginary dielectric tensor &varepsilon;<sub>2</sub>(&omega;) from Fermi's Golden Rule and CASTEP <code>*.ome_bin</code> momentum matrix elements.",
        "Apply the Kramers–Kronig causal relation, optical f-sum rule, Levine–Allan scissors shift, and intraband Drude term.",
        "Distinguish Polarized, Unpolarized (normal to incidence q), and Polycrystalline (isotropic trace) tensor projections.",
        "Convert &varepsilon;<sub>1</sub>(&omega;), &varepsilon;<sub>2</sub>(&omega;) into refractive index n/k, absorption &alpha;(&omega;), reflectivity R(&omega;), EELS L(&omega;), optical conductivity &sigma;<sub>1</sub>(&omega;), and Tauc optical gap."
      ],
      contentHtml: `
        <h3>7.1 Complex Dielectric Tensor &amp; Interband Transitions (<code>*.ome_bin</code>)</h3>
        <p>When light of photon energy &#8463;&omega; illuminates a crystal, vertical interband transitions promote electrons from occupied valence bands <i>v</i> to unoccupied conduction bands <i>c</i> at virtually unchanged wavevector ${vec('k')} (<i>q</i><sub>photon</sub> &approx; 0). Within the independent-particle dipole approximation (IPA / Fermi's Golden Rule), the imaginary part of the symmetrized 3&times;3 dielectric tensor &varepsilon;<sub>2,&alpha;&beta;</sub>(&omega;) is built directly from the optical momentum matrix elements ${vec('p')}<sub><i>cv</i>${vec('k')}}</sub> = &lang;&psi;<sub><i>c</i>${vec('k')}}</sub>|${hat('p')}|&psi;<sub><i>v</i>${vec('k')}}</sub>&rang; stored in CASTEP binary <code>*.ome_bin</code> files:</p>
        ${eq(String.raw`\varepsilon_{2,\alpha\beta}(\omega) = \frac{4\pi^2 e^2}{\Omega m_0^2 \omega^2}\sum_{v,c,\mathbf{k}} g_{\mathrm{s}}\,w_{\mathbf{k}}\,(f_{v\mathbf{k}} - f_{c\mathbf{k}})\allowbreak\,\langle \psi_{c\mathbf{k}}|\hat{p}_\alpha|\psi_{v\mathbf{k}}\rangle\allowbreak\langle \psi_{v\mathbf{k}}|\hat{p}_\beta|\psi_{c\mathbf{k}}\rangle\allowbreak\,\delta(E_{c\mathbf{k}} - E_{v\mathbf{k}} - \hbar\omega)`, "7.1",
          "A rigid <strong>Levine–Allan scissors shift</strong> &Delta;<sub>sc</sub> corrects semilocal PBE gap underestimation (<i>E<sub>c</sub></i> &minus; <i>E<sub>v</sub></i> &rarr; <i>E<sub>c</sub></i> &minus; <i>E<sub>v</sub></i> + &Delta;<sub>sc</sub>) while renormalizing matrix elements by (<i>E<sub>cv</sub></i> + &Delta;<sub>sc</sub>)/<i>E<sub>cv</sub></i> to preserve the optical f-sum rule.")}

        <div class="dft-diagram-wrap">
          <svg viewBox="0 0 860 118" width="100%" height="118" role="img" aria-label="First-Principles Optical Tensor Calculation Pipeline">
            <defs>
              <marker id="dftArrOpt" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#1d4ed8"/>
              </marker>
            </defs>
            <rect x="8" y="24" width="150" height="68" rx="8" fill="#fdf3dc" stroke="#b45309" stroke-width="1.6"/>
            <text x="83" y="47" text-anchor="middle" font-size="11" font-weight="800" fill="#78350f">1. CASTEP Optics</text>
            <text x="83" y="64" text-anchor="middle" font-size="9.5" font-family="ui-monospace, Consolas, monospace" fill="#5c493c">*.ome_bin + *.bands</text>
            <text x="83" y="80" text-anchor="middle" font-size="9.5" fill="#92400e">Dipole &lang;c|p|v&rang; + E<tspan dy="2" font-size="7.5">nk</tspan></text>

            <line x1="158" y1="58" x2="184" y2="58" stroke="#1d4ed8" stroke-width="1.8" marker-end="url(#dftArrOpt)"/>

            <rect x="188" y="24" width="154" height="68" rx="8" fill="#eff6ff" stroke="#1d4ed8" stroke-width="1.6"/>
            <text x="265" y="47" text-anchor="middle" font-size="11" font-weight="800" fill="#1e3a8a">2. Tensor &varepsilon;<tspan dy="2" font-size="8">2</tspan><tspan dy="-2">(&omega;)</tspan></text>
            <text x="265" y="64" text-anchor="middle" font-size="10" fill="#334155">3&times;3 Interband Sum</text>
            <text x="265" y="80" text-anchor="middle" font-size="9.5" fill="#1d4ed8">+ Smearing &sigma; &amp; Scissors &Delta;</text>

            <line x1="342" y1="58" x2="368" y2="58" stroke="#1d4ed8" stroke-width="1.8" marker-end="url(#dftArrOpt)"/>

            <rect x="372" y="24" width="152" height="68" rx="8" fill="#eff6ff" stroke="#1d4ed8" stroke-width="1.6"/>
            <text x="448" y="47" text-anchor="middle" font-size="11" font-weight="800" fill="#1e3a8a">3. Kramers–Kronig</text>
            <text x="448" y="64" text-anchor="middle" font-size="10" fill="#334155">Causal Transform &rarr; &varepsilon;<tspan dy="2" font-size="8">1</tspan><tspan dy="-2">(&omega;)</tspan></text>
            <text x="448" y="80" text-anchor="middle" font-size="9.5" fill="#1d4ed8">+ Intraband Drude (&omega;<tspan dy="2" font-size="7.5">p</tspan><tspan dy="-2">, &gamma;</tspan><tspan dy="2" font-size="7.5">D</tspan><tspan dy="-2">)</tspan></text>

            <line x1="524" y1="58" x2="550" y2="58" stroke="#1d4ed8" stroke-width="1.8" marker-end="url(#dftArrOpt)"/>

            <rect x="554" y="24" width="136" height="68" rx="8" fill="#f5f3ff" stroke="#7c3aed" stroke-width="1.6"/>
            <text x="622" y="47" text-anchor="middle" font-size="11" font-weight="800" fill="#5b21b6">4. Geometry</text>
            <text x="622" y="64" text-anchor="middle" font-size="10" fill="#4c1d95">Polarized (e)</text>
            <text x="622" y="80" text-anchor="middle" font-size="10" fill="#4c1d95">Unpol. (q) / Poly</text>

            <line x1="690" y1="58" x2="716" y2="58" stroke="#1d4ed8" stroke-width="1.8" marker-end="url(#dftArrOpt)"/>

            <rect x="720" y="24" width="132" height="68" rx="8" fill="#ecfdf5" stroke="#047857" stroke-width="1.8"/>
            <text x="786" y="47" text-anchor="middle" font-size="11" font-weight="800" fill="#065f46">5. Spectra</text>
            <text x="786" y="64" text-anchor="middle" font-size="10" fill="#047857">n, k, &alpha;, R, L, &sigma;<tspan dy="2" font-size="7.5">1</tspan></text>
            <text x="786" y="80" text-anchor="middle" font-size="9.5" fill="#065f46">&amp; Tauc Optical E<tspan dy="2" font-size="7.5">g</tspan></text>
          </svg>
        </div>

        <h3>7.2 Causality, Kramers–Kronig Transform &amp; Optical f-Sum Rule</h3>
        <p>Because electromagnetic polarization cannot precede the incident field (causality), the real dispersive part &varepsilon;<sub>1,&alpha;&beta;</sub>(&omega;) follows uniquely from &varepsilon;<sub>2,&alpha;&beta;</sub>(&omega;) via the Cauchy principal-value <strong>Kramers–Kronig transform</strong>, while total oscillator strength satisfies the <strong>Thomas–Reiche–Kuhn f-sum rule</strong>:</p>
        ${eq(String.raw`\varepsilon_{1,\alpha\beta}(\omega) = \delta_{\alpha\beta} + \frac{2}{\pi}\,\mathcal{P}\!\int_0^\infty \frac{\omega'\,\varepsilon_{2,\alpha\beta}(\omega')}{\omega'^2 - \omega^2}\,\mathrm{d}\omega', \qquad \int_0^\infty \omega\,\varepsilon_2(\omega)\,\mathrm{d}\omega = \frac{\pi}{2}\,\omega_{\mathrm{p,val}}^2`, "7.2",
          "Evaluating at &omega; = 0 yields the electronic static dielectric constant &varepsilon;<sub>1</sub>(0) = &varepsilon;<sub>&infin;</sub> and static refractive index <i>n</i>(0) = &radic;&varepsilon;<sub>1</sub>(0). Sufficient unoccupied bands (<code>optics_nbands</code>) must be included so the f-sum rule converges.")}

        <h3>7.3 Polarization Geometries (Crystal Anisotropy)</h3>
        <p>In anisotropic materials (especially 2D layered crystals where in-plane &varepsilon;<sub><i>xx</i></sub> = &varepsilon;<sub><i>yy</i></sub> differs dramatically from out-of-plane &varepsilon;<sub><i>zz</i></sub>), the scalar response &varepsilon;(&omega;) depends on how light propagates relative to the crystal axes:</p>
        <table class="dft-table">
          <thead><tr><th>Calculation Mode</th><th>Physical Geometry</th><th>Tensor Projection Formula</th></tr></thead>
          <tbody>
            <tr><td><strong>Polarized</strong></td><td>Linearly polarized electric field along unit vector <b>e</b></td><td>&varepsilon;<sub>pol</sub>(&omega;) = <b>e</b><sup>T</sup> &middot; <b>&varepsilon;</b>(&omega;) &middot; <b>e</b></td></tr>
            <tr><td><strong>Unpolarized</strong></td><td>Randomly polarized beam propagating along incidence <b>q</b> (<b>E</b> &perp; <b>q</b>)</td><td>&varepsilon;<sub>unpol</sub>(&omega;) = &frac12;[Tr(<b>&varepsilon;</b>) &minus; <b>q</b><sup>T</sup> &middot; <b>&varepsilon;</b> &middot; <b>q</b>]</td></tr>
            <tr><td><strong>Polycrystalline</strong></td><td>Powder / randomly oriented grains (isotropic average)</td><td>&varepsilon;<sub>poly</sub>(&omega;) = &frac13;(&varepsilon;<sub><i>xx</i></sub> + &varepsilon;<sub><i>yy</i></sub> + &varepsilon;<sub><i>zz</i></sub>)</td></tr>
          </tbody>
        </table>

        <h3>7.4 Derived Optical Functions, Optical Conductivity &amp; Tauc Optical Gap</h3>
        <p>From the complex dielectric function &varepsilon;(&omega;) = &varepsilon;<sub>1</sub>(&omega;) + <i>i</i>&varepsilon;<sub>2</sub>(&omega;) = (<i>n</i> + <i>ik</i>)<sup>2</sup>, every measurable optical spectrum follows analytically:</p>
        ${eq(String.raw`n(\omega) = \frac{1}{\sqrt{2}}\left[\sqrt{\varepsilon_1^2 + \varepsilon_2^2} + \varepsilon_1\right]^{1/2}, \qquad k(\omega) = \frac{1}{\sqrt{2}}\left[\sqrt{\varepsilon_1^2 + \varepsilon_2^2} - \varepsilon_1\right]^{1/2}`, "7.3")}
        ${eq(String.raw`\alpha(\omega) = \frac{2\omega\,k(\omega)}{c}, \qquad R(\omega) = \frac{(n - 1)^2 + k^2}{(n + 1)^2 + k^2}, \qquad L(\omega) = \frac{\varepsilon_2}{\varepsilon_1^2 + \varepsilon_2^2}, \qquad \sigma_1(\omega) = \varepsilon_0\omega\varepsilon_2(\omega)`, "7.4",
          "Peaks in the Electron Energy Loss Function <i>L</i>(&omega;) = Im(&minus;1/&varepsilon;) mark collective bulk plasmon resonances (&#8463;&omega;<sub>p</sub>). Note: Materials Studio CASTEP plots &alpha; = 2<i>k</i>/&lambda; whereas SI optics textbooks use 4&pi;<i>k</i>/&lambda;—both conventions are selectable in our Optical <strong>More...</strong> menu.")}
        ${eq(String.raw`(\alpha\,\hbar\omega)^{1/r} = A\left(\hbar\omega - E_{\mathrm{g}}^{\mathrm{opt}}\right), \qquad r = \frac{1}{2}\;(\text{direct allowed}), \quad r = 2\;(\text{indirect allowed})`, "7.5",
          "<strong>Tauc Relation:</strong> Extrapolating the linear absorption onset of (&alpha;&#8463;&omega;)<sup>2</sup> (direct) or (&alpha;&#8463;&omega;)<sup>1/2</sup> (indirect) to zero gives the optical band gap <i>E</i><sub>g</sub><sup>opt</sup>.")}

        ${tipBox("When Independent-Particle DFT Optics Needs GW + BSE",
          "Standard DFT optical spectra (Eq. 7.1) neglect electron–hole Coulomb attraction (excitons). In 3D bulk covalent semiconductors with large dielectric screening (&varepsilon;<sub>r</sub> &gt; 10), IPA + Scissors matches experiment very well. In atomically thin 2D monolayers (MoS<sub>2</sub>, WS<sub>2</sub>, Janus TMDCs) where reduced screening creates large exciton binding energies (<i>E</i><sub>b</sub> = 0.3–0.8 eV), the <strong>optical gap</strong> satisfies <i>E</i><sub>g</sub><sup>opt</sup> = <i>E</i><sub>g</sub><sup>QP</sup> &minus; <i>E</i><sub>b</sub>, requiring many-body <i>GW</i> + Bethe–Salpeter Equation (BSE) for exact excitonic peak positions.")}

        ${labBox("Explore Full 3&times;3 Optical Tensor, Anisotropy &amp; Tauc Fit", "optics", "Open Optical Tab",
          `<ol class="dft-steps">
            <li>Open <strong>Data Analysis &rarr; 🌈 Optical</strong> and load an <code>Optical CASTEP Energy</code> folder containing <code>*_Optics.ome_bin</code> and <code>*_Optics.bands</code>.</li>
            <li>Switch <strong>Mode</strong> between <code>Polarized</code> (test <code>[100]</code> in-plane vs. <code>[001]</code> out-of-plane), <code>Unpolarized</code>, and <code>Polycrystalline</code>, and adjust Gaussian smearing &sigma; (default 0.50 eV) or <strong>Scissors</strong> shift &Delta;.</li>
            <li>Inspect the <strong>4-Panel Overview</strong> (Dielectric &varepsilon;<sub>1</sub>/&varepsilon;<sub>2</sub>, Absorption &alpha;, Refractive <i>n/k</i>, and Reflectivity <i>R</i> &amp; EELS <i>L</i>) with the rainbow Visible Light band (1.65–3.26 eV), or switch to <strong>Tauc Optical Gap Fit</strong> and <strong>Anisotropy Comparison</strong>. Right-click any individual chart panel to copy it cleanly at 400–600 DPI!</li>
          </ol>`)}
      `,
      references: [
        { authors: "H. Ehrenreich & M. H. Cohen", title: "Self-Consistent Field Approach to the Many-Electron Problem (RPA Dielectric Tensor)", venue: "Phys. Rev. 115, 786–790", year: "1959", doi: "10.1103/PhysRev.115.786" },
        { authors: "M. Gajdoš, K. Hummer, G. Kresse, J. Furthmüller & F. Bechstedt", title: "Linear Optical Properties in the Projector-Augmented Wave Methodology", venue: "Phys. Rev. B 73, 045112", year: "2006", doi: "10.1103/PhysRevB.73.045112" },
        { authors: "Z. H. Levine & D. C. Allan", title: "Linear Optical Response in Silicon and Germanium Including Self-Energy Effects (Scissors Operator)", venue: "Phys. Rev. Lett. 63, 1719–1722", year: "1989", doi: "10.1103/PhysRevLett.63.1719" },
        { authors: "J. Tauc, R. Grigorovici & A. Vancu", title: "Optical Properties and Electronic Structure of Amorphous Germanium (Tauc Plot)", venue: "Phys. Status Solidi (b) 15, 627–637", year: "1966", doi: "10.1002/pssb.19660150224" },
        { authors: "G. Onida, L. Reining & A. Rubio", title: "Electronic Excitations: Density-Functional Versus Many-Body Green's-Function Approaches (GW + BSE)", venue: "Rev. Mod. Phys. 74, 601–659", year: "2002", doi: "10.1103/RevModPhys.74.601" },
        { authors: "M. Fox", title: "Optical Properties of Solids (2nd Edition)", venue: "Oxford University Press (ISBN 978-0199573370)", year: "2010", doi: "" }
      ]
    },

    // =========================================================================
    // LECTURE 8: CHARGE DENSITY DIFFERENCE (Δρ), CHARGE TRANSFER & ELF
    // =========================================================================
    {
      id: "lec8",
      num: 8,
      shortTab: "L8: \u0394\u03c1 & ELF",
      level: "Interm. → Adv.",
      levelClass: "adv",
      readTime: "16 min",
      toolPane: "chdiff",
      toolName: "Charge Diff (\u0394\u03c1)",
      title: "Lecture 8: Charge Density Difference (&Delta;&rho;), Planar Charge Transfer, Work Function &amp; ELF",
      subtitle: "Visualizing real-space bond formation, interfacial electron accumulation/depletion, integrated charge transfer &Delta;Q(z), dipole-corrected work functions, Bader QTAIM, and ELF bonding topology.",
      keywords: "charge density difference chdiff charg_frm deformation density planar average integrated charge transfer deltaQ work function dipole correction elf electron localization function bader qtaim isosurface",
      objectives: [
        "Distinguish deformation density (*.chdiff) from interfacial/adsorption differential density (&rho;<sub>AB</sub> &minus; &rho;<sub>A</sub> &minus; &rho;<sub>B</sub>).",
        "Integrate 3D &Delta;&rho;(x,y,z) into 1D planar-averaged &Delta;&rho;(z) and cumulative electron transfer &Delta;Q(z).",
        "Compute work functions &Phi; and interface dipole shifts &Delta;&Phi; via the Helmholtz equation and Neugebauer–Scheffler dipole correction.",
        "Interpret Electron Localization Function (ELF) topology and compare Mulliken, Hirshfeld, and Bader QTAIM atomic charges."
      ],
      contentHtml: `
        <h3>8.1 Two Physical Definitions of Charge Density Difference (&Delta;&rho;)</h3>
        <p>Total valence electron density &rho;(${vec('r')}) is dominated by nearly spherical core-adjacent shells, masking subtle chemical bonding rearrangements. Subtracting a well-defined reference isolates exact electron redistribution (yellow: accumulation +&Delta;&rho;, cyan: depletion &minus;&Delta;&rho;):</p>
        ${eq(String.raw`\textbf{Deformation Density:}\quad \Delta\rho_{\mathrm{def}}(\mathbf{r}) = \rho_{\mathrm{SCF}}(\mathbf{r}) - \sum_I \rho_I^{\mathrm{free\ atom}}(\mathbf{r})`, "8.1",
          "Shows how neutral isolated atoms deform upon crystal bond formation—positive accumulation lobes along bond midpoints directly expose covalent shared electron pairs.")}
        ${eq(String.raw`\textbf{Interfacial / Adsorption Density:}\quad \Delta\rho_{\mathrm{ads}}(\mathbf{r}) = \rho_{\mathrm{AB}}(\mathbf{r}) - \rho_{\mathrm{A}}(\mathbf{r}) - \rho_{\mathrm{B}}(\mathbf{r})`, "8.2",
          "Must be computed on the <em>exact same FFT grid, supercell dimensions, and fixed atomic coordinates</em> for the combined system (AB) and isolated fragments (A = slab, B = adsorbate or second 2D layer).")}

        <h3>8.2 1D Planar-Averaged &Delta;&rho;(<i>z</i>) &amp; Integrated Charge Transfer &Delta;<i>Q</i>(<i>z</i>)</h3>
        <p>For 2D surfaces, van der Waals heterojunctions (e.g., <code>WS<sub>2</sub>/MoSe<sub>2</sub></code>), and adsorbed catalysts, integrating &Delta;&rho;(<i>x</i>,<i>y</i>,<i>z</i>) across the in-plane unit cell area <i>S<sub>ab</sub></i> collapses 3D clouds into a quantitative 1D charge-transfer curve along surface normal <i>z</i>:</p>
        ${eq(String.raw`\Delta\rho_{\mathrm{1D}}(z) = \iint_{S_{ab}} \Delta\rho(x,y,z)\,\mathrm{d}x\,\mathrm{d}y, \qquad \Delta Q(z) = \int_0^z \Delta\rho_{\mathrm{1D}}(z')\,\mathrm{d}z'`, "8.3",
          "Charge conservation guarantees &Delta;<i>Q</i>(<i>c</i>) = 0 across the full cell. The extremum max |&Delta;<i>Q</i>(<i>z</i>)| at the interfacial zero-crossing plane gives the exact number of electrons transferred from donor to acceptor layer.")}

        <h3>8.3 Work Function (&Phi;), Dipole Correction &amp; Electron Localization Function (ELF)</h3>
        <p>The <strong>work function</strong> &Phi; is the minimum energy to remove an electron from <i>E</i><sub>F</sub> into the flat vacuum electrostatic potential <i>V</i><sub>vac</sub>. Interfacial charge transfer induces a surface dipole &Delta;&mu;<sub><i>z</i></sub> that shifts &Phi; via the Helmholtz equation. In asymmetric slabs (Janus monolayers or single-sided adsorption), a sawtooth <strong>Neugebauer–Scheffler dipole correction</strong> eliminates artificial periodic electric fields across the vacuum:</p>
        ${eq(String.raw`\Phi = V_{\mathrm{vac}} - E_{\mathrm{F}}, \qquad \Delta\Phi = -\frac{e}{\varepsilon_0}\Delta\mu_z = -\frac{e}{\varepsilon_0 S_{ab}}\int z\,\Delta\rho_{\mathrm{1D}}(z)\,\mathrm{d}z`, "8.4")}
        <p>To classify local electron pairing without a promolecule reference, Becke and Edgecombe formulated the dimensionless <strong>Electron Localization Function (ELF)</strong> &isin; [0, 1] comparing the excess Pauli kinetic energy density <i>D</i>(${vec('r')}) to a uniform electron gas <i>D</i><sub>h</sub>(${vec('r')}) = (3/10)(3&pi;<sup>2</sup>)<sup>2/3</sup><i>n</i><sup>5/3</sup>:</p>
        ${eq(String.raw`\mathrm{ELF}(\mathbf{r}) = \frac{1}{1 + \left[D(\mathbf{r}) / D_{\mathrm{h}}(\mathbf{r})\right]^2}, \qquad D(\mathbf{r}) = \frac{1}{2}\sum_i \left|\nabla\phi_i\right|^2 - \frac{1}{8}\frac{|\nabla n|^2}{n}`, "8.5",
          "<strong>ELF = 1.0:</strong> perfect spin-paired localization (covalent bonds, lone pairs); <strong>ELF &approx; 0.5:</strong> homogeneous electron gas (metallic bonding); <strong>ELF &rarr; 0:</strong> low-density closed-shell ionic regions.")}

        <h3>8.4 Comparing Atomic Charge Partitioning Schemes</h3>
        <p>Because "atomic charge" inside a solid is not a unique quantum observable, DFT employs four complementary partitioning schemes—including <strong>Bader's Quantum Theory of Atoms in Molecules (QTAIM)</strong>, which divides space strictly along zero-flux density surfaces &nabla;&rho;(${vec('r')}) &middot; ${vec('n')} = 0:</p>
        <table class="dft-table">
          <thead><tr><th>Method</th><th>Partitioning Principle</th><th>Basis Dependence</th><th>Best Use &amp; Caveats</th></tr></thead>
          <tbody>
            <tr><td><strong>Mulliken (LCAO)</strong></td><td>Projects plane waves onto atomic orbitals; splits overlap equally</td><td>Moderate (sensitive to spilling)</td><td>Gives <strong>Bond Overlap Population</strong> &amp; orbital <i>s/p/d</i> breakdown in CASTEP</td></tr>
            <tr><td><strong>Hirshfeld</strong></td><td>Real-space stockholder weights <i>w<sub>I</sub></i> = &rho;<sub><i>I</i></sub><sup>free</sup> / &sum;&rho;<sub><i>J</i></sub><sup>free</sup></td><td>None (density-only)</td><td>Smooth trends &amp; TS vdW volumes; magnitudes tend to be small (&sim;0.3&times; formal)</td></tr>
            <tr><td><strong>Bader (QTAIM)</strong></td><td>Topological zero-flux basins (&nabla;&rho; &middot; <b>n</b> = 0)</td><td>None (fine FFT grid)</td><td>Quantitative ionic/adsorption charge transfer (requires core + valence density)</td></tr>
            <tr><td><strong>Born Effective Charge <i>Z</i>*</strong></td><td>Dynamic polarization response <i>Z</i>*<sub>&alpha;&beta;</sub> = &Omega;&part;<i>P</i><sub>&alpha;</sub>/&part;<i>u</i><sub>&beta;</sub></td><td>None (DFPT)</td><td>Ferroelectrics (BaTiO<sub>3</sub>), LO–TO phonon splitting, dynamical covalency</td></tr>
          </tbody>
        </table>

        ${labBox("Visualize Synchronized 3D Clouds, 2D Contour Slices &amp; 1D &Delta;Q(z)", "chdiff", "Open Charge Diff (\u0394\u03c1) Tab",
          `<ol class="dft-steps">
            <li>Open <strong>Data Analysis &rarr; 🔋 Charge Diff</strong> to inspect any CASTEP <code>*.chdiff</code> output (or switch <strong>&Delta;&rho; Source</strong> to <code>Differential *.charg_frm (AB &minus; A &minus; B)</code> to upload three separate fragment grids).</li>
            <li>Adjust <strong>Plane</strong> (<code>(010)</code>, <code>(100)</code>, <code>(001)</code>), slide <strong>Pos</strong> through atomic layers, tune <strong>Iso (e/&Aring;<sup>3</sup>)</strong>, and read quantitative <code>Max |&Delta;Q(z)|</code> in the <strong>1D Planar Profile</strong> panel.</li>
            <li>Click <strong>🧱 3D Isosurface</strong> to project volumetric yellow/cyan &Delta;&rho; clouds directly inside the interactive 3D VESTA viewer!</li>
          </ol>`)}
      `,
      references: [
        { authors: "A. D. Becke & K. E. Edgecombe", title: "A Simple Measure of Electron Localization in Atomic and Molecular Systems (ELF)", venue: "J. Chem. Phys. 92, 5397–5403", year: "1990", doi: "10.1063/1.458517" },
        { authors: "B. Silvi & A. Savin", title: "Classification of Chemical Bonds Based on Topological Analysis of Electron Localization Functions", venue: "Nature 371, 683–686", year: "1994", doi: "10.1038/371683a0" },
        { authors: "R. F. W. Bader", title: "A Quantum Theory of Molecular Structure and Its Applications (QTAIM)", venue: "Chem. Rev. 91, 893–928", year: "1991", doi: "10.1021/cr00005a013" },
        { authors: "G. Henkelman, A. Arnaldsson & H. Jónsson", title: "A Fast and Robust Algorithm for Bader Decomposition of Charge Density", venue: "Comput. Mater. Sci. 36, 354–360", year: "2006", doi: "10.1016/j.commatsci.2005.04.010" },
        { authors: "J. Neugebauer & M. Scheffler", title: "Adsorbate-Substrate and Adsorbate-Adsorbate Interactions of Na and K Adlayers on Al(111) (Dipole Correction)", venue: "Phys. Rev. B 46, 16067–16080", year: "1992", doi: "10.1103/PhysRevB.46.16067" }
      ]
    },

    // =========================================================================
    // LECTURE 9: SPIN-POLARIZED DFT, MAGNETISM, MULLIKEN/HIRSHFELD & SPIN MATRIX
    // =========================================================================
    {
      id: "lec9",
      num: 9,
      shortTab: "L9: Spin & Mulliken",
      level: "Advanced",
      levelClass: "adv",
      readTime: "20 min",
      toolPane: "mulliken",
      toolName: "Mulliken & Spin",
      title: "Lecture 9: Spin-Polarized DFT, Magnetism, Exchange Coupling, Mulliken/Hirshfeld &amp; Spin Matrix",
      subtitle: "From collinear LSDA, Stoner ferromagnetism, and Heisenberg exchange <i>J<sub>ij</sub></i> to non-collinear SOC, overlap bond populations, and orbital-resolved 5&times;5 <i>d</i>-orbital spin matrices.",
      keywords: "spin polarized magnetism lsda stoner heisenberg exchange curie temperature non-collinear soc spin orbit coupling mae ferromagnetic fm antiferromagnetic afm ferrimagnetic fim mulliken hirshfeld bond population spin matrix crystal field t2g eg d-orbital",
      objectives: [
        "Formulate collinear spin-polarized DFT (<i>n</i><sub>&uarr;</sub>, <i>n</i><sub>&darr;</sub>), Stoner ferromagnetism, and non-collinear vector magnetization with Spin–Orbit Coupling (SOC).",
        "Differentiate Ferromagnetic (FM), Antiferromagnetic (AFM), and Ferrimagnetic (FiM) states and map DFT energies onto the Heisenberg model <i>J<sub>ij</sub></i> &amp; Curie temperature <i>T</i><sub>C</sub>.",
        "Contrast Mulliken LCAO atomic/bond populations with Hirshfeld stockholder charges.",
        "Interpret the 5&times;5 <i>d</i>-orbital Spin Matrix via crystal-field splitting (<i>t</i><sub>2g</sub> vs. <i>e</i><sub>g</sub>) and Goodenough–Kanamori superexchange."
      ],
      contentHtml: `
        <h3>9.1 Collinear Spin-Polarized DFT, Stoner Criterion &amp; Non-Collinear SOC</h3>
        <p>In open-shell transition metals, defects, and radicals, spin-up (&uarr;, &alpha;) and spin-down (&darr;, &beta;) electrons experience distinct exchange potentials because Pauli exchange acts solely between parallel spins. Spin-polarized DFT splits total density and magnetization density into two coupled channels:</p>
        ${eq(String.raw`n(\mathbf{r}) = n_\uparrow(\mathbf{r}) + n_\downarrow(\mathbf{r}), \qquad m(\mathbf{r}) = n_\uparrow(\mathbf{r}) - n_\downarrow(\mathbf{r}), \qquad M_{\mathrm{net}} = \mu_{\mathrm{B}}\int m(\mathbf{r})\,\mathrm{d}^3\mathbf{r}`, "9.1",
          "Comparing net moment <i>M</i><sub>net</sub> = &sum;&mu;<sub><i>I</i></sub> against absolute moment <i>M</i><sub>abs</sub> = &sum;|&mu;<sub><i>I</i></sub>| identifies the magnetic phase: <strong>FM</strong> (|<i>M</i><sub>net</sub>| &approx; <i>M</i><sub>abs</sub>), <strong>AFM</strong> (<i>M</i><sub>net</sub> &approx; 0, <i>M</i><sub>abs</sub> &gt; 0), or <strong>FiM</strong> (0 &lt; |<i>M</i><sub>net</sub>| &lt; <i>M</i><sub>abs</sub>). In itinerant metals, spontaneous spin splitting occurs when the <strong>Stoner Criterion</strong> <i>I</i><sub>Stoner</sub> &middot; <i>g</i>(<i>E</i><sub>F</sub>) &gt; 1 is met.")}
        <p>Mapping total energies of FM and AFM spin configurations onto the <strong>Heisenberg Spin Hamiltonian</strong> determines inter-site magnetic exchange constants <i>J<sub>ij</sub></i> and the mean-field Curie/N&eacute;el ordering temperature <i>T</i><sub>C</sub>, while relativistic <strong>Spin–Orbit Coupling (SOC)</strong> (&lambda;<sub>SOC</sub>&thinsp;<b>L</b>&middot;<b>S</b>) with 2-component Pauli spinors yields the <strong>Magnetic Anisotropy Energy (MAE)</strong>:</p>
        ${eq(String.raw`\hat{H}_{\mathrm{spin}} = -\sum_{i < j} J_{ij}\,\mathbf{S}_i \cdot \mathbf{S}_j, \qquad T_{\mathrm{C}}^{\mathrm{MF}} = \frac{2 z J\,S(S+1)}{3 k_{\mathrm{B}}}, \qquad \mathrm{MAE} = E_{\parallel} - E_{\perp}`, "9.2",
          "Positive <i>J</i> &gt; 0 favors ferromagnetism; negative <i>J</i> &lt; 0 favors antiferromagnetism (governed in oxides and cyanides like KCoHCF by the Goodenough–Kanamori–Anderson superexchange rules).")}

        <h3>9.2 Mulliken Population, Overlap Bond Population &amp; Hirshfeld Charges</h3>
        <p>Because plane waves span the entire unit cell, CASTEP projects converged Bloch states onto a localized atomic-orbital basis {&chi;<sub>&mu;</sub>} (Segall–Pickard formalism) to compute the density matrix <b>P</b> and overlap matrix <b>S</b>:</p>
        ${eq(String.raw`q_I^{\mathrm{Mulliken}} = Z_I^{\mathrm{val}} - \sum_{\mu \in I}(\mathbf{P}\mathbf{S})_{\mu\mu}, \qquad P_{IJ}^{\mathrm{bond}} = 2\sum_{\mu\in I,\,\nu\in J} P_{\mu\nu}\,S_{\nu\mu}`, "9.3",
          "<strong>Mulliken Bond Population <i>P</i><sub><i>IJ</i></sub>:</strong> large positive values (+0.5 to +1.9, e.g., C&equiv;N or Si–N) indicate strong <strong>covalent</strong> bonding; values near 0 indicate <strong>ionic</strong> character; negative values denote <strong>antibonding</strong> repulsion.")}
        <p><strong>Hirshfeld ("Stockholder") Population Analysis</strong> partitions real-space density directly using promolecule atomic weights, making Hirshfeld charges basis-set-independent:</p>
        ${eq(String.raw`w_I(\mathbf{r}) = \frac{\rho_I^{\mathrm{free}}(\mathbf{r})}{\sum_J \rho_J^{\mathrm{free}}(\mathbf{r})}, \qquad q_I^{\mathrm{Hirsh}} = Z_I^{\mathrm{val}} - \int w_I(\mathbf{r})\,\rho_{\mathrm{SCF}}(\mathbf{r})\,\mathrm{d}^3\mathbf{r}`, "9.4")}

        <h3>9.3 Orbital-Resolved Spin Density Matrix &amp; Crystal-Field Splitting</h3>
        <p>Decomposing atomic spin moments &mu;<sub><i>I</i></sub> = &sum;<sub><i>l</i>,<i>m</i></sub> (<i>n</i><sub><i>I</i>,<i>lm</i></sub><sup>&uarr;</sup> &minus; <i>n</i><sub><i>I</i>,<i>lm</i></sub><sup>&darr;</sup>)&thinsp;&mu;<sub>B</sub> across individual magnetic quantum numbers—<i>p<sub>x</sub></i>, <i>p<sub>y</sub></i>, <i>p<sub>z</sub></i> and the five <i>d</i>-orbitals (<i>d</i><sub><i>z</i><sup>2</sup></sub>, <i>d<sub>zy</sub></i>, <i>d<sub>zx</sub></i>, <i>d</i><sub><i>x</i><sup>2</sup>&minus;<i>y</i><sup>2</sup></sub>, <i>d<sub>xy</sub></i>)—constructs the <strong>Orbital-Resolved Spin Matrix</strong>:</p>
        ${eq(String.raw`S_{m,m'}^{(I,l)} = \delta_{mm'}\left(n_{I,lm}^\uparrow - n_{I,lm}^\downarrow\right)\mu_{\mathrm{B}}, \qquad \mathrm{Tr}\!\left[\mathbf{S}^{(I,l)}\right] = \mu_{I,l}`, "9.5")}

        <div class="dft-diagram-wrap">
          <svg viewBox="0 0 860 155" width="100%" height="155" role="img" aria-label="Octahedral Crystal Field Splitting of d-orbitals into t2g and eg">
            <text x="145" y="20" text-anchor="middle" font-size="11.5" font-weight="700" fill="#0f172a">Free Transition-Metal Ion (5-fold d)</text>
            <line x1="65" y1="84" x2="225" y2="84" stroke="#334155" stroke-width="2.4"/>
            <text x="145" y="102" text-anchor="middle" font-size="10.5" fill="#475569">d<tspan dy="3" font-size="8">z&sup2;</tspan><tspan dy="-3">, d</tspan><tspan dy="3" font-size="8">x&sup2;&minus;y&sup2;</tspan><tspan dy="-3">, d</tspan><tspan dy="3" font-size="8">xy</tspan><tspan dy="-3">, d</tspan><tspan dy="3" font-size="8">zx</tspan><tspan dy="-3">, d</tspan><tspan dy="3" font-size="8">zy</tspan></text>

            <line x1="230" y1="84" x2="310" y2="42" stroke="#94a3b8" stroke-width="1.3" stroke-dasharray="4 3"/>
            <line x1="230" y1="84" x2="310" y2="118" stroke="#94a3b8" stroke-width="1.3" stroke-dasharray="4 3"/>

            <text x="415" y="20" text-anchor="middle" font-size="11.5" font-weight="700" fill="#1e3a8a">Octahedral Ligand Field (O<tspan dy="3" font-size="8.5">h</tspan><tspan dy="-3">)</tspan></text>
            <line x1="330" y1="42" x2="400" y2="42" stroke="#dc2626" stroke-width="2.6"/>
            <line x1="425" y1="42" x2="495" y2="42" stroke="#dc2626" stroke-width="2.6"/>
            <text x="365" y="58" text-anchor="middle" font-size="10.5" font-weight="700" fill="#dc2626">d<tspan dy="3" font-size="8">z&sup2;</tspan></text>
            <text x="460" y="58" text-anchor="middle" font-size="10.5" font-weight="700" fill="#dc2626">d<tspan dy="3" font-size="8">x&sup2;&minus;y&sup2;</tspan></text>
            <text x="520" y="46" font-size="11" font-weight="800" fill="#dc2626">e<tspan dy="3" font-size="8.5">g</tspan><tspan dy="-3"> (+0.6 &Delta;</tspan><tspan dy="3" font-size="8.5">o</tspan><tspan dy="-3">)</tspan></text>

            <line x1="312" y1="118" x2="372" y2="118" stroke="#2563eb" stroke-width="2.6"/>
            <line x1="386" y1="118" x2="446" y2="118" stroke="#2563eb" stroke-width="2.6"/>
            <line x1="460" y1="118" x2="520" y2="118" stroke="#2563eb" stroke-width="2.6"/>
            <text x="342" y="135" text-anchor="middle" font-size="10.5" font-weight="700" fill="#1d4ed8">d<tspan dy="3" font-size="8">xy</tspan></text>
            <text x="416" y="135" text-anchor="middle" font-size="10.5" font-weight="700" fill="#1d4ed8">d<tspan dy="3" font-size="8">zx</tspan></text>
            <text x="490" y="135" text-anchor="middle" font-size="10.5" font-weight="700" fill="#1d4ed8">d<tspan dy="3" font-size="8">zy</tspan></text>
            <text x="532" y="122" font-size="11" font-weight="800" fill="#1d4ed8">t<tspan dy="3" font-size="8.5">2g</tspan><tspan dy="-3"> (&minus;0.4 &Delta;</tspan><tspan dy="3" font-size="8.5">o</tspan><tspan dy="-3">)</tspan></text>

            <rect x="625" y="24" width="222" height="114" rx="8" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.4"/>
            <text x="736" y="45" text-anchor="middle" font-size="11" font-weight="800" fill="#166534">Example: KCoHCF+K (Co 3d)</text>
            <text x="638" y="67" font-size="10.5" fill="#1e293b">&bull; d<tspan dy="3" font-size="8">x&sup2;&minus;y&sup2;</tspan><tspan dy="-3">: +0.597 &mu;</tspan><tspan dy="3" font-size="8">B</tspan><tspan dy="-3"> (62% share)</tspan></text>
            <text x="638" y="88" font-size="10.5" fill="#1e293b">&bull; d<tspan dy="3" font-size="8">z&sup2;</tspan><tspan dy="-3">: +0.268 &mu;</tspan><tspan dy="3" font-size="8">B</tspan><tspan dy="-3"> (28% share)</tspan></text>
            <text x="638" y="109" font-size="10.5" fill="#1e293b">&bull; t<tspan dy="3" font-size="8">2g</tspan><tspan dy="-3"> nearly filled (+0.10 &mu;</tspan><tspan dy="3" font-size="8">B</tspan><tspan dy="-3">)</tspan></text>
            <text x="638" y="128" font-size="10" font-weight="700" fill="#15803d">&rArr; e<tspan dy="2.5" font-size="8">g</tspan><tspan dy="-2.5">-dominated spin moment!</tspan></text>
          </svg>
        </div>

        ${labBox("Inspect Orbital-Resolved Spin Matrices, Charges &amp; 3D Spin Arrows", "mulliken", "Open Mulliken & Spin Tab",
          `<ol class="dft-steps">
            <li>Open <strong>Data Analysis &rarr; 🧲 Mulliken &amp; Spin</strong> on a spin-polarized job (e.g., <code>KCoHCF+K CASTEP Energy</code>).</li>
            <li>Use the <strong>Orbital-Resolved Spin Matrix</strong> element pills (<code>All Elements Grid</code>, <code>Co</code>, <code>Fe</code>, <code>N</code>, <code>C</code>, <code>K</code>) to inspect the exact 5&times;5 <i>d</i>-orbital or 3&times;3 <i>p</i>-orbital spin heatmap and orbital share breakdown.</li>
            <li>Scroll down to the <strong>Mulliken Charts Toolbar</strong> to compare <strong>Atomic Magnetic Moment (&mu;<sub>B</sub>)</strong>, <strong>Mulliken vs. Hirshfeld Charge</strong>, and <strong>Bond Population vs. Bond Length</strong>, or click <strong>🧲 3D Spin Arrows</strong> to overlay red (&uarr;) / blue (&darr;) magnetic vectors onto the crystal structure.</li>
          </ol>`)}
      `,
      references: [
        { authors: "U. von Barth & L. Hedin", title: "A Local Exchange-Correlation Potential for the Spin Polarized Case (LSDA)", venue: "J. Phys. C: Solid State Phys. 5, 1629–1642", year: "1972", doi: "10.1088/0022-3719/5/13/012" },
        { authors: "R. S. Mulliken", title: "Electronic Population Analysis on LCAO-MO Molecular Wave Functions", venue: "J. Chem. Phys. 23, 1833–1840", year: "1955", doi: "10.1063/1.1740588" },
        { authors: "M. D. Segall, R. Shah, C. J. Pickard & M. C. Payne", title: "Population Analysis of Plane-Wave Electronic Structure Calculations of Bulk Materials", venue: "Phys. Rev. B 54, 16317–16320", year: "1996", doi: "10.1103/PhysRevB.54.16317" },
        { authors: "F. L. Hirshfeld", title: "Bonded-Atom Fragments for Describing Molecular Charge Densities", venue: "Theor. Chim. Acta 44, 129–138", year: "1977", doi: "10.1007/BF00549096" },
        { authors: "E. C. Stoner", title: "Collective Electron Ferromagnetism (Stoner Criterion)", venue: "Proc. R. Soc. Lond. A 165, 372–414", year: "1938", doi: "10.1098/rspa.1938.0066" },
        { authors: "J. B. Goodenough", title: "Theory of the Role of Covalence in the Perovskite-Type Manganites (Superexchange Rules)", venue: "Phys. Rev. 100, 564–573", year: "1955", doi: "10.1103/PhysRev.100.564" }
      ]
    },

    // =========================================================================
    // LECTURE 10: PRACTICAL END-TO-END DFT WORKFLOW & PUBLICATION STANDARDS
    // =========================================================================
    {
      id: "lec10",
      num: 10,
      shortTab: "L10: Full Workflow",
      level: "Practical Capstone",
      levelClass: "cap",
      readTime: "16 min",
      toolPane: "gateway",
      toolName: "Gateway & Export",
      title: "Lecture 10: Practical End-to-End DFT Workflow, Code Translation &amp; Publication Best Practices",
      subtitle: "A reproducible 6-stage protocol from raw .cif import to converged CASTEP/VASP production runs, troubleshooting SCF failures, cross-code reproducibility, and 600 DPI journal figures.",
      keywords: "workflow convergence test ecut kpoint vacuum troubleshooting scf mixing dipole correction publication figure dpi tnr gateway castep vasp rosetta stone reproducibility checklist",
      objectives: [
        "Execute a reproducible 6-stage DFT research workflow from .cif import to publication-ready figures.",
        "Translate production input parameters seamlessly between CASTEP (.param/.cell) and VASP (INCAR/KPOINTS).",
        "Diagnose and fix the 5 most common DFT calculation failures (SCF oscillation, false metals, spin collapse, Pulay stress, slab dipoles).",
        "Standardize figure typography, 400–600 DPI PNG export, and raw TSV/Excel data archiving on this platform."
      ],
      contentHtml: `
        <h3>10.1 The 6-Stage Reproducible DFT Calculation Protocol</h3>
        <div class="dft-workflow-grid">
          <div class="dft-wf-card">
            <div class="dft-wf-step">STAGE 1</div>
            <div class="dft-wf-title">Structure &amp; Symmetry Validation</div>
            <p>Import experimental or Materials Project <code>.cif</code>, verify space group &amp; Wyckoff multiplicity, remove partial occupancies, and build required supercells, defects, or 2D slabs (&ge; 15–20 &Aring; vacuum).</p>
          </div>
          <div class="dft-wf-card">
            <div class="dft-wf-step">STAGE 2</div>
            <div class="dft-wf-title">Basis &amp; k-Grid Convergence</div>
            <p>Sweep <i>E</i><sub>cut</sub> (400 &rarr; 800 eV) and k-spacing (0.06 &rarr; 0.02 &Aring;<sup>&minus;1</sup>) until total energy differences converge within <strong>&lt; 1 meV/atom</strong> and forces within <strong>&lt; 0.005 eV/&Aring;</strong>.</p>
          </div>
          <div class="dft-wf-card">
            <div class="dft-wf-step">STAGE 3</div>
            <div class="dft-wf-title">Geometry &amp; Cell Optimization</div>
            <p>Relax cell + ions using <code>PBE + DFT-D (G06/TS)</code> and <code>LBFGS</code> until |<b>F</b><sub>max</sub>| &le; 0.01 eV/&Aring; and |&sigma;<sub>max</sub>| &le; 0.02 GPa. Enable <code>spin_polarized: true</code> for any 3<i>d</i>/4<i>f</i>/defect system.</p>
          </div>
          <div class="dft-wf-card">
            <div class="dft-wf-step">STAGE 4</div>
            <div class="dft-wf-title">Electronic Bands, PDOS &amp; m*</div>
            <p>Run static SinglePoint + high-symmetry BandStr + dense-mesh DOS (<code>.pdos_bin</code>). Extract <i>E</i><sub>g</sub>, PDOS hybridization, directional effective masses <i>m</i>*<sub>e</sub>/<i>m</i>*<sub>h</sub>, mobility &mu;, and Drude &tau;.</p>
          </div>
          <div class="dft-wf-card">
            <div class="dft-wf-step">STAGE 5</div>
            <div class="dft-wf-title">Optics, &Delta;&rho; &amp; Magnetism</div>
            <p>Compute linear-response <code>*.ome_bin</code> optical tensor (with Scissors/HSE06 gap), volumetric <code>*.chdiff</code> / <code>*.charg_frm</code> charge transfer &Delta;<i>Q</i>(<i>z</i>), and Mulliken/Hirshfeld + Orbital Spin Matrix.</p>
          </div>
          <div class="dft-wf-card">
            <div class="dft-wf-step">STAGE 6</div>
            <div class="dft-wf-title">Publication Figures &amp; Archiving</div>
            <p>Apply unified <strong>Times New Roman</strong> or <strong>Arial</strong> journal style, export 400–600 DPI figures with embedded PNG DPI metadata, and archive full multi-sheet Excel workbooks &amp; structures.</p>
          </div>
        </div>

        <h3>10.2 CASTEP &harr; VASP Production Keyword Rosetta Stone</h3>
        <p>The landmark &Delta;-gauge reproducibility study (Lejaeghere <i>et al.</i>, <i>Science</i> 2016) proved that modern plane-wave DFT codes (CASTEP, VASP, Quantum ESPRESSO, ABINIT) agree to within <strong>&lt; 1 meV/atom</strong> across 71 elemental crystals when converged. Use this cross-reference table to translate setups seamlessly:</p>
        <table class="dft-table">
          <thead><tr><th>Physical Setting</th><th>CASTEP (<code>.param</code> / <code>.cell</code>)</th><th>VASP (<code>INCAR</code> / <code>KPOINTS</code>)</th><th>Recommended Production Value</th></tr></thead>
          <tbody>
            <tr><td>Plane-wave cutoff</td><td><code>cut_off_energy</code></td><td><code>ENCUT</code></td><td>500–600 eV (USPP/PAW)</td></tr>
            <tr><td>XC Functional</td><td><code>xc_functional: PBE / HSE06</code></td><td><code>GGA = PE</code> / <code>LHFCALC = .TRUE.</code></td><td>PBE+D for geom, HSE06 for <i>E</i><sub>g</sub></td></tr>
            <tr><td>vdW Dispersion</td><td><code>sedc_apply: true</code>, <code>sedc_scheme: TS</code></td><td><code>IVDW = 12</code> (D3-BJ) / <code>20</code> (TS)</td><td>Required for 2D / adsorption</td></tr>
            <tr><td>SCF Energy Tol.</td><td><code>elec_energy_tol</code></td><td><code>EDIFF</code></td><td>&le; 1&times;10<sup>&minus;6</sup> eV/atom</td></tr>
            <tr><td>Force Convergence</td><td><code>geom_force_tol</code></td><td><code>EDIFFG = -0.01</code></td><td>&le; 0.01 eV/&Aring; (high precision)</td></tr>
            <tr><td>Spin Polarization</td><td><code>spin_polarized: true</code></td><td><code>ISPIN = 2</code> + <code>MAGMOM</code></td><td>Mandatory for 3<i>d</i>/4<i>f</i>/radicals</td></tr>
            <tr><td>Electronic Smearing</td><td><code>smearing_width: 0.05 eV</code></td><td><code>ISMEAR = 0</code>, <code>SIGMA = 0.05</code></td><td>0.05 eV (Gaussian/MP)</td></tr>
            <tr><td>k-Point Grid</td><td><code>kpoint_mp_grid</code> / <code>kpoint_mp_spacing</code></td><td><code>KPOINTS</code> (Monkhorst–Pack)</td><td>&Delta;<i>k</i> &le; 0.03 &Aring;<sup>&minus;1</sup> (SC), 0.02 (metal)</td></tr>
          </tbody>
        </table>

        <h3>10.3 Troubleshooting Common DFT Pitfalls</h3>
        <table class="dft-table">
          <thead><tr><th>Symptom / Problem</th><th>Physical Cause</th><th>Recommended Fix in CASTEP / VASP</th></tr></thead>
          <tbody>
            <tr><td><strong>SCF energy oscillates / never converges</strong></td><td>Charge sloshing in metals, slabs, or small-gap systems</td><td>Reduce <code>mix_charge_amp</code> (0.8 &rarr; 0.2), use Pulay/Kerker mixing, raise <code>smearing_width</code> to 0.05–0.10 eV, increase <code>nextra_bands</code>.</td></tr>
            <tr><td><strong>Semiconductor predicted metallic</strong></td><td>PBE self-interaction error closes narrow band gaps</td><td>Verify with <strong>HSE06</strong> or <strong>PBE+<i>U</i></strong> (3<i>d</i>/4<i>f</i>); check if spin polarization splits the Fermi-crossing band.</td></tr>
            <tr><td><strong>2D slab vacuum potential is tilted</strong></td><td>Asymmetric Janus / adsorbed slab creates net <i>z</i>-dipole</td><td>Enable dipole correction (<code>dipole_correction: selfconsistent</code> / <code>LDIPOL = .TRUE.</code>) and vacuum &ge; 18–20 &Aring;.</td></tr>
            <tr><td><strong>Magnetic moment collapses to 0 &mu;<sub>B</sub></strong></td><td>Zero initial spin symmetry traps SCF at non-magnetic saddle</td><td>Seed non-zero initial atomic spins (<code>SPIN=3.0</code> on Fe/Co/Mn/Cr) and compare FM vs. AFM initial orderings.</td></tr>
            <tr><td><strong>Noisy effective mass / jagged DOS</strong></td><td>Too few k-points near VBM/CBM or overly broad smearing</td><td>Increase path density (&Delta;<i>k</i> &le; 0.015 &Aring;<sup>&minus;1</sup> near extrema) and verify <i>R</i><sup>2</sup> &ge; 0.99 in <strong>m* &amp; Drude</strong>.</td></tr>
          </tbody>
        </table>

        <h3>10.4 Quick-Reference Map: DFT Theory &rarr; Live Website Modules</h3>
        <table class="dft-table">
          <thead><tr><th>Physical Observable</th><th>Required CASTEP Files</th><th>Live Module in Data Analysis</th></tr></thead>
          <tbody>
            <tr><td>Crystal Symmetry, Slabs, Defects, Adsorbates</td><td><code>.cif</code>, <code>.cell</code>, <code>.xsd</code></td><td><button type="button" class="castep-preset-chip" onclick="openCastepToolFromLecture('builder')">&#129521; 3D View</button></td></tr>
            <tr><td>Live Remote Cluster Job Queue &amp; Monitoring</td><td>BIOVIA Gateway (<code>:18888</code>)</td><td><button type="button" class="castep-preset-chip" onclick="openCastepToolFromLecture('gateway')">&#128421; Gateway</button></td></tr>
            <tr><td>Band Structure, Direct/Indirect Gap, PDOS</td><td><code>*_BandStr.bands</code>, <code>*.pdos_bin</code></td><td><button type="button" class="castep-preset-chip" onclick="openCastepToolFromLecture('electronic')">&#128200; Band &amp; PDOS</button></td></tr>
            <tr><td>Effective Mass (Band/DOS), Mobility, Drude &tau;</td><td><code>*_BandStr.bands</code>, <code>*_DOS.bands</code></td><td><button type="button" class="castep-preset-chip" onclick="openCastepToolFromLecture('transport')">&#128640; m* &amp; Drude</button></td></tr>
            <tr><td>3&times;3 Dielectric Tensor, Absorption, EELS, Tauc</td><td><code>*_Optics.ome_bin</code>, <code>*_Optics.bands</code></td><td><button type="button" class="castep-preset-chip" onclick="openCastepToolFromLecture('optics')">&#127752; Optical</button></td></tr>
            <tr><td>3D/2D/1D Charge Density Difference &amp; &Delta;Q(z)</td><td><code>*.chdiff</code>, <code>*.charg_frm</code></td><td><button type="button" class="castep-preset-chip" onclick="openCastepToolFromLecture('chdiff')">&#128267; Charge Diff</button></td></tr>
            <tr><td>Mulliken/Hirshfeld Charges &amp; Orbital Spin Matrix</td><td><code>*.castep</code>, <code>*.pdos_bin</code></td><td><button type="button" class="castep-preset-chip" onclick="openCastepToolFromLecture('mulliken')">&#129522; Mulliken &amp; Spin</button></td></tr>
            <tr><td>SCF Convergence, Enthalpy &amp; Ionic Forces</td><td><code>*.castep</code>, <code>*.geom</code>, <code>*.xcd</code></td><td><button type="button" class="castep-preset-chip" onclick="openCastepToolFromLecture('convergence')">&#9889; Conv.</button></td></tr>
          </tbody>
        </table>

        ${labBox("Monitor Live Jobs &amp; Export Publication-Ready 600 DPI Figures", "gateway", "Open Remote Gateway",
          `<ol class="dft-steps">
            <li>Open <strong>Data Analysis &rarr; 🖥️ Gateway</strong> to monitor live BIOVIA Materials Studio CASTEP jobs on the calculation server and download results directly into the analyzer.</li>
            <li>Click <strong>🎨 Plot Format</strong> at the top-right of Data Analysis to unify <strong>Times New Roman</strong> / <strong>Arial</strong>, font sizes, <code>1.8 px</code> frames, inward ticks, and <strong>400–600 DPI</strong> quality across every single graph simultaneously.</li>
            <li>Use <strong>📋 Copy HD</strong> (full figure) or <strong>Right-Click</strong> (individual chart panel) to paste crisp figures straight into Word, PowerPoint, or OriginPro!</li>
          </ol>`,
          `<button type="button" class="btn btn-outline btn-sm" onclick="openCastepToolFromLecture('electronic')">&#128200; Open Band &amp; PDOS</button>`)}
      `,
      references: [
        { authors: "K. Lejaeghere et al.", title: "Reproducibility in Density Functional Theory Calculations of Solids", venue: "Science 351, aad3000", year: "2016", doi: "10.1126/science.aad3000" },
        { authors: "D. S. Sholl & J. A. Steckel", title: "Density Functional Theory: A Practical Introduction (2nd Edition)", venue: "John Wiley & Sons", year: "2022", doi: "10.1002/9780470447710" },
        { authors: "J. Hafner", title: "Ab-Initio Simulations of Materials Using VASP: Density-Functional Theory and Beyond", venue: "J. Comput. Chem. 29, 2044–2078", year: "2008", doi: "10.1002/jcc.21057" },
        { authors: "P. Giannozzi et al.", title: "Advanced Capabilities for Materials Modelling with Quantum ESPRESSO", venue: "J. Phys.: Condens. Matter 29, 465901", year: "2017", doi: "10.1088/1361-648X/aa8f79" },
        { authors: "A. Jain, S. P. Ong, G. Hautier, W. Chen, W. D. Richards, S. Dacek, S. Cholia, D. Gunter, D. Skinner, G. Ceder & K. A. Persson", title: "Commentary: The Materials Project: A Materials Genome Approach to Accelerating Materials Innovation", venue: "APL Mater. 1, 011002", year: "2013", doi: "10.1063/1.4812323" }
      ]
    }
  ];

  window.DFT_THEORY_DEFAULT_LECTURES = cloneJson(DEFAULT_LECTURES);

  // =========================================================================
  // PERSISTENCE LAYER (STATE.dftLectures + localStorage + GitHub data.json)
  // =========================================================================
  function normalizeLecturesArray(arr) {
    if (!Array.isArray(arr) || !arr.length) return cloneJson(DEFAULT_LECTURES);
    return arr
      .filter(l => l && typeof l === "object" && (l.id || l.title))
      .map((l, idx) => {
        const num = idx + 1;
        const id = String(l.id || `lec_${num}_${Date.now()}`).trim();
        const rawShort = String(l.shortTab || `L${num}: Topic ${num}`).trim();
        const cleanShort = rawShort.replace(/^L\d+:\s*/i, "");
        const toolPane = String(l.toolPane || "electronic").trim();
        const bodyHtml = typeof l.contentHtml === "string"
          ? l.contentHtml
          : (typeof l.html === "function" ? l.html() : String(l.html || ""));
        const refs = Array.isArray(l.references)
          ? l.references
              .filter(r => r && (r.title || r.authors))
              .map(r => ({
                authors: String(r.authors || "").trim(),
                title: String(r.title || "").trim(),
                venue: String(r.venue || "").trim(),
                year: String(r.year || "").trim(),
                doi: String(r.doi || "").trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, "")
              }))
          : [];
        return {
          id,
          num,
          shortTab: `L${num}: ${cleanShort}`,
          level: String(l.level || "Intermediate").trim(),
          levelClass: ["basic", "interm", "adv", "cap"].includes(l.levelClass) ? l.levelClass : "interm",
          readTime: String(l.readTime || "15 min").trim(),
          toolPane,
          toolName: String(l.toolName || TOOL_META_MAP[toolPane] || "Data Analysis").trim(),
          title: String(l.title || `Lecture ${num}: Untitled DFT Topic`).trim(),
          subtitle: String(l.subtitle || "").trim(),
          author: String(l.author || getDefaultLectureAuthor()).trim(),
          affiliation: String(l.affiliation || getDefaultLectureAffiliation()).trim(),
          updatedAt: String(l.updatedAt || DEFAULT_UPDATED_AT).trim(),
          keywords: String(l.keywords || "").trim(),
          objectives: Array.isArray(l.objectives)
            ? l.objectives.map(x => String(x || "").trim()).filter(Boolean)
            : [],
          contentHtml: bodyHtml,
          references: refs
        };
      });
  }

  function migrateLegacyLecturesIfNeeded() {
    try {
      if (localStorage.getItem(STORAGE_KEY)) return null;
      const legacyRaw = localStorage.getItem(LEGACY_KEY);
      if (!legacyRaw) return null;
      const parsed = JSON.parse(legacyRaw);
      if (!Array.isArray(parsed) || !parsed.length) return null;
      // Preserve any admin-added custom lectures while upgrading built-in lec1..lec10 to v142 KaTeX!
      const defaultIds = new Set(DEFAULT_LECTURES.map(d => d.id));
      const customExtras = parsed.filter(l => l && l.id && !defaultIds.has(l.id));
      if (!customExtras.length) return null;
      return [...cloneJson(DEFAULT_LECTURES), ...customExtras];
    } catch (_) {
      return null;
    }
  }

  function getDftTheoryLectures() {
    if (typeof STATE !== "undefined" && Array.isArray(STATE.dftLectures) && STATE.dftLectures.length > 0) {
      window.DFT_THEORY_LECTURES = STATE.dftLectures;
      return STATE.dftLectures;
    }
    let loaded = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) loaded = parsed;
      }
    } catch (_) {}
    if (!loaded) {
      loaded = migrateLegacyLecturesIfNeeded();
    }
    if (!loaded && typeof STATE !== "undefined" && STATE.masterData && Array.isArray(STATE.masterData.dft_lectures) && STATE.masterData.dft_lectures.length > 0) {
      loaded = STATE.masterData.dft_lectures;
    }
    if (!loaded && Array.isArray(window._SEED_DFT_LECTURES) && window._SEED_DFT_LECTURES.length > 0) {
      loaded = window._SEED_DFT_LECTURES;
    }
    const normalized = normalizeLecturesArray(loaded || DEFAULT_LECTURES);
    if (typeof STATE !== "undefined") STATE.dftLectures = normalized;
    window.DFT_THEORY_LECTURES = normalized;
    return normalized;
  }
  window.getDftTheoryLectures = getDftTheoryLectures;

  function saveDftTheoryLectures(list, opts = {}) {
    const normalized = normalizeLecturesArray(list);
    if (typeof STATE !== "undefined") {
      STATE.dftLectures = normalized;
      if (!STATE.masterData) STATE.masterData = {};
      STATE.masterData.dft_lectures = cloneJson(normalized);
    }
    window._SEED_DFT_LECTURES = cloneJson(normalized);
    window.DFT_THEORY_LECTURES = normalized;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch (_) {}
    if (!opts.skipDbSave && typeof saveStaticDb === "function") {
      try { saveStaticDb(); } catch (_) {}
    }
    initDashboardDftCard();
    if (!opts.skipRender) {
      renderDftTheoryTab(opts.focusId || _activeLectureId, true);
    }
    return normalized;
  }
  window.saveDftTheoryLectures = saveDftTheoryLectures;

  function isAdminAuthorized() {
    if (typeof isStrictAdminSession === "function") {
      return isStrictAdminSession();
    }
    return Boolean(typeof STATE !== "undefined" && STATE.auth && STATE.auth.isAdmin && !STATE.adminPreviewUserEmail);
  }

  function notifyUser(msg, type = "success") {
    if (typeof showToast === "function") {
      showToast(msg, type);
    } else {
      console.log(`[DFT Theory] ${msg}`);
    }
  }

  window.DFT_THEORY_LECTURES = getDftTheoryLectures();

  // =========================================================================
  // INTERACTIVE LECTURE CONTROLLER (Sub-Tabs, KaTeX, References, Search)
  // =========================================================================
  let _activeLectureId = "lec1";
  let _editingLectureId = null;
  let _editorMode = "split"; // "visual" | "split" | "code"
  let _syncingEditor = false;
  let _visualSyncTimer = null;
  let _codeSyncTimer = null;
  let _savedVisualRange = null;
  let _eqBuilderTargetNode = null;

  let _sectionsObserver = null;

  // =========================================================================
  // PER-LECTURE PERMANENT DEEP-LINK URL, COPY LINK & SHARE MENU
  // =========================================================================
  function getDftLectureShareUrl(lecId, sectionId = "") {
    const id = String(lecId || _activeLectureId || "lec1").trim();
    const base = `${window.location.origin}${window.location.pathname}`;
    const url = `${base}?tab=dft-theory&lecture=${encodeURIComponent(id)}`;
    return sectionId ? `${url}#${encodeURIComponent(sectionId)}` : url;
  }
  window.getDftLectureShareUrl = getDftLectureShareUrl;

  function resolveDftLectureId(rawToken) {
    const token = String(rawToken || "").trim();
    if (!token) return null;
    const lectures = getDftTheoryLectures();
    // Exact ID match (e.g. "lec6" or "lec_1795...")
    const byId = lectures.find(l => String(l.id).toLowerCase() === token.toLowerCase());
    if (byId) return byId.id;
    // Numeric shorthand match (e.g. "?lecture=6" or "lecture6" or "l6")
    const numMatch = token.match(/^(?:lec(?:ture)?|l)?(\d+)$/i);
    if (numMatch) {
      const n = parseInt(numMatch[1], 10);
      const byNum = lectures.find(l => l.num === n) || lectures[n - 1];
      if (byNum) return byNum.id;
    }
    return null;
  }

  function extractDftLectureFromUrl() {
    try {
      const params = new URLSearchParams(window.location.search);
      const qLec = params.get("lecture") || params.get("lec");
      const hashRaw = (window.location.hash || "").replace(/^#/, "");
      let lecToken = qLec || "";
      let sectionId = "";

      if (hashRaw) {
        if (hashRaw.startsWith("dft-sec-")) {
          sectionId = decodeURIComponent(hashRaw);
        } else if (/^lecture[=\-_]/i.test(hashRaw)) {
          lecToken = lecToken || decodeURIComponent(hashRaw.replace(/^lecture[=\-_]/i, ""));
        }
      }
      const lecId = resolveDftLectureId(lecToken);
      if (!lecId) return null;
      return { lecId, sectionId };
    } catch (_) {
      return null;
    }
  }
  window.extractDftLectureFromUrl = extractDftLectureFromUrl;

  function syncUrlWithDftLecture(lecId, sectionId = "") {
    try {
      const tabEl = document.getElementById("tab-dft-theory");
      if (!tabEl || !tabEl.classList.contains("active")) return;
      const urlObj = new URL(window.location.href);
      urlObj.searchParams.set("tab", "dft-theory");
      urlObj.searchParams.set("lecture", lecId);
      urlObj.searchParams.delete("article");
      urlObj.searchParams.delete("structure");
      const newHash = sectionId ? `#${encodeURIComponent(sectionId)}` : "";
      const nextUrl = `${urlObj.pathname}?${urlObj.searchParams.toString()}${newHash}`;
      window.history.replaceState({ tabId: "dft-theory", dftLectureId: lecId }, "", nextUrl);
    } catch (_) {}
  }
  window.syncUrlWithDftLecture = syncUrlWithDftLecture;

  function clearDftLectureUrlParam() {
    try {
      const urlObj = new URL(window.location.href);
      if (!urlObj.searchParams.has("lecture") && !(window.location.hash || "").startsWith("#dft-sec-")) return;
      urlObj.searchParams.delete("lecture");
      const qs = urlObj.searchParams.toString();
      const keepHash = (window.location.hash || "").startsWith("#dft-sec-") ? "" : window.location.hash;
      window.history.replaceState({}, "", `${urlObj.pathname}${qs ? "?" + qs : ""}${keepHash}`);
    } catch (_) {}
  }
  window.clearDftLectureUrlParam = clearDftLectureUrlParam;

  function checkAndHandleDftLectureDeepLink() {
    const info = extractDftLectureFromUrl();
    if (!info || !info.lecId) return false;
    _activeLectureId = info.lecId;
    if (typeof switchTabByName === "function") {
      switchTabByName("dft-theory", { skipUrlSync: true });
    } else if (typeof switchTab === "function") {
      switchTab("dft-theory", null, { skipUrlSync: true });
    }
    renderDftTheoryTab(info.lecId, true);
    if (info.sectionId) {
      setTimeout(() => scrollToDftSection(info.sectionId, info.lecId, false), 220);
    }
    return true;
  }
  window.checkAndHandleDftLectureDeepLink = checkAndHandleDftLectureDeepLink;

  async function copyTextSafe(text) {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) {}
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      return true;
    } catch (_) {
      return false;
    }
  }

  async function copyDftLectureLink(lecId, btnEl = null) {
    const lectures = getDftTheoryLectures();
    const lec = lectures.find(l => l.id === lecId) || lectures[0];
    if (!lec) return;
    const url = getDftLectureShareUrl(lec.id);
    const ok = await copyTextSafe(url);
    if (ok) {
      notifyUser(`Copied direct link for Lecture ${lec.num}: ${url}`, "success");
      if (btnEl) {
        const prev = btnEl.innerHTML;
        btnEl.classList.add("is-copied");
        btnEl.innerHTML = "&#10004; Copied!";
        setTimeout(() => {
          btnEl.classList.remove("is-copied");
          btnEl.innerHTML = prev;
        }, 1800);
      }
    } else {
      notifyUser("Could not access clipboard. Copy the link from the address bar.", "error");
    }
    closeAllDftShareMenus();
  }
  window.copyDftLectureLink = copyDftLectureLink;

  async function copyDftLectureCitation(lecId) {
    const lectures = getDftTheoryLectures();
    const lec = lectures.find(l => l.id === lecId) || lectures[0];
    if (!lec) return;
    const author = lec.author || getDefaultLectureAuthor();
    const aff = lec.affiliation || getDefaultLectureAffiliation();
    const updated = lec.updatedAt || DEFAULT_UPDATED_AT;
    const url = getDftLectureShareUrl(lec.id);
    const plainTitle = String(lec.title || "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim();
    const citation = `${author}, "${plainTitle}," DFT Theory Curriculum, ${aff} (Updated ${updated}). Available: ${url}`;
    const ok = await copyTextSafe(citation);
    notifyUser(ok ? "Copied academic lecture citation to clipboard!" : "Could not copy citation.", ok ? "success" : "error");
    closeAllDftShareMenus();
  }
  window.copyDftLectureCitation = copyDftLectureCitation;

  function shareDftLectureVia(channel, lecId) {
    const lectures = getDftTheoryLectures();
    const lec = lectures.find(l => l.id === lecId) || lectures[0];
    if (!lec) return;
    const url = getDftLectureShareUrl(lec.id);
    const plainTitle = String(lec.title || "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim();
    const text = `${plainTitle} — Density Functional Theory Curriculum`;

    if (channel === "native" && navigator.share) {
      navigator.share({ title: plainTitle, text, url }).catch(() => {});
    } else if (channel === "email") {
      const subject = encodeURIComponent(plainTitle);
      const body = encodeURIComponent(`${text}\n\nRead this DFT lecture online:\n${url}`);
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    } else if (channel === "linkedin") {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer");
    } else if (channel === "x") {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer");
    }
    closeAllDftShareMenus();
  }
  window.shareDftLectureVia = shareDftLectureVia;

  function closeAllDftShareMenus() {
    document.querySelectorAll(".dft-share-menu.open").forEach(m => m.classList.remove("open"));
  }
  window.closeAllDftShareMenus = closeAllDftShareMenus;

  function toggleDftShareMenu(event, lecId, menuId = "dft-share-menu-top") {
    if (event) event.stopPropagation();
    const menu = document.getElementById(menuId);
    if (!menu) return;
    const willOpen = !menu.classList.contains("open");
    closeAllDftShareMenus();
    if (willOpen) {
      const urlEl = menu.querySelector(".dft-share-url-preview");
      if (urlEl) urlEl.textContent = getDftLectureShareUrl(lecId);
      menu.classList.add("open");
    }
  }
  window.toggleDftShareMenu = toggleDftShareMenu;

  document.addEventListener("click", (ev) => {
    if (!ev.target.closest(".dft-share-wrap")) {
      closeAllDftShareMenus();
    }
  });

  // =========================================================================
  // NATURE / SPRINGER-STYLE STICKY SECTIONS SIDEBAR & SCROLLSPY
  // =========================================================================
  function scrollToDftSection(secId, lecId = null, updateHash = true) {
    const target = document.getElementById(secId);
    if (!target) return;
    const header = document.querySelector(".top-app-header");
    const headerH = header ? Math.ceil(header.getBoundingClientRect().height) : 116;
    const y = target.getBoundingClientRect().top + window.scrollY - (headerH + 14);
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    setActiveDftSectionLink(secId);
    if (updateHash) {
      syncUrlWithDftLecture(lecId || _activeLectureId, secId);
    }
    // Collapse mobile sections drawer after tap
    const mobDetails = document.querySelector(".dft-sections-mobile[open]");
    if (mobDetails) mobDetails.removeAttribute("open");
  }
  window.scrollToDftSection = scrollToDftSection;

  function setActiveDftSectionLink(secId) {
    document.querySelectorAll(".dft-sec-link").forEach(a => {
      a.classList.toggle("is-active", a.dataset.secId === secId);
    });
  }

  function buildLectureSectionsNavigation(stage, found) {
    if (_sectionsObserver) {
      try { _sectionsObserver.disconnect(); } catch (_) {}
      _sectionsObserver = null;
    }
    const contentEl = stage.querySelector(".dft-lec-content");
    const headerEl = stage.querySelector(".dft-lec-header");
    if (!contentEl || !headerEl) return;

    const sections = [];
    const overviewId = `dft-sec-${found.id}-overview`;
    headerEl.id = overviewId;
    sections.push({ id: overviewId, label: "Overview" });

    // Extract every H3 section heading automatically (works for built-in & Admin-edited lectures!)
    const h3s = [...contentEl.querySelectorAll("h3")];
    h3s.forEach((h3, idx) => {
      const secId = `dft-sec-${found.id}-s${idx + 1}`;
      h3.id = secId;
      const cleanLabel = (h3.textContent || "").replace(/\s+/g, " ").trim();
      if (cleanLabel) {
        sections.push({ id: secId, label: cleanLabel });
      }
    });

    // Detect Hands-On Practice Lab box
    const labEl = contentEl.querySelector(".dft-lab-box");
    if (labEl) {
      const labId = `dft-sec-${found.id}-lab`;
      labEl.id = labId;
      sections.push({ id: labId, label: "Hands-on practice" });
    }

    // Detect Peer-Reviewed References box
    const refsEl = contentEl.querySelector(".dft-refs-box");
    if (refsEl) {
      const refsId = `dft-sec-${found.id}-refs`;
      refsEl.id = refsId;
      sections.push({ id: refsId, label: "References" });
    }

    const linksHtml = sections.map((sec, idx) => `
      <a href="#${escAttr(sec.id)}" class="dft-sec-link${idx === 0 ? " is-active" : ""}" data-sec-id="${escAttr(sec.id)}" onclick="event.preventDefault(); scrollToDftSection('${escAttr(sec.id)}', '${escAttr(found.id)}', true);">
        ${escHtml(sec.label)}
      </a>
    `).join("");

    const desktopList = stage.querySelector("#dft-sections-desktop-list");
    if (desktopList) desktopList.innerHTML = linksHtml;

    const mobileList = stage.querySelector("#dft-sections-mobile-list");
    if (mobileList) mobileList.innerHTML = linksHtml;

    // Setup ScrollSpy via IntersectionObserver
    if (typeof IntersectionObserver !== "undefined") {
      const observedEls = sections.map(s => document.getElementById(s.id)).filter(Boolean);
      _sectionsObserver = new IntersectionObserver((entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveDftSectionLink(visible[0].target.id);
        }
      }, {
        rootMargin: "-128px 0px -65% 0px",
        threshold: 0.01
      });
      observedEls.forEach(el => _sectionsObserver.observe(el));
    }
  }

  function openCastepToolFromLecture(paneId) {
    if (typeof switchTabByName === "function") {
      switchTabByName("castep");
    } else if (typeof switchTab === "function") {
      switchTab("castep");
    }
    if (paneId) {
      setTimeout(() => {
        if (typeof switchCastepStagePane === "function") {
          switchCastepStagePane(paneId);
        }
      }, 140);
    }
  }
  window.openCastepToolFromLecture = openCastepToolFromLecture;

  function openDftTheoryLecture(lecId) {
    const lectures = getDftTheoryLectures();
    const fallbackId = lectures[0] ? lectures[0].id : "lec1";
    _activeLectureId = lecId || fallbackId;
    if (typeof switchTabByName === "function") {
      switchTabByName("dft-theory");
    } else if (typeof switchTab === "function") {
      switchTab("dft-theory");
    }
    renderDftTheoryTab(_activeLectureId, true);
  }
  window.openDftTheoryLecture = openDftTheoryLecture;

  function buildReferencesHtml(refs) {
    if (!Array.isArray(refs) || !refs.length) return "";
    const items = refs.map((r, i) => {
      const doiClean = String(r.doi || "").trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");
      const doiBadge = doiClean
        ? ` <a class="dft-doi-pill" href="https://doi.org/${encodeURI(doiClean)}" target="_blank" rel="noopener noreferrer" title="Open official DOI record">DOI: ${escHtml(doiClean)} &#8599;</a>`
        : "";
      const venuePart = r.venue ? ` <em>${escHtml(r.venue)}</em>` : "";
      const yearPart = r.year ? ` (${escHtml(r.year)}).` : ".";
      return `<li class="dft-ref-item"><span class="dft-ref-idx">[${i + 1}]</span><div class="dft-ref-text"><strong>${escHtml(r.authors)}</strong>, &ldquo;${escHtml(r.title)},&rdquo;${venuePart}${yearPart}${doiBadge}</div></li>`;
    }).join("");
    return `
      <section class="dft-refs-box" aria-label="Peer-Reviewed References">
        <div class="dft-refs-head">
          <span>&#128218; Peer-Reviewed References &amp; Further Reading</span>
          <span class="dft-refs-count">${refs.length} ${refs.length === 1 ? "Citation" : "Citations"}</span>
        </div>
        <ol class="dft-refs-list">${items}</ol>
      </section>
    `;
  }

  function switchDftLecture(lecId, shouldScroll = true) {
    const lectures = getDftTheoryLectures();
    const found = lectures.find(l => l.id === lecId) || lectures[0];
    if (!found) return;
    _activeLectureId = found.id;
    try { localStorage.setItem(ACTIVE_KEY, found.id); } catch (_) {}

    document.querySelectorAll(".dft-lec-tab").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.lec === found.id);
    });

    const stage = document.getElementById("dft-theory-lecture-stage");
    if (!stage) return;
    const idx = lectures.findIndex(l => l.id === found.id);
    const prevLec = idx > 0 ? lectures[idx - 1] : null;
    const nextLec = idx < lectures.length - 1 ? lectures[idx + 1] : null;

    const objItems = (found.objectives || []).map(o => `<li>${o}</li>`).join("");
    const bodyHtml = typeof found.contentHtml === "string"
      ? found.contentHtml
      : (typeof found.html === "function" ? found.html() : "");
    const refsHtml = buildReferencesHtml(found.references);

    const shareUrl = getDftLectureShareUrl(found.id);
    const hasNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

    const buildShareDropdownHtml = (menuId) => `
      <div id="${menuId}" class="dft-share-menu" role="menu" aria-label="Share this lecture">
        <div class="dft-share-menu-head">Share Lecture ${found.num}</div>
        <div class="dft-share-url-preview" title="Direct URL for this lecture">${escHtml(shareUrl)}</div>
        <button type="button" class="dft-share-item" onclick="copyDftLectureLink('${escHtml(found.id)}')">&#128279; Copy Direct Link</button>
        <button type="button" class="dft-share-item" onclick="copyDftLectureCitation('${escHtml(found.id)}')">&#128203; Copy Academic Citation</button>
        ${hasNativeShare ? `<button type="button" class="dft-share-item" onclick="shareDftLectureVia('native', '${escHtml(found.id)}')">&#128241; Share via Device...</button>` : ""}
        <button type="button" class="dft-share-item" onclick="shareDftLectureVia('email', '${escHtml(found.id)}')">&#9993;&#65039; Share via Email</button>
        <button type="button" class="dft-share-item" onclick="shareDftLectureVia('linkedin', '${escHtml(found.id)}')">&#128188; Share on LinkedIn</button>
        <button type="button" class="dft-share-item" onclick="shareDftLectureVia('x', '${escHtml(found.id)}')">&#120143; Share on X</button>
      </div>
    `;

    stage.innerHTML = `
      <div class="dft-lec-layout">
        <div class="dft-lec-main">
          <article class="dft-lec-article">
            <header class="dft-lec-header">
              <div class="dft-lec-meta-bar">
                <div class="dft-lec-meta-row">
                  <span class="dft-level-badge dft-level-${escHtml(found.levelClass)}">Lecture ${found.num} of ${lectures.length} &bull; ${escHtml(found.level)}</span>
                  <span class="dft-meta-pill">&#9201; ${escHtml(found.readTime)} read</span>
                  <button type="button" class="dft-meta-pill dft-meta-link" onclick="openCastepToolFromLecture('${escHtml(found.toolPane)}')" title="Jump directly to the matching live module in Data Analysis">
                    &#128640; Linked Tool: ${escHtml(found.toolName)} &rarr;
                  </button>
                </div>
                <div class="dft-admin-bar strict-admin-only" role="group" aria-label="Admin Lecture Controls">
                  <button type="button" class="dft-admin-btn dft-admin-edit" onclick="openDftLectureEditorModal('${escHtml(found.id)}')" title="Edit this lecture visually or via HTML/LaTeX code">&#9999;&#65039; Edit Lecture</button>
                  <button type="button" class="dft-admin-btn" onclick="moveDftLecture('${escHtml(found.id)}', -1)" ${idx === 0 ? "disabled" : ""} title="Move lecture earlier in curriculum">&#11013;&#65039;</button>
                  <button type="button" class="dft-admin-btn" onclick="moveDftLecture('${escHtml(found.id)}', 1)" ${idx === lectures.length - 1 ? "disabled" : ""} title="Move lecture later in curriculum">&#10145;&#65039;</button>
                  <button type="button" class="dft-admin-btn dft-admin-del" onclick="deleteDftLecture('${escHtml(found.id)}')" title="Delete this lecture">&#128465;&#65039; Delete</button>
                </div>
              </div>
              <h2 class="dft-lec-title">${found.title}</h2>
              <p class="dft-lec-subtitle">${found.subtitle}</p>
              <div class="dft-byline-bar" aria-label="Lecture authorship, revision date, and share controls">
                <div class="dft-byline-info">
                  <span class="dft-byline-item">&#9997;&#65039; <strong>Compiled by:</strong> ${escHtml(found.author || getDefaultLectureAuthor())}${found.affiliation ? ` <span class="dft-byline-sep">&middot;</span> <em>${escHtml(found.affiliation)}</em>` : ""}</span>
                  <span class="dft-byline-divider">|</span>
                  <span class="dft-byline-item">&#128197; <strong>Last Updated:</strong> ${escHtml(found.updatedAt || DEFAULT_UPDATED_AT)}</span>
                </div>
                <div class="dft-byline-actions">
                  <button type="button" id="dft-copy-link-btn" class="dft-share-pill" onclick="copyDftLectureLink('${escHtml(found.id)}', this)" title="Copy direct shareable URL for Lecture ${found.num}">
                    &#128279; Copy Link
                  </button>
                  <div class="dft-share-wrap">
                    <button type="button" id="dft-share-btn" class="dft-share-pill dft-share-pill-accent" onclick="toggleDftShareMenu(event, '${escHtml(found.id)}', 'dft-share-menu-top')" title="Share Lecture ${found.num}">
                      &#128228; Share &#9662;
                    </button>
                    ${buildShareDropdownHtml("dft-share-menu-top")}
                  </div>
                </div>
              </div>
              ${objItems ? `<div class="dft-obj-box"><div class="dft-obj-title">&#127919; Learning Objectives</div><ul>${objItems}</ul></div>` : ""}
            </header>

            <!-- Collapsible SECTIONS card for Mobile & Tablet (<= 1020px) -->
            <details class="dft-sections-mobile">
              <summary class="dft-sections-mobile-summary">SECTIONS</summary>
              <nav id="dft-sections-mobile-list" class="dft-sections-nav" aria-label="Lecture sections"></nav>
            </details>

            <div class="dft-lec-content">
              ${bodyHtml}
              ${refsHtml}
            </div>

            <footer class="dft-lec-footer">
              ${prevLec
                ? `<button type="button" class="btn btn-outline btn-sm" onclick="switchDftLecture('${escHtml(prevLec.id)}', true)">&larr; Lecture ${prevLec.num}: ${escHtml(prevLec.shortTab.replace(/^L\d+:\s*/, ""))}</button>`
                : `<span></span>`}
              <span style="font-size:11.5px; color:#64748b; font-weight:600;">Lecture ${found.num} / ${lectures.length} &bull; Density Functional Theory Curriculum</span>
              ${nextLec
                ? `<button type="button" class="btn btn-primary btn-sm" onclick="switchDftLecture('${escHtml(nextLec.id)}', true)">Lecture ${nextLec.num}: ${escHtml(nextLec.shortTab.replace(/^L\d+:\s*/, ""))} &rarr;</button>`
                : `<button type="button" class="btn btn-teal btn-sm" onclick="openCastepToolFromLecture('builder')">&#128640; Launch Data Analysis Workbench &rarr;</button>`}
            </footer>
          </article>
        </div>

        <!-- Sticky Nature / Springer-Style SECTIONS Sidebar (Desktop > 1020px) -->
        <aside class="dft-sections-aside" aria-label="Lecture Sections">
          <div class="dft-sections-card">
            <div class="dft-sections-title">SECTIONS</div>
            <nav id="dft-sections-desktop-list" class="dft-sections-nav"></nav>
            <div class="dft-sections-card-foot">
              <button type="button" class="dft-sec-foot-btn" onclick="copyDftLectureLink('${escHtml(found.id)}', this)" title="Copy direct link to this lecture">&#128279; Copy link</button>
              <div class="dft-share-wrap">
                <button type="button" class="dft-sec-foot-btn" onclick="toggleDftShareMenu(event, '${escHtml(found.id)}', 'dft-share-menu-side')" title="Share this lecture">&#128228; Share</button>
                ${buildShareDropdownHtml("dft-share-menu-side")}
              </div>
            </div>
          </div>
        </aside>
      </div>
    `;

    renderDftMathInElement(stage);
    buildLectureSectionsNavigation(stage, found);
    syncUrlWithDftLecture(found.id);

    if (shouldScroll) {
      const container = document.getElementById("tab-dft-theory");
      if (container) {
        const y = container.getBoundingClientRect().top + window.scrollY - 90;
        if (window.scrollY > y + 60) window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
      }
    }
  }
  window.switchDftLecture = switchDftLecture;

  function filterDftLectures(query) {
    const q = (query || "").trim().toLowerCase();
    const lectures = getDftTheoryLectures();
    let firstMatch = null;
    let matchCount = 0;
    document.querySelectorAll(".dft-lec-tab").forEach(btn => {
      const lec = lectures.find(l => l.id === btn.dataset.lec);
      if (!lec) return;
      const refsText = (lec.references || []).map(r => `${r.authors} ${r.title} ${r.venue} ${r.doi}`).join(" ");
      const hay = `${lec.title} ${lec.subtitle} ${lec.keywords} ${lec.toolName} ${lec.level} ${refsText}`.toLowerCase();
      const matched = !q || hay.includes(q);
      btn.classList.toggle("dft-lec-dim", !matched);
      btn.classList.toggle("dft-lec-hit", !!q && matched);
      if (matched) {
        matchCount++;
        if (!firstMatch) firstMatch = lec.id;
      }
    });
    const statusEl = document.getElementById("dft-theory-search-status");
    if (statusEl) {
      statusEl.textContent = q
        ? `${matchCount} / ${lectures.length} matching lectures`
        : `${lectures.length} Lectures (Basic \u2192 Advanced)`;
    }
    if (q && firstMatch && firstMatch !== _activeLectureId) {
      switchDftLecture(firstMatch, false);
    }
  }
  window.filterDftLectures = filterDftLectures;

  function renderDftTheoryTab(lecIdOverride, forceRebuild = false) {
    const lectures = getDftTheoryLectures();
    const tabsBar = document.getElementById("dft-theory-lecture-tabs");
    if (tabsBar && (forceRebuild || !tabsBar.dataset.built)) {
      tabsBar.dataset.built = "1";
      tabsBar.innerHTML = lectures.map(lec => `
        <button type="button" class="dft-lec-tab${lec.id === _activeLectureId ? " active" : ""}" data-lec="${escHtml(lec.id)}" onclick="switchDftLecture('${escHtml(lec.id)}', false)" title="${escHtml(lec.title)}">
          <span class="dft-lec-tab-num">L${lec.num}</span>
          <span class="dft-lec-tab-lbl">${escHtml(lec.shortTab.replace(/^L\d+:\s*/, ""))}</span>
        </button>
      `).join("");
    }
    const statusEl = document.getElementById("dft-theory-search-status");
    const searchInput = document.getElementById("dft-theory-search-input");
    if (statusEl && (!searchInput || !searchInput.value.trim())) {
      statusEl.textContent = `${lectures.length} Lectures (Basic \u2192 Advanced)`;
    }
    let target = lecIdOverride || _activeLectureId;
    if (!lecIdOverride) {
      try {
        const saved = localStorage.getItem(ACTIVE_KEY);
        if (saved && lectures.some(l => l.id === saved)) target = saved;
      } catch (_) {}
    }
    if (!lectures.some(l => l.id === target) && lectures[0]) {
      target = lectures[0].id;
    }
    switchDftLecture(target, false);
    if (searchInput && searchInput.value.trim()) {
      filterDftLectures(searchInput.value);
    }
  }
  window.renderDftTheoryTab = renderDftTheoryTab;

  function initDashboardDftCard() {
    const grid = document.getElementById("dashboard-dft-lectures-pills");
    const lectures = getDftTheoryLectures();
    const subEl = document.getElementById("dashboard-dft-card-sub");
    if (subEl) {
      subEl.innerHTML = `${lectures.length} structured English lectures covering Hohenberg–Kohn/Kohn–Sham, XC functionals, Bloch plane waves, forces, Band/PDOS, Effective Mass &amp; Drude, Optics, &Delta;&rho;, and Spin Matrix—each with MathType/Word-quality equations, peer-reviewed DOI references, and live Data Analysis links.`;
    }
    if (!grid || !lectures.length) return;
    grid.innerHTML = lectures.map(lec => `
      <button type="button" class="dft-dash-pill" onclick="openDftTheoryLecture('${escHtml(lec.id)}')" title="${escHtml(lec.title)}">
        <span class="dft-dash-num">Lecture ${lec.num}</span>
        <span class="dft-dash-name">${escHtml(lec.shortTab.replace(/^L\d+:\s*/, ""))}</span>
      </button>
    `).join("");
  }
  window.initDashboardDftCard = initDashboardDftCard;

  // =========================================================================
  // STRICT-ADMIN DUAL-MODE LECTURE CMS (VISUAL WYSIWYG + SPLIT + CODE)
  // =========================================================================
  function serializeDftVisualToCode(visualEl) {
    if (!visualEl) return "";
    const clone = visualEl.cloneNode(true);
    // Strip editor-only UI overlays
    clone.querySelectorAll("[data-editor-ui='1']").forEach(n => n.remove());
    // Strip transient KaTeX rendered HTML back into crisp semantic data-tex placeholders
    clone.querySelectorAll(".dft-eq-box").forEach(box => {
      box.removeAttribute("contenteditable");
      box.classList.remove("dft-vis-eq-card");
    });
    clone.querySelectorAll(".dft-eq-math[data-tex], .dft-inline-math[data-tex]").forEach(m => {
      const tex = m.getAttribute("data-tex") || "";
      m.removeAttribute("data-katex-rendered");
      m.removeAttribute("contenteditable");
      m.removeAttribute("title");
      m.classList.remove("dft-vis-inline-eq");
      m.textContent = tex;
    });
    return clone.innerHTML.trim();
  }
  window.serializeDftVisualToCode = serializeDftVisualToCode;

  function syncDftCodeToVisual() {
    const ta = document.getElementById("dft-ed-body");
    const vis = document.getElementById("dft-ed-visual");
    if (!ta || !vis) return;
    _syncingEditor = true;
    try {
      vis.innerHTML = ta.value;
      renderDftMathInElement(vis, { editable: true });
    } finally {
      _syncingEditor = false;
    }
  }
  window.syncDftCodeToVisual = syncDftCodeToVisual;

  function syncDftVisualToCodeNow() {
    const ta = document.getElementById("dft-ed-body");
    const vis = document.getElementById("dft-ed-visual");
    if (!ta || !vis) return;
    _syncingEditor = true;
    try {
      ta.value = serializeDftVisualToCode(vis);
    } finally {
      _syncingEditor = false;
    }
  }
  window.syncDftVisualToCodeNow = syncDftVisualToCodeNow;

  function handleDftVisualInput() {
    if (_syncingEditor) return;
    clearTimeout(_visualSyncTimer);
    _visualSyncTimer = setTimeout(() => {
      syncDftVisualToCodeNow();
    }, 110);
  }
  window.handleDftVisualInput = handleDftVisualInput;

  function handleDftCodeInput() {
    if (_syncingEditor) return;
    if (_editorMode === "code") return;
    clearTimeout(_codeSyncTimer);
    _codeSyncTimer = setTimeout(() => {
      syncDftCodeToVisual();
    }, 160);
  }
  window.handleDftCodeInput = handleDftCodeInput;

  function saveDftVisualSelection() {
    const vis = document.getElementById("dft-ed-visual");
    const sel = window.getSelection();
    if (!vis || !sel || sel.rangeCount === 0) return;
    const rng = sel.getRangeAt(0);
    if (vis.contains(rng.commonAncestorContainer)) {
      _savedVisualRange = rng.cloneRange();
    }
  }
  window.saveDftVisualSelection = saveDftVisualSelection;

  function restoreDftVisualSelection() {
    const vis = document.getElementById("dft-ed-visual");
    if (!vis) return false;
    vis.focus();
    if (_savedVisualRange && vis.contains(_savedVisualRange.commonAncestorContainer)) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(_savedVisualRange);
      }
      return true;
    }
    return false;
  }

  function setDftEditorMode(mode) {
    const valid = ["visual", "split", "code"].includes(mode) ? mode : "split";
    // Flush latest changes from whichever pane was active before switching
    if (_editorMode === "visual") {
      syncDftVisualToCodeNow();
    } else if (_editorMode === "code" && valid !== "code") {
      syncDftCodeToVisual();
    }
    _editorMode = valid;
    const workspace = document.getElementById("dft-ed-workspace");
    if (workspace) workspace.setAttribute("data-mode", valid);

    document.querySelectorAll(".dft-ed-mode-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.mode === valid);
    });

    if (valid === "visual" || valid === "split") {
      syncDftCodeToVisual();
    }
  }
  window.setDftEditorMode = setDftEditorMode;

  function execDftVisualCmd(cmd, value = null) {
    if (_editorMode === "code") {
      // Friendly HTML tag wrappers when editing directly in Code-only mode
      const map = {
        bold: ["<strong>", "</strong>"],
        italic: ["<i>", "</i>"],
        underline: ["<u>", "</u>"],
        subscript: ["<sub>", "</sub>"],
        superscript: ["<sup>", "</sup>"],
        insertUnorderedList: ["\n<ul>\n  <li>", "</li>\n</ul>\n"],
        insertOrderedList: ["\n<ol>\n  <li>", "</li>\n</ol>\n"]
      };
      const ta = document.getElementById("dft-ed-body");
      if (ta && map[cmd]) {
        const [pre, post] = map[cmd];
        const s = ta.selectionStart || 0;
        const e = ta.selectionEnd || s;
        const selText = ta.value.slice(s, e) || "text";
        ta.value = ta.value.slice(0, s) + pre + selText + post + ta.value.slice(e);
        ta.selectionStart = s + pre.length;
        ta.selectionEnd = s + pre.length + selText.length;
        ta.focus();
      }
      return;
    }
    restoreDftVisualSelection();
    try {
      document.execCommand(cmd, false, value);
    } catch (_) {}
    saveDftVisualSelection();
    syncDftVisualToCodeNow();
  }
  window.execDftVisualCmd = execDftVisualCmd;

  function execDftVisualBlock(tag) {
    if (!tag) return;
    if (_editorMode === "code") {
      const ta = document.getElementById("dft-ed-body");
      if (!ta) return;
      const t = tag.toLowerCase();
      const s = ta.selectionStart || 0;
      const e = ta.selectionEnd || s;
      const selText = ta.value.slice(s, e) || "Section Heading";
      const ins = `\n<${t}>${selText}</${t}>\n`;
      ta.value = ta.value.slice(0, s) + ins + ta.value.slice(e);
      ta.focus();
      return;
    }
    restoreDftVisualSelection();
    try {
      document.execCommand("formatBlock", false, `<${tag}>`);
    } catch (_) {
      try { document.execCommand("formatBlock", false, tag); } catch (__) {}
    }
    saveDftVisualSelection();
    syncDftVisualToCodeNow();
  }
  window.execDftVisualBlock = execDftVisualBlock;

  function insertDftInlineCode() {
    if (_editorMode === "code") {
      const ta = document.getElementById("dft-ed-body");
      if (!ta) return;
      const s = ta.selectionStart || 0;
      const e = ta.selectionEnd || s;
      const txt = ta.value.slice(s, e) || "keyword";
      ta.value = ta.value.slice(0, s) + `<code>${txt}</code>` + ta.value.slice(e);
      ta.focus();
      return;
    }
    restoreDftVisualSelection();
    const sel = window.getSelection();
    const txt = (sel && sel.toString()) ? sel.toString() : "keyword";
    try {
      document.execCommand("insertHTML", false, `<code>${escHtml(txt)}</code>&nbsp;`);
    } catch (_) {}
    saveDftVisualSelection();
    syncDftVisualToCodeNow();
  }
  window.insertDftInlineCode = insertDftInlineCode;

  function insertHtmlIntoDftEditor(htmlSnippet) {
    if (_editorMode === "code") {
      const ta = document.getElementById("dft-ed-body");
      if (!ta) return;
      const start = ta.selectionStart || ta.value.length;
      const end = ta.selectionEnd || start;
      ta.value = ta.value.slice(0, start) + htmlSnippet + ta.value.slice(end);
      ta.selectionStart = ta.selectionEnd = start + htmlSnippet.length;
      ta.focus();
      return;
    }
    const vis = document.getElementById("dft-ed-visual");
    if (!vis) return;
    const restored = restoreDftVisualSelection();
    if (restored) {
      try {
        document.execCommand("insertHTML", false, htmlSnippet);
      } catch (_) {
        vis.insertAdjacentHTML("beforeend", htmlSnippet);
      }
    } else {
      vis.insertAdjacentHTML("beforeend", htmlSnippet);
    }
    renderDftMathInElement(vis, { editable: true });
    saveDftVisualSelection();
    syncDftVisualToCodeNow();
  }

  function insertDftEditorSnippet(kind) {
    if (kind === "equation") {
      openDftEquationBuilder(null);
      return;
    }
    const lectures = getDftTheoryLectures();
    const lecNum = _editingLectureId
      ? ((lectures.find(l => l.id === _editingLectureId) || {}).num || 1)
      : (lectures.length + 1);
    const snippets = {
      heading: `<h3>${lecNum}.X New Section Title</h3><p>Introduce the theoretical definitions and physical motivation here...</p>`,
      definition: `<div class="dft-callout dft-callout-def"><div class="dft-callout-title">&#128216; Definition &mdash; Key Concept</div><div class="dft-callout-body">Write the formal scientific definition here.</div></div><p></p>`,
      insight: `<div class="dft-callout dft-callout-tip"><div class="dft-callout-title">&#128161; Physical Insight &mdash; Key Takeaway</div><div class="dft-callout-body">Highlight physical intuition or practical DFT caveats here.</div></div><p></p>`,
      table: `<table class="dft-table"><thead><tr><th>Parameter / Symbol</th><th>Physical Meaning</th><th>Typical Range / Units</th></tr></thead><tbody><tr><td><strong>Item 1</strong></td><td>Description</td><td>Value</td></tr><tr><td><strong>Item 2</strong></td><td>Description</td><td>Value</td></tr></tbody></table><p></p>`,
      lab: `<div class="dft-lab-box"><div class="dft-lab-head"><div><div class="dft-lab-eyebrow">HANDS-ON PRACTICE IN DATA ANALYSIS</div><div class="dft-lab-title">&#129514; Practice Exercise Title</div></div><div class="dft-lab-btns"><button type="button" class="btn btn-primary btn-sm" onclick="openCastepToolFromLecture('electronic')">&#128640; Open Tool &rarr;</button></div></div><div class="dft-lab-body"><ol class="dft-steps"><li>Step 1 instruction...</li><li>Step 2 instruction...</li></ol></div></div><p></p>`,
      figure: `<figure class="dft-fig-box"><img src="" alt="Scientific diagram" style="max-width:100%; border-radius:8px;"/><figcaption>Figure: Add descriptive caption here.</figcaption></figure><p></p>`
    };
    const snippet = snippets[kind];
    if (snippet) insertHtmlIntoDftEditor(snippet);
  }
  window.insertDftEditorSnippet = insertDftEditorSnippet;

  function triggerDftFigureImageUpload() {
    const inp = document.getElementById("dft-ed-image-file");
    if (inp) {
      inp.value = "";
      inp.click();
    }
  }
  window.triggerDftFigureImageUpload = triggerDftFigureImageUpload;

  function handleDftFigureImageFile(event) {
    const file = event && event.target && event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const caption = window.prompt("Enter figure caption (optional):", file.name.replace(/\.[^.]+$/, "")) || "";
      const figHtml = `<figure class="dft-fig-box"><img src="${reader.result}" alt="${escAttr(caption || file.name)}" />${caption ? `<figcaption>${escHtml(caption)}</figcaption>` : ""}</figure><p></p>`;
      insertHtmlIntoDftEditor(figHtml);
    };
    reader.readAsDataURL(file);
  }
  window.handleDftFigureImageFile = handleDftFigureImageFile;

  // =========================================================================
  // INTERACTIVE MATHTYPE / LATEX EQUATION BUILDER SUB-DIALOG
  // =========================================================================
  function openDftEquationBuilder(targetNode = null) {
    const modal = document.getElementById("dft-eq-builder-modal");
    if (!modal) return;
    saveDftVisualSelection();
    _eqBuilderTargetNode = targetNode || null;

    const lectures = getDftTheoryLectures();
    const lecNum = _editingLectureId
      ? ((lectures.find(l => l.id === _editingLectureId) || {}).num || 1)
      : (lectures.length + 1);

    const typeSel = document.getElementById("dft-eqb-type");
    const numInp = document.getElementById("dft-eqb-num");
    const texInp = document.getElementById("dft-eqb-tex");
    const noteInp = document.getElementById("dft-eqb-note");
    const titleEl = document.getElementById("dft-eqb-title");

    if (targetNode && targetNode.classList.contains("dft-eq-box")) {
      const mathEl = targetNode.querySelector(".dft-eq-math");
      const numEl = targetNode.querySelector(".dft-eq-num");
      const noteEl = targetNode.querySelector(".dft-eq-note");
      if (typeSel) typeSel.value = "display";
      if (numInp) numInp.value = (targetNode.getAttribute("data-eqnum") || (numEl ? numEl.textContent.replace(/[()]/g, "") : "")).trim();
      if (texInp) texInp.value = (mathEl && mathEl.getAttribute("data-tex")) || "";
      if (noteInp) noteInp.value = noteEl ? noteEl.innerHTML.trim() : "";
      if (titleEl) titleEl.textContent = "\u270f\ufe0f Edit Display Equation (MathType / LaTeX)";
    } else if (targetNode && targetNode.classList.contains("dft-inline-math")) {
      if (typeSel) typeSel.value = "inline";
      if (numInp) numInp.value = "";
      if (texInp) texInp.value = targetNode.getAttribute("data-tex") || "";
      if (noteInp) noteInp.value = "";
      if (titleEl) titleEl.textContent = "\u270f\ufe0f Edit Inline Equation";
    } else {
      const existingCount = document.querySelectorAll("#dft-ed-visual .dft-eq-box").length;
      if (typeSel) typeSel.value = "display";
      if (numInp) numInp.value = `${lecNum}.${existingCount + 1}`;
      if (texInp) texInp.value = String.raw`E(\mathbf{k}) = E_0 + \frac{\hbar^2 k^2}{2m^*}`;
      if (noteInp) noteInp.value = "";
      if (titleEl) titleEl.textContent = "\u2211 Insert Publication Equation (Word / MathType / LaTeX)";
    }

    updateDftEqBuilderPreview();
    modal.style.display = "flex";
    setTimeout(() => { if (texInp) texInp.focus(); }, 40);
  }
  window.openDftEquationBuilder = openDftEquationBuilder;

  function openDftEquationBuilderForVisualNode(node) {
    if (!node) return;
    openDftEquationBuilder(node);
  }
  window.openDftEquationBuilderForVisualNode = openDftEquationBuilderForVisualNode;

  function removeDftVisualEquationNode(node) {
    if (!node) return;
    node.remove();
    syncDftVisualToCodeNow();
  }
  window.removeDftVisualEquationNode = removeDftVisualEquationNode;

  function closeDftEquationBuilder() {
    const modal = document.getElementById("dft-eq-builder-modal");
    if (modal) modal.style.display = "none";
    _eqBuilderTargetNode = null;
  }
  window.closeDftEquationBuilder = closeDftEquationBuilder;

  function insertTexTokenIntoEqBuilder(token, cursorBack = 0) {
    const ta = document.getElementById("dft-eqb-tex");
    if (!ta) return;
    const s = ta.selectionStart || 0;
    const e = ta.selectionEnd || s;
    ta.value = ta.value.slice(0, s) + token + ta.value.slice(e);
    const pos = s + token.length - cursorBack;
    ta.selectionStart = ta.selectionEnd = Math.max(0, pos);
    ta.focus();
    updateDftEqBuilderPreview();
  }
  window.insertTexTokenIntoEqBuilder = insertTexTokenIntoEqBuilder;

  function applyDftEqTemplate(tex, note = "") {
    const texInp = document.getElementById("dft-eqb-tex");
    const noteInp = document.getElementById("dft-eqb-note");
    if (texInp) texInp.value = tex;
    if (noteInp && note) noteInp.value = note;
    updateDftEqBuilderPreview();
  }
  window.applyDftEqTemplate = applyDftEqTemplate;

  function updateDftEqBuilderPreview() {
    const typeSel = document.getElementById("dft-eqb-type");
    const numInp = document.getElementById("dft-eqb-num");
    const texInp = document.getElementById("dft-eqb-tex");
    const prevMath = document.getElementById("dft-eqb-preview-math");
    const prevNum = document.getElementById("dft-eqb-preview-num");
    const numWrap = document.getElementById("dft-eqb-num-group");
    const noteWrap = document.getElementById("dft-eqb-note-group");
    if (!prevMath || !texInp) return;

    const isDisplay = !typeSel || typeSel.value !== "inline";
    if (numWrap) numWrap.style.display = isDisplay ? "" : "none";
    if (noteWrap) noteWrap.style.display = isDisplay ? "" : "none";
    if (prevNum) {
      prevNum.style.display = isDisplay && numInp && numInp.value.trim() ? "" : "none";
      prevNum.textContent = numInp && numInp.value.trim() ? `(${numInp.value.trim()})` : "";
    }

    const tex = texInp.value.trim() || "\\;";
    prevMath.setAttribute("data-tex", tex);
    renderSingleKatexNode(prevMath, isDisplay);
  }
  window.updateDftEqBuilderPreview = updateDftEqBuilderPreview;

  function confirmDftEquationBuilder() {
    const typeVal = document.getElementById("dft-eqb-type")?.value || "display";
    const eqNum = (document.getElementById("dft-eqb-num")?.value || "").trim();
    const tex = (document.getElementById("dft-eqb-tex")?.value || "").trim();
    const note = (document.getElementById("dft-eqb-note")?.value || "").trim();
    if (!tex) {
      notifyUser("Please enter a LaTeX equation expression.", "error");
      return;
    }

    if (_eqBuilderTargetNode) {
      if (_eqBuilderTargetNode.classList.contains("dft-eq-box")) {
        _eqBuilderTargetNode.setAttribute("data-eqnum", eqNum);
        const mathEl = _eqBuilderTargetNode.querySelector(".dft-eq-math");
        if (mathEl) {
          mathEl.setAttribute("data-tex", tex);
          renderSingleKatexNode(mathEl, true);
        }
        const numEl = _eqBuilderTargetNode.querySelector(".dft-eq-num");
        if (numEl) numEl.textContent = eqNum ? `(${eqNum})` : "";
        let noteEl = _eqBuilderTargetNode.querySelector(".dft-eq-note");
        if (note) {
          if (!noteEl) {
            noteEl = document.createElement("div");
            noteEl.className = "dft-eq-note";
            _eqBuilderTargetNode.insertBefore(noteEl, _eqBuilderTargetNode.querySelector(".dft-vis-eq-actions"));
          }
          noteEl.innerHTML = note;
        } else if (noteEl) {
          noteEl.remove();
        }
      } else if (_eqBuilderTargetNode.classList.contains("dft-inline-math")) {
        _eqBuilderTargetNode.setAttribute("data-tex", tex);
        renderSingleKatexNode(_eqBuilderTargetNode, false);
      }
      closeDftEquationBuilder();
      syncDftVisualToCodeNow();
      return;
    }

    const htmlOut = typeVal === "inline"
      ? `<span class="dft-inline-math" data-tex="${escAttr(tex)}">${escHtml(tex)}</span>&nbsp;`
      : `<div class="dft-eq-box" data-eqnum="${escAttr(eqNum)}"><div class="dft-eq-inner"><div class="dft-eq-math" data-tex="${escAttr(tex)}">${escHtml(tex)}</div><div class="dft-eq-num">${eqNum ? `(${escHtml(eqNum)})` : ""}</div></div>${note ? `<div class="dft-eq-note">${note}</div>` : ""}</div><p></p>`;

    closeDftEquationBuilder();
    insertHtmlIntoDftEditor(htmlOut);
  }
  window.confirmDftEquationBuilder = confirmDftEquationBuilder;

  // =========================================================================
  // AUTO-FETCH DOI REFERENCES (CROSSREF + OPENALEX) & MAIN MODAL LIFECYCLE
  // =========================================================================
  function cleanDoiString(raw) {
    return String(raw || "")
      .trim()
      .replace(/^https?:\/\/(dx\.)?doi\.org\//i, "")
      .replace(/^doi:\s*/i, "")
      .replace(/[.,;)\]]+$/, "")
      .trim();
  }

  function formatAuthorsFromCrossref(authorsArr) {
    if (!Array.isArray(authorsArr) || !authorsArr.length) return "";
    const formatted = authorsArr.map(a => {
      const family = String(a.family || "").trim();
      const given = String(a.given || "").trim();
      if (!family && !given) return String(a.name || "").trim();
      if (!given) return family;
      const initials = given
        .split(/[\s-]+/)
        .filter(Boolean)
        .map(p => (p[0] ? `${p[0].toUpperCase()}.` : ""))
        .join(" ");
      return `${initials} ${family}`.trim();
    }).filter(Boolean);
    if (!formatted.length) return "";
    if (formatted.length === 1) return formatted[0];
    if (formatted.length > 6) return `${formatted[0]} et al.`;
    return `${formatted.slice(0, -1).join(", ")} & ${formatted[formatted.length - 1]}`;
  }

  function formatAuthorsFromOpenAlex(authorships) {
    if (!Array.isArray(authorships) || !authorships.length) return "";
    const formatted = authorships.map(a => {
      const nm = String(a?.author?.display_name || "").trim();
      if (!nm) return "";
      const parts = nm.split(/\s+/).filter(Boolean);
      if (parts.length <= 1) return nm;
      const last = parts.pop();
      const inits = parts.map(p => `${p[0].toUpperCase()}.`).join(" ");
      return `${inits} ${last}`;
    }).filter(Boolean);
    if (!formatted.length) return "";
    if (formatted.length === 1) return formatted[0];
    if (formatted.length > 6) return `${formatted[0]} et al.`;
    return `${formatted.slice(0, -1).join(", ")} & ${formatted[formatted.length - 1]}`;
  }

  async function fetchCitationMetadataByDoi(rawDoi) {
    const doi = cleanDoiString(rawDoi);
    if (!doi || !/^10\.\d{4,9}\/\S+$/i.test(doi)) {
      throw new Error(`Invalid DOI format: "${rawDoi}"`);
    }

    // 1. Primary: Crossref REST API
    try {
      const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}?mailto=lamvt.skku@gmail.com`);
      if (res.ok) {
        const json = await res.json();
        const m = json && json.message;
        if (m) {
          const authors = formatAuthorsFromCrossref(m.author) || formatAuthorsFromCrossref(m.editor) || "Unknown Author";
          const rawTitle = Array.isArray(m.title) ? m.title[0] : (m.title || "");
          const title = String(rawTitle).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
          const journal = (Array.isArray(m["short-container-title"]) && m["short-container-title"][0])
            || (Array.isArray(m["container-title"]) && m["container-title"][0])
            || m.publisher || "";
          const vol = m.volume ? ` ${m.volume}` : "";
          const pageOrArt = m.page || m["article-number"] || "";
          const pages = pageOrArt ? `, ${String(pageOrArt).replace(/-/g, "\u2013")}` : "";
          const venue = `${String(journal).trim()}${vol}${pages}`.trim();
          const dateParts = (m["published-print"] && m["published-print"]["date-parts"])
            || (m["published-online"] && m["published-online"]["date-parts"])
            || (m.issued && m.issued["date-parts"])
            || (m.created && m.created["date-parts"]);
          const year = dateParts && dateParts[0] && dateParts[0][0] ? String(dateParts[0][0]) : "";
          if (title) {
            return { authors, title, venue, year, doi: cleanDoiString(m.DOI || doi) };
          }
        }
      }
    } catch (_) {}

    // 2. Fallback: OpenAlex Works API
    const oaRes = await fetch(`https://api.openalex.org/works/https://doi.org/${encodeURIComponent(doi)}?mailto=lamvt.skku@gmail.com`);
    if (oaRes.ok) {
      const w = await oaRes.json();
      const authors = formatAuthorsFromOpenAlex(w.authorships) || "Unknown Author";
      const title = String(w.display_name || w.title || "").replace(/<[^>]+>/g, "").trim();
      const srcName = w?.primary_location?.source?.display_name || "";
      const vol = w?.biblio?.volume ? ` ${w.biblio.volume}` : "";
      const fp = w?.biblio?.first_page || "";
      const lp = w?.biblio?.last_page || "";
      const pages = fp ? (lp && lp !== fp ? `, ${fp}\u2013${lp}` : `, ${fp}`) : "";
      const venue = `${srcName}${vol}${pages}`.trim();
      const year = w.publication_year ? String(w.publication_year) : "";
      if (title) {
        return { authors, title, venue, year, doi: cleanDoiString(w.doi || doi) };
      }
    }

    throw new Error(`DOI not found in Crossref or OpenAlex: ${doi}`);
  }
  window.fetchCitationMetadataByDoi = fetchCitationMetadataByDoi;

  function updateRefCardPreview(cardEl) {
    if (!cardEl) return;
    const authors = (cardEl.querySelector(".dft-ref-authors")?.value || "").trim() || "Untitled Author";
    const title = (cardEl.querySelector(".dft-ref-title")?.value || "").trim() || "Untitled Reference";
    const venue = (cardEl.querySelector(".dft-ref-venue")?.value || "").trim();
    const year = (cardEl.querySelector(".dft-ref-year")?.value || "").trim();
    const doi = cleanDoiString(cardEl.querySelector(".dft-ref-doi")?.value || "");
    const summaryEl = cardEl.querySelector(".dft-ref-card-summary");
    if (summaryEl) {
      const doiHtml = doi
        ? ` <a class="dft-doi-pill" href="https://doi.org/${encodeURI(doi)}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">DOI: ${escHtml(doi)} &#8599;</a>`
        : "";
      summaryEl.innerHTML = `<strong>${escHtml(authors)}</strong>, &ldquo;${escHtml(title)},&rdquo;${venue ? ` <em>${escHtml(venue)}</em>` : ""}${year ? ` (${escHtml(year)}).` : "."}${doiHtml}`;
    }
  }
  window.updateRefCardPreview = updateRefCardPreview;

  function renumberDftRefCards() {
    document.querySelectorAll("#dft-ed-refs-list .dft-ref-edit-card").forEach((c, i) => {
      const badge = c.querySelector(".dft-ref-card-num");
      if (badge) badge.textContent = `[${i + 1}]`;
    });
  }

  function buildRefEditorCardHtml(ref = {}, startExpanded = false) {
    const authors = String(ref.authors || "").trim();
    const title = String(ref.title || "").trim();
    const venue = String(ref.venue || "").trim();
    const year = String(ref.year || "").trim();
    const doi = cleanDoiString(ref.doi || "");
    const doiHtml = doi
      ? ` <a class="dft-doi-pill" href="https://doi.org/${encodeURI(doi)}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">DOI: ${escHtml(doi)} &#8599;</a>`
      : "";
    const summaryHtml = (authors || title)
      ? `<strong>${escHtml(authors || "Author")}</strong>, &ldquo;${escHtml(title || "Title")},&rdquo;${venue ? ` <em>${escHtml(venue)}</em>` : ""}${year ? ` (${escHtml(year)}).` : "."}${doiHtml}`
      : `<span style="color:#64748b; font-style:italic;">New manual reference &mdash; fill details below...</span>`;

    return `
      <div class="dft-ref-edit-card${startExpanded ? " is-open" : ""}">
        <div class="dft-ref-card-top">
          <span class="dft-ref-card-num">[1]</span>
          <div class="dft-ref-card-summary">${summaryHtml}</div>
          <div class="dft-ref-card-actions">
            <button type="button" class="dft-ref-mini-btn" onclick="this.closest('.dft-ref-edit-card').classList.toggle('is-open')" title="Edit citation fields">&#9999;&#65039;</button>
            <button type="button" class="dft-ref-mini-btn" onclick="moveDftRefCard(this.closest('.dft-ref-edit-card'), -1)" title="Move up">&#8593;</button>
            <button type="button" class="dft-ref-mini-btn" onclick="moveDftRefCard(this.closest('.dft-ref-edit-card'), 1)" title="Move down">&#8595;</button>
            <button type="button" class="dft-ref-rm-btn" onclick="const c=this.closest('.dft-ref-edit-card'); c.remove(); renumberDftRefCards();" title="Remove reference">&times;</button>
          </div>
        </div>
        <div class="dft-ref-edit-fields">
          <input type="text" class="form-input dft-ref-authors" placeholder="Authors (e.g. P. Hohenberg &amp; W. Kohn)" value="${escHtml(authors)}" oninput="updateRefCardPreview(this.closest('.dft-ref-edit-card'))" />
          <input type="text" class="form-input dft-ref-title" placeholder="Paper or Textbook Title" value="${escHtml(title)}" oninput="updateRefCardPreview(this.closest('.dft-ref-edit-card'))" />
          <input type="text" class="form-input dft-ref-venue" placeholder="Journal / Publisher, Vol, Pages" value="${escHtml(venue)}" oninput="updateRefCardPreview(this.closest('.dft-ref-edit-card'))" />
          <input type="text" class="form-input dft-ref-year" placeholder="Year" value="${escHtml(year)}" oninput="updateRefCardPreview(this.closest('.dft-ref-edit-card'))" />
          <input type="text" class="form-input dft-ref-doi" placeholder="DOI (e.g. 10.1103/PhysRev.136.B864)" value="${escHtml(doi)}" oninput="updateRefCardPreview(this.closest('.dft-ref-edit-card'))" />
        </div>
      </div>
    `;
  }

  function moveDftRefCard(cardEl, delta) {
    if (!cardEl || !cardEl.parentElement) return;
    const parent = cardEl.parentElement;
    if (delta < 0 && cardEl.previousElementSibling) {
      parent.insertBefore(cardEl, cardEl.previousElementSibling);
    } else if (delta > 0 && cardEl.nextElementSibling) {
      parent.insertBefore(cardEl.nextElementSibling, cardEl);
    }
    renumberDftRefCards();
  }
  window.moveDftRefCard = moveDftRefCard;
  window.renumberDftRefCards = renumberDftRefCards;

  function addDftRefRow(ref = {}, startExpanded = false) {
    const listEl = document.getElementById("dft-ed-refs-list");
    if (!listEl) return;
    const wrap = document.createElement("div");
    wrap.innerHTML = buildRefEditorCardHtml(ref, startExpanded).trim();
    if (wrap.firstElementChild) {
      listEl.appendChild(wrap.firstElementChild);
      renumberDftRefCards();
    }
  }
  window.addDftRefRow = addDftRefRow;

  async function fetchAndAddDftRefFromDoi() {
    const inp = document.getElementById("dft-ed-doi-quick-input");
    const btn = document.getElementById("dft-ed-doi-fetch-btn");
    const statusEl = document.getElementById("dft-ed-doi-status");
    if (!inp) return;
    const raw = inp.value.trim();
    if (!raw) {
      notifyUser("Paste one or more DOIs (e.g. 10.1103/PhysRevLett.77.3865).", "error");
      inp.focus();
      return;
    }

    const tokens = raw.split(/[\n,;]+/).map(cleanDoiString).filter(Boolean);
    if (!tokens.length) return;

    // Collect existing DOIs to prevent duplicates
    const existingDois = new Set(
      [...document.querySelectorAll("#dft-ed-refs-list .dft-ref-doi")]
        .map(el => cleanDoiString(el.value).toLowerCase())
        .filter(Boolean)
    );

    const origBtnText = btn ? btn.innerHTML : "";
    if (btn) { btn.disabled = true; btn.innerHTML = "&#8987; Fetching DOI..."; }
    if (statusEl) { statusEl.textContent = `Fetching metadata for ${tokens.length} DOI(s)...`; statusEl.className = "dft-doi-status is-loading"; }

    let added = 0;
    let skipped = 0;
    const failed = [];

    for (const doi of tokens) {
      if (existingDois.has(doi.toLowerCase())) {
        skipped++;
        continue;
      }
      try {
        const meta = await fetchCitationMetadataByDoi(doi);
        addDftRefRow(meta, false);
        existingDois.add(meta.doi.toLowerCase());
        added++;
      } catch (err) {
        failed.push(doi);
      }
    }

    if (btn) { btn.disabled = false; btn.innerHTML = origBtnText; }
    if (added > 0 && failed.length === 0) {
      inp.value = "";
      const msg = skipped > 0
        ? `Added ${added} reference(s) from DOI (${skipped} duplicate skipped).`
        : `Added ${added} peer-reviewed reference(s) automatically from DOI!`;
      if (statusEl) { statusEl.textContent = `\u2714 ${msg}`; statusEl.className = "dft-doi-status is-ok"; }
      notifyUser(msg, "success");
    } else if (added > 0 && failed.length > 0) {
      inp.value = failed.join(", ");
      const msg = `Added ${added} reference(s); failed to resolve: ${failed.join(", ")}`;
      if (statusEl) { statusEl.textContent = msg; statusEl.className = "dft-doi-status is-err"; }
      notifyUser(msg, "warning");
    } else if (skipped > 0 && failed.length === 0) {
      inp.value = "";
      const msg = `DOI already exists in this lecture's reference list (${skipped} skipped).`;
      if (statusEl) { statusEl.textContent = msg; statusEl.className = "dft-doi-status is-ok"; }
      notifyUser(msg, "info");
    } else {
      const msg = `Could not resolve DOI: ${failed.join(", ")}. Check format or use "+ Add Manual".`;
      if (statusEl) { statusEl.textContent = msg; statusEl.className = "dft-doi-status is-err"; }
      notifyUser(msg, "error");
    }
  }
  window.fetchAndAddDftRefFromDoi = fetchAndAddDftRefFromDoi;

  function openDftLectureEditorModal(lecIdOrNull) {
    if (!isAdminAuthorized()) {
      notifyUser("Administrator privileges required to add or edit DFT lectures.", "error");
      return;
    }
    const modal = document.getElementById("dft-lecture-editor-modal");
    if (!modal) return;
    const lectures = getDftTheoryLectures();
    const existing = lecIdOrNull ? lectures.find(l => l.id === lecIdOrNull) : null;
    _editingLectureId = existing ? existing.id : null;

    const nextNum = existing ? existing.num : lectures.length + 1;
    const headingEl = document.getElementById("dft-ed-modal-title");
    if (headingEl) {
      headingEl.textContent = existing
        ? `\u270f\ufe0f Edit Lecture ${existing.num}: ${existing.shortTab.replace(/^L\d+:\s*/, "")}`
        : `\u2795 Add New DFT Lecture (Lecture ${nextNum})`;
    }

    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    setVal("dft-ed-title", existing ? existing.title : `Lecture ${nextNum}: `);
    setVal("dft-ed-shorttab", existing ? existing.shortTab.replace(/^L\d+:\s*/, "") : "");
    setVal("dft-ed-level", existing ? existing.level : "Advanced");
    setVal("dft-ed-levelclass", existing ? existing.levelClass : "adv");
    setVal("dft-ed-readtime", existing ? existing.readTime : "15 min");
    setVal("dft-ed-toolpane", existing ? existing.toolPane : "electronic");
    setVal("dft-ed-author", existing ? (existing.author || getDefaultLectureAuthor()) : getDefaultLectureAuthor());
    setVal("dft-ed-affiliation", existing ? (existing.affiliation || getDefaultLectureAffiliation()) : getDefaultLectureAffiliation());
    setVal("dft-ed-subtitle", existing ? existing.subtitle : "");
    setVal("dft-ed-keywords", existing ? existing.keywords : "");
    setVal("dft-ed-objectives", existing ? (existing.objectives || []).join("\n") : "");
    setVal("dft-ed-doi-quick-input", "");
    const doiStat = document.getElementById("dft-ed-doi-status");
    if (doiStat) { doiStat.textContent = ""; doiStat.className = "dft-doi-status"; }

    setVal("dft-ed-body", existing
      ? existing.contentHtml
      : `<h3>${nextNum}.1 Core Physical Principles</h3>\n<p>Introduce the theoretical definitions and physical motivation here...</p>\n\n<div class="dft-eq-box" data-eqnum="${nextNum}.1"><div class="dft-eq-inner"><div class="dft-eq-math" data-tex="E(\\mathbf{k}) = E_0 + \\frac{\\hbar^2 k^2}{2m^*}">E(\\mathbf{k}) = E_0 + \\frac{\\hbar^2 k^2}{2m^*}</div><div class="dft-eq-num">(${nextNum}.1)</div></div><div class="dft-eq-note">Add physical explanation of symbols and units here.</div></div>\n\n<h3>${nextNum}.2 Practical Application in Data Analysis</h3>\n<p>Describe how researchers apply this concept on real CASTEP calculations.</p>`
    );

    const refsListEl = document.getElementById("dft-ed-refs-list");
    if (refsListEl) {
      refsListEl.innerHTML = "";
      const refs = existing && Array.isArray(existing.references) ? existing.references : [];
      refs.forEach(r => addDftRefRow(r, false));
    }

    const vis = document.getElementById("dft-ed-visual");
    if (vis && !vis.dataset.dblBound) {
      vis.dataset.dblBound = "1";
      vis.addEventListener("dblclick", (ev) => {
        const eqBox = ev.target.closest(".dft-eq-box");
        if (eqBox) {
          ev.preventDefault();
          openDftEquationBuilder(eqBox);
          return;
        }
        const inl = ev.target.closest(".dft-inline-math[data-tex]");
        if (inl) {
          ev.preventDefault();
          openDftEquationBuilder(inl);
        }
      });
    }

    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
    _editorMode = "code";
    setDftEditorMode("split");

    setTimeout(() => {
      const titleInput = document.getElementById("dft-ed-title");
      if (titleInput) titleInput.focus();
    }, 60);
  }
  window.openDftLectureEditorModal = openDftLectureEditorModal;

  function closeDftLectureEditorModal() {
    const modal = document.getElementById("dft-lecture-editor-modal");
    if (modal) modal.style.display = "none";
    document.body.style.overflow = "";
    _editingLectureId = null;
  }
  window.closeDftLectureEditorModal = closeDftLectureEditorModal;

  function collectRefsFromEditorModal() {
    const cards = document.querySelectorAll("#dft-ed-refs-list .dft-ref-edit-card");
    const refs = [];
    cards.forEach(card => {
      const authors = (card.querySelector(".dft-ref-authors")?.value || "").trim();
      const title = (card.querySelector(".dft-ref-title")?.value || "").trim();
      const venue = (card.querySelector(".dft-ref-venue")?.value || "").trim();
      const year = (card.querySelector(".dft-ref-year")?.value || "").trim();
      const doi = cleanDoiString(card.querySelector(".dft-ref-doi")?.value || "");
      if (authors || title) {
        refs.push({ authors, title, venue, year, doi });
      }
    });
    return refs;
  }

  function saveDftLectureFromModal() {
    if (!isAdminAuthorized()) {
      notifyUser("Administrator privileges required to save DFT lectures.", "error");
      return;
    }
    if (_editorMode === "visual") {
      syncDftVisualToCodeNow();
    }
    const getVal = (id) => (document.getElementById(id)?.value || "").trim();
    const title = getVal("dft-ed-title");
    const shortRaw = getVal("dft-ed-shorttab");
    const bodyHtml = document.getElementById("dft-ed-body")?.value || "";
    if (!title) {
      notifyUser("Please enter a Lecture Title.", "error");
      return;
    }
    const lectures = cloneJson(getDftTheoryLectures());
    const toolPane = getVal("dft-ed-toolpane") || "electronic";
    const objectives = (document.getElementById("dft-ed-objectives")?.value || "")
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(Boolean);
    const references = collectRefsFromEditorModal();
    const author = getVal("dft-ed-author") || getDefaultLectureAuthor();
    const affiliation = getVal("dft-ed-affiliation") || getDefaultLectureAffiliation();
    const updatedAt = formatEnglishDate(new Date());

    let savedId = _editingLectureId;
    if (_editingLectureId) {
      const idx = lectures.findIndex(l => l.id === _editingLectureId);
      if (idx >= 0) {
        const num = idx + 1;
        lectures[idx] = {
          ...lectures[idx],
          title,
          shortTab: `L${num}: ${shortRaw || title.replace(/^Lecture\s*\d+:\s*/i, "").slice(0, 22)}`,
          level: getVal("dft-ed-level") || "Intermediate",
          levelClass: getVal("dft-ed-levelclass") || "interm",
          readTime: getVal("dft-ed-readtime") || "15 min",
          toolPane,
          toolName: TOOL_META_MAP[toolPane] || "Data Analysis",
          author,
          affiliation,
          updatedAt,
          subtitle: getVal("dft-ed-subtitle"),
          keywords: getVal("dft-ed-keywords"),
          objectives,
          contentHtml: bodyHtml,
          references
        };
      }
    } else {
      const num = lectures.length + 1;
      savedId = `lec_${Date.now()}`;
      lectures.push({
        id: savedId,
        num,
        shortTab: `L${num}: ${shortRaw || title.replace(/^Lecture\s*\d+:\s*/i, "").slice(0, 22)}`,
        level: getVal("dft-ed-level") || "Advanced",
        levelClass: getVal("dft-ed-levelclass") || "adv",
        readTime: getVal("dft-ed-readtime") || "15 min",
        toolPane,
        toolName: TOOL_META_MAP[toolPane] || "Data Analysis",
        author,
        affiliation,
        updatedAt,
        title,
        subtitle: getVal("dft-ed-subtitle"),
        keywords: getVal("dft-ed-keywords"),
        objectives,
        contentHtml: bodyHtml,
        references
      });
    }

    const wasEdit = Boolean(_editingLectureId);
    closeDftLectureEditorModal();
    saveDftTheoryLectures(lectures, { focusId: savedId });
    notifyUser(wasEdit ? `Lecture updated (${updatedAt}).` : `Added new Lecture (${lectures.length} total).`, "success");
  }
  window.saveDftLectureFromModal = saveDftLectureFromModal;

  function moveDftLecture(lecId, delta) {
    if (!isAdminAuthorized()) {
      notifyUser("Administrator privileges required to reorder lectures.", "error");
      return;
    }
    const lectures = cloneJson(getDftTheoryLectures());
    const idx = lectures.findIndex(l => l.id === lecId);
    const targetIdx = idx + delta;
    if (idx < 0 || targetIdx < 0 || targetIdx >= lectures.length) return;
    const [item] = lectures.splice(idx, 1);
    lectures.splice(targetIdx, 0, item);
    saveDftTheoryLectures(lectures, { focusId: lecId });
    notifyUser(`Moved lecture to position ${targetIdx + 1}.`, "success");
  }
  window.moveDftLecture = moveDftLecture;

  function deleteDftLecture(lecId) {
    if (!isAdminAuthorized()) {
      notifyUser("Administrator privileges required to delete lectures.", "error");
      return;
    }
    const lectures = cloneJson(getDftTheoryLectures());
    if (lectures.length <= 1) {
      notifyUser("At least one lecture must remain in the curriculum.", "error");
      return;
    }
    const idx = lectures.findIndex(l => l.id === lecId);
    if (idx < 0) return;
    const lec = lectures[idx];
    if (!window.confirm(`Delete "${lec.title}" from the DFT Theory curriculum?`)) return;
    lectures.splice(idx, 1);
    const nextFocus = (lectures[Math.min(idx, lectures.length - 1)] || lectures[0]).id;
    saveDftTheoryLectures(lectures, { focusId: nextFocus });
    notifyUser(`Deleted "${lec.shortTab}" (${lectures.length} lectures remaining).`, "success");
  }
  window.deleteDftLecture = deleteDftLecture;

  function resetDftLecturesToDefault() {
    if (!isAdminAuthorized()) {
      notifyUser("Administrator privileges required to reset built-in lectures.", "error");
      return;
    }
    if (!window.confirm("Restore all 10 built-in DFT Theory lectures and peer-reviewed references? Any custom edits or added lectures will be replaced.")) {
      return;
    }
    const defaults = cloneJson(DEFAULT_LECTURES);
    saveDftTheoryLectures(defaults, { focusId: "lec1" });
    notifyUser("Restored all 10 built-in DFT lectures.", "success");
  }
  window.resetDftLecturesToDefault = resetDftLecturesToDefault;

  function initDftTheoryModule() {
    initDashboardDftCard();
    // Auto-open specific lecture if direct URL (?lecture=lec6) was visited
    setTimeout(() => {
      checkAndHandleDftLectureDeepLink();
    }, 60);
  }

  window.addEventListener("popstate", () => {
    checkAndHandleDftLectureDeepLink();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDftTheoryModule);
  } else {
    initDftTheoryModule();
  }
})();
