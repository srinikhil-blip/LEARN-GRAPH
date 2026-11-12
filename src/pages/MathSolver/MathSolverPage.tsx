import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calculator,
  Sparkles,
  Bot,
  CheckCircle2,
  Copy,
  Layers,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Sigma,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { ROUTES } from "@/constants/routes";

interface MathProblemSample {
  title: string;
  category: string;
  problem: string;
  steps: { stepNum: number; title: string; math: string; explanation: string }[];
  finalAnswer: string;
  keyTheorem: string;
}

const SAMPLE_MATH_PROBLEMS: MathProblemSample[] = [
  {
    title: "Definite Integral with King's Property",
    category: "Calculus",
    problem: "Evaluate: I = \\int_{0}^{\\pi/2} \\frac{\\sqrt{\\sin x}}{\\sqrt{\\sin x} + \\sqrt{\\cos x}} \\, dx",
    steps: [
      {
        stepNum: 1,
        title: "Apply King's Property",
        math: "\\int_{a}^{b} f(x)dx = \\int_{a}^{b} f(a+b-x)dx",
        explanation: "Substitute x with (0 + \\pi/2 - x) = \\pi/2 - x throughout the integrand.",
      },
      {
        stepNum: 2,
        title: "Evaluate Trigonometric Complements",
        math: "\\sin(\\pi/2 - x) = \\cos x, \\quad \\cos(\\pi/2 - x) = \\sin x",
        explanation: "This produces a complementary form: I = \\int_{0}^{\\pi/2} \\frac{\\sqrt{\\cos x}}{\\sqrt{\\cos x} + \\sqrt{\\sin x}} dx.",
      },
      {
        stepNum: 3,
        title: "Add Equations (1) and (2)",
        math: "2I = \\int_{0}^{\\pi/2} \\left( \\frac{\\sqrt{\\sin x} + \\sqrt{\\cos x}}{\\sqrt{\\sin x} + \\sqrt{\\cos x}} \\right) dx = \\int_{0}^{\\pi/2} 1 \\, dx",
        explanation: "The numerators and denominators cancel out completely into a trivial integral.",
      },
      {
        stepNum: 4,
        title: "Solve for I",
        math: "2I = [x]_{0}^{\\pi/2} = \\frac{\\pi}{2} \\implies I = \\frac{\\pi}{4}",
        explanation: "Divide both sides by 2 to reach the exact value.",
      },
    ],
    finalAnswer: "\\frac{\\pi}{4}",
    keyTheorem: "Definite Integral Reflection Symmetry (King's Rule)",
  },
  {
    title: "Eigenvalues of 2x2 Linear Transformation",
    category: "Linear Algebra",
    problem: "Find the eigenvalues of matrix A = \\begin{pmatrix} 4 & 1 \\\\ 2 & 3 \\end{pmatrix}",
    steps: [
      {
        stepNum: 1,
        title: "Form Characteristic Equation",
        math: "\\det(A - \\lambda I) = 0",
        explanation: "Subtract \\lambda along the main diagonal and set the determinant to zero.",
      },
      {
        stepNum: 2,
        title: "Calculate Determinant",
        math: "(4 - \\lambda)(3 - \\lambda) - (1)(2) = \\lambda^2 - 7\\lambda + 12 - 2 = \\lambda^2 - 7\\lambda + 10 = 0",
        explanation: "Expand the polynomial and group terms.",
      },
      {
        stepNum: 3,
        title: "Factor the Quadratic",
        math: "(\\lambda - 5)(\\lambda - 2) = 0",
        explanation: "The roots of the characteristic polynomial represent the eigenvalues.",
      },
      {
        stepNum: 4,
        title: "Final Eigenvalues",
        math: "\\lambda_1 = 5, \\quad \\lambda_2 = 2",
        explanation: "Check trace: 4+3 = 7 = 5+2; check determinant: 12-2 = 10 = 5*2.",
      },
    ],
    finalAnswer: "\\lambda \\in \\{2, 5\\}",
    keyTheorem: "Characteristic Polynomial Invariance",
  },
];

