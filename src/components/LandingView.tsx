import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  BrainCircuit, 
  ArrowRight, 
  Layers, 
  AlertCircle,
  Database,
  Cpu,
  Eye,
  CheckCircle2,
  FileText,
  Lightbulb,
  Compass,
  KeyRound,
  TrendingUp,
  Award,
  ChevronRight,
  ExternalLink,
  Shield,
  Briefcase
} from 'lucide-react';
import { signInWithGoogle, signInAsGuest } from '../lib/firebase';

interface LandingViewProps {
  onAuthenticated: () => void;
}

interface ClientScenario {
  id: string;
  category: string;
  title: string;
  promptSnippet: string;
  geminiPreview: string;
  icon: React.ReactNode;
  accent: string;
}

const CLIENT_SCENARIOS: ClientScenario[] = [
  {
    id: 'strategy',
    category: 'Executive Strategy',
    title: 'Q3 Enterprise Expansion & Risk Blindspot Audit',
    promptSnippet: "We are considering expanding our B2B SaaS into EMEA with an on-premise hybrid option. What are the key operational vulnerabilities and pricing model blindspots?",
    geminiPreview: "### Strategic EMEA Expansion Assessment\n\n1. **Regulatory Data Sovereignty**: GDPR Chapter V compliance requires localized EU data partitions; hybrid on-prem deployments reduce liability but increase deployment cycles by ~3.2x.\n2. **Pricing Distortion**: Avoid discounting perpetual licenses; anchor around an enterprise compliance surcharge.\n3. **Recommended Action**: Pilot with 2 tier-1 reference clients under strict sandbox SLAs before broad release.",
    icon: <Briefcase className="w-4 h-4 text-amber-400" />,
    accent: 'border-amber-500/40 bg-amber-500/10 text-amber-300'
  },
  {
    id: 'client-prep',
    category: 'Client Advisory',
    title: 'High-Stakes Client Proposal & Value Proposition Polish',
    promptSnippet: "Our team is presenting an AI operational redesign proposal to an enterprise client. Help me sharpen the opening hook to address executive burnout and ROI defensibility.",
    geminiPreview: "### Executive Proposal Framing\n\n* **The Opening Hook**: \"Most digital transformations fail because they automate outdated workflows. We redesign the decision loop itself—freeing 200+ executive hours per quarter.\"\n* **ROI Metric**: Target payback milestone within 90 days via automated Firestore intelligence pipelines.\n* **Client Takeaway**: Position this not as software, but as institutional cognitive insurance.",
    icon: <Lightbulb className="w-4 h-4 text-sky-400" />,
    accent: 'border-sky-500/40 bg-sky-500/10 text-sky-300'
  },
  {
    id: 'synthesis',
    category: 'Board Reporting',
    title: 'Post-Call Executive Synthesis & Action Delegation',
    promptSnippet: "Here are notes from our 2-hour strategic advisory session with our tier-1 enterprise partner. Summarize the 3 key agreements and identify who owns what by Friday.",
    geminiPreview: "### 3 Executive Agreements\n\n1. **Unified API Gateway**: Approved architecture; server-side token isolation validated.\n2. **Pilot Timeline**: Launch scheduled for October 1st with 50 selected seats.\n3. **Accountability Matrix**:\n   * *VP Engineering*: Complete Firestore security rules audit.\n   * *Client Lead*: Sign off on data residency addendum by EOD Friday.",
    icon: <FileText className="w-4 h-4 text-emerald-400" />,
    accent: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
  }
];

