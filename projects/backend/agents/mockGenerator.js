const { StateGraph, RunnableSequence } = require("@langchain/langgraph");
const { Anthropic } = require("@anthropic-ai/sdk");

class MockGeneratorAgent {
    constructor() {
        this.client = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
        this.chain = this.createChain();
    }

    createChain() {
        return RunnableSequence.from([
            async (functionSpec) => {
                const response = await this.client.messages.create({
                    model: "claude-2",
                    messages: [{
                        role: "user",
                        content: `Generate diverse test HTTP requests as a JSON array for the following function:
                        ${functionSpec}
                        Include both valid and invalid test cases. Return only the JSON array.`
                    }],
                    max_tokens: 1500
                });
                return response.content;
            },
            (response) => ({
                testCases: JSON.parse(response),
                metadata: {
                    timestamp: new Date().toISOString()
                }
            })
        ]);
    }

    async generateMockRequests(functionSpec) {
        return await this.chain.invoke(functionSpec);
    }
}

module.exports = MockGeneratorAgent;
