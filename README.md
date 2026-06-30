# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## Run on iPhone

Use a physical iPhone with Expo Go (works on Windows and macOS):

1. Install Expo Go on iPhone from the App Store.
2. In this project, run:

   ```bash
   npm run iphone
   ```

3. Scan the QR code from the terminal with the iPhone Camera app (or from Expo Go).

Notes:

- The `iphone` script uses tunnel mode, which is more reliable when your phone and computer are on different networks.
- The `ios` script (`expo start --ios`) is for iOS Simulator on macOS only.

If iPhone cannot open the app page:

1. Make sure you run the correct command:

   ```bash
   npm run iphone
   ```

2. If Expo Go opens but the app does not load, clear Metro cache:

   ```bash
   npm run iphone:clear
   ```

3. Close Expo Go completely on iPhone and reopen it.
4. Re-scan the QR code.
5. If it still fails, confirm the app is using SDK-compatible package versions by running:

   ```bash
   npx expo install --check
   ```

## Firebase Phone Verification Setup

1. Create a Firebase project and enable **Authentication > Sign-in method > Phone**.
2. Add app config in your environment file (for example `.env`):

   ```bash
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

3. Restart Expo after changing env vars:

   ```bash
   npm run start
   ```

4. Open the **Phone Verification** card on the home tab and test with an E.164 number (example `+15551234567`).

Notes:

- On Android, add your app SHA fingerprints in Firebase for production OTP flows.
- For local testing, use Firebase test phone numbers in the Auth console to avoid SMS quotas.

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Backend API and MySQL sync

This app already saves form data to local AsyncStorage in `lib/local-db.ts` and posts it to `EXPO_PUBLIC_API_BASE_URL` via `lib/api.ts`.

To run the backend server locally or on EC2:

1. Install the new server dependencies:
   ```bash
   npm install express mysql2 cors dotenv
   ```
2. Copy `server/.env.example` to `server/.env` and set your MySQL/EC2 values.
3. Start the API server:
   ```bash
   npm run serve-api
   ```
4. Set `EXPO_PUBLIC_API_BASE_URL` in `.env.local` to your EC2 public URL, for example:
   ```bash
   EXPO_PUBLIC_API_BASE_URL=http://your-ec2-ip-or-domain:3000
   ```

Create the MySQL table before saving data:

```sql
CREATE TABLE dynamic_inputs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(255) NOT NULL,
  values_json TEXT NOT NULL,
  image_uris_json TEXT NOT NULL,
  contact_phone VARCHAR(50),
  contact_email VARCHAR(255),
  status VARCHAR(50),
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME NOT NULL
);
```

To store coordinates as first-class columns in both tables:

```sql
ALTER TABLE dynamic_inputs
  ADD COLUMN latitude VARCHAR(32) NULL AFTER values_json,
  ADD COLUMN longitude VARCHAR(32) NULL AFTER latitude;

ALTER TABLE business_inputs
  ADD COLUMN latitude VARCHAR(32) NULL AFTER values_json,
  ADD COLUMN longitude VARCHAR(32) NULL AFTER latitude;
```
