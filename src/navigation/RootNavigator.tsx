import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useAuthStore } from '../stores/authStore';
import { useUserStore } from '../stores/userStore';
import { useAppStore } from '../stores/appStore';

// Onboarding screens
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { LoginScreen } from '../screens/onboarding/LoginScreen';
import { OTPScreen } from '../screens/onboarding/OTPScreen';
import { ProfileSetupScreen } from '../screens/onboarding/ProfileSetupScreen';

// Main navigator
import { MainDrawerNavigator } from '../navigation/MainDrawerNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasCompletedProfile = useUserStore((state) => state.hasCompletedProfile);
  const hasSeenWelcome = useAppStore((state) => state.hasSeenWelcome);

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

