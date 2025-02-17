require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const workflowGraph = require('./graph/workflow');
const vectorStore = require('./database/vectorStore');

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// CORS 설정
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// 라우트 경로 명확히 정의
app.post('/api/generate', async (req, res) => {
    try {
        console.log('Request received at /api/generate:', req.body);
        const { request } = req.body;
        
        if (!request) {
            return res.status(400).json({ 
                success: false,
                error: 'Request content is required' 
            });
        }

        const workflow = new workflowGraph();
        const result = await workflow.execute(request);
        
        res.json({
            success: true,
            function: result.function || { code: '', metadata: {} },
            tests: result.tests || { results: [], metadata: {} },
            docs: result.docs || { documentation: '', metadata: {} }
        });
    } catch (error) {
        console.error('Generate Error:', error);
        res.status(500).json({ 
            success: false,
            error: error.message || 'Internal server error'
        });
    }
});

apiRouter.get('/history', async (req, res) => {
    try {
        // Vector store 검색 로직 구현
        res.json({ results: [] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 404 처리
app.use((req, res) => {
    console.log('404 for:', req.method, req.url);
    res.status(404).json({
        success: false,
        error: `Not Found: ${req.method} ${req.url}`
    });
});

// 에러 핸들러
app.use((error, req, res, next) => {
    console.error('Server Error:', error);
    res.status(500).json({
        success: false,
        error: error.message || 'Internal Server Error'
    });
});

const PORT = process.env.BACKEND_PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
