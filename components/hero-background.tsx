'use client';

import { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    originX: number;
    originY: number;
    angle: number;
    speed: number;
    radius: number;
    vx: number;
    vy: number;
    phaseX: number;
    phaseY: number;
}

export function HeroBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];
        let width = 0;
        let height = 0;

        const mouse = {
            x: -1000,
            y: -1000,
            radius: 150, // repel radius
        };

        // Check for reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

        const init = () => {
            // High DPI screen support
            const dpr = window.devicePixelRatio || 1;
            const parent = canvas.parentElement;
            if (parent) {
                width = parent.clientWidth;
                height = parent.clientHeight;
                canvas.width = width * dpr;
                canvas.height = height * dpr;
                canvas.style.width = `${width}px`;
                canvas.style.height = `${height}px`;
                ctx.scale(dpr, dpr);
            }

            createParticles();
        };

        const createParticles = () => {
            particles = [];
            
            // Density normalization: approximately constant density per unit area (1 per ~10,000 pixels)
            const area = width * height;
            const numParticles = Math.min(Math.floor(area / 10000), 400);

            for (let i = 0; i < numParticles; i++) {
                // Uniform distribution across the entire canvas creating a field, not a shape
                const originX = Math.random() * width;
                const originY = Math.random() * height;

                particles.push({
                    x: originX,
                    y: originY,
                    originX,
                    originY,
                    angle: Math.random() * Math.PI * 2,
                    speed: 0.0002 + Math.random() * 0.0008,
                    radius: Math.random() * 1.5 + 0.5, // Smaller, subtle non-intrusive particles
                    vx: 0,
                    vy: 0,
                    phaseX: Math.random() * Math.PI * 2, // Unique phases for async motion
                    phaseY: Math.random() * Math.PI * 2,
                });
            }
        };

        const animate = () => {
            if (prefersReducedMotion.matches) return;

            ctx.clearRect(0, 0, width, height);

            const time = Date.now() * 0.001;

            particles.forEach((p) => {
                // Organic, non-uniform motion using combined trigonometric waves
                // Individual phases break up the synchronization completely
                const driftX = Math.sin(time * 0.3 + p.phaseX) * 20 + Math.cos(time * 0.15 + p.phaseY) * 10;
                const driftY = Math.cos(time * 0.4 + p.phaseY) * 20 + Math.sin(time * 0.2 + p.phaseX) * 10;

                const targetX = p.originX + driftX;
                const targetY = p.originY + driftY;

                // Mouse interaction (repel with smooth falloff)
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                let repelX = 0;
                let repelY = 0;
                
                if (dist < mouse.radius) {
                    // Quadratic easing for smoother interaction falloff
                    const force = Math.pow((mouse.radius - dist) / mouse.radius, 2);
                    const repelStrength = force * 1.5;
                    repelX = (dx / dist) * repelStrength;
                    repelY = (dy / dist) * repelStrength;
                }

                // Gentle spring physics towards target
                const ax = (targetX - p.x) * 0.015 + repelX;
                const ay = (targetY - p.y) * 0.015 + repelY;

                p.vx += ax;
                p.vy += ay;

                // Damping/Friction (higher friction for smoother motion)
                p.vx *= 0.82;
                p.vy *= 0.82;

                p.x += p.vx;
                p.y += p.vy;

                // Draw particle (very subtle opacity)
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(148, 163, 184, 0.25)';
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e: MouseEvent) => {
            const parent = canvas.parentElement;
            if (!parent) return;
            const rect = parent.getBoundingClientRect();
            // Map window coordinates to canvas local coordinates
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };

        const handleMouseLeave = () => {
            mouse.x = -1000;
            mouse.y = -1000;
        };

        const handleResize = () => {
            init();
        };

        init();
        if (!prefersReducedMotion.matches) {
            animate();
        } else {
            // Just draw once if reduced motion is preferred
            animate();
        }

        window.addEventListener('resize', handleResize);
        
        // Listen on the parent so mouse movements register everywhere in the hero
        const parent = canvas.parentElement;
        if (parent) {
            parent.addEventListener('mousemove', handleMouseMove);
            parent.addEventListener('mouseleave', handleMouseLeave);
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            if (parent) {
                parent.removeEventListener('mousemove', handleMouseMove);
                parent.removeEventListener('mouseleave', handleMouseLeave);
            }
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-0 pointer-events-none"
            aria-hidden="true"
        />
    );
}