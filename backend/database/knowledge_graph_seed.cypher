// ============================================================================
// LearnGraph — Neo4j Knowledge Graph Seed Dataset
// Multi-disciplinary curriculum covering Math, Computer Science, and Deep Learning
// ============================================================================

// ----------------------------------------------------------------------------
// 1. Core Users (Student and Teachers)
// ----------------------------------------------------------------------------
MERGE (s:Student {uuid: "s-alex-morgan-101"})
ON CREATE SET s.name = "Alex Morgan",
              s.email = "alex@university.edu",
              s.level = 18,
              s.xpPoints = 8450,
              s.masteryScore = 0.82,
              s.createdAt = datetime(),
              s.updatedAt = datetime(),
              s.status = "active",
              s.metadata = '{"university": "State University", "major": "Computer Science"}';

MERGE (t1:Teacher {uuid: "t-alan-turing-201"})
ON CREATE SET t1.name = "Prof. Alan Turing",
              t1.email = "alan.turing@university.edu",
              t1.department = "Computer Science",
              t1.rating = 4.95,
              t1.createdAt = datetime(),
              t1.updatedAt = datetime(),
              t1.status = "active";

MERGE (t2:Teacher {uuid: "t-ada-lovelace-202"})
ON CREATE SET t2.name = "Prof. Ada Lovelace",
              t2.email = "ada.lovelace@university.edu",
              t2.department = "Mathematics",
              t2.rating = 4.98,
              t2.createdAt = datetime(),
              t2.updatedAt = datetime(),
              t2.status = "active";

// ----------------------------------------------------------------------------
// 2. Courses
// ----------------------------------------------------------------------------
MERGE (c1:Course {uuid: "c-deep-learning-301"})
ON CREATE SET c1.name = "Foundations of Deep Learning",
              c1.slug = "foundations-of-deep-learning",
              c1.description = "From linear algebra and gradient descent to modern Transformer models.",
              c1.difficulty = "intermediate",
              c1.estimatedLearningTime = 2400, // 40 hours
              c1.status = "published",
              c1.createdAt = datetime(),
              c1.updatedAt = datetime();

MERGE (c2:Course {uuid: "c-graph-algorithms-302"})
ON CREATE SET c2.name = "Graph Theory & Network Algorithms",
              c2.slug = "graph-theory-network-algorithms",
              c2.description = "Master shortest paths, minimum spanning trees, and graph traversal.",
              c2.difficulty = "intermediate",
              c2.estimatedLearningTime = 1800, // 30 hours
              c2.status = "published",
              c2.createdAt = datetime(),
              c2.updatedAt = datetime();

MERGE (t1)-[:TEACHES {createdAt: datetime(), updatedAt: datetime()}]->(c1);
MERGE (t2)-[:TEACHES {createdAt: datetime(), updatedAt: datetime()}]->(c2);
MERGE (s)-[:STUDENT_ENROLLED_IN {enrolledAt: datetime(), completionPct: 65.0}]->(c1);
MERGE (s)-[:STUDENT_ENROLLED_IN {enrolledAt: datetime(), completionPct: 40.0}]->(c2);

// ----------------------------------------------------------------------------
// 3. Subjects & Topics
// ----------------------------------------------------------------------------
MERGE (sub1:Subject {uuid: "sub-optimization-401"})
ON CREATE SET sub1.name = "Calculus & Optimization",
              sub1.description = "Derivatives, gradients, and cost surfaces.",
              sub1.orderIndex = 0,
              sub1.estimatedLearningTime = 480;

MERGE (sub2:Subject {uuid: "sub-neural-nets-402"})
ON CREATE SET sub2.name = "Neural Architectures",
              sub2.description = "Feedforward networks, backpropagation, and loss functions.",
              sub2.orderIndex = 1,
              sub2.estimatedLearningTime = 600;

MERGE (c1)-[:HAS_SUBJECT]->(sub1);
MERGE (c1)-[:HAS_SUBJECT]->(sub2);

MERGE (top1:Topic {uuid: "top-gradients-501"})
ON CREATE SET top1.name = "Gradient Descent & Cost Optimization",
              top1.description = "Minimizing loss surfaces with stochastic gradient descent.",
              top1.difficulty = "intermediate",
              top1.estimatedLearningTime = 120,
              top1.orderIndex = 0;

MERGE (top2:Topic {uuid: "top-backprop-502"})
ON CREATE SET top2.name = "Backpropagation Algorithm",
              top2.description = "Reverse-mode autodiff through computational graphs.",
              top2.difficulty = "advanced",
              top2.estimatedLearningTime = 180,
              top2.orderIndex = 1;

