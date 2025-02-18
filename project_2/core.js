const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs/promises');
const path = require('path');

class CoreSystem {
    constructor() {
        if (!process.env.ANTHROPIC_API_KEY) {
            throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
        }

        // Anthropic API 클라이언트 초기화
        this.client = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY
        });

        this.storageDir = path.join(__dirname, 'storage');
        this.resultsDir = path.join(this.storageDir, 'results');
        this.functionsDir = path.join(this.storageDir, 'functions');
        this.init();
    }

    async init() {
        try {
            await Promise.all([
                fs.mkdir(this.resultsDir, { recursive: true }),
                fs.mkdir(this.functionsDir, { recursive: true })
            ]);
        } catch (error) {
            console.error('Storage directory creation failed:', error);
            throw new Error('Failed to initialize storage system');
        }
    }

    /**
     * LLM Assist: 자연어를 함수 스펙으로 변환
     */
    async generateFunctionSpec(naturalLanguageRequest) {
        try {
            const response = await this.client.messages.create({
                model: "claude-3-opus-20240229",
                messages: [{
                    role: "user",
                    content: `다음 요구사항에 대한 JavaScript 함수 스펙을 생성해주세요. 
                    함수는 HTTP 요청을 처리하는 용도입니다.
                    요구사항: ${naturalLanguageRequest}
                    
                    다음 형식으로 응답해주세요:
                    {
                        "functionName": "함수명",
                        "parameters": [{"name": "파라미터명", "type": "타입", "description": "설명"}],
                        "returnType": "반환타입",
                        "description": "함수 설명",
                        "httpMethod": "HTTP 메서드",
                        "endpoint": "엔드포인트 경로"
                    }`
                }]
            });

            try {
                const result = response.content[0].text;
                console.log('Raw API Response:', response); // 디버깅용
                console.log('Generated spec text:', result); // 디버깅용
                return JSON.parse(result);
            } catch (parseError) {
                console.error('JSON parsing failed:', parseError);
                throw new Error('Failed to parse function specification');
            }
        } catch (error) {
            console.error('Function spec generation failed:', error);
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                status: error.status,
                response: error.response
            });
            if (error.message.includes('model: Field required')) {
                throw new Error('API configuration error: Model field is required');
            }
            throw error;
        }
    }

    /**
     * 함수 생성: 스펙을 바탕으로 실제 함수 생성
     */
    async generateFunction(functionSpec) {
        if (!functionSpec?.functionName || !functionSpec?.parameters) {
            throw new Error('Invalid function specification');
        }

        try {
            const message = await this.client.messages.create({
                model: "claude-3-opus-20240229",
                max_tokens: 1500,
                messages: [{
                    role: "user",
                    content: `다음 스펙을 만족하는 JavaScript 함수를 작성해주세요:
                    ${JSON.stringify(functionSpec, null, 2)}
                    
                    Express.js 라우터에서 사용할 수 있는 형태로 작성해주세요.
                    에러 처리와 입력 검증을 포함해주세요.`
                }]
            });

            const functionCode = message.content[0].text;

            // 함수 유효성 검증 추가
            const validationResult = await this.validateGeneratedFunction(functionCode);
            if (!validationResult.isValid) {
                throw new Error(`Invalid generated function: ${validationResult.message}`);
            }

            const metadata = {
                timestamp: new Date().toISOString(),
                spec: functionSpec,
                validation: validationResult
            };

            await this.saveFunction(functionSpec.functionName, functionCode, metadata);
            return { functionCode, metadata };
        } catch (error) {
            console.error('Function generation failed:', error);
            throw error;
        }
    }

    async validateGeneratedFunction(functionCode) {
        try {
            // 기본적인 구문 검사
            new Function(functionCode);
            
            // 추가 검증 로직
            const hasErrorHandling = functionCode.includes('try') && functionCode.includes('catch');
            const hasInputValidation = functionCode.includes('if') || functionCode.includes('throw');

            return {
                isValid: true,
                message: 'Validation passed',
                checks: {
                    hasErrorHandling,
                    hasInputValidation
                }
            };
        } catch (error) {
            return {
                isValid: false,
                message: error.message,
                checks: {}
            };
        }
    }

    /**
     * 더미 HTTP Request 생성
     */
    async generateDummyRequests(functionSpec) {
        try {
            const message = await this.client.messages.create({
                model: "claude-3-opus-20240229",
                max_tokens: 1000,
                messages: [{
                    role: "user",
                    content: `다음 함수 스펙에 대한 테스트용 HTTP 요청 데이터 3개를 생성해주세요:
                    ${JSON.stringify(functionSpec, null, 2)}
                    
                    성공 케이스 2개, 실패 케이스 1개를 포함해주세요.
                    JSON 배열 형식으로 응답해주세요.`
                }]
            });

            return JSON.parse(message.content[0].text);
        } catch (error) {
            console.error('Dummy request generation failed:', error);
            throw error;
        }
    }

    /**
     * 테스트 및 검증
     */
    async testFunction(functionCode, dummyRequests) {
        try {
            const message = await this.client.messages.create({
                model: "claude-3-opus-20240229",
                max_tokens: 1000,
                messages: [{
                    role: "user",
                    content: `다음 함수와 테스트 요청에 대한 실행 결과를 분석해주세요:
                    
                    함수:
                    ${functionCode}
                    
                    테스트 요청:
                    ${JSON.stringify(dummyRequests, null, 2)}
                    
                    각 요청에 대해 예상되는 결과와 발생 가능한 문제점을 설명해주세요.`
                }]
            });

            const testResults = {
                timestamp: new Date().toISOString(),
                function: {
                    code: functionCode,
                    hash: this.generateHash(functionCode)
                },
                requests: dummyRequests,
                results: await this.executeTests(functionCode, dummyRequests),
                analysis: message.content[0].text
            };

            await this.saveTestResults(testResults);
            return testResults;
        } catch (error) {
            console.error('Function testing failed:', error);
            throw error;
        }
    }

    async executeTests(functionCode, requests) {
        const results = [];
        for (const request of requests) {
            try {
                const testFn = new Function('request', functionCode);
                const result = await testFn(request);
                results.push({
                    request,
                    success: true,
                    result
                });
            } catch (error) {
                results.push({
                    request,
                    success: false,
                    error: error.message
                });
            }
        }
        return results;
    }

    /**
     * 저장 및 RAG
     */
    async saveFunction(functionName, functionCode, metadata) {
        const filename = path.join(this.functionsDir, `${functionName}.js`);
        await fs.writeFile(filename, functionCode);
        const metadataFilename = path.join(this.functionsDir, `${functionName}.json`);
        await fs.writeFile(metadataFilename, JSON.stringify(metadata, null, 2));
    }

    async saveTestResults(testResults) {
        const filename = path.join(this.resultsDir, `test_${Date.now()}.json`);
        await fs.writeFile(filename, JSON.stringify(testResults, null, 2));
    }

    async searchSimilarFunctions(query) {
        try {
            const functions = await this.loadAllFunctions();
            if (functions.length === 0) {
                return { message: 'No functions found in storage', results: [] };
            }

            const message = await this.client.messages.create({
                model: "claude-3-opus-20240229",
                max_tokens: 1000,
                messages: [{
                    role: "user",
                    content: `다음 요구사항과 가장 유사한 함수를 찾고 유사도 점수(0-100)를 매겨주세요:
                    요구사항: ${query}
                    
                    함수 목록:
                    ${functions.map(f => `${f.name}:\n${f.content}\n---`).join('\n')}
                    
                    JSON 형식으로 응답해주세요: 
                    { "matches": [{"name": "함수명", "similarity": 점수, "reason": "설명"}] }`
                }]
            });

            return JSON.parse(message.content[0].text);
        } catch (error) {
            console.error('Function search failed:', error);
            throw error;
        }
    }

    async loadAllFunctions() {
        const files = await fs.readdir(this.functionsDir);
        const jsFiles = files.filter(file => file.endsWith('.js'));
        
        return Promise.all(
            jsFiles.map(async file => {
                const content = await fs.readFile(
                    path.join(this.functionsDir, file), 
                    'utf-8'
                );
                return { name: file, content };
            })
        );
    }

    generateHash(content) {
        return require('crypto')
            .createHash('md5')
            .update(content)
            .digest('hex');
    }
}

module.exports = CoreSystem;