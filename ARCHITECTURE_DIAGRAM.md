# 📊 Architecture Diagram - Upload Pipeline

## Old Architecture (BROKEN on Render) ❌

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser/Frontend                       │
│  1. User fills form with file                               │
│  2. Sends JSON with file path                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │  Express Server (Render)   │
        │                            │
        │  ❌ multer({ dest: '/' })   │
        │  Writes file to disk:      │
        │  /uploads/file_12345       │
        │                            │
        │  ❌ req.file.path =         │
        │     '/uploads/file_12345'  │
        └────────┬───────────────────┘
                 │
        ┌────────▼─────────────────────────┐
        │  Render Ephemeral Filesystem     │
        │                                  │
        │  /tmp/ → WIPED EVERY DEPLOY     │
        │  /uploads/ → DOESN'T EXIST      │
        │                                  │
        │  ❌ File path becomes invalid!  │
        └────────────────────────────────┘
                 │
        ┌────────▼─────────────────────────┐
        │  Cloudinary Upload Attempt      │
        │                                  │
        │  ❌ Can't find file at:          │
        │     '/uploads/file_12345'      │
        │                                  │
        │  UPLOAD FAILS! 😭               │
        └────────────────────────────────┘
                 │
                 ▼
        ┌────────────────────────┐
        │  Response to Browser   │
        │  Status: 500           │
        │  Message: "Server      │
        │  Upload Error"         │
        └────────────────────────┘
```

---

## New Architecture (FIXED) ✅

```
┌──────────────────────────────────────────────────┐
│          Browser/Frontend (React)                │
│                                                  │
│  const formData = new FormData()                │
│  formData.append('file', fileObject)            │
│  axios.post('/api/upload', formData)            │
│                                                  │
│  ✅ Uses FormData (not JSON)                    │
│  ✅ Binary file included                        │
└────────────────┬─────────────────────────────────┘
                 │
         HTTP multipart/form-data
                 │
                 ▼
    ┌────────────────────────────────┐
    │  Express Server (Render)       │
    │                                │
    │  1. Multer Middleware          │
    │     ✅ memoryStorage()         │
    │                                │
    │     Receives file bytes        │
    │     Stores in RAM buffer:      │
    │     req.file.buffer            │
    │                                │
    │  2. uploadToCloudinary()       │
    │     ✅ Uses buffer directly    │
    │     ✅ No disk writes          │
    │                                │
    │     streamifier.createReadStream(
    │       req.file.buffer
    │     ).pipe(upload_stream)      │
    │                                │
    └────────────┬───────────────────┘
                 │
        ┌────────▼──────────────────┐
        │  Node.js Memory (RAM)     │
        │                           │
        │  ✅ Buffer stays in RAM   │
        │  ✅ No disk writes        │
        │  ✅ Render-safe          │
        │                           │
        └────────┬──────────────────┘
                 │
      ┌──────────▼───────────────┐
      │  Cloudinary Upload       │
      │  Stream                  │
      │                          │
      │  streamifier pipes:      │
      │  RAM Buffer              │
      │    ↓                     │
      │  HTTP Stream             │
      │    ↓                     │
      │  Cloudinary API          │
      │                          │
      │  ✅ Direct streaming     │
      │  ✅ No intermediate file │
      │  ✅ Memory efficient     │
      └──────────┬───────────────┘
                 │
      ┌──────────▼──────────────────┐
      │  Cloudinary Storage        │
      │                            │
      │  /aea_kec/                │
      │  ├── events/   ← QR codes │
      │  ├── payments/ ← Screenshots
      │  ├── bearers/  ← Images   │
      │  └── videos/   ← Videos   │
      │                            │
      │  ✅ File persisted        │
      │  ✅ Secure URL returned   │
      │  ✅ Public ID for deletion│
      │                            │
      └──────────┬──────────────────┘
                 │
      ┌──────────▼──────────────────┐
      │  Database (MongoDB)        │
      │                            │
      │  Store:                    │
      │  - fileUrl (secure_url)   │
      │  - publicId (for delete)  │
      │                            │
      │  ✅ URLs permanent        │
      │  ✅ Not file paths        │
      │                            │
      └──────────┬──────────────────┘
                 │
                 ▼
      ┌──────────────────────────┐
      │  Response to Browser     │
      │                          │
      │  Status: 201 (Success)   │
      │  Data: {                 │
      │    _id: "...",          │
      │    fileUrl: "https://...",
      │    publicId: "..."       │
      │  }                       │
      │                          │
      │  ✅ UPLOAD SUCCESS! 🎉   │
      └──────────────────────────┘
```

---

## Data Flow Comparison

### Old (Broken) Flow
```
User File
    ↓
JSON Stringify
    ↓
Send to Server
    ↓
Multer: Write to /uploads/
    ↓
req.file.path = '/uploads/file123'
    ↓
Try to read file from /uploads/
    ↓
❌ FILE NOT FOUND (Render wiped /uploads/)
    ↓
❌ UPLOAD ERROR
```

### New (Fixed) Flow
```
User File (Binary)
    ↓
FormData append
    ↓
Send to Server as multipart
    ↓
Multer: Store in RAM buffer
    ↓
req.file.buffer = <raw bytes>
    ↓
Pass buffer to streamifier
    ↓
Streamifier converts to Stream
    ↓
Pipe directly to Cloudinary
    ↓
Cloudinary receives and stores
    ↓
Return secure_url + publicId
    ↓
