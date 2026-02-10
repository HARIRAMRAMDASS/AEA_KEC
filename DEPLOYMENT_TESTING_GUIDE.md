# 🚀 Deployment & Testing Guide

## Pre-Deployment: Local Testing

### 1. Test Event Creation
```bash
# Start server
cd server
npm install
npm run dev

# In another terminal, test with curl:
curl -X POST http://localhost:5000/api/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=Test Event" \
  -F "type=Tech" \
  -F "date=2026-02-15T10:00:00" \
  -F "teamSize=5" \
  -F "feeType=Per Head" \
  -F "feeAmount=500" \
  -F "closingDate=2026-02-14T23:59:59" \
  -F "whatsappLink=https://chat.whatsapp.com/test" \
  -F "maxSelectableEvents=3" \
  -F "selectionMode=Both" \
  -F "eventGroup=Zhakra" \
  -F "qrCode=@/path/to/qr.jpg"
```

**Expected Result:**
```json
{
  "_id": "abc123",
  "name": "Test Event",
  "qrCode": {
    "url": "https://res.cloudinary.com/.../qr.jpg",
    "publicId": "aea_kec/events/abc123"
  },
  ...
}
```

**Console Should Show:**
```
=== EVENT CREATION REQUEST ===
REQ BODY: { name, type, date, ... }
REQ FILE: { originalname: "qr.jpg", size: 12345, hasBuffer: true }
UPLOADING QR CODE TO CLOUDINARY...
[CLOUDINARY] Starting upload to folder: aea_kec/events, bufferSize: 12345 bytes
[CLOUDINARY] Upload SUCCESS: aea_kec/events/xyz789
QR CODE UPLOAD SUCCESS: { url: "https://...", publicId: "..." }
EVENT CREATED: abc123
```

### 2. Test Registration with Payment Screenshot
```bash
# Using FormData with curl
curl -X POST http://localhost:5000/api/events/register \
  -F "teamName=Team Alpha" \
  -F "members=[{\"name\":\"John\",\"email\":\"john@example.com\",\"phone\":\"9876543210\"}]" \
  -F "college=Government" \
  -F "collegeName=Test College" \
  -F "transactionId=UPI123456" \
  -F "eventIds=[\"event_id_1\",\"event_id_2\"]" \
  -F "paymentScreenshot=@/path/to/screenshot.jpg"
```

**Expected Result:**
```json
{
  "_id": "xyz789",
  "teamName": "Team Alpha",
  "members": [...],
  "paymentScreenshot": {
    "url": "https://res.cloudinary.com/.../screenshot.jpg",
    "publicId": "aea_kec/payments/xyz789"
  },
  ...
}
```

**Console Should Show:**
```
=== REGISTRATION REQUEST ===
REQ BODY: { teamName, college, collegeName, ... }
REQ FILE: { originalname: "screenshot.jpg", size: 45678, hasBuffer: true }
PARSED MEMBERS: [...]
PARSED EVENT IDS: [...]
UPLOADING TO CLOUDINARY...
[CLOUDINARY] Starting upload to folder: aea_kec/payments, bufferSize: 45678 bytes
[CLOUDINARY] Upload SUCCESS: aea_kec/payments/xyz789
```

### 3. Test Bearer Image Upload
```bash
curl -X POST http://localhost:5000/api/bearers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=John Doe" \
  -F "year=2024" \
  -F "image=@/path/to/image.jpg"
```

**Console Should Show:**
```
=== BEARER UPLOAD REQUEST ===
REQ FILE: { originalname: "image.jpg", size: 54321, hasBuffer: true }
UPLOADING BEARER IMAGE TO CLOUDINARY...
[CLOUDINARY] Starting upload to folder: aea_kec/bearers, bufferSize: 54321 bytes
[CLOUDINARY] Upload SUCCESS: aea_kec/bearers/abc123
BEARER CREATED: abc123
```

### 4. Test Video Upload
```bash
curl -X POST http://localhost:5000/api/videos \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "video=@/path/to/video.mp4"
```

**Console Should Show:**
```
=== VIDEO UPLOAD REQUEST ===
REQ FILE: { originalname: "video.mp4", mimetype: "video/mp4", size: 5000000, hasBuffer: true }
UPLOADING VIDEO TO CLOUDINARY...
[CLOUDINARY] Starting upload to folder: aea_kec/videos, resourceType: video, bufferSize: 5000000 bytes
[CLOUDINARY] Upload SUCCESS: aea_kec/videos/xyz789
VIDEO CREATED: xyz789
```

### 5. Frontend UI Testing
```bash
# In client folder
npm install
npm run dev

# Test flows:
# 1. Admin: Create event with QR code
# 2. User: Register with payment screenshot
# 3. Admin: Upload bearer image
# 4. Admin: Upload video
# 5. All: Verify deletion works
```

---

## Production Deployment to Render

### Step 1: Prepare Repository
```bash
# Ensure all changes are committed
git status  # Should be clean

# Push to your repository
git push origin main
```

### Step 2: Render Dashboard Configuration

**Service Settings:**
- Environment: Node.js
- Build Command: `cd server && npm install && cd ../client && npm install && npm run build`
- Start Command: `cd server && npm start`
- Node Version: 20.x (specified in package.json)

