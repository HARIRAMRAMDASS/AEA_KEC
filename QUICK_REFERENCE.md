# ⚡ Quick Reference - Upload Pipeline Fix

## What Was Wrong ❌
```javascript
// OLD (BROKEN ON RENDER)
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });  // ❌ Disk storage

router.post('/upload', upload.single('file'), async (req, res) => {
  // File written to disk at req.file.path
  const uploaded = await cloudinary.uploader.upload(
    req.file.path  // ❌ Points to /uploads/file123 which doesn't exist on Render!
  );
});
```

## What's Fixed Now ✅
```javascript
// NEW (WORKS ON RENDER)
const multer = require('multer');
const streamifier = require('streamifier');

const storage = multer.memoryStorage();  // ✅ Memory only
const upload = multer({ storage });

const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

router.post('/upload', upload.single('file'), async (req, res) => {
  const uploaded = await uploadToCloudinary(
    req.file.buffer,  // ✅ Raw bytes from memory
    'folder-name'
  );
  res.json({ url: uploaded.secure_url });
});
```

## Frontend Changes

### Before ❌
```javascript
axios.post('/api/register', {
  name: "John",
  email: "john@example.com",
  // No file upload capability!
});
```

### After ✅
```javascript
const formData = new FormData();
formData.append('teamName', 'Team A');
formData.append('members', JSON.stringify([{name, email, phone}]));
formData.append('paymentScreenshot', file);  // ✅ Include file

axios.post('/api/events/register', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

## All Routes Fixed

| Route | Old Status | New Status | Test It |
|-------|-----------|-----------|---------|
| POST `/api/events` | ❌ Broken | ✅ Fixed | Create event with QR |
| POST `/api/events/register` | ❌ Broken | ✅ Fixed | Register with screenshot |
| POST `/api/bearers` | ❌ Broken | ✅ Fixed | Upload bearer image |
| POST `/api/videos` | ❌ Broken | ✅ Fixed | Upload video |
| DELETE `/api/events/:id` | ❌ Broken | ✅ Fixed | Delete event (Cloudinary cleanup) |
| DELETE `/api/bearers/:id` | ❌ Broken | ✅ Fixed | Delete bearer |
| DELETE `/api/videos/:id` | ❌ Broken | ✅ Fixed | Delete video |

## How to Deploy

```bash
# 1. Commit changes
git add .
git commit -m "Fix: Render-compatible file upload pipeline"

# 2. Push to Render
git push origin main

# 3. Wait for Render deployment
# 4. Test uploads in Render dashboard
```

## Verification (After Deploy)

### Check Render Logs
```
✅ See: [CLOUDINARY] Starting upload...
✅ See: [CLOUDINARY] Upload SUCCESS: public_id
❌ Don't see: Error uploading
```

### Check Cloudinary
```
✅ Files appear in aea_kec/events folder
✅ Files appear in aea_kec/payments folder
✅ Files appear in aea_kec/bearers folder
✅ Files appear in aea_kec/videos folder
```

### Test Features
```
✅ Create event → QR uploads successfully
✅ Register → Payment screenshot uploads successfully
✅ Upload bearer → Image appears in dashboard
✅ Upload video → Video appears in dashboard
✅ Delete → No files left in Cloudinary
```

## Environment Check

### Required on Render Settings
```
CLOUDINARY_CLOUD_NAME = ✅ Set
CLOUDINARY_API_KEY = ✅ Set
CLOUDINARY_API_SECRET = ✅ Set
MONGO_URI = ✅ Set
JWT_SECRET = ✅ Set
```

### NOT Required
```
❌ No UPLOAD_PATH
❌ No DISK_STORAGE_PATH
❌ No FILE_UPLOAD_FOLDER
```

## If Something's Wrong

### "Server Upload Error" Still Appears
1. Check Render logs for `[CLOUDINARY]` messages
2. Verify all CLOUDINARY_* env vars in Render
3. Open DevTools → Network → Check FormData sent
4. Ensure field names match: `qrCode`, `paymentScreenshot`, `image`, `video`

### File Uploaded But Not in Cloudinary
1. Check Render logs for Cloudinary error messages
2. Verify API keys are correct (no extra spaces)
3. Try uploading directly to Cloudinary dashboard

### No Debug Logs in Render
1. Check you're looking at the right service logs
2. Make sure deployment is fully complete
3. Try uploading again and refresh logs

## Why This Works on Render

✅ **Memory Storage**: Buffer stays in RAM, no disk dependency
✅ **Stream Piping**: Data flows Memory → Cloudinary (no disk)
✅ **Ephemeral Safe**: No files left on filesystem after upload
✅ **Scalable**: Multiple uploads happen in parallel
✅ **Reliable**: Cloudinary handles persistence

## Files to Check

```
server/utils/cloudinary.js          ← Memory storage config
server/routes/eventRoutes.js        ← Event + registration upload
server/routes/bearerRoutes.js       ← Bearer image upload
server/routes/videoRoutes.js        ← Video upload
client/src/components/RegistrationForm.jsx  ← FormData upload
client/src/pages/AdminDashboard.jsx ← Admin uploads
```

## One-Line Summary

✅ **Old**: Disk storage → breaks on Render's ephemeral filesystem
✅ **New**: Memory buffer → Cloudinary stream → works everywhere