MERGE (sub1)-[:HAS_TOPIC]->(top1);
MERGE (sub2)-[:HAS_TOPIC]->(top2);
MERGE (top1)-[:NEXT_TOPIC {weight: 1.0, createdAt: datetime(), updatedAt: datetime()}]->(top2);

// ----------------------------------------------------------------------------
// 4. Lessons
// ----------------------------------------------------------------------------
MERGE (les1:Lesson {uuid: "les-chain-rule-601"})
ON CREATE SET les1.name = "The Multivariable Chain Rule",
              les1.description = "Deriving partial derivatives across composite functions.",
              les1.durationSeconds = 900,
              les1.orderIndex = 0;

MERGE (les2:Lesson {uuid: "les-backprop-derivation-602"})
ON CREATE SET les2.name = "Deriving Backprop Step-by-Step",
              les2.description = "Applying the chain rule through matrix weight matrices.",
              les2.durationSeconds = 1200,
              les2.orderIndex = 1;

MERGE (top1)-[:HAS_LESSON]->(les1);
MERGE (top2)-[:HAS_LESSON]->(les2);
MERGE (les1)-[:NEXT_LESSON {weight: 1.0, createdAt: datetime(), updatedAt: datetime()}]->(les2);

// ----------------------------------------------------------------------------
// 5. Concepts (Atomic Knowledge Units)
// ----------------------------------------------------------------------------
MERGE (con_matrix:Concept {uuid: "con-matrix-mult-701"})
ON CREATE SET con_matrix.name = "Matrix Multiplication",
              con_matrix.subjectArea = "Linear Algebra",
              con_matrix.difficulty = "beginner",
              con_matrix.estimatedLearningTime = 45;

MERGE (con_deriv:Concept {uuid: "con-partial-deriv-702"})
ON CREATE SET con_deriv.name = "Partial Derivatives",
              con_deriv.subjectArea = "Calculus",
              con_deriv.difficulty = "beginner",
              con_deriv.estimatedLearningTime = 60;

MERGE (con_chain:Concept {uuid: "con-chain-rule-703"})
ON CREATE SET con_chain.name = "Chain Rule",
              con_chain.subjectArea = "Calculus",
              con_chain.difficulty = "intermediate",
              con_chain.estimatedLearningTime = 60;

MERGE (con_grad:Concept {uuid: "con-gradient-descent-704"})
ON CREATE SET con_grad.name = "Gradient Descent",
              con_grad.subjectArea = "Optimization",
              con_grad.difficulty = "intermediate",
              con_grad.estimatedLearningTime = 90;

MERGE (con_backprop:Concept {uuid: "con-backprop-705"})
ON CREATE SET con_backprop.name = "Backpropagation",
              con_backprop.subjectArea = "Neural Networks",
              con_backprop.difficulty = "advanced",
              con_backprop.estimatedLearningTime = 120;

MERGE (con_attention:Concept {uuid: "con-self-attention-706"})
ON CREATE SET con_attention.name = "Self-Attention Mechanism",
              con_attention.subjectArea = "Deep Learning",
              con_attention.difficulty = "advanced",
              con_attention.estimatedLearningTime = 150,
              con_attention.isAIGenerated = true;

// Concept Hierarchy & Dependencies
MERGE (top1)-[:HAS_CONCEPT]->(con_grad);
MERGE (top2)-[:HAS_CONCEPT]->(con_backprop);

// Dependency Graph: (Matrix Mult) + (Partial Deriv) -> (Chain Rule) -> (Gradient Descent) -> (Backpropagation) -> (Self-Attention)
MERGE (con_deriv)-[:PREREQUISITE {strength: 0.95, confidence: 0.98, weight: 1.0, createdAt: datetime(), updatedAt: datetime()}]->(con_chain);
MERGE (con_chain)-[:PREREQUISITE {strength: 0.90, confidence: 0.95, weight: 1.2, createdAt: datetime(), updatedAt: datetime()}]->(con_grad);
MERGE (con_matrix)-[:PREREQUISITE {strength: 0.85, confidence: 0.92, weight: 1.0, createdAt: datetime(), updatedAt: datetime()}]->(con_backprop);
MERGE (con_grad)-[:PREREQUISITE {strength: 0.95, confidence: 0.99, weight: 1.5, createdAt: datetime(), updatedAt: datetime()}]->(con_backprop);
MERGE (con_backprop)-[:PREREQUISITE {strength: 0.80, confidence: 0.90, weight: 1.3, createdAt: datetime(), updatedAt: datetime()}]->(con_attention);
MERGE (con_matrix)-[:RELATED_TO {strength: 0.75, confidence: 0.85, weight: 0.8, createdAt: datetime(), updatedAt: datetime()}]->(con_attention);

