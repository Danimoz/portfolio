# Homepage identity motion

Research and implementation direction, 9 November 2026.

## Brief

Animate between Composer, Pianist, and Software Developer. Preserve the homepage’s plain language, Anybody typography, portrait, and existing Resonance Field. The title is the focal moment; visitors must still reach the work immediately.

## Research

| Primary source | Technique or finding | Application here |
| --- | --- | --- |
| [Arnaud Rocca’s portfolio breakdown](https://tympanus.net/codrops/2026/03/31/arnaud-roccas-portfolio-from-a-gsap-powered-motion-system-to-fluid-webgl/) | Coordinated text transitions, fluid WebGL, autoplay with several manual inputs | Give the title both automatic sequencing and explicit role selection; keep the existing field rather than creating another full-screen renderer. |
| [Kinetic Typography Page Transition](https://tympanus.net/codrops/2021/09/29/kinetic-typography-page-transition/) | Letters change scale, depth, and visual prominence to bridge content states | Treat role changes as a spatial transformation rather than replacing a string. |
| [A Drift: typography ghost trails](https://tympanus.net/codrops/2026/10/13/scroll-driven-ghost-trails/) | Solid letters remain readable while outline copies trace movement; rendering pauses in hidden tabs | Brief outlined echoes during transitions, no continuous idle distortion. |
| [Text Character Animations](https://tympanus.net/Demos/TextCharacterAnimations/) | Nineteen experiments including overtype, filament, photocopy, and caustics | Considered cursor/typewriter/scramble approaches, but selected shared-letter travel because it preserves visual continuity between real words. |
| [Kinetic Typography with Three.js](https://tympanus.net/codrops/2020/06/02/kinetic-typography-with-three-js/) | Text rendered to a texture can be repeated and deformed on 3D geometry | Evaluated as an alternative. A second WebGL text renderer adds atlas, sharpness, and fallback work without helping this short headline. Keep crisp DOM text and use perspective transforms. |
| [GSAP SplitText documentation](https://gsap.com/docs/v3/Plugins/SplitText/) | Split letters need an intact accessible label; responsive splitting must account for fonts and widths | Stable accessible h1 containing all three roles, hidden decorative glyphs, live DOM measurements, resize cleanup. GSAP is not required for the small fixed vocabulary. |
| [MDN: Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Using_the_Web_Animations_API) | Native animation timelines support cancellation and playback control | Animate transforms/opacity through Element.animate; cancel on interruption and cleanup; React does not render on every frame. |
| [W3C: Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide) | Automatically changing content needs a persistent means of control | Dedicated pause/play, offscreen/hidden suspension, static reduced-motion presentation. |

These are technique references, not claims that the source sites use this exact role animation. The synthesis below is original to this portfolio.

## Motion thesis

- **Focal moment:** the same typography reorganizes into three identities. Exact shared characters are reused visually by moving the incoming glyph from the outgoing glyph’s measured position.
- **Character:** Composer arrives in a center-out fan; Pianist uses alternating depth/vertical attacks; Software Developer assembles in a tight sequential cadence. These are timing differences, without decorative notes, keyboards, or fake code.
- **Continuity:** a fixed two-line stage accommodates the longest title. Outgoing letters leave a transient outline echo. No random letters, unreadable scramble, or looping distortion.
- **Timing:** 5.2 seconds per role, including a transition of at most about 1 second. Shared letters use a 760ms ease-in-out; new letters use a 620ms exponential-style ease-out. The rest is reading time.
- **Feedback:** rotation starts automatically. Role buttons show the current selection and its elapsed hold. Selecting a role resets the hold and continues rotation unless the visitor has explicitly paused. Keyboard selection is immediate. A separate play/pause control preserves control without holding focus.
- **Budget:** only transform and opacity animate. No animation dependency, per-frame React work, canvas text, or additional WebGL context. Geometry is measured at transitions, not every frame.

## Maintenance and verification

Implementation: `src/components/HeroIdentity.tsx` and its CSS module. The homepage remains a server component.

Check desktop and narrow mobile layouts, repeated/manual role changes, pausing during a transition, resuming, tab visibility, leaving/re-entering the hero, reduced motion, font loading, resize, keyboard access, and cleanup on navigation. All roles remain in one stable accessible heading, without a live region announcing every cycle. Reduced motion shows the complete static identity.

### Verification for this implementation

- ESLint, TypeScript, and the Next.js production build pass.
- Browser inspection at the default desktop viewport, 390px, and 320px shows no horizontal overflow. The longest title fits on two lines; controls retain 44px height.
- Manual role selection resets the hold and preserves playback; keyboard selection changes the title immediately. Only the pause control pauses autoplay; play resumes rotation.
- Composer and Software Developer both measured 254.39px heading height and the same document-relative summary position at the desktop viewport.
- After scrolling past the hero, the active role remained unchanged across more than one cycle.
- Reduced-motion and light-theme alternatives were checked in the implementation; this browser interface does not expose media emulation, so those two alternatives still benefit from a real-device spot check.
