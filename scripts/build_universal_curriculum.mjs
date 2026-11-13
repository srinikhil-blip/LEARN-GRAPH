// scripts/build_universal_curriculum.mjs
// LearnGraph Universal Curriculum Generator
// Generates complete database-driven curricula spanning School (KG to 12th, CBSE/ICSE/IB),
// Undergraduate (All Engineering, Science, Commerce, Arts, Medicine, Law),
// Postgraduate (M.Tech, MCA, MBA, M.Sc), Professional Certifications,
// Comprehensive Programming Paths, and National/International Competitive Exams.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log("Generating Universal Production Curriculum Catalog...");

function makeLessons(prefix, count, titles, durations = ["25m", "35m", "30m", "40m", "20m", "45m"]) {
  const types = ["video", "reading", "practice", "reading", "quiz", "quiz"];
  return titles.map((title, idx) => ({
    id: `${prefix}-l${idx + 1}`,
    title: `${idx + 1}. ${title}`,
    duration: durations[idx % durations.length],
    type: types[idx % types.length],
    completed: idx === 0
  }));
}

function createCourse({
  id,
  title,
  subject,
  tier,
  gradeOrYear,
  level = "Intermediate",
  tone = "indigo",
  iconSymbol,
  board = "CBSE",
  university = "AICTE / UGC Accredited",
  degree,
  semester,
  curriculumVersion = "2026.1",
  instructor = "LearnGraph Academic Directorate",
  description,
  learningPath,
  syllabus,
  notes,
  chapterTitles
}) {
  const effectiveChapters = (chapterTitles && chapterTitles.length > 0)
    ? chapterTitles
    : (syllabus && syllabus.length > 0)
      ? syllabus
      : (learningPath && learningPath.length > 0)
        ? learningPath
        : [`${title}: Foundational Principles`, `${title}: Applied Analysis & Problem Solving`];

  const unitsCount = Math.max(1, Math.ceil(effectiveChapters.length / 3));
  const units = [];
  for (let u = 0; u < unitsCount; u++) {
    const unitChapters = effectiveChapters.slice(u * 3, (u + 1) * 3);
    units.push({
      id: `${id}-unit-${u + 1}`,
      unitNumber: u + 1,
      title: `Unit ${u + 1}: ${unitChapters[0]} & Connected Frameworks`,
      description: `Comprehensive mastery of core and auxiliary concepts across ${unitChapters.join(', ')}.`,
      chaptersCount: unitChapters.length,
      chapterNames: unitChapters
    });
  }

  const chapters = effectiveChapters.map((chTitle, chIdx) => {
    const chId = `${id}-ch${chIdx + 1}`;
    const lessonTitles = [
      `Conceptual Foundations & First Principles of ${chTitle}`,
      `Theoretical Formulations, Mathematical Derivations & Axioms`,
      `Worked Exemplar Case Problems & Step-by-Step Solutions`,
      `Applied Systems, Real-World Implementations & Practice`,
      `Common Misconceptions, Pitfalls & Invariant Proofs`,
      `Mastery Diagnostic Checkpoint & Competitive Exam Practice`
    ];

    return {
      id: chId,
      unitId: `${id}-unit-${Math.floor(chIdx / 3) + 1}`,
      title: chTitle,
      description: `Rigorous academic walkthrough of ${chTitle}, structured for deep pedagogical understanding, practical mastery, and exam readiness.`,
      lessonsCount: lessonTitles.length,
      lessons: makeLessons(chId, lessonTitles.length, lessonTitles)
    };
  });

  const totalLessons = chapters.reduce((sum, ch) => sum + ch.lessonsCount, 0);

  return {
    id,
    title,
    subject,
    instructor,
    board,
    university,
    degree: degree || tier,
    semester: semester || gradeOrYear || "Annual",
    curriculumVersion,
    progress: Math.floor(Math.random() * 40) + 20,
    lessons: `${totalLessons} lessons`,
    time: `${Math.floor(Math.random() * 10) + 12}h ${Math.floor(Math.random() * 50)}m`,
    tone,
    level,
    iconSymbol: iconSymbol || (id.slice(0, 4).toUpperCase()),
    tier,
    gradeOrYear,
    rating: Number((4.7 + Math.random() * 0.28).toFixed(1)),
    description: description || `Complete academic mastery curriculum covering foundational and advanced concepts in ${title}.`,
    learningPath: learningPath || effectiveChapters.slice(0, 4),
    practiceQuestionsCount: Math.floor(Math.random() * 120) + 90,
    mockTestsCount: Math.floor(Math.random() * 4) + 4,
    notes: notes || [
      "Master the fundamental axioms, governing laws, and invariant definitions first.",
      "Solve step-by-step worked exemplars before attempting timed diagnostic assessments.",
      "Review edge-case traps and misconceptions using the interactive AI Tutor."
    ],
    syllabus: effectiveChapters,
    units,
    chapters
  };
}

// ── Read and keep existing authentic courses ────────────────────────────────
const existingCatalogPath = path.join(rootDir, 'src', 'data', 'generatedCurriculumCatalog.json');
let existingCatalog = { courses: [] };
if (fs.existsSync(existingCatalogPath)) {
  try {
    existingCatalog = JSON.parse(fs.readFileSync(existingCatalogPath, 'utf-8'));
  } catch (err) {
    console.warn("Could not read existing catalog, starting fresh.");
  }
}

const allCourses = [...(existingCatalog.courses || [])];
const existingIds = new Set(allCourses.map(c => c.id));

function addUniqueCourse(courseDef) {
  if (!existingIds.has(courseDef.id)) {
    allCourses.push(createCourse(courseDef));
    existingIds.add(courseDef.id);
  }
}

