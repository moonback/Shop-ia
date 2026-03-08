import { generateEmbedding } from './embeddings';
import { supabase } from './supabase';
import { Product } from './types';

function fallbackKeywordSearch(text: string, products: Product[]): Product[] {
    const keywords = text.toLowerCase().split(' ').filter((k) => k.length > 3);

    return products
        .map((p) => {
            let score = 0;
            const pName = p.name.toLowerCase();
            const pDesc = (p.description || '').toLowerCase();
            const pCat = (p.category?.name || '').toLowerCase();

            keywords.forEach((k) => {
                if (pName.includes(k)) score += 5;
                if (pDesc.includes(k)) score += 2;
                if (pCat.includes(k)) score += 3;
            });

            return { product: p, score };
        })
        .sort((a, b) => b.score - a.score)
        .filter((x) => x.score > 0)
        .slice(0, 10)
        .map((x) => x.product);
}

export async function getRelevantProductsForQuery(text: string, products: Product[]): Promise<Product[]> {
    let relevantProducts: Product[] = [];

    try {
        console.log('[Assistant RAG] Semantic search for:', text);
        const embedding = await generateEmbedding(text);
        const { data, error } = await supabase.rpc('match_products', {
            query_embedding: embedding,
            match_threshold: 0.1,
            match_count: 10,
        });

        if (error) throw error;
        if (data && data.length > 0) {
            relevantProducts = data;
            console.log(`[Assistant RAG] Found ${data.length} semantic matches.`);
        }
    } catch (err) {
        console.warn('[Assistant RAG] Vector search failed, falling back to keywords:', err);
        relevantProducts = fallbackKeywordSearch(text, products);
    }

    if (relevantProducts.length === 0) {
        relevantProducts = products.filter((p) => p.is_featured).slice(0, 5);
    }

    return relevantProducts;
}
