'use client';

import { useEffect, useRef } from 'react';

// Lightweight 2D pseudo-noise for organic drift
const pseudoNoise = (x: number, y: number, t: number) => {
    return {
        nx: Math.sin(x * 0.01 + t) * Math.cos(y * 0.01 + t * 0.8),
        ny: Math.cos(x * 0.01 - t * 0.9) * Math.sin(y * 0.01 + t)
    };
};

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    baseX: number;
    baseY: number;
    radius: number;
}

export function HeroBackgroundPhysics() {
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
            radius: 200, // area of influence
            active: false
        };

        const config = {
            spacing: 40, // Uniform grid spacing ensures constant density
            repelRadius: 45, // Soft repulsion between neighbors
            friction: 0.85, // Damping
            springForce: 0.008, // Pull back to local center
            repelForce: 0.05,
            mouseForce: 0.4,
            noiseStrength: 0.15,
            reducedMotion: false,
        };

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        config.reducedMotion = prefersReducedMotion.matches;

        // Spatial partitioning grid to avoid O(N^2)
        const cellSize = config.repelRadius;
        let grid = new Map<string, Particle[]>();

        const getGridKey = (x: number, y: number) => {
            return `${Math.floor(x / cellSize)},${Math.floor(y / cellSize)}`;
        };

        const init = () => {
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
            // Create a uniform field extending slightly beyond the edges
            const cols = Math.ceil(width / config.spacing) + 2;
            const rows = Math.ceil(height / config.spacing) + 2;
            const offsetX = (width - cols * config.spacing) / 2;
            const offsetY = (height - rows * config.spacing) / 2;

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const bx = offsetX + i * config.spacing;
                    const by = offsetY + j * config.spacing;
                    particles.push({
                        x: bx,
                        y: by,
                        vx: 0,
                        vy: 0,
                        baseX: bx,
                        baseY: by,
                        radius: Math.random() * 1.2 + 0.8,
                    });
                }
            }
        };

        const animate = () => {
            if (config.reducedMotion) return;
            
            ctx.clearRect(0, 0, width, height);
            const t = performance.now() * 0.0005;

            // 1. Build spatial grid
            grid.clear();
            for (const p of particles) {
                const key = getGridKey(p.x, p.y);
                if (!grid.has(key)) grid.set(key, []);
                grid.get(key)!.push(p);
            }

            // 2. Physics integration
            for (const p of particles) {
                let ax = 0;
                let ay = 0;

                // --- Noise drift ---
                const { nx, ny } = pseudoNoise(p.baseX, p.baseY, t);
                ax += nx * config.noiseStrength;
                ay += ny * config.noiseStrength;

                // --- Attraction to local field center (maintains universal density) ---
                ax += (p.baseX - p.x) * config.springForce;
                ay += (p.baseY - p.y) * config.springForce;

                // --- Neighbor Repulsion (using spatial grid) ---
                const cx = Math.floor(p.x / cellSize);
                const cy = Math.floor(p.y / cellSize);

                // Check 3x3 surrounding cells
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        const cellKey = `${cx + i},${cy + j}`;
                        const neighbors = grid.get(cellKey);
                        if (neighbors) {
                            for (const n of neighbors) {
                                if (n === p) continue;
                                const dx = p.x - n.x;
                                const dy = p.y - n.y;
                                const distSq = dx * dx + dy * dy;
                                
                                if (distSq < config.repelRadius * config.repelRadius && distSq > 0.01) {
                                    const dist = Math.sqrt(distSq);
                                    const force = (config.repelRadius - dist) / config.repelRadius;
                                    ax += (dx / dist) * force * config.repelForce;
                                    ay += (dy / dist) * force * config.repelForce;
                                }
                            }
                        }
                    }
                }

                // --- Cursor Influence ---
                if (mouse.active) {
                    const dx = p.x - mouse.x;
                    const dy = p.y - mouse.y;
                    const distSq = dx * dx + dy * dy;
                    
                    if (distSq < mouse.radius * mouse.radius) {
                        const dist = Math.sqrt(distSq);
                        // Quadratic falloff for softer interaction boundary
                        const force = Math.pow((mouse.radius - dist) / mouse.radius, 2);
                        ax += (dx / dist) * force * config.mouseForce;
                        ay += (dy / dist) * force * config.mouseForce;
                    }
                }

                // --- Integration ---
                p.vx = (p.vx + ax) * config.friction;
                p.vy = (p.vy + ay) * config.friction;
                p.x += p.vx;
                p.y += p.vy;

                // --- Render ---
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(148, 163, 184, 0.35)'; // Subtle slate color
                ctx.fill();
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e: MouseEvent) => {
            const parent = canvas.parentElement;
            if (!parent) return;
            const rect = parent.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
            mouse.active = true;
        };

        const handleMouseLeave = () => {
            mouse.active = false;
        };

        const handleResize = () => init();

        init();
        if (!config.reducedMotion) {
            animate();
        } else {
            // Static render for reduced motion
            animate();
        }

        window.addEventListener('resize', handleResize);
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
