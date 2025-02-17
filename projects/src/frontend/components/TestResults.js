import React from 'react';

function TestResults({ results }) {
    if (!results) return <div>테스트 결과가 없습니다.</div>;

    return (
        <div className="test-results">
            <h3>테스트 결과</h3>
            <div className="results-summary">
                <p>전체 테스트: {results.metadata.totalTests}</p>
                <p>성공: {results.metadata.passedTests}</p>
            </div>
            <div className="results-details">
                {results.results.map((result, index) => (
                    <div key={index} className={`test-case ${result.passed ? 'passed' : 'failed'}`}>
                        <h4>테스트 케이스 #{index + 1}</h4>
                        <pre>{JSON.stringify(result.testCase, null, 2)}</pre>
                        <p>결과: {result.passed ? '성공' : '실패'}</p>
                        {result.error && <p className="error">에러: {result.error}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TestResults;
