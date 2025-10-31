// lib/aiRecommendations.ts
import axios from "axios";
import { studentAPI } from "./api-client";

interface RecommendationItem {
  _id: string;
  name: string;
  reason: string;
  category: string;
  price: number;
  emoji: string;
  stock: number;
}

export const generateAIRecommendations = async (
  cartItemName: string,
  cartItemCategory: string,
  cartItemPrice: number,
  currentCartItems: string[] = [], // Names of items already in cart
  userHistory: string[] = []
): Promise<RecommendationItem[]> => {
  try {
    // STEP 1: Fetch all available products from your database
    const allProducts = await studentAPI.getProducts();

    
    if (!allProducts || allProducts.length === 0) {
      return [];
    }

    // STEP 2: Filter out products already in cart AND ensure stock > 0
    const availableProducts = allProducts.filter((p: any) => 
      p.stock > 0 && !currentCartItems.includes(p.name)
    );
    
    if (availableProducts.length === 0) {
      return [];
    }

    // Create a detailed product list for the AI
    const productList = availableProducts.map((p: any, idx: number) => 
      `${idx + 1}. ${p.name} | Category: ${p.category} | Price: ৳${p.price} | Stock: ${p.stock}`
    ).join('\n');

    // STEP 3: Build intelligent prompt
    const prompt = `
You are recommending stationery products to a CUET (Chittagong University of Engineering & Technology) student preparing for their entrance exam.

CONTEXT:
- Student just added: "${cartItemName}" (${cartItemCategory}, ৳${cartItemPrice})
- Items already in their cart: ${currentCartItems.length > 0 ? currentCartItems.join(", ") : "None yet"}
${userHistory.length > 0 ? `- Previous purchases: ${userHistory.join(", ")}` : ""}

AVAILABLE PRODUCTS (NOT in cart):
${productList}

//Task for the AI for AI recommendation

TASK:
Select exactly 4 products that would be most valuable additions to their cart. Consider:

1. COMPLEMENTARY USE: Items that naturally pair with "${cartItemName}"
   - If they bought pens, suggest notebooks or practice sheets
   - If they bought books, suggest highlighters or sticky notes
   - If they bought math tools, suggest graph paper or calculators

2. EXAM PREPARATION ESSENTIALS: Must-have items for CUET exam success
   - Study aids that improve learning efficiency
   - Organization tools for better time management
   - Quality writing instruments for exam day

3. DIVERSE CATEGORIES: Provide variety across different product types
   - Avoid recommending multiple items from the same category
   - Balance practical needs with study enhancement

4. SMART PRICING: Match their spending pattern
   - If cart item is ৳${cartItemPrice}, suggest items in ৳${Math.floor(cartItemPrice * 0.5)}-৳${Math.floor(cartItemPrice * 1.5)} range
   - Include at least one budget-friendly option
   - Prioritize value for money

5. AVOID REDUNDANCY: 
   - Don't suggest items too similar to what's in cart
   - Don't repeat categories unless highly relevant

Respond ONLY with valid JSON (no markdown, no extra text):
[
  {"productNumber": 2, "reason": "Specific reason explaining why this complements their purchase"},
  {"productNumber": 7, "reason": "Clear benefit for CUET exam preparation"},
  {"productNumber": 12, "reason": "How this adds value to their study routine"},
  {"productNumber": 18, "reason": "Why this is essential alongside their cart items"}
]

CRITICAL: Use ONLY product numbers (1-${availableProducts.length}) from the list above.
    `.trim();

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `You are an expert CUET exam preparation shopping assistant. Your recommendations must:
- Be based ONLY on the provided product database
- Exclude items already in the customer's cart
- Provide specific, actionable reasons for each recommendation
- Focus on complementary products and exam success
- Return ONLY valid JSON array format with no markdown or extra text
- Select products that together create a complete study kit`,
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 600,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer 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`,
        },
        timeout: 10000,
      }
    );

    const aiResponse = response.data?.choices?.[0]?.message?.content || "[]";
    const cleanResponse = aiResponse.replace(/```json|```/g, "").trim();
    
    const selections: { productNumber: number; reason: string }[] = JSON.parse(cleanResponse);

    // STEP 4: Map AI selections to actual database products
    const recommendations: RecommendationItem[] = selections
      .map((sel) => {
        const product = availableProducts[sel.productNumber - 1];
        if (!product) return null;
        
        // Double-check it's not in cart (safety check)
        if (currentCartItems.includes(product.name)) return null;
        
        return {
          _id: product._id || product.id,
          name: product.name,
          reason: sel.reason,
          category: product.category,
          price: product.price,
          emoji: product.emoji || "📦",
          stock: product.stock,
        };
      })
      .filter((item): item is RecommendationItem => item !== null)
      .slice(0, 4); // Ensure max 4 recommendations

    return recommendations;

  } catch (err) {
    // Check if it's a rate limit error
    if (axios.isAxiosError(err) && err.response?.status === 429) {
      console.warn("Groq API rate limit reached. Using fallback recommendations.");
    } else {
      console.error("AI recommendation failed:", err);
    }
    
    // FALLBACK: Return smart random products from database (excluding cart items)
    try {
      const allProducts = await studentAPI.getProducts();

      const availableProducts = allProducts.filter((p: any) => 
        p.stock > 0 && !currentCartItems.includes(p.name)
      );
      
      // Shuffle and take 4 random products
      const shuffled = availableProducts.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 4).map((p: any) => ({
        _id: p._id || p.id,
        name: p.name,
        reason: "Recommended for CUET exam preparation",
        category: p.category,
        price: p.price,
        emoji: p.emoji || "📦",
        stock: p.stock,
      }));
    } catch {
      return [];
    }
  }
};