✅ SUCCESS - Store URL in DB
```

---

## File Size Journey

### Memory Usage Chart
```
Time →
Memory
  │
  │                ┌─────────┐
  │                │ File in │
  │     ┌──────────┤  RAM    │──────────┐
100%   │          │ Buffer  │          │
  │    │          └─────────┘          │
  │    │                               │
 80%   │                               │ Upload
  │    │          Streamifying         │ to Cloud
 60%   │                               │
  │    │                               │
 40%   │                               │
  │    │ Multer                        │
 20%   │ Buffering                     │
  │────┼───────────────────────────────┴─────►
  │    │
  └────┴──── Render doesn't care about /uploads/
         (Nothing written to disk!)

    ✅ RENDER EPHEMERAL FILESYSTEM: SAFE ✅
```

---

## Request-Response Lifecycle

### Event Creation Request
```
1. Admin clicks "Launch Event"
   ↓
2. Select QR code file from computer
   ↓
3. Create FormData:
   {
     name: "Event",
     type: "Tech",
     date: "2026-02-15T10:00",
     qrCode: <File object>
   }
   ↓
4. POST /api/events (with FormData)
   ↓
5. Express Router receives request
   ↓
6. Multer middleware intercepts:
   - Parses multipart/form-data
   - Extracts 'qrCode' file
   - Stores in memory: req.file.buffer
   ↓
7. Route handler executes:
   const uploaded = await uploadToCloudinary(
     req.file.buffer,
     'aea_kec/events'
   )
   ↓
8. uploadToCloudinary function:
   - Creates read stream from buffer
   - Pipes to Cloudinary upload_stream
   - Cloudinary stores file
   - Returns { secure_url, public_id }
   ↓
9. Create Event in DB:
   {
     name: "Event",
     qrCode: {
       url: "https://res.cloudinary.com/.../qr.jpg",
       publicId: "aea_kec/events/abc123"
     }
   }
   ↓
10. Return 201 JSON response to frontend
    ↓
11. Admin sees success message ✅
    ↓
12. QR code displays in event details
    from secure_url
```

---

## Storage Comparison

### Old System (Render Incompatible)
```
Localhost:
  /uploads/
  ├── qr_12345.jpg    ✅ Persists
  ├── payment_67890.jpg
  ├── bearer_11111.jpg
  └── video_22222.mp4

Render Deploy 1:
  /uploads/           ✅ Exists
  ├── files...

Render Redeploy:
  /uploads/           ❌ WIPED!
  (Empty or doesn't exist)
  
Result: All previous uploads gone! 😢
```

### New System (Render Compatible)
```
Localhost:
  RAM Buffer → Cloudinary
  No local files

Render Deploy 1:
  RAM Buffer → Cloudinary
  Files in Cloudinary ✅

Render Redeploy:
  RAM Buffer → Cloudinary
  Files in Cloudinary ✅ (still there!)
  
Result: All files persist in Cloudinary! 😊
```

---

## Folder Structure

### Before (Disk-based) ❌
```
project/
├── server/
│   ├── uploads/          ← Deleted on redeploy!
│   │   ├── qr_*.jpg
│   │   ├── payment_*.jpg
│   │   └── ...
│   └── ...
└── ...
```

### After (Cloud-based) ✅
```
project/
├── server/
│   └── (NO /uploads/ folder!)
└── ...

Cloudinary Cloud:
aea_kec/
├── events/
│   ├── abc123.jpg
│   ├── def456.jpg
│   └── ...
├── payments/
│   ├── xyz789.jpg
│   └── ...
├── bearers/
│   ├── img001.jpg
│   └── ...
└── videos/
    ├── vid001.mp4
    └── ...
```

---

## Error Handling Comparison

### Old Error Chain
```
User uploads file
    ↓
Multer writes to /uploads/
    ✅ Success (on Render temporarily)
    ↓
Code reads from /uploads/file_path
    ❌ File doesn't exist anymore!
    ↓
Cloudinary.upload(invalid_path)
    ❌ FAILS
    ↓
catch (error) → "Server Upload Error"
    ↓
User sees error, confused 😕
```

### New Error Chain
```
User uploads file
    ↓
Multer buffers in RAM
    ✅ Success always
    ↓
Streamifier pipes to Cloudinary
    ✅ Direct streaming
    ↓
Cloudinary.uploader.upload_stream()
    ✅ Success or detailed error
    ↓
If error → Log with details
    e.g., "Invalid format", "Size limit"
    ↓
User sees specific error, can fix 😊
```

---

## Summary Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    Upload Pipeline Fix                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ❌ OLD APPROACH (Broken on Render)                          │
│  Browser → FormData → Multer (disk) → /uploads/ → Cloudinary│
│           └─ Problem: /uploads/ wiped on redeploy!          │
│                                                              │
│  ✅ NEW APPROACH (Works on Render)                           │
│  Browser → FormData → Multer (memory) → RAM Buffer          │
│                                         ↓                    │
│                                   Streamifier                │
│                                         ↓                    │
│                                    Cloudinary                │
│           └─ Solution: No disk dependency!                  │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  Key Improvements:                                           │
│  ✅ No disk storage                                          │
│  ✅ No ephemeral filesystem issues                           │
│  ✅ Better security (CDN-hosted)                             │
│  ✅ Works on localhost and Render                            │
│  ✅ Automatic file persistence                              │
│  ✅ Detailed error messages                                  │
└──────────────────────────────────────────────────────────────┘
```

---

Ready for deployment! 🚀
