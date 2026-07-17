# Resonance Field behavior

This document records the implemented interaction contract for the Public Experience's Resonance Field. The Studio Console deliberately excludes the field and Sonic Layer.

## Visual signals

The WebGL2 field combines four independent inputs:

- Pointer position creates local interference for fine mouse pointers. Touch input does not imitate hover.
- Page scroll progress changes field rotation, scale, standing-wave frequency, and phase without moving or hijacking page content.
- The most visible direct child section of `main` supplies a slower structural signal, selected with `IntersectionObserver` rather than layout reads on every scroll event.
- Route mode interpolates between the Software Mode and Music Mode palettes instead of rebuilding the renderer on navigation.

Scroll progress is sampled with a passive listener and consumed inside the existing `requestAnimationFrame` render loop. The loop updates WebGL uniforms directly and does not trigger React renders per frame. Device pixel ratio remains capped at `1.5`.

## Sonic Layer

The Sonic Layer begins silent on every page load and requires the visitor to press the labelled control. It does not autoplay, request microphone access, or persist an enabled preference across visits.

The current source is Daniel Azubuine's `Domitila — Flow 1`, served locally from `public/audio`. Enabling the layer creates an `AudioContext`, routes the unfiltered recording through an `AnalyserNode`, and maps low-, mid-, and high-frequency energy to shader density, interference, and a clearly visible cyan-to-warm color response. There is no oscillator or synthesized audio source. The control exposes its state with `aria-pressed`, visible On/Off text, and a polite live-region announcement that names the piece.

The recording loops while enabled. Turning the layer off fades the gain, stops playback, resets the recording, disconnects the audio graph, and closes the context. Route navigation keeps the visitor's current in-session state; leaving the Public Experience destroys the graph. Hidden tabs suspend both audio and rendering until visible again.

## Capability and accessibility tiers

- `prefers-reduced-motion: reduce` renders a static field: pointer, scroll, section, route interpolation, and audio-reactive visual movement are disabled. The visitor may still deliberately listen to the recording.
- `prefers-reduced-data`, Save-Data, device memory at or below 4 GB, hardware concurrency at or below four cores, or missing WebGL2 use the existing CSS field fallback.
- The Public Experience remains fully understandable and usable with the Sonic Layer off or unavailable.
- The control uses no continuous decorative animation. Its state transition is short, and all control transitions are removed under reduced motion.

## Verification checklist

- Confirm the control is Off after a fresh load and no audio plays before activation.
- Enable it with pointer and keyboard, then confirm the visible label, `aria-pressed`, announcement, and local recording.
- Navigate between Software Mode and Music Mode while enabled and confirm uninterrupted playback and a smooth field-color transition.
- Scroll through multiple sections and confirm the field changes without layout movement or scroll interception.
- Turn the layer off and confirm the recording stops and resets.
- Test reduced motion and a constrained-device fallback before changing field signals or audio behavior.
