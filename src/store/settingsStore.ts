import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface StoreSettings {
    delivery_fee: number;
    delivery_free_threshold: number;
    store_name: string;
    store_address: string;
    store_phone: string;
    store_hours: string;
    banner_text: string;
    banner_enabled: boolean;
    social_instagram: string;
    social_facebook: string;
    assistant_chat_enabled: boolean;
    assistant_voice_enabled: boolean;
    subscriptions_enabled: boolean;
    referral_reward_points: number;
    referral_welcome_bonus: number;
    referral_program_enabled: boolean;
    search_enabled: boolean;
    home_reviews_enabled: boolean;
    home_best_sellers_enabled: boolean;
    empty_cart_suggestions_enabled: boolean;
    ticker_messages: string[];
}

export const DEFAULT_SETTINGS: StoreSettings = {
    delivery_fee: 4.90,
    delivery_free_threshold: 60.00,
    store_name: 'Shop-ia',
    store_address: '45 Avenue de la Fraîcheur, 75001 Paris',
    store_phone: '01 99 88 77 66',
    store_hours: 'Lun–Sam 09h00–20h00',
    banner_text: '🛒 Bienvenue chez Shop-ia : Votre panier intelligent livré chez vous !',
    banner_enabled: true,
    social_instagram: 'https://instagram.com/shop_ia',
    social_facebook: 'https://facebook.com/shop_ia',
    assistant_chat_enabled: true,
    assistant_voice_enabled: true,
    subscriptions_enabled: true,
    referral_reward_points: 500,
    referral_welcome_bonus: 0,
    referral_program_enabled: true,
    search_enabled: true,
    home_reviews_enabled: true,
    home_best_sellers_enabled: true,
    empty_cart_suggestions_enabled: true,
    ticker_messages: [
        "✦ Livraison offerte dès 60€ d'achat ✦",
        "✦ Nouveau : Découvrez nos produits frais du terroir ✦",
        "✦ -15% sur votre première commande avec OUVERTURE ✦"
    ],
};

interface SettingsStore {
    settings: StoreSettings;
    isLoading: boolean;
    fetchSettings: () => Promise<void>;
    updateSettingsInStore: (newSettings: Partial<StoreSettings>) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
    settings: DEFAULT_SETTINGS,
    isLoading: true,
    fetchSettings: async () => {
        try {
            const { data, error } = await supabase.from('store_settings').select('*');
            if (error) throw error;

            if (data && data.length > 0) {
                const obj = data.reduce((acc: Record<string, any>, row: { key: string; value: any }) => {
                    acc[row.key] = row.value;
                    return acc;
                }, {});

                // Migration: if old Assistant_enabled exists but new ones don't, copy its value
                if (obj.Assistant_enabled !== undefined && obj.assistant_chat_enabled === undefined) {
                    obj.assistant_chat_enabled = obj.Assistant_enabled;
                    obj.assistant_voice_enabled = obj.Assistant_enabled;
                }

                set({ settings: { ...DEFAULT_SETTINGS, ...obj }, isLoading: false });
            } else {
                set({ isLoading: false });
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
            set({ isLoading: false });
        }
    },
    updateSettingsInStore: (newSettings) => {
        set((state) => ({ settings: { ...state.settings, ...newSettings } }));
    },
}));
