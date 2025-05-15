// Three.js 초기화
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('viewer').appendChild(renderer.domElement);

// OrbitControls 설정
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// 조명 설정
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// 장비 정보 데이터 (실제로는 API에서 가져와야 함)
const equipmentData = {
    'equipment-1': {
        name: 'Photo Lithography System',
        modelNumber: 'PLS-2000',
        status: 'Running',
        lots: [
            { id: 'LOT-001', status: 'processing', progress: 75 },
            { id: 'LOT-002', status: 'waiting', progress: 0 }
        ]
    },
    'equipment-2': {
        name: 'Etching System',
        modelNumber: 'ETS-1500',
        status: 'Idle',
        lots: [
            { id: 'LOT-004', status: 'waiting', progress: 0 }
        ]
    },
    'equipment-3': {
        name: 'Ion Implanter',
        modelNumber: 'IIP-3000',
        status: 'Maintenance',
        lots: []
    },
    'equipment-4': {
        name: 'Chemical Vapor Deposition',
        modelNumber: 'CVD-2500',
        status: 'Running',
        lots: [
            { id: 'LOT-005', status: 'processing', progress: 45 }
        ]
    },
    'equipment-5': {
        name: 'Physical Vapor Deposition',
        modelNumber: 'PVD-1800',
        status: 'Running',
        lots: [
            { id: 'LOT-006', status: 'processing', progress: 30 }
        ]
    },
    'equipment-6': {
        name: 'Wafer Inspection System',
        modelNumber: 'WIS-3000',
        status: 'Idle',
        lots: []
    },
    'equipment-7': {
        name: 'Wafer Cleaning System',
        modelNumber: 'WCS-2000',
        status: 'Running',
        lots: [
            { id: 'LOT-007', status: 'processing', progress: 60 }
        ]
    },
    'equipment-8': {
        name: 'Wafer Testing System',
        modelNumber: 'WTS-4000',
        status: 'Running',
        lots: [
            { id: 'LOT-008', status: 'processing', progress: 25 }
        ]
    }
};

// OHT 관련 변수
let ohts = [];
const OHT_SPEED = 0.05;
const OHT_COUNT = 3;

// OHT 모델 생성 함수
function createOHTModel() {
    const group = new THREE.Group();
    
    // OHT 본체
    const bodyGeometry = new THREE.BoxGeometry(1.5, 0.8, 2.5);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x2196f3,
        metalness: 0.8,
        roughness: 0.2
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    group.add(body);

    // OHT 바퀴
    const wheelGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16);
    const wheelMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x333333,
        metalness: 0.5,
        roughness: 0.5
    });

    // 앞바퀴
    const frontWheel1 = new THREE.Mesh(wheelGeometry, wheelMaterial);
    frontWheel1.rotation.z = Math.PI / 2;
    frontWheel1.position.set(0.8, -0.4, 0.8);
    group.add(frontWheel1);

    const frontWheel2 = new THREE.Mesh(wheelGeometry, wheelMaterial);
    frontWheel2.rotation.z = Math.PI / 2;
    frontWheel2.position.set(0.8, -0.4, -0.8);
    group.add(frontWheel2);

    // 뒷바퀴
    const rearWheel1 = new THREE.Mesh(wheelGeometry, wheelMaterial);
    rearWheel1.rotation.z = Math.PI / 2;
    rearWheel1.position.set(-0.8, -0.4, 0.8);
    group.add(rearWheel1);

    const rearWheel2 = new THREE.Mesh(wheelGeometry, wheelMaterial);
    rearWheel2.rotation.z = Math.PI / 2;
    rearWheel2.position.set(-0.8, -0.4, -0.8);
    group.add(rearWheel2);

    return group;
}

