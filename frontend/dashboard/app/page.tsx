"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { ReviewSummary, WidgetConfig, WidgetSettings } from "@shared/types";
import {
  LayoutGrid,
  List,
  SquareArrowOutUpRight,
  Palette,
  Layout,
  CheckCircle2,
  Search,
  ChevronRight,
  Sparkles,
  Settings2,
  Code,
  X,
  RefreshCw,
  Copy,
  ExternalLink
} from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_WIDGET_BASE_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

const TEMPLATES = [
  { id: "grid", name: "Modern Grid", icon: LayoutGrid, layout: "grid", description: "Standard grid layout for any page" },
  { id: "carousel", name: "Slider", icon: SquareArrowOutUpRight, layout: "carousel", description: "Interactive carousel for headers" },
  { id: "list", name: "Vertical List", icon: List, layout: "list", description: "Clean list for sidebars or feet" },
  { id: "masonry", name: "Masonry", icon: LayoutGrid, layout: "masonry", description: "Dynamic heights for a natural look" },
  { id: "badge", name: "Rating Badge", icon: Layout, layout: "badge", description: "Compact badge showing your score" },
];

export default function DashboardPage() {
  const [activeWidgetId, setActiveWidgetId] = useState<string | null>(null);
  const [widget, setWidget] = useState<WidgetConfig | null>(null);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSnippet, setShowSnippet] = useState(false);

  // Creation Flow State
  const [step, setStep] = useState<"catalog" | "source" | "editor">("catalog");
  const [selectedTemplate, setSelectedTemplate] = useState<typeof TEMPLATES[0] | null>(null);
  const [query, setQuery] = useState("");

  // Fetch widget and summary
  useEffect(() => {
    if (activeWidgetId) {
      setStep("editor");
      fetch(`${BACKEND_URL}/api/widgets/${activeWidgetId}`)
        .then(res => res.json())
        .then(data => setWidget(data.widget))
        .catch(console.error);

      fetch(`${BACKEND_URL}/api/widgets/${activeWidgetId}/summary`)
        .then(res => res.ok ? res.json() : null)
        .then(data => setSummary(data))
        .catch(() => setSummary(null));
    } else {
      setWidget(null);
      setSummary(null);
      setStep("catalog");
    }
  }, [activeWidgetId]);

  // Polling for summary if empty
  useEffect(() => {
    let interval: any;
    if (activeWidgetId && !summary) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${BACKEND_URL}/api/widgets/${activeWidgetId}/summary`);
          if (res.ok) {
            const data = await res.json();
            setSummary(data);
          }
        } catch (e) {
          console.log("Polling failed");
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [activeWidgetId, !!summary]);

  const handleSync = async () => {
    if (!activeWidgetId) return;
    setSyncing(true);
    try {
      await fetch(`${BACKEND_URL}/api/widgets/${activeWidgetId}/sync`, { method: "POST" });
      const res = await fetch(`${BACKEND_URL}/api/widgets/${activeWidgetId}/summary`);
      if (res.ok) setSummary(await res.json());
    } catch (e) {
      alert("Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const updateSettings = (updates: Partial<WidgetSettings>) => {
    if (!widget) return;
    setWidget({
      ...widget,
      settings: { ...widget.settings, ...updates }
    });
  };

  const handleSaveSettings = async () => {
    if (!widget || !activeWidgetId) return;
    setSaving(true);
    try {
      await fetch(`${BACKEND_URL}/api/widgets/${activeWidgetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: widget.title,
          settings: widget.settings
        })
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!widget || !activeWidgetId) return;
    const timer = setTimeout(() => {
      handleSaveSettings();
    }, 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widget?.settings, widget?.title, activeWidgetId]);

  async function handleCreateWidget() {
    if (!query.trim() || !selectedTemplate) return;
    setCreating(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/widgets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          settings: {
            layout: selectedTemplate.layout,
            theme: "light",
            primaryColor: "#4285F4",
            showHeader: true,
            showRating: true,
            showReviews: true,
            showAiSummary: true,
            showDate: true,
            showAuthorPhoto: true,
            cardStyle: "shadow",
            borderRadius: 12,
            fontSize: 14,
            minRating: 4,
            sortBy: "rating"
          }
        })
      });
      const data = await res.json();
      if (res.ok) {
        setActiveWidgetId(data.widget.id);
      } else {
        alert(data.error || data.hint || "Failed to create widget");
      }
    } catch (e: any) {
      console.error("Create widget error:", e);
      if (BACKEND_URL.includes("localhost")) {
        alert("Error: Backend URL not configured. Please set NEXT_PUBLIC_WIDGET_BASE_URL or NEXT_PUBLIC_BACKEND_URL environment variable on Vercel.");
      } else {
        alert(`Server connection error. Please check if backend is running at ${BACKEND_URL}`);
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex bg-[#050505] min-h-screen text-slate-100 font-sans selection:bg-indigo-500/30 overflow-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,#1e1b4b_0%,transparent_50%)] pointer-events-none opacity-40" />
      <Sidebar
        onSelect={(id) => setActiveWidgetId(id || null)}
        activeId={activeWidgetId}
        BACKEND_URL={BACKEND_URL}
      />

      <main className="flex-1 flex overflow-hidden">
        {step === "catalog" && (
          <div className="flex-1 overflow-y-auto p-12">
            <div className="max-w-4xl mx-auto">
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-white mb-2">Select a Template</h2>
                <p className="text-slate-400">Choose a starting point for your widget. You can customize everything later.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {TEMPLATES.map((tpl, i) => (
                  <button
                    key={tpl.id}
                    onClick={() => {
                      setSelectedTemplate(tpl);
                      setStep("source");
                    }}
                    className={`group relative p-8 rounded-[32px] border transition-all duration-500 text-left overflow-hidden ${selectedTemplate?.id === tpl.id
                      ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.2)]'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                      } ${i === 0 ? 'lg:col-span-2' : ''} active:scale-[0.98]`}
                  >
                    <div className="relative z-10">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${selectedTemplate?.id === tpl.id ? 'bg-indigo-500' : 'bg-slate-800'
                        }`}>
                        <tpl.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{tpl.name}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{tpl.description}</p>
                    </div>
                    {/* Mesh Gradient Decoration */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === "source" && (
          <div className="flex-1 flex flex-col items-center justify-center p-12 bg-[#0f1115]">
            <div className="max-w-2xl w-full">
              <button
                onClick={() => setStep("catalog")}
                className="mb-8 text-sm text-slate-500 hover:text-white flex items-center gap-2 transition-colors"
              >
                ← Back to Templates
              </button>

              <div className="bg-slate-800/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-700 shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center">
                    <Search className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Connect your source</h3>
                    <p className="text-slate-400">Search for your business on Google Maps</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="e.g. Starbucks New York"
                      className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-lg"
                    />
                  </div>
                  <button
                    onClick={handleCreateWidget}
                    disabled={creating || !query.trim()}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
                  >
                    {creating ? "Connecting..." : "Create Widget"}
                    {!creating && <CheckCircle2 className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === "editor" && widget && (
          <div className="flex-1 flex h-full">
            {/* Design Panel */}
            <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-500">Editor</h3>
                {saving && <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />}
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar">
                {/* Section: Layout */}
                <section>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 block">Layout & Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["grid", "carousel", "list", "masonry"].map((l) => (
                      <button
                        key={l}
                        onClick={() => updateSettings({ layout: l as any })}
                        className={`py-3 px-2 rounded-xl border text-xs font-bold capitalize transition-all active:scale-95 ${widget.settings.layout === l
                          ? "bg-indigo-600 border-indigo-500 text-white"
                          : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500"
                          }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Section: Appearance */}
                <section className="space-y-6">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 block">Appearance</label>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Dark Mode</span>
                    <button
                      onClick={() => updateSettings({ theme: widget.settings.theme === 'dark' ? 'light' : 'dark' })}
                      className={`w-10 h-5 rounded-full transition-colors relative active:scale-95 ${widget.settings.theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${widget.settings.theme === 'dark' ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium">Accent Color</span>
                    <div className="flex items-center gap-3 bg-slate-800 p-2 rounded-xl border border-slate-700">
                      <input
                        type="color"
                        value={widget.settings.primaryColor}
                        onChange={(e) => updateSettings({ primaryColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none"
                      />
                      <span className="text-xs font-mono text-slate-400 uppercase">{widget.settings.primaryColor}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-400 font-bold uppercase">
                      <span>Radius</span>
                      <span>{widget.settings.borderRadius}px</span>
                    </div>
                    <input
                      type="range" min="0" max="32"
                      value={widget.settings.borderRadius}
                      onChange={(e) => updateSettings({ borderRadius: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                </section>

                {/* Section: Content */}
                <section className="space-y-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 block">Content</label>
                  {[
                    { label: "AI Review Summary", key: "showAiSummary" },
                    { label: "Header Section", key: "showHeader" },
                    { label: "Star Ratings", key: "showRating" },
                    { label: "Review Date", key: "showDate" },
                    { label: "Profile Photos", key: "showAuthorPhoto" }
                  ].map((item) => (
                    <label key={item.key} className="flex items-center justify-between cursor-pointer group">
                      <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{item.label}</span>
                      <input
                        type="checkbox"
                        checked={(widget.settings as any)[item.key]}
                        onChange={(e) => updateSettings({ [item.key]: e.target.checked })}
                        className="w-5 h-5 rounded-md border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                      />
                    </label>
                  ))}
                </section>

                {/* Section: Filtering */}
                <section className="space-y-4 pt-4 border-t border-slate-800/50">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 block">Review Filtering</label>

                  <div className="space-y-2">
                    <span className="text-sm font-medium">Minimum Rating</span>
                    <select
                      value={widget.settings.minRating || 0}
                      onChange={(e) => updateSettings({ minRating: parseInt(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
                    >
                      <option value="0">All Reviews</option>
                      <option value="4">4 Stars & Above</option>
                      <option value="5">5 Stars Only</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium">Display Priority</span>
                    <select
                      value={widget.settings.sortBy || "recent"}
                      onChange={(e) => updateSettings({ sortBy: e.target.value as "recent" | "rating" })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
                    >
                      <option value="recent">Newest Reviews First</option>
                      <option value="rating">Highest Rated First</option>
                    </select>
                  </div>
                </section>
              </div>

              {/* Publish Button */}
              <div className="p-6 bg-slate-900/40 backdrop-blur-md border-t border-slate-800/50">
                <button
                  onClick={() => setShowSnippet(true)}
                  className="w-full bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] py-4 rounded-2xl hover:bg-indigo-500 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                  <Code className="w-4 h-4" /> Get Snippet
                </button>
              </div>
            </aside>

            {/* Preview Canvas */}
            <section className="flex-1 flex flex-col bg-[#08090a]">
              <div className="h-16 px-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/20 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                    <h2 className="text-sm font-bold text-slate-300">Preview: {widget.businessName}</h2>
                  </div>
                  <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold transition-all disabled:opacity-50 active:scale-95"
                  >
                    <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Syncing...' : 'Refresh Data'}
                  </button>
                </div>
                <div className="flex gap-2">
                  <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700/50 text-slate-100 font-sans">
                    <button className="px-4 py-1.5 text-xs font-bold text-white bg-slate-700/80 rounded-lg shadow-lg active:scale-95">Desktop</button>
                    <button className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors active:scale-95">Mobile</button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-12 flex justify-center items-start pattern-dots pb-24">
                <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
                  <WidgetPreview
                    widget={widget}
                    summary={summary}
                    backendUrl={BACKEND_URL}
                  />
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {showSnippet && activeWidgetId && (
        <SnippetModal
          id={activeWidgetId}
          onClose={() => setShowSnippet(false)}
          backendUrl={BACKEND_URL}
        />
      )}
    </div>
  );
}

function SnippetModal({ id, onClose, backendUrl }: { id: string, onClose: () => void, backendUrl: string }) {
  const code = `
<div id="review-studio-widget"></div>
<script src="${backendUrl}/widget.js" async></script>
<script
  defer
  src="${backendUrl}/embed.js"
  data-container-id="review-studio-widget"
  data-backend="${backendUrl}"
  data-widget-id="${id}">
</script>`.trim();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    alert("Snippet copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Code className="text-white w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black">Add to your website</h3>
              <p className="text-slate-400 text-sm">Copy and paste this snippet into your HTML</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-800 rounded-2xl transition-colors">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="relative group">
            <pre className="bg-black/50 p-6 rounded-2xl border border-slate-800 text-indigo-400 font-mono text-sm overflow-x-auto leading-relaxed">
              {code}
            </pre>
            <button
              onClick={copyToClipboard}
              className="absolute top-4 right-4 bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 group-hover:scale-110 active:scale-95"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-2xl flex gap-4">
            <div className="text-amber-500 shrink-0 mt-1">⚠️</div>
            <p className="text-sm text-amber-200/80 leading-relaxed">
              <strong>Tip:</strong> You should place the container <code>div</code> where you want the widget to appear, and the scripts usually go at the end of the <code>&lt;body&gt;</code> tag.
            </p>
          </div>
        </div>

        <div className="p-8 bg-slate-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function WidgetPreview({ widget, summary }: { widget: WidgetConfig, summary: ReviewSummary | null, backendUrl: string }) {
  const { settings } = widget;
  if (!summary) return <div className="text-slate-700 italic text-center py-40 font-medium">Feeding reviews to AI...</div>;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const dx = x - xc;
    const dy = y - yc;
    card.style.setProperty('--rx', `${dy / -20}deg`);
    card.style.setProperty('--ry', `${dx / 20}deg`);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  };

  return (
    <div className={`p-widget rounded-[40px] shadow-[0_48px_128px_-32px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-700 ${settings.theme === 'dark' ? 'bg-[#0f1115]' : 'bg-white'}`}
      style={{
        "--gwr-primary": settings.primaryColor,
        "--gwr-radius": `${settings.borderRadius}px`,
        color: settings.theme === 'dark' ? '#f5f5f5' : '#1a1a1b',
        perspective: '1000px'
      } as any}>

      <style dangerouslySetInnerHTML={{
        __html: `
        .p-widget { font-family: 'Outfit', 'Inter', system-ui, sans-serif; }
        .p-header { padding: 40px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid ${settings.theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'}; }
        .p-stars { display: flex; gap: 3px; }
        .p-write-btn { padding: 14px 28px; background: var(--gwr-primary); color: white; border-radius: var(--gwr-radius); font-weight: 800; font-size: 14px; box-shadow: 0 8px 16px var(--gwr-primary)30; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .p-write-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 24px var(--gwr-primary)50; }
        .p-ai-summary { margin: 40px; padding: 32px; background: linear-gradient(135deg, var(--gwr-primary)15 0%, transparent 100%); border-radius: var(--gwr-radius); border: 1px solid var(--gwr-primary)20; position: relative; overflow: hidden; }
        .p-ai-summary::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at top right, var(--gwr-primary)10, transparent 70%); }
        .p-ai-badge { display: flex; align-items:center; gap: 8px; padding: 6px 14px; background: var(--gwr-primary); color: white; border-radius: 40px; font-size: 11px; font-weight: 900; text-transform: uppercase; margin-bottom: 16px; width: fit-content; letter-spacing: 0.05em; }
        .p-reviews-grid { 
          padding: 40px; 
          display: ${settings.layout === 'carousel' ? 'flex' : 'grid'}; 
          grid-template-columns: ${settings.layout === 'grid' || settings.layout === 'masonry' ? 'repeat(auto-fill, minmax(320px, 1fr))' : '1fr'};
          gap: 32px; 
          overflow-x: ${settings.layout === 'carousel' ? 'auto' : 'visible'};
          scrollbar-width: none;
        }
        .p-card { 
          padding: 32px; border-radius: var(--gwr-radius); 
          background: ${settings.theme === 'dark' ? '#161920' : '#fff'}; 
          border: 1px solid ${settings.theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f0f0f0'};
          ${settings.cardStyle === 'shadow' ? 'box-shadow: 0 20px 40px rgba(0,0,0,0.04);' : ''}
          ${settings.cardStyle === 'outline' ? 'border: 2px solid var(--gwr-primary)20;' : ''}
          ${settings.layout === 'carousel' ? 'flex: 0 0 340px;' : ''}
          transition: transform 0.15s ease-out, box-shadow 0.3s;
          transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
          transform-style: preserve-3d;
        }
        .p-card:hover { 
          box-shadow: 0 32px 64px rgba(0,0,0,0.15);
          z-index: 10;
        }
        .p-author-img { width: 52px; height: 52px; border-radius: 50%; border: 3px solid ${settings.theme === 'dark' ? '#1c1f26' : '#fff'}; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .p-verified { color: #4285F4; }
        .p-text { font-size: 16px; line-height: 1.7; color: ${settings.theme === 'dark' ? '#adb5bd' : '#495057'}; margin-top: 20px; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; transform: translateZ(20px); }
        .p-date { font-size: 13px; color: ${settings.theme === 'dark' ? '#6c757d' : '#adb5bd'}; }
        .pattern-dots { background-image: radial-gradient(rgba(255,255,255,0.05) 1.5px, transparent 1.5px); background-size: 32px 32px; }
      `}} />

      <div className="p-widget">
        {settings.showHeader && (
          <header className="p-header">
            <div className="flex items-center gap-8">
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-xl border border-slate-100 transform -rotate-3 transition-transform hover:rotate-0">
                <svg viewBox="0 0 24 24" width="36" height="36">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </div>
              <div>
                <h4 className="m-0 font-black text-3xl tracking-tight leading-none mb-2">{widget.title}</h4>
                <div className="flex items-center gap-4">
                  {settings.showRating && (
                    <>
                      <span className="font-black text-2xl text-amber-400">{summary.averageRating.toFixed(1)}</span>
                      <div className="p-stars">{renderLargeStars(summary.averageRating)}</div>
                    </>
                  )}
                  <span className="text-xs uppercase font-black tracking-widest opacity-30">({summary.totalReviews} Reviews)</span>
                </div>
              </div>
            </div>
            <div className="p-write-btn">Write a review</div>
          </header>
        )}

        {settings.showAiSummary && summary.recentInsights.length > 0 && (
          <div className="p-ai-summary">
            <div className="p-ai-badge"><Sparkles className="w-3.5 h-3.5" /> AI Analysis</div>
            <p className="m-0 text-xl font-bold leading-tight tracking-tight text-white/90">{summary.recentInsights[0].summary}</p>
          </div>
        )}

        <div className="p-reviews-grid">
          {summary.reviews.slice(0, 8).map(r => (
            <div
              key={r.id}
              className="p-card"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div className="flex justify-between items-start" style={{ transform: 'translateZ(30px)' }}>
                <div className="flex gap-4 items-center">
                  {settings.showAuthorPhoto && (
                    <img src={r.profilePhotoUrl || "https://www.gravatar.com/avatar/000?d=mp"} className="p-author-img" />
                  )}
                  <div>
                    <div className="font-black text-base flex items-center gap-1.5 mb-0.5">
                      {r.authorName}
                      <CheckCircle2 className="p-verified w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-stars">{renderStars(r.rating)}</div>
                      {settings.showDate && <span className="p-date opacity-50">• {new Date(r.time * 1000).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </div>
                <div className="opacity-10 scale-150 transform transition-transform group-hover:scale-175 grayscale">
                  <svg viewBox="0 0 24 24" width="20" height="20"><path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" /><path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                </div>
              </div>
              <p className="p-text">{r.text || "Highly recommended business!"}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function renderStars(rating: number) {
  let stars = [];
  for (let i = 1; i <= 5; i++) {
    const fill = i <= Math.floor(rating) ? "#FFC107" : "rgba(255,255,255,0.05)";
    stars.push(
      <svg key={i} viewBox="0 0 24 24" width="12" height="12" fill={fill}>
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    );
  }
  return stars;
}

function renderLargeStars(rating: number) {
  let stars = [];
  for (let i = 1; i <= 5; i++) {
    const fill = i <= Math.floor(rating) ? "#FFC107" : "rgba(255,255,255,0.05)";
    stars.push(
      <svg key={i} viewBox="0 0 24 24" width="24" height="24" fill={fill}>
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    );
  }
  return stars;
}
