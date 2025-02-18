import streamlit as st
from langchain import LLMChain, PromptTemplate
from langchain_anthropic import Claude
from langgraph.graph import Graph
import json
from typing import Dict, TypedDict

# 상태 정의
class AgentState(TypedDict):
    input_text: str
    http_sample: dict
    parsed_intent: dict
    generated_code: str
    test_results: dict

# 노드 함수들
def parse_natural_language(state: AgentState) -> AgentState:
    llm = Claude(model="claude-3-sonnet-20240229")
    template = """
    사용자의 자연어 요청을 분석하여 HTTP 미들웨어 요구사항으로 변환하세요:
    {input_text}
    
    JSON 형식으로 출력하세요.
    """
    
    chain = LLMChain(
        llm=llm,
        prompt=PromptTemplate(
            template=template,
            input_variables=["input_text"]
        )
    )
    
    result = chain.run(state["input_text"])
    state["parsed_intent"] = json.loads(result)
    return state

def analyze_http_request(state: AgentState) -> AgentState:
    # HTTP 요청 분석 로직
    sample = state["http_sample"]
    analysis = {
        "headers": sample.get("headers", {}),
        "method": sample.get("method", ""),
        "path": sample.get("path", ""),
        "ip": sample.get("ip", "")
    }
    state["request_analysis"] = analysis
    return state

def generate_middleware(state: AgentState) -> AgentState:
    llm = Claude(model="claude-3-sonnet-20240229")
    template = """
    다음 요구사항과 HTTP 분석을 바탕으로 미들웨어 함수를 생성하세요:
    요구사항: {parsed_intent}
    HTTP 분석: {request_analysis}
    
    JavaScript 코드로 출력하세요.
    """
    
    chain = LLMChain(
        llm=llm,
        prompt=PromptTemplate(
            template=template,
            input_variables=["parsed_intent", "request_analysis"]
        )
    )
    
    state["generated_code"] = chain.run(
        parsed_intent=state["parsed_intent"],
        request_analysis=state["request_analysis"]
    )
    return state

def test_middleware(state: AgentState) -> AgentState:
    llm = Claude(model="claude-3-sonnet-20240229")
    template = """
    다음 미들웨어 코드를 테스트하고 결과를 분석하세요:
    {generated_code}
    
    JSON 형식으로 테스트 결과를 출력하세요.
    """
    
    chain = LLMChain(
        llm=llm,
        prompt=PromptTemplate(
            template=template,
            input_variables=["generated_code"]
        )
    )
    
    result = chain.run(state["generated_code"])
    state["test_results"] = json.loads(result)
    return state

# 그래프 구성
def create_graph():
    workflow = Graph()
    
    workflow.add_node("parse", parse_natural_language)
    workflow.add_node("analyze", analyze_http_request)
    workflow.add_node("generate", generate_middleware)
    workflow.add_node("test", test_middleware)
    
    workflow.add_edge("parse", "analyze")
    workflow.add_edge("analyze", "generate")
    workflow.add_edge("generate", "test")
    
    return workflow.compile()

# Streamlit UI
def main():
    st.title("HTTP 미들웨어 자동 생성기")
    
    input_text = st.text_area("요청 사항을 입력하세요")
    http_sample = st.text_area("샘플 HTTP 요청을 JSON 형식으로 입력하세요")
    
    if st.button("생성"):
        workflow = create_graph()
        
        initial_state = AgentState(
            input_text=input_text,
            http_sample=json.loads(http_sample),
            parsed_intent={},
            generated_code="",
            test_results={}
        )
        
        final_state = workflow.run(initial_state)
        
        st.json(final_state["parsed_intent"])
        st.code(final_state["generated_code"], language="javascript")
        st.json(final_state["test_results"])

if __name__ == "__main__":
    main()