// =============================================================================
// 1. KINDERGARTEN & EARLY PRIMARY (CLASSES 1 TO 4)
// =============================================================================
const earlySchoolCourses = [
  {
    id: "kg-phonics",
    title: "Kindergarten Early Literacy: Phonics & Letter Recognition",
    subject: "English",
    tier: "School",
    gradeOrYear: "Kindergarten",
    level: "Beginner",
    tone: "rose",
    board: "CBSE / Early Years",
    syllabus: ["Letter Sounds & Phonemic Awareness", "Vowel Sounds & CVC Blending", "Sight Words & Early Storybooks", "Rhymes, Songs & Vocabulary Building"]
  },
  {
    id: "kg-math",
    title: "Kindergarten Early Numeracy: Numbers 1-20, Shapes & Counting",
    subject: "Mathematics",
    tier: "School",
    gradeOrYear: "Kindergarten",
    level: "Beginner",
    tone: "amber",
    board: "CBSE / Early Years",
    syllabus: ["Counting & Number Recognition 1 to 20", "2D Shapes & Spatial Awareness", "Comparing Sizes & Quantities", "Patterns, Sorting & Simple Addition"]
  },
  {
    id: "c1-math",
    title: "Class 1 Mathematics: Number Sense, Shapes & Time",
    subject: "Mathematics",
    tier: "School",
    gradeOrYear: "Class 1",
    level: "Beginner",
    tone: "violet",
    board: "CBSE",
    syllabus: ["Numbers 1 to 99 & Place Value", "Single-Digit Addition & Subtraction", "Shapes and Space", "Measurement, Time & Money Basics"]
  },
  {
    id: "c1-english",
    title: "Class 1 English: Reading, Phonics & Story Narration (Mridang)",
    subject: "English",
    tier: "School",
    gradeOrYear: "Class 1",
    level: "Beginner",
    tone: "blue",
    board: "CBSE",
    syllabus: ["Rhymes & Story Comprehension", "Naming Words (Nouns) & Pronouns", "Action Words (Verbs)", "Describing Words & Creative Writing"]
  },
  {
    id: "c2-math",
    title: "Class 2 Mathematics: 2-Digit Operations, Patterns & Measurements",
    subject: "Mathematics",
    tier: "School",
    gradeOrYear: "Class 2",
    level: "Beginner",
    tone: "violet",
    board: "CBSE",
    syllabus: ["Counting in Groups up to 100", "2-Digit Addition & Subtraction with Regrouping", "Lines, Shadows & 3D Shapes", "Measurement of Length, Weight & Capacity"]
  },
  {
    id: "c3-math",
    title: "Class 3 Mathematics: 3-Digit Numbers, Multiplication & Division",
    subject: "Mathematics",
    tier: "School",
    gradeOrYear: "Class 3",
    level: "Beginner",
    tone: "violet",
    board: "CBSE",
    syllabus: ["Numbers up to 1000 & Place Value", "Multiplication Tables 2 to 10", "Introduction to Division & Grouping", "Fractions Intuition & Geometric Patterns"]
  },
  {
    id: "c4-math",
    title: "Class 4 Mathematics: Large Numbers, Factors, Time & Money",
    subject: "Mathematics",
    tier: "School",
    gradeOrYear: "Class 4",
    level: "Beginner",
    tone: "violet",
    board: "CBSE",
    syllabus: ["Numbers up to 10,000 & Roman Numerals", "Long Multiplication and Long Division", "Factors and Multiples Intuition", "Perimeter, Area & Metric Conversions"]
  },
  {
    id: "c4-science",
    title: "Class 4 General Science: Plants, Animals, Food & Matter",
    subject: "Science",
    tier: "School",
    gradeOrYear: "Class 4",
    level: "Beginner",
    tone: "emerald",
    board: "CBSE",
    syllabus: ["Plant Adaptations & Photosynthesis", "Animal Habitats & Life Cycles", "Food, Nutrients & Digestion", "Solids, Liquids, Gases & Weather Cycles"]
  }
];
earlySchoolCourses.forEach(addUniqueCourse);