// OHT Rail 생성 함수
function createOHTRail() {
    const group = new THREE.Group();
    
    // Rail 본체
    const railGeometry = new THREE.BoxGeometry(0.3, 0.3, 40);
    const railMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x666666,
        metalness: 0.7,
        roughness: 0.3
    });
    
    // 수평 레일
    const horizontalRail = new THREE.Mesh(railGeometry, railMaterial);
    horizontalRail.position.set(0, 5, 0);
    group.add(horizontalRail);

    // 수직 레일
    const verticalRail = new THREE.Mesh(railGeometry, railMaterial);
    verticalRail.rotation.z = Math.PI / 2;
    verticalRail.position.set(-15, 5, 0);
    group.add(verticalRail);

    const verticalRail2 = new THREE.Mesh(railGeometry, railMaterial);
    verticalRail2.rotation.z = Math.PI / 2;
    verticalRail2.position.set(15, 5, 0);
    group.add(verticalRail2);

    // 레일 지지대
    const supportGeometry = new THREE.BoxGeometry(0.2, 5, 0.2);
    const supportMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x888888,
        metalness: 0.5,
        roughness: 0.5
    });

    // 수직 레일 지지대
    for(let x = -15; x <= 15; x += 5) {
        const support = new THREE.Mesh(supportGeometry, supportMaterial);
        support.position.set(x, 2.5, 0);
        group.add(support);
    }

    return group;
}

// 장비 모델 생성 함수 수정
function createFactoryModel() {
    const group = new THREE.Group();
    
    // 공장 바닥
    const floorGeometry = new THREE.PlaneGeometry(40, 40);
    const floorMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x333333,
        side: THREE.DoubleSide
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    group.add(floor);

    // 그리드 라인 추가
    const gridHelper = new THREE.GridHelper(40, 40, 0x444444, 0x222222);
    gridHelper.position.y = 0.01;
    group.add(gridHelper);

    // OHT Rail 추가
    const ohtRail = createOHTRail();
    group.add(ohtRail);

    // OHT 생성 및 초기 위치 설정
    for(let i = 0; i < OHT_COUNT; i++) {
        const oht = createOHTModel();
        oht.position.set(
            -15 + (i * 10),  // x position
            5,              // y position (rail height)
            0               // z position
        );
        oht.userData = {
            direction: 1,   // 1: right, -1: left
            speed: OHT_SPEED,
            targetX: 15     // target position
        };
        group.add(oht);
        ohts.push(oht);
    }

    // 장비들 배치
    const equipmentPositions = [
        // Line 1
        { x: -15, z: -15, id: 'equipment-1' },
        { x: -10, z: -15, id: 'equipment-2' },
        { x: -5, z: -15, id: 'equipment-3' },
        { x: 0, z: -15, id: 'equipment-4' },
        { x: 5, z: -15, id: 'equipment-5' },
        { x: 10, z: -15, id: 'equipment-6' },
        // Line 2
        { x: -15, z: -5, id: 'equipment-7' },
        { x: -10, z: -5, id: 'equipment-8' },
        { x: -5, z: -5, id: 'equipment-1' },
        { x: 0, z: -5, id: 'equipment-2' },
        { x: 5, z: -5, id: 'equipment-3' },
        { x: 10, z: -5, id: 'equipment-4' },
        // Line 3
        { x: -15, z: 5, id: 'equipment-5' },
        { x: -10, z: 5, id: 'equipment-6' },
        { x: -5, z: 5, id: 'equipment-7' },
        { x: 0, z: 5, id: 'equipment-8' },
        { x: 5, z: 5, id: 'equipment-1' },
        { x: 10, z: 5, id: 'equipment-2' }
    ];

    equipmentPositions.forEach(pos => {
        // 장비 본체
        const equipmentGeometry = new THREE.BoxGeometry(2, 3, 2);
        const equipmentMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x00ff9d,
            wireframe: true
        });
        const equipment = new THREE.Mesh(equipmentGeometry, equipmentMaterial);
        equipment.position.set(pos.x, 1.5, pos.z);
        equipment.userData.id = pos.id;
        group.add(equipment);

        // 장비 베이스
        const baseGeometry = new THREE.BoxGeometry(2.5, 0.2, 2.5);
        const baseMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x666666
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.set(pos.x, 0.1, pos.z);
        group.add(base);

        // 장비 상태 표시등
        const statusLightGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const statusLightMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x00ff00,
            emissive: 0x00ff00,
            emissiveIntensity: 0.5
        });
        const statusLight = new THREE.Mesh(statusLightGeometry, statusLightMaterial);
        statusLight.position.set(pos.x + 1, 2, pos.z + 1);
        group.add(statusLight);
    });

    return group;
}

