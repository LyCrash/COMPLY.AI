import { useState, useEffect, useCallback } from "react";
import { 
  Shield, 
  Github, 
  Rocket, 
  Loader2, 
  Zap, 
  Lock, 
  Brain,
  Check,
  Moon,
  Sun
} from "lucide-react";

interface AnalysisOption {
  id: string;
  emoji: string;
  title: string;
  description: string;
  recommended: boolean;
  defaultChecked: boolean;
}

const ANALYSIS_OPTIONS: AnalysisOption[] = [
  {
    id: "rgpd",
    emoji: "🇪🇺",
    title: "RGPD Compliance",
    description: "Conformité RGPD complète",
    recommended: true,
    defaultChecked: true,
  },
  {
    id: "aiact",
    emoji: "🤖",
    title: "AI Act Compliance",
    description: "Règlement européen IA",
    recommended: true,
    defaultChecked: true,
  },
  {
    id: "pii",
    emoji: "🔍",
    title: "Détection PII",
    description: "Emails, IPs, données sensibles",
    recommended: true,
    defaultChecked: true,
  },
  {
    id: "thirdparty",
    emoji: "🌐",
    title: "Flux données tiers",
    description: "OpenAI, Stripe, Firebase...",
    recommended: true,
    defaultChecked: true,
  },
  {
    id: "legal",
    emoji: "📄",
    title: "Documentation légale",
    description: "Privacy Policy, CGU, DPA",
    recommended: true,
    defaultChecked: true,
  },
  {
    id: "security",
    emoji: "🔐",
    title: "Audit sécurité",
    description: "Secrets hardcodés, vulnérabilités",
    recommended: false,
    defaultChecked: false,
  },
];

const LOADING_MESSAGES = [
  "Clone du repository...",
  "Scan du code source...",
  "Analyse des dépendances...",
  "Détection IA en cours...",
  "Génération du rapport...",
];