// =============================================================================
// 2. UNDERGRADUATE EXPANDED (ENGINEERING, MEDICINE, COMMERCE, LAW, ARTS)
// =============================================================================
const expandedUGCourses = [
  // Additional Engineering
  {
    id: "ug-btech-chem",
    title: "Chemical Engineering: Thermodynamics & Transport Phenomena",
    subject: "Chemical Engineering",
    tier: "Undergraduate",
    gradeOrYear: "B.Tech Chem",
    discipline: "Engineering",
    syllabus: ["Chemical Engineering Thermodynamics", "Fluid Dynamics & Mass Transfer Operations", "Chemical Reaction Engineering (Kinetics)", "Heat Transfer & Heat Exchanger Design", "Process Dynamics and Control"]
  },
  {
    id: "ug-btech-aero",
    title: "Aerospace Engineering: Aerodynamics & Propulsion Systems",
    subject: "Aerospace Engineering",
    tier: "Undergraduate",
    gradeOrYear: "B.Tech Aero",
    discipline: "Engineering",
    syllabus: ["Incompressible & Compressible Aerodynamics", "Aircraft Structures and Materials", "Jet Propulsion & Rocket Engines", "Flight Mechanics and Orbital Trajectories", "Avionics and Navigation Systems"]
  },
  {
    id: "ug-btech-biotech",
    title: "Biotechnology & Genetic Engineering",
    subject: "Biotechnology",
    tier: "Undergraduate",
    gradeOrYear: "B.Tech Biotech",
    discipline: "Engineering",
    syllabus: ["Recombinant DNA Technology & CRISPR", "Bioprocess Engineering & Bioreactor Design", "Molecular Biology & Genomics", "Immunology & Medical Biotechnology", "Bioinformatics & Sequence Analysis"]
  },
  {
    id: "ug-btech-robotics",
    title: "Robotics & Automation: Kinematics, Control & Computer Vision",
    subject: "Robotics Engineering",
    tier: "Undergraduate",
    gradeOrYear: "B.Tech Robotics",
    discipline: "Engineering",
    syllabus: ["Robot Kinematics and Dynamics (DH Parameters)", "Sensors, Actuators and Motor Controllers", "Feedback Control Systems & PID Tuning", "Computer Vision and SLAM Algorithms", "ROS 2 (Robot Operating System) Middleware"]
  },
  {
    id: "ug-btech-auto",
    title: "Automobile Engineering: Powertrain, Chassis & EV Architecture",
    subject: "Automobile Engineering",
    tier: "Undergraduate",
    gradeOrYear: "B.Tech Auto",
    discipline: "Engineering",
    syllabus: ["Internal Combustion Engine Thermodynamics", "Electric Vehicle Powertrain & Battery Management Systems (BMS)", "Automotive Transmission, Suspension & Steering", "Vehicle Aerodynamics and Crashworthiness", "Autonomous Driving Sensors & ADAS"]
  },

  // Sciences
  {
    id: "ug-bsc-stats",
    title: "Mathematical Statistics & Probability Theory",
    subject: "Statistics",
    tier: "Undergraduate",
    gradeOrYear: "B.Sc Statistics",
    discipline: "Science",
    syllabus: ["Probability Axioms & Random Variables", "Discrete and Continuous Distributions", "Sampling Distributions & Central Limit Theorem", "Hypothesis Testing (t-test, ANOVA, Chi-Square)", "Linear Regression & Time Series Forecasting"]
  },
  {
    id: "ug-bsc-env",
    title: "Environmental Science: Ecology, Climate & Policy",
    subject: "Environmental Science",
    tier: "Undergraduate",
    gradeOrYear: "B.Sc Environment",
    discipline: "Science",
    syllabus: ["Ecosystem Energetics & Biogeochemical Cycles", "Air, Water & Soil Pollution Control Technologies", "Climate Change Science & Carbon Accounting", "Environmental Impact Assessment (EIA)", "Environmental Law and Sustainable Development"]
  },

  // Commerce & Finance
  {
    id: "ug-bcom-accounting",
    title: "Financial Accounting & Corporate Reporting (IFRS / Ind AS)",
    subject: "Accounting",
    tier: "Undergraduate",
    gradeOrYear: "B.Com / BBA",
    discipline: "Commerce",
    syllabus: ["Accounting Principles & Double Entry System", "Preparation of Financial Statements (P&L, Balance Sheet)", "Cash Flow Statements & Ratio Analysis", "Corporate Accounting: Shares, Debentures & Mergers", "IFRS & Indian Accounting Standards (Ind AS)"]
  },
  {
    id: "ug-bcom-finance",
    title: "Corporate Finance, Investment Banking & Capital Markets",
    subject: "Finance",
    tier: "Undergraduate",
    gradeOrYear: "B.Com / BBA",
    discipline: "Commerce",
    syllabus: ["Time Value of Money & Capital Budgeting (NPV, IRR)", "Cost of Capital (WACC) & Capital Structure Theory", "Working Capital Management", "Equity Valuation & Discounted Cash Flow (DCF)", "Derivatives: Futures, Options & Risk Hedging"]
  },
  {
    id: "ug-bcom-tax",
    title: "Direct Taxation & GST (Goods and Services Tax)",
    subject: "Taxation",
    tier: "Undergraduate",
    gradeOrYear: "B.Com / Law",
    discipline: "Commerce",
    syllabus: ["Income Tax Law: Heads of Income & Deductions", "Corporate Tax Planning & Minimum Alternate Tax (MAT)", "GST Framework: CGST, SGST, IGST and Input Tax Credit", "GST Invoicing, E-Way Bills & Annual Returns", "International Taxation & Transfer Pricing"]
  },
  {
    id: "ug-bcom-banking",
    title: "Banking Operations, Financial Institutions & Central Banking",
    subject: "Banking",
    tier: "Undergraduate",
    gradeOrYear: "B.Com / Economics",
    discipline: "Commerce",
    syllabus: ["Principles of Banking & Basel III Capital Norms", "Monetary Policy & Central Bank (RBI/Federal Reserve) Mechanics", "Credit Appraisal, Lending & NPA Management", "Fintech Innovations: UPI, Blockchain & Neobanks", "Forex Markets & International Trade Financing"]
  },

  // Arts & Humanities
  {
    id: "ug-ba-sociology",
    title: "Sociology: Classical Social Thinkers & Modern Institutions",
    subject: "Sociology",
    tier: "Undergraduate",
    gradeOrYear: "BA Sociology",
    discipline: "Arts & Humanities",
    syllabus: ["Classical Sociological Theories (Marx, Weber, Durkheim)", "Social Stratification: Caste, Class & Gender", "Family, Kinship, Religion and Marriage", "Social Movements, Urbanization & Modernization", "Qualitative and Quantitative Research Methodologies"]
  },
  {
    id: "ug-ba-psychology",
    title: "Psychology: Cognitive Processes, Neurobiology & Abnormal Psychology",
    subject: "Psychology",
    tier: "Undergraduate",
    gradeOrYear: "BA / B.Sc Psychology",
    discipline: "Arts & Humanities",
    syllabus: ["Biological Bases of Behavior & Brain Architecture", "Sensation, Perception, Learning & Memory", "Theories of Personality & Human Motivation", "DSM-5 Psychopathology & Psychological Disorders", "Clinical Psychotherapy & Counseling Approaches"]
  },
  {
    id: "ug-ba-philosophy",
    title: "Philosophy: Epistemology, Logic & Ethics",
    subject: "Philosophy",
    tier: "Undergraduate",
    gradeOrYear: "BA Philosophy",
    discipline: "Arts & Humanities",
    syllabus: ["Epistemology: Theories of Truth, Perception & Knowledge", "Western Classical Philosophy (Plato, Aristotle, Descartes, Kant)", "Indian Philosophical Schools (Nyaya, Vedanta, Buddhism)", "Normative & Applied Ethics (Utilitarianism, Deontology)", "Formal Propositional and Predicate Logic"]
  },
  {
    id: "ug-ba-geography",
    title: "Geography: Geomorphology, Climatology & GIS Cartography",
    subject: "Geography",
    tier: "Undergraduate",
    gradeOrYear: "BA / B.Sc Geography",
    discipline: "Arts & Humanities",
    syllabus: ["Plate Tectonics, Earthquakes & Landform Evolution", "Atmospheric Circulation, Monsoon Dynamics & Climatology", "Oceanography: Currents, Salinity & Coral Reefs", "Human Geography: Population, Migration & Settlement", "GIS (Geographic Information Systems) & Remote Sensing"]
  },

  // Medicine & Healthcare
  {
    id: "ug-mbbs-anat",
    title: "Human Anatomy: Gross Anatomy, Embryology & Neuroanatomy",
    subject: "Medicine (MBBS)",
    tier: "Undergraduate",
    gradeOrYear: "MBBS Year 1",
    discipline: "Medicine",
    syllabus: ["Upper & Lower Limb Osteology and Myology", "Thorax: Heart, Lungs, Mediastinum & Coronary Circulation", "Abdomen & Pelvis: Viscera, Peritoneum & Urogenital System", "Head, Neck and Cranial Nerves", "Central Nervous System: Brainstem, Cerebellum & Cerebral Cortex"]
  },
  {
    id: "ug-mbbs-physio",
    title: "Human Physiology: Cardiovascular, Renal & Neurophysiology",
    subject: "Medicine (MBBS)",
    tier: "Undergraduate",
    gradeOrYear: "MBBS Year 1",
    discipline: "Medicine",
    syllabus: ["Cellular Physiology & Membrane Transport Potentials", "Cardiovascular System: Cardiac Cycle, ECG & Hemodynamics", "Respiratory Physiology: Gas Exchange & Lung Mechanics", "Renal System: Glomerular Filtration & Acid-Base Balance", "Endocrine and Reproductive Hormone Feedback Loops"]
  },
  {
    id: "ug-bds-dental",
    title: "Dental Surgery, Conservative Dentistry & Oral Pathology",
    subject: "Dentistry (BDS)",
    tier: "Undergraduate",
    gradeOrYear: "BDS",
    discipline: "Medicine",
    syllabus: ["Dental Anatomy, Histology and Embryology", "Oral Pathology & Maxillofacial Diagnostics", "Conservative Dentistry and Endodontics", "Prosthodontics, Crown & Bridge Prostheses", "Oral and Maxillofacial Surgery Techniques"]
  },
  {
    id: "ug-pharm-pharm",
    title: "Pharmacology, Pharmacokinetics & Medicinal Chemistry",
    subject: "Pharmacy (B.Pharm)",
    tier: "Undergraduate",
    gradeOrYear: "B.Pharm",
    discipline: "Medicine",
    syllabus: ["General Principles of Pharmacodynamics and Pharmacokinetics (ADME)", "Autonomic & Central Nervous System Pharmacology", "Cardiovascular & Renal Drugs", "Chemotherapy of Infectious Diseases & Cancer", "Medicinal Chemistry: Drug Design and SAR Analysis"]
  },
  {
    id: "ug-nursing-care",
    title: "Nursing Care, Medical-Surgical Nursing & Community Health",
    subject: "Nursing (B.Sc Nursing)",
    tier: "Undergraduate",
    gradeOrYear: "B.Sc Nursing",
    discipline: "Medicine",
    syllabus: ["Fundamentals of Nursing & Patient Care Ethics", "Medical-Surgical Nursing: Critical Care & Post-Op Recovery", "Maternal and Child Health Nursing", "Community Health Nursing and Epidemiology", "Pharmacology and Dosage Calculations for Nurses"]
  },
  {
    id: "ug-physio-rehab",
    title: "Physiotherapy & Musculoskeletal Rehabilitation",
    subject: "Physiotherapy (BPT)",
    tier: "Undergraduate",
    gradeOrYear: "BPT",
    discipline: "Medicine",
    syllabus: ["Biomechanics and Kinesiology of Human Movement", "Musculoskeletal Physical Assessment and Orthopedic Rehab", "Neurological Physiotherapy (Stroke, Spinal Injury)", "Cardiopulmonary Rehabilitation and Chest Physiotherapy", "Sports Injury Prevention, Taping and Electrotherapy"]
  },

  // Law, Architecture, Management, Agriculture
  {
    id: "ug-llb-const",
    title: "Constitutional Law & Jurisprudence (LLB)",
    subject: "Law",
    tier: "Undergraduate",
    gradeOrYear: "LLB / BA LLB",
    discipline: "Law",
    syllabus: ["Preamble, Fundamental Rights and Directive Principles", "Federal Structure, Union-State Legislative Relations", "Judiciary: Supreme Court, High Courts & Judicial Review", "Emergency Provisions and Constitutional Amendments", "Jurisprudence: Natural Law, Positivism and Legal Realism"]
  },
  {
    id: "ug-arch-design",
    title: "Architectural Design, Structural Theory & Urban Planning",
    subject: "Architecture",
    tier: "Undergraduate",
    gradeOrYear: "B.Arch",
    discipline: "Architecture",
    syllabus: ["Architectural Design Principles and Spatial Composition", "Building Materials and Construction Technology", "Structural Systems: Reinforced Concrete and Steel Frames", "Climate-Responsive Architecture and Passive Solar Design", "Urban Planning, Zoning Laws and Sustainable Cities"]
  },
  {
    id: "ug-bba-mgmt",
    title: "Strategic Management, Organizational Behavior & Marketing",
    subject: "Management",
    tier: "Undergraduate",
    gradeOrYear: "BBA / BMS",
    discipline: "Management",
    syllabus: ["Strategic Management & Porter's Five Forces Analysis", "Organizational Behavior, Leadership and Team Dynamics", "Marketing Management: Segmentation, Targeting & Positioning (STP)", "Operations Management and Supply Chain Optimization", "Business Analytics, KPIs and Financial Decision Making"]
  },
  {
    id: "ug-agri-crop",
    title: "Agricultural Science: Agronomy, Crop Physiology & Soil Science",
    subject: "Agriculture",
    tier: "Undergraduate",
    gradeOrYear: "B.Sc Agriculture",
    discipline: "Agriculture",
    syllabus: ["Agronomy Principles and Crop Production Systems", "Soil Chemistry, Fertility and Nutrient Management", "Plant Pathology, Entomology and Integrated Pest Management (IPM)", "Agricultural Meteorology, Irrigation and Water Management", "Genetics, Plant Breeding and Seed Technology"]
  }
];
expandedUGCourses.forEach(addUniqueCourse);

