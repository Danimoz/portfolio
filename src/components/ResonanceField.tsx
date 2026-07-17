'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

const vertexShader = `#version 300 es
in vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

const fragmentShader = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform float u_time;
uniform float u_mode;

out vec4 outColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise(p);
    p = p * 2.03 + vec2(17.2, 9.1);
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 resolution = max(u_resolution, vec2(1.0));
  vec2 uv = (2.0 * gl_FragCoord.xy - resolution.xy) / min(resolution.x, resolution.y);
  vec2 pointer = (2.0 * u_pointer - 1.0) * vec2(resolution.x / resolution.y, 1.0);
  float time = u_time * 0.16;

  vec2 drift = uv;
  drift.x += (fbm(uv * 1.25 + time * 0.22) - 0.5) * 0.22;
  drift.y += (fbm(uv * 1.75 - time * 0.18) - 0.5) * 0.16;

  float filaments = 0.0;
  float energy = 0.0;
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    float frequency = mix(4.0, 13.0, fi / 5.0);
    float phase = time * (0.32 + fi * 0.035) + fi * 1.37;
    float standing = sin(drift.x * frequency + phase) * cos(drift.y * (frequency * 0.72) - phase * 0.63);
    float contour = abs(standing - mix(-0.32, 0.42, fi / 5.0));
    float line = exp(-contour * mix(24.0, 52.0, fi / 5.0));
    filaments += line * (0.18 + fi * 0.025);
    energy += line;
  }

  float distanceToPointer = length(uv - pointer);
  float interference = sin(distanceToPointer * 18.0 - time * 2.0) * 0.5 + 0.5;
  filaments += exp(-distanceToPointer * 2.5) * interference * 0.18;

  float vignette = smoothstep(1.65, 0.12, length(uv * vec2(0.72, 0.95)));
  float grain = hash(gl_FragCoord.xy + floor(u_time * 12.0)) - 0.5;

  vec3 ink = vec3(0.018, 0.027, 0.032);
  vec3 cyan = vec3(0.19, 0.84, 0.76);
  vec3 silver = vec3(0.72, 0.88, 0.88);
  vec3 modeTint = mix(vec3(0.10, 0.42, 0.40), vec3(0.42, 0.35, 0.20), u_mode);

  vec3 color = ink;
  color += modeTint * fbm(uv * 0.72 + vec2(time * 0.08, -time * 0.04)) * 0.12;
  color += mix(cyan, silver, clamp(energy * 0.13, 0.0, 0.7)) * filaments * vignette;
  color += grain * 0.012;

  outColor = vec4(color, clamp(0.72 + filaments * 0.22, 0.0, 0.96));
}
`

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type)
  if (!shader) return null

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }

  return shader
}

export default function ResonanceField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pathname = usePathname()
  const mode = pathname.startsWith('/music-catalog') ? 1 : 0

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const reducedData = window.matchMedia('(prefers-reduced-data: reduce)')
    const navigatorWithHints = navigator as Navigator & {
      connection?: { saveData?: boolean }
      deviceMemory?: number
    }
    const constrainedDevice =
      reducedData.matches ||
      navigatorWithHints.connection?.saveData === true ||
      (navigatorWithHints.deviceMemory !== undefined && navigatorWithHints.deviceMemory <= 4) ||
      navigator.hardwareConcurrency <= 4

    if (constrainedDevice) {
      canvas.dataset.rendering = 'fallback'
      return
    }

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
    })

    if (!gl) {
      canvas.dataset.rendering = 'fallback'
      return
    }

    const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexShader)
    const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShader)
    const program = gl.createProgram()

    if (!vertex || !fragment || !program) {
      canvas.dataset.rendering = 'fallback'
      return
    }

    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      canvas.dataset.rendering = 'fallback'
      gl.deleteProgram(program)
      return
    }

    const vertices = new Float32Array([-1, -1, 3, -1, -1, 3])
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    const position = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

    const resolution = gl.getUniformLocation(program, 'u_resolution')
    const pointer = gl.getUniformLocation(program, 'u_pointer')
    const time = gl.getUniformLocation(program, 'u_time')
    const routeMode = gl.getUniformLocation(program, 'u_mode')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const pointerPosition = { x: 0.72, y: 0.45 }
    let animationFrame = 0
    let startedAt = performance.now()
    let visible = !document.hidden

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const width = Math.max(1, Math.floor(canvas.clientWidth * dpr))
      const height = Math.max(1, Math.floor(canvas.clientHeight * dpr))

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        gl.viewport(0, 0, width, height)
      }
    }

    const render = (now: number) => {
      resize()
      gl.useProgram(program)
      gl.uniform2f(resolution, canvas.width, canvas.height)
      gl.uniform2f(pointer, pointerPosition.x, pointerPosition.y)
      gl.uniform1f(time, (now - startedAt) / 1000)
      gl.uniform1f(routeMode, mode)
      gl.drawArrays(gl.TRIANGLES, 0, 3)

      if (!reducedMotion.matches && visible) {
        animationFrame = requestAnimationFrame(render)
      }
    }

    const handlePointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      pointerPosition.x = event.clientX / window.innerWidth
      pointerPosition.y = 1 - event.clientY / window.innerHeight
    }

    const handleVisibility = () => {
      visible = !document.hidden
      if (visible && !reducedMotion.matches) {
        startedAt = performance.now()
        cancelAnimationFrame(animationFrame)
        animationFrame = requestAnimationFrame(render)
      } else {
        cancelAnimationFrame(animationFrame)
      }
    }

    const handleMotionPreference = () => {
      cancelAnimationFrame(animationFrame)
      render(performance.now())
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    window.addEventListener('pointermove', handlePointer, { passive: true })
    document.addEventListener('visibilitychange', handleVisibility)
    reducedMotion.addEventListener('change', handleMotionPreference)

    canvas.dataset.rendering = 'webgl'
    render(performance.now())

    return () => {
      cancelAnimationFrame(animationFrame)
      observer.disconnect()
      window.removeEventListener('pointermove', handlePointer)
      document.removeEventListener('visibilitychange', handleVisibility)
      reducedMotion.removeEventListener('change', handleMotionPreference)
      gl.deleteBuffer(buffer)
      gl.deleteShader(vertex)
      gl.deleteShader(fragment)
      gl.deleteProgram(program)
    }
  }, [mode])

  return (
    <div className="resonance-field" aria-hidden="true">
      <canvas ref={canvasRef} />
      <div className="resonance-field__fallback" />
    </div>
  )
}
