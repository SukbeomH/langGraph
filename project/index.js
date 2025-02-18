require('dotenv').config();
const express = require('express');
const pipeline = require('./graph/pipeline');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 에러 핸들러 미들웨어 개선
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    if (err.message.includes('API key')) {
        return res.status(401).json({
            error: 'Authentication Failed',
            message: 'Invalid API key or configuration issue'
        });
    }

    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

/**
 * 자연어 입력을 받아 함수 생성 파이프라인 실행
 */
app.post('/api/process', async (req, res) => {
    try {
        const { input } = req.body;
        const result = await pipeline.execute(input);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
