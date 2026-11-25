"use client";

import { useEffect, useRef } from "react";

export default function CausticBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl", { alpha: false, antialias: false });
    if (!canvas || !gl) return;
    const vertex = gl.createShader(gl.VERTEX_SHADER);
    const fragment = gl.createShader(gl.FRAGMENT_SHADER);
    if (!vertex || !fragment) return;
    gl.shaderSource(vertex, "attribute vec2 p; void main(){gl_Position=vec4(p,0.,1.);}");
    gl.shaderSource(fragment, `precision mediump float;
      uniform vec2 resolution;
      uniform float time;
      vec2 hash(vec2 p) { return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453); }
      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.y * 3.0;
        vec2 warped = uv;
        warped += 0.22 * vec2(
          sin(uv.y * 2.4 + time * 0.32) + sin(uv.x * 1.7 - uv.y * 1.4 - time * 0.21),
          sin(uv.x * 2.2 - time * 0.27) + sin(uv.y * 1.6 + uv.x * 1.3 + time * 0.24)
        );
        warped += 0.09 * vec2(
          sin(uv.y * 5.1 - uv.x * 2.0 + time * 0.43),
          sin(uv.x * 4.7 + uv.y * 2.2 - time * 0.37)
        );
        uv = warped;
        vec2 cell = floor(uv), f = fract(uv);
        float first = 8.0, second = 8.0;
        for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
          vec2 offset = vec2(float(x), float(y));
          vec2 h = hash(cell + offset);
          vec2 point = 0.5 + 0.4 * sin(time * 0.28 + 6.28318 * h);
          float d = length(offset + point - f);
          if (d < first) { second = first; first = d; } else if (d < second) { second = d; }
        }
        float edge = second - first;
        float light = pow(1.0 - smoothstep(0.0, 0.18, edge), 2.0);
        float fine = pow(1.0 - smoothstep(0.0, 0.045, edge), 2.0);
        float intensity = 0.6 + 0.4 * sin(uv.x * 1.8 + sin(uv.y * 1.5 + time * 0.3) + time * 0.25);
        gl_FragColor = vec4(vec3(0.055, 0.052, 0.048) + (light * intensity + fine * 0.45) * vec3(0.105, 0.095, 0.085), 1.0);
      }`);
    gl.compileShader(vertex);
    gl.compileShader(fragment);
    const program = gl.createProgram();
    if (!program || !gl.getShaderParameter(vertex, gl.COMPILE_STATUS) || !gl.getShaderParameter(fragment, gl.COMPILE_STATUS)) return;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const resolution = gl.getUniformLocation(program, "resolution");
    const time = gl.getUniformLocation(program, "time");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const dialog = canvas.closest("dialog");
    let frame = 0;
    const draw = (now: number) => {
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * 0.6));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * 0.6));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resolution, canvas.width, canvas.height);
      gl.uniform1f(time, motion.matches ? 0 : now / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!motion.matches && dialog?.open) frame = requestAnimationFrame(draw);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      if (dialog?.open) draw(performance.now());
    };
    const observer = new MutationObserver(sync);
    if (dialog) observer.observe(dialog, { attributes: true, attributeFilter: ["open"] });
    motion.addEventListener("change", sync);
    window.addEventListener("resize", sync);
    sync();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      motion.removeEventListener("change", sync);
      window.removeEventListener("resize", sync);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full bg-brand-ink" />;
}
