const EventEmitter = require('events');

class Node {
    constructor(name, processor) {
        this.name = name;
        this.processor = processor;
    }

    async process(input, context) {
        try {
            return {
                status: 'success',
                data: await this.processor(input, context),
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

class Pipeline extends EventEmitter {
    constructor() {
        super();
        this.nodes = new Map();
        this.edges = new Map();
    }

    addNode(node) {
        this.nodes.set(node.name, node);
        this.edges.set(node.name, []);
    }

    addEdge(fromNode, toNode) {
        const edges = this.edges.get(fromNode.name) || [];
        edges.push(toNode.name);
        this.edges.set(fromNode.name, edges);
    }

    async run(input, context = {}) {
        const results = new Map();
        const startNode = Array.from(this.nodes.values())[0];
        
        return await this.executeNode(startNode.name, input, context, results);
    }

    async executeNode(nodeName, input, context, results) {
        const node = this.nodes.get(nodeName);
        if (!node) return null;

        this.emit('nodeStart', { node: { name: nodeName } });
        
        try {
            const result = await node.process(input, context);
            results.set(nodeName, result);
            
            this.emit('nodeComplete', { 
                node: { name: nodeName }, 
                result 
            });

            // 다음 노드 실행
            const nextNodes = this.edges.get(nodeName) || [];
            for (const nextNode of nextNodes) {
                await this.executeNode(nextNode, result.data, context, results);
            }

            return result;
        } catch (error) {
            this.emit('error', { 
                node: { name: nodeName }, 
                error 
            });
            throw error;
        }
    }
}

module.exports = {
    Node,
    Pipeline,
    createNode: (name, processor) => new Node(name, processor)
};
