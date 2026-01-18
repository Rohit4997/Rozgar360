/**
 * Rozgar360 - Labour Marketplace App
 * @format
 */

import React from 'react';
import { StatusBar, View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import './src/locales/i18n';
import { RootNavigator } from './src/navigation/RootNavigator';
import { theme } from './src/theme';
import { getHealth } from './src/api/health';

function App() {
  const [isHealthCheckDone, setIsHealthCheckDone] = React.useState(false);

  React.useEffect(() => {
    getHealth().finally(() => {
      setIsHealthCheckDone(true);
    });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={theme.colors.background}
        />
        {!isHealthCheckDone ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <RootNavigator />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});

export default App;