// =============================================================================
// 3. PROFESSIONAL CLOUD & DEVOPS CERTIFICATIONS
// =============================================================================
const certificationCourses = [
  {
    id: "cert-aws-csa",
    title: "AWS Certified Solutions Architect (Associate SAA-C03)",
    subject: "Cloud Computing",
    tier: "Professional",
    gradeOrYear: "AWS Certification",
    level: "Advanced",
    tone: "amber",
    syllabus: ["Resilient Multi-AZ Compute Architecture (EC2, ECS, Lambda)", "High-Performing Storage & Databases (S3, EBS, EFS, RDS, DynamoDB)", "VPC Networking, Route 53, Direct Connect & CloudFront", "Identity & Access Management (IAM), KMS Encryption & Security", "Cost-Optimized & Fault-Tolerant System Architecture"]
  },
  {
    id: "cert-azure-az900",
    title: "Microsoft Azure Fundamentals (AZ-900) & Architecture",
    subject: "Cloud Computing",
    tier: "Professional",
    gradeOrYear: "Azure Certification",
    level: "Intermediate",
    tone: "blue",
    syllabus: ["Cloud Concepts: IaaS, PaaS, SaaS and Hybrid Cloud", "Azure Architectural Components: Regions, Availability Zones & Resource Groups", "Azure Compute, Networking and Storage Services", "Azure Identity, Entra ID (Azure AD), Governance and Security", "Azure Cost Management, SLAs and Lifecycle Tools"]
  },
  {
    id: "cert-gcp-ace",
    title: "Google Cloud Certified Associate Cloud Engineer (ACE)",
    subject: "Cloud Computing",
    tier: "Professional",
    gradeOrYear: "GCP Certification",
    level: "Intermediate",
    tone: "rose",
    syllabus: ["Setting Up a Cloud Solution Environment & Projects", "Planning and Configuring Compute Engine, GKE and Cloud Run", "Deploying and Managing Cloud Storage, Cloud SQL and Spanner", "Configuring VPC Networks, Cloud DNS and Load Balancing", "Operations Suite (Cloud Monitoring, Logging) & IAM Security"]
  },
  {
    id: "cert-cisco-ccna",
    title: "Cisco Certified Network Associate (CCNA 200-301)",
    subject: "Networking",
    tier: "Professional",
    gradeOrYear: "Cisco Certification",
    level: "Intermediate",
    tone: "cyan",
    syllabus: ["Network Fundamentals: IPv4/IPv6 Subnetting & Topology", "Network Access: VLANs, Trunking, STP and EtherChannel", "IP Connectivity: OSPFv2 Routing & Static Routes", "IP Services: DHCP, DNS, NAT, SNMP and NTP", "Security Fundamentals: ACLs, Port Security, VPNs and Wireless"]
  },
  {
    id: "cert-k8s-cka",
    title: "Certified Kubernetes Administrator (CKA - CNCF)",
    subject: "DevOps & Containers",
    tier: "Professional",
    gradeOrYear: "Linux Foundation / CNCF",
    level: "Advanced",
    tone: "blue",
    syllabus: ["Cluster Architecture, Installation and ETCD Backup/Restore", "Workloads & Scheduling: Deployments, DaemonSets and Affinity", "Services & Networking: Ingress, NetworkPolicies and CoreDNS", "Storage: StorageClasses, PVs, PVCs and CSI Drivers", "Troubleshooting: Node Failures, Pod Crashes and Control Plane Logs"]
  },
  {
    id: "cert-docker-dca",
    title: "Docker Certified Associate & Container Architecture",
    subject: "DevOps & Containers",
    tier: "Professional",
    gradeOrYear: "Docker Certification",
    level: "Intermediate",
    tone: "blue",
    syllabus: ["Dockerfile Best Practices, Multi-Stage Builds & Layers", "Container Networking, Bridge, Host and Overlay Networks", "Docker Volumes, Bind Mounts and Storage Drivers", "Docker Compose Multi-Container Orchestration", "Security, Image Scanning and Secret Management"]
  },
  {
    id: "cert-redhat-rhcsa",
    title: "Red Hat Certified System Administrator (RHCSA EX200)",
    subject: "Operating Systems",
    tier: "Professional",
    gradeOrYear: "Red Hat Enterprise Linux",
    level: "Intermediate",
    tone: "rose",
    syllabus: ["Linux File Management, Bash Shell Scripting & Grep/Sed", "Systemd Services, Boot Targets and Process Management", "LVM (Logical Volume Management), File Systems & Swap Space", "SELinux Security Contexts, Booleans and Firewalld Rules", "User and Group Administration with Sudo Privileges"]
  },
  {
    id: "cert-salesforce-admin",
    title: "Salesforce Certified Administrator (ADM-201)",
    subject: "Enterprise Cloud",
    tier: "Professional",
    gradeOrYear: "Salesforce Certification",
    level: "Intermediate",
    tone: "sky",
    syllabus: ["Organizational Setup, Security and User Access Architecture", "Standard and Custom Objects, Fields and Relationship Models", "Sales and Service Cloud Business Automation Applications", "Flow Builder Automation, Process Automation & Validation Rules", "Reports, Dashboards, Data Import Wizard and Data Loader"]
  }
];
certificationCourses.forEach(addUniqueCourse);

