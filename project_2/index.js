const express = require('express');
const bodyParser = require('body-parser');
const core = require('./core');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// JSON 요청 파싱
app.use(bodyParser.json());

// public 폴더의 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

/**
 * 자연어 입력을 받아 전체 파이프라인(스펙 생성 → 함수 생성 → 테스트 → 결과 저장)을 실행하는 API
 */
app.post('/api/process', (req, res) => {
  const { input } = req.body;
  if (!input) {
    return res.status(400).json({ error: 'No input provided' });
  }
  
  // 1. LLM Assist: 자연어 입력으로 함수 스펙 생성
  const spec = core.generateSpecFromInput(input);
  
  // 2. 함수 생성: 스펙 기반 HTTP Request 처리 함수 생성
  const processorFunction = core.generateFunction(spec);
  
  // 3. 더미 HTTP Request 생성
  const dummyRequest = core.createDummyHTTPRequest();
  
  // 4. 테스트 및 검증: 생성된 함수의 동작 테스트
  const testResult = core.testFunction(processorFunction, dummyRequest);
  
  // 5. 결과 저장: 스펙과 테스트 결과를 JSON 파일에 저장
  core.saveResult({ spec, testResult });
  
  // 결과 반환
  res.json({
    spec,
    testResult
  });
});

/**
 * 저장된 결과들을 검색하는 RAG 기능 API (단순 예시)
 */
app.get('/api/retrieve', (req, res) => {
  const { query } = req.query;
  const results = core.retrieveRAG(query || '');
  res.json({ results });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
