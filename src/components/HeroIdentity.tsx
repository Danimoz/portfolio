'use client'

import { useEffect, useRef } from 'react'
import styles from './HeroIdentity.module.css'

const roles = ['Composer', 'Pianist', 'Software Developer']
const cycleDuration = 5200
const arrivalEase = 'cubic-bezier(0.16, 1, 0.3, 1)'
const travelEase = 'cubic-bezier(0.76, 0, 0.24, 1)'

type IdentityControls = {
  select: (index: number, instant: boolean) => void
  toggle: () => void
}

export default function HeroIdentity() {
  const root = useRef<HTMLDivElement>(null)
  const controls = useRef<IdentityControls | null>(null)

  useEffect(() => {
    const element = root.current
    if (!element || !Element.prototype.animate) return

    const layers = Array.from(element.querySelectorAll<HTMLElement>('[data-role-layer]'))
    const choices = Array.from(element.querySelectorAll<HTMLButtonElement>('[data-role-choice]'))
    const playback = element.querySelector<HTMLButtonElement>('[data-playback]')!
    const echoes = element.querySelector<HTMLElement>('[data-echoes]')!
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const animations = new Set<Animation>()
    let current = 0
    let paused = false
    let inView = true
    let timer: ReturnType<typeof setTimeout> | undefined
    let remaining = cycleDuration
    let deadline = 0
    let progress: Animation | null = null

    const animate = (target: Element, frames: Keyframe[], options: KeyframeAnimationOptions) => {
      const animation = target.animate(frames, options)
      animations.add(animation)
      void animation.finished.then(() => {
        animations.delete(animation)
        animation.cancel()
      }, () => animations.delete(animation))
      return animation
    }

    const settle = () => {
      animations.forEach((animation) => animation.cancel())
      animations.clear()
      echoes.replaceChildren()
      layers.forEach((layer, index) => {
        layer.style.visibility = ''
        layer.dataset.current = String(index === current)
        layer.querySelectorAll<HTMLElement>('[data-letter]').forEach((letter) => {
          letter.style.opacity = ''
        })
      })
    }

    const stopClock = () => {
      if (timer !== undefined) {
        remaining = Math.max(0, deadline - performance.now())
        clearTimeout(timer)
        timer = undefined
      }
      progress?.cancel()
      progress = null
      const meter = choices[current].querySelector<HTMLElement>('[data-meter]')!
      meter.style.transform = `scaleX(${1 - remaining / cycleDuration})`
    }

    const show = (next: number, instant = false) => {
      if (next === current) return
      const previous = current
      const outgoing = Array.from(layers[previous].querySelectorAll<HTMLElement>('[data-letter]'))
      const oldPositions = outgoing.map((letter) => ({
        letter,
        bounds: letter.getBoundingClientRect(),
        used: false,
      }))
      settle()
      current = next
      element.dataset.role = String(current)
      layers.forEach((layer, index) => { layer.dataset.current = String(index === current) })
      choices.forEach((choice, index) => {
        choice.setAttribute('aria-pressed', String(index === current))
        choice.querySelector<HTMLElement>('[data-meter]')!.style.transform = 'scaleX(0)'
      })
      if (instant || motion.matches) return

      const incoming = Array.from(layers[current].querySelectorAll<HTMLElement>('[data-letter]'))
      const stageBounds = echoes.getBoundingClientRect()
      const newPositions = incoming.map((letter) => letter.getBoundingClientRect())
      layers[previous].style.visibility = 'visible'

      incoming.forEach((letter, index) => {
        const destination = newPositions[index]
        const match = oldPositions.find((old) => !old.used && old.letter.textContent === letter.textContent)
        const delay = current === 0
          ? Math.abs(index - (incoming.length - 1) / 2) * 22
          : current === 1 ? (index % 3) * 65 : index * 14
        let transform: string

        if (match) {
          match.used = true
          match.letter.style.opacity = '0'
          transform = `translate3d(${match.bounds.left - destination.left}px, ${match.bounds.top - destination.top}px, 0)`
        } else if (current === 0) {
          transform = `translate3d(${(index - incoming.length / 2) * 9}px, 0.55em, 0) rotate(${(index - incoming.length / 2) * 3}deg)`
        } else if (current === 1) {
          transform = `translate3d(0, ${index % 2 ? '-' : ''}0.75em, 0) rotateX(${index % 2 ? -65 : 65}deg)`
        } else {
          transform = `translate3d(${index % 2 ? 22 : -22}px, 0.4em, 0) scale(0.82) rotateY(-30deg)`
        }

        animate(letter, [
          { transform, opacity: match ? 1 : 0 },
          { transform: 'translate3d(0, 0, 0) rotate(0) rotateX(0) rotateY(0) scale(1)', opacity: 1 },
        ], { duration: match ? 760 : 620, delay, easing: match ? travelEase : arrivalEase, fill: 'both' })
      })

      oldPositions.forEach(({ letter, bounds, used }, index) => {
        if (!used) {
          letter.style.opacity = '0'
          animate(letter, [
            { transform: 'translate3d(0, 0, 0)', opacity: 1 },
            { transform: `translate3d(${(index - outgoing.length / 2) * 4}px, -0.45em, 0) rotateX(-45deg)`, opacity: 0 },
          ], { duration: 390, delay: index * 12, easing: arrivalEase, fill: 'both' })
        }

        const echo = document.createElement('span')
        echo.className = styles.echo
        echo.textContent = letter.textContent
        echo.style.left = `${bounds.left - stageBounds.left}px`
        echo.style.top = `${bounds.top - stageBounds.top}px`
        echoes.append(echo)
        animate(echo, [
          { transform: 'translate3d(0, 0, 0)', opacity: 0 },
          { transform: 'translate3d(4px, -7px, 0)', opacity: 0.26, offset: 0.2 },
          { transform: `translate3d(${10 + index * 1.4}px, -0.6em, 0) scale(1.04)`, opacity: 0 },
        ], { duration: 860, easing: arrivalEase })
      })
    }

    const startClock = () => {
      if (paused || motion.matches || !inView || document.hidden || timer !== undefined) return
      deadline = performance.now() + remaining
      const meter = choices[current].querySelector<HTMLElement>('[data-meter]')!
      progress = meter.animate([
        { transform: `scaleX(${1 - remaining / cycleDuration})` },
        { transform: 'scaleX(1)' },
      ], { duration: remaining, easing: 'linear', fill: 'forwards' })
      timer = setTimeout(() => {
        timer = undefined
        progress?.cancel()
        remaining = cycleDuration
        show((current + 1) % roles.length)
        startClock()
      }, remaining)
    }

    const setPaused = (value: boolean) => {
      stopClock()
      paused = value
      element.dataset.paused = String(paused)
      playback.setAttribute('aria-label', paused ? 'Play title animation' : 'Pause title animation')
      playback.title = paused ? 'Play title animation' : 'Pause title animation'
      if (paused) settle()
      else startClock()
    }

    controls.current = {
      select: (index, instant) => {
        stopClock()
        settle()
        remaining = cycleDuration
        show(index, instant)
        choices[index].querySelector<HTMLElement>('[data-meter]')!.style.transform = 'scaleX(0)'
        startClock()
      },
      toggle: () => setPaused(!paused),
    }

    const reconcile = () => {
      stopClock()
      settle()
      element.dataset.enhanced = String(!motion.matches)
      startClock()
    }
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      reconcile()
    }, { threshold: 0.15 })
    const resize = new ResizeObserver(() => { settle() })
    observer.observe(element)
    resize.observe(element)
    document.addEventListener('visibilitychange', reconcile)
    motion.addEventListener('change', reconcile)
    reconcile()

    return () => {
      stopClock()
      settle()
      observer.disconnect()
      resize.disconnect()
      document.removeEventListener('visibilitychange', reconcile)
      motion.removeEventListener('change', reconcile)
      controls.current = null
    }
  }, [])

  return (
    <div ref={root} className={styles.identity} data-role="0" data-paused="false">
      <h1 className={styles.title} aria-label="Composer, Pianist, Software Developer">
        <span className={styles.staticTitle} aria-hidden="true">
          <span>Composer,</span><span>Pianist,</span><span>Software Developer.</span>
        </span>
        <span className={styles.stage} aria-hidden="true">
          {roles.map((role, index) => (
            <span className={styles.layer} data-role-layer data-current={index === 0} key={role}>
              {role.split(' ').map((word) => (
                <span className={styles.word} key={word}>
                  {Array.from(word).map((letter, letterIndex) => (
                    <span className={styles.letter} data-letter key={`${letter}-${letterIndex}`}>{letter}</span>
                  ))}
                </span>
              ))}
            </span>
          ))}
          <span className={styles.echoes} data-echoes />
        </span>
      </h1>
      <div className={styles.controls} role="group" aria-label="Choose a title">
        {roles.map((role, index) => (
          <button
            type="button"
            className={styles.choice}
            data-role-choice
            aria-pressed={index === 0}
            key={role}
            onClick={(event) => controls.current?.select(index, event.detail === 0)}
          >
            {role}
            <span className={styles.meter} data-meter aria-hidden="true" />
          </button>
        ))}
        <button type="button" className={styles.playback} data-playback aria-label="Pause title animation" title="Pause title animation" onClick={() => controls.current?.toggle()}>
          <svg className={styles.pauseIcon} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M5 3v10M11 3v10" /></svg>
          <svg className={styles.playIcon} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m5 3 8 5-8 5Z" /></svg>
        </button>
      </div>
    </div>
  )
}
