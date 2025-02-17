import React, { useState, useEffect } from 'react';

function RequestForm({ onSubmit, disabled }) {
    const [request, setRequest] = useState('');

    // 컴포넌트 마운트 시 자동완성 비활성화
    useEffect(() => {
        const form = document.querySelector('.request-form');
        if (form) {
            form.setAttribute('autocomplete', 'off');
            form.setAttribute('autocorrect', 'off');
            form.setAttribute('autocapitalize', 'off');
            form.setAttribute('spellcheck', 'false');
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(request);
    };

    const handleExampleClick = (example, e) => {
        e.preventDefault(); // 이벤트 기본 동작 방지
        setRequest(example);
    };

    const examples = [
        "IP 주소가 192.168.1.* 패턴인 요청을 차단하는 함수",
        "POST 요청의 본문 크기가 1MB를 초과하면 차단하는 함수",
        "요청 헤더에 특정 인증 토큰이 없으면 차단하는 함수"
    ];

    return (
        <div className="request-form-container">
            <form 
                onSubmit={handleSubmit} 
                className="request-form"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
            >
                <div className="form-header">
                    <h2>HTTP 요청 처리 함수 생성</h2>
                    <p>자연어로 원하는 함수의 기능을 설명해주세요.</p>
                </div>
                
                <div className="examples-section">
                    <h3>예시 요청:</h3>
                    <div className="example-buttons">
                        {examples.map((example, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={(e) => handleExampleClick(example, e)}
                                className="example-button"
                                disabled={disabled}
                            >
                                {example}
                            </button>
                        ))}
                    </div>
                </div>

                <textarea
                    value={request}
                    onChange={(e) => setRequest(e.target.value)}
                    placeholder="함수의 기능을 설명해주세요..."
                    rows={4}
                    disabled={disabled}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    data-form-type="other"
                />
                <button 
                    type="submit" 
                    className="submit-button"
                    disabled={disabled || !request.trim()}
                >
                    {disabled ? '처리중...' : '함수 생성'}
                </button>
            </form>
        </div>
    );
}

export default RequestForm;
