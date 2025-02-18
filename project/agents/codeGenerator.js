const { createNode } = require('../graph/nodes');
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

const codeGenerator = createNode('codeGenerator', async (input, context) => {
    const response = await client.messages.create({
        model: "claude-3-opus-20240229",
        messages: [{
            role: "user",
            content: `다음 스펙을 만족하는 JavaScript 함수를 작성해주세요:
            ${JSON.stringify(input, null, 2)}
            
            Express.js 라우터에서 사용할 수 있는 형태로 작성해주세요.
            에러 처리와 입력 검증을 포함해주세요.`
        }]
    });

    return response.content[0].text;
});

module.exports = codeGenerator;
