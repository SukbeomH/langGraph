```javascript
// 프로젝트 구조
project/
  ├── backend/
  │   ├── agents/
  │   │   ├── functionGenerator.js
  │   │   ├── mockGenerator.js
  │   │   ├── testValidator.js
  │   │   └── documentationGenerator.js
  │   ├── graph/
  │   │   └── workflow.js
  │   ├── database/
  │   │   └── vectorStore.js
  │   └── server.js
  └── frontend/
      ├── components/
      │   ├── RequestForm.js
      │   ├── FunctionViewer.js
      │   ├── TestResults.js
      │   └── Documentation.js
      ├── pages/
      │   ├── Dashboard.js
      │   └── History.js
      └── app.js
```

# HTTP Req Handler by LangChain, Claude

>

### 시스템 아키텍처

- Agent 구성

  - Function Generator Agent: 자연어 요청을 분석하여 HTTP Request 처리 함수 생성

  - Mock Data Generator Agent: 테스트용 HTTP Request 더미 데이터 생성

  - Test Validator Agent: 생성된 함수의 테스트 및 검증 수행

  - Documentation Agent: 함수 설명 및 테스트 결과 문서화

### 주요 기능

- 함수 생성 및 테스트
  - 자연어 요청을 분석하여 HTTP Request 처리 함수 생성
  - 테스트용 더미 데이터 자동 생성
  - 생성된 함수의 유효성 검증 및 테스트 수행

- 문서화 및 저장
  - 함수 설명, 테스트 결과, 사용 사례 등 자동 문서화
  - 기존 함수 검색 및 재사용

- 테스트 자동화
  - requests_mock을 활용한 HTTP Request 모킹
  - 다양한 시나리오에 대한 테스트 케이스 자동 생성

- 확장 기능

- 에러 처리 및 모니터링
  - 함수 실행 중 발생하는 에러 자동 감지 및 기록
  - 테스트 결과 및 성능 메트릭 모니터링

- RAG 시스템
  - 기존 함수 및 테스트 케이스 재활용
  - 유사 사례 기반 함수 추천 및 최적화

## FrontEnd 주요 기능

- 대시보드 기능
  - 자연어 요청 입력 폼
  - 실시간 함수 생성 결과 표시
  - 테스트 결과 시각화
  - 문서화 내용 표시

- 히스토리 관리
  - 이전 생성 함수 목록
  - 검색 및 필터링 기능
  - RAG 기반 유사 함수 추천

- 실시간 피드백
  - 함수 생성 진행 상태 표시
  - 에러 메시지 및 개선 제안
  - 테스트 결과 시각화

- 테스트 시각화
  - 테스트 케이스 실행 결과 그래프
  - 성능 메트릭 대시보드
  - 에러 로그 뷰어

---

LangGraph를 이용해서
1. 자연어 요청을 받고 그에 맞는 함수를 제작하는 LLM Assist를 만들고 싶어
2. 이때 입력 받은 자연어를 통해 요청을 실행하는 함수를 제작할거야
3. 함수는 HTTP Request를 입력 받고, 그 내용을 분석한뒤 요청에 맞게 차단하거나, 분류하거나 변조하는 등의 기능을 하는 함수야.
4. 전체적으로 함수의 기능을 검증하기 위해, 테스트용 더미 HTTP Request를 만드는 ai가 필요해
5. 또한 그에 맞춰 올바르게 작동하는 함수를 제작하는 AI도 필요해.
6. 제작된 함수를 더미 데이터로 검증하고 테스트하는 AI, 혹은 함수도 필요해.
7. 전체적으로 성공여부와 그 설명을 제작하고 저장하는 기능이 있어야해.
8. 저장된 함수들과 설명을 바탕으로 기존 코드를 참고하거나 그대로 사용하는 RAG기능이 있어야해