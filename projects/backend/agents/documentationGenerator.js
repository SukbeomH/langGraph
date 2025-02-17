const { StateGraph, RunnableSequence } = require("@langchain/langgraph");
const { Anthropic } = require("@anthropic-ai/sdk");

class DocumentationGeneratorAgent {
    constructor() {
        this.client = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
        this.chain = this.createChain();
    }

    createChain() {
        return RunnableSequence.from([
            async (input) => {
                const response = await this.client.messages.create({
                    model: "claude-2",
                    messages: [{
                        role: "user",
                        content: `Generate documentation for the following function and its test results:
                        Function: ${input.functionCode}
                        Test Results: ${JSON.stringify(input.testResults)}`
                    }],
                    max_tokens: 1024
                });
                return response.content;
            },
            (response) => ({
                documentation: response,
                metadata: {
                    timestamp: new Date().toISOString(),
                    functionHash: this.hashCode(input.functionCode)
                }
            })
        ]);
    }

    async generateDocumentation(functionCode, testResults) {
        return await this.chain.invoke({
            functionCode,
            testResults
        });
    }

    hashCode(str) {
        // Simple hash function for function identification
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash = hash & hash;
        }
        return hash.toString(16);
    }
}

module.exports = DocumentationGeneratorAgent;
