import { marked } from 'marked';
// import slidesMarkdown from '../slides.md?raw'; // Removed raw import

const slideContainer = document.getElementById('slide-container');
let slides = [];
let currentSlideIndex = 0;
const slideDuration = 5000; // 5 seconds per slide

async function init() {
    try {
        const response = await fetch('./slides.md'); // Reverted to fetch
        const text = await response.text();
        const html = marked.parse(text);

        // Split by <hr> (horizontal rule) to create slides
        const slideContents = html.split('<hr>');

        slideContents.forEach((content, index) => {
            if (content.trim() === '') return;

            const slideDiv = document.createElement('div');
            slideDiv.classList.add('slide');

            // Create a wrapper for content to allow accurate scaling
            const contentWrapper = document.createElement('div');
            contentWrapper.classList.add('slide-content');
            contentWrapper.innerHTML = content;

            slideDiv.appendChild(contentWrapper);

            // Apply motion typography to text nodes
            applyMotionTypography(contentWrapper);

            slideContainer.appendChild(slideDiv);
            slides.push(slideDiv);
        });

        createBackgroundLights();

        if (slides.length > 0) {
            // Show the first slide
            showSlide(currentSlideIndex);

            // Auto-advance slides
            setInterval(nextSlide, slideDuration);
        }

        // Handle window resize
        window.addEventListener('resize', () => {
            fitSlideToScreen(slides[currentSlideIndex]);
        });
    } catch (error) {
        console.error('Failed to load slides:', error);
        slideContainer.innerHTML = '<p>Error loading slides.</p>';
    }
}

function applyMotionTypography(element) {
    // Simple implementation: wrap characters in tags
    const targets = element.querySelectorAll('h1, h2, p, li');
    targets.forEach(target => {
        const text = target.innerText;
        // Avoid destroying child elements if any (simple text only for now)
        if (target.children.length === 0) {
            target.innerHTML = text.split('').map(char => {
                if (char === ' ') return ' ';
                return `<span class="char">${char}</span>`;
            }).join('');
        }
    });
}

function showSlide(index) {
    slides.forEach((slide, i) => {
        if (i === index) {
            slide.classList.add('active', 'slide-enter');
            slide.classList.remove('slide-exit');
            fitSlideToScreen(slide); // Fit content when showing slide
        } else {
            slide.classList.remove('active', 'slide-enter');
            // Check if it was the previous slide to exit
            if (i === (index - 1 + slides.length) % slides.length) {
                // Keep slide-exit logic if managed elsewhere, or reset here if simple switching
                // For now, simple switching clean up
            }
        }
    });
}

function nextSlide() {
    const prevIndex = currentSlideIndex;
    currentSlideIndex = (currentSlideIndex + 1) % slides.length;

    const prevSlide = slides[prevIndex];
    const nextSlideEl = slides[currentSlideIndex];

    // Manage exit animation for previous slide
    prevSlide.classList.remove('active', 'slide-enter');
    prevSlide.classList.add('slide-exit');

    // Show next slide
    showSlide(currentSlideIndex);

    // Cleanup exit class after animation
    setTimeout(() => {
        prevSlide.classList.remove('slide-exit');
    }, 800);
}

function fitSlideToScreen(slide) {
    if (!slide) return;

    const content = slide.querySelector('.slide-content');
    if (!content) return;

    // Reset scale to measure natural size
    content.style.transform = 'scale(1)';

    const padding = 60; // Safety padding
    const w = window.innerWidth - padding;
    const h = window.innerHeight - padding;

    // Measure the content size
    const contentH = content.offsetHeight;
    const contentW = content.offsetWidth;

    // Check if scaling is needed
    if (contentH > h || contentW > w) {
        const scaleH = h / contentH;
        const scaleW = w / contentW;
        const scale = Math.min(scaleH, scaleW); // Fit to the most constrained dimension

        content.style.transform = `scale(${scale})`;
    }
}

function createBackgroundLights() {
    const backgroundContainer = document.getElementById('background');
    const lightCount = 50;

    for (let i = 0; i < lightCount; i++) {
        const light = document.createElement('div');
        light.classList.add('light');

        // Random properties
        const size = Math.random() * 100 + 20; // 20px to 120px
        const left = Math.random() * 100; // 0% to 100%
        const duration = Math.random() * 10 + 5; // 5s to 15s
        const delay = Math.random() * 10; // 0s to 10s

        // Random Color (Vibrant HSL)
        const hue = Math.floor(Math.random() * 360);
        const saturation = Math.floor(Math.random() * 30) + 70; // 70-100%
        const lightness = Math.floor(Math.random() * 20) + 50; // 50-70%
        const color = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`;

        light.style.width = `${size}px`;
        light.style.height = `${size}px`;
        light.style.left = `${left}%`;
        light.style.animationDuration = `${duration}s`;
        light.style.animationDelay = `-${delay}s`; // Negative delay to start immediately

        // Override default white gradient with colored one
        light.style.background = `radial-gradient(circle, ${color} 0%, rgba(255,255,255,0) 70%)`;

        backgroundContainer.appendChild(light);
    }
}

init();
