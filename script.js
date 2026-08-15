document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initScrollReveal();
  initSkillBars();
  initEducation();
  initWebGLBackground();
  init3DCards();
  initVideoMuteToggle();
});

/* ==========================================================================
   Hero Video Mute Toggle
   ========================================================================== */
function initVideoMuteToggle() {
  const video = document.getElementById('heroVideo');
  const muteBtn = document.getElementById('videoMuteBtn');
  const muteIcon = document.getElementById('muteIcon');
  
  if (!video || !muteBtn || !muteIcon) return;
  
  // Attempt to auto-unmute on load
  video.muted = false;
  video.volume = 1.0;
  video.play().then(() => {
    // Autoplay with sound succeeded (unlikely but possible)
    muteIcon.classList.remove('fa-volume-xmark');
    muteIcon.classList.add('fa-volume-high');
    muteBtn.classList.add('unmuted');
  }).catch((e) => {
    // Browser blocked it. Revert to muted to keep the video visually playing.
    video.muted = true;
    video.play();
    muteIcon.classList.remove('fa-volume-high');
    muteIcon.classList.add('fa-volume-xmark');
    muteBtn.classList.remove('unmuted');
  });

  // Global listener: First user interaction anywhere on the page unlocks the sound
  const unlockAudio = () => {
    if (video.muted) {
      video.muted = false;
      video.volume = 1.0;
      muteIcon.classList.remove('fa-volume-xmark');
      muteIcon.classList.add('fa-volume-high');
      muteBtn.classList.add('unmuted');
    }
    // Remove listener after first interaction
    document.removeEventListener('click', unlockAudio);
  };
  document.addEventListener('click', unlockAudio);

  // Mute button explicit toggle
  muteBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent triggering the global unlock
    if (video.muted) {
      video.muted = false;
      video.volume = 1.0;
      muteIcon.classList.remove('fa-volume-xmark');
      muteIcon.classList.add('fa-volume-high');
      muteBtn.classList.add('unmuted');
    } else {
      video.muted = true;
      muteIcon.classList.remove('fa-volume-high');
      muteIcon.classList.add('fa-volume-xmark');
      muteBtn.classList.remove('unmuted');
    }
  });

  // Handle transition from video to photo when video ends
  video.addEventListener('ended', () => {
    const wrapper = document.getElementById('heroWrapper');
    if (wrapper) {
      wrapper.classList.add('show-photo');
    }
    // Pause video definitively just in case
    video.pause();
  });
}

/* ==========================================================================
   Navbar Scroll Effect
   ========================================================================== */
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

/* ==========================================================================
   Smooth Scroll Reveal Animations
   ========================================================================== */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  revealEls.forEach((el) => observer.observe(el));
}

/* ==========================================================================
   Skill Radials Animation & Counting
   ========================================================================== */
function initSkillBars() {
  const skillsSection = document.getElementById('skills');
  const skillFills = document.querySelectorAll('.radial-fill');
  const skillTexts = document.querySelectorAll('.skill-percent-text');
  
  if (!skillsSection || (!skillFills.length && !skillTexts.length)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Animate SVG Radial Fill
        skillFills.forEach(circle => {
          const targetPercent = parseInt(circle.getAttribute('data-target-percent'), 10);
          const circumference = 251.2; // 2 * PI * 40
          const offset = circumference - (targetPercent / 100) * circumference;
          
          setTimeout(() => {
            circle.style.strokeDashoffset = offset;
          }, 200);
        });

        // Animate Numbers
        skillTexts.forEach(text => {
          const target = parseInt(text.getAttribute('data-percent'), 10);
          let current = 0;
          const increment = Math.ceil(target / 40); // 40 frames
          
          const counter = setInterval(() => {
            current += increment;
            if (current >= target) {
              current = target;
              clearInterval(counter);
            }
            text.innerText = current + '%';
          }, 30); // 30ms interval
        });
        
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(skillsSection);
}

/* ==========================================================================
   Education Section — CGPA Ring + Score Bar Animations
   ========================================================================== */
function initEducation() {
  const eduSection = document.getElementById('education');
  if (!eduSection) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      // Animate CGPA Ring
      const cgpaCircle = eduSection.querySelector('.cgpa-fill');
      const cgpaText = eduSection.querySelector('.cgpa-number');
      if (cgpaCircle && cgpaText) {
        const cgpa = parseFloat(cgpaCircle.getAttribute('data-cgpa'));
        const max = parseFloat(cgpaCircle.getAttribute('data-max') || '10');
        const circumference = 326.7; // 2 * PI * 52
        const offset = circumference - (cgpa / max) * circumference;
        setTimeout(() => {
          cgpaCircle.style.strokeDashoffset = offset;
        }, 150);

        // Count up CGPA number
        let current = 0;
        const step = cgpa / 50;
        const counter = setInterval(() => {
          current += step;
          if (current >= cgpa) { current = cgpa; clearInterval(counter); }
          cgpaText.textContent = current.toFixed(1);
        }, 30);
      }

      // Animate Score Bars
      eduSection.querySelectorAll('.edu-score-fill').forEach(bar => {
        const w = parseFloat(bar.getAttribute('data-width'));
        setTimeout(() => { bar.style.width = w + '%'; }, 300);
      });

      observer.unobserve(entry.target);
    });
  }, { threshold: 0.25 });

  observer.observe(eduSection);
}

