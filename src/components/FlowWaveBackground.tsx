'use client'

import { useEffect, useMemo, useRef } from 'react'
import { whenIntroGone } from '../hooks/useIntroGate'
import type { CmsHomepageBackground } from '../cms/types'

// Port of _test-flow-wave-theone-light.html ("Ink Wave" light v2 aurora) —
// keep the shader/animation math identical to the tested standalone file.

const CAM_START_Y = 7
const CAM_START_Z = 16
const CAM_END_Y = 0.8
const CAM_END_Z = 3
const LOOK_START_Z = 2
const LOOK_END_Z = -16
const PARALLAX = 1.0
const POINTER_RADIUS = 7.0
const POINT_SIZE = 3.5
const SCALE = 0.275
const SCROLL_RISE = 0
const GEOMETRY_DENSITY = 0.8
const ATMO_SIZE = 22
const ATMO_SPEED = 0.8

const SNOISE = `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0); const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy)); vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz); vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy); vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + 1.0 * C.xxx; vec3 x2 = x0 - i2 + 2.0 * C.xxx; vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0/7.0; vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
  vec4 x_ = floor(j * ns.z); vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ *ns.x + ns.yyyy; vec4 y = y_ *ns.x + ns.yyyy; vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy); vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0; vec4 s1 = floor(b1)*2.0 + 1.0; vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy; vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy,h.x); vec3 p1 = vec3(a0.zw,h.y); vec3 p2 = vec3(a1.xy,h.z); vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0); m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}`

const WAVE_VERTEX = `
uniform float uTime; uniform float uStream; uniform float uSize; uniform float uWaveHeight; uniform float uFlow; uniform float uScale;
uniform vec3 uColLow; uniform vec3 uColHigh;
uniform vec3 uCursor; uniform float uRepelRadius; uniform float uRepelStrength; uniform float uActivity;
varying float vFade; varying vec3 vColor;
${SNOISE}
void main() {
  vec3 wp = vec3(position.x * 13.0, 0.0, position.z * 25.0);
  wp.x += position.y * 6.0;
  float zc = wp.z + uStream;
  float wn = snoise(vec3(wp.x * 0.08, zc * 0.08, uTime * 0.15 * uFlow)) * 2.0;
  wn += snoise(vec3(wp.x * 0.16, zc * 0.16, uTime * 0.3 * uFlow)) * 0.8;
  wp.y += wn * uWaveHeight;
  vec3 finalPos = wp * uScale;
  vec4 modelPosition = modelMatrix * vec4(finalPos, 1.0);
  vec3 toP = modelPosition.xyz - uCursor;
  float cd = length(toP);
  float fall = smoothstep(uRepelRadius, 0.0, cd);
  modelPosition.xyz += normalize(toP + vec3(0.0001)) * fall * uRepelStrength * uActivity;
  vec4 mvPosition = viewMatrix * modelPosition;
  float hMix = smoothstep(-1.2, 2.2, wn);
  vColor = mix(uColLow, uColHigh, clamp(hMix, 0.0, 1.0));
  vFade = 1.0 - smoothstep(6.0, 14.0, -mvPosition.z);
  vFade = 0.25 + 0.75 * vFade;
  gl_PointSize = uSize * (10.0 / -mvPosition.z);
  gl_PointSize = max(gl_PointSize, 1.5);
  gl_Position = projectionMatrix * mvPosition;
}`

const WAVE_FRAGMENT = `
uniform float uOpacity; uniform float uAppear;
varying float vFade; varying vec3 vColor;
void main() {
  vec2 xy = gl_PointCoord - 0.5;
  float ll = length(xy);
  if (ll > 0.5) discard;
  float a = smoothstep(0.5, 0.1, ll);
  gl_FragColor = vec4(vColor, vFade * a * uOpacity * uAppear);
}`

