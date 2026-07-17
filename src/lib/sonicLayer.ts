export const SONIC_LAYER_TITLE = 'Domitila'

const SONIC_LAYER_SOURCE = '/audio/domitila.mp3'

export type SonicLayerController = {
  analyser: AnalyserNode
  frequencyData: Uint8Array
  resume: () => Promise<void>
  stop: () => Promise<void>
  suspend: () => Promise<void>
}

export async function createSonicLayer(): Promise<SonicLayerController> {
  const context = new AudioContext({ latencyHint: 'interactive' })
  const audioElement = new Audio(SONIC_LAYER_SOURCE)
  const source = context.createMediaElementSource(audioElement)
  const analyser = context.createAnalyser()
  const master = context.createGain()

  audioElement.loop = true
  audioElement.preload = 'auto'
  analyser.fftSize = 2048
  analyser.smoothingTimeConstant = 0.84
  master.gain.value = 0

  source.connect(analyser)
  analyser.connect(master)
  master.connect(context.destination)

  try {
    const playPromise = audioElement.play()
    await Promise.all([context.resume(), playPromise])
  } catch (error) {
    audioElement.pause()
    source.disconnect()
    analyser.disconnect()
    master.disconnect()
    await context.close()
    throw error
  }
  master.gain.setTargetAtTime(0.4, context.currentTime, 0.08)

  let stopped = false
  return {
    analyser,
    frequencyData: new Uint8Array(analyser.frequencyBinCount),
    suspend: async () => {
      if (!stopped && context.state === 'running') await context.suspend()
    },
    resume: async () => {
      if (!stopped && context.state === 'suspended') await context.resume()
    },
    stop: async () => {
      if (stopped) return
      stopped = true
      const now = context.currentTime
      master.gain.cancelScheduledValues(now)
      master.gain.setTargetAtTime(0, now, 0.035)
      await new Promise((resolve) => window.setTimeout(resolve, 160))
      audioElement.pause()
      audioElement.currentTime = 0
      source.disconnect()
      analyser.disconnect()
      master.disconnect()
      await context.close()
    },
  }
}
