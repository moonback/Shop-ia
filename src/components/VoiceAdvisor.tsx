import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, PhoneOff, Volume2, X, Radio, Headphones } from 'lucide-react';
import { Product } from '../lib/types';
import { PastProduct, SavedPrefs } from '../hooks/useBudTenderMemory';
import { useGeminiLiveVoice, VoiceState } from '../hooks/useGeminiLiveVoice';
import { useSettingsStore } from '../store/settingsStore';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Props {
    products: Product[];
    pastProducts: PastProduct[];
    savedPrefs: SavedPrefs | null;
    userName: string | null;
    isOpen: boolean;
    onClose: () => void;
    onHangup?: () => void;
    onAddItem?: (product: Product, quantity: number) => void;
    onViewProduct?: (product: Product) => void;
    onNavigate?: (path: string) => void;
    showUI?: boolean;
    cartItems?: any[];
}

// ─── Status labels ───────────────────────────────────────────────────────────

const STATUS: Record<VoiceState, string> = {
    idle: 'Démarrage…',
    connecting: 'Connexion…',
    listening: 'À votre écoute',
    speaking: 'BudTender répond',
    error: 'Erreur',
};

const STATUS_COLOR: Record<VoiceState, string> = {
    idle: 'text-zinc-400',
    connecting: 'text-zinc-400',
    listening: 'text-green-400',
    speaking: 'text-green-neon',
    error: 'text-red-400',
};

// ─── Animated waveform bars ──────────────────────────────────────────────────

