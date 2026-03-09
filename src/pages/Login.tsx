import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, Eye, EyeOff, ShieldCheck, Star, Truck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import SEO from '../components/SEO';

type Mode = 'login' | 'register';

const PERKS = [
  { icon: <Truck className="w-5 h-5" />, label: 'Livraison 24h', sub: 'Suivez vos commandes en temps réel' },
  { icon: <Star className="w-5 h-5" />, label: 'Programme Fidélité', sub: 'Gagnez des points à chaque achat' },
  { icon: <ShieldCheck className="w-5 h-5" />, label: 'Achats Sécurisés', sub: 'Paiement 100% protégé' },
];

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuthStore();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const hasMinPasswordLength = password.length >= 8;
  const hasLetter = /[A-Za-zÀ-ÿ]/.test(password);
  const hasNumber = /\d/.test(password);

  const resetFeedback = () => { setError(''); setSuccess(''); };

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    resetFeedback();
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    resetFeedback();
    setIsLoading(true);
    const normalizedEmail = email.trim().toLowerCase();
    try {
      if (mode === 'login') {
        await signIn(normalizedEmail, password);
        navigate('/compte');
      } else {
        if (!fullName.trim()) { setError('Le prénom et nom sont requis.'); return; }
        if (!hasMinPasswordLength || !hasLetter || !hasNumber) {
          setError('Le mot de passe doit contenir au moins 8 caractères, une lettre et un chiffre.');
          return;
        }
        if (password !== confirmPassword) { setError('Les mots de passe ne correspondent pas.'); return; }
        await signUp(normalizedEmail, password, fullName.trim());
        setSuccess('Compte créé ! Vérifiez votre email pour confirmer votre inscription.');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Une erreur est survenue.';
      if (msg.includes('Invalid login credentials')) setError('Email ou mot de passe incorrect.');
      else if (msg.includes('User already registered')) setError('Un compte existe déjà avec cet email.');
      else setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEO
        title={mode === 'login' ? 'Connexion — Shop-ia' : 'Créer un compte — Shop-ia'}
        description="Connectez-vous ou créez un compte pour accéder à votre historique, fidélité et recommandations personnalisées."
      />

      <div className="min-h-screen bg-zinc-950 flex pt-1">
        {/* ── Left panel (value proposition) ── */}
        <div className="hidden lg:flex flex-col justify-between flex-1 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border-r border-white/[0.06] p-16 relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-400/5 blur-[100px] rounded-full pointer-events-none" />

          {/* Logo area */}
          <div>
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center">
                <span className="text-black font-black text-lg">S</span>
              </div>
              <span className="text-xl font-serif font-bold text-white group-hover:text-amber-400 transition-colors">Shop-ia</span>
            </Link>
          </div>

          {/* Big Headline */}
          <div className="space-y-8 relative z-10">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
                Votre épicerie<br />
                <span className="text-amber-400 italic">intelligente.</span>
              </h1>
              <p className="text-zinc-400 text-lg font-light leading-relaxed max-w-sm">
                Créez votre compte pour profiter d'une expérience d'achat personnalisée et des meilleurs produits du terroir.
              </p>
            </div>

            {/* Perks */}
            <div className="space-y-5">
              {PERKS.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                    {p.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{p.label}</p>
                    <p className="text-xs text-zinc-500">{p.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Footer quote */}
          <p className="text-zinc-600 text-sm italic">
            "La qualité artisanale alliée à la simplicité du numérique."
          </p>
        </div>

        {/* ── Right panel (form) ── */}
        <div className="flex-1 lg:max-w-xl flex items-center justify-center px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            {/* Mobile logo */}
            <div className="flex lg:hidden justify-center mb-8">
              <Link to="/" className="inline-flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center">
                  <span className="text-black font-black text-base">S</span>
                </div>
                <span className="text-lg font-serif font-bold text-white">Shop-ia</span>
              </Link>
            </div>

            {/* Mode heading */}
            <div className="mb-8 space-y-2">
              <h2 className="text-2xl font-bold text-white">
                {mode === 'login' ? 'Bon retour parmi nous' : 'Rejoindre Shop-ia'}
              </h2>
              <p className="text-zinc-500 text-sm">
                {mode === 'login'
                  ? 'Connectez-vous pour accéder à votre espace.'
                  : 'Créez votre compte gratuitement en quelques secondes.'}
              </p>
            </div>

            {/* Tab switcher — Amazon-style underline tabs */}
            <div className="flex border-b border-white/10 mb-8">
              {(['login', 'register'] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  disabled={isLoading}
                  className={`flex-1 py-3 text-sm font-semibold transition-all border-b-2 -mb-px ${mode === m
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                  {m === 'login' ? 'Connexion' : 'Inscription'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {mode === 'register' && (
                  <motion.div
                    key="fullname"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Nom complet</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Jean Dupont"
                        className="w-full bg-zinc-900 border border-zinc-700 focus:border-amber-400 rounded-xl pl-11 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none transition-colors text-sm"
                        required
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Adresse email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.fr"
                    className="w-full bg-zinc-900 border border-zinc-700 focus:border-amber-400 rounded-xl pl-11 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none transition-colors text-sm"
                    required
                    autoComplete={mode === 'login' ? 'email' : 'username'}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-zinc-300">Mot de passe</label>
                  {mode === 'login' && (
                    <Link to="/mot-de-passe-oublie" className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
                      Mot de passe oublié ?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-900 border border-zinc-700 focus:border-amber-400 rounded-xl pl-11 pr-12 py-3 text-white placeholder-zinc-600 focus:outline-none transition-colors text-sm"
                    required
                    minLength={mode === 'register' ? 8 : 6}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password strength checklist */}
                {mode === 'register' && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[
                      { ok: hasMinPasswordLength, label: '8+ caractères' },
                      { ok: hasLetter, label: 'Une lettre' },
                      { ok: hasNumber, label: 'Un chiffre' },
                    ].map((c) => (
                      <div key={c.label} className={`flex items-center gap-1.5 text-xs transition-colors ${c.ok ? 'text-green-400' : 'text-zinc-600'}`}>
                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                        {c.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <AnimatePresence mode="wait">
                {mode === 'register' && (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Confirmer le mot de passe</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-zinc-900 border border-zinc-700 focus:border-amber-400 rounded-xl pl-11 pr-12 py-3 text-white placeholder-zinc-600 focus:outline-none transition-colors text-sm"
                        required
                        minLength={8}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error / Success */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm"
                  >
                    {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 text-green-400 text-sm"
                  >
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3.5 rounded-xl transition-all hover:shadow-[0_0_30px_rgba(251,191,36,0.4)] active:scale-95 flex items-center justify-center gap-2 text-sm"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Chargement…
                  </>
                ) : (
                  <>
                    {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Legal */}
            <p className="text-center text-zinc-600 text-xs mt-6 leading-relaxed">
              En continuant, vous acceptez nos{' '}
              <Link to="/mentions-legales" className="text-zinc-400 hover:text-amber-400 underline underline-offset-2 transition-colors">
                Conditions d'utilisation
              </Link>{' '}
              et notre{' '}
              <Link to="/mentions-legales" className="text-zinc-400 hover:text-amber-400 underline underline-offset-2 transition-colors">
                Politique de confidentialité
              </Link>
              .
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
