import { supabase } from './supabase';
import { Product } from './types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const AI_MODEL = 'liquid/lfm-2-24b-a2b:latest';

export interface GeneratedProductData {
    description?: string;
    cbd_percentage?: number;
    thc_max?: number;
    attributes?: {
        benefits?: string[];
        aromas?: string[];
    };
}

/**
 * Uses OpenRouter to generate missing product information based on the name.
 */
export async function generateProductInfo(productName: string, categoryName?: string): Promise<GeneratedProductData | null> {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey) {
        console.error('[AI] OpenRouter API key missing');
        return null;
    }

    const prompt = `
    Tu es un expert en gastronomie et produits d'épicerie fine. 
    Génère des informations précises pour un produit nommé : "${productName}" ${categoryName ? `dans la catégorie "${categoryName}"` : ''}.
    
    Réponds EXCLUSIVEMENT au format JSON avec la structure suivante :
    {
        "description": "Une description marketing attrayante de 2-3 phrases mettant en avant le goût, l'origine et la qualité du produit.",
        "cbd_percentage": null, (Laisse à null pour les produits alimentaires, ou utilise pour un indice de fraîcheur de 0 à 100)
        "thc_max": 0, (Toujours 0 pour l'alimentaire)
        "attributes": {
            "benefits": ["Sain", "Bio", " Artisanal"], (minimum 3 caractéristiques)
            "aromas": ["Savoureux", "Frais", "Naturel"] (minimum 3 notes gustatives)
        }
    }
    
    IMPORTANT : 
    - Sois réaliste par vrai rapport au nom du produit.
    - Langue : Français.
    `;

    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
                'X-Title': 'Shop-ia Admin AI',
                'HTTP-Referer': window.location.origin,
            },
            body: JSON.stringify({
                model: AI_MODEL,
                messages: [{ role: 'user', content: prompt }]
            }),
        });

        if (!response.ok) throw new Error(`AI error: ${response.status}`);

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) return null;

        // Clean markdown blocks if present
        const jsonString = content.replace(/```json\s?|```/g, '').trim();

        return JSON.parse(jsonString) as GeneratedProductData;
    } catch (err) {
        console.error('[AI] Error generating product info:', err);
        return null;
    }
}

/**
 * Automatically fill empty fields for a product in the database.
 */
export async function autoFillProductSync(product: Product): Promise<boolean> {
    const generated = await generateProductInfo(product.name, (product.category as any)?.name);
    if (!generated) return false;

    const updates: any = {};
    if (!product.description && generated.description) updates.description = generated.description;
    if (!product.cbd_percentage && generated.cbd_percentage) updates.cbd_percentage = generated.cbd_percentage;
    if (!product.thc_max && generated.thc_max) updates.thc_max = generated.thc_max;

    const currentAttrs = product.attributes || {};
    const hasBenefits = currentAttrs.benefits && currentAttrs.benefits.length > 0;
    const hasAromas = currentAttrs.aromas && currentAttrs.aromas.length > 0;

    if (!hasBenefits || !hasAromas) {
        updates.attributes = {
            ...currentAttrs,
            benefits: hasBenefits ? currentAttrs.benefits : generated.attributes?.benefits || [],
            aromas: hasAromas ? currentAttrs.aromas : generated.attributes?.aromas || [],
        };
    }

    if (Object.keys(updates).length === 0) return true;

    const { error } = await supabase.from('products').update(updates).eq('id', product.id);
    if (error) {
        console.error('[AI] Update error:', error);
        return false;
    }

    return true;
}
