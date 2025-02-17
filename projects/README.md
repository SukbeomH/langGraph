# HTTP Request Handler Project

## 설치 및 실행

1. 의존성 설치
```bash
npm install
```

2. 환경 변수 설정
`.env` 파일을 생성하고 다음 항목 설정:
```
ANTHROPIC_API_KEY=your-api-key
PORT=3000
```

3. 서버 실행
```bash
npm start
```

## API 엔드포인트

- POST /api/generate: HTTP 요청 처리 함수 생성
- GET /api/history: 생성된 함수 히스토리 조회

## 사용 예시

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"request":"Create a function that blocks requests from specific IP addresses"}'
```
