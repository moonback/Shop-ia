import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Leaf, Mic, RefreshCw, ShoppingCart, ChevronRight, Sparkles, RotateCcw, Clock, CheckCircle2, Share2, Copy, Gift, SendHorizontal, History, ArrowLeft, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Product } from '../lib/types';
import { getBudTenderSettings, BudTenderSettings, BUDTENDER_DEFAULTS } from '../lib/budtenderSettings';
import { getCachedProducts, getCachedSettings } from '../lib/budtenderCache';
import { useCartStore } from '../store/cartStore';
import { useBudTenderMemory } from '../hooks/useBudTenderMemory';
import { BudTenderWidget, BudTenderMessage, BudTenderTypingIndicator, BudTenderFeedback } from './budtender-ui';
import VoiceAdvisor from './VoiceAdvisor';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import { useBudTenderQuiz } from '../hooks/useBudTenderQuiz';
import { useBudTenderChat } from '../hooks/useBudTenderChat';

// ─── Shared types and logic imported ───

import {
    TerpeneChip,
    TERPENE_CHIPS,
    Answers,
    Message
} from '../lib/budtenderHelpers';

// ─── Header components ───────────────────────────────────────────────────────

function HeaderAction({ icon, title, onClick, isActive, label }: { icon: React.ReactNode; title: string; onClick: () => void; isActive?: boolean; label: string }) {
    return (
        <button
            onClick={onClick}
            title={title}
            className={`
                flex flex-col items-center justify-center gap-1.5 px-3 py-2 rounded-xl transition-all group
                ${isActive ? 'bg-green-neon text-black shadow-[0_0_15px_rgba(57,255,20,0.3)]' : 'text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10'}
            `}
        >
            <div className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'scale-110' : ''}`}>
                {icon}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest hidden sm:block ${isActive ? 'text-black' : 'text-zinc-600 group-hover:text-zinc-400 font-bold'}`}>
                {label}
            </span>
        </button>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BudTender() {
    const globalSettings = useSettingsStore((s) => s.settings);
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [stepIndex, setStepIndex] = useState(-1);
    const [answers, setAnswers] = useState<Answers>({});
    const [products, setProducts] = useState<Product[]>([]);
    const [pulse, setPulse] = useState(false);
    // Terpene multi-select state
    const [terpeneSelection, setTerpeneSelection] = useState<string[]>([]);
    const [awaitingTerpene, setAwaitingTerpene] = useState(false);
    // Ambassador state
    const [hasShared, setHasShared] = useState(false);
    const [showPromoTooltip, setShowPromoTooltip] = useState(false);
    // Free chat input
    const [chatInput, setChatInput] = useState('');
    const [settings, setSettings] = useState<BudTenderSettings>(BUDTENDER_DEFAULTS);
    // Voice advisor overlay
    const [isVoiceOpen, setIsVoiceOpen] = useState(false);
    // Shrink state for "viewing product"
    const [isShrink, setIsShrink] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    const addItem = useCartStore((s) => s.addItem);
    const cartItems = useCartStore((s) => s.items);
    const openSidebar = useCartStore((s) => s.openSidebar);
    const scrollRef = useRef<HTMLDivElement>(null);
    const hasTriedLoad = useRef(false);

    const memory = useBudTenderMemory();
    const { logQuestion } = memory;

    // Load admin settings from DB when opening (cached)
    useEffect(() => {
        if (isOpen) {
            getCachedSettings().then(setSettings);
        }
    }, [isOpen]);

    // Initial product load (cached)
    useEffect(() => {
        getCachedProducts().then(setProducts);

        // Use delay from settings
        const currentSettings = getBudTenderSettings();
        if (currentSettings.pulse_delay > 0) {
            const t = setTimeout(() => setPulse(true), currentSettings.pulse_delay * 1000);
            return () => clearTimeout(t);
        }
    }, []);

    // Auto-scroll AND Save chat history to local memory
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
        // Save current messages to persistent storage
        if (messages.length > 0) {
            memory.saveChatHistory(messages as any);
        }
    }, [messages, isTyping]);

    // Load persisted chat history on mount (only once)
    useEffect(() => {
        if (!hasTriedLoad.current && memory.chatHistory.length > 0 && messages.length === 0) {
            setMessages(memory.chatHistory as any);
            hasTriedLoad.current = true;
        } else if (memory.chatHistory.length === 0) {
            hasTriedLoad.current = true;
        }
    }, [memory.chatHistory, messages.length]);

    // ── Message helpers ──────────────────────────────────────────────────────

    const addBotMessage = useCallback((msg: Partial<Message>, delay?: number) => {
        setIsTyping(true);

        // Use speed from settings
        let baseDelay = 1000;
        if (settings.typing_speed === 'fast') baseDelay = 400;
        if (settings.typing_speed === 'slow') baseDelay = 2000;

        const ms = delay ?? (baseDelay + Math.random() * (baseDelay / 2));
        setTimeout(() => {
            setMessages((prev) => [...prev, {
                id: Math.random().toString(36).substring(7),
                sender: 'bot',
                ...msg
            }]);
            setIsTyping(false);
        }, ms);
    }, [settings.typing_speed]);

    const addUserMessage = useCallback((text: string) => {
        setMessages((prev) => [...prev, {
            id: Math.random().toString(36).substring(7),
            sender: 'user',
            text,
        }]);
    }, []);

    // ── Welcome flow ─────────────────────────────────────────────────────────

    const buildWelcomeMessages = () => {
        const { isLoggedIn, userName, pastProducts, restockCandidates, savedPrefs } = memory;
        const cartItems = useCartStore.getState().items;
        const currentPath = window.location.pathname;

        // 1) Greeting
        let greeting: string;
        if (!isLoggedIn) {
            greeting = settings.welcome_message;
        } else if (pastProducts.length > 0) {
            const last = pastProducts[0];
            greeting = `Content de te revoir${userName ? `, ${userName}` : ''} ! 👋 La dernière fois tu avais commandé **${last.product_name}** — tu l'as apprécié ? Je suis là pour te trouver quelque chose d'encore mieux.`;
        } else {
            greeting = `Bienvenue${userName ? `, ${userName}` : ''} ! 🌿 Je suis BudTender, votre conseiller CBD de confiance chez Green Mood. Prêt à découvrir votre sélection idéale ?`;
        }

        // Push greeting first
        addBotMessage({ text: greeting }, 600);

        // 2) Proactive Recommendations (Task 15)
        setTimeout(() => {
            if (cartItems.length === 0 && currentPath.includes('/catalogue')) {
                addBotMessage({
                    text: "Je vois que votre panier est encore vide ! 🛒 Souhaitez-vous que je vous guide vers nos best-sellers du moment ?",
                    isOptions: true,
                    stepId: 'proactive',
                    options: [{ label: "Oui, conseiller moi ✨", value: "start_quiz", emoji: "✨" }, { label: "Plus tard", value: "later", emoji: "⏳" }]
                }, 400);
            } else if (currentPath.includes('/catalogue/') && cartItems.length > 0) {
                addBotMessage({
                    text: "Excellent choix ! 🌿 Saviez-vous que ce produit se marie parfaitement avec l'une de nos huiles sublinguales pour un effet renforcé ?",
                    isOptions: true,
                    stepId: 'proactive',
                    options: [{ label: "En savoir plus", value: "upsell_info", emoji: "💡" }, { label: "Non merci", value: "later", emoji: "✖️" }]
                }, 400);
            }
        }, 1200);

        // 3) Restock reminders (delayed, one per candidate)
        restockCandidates.forEach((candidate, i) => {
            setTimeout(() => {
                setMessages((prev) => [...prev, {
                    id: Math.random().toString(36).substring(7),
                    sender: 'bot',
                    type: 'restock',
                    text: `Il y a ${candidate.daysSince} jours que tu as commandé ce produit — il est peut-être temps de renouveler ? 🔄`,
                    restockProduct: candidate,
                }]);
            }, 2000 + i * 600);
        });

        // 4) Skip-quiz option if saved prefs exist
        if (savedPrefs) {
            const delay = 2000 + restockCandidates.length * 600 + 400;
            setTimeout(() => {
                setMessages((prev) => [...prev, {
                    id: Math.random().toString(36).substring(7),
                    sender: 'bot',
                    type: 'skip-quiz',
                    text: `Je me souviens de tes préférences ! Veux-tu que je te génère de nouvelles recommandations directement, ou préfères-tu refaire le quiz ?`,
                }]);
            }, delay);
        }
    };

    const handleOpen = () => {
        setPulse(false);
        setIsOpen(true);
        setIsShrink(false);
        if (messages.length === 0) {
            buildWelcomeMessages();
        }
    };

    // ── Quiz flow ────────────────────────────────────────────────────────────

    const {
        startQuiz,
        skipQuizAndRecommend,
        handleAnswer,
        confirmTerpeneSelection,
    } = useBudTenderQuiz({
        settings,
        products,
        messages,
        answers,
        stepIndex,
        terpeneSelection,
        memory,
        setStepIndex,
        setAnswers,
        setAwaitingTerpene,
        setTerpeneSelection,
        setIsTyping,
        setMessages,
        addBotMessage,
        addUserMessage,
    });

    const reset = () => {
        memory.clearChatHistory();
        setMessages([]);
        setStepIndex(-1);
        setAnswers({});
        setTerpeneSelection([]);
        setAwaitingTerpene(false);
        setHasShared(false);
        setTimeout(() => buildWelcomeMessages(), 100);
    };

    const handleShare = async () => {
        const shareData = {
            title: 'Green Mood CBD — Mon diagnostic BudTender',
            text: 'Je viens de faire mon diagnostic CBD avec BudTender IA Chez Green Mood ! Découvrez vos produits idéaux ici :',
            url: window.location.origin,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                setHasShared(true);
            } else {
                await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
                setHasShared(true);
                alert("Lien copié dans le presse-papier ! Partagez-le pour débloquer votre code.");
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    const copyPromoCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setShowPromoTooltip(true);
        setTimeout(() => setShowPromoTooltip(false), 2000);
    };

    const handleSendMessage = useBudTenderChat({
        chatInput,
        isTyping,
        settings,
        messages,
        products,
        memory,
        setChatInput,
        setIsTyping,
        setMessages,
        addUserMessage,
        addBotMessage,
        addItem,
        openSidebar,
        logQuestion,
    });

    // ─── Render helpers ─────────────────────────────────────────────────────

    // Determines if the welcome CTA (start quiz button) should be visible
    const showStartButton = stepIndex === -1 && !isTyping
        && messages.length > 0
        && !messages.some(m => m.type === 'skip-quiz' || m.type === 'restock' || m.isOptions || settings.quiz_steps.some(s => s.question === m.text));

    const showSkipQuizActions = messages.some(m => m.type === 'skip-quiz')
        && stepIndex === -1
        && !isTyping
        && !messages.some(m => m.isOptions || m.isResult);

    return (
        <>
            {/* ── Floating button / Expand button ── */}
            <AnimatePresence>
                {isOpen && !isShrink ? null : ((globalSettings?.budtender_chat_enabled ?? true) || (globalSettings?.budtender_voice_enabled ?? true)) && (
                    <BudTenderWidget
                        onClick={() => {
                            if (isShrink) {
                                setIsShrink(false);
                            } else if (globalSettings?.budtender_chat_enabled !== false) {
                                setIsOpen(true);
                            } else if (globalSettings?.budtender_voice_enabled !== false) {
                                // If chat disabled but voice enabled, click opens voice
                                setIsVoiceOpen(true);
                            }
                        }}
                        isChatEnabled={globalSettings?.budtender_chat_enabled ?? true}
                        onVoiceClick={(globalSettings?.budtender_voice_enabled ?? true) ? () => {
                            if (isVoiceOpen) {
                                setIsVoiceOpen(false);
                            } else {
                                setIsVoiceOpen(true);
                                // Start in background
                            }
                        } : undefined}
                        isVoiceActive={isVoiceOpen}
                        pulse={pulse}
                        mode={isShrink ? 'expand' : 'default'}
                    />
                )}
            </AnimatePresence>

            {/* ── Voice Advisor — floating panel, site stays accessible ── */}
            <VoiceAdvisor
                products={products}
                pastProducts={memory.pastProducts}
                savedPrefs={memory.savedPrefs}
                userName={memory.userName}
                isOpen={isVoiceOpen}
                cartItems={cartItems}
                onClose={() => setIsVoiceOpen(false)}
                onHangup={() => setIsVoiceOpen(false)}
                onAddItem={(product, quantity) => {
                    addItem(product, quantity);
                    openSidebar();
                    // Panel stays open so user can keep talking
                }}
                onViewProduct={(product) => {
                    navigate(`/catalogue/${product.slug}`);
                    // Panel stays open — user can navigate while voice session continues
                }}
                onNavigate={(path) => {
                    navigate(path);
                }}
                showUI={true}
            />

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={isShrink ? {
                                opacity: 0,
                                scale: 0.8,
                                y: 100,
                                pointerEvents: 'none'
                            } : {
                                opacity: 1,
                                scale: 1,
                                y: 0,
                                pointerEvents: 'auto'
                            }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                            className="fixed inset-0 z-[9999] bg-zinc-950/98 backdrop-blur-3xl flex flex-col overflow-hidden origin-bottom-right"
                        >
                            {/* Header */}
                            <div className="relative z-40 px-6 py-6 sm:py-8 border-b border-white/5 bg-zinc-950/40 backdrop-blur-xl">
                                <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-6">

                                    {/* Left: Branding & Status */}
                                    <div className="flex items-center gap-5">
                                        <div className="relative group">
                                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center transition-all group-hover:border-green-neon/40 shadow-2xl overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-br from-green-neon/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <Leaf className="w-6 h-6 sm:w-7 sm:h-7 text-green-neon transition-transform group-hover:scale-110" />
                                            </div>
                                            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-neon rounded-full border-[3px] border-zinc-950 shadow-[0_0_10px_rgba(57,255,20,0.4)]" />
                                        </div>

                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tighter uppercase italic">
                                                    BudTender <span className="text-green-neon not-italic">AI</span>
                                                </h3>
                                                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-neon/5 border border-green-neon/10">
                                                    <span className="w-1.5 h-1.5 bg-green-neon rounded-full animate-pulse shadow-[0_0_5px_rgba(57,255,20,0.8)]" />
                                                    <span className="text-[10px] font-black text-green-neon tracking-widest uppercase">Live Expert</span>
                                                </div>
                                            </div>
                                            <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-0.5">
                                                {memory.isLoggedIn && memory.userName
                                                    ? `Session active · Bonjour, ${memory.userName}`
                                                    : 'Conseiller spécialisé en cannabinoïdes'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <div className="h-10 w-[1px] bg-white/5 mx-2 hidden sm:block" />

                                        {(globalSettings?.budtender_voice_enabled ?? true) && (
                                            <HeaderAction
                                                icon={<Mic className="w-5 h-5" />}
                                                title="Conseiller vocal (Gemini Live)"
                                                onClick={() => setIsVoiceOpen(true)}
                                                label="Voix"
                                            />
                                        )}

                                        <HeaderAction
                                            icon={<History className="w-5 h-5" />}
                                            title="Historique des discussions"
                                            onClick={() => {
                                                setIsHistoryOpen(!isHistoryOpen);
                                                if (!isHistoryOpen) memory.fetchAllSessions();
                                            }}
                                            isActive={isHistoryOpen}
                                            label="Historique"
                                        />

                                        <HeaderAction
                                            icon={<RefreshCw className="w-5 h-5" />}
                                            title="Nouvelle session"
                                            onClick={reset}
                                            label="Nouvelle"
                                        />

                                        <div className="h-10 w-[1px] bg-white/5 mx-2" />

                                        <button
                                            onClick={() => setIsOpen(false)}
                                            className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
                                            title="Fermer"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            </div>



                            {/* ── History Panel (Overlay) ── */}
                            <AnimatePresence mode="wait">
                                {isHistoryOpen && (
                                    <motion.div
                                        initial={{ x: '100%', opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: '100%', opacity: 0 }}
                                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                        className="absolute inset-0 z-30 bg-zinc-950 flex flex-col"
                                    >
                                        <div className="flex items-center gap-4 px-6 py-6 border-b border-white/5 bg-zinc-900/50">
                                            <button
                                                onClick={() => setIsHistoryOpen(false)}
                                                className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-all"
                                            >
                                                <ArrowLeft className="w-5 h-5" />
                                            </button>
                                            <h3 className="text-xl font-black text-white tracking-tight">HISTORIQUE DES CHATS</h3>
                                        </div>

                                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gradient-to-b from-zinc-950 to-zinc-900">
                                            {!memory.isLoggedIn ? (
                                                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                                    <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center border border-white/5">
                                                        <History className="w-8 h-8 text-zinc-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-bold text-lg">Connectez-vous</p>
                                                        <p className="text-zinc-500 text-sm max-w-xs mx-auto mt-1">L'historique des conversations est réservé aux membres de Green Mood.</p>
                                                    </div>
                                                </div>
                                            ) : memory.isHistoryLoading ? (
                                                <div className="space-y-4">
                                                    {[1, 2, 3].map(i => (
                                                        <div key={i} className="h-24 bg-zinc-900/50 rounded-2xl animate-pulse border border-white/5" />
                                                    ))}
                                                </div>
                                            ) : memory.allChatSessions.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                                                    <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
                                                        <History className="w-8 h-8 text-zinc-800" />
                                                    </div>
                                                    <p className="text-zinc-400 font-medium">Aucune conversation trouvée.</p>
                                                </div>
                                            ) : (
                                                memory.allChatSessions.map((session) => (
                                                    <motion.button
                                                        key={session.id}
                                                        whileHover={{ scale: 1.01 }}
                                                        whileTap={{ scale: 0.99 }}
                                                        onClick={() => {
                                                            setMessages(session.messages as any);
                                                            setIsHistoryOpen(false);
                                                        }}
                                                        className="w-full text-left bg-zinc-900/40 hover:bg-zinc-900 border border-white/5 hover:border-green-neon/30 p-5 rounded-2xl transition-all group shadow-lg"
                                                    >
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <Calendar className="w-3 h-3 text-green-neon" />
                                                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest text-zinc-400">
                                                                        {new Date(session.created_at).toLocaleDateString('fr-FR', {
                                                                            day: 'numeric',
                                                                            month: 'long',
                                                                            year: 'numeric',
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm font-bold text-white line-clamp-2 group-hover:text-green-neon transition-colors leading-relaxed">
                                                                    {session.title || "Conseil Wellness personnalisé"}
                                                                </p>
                                                                <div className="mt-3 flex items-center gap-4 text-[11px] text-zinc-500 font-medium">
                                                                    <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md">
                                                                        <Leaf className="w-3 h-3 text-green-neon" />
                                                                        {session.messages.length} messages
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="w-10 h-10 rounded-xl bg-green-neon/5 border border-green-neon/10 flex items-center justify-center group-hover:bg-green-neon group-hover:text-black transition-all flex-shrink-0">
                                                                <ChevronRight className="w-5 h-5" />
                                                            </div>
                                                        </div>
                                                    </motion.button>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Messages area */}
                            <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-b from-transparent via-zinc-900/10 to-green-neon/[0.01]">
                                <div className="max-w-7xl mx-auto w-full p-5 sm:p-10 space-y-8">
                                    {messages.map((msg) => (
                                        <BudTenderMessage
                                            key={msg.id}
                                            sender={msg.sender}
                                            text={msg.text}
                                            type={msg.type}
                                            isTyping={isTyping}
                                        >
                                            {/* ── Restock card ── */}
                                            {msg.type === 'restock' && msg.restockProduct && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    className="bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-amber-500/30 rounded-2xl p-4 space-y-3"
                                                >
                                                    <div className="flex items-center gap-2 text-amber-400">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span className="text-[10px] font-black tracking-widest uppercase">Rappel de Stock</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {msg.restockProduct.image_url && (
                                                            <img
                                                                src={msg.restockProduct.image_url}
                                                                alt={msg.restockProduct.product_name}
                                                                className="w-14 h-14 rounded-xl object-cover bg-zinc-900 flex-shrink-0"
                                                            />
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-white line-clamp-1">{msg.restockProduct.product_name}</p>
                                                            <p className="text-xs text-zinc-400 mt-0.5">
                                                                Commandé il y a <span className="text-amber-400 font-bold">{msg.restockProduct.daysSince}j</span>
                                                            </p>
                                                            <p className="text-base font-black text-green-neon mt-1">{msg.restockProduct.price.toFixed(2)} €</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <motion.button
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => {
                                                                // Find in loaded products and add to cart
                                                                const p = products.find(pr => pr.id === msg.restockProduct!.product_id);
                                                                if (p) {
                                                                    addItem(p);
                                                                    openSidebar();
                                                                    setIsShrink(true);
                                                                }
                                                            }}
                                                            className="flex-1 flex items-center justify-center gap-2 bg-green-neon hover:bg-green-400 text-black font-black text-xs py-2.5 rounded-xl transition-all"
                                                        >
                                                            <ShoppingCart className="w-3.5 h-3.5" />
                                                            Réapprovisionner
                                                        </motion.button>
                                                        <Link
                                                            to={`/catalogue/${msg.restockProduct.slug}`}
                                                            onClick={() => setIsShrink(true)}
                                                            className="px-3 py-2.5 bg-zinc-700/50 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl transition-all flex items-center"
                                                        >
                                                            Voir
                                                        </Link>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* ── Terpene Selection UI ── */}
                                            {msg.type === 'terpene' && awaitingTerpene && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="space-y-4 pt-2"
                                                >
                                                    <div className="grid grid-cols-2 xs:grid-cols-3 gap-2">
                                                        {TERPENE_CHIPS.map((chip) => {
                                                            const isSelected = terpeneSelection.includes(chip.label);
                                                            return (
                                                                <button
                                                                    key={chip.label}
                                                                    onClick={() => {
                                                                        setTerpeneSelection(prev =>
                                                                            isSelected ? prev.filter(t => t !== chip.label) : [...prev, chip.label]
                                                                        );
                                                                    }}
                                                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${isSelected
                                                                        ? 'bg-green-neon border-green-neon text-black'
                                                                        : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                                                                        }`}
                                                                >
                                                                    <span>{chip.emoji}</span>
                                                                    <span className="truncate">{chip.label}</span>
                                                                    {isSelected && <CheckCircle2 className="w-3 h-3 ml-auto" />}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={confirmTerpeneSelection}
                                                        className="w-full bg-zinc-100 hover:bg-white text-black font-black py-3 rounded-2xl text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                                                    >
                                                        {terpeneSelection.length > 0 ? (
                                                            <>Confirmer la sélection ({terpeneSelection.length}) <ChevronRight className="w-4 h-4" /></>
                                                        ) : (
                                                            <>Passer cette étape <ChevronRight className="w-4 h-4" /></>
                                                        )}
                                                    </motion.button>
                                                </motion.div>
                                            )}

                                            {/* ── Quiz Options ── */}
                                            {msg.isOptions && msg.options && (
                                                <div className="grid grid-cols-1 gap-2.5 mt-3">
                                                    {msg.options.map((opt) => {
                                                        const isSelected = answers[msg.stepId!] === opt.value;
                                                        const hasAnsweredNext = messages.some(m => m.sender === 'user' && m.text === opt.label);

                                                        return (
                                                            <motion.button
                                                                key={opt.value}
                                                                whileHover={{ x: 4, backgroundColor: 'rgba(57,255,20,0.05)' }}
                                                                disabled={stepIndex !== settings.quiz_steps.findIndex(s => s.id === msg.stepId)}
                                                                onClick={() => handleAnswer(opt, msg.stepId!)}
                                                                className={`flex items-center gap-4 px-5 py-4 rounded-2xl border text-left transition-all ${isSelected || hasAnsweredNext
                                                                    ? 'bg-green-neon/10 border-green-neon/50 text-green-neon shadow-[0_0_20px_rgba(57,255,20,0.05)]'
                                                                    : 'bg-zinc-800/30 border-zinc-800 hover:border-zinc-600 text-zinc-400 group'
                                                                    }`}
                                                            >
                                                                <span className="text-2xl filter drop-shadow-sm group-hover:scale-110 transition-transform">{opt.emoji}</span>
                                                                <span className="text-sm font-bold tracking-tight">{opt.label}</span>
                                                                <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${isSelected || hasAnsweredNext ? 'text-green-neon rotate-90' : 'text-zinc-600'}`} />
                                                            </motion.button>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {msg.isResult && msg.recommended && (
                                                <div className="space-y-4 pt-3">
                                                    <p className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase px-1">Sélection sur-mesure</p>
                                                    {msg.recommended.map((product, i) => (
                                                        <motion.div
                                                            key={product.id}
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ delay: i * 0.15 }}
                                                            whileHover={{ scale: 1.02 }}
                                                            className="flex items-center gap-4 bg-zinc-800/40 hover:bg-zinc-800/60 border border-zinc-700/50 hover:border-green-neon/30 p-4 rounded-[1.5rem] transition-all group"
                                                        >
                                                            <div className="relative flex-shrink-0">
                                                                <img
                                                                    src={product.image_url || ''}
                                                                    className="w-16 h-16 rounded-2xl object-cover bg-zinc-900 shadow-md transition-transform group-hover:scale-105"
                                                                    alt={product.name}
                                                                />
                                                                {product.cbd_percentage && (
                                                                    <span className="absolute -top-1 -left-1 bg-green-neon text-black text-[9px] font-black px-1.5 py-0.5 rounded-lg shadow-sm">
                                                                        {product.cbd_percentage}%
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <Link
                                                                    to={`/catalogue/${product.slug}`}
                                                                    onClick={() => setIsShrink(true)}
                                                                    className="text-sm font-bold text-white hover:text-green-neon line-clamp-1"
                                                                >
                                                                    {product.name}
                                                                </Link>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <p className="text-base font-black text-green-neon">{product.price}€</p>
                                                                    {product.original_value && (
                                                                        <p className="text-[10px] text-zinc-500 line-through">{product.original_value}€</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <motion.button
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={async () => {
                                                                    addItem(product);
                                                                    openSidebar();
                                                                    setIsShrink(true);
                                                                    const { user } = useAuthStore.getState();
                                                                    if (user) {
                                                                        try {
                                                                            const { error } = await supabase.from('budtender_interactions').insert({
                                                                                user_id: user.id,
                                                                                interaction_type: 'click',
                                                                                clicked_product: product.id,
                                                                                created_at: new Date().toISOString()
                                                                            });
                                                                            if (error) console.error('[BudTender] Click log error:', error);
                                                                        } catch (err) {
                                                                            console.error('[BudTender] Click log exception:', err);
                                                                        }
                                                                    }
                                                                }}
                                                                className="w-10 h-10 rounded-xl bg-green-neon hover:bg-green-400 text-black flex items-center justify-center transition-all shadow-lg hover:shadow-green-neon/20"
                                                            >
                                                                <ShoppingCart className="w-4 h-4" />
                                                            </motion.button>
                                                        </motion.div>
                                                    ))}

                                                    {/* ── Feedback on recommendations ── */}
                                                    <BudTenderFeedback
                                                        onFeedback={async (type) => {
                                                            const { user } = useAuthStore.getState();
                                                            if (user) {
                                                                try {
                                                                    const { error } = await supabase.from('budtender_interactions').insert({
                                                                        user_id: user.id,
                                                                        interaction_type: 'feedback',
                                                                        feedback: type,
                                                                        created_at: new Date().toISOString()
                                                                    });
                                                                    if (error) console.error('[BudTender] Feedback log error:', error);
                                                                } catch (err) {
                                                                    console.error('[BudTender] Feedback log exception:', err);
                                                                }
                                                            }
                                                        }}
                                                    />

                                                    {/* ── Ambassador / Share section ── */}
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.8 }}
                                                        className="mt-6 bg-gradient-to-br from-green-neon/10 to-transparent border border-green-neon/20 rounded-2xl p-4 sm:p-5 relative overflow-hidden"
                                                    >
                                                        <div className="absolute top-0 right-0 p-3 opacity-10">
                                                            <Gift className="w-12 h-12 text-green-neon" />
                                                        </div>

                                                        {!hasShared ? (
                                                            <div className="space-y-3 relative z-10">
                                                                <div className="flex items-center gap-2">
                                                                    <Sparkles className="w-4 h-4 text-green-neon" />
                                                                    <p className="text-xs font-black uppercase tracking-wider text-white">Cadeau Ambassadeur 🏆</p>
                                                                </div>
                                                                <p className="text-xs text-zinc-400 leading-relaxed">
                                                                    Partagez vos résultats ou invitez un ami à faire le test pour débloquer un code promo de <span className="text-green-neon font-bold">-10%</span> sur votre commande !
                                                                </p>
                                                                <button
                                                                    onClick={handleShare}
                                                                    className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2.5 rounded-xl transition-all text-xs border border-zinc-700"
                                                                >
                                                                    <Share2 className="w-3.5 h-3.5" />
                                                                    Partager & Débloquer
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-4 relative z-10">
                                                                <div className="flex items-center gap-2 text-green-neon">
                                                                    <CheckCircle2 className="w-4 h-4" />
                                                                    <p className="text-xs font-black uppercase tracking-wider">Lien Partagé !</p>
                                                                </div>
                                                                <div className="bg-zinc-950/50 border border-green-neon/30 rounded-xl p-3 flex items-center justify-between group">
                                                                    <div>
                                                                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Votre code :</p>
                                                                        <p className="text-lg font-black text-green-neon tracking-tighter">BUDTENDER10</p>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => copyPromoCode('BUDTENDER10')}
                                                                        className="relative p-2 bg-green-neon/10 hover:bg-green-neon text-green-neon hover:text-black rounded-lg transition-all"
                                                                    >
                                                                        <Copy className="w-4 h-4" />
                                                                        {showPromoTooltip && (
                                                                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] px-2 py-1 rounded font-bold whitespace-nowrap shadow-xl">
                                                                                Copié !
                                                                            </span>
                                                                        )}
                                                                    </button>
                                                                </div>
                                                                <p className="text-[10px] text-zinc-500 text-center italic">Valable sur tout le catalogue Green Mood.</p>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                </div>
                                            )}
                                        </BudTenderMessage>
                                    ))}

                                    {/* Typing indicator */}
                                    {isTyping && <BudTenderTypingIndicator />}

                                    {/* ── Welcome CTA ── */}
                                    {showStartButton && (globalSettings?.budtender_chat_enabled ?? true) && (
                                        <div className="flex justify-center py-10">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={startQuiz}
                                                className="bg-green-neon hover:bg-green-400 text-black font-black px-12 py-5 rounded-2xl text-base transition-all flex items-center gap-3 group shadow-2xl shadow-green-neon/20"
                                            >
                                                <Sparkles className="w-5 h-5" />
                                                Lancer mon diagnostic personnalisé
                                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                                            </motion.button>
                                        </div>
                                    )}

                                    {/* ── Skip quiz actions ── */}
                                    {showSkipQuizActions && (
                                        <div className="flex justify-center gap-4 flex-wrap py-6">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={skipQuizAndRecommend}
                                                className="bg-green-neon hover:bg-green-400 text-black font-black px-8 py-4 rounded-2xl text-sm transition-all flex items-center gap-2 shadow-xl"
                                            >
                                                <Sparkles className="w-4 h-4" />
                                                Recommandations rapides
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => { memory.clearPrefs(); startQuiz(); }}
                                                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold px-8 py-4 rounded-2xl text-sm transition-all flex items-center gap-2 border border-zinc-700"
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                                Refaire le quiz
                                            </motion.button>
                                        </div>
                                    )}

                                    {/* ── After restock cards but no saved prefs: show start quiz ── */}
                                    {!isTyping
                                        && messages.some(m => m.type === 'restock')
                                        && !memory.savedPrefs
                                        && !messages.some(m => m.isOptions || m.isResult || m.type === 'skip-quiz')
                                        && (
                                            <div className="flex justify-center py-6">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={startQuiz}
                                                    className="bg-green-neon hover:bg-green-400 text-black font-black px-10 py-5 rounded-2xl text-base transition-all flex items-center gap-3 shadow-2xl shadow-green-neon/20"
                                                >
                                                    <Sparkles className="w-5 h-5" />
                                                    Découvrir mes nouvelles sélections
                                                </motion.button>
                                            </div>
                                        )}
                                </div>
                            </div>

                            {/* ── Chat Input Bar ── */}
                            {(globalSettings?.budtender_chat_enabled ?? true) && (
                                <div className="p-6 sm:p-10 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-3xl shrink-0">
                                    <div className="max-w-7xl mx-auto w-full space-y-4">
                                        <form
                                            onSubmit={handleSendMessage}
                                            className="flex items-center gap-3 bg-zinc-900 border-2 border-zinc-700 rounded-[2rem] p-2 focus-within:border-green-neon transition-all shadow-2xl"
                                        >
                                            <input
                                                type="text"
                                                value={chatInput}
                                                onChange={(e) => setChatInput(e.target.value)}
                                                placeholder="Posez votre question à l'IA ou décrivez vos besoins..."
                                                className="flex-1 bg-transparent border-none text-base text-white px-5 py-3 focus:outline-none placeholder:text-zinc-500"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!chatInput.trim() || isTyping}
                                                className="w-12 h-12 flex items-center justify-center rounded-full bg-green-neon text-black disabled:opacity-20 disabled:grayscale transition-all hover:scale-105 active:scale-95 shadow-lg shadow-green-neon/40"
                                            >
                                                <SendHorizontal className="w-6 h-6" />
                                            </button>
                                        </form>
                                        <div className="flex flex-col items-center gap-1.5 px-1">
                                            <p className="text-[10px] text-zinc-500 text-center leading-relaxed max-w-2xl">
                                                <span className="text-amber-500/80 font-bold uppercase tracking-widest mr-1">Avis important :</span>
                                                BudTender est une IA de conseil. Les informations fournies ne constituent pas un avis médical.
                                                Consultez un médecin avant toute consommation, surtout en cas de traitement ou de grossesse.
                                            </p>
                                            <p className="text-[9px] text-green-neon font-black uppercase tracking-[0.4em] opacity-50 mt-1">
                                                BudTender IA Expérience
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence >
        </>
    );
}
