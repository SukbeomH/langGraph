const { createNode } = require('../graph/nodes');
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

const specGenerator = createNode('specGenerator', async (input, context) => {
    const response = await client.messages.create({
        model: "claude-3-opus-20240229",
        messages: [{
            role: "user",
            content: `Generate a function specification for: ${input}`
        }]
    });

    return JSON.parse(response.content[0].text);
});

module.exports = specGenerator;
