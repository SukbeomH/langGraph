const { Anthropic } = require("@anthropic-ai/sdk");
const { MemoryVectorStore } = require("langchain/vectorstores/memory");

class ClaudeEmbeddings {
    constructor() {
        this.client = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
    }

    async embedQuery(text) {
        const response = await this.client.messages.create({
            model: "claude-2",
            messages: [{
                role: "user",
                content: `Convert the following text into a numerical embedding vector that captures its semantic meaning. Text: "${text}"`
            }],
            max_tokens: 1024
        });
        return this.parseEmbedding(response.content);
    }

    async embedDocuments(documents) {
        return Promise.all(documents.map(doc => this.embedQuery(doc)));
    }

    parseEmbedding(text) {
        // Claude의 응답에서 벡터 값을 추출하는 로직
        // 실제 구현에서는 더 정교한 파싱이 필요할 수 있습니다
        try {
            const vectorString = text.match(/\[.*\]/)[0];
            return JSON.parse(vectorString);
        } catch (error) {
            console.error("Error parsing embedding:", error);
            return new Array(1536).fill(0); // 기본 크기의 벡터 반환
        }
    }
}

class VectorStore {
    constructor() {
        this.embeddings = new ClaudeEmbeddings();
        this.store = new MemoryVectorStore(this.embeddings);
    }

    async addFunction(functionData) {
        const { code, documentation, metadata } = functionData;
        await this.store.addDocuments([{
            pageContent: code + "\n" + documentation,
            metadata: metadata
        }]);
    }

    async searchSimilar(query, k = 5) {
        const results = await this.store.similaritySearch(query, k);
        return results.map(doc => ({
            content: doc.pageContent,
            metadata: doc.metadata
        }));
    }
}

module.exports = VectorStore;
