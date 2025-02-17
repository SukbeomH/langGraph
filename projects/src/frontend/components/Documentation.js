import React from 'react';

function Documentation({ docs }) {
    if (!docs) return <div>문서가 없습니다.</div>;

    return (
        <div className="documentation">
            <div className="docs-content">
                {docs.documentation}
            </div>
            <div className="docs-metadata">
                <p>생성 시간: {new Date(docs.metadata.timestamp).toLocaleString()}</p>
                <p>함수 ID: {docs.metadata.functionHash}</p>
            </div>
        </div>
    );
}

export default Documentation;
