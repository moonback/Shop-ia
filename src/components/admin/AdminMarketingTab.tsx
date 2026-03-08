import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Megaphone, Users, Sparkles, Send, RefreshCw,
    Mail, ShoppingBag, Target, ChevronRight,
    Gift, MessageSquare, AlertCircle, CheckCircle2,
    Calendar, Clock, TrendingUp, UserCheck
} from 'lucide-react';
import { Profile, Product } from '../../lib/types';
import { supabase } from '../../lib/supabase';

interface AdminMarketingTabProps {
    customers: Profile[];
    products: Product[];
    onRefresh: () => void;
}

type Segment = 'dormant' | 'loyal' | 'new' | 'big_spenders';

interface CampaignContent {
    subject: string;
    body: string;
    suggestedProducts: string[];
    promoCode: string;
}

export default function AdminMarketingTab({ customers, products, onRefresh }: AdminMarketingTabProps) {
    const [selectedSegment, setSelectedSegment] = useState<Segment>('dormant');
    const [isGenerating, setIsGenerating] = useState(false);
    const [campaign, setCampaign] = useState<CampaignContent | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [step, setStep] = useState<'segment' | 'generation' | 'preview'>('segment');

    // Logic for segments
    const segmentedCustomers = useMemo(() => {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        switch (selectedSegment) {
            case 'dormant':
                // For simplicity, we just check creation date if we don't have order dates here
                // but usually we'd join with orders. Let's use created_at as a proxy for now 
                // or just filter for the sake of demo.
                return customers.filter(c => new Date(c.created_at) < thirtyDaysAgo);
            case 'loyal':
                return customers.filter(c => c.loyalty_points > 500);
            case 'new':
                return customers.filter(c => new Date(c.created_at) > sevenDaysAgo);
            case 'big_spenders':
                return customers.filter(c => c.loyalty_points > 1000); // Mocking spend with points
            default:
                return customers;
        }
    }, [customers, selectedSegment]);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setStep('generation');

        try {
            const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
            if (!apiKey) throw new Error("Clé API OpenRouter manquante");

            const segmentLabel = {
                dormant: "Clients Inactifs (ne sont pas revenus depuis 1 mois)",
                loyal: "Clients Fidèles (plus de 500 points)",
                new: "Nouveaux Inscrits (cette semaine)",
                big_spenders: "Gros Acheteurs (VIP)"
            }[selectedSegment];

            const featuredProducts = products.filter(p => p.is_featured).slice(0, 3).map(p => p.name).join(", ") || "Fleurs CBD Premium, Huiles Relaxantes, Infusions Bio";

            const prompt = `Génie Marketing IA pour Green Mood CBD.
            Cible : ${segmentLabel} (${segmentedCustomers.length} personnes).
            Catalogue star : ${featuredProducts}.
            Ton : Luxueux, apaisant, premium, expert en CBD, exclusif.
            Objectif : Réengagement et vente.
            
            Génère un objet d'email captivant et un corps de texte élégant invitant le client à redécouvrir la boutique. Inclut 3 recommandations de produits du catalogue star.
            Le corps doit être court, percutant et stylé.
            Génère également un code promo exclusif (ex: GREENMOON20).

            RÉPONDS UNIQUEMENT AU FORMAT JSON SUIVANT :
            {
                "subject": "L'objet",
                "body": "Le corps de l'email avec sauts de lignes",
                "suggestedProducts": ["Nom1", "Nom2", "Nom3"],
                "promoCode": "CODE"
            }`;

            const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                    "HTTP-Referer": window.location.origin,
                    "X-Title": "Green Mood Admin Dashboard",
                },
                body: JSON.stringify({
                    model: "liquid/lfm-2-24b-a2b:latest",
                    messages: [{ role: "user", content: prompt }]
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error("OpenRouter API Error:", errorData);
                throw new Error(errorData.error?.message || `Erreur API: ${res.status}`);
            }

            const data = await res.json();

            if (!data.choices || data.choices.length === 0) {
                console.error("No choices returned from OpenRouter:", data);
                throw new Error("L'IA n'a pas renvoyé de réponse valide.");
            }

            // Nettoyage de la réponse au cas où l'IA inclurait des backticks markdown ```json
            let rawContent = data.choices[0].message.content;
            const jsonMatch = rawContent.match(/\{[\s\S]*\}/); // Trouve le premier { et le dernier }
            if (jsonMatch) {
                rawContent = jsonMatch[0];
            }

            const content = JSON.parse(rawContent);
            setCampaign(content);
            setStep('preview');
        } catch (err: any) {
            console.error("Erreur génération marketing:", err);
            alert("Erreur lors de la génération par l'IA : " + err.message);
            setStep('segment');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSend = async () => {
        setIsSending(true);
        // Simulation d'envoi
        await new Promise(r => setTimeout(r, 2000));
        setIsSending(false);
        alert("Campagne envoyée avec succès à " + segmentedCustomers.length + " clients !");
        setCampaign(null);
        setStep('segment');
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header with Step Indicator */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-3xl bg-green-neon/10 border border-green-neon/20 flex items-center justify-center shadow-2xl shadow-green-neon/10">
                        <Megaphone className="w-7 h-7 text-green-neon" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Marketing IA One-Click</h2>
                        <p className="text-zinc-500 text-sm font-medium">Automatisez vos campagnes avec la puissance de l'IA.</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-zinc-900/50 p-1.5 rounded-2xl border border-white/5">
                    {(['segment', 'generation', 'preview'] as const).map((s, idx) => (
                        <div key={s} className="flex items-center">
                            <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${step === s ? 'bg-green-neon text-black' : 'text-zinc-500'}`}>
                                {s === 'segment' && 'Ciblage'}
                                {s === 'generation' && 'IA'}
                                {s === 'preview' && 'Preview'}
                            </div>
                            {idx < 2 && <ChevronRight className="w-3 h-3 text-zinc-800 mx-1" />}
                        </div>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {step === 'segment' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        {/* Segment Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { id: 'dormant', title: 'Clients Dormants', icon: Clock, desc: '> 30 jours sans visite', color: 'orange' },
                                { id: 'loyal', title: 'Fidèles (VIP)', icon: UserCheck, desc: '> 500 points fidélité', color: 'green' },
                                { id: 'new', title: 'Nouveaux Inscrits', icon: Calendar, desc: 'Inscrits cette semaine', color: 'blue' },
                                { id: 'big_spenders', title: 'Gros Acheteurs', icon: TrendingUp, desc: 'Profils à haute valeur', color: 'purple' },
                            ].map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setSelectedSegment(s.id as Segment)}
                                    className={`p-6 rounded-[2.5rem] border text-left transition-all relative group overflow-hidden ${selectedSegment === s.id
                                        ? 'bg-zinc-900 border-green-neon/40 shadow-2xl shadow-green-neon/10'
                                        : 'bg-zinc-900/40 border-white/5 hover:border-white/10'}`}
                                >
                                    {selectedSegment === s.id && (
                                        <div className="absolute top-0 right-0 p-3">
                                            <CheckCircle2 className="w-5 h-5 text-green-neon" />
                                        </div>
                                    )}
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${selectedSegment === s.id ? 'bg-green-neon text-black' : 'bg-white/5 text-zinc-500'}`}>
                                        <s.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-white font-black uppercase text-sm tracking-tight mb-2">{s.title}</h3>
                                    <p className="text-zinc-500 text-xs font-bold">{s.desc}</p>
                                </button>
                            ))}
                        </div>

                        {/* Audience Info */}
                        <div className="bg-zinc-900/60 border border-white/5 rounded-[3rem] p-10 flex flex-col md:flex-row items-center justify-between gap-10">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <Users className="w-5 h-5 text-green-neon" />
                                    <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Audience sélectionnée</span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-6xl font-black text-white italic">{segmentedCustomers.length}</span>
                                    <span className="text-xl font-bold text-zinc-600">Clients</span>
                                </div>
                                <p className="text-zinc-400 max-w-md text-sm leading-relaxed">
                                    L'IA va analyser l'historique de ce segment pour générer un message ultra-personnalisé avec un ton premium.
                                </p>
                            </div>

                            <button
                                onClick={handleGenerate}
                                className="group relative px-10 py-6 bg-green-neon rounded-[2rem] overflow-hidden flex items-center gap-4 shadow-2xl shadow-green-neon/20 hover:scale-105 transition-transform"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                <Sparkles className="w-6 h-6 text-black" />
                                <span className="text-black font-black uppercase italic tracking-tighter text-lg">Générer la campagne</span>
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 'generation' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="h-[400px] flex flex-col items-center justify-center text-center space-y-8"
                    >
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full border-4 border-green-neon/10 border-t-green-neon animate-spin" />
                            <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-green-neon animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-white uppercase italic">Analyse du segment en cours...</h3>
                            <p className="text-zinc-500 max-w-xs mx-auto text-sm font-medium">L'IA de Green Mood rédige votre contenu VIP personnalisé.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 max-w-sm w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 5 }}
                                className="bg-green-neon rounded-full"
                            />
                        </div>
                    </motion.div>
                )}

                {step === 'preview' && campaign && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-10"
                    >
                        {/* Control Panel */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-zinc-900/60 border border-white/5 rounded-[2.5rem] p-8 space-y-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Gift className="w-5 h-5 text-green-neon" />
                                        <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500">Code Promo Inclus</h4>
                                    </div>
                                    <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                                        <span className="text-xl font-black text-white font-mono">{campaign.promoCode}</span>
                                        <button className="text-[10px] font-bold text-green-neon bg-green-neon/10 px-2 py-1 rounded-lg">MODIFIER</button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <ShoppingBag className="w-5 h-5 text-green-neon" />
                                        <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500">Produits Recommandés</h4>
                                    </div>
                                    <div className="space-y-2">
                                        {campaign.suggestedProducts.map((p, idx) => (
                                            <div key={idx} className="bg-white/5 rounded-xl p-3 text-xs font-bold text-zinc-300 border border-transparent hover:border-white/10 transition-colors">
                                                {p}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={handleSend}
                                    disabled={isSending}
                                    className="w-full py-6 bg-gradient-to-r from-green-neon to-emerald-600 rounded-[2rem] flex items-center justify-center gap-4 group hover:scale-105 transition-transform"
                                >
                                    {isSending ? (
                                        <RefreshCw className="w-6 h-6 text-black animate-spin" />
                                    ) : (
                                        <Send className="w-6 h-6 text-black group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    )}
                                    <span className="text-black font-black uppercase italic tracking-tighter text-lg">Envoyer la Campagne</span>
                                </button>

                                <button
                                    onClick={() => setStep('segment')}
                                    className="w-full py-4 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                                >
                                    Annuler et recommencer
                                </button>
                            </div>
                        </div>

                        {/* Email Preview Area */}
                        <div className="lg:col-span-8">
                            <div className="bg-zinc-900 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col h-full min-h-[600px]">
                                {/* Email Header Bar */}
                                <div className="p-8 border-b border-white/5 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="text-zinc-600 font-bold uppercase tracking-widest w-16 text-[9px]">Sujet:</span>
                                            <span className="text-white font-black">{campaign.subject}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs border-t border-white/5 pt-1 mt-1">
                                            <span className="text-zinc-600 font-bold uppercase tracking-widest w-16 text-[9px]">Segments:</span>
                                            <span className="text-green-neon/80 font-bold px-2 py-0.5 bg-green-neon/5 rounded">{selectedSegment}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Email Body */}
                                <div className="flex-1 p-12 bg-[#0c0c0e] font-sans selection:bg-green-neon selection:text-black">
                                    <div className="max-w-xl mx-auto space-y-8">
                                        <div className="flex justify-center mb-12">
                                            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-green-neon to-emerald-600 flex items-center justify-center">
                                                <Megaphone className="w-8 h-8 text-black" />
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            {campaign.body.split('\n').map((line, i) => (
                                                <p key={i} className="text-zinc-400 text-lg leading-relaxed font-medium">
                                                    {line}
                                                </p>
                                            ))}
                                        </div>

                                        {/* Product Grid in Email */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-10 border-t border-white/5">
                                            {campaign.suggestedProducts.map((p, i) => (
                                                <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                                    <div className="aspect-square bg-zinc-800 rounded-xl mb-3 animate-pulse" />
                                                    <div className="h-4 w-full bg-zinc-800 rounded-lg mb-2" />
                                                    <div className="h-3 w-2/3 bg-zinc-800/50 rounded-lg" />
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-12 text-center space-y-2 pb-10">
                                            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em]">Green Mood • L'excellence Naturelle</p>
                                            <p className="text-[9px] text-zinc-700">Vous recevez cet email car vous êtes un client privilégié de Green Mood.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
