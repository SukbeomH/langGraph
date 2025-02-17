const { StateGraph } = require("@langchain/langgraph");
const FunctionGeneratorAgent = require("../agents/functionGenerator");
const MockGeneratorAgent = require("../agents/mockGenerator");
const TestValidatorAgent = require("../agents/testValidator");
const DocumentationGeneratorAgent = require("../agents/documentationGenerator");

class WorkflowGraph {
    constructor() {
        this.functionGenerator = new FunctionGeneratorAgent();
        this.mockGenerator = new MockGeneratorAgent();
        this.testValidator = new TestValidatorAgent();
        this.documentationGenerator = new DocumentationGeneratorAgent();
    }

    async execute(request) {
        try {
            console.log("Starting workflow execution with request:", request);
            
            // 함수 생성
            const functionResult = await this.functionGenerator.generateFunction(request);
            console.log("Function generated:", functionResult);
            
            // 테스트 케이스 생성
            const mockResult = await this.mockGenerator.generateMockRequests(functionResult.code);
            console.log("Mock requests generated:", mockResult);
            
            // 테스트 실행
            const testResult = await this.testValidator.validateFunction(
                functionResult.code,
                mockResult.testCases
            );
            console.log("Tests executed:", testResult);
            
            // 문서 생성
            const docResult = await this.documentationGenerator.generateDocumentation(
                functionResult.code,
                testResult
            );
            console.log("Documentation generated:", docResult);

            return {
                success: true,
                function: functionResult,
                tests: testResult,
                docs: docResult
            };
        } catch (error) {
            console.error("Workflow Error:", error);
            throw error;
        }
    }
}

module.exports = WorkflowGraph;