// =============================================================================
// 4. PROGRAMMING LANGUAGES, FRAMEWORKS & SYSTEM DESIGN
// =============================================================================
const programmingCourses = [
  {
    id: "prog-lang-c",
    title: "The C Programming Language: Pointers, Memory & System Calls",
    subject: "Computer Science",
    tier: "Professional",
    gradeOrYear: "Systems Programming",
    level: "Intermediate",
    tone: "indigo",
    syllabus: ["Data Types, Operators and Control Structures in C", "Pointers, Pointer Arithmetic and Double Pointers", "Dynamic Memory Allocation (malloc, calloc, realloc, free)", "Structures, Unions, Bitfields and File I/O", "POSIX System Calls: fork, exec, pipe and signals"]
  },
  {
    id: "prog-lang-cpp",
    title: "Modern C++ (C++20): STL, Templates, Move Semantics & Concurrency",
    subject: "Computer Science",
    tier: "Professional",
    gradeOrYear: "Modern C++",
    level: "Advanced",
    tone: "blue",
    syllabus: ["Object-Oriented C++: RAII, Rule of 5 and Smart Pointers", "Standard Template Library (STL): Vectors, Maps, Algorithms", "Templates, Metaprogramming and C++20 Concepts", "Move Semantics, Rvalue References and Perfect Forwarding", "Multithreading, std::async, Mutexes and Atomic Operations"]
  },
  {
    id: "prog-lang-java",
    title: "Core & Enterprise Java: JVM Internals, Multithreading & Streams",
    subject: "Computer Science",
    tier: "Professional",
    gradeOrYear: "Enterprise Java",
    level: "Intermediate",
    tone: "amber",
    syllabus: ["OOP Principles in Java: Polymorphism, Interfaces, Abstract Classes", "Java Collections Framework: Lists, Sets, HashMaps and Iterators", "JVM Memory Model: Heap, Stack, Garbage Collection Tuning", "Java Concurrency: Threads, Executors, Locks and Synchronizers", "Java 8+ Features: Lambdas, Stream API and Optional"]
  },
  {
    id: "prog-lang-python",
    title: "Python for Engineers: AsyncIO, Metaprogramming & Scalable Architecture",
    subject: "Computer Science",
    tier: "Professional",
    gradeOrYear: "Modern Python",
    level: "Intermediate",
    tone: "emerald",
    syllabus: ["Python Core Data Structures, List/Dict Comprehensions & Generators", "Decorators, Context Managers and Metaclasses", "Asynchronous Programming with asyncio, async/await and Tasks", "Object-Oriented Design & Design Patterns in Python", "Packaging, Virtual Environments, Pytest and Type Hinting"]
  },
  {
    id: "prog-lang-js",
    title: "Advanced JavaScript: Event Loop, Closures, Prototypes & V8 Engine",
    subject: "Computer Science",
    tier: "Professional",
    gradeOrYear: "Web Engineering",
    level: "Advanced",
    tone: "amber",
    syllabus: ["JavaScript Runtime: V8 Engine, Call Stack, Microtask Queue & Event Loop", "Execution Context, Scope Chain and Closures in Depth", "Prototypal Inheritance, Object Methods and ES6 Classes", "Asynchronous JavaScript: Promises, Async/Await and AbortController", "Memory Leaks, Garbage Collection and Browser Performance Profiling"]
  },
  {
    id: "prog-lang-ts",
    title: "TypeScript Engineering: Advanced Generics, Types & Compiler Design",
    subject: "Computer Science",
    tier: "Professional",
    gradeOrYear: "Web Engineering",
    level: "Advanced",
    tone: "blue",
    syllabus: ["TypeScript Type System: Union, Intersection and Literal Types", "Generics, Type Constraints and Generic Utility Types", "Conditional Types, Infer Keyword and Template Literal Types", "Declaration Files (.d.ts), Ambient Namespaces and tsconfig Options", "Type-Driven Development and Architectural Design Patterns"]
  },
  {
    id: "prog-lang-go",
    title: "Go (Golang): Goroutines, Channels & Microservices Architecture",
    subject: "Computer Science",
    tier: "Professional",
    gradeOrYear: "Cloud Backend",
    level: "Intermediate",
    tone: "cyan",
    syllabus: ["Go Syntax, Structs, Pointers and Interface Polymorphism", "Goroutines, Channels and the CSP Concurrency Model", "Select Statements, Worker Pools and Context Package Cancellation", "Building High-Throughput REST & gRPC Services in Go", "Benchmarking, Memory Profiling and Race Condition Detection"]
  },
  {
    id: "prog-lang-rust",
    title: "Rust Systems Programming: Ownership, Lifetimes & Zero-Cost Abstractions",
    subject: "Computer Science",
    tier: "Professional",
    gradeOrYear: "Systems Programming",
    level: "Advanced",
    tone: "rose",
    syllabus: ["Ownership, Borrowing Rules and Memory Safety without GC", "Lifetimes, Lifetime Annotations and Struct Lifetimes", "Pattern Matching, Enums (Option, Result) and Error Handling", "Traits, Generic Programming and Trait Objects (dyn)", "Unsafe Rust, FFI (Foreign Function Interface) and Concurrency"]
  },
  {
    id: "prog-fw-react",
    title: "React 19 & Next.js: Server Components, State & Performance",
    subject: "Web Development",
    tier: "Professional",
    gradeOrYear: "Frontend Engineering",
    level: "Intermediate",
    tone: "sky",
    syllabus: ["React Reconciliation, Virtual DOM and Fiber Architecture", "Hooks in Depth: useState, useEffect, useMemo, useCallback, useRef", "Server Components (RSC) vs Client Components in Next.js", "State Management: Redux Toolkit, Zustand and TanStack Query", "Bundle Optimization, Code Splitting and Web Vitals"]
  },
  {
    id: "prog-fw-fastapi",
    title: "FastAPI & Asynchronous Python Web APIs: Pydantic & SQLAlchemy",
    subject: "Backend Development",
    tier: "Professional",
    gradeOrYear: "Backend Engineering",
    level: "Intermediate",
    tone: "teal",
    syllabus: ["FastAPI Routing, Request Lifecycle and Async Handlers", "Pydantic v2 Data Modeling, Validation and Serialization", "SQLAlchemy 2.0 Async ORM Integration and Migrations with Alembic", "JWT Authentication, OAuth2 Schemes and Role-Based Access Control", "Background Tasks, WebSockets and Celery Worker Queues"]
  },
  {
    id: "prog-fw-spring",
    title: "Spring Boot 3 & Enterprise Microservices: Cloud, Security & Kafka",
    subject: "Backend Development",
    tier: "Professional",
    gradeOrYear: "Enterprise Backend",
    level: "Advanced",
    tone: "emerald",
    syllabus: ["Spring Core: Inversion of Control (IoC) and Dependency Injection (DI)", "Spring Data JPA, Hibernate, Repositories and Transaction Management", "Spring Security 6: JWT, OAuth2 Resource Server and Filters", "Event-Driven Microservices with Apache Kafka", "Distributed Tracing with Micrometer, OpenTelemetry and Prometheus"]
  },
  {
    id: "prog-topic-system-design",
    title: "System Design Masterclass: High-Level & Low-Level Architecture (HLD & LLD)",
    subject: "Computer Science",
    tier: "Professional",
    gradeOrYear: "Tech Interviews",
    level: "Advanced",
    tone: "violet",
    syllabus: ["Scalability Fundamentals: Horizontal vs Vertical, CAP Theorem, ACID vs BASE", "Load Balancers, Reverse Proxies (Nginx, Envoy) and Rate Limiting", "Caching Strategies: Redis, Memcached, Cache-Aside and Write-Through", "Database Partitioning, Sharding, Replication and Consistent Hashing", "Message Queues, Event Sourcing, CQRS and Microservices Decomposition"]
  }
];
programmingCourses.forEach(addUniqueCourse);

