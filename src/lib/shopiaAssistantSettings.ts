import { supabase } from './supabase';

// ─── Shared Assistant Settings Logic ──────────────────────────────────────────

export interface QuizOption {
    label: string;
    value: string;
    emoji: string;
}

export interface QuizStep {
    id: string;
    question: string;
    options: QuizOption[];
}

export interface ShopiaAssistantSettings {
    enabled: boolean;
    ai_enabled: boolean;
    ai_model: string;
    ai_temperature: number;
    ai_max_tokens: number;
    recommendations_count: number;
    typing_speed: 'normal' | 'fast' | 'slow';
    memory_enabled: boolean;
    restock_threshold_oils: number;
    restock_threshold_flowers: number;
    restock_threshold_other: number;
    welcome_message: string;
    pulse_delay: number;
    quiz_steps: QuizStep[];
}

export const SHOPIA_ASSISTANT_DEFAULT_QUIZ: QuizStep[] = [
    {
        id: 'goal',
        question: 'Quel est votre objectif aujourd\'hui ?',
        options: [
            { label: 'Cuisiner un bon repas', value: 'cooking', emoji: '🍳' },
            { label: 'Faire le plein de frais', value: 'fresh', emoji: '🍎' },
            { label: 'Découvrir des pépites', value: 'discovery', emoji: '✨' },
            { label: 'Épicerie de base', value: 'pantry', emoji: '🥖' },
        ],
    },
    {
        id: 'experience',
        question: 'Quel est votre niveau en cuisine ?',
        options: [
            { label: "Débutant — je cherche du simple", value: 'beginner', emoji: '👋' },
            { label: "Amateur — j'aime cuisiner", value: 'intermediate', emoji: '👨‍🍳' },
            { label: "Chef — je connais mes produits", value: 'expert', emoji: '🌟' },
        ],
    },
    {
        id: 'format',
        question: 'Quelle catégorie vous intéresse ?',
        options: [
            { label: 'Épicerie Salée', value: 'savory', emoji: '🧂' },
            { label: 'Épicerie Sucrée', value: 'sweet', emoji: '🍯' },
            { label: 'Produits Frais', value: 'fresh_dept', emoji: '🥬' },
            { label: 'Boissons & Jus', value: 'drinks', emoji: '🥤' },
        ],
    },
    {
        id: 'budget',
        question: 'Votre budget pour ce panier ?',
        options: [
            { label: 'Économique', value: 'low', emoji: '💶' },
            { label: 'Standard', value: 'mid', emoji: '💶💶' },
            { label: 'Premium / Gourmet', value: 'high', emoji: '💎' },
        ],
    },
];

export const SHOPIA_ASSISTANT_DEFAULTS: ShopiaAssistantSettings = {
    enabled: true,
    ai_enabled: true,
    ai_model: 'google/gemini-2.0-flash-lite-preview-02-05:free',
    ai_temperature: 0.7,
    ai_max_tokens: 1500,
    recommendations_count: 3,
    typing_speed: 'normal',
    memory_enabled: true,
    restock_threshold_oils: 30,
    restock_threshold_flowers: 14,
    restock_threshold_other: 21,
    welcome_message: "Bienvenue chez Shop-ia ! 🍏 Je suis votre assistant culinaire personnel. Envie d'une recette ou besoin d'aide pour vos courses ?",
    pulse_delay: 3,
    quiz_steps: SHOPIA_ASSISTANT_DEFAULT_QUIZ,
};

export const SHOPIA_ASSISTANT_LS_KEY = 'shop_ia_assistant_admin_settings_v1';

/**
 * Helper to migrate old settings keys (gemini_*) to new generic AI keys
 */
function migrateSettings(raw: any): ShopiaAssistantSettings {
    const migrated = { ...SHOPIA_ASSISTANT_DEFAULTS, ...raw };

    // Migrate old keys if present and new ones aren't specifically set in the raw data
    if (raw.gemini_enabled !== undefined && raw.ai_enabled === undefined) {
        migrated.ai_enabled = raw.gemini_enabled;
    }
    if (raw.gemini_temperature !== undefined && raw.ai_temperature === undefined) {
        migrated.ai_temperature = raw.gemini_temperature;
    }
    if (raw.gemini_max_tokens !== undefined && raw.ai_max_tokens === undefined) {
        migrated.ai_max_tokens = raw.gemini_max_tokens;
    }

    // Ensure ai_model is set to a valid OpenRouter default if missing
    if (!migrated.ai_model) {
        migrated.ai_model = SHOPIA_ASSISTANT_DEFAULTS.ai_model;
    }

    return migrated;
}

/**
 * Global helper to load Assistant settings from localStorage (Sync)
 */
export function getShopiaAssistantSettings(): ShopiaAssistantSettings {
    try {
        const raw = localStorage.getItem(SHOPIA_ASSISTANT_LS_KEY);
        if (raw) return migrateSettings(JSON.parse(raw));
    } catch (err) {
        if (import.meta.env.DEV) console.error('[shopiaAssistantSettings] Error loading settings:', err);
    }
    return SHOPIA_ASSISTANT_DEFAULTS;
}

/**
 * Global helper to fetch Shopia Assistant settings from Supabase (Async)
 */
export async function fetchShopiaAssistantSettings(): Promise<ShopiaAssistantSettings> {
    try {
        const { data, error } = await supabase
            .from('store_settings')
            .select('value')
            .eq('key', 'Assistant_config')
            .maybeSingle(); // maybeSingle allows 0 rows without erroring

        if (error) throw error;
        if (data?.value) return migrateSettings(data.value);
    } catch (err) {
        // Quietly fallback if it's just a missing row or initial setup
        if (import.meta.env.DEV) console.warn('[shopiaAssistantSettings] No config found in DB, using defaults');
    }
    // Fallback if DB fails or is empty
    return getShopiaAssistantSettings();
}
