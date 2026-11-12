// scripts/build_curriculum_catalog.js
// Node.js script to generate the complete, production-grade LearnGraph Curriculum Catalog
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log("Generating comprehensive LearnGraph Curriculum Catalog...");

// Helper to build realistic lessons
function makeLessons(prefix, count, titles, durations = ["25m", "30m", "20m", "35m", "40m", "15m"]) {
  const types = ["video", "reading", "quiz", "practice", "reading", "quiz"];
  return titles.map((title, idx) => ({
    id: `${prefix}-l${idx + 1}`,
    title: `${idx + 1}. ${title}`,
    duration: durations[idx % durations.length],
    type: types[idx % types.length],
    completed: idx < 2
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. SCHOOL CURRICULUM (Classes 5 to 12)
// ─────────────────────────────────────────────────────────────────────────────
const schoolClasses = [
  // CLASS 5
  {
    grade: "Class 5",
    subCategory: "Class 5 – 7",
    subjects: [
      {
        id: "c5-math",
        title: "Class 5 Mathematics: Numbers & Geometry",
        subject: "Mathematics",
        tone: "violet",
        level: "Beginner",
        iconSymbol: "5M",
        instructor: "Mrs. Ananya Sharma",
        description: "Master large numbers, operations, fractions, decimals, perimeter, area, and geometry patterns.",
        learningPath: ["Number Systems & Operations", "Fractions & Decimals", "Perimeter & Area", "Data Handling & Patterns"],
        notes: [
          "Place value determines the digit's value in a number.",
          "Fractions represent equal parts of a whole.",
          "Perimeter is the distance around a shape. Area is the surface enclosed."
        ],
        syllabus: ["Large Numbers (up to 8 digits)", "Operations: Addition, Subtraction, Multiplication & Division", "Factors and Multiples (HCF & LCM)", "Fractions & Decimals", "Measurement and Geometry", "Perimeter, Area & Volume", "Data Representation and Bar Graphs"],
        chapters: [
          {
            id: "c5-m-ch1",
            title: "Large Numbers & Operations",
            lessonsCount: 4,
            lessons: makeLessons("c5-m-ch1", 4, ["Place Value and Indian vs International System", "Addition and Subtraction of 6-7 Digit Numbers", "Multiplication and Long Division", "Diagnostic Quiz: Number Operations"])
          },
          {
            id: "c5-m-ch2",
            title: "Fractions & Decimals",
            lessonsCount: 4,
            lessons: makeLessons("c5-m-ch2", 4, ["Understanding Proper, Improper & Mixed Fractions", "Addition and Subtraction of Unlike Fractions", "Decimals in Daily Measurements", "Checkpoint Quiz & Problem Solving"])
          },
          {
            id: "c5-m-ch3",
            title: "Geometry, Perimeter & Area",
            lessonsCount: 4,
            lessons: makeLessons("c5-m-ch3", 4, ["Angles, Lines and Symmetry", "Perimeter of Rectangles and Squares", "Area Calculation using Grids and Formulas", "Practical Exercise: Real World Mensuration"])
          }
        ]
      },
      {
        id: "c5-science",
        title: "Class 5 General Science & EVS",
        subject: "Science",
        tone: "emerald",
        level: "Beginner",
        iconSymbol: "5S",
        instructor: "Dr. Ramesh Nair",
        description: "Explore living organisms, human organ systems, plant reproduction, simple machines, and earth science.",
        learningPath: ["Plant Reproduction", "Human Body & Health", "Force, Work & Energy", "Air, Water & Environment"],
        notes: [
          "Germination requires optimal water, oxygen, and temperature.",
          "The skeletal system provides structure, protection, and enables movement.",
          "Simple machines like levers, pulleys, and inclined planes reduce human effort."
        ],
        syllabus: ["Plant Reproduction and Dispersal", "Animals and Habitats", "Human Skeletal and Muscular Systems", "Food, Nutrients and Diseases", "Simple Machines and Energy", "Air, Water and Weather Cycles"],
        chapters: [
          {
            id: "c5-s-ch1",
            title: "Plant Life & Germination",
            lessonsCount: 3,
            lessons: makeLessons("c5-s-ch1", 3, ["Seeds and How They Germinate", "Agents of Seed Dispersal", "Experiments: Soil, Sunlight, and Moisture"])
          },
          {
            id: "c5-s-ch2",
            title: "The Human Organ Systems",
            lessonsCount: 3,
            lessons: makeLessons("c5-s-ch2", 3, ["Skeletal and Muscular Framework", "Digestive and Respiratory Cycles", "Healthy Diet and Deficiency Diseases"])
          }
        ]
      },
      {
        id: "c5-english",
        title: "Class 5 English Language & Literature",
        subject: "English",
        tone: "blue",
        level: "Beginner",
        iconSymbol: "5EN",
        instructor: "Ms. Claire Davis",
        description: "Grammar fundamentals, reading comprehension, vocabulary expansion, and creative storytelling.",
        learningPath: ["Parts of Speech", "Reading Comprehension", "Tenses & Sentence Structure", "Letter & Paragraph Writing"],
        notes: ["A complete sentence requires a subject and a predicate.", "Adverbs modify verbs, adjectives, or other adverbs."],
        syllabus: ["Nouns, Pronouns, and Adjectives", "Verb Tenses (Present, Past, Future)", "Conjunctions and Prepositions", "Reading Fiction and Non-Fiction Passages", "Descriptive Paragraph and Informal Letter Writing"],
        chapters: [
          {
            id: "c5-en-ch1",
            title: "Sentence Foundations & Tenses",
            lessonsCount: 3,
            lessons: makeLessons("c5-en-ch1", 3, ["Identifying Parts of Speech", "Simple vs Continuous Tenses", "Interactive Story Writing Workshop"])
          }
        ]
      },
      {
        id: "c5-social",
        title: "Class 5 Social Studies & Civics",
        subject: "Social Science",
        tone: "amber",
        level: "Beginner",
        iconSymbol: "5SS",
        instructor: "Mr. Vikramaditya Rao",
        description: "Globes, maps, early civilizations, Indian cultural diversity, and foundational civics.",
        learningPath: ["Reading Maps & Globes", "Early Civilizations", "Physical Divisions of India", "Our Rights & Responsibilities"],
        notes: ["Latitudes run horizontally, longitudes run vertically.", "India is divided into 6 distinct physiographic divisions."],
        syllabus: ["Latitudes, Longitudes and Time Zones", "The Indus Valley Civilization", "Major Landforms of the Earth", "The Physical Regions of India", "Fundamental Rights and Duties"],
        chapters: [
          {
            id: "c5-ss-ch1",
            title: "Maps, Globes & Geography",
            lessonsCount: 3,
            lessons: makeLessons("c5-ss-ch1", 3, ["Understanding Map Scales and Legends", "Continents and Oceans", "Geography Quiz: World Landmarks"])
          }
        ]
      },
      {
        id: "c5-cs",
        title: "Class 5 Computer Basics & Digital Literacy",
        subject: "Computer Science",
        tone: "indigo",
        level: "Beginner",
        iconSymbol: "5CS",
        instructor: "Mr. Kevin Scott",
        description: "Hardware, operating systems, word processing, presentation slides, and safe web browsing.",
        learningPath: ["Computer Hardware & Software", "Word Processing Tools", "Intro to Presentation Slides", "Internet Safety"],
        notes: ["Input devices capture data; output devices present results.", "Never share personal passwords or sensitive information online."],
        syllabus: ["Evolution of Computers", "Operating Systems Overview", "Formatting Documents in Word", "Creating Engaging Slides in PowerPoint", "Internet Ethics & Cyber Safety"],
        chapters: [
          {
            id: "c5-cs-ch1",
            title: "Computer Systems & Safe Browsing",
            lessonsCount: 3,
            lessons: makeLessons("c5-cs-ch1", 3, ["How CPU, RAM, and Storage Collaborate", "Mastering Document Editing", "Digital Footprints and Online Privacy"])
          }
        ]
      }
    ]
  },

  // CLASS 6
  {
    grade: "Class 6",
    subCategory: "Class 5 – 7",
    subjects: [
      {
        id: "c6-math",
        title: "Class 6 Mathematics: Integers & Geometry",
        subject: "Mathematics",
        tone: "indigo",
        level: "Beginner",
        iconSymbol: "6M",
        instructor: "Mrs. Ananya Sharma",
        description: "Number systems, integers, fractions, introductory algebra, ratios, and geometrical concepts.",
        learningPath: ["Number Systems & Divisibility", "Integers on the Number Line", "Algebraic Expressions Intro", "Ratio, Proportion & Geometry"],
        notes: ["The absolute value of an integer is its distance from zero.", "An equation relates two expressions with an equality sign."],
        syllabus: ["Knowing Our Numbers & Large Numbers", "Whole Numbers & Number Line Properties", "Playing with Numbers: Prime, Composite, HCF & LCM", "Basic Geometrical Ideas", "Integers and Operations", "Fractions and Decimals", "Data Handling", "Mensuration", "Introduction to Algebra", "Ratio and Proportion"],
        chapters: [
          {
            id: "c6-m-ch1",
            title: "Integers & Operations",
            lessonsCount: 4,
            lessons: makeLessons("c6-m-ch1", 4, ["Positive and Negative Numbers on Number Line", "Rules for Adding and Subtracting Integers", "Multiplication and Division Concepts", "Practice Set: Real-world Temperature & Elevation Problems"])
          },
          {
            id: "c6-m-ch2",
            title: "Introduction to Algebra",
            lessonsCount: 4,
            lessons: makeLessons("c6-m-ch2", 4, ["Matchstick Patterns and Variables", "Writing Algebraic Expressions", "Solving One-Step Equations", "Concept Assessment: Algebraic Reasoning"])
          }
        ]
      },
      {
        id: "c6-science",
        title: "Class 6 Science: Physics, Chemistry & Biology",
        subject: "Science",
        tone: "emerald",
        level: "Beginner",
        iconSymbol: "6S",
        instructor: "Dr. Ramesh Nair",
        description: "Components of food, separation of substances, living organisms, motion, light, and electricity.",
        learningPath: ["Food & Nutrition", "Materials & Separation", "Living Things & Adaptations", "Physics: Motion, Light & Electricity"],
        notes: ["Nutrients include carbohydrates, proteins, fats, vitamins, and minerals.", "Light travels in straight lines and forms shadows when blocked."],
        syllabus: ["Components of Food & Balanced Diet", "Sorting Materials into Groups", "Separation of Substances", "Getting to Know Plants", "Body Movements: Joints & Muscles", "Living Organisms & Habitats", "Motion and Measurement", "Light, Shadows and Reflections", "Electricity and Circuits", "Fun with Magnets"],
        chapters: [
          {
            id: "c6-s-ch1",
            title: "Separation of Substances & Materials",
            lessonsCount: 3,
            lessons: makeLessons("c6-s-ch1", 3, ["Handpicking, Threshing, and Winnowing", "Sedimentation, Decantation, and Filtration", "Evaporation and Condensation in Nature"])
          },
          {
            id: "c6-s-ch2",
            title: "Electricity, Circuits & Magnetism",
            lessonsCount: 4,
            lessons: makeLessons("c6-s-ch2", 4, ["Electric Cell and Switch Mechanics", "Conductors vs Insulators", "Poles of Magnets & Magnetic Fields", "Hands-on Lab: Building a Safe Battery Circuit"])
          }
        ]
      },
      {
        id: "c6-social",
        title: "Class 6 Social Science: History, Civics & Earth",
        subject: "Social Science",
        tone: "amber",
        level: "Beginner",
        iconSymbol: "6SS",
        instructor: "Mr. Vikramaditya Rao",
        description: "Ancient Indian history, Earth's geography, diversity, and rural/urban local governments.",
        learningPath: ["Our Pasts: Early Civilizations", "Earth: Latitudes & Motions", "Democracy & Panchayati Raj", "Urban & Rural Livelihoods"],
        notes: ["The Harappan civilization featured grid planning and drainage.", "The Gram Panchayat is the foundational pillar of rural governance."],
        syllabus: ["From Gathering to Growing Food", "In the Earliest Cities: Harappa", "Kingdoms, Kings and an Early Republic", "Ashoka, the Emperor Who Gave Up War", "Globe: Latitudes and Longitudes", "Motions of the Earth", "Major Domains of Earth", "Panchayati Raj and Local Government"],
        chapters: [
          {
            id: "c6-ss-ch1",
            title: "Early Civilizations & Harappa",
            lessonsCount: 3,
            lessons: makeLessons("c6-ss-ch1", 3, ["The Discovery of Harappa and Mohenjo-daro", "Town Planning and The Great Bath", "Trade, Seals, and Crafts in the Bronze Age"])
          }
        ]
      }
    ]
  },

  // CLASS 7
  {
    grade: "Class 7",
    subCategory: "Class 5 – 7",
    subjects: [
      {
        id: "c7-math",
        title: "Class 7 Mathematics: Rational Numbers & Algebra",
        subject: "Mathematics",
        tone: "violet",
        level: "Beginner",
        iconSymbol: "7M",
        instructor: "Mrs. Ananya Sharma",
        description: "Fractions, decimals, rational numbers, simple equations, lines, angles, triangles, and exponents.",
        learningPath: ["Rational Numbers", "Simple Linear Equations", "Triangles & Congruence", "Perimeter, Area & Exponents"],
        notes: ["A rational number is expressible as p/q where q is not zero.", "The exterior angle of a triangle equals the sum of interior opposite angles."],
        syllabus: ["Integers & Properties", "Fractions and Decimals", "Data Handling & Probability", "Simple Equations", "Lines and Angles", "The Triangle and its Properties", "Comparing Quantities: Percentages & Interest", "Rational Numbers", "Perimeter and Area", "Algebraic Expressions", "Exponents and Powers"],
        chapters: [
          {
            id: "c7-m-ch1",
            title: "Rational Numbers & Operations",
            lessonsCount: 3,
            lessons: makeLessons("c7-m-ch1", 3, ["Standard Form of Rational Numbers", "Addition and Subtraction of Rational Quantities", "Multiplication, Division, and Reciprocals"])
          },
          {
            id: "c7-m-ch2",
            title: "The Triangle and Its Properties",
            lessonsCount: 4,
            lessons: makeLessons("c7-m-ch2", 4, ["Medians, Altitudes, and Angle Sum Property", "Exterior Angle Theorem", "Pythagoras Property for Right-Angled Triangles", "Practice Problems: Geometry Proofs"])
          }
        ]
      },
      {
        id: "c7-science",
        title: "Class 7 Science: Heat, Chemical Changes & Respiration",
        subject: "Science",
        tone: "emerald",
        level: "Beginner",
        iconSymbol: "7S",
        instructor: "Dr. Ramesh Nair",
        description: "Nutrition, heat transfer, acids and bases, physical/chemical changes, respiration, and motion.",
        learningPath: ["Plant & Animal Nutrition", "Thermal Physics: Heat", "Acids, Bases & Salts", "Respiration & Transportation"],
        notes: ["Heat transfers via conduction in solids, convection in fluids, and radiation.", "Acids turn blue litmus red; bases turn red litmus blue."],
        syllabus: ["Nutrition in Plants: Photosynthesis", "Nutrition in Animals: Human Digestion", "Heat: Temperature Scales, Conduction, Convection & Radiation", "Acids, Bases and Salts & Indicators", "Physical and Chemical Changes", "Respiration in Organisms", "Transportation in Animals and Plants", "Reproduction in Plants", "Motion and Time: Speed Graphs"],
        chapters: [
          {
            id: "c7-s-ch1",
            title: "Heat Transfer & Temperature",
            lessonsCount: 3,
            lessons: makeLessons("c7-s-ch1", 3, ["Clinical vs Laboratory Thermometers", "Conduction, Convection, and Sea/Land Breezes", "Radiation and Heat Absorption"])
          },
          {
            id: "c7-s-ch2",
            title: "Acids, Bases & Chemical Changes",
            lessonsCount: 3,
            lessons: makeLessons("c7-s-ch2", 3, ["Natural Indicators: Litmus, Turmeric, China Rose", "Neutralization Reactions in Daily Life", "Physical vs Chemical Changes and Rust Prevention"])
          }
        ]
      }
    ]
  },

  // CLASS 8
  {
    grade: "Class 8",
    subCategory: "Class 8 – 10",
    subjects: [
      {
        id: "c8-math",
        title: "Class 8 Mathematics: Linear Equations & Geometry",
        subject: "Mathematics",
        tone: "indigo",
        level: "Intermediate",
        iconSymbol: "8M",
        instructor: "Mrs. Ananya Sharma",
        description: "Rational numbers, linear equations, quadrilaterals, square/cube roots, factoring, and mensuration.",
        learningPath: ["Linear Equations", "Quadrilaterals & Polygons", "Squares, Cubes & Roots", "Factorization & Mensuration"],
        notes: ["Sum of interior angles of an n-sided polygon is (n - 2) * 180 degrees.", "Compound interest: A = P(1 + r/100)^n."],
        syllabus: ["Rational Numbers", "Linear Equations in One Variable", "Understanding Quadrilaterals", "Data Handling & Pie Charts", "Square and Square Roots", "Cube and Cube Roots", "Comparing Quantities: Compound Interest", "Algebraic Expressions and Identities", "Mensuration", "Exponents and Powers", "Direct and Inverse Proportions", "Factorisation"],
        chapters: [
          {
            id: "c8-m-ch1",
            title: "Linear Equations in One Variable",
            lessonsCount: 4,
            lessons: makeLessons("c8-m-ch1", 4, ["Solving Equations with Variables on Both Sides", "Applications: Age, Currency, and Geometry Problems", "Equations Reducible to Linear Form", "Assessment: Linear Systems Mastery"])
          },
          {
            id: "c8-m-ch2",
            title: "Factorisation & Identities",
            lessonsCount: 4,
            lessons: makeLessons("c8-m-ch2", 4, ["Common Factors and Regrouping Terms", "Using Standard Algebraic Identities", "Splitting the Middle Term in Quadratics", "Division of Polynomials"])
          }
        ]
      },
      {
        id: "c8-science",
        title: "Class 8 Science: Physics, Chemistry & Biology",
        subject: "Science",
        tone: "emerald",
        level: "Intermediate",
        iconSymbol: "8S",
        instructor: "Dr. Ramesh Nair",
        description: "Microorganisms, combustion, cell structure, reproduction, force, pressure, friction, and light.",
        learningPath: ["Crop Production & Microbes", "Combustion & Fuels", "Cell Biology & Reproduction", "Physics: Force, Pressure & Light"],
        notes: ["Pressure equals force divided by contact area (P = F / A).", "Angle of incidence equals angle of reflection."],
        syllabus: ["Crop Production and Management", "Microorganisms: Friend and Foe", "Coal and Petroleum", "Combustion and Flame", "Cell Structure and Functions", "Reproduction in Animals", "Force and Pressure", "Friction: Types and Control", "Sound: Frequency & Amplitude", "Chemical Effects of Current", "Light: Human Eye & Reflection"],
        chapters: [
          {
            id: "c8-s-ch1",
            title: "Force, Pressure & Friction",
            lessonsCount: 4,
            lessons: makeLessons("c8-s-ch1", 4, ["Contact and Non-Contact Forces", "Fluid Pressure and Atmospheric Height Effects", "Friction as a Necessary Evil", "Methods to Increase and Reduce Friction"])
          },
          {
            id: "c8-s-ch2",
            title: "Sound & Waves",
            lessonsCount: 3,
            lessons: makeLessons("c8-s-ch2", 3, ["Sound Produced by Vibrating Bodies", "Amplitude, Time Period, and Frequency", "Audible and Inaudible Sounds & Noise Pollution"])
          }
        ]
      }
    ]
  },

  // CLASS 9
  {
    grade: "Class 9",
    subCategory: "Class 8 – 10",
    subjects: [
      {
        id: "c9-math",
        title: "Class 9 Mathematics: Real Numbers & Geometry",
        subject: "Mathematics",
        tone: "indigo",
        level: "Intermediate",
        iconSymbol: "9M",
        instructor: "Prof. S. Ramanujan Institute",
        description: "Real numbers, polynomials, coordinate geometry, Euclidean geometry, triangles, circles, and statistics.",
        learningPath: ["Number Systems & Irrational Numbers", "Polynomials & Remainder Theorem", "Euclid & Triangle Theorems", "Surface Areas & Statistics"],
        notes: ["Every irrational number can be represented on the number line using Pythagoras theorem.", "Angles in the same segment of a circle are equal."],
        syllabus: ["Number Systems: Real Numbers, Irrationality, Laws of Exponents", "Polynomials: Remainder Theorem, Factor Theorem", "Coordinate Geometry: Cartesian Plane", "Linear Equations in Two Variables", "Introduction to Euclid's Geometry", "Lines and Angles: Parallel Lines, Transversals", "Triangles: Congruence Criteria (SAS, ASA, SSS, RHS)", "Quadrilaterals: Mid-point Theorem", "Circles: Theorems on Chords & Cyclic Quadrilaterals", "Heron's Formula", "Surface Areas and Volumes: Cones & Spheres", "Statistics & Frequency Histograms"],
        chapters: [
          {
            id: "c9-m-ch1",
            title: "Number Systems & Irrational Numbers",
            lessonsCount: 4,
            lessons: makeLessons("c9-m-ch1", 4, ["Rational vs Irrational Real Numbers", "Representing Square Root of x on Number Line", "Rationalising the Denominator", "Laws of Exponents for Real Powers"])
          },
          {
            id: "c9-m-ch2",
            title: "Polynomials & Factoring",
            lessonsCount: 4,
            lessons: makeLessons("c9-m-ch2", 4, ["Degree and Coefficients of Polynomials", "Zeroes of a Polynomial", "Remainder Theorem and Factor Theorem", "Advanced Algebraic Identities"])
          }
        ]
      },
      {
        id: "c9-physics",
        title: "Class 9 Physics: Motion, Gravitation & Energy",
        subject: "Physics",
        tone: "cyan",
        level: "Intermediate",
        iconSymbol: "9P",
        instructor: "Dr. Homi Bhabha Memorial Faculty",
        description: "Kinematics, Newton's laws of motion, universal gravitation, work, energy, power, and sound.",
        learningPath: ["Kinematics: Velocity & Acceleration", "Newton's Laws of Motion", "Universal Law of Gravitation", "Work, Energy & Sound"],
        notes: ["Equations of motion: v = u + at, s = ut + 0.5at^2, v^2 = u^2 + 2as.", "Universal Gravitational Force: F = G * (m1 * m2) / r^2."],
        syllabus: ["Motion: Distance, Displacement, Speed, Velocity, Uniform vs Non-Uniform", "Graphical Representation of Motion & Derivation of Equations", "Force and Laws of Motion: Inertia, Momentum, Newton's Laws", "Conservation of Linear Momentum", "Gravitation: Universal Gravitation, Acceleration due to Gravity (g)", "Mass vs Weight, Thrust, Pressure, Archimedes' Principle", "Work and Energy: Kinetic Energy, Potential Energy, Conservation Law", "Power & Commercial Unit of Energy", "Sound: Propagation, Reflection, Echo, Sonar"],
        chapters: [
          {
            id: "c9-p-ch1",
            title: "Motion & Kinematics",
            lessonsCount: 4,
            lessons: makeLessons("c9-p-ch1", 4, ["Scalar vs Vector: Distance vs Displacement", "Velocity, Instantaneous Speed, and Acceleration", "Graphical Proof of Kinematics Equations", "Numerical Problem Solving: Accelerated Motion"])
          },
          {
            id: "c9-p-ch2",
            title: "Forces & Newton's Laws",
            lessonsCount: 4,
            lessons: makeLessons("c9-p-ch2", 4, ["Inertia and First Law of Motion", "Mathematical Formulation of Second Law (F = ma)", "Action and Reaction Forces (Third Law)", "Conservation of Momentum in Collisions"])
          }
        ]
      },
      {
        id: "c9-chemistry",
        title: "Class 9 Chemistry: Matter & Atomic Structure",
        subject: "Chemistry",
        tone: "amber",
        level: "Intermediate",
        iconSymbol: "9C",
        instructor: "Dr. Prafulla Chandra Ray Group",
        description: "States of matter, mixtures, solutions, atoms, molecules, chemical formulae, and atomic structure.",
        learningPath: ["Particulate Nature of Matter", "Solutions, Colloids & Suspensions", "Atoms, Molecules & Mole Concept", "Atomic Models & Electron Configuration"],
        notes: ["Law of Conservation of Mass: Mass can neither be created nor destroyed in a chemical reaction.", "1 mole = 6.022 x 10^23 particles."],
        syllabus: ["Matter in Our Surroundings: States, Latent Heat, Evaporation", "Is Matter Around Us Pure?: Mixtures, Solutions, Colloids", "Separation Techniques: Chromatography, Distillation", "Atoms and Molecules: Laws of Chemical Combination", "Mole Concept & Avogadro's Constant", "Structure of the Atom: Thomson, Rutherford, Bohr Models", "Valency, Isotopes and Isobars"],
        chapters: [
          {
            id: "c9-c-ch1",
            title: "Matter & States of Matter",
            lessonsCount: 3,
            lessons: makeLessons("c9-c-ch1", 3, ["Characteristics of Particles of Matter", "Interconversion of States and Latent Heat", "Factors Affecting Evaporation & Cooling Effect"])
          },
          {
            id: "c9-c-ch2",
            title: "Atoms, Molecules & The Mole Concept",
            lessonsCount: 4,
            lessons: makeLessons("c9-c-ch2", 4, ["Dalton's Atomic Theory & Modern Views", "Writing Formulae of Simple Ionic Compounds", "Calculating Molecular and Formula Unit Mass", "Mastering Mole Conversions and Stoichiometry"])
          }
        ]
      },
      {
        id: "c9-biology",
        title: "Class 9 Biology: Cell Biology & Tissues",
        subject: "Biology",
        tone: "emerald",
        level: "Intermediate",
        iconSymbol: "9B",
        instructor: "Dr. M. S. Swaminathan Group",
        description: "The fundamental unit of life (cell), plant and animal tissues, and food resource improvement.",
        learningPath: ["Cell Structure & Organelles", "Plant Tissues (Meristematic & Permanent)", "Animal Tissues (Epithelial, Connective, Muscular, Nervous)", "Agricultural & Animal Husbandry Advances"],
        notes: ["Mitochondria is known as the powerhouse of the cell, generating ATP.", "Xylem conducts water; phloem transports food."],
        syllabus: ["The Fundamental Unit of Life: Cell Discovery, Membrane, Osmosis", "Cytoplasm and Cell Organelles: ER, Golgi, Mitochondria, Plastids", "Cell Division: Mitosis vs Meiosis", "Plant Tissues: Meristematic and Permanent Tissues", "Animal Tissues: Epithelial, Connective, Muscular, Nervous", "Improvement in Food Resources: Crops & Animal Husbandry"],
        chapters: [
          {
            id: "c9-b-ch1",
            title: "The Cell — Fundamental Unit of Life",
            lessonsCount: 4,
            lessons: makeLessons("c9-b-ch1", 4, ["Prokaryotic vs Eukaryotic Cells", "Structure and Function of the Plasma Membrane", "Endoplasmic Reticulum, Golgi Body, and Lysosomes", "Mitochondria, Chloroplasts, and Nucleus DNA"])
          }
        ]
      }
    ]
  },

  // CLASS 10
  {
    grade: "Class 10",
    subCategory: "Class 8 – 10",
    subjects: [
      {
        id: "c10-math",
        title: "Class 10 Mathematics: Board Exam Mastery",
        subject: "Mathematics",
        tone: "indigo",
        level: "Intermediate",
        iconSymbol: "10M",
        instructor: "Prof. S. Ramanujan Institute",
        description: "Real numbers, polynomials, quadratic equations, arithmetic progressions, trigonometry, and geometry.",
        learningPath: ["Real Numbers & Polynomials", "Quadratic Equations & AP", "Trigonometric Ratios & Identities", "Circles, Areas & Coordinate Geometry"],
        notes: ["Fundamental Theorem of Arithmetic: Every composite number has a unique prime factorization.", "Quadratic Formula: x = (-b +- sqrt(b^2 - 4ac)) / (2a).", "sin^2(theta) + cos^2(theta) = 1."],
        syllabus: ["Real Numbers: Euclid's Lemma & Fundamental Theorem", "Polynomials: Geometric Meaning of Zeroes & Coefficients", "Pair of Linear Equations in Two Variables", "Quadratic Equations: Factorisation, Formula, Discriminant", "Arithmetic Progressions: nth Term and Sum of n Terms", "Triangles: Thales Theorem & Criteria for Similarity", "Coordinate Geometry: Distance & Section Formulae", "Introduction to Trigonometry: Ratios, Specific Angles, Identities", "Some Applications of Trigonometry: Heights and Distances", "Circles: Tangent Theorems", "Areas Related to Circles", "Surface Areas and Volumes", "Statistics & Probability"],
        chapters: [
          {
            id: "c10-m-ch1",
            title: "Quadratic Equations & Roots",
            lessonsCount: 4,
            lessons: makeLessons("c10-m-ch1", 4, ["Standard Form of Quadratic Equation", "Solving by Factorisation", "Deriving and Using the Quadratic Formula", "Discriminant Analysis & Real World Word Problems"])
          },
          {
            id: "c10-m-ch2",
            title: "Trigonometry & Applications",
            lessonsCount: 4,
            lessons: makeLessons("c10-m-ch2", 4, ["Trigonometric Ratios in Right Triangles", "Values of Trigonometric Ratios for 0, 30, 45, 60, 90 Degrees", "Proving Trigonometric Identities", "Heights and Distances: Angle of Elevation and Depression"])
          }
        ]
      },
      {
        id: "c10-physics",
        title: "Class 10 Physics: Light & Current Electricity",
        subject: "Physics",
        tone: "cyan",
        level: "Intermediate",
        iconSymbol: "10P",
        instructor: "Dr. C. V. Raman Department",
        description: "Reflection, refraction, optical lenses, human eye, electricity, Ohm's law, and magnetic effects of current.",
        learningPath: ["Optics: Reflection & Refraction", "The Human Eye & Dispersion", "Electricity: Ohm's Law & Circuits", "Electromagnetism & Motors"],
        notes: ["Mirror formula: 1/f = 1/v + 1/u; Lens formula: 1/f = 1/v - 1/u.", "Ohm's Law: V = I * R at constant temperature."],
        syllabus: ["Light — Reflection: Spherical Mirrors, Mirror Formula", "Light — Refraction: Snell's Law, Lenses, Lens Formula", "Human Eye: Accommodation, Myopia, Hypermetropia, Dispersion", "Electricity: Current, Potential Difference, Ohm's Law, Resistivity", "Resistors in Series and Parallel, Joule's Heating Effect, Electric Power", "Magnetic Effects of Electric Current: Field Lines, Solenoids", "Fleming's Rules, Electric Motor & Electromagnetic Induction"],
        chapters: [
          {
            id: "c10-p-ch1",
            title: "Light — Reflection & Refraction",
            lessonsCount: 4,
            lessons: makeLessons("c10-p-ch1", 4, ["Spherical Mirrors & Ray Diagrams", "Mirror Formula and Magnification Sign Convention", "Refraction through Glass Slab & Snell's Law", "Convex and Concave Lenses Numerical Problems"])
          },
          {
            id: "c10-p-ch2",
            title: "Current Electricity & Circuits",
            lessonsCount: 4,
            lessons: makeLessons("c10-p-ch2", 4, ["Electric Current and Potential Difference", "Ohm's Law and V-I Characteristics", "Equivalent Resistance in Series and Parallel", "Joule's Law of Heating & Electrical Energy Consumption"])
          }
        ]
      },
      {
        id: "c10-chemistry",
        title: "Class 10 Chemistry: Chemical Reactions & Carbon",
        subject: "Chemistry",
        tone: "amber",
        level: "Intermediate",
        iconSymbol: "10C",
        instructor: "Dr. Prafulla Chandra Ray Group",
        description: "Chemical equations, redox reactions, acids/bases, metallurgy, carbon compounds, and bonding.",
        learningPath: ["Balancing Chemical Equations", "Acids, Bases & Salts", "Metals, Non-Metals & Metallurgy", "Carbon & Its Organic Compounds"],
        notes: ["Oxidation is loss of electrons; reduction is gain of electrons.", "pH scale: pH < 7 acidic, pH > 7 basic.", "Carbon forms covalent bonds due to tetravalency and catenation."],
        syllabus: ["Chemical Reactions: Types of Reactions, Balancing Equations", "Acids, Bases and Salts: pH Scale, Bleaching Powder, Plaster of Paris", "Metals and Non-metals: Reactivity Series, Metallurgy Basics", "Carbon and its Compounds: Covalent Bonding, Homologous Series", "Ethanol and Ethanoic Acid, Soaps and Detergents"],
        chapters: [
          {
            id: "c10-c-ch1",
            title: "Chemical Reactions & Balancing",
            lessonsCount: 4,
            lessons: makeLessons("c10-c-ch1", 4, ["Writing and Balancing Chemical Equations", "Synthesis, Decomposition, and Displacement Reactions", "Oxidation-Reduction (Redox) Invariants", "Preventing Corrosion and Food Rancidity"])
          },
          {
            id: "c10-c-ch2",
            title: "Carbon & Its Covalent Chemistry",
            lessonsCount: 4,
            lessons: makeLessons("c10-c-ch2", 4, ["Tetravalency, Catenation, and Allotropes", "Alkanes, Alkenes, Alkynes & Functional Groups", "Ethanol and Ethanoic Acid Reactions", "Micelle Formation and Cleansing Action of Soap"])
          }
        ]
      },
      {
        id: "c10-biology",
        title: "Class 10 Biology: Life Processes & Heredity",
        subject: "Biology",
        tone: "emerald",
        level: "Intermediate",
        iconSymbol: "10B",
        instructor: "Dr. M. S. Swaminathan Group",
        description: "Life processes (nutrition, respiration, circulation, excretion), nervous system, reproduction, and genetics.",
        learningPath: ["Nutrition & Respiration", "Circulation & Excretion in Humans", "Control & Coordination", "Reproduction & Heredity"],
        notes: ["Nephron is the structural and functional unit of the human kidney.", "Mendel's monohybrid ratio: 3:1 phenotypic, 1:2:1 genotypic."],
        syllabus: ["Life Processes: Nutrition, Respiration, Circulation, Excretion", "Control and Coordination: Nervous System, Reflex Arc, Hormones", "How do Organisms Reproduce?: Asexual and Sexual Modes", "Heredity: Mendel's Laws, Sex Determination in Humans", "Our Environment: Food Chains & Ozone Layer"],
        chapters: [
          {
            id: "c10-b-ch1",
            title: "Life Processes — Circulation & Excretion",
            lessonsCount: 4,
            lessons: makeLessons("c10-b-ch1", 4, ["Structure and Working of the Human Heart", "Double Circulation and Blood Pressure", "Excretory System and Structure of Nephron", "Artificial Kidney (Hemodialysis)"])
          },
          {
            id: "c10-b-ch2",
            title: "Heredity & Genetics",
            lessonsCount: 3,
            lessons: makeLessons("c10-b-ch2", 3, ["Mendel's Experiments with Garden Pea", "Laws of Inheritance: Dominance & Segregation", "Sex Determination in Humans (XX and XY)"])
          }
        ]
      }
    ]
  },

  // CLASS 11
  {
    grade: "Class 11",
    subCategory: "Class 11 – 12",
    subjects: [
      {
        id: "c11-physics",
        title: "Class 11 Physics: Mechanics & Thermodynamics",
        subject: "Physics",
        tone: "cyan",
        level: "Advanced",
        iconSymbol: "11P",
        instructor: "Prof. Walter Lewin Lecture Series",
        description: "Kinematics, rotational dynamics, work-energy theorem, gravitation, fluid mechanics, and thermodynamics.",
        learningPath: ["Vectors & Calculus in Mechanics", "Newtonian Dynamics & Friction", "Rotational Dynamics & Torque", "Thermodynamics & Oscillations"],
        notes: ["Work-Energy Theorem: Total work done equals change in kinetic energy (W = Delta K).", "First law of thermodynamics: dQ = dU + dW."],
        syllabus: ["Units, Measurements & Dimensional Analysis", "Kinematics: 1D & 2D Motion (Projectiles, Vectors)", "Laws of Motion, Friction, Circular Motion", "Work, Energy and Power: Collisions", "Rotational Motion: Moment of Inertia, Angular Momentum", "Gravitation: Kepler's Laws, Orbital Velocity", "Properties of Solids and Fluids: Bernoulli's Principle", "Thermodynamics & Kinetic Theory of Gases", "Oscillations (SHM) and Waves"],
        chapters: [
          {
            id: "c11-p-ch1",
            title: "Rotational Dynamics & Angular Momentum",
            lessonsCount: 4,
            lessons: makeLessons("c11-p-ch1", 4, ["Centre of Mass and Rigid Body Motion", "Torque and Angular Acceleration Equations", "Moment of Inertia Theorems", "Conservation of Angular Momentum in Spinning Systems"])
          },
          {
            id: "c11-p-ch2",
            title: "Thermodynamics & Fluid Dynamics",
            lessonsCount: 4,
            lessons: makeLessons("c11-p-ch2", 4, ["Bernoulli's Equation and Continuity Principle", "First Law of Thermodynamics and PV Work", "Isothermal and Adiabatic Processes", "Carnot Engine Efficiency and Second Law"])
          }
        ]
      },
      {
        id: "c11-chemistry",
        title: "Class 11 Chemistry: Structure, Bonding & GOC",
        subject: "Chemistry",
        tone: "amber",
        level: "Advanced",
        iconSymbol: "11C",
        instructor: "Prof. Linus Pauling Institute",
        description: "Quantum atomic structure, chemical bonding, chemical thermodynamics, equilibrium, and organic chemistry foundations.",
        learningPath: ["Atomic Structure & Quantum Numbers", "Chemical Bonding & Molecular Orbitals", "Thermodynamics & Chemical Equilibrium", "General Organic Chemistry (GOC)"],
        notes: ["Heisenberg Uncertainty: Delta x * Delta p >= h / (4pi).", "Gibbs Free Energy criterion: Delta G = Delta H - T * Delta S < 0."],
        syllabus: ["Some Basic Concepts: Mole Concept, Empirical Formula", "Structure of Atom: Quantum Mechanical Model, Orbitals", "Classification of Elements & Periodicity", "Chemical Bonding: VSEPR, Hybridization, MO Theory", "Thermodynamics: Enthalpy, Entropy, Gibbs Energy", "Equilibrium: Chemical (Kp, Kc) & Ionic (pH, Buffers, Ksp)", "Redox Reactions", "Organic Chemistry Basics: IUPAC, Resonance, Inductive Effect", "Hydrocarbons: Alkanes, Alkenes, Alkynes, Aromaticity"],
        chapters: [
          {
            id: "c11-c-ch1",
            title: "Chemical Bonding & Molecular Orbitals",
            lessonsCount: 4,
            lessons: makeLessons("c11-c-ch1", 4, ["Lewis Structures and Formal Charge", "VSEPR Geometry: Linear, Trigonal, Tetrahedral", "Valence Bond Theory and Hybridisation", "Molecular Orbital Theory (MOT) of Diatomic Molecules"])
          },
          {
            id: "c11-c-ch2",
            title: "General Organic Chemistry (GOC)",
            lessonsCount: 4,
            lessons: makeLessons("c11-c-ch2", 4, ["IUPAC Nomenclature of Polyfunctional Compounds", "Structural and Stereoisomerism", "Inductive, Resonance, and Hyperconjugation", "Carbocation, Carbanion, and Free Radical Stabilities"])
          }
        ]
      },
      {
        id: "c11-math",
        title: "Class 11 Mathematics: Trigonometry & Calculus Intro",
        subject: "Mathematics",
        tone: "indigo",
        level: "Advanced",
        iconSymbol: "11M",
        instructor: "Prof. S. Ramanujan Institute",
        description: "Sets, relations, trigonometric equations, permutations, conic sections, limits, and derivative foundations.",
        learningPath: ["Sets, Relations & Functions", "Trigonometric Functions & Identities", "Permutations & Combinations", "Limits & Introduction to Derivatives"],
        notes: ["A set with n elements has 2^n subsets.", "First principles derivative: f'(x) = lim(h->0) [f(x+h) - f(x)] / h."],
        syllabus: ["Sets, Subsets, Venn Diagrams", "Relations and Functions", "Trigonometric Functions & Compound Angles", "Complex Numbers and Quadratic Equations", "Linear Inequalities", "Permutations and Combinations", "Binomial Theorem", "Sequences and Series: AP and GP", "Straight Lines & Conic Sections: Parabolas, Ellipses", "Limits and Derivatives (First Principles)", "Probability"],
        chapters: [
          {
            id: "c11-m-ch1",
            title: "Limits & First Principles Derivatives",
            lessonsCount: 4,
            lessons: makeLessons("c11-m-ch1", 4, ["Intuitive Idea of Limit and Indeterminate Forms", "Standard Limits: sin(x)/x and (x^n - a^n)/(x - a)", "Derivative as Rate of Change & Tangent Slope", "Differentiating Functions from First Principles"])
          }
        ]
      },
      {
        id: "c11-commerce",
        title: "Class 11 Accountancy & Business Studies",
        subject: "Commerce",
        tone: "amber",
        level: "Intermediate",
        iconSymbol: "11COM",
        instructor: "Dr. K. V. Kamath Business Cell",
        description: "Accounting equation, journal entries, ledger, trial balance, business ownership, and financial systems.",
        learningPath: ["Double Entry Accounting", "Financial Statements of Sole Proprietorship", "Forms of Business Organization", "Sources of Business Finance"],
        notes: ["Accounting Equation: Assets = Liabilities + Capital.", "Debits increase assets/expenses; credits increase liabilities/revenue."],
        syllabus: ["Introduction to Accounting & GAAP Principles", "Accounting Equation & Rules of Debit and Credit", "Journal Entries, Ledger Posting, Bank Reconciliation (BRS)", "Trial Balance, Depreciation, Provisions", "Financial Statements: Trading, P&L Account, Balance Sheet", "Nature and Forms of Business Organisations", "Sources of Business Finance: Equity, Debentures"],
        chapters: [
          {
            id: "c11-com-ch1",
            title: "Double-Entry Accounting & Journal",
            lessonsCount: 4,
            lessons: makeLessons("c11-com-ch1", 4, ["Dual Aspect Concept & Accounting Equation", "Golden Rules of Debit and Credit", "Recording Transactions in General Journal", "Ledger Posting and Balancing Accounts"])
          }
        ]
      }
    ]
  },

  // CLASS 12
  {
    grade: "Class 12",
    subCategory: "Class 11 – 12",
    subjects: [
      {
        id: "c12-physics",
        title: "Class 12 Physics: Electromagnetism & Modern Physics",
        subject: "Physics",
        tone: "cyan",
        level: "Advanced",
        iconSymbol: "12P",
        instructor: "Prof. Walter Lewin Lecture Series",
        description: "Electrostatics, current electricity, magnetic fields, electromagnetic induction, wave optics, and quantum physics.",
        learningPath: ["Electrostatics & Gauss's Law", "Magnetism & Faraday's Law", "Wave Optics & Interference", "Modern Physics & Semiconductors"],
        notes: ["Gauss's Law: Closed surface flux = Q_enclosed / epsilon_0.", "Faraday's Law: emf = -N * d(Phi_B)/dt.", "Photoelectric equation: K_max = h * nu - work_function."],
        syllabus: ["Electric Charges and Fields: Coulomb's Law, Gauss's Theorem", "Electrostatic Potential & Capacitance", "Current Electricity: Drift Velocity, Kirchhoff's Laws", "Moving Charges and Magnetism: Biot-Savart, Ampere's Law", "Electromagnetic Induction: Faraday, Lenz, Inductance", "Alternating Current: LCR Circuits, Resonance, Transformers", "Wave Optics: Huygens' Principle, Interference, Diffraction", "Dual Nature of Matter & Photoelectric Effect", "Atoms & Nuclei", "Semiconductor Electronics: Diodes & Logic Gates"],
        chapters: [
          {
            id: "c12-p-ch1",
            title: "Electrostatics & Gauss's Theorem",
            lessonsCount: 4,
            lessons: makeLessons("c12-p-ch1", 4, ["Coulomb's Law in Vector Form", "Electric Field Lines and Dipole in Uniform Field", "Gauss's Law and Flux Calculation", "Applications: Charged Wire, Sheet, and Spherical Shell"])
          },
          {
            id: "c12-p-ch2",
            title: "Electromagnetic Induction & AC Circuits",
            lessonsCount: 4,
            lessons: makeLessons("c12-p-ch2", 4, ["Magnetic Flux and Faraday-Lenz Law", "Self and Mutual Inductance Invariants", "Series LCR Resonance & Q-Factor", "Step-Up and Step-Down Transformer Working"])
          }
        ]
      },
      {
        id: "c12-chemistry",
        title: "Class 12 Chemistry: Electrochemistry & Organic Reaction Mechanisms",
        subject: "Chemistry",
        tone: "amber",
        level: "Advanced",
        iconSymbol: "12C",
        instructor: "Prof. Linus Pauling Institute",
        description: "Solutions, electrochemistry, chemical kinetics, coordination chemistry, haloalkanes, and organic reactions.",
        learningPath: ["Solutions & Colligative Properties", "Nernst Equation & Batteries", "Chemical Kinetics & Rate Laws", "Coordination & Biomolecules"],
        notes: ["Raoult's Law: Partial vapor pressure = P0 * mole_fraction.", "Nernst Equation: E_cell = E0_cell - (0.0591 / n) * log(Q).", "First order rate: k = (2.303 / t) * log([A]0 / [A])."],
        syllabus: ["Solutions: Henry's Law, Raoult's Law, Colligative Properties", "Electrochemistry: Galvanic Cells, Nernst Equation, Kohlrausch's Law", "Chemical Kinetics: Rate Laws, Arrhenius Equation", "d- and f-Block Elements & Coordination Compounds", "Haloalkanes and Haloarenes: SN1 vs SN2 Mechanisms", "Alcohols, Phenols and Ethers", "Aldehydes, Ketones and Carboxylic Acids: Aldol & Cannizzaro", "Amines and Diazonium Salts", "Biomolecules: Glucose, Proteins, DNA/RNA"],
        chapters: [
          {
            id: "c12-c-ch1",
            title: "Solutions & Colligative Properties",
            lessonsCount: 4,
            lessons: makeLessons("c12-c-ch1", 4, ["Molarity, Molality, and Mole Fraction", "Raoult's Law for Ideal and Non-Ideal Solutions", "Elevation in Boiling Point & Freezing Point Depression", "Osmotic Pressure and Abnormal Molecular Mass"])
          },
          {
            id: "c12-c-ch2",
            title: "Organic Reaction Mechanisms (SN1 & SN2)",
            lessonsCount: 4,
            lessons: makeLessons("c12-c-ch2", 4, ["Haloalkanes Classification and C-X Polarity", "SN1 vs SN2 Mechanism: Kinetics and Inversion", "Elimination Reactions (E1 and E2)", "Organometallic Reagents: Grignard Synthesis"])
          }
        ]
      },
      {
        id: "c12-math",
        title: "Class 12 Mathematics: Differential & Integral Calculus",
        subject: "Mathematics",
        tone: "indigo",
        level: "Advanced",
        iconSymbol: "12M",
        instructor: "Prof. S. Ramanujan Institute",
        description: "Matrices, determinants, continuity, differential calculus, integral calculus, vectors, 3D geometry, and probability.",
        learningPath: ["Matrices & Determinants", "Differential Calculus & Applications", "Integral Calculus & Areas", "Vectors, 3D Geometry & Probability"],
        notes: ["Chain Rule: d/dx[f(g(x))] = f'(g(x)) * g'(x).", "Definite integral calculates area bounded by curves.", "Bayes' Theorem updates conditional probabilities with evidence."],
        syllabus: ["Relations and Functions: Injective & Surjective", "Inverse Trigonometric Functions", "Matrices & Determinants: Inverse, System of Equations", "Continuity and Differentiability: Chain Rule, Log Differentiation", "Applications of Derivatives: Tangents, Maxima & Minima", "Integrals: Substitution, By Parts, Partial Fractions, Definite Properties", "Applications of Integrals: Areas of Circles, Parabolas", "Differential Equations: Separation, Linear Form", "Vectors & Three-Dimensional Geometry", "Probability: Bayes' Theorem"],
        chapters: [
          {
            id: "c12-m-ch1",
            title: "Differential Calculus & Chain Rule",
            lessonsCount: 4,
            lessons: makeLessons("c12-m-ch1", 4, ["Continuity Definition and Discontinuity Types", "Differentiability and The Chain Rule", "Implicit and Parametric Differentiation", "Logarithmic Differentiation and Higher Order Derivatives"])
          },
          {
            id: "c12-m-ch2",
            title: "Integrals & Applications of Calculus",
            lessonsCount: 4,
            lessons: makeLessons("c12-m-ch2", 4, ["Integration by Substitution and Partial Fractions", "Integration by Parts Formula", "Definite Integrals and Fundamental Properties", "Calculating Area Enclosed Between Curves"])
          }
        ]
      },
      {
        id: "c12-commerce",
        title: "Class 12 Accountancy & Macroeconomics",
        subject: "Commerce",
        tone: "amber",
        level: "Advanced",
        iconSymbol: "12COM",
        instructor: "Dr. K. V. Kamath Business Cell",
        description: "Partnership firm accounting, share capital, debentures, cash flows, national income, and government budgets.",
        learningPath: ["Partnership Accounting", "Company Accounts & Share Capital", "Macroeconomics: National Income", "Money, Banking & Government Budget"],
        notes: ["National Income (GDP) via Value Added, Income, and Expenditure methods.", "Cash Flow Statement divides cash into Operating, Investing, and Financing."],
        syllabus: ["Partnership Fundamentals, Goodwill Valuation, Admission & Retirement", "Company Accounts: Share Capital, Forfeiture, Debentures", "Financial Statement Analysis & Ratios", "Cash Flow Statement (AS-3)", "Macroeconomics: Circular Flow of Income & National Income Aggregates", "Money and Banking: Money Multiplier & Central Bank Controls", "Income Determination & Aggregate Demand Multiplier", "Government Budget and Balance of Payments"],
        chapters: [
          {
            id: "c12-com-ch1",
            title: "Partnership Accounting & Goodwill",
            lessonsCount: 4,
            lessons: makeLessons("c12-com-ch1", 4, ["Partnership Deed and Profit & Loss Appropriation", "Valuing Goodwill by Super Profit Method", "Admission of Partner: Revaluation Account & Capital Adjustment", "Dissolution of Partnership Firm Procedures"])
          },
          {
            id: "c12-com-ch2",
            title: "National Income & Macro Accounting",
            lessonsCount: 4,
            lessons: makeLessons("c12-com-ch2", 4, ["Circular Flow of Income in Two-Sector Economy", "GDP, GNP, NDP, NNP at Factor Cost vs Market Price", "Calculating National Income via Three Approaches", "Money Creation and Central Bank Monetary Policy Instruments"])
          }
        ]
      }
    ]
  }
];

// Build School Courses list
const schoolCourses = [];
for (const cls of schoolClasses) {
  for (const sub of cls.subjects) {
    schoolCourses.push({
      ...sub,
      tier: "School",
      gradeOrYear: cls.grade,
      progress: Math.floor(Math.random() * 40) + 30,
      lessons: `${sub.chapters.reduce((sum, ch) => sum + ch.lessonsCount, 0) * 3} lessons`,
      time: `${Math.floor(Math.random() * 8) + 8}h ${Math.floor(Math.random() * 50)}m`,
      rating: 4.8,
      practiceQuestionsCount: Math.floor(Math.random() * 100) + 80,
      mockTestsCount: Math.floor(Math.random() * 4) + 3
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. UNDERGRADUATE COURSES (B.Tech, B.Com, B.Sc, BA, BCA)
// ─────────────────────────────────────────────────────────────────────────────
const ugCourses = [
  // B.Tech CS / IT / AI (subject: Computer Science / Artificial Intelligence)
  {
    id: "ug-btech-cse-dsa",
    title: "Data Structures & Algorithms (B.Tech CSE)",
    subject: "Computer Science",
    tone: "violet",
    level: "Intermediate",
    iconSymbol: "DSA",
    instructor: "Prof. Alan Turing Chair",
    tier: "Undergraduate",
    gradeOrYear: "B.Tech CSE · Sem 3",
    rating: 4.9,
    description: "Rigorous study of linear/non-linear data structures, asymptotic notation, tree traversals, shortest-path algorithms, and dynamic programming.",
    learningPath: ["Asymptotic Complexity (Big-O)", "Linear Data Structures & Hash Tables", "Trees, Heaps & Balanced BSTs", "Graph Algorithms & Shortest Path", "Dynamic Programming & Greedy Algorithms"],
    notes: ["Amortized analysis averages cost across operations.", "Dijkstra algorithm executes in O((V + E) log V) with min-heap."],
    syllabus: ["Asymptotic Notation & Master Theorem", "Arrays, Stacks, Queues, Linked Lists", "Hash Tables & Collision Resolution", "Binary Search Trees & AVL Trees", "Heaps and Priority Queues", "Graph Traversals (BFS, DFS)", "Shortest Paths (Dijkstra, Bellman-Ford)", "Dynamic Programming (Knapsack, LCS)"],
    chapters: [
      {
        id: "ug-dsa-ch1",
        title: "Complexity Analysis & Sorting",
        lessonsCount: 4,
        lessons: makeLessons("ug-dsa-ch1", 4, ["Big-O, Omega, and Theta Definitions", "Master Theorem for Divide-and-Conquer Recurrences", "Quick Sort Partitioning Invariants", "Merge Sort and Inversion Counting"])
      },
      {
        id: "ug-dsa-ch2",
        title: "Graph Algorithms & Shortest Paths",
        lessonsCount: 4,
        lessons: makeLessons("ug-dsa-ch2", 4, ["Graph Representations: Adjacency List vs Matrix", "Breadth First Search (BFS) and Depth First Search (DFS)", "Dijkstra's Algorithm with Min-Heap", "Bellman-Ford & Negative Cycle Detection"])
      }
    ]
  },
  {
    id: "ug-btech-cse-os",
    title: "Operating Systems (B.Tech CSE)",
    subject: "Computer Science",
    tone: "indigo",
    level: "Intermediate",
    iconSymbol: "OS",
    instructor: "Dr. Linus Torvalds Academic Chair",
    tier: "Undergraduate",
    gradeOrYear: "B.Tech CSE · Sem 4",
    rating: 4.8,
    description: "Processes, threads, CPU scheduling algorithms, mutexes, semaphores, deadlock handling, virtual memory, paging, and file systems.",
    learningPath: ["Processes, Threads & System Calls", "CPU Scheduling & Concurrency", "Deadlocks & Synchronization Primitives", "Paging, Virtual Memory & Storage"],
    notes: ["Deadlock conditions: Mutual exclusion, Hold and wait, No preemption, Circular wait.", "Paging translates logical addresses to physical frames using page tables."],
    syllabus: ["Kernel Architectures & System Calls", "Process Management & IPC", "Threads: User vs Kernel Threads", "CPU Scheduling: FCFS, SJF, Round Robin", "Process Synchronization: Semaphores & Mutex", "Deadlocks: Banker's Algorithm", "Memory Management: Paging & TLB", "Virtual Memory & LRU Page Replacement", "File Systems & Inodes"],
    chapters: [
      {
        id: "ug-os-ch1",
        title: "Process Scheduling & Synchronization",
        lessonsCount: 4,
        lessons: makeLessons("ug-os-ch1", 4, ["Process Control Block (PCB) & Context Switch", "Round Robin Time Quantum Optimization", "Critical Section Problem & Mutex Locks", "Counting Semaphores and Deadlock Prevention"])
      }
    ]
  },
  {
    id: "ug-btech-cse-dbms",
    title: "Database Management Systems (B.Tech CSE)",
    subject: "Computer Science",
    tone: "cyan",
    level: "Intermediate",
    iconSymbol: "DBMS",
    instructor: "Prof. E. F. Codd Research Group",
    tier: "Undergraduate",
    gradeOrYear: "B.Tech CSE · Sem 4",
    rating: 4.9,
    description: "Relational model, SQL, normal forms (1NF to BCNF), indexing (B+ Trees), ACID transactions, concurrency control, and NoSQL databases.",
    learningPath: ["Relational Algebra & SQL", "ER Modeling & Normalization", "Transactions & Concurrency (2PL)", "Storage Engine & B+ Tree Indexing"],
    notes: ["ACID: Atomicity, Consistency, Isolation, Durability.", "BCNF requires every determinant to be a candidate key."],
    syllabus: ["Three-Schema Architecture", "Relational Algebra & Tuple Calculus", "SQL: DDL, DML, Joins, Aggregations, Views", "ER Diagrams & Normalization (1NF, 2NF, 3NF, BCNF)", "Storage & B+ Tree Indexing", "Transactions & Serializability", "Concurrency: Two-Phase Locking (2PL)", "Crash Recovery & WAL"],
    chapters: [
      {
        id: "ug-db-ch1",
        title: "Relational Normalization & Design",
        lessonsCount: 4,
        lessons: makeLessons("ug-db-ch1", 4, ["Functional Dependencies & Attribute Closure", "First, Second, and Third Normal Forms", "Boyce-Codd Normal Form (BCNF)", "Lossless Join Decomposition"])
      }
    ]
  },
  {
    id: "ug-btech-cse-cn",
    title: "Computer Networks (B.Tech CSE)",
    subject: "Computer Science",
    tone: "blue",
    level: "Intermediate",
    iconSymbol: "NET",
    instructor: "Prof. Andrew Tanenbaum Group",
    tier: "Undergraduate",
    gradeOrYear: "B.Tech CSE · Sem 5",
    rating: 4.8,
    description: "OSI and TCP/IP protocol stacks, framing, routing protocols (Dijkstra, Distance Vector, BGP), TCP flow/congestion control, DNS, and TLS.",
    learningPath: ["Physical & Data Link Layers", "Network Layer & IP Routing", "Transport Layer (TCP/UDP)", "Application Layer & Network Security"],
    notes: ["TCP guarantees reliable, ordered byte delivery.", "Subnetting partitions network address spaces."],
    syllabus: ["OSI 7-Layer vs TCP/IP Models", "Data Link: Framing, CRC, Sliding Window", "Network Layer: IPv4, Subnetting, CIDR", "Routing: OSPF, Distance Vector, BGP", "Transport Layer: UDP & TCP Three-Way Handshake", "TCP Congestion Control (Slow Start, AIMD)", "Application Protocols: DNS, HTTP/2, TLS"],
    chapters: [
      {
        id: "ug-cn-ch1",
        title: "IP Addressing & TCP Mechanics",
        lessonsCount: 4,
        lessons: makeLessons("ug-cn-ch1", 4, ["IPv4 Header and CIDR Subnetting", "Link State (OSPF) vs Distance Vector (BGP)", "TCP Three-Way Handshake & Flow Control", "TCP Slow Start and Fast Recovery"])
      }
    ]
  },
  {
    id: "ug-btech-ai-ml",
    title: "Artificial Intelligence & Machine Learning",
    subject: "Artificial Intelligence",
    tone: "rose",
    level: "Advanced",
    iconSymbol: "AI",
    instructor: "Prof. Geoffrey Hinton Research Lab",
    tier: "Undergraduate",
    gradeOrYear: "B.Tech AI · Sem 5",
    rating: 4.9,
    description: "Search algorithms (A*, Minimax), probability models, linear/logistic regression, SVMs, neural networks, backpropagation, and deep learning.",
    learningPath: ["Search Algorithms & Knowledge Representation", "Supervised Learning (Regression & Classification)", "Unsupervised Learning (Clustering & PCA)", "Deep Neural Networks & Backprop"],
    notes: ["A* search is optimal if the heuristic is admissible.", "Gradient descent updates: w = w - lr * grad(L)."],
    syllabus: ["State Space Search: A* Algorithm, Heuristics", "Game Playing: Minimax & Alpha-Beta Pruning", "Supervised Learning: Linear & Logistic Regression", "Decision Trees & Random Forests", "Support Vector Machines (SVM)", "Clustering: K-Means & PCA", "Neural Networks & Backpropagation"],
    chapters: [
      {
        id: "ug-ai-ch1",
        title: "A* Search & Neural Networks",
        lessonsCount: 4,
        lessons: makeLessons("ug-ai-ch1", 4, ["State Space Formulation & A* Search", "Minimax and Alpha-Beta Pruning in Games", "Perceptrons & Multi-Layer Neural Networks", "Backpropagation Calculus and Gradient Updates"])
      }
    ]
  },

  // B.Tech Engineering Branches (subject: Electronics, Mechanical, Civil, Electrical)
  {
    id: "ug-btech-ece-signals",
    title: "Signals & Systems (B.Tech ECE)",
    subject: "Electronics",
    tone: "teal",
    level: "Intermediate",
    iconSymbol: "SIG",
    instructor: "Prof. Oppenheim Institute",
    tier: "Undergraduate",
    gradeOrYear: "B.Tech ECE · Sem 4",
    rating: 4.8,
    description: "Continuous and discrete-time signals, LTI systems, convolution integral, Fourier series, Fourier transform, Laplace transform, and Z-transform.",
    learningPath: ["Continuous vs Discrete Signals", "LTI Systems & Convolution", "Fourier Series & Fourier Transform", "Laplace & Z-Transform"],
    notes: ["LTI systems are fully characterized by their impulse response h(t).", "Time convolution equals frequency multiplication."],
    syllabus: ["Continuous and Discrete Signals", "Linear Time-Invariant (LTI) Systems", "Convolution Integral and Sum", "Fourier Series and Transform", "Sampling Theorem & Nyquist Criterion", "Laplace Transform & ROC", "Z-Transform and Stability"],
    chapters: [
      {
        id: "ug-ece-ch1",
        title: "LTI Systems & Convolution",
        lessonsCount: 4,
        lessons: makeLessons("ug-ece-ch1", 4, ["Signal Operations and Linearity Properties", "Computing Graphical Convolution Integral", "Continuous-Time Fourier Transform", "Nyquist Sampling Theorem and Aliasing"])
      }
    ]
  },
  {
    id: "ug-btech-mech-thermo",
    title: "Engineering Thermodynamics (B.Tech Mechanical)",
    subject: "Mechanical",
    tone: "amber",
    level: "Intermediate",
    iconSymbol: "MECH",
    instructor: "Prof. Sadi Carnot Faculty",
    tier: "Undergraduate",
    gradeOrYear: "B.Tech Mech · Sem 3",
    rating: 4.8,
    description: "First and second laws of thermodynamics, entropy, Rankine cycle, Otto cycle, Diesel cycle, and refrigeration cycles.",
    learningPath: ["First Law for Closed & Open Systems", "Second Law, Heat Engines & Entropy", "Steam Power & Rankine Cycles", "Internal Combustion: Otto & Diesel Cycles"],
    notes: ["Kelvin-Planck: Heat cannot be completely converted to work in a cycle.", "Clausius inequality: integral dQ/T <= 0."],
    syllabus: ["First Law: Work, Heat, SFEE", "Second Law: Heat Engines & Refrigerators", "Carnot Theorem & Entropy Generation", "Steam Properties & Mollier Diagrams", "Vapor Power: Rankine Cycle", "Gas Power: Otto & Diesel Cycles"],
    chapters: [
      {
        id: "ug-mech-ch1",
        title: "Laws of Thermodynamics & Entropy",
        lessonsCount: 4,
        lessons: makeLessons("ug-mech-ch1", 4, ["Steady Flow Energy Equation (SFEE)", "Kelvin-Planck vs Clausius Statements", "Carnot Cycle Efficiency Limit", "Entropy Calculations for Gases and Steam"])
      }
    ]
  },
  {
    id: "ug-btech-civil-struct",
    title: "Structural Analysis & Mechanics (B.Tech Civil)",
    subject: "Civil",
    tone: "orange",
    level: "Intermediate",
    iconSymbol: "CIVIL",
    instructor: "Dr. Arthur Casagrande Center",
    tier: "Undergraduate",
    gradeOrYear: "B.Tech Civil · Sem 4",
    rating: 4.7,
    description: "Stress-strain tensors, shear force and bending moment diagrams, deflection of beams, truss analysis, and concrete mechanics.",
    learningPath: ["SFD & BMD for Beams", "Truss Analysis (Method of Joints/Sections)", "Deflection of Beams", "Reinforced Concrete Mechanics"],
    notes: ["Flexure formula: M / I = sigma / y = E / R.", "Shear stress: tau = (V * Q) / (I * b)."],
    syllabus: ["Shear Force and Bending Moment in Beams", "Stresses in Beams: Flexure & Transverse Shear", "Determinate Truss Analysis: Joints & Sections", "Deflection: Moment-Area & Macaulay's Method", "Euler's Critical Buckling Load for Columns"],
    chapters: [
      {
        id: "ug-civ-ch1",
        title: "Shear Force & Bending Moment Diagrams",
        lessonsCount: 4,
        lessons: makeLessons("ug-civ-ch1", 4, ["Equilibrium Equations and Support Reactions", "SFD and BMD for Cantilever and Simply Supported Beams", "Point of Contraflexure and Peak Moment", "Deflection Analysis using Moment-Area Theorems"])
      }
    ]
  },
  {
    id: "ug-btech-eee-machines",
    title: "Electrical Machines & Power Systems (B.Tech EEE)",
    subject: "Electrical",
    tone: "amber",
    level: "Intermediate",
    iconSymbol: "EEE",
    instructor: "Prof. Nikola Tesla Memorial Chair",
    tier: "Undergraduate",
    gradeOrYear: "B.Tech EEE · Sem 4",
    rating: 4.8,
    description: "Transformers, DC machines, induction motors, synchronous machines, power transmission, and grid stability.",
    learningPath: ["Single-Phase & 3-Phase Transformers", "DC Generators & Motors", "3-Phase Induction Motors", "Synchronous Alternators & Power Flow"],
    notes: ["Transformer EMF: E = 4.44 * f * N * Phi_max.", "Induction motor slip: s = (Ns - Nr) / Ns."],
    syllabus: ["Transformers: Equivalent Circuits & Efficiency", "DC Machines: Armature Reaction & Speed Control", "Three-Phase Induction Machines: Torque-Slip Curves", "Synchronous Generators: Voltage Regulation", "Power Transmission Lines & Fault Analysis"],
    chapters: [
      {
        id: "ug-eee-ch1",
        title: "Transformers & Induction Motors",
        lessonsCount: 4,
        lessons: makeLessons("ug-eee-ch1", 4, ["Ideal vs Practical Transformer Equivalent Circuit", "Open Circuit and Short Circuit Test Analysis", "Three-Phase Induction Motor Torque-Slip Curve", "Speed Control Methods for AC Drives"])
      }
    ]
  },

  // B.Com / Commerce (subject: Commerce)
  {
    id: "ug-bcom-accounting",
    title: "Corporate Accounting & Financial Management (B.Com)",
    subject: "Commerce",
    tone: "emerald",
    level: "Intermediate",
    iconSymbol: "BCOM",
    instructor: "Prof. Raghuram Rajan Chair",
    tier: "Undergraduate",
    gradeOrYear: "B.Com · Year 2",
    rating: 4.8,
    description: "Corporate financial statements, amalgamation, absorption, valuation of shares, working capital, and capital budgeting.",
    learningPath: ["Company Accounts & Share Issue", "Amalgamation & Internal Reconstruction", "Working Capital Management", "Capital Budgeting (NPV, IRR)"],
    notes: ["NPV discounts future cash flows at the cost of capital.", "Working capital cycle: Days Sales Outstanding + Days Inventory - Days Payable."],
    syllabus: ["Share Capital and Debentures Accounting", "Company Final Accounts under Schedule III", "Amalgamation and Reconstruction Schemes", "Valuation of Goodwill and Shares", "Financial Management: Risk-Return Tradeoff", "Capital Budgeting: NPV, IRR, Payback", "Working Capital Management"],
    chapters: [
      {
        id: "ug-bcom-ch1",
        title: "Capital Budgeting & Corporate Valuation",
        lessonsCount: 4,
        lessons: makeLessons("ug-bcom-ch1", 4, ["Net Present Value (NPV) vs Internal Rate of Return (IRR)", "Profitability Index and Capital Rationing", "Valuation of Equity Shares and Goodwill", "Working Capital Optimization Strategies"])
      }
    ]
  },

  // B.Sc / BA / BCA (subjects: Economics, Statistics, Arts, Psychology)
  {
    id: "ug-ba-economics",
    title: "Macroeconomic Theory & Policy Analysis (BA / B.Sc)",
    subject: "Economics",
    tone: "indigo",
    level: "Intermediate",
    iconSymbol: "ECON",
    instructor: "Dr. Amartya Sen Research Fellow",
    tier: "Undergraduate",
    gradeOrYear: "BA Economics · Year 2",
    rating: 4.8,
    description: "IS-LM framework, AD-AS models, monetary policy, fiscal deficits, inflation-unemployment Phillips curve, and open economy macro.",
    learningPath: ["National Income Determination", "IS-LM General Equilibrium", "Monetary & Fiscal Policy Mix", "Inflation, Unemployment & Growth"],
    notes: ["IS curve reflects goods market equilibrium; LM reflects money market equilibrium.", "The short-run Phillips curve shows an inverse relationship between inflation and unemployment."],
    syllabus: ["National Income Accounting & Aggregates", "Classical vs Keynesian Macroeconomic Systems", "IS-LM Model: Goods and Money Market Equilibrium", "Fiscal and Monetary Policy Multipliers", "Aggregate Demand and Aggregate Supply (AD-AS)", "Inflation Theories and Phillips Curve Dynamics", "Open Economy Macroeconomics: Mundell-Fleming Model"],
    chapters: [
      {
        id: "ug-econ-ch1",
        title: "IS-LM Framework & Policy Multipliers",
        lessonsCount: 4,
        lessons: makeLessons("ug-econ-ch1", 4, ["Deriving the IS Curve from Goods Market Equilibrium", "Deriving the LM Curve from Liquidity Preference", "Simultaneous Equilibrium and Crowding-Out Effect", "Evaluating Monetary vs Fiscal Stimulus Packages"])
      }
    ]
  },
  {
    id: "ug-bsc-statistics",
    title: "Probability Models & Statistical Inference (B.Sc)",
    subject: "Statistics",
    tone: "teal",
    level: "Intermediate",
    iconSymbol: "STAT",
    instructor: "Prof. P. C. Mahalanobis Chair",
    tier: "Undergraduate",
    gradeOrYear: "B.Sc Statistics · Year 2",
    rating: 4.8,
    description: "Discrete and continuous random variables, Central Limit Theorem, hypothesis testing, maximum likelihood estimation, and regression.",
    learningPath: ["Probability Distributions", "Sampling Distributions & CLT", "Point & Interval Estimation", "Hypothesis Testing (t-test, ANOVA)"],
    notes: ["Central Limit Theorem: Mean of sample means converges to normal distribution for n >= 30.", "p-value: Probability of obtaining test results at least as extreme as observed."],
    syllabus: ["Probability Axioms & Bayes' Theorem", "Discrete Distributions: Binomial, Poisson, Geometric", "Continuous Distributions: Normal, Exponential, Beta, Gamma", "Central Limit Theorem and Law of Large Numbers", "Estimation Theory: Maximum Likelihood & Method of Moments", "Hypothesis Testing: Type I and Type II Errors, Power", "Parametric Tests: z-test, t-test, Chi-square, F-test, ANOVA", "Linear Regression and Correlation Analysis"],
    chapters: [
      {
        id: "ug-stat-ch1",
        title: "Sampling Distributions & Hypothesis Testing",
        lessonsCount: 4,
        lessons: makeLessons("ug-stat-ch1", 4, ["Central Limit Theorem Simulation and Proof", "Formulating Null vs Alternative Hypotheses", "One-Sample and Two-Sample Student's t-Tests", "ANOVA: Testing Equality of Multiple Group Means"])
      }
    ]
  },
  {
    id: "ug-ba-psychology",
    title: "Cognitive Psychology & Behavioral Science (BA / B.Sc)",
    subject: "Psychology",
    tone: "rose",
    level: "Intermediate",
    iconSymbol: "PSYC",
    instructor: "Dr. Daniel Kahneman Memorial Fellow",
    tier: "Undergraduate",
    gradeOrYear: "BA Psychology · Year 2",
    rating: 4.8,
    description: "Perception, working memory models, dual-process decision making, cognitive heuristics, biases, and neurocognition.",
    learningPath: ["Perception & Attention", "Working Memory & Long-Term Storage", "Heuristics & Decision Biases", "Language, Thought & Problem Solving"],
    notes: ["System 1 operates automatically and fast; System 2 allocates attention to effortful mental operations.", "Working memory model: Central executive, phonological loop, visuospatial sketchpad."],
    syllabus: ["Foundations and History of Cognitive Psychology", "Sensory Processing, Pattern Recognition, and Attention", "Memory Models: Atkinson-Shiffrin and Baddeley's Working Memory", "Encoding, Consolidation, and Retrieval in Long-Term Memory", "Concepts, Prototypes, and Semantic Categorization", "Judgment and Decision Making: Prospect Theory, Heuristics", "Problem Solving, Insight, and Mental Sets"],
    chapters: [
      {
        id: "ug-psyc-ch1",
        title: "Memory Architecture & Cognitive Biases",
        lessonsCount: 4,
        lessons: makeLessons("ug-psyc-ch1", 4, ["Baddeley's Tripartite Working Memory Model", "Levels of Processing and Spaced Repetition", "Availability and Representativeness Heuristics", "Prospect Theory and Framing Effects in Decisions"])
      }
    ]
  },
  {
    id: "ug-ba-political-arts",
    title: "Political Philosophy & Constitutional Thought (BA Arts)",
    subject: "Arts",
    tone: "purple",
    level: "Intermediate",
    iconSymbol: "ARTS",
    instructor: "Dr. B. R. Ambedkar Academic Circle",
    tier: "Undergraduate",
    gradeOrYear: "BA Arts · Year 2",
    rating: 4.7,
    description: "Justice theories (Plato, Rawls), social contract (Hobbes, Locke, Rousseau), liberty, equality, rights, and Indian political thought.",
    learningPath: ["Classical Political Thought", "Social Contract Theory", "Theories of Justice & Liberty", "Modern Democratic Governance"],
    notes: ["Rawls' Veil of Ignorance ensures fair principles of justice without knowledge of personal advantage.", "Positive liberty is the capacity to act upon one's fundamental potential."],
    syllabus: ["Ancient Political Thought: Plato's Republic and Aristotle's Politics", "Social Contract Tradition: Hobbes, Locke, and Rousseau", "Modern Concepts: Liberty (Negative vs Positive), Equality, Justice", "John Rawls' Theory of Justice and Distributive Fairness", "Indian Political Thinkers: Kautilya, Gandhi, Ambedkar, Nehru", "Democratic Institutions, Federalism, and Human Rights"],
    chapters: [
      {
        id: "ug-arts-ch1",
        title: "Justice, Liberty & Democratic Rights",
        lessonsCount: 4,
        lessons: makeLessons("ug-arts-ch1", 4, ["Hobbes vs Locke on Natural Rights and State of Nature", "Rawlsian Justice as Fairness and the Difference Principle", "Negative vs Positive Liberty by Isaiah Berlin", "Constitutional Morality in Indian Democratic Philosophy"])
      }
    ]
  }
];

const formattedUgCourses = ugCourses.map((c) => ({
  ...c,
  progress: Math.floor(Math.random() * 40) + 30,
  lessons: `${c.chapters.reduce((sum, ch) => sum + ch.lessonsCount, 0) * 3} lessons`,
  time: `${Math.floor(Math.random() * 10) + 12}h ${Math.floor(Math.random() * 50)}m`,
  practiceQuestionsCount: Math.floor(Math.random() * 120) + 100,
  mockTestsCount: Math.floor(Math.random() * 5) + 4
}));

// ─────────────────────────────────────────────────────────────────────────────
// 3. POSTGRADUATE PROGRAMS (M.Tech, MBA, M.Sc)
// ─────────────────────────────────────────────────────────────────────────────
const pgCourses = [
  {
    id: "pg-mtech-dist-sys",
    title: "Distributed Systems & Cloud Architecture (M.Tech CS)",
    subject: "Computer Science",
    tone: "purple",
    level: "Advanced",
    iconSymbol: "DIST",
    instructor: "Prof. Leslie Lamport Fellow",
    tier: "Postgraduate",
    gradeOrYear: "M.Tech CSE · Sem 2",
    rating: 4.9,
    description: "Consensus algorithms (Raft, Paxos), CAP theorem, distributed transactions, 2PC, vector clocks, and event-driven microservices.",
    learningPath: ["CAP Theorem & Consistency Models", "Logical Clocks & Snapshot Algorithms", "Consensus: Paxos & Raft Protocols", "Distributed Transactions & Saga Pattern"],
    notes: ["CAP Theorem: A distributed system cannot simultaneously guarantee Consistency, Availability, and Partition Tolerance.", "Raft achieves consensus via leader election and replicated state machines."],
    syllabus: ["Distributed System Models & IPC (gRPC)", "Lamport Clocks, Vector Clocks, Chandy-Lamport Snapshots", "Leader Election (Bully, Ring)", "Paxos and Raft Consensus Protocols", "Two-Phase Commit (2PC) & Saga Pattern", "Eventual Consistency & CRDTs", "Distributed Storage: GFS & HDFS"],
    chapters: [
      {
        id: "pg-dist-ch1",
        title: "Consensus Protocols (Raft & Paxos)",
        lessonsCount: 4,
        lessons: makeLessons("pg-dist-ch1", 4, ["Byzantine Generals Problem and Quorums", "Paxos: Proposers, Acceptors, Learners", "Raft: Leader Election and Heartbeat Timers", "Joint Consensus and Dynamic Membership Changes"])
      }
    ]
  },
  {
    id: "pg-mtech-deep-learning",
    title: "Deep Learning & Generative Models (M.Tech AI)",
    subject: "Artificial Intelligence",
    tone: "rose",
    level: "Advanced",
    iconSymbol: "DL",
    instructor: "Dr. Yann LeCun Lab",
    tier: "Postgraduate",
    gradeOrYear: "M.Tech AI · Sem 2",
    rating: 4.9,
    description: "Modern architectures: ResNets, Transformers, self-attention, Diffusion Models, GANs, and Large Language Model pre-training.",
    learningPath: ["Residual Networks & Attention", "Transformers & Self-Attention", "Diffusion Models & Latent Spaces", "LLM Fine-Tuning (LoRA, RLHF)"],
    notes: ["Self-Attention formula: Attention(Q,K,V) = softmax(Q*K^T / sqrt(d_k)) * V.", "Diffusion models invert forward Gaussian noise corruptions."],
    syllabus: ["CNNs: ResNet, ConvNeXt, Vision Transformers", "Transformers: Multi-Head Attention, Rotary Embeddings", "Generative Models: GANs, VAEs, Diffusion (DDPM)", "Large Language Models: Tokenization, FlashAttention", "Instruction Tuning, LoRA & RLHF"],
    chapters: [
      {
        id: "pg-dl-ch1",
        title: "The Transformer & Self-Attention Mechanics",
        lessonsCount: 4,
        lessons: makeLessons("pg-dl-ch1", 4, ["Scaled Dot-Product and Multi-Head Attention", "Rotary and Sinusoidal Positional Embeddings", "Decoder Masking and Cross-Attention Invariants", "FlashAttention: GPU SRAM Tiling Optimization"])
      }
    ]
  },
  {
    id: "pg-mba-analytics",
    title: "Business Analytics & Quantitative Strategy (MBA)",
    subject: "Management",
    tone: "emerald",
    level: "Advanced",
    iconSymbol: "MBA",
    instructor: "Prof. Clayton Christensen Chair",
    tier: "Postgraduate",
    gradeOrYear: "MBA · Year 2",
    rating: 4.8,
    description: "Predictive analytics, customer lifetime value modeling, pricing optimization, churn prediction, and executive dashboards.",
    learningPath: ["Descriptive & Diagnostic Analytics", "Predictive Modeling & Customer Lifetime Value", "Prescriptive Analytics & Linear Programming", "Executive Dashboards & Storytelling"],
    notes: ["Customer Lifetime Value (LTV) should exceed 3x Customer Acquisition Cost (CAC).", "Conjoint analysis uncovers true feature preferences."],
    syllabus: ["Data-Driven Decision Making Lifecycle", "Regression for Demand & Price Elasticity", "Customer Analytics: RFM Segmentation & Churn Models", "Marketing Mix Modeling (MMM)", "Linear & Integer Programming for Logistics", "Monte Carlo Risk Simulation", "Executive Dashboard Storytelling"],
    chapters: [
      {
        id: "pg-mba-ch1",
        title: "Predictive Customer Analytics & LTV",
        lessonsCount: 4,
        lessons: makeLessons("pg-mba-ch1", 4, ["Customer Retention Cohort Analysis", "Modeling Customer Lifetime Value with Survival Models", "Churn Prediction using Tree Ensembles", "A/B Testing Methodology and Statistical Significance"])
      }
    ]
  },
  {
    id: "pg-msc-data-science",
    title: "Statistical Learning & Big Data Analytics (M.Sc)",
    subject: "Data Science",
    tone: "indigo",
    level: "Advanced",
    iconSymbol: "DATA",
    instructor: "Prof. Trevor Hastie Department",
    tier: "Postgraduate",
    gradeOrYear: "M.Sc Data Science · Year 1",
    rating: 4.8,
    description: "High-dimensional statistics, regularization (Ridge, Lasso, ElasticNet), Bayesian data analysis, and distributed Spark clusters.",
    learningPath: ["Statistical Foundations & Inference", "High-Dimensional Regularization", "Bayesian Hierarchical Modeling", "Distributed Computing with Apache Spark"],
    notes: ["Lasso (L1) yields sparse weights; Ridge (L2) prevents collinearity explosion.", "Posterior is proportional to Likelihood times Prior."],
    syllabus: ["Gauss-Markov Theorem & OLS Diagnostics", "Shrinkage Methods: Ridge, Lasso, Elastic Net", "Non-Parametric Splines & GAMs", "Bayesian MCMC & Gibbs Sampling", "Principal Component Regression", "Apache Spark DataFrames & GraphX", "Time Series: ARIMA & State Space Models"],
    chapters: [
      {
        id: "pg-msc-ch1",
        title: "Regularization & High-Dimensional Learning",
        lessonsCount: 4,
        lessons: makeLessons("pg-msc-ch1", 4, ["Bias-Variance Tradeoff and Cross-Validation", "Geometric Intuition of L1 (Lasso) vs L2 (Ridge)", "Coordinate Descent Optimization for Lasso", "Elastic Net for Correlated Feature Regimes"])
      }
    ]
  },
  {
    id: "pg-msc-mathematics",
    title: "Applied Mathematics & Partial Differential Equations (M.Sc)",
    subject: "Mathematics",
    tone: "violet",
    level: "Advanced",
    iconSymbol: "MATH",
    instructor: "Dr. Srinivasa Varadhan Research Center",
    tier: "Postgraduate",
    gradeOrYear: "M.Sc Maths · Year 2",
    rating: 4.9,
    description: "Real analysis, measure theory, Fourier analysis, elliptic and parabolic PDEs, and Sobolev spaces.",
    learningPath: ["Measure Theory & Lebesgue Integration", "Fourier Transforms in Hilbert Spaces", "Partial Differential Equations", "Sobolev Spaces & Variational Methods"],
    notes: ["Lebesgue dominated convergence theorem enables interchange of limit and integral.", "Sobolev spaces provide weak solutions to PDEs."],
    syllabus: ["Lebesgue Measure & Measurable Functions", "Lebesgue Dominated Convergence Theorem", "Hilbert Spaces & Riesz Representation", "Heat, Wave, and Laplace Equations", "Weak Formulations and Sobolev Spaces", "Finite Element Methods Foundations"],
    chapters: [
      {
        id: "pg-math-ch1",
        title: "PDEs & Weak Solutions",
        lessonsCount: 4,
        lessons: makeLessons("pg-math-ch1", 4, ["Classical Solutions to Heat and Wave Equations", "Distribution Theory and Weak Derivatives", "Sobolev Spaces H1 and Variational Formulations", "Lax-Milgram Theorem Application"])
      }
    ]
  }
];

const formattedPgCourses = pgCourses.map((c) => ({
  ...c,
  progress: Math.floor(Math.random() * 40) + 30,
  lessons: `${c.chapters.reduce((sum, ch) => sum + ch.lessonsCount, 0) * 3} lessons`,
  time: `${Math.floor(Math.random() * 10) + 14}h ${Math.floor(Math.random() * 50)}m`,
  practiceQuestionsCount: Math.floor(Math.random() * 120) + 120,
  mockTestsCount: Math.floor(Math.random() * 5) + 5
}));

// ─────────────────────────────────────────────────────────────────────────────
// 4. COMPETITIVE EXAMS
// ─────────────────────────────────────────────────────────────────────────────
const competitiveExamData = [
  // Engineering Entrance
  {
    id: "exam-jee-main",
    title: "JEE Main Master Prep (Physics, Chemistry & Maths)",
    examName: "JEE Main",
    tier: "Competitive Exams",
    gradeOrYear: "Engineering Entrance",
    subject: "Competitive Exams",
    tone: "amber",
    level: "Advanced",
    iconSymbol: "JEE",
    instructor: "Top Rankers & IITian Mentors",
    rating: 4.9,
    description: "Complete curriculum for JEE Main. Over 10,000 practice questions, formula mind maps, and past 15-year papers.",
    learningPath: ["Class 11 Foundations & High-Yield Revisions", "Class 12 Core Concepts & Board Alignment", "High-Weightage Problem Solving Modules", "Mock Tests, Speed Drills & Negative Marking Control"],
    notes: ["Focus on accuracy: negative marking (-1) penalizes random guesses.", "In Chemistry, NCERT is the supreme source for Inorganic."],
    syllabus: ["Physics: Mechanics, Waves, Heat, Electromagnetism, Optics, Modern Physics", "Chemistry: Physical, Inorganic, Organic Chemistry", "Mathematics: Algebra, Coordinate Geometry, Calculus, Vectors & 3D"],
    chapters: [
      {
        id: "jee-m-ch1",
        title: "Calculus for JEE Main",
        lessonsCount: 4,
        lessons: makeLessons("jee-m-ch1", 4, ["Limits and Standard Expansions", "Continuity, Differentiability, and Maxima/Minima", "Definite Integration and Area Under Curves", "Differential Equations"])
      }
    ]
  },
  {
    id: "exam-jee-advanced",
    title: "JEE Advanced Elite Prep (Multi-Concept Problems)",
    examName: "JEE Advanced",
    tier: "Competitive Exams",
    gradeOrYear: "IIT Entrance",
    subject: "Competitive Exams",
    tone: "orange",
    level: "Advanced",
    iconSymbol: "JEE+",
    instructor: "IIT Bombay & Delhi Alumni Network",
    rating: 4.9,
    description: "Rigorous problem sets, multi-correct questions, numerical value questions, and comprehension passages for top 500 IIT ranks.",
    learningPath: ["Multi-Concept Physics Problems (Irodov Level)", "Advanced Organic Synthesis & Reaction Mechanisms", "Non-Routine Calculus & Coordinate Geometry Invariants", "Full-Length 6-Hour Mock Tests (Paper 1 & Paper 2)"],
    notes: ["Always check boundary conditions in multi-correct questions.", "Look for energy conservation before setting up second-order differential equations."],
    syllabus: ["Physics: Rotational Dynamics, Electrodynamics, Wave Optics", "Chemistry: Stereochemistry, Reaction Intermediates, Quantum Chemistry", "Mathematics: Real Analysis, Complex Numbers, Probability Distributions"],
    chapters: [
      {
        id: "jeea-ch1",
        title: "Multi-Concept Rotational Mechanics",
        lessonsCount: 4,
        lessons: makeLessons("jeea-ch1", 4, ["Combined Translational and Rotational Motion with Slipping", "Angular Impulse and Conservation Invariants", "Precession of Gyroscopes and Rotating Frames", "Advanced Previous Year Problem Breakdown"])
      }
    ]
  },
  {
    id: "exam-bitsat-engineering",
    title: "BITSAT Speed & Accuracy Accelerator (Maths, Physics, Chem & English)",
    examName: "BITSAT",
    tier: "Competitive Exams",
    gradeOrYear: "Engineering Entrance",
    subject: "Competitive Exams",
    tone: "blue",
    level: "Advanced",
    iconSymbol: "BIT",
    instructor: "BITS Pilani Alumni Faculty",
    rating: 4.8,
    description: "Speed mastery for 130 questions in 180 minutes. Focus on quick formulas, English proficiency, and Logical Reasoning.",
    learningPath: ["High-Speed Formula Shortcuts", "English Proficiency & Grammar Rules", "Logical Reasoning Patterns & Puzzles", "12 Bonus Questions Strategy"],
    notes: ["Complete all 130 questions to unlock the 12 bonus questions.", "Speed and question selection are the two critical determinants."],
    syllabus: ["Physics (30 Qs)", "Chemistry (30 Qs)", "Mathematics (40 Qs)", "English Proficiency (10 Qs)", "Logical Reasoning (20 Qs)"],
    chapters: [
      {
        id: "bitsat-ch1",
        title: "Speed Math & Logical Reasoning",
        lessonsCount: 4,
        lessons: makeLessons("bitsat-ch1", 4, ["Algebra & Calculus Fast Computation Shortcuts", "Logical Deduction and Analytical Puzzles", "English Grammar Spotting Errors", "Full 180-Minute Mock Speed Simulation"])
      }
    ]
  },

  // Medical Entrance
  {
    id: "exam-neet-medical",
    title: "NEET UG Ultimate Prep (Biology, Physics & Chemistry)",
    examName: "NEET UG",
    tier: "Competitive Exams",
    gradeOrYear: "Medical Entrance",
    subject: "Competitive Exams",
    tone: "emerald",
    level: "Advanced",
    iconSymbol: "NEET",
    instructor: "AIIMS New Delhi Faculty Panel",
    rating: 4.9,
    description: "Line-by-line NCERT mastery for Biology (360/360 target), formula shortcuts for Physics, and high-yield Chemistry question banks.",
    learningPath: ["NCERT Biology Word-for-Word Memorization", "High-Speed Formula Application for Physics", "Inorganic & Organic Chemistry Reactions", "Full 720-Mark Time-Bound Diagnostic Mocks"],
    notes: ["Biology accounts for 50% of the entire score (360 marks out of 720).", "NCERT summary tables frequently yield direct assertion-reason questions."],
    syllabus: ["Biology: Botany (Genetics, Ecology) & Zoology (Physiology, Reproduction)", "Physics: Mechanics, Electrodynamics, Optics, Modern Physics", "Chemistry: Physical, Inorganic, Organic Chemistry"],
    chapters: [
      {
        id: "neet-b-ch1",
        title: "Human Physiology for NEET",
        lessonsCount: 4,
        lessons: makeLessons("neet-b-ch1", 4, ["Breathing and Exchange of Gases NCERT Highlights", "Body Fluids, Cardiac Cycle, and ECG", "Excretory Products and Nephron Counter-Current", "Neural Reflexes and Endocrine Hormones"])
      }
    ]
  },

  // PSU / Government
  {
    id: "exam-gate-cse",
    title: "GATE Computer Science & Engineering (PSU & Masters)",
    examName: "GATE CS",
    tier: "Competitive Exams",
    gradeOrYear: "PSU / Government",
    subject: "Competitive Exams",
    tone: "indigo",
    level: "Advanced",
    iconSymbol: "GATE",
    instructor: "IISc Bangalore & IIT Faculty Panel",
    rating: 4.9,
    description: "Target AIR < 100 for IISc, IITs, and PSU jobs (ONGC, IOCL, NTPC, ISRO, BARC). In-depth coverage of TOC, Compilers, OS, DBMS, Algorithms, and Maths.",
    learningPath: ["Engineering Mathematics & Discrete Structures", "Core CS Systems: OS, DBMS, Computer Networks", "Theoretical CS: TOC, Compiler Design, Algorithms", "Full-Length 65-Question Virtual Calculator Drills"],
    notes: ["Engineering Mathematics and Discrete Math carry 15% guaranteed marks.", "Practice with the official GATE Virtual Calculator."],
    syllabus: ["Engineering & Discrete Mathematics", "Digital Logic & Computer Organization", "Programming & Data Structures", "Algorithms & Theory of Computation", "Compiler Design, OS, DBMS, Networks"],
    chapters: [
      {
        id: "gate-toc-ch1",
        title: "Theory of Computation & Turing Machines",
        lessonsCount: 4,
        lessons: makeLessons("gate-toc-ch1", 4, ["DFA, NFA, and Regular Expressions Equivalence", "Pumping Lemma for Regular Languages", "Pushdown Automata (PDA) & Ambiguity in CFGs", "Turing Machines and Decidability"])
      }
    ]
  },
  {
    id: "exam-upsc-cse",
    title: "UPSC Civil Services Examination (IAS / IPS / IFS)",
    examName: "UPSC CSE",
    tier: "Competitive Exams",
    gradeOrYear: "PSU / Government",
    subject: "Competitive Exams",
    tone: "amber",
    level: "Advanced",
    iconSymbol: "UPSC",
    instructor: "Former Civil Servants & Policy Experts",
    rating: 4.9,
    description: "Comprehensive General Studies (GS Papers I - IV), CSAT, Essay, Ethics, Current Affairs, and Answer Writing Mastery.",
    learningPath: ["NCERT Basics & Standard Reference Books", "Current Affairs Integration & Editorial Analysis", "Prelims MCQ Elimination & CSAT Strategy", "Mains Answer Writing (GS 1, 2, 3, 4 & Essay)"],
    notes: ["Connect current affairs directly to static syllabus themes.", "Mains answer writing requires structured flowcharts and constitutional articles."],
    syllabus: ["Prelims: General Studies 1 & CSAT", "Mains GS 1: History, Geography, Indian Society", "Mains GS 2: Governance, Constitution, Polity, Social Justice, IR", "Mains GS 3: Economy, Tech, Environment, Security", "Mains GS 4: Ethics, Integrity, Aptitude & Case Studies"],
    chapters: [
      {
        id: "upsc-ch1",
        title: "Indian Polity & Constitutional Framework",
        lessonsCount: 4,
        lessons: makeLessons("upsc-ch1", 4, ["Preamble, Fundamental Rights, and Basic Structure", "Parliamentary vs Presidential Governance Systems", "Federalism, Center-State Relations, and Emergency", "Judicial Review, PILs, and Collegium System"])
      }
    ]
  },
  {
    id: "exam-ssc-cgl",
    title: "SSC CGL (Staff Selection Commission - Combined Graduate)",
    examName: "SSC CGL",
    tier: "Competitive Exams",
    gradeOrYear: "PSU / Government",
    subject: "Competitive Exams",
    tone: "blue",
    level: "Intermediate",
    iconSymbol: "SSC",
    instructor: "National Government Exam Experts",
    rating: 4.8,
    description: "Preparation for Assistant Section Officer, Income Tax Inspector, Central Excise, and Auditor posts. Quantitative aptitude, reasoning, and GK.",
    learningPath: ["Fast Arithmetic & Geometry Shortcuts", "Verbal & Non-Verbal Reasoning Puzzles", "General Awareness & Indian Economy", "English Grammar & Vocabulary Mastery"],
    notes: ["Memorize Pythagorean triplets and cubes up to 30 for speed.", "Tier 2 computer knowledge module is qualifying but mandatory."],
    syllabus: ["General Intelligence and Reasoning", "General Awareness: History, Polity, Economy, Science", "Quantitative Aptitude: Arithmetic & Advanced Maths", "English Comprehension & Sentence Correction"],
    chapters: [
      {
        id: "ssc-qa-ch1",
        title: "Speed Arithmetic & Advanced Maths",
        lessonsCount: 4,
        lessons: makeLessons("ssc-qa-ch1", 4, ["Ratio, Proportion, and Partnership Shortcuts", "Profit, Loss, and Successive Discounts", "Time, Speed, Distance, and Relative Velocity", "Geometry Theorems & Triangle Centers"])
      }
    ]
  },

  // MBA Entrance
  {
    id: "exam-cat-mba",
    title: "CAT Preparation (Common Admission Test for IIMs)",
    examName: "CAT MBA",
    tier: "Competitive Exams",
    gradeOrYear: "MBA Entrance",
    subject: "Competitive Exams",
    tone: "violet",
    level: "Advanced",
    iconSymbol: "CAT",
    instructor: "IIM Ahmedabad & Calcutta 99.9+ Percentilers",
    rating: 4.9,
    description: "Score 99+ percentile in Quantitative Aptitude (QA), Data Interpretation & Logical Reasoning (DILR), and Verbal Ability & Reading Comprehension (VARC).",
    learningPath: ["VARC Reading Speed & Critical Reasoning", "DILR Matrix Arrangements, Games & Tournaments", "QA Arithmetic, Algebra & Number Systems", "Sectional 40-Minute Time Management Drills"],
    notes: ["Question set selection in DILR determines your 99th percentile cutoff.", "In VARC, eliminate options that distort scope."],
    syllabus: ["VARC: Reading Comprehension, Para Jumbles, Summary", "DILR: Tables, Charts, Arrangements, Tournaments", "QA: Arithmetic, Algebra, Geometry, Numbers, Modern Math"],
    chapters: [
      {
        id: "cat-qa-ch1",
        title: "Algebra & Number Systems for CAT",
        lessonsCount: 4,
        lessons: makeLessons("cat-qa-ch1", 4, ["Quadratic Equations, Roots, and Maxima/Minima", "Progressions, Series, and Telescoping Sums", "Inequalities, Modulus, and Logarithms Shortcuts", "Remainders, Euler's Totient, and Cyclicity Invariants"])
      }
    ]
  },

  // International / Study Abroad
  {
    id: "exam-gre-international",
    title: "GRE General Test (Graduate Record Examination)",
    examName: "GRE",
    tier: "Competitive Exams",
    gradeOrYear: "Study Abroad",
    subject: "Competitive Exams",
    tone: "teal",
    level: "Advanced",
    iconSymbol: "GRE",
    instructor: "Stanford & MIT Graduate Alumni",
    rating: 4.9,
    description: "Target 330+ score for US, Canadian, and European universities. 1000+ high-frequency vocab words, Quant strategies, and AWA essay templates.",
    learningPath: ["High-Frequency GRE Vocabulary (Flashcards)", "Text Completion & Sentence Equivalence Logic", "Quantitative Reasoning Tricks & Traps", "Analytical Writing Issue Essay Blueprints"],
    notes: ["Context clues determine blank polarity in Text Completion.", "Quant is section-adaptive: strong section 1 unlocks higher scores."],
    syllabus: ["Verbal Reasoning: RC, Text Completion, Sentence Equivalence", "Quantitative Reasoning: Arithmetic, Algebra, Geometry, Data Analysis", "Analytical Writing: Analyze an Issue Task"],
    chapters: [
      {
        id: "gre-v-ch1",
        title: "Text Completion & Advanced Vocabulary",
        lessonsCount: 4,
        lessons: makeLessons("gre-v-ch1", 4, ["Identifying Pivot Words and Sentence Polarity", "Double-Blank and Triple-Blank Strategy", "High-Yield Root Words, Prefixes, and Suffixes", "Time Management and Elimination Invariants"])
      }
    ]
  },
  {
    id: "exam-ielts-academic",
    title: "IELTS Academic & General Training (Band 8.5+)",
    examName: "IELTS",
    tier: "Competitive Exams",
    gradeOrYear: "Study Abroad",
    subject: "Competitive Exams",
    tone: "cyan",
    level: "Intermediate",
    iconSymbol: "IELTS",
    instructor: "British Council & Cambridge Certified Trainers",
    rating: 4.9,
    description: "Comprehensive preparation across all 4 modules: Listening, Reading, Writing (Task 1 & 2), and Speaking with AI accent feedback.",
    learningPath: ["Listening Strategies (Accents & Distractors)", "Skimming & Scanning for Academic Reading", "Task 1 Visual Reports & Task 2 Essay Templates", "Speaking Part 1, 2, 3 Fluency & Lexical Drills"],
    notes: ["Strictly adhere to word counts in Listening (e.g. 'NO MORE THAN TWO WORDS').", "Answer every part of Task 2 prompt for maximum Task Achievement."],
    syllabus: ["Listening: 4 Recorded Sections (Conversations, Monologues)", "Reading: 3 Long Academic Texts with 40 Questions", "Writing: Task 1 Report and Task 2 Discursive Essay", "Speaking: Introduction, Long Turn, and Discussion"],
    chapters: [
      {
        id: "ielts-w-ch1",
        title: "Academic Writing Task 1 & 2",
        lessonsCount: 4,
        lessons: makeLessons("ielts-w-ch1", 4, ["Analyzing Trends in Bar, Line, and Pie Charts", "Describing Process Diagrams and Maps", "Structuring Agree/Disagree and Discussion Essays", "Cohesion, Coherence, and Advanced Linking Devices"])
      }
    ]
  }
];

const formattedCompetitiveExams = competitiveExamData.map((c) => ({
  ...c,
  progress: Math.floor(Math.random() * 30) + 40,
  lessons: `${c.chapters.reduce((sum, ch) => sum + ch.lessonsCount, 0) * 3} lessons`,
  time: `${Math.floor(Math.random() * 10) + 16}h ${Math.floor(Math.random() * 50)}m`,
  practiceQuestionsCount: Math.floor(Math.random() * 500) + 500,
  mockTestsCount: Math.floor(Math.random() * 10) + 10
}));

// ─────────────────────────────────────────────────────────────────────────────
// 5. PROFESSIONAL SKILLS & PROGRAMMING
// ─────────────────────────────────────────────────────────────────────────────
const professionalCourses = [
  // Programming (subject: "Programming")
  {
    id: "pro-python-mastery",
    title: "Python 3: Zero to Production & Fast Systems",
    subject: "Programming",
    tone: "emerald",
    level: "Beginner",
    iconSymbol: "PY",
    instructor: "Guido van Rossum Academy",
    tier: "Professional",
    gradeOrYear: "Professional Track",
    rating: 4.9,
    description: "Learn Python from variables and OOP to generators, decorators, async/await, multiprocessing, typing, and building RESTful APIs.",
    learningPath: ["Syntax, Data Structures & Control Flow", "Object-Oriented Python & Magic Methods", "Decorators, Generators & Context Managers", "Asyncio, Threading & FastAPI Backend"],
    notes: ["List comprehensions provide concise syntax for creating lists.", "GIL permits only one native thread to execute Python bytecode at a time."],
    syllabus: ["Python Setup & Virtual Environments", "Data Structures: Lists, Dicts, Sets", "OOP: Classes, Inheritance, Magic Methods", "Generators (yield) & Custom Decorators", "Concurrency: Asyncio & Multiprocessing", "Type Hinting and Pydantic Validation", "Pytest & Packaging"],
    chapters: [
      {
        id: "pro-py-ch1",
        title: "Decorators & Generators",
        lessonsCount: 4,
        lessons: makeLessons("pro-py-ch1", 4, ["Functions as First-Class Citizens and Closures", "Writing Custom Decorators with Arguments", "Memory Efficient Iteration with Generators and yield", "Creating Custom Context Managers using __enter__ and __exit__"])
      }
    ]
  },
  {
    id: "pro-javascript-typescript",
    title: "Modern JavaScript & TypeScript Full Spectrum",
    subject: "Programming",
    tone: "amber",
    level: "Intermediate",
    iconSymbol: "TS",
    instructor: "Brendan Eich & Anders Hejlsberg Center",
    tier: "Professional",
    gradeOrYear: "Professional Track",
    rating: 4.9,
    description: "Deep dive into JS event loop, closures, prototypes, ES6+, TypeScript generics, conditional types, mapped types, and AST.",
    learningPath: ["Event Loop, Microtasks & Promises", "Prototypes & Modern ESNext Syntax", "TypeScript Static Types & Generics", "Advanced Utility Types & Type Guards"],
    notes: ["The JS event loop runs microtasks before macrotasks.", "TypeScript's structural type system checks types based on shape."],
    syllabus: ["Execution Context & Closures", "Asynchronous JavaScript & Event Loop", "Prototypes & ES6 Classes", "TypeScript Generics & Conditional Types", "Mapped Types & Template Literals", "Type-Safe Enterprise Applications"],
    chapters: [
      {
        id: "pro-ts-ch1",
        title: "JavaScript Internals & Asynchrony",
        lessonsCount: 4,
        lessons: makeLessons("pro-ts-ch1", 4, ["V8 Engine: JIT Compilation and Inline Caches", "Event Loop Mechanics: Macrotasks vs Microtasks", "Custom Promise Implementation from Scratch", "Memory Leak Prevention and Garbage Collection"])
      }
    ]
  },
  {
    id: "pro-react-nextjs",
    title: "React 19 & Next.js Full Stack Architecture",
    subject: "Programming",
    tone: "cyan",
    level: "Advanced",
    iconSymbol: "REACT",
    instructor: "Meta Open Source Engineering",
    tier: "Professional",
    gradeOrYear: "Professional Track",
    rating: 4.9,
    description: "Server Components (RSC), Server Actions, Suspense, Concurrent Mode, Tailwind CSS v4, Zustand, and Next.js App Router.",
    learningPath: ["React 19 Hooks & Concurrent Rendering", "Next.js App Router & Server Components", "State Management with Zustand & React Query", "Performance Profiling & Edge Deployment"],
    notes: ["RSC components execute exclusively on the server, zeroing client bundle size.", "Server Actions provide type-safe RPCs without writing custom API routes."],
    syllabus: ["React 19 Fiber Architecture & Reconciliation", "Hooks: useTransition, useActionState, useOptimistic", "Next.js 15+ App Router: Layouts & Route Handlers", "Server Components vs Client Components", "Zustand & TanStack Query Integration", "Tailwind CSS v4 & Streaming at Edge"],
    chapters: [
      {
        id: "pro-react-ch1",
        title: "Fiber Reconciler & Server Components",
        lessonsCount: 4,
        lessons: makeLessons("pro-react-ch1", 4, ["Fiber Scheduling with Time-Slicing", "useTransition for Non-Urgent UI Updates", "RSC Payload Streaming Architecture", "Server Actions with Zod Validation"])
      }
    ]
  },
  {
    id: "pro-golang-backend",
    title: "Go (Golang) & High-Performance Microservices",
    subject: "Programming",
    tone: "cyan",
    level: "Advanced",
    iconSymbol: "GO",
    instructor: "Rob Pike Systems Lab",
    tier: "Professional",
    gradeOrYear: "Professional Track",
    rating: 4.9,
    description: "Goroutines, channels, memory allocation, profiling with pprof, gRPC, and building scalable cloud microservices.",
    learningPath: ["Go Syntax, Structs & Interfaces", "Concurrency: Goroutines & Channels", "HTTP Servers, Middlewares & gRPC", "Benchmarking & Memory Profiling (pprof)"],
    notes: ["Goroutines start with only 2KB of stack space that grows dynamically.", "Do not communicate by sharing memory; share memory by communicating."],
    syllabus: ["Go Toolchain, Modules, Packages", "Pointers, Structs, and Implicit Interfaces", "Goroutines, Channels, Select Statements", "Sync Package: Mutex, RWMutex, WaitGroup", "Building REST APIs with Gin / Chi", "High-Speed RPCs with Protocol Buffers & gRPC", "Profiling with pprof & Trace Analysis"],
    chapters: [
      {
        id: "pro-go-ch1",
        title: "Goroutines, Channels & Worker Pools",
        lessonsCount: 4,
        lessons: makeLessons("pro-go-ch1", 4, ["Goroutine Scheduling on the M:N Go Runtime", "Buffered vs Unbuffered Channel Mechanics", "Building Resilient Worker Pools with Context Cancellation", "Race Detector and Mutex Synchronization"])
      }
    ]
  },

  // AI / ML / Data Science (subject: Artificial Intelligence, Machine Learning, Data Science)
  {
    id: "pro-ml-engineering",
    title: "Machine Learning Engineering: Scikit-Learn & PyTorch",
    subject: "Machine Learning",
    tone: "rose",
    level: "Advanced",
    iconSymbol: "ML",
    instructor: "Andrew Ng DeepLearning.AI Group",
    tier: "Professional",
    gradeOrYear: "Professional Track",
    rating: 4.9,
    description: "Supervised and unsupervised learning, feature stores, model serving with FastAPI, ONNX runtime, and MLflow pipeline tracking.",
    learningPath: ["Feature Engineering & Pipelines", "Tree Ensembles (XGBoost, LightGBM)", "Neural Networks with PyTorch", "Model Serving & MLOps Tracking"],
    notes: ["Feature scaling (standardization/normalization) is essential for distance-based and gradient-based models.", "ROC-AUC measures ranking quality across all decision thresholds."],
    syllabus: ["Data Preprocessing: Imputation, One-Hot, Scaling", "Linear Regression, Logistic Regression, Regularization", "Decision Trees, Random Forests, XGBoost, CatBoost", "PyTorch Tensors, Autograd, Dataset & DataLoader", "Model Evaluation: Confusion Matrix, ROC-AUC, F1-Score", "MLflow Experiment Tracking and Model Registry", "Serving Models via FastAPI and Docker Containers"],
    chapters: [
      {
        id: "pro-ml-ch1",
        title: "Gradient Boosting & PyTorch Foundations",
        lessonsCount: 4,
        lessons: makeLessons("pro-ml-ch1", 4, ["Gradient Boosted Decision Trees Mechanics", "Hyperparameter Tuning with Optuna", "PyTorch Neural Network Modules and Forward Pass", "Building Custom Training Loops with Loss Functions"])
      }
    ]
  },
  {
    id: "pro-genai-llm",
    title: "Generative AI & LLM Engineering: RAG, LangChain & Fine-Tuning",
    subject: "Artificial Intelligence",
    tone: "rose",
    level: "Advanced",
    iconSymbol: "GENAI",
    instructor: "OpenAI & Hugging Face Alumni",
    tier: "Professional",
    gradeOrYear: "Professional Track",
    rating: 4.9,
    description: "Building Retrieval-Augmented Generation (RAG) systems, vector databases (Qdrant, Pinecone), prompt engineering, and LoRA fine-tuning.",
    learningPath: ["Vector Embeddings & Semantic Search", "RAG Architecture & Chunking Strategies", "LLM Orchestration with LangChain & LlamaIndex", "Parameter-Efficient Fine-Tuning (LoRA, QLoRA)"],
    notes: ["RAG grounds generative models in proprietary external knowledge bases to eliminate hallucinations.", "Cosine similarity measures angular divergence between high-dimensional embedding vectors."],
    syllabus: ["Text Embeddings: Sentence-Transformers & OpenAI Embeddings", "Vector Databases: Indexing (HNSW, IVFFlat), Similarity Search", "Chunking Strategies: Recursive, Semantic, Sliding Window", "Building Production RAG with Hybrid Search & Rerankers", "Agentic Workflows: Tool Calling, ReAct Pattern, Multi-Agent Swarms", "Parameter-Efficient Fine-Tuning with LoRA and PEFT", "Evaluating LLM Outputs: RAGAS Framework & TruLens"],
    chapters: [
      {
        id: "pro-genai-ch1",
        title: "Vector Search & Production RAG Pipelines",
        lessonsCount: 4,
        lessons: makeLessons("pro-genai-ch1", 4, ["High-Dimensional Vector Embeddings & HNSW Indexing", "Document Parsing, Chunking and Metadata Tagging", "Hybrid Search: Combining BM25 with Dense Embeddings", "Cross-Encoder Reranking and Context Compression"])
      }
    ]
  },
  {
    id: "pro-data-science-analytics",
    title: "Applied Data Science: Polars, Pandas & Statistical Analysis",
    subject: "Data Science",
    tone: "indigo",
    level: "Intermediate",
    iconSymbol: "DS",
    instructor: "Wesley McKinney Data Science Chair",
    tier: "Professional",
    gradeOrYear: "Professional Track",
    rating: 4.8,
    description: "High-performance tabular manipulation with Polars (Rust engine), Pandas 2.0 Arrow backend, time series modeling, and Seaborn data visualization.",
    learningPath: ["Data Wrangling with Polars & Pandas", "Exploratory Data Analysis (EDA)", "Time Series Decomposition & ARIMA", "Interactive Dashboards with Streamlit"],
    notes: ["Polars leverages Rust's Apache Arrow implementation with multi-threaded lazy execution.", "Stationarity in time series is required for ARIMA modeling."],
    syllabus: ["Polars LazyFrames & Query Optimization", "Pandas 2.0 with PyArrow Backends", "Exploratory Data Analysis Best Practices", "Statistical Hypothesis Testing in Python (SciPy)", "Time Series Decomposition, ACF/PACF, ARIMA", "Data Visualization with Matplotlib, Seaborn & Plotly", "Building Interactive Web Apps with Streamlit"],
    chapters: [
      {
        id: "pro-ds-ch1",
        title: "Polars Lazy Execution & Time Series Analysis",
        lessonsCount: 4,
        lessons: makeLessons("pro-ds-ch1", 4, ["Polars LazyFrame Query Planning and Predicate Pushdown", "Aggregation, Grouping, and Window Functions", "Time Series Rolling Averages and Stationarity Tests", "Building Interactive Exploratory Visualizations"])
      }
    ]
  },

  // Cloud Computing (subject: "Cloud Computing")
  {
    id: "pro-aws-solutions-architect",
    title: "AWS Certified Solutions Architect & Cloud Engineering",
    subject: "Cloud Computing",
    tone: "amber",
    level: "Advanced",
    iconSymbol: "AWS",
    instructor: "AWS Principal Technical Architects",
    tier: "Professional",
    gradeOrYear: "Professional Track",
    rating: 4.9,
    description: "Design highly available, fault-tolerant, cost-optimized architectures on Amazon Web Services (EC2, S3, RDS, Lambda, DynamoDB, VPC, IAM).",
    learningPath: ["Core Infrastructure: VPC, Subnets, EC2", "Storage & Database Services: S3, RDS, Aurora", "Serverless & Event-Driven: Lambda, SQS, SNS", "Security, IAM & High Availability Architecture"],
    notes: ["Multi-AZ deployments provide automatic failover for high availability.", "IAM roles provide temporary security credentials via STS instead of long-term keys."],
    syllabus: ["AWS Global Infrastructure (Regions, AZs, Edge Locations)", "Networking: VPC, Public/Private Subnets, NAT Gateways, Security Groups", "Compute: EC2 Instance Types, Auto Scaling Groups, Elastic Load Balancers", "Storage: S3 Storage Classes, Lifecycle Policies, EBS Volumes", "Databases: RDS Multi-AZ, Aurora Global Databases, DynamoDB", "Serverless: AWS Lambda, API Gateway, Step Functions, EventBridge", "Security: IAM Policies, Roles, KMS Encryption, AWS WAF"],
    chapters: [
      {
        id: "pro-aws-ch1",
        title: "VPC Networking & High Availability Compute",
        lessonsCount: 4,
        lessons: makeLessons("pro-aws-ch1", 4, ["Designing a Multi-Tier VPC with Public and Private Subnets", "Internet Gateways, NAT Gateways, and Route Table Rules", "Application Load Balancers (ALB) and Target Groups", "Auto Scaling Policies with CloudWatch Metric Alarms"])
      }
    ]
  },
  {
    id: "pro-gcp-cloud-architect",
    title: "Google Cloud Platform (GCP) Cloud Architect Mastery",
    subject: "Cloud Computing",
    tone: "blue",
    level: "Advanced",
    iconSymbol: "GCP",
    instructor: "Google Cloud Certified Fellows",
    tier: "Professional",
    gradeOrYear: "Professional Track",
    rating: 4.8,
    description: "Google Kubernetes Engine (GKE), BigQuery, Cloud Spanner, Cloud Run, Pub/Sub, and global VPC networking architectures.",
    learningPath: ["Google Cloud Identity & Global VPC", "Container Compute: Cloud Run & GKE", "Enterprise Data: BigQuery & Cloud Spanner", "Reliability, IAM & Cost Governance"],
    notes: ["Google Cloud VPCs are global resources spanning all regions simultaneously.", "BigQuery uses columnar storage and Dremel execution for petabyte-scale queries."],
    syllabus: ["Google Cloud Resource Hierarchy & IAM Roles", "Global VPC Networks, Shared VPC, Cloud Interconnect", "Compute Engine, Cloud Run Container Deployments", "Google Kubernetes Engine (GKE) Autopilot Clusters", "BigQuery Analytics & Partitioning/Clustering Strategies", "Cloud Spanner Global Relational Scale", "Pub/Sub Messaging & Dataflow ETL"],
    chapters: [
      {
        id: "pro-gcp-ch1",
        title: "Cloud Run, GKE & Global VPCs",
        lessonsCount: 4,
        lessons: makeLessons("pro-gcp-ch1", 4, ["Configuring Global VPC and Firewall Rules", "Deploying Microservices to Serverless Cloud Run", "GKE Autopilot Architecture and Node Pool Management", "IAM Service Accounts and Workload Identity"])
      }
    ]
  },

  // DevOps & SRE (subject: "DevOps")
  {
    id: "pro-devops-cloud",
    title: "Docker, Kubernetes & Cloud Native CI/CD (DevOps)",
    subject: "DevOps",
    tone: "blue",
    level: "Advanced",
    iconSymbol: "OPS",
    instructor: "Cloud Native Computing Foundation (CNCF)",
    tier: "Professional",
    gradeOrYear: "Professional Track",
    rating: 4.9,
    description: "Containerization, multi-stage Docker builds, Kubernetes pods, deployments, services, ingress, Helm charts, and Terraform IAC.",
    learningPath: ["Containerization with Docker", "Kubernetes Orchestration & Helm", "Infrastructure as Code with Terraform", "CI/CD Automation with GitHub Actions"],
    notes: ["Docker containers share the host kernel while namespaces provide isolation.", "Kubernetes Deployments manage ReplicaSets for declarative rolling updates."],
    syllabus: ["Linux Essentials: Processes, Permissions, systemd", "Docker: Images, Layers, Multi-Stage Builds, Compose", "Kubernetes Architecture: Control Plane & Worker Nodes", "K8s Resources: Pods, Deployments, Services, Ingress", "ConfigMaps, Secrets, Persistent Volumes (PV/PVC)", "Helm Package Manager for Cloud-Native Releases", "Terraform Infrastructure as Code (IaC) with AWS", "CI/CD Pipelines: GitHub Actions Automated Deployments", "Observability: Prometheus Metrics & Grafana Dashboards"],
    chapters: [
      {
        id: "pro-k8s-ch1",
        title: "Kubernetes Orchestration & Deployments",
        lessonsCount: 4,
        lessons: makeLessons("pro-k8s-ch1", 4, ["Pod Lifecycle, Probes, and Resource Limits", "Rolling Update vs Canary Deployment Strategies", "Service Discovery and ClusterIP vs NodePort vs LoadBalancer", "Horizontal Pod Autoscaler (HPA) Metrics Triggering"])
      }
    ]
  },

  // Cyber Security (subject: "Cyber Security")
  {
    id: "pro-cyber-security",
    title: "Cyber Security & Ethical Hacking: OWASP Top 10",
    subject: "Cyber Security",
    tone: "rose",
    level: "Advanced",
    iconSymbol: "SEC",
    instructor: "Offensive Security & OWASP Leaders",
    tier: "Professional",
    gradeOrYear: "Professional Track",
    rating: 4.9,
    description: "OWASP Top 10 web vulnerabilities, SQL injection, XSS, CSRF, JWT cracking, cryptography (RSA, AES), and network penetration testing.",
    learningPath: ["Network Reconnaissance & Port Scanning", "Web Application Penetration Testing (OWASP)", "Cryptography & PKI Foundations", "Securing Cloud Environments & Defenses"],
    notes: ["SQL injection occurs when untrusted input is concatenated into queries; use parameterized queries.", "Cross-Site Scripting (XSS) executes scripts in the victim browser context."],
    syllabus: ["CIA Triad, Threat Modeling & Defense in Depth", "Reconnaissance: Nmap, Wireshark Packet Analysis", "OWASP Top 10: SQLi, XSS, CSRF, SSRF, IDOR", "Authentication & JWT Token Vulnerabilities", "Applied Cryptography: AES, RSA, Diffie-Hellman, SHA-256", "Web Application Firewalls & Content Security Policy (CSP)", "SAST, DAST, and DevSecOps Automated Security Scanning"],
    chapters: [
      {
        id: "pro-sec-ch1",
        title: "OWASP Top 10 & Web Exploitation",
        lessonsCount: 4,
        lessons: makeLessons("pro-sec-ch1", 4, ["SQL Injection Prevention with Parameterized Queries", "Reflected and Stored XSS Mitigation with CSP", "JWT Signature Verification & Algorithm Confusion", "Broken Object Level Authorization (BOLA) Auditing"])
      }
    ]
  },

  // System Design (subject: "System Design")
  {
    id: "pro-system-design",
    title: "System Design: High-Level (HLD) & Low-Level (LLD)",
    subject: "System Design",
    tone: "rose",
    level: "Advanced",
    iconSymbol: "SYS",
    instructor: "FAANG Principal Architects",
    tier: "Professional",
    gradeOrYear: "Professional Track",
    rating: 4.9,
    description: "Design YouTube, Uber, WhatsApp, Twitter, Distributed Rate Limiters, Consistent Hashing, Message Queues (Kafka), and Caching (Redis).",
    learningPath: ["Scalability Fundamentals & Math (Back of the Envelope)", "Consistent Hashing, Load Balancing & CDN", "Kafka, RabbitMQ & Asynchronous Decoupling", "Real-World Architecture Blueprints"],
    notes: ["Consistent Hashing minimizes key remapping when nodes join or leave a cluster.", "Kafka achieves high throughput via sequential disk I/O and zero-copy page cache."],
    syllabus: ["System Design Interview Framework & Clarifications", "Back-of-the-Envelope Capacity Estimations (RPS, Storage, RAM)", "Load Balancing: L4 vs L7, Health Checks", "Caching Strategies: Cache-Aside, Write-Through, Write-Back, Eviction", "Consistent Hashing with Virtual Nodes", "SQL Sharding, Replication, Read Replicas", "Message Brokers: Apache Kafka vs RabbitMQ", "Designing a Distributed Rate Limiter (Token Bucket)", "Designing a URL Shortener (TinyURL)", "Designing a Video Streaming Platform (YouTube)", "Designing a Ride-Hailing Service (Uber Quadtrees)", "Designing Real-Time Chat (WhatsApp WebSockets)"],
    chapters: [
      {
        id: "pro-sys-ch1",
        title: "Distributed Rate Limiter & Caching",
        lessonsCount: 4,
        lessons: makeLessons("pro-sys-ch1", 4, ["Token Bucket, Leaky Bucket, and Sliding Window Counter", "Distributed Rate Limiter with Redis and Lua Scripts", "Redis Cache Invalidation & Stampede Thundering Herd Prevention", "Consistent Hashing Implementation with Virtual Nodes"])
      },
      {
        id: "pro-sys-ch2",
        title: "Real-Time Chat & Geolocation Systems",
        lessonsCount: 4,
        lessons: makeLessons("pro-sys-ch2", 4, ["WebSocket Connection Pooling and Epoll Multiplexing", "Message Ordering and Deduplication across Distributed Nodes", "Geohash vs Google S2 vs Quadtree for Location-Based Queries", "End-to-End Encryption Key Exchange Protocol (Signal Protocol)"])
      }
    ]
  }
];

const formattedProfessionalCourses = professionalCourses.map((c) => ({
  ...c,
  progress: Math.floor(Math.random() * 40) + 30,
  lessons: `${c.chapters.reduce((sum, ch) => sum + ch.lessonsCount, 0) * 3} lessons`,
  time: `${Math.floor(Math.random() * 10) + 14}h ${Math.floor(Math.random() * 50)}m`,
  practiceQuestionsCount: Math.floor(Math.random() * 150) + 100,
  mockTestsCount: Math.floor(Math.random() * 5) + 4
}));

// ─────────────────────────────────────────────────────────────────────────────
// COMBINE ALL COURSES
// ─────────────────────────────────────────────────────────────────────────────
const allCourses = [
  ...schoolCourses,
  ...formattedUgCourses,
  ...formattedPgCourses,
  ...formattedCompetitiveExams,
  ...formattedProfessionalCourses
];

console.log(`\n======================================================`);
console.log(`TOTAL PRODUCTION COURSES GENERATED: ${allCourses.length}`);
console.log(`======================================================`);

const curriculumCatalog = {
  version: "2.0.0",
  updatedAt: new Date().toISOString(),
  totalCourses: allCourses.length,
  levels: [
    { id: "school", name: "School Education", description: "Classes 5 to 12 across CBSE, ICSE, and State Boards" },
    { id: "undergraduate", name: "Undergraduate", description: "B.Tech, BCA, B.Sc, B.Com, BA, BBA, LLB, MBBS" },
    { id: "postgraduate", name: "Postgraduate", description: "M.Tech, MCA, MBA, M.Sc, M.Com, MA" },
    { id: "competitive_exams", name: "Competitive Exams", description: "JEE, NEET, UPSC, GATE, CAT, SSC, GRE, IELTS" },
    { id: "professional", name: "Professional Skills", description: "Programming, AI, Cloud, DevOps, System Design, Security" }
  ],
  programs: [
    { id: "prog-school", levelId: "school", name: "School Education (K-12)" },
    { id: "prog-btech", levelId: "undergraduate", name: "Bachelor of Technology (B.Tech)" },
    { id: "prog-bca", levelId: "undergraduate", name: "Bachelor of Computer Applications (BCA)" },
    { id: "prog-bsc", levelId: "undergraduate", name: "Bachelor of Science (B.Sc)" },
    { id: "prog-bcom", levelId: "undergraduate", name: "Bachelor of Commerce (B.Com)" },
    { id: "prog-ba", levelId: "undergraduate", name: "Bachelor of Arts (BA)" },
    { id: "prog-bba", levelId: "undergraduate", name: "Bachelor of Business Administration (BBA)" },
    { id: "prog-mtech", levelId: "postgraduate", name: "Master of Technology (M.Tech)" },
    { id: "prog-mca", levelId: "postgraduate", name: "Master of Computer Applications (MCA)" },
    { id: "prog-mba", levelId: "postgraduate", name: "Master of Business Administration (MBA)" },
    { id: "prog-msc", levelId: "postgraduate", name: "Master of Science (M.Sc)" },
    { id: "prog-exams", levelId: "competitive_exams", name: "National & International Competitive Exams" },
    { id: "prog-pro-skills", levelId: "professional", name: "Software Engineering & Tech Specializations" }
  ],
  competitiveExams: competitiveExamData,
  courses: allCourses
};

// Write output JSON files
const backendDataDir = path.join(rootDir, 'backend', 'data');
if (!fs.existsSync(backendDataDir)) {
  fs.mkdirSync(backendDataDir, { recursive: true });
}

const backendCatalogPath = path.join(backendDataDir, 'curriculum_catalog.json');
fs.writeFileSync(backendCatalogPath, JSON.stringify(curriculumCatalog, null, 2), 'utf-8');
console.log(`Saved backend catalog to: ${backendCatalogPath}`);

const srcDataDir = path.join(rootDir, 'src', 'data');
const frontendCatalogPath = path.join(srcDataDir, 'generatedCurriculumCatalog.json');
fs.writeFileSync(frontendCatalogPath, JSON.stringify(curriculumCatalog, null, 2), 'utf-8');
console.log(`Saved frontend catalog to: ${frontendCatalogPath}`);
