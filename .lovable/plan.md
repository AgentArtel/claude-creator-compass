

# Add Drag-and-Drop Upload to Platform Detail + E2E Test

## Changes to `src/pages/Platforms.tsx` — PlatformDetail component

### 1. Add drag-and-drop zone
- Add `dragOver` state (`boolean`)
- Add `onDragOver`, `onDragLeave`, `onDrop` handlers to a drop zone div
- When status is `exporting`, show a dashed-border drop zone area above the action button with "Drag & drop your export file here, or click to browse"
- On drop: extract `e.dataTransfer.files[0]`, call the same upload flow as `handleFileChange`
- Visual feedback: highlight border with `border-primary` and `bg-primary/5` when dragging over

### 2. Drop zone UI (only visible when status === 'exporting')
- Dashed border container with Upload icon, instructional text
- Clicking anywhere in the zone triggers `fileInputRef.current?.click()`
- On drag over: border goes solid primary, background tints
- Replaces the need to click the "Upload Data" button (though button still works as fallback)

### 3. Refactor
- Extract the upload-with-progress logic into a shared `triggerUpload(file)` function used by both `handleFileChange` and `onDrop`
- Keep the existing hidden `<input type="file">` and progress bar

### 4. E2E browser test after implementation
- Navigate to `/platforms`, log in if needed
- Click a platform card
- Click "Mark as Exporting" 
- Verify the drop zone and "Upload Data" button appear
- Use the file input to upload a test file
- Verify toast success and status change to "Uploaded"

## Files
- **Edit**: `src/pages/Platforms.tsx`

