# ADR 0001: Store Work Stories as Tiptap JSON

- Status: Accepted
- Date: 2026-07-17

## Context

Work Stories need headings, links, lists, quotes, code, dividers, and images. The original `storyContent` field stores a small `##`-heading convention, which is readable but cannot represent media or richer editorial structure without inventing another markup format. Storing rendered HTML would couple the database to today's presentation and make schema changes and content analysis harder.

## Decision

Store new Work Stories in `storyDocument` as Tiptap/ProseMirror JSON using a restricted shared extension schema. Use the same schema in the Studio Console editor, server-side validation, and public HTML generation.

The allowed schema is StarterKit constrained to H2/H3 headings, plus links and block images. Story images are uploaded to Cloudinary and saved in the document as remote URLs with alt text. Links accept HTTP, HTTPS, and mailto destinations; score-purchase destinations are a separate Composition field and accept HTTP/HTTPS only.

Keep `storyContent` as a read-only migration fallback. The Studio Console converts a legacy story into JSON when it is opened, and saving persists the new `storyDocument`. Projects without `story: true` store neither story field.

## Consequences

- Content remains structured and can be migrated or transformed without parsing presentation HTML.
- Editor and renderer must share the same extension list; changing that list is a content-schema change and requires checking existing documents.
- The application owns image upload and cleanup because Tiptap's Image extension only represents images. Saving an edited story removes Cloudinary images that disappeared from the previously saved document; failed uploads are also removed.
- Uploaded images can become orphaned if an author uploads one and abandons the form. A future media-library workflow may track pending assets if this becomes material.
- Public rendering uses generated HTML from the validated, private Studio Console document. The Studio Console must remain a trusted authoring surface.
