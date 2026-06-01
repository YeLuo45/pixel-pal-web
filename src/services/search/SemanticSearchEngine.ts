export interface SearchResult {
  id: string;
  content: string;
  score: number;
  metadata: Record<string, any>;
}

export interface SearchOptions {
  limit?: number;
  threshold?: number;
  layer?: string;
}

export class SemanticSearchEngine {
  private store: Map<string, { content: string; embedding?: number[]; metadata: Record<string, any> }> = new Map();

  index(id: string, content: string, metadata?: Record<string, any>): void {
    this.store.set(id, { content, embedding: metadata?.embedding, metadata: metadata || {} });
  }

  remove(id: string): boolean {
    return this.store.delete(id);
  }

  clear(): void {
    this.store.clear();
  }

  search(query: string, options?: SearchOptions): SearchResult[] {
    if (!query.trim()) {
      return [];
    }

    const results: SearchResult[] = [];
    const queryLower = query.toLowerCase();

    for (const [id, entry] of this.store.entries()) {
      if (options?.layer !== undefined) {
        if (!entry.metadata.layer || entry.metadata.layer !== options.layer) {
          continue;
        }
      }

      const score = this.textMatch(queryLower, entry.content);

      if (score > 0) {
        if (options?.threshold && score < options.threshold) {
          continue;
        }

        results.push({
          id,
          content: entry.content,
          score,
          metadata: entry.metadata
        });
      }
    }

    results.sort((a, b) => b.score - a.score);

    if (options?.limit) {
      return results.slice(0, options.limit);
    }

    return results;
  }

  searchByEmbedding(embedding: number[], options?: SearchOptions): SearchResult[] {
    const results: SearchResult[] = [];

    for (const [id, entry] of this.store.entries()) {
      if (entry.embedding) {
        const score = this.cosineSimilarity(embedding, entry.embedding);
        if (score > 0) {
          if (options?.threshold && score < options.threshold) {
            continue;
          }
          results.push({
            id,
            content: entry.content,
            score,
            metadata: entry.metadata
          });
        }
      }
    }

    results.sort((a, b) => b.score - a.score);

    if (options?.limit) {
      return results.slice(0, options.limit);
    }

    return results;
  }

  private textMatch(query: string, content: string): number {
    const contentLower = content.toLowerCase();
    const words = contentLower.split(/\s+/);
    
    // Check for exact word match
    for (const word of words) {
      if (word === query) {
        return 1.0;
      }
    }
    
    // Check for query as substring of content
    if (contentLower.includes(query)) {
      // Give partial credit for substring match that isn't a word
      return 0.7;
    }

    let score = 0;
    const queryTerms = query.split(/\s+/);
    
    for (const term of queryTerms) {
      if (contentLower.includes(term)) {
        score += 0.3;
      }
    }

    const queryLength = query.length;
    const contentLength = content.length;
    
    for (let i = 0; i <= contentLength - queryLength; i++) {
      const substring = contentLower.substring(i, i + queryLength);
      const levenshtein = this.levenshteinDistance(query, substring);
      const similarity = 1 - levenshtein / Math.max(queryLength, substring.length);
      if (similarity > 0.6) {
        score = Math.max(score, similarity);
      }
    }

    return Math.min(score, 1.0);
  }

  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  getIndexSize(): number {
    return this.store.size;
  }
}