/* ==========================================================================
   Three.js WebGL Cosmic Fantasy Background
   ========================================================================== */
function initWebGLBackground() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // Scene setup
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x020005, 0.001); // Ethereal deep space fog

  // Camera setup
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.z = 800;

  // Renderer setup
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimize performance

  // Particles (Stars & Magic Dust)
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 4000;
  
  const posArray = new Float32Array(particlesCount * 3);
  const colorArray = new Float32Array(particlesCount * 3);
  const scaleArray = new Float32Array(particlesCount);

  const color1 = new THREE.Color(0xc8b6ff); // Ethereal purple
  const color2 = new THREE.Color(0x8bb8e8); // Glowing cyan
  const color3 = new THREE.Color(0xffffff); // Pure white star

  for(let i = 0; i < particlesCount * 3; i+=3) {
    // Spread particles in a wide 3D volume
    posArray[i] = (Math.random() - 0.5) * 3000;     // x
    posArray[i+1] = (Math.random() - 0.5) * 3000;   // y
    posArray[i+2] = (Math.random() - 0.5) * 2000 - 500; // z

    // Mix colors randomly
    const mixedColor = color1.clone();
    const rand = Math.random();
    if(rand > 0.6) mixedColor.copy(color2);
    if(rand > 0.9) mixedColor.copy(color3);

    colorArray[i] = mixedColor.r;
    colorArray[i+1] = mixedColor.g;
    colorArray[i+2] = mixedColor.b;

    // Randomize sizes
    scaleArray[i/3] = Math.random() * 2;
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
  particlesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1));

  // Custom shader material for glowing fantasy particles
  const particlesMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 }
    },
    vertexShader: `
      attribute float aScale;
      attribute vec3 color;
      varying vec3 vColor;
      uniform float uTime;
      void main() {
        vColor = color;
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);
        
        // Gentle floating wave motion
        modelPosition.y += sin(uTime * 0.5 + modelPosition.x * 0.005) * 20.0;
        modelPosition.x += cos(uTime * 0.3 + modelPosition.y * 0.005) * 20.0;

        vec4 viewPosition = viewMatrix * modelPosition;
        vec4 projectedPosition = projectionMatrix * viewPosition;
        
        gl_Position = projectedPosition;
        
        // Size attenuation based on distance
        gl_PointSize = aScale * 6.0 * (500.0 / -viewPosition.z);
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        // Create circular glowing particle
        float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
        float strength = 0.05 / distanceToCenter - 0.1;
        
        gl_FragColor = vec4(vColor, strength);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particlesMesh);

  // Mouse Interaction
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
  });

  // Handle Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  // Animation Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();
    particlesMaterial.uniforms.uTime.value = elapsedTime;

    // Slowly rotate the entire galaxy
    particlesMesh.rotation.y = elapsedTime * 0.02;
    particlesMesh.rotation.x = elapsedTime * 0.01;

    // Smooth camera pan based on mouse
    targetX = mouseX * 0.5;
    targetY = mouseY * 0.5;
    
    camera.position.x += (targetX - camera.position.x) * 0.02;
    camera.position.y += (-targetY - camera.position.y) * 0.02;
    
    // Make camera look at center slightly offset by scroll
    const scrollY = window.scrollY;
    camera.lookAt(scene.position.x, scene.position.y - (scrollY * 0.5), scene.position.z);

    renderer.render(scene, camera);
  }

  animate();
}

/* ==========================================================================
   3D Card Tilt Effect
   ========================================================================== */
function init3DCards() {
  const cards = document.querySelectorAll('.card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x position within the element
      const y = e.clientY - rect.top;  // y position within the element
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -10; // Max rotation 10deg
      const rotateY = ((x - centerX) / centerX) * 10;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
    });
  });
}
