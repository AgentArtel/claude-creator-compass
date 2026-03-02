

# Add Real File Upload to Platform Detail

## Problem
The "Upload Data" button only advances the status enum — no file is actually uploaded to the `data-exports` storage bucket.

## Changes to `src/pages/Platforms.tsx`

### PlatformDetail component
- Add a hidden `<input type="file" ref={fileInputRef}>` 
- Add `uploading` and `uploadProgress` state
- When status is `exporting` and user clicks the action button, trigger the file input instead of calling `onAdvanceStatus`
- On file select:
  1. Get the current user
  2. Upload file to `data-exports` bucket at path `{user.id}/{platform.id}/{filename}`
  3. Find the latest `platform_imports` row for this platform
  4. Update it with `status: 'uploaded'`, `file_path`, and `file_size_bytes`
  5. Invalidate queries, show toast
- Show a progress bar (using the existing Progress component) during upload
- Show error toast on failure

### PlatformDetail props
- Add `onFileUploaded` callback prop (replaces `onAdvanceStatus` for the exporting step)
- Keep `onAdvanceStatus` for other steps (not_started → exporting, uploaded → processing)

### Platforms parent component
- Add `handleFileUpload` function that receives the file, does the Supabase storage upload + DB update
- Pass it to `PlatformDetail` as `onFileUploaded`
- The `advanceStatus` function stays unchanged for non-upload steps

### Imports to add
- `useRef` from React
- `Progress` from `@/components/ui/progress`
- `toast` from `sonner`

## Flow
```text
not_started → [Mark as Exporting] → exporting
exporting   → [Upload Data] → file picker → upload to bucket → update DB → uploaded
uploaded    → [Process Data] → processing
```

## Files
- **Edit**: `src/pages/Platforms.tsx`

