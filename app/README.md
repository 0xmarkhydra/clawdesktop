# ClawDesktop Flutter App

Flutter mobile app (Android/iOS) for user flow, reusing the same backend APIs and Socket.IO realtime events.

## Features

- User login/register with token persistence.
- Auto refresh access token via interceptor.
- Chat threads list, create thread, delete thread.
- Message list, send text message, upload image.
- Realtime typing + streaming response via Socket.IO.

## Backend Contract

This app expects backend APIs from `../backend`:

- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /threads`
- `POST /threads`
- `DELETE /threads/:id`
- `GET /threads/:id/messages`
- `POST /threads/:id/messages`
- `POST /upload/image`

Socket events:

- `join:thread`
- `thread:typing`
- `thread:stream`
- `thread:stream:done`
- `thread:stream:error`

## Run

From this `app` folder:

```bash
flutter pub get
flutter run --dart-define=API_URL=http://localhost:8000
```

For Android emulator with backend on host machine, use:

```bash
flutter run --dart-define=API_URL=http://10.0.2.2:8000
```

## Validate

```bash
flutter analyze
flutter test
```

## Notes

- App currently focuses on user flow only (no admin flow).
- `x-device-id` is generated and persisted via `SharedPreferences`.
- Tokens/user profile are stored in `flutter_secure_storage`.
