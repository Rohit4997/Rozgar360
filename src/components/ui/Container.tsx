import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';

interface ContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  useSafeArea?: boolean;
}

export const Container = ({ children, style, useSafeArea = true }: ContainerProps) => {
  if (useSafeArea) {
    return (
      <SafeAreaView style={[styles.container, style]}>{children}</SafeAreaView>
    );
  }
  
  return <View style={[styles.container, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});

