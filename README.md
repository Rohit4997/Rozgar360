# Rozgar360 - Labour Marketplace Mobile App

A React Native mobile application designed to connect skilled labourers with people who need their services. Built with modern technologies and best practices.

## 📱 About

Rozgar360 is a platform that solves the problem of finding labour in local towns. The app allows:
- Workers to register their profiles and advertise their availability
- People to search for and connect with skilled workers directly
- Both parties to communicate without middlemen

## 🎯 Features

### Onboarding Flow
- **Welcome Screen**: Carousel showcasing app features
- **Login/Signup**: Phone number-based authentication
- **OTP Verification**: Secure verification process
- **Profile Setup**: Comprehensive profile creation with skills, experience, and availability

### Main Flow
- **Home Screen**: Toggle availability, browse available workers
- **Labour Details**: View detailed worker profiles with contact options
- **Search**: Find workers by name, skills, or location
- **Profile**: View and manage your profile
- **Settings**: Configure app preferences and notifications
- **Help & Support**: FAQs and issue reporting
- **About**: App information and contact details

## 🛠 Tech Stack

- **React Native 0.82.1**: Cross-platform mobile framework
- **TypeScript**: Type-safe development
- **Zustand**: Lightweight state management
- **React Navigation**: Navigation library with drawer and stack navigators
- **React i18next**: Internationalization support
- **React Native Safe Area Context**: Safe area handling
- **React Native Gesture Handler**: Gesture management
- **React Native Reanimated**: Smooth animations

## 📁 Project Structure

```
rozgar360/
├── src/
│   ├── components/          # Reusable components
│   │   ├── common/          # Common components (LabourCard, etc.)
│   │   └── ui/              # UI components (Button, Input, Card, etc.)
│   ├── locales/             # Internationalization files
│   │   ├── en.ts            # English translations
│   │   └── i18n.ts          # i18n configuration
│   ├── navigation/          # Navigation configuration
│   │   ├── RootNavigator.tsx
│   │   ├── MainDrawerNavigator.tsx
│   │   ├── HomeStackNavigator.tsx
│   │   └── types.ts
│   ├── screens/             # Screen components
│   │   ├── onboarding/      # Onboarding screens
│   │   │   ├── WelcomeScreen.tsx
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── OTPScreen.tsx
│   │   │   └── ProfileSetupScreen.tsx
│   │   └── main/            # Main flow screens
│   │       ├── HomeScreen.tsx
│   │       ├── LabourDetailsScreen.tsx
│   │       ├── SearchScreen.tsx
│   │       ├── ProfileScreen.tsx
│   │       ├── SettingsScreen.tsx
│   │       ├── HelpScreen.tsx
│   │       └── AboutScreen.tsx
│   ├── stores/              # Zustand state stores
│   │   ├── authStore.ts     # Authentication state
│   │   ├── userStore.ts     # User profile state
│   │   ├── labourStore.ts   # Labour data & filters
│   │   └── appStore.ts      # App settings
│   ├── theme/               # Theme configuration
│   │   ├── colors.ts        # Color palette
│   │   ├── typography.ts    # Font styles
│   │   ├── spacing.ts       # Spacing values
│   │   └── index.ts         # Theme exports
│   └── types/               # TypeScript type definitions
├── android/                 # Android native code
├── ios/                     # iOS native code (optional)
├── App.tsx                  # App entry point
├── package.json
└── tsconfig.json

```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20
- npm or yarn
- Android Studio (for Android development)
- JDK 11 or higher
- React Native CLI

### Installation

1. **Clone the repository**
   ```bash
   cd rozgar360
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install iOS dependencies (Mac only)**
   ```bash
   cd ios && pod install && cd ..
   ```

### Running the App

#### Android

```bash
npm run android
```

Or start Metro bundler separately:
```bash
npm start
```

Then in another terminal:
```bash
npm run android
```

#### iOS (Mac only)

```bash
npm run ios
```

## 🔐 Test Credentials

### Login Phone Numbers
- 9876543210 (OTP: 1234)
- 8765432109 (OTP: 1234)
- 7654321098 (OTP: 1234)

## 🎨 Theming

The app uses a configurable theming system located in `src/theme/`. You can easily change colors, typography, and spacing:

### Changing Primary Color

Edit `src/theme/colors.ts`:
```typescript
export const colors = {
  primary: '#2196F3',  // Change this to your desired color
  // ...
};
```

### Available Theme Properties
- **Colors**: Primary, secondary, text, background, status colors
- **Typography**: Font sizes, weights, line heights
- **Spacing**: Consistent spacing values throughout the app

## 🌍 Internationalization

The app is built with i18next for multi-language support.

### Current Languages
- English (en)

### Adding a New Language

1. Create a new translation file in `src/locales/` (e.g., `hi.ts` for Hindi)
2. Copy the structure from `en.ts` and translate
3. Import and add to `i18n.ts`:

```typescript
import { hi } from './hi';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
};
```

## 📊 State Management

The app uses **Zustand** for state management. All state logic is avoided from components using `useState`.

### Stores

1. **authStore**: Authentication state, login/logout
2. **userStore**: Current user profile and data
3. **labourStore**: Labour listings, search, and filters
4. **appStore**: App-level settings (language, notifications)

### Usage Example

```typescript
import { useUserStore } from '../stores/userStore';

const MyComponent = () => {
  const currentUser = useUserStore((state) => state.currentUser);
  const toggleAvailability = useUserStore((state) => state.toggleAvailability);
  
  // Use state and actions
};
```

## 🗺 Navigation

The app uses React Navigation with the following structure:

- **RootNavigator**: Main navigation container
  - **Welcome/Login/OTP/ProfileSetup**: Onboarding stack
  - **MainDrawerNavigator**: Main app drawer
    - **HomeStackNavigator**: Home and labour details
    - **Search**: Search screen
    - **Profile**: User profile
    - **Settings**: App settings
    - **Help**: Help & support
    - **About**: About the app

## 🔄 Data Flow

Currently, the app uses hardcoded data in Zustand stores:

- **Login credentials**: `src/stores/authStore.ts`
- **Labour listings**: `src/stores/labourStore.ts`

### Backend Integration (Future)

When integrating with a backend:
1. Replace hardcoded data with API calls
2. Add API client in `src/utils/api.ts`
3. Update store actions to fetch from API
4. Add loading and error states

## 🐛 Troubleshooting

### Metro Bundler Issues
```bash
npm start -- --reset-cache
```

### Android Build Issues
```bash
cd android && ./gradlew clean && cd ..
npm run android
```

### TypeScript Errors
```bash
npm run tsc
```

## 📝 Code Style

The project uses:
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Type checking

Run linting:
```bash
npm run lint
```

## 🤝 Contributing

When contributing:
1. Follow the existing code structure
2. Use Zustand for state (avoid useState)
3. Add translation keys for all user-facing text
4. Maintain consistent theming using theme constants
5. Write TypeScript interfaces for all data structures

## 📄 License

This project is private and proprietary.

## 📞 Contact

For questions or support:
- Email: support@rozgar360.com
- Phone: +91 98765 43210

---

Built with ❤️ for connecting skilled workers with opportunities
