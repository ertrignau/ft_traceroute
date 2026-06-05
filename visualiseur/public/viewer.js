/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   viewer.js                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ertrigna <ertrigna@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/06/05 11:50:04 by ertrigna          #+#    #+#             */
/*   Updated: 2026/06/05 11:50:07 by ertrigna         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75, 
    window.innerWidth / window.innerHeight, 
    0.1, 
    10000
);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x001a4d, 1);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

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

document.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        
        scene.rotation.y += deltaX * 0.01;
        scene.rotation.x += deltaY * 0.01;
        
        previousMousePosition = { x: e.clientX, y: e.clientY };
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

document.addEventListener('wheel', (e) => {
    e.preventDefault();
    camera.position.z += e.deltaY * 0.1;
    camera.position.z = Math.max(10, Math.min(200, camera.position.z));
});

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
    // Clear previous
    scene.children = scene.children.filter(c => !(c instanceof THREE.Mesh || c instanceof THREE.Line));
    
    const spheres = [];
    const maxRTT = Math.max(...hops.map(h => Math.max(...h.rtt)));
    
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
            const avgRTT = (hop.rtt[0] + hop.rtt[1] + hop.rtt[2]) / 3;
            const hue = Math.max(0, Math.min(1, 1 - (avgRTT / maxRTT)));
            const color = new THREE.Color().setHSL(hue, 1, 0.5);
            material = new THREE.MeshPhongMaterial({ color: color });
        }
        
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.y = y;
        sphere.castShadow = true;
        sphere.receiveShadow = true;
        scene.add(sphere);
        spheres.push({ mesh: sphere, hop: hop });
    });
    
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
            scene.add(line);
        }
    });
    
    // Update info panel
    updateInfoPanel(hops);
    
    // Update stats
    document.getElementById('hop-count').textContent = hops.length;
    const avgRTT = hops.reduce((sum, h) => sum + (h.rtt[0] + h.rtt[1] + h.rtt[2]) / 3, 0) / hops.length;
    document.getElementById('avg-rtt').textContent = avgRTT.toFixed(2);
    
    animate();
}

function updateInfoPanel(hops) {
    let html = '';
    hops.slice(0, 10).forEach(hop => { // Show first 10
        const avgRTT = (hop.rtt[0] + hop.rtt[1] + hop.rtt[2]) / 3;
        if (hop.is_timeout) {
            html += `<div class="hop-info"><span class="hop-addr">${hop.ttl}</span>: <span class="timeout">* * *</span></div>`;
        } else {
            html += `<div class="hop-info"><span class="hop-addr">${hop.ttl}</span>: ${hop.hostname || hop.ip} (${avgRTT.toFixed(2)}ms)</div>`;
        }
    });
    if (hops.length > 10) {
        html += `<div class="hop-info">... and ${hops.length - 10} more</div>`;
    }
    document.getElementById('trace-info').innerHTML = html;
}

function animate() {
    requestAnimationFrame(animate);
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