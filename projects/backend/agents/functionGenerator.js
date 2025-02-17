const { StateGraph, RunnableSequence } = require("@langchain/langgraph");
const { Anthropic } = require("@anthropic-ai/sdk");

class FunctionGeneratorAgent {
    constructor() {
        this.client = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
        this.chain = this.createChain();
    }

    createChain() {
        return RunnableSequence.from([
            async (request) => {
                const response = await this.client.messages.create({
                    model: "claude-2",
                    messages: [{
                        role: "user",
                        content: `Create a JavaScript function that handles HTTP requests with the following requirements: ${request}
                        Return only the function code without any explanation.`
                    }],
                    max_tokens: 2000
                });
                return response.content;
            },
            (functionCode) => ({
                code: functionCode,
                metadata: {
                    description: request,
                    timestamp: new Date().toISOString()
                }
            })
        ]);
    }

    async generateFunction(request) {
        return await this.chain.invoke(request);
    }
}

module.exports = FunctionGeneratorAgent;
