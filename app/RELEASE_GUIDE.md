# Release Guide (Google Play + App Store)

This guide helps you publish this Flutter app to Google Play and Apple App Store.

## 1) Prerequisites

- Flutter SDK and Android SDK installed.
- Apple publish requires macOS + Xcode + Apple Developer account.
- A privacy policy URL is required by both stores.

## 2) Android - Google Play

### 2.1 Create upload keystore (one time)

Run from `app/`:

```powershell
New-Item -ItemType Directory -Force -Path .\keystore
keytool -genkey -v -keystore .\keystore\upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

### 2.2 Create `android/key.properties`

Copy and update:

```powershell
Copy-Item .\android\key.properties.example .\android\key.properties
```

Set real values in `android/key.properties`:

```properties
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=upload
storeFile=../keystore/upload-keystore.jks
```

`android/key.properties` is ignored by git, so secrets are kept local.

### 2.3 Build release AAB

```powershell
flutter clean
flutter pub get
flutter build appbundle --release
```

Upload file:

`build\app\outputs\bundle\release\app-release.aab`

### 2.4 Google Play Console checklist

- Create app and choose default language/category.
- Upload AAB to **Internal testing** first.
- Complete **App content** (privacy policy, ads, target audience).
- Complete **Data safety**.
- Add screenshots, icon, feature graphic.
- Roll out to production after internal test pass.

## 3) iOS - App Store

### 3.1 Required setup

- macOS with Xcode installed.
- Apple Developer account.
- Bundle ID in Xcode must match App Store Connect app.

### 3.2 Build and upload

Run from `app/` on macOS:

```bash
flutter clean
flutter pub get
flutter build ipa --release
```

Then upload via Xcode Organizer (Archive) or Transporter.

### 3.3 App Store Connect checklist

- Create app record with correct bundle ID.
- Fill metadata (description, keywords, support URL, privacy policy URL).
- Add screenshots for required device sizes.
- Configure App Privacy / data collection.
- Submit TestFlight build, then submit for App Review.

## 4) Versioning before each release

Update in `pubspec.yaml`:

```yaml
version: 1.0.0+1
```

- `1.0.0` is marketing version.
- `+1` is build number, must increase every upload.
