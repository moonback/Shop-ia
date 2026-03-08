import { Product } from './types';
import { ShopiaAssistantSettings, QuizOption } from './shopiaAssistantSettings';
import { getQuizPrompt, getChatPrompt } from './shopiaAssistantPrompts';
import { CATEGORY_SLUGS } from './constants';

export interface AromaChip {
    label: string;
    emoji: string;
    group: 'arome' | 'qualite';
}

export const AROMA_CHIPS: AromaChip[] = [
    // Arômes & Saveurs
    { label: 'Salé', emoji: '🧂', group: 'arome' },
    { label: 'Sucré', emoji: '🍯', group: 'arome' },
    { label: 'Acidulé', emoji: '🍋', group: 'arome' },
    { label: 'Épicé', emoji: '🌶️', group: 'arome' },
    { label: 'Fruité', emoji: '🍎', group: 'arome' },
    { label: 'Boisé', emoji: '🪵', group: 'arome' },
    { label: 'Herbacé', emoji: '🌿', group: 'arome' },
    { label: 'Gourmand', emoji: '🥐', group: 'arome' },
    // Qualités & Régimes
    { label: 'Bio', emoji: '🌿', group: 'qualite' },
    { label: 'Local', emoji: '📍', group: 'qualite' },
    { label: 'Sans Gluten', emoji: '🌾', group: 'qualite' },
    { label: 'Végan', emoji: '🥦', group: 'qualite' },
    { label: 'Artisanal', emoji: '🖐️', group: 'qualite' },
    { label: 'Sain', emoji: '🥗', group: 'qualite' },
];

export type Answers = Record<string, string>;

export function scoreProduct(product: Product, answers: Answers): number {
    let score = 0;
    const cat = product.category?.slug ?? '';
    const name = product.name.toLowerCase();
    const desc = (product.description ?? '').toLowerCase();

    if (answers.goal === 'cooking') {
        if (name.includes('base') || desc.includes('ingrédient')) score += 5;
        if (cat.includes('sal')) score += 3;
    }
    if (answers.goal === 'fresh') {
        if (desc.includes('frais') || desc.includes('récolte') || cat.includes('frais')) score += 5;
    }
    if (answers.goal === 'discovery') {
        if (product.is_featured || desc.includes('exception')) score += 5;
    }

    if (answers.experience === 'beginner') {
        if (desc.includes('facile') || desc.includes('prêt')) score += 3;
    }
    if (answers.experience === 'expert') {
        if (desc.includes('gourmet') || desc.includes('rare')) score += 3;
    }

    if (answers.format === 'savory' && cat.includes('sal')) score += 4;
    if (answers.format === 'sweet' && cat.includes('sucr')) score += 4;
    if (answers.format === 'fresh_dept' && cat.includes('frais')) score += 4;

    const price = product.price;
    if (answers.budget === 'low' && price < 10) score += 3;
    if (answers.budget === 'mid' && price >= 10 && price <= 30) score += 3;
    if (answers.budget === 'high' && price > 30) score += 3;

    if (product.stock_quantity > 5) score += 1;
    if (product.is_featured) score += 1;

    return score;
}

export function scoreAromas(product: Product, selected: string[]): number {
    if (selected.length === 0) return 0;
    const productAromas: string[] = (product.attributes?.aromas ?? []).map((a: string) => a.toLowerCase());
    const productDesc = (product.description ?? '').toLowerCase();
    let bonus = 0;
    for (const chip of selected) {
        const chipLow = chip.toLowerCase();
        if (productAromas.some(a => a.includes(chipLow) || chipLow.includes(a))) bonus += 4;
        if (productDesc.includes(chipLow)) bonus += 2;
    }
    return bonus;
}

export function generateAdvice(answers: Answers, aromas: string[] = []): string {
    const lines: string[] = [];
    if (answers.goal === 'cooking') lines.push('Pour magnifier vos plats, privilégiez nos bases culinaires et huiles d\'exception.');
    if (answers.goal === 'fresh') lines.push("La fraîcheur est notre priorité, ces produits ont été sélectionnés pour leur qualité gustative optimale aujourd'hui.");
    if (answers.goal === 'discovery') lines.push('Laissez-vous surprendre par nos trouvailles gourmandes du moment.');
    if (answers.experience === 'beginner') lines.push("Pour une première commande, nos produits prêts-à-consommer sont idéaux.");
    if (answers.format === 'bundle') lines.push("Nos paniers découverte sont parfaits pour goûter à toute la diversité de notre catalogue.");
    if (aromas.length > 0) lines.push(`Vos préférences (${aromas.join(', ')}) nous guident vers des saveurs qui sauront vous ravir.`);
    return lines.join(' ');
}

export async function callAI(
    answers: Answers,
    products: Product[],
    settings: ShopiaAssistantSettings,
    history: { role: string; content: string }[] = [],
    context?: string
): Promise<string | null> {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey || !settings.ai_enabled) return null;

    const topScored = [...products]
        .map(p => ({ p, s: scoreProduct(p, answers) }))
        .sort((a, b) => b.s - a.s)
        .slice(0, 15);

    const catalog = topScored
        .map(({ p }) => {
            const aromas = (p.attributes?.aromas ?? []).join(', ');
            const benefits = (p.attributes?.benefits ?? []).join(', ');
            return `- ${p.name} (${p.category?.slug}, ${p.price}€). ${p.description ?? ''} ${aromas ? 'Notes: ' + aromas : ''} ${benefits ? 'Points forts: ' + benefits : ''}`;
        })
        .join('\n');

    const systemPromptMessage = {
        role: 'system',
        content: getQuizPrompt(answers, settings.quiz_steps, catalog, context)
    };

    const messages = [
        systemPromptMessage,
        ...history
    ];

    if (messages[messages.length - 1].role !== 'user') {
        messages.push({ role: 'user', content: "Basé sur mes réponses et notre échange, donne-moi tes conseils finaux pour ma sélection gourmande." });
    }

    const modelToUse = settings.ai_model || 'google/gemini-2.0-flash-lite-preview-02-05:free';

    try {
        const res = await fetch(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'X-Title': 'Shop-ia Assistant',
                    'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
                },
                body: JSON.stringify({
                    model: modelToUse,
                    messages,
                    temperature: settings.ai_temperature,
                    max_tokens: settings.ai_max_tokens,
                }),
            }
        );

        const json = await res.json();
        if (!res.ok) return null;
        return json?.choices?.[0]?.message?.content ?? null;
    } catch (err) {
        return null;
    }
}

export type MessageType = 'standard' | 'restock' | 'skip-quiz' | 'aroma';

export interface Message {
    id: string;
    sender: 'bot' | 'user';
    text?: string;
    type?: MessageType;
    isResult?: boolean;
    isOptions?: boolean;
    options?: QuizOption[];
    stepId?: string;
    recommended?: Product[];
    restockProduct?: {
        product_id: string;
        product_name: string;
        slug: string | null;
        image_url: string | null;
        price: number;
        daysSince: number;
    };
}
