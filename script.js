class HulkPortfolio {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.hulk = null;
        this.mixer = null;
        this.clock = new THREE.Clock();
        this.isAnimating = false;
        this.currentProjectIndex = 0;
        this.projectCards = [];
        this.hulkLandedOnProject = false;
        this.currentLandedCard = null;
        
        this.init();
        this.setupEventListeners();
    }
    
    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x0c0c0c, 10, 50);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 2, 8);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);
        
        this.setupLighting();
        this.createHulk();
        this.createEnvironment();
        this.animate();
        
        // Hide loading after setup
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
            this.projectCards = Array.from(document.querySelectorAll('.project-card'));
        }, 2000);
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Green accent light for Hulk
        const greenLight = new THREE.PointLight(0x00ff88, 0.8, 20);
        greenLight.position.set(0, 3, 2);
        this.scene.add(greenLight);
    }
    
    createHulk() {
        // Try to load a real 3D model first, fallback to geometry if it fails
        const loader = new THREE.GLTFLoader();
        
        // Using a free Hulk-like character model from Sketchfab
        loader.load(
            'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb',
            (gltf) => {
                this.hulk = gltf.scene;
                this.hulk.scale.set(2, 2, 2);
                this.hulk.position.set(0, -2, 0);
                
                // Make it green like Hulk
                this.hulk.traverse((child) => {
                    if (child.isMesh) {
                        child.material = new THREE.MeshPhongMaterial({ 
                            color: 0x4a9c4a,
                            shininess: 30
                        });
                        child.castShadow = true;
                    }
                });
                
                this.scene.add(this.hulk);
                
                // Setup animations if available
                if (gltf.animations && gltf.animations.length) {
                    this.mixer = new THREE.AnimationMixer(this.hulk);
                    this.idleAction = this.mixer.clipAction(gltf.animations[0]);
                    this.idleAction.play();
                }
                
                this.playWelcomeAnimation();
            },
            (progress) => {
                console.log('Loading progress:', progress);
            },
            (error) => {
                console.log('Model loading failed, using fallback geometry');
                this.createFallbackHulk();
            }
        );
    }
    
    createFallbackHulk() {
        // Enhanced fallback Hulk with better proportions
        const hulkGroup = new THREE.Group();
        
        // Body (more muscular)
        const bodyGeometry = new THREE.BoxGeometry(2, 3, 1.2);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x4a9c4a,
            shininess: 30
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.5;
        body.castShadow = true;
        hulkGroup.add(body);
        
        // Head (more angular)
        const headGeometry = new THREE.BoxGeometry(1.2, 1.2, 1);
        const headMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x4a9c4a,
            shininess: 30
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 3.6;
        head.castShadow = true;
        hulkGroup.add(head);
        
        // Eyes (glowing red)
        const eyeGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const eyeMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.5
        });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.3, 3.7, 0.6);
        hulkGroup.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.3, 3.7, 0.6);
        hulkGroup.add(rightEye);
        
        // Massive arms
        const armGeometry = new THREE.BoxGeometry(0.8, 2.5, 0.8);
        const armMaterial = new THREE.MeshPhongMaterial({ color: 0x4a9c4a });
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-1.8, 2, 0);
        leftArm.rotation.z = 0.2;
        leftArm.castShadow = true;
        hulkGroup.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(1.8, 2, 0);
        rightArm.rotation.z = -0.2;
        rightArm.castShadow = true;
        hulkGroup.add(rightArm);
        
        // Fists
        const fistGeometry = new THREE.SphereGeometry(0.5, 8, 8);
        const leftFist = new THREE.Mesh(fistGeometry, armMaterial);
        leftFist.position.set(-1.8, 0.3, 0);
        leftFist.castShadow = true;
        hulkGroup.add(leftFist);
        
        const rightFist = new THREE.Mesh(fistGeometry, armMaterial);
        rightFist.position.set(1.8, 0.3, 0);
        rightFist.castShadow = true;
        hulkGroup.add(rightFist);
        
        // Legs
        const legGeometry = new THREE.BoxGeometry(0.8, 2.5, 0.8);
        const legMaterial = new THREE.MeshPhongMaterial({ color: 0x4a9c4a });
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.6, -1.25, 0);
        leftLeg.castShadow = true;
        hulkGroup.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.6, -1.25, 0);
        rightLeg.castShadow = true;
        hulkGroup.add(rightLeg);
        
        hulkGroup.position.y = 0;
        this.hulk = hulkGroup;
        this.scene.add(hulkGroup);
        
        // Welcome animation
        this.playWelcomeAnimation();
    }
    
    createEnvironment() {
        // Ground
        const groundGeometry = new THREE.PlaneGeometry(50, 50);
        const groundMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x333333,
            transparent: true,
            opacity: 0.8
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -2.5;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // Particles for atmosphere
        this.createParticles();
    }
    
    createParticles() {
        const particleCount = 100;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 50;
            positions[i + 1] = Math.random() * 20;
            positions[i + 2] = (Math.random() - 0.5) * 50;
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: 0x00ff88,
            size: 0.1,
            transparent: true,
            opacity: 0.6
        });
        
        const particleSystem = new THREE.Points(particles, particleMaterial);
        this.scene.add(particleSystem);
    }
    
    playWelcomeAnimation() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        // Hulk appears with a roar gesture
        this.hulk.scale.set(0.1, 0.1, 0.1);
        this.hulk.position.y = -5;
        
        // Scale up animation
        const scaleAnimation = () => {
            this.hulk.scale.lerp(new THREE.Vector3(1, 1, 1), 0.05);
            this.hulk.position.y += 0.1;
            
            if (this.hulk.scale.x < 0.95) {
                requestAnimationFrame(scaleAnimation);
            } else {
                this.hulk.scale.set(1, 1, 1);
                this.hulk.position.y = 0;
                this.playIdleAnimation();
                this.isAnimating = false;
            }
        };
        
        setTimeout(scaleAnimation, 1000);
    }
    
    playIdleAnimation() {
        // Breathing animation
        const breathe = () => {
            if (!this.isAnimating) {
                const time = Date.now() * 0.001;
                this.hulk.scale.y = 1 + Math.sin(time * 2) * 0.02;
                this.hulk.rotation.y = Math.sin(time * 0.5) * 0.1;
            }
            requestAnimationFrame(breathe);
        };
        breathe();
    }
    
    playSmashAnimation(targetElement, isButtonSmash = false) {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        // Play roar sound effect
        this.playRoarSound();
        
        // Make Hulk grow bigger and prepare for smash
        const originalScale = this.hulk.scale.clone();
        
        let phase = 0;
        const originalY = this.hulk.position.y;
        
        const smashAnimation = () => {
            phase += 0.12;
            
            if (phase < 0.4) {
                // Charge up phase - grow bigger and raise arms
                const scaleMultiplier = 1 + phase * 0.8;
                this.hulk.scale.set(
                    originalScale.x * scaleMultiplier,
                    originalScale.y * scaleMultiplier,
                    originalScale.z * scaleMultiplier
                );
                
                // Raise arms for smash
                if (this.hulk.children) {
                    this.hulk.children.forEach((child, index) => {
                        if (index > 2 && index < 5) { // Arms
                            child.rotation.x = -phase * 2;
                        }
                    });
                }
                
                requestAnimationFrame(smashAnimation);
            } else if (phase < 0.6) {
                // Smash down phase
                const smashPhase = (phase - 0.4) / 0.2;
                
                // Arms come down fast
                if (this.hulk.children) {
                    this.hulk.children.forEach((child, index) => {
                        if (index > 2 && index < 5) { // Arms
                            child.rotation.x = -0.8 + (smashPhase * 1.5);
                        }
                    });
                }
                
                requestAnimationFrame(smashAnimation);
            } else {
                // Impact and aftermath
                this.hulk.scale.copy(originalScale);
                
                // Reset arm rotations
                if (this.hulk.children) {
                    this.hulk.children.forEach((child) => {
                        child.rotation.x = 0;
                    });
                }
                
                // Break the card with animation
                targetElement.classList.add('broken');
                
                // Massive smash effects
                this.createMassiveSmashEffect();
                this.playSmashSound();
                this.screenShake();
                
                // Reset state if this was a button smash
                if (isButtonSmash) {
                    this.hulkLandedOnProject = false;
                    this.currentLandedCard = null;
                    document.getElementById('smashBtn').style.display = 'none';
                    document.getElementById('jumpBtn').textContent = '🦘 Jump to Project';
                    
                    // Return Hulk to center
                    setTimeout(() => {
                        this.returnHulkToCenter();
                    }, 1000);
                }
                
                // Open link after animation
                setTimeout(() => {
                    const url = targetElement.getAttribute('data-url');
                    window.open(url, '_blank');
                    
                    // Reset card after opening link
                    setTimeout(() => {
                        targetElement.classList.remove('broken');
                        targetElement.classList.remove('hulk-landed');
                    }, 2000);
                    
                    this.isAnimating = false;
                }, 1200);
            }
        };
        
        smashAnimation();
    }
    
    returnHulkToCenter() {
        let phase = 0;
        const startX = this.hulk.position.x;
        
        const returnAnimation = () => {
            phase += 0.05;
            
            if (phase < 1) {
                this.hulk.position.x = startX * (1 - phase);
                requestAnimationFrame(returnAnimation);
            } else {
                this.hulk.position.x = 0;
            }
        };
        
        returnAnimation();
    }
    
    createMassiveSmashEffect() {
        // Create more intense impact particles
        const particleCount = 100;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(
                new THREE.SphereGeometry(0.08, 4, 4),
                new THREE.MeshBasicMaterial({ 
                    color: Math.random() > 0.5 ? 0xff4444 : 0x00ff88 
                })
            );
            
            particle.position.copy(this.hulk.position);
            particle.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 15,
                Math.random() * 8,
                (Math.random() - 0.5) * 15
            );
            
            particles.push(particle);
            this.scene.add(particle);
        }
        
        // Animate particles
        const animateParticles = () => {
            particles.forEach((particle, index) => {
                particle.position.add(particle.velocity);
                particle.velocity.y -= 0.3; // stronger gravity
                particle.material.opacity -= 0.015;
                particle.rotation.x += 0.1;
                particle.rotation.y += 0.1;
                
                if (particle.material.opacity <= 0) {
                    this.scene.remove(particle);
                    particles.splice(index, 1);
                }
            });
            
            if (particles.length > 0) {
                requestAnimationFrame(animateParticles);
            }
        };
        
        animateParticles();
    }
    
    playRoarSound() {
        // Create a simple roar sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }
    
    playSmashSound() {
        // Create impact sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(20, audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    }
    
    screenShake() {
        const originalTransform = document.body.style.transform;
        let shakeIntensity = 10;
        let shakeCount = 0;
        const maxShakes = 20;
        
        const shake = () => {
            if (shakeCount < maxShakes) {
                const x = (Math.random() - 0.5) * shakeIntensity;
                const y = (Math.random() - 0.5) * shakeIntensity;
                document.body.style.transform = `translate(${x}px, ${y}px)`;
                shakeIntensity *= 0.9;
                shakeCount++;
                setTimeout(shake, 50);
            } else {
                document.body.style.transform = originalTransform;
            }
        };
        
        shake();
    }
    
    createSmashEffect() {
        // Create impact particles
        const particleCount = 50;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(
                new THREE.SphereGeometry(0.05, 4, 4),
                new THREE.MeshBasicMaterial({ color: 0x00ff88 })
            );
            
            particle.position.copy(this.hulk.position);
            particle.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 10,
                Math.random() * 5,
                (Math.random() - 0.5) * 10
            );
            
            particles.push(particle);
            this.scene.add(particle);
        }
        
        // Animate particles
        const animateParticles = () => {
            particles.forEach((particle, index) => {
                particle.position.add(particle.velocity);
                particle.velocity.y -= 0.2; // gravity
                particle.material.opacity -= 0.02;
                
                if (particle.material.opacity <= 0) {
                    this.scene.remove(particle);
                    particles.splice(index, 1);
                }
            });
            
            if (particles.length > 0) {
                requestAnimationFrame(animateParticles);
            }
        };
        
        animateParticles();
    }
    
    setupEventListeners() {
        // Jump button
        document.getElementById('jumpBtn').addEventListener('click', () => {
            this.jumpToNextProject();
        });
        
        // Smash button
        document.getElementById('smashBtn').addEventListener('click', () => {
            this.smashCurrentProject();
        });
        
        // Project card clicks (keep for direct clicking)
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!this.hulkLandedOnProject) {
                    this.playSmashAnimation(e.currentTarget);
                }
            });
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // Mouse movement for camera
        document.addEventListener('mousemove', (e) => {
            if (!this.isAnimating) {
                const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
                const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
                
                this.camera.position.x = mouseX * 2;
                this.camera.position.y = 2 + mouseY * 1;
                this.camera.lookAt(this.hulk.position);
            }
        });
    }
    
    jumpToNextProject() {
        if (this.isAnimating) return;
        
        // Reset previous landed card
        if (this.currentLandedCard) {
            this.currentLandedCard.classList.remove('hulk-landed');
        }
        
        // Get next project
        const targetCard = this.projectCards[this.currentProjectIndex];
        this.currentProjectIndex = (this.currentProjectIndex + 1) % this.projectCards.length;
        
        this.playJumpAnimation(targetCard);
    }
    
    playJumpAnimation(targetCard) {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        // Play jump sound
        this.playJumpSound();
        
        // Get target position
        const rect = targetCard.getBoundingClientRect();
        const targetX = (rect.left + rect.width / 2 - window.innerWidth / 2) / 100;
        
        // Jump animation
        let phase = 0;
        const originalY = this.hulk.position.y;
        const originalX = this.hulk.position.x;
        
        const jumpAnimation = () => {
            phase += 0.1;
            
            if (phase < 1) {
                // Jump phase
                this.hulk.position.y = originalY + Math.sin(phase * Math.PI) * 3;
                this.hulk.position.x = originalX + (targetX * phase);
                this.hulk.rotation.z = Math.sin(phase * Math.PI) * 0.2;
                
                // Rotate for style
                this.hulk.rotation.y = phase * Math.PI * 2;
                
                requestAnimationFrame(jumpAnimation);
            } else {
                // Landing
                this.hulk.position.y = originalY;
                this.hulk.position.x = originalX + targetX;
                this.hulk.rotation.z = 0;
                this.hulk.rotation.y = 0;
                
                // Mark as landed
                this.hulkLandedOnProject = true;
                this.currentLandedCard = targetCard;
                targetCard.classList.add('hulk-landed');
                
                // Show smash button
                document.getElementById('smashBtn').style.display = 'block';
                document.getElementById('jumpBtn').textContent = '🦘 Jump to Next';
                
                this.playLandingEffect();
                this.isAnimating = false;
            }
        };
        
        jumpAnimation();
    }
    
    smashCurrentProject() {
        if (!this.hulkLandedOnProject || !this.currentLandedCard || this.isAnimating) return;
        
        this.playSmashAnimation(this.currentLandedCard, true);
    }
    
    playJumpSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    }
    
    playLandingEffect() {
        // Create small impact particles
        const particleCount = 20;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(
                new THREE.SphereGeometry(0.03, 4, 4),
                new THREE.MeshBasicMaterial({ color: 0x00ff88 })
            );
            
            particle.position.copy(this.hulk.position);
            particle.position.y -= 1;
            particle.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 5,
                Math.random() * 2,
                (Math.random() - 0.5) * 5
            );
            
            particles.push(particle);
            this.scene.add(particle);
        }
        
        // Animate particles
        const animateParticles = () => {
            particles.forEach((particle, index) => {
                particle.position.add(particle.velocity);
                particle.velocity.y -= 0.1;
                particle.material.opacity -= 0.05;
                
                if (particle.material.opacity <= 0) {
                    this.scene.remove(particle);
                    particles.splice(index, 1);
                }
            });
            
            if (particles.length > 0) {
                requestAnimationFrame(animateParticles);
            }
        };
        
        animateParticles();
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        
        if (this.mixer) {
            this.mixer.update(delta);
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the portfolio when page loads
window.addEventListener('load', () => {
    new HulkPortfolio();
});