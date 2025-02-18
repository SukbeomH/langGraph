// 네트워크 그래프 초기화
const nodes = new vis.DataSet([
    { id: 1, label: 'Input', level: 0 },
    { id: 2, label: 'Spec Generation', level: 1 },
    { id: 3, label: 'Function Creation', level: 2 },
    { id: 4, label: 'Test Data', level: 2 },
    { id: 5, label: 'Testing', level: 3 },
    { id: 6, label: 'Results', level: 4 }
]);

const edges = new vis.DataSet([
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 2, to: 4 },
    { from: 3, to: 5 },
    { from: 4, to: 5 },
    { from: 5, to: 6 }
]);

// 그래프 설정
const container = document.getElementById('visualization');
const data = { nodes, edges };
const options = {
    layout: {
        hierarchical: {
            direction: 'UD',
            sortMethod: 'directed',
            levelSeparation: 100
        }
    },
    nodes: {
        shape: 'box',
        margin: 10,
        font: { size: 14 }
    },
    edges: {
        arrows: 'to',
        smooth: true
    }
};

// 네트워크 인스턴스 생성
const network = new vis.Network(container, data, options);

// 네트워크 안정화 설정
network.on("stabilizationIterationsDone", function () {
    network.setOptions({ physics: false });
});

// 윈도우 리사이즈 이벤트 처리
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        network.fit();
    }, 300);
});

// 상태 관리 클래스
class ProcessState {
    constructor() {
        this.currentState = null;
        this.results = {};
    }

    updateNode(nodeId, status) {
        nodes.update({
            id: nodeId,
            color: this.getStatusColor(status),
            title: status
        });
    }

    getStatusColor(status) {
        const colors = {
            processing: '#ffd700',
            success: '#90EE90',
            error: '#FFB6C1',
            idle: '#D3D3D3'
        };
        return colors[status] || colors.idle;
    }

    reset() {
        nodes.forEach(node => {
            this.updateNode(node.id, 'idle');
        });
        this.results = {};
        this.updateResults();
    }

    updateResults() {
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = `<pre>${JSON.stringify(this.results, null, 2)}</pre>`;
    }
}

// API 통신 클래스
class APIClient {
    constructor(processState) {
        this.state = processState;
        this.baseUrl = window.location.origin;
    }

    async process(input) {
        try {
            this.state.reset();
            
            // 입력값 검증
            if (!input.trim()) {
                throw new Error('입력값이 비어있습니다.');
            }

            this.state.updateNode(1, 'success');
            
            // 스펙 생성 단계
            this.state.updateNode(2, 'processing');
            console.log('Sending request with input:', input); // 디버깅용 로그 추가

            const response = await axios.post(`${this.baseUrl}/api/process`, { 
                input: input.trim() 
            });

            console.log('Received response:', response.data); // 디버깅용 로그 추가
            
            // 함수 생성 및 테스트 데이터 단계
            this.state.updateNode(3, 'processing');
            this.state.updateNode(4, 'processing');
            await this.simulateDelay(1000);
            this.state.updateNode(3, 'success');
            this.state.updateNode(4, 'success');
            
            // 테스트 실행 단계
            this.state.updateNode(5, 'processing');
            await this.simulateDelay(1000);
            this.state.updateNode(5, 'success');
            
            // 결과 표시
            this.state.updateNode(6, 'success');
            this.state.results = response.data;
            this.state.updateResults();
            
        } catch (error) {
            console.error('Process failed:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data
            });
            this.handleError(error);
        }
    }

    async searchSimilar(query) {
        try {
            const response = await axios.get(`${this.baseUrl}/api/search`, {
                params: { query }
            });
            return response.data;
        } catch (error) {
            console.error('Search failed:', error);
            this.handleError(error);
        }
    }

    handleError(error) {
        nodes.forEach(node => {
            if (node.color === '#ffd700') {
                this.state.updateNode(node.id, 'error');
            }
        });

        const errorMessage = error.response?.data?.message || error.message || '알 수 없는 오류가 발생했습니다.';
        alert(`Error: ${errorMessage}`);
    }

    simulateDelay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// UI 이벤트 핸들러
document.addEventListener('DOMContentLoaded', () => {
    const processState = new ProcessState();
    const apiClient = new APIClient(processState);

    // 프로세스 실행 버튼
    document.getElementById('processBtn').addEventListener('click', async () => {
        const input = document.getElementById('input').value;
        if (!input) {
            alert('Please enter your request');
            return;
        }
        await apiClient.process(input);
    });

    // 검색 버튼
    document.getElementById('searchBtn').addEventListener('click', async () => {
        const query = document.getElementById('searchQuery').value;
        if (!query) {
            alert('Please enter a search query');
            return;
        }
        const results = await apiClient.searchSimilar(query);
        processState.results = results;
        processState.updateResults();
    });

    // 초기화 버튼
    document.getElementById('resetBtn').addEventListener('click', () => {
        processState.reset();
        document.getElementById('input').value = '';
        document.getElementById('searchQuery').value = '';
    });
});