const factory = createFactoryModel();
scene.add(factory);

// 카메라 위치 설정
camera.position.set(15, 15, 15);
camera.lookAt(0, 0, 0);

// 윈도우 리사이즈 핸들러
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 뷰포트 컨트롤 이벤트 핸들러
document.getElementById('zoomIn').addEventListener('click', () => {
    camera.position.multiplyScalar(0.9);
});

document.getElementById('zoomOut').addEventListener('click', () => {
    camera.position.multiplyScalar(1.1);
});

document.getElementById('resetView').addEventListener('click', () => {
    camera.position.set(15, 15, 15);
    camera.lookAt(0, 0, 0);
    controls.reset();
});

document.getElementById('topView').addEventListener('click', () => {
    camera.position.set(0, 20, 0);
    camera.lookAt(0, 0, 0);
    controls.update();
});

document.getElementById('frontView').addEventListener('click', () => {
    camera.position.set(0, 0, 20);
    camera.lookAt(0, 0, 0);
    controls.update();
});

document.getElementById('sideView').addEventListener('click', () => {
    camera.position.set(20, 0, 0);
    camera.lookAt(0, 0, 0);
    controls.update();
});

// 모니터링 타겟 변경 이벤트
document.getElementById('monitoringTarget').addEventListener('change', (e) => {
    const target = e.target.value;
    if (target) {
        updateDashboard(target);
    }
});

// 대시보드 업데이트 함수
function updateDashboard(target) {
    // 실제 구현에서는 API 호출 등을 통해 데이터를 가져와야 함
    const mockData = {
        operationRate: Math.floor(Math.random() * 20 + 80) + '%',
        productionVolume: Math.floor(Math.random() * 1000 + 1000),
        yieldRate: (Math.random() * 5 + 95).toFixed(1) + '%',
        equipmentStatus: Math.random() > 0.1 ? 'Normal' : 'Warning'
    };

    document.getElementById('operationRate').textContent = mockData.operationRate;
    document.getElementById('productionVolume').textContent = mockData.productionVolume;
    document.getElementById('yieldRate').textContent = mockData.yieldRate;
    document.getElementById('equipmentStatus').textContent = mockData.equipmentStatus;
    document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString();
}

// 주기적인 대시보드 업데이트
setInterval(() => {
    const currentTarget = document.getElementById('monitoringTarget').value;
    if (currentTarget) {
        updateDashboard(currentTarget);
    }
}, 5000);

// OHT 애니메이션 업데이트 함수
function updateOHTs() {
    ohts.forEach(oht => {
        // 현재 위치 업데이트
        oht.position.x += oht.userData.speed * oht.userData.direction;

        // 방향 전환 체크
        if(oht.position.x >= 15) {
            oht.userData.direction = -1;
            oht.rotation.y = Math.PI;
        } else if(oht.position.x <= -15) {
            oht.userData.direction = 1;
            oht.rotation.y = 0;
        }

        // 바퀴 회전
        oht.children.forEach(child => {
            if(child.geometry instanceof THREE.CylinderGeometry) {
                child.rotation.x += 0.1;
            }
        });
    });
}

// 애니메이션 루프 수정
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    updateOHTs();  // OHT 애니메이션 업데이트
    renderer.render(scene, camera);
}

animate();

// 팝업 관련 요소
const popup = document.getElementById('equipmentPopup');
const closePopupBtn = document.getElementById('closePopup');

// 팝업 닫기
closePopupBtn.addEventListener('click', () => {
    popup.classList.remove('active');
});

// 장비 클릭 이벤트 처리
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
    // 마우스 위치를 정규화된 장치 좌표로 변환
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // 레이캐스팅
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object.userData.id) {
            showEquipmentDetails(object.userData.id);
        }
    }
}

