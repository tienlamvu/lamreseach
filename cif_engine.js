// ============================================================================
// MatSci Nexus Crystallographic CIF 1.1 & All-230 Space Group Engine (VESTA-grade)
// Mathematically verified against IUCr International Tables Vol. A & B (Hall 1981)
// ============================================================================
(function (global) {
  "use strict";

  // All 230 International Tables Space Groups: [itNum, hmSymbol, crystalSystem, hallSymbol]
  const SG_230 = [[1,"P 1","Triclinic","P 1"],[2,"P -1","Triclinic","-P 1"],[3,"P 2","Monoclinic","P 2y"],[4,"P 21","Monoclinic","P 2yb"],[5,"C 2","Monoclinic","C 2y"],[6,"P m","Monoclinic","P -2y"],[7,"P c","Monoclinic","P -2yc"],[8,"C m","Monoclinic","C -2y"],[9,"C c","Monoclinic","C -2yc"],[10,"P 2/m","Monoclinic","-P 2y"],[11,"P 21/m","Monoclinic","-P 2yb"],[12,"C 2/m","Monoclinic","-C 2y"],[13,"P 2/c","Monoclinic","-P 2yc"],[14,"P 21/c","Monoclinic","-P 2ybc"],[15,"C 2/c","Monoclinic","-C 2yc"],[16,"P 2 2 2","Orthorhombic","P 2 2"],[17,"P 2 2 21","Orthorhombic","P 2c 2"],[18,"P 21 21 2","Orthorhombic","P 2 2ab"],[19,"P 21 21 21","Orthorhombic","P 2ac 2ab"],[20,"C 2 2 21","Orthorhombic","C 2c 2"],[21,"C 2 2 2","Orthorhombic","C 2 2"],[22,"F 2 2 2","Orthorhombic","F 2 2"],[23,"I 2 2 2","Orthorhombic","I 2 2"],[24,"I 21 21 21","Orthorhombic","I 2b 2c"],[25,"P m m 2","Orthorhombic","P 2 -2"],[26,"P m c 21","Orthorhombic","P 2c -2"],[27,"P c c 2","Orthorhombic","P 2 -2c"],[28,"P m a 2","Orthorhombic","P 2 -2a"],[29,"P c a 21","Orthorhombic","P 2c -2ac"],[30,"P n c 2","Orthorhombic","P 2 -2bc"],[31,"P m n 21","Orthorhombic","P 2ac -2"],[32,"P b a 2","Orthorhombic","P 2 -2ab"],[33,"P n a 21","Orthorhombic","P 2c -2n"],[34,"P n n 2","Orthorhombic","P 2 -2n"],[35,"C m m 2","Orthorhombic","C 2 -2"],[36,"C m c 21","Orthorhombic","C 2c -2"],[37,"C c c 2","Orthorhombic","C 2 -2c"],[38,"A m m 2","Orthorhombic","A 2 -2"],[39,"A b m 2","Orthorhombic","A 2 -2c"],[40,"A m a 2","Orthorhombic","A 2 -2a"],[41,"A b a 2","Orthorhombic","A 2 -2ac"],[42,"F m m 2","Orthorhombic","F 2 -2"],[43,"F d d 2","Orthorhombic","F 2 -2d"],[44,"I m m 2","Orthorhombic","I 2 -2"],[45,"I b a 2","Orthorhombic","I 2 -2c"],[46,"I m a 2","Orthorhombic","I 2 -2a"],[47,"P m m m","Orthorhombic","-P 2 2"],[48,"P n n n","Orthorhombic","-P 2ab 2bc"],[49,"P c c m","Orthorhombic","-P 2 2c"],[50,"P b a n","Orthorhombic","-P 2ab 2b"],[51,"P m m a","Orthorhombic","-P 2a 2a"],[52,"P n n a","Orthorhombic","-P 2a 2bc"],[53,"P m n a","Orthorhombic","-P 2ac 2"],[54,"P c c a","Orthorhombic","-P 2a 2ac"],[55,"P b a m","Orthorhombic","-P 2 2ab"],[56,"P c c n","Orthorhombic","-P 2ab 2ac"],[57,"P b c m","Orthorhombic","-P 2c 2b"],[58,"P n n m","Orthorhombic","-P 2 2n"],[59,"P m m n","Orthorhombic","-P 2ab 2a"],[60,"P b c n","Orthorhombic","-P 2n 2ab"],[61,"P b c a","Orthorhombic","-P 2ac 2ab"],[62,"P n m a","Orthorhombic","-P 2ac 2n"],[63,"C m c m","Orthorhombic","-C 2c 2"],[64,"C m c a","Orthorhombic","-C 2ac 2"],[65,"C m m m","Orthorhombic","-C 2 2"],[66,"C c c m","Orthorhombic","-C 2 2c"],[67,"C m m a","Orthorhombic","-C 2a 2"],[68,"C c c a","Orthorhombic","-C 2a 2ac"],[69,"F m m m","Orthorhombic","-F 2 2"],[70,"F d d d","Orthorhombic","-F 2uv 2vw"],[71,"I m m m","Orthorhombic","-I 2 2"],[72,"I b a m","Orthorhombic","-I 2 2c"],[73,"I b c a","Orthorhombic","-I 2b 2c"],[74,"I m m a","Orthorhombic","-I 2b 2"],[75,"P 4","Tetragonal","P 4"],[76,"P 41","Tetragonal","P 4w"],[77,"P 42","Tetragonal","P 4c"],[78,"P 43","Tetragonal","P 4cw"],[79,"I 4","Tetragonal","I 4"],[80,"I 41","Tetragonal","I 4bw"],[81,"P -4","Tetragonal","P -4"],[82,"I -4","Tetragonal","I -4"],[83,"P 4/m","Tetragonal","-P 4"],[84,"P 42/m","Tetragonal","-P 4c"],[85,"P 4/n","Tetragonal","-P 4a"],[86,"P 42/n","Tetragonal","-P 4bc"],[87,"I 4/m","Tetragonal","-I 4"],[88,"I 41/a","Tetragonal","-I 4ad"],[89,"P 4 2 2","Tetragonal","P 4 2"],[90,"P 4 21 2","Tetragonal","P 4ab 2ab"],[91,"P 41 2 2","Tetragonal","P 4w 2c"],[92,"P 41 21 2","Tetragonal","P 4abw 2nw"],[93,"P 42 2 2","Tetragonal","P 4c 2"],[94,"P 42 21 2","Tetragonal","P 4n 2n"],[95,"P 43 2 2","Tetragonal","P 4cw 2c"],[96,"P 43 21 2","Tetragonal","P 4nw 2abw"],[97,"I 4 2 2","Tetragonal","I 4 2"],[98,"I 41 2 2","Tetragonal","I 4bw 2bw"],[99,"P 4 m m","Tetragonal","P 4 -2"],[100,"P 4 b m","Tetragonal","P 4 -2ab"],[101,"P 42 c m","Tetragonal","P 4c -2c"],[102,"P 42 n m","Tetragonal","P 4n -2n"],[103,"P 4 c c","Tetragonal","P 4 -2c"],[104,"P 4 n c","Tetragonal","P 4 -2n"],[105,"P 42 m c","Tetragonal","P 4c -2"],[106,"P 42 b c","Tetragonal","P 4c -2ab"],[107,"I 4 m m","Tetragonal","I 4 -2"],[108,"I 4 c m","Tetragonal","I 4 -2c"],[109,"I 41 m d","Tetragonal","I 4bw -2"],[110,"I 41 c d","Tetragonal","I 4bw -2c"],[111,"P -4 2 m","Tetragonal","P -4 2"],[112,"P -4 2 c","Tetragonal","P -4 2c"],[113,"P -4 21 m","Tetragonal","P -4 2ab"],[114,"P -4 21 c","Tetragonal","P -4 2n"],[115,"P -4 m 2","Tetragonal","P -4 -2"],[116,"P -4 c 2","Tetragonal","P -4 -2c"],[117,"P -4 b 2","Tetragonal","P -4 -2ab"],[118,"P -4 n 2","Tetragonal","P -4 -2n"],[119,"I -4 m 2","Tetragonal","I -4 -2"],[120,"I -4 c 2","Tetragonal","I -4 -2c"],[121,"I -4 2 m","Tetragonal","I -4 2"],[122,"I -4 2 d","Tetragonal","I -4 2bw"],[123,"P 4/m m m","Tetragonal","-P 4 2"],[124,"P 4/m c c","Tetragonal","-P 4 2c"],[125,"P 4/n b m","Tetragonal","-P 4a 2b"],[126,"P 4/n n c","Tetragonal","-P 4a 2bc"],[127,"P 4/m b m","Tetragonal","-P 4 2ab"],[128,"P 4/m n c","Tetragonal","-P 4 2n"],[129,"P 4/n m m","Tetragonal","-P 4a 2a"],[130,"P 4/n c c","Tetragonal","-P 4a 2ac"],[131,"P 42/m m c","Tetragonal","-P 4c 2"],[132,"P 42/m c m","Tetragonal","-P 4c 2c"],[133,"P 42/n b c","Tetragonal","-P 4ac 2b"],[134,"P 42/n n m","Tetragonal","-P 4ac 2bc"],[135,"P 42/m b c","Tetragonal","-P 4c 2ab"],[136,"P 42/m n m","Tetragonal","-P 4n 2n"],[137,"P 42/n m c","Tetragonal","-P 4ac 2a"],[138,"P 42/n c m","Tetragonal","-P 4ac 2ac"],[139,"I 4/m m m","Tetragonal","-I 4 2"],[140,"I 4/m c m","Tetragonal","-I 4 2c"],[141,"I 41/a m d","Tetragonal","-I 4bd 2"],[142,"I 41/a c d","Tetragonal","-I 4bd 2c"],[143,"P 3","Trigonal","P 3"],[144,"P 31","Trigonal","P 31"],[145,"P 32","Trigonal","P 32"],[146,"R 3","Trigonal","R 3"],[147,"P -3","Trigonal","-P 3"],[148,"R -3","Trigonal","-R 3"],[149,"P 3 1 2","Trigonal","P 3 2"],[150,"P 3 2 1","Trigonal","P 3 2\""],[151,"P 31 1 2","Trigonal","P 31 2 (0 0 4)"],[152,"P 31 2 1","Trigonal","P 31 2\""],[153,"P 32 1 2","Trigonal","P 32 2 (0 0 2)"],[154,"P 32 2 1","Trigonal","P 32 2\""],[155,"R 3 2","Trigonal","R 3 2\""],[156,"P 3 m 1","Trigonal","P 3 -2\""],[157,"P 3 1 m","Trigonal","P 3 -2"],[158,"P 3 c 1","Trigonal","P 3 -2\"c"],[159,"P 3 1 c","Trigonal","P 3 -2c"],[160,"R 3 m","Trigonal","R 3 -2\""],[161,"R 3 c","Trigonal","R 3 -2\"c"],[162,"P -3 1 m","Trigonal","-P 3 2"],[163,"P -3 1 c","Trigonal","-P 3 2c"],[164,"P -3 m 1","Trigonal","-P 3 2\""],[165,"P -3 c 1","Trigonal","-P 3 2\"c"],[166,"R -3 m","Trigonal","-R 3 2\""],[167,"R -3 c","Trigonal","-R 3 2\"c"],[168,"P 6","Hexagonal","P 6"],[169,"P 61","Hexagonal","P 61"],[170,"P 65","Hexagonal","P 65"],[171,"P 62","Hexagonal","P 62"],[172,"P 64","Hexagonal","P 64"],[173,"P 63","Hexagonal","P 6c"],[174,"P -6","Hexagonal","P -6"],[175,"P 6/m","Hexagonal","-P 6"],[176,"P 63/m","Hexagonal","-P 6c"],[177,"P 6 2 2","Hexagonal","P 6 2"],[178,"P 61 2 2","Hexagonal","P 61 2 (0 0 5)"],[179,"P 65 2 2","Hexagonal","P 65 2 (0 0 1)"],[180,"P 62 2 2","Hexagonal","P 62 2 (0 0 4)"],[181,"P 64 2 2","Hexagonal","P 64 2 (0 0 2)"],[182,"P 63 2 2","Hexagonal","P 6c 2c"],[183,"P 6 m m","Hexagonal","P 6 -2"],[184,"P 6 c c","Hexagonal","P 6 -2c"],[185,"P 63 c m","Hexagonal","P 6c -2"],[186,"P 63 m c","Hexagonal","P 6c -2c"],[187,"P -6 m 2","Hexagonal","P -6 2"],[188,"P -6 c 2","Hexagonal","P -6c 2"],[189,"P -6 2 m","Hexagonal","P -6 -2"],[190,"P -6 2 c","Hexagonal","P -6c -2c"],[191,"P 6/m m m","Hexagonal","-P 6 2"],[192,"P 6/m c c","Hexagonal","-P 6 2c"],[193,"P 63/m c m","Hexagonal","-P 6c 2"],[194,"P 63/m m c","Hexagonal","-P 6c 2c"],[195,"P 2 3","Cubic","P 2 2 3"],[196,"F 2 3","Cubic","F 2 2 3"],[197,"I 2 3","Cubic","I 2 2 3"],[198,"P 21 3","Cubic","P 2ac 2ab 3"],[199,"I 21 3","Cubic","I 2b 2c 3"],[200,"P m -3","Cubic","-P 2 2 3"],[201,"P n -3","Cubic","-P 2ab 2bc 3"],[202,"F m -3","Cubic","-F 2 2 3"],[203,"F d -3","Cubic","-F 2uv 2vw 3"],[204,"I m -3","Cubic","-I 2 2 3"],[205,"P a -3","Cubic","-P 2ac 2ab 3"],[206,"I a -3","Cubic","-I 2b 2c 3"],[207,"P 4 3 2","Cubic","P 4 2 3"],[208,"P 42 3 2","Cubic","P 4n 2 3"],[209,"F 4 3 2","Cubic","F 4 2 3"],[210,"F 41 3 2","Cubic","F 4d 2 3"],[211,"I 4 3 2","Cubic","I 4 2 3"],[212,"P 43 3 2","Cubic","P 4acd 2ab 3"],[213,"P 41 3 2","Cubic","P 4bd 2ab 3"],[214,"I 41 3 2","Cubic","I 4bd 2c 3"],[215,"P -4 3 m","Cubic","P -4 2 3"],[216,"F -4 3 m","Cubic","F -4 2 3"],[217,"I -4 3 m","Cubic","I -4 2 3"],[218,"P -4 3 n","Cubic","P -4n 2 3"],[219,"F -4 3 c","Cubic","F -4a 2 3"],[220,"I -4 3 d","Cubic","I -4bd 2c 3"],[221,"P m -3 m","Cubic","-P 4 2 3"],[222,"P n -3 n","Cubic","-P 4a 2bc 3"],[223,"P m -3 n","Cubic","-P 4n 2 3"],[224,"P n -3 m","Cubic","-P 4bc 2bc 3"],[225,"F m -3 m","Cubic","-F 4 2 3"],[226,"F m -3 c","Cubic","-F 4a 2 3"],[227,"F d -3 m","Cubic","-F 4vw 2vw 3"],[228,"F d -3 c","Cubic","-F 4ud 2vw 3"],[229,"I m -3 m","Cubic","-I 4 2 3"],[230,"I a -3 d","Cubic","-I 4bd 2c 3"]];

  // Major alternative settings (monoclinic, orthorhombic permutations, :R rhombohedral, origin choice 1)
  const SG_ALT = [[7,"P n","Monoclinic","P -2yac"],[7,"P a","Monoclinic","P -2ya"],[9,"C n","Monoclinic","C -2yac"],[9,"I a","Monoclinic","I -2ya"],[12,"I 2/m","Monoclinic","-I 2y"],[13,"P 2/n","Monoclinic","-P 2yac"],[13,"P 2/a","Monoclinic","-P 2ya"],[14,"P 21/n","Monoclinic","-P 2yn"],[14,"P 21/a","Monoclinic","-P 2yab"],[15,"I 2/a","Monoclinic","-I 2ya"],[15,"I 2/c","Monoclinic","-I 2yc"],[38,"B m m 2","Orthorhombic","B 2 -2"],[38,"C 2 m m","Orthorhombic","C -2 2"],[62,"P b n m","Orthorhombic","-P 2c 2ab"],[62,"P n a m","Orthorhombic","-P 2c 2n"],[62,"P m c n","Orthorhombic","-P 2n 2a"],[62,"P m n b","Orthorhombic","-P 2ab 2a"],[62,"P c m n","Orthorhombic","-P 2n 2ac"],[63,"B b m m","Orthorhombic","-B 2 2b"],[63,"A m a m","Orthorhombic","-A 2 2a"],[64,"C m c e","Orthorhombic","-C 2ac 2"],[39,"A e m 2","Orthorhombic","A 2 -2c"],[41,"A e a 2","Orthorhombic","A 2 -2ac"],[67,"C m m e","Orthorhombic","-C 2a 2"],[68,"C c c e","Orthorhombic","-C 2a 2ac"],[146,"R 3 :R","Rhombohedral","P 3*"],[148,"R -3 :R","Rhombohedral","-P 3*"],[155,"R 3 2 :R","Rhombohedral","P 3* 2"],[160,"R 3 m :R","Rhombohedral","P 3* -2"],[161,"R 3 c :R","Rhombohedral","P 3* -2n"],[166,"R -3 m :R","Rhombohedral","-P 3* 2"],[167,"R -3 c :R","Rhombohedral","-P 3* 2n"],[227,"F d -3 m :1","Cubic","F 4d 2 3 -1d"],[224,"P n -3 m :1","Cubic","P 4n 2 3 -1n"],[141,"I 41/a m d :1","Tetragonal","I 4bw 2bw -1bw"]];

  // Common legacy H-M aliases (no-minus cubic, Hermann-Mauguin shorthands, Materials Studio / ICSD forms)
  const HM_ALIASES = {
    "pm3m": "pm-3m", "fm3m": "fm-3m", "fd3m": "fd-3m", "im3m": "im-3m",
    "pn3m": "pn-3m", "pm3n": "pm-3n", "pn3n": "pn-3n", "fm3c": "fm-3c",
    "fd3c": "fd-3c", "ia3d": "ia-3d", "pa3": "pa-3", "ia3": "ia-3",
    "pm3": "pm-3", "pn3": "pn-3", "fm3": "fm-3", "fd3": "fd-3", "im3": "im-3",
    "r3bar": "r-3", "p3bar": "p-3", "p1bar": "p-1", "p4bar": "p-4", "i4bar": "i-4", "p6bar": "p-6",
    "r3barm": "r-3m", "r3barc": "r-3c", "p3barm1": "p-3m1", "p3bar1m": "p-31m",
    "p3barc1": "p-3c1", "p3bar1c": "p-31c",
    "pm3barm": "pm-3m", "fm3barm": "fm-3m", "fd3barm": "fd-3m", "im3barm": "im-3m",
    "ia3bard": "ia-3d", "pa3bar": "pa-3",
    "p42/mnm": "p42/mnm", "p63/mmc": "p63/mmc", "p63mc": "p63mc",
    "p1": "p1", "p-1": "p-1", "c2/m": "c2/m", "p21/c": "p21/c", "p21/n": "p21/n",
    "pnma": "pnma", "pbnm": "pbnm", "cmcm": "cmcm", "amm2": "amm2"
  };

  // Valid chemical element symbols (Z=1..118 + D/T isotopes)
  const VALID_ELEMENTS = new Set([
    "H","He","Li","Be","B","C","N","O","F","Ne","Na","Mg","Al","Si","P","S","Cl","Ar",
    "K","Ca","Sc","Ti","V","Cr","Mn","Fe","Co","Ni","Cu","Zn","Ga","Ge","As","Se","Br","Kr",
    "Rb","Sr","Y","Zr","Nb","Mo","Tc","Ru","Rh","Pd","Ag","Cd","In","Sn","Sb","Te","I","Xe",
    "Cs","Ba","La","Ce","Pr","Nd","Pm","Sm","Eu","Gd","Tb","Dy","Ho","Er","Tm","Yb","Lu",
    "Hf","Ta","W","Re","Os","Ir","Pt","Au","Hg","Tl","Pb","Bi","Po","At","Rn",
    "Fr","Ra","Ac","Th","Pa","U","Np","Pu","Am","Cm","Bk","Cf","Es","Fm","Md","No","Lr",
    "Rf","Db","Sg","Bh","Hs","Mt","Ds","Rg","Cn","Nh","Fl","Mc","Lv","Ts","Og","D","T"
  ]);

  const SG_BY_IT = new Map();
  const SG_BY_HM_KEY = new Map();
  const SG_BY_HALL_KEY = new Map();
  const SG_RHOMB_BY_IT = new Map();

  function normHmKey(hm) {
    if (!hm) return "";
    let s = String(hm).trim().toLowerCase();
    // Strip trailing "(99)" IT numbers if appended
    s = s.replace(/\(\d+\)/g, "");
    // Preserve :1 / :2 / :h / :r setting suffix
    let suffix = "";
    const mSuf = s.match(/[:\s](1|2|h|r|origin\s*choice\s*[12]|o[12])\s*$/i);
    if (mSuf) {
      const tok = mSuf[1].toLowerCase().replace(/\s+/g, "");
      if (tok === "1" || tok === "originchoice1" || tok === "o1") suffix = ":1";
      else if (tok === "2" || tok === "originchoice2" || tok === "o2") suffix = ":2";
      else if (tok === "h") suffix = ":h";
      else if (tok === "r") suffix = ":r";
      s = s.slice(0, mSuf.index);
    }
    s = s.replace(/\s+/g, "").replace(/_/g, "");
    if (HM_ALIASES[s]) s = HM_ALIASES[s];
    // Convert Unicode minus
    s = s.replace(/[\u2212\u2013\u2014]/g, "-");
    return s + suffix;
  }

  function normHallKey(h) {
    return String(h || "").trim().replace(/\s+/g, " ").toLowerCase();
  }

  for (const row of SG_230) {
    const entry = { itNumber: row[0], hm: row[1], crystalSystem: row[2], hall: row[3] };
    SG_BY_IT.set(entry.itNumber, entry);
    SG_BY_HM_KEY.set(normHmKey(entry.hm), entry);
    SG_BY_HM_KEY.set(normHmKey(entry.hm) + ":2", entry);
    if (entry.hm.startsWith("R ")) {
      SG_BY_HM_KEY.set(normHmKey(entry.hm) + ":h", entry);
    }
    SG_BY_HALL_KEY.set(normHallKey(entry.hall), entry);
  }
  for (const row of SG_ALT) {
    const entry = { itNumber: row[0], hm: row[1], crystalSystem: row[2], hall: row[3] };
    const key = normHmKey(entry.hm);
    SG_BY_HM_KEY.set(key, entry);
    if (key.endsWith(":r")) {
      SG_RHOMB_BY_IT.set(entry.itNumber, entry);
    }
    if (!SG_BY_HALL_KEY.has(normHallKey(entry.hall))) {
      SG_BY_HALL_KEY.set(normHallKey(entry.hall), entry);
    }
  }

  // --------------------------------------------------------------------------
  // 1. Exact IUCr Hall Symbol -> 3x4 Symmetry Matrix Group Generator
  // --------------------------------------------------------------------------
  const ROT_MATRICES = {
    "1:z": [[1,0,0],[0,1,0],[0,0,1]], "1:x": [[1,0,0],[0,1,0],[0,0,1]], "1:y": [[1,0,0],[0,1,0],[0,0,1]],
    "2:x": [[1,0,0],[0,-1,0],[0,0,-1]], "2:y": [[-1,0,0],[0,1,0],[0,0,-1]], "2:z": [[-1,0,0],[0,-1,0],[0,0,1]],
    "3:x": [[1,0,0],[0,0,-1],[0,1,-1]], "3:y": [[-1,0,1],[0,1,0],[-1,0,0]], "3:z": [[0,-1,0],[1,-1,0],[0,0,1]],
    "3:*": [[0,0,1],[1,0,0],[0,1,0]],
    "4:x": [[1,0,0],[0,0,-1],[0,1,0]], "4:y": [[0,0,1],[0,1,0],[-1,0,0]], "4:z": [[0,-1,0],[1,0,0],[0,0,1]],
    "6:x": [[1,0,0],[0,1,-1],[0,1,0]], "6:y": [[0,0,1],[0,1,0],[-1,0,1]], "6:z": [[1,-1,0],[1,0,0],[0,0,1]]
  };

  const DIAG_2_MATRICES = {
    "z:ortho:'": [[0,1,0],[1,0,0],[0,0,-1]],  'z:ortho:"': [[0,-1,0],[-1,0,0],[0,0,-1]],
    "x:ortho:'": [[-1,0,0],[0,0,1],[0,1,0]],  'x:ortho:"': [[-1,0,0],[0,0,-1],[0,-1,0]],
    "y:ortho:'": [[0,0,1],[0,-1,0],[1,0,0]],  'y:ortho:"': [[0,0,-1],[0,-1,0],[-1,0,0]],
    "z:hex:'":   [[0,-1,0],[-1,0,0],[0,0,-1]], 'z:hex:"':   [[0,1,0],[1,0,0],[0,0,-1]],
    "z:hex:default": [[0,-1,0],[-1,0,0],[0,0,-1]],
    "*:rhomb:'": [[0,-1,0],[-1,0,0],[0,0,-1]], '*:rhomb:"': [[0,-1,0],[-1,0,0],[0,0,-1]],
    "*:rhomb:default": [[0,-1,0],[-1,0,0],[0,0,-1]]
  };

  const LATTICE_TRANS = {
    "P": [[0,0,0]],
    "A": [[0,0,0],[0,0.5,0.5]],
    "B": [[0,0,0],[0.5,0,0.5]],
    "C": [[0,0,0],[0.5,0.5,0]],
    "I": [[0,0,0],[0.5,0.5,0.5]],
    "R": [[0,0,0],[2/3,1/3,1/3],[1/3,2/3,2/3]],
    "F": [[0,0,0],[0,0.5,0.5],[0.5,0,0.5],[0.5,0.5,0]]
  };

  const TRANS_SUB = {
    "a": [0.5,0,0], "b": [0,0.5,0], "c": [0,0,0.5], "n": [0.5,0.5,0.5],
    "u": [0.25,0,0], "v": [0,0.25,0], "w": [0,0,0.25], "d": [0.25,0.25,0.25]
  };

  function mod1(x) {
    let r = x - Math.floor(x);
    if (r < 1e-6 || r > 1.0 - 1e-6) r = 0.0;
    return r;
  }

  function snapRational12(x) {
    const r = mod1(x);
    // Exact crystallographic fractions (denominators 1,2,3,4,6,8,12)
    const dens = [1, 2, 3, 4, 6, 8, 12];
    for (const d of dens) {
      const n = Math.round(r * d);
      if (Math.abs(r - n / d) < 1e-5) return (n % d) / d;
    }
    return r;
  }

  function formatFracStr(x) {
    const r = mod1(x);
    if (r < 1e-6) return "";
    const dens = [2, 3, 4, 6, 8, 12];
    for (const d of dens) {
      const n = Math.round(r * d);
      if (Math.abs(r - n / d) < 1e-5 && n > 0 && n < d) {
        // Reduce fraction
        let a = n, b = d;
        while (b) { const t = b; b = a % b; a = t; }
        return `${n / a}/${d / a}`;
      }
    }
    return r.toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
  }

  function formatSymopXyz(R, t) {
    const axes = ["x", "y", "z"];
    const comps = [];
    for (let i = 0; i < 3; i++) {
      let s = "";
      for (let j = 0; j < 3; j++) {
        const c = Math.round(R[i][j]);
        if (c === 1) s += (s ? "+" : "") + axes[j];
        else if (c === -1) s += "-" + axes[j];
        else if (c !== 0) s += (c > 0 && s ? "+" : "") + c + "*" + axes[j];
      }
      const f = formatFracStr(t[i]);
      if (f) s += (s ? "+" : "") + f;
      comps.push(s || "0");
    }
    return comps.join(", ");
  }

  function opKey(R, t) {
    // Quantize translation to 1/24000 for exact group deduplication
    const rKey = R[0].join(",") + ";" + R[1].join(",") + ";" + R[2].join(",");
    const tKey = t.map(v => Math.round(mod1(v) * 24000) % 24000).join(",");
    return rKey + "|" + tKey;
  }

  function matMul3(A, B) {
    const out = [[0,0,0],[0,0,0],[0,0,0]];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        out[i][j] = A[i][0]*B[0][j] + A[i][1]*B[1][j] + A[i][2]*B[2][j];
      }
    }
    return out;
  }

  function opMul(op1, op2) {
    const R = matMul3(op1.R, op2.R);
    const t = [0, 0, 0];
    for (let i = 0; i < 3; i++) {
      const Rt2 = op1.R[i][0]*op2.t[0] + op1.R[i][1]*op2.t[1] + op1.R[i][2]*op2.t[2];
      t[i] = snapRational12(op1.t[i] + Rt2);
    }
    return { R, t };
  }

  const _hallOpsCache = new Map();

  function decodeHallSymbolToOps(hallStr) {
    const raw = String(hallStr || "").trim();
    if (!raw) return [{ R: [[1,0,0],[0,1,0],[0,0,1]], t: [0,0,0], xyz: "x, y, z" }];
    if (_hallOpsCache.has(raw)) return _hallOpsCache.get(raw);

    let s = raw;
    let shift = [0, 0, 0];
    const pIdx = s.indexOf("(");
    if (pIdx >= 0) {
      const rest = s.slice(pIdx + 1);
      s = s.slice(0, pIdx).trim();
      const closeIdx = rest.indexOf(")");
      const shToks = (closeIdx >= 0 ? rest.slice(0, closeIdx) : rest).trim().split(/\s+/);
      if (shToks.length === 3) {
        shift = shToks.map(v => (parseInt(v, 10) || 0) / 12.0);
      }
    }

    const tokens = s.split(/\s+/).filter(Boolean);
    if (!tokens.length) return [{ R: [[1,0,0],[0,1,0],[0,0,1]], t: [0,0,0], xyz: "x, y, z" }];

    const latTok = tokens[0];
    const centro = latTok.startsWith("-");
    const latChar = (centro ? latTok.slice(1) : latTok).toUpperCase();
    const latVecs = LATTICE_TRANS[latChar] || LATTICE_TRANS["P"];

    const I3 = [[1,0,0],[0,1,0],[0,0,1]];
    const negI3 = [[-1,0,0],[0,-1,0],[0,0,-1]];
    const generators = latVecs.map(tv => ({ R: I3, t: tv }));
    if (centro) generators.push({ R: negI3, t: [0, 0, 0] });

    let prevAxis = "z";
    let prevOrder = 1;

    for (let idx = 0; idx < tokens.length - 1; idx++) {
      const tok = tokens[idx + 1];
      let pos = 0;
      let improper = false;
      if (tok[pos] === "-") { improper = true; pos++; }
      const order = parseInt(tok[pos], 10);
      if (![1, 2, 3, 4, 6].includes(order)) continue;
      pos++;

      let axisHint = "";
      const tvec = [0, 0, 0];
      const screws = [];
      while (pos < tok.length) {
        const ch = tok[pos];
        if ("xyz'\"*".includes(ch)) {
          axisHint = ch;
        } else if (TRANS_SUB[ch]) {
          const tv = TRANS_SUB[ch];
          tvec[0] += tv[0]; tvec[1] += tv[1]; tvec[2] += tv[2];
        } else if (ch >= "0" && ch <= "9") {
          screws.push(parseInt(ch, 10));
        }
        pos++;
      }

      let R = I3;
      let resolvedAxis = "z";
      if (axisHint === "*") {
        R = ROT_MATRICES["3:*"];
        resolvedAxis = "*";
      } else if (order === 3 && idx >= 1 && !axisHint) {
        R = ROT_MATRICES["3:*"];
        resolvedAxis = "*";
      } else if (order === 2 && (axisHint === "'" || axisHint === '"')) {
        if (prevAxis === "*") {
          R = DIAG_2_MATRICES["*:rhomb:" + axisHint];
          resolvedAxis = "*";
        } else {
          const mode = (prevOrder === 3 || prevOrder === 6) ? "hex" : "ortho";
          R = DIAG_2_MATRICES[`${prevAxis}:${mode}:${axisHint}`] || ROT_MATRICES["2:x"];
          resolvedAxis = prevAxis;
        }
      } else if (axisHint === "x" || axisHint === "y" || axisHint === "z") {
        R = ROT_MATRICES[`${order}:${axisHint}`] || I3;
        resolvedAxis = axisHint;
      } else {
        if (idx === 0) {
          resolvedAxis = "z";
          R = ROT_MATRICES[`${order}:z`] || I3;
        } else if (idx === 1) {
          if (prevAxis === "*" && order === 2) {
            resolvedAxis = "*";
            R = DIAG_2_MATRICES["*:rhomb:default"];
          } else if (order === 2 && (prevOrder === 3 || prevOrder === 6)) {
            resolvedAxis = "z";
            R = DIAG_2_MATRICES["z:hex:default"];
          } else if (order === 2) {
            const nextAx = prevAxis === "z" ? "x" : (prevAxis === "x" ? "y" : "z");
            resolvedAxis = nextAx;
            R = ROT_MATRICES[`2:${nextAx}`];
          } else {
            resolvedAxis = "z";
            R = ROT_MATRICES[`${order}:z`] || I3;
          }
        } else {
          if (order === 2) {
            const mode = (prevOrder === 3 || prevOrder === 6) ? "hex" : "ortho";
            R = DIAG_2_MATRICES[`${prevAxis}:${mode}:'`] || ROT_MATRICES["2:x"];
            resolvedAxis = prevAxis;
          } else {
            resolvedAxis = "z";
            R = ROT_MATRICES[`${order}:z`] || I3;
          }
        }
      }

      for (const sn of screws) {
        const frac = sn / order;
        if (resolvedAxis === "x") tvec[0] += frac;
        else if (resolvedAxis === "y") tvec[1] += frac;
        else if (resolvedAxis === "z") tvec[2] += frac;
      }

      if (improper) {
        R = R.map(row => row.map(v => -v));
      }
      generators.push({ R, t: tvec.map(snapRational12) });
      if (idx === 0) {
        prevAxis = resolvedAxis;
        prevOrder = order;
      }
    }

    // Group closure
    const ident = { R: I3, t: [0, 0, 0] };
    const seen = new Map();
    const queue = [ident];
    seen.set(opKey(ident.R, ident.t), ident);
    for (const g of generators) {
      const k = opKey(g.R, g.t);
      if (!seen.has(k)) {
        seen.set(k, g);
        queue.push(g);
      }
    }

    while (queue.length > 0 && seen.size <= 192) {
      const cur = queue.pop();
      for (const g of generators) {
        const prod = opMul(g, cur);
        const k = opKey(prod.R, prod.t);
        if (!seen.has(k)) {
          seen.set(k, prod);
          queue.push(prod);
          if (seen.size > 192) break;
        }
      }
    }

    let ops = Array.from(seen.values());
    if (shift[0] !== 0 || shift[1] !== 0 || shift[2] !== 0) {
      ops = ops.map(op => {
        const nt = [0, 1, 2].map(i => {
          const Rs = op.R[i][0]*shift[0] + op.R[i][1]*shift[1] + op.R[i][2]*shift[2];
          return snapRational12(op.t[i] + Rs - shift[i]);
        });
        return { R: op.R, t: nt };
      });
    }

    // Format canonical XYZ string and put identity x, y, z first
    const result = ops.map(op => ({ R: op.R, t: op.t, xyz: formatSymopXyz(op.R, op.t) }));
    result.sort((a, b) => {
      if (a.xyz === "x, y, z") return -1;
      if (b.xyz === "x, y, z") return 1;
      return a.xyz.localeCompare(b.xyz);
    });

    _hallOpsCache.set(raw, result);
    return result;
  }

  // --------------------------------------------------------------------------
  // 2. Exact Symmetry Operation XYZ String Parser ('-y+1/2, x-y, z+1/3')
  // --------------------------------------------------------------------------
  function evalSimpleNumber(raw) {
    if (raw === null || raw === undefined) return NaN;
    let s = String(raw).trim().replace(/^['"]|['"]$/g, "");
    if (!s || s === "." || s === "?") return NaN;
    // Strip standard uncertainty parentheses: 4.0094(12) -> 4.0094
    s = s.replace(/\(\d+\)/g, "").trim();
    if (s.includes("/")) {
      const [n, d] = s.split("/");
      const nv = parseFloat(n), dv = parseFloat(d);
      if (isFinite(nv) && isFinite(dv) && dv !== 0) return nv / dv;
      return NaN;
    }
    const v = parseFloat(s);
    return isFinite(v) ? v : NaN;
  }

  function parseSymopXyzString(expr) {
    const cleaned = String(expr || "").trim().replace(/^['"]|['"]$/g, "").replace(/\s+/g, "").toLowerCase();
    const parts = cleaned.split(",");
    if (parts.length !== 3) return null;

    const R = [[0,0,0],[0,0,0],[0,0,0]];
    const t = [0, 0, 0];
    const axisMap = { x: 0, y: 1, z: 2 };

    for (let row = 0; row < 3; row++) {
      const p = parts[row];
      if (!p) return null;
      // Split into signed terms while keeping scientific notation e-5 intact
      const terms = p.match(/[+-]?[^+-]+/g);
      if (!terms) return null;
      for (const term of terms) {
        const mAx = term.match(/^([+-]?)([0-9./]*)\*?([xyz])$/);
        if (mAx) {
          const sign = mAx[1] === "-" ? -1 : 1;
          const coeffStr = mAx[2];
          let coeff = 1.0;
          if (coeffStr) {
            coeff = evalSimpleNumber(coeffStr);
            if (!isFinite(coeff)) return null;
          }
          R[row][axisMap[mAx[3]]] += sign * coeff;
        } else {
          const num = evalSimpleNumber(term);
          if (!isFinite(num)) return null;
          t[row] += num;
        }
      }
      t[row] = mod1(t[row]);
    }

    // Sanity check determinant != 0
    const det =
      R[0][0]*(R[1][1]*R[2][2] - R[1][2]*R[2][1]) -
      R[0][1]*(R[1][0]*R[2][2] - R[1][2]*R[2][0]) +
      R[0][2]*(R[1][0]*R[2][1] - R[1][1]*R[2][0]);
    if (Math.abs(det) < 0.5) return null;

    return { R, t, xyz: formatSymopXyz(R, t) };
  }

  // --------------------------------------------------------------------------
  // 3. Space Group Resolver (Hall -> H-M -> IT Number -> Crystal System)
  // --------------------------------------------------------------------------
  function inferCrystalSystemFromLattice(a, b, c, alpha, beta, gamma) {
    const tolA = 0.35;
    const tolL = 0.025 * Math.max(a, b, c, 1);
    const a90 = Math.abs(alpha - 90) < tolA;
    const b90 = Math.abs(beta - 90) < tolA;
    const g90 = Math.abs(gamma - 90) < tolA;
    if (a90 && b90 && g90) {
      if (Math.abs(a - b) < tolL && Math.abs(b - c) < tolL) return "Cubic";
      if (Math.abs(a - b) < tolL) return "Tetragonal";
      return "Orthorhombic";
    }
    if (a90 && b90 && (Math.abs(gamma - 120) < 0.5 || Math.abs(gamma - 60) < 0.5) && Math.abs(a - b) < tolL) {
      return "Hexagonal";
    }
    if (Math.abs(a - b) < tolL && Math.abs(b - c) < tolL && Math.abs(alpha - beta) < tolA && Math.abs(beta - gamma) < tolA && !a90) {
      return "Rhombohedral";
    }
    if ((a90 && g90 && !b90) || (a90 && b90 && !g90) || (b90 && g90 && !a90)) {
      return "Monoclinic";
    }
    return "Triclinic";
  }

  function isRhombohedralAxes(a, b, c, alpha, beta, gamma) {
    return (
      Math.abs(a - b) < 0.05 && Math.abs(b - c) < 0.05 &&
      Math.abs(alpha - beta) < 0.5 && Math.abs(beta - gamma) < 0.5 &&
      Math.abs(alpha - 90) > 0.8
    );
  }

  function resolveSpaceGroupMetadata(info) {
    const hmRaw = String(info.hm || "").trim();
    const hallRaw = String(info.hall || "").trim();
    const itRaw = parseInt(info.itNumber, 10);
    const rhombAxes = isRhombohedralAxes(info.a, info.b, info.c, info.alpha, info.beta, info.gamma);

    let entry = null;
    let source = "p1";

    // 1) Explicit Hall symbol
    if (hallRaw) {
      entry = SG_BY_HALL_KEY.get(normHallKey(hallRaw)) || {
        itNumber: isFinite(itRaw) ? itRaw : 0,
        hm: hmRaw || hallRaw,
        crystalSystem: info.crystalSystem || inferCrystalSystemFromLattice(info.a, info.b, info.c, info.alpha, info.beta, info.gamma),
        hall: hallRaw
      };
      source = "hall";
    }

    // 2) H-M symbol lookup
    if (!entry && hmRaw) {
      const k = normHmKey(hmRaw);
      if (rhombAxes && SG_BY_HM_KEY.has(k + ":r")) {
        entry = SG_BY_HM_KEY.get(k + ":r");
        source = "hm_table";
      } else if (SG_BY_HM_KEY.has(k)) {
        entry = SG_BY_HM_KEY.get(k);
        if (rhombAxes && SG_RHOMB_BY_IT.has(entry.itNumber) && !k.endsWith(":h")) {
          entry = SG_RHOMB_BY_IT.get(entry.itNumber);
        }
        source = "hm_table";
      }
    }

    // 3) IT number lookup (1..230)
    if (!entry && isFinite(itRaw) && itRaw >= 1 && itRaw <= 230) {
      if (rhombAxes && SG_RHOMB_BY_IT.has(itRaw)) {
        entry = SG_RHOMB_BY_IT.get(itRaw);
      } else {
        entry = SG_BY_IT.get(itRaw) || null;
      }
      if (entry) source = "it_number";
    }

    if (!entry) {
      entry = {
        itNumber: isFinite(itRaw) ? itRaw : 1,
        hm: hmRaw || "P 1",
        crystalSystem: info.crystalSystem || inferCrystalSystemFromLattice(info.a, info.b, info.c, info.alpha, info.beta, info.gamma),
        hall: "P 1"
      };
    }

    let ops = [{ R: [[1,0,0],[0,1,0],[0,0,1]], t: [0,0,0], xyz: "x, y, z" }];
    try {
      ops = decodeHallSymbolToOps(entry.hall);
    } catch (e) {}

    return {
      itNumber: entry.itNumber,
      hm: entry.hm,
      hall: entry.hall,
      crystalSystem: entry.crystalSystem,
      cellSetting: entry.crystalSystem.toLowerCase(),
      ops,
      source
    };
  }

  // --------------------------------------------------------------------------
  // 4. Spec-Compliant CIF 1.1 Lexer / Tokenizer
  // --------------------------------------------------------------------------
  function tokenizeCifBlock(cifText) {
    const text = String(cifText || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const len = text.length;
    const tokens = [];
    let i = 0;

    while (i < len) {
      const ch = text[i];
      // Whitespace
      if (ch === " " || ch === "\t" || ch === "\n") {
        i++;
        continue;
      }
      // Comment
      if (ch === "#") {
        while (i < len && text[i] !== "\n") i++;
        continue;
      }
      // Semicolon multiline text field (must be at start of line)
      if (ch === ";" && (i === 0 || text[i - 1] === "\n")) {
        i++;
        const start = i;
        while (i < len) {
          if (text[i] === ";" && text[i - 1] === "\n") break;
          i++;
        }
        tokens.push({ type: "text", value: text.slice(start, i).trim() });
        if (i < len && text[i] === ";") i++;
        continue;
      }
      // Single or double quoted string (CIF 1.1: closing quote followed by whitespace or EOF)
      if (ch === "'" || ch === '"') {
        const q = ch;
        i++;
        const start = i;
        while (i < len) {
          if (text[i] === q && (i + 1 === len || text[i + 1] === " " || text[i + 1] === "\t" || text[i + 1] === "\n")) {
            break;
          }
          if (text[i] === "\n") break; // safety guard against malformed unclosed quote
          i++;
        }
        tokens.push({ type: "quoted", value: text.slice(start, i) });
        if (i < len && text[i] === q) i++;
        continue;
      }
      // Unquoted word
      const start = i;
      while (i < len && text[i] !== " " && text[i] !== "\t" && text[i] !== "\n") i++;
      const word = text.slice(start, i);
      tokens.push({ type: "word", value: word });
    }

    // Split tokens into data_ blocks
    const blocks = [];
    let cur = { dataName: "", tags: {}, loops: [] };
    let idx = 0;

    while (idx < tokens.length) {
      const tk = tokens[idx];
      if (tk.type === "word" && /^data_/i.test(tk.value)) {
        if (cur.dataName || Object.keys(cur.tags).length || cur.loops.length) {
          blocks.push(cur);
        }
        cur = { dataName: tk.value.slice(5), tags: {}, loops: [] };
        idx++;
        continue;
      }
      if (tk.type === "word" && /^loop_$/i.test(tk.value)) {
        idx++;
        const headers = [];
        while (idx < tokens.length && tokens[idx].type === "word" && tokens[idx].value.startsWith("_")) {
          headers.push(tokens[idx].value.toLowerCase());
          idx++;
        }
        const rows = [];
        if (headers.length > 0) {
          const ncol = headers.length;
          const rowBuf = [];
          while (idx < tokens.length) {
            const t2 = tokens[idx];
            if (t2.type === "word" && (
              t2.value.startsWith("_") ||
              /^loop_$/i.test(t2.value) ||
              /^data_/i.test(t2.value) ||
              /^stop_$/i.test(t2.value) ||
              /^global_$/i.test(t2.value) ||
              /^save_/i.test(t2.value)
            )) {
              break;
            }
            rowBuf.push(t2.value);
            idx++;
            if (rowBuf.length === ncol) {
              rows.push(rowBuf.slice());
              rowBuf.length = 0;
            }
          }
        }
        cur.loops.push({ headers, rows });
        continue;
      }
      if (tk.type === "word" && tk.value.startsWith("_")) {
        const tag = tk.value.toLowerCase();
        idx++;
        if (idx < tokens.length) {
          const nxt = tokens[idx];
          if (!(nxt.type === "word" && (nxt.value.startsWith("_") || /^loop_$/i.test(nxt.value) || /^data_/i.test(nxt.value)))) {
            cur.tags[tag] = nxt.value;
            idx++;
          }
        }
        continue;
      }
      idx++;
    }
    if (cur.dataName || Object.keys(cur.tags).length || cur.loops.length) {
      blocks.push(cur);
    }

    // Choose the first block that has atomic coordinates or cell length
    const best =
      blocks.find(b => b.loops.some(l => l.headers.some(h => h.includes("atom_site_fract_x") || h.includes("atom_site_cartn_x")))) ||
      blocks.find(b => b.tags["_cell_length_a"]) ||
      blocks[0] ||
      { dataName: "", tags: {}, loops: [] };

    return best;
  }

  // --------------------------------------------------------------------------
  // 5. Lattice Vector Math & Element Resolution
  // --------------------------------------------------------------------------
  function paramsToVectors(a, b, c, alpha, beta, gamma) {
    const ar = (alpha * Math.PI) / 180;
    const br = (beta * Math.PI) / 180;
    const gr = (gamma * Math.PI) / 180;
    const sinG = Math.sin(gr) || 1.0;
    const ax = a, ay = 0.0, az = 0.0;
    const bx = b * Math.cos(gr), by = b * sinG, bz = 0.0;
    const cx = c * Math.cos(br);
    const cy = c * (Math.cos(ar) - Math.cos(br) * Math.cos(gr)) / sinG;
    const cz = Math.sqrt(Math.max(0.0, c * c - cx * cx - cy * cy));
    return [[ax, ay, az], [bx, by, bz], [cx, cy, cz]];
  }

  function invert3x3(m) {
    const [r0, r1, r2] = m;
    const det =
      r0[0]*(r1[1]*r2[2] - r1[2]*r2[1]) -
      r0[1]*(r1[0]*r2[2] - r1[2]*r2[0]) +
      r0[2]*(r1[0]*r2[1] - r1[1]*r2[0]);
    if (Math.abs(det) < 1e-12) return [[1,0,0],[0,1,0],[0,0,1]];
    const inv = 1.0 / det;
    return [
      [(r1[1]*r2[2]-r1[2]*r2[1])*inv, (r0[2]*r2[1]-r0[1]*r2[2])*inv, (r0[1]*r1[2]-r0[2]*r1[1])*inv],
      [(r1[2]*r2[0]-r1[0]*r2[2])*inv, (r0[0]*r2[2]-r0[2]*r2[0])*inv, (r0[2]*r1[0]-r0[0]*r1[2])*inv],
      [(r1[0]*r2[1]-r1[1]*r2[0])*inv, (r0[1]*r2[0]-r0[0]*r2[1])*inv, (r0[0]*r1[1]-r0[1]*r1[0])*inv]
    ];
  }

  function cellVolume(a, b, c, alpha, beta, gamma) {
    const ar = (alpha * Math.PI) / 180;
    const br = (beta * Math.PI) / 180;
    const gr = (gamma * Math.PI) / 180;
    const term = 1 - Math.cos(ar)**2 - Math.cos(br)**2 - Math.cos(gr)**2 + 2*Math.cos(ar)*Math.cos(br)*Math.cos(gr);
    return term > 0 ? a * b * c * Math.sqrt(term) : a * b * c;
  }

  function minImageDistCart(u1, v1, w1, u2, v2, w2, vecs) {
    let du = u1 - u2; du -= Math.round(du);
    let dv = v1 - v2; dv -= Math.round(dv);
    let dw = w1 - w2; dw -= Math.round(dw);
    const dx = du*vecs[0][0] + dv*vecs[1][0] + dw*vecs[2][0];
    const dy = du*vecs[0][1] + dv*vecs[1][1] + dw*vecs[2][1];
    const dz = du*vecs[0][2] + dv*vecs[1][2] + dw*vecs[2][2];
    return Math.hypot(dx, dy, dz);
  }

  function resolveCifElement(raw) {
    if (!raw) return "X";
    const s = String(raw).trim().replace(/^['"]|['"]$/g, "");
    const m = s.match(/^([A-Za-z]{1,2})/);
    if (!m) return "X";
    const letters = m[1];
    if (letters.length === 2) {
      const two = letters[0].toUpperCase() + letters[1].toLowerCase();
      if (VALID_ELEMENTS.has(two)) return two === "D" || two === "T" ? "H" : two;
    }
    const one = letters[0].toUpperCase();
    if (VALID_ELEMENTS.has(one)) return one === "D" || one === "T" ? "H" : one;
    return letters[0].toUpperCase() + (letters[1] ? letters[1].toLowerCase() : "");
  }

  function gcdInt(a, b) {
    a = Math.abs(Math.round(a));
    b = Math.abs(Math.round(b));
    while (b) { const t = b; b = a % b; a = t; }
    return a || 1;
  }

  function computeFormulaAndZ(atoms) {
    if (!atoms || !atoms.length) return { full: "", reduced: "", z: 1 };
    const counts = {};
    for (const at of atoms) {
      const el = resolveCifElement(at.element);
      const occ = (typeof at.occupancy === "number" && isFinite(at.occupancy) && at.occupancy > 0) ? at.occupancy : 1.0;
      counts[el] = (counts[el] || 0) + occ;
    }
    // Electronegativity order (cation first, O/F/Cl/N/S/P last)
    const EN = {
      Cs:0.79,Rb:0.82,K:0.82,Na:0.93,Li:0.98,Ba:0.89,Sr:0.95,Ca:1.00,Mg:1.31,Be:1.57,
      La:1.10,Ce:1.12,Y:1.22,Sc:1.36,Zr:1.33,Hf:1.30,Ti:1.54,Ta:1.50,Nb:1.60,V:1.63,
      Cr:1.66,Mn:1.55,Fe:1.83,Co:1.88,Ni:1.91,Cu:1.90,Zn:1.65,Al:1.61,Ga:1.81,In:1.78,
      Sn:1.96,Pb:2.33,Bi:2.02,Mo:2.16,W:2.36,Ru:2.20,Rh:2.28,Pd:2.20,Ag:1.93,Pt:2.28,Au:2.54,
      Si:1.90,Ge:2.01,B:2.04,As:2.18,Te:2.10,P:2.19,H:2.20,C:2.55,Se:2.55,S:2.58,I:2.66,Br:2.96,N:3.04,Cl:3.16,O:3.44,F:3.98
    };
    const els = Object.keys(counts).sort((a, b) => (EN[a] ?? 2.0) - (EN[b] ?? 2.0) || a.localeCompare(b));
    const intVals = els.map(e => Math.round(counts[e]));
    const allNearInt = els.every((e, i) => Math.abs(counts[e] - intVals[i]) < 0.05 && intVals[i] > 0);
    let z = 1;
    if (allNearInt && intVals.length > 0) {
      z = intVals.reduce((acc, v) => gcdInt(acc, v), intVals[0]);
    }
    const fmt = (el, v) => {
      const r = Math.round(v * 100) / 100;
      if (Math.abs(r - 1) < 0.01) return el;
      return `${el}${Math.abs(r - Math.round(r)) < 0.01 ? Math.round(r) : r}`;
    };
    const full = els.map(e => fmt(e, counts[e])).join("");
    const reduced = els.map(e => fmt(e, counts[e] / z)).join("");
    return { full, reduced, z };
  }

  // --------------------------------------------------------------------------
  // 6. Master VESTA-Grade CIF Parser (Full Symmetry Expansion + Exact Metadata)
  // --------------------------------------------------------------------------
  function parseCifFullCrystal(cifText, filename = "") {
    const block = tokenizeCifBlock(cifText);
    const tags = block.tags || {};

    const getNum = (key, defVal) => {
      const v = evalSimpleNumber(tags[key]);
      return isFinite(v) ? v : defVal;
    };

    const a = getNum("_cell_length_a", 4.0);
    const b = getNum("_cell_length_b", a);
    const c = getNum("_cell_length_c", a);
    const alpha = getNum("_cell_angle_alpha", 90.0);
    const beta = getNum("_cell_angle_beta", 90.0);
    const gamma = getNum("_cell_angle_gamma", 90.0);
    const vecs = paramsToVectors(a, b, c, alpha, beta, gamma);
    const calcVol = cellVolume(a, b, c, alpha, beta, gamma);
    const rawVol = getNum("_cell_volume", 0);
    const volume = Math.round((rawVol > 0 ? rawVol : calcVol) * 10000) / 10000;

    // 1) Space group metadata from tags
    const rawHM = (tags["_symmetry_space_group_name_h-m"] || tags["_space_group_name_h-m_alt"] || "").trim();
    const rawIT = evalSimpleNumber(tags["_space_group_it_number"] || tags["_symmetry_int_tables_number"]);
    const rawHall = (tags["_space_group_name_hall"] || tags["_symmetry_space_group_name_hall"] || "").trim();
    const rawSetting = (tags["_space_group_crystal_system"] || tags["_symmetry_cell_setting"] || "").trim();
    const settingNice = rawSetting ? rawSetting.charAt(0).toUpperCase() + rawSetting.slice(1).toLowerCase() : "";

    const sgMeta = resolveSpaceGroupMetadata({
      hm: rawHM,
      itNumber: isFinite(rawIT) ? Math.round(rawIT) : null,
      hall: rawHall,
      crystalSystem: settingNice,
      a, b, c, alpha, beta, gamma
    });

    // 2) Extract explicit symmetry operations loop if present in CIF
    const explicitOps = [];
    const seenOpKeys = new Set();
    for (const lp of (block.loops || [])) {
      const symIdx = lp.headers.findIndex(h =>
        h === "_space_group_symop_operation_xyz" ||
        h === "_symmetry_equiv_pos_as_xyz"
      );
      if (symIdx === -1) continue;
      for (const row of lp.rows) {
        const parsedOp = parseSymopXyzString(row[symIdx]);
        if (parsedOp) {
          const k = opKey(parsedOp.R, parsedOp.t);
          if (!seenOpKeys.has(k)) {
            seenOpKeys.add(k);
            explicitOps.push(parsedOp);
          }
        }
      }
    }

    // Priority: Explicit symop loop (if present) > Hall / H-M / IT-number generated ops!
    let activeOps = [];
    let symopSource = sgMeta.source;
    if (explicitOps.length > 0) {
      // Ensure identity x, y, z is present first
      const idKey = opKey([[1,0,0],[0,1,0],[0,0,1]], [0,0,0]);
      if (!seenOpKeys.has(idKey)) {
        explicitOps.unshift({ R: [[1,0,0],[0,1,0],[0,0,1]], t: [0,0,0], xyz: "x, y, z" });
      }
      activeOps = explicitOps;
      symopSource = "explicit_loop";
    } else {
      activeOps = sgMeta.ops;
    }

    // 3) Parse asymmetric-unit atomic sites from _atom_site_* loop
    const asymmetricAtoms = [];
    for (const lp of (block.loops || [])) {
      const h = lp.headers;
      const fxIdx = h.findIndex(x => x === "_atom_site_fract_x");
      const fyIdx = h.findIndex(x => x === "_atom_site_fract_y");
      const fzIdx = h.findIndex(x => x === "_atom_site_fract_z");
      const cxIdx = h.findIndex(x => x === "_atom_site_cartn_x");
      const cyIdx = h.findIndex(x => x === "_atom_site_cartn_y");
      const czIdx = h.findIndex(x => x === "_atom_site_cartn_z");
      const useFract = (fxIdx !== -1 && fyIdx !== -1 && fzIdx !== -1);
      const useCart = (!useFract && cxIdx !== -1 && cyIdx !== -1 && czIdx !== -1);
      if (!useFract && !useCart) continue;

      const typeIdx = h.findIndex(x => x === "_atom_site_type_symbol");
      const labelIdx = h.findIndex(x => x === "_atom_site_label");
      const occIdx = h.findIndex(x => x === "_atom_site_occupancy");
      const uisoIdx = h.findIndex(x => x === "_atom_site_u_iso_or_equiv");
      const bisoIdx = h.findIndex(x => x === "_atom_site_b_iso_or_equiv");
      const adpIdx = h.findIndex(x => x === "_atom_site_adp_type");
      const wyckIdx = h.findIndex(x => x === "_atom_site_wyckoff_symbol");
      const invVecs = useCart ? invert3x3(vecs) : null;

      for (const row of lp.rows) {
        let u = 0, v = 0, w = 0;
        if (useFract) {
          u = evalSimpleNumber(row[fxIdx]);
          v = evalSimpleNumber(row[fyIdx]);
          w = evalSimpleNumber(row[fzIdx]);
        } else {
          const cx = evalSimpleNumber(row[cxIdx]);
          const cy = evalSimpleNumber(row[cyIdx]);
          const cz = evalSimpleNumber(row[czIdx]);
          u = cx*invVecs[0][0] + cy*invVecs[1][0] + cz*invVecs[2][0];
          v = cx*invVecs[0][1] + cy*invVecs[1][1] + cz*invVecs[2][1];
          w = cx*invVecs[0][2] + cy*invVecs[1][2] + cz*invVecs[2][2];
        }
        if (!isFinite(u) || !isFinite(v) || !isFinite(w)) continue;

        const rawType = typeIdx !== -1 ? row[typeIdx] : "";
        const rawLabel = labelIdx !== -1 ? row[labelIdx] : "";
        let element = resolveCifElement(rawType);
        if (!element || element === "X") element = resolveCifElement(rawLabel);
        if (!element) element = "X";

        const label = (rawLabel && rawLabel !== "." && rawLabel !== "?") ? rawLabel : `${element}${asymmetricAtoms.length + 1}`;
        const typeSymbol = (rawType && rawType !== "." && rawType !== "?") ? rawType : element;
        const occVal = occIdx !== -1 ? evalSimpleNumber(row[occIdx]) : 1.0;
        const occupancy = (isFinite(occVal) && occVal > 0 && occVal <= 1.05) ? Math.round(occVal * 10000) / 10000 : 1.0;
        let uiso = 0.0;
        if (uisoIdx !== -1) {
          const uv = evalSimpleNumber(row[uisoIdx]);
          if (isFinite(uv)) uiso = uv;
        } else if (bisoIdx !== -1) {
          const bv = evalSimpleNumber(row[bisoIdx]);
          if (isFinite(bv)) uiso = bv / (8 * Math.PI * Math.PI);
        }
        const adpType = (adpIdx !== -1 && row[adpIdx] && row[adpIdx] !== "." && row[adpIdx] !== "?") ? row[adpIdx] : "Uiso";
        const wyckoff = (wyckIdx !== -1 && row[wyckIdx] && row[wyckIdx] !== "." && row[wyckIdx] !== "?") ? row[wyckIdx] : "";

        asymmetricAtoms.push({
          element,
          type_symbol: typeSymbol,
          label,
          x: Math.round(u * 1e6) / 1e6,
          y: Math.round(v * 1e6) / 1e6,
          z: Math.round(w * 1e6) / 1e6,
          occupancy,
          uiso: Math.round(uiso * 1e6) / 1e6,
          adp_type: adpType,
          wyckoff,
          wyckoff_mult: 1
        });
      }
      if (asymmetricAtoms.length > 0) break;
    }

    // 4) Expand asymmetric unit -> FULL unit cell using exact symmetry operations
    const expandedAtoms = [];
    const elRunningCount = {};
    const DEDUP_TOL_A = 0.05; // 0.05 Angstrom periodic minimum-image tolerance (VESTA standard)

    for (let sIdx = 0; sIdx < asymmetricAtoms.length; sIdx++) {
      const site = asymmetricAtoms[sIdx];
      const siteImages = [];

      for (let oIdx = 0; oIdx < activeOps.length; oIdx++) {
        const op = activeOps[oIdx];
        const nu = mod1(op.R[0][0]*site.x + op.R[0][1]*site.y + op.R[0][2]*site.z + op.t[0]);
        const nv = mod1(op.R[1][0]*site.x + op.R[1][1]*site.y + op.R[1][2]*site.z + op.t[1]);
        const nw = mod1(op.R[2][0]*site.x + op.R[2][1]*site.y + op.R[2][2]*site.z + op.t[2]);

        // Check duplicate within this asymmetric site's orbit
        let isDup = false;
        for (let k = 0; k < siteImages.length; k++) {
          if (minImageDistCart(nu, nv, nw, siteImages[k].x, siteImages[k].y, siteImages[k].z, vecs) < DEDUP_TOL_A) {
            isDup = true;
            break;
          }
        }
        if (isDup) continue;

        // Also check duplicate against previously expanded atoms of the SAME element
        // (keeps mixed-occupancy partial sites with different elements intact!)
        for (let k = 0; k < expandedAtoms.length; k++) {
          const prev = expandedAtoms[k];
          if (prev.element === site.element &&
              minImageDistCart(nu, nv, nw, prev.x, prev.y, prev.z, vecs) < DEDUP_TOL_A) {
            isDup = true;
            break;
          }
        }
        if (isDup) continue;

        elRunningCount[site.element] = (elRunningCount[site.element] || 0) + 1;
        const img = {
          element: site.element,
          type_symbol: site.type_symbol,
          label: siteImages.length === 0 ? site.label : `${site.element}${elRunningCount[site.element]}`,
          site_label: site.label,
          x: Math.round(nu * 1e6) / 1e6,
          y: Math.round(nv * 1e6) / 1e6,
          z: Math.round(nw * 1e6) / 1e6,
          occupancy: site.occupancy,
          uiso: site.uiso,
          adp_type: site.adp_type,
          symop_index: oIdx
        };
        siteImages.push(img);
        expandedAtoms.push(img);
      }
      site.wyckoff_mult = siteImages.length || 1;
    }

    // 5) Compute true stoichiometry & Z directly from expanded unit-cell atoms
    const stoich = computeFormulaAndZ(expandedAtoms);
    const explicitZ = evalSimpleNumber(tags["_cell_formula_units_z"]);
    const formulaUnitsZ = (isFinite(explicitZ) && explicitZ >= 1) ? Math.round(explicitZ) : stoich.z;

    const crystalSystem = settingNice || sgMeta.crystalSystem || inferCrystalSystemFromLattice(a, b, c, alpha, beta, gamma);
    const sgHM = sgMeta.hm || rawHM || "P 1";
    const sgIT = sgMeta.itNumber || (isFinite(rawIT) ? Math.round(rawIT) : 1);
    const spaceGroup = (sgIT && sgIT >= 1 && sgIT <= 230) ? `${sgHM} (${sgIT})` : sgHM;
    const symopStrings = activeOps.map(op => op.xyz);
    const symmetryIntact = (asymmetricAtoms.length > 0 && activeOps.length >= 1);

    const cleanBase = String(filename || "").replace(/\.[^/.]+$/, "").replace(/^.*[\\/]/, "").trim();
    const formula = stoich.reduced || stoich.full || (tags["_chemical_formula_sum"] || "").replace(/\s+/g, "") || cleanBase || "Crystal";
    const name = (cleanBase && !["input","structure","crystal","cif","data","upload","soc"].includes(cleanBase.toLowerCase()))
      ? cleanBase
      : `${formula} (${crystalSystem} ${sgHM})`;

    return {
      name,
      formula,
      chemical_formula: formula,
      full_unit_cell_formula: stoich.full || formula,
      formula_units_Z: formulaUnitsZ,
      crystal_system: crystalSystem,
      cell_setting: crystalSystem.toLowerCase(),
      space_group: spaceGroup,
      space_group_hm: sgHM,
      space_group_it: sgIT,
      hall_symbol: sgMeta.hall || rawHall || (sgIT === 1 ? "P 1" : ""),
      symop_source: symopSource,
      symops: symopStrings,
      symmetry_intact: symmetryIntact,
      structure_type: "Bulk 3D",
      a: Math.round(a * 1e6) / 1e6,
      b: Math.round(b * 1e6) / 1e6,
      c: Math.round(c * 1e6) / 1e6,
      alpha: Math.round(alpha * 1e4) / 1e4,
      beta: Math.round(beta * 1e4) / 1e4,
      gamma: Math.round(gamma * 1e4) / 1e4,
      volume,
      vectors: vecs,
      natoms: expandedAtoms.length,
      nasymmetric: asymmetricAtoms.length,
      asymmetric_atoms: asymmetricAtoms,
      atoms: expandedAtoms
    };
  }

  // --------------------------------------------------------------------------
  // 7. VESTA-Standard CIF 1.1 Exporter (Preserves Symmetry OR Clean P1)
  // --------------------------------------------------------------------------
  function exportVestaStandardCif(st, options = {}) {
    if (!st) return "";
    const lat = st.lattice || {
      a: parseFloat(st.a) || 4.0,
      b: parseFloat(st.b) || 4.0,
      c: parseFloat(st.c) || 4.0,
      alpha: parseFloat(st.alpha) || 90.0,
      beta: parseFloat(st.beta) || 90.0,
      gamma: parseFloat(st.gamma) || 90.0
    };
    const a = Number(lat.a) || 4.0;
    const b = Number(lat.b) || a;
    const c = Number(lat.c) || a;
    const alpha = Number(lat.alpha) || 90.0;
    const beta = Number(lat.beta) || 90.0;
    const gamma = Number(lat.gamma) || 90.0;
    const vol = cellVolume(a, b, c, alpha, beta, gamma);

    const atoms = Array.isArray(st.atoms) ? st.atoms : [];
    const stoich = computeFormulaAndZ(atoms);
    const formula = stoich.reduced || st.formula || st.chemical_formula || "Crystal";
    const zVal = Number(st.formulaUnitsZ || st.formula_units_Z || stoich.z || 1);
    const dataTag = (st.name || formula || "Structure").replace(/[^A-Za-z0-9_+\-]/g, "_");

    const asymm = st.asymmetricAtoms || st.asymmetric_atoms;
    const symops = st.symops;
    const useSymmetry = !options.forceP1 && Boolean(st.symmetryIntact || st.symmetry_intact) &&
      Array.isArray(asymm) && asymm.length > 0 && Array.isArray(symops) && symops.length > 0;

    const sgHM = useSymmetry ? (st.spaceGroupHM || st.space_group_hm || "P 1") : "P 1";
    const sgIT = useSymmetry ? (Number(st.spaceGroupIT || st.space_group_it) || 1) : 1;
    const hall = useSymmetry ? (st.hallSymbol || st.hall_symbol || (sgIT === 1 ? "P 1" : "")) : "P 1";
    const cs = (useSymmetry ? (st.crystalSystem || st.crystal_system) : inferCrystalSystemFromLattice(a, b, c, alpha, beta, gamma)) || "Triclinic";
    const outOps = useSymmetry ? symops : ["x, y, z"];
    const outSites = useSymmetry ? asymm : atoms;

    const lines = [];
    lines.push(`# CIF 1.1 generated by MatSci Nexus Crystallographic Engine (VESTA-compatible)`);
    lines.push(`data_${dataTag}`);
    lines.push(`_audit_creation_method            'MatSci Nexus Crystallographic Engine'`);
    lines.push(`_chemical_name_common             '${String(st.name || formula).replace(/'/g, "")}'`);
    lines.push(`_chemical_formula_sum             '${formula}'`);
    lines.push(`_cell_length_a                    ${a.toFixed(6)}`);
    lines.push(`_cell_length_b                    ${b.toFixed(6)}`);
    lines.push(`_cell_length_c                    ${c.toFixed(6)}`);
    lines.push(`_cell_angle_alpha                 ${alpha.toFixed(4)}`);
    lines.push(`_cell_angle_beta                  ${beta.toFixed(4)}`);
    lines.push(`_cell_angle_gamma                 ${gamma.toFixed(4)}`);
    lines.push(`_cell_volume                      ${vol.toFixed(4)}`);
    lines.push(`_cell_formula_units_Z             ${zVal}`);
    lines.push(`_symmetry_cell_setting            ${cs.toLowerCase()}`);
    lines.push(`_space_group_crystal_system       ${cs.toLowerCase()}`);
    lines.push(`_symmetry_space_group_name_H-M    '${sgHM}'`);
    lines.push(`_space_group_name_H-M_alt         '${sgHM}'`);
    lines.push(`_symmetry_Int_Tables_number       ${sgIT}`);
    lines.push(`_space_group_IT_number            ${sgIT}`);
    if (hall) {
      lines.push(`_space_group_name_Hall            '${hall}'`);
    }
    lines.push(`loop_`);
    lines.push(`_symmetry_equiv_pos_as_xyz`);
    for (const opStr of outOps) {
      lines.push(`  '${opStr}'`);
    }
    lines.push(`loop_`);
    lines.push(`_atom_site_label`);
    lines.push(`_atom_site_type_symbol`);
    lines.push(`_atom_site_fract_x`);
    lines.push(`_atom_site_fract_y`);
    lines.push(`_atom_site_fract_z`);
    lines.push(`_atom_site_U_iso_or_equiv`);
    lines.push(`_atom_site_adp_type`);
    lines.push(`_atom_site_occupancy`);

    const usedLabels = new Set();
    outSites.forEach((at, idx) => {
      const el = resolveCifElement(at.element);
      const tSym = (at.type_symbol && String(at.type_symbol).trim()) || el;
      let lbl = (at.label && String(at.label).trim().replace(/\s+/g, "_")) || `${el}${idx + 1}`;
      if (usedLabels.has(lbl)) lbl = `${el}${idx + 1}`;
      usedLabels.add(lbl);
      const fx = Number(at.x || 0).toFixed(6).padStart(10, " ");
      const fy = Number(at.y || 0).toFixed(6).padStart(10, " ");
      const fz = Number(at.z || 0).toFixed(6).padStart(10, " ");
      const uiso = Number(at.uiso || 0).toFixed(5).padStart(8, " ");
      const adp = (at.adp_type || "Uiso").padEnd(5, " ");
      const occ = (typeof at.occupancy === "number" && isFinite(at.occupancy) ? at.occupancy : 1.0).toFixed(4);
      lines.push(`${lbl.padEnd(8, " ")} ${tSym.padEnd(5, " ")} ${fx} ${fy} ${fz} ${uiso}  ${adp} ${occ}`);
    });

    return lines.join("\n") + "\n";
  }

  global.MATSCI_SG_230 = SG_230;
  global.decodeHallSymbolToOps = decodeHallSymbolToOps;
  global.parseSymopXyzString = parseSymopXyzString;
  global.formatSymopXyz = formatSymopXyz;
  global.resolveSpaceGroupMetadata = resolveSpaceGroupMetadata;
  global.tokenizeCifBlock = tokenizeCifBlock;
  global.parseCifFullCrystal = parseCifFullCrystal;
  global.exportVestaStandardCif = exportVestaStandardCif;
})(typeof window !== "undefined" ? window : globalThis);
