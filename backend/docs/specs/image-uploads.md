# Image uploads

Persist user-owned image metadata in SQL and sanitized WebP files under configured UPLOAD_DIR (default data/uploads). Accept authenticated multipart JPG/PNG/WebP uploads up to 5 MB and 25 million pixels, validate/decode/re-encode with Pillow, remove metadata, normalize orientation and resize to at most 2000x2000. Filenames are generated UUIDs, never client paths.

Images are purpose-scoped (avatar or listing). Profile and listing writes verify media ownership before attachment. Listings have up to eight ordered photos; existing external URLs remain supported and existing imageUrl values remain available. Public image URLs are /api/media/<key>.webp, so the existing proxy serves them. Deletion rejects referenced assets. Removed linked files are pruned only after successful SQL commit; rolled-back uploads remove their new files. Pending client uploads are discarded on cancel when possible.

Provide shared drag/drop/file selection, upload feedback, previews, remove/reorder controls and a listing gallery. Avatar replacement and photo edits are staged until the profile/listing save succeeds. Tests cover auth, ownership, purpose, decoding/type/size, references, rollback, data-preserving migration, gallery persistence and HTTP serving after restart.
