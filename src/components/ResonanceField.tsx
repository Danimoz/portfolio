'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import {
  createSonicLayer,
  SONIC_LAYER_TITLE,
  type SonicLayerController,
} from '@/lib/sonicLayer'

const vertexShader = `#version 300 es
in vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

const buildFragmentShader = (tier: 'medium' | 'high') => `#version 300 es
precision highp float;

#define FBM_OCTAVES ${tier === 'high' ? 4 : 3}
#define FILAMENT_STEPS ${tier === 'high' ? 6 : 4}

uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform float u_time;
uniform float u_mode;
uniform float u_scroll;
uniform float u_section;
uniform vec3 u_audio;

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
  for (int i = 0; i < FBM_OCTAVES; i++) {
    value += amplitude * noise(p);
    p = p * 2.03 + vec2(17.2, 9.1);
    amplitude *= 0.5;
  }
  return value;
}

mat2 rotate2d(float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat2(c, -s, s, c);
}

void main() {
  vec2 resolution = max(u_resolution, vec2(1.0));
  vec2 uv = (2.0 * gl_FragCoord.xy - resolution.xy) / min(resolution.x, resolution.y);
  vec2 pointer = (2.0 * u_pointer - 1.0) * vec2(resolution.x / resolution.y, 1.0);
  float audioEnergy = dot(u_audio, vec3(0.48, 0.34, 0.18));
  float time = u_time * (0.14 + u_audio.y * 0.08);
  float scrollAngle = (u_scroll - 0.5) * 0.24 + (u_section - 0.5) * 0.08;

  vec2 drift = rotate2d(scrollAngle) * uv;
  drift *= 1.0 + u_scroll * 0.13 + u_audio.x * 0.055;
  drift.x += (fbm(uv * 1.25 + time * 0.22 + u_scroll * 0.8) - 0.5) * (0.22 + u_audio.y * 0.07);
  drift.y += (fbm(uv * 1.75 - time * 0.18 - u_section * 0.6) - 0.5) * 0.16;

  float filaments = 0.0;
  float energy = 0.0;
  float span = float(FILAMENT_STEPS - 1);
  for (int i = 0; i < FILAMENT_STEPS; i++) {
    float fi = float(i);
    float frequency = mix(4.0, 13.0, fi / span) * mix(0.92, 1.12, u_scroll);
    float phase = time * (0.32 + fi * 0.035) + fi * 1.37 + u_scroll * (1.1 + fi * 0.22) + u_section * 1.8;
    float standing = sin(drift.x * frequency + phase) * cos(drift.y * (frequency * 0.72) - phase * 0.63);
    float threshold = mix(-0.32, 0.42, fi / span) + sin(u_scroll * 6.283 + fi) * 0.045;
    float contour = abs(standing - threshold);
    float line = exp(-contour * mix(24.0, 52.0, fi / span));
    filaments += line * (0.18 + fi * 0.025) * (1.0 + audioEnergy * 0.7);
    energy += line;
  }

  float distanceToPointer = length(uv - pointer);
  float interference = sin(distanceToPointer * (18.0 + u_audio.z * 7.0) - time * 2.0) * 0.5 + 0.5;
  filaments += exp(-distanceToPointer * 2.5) * interference * (0.18 + u_audio.x * 0.16);

  float scrollWave = sin((drift.y + u_scroll * 1.4) * 7.0 - time * 0.7) * 0.5 + 0.5;
  filaments += pow(scrollWave, 12.0) * (0.035 + u_section * 0.045);

  float vignette = smoothstep(1.65, 0.12, length(uv * vec2(0.72, 0.95)));
  float grain = hash(gl_FragCoord.xy + floor(u_time * 12.0)) - 0.5;

  vec3 ink = vec3(0.018, 0.027, 0.032);
  vec3 cyan = vec3(0.19, 0.84, 0.76);
  vec3 silver = vec3(0.72, 0.88, 0.88);
  vec3 music = vec3(0.46, 0.36, 0.16);
  vec3 software = vec3(0.10, 0.42, 0.40);
  vec3 modeTint = mix(software, music, u_mode);
  modeTint = mix(modeTint, mix(cyan, silver, u_mode), u_section * 0.16);
  vec3 audioTint = mix(cyan, vec3(0.82, 0.34, 0.16), clamp(u_audio.y * 0.9 + u_audio.z * 1.4, 0.0, 1.0));

  vec3 color = ink;
  color += modeTint * fbm(uv * 0.72 + vec2(time * 0.08, -time * 0.04) + u_scroll * 0.3) * (0.12 + audioEnergy * 0.08);
  color += mix(cyan, silver, clamp(energy * 0.13 + u_audio.z * 0.18, 0.0, 0.7)) * filaments * vignette;
  color += audioTint * audioEnergy * (0.42 - u_section * 0.16) * vignette;
  color += grain * 0.012;

  outColor = vec4(color, clamp(0.72 + filaments * 0.22 + audioEnergy * 0.04, 0.0, 0.96));
}
`

type SonicState = 'off' | 'starting' | 'on' | 'error'

function compileShader(gl: WebGL2RenderingContext, type: number, source: string) {
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

function averageBand(data: Uint8Array, start: number, end: number) {
  let total = 0
  const safeEnd = Math.min(end, data.length)
  for (let index = start; index < safeEnd; index += 1) total += data[index]
  return safeEnd > start ? total / (safeEnd - start) / 255 : 0
}

function readAudioBands(controller: SonicLayerController | null): [number, number, number] {
  if (!controller) return [0, 0, 0]
  controller.analyser.getByteFrequencyData(controller.frequencyData)
  return [
    Math.min(1, averageBand(controller.frequencyData, 1, 7) * 2.4),
    Math.min(1, averageBand(controller.frequencyData, 7, 28) * 3.2),
    Math.min(1, averageBand(controller.frequencyData, 28, 86) * 4.2),
  ]
}

function detectConstrainedDevice() {
  const navigatorWithHints = navigator as Navigator & {
    connection?: { saveData?: boolean }
    deviceMemory?: number
  }

  return (
    window.matchMedia('(prefers-reduced-data: reduce)').matches ||
    navigatorWithHints.connection?.saveData === true ||
    (navigatorWithHints.deviceMemory !== undefined && navigatorWithHints.deviceMemory <= 4) ||
    navigator.hardwareConcurrency <= 4
  )
}

type QualityTier = 'fallback' | 'medium' | 'high'

function detectQualityTier(): QualityTier {
  if (detectConstrainedDevice()) return 'fallback'
  // Capable but modest devices (<= 8 logical cores) run a lighter shader;
  // high-core desktops get the full-quality field.
  return (navigator.hardwareConcurrency || 8) <= 8 ? 'medium' : 'high'
}

function subscribeConstrained(onChange: () => void) {
  const media = window.matchMedia('(prefers-reduced-data: reduce)')
  const connection = (navigator as Navigator & { connection?: EventTarget }).connection
  media.addEventListener('change', onChange)
  connection?.addEventListener?.('change', onChange)
  return () => {
    media.removeEventListener('change', onChange)
    connection?.removeEventListener?.('change', onChange)
  }
}

export default function ResonanceField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioController = useRef<SonicLayerController | null>(null)
  const audioGeneration = useRef(0)
  const isMounted = useRef(false)
  const sectionTarget = useRef(0)
  const renderStaticFrame = useRef<(() => void) | null>(null)
  const pathname = usePathname()
  const mode = pathname.startsWith('/music-catalog') ? 1 : 0
  const modeTarget = useRef(mode)
  const [sonicState, setSonicState] = useState<SonicState>('off')
  const [contextEpoch, setContextEpoch] = useState(0)
  const isConstrained = useSyncExternalStore(
    subscribeConstrained,
    () => detectConstrainedDevice(),
    () => false,
  )

  useEffect(() => {
    modeTarget.current = mode
    renderStaticFrame.current?.()
  }, [mode])

  useEffect(() => {
    sectionTarget.current = 0
    const main = document.querySelector('main')
    let observer: IntersectionObserver | null = null

    const build = () => {
      observer?.disconnect()
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>('main > section, main > article, main > header'),
      )
      if (sections.length === 0) return
      const sectionRatios = new Map<Element, number>()
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => sectionRatios.set(entry.target, entry.intersectionRatio))
        let activeIndex = 0
        let activeRatio = -1
        sections.forEach((candidate, index) => {
          const ratio = sectionRatios.get(candidate) ?? 0
          if (ratio > activeRatio) {
            activeRatio = ratio
            activeIndex = index
          }
        })
        sectionTarget.current = sections.length > 1 ? activeIndex / (sections.length - 1) : 0
      }, { threshold: [0, 0.2, 0.45, 0.7, 1] })
      sections.forEach((candidate) => observer!.observe(candidate))
    }

    build()
    const mutation = main ? new MutationObserver(() => build()) : null
    mutation?.observe(main as Node, { childList: true })

    return () => {
      observer?.disconnect()
      mutation?.disconnect()
    }
  }, [pathname])

  useEffect(() => {
    isMounted.current = true
    const handleAudioVisibility = () => {
      const controller = audioController.current
      if (!controller) return
      void (document.hidden ? controller.suspend() : controller.resume())
    }
    document.addEventListener('visibilitychange', handleAudioVisibility)

    return () => {
      isMounted.current = false
      audioGeneration.current += 1
      document.removeEventListener('visibilitychange', handleAudioVisibility)
      const controller = audioController.current
      audioController.current = null
      if (controller) void controller.stop()
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const tier = detectQualityTier()
    if (tier === 'fallback') {
      canvas.dataset.rendering = 'fallback'
      return
    }

    const dprCap = tier === 'high' ? 1.5 : 1.25

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
    const fragment = compileShader(gl, gl.FRAGMENT_SHADER, buildFragmentShader(tier))
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
    const scroll = gl.getUniformLocation(program, 'u_scroll')
    const section = gl.getUniformLocation(program, 'u_section')
    const audio = gl.getUniformLocation(program, 'u_audio')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const pointerPosition = { x: 0.72, y: 0.45 }
    const audioValues = [0, 0, 0]
    let scrollTarget = 0
    let scrollCurrent = 0
    let sectionCurrent = 0
    let modeCurrent = modeTarget.current
    let animationFrame = 0
    let startedAt = performance.now()
    let visible = !document.hidden

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap)
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

      if (!reducedMotion.matches) {
        scrollCurrent += (scrollTarget - scrollCurrent) * 0.075
        sectionCurrent += (sectionTarget.current - sectionCurrent) * 0.055
        modeCurrent += (modeTarget.current - modeCurrent) * 0.045
        const nextAudio = readAudioBands(audioController.current)
        audioValues[0] += (nextAudio[0] - audioValues[0]) * 0.11
        audioValues[1] += (nextAudio[1] - audioValues[1]) * 0.09
        audioValues[2] += (nextAudio[2] - audioValues[2]) * 0.075
      } else {
        scrollCurrent = 0
        sectionCurrent = 0
        modeCurrent = modeTarget.current
        audioValues.fill(0)
      }

      gl.useProgram(program)
      gl.uniform2f(resolution, canvas.width, canvas.height)
      gl.uniform2f(pointer, pointerPosition.x, pointerPosition.y)
      gl.uniform1f(time, (now - startedAt) / 1000)
      gl.uniform1f(routeMode, modeCurrent)
      gl.uniform1f(scroll, scrollCurrent)
      gl.uniform1f(section, sectionCurrent)
      gl.uniform3f(audio, audioValues[0], audioValues[1], audioValues[2])
      gl.drawArrays(gl.TRIANGLES, 0, 3)

      if (!reducedMotion.matches && visible) animationFrame = requestAnimationFrame(render)
    }

    const updateScrollProgress = () => {
      if (reducedMotion.matches) return
      const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      scrollTarget = Math.min(1, Math.max(0, window.scrollY / scrollable))
    }

    const handlePointer = (event: PointerEvent) => {
      if (reducedMotion.matches) return
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
      if (reducedMotion.matches) {
        render(performance.now())
      } else if (visible) {
        updateScrollProgress()
        startedAt = performance.now()
        animationFrame = requestAnimationFrame(render)
      }
    }

    const handleContextLost = (event: Event) => {
      event.preventDefault()
      cancelAnimationFrame(animationFrame)
      canvas.dataset.rendering = 'fallback'
    }

    const handleContextRestored = () => {
      setContextEpoch((epoch) => epoch + 1)
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    canvas.addEventListener('webglcontextlost', handleContextLost)
    canvas.addEventListener('webglcontextrestored', handleContextRestored)
    window.addEventListener('scroll', updateScrollProgress, { passive: true })
    window.addEventListener('pointermove', handlePointer, { passive: true })
    window.addEventListener('pointerdown', handlePointer, { passive: true })
    document.addEventListener('visibilitychange', handleVisibility)
    reducedMotion.addEventListener('change', handleMotionPreference)

    canvas.dataset.rendering = 'webgl'
    canvas.dataset.quality = tier
    updateScrollProgress()
    const renderStatic = () => {
      if (reducedMotion.matches) render(performance.now())
    }
    renderStaticFrame.current = renderStatic
    render(performance.now())

    return () => {
      cancelAnimationFrame(animationFrame)
      observer.disconnect()
      if (renderStaticFrame.current === renderStatic) renderStaticFrame.current = null
      canvas.removeEventListener('webglcontextlost', handleContextLost)
      canvas.removeEventListener('webglcontextrestored', handleContextRestored)
      window.removeEventListener('scroll', updateScrollProgress)
      window.removeEventListener('pointermove', handlePointer)
      window.removeEventListener('pointerdown', handlePointer)
      document.removeEventListener('visibilitychange', handleVisibility)
      reducedMotion.removeEventListener('change', handleMotionPreference)
      gl.deleteBuffer(buffer)
      gl.deleteShader(vertex)
      gl.deleteShader(fragment)
      gl.deleteProgram(program)
    }
  }, [contextEpoch])

  async function toggleSonicLayer() {
    if (sonicState === 'starting') return

    if (audioController.current) {
      audioGeneration.current += 1
      const controller = audioController.current
      audioController.current = null
      setSonicState('off')
      await controller.stop()
      return
    }

    setSonicState('starting')
    const generation = audioGeneration.current + 1
    audioGeneration.current = generation
    let controller: SonicLayerController | null = null
    try {
      controller = await createSonicLayer()
      if (!isMounted.current || generation !== audioGeneration.current) {
        await controller.stop()
        return
      }
      audioController.current = controller
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const shouldSuspend = document.hidden
        await (shouldSuspend ? controller.suspend() : controller.resume())
        if (!isMounted.current || generation !== audioGeneration.current) {
          if (audioController.current === controller) audioController.current = null
          await controller.stop()
          return
        }
        if (document.hidden === shouldSuspend) break
      }
      setSonicState('on')
    } catch {
      if (controller) {
        if (audioController.current === controller) audioController.current = null
        try {
          await controller.stop()
        } catch {
          // The graph is already unusable; preserve the UI's unavailable state.
        }
      }
      if (isMounted.current && generation === audioGeneration.current) {
        setSonicState('error')
      }
    }
  }

  const isOn = sonicState === 'on'
  const status = sonicState === 'starting' ? 'Starting' : sonicState === 'error' ? 'Unavailable' : isOn ? 'On' : 'Off'
  const announcement = sonicState === 'error'
    ? 'The Sonic Layer is unavailable in this browser.'
    : isOn
      ? `Sonic Layer on. Playing ${SONIC_LAYER_TITLE}.`
      : 'Sonic Layer off.'

  return (
    <>
      <div className="resonance-field" aria-hidden="true">
        <canvas ref={canvasRef} />
        <div className="resonance-field__fallback" />
      </div>
      {!isConstrained && (
        <div className="sonic-layer">
          <button
            type="button"
            className="sonic-layer__control"
            aria-label={`${isOn ? 'Turn off' : 'Turn on'} the Sonic Layer: ${SONIC_LAYER_TITLE}`}
            title={`${SONIC_LAYER_TITLE} — ${isOn ? 'turn off' : 'turn on'} Sonic Layer`}
            aria-pressed={isOn}
            disabled={sonicState === 'starting'}
            onClick={() => void toggleSonicLayer()}
          >
            <span className="sonic-layer__signal" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span>Sonic Layer</span>
            <span className="sonic-layer__state">{status}</span>
          </button>
          <span className="sonic-layer__announcement" role="status" aria-live="polite">
            {announcement}
          </span>
        </div>
      )}
    </>
  )
}