export function MathSolverPage() {
  const navigate = useNavigate();
  const [inputFormula, setInputFormula] = useState(SAMPLE_MATH_PROBLEMS[0].problem);
  const [selectedSample, setSelectedSample] = useState<MathProblemSample>(SAMPLE_MATH_PROBLEMS[0]);
  const [isSolving, setIsSolving] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSelectSample = (sample: MathProblemSample) => {
    setSelectedSample(sample);
    setInputFormula(sample.problem);
    setActiveStep(null);
  };

  const handleSolve = () => {
    setIsSolving(true);
    setTimeout(() => {
      setIsSolving(false);
    }, 600);
  };

  const handleCopyMath = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="STEP-BY-STEP SYMBOLIC REASONING"
        title="Math Solver & Proof Engine"
        description="Detailed symbolic breakdowns, step-by-step calculus derivations, linear algebra transformations, and formal theorems."
        action={
          <Button onClick={() => navigate(ROUTES.AI_TUTOR)}>
            <Bot size={16} /> Open AI Tutor
          </Button>
        }
      />

      {/* Solver Input Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Calculator size={18} />
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Input Equation, Integral, or Matrix
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Quick Presets:</span>
            {SAMPLE_MATH_PROBLEMS.map((sample) => (
              <button
                key={sample.title}
                onClick={() => handleSelectSample(sample)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                  selectedSample.title === sample.title
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {sample.category}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <textarea
            value={inputFormula}
            onChange={(e) => setInputFormula(e.target.value)}
            rows={3}
            className="w-full text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Type LaTeX or math formula, e.g. \int x^2 \sin(x) dx..."
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Sigma size={14} className="text-indigo-500" /> Supports LaTeX math notation & step proofs
          </span>
          <Button variant="primary" onClick={handleSolve} disabled={isSolving} className="gap-2">
            <Sparkles size={15} /> {isSolving ? "Deriving Steps..." : "Solve Step-by-Step"}
          </Button>
        </div>
      </div>

      {/* Solution Walkthrough Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Tag tone="indigo">{selectedSample.category}</Tag>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {selectedSample.title}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Key Theorem Applied: <strong>{selectedSample.keyTheorem}</strong>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopyMath(selectedSample.finalAnswer)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5"
            >
              {copied ? <CheckCircle2 size={13} className="text-emerald-500" /> : <Copy size={13} />}
              {copied ? "Copied" : "Copy Result"}
            </button>
            <Button
              variant="secondary"
              onClick={() =>
                navigate(
                  `${ROUTES.AI_TUTOR}?prompt=${encodeURIComponent(
                    `Explain the proof for ${selectedSample.title}: ${selectedSample.problem}`
                  )}`
                )
              }
              className="text-xs gap-1.5"
            >
              <Bot size={13} /> Ask AI Tutor
            </Button>
          </div>
        </div>

        {/* Math Problem Formula Display */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center font-mono text-sm sm:text-base text-indigo-700 dark:text-indigo-300 font-semibold tracking-wide">
          $${selectedSample.problem}$$
        </div>

        {/* Step-by-Step Derivation list */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
            Step-by-Step Mathematical Derivation
          </h4>

          {selectedSample.steps.map((st) => (
            <div
              key={st.stepNum}
              onClick={() => setActiveStep(activeStep === st.stepNum ? null : st.stepNum)}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all space-y-2 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[11px] font-bold">
                    {st.stepNum}
                  </span>
                  {st.title}
                </span>
                <span className="text-[11px] text-indigo-500 font-medium">
                  {activeStep === st.stepNum ? "Collapse" : "Explain"}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 overflow-x-auto">
                $${st.math}$$
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {st.explanation}
              </p>
            </div>
          ))}
        </div>

        {/* Final Answer Banner */}
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-emerald-800 dark:text-emerald-300 block uppercase tracking-wide text-[10px]">
              Final Canonical Solution
            </span>
            <span className="font-mono text-base font-bold text-emerald-900 dark:text-emerald-200">
              $${selectedSample.finalAnswer}$$
            </span>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-semibold text-[11px]">
            Verified Exact
          </span>
        </div>
      </div>
    </div>
  );
}

export default MathSolverPage;
