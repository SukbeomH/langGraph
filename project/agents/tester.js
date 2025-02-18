const { createNode } = require('../graph/nodes');
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

const tester = createNode('tester', async (input, context) => {
    const { code, spec } = input;
    
    // 더미 요청 생성
    const dummyResponse = await client.messages.create({
        model: "claude-3-opus-20240229",
        messages: [{
            role: "user",
            content: `다음 함수 스펙에 대한 테스트용 HTTP 요청 데이터 3개를 생성해주세요:
            ${JSON.stringify(spec, null, 2)}
            성공 케이스 2개, 실패 케이스 1개를 포함해주세요.`
        }]
    });

    const dummyRequests = JSON.parse(dummyResponse.content[0].text);

    // 테스트 실행 및 분석
    const testResponse = await client.messages.create({
        model: "claude-3-opus-20240229",
        messages: [{
            role: "user",
            content: `다음 함수와 테스트 요청에 대한 실행 결과를 분석해주세요:
            함수: ${code}
            테스트 요청: ${JSON.stringify(dummyRequests, null, 2)}`
        }]
    });

    return {
        dummyRequests,
        analysis: testResponse.content[0].text
    };
});

module.exports = tester;
