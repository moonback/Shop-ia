import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../lib/types';
import { BudTenderSettings } from '../lib/budtenderSettings';
import { getChatPrompt } from '../lib/budtenderPrompts';
import { Message } from '../lib/budtenderHelpers';
import { getRelevantProductsForQuery } from '../lib/budtenderVectorSearch';

interface BudTenderMemoryContext {
    savedPrefs: Record<string, any> | null;
    userName: string | null;
    pastProducts: { product_name: string }[];
}

interface UseBudTenderChatParams {
    chatInput: string;
    isTyping: boolean;
    settings: BudTenderSettings;
    messages: Message[];
    products: Product[];
    memory: BudTenderMemoryContext;
    setChatInput: React.Dispatch<React.SetStateAction<string>>;
    setIsTyping: React.Dispatch<React.SetStateAction<boolean>>;
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    addUserMessage: (text: string) => void;
    addBotMessage: (msg: Partial<Message>, delay?: number) => void;
    addItem: (product: Product, quantity?: number) => void;
    openSidebar: () => void;
    logQuestion: (text: string) => void;
}

export function useBudTenderChat({
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
}: UseBudTenderChatParams) {
    return useCallback(async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const text = chatInput.trim();
        if (!text || isTyping) return;

        setChatInput('');
        addUserMessage(text);
        logQuestion(text);
        setIsTyping(true);

        const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
        if (!apiKey || !settings.ai_enabled) {
            addBotMessage({ text: "Désolé, ma connexion à l'IA n'est pas configurée pour le moment." });
            setIsTyping(false);
            return;
        }

        const relevantProducts = await getRelevantProductsForQuery(text, products);

        const catalog = relevantProducts
            .map((p) => {
                const aromas = (p.attributes?.aromas ?? []).join(', ');
                const benefits = (p.attributes?.benefits ?? []).join(', ');
                return `- ${p.name} (${p.category?.slug}, ${p.price}€). ${p.description ?? ''} ${aromas ? 'Arômes: ' + aromas : ''} ${benefits ? 'Effets: ' + benefits : ''}`;
            })
            .join('\n');

        const { savedPrefs, userName, pastProducts } = memory;
        let userContext = '';
        if (userName) userContext += `Nom du client: ${userName}\n`;
        if (pastProducts.length > 0) {
            userContext += `Historique d'achats: ${pastProducts.slice(0, 3).map((p) => p.product_name).join(', ')}\n`;
        }
        if (savedPrefs) {
            const { goal, experience, format, budget, age, intensity, terpenes, ...others } = savedPrefs;
            const entries = [
                `Objectif: ${goal}`,
                `Expérience: ${experience}`,
                `Format: ${format}`,
                `Budget: ${budget}`,
                `Âge: ${age || 'Non précisé'}`,
                `Intensité: ${intensity || 'Non précisé'}`,
                `Terpènes: ${Array.isArray(terpenes) ? terpenes.join(', ') : 'Aucun'}`,
            ];
            Object.entries(others).forEach(([k, v]) => { if (v) entries.push(`${k}: ${v}`); });
            userContext += `Préférences: ${entries.join(' | ')}`;
        }

        const systemPrompt = getChatPrompt(text, catalog, userContext);

        const history: { role: 'user' | 'assistant'; content: string }[] = [];
        messages
            .filter((m) => m.text && !m.isResult)
            .forEach((m) => {
                const role = m.sender === 'user' ? 'user' : 'assistant';
                if (history.length > 0 && history[history.length - 1].role === role) {
                    history[history.length - 1].content += `\n${m.text}`;
                } else {
                    history.push({ role, content: m.text || '' });
                }
            });

        const messagesForAI: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
            { role: 'system', content: systemPrompt },
            ...history,
        ];

        if (messagesForAI[messagesForAI.length - 1].role !== 'user') {
            messagesForAI.push({ role: 'user', content: text });
        }

        const modelToUse = settings.ai_model || 'google/gemini-2.0-flash-lite-preview-02-05:free';
        console.log('[BudTender Chat] Sending messages to:', modelToUse);

        const tools = [{
            type: 'function',
            function: {
                name: 'add_to_cart',
                description: "Ajouter un ou plusieurs produits au panier. Précisez soit la quantité d'unités (ex: 4 fois), soit le poids total en grammes (ex: 10 grammes).",
                parameters: {
                    type: 'object',
                    properties: {
                        product_name: { type: 'string', description: 'Le nom du produit à ajouter.' },
                        quantity: { type: 'number', description: "Nombre d'unités (ex: 4)." },
                        weight_grams: { type: 'number', description: 'Poids total en grammes (ex: 10).' },
                    },
                    required: ['product_name'],
                },
            },
        }];

        try {
            const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'X-Title': 'Green Mood BudTender',
                    'HTTP-Referer': window.location.origin,
                },
                body: JSON.stringify({
                    model: modelToUse,
                    messages: messagesForAI,
                    tools,
                    tool_choice: 'auto',
                    temperature: settings.ai_temperature,
                    max_tokens: settings.ai_max_tokens,
                }),
            });

            const json = await res.json();
            if (!res.ok) {
                const errDetail = json.error?.message || json.error?.code || 'Inconnue';
                console.error('OpenRouter Detailed Error:', json);
                addBotMessage({ text: `Erreur OpenRouter (${res.status}) : ${errDetail}` });
                return;
            }
            if (res.status === 429) {
                addBotMessage({ text: 'Désolé, je reçois trop de messages en ce moment (limite OpenRouter). Pourriez-vous patienter une minute ? 🙏' });
                return;
            }

            const choice = json?.choices?.[0];
            const responseMessage = choice?.message;
            const responseText = responseMessage?.content;
            const toolCalls = responseMessage?.tool_calls;

            if (toolCalls && toolCalls.length > 0) {
                for (const toolCall of toolCalls) {
                    if (toolCall.function.name !== 'add_to_cart') continue;

                    const args = JSON.parse(toolCall.function.arguments);
                    const prodName = (args.product_name || '').trim();
                    const weightGrams = Number(args.weight_grams) || 0;
                    let qty = Number(args.quantity) || 0;

                    const prodNameLower = prodName.toLowerCase();
                    let product = relevantProducts.find((i) => i.name.toLowerCase() === prodNameLower)
                        || products.find((i) => i.name.toLowerCase() === prodNameLower)
                        || relevantProducts.find((i) => i.name.toLowerCase().includes(prodNameLower) || prodNameLower.includes(i.name.toLowerCase()));

                    if (!product) {
                        try {
                            const { data } = await supabase
                                .from('products')
                                .select('*, category:categories(slug, name)')
                                .ilike('name', `%${prodName}%`)
                                .eq('is_active', true)
                                .limit(1)
                                .maybeSingle();
                            if (data) product = data as Product;
                        } catch (error) {
                            console.error('[BudTender Chat] Supabase fallback failed:', error);
                        }
                    }

                    if (product) {
                        if (weightGrams > 0) {
                            const unitWeight = product.weight_grams || 1;
                            qty = Math.max(1, Math.round(weightGrams / unitWeight));
                        } else if (qty <= 0) {
                            qty = 1;
                        }
                        addItem(product, qty);
                        openSidebar();
                        addBotMessage({
                            text: weightGrams > 0
                                ? `🛒 J'ai ajouté **${weightGrams}g** de **${product.name}** (équivalent à x${qty}) à votre panier.`
                                : `🛒 J'ai ajouté **${qty}x ${product.name}** à votre panier.`,
                        }, 400);
                    } else {
                        addBotMessage({ text: `Désolé, je n'ai pas trouvé le produit "${prodName}" dans notre catalogue.` }, 400);
                    }
                }
            }

            if (responseText) {
                setMessages((prev) => [...prev, {
                    id: Math.random().toString(36).substring(7),
                    sender: 'bot',
                    text: responseText,
                }]);
            } else if (!toolCalls) {
                console.error('OpenRouter empty response:', json);
                addBotMessage({ text: "Je n'ai pas pu analyser votre message correctement. Pouvez-vous reformuler ?" });
            }
        } catch (err) {
            console.error('OpenRouter handleSendMessage error:', err);
            addBotMessage({ text: "Oups, j'ai eu une petite déconnexion. Pouvez-vous réessayer ?" });
        } finally {
            setIsTyping(false);
        }
    }, [addBotMessage, addItem, addUserMessage, chatInput, isTyping, logQuestion, memory, messages, openSidebar, products, setChatInput, setIsTyping, setMessages, settings]);
}
