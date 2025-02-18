const { createNode } = require('../graph/nodes');
const fs = require('fs/promises');
const path = require('path');

const evaluator = createNode('evaluator', async (input, context) => {
    const { spec, code, testResults } = input;
    const storageDir = path.join(__dirname, '../storage');
    
    // 결과 저장
    const timestamp = Date.now();
    const metadata = {
        timestamp,
        spec,
        testResults
    };

    try {
        // 함수 코드 저장
        await fs.writeFile(
            path.join(storageDir, `${spec.functionName}.js`),
            code
        );

        // 메타데이터 저장
        await fs.writeFile(
            path.join(storageDir, `${spec.functionName}.json`),
            JSON.stringify(metadata, null, 2)
        );

        return {
            status: 'success',
            functionName: spec.functionName,
            testSummary: testResults.analysis
        };
    } catch (error) {
        return {
            status: 'error',
            error: error.message
        };
    }
});

module.exports = evaluator;
