class VectorSearchService {
  constructor(storeUrl = 'memory://local') {
    this.storeUrl = storeUrl;
  }

  async search(query) {
    return [{ id: 'doc-1', score: 0.99, text: `Vector search placeholder for: ${query}` }];
  }
}

module.exports = { VectorSearchService };