const ATMO_VERTEX = `
attribute float size; attribute float seed; uniform float uTime; uniform float uSizeScale; uniform vec2 uRes;
varying float vA;
vec3 warp(vec3 p, float t){ float c=0.9,a=1.9,b=0.02,s=0.05; p*=2.;
  p.x+=c*sin(s*t+a*p.y)+t*b; p.y+=c*cos(s*t+a*p.x); p.y+=c*sin(s*t+a*p.z)+t*b;
  p.z+=c*cos(s*t+a*p.y); p.z+=c*sin(s*t+a*p.x)+t*b; p.x+=c*cos(s*t+a*p.z);
  return cos(p+vec3(1,2,4)); }
void main(){
  vec3 v = position*4.0 + warp(position, uTime)*1.2;
  vec4 mv = modelViewMatrix * vec4(v, 1.0);
  float r = length(v); float farF = 1.0 - smoothstep(5.0, 6.5, r); float nearF = smoothstep(0.0, 0.5, -mv.z);
  vA = farF * nearF;
  gl_PointSize = size * uSizeScale * uRes.y / 900.0 / -mv.z; gl_PointSize = max(gl_PointSize, 1.0);
  gl_Position = projectionMatrix * mv;
}`

const ATMO_FRAGMENT = `
uniform vec3 uColor; uniform float uOpacity; varying float vA;
void main(){ vec2 p = gl_PointCoord - 0.5; float l = length(p); if (l > 0.5) discard;
  float tex = smoothstep(0.5, 0.0, l); gl_FragColor = vec4(uColor, tex * vA * 0.35 * uOpacity); }`

type TunableConfig = {
  colorLow: string
  colorHigh: string
  atmoColor: string
  opacity: number
  pointSize: number
  density: number
  scrollRise: number
  flow: number
  waveHeight: number
  pointerStrength: number
}

type FlowWaveVariant = 'home' | 'stories'

const STORIES_AURORA_BACKGROUND = [
  'radial-gradient(78% 58% at 10% 12%, rgba(219,39,119,0.22), transparent 68%)',
  'radial-gradient(66% 52% at 92% 24%, rgba(232,132,88,0.11), transparent 70%)',
  'radial-gradient(82% 68% at 50% 88%, rgba(74,18,46,0.32), transparent 74%)',
  'linear-gradient(165deg, #1A0714 0%, #2B0D1D 52%, #13040F 100%)',
].join(',')

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

function smoothstep01(value: number) {
  const t = clamp(value, 0, 1)
  return t * t * (3 - 2 * t)
}

function settingsForVariant(settings: CmsHomepageBackground, variant: FlowWaveVariant): CmsHomepageBackground {
  if (variant === 'home') return settings

  // Stories already renders several large client images and active glass data
  // tiles. Keep the shared network language, but spend substantially less GPU
  // and visual attention than the narrative Homepage atmosphere.
  return {
    ...settings,
    atmoCount: Math.min(settings.atmoCount, 72),
    opacity: clamp(settings.opacity * 0.92, 0.23, 0.28),
    pointSize: clamp(settings.pointSize * 0.95, 2.8, 3.4),
    density: clamp(settings.density * 0.65, 0.4, 0.56),
    flow: clamp(settings.flow * 0.75, 0.32, 0.48),
    waveHeight: clamp(settings.waveHeight * 0.8, 1.8, 2.3),
    pointerStrength: 0,
  }
}

const HOME_TONE_VALUES: Record<string, number> = {
  // Homepage follows one continuous dusk-to-night curve. These are semantic
  // stops rather than section-specific colours, so sections can be reordered
  // without reintroducing a hard rose -> ink jump.
  hero: 0.18,
  light: 0.28,
  rose: 0.43,
  mid: 0.62,
  dark: 0.78,
  night: 1,
}

/**
 * Resolve the atmosphere from actual Homepage section markers. The focus sits
 * slightly below centre so the next zone starts influencing the background
 * just before it becomes the reader's main focus.
 */
function readHomepageToneProgress() {
  const markers = Array.from(document.querySelectorAll<HTMLElement>('[data-home-tone]'))
    .map((element) => {
      const explicitProgress = Number.parseFloat(element.dataset.homeToneProgress ?? '')
      const value = Number.isFinite(explicitProgress)
        ? clamp(explicitProgress, 0, 1)
        : HOME_TONE_VALUES[element.dataset.homeTone ?? '']
      if (value === undefined) return null
      const rect = element.getBoundingClientRect()
      return {
        position: rect.top + window.scrollY + Math.min(rect.height * 0.18, window.innerHeight * 0.2),
        value,
      }
    })
    .filter((marker): marker is { position: number; value: number } => marker !== null)
    .sort((a, b) => a.position - b.position)

  if (!markers.length) {
    const max = document.documentElement.scrollHeight - window.innerHeight
    return max > 0 ? clamp(window.scrollY / max, 0, 1) : 0
  }

  const focus = window.scrollY + window.innerHeight * 0.56
  if (focus <= markers[0].position) return markers[0].value

  for (let index = 1; index < markers.length; index++) {
    const previous = markers[index - 1]
    const current = markers[index]
    if (focus > current.position) continue
    const distance = Math.max(1, current.position - previous.position)
    return lerp(previous.value, current.value, clamp((focus - previous.position) / distance, 0, 1))
  }

  return markers[markers.length - 1].value
}

