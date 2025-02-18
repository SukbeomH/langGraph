const { Pipeline } = require('./framework');
const specGenerator = require('../agents/specGenerator');
const codeGenerator = require('../agents/codeGenerator');
const tester = require('../agents/tester');
const evaluator = require('../agents/evaluator');

class FunctionGenerationPipeline extends Pipeline {
    constructor() {
        super();
        this.setupNodes();
        this.setupEdges();
        this.setupEventHandlers();
    }

    setupNodes() {
        this.addNode(specGenerator);
        this.addNode(codeGenerator);
        this.addNode(tester);
        this.addNode(evaluator);
    }

    setupEdges() {
        this.addEdge(specGenerator, codeGenerator);
        this.addEdge(codeGenerator, tester);
        this.addEdge(tester, evaluator);
    }

    setupEventHandlers() {
        this.on('nodeStart', ({ node }) => {
            console.log(`Node ${node.name} started`);
        });

        this.on('nodeComplete', ({ node, result }) => {
            console.log(`Node ${node.name} completed:`, result);
        });

        this.on('error', ({ node, error }) => {
            console.error(`Error in node ${node.name}:`, error);
        });
    }

    async execute(input) {
        const context = {
            startTime: Date.now(),
            metadata: {}
        };

        return await this.run(input, context);
    }
}

module.exports = new FunctionGenerationPipeline();
