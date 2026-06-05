/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   viewer.js                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ertrigna <ertrigna@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/06/05 11:50:04 by ertrigna          #+#    #+#             */
/*   Updated: 2026/06/05 15:46:15 by ertrigna         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// Scene setup
const scene = new THREE.Scene();
const labelLayer = document.getElementById('label-layer');
const camera = new THREE.PerspectiveCamera(
    75, 
    window.innerWidth / window.innerHeight, 
    0.1, 
    10000
);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

let traceGroup = new THREE.Group();
let traceNodes = [];
let activeNode = null;
let keyboardSelectedNode = null;
let keyboardNavigationActive = false;
let showIPs = true;
let currentTraceHops = [];
const zoomPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const mouseWorldPointBeforeZoom = new THREE.Vector3();
const mouseWorldPointAfterZoom = new THREE.Vector3();
const rotationPivot = new THREE.Vector3();
const rotationAxisX = new THREE.Vector3(1, 0, 0);
const rotationAxisY = new THREE.Vector3(0, 1, 0);
const rotationQuaternionX = new THREE.Quaternion();
const rotationQuaternionY = new THREE.Quaternion();
const worldNodePosition = new THREE.Vector3();
const scratchVector = new THREE.Vector3();
const cameraOffset = new THREE.Vector3();
const cameraSpherical = new THREE.Spherical();

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x001a4d, 1);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);
renderer.domElement.id = 'canvas';
renderer.domElement.tabIndex = 0;

camera.position.z = 80;
camera.position.y = 20;

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1, 500);
pointLight.position.set(50, 50, 50);
pointLight.castShadow = true;
scene.add(pointLight);

// Mouse controls
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

function getNodeMeshes() {
    return traceNodes.map((node) => node.mesh);
}

function updatePointerFromClient(clientX, clientY) {
    pointer.x = (clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(clientY / window.innerHeight) * 2 + 1;
}

function getPointerWorldPoint(clientX, clientY, outPoint) {
    updatePointerFromClient(clientX, clientY);
    raycaster.setFromCamera(pointer, camera);

    const hit = raycaster.intersectObjects(getNodeMeshes(), false)[0];
    if (hit) {
        outPoint.copy(hit.point);
        return true;
    }

    return raycaster.ray.intersectPlane(zoomPlane, outPoint);
}

document.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
    keyboardNavigationActive = false;

    if (!getPointerWorldPoint(e.clientX, e.clientY, rotationPivot)) {
        rotationPivot.set(0, 0, 0);
    }
});

document.addEventListener('mousemove', (e) => {
    updatePointerFromClient(e.clientX, e.clientY);

    if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        cameraOffset.copy(camera.position).sub(rotationPivot);
        cameraSpherical.setFromVector3(cameraOffset);
        cameraSpherical.theta -= deltaX * 0.008;
        cameraSpherical.phi -= deltaY * 0.008;
        cameraSpherical.phi = Math.max(0.12, Math.min(Math.PI - 0.12, cameraSpherical.phi));

        camera.position.copy(rotationPivot).add(cameraOffset.setFromSpherical(cameraSpherical));
        camera.lookAt(rotationPivot);
        
        previousMousePosition = { x: e.clientX, y: e.clientY };
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

document.addEventListener('wheel', (e) => {
    e.preventDefault();

    if (getPointerWorldPoint(e.clientX, e.clientY, mouseWorldPointBeforeZoom)) {
        const zoomFactor = e.deltaY > 0 ? 1.08 : 0.92;
        camera.position.sub(mouseWorldPointBeforeZoom).multiplyScalar(zoomFactor).add(mouseWorldPointBeforeZoom);

        const distanceToPivot = camera.position.distanceTo(mouseWorldPointBeforeZoom);
        const minDistance = 10;
        const maxDistance = 260;

        if (distanceToPivot < minDistance || distanceToPivot > maxDistance) {
            scratchVector.copy(camera.position).sub(mouseWorldPointBeforeZoom).normalize();
            camera.position.copy(mouseWorldPointBeforeZoom).add(scratchVector.multiplyScalar(Math.max(minDistance, Math.min(maxDistance, distanceToPivot))));
        }

        if (getPointerWorldPoint(e.clientX, e.clientY, mouseWorldPointAfterZoom)) {
            camera.position.x += mouseWorldPointBeforeZoom.x - mouseWorldPointAfterZoom.x;
            camera.position.y += mouseWorldPointBeforeZoom.y - mouseWorldPointAfterZoom.y;
            camera.position.z += mouseWorldPointBeforeZoom.z - mouseWorldPointAfterZoom.z;
        }
    }
});

function handleKeyDown(e) {
    if (e.key !== 'Tab') {
        const navigationKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        if (!navigationKeys.includes(e.key) || traceNodes.length === 0) {
            return;
        }

        e.preventDefault();

        const currentNode = keyboardSelectedNode || activeNode || traceNodes[0] || null;
        const currentIndex = traceNodes.findIndex((node) => node === currentNode);
        const step = (e.key === 'ArrowUp' || e.key === 'ArrowLeft') ? -1 : 1;
        const nextIndex = currentIndex === -1
            ? 0
            : (currentIndex + step + traceNodes.length) % traceNodes.length;

        keyboardNavigationActive = true;
        keyboardSelectedNode = traceNodes[nextIndex];
        activeNode = keyboardSelectedNode;

        keyboardSelectedNode.mesh.getWorldPosition(worldNodePosition);
        camera.position.x = worldNodePosition.x;
        camera.position.y = worldNodePosition.y + 20;
        rotationPivot.copy(worldNodePosition);
        camera.lookAt(rotationPivot);

        updateNodeLabels();
        return;
    }

    e.preventDefault();
    showIPs = !showIPs;
    if (showIPs && !keyboardSelectedNode && traceNodes.length > 0) {
        keyboardSelectedNode = traceNodes[0];
        activeNode = keyboardSelectedNode;
    }
    updateInfoPanel(currentTraceHops);
    updateNodeLabels();
}

document.addEventListener('keydown', handleKeyDown);
// window.addEventListener('keydown', handleKeyDown);

function clearTraceScene() {
    scene.remove(traceGroup);
    traceGroup = new THREE.Group();
    scene.add(traceGroup);
    traceNodes = [];
    activeNode = null;
    keyboardSelectedNode = null;
    keyboardNavigationActive = false;
    labelLayer.innerHTML = '';
}

function buildNodeLabel(hop) {
    const label = document.createElement('div');
    label.className = 'route-label';
    label.innerHTML = getLabelMarkup(hop, false);
    labelLayer.appendChild(label);
    return label;
}

function getHopDisplayName(hop) {
    if (hop.is_timeout) {
        return showIPs ? `TTL ${hop.ttl}` : '';
    }

    if (showIPs) {
        if (hop.hostname && hop.hostname !== hop.ip) {
            return `${hop.hostname} · ${hop.ip}`;
        }

        return hop.ip;
    }

    return '';
}

function getLabelMarkup(hop) {
    if (hop.is_timeout) {
        return showIPs ? `TTL ${hop.ttl} · timeout` : '';
    }

    if (!showIPs) {
        return '';
    }

    if (hop.hostname && hop.hostname !== hop.ip) {
        return `${hop.hostname} <span style="color: rgba(205, 233, 255, 0.72);">· ${hop.ip}</span>`;
    }

    return hop.ip;
}

function getAverageRtt(hop) {
    const samples = hop.rtt.filter((value) => Number.isFinite(value) && value > 0);
    if (samples.length === 0) {
        return 0;
    }

    return samples.reduce((sum, value) => sum + value, 0) / samples.length;
}

function updateNodeLabels() {
    const zoomedIn = camera.position.z <= 115;

    traceNodes.forEach((node) => {
        const { mesh, hop, label } = node;
        const vector = mesh.position.clone().applyMatrix4(mesh.parent.matrixWorld).project(camera);
        const visible = vector.z > -1 && vector.z < 1;

        if (!visible) {
            label.classList.remove('visible', 'active');
            label.style.display = 'none';
            return;
        }

        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;

        label.style.left = `${x}px`;
        label.style.top = `${y}px`;

        if (!showIPs) {
            label.classList.remove('visible', 'active');
            label.style.display = 'none';
            mesh.scale.setScalar(activeNode === node ? 1.22 : 1);
            return;
        }

        label.style.display = 'block';

        const shouldShow = showIPs ? (zoomedIn || activeNode === node) : true;
        label.classList.toggle('visible', shouldShow);
        label.classList.toggle('active', showIPs && activeNode === node);

        label.innerHTML = showIPs
            ? (activeNode === node || zoomedIn ? getLabelMarkup(hop) : getHopDisplayName(hop))
            : '';

        mesh.scale.setScalar(activeNode === node ? 1.22 : 1);
    });
}

function updateHoveredNode() {
    if (keyboardNavigationActive) {
        activeNode = keyboardSelectedNode || null;
        return;
    }

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(getNodeMeshes(), false);
    const hoveredNode = intersects.length > 0 ? traceNodes.find((node) => node.mesh === intersects[0].object) || null : null;
    activeNode = hoveredNode || keyboardSelectedNode || null;
}

// Fetch and visualize trace data
async function loadTrace() {
    try {
        const response = await fetch('/api/trace');
        const hops = await response.json();
        
        if (hops.length === 0) {
            document.getElementById('trace-info').innerHTML = 
                '<p>Waiting for traceroute data...</p>';
            setTimeout(loadTrace, 1000);
            return;
        }
        
        visualizeTrace(hops);
    } catch (error) {
        console.error('Error loading trace:', error);
        setTimeout(loadTrace, 1000);
    }
}

function visualizeTrace(hops) {
    clearTraceScene();
    currentTraceHops = hops;

    const maxRTT = Math.max(...hops.flatMap((h) => h.rtt.filter((value) => Number.isFinite(value) && value > 0)), 1);
    
    // Draw hops
    hops.forEach((hop, idx) => {
        const y = idx * 4 - (hops.length * 4) / 2;
        
        // Create sphere for hop
        const geometry = new THREE.SphereGeometry(1.5, 32, 32);
        
        let material;
        if (hop.is_timeout) {
            material = new THREE.MeshPhongMaterial({ color: 0xff6b6b }); // Red for timeout
        } else {
            // Color based on RTT
            const avgRTT = getAverageRtt(hop);
            const ratio = Math.max(0, Math.min(1, avgRTT / maxRTT));
            const hue = (1 - ratio) * 0.33;
            const color = new THREE.Color().setHSL(hue, 1, 0.5);
            material = new THREE.MeshPhongMaterial({ color: color });
        }
        
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.y = y;
        sphere.castShadow = true;
        sphere.receiveShadow = true;
        traceGroup.add(sphere);

        const label = buildNodeLabel(hop);
        traceNodes.push({ mesh: sphere, hop, label });
    });

    keyboardSelectedNode = traceNodes[0] || null;
    activeNode = keyboardSelectedNode;
    
    // Draw connections
    hops.forEach((hop, idx) => {
        if (idx < hops.length - 1) {
            const nextY = (idx + 1) * 4 - (hops.length * 4) / 2;
            const points = [
                new THREE.Vector3(0, idx * 4 - (hops.length * 4) / 2, 0),
                new THREE.Vector3(0, nextY, 0)
            ];
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff88, linewidth: 2 });
            const line = new THREE.Line(lineGeometry, lineMaterial);
            traceGroup.add(line);
        }
    });
    
    // Update info panel
    updateInfoPanel(hops);
    
    // Update stats
    document.getElementById('hop-count').textContent = hops.length;
    const avgRTT = hops.reduce((sum, hop) => sum + getAverageRtt(hop), 0) / Math.max(hops.length, 1);
    document.getElementById('avg-rtt').textContent = avgRTT.toFixed(2);
    
    animate();
}

function updateInfoPanel(hops) {
    if (!showIPs) {
        document.getElementById('trace-info').innerHTML = '';
        return;
    }

    let html = '';
    hops.slice(0, 10).forEach(hop => {
        const avgRTT = getAverageRtt(hop);
        if (hop.is_timeout) {
            html += `<div class="hop-info"><span class="hop-addr">TTL ${hop.ttl}</span>: <span class="timeout">* * *</span></div>`;
        } else {
            const name = showIPs ? (hop.hostname || hop.ip) : (hop.hostname || `Hop ${hop.ttl}`);
            const ipPart = showIPs ? ` <span class="hint">(${hop.ip})</span>` : '';
            const detailLine = showIPs
                ? `<span class="hop-name">${name}</span>${ipPart}<br><span class="hint">avg RTT ${avgRTT.toFixed(2)}ms</span>`
                : `<span class="hop-name">${name}</span>`;
            html += `<div class="hop-info"><span class="hop-addr">TTL ${hop.ttl}</span>: ${detailLine}</div>`;
        }
    });
    if (hops.length > 10) {
        html += `<div class="hop-info">... and ${hops.length - 10} more</div>`;
    }
    html += `<div class="metric-pill">${showIPs ? 'Détails visibles' : 'Mode compact'} · Tab pour basculer</div>`;
    document.getElementById('trace-info').innerHTML = html;
}

function animate() {
    requestAnimationFrame(animate);
    updateHoveredNode();
    updateNodeLabels();
    renderer.render(scene, camera);
}

// Auto-resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start loading
loadTrace();