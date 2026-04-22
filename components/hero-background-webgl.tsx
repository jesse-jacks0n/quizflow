'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useTheme } from 'next-themes';

// WebGL shader sources
const VS_SOURCE = `
    attribute vec2 a_position;
    
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec2 u_mouse;
    uniform float u_dpr;

    varying float v_opacity;

    // Helper for 2D Simplex Noise approximation
    vec2 hash(vec2 p) {
        p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
        return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
    }

    float noise(vec2 p) {
        const float K1 = 0.366025404;
        const float K2 = 0.211324865;

        vec2 i = floor(p + (p.x + p.y) * K1);
        vec2 a = p - i + (i.x + i.y) * K2;
        float m = step(a.y, a.x); 
        vec2 o = vec2(m, 1.0 - m);
        vec2 b = a - o + K2;
        vec2 c = a - 1.0 + 2.0 * K2;

        vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
        vec3 n = h * h * h * h * vec3(dot(a, hash(i + 0.0)), dot(b, hash(i + o)), dot(c, hash(i + 1.0)));
        return dot(n, vec3(70.0));
    }

    void main() {
        // Account for screen aspect ratio so field flows evenly
        float aspect = u_resolution.x / u_resolution.y;
        vec2 pos = a_position;
        vec2 aspectPos = vec2(pos.x * aspect, pos.y);
        
        // Fluid flow field / neural drift
        vec2 flow = vec2(
            noise(aspectPos * 1.5 + u_time * 0.15),
            noise(aspectPos * 1.5 - u_time * 0.12 + 10.0)
        ) * 0.12;

        // Micro-membrane swirling
        flow.x += sin(pos.y * 3.0 + u_time * 0.4) * 0.03;
        flow.y += cos(pos.x * 3.0 + u_time * 0.3) * 0.03;

        // Mouse interaction (repulsion/flow disruption)
        vec2 mouseAspectPos = vec2(u_mouse.x * aspect, u_mouse.y);
        float dist = distance(aspectPos + flow, mouseAspectPos);
        float mouseRadius = 0.4; // Localized cursor falloff
        float influence = smoothstep(mouseRadius, 0.0, dist);
        
        // Push particles smoothly outward from the cursor
        vec2 dir = normalize(aspectPos + flow - mouseAspectPos + 0.0001);
        vec2 mouseDisplacement = dir * influence * 0.08;

        vec2 finalPos = pos + flow + mouseDisplacement;

        // Organic breath scale
        finalPos *= 1.0 + sin(u_time * 0.2) * 0.01;

        gl_Position = vec4(finalPos, 0.0, 1.0);
        
        // Dynamic opacity: Fade particles naturally near edges
        v_opacity = 1.0 - smoothstep(0.8, 1.2, length(finalPos));
        
        // Dynamic point size scaling with high-DPI awareness
        float baseSize = mix(1.4, 3.2, (noise(aspectPos * 4.0 + u_time) + 1.0) * 0.5);
        gl_PointSize = baseSize * u_dpr * (1.0 + influence * 0.5);
    }
`;

