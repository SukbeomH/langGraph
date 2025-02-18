const { Node, createNode } = require('./framework');

class BaseNode extends Node {
    constructor(name, processor) {
        super(name);
        this.processor = processor;
    }

    async process(input, context) {
        try {
            const result = await this.processor(input, context);
            return {
                status: 'success',
                data: result,
                metadata: {
                    timestamp: new Date().toISOString(),
                    nodeId: this.name
                }
            };
        } catch (error) {
            return {
                status: 'error',
                error: error.message,
                metadata: {
                    timestamp: new Date().toISOString(),
                    nodeId: this.name
                }
            };
        }
    }
}

module.exports = {
    BaseNode: Node,
    createNode
};
