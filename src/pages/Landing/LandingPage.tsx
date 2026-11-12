import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BrainCircuit,
  Bot,
  Check,
  Network,
  Play,
  Plus,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { AvatarStack } from "@/components/ui/Avatar";
import { ROUTES } from "@/constants/routes";

export function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Network,
      title: "Living knowledge graph",
      text: "See every concept, connection, and knowledge gap evolve as you learn.",
    },
    {
      icon: Bot,
      title: "AI tutor, grounded in you",
      text: "Explanations adapt to your mastery, learning style, and current course context.",
    },
    {
      icon: Target,
      title: "Precision practice",
      text: "Generate quizzes that target weak links instead of repeating what you know.",
    },
  ];

  return (
    <div className="landing">
      <nav className="landing-nav">
        <Logo asLink={false} />
        <div className="landing-links">
          <a href="#features">Product</a>
          <a href="#workflow">How it works</a>
          <a href="#stories">Stories</a>
          <a href="#pricing">Pricing</a>
        </div>
        <div className="landing-actions">
          <button className="text-button" onClick={() => navigate(ROUTES.LOGIN)}>
            Log in
          </button>
          <Button onClick={() => navigate(ROUTES.DASHBOARD)}>
            Start learning <ArrowRight size={16} />
          </Button>
        </div>
      </nav>

      <main className="landing-main">
        <section className="hero">
          <div className="hero-copy">
            <Tag tone="indigo">
              <Sparkles size={13} /> AI-native continuous learning
            </Tag>
            <h1>
              Knowledge isn’t linear.
              <br />
              <span>Neither is your mind.</span>
            </h1>
            <p>
              LearnGraph builds a living map of what you know, finds the connections you’re missing,
              and creates the fastest path to mastery.
            </p>
            <div className="hero-actions">
              <Button onClick={() => navigate(ROUTES.DASHBOARD)}>
                Get started free <ArrowRight size={17} />
              </Button>
              <Button variant="secondary">
                <Play size={16} fill="currentColor" /> Watch demo
              </Button>
            </div>
            <div className="hero-proof">
              <AvatarStack items={["AK", "JM", "LS", "+2k"]} />
              <p>
                <strong>4.9/5</strong> from ambitious learners
              </p>
            </div>
          </div>

          <div className="hero-visual">
            <div className="orbital orbital-one" />
            <div className="orbital orbital-two" />
            <div className="hero-graph">
              <svg viewBox="0 0 600 470" aria-label="AI knowledge graph illustration">
                <defs>
                  <linearGradient id="heroNode" x1="0" x2="1">
                    <stop stopColor="#4f46e5" />
                    <stop offset="1" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                {[
                  [300, 225, 160, 100],
                  [300, 225, 465, 105],
                  [300, 225, 500, 300],
                  [300, 225, 160, 365],
                  [300, 225, 90, 220],
                  [160, 100, 90, 220],
                  [465, 105, 500, 300],
                  [160, 365, 90, 220],
                ].map((l, i) => (
                  <line key={i} x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} />
                ))}
                <circle cx="300" cy="225" r="77" className="node-halo" />
                <circle cx="300" cy="225" r="57" fill="url(#heroNode)" />
                <foreignObject x="266" y="190" width="68" height="68">
                  <div className="node-icon">
                    <BrainCircuit size={30} />
                    <small>YOU</small>
                  </div>
                </foreignObject>
                {[
                  [160, 100, "Calculus"],
                  [465, 105, "Physics"],
                  [500, 300, "Code"],
                  [160, 365, "Logic"],
                  [90, 220, "Algebra"],
                ].map((n, i) => (
                  <g key={i}>
                    <circle
                      cx={n[0] as number}
                      cy={n[1] as number}
                      r={i === 0 ? 42 : 35}
                      className={`hero-node n${i}`}
                    />
                    <text x={n[0] as number} y={(n[1] as number) + 4}>
                      {n[2]}
                    </text>
                  </g>
                ))}
              </svg>
              <div className="floating-card fc-one">
                <span className="success-dot">
                  <Check size={12} />
                </span>
                <div>
                  <small>CONCEPT MASTERED</small>
                  <strong>Chain Rule</strong>
                </div>
              </div>
              <div className="floating-card fc-two">
                <Sparkles size={17} />
                <div>
                  <small>AI INSIGHT</small>
                  <strong>Ready for Integrals</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="trusted">
          <span>TRUSTED BY LEARNERS AT</span>
          <div>
            <strong>STANFORD</strong>
            <strong>MIT</strong>
            <strong>Berkeley</strong>
            <strong>Imperial</strong>
            <strong>Waterloo</strong>
          </div>
        </section>

        <section className="feature-section" id="features">
          <div className="section-heading">
            <span className="eyebrow">INTELLIGENCE, NOT INFORMATION</span>
            <h2>A learning system that thinks with you.</h2>
            <p>Every interaction makes your learning map smarter, clearer, and uniquely yours.</p>
          </div>
          <div className="feature-grid">
            {features.map(({ icon: Icon, title, text }, i) => (
              <article key={title} className="feature-card">
                <span className={`feature-icon f${i}`}>
                  <Icon size={23} />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
                <a>
                  Explore feature <ArrowRight size={14} />
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="workflow" id="workflow">
          <div>
            <span className="eyebrow">HOW IT WORKS</span>
            <h2>From confusion to clarity in three moves.</h2>
          </div>
          <ol>
            <li>
              <span>01</span>
              <div>
                <strong>Connect your learning</strong>
                <p>Import courses from Moodle, Classroom, or start fresh.</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>Map your understanding</strong>
                <p>AI identifies concepts, relationships, and mastery.</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>Follow your best path</strong>
                <p>Get the right lesson, quiz, or explanation at the right time.</p>
              </div>
            </li>
          </ol>
        </section>

        <section className="stories-section" id="stories">
          <div className="section-heading">
            <span className="eyebrow">BUILT FOR EVERY KIND OF LEARNER</span>
            <h2>Clarity changes everything.</h2>
          </div>
          <div className="story-grid">
            {[
              {
                quote:
                  "I stopped guessing what to revise. LearnGraph showed me the exact concepts holding me back before finals.",
                name: "Maya Singh",
                role: "Computer Science student",
                initials: "MS",
              },
              {
                quote:
                  "The class graph makes misconceptions visible before they become bad grades. It has changed how I teach.",
                name: "Dr. Elena Vasquez",
                role: "Calculus instructor",
                initials: "EV",
              },
              {
                quote:
                  "Our LMS had the content. LearnGraph added the intelligence and personalization our students needed.",
                name: "Jordan Lee",
                role: "Director of digital learning",
                initials: "JL",
              },
            ].map((story) => (
              <article key={story.name}>
                <div className="story-stars">★★★★★</div>
                <blockquote>“{story.quote}”</blockquote>
                <div>
                  <span>{story.initials}</span>
                  <p>
                    <strong>{story.name}</strong>
                    <small>{story.role}</small>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="faq-section">
          <div>
            <span className="eyebrow">FREQUENTLY ASKED</span>
            <h2>Questions, connected.</h2>
            <p>Everything you need to know before building your first knowledge graph.</p>
          </div>
          <div className="faq-list">
            {[
              [
                "How does LearnGraph know what I understand?",
                "It combines quiz results, course activity, and your interactions to continuously estimate concept mastery.",
              ],
              [
                "Can I connect my existing LMS?",
                "Yes. LearnGraph is designed for Moodle, Google Classroom, Canvas, and other common learning platforms.",
              ],
              [
                "Is the AI tutor grounded in my courses?",
                "Yes. Answers use your uploaded materials, connected courses, and current knowledge graph as context.",
              ],
              [
                "Can schools and universities use LearnGraph?",
                "Institution workspaces include teacher analytics, administration controls, reporting, and privacy settings.",
              ],
            ].map(([question, answer], index) => (
              <details key={question} open={index === 0}>
                <summary>
                  {question}
                  <Plus size={17} />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="cta-banner">
          <div>
            <Tag tone="cyan">
              <Zap size={13} /> START IN MINUTES
            </Tag>
            <h2>Your next breakthrough is already connected.</h2>
            <p>Join thousands of learners building knowledge that lasts.</p>
          </div>
          <Button onClick={() => navigate(ROUTES.LOGIN)}>
            Build your graph <ArrowRight size={17} />
          </Button>
        </section>
      </main>

      <footer>
        <Logo asLink={false} />
        <p>© 2026 LearnGraph. Learn continuously.</p>
        <div>
          <a>Privacy</a>
          <a>Terms</a>
          <a>Contact</a>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