export const LandingView: React.FC<LandingViewProps> = ({ onAuthenticated }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [vaultTab, setVaultTab] = useState<'signin' | 'preview'>('signin');
  const [activeScenario, setActiveScenario] = useState<ClientScenario>(CLIENT_SCENARIOS[0]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      await signInWithGoogle();
      onAuthenticated();
    } catch (err: any) {
      console.warn("Sign-in warning:", err);
      if (err?.code === 'auth/popup-blocked' || err?.message?.includes('popup')) {
        setErrorMsg("The sign-in popup was blocked by browser sandbox settings. You can open the app in a new browser tab or explore immediately with the Private Session mode below.");
      } else if (err?.code === 'auth/unauthorized-domain') {
        setErrorMsg("This domain is awaiting Firebase Auth configuration. You may explore with the Private Session mode below.");
      } else {
        setErrorMsg(err?.message || "Authentication attempt failed. Please retry.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      await signInAsGuest();
      onAuthenticated();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to initialize private session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* Background Decorative Gradients & Mesh */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.08),rgba(255,255,255,0))] pointer-events-none z-0" />
      <div className="fixed top-1/4 left-1/3 w-[650px] h-[650px] bg-amber-500/5 rounded-full blur-[170px] pointer-events-none z-0" />
      <div className="fixed bottom-1/4 right-1/4 w-[650px] h-[650px] bg-sky-500/5 rounded-full blur-[170px] pointer-events-none z-0" />

      {/* Top Navbar */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-800/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-amber-400 shadow-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-semibold text-base tracking-tight text-white flex items-center gap-2">
              ReflectAI <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/30 text-amber-400">Enterprise</span>
            </span>
            <p className="text-[11px] text-slate-400">Executive Cognitive Sanctuary &amp; Decision Vault</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-900/80 text-slate-300 border border-slate-800 backdrop-blur-md">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              Gemini 3.6 Flash
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Firestore Protected
            </span>
          </div>

          <button
            onClick={handleGuestSignIn}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-medium transition-all cursor-pointer hover:text-white"
          >
            <span>Live Sandbox</span>
            <ArrowRight className="w-3 h-3 text-amber-400" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 flex flex-col items-center justify-center flex-1 gap-14">
        
        {/* Section 1: Hero & Strategic Proposition */}
        <div className="w-full max-w-4xl text-center mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/70 text-slate-300 text-xs font-medium shadow-lg mb-5 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Executive Strategy &bull; Multi-Turn AI Reflection &bull; Cloud Firestore Vault</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white leading-[1.15]">
            Transform strategic complexity into <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">crystal clarity</span>.
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            An executive-grade cognitive vault built for founders, advisors, and high-impact teams to formulate decisions, interrogate blind spots, and synthesize insights.
          </p>

          {/* Key Executive Trust Metrics Bar */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <p className="text-xl font-bold text-amber-400 font-mono">100%</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Isolated Firestore Privacy</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <p className="text-xl font-bold text-sky-400 font-mono">&lt; 850ms</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Gemini 3.6 Flash Inference</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <p className="text-xl font-bold text-emerald-400 font-mono">Multi-Turn</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Cognitive Memory Engine</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <p className="text-xl font-bold text-purple-400 font-mono">Zero</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Passwords Stored</p>
            </div>
          </div>
        </div>

        {/* Section 2: Dual Grid - [ Live Client Solutions Showcase ] + [ Secure Vault Entrance ] */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Interactive Client Scenarios Showcase (Attracts Clients!) */}
          <div className="lg:col-span-7 bg-slate-900/70 backdrop-blur-2xl border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-400/40 to-transparent" />
            
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-sky-400" />
                  <h2 className="text-sm font-semibold text-slate-200">Interactive Client Scenarios</h2>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                  Select a workflow
                </span>
              </div>

              {/* Scenario Selector Pills */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {CLIENT_SCENARIOS.map((scenario) => {
                  const isActive = activeScenario.id === scenario.id;
                  return (
                    <button
                      key={scenario.id}
                      onClick={() => setActiveScenario(scenario)}
                      className={`p-2.5 rounded-xl text-left transition-all cursor-pointer border flex flex-col gap-1 ${
                        isActive
                          ? `${scenario.accent} shadow-md`
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {scenario.icon}
                        <span className="text-xs font-semibold truncate">{scenario.category}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 truncate hidden sm:inline">
                        {scenario.title}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Live Preview of Selected Scenario */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                  <span className="font-semibold text-slate-200 truncate flex items-center gap-1.5">
                    {activeScenario.icon}
                    {activeScenario.title}
                  </span>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/40">
                    Live Demo
                  </span>
                </div>

                {/* User Input Mockup */}
                <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block mb-1">
                    Client Strategic Prompt:
                  </span>
                  <p className="text-xs text-slate-200 italic leading-relaxed">
                    "{activeScenario.promptSnippet}"
                  </p>
                </div>

                {/* Gemini Model Output Mockup */}
                <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-400">
                      Gemini 3.6 Flash Synthesis:
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1.5 leading-relaxed font-sans prose prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-xs text-slate-300 bg-transparent p-0 m-0">
                      {activeScenario.geminiPreview}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Quick Test CTA */}
            <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                Experience this in the live executive workspace:
              </span>
              <button
                onClick={handleGuestSignIn}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-all shadow-md cursor-pointer active:scale-95"
              >
                <span>Launch this Scenario</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right: Authentication Vault Card with Neat Tabbed Preview */}
          <div className="lg:col-span-5 bg-slate-900/80 backdrop-blur-2xl border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/60 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

            <div>
              {/* Card Top Segmented Switcher: [ Vault Access ] [ Live Vault Preview ] */}
              <div className="flex items-center justify-between gap-2 pb-5 mb-5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <h2 className="text-sm font-semibold text-slate-200">
                    {vaultTab === 'signin' ? 'Authentication Vault' : 'Live Vault Preview'}
                  </h2>
                </div>

                <div className="flex items-center bg-slate-950/80 border border-slate-800 p-1 rounded-xl">
                  <button
                    id="vault-tab-signin"
                    onClick={() => setVaultTab('signin')}
                    className={`text-xs px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                      vaultTab === 'signin'
                        ? 'bg-slate-800 text-amber-300 border border-slate-700 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    id="vault-tab-preview"
                    onClick={() => setVaultTab('preview')}
                    className={`flex items-center gap-1 text-xs px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                      vaultTab === 'preview'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Eye className="w-3 h-3 text-amber-400" />
                    <span>Live Preview</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: Sign In Mode */}
              {vaultTab === 'signin' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Client conversations and strategic entries are strictly isolated to your authenticated account via Cloud Firestore rules.
                  </p>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-800/60 text-amber-200 text-xs flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{errorMsg}</span>
                    </div>
                  )}

                  {/* Primary Google Sign In Button */}
                  <button
                    id="google-sign-in-button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-medium text-sm transition-all shadow-md cursor-pointer active:scale-[0.99] disabled:opacity-60"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                      />
                    </svg>
                    <span>{loading ? "Connecting to Vault..." : "Sign In with Google"}</span>
                  </button>

                  <div className="relative my-3 text-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-800" />
                    </div>
                    <span className="relative px-3 bg-slate-900 text-slate-500 text-xs">
                      or instant client preview
                    </span>
                  </div>

                  {/* Instant Guest / Private Preview Session */}
                  <button
                    id="guest-session-button"
                    onClick={handleGuestSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/80 text-xs font-semibold transition-all cursor-pointer shadow-sm hover:text-white"
                  >
                    <span>Launch Instant Client Session</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                </div>
              )}

              {/* TAB 2: Live Vault Preview Mode */}
              {vaultTab === 'preview' && (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Interactive Vault Structure
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                        Encrypted
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span className="font-medium text-slate-200 truncate">Deep Thought &amp; Clarity Audit</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">4 turns</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-3.5 h-3.5 text-sky-400" />
                          <span className="font-medium text-slate-200 truncate">Q3 Strategic Roadmap Brainstorm</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">6 turns</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Compass className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="font-medium text-slate-200 truncate">Executive Synthesis &amp; Action Steps</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-mono">Synced</span>
                      </div>
                    </div>
                  </div>

                  {/* Instant Entry CTA */}
                  <button
                    onClick={handleGuestSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <span>Enter Your Vault Experience Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Security & Architecture Guarantees */}
            <div className="mt-5 pt-4 border-t border-slate-800/70 grid grid-cols-2 gap-3 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                <span>Gemini 3.6 Flash</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>Firestore Rule Isolated</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-sky-400" />
                <span>Zero Password Storage</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Client Vault Security</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Enterprise Client Privacy & Architecture Pillars */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-3">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">Owner-Bound Data Isolation</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Every journal entry and Gemini turn is secured under Cloud Firestore security rules matching <code className="text-amber-400 font-mono">request.auth.uid == userId</code>. No cross-tenant access.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <div className="w-8 h-8 rounded-lg bg-sky-400/10 border border-sky-400/30 flex items-center justify-center text-sky-400 mb-3">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">4-Tier Model Fallback Ladder</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              High-availability resilient routing across Gemini 3.6 Flash, Flash-Lite, and 3.7 Flash ensures zero disruption during critical executive sessions.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <div className="w-8 h-8 rounded-lg bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 mb-3">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">Continuous Cognitive Memory</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Maintains full multi-turn conversational context with auto-titled summaries, pin management, and real-time cloud synchronization.
            </p>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <span>&copy; 2026 ReflectAI Enterprise &bull; Strategic Cognitive Sanctuary &bull; Built with Gemini 3.6 Flash</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Lock className="w-3 h-3 text-emerald-400" /> Cloud Firestore Encrypted
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <BrainCircuit className="w-3 h-3 text-amber-400" /> Multi-Turn AI Memory
          </span>
        </div>
      </footer>
    </div>
  );
};
