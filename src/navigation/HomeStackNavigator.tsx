import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';
import { HomeScreen } from '../screens/main/HomeScreen';
import { LabourDetailsScreen } from '../screens/main/LabourDetailsScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export const HomeStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="LabourDetails" component={LabourDetailsScreen} />
    </Stack.Navigator>
  );
};

