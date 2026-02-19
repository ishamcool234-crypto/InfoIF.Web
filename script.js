document.addEventListener('DOMContentLoaded', () => {
    // --- Custom Cursor Logic ---
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');

    let posX = 0, posY = 0;
    let mouseX = 0, mouseY = 0;

    gsap.to({}, 0.016, {
        repeat: -1,
        onRepeat: function () {
            posX += (mouseX - posX) / 9;
            posY += (mouseY - posY) / 9;

            gsap.set(follower, {
                css: {
                    left: posX - 12, // adjust for size
                    top: posY - 12
                }
            });

            gsap.set(cursor, {
                css: {
                    left: mouseX,
                    top: mouseY
                }
            });
        }
    });

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Hover effect for links/buttons
    document.querySelectorAll('a, button, .glass-card').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('active');
            follower.classList.add('active');
            gsap.to(follower, {
                scale: 1.5,
                borderColor: 'var(--secondary-color)',
                duration: 0.3
            });
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('active');
            follower.classList.remove('active');
            gsap.to(follower, {
                scale: 1,
                borderColor: 'rgba(108, 92, 231, 0.5)',
                duration: 0.3
            });
        });
    });

    // --- Three.js Background Animation ---
    const initThreeJS = () => {
        const container = document.getElementById('canvas-container');
        const scene = new THREE.Scene();
        // Add subtle fog for depth
        scene.fog = new THREE.FogExp2(0x0a0a0e, 0.02);

        // Camera setup
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 30;
        camera.position.y = 5; // Look down slightly

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        // --- Particles ---
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 2500;

        const posArray = new Float32Array(particlesCount * 3);
        const sizesArray = new Float32Array(particlesCount);

        for (let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 80;
            if (i % 3 === 1) posArray[i] = (Math.random() - 0.5) * 80; // Y spread
        }
        for (let i = 0; i < particlesCount; i++) {
            sizesArray[i] = Math.random();
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizesArray, 1)); // Custom size attribute if using shader, but simpler for PointsMaterial

        // Tech-blue particles
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.15,
            color: 0x00cec9,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        // Secondary purple particles
        const particlesGeometry2 = new THREE.BufferGeometry();
        const posArray2 = new Float32Array(particlesCount * 3);
        for (let i = 0; i < particlesCount * 3; i++) {
            posArray2[i] = (Math.random() - 0.5) * 100;
        }
        particlesGeometry2.setAttribute('position', new THREE.BufferAttribute(posArray2, 3));
        const particlesMaterial2 = new THREE.PointsMaterial({
            size: 0.12,
            color: 0x6c5ce7,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        const particlesMesh2 = new THREE.Points(particlesGeometry2, particlesMaterial2);
        scene.add(particlesMesh2);

        // --- Hero Object (Double Icosahedron) ---
        const geometry = new THREE.IcosahedronGeometry(7, 1);
        const material = new THREE.MeshBasicMaterial({
            color: 0x6c5ce7,
            wireframe: true,
            transparent: true,
            opacity: 0.2
        });
        const heroSphere = new THREE.Mesh(geometry, material);
        heroSphere.position.x = 12;

        // Inner core
        const coreGeometry = new THREE.IcosahedronGeometry(4, 0);
        const coreMaterial = new THREE.MeshBasicMaterial({
            color: 0x00cec9,
            wireframe: true,
            transparent: true,
            opacity: 0.5
        });
        const heroCore = new THREE.Mesh(coreGeometry, coreMaterial);
        heroSphere.add(heroCore); // Attach core to outer sphere

        scene.add(heroSphere);

        // --- Moving Grid Floor ---
        const gridHelper = new THREE.GridHelper(200, 50, 0x00cec9, 0x2d3436);
        gridHelper.position.y = -15;
        gridHelper.material.opacity = 0.2;
        gridHelper.material.transparent = true;
        scene.add(gridHelper);

        // Mouse interaction vars
        let targetX = 0;
        let targetY = 0;
        const windowHalfX = window.innerWidth / 2;
        const windowHalfY = window.innerHeight / 2;

        // Use the global mouseX/Y from cursor logic or listen again
        // We'll just read the global variables from the top

        // Animation Loop
        const animate = () => {
            targetX = mouseX * 0.0005;
            targetY = mouseY * 0.0005;

            // Rotate particles
            particlesMesh.rotation.y += 0.0005;
            particlesMesh.rotation.x += 0.0002;

            // Interactive rotation
            particlesMesh.rotation.y += 0.03 * (targetX - particlesMesh.rotation.y);

            // Pulse particles scale/movement (simulated by rotating faster/slower)
            const time = Date.now() * 0.00005;
            camera.position.x += (mouseX * 0.005 - camera.position.x) * 0.05;
            camera.position.y += (-mouseY * 0.005 - camera.position.y + 5) * 0.05; // +5 offset
            camera.lookAt(scene.position);


            // Hero Object Complex Rotation
            heroSphere.rotation.x += 0.003;
            heroSphere.rotation.y += 0.005;
            heroCore.rotation.x -= 0.01; // Counter-rotate inner
            heroCore.rotation.z += 0.005;

            // Float effect
            heroSphere.position.y = Math.sin(Date.now() * 0.001) * 1;

            // Grid movement effect
            gridHelper.position.z = (Date.now() * 0.005) % 4;

            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };

        animate();

        // Handle Resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    };

    initThreeJS();

    // --- GSAP Scroll Animations ---
    gsap.registerPlugin(ScrollTrigger);

    // Split Text Animation for Title (Simulated)
    // In a real project with SplitText plugin (paid), we'd use that.
    // Here we can manually stagger words or lines if they were wrapped.
    // For now, let's do a more robust standard stagger.

    const titleTimeline = gsap.timeline();
    titleTimeline
        .from('.hero-title span', {
            y: 100,
            opacity: 0,
            duration: 1.2,
            ease: "power4.out",
            stagger: 0.1
        })
        .from('.hero-subtitle', {
            y: 30,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        }, "-=0.8")
        .from('.hero-actions a', {
            y: 20,
            opacity: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: "back.out(1.7)"
        }, "-=0.6");

    // Sections Headers - Reveal from bottom
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.from(header, {
            scrollTrigger: {
                trigger: header,
                start: 'top 85%',
                toggleActions: "play none none reverse"
            },
            y: 50,
            opacity: 0,
            duration: 1,
            ease: 'power3.out'
        });
    });

    // Cards Stagger with 3D flip entrance
    const animateGrid = (selector) => {
        gsap.from(selector, {
            scrollTrigger: {
                trigger: selector,
                start: 'top 90%',
            },
            y: 100,
            opacity: 0,
            rotationX: -15,
            duration: 1,
            stagger: 0.1,
            ease: 'power3.out'
        });
    };

    animateGrid('.service-card');
    animateGrid('.portfolio-item');
    animateGrid('.pricing-card');

    // --- Vanilla Tilt ---
    VanillaTilt.init(document.querySelectorAll(".glass-card"), {
        max: 15, // increased tilt
        speed: 400,
        glare: true,
        "max-glare": 0.3, // stronger glare
        scale: 1.05,
        perspective: 1000
    });

    // --- Mobile Menu Toggle ---
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            const isFlex = navLinks.style.display === 'flex';
            navLinks.style.display = isFlex ? 'none' : 'flex';

            if (!isFlex) {
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '70px';
                navLinks.style.right = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = 'rgba(10, 10, 14, 0.98)';
                navLinks.style.padding = '2rem';
                navLinks.style.backdropFilter = 'blur(15px)';
                navLinks.style.borderBottom = '1px solid var(--secondary-color)';

                // Animate links in
                gsap.fromTo('.nav-links a',
                    { opacity: 0, x: 50 },
                    { opacity: 1, x: 0, stagger: 0.1, duration: 0.5 }
                );
            }
        });
    }

    // Smooth Scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
                // Close mobile menu if open
                if (window.innerWidth <= 768 && navLinks.style.display === 'flex') {
                    navLinks.style.display = 'none';
                }
            }
        });
    });
});