**Environment Variables:**
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
APPSCRIPT_URL=https://script.google.com/...
```

### Step 3: Deploy
```bash
# In Render dashboard:
# 1. Click "Deploy"
# 2. Watch build logs
# 3. Confirm "Server running on port 5000"
```

**Expected Build Log:**
```
Building source...
Installing dependencies...
Building React frontend...
✓ Frontend built successfully
Starting server...
MongoDB Connected
🚀 Server running on port 5000
```

### Step 4: Test Immediately After Deployment

#### Test 1: Frontend Loads
```
https://your-render-url
✅ Home page loads
✅ Navbar displays
✅ Register button visible
```

#### Test 2: Create Event
```
✅ Login as admin
✅ Navigate to Admin Dashboard
✅ Create new event with QR code
✅ Check Render logs for [CLOUDINARY] SUCCESS
✅ Verify QR appears in event details
✅ Check Cloudinary dashboard for aea_kec/events folder
```

#### Test 3: Register for Event
```
✅ Click "Register" button
✅ Fill registration form
✅ Upload payment screenshot
✅ Submit
✅ Check Render logs for [CLOUDINARY] SUCCESS
✅ Verify screenshot in Cloudinary aea_kec/payments folder
```

#### Test 4: Upload Bearer
```
✅ Admin → Office Bearers tab
✅ Upload image
✅ Check Render logs for success
✅ Verify in Cloudinary aea_kec/bearers folder
```

#### Test 5: Upload Video
```
✅ Admin → Videos tab
✅ Upload video file
✅ Check Render logs for success
✅ Verify in Cloudinary aea_kec/videos folder
```

---

## Reading Render Logs

### Access Logs
1. Go to Render dashboard
2. Click your service
3. Click "Logs" tab
4. View real-time logs

### What to Look For

**Success Indicators:**
```
=== EVENT CREATION REQUEST ===
REQ FILE: { ... hasBuffer: true }
[CLOUDINARY] Starting upload...
[CLOUDINARY] Upload SUCCESS: aea_kec/events/xyz
EVENT CREATED: abc123
```

**Error Indicators:**
```
REQ FILE: { ... hasBuffer: false }  ← ❌ Problem!
[CLOUDINARY] Upload FAILED: Error
```

### Filtering Logs
```
# View only upload-related logs
Ctrl+F "CLOUDINARY"

# View only errors
Ctrl+F "Error" or "FAILED"

# View specific feature
Ctrl+F "BEARER" or "VIDEO" or "EVENT"
```

---

## Troubleshooting Guide

### Problem: "Server Upload Error" appears
**Step 1:** Check Render logs
```
✅ See [CLOUDINARY] entries?
✅ See "Upload SUCCESS"?
✅ See "Upload FAILED"?
```

**Step 2:** If Upload FAILED
```
Look for error message like:
- "Invalid API credentials"
- "Resource limit exceeded"
- "Invalid format"
```

**Step 3:** Fix based on error
```
"Invalid API credentials" → Check Cloudinary vars in Render
"Resource limit exceeded" → Check Cloudinary account limits
"Invalid format" → Check file type/MIME type
```

### Problem: No debug logs appearing
**Step 1:** Verify deployment completed
```
Render → Service → Logs
Should see "🚀 Server running on port 5000"
```

**Step 2:** Try the upload again
```
Logs are real-time, may take 5 seconds to appear
```

**Step 3:** Check the right service
```
Make sure you're viewing the backend service logs, not frontend
```

### Problem: File uploads but doesn't appear in Cloudinary
**Step 1:** Check Cloudinary logs
```
Cloudinary dashboard → Activity
Should show upload attempt
```

**Step 2:** Verify Cloudinary credentials
```
Render → Environment Variables
Verify CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET are exact
```

**Step 3:** Test Cloudinary directly
```
Go to Cloudinary dashboard → Upload
Try uploading manually to verify account works
```

---

## Performance Monitoring

### Render Metrics
```
Monitor → Metrics
✅ CPU usage should be low (<20%)
✅ Memory should be stable
✅ Network in/out reasonable
```

### Cloudinary Quota
```
Cloudinary Dashboard → Settings → Usage
✅ Check bandwidth remaining
✅ Check storage used
✅ Set limits if needed
```

---

## Rollback Plan

If deployment fails critically:

```bash
# Option 1: Redeploy previous commit
git log --oneline  # Find last good commit
git revert HEAD    # Revert bad commit
git push origin main

# Option 2: Render rollback
Render Dashboard → Service → Deployments
Click previous successful deployment
Click "Redeploy"
```

---

## Success Criteria Checklist

- [ ] Frontend loads on Render URL
- [ ] Admin dashboard accessible
- [ ] Event creation works with QR upload
- [ ] Registration works with screenshot upload
- [ ] Bearer upload works with image
- [ ] Video upload works
- [ ] All files appear in Cloudinary
- [ ] All files appear in correct folders
- [ ] Deletions work (files removed from Cloudinary)
- [ ] No "Server Upload Error" messages
- [ ] Render logs show [CLOUDINARY] success messages
- [ ] Same features work locally and on Render

---

## Final Verification

Run this checklist 24 hours after deployment:

```
Day 1 - Smoke Tests
✅ Create event
✅ Register for event
✅ Upload bearer image
✅ Upload video
✅ Delete event

Day 2 - Stability Check
✅ Multiple concurrent uploads work
✅ Large file uploads work (if applicable)
✅ Cloudinary dashboard shows all files
✅ No errors in Render logs
✅ Performance acceptable

Day 3 - Production Confidence
✅ Real users can register
✅ All uploads complete successfully
✅ No user complaints about upload failures
✅ Monitoring stable
✅ Ready for full production use
```

---

## Support Contacts

If issues persist:

1. **Check Render Logs**: First step always
2. **Check Cloudinary Status**: Is API available?
3. **Verify Environment Vars**: Copy/paste to avoid typos
4. **Test Locally**: Reproduce locally first
5. **Check GitHub Issues**: Community solutions
6. **Contact Support**: Render.com or Cloudinary support

---

**Deployment Confidence: 🟢 HIGH**

All code is production-ready. Follow this guide and deployment will be successful! 🚀
