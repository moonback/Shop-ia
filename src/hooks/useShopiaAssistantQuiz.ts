import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../lib/types';
import { QuizOption, ShopiaAssistantSettings } from '../lib/shopiaAssistantSettings';
import { SavedPrefs } from './useShopiaAssistantMemory';
import { useAuthStore } from '../store/authStore';
import { Answers, Message, scoreProduct, scoreAromas, generateAdvice, callAI } from '../lib/shopiaAssistantHelpers';

interface ShopiaAssistantMemoryLike {
    savePrefs: (prefs: SavedPrefs) => Promise<void> | void;
    pastProducts: { product_name: string }[];
    savedPrefs: SavedPrefs | null;
}

interface UseShopiaAssistantQuizParams {
    settings: ShopiaAssistantSettings;
    products: Product[];
    messages: Message[];
    answers: Answers;
    stepIndex: number;
    aromaSelection: string[];
    memory: ShopiaAssistantMemoryLike;
    setStepIndex: React.Dispatch<React.SetStateAction<number>>;
    setAnswers: React.Dispatch<React.SetStateAction<Answers>>;
    setAwaitingAroma: React.Dispatch<React.SetStateAction<boolean>>;
    setAromaSelection: React.Dispatch<React.SetStateAction<string[]>>;
    setIsTyping: React.Dispatch<React.SetStateAction<boolean>>;
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    addBotMessage: (msg: Partial<Message>, delay?: number) => void;
    addUserMessage: (text: string) => void;
}