// 장비 상세 정보 표시
function showEquipmentDetails(equipmentId) {
    const equipment = equipmentData[equipmentId] || {
        name: 'Unknown Equipment',
        modelNumber: 'N/A',
        status: 'Unknown',
        lots: []
    };

    // 기본 정보 업데이트
    document.getElementById('equipmentName').textContent = equipment.name;
    document.getElementById('modelNumber').textContent = equipment.modelNumber;
    document.getElementById('equipmentStatus').textContent = equipment.status;

    // LOT 정보 업데이트
    const lotList = document.getElementById('lotList');
    lotList.innerHTML = '';

    equipment.lots.forEach(lot => {
        const lotElement = document.createElement('div');
        lotElement.className = 'lot-item';
        lotElement.innerHTML = `
            <span class="lot-id">${lot.id}</span>
            <span class="lot-status ${lot.status}">${lot.status.toUpperCase()}</span>
        `;
        lotList.appendChild(lotElement);
    });

    // 팝업 표시
    popup.classList.add('active');
}

// 클릭 이벤트 리스너 추가
window.addEventListener('click', onMouseClick);

// 시뮬레이션 관련 변수
let simulationPopup = document.getElementById('simulationPopup');
let simulationBtn = document.getElementById('simulationBtn');
let closeSimulation = document.getElementById('closeSimulation');
let runSimulation = document.getElementById('runSimulation');
let minimap = document.getElementById('minimap');
let startPoint = document.getElementById('startPoint');
let endPoint = document.getElementById('endPoint');
let pathDistance = document.getElementById('pathDistance');
let pathTime = document.getElementById('pathTime');

let ctx = minimap.getContext('2d');
let selectedPoint = null;
let startPos = null;
let endPos = null;
let path = [];

// 미니맵 크기 설정
minimap.width = 800;
minimap.height = 400;

// 시뮬레이션 팝업 열기
simulationBtn.addEventListener('click', () => {
    simulationPopup.classList.add('active');
    drawMinimap();
});

// 시뮬레이션 팝업 닫기
closeSimulation.addEventListener('click', () => {
    simulationPopup.classList.remove('active');
    resetSimulation();
});

