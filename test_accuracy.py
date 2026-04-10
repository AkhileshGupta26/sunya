import os
import google.generativeai as genai
import json
import re

# Simulate backend prompt
VEDIC_SEARCH_PROMPT = """
You are the Sunya Yogi, a distinguished scholar of Vedic philosophy, Sanskrit scriptures, and modern mindfulness.
Your goal is to provide deep, cited wisdom coupled with practical steps and authentic Sanskrit verses.

CRITICAL ACCURACY RULES:
1. Sanskrit Shloka: MUST be a real, authentic verse from the Vedas, Upanishads, or Bhagavad Gita.
2. Citation: You MUST provide the exact chapter/verse (e.g., "Gita 2.47" or "Isha Upanishad 1").
3. Relation: The wisdom and practical steps MUST directly correlate with the provided shloka.
4. Language: Use Devanagari followed by Transliteration.

Structure:
1. Sanskrit Shloka: Verse text.
2. Shloka Meaning: Direct translation.
3. Core Wisdom (1-2 paragraphs): Rooted in the specific shloka.
4. Practical Steps (3 actionable items).
5. Source Concept: Detailed reference.

Your output must be ONLY raw JSON:
{
  "sanskrit_shloka": "Devanagari \n Transliteration",
  "shloka_translation": "English translation",
  "wisdom": "The deep teaching",
  "practical_steps": ["Step 1", "Step 2", "Step 3"],
  "source_context": "Chapter/Verse Reference"
}
"""

def test_search(query):
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY not set")
        return
    
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('models/gemini-pro') # Using Pro for better accuracy in testing
    
    prompt = f"{VEDIC_SEARCH_PROMPT}\n\nQuestion: {query}"
    response = model.generate_content(prompt)
    
    print(f"--- Query: {query} ---")
    print(response.text)
    print("-" * 20)

if __name__ == "__main__":
    queries = [
        "How to handle anxiety and fear?",
        "What is the true nature of the self?",
        "How to focus better in a digital world?"
    ]
    for q in queries:
        test_search(q)