function WaveformBars({ state }: { state: VoiceState }) {
    const barsCount = 9;
    const isSpeaking = state === 'speaking';
    const isListening = state === 'listening';

    if (state === 'idle' || state === 'connecting' || state === 'error') {
        return (
            <div className="flex items-center gap-[4px] h-6">
                {[...Array(barsCount)].map((_, i) => (
                    <div key={i} className="w-[3px] h-[3px] bg-zinc-800 rounded-full" />
                ))}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-[4px] h-6">
            {[...Array(barsCount)].map((_, i) => {
                const centerDist = Math.abs(i - Math.floor(barsCount / 2));
                const maxH = 28 - centerDist * 4;
                const delay = i * 0.08;

                return (
                    <motion.div
                        key={i}
                        className={`w-[3px] rounded-full ${isSpeaking ? 'bg-green-neon' : 'bg-green-neon/40'}`}
                        animate={{
                            height: isSpeaking
                                ? ['4px', `${maxH}px`, '4px']
                                : isListening
                                    ? ['3px', '8px', '3px']
                                    : '3px',
                            opacity: isSpeaking ? 1 : isListening ? [0.3, 0.6, 0.3] : 0.2
                        }}
                        transition={{
                            duration: isSpeaking ? 0.5 + centerDist * 0.05 : 2,
                            repeat: Infinity,
                            delay: isSpeaking ? delay : i * 0.2,
                            ease: 'easeInOut'
                        }}
                    />
                );
            })}
        </div>
    );
}

// ─── Central mic orb ────────────────────────────────────────────────────────

function MicOrb({ voiceState, isMuted }: { voiceState: VoiceState; isMuted: boolean }) {
    const isActive = voiceState === 'listening' || voiceState === 'speaking';
    const isListening = voiceState === 'listening';
    const isSpeaking = voiceState === 'speaking';

    return (
        <div className="relative flex items-center justify-center w-18 h-18">
            {/* Immersive glow layers */}
            <AnimatePresence>
                {isActive && !isMuted && (
                    <>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute inset-[-8px] rounded-full bg-green-neon/5 blur-[20px]"
                        />
                        <motion.div
                            className="absolute inset-0 rounded-full border border-green-neon/20"
                            animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                        />
                        <motion.div
                            className="absolute inset-0 rounded-full border border-green-neon/10"
                            animate={{ scale: [1, 1.4], opacity: [0.3, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.6 }}
                        />
                    </>
                )}
            </AnimatePresence>

            {/* Orb background */}
            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-700 relative z-10 ${voiceState === 'error'
                ? 'bg-red-500/10 border-2 border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
                : isSpeaking
                    ? 'bg-green-neon/20 border-2 border-green-neon/60 shadow-[0_0_30px_rgba(57,255,20,0.3)]'
                    : isListening
                        ? 'bg-green-neon/10 border-2 border-green-neon/40 shadow-[0_0_20px_rgba(57,255,20,0.2)]'
                        : 'bg-zinc-800/60 border-2 border-white/5'
                }`}>
                <AnimatePresence mode="wait">
                    {voiceState === 'connecting' && (
                        <motion.div
                            key="spinner"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="w-5 h-5 border-2 border-green-neon/30 border-t-green-neon rounded-full animate-spin"
                        />
                    )}
                    {isSpeaking && (
                        <motion.div key="vol" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                            <Volume2 className="w-6 h-6 text-green-neon" />
                        </motion.div>
                    )}
                    {(isListening || voiceState === 'idle' || voiceState === 'error') && (
                        <motion.div key="mic" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                            {isMuted
                                ? <MicOff className={`w-6 h-6 ${voiceState === 'error' ? 'text-red-400' : 'text-orange-400'}`} />
                                : <Mic className={`w-6 h-6 ${isActive ? 'text-green-neon' : voiceState === 'error' ? 'text-red-400' : 'text-zinc-400'}`} />
                            }
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function VoiceAdvisor({
    products, pastProducts, savedPrefs, userName,
    isOpen, onClose, onHangup, onAddItem, onViewProduct, onNavigate,
    showUI = true, cartItems = []
}: Props) {
    const { settings } = useSettingsStore();

    const { voiceState, error, isMuted, isSupported, compatibilityError, startSession, stopSession, toggleMute } =
        useGeminiLiveVoice({
            products,
            pastProducts,
            savedPrefs,
            userName,
            onAddItem,
            deliveryFee: settings.delivery_fee,
            deliveryFreeThreshold: settings.delivery_free_threshold,
            onCloseSession: onClose,
            onViewProduct,
            onNavigate,
            cartItems
        });

    // Auto-start ONCE when the panel opens — never on subsequent voiceState changes.
    // Without this guard, every time Gemini Live closes the WS cleanly (code 1000)
    // voiceState resets to 'idle' and this effect would restart the session in a loop.
    const hasAutoStartedRef = useRef(false);
    useEffect(() => {
        if (isOpen && isSupported) {
            if (!hasAutoStartedRef.current) {
                hasAutoStartedRef.current = true;
                const timer = setTimeout(() => startSession(), 400);
                return () => clearTimeout(timer);
            }
        } else {
            // Panel closed: reset so next open auto-starts fresh
            hasAutoStartedRef.current = false;
        }
    }, [isOpen, isSupported, startSession]);

    const isActive = voiceState === 'listening' || voiceState === 'speaking';

    const handleClose = () => {
        stopSession();
        onClose();
    };

    const handleHangup = () => {
        stopSession();
        onClose();
        if (onHangup) onHangup();
    };

    if (!showUI) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                /* ── Floating panel anchored bottom-right, site stays accessible ── */
                <motion.div
                    initial={{ opacity: 0, scale: 0.85, y: 24 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: 24 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    /* Position: above the widget button (bottom-6 + widget ~72px = ~84px) and to its left */
                    className="fixed bottom-24 right-6 z-[99998] w-[320px] pointer-events-auto"
                    style={{ originX: 1, originY: 1 }}
                >
                    <div
                        className="relative rounded-[2.5rem] overflow-hidden border border-white/[0.08]"
                        style={{
                            background: 'rgba(5, 5, 8, 0.94)',
                            backdropFilter: 'blur(50px)',
                            boxShadow: isActive
                                ? '0 30px 60px -12px rgba(0,0,0,0.9), 0 0 50px rgba(57,255,20,0.1), inset 0 1px 0 rgba(255,255,255,0.05)'
                                : '0 30px 60px -12px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)',
                        }}
                    >
                        {/* Immersive background mesh-glow */}
                        <AnimatePresence>
                            {isActive && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 pointer-events-none overflow-hidden"
                                >
                                    <motion.div
                                        animate={{
                                            opacity: [0.03, 0.08, 0.03],
                                            scale: [1, 1.2, 1],
                                            x: [-20, 20, -20],
                                            y: [-20, 20, -20],
                                        }}
                                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                        className="absolute top-0 left-0 w-full h-full bg-green-neon/20 blur-[100px]"
                                    />
                                    <motion.div
                                        animate={{
                                            opacity: [0.02, 0.06, 0.02],
                                            scale: [1, 1.3, 1],
                                            x: [20, -20, 20],
                                            y: [20, -20, 20],
                                        }}
                                        transition={{ duration: 15, repeat: Infinity, ease: "linear", delay: 2 }}
                                        className="absolute bottom-0 right-0 w-full h-full bg-emerald-500/10 blur-[120px]"
                                    />
                                    {/* Scanline effect */}
                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%] opacity-10" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {/* Subtle green top-border glow when active */}
                        {isActive && (
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-green-neon/30 to-transparent" />
                        )}

                        {/* ── Header ── */}
                        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/[0.04]">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-green-neon/20 to-emerald-500/20 border border-green-neon/30 flex items-center justify-center shadow-lg shadow-green-neon/10">
                                    <Headphones className="w-4 h-4 text-green-neon" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[12px] font-black text-white uppercase tracking-[0.2em]">
                                            BudTender Privilège
                                        </span>
                                        <motion.span
                                            animate={isActive ? { opacity: [1, 0.6, 1], scale: [1, 1.05, 1] } : { opacity: 0.5 }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="inline-flex items-center gap-1 text-[8px] bg-green-neon/10 text-green-neon px-2 py-0.5 rounded-full border border-green-neon/30 font-black tracking-widest shadow-[0_0_10px_rgba(57,255,20,0.1)]"
                                        >
                                            <Radio size={8} className="animate-pulse" />
                                            ULTRA
                                        </motion.span>
                                    </div>
                                    <p className="text-[10px] text-zinc-500 font-bold mt-0.5 tracking-tight">
                                        Assistant Personnel · Audio Haute Fidélité
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="p-2 text-zinc-600 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                                aria-label="Fermer le conseiller vocal"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* ── Body ── */}
                        <div className="px-4 py-4 flex items-center gap-4">
                            {/* Orb */}
                            <MicOrb voiceState={voiceState} isMuted={isMuted} />

                            {/* Status + waveform */}
                            <div className="flex-1 min-w-0">
                                <motion.p
                                    key={voiceState}
                                    initial={{ opacity: 0, y: 3 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`text-sm font-bold leading-tight ${STATUS_COLOR[voiceState]}`}
                                >
                                    {STATUS[voiceState]}
                                </motion.p>
                                <p className="text-[11px] text-zinc-600 mt-1 truncate leading-snug" aria-live="polite">
                                    {compatibilityError || error || (
                                        voiceState === 'speaking' ? 'Analyse et réponse en cours…' :
                                            voiceState === 'listening' ? 'Parlez naturellement' :
                                                voiceState === 'connecting' ? 'Établissement connexion sécurisée…' :
                                                    voiceState === 'error' ? 'Appuyez sur Réessayer' :
                                                        'Votre conseiller IA est prêt'
                                    )}
                                </p>
                                <div className="mt-2.5 h-6 flex items-center">
                                    <WaveformBars state={voiceState} />
                                </div>
                            </div>
                        </div>

                        {/* ── Controls ── */}
                        <div className="px-4 pb-4 flex items-center gap-2">
                            {/* Unsupported browser */}
                            {!isSupported && (
                                <div className="flex-1 text-[10px] text-zinc-500 text-center py-2">
                                    Navigateur non compatible · <button onClick={handleClose} className="underline text-zinc-400">Fermer</button>
                                </div>
                            )}

                            {/* Error → retry */}
                            {voiceState === 'error' && isSupported && (
                                <button
                                    type="button"
                                    onClick={startSession}
                                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-green-neon to-emerald-400 text-black font-black text-xs uppercase tracking-wider hover:shadow-[0_0_20px_rgba(57,255,20,0.2)] active:scale-[0.98] transition-all"
                                >
                                    🔄 Réessayer
                                </button>
                            )}

                            {/* Active controls: mute + hangup */}
                            {(isActive || voiceState === 'connecting') && isSupported && (
                                <>
                                    <button
                                        type="button"
                                        onClick={toggleMute}
                                        disabled={voiceState === 'connecting'}
                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all disabled:opacity-40 border ${isMuted
                                            ? 'bg-orange-500/10 border-orange-500/40 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.1)]'
                                            : 'bg-white/[0.04] border-white/10 text-zinc-400 hover:border-white/20 hover:text-white'
                                            }`}
                                        aria-label={isMuted ? 'Réactiver le micro' : 'Couper le micro'}
                                    >
                                        {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                                        {isMuted ? 'Micro Off' : 'Micro On'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleHangup}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-300 transition-all shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                                        aria-label="Terminer la session vocale"
                                    >
                                        <PhoneOff size={16} />
                                        Quitter
                                    </button>
                                </>
                            )}

                            {/* Idle → start */}
                            {voiceState === 'idle' && isSupported && (
                                <button
                                    type="button"
                                    onClick={startSession}
                                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-green-neon to-emerald-400 text-black font-black text-xs uppercase tracking-wider hover:shadow-[0_0_20px_rgba(57,255,20,0.2)] active:scale-[0.98] transition-all"
                                >
                                    🎤 Démarrer
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