// 미니맵 그리기
function drawMinimap() {
    ctx.clearRect(0, 0, minimap.width, minimap.height);
    
    // 배경
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, minimap.width, minimap.height);
    
    // 그리드
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    for(let i = 0; i < minimap.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, minimap.height);
        ctx.stroke();
    }
    for(let i = 0; i < minimap.height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(minimap.width, i);
        ctx.stroke();
    }
    
    // 장비 표시
    equipmentPositions.forEach(pos => {
        const x = (pos.x + 20) * (minimap.width / 40);
        const y = (pos.z + 20) * (minimap.height / 40);
        ctx.fillStyle = '#00ff9d';
        ctx.fillRect(x - 5, y - 5, 10, 10);
    });
    
    // 시작점과 끝점 표시
    if(startPos) {
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    if(endPos) {
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(endPos.x, endPos.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 경로 표시
    if(path.length > 0) {
        ctx.strokeStyle = '#00ff9d';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for(let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.stroke();
    }
}

// 미니맵 클릭 이벤트
minimap.addEventListener('click', (e) => {
    const rect = minimap.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if(selectedPoint === 'start') {
        startPos = { x, y };
        startPoint.querySelector('.point-label').textContent = `(${Math.round(x)}, ${Math.round(y)})`;
        startPoint.classList.remove('selected');
    } else if(selectedPoint === 'end') {
        endPos = { x, y };
        endPoint.querySelector('.point-label').textContent = `(${Math.round(x)}, ${Math.round(y)})`;
        endPoint.classList.remove('selected');
    }
    
    selectedPoint = null;
    drawMinimap();
});

// 시작점 선택
startPoint.addEventListener('click', () => {
    selectedPoint = 'start';
    startPoint.classList.add('selected');
    endPoint.classList.remove('selected');
});

// 끝점 선택
endPoint.addEventListener('click', () => {
    selectedPoint = 'end';
    endPoint.classList.add('selected');
    startPoint.classList.remove('selected');
});

// A* 경로 찾기 알고리즘
function findPath(start, end) {
    const gridSize = 20;
    const grid = [];
    const width = Math.ceil(minimap.width / gridSize);
    const height = Math.ceil(minimap.height / gridSize);
    
    // 그리드 초기화
    for(let i = 0; i < width; i++) {
        grid[i] = [];
        for(let j = 0; j < height; j++) {
            grid[i][j] = {
                x: i,
                y: j,
                walkable: true,
                g: 0,
                h: 0,
                f: 0,
                parent: null
            };
        }
    }
    
    // 장비 위치를 장애물로 표시
    equipmentPositions.forEach(pos => {
        const x = Math.floor((pos.x + 20) * (minimap.width / 40) / gridSize);
        const y = Math.floor((pos.z + 20) * (minimap.height / 40) / gridSize);
        if(grid[x] && grid[x][y]) {
            grid[x][y].walkable = false;
        }
    });
    
    const startNode = grid[Math.floor(start.x / gridSize)][Math.floor(start.y / gridSize)];
    const endNode = grid[Math.floor(end.x / gridSize)][Math.floor(end.y / gridSize)];
    
    const openSet = [startNode];
    const closedSet = [];
    
    while(openSet.length > 0) {
        let current = openSet[0];
        let currentIndex = 0;
        
        // f 값이 가장 작은 노드 찾기
        openSet.forEach((node, index) => {
            if(node.f < current.f) {
                current = node;
                currentIndex = index;
            }
        });
        
        if(current === endNode) {
            const path = [];
            let temp = current;
            while(temp.parent) {
                path.push({
                    x: temp.x * gridSize + gridSize/2,
                    y: temp.y * gridSize + gridSize/2
                });
                temp = temp.parent;
            }
            return path.reverse();
        }
        
        openSet.splice(currentIndex, 1);
        closedSet.push(current);
        
        // 이웃 노드 확인
        const neighbors = [];
        for(let i = -1; i <= 1; i++) {
            for(let j = -1; j <= 1; j++) {
                if(i === 0 && j === 0) continue;
                
                const x = current.x + i;
                const y = current.y + j;
                
                if(x >= 0 && x < width && y >= 0 && y < height && grid[x][y].walkable) {
                    neighbors.push(grid[x][y]);
                }
            }
        }
        
        neighbors.forEach(neighbor => {
            if(closedSet.includes(neighbor)) return;
            
            const gScore = current.g + 1;
            let isNewPath = false;
            
            if(openSet.includes(neighbor)) {
                if(gScore < neighbor.g) {
                    neighbor.g = gScore;
                    isNewPath = true;
                }
            } else {
                neighbor.g = gScore;
                isNewPath = true;
                openSet.push(neighbor);
            }
            
            if(isNewPath) {
                neighbor.h = Math.sqrt(
                    Math.pow(neighbor.x - endNode.x, 2) +
                    Math.pow(neighbor.y - endNode.y, 2)
                );
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = current;
            }
        });
    }
    
    return []; // 경로를 찾지 못한 경우
}

// 시뮬레이션 실행
runSimulation.addEventListener('click', () => {
    if(!startPos || !endPos) {
        alert('Please select both start and end points');
        return;
    }
    
    path = findPath(startPos, endPos);
    
    if(path.length > 0) {
        // 거리 계산
        let distance = 0;
        for(let i = 1; i < path.length; i++) {
            distance += Math.sqrt(
                Math.pow(path[i].x - path[i-1].x, 2) +
                Math.pow(path[i].y - path[i-1].y, 2)
            );
        }
        
        // 시간 계산 (OHT 속도 가정: 1m/s)
        const time = distance / 20; // 20 pixels = 1 meter
        
        pathDistance.textContent = `${(distance / 20).toFixed(2)}m`;
        pathTime.textContent = `${time.toFixed(1)}s`;
    } else {
        alert('No valid path found');
    }
    
    drawMinimap();
});

// 시뮬레이션 초기화
function resetSimulation() {
    startPos = null;
    endPos = null;
    path = [];
    selectedPoint = null;
    startPoint.querySelector('.point-label').textContent = 'Click on map';
    endPoint.querySelector('.point-label').textContent = 'Click on map';
    startPoint.classList.remove('selected');
    endPoint.classList.remove('selected');
    pathDistance.textContent = '-';
    pathTime.textContent = '-';
} 