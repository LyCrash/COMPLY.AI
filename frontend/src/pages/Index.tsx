import { useState, useCallback, useEffect } from "react";
import { AnalysisPage } from "@/components/AnalysisPage";
import { ResultsPage, AnalysisResult } from "@/components/ResultsPage";

// Enhanced mock data for demonstration
const createMockResult = (repoUrl: string): AnalysisResult => {
  const repoName = repoUrl.split("/").slice(-2).join("/") || "example/repo";
  
  return {
    repoUrl,
    repoName,
    score: 67,
    subScores: {
      rgpd: 62,
      aiAct: 71,
      security: 58,
      documentation: 75,
    },
    piiFound: [
      { type: "email", count: 23 },
      { type: "IP address", count: 12 },
      { type: "phone", count: 5 },
      { type: "full name", count: 45 },
      { type: "address", count: 8 },
    ],
    risks: [
      {
        id: "1",
        level: "critical",
        title: "Données utilisateur envoyées vers OpenAI sans anonymisation",
        description: "Le code envoie des données personnelles brutes (emails, noms) directement à l'API OpenAI sans pseudonymisation préalable, ce qui viole l'article 25 du RGPD sur la protection des données dès la conception.",
        source: "src/api/ai-service.ts",
        line: 42,
        article: "Article 25 - Protection des données dès la conception",
        priority: "P0",
      },
      {
        id: "2",
        level: "critical",
        title: "Absence de politique de rétention des données",
        description: "Les données personnelles sont conservées indéfiniment sans date d'expiration définie. L'article 5(1)(e) du RGPD exige une limitation de la conservation.",
        source: "database/users.sql",
        line: 15,
        article: "Article 5 - Principes relatifs au traitement",
        priority: "P0",
      },
      {
        id: "3",
        level: "critical",
        title: "Clé API Stripe hardcodée dans le code",
        description: "Une clé API secrète Stripe est directement présente dans le code source, créant un risque de sécurité majeur.",
        source: "src/config/payment.ts",
        line: 8,
        article: "Article 32 - Sécurité du traitement",
        priority: "P0",
      },
      {
        id: "4",
        level: "medium",
        title: "Cookies analytics sans consentement préalable",
        description: "Google Analytics est chargé avant que l'utilisateur n'ait donné son consentement explicite pour les cookies de tracking.",
        source: "src/analytics.js",
        line: 3,
        article: "Directive ePrivacy",
        priority: "P1",
      },
      {
        id: "5",
        level: "medium",
        title: "Transfert de données vers serveurs US sans SCC",
        description: "Les données sont hébergées sur AWS US-East sans clauses contractuelles types (SCC) documentées pour le transfert hors UE.",
        source: "infrastructure/terraform.tf",
        line: 28,
        article: "Article 46 - Transferts moyennant garanties",
        priority: "P1",
      },
      {
        id: "6",
        level: "medium",
        title: "Modèle IA non documenté selon AI Act",
        description: "L'utilisation du modèle GPT-4 n'est pas documentée conformément aux exigences de transparence de l'AI Act européen.",
        source: "docs/",
        article: "AI Act - Article 13 - Transparence",
        priority: "P1",
      },
      {
        id: "7",
        level: "low",
        title: "Logs contenant des adresses IP complètes",
        description: "Les fichiers de logs conservent les adresses IP non anonymisées des visiteurs pendant plus de 7 jours.",
        source: "logs/access.log",
        priority: "P2",
      },
      {
        id: "8",
        level: "low",
        title: "Privacy Policy incomplète",
        description: "La politique de confidentialité ne mentionne pas l'utilisation de services d'IA tiers ni les durées de conservation.",
        source: "public/privacy-policy.md",
        priority: "P2",
      },
    ],
    actions: [
      {
        id: "1",
        type: "technique",
        title: "Implémenter l'anonymisation avant envoi à OpenAI",
        description: "Créer un middleware qui pseudonymise les données personnelles (emails, noms) avant tout appel à l'API OpenAI.",
        code: `// middleware/anonymize.ts
import { hash } from 'crypto';

interface UserData {
  email: string;
  name: string;
  content: string;
}

export function anonymizeForAI(data: UserData): UserData {
  return {
    email: hash('sha256', data.email).slice(0, 8) + '@anon.local',
    name: 'User_' + hash('sha256', data.name).slice(0, 6),
    content: data.content.replace(
      /[\\w.-]+@[\\w.-]+/g, 
      '[EMAIL_REDACTED]'
    )
  };
}`,
        estimatedTime: "2-4 heures",
        priority: "P0",
      },
      {
        id: "2",
        type: "technique",
        title: "Ajouter une politique de rétention automatique",
        description: "Implémenter une tâche CRON qui supprime automatiquement les données personnelles après 24 mois d'inactivité.",
        code: `-- migrations/add_retention_policy.sql
ALTER TABLE users 
ADD COLUMN last_activity TIMESTAMP DEFAULT NOW();

CREATE OR REPLACE FUNCTION cleanup_inactive_users()
RETURNS void AS $$
BEGIN
  DELETE FROM users 
  WHERE last_activity < NOW() - INTERVAL '24 months';
END;
$$ LANGUAGE plpgsql;

-- Exécuter tous les jours à 3h00
SELECT cron.schedule('cleanup-users', '0 3 * * *', 
  'SELECT cleanup_inactive_users()');`,
        estimatedTime: "4-6 heures",
        priority: "P0",
      },
      {
        id: "3",
        type: "technique",
        title: "Migrer les secrets vers variables d'environnement",
        description: "Déplacer toutes les clés API du code source vers des variables d'environnement sécurisées.",
        code: `// config/payment.ts
// ❌ Avant
const STRIPE_KEY = 'sk_live_xxx...';

// ✅ Après
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_KEY) {
  throw new Error('STRIPE_SECRET_KEY non configurée');
}`,
        estimatedTime: "1-2 heures",
        priority: "P0",
      },
      {
        id: "4",
        type: "legal",
        title: "Mettre à jour la Privacy Policy",
        description: "Ajouter une section détaillant l'utilisation d'OpenAI, les transferts hors UE, et les durées de conservation pour chaque type de données.",
        estimatedTime: "1 semaine",
        priority: "P1",
      },
      {
        id: "5",
        type: "technique",
        title: "Implémenter un bandeau de consentement cookies",
        description: "Ajouter un système de gestion des consentements (CMP) qui bloque le chargement des cookies analytics avant accord explicite.",
        estimatedTime: "4-8 heures",
        priority: "P1",
      },
      {
        id: "6",
        type: "organizational",
        title: "Documenter le système IA pour l'AI Act",
        description: "Créer une documentation technique du système d'IA utilisé incluant: objectif, données d'entrée, mesures de sécurité, et processus de supervision humaine.",
        estimatedTime: "1-2 semaines",
        priority: "P1",
      },
    ],
    services: [
      {
        name: "OpenAI",
        icon: "🤖",
        dataShared: ["prompts", "emails", "noms"],
        location: "USA",
        locationFlag: "🇺🇸",
        isEU: false,
        status: "warning",
      },
      {
        name: "Stripe",
        icon: "💳",
        dataShared: ["payment info", "emails"],
        location: "USA",
        locationFlag: "🇺🇸",
        isEU: false,
        status: "compliant",
      },
      {
        name: "Google Analytics",
        icon: "📊",
        dataShared: ["IP", "comportement"],
        location: "USA",
        locationFlag: "🇺🇸",
        isEU: false,
        status: "non-compliant",
      },
      {
        name: "AWS",
        icon: "☁️",
        dataShared: ["toutes données"],
        location: "USA",
        locationFlag: "🇺🇸",
        isEU: false,
        status: "warning",
      },
    ],
    complianceBreakdown: [
      { category: "Minimisation des données", score: 45 },
      { category: "Consentement utilisateur", score: 52 },
      { category: "Sécurité", score: 68 },
      { category: "Transparence", score: 75 },
      { category: "Droits des utilisateurs", score: 82 },
    ],
  };
};

const Index = () => {
  const [currentPage, setCurrentPage] = useState<"analysis" | "results">("analysis");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize dark mode from system preference or localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode !== null) {
      setIsDarkMode(savedMode === "true");
    } else {
      setIsDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
  }, []);

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", String(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const handleAnalysisComplete = useCallback((repoUrl: string, selectedOptions: string[]) => {
    // TODO: Replace with actual API call
    const mockResult = createMockResult(repoUrl);
    setResult(mockResult);
    setCurrentPage("results");
  }, []);

  const handleNewAnalysis = useCallback(() => {
    setCurrentPage("analysis");
    setResult(null);
  }, []);

  if (currentPage === "results" && result) {
    return (
      <ResultsPage 
        result={result} 
        onNewAnalysis={handleNewAnalysis}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />
    );
  }

  return (
    <AnalysisPage 
      onAnalysisComplete={handleAnalysisComplete}
      isDarkMode={isDarkMode}
      toggleDarkMode={toggleDarkMode}
    />
  );
};

export default Index;