// =============================================================================
// 5. EXPANDED COMPETITIVE EXAMINATIONS
// =============================================================================
const expandedExamCourses = [
  {
    id: "exam-gmat",
    title: "GMAT Focus Edition: Quantitative, Verbal & Data Insights",
    subject: "Management Entrance",
    tier: "Competitive Exams",
    gradeOrYear: "GMAT Exam",
    level: "Advanced",
    tone: "indigo",
    syllabus: ["Quantitative Reasoning: Algebra, Arithmetic and Word Problems", "Verbal Reasoning: Critical Reasoning and Reading Comprehension", "Data Insights: Data Sufficiency, Multi-Source & Graphical Analysis", "Time Management and Adaptive Computer Algorithm Strategy"]
  },
  {
    id: "exam-gre",
    title: "GRE General Test: Quantitative Reasoning & Analytical Writing",
    subject: "Graduate Entrance",
    tier: "Competitive Exams",
    gradeOrYear: "GRE Exam",
    level: "Advanced",
    tone: "purple",
    syllabus: ["Quantitative Comparison, Problem Solving & Data Interpretation", "Text Completion, Sentence Equivalence & Reading Comprehension", "Analytical Writing: Analyze an Issue Task & Essay Structure", "High-Frequency GRE Vocabulary and Elimination Tactics"]
  },
  {
    id: "exam-toefl",
    title: "TOEFL iBT: Complete Reading, Listening, Speaking & Writing Prep",
    subject: "Language Proficiency",
    tier: "Competitive Exams",
    gradeOrYear: "TOEFL Exam",
    level: "Intermediate",
    tone: "blue",
    syllabus: ["Reading Academic Passages & Answering Inference/Factual Questions", "Listening: Academic Lectures, Classroom Discussions & Note-Taking", "Speaking: Independent & Integrated Speaking Tasks", "Writing: Academic Discussion Task & Integrated Writing Task"]
  },
  {
    id: "exam-ielts",
    title: "IELTS Academic: Band 8+ Master Preparation",
    subject: "Language Proficiency",
    tier: "Competitive Exams",
    gradeOrYear: "IELTS Exam",
    level: "Intermediate",
    tone: "rose",
    syllabus: ["Listening: 4 Sections, Multiple Accents & Distractor Identification", "Academic Reading: Skimming, Scanning & True/False/Not Given Strategy", "Academic Writing: Task 1 (Charts/Processes) & Task 2 (Essays)", "Speaking: Parts 1, 2 and 3 Fluency, Coherence and Lexical Resource"]
  },
  {
    id: "exam-banking-po",
    title: "IBPS / SBI PO: Quantitative Aptitude, Reasoning & Banking Awareness",
    subject: "Banking Exams",
    tier: "Competitive Exams",
    gradeOrYear: "Banking PO",
    level: "Intermediate",
    tone: "emerald",
    syllabus: ["Quantitative Aptitude: Data Interpretation, Number Series & Arithmetic", "Reasoning Ability: Puzzles, Seating Arrangement & Syllogisms", "English Language: Error Spotting, Cloze Test & Para Jumbles", "General & Financial Awareness: Banking History, RBI Norms & Economy"]
  },
  {
    id: "exam-railway-rrb",
    title: "Railway RRB NTPC: General Science, Math & Reasoning",
    subject: "Railway Exams",
    tier: "Competitive Exams",
    gradeOrYear: "RRB NTPC",
    level: "Intermediate",
    tone: "amber",
    syllabus: ["Mathematics: Number System, HCF/LCM, Algebra, Geometry & Trigonometry", "General Intelligence and Reasoning: Analogies, Coding-Decoding & Venn Diagrams", "General Science: Physics, Chemistry and Life Sciences up to 10th Standard", "General Awareness: Indian History, Geography, Polity & Static GK"]
  },
  {
    id: "exam-ssc-cgl",
    title: "SSC CGL: Tier I & Tier II Quantitative Abilities & General Studies",
    subject: "Staff Selection Commission",
    tier: "Competitive Exams",
    gradeOrYear: "SSC CGL",
    level: "Intermediate",
    tone: "cyan",
    syllabus: ["Quantitative Abilities: Advanced Maths (Algebra, Geometry, Mensuration)", "General Studies: History, Geography, Indian Polity, Economy & Science", "English Comprehension & Grammar Rules", "Computer Knowledge Module & Data Entry Speed Practice"]
  },
  {
    id: "exam-defense-nda",
    title: "NDA & CDS Examination: Mathematics, English & General Ability",
    subject: "Defense Services",
    tier: "Competitive Exams",
    gradeOrYear: "NDA / CDS",
    level: "Intermediate",
    tone: "red",
    syllabus: ["NDA Mathematics: Algebra, Trigonometry, Matrices, Calculus & Vectors", "General Ability Test (GAT): English Vocabulary, Grammar & Comprehension", "General Knowledge: Physics, Chemistry, General Science & Current Events", "History, Freedom Movement & Geography of India", "SSB Interview Psychological Tests, GTO Tasks & Personal Interview"]
  },
  {
    id: "exam-state-psc",
    title: "State Public Service Commission (State PCS / Group 1)",
    subject: "Civil Services",
    tier: "Competitive Exams",
    gradeOrYear: "State PSC",
    level: "Advanced",
    tone: "teal",
    syllabus: ["State History, Culture, Heritage and Geography", "Indian Polity, Constitution & Governance Systems", "Economy of the State & National Economic Development", "General Science & Environment Technology", "Mains Analytical Essay & Administrative Case Studies"]
  }
];
expandedExamCourses.forEach(addUniqueCourse);

