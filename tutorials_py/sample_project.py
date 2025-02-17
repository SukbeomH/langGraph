from dotenv import load_dotenv
from langchain.chat_models import ChatAnthropic

# .env 파일에서 환경 변수 로드
load_dotenv()

# Claude-3 Sonnet 설정 (비용 효율적인 옵션)
claude_compact = ChatAnthropic(
    model_name="claude-3-sonnet-20240229",
    temperature=0.7,
    max_tokens=150,
)

# Claude-3 Opus 설정 (최고 성능 옵션)
claude = ChatAnthropic(
    model_name="claude-3-opus-20240229",
    temperature=0.7,
    max_tokens=300,
)
