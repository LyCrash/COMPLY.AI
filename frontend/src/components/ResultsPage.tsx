import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Download,
  Mail,
  MessageSquare,
  RefreshCw,
  Github,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Moon,
  Sun,
  Shield
} from "lucide-react";

interface Risk {
  id: string;
  level: "critical" | "medium" | "low";
  title: string;
  description: string;
  source: string;
  line?: number;
  article?: string;
  priority: "P0" | "P1" | "P2";
}

interface Action {
  id: string;
  type: "technique" | "legal" | "organizational";
  title: string;
  description: string;
  code?: string;
  estimatedTime: string;
  priority: "P0" | "P1" | "P2";
}

interface PII {
  type: string;
  count: number;
}

interface Service {
  name: string;
  icon: string;
  dataShared: string[];
  location: string;
  locationFlag: string;
  isEU: boolean;
  status: "compliant" | "warning" | "non-compliant";
}

interface ComplianceScore {
  category: string;
  score: number;
}

export interface AnalysisResult {
  repoUrl: string;
  repoName: string;
  score: number;
  subScores: {
    rgpd: number;
    aiAct: number;
    security: number;
    documentation: number;
  };
  piiFound: PII[];
  risks: Risk[];
  actions: Action[];
  services: Service[];
  complianceBreakdown: ComplianceScore[];
}

