// =============================================================================
// Embedding Service — Hugging Face Inference API (free tier)
// Model: sentence-transformers/all-MiniLM-L6-v2 → 384 dimensions
// Free: ~1000 req/day. For dev this is plenty; for prod, batch carefully.
//
// Alternative free options:
// - Voyage AI (free tier): voyage-3-lite (512-dim)
// - Cohere (free tier): embed-multilingual-light-v3.0 (384-dim)
// - Self-hosted via docker: requires GPU, not suitable for Codespaces
// =============================================================================

const HF_INFERENCE_URL = "https://api-inference.huggingface.co/pipeline/feature-extraction";

export interface EmbeddingConfig {
  model?: string;
  normalize?: boolean;
}

/**
 * Embed a single text string.
 * Returns a 384-dimensional float32 vector.
 */
export async function embedText(
  text: string,
  config: EmbeddingConfig = {},
): Promise<number[]> {
  const model =
    config.model ??
    process.env.HUGGINGFACE_EMBEDDING_MODEL ??
    "sentence-transformers/all-MiniLM-L6-v2";

  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) throw new Error("HUGGINGFACE_API_KEY is not configured");

  const response = await fetch(`${HF_INFERENCE_URL}/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: text,
      options: { wait_for_model: true },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`HuggingFace embedding error ${response.status}: ${err}`);
  }

  const embedding = await response.json();

  // HF returns nested array for batch, flat for single
  const vector = Array.isArray(embedding[0]) ? embedding[0] : embedding;

  if (config.normalize !== false) {
    return normalizeVector(vector as number[]);
  }

  return vector as number[];
}

/**
 * Embed multiple texts in a single API call (more efficient).
 * Returns array of 384-dim vectors.
 */
export async function embedBatch(
  texts: string[],
  config: EmbeddingConfig = {},
): Promise<number[][]> {
  if (texts.length === 0) return [];

  const model =
    config.model ??
    process.env.HUGGINGFACE_EMBEDDING_MODEL ??
    "sentence-transformers/all-MiniLM-L6-v2";

  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) throw new Error("HUGGINGFACE_API_KEY is not configured");

  const response = await fetch(`${HF_INFERENCE_URL}/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: texts,
      options: { wait_for_model: true },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`HuggingFace batch embedding error ${response.status}: ${err}`);
  }

  const embeddings = await response.json();

  return (embeddings as number[][]).map((vec) =>
    config.normalize !== false ? normalizeVector(vec) : vec,
  );
}

/**
 * L2-normalize a vector (for cosine similarity via dot product).
 */
export function normalizeVector(vec: number[]): number[] {
  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
  if (norm === 0) return vec;
  return vec.map((v) => v / norm);
}

/**
 * Cosine similarity between two vectors.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) throw new Error("Vector dimension mismatch");
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
}

export const EMBEDDING_DIMENSIONS = 384;
export const EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2";