export function useShopiaAssistantQuiz({
    settings,
    products,
    messages,
    answers,
    stepIndex,
    aromaSelection,
    memory,
    setStepIndex,
    setAnswers,
    setAwaitingAroma,
    setAromaSelection,
    setIsTyping,
    setMessages,
    addBotMessage,
    addUserMessage,
}: UseShopiaAssistantQuizParams) {
    const generateRecommendations = useCallback(async (finalAnswers: Answers) => {
        setIsTyping(true);
        memory.savePrefs(finalAnswers as unknown as SavedPrefs);

        const scored = [...products]
            .map((p) => ({ product: p, score: scoreProduct(p, finalAnswers) + scoreAromas(p, aromaSelection) }))
            .sort((a, b) => b.score - a.score)
            .filter((x) => x.score > 0)
            .slice(0, settings.recommendations_count)
            .map((x) => x.product);

        const ctxParts: string[] = [];
        if (memory.pastProducts.length > 0) {
            ctxParts.push(`Derniers achats : ${memory.pastProducts.slice(0, 3).map((p) => p.product_name).join(', ')}.`);
        }
        if (aromaSelection.length > 0) {
            ctxParts.push(`Arômes & saveurs préférés : ${aromaSelection.join(', ')}.`);
        }
        const geminiContext = ctxParts.join(' ') || undefined;

        const history = messages
            .filter((m) => m.text && !m.isResult)
            .map((m) => ({
                role: m.sender === 'user' ? 'user' : ('assistant' as const),
                content: m.text || '',
            }));

        const aiText = await callAI(finalAnswers, products, settings, history, geminiContext);
        const adviceText = aiText ?? generateAdvice(finalAnswers, aromaSelection);

        setMessages((prev) => [...prev, {
            id: Math.random().toString(36).substring(7),
            sender: 'bot',
            text: adviceText,
            isResult: true,
            recommended: scored,
        }]);

        const { user } = useAuthStore.getState();
        if (user && scored.length > 0) {
            try {
                const { error } = await supabase.from('assistant_interactions').insert({
                    user_id: user.id,
                    interaction_type: 'recommendation',
                    recommended_products: scored.map((p) => p.id),
                    quiz_answers: finalAnswers,
                    created_at: new Date().toISOString(),
                });
                if (error) console.error('[ShopiaAssistant] Recommendation log error:', error);
            } catch (err) {
                console.error('[ShopiaAssistant] Recommendation log exception:', err);
            }
        }

        setIsTyping(false);
    }, [memory, messages, products, setIsTyping, setMessages, settings, aromaSelection]);

    const startQuiz = useCallback(() => {
        setStepIndex(0);
        const firstStep = settings.quiz_steps[0];
        if (firstStep) {
            addBotMessage({
                text: firstStep.question,
                isOptions: true,
                options: firstStep.options,
                stepId: firstStep.id,
            });
        }
    }, [addBotMessage, setStepIndex, settings.quiz_steps]);

    const skipQuizAndRecommend = useCallback(async () => {
        if (!memory.savedPrefs) return;
        addBotMessage({ text: '✨ **Recherche en cours...** Je me base sur vos préférences habituelles pour vous proposer le meilleur du catalogue.' }, 200);

        const prefs = memory.savedPrefs;
        const answersFromPrefs: Answers = {
            goal: prefs.goal,
            experience: prefs.experience,
            format: prefs.format,
            budget: prefs.budget,
        };
        setAnswers(answersFromPrefs);
        await generateRecommendations(answersFromPrefs);
    }, [addBotMessage, generateRecommendations, memory.savedPrefs, setAnswers]);

    const handleAnswer = useCallback(async (option: QuizOption, stepId: string) => {
        addUserMessage(option.label);

        if (option.value === 'start_quiz') {
            startQuiz();
            return;
        }
        if (option.value === 'upsell_info') {
            addBotMessage({ text: "Excellent réflexe ! Varier les plaisirs permet de découvrir toute l'étendue de nos saveurs. Voici mes meilleures recommandations pour compléter votre panier :" }, 400);
            await generateRecommendations({ ...answers, format: 'oil' });
            return;
        }
        if (option.value === 'later') {
            addBotMessage({ text: "Pas de souci ! N'hésitez pas à me solliciter si vous avez besoin d'un conseil plus tard. 😊" }, 400);
            return;
        }

        const newAnswers = { ...answers, [stepId]: option.value };
        setAnswers(newAnswers);

        const nextIndex = stepIndex + 1;

        if (stepId === 'experience' && option.value === 'expert') {
            setStepIndex(nextIndex);
            setAwaitingAroma(true);
            setAromaSelection([]);
            addBotMessage({
                type: 'aroma',
                text: '🛍️ Pour personnaliser vos recommandations, affinez votre profil ! Sélectionnez vos critères préférés (optionnel) :',
            });
            return;
        }

        if (nextIndex < settings.quiz_steps.length) {
            setStepIndex(nextIndex);
            const nextStep = settings.quiz_steps[nextIndex];
            addBotMessage({
                text: nextStep.question,
                isOptions: true,
                options: nextStep.options,
                stepId: nextStep.id,
            });
        } else {
            await generateRecommendations(newAnswers);
        }
    }, [addBotMessage, addUserMessage, answers, generateRecommendations, setAnswers, setAwaitingAroma, setStepIndex, setAromaSelection, settings.quiz_steps, startQuiz, stepIndex]);

    const confirmAromaSelection = useCallback(() => {
        setAwaitingAroma(false);
        if (aromaSelection.length > 0) {
            addUserMessage(`Arômes & saveurs : ${aromaSelection.join(', ')} ✨`);
        } else {
            addUserMessage('Je passe cette étape →');
        }

        const nextStep = settings.quiz_steps[stepIndex];
        if (nextStep) {
            addBotMessage({
                text: nextStep.question,
                isOptions: true,
                options: nextStep.options,
                stepId: nextStep.id,
            });
        } else {
            generateRecommendations(answers);
        }
    }, [addBotMessage, addUserMessage, answers, generateRecommendations, setAwaitingAroma, settings.quiz_steps, stepIndex, aromaSelection]);

    return {
        startQuiz,
        skipQuizAndRecommend,
        handleAnswer,
        confirmAromaSelection,
        generateRecommendations,
    };
}