interface ResultsPageProps {
  result: AnalysisResult;
  onNewAnalysis: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const getScoreColor = (score: number): string => {
  if (score < 50) return "score-critical";
  if (score < 70) return "score-orange";
  if (score < 85) return "score-warning";
  return "score-success";
};

const getScoreLabel = (score: number): { emoji: string; label: string } => {
  if (score < 50) return { emoji: "🔴", label: "Non conforme" };
  if (score < 70) return { emoji: "🟠", label: "Attention requise" };
  if (score < 85) return { emoji: "🟡", label: "Partiellement conforme" };
  return { emoji: "🟢", label: "Conforme" };
};

const getScoreGradient = (score: number): string => {
  if (score < 50) return "from-destructive to-destructive/70";
  if (score < 70) return "from-orange to-orange/70";
  if (score < 85) return "from-warning to-warning/70";
  return "from-success to-success/70";
};

const getRiskClass = (level: Risk["level"]): string => {
  switch (level) {
    case "critical": return "risk-critical";
    case "medium": return "risk-medium";
    case "low": return "risk-low";
  }
};

const getBadgeLevelClass = (level: Risk["level"]): string => {
  switch (level) {
    case "critical": return "badge-critical";
    case "medium": return "badge-medium";
    case "low": return "badge-low";
  }
};

const getPriorityBadgeClass = (priority: string): string => {
  switch (priority) {
    case "P0": return "badge-p0";
    case "P1": return "badge-p1";
    case "P2": return "badge-p2";
    default: return "";
  }
};

export const ResultsPage = ({ 
  result, 
  onNewAnalysis,
  isDarkMode,
  toggleDarkMode 
}: ResultsPageProps) => {
  const [riskFilter, setRiskFilter] = useState<"all" | "critical" | "medium" | "low">("all");
  const [expandedRisks, setExpandedRisks] = useState<Set<string>>(new Set());
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [animatedScore, setAnimatedScore] = useState(0);

  // Animate score on mount
  useEffect(() => {
    let current = 0;
    const target = result.score;
    const duration = 1500;
    const steps = 60;
    const increment = target / steps;
    const stepTime = duration / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setAnimatedScore(target);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [result.score]);

  const filteredRisks = result.risks.filter(risk => 
    riskFilter === "all" || risk.level === riskFilter
  );

  const toggleRiskExpanded = (id: string) => {
    setExpandedRisks(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const copyCode = async (code: string, actionId: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(actionId);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const { emoji: scoreEmoji, label: scoreLabel } = getScoreLabel(result.score);

  const riskCounts = {
    critical: result.risks.filter(r => r.level === "critical").length,
    medium: result.risks.filter(r => r.level === "medium").length,
    low: result.risks.filter(r => r.level === "low").length,
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onNewAnalysis}
              className="btn-outline inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Nouvelle analyse
            </button>

            <div className="flex items-center gap-3">
              <Github className="w-5 h-5 text-muted-foreground" />
              <span className="font-semibold text-foreground">{result.repoName}</span>
            </div>

            <div className="flex items-center gap-3">
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
              <button className="btn-outline inline-flex items-center gap-2">
                <Download className="w-4 h-4" />
                Télécharger PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-8 max-w-7xl mx-auto">
        {/* Score Hero */}
        <section className="card-premium p-8 md:p-12 mb-10 opacity-0 animate-fade-in-up">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            {/* Main Score Circle */}
            <div className="flex-shrink-0">
              <div 
                className="score-circle"
                style={{ 
                  '--score-percent': `${animatedScore}%`,
                  '--score-color': animatedScore < 50 ? 'hsl(var(--destructive))' 
                    : animatedScore < 70 ? 'hsl(var(--orange))'
                    : animatedScore < 85 ? 'hsl(var(--warning))'
                    : 'hsl(var(--success))'
                } as React.CSSProperties}
              >
                <div className="score-circle-inner">
                  <span className={`text-6xl font-bold ${getScoreColor(animatedScore)} animate-count-up`}>
                    {animatedScore}
                  </span>
                  <span className="text-muted-foreground text-lg">/100</span>
                </div>
              </div>
              <div className="text-center mt-4">
                <span className="text-2xl font-semibold">
                  {scoreEmoji} {scoreLabel}
                </span>
              </div>
            </div>

            {/* Sub Scores */}
            <div className="flex-1 w-full space-y-5">
              <h3 className="text-lg font-semibold text-muted-foreground mb-4">
                Scores par catégorie
              </h3>
              {[
                { label: "RGPD", score: result.subScores.rgpd },
                { label: "AI Act", score: result.subScores.aiAct },
                { label: "Sécurité", score: result.subScores.security },
                { label: "Documentation", score: result.subScores.documentation },
              ].map((item, idx) => (
                <div key={item.label} className="opacity-0 animate-fade-in-up" style={{ animationDelay: `${0.2 + idx * 0.1}s` }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{item.label}</span>
                    <span className={`font-bold ${getScoreColor(item.score)}`}>
                      {item.score}/100
                    </span>
                  </div>
                  <div className="mini-progress">
                    <div
                      className={`mini-progress-fill bg-gradient-to-r ${getScoreGradient(item.score)}`}
                      style={{ width: `${item.score}%`, transitionDelay: `${0.5 + idx * 0.1}s` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PII Detection */}
        <section className="card-elevated p-8 mb-10 opacity-0 animate-fade-in-up stagger-1">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🔍</span>
            <h2 className="text-xl font-bold">Données personnelles trouvées dans le code</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {result.piiFound.map((pii, idx) => (
              <span 
                key={pii.type} 
                className="badge-pii opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${0.3 + idx * 0.05}s` }}
              >
                {pii.type} <span className="ml-1 opacity-70">({pii.count}×)</span>
              </span>
            ))}
          </div>
        </section>

        {/* Risks Section */}
        <section className="card-elevated p-8 mb-10 opacity-0 animate-fade-in-up stagger-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-destructive" />
              <h2 className="text-xl font-bold">
                Risques critiques et recommandations
                <span className="ml-2 text-muted-foreground font-normal text-base">
                  ({result.risks.length} total)
                </span>
              </h2>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
              <button
                onClick={() => setRiskFilter("all")}
                className={`filter-btn ${riskFilter === "all" ? "active" : ""}`}
              >
                Tous
              </button>
              <button
                onClick={() => setRiskFilter("critical")}
                className={`filter-btn ${riskFilter === "critical" ? "active" : ""}`}
              >
                🔴 Critiques ({riskCounts.critical})
              </button>
              <button
                onClick={() => setRiskFilter("medium")}
                className={`filter-btn ${riskFilter === "medium" ? "active" : ""}`}
              >
                🟡 Moyens ({riskCounts.medium})
              </button>
              <button
                onClick={() => setRiskFilter("low")}
                className={`filter-btn ${riskFilter === "low" ? "active" : ""}`}
              >
                🟢 Faibles ({riskCounts.low})
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredRisks.map((risk, idx) => (
              <div
                key={risk.id}
                className={`risk-card ${getRiskClass(risk.level)} opacity-0 animate-slide-in-right`}
                style={{ animationDelay: `${0.1 + idx * 0.05}s` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`badge-level ${getBadgeLevelClass(risk.level)}`}>
                        {risk.level === "critical" ? "🔴 Critique" : risk.level === "medium" ? "🟡 Moyen" : "🟢 Faible"}
                      </span>
                      <span className={`badge-priority ${getPriorityBadgeClass(risk.priority)}`}>
                        {risk.priority}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg mb-2">{risk.title}</h3>
                    <p className="text-muted-foreground mb-3">{risk.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="px-2 py-1 rounded bg-muted">
                        📁 {risk.source}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleRiskExpanded(risk.id)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    {expandedRisks.has(risk.id) ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                </div>

                {expandedRisks.has(risk.id) && (
                  <div className="mt-4 pt-4 border-t border-border/50 space-y-3 animate-fade-in">
                    {risk.line && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">Ligne :</span>{" "}
                        <code className="px-2 py-0.5 bg-muted rounded">{risk.line}</code>
                      </p>
                    )}
                    {risk.article && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">Article RGPD violé :</span>{" "}
                        <span className="font-medium">{risk.article}</span>
                      </p>
                    )}
                    <p className="text-sm">
                      <span className="text-muted-foreground">Priorité de correction :</span>{" "}
                      <span className={`font-bold ${risk.priority === "P0" ? "text-destructive" : risk.priority === "P1" ? "text-orange" : "text-warning"}`}>
                        {risk.priority === "P0" ? "Immédiate" : risk.priority === "P1" ? "Cette semaine" : "Ce mois"}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Actions Section */}
        <section className="card-elevated p-8 mb-10 opacity-0 animate-fade-in-up stagger-3">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-success" />
              <h2 className="text-xl font-bold">Plan d'action recommandé</h2>
            </div>
            <button className="btn-outline inline-flex items-center gap-2 text-sm">
              <Copy className="w-4 h-4" />
              Tout copier
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {result.actions.map((action, idx) => (
              <div 
                key={action.id} 
                className="action-card opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${0.3 + idx * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {idx + 1}
                    </span>
                    {action.type === "technique" ? (
                      <span className="badge-technique">🔧 Technique</span>
                    ) : action.type === "legal" ? (
                      <span className="badge-legal">📝 Légal</span>
                    ) : (
                      <span className="badge-org">🔄 Organisationnel</span>
                    )}
                  </div>
                  <span className={`badge-priority ${getPriorityBadgeClass(action.priority)}`}>
                    {action.priority}
                  </span>
                </div>

                <h3 className="font-bold text-lg mb-2">{action.title}</h3>
                <p className="text-muted-foreground mb-4">{action.description}</p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {action.estimatedTime}
                  </span>
                </div>

                {action.code && (
                  <div className="relative">
                    <div className="code-block-header">
                      <span>Code suggéré</span>
                      <button
                        onClick={() => copyCode(action.code!, action.id)}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        {copiedCode === action.id ? (
                          <>
                            <Check className="w-3 h-3" />
                            Copié!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Copier
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="code-block text-xs">{action.code}</pre>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/30">
                  <input type="checkbox" className="w-5 h-5 rounded border-border accent-primary" />
                  <span className="text-sm text-muted-foreground">Marquer comme fait</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Services Section */}
        <section className="card-elevated p-8 mb-10 opacity-0 animate-fade-in-up stagger-4">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🌐</span>
            <h2 className="text-xl font-bold">Services tiers et flux de données</h2>
          </div>

          <div className="space-y-4">
            {result.services.map((service, idx) => (
              <div 
                key={service.name} 
                className="service-flow opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${0.2 + idx * 0.1}s` }}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    <span className="font-medium">Votre app</span>
                  </div>
                  <span className="service-arrow text-xl">→</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{service.icon}</span>
                    <span className="font-medium">{service.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex flex-wrap gap-1">
                    {service.dataShared.map(data => (
                      <span key={data} className="px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        {data}
                      </span>
                    ))}
                  </div>
                  <div className={`flex items-center gap-1 ${service.isEU ? "text-success" : "text-warning"}`}>
                    <span>{service.locationFlag}</span>
                    <span>{service.location}</span>
                    {!service.isEU && <AlertTriangle className="w-4 h-4" />}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    service.status === "compliant" ? "bg-success/15 text-success" :
                    service.status === "warning" ? "bg-warning/20 text-warning-foreground" :
                    "bg-destructive/15 text-destructive"
                  }`}>
                    {service.status === "compliant" ? "Conforme" : service.status === "warning" ? "À vérifier" : "Non conforme"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Compliance Breakdown */}
        <section className="card-elevated p-8 mb-10 opacity-0 animate-fade-in-up stagger-5">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">📊</span>
            <h2 className="text-xl font-bold">Détail de conformité</h2>
          </div>

          <div className="space-y-4">
            {result.complianceBreakdown.map((item, idx) => (
              <div 
                key={item.category} 
                className="opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${0.2 + idx * 0.08}s` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{item.category}</span>
                  <span className={`font-bold ${getScoreColor(item.score)}`}>{item.score}%</span>
                </div>
                <div className="h-6 rounded-lg overflow-hidden bg-muted">
                  <div
                    className={`h-full rounded-lg bg-gradient-to-r ${getScoreGradient(item.score)} transition-all duration-700`}
                    style={{ width: `${item.score}%`, transitionDelay: `${0.5 + idx * 0.1}s` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer Actions */}
        <section className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-in-up stagger-6">
          <button className="btn-outline inline-flex items-center gap-2 w-full sm:w-auto justify-center">
            <Mail className="w-4 h-4" />
            Envoyer par email
          </button>
          <button className="btn-outline inline-flex items-center gap-2 w-full sm:w-auto justify-center">
            <MessageSquare className="w-4 h-4" />
            Discuter avec un expert
          </button>
          <button 
            onClick={onNewAnalysis}
            className="btn-primary-gradient inline-flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <RefreshCw className="w-4 h-4" />
            Relancer l'analyse
          </button>
        </section>
      </main>
    </div>
  );
};
