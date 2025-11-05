import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { RootStackParamList } from './types';
import { useAuthStore } from '../stores/authStore';
import { useUserStore } from '../stores/userStore';
import { useAppStore } from '../stores/appStore';
import { theme } from '../theme';

// Onboarding screens
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { LoginScreen } from '../screens/onboarding/LoginScreen';
import { OTPScreen } from '../screens/onboarding/OTPScreen';
import { ProfileSetupScreen } from '../screens/onboarding/ProfileSetupScreen';

// Main navigator
import { MainDrawerNavigator } from './MainDrawerNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const [isReady, setIsReady] = React.useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasCompletedProfile = useUserStore((state) => state.hasCompletedProfile);
  const hasSeenWelcome = useAppStore((state) => state.hasSeenWelcome);
  const settings = useAppStore((state) => state.settings);

  // Wait for stores to rehydrate and load language
  React.useEffect(() => {
    const timer = setTimeout(async () => {
      // Load language from settings
      if (settings.language) {
        const i18n = require('../locales/i18n').default;
        await i18n.changeLanguage(settings.language);
      }
      setIsReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [settings.language]);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            {!hasSeenWelcome && (
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
            )}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="OTP" component={OTPScreen} />
          </>
        ) : !hasCompletedProfile ? (
          <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainDrawerNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});

