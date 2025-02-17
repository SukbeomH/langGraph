import React from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

SyntaxHighlighter.registerLanguage('javascript', js);

function FunctionViewer({ function: func }) {
    if (!func) return <div>아직 생성된 함수가 없습니다.</div>;

    return (
        <div className="function-viewer">
            <SyntaxHighlighter language="javascript" style={docco}>
                {func.code}
            </SyntaxHighlighter>
        </div>
    );
}

export default FunctionViewer;
