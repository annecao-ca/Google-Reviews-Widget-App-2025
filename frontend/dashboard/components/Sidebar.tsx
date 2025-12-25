"use client";

import { useEffect, useState } from "react";
import { Layout, Plus, Star, Box, Settings } from "lucide-react";

interface Widget {
    id: string;
    businessName: string | null;
    title: string | null;
    placeId: string;
}

export default function Sidebar({
    onSelect,
    activeId,
    BACKEND_URL
}: {
    onSelect: (id: string) => void;
    activeId: string | null;
    BACKEND_URL: string;
}) {
    const [widgets, setWidgets] = useState<Widget[]>([]);

    useEffect(() => {
        fetch(`${BACKEND_URL}/api/widgets`)
            .then(res => res.json())
            .then(data => setWidgets(data.widgets || []))
            .catch(console.error);
    }, [BACKEND_URL, activeId]);

    return (
        <div className="w-72 bg-[#15171c] border-r border-slate-800 text-white min-h-screen p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Star className="text-white w-6 h-6 fill-white" />
                </div>
                <h1 className="text-xl font-black tracking-tighter">REVIEW STUDIO</h1>
            </div>

            <div className="flex-1 overflow-y-auto space-y-8">
                <div>
                    <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-2">My Widgets</h2>
                    <ul className="space-y-1">
                        {widgets.map(w => (
                            <li key={w.id}>
                                <button
                                    onClick={() => onSelect(w.id)}
                                    className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 group ${activeId === w.id
                                        ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20"
                                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
                                        }`}
                                >
                                    <Box className={`w-4 h-4 ${activeId === w.id ? "text-indigo-400" : "text-slate-600 group-hover:text-slate-400"}`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-sm truncate">{w.businessName || w.title || "Untitled Widget"}</div>
                                    </div>
                                </button>
                            </li>
                        ))}
                        {widgets.length === 0 && (
                            <li className="px-4 py-8 text-center bg-slate-800/20 rounded-2xl border border-dashed border-slate-700">
                                <p className="text-slate-500 text-xs font-medium">No widgets yet.</p>
                            </li>
                        )}
                    </ul>
                </div>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-800">
                <button
                    onClick={() => onSelect("")}
                    className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-white hover:bg-slate-100 rounded-2xl text-black font-black text-xs uppercase tracking-widest transition-all transform active:scale-95 shadow-xl shadow-white/5"
                >
                    <Plus className="w-4 h-4 stroke-[3px]" />
                    <span>Create New</span>
                </button>
            </div>
        </div>
    );
}