console.log(`\n======================================================`);
console.log(`TOTAL EXHAUSTIVE UNIVERSAL COURSES: ${allCourses.length}`);
console.log(`======================================================`);

const curriculumCatalog = {
  version: "3.0.0",
  updatedAt: new Date().toISOString(),
  totalCourses: allCourses.length,
  educationLevels: [
    { id: "kindergarten", name: "Kindergarten", description: "Early phonics, numeracy and foundational discovery" },
    { id: "primary", name: "Primary School (Class 1-5)", description: "Core arithmetic, reading, general science and environmental studies" },
    { id: "middle_school", name: "Middle School (Class 6-8)", description: "Mathematics, physics, chemistry, biology, history and civics" },
    { id: "secondary", name: "Secondary School (Class 9-10)", description: "Board exam preparation for CBSE, ICSE and State Boards" },
    { id: "higher_secondary", name: "Higher Secondary (Class 11-12)", description: "Specialized Science (PCM/PCB), Commerce and Arts streams" },
    { id: "undergraduate", name: "Undergraduate (UG)", description: "Engineering (14 Branches), Medicine, Science, Commerce, Law, Architecture" },
    { id: "postgraduate", name: "Postgraduate (PG)", description: "Master of Technology (M.Tech), MCA, MBA, M.Sc, M.Com, MA" },
    { id: "professional_cert", name: "Professional Certifications", description: "AWS, Azure, Google Cloud, Cisco, Kubernetes, Docker, Red Hat" },
    { id: "programming_paths", name: "Programming & Computer Science", description: "C, C++, Java, Python, Go, Rust, React, Node.js, FastAPI, Spring, System Design" },
    { id: "competitive_exams", name: "Competitive Examinations", description: "JEE, NEET, UPSC, GATE, CAT, GRE, GMAT, IELTS, TOEFL, SSC, Banking, Defense" }
  ],
  educationBoards: [
    { id: "cbse", name: "CBSE (Central Board of Secondary Education)", country: "India" },
    { id: "icse", name: "ICSE / ISC (Council for the Indian School Certificate Examinations)", country: "India" },
    { id: "state_boards", name: "State Education Boards (Maharashtra, AP, TN, UP, Karnataka)", country: "India" },
    { id: "ib", name: "IB (International Baccalaureate)", country: "International" },
    { id: "cambridge", name: "Cambridge International (IGCSE & A Levels)", country: "International" }
  ],
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
