import React, { useState } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import '../styles/dashboard.css';
import RequestForm from '../components/RequestForm';
import FunctionViewer from '../components/FunctionViewer';
import TestResults from '../components/TestResults';
import Documentation from '../components/Documentation';

export default function Dashboard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generatedFunction, setGeneratedFunction] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [documentation, setDocumentation] = useState(null);

  const handleRequestSubmit = async (request) => {
    try {
      setLoading(true);
      setCurrentStep(1);
      
      console.log('Sending request:', request); // 디버깅용 로그

      const response = await fetch('/api/generate', {  // 경로 수정됨
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ request: request.trim() })
      });

      console.log('Response status:', response.status); // 디버깅용 로그
      const contentType = response.headers.get('content-type');

      if (!response.ok) {
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Server error: ${response.status}`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data); // 디버깅용 로그

      if (!data.success) {
        throw new Error(data.error || 'Unknown error occurred');
      }

      if (data.function) setGeneratedFunction(data.function);
      if (data.tests) setTestResults(data.tests);
      if (data.docs) setDocumentation(data.docs);
      setCurrentStep(4);
    } catch (error) {
      console.error('Error:', error);
      // 에러 메시지 표시
      alert(`Error: ${error.message}`);
      setCurrentStep(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="tech-stack-header">
        <h1>HTTP Request Handler Generator</h1>
        <div className="tech-stack-badges">
          <span className="tech-badge">LangGraph</span>
          <span className="tech-badge">Claude AI</span>
          <span className="tech-badge">React</span>
          <span className="tech-badge">Node.js</span>
        </div>
      </div>

      <div className="process-flow">
        <ProcessStep 
          title="요청 입력" 
          active={currentStep >= 0} 
          icon="📝"
        />
        <ProcessStep 
          title="함수 생성" 
          active={currentStep >= 1} 
          icon="⚙️"
        />
        <ProcessStep 
          title="테스트 실행" 
          active={currentStep >= 2} 
          icon="🧪"
        />
        <ProcessStep 
          title="문서화" 
          active={currentStep >= 3} 
          icon="📄"
        />
      </div>

      <RequestForm onSubmit={handleRequestSubmit} disabled={loading} />

      {loading && (
        <div className="loading-indicator">
          <div className="spinner">처리중...</div>
        </div>
      )}

      <div className="result-section">
        <Tabs>
          <TabList>
            <Tab>생성된 함수</Tab>
            <Tab>테스트 결과</Tab>
            <Tab>문서</Tab>
          </TabList>
          <TabPanel>
            <FunctionViewer function={generatedFunction} />
          </TabPanel>
          <TabPanel>
            <TestResults results={testResults} />
          </TabPanel>
          <TabPanel>
            <Documentation docs={documentation} />
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
}

function ProcessStep({ title, active, icon }) {
  return (
    <div className={`process-step ${active ? 'active' : ''}`}>
      <div className="step-icon">{icon}</div>
      <div className="step-title">{title}</div>
      {active && <div className="process-arrow">→</div>}
    </div>
  );
}
