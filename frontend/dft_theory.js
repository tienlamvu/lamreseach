/* ============================================================================
   DFT Theory Curriculum Module — Comprehensive 10-Lecture Graduate Guide
   From Quantum Many-Body Foundations to First-Principles CASTEP Data Analysis
   100% Self-Contained Publication Math Typography & Inline Vector Diagrams
   ============================================================================ */

(function () {
  // Compact publication math typography helpers (Cambria Math / Times New Roman)
  const fr = (num, den) =>
    `<span class="dft-frac"><span class="dft-num">${num}</span><span class="dft-den">${den}</span></span>`;
  const vec = (s) => `<span class="dft-vec">${s}</span>`;
  const hat = (s) => `<span class="dft-hat">${s}</span>`;
  const opSum = (sub, sup = "") =>
    `<span class="dft-bigop"><span class="dft-op-sup">${sup}</span><span class="dft-op-sym">&sum;</span><span class="dft-op-sub">${sub}</span></span>`;
  const opInt = (sub = "", sup = "") =>
    `<span class="dft-bigop"><span class="dft-op-sup">${sup}</span><span class="dft-op-sym">&int;</span><span class="dft-op-sub">${sub}</span></span>`;
  const eq = (expr, num, note = "") =>
    `<div class="dft-eq-box"><div class="dft-eq-inner"><div class="dft-eq-math">${expr}</div><div class="dft-eq-num">(${num})</div></div>${note ? `<div class="dft-eq-note">${note}</div>` : ""}</div>`;
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

  window.DFT_THEORY_LECTURES = [
    // =========================================================================
    // LECTURE 1: QUANTUM MANY-BODY PROBLEM & FOUNDATIONS OF DFT
    // =========================================================================
    {
      id: "lec1",
      num: 1,
      shortTab: "L1: Quantum & HK/KS",
      level: "Foundation",
      levelClass: "basic",
      readTime: "15 min",
      toolPane: "convergence",
      toolName: "Conv. & Files",
      title: "Lecture 1: Quantum Many-Body Problem, Hohenberg–Kohn Theorems & Kohn–Sham DFT",
      subtitle: "From the exact 3N-dimensional Schrödinger equation to the self-consistent Kohn–Sham orbital formalism powering modern ab initio calculations.",
      keywords: "schrodinger born oppenheimer many-body hohenberg kohn variational kohn-sham scf self-consistent field hartree density functional convergence",
      objectives: [
        "Understand why solving the interacting many-electron Schrödinger equation directly is exponentially intractable.",
        "Derive the Born–Oppenheimer adiabatic separation between nuclear and electronic motion.",
        "Master the two Hohenberg–Kohn theorems establishing the electron density n(r) as the fundamental ground-state variable.",
        "Formulate the Kohn–Sham auxiliary equations and trace every step of the Self-Consistent Field (SCF) loop."
      ],
      html: () => `
        <h3>1.1 The Many-Body Problem &amp; Born–Oppenheimer Approximation</h3>
        <p>Every equilibrium and dynamical property of a crystal, surface, or molecule—its lattice constants, electronic band gap, magnetism, optical spectrum, and catalytic activity—is governed by the non-relativistic time-independent <strong>many-body Schrödinger equation</strong> for <i>N</i> electrons at coordinates {${vec('r')}<sub><i>i</i></sub>} and <i>M</i> nuclei of charges <i>Z<sub>I</sub></i> and masses <i>M<sub>I</sub></i> at positions {${vec('R')}<sub><i>I</i></sub>}:</p>
        ${eq(`${hat('H')} &Psi;({${vec('r')}<sub><i>i</i></sub>}, {${vec('R')}<sub><i>I</i></sub>}) = <i>E</i> &Psi;({${vec('r')}<sub><i>i</i></sub>}, {${vec('R')}<sub><i>I</i></sub>})`, "1.1")}
        <p>In atomic units (&#8463; = <i>m</i><sub>e</sub> = <i>e</i> = 4&pi;&epsilon;<sub>0</sub> = 1, where lengths are in Bohr <i>a</i><sub>0</sub> = 0.52918 &Aring; and energies in Hartree 1 Ha = 27.2114 eV), the exact molecular/crystalline Hamiltonian contains five distinct physical terms:</p>
        ${eq(`${hat('H')} = &minus;${fr("1", "2")} ${opSum("<i>i</i>=1", "<i>N</i>")} &nabla;<sub><i>i</i></sub><sup>2</sup> &minus; ${opSum("<i>I</i>=1", "<i>M</i>")} ${fr("1", "2<i>M<sub>I</sub></i>")} &nabla;<sub><i>I</i></sub><sup>2</sup> &minus; ${opSum("<i>i</i>,<i>I</i>")} ${fr("<i>Z<sub>I</sub></i>", `|${vec('r')}<sub><i>i</i></sub> &minus; ${vec('R')}<sub><i>I</i></sub>|`)} + ${fr("1", "2")} ${opSum("<i>i</i>&ne;<i>j</i>")} ${fr("1", `|${vec('r')}<sub><i>i</i></sub> &minus; ${vec('r')}<sub><i>j</i></sub>|`)} + ${fr("1", "2")} ${opSum("<i>I</i>&ne;<i>J</i>")} ${fr("<i>Z<sub>I</sub>Z<sub>J</sub></i>", `|${vec('R')}<sub><i>I</i></sub> &minus; ${vec('R')}<sub><i>J</i></sub>|`)}`, "1.2",
          "Terms left to right: electronic kinetic energy <i>T</i><sub>e</sub>, nuclear kinetic energy <i>T</i><sub>n</sub>, electron–nucleus attraction <i>V</i><sub>ne</sub>, electron–electron Coulomb repulsion <i>V</i><sub>ee</sub>, and nucleus–nucleus repulsion <i>E</i><sub>II</sub>.")}

        ${defBox("Born–Oppenheimer (Adiabatic) Approximation",
          "Because nuclei are 1,836 to &gt;400,000 times heavier than electrons (<i>M<sub>I</sub></i> &gg; <i>m</i><sub>e</sub>), electrons relax virtually instantaneously to any nuclear displacement. We therefore decouple the total wavefunction as &Psi;({<b>r</b><sub><i>i</i></sub>}, {<b>R</b><sub><i>I</i></sub>}) &approx; &psi;<sub>el</sub>({<b>r</b><sub><i>i</i></sub>}; {<b>R</b><sub><i>I</i></sub>}) &chi;<sub>nuc</sub>({<b>R</b><sub><i>I</i></sub>}) and solve the electronic problem at fixed nuclear positions {<b>R</b><sub><i>I</i></sub>}. The electronic ground-state energy plus nuclear repulsion defines the <strong>Potential Energy Surface (PES)</strong> <i>E</i>({<b>R</b><sub><i>I</i></sub>}).")}

        <p>Under the Born–Oppenheimer approximation, the nuclei generate a static external potential <i>v</i><sub>ext</sub>(${vec('r')}) = &minus;&sum;<sub><i>I</i></sub> <i>Z<sub>I</sub></i> / |${vec('r')} &minus; ${vec('R')}<sub><i>I</i></sub>|, leaving the electronic Hamiltonian:</p>
        ${eq(`${hat('H')}<sub>el</sub> = ${hat('T')}<sub>e</sub> + ${hat('V')}<sub>ee</sub> + ${opSum("<i>i</i>=1", "<i>N</i>")} <i>v</i><sub>ext</sub>(${vec('r')}<sub><i>i</i></sub>)`, "1.3")}
        <p><strong>Why Wavefunction Methods Hit an Exponential Wall:</strong> Storing the antisymmetric wavefunction &psi;(${vec('r')}<sub>1</sub>, &hellip;, ${vec('r')}<sub><i>N</i></sub>) on a coarse 10-point 3D grid per electron requires 10<sup>3<i>N</i></sup> complex numbers. Even for a single Fe atom (<i>N</i> = 26), 10<sup>78</sup> amplitudes exceeds the number of atoms in the observable universe. Density Functional Theory bypasses this exponential catastrophe completely.</p>

        <h3>1.2 The Electron Density &amp; Hohenberg–Kohn Theorems (1964)</h3>
        <p>Instead of tracking the 3<i>N</i>-dimensional wavefunction, DFT reformulates quantum mechanics in terms of the <strong>3-dimensional electron number density</strong> <i>n</i>(${vec('r')})—a scalar physical observable depending on only three spatial coordinates (<i>x</i>, <i>y</i>, <i>z</i>):</p>
        ${eq(`<i>n</i>(${vec('r')}) = <i>N</i> ${opInt()} d<sup>3</sup>${vec('r')}<sub>2</sub> &#8943; d<sup>3</sup>${vec('r')}<sub><i>N</i></sub> |&psi;(${vec('r')}, ${vec('r')}<sub>2</sub>, &hellip;, ${vec('r')}<sub><i>N</i></sub>)|<sup>2</sup>, &nbsp;&nbsp;&nbsp; ${opInt()} <i>n</i>(${vec('r')}) d<sup>3</sup>${vec('r')} = <i>N</i>`, "1.4")}

        <div class="dft-two-col">
          ${defBox("Hohenberg–Kohn Theorem I (Existence &amp; Uniqueness)",
            "For any system of interacting electrons in an external potential <i>v</i><sub>ext</sub>(<b>r</b>), the ground-state electron density <i>n</i><sub>0</sub>(<b>r</b>) uniquely determines <i>v</i><sub>ext</sub>(<b>r</b>) up to a trivial additive constant. Consequently, <i>n</i><sub>0</sub>(<b>r</b>) uniquely determines the entire Hamiltonian, the exact ground-state wavefunction &psi;<sub>0</sub>[<i>n</i><sub>0</sub>], and <em>every</em> ground-state physical property as a functional of <i>n</i>(<b>r</b>).")}
          ${defBox("Hohenberg–Kohn Theorem II (Variational Principle)",
            "There exists a universal energy functional <i>F</i><sub>HK</sub>[<i>n</i>] = &lang;&psi;[<i>n</i>]|<i>T</i><sub>e</sub> + <i>V</i><sub>ee</sub>|&psi;[<i>n</i>]&rang;, independent of <i>v</i><sub>ext</sub>(<b>r</b>), such that the total energy <i>E</i>[<i>n</i>] = <i>F</i><sub>HK</sub>[<i>n</i>] + &int;<i>v</i><sub>ext</sub>(<b>r</b>)<i>n</i>(<b>r</b>)d<sup>3</sup><b>r</b> attains its global minimum <i>E</i><sub>0</sub> if and only if <i>n</i>(<b>r</b>) equals the true ground-state density <i>n</i><sub>0</sub>(<b>r</b>): <i>E</i>[<i>n</i>] &ge; <i>E</i>[<i>n</i><sub>0</sub>] = <i>E</i><sub>0</sub>.")}
        </div>

        <h3>1.3 The Kohn–Sham Ansatz (1965): Mapping to Auxiliary Orbitals</h3>
        <p>Although Hohenberg–Kohn guarantees that <i>F</i><sub>HK</sub>[<i>n</i>] exists, the exact kinetic energy functional <i>T</i><sub>e</sub>[<i>n</i>] is unknown and highly non-local. Walter Kohn and Lu Jeu Sham solved this brilliantly by introducing a <strong>fictitious system of <i>N</i> non-interacting electrons</strong> moving in an effective local potential <i>v</i><sub>eff</sub>(${vec('r')}) chosen so that its ground-state density is <em>identical</em> to the true interacting density:</p>
        ${eq(`<i>n</i>(${vec('r')}) = ${opSum("<i>i</i>=1", "<i>N</i>")} <i>f<sub>i</sub></i> |&phi;<sub><i>i</i></sub>(${vec('r')})|<sup>2</sup>`, "1.5",
          "where &phi;<sub><i>i</i></sub>(<b>r</b>) are orthonormal Kohn–Sham single-particle orbitals and <i>f<sub>i</sub></i> &isin; [0, 2] are Fermi–Dirac occupation numbers.")}
        <p>The total ground-state energy functional is then partitioned into four exact, explicitly computable pieces plus a single remaining unknown term, the <strong>exchange–correlation functional</strong> <i>E</i><sub>xc</sub>[<i>n</i>]:</p>
        ${eq(`<i>E</i><sub>KS</sub>[<i>n</i>] = <i>T</i><sub>s</sub>[{&phi;<sub><i>i</i></sub>}] + ${opInt()} <i>v</i><sub>ext</sub>(${vec('r')}) <i>n</i>(${vec('r')}) d<sup>3</sup>${vec('r')} + <i>E</i><sub>H</sub>[<i>n</i>] + <i>E</i><sub>xc</sub>[<i>n</i>] + <i>E</i><sub>II</sub>`, "1.6")}
        <p>where the non-interacting kinetic energy <i>T</i><sub>s</sub> and classical electrostatic Hartree repulsion <i>E</i><sub>H</sub> are known exactly:</p>
        ${eq(`<i>T</i><sub>s</sub>[{&phi;<sub><i>i</i></sub>}] = &minus;${fr("1", "2")} ${opSum("<i>i</i>=1", "<i>N</i>")} <i>f<sub>i</sub></i> ${opInt()} &phi;<sub><i>i</i></sub>*(${vec('r')}) &nabla;<sup>2</sup> &phi;<sub><i>i</i></sub>(${vec('r')}) d<sup>3</sup>${vec('r')}, &nbsp;&nbsp;&nbsp; <i>E</i><sub>H</sub>[<i>n</i>] = ${fr("1", "2")} ${opInt()} ${opInt()} ${fr(`<i>n</i>(${vec('r')}) <i>n</i>(${vec('r')}&prime;)`, `|${vec('r')} &minus; ${vec('r')}&prime;|`)} d<sup>3</sup>${vec('r')} d<sup>3</sup>${vec('r')}&prime;`, "1.7")}
        <p>Applying the variational condition &delta;<i>E</i><sub>KS</sub> / &delta;&phi;<sub><i>i</i></sub>* = 0 subject to &lang;&phi;<sub><i>i</i></sub>|&phi;<sub><i>j</i></sub>&rang; = &delta;<sub><i>ij</i></sub> yields the celebrated <strong>Kohn–Sham single-particle equations</strong>:</p>
        ${eq(`[ &minus;${fr("&#8463;<sup>2</sup>", "2<i>m</i><sub>0</sub>")} &nabla;<sup>2</sup> + <i>v</i><sub>eff</sub>(${vec('r')}) ] &phi;<sub><i>i</i></sub>(${vec('r')}) = &varepsilon;<sub><i>i</i></sub> &phi;<sub><i>i</i></sub>(${vec('r')})`, "1.8")}
        ${eq(`<i>v</i><sub>eff</sub>(${vec('r')}) = <i>v</i><sub>ext</sub>(${vec('r')}) + <i>v</i><sub>H</sub>(${vec('r')}) + <i>v</i><sub>xc</sub>(${vec('r')}), &nbsp;&nbsp;&nbsp; <i>v</i><sub>H</sub>(${vec('r')}) = ${opInt()} ${fr(`<i>n</i>(${vec('r')}&prime;)`, `|${vec('r')} &minus; ${vec('r')}&prime;|`)} d<sup>3</sup>${vec('r')}&prime;, &nbsp;&nbsp;&nbsp; <i>v</i><sub>xc</sub>(${vec('r')}) = ${fr("&delta;<i>E</i><sub>xc</sub>[<i>n</i>]", `&delta;<i>n</i>(${vec('r')})`)}`, "1.9")}

        <h3>1.4 The Self-Consistent Field (SCF) Iterative Loop</h3>
        <p>Because <i>v</i><sub>H</sub>(${vec('r')}) and <i>v</i><sub>xc</sub>(${vec('r')}) depend on <i>n</i>(${vec('r')}), which itself depends on the output orbitals {&phi;<sub><i>i</i></sub>}, Eq. (1.8) is a non-linear eigenvalue problem solved iteratively until input and output densities match within tolerance (typically &Delta;<i>E</i> &lt; 10<sup>&minus;6</sup> eV/atom):</p>

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
            <rect x="370" y="110" width="290" height="30" rx="6" fill="#fffbeb" stroke="#d97706" stroke-width="1.2"/>
            <text x="515" y="129" text-anchor="middle" font-size="11" font-weight="700" fill="#92400e">NO &rarr; Pulay / Broyden Density Mixing: n<tspan dy="3" font-size="8">in</tspan><tspan dy="-3">&apos; = Mix(n</tspan><tspan dy="3" font-size="8">in</tspan><tspan dy="-3">, n</tspan><tspan dy="3" font-size="8">out</tspan><tspan dy="-3">)</tspan></text>
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
            <li>Observe the left chart (<strong>Total Energy / Enthalpy vs. Iteration</strong>) relaxing smoothly toward the variational minimum <i>E</i><sub>0</sub>, and the right chart (<strong>log<sub>10</sub>(&Delta;E / atom)</strong>) crossing the green dashed <code>elec_energy_tol</code> convergence line.</li>
            <li>Switch to <strong>📝 Files &rarr; .castep</strong> to inspect the exact SCF loop table (<code>Total Energy</code>, <code>Fermi Energy</code>, <code>Energy gain per atom</code>) and <strong>.param</strong> to tune <code>elec_energy_tol</code> and <code>max_scf_cycles</code>.</li>
          </ol>`,
          `<button type="button" class="btn btn-outline btn-sm" onclick="openCastepToolFromLecture('files')">&#128221; Open Files &amp; .param</button>`)}
      `
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
      readTime: "16 min",
      toolPane: "files",
      toolName: "Param Builder",
      title: "Lecture 2: Exchange–Correlation Functionals (Jacob's Ladder), Dispersion (DFT-D) &amp; DFT+U",
      subtitle: "How approximations to <i>E</i><sub>xc</sub>[<i>n</i>] determine band gaps, lattice constants, van der Waals interlayer binding, and strongly correlated 3d/4f magnetism.",
      keywords: "exchange correlation lda gga pbe pbesol meta-gga scan hybrid hse06 b3lyp jacob ladder self-interaction bandgap dispersion vdw grimme dft-d2 dft-d3 ts hubbard dft+u dudarev",
      objectives: [
        "Explain the physical origin of exchange (Pauli exclusion) and correlation (Coulomb avoidance) inside <i>E</i><sub>xc</sub>[<i>n</i>].",
        "Navigate Perdew's Jacob's Ladder from LDA and GGA (PBE) to meta-GGA (SCAN) and Hybrid functionals (HSE06).",
        "Diagnose why semilocal DFT underestimates semiconductor band gaps and how HSE06 or DFT+U corrects it.",
        "Apply van der Waals dispersion corrections (Grimme G06/D3, Tkatchenko–Scheffler) to 2D layered materials and adsorption."
      ],
      html: () => `
        <h3>2.1 What Lives Inside <i>E</i><sub>xc</sub>[<i>n</i>]?</h3>
        <p>Kohn–Sham DFT is <em>formally exact</em>—all many-body complexity is concentrated into a single functional, <i>E</i><sub>xc</sub>[<i>n</i>]:</p>
        ${eq(`<i>E</i><sub>xc</sub>[<i>n</i>] = (<i>T</i><sub>e</sub>[<i>n</i>] &minus; <i>T</i><sub>s</sub>[<i>n</i>]) + (<i>V</i><sub>ee</sub>[<i>n</i>] &minus; <i>E</i><sub>H</sub>[<i>n</i>])`, "2.1",
          "<i>E</i><sub>xc</sub> captures: (1) quantum Fermi exchange keeping parallel-spin electrons apart, (2) dynamical Coulomb correlation keeping antiparallel electrons apart, (3) cancellation of the unphysical Hartree self-interaction, and (4) the small kinetic energy difference between interacting and non-interacting electrons.")}

        <h3>2.2 Perdew's Jacob's Ladder of Exchange–Correlation Functionals</h3>
        <p>John Perdew classified XC approximations as five rungs ascending from the Hartree world toward "chemical accuracy" (1 kcal/mol &approx; 0.043 eV):</p>

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

        <p><strong>1. Local Density Approximation (LDA):</strong> Treats every infinitesimal volume d<sup>3</sup>${vec('r')} as a uniform electron gas of density <i>n</i>(${vec('r')}):</p>
        ${eq(`<i>E</i><sub>xc</sub><sup>LDA</sup>[<i>n</i>] = ${opInt()} <i>n</i>(${vec('r')}) &varepsilon;<sub>xc</sub><sup>unif</sup>(<i>n</i>(${vec('r')})) d<sup>3</sup>${vec('r')}`, "2.2")}
        <p><strong>2. Generalized Gradient Approximation (GGA &mdash; PBE / PBEsol / RPBE):</strong> Incorporates the dimensionless reduced density gradient <i>s</i> = |&nabla;<i>n</i>| / (2<i>k</i><sub>F</sub><i>n</i>) through an enhancement factor <i>F</i><sub>xc</sub>(<i>n</i>, <i>s</i>):</p>
        ${eq(`<i>E</i><sub>xc</sub><sup>GGA</sup>[<i>n</i>] = ${opInt()} <i>n</i>(${vec('r')}) &varepsilon;<sub>x</sub><sup>unif</sup>(<i>n</i>) <i>F</i><sub>xc</sub>(<i>n</i>, |&nabla;<i>n</i>|) d<sup>3</sup>${vec('r')}`, "2.3")}
        <p><strong>3. Range-Separated Hybrid Functional (HSE06):</strong> Semilocal GGA suffers from <em>delocalization / self-interaction error</em> (the unphysical repulsion of an electron with itself is only partially canceled), systematically underestimating semiconductor band gaps by 30–50%. Screened hybrids such as <strong>HSE06</strong> split the Coulomb operator 1/<i>r</i> = erfc(&omega;<i>r</i>)/<i>r</i> + erf(&omega;<i>r</i>)/<i>r</i> (&omega; = 0.2 &Aring;<sup>&minus;1</sup>) and mix 25% exact short-range Hartree–Fock exchange:</p>
        ${eq(`<i>E</i><sub>xc</sub><sup>HSE06</sup> = ${fr("1", "4")} <i>E</i><sub>x</sub><sup>HF,SR</sup>(&omega;) + ${fr("3", "4")} <i>E</i><sub>x</sub><sup>PBE,SR</sup>(&omega;) + <i>E</i><sub>x</sub><sup>PBE,LR</sup>(&omega;) + <i>E</i><sub>c</sub><sup>PBE</sup>`, "2.4")}

        <h3>2.3 Long-Range van der Waals Dispersion Corrections (DFT-D)</h3>
        <p>Standard LDA and GGA functionals decay exponentially with density overlap and therefore <strong>completely miss</strong> the long-range London dispersion attraction (&minus;<i>C</i><sub>6</sub>/<i>R</i><sup>6</sup>) arising from correlated instantaneous dipoles. Without dispersion corrections, graphite, MoS<sub>2</sub>/WS<sub>2</sub> heterobilayers, and physisorbed molecules drift apart! Modern pairwise DFT-D methods add a damped dispersion energy:</p>
        ${eq(`<i>E</i><sub>DFT-D</sub> = <i>E</i><sub>KS-DFT</sub> &minus; <i>s</i><sub>6</sub> ${opSum("<i>I</i>&lt;<i>J</i>")} ${fr("<i>C</i><sub>6</sub><sup><i>IJ</i></sup>", "<i>R<sub>IJ</sub></i><sup>6</sup>")} <i>f</i><sub>damp</sub>(<i>R<sub>IJ</sub></i>)`, "2.5",
          "In CASTEP, <code>sedc_scheme: G06</code> activates Grimme DFT-D2 (fixed atomic <i>C</i><sub>6</sub>) while <code>sedc_scheme: TS</code> activates Tkatchenko–Scheffler (environment-dependent Hirshfeld-volume-scaled <i>C</i><sub>6</sub><sup>eff</sup> and polarizabilities).")}

        <h3>2.4 Strongly Correlated Systems: Dudarev DFT+<i>U</i></h3>
        <p>For transition-metal oxides, Prussian Blue analogues (e.g. <code>KCoHCF</code>), and lanthanides with tightly localized 3<i>d</i> or 4<i>f</i> shells, GGA overly delocalizes electrons and often predicts magnetic insulators to be non-magnetic metals. The rotationally invariant <strong>Dudarev DFT+<i>U</i></strong> penalty penalizes fractional orbital occupations <i>n<sub>m&sigma;</sub></i> &isin; (0, 1) and restores integer orbital occupancy and Mott/charge-transfer band gaps:</p>
        ${eq(`<i>E</i><sub>DFT+<i>U</i></sub> = <i>E</i><sub>DFT</sub> + ${fr("<i>U</i><sub>eff</sub>", "2")} ${opSum("<i>I</i>,&sigma;")} ${opSum("<i>m</i>")} <i>n</i><sub><i>m</i>&sigma;</sub><sup><i>I</i></sup> (1 &minus; <i>n</i><sub><i>m</i>&sigma;</sub><sup><i>I</i></sup>), &nbsp;&nbsp;&nbsp; <i>U</i><sub>eff</sub> = <i>U</i> &minus; <i>J</i>`, "2.6")}

        <table class="dft-table">
          <thead><tr><th>Functional / Method</th><th>Strengths</th><th>Known Limitations</th><th>Best Use Case in CASTEP</th></tr></thead>
          <tbody>
            <tr><td><strong>LDA (CA-PZ)</strong></td><td>Very fast, accurate phonon frequencies</td><td>Overbinds lattices, large gap underestimation</td><td>Quick screening, baseline comparisons</td></tr>
            <tr><td><strong>GGA-PBE + DFT-D (G06/TS)</strong></td><td>Balanced cost &amp; geometry, accurate vdW spacings</td><td>Underestimates <i>E</i><sub>g</sub> by ~30–50%</td><td>2D Janus/TMDC relaxation, adsorption, heterostructures</td></tr>
            <tr><td><strong>GGA-PBEsol</strong></td><td>Best semilocal bulk lattice constants &amp; surface energies</td><td>Less accurate atomization energies</td><td>Bulk oxides, perovskites (BaTiO<sub>3</sub>)</td></tr>
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
      `
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
      subtitle: "How periodic boundary conditions reduce an infinite Avogadro-scale crystal to one unit cell, a plane-wave cutoff <i>E</i><sub>cut</sub>, and an irreducible k-point grid.",
      keywords: "crystal lattice bravais reciprocal brillouin zone bloch theorem plane wave cutoff ecut pseudopotential ncpp uspp paw otfg monkhorst pack kpoint smearing slab vacuum miller index",
      objectives: [
        "Relate real-space Bravais lattice vectors A to reciprocal-space vectors B and the First Brillouin Zone.",
        "Apply Bloch's theorem to expand crystal wavefunctions in a finite plane-wave basis set truncated by <i>E</i><sub>cut</sub>.",
        "Understand why pseudopotentials (NCPP, USPP, PAW/OTFG) remove rapid core oscillations near nuclei.",
        "Design converged Monkhorst–Pack k-point meshes, electronic smearing, and 2D surface slabs with vacuum spacing."
      ],
      html: () => `
        <h3>3.1 Real-Space &amp; Reciprocal-Space Lattices</h3>
        <p>An ideal crystal repeats a finite <strong>unit cell</strong> defined by three lattice vectors ${vec('a')}<sub>1</sub>, ${vec('a')}<sub>2</sub>, ${vec('a')}<sub>3</sub> (volume &Omega; = |${vec('a')}<sub>1</sub> &middot; (${vec('a')}<sub>2</sub> &times; ${vec('a')}<sub>3</sub>)|). Every atom's Cartesian position is ${vec('r')} = <i>f</i><sub>1</sub>${vec('a')}<sub>1</sub> + <i>f</i><sub>2</sub>${vec('a')}<sub>2</sub> + <i>f</i><sub>3</sub>${vec('a')}<sub>3</sub> in terms of fractional coordinates (<i>f</i><sub>1</sub>, <i>f</i><sub>2</sub>, <i>f</i><sub>3</sub>) &isin; [0, 1). The dual <strong>reciprocal lattice vectors</strong> ${vec('b')}<sub>1</sub>, ${vec('b')}<sub>2</sub>, ${vec('b')}<sub>3</sub> (units: &Aring;<sup>&minus;1</sup>) satisfy ${vec('b')}<sub><i>i</i></sub> &middot; ${vec('a')}<sub><i>j</i></sub> = 2&pi;&delta;<sub><i>ij</i></sub>:</p>
        ${eq(`${vec('b')}<sub>1</sub> = ${fr("2&pi;", "&Omega;")} (${vec('a')}<sub>2</sub> &times; ${vec('a')}<sub>3</sub>), &nbsp;&nbsp;&nbsp; ${vec('b')}<sub>2</sub> = ${fr("2&pi;", "&Omega;")} (${vec('a')}<sub>3</sub> &times; ${vec('a')}<sub>1</sub>), &nbsp;&nbsp;&nbsp; ${vec('b')}<sub>3</sub> = ${fr("2&pi;", "&Omega;")} (${vec('a')}<sub>1</sub> &times; ${vec('a')}<sub>2</sub>)`, "3.1")}
        <p>The Wigner–Seitz cell of the reciprocal lattice is the <strong>First Brillouin Zone (BZ)</strong>, containing all inequivalent crystal wavevectors ${vec('k')}.</p>

        <h3>3.2 Bloch's Theorem &amp; Plane-Wave Basis Expansion</h3>
        ${defBox("Bloch's Theorem (1928)",
          "In any periodic potential <i>v</i><sub>eff</sub>(<b>r</b> + <b>R</b>) = <i>v</i><sub>eff</sub>(<b>r</b>), every Kohn–Sham eigenstate can be written as a plane wave modulated by a cell-periodic function <i>u</i><sub><i>n</i><b>k</b></sub>(<b>r</b> + <b>R</b>) = <i>u</i><sub><i>n</i><b>k</b></sub>(<b>r</b>), indexed by a discrete band number <i>n</i> and continuous wavevector <b>k</b> inside the First Brillouin Zone.")}
        <p>Expanding the periodic part <i>u</i><sub><i>n</i>${vec('k')}}(${vec('r')}) as a Fourier series over reciprocal lattice vectors ${vec('G')} = <i>m</i><sub>1</sub>${vec('b')}<sub>1</sub> + <i>m</i><sub>2</sub>${vec('b')}<sub>2</sub> + <i>m</i><sub>3</sub>${vec('b')}<sub>3</sub> yields the <strong>plane-wave basis set</strong> used by CASTEP, VASP, and Quantum ESPRESSO:</p>
        ${eq(`&psi;<sub><i>n</i>${vec('k')}}(${vec('r')}) = <i>e</i><sup><i>i</i>${vec('k')}&middot;${vec('r')}</sup> <i>u</i><sub><i>n</i>${vec('k')}}(${vec('r')}) = ${fr("1", "&radic;&Omega;")} ${opSum(`${vec('G')}`)} <i>c</i><sub><i>n</i>,${vec('k')}+${vec('G')}</sub> <i>e</i><sup><i>i</i>(${vec('k')}+${vec('G')})&middot;${vec('r')}</sup>`, "3.2")}
        <p>In practice, the infinite sum over ${vec('G')} is truncated cleanly by a single systematic parameter—the <strong>plane-wave kinetic energy cutoff <i>E</i><sub>cut</sub></strong> (eV):</p>
        ${eq(`${fr("&#8463;<sup>2</sup>", "2<i>m</i><sub>0</sub>")} |${vec('k')} + ${vec('G')}|<sup>2</sup> &le; <i>E</i><sub>cut</sub>`, "3.3",
          "Increasing <i>E</i><sub>cut</sub> monotonically improves basis completeness across all atoms uniformly—zero Pulay force errors and zero Basis Set Superposition Error (BSSE)!")}

        <h3>3.3 Pseudopotentials (NCPP, USPP &amp; PAW / OTFG)</h3>
        <p>Close to an atomic nucleus (<i>r</i> &lt; <i>r<sub>c</sub></i>), valence wavefunctions oscillate violently to remain orthogonal to tightly bound core shells (1<i>s</i>, 2<i>s</i>, 2<i>p</i>, &hellip;), which would require impossibly huge <i>E</i><sub>cut</sub> (&gt;10<sup>5</sup> eV). Since chemical bonding depends overwhelmingly on valence electrons, <strong>pseudopotentials</strong> freeze the inert core and replace the sharp &minus;<i>Z</i>/<i>r</i> Coulomb singularity and nodal valence states inside cutoff radius <i>r<sub>c</sub></i> with a smooth, nodeless pseudo-wavefunction &psi;<sup>PS</sup>(<i>r</i>) that matches the exact all-electron &psi;<sup>AE</sup>(<i>r</i>) identically for <i>r</i> &ge; <i>r<sub>c</sub></i>:</p>

        <div class="dft-diagram-wrap">
          <svg viewBox="0 0 860 175" width="100%" height="175" role="img" aria-label="All-electron vs Pseudopotential schematic">
            <line x1="60" y1="145" x2="400" y2="145" stroke="#334155" stroke-width="1.4"/>
            <line x1="60" y1="20" x2="60" y2="150" stroke="#334155" stroke-width="1.4"/>
            <line x1="190" y1="22" x2="190" y2="145" stroke="#b45309" stroke-width="1.3" stroke-dasharray="4 3"/>
            <text x="190" y="162" text-anchor="middle" font-size="11" font-weight="700" fill="#b45309">r<tspan dy="3" font-size="8">c</tspan><tspan dy="-3"> (cutoff radius)</tspan></text>
            <text x="392" y="162" text-anchor="end" font-size="11" fill="#334155">Distance r</text>
            <text x="230" y="18" text-anchor="middle" font-size="12" font-weight="700" fill="#0f172a">Wavefunction &psi;(r): AE vs. Pseudo</text>
            <!-- Oscillatory AE wavefunction -->
            <path d="M 60 145 Q 80 38 100 138 Q 122 175 142 95 Q 164 38 190 78 C 235 125 305 138 390 143" fill="none" stroke="#dc2626" stroke-width="1.8" stroke-dasharray="5 3"/>
            <!-- Smooth PS wavefunction matching identically for r >= rc -->
            <path d="M 60 112 C 110 85 150 62 190 78 C 235 125 305 138 390 143" fill="none" stroke="#2563eb" stroke-width="2.4"/>
            <text x="285" y="55" font-size="10.5" font-weight="700" fill="#dc2626">--- All-Electron &psi;<tspan dy="3" font-size="8">AE</tspan><tspan dy="-3"> (oscillatory)</tspan></text>
            <text x="285" y="72" font-size="10.5" font-weight="700" fill="#2563eb">&mdash;&mdash; Pseudo &psi;<tspan dy="3" font-size="8">PS</tspan><tspan dy="-3"> (smooth, exact r &ge; r</tspan><tspan dy="3" font-size="8">c</tspan><tspan dy="-3">)</tspan></text>

            <!-- Right panel: Potential V(r) -->
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

        <h3>3.4 Brillouin-Zone Sampling (Monkhorst–Pack) &amp; 2D Supercell Vacuum</h3>
        <p>Integrals over the First Brillouin Zone (total energy, density, forces) are discretized on a uniform <strong>Monkhorst–Pack k-mesh</strong> (<i>N</i><sub>1</sub> &times; <i>N</i><sub>2</sub> &times; <i>N</i><sub>3</sub>) reduced by crystal point-group symmetry to the Irreducible Brillouin Zone (IBZ) with weights <i>w</i><sub>${vec('k')}</sub> (&sum;<i>w</i><sub>${vec('k')}</sub> = 1):</p>
        ${eq(`${fr("1", "&Omega;<sub>BZ</sub>")} ${opInt("BZ")} <i>g</i>(${vec('k')}) d<sup>3</sup>${vec('k')} &approx; ${opSum(`${vec('k')}&isin;IBZ`)} <i>w</i><sub>${vec('k')}</sub> <i>g</i>(${vec('k')})`, "3.4",
          "Rule of thumb: choose k-spacing &Delta;<i>k</i> &le; 0.03 &Aring;<sup>&minus;1</sup> for semiconductors (<i>N<sub>i</sub></i> &approx; |<b>b</b><sub><i>i</i></sub>| / 2&pi;&Delta;<i>k</i>) and &le; 0.02 &Aring;<sup>&minus;1</sup> for metals, with only <i>N</i><sub>3</sub> = 1 along the vacuum direction of a 2D slab (vacuum &ge; 15–20 &Aring;).")}

        ${labBox("Build Unit Cells, Cut (hkl) Surface Slabs &amp; Inspect Symmetry", "builder", "Open 3D VESTA Builder",
          `<ol class="dft-steps">
            <li>Open <strong>Data Analysis &rarr; 🧱 3D View</strong> and click the <strong>Cell &amp; Slab</strong> dock tab on the left.</li>
            <li>Upload any <code>.cif</code> or <code>.cell</code> file to verify exact VESTA space group, lattice vectors (<i>a</i>, <i>b</i>, <i>c</i>, &alpha;, &beta;, &gamma;), and boundary modes (<code>Complete</code> vs <code>In-Cell</code>).</li>
            <li>Create supercells (e.g., <code>2&times;2&times;1</code>), cleave Miller-index surfaces <code>(001)</code> / <code>(110)</code> / <code>(111)</code>, add a <strong>20 &Aring; vacuum layer</strong>, and export directly to <code>.cell</code>, <code>.cif</code>, <code>.xsd</code>, or VASP <code>POSCAR</code>.</li>
          </ol>`)}
      `
    }
  ];
})();

(function () {
  const fr = (num, den) =>
    `<span class="dft-frac"><span class="dft-num">${num}</span><span class="dft-den">${den}</span></span>`;
  const vec = (s) => `<span class="dft-vec">${s}</span>`;
  const hat = (s) => `<span class="dft-hat">${s}</span>`;
  const opSum = (sub, sup = "") =>
    `<span class="dft-bigop"><span class="dft-op-sup">${sup}</span><span class="dft-op-sym">&sum;</span><span class="dft-op-sub">${sub}</span></span>`;
  const opInt = (sub = "", sup = "") =>
    `<span class="dft-bigop"><span class="dft-op-sup">${sup}</span><span class="dft-op-sym">&int;</span><span class="dft-op-sub">${sub}</span></span>`;
  const eq = (expr, num, note = "") =>
    `<div class="dft-eq-box"><div class="dft-eq-inner"><div class="dft-eq-math">${expr}</div><div class="dft-eq-num">(${num})</div></div>${note ? `<div class="dft-eq-note">${note}</div>` : ""}</div>`;
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

  window.DFT_THEORY_LECTURES.push(
    // =========================================================================
    // LECTURE 4: FORCES, STRESS, GEOMETRY OPTIMIZATION & ADSORPTION ENERGETICS
    // =========================================================================
    {
      id: "lec4",
      num: 4,
      shortTab: "L4: Forces & Opt.",
      level: "Intermediate",
      levelClass: "interm",
      readTime: "15 min",
      toolPane: "convergence",
      toolName: "Conv. & 3D Forces",
      title: "Lecture 4: Hellmann–Feynman Forces, Stress Tensor, Geometry Optimization &amp; Adsorption Energetics",
      subtitle: "How DFT relaxes atomic positions and lattice parameters to mechanical equilibrium and quantifies thermodynamic stability, defects, and surface catalysis.",
      keywords: "hellmann feynman force stress tensor pulay geometry optimization bfgs lbfgs tpsd formation energy cohesive surface energy adsorption gibbs free energy zpe",
      objectives: [
        "Derive atomic forces from the Hellmann–Feynman theorem and understand why plane waves are free of Pulay force artifacts.",
        "Define the Cauchy stress tensor and finite-basis-set Pulay stress correction for variable-cell relaxation.",
        "Interpret BFGS / LBFGS optimization trajectories and force/energy/displacement convergence criteria.",
        "Calculate formation energies, defect energies, surface energies, and Gibbs free energy of adsorption."
      ],
      html: () => `
        <h3>4.1 The Hellmann–Feynman Force Theorem</h3>
        <p>Finding the equilibrium crystal structure requires the force ${vec('F')}<sub><i>I</i></sub> = &minus;&part;<i>E</i>/&part;${vec('R')}<sub><i>I</i></sub> acting on every nucleus <i>I</i>. Differentiating <i>E</i> = &lang;&Psi;|${hat('H')}|&Psi;&rang; appears to require costly wavefunction derivatives &part;&Psi;/&part;${vec('R')}<sub><i>I</i></sub>. Remarkably, for any normalized eigenstate &lang;&Psi;|&Psi;&rang; = 1, those terms cancel identically:</p>
        ${eq(`${vec('F')}<sub><i>I</i></sub> = &minus;${fr("&part;<i>E</i>", `&part;${vec('R')}<sub><i>I</i></sub>`)} = &minus;&lang;&Psi;|&thinsp;${fr(`&part;${hat('H')}`, `&part;${vec('R')}<sub><i>I</i></sub>`)}&thinsp;|&Psi;&rang; = &minus;${opInt()} <i>n</i>(${vec('r')}) ${fr(`&part;<i>v</i><sub>ext</sub>(${vec('r')})`, `&part;${vec('R')}<sub><i>I</i></sub>`)} d<sup>3</sup>${vec('r')} &minus; ${fr("&part;<i>E</i><sub>II</sub>", `&part;${vec('R')}<sub><i>I</i></sub>`)}`, "4.1",
          "Because plane waves <i>e</i><sup><i>i</i>(<b>k</b>+<b>G</b>)&middot;<b>r</b></sup> do not depend on atomic coordinates <b>R</b><sub><i>I</i></sub>, there are zero Pulay basis-derivative forces once SCF is tightly converged.")}

        <h3>4.2 Stress Tensor &amp; Variable-Cell Relaxation</h3>
        <p>When optimizing both atomic positions and lattice vectors (<code>fix_all_cell: false</code>), the macroscopic <strong>Cauchy stress tensor</strong> &sigma;<sub>&alpha;&beta;</sub> is the derivative of total energy with respect to a homogeneous strain &varepsilon;<sub>&alpha;&beta;</sub> (units: GPa, where 1 eV/&Aring;<sup>3</sup> = 160.2177 GPa):</p>
        ${eq(`&sigma;<sub>&alpha;&beta;</sub> = ${fr("1", "&Omega;")} ${fr("&part;<i>E</i>", "&part;&varepsilon;<sub>&alpha;&beta;</sub>")}, &nbsp;&nbsp;&nbsp; <i>H</i> = <i>E</i> + <i>P</i>&Omega;`, "4.2",
          "Under external hydrostatic pressure <i>P</i>, geometry optimization minimizes the <strong>enthalpy</strong> <i>H</i> = <i>E</i> + <i>P</i>&Omega;. CASTEP applies an automatic finite-basis-set correction (<code>finite_basis_corr: 2</code>) to cancel Pulay stress arising from discontinuous jumps in the number of plane waves as &Omega; varies.")}

        <h3>4.3 Quasi-Newton Optimization (BFGS / LBFGS / TPSD)</h3>
        <p>Near a local minimum of the Potential Energy Surface, the energy expands quadratically in the generalized coordinate vector ${vec('x')} = ({${vec('R')}<sub><i>I</i></sub>}, &varepsilon;<sub>&alpha;&beta;</sub>). Quasi-Newton algorithms such as <strong>BFGS</strong> and memory-efficient <strong>LBFGS</strong> iteratively approximate the inverse Hessian matrix <b>H</b><sup>&minus;1</sup> using successive force evaluations ${vec('g')}<sub><i>k</i></sub> = &minus;${vec('F')}<sub><i>k</i></sub> and step along ${vec('p')}<sub><i>k</i></sub> = &minus;<b>H</b><sub><i>k</i></sub><sup>&minus;1</sup>${vec('g')}<sub><i>k</i></sub> until <em>all four</em> convergence thresholds are satisfied simultaneously:</p>
        <table class="dft-table">
          <thead><tr><th>Convergence Metric</th><th>CASTEP Keyword</th><th>Standard Accuracy</th><th>High-Precision (Phonons / Transport)</th></tr></thead>
          <tbody>
            <tr><td>Energy change per atom |&Delta;<i>E</i>/<i>N</i>|</td><td><code>geom_energy_tol</code></td><td>1.0&times;10<sup>&minus;5</sup> eV/atom</td><td>1.0&times;10<sup>&minus;6</sup> eV/atom</td></tr>
            <tr><td>Maximum ionic force max |<b>F</b><sub><i>I</i></sub>|</td><td><code>geom_force_tol</code></td><td>0.03 eV/&Aring;</td><td>&le; 0.01 eV/&Aring;</td></tr>
            <tr><td>Maximum ionic displacement max |&Delta;<b>R</b><sub><i>I</i></sub>|</td><td><code>geom_disp_tol</code></td><td>1.0&times;10<sup>&minus;3</sup> &Aring;</td><td>5.0&times;10<sup>&minus;4</sup> &Aring;</td></tr>
            <tr><td>Maximum stress component max |&sigma;<sub>&alpha;&beta;</sub>|</td><td><code>geom_stress_tol</code></td><td>0.05 GPa</td><td>&le; 0.02 GPa</td></tr>
          </tbody>
        </table>

        <h3>4.4 Thermodynamic Stability &amp; Catalytic Adsorption Equations</h3>
        <p>Total DFT energies are reference-dependent (they depend on the pseudopotential core), so physical observables are always expressed as <strong>energy differences</strong> computed with identical <i>E</i><sub>cut</sub>, functional, and k-density:</p>
        ${eq(`<i>E</i><sub>f</sub> = ${fr("1", "<i>N</i><sub>tot</sub>")} [ <i>E</i><sub>tot</sub>(A<sub><i>x</i></sub>B<sub><i>y</i></sub>) &minus; <i>x</i>&mu;<sub>A</sub> &minus; <i>y</i>&mu;<sub>B</sub> ], &nbsp;&nbsp;&nbsp; &gamma;<sub>surf</sub> = ${fr("<i>E</i><sub>slab</sub> &minus; <i>N</i><sub>slab</sub> <i>E</i><sub>bulk</sub>", "2<i>A</i><sub>surf</sub>")}`, "4.3",
          "Negative formation energy <i>E</i><sub>f</sub> &lt; 0 indicates thermodynamic stability against elemental phases; &gamma;<sub>surf</sub> (J/m<sup>2</sup> or eV/&Aring;<sup>2</sup>) measures the cost of cleaving a crystal surface of area <i>A</i><sub>surf</sub> (factor 2 accounts for top and bottom slab surfaces).")}
        ${eq(`<i>E</i><sub>ads</sub> = <i>E</i><sub>slab+ads</sub> &minus; <i>E</i><sub>slab</sub> &minus; <i>E</i><sub>ads(gas)</sub>, &nbsp;&nbsp;&nbsp; &Delta;<i>G</i><sub>ads</sub> = <i>E</i><sub>ads</sub> + &Delta;<i>E</i><sub>ZPE</sub> &minus; <i>T</i>&Delta;<i>S</i>`, "4.4",
          "Negative <i>E</i><sub>ads</sub> &lt; 0 denotes exothermic binding. For electrocatalysis (HER/OER/CO<sub>2</sub>RR), Gibbs free energy &Delta;<i>G</i><sub>ads</sub> includes zero-point vibrational energy &Delta;<i>E</i><sub>ZPE</sub> = &frac12;&sum;&#8463;&omega;<sub><i>i</i></sub> and entropy &minus;<i>T</i>&Delta;<i>S</i> (e.g., for *H adsorption, &Delta;<i>G</i><sub>H*</sub> &approx; 0 eV defines the Sabatier optimum).")}

        ${labBox("Track Optimization Forces &amp; Place Adsorbates on Surfaces", "convergence", "Open Convergence & Forces",
          `<ol class="dft-steps">
            <li>Open <strong>Data Analysis &rarr; ⚡ Conv.</strong> to inspect the live LBFGS/SCF energy trajectory and the <strong>Symmetrised Forces (eV/&Aring;)</strong> table for every atom.</li>
            <li>Open <strong>🧱 3D View</strong>, check <strong>Show atomic force vectors</strong> in the Style dock, and switch to the <strong>Adsorb</strong> dock to auto-detect <code>Top</code>, <code>Bridge</code>, and <code>3-/4-Fold Hollow</code> sites and place <code>*H</code>, <code>*OH</code>, <code>*OOH</code>, <code>CO</code>, or single adatoms at exact height <i>d<sub>z</sub></i>.</li>
          </ol>`,
          `<button type="button" class="btn btn-outline btn-sm" onclick="openCastepToolFromLecture('builder')">&#129521; Open 3D Adsorb Builder</button>`)}
      `
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
      subtitle: "Reading <i>E<sub>n</sub></i>(<b>k</b>) dispersion relations along high-symmetry Brillouin-zone paths and decoding atomic orbital contributions via projected DOS.",
      keywords: "band structure dispersion vbm cbm direct indirect bandgap semiconductor metal half-metal dos density of states pdos projected orbital hybridization d-band center",
      objectives: [
        "Interpret <i>E<sub>n</sub></i>(<b>k</b>) dispersion curves along standard high-symmetry BZ paths (Γ–M–K–Γ, Γ–X–M–Γ–R).",
        "Distinguish direct vs. indirect band gaps, metals, semimetals, semiconductors, insulators, and half-metals.",
        "Define Total DOS g(E) and Atomic/Orbital-Projected DOS (PDOS) from CASTEP <code>.pdos_bin</code> projection weights.",
        "Apply Hammer–Nørskov d-band center theory and PDOS overlap to diagnose covalent vs. ionic bonding."
      ],
      html: () => `
        <h3>5.1 Electronic Band Structure <i>E<sub>n</sub></i>(${vec('k')}) &amp; Band Gap Classification</h3>
        <p>Solving the Kohn–Sham equation at a dense sequence of wavevectors ${vec('k')} tracing the high-symmetry lines of the First Brillouin Zone produces the <strong>electronic band structure</strong> <i>E<sub>n&sigma;</sub></i>(${vec('k')}) (band index <i>n</i>, spin &sigma; &isin; {&uarr;, &darr;}). Energies are referenced to the Fermi level <i>E</i><sub>F</sub> (for metals) or the <strong>Valence Band Maximum (VBM)</strong> (for semiconductors, so <i>E</i> &minus; <i>E</i><sub>VBM</sub> = 0 at VBM):</p>
        ${eq(`<i>E</i><sub>g</sub> = min<sub>${vec('k')}</sub> <i>E</i><sub>CBM</sub>(${vec('k')}) &minus; max<sub>${vec('k')}</sub> <i>E</i><sub>VBM</sub>(${vec('k')})`, "5.1",
          "If <b>k</b><sub>CBM</sub> = <b>k</b><sub>VBM</sub> (e.g., K &rarr; K in monolayer MoS<sub>2</sub> or Janus MoSi<sub>2</sub>N<sub>2</sub>P<sub>2</sub>), the gap is <strong>Direct</strong> (strong optical emission/absorption without phonon assistance). If <b>k</b><sub>CBM</sub> &ne; <b>k</b><sub>VBM</sub> (e.g., Si: &Gamma; &rarr; &Delta;), it is <strong>Indirect</strong>.")}

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

        <h3>5.2 Total Density of States (DOS) &amp; Projected DOS (PDOS)</h3>
        <p>The <strong>Total Electronic Density of States</strong> <i>g</i>(<i>E</i>) counts the number of electronic states per unit energy per unit cell across the entire Brillouin Zone. In finite k-mesh DFT calculations, the singular Dirac delta is broadened with a Gaussian kernel of width &sigma; (typically 0.05–0.15 eV):</p>
        ${eq(`<i>g</i><sub>&sigma;</sub>(<i>E</i>) = ${opSum(`<i>n</i>,${vec('k')}`)} <i>g</i><sub>s</sub> <i>w</i><sub>${vec('k')}</sub> ${fr("1", "&sigma;&radic;(2&pi;)")} exp<span class="dft-bigdel">[</span> &minus;${fr(`(<i>E</i> &minus; <i>E</i><sub><i>n</i>${vec('k')}}</sub>)<sup>2</sup>`, "2&sigma;<sup>2</sup>")} <span class="dft-bigdel">]</span>`, "5.2",
          "where <i>g</i><sub>s</sub> = 2 for non-spin-polarized calculations and <i>g</i><sub>s</sub> = 1 per spin channel (&alpha; &uarr; plotted positive, &beta; &darr; mirrored negative) in collinear spin-polarized DFT.")}
        <p>To uncover <em>which atoms and angular-momentum shells</em> (<i>s</i>, <i>p</i>, <i>d</i>, <i>f</i>) build the valence and conduction edges, CASTEP projects each Bloch state |&psi;<sub><i>n</i>${vec('k')}}&rang; onto localized atomic pseudo-orbitals |&chi;<sub><i>I</i>,<i>lm</i></sub>&rang; and writes the exact weights into binary <code>*.pdos_bin</code> files:</p>
        ${eq(`<i>g</i><sub><i>I</i>,<i>lm</i></sub>(<i>E</i>) = ${opSum(`<i>n</i>,${vec('k')}`)} <i>g</i><sub>s</sub> <i>w</i><sub>${vec('k')}</sub> |&lang;&chi;<sub><i>I</i>,<i>lm</i></sub> | &psi;<sub><i>n</i>${vec('k')}}&rang;|<sup>2</sup> &delta;(<i>E</i> &minus; <i>E</i><sub><i>n</i>${vec('k')}}</sub>)`, "5.3")}

        ${tipBox("Reading Orbital Hybridization &amp; the d-Band Center",
          "When two different species share sharp PDOS peaks at the <em>exact same energy</em> (for example, Mo-4<i>d</i> and N-2<i>p</i> in MoSi<sub>2</sub>N<sub>4</sub>, or Co-3<i>d</i> and C/N-2<i>p</i> in KCoHCF), strong <strong>covalent orbital hybridization</strong> is occurring. In transition-metal catalysis, the first moment of the projected <i>d</i>-states—the <strong>Hammer–Nørskov d-band center</strong> &varepsilon;<sub><i>d</i></sub> = &int;<i>E</i>&thinsp;<i>g<sub>d</sub></i>(<i>E</i>)d<i>E</i> / &int;<i>g<sub>d</sub></i>(<i>E</i>)d<i>E</i>—predicts adsorbate binding strength: upshifting &varepsilon;<sub><i>d</i></sub> closer to <i>E</i><sub>F</sub> pushes antibonding states above <i>E</i><sub>F</sub> and strengthens chemisorption.")}

        ${labBox("Analyze Synchronized Band Structure &amp; Exact <code>.pdos_bin</code> PDOS", "electronic", "Open Band & PDOS Tab",
          `<ol class="dft-steps">
            <li>Open <strong>Data Analysis &rarr; 📈 Band &amp; PDOS</strong> and load a calculation containing <code>*_BandStr.bands</code> and <code>*_DOS.pdos_bin</code> (e.g., <code>KCoHCF+K</code> or <code>J1+4</code>).</li>
            <li>Keep <strong>Zero: VBM / Fermi</strong> enabled so Band Structure and PDOS share the exact aligned zero-energy axis.</li>
            <li>Switch <strong>PDOS</strong> between <code>Element + Orbital</code> (e.g., <code>Co-d</code>, <code>Fe-d</code>, <code>Mo-d</code>, <code>N-p</code>), <code>Orbital (s,p,d,f)</code>, and <code>Spin Mirror (+&alpha;/&minus;&beta;)</code> to inspect spin splitting and band-edge orbital character.</li>
            <li>Right-click either half of the canvas to copy <strong>Band Structure Only</strong> or <strong>PDOS Only</strong> at 400–600 DPI, or click <strong>⚡ Analyze m*, Mobility &amp; Drude &rarr;</strong> to proceed to Lecture 6!</li>
          </ol>`)}
      `
    },

    // =========================================================================
    // LECTURE 6: CARRIER EFFECTIVE MASS, SEMICONDUCTOR MOBILITY & DRUDE TRANSPORT
    // =========================================================================
    {
      id: "lec6",
      num: 6,
      shortTab: "L6: m*, μ & Drude",
      level: "Interm. → Adv.",
      levelClass: "adv",
      readTime: "20 min",
      toolPane: "transport",
      toolName: "m* & Drude",
      title: "Lecture 6: Carrier Effective Mass (Band &amp; DOS), Semiconductor Mobility &amp; Drude Transport",
      subtitle: "Connecting band curvature, direct DFT DOS, acoustic/polar/impurity scattering, and Boltzmann–Drude effective mass &amp; relaxation time for electrons and holes.",
      keywords: "effective mass parabolic kane non-parabolic dos effective mass conductivity mass mobility bardeen shockley takagi deformation potential frohlich polar optical brooks herring impurity matthiessen drude effective mass relaxation time plasma frequency exciton",
      objectives: [
        "Extract directional electron and hole effective masses <i>m</i>*<sub>e</sub>, <i>m</i>*<sub>h</sub> using Parabolic and Kane Non-Parabolic band-edge fits.",
        "Compute the DOS effective mass <i>m</i>*<sub>DOS</sub> both from valley degeneracy and directly via cumulative DFT DOS integration.",
        "Calculate 2D Takagi and 3D Bardeen–Shockley mobilities, Fröhlich polar-optical &amp; Brooks–Herring impurity scattering, and Wannier–Mott excitons.",
        "Derive and evaluate Drude effective mass <i>m</i>*<sub>Drude</sub>(<i>n</i>, <i>T</i>), Drude relaxation time &tau;<sub>e</sub>, &tau;<sub>h</sub>, plasma frequency &#8463;&omega;<sub>p</sub>, and optical conductivity σ(ω)."
      ],
      html: () => `
        <h3>6.1 Semiclassical Dynamics &amp; Band-Edge Effective Mass Tensor</h3>
        <p>Under an external electric field, a Bloch electron wavepacket centered at wavevector ${vec('k')} moves with group velocity ${vec('v')}<sub>g</sub> = (1/&#8463;)&nabla;<sub>${vec('k')}</sub><i>E<sub>n</sub></i>(${vec('k')}) and responds to forces with an inertia determined by the curvature of the band—the <strong>inverse effective mass tensor</strong>:</p>
        ${eq(`${fr("1", "<i>m</i>*<sub>&alpha;&beta;</sub>")} = ${fr("1", "&#8463;<sup>2</sup>")} ${fr(`&part;<sup>2</sup><i>E<sub>n</sub></i>(${vec('k')})`, "&part;<i>k</i><sub>&alpha;</sub>&part;<i>k</i><sub>&beta;</sub>")} &nbsp;&nbsp;&rArr;&nbsp;&nbsp; ${fr("<i>m</i>*", "<i>m</i><sub>0</sub>")} = ${fr("7.61996 eV&middot;&Aring;<sup>2</sup>", "&part;<sup>2</sup><i>E</i> / &part;<i>k</i><sup>2</sup>")}`, "6.1",
          "Sharp, steeply dispersing bands have small <i>m</i>* (light, fast carriers); flat localized bands (e.g., 3<i>d</i>/4<i>f</i> states) have large <i>m</i>* (heavy carriers). At the VBM, &part;<sup>2</sup><i>E</i>/&part;<i>k</i><sup>2</sup> &lt; 0, giving positive hole effective mass <i>m</i>*<sub>h</sub> = &minus;&#8463;<sup>2</sup>/(&part;<sup>2</sup><i>E</i>/&part;<i>k</i><sup>2</sup>) &gt; 0.")}
        <p>Away from the immediate band extremum (especially in narrow-gap semiconductors and heavily doped conductors), bands soften according to the <strong>Kane Non-Parabolic Dispersion</strong>:</p>
        ${eq(`&Delta;<i>E</i>(1 + &alpha;<sub>K</sub>&Delta;<i>E</i>) = ${fr("&#8463;<sup>2</sup><i>q</i><sup>2</sup>", "2<i>m</i>*<sub>0</sub>")}, &nbsp;&nbsp;&nbsp; <i>q</i> = |${vec('k')} &minus; ${vec('k')}<sub>0</sub>|`, "6.2",
          "where <i>m</i>*<sub>0</sub> is the band-edge effective mass and &alpha;<sub>K</sub> (eV<sup>&minus;1</sup>) is the non-parabolicity factor (for pure parabolic bands, &alpha;<sub>K</sub> = 0).")}

        <h3>6.2 Conductivity Mass vs. Direct DFT DOS Effective Mass (2D &amp; 3D)</h3>
        <p>For anisotropic or multi-valley bands with directional masses <i>m</i>*<sub>1</sub>, &hellip;, <i>m</i>*<sub><i>M</i></sub> and valley degeneracy <i>g<sub>v</sub></i> (e.g., <i>g<sub>v</sub></i> = 2 at hexagonal K/K&prime;, <i>g<sub>v</sub></i> = 6 in Si), transport uses the harmonic <strong>conductivity effective mass</strong> <i>m</i>*<sub>c</sub> = ((1/<i>M</i>)&sum;1/<i>m</i>*<sub><i>i</i></sub>)<sup>&minus;1</sup>, whereas thermodynamic carrier statistics use the <strong>DOS effective mass</strong> <i>m</i>*<sub>DOS</sub>. Remarkably, <i>m</i>*<sub>DOS</sub> can be extracted <em>directly</em> from the cumulative DFT state count <i>N</i><sub>cell</sub>(&Delta;<i>E</i>) without assuming a single valley:</p>
        ${eq(`<b>2D Slab:</b> &nbsp; ${fr("<i>m</i>*<sub>DOS</sub>", "<i>m</i><sub>0</sub>")} = ${fr("2&pi;(&#8463;<sup>2</sup>/<i>m</i><sub>0</sub>)", "<i>g</i><sub>s</sub> <i>S</i><sub>cell</sub>")} ${fr("<i>N</i><sub>cell</sub>(&Delta;<i>E</i>)", "&Delta;<i>E</i>")}, &nbsp;&nbsp;&nbsp;&nbsp; <b>3D Bulk:</b> &nbsp; ${fr("<i>m</i>*<sub>DOS</sub>", "<i>m</i><sub>0</sub>")} = ${fr("&#8463;<sup>2</sup>", "2<i>m</i><sub>0</sub>&Delta;<i>E</i>")} <span class="dft-bigdel">(</span> ${fr("6&pi;<sup>2</sup> <i>N</i><sub>cell</sub>(&Delta;<i>E</i>)", "<i>g</i><sub>s</sub> &Omega;")} <span class="dft-bigdel">)</span><sup>2/3</sup>`, "6.3")}
        <p>From <i>m</i>*<sub>DOS,e</sub>, <i>m</i>*<sub>DOS,h</sub>, band gap <i>E</i><sub>g</sub>, and optical dielectric constant &varepsilon;<sub>r</sub>, we obtain the effective densities of states <i>N</i><sub>c</sub>(<i>T</i>), <i>N</i><sub>v</sub>(<i>T</i>), intrinsic carrier concentration <i>n<sub>i</sub></i>(<i>T</i>), and <strong>Wannier–Mott exciton binding energy</strong> <i>E</i><sub>b</sub> &amp; Bohr radius <i>a</i><sub>B</sub>*:</p>
        ${eq(`<i>n<sub>i</sub></i>(<i>T</i>) = &radic;(<i>N</i><sub>c</sub><i>N</i><sub>v</sub>) exp<span class="dft-bigdel">(</span>&minus;${fr("<i>E</i><sub>g</sub>", "2<i>k</i><sub>B</sub><i>T</i>")}<span class="dft-bigdel">)</span>, &nbsp;&nbsp;&nbsp; &mu;*<sub>ex</sub> = ${fr("<i>m</i>*<sub>e</sub><i>m</i>*<sub>h</sub>", "<i>m</i>*<sub>e</sub> + <i>m</i>*<sub>h</sub>")}, &nbsp;&nbsp;&nbsp; <i>E</i><sub>b</sub><sup>3D</sup> = 13.606 ${fr("&mu;*<sub>ex</sub>", "&varepsilon;<sub>r</sub><sup>2</sup>")} eV, &nbsp;&nbsp;&nbsp; <i>a</i><sub>B</sub>* = <i>a</i><sub>0</sub> ${fr("&varepsilon;<sub>r</sub>", "&mu;*<sub>ex</sub>")}`, "6.4")}

        <h3>6.3 Carrier Mobility (&mu;<sub>e</sub>, &mu;<sub>h</sub>) &amp; Multi-Channel Scattering</h3>
        <p>In the relaxation-time approximation of the Boltzmann Transport Equation, carrier mobility &mu; = <i>e</i>&tau;/<i>m</i>* is limited by lattice vibrations (phonons) and defects combined via <strong>Matthiessen's Rule</strong>:</p>
        ${eq(`${fr("1", "&tau;<sub>tot</sub>")} = ${fr("1", "&tau;<sub>ADP</sub>")} + ${fr("1", "&tau;<sub>POP</sub>")} + ${fr("1", "&tau;<sub>IMP</sub>")}, &nbsp;&nbsp;&nbsp;&nbsp; &mu;<sub>tot</sub> = ${fr("<i>e</i> &tau;<sub>tot</sub>", "<i>m</i>*<sub>Drude</sub>")}`, "6.5")}
        <p><strong>1. Acoustic Deformation Potential (Takagi 2D &amp; Bardeen–Shockley 3D):</strong> Longitudinal acoustic phonons strain the lattice and shift band edges by &Delta;<i>E</i><sub>edge</sub> = <i>E</i><sub>1</sub>&varepsilon;. Using the elastic modulus <i>C</i><sub>2D</sub> = (1/<i>S</i><sub>0</sub>)(&part;<sup>2</sup><i>E</i>/&part;&varepsilon;<sup>2</sup>) (N/m) or <i>C</i><sub>3D</sub> = (1/&Omega;<sub>0</sub>)(&part;<sup>2</sup><i>E</i>/&part;&varepsilon;<sup>2</sup>) (GPa):</p>
        ${eq(`&mu;<sub>ADP,2D</sub> = ${fr("<i>e</i>&#8463;<sup>3</sup><i>C</i><sub>2D</sub>", "<i>k</i><sub>B</sub><i>T</i> <i>m</i>*<sub>&alpha;</sub> <i>m</i>*<sub>d</sub> <i>E</i><sub>1</sub><sup>2</sup>")}, &nbsp;&nbsp;&nbsp;&nbsp; &mu;<sub>ADP,3D</sub> = ${fr("2&radic;(2&pi;) <i>e</i>&#8463;<sup>4</sup><i>C</i><sub>3D</sub>", "3 (<i>k</i><sub>B</sub><i>T</i>)<sup>3/2</sup> <i>m</i>*<sub>&alpha;</sub> (<i>m</i>*<sub>d</sub>)<sup>3/2</sup> <i>E</i><sub>1</sub><sup>2</sup>")}`, "6.6")}
        <p><strong>2. Polar Optical Phonon (Fr&ouml;hlich) &amp; 3. Ionized Impurity (Brooks–Herring):</strong> In polar crystals (&varepsilon;<sub>0</sub> &gt; &varepsilon;<sub>&infin;</sub>), LO phonons of energy &#8463;&omega;<sub>LO</sub> couple to carriers with dimensionless Fr&ouml;hlich constant &alpha;<sub>F</sub> &prop; (1/&varepsilon;<sub>&infin;</sub> &minus; 1/&varepsilon;<sub>0</sub>)&radic;(<i>m</i>*/2&#8463;&omega;<sub>LO</sub>), yielding &tau;<sub>POP</sub> &prop; (<i>e</i><sup>&#8463;&omega;<sub>LO</sub>/<i>k</i><sub>B</sub><i>T</i></sup> &minus; 1) / (2&alpha;<sub>F</sub>&omega;<sub>LO</sub>). Screened ionized impurities of concentration <i>N<sub>i</sub></i> scatter carriers at low temperature with &tau;<sub>IMP</sub> &prop; &varepsilon;<sub>r</sub><sup>2</sup>(<i>k</i><sub>B</sub><i>T</i>)<sup>3/2</sup>&radic;<i>m</i>*/<i>N<sub>i</sub></i>.</p>

        <h3>6.4 Drude Effective Mass (<i>m</i>*<sub>Drude</sub>) &amp; Drude Relaxation Time (&tau;<sub>e</sub>, &tau;<sub>h</sub>)</h3>
        <p>When a semiconductor is doped to electron concentration <i>n</i> or hole concentration <i>p</i> (or in a metal at <i>E</i><sub>F</sub>), free carriers oscillate collectively at the <strong>Drude plasma frequency</strong> &omega;<sub>p</sub> and produce a frequency-dependent optical conductivity &sigma;(&omega;) and dielectric contribution &varepsilon;<sup>Drude</sup>(&omega;):</p>
        ${eq(`&omega;<sub>p,<i>c</i></sub><sup>2</sup>(&mu;<sub><i>c</i></sub>,<i>T</i>) = ${fr("<i>e</i><sup>2</sup>", "&varepsilon;<sub>0</sub>&Omega;")} ${opSum(`<i>n</i>,${vec('k')}`)} <i>g</i><sub>s</sub><i>w</i><sub>${vec('k')}}</i> <i>v</i><sub><i>n</i>${vec('k')}}</sub><sup>2</sup> <span class="dft-bigdel">(</span>&minus;${fr("&part;<i>f</i><sub>0</sub>", "&part;<i>E</i>")}<span class="dft-bigdel">)</span>, &nbsp;&nbsp;&nbsp;&nbsp; <i>m</i>*<sub>Drude,<i>c</i></sub>(<i>n<sub>c</sub></i>,<i>T</i>) = ${fr("<i>n<sub>c</sub></i> <i>e</i><sup>2</sup>", "&varepsilon;<sub>0</sub> &omega;<sub>p,<i>c</i></sub><sup>2</sup>")}`, "6.7",
          "For non-parabolic Kane bands at degenerate Fermi energy <i>E</i><sub>F</sub>, <i>m</i>*<sub>Drude</sub>(<i>E</i><sub>F</sub>) = <i>m</i>*<sub>0</sub>(1 + 2&alpha;<sub>K</sub><i>E</i><sub>F</sub>)—the Drude mass grows smoothly with doping concentration.")}
        ${eq(`&tau;<sub><i>c</i></sub> = ${fr("&#8463;", "&gamma;<sub>D,<i>c</i></sub>")} = ${fr("&sigma;<sub>0,<i>c</i></sub> <i>m</i>*<sub>Drude,<i>c</i></sub>", "<i>n<sub>c</sub></i> <i>e</i><sup>2</sup>")}, &nbsp;&nbsp;&nbsp;&nbsp; &varepsilon;<sup>Drude</sup>(&omega;) = &varepsilon;<sub>&infin;</sub> &minus; ${fr("&omega;<sub>p</sub><sup>2</sup>", "&omega;(&omega; + <i>i</i>&gamma;<sub>D</sub>)")}, &nbsp;&nbsp;&nbsp;&nbsp; &sigma;<sub>Drude</sub>(&omega;) = ${fr("<i>n e</i><sup>2</sup>&tau; / <i>m</i>*<sub>Drude</sub>", "1 &minus; <i>i</i>&omega;&tau;")}`, "6.8",
          "Drude relaxation time &tau; (fs) is linked directly to the optical damping rate &gamma;<sub>D</sub> (eV) via &tau;[fs] = 0.65821 / &gamma;<sub>D</sub>[eV] and to DC conductivity &sigma;<sub>0</sub> and mean free path &ell; = <i>v</i><sub>rms</sub>&tau;.")}

        ${labBox("Compute Band/DOS Effective Mass, Mobility &amp; Drude τ on Real CASTEP Jobs", "transport", "Open m* & Drude Tab",
          `<ol class="dft-steps">
            <li>Open <strong>Data Analysis &rarr; 🚀 m* &amp; Drude</strong> with a semiconductor job (e.g., 2D Janus <code>J1+4</code>, <i>E</i><sub>g</sub> = 0.987 eV at K).</li>
            <li>Inspect <strong>Panel (a) CBM</strong> &amp; <strong>Panel (b) VBM</strong> parabolic/Kane fits along <code>K &rarr; &Gamma;</code> and <code>K &rarr; M</code> (<i>m</i>*<sub>e</sub> = 0.648 <i>m</i><sub>0</sub>, <i>m</i>*<sub>h</sub> = 0.904 <i>m</i><sub>0</sub>, <i>R</i><sup>2</sup> = 0.985–0.998).</li>
            <li>Compare <strong>DOS Mass (Band)</strong> vs. <strong>DOS Mass (DFT DOS)</strong>, toggle <strong>POP</strong> &amp; <strong>IMP</strong> scattering, sweep <strong>Drude m*(n,p) &amp; &hbar;&omega;<sub>p</sub></strong> or <strong>Drude &varepsilon;(&omega;) &amp; &sigma;<sub>1</sub>(&omega;)</strong>, and click <strong>⚡ e<sup>&minus;</sup>/h<sup>+</sup> Drude &rarr; Optical</strong> to inject your computed &hbar;&omega;<sub>p</sub> and &gamma;<sub>D</sub> straight into the Optical tab!</li>
          </ol>`)}
      `
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
      subtitle: "From dipole momentum matrix elements in CASTEP <code>*.ome_bin</code> to complex dielectric tensor &varepsilon;(&omega;), polarization anisotropy, absorption &alpha;(&omega;), EELS, and Tauc gaps.",
      keywords: "optical properties dielectric function epsilon1 epsilon2 kramers kronig ome_bin momentum matrix dipole polarized unpolarized polycrystalline scissors levine allan absorption refractive index reflectivity eels loss function tauc plot",
      objectives: [
        "Derive the interband imaginary dielectric tensor &varepsilon;<sub>2</sub>(&omega;) from Fermi's Golden Rule and CASTEP <code>*.ome_bin</code> momentum matrix elements.",
        "Apply the Kramers–Kronig causal dispersion relation to obtain &varepsilon;<sub>1</sub>(&omega;) and add intraband Drude response for metals.",
        "Distinguish Polarized, Unpolarized (normal to incidence q), and Polycrystalline (isotropic trace) tensor projections.",
        "Convert &varepsilon;<sub>1</sub>(&omega;), &varepsilon;<sub>2</sub>(&omega;) into refractive index n/k, absorption α(ω), reflectivity R(ω), EELS L(ω), and Tauc optical gap."
      ],
      html: () => `
        <h3>7.1 Complex Dielectric Tensor &amp; Interband Transitions (<code>*.ome_bin</code>)</h3>
        <p>When an electromagnetic wave of photon energy &#8463;&omega; interacts with a crystal, vertical interband transitions promote electrons from occupied valence bands <i>v</i> to unoccupied conduction bands <i>c</i> at the same wavevector ${vec('k')} (since <i>q</i><sub>photon</sub> &approx; 0). Within the independent-particle dipole approximation (Fermi's Golden Rule), the imaginary part of the symmetrized 3&times;3 dielectric tensor &varepsilon;<sub>2,&alpha;&beta;</sub>(&omega;) is governed by the optical momentum matrix elements ${vec('p')}<sub><i>cv</i>${vec('k')}}</sub> = &lang;&psi;<sub><i>c</i>${vec('k')}}</sub>|${hat('p')}|&psi;<sub><i>v</i>${vec('k')}}</sub>&rang; stored in CASTEP binary <code>*.ome_bin</code> files:</p>
        ${eq(`&varepsilon;<sub>2,&alpha;&beta;</sub>(&omega;) = ${fr("4&pi;<sup>2</sup><i>e</i><sup>2</sup>", "&Omega;<i>m</i><sub>0</sub><sup>2</sup>&omega;<sup>2</sup>")} ${opSum(`<i>v</i>,<i>c</i>,${vec('k')}`)} <i>g</i><sub>s</sub><i>w</i><sub>${vec('k')}}</i> (<i>f</i><sub><i>v</i>${vec('k')}}</sub> &minus; <i>f</i><sub><i>c</i>${vec('k')}}</sub>) &lang;&psi;<sub><i>c</i>${vec('k')}}</sub>|${hat('p')}<sub>&alpha;</sub>|&psi;<sub><i>v</i>${vec('k')}}</sub>&rang;&lang;&psi;<sub><i>v</i>${vec('k')}}</sub>|${hat('p')}<sub>&beta;</sub>|&psi;<sub><i>c</i>${vec('k')}}</sub>&rang; &delta;(<i>E</i><sub><i>c</i>${vec('k')}}</sub> &minus; <i>E</i><sub><i>v</i>${vec('k')}}</sub> &minus; &#8463;&omega;)`, "7.1",
          "A rigid <strong>Levine–Allan scissors shift</strong> &Delta;<sub>sc</sub> corrects semilocal PBE gap underestimation by shifting transition energies (<i>E<sub>c</sub></i> &minus; <i>E<sub>v</sub></i> &rarr; <i>E<sub>c</sub></i> &minus; <i>E<sub>v</sub></i> + &Delta;<sub>sc</sub>) while renormalizing matrix elements to preserve the f-sum rule.")}

        <h3>7.2 Causality &amp; the Kramers–Kronig Relation</h3>
        <p>Because electromagnetic polarization cannot precede the applied field (causality), the real dispersive part &varepsilon;<sub>1,&alpha;&beta;</sub>(&omega;) is uniquely determined from &varepsilon;<sub>2,&alpha;&beta;</sub>(&omega;) by the Cauchy principal-value <strong>Kramers–Kronig transform</strong>:</p>
        ${eq(`&varepsilon;<sub>1,&alpha;&beta;</sub>(&omega;) = &delta;<sub>&alpha;&beta;</sub> + ${fr("2", "&pi;")} &#8472; ${opInt("0", "&infin;")} ${fr("&omega;&prime; &varepsilon;<sub>2,&alpha;&beta;</sub>(&omega;&prime;)", "&omega;&prime;<sup>2</sup> &minus; &omega;<sup>2</sup>")} d&omega;&prime;`, "7.2",
          "Evaluating at &omega; = 0 yields the electronic static dielectric constant &varepsilon;<sub>1</sub>(0) = &varepsilon;<sub>&infin;</sub> and static refractive index <i>n</i>(0) = &radic;&varepsilon;<sub>1</sub>(0). For metals or doped semiconductors, the intraband Drude term &minus;&omega;<sub>p</sub><sup>2</sup>/[&omega;(&omega; + <i>i</i>&gamma;<sub>D</sub>)] is added before deriving optical constants.")}

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

        <h3>7.4 Derived Optical Functions &amp; Tauc Optical Gap</h3>
        <p>From the complex dielectric function &varepsilon;(&omega;) = &varepsilon;<sub>1</sub>(&omega;) + <i>i</i>&varepsilon;<sub>2</sub>(&omega;) = (<i>n</i> + <i>ik</i>)<sup>2</sup>, every measurable optical spectrum follows analytically:</p>
        ${eq(`<i>n</i>(&omega;) = ${fr("1", "&radic;2")} <span class="dft-bigdel">[</span>&radic;(&varepsilon;<sub>1</sub><sup>2</sup> + &varepsilon;<sub>2</sub><sup>2</sup>) + &varepsilon;<sub>1</sub><span class="dft-bigdel">]</span><sup>1/2</sup>, &nbsp;&nbsp;&nbsp;&nbsp; <i>k</i>(&omega;) = ${fr("1", "&radic;2")} <span class="dft-bigdel">[</span>&radic;(&varepsilon;<sub>1</sub><sup>2</sup> + &varepsilon;<sub>2</sub><sup>2</sup>) &minus; &varepsilon;<sub>1</sub><span class="dft-bigdel">]</span><sup>1/2</sup>`, "7.3")}
        ${eq(`&alpha;(&omega;) = ${fr("2&omega; <i>k</i>(&omega;)", "<i>c</i>")}, &nbsp;&nbsp;&nbsp; <i>R</i>(&omega;) = ${fr("(<i>n</i> &minus; 1)<sup>2</sup> + <i>k</i><sup>2</sup>", "(<i>n</i> + 1)<sup>2</sup> + <i>k</i><sup>2</sup>")}, &nbsp;&nbsp;&nbsp; <i>L</i>(&omega;) = Im<span class="dft-bigdel">(</span>&minus;${fr("1", "&varepsilon;(&omega;)")}<span class="dft-bigdel">)</span> = ${fr("&varepsilon;<sub>2</sub>", "&varepsilon;<sub>1</sub><sup>2</sup> + &varepsilon;<sub>2</sub><sup>2</sup>")}`, "7.4",
          "Peaks in the Electron Energy Loss Function <i>L</i>(&omega;) identify collective bulk plasmon resonances (&hbar;&omega;<sub>p</sub>). Note: Materials Studio CASTEP displays &alpha; using 2<i>k</i>/&lambda; whereas standard SI textbooks use 4&pi;<i>k</i>/&lambda;—both conventions are selectable in our Optical <strong>More...</strong> menu.")}
        ${eq(`(&alpha; &#8463;&omega;)<sup>1/<i>r</i></sup> = <i>A</i>(&#8463;&omega; &minus; <i>E</i><sub>g</sub><sup>opt</sup>), &nbsp;&nbsp;&nbsp; <i>r</i> = ${fr("1", "2")} (direct allowed), &nbsp; <i>r</i> = 2 (indirect allowed)`, "7.5",
          "<strong>Tauc Relation:</strong> Extrapolating the linear absorption onset of (&alpha;&#8463;&omega;)<sup>2</sup> (direct) or (&alpha;&#8463;&omega;)<sup>1/2</sup> (indirect) to zero gives the optical band gap <i>E</i><sub>g</sub><sup>opt</sup>.")}

        ${labBox("Explore Full 3&times;3 Optical Tensor, Anisotropy &amp; Tauc Fit", "optics", "Open Optical Tab",
          `<ol class="dft-steps">
            <li>Open <strong>Data Analysis &rarr; 🌈 Optical</strong> and load an <code>Optical CASTEP Energy</code> folder containing <code>*_Optics.ome_bin</code> and <code>*_Optics.bands</code>.</li>
            <li>Switch <strong>Mode</strong> between <code>Polarized</code> (test <code>[100]</code> in-plane vs. <code>[001]</code> out-of-plane), <code>Unpolarized</code>, and <code>Polycrystalline</code>, and adjust Gaussian smearing &sigma; (default 0.50 eV) or <strong>Scissors</strong> shift &Delta;.</li>
            <li>Inspect the <strong>4-Panel Overview</strong> (&varepsilon;<sub>1</sub>/&varepsilon;<sub>2</sub>, &alpha;, <i>n/k</i>, <i>R</i> &amp; EELS <i>L</i>) with the rainbow Visible Light band (1.65–3.26 eV), or switch to <strong>Tauc Optical Gap Fit</strong> and <strong>Anisotropy Comparison</strong>. Right-click any individual panel (a–d) to copy it at 400–600 DPI!</li>
          </ol>`)}
      `
    }
  );
})();

(function () {
  const fr = (num, den) =>
    `<span class="dft-frac"><span class="dft-num">${num}</span><span class="dft-den">${den}</span></span>`;
  const vec = (s) => `<span class="dft-vec">${s}</span>`;
  const opSum = (sub, sup = "") =>
    `<span class="dft-bigop"><span class="dft-op-sup">${sup}</span><span class="dft-op-sym">&sum;</span><span class="dft-op-sub">${sub}</span></span>`;
  const opInt = (sub = "", sup = "") =>
    `<span class="dft-bigop"><span class="dft-op-sup">${sup}</span><span class="dft-op-sym">&int;</span><span class="dft-op-sub">${sub}</span></span>`;
  const eq = (expr, num, note = "") =>
    `<div class="dft-eq-box"><div class="dft-eq-inner"><div class="dft-eq-math">${expr}</div><div class="dft-eq-num">(${num})</div></div>${note ? `<div class="dft-eq-note">${note}</div>` : ""}</div>`;
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

  window.DFT_THEORY_LECTURES.push(
    // =========================================================================
    // LECTURE 8: CHARGE DENSITY DIFFERENCE (Δρ), CHARGE TRANSFER & ELF
    // =========================================================================
    {
      id: "lec8",
      num: 8,
      shortTab: "L8: Δρ & ELF",
      level: "Interm. → Adv.",
      levelClass: "adv",
      readTime: "15 min",
      toolPane: "chdiff",
      toolName: "Charge Diff (Δρ)",
      title: "Lecture 8: Charge Density Difference (&Delta;&rho;), Planar Charge Transfer &amp; Electron Localization (ELF)",
      subtitle: "Visualizing real-space bond formation, interfacial electron accumulation/depletion, integrated charge transfer ΔQ(z), work functions, and ELF bonding topology.",
      keywords: "charge density difference chdiff charg_frm deformation density planar average integrated charge transfer deltaQ work function dipole elf electron localization function isosurface",
      objectives: [
        "Distinguish deformation density (*.chdiff) from interfacial/adsorption differential density (&rho;<sub>AB</sub> &minus; &rho;<sub>A</sub> &minus; &rho;<sub>B</sub>).",
        "Integrate 3D Δρ(x,y,z) into 1D planar-averaged Δρ(z) and cumulative electron transfer ΔQ(z).",
        "Compute work functions Φ and interface dipole shifts ΔΦ via the Helmholtz relation.",
        "Interpret Electron Localization Function (ELF) values between 0 and 1 to classify covalent, metallic, and ionic bonds."
      ],
      html: () => `
        <h3>8.1 Two Physical Definitions of Charge Density Difference (&Delta;&rho;)</h3>
        <p>Total valence electron density &rho;(${vec('r')}) is overwhelmingly concentrated in spherical shells around nuclei, hiding subtle bonding rearrangements. Subtracting a well-defined reference density reveals exact electron redistribution (yellow: accumulation +&Delta;&rho;, cyan: depletion &minus;&Delta;&rho;):</p>
        ${eq(`<b>Deformation Density (<code>*.chdiff</code>):</b> &nbsp; &Delta;&rho;<sub>def</sub>(${vec('r')}) = &rho;<sub>SCF</sub>(${vec('r')}) &minus; ${opSum("<i>I</i>")} &rho;<sub><i>I</i></sub><sup>free atom</sup>(${vec('r')})`, "8.1",
          "Shows how neutral isolated atoms deform upon forming chemical bonds inside a crystal—positive lobes between atoms directly reveal covalent shared electron pairs.")}
        ${eq(`<b>Interfacial / Adsorption Density:</b> &nbsp; &Delta;&rho;<sub>ads</sub>(${vec('r')}) = &rho;<sub>AB</sub>(${vec('r')}) &minus; &rho;<sub>A</sub>(${vec('r')}) &minus; &rho;<sub>B</sub>(${vec('r')})`, "8.2",
          "Computed on the <em>exact same FFT grid and fixed atomic coordinates</em> for the combined system (AB) and isolated fragments (A = slab, B = adsorbate or second 2D layer in a heterostructure).")}

        <h3>8.2 1D Planar-Averaged &Delta;&rho;(<i>z</i>) &amp; Integrated Charge Transfer &Delta;<i>Q</i>(<i>z</i>)</h3>
        <p>For 2D surfaces, van der Waals heterojunctions (e.g., <code>WS<sub>2</sub>/MoSe<sub>2</sub></code>), and adsorbed catalysts, averaging &Delta;&rho;(<i>x</i>,<i>y</i>,<i>z</i>) over the in-plane unit cell area <i>S<sub>ab</sub></i> collapses 3D volumetric clouds into a quantitative 1D profile along the surface normal <i>z</i>:</p>
        ${eq(`&Delta;&rho;<sub>1D</sub>(<i>z</i>) = ${opInt("<i>S<sub>ab</sub></i>")} &Delta;&rho;(<i>x</i>,<i>y</i>,<i>z</i>) d<i>x</i> d<i>y</i>, &nbsp;&nbsp;&nbsp;&nbsp; &Delta;<i>Q</i>(<i>z</i>) = ${opInt("0", "<i>z</i>")} &Delta;&rho;<sub>1D</sub>(<i>z</i>&prime;) d<i>z</i>&prime;`, "8.3",
          "By charge conservation, &Delta;<i>Q</i>(<i>c</i>) = 0 across the full cell. The extremum max |&Delta;<i>Q</i>(<i>z</i>)| at the interfacial nodal plane gives the exact number of electrons transferred from donor to acceptor layer!")}

        <h3>8.3 Work Function (&Phi;), Interface Dipole &amp; Electron Localization Function (ELF)</h3>
        <p>The <strong>work function</strong> &Phi; is the minimum energy needed to remove an electron from the Fermi level into vacuum, where the planar-averaged electrostatic potential reaches a flat plateau <i>V</i><sub>vac</sub>. Interfacial charge transfer creates a surface dipole density &Delta;&mu;<sub><i>z</i></sub> that shifts &Phi; according to the Helmholtz equation:</p>
        ${eq(`&Phi; = <i>V</i><sub>vac</sub> &minus; <i>E</i><sub>F</sub>, &nbsp;&nbsp;&nbsp;&nbsp; &Delta;&Phi; = &minus;${fr("<i>e</i>", "&varepsilon;<sub>0</sub>")} &Delta;&mu;<sub><i>z</i></sub> = &minus;${fr("<i>e</i>", "&varepsilon;<sub>0</sub><i>S<sub>ab</sub></i>")} ${opInt()} <i>z</i> &Delta;&rho;<sub>1D</sub>(<i>z</i>) d<i>z</i>`, "8.4")}
        <p>To characterize local electron pairing without needing a promolecule reference, Becke and Edgecombe introduced the dimensionless <strong>Electron Localization Function (ELF)</strong> &isin; [0, 1] comparing the Pauli kinetic energy density <i>D</i>(${vec('r')}) against a uniform electron gas <i>D</i><sub>h</sub>(${vec('r')}) = (3/10)(3&pi;<sup>2</sup>)<sup>2/3</sup><i>n</i><sup>5/3</sup>:</p>
        ${eq(`ELF(${vec('r')}) = ${fr("1", `1 + [<i>D</i>(${vec('r')}) / <i>D</i><sub>h</sub>(${vec('r')})]<sup>2</sup>`)}, &nbsp;&nbsp;&nbsp;&nbsp; <i>D</i>(${vec('r')}) = ${fr("1", "2")} ${opSum("<i>i</i>")} |&nabla;&phi;<sub><i>i</i></sub>|<sup>2</sup> &minus; ${fr("1", "8")} ${fr("|&nabla;<i>n</i>|<sup>2</sup>", "<i>n</i>")}`, "8.5",
          "<strong>ELF = 1.0:</strong> perfect spin-paired localization (covalent bonds, lone pairs); <strong>ELF &approx; 0.5:</strong> homogeneous electron gas (metallic bonding); <strong>ELF &rarr; 0:</strong> low-density ionic regions between closed-shell ions.")}

        ${labBox("Visualize Synchronized 3D Clouds, 2D Contour Slices &amp; 1D ΔQ(z)", "chdiff", "Open Charge Diff (Δρ) Tab",
          `<ol class="dft-steps">
            <li>Open <strong>Data Analysis &rarr; 🔋 Charge Diff</strong> to inspect any CASTEP <code>*.chdiff</code> output (or switch <strong>Δρ Source</strong> to <code>Differential *.charg_frm (AB &minus; A &minus; B)</code> to upload three separate fragment grids).</li>
            <li>Adjust <strong>Plane</strong> (<code>(010)</code>, <code>(100)</code>, <code>(001)</code>), slide <strong>Pos</strong> through atomic layers, tune <strong>Iso (e/&Aring;<sup>3</sup>)</strong>, and read quantitative <code>Max |&Delta;Q(z)|</code> in Panel (c).</li>
            <li>Click <strong>🧱 3D Isosurface</strong> to project volumetric yellow/cyan &Delta;&rho; clouds directly inside the interactive 3D VESTA viewer!</li>
          </ol>`)}
      `
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
      readTime: "18 min",
      toolPane: "mulliken",
      toolName: "Mulliken & Spin",
      title: "Lecture 9: Spin-Polarized DFT, Magnetism, Mulliken/Hirshfeld Charges &amp; Orbital Spin Matrix",
      subtitle: "From collinear LSDA and non-collinear SOC to crystal-field d-orbital splitting, overlap bond populations, and orbital-resolved magnetic spin matrices.",
      keywords: "spin polarized magnetism lsda non-collinear soc spin orbit coupling ferromagnetic fm antiferromagnetic afm ferrimagnetic fim mulliken hirshfeld bond population spin matrix crystal field t2g eg d-orbital",
      objectives: [
        "Formulate collinear spin-polarized DFT (&rho;<sub>&uarr;</sub>, &rho;<sub>&darr;</sub>) and non-collinear vector magnetization with Spin–Orbit Coupling (SOC).",
        "Differentiate Ferromagnetic (FM), Antiferromagnetic (AFM), and Ferrimagnetic (FiM) ground states from atomic moments &mu;<sub><i>I</i></sub>.",
        "Contrast Mulliken LCAO atomic/bond populations with Hirshfeld stockholder charges.",
        "Interpret the 5×5 d-orbital Spin Matrix in terms of crystal-field splitting (<i>t</i><sub>2g</sub> vs. <i>e</i><sub>g</sub>) and magnetic anisotropy."
      ],
      html: () => `
        <h3>9.1 Collinear &amp; Non-Collinear Spin-Polarized DFT</h3>
        <p>In open-shell transition metals, defects, and radicals, spin-up (&uarr;, &alpha;) and spin-down (&darr;, &beta;) electrons experience different exchange potentials because Pauli exchange acts only between parallel spins. Spin-polarized DFT splits total density and magnetization density as:</p>
        ${eq(`<i>n</i>(${vec('r')}) = <i>n</i><sub>&uarr;</sub>(${vec('r')}) + <i>n</i><sub>&darr;</sub>(${vec('r')}), &nbsp;&nbsp;&nbsp;&nbsp; <i>m</i>(${vec('r')}) = <i>n</i><sub>&uarr;</sub>(${vec('r')}) &minus; <i>n</i><sub>&darr;</sub>(${vec('r')}), &nbsp;&nbsp;&nbsp;&nbsp; <i>M</i><sub>net</sub> = &mu;<sub>B</sub> ${opInt()} <i>m</i>(${vec('r')}) d<sup>3</sup>${vec('r')}`, "9.1",
          "Two coupled Kohn–Sham equations with spin-dependent potentials <i>v</i><sub>eff,&uarr;</sub> and <i>v</i><sub>eff,&darr;</sub> are solved self-consistently. Comparing total net moment <i>M</i><sub>net</sub> = &sum;&mu;<sub><i>I</i></sub> against absolute moment <i>M</i><sub>abs</sub> = &sum;|&mu;<sub><i>I</i></sub>| classifies the phase: <strong>FM</strong> (all spins parallel, |<i>M</i><sub>net</sub>| &approx; <i>M</i><sub>abs</sub>), <strong>AFM</strong> (canceling antiparallel sublattices, <i>M</i><sub>net</sub> &approx; 0 while <i>M</i><sub>abs</sub> &gt; 0), or <strong>FiM</strong> (unequal antiparallel sublattices, 0 &lt; |<i>M</i><sub>net</sub>| &lt; <i>M</i><sub>abs</sub>).")}
        <p>For heavy elements (Mo, W, Pt, Bi, lanthanides), relativistic <strong>Spin–Orbit Coupling (SOC)</strong> adds &lambda;<sub>SOC</sub>&thinsp;<b>L</b>&middot;<b>S</b> and requires 2-component Pauli spinors &Psi;<sub><i>i</i></sub>(${vec('r')}) = (&phi;<sub><i>i</i>&uarr;</sub>, &phi;<sub><i>i</i>&darr;</sub>)<sup>T</sup> with full vector magnetization ${vec('m')}(${vec('r')}) = (<i>m<sub>x</sub></i>, <i>m<sub>y</sub></i>, <i>m<sub>z</sub></i>), unlocking Rashba spin splitting and Magnetic Anisotropy Energy (MAE = <i>E</i><sub>&parallel;</sub> &minus; <i>E</i><sub>&perp;</sub>).</p>

        <h3>9.2 Mulliken Population, Overlap Bond Population &amp; Hirshfeld Charges</h3>
        <p>Because plane waves are delocalized across the entire unit cell, CASTEP projects converged Bloch orbitals onto a localized atomic-orbital basis {&chi;<sub>&mu;</sub>} (Segall–Pickard formalism) to obtain the density matrix <b>P</b> and overlap matrix <b>S</b>:</p>
        ${eq(`<i>q</i><sub><i>I</i></sub><sup>Mulliken</sup> = <i>Z</i><sub><i>I</i></sub><sup>val</sup> &minus; ${opSum("&mu;&isin;<i>I</i>")} (<b>P</b><b>S</b>)<sub>&mu;&mu;</sub>, &nbsp;&nbsp;&nbsp;&nbsp; <i>P</i><sub><i>IJ</i></sub><sup>bond</sup> = 2 ${opSum("&mu;&isin;<i>I</i>,&thinsp;&nu;&isin;<i>J</i>")} <i>P</i><sub>&mu;&nu;</sub> <i>S</i><sub>&nu;&mu;</sub>`, "9.2",
          "<strong>Mulliken Bond Population <i>P</i><sub><i>IJ</i></sub>:</strong> large positive values (e.g., +0.5 to +1.9 in C&equiv;N or Si–N) indicate strong <strong>covalent</strong> bonding; values near 0 indicate <strong>ionic</strong> character; negative values denote <strong>antibonding</strong> repulsion.")}
        <p><strong>Hirshfeld ("Stockholder") Population Analysis</strong> partitions real-space density directly using promolecule atomic weights, making Hirshfeld charges completely basis-set-independent and physically smoother:</p>
        ${eq(`<i>w<sub>I</sub></i>(${vec('r')}) = ${fr(`&rho;<sub><i>I</i></sub><sup>free</sup>(${vec('r')})`, `${opSum("<i>J</i>")} &rho;<sub><i>J</i></sub><sup>free</sup>(${vec('r')})`)}, &nbsp;&nbsp;&nbsp;&nbsp; <i>q<sub>I</sub></i><sup>Hirsh</sup> = <i>Z<sub>I</sub></i><sup>val</sup> &minus; ${opInt()} <i>w<sub>I</sub></i>(${vec('r')}) &rho;<sub>SCF</sub>(${vec('r')}) d<sup>3</sup>${vec('r')}`, "9.3")}

        <h3>9.3 Orbital-Resolved Spin Density Matrix &amp; Crystal-Field Splitting</h3>
        <p>Decomposing atomic spin moments &mu;<sub><i>I</i></sub> = &sum;<sub><i>l</i>,<i>m</i></sub> (<i>n</i><sub><i>I</i>,<i>lm</i></sub><sup>&uarr;</sup> &minus; <i>n</i><sub><i>I</i>,<i>lm</i></sub><sup>&darr;</sup>)&thinsp;&mu;<sub>B</sub> across individual magnetic quantum numbers—<i>p<sub>x</sub></i>, <i>p<sub>y</sub></i>, <i>p<sub>z</sub></i> and the five <i>d</i>-orbitals (<i>d</i><sub><i>z</i><sup>2</sup></sub>, <i>d<sub>zy</sub></i>, <i>d<sub>zx</sub></i>, <i>d</i><sub><i>x</i><sup>2</sup>&minus;<i>y</i><sup>2</sup></sub>, <i>d<sub>xy</sub></i>)—constructs the <strong>Orbital-Resolved Spin Matrix</strong>:</p>
        ${eq(`<i>S</i><sub><i>m</i>,<i>m</i>&prime;</sub><sup>(<i>I</i>,<i>l</i>)</sup> = &delta;<sub><i>mm</i>&prime;</sub> <span class="dft-bigdel">(</span> <i>n</i><sub><i>I</i>,<i>lm</i></sub><sup>&uarr;</sup> &minus; <i>n</i><sub><i>I</i>,<i>lm</i></sub><sup>&darr;</sup> <span class="dft-bigdel">)</span> &mu;<sub>B</sub>, &nbsp;&nbsp;&nbsp;&nbsp; Tr<span class="dft-bigdel">[</span><b>S</b><sup>(<i>I</i>,<i>l</i>)</sup><span class="dft-bigdel">]</span> = &mu;<sub><i>I</i>,<i>l</i></sub>`, "9.4")}

        <div class="dft-diagram-wrap">
          <svg viewBox="0 0 860 155" width="100%" height="155" role="img" aria-label="Octahedral Crystal Field Splitting of d-orbitals into t2g and eg">
            <text x="145" y="20" text-anchor="middle" font-size="11.5" font-weight="700" fill="#0f172a">Free Transition-Metal Ion (5-fold d)</text>
            <line x1="65" y1="84" x2="225" y2="84" stroke="#334155" stroke-width="2.4"/>
            <text x="145" y="102" text-anchor="middle" font-size="10.5" fill="#475569">d<tspan dy="3" font-size="8">z&sup2;</tspan><tspan dy="-3">, d</tspan><tspan dy="3" font-size="8">x&sup2;&minus;y&sup2;</tspan><tspan dy="-3">, d</tspan><tspan dy="3" font-size="8">xy</tspan><tspan dy="-3">, d</tspan><tspan dy="3" font-size="8">zx</tspan><tspan dy="-3">, d</tspan><tspan dy="3" font-size="8">zy</tspan></text>

            <line x1="230" y1="84" x2="310" y2="42" stroke="#94a3b8" stroke-width="1.3" stroke-dasharray="4 3"/>
            <line x1="230" y1="84" x2="310" y2="118" stroke="#94a3b8" stroke-width="1.3" stroke-dasharray="4 3"/>

            <text x="415" y="20" text-anchor="middle" font-size="11.5" font-weight="700" fill="#1e3a8a">Octahedral Ligand Field (O<tspan dy="3" font-size="8.5">h</tspan><tspan dy="-3">)</tspan></text>
            <!-- e_g levels -->
            <line x1="330" y1="42" x2="400" y2="42" stroke="#dc2626" stroke-width="2.6"/>
            <line x1="425" y1="42" x2="495" y2="42" stroke="#dc2626" stroke-width="2.6"/>
            <text x="365" y="58" text-anchor="middle" font-size="10.5" font-weight="700" fill="#dc2626">d<tspan dy="3" font-size="8">z&sup2;</tspan></text>
            <text x="460" y="58" text-anchor="middle" font-size="10.5" font-weight="700" fill="#dc2626">d<tspan dy="3" font-size="8">x&sup2;&minus;y&sup2;</tspan></text>
            <text x="520" y="46" font-size="11" font-weight="800" fill="#dc2626">e<tspan dy="3" font-size="8.5">g</tspan><tspan dy="-3"> (+0.6 &Delta;</tspan><tspan dy="3" font-size="8.5">o</tspan><tspan dy="-3">)</tspan></text>

            <!-- t_2g levels -->
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
      `
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
      readTime: "14 min",
      toolPane: "gateway",
      toolName: "Gateway & Export",
      title: "Lecture 10: Practical End-to-End DFT Workflow, Convergence Testing &amp; Publication Best Practices",
      subtitle: "A step-by-step protocol from raw .cif crystal structure to converged CASTEP/VASP jobs, troubleshooting SCF issues, and journal-grade 600 DPI figures.",
      keywords: "workflow convergence test ecut kpoint vacuum troubleshooting scf mixing dipole correction publication figure dpi tnr gateway castep checklist",
      objectives: [
        "Execute a reproducible 6-stage DFT research workflow from .cif import to publication-ready figures.",
        "Run rigorous <i>E</i><sub>cut</sub>, k-mesh, and vacuum-thickness convergence tests before production calculations.",
        "Diagnose and fix the 5 most common DFT calculation failures (SCF oscillation, false metals, spin collapse, Pulay stress, slab dipoles).",
        "Standardize figure typography, 400–600 DPI PNG export, and raw TSV/Excel data archiving on this platform."
      ],
      html: () => `
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

        <h3>10.2 Troubleshooting Common DFT Pitfalls</h3>
        <table class="dft-table">
          <thead><tr><th>Symptom / Problem</th><th>Physical Cause</th><th>Recommended Fix in CASTEP / VASP</th></tr></thead>
          <tbody>
            <tr><td><strong>SCF energy oscillates / never converges</strong></td><td>Charge sloshing in metals, slabs, or small-gap systems</td><td>Reduce <code>mix_charge_amp</code> (0.8 &rarr; 0.2), use Pulay/Broyden mixing, increase <code>smearing_width</code> to 0.05–0.10 eV, increase <code>nextra_bands</code>.</td></tr>
            <tr><td><strong>Semiconductor predicted metallic</strong></td><td>PBE self-interaction error closes narrow band gaps</td><td>Check with <strong>HSE06</strong> or <strong>PBE+<i>U</i></strong> (for 3<i>d</i>/4<i>f</i>); verify whether spin-polarization splits the Fermi-crossing band.</td></tr>
            <tr><td><strong>2D slab vacuum potential is tilted</strong></td><td>Asymmetric Janus / adsorbed slab creates net <i>z</i>-dipole across periodic images</td><td>Enable dipole correction (<code>dipole_correction: selfconsistent</code>) and ensure vacuum &ge; 18–20 &Aring;.</td></tr>
            <tr><td><strong>Magnetic moment collapses to 0 &mu;<sub>B</sub></strong></td><td>Zero initial spin symmetry traps SCF at unstable non-magnetic saddle point</td><td>Seed non-zero initial atomic spins (<code>SPIN=3.0</code> on Fe/Co/Mn/Cr) and test both FM and AFM initial orderings.</td></tr>
            <tr><td><strong>Noisy effective mass / jagged DOS</strong></td><td>Too few k-points near VBM/CBM or overly broad Gaussian smearing</td><td>Increase path density (&Delta;<i>k</i> &le; 0.015 &Aring;<sup>&minus;1</sup> near extrema) and inspect <i>R</i><sup>2</sup> &ge; 0.99 in <strong>m* &amp; Drude</strong>.</td></tr>
          </tbody>
        </table>

        <h3>10.3 Quick-Reference Map: DFT Theory &rarr; Live Website Modules</h3>
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
            <li>Use <strong>📋 Copy HD</strong> (full figure) or <strong>Right-Click</strong> (individual sub-panel) to paste crisp figures straight into Word, PowerPoint, or OriginPro!</li>
          </ol>`,
          `<button type="button" class="btn btn-outline btn-sm" onclick="openCastepToolFromLecture('electronic')">&#128200; Open Band &amp; PDOS</button>`)}
      `
    }
  );

  // =========================================================================
  // INTERACTIVE LECTURE CONTROLLER (Sub-Tabs, Search, Prev/Next, Live Bridges)
  // =========================================================================
  let _activeLectureId = "lec1";

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
    _activeLectureId = lecId || "lec1";
    if (typeof switchTabByName === "function") {
      switchTabByName("dft-theory");
    } else if (typeof switchTab === "function") {
      switchTab("dft-theory");
    }
    renderDftTheoryTab(_activeLectureId);
  }
  window.openDftTheoryLecture = openDftTheoryLecture;

  function switchDftLecture(lecId, shouldScroll = true) {
    const lectures = window.DFT_THEORY_LECTURES || [];
    const found = lectures.find(l => l.id === lecId) || lectures[0];
    if (!found) return;
    _activeLectureId = found.id;
    try { localStorage.setItem("dft_theory_active_lec", found.id); } catch (_) {}

    // Update sub-tab active states
    document.querySelectorAll(".dft-lec-tab").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.lec === found.id);
    });

    const stage = document.getElementById("dft-theory-lecture-stage");
    if (!stage) return;
    const idx = lectures.findIndex(l => l.id === found.id);
    const prevLec = idx > 0 ? lectures[idx - 1] : null;
    const nextLec = idx < lectures.length - 1 ? lectures[idx + 1] : null;

    const objItems = (found.objectives || []).map(o => `<li>${o}</li>`).join("");
    stage.innerHTML = `
      <article class="dft-lec-article">
        <header class="dft-lec-header">
          <div class="dft-lec-meta-row">
            <span class="dft-level-badge dft-level-${found.levelClass}">Lecture ${found.num} of ${lectures.length} &bull; ${found.level}</span>
            <span class="dft-meta-pill">&#9201; ${found.readTime} read</span>
            <button type="button" class="dft-meta-pill dft-meta-link" onclick="openCastepToolFromLecture('${found.toolPane}')" title="Jump directly to the matching live module in Data Analysis">
              &#128640; Linked Tool: ${found.toolName} &rarr;
            </button>
          </div>
          <h2 class="dft-lec-title">${found.title}</h2>
          <p class="dft-lec-subtitle">${found.subtitle}</p>
          <div class="dft-obj-box">
            <div class="dft-obj-title">&#127919; Learning Objectives</div>
            <ul>${objItems}</ul>
          </div>
        </header>

        <div class="dft-lec-content">
          ${found.html()}
        </div>

        <footer class="dft-lec-footer">
          ${prevLec
            ? `<button type="button" class="btn btn-outline btn-sm" onclick="switchDftLecture('${prevLec.id}', true)">&larr; Lecture ${prevLec.num}: ${prevLec.shortTab.replace(/^L\d+:\s*/, "")}</button>`
            : `<span></span>`}
          <span style="font-size:11.5px; color:#64748b; font-weight:600;">Lecture ${found.num} / ${lectures.length} &bull; Density Functional Theory Curriculum</span>
          ${nextLec
            ? `<button type="button" class="btn btn-primary btn-sm" onclick="switchDftLecture('${nextLec.id}', true)">Lecture ${nextLec.num}: ${nextLec.shortTab.replace(/^L\d+:\s*/, "")} &rarr;</button>`
            : `<button type="button" class="btn btn-teal btn-sm" onclick="openCastepToolFromLecture('builder')">&#128640; Launch Data Analysis Workbench &rarr;</button>`}
        </footer>
      </article>
    `;

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
    const lectures = window.DFT_THEORY_LECTURES || [];
    let firstMatch = null;
    let matchCount = 0;
    document.querySelectorAll(".dft-lec-tab").forEach(btn => {
      const lec = lectures.find(l => l.id === btn.dataset.lec);
      if (!lec) return;
      const hay = `${lec.title} ${lec.subtitle} ${lec.keywords} ${lec.toolName} ${lec.level}`.toLowerCase();
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
      statusEl.textContent = q ? `${matchCount} / ${lectures.length} matching lectures` : `${lectures.length} Lectures (Basic → Advanced)`;
    }
    if (q && firstMatch && firstMatch !== _activeLectureId) {
      switchDftLecture(firstMatch, false);
    }
  }
  window.filterDftLectures = filterDftLectures;

  function renderDftTheoryTab(lecIdOverride) {
    const lectures = window.DFT_THEORY_LECTURES || [];
    const tabsBar = document.getElementById("dft-theory-lecture-tabs");
    if (tabsBar && !tabsBar.dataset.built) {
      tabsBar.dataset.built = "1";
      tabsBar.innerHTML = lectures.map(lec => `
        <button type="button" class="dft-lec-tab${lec.id === _activeLectureId ? " active" : ""}" data-lec="${lec.id}" onclick="switchDftLecture('${lec.id}', false)" title="${lec.title}">
          <span class="dft-lec-tab-num">L${lec.num}</span>
          <span class="dft-lec-tab-lbl">${lec.shortTab.replace(/^L\d+:\s*/, "")}</span>
        </button>
      `).join("");
    }
    let target = lecIdOverride || _activeLectureId;
    if (!lecIdOverride) {
      try {
        const saved = localStorage.getItem("dft_theory_active_lec");
        if (saved && lectures.some(l => l.id === saved)) target = saved;
      } catch (_) {}
    }
    switchDftLecture(target, false);
  }
  window.renderDftTheoryTab = renderDftTheoryTab;

  // Populate compact Lecture quick-jump pills on the Dashboard card if present
  function initDashboardDftCard() {
    const grid = document.getElementById("dashboard-dft-lectures-pills");
    const lectures = window.DFT_THEORY_LECTURES || [];
    if (!grid || !lectures.length) return;
    grid.innerHTML = lectures.map(lec => `
      <button type="button" class="dft-dash-pill" onclick="openDftTheoryLecture('${lec.id}')" title="${lec.title}">
        <span class="dft-dash-num">Lecture ${lec.num}</span>
        <span class="dft-dash-name">${lec.shortTab.replace(/^L\d+:\s*/, "")}</span>
      </button>
    `).join("");
  }
  window.initDashboardDftCard = initDashboardDftCard;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDashboardDftCard);
  } else {
    initDashboardDftCard();
  }
})();