const FS_SOURCE = `
    precision mediump float;
    varying float v_opacity;
    uniform float u_isDark;

    void main() {
        // Construct circular dots inside the gl_PointCoord square
        vec2 cxy = 2.0 * gl_PointCoord - 1.0;
        float r = dot(cxy, cxy);
        if (r > 1.0) discard;
        
        // Soft gaussian edge fade for the continuous field "membrane" look
        float alpha = (1.0 - r) * 0.35 * v_opacity;
        
        // Adapt particle color for light vs dark mode
        vec3 lightColor = vec3(0.58, 0.64, 0.72); // slate-400
        vec3 darkColor  = vec3(0.42, 0.48, 0.58);  // slate-500 (lighter dots on dark bg)
        vec3 color = mix(lightColor, darkColor, u_isDark);
        
        // Pre-multiplied alpha for proper blending
        gl_FragColor = vec4(color * alpha, alpha);
    }
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

export function HeroBackgroundWebGL() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const glRef = useRef<{
        gl: WebGLRenderingContext;
        program: WebGLProgram;
        vs: WebGLShader;
        fs: WebGLShader;
        buffer: WebGLBuffer;
        particleCount: number;
        timeLoc: WebGLUniformLocation | null;
        resLoc: WebGLUniformLocation | null;
        mouseLoc: WebGLUniformLocation | null;
        dprLoc: WebGLUniformLocation | null;
        isDarkLoc: WebGLUniformLocation | null;
        positionLocation: number;
    } | null>(null);
    const animFrameRef = useRef<number>(0);
    const isVisibleRef = useRef(true);
    const contextLostRef = useRef(false);
    const startTimeRef = useRef(performance.now());
    const mouseRef = useRef({ target: { x: -2, y: -2 }, current: { x: -2, y: -2 } });
    const sizeRef = useRef({ width: 0, height: 0, dpr: 1 });

    const { resolvedTheme } = useTheme();

    // Reduce particle count on mobile for performance
    const getGridSize = useCallback(() => {
        if (typeof window === 'undefined') return 60;
        const isMobile = window.innerWidth < 768;
        return isMobile ? 45 : 70;
    }, []);

    const initGL = useCallback((canvas: HTMLCanvasElement): boolean => {
        const gl = canvas.getContext('webgl', {
            alpha: true,
            premultipliedAlpha: true,
            powerPreference: 'low-power',       // Prefer battery-saving GPU
            failIfMajorPerformanceCaveat: false, // Don't fail on slow devices
        });
        if (!gl) {
            console.warn('WebGL not supported');
            return false;
        }

        const vs = createShader(gl, gl.VERTEX_SHADER, VS_SOURCE);
        const fs = createShader(gl, gl.FRAGMENT_SHADER, FS_SOURCE);
        const program = gl.createProgram();
        if (!program || !vs || !fs) return false;

        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(program));
            return false;
        }

        // Generate particle grid
        const gridSize = getGridSize();
        const particles: number[] = [];
        for (let x = 0; x <= gridSize; x++) {
            for (let y = 0; y <= gridSize; y++) {
                const px = (x / gridSize) * 2.4 - 1.2;
                const py = (y / gridSize) * 2.4 - 1.2;
                particles.push(px, py);
            }
        }

        const buffer = gl.createBuffer();
        if (!buffer) return false;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(particles), gl.STATIC_DRAW);

        const positionLocation = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        glRef.current = {
            gl,
            program,
            vs,
            fs,
            buffer,
            particleCount: particles.length / 2,
            timeLoc: gl.getUniformLocation(program, 'u_time'),
            resLoc: gl.getUniformLocation(program, 'u_resolution'),
            mouseLoc: gl.getUniformLocation(program, 'u_mouse'),
            dprLoc: gl.getUniformLocation(program, 'u_dpr'),
            isDarkLoc: gl.getUniformLocation(program, 'u_isDark'),
            positionLocation,
        };

        contextLostRef.current = false;
        return true;
    }, [getGridSize]);

    const handleResize = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const parent = canvas.parentElement;
        if (!parent) return;
        const width = parent.clientWidth;
        const height = parent.clientHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap DPR at 2 for performance

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        
        sizeRef.current = { width, height, dpr };
        
        if (glRef.current) {
            glRef.current.gl.viewport(0, 0, canvas.width, canvas.height);
        }
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Accessibility fallback check
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

        // Initialize WebGL
        if (!initGL(canvas)) return;

        handleResize();
        window.addEventListener('resize', handleResize);

        // ── Context loss/restore handlers ─────────────────────
        const handleContextLost = (e: Event) => {
            e.preventDefault(); // Allow restore
            contextLostRef.current = true;
            cancelAnimationFrame(animFrameRef.current);
        };

        const handleContextRestored = () => {
            // Re-initialize everything from scratch
            if (canvas && initGL(canvas)) {
                handleResize();
                contextLostRef.current = false;
                startTimeRef.current = performance.now();
                if (!prefersReducedMotion.matches) {
                    render();
                }
            }
        };

        canvas.addEventListener('webglcontextlost', handleContextLost);
        canvas.addEventListener('webglcontextrestored', handleContextRestored);

        // ── Visibility observer: pause when offscreen ─────────
        const observer = new IntersectionObserver(
            ([entry]) => {
                const wasVisible = isVisibleRef.current;
                isVisibleRef.current = entry.isIntersecting;
                
                // Resume animation when coming back into view
                if (!wasVisible && entry.isIntersecting && !contextLostRef.current && !prefersReducedMotion.matches) {
                    cancelAnimationFrame(animFrameRef.current);
                    render();
                }
            },
            { threshold: 0.05 } // Trigger when at least 5% visible
        );
        observer.observe(canvas);

        // ── Mouse tracking ────────────────────────────────────
        const handleMouseMove = (e: MouseEvent) => {
            const parent = canvas.parentElement;
            if (!parent) return;
            const rect = parent.getBoundingClientRect();
            const sx = e.clientX - rect.left;
            const sy = e.clientY - rect.top;
            const { width, height } = sizeRef.current;
            if (width === 0 || height === 0) return;
            
            mouseRef.current.target.x = (sx / width) * 2.0 - 1.0;
            mouseRef.current.target.y = -((sy / height) * 2.0 - 1.0);
        };

        const handleMouseLeave = () => {
            mouseRef.current.target.x = -2.0;
            mouseRef.current.target.y = -2.0;
        };

        const parent = canvas.parentElement;
        if (parent) {
            parent.addEventListener('mousemove', handleMouseMove);
            parent.addEventListener('mouseleave', handleMouseLeave);
        }

        // ── Render loop ───────────────────────────────────────
        const render = () => {
            if (contextLostRef.current || !glRef.current) return;
            
            // Don't render when offscreen — save GPU/battery
            if (!isVisibleRef.current) return;

            const { gl, program, particleCount, timeLoc, resLoc, mouseLoc, dprLoc, isDarkLoc } = glRef.current;
            const { width, height, dpr } = sizeRef.current;
            const mouse = mouseRef.current;

            // Smoothly ease mouse
            mouse.current.x += (mouse.target.x - mouse.current.x) * 0.1;
            mouse.current.y += (mouse.target.y - mouse.current.y) * 0.1;

            gl.clearColor(0.0, 0.0, 0.0, 0.0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.useProgram(program);
            gl.uniform1f(timeLoc, (performance.now() - startTimeRef.current) * 0.001);
            gl.uniform2f(resLoc, width, height);
            gl.uniform2f(mouseLoc, mouse.current.x, mouse.current.y);
            gl.uniform1f(dprLoc, dpr);
            // Pass current theme to shader: 1.0 = dark, 0.0 = light
            gl.uniform1f(isDarkLoc, resolvedTheme === 'dark' ? 1.0 : 0.0);

            gl.drawArrays(gl.POINTS, 0, particleCount);

            animFrameRef.current = requestAnimationFrame(render);
        };

        // Start rendering or draw static frame
        if (prefersReducedMotion.matches) {
            requestAnimationFrame(() => {
                if (!glRef.current || contextLostRef.current) return;
                const { gl, program, particleCount, timeLoc, resLoc, mouseLoc, dprLoc, isDarkLoc } = glRef.current;
                const { width, height, dpr } = sizeRef.current;
                gl.clearColor(0.0, 0.0, 0.0, 0.0);
                gl.clear(gl.COLOR_BUFFER_BIT);
                gl.useProgram(program);
                gl.uniform1f(timeLoc, 10.0);
                gl.uniform2f(resLoc, width, height);
                gl.uniform2f(mouseLoc, -2.0, -2.0);
                gl.uniform1f(dprLoc, dpr);
                gl.uniform1f(isDarkLoc, resolvedTheme === 'dark' ? 1.0 : 0.0);
                gl.drawArrays(gl.POINTS, 0, particleCount);
            });
        } else {
            render();
        }

        // ── Cleanup ───────────────────────────────────────────
        return () => {
            window.removeEventListener('resize', handleResize);
            canvas.removeEventListener('webglcontextlost', handleContextLost);
            canvas.removeEventListener('webglcontextrestored', handleContextRestored);
            observer.disconnect();
            if (parent) {
                parent.removeEventListener('mousemove', handleMouseMove);
                parent.removeEventListener('mouseleave', handleMouseLeave);
            }
            cancelAnimationFrame(animFrameRef.current);
            if (glRef.current && !contextLostRef.current) {
                const { gl, program, vs, fs, buffer } = glRef.current;
                gl.deleteProgram(program);
                gl.deleteShader(vs);
                gl.deleteShader(fs);
                gl.deleteBuffer(buffer);
            }
            glRef.current = null;
        };
    }, [initGL, handleResize, resolvedTheme]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-0 pointer-events-none"
            aria-hidden="true"
        />
    );
}