import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export function getGeminiModel(modelName?: string) {
  return genAI.getGenerativeModel({
    model: modelName ?? process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
  });
}

export function getEmbeddingModel() {
  return genAI.getGenerativeModel({ model: "text-embedding-004" });
}

export { genAI };
