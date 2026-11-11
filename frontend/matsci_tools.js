// ============================================================================
// MatSci Nexus — Periodic Table (118 Elements) & Materials Calculators
// ============================================================================

const ELEMENTS_DATA = [
  { n: 1, s: "H", name: "Hydrogen", m: 1.008, cat: "nonmetal", g: 1, p: 1, en: 2.20, crys: "HCP", a: 3.78, mp: -259.1, rho: 0.00009, ox: "+1, -1", conf: "1s¹" },
  { n: 2, s: "He", name: "Helium", m: 4.0026, cat: "noble", g: 18, p: 1, en: null, crys: "HCP", a: 3.57, mp: -272.2, rho: 0.00018, ox: "0", conf: "1s²" },
  { n: 3, s: "Li", name: "Lithium", m: 6.94, cat: "alkali", g: 1, p: 2, en: 0.98, crys: "BCC", a: 3.51, mp: 180.5, rho: 0.534, ox: "+1", conf: "[He] 2s¹" },
  { n: 4, s: "Be", name: "Beryllium", m: 9.0122, cat: "alkaline", g: 2, p: 2, en: 1.57, crys: "HCP", a: 2.29, mp: 1287, rho: 1.85, ox: "+2", conf: "[He] 2s²" },
  { n: 5, s: "B", name: "Boron", m: 10.81, cat: "metalloid", g: 13, p: 2, en: 2.04, crys: "Rhombohedral", a: 5.06, mp: 2076, rho: 2.34, ox: "+3", conf: "[He] 2s² 2p¹" },
  { n: 6, s: "C", name: "Carbon", m: 12.011, cat: "nonmetal", g: 14, p: 2, en: 2.55, crys: "Hexagonal / Diamond", a: 2.46, mp: 3550, rho: 2.267, ox: "+4, +2, -4", conf: "[He] 2s² 2p²" },
  { n: 7, s: "N", name: "Nitrogen", m: 14.007, cat: "nonmetal", g: 15, p: 2, en: 3.04, crys: "Hexagonal", a: 4.04, mp: -210.0, rho: 0.00125, ox: "+5, +3, -3", conf: "[He] 2s² 2p³" },
  { n: 8, s: "O", name: "Oxygen", m: 15.999, cat: "nonmetal", g: 16, p: 2, en: 3.44, crys: "Cubic", a: 6.83, mp: -218.8, rho: 0.00143, ox: "-2, -1", conf: "[He] 2s² 2p⁴" },
  { n: 9, s: "F", name: "Fluorine", m: 18.998, cat: "halogen", g: 17, p: 2, en: 3.98, crys: "Monoclinic", a: 5.50, mp: -219.7, rho: 0.0017, ox: "-1", conf: "[He] 2s² 2p⁵" },
  { n: 10, s: "Ne", name: "Neon", m: 20.180, cat: "noble", g: 18, p: 2, en: null, crys: "FCC", a: 4.43, mp: -248.6, rho: 0.0009, ox: "0", conf: "[He] 2s² 2p⁶" },

  { n: 11, s: "Na", name: "Sodium", m: 22.990, cat: "alkali", g: 1, p: 3, en: 0.93, crys: "BCC", a: 4.29, mp: 97.8, rho: 0.968, ox: "+1", conf: "[Ne] 3s¹" },
  { n: 12, s: "Mg", name: "Magnesium", m: 24.305, cat: "alkaline", g: 2, p: 3, en: 1.31, crys: "HCP", a: 3.21, mp: 650, rho: 1.738, ox: "+2", conf: "[Ne] 3s²" },
  { n: 13, s: "Al", name: "Aluminum", m: 26.982, cat: "post-transition", g: 13, p: 3, en: 1.61, crys: "FCC", a: 4.05, mp: 660.3, rho: 2.70, ox: "+3", conf: "[Ne] 3s² 3p¹" },
  { n: 14, s: "Si", name: "Silicon", m: 28.085, cat: "metalloid", g: 14, p: 3, en: 1.90, crys: "Diamond Cubic", a: 5.431, mp: 1414, rho: 2.329, ox: "+4, -4", conf: "[Ne] 3s² 3p²" },
  { n: 15, s: "P", name: "Phosphorus", m: 30.974, cat: "nonmetal", g: 15, p: 3, en: 2.19, crys: "Orthorhombic", a: 3.31, mp: 44.15, rho: 1.823, ox: "+5, +3, -3", conf: "[Ne] 3s² 3p³" },
  { n: 16, s: "S", name: "Sulfur", m: 32.06, cat: "nonmetal", g: 16, p: 3, en: 2.58, crys: "Orthorhombic", a: 10.46, mp: 115.2, rho: 2.07, ox: "+6, +4, -2", conf: "[Ne] 3s² 3p⁴" },
  { n: 17, s: "Cl", name: "Chlorine", m: 35.45, cat: "halogen", g: 17, p: 3, en: 3.16, crys: "Orthorhombic", a: 6.24, mp: -101.5, rho: 0.0032, ox: "+7, +5, +1, -1", conf: "[Ne] 3s² 3p⁵" },
  { n: 18, s: "Ar", name: "Argon", m: 39.948, cat: "noble", g: 18, p: 3, en: null, crys: "FCC", a: 5.26, mp: -189.4, rho: 0.00178, ox: "0", conf: "[Ne] 3s² 3p⁶" },

  { n: 19, s: "K", name: "Potassium", m: 39.098, cat: "alkali", g: 1, p: 4, en: 0.82, crys: "BCC", a: 5.33, mp: 63.5, rho: 0.862, ox: "+1", conf: "[Ar] 4s¹" },
  { n: 20, s: "Ca", name: "Calcium", m: 40.078, cat: "alkaline", g: 2, p: 4, en: 1.00, crys: "FCC", a: 5.58, mp: 842, rho: 1.55, ox: "+2", conf: "[Ar] 4s²" },
  { n: 21, s: "Sc", name: "Scandium", m: 44.956, cat: "transition", g: 3, p: 4, en: 1.36, crys: "HCP", a: 3.31, mp: 1541, rho: 2.985, ox: "+3", conf: "[Ar] 3d¹ 4s²" },
  { n: 22, s: "Ti", name: "Titanium", m: 47.867, cat: "transition", g: 4, p: 4, en: 1.54, crys: "HCP (α) / BCC (β)", a: 2.95, mp: 1668, rho: 4.506, ox: "+4, +3, +2", conf: "[Ar] 3d² 4s²" },
  { n: 23, s: "V", name: "Vanadium", m: 50.942, cat: "transition", g: 5, p: 4, en: 1.63, crys: "BCC", a: 3.03, mp: 1910, rho: 6.11, ox: "+5, +4, +3, +2", conf: "[Ar] 3d³ 4s²" },
  { n: 24, s: "Cr", name: "Chromium", m: 51.996, cat: "transition", g: 6, p: 4, en: 1.66, crys: "BCC", a: 2.91, mp: 1907, rho: 7.19, ox: "+6, +3, +2", conf: "[Ar] 3d⁵ 4s¹" },
  { n: 25, s: "Mn", name: "Manganese", m: 54.938, cat: "transition", g: 7, p: 4, en: 1.55, crys: "Cubic (α-Mn)", a: 8.91, mp: 1246, rho: 7.21, ox: "+7, +4, +3, +2", conf: "[Ar] 3d⁵ 4s²" },
  { n: 26, s: "Fe", name: "Iron", m: 55.845, cat: "transition", g: 8, p: 4, en: 1.83, crys: "BCC (α) / FCC (γ)", a: 2.866, mp: 1538, rho: 7.874, ox: "+3, +2", conf: "[Ar] 3d⁶ 4s²" },
  { n: 27, s: "Co", name: "Cobalt", m: 58.933, cat: "transition", g: 9, p: 4, en: 1.88, crys: "HCP / FCC", a: 2.51, mp: 1495, rho: 8.90, ox: "+3, +2", conf: "[Ar] 3d⁷ 4s²" },
  { n: 28, s: "Ni", name: "Nickel", m: 58.693, cat: "transition", g: 10, p: 4, en: 1.91, crys: "FCC", a: 3.524, mp: 1455, rho: 8.908, ox: "+3, +2", conf: "[Ar] 3d⁸ 4s²" },
  { n: 29, s: "Cu", name: "Copper", m: 63.546, cat: "transition", g: 11, p: 4, en: 1.90, crys: "FCC", a: 3.615, mp: 1084.6, rho: 8.96, ox: "+2, +1", conf: "[Ar] 3d¹⁰ 4s¹" },
  { n: 30, s: "Zn", name: "Zinc", m: 65.38, cat: "transition", g: 12, p: 4, en: 1.65, crys: "HCP", a: 2.665, mp: 419.5, rho: 7.14, ox: "+2", conf: "[Ar] 3d¹⁰ 4s²" },
  { n: 31, s: "Ga", name: "Gallium", m: 69.723, cat: "post-transition", g: 13, p: 4, en: 1.81, crys: "Orthorhombic", a: 4.52, mp: 29.76, rho: 5.91, ox: "+3", conf: "[Ar] 3d¹⁰ 4s² 4p¹" },
  { n: 32, s: "Ge", name: "Germanium", m: 72.630, cat: "metalloid", g: 14, p: 4, en: 2.01, crys: "Diamond Cubic", a: 5.658, mp: 938.3, rho: 5.323, ox: "+4, +2", conf: "[Ar] 3d¹⁰ 4s² 4p²" },
  { n: 33, s: "As", name: "Arsenic", m: 74.922, cat: "metalloid", g: 15, p: 4, en: 2.18, crys: "Rhombohedral", a: 3.76, mp: 817, rho: 5.727, ox: "+5, +3, -3", conf: "[Ar] 3d¹⁰ 4s² 4p³" },
  { n: 34, s: "Se", name: "Selenium", m: 78.971, cat: "nonmetal", g: 16, p: 4, en: 2.55, crys: "Hexagonal", a: 4.36, mp: 221, rho: 4.81, ox: "+6, +4, -2", conf: "[Ar] 3d¹⁰ 4s² 4p⁴" },
  { n: 35, s: "Br", name: "Bromine", m: 79.904, cat: "halogen", g: 17, p: 4, en: 2.96, crys: "Orthorhombic", a: 6.67, mp: -7.2, rho: 3.102, ox: "+5, +1, -1", conf: "[Ar] 3d¹⁰ 4s² 4p⁵" },
  { n: 36, s: "Kr", name: "Krypton", m: 83.798, cat: "noble", g: 18, p: 4, en: 3.00, crys: "FCC", a: 5.71, mp: -157.4, rho: 0.0037, ox: "0", conf: "[Ar] 3d¹⁰ 4s² 4p⁶" },

  { n: 37, s: "Rb", name: "Rubidium", m: 85.468, cat: "alkali", g: 1, p: 5, en: 0.82, crys: "BCC", a: 5.59, mp: 39.3, rho: 1.532, ox: "+1", conf: "[Kr] 5s¹" },
  { n: 38, s: "Sr", name: "Strontium", m: 87.62, cat: "alkaline", g: 2, p: 5, en: 0.95, crys: "FCC", a: 6.08, mp: 777, rho: 2.64, ox: "+2", conf: "[Kr] 5s²" },
  { n: 39, s: "Y", name: "Yttrium", m: 88.906, cat: "transition", g: 3, p: 5, en: 1.22, crys: "HCP", a: 3.65, mp: 1526, rho: 4.472, ox: "+3", conf: "[Kr] 4d¹ 5s²" },
  { n: 40, s: "Zr", name: "Zirconium", m: 91.224, cat: "transition", g: 4, p: 5, en: 1.33, crys: "HCP", a: 3.23, mp: 1855, rho: 6.52, ox: "+4", conf: "[Kr] 4d² 5s²" },
  { n: 41, s: "Nb", name: "Niobium", m: 92.906, cat: "transition", g: 5, p: 5, en: 1.60, crys: "BCC", a: 3.30, mp: 2477, rho: 8.57, ox: "+5, +3", conf: "[Kr] 4d⁴ 5s¹" },
  { n: 42, s: "Mo", name: "Molybdenum", m: 95.95, cat: "transition", g: 6, p: 5, en: 2.16, crys: "BCC", a: 3.147, mp: 2623, rho: 10.28, ox: "+6, +4", conf: "[Kr] 4d⁵ 5s¹" },
  { n: 43, s: "Tc", name: "Technetium", m: 98.0, cat: "transition", g: 7, p: 5, en: 1.90, crys: "HCP", a: 2.74, mp: 2157, rho: 11.5, ox: "+7, +4", conf: "[Kr] 4d⁵ 5s²" },
  { n: 44, s: "Ru", name: "Ruthenium", m: 101.07, cat: "transition", g: 8, p: 5, en: 2.20, crys: "HCP", a: 2.71, mp: 2334, rho: 12.45, ox: "+4, +3", conf: "[Kr] 4d⁷ 5s¹" },
  { n: 45, s: "Rh", name: "Rhodium", m: 102.91, cat: "transition", g: 9, p: 5, en: 2.28, crys: "FCC", a: 3.80, mp: 1964, rho: 12.41, ox: "+3", conf: "[Kr] 4d⁸ 5s¹" },
  { n: 46, s: "Pd", name: "Palladium", m: 106.42, cat: "transition", g: 10, p: 5, en: 2.20, crys: "FCC", a: 3.89, mp: 1554.9, rho: 12.023, ox: "+4, +2", conf: "[Kr] 4d¹⁰" },
  { n: 47, s: "Ag", name: "Silver", m: 107.87, cat: "transition", g: 11, p: 5, en: 1.93, crys: "FCC", a: 4.085, mp: 961.8, rho: 10.49, ox: "+1", conf: "[Kr] 4d¹⁰ 5s¹" },
  { n: 48, s: "Cd", name: "Cadmium", m: 112.41, cat: "transition", g: 12, p: 5, en: 1.69, crys: "HCP", a: 2.98, mp: 321.1, rho: 8.65, ox: "+2", conf: "[Kr] 4d¹⁰ 5s²" },
  { n: 49, s: "In", name: "Indium", m: 114.82, cat: "post-transition", g: 13, p: 5, en: 1.78, crys: "Tetragonal", a: 3.25, mp: 156.6, rho: 7.31, ox: "+3", conf: "[Kr] 4d¹⁰ 5s² 5p¹" },
  { n: 50, s: "Sn", name: "Tin", m: 118.71, cat: "post-transition", g: 14, p: 5, en: 1.96, crys: "Tetragonal (β)", a: 5.83, mp: 231.9, rho: 7.365, ox: "+4, +2", conf: "[Kr] 4d¹⁰ 5s² 5p²" },
  { n: 51, s: "Sb", name: "Antimony", m: 121.76, cat: "metalloid", g: 15, p: 5, en: 2.05, crys: "Rhombohedral", a: 4.31, mp: 630.6, rho: 6.697, ox: "+5, +3, -3", conf: "[Kr] 4d¹⁰ 5s² 5p³" },
  { n: 52, s: "Te", name: "Tellurium", m: 127.60, cat: "metalloid", g: 16, p: 5, en: 2.10, crys: "Hexagonal", a: 4.46, mp: 449.5, rho: 6.24, ox: "+6, +4, -2", conf: "[Kr] 4d¹⁰ 5s² 5p⁴" },
  { n: 53, s: "I", name: "Iodine", m: 126.90, cat: "halogen", g: 17, p: 5, en: 2.66, crys: "Orthorhombic", a: 7.18, mp: 113.7, rho: 4.933, ox: "+7, +5, +1, -1", conf: "[Kr] 4d¹⁰ 5s² 5p⁵" },
  { n: 54, s: "Xe", name: "Xenon", m: 131.29, cat: "noble", g: 18, p: 5, en: 2.60, crys: "FCC", a: 6.20, mp: -111.8, rho: 0.0059, ox: "0", conf: "[Kr] 4d¹⁰ 5s² 5p⁶" },

  { n: 55, s: "Cs", name: "Cesium", m: 132.91, cat: "alkali", g: 1, p: 6, en: 0.79, crys: "BCC", a: 6.14, mp: 28.5, rho: 1.93, ox: "+1", conf: "[Xe] 6s¹" },
  { n: 56, s: "Ba", name: "Barium", m: 137.33, cat: "alkaline", g: 2, p: 6, en: 0.89, crys: "BCC", a: 5.02, mp: 727, rho: 3.51, ox: "+2", conf: "[Xe] 6s²" },

  // Lanthanides (57-71)
  { n: 57, s: "La", name: "Lanthanum", m: 138.91, cat: "lanthanide", g: 3, p: 8, en: 1.10, crys: "DHCP", a: 3.77, mp: 920, rho: 6.162, ox: "+3", conf: "[Xe] 5d¹ 6s²" },
  { n: 58, s: "Ce", name: "Cerium", m: 140.12, cat: "lanthanide", g: 4, p: 8, en: 1.12, crys: "FCC", a: 5.16, mp: 795, rho: 6.77, ox: "+4, +3", conf: "[Xe] 4f¹ 5d¹ 6s²" },
  { n: 59, s: "Pr", name: "Praseodymium", m: 140.91, cat: "lanthanide", g: 5, p: 8, en: 1.13, crys: "DHCP", a: 3.67, mp: 935, rho: 6.77, ox: "+3", conf: "[Xe] 4f³ 6s²" },
  { n: 60, s: "Nd", name: "Neodymium", m: 144.24, cat: "lanthanide", g: 6, p: 8, en: 1.14, crys: "DHCP", a: 3.66, mp: 1024, rho: 7.01, ox: "+3", conf: "[Xe] 4f⁴ 6s²" },
  { n: 61, s: "Pm", name: "Promethium", m: 145.0, cat: "lanthanide", g: 7, p: 8, en: 1.13, crys: "DHCP", a: 3.65, mp: 1042, rho: 7.26, ox: "+3", conf: "[Xe] 4f⁵ 6s²" },
  { n: 62, s: "Sm", name: "Samarium", m: 150.36, cat: "lanthanide", g: 8, p: 8, en: 1.17, crys: "Rhombohedral", a: 3.62, mp: 1072, rho: 7.52, ox: "+3, +2", conf: "[Xe] 4f⁶ 6s²" },
  { n: 63, s: "Eu", name: "Europium", m: 151.96, cat: "lanthanide", g: 9, p: 8, en: 1.20, crys: "BCC", a: 4.58, mp: 826, rho: 5.244, ox: "+3, +2", conf: "[Xe] 4f⁷ 6s²" },
  { n: 64, s: "Gd", name: "Gadolinium", m: 157.25, cat: "lanthanide", g: 10, p: 8, en: 1.20, crys: "HCP", a: 3.64, mp: 1312, rho: 7.90, ox: "+3", conf: "[Xe] 4f⁷ 5d¹ 6s²" },
  { n: 65, s: "Tb", name: "Terbium", m: 158.93, cat: "lanthanide", g: 11, p: 8, en: 1.20, crys: "HCP", a: 3.60, mp: 1356, rho: 8.23, ox: "+4, +3", conf: "[Xe] 4f⁹ 6s²" },
  { n: 66, s: "Dy", name: "Dysprosium", m: 162.50, cat: "lanthanide", g: 12, p: 8, en: 1.22, crys: "HCP", a: 3.59, mp: 1407, rho: 8.54, ox: "+3", conf: "[Xe] 4f¹⁰ 6s²" },
  { n: 67, s: "Ho", name: "Holmium", m: 164.93, cat: "lanthanide", g: 13, p: 8, en: 1.23, crys: "HCP", a: 3.58, mp: 1461, rho: 8.79, ox: "+3", conf: "[Xe] 4f¹¹ 6s²" },
  { n: 68, s: "Er", name: "Erbium", m: 167.26, cat: "lanthanide", g: 14, p: 8, en: 1.24, crys: "HCP", a: 3.56, mp: 1529, rho: 9.066, ox: "+3", conf: "[Xe] 4f¹² 6s²" },
  { n: 69, s: "Tm", name: "Thulium", m: 168.93, cat: "lanthanide", g: 15, p: 8, en: 1.25, crys: "HCP", a: 3.54, mp: 1545, rho: 9.32, ox: "+3", conf: "[Xe] 4f¹³ 6s²" },
  { n: 70, s: "Yb", name: "Ytterbium", m: 173.05, cat: "lanthanide", g: 16, p: 8, en: 1.10, crys: "FCC", a: 5.48, mp: 824, rho: 6.90, ox: "+3, +2", conf: "[Xe] 4f¹⁴ 6s²" },
  { n: 71, s: "Lu", name: "Lutetium", m: 174.97, cat: "lanthanide", g: 17, p: 8, en: 1.27, crys: "HCP", a: 3.50, mp: 1652, rho: 9.84, ox: "+3", conf: "[Xe] 4f¹⁴ 5d¹ 6s²" },

  { n: 72, s: "Hf", name: "Hafnium", m: 178.49, cat: "transition", g: 4, p: 6, en: 1.30, crys: "HCP", a: 3.19, mp: 2233, rho: 13.31, ox: "+4", conf: "[Xe] 4f¹⁴ 5d² 6s²" },
  { n: 73, s: "Ta", name: "Tantalum", m: 180.95, cat: "transition", g: 5, p: 6, en: 1.50, crys: "BCC", a: 3.30, mp: 3017, rho: 16.69, ox: "+5", conf: "[Xe] 4f¹⁴ 5d³ 6s²" },
  { n: 74, s: "W", name: "Tungsten", m: 183.84, cat: "transition", g: 6, p: 6, en: 2.36, crys: "BCC", a: 3.165, mp: 3422, rho: 19.25, ox: "+6, +4", conf: "[Xe] 4f¹⁴ 5d⁴ 6s²" },
  { n: 75, s: "Re", name: "Rhenium", m: 186.21, cat: "transition", g: 7, p: 6, en: 1.90, crys: "HCP", a: 2.76, mp: 3186, rho: 21.02, ox: "+7, +4", conf: "[Xe] 4f¹⁴ 5d⁵ 6s²" },
  { n: 76, s: "Os", name: "Osmium", m: 190.23, cat: "transition", g: 8, p: 6, en: 2.20, crys: "HCP", a: 2.73, mp: 3033, rho: 22.59, ox: "+4", conf: "[Xe] 4f¹⁴ 5d⁶ 6s²" },
  { n: 77, s: "Ir", name: "Iridium", m: 192.22, cat: "transition", g: 9, p: 6, en: 2.20, crys: "FCC", a: 3.84, mp: 2446, rho: 22.56, ox: "+4, +3", conf: "[Xe] 4f¹⁴ 5d⁷ 6s²" },
  { n: 78, s: "Pt", name: "Platinum", m: 195.08, cat: "transition", g: 10, p: 6, en: 2.28, crys: "FCC", a: 3.924, mp: 1768.3, rho: 21.45, ox: "+4, +2", conf: "[Xe] 4f¹⁴ 5d⁹ 6s¹" },
  { n: 79, s: "Au", name: "Gold", m: 196.97, cat: "transition", g: 11, p: 6, en: 2.54, crys: "FCC", a: 4.078, mp: 1064.2, rho: 19.30, ox: "+3, +1", conf: "[Xe] 4f¹⁴ 5d¹⁰ 6s¹" },
  { n: 80, s: "Hg", name: "Mercury", m: 200.59, cat: "transition", g: 12, p: 6, en: 2.00, crys: "Rhombohedral", a: 3.00, mp: -38.8, rho: 13.534, ox: "+2, +1", conf: "[Xe] 4f¹⁴ 5d¹⁰ 6s²" },
  { n: 81, s: "Tl", name: "Thallium", m: 204.38, cat: "post-transition", g: 13, p: 6, en: 1.62, crys: "HCP", a: 3.46, mp: 304, rho: 11.85, ox: "+3, +1", conf: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹" },
  { n: 82, s: "Pb", name: "Lead", m: 207.2, cat: "post-transition", g: 14, p: 6, en: 2.33, crys: "FCC", a: 4.95, mp: 327.5, rho: 11.34, ox: "+4, +2", conf: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²" },
  { n: 83, s: "Bi", name: "Bismuth", m: 208.98, cat: "post-transition", g: 15, p: 6, en: 2.02, crys: "Rhombohedral", a: 4.54, mp: 271.4, rho: 9.78, ox: "+5, +3", conf: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³" },
  { n: 84, s: "Po", name: "Polonium", m: 209.0, cat: "post-transition", g: 16, p: 6, en: 2.00, crys: "Cubic", a: 3.35, mp: 254, rho: 9.196, ox: "+4, +2", conf: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴" },
  { n: 85, s: "At", name: "Astatine", m: 210.0, cat: "halogen", g: 17, p: 6, en: 2.20, crys: "Unknown", a: null, mp: 302, rho: 7.0, ox: "-1, +1", conf: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵" },
  { n: 86, s: "Rn", name: "Radon", m: 222.0, cat: "noble", g: 18, p: 6, en: 2.20, crys: "FCC", a: null, mp: -71, rho: 0.0097, ox: "0", conf: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶" },

  { n: 87, s: "Fr", name: "Francium", m: 223.0, cat: "alkali", g: 1, p: 7, en: 0.70, crys: "BCC", a: null, mp: 27, rho: 1.87, ox: "+1", conf: "[Rn] 7s¹" },
  { n: 88, s: "Ra", name: "Radium", m: 226.0, cat: "alkaline", g: 2, p: 7, en: 0.90, crys: "BCC", a: 5.15, mp: 700, rho: 5.5, ox: "+2", conf: "[Rn] 7s²" },

  // Actinides (89-103)
  { n: 89, s: "Ac", name: "Actinium", m: 227.0, cat: "actinide", g: 3, p: 9, en: 1.10, crys: "FCC", a: 5.31, mp: 1050, rho: 10.07, ox: "+3", conf: "[Rn] 6d¹ 7s²" },
  { n: 90, s: "Th", name: "Thorium", m: 232.04, cat: "actinide", g: 4, p: 9, en: 1.30, crys: "FCC", a: 5.08, mp: 1750, rho: 11.72, ox: "+4", conf: "[Rn] 6d² 7s²" },
  { n: 91, s: "Pa", name: "Protactinium", m: 231.04, cat: "actinide", g: 5, p: 9, en: 1.50, crys: "Tetragonal", a: 3.92, mp: 1568, rho: 15.37, ox: "+5", conf: "[Rn] 5f² 6d¹ 7s²" },
  { n: 92, s: "U", name: "Uranium", m: 238.03, cat: "actinide", g: 6, p: 9, en: 1.38, crys: "Orthorhombic", a: 2.85, mp: 1132.2, rho: 19.1, ox: "+6, +4", conf: "[Rn] 5f³ 6d¹ 7s²" },
  { n: 93, s: "Np", name: "Neptunium", m: 237.0, cat: "actinide", g: 7, p: 9, en: 1.36, crys: "Orthorhombic", a: 6.66, mp: 644, rho: 20.45, ox: "+5", conf: "[Rn] 5f⁴ 6d¹ 7s²" },
  { n: 94, s: "Pu", name: "Plutonium", m: 244.0, cat: "actinide", g: 8, p: 9, en: 1.28, crys: "Monoclinic", a: null, mp: 639.4, rho: 19.82, ox: "+4", conf: "[Rn] 5f⁶ 7s²" },
  { n: 95, s: "Am", name: "Americium", m: 243.0, cat: "actinide", g: 9, p: 9, en: 1.13, crys: "DHCP", a: 3.47, mp: 1176, rho: 12.0, ox: "+3", conf: "[Rn] 5f⁷ 7s²" },
  { n: 96, s: "Cm", name: "Curium", m: 247.0, cat: "actinide", g: 10, p: 9, en: 1.28, crys: "DHCP", a: 3.50, mp: 1340, rho: 13.51, ox: "+3", conf: "[Rn] 5f⁷ 6d¹ 7s²" },
  { n: 97, s: "Bk", name: "Berkelium", m: 247.0, cat: "actinide", g: 11, p: 9, en: 1.30, crys: "DHCP", a: 3.42, mp: 986, rho: 14.78, ox: "+3", conf: "[Rn] 5f⁹ 7s²" },
  { n: 98, s: "Cf", name: "Californium", m: 251.0, cat: "actinide", g: 12, p: 9, en: 1.30, crys: "DHCP", a: 3.38, mp: 900, rho: 15.1, ox: "+3", conf: "[Rn] 5f¹⁰ 7s²" },
  { n: 99, s: "Es", name: "Einsteinium", m: 252.0, cat: "actinide", g: 13, p: 9, en: 1.30, crys: "FCC", a: null, mp: 860, rho: 8.84, ox: "+3", conf: "[Rn] 5f¹¹ 7s²" },
  { n: 100, s: "Fm", name: "Fermium", m: 257.0, cat: "actinide", g: 14, p: 9, en: 1.30, crys: "Unknown", a: null, mp: 1527, rho: null, ox: "+3", conf: "[Rn] 5f¹² 7s²" },
  { n: 101, s: "Md", name: "Mendelevium", m: 258.0, cat: "actinide", g: 15, p: 9, en: 1.30, crys: "Unknown", a: null, mp: 827, rho: null, ox: "+3", conf: "[Rn] 5f¹³ 7s²" },
  { n: 102, s: "No", name: "Nobelium", m: 259.0, cat: "actinide", g: 16, p: 9, en: 1.30, crys: "Unknown", a: null, mp: 827, rho: null, ox: "+2", conf: "[Rn] 5f¹⁴ 7s²" },
  { n: 103, s: "Lr", name: "Lawrencium", m: 266.0, cat: "actinide", g: 17, p: 9, en: 1.30, crys: "Unknown", a: null, mp: 1627, rho: null, ox: "+3", conf: "[Rn] 5f¹⁴ 7s² 7p¹" },

  { n: 104, s: "Rf", name: "Rutherfordium", m: 267.0, cat: "transition", g: 4, p: 7, en: null, crys: "HCP", a: null, mp: 2100, rho: 23.2, ox: "+4", conf: "[Rn] 5f¹⁴ 6d² 7s²" },
  { n: 105, s: "Db", name: "Dubnium", m: 268.0, cat: "transition", g: 5, p: 7, en: null, crys: "BCC", a: null, mp: null, rho: 29.3, ox: "+5", conf: "[Rn] 5f¹⁴ 6d³ 7s²" },
  { n: 106, s: "Sg", name: "Seaborgium", m: 269.0, cat: "transition", g: 6, p: 7, en: null, crys: "BCC", a: null, mp: null, rho: 35.0, ox: "+6", conf: "[Rn] 5f¹⁴ 6d⁴ 7s²" },
  { n: 107, s: "Bh", name: "Bohrium", m: 270.0, cat: "transition", g: 7, p: 7, en: null, crys: "HCP", a: null, mp: null, rho: 37.1, ox: "+7", conf: "[Rn] 5f¹⁴ 6d⁵ 7s²" },
  { n: 108, s: "Hs", name: "Hassium", m: 277.0, cat: "transition", g: 8, p: 7, en: null, crys: "HCP", a: null, mp: null, rho: 40.7, ox: "+8", conf: "[Rn] 5f¹⁴ 6d⁶ 7s²" },
  { n: 109, s: "Mt", name: "Meitnerium", m: 278.0, cat: "transition", g: 9, p: 7, en: null, crys: "FCC", a: null, mp: null, rho: 37.4, ox: "+3", conf: "[Rn] 5f¹⁴ 6d⁷ 7s²" },
  { n: 110, s: "Ds", name: "Darmstadtium", m: 281.0, cat: "transition", g: 10, p: 7, en: null, crys: "BCC", a: null, mp: null, rho: 34.8, ox: "+2", conf: "[Rn] 5f¹⁴ 6d⁸ 7s²" },
  { n: 111, s: "Rg", name: "Roentgenium", m: 282.0, cat: "transition", g: 11, p: 7, en: null, crys: "BCC", a: null, mp: null, rho: 28.7, ox: "+1", conf: "[Rn] 5f¹⁴ 6d⁹ 7s²" },
  { n: 112, s: "Cn", name: "Copernicium", m: 285.0, cat: "transition", g: 12, p: 7, en: null, crys: "HCP", a: null, mp: null, rho: 23.7, ox: "+2", conf: "[Rn] 5f¹⁴ 6d¹⁰ 7s²" },
  { n: 113, s: "Nh", name: "Nihonium", m: 286.0, cat: "post-transition", g: 13, p: 7, en: null, crys: "HCP", a: null, mp: null, rho: 16.0, ox: "+1", conf: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹" },
  { n: 114, s: "Fl", name: "Flerovium", m: 289.0, cat: "post-transition", g: 14, p: 7, en: null, crys: "FCC", a: null, mp: null, rho: 14.0, ox: "+2", conf: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²" },
  { n: 115, s: "Mc", name: "Moscovium", m: 290.0, cat: "post-transition", g: 15, p: 7, en: null, crys: "Unknown", a: null, mp: null, rho: 13.5, ox: "+3, +1", conf: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³" },
  { n: 116, s: "Lv", name: "Livermorium", m: 293.0, cat: "post-transition", g: 16, p: 7, en: null, crys: "Unknown", a: null, mp: null, rho: 12.9, ox: "+2", conf: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴" },
  { n: 117, s: "Ts", name: "Tennessine", m: 294.0, cat: "halogen", g: 17, p: 7, en: null, crys: "Unknown", a: null, mp: null, rho: 7.2, ox: "-1", conf: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵" },
  { n: 118, s: "Og", name: "Oganesson", m: 294.0, cat: "noble", g: 18, p: 7, en: null, crys: "FCC", a: null, mp: null, rho: 5.0, ox: "0", conf: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶" }
];

const ELEMENT_BY_SYMBOL = {};
ELEMENTS_DATA.forEach(el => {
  ELEMENT_BY_SYMBOL[el.s] = el;
});

/**
 * Parse a chemical formula supporting nested parentheses, decimals, and hydrates (e.g. Li6.4La3Zr1.4Ta0.6O12, FeC2O4*2H2O).
 * Returns map of { Symbol: count }
 */
function parseChemicalFormula(formulaStr) {
  if (!formulaStr || !formulaStr.trim()) return {};
  const parts = formulaStr.trim().split(/[·*•]/);
  const totalCounts = {};

  for (let part of parts) {
    part = part.trim();
    if (!part) continue;
    let multiplier = 1.0;
    const leadMatch = part.match(/^(\d+(?:\.\d+)?)\s*(.+)$/);
    if (leadMatch) {
      multiplier = parseFloat(leadMatch[1]);
      part = leadMatch[2];
    }
    const subCounts = parseSingleFormulaUnit(part);
    for (const [sym, cnt] of Object.entries(subCounts)) {
      totalCounts[sym] = (totalCounts[sym] || 0) + cnt * multiplier;
    }
  }
  return totalCounts;
}

function parseSingleFormulaUnit(str) {
  const stack = [{}];
  const tokenRegex = /([A-Z][a-z]?|\(|\)|\[|\])(\d+(?:\.\d+)?)?/g;
  let match;
  while ((match = tokenRegex.exec(str)) !== null) {
    const token = match[1];
    const count = match[2] !== undefined ? parseFloat(match[2]) : 1.0;

    if (token === "(" || token === "[") {
      stack.push({});
    } else if (token === ")" || token === "]") {
      if (stack.length > 1) {
        const popped = stack.pop();
        const top = stack[stack.length - 1];
        for (const [el, c] of Object.entries(popped)) {
          top[el] = (top[el] || 0) + c * count;
        }
      }
    } else {
      if (!ELEMENT_BY_SYMBOL[token]) {
        throw new Error(`Unknown chemical element symbol: "${token}"`);
      }
      const top = stack[stack.length - 1];
      top[token] = (top[token] || 0) + count;
    }
  }
  return stack[0];
}
