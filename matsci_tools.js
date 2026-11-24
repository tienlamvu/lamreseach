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


window.CASTEP_MACHINE_SNAPSHOT = [];
window.CASTEP_GATEWAY_SNAPSHOT = [];

// ============================================================================
// BIOVIA Materials Studio & CASTEP Simulation Studio Engine (Full-Page v115)
// ============================================================================

const CASTEP_STUDIO_STATE = {
  initialized: false,
  jobs: [],
  gatewayJobs: [],
  gatewayFilter: "all",
  gatewaySubView: "jobs",
  lastOpticalSpectra: null,
  _jobLoadSeq: 0,
  _dirtyPanes: new Set(["builder", "electronic", "optics", "chdiff", "mulliken", "convergence", "files"]),
  _optSpectraCacheKey: "",
  optZoom: { emin: 0.0, emax: null, nmMin: 180, nmMax: 1100, yScale: 1.0, isDragging: false, lastX: 0 },
  optPanelZooms: {
    a: { emin: 0.0, emax: null, nmMin: 180, nmMax: 1100, yScale: 1.0 },
    b: { emin: 0.0, emax: null, nmMin: 180, nmMax: 1100, yScale: 1.0 },
    c: { emin: 0.0, emax: null, nmMin: 180, nmMax: 1100, yScale: 1.0 },
    d: { emin: 0.0, emax: null, nmMin: 180, nmMax: 1100, yScale: 1.0 },
    single: { emin: 0.0, emax: null, nmMin: 180, nmMax: 1100, yScale: 1.0 }
  },
  activeOptPanel: "a",
  optDragState: { isDragging: false, panelKey: "a", lastX: 0 },
  elecZoom: { isDragging: false, lastY: 0 },
  convZoom: { xMinFrac: 0.0, xMaxFrac: 1.0 },
  chdiffState: {
    mode: "chdiff",
    cloudStyle: "clouds",
    activeGrid: null,
    primaryChargFrm: null,
    refChargFrms: [],
    diffSlots: { ab: null, a: null, b: null },
    isoval: 0.018,
    slicePlane: "xz",
    slicePos: 0.50,
    palette: "yellow-cyan",
    zoom1D: 1.0,
    pan1D: 0.0,
    rot3DMatrix: null,
    isDragging3D: false,
    isDragging1D: false,
    lastX: 0,
    lastY: 0,
    _rafPending: false
  },
  activeJobId: null,
  selectedJobIds: new Set(),
  jobFilter: "all",
  mountedDirHandle: null,
  mountedDirName: "",
  activeStagePane: "builder",
  activeFileEditorTab: "cell",

  gatewayConnected: false,
  gatewayLiveHttp: false,
  gatewayIsLocal: false,
  gatewaySource: "none",
  gatewayUrl: "http://115.145.191.231:18888",
  gatewayHost: "",
  gatewayIp: "",
  gatewayRoot: "",
  gatewayPageGenerated: "",
  gatewayArchivedTotal: 0,
  gatewayArchivedJobs: [],
  gatewayArchivedLoaded: false,
  gatewayServers: [],
  gatewayData: [],
  gatewaySortKey: "default",
  gatewaySortAsc: true,
  gatewayExpandedServer: "",
  gatewayServerDetailLoading: "",
  apiBase: "",
  localProcesses: [],
  localBackendConnected: false,

  // Active 3D Structure in Builder (starts clean until mounted/scanned/imported)
  structure: {
    name: "",
    formula: "",
    spaceGroup: "P 1",
    crystalSystem: "",
    lattice: { a: 5.0, b: 5.0, c: 15.0, alpha: 90.0, beta: 90.0, gamma: 90.0 },
    vectors: [
      [5.0, 0.0, 0.0],
      [0.0, 5.0, 0.0],
      [0.0, 0.0, 15.0]
    ],
    atoms: [],
    kpointsBlock: "",
    speciesPotBlock: ""
  },
  originalStructureBackup: null,
  undoStack: [],
  redoStack: [],

  // VESTA 3D Viewport State
  view3D: {
    rotX: 0,
    rotY: 0,
    // 3x3 orthonormal rotation matrix R (rows are screen X-right, Y-up, Z-out)
    // Default 'a' projection: b -> +X (right), c -> +Y (up), a -> +Z (out toward viewer)
    rotMatrix: [
      [0, 1, 0],
      [0, 0, 1],
      [1, 0, 0]
    ],
    currentAxisPreset: "a",
    panX: 0,
    panY: 0,
    scale: 1.0,
    atomScale: 1.0,
    bondWidthScale: 1.0,
    bondCutoffFactor: 1.15,
    bondColorMode: "bicolor", // "bicolor" | "uniform"
    boundaryMode: "complete", // "complete" | "in-cell" | "asymmetric"
    showModels: true,
    showBoundaryBonds: true,
    showBonds: true,
    showBox: true,
    showLabels: false,
    showAdsorptionSites: false,
    showForces: false,
    showSpins: false,
    showChdiffIso: false,
    showChdiffSlice: false,
    chdiffIsoval: 0.018,
    _topoCache: null,
    _topoCacheKey: "",
    _legendCacheKey: "",
    _rafPending: false,
    boundary: { xmin: 0.0, xmax: 1.0, ymin: 0.0, ymax: 1.0, zmin: 0.0, zmax: 1.0 },
    style: "ball-stick", // "ball-stick" | "space-fill" | "polyhedral" | "wireframe" | "stick"
    theme: "white", // VESTA pure white default ("white" | "dark")
    activeTool: "rotate", // "rotate" | "select" | "pan" | "zoom" | "distance" | "angle" | "adsorb" | "delete"
    isDragging: false,
    dragButton: 0,
    dragMoved: false,
    dragStartX: 0,
    dragStartY: 0,
    lastX: 0,
    lastY: 0,
    marquee: { active: false, x0: 0, y0: 0, x1: 0, y1: 0, additive: false },
    renderedAtomsScreen: [],
    selectedAtomIndices: new Set(),
    lastClickedAtomLog: null,
    distanceMeasurements: [],
    angleMeasurements: [],
    measureBuffer: [],
    customElementColors: {},
    hiddenElements: new Set(),
    lastStats: { atomsCount: 0, unitCellAtoms: 0, bondsCount: 0, polyCount: 0, cpuMs: 1 },
    candidateSites: [],
    previewSiteIndex: 0
  },

  // Geometry Trajectory (.geom) State
  geomFrames: [],
  activeGeomFrameIdx: 0,
  geomPlayTimer: null,

  // Parsed CASTEP Log / Output Diagnostics
  parsedLog: {
    task: "SinglePoint",
    functional: "PBE",
    dispersion: "G06",
    cutoffEv: 700,
    totalEnergyEv: null,
    dispersionEnergyEv: null,
    fermiEnergyEv: null,
    bandGapEv: null,
    mpiCores: 15,
    host: "DESKTOP-BVGR3EA",
    totalTimeSec: null,
    scfCycles: [],
    geomSteps: [],
    forces: [],
    hirshfeldCharges: []
  }
};

// Standard catalytic molecules internal Cartesian offsets (in Angstroms, relative to anchor atom at [0,0,0])
const CASTEP_ADSORBATE_MOLECULES = {
  "H2":  [{ el: "H", dx: 0, dy: 0, dz: 0 }, { el: "H", dx: 0, dy: 0, dz: 0.74 }],
  "O2":  [{ el: "O", dx: 0, dy: 0, dz: 0 }, { el: "O", dx: 0, dy: 0, dz: 1.21 }],
  "CO":  [{ el: "C", dx: 0, dy: 0, dz: 0 }, { el: "O", dx: 0, dy: 0, dz: 1.13 }],
  "N2":  [{ el: "N", dx: 0, dy: 0, dz: 0 }, { el: "N", dx: 0, dy: 0, dz: 1.10 }],
  "NO":  [{ el: "N", dx: 0, dy: 0, dz: 0 }, { el: "O", dx: 0, dy: 0, dz: 1.15 }],
  "OH":  [{ el: "O", dx: 0, dy: 0, dz: 0 }, { el: "H", dx: 0.25, dy: 0, dz: 0.94 }],
  "OOH": [{ el: "O", dx: 0, dy: 0, dz: 0 }, { el: "O", dx: 0.45, dy: 0, dz: 1.38 }, { el: "H", dx: 0.10, dy: 0, dz: 2.28 }],
  "H2O": [{ el: "O", dx: 0, dy: 0, dz: 0 }, { el: "H", dx: 0.76, dy: 0, dz: 0.59 }, { el: "H", dx: -0.76, dy: 0, dz: 0.59 }],
  "CO2": [{ el: "C", dx: 0, dy: 0, dz: 0 }, { el: "O", dx: 1.16, dy: 0, dz: 0 }, { el: "O", dx: -1.16, dy: 0, dz: 0 }],
  "NH3": [{ el: "N", dx: 0, dy: 0, dz: 0 }, { el: "H", dx: 0.94, dy: 0, dz: 0.38 }, { el: "H", dx: -0.47, dy: 0.81, dz: 0.38 }, { el: "H", dx: -0.47, dy: -0.81, dz: 0.38 }]
};

// ============================================================================
// 1. Mathematical & Crystallographic Matrix Utilities
// ============================================================================

function castepVectorsToParams(vecs) {
  const [aVec, bVec, cVec] = vecs;
  const norm = (v) => Math.hypot(v[0], v[1], v[2]);
  const dot = (u, v) => u[0]*v[0] + u[1]*v[1] + u[2]*v[2];
  const a = norm(aVec) || 4.0;
  const b = norm(bVec) || 4.0;
  const c = norm(cVec) || 4.0;
  const clamp = (x) => Math.max(-1, Math.min(1, x));
  const alpha = Math.acos(clamp(dot(bVec, cVec) / (b * c))) * 180 / Math.PI;
  const beta  = Math.acos(clamp(dot(aVec, cVec) / (a * c))) * 180 / Math.PI;
  const gamma = Math.acos(clamp(dot(aVec, bVec) / (a * b))) * 180 / Math.PI;
  return {
    a: Math.round(a * 1000000) / 1000000,
    b: Math.round(b * 1000000) / 1000000,
    c: Math.round(c * 1000000) / 1000000,
    alpha: Math.round(alpha * 10000) / 10000,
    beta:  Math.round(beta * 10000) / 10000,
    gamma: Math.round(gamma * 10000) / 10000
  };
}

function castepParamsToVectors(a, b, c, alpha, beta, gamma) {
  const ar = (alpha * Math.PI) / 180;
  const br = (beta * Math.PI) / 180;
  const gr = (gamma * Math.PI) / 180;
  const ax = a, ay = 0.0, az = 0.0;
  const bx = b * Math.cos(gr);
  const by = b * Math.sin(gr);
  const bz = 0.0;
  const cx = c * Math.cos(br);
  const cy = c * (Math.cos(ar) - Math.cos(br) * Math.cos(gr)) / (Math.sin(gr) || 1.0);
  const cz = Math.sqrt(Math.max(0.0, c * c - cx * cx - cy * cy));
  return [
    [ax, ay, az],
    [bx, by, bz],
    [cx, cy, cz]
  ];
}

function castepCellVolume(vecs) {
  const [a, b, c] = vecs;
  const crossX = b[1]*c[2] - b[2]*c[1];
  const crossY = b[2]*c[0] - b[0]*c[2];
  const crossZ = b[0]*c[1] - b[1]*c[0];
  return Math.abs(a[0]*crossX + a[1]*crossY + a[2]*crossZ);
}

function castepInvert3x3(m) {
  const [r0, r1, r2] = m;
  const det =
    r0[0]*(r1[1]*r2[2] - r1[2]*r2[1]) -
    r0[1]*(r1[0]*r2[2] - r1[2]*r2[0]) +
    r0[2]*(r1[0]*r2[1] - r1[1]*r2[0]);
  if (Math.abs(det) < 1e-12) return [[1,0,0],[0,1,0],[0,0,1]];
  const invDet = 1.0 / det;
  return [
    [
      (r1[1]*r2[2] - r1[2]*r2[1]) * invDet,
      (r0[2]*r2[1] - r0[1]*r2[2]) * invDet,
      (r0[1]*r1[2] - r0[2]*r1[1]) * invDet
    ],
    [
      (r1[2]*r2[0] - r1[0]*r2[2]) * invDet,
      (r0[0]*r2[2] - r0[2]*r2[0]) * invDet,
      (r0[2]*r1[0] - r0[0]*r1[2]) * invDet
    ],
    [
      (r1[0]*r2[1] - r1[1]*r2[0]) * invDet,
      (r0[1]*r2[0] - r0[0]*r2[1]) * invDet,
      (r0[0]*r1[1] - r0[1]*r1[0]) * invDet
    ]
  ];
}

function castepFracToCart(u, v, w, vecs) {
  const [a, b, c] = vecs;
  return [
    u * a[0] + v * b[0] + w * c[0],
    u * a[1] + v * b[1] + w * c[1],
    u * a[2] + v * b[2] + w * c[2]
  ];
}

function castepCartToFrac(x, y, z, vecs) {
  // R_cart = u*a + v*b + w*c => [u,v,w] = [x,y,z] * (vecs)^(-1)
  const inv = castepInvert3x3(vecs);
  return [
    x * inv[0][0] + y * inv[1][0] + z * inv[2][0],
    x * inv[0][1] + y * inv[1][1] + z * inv[2][1],
    x * inv[0][2] + y * inv[1][2] + z * inv[2][2]
  ];
}

function castepCleanElement(raw) {
  if (!raw) return "X";
  const m = String(raw).trim().match(/^([A-Za-z]{1,2})/);
  if (!m) return "X";
  const s = m[1];
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function castepComputeFormula(atoms) {
  if (!atoms || !atoms.length) return "Unknown";
  const counts = {};
  atoms.forEach(at => {
    const el = castepCleanElement(at.element);
    counts[el] = (counts[el] || 0) + 1;
  });
  // Sort by standard cation-first / electronegativity order
  const keys = Object.keys(counts).sort((a, b) => {
    const ea = (typeof ELEMENTS_DATA !== "undefined" && ELEMENTS_DATA.find(e => e.s === a)?.en) || 2.0;
    const eb = (typeof ELEMENTS_DATA !== "undefined" && ELEMENTS_DATA.find(e => e.s === b)?.en) || 2.0;
    return ea - eb || a.localeCompare(b);
  });
  return keys.map(k => counts[k] === 1 ? k : `${k}${counts[k]}`).join("");
}

function castepInferCrystalSystem(lat) {
  const { a, b, c, alpha, beta, gamma } = lat;
  if (Math.abs(alpha - 90) < 0.3 && Math.abs(beta - 90) < 0.3 && (Math.abs(gamma - 120) < 0.5 || Math.abs(gamma - 60) < 0.5)) {
    return "Hexagonal";
  }
  if (Math.abs(alpha - 90) < 0.3 && Math.abs(beta - 90) < 0.3 && Math.abs(gamma - 90) < 0.3) {
    if (Math.abs(a - b) < 0.03 && Math.abs(b - c) < 0.03) return "Cubic";
    if (Math.abs(a - b) < 0.03) return "Tetragonal";
    return "Orthorhombic";
  }
  return "Triclinic";
}

// ============================================================================
// 1B. Scientific Typography Helpers (True HTML <sub>/<sup> & Canvas Subscripts)
// ============================================================================
const CASTEP_SCI_AUTO_SUB_RE = /\b(E)_(F|g)\b|\b(M)_(net|abs)\b|\b(d)_(z)\b|(μ)_([A-Za-z0-9]+)|(ρ)_([A-Za-z0-9]+)|(ε)_([0-9]+)|(σ)_([0-9]+)/g;

function normalizeSciSubTokens(text) {
  return String(text ?? "").replace(CASTEP_SCI_AUTO_SUB_RE, (...args) => {
    for (let i = 1; i < args.length - 2; i += 2) {
      if (args[i] !== undefined) return `${args[i]}_{${args[i + 1]}}`;
    }
    return args[0];
  });
}

function formatSciHtml(rawText) {
  const esc = typeof escapeHtml === "function"
    ? escapeHtml(String(rawText ?? ""))
    : String(rawText ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  return normalizeSciSubTokens(esc)
    .replace(/_\{([^}]+)\}/g, "<sub>$1</sub>")
    .replace(/\^\{([^}]+)\}/g, "<sup>$1</sup>");
}
window.formatSciHtml = formatSciHtml;

function parseSciTextRuns(rawText) {
  const norm = normalizeSciSubTokens(rawText);
  const runs = [];
  const re = /_\{([^}]+)\}|\^\{([^}]+)\}/g;
  let last = 0, m;
  while ((m = re.exec(norm)) !== null) {
    if (m.index > last) runs.push({ text: norm.slice(last, m.index), kind: "norm" });
    if (m[1] !== undefined) runs.push({ text: m[1], kind: "sub" });
    else if (m[2] !== undefined) runs.push({ text: m[2], kind: "sup" });
    last = re.lastIndex;
  }
  if (last < norm.length) runs.push({ text: norm.slice(last), kind: "norm" });
  return runs;
}

function getSciCanvasFonts(baseFont) {
  const f = baseFont || "11px Inter, sans-serif";
  const m = f.match(/(\d+(?:\.\d+)?)px/i);
  const basePx = m ? parseFloat(m[1]) : 11;
  const subPx = Math.max(7.2, Number((basePx * 0.74).toFixed(2)));
  const subFont = m ? f.replace(/(\d+(?:\.\d+)?)px/i, `${subPx}px`) : f;
  return { basePx, baseFont: f, subFont };
}

function measureSciText(ctx, text) {
  const runs = parseSciTextRuns(text);
  if (!runs.length) return 0;
  if (runs.length === 1 && runs[0].kind === "norm") return ctx.measureText(runs[0].text).width;
  const prevFont = ctx.font;
  const { baseFont, subFont } = getSciCanvasFonts(prevFont);
  let total = 0;
  for (const r of runs) {
    ctx.font = r.kind === "norm" ? baseFont : subFont;
    total += ctx.measureText(r.text).width;
  }
  ctx.font = prevFont;
  return total;
}
window.measureSciText = measureSciText;

function drawSciText(ctx, text, x, y) {
  const runs = parseSciTextRuns(text);
  if (!runs.length) return;
  if (runs.length === 1 && runs[0].kind === "norm") {
    ctx.fillText(runs[0].text, x, y);
    return;
  }
  const { basePx, baseFont, subFont } = getSciCanvasFonts(ctx.font);
  const totalW = measureSciText(ctx, text);
  const align = ctx.textAlign || "left";
  let curX = x;
  if (align === "center") curX = x - totalW * 0.5;
  else if (align === "right" || align === "end") curX = x - totalW;

  ctx.save();
  ctx.textAlign = "left";
  for (const r of runs) {
    if (r.kind === "sub") {
      ctx.font = subFont;
      ctx.fillText(r.text, curX, y + basePx * 0.27);
      curX += ctx.measureText(r.text).width;
    } else if (r.kind === "sup") {
      ctx.font = subFont;
      ctx.fillText(r.text, curX, y - basePx * 0.34);
      curX += ctx.measureText(r.text).width;
    } else {
      ctx.font = baseFont;
      ctx.fillText(r.text, curX, y);
      curX += ctx.measureText(r.text).width;
    }
  }
  ctx.restore();
}
window.drawSciText = drawSciText;

// ============================================================================
// 1B. Unified Publication Plot Style Engine (v135 — Times New Roman Journal Standard)
// Shared by ALL CASTEP plots: Band & PDOS, Optical, Spin Matrix, Mulliken,
// Charge Density Difference, and SCF/Geometry Convergence.
// ============================================================================

const CASTEP_PLOT_STYLE_STORAGE_KEY = "castep_plot_style_v1";

const CASTEP_PLOT_STYLE_PRESETS = {
  journal_tnr: {
    preset: "journal_tnr",
    fontFamily: '"Times New Roman", Times, Georgia, serif',
    titleSize: 14,
    axisLabelSize: 13,
    tickSize: 12,
    legendSize: 11,
    borderWidth: 1.8,
    lineWidth: 1.8,
    tickDir: "in",
    tickLength: 5,
    gridMode: "off",
    inkColor: "#000000",
    boldAxes: true,
    exportScale: 4
  },
  acs_arial: {
    preset: "acs_arial",
    fontFamily: "Arial, Helvetica, sans-serif",
    titleSize: 13,
    axisLabelSize: 12,
    tickSize: 11,
    legendSize: 10,
    borderWidth: 1.6,
    lineWidth: 1.8,
    tickDir: "in",
    tickLength: 5,
    gridMode: "off",
    inkColor: "#000000",
    boldAxes: true,
    exportScale: 4
  },
  presentation: {
    preset: "presentation",
    fontFamily: '"Times New Roman", Times, Georgia, serif',
    titleSize: 16,
    axisLabelSize: 15,
    tickSize: 14,
    legendSize: 12,
    borderWidth: 2.2,
    lineWidth: 2.4,
    tickDir: "in",
    tickLength: 6,
    gridMode: "subtle",
    inkColor: "#000000",
    boldAxes: true,
    exportScale: 4
  },
  origin_grid: {
    preset: "origin_grid",
    fontFamily: '"Times New Roman", Times, Georgia, serif',
    titleSize: 14,
    axisLabelSize: 13,
    tickSize: 12,
    legendSize: 11,
    borderWidth: 1.8,
    lineWidth: 1.8,
    tickDir: "in",
    tickLength: 5,
    gridMode: "subtle",
    inkColor: "#000000",
    boldAxes: true,
    exportScale: 4
  }
};

function getCastepCanvasDpr(cssW = 900, cssH = 540, is3D = false) {
  const maxDim = Math.max(1, cssW || 900, cssH || 540);
  const safeCap = Math.max(2, Math.floor(8192 / maxDim));
  if (window._castepRenderDprOverride && Number(window._castepRenderDprOverride) > 0) {
    return Math.min(safeCap, Number(window._castepRenderDprOverride));
  }
  const sysDpr = window.devicePixelRatio || 1;
  if (is3D) return Math.min(safeCap, Math.max(2, sysDpr));
  // Super-sampled 3x backing store on-screen for ultra-sharp publication rendering
  return Math.min(safeCap, Math.max(3, Math.ceil(sysDpr * 1.5)));
}
window.getCastepCanvasDpr = getCastepCanvasDpr;

function applyCrispCanvasQuality(ctx) {
  if (!ctx) return;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
}

function getCastepPlotStyle() {
  if (!window._castepPlotStyle) {
    let saved = null;
    try {
      const raw = localStorage.getItem(CASTEP_PLOT_STYLE_STORAGE_KEY);
      if (raw) saved = JSON.parse(raw);
    } catch (_) {}
    window._castepPlotStyle = { ...CASTEP_PLOT_STYLE_PRESETS.journal_tnr, ...(saved || {}) };
  }
  return window._castepPlotStyle;
}
window.getCastepPlotStyle = getCastepPlotStyle;

function saveCastepPlotStyle(st) {
  window._castepPlotStyle = { ...CASTEP_PLOT_STYLE_PRESETS.journal_tnr, ...st };
  try {
    localStorage.setItem(CASTEP_PLOT_STYLE_STORAGE_KEY, JSON.stringify(window._castepPlotStyle));
  } catch (_) {}
}

function castepPlotFont(role, scale = 1.0, stylePrefix = null) {
  const st = getCastepPlotStyle();
  let basePx = st.tickSize;
  let defaultWeight = "";
  if (role === "title") { basePx = st.titleSize; defaultWeight = st.boldAxes ? "bold " : ""; }
  else if (role === "axis") { basePx = st.axisLabelSize; defaultWeight = st.boldAxes ? "bold " : ""; }
  else if (role === "legend") { basePx = st.legendSize; defaultWeight = ""; }
  else if (role === "tick") { basePx = st.tickSize; defaultWeight = ""; }
  const px = Math.max(8, Number((basePx * scale).toFixed(2)));
  const pref = stylePrefix !== null ? (stylePrefix ? stylePrefix.trim() + " " : "") : defaultWeight;
  return `${pref}${px}px ${st.fontFamily}`;
}
window.castepPlotFont = castepPlotFont;

function formatPubMinus(str) {
  return String(str).replace(/^-/, "\u2212");
}

function drawPubGridLines(ctx, x, y, w, h, st, xPositions = [], yPositions = []) {
  if (!st || st.gridMode === "off") return;
  ctx.save();
  ctx.strokeStyle = st.gridMode === "normal" ? "#cbd5e1" : "#e5e7eb";
  ctx.lineWidth = st.gridMode === "normal" ? 0.9 : 0.75;
  ctx.setLineDash(st.gridMode === "normal" ? [] : [3, 3]);
  (xPositions || []).forEach(px => {
    if (px > x + 2 && px < x + w - 2) {
      ctx.beginPath(); ctx.moveTo(Math.round(px) + 0.5, y); ctx.lineTo(Math.round(px) + 0.5, y + h); ctx.stroke();
    }
  });
  (yPositions || []).forEach(py => {
    if (py > y + 2 && py < y + h - 2) {
      ctx.beginPath(); ctx.moveTo(x, Math.round(py) + 0.5); ctx.lineTo(x + w, Math.round(py) + 0.5); ctx.stroke();
    }
  });
  ctx.setLineDash([]);
  ctx.restore();
}

function drawPubAxisBox(ctx, x, y, w, h, st, opts = {}) {
  const rx = Math.round(x) + 0.5;
  const ry = Math.round(y) + 0.5;
  const rw = Math.round(w);
  const rh = Math.round(h);
  const bw = opts.compact ? Math.max(1.1, st.borderWidth * 0.84) : st.borderWidth;
  ctx.save();
  ctx.strokeStyle = st.inkColor || "#000000";
  ctx.lineWidth = bw;
  ctx.setLineDash([]);
  ctx.strokeRect(rx, ry, rw, rh);

  if (st.tickDir !== "none") {
    const tl = opts.compact ? Math.max(3, (st.tickLength || 5) - 1.5) : (st.tickLength || 5);
    const sgn = st.tickDir === "out" ? -1 : 1; // +1 = inward, -1 = outward
    ctx.lineWidth = Math.max(1.0, bw * 0.85);
    const drawTick = (x1, y1, x2, y2) => {
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    };
    const xTicks = opts.xTicks || [];
    xTicks.forEach(px => {
      const tx = Math.round(px) + 0.5;
      if (tx <= rx + 1.5 || tx >= rx + rw - 1.5) return;
      drawTick(tx, ry + rh, tx, ry + rh - sgn * tl);
      if (opts.mirrorTop) drawTick(tx, ry, tx, ry + sgn * tl);
    });
    const yTicks = opts.yTicks || [];
    yTicks.forEach(py => {
      const ty = Math.round(py) + 0.5;
      if (ty <= ry + 1.5 || ty >= ry + rh - 1.5) return;
      drawTick(rx, ty, rx + sgn * tl, ty);
      if (opts.mirrorRight) drawTick(rx + rw, ty, rx + rw - sgn * tl, ty);
    });
    const rTicks = opts.rightYTicks || [];
    rTicks.forEach(py => {
      const ty = Math.round(py) + 0.5;
      if (ty <= ry + 1.5 || ty >= ry + rh - 1.5) return;
      drawTick(rx + rw, ty, rx + rw - sgn * tl, ty);
    });
  }
  ctx.restore();
}

function syncCastepPlotStyleUI() {
  const st = getCastepPlotStyle();
  const setV = (id, v) => { const el = document.getElementById(id); if (el) el.value = String(v); };
  setV("castep-ps-font", st.fontFamily);
  setV("castep-ps-title-size", st.titleSize);
  setV("castep-ps-axis-size", st.axisLabelSize);
  setV("castep-ps-tick-size", st.tickSize);
  setV("castep-ps-legend-size", st.legendSize);
  setV("castep-ps-border-w", st.borderWidth);
  setV("castep-ps-line-w", st.lineWidth);
  setV("castep-ps-tick-dir", st.tickDir);
  setV("castep-ps-grid", st.gridMode);
  setV("castep-ps-ink", st.inkColor);
  setV("castep-ps-dpi", st.exportScale || 4);
  const chk = document.getElementById("castep-ps-bold-axes");
  if (chk) chk.checked = !!st.boldAxes;

  document.querySelectorAll("#castep-plot-style-bar [data-style-preset]").forEach(btn => {
    const isAct = btn.getAttribute("data-style-preset") === st.preset;
    btn.style.background = isAct ? "#0f172a" : "";
    btn.style.color = isAct ? "#ffffff" : "";
    btn.style.borderColor = isAct ? "#0f172a" : "";
  });
}
window.syncCastepPlotStyleUI = syncCastepPlotStyleUI;

function toggleCastepPlotStyleBar(forceState) {
  const bar = document.getElementById("castep-plot-style-bar");
  const btn = document.getElementById("castep-plot-style-toggle-btn");
  if (!bar) return;
  const nextShow = typeof forceState === "boolean" ? forceState : (bar.style.display === "none" || !bar.style.display);
  bar.style.display = nextShow ? "block" : "none";
  if (btn) {
    btn.style.background = nextShow ? "#0f172a" : "#f8fafc";
    btn.style.color = nextShow ? "#ffffff" : "#0f172a";
  }
  if (nextShow) syncCastepPlotStyleUI();
}
window.toggleCastepPlotStyleBar = toggleCastepPlotStyleBar;

function rerenderAllActiveCastepPlots() {
  if (typeof renderCastepElectronicPlots === "function") renderCastepElectronicPlots();
  if (typeof renderCastepOpticalPlots === "function") renderCastepOpticalPlots();
  if (typeof renderCastepChdiffPlots === "function") renderCastepChdiffPlots();
  if (typeof renderCastepMullikenPane === "function") renderCastepMullikenPane();
  if (typeof renderCastepConvergencePlots === "function") renderCastepConvergencePlots();
}
window.rerenderAllActiveCastepPlots = rerenderAllActiveCastepPlots;

function applyCastepPlotStylePreset(presetKey) {
  const preset = CASTEP_PLOT_STYLE_PRESETS[presetKey];
  if (!preset) return;
  saveCastepPlotStyle({ ...preset });
  syncCastepPlotStyleUI();
  rerenderAllActiveCastepPlots();
}
window.applyCastepPlotStylePreset = applyCastepPlotStylePreset;

function updateCastepPlotStyleFromUI() {
  const clamp = (v, lo, hi, fb) => { const n = parseFloat(v); return isFinite(n) ? Math.max(lo, Math.min(hi, n)) : fb; };
  const cur = getCastepPlotStyle();
  const next = {
    preset: "custom",
    fontFamily: document.getElementById("castep-ps-font")?.value || cur.fontFamily,
    titleSize: clamp(document.getElementById("castep-ps-title-size")?.value, 10, 22, cur.titleSize),
    axisLabelSize: clamp(document.getElementById("castep-ps-axis-size")?.value, 9, 20, cur.axisLabelSize),
    tickSize: clamp(document.getElementById("castep-ps-tick-size")?.value, 8, 18, cur.tickSize),
    legendSize: clamp(document.getElementById("castep-ps-legend-size")?.value, 8, 16, cur.legendSize),
    borderWidth: clamp(document.getElementById("castep-ps-border-w")?.value, 0.8, 3.5, cur.borderWidth),
    lineWidth: clamp(document.getElementById("castep-ps-line-w")?.value, 0.8, 4.0, cur.lineWidth),
    tickDir: document.getElementById("castep-ps-tick-dir")?.value || cur.tickDir,
    tickLength: cur.tickLength || 5,
    gridMode: document.getElementById("castep-ps-grid")?.value || cur.gridMode,
    inkColor: document.getElementById("castep-ps-ink")?.value || cur.inkColor,
    boldAxes: !!document.getElementById("castep-ps-bold-axes")?.checked,
    exportScale: clamp(document.getElementById("castep-ps-dpi")?.value, 2, 6, cur.exportScale || 4)
  };
  saveCastepPlotStyle(next);
  syncCastepPlotStyleUI();
  rerenderAllActiveCastepPlots();
}
window.updateCastepPlotStyleFromUI = updateCastepPlotStyleFromUI;

function resetCastepPlotStyle() {
  applyCastepPlotStylePreset("journal_tnr");
}
window.resetCastepPlotStyle = resetCastepPlotStyle;

// ============================================================================
// 2. Multi-Format CASTEP Parsers (.cell, .param, .castep, .geom, .xsd, .xcd, .bands)
// ============================================================================

function parseCastepCellText(cellText, fallbackName = "CASTEP_Structure") {
  const txt = (cellText || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  let vectors = [
    [6.594293, 0, 0],
    [0, 6.594293, 0],
    [0, 0, 25.150931]
  ];
  let lattice = { a: 6.594293, b: 6.594293, c: 25.150931, alpha: 90, beta: 90, gamma: 120 };

  // 1) Parse %BLOCK LATTICE_CART
  const cartMatch = txt.match(/%BLOCK\s+LATTICE_CART\s*\n([\s\S]*?)%ENDBLOCK\s+LATTICE_CART/i);
  if (cartMatch) {
    let scale = 1.0;
    const lines = cartMatch[1].split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("#") && !l.startsWith("!"));
    const numRows = [];
    lines.forEach(l => {
      if (/bohr/i.test(l)) scale = 0.529177210903;
      const parts = l.split(/\s+/).map(Number).filter(n => !isNaN(n));
      if (parts.length >= 3) numRows.push([parts[0]*scale, parts[1]*scale, parts[2]*scale]);
    });
    if (numRows.length >= 3) {
      vectors = numRows.slice(0, 3);
      lattice = castepVectorsToParams(vectors);
    }
  } else {
    // 2) Parse %BLOCK LATTICE_ABC
    const abcMatch = txt.match(/%BLOCK\s+LATTICE_ABC\s*\n([\s\S]*?)%ENDBLOCK\s+LATTICE_ABC/i);
    if (abcMatch) {
      let scale = 1.0;
      const lines = abcMatch[1].split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("#") && !l.startsWith("!"));
      const numRows = [];
      lines.forEach(l => {
        if (/bohr/i.test(l)) scale = 0.529177210903;
        const parts = l.split(/\s+/).map(Number).filter(n => !isNaN(n));
        if (parts.length >= 3) numRows.push(parts);
      });
      if (numRows.length >= 2) {
        lattice = {
          a: numRows[0][0] * scale,
          b: numRows[0][1] * scale,
          c: numRows[0][2] * scale,
          alpha: numRows[1][0],
          beta: numRows[1][1],
          gamma: numRows[1][2]
        };
        vectors = castepParamsToVectors(lattice.a, lattice.b, lattice.c, lattice.alpha, lattice.beta, lattice.gamma);
      }
    }
  }

  // 3) Parse %BLOCK IONIC_CONSTRAINTS
  const fixedAtomKeys = new Set();
  const constrMatch = txt.match(/%BLOCK\s+IONIC_CONSTRAINTS\s*\n([\s\S]*?)%ENDBLOCK\s+IONIC_CONSTRAINTS/i);
  if (constrMatch) {
    const clines = constrMatch[1].split("\n").map(l => l.trim()).filter(Boolean);
    clines.forEach(l => {
      const p = l.split(/\s+/);
      if (p.length >= 3) {
        const el = castepCleanElement(p[1]);
        const idxInEl = parseInt(p[2], 10);
        if (el && !isNaN(idxInEl)) fixedAtomKeys.add(`${el}_${idxInEl}`);
      }
    });
  }

  // 4) Parse %BLOCK POSITIONS_FRAC or POSITIONS_ABS
  const atoms = [];
  const elCounter = {};
  const fracMatch = txt.match(/%BLOCK\s+POSITIONS_FRAC\s*\n([\s\S]*?)%ENDBLOCK\s+POSITIONS_FRAC/i);
  if (fracMatch) {
    const lines = fracMatch[1].split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("#") && !l.startsWith("!"));
    lines.forEach(l => {
      const p = l.split(/\s+/);
      if (p.length >= 4) {
        const el = castepCleanElement(p[0]);
        const u = parseFloat(p[1]), v = parseFloat(p[2]), w = parseFloat(p[3]);
        if (!isNaN(u) && !isNaN(v) && !isNaN(w)) {
          elCounter[el] = (elCounter[el] || 0) + 1;
          const key = `${el}_${elCounter[el]}`;
          atoms.push({
            element: el,
            label: `${el}${elCounter[el]}`,
            x: ((u % 1) + 1) % 1,
            y: ((v % 1) + 1) % 1,
            z: ((w % 1) + 1) % 1,
            fixed: fixedAtomKeys.has(key),
            fx: 0, fy: 0, fz: 0,
            charge: null
          });
        }
      }
    });
  } else {
    const absMatch = txt.match(/%BLOCK\s+POSITIONS_ABS\s*\n([\s\S]*?)%ENDBLOCK\s+POSITIONS_ABS/i);
    if (absMatch) {
      let scale = 1.0;
      const lines = absMatch[1].split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("#") && !l.startsWith("!"));
      lines.forEach(l => {
        if (/bohr/i.test(l)) scale = 0.529177210903;
        const p = l.split(/\s+/);
        if (p.length >= 4) {
          const el = castepCleanElement(p[0]);
          const cx = parseFloat(p[1]) * scale, cy = parseFloat(p[2]) * scale, cz = parseFloat(p[3]) * scale;
          if (!isNaN(cx) && !isNaN(cy) && !isNaN(cz)) {
            const [u, v, w] = castepCartToFrac(cx, cy, cz, vectors);
            elCounter[el] = (elCounter[el] || 0) + 1;
            const key = `${el}_${elCounter[el]}`;
            atoms.push({
              element: el,
              label: `${el}${elCounter[el]}`,
              x: u,
              y: v,
              z: w,
              fixed: fixedAtomKeys.has(key),
              fx: 0, fy: 0, fz: 0,
              charge: null
            });
          }
        }
      });
    }
  }

  // Preserve KPOINTS and SPECIES_POT blocks
  const kpMatch = txt.match(/%BLOCK\s+KPOINTS_LIST[\s\S]*?%ENDBLOCK\s+KPOINTS_LIST/i);
  const potMatch = txt.match(/%BLOCK\s+SPECIES_POT[\s\S]*?%ENDBLOCK\s+SPECIES_POT/i);

  const formula = castepComputeFormula(atoms);
  return {
    name: fallbackName,
    formula: formula !== "Unknown" ? formula : fallbackName,
    spaceGroup: "P 1 (1)",
    crystalSystem: castepInferCrystalSystem(lattice),
    lattice,
    vectors,
    atoms,
    kpointsBlock: kpMatch ? kpMatch[0] : "",
    speciesPotBlock: potMatch ? potMatch[0] : ""
  };
}

function parseMaterialsStudioXsd(xsdText, fallbackName = "MS_XSD_Structure") {
  const txt = (xsdText || "");
  let vectors = [
    [6.594293, 0, 0],
    [0, 6.594293, 0],
    [0, 0, 25.150931]
  ];
  let spaceGroup = "P 1 (1)";
  const sgMatch = txt.match(/<SpaceGroup\b([^>]+)>/i);
  if (sgMatch) {
    const attrs = sgMatch[1];
    const getAttr = (name) => {
      const m = attrs.match(new RegExp(`${name}="([^"]+)"`, "i"));
      return m ? m[1] : "";
    };
    const av = getAttr("AVector").split(",").map(Number);
    const bv = getAttr("BVector").split(",").map(Number);
    const cv = getAttr("CVector").split(",").map(Number);
    if (av.length === 3 && bv.length === 3 && cv.length === 3 && !isNaN(av[0])) {
      vectors = [av, bv, cv];
    }
    const gName = getAttr("LongName") || getAttr("GroupName") || getAttr("Name") || "P 1";
    const itNum = getAttr("ITNumber");
    spaceGroup = itNum ? `${gName} (${itNum})` : gName;
  }
  const lattice = castepVectorsToParams(vectors);
  const atoms = [];
  const elCount = {};
  const atomRegex = /<Atom3d\b([^>]*?)(?:\/>|>([\s\S]*?)<\/Atom3d>)/gi;
  let am;
  while ((am = atomRegex.exec(txt)) !== null) {
    const attr = am[1];
    const inner = am[2] || "";
    if (/ImageOf="/i.test(attr)) continue; // Skip periodic image atoms
    const compM = attr.match(/Components="([^"]+)"/i);
    const xyzM = attr.match(/XYZ="([^"]+)"/i);
    if (!compM || !xyzM) continue;
    const el = castepCleanElement(compM[1]);
    const coords = xyzM[1].split(",").map(Number);
    if (coords.length < 3 || isNaN(coords[0])) continue;
    elCount[el] = (elCount[el] || 0) + 1;
    const nameM = attr.match(/Name="([^"]+)"/i);
    let fx = 0, fy = 0, fz = 0;
    const forceM = inner.match(/Force="([^"]+)"/i);
    if (forceM) {
      const fp = forceM[1].split(",").map(Number);
      if (fp.length === 3 && !isNaN(fp[0])) {
        // Convert MS internal kcal/mol/A if large or keep eV/A
        const scaleF = Math.hypot(fp[0], fp[1], fp[2]) > 25 ? (1 / 23.0605) : 1.0;
        fx = fp[0] * scaleF; fy = fp[1] * scaleF; fz = fp[2] * scaleF;
      }
    }
    atoms.push({
      element: el,
      label: nameM ? nameM[1] : `${el}${elCount[el]}`,
      x: coords[0],
      y: coords[1],
      z: coords[2],
      fixed: /Restricted/i.test(attr),
      fx, fy, fz,
      charge: null
    });
  }
  const formula = castepComputeFormula(atoms);
  return {
    name: fallbackName,
    formula: formula !== "Unknown" ? formula : fallbackName,
    spaceGroup,
    crystalSystem: castepInferCrystalSystem(lattice),
    lattice,
    vectors,
    atoms,
    kpointsBlock: "",
    speciesPotBlock: ""
  };
}

function parseCastepOutputLog(castepText) {
  const txt = (castepText || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const info = {
    host: "Local Machine",
    startedAt: "",
    mpiCores: 1,
    task: "single point energy",
    functional: "PBE",
    dispersion: "Off",
    cutoffEv: 700,
    numElectrons: null,
    numBands: null,
    kpointGrid: "",
    spaceGroup: "",
    totalEnergyEv: null,
    freeEnergyEv: null,
    dispersionEnergyEv: null,
    fermiEnergyEv: null,
    totalTimeSec: null,
    completed: false,
    vectors: null,
    lattice: null,
    atoms: [],
    scfCycles: [],
    geomSteps: [],
    forces: [],
    hirshfeldCharges: []
  };
  if (!txt) return info;

  const hostM = txt.match(/Job started on host\s+([^\n\r]+)/i);
  if (hostM) info.host = hostM[1].trim();
  const mpiM = txt.match(/This calculation will use\s+(\d+)\s+CPU cores/i) || txt.match(/MPI processes:\s+(\d+)/i);
  if (mpiM) info.mpiCores = parseInt(mpiM[1], 10);
  const taskM = txt.match(/type of calculation\s*:\s*([^\n\r]+)/i);
  if (taskM) info.task = taskM[1].trim();
  const xcM = txt.match(/using functional\s*:\s*([^\n\r]+)/i);
  if (xcM) info.functional = xcM[1].trim();
  const sedcM = txt.match(/SEDC with\s*:\s*([^\n\r]+)/i);
  if (sedcM) info.dispersion = sedcM[1].trim();
  const cutM = txt.match(/plane wave basis set cut-off\s*:\s*([\d.]+)/i);
  if (cutM) info.cutoffEv = parseFloat(cutM[1]);
  const elM = txt.match(/number of\s+electrons\s*:\s*([\d.]+)/i);
  if (elM) info.numElectrons = parseFloat(elM[1]);
  const nbM = txt.match(/number of bands\s*:\s*(\d+)/i);
  if (nbM) info.numBands = parseInt(nbM[1], 10);
  const mpM = txt.match(/MP grid size for SCF calculation is\s+(\d+\s+\d+\s+\d+)/i);
  if (mpM) info.kpointGrid = mpM[1].trim().replace(/\s+/g, "×");
  const sgM = txt.match(/Full crystallographic space group\s*=\s*([^\n\r]+)/i);
  if (sgM) info.spaceGroup = sgM[1].replace(/"/g, "").trim();

  // Unit Cell Real Lattice (take last occurrence)
  const cellRegex = /Real Lattice\(A\)\s+Reciprocal Lattice\(1\/A\)\s*\n\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)[^\n]*\n\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)[^\n]*\n\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)/gi;
  let cm;
  while ((cm = cellRegex.exec(txt)) !== null) {
    info.vectors = [
      [parseFloat(cm[1]), parseFloat(cm[2]), parseFloat(cm[3])],
      [parseFloat(cm[4]), parseFloat(cm[5]), parseFloat(cm[6])],
      [parseFloat(cm[7]), parseFloat(cm[8]), parseFloat(cm[9])]
    ];
    info.lattice = castepVectorsToParams(info.vectors);
  }

  // Fractional coordinates table (take last occurrence for final optimized geometry)
  const coordBlockRegex = /Fractional coordinates of atoms\s+x\n\s*x\s+Number\s+u\s+v\s+w\s+x\n\s*x-+\s*x\n([\s\S]*?)x{20,}/gi;
  let cbm;
  while ((cbm = coordBlockRegex.exec(txt)) !== null) {
    const parsedAtoms = [];
    const lines = cbm[1].split("\n");
    lines.forEach(l => {
      const m = l.match(/x\s+([A-Za-z]{1,2})\s+(\d+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)/);
      if (m) {
        const el = castepCleanElement(m[1]);
        const num = m[2];
        parsedAtoms.push({
          element: el,
          label: `${el}${num}`,
          elIndex: parseInt(num, 10),
          x: parseFloat(m[3]),
          y: parseFloat(m[4]),
          z: parseFloat(m[5]),
          fixed: false,
          fx: 0, fy: 0, fz: 0,
          charge: null
        });
      }
    });
    if (parsedAtoms.length > 0) info.atoms = parsedAtoms;
  }

  // SCF Cycles
  const scfLineRegex = /^\s*(Initial|\d+)\s+([-\d.E+]+)\s+([-\d.E+]+)\s+(?:([-\d.E+]+)\s+)?([\d.]+)\s+<--\s*SCF/gmi;
  let sm;
  while ((sm = scfLineRegex.exec(txt)) !== null) {
    const stepStr = sm[1];
    const eTot = parseFloat(sm[2]);
    const eFermi = parseFloat(sm[3]);
    const dE = sm[4] ? parseFloat(sm[4]) : null;
    const tSec = parseFloat(sm[5]);
    info.scfCycles.push({
      step: stepStr === "Initial" ? 0 : parseInt(stepStr, 10),
      label: stepStr,
      energy: eTot,
      fermi: eFermi,
      dEPerAtom: dE,
      timeSec: tSec
    });
    info.fermiEnergyEv = eFermi;
    info.totalEnergyEv = eTot;
  }

  // Final energies
  const finEM = txt.match(/Final energy,\s*E\s*=\s*([-\d.E+]+)\s*eV/gi);
  if (finEM) {
    const lastM = finEM[finEM.length - 1].match(/([-\d.E+]+)\s*eV/i);
    if (lastM) info.totalEnergyEv = parseFloat(lastM[1]);
  }
  const dispEM = txt.match(/Dispersion corrected final energy\*\s*,\s*Ecor\s*=\s*([-\d.E+]+)\s*eV/gi);
  if (dispEM) {
    const lastM = dispEM[dispEM.length - 1].match(/([-\d.E+]+)\s*eV/i);
    if (lastM) info.dispersionEnergyEv = parseFloat(lastM[1]);
  }

  // Geometry optimization iterations (LBFGS / BFGS / TPSD)
  const geomIterRegex = /(LBFGS|BFGS|TPSD):\s*finished iteration\s+(\d+)\s+with enthalpy=\s*([-\d.E+]+)\s*eV/gi;
  let gm;
  while ((gm = geomIterRegex.exec(txt)) !== null) {
    info.geomSteps.push({
      method: gm[1],
      step: parseInt(gm[2], 10),
      enthalpy: parseFloat(gm[3])
    });
  }

  // Symmetrised Forces (last table)
  const forceBlockRegex = /\*+\s*Symmetrised Forces\s*\*+[\s\S]*?\*+\n([\s\S]*?)\s*\*+/gi;
  const forceBlocks = txt.split(/\*+\s*Symmetrised Forces\s*\*+/i);
  if (forceBlocks.length > 1) {
    const lastForceSec = forceBlocks[forceBlocks.length - 1].split(/\*{15,}/)[0] || "";
    const fLines = lastForceSec.split("\n");
    const forces = [];
    fLines.forEach(l => {
      const fm = l.match(/\*\s+([A-Za-z]{1,2})\s+(\d+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)/);
      if (fm) {
        const fx = parseFloat(fm[3]), fy = parseFloat(fm[4]), fz = parseFloat(fm[5]);
        forces.push({
          element: castepCleanElement(fm[1]),
          elIndex: parseInt(fm[2], 10),
          label: `${castepCleanElement(fm[1])}${fm[2]}`,
          fx, fy, fz,
          fmag: Math.hypot(fx, fy, fz)
        });
      }
    });
    if (forces.length > 0) info.forces = forces;
  }

  // Hirshfeld Analysis
  const hirshSplit = txt.split(/Hirshfeld Analysis/i);
  if (hirshSplit.length > 1) {
    const hSec = hirshSplit[hirshSplit.length - 1].split(/={15,}/)[1] || "";
    const hLines = hSec.split("\n");
    const hList = [];
    hLines.forEach(l => {
      const hm = l.match(/^\s*([A-Za-z]{1,2})\s+(\d+)\s+([-\d.]+)(?:\s+([-\d.]+))?/);
      if (hm) {
        hList.push({
          element: castepCleanElement(hm[1]),
          elIndex: parseInt(hm[2], 10),
          label: `${castepCleanElement(hm[1])}${hm[2]}`,
          charge: parseFloat(hm[3]),
          spin: hm[4] !== undefined ? parseFloat(hm[4]) : 0.0
        });
      }
    });
    if (hList.length > 0) info.hirshfeldCharges = hList;
  }

  // Attach forces and charges to info.atoms
  if (info.atoms.length > 0) {
    info.atoms.forEach(at => {
      const fMatch = info.forces.find(f => f.element === at.element && f.elIndex === at.elIndex);
      if (fMatch) {
        at.fx = fMatch.fx; at.fy = fMatch.fy; at.fz = fMatch.fz;
      }
      const cMatch = info.hirshfeldCharges.find(c => c.element === at.element && c.elIndex === at.elIndex);
      if (cMatch) {
        at.charge = cMatch.charge;
        at.spin = cMatch.spin;
      }
    });
  }

  const timeM = txt.match(/Total time\s*=\s*([\d.]+)\s*s/i);
  if (timeM) {
    info.totalTimeSec = parseFloat(timeM[1]);
    info.completed = true;
  }
  return info;
}

function parseCastepGeomTrajectory(geomText) {
  const txt = (geomText || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (!txt.trim()) return [];
  const BOHR_TO_ANG = 0.529177210903;
  const HA_TO_EV = 27.211386245988;
  const FORCE_CONV = HA_TO_EV / BOHR_TO_ANG; // ~51.422067 eV/A per Ha/Bohr

  const lines = txt.split("\n");
  const frames = [];
  let cur = null;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (raw.includes("<-- c")) {
      if (cur && cur.hRows.length === 3 && cur.rRows.length > 0) {
        frames.push( finalizeGeomFrame(cur, BOHR_TO_ANG, HA_TO_EV, FORCE_CONV) );
      }
      const p = raw.trim().split(/\s+/);
      cur = { step: parseInt(p[0], 10) || frames.length, energyHa: 0, enthalpyHa: 0, hRows: [], rRows: [], fRows: [] };
    } else if (cur && raw.includes("<-- E")) {
      const p = raw.trim().split(/\s+/);
      cur.energyHa = parseFloat(p[0]) || 0;
      cur.enthalpyHa = parseFloat(p[1]) || cur.energyHa;
    } else if (cur && raw.includes("<-- h")) {
      const p = raw.trim().split(/\s+/);
      cur.hRows.push([parseFloat(p[0]), parseFloat(p[1]), parseFloat(p[2])]);
    } else if (cur && raw.includes("<-- R")) {
      const p = raw.trim().split(/\s+/);
      cur.rRows.push({
        element: castepCleanElement(p[0]),
        elIndex: parseInt(p[1], 10),
        xBohr: parseFloat(p[2]),
        yBohr: parseFloat(p[3]),
        zBohr: parseFloat(p[4])
      });
    } else if (cur && raw.includes("<-- F")) {
      const p = raw.trim().split(/\s+/);
      cur.fRows.push({
        element: castepCleanElement(p[0]),
        elIndex: parseInt(p[1], 10),
        fxHa: parseFloat(p[2]),
        fyHa: parseFloat(p[3]),
        fzHa: parseFloat(p[4])
      });
    }
  }
  if (cur && cur.hRows.length === 3 && cur.rRows.length > 0) {
    frames.push( finalizeGeomFrame(cur, BOHR_TO_ANG, HA_TO_EV, FORCE_CONV) );
  }
  return frames;
}

function finalizeGeomFrame(cur, BOHR_TO_ANG, HA_TO_EV, FORCE_CONV) {
  const vectors = cur.hRows.map(r => [r[0]*BOHR_TO_ANG, r[1]*BOHR_TO_ANG, r[2]*BOHR_TO_ANG]);
  const lattice = castepVectorsToParams(vectors);
  let maxForce = 0;
  const atoms = cur.rRows.map(r => {
    const cx = r.xBohr * BOHR_TO_ANG;
    const cy = r.yBohr * BOHR_TO_ANG;
    const cz = r.zBohr * BOHR_TO_ANG;
    const [u, v, w] = castepCartToFrac(cx, cy, cz, vectors);
    const fMatch = cur.fRows.find(f => f.element === r.element && f.elIndex === r.elIndex);
    const fx = fMatch ? fMatch.fxHa * FORCE_CONV : 0;
    const fy = fMatch ? fMatch.fyHa * FORCE_CONV : 0;
    const fz = fMatch ? fMatch.fzHa * FORCE_CONV : 0;
    const fmag = Math.hypot(fx, fy, fz);
    if (fmag > maxForce) maxForce = fmag;
    return {
      element: r.element,
      label: `${r.element}${r.elIndex}`,
      x: u, y: v, z: w,
      fixed: false,
      fx, fy, fz,
      charge: null
    };
  });
  return {
    step: cur.step,
    energyEv: cur.energyHa * HA_TO_EV,
    enthalpyEv: cur.enthalpyHa * HA_TO_EV,
    maxForceEvA: maxForce,
    vectors,
    lattice,
    volume: castepCellVolume(vectors),
    atoms
  };
}

function parseCastepXcdXmlClient(xmlText, isBand = false) {
  if (!xmlText) return null;
  const titleM = xmlText.match(/<TITLE[^>]*Text="([^"]*)"/i);
  const title = titleM ? titleM[1].replace(/\\n/g, " ").trim() : "";
  const axXM = xmlText.match(/<AXIS_X[^>]*Title="([^"]*)"/i);
  const axYM = xmlText.match(/<AXIS_Y[^>]*Title="([^"]*)"/i);
  const ticks = [];
  const tickRegex = /<TICK_LABEL\s+Position="([^"]+)"\s+Text="([^"]+)"/gi;
  let tm;
  while ((tm = tickRegex.exec(xmlText)) !== null) {
    ticks.push({ pos: parseFloat(tm[1]), label: tm[2] });
  }
  const series = [];
  const serRegex = /<SERIES_2D\s+UniqueID="(\d+)"\s+Name="([^"]*)"\s+NumPoints="(\d+)"[^>]*>([\s\S]*?)<\/SERIES_2D>/gi;
  let sm;
  while ((sm = serRegex.exec(xmlText)) !== null) {
    const sname = sm[2].trim() || `Series ${sm[1]}`;
    const body = sm[4];
    const segments = [];
    let curSeg = [];
    const ptRegex = /<POINT_2D\s+XY="([^,]+),([^"]+)"/gi;
    let pm;
    while ((pm = ptRegex.exec(body)) !== null) {
      const x = parseFloat(pm[1]);
      const y = parseFloat(pm[2]);
      if (Math.abs(y) > 1e100) {
        if (curSeg.length) { segments.push(curSeg); curSeg = []; }
      } else if (!isNaN(x) && !isNaN(y)) {
        curSeg.push([x, y]);
      }
    }
    if (curSeg.length) segments.push(curSeg);
    series.push({ name: sname, segments });
  }
  return {
    title,
    xLabel: axXM ? axXM[1] : "",
    yLabel: axYM ? axYM[1] : "",
    ticks,
    series
  };
}

function parseCastepBandsTextClient(bandsText) {
  if (!bandsText) return null;
  const HA_EV = 27.211386245988;
  const lines = bandsText.replace(/\r\n/g, "\n").split("\n");
  let nk = 0, ns = 1, neig = 0, efHa = 0.0, nelec = 0.0;
  let efHaSpins = [], nelecSpins = [];
  let vecsBohr = [];
  let i = 0;
  while (i < lines.length) {
    const l = lines[i].trim();
    if (l.startsWith("Number of k-points")) nk = parseInt(l.split(/\s+/).pop(), 10);
    else if (l.startsWith("Number of spin components")) ns = parseInt(l.split(/\s+/).pop(), 10);
    else if (l.startsWith("Number of electrons")) {
      const nums = l.split(/\s+/).slice(3).map(Number).filter(v => !isNaN(v));
      if (nums.length) {
        nelecSpins = nums;
        nelec = nums.length > 1 ? nums.reduce((a, b) => a + b, 0) : nums[0];
      }
    } else if (l.startsWith("Number of eigenvalues")) neig = parseInt(l.split(/\s+/)[3], 10);
    else if (l.startsWith("Fermi energ")) {
      const nums = l.split(/\s+/).map(Number).filter(v => !isNaN(v));
      if (nums.length) {
        efHaSpins = nums;
        efHa = nums.reduce((a, b) => a + b, 0) / nums.length;
      }
    } else if (l.startsWith("Unit cell vectors")) {
      for (let k = 1; k <= 3; k++) {
        if (i + k < lines.length) {
          const vp = lines[i + k].trim().split(/\s+/).map(Number).filter(v => !isNaN(v));
          if (vp.length >= 3) vecsBohr.push([vp[0], vp[1], vp[2]]);
        }
      }
      i += 4;
      break;
    }
    i++;
  }
  const kpts = new Array(Math.max(1, nk)).fill(null);
  while (i < lines.length) {
    const l = lines[i].trim();
    if (l.startsWith("K-point")) {
      const p = l.split(/\s+/);
      const kidx = parseInt(p[1], 10) - 1;
      const kx = parseFloat(p[2]), ky = parseFloat(p[3]), kz = parseFloat(p[4]), wt = parseFloat(p[5]);
      i++;
      const spins = [];
      for (let s = 0; s < ns; s++) {
        if (i < lines.length && lines[i].trim().startsWith("Spin component")) i++;
        const evs = [];
        for (let b = 0; b < neig; b++) {
          if (i < lines.length) {
            const valHa = parseFloat(lines[i].trim());
            evs.push(Math.round((valHa - efHa) * HA_EV * 10000) / 10000);
            i++;
          }
        }
        spins.push(evs);
      }
      if (kidx >= 0 && kidx < kpts.length) {
        kpts[kidx] = { k: [kx, ky, kz], w: wt, e: spins };
      }
    } else {
      i++;
    }
  }
  const validKpts = kpts.filter(Boolean);
  if (!validKpts.length) return null;
  let volBohr3 = 0;
  if (vecsBohr.length === 3) {
    const [a, b, c] = vecsBohr;
    volBohr3 = Math.abs(
      a[0] * (b[1] * c[2] - b[2] * c[1]) -
      a[1] * (b[0] * c[2] - b[2] * c[0]) +
      a[2] * (b[0] * c[1] - b[1] * c[0])
    );
  }
  return {
    nk: validKpts.length,
    ns,
    neig,
    nelec,
    nelec_spins: nelecSpins,
    ef_ha: efHa,
    ef_ev: efHa * HA_EV,
    ef_ev_spins: efHaSpins.map(x => x * HA_EV),
    vecs_bohr: vecsBohr,
    vol_bohr3: volBohr3,
    kpoints: validKpts
  };
}

// ============================================================================
// 3. Studio Initialization, Local Machine Scanning & Folder Mounting
// ============================================================================

function initCastepStudioTab() {
  if (!CASTEP_STUDIO_STATE.initialized) {
    CASTEP_STUDIO_STATE.initialized = true;
    initCastep3DCanvasEvents();
    initCastepElectronicCanvasHover();
    initCastepOpticsCanvasHover();
    initCastepChdiffCanvasEvents();
    initCastep2DPlotsWheelZoom();

    // Debounced resize observer for crisp zero-overflow 2D/3D canvases
    if (!window._castepResizeBound) {
      window._castepResizeBound = true;
      let resizeRaf = 0;
      window.addEventListener("resize", () => {
        if (resizeRaf) cancelAnimationFrame(resizeRaf);
        resizeRaf = requestAnimationFrame(() => {
          const pane = CASTEP_STUDIO_STATE.activeStagePane;
          if (pane === "builder") renderCastep3DScene();
          else if (pane === "electronic") renderCastepElectronicPlots();
          else if (pane === "optics") renderCastepOpticalPlots();
          else if (pane === "chdiff") renderCastepChdiffPlots();
          else if (pane === "mulliken") renderCastepMullikenPane();
          else if (pane === "convergence") renderCastepConvergencePlots();
        });
      });
    }

    // Restore saved Ball radius & Stick width scales for consistent publication figures
    try {
      const savedAtom = parseFloat(localStorage.getItem("castep_3d_atom_scale"));
      if (isFinite(savedAtom) && savedAtom >= 0.2 && savedAtom <= 2.0) {
        CASTEP_STUDIO_STATE.view3D.atomScale = Math.round(savedAtom * 100) / 100;
      }
      const savedBond = parseFloat(localStorage.getItem("castep_3d_bond_scale"));
      if (isFinite(savedBond) && savedBond >= 0.2 && savedBond <= 2.0) {
        CASTEP_STUDIO_STATE.view3D.bondWidthScale = Math.round(savedBond * 100) / 100;
      }
    } catch (e) {}
    syncVestaScaleControls();

    // Initialize Gateway URL from localStorage or default primary calculation server (115.145.191.231:18888)
    try {
      const savedGw = localStorage.getItem("ms_gateway_url");
      const initGw = normalizeMsGatewayUrlClient(savedGw || DEFAULT_MS_GATEWAY_URL);
      CASTEP_STUDIO_STATE.gatewayUrl = initGw;
      syncMsGatewayUrlControls(initGw);
    } catch (e) {
      CASTEP_STUDIO_STATE.gatewayUrl = DEFAULT_MS_GATEWAY_URL;
      syncMsGatewayUrlControls(DEFAULT_MS_GATEWAY_URL);
    }

    // Auto-connect to local FastAPI bridge (same-origin on localhost, or quiet local bridge probe on GitHub Pages)
    const isLocalHost = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
    if (isLocalHost) {
      CASTEP_STUDIO_STATE.apiBase = "";
      autoConnectLocalCastepBackend("");
    } else {
      updateCastepConnectionPill(false, "Browser Mode • Click 📂 Mount Local Folder or 📥 Import Files");
      probeLocalBridgeOnRemoteOrigin();
    }
  }
  renderCastepJobsList();
  renderMsGatewayTable();
  updateCastepKpiBar();
  setTimeout(() => {
    renderCastep3DScene();
    if (CASTEP_STUDIO_STATE.activeStagePane === "gateway") renderMsGatewayTable();
    if (CASTEP_STUDIO_STATE.activeStagePane === "electronic") renderCastepElectronicPlots();
    if (CASTEP_STUDIO_STATE.activeStagePane === "optics") renderCastepOpticalPlots();
    if (CASTEP_STUDIO_STATE.activeStagePane === "chdiff") renderCastepChdiffPlots();
    if (CASTEP_STUDIO_STATE.activeStagePane === "mulliken") renderCastepMullikenPane();
    if (CASTEP_STUDIO_STATE.activeStagePane === "convergence") renderCastepConvergencePlots();
  }, 60);
}
window.initCastepStudioTab = initCastepStudioTab;

function getCastepApiBase() {
  if (["localhost", "127.0.0.1", "::1"].includes(window.location.hostname)) return "";
  return CASTEP_STUDIO_STATE.apiBase || "";
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 2500) {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: ctrl.signal });
  } finally {
    clearTimeout(tid);
  }
}

async function probeLocalBridgeOnRemoteOrigin() {
  // Quietly test if the user is running the local FastAPI workstation bridge on http://127.0.0.1:8877
  const bridgeBase = "http://127.0.0.1:8877";
  try {
    const gwUrl = normalizeMsGatewayUrlClient(document.getElementById("ms-gw-url-input")?.value || CASTEP_STUDIO_STATE.gatewayUrl || DEFAULT_MS_GATEWAY_URL);
    const gwResp = await fetchWithTimeout(
      `${bridgeBase}/api/castep/gateway?gateway_url=${encodeURIComponent(gwUrl)}&include_archived=false&limit=500`,
      {},
      5000
    );
    if (gwResp.ok) {
      CASTEP_STUDIO_STATE.apiBase = bridgeBase;
      const gwData = await gwResp.json();
      applyGatewayApiPayload(gwData);
      // Also auto-connect local CASTEP folder scan via the local bridge
      autoConnectLocalCastepBackend(bridgeBase, true);
    }
  } catch (e) {
    // Another PC without the local bridge -> stay cleanly in Browser Mode (0 jobs, Not Connected)
  }
}

function updateCastepConnectionPill(connected, labelText) {
  const pill = document.getElementById("castep-machine-status-pill");
  if (!pill) return;
  if (connected) {
    pill.style.background = "#ecfdf5";
    pill.style.color = "#047857";
    pill.style.borderColor = "#a7f3d0";
    pill.innerHTML = `<span class="castep-pulse-dot" style="background:#10b981;"></span> ${escapeHtml(labelText)}`;
  } else {
    pill.style.background = "#f1f5f9";
    pill.style.color = "#334155";
    pill.style.borderColor = "#cbd5e1";
    pill.innerHTML = `<span class="castep-pulse-dot" style="background:#64748b; animation:none;"></span> ${escapeHtml(labelText)}`;
  }
}

async function autoConnectLocalCastepBackend(baseOverride = null, skipGateway = false) {
  const apiBase = baseOverride !== null ? baseOverride : getCastepApiBase();

  // 1) Fire Materials Studio Remote Gateway probe IMMEDIATELY in parallel (never wait behind slow disk scans!)
  const gwPromise = (!skipGateway)
    ? (async () => {
        try {
          const gwUrl = normalizeMsGatewayUrlClient(document.getElementById("ms-gw-url-input")?.value || CASTEP_STUDIO_STATE.gatewayUrl || DEFAULT_MS_GATEWAY_URL);
          const gwResp = await fetchWithTimeout(
            `${apiBase}/api/castep/gateway?gateway_url=${encodeURIComponent(gwUrl)}&include_archived=false&limit=500`,
            {},
            8000
          );
          if (gwResp.ok) {
            const gwData = await gwResp.json();
            applyGatewayApiPayload(gwData);
          }
        } catch (e) {}
      })()
    : Promise.resolve();

  // 2) Simultaneously scan local calculation directories in the background
  const scanPromise = (async () => {
    try {
      const resp = await fetch(`${apiBase}/api/castep/scan?limit=80`);
      if (resp.ok) {
        const data = await resp.json();
        CASTEP_STUDIO_STATE.localBackendConnected = true;
        CASTEP_STUDIO_STATE.localProcesses = data.processes || [];
        if (Array.isArray(data.roots) && data.roots.length > 0) {
          const inp = document.getElementById("castep-root-path-input");
          if (inp && !inp.value) inp.value = data.roots[0];
        }
        if (Array.isArray(data.jobs) && data.jobs.length > 0) {
          const scanned = data.jobs.map(j => enrichCastepJobSummary(j));
          const existing = CASTEP_STUDIO_STATE.jobs || [];
          if (existing.length > 0 && CASTEP_STUDIO_STATE.activeJobId) {
            // Preserve already-uploaded/active user structure (e.g. imported .cif) while merging scanned jobs
            const existKeys = new Set(existing.map(j => j.id));
            CASTEP_STUDIO_STATE.jobs = [...existing, ...scanned.filter(j => !existKeys.has(j.id))];
            renderCastepJobsList();
            updateCastepKpiBar();
          } else {
            CASTEP_STUDIO_STATE.jobs = scanned;
            renderCastepJobsList();
            updateCastepKpiBar();
            await loadCastepJobIntoStudio(CASTEP_STUDIO_STATE.jobs[0].id);
          }
        }
        const procLabel = CASTEP_STUDIO_STATE.localProcesses.length
          ? `${CASTEP_STUDIO_STATE.localProcesses[0].name} Active (${CASTEP_STUDIO_STATE.localProcesses.length} proc)`
          : "Local Backend Connected";
        updateCastepConnectionPill(true, `${procLabel} • ${CASTEP_STUDIO_STATE.jobs.length} Local Jobs`);
      }
    } catch (e) {
      CASTEP_STUDIO_STATE.localBackendConnected = false;
      updateCastepConnectionPill(false, "Browser Mode • Click 📂 Mount Local Folder or 📥 Import Files");
    }
  })();

  await Promise.allSettled([gwPromise, scanPromise]);
}

function enrichCastepJobSummary(job) {
  const parsedLog = parseCastepOutputLog(job.castep_text || "");
  const files = job.files_list || [];
  let status = job.status_override || job.status || "";
  if (!status) {
    if (parsedLog.completed || (job.castep_text && job.castep_text.includes("Total time"))) {
      status = "Completed";
    } else if (job.status_text) {
      status = "Active / Running";
    } else {
      status = "Input Ready";
    }
  }

  const hasOptics = !!(
    job.has_optics ||
    job.optical_tensor ||
    job.ome_bin_file ||
    job.optical_xcd ||
    (Array.isArray(job.optical_xcds) && job.optical_xcds.length > 0) ||
    job.optics_bands ||
    files.some(f => (/optic|dielec|absorp/i.test(f) && f.toLowerCase().endsWith(".xcd")) || /\.(ome_bin|cst_ome)$/i.test(f) || f.toLowerCase().endsWith("_optics.bands"))
  );
  const hasBandDos = !!(
    job.has_band_dos ||
    job.band_xcd || job.dos_xcd || job.pdos_xcd || job.bandstr_bands || job.dos_bands ||
    files.some(f => f.toLowerCase().endsWith("_bandstr.bands") || f.toLowerCase().endsWith("_dos.bands") || (/(band structure|density of states|dos|pdos)/i.test(f) && f.toLowerCase().endsWith(".xcd")))
  );
  const hasChdiff = !!(
    job.has_chdiff || job.has_charg_frm || job.chdiff_data ||
    (Array.isArray(job.charg_frm_files) && job.charg_frm_files.length > 0) ||
    files.some(f => /\.(chdiff|charg_frm|den_fmt|cube)$/i.test(f))
  );

  let taskType = parsedLog.task || "Single Point Energy";
  if (hasOptics) {
    taskType = "Optical Properties";
  } else if (hasBandDos) {
    taskType = "Band Structure & DOS";
  } else if (job.geom_text || /geomopt/i.test(job.folder || "") || /geometry/i.test(taskType)) {
    taskType = "Geometry Optimization";
  } else if (hasChdiff && !job.castep_text) {
    taskType = "Charge Density / Volumetric";
  } else if (/elf/i.test(job.title || "") || /elf/i.test(job.seed || "")) {
    taskType = "ELF & Orbitals Energy";
  }

  let bandGapEv = null;
  if (job.band_xcd && job.band_xcd.title) {
    const bgM = job.band_xcd.title.match(/Band gap is\s+([\d.]+)\s*eV/i);
    if (bgM) bandGapEv = parseFloat(bgM[1]);
  }
  if (bandGapEv === null && job.bandstr_bands) {
    const bgInfo = computeBandGapFromBandsObj(job.bandstr_bands);
    if (bgInfo) bandGapEv = bgInfo.gapEv;
  }

  let statusEnergy = parsedLog.dispersionEnergyEv || parsedLog.totalEnergyEv;
  let statusIter = parsedLog.scfCycles.length;
  let statusConv = null;
  if (job.status_text) {
    const em = job.status_text.match(/Energy\s*:\s*([-\d.E+]+)/i);
    if (em && statusEnergy === null) statusEnergy = parseFloat(em[1]);
    const im = job.status_text.match(/Number of iterations\s*:\s*(\d+)/i);
    if (im && !statusIter) statusIter = parseInt(im[1], 10);
    const cm = job.status_text.match(/Convergence\s*:\s*([-\d.E+]+)/i);
    if (cm) statusConv = parseFloat(cm[1]);
  }

  return {
    ...job,
    status,
    taskType,
    has_optics: hasOptics,
    has_band_dos: hasBandDos,
    has_chdiff: hasChdiff,
    functional: parsedLog.functional || "PBE",
    cutoffEv: parsedLog.cutoffEv || null,
    totalEnergyEv: statusEnergy,
    bandGapEv,
    iterations: statusIter,
    convergenceEvAtom: statusConv,
    spaceGroup: parsedLog.spaceGroup || job.spaceGroup || "P 1",
    mpiCores: parsedLog.mpiCores || null
  };
}

function updateCastepKpiBar() {
  const jobs = CASTEP_STUDIO_STATE.jobs || [];
  const runningJobs = jobs.filter(j => /running|active/i.test(j.status));
  const completedJobs = jobs.filter(j => !/running|active/i.test(j.status));

  const elRun = document.getElementById("castep-kpi-running");
  const elRunSub = document.getElementById("castep-kpi-running-sub");
  if (elRun) elRun.textContent = `${runningJobs.length} Active`;
  if (elRunSub) {
    if (runningJobs.length > 0) {
      const rj = runningJobs[0];
      elRunSub.textContent = `${rj.seed} • ${rj.mpiCores ? rj.mpiCores + " MPI Cores" : "Running"}`;
    } else if (CASTEP_STUDIO_STATE.mountedDirName) {
      elRunSub.textContent = `Mounted Folder: ${CASTEP_STUDIO_STATE.mountedDirName}`;
    } else if (CASTEP_STUDIO_STATE.localBackendConnected) {
      elRunSub.textContent = "Local Machine Server Connected";
    } else {
      elRunSub.textContent = "Mount a local folder or import files";
    }
  }

  const elComp = document.getElementById("castep-kpi-completed");
  const elCompSub = document.getElementById("castep-kpi-completed-sub");
  if (elComp) elComp.textContent = `${completedJobs.length} Jobs`;
  if (elCompSub) {
    if (jobs.length === 0) {
      elCompSub.textContent = "No calculations loaded yet";
    } else {
      const nBand = jobs.filter(j => j.has_band_dos).length;
      const nOpt = jobs.filter(j => j.has_optics).length;
      const nChd = jobs.filter(j => j.has_chdiff).length;
      elCompSub.textContent = `${nBand} Band/DOS • ${nOpt} Optics • ${nChd} Δρ • ${jobs.length} Total`;
    }
  }

  const st = CASTEP_STUDIO_STATE.structure;
  const elForm = document.getElementById("castep-kpi-formula");
  const elLat = document.getElementById("castep-kpi-lattice");
  if (!st || !st.atoms || st.atoms.length === 0) {
    if (elForm) elForm.textContent = "—";
    if (elLat) elLat.textContent = "Mount folder or import .cell / .cif / .xsd";
  } else {
    if (elForm) elForm.textContent = `${st.formula || st.name} (${st.atoms.length} atoms)`;
    if (elLat && st.lattice) {
      elLat.textContent = `a=${Number(st.lattice.a).toFixed(3)} Å, b=${Number(st.lattice.b).toFixed(3)} Å, c=${Number(st.lattice.c).toFixed(3)} Å • ${st.spaceGroup || "P 1"}`;
    }
  }

  const pl = CASTEP_STUDIO_STATE.parsedLog || {};
  const activeJob = jobs.find(j => j.id === CASTEP_STUDIO_STATE.activeJobId);
  const eVal = pl.dispersionEnergyEv || pl.totalEnergyEv || (activeJob && activeJob.totalEnergyEv);
  const bgVal = (activeJob && activeJob.bandGapEv !== null && activeJob.bandGapEv !== undefined) ? activeJob.bandGapEv : pl.bandGapEv;

  const elEn = document.getElementById("castep-kpi-energy");
  const elBg = document.getElementById("castep-kpi-bandgap");
  if (!activeJob && (!st || !st.atoms || !st.atoms.length)) {
    if (elEn) elEn.textContent = "—";
    if (elBg) elBg.textContent = "Load .castep / .bands / .xcd results";
  } else {
    if (elEn) {
      elEn.textContent = (eVal !== null && eVal !== undefined && !isNaN(eVal)) ? `${Number(eVal).toFixed(4)} eV` : "Structure Loaded";
    }
    if (elBg) {
      const bgStr = (bgVal !== null && bgVal !== undefined && !isNaN(bgVal)) ? `Eg = ${Number(bgVal).toFixed(3)} eV` : (activeJob?.has_optics ? "Optical Data Ready" : "SCF / Geometry");
      const ePerAtom = (eVal && st?.atoms?.length) ? `${(eVal / st.atoms.length).toFixed(3)} eV/atom` : `${pl.cutoffEv || activeJob?.cutoffEv || "—"} eV ${pl.functional || activeJob?.functional || "DFT"}`;
      elBg.textContent = `${bgStr} • ${ePerAtom}`;
    }
  }
}

function filterCastepJobs(filterKey, btnEl) {
  CASTEP_STUDIO_STATE.jobFilter = filterKey || "all";
  document.querySelectorAll(".castep-filter-pills .castep-pill").forEach(b => b.classList.remove("active"));
  if (btnEl) btnEl.classList.add("active");
  renderCastepJobsList();
}
window.filterCastepJobs = filterCastepJobs;

function clearLoadedCastepJobs() {
  CASTEP_STUDIO_STATE.jobs = [];
  CASTEP_STUDIO_STATE.activeJobId = null;
  CASTEP_STUDIO_STATE.selectedJobIds.clear();
  CASTEP_STUDIO_STATE.mountedDirHandle = null;
  CASTEP_STUDIO_STATE.mountedDirName = "";
  CASTEP_STUDIO_STATE.structure = {
    name: "", formula: "", spaceGroup: "P 1", crystalSystem: "",
    lattice: { a: 5, b: 5, c: 15, alpha: 90, beta: 90, gamma: 90 },
    vectors: [[5,0,0],[0,5,0],[0,0,15]],
    atoms: [], kpointsBlock: "", speciesPotBlock: ""
  };
  CASTEP_STUDIO_STATE.chdiffState.activeGrid = null;
  CASTEP_STUDIO_STATE.chdiffState.diffSlots = { ab: null, a: null, b: null };
  CASTEP_STUDIO_STATE.lastOpticalSpectra = null;
  CASTEP_STUDIO_STATE.geomFrames = [];
  CASTEP_STUDIO_STATE.activeGeomFrameIdx = 0;
  updateCastepGeomScrubberUI();
  CASTEP_STUDIO_STATE.view3D.showChdiffIso = false;
  CASTEP_STUDIO_STATE.view3D.showChdiffSlice = false;
  const cIso = document.getElementById("vesta-chk-show-chdiff");
  const cSlc = document.getElementById("vesta-chk-show-chdiff-slice");
  if (cIso) cIso.checked = false;
  if (cSlc) cSlc.checked = false;
  const rInp = document.getElementById("castep-root-path-input");
  if (rInp) rInp.value = "";
  const logPre = document.getElementById("vesta-log-output-pre");
  if (logPre) logPre.textContent = "Workspace cleared. Click 📂 Mount Local Folder or 📥 Import Files to load calculations.";
  CASTEP_STUDIO_STATE.view3D._topoCacheKey = "";
  CASTEP_STUDIO_STATE.view3D._legendCacheKey = "";
  renderCastepJobsList();
  updateCastepKpiBar();
  renderCastep3DScene();
  renderCastepElectronicPlots();
  renderCastepOpticalPlots();
  renderCastepChdiffPlots();
  renderCastepConvergencePlots();
  if (typeof showToast === "function") showToast("Cleared loaded workspace jobs.", "info");
}
window.clearLoadedCastepJobs = clearLoadedCastepJobs;

function getFilteredCastepJobs() {
  const q = (document.getElementById("castep-job-search")?.value || "").trim().toLowerCase();
  const f = CASTEP_STUDIO_STATE.jobFilter || "all";
  return (CASTEP_STUDIO_STATE.jobs || []).filter(j => {
    if (f === "running" && !/running|active/i.test(j.status)) return false;
    if (f === "geom" && !/geom/i.test(j.taskType) && !j.geom_text) return false;
    if (f === "banddos" && !j.has_band_dos && !j.band_xcd && !j.bandstr_bands && !j.dos_xcd && !j.pdos_xcd) return false;
    if (f === "optics" && !j.has_optics && !j.optical_tensor && !j.ome_bin_file && !j.optical_xcd && !(j.optical_xcds && j.optical_xcds.length)) return false;
    if (f === "chdiff" && !j.has_chdiff && !j.chdiff_data && !(j.charg_frm_files && j.charg_frm_files.length)) return false;
    if (q) {
      const hay = `${j.title} ${j.material} ${j.project} ${j.folder} ${j.seed} ${(j.files_list || []).join(" ")}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function renderCastepJobsList() {
  const container = document.getElementById("castep-jobs-list");
  if (!container) return;
  const list = getFilteredCastepJobs();
  const totalBadge = document.getElementById("castep-jobs-total-badge");
  if (totalBadge) totalBadge.textContent = `${list.length} jobs`;

  const checkedCountEl = document.getElementById("castep-checked-count");
  if (checkedCountEl) checkedCountEl.textContent = String(CASTEP_STUDIO_STATE.selectedJobIds.size);

  if (list.length === 0) {
    const totalAll = (CASTEP_STUDIO_STATE.jobs || []).length;
    if (totalAll === 0) {
      container.innerHTML = `
        <div style="padding:20px 14px; text-align:center; color:#475569; font-size:12px; line-height:1.55;">
          <div style="font-size:26px; margin-bottom:6px;">📂</div>
          <div style="font-weight:800; color:#0f172a; margin-bottom:4px;">No Local Calculations Loaded</div>
          <div style="margin-bottom:10px;">
            Open any Materials Studio / CASTEP calculation folder directly in your browser (works on any computer without a server) or import individual files.
          </div>
          <div style="display:flex; flex-direction:column; gap:6px;">
            <button type="button" class="btn btn-primary btn-sm" style="width:100%;" onclick="mountCastepLocalDirectory()">📂 Mount Local Folder</button>
            <button type="button" class="btn btn-outline btn-sm" style="width:100%;" onclick="document.getElementById('castep-file-upload-input').click()">📥 Import CASTEP / CIF / Δρ Files</button>
          </div>
        </div>
      `;
    } else {
      container.innerHTML = `<div style="padding:20px 12px; text-align:center; color:#64748b; font-size:12.5px;">No jobs match this filter/search (${totalAll} total loaded).</div>`;
    }
    return;
  }

  container.innerHTML = list.map(j => {
    const isAct = j.id === CASTEP_STUDIO_STATE.activeJobId;
    const isChk = CASTEP_STUDIO_STATE.selectedJobIds.has(j.id);
    const isRunning = /running|active/i.test(j.status);
    const statusBadge = isRunning
      ? `<span class="badge" style="background:#dcfce7; color:#15803d; border:1px solid #86efac; font-size:10.5px;">🟢 Active</span>`
      : (j.status === "Input Ready"
        ? `<span class="badge" style="background:#fef3c7; color:#b45309; border:1px solid #fde68a; font-size:10.5px;">📄 Ready</span>`
        : `<span class="badge" style="background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; font-size:10.5px;">✅ Done</span>`);

    const files = j.files_list || [];
    const keyExts = [];
    if (files.some(f => f.toLowerCase().endsWith(".cell")) || j.cell_text) keyExts.push(".cell");
    if (files.some(f => f.toLowerCase().endsWith(".param")) || j.param_text) keyExts.push(".param");
    if (files.some(f => f.toLowerCase().endsWith(".castep")) || j.castep_text) keyExts.push(".castep");
    if (files.some(f => f.toLowerCase().endsWith(".xsd")) || j.xsd_text) keyExts.push(".xsd");
    if (files.some(f => f.toLowerCase().endsWith(".cif")) || j.cif_text) keyExts.push(".cif");
    if (files.some(f => f.toLowerCase().endsWith(".geom")) || j.geom_text) keyExts.push(".geom");
    if (j.has_band_dos || j.band_xcd || j.bandstr_bands || j.dos_xcd || j.pdos_xcd) keyExts.push("Band/DOS");
    if (j.has_optics || j.optical_tensor || j.ome_bin_file || j.optical_xcd || (j.optical_xcds && j.optical_xcds.length)) keyExts.push("Optics");
    if (j.has_chdiff || j.chdiff_data || files.some(f => /\.(chdiff|charg_frm)$/i.test(f))) keyExts.push("Δρ");

    const eText = (j.totalEnergyEv !== null && j.totalEnergyEv !== undefined && !isNaN(j.totalEnergyEv))
      ? `E = ${Number(j.totalEnergyEv).toFixed(2)} eV`
      : `${files.length} file${files.length === 1 ? "" : "s"}`;
    const bgText = (j.bandGapEv !== null && j.bandGapEv !== undefined && !isNaN(j.bandGapEv))
      ? ` • E<sub>g</sub> = ${Number(j.bandGapEv).toFixed(3)} eV`
      : "";

    return `
      <div class="castep-job-item ${isAct ? "active" : ""}" data-job-id="${j.id}" onclick="loadCastepJobIntoStudio('${j.id}')">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:6px;">
          <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-weight:800; font-size:12.5px; color:#0f172a;" onclick="event.stopPropagation()">
            <input type="checkbox" ${isChk ? "checked" : ""} onchange="toggleSelectCastepJob('${j.id}', this.checked)" />
            <span>${escapeHtml(j.title || j.seed)}</span>
          </label>
          ${statusBadge}
        </div>
        <div style="font-size:11px; color:#1e40af; font-weight:700; margin-top:3px;">
          ${escapeHtml(j.taskType || "CASTEP Calculation")} • ${escapeHtml(j.material || j.seed)}
        </div>
        <div style="font-size:10.5px; color:#64748b; font-family:monospace; margin-top:2px; word-break:break-all;">
          📁 ${escapeHtml(j.folder || "")}
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:5px; font-size:11px; color:#334155; font-weight:600;">
          <span>${eText}${bgText}</span>
          <span style="color:#64748b; font-size:10px;">${escapeHtml(j.updated_at || "")}</span>
        </div>
        <div style="display:flex; gap:3px; flex-wrap:wrap; margin-top:6px;">
          ${keyExts.map(ext => `<span class="castep-file-chip">${ext}</span>`).join("")}
        </div>
      </div>
    `;
  }).join("");
}
window.renderCastepJobsList = renderCastepJobsList;

function toggleSelectCastepJob(jobId, checked) {
  if (checked) CASTEP_STUDIO_STATE.selectedJobIds.add(jobId);
  else CASTEP_STUDIO_STATE.selectedJobIds.delete(jobId);
  const el = document.getElementById("castep-checked-count");
  if (el) el.textContent = String(CASTEP_STUDIO_STATE.selectedJobIds.size);
}
window.toggleSelectCastepJob = toggleSelectCastepJob;

function toggleSelectAllCastepJobs(checked) {
  const visible = getFilteredCastepJobs();
  visible.forEach(j => {
    if (checked) CASTEP_STUDIO_STATE.selectedJobIds.add(j.id);
    else CASTEP_STUDIO_STATE.selectedJobIds.delete(j.id);
  });
  renderCastepJobsList();
}
window.toggleSelectAllCastepJobs = toggleSelectAllCastepJobs;

function highlightActiveCastepJobCard(jobId, isLoading = false) {
  const listEl = document.getElementById("castep-jobs-list");
  if (!listEl) return;
  listEl.querySelectorAll(".castep-job-item.active, .castep-job-item.loading-job").forEach(el => {
    el.classList.remove("active", "loading-job");
  });
  const card = listEl.querySelector(`.castep-job-item[data-job-id="${CSS.escape(String(jobId))}"]`);
  if (card) {
    card.classList.add("active");
    if (isLoading) card.classList.add("loading-job");
  }
}

function resetAllOptPanelZooms() {
  const def = () => ({ emin: 0.0, emax: null, nmMin: 180, nmMax: 1100, yScale: 1.0 });
  CASTEP_STUDIO_STATE.optPanelZooms = { a: def(), b: def(), c: def(), d: def(), single: def() };
  CASTEP_STUDIO_STATE.optZoom = { ...def(), isDragging: false, lastX: 0 };
  CASTEP_STUDIO_STATE._optSpectraCacheKey = "";
}

function buildCastepStructureFromParsedCif(p, fallbackName = "Structure") {
  if (!p || !Array.isArray(p.atoms) || !p.atoms.length) return null;
  const lat = {
    a: Number(p.a) || 4.0,
    b: Number(p.b) || Number(p.a) || 4.0,
    c: Number(p.c) || Number(p.a) || 4.0,
    alpha: Number(p.alpha) || 90.0,
    beta: Number(p.beta) || 90.0,
    gamma: Number(p.gamma) || 90.0
  };
  const vecs = (Array.isArray(p.vectors) && p.vectors.length === 3)
    ? p.vectors
    : castepParamsToVectors(lat.a, lat.b, lat.c, lat.alpha, lat.beta, lat.gamma);
  return {
    name: p.name || p.formula || fallbackName,
    formula: p.formula || castepComputeFormula(p.atoms),
    fullUnitCellFormula: p.full_unit_cell_formula || castepComputeFormula(p.atoms),
    formulaUnitsZ: Number(p.formula_units_Z) || 1,
    spaceGroup: p.space_group || "P 1 (1)",
    spaceGroupHM: p.space_group_hm || "P 1",
    spaceGroupIT: Number(p.space_group_it) || 1,
    hallSymbol: p.hall_symbol || "P 1",
    crystalSystem: p.crystal_system || castepInferCrystalSystem(lat),
    cellSetting: p.cell_setting || (p.crystal_system || "triclinic").toLowerCase(),
    symopSource: p.symop_source || "p1",
    symops: Array.isArray(p.symops) && p.symops.length ? p.symops.slice() : ["x, y, z"],
    asymmetricAtoms: Array.isArray(p.asymmetric_atoms) && p.asymmetric_atoms.length
      ? JSON.parse(JSON.stringify(p.asymmetric_atoms))
      : null,
    symmetryIntact: Boolean(p.symmetry_intact && Array.isArray(p.asymmetric_atoms) && p.asymmetric_atoms.length > 0),
    lattice: lat,
    vectors: vecs,
    atoms: p.atoms.map((a, i) => ({
      element: castepCleanElement(a.element),
      type_symbol: a.type_symbol || castepCleanElement(a.element),
      label: a.label || `${a.element}${i + 1}`,
      site_label: a.site_label || a.label || `${a.element}${i + 1}`,
      x: Number(a.x) || 0,
      y: Number(a.y) || 0,
      z: Number(a.z) || 0,
      occupancy: (typeof a.occupancy === "number" && isFinite(a.occupancy)) ? a.occupancy : 1.0,
      uiso: Number(a.uiso) || 0.0,
      adp_type: a.adp_type || "Uiso",
      fixed: false, fx: 0, fy: 0, fz: 0, charge: null
    })),
    kpointsBlock: "",
    speciesPotBlock: ""
  };
}
window.buildCastepStructureFromParsedCif = buildCastepStructureFromParsedCif;

async function loadCastepJobIntoStudio(jobId) {
  const job = (CASTEP_STUDIO_STATE.jobs || []).find(j => j.id === jobId);
  if (!job) return;

  // Monotonic token so rapid clicks across the sidebar cancel stale async loads smoothly
  const loadSeq = ++CASTEP_STUDIO_STATE._jobLoadSeq;
  CASTEP_STUDIO_STATE.activeJobId = jobId;

  // Instant <1ms active highlight without destroying/rebuilding the sidebar DOM!
  const needsHydration = !job._hydrated && (
    (job._fileMap && Object.keys(job._fileMap).length > 0) ||
    job._dirHandle ||
    (job.folder && CASTEP_STUDIO_STATE.localBackendConnected)
  );
  highlightActiveCastepJobCard(jobId, needsHydration);

  // Yield 1 animation frame so the browser paints the clicked highlight IMMEDIATELY
  if (needsHydration) {
    await new Promise(resolve => requestAnimationFrame(resolve));
    if (loadSeq !== CASTEP_STUDIO_STATE._jobLoadSeq) return;
  }

  // Lazy-hydrate full details from local FastAPI server OR from mounted browser FileHandles/Files
  if (needsHydration) {
    if (job._fileMap && Object.keys(job._fileMap).length > 0) {
      await hydrateCastepJobFromFileMap(job, { fastFirst: CASTEP_STUDIO_STATE.activeStagePane !== "chdiff" });
      if (loadSeq !== CASTEP_STUDIO_STATE._jobLoadSeq) return;
      Object.assign(job, enrichCastepJobSummary(job));
      job._hydrated = true;
    } else if (job._dirHandle) {
      await hydrateCastepJobFromDirHandle(job);
      if (loadSeq !== CASTEP_STUDIO_STATE._jobLoadSeq) return;
      Object.assign(job, enrichCastepJobSummary(job));
      job._hydrated = true;
    } else if (job.folder && CASTEP_STUDIO_STATE.localBackendConnected) {
      try {
        const resp = await fetch(`${getCastepApiBase()}/api/castep/job?folder=${encodeURIComponent(job.folder)}&seed=${encodeURIComponent(job.seed || "")}`);
        if (loadSeq !== CASTEP_STUDIO_STATE._jobLoadSeq) return;
        if (resp.ok) {
          const detail = await resp.json();
          if (loadSeq !== CASTEP_STUDIO_STATE._jobLoadSeq) return;
          Object.assign(job, detail);
          Object.assign(job, enrichCastepJobSummary(job));
          job._hydrated = true;
        }
      } catch (e) {}
    }
  }

  if (loadSeq !== CASTEP_STUDIO_STATE._jobLoadSeq) return;
  highlightActiveCastepJobCard(jobId, false);

  // 1) Parse .castep log
  const parsedLog = parseCastepOutputLog(job.castep_text || "");
  CASTEP_STUDIO_STATE.parsedLog = parsedLog;

  // 2) Parse structure from .cell, .xsd, .cif, or .castep
  let struct = null;
  if (job.cell_text) {
    struct = parseCastepCellText(job.cell_text, job.material || job.seed || "CASTEP_Structure");
  }
  if ((!struct || !struct.atoms.length) && job.xsd_text) {
    struct = parseMaterialsStudioXsd(job.xsd_text, job.material || job.seed || "MS_Structure");
  }
  if ((!struct || !struct.atoms.length) && job.cif_text && (typeof parseCifFullCrystal === "function" || typeof parseCifTextClient === "function")) {
    const p = typeof parseCifFullCrystal === "function"
      ? parseCifFullCrystal(job.cif_text, job.seed || "Structure.cif")
      : parseCifTextClient(job.cif_text, job.seed || "Structure.cif");
    const built = buildCastepStructureFromParsedCif(p, job.seed || "Structure");
    if (built) struct = built;
  }
  if ((!struct || !struct.atoms.length) && parsedLog.atoms && parsedLog.atoms.length > 0) {
    const vecs = parsedLog.vectors || castepParamsToVectors(5.0, 5.0, 15.0, 90, 90, 90);
    struct = {
      name: job.material || job.seed,
      formula: castepComputeFormula(parsedLog.atoms),
      spaceGroup: parsedLog.spaceGroup || "P 1",
      crystalSystem: castepInferCrystalSystem(parsedLog.lattice || { a: 5, b: 5, c: 15, alpha: 90, beta: 90, gamma: 90 }),
      lattice: parsedLog.lattice || castepVectorsToParams(vecs),
      vectors: vecs,
      atoms: JSON.parse(JSON.stringify(parsedLog.atoms)),
      kpointsBlock: "",
      speciesPotBlock: ""
    };
  }
  if (struct && struct.atoms && struct.atoms.length > 0) {
    if (parsedLog.spaceGroup) struct.spaceGroup = parsedLog.spaceGroup;
    if (parsedLog.atoms && parsedLog.atoms.length === struct.atoms.length) {
      struct.atoms.forEach((at, idx) => {
        const pAt = parsedLog.atoms[idx];
        if (pAt) {
          at.fx = pAt.fx || 0;
          at.fy = pAt.fy || 0;
          at.fz = pAt.fz || 0;
          if (pAt.charge !== null && pAt.charge !== undefined) at.charge = pAt.charge;
          if (pAt.spin !== undefined) at.spin = pAt.spin;
        }
      });
    }
    CASTEP_STUDIO_STATE.structure = JSON.parse(JSON.stringify(struct));
    CASTEP_STUDIO_STATE.originalStructureBackup = JSON.parse(JSON.stringify(struct));
    CASTEP_STUDIO_STATE.undoStack = [];
    CASTEP_STUDIO_STATE.redoStack = [];
    CASTEP_STUDIO_STATE.view3D.selectedAtomIndices.clear();
  } else {
    CASTEP_STUDIO_STATE.structure = {
      name: job.seed || "", formula: "", spaceGroup: "P 1", crystalSystem: "",
      lattice: { a: 5, b: 5, c: 15, alpha: 90, beta: 90, gamma: 90 },
      vectors: [[5,0,0],[0,5,0],[0,0,15]], atoms: [], kpointsBlock: "", speciesPotBlock: ""
    };
  }

  // 3) Parse Geometry Trajectory (.geom) lazily only if present
  CASTEP_STUDIO_STATE.geomFrames = job.geom_text ? parseCastepGeomTrajectory(job.geom_text) : [];
  CASTEP_STUDIO_STATE.activeGeomFrameIdx = Math.max(0, CASTEP_STUDIO_STATE.geomFrames.length - 1);
  updateCastepGeomScrubberUI();

  // 4) Sync Working Folder, Seed & Optical File Selector
  const folderInp = document.getElementById("castep-save-folder-input");
  const seedInp = document.getElementById("castep-save-seed-input");
  if (folderInp) folderInp.value = job.folder || "";
  if (seedInp) seedInp.value = job.seed || "";
  if (CASTEP_STUDIO_STATE.activeStagePane === "optics") {
    await ensureJobOpticalTensorHydrated(job);
  }
  populateCastepOpticalFileSelect(job);
  populateCastepPdosTargetSelect(job);
  attachMullikenSpinsToStructure(job);

  // 5) Reset viewports & caches
  CASTEP_STUDIO_STATE.view3D.distanceMeasurements = [];
  CASTEP_STUDIO_STATE.view3D.angleMeasurements = [];
  CASTEP_STUDIO_STATE.view3D.measureBuffer = [];
  CASTEP_STUDIO_STATE.view3D.panX = 0;
  CASTEP_STUDIO_STATE.view3D.panY = 0;
  CASTEP_STUDIO_STATE.view3D.scale = 1.0;
  CASTEP_STUDIO_STATE.view3D._topoCacheKey = "";
  CASTEP_STUDIO_STATE.view3D._legendCacheKey = "";
  CASTEP_STUDIO_STATE.chdiffState.activeGrid = null;
  CASTEP_STUDIO_STATE.chdiffState.rot3DMatrix = null;
  resetAllOptPanelZooms();
  CASTEP_STUDIO_STATE.convZoom = { xMinFrac: 0.0, xMaxFrac: 1.0 };

  setCastep3DView(CASTEP_STUDIO_STATE.view3D.currentAxisPreset || "a", true);
  syncCastepStructureToBuilderInputs();
  updateCastepKpiBar();

  // 6) Mark all non-active panes dirty and render ONLY the currently visible tab immediately!
  CASTEP_STUDIO_STATE._dirtyPanes = new Set(["builder", "electronic", "optics", "chdiff", "mulliken", "convergence", "files", "atoms", "adsorb"]);
  const activePane = CASTEP_STUDIO_STATE.activeStagePane || "builder";

  if (activePane === "builder") {
    CASTEP_STUDIO_STATE._dirtyPanes.delete("builder");
    renderCastep3DScene();
    updateVestaOutputConsole();
    renderVestaObjectsTab();
    // Defer heavy background table & adsorption site refresh to next idle frame
    requestAnimationFrame(() => {
      if (loadSeq !== CASTEP_STUDIO_STATE._jobLoadSeq) return;
      detectCastepAdsorptionSites();
      renderCastepAtomsTable();
      CASTEP_STUDIO_STATE._dirtyPanes.delete("atoms");
      CASTEP_STUDIO_STATE._dirtyPanes.delete("adsorb");
    });
  } else if (activePane === "electronic") {
    CASTEP_STUDIO_STATE._dirtyPanes.delete("electronic");
    renderCastepElectronicPlots();
  } else if (activePane === "optics") {
    CASTEP_STUDIO_STATE._dirtyPanes.delete("optics");
    renderCastepOpticalPlots();
  } else if (activePane === "chdiff") {
    CASTEP_STUDIO_STATE._dirtyPanes.delete("chdiff");
    await ensureJobChdiffHydrated(job);
    if (loadSeq !== CASTEP_STUDIO_STATE._jobLoadSeq) return;
    renderCastepChdiffPlots();
  } else if (activePane === "mulliken") {
    CASTEP_STUDIO_STATE._dirtyPanes.delete("mulliken");
    renderCastepMullikenPane();
  } else if (activePane === "convergence") {
    CASTEP_STUDIO_STATE._dirtyPanes.delete("convergence");
    renderCastepConvergencePlots();
  } else if (activePane === "files") {
    CASTEP_STUDIO_STATE._dirtyPanes.delete("files");
    populateCastepParamFormFromText(job.param_text || "");
    refreshCastepFileEditorContent();
  }
}
window.loadCastepJobIntoStudio = loadCastepJobIntoStudio;

async function ensureJobChdiffHydrated(job) {
  if (!job || job.chdiff_data) return;
  if (job._fileMap && !job._chdiffChecked) {
    job._chdiffChecked = true;
    const entries = Object.entries(job._fileMap);
    const chdiffE = entries.find(([n]) => n.toLowerCase().endsWith(".chdiff"));
    if (chdiffE) {
      const { vol, cLen } = getActiveStructureCellVolAndC();
      const buf = await readFromFileOrHandle(chdiffE[1], true);
      if (buf) job.chdiff_data = parseCastepChdiffArrayBuffer(buf, chdiffE[0], vol, cLen);
    }
  }
}

async function switchCastepStagePane(paneId, btnEl) {
  CASTEP_STUDIO_STATE.activeStagePane = paneId;
  document.querySelectorAll(".castep-stage-tab").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".castep-stage-pane").forEach(p => p.classList.remove("active"));
  const btn = btnEl || document.querySelector(`.castep-stage-tab[data-pane="${paneId}"]`);
  if (btn) btn.classList.add("active");
  const pane = document.getElementById(`castep-pane-${paneId}`);
  if (pane) pane.classList.add("active");

  const job = (CASTEP_STUDIO_STATE.jobs || []).find(j => j.id === CASTEP_STUDIO_STATE.activeJobId);
  if (paneId === "chdiff" && job) {
    await ensureJobChdiffHydrated(job);
  } else if (paneId === "optics" && job) {
    await ensureJobOpticalTensorHydrated(job);
    populateCastepOpticalFileSelect(job);
  }

  requestAnimationFrame(() => {
    CASTEP_STUDIO_STATE._dirtyPanes.delete(paneId);
    if (paneId === "builder") {
      renderCastep3DScene();
      updateVestaOutputConsole();
      renderVestaObjectsTab();
      if (CASTEP_STUDIO_STATE._dirtyPanes.has("atoms")) {
        renderCastepAtomsTable();
        CASTEP_STUDIO_STATE._dirtyPanes.delete("atoms");
      }
      if (CASTEP_STUDIO_STATE._dirtyPanes.has("adsorb")) {
        detectCastepAdsorptionSites();
        CASTEP_STUDIO_STATE._dirtyPanes.delete("adsorb");
      }
    } else if (paneId === "gateway") renderMsGatewayTable();
    else if (paneId === "electronic") renderCastepElectronicPlots();
    else if (paneId === "optics") renderCastepOpticalPlots();
    else if (paneId === "chdiff") renderCastepChdiffPlots();
    else if (paneId === "mulliken") renderCastepMullikenPane();
    else if (paneId === "convergence") renderCastepConvergencePlots();
    else if (paneId === "files") {
      if (job) populateCastepParamFormFromText(job.param_text || "");
      refreshCastepFileEditorContent();
    }
  });
}
window.switchCastepStagePane = switchCastepStagePane;

// ============================================================================
// 4. VESTA 3D Crystal & Surface Renderer, Boundary Bonds, Axis Triad & Tools
// ============================================================================

const VESTA_CPK_COLORS = {
  H: "#e5e7eb", He: "#d9ffff", Li: "#cc80ff", Be: "#a3e635", B: "#f49797",
  C: "#52525b", N: "#3050f8", O: "#e52b2b", F: "#84cc16", Ne: "#b3e3f5",
  Na: "#ab5cf2", Mg: "#65d41a", Al: "#b8a3a3", Si: "#8c9ec9", P: "#a376a8",
  S: "#e5c100", Cl: "#22c55e", Ar: "#80d1e3", K: "#8f40d4", Ca: "#38b000",
  Sc: "#cbd5e1", Ti: "#9ca3af", V: "#8b92a1", Cr: "#7b8ec7", Mn: "#9c7ac7",
  Fe: "#d96b38", Co: "#e67391", Ni: "#44bd55", Cu: "#c87b33", Zn: "#7d80b0",
  Ga: "#c28f8f", Ge: "#668f8f", As: "#b67ce0", Se: "#e88c1e", Br: "#a62929",
  Kr: "#5cb8d1", Rb: "#702eb0", Sr: "#16a34a", Y: "#67d7e0", Zr: "#6bc5cf",
  Nb: "#62b5be", Mo: "#7c5ba6", Tc: "#3b9e9e", Ru: "#248f8f", Rh: "#0a7d8c",
  Pd: "#006985", Ag: "#b8c0cc", Cd: "#e5b869", In: "#a67573", Sn: "#668080",
  Sb: "#9e63b5", Te: "#c87528", I: "#940094", Xe: "#429eb0", Cs: "#57178f",
  Ba: "#16a34a", La: "#5cc8f5", Ce: "#e5d98a", Hf: "#4dc2ff", Ta: "#4da6ff",
  W: "#2194d6", Re: "#267dab", Os: "#266696", Ir: "#175487", Pt: "#c4c9d9",
  Au: "#eab308", Hg: "#a8a8c0", Pb: "#575961", Bi: "#9e4fb5"
};

// Cordero (2008) & Pyykko crystallographic covalent radii (Angstrom)
const CRYSTAL_COV_RADII = {
  H: 0.31, He: 0.28, Li: 1.28, Be: 0.96, B: 0.84, C: 0.76, N: 0.71, O: 0.66, F: 0.57, Ne: 0.58,
  Na: 1.66, Mg: 1.41, Al: 1.21, Si: 1.11, P: 1.07, S: 1.05, Cl: 1.02, Ar: 1.06,
  K: 2.03, Ca: 1.76, Sc: 1.70, Ti: 1.60, V: 1.53, Cr: 1.39, Mn: 1.39, Fe: 1.32, Co: 1.26, Ni: 1.24, Cu: 1.32, Zn: 1.22,
  Ga: 1.22, Ge: 1.20, As: 1.19, Se: 1.20, Br: 1.20, Kr: 1.16,
  Rb: 2.20, Sr: 1.95, Y: 1.90, Zr: 1.75, Nb: 1.64, Mo: 1.54, Tc: 1.47, Ru: 1.46, Rh: 1.42, Pd: 1.39, Ag: 1.45, Cd: 1.44,
  In: 1.42, Sn: 1.39, Sb: 1.39, Te: 1.38, I: 1.39, Xe: 1.40,
  Cs: 2.44, Ba: 2.15, La: 2.07, Ce: 2.04, Hf: 1.75, Ta: 1.70, W: 1.62, Re: 1.51, Os: 1.44, Ir: 1.41, Pt: 1.36, Au: 1.36, Hg: 1.32,
  Tl: 1.45, Pb: 1.46, Bi: 1.48
};

function getCrystalCovRadius(el) {
  const clean = castepCleanElement(el);
  if (CRYSTAL_COV_RADII[clean]) return CRYSTAL_COV_RADII[clean];
  if (typeof COVALENT_RADII !== "undefined" && COVALENT_RADII[clean]) return COVALENT_RADII[clean];
  return 1.20;
}

const VESTA_POLYHEDRAL_CENTERS = new Set([
  "Mo", "W", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn",
  "Si", "Al", "Ga", "Ge", "Sn", "Zr", "Nb", "Hf", "Ta", "Ru", "Rh", "Pd", "Pt", "Mg", "Ca"
]);

const CRYSTAL_TRANSITION_METALS = new Set([
  "Sc", "Y", "La", "Ce", "Pr", "Nd", "Sm", "Eu", "Gd", "Tb", "Dy", "Ho", "Er", "Tm", "Yb", "Lu",
  "Ti", "Zr", "Hf", "V", "Nb", "Ta", "Cr", "Mo", "W", "Mn", "Tc", "Re",
  "Fe", "Ru", "Os", "Co", "Rh", "Ir", "Ni", "Pd", "Pt", "Cu", "Ag", "Au", "Zn", "Cd", "Hg"
]);

const CRYSTAL_ALKALI_GUESTS = new Set(["Li", "Na", "K", "Rb", "Cs"]);

const VESTA_CATION_SET = new Set([
  "Li", "Na", "K", "Rb", "Cs", "Be", "Mg", "Ca", "Sr", "Ba",
  ...CRYSTAL_TRANSITION_METALS,
  "Al", "Ga", "In", "Tl", "Si", "Ge", "Sn", "Pb", "Sb", "Bi"
]);

const VESTA_ANION_SET = new Set([
  "H", "B", "C", "N", "O", "F", "P", "S", "Cl", "As", "Se", "Br", "Te", "I"
]);

function isVestaChemicalBond(el1, el2, dist, cutoffFactor, hasBothCationAndAnion, elSet = null) {
  if (dist <= 0.45) return false;
  const tol = Number(cutoffFactor) || 1.15;
  const r1 = getCrystalCovRadius(el1);
  const r2 = getCrystalCovRadius(el2);
  const sumR = r1 + r2;

  // Hard physical upper bound so oversized radii never create cross-cell spiderwebs
  const maxAllowed = Math.min(3.35, sumR * tol);
  if (dist > maxAllowed) return false;

  const isAlk1 = CRYSTAL_ALKALI_GUESTS.has(el1), isAlk2 = CRYSTAL_ALKALI_GUESTS.has(el2);
  const isTM1 = CRYSTAL_TRANSITION_METALS.has(el1), isTM2 = CRYSTAL_TRANSITION_METALS.has(el2);
  const isA1 = VESTA_ANION_SET.has(el1), isA2 = VESTA_ANION_SET.has(el2);

  // 1) In transition-metal + covalent frameworks (e.g. KCoHCF, BaTiO3, SrTiO3), large A-site
  //    alkali / alkaline-earth cations (K, Rb, Cs, Ba, Sr) sit in 12-coord interstitial cages
  //    and should not draw fake spiderweb spokes over TM-O/TM-CN polyhedra (matching VESTA defaults)
  const isLargeASite1 = (el1 === "K" || el1 === "Rb" || el1 === "Cs" || el1 === "Ba" || el1 === "Sr");
  const isLargeASite2 = (el2 === "K" || el2 === "Rb" || el2 === "Cs" || el2 === "Ba" || el2 === "Sr");
  if ((isAlk1 || isAlk2 || isLargeASite1 || isLargeASite2) && elSet) {
    const hasTM = [...elSet].some(e => CRYSTAL_TRANSITION_METALS.has(e));
    if (hasTM && (isLargeASite1 || isLargeASite2) && tol <= 1.22) {
      return false;
    }
    // Even for Li/Na/Ca, avoid alkali-TM direct bonds
    if ((isAlk1 && isTM2) || (isAlk2 && isTM1)) return false;
  }

  if (hasBothCationAndAnion) {
    // 2) In compound semiconductors/ceramics (e.g. MoSSe, MoSi2N2P2, TiO2, KCoHCF):
    //    suppress spurious TM-TM and TM-Si/Ge/Al bonds when anions mediate bonding
    if (isTM1 && isTM2) return false;
    const isSemi1 = (el1 === "Si" || el1 === "Ge" || el1 === "Al" || el1 === "Ga");
    const isSemi2 = (el2 === "Si" || el2 === "Ge" || el2 === "Al" || el2 === "Ga");
    if ((isTM1 && isSemi2) || (isTM2 && isSemi1)) return false;

    // 3) Non-metal to non-metal bonds (B-N, C-N, C-C, P-P, S-S, Se-Se, Te-Te, O-H):
    //    allow genuine covalent dimers/networks (using tighter 1.12 covalent factor)
    //    so Te-Te (2.84 A <= 3.09 A) and B-N (1.45 A) bond cleanly, while intra-layer
    //    non-bonded S...S (3.22 A > 2.35 A) or N...N (3.29 A > 1.59 A) stay cleanly unbonded!
    if (isA1 && isA2) {
      return dist <= sumR * Math.min(tol, 1.12);
    }
  }
  return true;
}

function getVestaElementColor(el) {
  const clean = castepCleanElement(el);
  const custom = CASTEP_STUDIO_STATE.view3D.customElementColors?.[clean];
  if (custom) return custom;
  if (VESTA_CPK_COLORS[clean]) return VESTA_CPK_COLORS[clean];
  if (typeof getElementColor === "function") return getElementColor(clean);
  return "#3b82f6";
}
window.getVestaElementColor = getVestaElementColor;

function vestaVecNorm(v) {
  const len = Math.hypot(v[0], v[1], v[2]) || 1.0;
  return [v[0] / len, v[1] / len, v[2] / len];
}

function vestaVecCross(u, v) {
  return [
    u[1] * v[2] - u[2] * v[1],
    u[2] * v[0] - u[0] * v[2],
    u[0] * v[1] - u[1] * v[0]
  ];
}

function vestaVecDot(u, v) {
  return u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
}

function vestaMatMul3x3(A, B) {
  const out = [[0,0,0],[0,0,0],[0,0,0]];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      out[i][j] = A[i][0]*B[0][j] + A[i][1]*B[1][j] + A[i][2]*B[2][j];
    }
  }
  return out;
}

function vestaRotScreenAxisMatrix(axis, deg) {
  const r = (deg * Math.PI) / 180.0;
  const c = Math.cos(r), s = Math.sin(r);
  if (axis === "x") {
    return [[1, 0, 0], [0, c, -s], [0, s, c]];
  } else if (axis === "y") {
    return [[c, 0, s], [0, 1, 0], [-s, 0, c]];
  } else {
    return [[c, -s, 0], [s, c, 0], [0, 0, 1]];
  }
}

function computeVestaOrientationMatrix(preset, vecs) {
  const [aVec, bVec, cVec] = vecs || [[6.594,0,0],[0,6.594,0],[0,0,25.151]];
  const aHat = vestaVecNorm(aVec);
  const bHat = vestaVecNorm(bVec);
  const cHat = vestaVecNorm(cVec);
  const aStar = vestaVecNorm(vestaVecCross(bVec, cVec));
  const bStar = vestaVecNorm(vestaVecCross(cVec, aVec));
  const cStar = vestaVecNorm(vestaVecCross(aVec, bVec));

  let vOut = aHat;
  let uRef = cHat;
  const p = String(preset || "a").toLowerCase();

  if (p === "a" || p === "side") {
    vOut = aHat; uRef = cHat;
  } else if (p === "b" || p === "front") {
    vOut = bHat; uRef = cHat;
  } else if (p === "c" || p === "top") {
    vOut = cHat; uRef = bHat;
  } else if (p === "a*" || p === "a_star") {
    vOut = aStar; uRef = cHat;
  } else if (p === "b*" || p === "b_star") {
    vOut = bStar; uRef = cHat;
  } else if (p === "c*" || p === "c_star") {
    vOut = cStar; uRef = bHat;
  } else {
    // Standard 3D Isometric view based on 'a' view tilted slightly
    const baseR = computeVestaOrientationMatrix("a", vecs);
    const tiltY = vestaRotScreenAxisMatrix("y", -24);
    const tiltX = vestaRotScreenAxisMatrix("x", 16);
    return vestaMatMul3x3(tiltX, vestaMatMul3x3(tiltY, baseR));
  }

  const ez = vestaVecNorm(vOut);
  const dotUR = vestaVecDot(uRef, ez);
  let uPerp = [uRef[0] - dotUR * ez[0], uRef[1] - dotUR * ez[1], uRef[2] - dotUR * ez[2]];
  if (Math.hypot(...uPerp) < 1e-6) {
    uPerp = Math.abs(ez[2]) < 0.9 ? [0, 0, 1] : [0, 1, 0];
  }
  const ey = vestaVecNorm(uPerp);
  const ex = vestaVecNorm(vestaVecCross(ey, ez));
  return [ex, ey, ez];
}

function initCastep3DCanvasEvents() {
  const canvas = document.getElementById("castep-3d-canvas");
  if (!canvas || canvas._castepEventsBound) return;
  canvas._castepEventsBound = true;

  canvas.addEventListener("contextmenu", (e) => e.preventDefault());

  canvas.addEventListener("mousedown", (e) => {
    const v3 = CASTEP_STUDIO_STATE.view3D;
    v3.isDragging = true;
    v3.dragButton = e.button;
    v3.dragMoved = false;
    v3.dragStartX = e.clientX;
    v3.dragStartY = e.clientY;
    v3.lastX = e.clientX;
    v3.lastY = e.clientY;

    if (v3.activeTool === "select" && e.button === 0) {
      const rect = canvas.getBoundingClientRect();
      const mx = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const my = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
      v3.marquee = {
        active: true,
        x0: mx,
        y0: my,
        x1: mx,
        y1: my,
        additive: !!(e.shiftKey || e.ctrlKey || e.metaKey)
      };
      canvas.style.cursor = "crosshair";
      return;
    }

    if (v3.marquee) v3.marquee.active = false;
    canvas.style.cursor = (v3.activeTool === "pan" || e.button === 2 || e.button === 1)
      ? "move"
      : (v3.activeTool === "zoom" ? "ns-resize" : "grabbing");
  });

  window.addEventListener("mousemove", (e) => {
    const v3 = CASTEP_STUDIO_STATE.view3D;
    if (!v3.isDragging) return;
    const dx = e.clientX - v3.lastX;
    const dy = e.clientY - v3.lastY;
    const totalDist = Math.hypot(e.clientX - v3.dragStartX, e.clientY - v3.dragStartY);
    if (totalDist > 4.0) v3.dragMoved = true;

    // Box Select (Marquee) drag in Select tool
    if (v3.marquee && v3.marquee.active) {
      const rect = canvas.getBoundingClientRect();
      v3.marquee.x1 = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      v3.marquee.y1 = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
      v3.marquee.additive = v3.marquee.additive || !!(e.shiftKey || e.ctrlKey || e.metaKey);
      v3.lastX = e.clientX;
      v3.lastY = e.clientY;
      if (v3.dragMoved) scheduleCastep3DRender();
      return;
    }

    // Avoid accidental tiny pan jitter while user is Shift+Clicking an atom in Rotate mode
    if (!v3.dragMoved && e.shiftKey) {
      return;
    }

    if (v3.activeTool === "pan" || v3.dragButton === 2 || v3.dragButton === 1 || (e.shiftKey && v3.dragMoved)) {
      v3.panX += dx;
      v3.panY += dy;
    } else if (v3.activeTool === "zoom") {
      const factor = Math.exp(-dy * 0.008);
      v3.scale = Math.max(0.25, Math.min(6.0, v3.scale * factor));
    } else {
      // Smooth screen-space trackball rotation
      const ry = vestaRotScreenAxisMatrix("y", dx * 0.65);
      const rx = vestaRotScreenAxisMatrix("x", dy * 0.65);
      v3.rotMatrix = vestaMatMul3x3(rx, vestaMatMul3x3(ry, v3.rotMatrix));
    }
    v3.lastX = e.clientX;
    v3.lastY = e.clientY;
    scheduleCastep3DRender();
  });

  window.addEventListener("mouseup", (e) => {
    const v3 = CASTEP_STUDIO_STATE.view3D;
    if (!v3.isDragging) return;
    const wasClick = !v3.dragMoved;
    const wasMarquee = !!(v3.marquee && v3.marquee.active);
    const mBox = wasMarquee ? { ...v3.marquee } : null;
    v3.isDragging = false;
    if (v3.marquee) v3.marquee.active = false;
    canvas.style.cursor = v3.activeTool === "pan" ? "move" : (v3.activeTool === "rotate" ? "grab" : "crosshair");

    if (wasMarquee && !wasClick && mBox) {
      const minX = Math.min(mBox.x0, mBox.x1);
      const maxX = Math.max(mBox.x0, mBox.x1);
      const minY = Math.min(mBox.y0, mBox.y1);
      const maxY = Math.max(mBox.y0, mBox.y1);
      const additive = !!(mBox.additive || e.shiftKey || e.ctrlKey || e.metaKey);
      const sel = v3.selectedAtomIndices;
      if (!additive) sel.clear();

      const rendered = v3.renderedAtomsScreen || [];
      let lastHit = null;
      for (let i = 0; i < rendered.length; i++) {
        const a = rendered[i];
        if (a.sx >= minX && a.sx <= maxX && a.sy >= minY && a.sy <= maxY) {
          if (a.atomIndex !== undefined) {
            sel.add(a.atomIndex);
            lastHit = a;
          }
        }
      }
      if (lastHit) {
        v3.lastClickedAtomLog = {
          number: lastHit.atomIndex + 1,
          element: lastHit.element,
          label: lastHit.label,
          u: lastHit.fracU,
          v: lastHit.fracV,
          w: lastHit.fracW,
          cartX: lastHit.cartX,
          cartY: lastHit.cartY,
          cartZ: lastHit.cartZ,
          isBoundaryImage: Boolean(lastHit.isBoundaryImage)
        };
      } else if (sel.size === 0) {
        v3.lastClickedAtomLog = null;
      }
      renderCastep3DScene();
      renderCastepAtomsTable();
      updateVestaOutputConsole();
      updateCastep3DSelectionHud();
      return;
    }

    if (wasClick && e.target === canvas) {
      handleCastep3DCanvasClick(e, canvas);
    }
  });

  // Escape key clears selection cleanly when working in the 3D Builder
  if (!window._castep3dEscBound) {
    window._castep3dEscBound = true;
    window.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      const tag = (e.target?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (CASTEP_STUDIO_STATE.activeStagePane !== "builder") return;
      const v3 = CASTEP_STUDIO_STATE.view3D;
      if (v3.selectedAtomIndices.size > 0 || (v3.marquee && v3.marquee.active)) {
        v3.selectedAtomIndices.clear();
        if (v3.marquee) v3.marquee.active = false;
        v3.lastClickedAtomLog = null;
        renderCastep3DScene();
        renderCastepAtomsTable();
        updateVestaOutputConsole();
        updateCastep3DSelectionHud();
      }
    });
  }

  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.11 : 0.90;
    CASTEP_STUDIO_STATE.view3D.scale = Math.max(0.25, Math.min(6.0, CASTEP_STUDIO_STATE.view3D.scale * factor));
    scheduleCastep3DRender();
  }, { passive: false });
}

function handleCastep3DCanvasClick(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const v3 = CASTEP_STUDIO_STATE.view3D;
  const rendered = v3.renderedAtomsScreen || [];

  // Search front-most atom hit (drawn last = highest index in sorted draw order)
  let hitAtom = null;
  for (let i = rendered.length - 1; i >= 0; i--) {
    const a = rendered[i];
    const d = Math.hypot(mx - a.sx, my - a.sy);
    if (d <= Math.max(11, a.radius + 4)) {
      hitAtom = a;
      break;
    }
  }

  const tool = v3.activeTool || "rotate";
  const isMultiKey = !!(e.shiftKey || e.ctrlKey || e.metaKey);

  // Clicking empty background clears selection (unless holding Shift/Ctrl)
  if (!hitAtom) {
    if ((tool === "rotate" || tool === "select") && !isMultiKey && v3.selectedAtomIndices.size > 0) {
      v3.selectedAtomIndices.clear();
      v3.lastClickedAtomLog = null;
      renderCastep3DScene();
      renderCastepAtomsTable();
      updateVestaOutputConsole();
      updateCastep3DSelectionHud();
    }
    return;
  }

  const st = CASTEP_STUDIO_STATE.structure;
  const baseIdx = hitAtom.atomIndex;
  const baseAtom = st.atoms[baseIdx];

  // Record VESTA atom click log entry
  v3.lastClickedAtomLog = {
    number: baseIdx + 1,
    element: hitAtom.element,
    label: hitAtom.label,
    u: hitAtom.fracU,
    v: hitAtom.fracV,
    w: hitAtom.fracW,
    cartX: hitAtom.cartX,
    cartY: hitAtom.cartY,
    cartZ: hitAtom.cartZ,
    isBoundaryImage: Boolean(hitAtom.isBoundaryImage)
  };

  if (tool === "delete") {
    if (baseIdx !== undefined && st.atoms[baseIdx]) {
      pushCastepUndoSnapshot();
      const delLbl = st.atoms[baseIdx].label || st.atoms[baseIdx].element;
      st.atoms.splice(baseIdx, 1);
      v3.selectedAtomIndices.clear();
      afterCastepStructureModified(`Deleted atom ${delLbl} (#${baseIdx + 1}).`);
    }
    return;
  }

  if (tool === "adsorb") {
    const species = document.getElementById("castep-ads-species")?.value || "H";
    const heightA = parseFloat(document.getElementById("castep-ads-height")?.value || "1.80");
    const side = document.getElementById("castep-ads-side")?.value || "top";
    const orient = document.getElementById("castep-ads-orient")?.value || "vertical";
    pushCastepUndoSnapshot();
    const added = insertAdsorbateAtCartesianBase(hitAtom.cartX, hitAtom.cartY, hitAtom.cartZ, side, heightA, species, orient);
    afterCastepStructureModified(`Placed ${species} (${added.join(", ")}) directly on ${hitAtom.label} (Δz = ${heightA.toFixed(2)} Å).`);
    return;
  }

  if (tool === "distance") {
    v3.measureBuffer.push(hitAtom);
    if (v3.measureBuffer.length >= 2) {
      const a1 = v3.measureBuffer[0], a2 = v3.measureBuffer[1];
      const dist = Math.hypot(a1.cartX - a2.cartX, a1.cartY - a2.cartY, a1.cartZ - a2.cartZ);
      v3.distanceMeasurements.push({
        label1: a1.label, label2: a2.label,
        u1: a1.fracU, v1: a1.fracV, w1: a1.fracW,
        u2: a2.fracU, v2: a2.fracV, w2: a2.fracW,
        c1: [a1.cartX, a1.cartY, a1.cartZ],
        c2: [a2.cartX, a2.cartY, a2.cartZ],
        distA: dist
      });
      v3.measureBuffer = [];
      if (typeof showToast === "function") {
        showToast(`📏 Distance d(${a1.label} – ${a2.label}) = ${dist.toFixed(5)} Å`, "success");
      }
    }
    if (baseIdx !== undefined) v3.selectedAtomIndices.add(baseIdx);
    renderCastep3DScene();
    updateVestaOutputConsole();
    updateCastep3DSelectionHud();
    return;
  }

  if (tool === "angle") {
    v3.measureBuffer.push(hitAtom);
    if (v3.measureBuffer.length >= 3) {
      const a1 = v3.measureBuffer[0], a2 = v3.measureBuffer[1], a3 = v3.measureBuffer[2];
      const v1 = [a1.cartX - a2.cartX, a1.cartY - a2.cartY, a1.cartZ - a2.cartZ];
      const v2 = [a3.cartX - a2.cartX, a3.cartY - a2.cartY, a3.cartZ - a2.cartZ];
      const n1 = Math.hypot(...v1) || 1, n2 = Math.hypot(...v2) || 1;
      const cosA = Math.max(-1, Math.min(1, (v1[0]*v2[0] + v1[1]*v2[1] + v1[2]*v2[2]) / (n1 * n2)));
      const deg = Math.acos(cosA) * 180 / Math.PI;
      v3.angleMeasurements.push({
        label1: a1.label, label2: a2.label, label3: a3.label,
        c1: [a1.cartX, a1.cartY, a1.cartZ],
        c2: [a2.cartX, a2.cartY, a2.cartZ],
        c3: [a3.cartX, a3.cartY, a3.cartZ],
        angleDeg: deg
      });
      v3.measureBuffer = [];
      if (typeof showToast === "function") {
        showToast(`📐 Bond Angle θ(${a1.label}–${a2.label}–${a3.label}) = ${deg.toFixed(2)}°`, "success");
      }
    }
    if (baseIdx !== undefined) v3.selectedAtomIndices.add(baseIdx);
    renderCastep3DScene();
    updateVestaOutputConsole();
    updateCastep3DSelectionHud();
    return;
  }

  // Default (Rotate / Select): single-click selects 1 atom (replacing previous), Shift+Click toggles multi-select
  if (baseIdx !== undefined) {
    const sel = v3.selectedAtomIndices;
    if (isMultiKey) {
      if (sel.has(baseIdx)) sel.delete(baseIdx);
      else sel.add(baseIdx);
    } else {
      if (sel.size === 1 && sel.has(baseIdx)) {
        sel.clear();
        v3.lastClickedAtomLog = null;
      } else {
        sel.clear();
        sel.add(baseIdx);
      }
    }
    renderCastep3DScene();
    renderCastepAtomsTable();
    updateVestaOutputConsole();
    updateCastep3DSelectionHud();
  }
}

function setVestaInteractionTool(toolName, btnEl) {
  const v3 = CASTEP_STUDIO_STATE.view3D;
  v3.activeTool = toolName || "rotate";
  v3.measureBuffer = [];
  if (v3.marquee) v3.marquee.active = false;
  document.querySelectorAll(".vesta-vtool-btn, .vesta-toolstrip-btn").forEach(b => b.classList.remove("active"));
  const btn = btnEl || document.getElementById(`vesta-tool-${toolName}`);
  if (btn) btn.classList.add("active");
  const toolNames = {
    rotate: "Rotate",
    select: "Box Select",
    pan: "Pan View",
    zoom: "Zoom",
    distance: "Distance d(i–j)",
    angle: "Angle θ(i–j–k)",
    adsorb: "Click-to-Adsorb",
    delete: "Delete Atom"
  };
  const badge = document.getElementById("vesta-active-tool-badge");
  if (badge) badge.textContent = `Tool: ${toolNames[v3.activeTool] || v3.activeTool}`;
  const canvas = document.getElementById("castep-3d-canvas");
  if (canvas) {
    canvas.style.cursor = toolName === "pan" ? "move" : (toolName === "rotate" ? "grab" : "crosshair");
  }
  updateCastep3DSelectionHud();
}
window.setVestaInteractionTool = setVestaInteractionTool;

function clearVestaMeasurementsAndSelection() {
  const v3 = CASTEP_STUDIO_STATE.view3D;
  v3.selectedAtomIndices.clear();
  v3.distanceMeasurements = [];
  v3.angleMeasurements = [];
  v3.measureBuffer = [];
  v3.lastClickedAtomLog = null;
  renderCastep3DScene();
  renderCastepAtomsTable();
  updateVestaOutputConsole();
  updateCastep3DSelectionHud();
}
window.clearVestaMeasurementsAndSelection = clearVestaMeasurementsAndSelection;

function switchVestaSideTab(tabKey, btnEl) {
  document.querySelectorAll(".vesta-dock-tab").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".vesta-dock-pane").forEach(p => p.classList.remove("active"));
  const btn = btnEl || document.querySelector(`.vesta-dock-tab[data-dock="${tabKey}"], .vesta-dock-tab[data-vtab="${tabKey}"]`);
  if (btn) btn.classList.add("active");
  const pane = document.getElementById(`vesta-dock-${tabKey}`);
  if (pane) pane.classList.add("active");
  if (tabKey === "objects") renderVestaObjectsTab();
}
window.switchVestaSideTab = switchVestaSideTab;
window.switchVestaDockTab = switchVestaSideTab;

function switchVestaConsoleTab(tabKey, btnEl) {
  const key = tabKey === "summary" ? "coords" : tabKey;
  document.querySelectorAll(".vesta-btab, .vesta-console-tab").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".vesta-bottom-pane, .vesta-console-pane").forEach(p => p.classList.remove("active"));
  const btn = btnEl || document.querySelector(`.vesta-btab[data-bpane="${key}"]`);
  if (btn) btn.classList.add("active");
  const pane = document.getElementById(`vesta-bottom-pane-${key}`) || document.getElementById(`vesta-console-${key}`);
  if (pane) pane.classList.add("active");
}
window.switchVestaConsoleTab = switchVestaConsoleTab;
window.switchVestaBottomPane = switchVestaConsoleTab;

function setCastep3DView(preset, skipRender = false) {
  const v3 = CASTEP_STUDIO_STATE.view3D;
  const st = CASTEP_STUDIO_STATE.structure;
  const vecs = st.vectors || castepParamsToVectors(st.lattice.a, st.lattice.b, st.lattice.c, st.lattice.alpha, st.lattice.beta, st.lattice.gamma);
  const p = String(preset || "a");
  v3.currentAxisPreset = p;
  v3.rotMatrix = computeVestaOrientationMatrix(p, vecs);
  v3.panX = 0;
  v3.panY = 0;

  // Highlight active axis button in VESTA toolbar
  document.querySelectorAll(".vesta-ax-btn").forEach(btn => {
    const oc = btn.getAttribute("onclick") || "";
    btn.classList.toggle("active", oc.includes(`'${p}'`));
  });

  if (!skipRender) renderCastep3DScene();
}
window.setCastep3DView = setCastep3DView;

function vestaStepRotate(axisOrDir, maybeDir) {
  const stepDeg = parseFloat(document.getElementById("vesta-rot-step-input")?.value || document.getElementById("vesta-rot-step-deg")?.value || "45.0") || 45.0;
  let axis = "x", dir = 1;
  if (maybeDir !== undefined) {
    axis = axisOrDir; dir = maybeDir;
  } else {
    const m = String(axisOrDir).toLowerCase();
    if (m === "up") { axis = "x"; dir = -1; }
    else if (m === "down") { axis = "x"; dir = 1; }
    else if (m === "left") { axis = "y"; dir = -1; }
    else if (m === "right") { axis = "y"; dir = 1; }
    else if (m === "ccw") { axis = "z"; dir = 1; }
    else if (m === "cw") { axis = "z"; dir = -1; }
  }
  const delta = vestaRotScreenAxisMatrix(axis, dir * stepDeg);
  CASTEP_STUDIO_STATE.view3D.rotMatrix = vestaMatMul3x3(delta, CASTEP_STUDIO_STATE.view3D.rotMatrix);
  renderCastep3DScene();
}
window.vestaStepRotate = vestaStepRotate;

function vestaStepPan(dxSign, dySign) {
  const stepPx = parseFloat(document.getElementById("vesta-pan-step-input")?.value || document.getElementById("vesta-pan-step-px")?.value || "15") || 15;
  CASTEP_STUDIO_STATE.view3D.panX += dxSign * stepPx;
  CASTEP_STUDIO_STATE.view3D.panY += dySign * stepPx;
  renderCastep3DScene();
}
window.vestaStepPan = vestaStepPan;

function vestaStepZoom(dir) {
  const stepPct = parseFloat(document.getElementById("vesta-zoom-step-input")?.value || document.getElementById("vesta-zoom-step-pct")?.value || "15") || 15;
  const factor = dir > 0 ? (1 + stepPct / 100.0) : (1 / (1 + stepPct / 100.0));
  CASTEP_STUDIO_STATE.view3D.scale = Math.max(0.25, Math.min(6.0, CASTEP_STUDIO_STATE.view3D.scale * factor));
  renderCastep3DScene();
}
window.vestaStepZoom = vestaStepZoom;

function vestaFitToScreen() {
  CASTEP_STUDIO_STATE.view3D.scale = 1.0;
  CASTEP_STUDIO_STATE.view3D.panX = 0;
  CASTEP_STUDIO_STATE.view3D.panY = 0;
  CASTEP_STUDIO_STATE.view3D._fitScaleKey = "";
  renderCastep3DScene();
}
window.vestaFitToScreen = vestaFitToScreen;

function setVestaRenderStyle(styleName) {
  CASTEP_STUDIO_STATE.view3D.style = styleName || "ball-stick";
  document.querySelectorAll('input[name="vesta-model-style"], input[name="vesta-render-style"]').forEach(r => {
    r.checked = (r.value === styleName) || (r.getAttribute("onchange") || "").includes(`'${styleName}'`);
  });
  renderCastep3DScene();
  updateVestaOutputConsole();
}
window.setVestaRenderStyle = setVestaRenderStyle;
window.setVestaModelStyle = setVestaRenderStyle;

function syncVestaScaleControls(skipAtomNum = false, skipBondNum = false) {
  const v3 = CASTEP_STUDIO_STATE.view3D;
  const aVal = Math.max(0.2, Math.min(2.0, Number(v3.atomScale) || 1.0));
  const bVal = Math.max(0.2, Math.min(2.0, Number(v3.bondWidthScale) || 1.0));

  const aSlider = document.getElementById("vesta-atom-scale-slider");
  if (aSlider) aSlider.value = aVal.toFixed(2);
  const aNum = document.getElementById("vesta-atom-scale-num");
  if (aNum && !skipAtomNum) aNum.value = aVal.toFixed(2);
  document.querySelectorAll("#vesta-atom-scale-ticks .vesta-tick-btn").forEach(btn => {
    const tv = parseFloat(btn.dataset.val);
    btn.classList.toggle("active", isFinite(tv) && Math.abs(tv - aVal) < 0.015);
  });

  const bSlider = document.getElementById("vesta-bond-scale-slider");
  if (bSlider) bSlider.value = bVal.toFixed(2);
  const bNum = document.getElementById("vesta-bond-scale-num");
  if (bNum && !skipBondNum) bNum.value = bVal.toFixed(2);
  document.querySelectorAll("#vesta-bond-scale-ticks .vesta-tick-btn").forEach(btn => {
    const tv = parseFloat(btn.dataset.val);
    btn.classList.toggle("active", isFinite(tv) && Math.abs(tv - bVal) < 0.015);
  });
}
window.syncVestaScaleControls = syncVestaScaleControls;

function setVestaProperty(propKey, val, commitFormat = true, source = "") {
  const numVal = parseFloat(val);
  const v3 = CASTEP_STUDIO_STATE.view3D;
  if (propKey === "atomScale") {
    if (!isFinite(numVal)) {
      if (commitFormat) syncVestaScaleControls();
      return;
    }
    const clamped = Math.max(0.2, Math.min(2.0, Math.round(numVal * 100) / 100));
    v3.atomScale = clamped;
    try { localStorage.setItem("castep_3d_atom_scale", clamped.toFixed(2)); } catch (e) {}
    syncVestaScaleControls(source === "num" && !commitFormat, false);
  } else if (propKey === "bondScale" || propKey === "bondWidthScale") {
    if (!isFinite(numVal)) {
      if (commitFormat) syncVestaScaleControls();
      return;
    }
    const clamped = Math.max(0.2, Math.min(2.0, Math.round(numVal * 100) / 100));
    v3.bondWidthScale = clamped;
    try { localStorage.setItem("castep_3d_bond_scale", clamped.toFixed(2)); } catch (e) {}
    syncVestaScaleControls(false, source === "num" && !commitFormat);
  } else if (propKey === "bondFactor" || propKey === "bondCutoffFactor") {
    v3.bondCutoffFactor = isNaN(numVal) ? 1.15 : Math.max(0.8, Math.min(1.6, numVal));
  } else if (propKey === "bondColorMode") {
    v3.bondColorMode = (val === "uniform") ? "uniform" : "bicolor";
  } else {
    v3[propKey] = val;
  }
  renderCastep3DScene();
  updateVestaOutputConsole();
}
window.setVestaProperty = setVestaProperty;
window.setVestaRenderProperty = setVestaProperty;

function setCastepBoundaryDisplayMode(mode) {
  const v3 = CASTEP_STUDIO_STATE.view3D;
  const cleanMode = (mode === "in-cell" || mode === "asymmetric") ? mode : "complete";
  v3.boundaryMode = cleanMode;
  v3.showBoundaryBonds = (cleanMode === "complete");
  const sel = document.getElementById("vesta-boundary-mode-select");
  if (sel) sel.value = cleanMode;
  renderCastep3DScene();
  updateVestaOutputConsole();
}
window.setCastepBoundaryDisplayMode = setCastepBoundaryDisplayMode;

function setVestaBackgroundTheme(themeVal) {
  CASTEP_STUDIO_STATE.view3D.theme = themeVal === "dark" ? "dark" : "white";
  const wrap = document.getElementById("castep-3d-container");
  if (wrap) wrap.style.background = CASTEP_STUDIO_STATE.view3D.theme === "white" ? "#ffffff" : "#0b1120";
  const sel = document.getElementById("vesta-bg-select");
  if (sel) sel.value = CASTEP_STUDIO_STATE.view3D.theme;
  renderCastep3DScene();
}
window.setVestaBackgroundTheme = setVestaBackgroundTheme;

function setVestaBoundaryPreset(xmin, xmax, ymin, ymax, zmin, zmax) {
  const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  setVal("vesta-bnd-xmin", xmin); setVal("vesta-bnd-xmax", xmax);
  setVal("vesta-bnd-ymin", ymin); setVal("vesta-bnd-ymax", ymax);
  setVal("vesta-bnd-zmin", zmin); setVal("vesta-bnd-zmax", zmax);
  applyVestaBoundaryRange();
}
window.setVestaBoundaryPreset = setVestaBoundaryPreset;

function applyVestaBoundaryRange() {
  const getNum = (id, d) => {
    const v = parseFloat(document.getElementById(id)?.value);
    return isNaN(v) ? d : v;
  };
  CASTEP_STUDIO_STATE.view3D.boundary = {
    xmin: getNum("vesta-bnd-xmin", 0.0),
    xmax: getNum("vesta-bnd-xmax", 1.0),
    ymin: getNum("vesta-bnd-ymin", 0.0),
    ymax: getNum("vesta-bnd-ymax", 1.0),
    zmin: getNum("vesta-bnd-zmin", 0.0),
    zmax: getNum("vesta-bnd-zmax", 1.0)
  };
  renderCastep3DScene();
  updateVestaOutputConsole();
}
window.applyVestaBoundaryRange = applyVestaBoundaryRange;

function toggleCastep3DOption(key, explicitVal) {
  const v3 = CASTEP_STUDIO_STATE.view3D;
  v3[key] = explicitVal !== undefined ? Boolean(explicitVal) : !v3[key];
  const chkMap = {
    showBonds: "vesta-chk-bonds",
    showBox: "vesta-chk-box",
    showLabels: "vesta-chk-labels",
    showAdsorptionSites: "vesta-chk-sites",
    showForces: "vesta-chk-forces"
  };
  const chk = document.getElementById(chkMap[key]);
  if (chk) chk.checked = Boolean(v3[key]);
  renderCastep3DScene();
}
window.toggleCastep3DOption = toggleCastep3DOption;

function cycleCastep3DStyle() {
  const styles = ["ball-stick", "space-fill", "polyhedral", "wireframe", "stick"];
  const idx = styles.indexOf(CASTEP_STUDIO_STATE.view3D.style);
  setVestaRenderStyle(styles[(idx + 1) % styles.length]);
}
window.cycleCastep3DStyle = cycleCastep3DStyle;

function toggleCastep3DTheme() {
  const next = CASTEP_STUDIO_STATE.view3D.theme === "white" ? "dark" : "white";
  setVestaBackgroundTheme(next);
}
window.toggleCastep3DTheme = toggleCastep3DTheme;

function renderVestaObjectsTab() {
  const container = document.getElementById("vesta-objects-elements-list");
  if (!container) return;
  const st = CASTEP_STUDIO_STATE.structure;
  const v3 = CASTEP_STUDIO_STATE.view3D;
  const counts = {};
  (st.atoms || []).forEach(a => {
    const el = castepCleanElement(a.element);
    counts[el] = (counts[el] || 0) + 1;
  });
  const els = Object.keys(counts);
  if (!els.length) {
    container.innerHTML = `<div style="color:#64748b; font-size:11px;">No elements loaded.</div>`;
    return;
  }
  container.innerHTML = els.map(el => {
    const col = getVestaElementColor(el);
    const covR = (typeof COVALENT_RADII !== "undefined" && COVALENT_RADII[el]) || 1.20;
    const visible = !v3.hiddenElements.has(el);
    return `
      <div style="display:flex; align-items:center; justify-content:space-between; gap:6px; padding:4px 6px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:4px;">
        <label style="display:flex; align-items:center; gap:6px; font-weight:700; color:#0f172a; cursor:pointer; margin:0;">
          <input type="checkbox" ${visible ? "checked" : ""} onchange="toggleVestaElementVisibility('${el}', this.checked)" />
          <span style="width:12px; height:12px; border-radius:50%; background:${col}; display:inline-block; border:1px solid rgba(0,0,0,0.25);"></span>
          <span>${escapeHtml(el)}</span>
          <span style="color:#64748b; font-weight:500; font-size:10.5px;">(${counts[el]} atoms, r=${covR.toFixed(2)}Å)</span>
        </label>
        <input type="color" value="${col}" style="width:24px; height:20px; border:none; padding:0; background:transparent; cursor:pointer;" onchange="setVestaElementCustomColor('${el}', this.value)" title="Customize ${el} Atomic Color" />
      </div>
    `;
  }).join("");
}
window.renderVestaObjectsTab = renderVestaObjectsTab;

function toggleVestaElementVisibility(el, visible) {
  if (visible) CASTEP_STUDIO_STATE.view3D.hiddenElements.delete(el);
  else CASTEP_STUDIO_STATE.view3D.hiddenElements.add(el);
  renderCastep3DScene();
}
window.toggleVestaElementVisibility = toggleVestaElementVisibility;

function setVestaElementCustomColor(el, hexColor) {
  CASTEP_STUDIO_STATE.view3D.customElementColors[el] = hexColor;
  renderVestaObjectsTab();
  renderCastep3DScene();
  renderCastepAtomsTable();
}
window.setVestaElementCustomColor = setVestaElementCustomColor;

function updateCastep3DSelectionHud() {
  const hud = document.getElementById("castep-3d-selection-hud");
  if (!hud) return;
  const v3 = CASTEP_STUDIO_STATE.view3D;
  const sel = Array.from(v3.selectedAtomIndices);
  const atoms = CASTEP_STUDIO_STATE.structure.atoms || [];
  const vecs = CASTEP_STUDIO_STATE.structure.vectors;

  if (v3.activeTool === "distance") {
    const n = v3.measureBuffer.length;
    hud.innerHTML = `📏 <strong>Distance Tool:</strong> ${n === 0 ? "Click 1st atom" : `1st: <strong>${v3.measureBuffer[0].label}</strong> → Click 2nd atom`} (${v3.distanceMeasurements.length} measured)`;
    return;
  }
  if (v3.activeTool === "angle") {
    const n = v3.measureBuffer.length;
    hud.innerHTML = `📐 <strong>Bond Angle Tool:</strong> ${n === 0 ? "Click 1st atom" : (n === 1 ? `1st: <strong>${v3.measureBuffer[0].label}</strong> → Click vertex (2nd) atom` : `Click 3rd atom`)} (${v3.angleMeasurements.length} measured)`;
    return;
  }
  if (v3.activeTool === "adsorb") {
    const sp = document.getElementById("castep-ads-species")?.value || "H";
    hud.innerHTML = `🎯 <strong>Click-to-Adsorb Mode:</strong> Click any surface atom to place <strong>${escapeHtml(sp)}</strong> above it`;
    return;
  }
  if (v3.activeTool === "delete") {
    hud.innerHTML = `🗑️ <strong>Click-to-Delete Mode:</strong> Click any atom in 3D view to create a vacancy defect`;
    return;
  }

  if (sel.length === 0) {
    if (v3.activeTool === "select") {
      hud.innerHTML = `⬚ <strong>Box Select:</strong> Drag box to multi-select • Click 1 atom • Shift+Click/Drag to add`;
      return;
    }
    hud.innerHTML = `View: <strong>${escapeHtml(v3.currentAxisPreset || "a")}</strong> • <strong>${v3.lastStats.atomsCount || atoms.length}</strong> atoms, <strong>${v3.lastStats.bondsCount || 0}</strong> bonds`;
    return;
  }
  if (sel.length === 1) {
    const a = atoms[sel[0]];
    if (!a) return;
    const [cx, cy, cz] = castepFracToCart(a.x, a.y, a.z, vecs);
    hud.innerHTML = `Selected <strong>#${sel[0]+1} ${escapeHtml(a.label || a.element)}</strong> (${a.x.toFixed(4)}, ${a.y.toFixed(4)}, ${a.z.toFixed(4)}) • (${cx.toFixed(2)}, ${cy.toFixed(2)}, ${cz.toFixed(2)} Å)`;
  } else if (sel.length === 2) {
    const a1 = atoms[sel[0]], a2 = atoms[sel[1]];
    if (!a1 || !a2) return;
    const c1 = castepFracToCart(a1.x, a1.y, a1.z, vecs);
    const c2 = castepFracToCart(a2.x, a2.y, a2.z, vecs);
    const dist = Math.hypot(c1[0]-c2[0], c1[1]-c2[1], c1[2]-c2[2]);
    hud.innerHTML = `<strong>${a1.label} – ${a2.label}</strong> • Distance d = <strong>${dist.toFixed(4)} Å</strong>`;
  } else if (sel.length === 3) {
    const a1 = atoms[sel[0]], a2 = atoms[sel[1]], a3 = atoms[sel[2]];
    if (!a1 || !a2 || !a3) return;
    const c1 = castepFracToCart(a1.x, a1.y, a1.z, vecs);
    const c2 = castepFracToCart(a2.x, a2.y, a2.z, vecs);
    const c3 = castepFracToCart(a3.x, a3.y, a3.z, vecs);
    const v1 = [c1[0]-c2[0], c1[1]-c2[1], c1[2]-c2[2]];
    const v2 = [c3[0]-c2[0], c3[1]-c2[1], c3[2]-c2[2]];
    const n1 = Math.hypot(...v1) || 1, n2 = Math.hypot(...v2) || 1;
    const cosA = Math.max(-1, Math.min(1, (v1[0]*v2[0]+v1[1]*v2[1]+v1[2]*v2[2])/(n1*n2)));
    const ang = (Math.acos(cosA) * 180 / Math.PI).toFixed(2);
    hud.innerHTML = `<strong>${a1.label}–${a2.label}–${a3.label}</strong> • Angle θ = <strong>${ang}°</strong>`;
  } else {
    hud.innerHTML = `<strong>${sel.length} atoms selected</strong>`;
  }
}

function updateVestaOutputConsole() {
  const logEl = document.getElementById("vesta-log-output-pre") || document.getElementById("castep-vesta-output-log");
  if (!logEl) return;
  const st = CASTEP_STUDIO_STATE.structure;
  const v3 = CASTEP_STUDIO_STATE.view3D;
  const lat = st.lattice || { a: 6.594, b: 6.594, c: 25.151, alpha: 90, beta: 90, gamma: 120 };
  const stats = v3.lastStats || { atomsCount: (st.atoms || []).length, unitCellAtoms: (st.atoms || []).length, bondsCount: 0, polyCount: 0, cpuMs: 1 };

  const lines = [];
  if (v3.lastClickedAtomLog) {
    const c = v3.lastClickedAtomLog;
    lines.push(
      `  ${String(c.number).padStart(3, " ")} ${c.element.padEnd(3, " ")} ${c.label.padEnd(8, " ")} ` +
      `${Number(c.u).toFixed(5).padStart(9, " ")} ${Number(c.v).toFixed(5).padStart(9, " ")} ${Number(c.w).toFixed(5).padStart(9, " ")}   1.000   ` +
      `(${c.cartX.toFixed(3)}, ${c.cartY.toFixed(3)}, ${c.cartZ.toFixed(3)} Å)${c.isBoundaryImage ? " [Boundary Bonded]" : ""}`
    );
  } else if (st.atoms && st.atoms.length > 0) {
    const a0 = st.atoms[0];
    lines.push(
      `    1 ${a0.element.padEnd(3, " ")} ${(a0.label || a0.element + "1").padEnd(8, " ")} ` +
      `${Number(a0.x).toFixed(5).padStart(9, " ")} ${Number(a0.y).toFixed(5).padStart(9, " ")} ${Number(a0.z).toFixed(5).padStart(9, " ")}   1.000   0.000   1a       1`
    );
  }

  v3.distanceMeasurements.forEach((m, i) => {
    lines.push(`  [Distance #${i+1}] d(${m.label1} — ${m.label2}) = ${m.distA.toFixed(5)} Å`);
  });
  v3.angleMeasurements.forEach((m, i) => {
    lines.push(`  [Angle #${i+1}]    θ(${m.label1} — ${m.label2} — ${m.label3}) = ${m.angleDeg.toFixed(3)}°`);
  });

  lines.push("--------------------------------------------------------------------------------");
  const volVal = st.vectors ? castepCellVolume(st.vectors) : 0;
  const asymCount = Array.isArray(st.asymmetricAtoms) && st.symmetryIntact ? st.asymmetricAtoms.length : 0;
  const symOpsCount = Array.isArray(st.symops) && st.symmetryIntact ? st.symops.length : 1;
  lines.push(
    `Lattice: a = ${Number(lat.a).toFixed(5)} Å, b = ${Number(lat.b).toFixed(5)} Å, c = ${Number(lat.c).toFixed(5)} Å, ` +
    `α = ${Number(lat.alpha).toFixed(2)}°, β = ${Number(lat.beta).toFixed(2)}°, γ = ${Number(lat.gamma).toFixed(2)}° • V = ${volVal.toFixed(3)} Å³`
  );
  lines.push(
    `Symmetry: ${st.spaceGroup || "P 1 (1)"} • ${st.crystalSystem || "Triclinic"}` +
    (st.hallSymbol ? ` • Hall: ${st.hallSymbol}` : "") +
    ` • SymOps: ${symOpsCount}` +
    (asymCount ? ` • Asymmetric sites: ${asymCount}` : "") +
    (st.formulaUnitsZ ? ` • Z = ${st.formulaUnitsZ}` : "")
  );
  lines.push(
    `${stats.atomsCount} displayed atoms (${stats.unitCellAtoms} in unit cell + ${Math.max(0, stats.atomsCount - stats.unitCellAtoms)} boundary-bonded), ` +
    `${stats.bondsCount} bonds, ${stats.polyCount} polyhedra; CPU time = ${stats.cpuMs} ms`
  );
  logEl.textContent = lines.join("\n");
  const sumLine = document.getElementById("vesta-status-summary-line");
  if (sumLine) sumLine.textContent = `${stats.atomsCount} atoms, ${stats.bondsCount} bonds, ${stats.polyCount} polyhedra; CPU time = ${stats.cpuMs} ms`;
}
window.updateVestaOutputConsole = updateVestaOutputConsole;

function drawVestaAxisTriad(ctx, width, height, vecs, R, isWhite) {
  const ox = 86;
  const oy = height - 64;
  const axisLen = 46;
  const [aVec, bVec, cVec] = vecs;
  const axes = [
    { label: "a", unit: vestaVecNorm(aVec), color: "#dc2626", dark: "#7f1d1d" },
    { label: "b", unit: vestaVecNorm(bVec), color: "#16a34a", dark: "#14532d" },
    { label: "c", unit: vestaVecNorm(cVec), color: "#2563eb", dark: "#1e3a8a" }
  ].map(ax => {
    const u = ax.unit;
    const rx = R[0][0]*u[0] + R[0][1]*u[1] + R[0][2]*u[2];
    const ry = R[1][0]*u[0] + R[1][1]*u[1] + R[1][2]*u[2];
    const rz = R[2][0]*u[0] + R[2][1]*u[1] + R[2][2]*u[2];
    return { ...ax, rx, ry, rz };
  });

  // Sort back-to-front by rz
  axes.sort((p, q) => p.rz - q.rz);

  axes.forEach(ax => {
    const tx = ox + ax.rx * axisLen;
    const ty = oy - ax.ry * axisLen;
    const projLen = Math.hypot(tx - ox, ty - oy);

    if (projLen < 7.5) {
      // Axis points almost straight at viewer (or away): draw VESTA 3D origin cap circle with label inside
      const grad = ctx.createRadialGradient(ox - 2, oy - 2, 1, ox, oy, 7.5);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.45, ax.color);
      grad.addColorStop(1, ax.dark);
      ctx.beginPath();
      ctx.arc(ox, oy, 7.2, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = "#1e293b";
      ctx.stroke();

      ctx.font = "bold 11.5px Arial, sans-serif";
      ctx.fillStyle = isWhite ? "#0f172a" : "#f8fafc";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(ax.label, ox, oy);
    } else {
      const ang = Math.atan2(ty - oy, tx - ox);
      const headLen = 12.5;
      const headHalfW = 5.6;
      const shaftEndX = tx - Math.cos(ang) * (headLen * 0.72);
      const shaftEndY = ty - Math.sin(ang) * (headLen * 0.72);

      // 3D cylindrical shaft (dark border + colored body + highlight core)
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(shaftEndX, shaftEndY);
      ctx.strokeStyle = ax.dark;
      ctx.lineWidth = 5.4;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(shaftEndX, shaftEndY);
      ctx.strokeStyle = ax.color;
      ctx.lineWidth = 3.8;
      ctx.stroke();

      // 3D conical arrowhead
      const bx = tx - Math.cos(ang) * headLen;
      const by = ty - Math.sin(ang) * headLen;
      const px = -Math.sin(ang) * headHalfW;
      const py = Math.cos(ang) * headHalfW;

      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(bx + px, by + py);
      ctx.lineTo(bx - px, by - py);
      ctx.closePath();
      ctx.fillStyle = ax.color;
      ctx.fill();
      ctx.lineWidth = 1.0;
      ctx.strokeStyle = ax.dark;
      ctx.stroke();

      // Bold black VESTA axis label (a, b, c)
      const lx = tx + Math.cos(ang) * 12;
      const ly = ty + Math.sin(ang) * 12;
      ctx.font = "bold 13px Arial, sans-serif";
      ctx.fillStyle = isWhite ? "#0f172a" : "#f8fafc";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(ax.label, lx, ly);
    }
  });
}

const _VESTA_SPHERE_SPRITE_CACHE = new Map();

function getCachedSphereSprite(colorHex, isFixed) {
  const key = `v124_${colorHex}_${isFixed ? 1 : 0}`;
  if (_VESTA_SPHERE_SPRITE_CACHE.has(key)) return _VESTA_SPHERE_SPRITE_CACHE.get(key);
  const sz = 96;
  const off = document.createElement("canvas");
  off.width = sz;
  off.height = sz;
  const octx = off.getContext("2d");
  const r = 42;
  const cx = 48, cy = 48;

  // Materials Studio / crystallographic glossy Phong sphere shading
  const lightCol = typeof lightenColor === "function" ? lightenColor(colorHex, 0.44) : colorHex;
  const midDark  = typeof darkenColor === "function" ? darkenColor(colorHex, 0.24) : colorHex;
  const deepDark = typeof darkenColor === "function" ? darkenColor(colorHex, 0.48) : "#0f172a";

  const grad = octx.createRadialGradient(cx - r * 0.34, cy - r * 0.34, r * 0.05, cx, cy, r);
  grad.addColorStop(0.00, "#ffffff");
  grad.addColorStop(0.16, lightCol);
  grad.addColorStop(0.56, colorHex);
  grad.addColorStop(0.86, midDark);
  grad.addColorStop(1.00, deepDark);

  octx.beginPath();
  octx.arc(cx, cy, r, 0, Math.PI * 2);
  octx.fillStyle = grad;
  octx.fill();

  // Subtle rim reflection on lower-right hemisphere for depth readability
  const rimGrad = octx.createRadialGradient(cx + r * 0.32, cy + r * 0.36, r * 0.1, cx, cy, r);
  rimGrad.addColorStop(0.0, "rgba(255, 255, 255, 0.14)");
  rimGrad.addColorStop(0.55, "rgba(255, 255, 255, 0.0)");
  rimGrad.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");
  octx.beginPath();
  octx.arc(cx, cy, r, 0, Math.PI * 2);
  octx.fillStyle = rimGrad;
  octx.fill();

  // Crisp subtle contour outline so spheres remain distinct against white or dark backgrounds
  octx.beginPath();
  octx.arc(cx, cy, r, 0, Math.PI * 2);
  octx.lineWidth = isFixed ? 4.4 : 1.9;
  octx.strokeStyle = isFixed ? "#ea580c" : "rgba(15, 23, 42, 0.48)";
  octx.stroke();

  _VESTA_SPHERE_SPRITE_CACHE.set(key, off);
  return off;
}

function drawShadedHalfBondCylinder(ctx, x1, y1, x2, y2, halfWidth, colorHex, isWhite, roundCapAtStart = false) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 0.6 || halfWidth < 0.4) return;

  const ux = dx / len, uy = dy / len;
  const nx = -uy, ny = ux;
  const mx = (x1 + x2) * 0.5, my = (y1 + y2) * 0.5;

  // Perpendicular 3D cylindrical Phong lighting gradient across the stick diameter
  const lightBand = typeof lightenColor === "function" ? lightenColor(colorHex, 0.52) : "#ffffff";
  const darkEdge  = typeof darkenColor === "function" ? darkenColor(colorHex, 0.38) : "#1e293b";
  const deepEdge  = typeof darkenColor === "function" ? darkenColor(colorHex, 0.52) : "#0f172a";

  // Align specular highlight consistently toward upper-left light vector (-0.707, -0.707)
  const flip = (nx * -0.707 + ny * -0.707) < 0 ? -1 : 1;
  const gnx = nx * flip, gny = ny * flip;

  const grad = ctx.createLinearGradient(
    mx + gnx * halfWidth, my + gny * halfWidth,
    mx - gnx * halfWidth, my - gny * halfWidth
  );
  grad.addColorStop(0.00, darkEdge);
  grad.addColorStop(0.26, lightBand);
  grad.addColorStop(0.54, colorHex);
  grad.addColorStop(0.86, darkEdge);
  grad.addColorStop(1.00, deepEdge);

  // Slight 0.6px overlap at bond midpoint prevents hairline seam between half-cylinders
  const ex = x2 + ux * 0.55;
  const ey = y2 + uy * 0.55;

  ctx.beginPath();
  ctx.moveTo(x1 - nx * halfWidth, y1 - ny * halfWidth);
  ctx.lineTo(ex - nx * halfWidth, ey - ny * halfWidth);
  ctx.lineTo(ex + nx * halfWidth, ey + ny * halfWidth);
  ctx.lineTo(x1 + nx * halfWidth, y1 + ny * halfWidth);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  if (roundCapAtStart) {
    ctx.beginPath();
    ctx.arc(x1, y1, halfWidth, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  // Subtle side-edge contour strokes (left and right silhouette of cylinder only — no line across midpoint seam!)
  ctx.beginPath();
  ctx.moveTo(x1 - nx * halfWidth, y1 - ny * halfWidth);
  ctx.lineTo(ex - nx * halfWidth, ey - ny * halfWidth);
  ctx.moveTo(x1 + nx * halfWidth, y1 + ny * halfWidth);
  ctx.lineTo(ex + nx * halfWidth, ey + ny * halfWidth);
  ctx.strokeStyle = isWhite ? "rgba(15, 23, 42, 0.34)" : "rgba(0, 0, 0, 0.55)";
  ctx.lineWidth = 0.75;
  ctx.stroke();
}

function scheduleCastep3DRender() {
  const v3 = CASTEP_STUDIO_STATE.view3D;
  if (v3._rafPending) return;
  v3._rafPending = true;
  requestAnimationFrame(() => {
    v3._rafPending = false;
    renderCastep3DScene();
  });
}
window.scheduleCastep3DRender = scheduleCastep3DRender;

function getOrBuildCastep3DTopology(st, vecs, v3) {
  const baseAtoms = st.atoms || [];
  const bnd = v3.boundary || { xmin: 0, xmax: 1, ymin: 0, ymax: 1, zmin: 0, zmax: 1 };
  const bMode = v3.boundaryMode || (v3.showBoundaryBonds === false ? "in-cell" : "complete");
  const firstAt = baseAtoms[0] ? `${baseAtoms[0].element}_${baseAtoms[0].x.toFixed(4)}_${baseAtoms[0].z.toFixed(4)}` : "0";
  const lastAt = baseAtoms.length ? `${baseAtoms[baseAtoms.length-1].element}_${baseAtoms[baseAtoms.length-1].x.toFixed(4)}_${baseAtoms[baseAtoms.length-1].z.toFixed(4)}` : "0";
  const key = [
    CASTEP_STUDIO_STATE.activeJobId,
    st.formula,
    baseAtoms.length,
    firstAt,
    lastAt,
    vecs[0][0].toFixed(3), vecs[1][1].toFixed(3), vecs[2][2].toFixed(3),
    bnd.xmin, bnd.xmax, bnd.ymin, bnd.ymax, bnd.zmin, bnd.zmax,
    v3.showModels, bMode, v3.showBonds, v3.bondCutoffFactor, v3.style,
    Array.from(v3.hiddenElements).join(",")
  ].join("|");

  if (v3._topoCache && v3._topoCacheKey === key) {
    return v3._topoCache;
  }

  let expandedAtoms = [];
  const eps = 1.5e-3;
  const iMin = Math.floor(bnd.xmin - eps), iMax = Math.ceil(bnd.xmax + eps);
  const jMin = Math.floor(bnd.ymin - eps), jMax = Math.ceil(bnd.ymax + eps);
  const kMin = Math.floor(bnd.zmin - eps), kMax = Math.ceil(bnd.zmax + eps);
  const seenPosKeys = new Set();

  const elSet = new Set(baseAtoms.map(a => castepCleanElement(a.element)));
  const hasCations = baseAtoms.some(a => VESTA_CATION_SET.has(castepCleanElement(a.element)));
  const hasAnions = baseAtoms.some(a => VESTA_ANION_SET.has(castepCleanElement(a.element)));
  const hasBothCA = hasCations && hasAnions;
  const cutoffFactor = Number(v3.bondCutoffFactor) || 1.15;

  if (v3.showModels !== false) {
    if (bMode === "asymmetric") {
      // Raw input unit cell atoms only (zero periodic copies)
      baseAtoms.forEach((at, idx) => {
        const el = castepCleanElement(at.element);
        if (v3.hiddenElements.has(el)) return;
        const u = Number(at.x) || 0, v = Number(at.y) || 0, w = Number(at.z) || 0;
        const [cx, cy, cz] = castepFracToCart(u, v, w, vecs);
        expandedAtoms.push({
          atomIndex: idx,
          element: el,
          label: at.label || `${el}${idx+1}`,
          fixed: Boolean(at.fixed),
          fx: at.fx || 0, fy: at.fy || 0, fz: at.fz || 0,
          spin: at.spin || 0,
          fracU: u, fracV: v, fracW: w,
          cartX: cx, cartY: cy, cartZ: cz,
          inBox: true,
          isExternalBondAtom: false,
          isBoundaryImage: false
        });
      });
    } else {
      // Step 1: All atoms strictly inside [bnd.xmin..xmax] x [ymin..ymax] x [zmin..zmax]
      //         INCLUDING symmetric equivalents sitting on box faces/edges/corners (all marked inBox=true!)
      baseAtoms.forEach((at, idx) => {
        const el = castepCleanElement(at.element);
        if (v3.hiddenElements.has(el)) return;
        const u0 = Number(at.x) || 0, v0 = Number(at.y) || 0, w0 = Number(at.z) || 0;
        for (let da = iMin - 1; da <= iMax + 1; da++) {
          for (let db = jMin - 1; db <= jMax + 1; db++) {
            for (let dc = kMin - 1; dc <= kMax + 1; dc++) {
              const u = u0 + da, v = v0 + db, w = w0 + dc;
              if (u >= bnd.xmin - eps && u <= bnd.xmax + eps &&
                  v >= bnd.ymin - eps && v <= bnd.ymax + eps &&
                  w >= bnd.zmin - eps && w <= bnd.zmax + eps) {
                const pKey = `${el}_${Math.round(u * 500)}_${Math.round(v * 500)}_${Math.round(w * 500)}`;
                if (seenPosKeys.has(pKey)) continue;
                seenPosKeys.add(pKey);
                const [cx, cy, cz] = castepFracToCart(u, v, w, vecs);
                expandedAtoms.push({
                  atomIndex: idx,
                  element: el,
                  label: at.label || `${el}${idx+1}`,
                  fixed: Boolean(at.fixed),
                  fx: at.fx || 0, fy: at.fy || 0, fz: at.fz || 0,
                  spin: at.spin || 0,
                  fracU: u, fracV: v, fracW: w,
                  cartX: cx, cartY: cy, cartZ: cz,
                  inBox: true,
                  isExternalBondAtom: false,
                  isBoundaryImage: !(da === 0 && db === 0 && dc === 0)
                });
              }
            }
          }
        }
      });

      // Step 2: In "complete" mode, add ONLY direct 1st-neighbor bonded partners of inBox atoms
      //         so every boundary bond is cleanly completed without dangling fragments
      if (bMode === "complete" && expandedAtoms.length > 0 && expandedAtoms.length <= 260) {
        const inBoxCount = expandedAtoms.length;
        baseAtoms.forEach((at, idx) => {
          const el = castepCleanElement(at.element);
          if (v3.hiddenElements.has(el)) return;
          const u0 = Number(at.x) || 0, v0 = Number(at.y) || 0, w0 = Number(at.z) || 0;
          for (let da = iMin - 1; da <= iMax + 1; da++) {
            for (let db = jMin - 1; db <= jMax + 1; db++) {
              for (let dc = kMin - 1; dc <= kMax + 1; dc++) {
                const u = u0 + da, v = v0 + db, w = w0 + dc;
                const pKey = `${el}_${Math.round(u * 500)}_${Math.round(v * 500)}_${Math.round(w * 500)}`;
                if (seenPosKeys.has(pKey)) continue;
                const [cx, cy, cz] = castepFracToCart(u, v, w, vecs);
                let bondedToInBox = false;
                for (let m = 0; m < inBoxCount; m++) {
                  const inAt = expandedAtoms[m];
                  const dist = Math.hypot(cx - inAt.cartX, cy - inAt.cartY, cz - inAt.cartZ);
                  if (isVestaChemicalBond(inAt.element, el, dist, cutoffFactor, hasBothCA, elSet)) {
                    bondedToInBox = true;
                    break;
                  }
                }
                if (bondedToInBox) {
                  seenPosKeys.add(pKey);
                  expandedAtoms.push({
                    atomIndex: idx,
                    element: el,
                    label: at.label || `${el}${idx+1}`,
                    fixed: Boolean(at.fixed),
                    fx: 0, fy: 0, fz: 0,
                    spin: at.spin || 0,
                    fracU: u, fracV: v, fracW: w,
                    cartX: cx, cartY: cy, cartZ: cz,
                    inBox: false,
                    isExternalBondAtom: true,
                    isBoundaryImage: true
                  });
                }
              }
            }
          }
        });
      }
    }
  }

  // Step 3: Build ALL valid chemical bonds cleanly:
  //   - ALWAYS allow inBox <-> inBox (including symmetric face/edge/corner atoms!)
  //   - ALWAYS allow inBox <-> external 1st-neighbor bond atoms
  //   - ONLY skip external <-> external so outer shells never tangle
  let bondPairs = [];
  const adjList = new Map();

  if ((v3.showBonds || v3.style === "polyhedral" || v3.style === "wireframe" || v3.style === "stick") && v3.style !== "space-fill") {
    for (let i = 0; i < expandedAtoms.length; i++) {
      const a1 = expandedAtoms[i];
      for (let j = i + 1; j < expandedAtoms.length; j++) {
        const a2 = expandedAtoms[j];
        if (a1.isExternalBondAtom && a2.isExternalBondAtom) continue;
        const dist = Math.hypot(a1.cartX - a2.cartX, a1.cartY - a2.cartY, a1.cartZ - a2.cartZ);
        if (isVestaChemicalBond(a1.element, a2.element, dist, cutoffFactor, hasBothCA, elSet)) {
          bondPairs.push({ i, j, dist });
          if (!adjList.has(i)) adjList.set(i, []);
          if (!adjList.has(j)) adjList.set(j, []);
          adjList.get(i).push(j);
          adjList.get(j).push(i);
        }
      }
    }
  }

  // Orphan-Pruner Guarantee: NEVER leave a detached external atom floating unbonded!
  if (bMode === "complete" && expandedAtoms.some(a => a.isExternalBondAtom)) {
    const keepMap = new Map();
    const cleanedAtoms = [];
    expandedAtoms.forEach((a, oldIdx) => {
      if (a.isExternalBondAtom && !(adjList.get(oldIdx) && adjList.get(oldIdx).length > 0)) {
        return; // Drop unbonded external orphan
      }
      keepMap.set(oldIdx, cleanedAtoms.length);
      cleanedAtoms.push(a);
    });
    if (cleanedAtoms.length !== expandedAtoms.length) {
      expandedAtoms = cleanedAtoms;
      bondPairs = bondPairs
        .filter(bp => keepMap.has(bp.i) && keepMap.has(bp.j))
        .map(bp => ({ i: keepMap.get(bp.i), j: keepMap.get(bp.j), dist: bp.dist }));
      adjList.clear();
      bondPairs.forEach(bp => {
        if (!adjList.has(bp.i)) adjList.set(bp.i, []);
        if (!adjList.has(bp.j)) adjList.set(bp.j, []);
        adjList.get(bp.i).push(bp.j);
        adjList.get(bp.j).push(bp.i);
      });
    }
  }

  // Step 4: Build coordination polyhedra
  let polyCount = 0;
  const polyTriplets = [];
  expandedAtoms.forEach((centerAt, cIdx) => {
    const neighbors = adjList.get(cIdx) || [];
    if (VESTA_POLYHEDRAL_CENTERS.has(centerAt.element) && neighbors.length >= 3) {
      polyCount++;
      if (v3.style === "polyhedral") {
        for (let a = 0; a < neighbors.length; a++) {
          const i1 = neighbors[a], L1 = expandedAtoms[i1];
          for (let b = a + 1; b < neighbors.length; b++) {
            const i2 = neighbors[b], L2 = expandedAtoms[i2];
            const d12 = Math.hypot(L1.cartX - L2.cartX, L1.cartY - L2.cartY, L1.cartZ - L2.cartZ);
            for (let c = b + 1; c < neighbors.length; c++) {
              const i3 = neighbors[c], L3 = expandedAtoms[i3];
              const d13 = Math.hypot(L1.cartX - L3.cartX, L1.cartY - L3.cartY, L1.cartZ - L3.cartZ);
              const d23 = Math.hypot(L2.cartX - L3.cartX, L2.cartY - L3.cartY, L2.cartZ - L3.cartZ);
              if (d12 <= 4.4 && d13 <= 4.4 && d23 <= 4.4) {
                polyTriplets.push({ indices: [i1, i2, i3], centerIdx: cIdx, offsetZ: 0 });
              }
            }
          }
        }
      }
    }
  });

  v3._topoCacheKey = key;
  v3._topoCache = { expandedAtoms, bondPairs, polyTriplets, polyCount };
  // Trigger clean auto-fit recalculation when structure or boundary mode changes
  v3._fitScaleKey = "";
  return v3._topoCache;
}

function renderCastep3DScene() {
  const t0 = performance.now();
  const canvas = document.getElementById("castep-3d-canvas");
  if (!canvas || !canvas.parentElement) return;
  const width = canvas.parentElement.clientWidth || 720;
  const height = canvas.parentElement.clientHeight || 445;
  const dpr = getCastepCanvasDpr(width, height, true);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }
  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.scale(dpr, dpr);
  applyCrispCanvasQuality(ctx);

  const v3 = CASTEP_STUDIO_STATE.view3D;
  const isWhite = v3.theme !== "dark";
  ctx.fillStyle = isWhite ? "#ffffff" : "#0b1120";
  ctx.fillRect(0, 0, width, height);

  const st = CASTEP_STUDIO_STATE.structure;
  if (!st || !st.atoms || st.atoms.length === 0) {
    const fileTabEl = document.getElementById("vesta-active-doc-label");
    if (fileTabEl) fileTabEl.textContent = "📄 No Structure Loaded";
    const legendEl = document.getElementById("castep-3d-legend");
    if (legendEl) legendEl.innerHTML = "";
    const hudEl = document.getElementById("castep-3d-selection-hud");
    if (hudEl) hudEl.textContent = "No Structure Loaded • Click 📂 Mount Local Folder or 📥 Import Files above";
    ctx.fillStyle = isWhite ? "#334155" : "#cbd5e1";
    ctx.font = "700 15px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("No Crystal Structure Loaded", width / 2, height / 2 - 14);
    ctx.fillStyle = isWhite ? "#64748b" : "#94a3b8";
    ctx.font = "12.5px Inter, sans-serif";
    ctx.fillText("Click '📂 Mount Local Folder' or '📥 Import CASTEP / Structure Files' above to inspect real structures and outputs.", width / 2, height / 2 + 12);
    ctx.restore();
    return;
  }
  const vecs = st.vectors || castepParamsToVectors(st.lattice.a, st.lattice.b, st.lattice.c, st.lattice.alpha, st.lattice.beta, st.lattice.gamma);
  const [aVec, bVec, cVec] = vecs;

  if (!v3.rotMatrix || v3.rotMatrix.length !== 3) {
    v3.rotMatrix = computeVestaOrientationMatrix(v3.currentAxisPreset || "a", vecs);
  }
  const R = v3.rotMatrix;
  const r00 = R[0][0], r01 = R[0][1], r02 = R[0][2];
  const r10 = R[1][0], r11 = R[1][1], r12 = R[1][2];
  const r20 = R[2][0], r21 = R[2][1], r22 = R[2][2];

  // Retrieve cached topology (0 ms during rotation!)
  const topo = getOrBuildCastep3DTopology(st, vecs, v3);

  const bnd = v3.boundary || { xmin: 0, xmax: 1, ymin: 0, ymax: 1, zmin: 0, zmax: 1 };
  const midU = (bnd.xmin + bnd.xmax) / 2.0;
  const midV = (bnd.ymin + bnd.ymax) / 2.0;
  const midW = (bnd.zmin + bnd.zmax) / 2.0;
  const [centerX, centerY, centerZ] = castepFracToCart(midU, midV, midW, vecs);

  // Unit cell corners (relative to boundary box)
  const boxCorners3D = [
    castepFracToCart(0, 0, 0, vecs),
    castepFracToCart(1, 0, 0, vecs),
    castepFracToCart(0, 1, 0, vecs),
    castepFracToCart(0, 0, 1, vecs),
    castepFracToCart(1, 1, 0, vecs),
    castepFracToCart(1, 0, 1, vecs),
    castepFracToCart(0, 1, 1, vecs),
    castepFracToCart(1, 1, 1, vecs)
  ];

  // Compute smart Auto-Fit scale ONCE per structure/preset/canvas-resize (stays rock-steady during drag!)
  const fitKey = `${v3._topoCacheKey}|${v3.currentAxisPreset}|${width}x${height}`;
  if (!v3._baseAutoScale || v3._fitScaleKey !== fitKey) {
    let maxAbsX = 2.0, maxAbsY = 2.0;
    const considerPt = (px, py, pz, padA = 0.0) => {
      const xr = px - centerX, yr = py - centerY, zr = pz - centerZ;
      const rx = Math.abs(r00 * xr + r01 * yr + r02 * zr) + padA;
      const ry = Math.abs(r10 * xr + r11 * yr + r12 * zr) + padA;
      if (rx > maxAbsX) maxAbsX = rx;
      if (ry > maxAbsY) maxAbsY = ry;
    };
    boxCorners3D.forEach(c => considerPt(c[0], c[1], c[2], 0.35));
    topo.expandedAtoms.forEach(a => considerPt(a.cartX, a.cartY, a.cartZ, 0.85));
    const scaleX = (width * 0.43) / maxAbsX;
    const scaleY = (height * 0.42) / maxAbsY;
    v3._baseAutoScale = Math.max(4.5, Math.min(scaleX, scaleY, 68.0));
    v3._fitScaleKey = fitKey;
  }
  const autoScale = v3._baseAutoScale * (Number(v3.scale) || 1.0);

  const halfW = width / 2 + v3.panX;
  const halfH = height / 2 + v3.panY;

  function project(x, y, z) {
    const xr = x - centerX;
    const yr = y - centerY;
    const zr = z - centerZ;
    return {
      sx: halfW + (r00 * xr + r01 * yr + r02 * zr) * autoScale,
      sy: halfH - (r10 * xr + r11 * yr + r12 * zr) * autoScale,
      sz: r20 * xr + r21 * yr + r22 * zr
    };
  }

  // Update file tab & legend only when changed (zero DOM thrashing during 60fps drag)
  const legendKey = `${CASTEP_STUDIO_STATE.activeJobId}_${st.formula}_${isWhite}_${JSON.stringify(v3.customElementColors)}`;
  if (v3._legendCacheKey !== legendKey) {
    v3._legendCacheKey = legendKey;
    const fileTabEl = document.getElementById("vesta-active-doc-label") || document.getElementById("vesta-stage-file-tab-name");
    if (fileTabEl) {
      const activeJob = (CASTEP_STUDIO_STATE.jobs || []).find(j => j.id === CASTEP_STUDIO_STATE.activeJobId);
      const seedName = activeJob?.seed || st.formula || st.name || "Structure";
      fileTabEl.textContent = `📄 ${seedName}.cif — ${st.formula || ""}`;
    }
    const legendEl = document.getElementById("castep-3d-legend");
    if (legendEl) {
      const uniq = [...new Set((st.atoms || []).map(a => castepCleanElement(a.element)))];
      legendEl.innerHTML = uniq.map(el => {
        const col = getVestaElementColor(el);
        return `<span style="display:inline-flex; align-items:center; gap:4px; font-weight:700; color:${isWhite ? "#1e293b" : "#f8fafc"};">
          <span style="width:11px; height:11px; border-radius:50%; background:${col}; display:inline-block; border:1px solid rgba(15,23,42,0.35);"></span>
          ${escapeHtml(el)}
        </span>`;
      }).join("");
    }
  }

  const atomScale = Number(v3.atomScale) || 1.0;
  const bondWidthScale = Number(v3.bondWidthScale) || 1.0;

  // Materials Studio / crystallographic Ball-and-stick proportional radii
  const stickHalfW = v3.style === "stick"
    ? Math.max(1.2, Math.min(12.0, autoScale * 0.175 * bondWidthScale))
    : Math.max(0.75, Math.min(8.5, autoScale * 0.115 * bondWidthScale));

  const projectedAtoms = new Array(topo.expandedAtoms.length);
  for (let i = 0; i < topo.expandedAtoms.length; i++) {
    const at = topo.expandedAtoms[i];
    const p = project(at.cartX, at.cartY, at.cartZ);
    const covR = getCrystalCovRadius(at.element);
    let radius;
    if (v3.style === "space-fill") {
      radius = Math.max(4.5, Math.min(64.0, covR * autoScale * 0.84 * atomScale));
    } else if (v3.style === "stick") {
      radius = stickHalfW * 1.04;
    } else if (v3.style === "wireframe") {
      radius = 2.4;
    } else {
      // Ball-and-stick & Polyhedral: clean element size hierarchy, responsive across 0.20x–2.00x
      radius = Math.max(stickHalfW * 1.18, 2.2, Math.min(36.0, covR * autoScale * 0.34 * atomScale));
    }
    projectedAtoms[i] = {
      ...at,
      sx: p.sx, sy: p.sy, sz: p.sz,
      radius,
      color: getVestaElementColor(at.element)
    };
  }

  // Optional 2D Volumetric Slice Plane inside 3D Cell (drawn behind atoms/bonds)
  if (v3.showChdiffSlice) {
    const sPos = parseFloat(document.getElementById("castep-chdiff-slice-pos")?.value) || 0.5;
    const sPlane = document.getElementById("castep-chdiff-plane")?.value || "xz";
    let quad = [];
    if (sPlane === "xz") {
      quad = [castepFracToCart(0, sPos, 0, vecs), castepFracToCart(1, sPos, 0, vecs), castepFracToCart(1, sPos, 1, vecs), castepFracToCart(0, sPos, 1, vecs)];
    } else if (sPlane === "yz") {
      quad = [castepFracToCart(sPos, 0, 0, vecs), castepFracToCart(sPos, 1, 0, vecs), castepFracToCart(sPos, 1, 1, vecs), castepFracToCart(sPos, 0, 1, vecs)];
    } else {
      quad = [castepFracToCart(0, 0, sPos, vecs), castepFracToCart(1, 0, sPos, vecs), castepFracToCart(1, 1, sPos, vecs), castepFracToCart(0, 1, sPos, vecs)];
    }
    const pq = quad.map(q => project(q[0], q[1], q[2]));
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pq[0].sx, pq[0].sy);
    ctx.lineTo(pq[1].sx, pq[1].sy);
    ctx.lineTo(pq[2].sx, pq[2].sy);
    ctx.lineTo(pq[3].sx, pq[3].sy);
    ctx.closePath();
    ctx.fillStyle = "rgba(14, 165, 233, 0.14)";
    ctx.fill();
    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.restore();
  }

  const drawItems = [];

  // Depth-sorted unit cell box edges (back edges sit behind atoms, front edges cleanly wrap in front!)
  if (v3.showBox) {
    const corners = boxCorners3D.map(pt => project(pt[0], pt[1], pt[2]));
    const edgeIndices = [[0,1],[0,2],[0,3],[1,4],[2,4],[1,5],[3,5],[2,6],[3,6],[4,7],[5,7],[6,7]];
    for (let e = 0; e < edgeIndices.length; e++) {
      const [i, j] = edgeIndices[e];
      const p1 = corners[i], p2 = corners[j];
      const midZ = (p1.sz + p2.sz) * 0.5;
      drawItems.push({
        type: "box_edge",
        sz: midZ,
        data: { p1, p2, isFront: midZ >= 0 }
      });
    }
  }

  // Shaded Polyhedra faces (with Lambertian lighting from top-left light vector)
  if (v3.style === "polyhedral") {
    for (let p = 0; p < topo.polyTriplets.length; p++) {
      const t = topo.polyTriplets[p];
      const p0 = projectedAtoms[t.indices[0]], p1 = projectedAtoms[t.indices[1]], p2 = projectedAtoms[t.indices[2]];
      // Screen-space 3D triangle normal for crisp directional shading
      const ux = p1.sx - p0.sx, uy = p1.sy - p0.sy, uz = (p1.sz - p0.sz) * autoScale;
      const vx = p2.sx - p0.sx, vy = p2.sy - p0.sy, vz = (p2.sz - p0.sz) * autoScale;
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      const nLen = Math.hypot(nx, ny, nz) || 1;
      const ndotl = Math.abs((nx * -0.35 + ny * -0.45 + nz * 0.82) / nLen);
      drawItems.push({
        type: "poly",
        sz: (p0.sz + p1.sz + p2.sz) / 3 + t.offsetZ,
        data: { pts: [p0, p1, p2], color: projectedAtoms[t.centerIdx].color, shade: ndotl }
      });
    }
  }

  // Half-bond depth-sorted 3D cylindrical sticks (eliminates z-fighting & bond pop-over glitches!)
  const uniformStick = (v3.bondColorMode === "uniform");
  const uniformColor = isWhite ? "#94a3b8" : "#cbd5e1";

  if ((v3.showBonds || v3.style === "wireframe" || v3.style === "stick") && v3.style !== "space-fill") {
    for (let b = 0; b < topo.bondPairs.length; b++) {
      const bp = topo.bondPairs[b];
      const a1 = projectedAtoms[bp.i], a2 = projectedAtoms[bp.j];
      const mx = (a1.sx + a2.sx) * 0.5;
      const my = (a1.sy + a2.sy) * 0.5;
      const dx = a2.sx - a1.sx, dy = a2.sy - a1.sy;
      const segLen = Math.hypot(dx, dy);
      if (segLen < 0.8) continue;

      // Trim bond start slightly into the sphere surface so sticks join spheres cleanly without tail bleed
      const ux = dx / segLen, uy = dy / segLen;
      const trim1 = v3.style === "ball-stick" || v3.style === "polyhedral" ? Math.min(a1.radius * 0.52, segLen * 0.35) : 0;
      const trim2 = v3.style === "ball-stick" || v3.style === "polyhedral" ? Math.min(a2.radius * 0.52, segLen * 0.35) : 0;

      const s1x = a1.sx + ux * trim1, s1y = a1.sy + uy * trim1;
      const s2x = a2.sx - ux * trim2, s2y = a2.sy - uy * trim2;

      drawItems.push({
        type: "half_bond",
        sz: 0.68 * a1.sz + 0.32 * a2.sz - 0.04,
        data: {
          x1: s1x, y1: s1y, x2: mx, y2: my,
          color: uniformStick ? uniformColor : a1.color,
          roundCap: v3.style === "stick"
        }
      });
      drawItems.push({
        type: "half_bond",
        sz: 0.32 * a1.sz + 0.68 * a2.sz - 0.04,
        data: {
          x1: s2x, y1: s2y, x2: mx, y2: my,
          color: uniformStick ? uniformColor : a2.color,
          roundCap: v3.style === "stick"
        }
      });
    }
  }

  // 3D Volumetric Charge Density Difference (Δρ) Soft Electron Clouds
  if (v3.showChdiffIso && typeof getActiveJobChdiffGrid === "function") {
    const chGrid = getActiveJobChdiffGrid();
    if (chGrid && chGrid.isosurfaceVoxels) {
      const pal = document.getElementById("castep-chdiff-palette")?.value || "yellow-cyan";
      const cloudStyle = CASTEP_STUDIO_STATE.chdiffState?.cloudStyle || "clouds";
      const isoThresh = Number(v3.chdiffIsoval) || 0.018;
      const dims = chGrid.sample_dims || [16, 16, 36];
      const voxelPitch = Math.max(
        Math.hypot(...aVec) / Math.max(1, dims[0]),
        Math.hypot(...bVec) / Math.max(1, dims[1]),
        Math.hypot(...cVec) / Math.max(1, dims[2])
      );
      const baseCloudR = Math.max(9.0, Math.min(34.0, voxelPitch * autoScale * (cloudStyle === "clouds" ? 1.65 : 1.28)));
      const posSprite = getCachedChdiffCloudSprite(pal, true, cloudStyle);
      const negSprite = getCachedChdiffCloudSprite(pal, false, cloudStyle);

      for (let v = 0; v < chGrid.isosurfaceVoxels.length; v++) {
        const vx = chGrid.isosurfaceVoxels[v];
        const mag = Math.abs(vx.val);
        if (mag < isoThresh) continue;
        const [cx, cy, cz] = castepFracToCart(vx.u, vx.v, vx.w, vecs);
        const p = project(cx, cy, cz);
        const excess = Math.min(1.0, (mag - isoThresh) / Math.max(isoThresh * 1.8, 1e-6));
        const lobeR = baseCloudR * (0.76 + 0.52 * Math.sqrt(excess));
        const alpha = cloudStyle === "clouds"
          ? (0.20 + 0.44 * Math.sqrt(excess))
          : (0.38 + 0.44 * Math.sqrt(excess));
        drawItems.push({
          type: "chdiff_lobe",
          sz: p.sz,
          data: {
            sx: p.sx, sy: p.sy, r: lobeR, alpha,
            sprite: vx.val > 0 ? posSprite : negSprite
          }
        });
      }
    }
  }

  // Atoms
  for (let i = 0; i < projectedAtoms.length; i++) {
    const a = projectedAtoms[i];
    drawItems.push({ type: "atom", sz: a.sz, data: a });
  }

  // Adsorption candidate sites
  if (v3.showAdsorptionSites && Array.isArray(v3.candidateSites)) {
    v3.candidateSites.forEach((site, sIdx) => {
      const [cx, cy, cz] = castepFracToCart(site.u, site.v, site.w, vecs);
      const p = project(cx, cy, cz);
      drawItems.push({
        type: "site",
        sz: p.sz + 0.2,
        data: { ...site, sIdx, sx: p.sx, sy: p.sy, isSelected: sIdx === v3.previewSiteIndex }
      });
    });
  }

  drawItems.sort((a, b) => a.sz - b.sz);

  for (let idx = 0; idx < drawItems.length; idx++) {
    const item = drawItems[idx];
    if (item.type === "box_edge") {
      const { p1, p2, isFront } = item.data;
      ctx.beginPath();
      ctx.moveTo(p1.sx, p1.sy);
      ctx.lineTo(p2.sx, p2.sy);
      ctx.strokeStyle = isWhite
        ? (isFront ? "rgba(51, 65, 85, 0.72)" : "rgba(100, 116, 139, 0.42)")
        : (isFront ? "rgba(203, 213, 225, 0.55)" : "rgba(148, 163, 184, 0.28)");
      ctx.lineWidth = isFront ? 1.15 : 0.95;
      ctx.stroke();
    } else if (item.type === "poly") {
      const { pts, color, shade } = item.data;
      const shadedCol = typeof lightenColor === "function" && shade > 0.55
        ? lightenColor(color, (shade - 0.55) * 0.45)
        : (typeof darkenColor === "function" && shade < 0.45 ? darkenColor(color, (0.45 - shade) * 0.35) : color);
      ctx.beginPath();
      ctx.moveTo(pts[0].sx, pts[0].sy);
      ctx.lineTo(pts[1].sx, pts[1].sy);
      ctx.lineTo(pts[2].sx, pts[2].sy);
      ctx.closePath();
      ctx.save();
      ctx.globalAlpha = 0.34 + 0.20 * shade;
      ctx.fillStyle = shadedCol;
      ctx.fill();
      ctx.restore();
      ctx.strokeStyle = isWhite ? "rgba(51, 65, 85, 0.42)" : "rgba(226, 232, 240, 0.35)";
      ctx.lineWidth = 0.85;
      ctx.stroke();
    } else if (item.type === "chdiff_lobe") {
      const l = item.data;
      const prevAlpha = ctx.globalAlpha;
      ctx.globalAlpha = l.alpha;
      ctx.drawImage(l.sprite, l.sx - l.r, l.sy - l.r, l.r * 2, l.r * 2);
      ctx.globalAlpha = prevAlpha;
    } else if (item.type === "half_bond") {
      const hb = item.data;
      if (v3.style === "wireframe") {
        ctx.beginPath();
        ctx.moveTo(hb.x1, hb.y1);
        ctx.lineTo(hb.x2, hb.y2);
        ctx.strokeStyle = hb.color;
        ctx.lineWidth = 1.7;
        ctx.lineCap = "round";
        ctx.stroke();
      } else {
        drawShadedHalfBondCylinder(ctx, hb.x1, hb.y1, hb.x2, hb.y2, stickHalfW, hb.color, isWhite, hb.roundCap);
      }
    } else if (item.type === "atom") {
      const a = item.data;
      const mBox = (v3.marquee && v3.marquee.active && v3.dragMoved) ? v3.marquee : null;
      const inMarquee = mBox
        ? (a.sx >= Math.min(mBox.x0, mBox.x1) && a.sx <= Math.max(mBox.x0, mBox.x1) &&
           a.sy >= Math.min(mBox.y0, mBox.y1) && a.sy <= Math.max(mBox.y0, mBox.y1))
        : false;
      const isSel = v3.selectedAtomIndices.has(a.atomIndex);
      const showGold = isSel && (!mBox || mBox.additive);
      if (showGold) {
        ctx.beginPath();
        ctx.arc(a.sx, a.sy, a.radius + 4.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(250, 204, 21, 0.38)";
        ctx.fill();
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = "#eab308";
        ctx.stroke();
      } else if (inMarquee) {
        ctx.beginPath();
        ctx.arc(a.sx, a.sy, a.radius + 4.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(37, 99, 235, 0.28)";
        ctx.fill();
        ctx.lineWidth = 2.0;
        ctx.strokeStyle = "#2563eb";
        ctx.stroke();
      }

      // Draw pre-cached 96x96 Phong glossy sphere sprite (ultra-fast hardware blit!)
      const sprite = getCachedSphereSprite(a.color, a.fixed);
      const drawR = a.radius * (48 / 42);
      ctx.drawImage(sprite, a.sx - drawR, a.sy - drawR, drawR * 2, drawR * 2);

      if (v3.showSpins && a.spin !== undefined && a.spin !== null && Math.abs(a.spin) >= 0.04) {
        const sVal = Number(a.spin);
        const dir = sVal >= 0 ? 1 : -1;
        const lenA = Math.min(3.2, Math.max(1.05, 0.85 + Math.abs(sVal) * 1.15));
        const pTail = project(a.cartX, a.cartY, a.cartZ - dir * lenA * 0.35);
        const pTip  = project(a.cartX, a.cartY, a.cartZ + dir * lenA * 0.85);
        const col = dir > 0 ? "#dc2626" : "#2563eb";
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(pTail.sx, pTail.sy);
        ctx.lineTo(pTip.sx, pTip.sy);
        ctx.strokeStyle = col;
        ctx.lineWidth = 3.2;
        ctx.lineCap = "round";
        ctx.stroke();
        const ang = Math.atan2(pTip.sy - pTail.sy, pTip.sx - pTail.sx);
        const hl = 9.0;
        ctx.beginPath();
        ctx.moveTo(pTip.sx, pTip.sy);
        ctx.lineTo(pTip.sx - hl * Math.cos(ang - 0.42), pTip.sy - hl * Math.sin(ang - 0.42));
        ctx.lineTo(pTip.sx - hl * Math.cos(ang + 0.42), pTip.sy - hl * Math.sin(ang + 0.42));
        ctx.closePath();
        ctx.fillStyle = col;
        ctx.fill();
        ctx.font = "bold 10px Inter, sans-serif";
        ctx.fillStyle = col;
        ctx.textAlign = "center";
        drawSciText(ctx, `${sVal > 0 ? "+" : ""}${sVal.toFixed(2)} μ_{B}`, pTip.sx, pTip.sy - 7);
        ctx.restore();
      }

      if (v3.showForces && Math.hypot(a.fx, a.fy, a.fz) > 0.005) {
        const fScale = 8.0;
        const fp = project(a.cartX + a.fx * fScale, a.cartY + a.fy * fScale, a.cartZ + a.fz * fScale);
        ctx.beginPath();
        ctx.moveTo(a.sx, a.sy);
        ctx.lineTo(fp.sx, fp.sy);
        ctx.strokeStyle = "#e11d48";
        ctx.lineWidth = 2.2;
        ctx.stroke();
      }

      if (v3.showLabels) {
        ctx.font = "bold 10px Inter, Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = isWhite ? "#0f172a" : "#f8fafc";
        ctx.fillText(a.label + (a.fixed ? "🔒" : ""), a.sx, a.sy - a.radius - 7);
      }
    } else if (item.type === "site") {
      const s = item.data;
      const r = s.isSelected ? 7.0 : 4.5;
      ctx.save();
      ctx.translate(s.sx, s.sy);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = s.isSelected ? "#facc15" : "rgba(14, 165, 233, 0.80)";
      ctx.strokeStyle = s.isSelected ? "#dc2626" : "#0369a1";
      ctx.lineWidth = s.isSelected ? 2.0 : 1.2;
      ctx.fillRect(-r, -r, r * 2, r * 2);
      ctx.strokeRect(-r, -r, r * 2, r * 2);
      ctx.restore();
      if (s.isSelected) {
        ctx.font = "bold 10.5px Inter, sans-serif";
        ctx.fillStyle = isWhite ? "#b91c1c" : "#fde047";
        ctx.textAlign = "center";
        ctx.fillText(`🎯 ${s.shortLabel}`, s.sx, s.sy - 12);
      }
    }
  }

  // On-canvas distance & angle measurements
  (v3.distanceMeasurements || []).forEach(m => {
    const p1 = project(m.c1[0], m.c1[1], m.c1[2]);
    const p2 = project(m.c2[0], m.c2[1], m.c2[2]);
    ctx.save();
    ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(p1.sx, p1.sy); ctx.lineTo(p2.sx, p2.sy);
    ctx.strokeStyle = "#dc2626"; ctx.lineWidth = 2.0; ctx.stroke();
    ctx.setLineDash([]);
    const mx = (p1.sx + p2.sx) / 2, my = (p1.sy + p2.sy) / 2;
    const txt = `${m.distA.toFixed(3)} Å`;
    ctx.font = "bold 10.5px Consolas, monospace";
    const tw = ctx.measureText(txt).width + 10;
    ctx.fillStyle = "rgba(254, 242, 242, 0.94)"; ctx.strokeStyle = "#dc2626"; ctx.lineWidth = 1.2;
    ctx.fillRect(mx - tw / 2, my - 9, tw, 18); ctx.strokeRect(mx - tw / 2, my - 9, tw, 18);
    ctx.fillStyle = "#991b1b"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(txt, mx, my);
    ctx.restore();
  });

  (v3.angleMeasurements || []).forEach(m => {
    const p1 = project(m.c1[0], m.c1[1], m.c1[2]);
    const p2 = project(m.c2[0], m.c2[1], m.c2[2]);
    const p3 = project(m.c3[0], m.c3[1], m.c3[2]);
    ctx.save();
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(p1.sx, p1.sy); ctx.lineTo(p2.sx, p2.sy); ctx.lineTo(p3.sx, p3.sy);
    ctx.strokeStyle = "#7c3aed"; ctx.lineWidth = 1.8; ctx.stroke();
    ctx.setLineDash([]);
    const txt = `${m.angleDeg.toFixed(1)}°`;
    ctx.font = "bold 10.5px Consolas, monospace";
    const tw = ctx.measureText(txt).width + 10;
    ctx.fillStyle = "rgba(245, 243, 255, 0.94)"; ctx.strokeStyle = "#7c3aed"; ctx.lineWidth = 1.2;
    ctx.fillRect(p2.sx - tw / 2, p2.sy - 24, tw, 18); ctx.strokeRect(p2.sx - tw / 2, p2.sy - 24, tw, 18);
    ctx.fillStyle = "#5b21b6"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(txt, p2.sx, p2.sy - 15);
    ctx.restore();
  });

  drawVestaAxisTriad(ctx, width, height, vecs, R, isWhite);

  // Live Box-Select Marquee Rectangle overlay (Select mode drag)
  if (v3.marquee && v3.marquee.active && v3.dragMoved) {
    const mx0 = Math.min(v3.marquee.x0, v3.marquee.x1);
    const my0 = Math.min(v3.marquee.y0, v3.marquee.y1);
    const mw = Math.abs(v3.marquee.x1 - v3.marquee.x0);
    const mh = Math.abs(v3.marquee.y1 - v3.marquee.y0);
    const previewIndices = new Set();
    for (let i = 0; i < projectedAtoms.length; i++) {
      const pa = projectedAtoms[i];
      if (pa.sx >= mx0 && pa.sx <= mx0 + mw && pa.sy >= my0 && pa.sy <= my0 + mh && pa.atomIndex !== undefined) {
        previewIndices.add(pa.atomIndex);
      }
    }
    ctx.save();
    ctx.fillStyle = "rgba(37, 99, 235, 0.12)";
    ctx.fillRect(mx0, my0, mw, mh);
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 3]);
    ctx.strokeRect(mx0 + 0.5, my0 + 0.5, mw, mh);
    ctx.setLineDash([]);
    const lbl = `${v3.marquee.additive ? "+" : ""}${previewIndices.size} atom${previewIndices.size === 1 ? "" : "s"}`;
    ctx.font = "bold 10.5px Inter, Segoe UI, sans-serif";
    const lw = ctx.measureText(lbl).width + 10;
    const lx = Math.min(width - lw - 4, Math.max(4, mx0 + mw - lw));
    const ly = (my0 + mh + 22 < height) ? (my0 + mh + 4) : Math.max(4, my0 - 20);
    ctx.fillStyle = "rgba(30, 64, 175, 0.92)";
    ctx.fillRect(lx, ly, lw, 18);
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(lbl, lx + 5, ly + 9);
    ctx.restore();
  }

  const cpuMs = Math.max(0, Math.round(performance.now() - t0));
  v3.lastStats = {
    atomsCount: projectedAtoms.length,
    unitCellAtoms: (st.atoms || []).length,
    bondsCount: topo.bondPairs.length,
    polyCount: topo.polyCount,
    cpuMs
  };
  v3.renderedAtomsScreen = projectedAtoms;
  ctx.restore();
  if (!v3.isDragging) updateCastep3DSelectionHud();
}
window.renderCastep3DScene = renderCastep3DScene;

// ============================================================================
// 5. Structure Manipulation Tools: Supercell, Slab, Vacuum, Adsorption, Janus
// ============================================================================

function pushCastepUndoSnapshot() {
  CASTEP_STUDIO_STATE.undoStack.push(JSON.parse(JSON.stringify(CASTEP_STUDIO_STATE.structure)));
  if (CASTEP_STUDIO_STATE.undoStack.length > 25) CASTEP_STUDIO_STATE.undoStack.shift();
  CASTEP_STUDIO_STATE.redoStack = [];
}

function undoCastepStructureEdit() {
  if (!CASTEP_STUDIO_STATE.undoStack.length) {
    if (typeof showToast === "function") showToast("Nothing to undo.", "warn");
    return;
  }
  CASTEP_STUDIO_STATE.redoStack.push(JSON.parse(JSON.stringify(CASTEP_STUDIO_STATE.structure)));
  CASTEP_STUDIO_STATE.structure = CASTEP_STUDIO_STATE.undoStack.pop();
  CASTEP_STUDIO_STATE.view3D.selectedAtomIndices.clear();
  afterCastepStructureModified("Undo applied.");
}
window.undoCastepStructureEdit = undoCastepStructureEdit;

function redoCastepStructureEdit() {
  if (!CASTEP_STUDIO_STATE.redoStack.length) {
    if (typeof showToast === "function") showToast("Nothing to redo.", "warn");
    return;
  }
  CASTEP_STUDIO_STATE.undoStack.push(JSON.parse(JSON.stringify(CASTEP_STUDIO_STATE.structure)));
  CASTEP_STUDIO_STATE.structure = CASTEP_STUDIO_STATE.redoStack.pop();
  CASTEP_STUDIO_STATE.view3D.selectedAtomIndices.clear();
  afterCastepStructureModified("Redo applied.");
}
window.redoCastepStructureEdit = redoCastepStructureEdit;

function resetCastepStructureToJobOriginal() {
  if (!CASTEP_STUDIO_STATE.originalStructureBackup) return;
  pushCastepUndoSnapshot();
  CASTEP_STUDIO_STATE.structure = JSON.parse(JSON.stringify(CASTEP_STUDIO_STATE.originalStructureBackup));
  CASTEP_STUDIO_STATE.view3D.selectedAtomIndices.clear();
  afterCastepStructureModified("Reset to original job crystal structure.");
}
window.resetCastepStructureToJobOriginal = resetCastepStructureToJobOriginal;

function afterCastepStructureModified(toastMsg = "", preserveSymmetry = false) {
  CASTEP_STUDIO_STATE.view3D._topoCacheKey = "";
  CASTEP_STUDIO_STATE.chdiffState.activeGrid = null;
  const st = CASTEP_STUDIO_STATE.structure;
  if (!preserveSymmetry) {
    // Any atomic/supercell/slab/defect modification breaks original Wyckoff symmetry -> convert cleanly to P 1 (VESTA standard)
    st.symmetryIntact = false;
    st.spaceGroup = "P 1 (1)";
    st.spaceGroupHM = "P 1";
    st.spaceGroupIT = 1;
    st.hallSymbol = "P 1";
    st.symops = ["x, y, z"];
    st.asymmetricAtoms = null;
  }
  st.formula = castepComputeFormula(st.atoms);
  st.lattice = castepVectorsToParams(st.vectors);
  if (!preserveSymmetry || !st.crystalSystem) {
    st.crystalSystem = castepInferCrystalSystem(st.lattice);
  }

  syncCastepStructureToBuilderInputs();
  detectCastepAdsorptionSites();
  renderVestaObjectsTab();
  renderCastepAtomsTable();
  updateCastepKpiBar();
  renderCastep3DScene();
  updateVestaOutputConsole();
  updateCastep3DSelectionHud();
  refreshCastepFileEditorContent();
  if (toastMsg && typeof showToast === "function") showToast(toastMsg, "success");
}

function syncCastepStructureToBuilderInputs() {
  const lat = CASTEP_STUDIO_STATE.structure.lattice;
  if (!lat) return;
  const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  setVal("castep-lat-a", Number(lat.a).toFixed(4));
  setVal("castep-lat-b", Number(lat.b).toFixed(4));
  setVal("castep-lat-c", Number(lat.c).toFixed(4));
  setVal("castep-lat-alpha", Number(lat.alpha).toFixed(2));
  setVal("castep-lat-beta", Number(lat.beta).toFixed(2));
  setVal("castep-lat-gamma", Number(lat.gamma).toFixed(2));
}

// --- A. Supercell Generator ---
function quickCastepSupercell(na, nb, nc) {
  document.getElementById("castep-sc-na").value = na;
  document.getElementById("castep-sc-nb").value = nb;
  document.getElementById("castep-sc-nc").value = nc;
  applyCastepSupercell();
}
window.quickCastepSupercell = quickCastepSupercell;

function applyCastepSupercell() {
  const na = Math.max(1, Math.min(12, parseInt(document.getElementById("castep-sc-na")?.value || "1", 10)));
  const nb = Math.max(1, Math.min(12, parseInt(document.getElementById("castep-sc-nb")?.value || "1", 10)));
  const nc = Math.max(1, Math.min(12, parseInt(document.getElementById("castep-sc-nc")?.value || "1", 10)));
  if (na === 1 && nb === 1 && nc === 1) {
    if (typeof showToast === "function") showToast("Supercell multipliers are 1×1×1 (no change).", "warn");
    return;
  }
  pushCastepUndoSnapshot();
  const st = CASTEP_STUDIO_STATE.structure;
  const [aVec, bVec, cVec] = st.vectors;
  st.vectors = [
    [aVec[0]*na, aVec[1]*na, aVec[2]*na],
    [bVec[0]*nb, bVec[1]*nb, bVec[2]*nb],
    [cVec[0]*nc, cVec[1]*nc, cVec[2]*nc]
  ];
  const newAtoms = [];
  const elCount = {};
  (st.atoms || []).forEach(at => {
    const u0 = ((at.x % 1) + 1) % 1;
    const v0 = ((at.y % 1) + 1) % 1;
    const w0 = ((at.z % 1) + 1) % 1;
    for (let ia = 0; ia < na; ia++) {
      for (let ib = 0; ib < nb; ib++) {
        for (let ic = 0; ic < nc; ic++) {
          elCount[at.element] = (elCount[at.element] || 0) + 1;
          newAtoms.push({
            ...at,
            label: `${at.element}${elCount[at.element]}`,
            x: (u0 + ia) / na,
            y: (v0 + ib) / nb,
            z: (w0 + ic) / nc
          });
        }
      }
    }
  });
  st.atoms = newAtoms;
  afterCastepStructureModified(`Built ${na}×${nb}×${nc} supercell (${newAtoms.length} atoms).`);
}
window.applyCastepSupercell = applyCastepSupercell;

// --- B. Lattice Parameters & Strain Engineering ---
function applyCastepLatticeAndStrain() {
  pushCastepUndoSnapshot();
  const st = CASTEP_STUDIO_STATE.structure;
  let a = parseFloat(document.getElementById("castep-lat-a")?.value) || st.lattice.a;
  let b = parseFloat(document.getElementById("castep-lat-b")?.value) || st.lattice.b;
  let c = parseFloat(document.getElementById("castep-lat-c")?.value) || st.lattice.c;
  const alpha = parseFloat(document.getElementById("castep-lat-alpha")?.value) || st.lattice.alpha;
  const beta  = parseFloat(document.getElementById("castep-lat-beta")?.value)  || st.lattice.beta;
  const gamma = parseFloat(document.getElementById("castep-lat-gamma")?.value) || st.lattice.gamma;
  const strainPct = parseFloat(document.getElementById("castep-strain-pct")?.value) || 0.0;

  if (Math.abs(strainPct) > 1e-5) {
    const factor = 1.0 + strainPct / 100.0;
    a *= factor;
    b *= factor;
    document.getElementById("castep-strain-pct").value = "0.0";
  }
  st.vectors = castepParamsToVectors(a, b, c, alpha, beta, gamma);
  afterCastepStructureModified(`Updated lattice parameters (a=${a.toFixed(3)} Å, b=${b.toFixed(3)} Å, c=${c.toFixed(3)} Å).`);
}
window.applyCastepLatticeAndStrain = applyCastepLatticeAndStrain;

// --- C. Surface Slab Cutter (Miller Index hkl) & Vacuum Layer Builder ---
function setCastepMillerPreset(h, k, l) {
  document.getElementById("castep-slab-h").value = h;
  document.getElementById("castep-slab-k").value = k;
  document.getElementById("castep-slab-l").value = l;
}
window.setCastepMillerPreset = setCastepMillerPreset;

function cutCastepSurfaceSlab() {
  const h = parseInt(document.getElementById("castep-slab-h")?.value || "0", 10);
  const k = parseInt(document.getElementById("castep-slab-k")?.value || "0", 10);
  const l = parseInt(document.getElementById("castep-slab-l")?.value || "1", 10);
  const nLayers = Math.max(1, Math.min(10, parseInt(document.getElementById("castep-slab-layers")?.value || "1", 10)));
  const vacA = Math.max(0, parseFloat(document.getElementById("castep-vac-thickness")?.value || "20.0"));

  if (h === 0 && k === 0 && l === 0) {
    if (typeof showToast === "function") showToast("Miller indices (hkl) cannot all be zero.", "warn");
    return;
  }

  pushCastepUndoSnapshot();
  const st = CASTEP_STUDIO_STATE.structure;
  const [aVec, bVec, cVec] = st.vectors;

  // Compute surface normal nHat in Cartesian space from reciprocal lattice vector G = h*b1 + k*b2 + l*b3
  const invT = castepInvert3x3(st.vectors); // columns of invT are reciprocal basis vectors
  const gx = h * invT[0][0] + k * invT[0][1] + l * invT[0][2];
  const gy = h * invT[1][0] + k * invT[1][1] + l * invT[1][2];
  const gz = h * invT[2][0] + k * invT[2][1] + l * invT[2][2];
  const gNorm = Math.hypot(gx, gy, gz) || 1.0;
  const nHat = [gx / gNorm, gy / gNorm, gz / gNorm];
  const dSpacing = 1.0 / gNorm;

  // Find integer lattice combinations V = u*a + v*b + w*c that lie in the (hkl) plane: h*u + k*v + l*w = 0
  const inPlaneCandidates = [];
  for (let u = -3; u <= 3; u++) {
    for (let v = -3; v <= 3; v++) {
      for (let w = -3; w <= 3; w++) {
        if (u === 0 && v === 0 && w === 0) continue;
        if (h * u + k * v + l * w === 0) {
          const vx = u * aVec[0] + v * bVec[0] + w * cVec[0];
          const vy = u * aVec[1] + v * bVec[1] + w * cVec[1];
          const vz = u * aVec[2] + v * bVec[2] + w * cVec[2];
          const len = Math.hypot(vx, vy, vz);
          if (len > 0.5) inPlaneCandidates.push({ u, v, w, vec: [vx, vy, vz], len });
        }
      }
    }
  }
  inPlaneCandidates.sort((p, q) => p.len - q.len);
  const v1Obj = inPlaneCandidates[0] || { vec: aVec, len: Math.hypot(...aVec) };
  let v2Obj = inPlaneCandidates.find(cand => {
    const crossX = v1Obj.vec[1]*cand.vec[2] - v1Obj.vec[2]*cand.vec[1];
    const crossY = v1Obj.vec[2]*cand.vec[0] - v1Obj.vec[0]*cand.vec[2];
    const crossZ = v1Obj.vec[0]*cand.vec[1] - v1Obj.vec[1]*cand.vec[0];
    return Math.hypot(crossX, crossY, crossZ) / (v1Obj.len * cand.len) > 0.25;
  }) || { vec: bVec, len: Math.hypot(...bVec) };

  // Build new orthonormal surface frame: e1 along v1, e3 along nHat, e2 = e3 x e1
  const e1 = [v1Obj.vec[0]/v1Obj.len, v1Obj.vec[1]/v1Obj.len, v1Obj.vec[2]/v1Obj.len];
  const e3 = nHat;
  const e2 = [
    e3[1]*e1[2] - e3[2]*e1[1],
    e3[2]*e1[0] - e3[0]*e1[2],
    e3[0]*e1[1] - e3[1]*e1[0]
  ];
  const dot = (u, v) => u[0]*v[0] + u[1]*v[1] + u[2]*v[2];

  const newA = [v1Obj.len, 0, 0];
  let b2x = dot(v2Obj.vec, e1), b2y = dot(v2Obj.vec, e2);
  if (b2y < 0) { b2x = -b2x; b2y = -b2y; }
  const newB = [b2x, b2y, 0];

  // Project atoms across supercell shells and filter into 1 surface unit cell x nLayers thickness
  const slabThicknessA = Math.max(dSpacing * nLayers, (castepVectorsToParams(st.vectors).c) * nLayers);
  const newC = [0, 0, slabThicknessA + vacA];
  const newVecs = [newA, newB, newC];

  const collected = [];
  const seen = new Set();
  const maxShell = Math.max(2, nLayers + 1);

  (st.atoms || []).forEach(at => {
    const u0 = ((at.x % 1) + 1) % 1;
    const v0 = ((at.y % 1) + 1) % 1;
    const w0 = ((at.z % 1) + 1) % 1;
    for (let ia = -maxShell; ia <= maxShell; ia++) {
      for (let ib = -maxShell; ib <= maxShell; ib++) {
        for (let ic = -maxShell; ic <= maxShell; ic++) {
          if ((h === 0 && k === 0 && l === 1) && (ia !== 0 || ib !== 0 || ic < 0 || ic >= nLayers)) continue;
          const [cx, cy, cz] = castepFracToCart(u0 + ia, v0 + ib, w0 + ic, st.vectors);
          const px = cx * e1[0] + cy * e1[1] + cz * e1[2];
          const py = cx * e2[0] + cy * e2[1] + cz * e2[2];
          const pz = cx * e3[0] + cy * e3[1] + cz * e3[2];

          // Convert (px, py) to in-plane fractional (fu, fv)
          const fv = py / (newB[1] || 1.0);
          const fu = (px - fv * newB[0]) / (newA[0] || 1.0);
          if ((h !== 0 || k !== 0 || l !== 1)) {
            if (fu < -1e-4 || fu >= 1 - 1e-4 || fv < -1e-4 || fv >= 1 - 1e-4) continue;
            if (pz < -1e-3 || pz > dSpacing * nLayers + 1e-3) continue;
          }
          const fuWrap = ((fu % 1) + 1) % 1;
          const fvWrap = ((fv % 1) + 1) % 1;
          const key = `${at.element}_${Math.round(fuWrap*500)}_${Math.round(fvWrap*500)}_${Math.round(pz*200)}`;
          if (seen.has(key)) continue;
          seen.add(key);
          collected.push({
            element: at.element,
            fu: fuWrap,
            fv: fvWrap,
            pz,
            fixed: Boolean(at.fixed)
          });
        }
      }
    }
  });

  if (collected.length > 0) {
    const minPz = Math.min(...collected.map(a => a.pz));
    const maxPz = Math.max(...collected.map(a => a.pz));
    const atomicSpanZ = Math.max(0.1, maxPz - minPz);
    const totalC = atomicSpanZ + Math.max(2.0, vacA);
    newVecs[2] = [0, 0, totalC];

    const alignMode = document.getElementById("castep-vac-align")?.value || "center";
    const elCount = {};
    st.atoms = collected.map(a => {
      elCount[a.element] = (elCount[a.element] || 0) + 1;
      let zCart = a.pz - minPz;
      if (alignMode === "center") zCart += (totalC - atomicSpanZ) / 2.0;
      else if (alignMode === "bottom") zCart += 2.0;
      else zCart += (totalC - atomicSpanZ) / 2.0;
      return {
        element: a.element,
        label: `${a.element}${elCount[a.element]}`,
        x: a.fu,
        y: a.fv,
        z: zCart / totalC,
        fixed: a.fixed,
        fx: 0, fy: 0, fz: 0,
        charge: null
      };
    });
    st.vectors = newVecs;
  }

  afterCastepStructureModified(`Cut (${h}${k}${l}) surface slab (${nLayers} layers, ${vacA.toFixed(1)} Å vacuum, ${st.atoms.length} atoms).`);
}
window.cutCastepSurfaceSlab = cutCastepSurfaceSlab;

function quickCastepVacuum(vacVal) {
  const el = document.getElementById("castep-vac-thickness");
  if (el) el.value = vacVal;
  applyCastepVacuumLayer();
}
window.quickCastepVacuum = quickCastepVacuum;

function applyCastepVacuumLayer() {
  const vacA = Math.max(0, parseFloat(document.getElementById("castep-vac-thickness")?.value || "20.0"));
  const alignMode = document.getElementById("castep-vac-align")?.value || "center";
  const st = CASTEP_STUDIO_STATE.structure;
  if (!st.atoms || !st.atoms.length) return;

  pushCastepUndoSnapshot();
  // Preserve exact Cartesian Z distances between atoms in the slab while changing c-vector length
  const cartCoords = st.atoms.map(at => castepFracToCart(at.x, at.y, at.z, st.vectors));
  const zs = cartCoords.map(c => c[2]);
  const minZ = Math.min(...zs), maxZ = Math.max(...zs);
  const slabSpanZ = Math.max(0.1, maxZ - minZ);
  const newCLen = slabSpanZ + Math.max(1.0, vacA);

  const cVec = st.vectors[2];
  const oldCLen = Math.hypot(...cVec) || 1.0;
  st.vectors[2] = [
    (cVec[0] / oldCLen) * newCLen,
    (cVec[1] / oldCLen) * newCLen,
    (cVec[2] / oldCLen) * newCLen
  ];
  if (Math.abs(st.vectors[2][0]) < 1e-4 && Math.abs(st.vectors[2][1]) < 1e-4) {
    st.vectors[2] = [0, 0, newCLen];
  }

  st.atoms.forEach((at, i) => {
    let zShift = cartCoords[i][2] - minZ;
    if (alignMode === "center") zShift += (newCLen - slabSpanZ) / 2.0;
    else if (alignMode === "bottom") zShift += 2.0;
    else zShift = cartCoords[i][2];
    at.z = Math.max(0.0001, Math.min(0.9999, zShift / newCLen));
  });

  afterCastepStructureModified(`Applied ${vacA.toFixed(1)} Å vacuum layer (new c = ${newCLen.toFixed(3)} Å, ${alignMode}).`);
}
window.applyCastepVacuumLayer = applyCastepVacuumLayer;

// --- D. Surface Adsorption Site Detector & Adsorbate Placer (Top, Bridge, Hollow) ---
function detectCastepAdsorptionSites() {
  const st = CASTEP_STUDIO_STATE.structure;
  const atoms = st.atoms || [];
  const vecs = st.vectors;
  const siteType = document.getElementById("castep-ads-site-type")?.value || "top";
  const side = document.getElementById("castep-ads-side")?.value || "top";
  const customRow = document.getElementById("castep-ads-custom-row");
  if (customRow) customRow.style.display = siteType === "custom" ? "grid" : "none";

  if (!atoms.length) return;
  const cartList = atoms.map((at, idx) => {
    const [cx, cy, cz] = castepFracToCart(at.x, at.y, at.z, vecs);
    return { idx, element: at.element, label: at.label || `${at.element}${idx+1}`, u: at.x, v: at.y, w: at.z, cx, cy, cz };
  });

  const substrateList = cartList.filter(a => !atoms[a.idx]?.isAdsorbate);
  const basePool = substrateList.length >= 3 ? substrateList : cartList;
  const zs = basePool.map(a => a.cz);
  const maxZ = Math.max(...zs), minZ = Math.min(...zs);
  let surfAtoms = basePool.filter(a => side === "top" ? (maxZ - a.cz <= 1.45) : (a.cz - minZ <= 1.45));
  if (surfAtoms.length < 3) {
    surfAtoms = basePool.filter(a => side === "top" ? (maxZ - a.cz <= 3.2) : (a.cz - minZ <= 3.2));
  }
  const subSurfAtoms = basePool.filter(a => side === "top" ? (maxZ - a.cz > 1.45 && maxZ - a.cz <= 3.6) : (a.cz - minZ > 1.45 && a.cz - minZ <= 3.6));

  const sites = [];

  if (siteType === "top") {
    surfAtoms.forEach((a, i) => {
      sites.push({
        type: "top",
        shortLabel: `Top(${a.label})`,
        desc: `Top #${i+1}: Above ${a.label} (${a.element}) — u=${a.u.toFixed(3)}, v=${a.v.toFixed(3)}, z=${a.cz.toFixed(2)}Å`,
        u: a.u, v: a.v, w: a.w,
        cx: a.cx, cy: a.cy, cz: a.cz
      });
    });
  } else if (siteType === "bridge") {
    const seenPairs = new Set();
    for (let i = 0; i < surfAtoms.length; i++) {
      for (let j = i + 1; j < surfAtoms.length; j++) {
        const a1 = surfAtoms[i], a2 = surfAtoms[j];
        const d = Math.hypot(a1.cx - a2.cx, a1.cy - a2.cy, a1.cz - a2.cz);
        if (d > 1.2 && d <= 4.2) {
          const mx = (a1.cx + a2.cx) / 2, my = (a1.cy + a2.cy) / 2, mz = (a1.cz + a2.cz) / 2;
          const [mu, mv, mw] = castepCartToFrac(mx, my, mz, vecs);
          const key = `${Math.round(mu*100)}_${Math.round(mv*100)}`;
          if (seenPairs.has(key)) continue;
          seenPairs.add(key);
          sites.push({
            type: "bridge",
            shortLabel: `Bridge(${a1.label}-${a2.label})`,
            desc: `Bridge #${sites.length+1}: ${a1.label}–${a2.label} (d=${d.toFixed(2)}Å) — u=${mu.toFixed(3)}, v=${mv.toFixed(3)}`,
            u: mu, v: mv, w: mw,
            cx: mx, cy: my, cz: mz
          });
        }
      }
    }
  } else if (siteType === "hollow3") {
    const seenHollows = new Set();
    for (let i = 0; i < surfAtoms.length; i++) {
      for (let j = i + 1; j < surfAtoms.length; j++) {
        const a1 = surfAtoms[i], a2 = surfAtoms[j];
        const d12 = Math.hypot(a1.cx - a2.cx, a1.cy - a2.cy);
        if (d12 < 1.3 || d12 > 4.3) continue;
        for (let k = j + 1; k < surfAtoms.length; k++) {
          const a3 = surfAtoms[k];
          const d13 = Math.hypot(a1.cx - a3.cx, a1.cy - a3.cy);
          const d23 = Math.hypot(a2.cx - a3.cx, a2.cy - a3.cy);
          if (d13 >= 1.3 && d13 <= 4.3 && d23 >= 1.3 && d23 <= 4.3) {
            const hx = (a1.cx + a2.cx + a3.cx) / 3;
            const hy = (a1.cy + a2.cy + a3.cy) / 3;
            const hz = (a1.cz + a2.cz + a3.cz) / 3;
            const [hu, hv, hw] = castepCartToFrac(hx, hy, hz, vecs);
            const key = `${Math.round(hu*100)}_${Math.round(hv*100)}`;
            if (seenHollows.has(key)) continue;
            seenHollows.add(key);
            // Classify HCP (subsurface atom directly below xy) vs FCC hollow
            const underAtom = subSurfAtoms.find(sub => Math.hypot(sub.cx - hx, sub.cy - hy) < 0.75);
            const hKind = underAtom ? `HCP Hollow (over ${underAtom.label})` : "FCC Hollow (True Cavity)";
            sites.push({
              type: "hollow3",
              shortLabel: `Hollow(${a1.label}-${a2.label}-${a3.label})`,
              desc: `${hKind} #${sites.length+1}: Δ(${a1.label},${a2.label},${a3.label}) — u=${hu.toFixed(3)}, v=${hv.toFixed(3)}`,
              u: hu, v: hv, w: hw,
              cx: hx, cy: hy, cz: hz
            });
          }
        }
      }
    }
  } else if (siteType === "hollow4") {
    // 4-Fold hollow or cell center + quarter centers
    const basePts = [[0.5, 0.5], [0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75], [0.3333, 0.6667], [0.6667, 0.3333]];
    const refZ = side === "top" ? maxZ : minZ;
    basePts.forEach((pt, idx) => {
      const [cx, cy, cz] = castepFracToCart(pt[0], pt[1], refZ / (st.lattice.c || 20), vecs);
      sites.push({
        type: "hollow4",
        shortLabel: `Hollow4(#${idx+1})`,
        desc: `4-Fold / Symmetry Hollow #${idx+1} — u=${pt[0].toFixed(3)}, v=${pt[1].toFixed(3)}`,
        u: pt[0], v: pt[1], w: refZ / (st.lattice.c || 20),
        cx, cy, cz: refZ
      });
    });
  } else {
    const cu = parseFloat(document.getElementById("castep-ads-u")?.value || "0.3333");
    const cv = parseFloat(document.getElementById("castep-ads-v")?.value || "0.6667");
    const cw = parseFloat(document.getElementById("castep-ads-w")?.value || "0.7200");
    const [cx, cy, cz] = castepFracToCart(cu, cv, cw, vecs);
    sites.push({
      type: "custom",
      shortLabel: `Custom(${cu.toFixed(2)},${cv.toFixed(2)})`,
      desc: `Custom Fractional Position (${cu.toFixed(4)}, ${cv.toFixed(4)}, ${cw.toFixed(4)})`,
      u: cu, v: cv, w: cw, cx, cy, cz
    });
  }

  CASTEP_STUDIO_STATE.view3D.candidateSites = sites;
  CASTEP_STUDIO_STATE.view3D.previewSiteIndex = 0;

  const selEl = document.getElementById("castep-ads-site-select");
  if (selEl) {
    selEl.innerHTML = sites.map((s, idx) => `<option value="${idx}">${escapeHtml(s.desc)}</option>`).join("");
  }
  renderCastep3DScene();
}
window.detectCastepAdsorptionSites = detectCastepAdsorptionSites;

function previewSelectedCastepAdsorptionSite() {
  const idx = parseInt(document.getElementById("castep-ads-site-select")?.value || "0", 10);
  CASTEP_STUDIO_STATE.view3D.previewSiteIndex = isNaN(idx) ? 0 : idx;
  renderCastep3DScene();
}
window.previewSelectedCastepAdsorptionSite = previewSelectedCastepAdsorptionSite;

function insertAdsorbateAtCartesianBase(baseX, baseY, baseZ, side, heightA, species, orient) {
  const st = CASTEP_STUDIO_STATE.structure;
  const signZ = side === "bottom" ? -1.0 : 1.0;
  const anchorZ = baseZ + signZ * heightA;

  const molDef = CASTEP_ADSORBATE_MOLECULES[species];
  const addedLabels = [];

  if (molDef) {
    molDef.forEach(part => {
      let dx = part.dx, dy = part.dy, dz = part.dz * signZ;
      if (orient === "horizontal") {
        // Rotate molecule 90 deg so its Z-axis aligns with X
        dx = part.dz;
        dz = part.dx * signZ;
      }
      const [u, v, w] = castepCartToFrac(baseX + dx, baseY + dy, anchorZ + dz, st.vectors);
      const count = st.atoms.filter(a => a.element === part.el).length + 1;
      const lbl = `${part.el}${count}`;
      addedLabels.push(lbl);
      st.atoms.push({
        element: part.el,
        label: lbl,
        x: u, y: v, z: w,
        fixed: false,
        isAdsorbate: true,
        fx: 0, fy: 0, fz: 0,
        charge: null
      });
    });
  } else {
    const el = castepCleanElement(species);
    const [u, v, w] = castepCartToFrac(baseX, baseY, anchorZ, st.vectors);
    const count = st.atoms.filter(a => a.element === el).length + 1;
    const lbl = `${el}${count}`;
    addedLabels.push(lbl);
    st.atoms.push({
      element: el,
      label: lbl,
      x: u, y: v, z: w,
      fixed: false,
      fx: 0, fy: 0, fz: 0,
      charge: null
    });
  }
  return addedLabels;
}

function placeCastepAdsorbateAtSite() {
  const siteType = document.getElementById("castep-ads-site-type")?.value || "top";
  const species = document.getElementById("castep-ads-species")?.value || "H";
  const heightA = parseFloat(document.getElementById("castep-ads-height")?.value || "1.80");
  const side = document.getElementById("castep-ads-side")?.value || "top";
  const orient = document.getElementById("castep-ads-orient")?.value || "vertical";

  if (siteType === "custom") {
    detectCastepAdsorptionSites();
  }
  const sites = CASTEP_STUDIO_STATE.view3D.candidateSites || [];
  const idx = CASTEP_STUDIO_STATE.view3D.previewSiteIndex || 0;
  const site = sites[idx] || sites[0];
  if (!site) {
    if (typeof showToast === "function") showToast("No candidate site available. Click Refresh Sites first.", "warn");
    return;
  }

  pushCastepUndoSnapshot();
  const h = siteType === "custom" ? 0.0 : heightA;
  const added = insertAdsorbateAtCartesianBase(site.cx, site.cy, site.cz, side, h, species, orient);
  afterCastepStructureModified(`Placed ${species} (${added.join(", ")}) at ${site.shortLabel} (Δz = ${h.toFixed(2)} Å).`);
}
window.placeCastepAdsorbateAtSite = placeCastepAdsorbateAtSite;

function placeCastepAdsorbateFromSelectedAtoms() {
  const sel = Array.from(CASTEP_STUDIO_STATE.view3D.selectedAtomIndices);
  const st = CASTEP_STUDIO_STATE.structure;
  if (!sel.length) {
    if (typeof showToast === "function") showToast("Click 1 atom (Top), 2 atoms (Bridge), or 3+ atoms (Hollow) in the 3D viewer first!", "warn");
    return;
  }
  const species = document.getElementById("castep-ads-species")?.value || "H";
  const heightA = parseFloat(document.getElementById("castep-ads-height")?.value || "1.80");
  const side = document.getElementById("castep-ads-side")?.value || "top";
  const orient = document.getElementById("castep-ads-orient")?.value || "vertical";

  let sumX = 0, sumY = 0, sumZ = 0;
  const names = [];
  sel.forEach(i => {
    const at = st.atoms[i];
    if (at) {
      const [cx, cy, cz] = castepFracToCart(at.x, at.y, at.z, st.vectors);
      sumX += cx; sumY += cy; sumZ += cz;
      names.push(at.label || at.element);
    }
  });
  const bx = sumX / sel.length, by = sumY / sel.length, bz = sumZ / sel.length;
  const siteKind = sel.length === 1 ? "Top" : (sel.length === 2 ? "Bridge" : `${sel.length}-Fold Hollow`);

  pushCastepUndoSnapshot();
  const added = insertAdsorbateAtCartesianBase(bx, by, bz, side, heightA, species, orient);
  afterCastepStructureModified(`Placed ${species} (${added.join(", ")}) at ${siteKind} site above [${names.join(", ")}].`);
}
window.placeCastepAdsorbateFromSelectedAtoms = placeCastepAdsorbateFromSelectedAtoms;

// --- E. Point Defects, Janus Layer Substitution & Selective Constraints ---
function deleteSelectedCastepAtoms() {
  const sel = CASTEP_STUDIO_STATE.view3D.selectedAtomIndices;
  if (!sel.size) {
    if (typeof showToast === "function") showToast("Select one or more atoms in the 3D view or table first to create a vacancy.", "warn");
    return;
  }
  pushCastepUndoSnapshot();
  const count = sel.size;
  CASTEP_STUDIO_STATE.structure.atoms = CASTEP_STUDIO_STATE.structure.atoms.filter((_, idx) => !sel.has(idx));
  sel.clear();
  afterCastepStructureModified(`Deleted ${count} atom(s) (vacancy defect created).`);
}
window.deleteSelectedCastepAtoms = deleteSelectedCastepAtoms;

function substituteSelectedCastepAtoms() {
  const sel = CASTEP_STUDIO_STATE.view3D.selectedAtomIndices;
  const newEl = castepCleanElement(document.getElementById("castep-sub-element")?.value || "P");
  if (!sel.size) {
    if (typeof showToast === "function") showToast("Select one or more atoms in the 3D view or table first to substitute.", "warn");
    return;
  }
  pushCastepUndoSnapshot();
  let count = 0;
  CASTEP_STUDIO_STATE.structure.atoms.forEach((at, idx) => {
    if (sel.has(idx)) {
      at.element = newEl;
      at.label = `${newEl}${idx+1}`;
      count++;
    }
  });
  afterCastepStructureModified(`Substituted ${count} atom(s) with ${newEl}.`);
}
window.substituteSelectedCastepAtoms = substituteSelectedCastepAtoms;

function applyCastepJanusLayerSubstitution() {
  const side = document.getElementById("castep-janus-layer-side")?.value || "top";
  const fromEl = castepCleanElement(document.getElementById("castep-janus-from")?.value || "N");
  const toEl = castepCleanElement(document.getElementById("castep-janus-to")?.value || "P");
  const st = CASTEP_STUDIO_STATE.structure;
  const matching = st.atoms.filter(a => a.element.toLowerCase() === fromEl.toLowerCase());
  if (!matching.length) {
    if (typeof showToast === "function") showToast(`No atoms of element ${fromEl} found in current structure.`, "warn");
    return;
  }
  const ws = matching.map(a => a.z);
  const extW = side === "top" ? Math.max(...ws) : Math.min(...ws);
  pushCastepUndoSnapshot();
  let replaced = 0;
  st.atoms.forEach((at, idx) => {
    if (at.element.toLowerCase() === fromEl.toLowerCase() && Math.abs(at.z - extW) <= 0.06) {
      at.element = toEl;
      at.label = `${toEl}_${idx+1}`;
      replaced++;
    }
  });
  afterCastepStructureModified(`Converted ${replaced} ${fromEl} atom(s) in ${side} layer to ${toEl} (Janus structure built).`);
}
window.applyCastepJanusLayerSubstitution = applyCastepJanusLayerSubstitution;

function applyCastepFixBottomLayers() {
  const thresh = parseFloat(document.getElementById("castep-fix-z-thresh")?.value || "0.45");
  pushCastepUndoSnapshot();
  let fixedCount = 0;
  CASTEP_STUDIO_STATE.structure.atoms.forEach(at => {
    if (at.z < thresh) { at.fixed = true; fixedCount++; }
  });
  afterCastepStructureModified(`Fixed ${fixedCount} bottom-layer atoms with fractional w < ${thresh}.`);
}
window.applyCastepFixBottomLayers = applyCastepFixBottomLayers;

function unfixAllCastepAtoms() {
  pushCastepUndoSnapshot();
  CASTEP_STUDIO_STATE.structure.atoms.forEach(at => { at.fixed = false; });
  afterCastepStructureModified("Removed ionic constraints from all atoms.");
}
window.unfixAllCastepAtoms = unfixAllCastepAtoms;

function wrapCastepAtomsToUnitCell() {
  pushCastepUndoSnapshot();
  CASTEP_STUDIO_STATE.structure.atoms.forEach(at => {
    at.x = ((at.x % 1) + 1) % 1;
    at.y = ((at.y % 1) + 1) % 1;
    at.z = ((at.z % 1) + 1) % 1;
  });
  afterCastepStructureModified("Wrapped all atomic fractional coordinates into [0, 1).");
}
window.wrapCastepAtomsToUnitCell = wrapCastepAtomsToUnitCell;

function rattleCastepAtoms(ampA = 0.02) {
  pushCastepUndoSnapshot();
  const st = CASTEP_STUDIO_STATE.structure;
  const lat = st.lattice;
  st.atoms.forEach(at => {
    if (at.fixed) return;
    at.x += ((Math.random() - 0.5) * 2 * ampA) / (lat.a || 5.0);
    at.y += ((Math.random() - 0.5) * 2 * ampA) / (lat.b || 5.0);
    at.z += ((Math.random() - 0.5) * 2 * ampA) / (lat.c || 15.0);
  });
  afterCastepStructureModified(`Applied ±${ampA} Å random symmetry-breaking perturbation.`);
}
window.rattleCastepAtoms = rattleCastepAtoms;

// --- F. Geometry Trajectory Scrubber (.geom) ---
function updateCastepGeomScrubberUI() {
  const bar = document.getElementById("castep-geom-scrubber");
  const frames = CASTEP_STUDIO_STATE.geomFrames || [];
  if (!bar) return;
  if (frames.length <= 1) {
    bar.style.display = "none";
    return;
  }
  bar.style.display = "block";
  const slider = document.getElementById("castep-geom-slider");
  const lbl = document.getElementById("castep-geom-step-label");
  const met = document.getElementById("castep-geom-metrics-label");
  const idx = Math.max(0, Math.min(frames.length - 1, CASTEP_STUDIO_STATE.activeGeomFrameIdx));
  if (slider) {
    slider.max = String(frames.length - 1);
    slider.value = String(idx);
  }
  const fr = frames[idx];
  if (lbl) lbl.textContent = `Step ${idx} / ${frames.length - 1}`;
  if (met && fr) {
    met.textContent = `E = ${fr.energyEv.toFixed(4)} eV | |F|max = ${fr.maxForceEvA.toFixed(4)} eV/Å | V = ${fr.volume.toFixed(2)} Å³`;
  }
}

function selectCastepGeomFrame(idx) {
  const frames = CASTEP_STUDIO_STATE.geomFrames || [];
  if (!frames.length) return;
  const clamped = Math.max(0, Math.min(frames.length - 1, idx));
  CASTEP_STUDIO_STATE.activeGeomFrameIdx = clamped;
  const fr = frames[clamped];
  CASTEP_STUDIO_STATE.structure.vectors = JSON.parse(JSON.stringify(fr.vectors));
  CASTEP_STUDIO_STATE.structure.lattice = JSON.parse(JSON.stringify(fr.lattice));
  CASTEP_STUDIO_STATE.structure.atoms = JSON.parse(JSON.stringify(fr.atoms));
  updateCastepGeomScrubberUI();
  syncCastepStructureToBuilderInputs();
  renderCastepAtomsTable();
  renderCastep3DScene();
}
window.selectCastepGeomFrame = selectCastepGeomFrame;

function stepCastepGeomFrame(target) {
  const frames = CASTEP_STUDIO_STATE.geomFrames || [];
  if (!frames.length) return;
  selectCastepGeomFrame(target < 0 ? frames.length - 1 : target);
}
window.stepCastepGeomFrame = stepCastepGeomFrame;

function togglePlayCastepGeomTrajectory() {
  const btn = document.getElementById("castep-geom-play-btn");
  if (CASTEP_STUDIO_STATE.geomPlayTimer) {
    clearInterval(CASTEP_STUDIO_STATE.geomPlayTimer);
    CASTEP_STUDIO_STATE.geomPlayTimer = null;
    if (btn) btn.textContent = "▶️ Play";
    return;
  }
  const frames = CASTEP_STUDIO_STATE.geomFrames || [];
  if (frames.length <= 1) return;
  if (btn) btn.textContent = "⏸️ Pause";
  CASTEP_STUDIO_STATE.geomPlayTimer = setInterval(() => {
    let next = CASTEP_STUDIO_STATE.activeGeomFrameIdx + 1;
    if (next >= frames.length) next = 0;
    selectCastepGeomFrame(next);
  }, 550);
}
window.togglePlayCastepGeomTrajectory = togglePlayCastepGeomTrajectory;

// ============================================================================
// 6. Editable Atomic Coordinates Table & Multi-Format Generators
// ============================================================================

function renderCastepAtomsTable() {
  const tbody = document.getElementById("castep-atoms-tbody");
  if (!tbody) return;
  const st = CASTEP_STUDIO_STATE.structure;
  const atoms = st.atoms || [];
  const vecs = st.vectors;
  const badge = document.getElementById("castep-atoms-count-badge");
  if (badge) badge.textContent = `${atoms.length} atoms`;

  const ws = atoms.map(a => a.z);
  const maxW = ws.length ? Math.max(...ws) : 1;
  const minW = ws.length ? Math.min(...ws) : 0;

  tbody.innerHTML = atoms.map((at, idx) => {
    const isSel = CASTEP_STUDIO_STATE.view3D.selectedAtomIndices.has(idx);
    const [cx, cy, cz] = castepFracToCart(at.x, at.y, at.z, vecs);
    const fmag = Math.hypot(at.fx || 0, at.fy || 0, at.fz || 0);
    const col = typeof getElementColor === "function" ? getElementColor(at.element) : "#38bdf8";

    let layerBadge = `<span class="badge" style="background:#f1f5f9; color:#475569; font-size:10px;">Core</span>`;
    if (maxW - at.z <= 0.045) layerBadge = `<span class="badge" style="background:#dbeafe; color:#1d4ed8; font-size:10px;">Top Surface</span>`;
    else if (at.z - minW <= 0.045) layerBadge = `<span class="badge" style="background:#fef3c7; color:#b45309; font-size:10px;">Bottom Layer</span>`;

    return `
      <tr class="${isSel ? "selected-atom-row" : ""}">
        <td><input type="checkbox" ${isSel ? "checked" : ""} onchange="toggleSelectCastepAtomRow(${idx}, this.checked)" /></td>
        <td>${idx + 1}</td>
        <td>
          <div style="display:flex; align-items:center; gap:5px;">
            <span style="width:10px; height:10px; border-radius:50%; background:${col}; display:inline-block;"></span>
            <input type="text" value="${escapeHtml(at.element)}" style="width:38px; border:1px solid #cbd5e1; border-radius:4px; padding:1px 4px; font-weight:700; font-size:11.5px;" onchange="updateCastepAtomField(${idx}, 'element', this.value)" />
          </div>
        </td>
        <td><input type="text" value="${escapeHtml(at.label || at.element)}" style="width:64px; border:1px solid #cbd5e1; border-radius:4px; padding:1px 4px; font-size:11.5px;" onchange="updateCastepAtomField(${idx}, 'label', this.value)" /></td>
        <td><input type="number" step="0.001" value="${Number(at.x).toFixed(5)}" style="width:78px; border:1px solid #cbd5e1; border-radius:4px; padding:1px 4px; font-size:11.5px;" onchange="updateCastepAtomField(${idx}, 'x', this.value)" /></td>
        <td><input type="number" step="0.001" value="${Number(at.y).toFixed(5)}" style="width:78px; border:1px solid #cbd5e1; border-radius:4px; padding:1px 4px; font-size:11.5px;" onchange="updateCastepAtomField(${idx}, 'y', this.value)" /></td>
        <td><input type="number" step="0.001" value="${Number(at.z).toFixed(5)}" style="width:78px; border:1px solid #cbd5e1; border-radius:4px; padding:1px 4px; font-size:11.5px;" onchange="updateCastepAtomField(${idx}, 'z', this.value)" /></td>
        <td>${cx.toFixed(3)}</td>
        <td>${cy.toFixed(3)}</td>
        <td>${cz.toFixed(3)}</td>
        <td>${layerBadge}</td>
        <td>${fmag > 0 ? fmag.toFixed(4) : "0.0000"}</td>
        <td>${at.charge !== null && at.charge !== undefined ? Number(at.charge).toFixed(2) : "—"}</td>
        <td>
          <button type="button" class="castep-preset-chip" style="${at.fixed ? "background:#ffedd5; color:#c2410c; border-color:#fdba74;" : ""}" onclick="updateCastepAtomField(${idx}, 'fixed', ${!at.fixed})">
            ${at.fixed ? "🔒 Fixed" : "🔓 Free"}
          </button>
        </td>
        <td>
          <button type="button" class="castep-preset-chip" style="color:#dc2626;" onclick="deleteSingleCastepAtom(${idx})" title="Delete Atom">✕</button>
        </td>
      </tr>
    `;
  }).join("");
}
window.renderCastepAtomsTable = renderCastepAtomsTable;

function toggleSelectCastepAtomRow(idx, checked) {
  const sel = CASTEP_STUDIO_STATE.view3D.selectedAtomIndices;
  if (checked) sel.add(idx);
  else sel.delete(idx);
  renderCastepAtomsTable();
  renderCastep3DScene();
  updateCastep3DSelectionHud();
}
window.toggleSelectCastepAtomRow = toggleSelectCastepAtomRow;

function toggleSelectAllCastepAtoms(checked) {
  const sel = CASTEP_STUDIO_STATE.view3D.selectedAtomIndices;
  sel.clear();
  if (checked) {
    (CASTEP_STUDIO_STATE.structure.atoms || []).forEach((_, idx) => sel.add(idx));
  }
  renderCastepAtomsTable();
  renderCastep3DScene();
  updateCastep3DSelectionHud();
}
window.toggleSelectAllCastepAtoms = toggleSelectAllCastepAtoms;

function updateCastepAtomField(idx, field, val) {
  const at = CASTEP_STUDIO_STATE.structure.atoms[idx];
  if (!at) return;
  pushCastepUndoSnapshot();
  if (field === "element") {
    at.element = castepCleanElement(val);
  } else if (field === "label") {
    at.label = String(val).trim() || at.element;
  } else if (field === "x" || field === "y" || field === "z") {
    const num = parseFloat(val);
    if (!isNaN(num)) at[field] = num;
  } else if (field === "fixed") {
    at.fixed = Boolean(val);
  }
  afterCastepStructureModified();
}
window.updateCastepAtomField = updateCastepAtomField;

function deleteSingleCastepAtom(idx) {
  pushCastepUndoSnapshot();
  CASTEP_STUDIO_STATE.structure.atoms.splice(idx, 1);
  CASTEP_STUDIO_STATE.view3D.selectedAtomIndices.clear();
  afterCastepStructureModified("Deleted atom row.");
}
window.deleteSingleCastepAtom = deleteSingleCastepAtom;

function addManualCastepAtomRow() {
  pushCastepUndoSnapshot();
  const st = CASTEP_STUDIO_STATE.structure;
  const n = st.atoms.length + 1;
  st.atoms.push({
    element: "H",
    label: `H${n}`,
    x: 0.5, y: 0.5, z: 0.7,
    fixed: false,
    fx: 0, fy: 0, fz: 0,
    charge: null
  });
  afterCastepStructureModified("Added new atom row.");
}
window.addManualCastepAtomRow = addManualCastepAtomRow;

function sortCastepAtomsBy(mode) {
  pushCastepUndoSnapshot();
  const atoms = CASTEP_STUDIO_STATE.structure.atoms;
  if (mode === "z") {
    atoms.sort((a, b) => a.z - b.z || a.element.localeCompare(b.element));
  } else {
    atoms.sort((a, b) => a.element.localeCompare(b.element) || a.z - b.z);
  }
  afterCastepStructureModified(`Sorted atoms by ${mode === "z" ? "Z-coordinate" : "Element"}.`);
}
window.sortCastepAtomsBy = sortCastepAtomsBy;

// --- File Format Generators (.cell, .param, .xsd, .cif, POSCAR, .xyz) ---
function generateCastepCellContent() {
  const st = CASTEP_STUDIO_STATE.structure;
  const [a, b, c] = st.vectors;
  const f15 = (n) => Number(n || 0).toFixed(15).padStart(22, " ");
  let out = "%BLOCK LATTICE_CART\n";
  out += `${f15(a[0])} ${f15(a[1])} ${f15(a[2])}\n`;
  out += `${f15(b[0])} ${f15(b[1])} ${f15(b[2])}\n`;
  out += `${f15(c[0])} ${f15(c[1])} ${f15(c[2])}\n`;
  out += "%ENDBLOCK LATTICE_CART\n\n";

  out += "%BLOCK POSITIONS_FRAC\n";
  const elIdxMap = {};
  const constraintsLines = [];
  let constrId = 1;

  (st.atoms || []).forEach(at => {
    const el = castepCleanElement(at.element);
    elIdxMap[el] = (elIdxMap[el] || 0) + 1;
    out += `  ${el.padEnd(3, " ")} ${Number(at.x).toFixed(16).padStart(20, " ")} ${Number(at.y).toFixed(16).padStart(20, " ")} ${Number(at.z).toFixed(16).padStart(20, " ")}\n`;
    if (at.fixed) {
      constraintsLines.push(`  ${String(constrId++).padStart(4, " ")}   ${el.padEnd(3, " ")}   ${String(elIdxMap[el]).padStart(4, " ")}   1.0000000000   0.0000000000   0.0000000000`);
      constraintsLines.push(`  ${String(constrId++).padStart(4, " ")}   ${el.padEnd(3, " ")}   ${String(elIdxMap[el]).padStart(4, " ")}   0.0000000000   1.0000000000   0.0000000000`);
      constraintsLines.push(`  ${String(constrId++).padStart(4, " ")}   ${el.padEnd(3, " ")}   ${String(elIdxMap[el]).padStart(4, " ")}   0.0000000000   0.0000000000   1.0000000000`);
    }
  });
  out += "%ENDBLOCK POSITIONS_FRAC\n\n";

  if (st.kpointsBlock) {
    out += st.kpointsBlock + "\n\n";
  } else {
    out += "KPOINTS_MP_GRID 5 5 1\n\n";
  }

  out += "FIX_COM : false\n";
  out += "%BLOCK IONIC_CONSTRAINTS\n";
  if (constraintsLines.length) out += constraintsLines.join("\n") + "\n";
  out += "%ENDBLOCK IONIC_CONSTRAINTS\n\n";

  const uniqEls = [...new Set((st.atoms || []).map(a => castepCleanElement(a.element)))];
  out += "%BLOCK SPECIES_MASS\n";
  uniqEls.forEach(el => {
    const m = (typeof ELEMENTS_DATA !== "undefined" && ELEMENTS_DATA.find(e => e.s === el)?.m) || 28.085;
    out += `     ${el.padStart(3, " ")}     ${Number(m).toFixed(10)}\n`;
  });
  out += "%ENDBLOCK SPECIES_MASS\n\n";

  if (st.speciesPotBlock) {
    out += st.speciesPotBlock + "\n";
  } else {
    out += "%BLOCK SPECIES_POT\n";
    uniqEls.forEach(el => {
      out += `     ${el.padStart(3, " ")}  ${el}_00PBE.usp\n`;
    });
    out += "%ENDBLOCK SPECIES_POT\n";
  }
  return out;
}

function generateCastepParamContent() {
  const task = document.getElementById("castep-param-task")?.value || "GeometryOptimization";
  const xc = document.getElementById("castep-param-xc")?.value || "PBE";
  const cutoff = document.getElementById("castep-param-cutoff")?.value || "700";
  const etol = document.getElementById("castep-param-etol")?.value || "5.0e-7";
  const maxscf = document.getElementById("castep-param-maxscf")?.value || "200";
  const geomM = document.getElementById("castep-param-geom-method")?.value || "LBFGS";
  const ftol = document.getElementById("castep-param-ftol")?.value || "0.01";
  const sedc = document.getElementById("castep-param-sedc")?.value || "G06";
  const spin = document.getElementById("castep-param-spin")?.checked;
  const soc = document.getElementById("castep-param-soc")?.checked;
  const elf = document.getElementById("castep-param-elf")?.checked;
  const hirsh = document.getElementById("castep-param-hirsh")?.checked;
  const pdos = document.getElementById("castep-param-pdos")?.checked;

  const lines = [
    `task : ${task}`,
    `comment : CASTEP calculation generated by MatSci Nexus CASTEP Studio 2026`,
    `xc_functional : ${xc}`,
    `spin_polarized : ${spin ? "true" : "false"}`,
    `spin_orbit_coupling : ${soc ? "true" : "false"}`,
    `cut_off_energy : ${Number(cutoff).toFixed(15)}`,
    `grid_scale : 1.750000000000000`,
    `fine_grid_scale : 2.000000000000000`,
    `elec_energy_tol : ${etol}`,
    `max_scf_cycles : ${maxscf}`,
    `metals_method : dm`,
    `mixing_scheme : Pulay`,
    `smearing_width : 0.100000000000000`
  ];
  if (sedc && sedc !== "off") {
    lines.push(`sedc_apply : true`);
    lines.push(`sedc_scheme : ${sedc}`);
  }
  if (/GeometryOptimization/i.test(task)) {
    lines.push(`geom_method : ${geomM}`);
    lines.push(`geom_force_tol : ${ftol}`);
    lines.push(`geom_energy_tol : 2.0e-5`);
    lines.push(`geom_max_iter : 200`);
  }
  lines.push(`calculate_ELF : ${elf ? "true" : "false"}`);
  lines.push(`calculate_hirshfeld : ${hirsh ? "true" : "false"}`);
  lines.push(`popn_calculate : true`);
  lines.push(`pdos_calculate_weights : ${pdos ? "true" : "false"}`);
  return lines.join("\n") + "\n";
}

function generateMaterialsStudioXsdContent() {
  const st = CASTEP_STUDIO_STATE.structure;
  const [a, b, c] = st.vectors;
  let xml = `<?xml version="1.0" encoding="latin1"?>\n<!DOCTYPE XSD []>\n<XSD Version="26.1" WrittenBy="MatSci Nexus CASTEP Studio 26.1">\n`;
  xml += `\t<AtomisticTreeRoot ID="1" NumProperties="1" NumChildren="1">\n`;
  xml += `\t\t<SymmetrySystem ID="2" Name="${escapeHtml(st.formula)}">\n`;
  xml += `\t\t\t<SpaceGroup ID="3" Parent="2" Name="P1" AVector="${a.join(",")}" BVector="${b.join(",")}" CVector="${c.join(",")}" GroupName="P1" ITNumber="1" System="${escapeHtml(st.crystalSystem || "Triclinic")}"/>\n`;
  (st.atoms || []).forEach((at, i) => {
    xml += `\t\t\t<Atom3d ID="${i + 10}" Parent="2" Name="${escapeHtml(at.label || `${at.element}${i+1}`)}" UserID="${i + 1}" DisplayStyle="Ball and Stick" XYZ="${Number(at.x).toFixed(12)},${Number(at.y).toFixed(12)},${Number(at.z).toFixed(12)}" Components="${escapeHtml(at.element)}"/>\n`;
  });
  xml += `\t\t</SymmetrySystem>\n\t</AtomisticTreeRoot>\n</XSD>\n`;
  return xml;
}

function generateCastepCifContent(options = {}) {
  const st = CASTEP_STUDIO_STATE.structure;
  if (typeof window !== "undefined" && typeof window.exportVestaStandardCif === "function") {
    return window.exportVestaStandardCif(st, options);
  }
  const lat = st.lattice;
  const vol = castepCellVolume(st.vectors);
  let cif = `# CIF generated by MatSci Nexus CASTEP Studio\ndata_${(st.formula || "CASTEP").replace(/[^A-Za-z0-9_]/g, "_")}\n`;
  cif += `_chemical_name_common '${st.name || st.formula}'\n`;
  cif += `_chemical_formula_sum '${st.formula}'\n`;
  cif += `_symmetry_space_group_name_H-M 'P 1'\n`;
  cif += `_symmetry_Int_Tables_number 1\n`;
  cif += `_cell_length_a ${Number(lat.a).toFixed(6)}\n`;
  cif += `_cell_length_b ${Number(lat.b).toFixed(6)}\n`;
  cif += `_cell_length_c ${Number(lat.c).toFixed(6)}\n`;
  cif += `_cell_angle_alpha ${Number(lat.alpha).toFixed(4)}\n`;
  cif += `_cell_angle_beta  ${Number(lat.beta).toFixed(4)}\n`;
  cif += `_cell_angle_gamma ${Number(lat.gamma).toFixed(4)}\n`;
  cif += `_cell_volume ${vol.toFixed(4)}\n\n`;
  cif += `loop_\n_symmetry_equiv_pos_as_xyz\n  'x, y, z'\n`;
  cif += `loop_\n_atom_site_label\n_atom_site_type_symbol\n_atom_site_fract_x\n_atom_site_fract_y\n_atom_site_fract_z\n_atom_site_occupancy\n`;
  (st.atoms || []).forEach((at, idx) => {
    cif += `${(at.label || `${at.element}${idx+1}`).padEnd(8, " ")} ${at.element.padEnd(4, " ")} ${Number(at.x).toFixed(6)} ${Number(at.y).toFixed(6)} ${Number(at.z).toFixed(6)} ${Number(at.occupancy ?? 1.0).toFixed(4)}\n`;
  });
  return cif;
}

function generateCastepPoscarContent() {
  const st = CASTEP_STUDIO_STATE.structure;
  const [a, b, c] = st.vectors;
  const byEl = {};
  (st.atoms || []).forEach(at => {
    const el = castepCleanElement(at.element);
    if (!byEl[el]) byEl[el] = [];
    byEl[el].push(at);
  });
  const els = Object.keys(byEl);
  const hasFixed = (st.atoms || []).some(at => at.fixed);

  let pos = `${st.formula} — Generated by MatSci Nexus CASTEP Studio\n1.00000000000000\n`;
  pos += `  ${a[0].toFixed(12).padStart(18, " ")} ${a[1].toFixed(12).padStart(18, " ")} ${a[2].toFixed(12).padStart(18, " ")}\n`;
  pos += `  ${b[0].toFixed(12).padStart(18, " ")} ${b[1].toFixed(12).padStart(18, " ")} ${b[2].toFixed(12).padStart(18, " ")}\n`;
  pos += `  ${c[0].toFixed(12).padStart(18, " ")} ${c[1].toFixed(12).padStart(18, " ")} ${c[2].toFixed(12).padStart(18, " ")}\n`;
  pos += `  ${els.join("   ")}\n`;
  pos += `  ${els.map(e => byEl[e].length).join("   ")}\n`;
  if (hasFixed) pos += `Selective dynamics\n`;
  pos += `Direct\n`;
  els.forEach(e => {
    byEl[e].forEach(at => {
      const flags = hasFixed ? (at.fixed ? "   F   F   F" : "   T   T   T") : "";
      pos += `  ${Number(at.x).toFixed(12).padStart(16, " ")} ${Number(at.y).toFixed(12).padStart(16, " ")} ${Number(at.z).toFixed(12).padStart(16, " ")}${flags} ! ${at.label || e}\n`;
    });
  });
  return pos;
}

function generateCastepXyzContent() {
  const st = CASTEP_STUDIO_STATE.structure;
  let xyz = `${st.atoms.length}\n${st.formula} — Lattice a=${st.lattice.a} b=${st.lattice.b} c=${st.lattice.c}\n`;
  (st.atoms || []).forEach(at => {
    const [cx, cy, cz] = castepFracToCart(at.x, at.y, at.z, st.vectors);
    xyz += `${at.element.padEnd(4, " ")} ${cx.toFixed(8).padStart(14, " ")} ${cy.toFixed(8).padStart(14, " ")} ${cz.toFixed(8).padStart(14, " ")}\n`;
  });
  return xyz;
}

// ============================================================================
// 7. Electronic Band Structure, DOS/PDOS & Convergence Plotters
// ============================================================================

function computeBandGapFromBandsObj(bandsObj) {
  if (!bandsObj || !bandsObj.kpoints || !bandsObj.kpoints.length) return null;
  const calcForSpin = (sIdx) => {
    let vbm = -1e9, cbm = 1e9, vbmK = 0, cbmK = 0;
    bandsObj.kpoints.forEach((kp, kIdx) => {
      const spinBands = kp.e?.[sIdx];
      if (!spinBands) return;
      spinBands.forEach(ev => {
        if (ev <= 0.005 && ev > vbm) { vbm = ev; vbmK = kIdx; }
        if (ev > 0.005 && ev < cbm) { cbm = ev; cbmK = kIdx; }
      });
    });
    if (vbm < -1e5 || cbm > 1e5) return null;
    const gap = Math.max(0, cbm - vbm);
    return {
      gapEv: Math.round(gap * 1000) / 1000,
      vbmEv: Math.round(vbm * 1000) / 1000,
      cbmEv: Math.round(cbm * 1000) / 1000,
      isDirect: vbmK === cbmK,
      vbmK, cbmK
    };
  };
  const up = calcForSpin(0);
  const dn = (bandsObj.ns >= 2) ? calcForSpin(1) : null;
  if (!up) return null;
  const overallGap = dn ? Math.min(up.gapEv, dn.gapEv) : up.gapEv;
  let phase = overallGap > 0.03 ? "Semiconductor / Insulator" : "Metallic";
  if (dn) {
    if ((up.gapEv > 0.05 && dn.gapEv <= 0.05) || (dn.gapEv > 0.05 && up.gapEv <= 0.05)) phase = "Half-Metal";
    else if (up.gapEv > 0.05 && dn.gapEv > 0.05) phase = Math.abs(up.gapEv - dn.gapEv) > 0.03 ? "Spin-Split Semiconductor" : "Collinear Semiconductor";
    else phase = "Collinear Spin-Polarized Metal";
  }
  return { ...up, gapEv: overallGap, upGapEv: up.gapEv, dnGapEv: dn ? dn.gapEv : null, isCollinear: !!dn, phase };
}

function setCastepElecWindow(emin, emax) {
  const elMin = document.getElementById("castep-elec-emin");
  const elMax = document.getElementById("castep-elec-emax");
  if (elMin) elMin.value = emin;
  if (elMax) elMax.value = emax;
  renderCastepElectronicPlots();
}
window.setCastepElecWindow = setCastepElecWindow;

function onCastepPdosModeChange() {
  const job = (CASTEP_STUDIO_STATE.jobs || []).find(j => j.id === CASTEP_STUDIO_STATE.activeJobId);
  populateCastepPdosTargetSelect(job);
  renderCastepElectronicPlots();
}
window.onCastepPdosModeChange = onCastepPdosModeChange;

function populateCastepPdosTargetSelect(job) {
  const sel = document.getElementById("castep-pdos-target-select");
  if (!sel) return;
  const prevVal = sel.value || "all";
  const mode = document.getElementById("castep-pdos-mode")?.value || "element_orbital";
  const pb = job?.pdos_bin_data;
  let html = `<option value="all">All Atoms / Species</option>`;
  if (pb && Array.isArray(pb.channels) && pb.channels.length) {
    const elements = [...new Set(pb.channels.map(c => c.element))];
    const atoms = [...new Set(pb.channels.map(c => c.atom))];
    if (mode !== "atom") {
      elements.forEach(el => {
        html += `<option value="el:${escapeHtml(el)}">Element: ${escapeHtml(el)}</option>`;
      });
    }
    atoms.slice(0, 80).forEach(at => {
      html += `<option value="atom:${escapeHtml(at)}">Atom: ${escapeHtml(at)}</option>`;
    });
  }
  sel.innerHTML = html;
  if ([...sel.options].some(o => o.value === prevVal)) sel.value = prevVal;
}

async function handleCastepPdosFilesUpload(event) {
  const files = Array.from(event.target?.files || []);
  if (!files.length) return;
  let job = (CASTEP_STUDIO_STATE.jobs || []).find(j => j.id === CASTEP_STUDIO_STATE.activeJobId);
  if (!job) {
    const seed = normalizeCastepSeedClient(files[0].name);
    job = enrichCastepJobSummary({
      id: "pdos_imp_" + Date.now(), title: `${seed} (PDOS Import)`, project: "Electronic Analysis",
      material: seed, folder: "Imported Electronic Files", seed, status: "Completed",
      files_list: files.map(f => f.name), _hydrated: true
    });
    CASTEP_STUDIO_STATE.jobs.unshift(job);
    CASTEP_STUDIO_STATE.activeJobId = job.id;
  }
  let pdosBuf = null, pdosName = "";
  for (const f of files) {
    const low = f.name.toLowerCase();
    if (low.endsWith(".pdos_bin")) {
      pdosBuf = await f.arrayBuffer();
      pdosName = f.name;
    } else if (low.endsWith("_bandstr.bands")) {
      job.bandstr_bands = parseCastepBandsTextClient(await f.text());
    } else if (low.endsWith(".bands")) {
      job.dos_bands = parseCastepBandsTextClient(await f.text());
    } else if (low.endsWith(".xcd")) {
      const txt = await f.text();
      if (low.includes("band")) job.band_xcd = parseCastepXcdXmlClient(txt, true);
      else if (low.includes("pdos") || low.includes("partial")) job.pdos_xcd = parseCastepXcdXmlClient(txt, false);
      else job.dos_xcd = parseCastepXcdXmlClient(txt, false);
    }
  }
  if (pdosBuf) {
    const refBands = job.dos_bands || job.bandstr_bands;
    if (refBands) {
      const spOrder = extractSpeciesOrderFromJobText(job);
      job.pdos_bin_data = parseCastepPdosBinArrayBuffer(pdosBuf, refBands, spOrder, pdosName);
    } else if (typeof showToast === "function") {
      showToast("Tip: Please select both *.pdos_bin AND *_DOS.bands together so eigenvalues match exact orbital weights!", "warning");
    }
  }
  job.has_band_dos = true;
  populateCastepPdosTargetSelect(job);
  renderCastepElectronicPlots();
  if (typeof showToast === "function") showToast("Loaded CASTEP Electronic / PDOS files!", "success");
  event.target.value = "";
}
window.handleCastepPdosFilesUpload = handleCastepPdosFilesUpload;

function convolveSparseHistGaussian(sparsePairs, eMinHist, dEHist, eGrid, sigma, energyShift = 0.0) {
  const nOut = eGrid.length;
  const out = new Float64Array(nOut);
  if (!sparsePairs || !sparsePairs.length) return out;
  const invSig = 1.0 / Math.max(0.015, sigma);
  const norm = invSig / Math.sqrt(2.0 * Math.PI);
  const cutoff = 4.0 * sigma;
  const outMin = eGrid[0], outMax = eGrid[nOut - 1];
  const outStep = (outMax - outMin) / Math.max(1, nOut - 1);
  const invOutStep = 1.0 / (outStep || 1e-6);

  for (let p = 0; p < sparsePairs.length; p++) {
    const binIdx = sparsePairs[p][0];
    const wt = sparsePairs[p][1];
    const ev = eMinHist + (binIdx + 0.5) * dEHist + energyShift;
    if (ev < outMin - cutoff || ev > outMax + cutoff) continue;
    const iStart = Math.max(0, Math.floor((ev - cutoff - outMin) * invOutStep));
    const iEnd = Math.min(nOut - 1, Math.ceil((ev + cutoff - outMin) * invOutStep));
    for (let i = iStart; i <= iEnd; i++) {
      const z = (eGrid[i] - ev) * invSig;
      out[i] += wt * Math.exp(-0.5 * z * z) * norm;
    }
  }
  return out;
}

const PDOS_CURVE_PALETTE = [
  "#2563eb", "#dc2626", "#16a34a", "#d97706", "#9333ea",
  "#0891b2", "#db2777", "#4f46e5", "#059669", "#ea580c"
];

function computeElectronicEnergyAlignment(job, alignMode = "vbm_auto") {
  // Exact physics synchronization between Materials Studio .xcd (VBM = 0 for semiconductors,
  // E_F = 0 for metals) and raw CASTEP .bands / .pdos_bin (mid-gap E_F = 0).
  const bandObj = job?.bandstr_bands || null;
  const dosObj  = job?.dos_bands || null;
  const pbObj   = job?.pdos_bin_data || null;
  const refObj  = bandObj || dosObj;

  // 1) Inspect raw bands eigenvalues across ALL spins & k-points to detect gap & raw VBM/CBM
  let vbmRaw = -1e9, cbmRaw = 1e9;
  let anyBandCrossesZero = false;
  if (refObj && Array.isArray(refObj.kpoints) && refObj.kpoints.length) {
    const ns = refObj.ns || 1;
    for (let s = 0; s < ns; s++) {
      const nb = (refObj.kpoints[0]?.e?.[s] || []).length;
      for (let b = 0; b < nb; b++) {
        let bMin = 1e9, bMax = -1e9;
        for (let k = 0; k < refObj.kpoints.length; k++) {
          const ev = refObj.kpoints[k]?.e?.[s]?.[b];
          if (ev === undefined || !Number.isFinite(ev)) continue;
          if (ev < bMin) bMin = ev;
          if (ev > bMax) bMax = ev;
          if (ev <= 0.015 && ev > vbmRaw) vbmRaw = ev;
          if (ev > 0.015 && ev < cbmRaw) cbmRaw = ev;
        }
        if (bMin < -0.025 && bMax > 0.025) anyBandCrossesZero = true;
      }
    }
  }
  const hasRawGap = (!anyBandCrossesZero && vbmRaw > -1e5 && cbmRaw < 1e5 && (cbmRaw - vbmRaw) >= 0.04);

  // 2) Inspect Materials Studio band_xcd VBM/CBM if present
  let hasBandXcd = !!(job?.band_xcd?.series?.length);
  let vbmXcd = -1e9, cbmXcd = 1e9;
  if (hasBandXcd) {
    job.band_xcd.series.forEach(s => {
      (s.segments || []).forEach(seg => {
        seg.forEach(pt => {
          const y = pt[1];
          if (!Number.isFinite(y)) return;
          if (y <= 0.015 && y > vbmXcd) vbmXcd = y;
          if (y > 0.015 && y < cbmXcd) cbmXcd = y;
        });
      });
    });
  }
  const xcdHasVbmAtZero = hasBandXcd && vbmXcd > -0.03 && vbmXcd <= 0.015 && cbmXcd < 1e5 && (cbmXcd - vbmXcd) >= 0.04;

  // 3) Reconcile any small Fermi header difference between _BandStr.bands and _DOS.bands/.pdos_bin
  //    e_dos_on_band_axis = e_dos + (ef_dos - ef_bandstr)
  const efBandEv = (bandObj && Number.isFinite(bandObj.ef_ev)) ? Number(bandObj.ef_ev) : null;
  const efDosEv  = (dosObj && Number.isFinite(dosObj.ef_ev))
    ? Number(dosObj.ef_ev)
    : ((pbObj && Number.isFinite(pbObj.ef_ev)) ? Number(pbObj.ef_ev) : null);
  const dosToBandEfDelta = (efBandEv !== null && efDosEv !== null) ? (efDosEv - efBandEv) : 0.0;

  let bandXcdShift = 0.0;
  let bandRawShift = 0.0;
  let dosXcdShift  = 0.0;
  let dosRawShift  = dosToBandEfDelta;
  let label = "E_F = 0.000 eV";

  if (alignMode === "raw_fermi") {
    // Align EVERYTHING onto raw CASTEP E - E_F = 0
    bandRawShift = 0.0;
    dosRawShift = dosToBandEfDelta;
    if (xcdHasVbmAtZero && hasRawGap) {
      bandXcdShift = vbmRaw - vbmXcd;
      dosXcdShift = bandXcdShift;
      label = `Raw CASTEP E_F = 0 (Band .xcd shifted ${bandXcdShift.toFixed(3)} eV)`;
    } else {
      label = "Raw CASTEP E_F = 0.000 eV";
    }
  } else {
    // Default "vbm_auto" (Materials Studio standard):
    // Semiconductors/insulators -> VBM = 0.000 eV on BOTH Band Structure AND PDOS!
    // Metals / half-metals      -> E_F = 0.000 eV on BOTH Band Structure AND PDOS!
    if (xcdHasVbmAtZero && hasRawGap) {
      const exactShift = vbmXcd - vbmRaw;
      bandXcdShift = 0.0;
      dosXcdShift = 0.0;
      bandRawShift = exactShift;
      dosRawShift = exactShift + dosToBandEfDelta;
      label = `VBM = 0.000 eV (PDOS synced ${dosRawShift >= 0 ? "+" : ""}${dosRawShift.toFixed(3)} eV)`;
    } else if (hasRawGap) {
      const exactShift = -vbmRaw;
      bandXcdShift = 0.0;
      dosXcdShift = 0.0;
      bandRawShift = exactShift;
      dosRawShift = exactShift + dosToBandEfDelta;
      label = `VBM = 0.000 eV (Synced ${exactShift >= 0 ? "+" : ""}${exactShift.toFixed(3)} eV from E_F)`;
    } else {
      // Metallic / half-metallic: E_F = 0 on both panels
      bandXcdShift = 0.0;
      dosXcdShift = 0.0;
      bandRawShift = 0.0;
      dosRawShift = dosToBandEfDelta;
      label = "E_F = 0.000 eV (Metallic / Half-Metallic)";
    }
  }

  return {
    alignMode,
    hasRawGap,
    vbmRaw: vbmRaw > -1e5 ? vbmRaw : null,
    cbmRaw: cbmRaw < 1e5 ? cbmRaw : null,
    vbmXcd: vbmXcd > -1e5 ? vbmXcd : null,
    cbmXcd: cbmXcd < 1e5 ? cbmXcd : null,
    bandXcdShift,
    bandRawShift,
    dosXcdShift,
    dosRawShift,
    dosToBandEfDelta,
    label
  };
}
window.computeElectronicEnergyAlignment = computeElectronicEnergyAlignment;

function buildPdosCurvesFromBin(pb, eGrid, sigma, mode, targetVal, flags, energyShift = 0.0) {
  const isSpin = (pb.ns >= 2);
  const eMinH = pb.e_min, dEH = pb.dE;
  const curves = [];

  const filterOrbitals = (ch) => {
    if (ch.orbital === "s" && !flags.showS) return false;
    if (ch.orbital === "p" && !flags.showP) return false;
    if (ch.orbital === "d" && !flags.showD) return false;
    if (ch.orbital === "f" && !flags.showF) return false;
    return true;
  };
  const filterTarget = (ch) => {
    if (!targetVal || targetVal === "all") return true;
    if (targetVal.startsWith("el:")) return ch.element === targetVal.slice(3);
    if (targetVal.startsWith("atom:")) return ch.atom === targetVal.slice(5);
    return true;
  };

  // Helper to sum multiple channels' sparse histograms onto dense grid and convolve
  const addGroupCurve = (label, color, chanList, isTotal = false) => {
    const sumUp = new Float64Array(eGrid.length);
    const sumDn = isSpin ? new Float64Array(eGrid.length) : null;
    for (const ch of chanList) {
      const u = convolveSparseHistGaussian(ch.up, eMinH, dEH, eGrid, sigma, energyShift);
      for (let i = 0; i < eGrid.length; i++) sumUp[i] += u[i];
      if (isSpin && ch.dn) {
        const d = convolveSparseHistGaussian(ch.dn, eMinH, dEH, eGrid, sigma, energyShift);
        for (let i = 0; i < eGrid.length; i++) sumDn[i] += d[i];
      }
    }
    curves.push({ label, color, up: sumUp, dn: sumDn, isTotal });
  };

  if (flags.showTot && pb.total_hist) {
    const totUp = convolveSparseHistGaussian(pb.total_hist.up, eMinH, dEH, eGrid, sigma, energyShift);
    const totDn = (isSpin && pb.total_hist.dn) ? convolveSparseHistGaussian(pb.total_hist.dn, eMinH, dEH, eGrid, sigma, energyShift) : null;
    curves.push({ label: "Total DOS", color: "#0f172a", up: totUp, dn: totDn, isTotal: true });
  }

  const matched = (pb.channels || []).filter(ch => filterOrbitals(ch) && filterTarget(ch));
  const orbColors = { s: "#2563eb", p: "#16a34a", d: "#dc2626", f: "#9333ea" };

  if (mode === "orbital") {
    ["s", "p", "d", "f"].forEach(orb => {
      const grp = matched.filter(c => c.orbital === orb);
      if (grp.length) addGroupCurve(`${orb}-orbital`, orbColors[orb] || "#2563eb", grp);
    });
  } else if (mode === "element") {
    const els = [...new Set(matched.map(c => c.element))];
    els.forEach((el, idx) => {
      const grp = matched.filter(c => c.element === el);
      if (grp.length) addGroupCurve(`${el} (all)`, PDOS_CURVE_PALETTE[idx % PDOS_CURVE_PALETTE.length], grp);
    });
  } else if (mode === "atom") {
    const atoms = [...new Set(matched.map(c => c.atom))];
    if (atoms.length === 1) {
      // Single atom selected -> break down its s, p, d, f orbitals!
      ["s", "p", "d", "f"].forEach(orb => {
        const grp = matched.filter(c => c.orbital === orb);
        if (grp.length) addGroupCurve(`${atoms[0]}-${orb}`, orbColors[orb] || "#2563eb", grp);
      });
    } else {
      // Multiple atoms -> display up to 16 on canvas, or ALL when exporting to CSV/XLSX
      const atomCap = flags.exportAll ? atoms.length : 16;
      atoms.slice(0, atomCap).forEach((at, idx) => {
        const grp = matched.filter(c => c.atom === at);
        if (grp.length) addGroupCurve(at, PDOS_CURVE_PALETTE[idx % PDOS_CURVE_PALETTE.length], grp);
      });
    }
  } else {
    // element_orbital (default): Mo-s, Mo-p, Mo-d, S-s, S-p, Se-s, Se-p, Co-d, Fe-d, N-p...
    const pairs = [];
    const seen = new Set();
    matched.forEach(c => {
      const k = `${c.element}-${c.orbital}`;
      if (!seen.has(k)) { seen.add(k); pairs.push([c.element, c.orbital, k]); }
    });
    const pairCap = flags.exportAll ? pairs.length : 24;
    pairs.slice(0, pairCap).forEach(([el, orb, lbl], idx) => {
      const grp = matched.filter(c => c.element === el && c.orbital === orb);
      if (grp.length) addGroupCurve(lbl, PDOS_CURVE_PALETTE[idx % PDOS_CURVE_PALETTE.length], grp);
    });
  }
  return { curves, isSpin };
}

function renderCastepElectronicPlots() {
  const canvas = document.getElementById("castep-electronic-canvas");
  if (!canvas) return;
  const job = (CASTEP_STUDIO_STATE.jobs || []).find(j => j.id === CASTEP_STUDIO_STATE.activeJobId) || {};
  const layout = document.getElementById("castep-elec-layout")?.value || "joint";
  const emin = parseFloat(document.getElementById("castep-elec-emin")?.value) || -5.0;
  const emax = parseFloat(document.getElementById("castep-elec-emax")?.value) || 5.0;
  const sigma = parseFloat(document.getElementById("castep-dos-sigma")?.value) || 0.12;
  const pdosMode = document.getElementById("castep-pdos-mode")?.value || "element_orbital";
  const pdosTarget = document.getElementById("castep-pdos-target-select")?.value || "all";
  const spinLayout = document.getElementById("castep-pdos-spin-layout")?.value || "mirror";
  const alignMode = document.getElementById("castep-elec-zero-ref")?.value || "vbm_auto";
  const align = computeElectronicEnergyAlignment(job, alignMode);

  const showTot = document.getElementById("castep-show-dos-total")?.checked !== false;
  const showS = document.getElementById("castep-show-dos-s")?.checked !== false;
  const showP = document.getElementById("castep-show-dos-p")?.checked !== false;
  const showD = document.getElementById("castep-show-dos-d")?.checked !== false;
  const showF = document.getElementById("castep-show-dos-f")?.checked !== false;
  const showUp = document.getElementById("castep-show-spin-up")?.checked !== false;
  const showDn = document.getElementById("castep-show-spin-dn")?.checked !== false;

  const parentW = canvas.parentElement ? (canvas.parentElement.clientWidth - 24) : 880;
  const width = Math.max(320, Math.floor(parentW));
  const height = 530;
  const dpr = getCastepCanvasDpr(width, height);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.scale(dpr, dpr);
  applyCrispCanvasQuality(ctx);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // 1) Extract Band Structure data (synchronized to exact shared zero reference!)
  let bandSeries = [];
  let bandTicks = [{ pos: 0, label: "Γ" }, { pos: 0.366, label: "M" }, { pos: 0.577, label: "K" }, { pos: 1.0, label: "Γ" }];
  let gapInfo = null;
  let gapSummary = "";

  if (job.band_xcd && job.band_xcd.series && job.band_xcd.series.length) {
    const sh = align.bandXcdShift || 0.0;
    bandSeries = Math.abs(sh) < 1e-6
      ? job.band_xcd.series
      : job.band_xcd.series.map(s => ({
          ...s,
          segments: (s.segments || []).map(seg => seg.map(pt => [pt[0], pt[1] + sh]))
        }));
    if (job.band_xcd.ticks && job.band_xcd.ticks.length) bandTicks = job.band_xcd.ticks;
    gapSummary = job.band_xcd.title || "";
  } else if (job.bandstr_bands || job.dos_bands) {
    const bObj = job.bandstr_bands || job.dos_bands;
    const sh = job.bandstr_bands ? (align.bandRawShift || 0.0) : (align.dosRawShift || 0.0);
    const nk = bObj.kpoints.length;
    for (let s = 0; s < (bObj.ns || 1); s++) {
      const nb = (bObj.kpoints[0]?.e?.[s] || []).length;
      const segs = [];
      for (let b = 0; b < nb; b++) {
        const seg = [];
        for (let k = 0; k < nk; k++) {
          const xNorm = nk > 1 ? k / (nk - 1) : 0;
          const yEv = bObj.kpoints[k].e[s][b];
          if (yEv !== undefined) seg.push([xNorm, yEv + sh]);
        }
        segs.push(seg);
      }
      bandSeries.push({ name: s === 0 ? "alpha" : "beta", segments: segs });
    }
  }
  if (job.bandstr_bands || job.dos_bands) {
    gapInfo = computeBandGapFromBandsObj(job.bandstr_bands || job.dos_bands);
    if (gapInfo && !gapSummary) {
      gapSummary = gapInfo.isCollinear
        ? `${gapInfo.phase} • E_g(↑)=${gapInfo.upGapEv.toFixed(3)} eV, E_g(↓)=${gapInfo.dnGapEv.toFixed(3)} eV`
        : `Band gap = ${gapInfo.gapEv.toFixed(3)} eV (${gapInfo.isDirect ? "Direct" : "Indirect"})`;
    }
  }

  // 2) Extract PDOS / DOS curves on the EXACT SAME aligned energy reference as Band Structure!
  const nPts = 280;
  const eGrid = new Array(nPts + 1);
  for (let i = 0; i <= nPts; i++) eGrid[i] = emin + (emax - emin) * (i / nPts);

  let pdosCurves = [];
  let isSpinDos = false;
  let pdosSourceLabel = "";

  if (job.pdos_bin_data && Array.isArray(job.pdos_bin_data.channels) && job.pdos_bin_data.channels.length) {
    const built = buildPdosCurvesFromBin(
      job.pdos_bin_data, eGrid, sigma, pdosMode, pdosTarget,
      { showTot, showS, showP, showD, showF },
      align.dosRawShift || 0.0
    );
    pdosCurves = built.curves;
    isSpinDos = built.isSpin;
    pdosSourceLabel = `Exact CASTEP ${job.pdos_bin_data.source_file} (${isSpinDos ? "Collinear Spin-Polarized" : "Non-Spin"}, ${job.pdos_bin_data.norb} orbitals)`;
  } else if (job.pdos_xcd?.series?.length || job.dos_xcd?.series?.length) {
    const srcSer = job.pdos_xcd?.series?.length ? job.pdos_xcd.series : job.dos_xcd.series;
    const sh = align.dosXcdShift || 0.0;
    const colorMap = { s: "#2563eb", p: "#16a34a", d: "#dc2626", f: "#9333ea", sum: "#0f172a", total: "#0f172a" };
    pdosSourceLabel = job.pdos_xcd ? "CASTEP PDOS (.xcd)" : "CASTEP DOS (.xcd)";
    srcSer.forEach((s, idx) => {
      const k = s.name.trim().toLowerCase();
      if (k === "s" && !showS) return;
      if (k === "p" && !showP) return;
      if (k === "d" && !showD) return;
      if (k === "f" && !showF) return;
      if ((k.includes("sum") || k.includes("total")) && !showTot) return;
      const pts = s.segments?.[0] || [];
      if (!pts.length) return;
      const arr = new Float64Array(eGrid.length);
      for (let i = 0; i < eGrid.length; i++) arr[i] = Math.max(0, interpSortedXY(pts, eGrid[i] - sh));
      pdosCurves.push({ label: s.name, color: colorMap[k] || PDOS_CURVE_PALETTE[idx % PDOS_CURVE_PALETTE.length], up: arr, dn: null, isTotal: k.includes("sum") || k.includes("total") });
    });
  } else if (job.dos_bands || job.bandstr_bands) {
    const srcB = job.dos_bands || job.bandstr_bands;
    const sh = job.dos_bands ? (align.dosRawShift || 0.0) : (align.bandRawShift || 0.0);
    isSpinDos = (srcB.ns >= 2);
    pdosSourceLabel = `Total DOS from CASTEP .bands (${isSpinDos ? "Collinear Spin α/β" : "Non-Spin"})`;
    const upArr = new Float64Array(eGrid.length);
    const dnArr = isSpinDos ? new Float64Array(eGrid.length) : null;
    const invSig = 1.0 / Math.max(0.02, sigma);
    const norm = invSig / Math.sqrt(2.0 * Math.PI);
    const deg = isSpinDos ? 1.0 : 2.0;
    (srcB.kpoints || []).forEach(kp => {
      const wt = (kp.w || (1.0 / srcB.kpoints.length)) * deg;
      (kp.e || []).forEach((sp, sIdx) => {
        const targetArr = (sIdx === 1 && dnArr) ? dnArr : upArr;
        sp.forEach(evRaw => {
          const ev = evRaw + sh;
          if (ev < emin - 4 * sigma || ev > emax + 4 * sigma) return;
          for (let g = 0; g < eGrid.length; g++) {
            const z = (eGrid[g] - ev) * invSig;
            if (Math.abs(z) < 4.0) targetArr[g] += wt * Math.exp(-0.5 * z * z) * norm;
          }
        });
      });
    });
    if (showTot) pdosCurves.push({ label: "Total DOS", color: "#0f172a", up: upArr, dn: dnArr, isTotal: true });
  }

  // Cache exact rendered electronic state for 1-to-1 CSV & multi-tab XLSX export
  CASTEP_STUDIO_STATE.lastElectronicExport = {
    jobId: job.id,
    seed: job.seed || CASTEP_STUDIO_STATE.structure?.formula || "CASTEP",
    material: job.material || CASTEP_STUDIO_STATE.structure?.formula || job.seed || "",
    layout, emin, emax, sigma, pdosMode, pdosTarget, spinLayout, alignMode,
    dosRawShift: align.dosRawShift || 0.0,
    bandRawShift: align.bandRawShift || 0.0,
    alignLabel: align.label,
    showTot, showS, showP, showD, showF, showUp, showDn,
    bandSeries, bandTicks, gapInfo, gapSummary,
    eGrid, pdosCurves, isSpinDos, pdosSourceLabel
  };

  // Honest empty state
  if (!bandSeries.length && !pdosCurves.length) {
    const stripEmpty = document.getElementById("castep-electronic-summary-strip");
    if (stripEmpty) {
      stripEmpty.innerHTML = `<span><strong>Status:</strong> No Band Structure, DOS, or *.pdos_bin files found in the active calculation.</span>`;
    }
    ctx.fillStyle = "#334155"; ctx.font = "700 15px Inter, sans-serif"; ctx.textAlign = "center";
    ctx.fillText("No Band Structure or PDOS Data Available", width / 2, height / 2 - 14);
    ctx.fillStyle = "#64748b"; ctx.font = "12.5px Inter, sans-serif";
    ctx.fillText("Mount a CASTEP Collinear/Band folder or click '📥 .pdos_bin/.bands' above to load atomic & orbital PDOS.", width / 2, height / 2 + 12);
    ctx.restore();
    return;
  }

  // Update summary strip
  const strip = document.getElementById("castep-electronic-summary-strip");
  if (strip) {
    const pathLabels = bandTicks.map(t => t.label === "G" ? "Γ" : t.label).join(" → ");
    strip.innerHTML = `
      <span><strong>Material:</strong> ${escapeHtml(job.material || CASTEP_STUDIO_STATE.structure?.formula || job.seed || "")}</span>
      <span><strong>Electronic:</strong> ${formatSciHtml(gapSummary || "Band Dispersion & PDOS")}</span>
      <span style="color:#0369a1;"><strong>PDOS Source:</strong> ${escapeHtml(pdosSourceLabel || "Band Structure Only")}</span>
      <span><strong>BZ Path:</strong> ${escapeHtml(pathLabels)}</span>
      <span style="color:#047857;"><strong>Zero Ref:</strong> ${formatSciHtml(align.label)}</span>
    `;
  }

  const st = getCastepPlotStyle();
  const extraT = Math.max(0, st.titleSize - 14);
  const extraB = Math.max(0, (st.tickSize - 12) * 1.4 + (st.axisLabelSize - 13) * 1.3);
  const extraL = Math.max(0, (st.tickSize - 12) * 2.2 + (st.axisLabelSize - 13) * 1.2);
  const padT = Math.round(34 + extraT);
  const padB = Math.round(48 + extraB);
  const padL = Math.round(62 + extraL);
  const padR = 22;
  const plotH = height - padT - padB;
  canvas._elecPlotGeom = { padT, padB, plotH };
  const eToY = (e) => padT + plotH * (1 - (e - emin) / ((emax - emin) || 1));

  let bandX0 = padL, bandW = width - padL - padR;
  let dosX0 = padL, dosW = width - padL - padR;
  canvas._subPanelRects = [];
  if (layout === "joint") {
    const gapBetween = Math.round(24 + Math.max(0, (st.tickSize - 12) * 1.5));
    bandW = Math.round((width - padL - padR - gapBetween) * 0.56);
    dosX0 = bandX0 + bandW + gapBetween;
    dosW = width - dosX0 - padR;
    const splitX = Math.round((bandX0 + bandW + dosX0) * 0.5);
    canvas._subPanelRects = [
      { key: "band", label: "Band Structure", x: 0, y: 0, w: splitX, h: height, plotKey: "electronic", dataSubPart: "band", pngName: "CASTEP_Band_Structure.png" },
      { key: "pdos", label: "PDOS / DOS", x: splitX, y: 0, w: width - splitX, h: height, plotKey: "electronic", dataSubPart: "pdos", pngName: "CASTEP_PDOS.png" }
    ];
  }

  const stepE = (emax - emin) <= 8 ? 1 : 2;
  const eTicksList = [];
  for (let e = Math.ceil(emin); e <= Math.floor(emax); e += stepE) eTicksList.push(e);
  const yTickPxList = eTicksList.map(e => eToY(e));
  const outTickExtra = st.tickDir === "out" ? (st.tickLength || 5) + 2 : 0;

  // --- PANEL 1: Electronic Band Structure ---
  if (layout === "joint" || layout === "band") {
    const kTickPxList = bandTicks.map(t => bandX0 + t.pos * bandW);
    ctx.save();
    ctx.beginPath(); ctx.rect(bandX0, padT, bandW, plotH); ctx.clip();

    drawPubGridLines(ctx, bandX0, padT, bandW, plotH, st, [], yTickPxList);

    // High-symmetry vertical reference lines (always subtle black/gray dashed-or-thin)
    bandTicks.forEach(t => {
      const tx = Math.round(bandX0 + t.pos * bandW) + 0.5;
      if (tx <= bandX0 + 2 || tx >= bandX0 + bandW - 2) return;
      ctx.beginPath(); ctx.moveTo(tx, padT); ctx.lineTo(tx, padT + plotH);
      ctx.strokeStyle = "rgba(0, 0, 0, 0.30)"; ctx.lineWidth = Math.max(0.8, st.borderWidth * 0.55); ctx.stroke();
    });

    // Fermi level E - E_F = 0 reference line
    if (emin <= 0 && emax >= 0) {
      const yF = Math.round(eToY(0)) + 0.5;
      ctx.beginPath(); ctx.moveTo(bandX0, yF); ctx.lineTo(bandX0 + bandW, yF);
      ctx.setLineDash([5, 4]); ctx.strokeStyle = st.inkColor; ctx.lineWidth = Math.max(1.1, st.borderWidth * 0.72); ctx.stroke();
      ctx.setLineDash([]);
    }

    bandSeries.forEach((ser, sIdx) => {
      const isBeta = sIdx === 1 || /beta|dn|down/i.test(ser.name);
      if (!isBeta && !showUp) return;
      if (isBeta && !showDn) return;
      ctx.strokeStyle = isBeta ? "#dc2626" : "#2563eb";
      ctx.lineWidth = isBeta ? Math.max(1.0, st.lineWidth * 0.85) : st.lineWidth;
      if (isBeta) ctx.setLineDash([4, 3]); else ctx.setLineDash([]);
      (ser.segments || []).forEach(seg => {
        if (!seg.length) return;
        ctx.beginPath();
        seg.forEach((pt, i) => {
          const px = bandX0 + pt[0] * bandW;
          const py = eToY(pt[1]);
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        });
        ctx.stroke();
      });
    });
    ctx.restore();

    // Crisp unified publication frame + ticks drawn ON TOP of curves
    drawPubAxisBox(ctx, bandX0, padT, bandW, plotH, st, {
      xTicks: kTickPxList,
      yTicks: yTickPxList,
      mirrorTop: true,
      mirrorRight: true
    });

    ctx.fillStyle = st.inkColor; ctx.font = castepPlotFont("title"); ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ctx.fillText(`Band Structure${bandSeries.length >= 2 ? " (— α Up / ┄ β Down)" : ""}`, bandX0 + bandW / 2, padT - 11);

    ctx.textAlign = "center"; ctx.textBaseline = "top";
    bandTicks.forEach(t => {
      const tx = bandX0 + t.pos * bandW;
      ctx.font = castepPlotFont("tick", 1.0, st.boldAxes ? "bold" : ""); ctx.fillStyle = st.inkColor;
      ctx.fillText(t.label === "G" ? "Γ" : t.label, tx, padT + plotH + 7 + outTickExtra);
    });

    ctx.textAlign = "right"; ctx.textBaseline = "middle"; ctx.font = castepPlotFont("tick");
    eTicksList.forEach(e => {
      ctx.fillStyle = st.inkColor;
      ctx.fillText(formatPubMinus(e), bandX0 - 8 - outTickExtra, eToY(e));
    });
    ctx.save();
    ctx.translate(18, padT + plotH / 2); ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = castepPlotFont("axis"); ctx.fillStyle = st.inkColor;
    drawSciText(ctx, "Energy E \u2212 E_{F} (eV)", 0, 0);
    ctx.restore();
  }

  // --- PANEL 2: Atomic / Orbital-Resolved Collinear PDOS ---
  if (layout === "joint" || layout === "dos") {
    const useMirror = isSpinDos && spinLayout === "mirror" && showUp && showDn;
    let maxDos = 0.5;
    pdosCurves.forEach(c => {
      for (let i = 0; i < eGrid.length; i++) {
        if (useMirror) {
          if (showUp && c.up[i] > maxDos) maxDos = c.up[i];
          if (showDn && c.dn && c.dn[i] > maxDos) maxDos = c.dn[i];
        } else {
          const v = (showUp ? c.up[i] : 0) + (showDn && c.dn ? c.dn[i] : 0);
          if (v > maxDos) maxDos = v;
        }
      }
    });
    maxDos *= 1.12;

    const dosXTicksPx = [];
    const dosYTicksPx = [];

    ctx.save();
    ctx.beginPath(); ctx.rect(dosX0, padT, dosW, plotH); ctx.clip();

    if (layout === "joint") {
      // Vertical Energy axis aligned with Band Structure; Horizontal DOS axis
      const xZeroDos = useMirror ? (dosX0 + dosW * 0.5) : dosX0;
      const halfSpan = useMirror ? (dosW * 0.48) : (dosW * 0.96);

      if (useMirror) {
        dosXTicksPx.push(dosX0 + dosW * 0.25, dosX0 + dosW * 0.5, dosX0 + dosW * 0.75);
      } else {
        dosXTicksPx.push(dosX0 + dosW * 0.5);
      }
      dosYTicksPx.push(...yTickPxList);
      drawPubGridLines(ctx, dosX0, padT, dosW, plotH, st, dosXTicksPx, yTickPxList);

      if (emin <= 0 && emax >= 0) {
        const yF = Math.round(eToY(0)) + 0.5;
        ctx.beginPath(); ctx.moveTo(dosX0, yF); ctx.lineTo(dosX0 + dosW, yF);
        ctx.setLineDash([5, 4]); ctx.strokeStyle = st.inkColor; ctx.lineWidth = Math.max(1.1, st.borderWidth * 0.72); ctx.stroke();
        ctx.setLineDash([]);
      }

      if (useMirror) {
        const xz = Math.round(xZeroDos) + 0.5;
        ctx.beginPath(); ctx.moveTo(xz, padT); ctx.lineTo(xz, padT + plotH);
        ctx.strokeStyle = st.inkColor; ctx.lineWidth = Math.max(1.0, st.borderWidth * 0.65); ctx.stroke();
      }

      pdosCurves.forEach(c => {
        if (showUp || !useMirror) {
          ctx.beginPath();
          for (let i = 0; i < eGrid.length; i++) {
            const val = useMirror ? c.up[i] : ((showUp ? c.up[i] : 0) + (showDn && c.dn ? c.dn[i] : 0));
            const sx = xZeroDos + (val / maxDos) * halfSpan;
            const sy = eToY(eGrid[i]);
            if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
          }
          ctx.strokeStyle = c.color;
          ctx.lineWidth = c.isTotal ? st.lineWidth : Math.max(1.0, st.lineWidth * 0.85);
          ctx.stroke();
          if (!c.isTotal) {
            ctx.lineTo(xZeroDos, eToY(eGrid[eGrid.length - 1]));
            ctx.lineTo(xZeroDos, eToY(eGrid[0]));
            ctx.closePath();
            ctx.fillStyle = c.color + "1c";
            ctx.fill();
          }
        }
        if (useMirror && showDn && c.dn) {
          ctx.beginPath();
          for (let i = 0; i < eGrid.length; i++) {
            const sx = xZeroDos - (c.dn[i] / maxDos) * halfSpan;
            const sy = eToY(eGrid[i]);
            if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
          }
          ctx.strokeStyle = c.color;
          ctx.lineWidth = c.isTotal ? st.lineWidth : Math.max(1.0, st.lineWidth * 0.85);
          ctx.stroke();
          if (!c.isTotal) {
            ctx.lineTo(xZeroDos, eToY(eGrid[eGrid.length - 1]));
            ctx.lineTo(xZeroDos, eToY(eGrid[0]));
            ctx.closePath();
            ctx.fillStyle = c.color + "14";
            ctx.fill();
          }
        }
      });

      if (useMirror) {
        ctx.fillStyle = "#dc2626"; ctx.font = castepPlotFont("legend", 0.95, "bold"); ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
        ctx.fillText("← Spin ↓ (β)", dosX0 + 8, padT + 16);
        ctx.fillStyle = "#2563eb"; ctx.textAlign = "right";
        ctx.fillText("Spin ↑ (α) →", dosX0 + dosW - 8, padT + 16);
      }
    } else {
      // Standalone Horizontal Energy axis; Vertical DOS axis (Spin ↑ up, Spin ↓ mirrored down!)
      const eToX = (e) => dosX0 + ((e - emin) / ((emax - emin) || 1)) * dosW;
      const yZeroDos = useMirror ? (padT + plotH * 0.5) : (padT + plotH);
      const halfH = useMirror ? (plotH * 0.47) : (plotH * 0.96);

      eTicksList.forEach(e => dosXTicksPx.push(eToX(e)));
      dosYTicksPx.push(padT + plotH * 0.25, padT + plotH * 0.5, padT + plotH * 0.75);
      drawPubGridLines(ctx, dosX0, padT, dosW, plotH, st, dosXTicksPx, dosYTicksPx);

      if (emin <= 0 && emax >= 0) {
        const xF = Math.round(eToX(0)) + 0.5;
        ctx.beginPath(); ctx.moveTo(xF, padT); ctx.lineTo(xF, padT + plotH);
        ctx.setLineDash([5, 4]); ctx.strokeStyle = st.inkColor; ctx.lineWidth = Math.max(1.1, st.borderWidth * 0.72); ctx.stroke();
        ctx.setLineDash([]);
      }

      if (useMirror) {
        const yz = Math.round(yZeroDos) + 0.5;
        ctx.beginPath(); ctx.moveTo(dosX0, yz); ctx.lineTo(dosX0 + dosW, yz);
        ctx.strokeStyle = st.inkColor; ctx.lineWidth = Math.max(1.0, st.borderWidth * 0.65); ctx.stroke();
      }

      pdosCurves.forEach(c => {
        if (showUp || !useMirror) {
          ctx.beginPath();
          for (let i = 0; i < eGrid.length; i++) {
            const val = useMirror ? c.up[i] : ((showUp ? c.up[i] : 0) + (showDn && c.dn ? c.dn[i] : 0));
            const sx = eToX(eGrid[i]);
            const sy = yZeroDos - (val / maxDos) * halfH;
            if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
          }
          ctx.strokeStyle = c.color; ctx.lineWidth = c.isTotal ? st.lineWidth : Math.max(1.0, st.lineWidth * 0.88); ctx.stroke();
          if (!c.isTotal) {
            ctx.lineTo(eToX(eGrid[eGrid.length - 1]), yZeroDos);
            ctx.lineTo(eToX(eGrid[0]), yZeroDos);
            ctx.closePath(); ctx.fillStyle = c.color + "1c"; ctx.fill();
          }
        }
        if (useMirror && showDn && c.dn) {
          ctx.beginPath();
          for (let i = 0; i < eGrid.length; i++) {
            const sx = eToX(eGrid[i]);
            const sy = yZeroDos + (c.dn[i] / maxDos) * halfH;
            if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
          }
          ctx.strokeStyle = c.color; ctx.lineWidth = c.isTotal ? st.lineWidth : Math.max(1.0, st.lineWidth * 0.88); ctx.stroke();
          if (!c.isTotal) {
            ctx.lineTo(eToX(eGrid[eGrid.length - 1]), yZeroDos);
            ctx.lineTo(eToX(eGrid[0]), yZeroDos);
            ctx.closePath(); ctx.fillStyle = c.color + "14"; ctx.fill();
          }
        }
      });

      if (useMirror) {
        ctx.fillStyle = "#2563eb"; ctx.font = castepPlotFont("legend", 1.0, "bold"); ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
        ctx.fillText("Spin ↑ (+α)", dosX0 + 10, padT + 18);
        ctx.fillStyle = "#dc2626";
        ctx.fillText("Spin ↓ (\u2212β)", dosX0 + 10, padT + plotH - 9);
      }
    }
    ctx.restore();

    // Crisp unified publication frame + ticks ON TOP of PDOS curves
    drawPubAxisBox(ctx, dosX0, padT, dosW, plotH, st, {
      xTicks: dosXTicksPx,
      yTicks: dosYTicksPx,
      mirrorTop: true,
      mirrorRight: true
    });

    // Panel Title & Clean Legend Strip
    ctx.fillStyle = st.inkColor; ctx.font = castepPlotFont("title"); ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    const modeLabel = pdosMode === "atom" ? "Atomic-Resolved PDOS" : (pdosMode === "element" ? "Element-Resolved PDOS" : (pdosMode === "orbital" ? "Orbital-Resolved PDOS" : "Element + Orbital PDOS"));
    ctx.fillText(modeLabel, dosX0 + dosW / 2, padT - 11);

    // Compact legend inside top-right of DOS panel
    if (pdosCurves.length) {
      const legX = dosX0 + dosW - 9;
      let legY = padT + (useMirror && layout === "joint" ? 32 : 16);
      ctx.font = castepPlotFont("legend", 1.0, st.boldAxes ? "bold" : "");
      ctx.textAlign = "right";
      ctx.textBaseline = "alphabetic";
      const rowStep = Math.max(13, Math.round(st.legendSize * 1.25));
      pdosCurves.slice(0, 10).forEach(c => {
        ctx.fillStyle = c.color;
        ctx.fillText(`● ${c.label}`, legX, legY);
        legY += rowStep;
      });
    }

    // DOS Axes ticks & labels
    ctx.fillStyle = st.inkColor; ctx.font = castepPlotFont("tick");
    if (layout === "joint") {
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      const txY = padT + plotH + 7 + outTickExtra;
      if (useMirror) {
        ctx.fillText(formatPubMinus(`-${maxDos.toFixed(1)}`), dosX0 + 12, txY);
        ctx.fillText("0", dosX0 + dosW * 0.5, txY);
        ctx.fillText(`+${maxDos.toFixed(1)}`, dosX0 + dosW - 12, txY);
      } else {
        ctx.fillText("0", dosX0 + 2, txY);
        ctx.fillText((maxDos / 2).toFixed(1), dosX0 + dosW * 0.5, txY);
        ctx.fillText(maxDos.toFixed(1), dosX0 + dosW - 8, txY);
      }
      ctx.font = castepPlotFont("axis"); ctx.fillStyle = st.inkColor;
      ctx.fillText("PDOS (states/eV)", dosX0 + dosW / 2, txY + st.tickSize + 6);
    } else {
      const eToX = (e) => dosX0 + ((e - emin) / ((emax - emin) || 1)) * dosW;
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      const txY = padT + plotH + 7 + outTickExtra;
      eTicksList.forEach(e => {
        ctx.fillText(formatPubMinus(e), eToX(e), txY);
      });
      ctx.font = castepPlotFont("axis"); ctx.fillStyle = st.inkColor;
      drawSciText(ctx, "Energy E \u2212 E_{F} (eV)", dosX0 + dosW / 2, txY + st.tickSize + 7);

      ctx.textAlign = "right"; ctx.textBaseline = "middle"; ctx.font = castepPlotFont("tick");
      if (useMirror) {
        ctx.fillText(`+${maxDos.toFixed(1)}`, dosX0 - 8 - outTickExtra, padT + 6);
        ctx.fillText("0.0", dosX0 - 8 - outTickExtra, padT + plotH * 0.5);
        ctx.fillText(formatPubMinus(`-${maxDos.toFixed(1)}`), dosX0 - 8 - outTickExtra, padT + plotH - 6);
      } else {
        ctx.fillText(maxDos.toFixed(1), dosX0 - 8 - outTickExtra, padT + 6);
        ctx.fillText((maxDos / 2).toFixed(1), dosX0 - 8 - outTickExtra, padT + plotH * 0.5);
        ctx.fillText("0.0", dosX0 - 8 - outTickExtra, padT + plotH - 4);
      }
      ctx.save();
      ctx.translate(18, padT + plotH / 2); ctx.rotate(-Math.PI / 2);
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = castepPlotFont("axis"); ctx.fillStyle = st.inkColor;
      ctx.fillText("PDOS (states/eV)", 0, 0);
      ctx.restore();
    }
  }
  ctx.restore();
}
window.renderCastepElectronicPlots = renderCastepElectronicPlots;

function initCastepElectronicCanvasHover() {
  const canvas = document.getElementById("castep-electronic-canvas");
  if (!canvas || canvas._hoverBound) return;
  canvas._hoverBound = true;
  canvas.addEventListener("mousemove", (e) => {
    const readout = document.getElementById("castep-electronic-readout");
    if (!readout) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const emin = parseFloat(document.getElementById("castep-elec-emin")?.value) || -5.0;
    const emax = parseFloat(document.getElementById("castep-elec-emax")?.value) || 5.0;
    const g = canvas._elecPlotGeom || { padT: 34, padB: 48, plotH: (rect.height || 520) - 82 };
    const padT = g.padT, plotH = g.plotH || ((rect.height || 520) - g.padT - g.padB);
    const eCursor = emax - ((my - padT) / plotH) * (emax - emin);
    if (my >= padT && my <= padT + plotH) {
      readout.innerHTML = `Cursor Energy: <strong>E − E<sub>F</sub> = ${eCursor.toFixed(3)} eV</strong> (${eCursor > 0 ? "Conduction Band" : "Valence Band"}) • X = ${Math.round(mx)} px`;
    }
  });
}

// --- Convergence & Energetics Charts ---
function renderCastepConvergencePlots() {
  const job = (CASTEP_STUDIO_STATE.jobs || []).find(j => j.id === CASTEP_STUDIO_STATE.activeJobId) || {};
  const pl = CASTEP_STUDIO_STATE.parsedLog;

  // 1) Energy Profile Chart
  const eCanvas = document.getElementById("castep-energy-chart-canvas");
  if (eCanvas) {
    let pts = [];
    if (job.ener_xcd && job.ener_xcd.series?.[0]?.segments?.[0]?.length > 1) {
      pts = job.ener_xcd.series[0].segments[0];
    } else if (pl.scfCycles && pl.scfCycles.length > 0) {
      pts = pl.scfCycles.filter(c => c.step > 0).map(c => [c.step, c.energy]);
    } else if (CASTEP_STUDIO_STATE.geomFrames && CASTEP_STUDIO_STATE.geomFrames.length > 0) {
      pts = CASTEP_STUDIO_STATE.geomFrames.map(f => [f.step, f.energyEv]);
    }
    drawSimpleLineChart2D(eCanvas, pts, {
      color: "#2563eb",
      xLabel: "Iteration / Step",
      yLabel: "Total Energy (eV)"
    });
  }

  // 2) Logarithmic Convergence Chart
  const cCanvas = document.getElementById("castep-conv-chart-canvas");
  if (cCanvas) {
    let pts = [];
    if (job.conv_xcd && job.conv_xcd.series?.[0]?.segments?.[0]?.length > 1) {
      pts = job.conv_xcd.series[0].segments[0];
    } else if (pl.scfCycles && pl.scfCycles.length > 1) {
      pts = pl.scfCycles
        .filter(c => c.step > 0 && c.dEPerAtom !== null && Math.abs(c.dEPerAtom) > 0)
        .map(c => [c.step, Math.log10(Math.abs(c.dEPerAtom))]);
    }
    drawSimpleLineChart2D(cCanvas, pts, {
      color: "#dc2626",
      xLabel: "Iteration / Step",
      yLabel: "log10(|ΔE / atom|)",
      thresholdY: -5.5
    });
  }

  // 3) Populate SCF & Geometry Table
  const scfTbody = document.getElementById("castep-scf-history-tbody");
  if (scfTbody) {
    const rows = (pl.scfCycles || []).map(c => `
      <tr>
        <td><span class="badge badge-blue">SCF</span></td>
        <td>${escapeHtml(String(c.label))}</td>
        <td><strong>${Number(c.energy).toFixed(5)}</strong></td>
        <td>${Number(c.fermi).toFixed(4)}</td>
        <td>${c.dEPerAtom !== null ? Number(c.dEPerAtom).toExponential(3) : "—"}</td>
        <td>${Number(c.timeSec).toFixed(2)}</td>
      </tr>
    `);
    scfTbody.innerHTML = rows.length ? rows.join("") : `<tr><td colspan="6" style="text-align:center; color:#64748b;">SCF history loaded from .xcd convergence series.</td></tr>`;
  }

  // 4) Populate Forces & Hirshfeld Charges Table
  const fcTbody = document.getElementById("castep-forces-charges-tbody");
  if (fcTbody) {
    const atoms = CASTEP_STUDIO_STATE.structure.atoms || [];
    fcTbody.innerHTML = atoms.map((at, idx) => {
      const fmag = Math.hypot(at.fx || 0, at.fy || 0, at.fz || 0);
      return `
        <tr>
          <td><strong>${escapeHtml(at.label || `${at.element}${idx+1}`)}</strong></td>
          <td>${Number(at.fx || 0).toFixed(5)}</td>
          <td>${Number(at.fy || 0).toFixed(5)}</td>
          <td>${Number(at.fz || 0).toFixed(5)}</td>
          <td><strong>${fmag.toFixed(5)}</strong></td>
          <td>${at.charge !== null && at.charge !== undefined ? Number(at.charge).toFixed(2) : "—"}</td>
          <td>${at.spin !== undefined ? Number(at.spin).toFixed(2) : "0.00"}</td>
        </tr>
      `;
    }).join("");
  }
}
window.renderCastepConvergencePlots = renderCastepConvergencePlots;

function drawSimpleLineChart2D(canvas, points, opts = {}) {
  const st = getCastepPlotStyle();
  const parentW = canvas.parentElement ? (canvas.parentElement.clientWidth - 24) : 420;
  const width = Math.max(260, Math.floor(parentW));
  const height = 310;
  const dpr = getCastepCanvasDpr(width, height);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.scale(dpr, dpr);
  applyCrispCanvasQuality(ctx);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const outTickExtra = st.tickDir === "out" ? (st.tickLength || 5) + 2 : 0;
  const padL = Math.round(78 + Math.max(0, (st.tickSize - 12) * 2.5));
  const padR = 18;
  const padT = 18;
  const padB = Math.round(46 + Math.max(0, (st.tickSize - 12) * 1.4 + (st.axisLabelSize - 13) * 1.2));
  const pw = width - padL - padR, ph = height - padT - padB;

  if (!points || !points.length) {
    drawPubAxisBox(ctx, padL, padT, pw, ph, st);
    ctx.fillStyle = "#64748b";
    ctx.font = castepPlotFont("tick");
    ctx.textAlign = "center";
    ctx.fillText("No iteration points available for this job", padL + pw / 2, padT + ph / 2);
    ctx.restore();
    return;
  }

  const cz = CASTEP_STUDIO_STATE.convZoom || { xMinFrac: 0.0, xMaxFrac: 1.0 };
  const xsAll = points.map(p => p[0]);
  const rawMinX = Math.min(...xsAll), rawMaxX = Math.max(...xsAll, rawMinX + 1);
  const rawSpanX = rawMaxX - rawMinX;
  const minX = rawMinX + rawSpanX * Math.max(0, Math.min(0.95, cz.xMinFrac || 0));
  const maxX = rawMinX + rawSpanX * Math.max((cz.xMinFrac || 0) + 0.05, Math.min(1.0, cz.xMaxFrac !== undefined ? cz.xMaxFrac : 1.0));
  const visPts = points.filter(p => p[0] >= minX - 1e-6 && p[0] <= maxX + 1e-6);
  const ys = (visPts.length ? visPts : points).map(p => p[1]);
  let minY = Math.min(...ys), maxY = Math.max(...ys);
  if (opts.thresholdY !== undefined) {
    minY = Math.min(minY, opts.thresholdY - 0.5);
    maxY = Math.max(maxY, opts.thresholdY + 0.5);
  }
  const spanY = (maxY - minY) || 1.0;
  minY -= spanY * 0.08;
  maxY += spanY * 0.08;

  const toX = (x) => padL + ((x - minX) / ((maxX - minX) || 1)) * pw;
  const toY = (y) => padT + ph * (1 - (y - minY) / ((maxY - minY) || 1));

  const yTickVals = [0, 1, 2, 3, 4].map(i => minY + (maxY - minY) * (i / 4));
  const xTickVals = [0, 1, 2, 3, 4].map(i => minX + (maxX - minX) * (i / 4));
  const yTickPx = yTickVals.map(v => toY(v));
  const xTickPx = xTickVals.map(v => toX(v));

  ctx.save();
  ctx.beginPath(); ctx.rect(padL, padT, pw, ph); ctx.clip();
  drawPubGridLines(ctx, padL, padT, pw, ph, st, xTickPx, yTickPx);

  if (opts.thresholdY !== undefined) {
    const ty = toY(opts.thresholdY);
    ctx.beginPath(); ctx.moveTo(padL, ty); ctx.lineTo(padL + pw, ty);
    ctx.setLineDash([5, 4]); ctx.strokeStyle = "#16a34a"; ctx.lineWidth = Math.max(1.1, st.lineWidth * 0.75); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#16a34a"; ctx.font = castepPlotFont("legend", 0.92, "bold"); ctx.textAlign = "left";
    ctx.fillText("Convergence Tol.", padL + 8, ty - 6);
  }

  ctx.beginPath();
  points.forEach((pt, idx) => {
    const px = toX(pt[0]), py = toY(pt[1]);
    if (idx === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  });
  ctx.strokeStyle = opts.color || "#2563eb";
  ctx.lineWidth = st.lineWidth;
  ctx.stroke();

  const dotR = Math.max(2.4, st.lineWidth * 1.65);
  points.forEach(pt => {
    ctx.beginPath();
    ctx.arc(toX(pt[0]), toY(pt[1]), dotR, 0, Math.PI * 2);
    ctx.fillStyle = opts.color || "#2563eb";
    ctx.fill();
  });
  ctx.restore();

  drawPubAxisBox(ctx, padL, padT, pw, ph, st, { xTicks: xTickPx, yTicks: yTickPx, mirrorTop: true, mirrorRight: true });

  // Y Ticks & Axis Label
  ctx.fillStyle = st.inkColor;
  ctx.font = castepPlotFont("tick", 0.92);
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  yTickVals.forEach(yVal => {
    ctx.fillText(formatPubMinus(yVal.toFixed(Math.abs(yVal) >= 1000 ? 1 : 2)), padL - 7 - outTickExtra, toY(yVal));
  });
  if (opts.yLabel) {
    ctx.save();
    ctx.translate(15, padT + ph / 2); ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = castepPlotFont("axis", 0.92); ctx.fillStyle = st.inkColor;
    drawSciText(ctx, opts.yLabel.replace("log10", "log_{10}"), 0, 0);
    ctx.restore();
  }

  // X Ticks & Axis Label
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.font = castepPlotFont("tick", 0.92);
  const txY = padT + ph + 6 + outTickExtra;
  xTickVals.forEach(xVal => {
    ctx.fillText(Math.round(xVal).toString(), toX(xVal), txY);
  });
  ctx.font = castepPlotFont("axis", 0.94);
  ctx.fillStyle = st.inkColor;
  ctx.fillText(opts.xLabel || "Step", padL + pw / 2, txY + Math.round(st.tickSize * 0.92) + 5);
  ctx.restore();
}

// ============================================================================
// 8. File Editor, Directory Mounting, Direct Disk Save & Crystal Library Sync
// ============================================================================

function populateCastepParamFormFromText(paramText) {
  if (!paramText) return;
  const getVal = (key) => {
    const m = paramText.match(new RegExp(`^\\s*${key}\\s*:\\s*([^\\n\\r#]+)`, "mi"));
    return m ? m[1].trim() : "";
  };
  const task = getVal("task");
  const xc = getVal("xc_functional");
  const cut = getVal("cut_off_energy");
  const etol = getVal("elec_energy_tol");
  const maxscf = getVal("max_scf_cycles");
  const spin = getVal("spin_polarized");
  const soc = getVal("spin_orbit_coupling");
  const elf = getVal("calculate_ELF");
  const hirsh = getVal("calculate_hirshfeld");
  const pdos = getVal("pdos_calculate_weights");

  const setSel = (id, v) => { const el = document.getElementById(id); if (el && v) el.value = v; };
  if (task) setSel("castep-param-task", task);
  if (xc) setSel("castep-param-xc", xc.toUpperCase());
  if (cut) setSel("castep-param-cutoff", Math.round(parseFloat(cut)));
  if (etol) setSel("castep-param-etol", etol);
  if (maxscf) setSel("castep-param-maxscf", parseInt(maxscf, 10));

  const setChk = (id, v) => { const el = document.getElementById(id); if (el && v) el.checked = /true|1|on/i.test(v); };
  setChk("castep-param-spin", spin);
  setChk("castep-param-soc", soc);
  setChk("castep-param-elf", elf);
  setChk("castep-param-hirsh", hirsh);
  setChk("castep-param-pdos", pdos);
}

function syncCastepParamFormToText(notify = false) {
  const job = (CASTEP_STUDIO_STATE.jobs || []).find(j => j.id === CASTEP_STUDIO_STATE.activeJobId);
  const newParam = generateCastepParamContent();
  if (job) job.param_text = newParam;
  if (CASTEP_STUDIO_STATE.activeFileEditorTab === "param" || CASTEP_STUDIO_STATE.activeFileEditorTab === "cell") {
    refreshCastepFileEditorContent();
  }
  if (notify && typeof showToast === "function") {
    showToast("Updated .param and .cell configuration from form!", "success");
  }
}
window.syncCastepParamFormToText = syncCastepParamFormToText;

function switchCastepFileEditorTab(tabKey, btnEl) {
  CASTEP_STUDIO_STATE.activeFileEditorTab = tabKey;
  document.querySelectorAll(".castep-file-tab").forEach(b => b.classList.remove("active"));
  if (btnEl) btnEl.classList.add("active");
  refreshCastepFileEditorContent();
}
window.switchCastepFileEditorTab = switchCastepFileEditorTab;

function refreshCastepFileEditorContent() {
  const ta = document.getElementById("castep-file-editor-textarea");
  const lbl = document.getElementById("castep-file-editor-label");
  if (!ta) return;
  const job = (CASTEP_STUDIO_STATE.jobs || []).find(j => j.id === CASTEP_STUDIO_STATE.activeJobId) || {};
  const seed = document.getElementById("castep-save-seed-input")?.value || job.seed || "CASTEP_Job";
  const tab = CASTEP_STUDIO_STATE.activeFileEditorTab || "cell";

  if (tab === "cell") {
    if (lbl) lbl.textContent = `${seed}.cell (Live Synchronized with 3D Builder)`;
    ta.value = generateCastepCellContent();
  } else if (tab === "param") {
    if (lbl) lbl.textContent = `${seed}.param`;
    ta.value = job.param_text || generateCastepParamContent();
  } else if (tab === "castep") {
    if (lbl) lbl.textContent = `${seed}.castep (CASTEP Main Output Log)`;
    ta.value = job.castep_text || "# No .castep output log loaded yet for this job.";
  } else if (tab === "status") {
    if (lbl) lbl.textContent = `Status.txt (Live Materials Studio Status)`;
    ta.value = job.status_text || `Job Name : ${seed}\nStatus : Ready`;
  } else if (tab === "geom") {
    if (lbl) lbl.textContent = `${seed}.geom (Geometry Trajectory)`;
    ta.value = job.geom_text || "# No .geom trajectory file in this job.";
  } else if (tab === "xsd") {
    if (lbl) lbl.textContent = `${seed}.xsd (Materials Studio 26.1 XML Structure)`;
    ta.value = generateMaterialsStudioXsdContent();
  } else if (tab === "cif") {
    if (lbl) lbl.textContent = `${seed}.cif (Crystallographic Information File)`;
    ta.value = generateCastepCifContent();
  } else if (tab === "poscar") {
    if (lbl) lbl.textContent = `POSCAR (VASP 5/6 Format)`;
    ta.value = generateCastepPoscarContent();
  }
}

function applyCastepEditorTextToStructure() {
  const ta = document.getElementById("castep-file-editor-textarea");
  if (!ta || !ta.value.trim()) return;
  const tab = CASTEP_STUDIO_STATE.activeFileEditorTab;
  pushCastepUndoSnapshot();
  let preserveSym = false;
  if (tab === "cell") {
    const parsed = parseCastepCellText(ta.value, CASTEP_STUDIO_STATE.structure.name);
    if (parsed && parsed.atoms.length) CASTEP_STUDIO_STATE.structure = parsed;
  } else if (tab === "xsd") {
    const parsed = parseMaterialsStudioXsd(ta.value, CASTEP_STUDIO_STATE.structure.name);
    if (parsed && parsed.atoms.length) CASTEP_STUDIO_STATE.structure = parsed;
  } else if (tab === "cif" && (typeof parseCifFullCrystal === "function" || typeof parseCifTextClient === "function")) {
    const parsed = typeof parseCifFullCrystal === "function"
      ? parseCifFullCrystal(ta.value, CASTEP_STUDIO_STATE.structure.name)
      : parseCifTextClient(ta.value, CASTEP_STUDIO_STATE.structure.name);
    const built = buildCastepStructureFromParsedCif(parsed, CASTEP_STUDIO_STATE.structure.name);
    if (built) {
      CASTEP_STUDIO_STATE.structure = built;
      preserveSym = Boolean(built.symmetryIntact);
    }
  }
  afterCastepStructureModified("Applied edited code directly to 3D Structure Builder!", preserveSym);
}
window.applyCastepEditorTextToStructure = applyCastepEditorTextToStructure;

function copyCastepEditorContent() {
  const ta = document.getElementById("castep-file-editor-textarea");
  if (!ta) return;
  navigator.clipboard?.writeText(ta.value);
  if (typeof showToast === "function") showToast("Copied file content to clipboard!", "success");
}
window.copyCastepEditorContent = copyCastepEditorContent;

function downloadCurrentCastepEditorFile() {
  const tab = CASTEP_STUDIO_STATE.activeFileEditorTab || "cell";
  downloadCastepFormat(tab);
}
window.downloadCurrentCastepEditorFile = downloadCurrentCastepEditorFile;

function downloadCastepFormat(fmt) {
  const seed = (document.getElementById("castep-save-seed-input")?.value || "CASTEP_Structure").trim();
  let content = "", filename = `${seed}.cell`;
  if (fmt === "cell") { content = generateCastepCellContent(); filename = `${seed}.cell`; }
  else if (fmt === "param") { content = generateCastepParamContent(); filename = `${seed}.param`; }
  else if (fmt === "xsd") { content = generateMaterialsStudioXsdContent(); filename = `${seed}.xsd`; }
  else if (fmt === "cif") { content = generateCastepCifContent(); filename = `${seed}.cif`; }
  else if (fmt === "poscar") { content = generateCastepPoscarContent(); filename = `${seed}_POSCAR.vasp`; }
  else if (fmt === "xyz") { content = generateCastepXyzContent(); filename = `${seed}.xyz`; }
  else {
    const ta = document.getElementById("castep-file-editor-textarea");
    content = ta ? ta.value : generateCastepCellContent();
    filename = `${seed}.${fmt}`;
  }

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 250);
  if (typeof showToast === "function") showToast(`Downloaded ${filename}!`, "success");
}
window.downloadCastepFormat = downloadCastepFormat;

// --- Direct Working Folder Save (FastAPI Local Bridge + Browser FileSystemDirectoryHandle) ---
async function saveCastepStructureToWorkingFolder() {
  const folder = (document.getElementById("castep-save-folder-input")?.value || "").trim();
  const subfolder = (document.getElementById("castep-save-subfolder-input")?.value || "").trim();
  const seed = (document.getElementById("castep-save-seed-input")?.value || "CASTEP_Modified").trim();

  const filesPayload = {
    [`${seed}.cell`]: generateCastepCellContent(),
    [`${seed}.param`]: generateCastepParamContent(),
    [`${seed}.xsd`]: generateMaterialsStudioXsdContent(),
    [`${seed}.cif`]: generateCastepCifContent(),
    [`POSCAR`]: generateCastepPoscarContent(),
    [`${seed}.xyz`]: generateCastepXyzContent()
  };

  // Update current job in memory
  const activeJob = (CASTEP_STUDIO_STATE.jobs || []).find(j => j.id === CASTEP_STUDIO_STATE.activeJobId);
  if (activeJob) {
    activeJob.cell_text = filesPayload[`${seed}.cell`];
    activeJob.param_text = filesPayload[`${seed}.param`];
    activeJob.xsd_text = filesPayload[`${seed}.xsd`];
  }

  // 1) If browser directory handle is mounted, write directly to local disk via File System Access API
  const dirHandle = (activeJob && activeJob._dirHandle) || CASTEP_STUDIO_STATE.mountedDirHandle;
  if (dirHandle) {
    try {
      let targetHandle = dirHandle;
      if (subfolder) {
        targetHandle = await dirHandle.getDirectoryHandle(subfolder, { create: true });
      }
      for (const [fname, text] of Object.entries(filesPayload)) {
        const fh = await targetHandle.getFileHandle(fname, { create: true });
        const writable = await fh.createWritable();
        await writable.write(text);
        await writable.close();
      }
      if (typeof showToast === "function") {
        showToast(`✅ Saved ${Object.keys(filesPayload).length} files (.cell, .param, .xsd, .cif, POSCAR) directly to mounted folder!`, "success");
      }
      return;
    } catch (e) {
      console.warn("Direct DirectoryHandle write error:", e);
    }
  }

  // 2) Try FastAPI local server endpoint /api/castep/save
  try {
    const resp = await fetch(`${getCastepApiBase()}/api/castep/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder, subfolder, files: filesPayload })
    });
    if (resp.ok) {
      const res = await resp.json();
      if (typeof showToast === "function") {
        showToast(`✅ Saved ${res.saved_files.length} files directly to ${res.target_dir}!`, "success");
      }
      return;
    }
  } catch (e) {}

  // 3) Fallback: download the primary .cell and .cif files immediately
  downloadCastepFormat("cell");
  downloadCastepFormat("cif");
  if (typeof showToast === "function") {
    showToast(`💾 Exported ${seed}.cell & ${seed}.cif (Tip: Click "Mount Local Folder" for direct browser-to-disk overwrite).`, "success");
  }
}
window.saveCastepStructureToWorkingFolder = saveCastepStructureToWorkingFolder;

// --- Add to Main Crystal Structures Library (STATE.structures) ---
function buildLibraryStructureEntryFromCastepJob(job, useActiveBuilder = false) {
  const st = useActiveBuilder
    ? CASTEP_STUDIO_STATE.structure
    : (job.cell_text ? parseCastepCellText(job.cell_text, job.material || job.seed) : CASTEP_STUDIO_STATE.structure);
  const pl = parseCastepOutputLog(job.castep_text || "");
  const lat = st.lattice || { a: 6.594, b: 6.594, c: 25.151, alpha: 90, beta: 90, gamma: 120 };
  const vol = Math.round(castepCellVolume(st.vectors) * 100) / 100;
  const natoms = (st.atoms || []).length;
  const eTot = pl.dispersionEnergyEv || pl.totalEnergyEv || job.totalEnergyEv;
  const ePerAtom = (eTot && natoms) ? Math.round((eTot / natoms) * 10000) / 10000 : null;
  const bg = (job.bandGapEv !== null && job.bandGapEv !== undefined) ? job.bandGapEv : 0.0;

  return {
    id: Date.now() + Math.floor(Math.random() * 10000),
    name: `${st.formula} — ${job.title || job.seed || "CASTEP Structure"}`,
    chemical_formula: st.formula,
    project_folder: "CASTEP Simulations",
    visibility: "Public",
    crystal_system: st.crystalSystem || "Hexagonal",
    space_group: st.spaceGroup || "P 1 (1)",
    structure_type: lat.c > 16 ? "2D Slab / Monolayer" : "3D Bulk Crystal",
    a: Number(lat.a.toFixed(4)),
    b: Number(lat.b.toFixed(4)),
    c: Number(lat.c.toFixed(4)),
    alpha: Number(lat.alpha.toFixed(2)),
    beta: Number(lat.beta.toFixed(2)),
    gamma: Number(lat.gamma.toFixed(2)),
    volume: vol,
    natoms,
    dft_code: "CASTEP",
    dft_functional: job.functional || pl.functional || "PBE",
    cutoff_energy: job.cutoffEv || pl.cutoffEv || 700,
    kpoints: pl.kpointGrid || "5x5x1",
    bandgap_ev: bg,
    bandgap_type: bg > 0 ? "Direct" : "Metallic",
    total_energy_per_atom: ePerAtom,
    magnetic_state: "NM",
    notes: `Imported from BIOVIA Materials Studio CASTEP (${job.folder || job.seed}). Total Energy = ${eTot ? eTot.toFixed(4) + " eV" : "N/A"}.`,
    atoms: JSON.parse(JSON.stringify(st.atoms)),
    cif_content: useActiveBuilder ? generateCastepCifContent() : "",
    poscar_text: useActiveBuilder ? generateCastepPoscarContent() : "",
    in_weekly_report: 1
  };
}

function addCurrentCastepStructureToLibrary() {
  if (typeof STATE === "undefined" || !Array.isArray(STATE.structures)) return;
  const activeJob = (CASTEP_STUDIO_STATE.jobs || []).find(j => j.id === CASTEP_STUDIO_STATE.activeJobId) || {
    title: CASTEP_STUDIO_STATE.structure.name,
    seed: CASTEP_STUDIO_STATE.structure.formula
  };
  const entry = buildLibraryStructureEntryFromCastepJob(activeJob, true);
  STATE.structures.unshift(entry);
  if (STATE.masterData && Array.isArray(STATE.masterData.structures)) {
    STATE.masterData.structures.unshift(entry);
  }
  if (typeof ensureAllStructuralIdsGlobal === "function") ensureAllStructuralIdsGlobal();
  if (typeof saveStaticDb === "function") saveStaticDb();
  if (typeof renderStructuresList === "function") renderStructuresList();
  if (typeof showToast === "function") {
    showToast(`💎 Added "${entry.name}" (${entry.natoms} atoms) to Crystal Structures Library!`, "success");
  }
}
window.addCurrentCastepStructureToLibrary = addCurrentCastepStructureToLibrary;

function addSelectedCastepJobsToLibrary() {
  const selIds = Array.from(CASTEP_STUDIO_STATE.selectedJobIds);
  if (!selIds.length) {
    addCurrentCastepStructureToLibrary();
    return;
  }
  let addedCount = 0;
  selIds.forEach(jid => {
    const job = (CASTEP_STUDIO_STATE.jobs || []).find(j => j.id === jid);
    if (!job) return;
    const isAct = jid === CASTEP_STUDIO_STATE.activeJobId;
    const entry = buildLibraryStructureEntryFromCastepJob(job, isAct);
    STATE.structures.unshift(entry);
    if (STATE.masterData && Array.isArray(STATE.masterData.structures)) {
      STATE.masterData.structures.unshift(entry);
    }
    addedCount++;
  });
  if (typeof ensureAllStructuralIdsGlobal === "function") ensureAllStructuralIdsGlobal();
  if (typeof saveStaticDb === "function") saveStaticDb();
  if (typeof renderStructuresList === "function") renderStructuresList();
  if (typeof showToast === "function") {
    showToast(`💎 Added ${addedCount} selected CASTEP structure(s) to Crystal Structures Library!`, "success");
  }
}
window.addSelectedCastepJobsToLibrary = addSelectedCastepJobsToLibrary;

// --- Local Machine Scanning, Directory Mounting & Multi-File Upload (v120 Exact) ---

function normalizeCastepSeedClient(filename) {
  let name = String(filename || "");
  const low = name.toLowerCase();
  const exts = [
    ".cell", ".param", ".castep", ".geom", ".bands", ".xcd", ".xsd", ".cif",
    ".chdiff", ".charg_frm", ".den_fmt", ".cube", ".xyz", ".bib", ".ome_bin",
    ".pdos_bin", ".castep_bin", ".cst_esp", ".check", ".kptaux", ".trjaux", ".xgd", ".csv", ".txt", ".dat"
  ];
  for (const ext of exts) {
    if (low.endsWith(ext)) {
      name = name.slice(0, -ext.length);
      break;
    }
  }
  name = name.replace(/\s*\(\d+\)\s*$/, "").trim();
  const suffixes = [
    " Optical Properties", " Partial Density of States", " Density of States",
    " Band Structure", " Convergence", " Energies", " Potential", " PDOS", " DOS",
    "_BandStr", "_DOS", "_Optics", "_Efield", "_Phonon", "_ELF", "_MagRes"
  ];
  for (const suf of suffixes) {
    if (name.toLowerCase().endsWith(suf.toLowerCase()) && name.length > suf.length) {
      name = name.slice(0, -suf.length).trim();
      break;
    }
  }
  return name || filename;
}

function getActiveStructureCellVolAndC() {
  const st = CASTEP_STUDIO_STATE.structure;
  if (st && st.vectors && st.vectors.length === 3) {
    const v = castepCellVolume(st.vectors);
    const c = Math.hypot(st.vectors[2][0], st.vectors[2][1], st.vectors[2][2]);
    if (v > 1e-3 && c > 1e-3) return { vol: v, cLen: c };
  }
  if (st && st.lattice && st.lattice.a && st.lattice.b && st.lattice.c) {
    const vecs = castepParamsToVectors(st.lattice.a, st.lattice.b, st.lattice.c, st.lattice.alpha || 90, st.lattice.beta || 90, st.lattice.gamma || 90);
    return { vol: castepCellVolume(vecs), cLen: Number(st.lattice.c) || 1.0 };
  }
  return { vol: 1.0, cLen: 1.0 };
}

async function scanCastepLocalMachineJobs() {
  const rootPath = (document.getElementById("castep-root-path-input")?.value || "").trim();
  const base = getCastepApiBase() || (["localhost", "127.0.0.1", "::1"].includes(window.location.hostname) ? "" : "http://127.0.0.1:8877");
  try {
    const resp = await fetch(`${base}/api/castep/scan?root_path=${encodeURIComponent(rootPath)}&limit=120`);
    if (resp.ok) {
      if (base) CASTEP_STUDIO_STATE.apiBase = base;
      const data = await resp.json();
      CASTEP_STUDIO_STATE.localBackendConnected = true;
      CASTEP_STUDIO_STATE.localProcesses = data.processes || [];
      if (Array.isArray(data.jobs)) {
        // Replace previous local-scanned jobs cleanly with exact scan results for requested path
        const keptMounted = CASTEP_STUDIO_STATE.jobs.filter(j => j._fileMap || j._dirHandle || String(j.id).startsWith("import_"));
        const scanned = data.jobs.map(dj => enrichCastepJobSummary(dj));
        CASTEP_STUDIO_STATE.jobs = [...scanned, ...keptMounted];
        renderCastepJobsList();
        updateCastepKpiBar();
        if (scanned.length > 0) {
          await loadCastepJobIntoStudio(scanned[0].id);
        }
        updateCastepConnectionPill(true, `Local Server • ${scanned.length} Jobs in ${rootPath || (data.roots?.[0] || "Workstation")}`);
        if (typeof showToast === "function") {
          showToast(
            scanned.length > 0
              ? `🔄 Scanned ${data.total_found} CASTEP calculation(s) (${data.processes.length} active BIOVIA processes).`
              : `No CASTEP calculation files found in "${rootPath || "default directories"}".`,
            scanned.length > 0 ? "success" : "info"
          );
        }
        return;
      }
    } else {
      let errMsg = `Scan failed (HTTP ${resp.status})`;
      try { const err = await resp.json(); if (err?.detail) errMsg = err.detail; } catch (_) {}
      if (typeof showToast === "function") showToast(errMsg, "warning");
      return;
    }
  } catch (e) {
    CASTEP_STUDIO_STATE.localBackendConnected = false;
  }

  updateCastepConnectionPill(false, "Browser Mode • Local Python server not running on this PC");
  if (typeof showToast === "function") {
    showToast("Local Python server is not running on this machine. Click '📂 Mount Local Folder' to scan folders directly in your browser!", "info");
  }
}
window.scanCastepLocalMachineJobs = scanCastepLocalMachineJobs;

async function mountCastepLocalDirectory() {
  if (typeof window.showDirectoryPicker === "function") {
    try {
      const dirHandle = await window.showDirectoryPicker({ mode: "readwrite" });
      CASTEP_STUDIO_STATE.mountedDirHandle = dirHandle;
      CASTEP_STUDIO_STATE.mountedDirName = dirHandle.name;
      const discovered = [];
      const sbjList = [];
      const gwMeta = { active: [], archived: [], servers: [], gwInfo: null, gwParams: null };
      await scanMountedDirectoryHandleRecursive(dirHandle, dirHandle.name, 0, discovered, sbjList, gwMeta);

      discovered.sort((a, b) => (b.mtime || 0) - (a.mtime || 0));
      if (discovered.length > 0) {
        // Deduplicate by folder+seed and put newly mounted jobs first
        const newKeys = new Set(discovered.map(j => `${j.folder}::${j.seed}`));
        const existing = CASTEP_STUDIO_STATE.jobs.filter(j => !newKeys.has(`${j.folder}::${j.seed}`));
        CASTEP_STUDIO_STATE.jobs = [...discovered, ...existing];
      }
      if (gwMeta.active.length > 0 || gwMeta.archived.length > 0 || gwMeta.servers.length > 0 || gwMeta.gwInfo) {
        applyMountedGatewayData(dirHandle.name, gwMeta.active, gwMeta.archived, gwMeta.servers, gwMeta.gwInfo, gwMeta.gwParams);
      }

      renderCastepJobsList();
      updateCastepKpiBar();
      updateCastepConnectionPill(true, `Mounted: ${dirHandle.name} (${discovered.length} calculation${discovered.length === 1 ? "" : "s"})`);

      if (discovered.length > 0) {
        await loadCastepJobIntoStudio(discovered[0].id);
        if (typeof showToast === "function") {
          showToast(`📂 Mounted "${dirHandle.name}": discovered ${discovered.length} calculation(s)${sbjList.length ? ` + ${sbjList.length} Gateway .sbj jobs` : ""}!`, "success");
        }
      } else if (sbjList.length > 0) {
        switchCastepStagePane("gateway");
        if (typeof showToast === "function") {
          showToast(`🖥️ Loaded ${sbjList.length} Materials Studio Gateway (.sbj) job records from "${dirHandle.name}"!`, "success");
        }
      } else {
        if (typeof showToast === "function") {
          showToast(`Mounted "${dirHandle.name}", but no CASTEP/structure files (.cell, .castep, .xsd, .cif, .xcd, .bands, .chdiff, .charg_frm) were found.`, "warning");
        }
      }
      return;
    } catch (e) {
      if (e && e.name === "AbortError") return;
    }
  }
  document.getElementById("castep-folder-upload-input")?.click();
}
window.mountCastepLocalDirectory = mountCastepLocalDirectory;

const CASTEP_RELEVANT_EXT_RE = /\.(cell|param|castep|geom|bands|xcd|xsd|cif|chdiff|charg_frm|den_fmt|cube|pdos_bin|ome_bin|cst_ome|xyz|csv|dat)$/i;
const CASTEP_SKIP_DIRS = new Set([".git", "node_modules", "__pycache__", "$recycle.bin", "system volume information"]);

function parseSbjTextClient(sbjText, filename, isArchived = false) {
  const jid = filename.replace(/\.sbj$/i, "");
  const item = {
    job_id: jid, description: jid, server: "CASTEP", owner: "",
    status: "terminated", create_ts: 0, start_ts: 0, finish_ts: 0,
    submitted: "-", queue: "-", queued_job_id: "-", process_id: "-",
    cpu_cores: 0, job_directory: "", client_ip: "",
    is_archived: isArchived, has_local_files: false
  };
  (sbjText || "").split(/\r?\n/).forEach(line => {
    const idx = line.indexOf("=");
    if (idx === -1) return;
    const k = line.slice(0, idx).trim().toLowerCase();
    const v = line.slice(idx + 1).trim();
    if (k === "job-description") item.description = v;
    else if (k === "job-server") item.server = v;
    else if (k === "job-uid") item.owner = v;
    else if (k === "job-status") item.status = v;
    else if (k === "job-create") {
      const ts = parseInt(v, 10);
      if (!isNaN(ts)) {
        item.create_ts = ts;
        const d = new Date(ts * 1000);
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const mons = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const pad2 = n => String(n).padStart(2, "0");
        item.submitted = `${days[d.getDay()]} ${mons[d.getMonth()]} ${d.getDate()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())} ${d.getFullYear()}`;
      }
    } else if (k === "job-start") item.start_ts = parseInt(v, 10) || 0;
    else if (k === "job-finish") item.finish_ts = parseInt(v, 10) || 0;
    else if (k === "job-primary-processid") item.process_id = v;
    else if (k === "job-processid" && item.process_id === "-") item.process_id = v;
    else if (k === "job-queue" && v) item.queue = v;
    else if (k === "job-queued-id" && v) item.queued_job_id = v;
    else if (k === "job-cpu-number") item.cpu_cores = parseInt(v, 10) || 0;
    else if (k === "job-directory") item.job_directory = v;
    else if (k === "job-client-ip") item.client_ip = v;
  });
  return item;
}

function parseGwKvTextClient(text) {
  const items = [];
  const kv = {};
  (text || "").split(/\r?\n/).forEach(raw => {
    const line = raw.trim();
    if (!line || line.startsWith("#")) return;
    const idx = line.indexOf("=");
    if (idx === -1) return;
    const k = line.slice(0, idx).trim();
    const v = line.slice(idx + 1).trim();
    if (!k) return;
    kv[k] = v;
    items.push({ key: k, value: v });
  });
  return { items, kv };
}

function parseSbsTextClient(text, filename) {
  const name = filename.replace(/\.sbs$/i, "");
  const { items, kv } = parseGwKvTextClient(text);
  const vmaj = kv.VersionMajor || "";
  const vmin = kv.VersionMinor || "";
  const rev = kv.Revision || "";
  const verStr = vmaj ? `${vmaj}.${vmin}${rev ? "." + rev : ""}` : "Installed";
  return {
    name,
    category: kv.Category || "Other",
    description: kv.Description || `${name} Server Application`,
    version: verStr,
    build_date: kv.Builddate || "-",
    executable: kv["server-executable"] || "",
    shell: kv.shell || "",
    wait_for_start: kv.WaitForStart || "",
    timeout: kv.Timeout || "",
    polling_interval: kv.MinimumPollingInterval || "",
    max_cores: kv.MaxCoresPerProcessor || "0",
    clean_tmp: kv.CleanTmp || "",
    sbs_file: filename,
    details: items
  };
}

async function scanMountedDirectoryHandleRecursive(dirHandle, relPath, depth, discovered, sbjList, gwMeta = null) {
  if (depth > 10) return;
  const fileHandles = [];
  const subDirs = [];
  for await (const entry of dirHandle.values()) {
    if (entry.kind === "file") {
      fileHandles.push(entry);
    } else if (entry.kind === "directory") {
      if (!CASTEP_SKIP_DIRS.has(entry.name.toLowerCase()) && !entry.name.startsWith(".")) {
        subDirs.push(entry);
      }
    }
  }

  // Check for BIOVIA Gateway metadata (.sbj, .sbs, gw-info.sbd, gwparams.cfg)
  const isArchDir = relPath.toLowerCase().includes("archive");
  for (const fh of fileHandles) {
    const low = fh.name.toLowerCase();
    if (low.endsWith(".sbj")) {
      try {
        const f = await fh.getFile();
        const rec = parseSbjTextClient(await f.text(), fh.name, isArchDir);
        sbjList.push(rec);
        if (gwMeta) {
          if (isArchDir) gwMeta.archived.push(rec);
          else gwMeta.active.push(rec);
        }
      } catch (e) {}
    } else if (gwMeta && low.endsWith(".sbs")) {
      try {
        const f = await fh.getFile();
        gwMeta.servers.push(parseSbsTextClient(await f.text(), fh.name));
      } catch (e) {}
    } else if (gwMeta && low === "gw-info.sbd") {
      try {
        const f = await fh.getFile();
        gwMeta.gwInfo = parseGwKvTextClient(await f.text());
      } catch (e) {}
    } else if (gwMeta && low === "gwparams.cfg") {
      try {
        const f = await fh.getFile();
        gwMeta.gwParams = parseGwKvTextClient(await f.text());
      } catch (e) {}
    }
  }

  // Group relevant CASTEP/structure files in this folder by normalized base seed
  const relFiles = fileHandles.filter(fh => CASTEP_RELEVANT_EXT_RE.test(fh.name) || fh.name.toLowerCase() === "status.txt");
  if (relFiles.length > 0) {
    const statusFh = relFiles.find(fh => fh.name.toLowerCase() === "status.txt") || null;
    const bySeed = {};
    for (const fh of relFiles) {
      if (fh.name.toLowerCase() === "status.txt") continue;
      const seed = normalizeCastepSeedClient(fh.name);
      if (!bySeed[seed]) bySeed[seed] = [];
      bySeed[seed].push(fh);
    }

    for (const [seed, handles] of Object.entries(bySeed)) {
      const fnames = handles.map(h => h.name);
      if (statusFh) fnames.push("Status.txt");
      const fileMap = {};
      let maxMtime = 0;
      for (const h of handles) {
        fileMap[h.name] = h;
        try {
          const fMeta = await h.getFile();
          if (fMeta.lastModified > maxMtime) maxMtime = fMeta.lastModified;
        } catch (e) {}
      }
      if (statusFh) fileMap["Status.txt"] = statusFh;

      const hasCastep = fnames.some(n => n.toLowerCase() === `${seed.toLowerCase()}.castep`);
      const hasStatus = !!statusFh;
      const hasOptics = fnames.some(n => (/optic|dielec|absorp/i.test(n) && n.toLowerCase().endsWith(".xcd") && !/(convergence|energies)/i.test(n)) || /\.(ome_bin|cst_ome)$/i.test(n) || n.toLowerCase().endsWith("_optics.bands") || n.toLowerCase().endsWith("_optics.castep"));
      const hasBandDos = fnames.some(n => n.toLowerCase().endsWith("_bandstr.bands") || n.toLowerCase().endsWith("_dos.bands") || (/(band structure|density of states|dos|pdos)/i.test(n) && n.toLowerCase().endsWith(".xcd")));
      const hasChdiff = fnames.some(n => /\.(chdiff|charg_frm|den_fmt|cube)$/i.test(n));

      const jobObj = enrichCastepJobSummary({
        id: "mnt_" + Math.abs(hashStringSimple(`${relPath}::${seed}`)),
        title: `${seed} (${dirHandle.name})`,
        project: relPath.split(/[\\/]/)[0] || "Mounted Folder",
        material: seed,
        folder: relPath,
        seed,
        status: hasCastep ? "Completed" : (hasStatus ? "Active / Running" : "Input Ready"),
        mtime: maxMtime,
        updated_at: maxMtime ? new Date(maxMtime).toISOString().slice(0, 19).replace("T", " ") : "",
        files_list: fnames.sort(),
        has_optics: hasOptics,
        has_band_dos: hasBandDos,
        has_chdiff: hasChdiff,
        charg_frm_files: fnames.filter(n => /\.(charg_frm|den_fmt|cube)$/i.test(n)),
        _dirHandle: dirHandle,
        _fileMap: fileMap,
        _hydrated: false
      });
      discovered.push(jobObj);
    }
  }

  for (const sub of subDirs) {
    await scanMountedDirectoryHandleRecursive(sub, `${relPath}/${sub.name}`, depth + 1, discovered, sbjList, gwMeta);
  }
}

function hashStringSimple(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

async function readFromFileOrHandle(fileOrHandle, asBinary = false) {
  if (!fileOrHandle) return null;
  try {
    const file = (typeof fileOrHandle.getFile === "function") ? await fileOrHandle.getFile() : fileOrHandle;
    return asBinary ? await file.arrayBuffer() : await file.text();
  } catch (e) {
    return null;
  }
}

async function hydrateCastepJobFromFileMap(job, opts = {}) {
  const map = job._fileMap || {};
  const entries = Object.entries(map);
  if (!entries.length) return;
  const seedLow = (job.seed || "").toLowerCase();

  const findEntry = (pred) => {
    const exact = entries.find(([n]) => n.toLowerCase().startsWith(seedLow) && pred(n.toLowerCase()));
    return exact || entries.find(([n]) => pred(n.toLowerCase())) || null;
  };

  // 1) Lightweight text & structural files first (so we know exact cell volume V_cell before parsing .chdiff!)
  const cellE = findEntry(l => l.endsWith(".cell") && !l.endsWith("_bandstr.cell") && !l.endsWith("_dos.cell") && !l.endsWith("_optics.cell"));
  if (cellE && !job.cell_text) job.cell_text = await readFromFileOrHandle(cellE[1], false) || "";

  const paramE = findEntry(l => l.endsWith(".param") && !l.endsWith("_bandstr.param") && !l.endsWith("_dos.param") && !l.endsWith("_optics.param"));
  if (paramE && !job.param_text) job.param_text = await readFromFileOrHandle(paramE[1], false) || "";

  const castepE = findEntry(l => l.endsWith(".castep") && !l.endsWith("_bandstr.castep") && !l.endsWith("_dos.castep") && !l.endsWith("_optics.castep"));
  if (castepE && !job.castep_text) job.castep_text = await readFromFileOrHandle(castepE[1], false) || "";

  const geomE = findEntry(l => l.endsWith(".geom"));
  if (geomE && !job.geom_text) job.geom_text = await readFromFileOrHandle(geomE[1], false) || "";

  const statusE = entries.find(([n]) => n.toLowerCase() === "status.txt");
  if (statusE && !job.status_text) job.status_text = await readFromFileOrHandle(statusE[1], false) || "";

  const xsdE = findEntry(l => l.endsWith(".xsd"));
  if (xsdE && !job.xsd_text) job.xsd_text = await readFromFileOrHandle(xsdE[1], false) || "";

  const cifE = findEntry(l => l.endsWith(".cif"));
  if (cifE && !job.cif_text) job.cif_text = await readFromFileOrHandle(cifE[1], false) || "";

  // 2) Electronic .xcd and .bands files
  const bandXcdE = findEntry(l => l.endsWith(".xcd") && l.includes("band structure"));
  if (bandXcdE && !job.band_xcd) {
    const t = await readFromFileOrHandle(bandXcdE[1], false);
    if (t) job.band_xcd = parseCastepXcdXmlClient(t, true);
  }
  const pdosXcdE = findEntry(l => l.endsWith(".xcd") && (l.includes("pdos") || l.includes("partial density of states")));
  if (pdosXcdE && !job.pdos_xcd) {
    const t = await readFromFileOrHandle(pdosXcdE[1], false);
    if (t) job.pdos_xcd = parseCastepXcdXmlClient(t, false);
  }
  const dosXcdE = findEntry(l => l.endsWith(".xcd") && (l.includes("density of states") || l.includes(" dos") || l === "dos.xcd") && !l.includes("partial") && !l.includes("pdos"));
  if (dosXcdE && !job.dos_xcd) {
    const t = await readFromFileOrHandle(dosXcdE[1], false);
    if (t) job.dos_xcd = parseCastepXcdXmlClient(t, false);
  }
  const convXcdE = findEntry(l => l.endsWith(".xcd") && l.includes("convergence"));
  if (convXcdE && !job.conv_xcd) {
    const t = await readFromFileOrHandle(convXcdE[1], false);
    if (t) job.conv_xcd = parseCastepXcdXmlClient(t, false);
  }
  const enerXcdE = findEntry(l => l.endsWith(".xcd") && l.includes("energies"));
  if (enerXcdE && !job.ener_xcd) {
    const t = await readFromFileOrHandle(enerXcdE[1], false);
    if (t) job.ener_xcd = parseCastepXcdXmlClient(t, false);
  }

  // 3) ALL Optical .xcd files (Absorption, Re/Im Epsilon, Refractive, Reflectivity, Conductivity, Loss)
  const optEntries = entries.filter(([n]) => {
    const l = n.toLowerCase();
    return l.endsWith(".xcd")
      && /(optical|dielec|absorp|reflectiv|refractiv|loss|conductiv)/i.test(l)
      && !/(convergence|energies|band structure|density of states|pdos)/i.test(l);
  });
  if (optEntries.length > 0 && (!job.optical_xcds || !job.optical_xcds.length)) {
    job.optical_xcds = [];
    for (const [fname, handle] of optEntries) {
      const t = await readFromFileOrHandle(handle, false);
      const parsed = parseCastepXcdXmlClient(t, false);
      if (parsed && parsed.series && parsed.series.length) {
        parsed.filename = fname;
        job.optical_xcds.push(parsed);
      }
    }
    if (job.optical_xcds.length) job.optical_xcd = job.optical_xcds[0];
  }

  const bstrE = findEntry(l => l.endsWith("_bandstr.bands"));
  if (bstrE && !job.bandstr_bands) {
    const t = await readFromFileOrHandle(bstrE[1], false);
    if (t) job.bandstr_bands = parseCastepBandsTextClient(t);
  }
  const dosBE = findEntry(l => l.endsWith("_dos.bands")) || findEntry(l => l.endsWith(".bands") && !l.endsWith("_bandstr.bands") && !l.endsWith("_optics.bands"));
  if (dosBE && !job.dos_bands) {
    const t = await readFromFileOrHandle(dosBE[1], false);
    if (t) job.dos_bands = parseCastepBandsTextClient(t);
  }
  const optBE = findEntry(l => l.endsWith("_optics.bands"));
  if (optBE && !job.optics_bands) {
    const t = await readFromFileOrHandle(optBE[1], false);
    if (t) job.optics_bands = parseCastepBandsTextClient(t);
    job.optics_bands_file = optBE[0];
  }
  const optCastepE = findEntry(l => l.endsWith("_optics.castep"));
  if (optCastepE && !job.optics_castep_text) {
    const t = await readFromFileOrHandle(optCastepE[1], false);
    if (t) job.optics_castep_text = t;
    job.optics_castep_file = optCastepE[0];
  }
  const optCellE = findEntry(l => l.endsWith("_optics.cell"));
  let optCellText = "";
  if (optCellE) {
    optCellText = (await readFromFileOrHandle(optCellE[1], false)) || "";
    job.optics_cell_file = optCellE[0];
  }
  const omeBinE = findEntry(l => l.endsWith(".ome_bin") || l.endsWith(".cst_ome"));
  if (omeBinE) {
    job.ome_bin_file = omeBinE[0];
    if (!job.optical_tensor && job.optics_bands) {
      const buf = await readFromFileOrHandle(omeBinE[1], true);
      if (buf && typeof parseCastepOmeBinArrayBuffer === "function") {
        job.optical_tensor = parseCastepOmeBinArrayBuffer(
          buf, job.optics_bands, optCellText || job.cell_text || "", job.optics_castep_text || "",
          omeBinE[0], job.optics_castep_file || optBE?.[0] || omeBinE[0]
        );
      }
    }
  }
  const pdosBinE = findEntry(l => l.endsWith("_dos.pdos_bin")) || findEntry(l => l.endsWith(".pdos_bin"));
  if (pdosBinE && !job.pdos_bin_data) {
    const refBands = job.dos_bands || job.bandstr_bands;
    if (refBands) {
      const spOrder = extractSpeciesOrderFromJobText(job);
      const buf = await readFromFileOrHandle(pdosBinE[1], true);
      if (buf) job.pdos_bin_data = parseCastepPdosBinArrayBuffer(buf, refBands, spOrder, pdosBinE[0]);
    }
  }

  // 4) Exact Cell Volume & c-length for volumetric .chdiff / .charg_frm conversion to physical e/Å³
  let vol = 1.0, cLen = 1.0;
  if (job.cell_text) {
    const ps = parseCastepCellText(job.cell_text, job.seed);
    if (ps && ps.vectors) {
      vol = castepCellVolume(ps.vectors) || 1.0;
      cLen = Math.hypot(...ps.vectors[2]) || 1.0;
    }
  } else if (job.xsd_text) {
    const ps = parseMaterialsStudioXsd(job.xsd_text, job.seed);
    if (ps && ps.vectors) {
      vol = castepCellVolume(ps.vectors) || 1.0;
      cLen = Math.hypot(...ps.vectors[2]) || 1.0;
    }
  }

  const chdiffE = findEntry(l => l.endsWith(".chdiff"));
  if (chdiffE && !job.chdiff_data && !opts.fastFirst) {
    const buf = await readFromFileOrHandle(chdiffE[1], true);
    if (buf) {
      job.chdiff_data = parseCastepChdiffArrayBuffer(buf, chdiffE[0], vol, cLen);
    }
  }
  job.charg_frm_files = entries.filter(([n]) => /\.(charg_frm|den_fmt|cube)$/i.test(n)).map(([n]) => n);
}

async function hydrateCastepJobFromDirHandle(job) {
  if (job._fileMap && Object.keys(job._fileMap).length > 0) {
    await hydrateCastepJobFromFileMap(job);
  }
}

async function handleCastepFilesUpload(event) {
  const files = Array.from(event.target?.files || []);
  if (!files.length) return;
  await ingestUploadedCastepFileGroup(files, "Imported Local Files");
  event.target.value = "";
}
window.handleCastepFilesUpload = handleCastepFilesUpload;

async function handleCastepFolderFallbackUpload(event) {
  const files = Array.from(event.target?.files || []);
  if (!files.length) return;
  const byDir = {};
  const sbjList = [];

  for (const f of files) {
    const rel = f.webkitRelativePath || f.name;
    if (f.name.toLowerCase().endsWith(".sbj")) {
      try { sbjList.push(parseSbjTextClient(await f.text(), f.name, rel.toLowerCase().includes("archive"))); } catch (e) {}
      continue;
    }
    if (!CASTEP_RELEVANT_EXT_RE.test(f.name) && f.name.toLowerCase() !== "status.txt") continue;
    const dir = rel.includes("/") ? rel.slice(0, rel.lastIndexOf("/")) : "Uploaded_Folder";
    if (!byDir[dir]) byDir[dir] = [];
    byDir[dir].push(f);
  }

  const discovered = [];
  for (const [dir, fList] of Object.entries(byDir)) {
    const statusF = fList.find(f => f.name.toLowerCase() === "status.txt") || null;
    const bySeed = {};
    for (const f of fList) {
      if (f.name.toLowerCase() === "status.txt") continue;
      const seed = normalizeCastepSeedClient(f.name);
      if (!bySeed[seed]) bySeed[seed] = [];
      bySeed[seed].push(f);
    }
    for (const [seed, sfList] of Object.entries(bySeed)) {
      const fnames = sfList.map(f => f.name);
      const fileMap = {};
      let maxMtime = 0;
      sfList.forEach(f => {
        fileMap[f.name] = f;
        if (f.lastModified > maxMtime) maxMtime = f.lastModified;
      });
      if (statusF) { fnames.push("Status.txt"); fileMap["Status.txt"] = statusF; }
      const folderName = dir.split(/[\\/]/).pop() || dir;
      discovered.push(enrichCastepJobSummary({
        id: "upl_" + Math.abs(hashStringSimple(`${dir}::${seed}`)),
        title: `${seed} (${folderName})`,
        project: dir.split(/[\\/]/)[0] || "Uploaded Folder",
        material: seed,
        folder: dir,
        seed,
        mtime: maxMtime,
        updated_at: maxMtime ? new Date(maxMtime).toISOString().slice(0, 19).replace("T", " ") : "",
        files_list: fnames.sort(),
        charg_frm_files: fnames.filter(n => /\.(charg_frm|den_fmt|cube)$/i.test(n)),
        _fileMap: fileMap,
        _hydrated: false
      }));
    }
  }

  discovered.sort((a, b) => (b.mtime || 0) - (a.mtime || 0));
  if (discovered.length > 0) {
    const newKeys = new Set(discovered.map(j => `${j.folder}::${j.seed}`));
    CASTEP_STUDIO_STATE.jobs = [...discovered, ...CASTEP_STUDIO_STATE.jobs.filter(j => !newKeys.has(`${j.folder}::${j.seed}`))];
    renderCastepJobsList();
    updateCastepKpiBar();
    await loadCastepJobIntoStudio(discovered[0].id);
    updateCastepConnectionPill(true, `Folder Loaded • ${discovered.length} calculation(s)`);
    if (typeof showToast === "function") showToast(`📂 Loaded ${discovered.length} calculation(s) from folder!`, "success");
  }
  if (sbjList.length > 0) {
    CASTEP_STUDIO_STATE.gatewayJobs = sbjList.sort((a, b) => (b.create_ts || 0) - (a.create_ts || 0));
    CASTEP_STUDIO_STATE.gatewayConnected = true;
    CASTEP_STUDIO_STATE.gatewayHost = "Uploaded Gateway Folder";
    renderMsGatewayTable();
    if (!discovered.length) switchCastepStagePane("gateway");
  }
  event.target.value = "";
}
window.handleCastepFolderFallbackUpload = handleCastepFolderFallbackUpload;

async function ingestUploadedCastepFileGroup(files, folderLabel) {
  const bySeed = {};
  const statusF = files.find(f => f.name.toLowerCase() === "status.txt") || null;
  const sbjFiles = files.filter(f => f.name.toLowerCase().endsWith(".sbj"));

  if (sbjFiles.length > 0) {
    const parsedSbj = [];
    for (const f of sbjFiles) parsedSbj.push(parseSbjTextClient(await f.text(), f.name, false));
    CASTEP_STUDIO_STATE.gatewayJobs = [...parsedSbj, ...CASTEP_STUDIO_STATE.gatewayJobs];
    CASTEP_STUDIO_STATE.gatewayConnected = true;
    CASTEP_STUDIO_STATE.gatewayHost = "Imported Gateway .sbj";
    renderMsGatewayTable();
  }

  for (const f of files) {
    if (f.name.toLowerCase() === "status.txt" || f.name.toLowerCase().endsWith(".sbj")) continue;
    const seed = normalizeCastepSeedClient(f.name);
    if (!bySeed[seed]) bySeed[seed] = [];
    bySeed[seed].push(f);
  }

  let firstJobId = null;
  let importedCount = 0;
  for (const [seed, sfList] of Object.entries(bySeed)) {
    const fileMap = {};
    const fnames = [];
    sfList.forEach(f => { fileMap[f.name] = f; fnames.push(f.name); });
    if (statusF) { fileMap["Status.txt"] = statusF; fnames.push("Status.txt"); }

    const job = {
      id: "import_" + Date.now() + "_" + Math.floor(Math.random() * 10000),
      title: `${seed} (Imported)`,
      project: "Imported Calculation",
      material: seed,
      folder: folderLabel,
      seed,
      updated_at: new Date().toISOString().slice(0, 19).replace("T", " "),
      files_list: fnames.sort(),
      _fileMap: fileMap,
      _hydrated: false
    };
    await hydrateCastepJobFromFileMap(job);
    const enriched = enrichCastepJobSummary(job);
    enriched._hydrated = true;
    CASTEP_STUDIO_STATE.jobs.unshift(enriched);
    if (!firstJobId) firstJobId = enriched.id;
    importedCount++;
  }

  if (firstJobId) {
    await loadCastepJobIntoStudio(firstJobId);
    updateCastepConnectionPill(true, `Imported ${importedCount} calculation(s)`);
    if (typeof showToast === "function") {
      showToast(`📥 Imported ${importedCount} calculation(s) (${files.length} file(s))!`, "success");
    }
  }
}

// --- Open any structure from Crystal Structures Library directly in Data Analysis ---
function openStructureInCastepStudio(structId) {
  if (typeof STATE === "undefined" || !Array.isArray(STATE.structures)) return;
  const s = STATE.structures.find(x => Number(x.id) === Number(structId));
  if (!s) return;
  if (typeof switchTab === "function") switchTab("castep");

  const rawCif = s.cif_content || s.raw_cif || "";
  let builtFromCif = null;
  if (rawCif && (typeof parseCifFullCrystal === "function" || typeof parseCifTextClient === "function")) {
    const parsed = typeof parseCifFullCrystal === "function"
      ? parseCifFullCrystal(rawCif, s.name || "Structure.cif")
      : parseCifTextClient(rawCif, s.name || "Structure.cif");
    builtFromCif = buildCastepStructureFromParsedCif(parsed, s.name || s.chemical_formula);
  }

  if (builtFromCif) {
    CASTEP_STUDIO_STATE.structure = builtFromCif;
    CASTEP_STUDIO_STATE.originalStructureBackup = JSON.parse(JSON.stringify(builtFromCif));
    afterCastepStructureModified(`Loaded "${s.name}" (${builtFromCif.spaceGroup}, ${builtFromCif.atoms.length} unit-cell atoms) into 3D Structure Viewer!`, true);
    return;
  }

  const atoms = (s.atoms && s.atoms.length) ? JSON.parse(JSON.stringify(s.atoms)) : [];
  const lat = {
    a: parseFloat(s.a) || 4.0, b: parseFloat(s.b) || 4.0, c: parseFloat(s.c) || 15.0,
    alpha: parseFloat(s.alpha) || 90.0, beta: parseFloat(s.beta) || 90.0, gamma: parseFloat(s.gamma) || 90.0
  };
  const vecs = castepParamsToVectors(lat.a, lat.b, lat.c, lat.alpha, lat.beta, lat.gamma);
  CASTEP_STUDIO_STATE.structure = {
    name: s.name || s.chemical_formula,
    formula: s.chemical_formula || castepComputeFormula(atoms),
    spaceGroup: s.space_group || "P 1 (1)",
    spaceGroupHM: s.space_group_hm || "P 1",
    spaceGroupIT: Number(s.space_group_it) || 1,
    hallSymbol: s.hall_symbol || "P 1",
    crystalSystem: s.crystal_system || castepInferCrystalSystem(lat),
    symops: ["x, y, z"],
    asymmetricAtoms: null,
    symmetryIntact: false,
    lattice: lat,
    vectors: vecs,
    atoms: atoms.map((a, i) => ({
      element: castepCleanElement(a.element),
      label: a.label || `${a.element}${i+1}`,
      x: Number(a.x) || 0, y: Number(a.y) || 0, z: Number(a.z) || 0,
      occupancy: Number(a.occupancy ?? 1.0),
      fixed: false, fx: 0, fy: 0, fz: 0, charge: null
    })),
    kpointsBlock: "",
    speciesPotBlock: ""
  };
  CASTEP_STUDIO_STATE.originalStructureBackup = JSON.parse(JSON.stringify(CASTEP_STUDIO_STATE.structure));
  afterCastepStructureModified(`Loaded "${s.name}" into Data Analysis 3D Structure Viewer!`);
}
window.openStructureInCastepStudio = openStructureInCastepStudio;

// ============================================================================
// 8A. Ultra-Sharp Hi-DPI PNG Export (300-600 DPI + pHYs), HD Clipboard Image
//     Copy/Paste, Direct TSV Plot Data Copy, & Right-Click Plot Menu (v136)
// ============================================================================

function injectPngDpiMetadata(pngBytes, dpi) {
  // Inserts a PNG pHYs chunk right after IHDR (byte offset 33) so Word / PowerPoint / Origin
  // paste and place Hi-DPI plots at exact physical print dimensions (300 / 400 / 600 DPI).
  if (!pngBytes || pngBytes.length < 34) return pngBytes;
  // Check PNG signature (89 50 4E 47 0D 0A 1A 0A)
  if (pngBytes[0] !== 0x89 || pngBytes[1] !== 0x50 || pngBytes[2] !== 0x4E || pngBytes[3] !== 0x47) return pngBytes;
  // Skip if a pHYs chunk is already present in header area
  for (let i = 8; i < Math.min(pngBytes.length - 8, 200); i++) {
    if (pngBytes[i] === 0x70 && pngBytes[i + 1] === 0x48 && pngBytes[i + 2] === 0x59 && pngBytes[i + 3] === 0x73) {
      return pngBytes;
    }
  }
  const ppm = Math.round((dpi || 384) / 0.0254); // pixels per meter
  const chunk = new Uint8Array(21);
  const dv = new DataView(chunk.buffer);
  dv.setUint32(0, 9, false); // chunk data length = 9
  chunk[4] = 0x70; chunk[5] = 0x48; chunk[6] = 0x59; chunk[7] = 0x73; // "pHYs"
  dv.setUint32(8, ppm, false);  // pixels per unit X
  dv.setUint32(12, ppm, false); // pixels per unit Y
  chunk[16] = 1;                // unit = meter
  const crc = _crc32Bytes(chunk.subarray(4, 17));
  dv.setUint32(17, crc, false);

  const out = new Uint8Array(pngBytes.length + 21);
  out.set(pngBytes.subarray(0, 33), 0);
  out.set(chunk, 33);
  out.set(pngBytes.subarray(33), 54);
  return out;
}

function getPlotRendererForCanvas(canvasId) {
  switch (canvasId) {
    case "castep-electronic-canvas": return typeof renderCastepElectronicPlots === "function" ? renderCastepElectronicPlots : null;
    case "castep-optics-canvas": return typeof renderCastepOpticalPlots === "function" ? renderCastepOpticalPlots : null;
    case "castep-chdiff-canvas": return typeof renderCastepChdiffPlots === "function" ? renderCastepChdiffPlots : null;
    case "castep-spinmat-canvas": return typeof renderCastepSpinMatrix === "function" ? renderCastepSpinMatrix : null;
    case "castep-mulliken-mag-canvas":
    case "castep-mulliken-bond-canvas": return typeof renderCastepMullikenPane === "function" ? renderCastepMullikenPane : null;
    case "castep-energy-chart-canvas":
    case "castep-conv-chart-canvas": return typeof renderCastepConvergencePlots === "function" ? renderCastepConvergencePlots : null;
    case "castep-3d-canvas": return typeof renderCastep3DScene === "function" ? renderCastep3DScene : null;
    default: return null;
  }
}

async function renderCanvasToHighResPngBlob(canvasId, scaleOverride = null, subPanelKey = null) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  const st = getCastepPlotStyle();
  const targetScale = Number(scaleOverride || st.exportScale || 4);
  const dpi = Math.round(targetScale * 100); // 3x -> 300 DPI, 4x -> 400 DPI, 6x -> 600 DPI
  const rerender = getPlotRendererForCanvas(canvasId);

  let rawBlob = null;
  let widthPx = canvas.width;
  let heightPx = canvas.height;
  try {
    window._castepExportHideSelection = true;
    if (rerender) {
      window._castepRenderDprOverride = targetScale;
      rerender();
    }
    const cssW = parseFloat(canvas.style.width) || canvas.clientWidth || (canvas.width / targetScale);
    const actualDpr = canvas.width / Math.max(1, cssW);

    let outCanvas = canvas;
    if (subPanelKey && Array.isArray(canvas._subPanelRects)) {
      const rect = canvas._subPanelRects.find(r => r.key === subPanelKey);
      if (rect && rect.w > 10 && rect.h > 10) {
        const sx = Math.max(0, Math.round(rect.x * actualDpr));
        const sy = Math.max(0, Math.round(rect.y * actualDpr));
        const sw = Math.min(canvas.width - sx, Math.round(rect.w * actualDpr));
        const sh = Math.min(canvas.height - sy, Math.round(rect.h * actualDpr));
        const padPx = Math.round(6 * actualDpr);
        const off = document.createElement("canvas");
        off.width = sw + padPx * 2;
        off.height = sh + padPx * 2;
        const octx = off.getContext("2d");
        octx.fillStyle = "#ffffff";
        octx.fillRect(0, 0, off.width, off.height);
        octx.drawImage(canvas, sx, sy, sw, sh, padPx, padPx, sw, sh);
        outCanvas = off;
      }
    }

    widthPx = outCanvas.width;
    heightPx = outCanvas.height;
    rawBlob = await new Promise((resolve) => {
      if (outCanvas.toBlob) outCanvas.toBlob(b => resolve(b), "image/png");
      else resolve(null);
    });
  } finally {
    window._castepExportHideSelection = false;
    if (rerender) {
      window._castepRenderDprOverride = null;
      rerender();
    }
  }
  if (!rawBlob) return null;
  const rawBuf = await rawBlob.arrayBuffer();
  const withDpi = injectPngDpiMetadata(new Uint8Array(rawBuf), dpi);
  const finalBlob = new Blob([withDpi], { type: "image/png" });
  return { blob: finalBlob, widthPx, heightPx, dpi, scale: targetScale };
}
window.renderCanvasToHighResPngBlob = renderCanvasToHighResPngBlob;

async function exportCastepCanvasPNG(canvasId, filename, subPanelKey = null) {
  const res = await renderCanvasToHighResPngBlob(canvasId, null, subPanelKey);
  if (!res || !res.blob) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = filename || "CASTEP_Plot.png";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => a.remove(), 200);
    return;
  }
  triggerBlobDownload(res.blob, filename || "CASTEP_Plot.png");
  if (typeof showToast === "function") {
    showToast(`Exported HD PNG: ${filename || "CASTEP_Plot.png"} (${res.widthPx}×${res.heightPx} px, ${res.dpi} DPI)!`, "success");
  }
}
window.exportCastepCanvasPNG = exportCastepCanvasPNG;

async function exportCastepSubPanelPNG(canvasId, subPanelKey, filename) {
  return exportCastepCanvasPNG(canvasId, filename || `CASTEP_${subPanelKey}.png`, subPanelKey);
}
window.exportCastepSubPanelPNG = exportCastepSubPanelPNG;

async function writePngBlobToClipboardOrDownload(res, label, canvasId, subPanelKey = null) {
  window._lastCopiedPlotImageInfo = {
    canvasId, subPanelKey, label, widthPx: res.widthPx, heightPx: res.heightPx, dpi: res.dpi, byteSize: res.blob.size
  };
  try {
    if (navigator.clipboard && typeof navigator.clipboard.write === "function" && typeof ClipboardItem !== "undefined") {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": res.blob })]);
      if (typeof showToast === "function") {
        showToast(`📋 Copied ${label} (${res.widthPx}×${res.heightPx} px, ${res.dpi} DPI) — Ctrl+V directly into Word / PowerPoint!`, "success");
      }
      return true;
    }
  } catch (err) {
    console.warn("Clipboard image write fallback:", err);
  }
  const fallbackName = `CASTEP_${sanitizeExportSeed(label)}_${res.dpi}DPI.png`;
  triggerBlobDownload(res.blob, fallbackName);
  if (typeof showToast === "function") {
    showToast(`Clipboard image requires HTTPS/localhost — downloaded ${fallbackName} (${res.widthPx}×${res.heightPx} px, ${res.dpi} DPI) instead.`, "warning");
  }
  return false;
}

async function copyCastepCanvasHD(canvasId, label = "Plot", subPanelKey = null) {
  const res = await renderCanvasToHighResPngBlob(canvasId, null, subPanelKey);
  if (!res || !res.blob) {
    if (typeof showToast === "function") showToast("No rendered plot available to copy.", "warning");
    return false;
  }
  return writePngBlobToClipboardOrDownload(res, label, canvasId, subPanelKey);
}
window.copyCastepCanvasHD = copyCastepCanvasHD;

async function copyCastepSubPanelHD(canvasId, subPanelKey, label = "Sub-Panel") {
  return copyCastepCanvasHD(canvasId, label, subPanelKey);
}
window.copyCastepSubPanelHD = copyCastepSubPanelHD;

async function copyCastepCanvasPairHD(canvasIds, label = "Full Charts") {
  if (!Array.isArray(canvasIds) || !canvasIds.length) return false;
  const st = getCastepPlotStyle();
  const targetScale = Number(st.exportScale || 4);
  const dpi = Math.round(targetScale * 100);
  const rerender = getPlotRendererForCanvas(canvasIds[0]);
  let rawBlob = null, widthPx = 0, heightPx = 0;

  try {
    window._castepExportHideSelection = true;
    if (rerender) {
      window._castepRenderDprOverride = targetScale;
      rerender();
    }
    const canvases = canvasIds.map(id => document.getElementById(id)).filter(c => c && c.width > 0 && c.height > 0);
    if (!canvases.length) return false;
    const gap = Math.round(18 * targetScale);
    const pad = Math.round(12 * targetScale);
    const totalW = canvases.reduce((s, c) => s + c.width, 0) + gap * (canvases.length - 1) + pad * 2;
    const totalH = Math.max(...canvases.map(c => c.height)) + pad * 2;
    const off = document.createElement("canvas");
    off.width = totalW;
    off.height = totalH;
    const octx = off.getContext("2d");
    octx.fillStyle = "#ffffff";
    octx.fillRect(0, 0, totalW, totalH);
    let curX = pad;
    canvases.forEach(c => {
      octx.drawImage(c, curX, pad);
      curX += c.width + gap;
    });
    widthPx = totalW;
    heightPx = totalH;
    rawBlob = await new Promise(resolve => off.toBlob ? off.toBlob(b => resolve(b), "image/png") : resolve(null));
  } finally {
    window._castepExportHideSelection = false;
    if (rerender) {
      window._castepRenderDprOverride = null;
      rerender();
    }
  }
  if (!rawBlob) return false;
  const rawBuf = await rawBlob.arrayBuffer();
  const withDpi = injectPngDpiMetadata(new Uint8Array(rawBuf), dpi);
  const res = { blob: new Blob([withDpi], { type: "image/png" }), widthPx, heightPx, dpi };
  return writePngBlobToClipboardOrDownload(res, label, canvasIds.join("+"), "pair");
}
window.copyCastepCanvasPairHD = copyCastepCanvasPairHD;

function buildTsvString(headers, rows) {
  const cleanCell = (v) => String(v === null || v === undefined ? "" : v).replace(/\t/g, " ").replace(/\r?\n/g, " ");
  const lines = [headers.map(cleanCell).join("\t")];
  (rows || []).forEach(r => lines.push((r || []).map(cleanCell).join("\t")));
  return lines.join("\n");
}
window.buildTsvString = buildTsvString;

async function copyTextToClipboardSafe(text) {
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (_) {}
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return !!ok;
  } catch (_) {
    return false;
  }
}

function combineBandSheetsFlat(bandSheets) {
  if (!bandSheets || !bandSheets.length) return null;
  if (bandSheets.length === 1) return { headers: bandSheets[0].headers, rows: bandSheets[0].rows };
  const s0 = bandSheets[0], s1 = bandSheets[1];
  return {
    headers: [...s0.headers, ...s1.headers.slice(3)],
    rows: s0.rows.map((r, i) => [...r, ...(s1.rows[i] ? s1.rows[i].slice(3) : [])])
  };
}

function buildCastepPlotDataForClipboard(plotKey, subPart = "auto") {
  const job = (CASTEP_STUDIO_STATE.jobs || []).find(j => j.id === CASTEP_STUDIO_STATE.activeJobId);

  if (plotKey === "electronic") {
    const pkg = buildElectronicExportTables();
    if (!pkg) return null;
    const layout = document.getElementById("castep-elec-layout")?.value || "joint";
    const bandFlat = combineBandSheetsFlat(pkg.bandSheets);

    if (subPart === "full" && layout === "joint" && pkg.pdosSheet?.rows?.length && bandFlat?.rows?.length) {
      const rows = [
        ...pkg.pdosSheet.rows,
        [],
        ["=== BAND STRUCTURE ==="],
        bandFlat.headers,
        ...bandFlat.rows
      ];
      return { title: "Full Band & PDOS Data", headers: pkg.pdosSheet.headers, rows };
    }
    const mode = (subPart === "auto" || subPart === "full") ? (layout === "band" ? "band" : "pdos") : subPart;
    if (mode === "band") {
      if (!bandFlat) return null;
      return { title: pkg.bandSheets.length >= 2 ? "Band Structure (Spin Up & Down)" : "Band Structure", headers: bandFlat.headers, rows: bandFlat.rows };
    }
    return { title: `PDOS (${pkg.pdosSheet.name})`, headers: pkg.pdosSheet.headers, rows: pkg.pdosSheet.rows };
  }

  if (plotKey === "optics") {
    const pkg = buildOpticalExportTables();
    if (!pkg) return null;
    const prop = document.getElementById("castep-opt-property")?.value || "multigrid";
    if (subPart === "dielectric") return { title: "Panel (a) Dielectric ε₁/ε₂", headers: pkg.dielSheet.headers, rows: pkg.dielSheet.rows };
    if (subPart === "absorption") return { title: "Panel (b) Absorption α & Tauc", headers: pkg.absSheet.headers, rows: pkg.absSheet.rows };
    if (subPart === "refractive") return { title: "Panel (c) Refractive n & k", headers: pkg.nkSheet.headers, rows: pkg.nkSheet.rows };
    if (subPart === "rlc") return { title: "Panel (d) Reflectivity R & EELS L", headers: pkg.rlcSheet.headers, rows: pkg.rlcSheet.rows };
    if ((subPart === "anisotropy" || prop === "anisotropy") && pkg.anisoSheet) {
      return { title: "Optical Anisotropy Tensor", headers: pkg.anisoSheet.headers, rows: pkg.anisoSheet.rows };
    }
    return { title: "Full Optical Spectra (All Channels)", headers: pkg.fullSheet.headers, rows: pkg.fullSheet.rows };
  }

  if (plotKey === "spinmat") {
    const orbData = getActiveJobOrbitalSpinData(job);
    if (!orbData || !orbData.atoms?.length) return null;
    const activeEl = document.getElementById("castep-spinmat-element")?.value || "all_grid";
    const atomMode = document.getElementById("castep-spinmat-atom")?.value || "avg";
    const reqShell = document.getElementById("castep-spinmat-shell")?.value || "auto";
    const qty = document.getElementById("castep-spinmat-qty")?.value || (orbData.mode === "noncollinear" ? "sz" : "spin");
    const decimals = parseInt(document.getElementById("castep-spinmat-decimals")?.value || "3", 10);

    const targetEl = (typeof subPart === "string" && subPart.startsWith("el:")) ? subPart.slice(3) : activeEl;

    if (targetEl !== "all_grid" && subPart !== "all_elements") {
      const sp = getSpinMatrixElementsSummary(orbData).find(s => s.element === targetEl);
      if (sp) {
        const useAtomMode = (typeof subPart === "string" && subPart.startsWith("el:")) ? (atomMode === "sum" ? "sum" : "avg") : atomMode;
        const agg = aggregateElementOrbitals(sp.atoms, useAtomMode, orbData.mode);
        const res = resolveSpinMatrixEntries(agg.orbitals, reqShell, orbData.source, qty, orbData.mode);
        const labels = res.entries.map(e => e.spec.plain);
        const headers = [`${agg.label.replace(/\s+/g, "_")}_${qty}`, ...labels];
        const rows = res.entries.map((rowE, rIdx) => [
          rowE.spec.plain,
          ...res.entries.map((_, cIdx) => rIdx === cIdx ? Number(rowE.val.toFixed(Math.max(decimals, 5))) : 0)
        ]);
        rows.push([]);
        if (orbData.mode === "noncollinear") {
          rows.push(["Orbital", "Charge_e", "Sx_muB", "Sy_muB", "Sz_muB", "S_mag_muB"]);
          res.entries.forEach(e => {
            const r = e.raw;
            const sm = r.smag !== undefined ? r.smag : Math.hypot(r.sx || 0, r.sy || 0, r.sz || 0);
            rows.push([e.spec.plain, Number((r.charge || 0).toFixed(5)), Number((r.sx || 0).toFixed(5)), Number((r.sy || 0).toFixed(5)), Number((r.sz || 0).toFixed(5)), Number(sm.toFixed(5))]);
          });
        } else {
          rows.push(["Orbital", "Up_e", "Down_e", "Spin_muB", "Charge_e"]);
          res.entries.forEach(e => {
            const r = e.raw;
            rows.push([e.spec.plain, Number((r.up || 0).toFixed(5)), Number((r.dn || 0).toFixed(5)), Number((r.spin || 0).toFixed(5)), Number((r.charge !== undefined ? r.charge : ((r.up || 0) + (r.dn || 0))).toFixed(5))]);
          });
        }
        if (subPart === "full") {
          const allSheet = buildOrbitalSpinMatrixExportSheet(job);
          if (allSheet && allSheet.rows.length) {
            rows.push([], ["=== ALL ELEMENTS ORBITAL SPIN TABLE ==="], allSheet.headers, ...allSheet.rows);
          }
        }
        return { title: subPart === "full" ? `Full Spin Matrix (${agg.label} + All Elements)` : `Spin Matrix (${agg.label} ${res.effectiveShell})`, headers, rows };
      }
    }
    const fullSheet = buildOrbitalSpinMatrixExportSheet(job);
    return fullSheet ? { title: "All-Elements Orbital Spin Matrix", headers: fullSheet.headers, rows: fullSheet.rows } : null;
  }

  if (plotKey === "mulliken") {
    const pkg = buildMullikenExportTables();
    if (!pkg) return null;
    if (subPart === "full") {
      const rows = [...pkg.atomSheet.rows];
      if (pkg.bondSheet?.rows?.length) {
        rows.push([], ["=== MULLIKEN BOND POPULATIONS ==="], pkg.bondSheet.headers, ...pkg.bondSheet.rows);
      }
      return { title: "Full Mulliken (Atomic + Bonds)", headers: pkg.atomSheet.headers, rows };
    }
    const sheet = (subPart === "bonds") ? pkg.bondSheet : pkg.atomSheet;
    return { title: subPart === "bonds" ? "Mulliken Bond Populations" : "Atomic Mulliken & Spin", headers: sheet.headers, rows: sheet.rows };
  }

  if (plotKey === "chdiff") {
    const pkg = buildChdiffExportTables();
    if (!pkg) return null;
    const sheet = (subPart === "2d") ? pkg.sheet2D : pkg.sheet1D;
    return { title: subPart === "2d" ? "2D Charge Diff Slice" : "1D Planar Δρ(z) & ΔQ(z)", headers: sheet.headers, rows: sheet.rows };
  }

  if (plotKey === "convergence") {
    const pkg = buildConvergenceExportTables();
    if (!pkg) return null;
    const base = (pkg.scfSheet && pkg.scfSheet.rows.length) ? pkg.scfSheet : pkg.geomSheet;
    if (!base || !base.rows.length) return null;
    if (subPart === "full" && pkg.scfSheet?.rows?.length && pkg.geomSheet?.rows?.length) {
      const rows = [...pkg.scfSheet.rows, [], ["=== GEOMETRY OPTIMIZATION TRAJECTORY ==="], pkg.geomSheet.headers, ...pkg.geomSheet.rows];
      return { title: "Full SCF & GeomOpt Convergence", headers: pkg.scfSheet.headers, rows };
    }
    return { title: "SCF & Energy Convergence", headers: base.headers, rows: base.rows };
  }

  return null;
}
window.buildCastepPlotDataForClipboard = buildCastepPlotDataForClipboard;

async function copyCastepPlotData(plotKey, subPart = "auto") {
  const tbl = buildCastepPlotDataForClipboard(plotKey, subPart);
  if (!tbl || !tbl.rows || !tbl.rows.length) {
    if (typeof showToast === "function") showToast("No numerical data available on this plot to copy.", "warning");
    return false;
  }
  const tsv = buildTsvString(tbl.headers, tbl.rows);
  window._lastCopiedPlotDataInfo = {
    plotKey, subPart, title: tbl.title, rows: tbl.rows.length, cols: tbl.headers.length,
    chars: tsv.length, headers: tbl.headers, preview: tsv.slice(0, 320)
  };
  const ok = await copyTextToClipboardSafe(tsv);
  if (typeof showToast === "function") {
    if (ok) {
      showToast(`📋 Copied ${tbl.title}: ${tbl.rows.length} rows × ${tbl.headers.length} cols (TSV) — Ctrl+V straight into Excel / OriginPro!`, "success");
    } else {
      showToast("Browser blocked clipboard text write.", "warning");
    }
  }
  return ok;
}
window.copyCastepPlotData = copyCastepPlotData;

// Universal Right-Click Context Menu on EVERY CASTEP 2D Plot Canvas (with Individual Sub-Panel Hit-Testing!)
const CASTEP_PLOT_CTX_SPECS = {
  "castep-electronic-canvas": {
    label: "Band & PDOS",
    pngName: "CASTEP_Band_PDOS.png",
    fullDataItem: { label: "📊 Copy Full Band + PDOS Data (TSV)", plotKey: "electronic", subPart: "full" },
    dataItems: [
      { label: "📊 Copy PDOS Data Only (TSV)", plotKey: "electronic", subPart: "pdos" },
      { label: "📈 Copy Band Structure Data Only (TSV)", plotKey: "electronic", subPart: "band" }
    ]
  },
  "castep-optics-canvas": {
    label: "Optical Properties",
    pngName: "CASTEP_Optical_Properties.png",
    fullDataItem: { label: "📊 Copy Full Optical Spectra Data (All Channels, TSV)", plotKey: "optics", subPart: "all" },
    dataItems: []
  },
  "castep-spinmat-canvas": {
    label: "Orbital Spin Matrix",
    pngName: "CASTEP_Orbital_Spin_Matrix.png",
    fullDataItem: { label: "🧲 Copy Full Spin Matrix + All Elements Data (TSV)", plotKey: "spinmat", subPart: "full" },
    dataItems: [
      { label: "📊 Copy Current Matrix Only (TSV)", plotKey: "spinmat", subPart: "auto" }
    ]
  },
  "castep-mulliken-mag-canvas": {
    label: "Mulliken Magnetism",
    pngName: "CASTEP_Mulliken_Magnetism.png",
    fullDataItem: { label: "📊 Copy Atomic Mulliken & Spin Data (TSV)", plotKey: "mulliken", subPart: "atoms" },
    dataItems: []
  },
  "castep-mulliken-bond-canvas": {
    label: "Mulliken Bonds",
    pngName: "CASTEP_Mulliken_Bonds.png",
    fullDataItem: { label: "🔗 Copy Mulliken Bond Populations Data (TSV)", plotKey: "mulliken", subPart: "bonds" },
    dataItems: []
  },
  "castep-chdiff-canvas": {
    label: "Charge Density Difference",
    pngName: "CASTEP_Charge_Density_Difference.png",
    fullDataItem: { label: "📊 Copy 1D Planar Δρ(z) & ΔQ(z) Data (TSV)", plotKey: "chdiff", subPart: "1d" },
    dataItems: [
      { label: "🗺️ Copy 2D Slice Matrix Data (TSV)", plotKey: "chdiff", subPart: "2d" }
    ]
  },
  "castep-energy-chart-canvas": {
    label: "Energy Profile",
    pngName: "CASTEP_Energy_Profile.png",
    fullDataItem: { label: "📊 Copy SCF & Energy Convergence Data (TSV)", plotKey: "convergence", subPart: "scf" },
    dataItems: []
  },
  "castep-conv-chart-canvas": {
    label: "Convergence Diagnostics",
    pngName: "CASTEP_Convergence.png",
    fullDataItem: { label: "📊 Copy SCF & Energy Convergence Data (TSV)", plotKey: "convergence", subPart: "scf" },
    dataItems: []
  }
};

function hideCastepPlotContextMenu() {
  const m = document.getElementById("castep-plot-ctx-menu");
  if (m) m.style.display = "none";
}

function findHitSubPanelOnCanvas(canvas, clientX, clientY) {
  if (!canvas || !Array.isArray(canvas._subPanelRects) || !canvas._subPanelRects.length) return null;
  const br = canvas.getBoundingClientRect();
  if (!br.width || !br.height) return null;
  const cssW = parseFloat(canvas.style.width) || br.width;
  const cssH = parseFloat(canvas.style.height) || br.height;
  const lx = ((clientX - br.left) / br.width) * cssW;
  const ly = ((clientY - br.top) / br.height) * cssH;
  return canvas._subPanelRects.find(r => lx >= r.x && lx <= r.x + r.w && ly >= r.y && ly <= r.y + r.h) || null;
}

function showCastepPlotContextMenu(canvasId, clientX, clientY) {
  const spec = CASTEP_PLOT_CTX_SPECS[canvasId];
  const canvas = document.getElementById(canvasId);
  if (!spec || !canvas) return;
  const hitSub = findHitSubPanelOnCanvas(canvas, clientX, clientY);

  let menu = document.getElementById("castep-plot-ctx-menu");
  if (!menu) {
    menu = document.createElement("div");
    menu.id = "castep-plot-ctx-menu";
    menu.style.cssText = "position:fixed; z-index:99999; background:#ffffff; border:1px solid #cbd5e1; border-radius:9px; box-shadow:0 10px 28px rgba(15,23,42,0.18); padding:5px; min-width:268px; font-family:Inter,sans-serif; font-size:12px; color:#0f172a;";
    document.body.appendChild(menu);
    document.addEventListener("click", hideCastepPlotContextMenu);
    document.addEventListener("keydown", (ev) => { if (ev.key === "Escape") hideCastepPlotContextMenu(); });
    window.addEventListener("scroll", hideCastepPlotContextMenu, true);
  }
  const st = getCastepPlotStyle();
  const dpi = Math.round((st.exportScale || 4) * 100);
  const btnCss = "display:flex; width:100%; text-align:left; align-items:center; gap:7px; padding:6px 10px; border:none; background:transparent; border-radius:6px; cursor:pointer; font-size:12px; color:#0f172a; font-weight:600;";
  const hdrCss = "padding:4px 10px 4px; font-size:10.5px; font-weight:800; color:#64748b; letter-spacing:0.2px;";
  const safeAttr = (s) => escapeHtml(String(s || "")).replace(/'/g, "\\'");

  const itemsHtml = [];

  // Section 1: Individual Sub-Figure actions when right-clicking a multi-panel plot!
  if (hitSub) {
    itemsHtml.push(
      `<div style="${hdrCss} color:#0f766e; border-bottom:1px solid #e2e8f0; margin-bottom:2px;">This Sub-Figure: ${escapeHtml(hitSub.label)} • ${dpi} DPI</div>`,
      `<button type="button" style="${btnCss} color:#0f766e;" onmouseenter="this.style.background='#f0fdfa'" onmouseleave="this.style.background='transparent'" onclick="hideCastepPlotContextMenu(); copyCastepSubPanelHD('${canvasId}', '${safeAttr(hitSub.key)}', '${safeAttr(hitSub.label)}')">📋 Copy This Sub-Plot Image (${dpi} DPI)</button>`,
      `<button type="button" style="${btnCss}" onmouseenter="this.style.background='#f8fafc'" onmouseleave="this.style.background='transparent'" onclick="hideCastepPlotContextMenu(); copyCastepPlotData('${hitSub.plotKey}', '${safeAttr(hitSub.dataSubPart)}')">📊 Copy This Sub-Plot Data (TSV)</button>`,
      `<button type="button" style="${btnCss}" onmouseenter="this.style.background='#f8fafc'" onmouseleave="this.style.background='transparent'" onclick="hideCastepPlotContextMenu(); exportCastepSubPanelPNG('${canvasId}', '${safeAttr(hitSub.key)}', '${safeAttr(hitSub.pngName)}')">💾 Save This Sub-Plot PNG (${dpi} DPI)</button>`,
      `<div style="height:1px; background:#e2e8f0; margin:4px 6px;"></div>`
    );
  }

  // Section 2: Full Figure & Full Data actions
  itemsHtml.push(
    `<div style="${hdrCss} border-bottom:1px solid #f1f5f9; margin-bottom:2px;">Full Figure: ${escapeHtml(spec.label)} • ${dpi} DPI</div>`,
    `<button type="button" style="${btnCss} ${hitSub ? "" : "color:#0f766e;"}" onmouseenter="this.style.background='#f0fdfa'" onmouseleave="this.style.background='transparent'" onclick="hideCastepPlotContextMenu(); copyCastepCanvasHD('${canvasId}', '${safeAttr(spec.label)} (Full)')">📋 Copy Full Image (${dpi} DPI PNG)</button>`
  );
  if (spec.fullDataItem) {
    itemsHtml.push(
      `<button type="button" style="${btnCss}" onmouseenter="this.style.background='#f8fafc'" onmouseleave="this.style.background='transparent'" onclick="hideCastepPlotContextMenu(); copyCastepPlotData('${spec.fullDataItem.plotKey}', '${spec.fullDataItem.subPart}')">${escapeHtml(spec.fullDataItem.label)}</button>`
    );
  }
  if (!hitSub && spec.dataItems?.length) {
    spec.dataItems.forEach(it => {
      itemsHtml.push(
        `<button type="button" style="${btnCss}" onmouseenter="this.style.background='#f8fafc'" onmouseleave="this.style.background='transparent'" onclick="hideCastepPlotContextMenu(); copyCastepPlotData('${it.plotKey}', '${it.subPart}')">${escapeHtml(it.label)}</button>`
      );
    });
  }
  itemsHtml.push(
    `<button type="button" style="${btnCss}" onmouseenter="this.style.background='#f8fafc'" onmouseleave="this.style.background='transparent'" onclick="hideCastepPlotContextMenu(); exportCastepCanvasPNG('${canvasId}', '${safeAttr(spec.pngName)}')">💾 Save Full PNG (${dpi} DPI)</button>`,
    `<div style="height:1px; background:#e2e8f0; margin:4px 6px;"></div>`,
    `<button type="button" style="${btnCss}" onmouseenter="this.style.background='#f8fafc'" onmouseleave="this.style.background='transparent'" onclick="hideCastepPlotContextMenu(); toggleCastepPlotStyleBar(true)">🎨 Plot Format &amp; DPI Quality...</button>`
  );

  menu.innerHTML = itemsHtml.join("");
  menu.style.display = "block";
  const mw = menu.offsetWidth || 280;
  const mh = menu.offsetHeight || 240;
  const left = Math.min(window.innerWidth - mw - 10, Math.max(8, clientX));
  const top = Math.min(window.innerHeight - mh - 10, Math.max(8, clientY));
  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;
}
window.showCastepPlotContextMenu = showCastepPlotContextMenu;
window.hideCastepPlotContextMenu = hideCastepPlotContextMenu;

function initCastepPlotContextMenus() {
  Object.keys(CASTEP_PLOT_CTX_SPECS).forEach(cid => {
    const el = document.getElementById(cid);
    if (!el || el._plotCtxBound) return;
    el._plotCtxBound = true;
    if (!el.title) el.title = "Right-click any plot or sub-panel to Copy HD Image (400–600 DPI) or Copy Numerical Data (TSV)";
    el.addEventListener("contextmenu", (ev) => {
      ev.preventDefault();
      showCastepPlotContextMenu(cid, ev.clientX, ev.clientY);
    });
  });
}
window.initCastepPlotContextMenus = initCastepPlotContextMenus;
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => setTimeout(initCastepPlotContextMenus, 400));
} else {
  setTimeout(initCastepPlotContextMenus, 400);
}

// ============================================================================
// 8B. Universal Publication Data Exporter (Wide-Format CSV + Native Multi-Tab .xlsx)
// ============================================================================

const _XLSX_CRC32_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[i] = c >>> 0;
  }
  return t;
})();

function _crc32Bytes(u8) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < u8.length; i++) c = _XLSX_CRC32_TABLE[(c ^ u8[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function _xmlEscape(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function _xlsxColLetter(idx0) {
  let n = idx0 + 1, out = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    out = String.fromCharCode(65 + rem) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}

function _sanitizeSheetName(raw, usedSet) {
  let base = String(raw || "Sheet").replace(/[:\\/?*\[\]]/g, "_").trim() || "Sheet";
  if (base.length > 31) base = base.slice(0, 31);
  let name = base, n = 2;
  while (usedSet.has(name.toLowerCase())) {
    const suf = `_${n++}`;
    name = base.slice(0, 31 - suf.length) + suf;
  }
  usedSet.add(name.toLowerCase());
  return name;
}

function _buildXlsxSheetXml(headers, rows) {
  const parts = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>'
  ];
  let rowNum = 1;
  if (headers && headers.length) {
    let r = `<row r="${rowNum}">`;
    for (let c = 0; c < headers.length; c++) {
      const ref = `${_xlsxColLetter(c)}${rowNum}`;
      r += `<c r="${ref}" s="1" t="inlineStr"><is><t>${_xmlEscape(headers[c])}</t></is></c>`;
    }
    r += "</row>";
    parts.push(r);
    rowNum++;
  }
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    let r = `<row r="${rowNum}">`;
    for (let c = 0; c < row.length; c++) {
      const val = row[c];
      if (val === null || val === undefined || val === "") continue;
      const ref = `${_xlsxColLetter(c)}${rowNum}`;
      if (typeof val === "number" && Number.isFinite(val)) {
        r += `<c r="${ref}" t="n"><v>${val}</v></c>`;
      } else {
        r += `<c r="${ref}" t="inlineStr"><is><t>${_xmlEscape(val)}</t></is></c>`;
      }
    }
    r += "</row>";
    parts.push(r);
    rowNum++;
  }
  parts.push("</sheetData></worksheet>");
  return parts.join("");
}

function buildXlsxBlob(sheets) {
  const enc = new TextEncoder();
  const usedNames = new Set();
  const normSheets = (sheets || [])
    .filter(s => s && ((s.headers && s.headers.length) || (s.rows && s.rows.length)))
    .map(s => ({
      name: _sanitizeSheetName(s.name, usedNames),
      headers: s.headers || [],
      rows: s.rows || []
    }));

  if (!normSheets.length) return null;

  const files = [];
  const addFile = (path, contentStr) => files.push({ name: path, data: enc.encode(contentStr) });

  // 1) [Content_Types].xml
  const overrides = normSheets.map((_, i) =>
    `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
  ).join("");
  addFile("[Content_Types].xml",
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
    '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
    overrides +
    '</Types>'
  );

  // 2) _rels/.rels
  addFile("_rels/.rels",
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
    '</Relationships>'
  );

  // 3) xl/workbook.xml & xl/_rels/workbook.xml.rels
  const wbSheetsXml = normSheets.map((s, i) =>
    `<sheet name="${_xmlEscape(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`
  ).join("");
  addFile("xl/workbook.xml",
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
    `<sheets>${wbSheetsXml}</sheets></workbook>`
  );

  const wbRelsXml = normSheets.map((_, i) =>
    `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`
  ).join("") +
    `<Relationship Id="rId${normSheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>`;
  addFile("xl/_rels/workbook.xml.rels",
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${wbRelsXml}</Relationships>`
  );

  // 4) xl/styles.xml (s="0" normal, s="1" bold header)
  addFile("xl/styles.xml",
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>' +
    '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>' +
    '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
    '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
    '<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs>' +
    '</styleSheet>'
  );

  // 5) Individual worksheet XMLs
  normSheets.forEach((s, i) => {
    addFile(`xl/worksheets/sheet${i + 1}.xml`, _buildXlsxSheetXml(s.headers, s.rows));
  });

  // Pack ZIP archive (STORE method 0, exact CRC32 & central directory)
  const localChunks = [];
  const centralChunks = [];
  let offset = 0;

  for (const f of files) {
    const nameBytes = enc.encode(f.name);
    const data = f.data;
    const crc = _crc32Bytes(data);

    const lh = new ArrayBuffer(30);
    const lhv = new DataView(lh);
    lhv.setUint32(0, 0x04034b50, true);
    lhv.setUint16(4, 20, true);
    lhv.setUint16(6, 0x0800, true);
    lhv.setUint16(8, 0, true);
    lhv.setUint16(10, 0, true);
    lhv.setUint16(12, 0, true);
    lhv.setUint32(14, crc, true);
    lhv.setUint32(18, data.length, true);
    lhv.setUint32(22, data.length, true);
    lhv.setUint16(26, nameBytes.length, true);
    lhv.setUint16(28, 0, true);
    localChunks.push(new Uint8Array(lh), nameBytes, data);

    const ch = new ArrayBuffer(46);
    const chv = new DataView(ch);
    chv.setUint32(0, 0x02014b50, true);
    chv.setUint16(4, 20, true);
    chv.setUint16(6, 20, true);
    chv.setUint16(8, 0x0800, true);
    chv.setUint16(10, 0, true);
    chv.setUint16(12, 0, true);
    chv.setUint16(14, 0, true);
    chv.setUint32(16, crc, true);
    chv.setUint32(20, data.length, true);
    chv.setUint32(24, data.length, true);
    chv.setUint16(28, nameBytes.length, true);
    chv.setUint16(30, 0, true);
    chv.setUint16(32, 0, true);
    chv.setUint16(34, 0, true);
    chv.setUint16(36, 0, true);
    chv.setUint32(38, 0, true);
    chv.setUint32(42, offset, true);
    centralChunks.push(new Uint8Array(ch), nameBytes);

    offset += 30 + nameBytes.length + data.length;
  }

  let cdSize = 0;
  centralChunks.forEach(c => { cdSize += c.length; });

  const eocd = new ArrayBuffer(22);
  const ev = new DataView(eocd);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, cdSize, true);
  ev.setUint32(16, offset, true);
  ev.setUint16(20, 0, true);

  return new Blob([...localChunks, ...centralChunks, new Uint8Array(eocd)], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
}
window.buildXlsxBlob = buildXlsxBlob;

function buildCsvString(headers, rows) {
  const esc = (v) => {
    if (v === null || v === undefined) return "";
    if (typeof v === "number") return Number.isFinite(v) ? String(v) : "";
    const s = String(v);
    return (s.includes(",") || s.includes('"') || s.includes("\n")) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [];
  if (headers && headers.length) lines.push(headers.map(esc).join(","));
  for (let i = 0; i < rows.length; i++) {
    lines.push(rows[i].map(esc).join(","));
  }
  return lines.join("\n") + "\n";
}

function triggerBlobDownload(blob, filename) {
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 250);
}

function sanitizeExportSeed(raw) {
  return String(raw || "CASTEP").replace(/[^A-Za-z0-9._\-+]/g, "_").replace(/_+/g, "_");
}

function buildElectronicExportTables() {
  const job = (CASTEP_STUDIO_STATE.jobs || []).find(j => j.id === CASTEP_STUDIO_STATE.activeJobId) || {};
  if (!CASTEP_STUDIO_STATE.lastElectronicExport || CASTEP_STUDIO_STATE.lastElectronicExport.jobId !== job.id) {
    renderCastepElectronicPlots();
  }
  const ex = CASTEP_STUDIO_STATE.lastElectronicExport;
  if (!ex) return null;

  const seed = sanitizeExportSeed(ex.seed || job.seed || "CASTEP");

  // 1) Build FULL PDOS table matching EXACTLY the active PDOS Mode / Filter / Orbitals / Spin settings (zero column cap!)
  let pdosCurvesFull = ex.pdosCurves || [];
  let isSpinDos = !!ex.isSpinDos;
  if (job.pdos_bin_data && Array.isArray(job.pdos_bin_data.channels) && job.pdos_bin_data.channels.length) {
    const rebuilt = buildPdosCurvesFromBin(
      job.pdos_bin_data, ex.eGrid, ex.sigma, ex.pdosMode, ex.pdosTarget,
      { showTot: ex.showTot, showS: ex.showS, showP: ex.showP, showD: ex.showD, showF: ex.showF, exportAll: true },
      ex.dosRawShift || 0.0
    );
    pdosCurvesFull = rebuilt.curves;
    isSpinDos = rebuilt.isSpin;
  }

  const useMirror = isSpinDos && ex.spinLayout === "mirror";
  const pdosHeaders = ["Energy_E_minus_EF_eV"];
  const pdosColSpecs = [];

  pdosCurvesFull.forEach(c => {
    const cleanLbl = String(c.label || "Curve").replace(/\s+/g, "_");
    if (isSpinDos && c.dn) {
      if (useMirror) {
        if (ex.showUp) { pdosHeaders.push(`${cleanLbl}_SpinUp`); pdosColSpecs.push({ curve: c, kind: "up" }); }
        if (ex.showDn) { pdosHeaders.push(`${cleanLbl}_SpinDown_MirrorNeg`); pdosColSpecs.push({ curve: c, kind: "dn_neg" }); }
        if (ex.showDn) { pdosHeaders.push(`${cleanLbl}_SpinDown_Pos`); pdosColSpecs.push({ curve: c, kind: "dn_pos" }); }
      } else {
        pdosHeaders.push(`${cleanLbl}_Total_SpinSum`); pdosColSpecs.push({ curve: c, kind: "sum" });
        if (ex.showUp) { pdosHeaders.push(`${cleanLbl}_SpinUp`); pdosColSpecs.push({ curve: c, kind: "up" }); }
        if (ex.showDn) { pdosHeaders.push(`${cleanLbl}_SpinDown`); pdosColSpecs.push({ curve: c, kind: "dn_pos" }); }
      }
    } else {
      pdosHeaders.push(cleanLbl);
      pdosColSpecs.push({ curve: c, kind: "up" });
    }
  });

  const pdosRows = [];
  if (pdosColSpecs.length && ex.eGrid && ex.eGrid.length) {
    for (let i = 0; i < ex.eGrid.length; i++) {
      const row = [Number(ex.eGrid[i].toFixed(6))];
      for (const spec of pdosColSpecs) {
        const upV = spec.curve.up ? (spec.curve.up[i] || 0) : 0;
        const dnV = spec.curve.dn ? (spec.curve.dn[i] || 0) : 0;
        let val = upV;
        if (spec.kind === "dn_neg") val = -dnV;
        else if (spec.kind === "dn_pos") val = dnV;
        else if (spec.kind === "sum") val = (ex.showUp ? upV : 0) + (ex.showDn ? dnV : 0);
        row.push(Number(val.toFixed(6)));
      }
      pdosRows.push(row);
    }
  }

  // 2) Build WIDE Origin-ready Band Structure tables (one row per k-point, one column per Band!)
  const bandSheets = [];
  const tickLookup = (xNorm) => {
    for (const t of (ex.bandTicks || [])) {
      if (Math.abs(t.pos - xNorm) < 0.008) return t.label === "G" ? "Gamma" : t.label;
    }
    return "";
  };

  (ex.bandSeries || []).forEach((ser, sIdx) => {
    const isBeta = sIdx === 1 || /beta|dn|down/i.test(ser.name || "");
    if (!isBeta && !ex.showUp) return;
    if (isBeta && !ex.showDn) return;
    const segs = (ser.segments || []).filter(seg => seg && seg.length);
    if (!segs.length) return;

    // Reference k-path x-coordinates from longest band segment
    let refSeg = segs[0];
    segs.forEach(sg => { if (sg.length > refSeg.length) refSeg = sg; });
    const nk = refSeg.length;
    const spinTag = ex.bandSeries.length >= 2 ? (isBeta ? "SpinDown" : "SpinUp") : "Band";

    const bHeaders = ["k_Index", "k_Path_Norm", "HighSym_Point"];
    for (let b = 0; b < segs.length; b++) bHeaders.push(`${spinTag}_Band_${b + 1}_eV`);

    const bRows = [];
    for (let k = 0; k < nk; k++) {
      const kx = Number(refSeg[k][0]);
      const row = [k + 1, Number(kx.toFixed(6)), tickLookup(kx)];
      for (let b = 0; b < segs.length; b++) {
        const sg = segs[b];
        let yVal = null;
        if (sg.length === nk) {
          yVal = sg[k][1];
        } else {
          // Nearest x match if segment has different sampling
          let bestD = 1e9, bestY = null;
          for (let j = 0; j < sg.length; j++) {
            const d = Math.abs(sg[j][0] - kx);
            if (d < bestD) { bestD = d; bestY = sg[j][1]; }
          }
          if (bestD < 0.02) yVal = bestY;
        }
        row.push(yVal !== null && Number.isFinite(yVal) ? Number(yVal.toFixed(6)) : "");
      }
      bRows.push(row);
    }

    bandSheets.push({
      name: ex.bandSeries.length >= 2 ? (isBeta ? "Band_Spin_Down" : "Band_Spin_Up") : "Band_Structure",
      spinTag,
      headers: bHeaders,
      rows: bRows
    });
  });

  // 3) Build High-Symmetry k-Points & Electronic Metadata sheet
  const metaHeaders = ["Property", "Value"];
  const metaRows = [
    ["Material", ex.material],
    ["Seed", ex.seed],
    ["PDOS_Mode", ex.pdosMode],
    ["PDOS_Target_Filter", ex.pdosTarget],
    ["PDOS_Spin_Layout", ex.spinLayout],
    ["PDOS_Source", ex.pdosSourceLabel || "N/A"],
    ["Energy_Window_eV", `${ex.emin} to ${ex.emax}`],
    ["Gaussian_Smearing_Sigma_eV", ex.sigma],
    ["Band_Gap_Summary", ex.gapSummary || "N/A"],
    ["Zero_Energy_Reference", ex.alignLabel || "VBM / E_F = 0.000 eV"],
    ["PDOS_Alignment_Shift_eV", Number((ex.dosRawShift || 0).toFixed(6))],
    ["PDOS_Columns_Exported", Math.max(0, pdosHeaders.length - 1)],
    ["Band_Sheets_Exported", bandSheets.length],
    ["", ""],
    ["HighSym_k_Label", "Normalized_k_Position"]
  ];
  (ex.bandTicks || []).forEach(t => {
    metaRows.push([t.label === "G" ? "Gamma" : t.label, Number(t.pos.toFixed(6))]);
  });

  return {
    seed,
    modeTag: sanitizeExportSeed(ex.pdosMode || "pdos"),
    pdosSheet: { name: `PDOS_${ex.pdosMode || "All"}`, headers: pdosHeaders, rows: pdosRows },
    bandSheets,
    metaSheet: { name: "Summary_KPoints", headers: metaHeaders, rows: metaRows }
  };
}
window.buildElectronicExportTables = buildElectronicExportTables;

function exportCastepElectronicCSV(part = "pdos") {
  const pkg = buildElectronicExportTables();
  if (!pkg) {
    if (typeof showToast === "function") showToast("No Band Structure or PDOS data available to export.", "warning");
    return;
  }

  if (part === "band") {
    if (!pkg.bandSheets.length) {
      if (typeof showToast === "function") showToast("No Band Structure data found in this calculation.", "warning");
      return;
    }
    // Combine SpinUp + SpinDown band columns cleanly onto shared k_Path_Norm if both exist
    let headers = [...pkg.bandSheets[0].headers];
    let rows = pkg.bandSheets[0].rows.map(r => [...r]);
    if (pkg.bandSheets.length >= 2 && pkg.bandSheets[1].rows.length === rows.length) {
      headers = headers.concat(pkg.bandSheets[1].headers.slice(3));
      for (let i = 0; i < rows.length; i++) {
        rows[i] = rows[i].concat(pkg.bandSheets[1].rows[i].slice(3));
      }
    }
    const csv = buildCsvString(headers, rows);
    const fname = `${pkg.seed}_Band_Structure.csv`;
    triggerBlobDownload(new Blob([csv], { type: "text/csv;charset=utf-8" }), fname);
    if (typeof showToast === "function") {
      showToast(`Exported ${fname} (${rows.length} k-points × ${headers.length - 3} bands)!`, "success");
    }
    return;
  }

  // Default: Full PDOS CSV matching ALL currently displayed Element / Orbital / Atom / Spin curves!
  if (!pkg.pdosSheet.rows.length) {
    if (pkg.bandSheets.length) {
      exportCastepElectronicCSV("band");
      return;
    }
    if (typeof showToast === "function") showToast("No PDOS curves available to export.", "warning");
    return;
  }
  const csv = buildCsvString(pkg.pdosSheet.headers, pkg.pdosSheet.rows);
  const fname = `${pkg.seed}_PDOS_${pkg.modeTag}.csv`;
  triggerBlobDownload(new Blob([csv], { type: "text/csv;charset=utf-8" }), fname);
  if (typeof showToast === "function") {
    showToast(`Exported ${fname} (${pkg.pdosSheet.headers.length} columns: ${pkg.pdosSheet.headers.slice(0, 6).join(", ")}${pkg.pdosSheet.headers.length > 6 ? "..." : ""})!`, "success");
  }
}
window.exportCastepElectronicCSV = exportCastepElectronicCSV;

function exportCastepElectronicXLSX() {
  const pkg = buildElectronicExportTables();
  if (!pkg) {
    if (typeof showToast === "function") showToast("No Band Structure or PDOS data available to export.", "warning");
    return;
  }
  const sheets = [];
  if (pkg.pdosSheet.rows.length) sheets.push(pkg.pdosSheet);
  pkg.bandSheets.forEach(bs => sheets.push(bs));
  sheets.push(pkg.metaSheet);

  const blob = buildXlsxBlob(sheets);
  if (!blob) {
    if (typeof showToast === "function") showToast("Nothing to export to Excel workbook.", "warning");
    return;
  }
  const fname = `${pkg.seed}_Band_and_PDOS_${pkg.modeTag}.xlsx`;
  triggerBlobDownload(blob, fname);
  if (typeof showToast === "function") {
    showToast(`Exported multi-tab workbook ${fname} (${sheets.map(s => s.name).join(" | ")})!`, "success");
  }
}
window.exportCastepElectronicXLSX = exportCastepElectronicXLSX;

function buildConvergenceExportTables() {
  const job = (CASTEP_STUDIO_STATE.jobs || []).find(j => j.id === CASTEP_STUDIO_STATE.activeJobId) || {};
  const pl = CASTEP_STUDIO_STATE.parsedLog || {};
  const seed = sanitizeExportSeed(job.seed || CASTEP_STUDIO_STATE.structure?.formula || "CASTEP");

  const scfHeaders = ["Step", "Label", "Total_Energy_eV", "Fermi_Energy_eV", "dE_per_Atom_eV", "log10_abs_dE", "Time_sec"];
  const scfRows = [];
  if (pl.scfCycles && pl.scfCycles.length) {
    pl.scfCycles.forEach(c => {
      const de = (c.dEPerAtom !== null && c.dEPerAtom !== undefined && Number.isFinite(Number(c.dEPerAtom))) ? Number(c.dEPerAtom) : "";
      const logDe = (de !== "" && Math.abs(de) > 0) ? Number(Math.log10(Math.abs(de)).toFixed(6)) : "";
      scfRows.push([
        Number(c.step || 0),
        String(c.label || ""),
        Number(Number(c.energy || 0).toFixed(6)),
        Number(Number(c.fermi || 0).toFixed(5)),
        de,
        logDe,
        Number(Number(c.timeSec || 0).toFixed(2))
      ]);
    });
  } else if (job.ener_xcd?.series?.[0]?.segments?.[0]?.length) {
    const convPts = job.conv_xcd?.series?.[0]?.segments?.[0] || [];
    job.ener_xcd.series[0].segments[0].forEach((pt, idx) => {
      scfRows.push([idx + 1, `Step_${idx + 1}`, Number(pt[1].toFixed(6)), "", "", convPts[idx] ? Number(convPts[idx][1].toFixed(6)) : "", ""]);
    });
  }

  const geomHeaders = ["Frame", "Total_Energy_eV", "Max_Force_eV_A", "Volume_A3"];
  const geomRows = (CASTEP_STUDIO_STATE.geomFrames || []).map(f => [
    Number(f.step || 0),
    Number((f.energyEv || 0).toFixed(6)),
    Number((f.maxForceEvA || 0).toFixed(6)),
    Number((f.volumeA3 || 0).toFixed(4))
  ]);

  const fcHeaders = ["Atom", "Element", "Fx_eV_A", "Fy_eV_A", "Fz_eV_A", "F_mag_eV_A", "Charge_e", "Spin_muB"];
  const fcRows = (CASTEP_STUDIO_STATE.structure?.atoms || []).map((at, idx) => {
    const fx = Number(at.fx || 0), fy = Number(at.fy || 0), fz = Number(at.fz || 0);
    return [
      at.label || `${at.element}${idx + 1}`,
      castepCleanElement(at.element),
      Number(fx.toFixed(6)),
      Number(fy.toFixed(6)),
      Number(fz.toFixed(6)),
      Number(Math.hypot(fx, fy, fz).toFixed(6)),
      (at.charge !== null && at.charge !== undefined) ? Number(Number(at.charge).toFixed(4)) : "",
      (at.spin !== null && at.spin !== undefined) ? Number(Number(at.spin).toFixed(4)) : 0
    ];
  });

  return {
    seed,
    scfSheet: { name: "SCF_Convergence", headers: scfHeaders, rows: scfRows },
    geomSheet: { name: "GeomOpt_Trajectory", headers: geomHeaders, rows: geomRows },
    forcesSheet: { name: "Forces_and_Charges", headers: fcHeaders, rows: fcRows }
  };
}

function exportCastepConvergenceCSV() {
  const pkg = buildConvergenceExportTables();
  const target = pkg.scfSheet.rows.length ? pkg.scfSheet : (pkg.geomSheet.rows.length ? pkg.geomSheet : pkg.forcesSheet);
  if (!target.rows.length) {
    if (typeof showToast === "function") showToast("No SCF or Geometry Convergence data available to export.", "warning");
    return;
  }
  const csv = buildCsvString(target.headers, target.rows);
  const fname = `${pkg.seed}_${target.name}.csv`;
  triggerBlobDownload(new Blob([csv], { type: "text/csv;charset=utf-8" }), fname);
  if (typeof showToast === "function") showToast(`Exported ${fname} (${target.rows.length} rows)!`, "success");
}
window.exportCastepConvergenceCSV = exportCastepConvergenceCSV;

function exportCastepConvergenceXLSX() {
  const pkg = buildConvergenceExportTables();
  const sheets = [pkg.scfSheet, pkg.geomSheet, pkg.forcesSheet].filter(s => s.rows.length > 0);
  if (!sheets.length) {
    if (typeof showToast === "function") showToast("No Convergence or Force data available to export.", "warning");
    return;
  }
  const blob = buildXlsxBlob(sheets);
  const fname = `${pkg.seed}_Convergence_and_Forces.xlsx`;
  triggerBlobDownload(blob, fname);
  if (typeof showToast === "function") {
    showToast(`Exported multi-tab workbook ${fname} (${sheets.map(s => s.name).join(" | ")})!`, "success");
  }
}
window.exportCastepConvergenceXLSX = exportCastepConvergenceXLSX;

// ============================================================================
// 9. Materials Studio Remote Gateway Manager (Live HTTP + Local dsd / Mounted)
// ============================================================================

const DEFAULT_MS_GATEWAY_URL = "http://115.145.191.231:18888";
const MS_GW_PRESET_URLS = [
  "http://115.145.191.231:18888",
  "http://localhost:18888"
];

function normalizeMsGatewayUrlClient(raw) {
  let s = String(raw || "").trim().replace(/\/+$/, "");
  if (!s) return DEFAULT_MS_GATEWAY_URL;
  // Strip accidental trailing /dsd/... path if pasted from browser
  const mPath = s.match(/^(https?:\/\/[^\/]+)\/.*$/i);
  if (mPath) s = mPath[1];
  // Convert Materials Studio gateway name shorthand: 115.145.191.231_18888 -> http://115.145.191.231:18888
  const mUnder = s.match(/^(https?:\/\/)?([A-Za-z0-9.\-]+)_(\d{2,5})$/i);
  if (mUnder) {
    s = `${mUnder[1] || "http://"}${mUnder[2]}:${mUnder[3]}`;
  } else if (!/^https?:\/\//i.test(s)) {
    s = "http://" + s;
  }
  return s.replace(/\/+$/, "");
}

function syncMsGatewayUrlControls(url) {
  const norm = normalizeMsGatewayUrlClient(url || DEFAULT_MS_GATEWAY_URL);
  const urlInp = document.getElementById("ms-gw-url-input");
  if (urlInp) urlInp.value = norm;
  const presetSel = document.getElementById("ms-gw-preset-select");
  if (presetSel) {
    const matched = MS_GW_PRESET_URLS.find(p => p.toLowerCase() === norm.toLowerCase());
    presetSel.value = matched || "custom";
  }
}

function onMsGatewayPresetChange(val) {
  const urlInp = document.getElementById("ms-gw-url-input");
  if (val === "custom") {
    if (urlInp) {
      urlInp.focus();
      urlInp.select();
    }
    return;
  }
  const norm = normalizeMsGatewayUrlClient(val);
  CASTEP_STUDIO_STATE.gatewayUrl = norm;
  syncMsGatewayUrlControls(norm);
  try { localStorage.setItem("ms_gateway_url", norm); } catch (e) {}
  CASTEP_STUDIO_STATE.gatewayExpandedServer = "";
  refreshMsGatewayJobsFromServer();
}
window.onMsGatewayPresetChange = onMsGatewayPresetChange;

function applyGatewayApiPayload(data, mergeArchivedOnly = false) {
  if (!data || typeof data !== "object") return;
  CASTEP_STUDIO_STATE.gatewayConnected = !!data.connected;
  CASTEP_STUDIO_STATE.gatewayLiveHttp = !!data.live_http_reachable;
  CASTEP_STUDIO_STATE.gatewayIsLocal = !!data.is_local_gateway;
  CASTEP_STUDIO_STATE.gatewaySource = data.source || (data.connected ? "local_disk" : "none");
  if (data.gateway_url) {
    const norm = normalizeMsGatewayUrlClient(data.gateway_url);
    CASTEP_STUDIO_STATE.gatewayUrl = norm;
    syncMsGatewayUrlControls(norm);
  }
  CASTEP_STUDIO_STATE.gatewayHost = data.gateway_host || "";
  CASTEP_STUDIO_STATE.gatewayIp = data.gateway_ip || "";
  CASTEP_STUDIO_STATE.gatewayRoot = data.gateway_root || "";
  CASTEP_STUDIO_STATE.gatewayPageGenerated = data.page_generated || "";
  CASTEP_STUDIO_STATE.gatewayArchivedTotal = Number(data.archived_total || 0);
  if (!mergeArchivedOnly) {
    CASTEP_STUDIO_STATE.gatewayJobs = Array.isArray(data.jobs) ? data.jobs : [];
    CASTEP_STUDIO_STATE.gatewayServers = Array.isArray(data.installed_servers) ? data.installed_servers : [];
    CASTEP_STUDIO_STATE.gatewayData = Array.isArray(data.gateway_data) ? data.gateway_data : [];
    CASTEP_STUDIO_STATE.gatewayExpandedServer = "";
    if (Array.isArray(data.local_processes)) {
      CASTEP_STUDIO_STATE.localProcesses = data.local_processes;
    }
  }
  if (Array.isArray(data.archived_jobs) && data.archived_jobs.length > 0) {
    CASTEP_STUDIO_STATE.gatewayArchivedJobs = data.archived_jobs;
    CASTEP_STUDIO_STATE.gatewayArchivedLoaded = true;
  } else if (!mergeArchivedOnly) {
    CASTEP_STUDIO_STATE.gatewayArchivedJobs = [];
    CASTEP_STUDIO_STATE.gatewayArchivedLoaded = false;
  }
  renderMsGatewayTable();
}

function switchMsGatewaySubView(viewKey, linkEl) {
  CASTEP_STUDIO_STATE.gatewaySubView = viewKey || "jobs";
  document.querySelectorAll(".ms-gw-nav-link").forEach(a => a.classList.remove("active"));
  if (linkEl) {
    linkEl.classList.add("active");
  } else {
    const match = document.querySelector(`.ms-gw-nav-link[data-gwview="${CASTEP_STUDIO_STATE.gatewaySubView}"]`);
    if (match) match.classList.add("active");
  }
  ["jobs", "servers", "data"].forEach(k => {
    const el = document.getElementById(`ms-gw-subview-${k}`);
    if (el) el.style.display = (k === CASTEP_STUDIO_STATE.gatewaySubView) ? "block" : "none";
  });
  if (CASTEP_STUDIO_STATE.gatewaySubView === "servers") renderMsGatewayServers();
  else if (CASTEP_STUDIO_STATE.gatewaySubView === "data") renderMsGatewayData();
  else renderMsGatewayTable();
}
window.switchMsGatewaySubView = switchMsGatewaySubView;

async function filterMsGatewayJobs(filterKey, btnEl) {
  CASTEP_STUDIO_STATE.gatewayFilter = filterKey || "all";
  document.querySelectorAll(".ms-gw-pill").forEach(b => b.classList.remove("active"));
  if (btnEl) btnEl.classList.add("active");
  if (CASTEP_STUDIO_STATE.gatewaySubView !== "jobs") {
    switchMsGatewaySubView("jobs");
  }
  // Lazy-fetch archived jobs from backend only when the user explicitly clicks Archived
  if (
    filterKey === "archived" &&
    CASTEP_STUDIO_STATE.gatewayConnected &&
    !CASTEP_STUDIO_STATE.gatewayArchivedLoaded &&
    CASTEP_STUDIO_STATE.gatewayArchivedTotal > 0 &&
    CASTEP_STUDIO_STATE.gatewaySource !== "mounted"
  ) {
    const apiBase = getCastepApiBase() || (["localhost", "127.0.0.1", "::1"].includes(window.location.hostname) ? "" : "http://127.0.0.1:8877");
    const gwUrl = normalizeMsGatewayUrlClient(document.getElementById("ms-gw-url-input")?.value || CASTEP_STUDIO_STATE.gatewayUrl || DEFAULT_MS_GATEWAY_URL);
    try {
      const resp = await fetch(`${apiBase}/api/castep/gateway?gateway_url=${encodeURIComponent(gwUrl)}&include_archived=true&limit=500`);
      if (resp.ok) {
        const data = await resp.json();
        applyGatewayApiPayload(data, true);
      }
    } catch (e) {}
  }
  renderMsGatewayTable();
}
window.filterMsGatewayJobs = filterMsGatewayJobs;

function sortMsGatewayJobs(key) {
  if (CASTEP_STUDIO_STATE.gatewaySortKey === key) {
    CASTEP_STUDIO_STATE.gatewaySortAsc = !CASTEP_STUDIO_STATE.gatewaySortAsc;
  } else {
    CASTEP_STUDIO_STATE.gatewaySortKey = key;
    CASTEP_STUDIO_STATE.gatewaySortAsc = (key !== "create_ts");
  }
  renderMsGatewayTable();
}
window.sortMsGatewayJobs = sortMsGatewayJobs;

function renderMsGatewayServers() {
  const srvBody = document.getElementById("ms-gateway-servers-tbody");
  const srvSummary = document.getElementById("ms-gw-servers-summary");
  const detailBox = document.getElementById("ms-gw-server-detail-box");
  if (!srvBody) return;

  const servers = CASTEP_STUDIO_STATE.gatewayServers || [];
  if (!CASTEP_STUDIO_STATE.gatewayConnected || servers.length === 0) {
    if (srvSummary) srvSummary.textContent = "";
    if (detailBox) detailBox.style.display = "none";
    srvBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:18px; color:#64748b;">No Materials Studio Installed Servers loaded. Run the local FastAPI bridge on your Materials Studio workstation and click <strong>🔄 Refresh Gateway</strong>, or click <strong>📂 Mount Gateway Folder</strong> (select <code>dsd</code> or <code>Gateway-x64</code> containing <code>servers-info/*.sbs</code>).</td></tr>`;
    return;
  }

  const q = (document.getElementById("ms-gw-server-search")?.value || "").trim().toLowerCase();
  const vis = q
    ? servers.filter(s => `${s.name} ${s.category} ${s.description}`.toLowerCase().includes(q))
    : servers;

  if (srvSummary) {
    const cats = new Set(servers.map(s => s.category || "Other")).size;
    srvSummary.textContent = `Showing ${vis.length} of ${servers.length} installed server modules across ${cats} categories — click any Server Name to inspect its .sbs configuration`;
  }

  if (!vis.length) {
    srvBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:16px; color:#64748b;">No installed server matches "${escapeHtml(q)}".</td></tr>`;
    return;
  }

  srvBody.innerHTML = vis.map(s => {
    const isExp = CASTEP_STUDIO_STATE.gatewayExpandedServer === s.name;
    return `
      <tr${isExp ? ' style="outline:2px solid #0284c7;"' : ""}>
        <td><a href="javascript:void(0)" class="ms-gw-jobid-link" onclick="toggleMsGatewayServerDetail('${escapeHtml(s.name)}')">${escapeHtml(s.name)}</a></td>
        <td style="text-align:center;">${escapeHtml(s.category || "Other")}</td>
        <td>${escapeHtml(s.description || `${s.name} Server Application`)}</td>
        <td style="text-align:center;">${escapeHtml(s.version || "Installed")}</td>
        <td style="text-align:center; white-space:nowrap;">${escapeHtml(s.build_date || "-")}</td>
        <td style="text-align:center;"><span style="color:#15803d; font-weight:700;">● Installed</span></td>
      </tr>
    `;
  }).join("");

  // Render detail drawer for clicked server
  if (detailBox) {
    const sel = servers.find(s => s.name === CASTEP_STUDIO_STATE.gatewayExpandedServer);
    if (sel) {
      const isLoading = CASTEP_STUDIO_STATE.gatewayServerDetailLoading === sel.name;
      const rows = (sel.details && sel.details.length)
        ? sel.details
        : [
            { key: "Category", value: sel.category || "-" },
            { key: "Description", value: sel.description || "-" },
            { key: "Version", value: sel.version || "-" },
            { key: "Builddate", value: sel.build_date || "-" },
            { key: "server-executable", value: sel.executable || (isLoading ? "Loading live .sbs from Remote Gateway..." : "-") }
          ];
      detailBox.style.display = "block";
      detailBox.innerHTML = `
        <div class="ms-gw-server-detail-head">
          <span>Server ${escapeHtml(sel.name)} — ${escapeHtml(sel.description || "")}${isLoading ? ' <em style="font-weight:400; color:#64748b;">(Loading live .sbs...)</em>' : ""}</span>
          <button type="button" class="btn btn-outline btn-sm" style="padding:2px 8px; font-size:11px;" onclick="toggleMsGatewayServerDetail('')">Close</button>
        </div>
        <table class="ms-gateway-table">
          <thead><tr><th style="width:220px;">Parameter</th><th>Server ${escapeHtml(sel.name)} Configuration</th></tr></thead>
          <tbody>
            ${rows.map(r => `<tr><td><strong>${escapeHtml(r.key)}</strong></td><td style="word-break:break-all;">${escapeHtml(r.value)}</td></tr>`).join("")}
          </tbody>
        </table>
      `;
    } else {
      detailBox.style.display = "none";
    }
  }
}
window.renderMsGatewayServers = renderMsGatewayServers;

async function toggleMsGatewayServerDetail(serverName) {
  const nextName = CASTEP_STUDIO_STATE.gatewayExpandedServer === serverName ? "" : (serverName || "");
  CASTEP_STUDIO_STATE.gatewayExpandedServer = nextName;
  renderMsGatewayServers();
  if (!nextName) return;

  const sel = (CASTEP_STUDIO_STATE.gatewayServers || []).find(s => s.name === nextName);
  if (
    sel &&
    (!sel.details || sel.details.length === 0) &&
    CASTEP_STUDIO_STATE.gatewayConnected &&
    CASTEP_STUDIO_STATE.gatewayLiveHttp &&
    CASTEP_STUDIO_STATE.gatewaySource !== "mounted"
  ) {
    CASTEP_STUDIO_STATE.gatewayServerDetailLoading = nextName;
    renderMsGatewayServers();
    const apiBase = getCastepApiBase() || (["localhost", "127.0.0.1", "::1"].includes(window.location.hostname) ? "" : "http://127.0.0.1:8877");
    const gwUrl = normalizeMsGatewayUrlClient(CASTEP_STUDIO_STATE.gatewayUrl || DEFAULT_MS_GATEWAY_URL);
    const sbsFile = sel.sbs_file || `${sel.name}.sbs`;
    try {
      const resp = await fetchWithTimeout(
        `${apiBase}/api/castep/gateway/server-detail?gateway_url=${encodeURIComponent(gwUrl)}&server=${encodeURIComponent(sel.name)}&file=${encodeURIComponent(sbsFile)}`,
        {},
        5000
      );
      if (resp.ok) {
        const d = await resp.json();
        if (Array.isArray(d.details) && d.details.length) sel.details = d.details;
        if (d.description) sel.description = d.description;
        if (d.build_date && d.build_date !== "-") sel.build_date = d.build_date;
        if (d.version) sel.version = d.version;
        if (d.executable) sel.executable = d.executable;
      }
    } catch (e) {}
    if (CASTEP_STUDIO_STATE.gatewayServerDetailLoading === nextName) {
      CASTEP_STUDIO_STATE.gatewayServerDetailLoading = "";
    }
    renderMsGatewayServers();
  }
}
window.toggleMsGatewayServerDetail = toggleMsGatewayServerDetail;

function renderMsGatewayData() {
  const dataBody = document.getElementById("ms-gateway-data-tbody");
  if (!dataBody) return;

  if (!CASTEP_STUDIO_STATE.gatewayConnected) {
    dataBody.innerHTML = `
      <tr><td><strong>Connection Status</strong></td><td>Not connected. On a device without a running local Materials Studio Gateway bridge, zero fake Gateway records are fabricated.</td></tr>
      <tr><td><strong>How to Connect</strong></td><td>1) On your Materials Studio workstation, run <code>uvicorn app:app --host 127.0.0.1 --port 8877</code> and click <strong>🔄 Refresh Gateway</strong> (works from both localhost and GitHub Pages); OR<br/>2) Click <strong>📂 Mount Gateway Folder</strong> and select <code>C:\\ProgramData\\BIOVIA\\Materials Studio\\&lt;ver&gt;\\Gateway-x64\\root_default\\dsd</code> (containing <code>conf/gw-info.sbd</code>, <code>servers-info/*.sbs</code>, and <code>jobs-info/*.sbj</code>).</td></tr>
    `;
    return;
  }

  const gwData = CASTEP_STUDIO_STATE.gatewayData || [];
  const srcLabel = CASTEP_STUDIO_STATE.gatewayLiveHttp
    ? `Live Materials Studio HTTP Gateway (${CASTEP_STUDIO_STATE.gatewayUrl})`
    : (CASTEP_STUDIO_STATE.gatewaySource === "mounted"
      ? "Mounted Local Gateway Directory (Browser File System API)"
      : "Local BIOVIA Gateway Disk Metadata (HTTP daemon stopped)");

  const activeJobs = CASTEP_STUDIO_STATE.gatewayJobs || [];
  const runCount = activeJobs.filter(j => /running|starting|queued/i.test(j.status || "")).length;
  const procs = CASTEP_STUDIO_STATE.localProcesses || [];

  let rowsHtml = "";
  if (gwData.length > 0) {
    rowsHtml += gwData.map(kv => `
      <tr>
        <td>${escapeHtml(kv.key)}</td>
        <td style="word-break:break-word;">${escapeHtml(kv.value)}</td>
      </tr>
    `).join("");
  } else {
    rowsHtml += `<tr><td>gatewayname</td><td>${escapeHtml(CASTEP_STUDIO_STATE.gatewayHost || "-")}</td></tr>`;
  }

  rowsHtml += `
    <tr class="ms-gw-section-row"><td colspan="2">Live Bridge &amp; Diagnostics Summary</td></tr>
    <tr><td><strong>Data Source</strong></td><td>${escapeHtml(srcLabel)}</td></tr>
    <tr><td><strong>Gateway Root Directory</strong></td><td><code>${escapeHtml(CASTEP_STUDIO_STATE.gatewayRoot || "Remote / Browser Mounted")}</code></td></tr>
    <tr><td><strong>Current Gateway Jobs</strong></td><td><strong>${activeJobs.length}</strong> active/visible jobs (<strong>${runCount}</strong> running) • <strong>${CASTEP_STUDIO_STATE.gatewayArchivedTotal || 0}</strong> archived in <code>jobs-info-archive</code></td></tr>
    <tr><td><strong>Installed Server Modules</strong></td><td><strong>${(CASTEP_STUDIO_STATE.gatewayServers || []).length}</strong> server modules detected</td></tr>
    ${procs.length ? `<tr><td><strong>Active Workstation Processes</strong></td><td>${procs.map(p => `<code>${escapeHtml(p.name)}</code> (PID ${escapeHtml(p.pid)}, ${escapeHtml(p.mem)})`).join(" • ")}</td></tr>` : ""}
    ${CASTEP_STUDIO_STATE.gatewayPageGenerated ? `<tr><td><strong>Gateway Timestamp</strong></td><td>${escapeHtml(CASTEP_STUDIO_STATE.gatewayPageGenerated)}</td></tr>` : ""}
  `;
  dataBody.innerHTML = rowsHtml;
}
window.renderMsGatewayData = renderMsGatewayData;

function renderMsGatewayTable() {
  const activeJobs = CASTEP_STUDIO_STATE.gatewayJobs || [];
  const archivedJobs = CASTEP_STUDIO_STATE.gatewayArchivedJobs || [];
  const runCount = activeJobs.filter(j => /running|starting|queued/i.test(j.status || "")).length;
  const compCount = activeJobs.filter(j => /completed|success/i.test(j.status || "")).length;
  const termCount = activeJobs.filter(j => /terminated|stopped|failed/i.test(j.status || "")).length;
  const archTotal = CASTEP_STUDIO_STATE.gatewayArchivedTotal || archivedJobs.length;

  const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = String(v); };
  setText("ms-gw-count-all", activeJobs.length);
  setText("ms-gw-count-run", runCount);
  setText("ms-gw-count-comp", compCount);
  setText("ms-gw-count-term", termCount);
  setText("ms-gw-count-arch", archTotal);
  setText("castep-sidebar-gw-count", activeJobs.length);
  setText("ms-gw-nav-job-count", activeJobs.length ? `(${activeJobs.length})` : "");
  setText("ms-gw-nav-srv-count", (CASTEP_STUDIO_STATE.gatewayServers || []).length ? `(${CASTEP_STUDIO_STATE.gatewayServers.length})` : "");

  const elHost = document.getElementById("ms-gw-host-label");
  if (elHost) {
    if (CASTEP_STUDIO_STATE.gatewayConnected && CASTEP_STUDIO_STATE.gatewayHost) {
      const gwIp = CASTEP_STUDIO_STATE.gatewayIp || "";
      const showIp = gwIp && !CASTEP_STUDIO_STATE.gatewayHost.includes(gwIp) && gwIp !== "127.0.0.1" && gwIp !== "localhost";
      elHost.textContent = showIp
        ? `Remote Gateway ${CASTEP_STUDIO_STATE.gatewayHost} (${gwIp})`
        : `Remote Gateway ${CASTEP_STUDIO_STATE.gatewayHost}`;
    } else {
      elHost.textContent = "Remote Gateway (Not Connected)";
    }
  }

  const badge = document.getElementById("ms-gw-source-badge");
  if (badge) {
    if (CASTEP_STUDIO_STATE.gatewayConnected && CASTEP_STUDIO_STATE.gatewayLiveHttp) {
      const shortEndpoint = String(CASTEP_STUDIO_STATE.gatewayUrl || "").replace(/^https?:\/\//i, "");
      badge.className = "ms-gw-source-badge live";
      badge.textContent = shortEndpoint ? `🟢 Live (${shortEndpoint})` : "🟢 Live HTTP Connected";
    } else if (CASTEP_STUDIO_STATE.gatewayConnected && CASTEP_STUDIO_STATE.gatewaySource === "mounted") {
      badge.className = "ms-gw-source-badge disk";
      badge.textContent = "📂 Mounted Folder";
    } else if (CASTEP_STUDIO_STATE.gatewayConnected) {
      badge.className = "ms-gw-source-badge disk";
      badge.textContent = "💾 Local Disk dsd";
    } else {
      badge.className = "ms-gw-source-badge offline";
      badge.textContent = "⚪ Not Connected";
    }
  }

  const extLink = document.getElementById("ms-gw-external-link");
  if (extLink) {
    if (CASTEP_STUDIO_STATE.gatewayConnected && CASTEP_STUDIO_STATE.gatewayLiveHttp && CASTEP_STUDIO_STATE.gatewayUrl) {
      extLink.href = `${CASTEP_STUDIO_STATE.gatewayUrl.replace(/\/$/, "")}/dsd/commands/dsd_configuregw.pl?jobs=yes`;
      extLink.style.display = "block";
    } else {
      extLink.style.display = "none";
    }
  }

  const footerNote = document.getElementById("ms-gw-footer-note");
  if (footerNote) {
    footerNote.textContent = CASTEP_STUDIO_STATE.gatewayPageGenerated || (
      CASTEP_STUDIO_STATE.gatewayConnected
        ? `Showing ${activeJobs.length} current Gateway job(s) (${archTotal} archived) • Source: ${CASTEP_STUDIO_STATE.gatewaySource}`
        : ""
    );
  }

  // Keep Servers & Gateway Data subviews synced
  renderMsGatewayServers();
  renderMsGatewayData();

  const tbody = document.getElementById("ms-gateway-jobs-tbody");
  if (!tbody) return;

  const f = CASTEP_STUDIO_STATE.gatewayFilter || "all";
  const q = (document.getElementById("ms-gw-search-input")?.value || "").trim().toLowerCase();
  const baseList = (f === "archived") ? archivedJobs : activeJobs;

  let filtered = baseList.filter(j => {
    const st = (j.status || "").toLowerCase();
    if (f === "running" && !/running|starting|queued/.test(st)) return false;
    if (f === "completed" && !/completed|success/.test(st)) return false;
    if (f === "terminated" && !/terminated|stopped|failed/.test(st)) return false;
    if (q) {
      const hay = `${j.job_id} ${j.description} ${j.server} ${j.owner} ${j.status} ${j.submitted} ${j.process_id}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  // Column sorting
  const sk = CASTEP_STUDIO_STATE.gatewaySortKey || "default";
  const dir = CASTEP_STUDIO_STATE.gatewaySortAsc ? 1 : -1;
  if (sk !== "default") {
    filtered = [...filtered].sort((a, b) => {
      if (sk === "create_ts") return ((a.create_ts || 0) - (b.create_ts || 0)) * dir;
      if (sk === "process_id") return ((parseInt(a.process_id, 10) || 0) - (parseInt(b.process_id, 10) || 0)) * dir;
      return String(a[sk] || "").localeCompare(String(b[sk] || "")) * dir;
    });
  }

  if (!filtered.length) {
    const emptyMsg = !CASTEP_STUDIO_STATE.gatewayConnected
      ? "No Remote Gateway connected on this machine. Click <strong>📂 Mount Gateway Folder</strong> (select <code>dsd</code> / <code>Gateway-x64</code> / <code>jobs-info</code>) or run the local FastAPI server and click <strong>🔄 Refresh Gateway</strong>."
      : (f === "archived"
        ? (archTotal > 0 ? "Archived jobs require local backend connection or mounting a folder containing <code>jobs-info-archive</code>." : "No archived Gateway jobs found.")
        : (activeJobs.length === 0
          ? "Connected to Materials Studio Remote Gateway — currently 0 active jobs in queue."
          : "No matching Remote Gateway jobs found for this filter."));
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:22px; color:#475569;">${emptyMsg}</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(j => {
    const st = String(j.status || "terminated");
    const isRunning = /running|starting|queued/i.test(st);
    const isSuccess = /completed|success/i.test(st);
    const stStyle = isRunning
      ? "color:#15803d; font-weight:700;"
      : (isSuccess ? "color:#0369a1; font-weight:700;" : "color:#000000;");
    const localBadge = (j.has_local_files || j.has_remote_files)
      ? ' title="Click to load live Gateway job files directly into Data Analysis Workbench"'
      : ' title="Locate matching job in Data Analysis Workbench"';
    const actionHtml = j.is_archived
      ? '<span style="font-size:11px; color:#64748b;">Archived</span>'
      : (isRunning
        ? '<span style="font-size:11px; color:#15803d; font-weight:700;" title="Job is currently running on Remote Gateway">● Running</span>'
        : (j.can_remove === false
          ? '<span style="color:#64748b;">-</span>'
          : `<button type="button" class="ms-gw-remove-btn" onclick="removeMsGatewayJob('${escapeHtml(j.job_id)}')">Remove</button>`));

    return `
      <tr>
        <td style="max-width:210px; line-height:1.35;">${escapeHtml(j.description || j.job_id)}${j.is_archived ? ' <span style="font-size:10px; color:#64748b;">(archived)</span>' : ""}</td>
        <td style="text-align:center; vertical-align:top;">
          <a href="javascript:void(0)" class="ms-gw-jobid-link" onclick="openMsGatewayJobInStudio('${escapeHtml(j.job_id)}')"${localBadge}>${escapeHtml(j.job_id)}</a>
        </td>
        <td style="text-align:left;">${escapeHtml(j.server || "CASTEP")}</td>
        <td style="text-align:left;">${escapeHtml(j.owner || "-")}</td>
        <td style="text-align:left; ${stStyle}">${escapeHtml(st)}</td>
        <td style="max-width:130px; line-height:1.3;">${escapeHtml(j.submitted || "-")}</td>
        <td style="text-align:center;">${escapeHtml(j.queue || "-")}</td>
        <td style="text-align:center;">${escapeHtml(j.queued_job_id || "-")}</td>
        <td style="text-align:left;">${escapeHtml(String(j.process_id || "-"))}</td>
        <td style="text-align:center; white-space:nowrap;">
          ${actionHtml}
        </td>
      </tr>
    `;
  }).join("");
}
window.renderMsGatewayTable = renderMsGatewayTable;

const MS_GW_SKIP_DIRS = new Set(["jobs", "logs", "apache", "bin", "mpiruntime", "configurations", "graphics", "commands", "license", ".git", "node_modules"]);

function applyMountedGatewayData(rootName, activeSbjs, archivedSbjs, sbsServers, gwInfoParsed, gwParamsParsed) {
  activeSbjs.sort((a, b) => {
    const ar = /running|starting|queued/i.test(a.status || "") ? 0 : 1;
    const br = /running|starting|queued/i.test(b.status || "") ? 0 : 1;
    if (ar !== br) return ar - br;
    return (b.create_ts || 0) - (a.create_ts || 0);
  });
  archivedSbjs.sort((a, b) => (b.create_ts || 0) - (a.create_ts || 0));
  sbsServers.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

  const gwKv = gwInfoParsed?.kv || {};
  const gpKv = gwParamsParsed?.kv || {};
  const gwItems = (gwInfoParsed?.items || []).filter(it => !it.key.startsWith("_") && it.key !== "versionmajor" && it.key !== "versionminor");
  const hostName = gwKv.gatewayname || (gwKv.hostname && gwKv.port ? `${gwKv.hostname}_${gwKv.port}` : (gpKv.gw_hostname && gpKv.gw_port ? `${gpKv.gw_hostname}_${gpKv.gw_port}` : `Local Folder (${rootName})`));

  CASTEP_STUDIO_STATE.gatewayJobs = activeSbjs;
  CASTEP_STUDIO_STATE.gatewayArchivedJobs = archivedSbjs;
  CASTEP_STUDIO_STATE.gatewayArchivedTotal = archivedSbjs.length;
  CASTEP_STUDIO_STATE.gatewayArchivedLoaded = true;
  CASTEP_STUDIO_STATE.gatewayServers = sbsServers;
  CASTEP_STUDIO_STATE.gatewayData = gwItems;
  CASTEP_STUDIO_STATE.gatewayConnected = (activeSbjs.length > 0 || archivedSbjs.length > 0 || sbsServers.length > 0 || gwItems.length > 0);
  CASTEP_STUDIO_STATE.gatewayLiveHttp = false;
  CASTEP_STUDIO_STATE.gatewaySource = "mounted";
  CASTEP_STUDIO_STATE.gatewayHost = hostName;
  CASTEP_STUDIO_STATE.gatewayRoot = rootName;
  CASTEP_STUDIO_STATE.gatewayPageGenerated = `Loaded from mounted folder "${rootName}" (${activeSbjs.length} active jobs, ${archivedSbjs.length} archived, ${sbsServers.length} servers)`;
  renderMsGatewayTable();
}

async function mountMsGatewayFolder() {
  if (typeof window.showDirectoryPicker === "function") {
    try {
      const dirHandle = await window.showDirectoryPicker({ mode: "read" });
      const activeSbjs = [];
      const archivedSbjs = [];
      const sbsServers = [];
      let gwInfoParsed = null;
      let gwParamsParsed = null;

      const walkGw = async (dh, rel, depth) => {
        if (depth > 6) return;
        for await (const entry of dh.values()) {
          const low = entry.name.toLowerCase();
          if (entry.kind === "file") {
            if (low.endsWith(".sbj")) {
              const f = await entry.getFile();
              const isArch = rel.toLowerCase().includes("archive");
              const rec = parseSbjTextClient(await f.text(), entry.name, isArch);
              if (isArch) archivedSbjs.push(rec);
              else activeSbjs.push(rec);
            } else if (low.endsWith(".sbs")) {
              const f = await entry.getFile();
              sbsServers.push(parseSbsTextClient(await f.text(), entry.name));
            } else if (low === "gw-info.sbd") {
              const f = await entry.getFile();
              gwInfoParsed = parseGwKvTextClient(await f.text());
            } else if (low === "gwparams.cfg") {
              const f = await entry.getFile();
              gwParamsParsed = parseGwKvTextClient(await f.text());
            }
          } else if (entry.kind === "directory") {
            if (!MS_GW_SKIP_DIRS.has(low) && !low.startsWith(".")) {
              await walkGw(entry, `${rel}/${entry.name}`, depth + 1);
            }
          }
        }
      };

      await walkGw(dirHandle, dirHandle.name, 0);
      applyMountedGatewayData(dirHandle.name, activeSbjs, archivedSbjs, sbsServers, gwInfoParsed, gwParamsParsed);

      if (typeof showToast === "function") {
        const total = activeSbjs.length + archivedSbjs.length + sbsServers.length + (gwInfoParsed ? 1 : 0);
        showToast(
          total > 0
            ? `🖥️ Mounted Gateway "${dirHandle.name}": ${activeSbjs.length} active jobs, ${archivedSbjs.length} archived, ${sbsServers.length} installed servers!`
            : `No Materials Studio Gateway metadata (*.sbj, *.sbs, gw-info.sbd) found in "${dirHandle.name}".`,
          total > 0 ? "success" : "warning"
        );
      }
      return;
    } catch (e) {
      if (e && e.name === "AbortError") return;
    }
  }
  document.getElementById("ms-gw-sbj-upload-input")?.click();
}
window.mountMsGatewayFolder = mountMsGatewayFolder;

async function handleMsGatewayFolderUpload(event) {
  const allFiles = Array.from(event.target?.files || []);
  const activeSbjs = [];
  const archivedSbjs = [];
  const sbsServers = [];
  let gwInfoParsed = null;
  let gwParamsParsed = null;
  let rootName = "Mounted Gateway Folder";

  for (const f of allFiles) {
    const rel = (f.webkitRelativePath || f.name).replace(/\\/g, "/");
    if (rootName === "Mounted Gateway Folder" && rel.includes("/")) {
      rootName = rel.split("/")[0];
    }
    const low = f.name.toLowerCase();
    if (low.endsWith(".sbj")) {
      const isArch = rel.toLowerCase().includes("archive");
      const rec = parseSbjTextClient(await f.text(), f.name, isArch);
      if (isArch) archivedSbjs.push(rec);
      else activeSbjs.push(rec);
    } else if (low.endsWith(".sbs")) {
      sbsServers.push(parseSbsTextClient(await f.text(), f.name));
    } else if (low === "gw-info.sbd") {
      gwInfoParsed = parseGwKvTextClient(await f.text());
    } else if (low === "gwparams.cfg") {
      gwParamsParsed = parseGwKvTextClient(await f.text());
    }
  }
  applyMountedGatewayData(rootName, activeSbjs, archivedSbjs, sbsServers, gwInfoParsed, gwParamsParsed);
  event.target.value = "";
}
window.handleMsGatewayFolderUpload = handleMsGatewayFolderUpload;

async function openMsGatewayJobInStudio(gwJobId) {
  const allGw = [...(CASTEP_STUDIO_STATE.gatewayJobs || []), ...(CASTEP_STUDIO_STATE.gatewayArchivedJobs || [])];
  const gwJob = allGw.find(j => j.job_id === gwJobId);
  if (!gwJob) return;

  // 1) Check if this exact Gateway job is already loaded in workspace
  const jobs = CASTEP_STUDIO_STATE.jobs || [];
  const desc = (gwJob.description || "").toLowerCase();
  const targetStudioJob = jobs.find(j =>
    j.gateway_job_id === gwJobId ||
    (gwJob.job_directory && j.folder && j.folder.toLowerCase() === gwJob.job_directory.toLowerCase())
  );
  if (targetStudioJob) {
    await loadCastepJobIntoStudio(targetStudioJob.id);
    const nextPane = (/optical/i.test(desc)) ? "optics" : "builder";
    switchCastepStagePane(nextPane);
    if (typeof showToast === "function") showToast(`🖥️ Opened Gateway job "${targetStudioJob.title}"!`, "success");
    return;
  }

  // 2) Load directly from local or remote Gateway job working folder via FastAPI bridge!
  if (CASTEP_STUDIO_STATE.gatewayConnected && CASTEP_STUDIO_STATE.gatewaySource !== "mounted") {
    const apiBase = getCastepApiBase() || (["localhost", "127.0.0.1", "::1"].includes(window.location.hostname) ? "" : "http://127.0.0.1:8877");
    const gwUrl = normalizeMsGatewayUrlClient(document.getElementById("ms-gw-url-input")?.value || CASTEP_STUDIO_STATE.gatewayUrl || DEFAULT_MS_GATEWAY_URL);
    if (typeof showToast === "function") {
      showToast(`⏳ Loading live Gateway job ${gwJobId} from ${gwUrl.replace(/^https?:\/\//i, "")}...`, "info");
    }
    try {
      const resp = await fetchWithTimeout(
        `${apiBase}/api/castep/gateway/job/${encodeURIComponent(gwJobId)}?gateway_url=${encodeURIComponent(gwUrl)}`,
        {},
        15000
      );
      if (resp.ok) {
        const detail = await resp.json();
        const newJobId = `gw_${gwJobId}`;
        const existingIdx = CASTEP_STUDIO_STATE.jobs.findIndex(j => j.id === newJobId);
        const enriched = enrichCastepJobSummary({
          ...detail,
          id: newJobId,
          gateway_job_id: gwJobId,
          title: `${gwJob.description || detail.seed} [GW ${gwJobId}]`,
          project: `Gateway ${CASTEP_STUDIO_STATE.gatewayHost || "18888"}`,
          _hydrated: true
        });
        if (existingIdx >= 0) CASTEP_STUDIO_STATE.jobs[existingIdx] = enriched;
        else CASTEP_STUDIO_STATE.jobs.unshift(enriched);
        renderCastepJobsList();
        updateCastepKpiBar();
        await loadCastepJobIntoStudio(newJobId);
        switchCastepStagePane("builder");
        if (typeof showToast === "function") {
          showToast(`🖥️ Loaded live Gateway job ${gwJobId} (${detail.seed}, ${(detail.files_list || []).length} files) directly into Data Analysis Workbench!`, "success");
        }
        return;
      }
    } catch (e) {}
  }

  if (typeof showToast === "function") {
    showToast(`Job ${gwJobId} (${gwJob.description}) working files are not accessible on Gateway (cleaned or archived). Mount its project folder to inspect outputs.`, "info");
  }
}
window.openMsGatewayJobInStudio = openMsGatewayJobInStudio;

async function removeMsGatewayJob(gwJobId) {
  const gwJob = (CASTEP_STUDIO_STATE.gatewayJobs || []).find(j => j.job_id === gwJobId);
  if (!gwJob) return;

  if (CASTEP_STUDIO_STATE.gatewayLiveHttp && CASTEP_STUDIO_STATE.gatewaySource !== "mounted") {
    const ok = window.confirm(`Remove job ${gwJobId} ("${gwJob.description}") from live Materials Studio Remote Gateway (${CASTEP_STUDIO_STATE.gatewayHost})?`);
    if (!ok) return;
    const apiBase = getCastepApiBase() || (["localhost", "127.0.0.1", "::1"].includes(window.location.hostname) ? "" : "http://127.0.0.1:8877");
    const gwUrl = normalizeMsGatewayUrlClient(document.getElementById("ms-gw-url-input")?.value || CASTEP_STUDIO_STATE.gatewayUrl || DEFAULT_MS_GATEWAY_URL);
    try {
      const resp = await fetch(`${apiBase}/api/castep/gateway/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: gwJobId, gateway_url: gwUrl })
      });
      if (resp.ok) {
        CASTEP_STUDIO_STATE.gatewayJobs = (CASTEP_STUDIO_STATE.gatewayJobs || []).filter(j => j.job_id !== gwJobId);
        renderMsGatewayTable();
        if (typeof showToast === "function") showToast(`🗑️ Removed job ${gwJobId} from Materials Studio Remote Gateway.`, "success");
        return;
      }
    } catch (e) {}
  }

  CASTEP_STUDIO_STATE.gatewayJobs = (CASTEP_STUDIO_STATE.gatewayJobs || []).filter(j => j.job_id !== gwJobId);
  renderMsGatewayTable();
  if (typeof showToast === "function") showToast(`Hid job ${gwJobId} from current Gateway view.`, "info");
}
window.removeMsGatewayJob = removeMsGatewayJob;

async function refreshMsGatewayJobsFromServer() {
  const rawInput = document.getElementById("ms-gw-url-input")?.value || CASTEP_STUDIO_STATE.gatewayUrl || DEFAULT_MS_GATEWAY_URL;
  const gwUrl = normalizeMsGatewayUrlClient(rawInput);
  CASTEP_STUDIO_STATE.gatewayUrl = gwUrl;
  syncMsGatewayUrlControls(gwUrl);
  try { localStorage.setItem("ms_gateway_url", gwUrl); } catch (e) {}

  const includeArch = (CASTEP_STUDIO_STATE.gatewayFilter === "archived");
  const isLocal = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
  const candidates = isLocal ? [""] : (CASTEP_STUDIO_STATE.apiBase ? [CASTEP_STUDIO_STATE.apiBase] : ["http://127.0.0.1:8877"]);

  for (const base of candidates) {
    try {
      const resp = await fetchWithTimeout(
        `${base}/api/castep/gateway?gateway_url=${encodeURIComponent(gwUrl)}&include_archived=${includeArch ? "true" : "false"}&limit=500`,
        {},
        8000
      );
      if (resp.ok) {
        if (!isLocal) CASTEP_STUDIO_STATE.apiBase = base;
        const data = await resp.json();
        applyGatewayApiPayload(data);
        if (typeof showToast === "function") {
          showToast(
            data.connected
              ? `🔄 Synced ${CASTEP_STUDIO_STATE.gatewayJobs.length} live jobs, ${(data.installed_servers || []).length} servers & ${(data.gateway_data || []).length} Gateway properties from ${data.gateway_host}!`
              : `Materials Studio Remote Gateway not reachable at ${gwUrl}.`,
            data.connected ? "success" : "warning"
          );
        }
        return;
      }
    } catch (e) {}
  }

  CASTEP_STUDIO_STATE.gatewayConnected = false;
  CASTEP_STUDIO_STATE.gatewayLiveHttp = false;
  CASTEP_STUDIO_STATE.gatewaySource = "none";
  renderMsGatewayTable();
  if (typeof showToast === "function") {
    showToast("Local FastAPI Gateway bridge (127.0.0.1:8877) not reachable. Click '📂 Mount Gateway Folder' to load dsd / jobs-info directly in browser.", "info");
  }
}
window.refreshMsGatewayJobsFromServer = refreshMsGatewayJobsFromServer;

// ============================================================================
// 10. EXACT CASTEP Optical Properties Analyzer (Materials Studio Parity!)
//     Full 3x3 .ome_bin Tensor: Polarized, Unpolarized (Incidence), Polycrystalline,
//     Smearing, Scissors (Levine-Allan), Drude Intraband, KK, Tauc & 4-Unit Axes
// ============================================================================

function parseCastepSymopsCartesianJS(cellText, vecsBohr) {
  if (!cellText || !Array.isArray(vecsBohr) || vecsBohr.length !== 3) return null;
  const m = cellText.match(/%BLOCK\s+SYMMETRY_OPS([\s\S]*?)%ENDBLOCK\s+SYMMETRY_OPS/i);
  if (!m) return null;
  const nums = [];
  m[1].split(/\r?\n/).forEach(line => {
    const s = line.split("#")[0].split("!")[0].trim();
    if (!s) return;
    const p = s.split(/\s+/).map(Number);
    if (p.length >= 3 && p.slice(0, 3).every(Number.isFinite)) nums.push([p[0], p[1], p[2]]);
  });
  if (nums.length < 4 || nums.length % 4 !== 0) return null;
  const AT = [
    [vecsBohr[0][0], vecsBohr[1][0], vecsBohr[2][0]],
    [vecsBohr[0][1], vecsBohr[1][1], vecsBohr[2][1]],
    [vecsBohr[0][2], vecsBohr[1][2], vecsBohr[2][2]]
  ];
  const det =
    AT[0][0] * (AT[1][1] * AT[2][2] - AT[1][2] * AT[2][1]) -
    AT[0][1] * (AT[1][0] * AT[2][2] - AT[1][2] * AT[2][0]) +
    AT[0][2] * (AT[1][0] * AT[2][1] - AT[1][1] * AT[2][0]);
  if (Math.abs(det) < 1e-12) return null;
  const invAT = [
    [(AT[1][1] * AT[2][2] - AT[1][2] * AT[2][1]) / det, (AT[0][2] * AT[2][1] - AT[0][1] * AT[2][2]) / det, (AT[0][1] * AT[1][2] - AT[0][2] * AT[1][1]) / det],
    [(AT[1][2] * AT[2][0] - AT[1][0] * AT[2][2]) / det, (AT[0][0] * AT[2][2] - AT[0][2] * AT[2][0]) / det, (AT[0][2] * AT[1][0] - AT[0][0] * AT[1][2]) / det],
    [(AT[1][0] * AT[2][1] - AT[1][1] * AT[2][0]) / det, (AT[0][1] * AT[2][0] - AT[0][0] * AT[2][1]) / det, (AT[0][0] * AT[1][1] - AT[0][1] * AT[1][0]) / det]
  ];
  const mm = (X, Y) => [0, 1, 2].map(i => [0, 1, 2].map(j => X[i][0] * Y[0][j] + X[i][1] * Y[1][j] + X[i][2] * Y[2][j]));
  const orthErr = (R) => {
    let e = 0;
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      const d = R[0][i] * R[0][j] + R[1][i] * R[1][j] + R[2][i] * R[2][j] - (i === j ? 1 : 0);
      e += d * d;
    }
    return e;
  };
  const rots = [];
  for (let g = 0; g < nums.length; g += 4) {
    const S = [nums[g], nums[g + 1], nums[g + 2]];
    const ST = [[S[0][0], S[1][0], S[2][0]], [S[0][1], S[1][1], S[2][1]], [S[0][2], S[1][2], S[2][2]]];
    const R1 = mm(mm(AT, S), invAT);
    const R2 = mm(mm(AT, ST), invAT);
    const e1 = orthErr(R1), e2 = orthErr(R2);
    if (Math.min(e1, e2) < 1e-3) rots.push(e1 <= e2 ? R1 : R2);
  }
  return rots.length ? rots : null;
}

function symmetrizeOpticalTensorBinsJS(t6, rotMats) {
  if (!rotMats || rotMats.length <= 1) return t6;
  const nbins = t6[0].length;
  const invN = 1.0 / rotMats.length;
  const pairs = [[0, 0], [1, 1], [2, 2], [0, 1], [0, 2], [1, 2]];
  const M = Array.from({ length: 6 }, () => new Float64Array(6));
  rotMats.forEach(R => {
    for (let pOut = 0; pOut < 6; pOut++) {
      const [i, j] = pairs[pOut];
      for (let pIn = 0; pIn < 6; pIn++) {
        const [a, b] = pairs[pIn];
        M[pOut][pIn] += (a === b ? R[i][a] * R[j][a] : (R[i][a] * R[j][b] + R[i][b] * R[j][a])) * invN;
      }
    }
  });
  const out = Array.from({ length: 6 }, () => new Array(nbins).fill(0));
  for (let bi = 0; bi < nbins; bi++) {
    const v0 = t6[0][bi], v1 = t6[1][bi], v2 = t6[2][bi], v3 = t6[3][bi], v4 = t6[4][bi], v5 = t6[5][bi];
    if (v0 === 0 && v1 === 0 && v2 === 0 && v3 === 0 && v4 === 0 && v5 === 0) continue;
    for (let pOut = 0; pOut < 6; pOut++) {
      const row = M[pOut];
      out[pOut][bi] = row[0] * v0 + row[1] * v1 + row[2] * v2 + row[3] * v3 + row[4] * v4 + row[5] * v5;
    }
  }
  return out;
}

function parseCastepOmeBinArrayBuffer(arrayBuffer, bandsObj, cellText = "", castepText = "", sourceName = "Optics.ome_bin", resultsName = "") {
  if (!arrayBuffer || arrayBuffer.byteLength < 120 || !bandsObj || !bandsObj.kpoints || !bandsObj.kpoints.length) return null;
  const HA_TO_EV = 27.211386245988;
  const BOHR_TO_ANG = 0.529177210903;
  const dv = new DataView(arrayBuffer);
  const sz = arrayBuffer.byteLength;
  const reclBE = dv.getInt32(0, false);
  const reclLE = dv.getInt32(0, true);
  let littleEndian = false;
  if (reclBE > 0 && reclBE <= sz) littleEndian = false;
  else if (reclLE > 0 && reclLE <= sz) littleEndian = true;
  else return null;

  let pos = 0;
  const nextRec = () => {
    if (pos + 4 > sz) return null;
    const rl = dv.getInt32(pos, littleEndian);
    pos += 4;
    if (rl < 0 || pos + rl + 4 > sz) return null;
    const start = pos;
    pos += rl + 4;
    return { start, len: rl };
  };
  nextRec(); // version float64
  const hdrRec = nextRec(); // 80-char header
  let hdrStr = "";
  if (hdrRec) {
    for (let c = 0; c < hdrRec.len; c++) hdrStr += String.fromCharCode(dv.getUint8(hdrRec.start + c));
    hdrStr = hdrStr.trim();
  }

  const nk = bandsObj.kpoints.length;
  const ns = Math.max(1, bandsObj.ns || 1);
  const nb = bandsObj.neig || (bandsObj.kpoints[0]?.e?.[0]?.length || 0);
  if (nb <= 1) return null;
  const expectedBytes = nb * nb * 3 * 16;

  // Cell volume in bohr^3
  let vol = bandsObj.vol_bohr3 || 0;
  if (vol < 1e-6) {
    const volA3 = getActiveStructureCellVolAndC().vol || 150.0;
    vol = volA3 / (BOHR_TO_ANG * BOHR_TO_ANG * BOHR_TO_ANG);
  }

  // Spin degeneracy g_spin (1 for collinear or SOC spinors; 2 for non-spin non-SOC)
  let gSpin = 2.0;
  if (ns >= 2) {
    gSpin = 1.0;
  } else {
    const e0 = bandsObj.kpoints[0].e[0] || [];
    const nOcc0 = e0.filter(v => v <= 0.003).length;
    if (castepText && /spin-orbit coupling\s*:\s*on/i.test(castepText)) gSpin = 1.0;
    else if (bandsObj.nelec > 0) gSpin = (Math.abs(nOcc0 - bandsObj.nelec) < Math.abs(nOcc0 - bandsObj.nelec * 0.5)) ? 1.0 : 2.0;
  }

  let kTEv = 0.05;
  if (castepText) {
    const mSm = castepText.match(/smearing width\s*:\s*([\d.]+)/i);
    if (mSm) kTEv = Math.max(0.01, Math.min(0.5, parseFloat(mSm[1]) || 0.05));
  }

  let maxSpanEv = 30.0;
  bandsObj.kpoints.forEach(kp => {
    (kp.e || []).forEach(sp => {
      if (sp.length > 1) {
        const span = sp[sp.length - 1] - sp[0];
        if (span > maxSpanEv) maxSpanEv = span;
      }
    });
  });
  const dE = 0.05;
  const eMaxUse = Math.min(85.0, Math.max(30.0, Math.ceil(maxSpanEv) + 2.0));
  const nbins = Math.floor(eMaxUse / dE) + 1;
  const invDE = 1.0 / dE;

  const hXX = new Array(nbins).fill(0), hYY = new Array(nbins).fill(0), hZZ = new Array(nbins).fill(0);
  const hXY = new Array(nbins).fill(0), hXZ = new Array(nbins).fill(0), hYZ = new Array(nbins).fill(0);
  let wp2 = [0, 0, 0, 0, 0, 0];

  const nb2 = nb * nb;
  const offY = nb2 * 16;
  const offZ = nb2 * 32;
  const cPref = (4.0 * Math.PI * Math.PI / vol) * gSpin * HA_TO_EV;
  const wpPref = (4.0 * Math.PI / vol) * gSpin * (HA_TO_EV * HA_TO_EV);
  const kTHa = kTEv / HA_TO_EV;

  let parsedRecs = 0;
  for (let ik = 0; ik < nk; ik++) {
    const kp = bandsObj.kpoints[ik];
    const wk = kp.w || (1.0 / nk);
    for (let ispin = 0; ispin < ns; ispin++) {
      const rec = nextRec();
      if (!rec || rec.len !== expectedBytes) break;
      parsedRecs++;
      const evalsEv = kp.e[ispin] || [];
      const efShiftEv = (bandsObj.ef_ev_spins && bandsObj.ef_ev_spins[ispin] !== undefined)
        ? (bandsObj.ef_ev_spins[ispin] - (bandsObj.ef_ev || 0))
        : 0.0;
      const occs = new Float64Array(nb);
      const occIdx = [], unoccIdx = [];
      for (let b = 0; b < nb; b++) {
        const x = ((evalsEv[b] || 0) - efShiftEv) / kTEv;
        const f = x > 35 ? 0.0 : (x < -35 ? 1.0 : 1.0 / (1.0 + Math.exp(x)));
        occs[b] = f;
        if (f > 1e-4) occIdx.push(b);
        if (f < 0.9999) unoccIdx.push(b);
        const dfDe = f * (1.0 - f) / kTHa;
        if (dfDe > 1e-4) {
          const p0 = rec.start + (b + nb * b) * 16;
          const vx = dv.getFloat64(p0, littleEndian);
          const vy = dv.getFloat64(p0 + offY, littleEndian);
          const vz = dv.getFloat64(p0 + offZ, littleEndian);
          const wf = wpPref * wk * dfDe;
          wp2[0] += wf * vx * vx; wp2[1] += wf * vy * vy; wp2[2] += wf * vz * vz;
          wp2[3] += wf * vx * vy; wp2[4] += wf * vx * vz; wp2[5] += wf * vy * vz;
        }
      }
      const baseK = cPref * wk;
      for (let oi = 0; oi < occIdx.length; oi++) {
        const iv = occIdx[oi];
        const fv = occs[iv], ev = evalsEv[iv];
        for (let ui = 0; ui < unoccIdx.length; ui++) {
          const ic = unoccIdx[ui];
          if (ic <= iv) continue;
          const df = fv - occs[ic];
          if (df <= 1e-4) continue;
          const dEEv = evalsEv[ic] - ev;
          if (dEEv <= 0.003) continue;
          const bi = Math.floor(dEEv * invDE);
          if (bi >= nbins) continue;
          const dEHa = dEEv / HA_TO_EV;
          const fac = (baseK * df) / (dEHa * dEHa);
          const p0 = rec.start + (iv + nb * ic) * 16;
          const pxR = dv.getFloat64(p0, littleEndian), pxI = dv.getFloat64(p0 + 8, littleEndian);
          const pyR = dv.getFloat64(p0 + offY, littleEndian), pyI = dv.getFloat64(p0 + offY + 8, littleEndian);
          const pzR = dv.getFloat64(p0 + offZ, littleEndian), pzI = dv.getFloat64(p0 + offZ + 8, littleEndian);
          hXX[bi] += fac * (pxR * pxR + pxI * pxI);
          hYY[bi] += fac * (pyR * pyR + pyI * pyI);
          hZZ[bi] += fac * (pzR * pzR + pzI * pzI);
          hXY[bi] += fac * (pxR * pyR + pxI * pyI);
          hXZ[bi] += fac * (pxR * pzR + pxI * pzI);
          hYZ[bi] += fac * (pyR * pzR + pyI * pzI);
        }
      }
    }
  }
  if (!parsedRecs) return null;

  let t6 = [hXX, hYY, hZZ, hXY, hXZ, hYZ];
  const rotMats = parseCastepSymopsCartesianJS(cellText, bandsObj.vecs_bohr);
  const nsym = rotMats ? rotMats.length : 1;
  if (nsym > 1) {
    t6 = symmetrizeOpticalTensorBinsJS(t6, rotMats);
    const wpSym = symmetrizeOpticalTensorBinsJS(wp2.map(v => [v]), rotMats);
    wp2 = wpSym.map(c => c[0]);
  }
  return {
    source_file: sourceName,
    results_file: resultsName || sourceName,
    header: hdrStr,
    dE, e_max: Number((nbins * dE).toFixed(3)), nbins,
    nk, ns, nbands: nb, g_spin: gSpin, nsym,
    vol_a3: Number((vol * BOHR_TO_ANG * BOHR_TO_ANG * BOHR_TO_ANG).toFixed(3)),
    plasma_ev_tensor: wp2,
    plasma_ev: [Math.sqrt(Math.max(0, wp2[0])), Math.sqrt(Math.max(0, wp2[1])), Math.sqrt(Math.max(0, wp2[2]))],
    t6
  };
}
window.parseCastepOmeBinArrayBuffer = parseCastepOmeBinArrayBuffer;

function projectOpticalTensor6(t6, calcMode, vx, vy, vz) {
  if (!t6 || t6.length < 6) return null;
  const n = t6[0].length;
  const out = new Float64Array(n);
  if (calcMode === "polycrystalline") {
    const f = 1.0 / 3.0;
    for (let i = 0; i < n; i++) out[i] = (t6[0][i] + t6[1][i] + t6[2][i]) * f;
    return out;
  }
  let x = Number(vx) || 0, y = Number(vy) || 0, z = Number(vz) || 0;
  let norm = Math.hypot(x, y, z);
  if (norm < 1e-9) { x = 0; y = 0; z = 1; norm = 1; }
  const nx = x / norm, ny = y / norm, nz = z / norm;
  const xx = nx * nx, yy = ny * ny, zz = nz * nz;
  const xy2 = 2 * nx * ny, xz2 = 2 * nx * nz, yz2 = 2 * ny * nz;
  if (calcMode === "unpolarized") {
    // Unpolarized light with Incidence wavevector q = (nx, ny, nz):
    // Average uniformly over the plane perpendicular to q: 0.5 * [Tr(T) - q^T T q]
    for (let i = 0; i < n; i++) {
      const tr = t6[0][i] + t6[1][i] + t6[2][i];
      const qTq = xx * t6[0][i] + yy * t6[1][i] + zz * t6[2][i] + xy2 * t6[3][i] + xz2 * t6[4][i] + yz2 * t6[5][i];
      out[i] = Math.max(0, 0.5 * (tr - qTq));
    }
    return out;
  }
  // Polarized light with E-field direction e = (nx, ny, nz): e^T T e
  for (let i = 0; i < n; i++) {
    out[i] = Math.max(0, xx * t6[0][i] + yy * t6[1][i] + zz * t6[2][i] + xy2 * t6[3][i] + xz2 * t6[4][i] + yz2 * t6[5][i]);
  }
  return out;
}

function projectScalarTensor6(v6, calcMode, vx, vy, vz) {
  if (!v6 || v6.length < 6) return 0;
  if (calcMode === "polycrystalline") return Math.max(0, (v6[0] + v6[1] + v6[2]) / 3.0);
  let x = Number(vx) || 0, y = Number(vy) || 0, z = Number(vz) || 0;
  let norm = Math.hypot(x, y, z);
  if (norm < 1e-9) { x = 0; y = 0; z = 1; norm = 1; }
  const nx = x / norm, ny = y / norm, nz = z / norm;
  const qTq = nx * nx * v6[0] + ny * ny * v6[1] + nz * nz * v6[2] + 2 * nx * ny * v6[3] + 2 * nx * nz * v6[4] + 2 * ny * nz * v6[5];
  if (calcMode === "unpolarized") return Math.max(0, 0.5 * ((v6[0] + v6[1] + v6[2]) - qTq));
  return Math.max(0, qTq);
}

function getOpticalUiParams() {
  const calcMode = document.getElementById("castep-opt-calc-mode")?.value || "unpolarized";
  let vx = parseFloat(document.getElementById("castep-opt-vx")?.value);
  let vy = parseFloat(document.getElementById("castep-opt-vy")?.value);
  let vz = parseFloat(document.getElementById("castep-opt-vz")?.value);
  if (!Number.isFinite(vx)) vx = 0;
  if (!Number.isFinite(vy)) vy = 0;
  if (!Number.isFinite(vz)) vz = 1;
  if (Math.hypot(vx, vy, vz) < 1e-9) { vx = 0; vy = 0; vz = 1; }
  const emax = Math.max(2.0, Math.min(120.0, parseFloat(document.getElementById("castep-opt-emax")?.value) || 15.0));
  const smearingEv = Math.max(0.02, Math.min(2.5, parseFloat(document.getElementById("castep-opt-smearing")?.value) || 0.50));
  const scissorsEv = Math.max(-3.0, Math.min(8.0, parseFloat(document.getElementById("castep-opt-scissors")?.value) || 0.0));
  const useDrude = document.getElementById("castep-opt-use-drude")?.checked === true;
  const plasmaEv = Math.max(0.0, parseFloat(document.getElementById("castep-opt-plasma")?.value) || 0.0);
  const drudeDampEv = Math.max(0.005, parseFloat(document.getElementById("castep-opt-drude-damp")?.value) || 0.05);
  const alphaConv = document.getElementById("castep-opt-alpha-conv")?.value || "ms_castep";
  const fileSelVal = document.getElementById("castep-opt-file-select")?.value || "auto";
  const xAxisMode = document.getElementById("castep-opt-xaxis")?.value || "ev";
  return { calcMode, vx, vy, vz, emax, smearingEv, scissorsEv, useDrude, plasmaEv, drudeDampEv, alphaConv, fileSelVal, xAxisMode };
}

function formatOpticalGeomLabel(calcMode, vx, vy, vz) {
  const vecStr = `(${Number(vx).toFixed(1)}, ${Number(vy).toFixed(1)}, ${Number(vz).toFixed(1)})`;
  if (calcMode === "polycrystalline") return "Polycrystalline (Isotropic Avg)";
  if (calcMode === "unpolarized") return `Unpolarized • Incidence ${vecStr}`;
  return `Polarized • Polarization ${vecStr}`;
}

function onCastepOptCalcModeChange() {
  const mode = document.getElementById("castep-opt-calc-mode")?.value || "unpolarized";
  const wrap = document.getElementById("castep-opt-vec-wrap");
  const lbl = document.getElementById("castep-opt-vec-label");
  if (lbl) lbl.textContent = mode === "polarized" ? "Polarization:" : "Incidence:";
  if (wrap) {
    wrap.style.opacity = mode === "polycrystalline" ? "0.42" : "1.0";
    wrap.style.pointerEvents = mode === "polycrystalline" ? "none" : "auto";
    wrap.querySelectorAll("input, button").forEach(el => { el.disabled = (mode === "polycrystalline"); });
  }
  renderCastepOpticalPlots();
}
window.onCastepOptCalcModeChange = onCastepOptCalcModeChange;

function setCastepOpticalVector(vx, vy, vz) {
  const ex = document.getElementById("castep-opt-vx");
  const ey = document.getElementById("castep-opt-vy");
  const ez = document.getElementById("castep-opt-vz");
  if (ex) ex.value = Number(vx).toFixed(1);
  if (ey) ey.value = Number(vy).toFixed(1);
  if (ez) ez.value = Number(vz).toFixed(1);
  renderCastepOpticalPlots();
}
window.setCastepOpticalVector = setCastepOpticalVector;

function toggleCastepOptMorePanel() {
  const p = document.getElementById("castep-opt-more-panel");
  const b = document.getElementById("castep-opt-more-btn");
  if (!p) return;
  const open = p.style.display === "none" || !p.style.display;
  p.style.display = open ? "flex" : "none";
  if (b) b.textContent = open ? "⚙️ Less" : "⚙️ More...";
}
window.toggleCastepOptMorePanel = toggleCastepOptMorePanel;

function applyAutoCastepDrudePlasma() {
  const job = (CASTEP_STUDIO_STATE.jobs || []).find(j => j.id === CASTEP_STUDIO_STATE.activeJobId);
  const p = getOpticalUiParams();
  let wp = 0.0;
  if (job?.optical_tensor?.plasma_ev_tensor) {
    wp = Math.sqrt(projectScalarTensor6(job.optical_tensor.plasma_ev_tensor, p.calcMode, p.vx, p.vy, p.vz));
  }
  const wpEl = document.getElementById("castep-opt-plasma");
  const chkEl = document.getElementById("castep-opt-use-drude");
  if (wpEl) wpEl.value = wp.toFixed(3);
  if (chkEl) chkEl.checked = wp > 0.001;
  renderCastepOpticalPlots();
  if (typeof showToast === "function") {
    showToast(
      wp > 0.001
        ? `⚡ Auto-calculated directional Drude plasma frequency ωp = ${wp.toFixed(3)} eV from CASTEP .ome_bin.`
        : "System is a semiconductor/insulator (intraband Drude ωp ≈ 0.000 eV).",
      wp > 0.001 ? "success" : "info"
    );
  }
}
window.applyAutoCastepDrudePlasma = applyAutoCastepDrudePlasma;

async function onCastepOptSourceChange() {
  const sel = document.getElementById("castep-opt-file-select");
  const job = (CASTEP_STUDIO_STATE.jobs || []).find(j => j.id === CASTEP_STUDIO_STATE.activeJobId);
  if (sel && job) {
    const val = sel.value;
    if (val === "tensor_lazy" && !job.optical_tensor) {
      await ensureJobOpticalTensorHydrated(job);
      populateCastepOpticalFileSelect(job);
    } else if (val.startsWith("sib:")) {
      const sIdx = parseInt(val.slice(4), 10);
      const sb = Array.isArray(job.sibling_optics) ? job.sibling_optics[sIdx] : null;
      if (sb) {
        const apiBase = getCastepApiBase() || (["localhost", "127.0.0.1", "::1"].includes(window.location.hostname) ? "" : "http://127.0.0.1:8877");
        try {
          const resp = await fetch(`${apiBase}/api/castep/optics-tensor?folder=${encodeURIComponent(sb.folder)}&ome_file=${encodeURIComponent(sb.ome_file)}&bands_file=${encodeURIComponent(sb.bands_file)}`);
          if (resp.ok) {
            const data = await resp.json();
            if (data?.optical_tensor) {
              job.optical_tensor = { ...data.optical_tensor, results_file: sb.results_file, sibling_folder: sb.folder };
              CASTEP_STUDIO_STATE._optSpectraCacheKey = "";
              populateCastepOpticalFileSelect(job);
            }
          }
        } catch (e) {}
      }
    }
  }
  renderCastepOpticalPlots();
}
window.onCastepOptSourceChange = onCastepOptSourceChange;

async function ensureJobOpticalTensorHydrated(job) {
  if (!job || job.optical_tensor || job._loadingOpticalTensor) return job?.optical_tensor || null;
  job._loadingOpticalTensor = true;
  try {
    // 1) Browser mounted folder (_fileMap) containing *.ome_bin + *_Optics.bands
    if (job._fileMap && Object.keys(job._fileMap).length > 0) {
      const entries = Object.entries(job._fileMap);
      const omeE = entries.find(([n]) => /\.(ome_bin|cst_ome)$/i.test(n));
      const bndE = entries.find(([n]) => /_optics\.bands$/i.test(n));
      const casE = entries.find(([n]) => /_optics\.castep$/i.test(n));
      const celE = entries.find(([n]) => /_optics\.cell$/i.test(n));
      if (omeE && (job.optics_bands || bndE)) {
        if (!job.optics_bands && bndE) {
          const bt = await readFromFileOrHandle(bndE[1], false);
          if (bt) job.optics_bands = parseCastepBandsTextClient(bt);
          job.optics_bands_file = bndE[0];
        }
        const optCasTxt = job.optics_castep_text || (casE ? await readFromFileOrHandle(casE[1], false) : "");
        const optCelTxt = celE ? await readFromFileOrHandle(celE[1], false) : (job.cell_text || "");
        const buf = await readFromFileOrHandle(omeE[1], true);
        if (buf && job.optics_bands) {
          job.ome_bin_file = omeE[0];
          if (casE) job.optics_castep_file = casE[0];
          const tensor = parseCastepOmeBinArrayBuffer(
            buf, job.optics_bands, optCelTxt || "", optCasTxt || "",
            omeE[0], job.optics_castep_file || job.optics_bands_file || omeE[0]
          );
          if (tensor) {
            job.optical_tensor = tensor;
            CASTEP_STUDIO_STATE._optSpectraCacheKey = "";
            return tensor;
          }
        }
      }
    }

    // 2) Remote Gateway or Local FastAPI backend on-demand tensor extraction
    const apiBase = getCastepApiBase() || (["localhost", "127.0.0.1", "::1"].includes(window.location.hostname) ? "" : "http://127.0.0.1:8877");
    let url = "";
    if (job.remote_gateway && job.gateway_job_id && job.ome_bin_file && job.optics_bands_file) {
      const gwUrl = normalizeMsGatewayUrlClient(CASTEP_STUDIO_STATE.gatewayUrl || DEFAULT_MS_GATEWAY_URL);
      url = `${apiBase}/api/castep/gateway/optics-tensor/${encodeURIComponent(job.gateway_job_id)}?ome_file=${encodeURIComponent(job.ome_bin_file)}&bands_file=${encodeURIComponent(job.optics_bands_file)}&cell_file=${encodeURIComponent(job.optics_cell_file || "")}&castep_file=${encodeURIComponent(job.optics_castep_file || "")}&gateway_url=${encodeURIComponent(gwUrl)}`;
    } else if (job.folder && CASTEP_STUDIO_STATE.localBackendConnected && (job.ome_bin_file || (job.files_list || []).some(f => /\.(ome_bin|cst_ome)$/i.test(f)))) {
      const omeF = job.ome_bin_file || (job.files_list || []).find(f => /\.(ome_bin|cst_ome)$/i.test(f)) || "";
      const bndF = job.optics_bands_file || (job.files_list || []).find(f => /_optics\.bands$/i.test(f)) || "";
      if (omeF && bndF) {
        url = `${apiBase}/api/castep/optics-tensor?folder=${encodeURIComponent(job.folder)}&ome_file=${encodeURIComponent(omeF)}&bands_file=${encodeURIComponent(bndF)}`;
      }
    }
    if (url) {
      const resp = await fetch(url);
      if (resp.ok) {
        const data = await resp.json();
        if (data?.optical_tensor) {
          job.optical_tensor = data.optical_tensor;
          CASTEP_STUDIO_STATE._optSpectraCacheKey = "";
          return job.optical_tensor;
        }
      }
    }
  } catch (e) {} finally {
    job._loadingOpticalTensor = false;
  }
  return null;
}
window.ensureJobOpticalTensorHydrated = ensureJobOpticalTensorHydrated;

async function pickCastepOpticsFolder() {
  if (typeof window.showDirectoryPicker === "function") {
    try {
      const dirHandle = await window.showDirectoryPicker({ mode: "read" });
      const files = [];
      for await (const entry of dirHandle.values()) {
        if (entry.kind === "file") {
          const low = entry.name.toLowerCase();
          if (/\.(ome_bin|cst_ome|bands|cell|castep|xcd|csv|dat|txt)$/i.test(low)) {
            files.push(await entry.getFile());
          }
        }
      }
      if (!files.length) {
        if (typeof showToast === "function") showToast(`No CASTEP optical files (*_Optics.castep, *.ome_bin, *_Optics.bands, *.xcd) found in "${dirHandle.name}".`, "warning");
        return;
      }
      await ingestOpticalFilesIntoActiveJob(files, dirHandle.name);
      return;
    } catch (e) {
      if (e && e.name === "AbortError") return;
    }
  }
  const inp = document.getElementById("castep-opt-folder-upload");
  if (inp) inp.click();
}
window.pickCastepOpticsFolder = pickCastepOpticsFolder;

async function handleCastepOpticalFolderFallback(event) {
  const rawFiles = Array.from(event.target?.files || []);
  const files = rawFiles.filter(f => /\.(ome_bin|cst_ome|bands|cell|castep|xcd|csv|dat|txt)$/i.test(f.name));
  if (files.length) {
    const dirName = (files[0].webkitRelativePath || "").split("/")[0] || "Optical Folder";
    await ingestOpticalFilesIntoActiveJob(files, dirName);
  }
  event.target.value = "";
}
window.handleCastepOpticalFolderFallback = handleCastepOpticalFolderFallback;

function setCastepOpticalWindow(emaxEv) {
  const el = document.getElementById("castep-opt-emax");
  if (el) el.value = emaxEv;
  resetAllOptPanelZooms();
  renderCastepOpticalPlots();
}
window.setCastepOpticalWindow = setCastepOpticalWindow;

function populateCastepOpticalFileSelect(job) {
  const sel = document.getElementById("castep-opt-file-select");
  if (!sel) return;
  const list = Array.isArray(job?.optical_xcds) ? job.optical_xcds : (job?.optical_xcd ? [job.optical_xcd] : []);
  const sibs = Array.isArray(job?.sibling_optics) ? job.sibling_optics : [];
  let html = "";
  if (job?.optical_tensor) {
    const resName = job.optical_tensor.results_file || job.optics_castep_file || job.optical_tensor.source_file || "Optics.ome_bin";
    html += `<option value="tensor">⚡ ${escapeHtml(resName)} (Live 3×3 Tensor)</option>`;
  } else if (job?.ome_bin_file && (job?.optics_bands_file || job?.optics_bands)) {
    html += `<option value="tensor_lazy">⚡ ${escapeHtml(job.optics_castep_file || job.ome_bin_file)} (Load 3×3 Tensor)</option>`;
  }
  sibs.forEach((sb, idx) => {
    if (job?.optical_tensor?.sibling_folder === sb.folder) return;
    html += `<option value="sib:${idx}">📂 ${escapeHtml(sb.results_file)} (Sibling 3×3 Tensor)</option>`;
  });
  if (list.length > 0) {
    html += `<option value="auto">${html ? `Exported XCD (${list.length} file${list.length === 1 ? "" : "s"})` : `Auto (${list.length} optical file${list.length === 1 ? "" : "s"})`}</option>`;
    list.forEach((xcd, idx) => {
      const sNames = (xcd.series || []).map(s => s.name).filter(Boolean).join(", ");
      const label = `${xcd.filename || "Optical_" + (idx + 1) + ".xcd"}${sNames ? " [" + sNames + "]" : ""}`;
      html += `<option value="${idx}">${escapeHtml(label)}</option>`;
    });
  } else if (!html) {
    const bandsHint = job?.optics_castep_file || job?.optics_bands_file || (job?.optics_bands ? `${job.seed || "CASTEP"}_Optics.bands` : "");
    html += bandsHint
      ? `<option value="auto">📄 ${escapeHtml(bandsHint)} (JDOS — load *.ome_bin for 3D Polarized)</option>`
      : `<option value="auto">No Optical Results — click 📂 Optics Folder</option>`;
  }
  sel.innerHTML = html;

  const mode = document.getElementById("castep-opt-calc-mode")?.value || "unpolarized";
  const wrap = document.getElementById("castep-opt-vec-wrap");
  const lbl = document.getElementById("castep-opt-vec-label");
  if (lbl) lbl.textContent = mode === "polarized" ? "Polarization:" : "Incidence:";
  if (wrap) {
    wrap.style.opacity = mode === "polycrystalline" ? "0.42" : "1.0";
    wrap.style.pointerEvents = mode === "polycrystalline" ? "none" : "auto";
    wrap.querySelectorAll("input, button").forEach(el => { el.disabled = (mode === "polycrystalline"); });
  }
}

async function ingestOpticalFilesIntoActiveJob(files, folderLabel = "Imported Optical Files") {
  if (!files || !files.length) return;
  let job = (CASTEP_STUDIO_STATE.jobs || []).find(j => j.id === CASTEP_STUDIO_STATE.activeJobId);
  if (!job) {
    const seed = normalizeCastepSeedClient(files[0].name);
    job = enrichCastepJobSummary({
      id: "opt_import_" + Date.now(),
      title: `${seed} (${folderLabel})`,
      project: "Optical Analysis",
      material: seed,
      folder: folderLabel,
      seed,
      status: "Completed",
      files_list: files.map(f => f.name),
      optical_xcds: [],
      _hydrated: true
    });
    CASTEP_STUDIO_STATE.jobs.unshift(job);
    CASTEP_STUDIO_STATE.activeJobId = job.id;
  }
  if (!Array.isArray(job.optical_xcds)) job.optical_xcds = job.optical_xcd ? [job.optical_xcd] : [];

  let added = 0;
  let optCellText = job.cell_text || "";
  for (const f of files) {
    const low = f.name.toLowerCase();
    if (/(convergence|energies|band structure|density of states|pdos)/i.test(low) && low.endsWith(".xcd")) continue;
    if (low.endsWith(".ome_bin") || low.endsWith(".cst_ome")) {
      job._pendingOmeBuf = await f.arrayBuffer();
      job.ome_bin_file = f.name;
      added++;
    } else if (low.endsWith("_optics.bands") || (low.endsWith(".bands") && !low.endsWith("_bandstr.bands") && !low.endsWith("_dos.bands") && !job.optics_bands)) {
      const txt = await f.text();
      const b = parseCastepBandsTextClient(txt);
      if (b) { job.optics_bands = b; job.optics_bands_file = f.name; added++; }
    } else if (low.endsWith("_optics.cell") || (low.endsWith(".cell") && !optCellText)) {
      optCellText = await f.text();
      job.optics_cell_file = f.name;
      added++;
    } else if (low.endsWith("_optics.castep") || (low.endsWith(".castep") && !job.optics_castep_file)) {
      job.optics_castep_text = await f.text();
      job.optics_castep_file = f.name;
      added++;
    } else if (low.endsWith(".xcd")) {
      const txt = await f.text();
      const parsed = parseCastepXcdXmlClient(txt, false);
      if (parsed && parsed.series && parsed.series.length) {
        parsed.filename = f.name;
        job.optical_xcds.push(parsed);
        job.optical_xcd = job.optical_xcds[0];
        added++;
      }
    } else if (/\.(csv|dat|txt)$/i.test(low)) {
      const txt = await f.text();
      const parsedCsv = parseOpticalCsvTableClient(txt, f.name);
      if (parsedCsv) {
        job.optical_xcds.push(parsedCsv);
        job.optical_xcd = job.optical_xcds[0];
        added++;
      }
    }
  }

  if (job._pendingOmeBuf && job.optics_bands) {
    const tensor = parseCastepOmeBinArrayBuffer(
      job._pendingOmeBuf, job.optics_bands, optCellText, job.optics_castep_text || "",
      job.ome_bin_file || "Optics.ome_bin", job.optics_castep_file || job.optics_bands_file || job.ome_bin_file
    );
    if (tensor) {
      job.optical_tensor = tensor;
      delete job._pendingOmeBuf;
    }
  }

  // If user only picked *_Optics.castep without .ome_bin while local backend is connected, resolve matching .ome_bin on disk!
  if (!job.optical_tensor && !job._pendingOmeBuf && job.optics_castep_file && CASTEP_STUDIO_STATE.localBackendConnected) {
    const matchJob = (CASTEP_STUDIO_STATE.jobs || []).find(j =>
      j.folder && (j.files_list || []).some(fn => fn.toLowerCase() === job.optics_castep_file.toLowerCase()) &&
      (j.files_list || []).some(fn => /\.(ome_bin|cst_ome)$/i.test(fn))
    );
    if (matchJob) {
      const omeF = (matchJob.files_list || []).find(fn => /\.(ome_bin|cst_ome)$/i.test(fn));
      const bndF = (matchJob.files_list || []).find(fn => /_optics\.bands$/i.test(fn));
      if (omeF && bndF) {
        const apiBase = getCastepApiBase() || (["localhost", "127.0.0.1", "::1"].includes(window.location.hostname) ? "" : "http://127.0.0.1:8877");
        try {
          const resp = await fetch(`${apiBase}/api/castep/optics-tensor?folder=${encodeURIComponent(matchJob.folder)}&ome_file=${encodeURIComponent(omeF)}&bands_file=${encodeURIComponent(bndF)}`);
          if (resp.ok) {
            const data = await resp.json();
            if (data?.optical_tensor) job.optical_tensor = data.optical_tensor;
          }
        } catch (e) {}
      }
    }
  }

  job.has_optics = true;
  CASTEP_STUDIO_STATE._optSpectraCacheKey = "";
  populateCastepOpticalFileSelect(job);
  populateCastepPdosTargetSelect(job);
  attachMullikenSpinsToStructure(job);
  renderCastepJobsList();
  updateCastepKpiBar();
  renderCastepOpticalPlots();
  if (typeof showToast === "function") {
    const msg = job.optical_tensor
      ? `⚡ Loaded exact CASTEP 3×3 optical tensor from ${job.optical_tensor.results_file} (${job.optical_tensor.nk} k-pts, ${job.optical_tensor.nbands} bands) — Polarized, Unpolarized & Polycrystalline active!`
      : (job._pendingOmeBuf && !job.optics_bands
        ? "Loaded *.ome_bin! Please also select the matching *_Optics.bands file (or click 📂 Optics Folder)."
        : (job.optics_castep_file && !job.optical_tensor
          ? `Loaded ${job.optics_castep_file}. To enable live Polarized / Unpolarized / Polycrystalline switching, click 📂 Optics Folder (to load *_Optics.ome_bin + *_Optics.bands together).`
          : (added ? `🌈 Loaded ${added} optical data file(s) into analyzer!` : "No valid optical curves found in selected file(s).")));
    showToast(msg, job.optical_tensor ? "success" : "info");
  }
}

async function handleCastepOpticalFilesUpload(event) {
  const files = Array.from(event.target?.files || []);
  if (!files.length) return;
  await ingestOpticalFilesIntoActiveJob(files, "Imported Optical Files");
  event.target.value = "";
}
window.handleCastepOpticalFilesUpload = handleCastepOpticalFilesUpload;

function parseOpticalCsvTableClient(txt, filename) {
  const lines = (txt || "").replace(/\r\n/g, "\n").split("\n").map(l => l.trim()).filter(Boolean);
  if (lines.length < 4) return null;
  let headers = [];
  let startIdx = 0;
  if (/[a-zA-Z]/.test(lines[0])) {
    headers = lines[0].split(/[,\t;]+/).map(s => s.trim());
    startIdx = 1;
  }
  const cols = [];
  for (let i = startIdx; i < lines.length; i++) {
    const parts = lines[i].split(/[,\t;\s]+/).map(Number);
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      while (cols.length < parts.length) cols.push([]);
      for (let c = 0; c < parts.length; c++) cols[c].push(parts[c]);
    }
  }
  if (cols.length < 2 || cols[0].length < 4) return null;
  const xArr = cols[0];
  const series = [];
  for (let c = 1; c < cols.length; c++) {
    const name = headers[c] || (cols.length >= 3 ? (c === 1 ? "Re(Epsilon)" : (c === 2 ? "Im(Epsilon)" : `Col_${c}`)) : "Absorption");
    const seg = xArr.map((x, idx) => [x, cols[c][idx]]);
    series.push({ name, segments: [seg] });
  }
  return {
    filename,
    title: `Imported Optical Table (${filename})`,
    xLabel: headers[0] || "Frequency (eV)",
    yLabel: headers[1] || "Optical Spectrum",
    ticks: [],
    series
  };
}

function interpSortedXY(pts, x) {
  if (!pts || !pts.length) return 0;
  if (x <= pts[0][0]) return pts[0][1];
  if (x >= pts[pts.length - 1][0]) return pts[pts.length - 1][1];
  let lo = 0, hi = pts.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (pts[mid][0] <= x) lo = mid;
    else hi = mid;
  }
  const x0 = pts[lo][0], y0 = pts[lo][1];
  const x1 = pts[hi][0], y1 = pts[hi][1];
  const t = (x - x0) / ((x1 - x0) || 1e-12);
  return y0 + t * (y1 - y0);
}

// Exact Principal-Value Kramers-Kronig Integral:
//   f_re(w) = offset + (2/pi) * P * integral_0^{w_max} (w' * f_im(w')) / (w'^2 - w^2) dw'
function kramersKronigTransform(wGrid, fIm, offset = 1.0) {
  const N = wGrid.length;
  const out = new Array(N).fill(offset);
  for (let i = 0; i < N; i++) {
    const w = wGrid[i];
    let sum = 0.0;
    for (let j = 0; j < N - 1; j++) {
      const w0 = wGrid[j], w1 = wGrid[j + 1];
      const dw = w1 - w0;
      const wm = 0.5 * (w0 + w1);
      const fim = 0.5 * (fIm[j] + fIm[j + 1]);
      const denom = wm * wm - w * w;
      if (Math.abs(denom) > 1e-4) {
        sum += ((wm * fim) / denom) * dw;
      }
    }
    out[i] = offset + (2.0 / Math.PI) * sum;
  }
  return out;
}

// Solve full optical constants from a projected raw interband histogram using
// exact Levine-Allan Scissors shift, Instrumental Gaussian Smearing, full-range KK, and optional Drude term!
function solveOpticsFromRawHist(rawHist, dE, eMaxHist, hwGrid, smearingEv, scissorsEv, useDrude, plasmaEv, drudeDampEv, alphaConst) {
  const N = hwGrid.length;
  const emaxDisp = hwGrid[N - 1];
  const fullMax = Math.max(emaxDisp + 4.0, (eMaxHist || 60.0) + Math.max(0, scissorsEv) + 3.0 * smearingEv);
  const M = 560;
  const wFull = new Array(M);
  const e2Full = new Float64Array(M);
  const dwFull = (fullMax - 0.01) / (M - 1);
  for (let i = 0; i < M; i++) wFull[i] = 0.01 + dwFull * i;

  const sig = Math.max(0.02, smearingEv);
  const invNorm = 1.0 / (sig * Math.sqrt(2.0 * Math.PI));
  const inv2s2 = 1.0 / (2.0 * sig * sig);
  const cut = 5.0 * sig;

  for (let bi = 0; bi < rawHist.length; bi++) {
    const val = rawHist[bi];
    if (val <= 1e-12) continue;
    const eb = (bi + 0.5) * dE + scissorsEv;
    if (eb <= 0.01) continue;
    const i0 = Math.max(0, Math.floor((eb - cut - 0.01) / dwFull));
    const i1 = Math.min(M - 1, Math.ceil((eb + cut - 0.01) / dwFull));
    for (let i = i0; i <= i1; i++) {
      const diff = wFull[i] - eb;
      e2Full[i] += val * Math.exp(-diff * diff * inv2s2) * invNorm;
    }
  }

  const e1Full = kramersKronigTransform(wFull, e2Full, 1.0);
  const p1 = new Array(M), p2 = new Array(M);
  for (let i = 0; i < M; i++) {
    p1[i] = [wFull[i], e1Full[i]];
    p2[i] = [wFull[i], e2Full[i]];
  }

  const eps1 = new Array(N);
  const eps2 = new Array(N);
  const nArr = new Array(N);
  const kArr = new Array(N);
  const alphaCm = new Array(N);
  const wp2 = (useDrude && plasmaEv > 1e-6) ? (plasmaEv * plasmaEv) : 0.0;
  const gD = Math.max(0.005, drudeDampEv);

  for (let i = 0; i < N; i++) {
    const w = hwGrid[i];
    let e1 = interpSortedXY(p1, w);
    let e2 = Math.max(0, interpSortedXY(p2, w));
    if (wp2 > 0) {
      const denom = w * w + gD * gD;
      e1 -= wp2 / denom;
      e2 += (wp2 * gD) / (Math.max(0.01, w) * denom);
    }
    eps1[i] = e1;
    eps2[i] = e2;
    const modE = Math.hypot(e1, e2);
    nArr[i] = Math.sqrt(Math.max(0, (modE + e1) * 0.5));
    kArr[i] = Math.sqrt(Math.max(0, (modE - e1) * 0.5));
    alphaCm[i] = alphaConst * w * kArr[i];
  }
  return { eps1, eps2, nArr, kArr, alphaCm };
}

// Least-squares Tauc linear absorption edge fit on the FIRST fundamental absorption onset
function fitTaucLinearEdge(hwGrid, taucArr, fallbackEv) {
  const N = hwGrid.length;
  const globalMax = Math.max(...taucArr, 0);
  if (globalMax <= 1e-12) return { gapEv: fallbackEv || 0, slope: 0, intercept: 0, xStart: 0, xEnd: 0 };

  let firstPeakIdx = -1;
  const noiseFloor = globalMax * 0.008;
  for (let i = 2; i < N - 2; i++) {
    const e = hwGrid[i];
    if (e < 0.35) continue;
    if (e > 7.5 && firstPeakIdx !== -1) break;
    const v = taucArr[i];
    if (v >= noiseFloor && v >= taucArr[i - 1] && v >= taucArr[i + 1] && v >= taucArr[i - 2] && v >= taucArr[i + 2]) {
      firstPeakIdx = i;
      break;
    }
  }
  if (firstPeakIdx === -1) {
    firstPeakIdx = 1;
    for (let i = 1; i < N; i++) {
      if (hwGrid[i] <= 6.5 && taucArr[i] > taucArr[firstPeakIdx]) firstPeakIdx = i;
    }
  }

  const pkVal = taucArr[firstPeakIdx] || globalMax;
  let startIdx = firstPeakIdx;
  while (startIdx > 1 && taucArr[startIdx - 1] <= taucArr[startIdx] && taucArr[startIdx] > pkVal * 0.03) {
    startIdx--;
  }

  const loV = pkVal * 0.12;
  const hiV = pkVal * 0.72;
  const fitPts = [];
  for (let i = startIdx; i <= firstPeakIdx; i++) {
    if (taucArr[i] >= loV && taucArr[i] <= hiV && hwGrid[i] > 0.2) {
      fitPts.push([hwGrid[i], taucArr[i]]);
    }
  }
  if (fitPts.length < 3) return { gapEv: fallbackEv || 0, slope: 0, intercept: 0, xStart: 0, xEnd: 0 };

  let sx = 0, sy = 0, sxx = 0, sxy = 0;
  const n = fitPts.length;
  for (let i = 0; i < n; i++) {
    sx += fitPts[i][0];
    sy += fitPts[i][1];
    sxx += fitPts[i][0] * fitPts[i][0];
    sxy += fitPts[i][0] * fitPts[i][1];
  }
  const denom = n * sxx - sx * sx;
  if (Math.abs(denom) < 1e-12) return { gapEv: fallbackEv || 0, slope: 0, intercept: 0, xStart: 0, xEnd: 0 };
  const slope = (n * sxy - sx * sy) / denom;
  const intercept = (sy - slope * sx) / n;
  const rawGap = slope > 1e-6 ? (-intercept / slope) : (fallbackEv || 0);
  const gapEv = Math.max(0.0, Math.min(hwGrid[firstPeakIdx], rawGap));
  return { gapEv, slope, intercept, xStart: gapEv, xEnd: fitPts[n - 1][0] };
}

function computeCastepOpticalSpectra(job, includeAnisotropy = false) {
  if (!job) return null;
  const p = getOpticalUiParams();
  const { calcMode, vx, vy, vz, emax, smearingEv, scissorsEv, useDrude, plasmaEv, drudeDampEv, alphaConv, fileSelVal } = p;

  // Absorption conversion constant:
  //   Materials Studio CASTEP convention: alpha = 2*E*k / (h*c) = 16131.087 * E(eV) * k  [2k/lambda]
  //   Standard Physics / SI convention  : alpha = 4*pi*E*k / (h*c) = 101354.614 * E(eV) * k [4*pi*k/lambda]
  const ALPHA_CONST = alphaConv === "standard_si" ? 101354.614 : 16131.087;

  const allXcds = Array.isArray(job.optical_xcds) && job.optical_xcds.length
    ? job.optical_xcds
    : (job.optical_xcd ? [job.optical_xcd] : []);
  const wantTensor = !!(job.optical_tensor && (fileSelVal === "tensor" || (fileSelVal === "auto" && allXcds.length === 0)));

  const N = 360;
  const hwGrid = new Array(N);
  for (let i = 0; i < N; i++) hwGrid[i] = 0.02 + (emax - 0.02) * (i / (N - 1));

  let eps1 = new Array(N).fill(1.0);
  let eps2 = new Array(N).fill(0.0);
  let nArr = new Array(N).fill(1.0);
  let kArr = new Array(N).fill(0.0);
  let alphaCm = new Array(N).fill(0.0);
  let exactReflPts = null;
  let exactLossPts = null;
  let metaTitle = "";
  let sourceBadge = "";
  let geomLabel = formatOpticalGeomLabel(calcMode, vx, vy, vz);
  let isLiveTensor = false;
  let anisotropyData = null;

  if (wantTensor) {
    isLiveTensor = true;
    const T = job.optical_tensor;
    const projHist = projectOpticalTensor6(T.t6, calcMode, vx, vy, vz);
    const solved = solveOpticsFromRawHist(projHist, T.dE || 0.05, T.e_max || 80.0, hwGrid, smearingEv, scissorsEv, useDrude, plasmaEv, drudeDampEv, ALPHA_CONST);
    eps1 = solved.eps1; eps2 = solved.eps2; nArr = solved.nArr; kArr = solved.kArr; alphaCm = solved.alphaCm;
    sourceBadge = `Exact CASTEP 3×3 Tensor (${T.results_file || T.source_file})`;
    metaTitle = `${geomLabel} • Smearing ${smearingEv.toFixed(2)} eV • Scissors ${scissorsEv >= 0 ? "+" : ""}${scissorsEv.toFixed(2)} eV`;

    if (includeAnisotropy) {
      const solveDir = (m, x, y, z) => {
        const h = projectOpticalTensor6(T.t6, m, x, y, z);
        const wpDir = useDrude ? (plasmaEv > 0 ? plasmaEv : Math.sqrt(projectScalarTensor6(T.plasma_ev_tensor, m, x, y, z))) : 0;
        return solveOpticsFromRawHist(h, T.dE || 0.05, T.e_max || 80.0, hwGrid, smearingEv, scissorsEv, useDrude, wpDir, drudeDampEv, ALPHA_CONST);
      };
      anisotropyData = {
        polX: solveDir("polarized", 1, 0, 0),
        polY: solveDir("polarized", 0, 1, 0),
        polZ: solveDir("polarized", 0, 0, 1),
        unpolZ: solveDir("unpolarized", 0, 0, 1),
        poly: solveDir("polycrystalline", 0, 0, 1)
      };
    }
  } else {
    const selectedXcds = (fileSelVal !== "auto" && fileSelVal !== "tensor" && fileSelVal !== "tensor_lazy" && allXcds[Number(fileSelVal)])
      ? [allXcds[Number(fileSelVal)]]
      : allXcds;

    let exactEps1Pts = null, exactEps2Pts = null, exactAbsPts = null, exactNPts = null, exactKPts = null;
    const normalizeXcdPts = (pts, xLabel) => {
      const isNm = /nm|wavelength/i.test(xLabel || "");
      const clean = pts
        .map(pt => [isNm ? (1239.84193 / Math.max(1.0, pt[0])) : pt[0], pt[1]])
        .filter(pt => isFinite(pt[0]) && isFinite(pt[1]) && pt[0] > 0);
      clean.sort((a, b) => a[0] - b[0]);
      return clean;
    };

    for (const xcd of selectedXcds) {
      if (!metaTitle && xcd.title) metaTitle = xcd.title;
      const yLbl = (xcd.yLabel || "").toLowerCase();
      for (const ser of (xcd.series || [])) {
        const pts = ser.segments?.[0];
        if (!pts || pts.length < 4) continue;
        const sName = (ser.name || "").toLowerCase();
        const normPts = normalizeXcdPts(pts, xcd.xLabel);
        if (sName.includes("re(eps") || sName.includes("eps1") || (yLbl.includes("dielectric") && sName.includes("real"))) exactEps1Pts = normPts;
        else if (sName.includes("im(eps") || sName.includes("eps2") || (yLbl.includes("dielectric") && sName.includes("imag"))) exactEps2Pts = normPts;
        else if (sName.includes("absorp") || yLbl.includes("absorption")) exactAbsPts = normPts;
        else if (sName === "n" || sName.includes("refractive") || (yLbl.includes("refractive") && sName.includes("real"))) exactNPts = normPts;
        else if (sName === "k" || sName.includes("extinction") || (yLbl.includes("refractive") && sName.includes("imag"))) exactKPts = normPts;
        else if (sName.includes("reflectiv") || yLbl.includes("reflectiv")) exactReflPts = normPts;
        else if (sName.includes("loss") || yLbl.includes("loss")) exactLossPts = normPts;
      }
    }

    const hasExactDielectric = !!(exactEps1Pts && exactEps2Pts);
    const hasExactAbsorption = !!exactAbsPts;
    const hasExactNK = !!(exactNPts && exactKPts);
    const bandsForJdos = job.optics_bands || job.bandstr_bands || job.dos_bands || null;
    if (!hasExactDielectric && !hasExactAbsorption && !hasExactNK && !bandsForJdos) return null;

    // Extract baked-in Materials Studio geometry from XCD metadata if available
    const mGeom = (metaTitle || "").match(/Calculation geometry:\s*([^\n\\]+)/i);
    geomLabel = mGeom ? mGeom[1].trim() : "From Exported Spectrum (.xcd)";

    const wp2 = (useDrude && plasmaEv > 1e-6) ? (plasmaEv * plasmaEv) : 0.0;
    const gD = Math.max(0.005, drudeDampEv);

    if (hasExactDielectric) {
      sourceBadge = "Exact CASTEP Dielectric Function ε₁/ε₂ (.xcd)";
      if (Math.abs(scissorsEv) < 1e-6) {
        for (let i = 0; i < N; i++) {
          eps1[i] = interpSortedXY(exactEps1Pts, hwGrid[i]);
          eps2[i] = Math.max(0, interpSortedXY(exactEps2Pts, hwGrid[i]));
        }
      } else {
        const fullMax = Math.max(emax, exactEps2Pts[exactEps2Pts.length - 1][0] + Math.abs(scissorsEv));
        const M = 600;
        const wFull = new Array(M), e2Full = new Array(M);
        for (let i = 0; i < M; i++) {
          wFull[i] = 0.02 + (fullMax - 0.02) * (i / (M - 1));
          const shifted = wFull[i] - scissorsEv;
          e2Full[i] = shifted > 0.01 ? Math.max(0, interpSortedXY(exactEps2Pts, shifted)) : 0;
        }
        const e1Full = kramersKronigTransform(wFull, e2Full, 1.0);
        const pts1 = wFull.map((w, i) => [w, e1Full[i]]);
        const pts2 = wFull.map((w, i) => [w, e2Full[i]]);
        for (let i = 0; i < N; i++) {
          eps1[i] = interpSortedXY(pts1, hwGrid[i]);
          eps2[i] = interpSortedXY(pts2, hwGrid[i]);
        }
      }
      for (let i = 0; i < N; i++) {
        const w = hwGrid[i];
        if (wp2 > 0) {
          const den = w * w + gD * gD;
          eps1[i] -= wp2 / den;
          eps2[i] += (wp2 * gD) / (Math.max(0.01, w) * den);
        }
        const modE = Math.hypot(eps1[i], eps2[i]);
        nArr[i] = Math.sqrt(Math.max(0, (modE + eps1[i]) * 0.5));
        kArr[i] = Math.sqrt(Math.max(0, (modE - eps1[i]) * 0.5));
        alphaCm[i] = (exactAbsPts && Math.abs(scissorsEv) < 1e-6 && wp2 === 0 && alphaConv === "ms_castep")
          ? Math.max(0, interpSortedXY(exactAbsPts, w))
          : ALPHA_CONST * w * kArr[i];
      }
    } else if (hasExactNK) {
      sourceBadge = "Exact CASTEP Refractive Index n(ω), k(ω) (.xcd)";
      for (let i = 0; i < N; i++) {
        const w = Math.max(0.01, hwGrid[i] - scissorsEv);
        nArr[i] = Math.max(0, interpSortedXY(exactNPts, w));
        kArr[i] = Math.max(0, interpSortedXY(exactKPts, w));
        eps1[i] = nArr[i] * nArr[i] - kArr[i] * kArr[i];
        eps2[i] = 2.0 * nArr[i] * kArr[i];
        alphaCm[i] = ALPHA_CONST * hwGrid[i] * kArr[i];
      }
    } else if (hasExactAbsorption) {
      sourceBadge = "Exact CASTEP Absorption α(ω) (.xcd) + Full-Range Kramers–Kronig";
      const fullMax = Math.max(emax, exactAbsPts[exactAbsPts.length - 1][0]);
      const M = 600;
      const wFull = new Array(M), kFull = new Array(M);
      // Materials Studio Absorption .xcd is always in 2k/lambda units (16131.087 * E * k)!
      const msAlphaConst = 16131.087;
      for (let i = 0; i < M; i++) {
        const w = 0.02 + (fullMax - 0.02) * (i / (M - 1));
        wFull[i] = w;
        const wShift = w - scissorsEv;
        const aVal = wShift > 0.01 ? Math.max(0, interpSortedXY(exactAbsPts, wShift)) : 0;
        kFull[i] = aVal / (msAlphaConst * Math.max(0.05, w));
      }
      const nFull = kramersKronigTransform(wFull, kFull, 1.0);
      const nPtsKK = wFull.map((w, i) => [w, Math.max(0.01, nFull[i])]);
      for (let i = 0; i < N; i++) {
        const w = hwGrid[i];
        const wShift = w - scissorsEv;
        const rawA = wShift > 0.01 ? Math.max(0, interpSortedXY(exactAbsPts, wShift)) : 0;
        kArr[i] = rawA / (msAlphaConst * Math.max(0.05, w));
        nArr[i] = Math.max(0.01, interpSortedXY(nPtsKK, w));
        eps1[i] = nArr[i] * nArr[i] - kArr[i] * kArr[i];
        eps2[i] = 2.0 * nArr[i] * kArr[i];
        alphaCm[i] = ALPHA_CONST * w * kArr[i];
      }
    } else {
      sourceBadge = "Direct Interband JDOS from CASTEP .bands (Isotropic)";
      geomLabel = "Polycrystalline / Isotropic JDOS (Upload *.ome_bin for 3D Polarized/Unpolarized)";
      const kpts = bandsForJdos.kpoints || [];
      const M = 420;
      const fullMax = Math.max(emax, 24.0);
      const wFull = new Array(M), e2Full = new Array(M).fill(0);
      for (let i = 0; i < M; i++) wFull[i] = 0.02 + (fullMax - 0.02) * (i / (M - 1));
      const inv2Sig2 = 1.0 / (2.0 * smearingEv * smearingEv);
      const normG = 1.0 / (smearingEv * Math.sqrt(2.0 * Math.PI));
      const cellVol = getActiveStructureCellVolAndC().vol || 250.0;
      const prefactor = (400.0 / Math.max(50.0, cellVol)) * (bandsForJdos.ns === 2 ? 1.0 : 2.0);
      let wtSum = 0;
      kpts.forEach(kp => { wtSum += (kp.w || 1.0); });
      if (wtSum <= 0) wtSum = 1.0;
      for (const kp of kpts) {
        const wk = (kp.w || 1.0) / wtSum;
        for (const sp of (kp.e || [])) {
          const occ = [], unocc = [];
          for (let b = 0; b < sp.length; b++) {
            if (sp[b] <= 0.005) occ.push(sp[b]);
            else unocc.push(sp[b]);
          }
          for (let iv = 0; iv < occ.length; iv++) {
            for (let ic = 0; ic < unocc.length; ic++) {
              const dERaw = unocc[ic] - occ[iv];
              const dEShift = dERaw + scissorsEv;
              if (dERaw <= 0.05 || dEShift <= 0.05 || dEShift > fullMax + 3.0 * smearingEv) continue;
              const weight = (wk * prefactor) / (dERaw * dERaw);
              for (let g = 0; g < M; g++) {
                const diff = wFull[g] - dEShift;
                if (Math.abs(diff) < 3.5 * smearingEv) e2Full[g] += weight * Math.exp(-diff * diff * inv2Sig2) * normG;
              }
            }
          }
        }
      }
      const e1Full = kramersKronigTransform(wFull, e2Full, 1.0);
      const p1 = wFull.map((w, i) => [w, e1Full[i]]);
      const p2 = wFull.map((w, i) => [w, e2Full[i]]);
      for (let i = 0; i < N; i++) {
        const w = hwGrid[i];
        eps1[i] = interpSortedXY(p1, w);
        eps2[i] = Math.max(0, interpSortedXY(p2, w));
        if (wp2 > 0) {
          const den = w * w + gD * gD;
          eps1[i] -= wp2 / den;
          eps2[i] += (wp2 * gD) / (Math.max(0.01, w) * den);
        }
        const modE = Math.hypot(eps1[i], eps2[i]);
        nArr[i] = Math.sqrt(Math.max(0, (modE + eps1[i]) * 0.5));
        kArr[i] = Math.sqrt(Math.max(0, (modE - eps1[i]) * 0.5));
        alphaCm[i] = ALPHA_CONST * w * kArr[i];
      }
    }
  }

  // Derive exact Reflectivity R(w), Optical Conductivity sigma(w), EELS L(w), and Tauc curves
  const reflArr = new Array(N).fill(0.0);
  const cond1Arr = new Array(N).fill(0.0);
  const cond2Arr = new Array(N).fill(0.0);
  const lossArr = new Array(N).fill(0.0);
  const taucDirArr = new Array(N).fill(0.0);
  const taucIndArr = new Array(N).fill(0.0);

  let maxAlpha = 0, maxAlphaEv = 0;
  let maxEps2 = 0, maxEps2Ev = 0;
  let maxLoss = 0, maxLossEv = 0;

  for (let i = 0; i < N; i++) {
    const hw = hwGrid[i];
    const e1 = eps1[i], e2 = eps2[i], n = nArr[i], k = kArr[i];
    const R = (!isLiveTensor && exactReflPts && Math.abs(scissorsEv) < 1e-6 && !(useDrude && plasmaEv > 0))
      ? interpSortedXY(exactReflPts, hw)
      : ((n - 1) * (n - 1) + k * k) / (((n + 1) * (n + 1) + k * k) || 1e-12);
    reflArr[i] = Math.max(0, Math.min(1, R));

    const wFs = hw * 1.51926745;
    cond1Arr[i] = (wFs * e2) / (4.0 * Math.PI);
    cond2Arr[i] = -(wFs * (e1 - 1.0)) / (4.0 * Math.PI);

    const L = (!isLiveTensor && exactLossPts && Math.abs(scissorsEv) < 1e-6 && !(useDrude && plasmaEv > 0))
      ? interpSortedXY(exactLossPts, hw)
      : e2 / (e1 * e1 + e2 * e2 + 1e-9);
    lossArr[i] = L;

    const aNorm = alphaCm[i] / 10000.0;
    taucDirArr[i] = Math.pow(aNorm * hw, 2);
    taucIndArr[i] = Math.sqrt(Math.max(0, aNorm * hw));

    if (alphaCm[i] > maxAlpha) { maxAlpha = alphaCm[i]; maxAlphaEv = hw; }
    if (e2 > maxEps2) { maxEps2 = e2; maxEps2Ev = hw; }
    if (L > maxLoss) { maxLoss = L; maxLossEv = hw; }
  }

  const taucFitDirect = fitTaucLinearEdge(hwGrid, taucDirArr, job.bandGapEv || 0);
  const taucFitIndirect = fitTaucLinearEdge(hwGrid, taucIndArr, job.bandGapEv || 0);

  return {
    sourceBadge,
    metaTitle,
    geomLabel,
    isLiveTensor,
    params: p,
    anisotropyData,
    hwGrid, eps1, eps2, alphaCm, nArr, kArr, reflArr, cond1Arr, cond2Arr, lossArr, taucDirArr, taucIndArr,
    taucFitDirect, taucFitIndirect,
    metrics: {
      eps1Zero: eps1[0],
      nZero: nArr[0],
      maxAlpha, maxAlphaEv, maxAlphaNm: 1239.84193 / Math.max(0.05, maxAlphaEv),
      maxEps2, maxEps2Ev,
      maxLoss, maxLossEv,
      optGapEv: taucFitDirect.gapEv
    }
  };
}

function getOpticalAxisConfig(xAxisMode, hwGrid) {
  const fullEmax = hwGrid[hwGrid.length - 1];
  if (xAxisMode === "nm") {
    return {
      xVals: hwGrid.map(hw => 1239.84193 / Math.max(0.1, hw)),
      xTitle: "Wavelength λ (nm)",
      visStart: 380, visEnd: 750, reverseRainbow: true,
      evToX: (e) => 1239.84193 / Math.max(0.1, e),
      fmtTick: (v) => `${Math.round(v)}`
    };
  }
  if (xAxisMode === "cm-1") {
    const k = 8065.54429;
    return {
      xVals: hwGrid.map(hw => hw * k),
      xTitle: "Wavenumber ν̃ (cm⁻¹)",
      visStart: 1.65 * k, visEnd: 3.26 * k, reverseRainbow: false,
      evToX: (e) => e * k,
      fmtTick: (v) => v >= 10000 ? `${(v / 1000).toFixed(0)}k` : `${Math.round(v)}`
    };
  }
  if (xAxisMode === "thz") {
    const k = 241.798924;
    return {
      xVals: hwGrid.map(hw => hw * k),
      xTitle: "Frequency ν (THz)",
      visStart: 1.65 * k, visEnd: 3.26 * k, reverseRainbow: false,
      evToX: (e) => e * k,
      fmtTick: (v) => `${Math.round(v)}`
    };
  }
  return {
    xVals: hwGrid,
    xTitle: "Photon Energy ħω (eV)",
    visStart: 1.65, visEnd: 3.26, reverseRainbow: false,
    evToX: (e) => e,
    fmtTick: (v) => v.toFixed(1)
  };
}

function renderCastepOpticalPlots() {
  const canvas = document.getElementById("castep-optics-canvas");
  if (!canvas) return;
  const job = (CASTEP_STUDIO_STATE.jobs || []).find(j => j.id === CASTEP_STUDIO_STATE.activeJobId) || null;
  const prop = document.getElementById("castep-opt-property")?.value || "multigrid";
  const showVis = document.getElementById("castep-opt-show-vis")?.checked !== false;
  const p = getOpticalUiParams();
  const xAxisMode = p.xAxisMode;

  const parentW = canvas.parentElement ? (canvas.parentElement.clientWidth - 24) : 880;
  const width = Math.max(320, Math.floor(parentW));
  const height = 530;
  const dpr = getCastepCanvasDpr(width, height);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.scale(dpr, dpr);
  applyCrispCanvasQuality(ctx);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const needAniso = (prop === "anisotropy");
  const optCacheKey = [
    job?.id || "none", p.calcMode, p.vx, p.vy, p.vz,
    p.emax, p.smearingEv, p.scissorsEv, p.useDrude ? 1 : 0, p.plasmaEv, p.drudeDampEv, p.alphaConv,
    p.fileSelVal, (job?.optical_xcds || []).length, job?.optical_tensor ? "T" : "N", needAniso ? "A" : "S"
  ].join("|");

  let spec = CASTEP_STUDIO_STATE.lastOpticalSpectra;
  if (!spec || CASTEP_STUDIO_STATE._optSpectraCacheKey !== optCacheKey) {
    spec = computeCastepOpticalSpectra(job, needAniso);
    CASTEP_STUDIO_STATE.lastOpticalSpectra = spec;
    CASTEP_STUDIO_STATE._optSpectraCacheKey = optCacheKey;
  }

  const strip = document.getElementById("castep-optics-summary-strip");
  if (!spec) {
    if (strip) {
      strip.innerHTML = `<span><strong>Status:</strong> No optical spectra (<code>*.ome_bin</code>, <code>*Optical Properties*.xcd</code>, or <code>*_Optics.bands</code>) found in the active calculation.</span>`;
    }
    ctx.fillStyle = "#334155";
    ctx.font = "700 15px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("No CASTEP Optical Properties Data Loaded", width / 2, height / 2 - 14);
    ctx.fillStyle = "#64748b";
    ctx.font = "12.5px Inter, sans-serif";
    ctx.fillText("Click '📥 .ome_bin/.xcd' above to load CASTEP *.ome_bin + *_Optics.bands (full Polarized/Unpolarized/Polycrystalline analysis) or Optical .xcd files.", width / 2, height / 2 + 12);
    ctx.restore();
    return;
  }

  if (strip) {
    const m = spec.metrics;
    const drudeTag = (p.useDrude && p.plasmaEv > 0) ? ` • Drude ω<sub>p</sub>=${p.plasmaEv.toFixed(2)} eV` : "";
    strip.innerHTML = `
      <span style="color:#0369a1;"><strong>Source:</strong> ${escapeHtml(spec.sourceBadge)}</span>
      <span style="color:#047857;"><strong>Geometry:</strong> ${escapeHtml(spec.geomLabel)} • σ=${p.smearingEv.toFixed(2)} eV${Math.abs(p.scissorsEv) > 1e-4 ? ` • Δ=${p.scissorsEv >= 0 ? "+" : ""}${p.scissorsEv.toFixed(2)} eV` : ""}${drudeTag}</span>
      <span><strong>ε<sub>1</sub>(0):</strong> ${m.eps1Zero.toFixed(2)}</span>
      <span><strong>n(0):</strong> ${m.nZero.toFixed(2)}</span>
      <span><strong>α<sub>max</sub>:</strong> ${(m.maxAlpha / 1e4).toFixed(2)}×10<sup>4</sup> cm<sup>−1</sup> @ ${m.maxAlphaEv.toFixed(2)} eV</span>
      <span><strong>Plasmon ħω<sub>p</sub>:</strong> ${m.maxLossEv.toFixed(2)} eV (L=${m.maxLoss.toFixed(2)})</span>
      <span><strong>Tauc E<sub>g</sub><sup>opt</sup>:</strong> ${m.optGapEv.toFixed(2)} eV</span>
    `;
  }

  const fullEmax = spec.hwGrid[spec.hwGrid.length - 1];
  const axCfg = getOpticalAxisConfig(xAxisMode, spec.hwGrid);
  const xVals = axCfg.xVals;
  const xTitle = axCfg.xTitle;

  canvas._subPanelRects = [];

  function drawOpticalSubPanel(boxX, boxY, boxW, boxH, cfg) {
    const st = getCastepPlotStyle();
    const isCompactPanel = (prop === "multigrid");
    const fontScale = isCompactPanel ? 0.88 : 1.0;
    const outTickExtra = st.tickDir === "out" ? (st.tickLength || 5) + 1 : 0;

    const pKey = cfg.panelKey || "single";
    if (prop === "multigrid" || prop === "anisotropy") {
      canvas._subPanelRects.push({
        key: pKey,
        label: cfg.subLabel || cfg.title,
        x: boxX, y: boxY, w: boxW, h: boxH,
        plotKey: "optics",
        dataSubPart: cfg.dataSubPart || "all",
        pngName: cfg.pngName || `CASTEP_Optical_${pKey}.png`
      });
    }
    const pz = (CASTEP_STUDIO_STATE.optPanelZooms && CASTEP_STUDIO_STATE.optPanelZooms[pKey]) || { emin: 0, emax: null, nmMin: 180, nmMax: 1100, yScale: 1.0 };
    let xMin = 0, xMax = axCfg.evToX(fullEmax);
    if (xAxisMode === "nm") {
      xMin = pz.nmMin !== undefined ? pz.nmMin : 180;
      xMax = pz.nmMax !== undefined ? pz.nmMax : 1100;
      if (xMax <= xMin + 20) { xMin = 180; xMax = 1100; }
    } else {
      const e0 = (pz.emin !== undefined && pz.emin !== null) ? pz.emin : 0;
      const e1 = (pz.emax !== undefined && pz.emax !== null) ? pz.emax : fullEmax;
      const useE0 = (e1 <= e0 + 0.12) ? 0 : e0;
      const useE1 = (e1 <= e0 + 0.12) ? fullEmax : e1;
      xMin = axCfg.evToX(useE0);
      xMax = axCfg.evToX(useE1);
    }

    const fullSpanX = xAxisMode === "nm" ? 920 : Math.max(0.1, axCfg.evToX(fullEmax));
    const isZoomedX = (xMax - xMin) < fullSpanX * 0.985;
    const zoomFactorDisp = fullSpanX / Math.max(1e-6, xMax - xMin);
    const isActiveSub = prop === "multigrid" && CASTEP_STUDIO_STATE.activeOptPanel === pKey && !window._castepExportHideSelection;

    const hasRightAxis = cfg.series.some(s => s.axis === "right");
    const multiRowLegend = cfg.series.length >= 3;
    const extraTickPad = Math.max(0, (st.tickSize - 12) * 1.6);
    const padL = Math.round(58 + extraTickPad + outTickExtra);
    const padR = hasRightAxis ? Math.round(52 + extraTickPad + outTickExtra) : 18;
    const padT = Math.round((multiRowLegend ? 46 : 30) + Math.max(0, st.titleSize - 14));
    const padB = Math.round(38 + Math.max(0, (st.tickSize - 12) * 1.2 + (st.axisLabelSize - 13) * 1.1) + outTickExtra);
    const pw = Math.max(60, boxW - padL - padR);
    const ph = Math.max(50, boxH - padT - padB);
    const px0 = boxX + padL;
    const py0 = boxY + padT;

    if (isActiveSub) {
      ctx.save();
      ctx.fillStyle = "rgba(239, 246, 255, 0.28)";
      ctx.fillRect(boxX + 2, boxY + 2, boxW - 4, boxH - 4);
      ctx.strokeStyle = "rgba(37, 99, 235, 0.40)";
      ctx.lineWidth = 1.2;
      ctx.strokeRect(boxX + 2.5, boxY + 2.5, boxW - 5, boxH - 5);
      ctx.restore();
    }

    const computeYRange = (seriesList, yMinForced, yMaxForced) => {
      let yMin = yMinForced !== undefined ? yMinForced : 0;
      let yMax = -1e9;
      seriesList.forEach(s => {
        for (let i = 0; i < xVals.length; i++) {
          const xv = xVals[i];
          if (xv >= xMin && xv <= xMax) {
            const yv = s.values[i];
            if (isFinite(yv)) {
              if (yv < yMin && yMinForced === undefined) yMin = yv;
              if (yv > yMax) yMax = yv;
            }
          }
        }
      });
      if (!isFinite(yMax) || yMax <= yMin) yMax = yMin + 1.0;
      if (yMaxForced !== undefined) yMax = Math.max(yMax, yMaxForced);
      const yScaleFactor = Number(pz.yScale) || 1.0;
      const ySpan = (yMax - yMin) / yScaleFactor;
      yMax = yMin + ySpan * 1.08;
      if (yMin < 0) yMin -= ySpan * 0.05;
      return { yMin, yMax };
    };

    const leftSeries = cfg.series.filter(s => s.axis !== "right");
    const rightSeries = cfg.series.filter(s => s.axis === "right");
    const leftR = computeYRange(leftSeries, cfg.yMinForced, cfg.yMaxForced);
    const rightR = rightSeries.length ? computeYRange(rightSeries, 0, undefined) : null;

    const toX = (x) => px0 + ((x - xMin) / ((xMax - xMin) || 1)) * pw;
    const toYLeft = (y) => py0 + ph * (1 - (y - leftR.yMin) / ((leftR.yMax - leftR.yMin) || 1));
    const toYRight = (y) => rightR ? py0 + ph * (1 - (y - rightR.yMin) / ((rightR.yMax - rightR.yMin) || 1)) : toYLeft(y);

    const yTickVals = [0, 1, 2, 3, 4].map(g => leftR.yMin + (leftR.yMax - leftR.yMin) * (g / 4));
    const yTickPx = yTickVals.map(v => toYLeft(v));
    const xTickVals = [0, 1, 2, 3, 4, 5].map(g => xMin + (xMax - xMin) * (g / 5));
    const xTickPx = xTickVals.map(v => toX(v));
    const rTickVals = rightR ? [0, 1, 2, 3, 4].map(g => rightR.yMin + (rightR.yMax - rightR.yMin) * (g / 4)) : [];
    const rTickPx = rightR ? rTickVals.map(v => toYRight(v)) : [];

    ctx.save();
    ctx.beginPath();
    ctx.rect(px0, py0, pw, ph);
    ctx.clip();

    if (showVis) {
      const vx1 = toX(axCfg.visStart), vx2 = toX(axCfg.visEnd);
      if (vx2 > px0 && vx1 < px0 + pw) {
        const grad = ctx.createLinearGradient(vx1, py0, vx2, py0);
        if (axCfg.reverseRainbow) {
          grad.addColorStop(0.0, "rgba(147, 51, 234, 0.14)");
          grad.addColorStop(0.25, "rgba(37, 99, 235, 0.14)");
          grad.addColorStop(0.5, "rgba(22, 163, 74, 0.14)");
          grad.addColorStop(0.75, "rgba(234, 179, 8, 0.14)");
          grad.addColorStop(1.0, "rgba(220, 38, 38, 0.14)");
        } else {
          grad.addColorStop(0.0, "rgba(220, 38, 38, 0.14)");
          grad.addColorStop(0.25, "rgba(234, 179, 8, 0.14)");
          grad.addColorStop(0.5, "rgba(22, 163, 74, 0.14)");
          grad.addColorStop(0.75, "rgba(37, 99, 235, 0.14)");
          grad.addColorStop(1.0, "rgba(147, 51, 234, 0.14)");
        }
        ctx.fillStyle = grad;
        ctx.fillRect(vx1, py0, vx2 - vx1, ph);
      }
    }

    drawPubGridLines(ctx, px0, py0, pw, ph, st, xTickPx, yTickPx);

    if (leftR.yMin < 0 && leftR.yMax > 0) {
      const y0 = Math.round(toYLeft(0)) + 0.5;
      ctx.beginPath(); ctx.moveTo(px0, y0); ctx.lineTo(px0 + pw, y0);
      ctx.setLineDash([4, 3]); ctx.strokeStyle = st.inkColor; ctx.lineWidth = Math.max(0.9, st.borderWidth * 0.6); ctx.stroke(); ctx.setLineDash([]);
    }

    const lwScale = st.lineWidth / 1.8;
    cfg.series.forEach(s => {
      const toY = s.axis === "right" ? toYRight : toYLeft;
      const pts = [];
      for (let i = 0; i < xVals.length; i++) {
        const xv = xVals[i];
        if (xv >= xMin && xv <= xMax) pts.push([xv, s.values[i]]);
      }
      pts.sort((a, b) => a[0] - b[0]);
      if (!pts.length) return;
      if (s.fillAlpha) {
        ctx.beginPath();
        ctx.moveTo(toX(pts[0][0]), toY(0));
        pts.forEach(pt => ctx.lineTo(toX(pt[0]), toY(pt[1])));
        ctx.lineTo(toX(pts[pts.length - 1][0]), toY(0));
        ctx.closePath();
        ctx.fillStyle = s.fillAlpha;
        ctx.fill();
      }
      ctx.beginPath();
      pts.forEach((pt, idx) => {
        const sx = toX(pt[0]), sy = toY(pt[1]);
        if (idx === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
      });
      ctx.strokeStyle = s.color;
      ctx.lineWidth = Math.max(0.8, (s.width || 1.8) * lwScale);
      if (s.dashed) ctx.setLineDash([5, 3]); else ctx.setLineDash([]);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    if (cfg.taucFit && cfg.taucFit.slope > 0 && xAxisMode === "ev") {
      const tf = cfg.taucFit;
      const x1 = tf.xStart, y1 = 0;
      const x2 = tf.xEnd, y2 = tf.slope * x2 + tf.intercept;
      ctx.beginPath();
      ctx.moveTo(toX(x1), toYLeft(y1));
      ctx.lineTo(toX(x2), toYLeft(y2));
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = "#dc2626";
      ctx.lineWidth = Math.max(1.2, st.lineWidth);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(toX(x1), toYLeft(0), 4.5, 0, Math.PI * 2);
      ctx.fillStyle = "#dc2626";
      ctx.fill();
    }
    ctx.restore();

    // Crisp unified publication frame + ticks ON TOP of optical curves
    drawPubAxisBox(ctx, px0, py0, pw, ph, st, {
      compact: isCompactPanel,
      xTicks: xTickPx,
      yTicks: yTickPx,
      rightYTicks: hasRightAxis ? rTickPx : [],
      mirrorTop: true,
      mirrorRight: !hasRightAxis
    });

    ctx.fillStyle = isActiveSub ? "#1d4ed8" : st.inkColor;
    ctx.font = castepPlotFont("title", fontScale);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    drawSciText(ctx, cfg.title, px0, boxY + (multiRowLegend ? 16 : padT - 9));
    if (isZoomedX || (Number(pz.yScale) || 1.0) > 1.05) {
      const zTxt = `🔍 ${zoomFactorDisp.toFixed(1)}×`;
      ctx.save();
      ctx.font = castepPlotFont("legend", 0.85, "bold");
      const tw = ctx.measureText(zTxt).width + 10;
      ctx.fillStyle = "rgba(37, 99, 235, 0.12)";
      ctx.strokeStyle = "rgba(37, 99, 235, 0.45)";
      ctx.lineWidth = 1;
      ctx.fillRect(px0 + 6, py0 + 6, tw, 16);
      ctx.strokeRect(px0 + 6, py0 + 6, tw, 16);
      ctx.fillStyle = "#1d4ed8";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(zTxt, px0 + 11, py0 + 14);
      ctx.restore();
    }

    const legY = multiRowLegend ? (boxY + padT - 8) : (boxY + padT - 9);
    ctx.font = castepPlotFont("legend", fontScale, st.boldAxes ? "bold" : "");
    ctx.textBaseline = "alphabetic";
    if (multiRowLegend) {
      let lx = px0;
      ctx.textAlign = "left";
      for (let i = 0; i < cfg.series.length; i++) {
        const s = cfg.series[i];
        ctx.fillStyle = s.color;
        const lbl = `● ${s.label}`;
        drawSciText(ctx, lbl, lx, legY);
        lx += measureSciText(ctx, lbl) + 10;
      }
    } else {
      let lx = px0 + pw;
      ctx.textAlign = "right";
      for (let i = cfg.series.length - 1; i >= 0; i--) {
        const s = cfg.series[i];
        ctx.fillStyle = s.color;
        const lbl = `● ${s.label}`;
        drawSciText(ctx, lbl, lx, legY);
        lx -= measureSciText(ctx, lbl) + 10;
      }
    }

    ctx.fillStyle = hasRightAxis ? (leftSeries[0]?.color || st.inkColor) : st.inkColor;
    ctx.font = castepPlotFont("tick", fontScale);
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    yTickVals.forEach(yVal => {
      const fmt = Math.abs(leftR.yMax) >= 100 ? Math.round(yVal).toString() : (Math.abs(leftR.yMax) <= 2 ? yVal.toFixed(2) : yVal.toFixed(1));
      ctx.fillText(formatPubMinus(fmt), px0 - 6 - outTickExtra, toYLeft(yVal));
    });

    if (rightR) {
      ctx.fillStyle = rightSeries[0]?.color || "#be123c";
      ctx.textAlign = "left";
      rTickVals.forEach(yVal => {
        const fmt = Math.abs(rightR.yMax) >= 100 ? Math.round(yVal).toString() : yVal.toFixed(2);
        ctx.fillText(formatPubMinus(fmt), px0 + pw + 6 + outTickExtra, toYRight(yVal));
      });
    }

    ctx.fillStyle = st.inkColor;
    ctx.font = castepPlotFont("tick", fontScale);
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const txY = py0 + ph + 5 + outTickExtra;
    xTickVals.forEach(xVal => {
      ctx.fillText(formatPubMinus(axCfg.fmtTick(xVal)), toX(xVal), txY);
    });
    ctx.font = castepPlotFont("axis", fontScale);
    ctx.fillStyle = st.inkColor;
    drawSciText(ctx, xTitle, px0 + pw / 2, txY + Math.round(st.tickSize * fontScale) + 4);
  }

  const alpha10k = spec.alphaCm.map(v => v / 1e4);

  if (prop === "multigrid") {
    const hw = Math.floor(width / 2);
    const hh = Math.floor(height / 2);
    drawOpticalSubPanel(0, 0, hw, hh, {
      panelKey: "a", title: "(a) Dielectric ε(ω)", subLabel: "Panel (a) Dielectric ε(ω)",
      dataSubPart: "dielectric", pngName: "CASTEP_Optical_a_Dielectric.png",
      series: [
        { label: "ε_{1} Real", values: spec.eps1, color: "#2563eb", width: 2.0 },
        { label: "ε_{2} Imag", values: spec.eps2, color: "#dc2626", width: 2.0, fillAlpha: "rgba(220,38,38,0.08)" }
      ]
    });
    drawOpticalSubPanel(hw, 0, width - hw, hh, {
      panelKey: "b", title: "(b) Absorption α (×10^{4} cm^{-1})", subLabel: "Panel (b) Absorption α",
      dataSubPart: "absorption", pngName: "CASTEP_Optical_b_Absorption.png",
      yMinForced: 0,
      series: [
        { label: "α(ω)", values: alpha10k, color: "#0284c7", width: 2.2, fillAlpha: "rgba(2,132,199,0.12)" }
      ]
    });
    drawOpticalSubPanel(0, hh, hw, height - hh, {
      panelKey: "c", title: "(c) Refractive n & k", subLabel: "Panel (c) Refractive n & k",
      dataSubPart: "refractive", pngName: "CASTEP_Optical_c_Refractive.png",
      yMinForced: 0,
      series: [
        { label: "n(ω)", values: spec.nArr, color: "#16a34a", width: 2.0 },
        { label: "k(ω)", values: spec.kArr, color: "#ea580c", width: 2.0, dashed: true }
      ]
    });
    drawOpticalSubPanel(hw, hh, width - hw, height - hh, {
      panelKey: "d", title: "(d) Reflectivity R & EELS L", subLabel: "Panel (d) Reflectivity R & EELS L",
      dataSubPart: "rlc", pngName: "CASTEP_Optical_d_Reflectivity_EELS.png",
      yMinForced: 0,
      series: [
        { label: "R (Left)", values: spec.reflArr, color: "#7c3aed", width: 2.0, axis: "left" },
        { label: "L (Right)", values: spec.lossArr, color: "#be123c", width: 2.0, axis: "right", fillAlpha: "rgba(190,18,60,0.08)" }
      ]
    });
  } else if (prop === "anisotropy") {
    if (!spec.anisotropyData) {
      ctx.fillStyle = "#334155"; ctx.font = "700 14.5px Inter, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("Anisotropy Comparison Requires CASTEP *.ome_bin 3×3 Optical Tensor", width / 2, height / 2 - 12);
      ctx.fillStyle = "#64748b"; ctx.font = "12px Inter, sans-serif";
      ctx.fillText("Select a calculation with *_Optics.ome_bin (or upload *.ome_bin + *_Optics.bands) to compare Polarized [100]/[010]/[001], Unpolarized, and Polycrystalline.", width / 2, height / 2 + 12);
    } else {
      const A = spec.anisotropyData;
      const hw = Math.floor(width / 2);
      drawOpticalSubPanel(0, 0, hw, height, {
        panelKey: "a", title: "(a) Dielectric ε_{2}(ω) Optical Anisotropy", subLabel: "Panel (a) Dielectric ε₂ Anisotropy",
        dataSubPart: "anisotropy", pngName: "CASTEP_Optical_Anisotropy_Eps2.png",
        yMinForced: 0,
        series: [
          { label: "Pol [100]", values: A.polX.eps2, color: "#2563eb", width: 2.0 },
          { label: "Pol [010]", values: A.polY.eps2, color: "#16a34a", width: 1.8, dashed: true },
          { label: "Pol [001]", values: A.polZ.eps2, color: "#dc2626", width: 2.1 },
          { label: "Unpol (001)", values: A.unpolZ.eps2, color: "#9333ea", width: 1.8, dashed: true },
          { label: "Polycryst.", values: A.poly.eps2, color: "#0f172a", width: 2.1 }
        ]
      });
      drawOpticalSubPanel(hw, 0, width - hw, height, {
        panelKey: "b", title: "(b) Absorption α(ω) (×10^{4} cm^{-1}) Anisotropy", subLabel: "Panel (b) Absorption α Anisotropy",
        dataSubPart: "anisotropy", pngName: "CASTEP_Optical_Anisotropy_Alpha.png",
        yMinForced: 0,
        series: [
          { label: "Pol [100]", values: A.polX.alphaCm.map(v => v / 1e4), color: "#2563eb", width: 2.0 },
          { label: "Pol [010]", values: A.polY.alphaCm.map(v => v / 1e4), color: "#16a34a", width: 1.8, dashed: true },
          { label: "Pol [001]", values: A.polZ.alphaCm.map(v => v / 1e4), color: "#dc2626", width: 2.1 },
          { label: "Unpol (001)", values: A.unpolZ.alphaCm.map(v => v / 1e4), color: "#9333ea", width: 1.8, dashed: true },
          { label: "Polycryst.", values: A.poly.alphaCm.map(v => v / 1e4), color: "#0f172a", width: 2.1 }
        ]
      });
    }
  } else if (prop === "absorption") {
    drawOpticalSubPanel(0, 0, width, height, {
      title: `CASTEP Absorption α(ω) (×10^{4} cm^{-1}) — ${spec.geomLabel}`,
      yMinForced: 0,
      series: [{ label: "α(ω) (×10^{4} cm^{-1})", values: alpha10k, color: "#0284c7", width: 2.4, fillAlpha: "rgba(2,132,199,0.14)" }]
    });
  } else if (prop === "dielectric") {
    drawOpticalSubPanel(0, 0, width, height, {
      title: `CASTEP Dielectric Function ε_{1}(ω) & ε_{2}(ω) — ${spec.geomLabel}`,
      series: [
        { label: "ε_{1}(ω) Real", values: spec.eps1, color: "#2563eb", width: 2.3 },
        { label: "ε_{2}(ω) Imag", values: spec.eps2, color: "#dc2626", width: 2.3, fillAlpha: "rgba(220,38,38,0.10)" }
      ]
    });
  } else if (prop === "refractive") {
    drawOpticalSubPanel(0, 0, width, height, {
      title: `CASTEP Refractive Index n(ω) & Extinction k(ω) — ${spec.geomLabel}`,
      yMinForced: 0,
      series: [
        { label: "n(ω)", values: spec.nArr, color: "#16a34a", width: 2.3 },
        { label: "k(ω)", values: spec.kArr, color: "#ea580c", width: 2.3, fillAlpha: "rgba(234,88,12,0.10)" }
      ]
    });
  } else if (prop === "reflectivity") {
    drawOpticalSubPanel(0, 0, width, height, {
      title: `CASTEP Optical Reflectivity R(ω) — ${spec.geomLabel}`,
      yMinForced: 0,
      series: [{ label: "Reflectivity R(ω)", values: spec.reflArr, color: "#7c3aed", width: 2.4, fillAlpha: "rgba(124,58,237,0.12)" }]
    });
  } else if (prop === "conductivity") {
    drawOpticalSubPanel(0, 0, width, height, {
      title: `CASTEP Optical Conductivity σ_{1}(ω) & σ_{2}(ω) (1/fs) — ${spec.geomLabel}`,
      series: [
        { label: "Re[σ(ω)] (1/fs)", values: spec.cond1Arr, color: "#0f766e", width: 2.3, fillAlpha: "rgba(15,118,110,0.12)" },
        { label: "Im[σ(ω)] (1/fs)", values: spec.cond2Arr, color: "#b45309", width: 2.0, dashed: true }
      ]
    });
  } else if (prop === "loss") {
    drawOpticalSubPanel(0, 0, width, height, {
      title: `CASTEP Loss Function (EELS) L(ω) = Im[−1/ε(ω)] — ${spec.geomLabel}`,
      yMinForced: 0,
      series: [{ label: "EELS Loss L(ω)", values: spec.lossArr, color: "#be123c", width: 2.4, fillAlpha: "rgba(190,18,60,0.14)" }]
    });
  } else if (prop === "tauc") {
    drawOpticalSubPanel(0, 0, width, height, {
      title: `Tauc Plot Optical Gap Fit (Direct E_{g} ≈ ${spec.taucFitDirect.gapEv.toFixed(2)} eV | Indirect ≈ ${spec.taucFitIndirect.gapEv.toFixed(2)} eV)`,
      yMinForced: 0,
      taucFit: spec.taucFitDirect,
      series: [
        { label: "Direct (αħω)^{2}", values: spec.taucDirArr, color: "#2563eb", width: 2.3, axis: "left" },
        { label: "Indirect (αħω)^{1/2} (Right)", values: spec.taucIndArr, color: "#16a34a", width: 2.0, dashed: true, axis: "right" }
      ]
    });
  }

  ctx.restore();
}
window.renderCastepOpticalPlots = renderCastepOpticalPlots;

function initCastepOpticsCanvasHover() {
  const canvas = document.getElementById("castep-optics-canvas");
  if (!canvas || canvas._opticsHoverBound) return;
  canvas._opticsHoverBound = true;
  canvas.addEventListener("mousemove", (e) => {
    const readout = document.getElementById("castep-optics-readout");
    const spec = CASTEP_STUDIO_STATE.lastOpticalSpectra;
    if (!readout || !spec || !spec.hwGrid.length) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const prop = document.getElementById("castep-opt-property")?.value || "multigrid";
    const xAxisMode = document.getElementById("castep-opt-xaxis")?.value || "ev";
    const isSplit = (prop === "multigrid" || prop === "anisotropy");
    const pKey = getOptPanelKeyAtClientPos(canvas, e.clientX, e.clientY);
    const hwPanelW = isSplit ? (rect.width / 2) : rect.width;
    const localX = isSplit ? (mx % hwPanelW) : mx;
    const padL = 54, padR = (prop === "multigrid" && pKey === "d") ? 48 : 16;
    const pw = hwPanelW - padL - padR;
    const frac = Math.max(0, Math.min(1, (localX - padL) / (pw || 1)));
    const pz = (CASTEP_STUDIO_STATE.optPanelZooms && CASTEP_STUDIO_STATE.optPanelZooms[pKey]) || {};
    let targetE = 0;
    if (xAxisMode === "nm") {
      const nmMin = pz.nmMin !== undefined ? pz.nmMin : 180;
      const nmMax = pz.nmMax !== undefined ? pz.nmMax : 1100;
      const lamCur = nmMin + frac * (nmMax - nmMin);
      targetE = 1239.84193 / Math.max(10, lamCur);
    } else {
      const eMin = pz.emin || 0;
      const eMax = pz.emax || spec.hwGrid[spec.hwGrid.length - 1];
      targetE = eMin + frac * (eMax - eMin);
    }
    let idx = 0, bestD = 1e9;
    for (let i = 0; i < spec.hwGrid.length; i++) {
      const d = Math.abs(spec.hwGrid[i] - targetE);
      if (d < bestD) { bestD = d; idx = i; }
    }
    const hw = spec.hwGrid[idx];
    const lam = 1239.84193 / Math.max(0.05, hw);
    const wn = Math.round(hw * 8065.54429);
    const thz = (hw * 241.798924).toFixed(0);
    readout.innerHTML =
      `Cursor: <strong>ħω = ${hw.toFixed(2)} eV</strong> (λ = <strong>${Math.round(lam)} nm</strong>, ν̃ = <strong>${wn.toLocaleString()} cm<sup>−1</sup></strong>, ${thz} THz) • ` +
      `ε<sub>1</sub> = <strong>${spec.eps1[idx].toFixed(2)}</strong>, ε<sub>2</sub> = <strong>${spec.eps2[idx].toFixed(2)}</strong> • ` +
      `α = <strong>${Math.round(spec.alphaCm[idx]).toLocaleString()} cm<sup>−1</sup></strong> • ` +
      `n = <strong>${spec.nArr[idx].toFixed(2)}</strong>, k = <strong>${spec.kArr[idx].toFixed(2)}</strong> • ` +
      `R = <strong>${(spec.reflArr[idx] * 100).toFixed(1)}%</strong>, L = <strong>${spec.lossArr[idx].toFixed(3)}</strong>`;
  });
}

function buildOpticalExportTables() {
  const job = (CASTEP_STUDIO_STATE.jobs || []).find(j => j.id === CASTEP_STUDIO_STATE.activeJobId) || {};
  const spec = computeCastepOpticalSpectra(job, !!job.optical_tensor);
  if (!spec) return null;

  const seed = sanitizeExportSeed(job.seed || CASTEP_STUDIO_STATE.structure?.formula || "CASTEP");
  const tfDir = spec.taucFitDirect || {};
  const tfInd = spec.taucFitIndirect || {};
  const m = spec.metrics || {};
  const p = spec.params || getOpticalUiParams();

  const fullHeaders = [
    "Photon_Energy_eV", "Wavelength_nm", "Wavenumber_cm-1", "Frequency_THz",
    "Eps1_Real", "Eps2_Imag",
    "Absorption_cm-1", "Absorption_x1e4_cm-1",
    "Refractive_Index_n", "Extinction_Coeff_k",
    "Reflectivity_R", "Reflectivity_Pct",
    "Conductivity_Re_1_fs", "Conductivity_Im_1_fs",
    "EELS_Loss_L",
    "Tauc_Direct_ahv2", "Tauc_Direct_Fit",
    "Tauc_Indirect_ahv0.5", "Tauc_Indirect_Fit"
  ];
  const fullRows = [], dielRows = [], absRows = [], nkRows = [], rlcRows = [];

  for (let i = 0; i < spec.hwGrid.length; i++) {
    const hw = Number(spec.hwGrid[i].toFixed(5));
    const nm = Number((1239.84193 / Math.max(0.01, hw)).toFixed(3));
    const wn = Number((hw * 8065.54429).toFixed(2));
    const thz = Number((hw * 241.798924).toFixed(3));
    const e1 = Number((spec.eps1[i] || 0).toFixed(6));
    const e2 = Number((spec.eps2[i] || 0).toFixed(6));
    const al = Number((spec.alphaCm[i] || 0).toFixed(3));
    const al4 = Number(((spec.alphaCm[i] || 0) / 1e4).toFixed(6));
    const nv = Number((spec.nArr[i] || 0).toFixed(6));
    const kv = Number((spec.kArr[i] || 0).toFixed(6));
    const rv = Number((spec.reflArr[i] || 0).toFixed(6));
    const rpct = Number(((spec.reflArr[i] || 0) * 100).toFixed(4));
    const c1 = Number((spec.cond1Arr[i] || 0).toFixed(6));
    const c2 = Number((spec.cond2Arr[i] || 0).toFixed(6));
    const lv = Number((spec.lossArr[i] || 0).toFixed(6));
    const td = Number((spec.taucDirArr?.[i] || 0).toFixed(6));
    const ti = Number((spec.taucIndArr?.[i] || 0).toFixed(6));
    const tdFit = (tfDir.slope > 0 && hw >= tfDir.xStart && hw <= tfDir.xEnd) ? Number(Math.max(0, tfDir.slope * hw + tfDir.intercept).toFixed(6)) : "";
    const tiFit = (tfInd.slope > 0 && hw >= tfInd.xStart && hw <= tfInd.xEnd) ? Number(Math.max(0, tfInd.slope * hw + tfInd.intercept).toFixed(6)) : "";

    fullRows.push([hw, nm, wn, thz, e1, e2, al, al4, nv, kv, rv, rpct, c1, c2, lv, td, tdFit, ti, tiFit]);
    dielRows.push([hw, nm, wn, e1, e2]);
    absRows.push([hw, nm, wn, al, al4, td, tdFit, ti, tiFit]);
    nkRows.push([hw, nm, wn, nv, kv]);
    rlcRows.push([hw, nm, wn, rv, rpct, lv, c1, c2]);
  }

  const summarySheet = {
    name: "Summary_Metrics",
    headers: ["Property", "Value", "Units"],
    rows: [
      ["Material", job.material || CASTEP_STUDIO_STATE.structure?.formula || seed, ""],
      ["Data_Source", spec.sourceBadge || "", ""],
      ["Calculation_Geometry", spec.geomLabel || "", ""],
      ["Calculation_Mode", p.calcMode, ""],
      ["Direction_Vector", `(${p.vx.toFixed(2)}, ${p.vy.toFixed(2)}, ${p.vz.toFixed(2)})`, ""],
      ["Smearing_Sigma", Number(p.smearingEv.toFixed(4)), "eV"],
      ["Scissors_Operator", Number(p.scissorsEv.toFixed(4)), "eV"],
      ["Drude_Enabled", p.useDrude ? "Yes" : "No", ""],
      ["Drude_Plasma_Freq", Number(p.plasmaEv.toFixed(4)), "eV"],
      ["Drude_Damping", Number(p.drudeDampEv.toFixed(4)), "eV"],
      ["Absorption_Convention", p.alphaConv === "standard_si" ? "Standard SI (4pi*k/lambda)" : "Materials Studio CASTEP (2k/lambda)", ""],
      ["Static_Dielectric_eps1_0", Number((m.eps1Zero || 0).toFixed(5)), "dimensionless"],
      ["Static_Refractive_Index_n0", Number((m.nZero || 0).toFixed(5)), "dimensionless"],
      ["Peak_Absorption_alpha_max", Number((m.maxAlpha || 0).toFixed(2)), "cm^-1"],
      ["Peak_Absorption_Energy", Number((m.maxAlphaEv || 0).toFixed(4)), "eV"],
      ["Peak_Absorption_Wavelength", Number((m.maxAlphaNm || 0).toFixed(2)), "nm"],
      ["Peak_Eps2_Imag", Number((m.maxEps2 || 0).toFixed(5)), "dimensionless"],
      ["Peak_Eps2_Energy", Number((m.maxEps2Ev || 0).toFixed(4)), "eV"],
      ["Plasmon_Peak_Energy_hwp", Number((m.maxLossEv || 0).toFixed(4)), "eV"],
      ["Peak_EELS_Loss_L", Number((m.maxLoss || 0).toFixed(5)), "dimensionless"],
      ["Tauc_Direct_Optical_Gap", Number((tfDir.gapEv || 0).toFixed(4)), "eV"],
      ["Tauc_Indirect_Optical_Gap", Number((tfInd.gapEv || 0).toFixed(4)), "eV"]
    ]
  };

  let anisoSheet = null;
  if (spec.anisotropyData) {
    const A = spec.anisotropyData;
    const aHeaders = [
      "Photon_Energy_eV", "Wavelength_nm",
      "Eps1_Pol100", "Eps2_Pol100", "Alpha_Pol100_cm-1",
      "Eps1_Pol010", "Eps2_Pol010", "Alpha_Pol010_cm-1",
      "Eps1_Pol001", "Eps2_Pol001", "Alpha_Pol001_cm-1",
      "Eps1_Unpol001", "Eps2_Unpol001", "Alpha_Unpol001_cm-1",
      "Eps1_Polycryst", "Eps2_Polycryst", "Alpha_Polycryst_cm-1"
    ];
    const aRows = [];
    for (let i = 0; i < spec.hwGrid.length; i++) {
      const hw = Number(spec.hwGrid[i].toFixed(5));
      const nm = Number((1239.84193 / Math.max(0.01, hw)).toFixed(3));
      aRows.push([
        hw, nm,
        Number(A.polX.eps1[i].toFixed(6)), Number(A.polX.eps2[i].toFixed(6)), Number(A.polX.alphaCm[i].toFixed(3)),
        Number(A.polY.eps1[i].toFixed(6)), Number(A.polY.eps2[i].toFixed(6)), Number(A.polY.alphaCm[i].toFixed(3)),
        Number(A.polZ.eps1[i].toFixed(6)), Number(A.polZ.eps2[i].toFixed(6)), Number(A.polZ.alphaCm[i].toFixed(3)),
        Number(A.unpolZ.eps1[i].toFixed(6)), Number(A.unpolZ.eps2[i].toFixed(6)), Number(A.unpolZ.alphaCm[i].toFixed(3)),
        Number(A.poly.eps1[i].toFixed(6)), Number(A.poly.eps2[i].toFixed(6)), Number(A.poly.alphaCm[i].toFixed(3))
      ]);
    }
    anisoSheet = { name: "Anisotropy_Tensor", headers: aHeaders, rows: aRows };
  }

  const rawXcdCols = [];
  const xcds = (job.optical_xcds && job.optical_xcds.length) ? job.optical_xcds : (job.optical_xcd ? [job.optical_xcd] : []);
  xcds.forEach((xc, xi) => {
    const fnRaw = String(xc.filename || `XCD_${xi + 1}`);
    if (/convergence|energies|band structure|density of states|pdos/i.test(fnRaw)) return;
    const ftag = sanitizeExportSeed(fnRaw.replace(/\.xcd$/i, ""));
    (xc.series || []).forEach((s, si) => {
      const pts = s.segments?.[0] || [];
      if (pts.length > 5) {
        const stag = sanitizeExportSeed(s.name || `S${si + 1}`);
        rawXcdCols.push({ header: `${ftag}_${stag}`, pts });
      }
    });
  });

  let rawSheet = null;
  if (rawXcdCols.length > 0) {
    const rHeaders = ["Photon_Energy_eV", ...rawXcdCols.map(c => c.header)];
    const rRows = [];
    for (let i = 0; i < spec.hwGrid.length; i++) {
      const hw = Number(spec.hwGrid[i].toFixed(5));
      const row = [hw];
      rawXcdCols.forEach(c => row.push(Number(interpSortedXY(c.pts, hw).toFixed(6))));
      rRows.push(row);
    }
    rawSheet = { name: "Raw_XCD_Series", headers: rHeaders, rows: rRows };
  }

  return {
    seed,
    fullSheet: { name: "All_Optical_Spectra", headers: fullHeaders, rows: fullRows },
    summarySheet,
    dielSheet: { name: "Dielectric_Eps", headers: ["Photon_Energy_eV", "Wavelength_nm", "Wavenumber_cm-1", "Eps1_Real", "Eps2_Imag"], rows: dielRows },
    absSheet: { name: "Absorption_Tauc", headers: ["Photon_Energy_eV", "Wavelength_nm", "Wavenumber_cm-1", "Absorption_cm-1", "Absorption_x1e4_cm-1", "Tauc_Direct_ahv2", "Tauc_Direct_Fit", "Tauc_Indirect_ahv0.5", "Tauc_Indirect_Fit"], rows: absRows },
    nkSheet: { name: "Refractive_n_k", headers: ["Photon_Energy_eV", "Wavelength_nm", "Wavenumber_cm-1", "Refractive_Index_n", "Extinction_Coeff_k"], rows: nkRows },
    rlcSheet: { name: "Refl_Loss_Cond", headers: ["Photon_Energy_eV", "Wavelength_nm", "Wavenumber_cm-1", "Reflectivity_R", "Reflectivity_Pct", "EELS_Loss_L", "Conductivity_Re_1_fs", "Conductivity_Im_1_fs"], rows: rlcRows },
    anisoSheet,
    rawSheet
  };
}
window.buildOpticalExportTables = buildOpticalExportTables;

function exportCastepOpticalCSV(mode = "all") {
  const pkg = buildOpticalExportTables();
  if (!pkg) {
    if (typeof showToast === "function") showToast("No optical spectra available to export.", "warning");
    return;
  }
  const prop = document.getElementById("castep-opt-property")?.value || "multigrid";
  const sheetMap = {
    all: (prop === "anisotropy" && pkg.anisoSheet) ? pkg.anisoSheet : pkg.fullSheet,
    dielectric: pkg.dielSheet,
    absorption: pkg.absSheet,
    refractive: pkg.nkSheet,
    reflectivity: pkg.rlcSheet
  };
  const chosen = sheetMap[mode] || pkg.fullSheet;
  const csv = buildCsvString(chosen.headers, chosen.rows);
  const fname = `${pkg.seed}_${chosen.name}.csv`;
  triggerBlobDownload(new Blob([csv], { type: "text/csv;charset=utf-8" }), fname);
  if (typeof showToast === "function") {
    showToast(`Exported ${fname} (${chosen.headers.length} columns × ${chosen.rows.length} points)!`, "success");
  }
}
window.exportCastepOpticalCSV = exportCastepOpticalCSV;

function exportCastepOpticalXLSX() {
  const pkg = buildOpticalExportTables();
  if (!pkg) {
    if (typeof showToast === "function") showToast("No optical spectra available to export.", "warning");
    return;
  }
  const sheets = [pkg.summarySheet, pkg.dielSheet, pkg.absSheet, pkg.nkSheet, pkg.rlcSheet];
  if (pkg.anisoSheet) sheets.push(pkg.anisoSheet);
  if (pkg.rawSheet) sheets.push(pkg.rawSheet);
  const blob = buildXlsxBlob(sheets);
  const fname = `${pkg.seed}_Optical_Properties_AllTabs.xlsx`;
  triggerBlobDownload(blob, fname);
  if (typeof showToast === "function") {
    showToast(`Exported multi-tab workbook ${fname} (${sheets.map(s => s.name).join(" | ")})!`, "success");
  }
}
window.exportCastepOpticalXLSX = exportCastepOpticalXLSX;

// ============================================================================
// 11. EXACT Charge Density Difference (Δρ) Parser, Generator & 3-Panel Viewer
//     (*.chdiff Binary Fortran + *.charg_frm ASCII + Differential Subtraction)
// ============================================================================

const ELEMENT_VALENCE_ELECTRONS = {
  H:1, Li:1, Be:2, B:3, C:4, N:5, O:6, F:7, Na:1, Mg:2, Al:3, Si:4, P:5, S:6, Cl:7,
  K:1, Ca:2, Sc:3, Ti:4, V:5, Cr:6, Mn:7, Fe:8, Co:9, Ni:10, Cu:11, Zn:12, Ga:3, Ge:4, As:5, Se:6, Br:7,
  Rb:1, Sr:2, Y:3, Zr:4, Nb:5, Mo:6, Tc:7, Ru:8, Rh:9, Pd:10, Ag:11, Cd:12, In:3, Sn:4, Sb:5, Te:6, I:7,
  Cs:1, Ba:2, Hf:4, Ta:5, W:6, Re:7, Os:8, Ir:9, Pt:10, Au:11, Hg:12, Pb:4, Bi:5
};

function summarizeRawVolumetricGridJS(rawCellGrid, ngx, ngy, ngz, sourceFile, kind, cellVolA3, cLenA, keepRaw = false) {
  const vol = (cellVolA3 && cellVolA3 > 1e-3) ? cellVolA3 : 1.0;
  const cLen = (cLenA && cLenA > 1e-3) ? cLenA : 1.0;
  const hasRealVol = cellVolA3 && cellVolA3 > 1e-3;

  // Exact planar averages along z (c-axis)
  const nxy = ngx * ngy;
  const meanXYCell = new Float64Array(ngz);
  let minEa3 = 1e9, maxEa3 = -1e9, sumCell = 0, sumSqEa3 = 0;

  for (let ix = 0; ix < ngx; ix++) {
    for (let iy = 0; iy < ngy; iy++) {
      const base = (ix * ngy + iy) * ngz;
      for (let iz = 0; iz < ngz; iz++) {
        const vCell = rawCellGrid[base + iz];
        meanXYCell[iz] += vCell;
        sumCell += vCell;
        const vEa3 = vCell / vol;
        if (vEa3 < minEa3) minEa3 = vEa3;
        if (vEa3 > maxEa3) maxEa3 = vEa3;
        sumSqEa3 += vEa3 * vEa3;
      }
    }
  }

  const totalPts = Math.max(1, nxy * ngz);
  const meanEa3 = (sumCell / totalPts) / vol;
  const stdEa3 = Math.sqrt(Math.max(0, sumSqEa3 / totalPts - meanEa3 * meanEa3));

  const profZ = [];
  const profZLin = [];
  const dqZ = [];
  const mCells = new Float64Array(ngz);
  for (let iz = 0; iz < ngz; iz++) mCells[iz] = meanXYCell[iz] / nxy;
  let cumQ = 0.0;
  let maxAbsDq = 0.0;
  // Include periodic closing point z = c so ΔQ(0) = ΔQ(c) = 0 exactly
  for (let iz = 0; iz <= ngz; iz++) {
    const mCell = mCells[iz % ngz];
    profZ.push(mCell / vol);
    profZLin.push(mCell / cLen);
    if (iz === 0) cumQ = 0.0;
    else cumQ += 0.5 * (mCells[iz - 1] + mCell) / ngz;
    dqZ.push(cumQ);
    if (Math.abs(cumQ) > maxAbsDq) maxAbsDq = Math.abs(cumQ);
  }

  const ds1d = (arr, maxN = 200) => {
    if (arr.length <= maxN) return arr.map(v => Number(v.toFixed(7)));
    const out = [];
    for (let i = 0; i < maxN; i++) {
      const idx = Math.round((i * (arr.length - 1)) / (maxN - 1));
      out.push(Number(arr[idx].toFixed(7)));
    }
    return out;
  };

  // Downsample 3D grid conservatively for responsive 3D isosurface + arbitrary 2D slice
  const nxS = Math.min(20, ngx), nyS = Math.min(20, ngy), nzS = Math.min(44, ngz);
  const subFlat = new Array(nxS * nyS * nzS);
  let ptr = 0;
  for (let i = 0; i < nxS; i++) {
    const ix = nxS > 1 ? Math.round((i * (ngx - 1)) / (nxS - 1)) : 0;
    for (let j = 0; j < nyS; j++) {
      const iy = nyS > 1 ? Math.round((j * (ngy - 1)) / (nyS - 1)) : 0;
      for (let k = 0; k < nzS; k++) {
        const iz = nzS > 1 ? Math.round((k * (ngz - 1)) / (nzS - 1)) : 0;
        subFlat[ptr++] = Number((rawCellGrid[(ix * ngy + iy) * ngz + iz] / vol).toFixed(6));
      }
    }
  }

  const obj = {
    source_file: sourceFile,
    kind,
    unit: hasRealVol ? "e/Å³" : "e/cell",
    cell_volume_a3: Number(vol.toFixed(4)),
    c_length_a: Number(cLen.toFixed(4)),
    ngx, ngy, ngz,
    sample_dims: [nxS, nyS, nzS],
    min_val: Number(minEa3.toFixed(6)),
    max_val: Number(maxEa3.toFixed(6)),
    std_val: Number(stdEa3.toFixed(6)),
    mean_cell_electrons: Number((sumCell / totalPts).toFixed(5)),
    max_abs_dq_e: Number(maxAbsDq.toFixed(6)),
    profile_z: ds1d(profZ, 200),
    profile_z_linear: ds1d(profZLin, 200),
    delta_q_z: ds1d(dqZ, 200),
    grid3d_flat: subFlat
  };
  if (keepRaw) obj._rawCellGrid = rawCellGrid;
  buildIsosurfaceVoxelsOnGrid(obj);
  return obj;
}

function buildIsosurfaceVoxelsOnGrid(gridObj) {
  if (!gridObj || !gridObj.grid3d_flat || !gridObj.sample_dims) return;
  const [nx, ny, nz] = gridObj.sample_dims;
  const flat = gridObj.grid3d_flat;
  const voxels = [];
  const maxAbs = Math.max(Math.abs(gridObj.max_val || 0), Math.abs(gridObj.min_val || 0), 1e-6);
  const preThresh = maxAbs * 0.04;
  let ptr = 0;
  for (let ix = 0; ix < nx; ix++) {
    const u = nx > 1 ? ix / (nx - 1) : 0.5;
    for (let iy = 0; iy < ny; iy++) {
      const v = ny > 1 ? iy / (ny - 1) : 0.5;
      for (let iz = 0; iz < nz; iz++) {
        const val = flat[ptr++];
        if (Math.abs(val) >= preThresh) {
          const w = nz > 1 ? iz / (nz - 1) : 0.5;
          voxels.push({ u, v, w, val });
        }
      }
    }
  }
  // Keep strongest voxels sorted by magnitude for smooth 60fps 3D rendering
  if (voxels.length > 2600) {
    voxels.sort((a, b) => Math.abs(b.val) - Math.abs(a.val));
    voxels.length = 2600;
  }
  gridObj.isosurfaceVoxels = voxels;
}

function parseCastepChdiffArrayBuffer(arrayBuffer, filename, cellVolA3, cLenA) {
  if (!arrayBuffer || arrayBuffer.byteLength < 28) return null;
  const dv = new DataView(arrayBuffer);
  let littleEndian = false;
  let rlen1 = dv.getInt32(0, false);
  let ngx = dv.getInt32(4, false);
  let ngy = dv.getInt32(8, false);
  let ngz = dv.getInt32(12, false);
  let rlen1End = dv.getInt32(16, false);

  if (rlen1 !== 12 || rlen1End !== 12 || ngx <= 0 || ngy <= 0 || ngz <= 0 || ngx > 2048) {
    littleEndian = true;
    rlen1 = dv.getInt32(0, true);
    ngx = dv.getInt32(4, true);
    ngy = dv.getInt32(8, true);
    ngz = dv.getInt32(12, true);
    rlen1End = dv.getInt32(16, true);
    if (rlen1 !== 12 || rlen1End !== 12 || ngx <= 0 || ngy <= 0 || ngz <= 0 || ngx > 2048) {
      return null;
    }
  }

  const rawGrid = new Float32Array(ngx * ngy * ngz);
  let offset = 20;
  const totalBytes = arrayBuffer.byteLength;
  for (let rec = 0; rec < ngx * ngy; rec++) {
    if (offset + 12 > totalBytes) break;
    const rlen = dv.getInt32(offset, littleEndian);
    const ix = dv.getInt32(offset + 4, littleEndian);
    const iy = dv.getInt32(offset + 8, littleEndian);
    if (offset + 4 + rlen + 4 > totalBytes) break;
    if (ix >= 1 && ix <= ngx && iy >= 1 && iy <= ngy) {
      const base = ((ix - 1) * ngy + (iy - 1)) * ngz;
      if (rlen === 8 + ngz * 16) {
        let p = offset + 12;
        for (let iz = 0; iz < ngz; iz++) {
          rawGrid[base + iz] = dv.getFloat64(p, littleEndian);
          p += 16; // complex128 (real, imag) -> take real part
        }
      } else if (rlen === 8 + ngz * 8) {
        let p = offset + 12;
        for (let iz = 0; iz < ngz; iz++) {
          rawGrid[base + iz] = dv.getFloat64(p, littleEndian);
          p += 8;
        }
      }
    }
    offset += 4 + rlen + 4;
  }
  return summarizeRawVolumetricGridJS(rawGrid, ngx, ngy, ngz, filename, "chdiff", cellVolA3, cLenA, true);
}

function parseCastepChargFrmText(txt, filename, cellVolA3, cLenA) {
  if (!txt || txt.length < 20) return null;
  // Pass 1: fast line scan to detect max (ngx, ngy, ngz) & collect numeric triplets
  const iaArr = [];
  const ibArr = [];
  const icArr = [];
  const vArr = [];
  let ngx = 0, ngy = 0, ngz = 0;
  let pos = 0;
  const len = txt.length;
  while (pos < len) {
    let nl = txt.indexOf("\n", pos);
    if (nl === -1) nl = len;
    const line = txt.slice(pos, nl).trim();
    pos = nl + 1;
    if (!line || line.charCodeAt(0) > 57) continue; // skip header/comments
    const p = line.split(/\s+/);
    if (p.length >= 4) {
      const ia = parseInt(p[0], 10), ib = parseInt(p[1], 10), ic = parseInt(p[2], 10), val = parseFloat(p[3]);
      if (ia > 0 && ib > 0 && ic > 0 && isFinite(val)) {
        iaArr.push(ia); ibArr.push(ib); icArr.push(ic); vArr.push(val);
        if (ia > ngx) ngx = ia;
        if (ib > ngy) ngy = ib;
        if (ic > ngz) ngz = ic;
      }
    }
  }
  if (!vArr.length || ngx <= 0 || ngy <= 0 || ngz <= 0) return null;
  const rawGrid = new Float32Array(ngx * ngy * ngz);
  for (let i = 0; i < vArr.length; i++) {
    rawGrid[((iaArr[i] - 1) * ngy + (ibArr[i] - 1)) * ngz + (icArr[i] - 1)] = vArr[i];
  }
  return summarizeRawVolumetricGridJS(rawGrid, ngx, ngy, ngz, filename, "charg_frm", cellVolA3, cLenA, true);
}

function sampleRawGridTrilinear(rawGrid, nx, ny, nz, u, v, w) {
  const fx = ((u % 1) + 1) % 1 * nx;
  const fy = ((v % 1) + 1) % 1 * ny;
  const fz = ((w % 1) + 1) % 1 * nz;
  const x0 = Math.floor(fx) % nx, x1 = (x0 + 1) % nx, tx = fx - Math.floor(fx);
  const y0 = Math.floor(fy) % ny, y1 = (y0 + 1) % ny, ty = fy - Math.floor(fy);
  const z0 = Math.floor(fz) % nz, z1 = (z0 + 1) % nz, tz = fz - Math.floor(fz);
  const g = (ix, iy, iz) => rawGrid[(ix * ny + iy) * nz + iz];
  const c00 = g(x0,y0,z0)*(1-tx) + g(x1,y0,z0)*tx;
  const c10 = g(x0,y1,z0)*(1-tx) + g(x1,y1,z0)*tx;
  const c01 = g(x0,y0,z1)*(1-tx) + g(x1,y0,z1)*tx;
  const c11 = g(x0,y1,z1)*(1-tx) + g(x1,y1,z1)*tx;
  const c0 = c00*(1-ty) + c10*ty;
  const c1 = c01*(1-ty) + c11*ty;
  return c0*(1-tz) + c1*tz;
}

function computePromoleculeDeformationGrid(chargObj) {
  if (!chargObj || !chargObj._rawCellGrid) return chargObj;
  const st = CASTEP_STUDIO_STATE.structure;
  if (!st || !st.atoms || !st.atoms.length) return chargObj;
  const { ngx, ngy, ngz } = chargObj;
  const vecs = st.vectors || castepParamsToVectors(st.lattice.a, st.lattice.b, st.lattice.c, st.lattice.alpha, st.lattice.beta, st.lattice.gamma);
  const { vol, cLen } = getActiveStructureCellVolAndC();

  // Build normalized spherical neutral-atom promolecule density rho_promol(r) on the exact FFT grid
  const promol = new Float32Array(ngx * ngy * ngz);
  let promolSum = 0.0;
  let totalValence = 0.0;

  const atomsCart = st.atoms.map(at => {
    const el = castepCleanElement(at.element);
    const zVal = ELEMENT_VALENCE_ELECTRONS[el] || 4;
    const rCov = (typeof COVALENT_RADII !== "undefined" && COVALENT_RADII[el]) || 1.15;
    totalValence += zVal;
    return { u: ((at.x % 1) + 1) % 1, v: ((at.y % 1) + 1) % 1, w: ((at.z % 1) + 1) % 1, zVal, sigma: Math.max(0.45, rCov * 0.52) };
  });

  // Evaluate promolecule on grid using periodic minimum-image distance
  const [aV, bV, cV] = vecs;
  for (let ix = 0; ix < ngx; ix++) {
    const u = ix / ngx;
    for (let iy = 0; iy < ngy; iy++) {
      const v = iy / ngy;
      const base = (ix * ngy + iy) * ngz;
      for (let iz = 0; iz < ngz; iz++) {
        const w = iz / ngz;
        let val = 0.0;
        for (let a = 0; a < atomsCart.length; a++) {
          const at = atomsCart[a];
          let du = u - at.u; if (du > 0.5) du -= 1; else if (du < -0.5) du += 1;
          let dv = v - at.v; if (dv > 0.5) dv -= 1; else if (dv < -0.5) dv += 1;
          let dw = w - at.w; if (dw > 0.5) dw -= 1; else if (dw < -0.5) dw += 1;
          const dx = du*aV[0] + dv*bV[0] + dw*cV[0];
          const dy = du*aV[1] + dv*bV[1] + dw*cV[1];
          const dz = du*aV[2] + dv*bV[2] + dw*cV[2];
          const r2 = dx*dx + dy*dy + dz*dz;
          const inv2s2 = 1.0 / (2.0 * at.sigma * at.sigma);
          if (r2 * inv2s2 < 12.0) {
            val += at.zVal * Math.exp(-r2 * inv2s2);
          }
        }
        promol[base + iz] = val;
        promolSum += val;
      }
    }
  }

  // Normalize promolecule integral to match exact total electrons of chargObj
  const totalPts = ngx * ngy * ngz;
  let origSum = 0.0;
  for (let i = 0; i < totalPts; i++) origSum += chargObj._rawCellGrid[i];
  const scaleP = promolSum > 1e-12 ? (origSum / promolSum) : 0.0;

  const diffRaw = new Float32Array(totalPts);
  for (let i = 0; i < totalPts; i++) {
    diffRaw[i] = chargObj._rawCellGrid[i] - promol[i] * scaleP;
  }
  return summarizeRawVolumetricGridJS(
    diffRaw, ngx, ngy, ngz,
    `${chargObj.source_file} (ρ_{total} − ρ_{promolecule})`,
    "charg_frm_promol", vol, cLen, true
  );
}

function computeDifferentialChargeDensity() {
  const slots = CASTEP_STUDIO_STATE.chdiffState.diffSlots || {};
  if (!slots.ab || !slots.a) {
    if (typeof showToast === "function") showToast("Please load at least ρ(AB) (Total) and ρ(A) (Fragment A) *.charg_frm files first!", "warning");
    return;
  }
  const ab = slots.ab, fa = slots.a, fb = slots.b;
  if (!ab._rawCellGrid || !fa._rawCellGrid) {
    if (typeof showToast === "function") showToast("Raw 3D grid missing for loaded slot. Please reload the *.charg_frm files.", "warning");
    return;
  }

  const { ngx, ngy, ngz } = ab;
  const totalPts = ngx * ngy * ngz;
  const diffRaw = new Float32Array(totalPts);
  const sameA = (fa.ngx === ngx && fa.ngy === ngy && fa.ngz === ngz);
  const sameB = fb && fb._rawCellGrid && (fb.ngx === ngx && fb.ngy === ngy && fb.ngz === ngz);

  for (let ix = 0; ix < ngx; ix++) {
    const u = ix / ngx;
    for (let iy = 0; iy < ngy; iy++) {
      const v = iy / ngy;
      const base = (ix * ngy + iy) * ngz;
      for (let iz = 0; iz < ngz; iz++) {
        const idx = base + iz;
        const w = iz / ngz;
        const vAB = ab._rawCellGrid[idx];
        const vA = sameA ? fa._rawCellGrid[idx] : sampleRawGridTrilinear(fa._rawCellGrid, fa.ngx, fa.ngy, fa.ngz, u, v, w);
        const vB = fb && fb._rawCellGrid
          ? (sameB ? fb._rawCellGrid[idx] : sampleRawGridTrilinear(fb._rawCellGrid, fb.ngx, fb.ngy, fb.ngz, u, v, w))
          : 0.0;
        diffRaw[idx] = vAB - vA - vB;
      }
    }
  }

  const { vol, cLen } = getActiveStructureCellVolAndC();
  const label = fb
    ? `Δρ = ${ab.source_file} − ${fa.source_file} − ${fb.source_file}`
    : `Δρ = ${ab.source_file} − ${fa.source_file}`;

  const res = summarizeRawVolumetricGridJS(diffRaw, ngx, ngy, ngz, label, "charg_frm_sub", vol, cLen, true);
  CASTEP_STUDIO_STATE.chdiffState.activeGrid = res;
  autoTuneChdiffIsoval(res);
  renderCastepChdiffPlots();
  renderCastep3DScene();
  if (typeof showToast === "function") showToast(`⚡ Computed exact ${label} (${ngx}×${ngy}×${ngz})!`, "success");
}
window.computeDifferentialChargeDensity = computeDifferentialChargeDensity;

function autoTuneChdiffIsoval(gridObj) {
  if (!gridObj) return;
  const maxAbs = Math.max(Math.abs(gridObj.max_val || 0), Math.abs(gridObj.min_val || 0));
  if (maxAbs > 1e-6) {
    const suggested = Number(Math.max(0.0005, maxAbs * 0.12).toFixed(4));
    CASTEP_STUDIO_STATE.chdiffState.isoval = suggested;
    CASTEP_STUDIO_STATE.view3D.chdiffIsoval = suggested;
    const el1 = document.getElementById("castep-chdiff-isoval");
    const el2 = document.getElementById("vesta-chdiff-iso-input");
    if (el1) el1.value = suggested;
    if (el2) el2.value = suggested;
  }
}

async function handleCastepChdiffSlotUpload(slotKey, event) {
  const file = event.target?.files?.[0];
  if (!file) return;
  const { vol, cLen } = getActiveStructureCellVolAndC();
  let parsed = null;
  if (file.name.toLowerCase().endsWith(".chdiff")) {
    parsed = parseCastepChdiffArrayBuffer(await file.arrayBuffer(), file.name, vol, cLen);
  } else {
    parsed = parseCastepChargFrmText(await file.text(), file.name, vol, cLen);
  }
  event.target.value = "";
  if (!parsed) {
    if (typeof showToast === "function") showToast(`Could not parse volumetric grid in "${file.name}".`, "warning");
    return;
  }
  CASTEP_STUDIO_STATE.chdiffState.diffSlots[slotKey] = parsed;
  const lbl = document.getElementById(`castep-chdiff-slot-${slotKey}-lbl`);
  if (lbl) lbl.textContent = `${file.name} (${parsed.ngx}×${parsed.ngy}×${parsed.ngz})`;
  if (typeof showToast === "function") showToast(`Loaded ${slotKey.toUpperCase()}: ${file.name} (${parsed.ngx}×${parsed.ngy}×${parsed.ngz})`, "success");
  if (CASTEP_STUDIO_STATE.chdiffState.diffSlots.ab && CASTEP_STUDIO_STATE.chdiffState.diffSlots.a) {
    computeDifferentialChargeDensity();
  }
}
window.handleCastepChdiffSlotUpload = handleCastepChdiffSlotUpload;

async function handleCastepChdiffPrimaryUpload(event) {
  const file = event.target?.files?.[0];
  if (!file) return;
  const { vol, cLen } = getActiveStructureCellVolAndC();
  const low = file.name.toLowerCase();
  let parsed = null;
  if (low.endsWith(".chdiff")) {
    parsed = parseCastepChdiffArrayBuffer(await file.arrayBuffer(), file.name, vol, cLen);
    const modeEl = document.getElementById("castep-chdiff-mode");
    if (modeEl) modeEl.value = "chdiff";
    CASTEP_STUDIO_STATE.chdiffState.mode = "chdiff";
  } else {
    parsed = parseCastepChargFrmText(await file.text(), file.name, vol, cLen);
    if (parsed) {
      CASTEP_STUDIO_STATE.chdiffState.primaryChargFrm = parsed;
      CASTEP_STUDIO_STATE.chdiffState.diffSlots.ab = parsed;
      const lbl = document.getElementById("castep-chdiff-slot-ab-lbl");
      if (lbl) lbl.textContent = `${file.name} (${parsed.ngx}×${parsed.ngy}×${parsed.ngz})`;
      const mode = document.getElementById("castep-chdiff-mode")?.value || "charg_frm_auto";
      if (mode === "chdiff") {
        const modeEl = document.getElementById("castep-chdiff-mode");
        if (modeEl) modeEl.value = "charg_frm_auto";
        CASTEP_STUDIO_STATE.chdiffState.mode = "charg_frm_auto";
        parsed = computePromoleculeDeformationGrid(parsed);
      } else if (mode === "charg_frm_auto") {
        parsed = computePromoleculeDeformationGrid(parsed);
      }
    }
  }
  event.target.value = "";
  if (!parsed) {
    if (typeof showToast === "function") showToast(`Failed to parse "${file.name}". Expected CASTEP binary *.chdiff or ASCII *.charg_frm.`, "warning");
    return;
  }
  CASTEP_STUDIO_STATE.chdiffState.activeGrid = parsed;
  autoTuneChdiffIsoval(parsed);
  onCastepChdiffModeChange();
  if (typeof showToast === "function") {
    showToast(`🔋 Loaded ${parsed.source_file} (${parsed.ngx}×${parsed.ngy}×${parsed.ngz}, ${parsed.unit})!`, "success");
  }
}
window.handleCastepChdiffPrimaryUpload = handleCastepChdiffPrimaryUpload;

async function handleCastepChdiffReferenceUpload(event) {
  const files = Array.from(event.target?.files || []);
  if (!files.length) return;
  const { vol, cLen } = getActiveStructureCellVolAndC();
  for (let i = 0; i < Math.min(2, files.length); i++) {
    const f = files[i];
    const parsed = f.name.toLowerCase().endsWith(".chdiff")
      ? parseCastepChdiffArrayBuffer(await f.arrayBuffer(), f.name, vol, cLen)
      : parseCastepChargFrmText(await f.text(), f.name, vol, cLen);
    if (parsed) {
      const slotKey = i === 0 ? "a" : "b";
      CASTEP_STUDIO_STATE.chdiffState.diffSlots[slotKey] = parsed;
      const lbl = document.getElementById(`castep-chdiff-slot-${slotKey}-lbl`);
      if (lbl) lbl.textContent = `${f.name} (${parsed.ngx}×${parsed.ngy}×${parsed.ngz})`;
    }
  }
  event.target.value = "";
  computeDifferentialChargeDensity();
}
window.handleCastepChdiffReferenceUpload = handleCastepChdiffReferenceUpload;

function onCastepChdiffModeChange() {
  const mode = document.getElementById("castep-chdiff-mode")?.value || "chdiff";
  CASTEP_STUDIO_STATE.chdiffState.mode = mode;
  const refBtn = document.getElementById("castep-chdiff-ref-btn");
  const diffBar = document.getElementById("castep-chdiff-diff-bar");
  if (refBtn) refBtn.style.display = (mode === "charg_frm_sub") ? "inline-flex" : "none";
  if (diffBar) diffBar.style.display = (mode === "charg_frm_sub") ? "flex" : "none";

  if (mode === "charg_frm_auto" && CASTEP_STUDIO_STATE.chdiffState.primaryChargFrm) {
    CASTEP_STUDIO_STATE.chdiffState.activeGrid = computePromoleculeDeformationGrid(CASTEP_STUDIO_STATE.chdiffState.primaryChargFrm);
    autoTuneChdiffIsoval(CASTEP_STUDIO_STATE.chdiffState.activeGrid);
  } else if (mode === "chdiff") {
    const job = (CASTEP_STUDIO_STATE.jobs || []).find(j => j.id === CASTEP_STUDIO_STATE.activeJobId);
    if (job && job.chdiff_data) {
      buildIsosurfaceVoxelsOnGrid(job.chdiff_data);
      CASTEP_STUDIO_STATE.chdiffState.activeGrid = job.chdiff_data;
      autoTuneChdiffIsoval(job.chdiff_data);
    }
  }
  renderCastepChdiffPlots();
  renderCastep3DScene();
}
window.onCastepChdiffModeChange = onCastepChdiffModeChange;

function syncChdiffIsoval(val) {
  const v = Math.max(0.0002, Math.min(2.0, parseFloat(val) || 0.015));
  CASTEP_STUDIO_STATE.chdiffState.isoval = v;
  CASTEP_STUDIO_STATE.view3D.chdiffIsoval = v;
  const el1 = document.getElementById("castep-chdiff-isoval");
  const el2 = document.getElementById("vesta-chdiff-iso-input");
  if (el1 && Number(el1.value) !== v) el1.value = v;
  if (el2 && Number(el2.value) !== v) el2.value = v;
  renderCastepChdiffPlots();
  renderCastep3DScene();
}
window.syncChdiffIsoval = syncChdiffIsoval;

function toggleChdiffInMain3DViewer() {
  CASTEP_STUDIO_STATE.view3D.showChdiffIso = true;
  const chk = document.getElementById("vesta-chk-show-chdiff");
  if (chk) chk.checked = true;
  switchCastepStagePane("builder");
  renderCastep3DScene();
}
window.toggleChdiffInMain3DViewer = toggleChdiffInMain3DViewer;

function getActiveJobChdiffGrid() {
  if (CASTEP_STUDIO_STATE.chdiffState.activeGrid) return CASTEP_STUDIO_STATE.chdiffState.activeGrid;
  const job = (CASTEP_STUDIO_STATE.jobs || []).find(j => j.id === CASTEP_STUDIO_STATE.activeJobId);
  if (job && job.chdiff_data) {
    if (!job.chdiff_data.isosurfaceVoxels) buildIsosurfaceVoxelsOnGrid(job.chdiff_data);
    CASTEP_STUDIO_STATE.chdiffState.activeGrid = job.chdiff_data;
    autoTuneChdiffIsoval(job.chdiff_data);
    return job.chdiff_data;
  }
  return null; // ZERO synthetic fake Δρ!
}
window.getActiveJobChdiffGrid = getActiveJobChdiffGrid;

function getChdiffPaletteColors(palName, tNorm) {
  // tNorm in [-1, 1]: +1 accumulation, 0 neutral white, -1 depletion
  const t = Math.max(-1, Math.min(1, tNorm));
  if (palName === "red-blue") {
    if (t >= 0) return [255, Math.round(255 * (1 - 0.82 * t)), Math.round(255 * (1 - 0.85 * t))];
    const a = -t; return [Math.round(255 * (1 - 0.82 * a)), Math.round(255 * (1 - 0.50 * a)), 255];
  }
  if (palName === "green-magenta") {
    if (t >= 0) return [Math.round(255 * (1 - 0.85 * t)), Math.round(255 * (1 - 0.22 * t)), Math.round(255 * (1 - 0.72 * t))];
    const a = -t; return [Math.round(255 * (1 - 0.15 * a)), Math.round(255 * (1 - 0.82 * a)), Math.round(255 * (1 - 0.08 * a))];
  }
  // Default yellow-cyan (standard VESTA/CASTEP Δρ publication palette)
  if (t >= 0) return [255, Math.round(255 - 45 * t), Math.round(255 * (1 - 0.92 * t))];
  const a = -t; return [Math.round(255 * (1 - 0.92 * a)), Math.round(255 - 40 * a), 255];
}

function renderCastepChdiffPlots() {
  const canvas = document.getElementById("castep-chdiff-canvas");
  if (!canvas) return;
  const parentW = canvas.parentElement ? (canvas.parentElement.clientWidth - 24) : 880;
  const width = Math.max(320, Math.floor(parentW));
  const height = 510;
  const dpr = getCastepCanvasDpr(width, height);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.scale(dpr, dpr);
  applyCrispCanvasQuality(ctx);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const chGrid = getActiveJobChdiffGrid();
  const strip = document.getElementById("castep-chdiff-summary-strip");
  const job = (CASTEP_STUDIO_STATE.jobs || []).find(j => j.id === CASTEP_STUDIO_STATE.activeJobId);

  if (!chGrid) {
    const hasCharg = job && Array.isArray(job.charg_frm_files) && job.charg_frm_files.length > 0;
    if (strip) {
      strip.innerHTML = hasCharg
        ? `<span><strong>Available *.charg_frm:</strong> ${escapeHtml(job.charg_frm_files.join(", "))} — <button type="button" class="castep-preset-chip" onclick="loadJobChargFrmIntoChdiff()">⚡ Load &amp; Compute Δρ</button></span>`
        : `<span><strong>Status:</strong> No <code>*.chdiff</code> or <code>*.charg_frm</code> volumetric grid loaded.</span>`;
    }
    ctx.fillStyle = "#334155";
    ctx.font = "700 15px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("No Charge Density Difference (*.chdiff / *.charg_frm) Loaded", width / 2, height / 2 - 18);
    ctx.fillStyle = "#64748b";
    ctx.font = "12.5px Inter, sans-serif";
    drawSciText(ctx, "Click '📥 Load *.chdiff / *.charg_frm' above, select a job with *.chdiff output, or use '➖ Differential Subtraction (ρ_{AB} − ρ_{A} − ρ_{B})'.", width / 2, height / 2 + 10);
    ctx.restore();
    return;
  }

  const layout = document.getElementById("castep-chdiff-layout")?.value || "tri";
  const plane = document.getElementById("castep-chdiff-plane")?.value || "xz";
  const slicePos = parseFloat(document.getElementById("castep-chdiff-slice-pos")?.value) || 0.5;
  const isoVal = parseFloat(document.getElementById("castep-chdiff-isoval")?.value) || CASTEP_STUDIO_STATE.chdiffState.isoval || 0.015;
  const palette = document.getElementById("castep-chdiff-palette")?.value || "yellow-cyan";

  // Update summary strip with exact physical metrics
  if (strip) {
    const unit = chGrid.unit || "e/Å³";
    const dqMax = chGrid.max_abs_dq_e !== undefined ? chGrid.max_abs_dq_e : 0;
    strip.innerHTML = `
      <span><strong>Source:</strong> ${formatSciHtml(chGrid.source_file || "CASTEP Δρ")}</span>
      <span><strong>FFT Grid:</strong> ${chGrid.ngx}×${chGrid.ngy}×${chGrid.ngz}</span>
      <span><strong>Range:</strong> [${Number(chGrid.min_val).toFixed(4)}, +${Number(chGrid.max_val).toFixed(4)}] ${unit}</span>
      <span><strong>Isovalue:</strong> ±${isoVal.toFixed(4)} ${unit}</span>
      <span><strong>Max |ΔQ(z)|:</strong> ${Number(dqMax).toFixed(4)} e</span>
      <span><strong>Cell Vol:</strong> ${Number(chGrid.cell_volume_a3 || 0).toFixed(2)} Å³</span>
    `;
  }

  // Helper 1: Panel (a) 3D Structure + Volumetric Δρ Isosurfaces
  function draw3DIsosurfacePanel(bx, by, bw, bh) {
    const stP = getCastepPlotStyle();
    ctx.save();
    ctx.fillStyle = stP.inkColor;
    ctx.font = castepPlotFont("title", 0.88);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(`(a) 3D Structure + Δρ (±${isoVal.toFixed(4)} ${chGrid.unit || "e/Å³"})`, bx + 10, by + 18);

    ctx.beginPath();
    ctx.rect(bx + 9, by + 27, bw - 18, bh - 36);
    ctx.clip();

    const st = CASTEP_STUDIO_STATE.structure;
    const vecs = (st && st.vectors && st.vectors.length === 3)
      ? st.vectors
      : [[6,0,0],[0,6,0],[0,0,20]];
    if (!CASTEP_STUDIO_STATE.chdiffState.rot3DMatrix) {
      CASTEP_STUDIO_STATE.chdiffState.rot3DMatrix = computeVestaOrientationMatrix("iso", vecs);
    }
    const R = CASTEP_STUDIO_STATE.chdiffState.rot3DMatrix;
    const [aV, bV, cV] = vecs;
    const [cx0, cy0, cz0] = castepFracToCart(0.5, 0.5, 0.5, vecs);
    const maxSpan = Math.max(Math.hypot(...aV), Math.hypot(...bV), Math.hypot(...cV), 5.0);
    const scale = (Math.min(bw - 30, bh - 55) * 0.78 / maxSpan) * (CASTEP_STUDIO_STATE.chdiffState.zoom1D || 1.0);
    const halfX = bx + bw / 2, halfY = by + 26 + (bh - 34) / 2;

    const proj = (x, y, z) => {
      const xr = x - cx0, yr = y - cy0, zr = z - cz0;
      return {
        sx: halfX + (R[0][0]*xr + R[0][1]*yr + R[0][2]*zr) * scale,
        sy: halfY - (R[1][0]*xr + R[1][1]*yr + R[1][2]*zr) * scale,
        sz: R[2][0]*xr + R[2][1]*yr + R[2][2]*zr
      };
    };

    // Unit cell wireframe
    const corners = [
      [0,0,0], aV, bV, cV,
      [aV[0]+bV[0], aV[1]+bV[1], aV[2]+bV[2]],
      [aV[0]+cV[0], aV[1]+cV[1], aV[2]+cV[2]],
      [bV[0]+cV[0], bV[1]+cV[1], bV[2]+cV[2]],
      [aV[0]+bV[0]+cV[0], aV[1]+bV[1]+cV[1], aV[2]+bV[2]+cV[2]]
    ].map(c => proj(c[0], c[1], c[2]));
    const edges = [[0,1],[0,2],[0,3],[1,4],[2,4],[1,5],[3,5],[2,6],[3,6],[4,7],[5,7],[6,7]];
    ctx.strokeStyle = "rgba(100,116,139,0.55)";
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    edges.forEach(([i, j]) => { ctx.moveTo(corners[i].sx, corners[i].sy); ctx.lineTo(corners[j].sx, corners[j].sy); });
    ctx.stroke();

    // Collect glossy atoms, bonds + smooth volumetric 3D Electron Clouds sorted by depth
    const items = [];
    const cloudStyle = CASTEP_STUDIO_STATE.chdiffState?.cloudStyle || "clouds";
    const posStr = palette === "red-blue" ? "#b91c1c" : (palette === "green-magenta" ? "#15803d" : "#ca8a04");
    const negStr = palette === "red-blue" ? "#1d4ed8" : (palette === "green-magenta" ? "#a21caf" : "#0e7490");
    const dims = chGrid.sample_dims || [16, 16, 36];
    const voxelPitch = Math.max(
      Math.hypot(...aV) / Math.max(1, dims[0]),
      Math.hypot(...bV) / Math.max(1, dims[1]),
      Math.hypot(...cV) / Math.max(1, dims[2])
    );
    const baseCloudR = Math.max(8.5, Math.min(28.0, voxelPitch * scale * (cloudStyle === "clouds" ? 1.62 : 1.24)));
    const posSprite = getCachedChdiffCloudSprite(palette, true, cloudStyle);
    const negSprite = getCachedChdiffCloudSprite(palette, false, cloudStyle);

    (chGrid.isosurfaceVoxels || []).forEach(vx => {
      const mag = Math.abs(vx.val);
      if (mag < isoVal) return;
      const [cx, cy, cz] = castepFracToCart(vx.u, vx.v, vx.w, vecs);
      const p = proj(cx, cy, cz);
      const excess = Math.min(1.0, (mag - isoVal) / Math.max(isoVal * 1.8, 1e-6));
      const r = baseCloudR * (0.76 + 0.50 * Math.sqrt(excess));
      const alpha = cloudStyle === "clouds"
        ? (0.20 + 0.44 * Math.sqrt(excess))
        : (0.38 + 0.44 * Math.sqrt(excess));
      items.push({ type: "lobe", sz: p.sz, sx: p.sx, sy: p.sy, r, alpha, sprite: vx.val > 0 ? posSprite : negSprite });
    });

    const projAtomsA = (st?.atoms || []).map(at => {
      const [cx, cy, cz] = castepFracToCart(at.x, at.y, at.z, vecs);
      const p = proj(cx, cy, cz);
      const covR = getCrystalCovRadius(at.element);
      const r = Math.max(5.0, Math.min(14.5, covR * scale * 0.28));
      return { cx, cy, cz, sx: p.sx, sy: p.sy, sz: p.sz, r, el: castepCleanElement(at.element), color: getVestaElementColor(at.element) };
    });
    const elSetA = new Set(projAtomsA.map(a => a.el));
    const hasCationsA = projAtomsA.some(a => VESTA_CATION_SET.has(a.el));
    const hasAnionsA = projAtomsA.some(a => VESTA_ANION_SET.has(a.el));
    const hasBothCAA = hasCationsA && hasAnionsA;
    const stickHalfA = Math.max(1.6, Math.min(4.2, scale * 0.095));

    // Exact chemical half-bonds inside Panel (a) so the crystal backbone renders cleanly inside clouds
    for (let i = 0; i < projAtomsA.length; i++) {
      for (let j = i + 1; j < projAtomsA.length; j++) {
        const a1 = projAtomsA[i], a2 = projAtomsA[j];
        const d = Math.hypot(a1.cx - a2.cx, a1.cy - a2.cy, a1.cz - a2.cz);
        if (isVestaChemicalBond(a1.el, a2.el, d, 1.15, hasBothCAA, elSetA)) {
          const mx = (a1.sx + a2.sx) * 0.5, my = (a1.sy + a2.sy) * 0.5;
          items.push({ type: "half_bond", sz: 0.68 * a1.sz + 0.32 * a2.sz - 0.03, x1: a1.sx, y1: a1.sy, x2: mx, y2: my, color: a1.color });
          items.push({ type: "half_bond", sz: 0.32 * a1.sz + 0.68 * a2.sz - 0.03, x1: a2.sx, y1: a2.sy, x2: mx, y2: my, color: a2.color });
        }
      }
    }
    projAtomsA.forEach(a => items.push({ type: "atom", sz: a.sz, sx: a.sx, sy: a.sy, r: a.r, color: a.color }));

    items.sort((a, b) => a.sz - b.sz);
    items.forEach(it => {
      if (it.type === "lobe") {
        const prevA = ctx.globalAlpha;
        ctx.globalAlpha = it.alpha;
        ctx.drawImage(it.sprite, it.sx - it.r, it.sy - it.r, it.r * 2, it.r * 2);
        ctx.globalAlpha = prevA;
      } else if (it.type === "half_bond") {
        drawShadedHalfBondCylinder(ctx, it.x1, it.y1, it.x2, it.y2, stickHalfA, it.color, true, false);
      } else {
        const spr = getCachedSphereSprite(it.color, false);
        const drawR = it.r * (48 / 42);
        ctx.drawImage(spr, it.sx - drawR, it.sy - drawR, drawR * 2, drawR * 2);
      }
    });

    // Color legend inside bottom of Panel (a)
    ctx.fillStyle = "rgba(255,255,255,0.90)";
    ctx.fillRect(bx + 14, by + bh - 30, bw - 28, 18);
    ctx.font = castepPlotFont("legend", 0.90, "bold");
    ctx.textAlign = "left";
    ctx.fillStyle = posStr; ctx.fillText("● +Δρ Accumulation", bx + 18, by + bh - 17);
    ctx.textAlign = "right";
    ctx.fillStyle = negStr; ctx.fillText("● \u2212Δρ Depletion", bx + bw - 18, by + bh - 17);
    ctx.restore();
    drawPubAxisBox(ctx, bx + 8, by + 26, bw - 16, bh - 34, getCastepPlotStyle(), { compact: true });
  }

  // Helper 2: Panel (b) 2D Cross-Sectional Slice Heatmap & Contour Map
  function draw2DSlicePanel(bx, by, bw, bh) {
    const stP = getCastepPlotStyle();
    const outTickExtra = stP.tickDir === "out" ? (stP.tickLength || 5) + 1 : 0;
    const padL = Math.round(44 + outTickExtra), padR = 58, padT = 28, padB = Math.round(38 + outTickExtra);
    const pw = Math.max(60, bw - padL - padR);
    const ph = Math.max(60, bh - padT - padB);
    const px0 = bx + padL, py0 = by + padT;

    const [nx, ny, nz] = chGrid.sample_dims || [1, 1, 1];
    const flat = chGrid.grid3d_flat || [];
    const get3 = (i, j, k) => flat[(i * ny + j) * nz + k] || 0;

    let nU = nx, nV = nz, xLbl = "a (frac)", yLbl = "c (frac)", planeTitle = `(010) a–c @ v=${slicePos.toFixed(2)}`;
    if (plane === "yz") { nU = ny; nV = nz; xLbl = "b (frac)"; yLbl = "c (frac)"; planeTitle = `(100) b–c @ u=${slicePos.toFixed(2)}`; }
    else if (plane === "xy") { nU = nx; nV = ny; xLbl = "a (frac)"; yLbl = "b (frac)"; planeTitle = `(001) a–b @ w=${slicePos.toFixed(2)}`; }

    const sIdx = plane === "xz" ? Math.min(ny - 1, Math.round(slicePos * (ny - 1)))
      : (plane === "yz" ? Math.min(nx - 1, Math.round(slicePos * (nx - 1))) : Math.min(nz - 1, Math.round(slicePos * (nz - 1))));

    const sliceVals = [];
    let maxAbsS = 1e-6;
    for (let u = 0; u < nU; u++) {
      const col = [];
      for (let v = 0; v < nV; v++) {
        const val = plane === "xz" ? get3(u, sIdx, v) : (plane === "yz" ? get3(sIdx, u, v) : get3(u, v, sIdx));
        col.push(val);
        if (Math.abs(val) > maxAbsS) maxAbsS = Math.abs(val);
      }
      sliceVals.push(col);
    }
    const satMax = Math.max(isoVal * 3.0, maxAbsS * 0.65, 1e-6);

    // Bilinear smooth heatmap on offscreen ImageData
    const imgW = Math.max(40, Math.round(pw));
    const imgH = Math.max(40, Math.round(ph));
    const off = document.createElement("canvas");
    off.width = imgW; off.height = imgH;
    const octx = off.getContext("2d");
    const img = octx.createImageData(imgW, imgH);
    const data = img.data;

    for (let py = 0; py < imgH; py++) {
      const vf = (1 - py / Math.max(1, imgH - 1)) * (nV - 1);
      const v0 = Math.floor(vf), v1 = Math.min(nV - 1, v0 + 1), tv = vf - v0;
      for (let px = 0; px < imgW; px++) {
        const uf = (px / Math.max(1, imgW - 1)) * (nU - 1);
        const u0 = Math.floor(uf), u1 = Math.min(nU - 1, u0 + 1), tu = uf - u0;
        const val = (sliceVals[u0][v0]*(1-tu) + sliceVals[u1][v0]*tu)*(1-tv)
                  + (sliceVals[u0][v1]*(1-tu) + sliceVals[u1][v1]*tu)*tv;
        const [r, g, b] = getChdiffPaletteColors(palette, val / satMax);
        const idx = (py * imgW + px) * 4;
        data[idx] = r; data[idx + 1] = g; data[idx + 2] = b; data[idx + 3] = 255;
      }
    }
    octx.putImageData(img, 0, 0);
    ctx.drawImage(off, px0, py0, pw, ph);

    // Overlay nearby atoms projected onto slice
    const st = CASTEP_STUDIO_STATE.structure;
    (st?.atoms || []).forEach(at => {
      const au = ((at.x % 1) + 1) % 1, av = ((at.y % 1) + 1) % 1, aw = ((at.z % 1) + 1) % 1;
      const dist = plane === "xz" ? Math.abs(av - slicePos) : (plane === "yz" ? Math.abs(au - slicePos) : Math.abs(aw - slicePos));
      if (dist < 0.22) {
        const sx = px0 + (plane === "yz" ? av : au) * pw;
        const sy = py0 + (1 - (plane === "xy" ? av : aw)) * ph;
        ctx.beginPath();
        ctx.arc(sx, sy, 4.2, 0, Math.PI * 2);
        ctx.fillStyle = getVestaElementColor(at.element);
        ctx.fill();
        ctx.strokeStyle = stP.inkColor; ctx.lineWidth = 1.0; ctx.stroke();
      }
    });

    drawPubAxisBox(ctx, px0, py0, pw, ph, stP, {
      compact: true,
      xTicks: [px0 + pw * 0.5],
      yTicks: [py0 + ph * 0.5],
      mirrorTop: true,
      mirrorRight: true
    });

    // Calibrated Color Bar on right
    const cbX = px0 + pw + 8, cbW = 10;
    for (let y = 0; y < ph; y++) {
      const t = 1 - 2 * (y / Math.max(1, ph - 1));
      const [r, g, b] = getChdiffPaletteColors(palette, t);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(cbX, py0 + y, cbW, 1.5);
    }
    ctx.strokeStyle = stP.inkColor; ctx.lineWidth = Math.max(1.0, stP.borderWidth * 0.72);
    ctx.strokeRect(Math.round(cbX) + 0.5, Math.round(py0) + 0.5, cbW, Math.round(ph));
    ctx.fillStyle = stP.inkColor; ctx.font = castepPlotFont("tick", 0.80); ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText(`+${satMax.toFixed(3)}`, cbX + cbW + 4, py0 + 5);
    ctx.fillText("0.000", cbX + cbW + 4, py0 + ph / 2);
    ctx.fillText(formatPubMinus(`-${satMax.toFixed(3)}`), cbX + cbW + 4, py0 + ph - 4);

    ctx.fillStyle = stP.inkColor; ctx.font = castepPlotFont("title", 0.88); ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    ctx.fillText(`(b) 2D Slice ${planeTitle}`, px0, by + 18);
    ctx.fillStyle = stP.inkColor; ctx.font = castepPlotFont("axis", 0.88); ctx.textAlign = "center"; ctx.textBaseline = "top";
    ctx.fillText(xLbl, px0 + pw / 2, py0 + ph + 10 + outTickExtra);
    ctx.font = castepPlotFont("tick", 0.86); ctx.textAlign = "right"; ctx.textBaseline = "middle";
    ctx.fillText("1.0", px0 - 6 - outTickExtra, py0 + 5);
    ctx.fillText("0.5", px0 - 6 - outTickExtra, py0 + ph / 2);
    ctx.fillText("0.0", px0 - 6 - outTickExtra, py0 + ph - 4);
  }

  // Helper 3: Panel (c) 1D Planar-Averaged Δρ(z) & Cumulative Charge Transfer ΔQ(z)
  function draw1DPlanarPanel(bx, by, bw, bh) {
    const stP = getCastepPlotStyle();
    const outTickExtra = stP.tickDir === "out" ? (stP.tickLength || 5) + 1 : 0;
    const padL = Math.round(62 + outTickExtra), padR = Math.round(52 + outTickExtra), padT = 28, padB = Math.round(40 + outTickExtra);
    const pw = Math.max(60, bw - padL - padR);
    const ph = Math.max(60, bh - padT - padB);
    const px0 = bx + padL, py0 = by + padT;

    const unit1D = document.getElementById("castep-chdiff-1d-unit")?.value || "ea3";
    const prof = (unit1D === "ea" && chGrid.profile_z_linear?.length) ? chGrid.profile_z_linear : (chGrid.profile_z || []);
    const unit1DLbl = unit1D === "ea" ? "e/Å" : (chGrid.unit || "e/Å³");
    const dq = chGrid.delta_q_z || [];
    const cLen = chGrid.c_length_a || CASTEP_STUDIO_STATE.structure?.lattice?.c || 20.0;
    const zoom = Math.max(1.0, CASTEP_STUDIO_STATE.chdiffState.zoom1D || 1.0);
    const pan = CASTEP_STUDIO_STATE.chdiffState.pan1D || 0.0;
    const spanZ = cLen / zoom;
    let zMin = Math.max(0, Math.min(cLen - spanZ, (cLen - spanZ) / 2 + pan * cLen));
    let zMax = zMin + spanZ;

    let maxAbsP = 1e-6;
    prof.forEach(v => { if (Math.abs(v) > maxAbsP) maxAbsP = Math.abs(v); });
    maxAbsP *= 1.15;

    let maxAbsQ = 1e-6;
    dq.forEach(v => { if (Math.abs(v) > maxAbsQ) maxAbsQ = Math.abs(v); });
    maxAbsQ *= 1.18;

    const toX = (z) => px0 + ((z - zMin) / ((zMax - zMin) || 1)) * pw;
    const toYP = (v) => py0 + ph * (0.5 - v / (2 * maxAbsP));
    const toYQ = (q) => py0 + ph * (0.5 - q / (2 * maxAbsQ));
    const yZero = toYP(0);

    const xTickVals = [0, 1, 2, 3, 4].map(g => zMin + (zMax - zMin) * (g / 4));
    const xTickPx = xTickVals.map(zv => toX(zv));
    const yTickPx = [py0, yZero, py0 + ph];

    ctx.save();
    ctx.beginPath(); ctx.rect(px0, py0, pw, ph); ctx.clip();
    drawPubGridLines(ctx, px0, py0, pw, ph, stP, xTickPx, [yZero]);

    // Zero baseline
    ctx.beginPath(); ctx.moveTo(px0, Math.round(yZero) + 0.5); ctx.lineTo(px0 + pw, Math.round(yZero) + 0.5);
    ctx.setLineDash([4, 3]); ctx.strokeStyle = stP.inkColor; ctx.lineWidth = Math.max(0.9, stP.borderWidth * 0.6); ctx.stroke(); ctx.setLineDash([]);

    // Atomic layer markers along z
    const st = CASTEP_STUDIO_STATE.structure;
    (st?.atoms || []).forEach(at => {
      const zA = (((at.z % 1) + 1) % 1) * cLen;
      if (zA >= zMin && zA <= zMax) {
        const ax = toX(zA);
        ctx.beginPath(); ctx.moveTo(ax, py0); ctx.lineTo(ax, py0 + ph);
        ctx.strokeStyle = "rgba(148,163,184,0.32)"; ctx.lineWidth = 1.0; ctx.stroke();
      }
    });

    // Shaded +/- Δρ(z) area & curve
    if (prof.length > 1) {
      const posFill = palette === "red-blue" ? "rgba(239,68,68,0.28)" : (palette === "green-magenta" ? "rgba(34,197,94,0.28)" : "rgba(234,179,8,0.34)");
      const negFill = palette === "red-blue" ? "rgba(59,130,246,0.28)" : (palette === "green-magenta" ? "rgba(217,70,239,0.28)" : "rgba(6,182,212,0.30)");

      ctx.beginPath();
      ctx.moveTo(toX(0), yZero);
      for (let i = 0; i < prof.length; i++) {
        const z = (i / (prof.length - 1)) * cLen;
        ctx.lineTo(toX(z), toYP(Math.max(0, prof[i])));
      }
      ctx.lineTo(toX(cLen), yZero);
      ctx.closePath(); ctx.fillStyle = posFill; ctx.fill();

      ctx.beginPath();
      ctx.moveTo(toX(0), yZero);
      for (let i = 0; i < prof.length; i++) {
        const z = (i / (prof.length - 1)) * cLen;
        ctx.lineTo(toX(z), toYP(Math.min(0, prof[i])));
      }
      ctx.lineTo(toX(cLen), yZero);
      ctx.closePath(); ctx.fillStyle = negFill; ctx.fill();

      ctx.beginPath();
      for (let i = 0; i < prof.length; i++) {
        const z = (i / (prof.length - 1)) * cLen;
        const sx = toX(z), sy = toYP(prof[i]);
        if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
      }
      ctx.strokeStyle = stP.inkColor; ctx.lineWidth = stP.lineWidth; ctx.stroke();
    }

    // Integrated Charge Transfer ΔQ(z) (Right Y-axis, dashed purple)
    if (dq.length > 1) {
      ctx.beginPath();
      for (let i = 0; i < dq.length; i++) {
        const z = (i / (dq.length - 1)) * cLen;
        const sx = toX(z), sy = toYQ(dq[i]);
        if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
      }
      ctx.setLineDash([5, 3]);
      ctx.strokeStyle = "#7c3aed"; ctx.lineWidth = stP.lineWidth; ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();

    drawPubAxisBox(ctx, px0, py0, pw, ph, stP, {
      compact: true,
      xTicks: xTickPx,
      yTicks: yTickPx,
      rightYTicks: yTickPx,
      mirrorTop: true
    });

    // Titles & Clear Two-Curve Legend
    ctx.fillStyle = stP.inkColor; ctx.font = castepPlotFont("title", 0.85); ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    ctx.fillText(`(c) ━━ Δρ(z) [${unit1DLbl}]`, px0, by + 18);
    ctx.fillStyle = "#7c3aed"; ctx.font = castepPlotFont("legend", 0.88, "bold"); ctx.textAlign = "right";
    ctx.fillText("┄┄ ΔQ(z) [e]", px0 + pw, by + 18);

    // Left Y ticks (Δρ)
    ctx.fillStyle = stP.inkColor; ctx.font = castepPlotFont("tick", 0.80); ctx.textAlign = "right"; ctx.textBaseline = "middle";
    ctx.fillText(`+${maxAbsP.toExponential(1)}`, px0 - 5 - outTickExtra, py0 + 5);
    ctx.fillText("0", px0 - 5 - outTickExtra, yZero);
    ctx.fillText(formatPubMinus(`-${maxAbsP.toExponential(1)}`), px0 - 5 - outTickExtra, py0 + ph - 4);

    // Right Y ticks (ΔQ in e)
    ctx.fillStyle = "#7c3aed"; ctx.textAlign = "left";
    ctx.fillText(`+${maxAbsQ.toFixed(3)}`, px0 + pw + 5 + outTickExtra, py0 + 5);
    ctx.fillText("0", px0 + pw + 5 + outTickExtra, yZero);
    ctx.fillText(formatPubMinus(`-${maxAbsQ.toFixed(3)}`), px0 + pw + 5 + outTickExtra, py0 + ph - 4);

    // X ticks (z in Å)
    ctx.fillStyle = stP.inkColor; ctx.font = castepPlotFont("tick", 0.86); ctx.textAlign = "center"; ctx.textBaseline = "top";
    const txY = py0 + ph + 5 + outTickExtra;
    xTickVals.forEach(zv => {
      ctx.fillText(zv.toFixed(1), toX(zv), txY);
    });
    ctx.font = castepPlotFont("axis", 0.88); ctx.fillStyle = stP.inkColor;
    ctx.fillText("z coordinate (Å)", px0 + pw / 2, txY + Math.round(stP.tickSize * 0.86) + 4);
  }

  canvas._subPanelRects = [];
  if (layout === "tri") {
    const w1 = Math.floor(width * 0.34);
    const w2 = Math.floor(width * 0.33);
    const w3 = width - w1 - w2;
    draw3DIsosurfacePanel(0, 0, w1, height);
    draw2DSlicePanel(w1, 0, w2, height);
    draw1DPlanarPanel(w1 + w2, 0, w3, height);
    canvas._subPanelRects = [
      { key: "iso3d", label: "Panel (a) 3D Structure + Δρ", x: 0, y: 0, w: w1, h: height, plotKey: "chdiff", dataSubPart: "1d", pngName: "CASTEP_Chdiff_a_3D.png" },
      { key: "slice2d", label: "Panel (b) 2D Slice", x: w1, y: 0, w: w2, h: height, plotKey: "chdiff", dataSubPart: "2d", pngName: "CASTEP_Chdiff_b_2DSlice.png" },
      { key: "planar1d", label: "Panel (c) 1D Planar Δρ(z) & ΔQ(z)", x: w1 + w2, y: 0, w: w3, h: height, plotKey: "chdiff", dataSubPart: "1d", pngName: "CASTEP_Chdiff_c_1DPlanar.png" }
    ];
  } else if (layout === "iso2d") {
    const w1 = Math.floor(width * 0.50);
    draw3DIsosurfacePanel(0, 0, w1, height);
    draw2DSlicePanel(w1, 0, width - w1, height);
    canvas._subPanelRects = [
      { key: "iso3d", label: "Panel (a) 3D Structure + Δρ", x: 0, y: 0, w: w1, h: height, plotKey: "chdiff", dataSubPart: "1d", pngName: "CASTEP_Chdiff_a_3D.png" },
      { key: "slice2d", label: "Panel (b) 2D Slice", x: w1, y: 0, w: width - w1, h: height, plotKey: "chdiff", dataSubPart: "2d", pngName: "CASTEP_Chdiff_b_2DSlice.png" }
    ];
  } else if (layout === "slice2d") {
    draw2DSlicePanel(0, 0, width, height);
  } else {
    draw1DPlanarPanel(0, 0, width, height);
  }
  ctx.restore();
}
window.renderCastepChdiffPlots = renderCastepChdiffPlots;

async function loadJobChargFrmIntoChdiff() {
  const job = (CASTEP_STUDIO_STATE.jobs || []).find(j => j.id === CASTEP_STUDIO_STATE.activeJobId);
  if (!job || !job.charg_frm_files || !job.charg_frm_files.length) return;
  const fname = job.charg_frm_files[0];
  const { vol, cLen } = getActiveStructureCellVolAndC();
  if (job._fileMap && job._fileMap[fname]) {
    const txt = await readFromFileOrHandle(job._fileMap[fname], false);
    const parsed = parseCastepChargFrmText(txt, fname, vol, cLen);
    if (parsed) {
      CASTEP_STUDIO_STATE.chdiffState.primaryChargFrm = parsed;
      CASTEP_STUDIO_STATE.chdiffState.diffSlots.ab = parsed;
      const modeEl = document.getElementById("castep-chdiff-mode");
      if (modeEl) modeEl.value = "charg_frm_auto";
      CASTEP_STUDIO_STATE.chdiffState.activeGrid = computePromoleculeDeformationGrid(parsed);
      autoTuneChdiffIsoval(CASTEP_STUDIO_STATE.chdiffState.activeGrid);
      renderCastepChdiffPlots();
      renderCastep3DScene();
      return;
    }
  }
  if (CASTEP_STUDIO_STATE.localBackendConnected && job.folder) {
    try {
      const resp = await fetch(`${getCastepApiBase()}/api/castep/charg-frm?folder=${encodeURIComponent(job.folder)}&filename=${encodeURIComponent(fname)}&seed=${encodeURIComponent(job.seed || "")}`);
      if (resp.ok) {
        const gridObj = await resp.json();
        buildIsosurfaceVoxelsOnGrid(gridObj);
        CASTEP_STUDIO_STATE.chdiffState.activeGrid = gridObj;
        autoTuneChdiffIsoval(gridObj);
        renderCastepChdiffPlots();
        renderCastep3DScene();
      }
    } catch (e) {}
  }
}
window.loadJobChargFrmIntoChdiff = loadJobChargFrmIntoChdiff;

function initCastepChdiffCanvasEvents() {
  const canvas = document.getElementById("castep-chdiff-canvas");
  if (!canvas || canvas._chdiffBound) return;
  canvas._chdiffBound = true;

  canvas.addEventListener("mousedown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const layout = document.getElementById("castep-chdiff-layout")?.value || "tri";
    const in3D = (layout === "tri" && mx < rect.width * 0.35) || (layout === "iso2d" && mx < rect.width * 0.50);
    if (in3D) {
      CASTEP_STUDIO_STATE.chdiffState.isDragging3D = true;
    } else {
      CASTEP_STUDIO_STATE.chdiffState.isDragging1D = true;
    }
    CASTEP_STUDIO_STATE.chdiffState.lastX = e.clientX;
    CASTEP_STUDIO_STATE.chdiffState.lastY = e.clientY;
  });

  window.addEventListener("mousemove", (e) => {
    const cs = CASTEP_STUDIO_STATE.chdiffState;
    if (!cs.isDragging3D && !cs.isDragging1D) return;
    const dx = e.clientX - cs.lastX;
    const dy = e.clientY - cs.lastY;
    cs.lastX = e.clientX; cs.lastY = e.clientY;
    if (cs.isDragging3D) {
      if (!cs.rot3DMatrix) cs.rot3DMatrix = computeVestaOrientationMatrix("iso", CASTEP_STUDIO_STATE.structure?.vectors);
      const ry = vestaRotScreenAxisMatrix("y", dx * 0.55);
      const rx = vestaRotScreenAxisMatrix("x", dy * 0.55);
      cs.rot3DMatrix = vestaMatMul3x3(rx, vestaMatMul3x3(ry, cs.rot3DMatrix));
    } else if (cs.isDragging1D) {
      cs.pan1D = Math.max(-0.45, Math.min(0.45, (cs.pan1D || 0) - dx * 0.002));
    }
    if (!cs._rafPending) {
      cs._rafPending = true;
      requestAnimationFrame(() => {
        cs._rafPending = false;
        renderCastepChdiffPlots();
      });
    }
  });

  window.addEventListener("mouseup", () => {
    CASTEP_STUDIO_STATE.chdiffState.isDragging3D = false;
    CASTEP_STUDIO_STATE.chdiffState.isDragging1D = false;
  });

  canvas.addEventListener("mousemove", (e) => {
    const chGrid = getActiveJobChdiffGrid();
    const readout = document.getElementById("castep-chdiff-readout");
    if (!chGrid || !readout || CASTEP_STUDIO_STATE.chdiffState.isDragging3D) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const layout = document.getElementById("castep-chdiff-layout")?.value || "tri";
    const bx = layout === "tri" ? rect.width * 0.67 : (layout === "profile1d" ? 0 : rect.width);
    const bw = layout === "tri" ? rect.width * 0.33 : (layout === "profile1d" ? rect.width : 0);
    if (bw > 0 && mx >= bx + 56 && mx <= bx + bw - 46) {
      const frac = Math.max(0, Math.min(1, (mx - (bx + 56)) / Math.max(1, bw - 102)));
      const cLen = chGrid.c_length_a || 20.0;
      const zoom = Math.max(1.0, CASTEP_STUDIO_STATE.chdiffState.zoom1D || 1.0);
      const pan = CASTEP_STUDIO_STATE.chdiffState.pan1D || 0.0;
      const spanZ = cLen / zoom;
      const zMin = Math.max(0, Math.min(cLen - spanZ, (cLen - spanZ) / 2 + pan * cLen));
      const zVal = zMin + frac * spanZ;
      const zFrac = Math.max(0, Math.min(1, zVal / cLen));
      const pArr = chGrid.profile_z || [];
      const pLin = chGrid.profile_z_linear || [];
      const qArr = chGrid.delta_q_z || [];
      const idx = Math.min(pArr.length - 1, Math.max(0, Math.round(zFrac * (pArr.length - 1))));
      readout.innerHTML =
        `<strong>z = ${zVal.toFixed(2)} Å</strong> (w=${zFrac.toFixed(3)}) • ` +
        `<strong>━━ Black Δρ(z) = ${(pArr[idx] || 0).toExponential(3)} ${chGrid.unit || "e/Å³"}</strong> ` +
        `(${(pLin[idx] || 0).toFixed(4)} e/Å) • ` +
        `<strong style="color:#7c3aed;">┄┄ Purple ΔQ(z) = ${(qArr[idx] || 0) >= 0 ? "+" : ""}${(qArr[idx] || 0).toFixed(4)} e</strong>`;
    }
  });

  canvas.addEventListener("dblclick", () => resetCastepPlotZoom("chdiff"));
}

function exportCastepChdiffFile(fmt = "charg_frm") {
  const chGrid = getActiveJobChdiffGrid();
  if (!chGrid) {
    if (typeof showToast === "function") showToast("No Charge Density Difference grid loaded to export.", "warning");
    return;
  }
  const [nx, ny, nz] = chGrid.sample_dims || [1, 1, 1];
  const flat = chGrid.grid3d_flat || [];
  let out = "   a       b       c       Charge\n";
  let ptr = 0;
  for (let i = 1; i <= nx; i++) {
    for (let j = 1; j <= ny; j++) {
      for (let k = 1; k <= nz; k++) {
        const v = flat[ptr++] || 0;
        out += `${String(i).padStart(8, " ")}${String(j).padStart(8, " ")}${String(k).padStart(8, " ")}   ${v.toExponential(12)}\n`;
      }
    }
  }
  const blob = new Blob([out], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${CASTEP_STUDIO_STATE.structure?.formula || "CASTEP"}_DeltaRho.${fmt}`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 200);
  if (typeof showToast === "function") showToast(`Exported Charge Density Difference (.${fmt})!`, "success");
}
window.exportCastepChdiffFile = exportCastepChdiffFile;

function buildChdiffExportTables() {
  const chGrid = getActiveJobChdiffGrid();
  if (!chGrid) return null;

  const seed = sanitizeExportSeed(CASTEP_STUDIO_STATE.structure?.formula || "CASTEP");
  const cLen = chGrid.c_length_a || CASTEP_STUDIO_STATE.structure?.lattice?.c || 20.0;
  const prof = chGrid.profile_z || [];
  const profLin = chGrid.profile_z_linear || [];
  const dq = chGrid.delta_q_z || [];

  // 1) 1D Planar-Averaged Profile & Integrated Charge Transfer ΔQ(z)
  const headers1D = ["Fractional_w", "Z_Angstrom", "Planar_DeltaRho_e_A3", "Linear_DeltaRho_e_A", "Integrated_DeltaQ_e"];
  const rows1D = prof.map((v, idx) => {
    const w = idx / Math.max(1, prof.length - 1);
    return [
      Number(w.toFixed(6)),
      Number((w * cLen).toFixed(5)),
      Number(Number(v || 0).toFixed(7)),
      Number(Number(profLin[idx] || 0).toFixed(7)),
      Number(Number(dq[idx] || 0).toFixed(7))
    ];
  });

  // 2) Currently displayed 2D Cross-Sectional Slice Matrix (Panel b)
  const plane = document.getElementById("castep-chdiff-plane")?.value || "xz";
  const slicePos = parseFloat(document.getElementById("castep-chdiff-slice-pos")?.value) || 0.5;
  const [nx, ny, nz] = chGrid.sample_dims || [1, 1, 1];
  const flat = chGrid.grid3d_flat || [];
  const get3 = (i, j, k) => flat[(i * ny + j) * nz + k] || 0;

  let nU = nx, nV = nz, uLbl = "a_frac", vLbl = "c_frac";
  if (plane === "yz") { nU = ny; nV = nz; uLbl = "b_frac"; vLbl = "c_frac"; }
  else if (plane === "xy") { nU = nx; nV = ny; uLbl = "a_frac"; vLbl = "b_frac"; }

  const sIdx = plane === "xz" ? Math.min(ny - 1, Math.round(slicePos * (ny - 1)))
    : (plane === "yz" ? Math.min(nx - 1, Math.round(slicePos * (nx - 1))) : Math.min(nz - 1, Math.round(slicePos * (nz - 1))));

  const headers2D = [`${vLbl}_vs_${uLbl}`];
  for (let u = 0; u < nU; u++) headers2D.push(`${uLbl}_${(u / Math.max(1, nU - 1)).toFixed(4)}`);
  const rows2D = [];
  for (let v = 0; v < nV; v++) {
    const row = [Number((v / Math.max(1, nV - 1)).toFixed(5))];
    for (let u = 0; u < nU; u++) {
      const val = plane === "xz" ? get3(u, sIdx, v) : (plane === "yz" ? get3(sIdx, u, v) : get3(u, v, sIdx));
      row.push(Number(val.toFixed(7)));
    }
    rows2D.push(row);
  }

  // 3) Summary Metadata
  const maxDq = dq.length ? Math.max(...dq.map(Math.abs)) : 0;
  const metaSheet = {
    name: "Summary_Metadata",
    headers: ["Property", "Value"],
    rows: [
      ["Formula", CASTEP_STUDIO_STATE.structure?.formula || seed],
      ["Source", chGrid.source || chGrid.kind || "CASTEP Volumetric Grid"],
      ["Grid_Dims_nx_ny_nz", `${nx} x ${ny} x ${nz}`],
      ["Cell_c_Length_A", Number(cLen.toFixed(5))],
      ["Cell_Volume_A3", Number((chGrid.cell_vol_a3 || 0).toFixed(4))],
      ["Slice_Plane", plane.toUpperCase()],
      ["Slice_Fractional_Pos", Number(slicePos.toFixed(3))],
      ["Isovalue_e_A3", Number(parseFloat(document.getElementById("castep-chdiff-isoval")?.value) || 0.018)],
      ["Max_Accumulation_e_A3", Number((chGrid.max_val || 0).toFixed(6))],
      ["Min_Depletion_e_A3", Number((chGrid.min_val || 0).toFixed(6))],
      ["Peak_Charge_Transfer_abs_dQ_e", Number(maxDq.toFixed(6))]
    ]
  };

  return {
    seed,
    plane,
    slicePos,
    sheet1D: { name: "1D_Planar_Profile", headers: headers1D, rows: rows1D },
    sheet2D: { name: `2D_Slice_${plane}_${slicePos.toFixed(2)}`, headers: headers2D, rows: rows2D },
    metaSheet
  };
}
window.buildChdiffExportTables = buildChdiffExportTables;

function exportCastepChdiffCSV(part = "1d") {
  const pkg = buildChdiffExportTables();
  if (!pkg) {
    if (typeof showToast === "function") showToast("No Charge Density Difference data to export.", "warning");
    return;
  }
  const target = (part === "2d") ? pkg.sheet2D : pkg.sheet1D;
  const csv = buildCsvString(target.headers, target.rows);
  const fname = (part === "2d")
    ? `${pkg.seed}_ChargeDiff_2D_${pkg.plane}_pos${pkg.slicePos.toFixed(2)}.csv`
    : `${pkg.seed}_ChargeDiff_1D_Planar.csv`;
  triggerBlobDownload(new Blob([csv], { type: "text/csv;charset=utf-8" }), fname);
  if (typeof showToast === "function") {
    showToast(`Exported ${fname} (${target.rows.length} rows × ${target.headers.length} columns)!`, "success");
  }
}
window.exportCastepChdiffCSV = exportCastepChdiffCSV;

function exportCastepChdiffXLSX() {
  const pkg = buildChdiffExportTables();
  if (!pkg) {
    if (typeof showToast === "function") showToast("No Charge Density Difference data to export.", "warning");
    return;
  }
  const sheets = [pkg.sheet1D, pkg.sheet2D, pkg.metaSheet];
  const blob = buildXlsxBlob(sheets);
  const fname = `${pkg.seed}_Charge_Density_Difference.xlsx`;
  triggerBlobDownload(blob, fname);
  if (typeof showToast === "function") {
    showToast(`Exported multi-tab workbook ${fname} (${sheets.map(s => s.name).join(" | ")})!`, "success");
  }
}
window.exportCastepChdiffXLSX = exportCastepChdiffXLSX;

// ============================================================================
// 12. Soft 3D Volumetric Cloud Sprites & Independent Per-Panel 2x2 Zoom / Pan
// ============================================================================

const _CHDIFF_CLOUD_SPRITE_CACHE = new Map();

function getCachedChdiffCloudSprite(palette, isPositive, styleMode = "clouds") {
  const key = `${palette}_${isPositive ? "pos" : "neg"}_${styleMode}`;
  if (_CHDIFF_CLOUD_SPRITE_CACHE.has(key)) return _CHDIFF_CLOUD_SPRITE_CACHE.get(key);

  const sz = 96;
  const off = document.createElement("canvas");
  off.width = sz;
  off.height = sz;
  const octx = off.getContext("2d");
  const cx = sz / 2, cy = sz / 2, R = sz * 0.48;

  // Color RGB triplets for bright core & soft halo
  let coreRGB = [255, 214, 10], midRGB = [245, 178, 0];
  if (palette === "red-blue") {
    coreRGB = isPositive ? [248, 86, 86] : [56, 139, 253];
    midRGB  = isPositive ? [220, 38, 38] : [37, 99, 235];
  } else if (palette === "green-magenta") {
    coreRGB = isPositive ? [52, 211, 120] : [232, 92, 246];
    midRGB  = isPositive ? [22, 163, 74]  : [192, 38, 211];
  } else {
    // Yellow (+Δρ Accumulation) / Cyan (−Δρ Depletion)
    coreRGB = isPositive ? [255, 222, 46] : [34, 211, 238];
    midRGB  = isPositive ? [234, 170, 8]  : [6, 174, 206];
  }

  if (styleMode === "shaded") {
    // Soft 3D Phong-shaded translucent isosurface blob (NO harsh border rings!)
    const g = octx.createRadialGradient(cx - R * 0.28, cy - R * 0.28, R * 0.05, cx, cy, R);
    g.addColorStop(0.00, `rgba(255, 255, 255, 0.85)`);
    g.addColorStop(0.28, `rgba(${coreRGB[0]}, ${coreRGB[1]}, ${coreRGB[2]}, 0.72)`);
    g.addColorStop(0.72, `rgba(${midRGB[0]}, ${midRGB[1]}, ${midRGB[2]}, 0.44)`);
    g.addColorStop(0.92, `rgba(${midRGB[0]}, ${midRGB[1]}, ${midRGB[2]}, 0.14)`);
    g.addColorStop(1.00, `rgba(${midRGB[0]}, ${midRGB[1]}, ${midRGB[2]}, 0.00)`);
    octx.fillStyle = g;
    octx.fillRect(0, 0, sz, sz);
  } else {
    // True Gaussian Volumetric Electron Cloud Puff (feathers smoothly to 0 alpha at rim!)
    const g = octx.createRadialGradient(cx - R * 0.12, cy - R * 0.12, 0, cx, cy, R);
    g.addColorStop(0.00, `rgba(${coreRGB[0]}, ${coreRGB[1]}, ${coreRGB[2]}, 0.74)`);
    g.addColorStop(0.32, `rgba(${coreRGB[0]}, ${coreRGB[1]}, ${coreRGB[2]}, 0.48)`);
    g.addColorStop(0.62, `rgba(${midRGB[0]}, ${midRGB[1]}, ${midRGB[2]}, 0.22)`);
    g.addColorStop(0.84, `rgba(${midRGB[0]}, ${midRGB[1]}, ${midRGB[2]}, 0.06)`);
    g.addColorStop(1.00, `rgba(${midRGB[0]}, ${midRGB[1]}, ${midRGB[2]}, 0.00)`);
    octx.fillStyle = g;
    octx.fillRect(0, 0, sz, sz);
  }

  _CHDIFF_CLOUD_SPRITE_CACHE.set(key, off);
  return off;
}

function syncChdiffCloudStyle(val) {
  const mode = (val === "shaded") ? "shaded" : "clouds";
  CASTEP_STUDIO_STATE.chdiffState.cloudStyle = mode;
  const s1 = document.getElementById("castep-chdiff-cloud-style");
  const s2 = document.getElementById("vesta-chdiff-cloud-style");
  if (s1 && s1.value !== mode) s1.value = mode;
  if (s2 && s2.value !== mode) s2.value = mode;
  if (CASTEP_STUDIO_STATE.activeStagePane === "chdiff") renderCastepChdiffPlots();
  if (CASTEP_STUDIO_STATE.activeStagePane === "builder") renderCastep3DScene();
}
window.syncChdiffCloudStyle = syncChdiffCloudStyle;

function getOptPanelKeyAtClientPos(canvas, clientX, clientY) {
  const prop = document.getElementById("castep-opt-property")?.value || "multigrid";
  if (prop !== "multigrid") return "single";
  const rect = canvas.getBoundingClientRect();
  const mx = clientX - rect.left;
  const my = clientY - rect.top;
  const isRight = mx >= rect.width / 2;
  const isBottom = my >= rect.height / 2;
  if (!isBottom && !isRight) return "a";
  if (!isBottom && isRight) return "b";
  if (isBottom && !isRight) return "c";
  return "d";
}

function updateActiveOptPanelLabel(panelKey) {
  if (!["a", "b", "c", "d"].includes(panelKey)) return;
  CASTEP_STUDIO_STATE.activeOptPanel = panelKey;
  const sel = document.getElementById("castep-opt-zoom-target");
  if (sel && sel.options && sel.options[0]) {
    sel.options[0].textContent = `Zoom: Active Panel (${panelKey})`;
  }
}

function onCastepOptZoomTargetChange(val) {
  if (["a", "b", "c", "d"].includes(val)) {
    updateActiveOptPanelLabel(val);
    renderCastepOpticalPlots();
  }
}
window.onCastepOptZoomTargetChange = onCastepOptZoomTargetChange;

function zoomSingleOptPanel(panelKey, factor, anchorFrac = 0.5, zoomY = false) {
  const xAxisMode = document.getElementById("castep-opt-xaxis")?.value || "ev";
  if (!CASTEP_STUDIO_STATE.optPanelZooms[panelKey]) {
    CASTEP_STUDIO_STATE.optPanelZooms[panelKey] = { emin: 0, emax: null, nmMin: 180, nmMax: 1100, yScale: 1.0 };
  }
  const pz = CASTEP_STUDIO_STATE.optPanelZooms[panelKey];
  if (zoomY) {
    pz.yScale = Math.max(0.5, Math.min(12.0, (Number(pz.yScale) || 1.0) * factor));
    return;
  }
  const frac = Math.max(0.05, Math.min(0.95, anchorFrac));
  if (xAxisMode === "nm") {
    const curMin = pz.nmMin !== undefined ? pz.nmMin : 180;
    const curMax = pz.nmMax !== undefined ? pz.nmMax : 1100;
    const anchor = curMin + frac * (curMax - curMin);
    const newSpan = Math.max(60, Math.min(920, (curMax - curMin) / factor));
    let nMin = anchor - frac * newSpan;
    let nMax = nMin + newSpan;
    if (nMin < 180) { nMin = 180; nMax = Math.min(1100, 180 + newSpan); }
    if (nMax > 1100) { nMax = 1100; nMin = Math.max(180, 1100 - newSpan); }
    pz.nmMin = nMin;
    pz.nmMax = nMax;
  } else {
    const emaxLimit = parseFloat(document.getElementById("castep-opt-emax")?.value) || 15.0;
    const curMin = pz.emin !== undefined && pz.emin !== null ? pz.emin : 0;
    const curMax = pz.emax !== undefined && pz.emax !== null ? pz.emax : emaxLimit;
    const anchor = curMin + frac * (curMax - curMin);
    const newSpan = Math.max(0.4, Math.min(emaxLimit, (curMax - curMin) / factor));
    let nMin = anchor - frac * newSpan;
    let nMax = nMin + newSpan;
    if (nMin < 0) { nMin = 0; nMax = Math.min(emaxLimit, newSpan); }
    if (nMax > emaxLimit) { nMax = emaxLimit; nMin = Math.max(0, emaxLimit - newSpan); }
    pz.emin = nMin;
    pz.emax = nMax;
  }
}

function zoomCastepPlot(kind, factor, explicitPanelKey = null, anchorFrac = 0.5, zoomY = false) {
  const f = Number(factor) || 1.25;
  if (kind === "optics") {
    const prop = document.getElementById("castep-opt-property")?.value || "multigrid";
    if (prop !== "multigrid") {
      zoomSingleOptPanel("single", f, anchorFrac, zoomY);
    } else if (explicitPanelKey) {
      updateActiveOptPanelLabel(explicitPanelKey);
      zoomSingleOptPanel(explicitPanelKey, f, anchorFrac, zoomY);
    } else {
      const target = document.getElementById("castep-opt-zoom-target")?.value || "active";
      if (target === "all") {
        ["a", "b", "c", "d"].forEach(k => zoomSingleOptPanel(k, f, anchorFrac, zoomY));
      } else {
        const k = target === "active" ? (CASTEP_STUDIO_STATE.activeOptPanel || "a") : target;
        updateActiveOptPanelLabel(k);
        zoomSingleOptPanel(k, f, anchorFrac, zoomY);
      }
    }
    renderCastepOpticalPlots();
  } else if (kind === "electronic") {
    const elMin = document.getElementById("castep-elec-emin");
    const elMax = document.getElementById("castep-elec-emax");
    if (!elMin || !elMax) return;
    const curMin = parseFloat(elMin.value) || -5.0;
    const curMax = parseFloat(elMax.value) || 5.0;
    const mid = 0.5 * (curMin + curMax);
    const half = Math.max(0.4, Math.min(20.0, 0.5 * (curMax - curMin) / f));
    elMin.value = (mid - half).toFixed(2);
    elMax.value = (mid + half).toFixed(2);
    renderCastepElectronicPlots();
  } else if (kind === "chdiff") {
    CASTEP_STUDIO_STATE.chdiffState.zoom1D = Math.max(1.0, Math.min(8.0, (CASTEP_STUDIO_STATE.chdiffState.zoom1D || 1.0) * f));
    renderCastepChdiffPlots();
  } else if (kind === "convergence") {
    const cz = CASTEP_STUDIO_STATE.convZoom || (CASTEP_STUDIO_STATE.convZoom = { xMinFrac: 0.0, xMaxFrac: 1.0 });
    const mid = 0.5 * (cz.xMinFrac + cz.xMaxFrac);
    const half = Math.max(0.05, Math.min(0.5, 0.5 * (cz.xMaxFrac - cz.xMinFrac) / f));
    cz.xMinFrac = Math.max(0.0, mid - half);
    cz.xMaxFrac = Math.min(1.0, mid + half);
    renderCastepConvergencePlots();
  }
}
window.zoomCastepPlot = zoomCastepPlot;

function resetCastepPlotZoom(kind, explicitPanelKey = null) {
  if (kind === "optics_all") {
    resetAllOptPanelZooms();
    renderCastepOpticalPlots();
  } else if (kind === "optics") {
    const prop = document.getElementById("castep-opt-property")?.value || "multigrid";
    const def = () => ({ emin: 0.0, emax: null, nmMin: 180, nmMax: 1100, yScale: 1.0 });
    if (prop !== "multigrid") {
      CASTEP_STUDIO_STATE.optPanelZooms.single = def();
    } else if (explicitPanelKey) {
      CASTEP_STUDIO_STATE.optPanelZooms[explicitPanelKey] = def();
    } else {
      const target = document.getElementById("castep-opt-zoom-target")?.value || "active";
      if (target === "all") {
        resetAllOptPanelZooms();
      } else {
        const k = target === "active" ? (CASTEP_STUDIO_STATE.activeOptPanel || "a") : target;
        CASTEP_STUDIO_STATE.optPanelZooms[k] = def();
      }
    }
    renderCastepOpticalPlots();
  } else if (kind === "electronic") {
    const elMin = document.getElementById("castep-elec-emin");
    const elMax = document.getElementById("castep-elec-emax");
    if (elMin) elMin.value = "-5.0";
    if (elMax) elMax.value = "5.0";
    renderCastepElectronicPlots();
  } else if (kind === "chdiff") {
    CASTEP_STUDIO_STATE.chdiffState.zoom1D = 1.0;
    CASTEP_STUDIO_STATE.chdiffState.pan1D = 0.0;
    CASTEP_STUDIO_STATE.chdiffState.rot3DMatrix = null;
    renderCastepChdiffPlots();
  } else if (kind === "convergence") {
    CASTEP_STUDIO_STATE.convZoom = { xMinFrac: 0.0, xMaxFrac: 1.0 };
    renderCastepConvergencePlots();
  }
}
window.resetCastepPlotZoom = resetCastepPlotZoom;

function initCastep2DPlotsWheelZoom() {
  // Independent per-panel Wheel, Drag-Pan & Double-Click on Optical Properties 2x2 Canvas
  const optC = document.getElementById("castep-optics-canvas");
  if (optC && !optC._wheelZoomBound) {
    optC._wheelZoomBound = true;
    optC.addEventListener("wheel", (e) => {
      e.preventDefault();
      const pKey = getOptPanelKeyAtClientPos(optC, e.clientX, e.clientY);
      const prop = document.getElementById("castep-opt-property")?.value || "multigrid";
      const rect = optC.getBoundingClientRect();
      const hwPanelW = prop === "multigrid" ? (rect.width / 2) : rect.width;
      const localX = prop === "multigrid" ? ((e.clientX - rect.left) % hwPanelW) : (e.clientX - rect.left);
      const padL = 54, padR = pKey === "d" ? 48 : 16;
      const frac = Math.max(0.05, Math.min(0.95, (localX - padL) / Math.max(1, hwPanelW - padL - padR)));
      const factor = e.deltaY < 0 ? 1.20 : 0.83;
      zoomCastepPlot("optics", factor, pKey, frac, e.shiftKey);
    }, { passive: false });

    optC.addEventListener("dblclick", (e) => {
      const pKey = getOptPanelKeyAtClientPos(optC, e.clientX, e.clientY);
      resetCastepPlotZoom("optics", pKey);
    });

    optC.addEventListener("mousedown", (e) => {
      const pKey = getOptPanelKeyAtClientPos(optC, e.clientX, e.clientY);
      updateActiveOptPanelLabel(pKey);
      CASTEP_STUDIO_STATE.optDragState = { isDragging: true, panelKey: pKey, lastX: e.clientX };
      renderCastepOpticalPlots();
    });

    window.addEventListener("mousemove", (e) => {
      const ds = CASTEP_STUDIO_STATE.optDragState;
      if (!ds || !ds.isDragging) return;
      const dx = e.clientX - ds.lastX;
      ds.lastX = e.clientX;
      const pz = CASTEP_STUDIO_STATE.optPanelZooms[ds.panelKey];
      if (!pz) return;
      const xAxisMode = document.getElementById("castep-opt-xaxis")?.value || "ev";
      if (xAxisMode === "nm") {
        const curMin = pz.nmMin !== undefined ? pz.nmMin : 180;
        const curMax = pz.nmMax !== undefined ? pz.nmMax : 1100;
        const span = curMax - curMin;
        if (span >= 915) return;
        const shift = -dx * (span / 340);
        let nMin = curMin + shift, nMax = curMax + shift;
        if (nMin < 180) { nMin = 180; nMax = 180 + span; }
        if (nMax > 1100) { nMax = 1100; nMin = Math.max(180, 1100 - span); }
        pz.nmMin = nMin; pz.nmMax = nMax;
      } else {
        const emaxLimit = parseFloat(document.getElementById("castep-opt-emax")?.value) || 15.0;
        const curMin = pz.emin || 0;
        const curMax = pz.emax || emaxLimit;
        const span = curMax - curMin;
        if (span >= emaxLimit - 0.05) return;
        const shift = -dx * (span / 340);
        let nMin = curMin + shift, nMax = curMax + shift;
        if (nMin < 0) { nMin = 0; nMax = span; }
        if (nMax > emaxLimit) { nMax = emaxLimit; nMin = Math.max(0, emaxLimit - span); }
        pz.emin = nMin; pz.emax = nMax;
      }
      renderCastepOpticalPlots();
    });

    window.addEventListener("mouseup", () => {
      if (CASTEP_STUDIO_STATE.optDragState) CASTEP_STUDIO_STATE.optDragState.isDragging = false;
    });
  }

  // Standard Wheel & Double-Click for Band/DOS, Charge Diff & Convergence
  const bindWheel = (canvasId, kind) => {
    const canvas = document.getElementById(canvasId);
    if (!canvas || canvas._wheelZoomBound) return;
    canvas._wheelZoomBound = true;
    canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.18 : 0.85;
      zoomCastepPlot(kind, factor);
    }, { passive: false });
    canvas.addEventListener("dblclick", () => resetCastepPlotZoom(kind));
  };

  bindWheel("castep-electronic-canvas", "electronic");
  bindWheel("castep-chdiff-canvas", "chdiff");
  bindWheel("castep-energy-chart-canvas", "convergence");
  bindWheel("castep-conv-chart-canvas", "convergence");

  // Vertical energy drag-pan on Electronic Band/DOS canvas
  const elC = document.getElementById("castep-electronic-canvas");
  if (elC && !elC._dragPanBound) {
    elC._dragPanBound = true;
    elC.addEventListener("mousedown", (e) => {
      CASTEP_STUDIO_STATE.elecZoom.isDragging = true;
      CASTEP_STUDIO_STATE.elecZoom.lastY = e.clientY;
    });
    window.addEventListener("mousemove", (e) => {
      const ez = CASTEP_STUDIO_STATE.elecZoom;
      if (!ez || !ez.isDragging) return;
      const dy = e.clientY - ez.lastY;
      ez.lastY = e.clientY;
      const elMin = document.getElementById("castep-elec-emin");
      const elMax = document.getElementById("castep-elec-emax");
      if (!elMin || !elMax) return;
      const curMin = parseFloat(elMin.value) || -5.0;
      const curMax = parseFloat(elMax.value) || 5.0;
      const shift = dy * ((curMax - curMin) / 420);
      elMin.value = (curMin + shift).toFixed(2);
      elMax.value = (curMax + shift).toFixed(2);
      renderCastepElectronicPlots();
    });
    window.addEventListener("mouseup", () => {
      if (CASTEP_STUDIO_STATE.elecZoom) CASTEP_STUDIO_STATE.elecZoom.isDragging = false;
    });
  }
}


// ============================================================================
// 13. Client-Side Binary *.pdos_bin Parser & Full Mulliken / Magnetism Analyzer
// ============================================================================

function extractSpeciesOrderFromJobText(job) {
  const order = [];
  const seen = new Set();
  const addEl = (raw) => {
    const clean = castepCleanElement(raw);
    if (clean && !seen.has(clean)) { seen.add(clean); order.push(clean); }
  };
  if (job?.cell_text) {
    const m = job.cell_text.match(/%BLOCK\s+POSITIONS_(?:FRAC|ABS)([\s\S]*?)%ENDBLOCK\s+POSITIONS_(?:FRAC|ABS)/i);
    if (m) {
      m[1].split(/\r?\n/).forEach(l => {
        const c = l.split(/[#!\r]/)[0].trim();
        const p = c.split(/\s+/);
        if (p.length >= 4) addEl(p[0]);
      });
    }
  }
  if (!order.length && CASTEP_STUDIO_STATE.structure?.atoms?.length) {
    CASTEP_STUDIO_STATE.structure.atoms.forEach(a => addEl(a.element));
  }
  return order;
}

function parseCastepPdosBinArrayBuffer(arrayBuffer, bandsObj, speciesOrder, filename) {
  if (!arrayBuffer || arrayBuffer.byteLength < 120 || !bandsObj || !bandsObj.kpoints?.length) return null;
  try {
    const dv = new DataView(arrayBuffer);
    const totalLen = arrayBuffer.byteLength;
    const r0Be = dv.getInt32(0, false);
    const le = !(r0Be === 8 && dv.getInt32(12, false) === 8);
    let pos = 0;
    const readRec = () => {
      if (pos + 4 > totalLen) return null;
      const rl = dv.getInt32(pos, le);
      if (rl < 0 || pos + 4 + rl + 4 > totalLen) return null;
      const start = pos + 4;
      pos += 4 + rl + 4;
      return { start, len: rl };
    };

    const _v = readRec();
    const _h = readRec();
    const nkR = readRec(), nsR = readRec(), norbR = readRec(), neigR = readRec();
    if (!nkR || !nsR || !norbR || !neigR) return null;
    const nk = dv.getInt32(nkR.start, le);
    const ns = dv.getInt32(nsR.start, le);
    const norb = dv.getInt32(norbR.start, le);
    if (nk <= 0 || ns <= 0 || norb <= 0 || norb > 10000) return null;

    const spR = readRec(), ionR = readRec(), amR = readRec();
    if (!spR || !ionR || !amR) return null;
    const lNames = ["s", "p", "d", "f"];
    const orbMNames = {
      0: ["S"],
      1: ["Px", "Py", "Pz"],
      2: ["Dzz", "Dzy", "Dzx", "Dxx-yy", "Dxy"],
      3: ["Fzzz", "Fzzx", "Fzzy", "Fz(xx-yy)", "Fxyz", "Fx(xx-3yy)", "Fy(3xx-yy)"]
    };
    const chanMeta = {};
    const orbKeys = new Array(norb);
    const orbToMl = new Array(norb);
    const seenMl = {};
    for (let o = 0; o < norb; o++) {
      const spIdx = dv.getInt32(spR.start + o * 4, le);
      const ion = dv.getInt32(ionR.start + o * 4, le);
      const am = dv.getInt32(amR.start + o * 4, le);
      const el = (spIdx >= 1 && spIdx <= speciesOrder.length) ? speciesOrder[spIdx - 1] : `Sp${spIdx}`;
      const orb = lNames[am] || "s";
      const ck = `${el}|${ion}|${orb}`;
      orbKeys[o] = ck;
      if (!chanMeta[ck]) chanMeta[ck] = { element: el, ion, atom: `${el}${ion}`, orbital: orb };
      const mlKey = `${el}|${ion}|${am}`;
      const mCnt = seenMl[mlKey] || 0;
      seenMl[mlKey] = mCnt + 1;
      const mList = orbMNames[am];
      const mLbl = mList ? mList[mCnt % mList.length] : `L${am}_${mCnt}`;
      orbToMl[o] = { element: el, ion, mLbl };
    }

    const eMin = -20.0, eMax = 15.0, nBins = 1400;
    const dE = (eMax - eMin) / nBins;
    const invDE = 1.0 / dE;
    const chanKeys = Object.keys(chanMeta).sort((a, b) => {
      const ma = chanMeta[a], mb = chanMeta[b];
      return ma.element.localeCompare(mb.element) || (ma.ion - mb.ion) || ("spdf".indexOf(ma.orbital) - "spdf".indexOf(mb.orbital));
    });
    const keyToCidx = {};
    chanKeys.forEach((k, i) => { keyToCidx[k] = i; });
    const orbToCidx = orbKeys.map(k => keyToCidx[k]);
    const nChans = chanKeys.length;

    const bins = Array.from({ length: ns }, () => Array.from({ length: nChans }, () => new Float64Array(nBins)));
    const totBins = Array.from({ length: ns }, () => new Float64Array(nBins));
    const orbOcc = Array.from({ length: ns }, () => new Float64Array(norb));
    const kptsBands = bandsObj.kpoints || [];
    const spinDeg = ns >= 2 ? 1.0 : 2.0;

    for (let ik = 0; ik < nk; ik++) {
      const kr = readRec();
      if (!kr || kr.len < 28) break;
      const kIdx = dv.getInt32(kr.start, le);
      const kx = dv.getFloat64(kr.start + 4, le);
      const ky = dv.getFloat64(kr.start + 12, le);
      const kz = dv.getFloat64(kr.start + 20, le);

      let kpMatch = null;
      if (kIdx >= 1 && kIdx <= kptsBands.length) {
        const cand = kptsBands[kIdx - 1];
        const ck = cand.k || [0, 0, 0];
        if (Math.abs(ck[0] - kx) + Math.abs(ck[1] - ky) + Math.abs(ck[2] - kz) < 0.02) kpMatch = cand;
      }
      if (!kpMatch) {
        let bestD = 1e9;
        for (const cand of kptsBands) {
          const ck = cand.k || [0, 0, 0];
          const d = Math.abs(ck[0] - kx) + Math.abs(ck[1] - ky) + Math.abs(ck[2] - kz);
          if (d < bestD) { bestD = d; kpMatch = cand; }
        }
      }
      const wt = kpMatch?.w || (1.0 / nk);
      const wtEff = wt * spinDeg;

      for (let is = 0; is < ns; is++) {
        const sR = readRec(), nbR = readRec();
        if (!sR || !nbR) break;
        let sIdx = dv.getInt32(sR.start, le) - 1;
        if (sIdx < 0 || sIdx >= ns) sIdx = is;
        const nb = dv.getInt32(nbR.start, le);
        const eigList = kpMatch?.e?.[sIdx] || null;
        for (let b = 0; b < nb; b++) {
          const wR = readRec();
          if (!wR || wR.len < norb * 8) break;
          if (!eigList || b >= eigList.length) continue;
          const ev = eigList[b];
          const fOcc = ev <= -1.0 ? 1.0 : (ev >= 1.0 ? 0.0 : (1.0 / (1.0 + Math.exp(ev / 0.05))));
          const inHist = (ev >= eMin && ev < eMax);
          if (!inHist && fOcc <= 1e-9) continue;
          if (fOcc > 1e-9) {
            const occWt = wt * fOcc;
            const oAcc = orbOcc[sIdx];
            for (let o = 0; o < norb; o++) {
              const wv = dv.getFloat64(wR.start + o * 8, le);
              if (wv !== 0.0) oAcc[o] += occWt * wv;
            }
          }
          if (inHist) {
            const bIdx = Math.floor((ev - eMin) * invDE);
            if (bIdx >= 0 && bIdx < nBins) {
              totBins[sIdx][bIdx] += wtEff;
              const cBins = bins[sIdx];
              for (let o = 0; o < norb; o++) {
                const wv = dv.getFloat64(wR.start + o * 8, le);
                if (wv > 1e-6) cBins[orbToCidx[o]][bIdx] += wtEff * wv;
              }
            }
          }
        }
      }
    }

    const toSparse = (arr) => {
      const out = [];
      for (let i = 0; i < arr.length; i++) if (arr[i] > 1e-6) out.push([i, Number(arr[i].toFixed(5))]);
      return out;
    };
    const channels = chanKeys.map((ck, ci) => {
      const m = chanMeta[ck];
      const obj = { element: m.element, ion: m.ion, atom: m.atom, orbital: m.orbital, up: toSparse(bins[0][ci]) };
      if (ns >= 2) obj.dn = toSparse(bins[1][ci]);
      return obj;
    });
    const total_hist = { up: toSparse(totBins[0]) };
    if (ns >= 2) total_hist.dn = toSparse(totBins[1]);

    // Aggregate m-resolved orbital populations summing duplicate radial shells
    const atomOrbMap = {};
    const atomOrbOrder = [];
    for (let o = 0; o < norb; o++) {
      const { element: el, ion, mLbl } = orbToMl[o];
      const akey = `${el}|${ion}`;
      if (!atomOrbMap[akey]) {
        atomOrbMap[akey] = { element: el, ion, label: `${el}${ion}`, orbitals: {} };
        atomOrbOrder.push(akey);
      }
      const orbs = atomOrbMap[akey].orbitals;
      if (!orbs[mLbl]) orbs[mLbl] = { up: 0, dn: 0, charge: 0, spin: 0 };
      if (ns >= 2) {
        const u = orbOcc[0][o], d = orbOcc[1][o];
        orbs[mLbl].up += u;
        orbs[mLbl].dn += d;
        orbs[mLbl].charge += (u + d);
        orbs[mLbl].spin += (u - d);
      } else {
        const u = orbOcc[0][o];
        orbs[mLbl].up += u;
        orbs[mLbl].dn += u;
        orbs[mLbl].charge += (2.0 * u);
      }
    }
    const orbPopAtoms = atomOrbOrder.map(akey => {
      const ent = atomOrbMap[akey];
      const rOrbs = {};
      Object.entries(ent.orbitals).forEach(([k, v]) => {
        rOrbs[k] = {
          up: Number(v.up.toFixed(5)),
          dn: Number(v.dn.toFixed(5)),
          charge: Number(v.charge.toFixed(5)),
          spin: Number(v.spin.toFixed(5))
        };
      });
      return { element: ent.element, ion: ent.ion, label: ent.label, orbitals: rOrbs };
    });

    return {
      source_file: filename, nk, ns, norb, e_min: eMin, e_max: eMax, n_bins: nBins, dE,
      ef_ev: bandsObj.ef_ev || 0.0,
      elements: speciesOrder, total_hist, channels,
      orbital_populations: {
        mode: ns >= 2 ? "collinear" : "nonspin",
        source: "pdos_bin",
        source_file: filename,
        atoms: orbPopAtoms
      }
    };
  } catch (e) {
    return null;
  }
}

// --- Full CASTEP Mulliken Population, Spin Magnetism & Bond Length Parser ---
function parseCastepMullikenAnalysis(castepText) {
  if (!castepText || !castepText.includes("Atomic Populations (Mulliken)")) return null;
  const txt = castepText.replace(/\r\n/g, "\n");

  // 1) Extract last Integrated Spin Density & Integrated |Spin Density| (in hbar/2 == mu_B)
  let integratedSpin = null;
  let integratedAbsSpin = null;
  const spinMatches = [...txt.matchAll(/Integrated Spin Density\s*=\s*([-\d.E+]+)\s*(hbar\/2|hbar)?/gi)];
  if (spinMatches.length) {
    const last = spinMatches[spinMatches.length - 1];
    const mult = (last[2] && last[2].toLowerCase() === "hbar") ? 2.0 : 1.0;
    integratedSpin = parseFloat(last[1]) * mult;
  }
  const absSpinMatches = [...txt.matchAll(/Integrated \|Spin Density\|\s*=\s*([-\d.E+]+)\s*(hbar\/2|hbar)?/gi)];
  if (absSpinMatches.length) {
    const last = absSpinMatches[absSpinMatches.length - 1];
    const mult = (last[2] && last[2].toLowerCase() === "hbar") ? 2.0 : 1.0;
    integratedAbsSpin = parseFloat(last[1]) * mult;
  }

  // 2) Extract last Hirshfeld Analysis table for side-by-side comparison
  const hirshMap = {};
  const hIdx = txt.lastIndexOf("Hirshfeld Analysis");
  if (hIdx !== -1) {
    const hSub = txt.slice(hIdx, hIdx + 15000);
    const hm = hSub.match(/={15,}\n([\s\S]*?)={15,}/);
    if (hm) {
      hm[1].split("\n").forEach(l => {
        const m = l.match(/^\s*([A-Za-z]{1,2})\s+(\d+)\s+([-\d.]+)(?:\s+([-\d.]+))?/);
        if (m) {
          hirshMap[`${castepCleanElement(m[1])}${m[2]}`] = {
            charge: parseFloat(m[3]),
            spin: m[4] !== undefined ? parseFloat(m[4]) : null
          };
        }
      });
    }
  }

  // 3) Extract last Atomic Populations (Mulliken) table
  const mIdx = txt.lastIndexOf("Atomic Populations (Mulliken)");
  const mSub = txt.slice(mIdx, mIdx + 45000);
  const tblM = mSub.match(/={20,}\n([\s\S]*?)={20,}/);
  if (!tblM) return null;

  const isSpinHeader = /Spin\s*\(/i.test(mSub.slice(0, mSub.indexOf("====================")));
  const lines = tblM[1].split("\n");
  const atoms = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isSpinHeader) {
      const mUp = line.match(/^\s*([A-Za-z]{1,2})\s+(\d+)\s+up:\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)/);
      if (mUp) {
        const el = castepCleanElement(mUp[1]);
        const ion = parseInt(mUp[2], 10);
        const sUp = parseFloat(mUp[3]), pUp = parseFloat(mUp[4]), dUp = parseFloat(mUp[5]), fUp = parseFloat(mUp[6]), totUp = parseFloat(mUp[7]);
        const charge = parseFloat(mUp[8]), spin = parseFloat(mUp[9]);
        let sDn = sUp, pDn = pUp, dDn = dUp, fDn = fUp, totDn = totUp;
        if (i + 1 < lines.length) {
          const mDn = lines[i + 1].match(/^\s*(\d+)\s+dn:\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)/);
          if (mDn) {
            sDn = parseFloat(mDn[2]); pDn = parseFloat(mDn[3]); dDn = parseFloat(mDn[4]); fDn = parseFloat(mDn[5]); totDn = parseFloat(mDn[6]);
            i++;
          }
        }
        const label = `${el}${ion}`;
        const h = hirshMap[label] || {};
        atoms.push({
          element: el, ion, label,
          sUp, pUp, dUp, fUp, totUp,
          sDn, pDn, dDn, fDn, totDn,
          s: sUp + sDn, p: pUp + pDn, d: dUp + dDn, f: fUp + fDn, total: totUp + totDn,
          charge, spin,
          muS: sUp - sDn, muP: pUp - pDn, muD: dUp - dDn, muF: fUp - fDn,
          hirshfeldCharge: h.charge !== undefined ? h.charge : null,
          hirshfeldSpin: h.spin !== undefined ? h.spin : null
        });
      }
    } else {
      const m1 = line.match(/^\s*([A-Za-z]{1,2})\s+(\d+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)/);
      if (m1) {
        const el = castepCleanElement(m1[1]);
        const ion = parseInt(m1[2], 10);
        const s = parseFloat(m1[3]), p = parseFloat(m1[4]), d = parseFloat(m1[5]), f = parseFloat(m1[6]), total = parseFloat(m1[7]), charge = parseFloat(m1[8]);
        const label = `${el}${ion}`;
        const h = hirshMap[label] || {};
        atoms.push({
          element: el, ion, label,
          sUp: s / 2, pUp: p / 2, dUp: d / 2, fUp: f / 2, totUp: total / 2,
          sDn: s / 2, pDn: p / 2, dDn: d / 2, fDn: f / 2, totDn: total / 2,
          s, p, d, f, total, charge, spin: 0.0,
          muS: 0, muP: 0, muD: 0, muF: 0,
          hirshfeldCharge: h.charge !== undefined ? h.charge : null,
          hirshfeldSpin: h.spin !== undefined ? h.spin : null
        });
      }
    }
  }
  if (!atoms.length) return null;

  // 4) Extract Bond Populations & Bond Lengths table following Mulliken block
  const bonds = [];
  const afterAtoms = mSub.slice(mSub.indexOf(tblM[0]) + tblM[0].length);
  const bHdrIdx = afterAtoms.search(/Bond\s+Population/i);
  if (bHdrIdx !== -1) {
    const bSub = afterAtoms.slice(bHdrIdx, bHdrIdx + 35000);
    const bTblM = bSub.match(/={20,}\n([\s\S]*?)={20,}/);
    if (bTblM) {
      bTblM[1].split("\n").forEach(l => {
        // Spin-polarized format: "  C 23 -- N 23   1.81   -0.01   1.19146"
        const ms = l.match(/^\s*([A-Za-z]{1,2})\s+(\d+)\s+--\s+([A-Za-z]{1,2})\s+(\d+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)/);
        if (ms) {
          const e1 = castepCleanElement(ms[1]), i1 = ms[2], e2 = castepCleanElement(ms[3]), i2 = ms[4];
          const pop = parseFloat(ms[5]), bSpin = parseFloat(ms[6]), lenA = parseFloat(ms[7]);
          const pairType = [e1, e2].sort().join("–");
          const charLbl = pop < -0.02 ? "Antibonding" : (pop >= 0.75 ? "Strong Covalent" : (pop >= 0.30 ? "Covalent" : "Weak / Ionic"));
          bonds.push({ bond: `${e1}${i1} – ${e2}${i2}`, atom1: `${e1}${i1}`, atom2: `${e2}${i2}`, pairType, population: pop, spin: bSpin, lengthA: lenA, character: charLbl });
          return;
        }
        // Non-spin format: "  C 18 -- C 32   1.10   1.41662"
        const mn = l.match(/^\s*([A-Za-z]{1,2})\s+(\d+)\s+--\s+([A-Za-z]{1,2})\s+(\d+)\s+([-\d.]+)\s+([-\d.]+)/);
        if (mn) {
          const e1 = castepCleanElement(mn[1]), i1 = mn[2], e2 = castepCleanElement(mn[3]), i2 = mn[4];
          const pop = parseFloat(mn[5]), lenA = parseFloat(mn[6]);
          const pairType = [e1, e2].sort().join("–");
          const charLbl = pop < -0.02 ? "Antibonding" : (pop >= 0.75 ? "Strong Covalent" : (pop >= 0.30 ? "Covalent" : "Weak / Ionic"));
          bonds.push({ bond: `${e1}${i1} – ${e2}${i2}`, atom1: `${e1}${i1}`, atom2: `${e2}${i2}`, pairType, population: pop, spin: null, lengthA: lenA, character: charLbl });
        }
      });
    }
  }

  // 5) Aggregate Species, Orbital Magnetism, & Global Magnetic Order
  const sumSpin = atoms.reduce((s, a) => s + a.spin, 0);
  const sumAbsSpin = atoms.reduce((s, a) => s + Math.abs(a.spin), 0);
  const sumCharge = atoms.reduce((s, a) => s + a.charge, 0);
  const orbSpins = {
    s: atoms.reduce((acc, a) => acc + a.muS, 0),
    p: atoms.reduce((acc, a) => acc + a.muP, 0),
    d: atoms.reduce((acc, a) => acc + a.muD, 0),
    f: atoms.reduce((acc, a) => acc + a.muF, 0)
  };
  const netMag = integratedSpin !== null ? integratedSpin : sumSpin;
  const absMag = integratedAbsSpin !== null ? integratedAbsSpin : sumAbsSpin;
  let magneticOrder = "Non-Magnetic (NM)";
  if (absMag >= 0.03) {
    const ratio = Math.abs(netMag) / Math.max(absMag, 1e-6);
    if (ratio >= 0.80) magneticOrder = "Ferromagnetic (FM)";
    else if (Math.abs(netMag) < 0.08) magneticOrder = "Antiferromagnetic (AFM)";
    else magneticOrder = "Ferrimagnetic (FiM)";
  }

  const spMap = {};
  atoms.forEach(a => {
    if (!spMap[a.element]) {
      spMap[a.element] = { element: a.element, count: 0, sumCharge: 0, sumSpin: 0, absSpin: 0, s: 0, p: 0, d: 0, f: 0, muS: 0, muP: 0, muD: 0, muF: 0 };
    }
    const g = spMap[a.element];
    g.count++; g.sumCharge += a.charge; g.sumSpin += a.spin; g.absSpin += Math.abs(a.spin);
    g.s += a.s; g.p += a.p; g.d += a.d; g.f += a.f;
    g.muS += a.muS; g.muP += a.muP; g.muD += a.muD; g.muF += a.muF;
  });
  const speciesSummary = Object.values(spMap).map(g => ({
    ...g,
    avgCharge: g.sumCharge / g.count,
    avgSpin: g.sumSpin / g.count,
    pctMag: absMag > 0.01 ? (g.absSpin / Math.max(sumAbsSpin, 1e-6)) * 100 : 0
  })).sort((a, b) => b.absSpin - a.absSpin);

  return {
    isSpinPolarized: isSpinHeader,
    magneticOrder,
    integratedSpin: netMag,
    integratedAbsSpin: absMag,
    totalMullikenSpin: sumSpin,
    totalMullikenAbsSpin: sumAbsSpin,
    totalMullikenCharge: sumCharge,
    orbSpins,
    atoms,
    speciesSummary,
    bonds
  };
}

function attachMullikenSpinsToStructure(job) {
  if (!job || !job.castep_text) return;
  const mull = parseCastepMullikenAnalysis(job.castep_text);
  job._mullikenCache = mull;
  if (!mull || !CASTEP_STUDIO_STATE.structure?.atoms?.length) return;
  const byLbl = {};
  mull.atoms.forEach(a => { byLbl[a.label] = a; });
  CASTEP_STUDIO_STATE.structure.atoms.forEach(stAt => {
    const m = byLbl[stAt.label];
    if (m) {
      stAt.spin = m.spin;
      if (stAt.charge === null || stAt.charge === undefined) stAt.charge = m.charge;
    }
  });
  CASTEP_STUDIO_STATE.view3D._topoCacheKey = "";
}

function toggleSpinsInMain3DViewer() {
  CASTEP_STUDIO_STATE.view3D.showSpins = true;
  const chk = document.getElementById("vesta-chk-show-spins");
  if (chk) chk.checked = true;
  const job = (CASTEP_STUDIO_STATE.jobs || []).find(j => j.id === CASTEP_STUDIO_STATE.activeJobId);
  if (job) attachMullikenSpinsToStructure(job);
  switchCastepStagePane("builder");
  renderCastep3DScene();
}
window.toggleSpinsInMain3DViewer = toggleSpinsInMain3DViewer;

function renderCastepMullikenPane() {
  const job = (CASTEP_STUDIO_STATE.jobs || []).find(j => j.id === CASTEP_STUDIO_STATE.activeJobId);
  const mull = job ? (job._mullikenCache !== undefined ? job._mullikenCache : (job._mullikenCache = parseCastepMullikenAnalysis(job.castep_text || ""))) : null;

  const strip = document.getElementById("castep-mulliken-summary-strip");
  const magCanvas = document.getElementById("castep-mulliken-mag-canvas");
  const bondCanvas = document.getElementById("castep-mulliken-bond-canvas");
  const spCards = document.getElementById("castep-mulliken-species-cards");
  const atBody = document.getElementById("castep-mulliken-atoms-tbody");
  const bdBody = document.getElementById("castep-mulliken-bonds-tbody");

  if (!mull) {
    if (strip) strip.innerHTML = `<span><strong>Status:</strong> No Mulliken Population Analysis found in this job's <code>.castep</code> output log.</span>`;
    if (spCards) spCards.innerHTML = "";
    if (atBody) atBody.innerHTML = `<tr><td colspan="13" style="text-align:center; padding:18px; color:#64748b;">No Mulliken atomic populations in active job. Select a calculation with <code>.castep</code> Mulliken output.</td></tr>`;
    if (bdBody) bdBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:18px; color:#64748b;">No Mulliken bond populations found.</td></tr>`;
    [magCanvas, bondCanvas].forEach(c => {
      if (!c) return;
      const w = Math.max(260, Math.floor((c.parentElement?.clientWidth || 440) - 24));
      const h = 290, dpr = window.devicePixelRatio || 1;
      c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
      const ctx = c.getContext("2d"); ctx.save(); ctx.scale(dpr, dpr);
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#64748b"; ctx.font = "12.5px Inter, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("No Mulliken Population Analysis data in active .castep log", w / 2, h / 2);
      ctx.restore();
    });
    renderCastepSpinMatrix();
    return;
  }

  // Populate Element & Bond Pair Filter Dropdowns (preserving selection if valid)
  const elSel = document.getElementById("castep-mulliken-el-filter");
  if (elSel) {
    const prev = elSel.value || "all";
    const els = mull.speciesSummary.map(s => s.element);
    elSel.innerHTML = `<option value="all">All Elements (${mull.atoms.length})</option>` +
      els.map(e => `<option value="${escapeHtml(e)}">${escapeHtml(e)}</option>`).join("");
    if ([...elSel.options].some(o => o.value === prev)) elSel.value = prev;
  }
  const bpSel = document.getElementById("castep-mulliken-bond-filter");
  if (bpSel) {
    const prev = bpSel.value || "all";
    const pairs = [...new Set(mull.bonds.map(b => b.pairType))];
    bpSel.innerHTML = `<option value="all">All Pairs (${mull.bonds.length})</option>` +
      pairs.map(p => `<option value="${escapeHtml(p)}">${escapeHtml(p)}</option>`).join("");
    if ([...bpSel.options].some(o => o.value === prev)) bpSel.value = prev;
  }

  const elFilter = elSel?.value || "all";
  const bpFilter = bpSel?.value || "all";
  const chartMode = document.getElementById("castep-mulliken-chart-mode")?.value || "spin_atomic";

  const visAtoms = elFilter === "all" ? mull.atoms : mull.atoms.filter(a => a.element === elFilter);
  const visBonds = bpFilter === "all" ? mull.bonds : mull.bonds.filter(b => b.pairType === bpFilter);

  // 1) Update Global Magnetism & Population KPI Strip
  if (strip) {
    const phaseColor = mull.magneticOrder.includes("FM") ? "#dc2626" : (mull.magneticOrder.includes("AFM") ? "#2563eb" : (mull.magneticOrder.includes("FiM") ? "#9333ea" : "#475569"));
    const avgLen = mull.bonds.length ? (mull.bonds.reduce((s, b) => s + b.lengthA, 0) / mull.bonds.length) : 0;
    const os = mull.orbSpins;
    const domOrb = Object.entries(os).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0];
    strip.innerHTML = `
      <span style="color:${phaseColor};"><strong>Magnetic Phase:</strong> ${escapeHtml(mull.magneticOrder)}</span>
      <span><strong>Total Net Moment M<sub>net</sub>:</strong> ${mull.integratedSpin >= 0 ? "+" : ""}${mull.integratedSpin.toFixed(3)} μ<sub>B</sub></span>
      <span><strong>Absolute Spin M<sub>abs</sub>:</strong> ${mull.integratedAbsSpin.toFixed(3)} μ<sub>B</sub></span>
      <span><strong>Orbital Spin (s/p/d/f):</strong> ${os.s.toFixed(2)} / ${os.p.toFixed(2)} / ${os.d.toFixed(2)} / ${os.f.toFixed(2)} μ<sub>B</sub></span>
      <span><strong>Dominant:</strong> ${domOrb ? `${domOrb[0]}-orbital (${domOrb[1] >= 0 ? "+" : ""}${domOrb[1].toFixed(2)} μ<sub>B</sub>)` : "—"}</span>
      <span><strong>Bonds:</strong> ${mull.bonds.length} (Avg ${avgLen.toFixed(3)} Å)</span>
    `;
  }

  // 2) Render Species / Element Contribution Summary Cards
  if (spCards) {
    spCards.innerHTML = mull.speciesSummary.map(sp => {
      const col = getVestaElementColor(sp.element);
      return `
        <div class="castep-mulliken-sp-card">
          <div class="castep-mulliken-sp-head">
            <span style="display:inline-flex; align-items:center; gap:5px;">
              <span style="width:10px; height:10px; border-radius:50%; background:${col}; border:1px solid #334155;"></span>
              ${escapeHtml(sp.element)} <span style="font-weight:600; color:#64748b;">(${sp.count} atoms)</span>
            </span>
            <span style="color:${sp.sumSpin >= 0 ? "#dc2626" : "#2563eb"};">${sp.sumSpin >= 0 ? "+" : ""}${sp.sumSpin.toFixed(3)} μ<sub>B</sub></span>
          </div>
          <div class="castep-mulliken-orb-row"><span>Avg Charge:</span><strong>${sp.avgCharge >= 0 ? "+" : ""}${sp.avgCharge.toFixed(3)} e</strong></div>
          <div class="castep-mulliken-orb-row"><span>Mag. Share:</span><strong>${sp.pctMag.toFixed(1)}%</strong></div>
          <div class="castep-mulliken-orb-row"><span>μ<sub>s</sub> / μ<sub>p</sub>:</span><span>${sp.muS.toFixed(3)} / ${sp.muP.toFixed(3)}</span></div>
          <div class="castep-mulliken-orb-row"><span>μ<sub>d</sub> / μ<sub>f</sub>:</span><span><strong>${sp.muD.toFixed(3)}</strong> / ${sp.muF.toFixed(3)}</span></div>
        </div>
      `;
    }).join("");
  }

  // 3) Render Left Chart: Atomic / Orbital Magnetism or Charge Comparison
  const stM = getCastepPlotStyle();
  const outTickM = stM.tickDir === "out" ? (stM.tickLength || 5) + 1 : 0;

  if (magCanvas) {
    const w = Math.max(260, Math.floor((magCanvas.parentElement?.clientWidth || 440) - 24));
    const h = 310, dpr = getCastepCanvasDpr(w, h);
    magCanvas.width = Math.round(w * dpr); magCanvas.height = Math.round(h * dpr);
    magCanvas.style.width = `${w}px`; magCanvas.style.height = `${h}px`;
    const ctx = magCanvas.getContext("2d");
    ctx.save(); ctx.scale(dpr, dpr);
    applyCrispCanvasQuality(ctx);
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, w, h);

    const padL = Math.round(58 + Math.max(0, (stM.tickSize - 12) * 2) + outTickM);
    const padR = 16, padT = Math.round(28 + Math.max(0, stM.legendSize - 11));
    const padB = Math.round(48 + outTickM);
    const pw = w - padL - padR, ph = h - padT - padB;

    const titleEl = document.getElementById("castep-mulliken-mag-title");

    if (chartMode === "spin_atomic") {
      if (titleEl) titleEl.innerHTML = "Atomic Magnetic Moment Contribution μ<sub>i</sub> (μ<sub>B</sub>)";
      const sorted = [...visAtoms].sort((a, b) => Math.abs(b.spin) - Math.abs(a.spin)).slice(0, 24);
      let maxAbs = Math.max(0.1, ...sorted.map(a => Math.abs(a.spin))) * 1.15;
      const toY = (v) => padT + ph * (0.5 - v / (2 * maxAbs));
      const y0 = toY(0);
      const yTicksPx = [toY(maxAbs), toY(maxAbs * 0.5), y0, toY(-maxAbs * 0.5), toY(-maxAbs)];
      drawPubGridLines(ctx, padL, padT, pw, ph, stM, [], yTicksPx);
      ctx.beginPath(); ctx.moveTo(padL, Math.round(y0) + 0.5); ctx.lineTo(padL + pw, Math.round(y0) + 0.5);
      ctx.strokeStyle = stM.inkColor; ctx.lineWidth = Math.max(1.0, stM.borderWidth * 0.65); ctx.stroke();

      const bw = Math.max(4, (pw / Math.max(1, sorted.length)) * 0.72);
      const step = pw / Math.max(1, sorted.length);
      const xTicksPx = [];
      sorted.forEach((a, i) => {
        const cx = padL + (i + 0.5) * step;
        xTicksPx.push(cx);
        const yv = toY(a.spin);
        ctx.fillStyle = a.spin >= 0 ? "#dc2626" : "#2563eb";
        ctx.fillRect(cx - bw / 2, Math.min(y0, yv), bw, Math.max(1.5, Math.abs(yv - y0)));
        if (sorted.length <= 16 || i % 2 === 0) {
          ctx.save(); ctx.translate(cx, padT + ph + 8 + outTickM); ctx.rotate(-Math.PI / 4);
          ctx.fillStyle = stM.inkColor; ctx.font = castepPlotFont("tick", 0.85); ctx.textAlign = "right"; ctx.textBaseline = "middle";
          ctx.fillText(a.label, 0, 0); ctx.restore();
        }
      });
      drawPubAxisBox(ctx, padL, padT, pw, ph, stM, { compact: true, xTicks: xTicksPx.length <= 16 ? xTicksPx : [], yTicks: yTicksPx, mirrorRight: true });
      ctx.fillStyle = stM.inkColor; ctx.font = castepPlotFont("tick", 0.90); ctx.textAlign = "right"; ctx.textBaseline = "middle";
      ctx.fillText(`+${maxAbs.toFixed(2)}`, padL - 6 - outTickM, padT + 4);
      ctx.fillText("0.00", padL - 6 - outTickM, y0);
      ctx.fillText(formatPubMinus(`-${maxAbs.toFixed(2)}`), padL - 6 - outTickM, padT + ph - 4);
      ctx.font = castepPlotFont("legend", 0.92, "bold"); ctx.textAlign = "right"; ctx.textBaseline = "alphabetic";
      const lblDn = "■ \u2212μ_{B} (↓)";
      const lblUp = "■ +μ_{B} (↑)";
      const wDn = measureSciText(ctx, lblDn);
      ctx.fillStyle = "#2563eb";
      drawSciText(ctx, lblDn, padL + pw, padT - 9);
      ctx.fillStyle = "#dc2626";
      drawSciText(ctx, lblUp, padL + pw - wDn - 14, padT - 9);
    } else if (chartMode === "spin_orbital" || chartMode === "elec_orbital") {
      const isMag = chartMode === "spin_orbital";
      if (titleEl) titleEl.innerHTML = isMag ? "Orbital Magnetic Contribution (μ<sub>s</sub>, μ<sub>p</sub>, μ<sub>d</sub>, μ<sub>f</sub>) by Element" : "Avg Orbital Electron Population (s, p, d, f) by Element";
      const spList = elFilter === "all" ? mull.speciesSummary : mull.speciesSummary.filter(s => s.element === elFilter);
      const orbKeys = isMag ? ["muS", "muP", "muD", "muF"] : ["s", "p", "d", "f"];
      const orbCols = ["#2563eb", "#16a34a", "#dc2626", "#9333ea"];
      const orbLbls = isMag ? ["μ_{s}", "μ_{p}", "μ_{d}", "μ_{f}"] : ["s", "p", "d", "f"];

      let minV = 0, maxV = 0.1;
      spList.forEach(sp => {
        orbKeys.forEach(k => {
          const val = isMag ? sp[k] : (sp[k] / sp.count);
          if (val < minV) minV = val;
          if (val > maxV) maxV = val;
        });
      });
      const absMax = Math.max(Math.abs(minV), Math.abs(maxV), 0.1) * 1.15;
      const toY = isMag ? (v) => padT + ph * (0.5 - v / (2 * absMax)) : (v) => padT + ph * (1 - v / absMax);
      const y0 = toY(0);
      const yTicksPx = isMag ? [padT, toY(absMax * 0.5), y0, toY(-absMax * 0.5), padT + ph] : [padT, padT + ph * 0.5, padT + ph];
      drawPubGridLines(ctx, padL, padT, pw, ph, stM, [], yTicksPx);
      ctx.beginPath(); ctx.moveTo(padL, Math.round(y0) + 0.5); ctx.lineTo(padL + pw, Math.round(y0) + 0.5);
      ctx.strokeStyle = stM.inkColor; ctx.lineWidth = Math.max(1.0, stM.borderWidth * 0.65); ctx.stroke();

      const grpW = pw / Math.max(1, spList.length);
      const barW = Math.max(5, Math.min(20, (grpW * 0.72) / 4));
      const xTicksPx = [];
      spList.forEach((sp, si) => {
        const gx = padL + (si + 0.5) * grpW;
        xTicksPx.push(gx);
        orbKeys.forEach((k, oi) => {
          const val = isMag ? sp[k] : (sp[k] / sp.count);
          const bx = gx + (oi - 1.5) * (barW + 1.5) - barW / 2;
          const yv = toY(val);
          ctx.fillStyle = orbCols[oi];
          ctx.fillRect(bx, Math.min(y0, yv), barW, Math.max(1.5, Math.abs(yv - y0)));
        });
        ctx.fillStyle = stM.inkColor; ctx.font = castepPlotFont("tick", 0.96, stM.boldAxes ? "bold" : ""); ctx.textAlign = "center"; ctx.textBaseline = "top";
        ctx.fillText(sp.element, gx, padT + ph + 7 + outTickM);
      });
      drawPubAxisBox(ctx, padL, padT, pw, ph, stM, { compact: true, xTicks: xTicksPx, yTicks: yTicksPx, mirrorRight: true });
      ctx.fillStyle = stM.inkColor; ctx.font = castepPlotFont("tick", 0.90); ctx.textAlign = "right"; ctx.textBaseline = "middle";
      ctx.fillText(absMax.toFixed(2), padL - 6 - outTickM, padT + 4);
      ctx.fillText("0.00", padL - 6 - outTickM, y0);
      if (isMag) ctx.fillText(formatPubMinus((-absMax).toFixed(2)), padL - 6 - outTickM, padT + ph - 4);
      let lx = padL + pw;
      ctx.font = castepPlotFont("legend", 0.92, "bold"); ctx.textAlign = "right"; ctx.textBaseline = "alphabetic";
      for (let oi = 3; oi >= 0; oi--) {
        ctx.fillStyle = orbCols[oi];
        const t = `■ ${orbLbls[oi]}`;
        drawSciText(ctx, t, lx, padT - 9);
        lx -= measureSciText(ctx, t) + 12;
      }
    } else {
      if (titleEl) titleEl.textContent = "Atomic Charge Comparison: Mulliken vs. Hirshfeld (e)";
      const sample = visAtoms.slice(0, 20);
      let absMax = Math.max(0.2, ...sample.map(a => Math.max(Math.abs(a.charge), Math.abs(a.hirshfeldCharge || 0)))) * 1.18;
      const toY = (v) => padT + ph * (0.5 - v / (2 * absMax));
      const y0 = toY(0);
      const yTicksPx = [padT, y0, padT + ph];
      drawPubGridLines(ctx, padL, padT, pw, ph, stM, [], yTicksPx);
      ctx.beginPath(); ctx.moveTo(padL, Math.round(y0) + 0.5); ctx.lineTo(padL + pw, Math.round(y0) + 0.5);
      ctx.strokeStyle = stM.inkColor; ctx.lineWidth = Math.max(1.0, stM.borderWidth * 0.65); ctx.stroke();
      const step = pw / Math.max(1, sample.length);
      const bw = Math.max(3, Math.min(12, step * 0.36));
      sample.forEach((a, i) => {
        const cx = padL + (i + 0.5) * step;
        const ym = toY(a.charge);
        ctx.fillStyle = "#2563eb";
        ctx.fillRect(cx - bw - 0.5, Math.min(y0, ym), bw, Math.max(1.5, Math.abs(ym - y0)));
        if (a.hirshfeldCharge !== null) {
          const yh = toY(a.hirshfeldCharge);
          ctx.fillStyle = "#ea580c";
          ctx.fillRect(cx + 0.5, Math.min(y0, yh), bw, Math.max(1.5, Math.abs(yh - y0)));
        }
        ctx.save(); ctx.translate(cx, padT + ph + 8 + outTickM); ctx.rotate(-Math.PI / 4);
        ctx.fillStyle = stM.inkColor; ctx.font = castepPlotFont("tick", 0.84); ctx.textAlign = "right"; ctx.textBaseline = "middle";
        ctx.fillText(a.label, 0, 0); ctx.restore();
      });
      drawPubAxisBox(ctx, padL, padT, pw, ph, stM, { compact: true, yTicks: yTicksPx, mirrorRight: true });
      ctx.fillStyle = stM.inkColor; ctx.font = castepPlotFont("tick", 0.90); ctx.textAlign = "right"; ctx.textBaseline = "middle";
      ctx.fillText(`+${absMax.toFixed(2)}`, padL - 6 - outTickM, padT + 4);
      ctx.fillText("0.00", padL - 6 - outTickM, y0);
      ctx.fillText(formatPubMinus(`-${absMax.toFixed(2)}`), padL - 6 - outTickM, padT + ph - 4);
      ctx.fillStyle = "#2563eb"; ctx.font = castepPlotFont("legend", 0.92, "bold"); ctx.textAlign = "right"; ctx.textBaseline = "alphabetic";
      ctx.fillText("■ Mulliken   ", padL + pw - 68, padT - 9);
      ctx.fillStyle = "#ea580c"; ctx.fillText("■ Hirshfeld", padL + pw, padT - 9);
    }
    ctx.restore();
  }

  // 4) Render Right Chart: Mulliken Bond Population vs Bond Length (Å)
  if (bondCanvas) {
    const w = Math.max(260, Math.floor((bondCanvas.parentElement?.clientWidth || 440) - 24));
    const h = 310, dpr = getCastepCanvasDpr(w, h);
    bondCanvas.width = Math.round(w * dpr); bondCanvas.height = Math.round(h * dpr);
    bondCanvas.style.width = `${w}px`; bondCanvas.style.height = `${h}px`;
    const ctx = bondCanvas.getContext("2d");
    ctx.save(); ctx.scale(dpr, dpr);
    applyCrispCanvasQuality(ctx);
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, w, h);

    const padL = Math.round(58 + Math.max(0, (stM.tickSize - 12) * 2) + outTickM);
    const padR = 16, padT = Math.round(28 + Math.max(0, stM.legendSize - 11));
    const padB = Math.round(44 + outTickM);
    const pw = w - padL - padR, ph = h - padT - padB;

    if (!visBonds.length) {
      drawPubAxisBox(ctx, padL, padT, pw, ph, stM, { compact: true });
      ctx.fillStyle = "#64748b"; ctx.font = castepPlotFont("tick"); ctx.textAlign = "center";
      ctx.fillText("No Mulliken bond pairs available", padL + pw / 2, padT + ph / 2);
      ctx.restore();
    } else {
      let minL = Math.min(...visBonds.map(b => b.lengthA));
      let maxL = Math.max(...visBonds.map(b => b.lengthA));
      const padSpanL = Math.max(0.15, (maxL - minL) * 0.12);
      minL = Math.max(0.5, minL - padSpanL); maxL += padSpanL;

      let minP = Math.min(0, ...visBonds.map(b => b.population)) - 0.1;
      let maxP = Math.max(0.5, ...visBonds.map(b => b.population)) * 1.15;

      const toX = (x) => padL + ((x - minL) / ((maxL - minL) || 1)) * pw;
      const toY = (y) => padT + ph * (1 - (y - minP) / ((maxP - minP) || 1));

      const yTicksVals = [0, 1, 2, 3, 4].map(g => minP + (maxP - minP) * (g / 4));
      const xTicksVals = [0, 1, 2, 3, 4].map(g => minL + (maxL - minL) * (g / 4));
      const yTicksPx = yTicksVals.map(v => toY(v));
      const xTicksPx = xTicksVals.map(v => toX(v));

      ctx.save();
      ctx.beginPath(); ctx.rect(padL, padT, pw, ph); ctx.clip();
      drawPubGridLines(ctx, padL, padT, pw, ph, stM, xTicksPx, yTicksPx);

      const yZero = Math.round(toY(0)) + 0.5;
      ctx.beginPath(); ctx.moveTo(padL, yZero); ctx.lineTo(padL + pw, yZero);
      ctx.setLineDash([4, 3]); ctx.strokeStyle = stM.inkColor; ctx.lineWidth = Math.max(0.9, stM.borderWidth * 0.6); ctx.stroke(); ctx.setLineDash([]);

      const pairTypes = [...new Set(visBonds.map(b => b.pairType))];
      const pairCol = {};
      pairTypes.forEach((pt, idx) => { pairCol[pt] = PDOS_CURVE_PALETTE[idx % PDOS_CURVE_PALETTE.length]; });

      visBonds.forEach(b => {
        const sx = toX(b.lengthA), sy = toY(b.population);
        ctx.beginPath();
        ctx.arc(sx, sy, 5.2, 0, Math.PI * 2);
        ctx.fillStyle = pairCol[b.pairType] + "cc";
        ctx.fill();
        ctx.strokeStyle = stM.inkColor; ctx.lineWidth = 0.85; ctx.stroke();
      });
      ctx.restore();

      drawPubAxisBox(ctx, padL, padT, pw, ph, stM, { compact: true, xTicks: xTicksPx, yTicks: yTicksPx, mirrorTop: true, mirrorRight: true });

      // Legend for bond pairs
      const pairTypesLeg = [...new Set(visBonds.map(b => b.pairType))];
      const pairColLeg = {};
      pairTypesLeg.forEach((pt, idx) => { pairColLeg[pt] = PDOS_CURVE_PALETTE[idx % PDOS_CURVE_PALETTE.length]; });
      let lx = padL + pw;
      ctx.font = castepPlotFont("legend", 0.90, "bold"); ctx.textAlign = "right"; ctx.textBaseline = "alphabetic";
      for (let i = Math.min(pairTypesLeg.length - 1, 5); i >= 0; i--) {
        const pt = pairTypesLeg[i];
        ctx.fillStyle = pairColLeg[pt];
        const lbl = `● ${pt}`;
        ctx.fillText(lbl, lx, padT - 9);
        lx -= ctx.measureText(lbl).width + 9;
      }

      // Ticks & axis label
      ctx.fillStyle = stM.inkColor; ctx.font = castepPlotFont("tick", 0.90); ctx.textAlign = "right"; ctx.textBaseline = "middle";
      yTicksVals.forEach(pv => {
        ctx.fillText(formatPubMinus(pv.toFixed(2)), padL - 6 - outTickM, toY(pv));
      });
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      const txY = padT + ph + 6 + outTickM;
      xTicksVals.forEach(lv => {
        ctx.fillText(lv.toFixed(2), toX(lv), txY);
      });
      ctx.font = castepPlotFont("axis", 0.94); ctx.fillStyle = stM.inkColor;
      ctx.fillText("Bond Length (Å)", padL + pw / 2, txY + Math.round(stM.tickSize * 0.90) + 4);
      ctx.restore();
    }
  }

  // 5) Populate Atomic Mulliken Table
  const atBadge = document.getElementById("castep-mulliken-atoms-count");
  if (atBadge) atBadge.textContent = `${visAtoms.length} atoms`;
  if (atBody) {
    atBody.innerHTML = visAtoms.map(a => {
      const spStyle = Math.abs(a.spin) >= 0.05 ? (a.spin > 0 ? "color:#dc2626; font-weight:800;" : "color:#2563eb; font-weight:800;") : "color:#64748b;";
      return `
        <tr>
          <td><strong>${escapeHtml(a.label)}</strong></td>
          <td>${a.s.toFixed(3)}</td>
          <td>${a.p.toFixed(3)}</td>
          <td>${a.d.toFixed(3)}</td>
          <td>${a.f.toFixed(3)}</td>
          <td><strong>${a.total.toFixed(3)}</strong></td>
          <td>${a.charge >= 0 ? "+" : ""}${a.charge.toFixed(3)}</td>
          <td style="${spStyle}">${a.spin >= 0 ? "+" : ""}${a.spin.toFixed(3)}</td>
          <td>${a.muS.toFixed(3)}</td>
          <td>${a.muP.toFixed(3)}</td>
          <td style="${Math.abs(a.muD) >= 0.05 ? "font-weight:800;" : ""}">${a.muD.toFixed(3)}</td>
          <td>${a.muF.toFixed(3)}</td>
          <td>${a.hirshfeldCharge !== null ? a.hirshfeldCharge.toFixed(2) : "—"}</td>
        </tr>
      `;
    }).join("");
  }

  // 6) Populate Bond Populations & Lengths Table
  const bdBadge = document.getElementById("castep-mulliken-bonds-count");
  if (bdBadge) bdBadge.textContent = `${visBonds.length} bonds`;
  if (bdBody) {
    bdBody.innerHTML = visBonds.length ? visBonds.map(b => {
      const popStyle = b.population < 0 ? "color:#dc2626; font-weight:700;" : (b.population >= 0.75 ? "color:#15803d; font-weight:800;" : "color:#0f172a; font-weight:700;");
      return `
        <tr>
          <td><strong>${escapeHtml(b.bond)}</strong></td>
          <td><span class="castep-file-chip">${escapeHtml(b.pairType)}</span></td>
          <td><strong>${b.lengthA.toFixed(5)}</strong></td>
          <td style="${popStyle}">${b.population.toFixed(2)}</td>
          <td>${b.spin !== null ? b.spin.toFixed(2) : "—"}</td>
          <td style="font-size:10.5px;">${escapeHtml(b.character)}</td>
        </tr>
      `;
    }).join("") : `<tr><td colspan="6" style="text-align:center; padding:14px; color:#64748b;">No bonds match the selected pair filter.</td></tr>`;
  }

  // 7) Render Orbital-Resolved Spin Matrix Card (all elements & s/p/d/f sub-orbitals)
  renderCastepSpinMatrix();
}
window.renderCastepMullikenPane = renderCastepMullikenPane;

// ============================================================================
// Orbital-Resolved Spin Matrix Engine & Publication Heatmap Renderer (v134)
// Supports ALL elements & ALL s/p/d/f sub-orbitals from:
//   1) CASTEP .castep "Orbital Populations" (Collinear, Non-Collinear SOC, Non-Spin)
//   2) CASTEP *.pdos_bin + *.bands exact m-resolved integration below E_F
//   3) Mulliken Atomic Populations shell-level (s, p, d, f) fallback
// ============================================================================

const CASTEP_ORBITAL_SHELLS = {
  s: ["S"],
  p: ["Px", "Py", "Pz"],
  d: ["Dzz", "Dzy", "Dzx", "Dxx-yy", "Dxy"],
  f: ["Fzzz", "Fzzx", "Fzzy", "Fz(xx-yy)", "Fxyz", "Fx(xx-3yy)", "Fy(3xx-yy)"],
  spdf: ["shell_s", "shell_p", "shell_d", "shell_f"]
};

const CASTEP_ORBITAL_ALL_ORDER = [
  ...CASTEP_ORBITAL_SHELLS.s,
  ...CASTEP_ORBITAL_SHELLS.p,
  ...CASTEP_ORBITAL_SHELLS.d,
  ...CASTEP_ORBITAL_SHELLS.f
];

const CASTEP_ORBITAL_SPEC = {
  "S":          { shell: "s", base: "s", sub: [], html: "<i>s</i>", plain: "s" },
  "Px":         { shell: "p", base: "p", sub: [{ t: "x", it: true }], html: "<i>p</i><sub><i>x</i></sub>", plain: "px" },
  "Py":         { shell: "p", base: "p", sub: [{ t: "y", it: true }], html: "<i>p</i><sub><i>y</i></sub>", plain: "py" },
  "Pz":         { shell: "p", base: "p", sub: [{ t: "z", it: true }], html: "<i>p</i><sub><i>z</i></sub>", plain: "pz" },
  "Dzz":        { shell: "d", base: "d", sub: [{ t: "z", it: true }, { t: "2", sup: true }], html: "<i>d</i><sub><i>z</i><sup>2</sup></sub>", plain: "dz2" },
  "Dzy":        { shell: "d", base: "d", sub: [{ t: "zy", it: true }], html: "<i>d</i><sub><i>zy</i></sub>", plain: "dzy" },
  "Dzx":        { shell: "d", base: "d", sub: [{ t: "zx", it: true }], html: "<i>d</i><sub><i>zx</i></sub>", plain: "dzx" },
  "Dxx-yy":     { shell: "d", base: "d", sub: [{ t: "x", it: true }, { t: "2", sup: true }, { t: "\u2212", it: false }, { t: "y", it: true }, { t: "2", sup: true }], html: "<i>d</i><sub><i>x</i><sup>2</sup>\u2212<i>y</i><sup>2</sup></sub>", plain: "dx2-y2" },
  "Dxy":        { shell: "d", base: "d", sub: [{ t: "xy", it: true }], html: "<i>d</i><sub><i>xy</i></sub>", plain: "dxy" },
  "Fzzz":       { shell: "f", base: "f", sub: [{ t: "z", it: true }, { t: "3", sup: true }], html: "<i>f</i><sub><i>z</i><sup>3</sup></sub>", plain: "fz3" },
  "Fzzx":       { shell: "f", base: "f", sub: [{ t: "xz", it: true }, { t: "2", sup: true }], html: "<i>f</i><sub><i>xz</i><sup>2</sup></sub>", plain: "fxz2" },
  "Fzzy":       { shell: "f", base: "f", sub: [{ t: "yz", it: true }, { t: "2", sup: true }], html: "<i>f</i><sub><i>yz</i><sup>2</sup></sub>", plain: "fyz2" },
  "Fz(xx-yy)":  { shell: "f", base: "f", sub: [{ t: "z", it: true }, { t: "(", it: false }, { t: "x", it: true }, { t: "2", sup: true }, { t: "\u2212", it: false }, { t: "y", it: true }, { t: "2", sup: true }, { t: ")", it: false }], html: "<i>f</i><sub><i>z</i>(<i>x</i><sup>2</sup>\u2212<i>y</i><sup>2</sup>)</sub>", plain: "fz(x2-y2)" },
  "Fxyz":       { shell: "f", base: "f", sub: [{ t: "xyz", it: true }], html: "<i>f</i><sub><i>xyz</i></sub>", plain: "fxyz" },
  "Fx(xx-3yy)": { shell: "f", base: "f", sub: [{ t: "x", it: true }, { t: "(", it: false }, { t: "x", it: true }, { t: "2", sup: true }, { t: "\u22123", it: false }, { t: "y", it: true }, { t: "2", sup: true }, { t: ")", it: false }], html: "<i>f</i><sub><i>x</i>(<i>x</i><sup>2</sup>\u22123<i>y</i><sup>2</sup>)</sub>", plain: "fx(x2-3y2)" },
  "Fy(3xx-yy)": { shell: "f", base: "f", sub: [{ t: "y", it: true }, { t: "(3", it: false }, { t: "x", it: true }, { t: "2", sup: true }, { t: "\u2212", it: false }, { t: "y", it: true }, { t: "2", sup: true }, { t: ")", it: false }], html: "<i>f</i><sub><i>y</i>(3<i>x</i><sup>2</sup>\u2212<i>y</i><sup>2</sup>)</sub>", plain: "fy(3x2-y2)" },
  "shell_s":    { shell: "spdf", base: "s", sub: [], html: "<i>s</i>-shell", plain: "s" },
  "shell_p":    { shell: "spdf", base: "p", sub: [], html: "<i>p</i>-shell", plain: "p" },
  "shell_d":    { shell: "spdf", base: "d", sub: [], html: "<i>d</i>-shell", plain: "d" },
  "shell_f":    { shell: "spdf", base: "f", sub: [], html: "<i>f</i>-shell", plain: "f" }
};

function canonicalizeCastepOrbitalName(raw) {
  if (!raw) return "";
  const s = String(raw).trim();
  if (CASTEP_ORBITAL_SPEC[s]) return s;
  const low = s.toLowerCase().replace(/\s+/g, "");
  const alias = {
    "s": "S", "px": "Px", "py": "Py", "pz": "Pz",
    "dzz": "Dzz", "dz2": "Dzz", "d3z2-r2": "Dzz",
    "dzy": "Dzy", "dyz": "Dzy",
    "dzx": "Dzx", "dxz": "Dzx",
    "dxx-yy": "Dxx-yy", "dx2-y2": "Dxx-yy",
    "dxy": "Dxy",
    "fzzz": "Fzzz", "fz3": "Fzzz",
    "fzzx": "Fzzx", "fxz2": "Fzzx",
    "fzzy": "Fzzy", "fyz2": "Fzzy",
    "fz(xx-yy)": "Fz(xx-yy)", "fz(x2-y2)": "Fz(xx-yy)",
    "fxyz": "Fxyz",
    "fx(xx-3yy)": "Fx(xx-3yy)", "fx(x2-3y2)": "Fx(xx-3yy)",
    "fy(3xx-yy)": "Fy(3xx-yy)", "fy(3x2-y2)": "Fy(3xx-yy)"
  };
  return alias[low] || s;
}

function parseCastepOrbitalPopulations(castepText) {
  if (!castepText || !castepText.includes("Orbital Populations")) return null;
  const txt = castepText.replace(/\r\n/g, "\n");
  const idx = txt.lastIndexOf("Orbital Populations");
  if (idx === -1) return null;
  const sub = txt.slice(idx, idx + 250000);
  const lines = sub.split("\n");

  let hdrIdx = -1;
  let mode = "nonspin";
  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    const l = lines[i];
    if (/Ion\s+Atom\s+Orbital/i.test(l)) {
      hdrIdx = i;
      if (/Spin\s*\(\s*Sx/i.test(l)) mode = "noncollinear";
      else if (/Up\s+Down\s+Spin/i.test(l)) mode = "collinear";
      else mode = "nonspin";
      break;
    }
  }
  if (hdrIdx === -1) return null;

  const atomMap = {};
  const atomOrder = [];
  let parsedRows = 0;

  for (let i = hdrIdx + 1; i < lines.length; i++) {
    const l = lines[i];
    if (/Atomic Populations|Bond\s+Population/i.test(l)) break;
    if (/^\s*[-=]{15,}\s*$/.test(l)) {
      if (parsedRows > 0) break;
      continue;
    }
    const m = l.match(/^\s*([A-Za-z]{1,2})\s+(\d+)\s+([A-Za-z0-9()\-]+)\s+(.+)$/);
    if (!m) continue;
    const el = castepCleanElement(m[1]);
    const ion = parseInt(m[2], 10);
    const orb = canonicalizeCastepOrbitalName(m[3]);
    const nums = m[4].trim().split(/\s+/).map(Number).filter(v => !isNaN(v));
    if (!nums.length) continue;

    const akey = `${el}|${ion}`;
    if (!atomMap[akey]) {
      atomMap[akey] = { element: el, ion, label: `${el}${ion}`, orbitals: {} };
      atomOrder.push(akey);
    }
    const orbs = atomMap[akey].orbitals;
    if (!orbs[orb]) {
      orbs[orb] = { up: 0, dn: 0, spin: 0, charge: 0, sx: 0, sy: 0, sz: 0, smag: 0 };
    }
    const slot = orbs[orb];
    if (mode === "collinear" && nums.length >= 3) {
      slot.up += nums[0];
      slot.dn += nums[1];
      slot.spin += nums[2];
      slot.charge += (nums[0] + nums[1]);
    } else if (mode === "noncollinear" && nums.length >= 4) {
      slot.charge += nums[0];
      slot.sx += nums[1];
      slot.sy += nums[2];
      slot.sz += nums[3];
      slot.spin = slot.sz;
    } else {
      slot.charge += nums[0];
      slot.up += nums[0] / 2;
      slot.dn += nums[0] / 2;
      slot.spin += 0;
    }
    parsedRows++;
  }

  if (!atomOrder.length) return null;

  const atoms = atomOrder.map(akey => {
    const ent = atomMap[akey];
    Object.values(ent.orbitals).forEach(v => {
      if (mode === "noncollinear") {
        v.smag = Math.hypot(v.sx, v.sy, v.sz);
        v.spin = v.sz;
        v.up = 0.5 * (v.charge + v.smag);
        v.dn = 0.5 * (v.charge - v.smag);
      }
    });
    return ent;
  });

  return {
    mode,
    source: "castep_orbital_pop",
    sourceLabel: mode === "noncollinear"
      ? "CASTEP Orbital Populations • Non-Collinear SOC (Sx, Sy, Sz)"
      : (mode === "collinear" ? "CASTEP Orbital Populations • Collinear Spin (↑ / ↓)" : "CASTEP Orbital Populations • Non-Spin"),
    atoms
  };
}
window.parseCastepOrbitalPopulations = parseCastepOrbitalPopulations;

function getActiveJobOrbitalSpinData(job) {
  if (!job) return null;

  // Priority 1: Exact CASTEP .castep "Orbital Populations" table
  if (job._orbPopCache === undefined) {
    job._orbPopCache = parseCastepOrbitalPopulations(job.castep_text || "");
  }
  if (job._orbPopCache && job._orbPopCache.atoms?.length) {
    return job._orbPopCache;
  }

  // Priority 2: Direct m-resolved occupation integration from *.pdos_bin + *_DOS.bands
  const pdosOrb = job.pdos_bin_data?.orbital_populations;
  if (pdosOrb && pdosOrb.atoms?.length) {
    return {
      mode: pdosOrb.mode || "collinear",
      source: "pdos_bin",
      sourceLabel: `m-Resolved .pdos_bin Integration (${pdosOrb.source_file || "DOS"})`,
      atoms: pdosOrb.atoms
    };
  }

  // Priority 3: Shell-level fallback from Mulliken Atomic Populations (s, p, d, f)
  const mull = job._mullikenCache !== undefined ? job._mullikenCache : (job._mullikenCache = parseCastepMullikenAnalysis(job.castep_text || ""));
  if (mull && mull.atoms?.length) {
    return {
      mode: mull.isSpinPolarized ? "collinear" : "nonspin",
      source: "mulliken_shell",
      sourceLabel: "Mulliken Shell-Level (s, p, d, f) • Load .castep Orbital Pop or .pdos_bin for m-Resolved Matrix",
      atoms: mull.atoms.map(a => ({
        element: a.element,
        ion: a.ion,
        label: a.label,
        orbitals: {
          shell_s: { up: a.sUp, dn: a.sDn, spin: a.muS, charge: a.s },
          shell_p: { up: a.pUp, dn: a.pDn, spin: a.muP, charge: a.p },
          shell_d: { up: a.dUp, dn: a.dDn, spin: a.muD, charge: a.d },
          shell_f: { up: a.fUp, dn: a.fDn, spin: a.muF, charge: a.f }
        }
      }))
    };
  }
  return null;
}
window.getActiveJobOrbitalSpinData = getActiveJobOrbitalSpinData;

function getOrbitalMetricValue(orbObj, qty, mode) {
  if (!orbObj) return 0;
  if (mode === "noncollinear") {
    if (qty === "sx") return orbObj.sx || 0;
    if (qty === "sy") return orbObj.sy || 0;
    if (qty === "sz" || qty === "spin") return orbObj.sz || 0;
    if (qty === "smag") return orbObj.smag !== undefined ? orbObj.smag : Math.hypot(orbObj.sx || 0, orbObj.sy || 0, orbObj.sz || 0);
    if (qty === "charge") return orbObj.charge || 0;
  }
  if (qty === "up") return orbObj.up || 0;
  if (qty === "dn") return orbObj.dn || 0;
  if (qty === "charge") return orbObj.charge !== undefined ? orbObj.charge : ((orbObj.up || 0) + (orbObj.dn || 0));
  return orbObj.spin !== undefined ? orbObj.spin : ((orbObj.up || 0) - (orbObj.dn || 0));
}

function aggregateElementOrbitals(atomsOfEl, atomMode, mode) {
  if (!atomsOfEl || !atomsOfEl.length) return { label: "—", orbitals: {}, atomCount: 0 };
  if (atomMode !== "avg" && atomMode !== "sum") {
    const exact = atomsOfEl.find(a => a.label === atomMode) || atomsOfEl[0];
    return { label: exact.label, orbitals: exact.orbitals || {}, atomCount: 1 };
  }
  const agg = {};
  const n = atomsOfEl.length;
  const div = atomMode === "avg" ? n : 1;
  atomsOfEl.forEach(a => {
    Object.entries(a.orbitals || {}).forEach(([k, v]) => {
      if (!agg[k]) agg[k] = { up: 0, dn: 0, spin: 0, charge: 0, sx: 0, sy: 0, sz: 0, smag: 0 };
      agg[k].up += (v.up || 0);
      agg[k].dn += (v.dn || 0);
      agg[k].spin += (v.spin || 0);
      agg[k].charge += (v.charge || 0);
      agg[k].sx += (v.sx || 0);
      agg[k].sy += (v.sy || 0);
      agg[k].sz += (v.sz || 0);
    });
  });
  Object.values(agg).forEach(v => {
    v.up /= div; v.dn /= div; v.spin /= div; v.charge /= div;
    v.sx /= div; v.sy /= div; v.sz /= div;
    if (mode === "noncollinear") {
      v.smag = Math.hypot(v.sx, v.sy, v.sz);
      v.spin = v.sz;
    }
  });
  const el = atomsOfEl[0].element;
  return {
    label: atomMode === "avg" ? `${el} (Avg of ${n})` : `${el} (Sum of ${n})`,
    orbitals: agg,
    atomCount: n
  };
}

function buildShellSummaryOrbitals(orbMap, mode) {
  if (orbMap.shell_s || orbMap.shell_p || orbMap.shell_d || orbMap.shell_f) {
    return {
      shell_s: orbMap.shell_s || { up: 0, dn: 0, spin: 0, charge: 0, sx: 0, sy: 0, sz: 0, smag: 0 },
      shell_p: orbMap.shell_p || { up: 0, dn: 0, spin: 0, charge: 0, sx: 0, sy: 0, sz: 0, smag: 0 },
      shell_d: orbMap.shell_d || { up: 0, dn: 0, spin: 0, charge: 0, sx: 0, sy: 0, sz: 0, smag: 0 },
      shell_f: orbMap.shell_f || { up: 0, dn: 0, spin: 0, charge: 0, sx: 0, sy: 0, sz: 0, smag: 0 }
    };
  }
  const out = {};
  ["s", "p", "d", "f"].forEach(sh => {
    const acc = { up: 0, dn: 0, spin: 0, charge: 0, sx: 0, sy: 0, sz: 0, smag: 0 };
    CASTEP_ORBITAL_SHELLS[sh].forEach(ok => {
      const v = orbMap[ok];
      if (!v) return;
      acc.up += (v.up || 0); acc.dn += (v.dn || 0); acc.spin += (v.spin || 0); acc.charge += (v.charge || 0);
      acc.sx += (v.sx || 0); acc.sy += (v.sy || 0); acc.sz += (v.sz || 0);
    });
    if (mode === "noncollinear") { acc.smag = Math.hypot(acc.sx, acc.sy, acc.sz); acc.spin = acc.sz; }
    out[`shell_${sh}`] = acc;
  });
  return out;
}

function pickAutoShellForOrbitals(orbMap, source, qty, mode) {
  if (source === "mulliken_shell" || orbMap.shell_s || orbMap.shell_d) return "spdf";
  const presentShells = [];
  ["f", "d", "p", "s"].forEach(sh => {
    const keys = CASTEP_ORBITAL_SHELLS[sh];
    if (keys.some(k => orbMap[k] !== undefined)) {
      const score = keys.reduce((acc, k) => acc + Math.abs(getOrbitalMetricValue(orbMap[k], qty, mode)), 0);
      const chg = keys.reduce((acc, k) => acc + Math.abs(orbMap[k]?.charge || 0), 0);
      presentShells.push({ sh, score, chg });
    }
  });
  if (!presentShells.length) return "spdf";
  const maxScore = Math.max(...presentShells.map(x => x.score));
  if (maxScore > 1e-4) {
    presentShells.sort((a, b) => b.score - a.score);
    return presentShells[0].sh;
  }
  // Non-magnetic or zero spin: prefer highest angular momentum shell with non-trivial population (f > d > p > s)
  const nonEmpty = presentShells.filter(x => x.chg > 0.05);
  return (nonEmpty.length ? nonEmpty[0].sh : presentShells[0].sh);
}

function resolveSpinMatrixEntries(orbMap, requestedShell, source, qty, mode) {
  let effectiveShell = requestedShell;
  let missingNote = "";
  if (source === "mulliken_shell" && requestedShell !== "spdf") {
    effectiveShell = "spdf";
    if (requestedShell !== "auto") missingNote = "Shell-level Mulliken data only (load .castep Orbital Populations or .pdos_bin for m-resolved matrix)";
  } else if (requestedShell === "auto") {
    effectiveShell = pickAutoShellForOrbitals(orbMap, source, qty, mode);
  }

  let keys = [];
  let lookup = orbMap;
  if (effectiveShell === "spdf") {
    keys = [...CASTEP_ORBITAL_SHELLS.spdf];
    lookup = buildShellSummaryOrbitals(orbMap, mode);
  } else if (effectiveShell === "all_m") {
    keys = CASTEP_ORBITAL_ALL_ORDER.filter(k => orbMap[k] !== undefined);
    if (!keys.length) {
      keys = [...CASTEP_ORBITAL_SHELLS.spdf];
      lookup = buildShellSummaryOrbitals(orbMap, mode);
      effectiveShell = "spdf";
    }
  } else {
    keys = [...(CASTEP_ORBITAL_SHELLS[effectiveShell] || CASTEP_ORBITAL_SHELLS.d)];
    if (!keys.some(k => orbMap[k] !== undefined)) {
      const avail = ["s", "p", "d", "f"].filter(sh => CASTEP_ORBITAL_SHELLS[sh].some(k => orbMap[k] !== undefined));
      missingNote = `No ${effectiveShell}-projectors in pseudopotential (available: ${avail.join(", ") || "none"})`;
    }
  }

  const entries = keys.map(k => {
    const obj = lookup[k] || { up: 0, dn: 0, spin: 0, charge: 0, sx: 0, sy: 0, sz: 0, smag: 0 };
    return { key: k, spec: CASTEP_ORBITAL_SPEC[k] || { base: k, sub: [], html: escapeHtml(k), plain: k }, val: getOrbitalMetricValue(obj, qty, mode), raw: obj };
  });
  return { effectiveShell, entries, missingNote };
}

function formatSpinMatrixNumber(v, decimals) {
  const thr = 0.5 * Math.pow(10, -decimals);
  if (!isFinite(v) || Math.abs(v) < thr) return "0";
  const absStr = Math.abs(v).toFixed(decimals);
  return v < 0 ? `\u2212${absStr}` : absStr;
}

function measureOrbitalMathLabel(ctx, orbKey, basePx) {
  const st = getCastepPlotStyle();
  const ff = st.fontFamily || '"Times New Roman", Times, Georgia, serif';
  const wPref = st.boldAxes ? "bold " : "";
  const spec = CASTEP_ORBITAL_SPEC[orbKey] || { base: orbKey, sub: [] };
  const subPx = Math.max(8, basePx * 0.66);
  const supPx = Math.max(6.5, basePx * 0.46);
  const prevFont = ctx.font;
  ctx.font = `${wPref}italic ${basePx}px ${ff}`;
  let w = ctx.measureText(spec.base).width;
  if (spec.sub && spec.sub.length) {
    w += basePx * 0.05;
    for (const tok of spec.sub) {
      if (tok.sup) {
        ctx.font = `${wPref}${supPx}px ${ff}`;
      } else {
        ctx.font = tok.it === false
          ? `${wPref}${subPx}px ${ff}`
          : `${wPref}italic ${subPx}px ${ff}`;
      }
      w += ctx.measureText(tok.t).width;
    }
  }
  ctx.font = prevFont;
  return w;
}

function drawOrbitalMathLabel(ctx, orbKey, x, y, basePx, align = "center") {
  const st = getCastepPlotStyle();
  const ff = st.fontFamily || '"Times New Roman", Times, Georgia, serif';
  const wPref = st.boldAxes ? "bold " : "";
  const spec = CASTEP_ORBITAL_SPEC[orbKey] || { base: orbKey, sub: [] };
  const subPx = Math.max(8, basePx * 0.66);
  const supPx = Math.max(6.5, basePx * 0.46);
  const totalW = measureOrbitalMathLabel(ctx, orbKey, basePx);

  let curX = x;
  if (align === "center") curX = x - totalW * 0.5;
  else if (align === "right") curX = x - totalW;

  ctx.save();
  ctx.fillStyle = st.inkColor || "#000000";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = `${wPref}italic ${basePx}px ${ff}`;
  ctx.fillText(spec.base, curX, y);
  curX += ctx.measureText(spec.base).width + (spec.sub?.length ? basePx * 0.05 : 0);

  if (spec.sub && spec.sub.length) {
    const subY = y + basePx * 0.28;
    const supInSubY = subY - subPx * 0.34;
    for (const tok of spec.sub) {
      if (tok.sup) {
        ctx.font = `${wPref}${supPx}px ${ff}`;
        ctx.fillText(tok.t, curX, supInSubY);
      } else {
        ctx.font = tok.it === false
          ? `${wPref}${subPx}px ${ff}`
          : `${wPref}italic ${subPx}px ${ff}`;
        ctx.fillText(tok.t, curX, subY);
      }
      curX += ctx.measureText(tok.t).width;
    }
  }
  ctx.restore();
}

function getSpinMatrixCellColors(val, maxAbs, palette, decimals) {
  const thr = 0.5 * Math.pow(10, -decimals);
  const norm = maxAbs > 1e-9 ? Math.max(-1, Math.min(1, val / maxAbs)) : 0;
  const t = Math.abs(norm);
  const lerp = (a, b, f) => Math.round(a + (b - a) * f);
  const rgb = (r, g, b) => `rgb(${r},${g},${b})`;

  if (palette === "journal_green") {
    // Exact publication aesthetic matching reference figure:
    // zero -> soft pale ivory-green #f9fcf2; positive -> crisp pale sage/olive green; negative -> pure white / soft pearl
    if (Math.abs(val) < thr) return { bg: "#f9fcf2", fg: "#000000" };
    if (val > 0) {
      const f = Math.pow(t, 0.78);
      return {
        bg: rgb(lerp(247, 198, f), lerp(251, 230, f), lerp(238, 170, f)),
        fg: "#000000"
      };
    } else {
      // Tiny negative -> crisp pure white #ffffff (exact match to bottom-left -0.003 tile); larger negative -> ultra-subtle lavender tint
      const f = Math.pow(t, 0.85);
      if (Math.abs(val) <= 0.015) return { bg: "#ffffff", fg: "#000000" };
      return {
        bg: rgb(lerp(255, 224, f), lerp(255, 229, f), lerp(255, 248, f)),
        fg: "#000000"
      };
    }
  }

  if (palette === "diverging_rb") {
    if (Math.abs(val) < thr) return { bg: "#f8fafc", fg: "#334155" };
    const f = Math.pow(t, 0.75);
    if (val > 0) {
      const r = lerp(254, 220, f), g = lerp(242, 38, f), b = lerp(242, 38, f);
      return { bg: rgb(r, g, b), fg: f > 0.62 ? "#ffffff" : "#0f172a" };
    } else {
      const r = lerp(239, 37, f), g = lerp(246, 99, f), b = lerp(255, 235, f);
      return { bg: rgb(r, g, b), fg: f > 0.62 ? "#ffffff" : "#0f172a" };
    }
  }

  // blue_orange (colorblind-safe Teal / Amber)
  if (Math.abs(val) < thr) return { bg: "#f8fafc", fg: "#334155" };
  const f = Math.pow(t, 0.75);
  if (val > 0) {
    const r = lerp(255, 217, f), g = lerp(247, 119, f), b = lerp(237, 6, f);
    return { bg: rgb(r, g, b), fg: f > 0.66 ? "#ffffff" : "#0f172a" };
  } else {
    const r = lerp(240, 15, f), g = lerp(253, 118, f), b = lerp(250, 110, f);
    return { bg: rgb(r, g, b), fg: f > 0.62 ? "#ffffff" : "#0f172a" };
  }
}

function drawSingleSpinMatrixPanel(ctx, boxX, boxY, boxSize, entries, opts) {
  const st = getCastepPlotStyle();
  const ff = st.fontFamily || '"Times New Roman", Times, Georgia, serif';
  const N = Math.max(1, entries.length);
  const decimals = opts.decimals ?? 3;
  const palette = opts.palette || "journal_green";
  const cell = boxSize / N;
  const maxAbs = Math.max(1e-6, ...entries.map(e => Math.abs(e.val)));
  const axisScale = (st.axisLabelSize || 13) / 13;
  const tickScale = (st.tickSize || 12) / 12;
  const labelPx = opts.labelPx
    ? opts.labelPx * axisScale
    : Math.max(9.5, Math.min(20, cell * (N <= 5 ? (opts.compact ? 0.27 : 0.30) : (N <= 7 ? 0.25 : 0.23)) * axisScale));
  const numPx = opts.numPx
    ? opts.numPx * tickScale
    : Math.max(8.5, Math.min(20, cell * (opts.compact && N >= 5 ? 0.225 : (N <= 5 ? 0.28 : (N <= 7 ? 0.24 : 0.21))) * tickScale));

  // 1) Draw N×N cells with diagonal bottom-left (i=0,j=0) -> top-right (i=N-1,j=N-1)
  for (let row = 0; row < N; row++) {
    const cy = boxY + (N - 1 - row) * cell;
    for (let col = 0; col < N; col++) {
      const cx = boxX + col * cell;
      const val = (row === col) ? entries[row].val : 0;
      const { bg, fg } = getSpinMatrixCellColors(val, maxAbs, palette, decimals);
      ctx.fillStyle = bg;
      ctx.fillRect(cx, cy, cell + 0.5, cell + 0.5);
      if (palette !== "journal_green" || st.gridMode !== "off") {
        ctx.strokeStyle = st.gridMode === "normal" ? "rgba(15, 23, 42, 0.22)" : "rgba(15, 23, 42, 0.09)";
        ctx.lineWidth = 0.7;
        ctx.strokeRect(cx + 0.5, cy + 0.5, cell - 1, cell - 1);
      }

      const str = formatSpinMatrixNumber(val, decimals);
      ctx.save();
      ctx.fillStyle = fg === "#000000" ? (st.inkColor || "#000000") : fg;
      ctx.font = `${row === col && Math.abs(val) >= 0.5 * Math.pow(10, -decimals) && palette !== "journal_green" ? "bold " : ""}${numPx}px ${ff}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(str, cx + cell * 0.5, cy + cell * 0.52);
      ctx.restore();
    }
  }

  // 2) Crisp unified publication outer frame + inward/outward ticks
  const tickXs = [];
  const tickYs = [];
  for (let i = 0; i < N; i++) {
    tickYs.push(boxY + (N - 0.5 - i) * cell);
    tickXs.push(boxX + (i + 0.5) * cell);
  }
  drawPubAxisBox(ctx, boxX, boxY, boxSize, boxSize, st, {
    compact: !!opts.compact,
    xTicks: tickXs,
    yTicks: tickYs
  });

  // 3) Y-axis orbital labels (left of box, bottom -> top) & X-axis orbital labels (below box, left -> right)
  const outExtra = st.tickDir === "out" ? (st.tickLength || 5) + 1 : 0;
  const yPad = (opts.compact ? 6 : 9) + outExtra;
  const xPad = (opts.compact ? 14 : 20) + outExtra;
  const maxXLabelW = Math.max(...entries.map(e => measureOrbitalMathLabel(ctx, e.key, labelPx)));
  const rotateX = (maxXLabelW > cell * 0.94);

  for (let i = 0; i < N; i++) {
    const ty = boxY + (N - 0.5 - i) * cell;
    const tx = boxX + (i + 0.5) * cell;
    drawOrbitalMathLabel(ctx, entries[i].key, boxX - yPad, ty, labelPx, "right");
    if (rotateX) {
      ctx.save();
      ctx.translate(tx + 2, boxY + boxSize + 10 + outExtra);
      ctx.rotate(-Math.PI / 5.5);
      drawOrbitalMathLabel(ctx, entries[i].key, 0, 0, Math.max(9.5, labelPx * 0.88), "right");
      ctx.restore();
    } else {
      drawOrbitalMathLabel(ctx, entries[i].key, tx, boxY + boxSize + xPad, labelPx, "center");
    }
  }

  // 4) Optional title above panel (used in All-Elements Grid)
  if (opts.title) {
    ctx.save();
    ctx.fillStyle = st.inkColor || "#000000";
    ctx.font = castepPlotFont("title", opts.compact ? 0.84 : 0.96);
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    drawSciText(ctx, opts.title, boxX + boxSize * 0.5, boxY - (opts.compact ? 6 : 10));
    ctx.restore();
  }

  // 5) Optional vertical diverging colorbar on right for diverging palettes
  if (opts.showColorbar && palette !== "journal_green") {
    const cbX = boxX + boxSize + 14;
    const cbW = 12;
    const steps = 40;
    for (let s = 0; s < steps; s++) {
      const frac = 1 - (2 * s) / (steps - 1);
      const { bg } = getSpinMatrixCellColors(frac * maxAbs, maxAbs, palette, decimals);
      ctx.fillStyle = bg;
      const sy = boxY + (s / steps) * boxSize;
      ctx.fillRect(cbX, sy, cbW, boxSize / steps + 0.8);
    }
    ctx.strokeStyle = st.inkColor || "#000000";
    ctx.lineWidth = Math.max(1.0, st.borderWidth * 0.72);
    ctx.strokeRect(Math.round(cbX) + 0.5, Math.round(boxY) + 0.5, cbW, Math.round(boxSize));
    ctx.fillStyle = st.inkColor || "#000000";
    ctx.font = castepPlotFont("tick", 0.84);
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(`+${maxAbs.toFixed(decimals)}`, cbX + cbW + 4, boxY + 5);
    ctx.fillText("0", cbX + cbW + 4, boxY + boxSize * 0.5);
    ctx.fillText(`\u2212${maxAbs.toFixed(decimals)}`, cbX + cbW + 4, boxY + boxSize - 5);
  }
}

function getSpinMatrixElementsSummary(orbData) {
  if (!orbData || !orbData.atoms?.length) return [];
  const byEl = {};
  const order = [];
  orbData.atoms.forEach(a => {
    if (!byEl[a.element]) {
      byEl[a.element] = { element: a.element, atoms: [], absSpinSum: 0, netSpinSum: 0, shells: new Set() };
      order.push(a.element);
    }
    const g = byEl[a.element];
    g.atoms.push(a);
    let aSpin = 0;
    Object.entries(a.orbitals || {}).forEach(([ok, ov]) => {
      const sp = orbData.mode === "noncollinear" ? (ov.smag || Math.abs(ov.sz || 0)) : (ov.spin || 0);
      aSpin += sp;
      const sh = CASTEP_ORBITAL_SPEC[ok]?.shell;
      if (sh && sh !== "spdf") g.shells.add(sh);
    });
    g.netSpinSum += aSpin;
    g.absSpinSum += Math.abs(aSpin);
  });
  return order.map(el => {
    const g = byEl[el];
    const shellList = ["s", "p", "d", "f"].filter(s => g.shells.has(s));
    return {
      element: el,
      atoms: g.atoms,
      count: g.atoms.length,
      netSpin: g.netSpinSum,
      absSpin: g.absSpinSum,
      avgSpin: g.netSpinSum / g.atoms.length,
      shells: shellList.length ? shellList : ["s", "p", "d", "f"]
    };
  }).sort((a, b) => b.absSpin - a.absSpin || b.shells.length - a.shells.length);
}

let _lastSpinMatrixJobId = null;

function syncSpinMatrixControlsForData(orbData, jobId) {
  const elSel = document.getElementById("castep-spinmat-element");
  const atomSel = document.getElementById("castep-spinmat-atom");
  const qtySel = document.getElementById("castep-spinmat-qty");
  const elSummary = getSpinMatrixElementsSummary(orbData);
  const jobChanged = (_lastSpinMatrixJobId !== jobId);
  _lastSpinMatrixJobId = jobId;

  // 1) Sync Quantity dropdown options for Collinear vs Non-Collinear SOC
  if (qtySel) {
    const prevQ = qtySel.value;
    if (orbData.mode === "noncollinear") {
      qtySel.innerHTML = `
        <option value="sz">Spin Sz (μB)</option>
        <option value="sx">Spin Sx (μB)</option>
        <option value="sy">Spin Sy (μB)</option>
        <option value="smag">Spin |S| (μB)</option>
        <option value="charge">Total Charge (e)</option>
      `;
      qtySel.value = ["sz", "sx", "sy", "smag", "charge"].includes(prevQ) && !jobChanged ? prevQ : "sz";
    } else {
      qtySel.innerHTML = `
        <option value="spin">Spin (n↑ − n↓)</option>
        <option value="up">Spin Up (n↑)</option>
        <option value="dn">Spin Down (n↓)</option>
        <option value="charge">Charge (n↑ + n↓)</option>
      `;
      qtySel.value = ["spin", "up", "dn", "charge"].includes(prevQ) && !jobChanged ? prevQ : "spin";
    }
  }

  // 2) Sync Element dropdown
  if (elSel) {
    const prevEl = elSel.value;
    const opts = [
      `<option value="all_grid">All Elements Overview Grid (${elSummary.length} elements)</option>`,
      ...elSummary.map(s => `<option value="${escapeHtml(s.element)}">${escapeHtml(s.element)} (${s.count} atoms • ${s.shells.join("/")})</option>`)
    ];
    elSel.innerHTML = opts.join("");
    if (!jobChanged && [...elSel.options].some(o => o.value === prevEl)) {
      elSel.value = prevEl;
    } else if (elSummary.length) {
      elSel.value = elSummary[0].element;
    } else {
      elSel.value = "all_grid";
    }
  }

  // 3) Sync Atom dropdown for active element
  syncSpinMatrixAtomDropdown(orbData, elSummary, jobChanged);
  return elSummary;
}

function syncSpinMatrixAtomDropdown(orbData, elSummary, resetDefault = false) {
  const elSel = document.getElementById("castep-spinmat-element");
  const atomSel = document.getElementById("castep-spinmat-atom");
  if (!atomSel) return;
  const activeEl = elSel?.value || "all_grid";
  const prevAtom = atomSel.value;
  if (activeEl === "all_grid") {
    atomSel.innerHTML = `
      <option value="avg">Element Average</option>
      <option value="sum">Element Total (Sum)</option>
    `;
    atomSel.value = (prevAtom === "sum") ? "sum" : "avg";
    return;
  }
  const sp = elSummary.find(s => s.element === activeEl);
  if (!sp) return;

  // Compute each atom's total spin for informative option labels & AFM detection
  const atomSpins = sp.atoms.map(a => {
    let spVal = 0;
    Object.values(a.orbitals || {}).forEach(ov => {
      spVal += (orbData.mode === "noncollinear" ? (ov.sz || 0) : (ov.spin || 0));
    });
    return { atom: a, spin: spVal };
  });

  const opts = [
    `<option value="avg">Element Average (${sp.count} atoms)</option>`,
    `<option value="sum">Element Total / Sum (${sp.count} atoms)</option>`,
    ...atomSpins.map(x => `<option value="${escapeHtml(x.atom.label)}">${escapeHtml(x.atom.label)} (Spin ${x.spin >= 0 ? "+" : "\u2212"}${Math.abs(x.spin).toFixed(3)} μB)</option>`)
  ];
  atomSel.innerHTML = opts.join("");

  if (!resetDefault && [...atomSel.options].some(o => o.value === prevAtom)) {
    atomSel.value = prevAtom;
  } else {
    // Smart AFM detection: if opposite-spin sublattices cancel out in Element Average, default to strongest magnetic site!
    const avgAbs = atomSpins.reduce((s, x) => s + Math.abs(x.spin), 0) / Math.max(1, atomSpins.length);
    const netAvg = Math.abs(atomSpins.reduce((s, x) => s + x.spin, 0) / Math.max(1, atomSpins.length));
    if (avgAbs > 0.02 && netAvg < 0.25 * avgAbs) {
      const top = [...atomSpins].sort((a, b) => Math.abs(b.spin) - Math.abs(a.spin))[0];
      atomSel.value = top ? top.atom.label : "avg";
    } else {
      atomSel.value = "avg";
    }
  }
}

function onCastepSpinMatrixElementChange() {
  const job = (CASTEP_STUDIO_STATE.jobs || []).find(j => j.id === CASTEP_STUDIO_STATE.activeJobId);
  const orbData = getActiveJobOrbitalSpinData(job);
  if (orbData) {
    const elSummary = getSpinMatrixElementsSummary(orbData);
    syncSpinMatrixAtomDropdown(orbData, elSummary, true);
  }
  renderCastepSpinMatrix();
}
window.onCastepSpinMatrixElementChange = onCastepSpinMatrixElementChange;

function selectCastepSpinMatrixElement(elVal) {
  const elSel = document.getElementById("castep-spinmat-element");
  if (elSel) elSel.value = elVal;
  onCastepSpinMatrixElementChange();
}
window.selectCastepSpinMatrixElement = selectCastepSpinMatrixElement;

function renderCastepSpinMatrix() {
  const job = (CASTEP_STUDIO_STATE.jobs || []).find(j => j.id === CASTEP_STUDIO_STATE.activeJobId);
  const orbData = getActiveJobOrbitalSpinData(job);
  const badge = document.getElementById("castep-spinmat-source-badge");
  const canvas = document.getElementById("castep-spinmat-canvas");
  const pillsWrap = document.getElementById("castep-spinmat-el-pills");
  const layoutEl = document.getElementById("castep-spinmat-layout");
  const sideEl = document.getElementById("castep-spinmat-side");
  const kpiEl = document.getElementById("castep-spinmat-kpi");
  const theadEl = document.getElementById("castep-spinmat-thead");
  const tbodyEl = document.getElementById("castep-spinmat-tbody");
  const capEl = document.getElementById("castep-spinmat-caption");

  if (!orbData || !orbData.atoms?.length) {
    if (badge) { badge.textContent = "No orbital population data"; badge.className = "badge badge-amber"; }
    if (pillsWrap) pillsWrap.innerHTML = "";
    if (kpiEl) kpiEl.innerHTML = "<span>Upload a CASTEP <code>.castep</code> file (with <code>Orbital Populations</code>) or <code>.pdos_bin</code> + <code>.bands</code> to compute orbital-resolved Spin Matrices.</span>";
    if (tbodyEl) tbodyEl.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:16px; color:#64748b;">No orbital-resolved spin data in active job.</td></tr>`;
    if (capEl) capEl.textContent = "";
    if (canvas) {
      const w = 400, h = 240, dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      const ctx = canvas.getContext("2d"); ctx.save(); ctx.scale(dpr, dpr);
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#64748b"; ctx.font = "12.5px Inter, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("No Orbital Populations or .pdos_bin data in active job", w / 2, h / 2);
      ctx.restore();
    }
    return;
  }

  const elSummary = syncSpinMatrixControlsForData(orbData, job?.id || "none");
  const activeEl = document.getElementById("castep-spinmat-element")?.value || (elSummary[0]?.element || "all_grid");
  const atomMode = document.getElementById("castep-spinmat-atom")?.value || "avg";
  const reqShell = document.getElementById("castep-spinmat-shell")?.value || "auto";
  const qty = document.getElementById("castep-spinmat-qty")?.value || (orbData.mode === "noncollinear" ? "sz" : "spin");
  const palette = document.getElementById("castep-spinmat-palette")?.value || "journal_green";
  const decimals = parseInt(document.getElementById("castep-spinmat-decimals")?.value || "3", 10);

  if (badge) {
    badge.textContent = orbData.sourceLabel || orbData.source;
    const isFallback = orbData.source === "mulliken_shell";
    badge.style.background = isFallback ? "#fffbeb" : "#ecfdf5";
    badge.style.color = isFallback ? "#b45309" : "#047857";
    badge.style.border = isFallback ? "1px solid #fde68a" : "1px solid #a7f3d0";
  }

  // Render clickable Element Quick-Selector Pills
  if (pillsWrap) {
    const gridActive = activeEl === "all_grid";
    const pillsHtml = [
      `<button type="button" class="castep-preset-chip ${gridActive ? "active" : ""}" style="${gridActive ? "background:#0f172a; color:#ffffff; border-color:#0f172a;" : ""}" onclick="selectCastepSpinMatrixElement('all_grid')">▦ All Elements Grid (${elSummary.length})</button>`,
      ...elSummary.map(s => {
        const isAct = activeEl === s.element;
        const col = getVestaElementColor(s.element);
        const spTxt = `${s.avgSpin >= 0 ? "+" : "\u2212"}${Math.abs(s.avgSpin).toFixed(3)} μ<sub>B</sub>`;
        return `<button type="button" class="castep-preset-chip ${isAct ? "active" : ""}" style="display:inline-flex; align-items:center; gap:5px; ${isAct ? "background:#1e3a8a; color:#ffffff; border-color:#1e3a8a;" : ""}" onclick="selectCastepSpinMatrixElement('${escapeHtml(s.element)}')">
          <span style="width:8px; height:8px; border-radius:50%; background:${col}; border:1px solid ${isAct ? "#ffffff" : "#475569"}; display:inline-block;"></span>
          <strong>${escapeHtml(s.element)}</strong>
          <span style="opacity:0.85; font-size:10.5px;">(${s.shells.join("/")} • ${spTxt})</span>
        </button>`;
      })
    ];
    pillsWrap.innerHTML = pillsHtml.join("");
  }

  const qtyTitleMap = {
    spin: "Spin Matrix (n↑ − n↓, μB)",
    up: "Spin-Up Occupancy Matrix (n↑)",
    dn: "Spin-Down Occupancy Matrix (n↓)",
    charge: "Total Orbital Charge Matrix (e)",
    sz: "Spin Matrix Sz (μB)",
    sx: "Spin Matrix Sx (μB)",
    sy: "Spin Matrix Sy (μB)",
    smag: "Spin Magnitude Matrix |S| (μB)"
  };

  // Mode A: All Elements Overview Grid (renders every element's active-shell Spin Matrix side-by-side)
  if (activeEl === "all_grid") {
    if (layoutEl) layoutEl.style.gridTemplateColumns = "1fr";
    if (sideEl) sideEl.style.display = "none";

    if (canvas) {
      const parentW = Math.max(460, Math.floor((canvas.parentElement?.clientWidth || 860) - 24));
      const nEls = elSummary.length;
      const cols = nEls <= 1 ? 1 : (nEls === 2 ? 2 : (parentW >= 780 ? 3 : 2));
      const rows = Math.ceil(nEls / cols);
      const cellW = Math.floor(parentW / cols);
      const panelH = Math.max(270, Math.min(350, Math.floor(cellW * 0.92)));
      const totalW = Math.max(parentW, cols * 270);
      const totalH = rows * panelH + 34;
      const dpr = getCastepCanvasDpr(totalW, totalH);
      canvas.width = Math.round(totalW * dpr);
      canvas.height = Math.round(totalH * dpr);
      canvas.style.width = `${totalW}px`;
      canvas.style.height = `${totalH}px`;
      const ctx = canvas.getContext("2d");
      ctx.save(); ctx.scale(dpr, dpr);
      applyCrispCanvasQuality(ctx);
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, totalW, totalH);

      const qtySciTitle = {
        spin: "Spin Matrix (n^{↑} \u2212 n^{↓}, μ_{B})",
        up: "Spin-Up Occupancy Matrix (n^{↑})",
        dn: "Spin-Down Occupancy Matrix (n^{↓})",
        charge: "Total Orbital Charge Matrix (e)",
        sz: "Spin Matrix S_{z} (μ_{B})",
        sx: "Spin Matrix S_{x} (μ_{B})",
        sy: "Spin Matrix S_{y} (μ_{B})",
        smag: "Spin Magnitude Matrix |S| (μ_{B})"
      }[qty] || "Spin Matrix";
      ctx.fillStyle = getCastepPlotStyle().inkColor || "#000000";
      ctx.font = castepPlotFont("title", 1.0);
      ctx.textAlign = "center";
      drawSciText(ctx, `All-Elements Orbital ${qtySciTitle} (${atomMode === "sum" ? "Element Sum" : "Element Average"})`, totalW / 2, 20);

      canvas._subPanelRects = [];
      elSummary.forEach((sp, idx) => {
        const c = idx % cols;
        const r = Math.floor(idx / cols);
        const agg = aggregateElementOrbitals(sp.atoms, atomMode === "sum" ? "sum" : "avg", orbData.mode);
        const res = resolveSpinMatrixEntries(agg.orbitals, reqShell, orbData.source, qty, orbData.mode);
        const tileX = c * (totalW / cols);
        const tileY = 30 + r * panelH;
        const tileW = totalW / cols;
        canvas._subPanelRects.push({
          key: `el_${sp.element}`,
          label: `${sp.element} Spin Matrix`,
          x: tileX, y: tileY, w: tileW, h: panelH,
          plotKey: "spinmat",
          dataSubPart: `el:${sp.element}`,
          pngName: `CASTEP_${sp.element}_SpinMatrix.png`
        });

        const maxLblW = Math.max(36, ...res.entries.map(e => measureOrbitalMathLabel(ctx, e.key, 12.5)));
        const padL = Math.min(72, Math.max(46, maxLblW + 12));
        const padR = palette !== "journal_green" ? 56 : 16;
        const padT = 26, padB = 34;
        const boxSize = Math.max(120, Math.min(tileW - padL - padR, panelH - padT - padB));
        const bx = tileX + padL + Math.max(0, (tileW - padL - padR - boxSize) * 0.5);
        const by = tileY + padT;
        const shellTag = res.effectiveShell === "spdf" ? "s/p/d/f" : (res.effectiveShell === "all_m" ? "all orbitals" : `${res.effectiveShell}-orbitals`);
        const trSum = res.entries.reduce((s, e) => s + e.val, 0);
        drawSingleSpinMatrixPanel(ctx, bx, by, boxSize, res.entries, {
          decimals,
          palette,
          compact: true,
          showColorbar: palette !== "journal_green",
          title: `${sp.element} (${shellTag}, Tr=${trSum >= 0 ? "+" : "\u2212"}${Math.abs(trSum).toFixed(decimals)})`
        });
      });
      ctx.restore();
    }
    if (capEl) {
      capEl.innerHTML = `Showing all <strong>${elSummary.length} elements</strong> (${elSummary.map(s => escapeHtml(s.element)).join(", ")}) • Click any element pill above to inspect its full-size Spin Matrix and sub-orbital occupancy table.`;
    }
    return;
  }

  // Mode B: Single Element Detailed Publication Spin Matrix + Sub-Orbital Breakdown Table
  if (layoutEl) layoutEl.style.gridTemplateColumns = "minmax(320px, 470px) minmax(260px, 1fr)";
  if (sideEl) sideEl.style.display = "flex";

  const sp = elSummary.find(s => s.element === activeEl) || elSummary[0];
  const agg = aggregateElementOrbitals(sp.atoms, atomMode, orbData.mode);
  const res = resolveSpinMatrixEntries(agg.orbitals, reqShell, orbData.source, qty, orbData.mode);
  const entries = res.entries;
  const N = entries.length;
  const traceVal = entries.reduce((s, e) => s + e.val, 0);
  const absTraceVal = entries.reduce((s, e) => s + Math.abs(e.val), 0);

  if (canvas) {
    canvas._subPanelRects = [];
    const stS = getCastepPlotStyle();
    const wrapW = Math.max(320, Math.min(460, Math.floor((canvas.parentElement?.clientWidth || 430) - 20)));
    const showCb = (palette !== "journal_green");
    const estLabelPx = N <= 5 ? 16.5 : (N <= 7 ? 13.5 : 11.5);
    const scaledLabelPx = estLabelPx * ((stS.axisLabelSize || 13) / 13);
    const outExtra = stS.tickDir === "out" ? (stS.tickLength || 5) + 1 : 0;
    const tmpCtx = canvas.getContext("2d");
    const maxLblW = Math.max(40, ...entries.map(e => measureOrbitalMathLabel(tmpCtx, e.key, scaledLabelPx)));
    const padL = Math.ceil(maxLblW + 18 + outExtra);
    const padR = showCb ? 66 : 18;
    const padT = 18;
    const padB = Math.ceil((N >= 7 ? 56 : 44) + Math.max(0, scaledLabelPx - 16.5) + outExtra);
    const boxSize = Math.max(180, Math.min(wrapW - padL - padR, 355));
    const totalW = padL + boxSize + padR;
    const totalH = padT + boxSize + padB;
    const dpr = getCastepCanvasDpr(totalW, totalH);
    canvas.width = Math.round(totalW * dpr);
    canvas.height = Math.round(totalH * dpr);
    canvas.style.width = `${totalW}px`;
    canvas.style.height = `${totalH}px`;

    const ctx = canvas.getContext("2d");
    ctx.save(); ctx.scale(dpr, dpr);
    applyCrispCanvasQuality(ctx);
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, totalW, totalH);
    drawSingleSpinMatrixPanel(ctx, padL, padT, boxSize, entries, {
      decimals,
      palette,
      compact: false,
      labelPx: estLabelPx,
      showColorbar: showCb
    });
    ctx.restore();
  }

  const shellLabelMap = { s: "s-orbital (1×1)", p: "p-orbitals (3×3)", d: "d-orbitals (5×5)", f: "f-orbitals (7×7)", all_m: `All Active Sub-Orbitals (${N}×${N})`, spdf: "Shell Summary s/p/d/f (4×4)" };
  if (capEl) {
    capEl.innerHTML = `<strong>${escapeHtml(agg.label)}</strong> • ${shellLabelMap[res.effectiveShell] || res.effectiveShell} • ${escapeHtml(qtyTitleMap[qty] || "Spin Matrix")}${res.missingNote ? `<div style="color:#b45309; margin-top:3px;">⚠️ ${escapeHtml(res.missingNote)}</div>` : ""}`;
  }

  // Update KPI header & Sub-Orbital Breakdown Table
  if (kpiEl) {
    const unitLbl = qty === "charge" || qty === "up" || qty === "dn" ? "e" : "μ<sub>B</sub>";
    const dom = [...entries].sort((a, b) => Math.abs(b.val) - Math.abs(a.val))[0];
    kpiEl.innerHTML = `
      <span><strong>Target:</strong> ${escapeHtml(agg.label)}</span>
      <span><strong>Matrix Trace:</strong> <strong style="color:${traceVal >= 0 ? "#15803d" : "#2563eb"};">${traceVal >= 0 ? "+" : "\u2212"}${Math.abs(traceVal).toFixed(decimals)}</strong> ${unitLbl}</span>
      <span><strong>Σ|Diag|:</strong> ${absTraceVal.toFixed(decimals)} ${unitLbl}</span>
      <span><strong>Dominant:</strong> ${dom ? `${dom.spec.html} (${dom.val >= 0 ? "+" : "\u2212"}${Math.abs(dom.val).toFixed(decimals)})` : "—"}</span>
    `;
  }

  if (theadEl) {
    if (orbData.mode === "noncollinear") {
      theadEl.innerHTML = `<tr><th>Orbital</th><th>Charge (e)</th><th>S<sub>x</sub></th><th>S<sub>y</sub></th><th>S<sub>z</sub></th><th>|S| (μ<sub>B</sub>)</th></tr>`;
    } else {
      theadEl.innerHTML = `<tr><th>Orbital</th><th>n<sup>↑</sup></th><th>n<sup>↓</sup></th><th>Spin (μ<sub>B</sub>)</th><th>Charge (e)</th><th>Share</th></tr>`;
    }
  }

  if (tbodyEl) {
    tbodyEl.innerHTML = entries.map(e => {
      const r = e.raw;
      if (orbData.mode === "noncollinear") {
        const sm = r.smag !== undefined ? r.smag : Math.hypot(r.sx || 0, r.sy || 0, r.sz || 0);
        const szCol = Math.abs(r.sz || 0) >= 0.005 ? ((r.sz || 0) > 0 ? "color:#15803d; font-weight:800;" : "color:#2563eb; font-weight:800;") : "color:#64748b;";
        return `<tr>
          <td style="font-family:'Times New Roman',Georgia,serif; font-size:13px; font-weight:700;">${e.spec.html}</td>
          <td>${(r.charge || 0).toFixed(decimals)}</td>
          <td>${formatSpinMatrixNumber(r.sx || 0, decimals)}</td>
          <td>${formatSpinMatrixNumber(r.sy || 0, decimals)}</td>
          <td style="${szCol}">${formatSpinMatrixNumber(r.sz || 0, decimals)}</td>
          <td><strong>${sm.toFixed(decimals)}</strong></td>
        </tr>`;
      }
      const spVal = r.spin !== undefined ? r.spin : ((r.up || 0) - (r.dn || 0));
      const sharePct = absTraceVal > 1e-6 ? (Math.abs(e.val) / absTraceVal) * 100 : 0;
      const spStyle = Math.abs(spVal) >= 0.005 ? (spVal > 0 ? "color:#15803d; font-weight:800;" : "color:#2563eb; font-weight:800;") : "color:#64748b;";
      return `<tr>
        <td style="font-family:'Times New Roman',Georgia,serif; font-size:13px; font-weight:700;">${e.spec.html}</td>
        <td>${(r.up || 0).toFixed(decimals)}</td>
        <td>${(r.dn || 0).toFixed(decimals)}</td>
        <td style="${spStyle}">${formatSpinMatrixNumber(spVal, decimals)}</td>
        <td>${(r.charge !== undefined ? r.charge : ((r.up || 0) + (r.dn || 0))).toFixed(decimals)}</td>
        <td style="min-width:72px;">
          <div style="display:flex; align-items:center; gap:5px;">
            <div style="flex:1; height:6px; background:#e2e8f0; border-radius:3px; overflow:hidden;">
              <div style="width:${Math.min(100, sharePct).toFixed(1)}%; height:100%; background:${e.val >= 0 ? "#16a34a" : "#2563eb"};"></div>
            </div>
            <span style="font-size:10px; color:#475569; min-width:30px; text-align:right;">${sharePct.toFixed(0)}%</span>
          </div>
        </td>
      </tr>`;
    }).join("");
  }
}
window.renderCastepSpinMatrix = renderCastepSpinMatrix;

function exportCastepSpinMatrixPNG() {
  const job = (CASTEP_STUDIO_STATE.jobs || []).find(j => j.id === CASTEP_STUDIO_STATE.activeJobId);
  const seed = sanitizeExportSeed(job?.seed || CASTEP_STUDIO_STATE.structure?.formula || "CASTEP");
  const el = document.getElementById("castep-spinmat-element")?.value || "AllElements";
  const sh = document.getElementById("castep-spinmat-shell")?.value || "auto";
  const qty = document.getElementById("castep-spinmat-qty")?.value || "spin";
  exportCastepCanvasPNG("castep-spinmat-canvas", `${seed}_${el}_${sh}_${qty}_SpinMatrix.png`);
}
window.exportCastepSpinMatrixPNG = exportCastepSpinMatrixPNG;

function buildOrbitalSpinMatrixExportSheet(job) {
  const orbData = getActiveJobOrbitalSpinData(job);
  if (!orbData || !orbData.atoms?.length) return null;
  const isNC = orbData.mode === "noncollinear";
  const headers = isNC
    ? ["Atom", "Element", "Ion", "Shell", "Orbital", "CASTEP_Orbital", "Charge_e", "Sx_muB", "Sy_muB", "Sz_muB", "S_mag_muB", "Source"]
    : ["Atom", "Element", "Ion", "Shell", "Orbital", "CASTEP_Orbital", "Up_e", "Down_e", "Spin_muB", "Charge_e", "Source"];
  const rows = [];
  orbData.atoms.forEach(a => {
    const orbKeys = Object.keys(a.orbitals || {}).sort((x, y) => {
      const ix = CASTEP_ORBITAL_ALL_ORDER.indexOf(x);
      const iy = CASTEP_ORBITAL_ALL_ORDER.indexOf(y);
      return (ix === -1 ? 99 : ix) - (iy === -1 ? 99 : iy);
    });
    orbKeys.forEach(ok => {
      const v = a.orbitals[ok];
      const spec = CASTEP_ORBITAL_SPEC[ok] || { shell: "?", plain: ok };
      if (isNC) {
        const sm = v.smag !== undefined ? v.smag : Math.hypot(v.sx || 0, v.sy || 0, v.sz || 0);
        rows.push([
          a.label, a.element, a.ion, spec.shell, spec.plain, ok,
          Number((v.charge || 0).toFixed(5)), Number((v.sx || 0).toFixed(5)), Number((v.sy || 0).toFixed(5)),
          Number((v.sz || 0).toFixed(5)), Number(sm.toFixed(5)), orbData.source
        ]);
      } else {
        rows.push([
          a.label, a.element, a.ion, spec.shell, spec.plain, ok,
          Number((v.up || 0).toFixed(5)), Number((v.dn || 0).toFixed(5)),
          Number((v.spin || 0).toFixed(5)), Number((v.charge !== undefined ? v.charge : ((v.up || 0) + (v.dn || 0))).toFixed(5)),
          orbData.source
        ]);
      }
    });
  });
  return { name: "Orbital_Spin_Matrix", headers, rows };
}

function exportCastepSpinMatrixCSV() {
  const job = (CASTEP_STUDIO_STATE.jobs || []).find(j => j.id === CASTEP_STUDIO_STATE.activeJobId);
  const orbData = getActiveJobOrbitalSpinData(job);
  if (!orbData || !orbData.atoms?.length) {
    if (typeof showToast === "function") showToast("No orbital spin matrix data available to export.", "warning");
    return;
  }
  const seed = sanitizeExportSeed(job?.seed || CASTEP_STUDIO_STATE.structure?.formula || "CASTEP");
  const activeEl = document.getElementById("castep-spinmat-element")?.value || "all_grid";
  const atomMode = document.getElementById("castep-spinmat-atom")?.value || "avg";
  const reqShell = document.getElementById("castep-spinmat-shell")?.value || "auto";
  const qty = document.getElementById("castep-spinmat-qty")?.value || (orbData.mode === "noncollinear" ? "sz" : "spin");
  const decimals = parseInt(document.getElementById("castep-spinmat-decimals")?.value || "3", 10);

  if (activeEl !== "all_grid") {
    // Export BOTH the displayed N×N square matrix AND all orbital rows below it
    const sp = getSpinMatrixElementsSummary(orbData).find(s => s.element === activeEl);
    if (sp) {
      const agg = aggregateElementOrbitals(sp.atoms, atomMode, orbData.mode);
      const res = resolveSpinMatrixEntries(agg.orbitals, reqShell, orbData.source, qty, orbData.mode);
      const labels = res.entries.map(e => e.spec.plain);
      const headers = [`Matrix_${agg.label.replace(/\s+/g, "_")}_${qty}`, ...labels];
      const rows = res.entries.map((rowE, rIdx) => [
        rowE.spec.plain,
        ...res.entries.map((colE, cIdx) => rIdx === cIdx ? Number(rowE.val.toFixed(Math.max(decimals, 5))) : 0)
      ]);
      const fullSheet = buildOrbitalSpinMatrixExportSheet(job);
      if (fullSheet && fullSheet.rows.length) {
        rows.push(new Array(headers.length).fill(""));
        rows.push(["ALL_ELEMENTS_ORBITAL_POPULATIONS", ...new Array(Math.max(0, headers.length - 1)).fill("")]);
        rows.push(fullSheet.headers);
        fullSheet.rows.forEach(r => rows.push(r));
      }
      const csv = buildCsvString(headers, rows);
      const fname = `${seed}_${activeEl}_${res.effectiveShell}_SpinMatrix.csv`;
      triggerBlobDownload(new Blob([csv], { type: "text/csv;charset=utf-8" }), fname);
      if (typeof showToast === "function") showToast(`Exported ${fname} (N×N matrix + all-element orbital data)!`, "success");
      return;
    }
  }

  const sheet = buildOrbitalSpinMatrixExportSheet(job);
  const csv = buildCsvString(sheet.headers, sheet.rows);
  const fname = `${seed}_AllElements_OrbitalSpinMatrix.csv`;
  triggerBlobDownload(new Blob([csv], { type: "text/csv;charset=utf-8" }), fname);
  if (typeof showToast === "function") showToast(`Exported ${fname} (${sheet.rows.length} orbital entries)!`, "success");
}
window.exportCastepSpinMatrixCSV = exportCastepSpinMatrixCSV;

async function handleCastepSpinMatrixFileUpload(event) {
  const files = Array.from(event?.target?.files || []);
  if (!files.length) return;
  let job = (CASTEP_STUDIO_STATE.jobs || []).find(j => j.id === CASTEP_STUDIO_STATE.activeJobId);
  if (!job) {
    job = { id: "spinmat_local_" + Date.now(), seed: "Uploaded_CASTEP", folder: "Local Upload", files_list: [] };
    CASTEP_STUDIO_STATE.jobs = CASTEP_STUDIO_STATE.jobs || [];
    CASTEP_STUDIO_STATE.jobs.unshift(job);
    CASTEP_STUDIO_STATE.activeJobId = job.id;
  }

  let pdosBuf = null, pdosName = "";
  let bandsText = null;
  let updated = false;

  for (const f of files) {
    const low = f.name.toLowerCase();
    if (low.endsWith(".castep")) {
      const txt = await f.text();
      job.castep_text = txt;
      job._mullikenCache = undefined;
      job._orbPopCache = undefined;
      if (!job.seed || job.seed === "Uploaded_CASTEP") job.seed = f.name.replace(/\.castep$/i, "");
      updated = true;
    } else if (low.endsWith(".bands")) {
      bandsText = await f.text();
      const parsedB = parseCastepBandsTextClient(bandsText);
      if (parsedB) {
        if (low.includes("_dos")) job.dos_bands = parsedB;
        else job.bandstr_bands = parsedB;
        updated = true;
      }
    } else if (low.endsWith(".pdos_bin")) {
      pdosBuf = await f.arrayBuffer();
      pdosName = f.name;
    }
  }

  if (pdosBuf) {
    const refBands = job.dos_bands || job.bandstr_bands;
    if (refBands) {
      const spOrder = extractSpeciesOrderFromJobText(job);
      const parsedPdos = parseCastepPdosBinArrayBuffer(pdosBuf, refBands, spOrder, pdosName);
      if (parsedPdos) {
        job.pdos_bin_data = parsedPdos;
        updated = true;
      }
    } else if (typeof showToast === "function") {
      showToast("Please select both *.pdos_bin AND *_DOS.bands together so eigenvalues match exact orbital weights!", "warning");
    }
  }

  if (event?.target) event.target.value = "";
  if (updated) {
    _lastSpinMatrixJobId = null; // refresh element/atom selectors
    renderCastepMullikenPane();
    if (typeof showToast === "function") showToast("Loaded orbital spin matrix data successfully!", "success");
  }
}
window.handleCastepSpinMatrixFileUpload = handleCastepSpinMatrixFileUpload;

function buildMullikenExportTables() {
  const job = (CASTEP_STUDIO_STATE.jobs || []).find(j => j.id === CASTEP_STUDIO_STATE.activeJobId);
  const mull = job ? (job._mullikenCache || parseCastepMullikenAnalysis(job.castep_text || "")) : null;
  if (!mull) return null;

  const seed = sanitizeExportSeed(job.seed || CASTEP_STUDIO_STATE.structure?.formula || "CASTEP");
  const elFilter = document.getElementById("castep-mulliken-el-filter")?.value || "all";
  const bpFilter = document.getElementById("castep-mulliken-bond-filter")?.value || "all";
  const visAtoms = elFilter === "all" ? mull.atoms : mull.atoms.filter(a => a.element === elFilter);
  const visBonds = bpFilter === "all" ? mull.bonds : mull.bonds.filter(b => b.pairType === bpFilter);

  const atomHeaders = ["Atom", "Element", "Ion", "s", "p", "d", "f", "Total", "Mulliken_Charge_e", "Spin_muB", "mu_s", "mu_p", "mu_d", "mu_f", "Hirshfeld_Charge_e"];
  const atomRows = visAtoms.map(a => [
    a.label, a.element, a.ion,
    Number(a.s.toFixed(4)), Number(a.p.toFixed(4)), Number(a.d.toFixed(4)), Number(a.f.toFixed(4)),
    Number(a.total.toFixed(4)), Number(a.charge.toFixed(4)), Number(a.spin.toFixed(4)),
    Number(a.muS.toFixed(4)), Number(a.muP.toFixed(4)), Number(a.muD.toFixed(4)), Number(a.muF.toFixed(4)),
    a.hirshfeldCharge !== null ? Number(a.hirshfeldCharge.toFixed(4)) : ""
  ]);

  const bondHeaders = ["Bond", "Pair_Type", "Length_Angstrom", "Bond_Population", "Bond_Spin_hbar2", "Character"];
  const bondRows = visBonds.map(b => [
    b.bond, b.pairType, Number(b.lengthA.toFixed(5)), Number(b.population.toFixed(4)),
    b.spin !== null ? Number(b.spin.toFixed(4)) : "", b.character
  ]);

  const os = mull.orbSpins || { s: 0, p: 0, d: 0, f: 0 };
  const summaryRows = [
    ["Magnetic_Phase", mull.magneticOrder, "", "", "", "", "", ""],
    ["Total_Net_Moment_muB", Number((mull.integratedSpin || 0).toFixed(4)), "", "", "", "", "", ""],
    ["Total_Abs_Spin_muB", Number((mull.integratedAbsSpin || 0).toFixed(4)), "", "", "", "", "", ""],
    ["Total_Orbital_Spin_s_p_d_f", Number(os.s.toFixed(4)), Number(os.p.toFixed(4)), Number(os.d.toFixed(4)), Number(os.f.toFixed(4)), "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["Element", "Atom_Count", "Avg_Charge_e", "Sum_Spin_muB", "Mag_Share_Pct", "mu_s", "mu_p", "mu_d"]
  ];
  (mull.speciesSummary || []).forEach(sp => {
    summaryRows.push([
      sp.element, sp.count, Number(sp.avgCharge.toFixed(4)), Number(sp.sumSpin.toFixed(4)),
      Number(sp.pctMag.toFixed(2)), Number(sp.muS.toFixed(4)), Number(sp.muP.toFixed(4)), Number(sp.muD.toFixed(4))
    ]);
  });

  const orbSpinSheet = buildOrbitalSpinMatrixExportSheet(job);
  return {
    seed,
    elFilter,
    bpFilter,
    summarySheet: { name: "Summary_Magnetism", headers: ["Property_or_Element", "Col2", "Col3", "Col4", "Col5", "Col6", "Col7", "Col8"], rows: summaryRows },
    orbSpinSheet,
    atomSheet: { name: "Atomic_Populations", headers: atomHeaders, rows: atomRows },
    bondSheet: { name: "Bond_Populations", headers: bondHeaders, rows: bondRows }
  };
}
window.buildMullikenExportTables = buildMullikenExportTables;

function exportCastepMullikenCSV(mode = "atoms") {
  const pkg = buildMullikenExportTables();
  if (!pkg) {
    if (typeof showToast === "function") showToast("No Mulliken data available to export.", "warning");
    return;
  }
  const sheet = (mode === "bonds") ? pkg.bondSheet : pkg.atomSheet;
  const csv = buildCsvString(sheet.headers, sheet.rows);
  const fname = `${pkg.seed}_Mulliken_${mode}.csv`;
  triggerBlobDownload(new Blob([csv], { type: "text/csv;charset=utf-8" }), fname);
  if (typeof showToast === "function") showToast(`Exported ${fname} (${sheet.rows.length} rows)!`, "success");
}
window.exportCastepMullikenCSV = exportCastepMullikenCSV;

function exportCastepMullikenXLSX() {
  const pkg = buildMullikenExportTables();
  if (!pkg) {
    if (typeof showToast === "function") showToast("No Mulliken data available to export.", "warning");
    return;
  }
  const sheets = [pkg.summarySheet];
  if (pkg.orbSpinSheet && pkg.orbSpinSheet.rows.length) sheets.push(pkg.orbSpinSheet);
  sheets.push(pkg.atomSheet);
  if (pkg.bondSheet.rows.length) sheets.push(pkg.bondSheet);
  const blob = buildXlsxBlob(sheets);
  const fname = `${pkg.seed}_Mulliken_Analysis.xlsx`;
  triggerBlobDownload(blob, fname);
  if (typeof showToast === "function") {
    showToast(`Exported multi-tab workbook ${fname} (${sheets.map(s => s.name).join(" | ")})!`, "success");
  }
}
window.exportCastepMullikenXLSX = exportCastepMullikenXLSX;

