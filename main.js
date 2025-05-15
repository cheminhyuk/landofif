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

// 샘플 반도체 공장 모델 생성
function createFactoryModel() {
    const group = new THREE.Group();
    
    // 공장 바닥
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x333333,
        side: THREE.DoubleSide
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    group.add(floor);

    // 장비들
    const equipmentPositions = [
        { x: -5, z: -5 },
        { x: 0, z: -5 },
        { x: 5, z: -5 },
        { x: -5, z: 0 },
        { x: 0, z: 0 },
        { x: 5, z: 0 }
    ];

    equipmentPositions.forEach(pos => {
        const equipmentGeometry = new THREE.BoxGeometry(2, 3, 2);
        const equipmentMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x00ff9d,
            wireframe: true
        });
        const equipment = new THREE.Mesh(equipmentGeometry, equipmentMaterial);
        equipment.position.set(pos.x, 1.5, pos.z);
        group.add(equipment);
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

// 애니메이션 루프
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate(); 