// ----------------------------------------------------------------------------
// 6. Skills
// ----------------------------------------------------------------------------
MERGE (sk1:Skill {uuid: "sk-backprop-impl-801"})
ON CREATE SET sk1.name = "Autodiff Engine Implementation",
              sk1.description = "Ability to implement reverse-mode automatic differentiation in NumPy or PyTorch.",
              sk1.proficiencyLevel = 0.85;

MERGE (con_backprop)-[:IMPROVES {weight: 1.0, strength: 0.9}]->(sk1);

// ----------------------------------------------------------------------------
// 7. Student Mastery States (Green, Yellow, Red)
// ----------------------------------------------------------------------------
// Mastered (Green: Matrix Multiplication, Partial Derivatives)
MERGE (s)-[:MASTERED {score: 0.98, confidence: 0.95, updatedAt: datetime()}]->(con_matrix);
MERGE (s)-[:MASTERED {score: 0.92, confidence: 0.90, updatedAt: datetime()}]->(con_deriv);

// Learning (Yellow: Chain Rule, Gradient Descent)
MERGE (s)-[:LEARNING {progress: 0.65, startedAt: datetime()}]->(con_chain);
MERGE (s)-[:LEARNING {progress: 0.40, startedAt: datetime()}]->(con_grad);

// Weak at (Red: Backpropagation)
MERGE (s)-[:WEAK_AT {failureCount: 3, confidence: 0.92, updatedAt: datetime()}]->(con_backprop);

// Recommended (Blue: Self-Attention — waiting for Backpropagation resolution)
MERGE (s)-[:RECOMMENDED {confidence: 0.88, reason: "Next in curriculum sequence once Backprop is mastered"}]->(con_attention);

// ----------------------------------------------------------------------------
// 8. Quizzes & Diagnostic Questions
// ----------------------------------------------------------------------------
MERGE (q1:Quiz {uuid: "q-backprop-diagnostic-901"})
ON CREATE SET q1.name = "Diagnostic Quiz: Chain Rule & Backprop",
              q1.quizType = "diagnostic",
              q1.timeLimitSeconds = 300,
              q1.passingScore = 75.0;

MERGE (q1)-[:TESTS]->(con_backprop);
MERGE (q1)-[:TESTS]->(con_chain);

MERGE (ques1:Question {uuid: "ques-jacobian-1001"})
ON CREATE SET ques1.name = "Vector-Jacobian Product",
              ques1.questionText = "Why does reverse-mode autodiff compute vector-Jacobian products rather than full Jacobians?",
              ques1.difficulty = "hard";

MERGE (q1)-[:PART_OF]->(ques1);
MERGE (ques1)-[:TESTS]->(con_backprop);

// ----------------------------------------------------------------------------
// 9. Resources (Videos, Books, Articles)
// ----------------------------------------------------------------------------
MERGE (v1:Video {uuid: "res-video-3b1b-1101"})
ON CREATE SET v1.name = "Calculus of Neural Networks",
              v1.url = "https://youtube.com/watch?v=tIeHLnjs5U8",
              v1.estimatedLearningTime = 20,
              v1.author = "3Blue1Brown";

MERGE (b1:Book {uuid: "res-book-goodfellow-1102"})
ON CREATE SET b1.name = "Deep Learning (Chapter 6: Deep Feedforward Networks)",
              b1.url = "https://www.deeplearningbook.org/contents/mlp.html",
              b1.author = "Ian Goodfellow, Yoshua Bengio, Aaron Courville";

MERGE (con_backprop)-[:USES_RESOURCE]->(v1);
MERGE (con_backprop)-[:USES_RESOURCE]->(b1);

// ----------------------------------------------------------------------------
// 10. Weak Concept Diagnostic Tracker & AI Remediation Path
// ----------------------------------------------------------------------------
MERGE (wc:WeakConcept {uuid: "wc-student-backprop-1201"})
ON CREATE SET wc.name = "Weakness in Matrix Derivatives during Backprop",
              wc.conceptName = "Backpropagation",
              wc.failureCount = 3,
              wc.isResolved = false,
              wc.createdAt = datetime(),
              wc.updatedAt = datetime();

MERGE (s)-[:HAS_WEAK_CONCEPT]->(wc);
MERGE (wc)-[:BELONGS_TO]->(con_backprop);

MERGE (lp:LearningPath {uuid: "lp-backprop-remediation-1301"})
ON CREATE SET lp.name = "Adaptive Remediation: Backprop Mastery",
              lp.isAIGenerated = true,
              lp.estimatedLearningTime = 90,
              lp.status = "active";

MERGE (s)-[:HAS_LEARNING_PATH]->(lp);
MERGE (lp)-[:RECOMMENDED]->(con_chain);
MERGE (lp)-[:RECOMMENDED]->(con_backprop);
