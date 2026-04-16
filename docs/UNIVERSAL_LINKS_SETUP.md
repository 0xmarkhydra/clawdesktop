# Universal Links Setup Guide

This guide explains how to configure Universal Links for the ClawDesktop Flutter app.

## Current Configuration Status

### ✅ Completed
- Flutter app has `app_links` package installed (v6.4.1)
- Flutter code handles Universal Links in `main.dart` (AppGate widget)
- Android deep linking configured in `AndroidManifest.xml` for:
  - `https://clawdesktop.vn/threads/*`
  - `https://www.clawdesktop.vn/threads/*`
- iOS Associated Domains configured in `Runner.entitlements` for:
  - `applinks:clawdesktop.vn`
  - `applinks:www.clawdesktop.vn`

### ⚠️ Required (Server-Side)
- Host `apple-app-site-association` file on your web server
- Host `assetlinks.json` file on your web server

## iOS Universal Links

### 1. Get Your Apple Team ID

You need your Apple Developer Team ID to configure iOS Universal Links:

1. Go to [Apple Developer Account](https://developer.apple.com/account/)
2. Your Team ID is displayed in the membership section
3. It looks like: `ABC123XYZ`

### 2. Configure apple-app-site-association File

The file is located at: `docs/apple-app-site-association`

Replace `TEAMID` in the file with your actual Apple Team ID:

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appIDs": ["TEAMID.com.clawdesktop.app"],
        "paths": ["/threads/*"]
      }
    ]
  }
}
```

Example with real Team ID:
```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appIDs": ["ABC123XYZ.com.clawdesktop.app"],
        "paths": ["/threads/*"]
      }
    ]
  }
}
```

### 3. Host the File on Your Server

Upload the `apple-app-site-association` file to:
```
https://clawdesktop.vn/.well-known/apple-app-site-association
https://www.clawdesktop.vn/.well-known/apple-app-site-association
```

**Important requirements:**
- File must be served with `Content-Type: application/json` or `application/pkcs7-mime`
- File must be accessible without redirects
- File must not have any file extension (no `.json` suffix)
- File must be publicly accessible (no authentication required)

### 4. Verify the File

Test that the file is accessible:
```bash
curl -I https://clawdesktop.vn/.well-known/apple-app-site-association
```

## Android App Links

### 1. Get Your App's SHA-256 Fingerprint

You need the SHA-256 fingerprint of your app's signing certificate:

#### For Debug Build:
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android 2>/dev/null | grep SHA256
```

#### For Release Build:
If you have a release keystore:
```bash
keytool -list -v -keystore path/to/your/release.keystore -alias your-alias | grep SHA256
```

The output will look like:
```
SHA256: AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99
```

### 2. Configure assetlinks.json File

The file is located at: `docs/assetlinks.json`

Replace `SHA256_FINGERPRINT_HERE` with your actual SHA-256 fingerprint (remove colons):

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.clawdesktop.app",
      "sha256_cert_fingerprints": ["AABBCCDDEEFF00112233445566778899AABBCCDDEEFF00112233445566778899"]
    }
  }
]
```

### 3. Host the File on Your Server

Upload the `assetlinks.json` file to:
```
https://clawdesktop.vn/.well-known/assetlinks.json
https://www.clawdesktop.vn/.well-known/assetlinks.json
```

**Important requirements:**
- File must be served with `Content-Type: application/json`
- File must be accessible without redirects
- File must be publicly accessible (no authentication required)

### 4. Verify the File

Test that the file is accessible:
```bash
curl -I https://clawdesktop.vn/.well-known/assetlinks.json
```

## Testing Universal Links

### iOS Testing

1. **Test with Safari:**
   - Open Safari on your device
   - Navigate to: `https://clawdesktop.vn/threads/test-thread-id`
   - The app should open and navigate to the thread

2. **Test with Notes:**
   - Create a note with the link
   - Long-press the link
   - Select "Open in [Your App Name]"

3. **Verify with Console:**
   - Use Xcode → Window → Devices and Simulators
   - Check console for Universal Link verification logs

### Android Testing

1. **Test with Chrome:**
   - Open Chrome on your device
   - Navigate to: `https://clawdesktop.vn/threads/test-thread-id`
   - The app should open and navigate to the thread

2. **Test with adb:**
   ```bash
   adb shell am start -a android.intent.action.VIEW -d "https://clawdesktop.vn/threads/test-thread-id"
   ```

3. **Verify with Android Studio:**
   - Use Android Studio → App Links Assistant
   - Test your App Links configuration

## Troubleshooting

### iOS Issues

**Problem:** Universal Links not opening the app

**Solutions:**
1. Verify the `apple-app-site-association` file is accessible
2. Check that the Team ID is correct
3. Ensure the bundle identifier matches
4. Make sure the app is signed with the correct provisioning profile
5. Check that Associated Domains are enabled in Xcode
6. Try deleting and reinstalling the app

**Problem:** File not found error

**Solutions:**
1. Verify the file is at the correct path: `/.well-known/apple-app-site-association`
2. Check server configuration allows access to `.well-known` directory
3. Ensure the file has no extension

### Android Issues

**Problem:** App Links not opening the app

**Solutions:**
1. Verify the `assetlinks.json` file is accessible
2. Check that the SHA-256 fingerprint is correct
3. Ensure the package name matches
4. Make sure the app is signed with the correct keystore
5. Check that `android:autoVerify="true"` is in AndroidManifest.xml
6. Try clearing app data and testing again

**Problem:** Verification failed

**Solutions:**
1. Use the [Digital Asset Links Tool](https://developers.google.com/digital-asset-links/tools/generator) to verify
2. Check that the JSON is valid
3. Ensure the SHA-256 fingerprint has no colons
4. Verify the domain matches exactly

## Current App Configuration

### Bundle/Package Identifiers
- **iOS Bundle ID:** `com.clawdesktop.app`
- **Android Package Name:** `com.clawdesktop.app`

### Supported URL Patterns
- `https://clawdesktop.vn/threads/{threadId}`
- `https://www.clawdesktop.vn/threads/{threadId}`

### Flutter Implementation
The app handles Universal Links in `lib/main.dart` (AppGate widget):
- Listens for incoming links using the `app_links` package
- Parses thread ID from URL path
- Opens the corresponding thread when the link is received
- Handles authentication state (stores pending thread if user is not logged in)

## Next Steps

1. Replace `TEAMID` in `docs/apple-app-site-association` with your Apple Team ID
2. Replace `SHA256_FINGERPRINT_HERE` in `docs/assetlinks.json` with your app's SHA-256 fingerprint
3. Upload both files to your web server at the specified paths
4. Test the configuration using the testing methods above
5. Deploy the app with the updated configuration