interface AnalysisPageProps {
  onAnalysisComplete: (repoUrl: string, selectedOptions: string[]) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const AnalysisPage = ({ 
  onAnalysisComplete, 
  isDarkMode, 
  toggleDarkMode 
}: AnalysisPageProps) => {
  const [repoUrl, setRepoUrl] = useState("");
  const [selectedChecks, setSelectedChecks] = useState<Record<string, boolean>>(
    Object.fromEntries(ANALYSIS_OPTIONS.map(opt => [opt.id, opt.defaultChecked]))
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const [urlTouched, setUrlTouched] = useState(false);
  const [showShake, setShowShake] = useState(false);

  // GitHub URL validation
  const isValidGithubUrl = useCallback((url: string) => {
    const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
    return githubRegex.test(url);
  }, []);

  const isUrlValid = isValidGithubUrl(repoUrl);
  const hasSelectedOptions = Object.values(selectedChecks).some(Boolean);
  const canAnalyze = isUrlValid && hasSelectedOptions;

  const toggleOption = (id: string) => {
    setSelectedChecks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAnalyze = useCallback(() => {
    if (!canAnalyze) {
      setShowShake(true);
      setTimeout(() => setShowShake(false), 500);
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // Simulate analysis progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setAnalysisProgress(progress);
      
      const messageIndex = Math.min(
        Math.floor(progress / 20),
        LOADING_MESSAGES.length - 1
      );
      setLoadingMessage(LOADING_MESSAGES[messageIndex]);

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          const selected = Object.entries(selectedChecks)
            .filter(([_, checked]) => checked)
            .map(([id]) => id);
          onAnalysisComplete(repoUrl, selected);
        }, 500);
      }
    }, 150);
  }, [canAnalyze, repoUrl, selectedChecks, onAnalysisComplete]);

  // Konami code easter egg
  useEffect(() => {
    const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    let konamiIndex = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === konami[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konami.length) {
          // Trigger confetti!
          const colors = ['#6366f1', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444'];
          for (let i = 0; i < 100; i++) {
            setTimeout(() => {
              const confetti = document.createElement('div');
              confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}vw;
                top: 100vh;
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                animation: confetti 2s ease-out forwards;
              `;
              document.body.appendChild(confetti);
              setTimeout(() => confetti.remove(), 2000);
            }, i * 20);
          }
          konamiIndex = 0;
        }
      } else {
        konamiIndex = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer relative">
            <div className="p-2 rounded-xl bg-primary/10">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              COMPLY<span className="text-primary">.AI</span>
            </span>
            {/* Tooltip */}
            <div className="absolute left-0 top-full mt-2 tooltip-content whitespace-nowrap">
              Propulsé par Claude Sonnet 4
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="badge-beta">BETA</span>
            <button
              onClick={toggleDarkMode}
              className="dark-toggle"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Moon className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="px-6 py-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="hero-gradient mb-12 opacity-0 animate-fade-in-up">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                Analysez la conformité de votre codebase en 30 secondes
              </h1>
              <p className="text-xl opacity-90">
                RGPD, AI Act, sécurité des données — tout automatisé par IA
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/10 flex items-center justify-center animate-pulse-slow">
                <Github className="w-20 h-20 md:w-24 md:h-24 text-white/90" />
              </div>
            </div>
          </div>
        </section>

        {/* Input Section */}
        <section className="card-elevated p-8 md:p-10 mb-10 opacity-0 animate-fade-in-up stagger-1" style={{ boxShadow: 'var(--shadow-2xl)' }}>
          <div className="max-w-3xl mx-auto">
            <label className="flex items-center gap-2 text-lg font-semibold mb-4">
              <Github className="w-5 h-5 text-muted-foreground" />
              URL de votre repository GitHub
            </label>
            <div className="relative">
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                onBlur={() => setUrlTouched(true)}
                placeholder="https://github.com/votre-org/votre-repo"
                className={`input-github pr-12 ${
                  urlTouched && repoUrl
                    ? isUrlValid
                      ? 'input-valid'
                      : 'input-invalid'
                    : ''
                }`}
              />
              {urlTouched && repoUrl && isUrlValid && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Check className="w-6 h-6 text-success animate-fade-in" />
                </div>
              )}
            </div>
            {urlTouched && repoUrl && !isUrlValid && (
              <p className="mt-2 text-sm text-destructive animate-fade-in">
                Veuillez entrer une URL GitHub valide (ex: https://github.com/org/repo)
              </p>
            )}
            <p className="mt-3 text-sm text-muted-foreground">
              Nous analyserons votre code, vos configs et votre documentation
            </p>
          </div>
        </section>

        {/* Options Section */}
        <section className="mb-10 opacity-0 animate-fade-in-up stagger-2">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Que souhaitez-vous analyser ?</h2>
            <p className="text-muted-foreground">Sélectionnez au moins une option</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ANALYSIS_OPTIONS.map((option, index) => (
              <div
                key={option.id}
                onClick={() => toggleOption(option.id)}
                className={`option-card ${selectedChecks[option.id] ? 'selected' : ''} opacity-0 animate-fade-in-up`}
                style={{ animationDelay: `${0.3 + index * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{option.emoji}</span>
                  <div className="flex items-center gap-2">
                    {option.recommended && (
                      <span className="badge-recommended">Recommandé</span>
                    )}
                    <div className="checkbox">
                      {selectedChecks[option.id] && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-1">{option.title}</h3>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Analyze Button */}
        <section className="mb-12 opacity-0 animate-fade-in-up stagger-3">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className={`btn-huge w-full flex items-center justify-center gap-3 ${
              showShake ? 'animate-shake' : ''
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>{loadingMessage}</span>
              </>
            ) : (
              <>
                <Rocket className="w-6 h-6" />
                <span>Lancer l'analyse complète</span>
              </>
            )}
          </button>

          {isAnalyzing && (
            <div className="mt-6 animate-fade-in">
              <div className="progress-bar">
                <div
                  className="progress-fill bg-gradient-to-r from-primary to-secondary"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
              <p className="text-center text-sm text-muted-foreground mt-2">
                {analysisProgress}% - {loadingMessage}
              </p>
            </div>
          )}
        </section>

        {/* Features */}
        <section className="grid md:grid-cols-3 gap-4 opacity-0 animate-fade-in-up stagger-4">
          <div className="feature-card">
            <div className="p-2 rounded-lg bg-primary/10">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Analyse en &lt; 1 minute</p>
              <p className="text-sm text-muted-foreground">Résultats instantanés</p>
            </div>
          </div>
          <div className="feature-card">
            <div className="p-2 rounded-lg bg-success/10">
              <Lock className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="font-semibold">Code jamais stocké</p>
              <p className="text-sm text-muted-foreground">100% confidentiel</p>
            </div>
          </div>
          <div className="feature-card">
            <div className="p-2 rounded-lg bg-secondary/10">
              <Brain className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="font-semibold">IA Claude Sonnet 4</p>
              <p className="text-sm text-muted-foreground">Analyse de pointe</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
