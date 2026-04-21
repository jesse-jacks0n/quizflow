'use client';

import { useEffect, useRef } from 'react';

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

    void main() {
        // Construct circular dots inside the gl_PointCoord square
        vec2 cxy = 2.0 * gl_PointCoord - 1.0;
        float r = dot(cxy, cxy);
        if (r > 1.0) discard;
        
        // Ambient slate-colored particle
        // Soft gaussian edge fade for the continuous field "membrane" look
        float alpha = (1.0 - r) * 0.35 * v_opacity;
        vec3 color = vec3(0.58, 0.64, 0.72); // slate-400
        
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

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Request WebGL with alpha blending support
        const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true });
        if (!gl) {
            console.warn('WebGL not supported');
            return;
        }

        // Accessibility fallback check
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

        // 1. Compile Shaders & Link Program
        let vs: WebGLShader | null = null;
        let fs: WebGLShader | null = null;
        let program: WebGLProgram | null = null;
        let positionBuffer: WebGLBuffer | null = null;

        vs = createShader(gl, gl.VERTEX_SHADER, VS_SOURCE);
        fs = createShader(gl, gl.FRAGMENT_SHADER, FS_SOURCE);
        program = gl.createProgram();
        if (!program || !vs || !fs) return;

        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(program));
            return;
        }

        // 2. Initialize grid geometry (static buffer)
        // This generates a massive mesh of vertices from -1 to 1 in NDC
        // We push them ONCE to the GPU buffer.
        const particles = [];
        const gridSize = 80; // Total 80x80 = 6400 particles. Rendering takes 0 overhead.
        
        for (let x = 0; x <= gridSize; x++) {
            for (let y = 0; y <= gridSize; y++) {
                // Map from 0-size to -1.2 to +1.2 (bleeding past edges subtly)
                const px = (x / gridSize) * 2.4 - 1.2;
                const py = (y / gridSize) * 2.4 - 1.2;
                particles.push(px, py);
            }
        }

        positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(particles), gl.STATIC_DRAW);

        // 3. Set up attributes & uniforms
        const positionLocation = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        const timeLoc = gl.getUniformLocation(program, 'u_time');
        const resLoc = gl.getUniformLocation(program, 'u_resolution');
        const mouseLoc = gl.getUniformLocation(program, 'u_mouse');
        const dprLoc = gl.getUniformLocation(program, 'u_dpr');

        // State trackers
        let animationFrameId: number;
        let width = 0;
        let height = 0;
        let dpr = 1;
        const targetMouse = { x: -2.0, y: -2.0 };
        const currentMouse = { x: -2.0, y: -2.0 };

        // 4. Resize & Layout Logic
        const handleResize = () => {
            const parent = canvas.parentElement;
            if (!parent) return;
            width = parent.clientWidth;
            height = parent.clientHeight;
            dpr = window.devicePixelRatio || 1;

            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            gl.viewport(0, 0, canvas.width, canvas.height);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        // 5. Mouse tracking
        // Map DOM coordinates to NDC (-1 to +1) where Y builds up from bottom
        const handleMouseMove = (e: MouseEvent) => {
            const parent = canvas.parentElement;
            if (!parent) return;
            const rect = parent.getBoundingClientRect();
            const sx = e.clientX - rect.left;
            const sy = e.clientY - rect.top;
            
            targetMouse.x = (sx / width) * 2.0 - 1.0;
            targetMouse.y = -((sy / height) * 2.0 - 1.0);
        };

        const handleMouseLeave = () => {
            targetMouse.x = -2.0;
            targetMouse.y = -2.0;
        };

        const parent = canvas.parentElement;
        if (parent) {
            parent.addEventListener('mousemove', handleMouseMove);
            parent.addEventListener('mouseleave', handleMouseLeave);
        }

        // 6. Native GL setup
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); // Premultiplied alpha blending

        // 7. Render Loop
        const startTime = performance.now();

        const render = () => {
            if (!prefersReducedMotion.matches) {
                // Smoothly ease current mouse towards target mouse for fluid trailing interaction
                currentMouse.x += (targetMouse.x - currentMouse.x) * 0.1;
                currentMouse.y += (targetMouse.y - currentMouse.y) * 0.1;
            }

            gl.clearColor(0.0, 0.0, 0.0, 0.0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.useProgram(program);
            
            // Push uniforms each frame
            gl.uniform1f(timeLoc, (performance.now() - startTime) * 0.001);
            gl.uniform2f(resLoc, width, height);
            gl.uniform2f(mouseLoc, currentMouse.x, currentMouse.y);
            gl.uniform1f(dprLoc, dpr);

            // Draw field 
            gl.drawArrays(gl.POINTS, 0, particles.length / 2);

            animationFrameId = requestAnimationFrame(render);
        };

        // Pause animation completely on reduced motion (draw one static frame)
        if (prefersReducedMotion.matches) {
            // Draw a single snapshot
            requestAnimationFrame(() => {
                gl.useProgram(program);
                gl.uniform1f(timeLoc, 10.0); // Arbitrary static time
                gl.uniform2f(resLoc, width, height);
                gl.uniform2f(mouseLoc, -2.0, -2.0);
                gl.uniform1f(dprLoc, dpr);
                gl.drawArrays(gl.POINTS, 0, particles.length / 2);
            });
        } else {
            render();
        }

        // 8. Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            if (parent) {
                parent.removeEventListener('mousemove', handleMouseMove);
                parent.removeEventListener('mouseleave', handleMouseLeave);
            }
            cancelAnimationFrame(animationFrameId);
            gl.deleteProgram(program);
            gl.deleteShader(vs);
            gl.deleteShader(fs);
            gl.deleteBuffer(positionBuffer);
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