require('dotenv').config();

// 테스트 환경 설정
const testConfig = {
    port: process.env.TEST_PORT || 3001,
    anthropicKey: process.env.ANTHROPIC_API_KEY,
};

// 환경 변수 검증
if (!testConfig.anthropicKey) {
    throw new Error('ANTHROPIC_API_KEY is required');
}

module.exports = testConfig;
