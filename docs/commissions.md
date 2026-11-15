# Music commissions

## Scope

A public `/commissions` page for Daniel Azubuine. Original compositions, arrangements, and orchestrations for solo instruments, chamber and mixed ensembles, voices/choirs, and orchestra. Prices are provided by enquiry, with no published starting rate. The user confirmed all three services on 16 November 2026.

## Direction contract

**THESIS:** Make commissioning music understandable: what can be written, how to start, and how a quote is agreed. Plain language carries the page; no generic sales claims.

**OWN-WORLD:** Extend the existing Anybody typography, teal accent, light/dark tokens, Resonance Field, rounded photography, and shared controls. This is an extension, not a new visual identity.

**STORY:** Understand the offer, hear existing compositions, read the process, and send an enquiry with whatever details are known. No public prices, invented credits, guaranteed availability, turnaround times, revision allowance, or contractual promises.

**FIRST VIEWPORT:** A large, left-aligned “Commission a piece of music” heading, concise scope, enquiry/listening actions, and the existing score-and-piano photograph in a wide horizontal composition. Pricing by enquiry is immediately visible.

**FORM:** Code-led, user-pinned reference structure adapted to the established site. Broad capability list, editorial process rows, concise FAQs, and an embedded enquiry form. No concept-seed: the reference and existing visual system settle the direction.

**FINISH:** unreviewed and undocumented is unfinished; this build ends with a bounded finish review, a verification record, and provenance for shipping imagery. As an ordinary extension, preserve the incumbent visual system and document its evidence here. The preexisting absence of `DESIGN.md` is documentation drift, not a missing feature requirement or authorization to create a new system or sidecar.

## Content and behavior contract

- Accept enquiries for original compositions, arrangements, and orchestrations; explicitly include orchestra and all instrument families.
- All fees, scope, delivery materials, schedule, and any recording/performance/publication permissions are discussed individually. Do not copy another composer's prices or legal terms.
- The enquiry form asks for name, email, service, performers, instrumentation, approximate duration, deadline, optional budget, and the idea. Only contact details and a message are essential.
- Use the existing contact email delivery route; clearly identify a music commission in the subject and include every submitted detail in the body. Do not show success when the provider rejects the message. Preserve form values on failure.
- Add discovery through navigation, the music catalog, the homepage music section, contact page, and sitemap. The new route uses Music Mode tint.
- Verification covers payload formatting/validation, provider-error handling, lint, TypeScript, build, links, form labels, keyboard use, and desktop/mobile overflow. Do not send a real email during QA without authorization.

## Research and provenance

- [David Hicken: Organ Music Commissions](https://davidhicken.com/pages/organ-music-commissions), read in the browser on 16 November 2026. Adapt the sequence of occasion, process, fees, and enquiry. Do not copy his organ-only scope, price, delivery promises, rights policy, or industry partnerships.
- [Juan J. Colomer: Commissions](https://www.juancolomer.com/commissions). Broad solo/chamber/orchestral/vocal scope and a useful project-detail checklist; omit biography claims, rate tables, fixed timelines, and deposit terms.
- [Gašper Jereb: Commission a New Work](https://gasperjereb.com/commission-a-new-work). Search-indexed primary page supports distinguishing original work from arrangements and asking about the ensemble. Its live page was not available through the text browser.
- Existing `public/images/pianomusic.jpg` is reused from this repository, not sourced from a reference composer's site. No new generated or stock imagery is introduced.

## Implementation and verification record

- Evidence checked: `PRODUCT.md`, `CONTEXT.md`, the existing Work Story ADR, the reference pages and availability notes above, `/commissions` markup and its CSS module, `src/app/globals.css`, the shared contact form, navigation, and discovery links. This is a surface-specific implementation review, not a new full-system audit.
- Inherited visual language: Anybody from the root layout; existing light/dark OKLCH page, ink, line, teal accent, and focus tokens; shared page shell, gutters, section spacing, and buttons. Photography and the form retain the existing media radius (`0.75rem`), pill controls retain the control radius (`999px`), and fields retain their shared `0.5rem` corners. Editorial columns collapse at the existing `48rem` breakpoint. No new global tokens, fonts, or design system were introduced.
- Shared behavior: the enquiry embeds `ContactForm` in commission mode, retaining labelled native controls and status feedback. The existing desktop/mobile navigation gains the route with active-page semantics; the homepage, music catalog, contact page, and sitemap provide discovery. The existing Resonance Field treats `/commissions` as Music Mode.
- Raster provenance: the only page photograph is the incumbent repository asset `public/images/pianomusic.jpg`, imported through `next/image` with descriptive alt text and responsive sizing. No new raster was generated, downloaded, or taken from the reference sites; no photographer or license attribution is inferred from repository reuse.
- Automated checks passed after the shared-form correction: all three enquiry tests, ESLint, TypeScript checking, and the production build. The correction uses `preventDefault()`, explicit pending state, and a success-only reset so a rejected submission cannot clear the enquiry.
- Browser verification after that correction confirmed that a server-validation failure retains the selected Orchestration service, Orchestra performers, and message. No real email was sent during QA, and live provider-delivery success is not claimed.
- Captures are in `C:/Users/dflat/.codex/visualizations/2026/07/16/019f6d0d-8349-74d0-843b-fb24b762fad9/commissions/`: `desktop.png`, `mobile.png`, and `failure-retained.png`. They record the responsive page and retained-input failure state, not a comprehensive accessibility or email-delivery certification.
- Independent standards and specification reviews cleared the corrected failure handling with no remaining findings. The visual finish reviewer issued `ship` after checking that sole required fix; its original review found no other blocking visual issues.
