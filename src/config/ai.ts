const DEFAULT_KEY = 'AIzaSyDhr3WU8yOXMzkoedbzeHiiGA7gWq_-rPY';

export const GEMINI_CONFIG = {
  model: 'gemini-1.5-flash',
  endpoint: 'https://generativelanguage.googleapis.com/v1beta',
  apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || DEFAULT_KEY,
};

export function ensureGeminiKey() {
  if (!GEMINI_CONFIG.apiKey) {
    throw new Error('GEMINI_API_KEY não configurada. Defina EXPO_PUBLIC_GEMINI_API_KEY.');
  }
}
