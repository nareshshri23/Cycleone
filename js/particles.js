let scene, camera, renderer, particles;
let raycaster, mouse;
let particlesData = [];
const particlesCount = 1500;
const maxDistance = 50;
const repelStrength = 0.1;

function init() {
    // Create scene
    scene = new THREE.Scene();

    // Setup camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;

    // Setup renderer
    renderer = new THREE.WebGLRenderer({ 
        canvas: document.getElementById('particleCanvas'),
        alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Setup raycaster and mouse
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(particlesCount * 3);
    const velocityArray = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        // Position
        posArray[i3] = (Math.random() - 0.5) * 100;
        posArray[i3 + 1] = (Math.random() - 0.5) * 100;
        posArray[i3 + 2] = (Math.random() - 0.5) * 100;

        // Velocity
        velocityArray[i3] = 0;
        velocityArray[i3 + 1] = 0;
        velocityArray[i3 + 2] = 0;

        // Store particle data
        particlesData.push({
            velocity: new THREE.Vector3(0, 0, 0),
            originalPosition: new THREE.Vector3(
                posArray[i3],
                posArray[i3 + 1],
                posArray[i3 + 2]
            )
        });
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.2,
        color: '#4fc3dc',
        transparent: true,
        opacity: 0.8
    });

    particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Event listeners
    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('scroll', checkVisibility, false);
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function checkVisibility() {
    const canvas = document.getElementById('particleCanvas');
    const homeSection = document.getElementById('home');
    const homeBounds = homeSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Keep animation visible as long as any part of home section is in viewport
    if (homeBounds.bottom > 0 && homeBounds.top < windowHeight) {
        canvas.style.opacity = '1';
        canvas.style.visibility = 'visible';
    } else {
        canvas.style.opacity = '0';
        canvas.style.visibility = 'hidden';
    }
}

function updateParticles() {
    const positions = particles.geometry.attributes.position.array;

    // Update raycaster
    raycaster.setFromCamera(mouse, camera);
    const mousePoint = new THREE.Vector3();
    mousePoint.copy(raycaster.ray.direction);
    mousePoint.multiplyScalar(25);
    mousePoint.add(raycaster.ray.origin);

    for(let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        const particle = particlesData[i];
        
        // Get current position
        const particlePos = new THREE.Vector3(
            positions[i3],
            positions[i3 + 1],
            positions[i3 + 2]
        );

        // Calculate distance to mouse
        const distanceToMouse = particlePos.distanceTo(mousePoint);

        if (distanceToMouse < maxDistance) {
            // Calculate repel direction
            const repelDir = particlePos.clone().sub(mousePoint).normalize();
            const force = (1 - distanceToMouse / maxDistance) * repelStrength;
            particle.velocity.add(repelDir.multiplyScalar(force));
        }

        // Move towards original position
        const originalPos = particle.originalPosition;
        const toOriginal = originalPos.clone().sub(particlePos);
        particle.velocity.add(toOriginal.multiplyScalar(0.01));

        // Apply velocity
        particle.velocity.multiplyScalar(0.95); // Damping
        positions[i3] += particle.velocity.x;
        positions[i3 + 1] += particle.velocity.y;
        positions[i3 + 2] += particle.velocity.z;
    }

    particles.geometry.attributes.position.needsUpdate = true;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    // Only update if canvas is visible
    if (document.getElementById('particleCanvas').style.visibility !== 'hidden') {
        updateParticles();
        particles.rotation.x += 0.0002;
        particles.rotation.y += 0.0002;
        renderer.render(scene, camera);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    init();
    animate();
    // Initial visibility check
    checkVisibility();
});