function prefersReducedData() {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  const reducedData = window.matchMedia?.('(prefers-reduced-data: reduce)').matches ?? false
  return Boolean(connection?.saveData || reducedData)
}

function isLowPowerDevice() {
  const cores = navigator.hardwareConcurrency ?? 8
  return cores <= 4 && window.devicePixelRatio >= 2.5
}

function isMobileViewport() {
  return window.matchMedia('(max-width: 767px)').matches || window.matchMedia('(pointer: coarse)').matches
}

function buildAuroraBackground(blobs: CmsHomepageBackground['blobs']) {
  const [b1, b2, b3, b4] = blobs
  const rgba = (hex: string, alpha: number) => {
    const n = Number.parseInt(hex.replace('#', ''), 16)
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`
  }
  return [
    `radial-gradient(900px 600px at 12% 18%, ${rgba(b1.color, b1.alpha)}, transparent 60%)`,
    `radial-gradient(800px 550px at 88% 12%, ${rgba(b2.color, b2.alpha)}, transparent 60%)`,
    `radial-gradient(1000px 700px at 82% 82%, ${rgba(b3.color, b3.alpha)}, transparent 62%)`,
    `radial-gradient(900px 650px at 15% 88%, ${rgba(b4.color, b4.alpha)}, transparent 60%)`,
    // Warm dusk is the static baseline too: Data Saver / WebGL fallbacks must
    // still feel like the same page instead of flashing back to near-white.
    'linear-gradient(165deg, #5A2C47 0%, #351427 48%, #180711 100%)',
  ].join(',')
}

export function FlowWaveBackground({
  settings,
  variant = 'home',
}: {
  settings: CmsHomepageBackground
  variant?: FlowWaveVariant
}) {
  const variantSettings = settingsForVariant(settings, variant)
  const storiesVariant = variant === 'stories'
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const darkBackdropRef = useRef<HTMLDivElement | null>(null)
  const toneProgressRef = useRef(storiesVariant ? 1 : 0)
  const tunablesRef = useRef<TunableConfig>(variantSettings)
  tunablesRef.current = variantSettings

  const auroraBackground = useMemo(
    () => (storiesVariant ? STORIES_AURORA_BACKGROUND : buildAuroraBackground(settings.blobs)),
    [settings.blobs, storiesVariant],
  )

  // Keep the light-to-dark CSS atmosphere working even if WebGL is
  // unavailable or intentionally skipped on a weak device.
  useEffect(() => {
    let rafId = 0
    let disposed = false
    const host = canvasRef.current?.closest<HTMLElement>('.flow-wave-host') ?? null

    const updateTone = () => {
      rafId = 0
      if (disposed) return
      // Marker interpolation is already continuous. A restrained easing blend
      // softens the hand-off without crushing the deliberately darker hero.
      const rawProgress = storiesVariant ? 1 : readHomepageToneProgress()
      const progress = lerp(rawProgress, smoothstep01(rawProgress), 0.24)
      toneProgressRef.current = progress
      if (darkBackdropRef.current) darkBackdropRef.current.style.opacity = String(progress)
      host?.style.setProperty('--flow-wave-tone', progress.toFixed(4))
    }

    const scheduleToneUpdate = () => {
      if (disposed || rafId) return
      rafId = window.requestAnimationFrame(updateTone)
    }

    window.addEventListener('scroll', scheduleToneUpdate, { passive: true })
    window.addEventListener('resize', scheduleToneUpdate)
    window.addEventListener('load', scheduleToneUpdate)
    scheduleToneUpdate()
    void document.fonts?.ready.then(scheduleToneUpdate)

    return () => {
      disposed = true
      window.cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', scheduleToneUpdate)
      window.removeEventListener('resize', scheduleToneUpdate)
      window.removeEventListener('load', scheduleToneUpdate)
      host?.style.removeProperty('--flow-wave-tone')
    }
  }, [storiesVariant])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const motionCanvas = canvas
    motionCanvas.dataset.motion = 'deferred'
    // Data Saver explicitly opts out of WebGL. Low-power phones still receive
    // the network language through a deliberately small, frame-capped scene.
    if (prefersReducedData()) {
      motionCanvas.dataset.motion = 'static'
      return
    }

    let disposed = false
    let cleanupScene: (() => void) | undefined

    const idleHandle = { id: 0, usedIdle: false }
    whenIntroGone(() => {
      if (disposed) return
      const start = () => {
        if (disposed) return
        void initScene()
      }
      if (typeof window.requestIdleCallback === 'function') {
        idleHandle.usedIdle = true
        idleHandle.id = window.requestIdleCallback(start, { timeout: storiesVariant ? 800 : 2500 })
      } else {
        idleHandle.id = window.setTimeout(start, storiesVariant ? 80 : 250)
      }
    })

    async function initScene() {
      let THREE: typeof import('three')
      try {
        THREE = await import('three')
      } catch {
        motionCanvas.dataset.motion = 'static'
        return
      }
      if (disposed || !canvas) return

      const mobile = isMobileViewport()
      const lowPower = isLowPowerDevice()
      const dprCap = lowPower ? 1 : storiesVariant ? (mobile ? 1 : 1.35) : (mobile ? 1.25 : 1.75)
      const renderDpr = () => Math.min(window.devicePixelRatio, dprCap)
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      let renderer: import('three').WebGLRenderer
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: !lowPower, alpha: true })
      } catch {
        // WebGL unavailable — the layered CSS atmosphere is the fallback.
        motionCanvas.dataset.motion = 'static'
        return
      }
      renderer.setPixelRatio(renderDpr())
      renderer.setClearColor(0x000000, 0)

      const hexToVec3 = (hex: string) => {
        const n = Number.parseInt(hex.replace('#', ''), 16)
        return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255)
      }
      const darkColorLow = hexToVec3('#673047')
      const darkColorHigh = hexToVec3('#E8A35A')
      const darkAtmoColor = hexToVec3('#D74A7C')
      const lightContrastLow = hexToVec3('#B83D68')
      const lightContrastHigh = hexToVec3('#E8755B')

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 400)
      camera.position.set(0, CAM_START_Y, CAM_START_Z)
      scene.add(camera)

      const cfg = tunablesRef.current
      const group = new THREE.Group()
      scene.add(group)
      const densityCap = lowPower ? 0.42 : mobile ? 0.68 : 1
      const geometryDensity = clamp(Math.min(cfg.density || GEOMETRY_DENSITY, densityCap), 0.35, densityCap)
      const widthSegments = Math.max(72, Math.round((mobile ? 120 : 200) * geometryDensity))
      const heightSegments = Math.max(216, Math.round((mobile ? 360 : 600) * geometryDensity))
      const geo = new THREE.SphereGeometry(4.2, widthSegments, heightSegments)
      const uniforms = {
        uTime: { value: 0 },
        uStream: { value: 0 },
        uAppear: { value: 0 },
        uColLow: { value: hexToVec3(cfg.colorLow) },
        uColHigh: { value: hexToVec3(cfg.colorHigh) },
        uOpacity: { value: cfg.opacity },
        uSize: { value: (cfg.pointSize || POINT_SIZE) * (mobile ? 0.9 : 1) },
        uWaveHeight: { value: cfg.waveHeight },
        uFlow: { value: cfg.flow },
        uScale: { value: SCALE },
        uCursor: { value: new THREE.Vector3() },
        uRepelRadius: { value: POINTER_RADIUS },
        uRepelStrength: { value: cfg.pointerStrength },
        uActivity: { value: 0 },
      }
      const mat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
        uniforms,
        vertexShader: WAVE_VERTEX,
        fragmentShader: WAVE_FRAGMENT,
      })
      const pts = new THREE.Points(geo, mat)
      pts.frustumCulled = false
      group.add(pts)

      const atmoLimit = lowPower
        ? Math.min(36, variantSettings.atmoCount)
        : mobile
          ? Math.min(storiesVariant ? 48 : 72, variantSettings.atmoCount)
          : variantSettings.atmoCount
      const atmoN = Math.round(atmoLimit * geometryDensity)
      const atmoPositions = new Float32Array(atmoN * 3)
      const atmoSizes = new Float32Array(atmoN)
      const atmoSeeds = new Float32Array(atmoN)
      for (let i = 0; i < atmoN; i++) {
        atmoPositions[i * 3] = 2 * Math.random() - 1
        atmoPositions[i * 3 + 1] = 2 * Math.random() - 1
        atmoPositions[i * 3 + 2] = 2 * Math.random() - 1
        atmoSizes[i] = ATMO_SIZE * (0.4 + Math.random())
        atmoSeeds[i] = Math.random()
      }
      const atmoGeo = new THREE.BufferGeometry()
      atmoGeo.setAttribute('position', new THREE.BufferAttribute(atmoPositions, 3))
      atmoGeo.setAttribute('size', new THREE.BufferAttribute(atmoSizes, 1))
      atmoGeo.setAttribute('seed', new THREE.BufferAttribute(atmoSeeds, 1))
      const atmoMat = new THREE.ShaderMaterial({
        transparent: true,
        blending: THREE.NormalBlending,
        depthWrite: false,
        depthTest: false,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: hexToVec3(cfg.atmoColor) },
          uOpacity: { value: 1 },
          uSizeScale: { value: mobile ? 0.9 : 1 },
          uRes: { value: new THREE.Vector2(window.innerWidth * renderDpr(), window.innerHeight * renderDpr()) },
        },
        vertexShader: ATMO_VERTEX,
        fragmentShader: ATMO_FRAGMENT,
      })
      const atmoPts = new THREE.Points(atmoGeo, atmoMat)
      atmoPts.frustumCulled = false
      let toneCurrent = toneProgressRef.current
      atmoPts.onBeforeRender = () => {
        const speedScale = lerp(1, 0.6, toneCurrent)
        const variantSpeedScale = storiesVariant ? 0.78 : 1
        atmoMat.uniforms.uTime.value = reducedMotion
          ? 40
          : (performance.now() / 1000) * ATMO_SPEED * speedScale * variantSpeedScale * 8.0
        atmoPts.position.copy(camera.position)
      }
      scene.add(atmoPts)

      let scrollTarget = 0
      let scrollSmooth = 0
      let scrollCurrent = 0
      const readScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        scrollTarget = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0
      }
      let staticFrameRaf = 0
      const onScroll = () => {
        readScroll()
        if (reducedMotion && !staticFrameRaf) {
          staticFrameRaf = window.requestAnimationFrame(() => {
            staticFrameRaf = 0
            renderStaticFrame()
          })
        }
      }

      const mouseTarget = { x: 0, y: 0 }
      const mouse = { x: 0, y: 0 }
      const pointer = { world: new THREE.Vector3(), activity: 0, active: false, lastMove: performance.now() }
      const onMouseMove = (e: MouseEvent) => {
        mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1
        mouseTarget.y = -((e.clientY / window.innerHeight) * 2 - 1)
        pointer.active = true
        pointer.lastMove = performance.now()
      }
      const onMouseOut = () => {
        pointer.active = false
      }

      const ndc = new THREE.Vector3()
      const dir = new THREE.Vector3()
      const tgt = new THREE.Vector3()
      function updatePointerWorld() {
        tgt.set(0, 0, 0)
        if (pointer.active) {
          ndc.set(mouse.x, mouse.y, 0.5).unproject(camera)
          dir.copy(ndc).sub(camera.position).normalize()
          const dn = dir.z
          if (Math.abs(dn) > 1e-4) {
            const tt = -camera.position.z / dn
            if (tt > 0 && Number.isFinite(tt)) tgt.copy(camera.position).addScaledVector(dir, tt)
          }
        }
        pointer.world.lerp(tgt, 0.12)
        const idle = (performance.now() - pointer.lastMove) / 1000
        pointer.activity += ((pointer.active && idle < 3 ? 1 : 0) - pointer.activity) * 0.06
      }

      const state = { stream: 0, t0: performance.now() / 1000, appearStart: performance.now() }
      function applyTone(tone: number, scroll: number) {
        const live = tunablesRef.current
        const lightTonePresence = 1 - smoothstep01(tone / 0.55)
        const opacityScale = storiesVariant ? 0.94 : lerp(1, 0.67, tone) * (1 + lightTonePresence * 0.18)
        const pointScale = storiesVariant ? 0.94 : lerp(1, 0.78, tone)
        const motionScale = storiesVariant ? 0.82 : lerp(1, 0.6, tone)
        const earlyContrastMix = lightTonePresence * 0.24

        uniforms.uColLow.value.copy(hexToVec3(live.colorLow)).lerp(lightContrastLow, earlyContrastMix).lerp(darkColorLow, tone)
        uniforms.uColHigh.value.copy(hexToVec3(live.colorHigh)).lerp(lightContrastHigh, earlyContrastMix).lerp(darkColorHigh, tone)
        uniforms.uOpacity.value = live.opacity * opacityScale
        uniforms.uSize.value = (live.pointSize || POINT_SIZE) * (mobile ? 0.9 : 1) * pointScale
        uniforms.uFlow.value = live.flow * motionScale
        uniforms.uRepelStrength.value = mobile || lowPower ? 0 : live.pointerStrength * lerp(1, 0.5, tone)
        uniforms.uWaveHeight.value = live.waveHeight * pointScale * (1 + scroll * (live.scrollRise ?? SCROLL_RISE))

        atmoMat.uniforms.uColor.value.copy(hexToVec3(live.atmoColor)).lerp(darkAtmoColor, tone)
        atmoMat.uniforms.uOpacity.value = opacityScale * (storiesVariant ? 0.58 : 1)
        atmoMat.uniforms.uSizeScale.value = (mobile ? 0.9 : 1) * pointScale

        return motionScale
      }

      function positionCamera(scroll: number, m: { x: number; y: number }, time = 0) {
        if (storiesVariant) {
          // A slow multi-axis drift supplies the large-scale motion of
          // cinematic footage without another canvas or a video request.
          const phase = reducedMotion ? 0 : time
          const driftScale = lowPower ? 0.55 : 1
          const x = Math.sin(phase * 0.16) * (mobile ? 0.16 : 0.3) * driftScale
          const y = (mobile ? 3.65 : 4.15) + Math.sin(phase * 0.11 + 1.1) * (mobile ? 0.1 : 0.16) * driftScale
          const z = (mobile ? 9.8 : 10.6) + Math.cos(phase * 0.09) * (mobile ? 0.18 : 0.28) * driftScale
          camera.position.set(x, y, z)
          camera.lookAt(x * 0.2, 0.05, -4.8)
          return
        }

        const ea = Math.min(scroll / 0.75, 1.0)
        const scrollDive = ea * ea * (3 - 2 * ea)
        // Start part-way into the dive so a restrained wave trace is already
        // visible below the hero rather than only becoming legible near footer.
        const e = lerp(0.18, 1, scrollDive)
        camera.position.set(m.x * PARALLAX, lerp(CAM_START_Y, CAM_END_Y, e) + m.y * PARALLAX * 0.3, lerp(CAM_START_Z, CAM_END_Z, e))
        camera.lookAt(m.x * PARALLAX * 0.5, lerp(0.0, 0.6, e), lerp(LOOK_START_Z, LOOK_END_Z, e))
      }

      function renderScene(scroll: number, m: { x: number; y: number }) {
        const t = performance.now() / 1000
        const dt = Math.min(0.05, t - state.t0)
        state.t0 = t
        uniforms.uTime.value = t
        toneCurrent = lerp(toneCurrent, toneProgressRef.current, 0.055)
        const motionScale = applyTone(toneCurrent, scroll)
        if (storiesVariant) {
          // Uniform-only luminance breathing makes the network read as a living
          // scene while geometry and draw-call count stay unchanged.
          uniforms.uOpacity.value *= 0.94 + Math.sin(t * 0.32) * 0.06
          atmoMat.uniforms.uOpacity.value *= 0.96 + Math.cos(t * 0.24) * 0.04
        }
        const live = tunablesRef.current
        state.stream += dt * (live.flow * 2.0) * 4.0 * motionScale
        uniforms.uStream.value = state.stream
        positionCamera(scroll, m, t)
        updatePointerWorld()
        uniforms.uCursor.value.copy(pointer.world)
        uniforms.uActivity.value = mobile || lowPower || storiesVariant ? 0 : pointer.activity
        const elapsed = (performance.now() - state.appearStart) / 1000
        uniforms.uAppear.value = Math.max(0, Math.min(1, (elapsed - 0.2) / 1.4))
      }

      let rafId = 0
      let running = false
      let lastRenderAt = 0
      const minFrameInterval = lowPower ? 42 : mobile ? 32 : storiesVariant ? 22 : 0
      function loop(timestamp: number) {
        if (!running) return
        rafId = requestAnimationFrame(loop)
        const elapsedSinceLastFrame = timestamp - lastRenderAt
        if (minFrameInterval && elapsedSinceLastFrame < minFrameInterval) return
        lastRenderAt = minFrameInterval
          ? timestamp - (elapsedSinceLastFrame % minFrameInterval)
          : timestamp
        scrollSmooth = lerp(scrollSmooth, scrollTarget, 0.1)
        scrollCurrent = lerp(scrollCurrent, scrollSmooth, 0.06)
        mouse.x = lerp(mouse.x, mouseTarget.x, 0.06)
        mouse.y = lerp(mouse.y, mouseTarget.y, 0.06)
        renderScene(scrollCurrent, mouse)
        renderer.render(scene, camera)
      }
      function startLoop() {
        if (running) return
        running = true
        motionCanvas.dataset.motion = 'animated'
        state.t0 = performance.now() / 1000
        rafId = requestAnimationFrame(loop)
      }
      function stopLoop() {
        running = false
        cancelAnimationFrame(rafId)
      }

      function resize() {
        const w = window.innerWidth
        const h = window.innerHeight
        renderer.setPixelRatio(renderDpr())
        renderer.setSize(w, h, false)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        atmoMat.uniforms.uRes.value.set(w * renderDpr(), h * renderDpr())
        readScroll()
        if (reducedMotion) renderStaticFrame()
      }

      function renderStaticFrame() {
        // prefers-reduced-motion: one fixed frame with the same tone/camera
        // composition as motion mode, but no autonomous animation loop.
        const rawProgress = storiesVariant ? 1 : readHomepageToneProgress()
        toneProgressRef.current = lerp(rawProgress, smoothstep01(rawProgress), 0.24)
        toneCurrent = toneProgressRef.current
        applyTone(toneCurrent, scrollTarget)
        uniforms.uAppear.value = 1
        uniforms.uTime.value = 40
        uniforms.uStream.value = 60
        positionCamera(scrollTarget, { x: 0, y: 0 })
        renderer.render(scene, camera)
        motionCanvas.dataset.motion = 'static'
      }

      const onVisibility = () => {
        if (reducedMotion) return
        if (document.hidden) stopLoop()
        else startLoop()
      }

      window.addEventListener('resize', resize)
      window.addEventListener('scroll', onScroll, { passive: true })
      resize()

      if (reducedMotion) {
        renderStaticFrame()
      } else {
        if (!mobile && !lowPower && !storiesVariant) {
          window.addEventListener('mousemove', onMouseMove, { passive: true })
          window.addEventListener('mouseout', onMouseOut)
        }
        document.addEventListener('visibilitychange', onVisibility)
        startLoop()
      }

      cleanupScene = () => {
        stopLoop()
        motionCanvas.dataset.motion = 'deferred'
        window.cancelAnimationFrame(staticFrameRaf)
        window.removeEventListener('resize', resize)
        window.removeEventListener('scroll', onScroll)
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseout', onMouseOut)
        document.removeEventListener('visibilitychange', onVisibility)
        geo.dispose()
        mat.dispose()
        atmoGeo.dispose()
        atmoMat.dispose()
        renderer.dispose()
      }
    }

    return () => {
      disposed = true
      if (idleHandle.id) {
        if (idleHandle.usedIdle && typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idleHandle.id)
        else window.clearTimeout(idleHandle.id)
      }
      cleanupScene?.()
    }
    // Scene is rebuilt only when its motion profile changes; live tuning flows
    // through tunablesRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant])

  return (
    <>
      <div
        aria-hidden="true"
        className={`flow-wave-layer flow-wave-light flow-wave-light--${variant}`}
        style={{ background: auroraBackground }}
      />
      <div
        ref={darkBackdropRef}
        aria-hidden="true"
        className={`flow-wave-layer flow-wave-dark flow-wave-dark--${variant}`}
        style={storiesVariant ? { opacity: 1 } : undefined}
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        data-motion="deferred"
        className={`flow-wave-canvas flow-wave-canvas--${variant} fixed inset-0 -z-10 h-full w-full`}
        style={{ pointerEvents: 'none' }}
      />
    </>
  )
}
