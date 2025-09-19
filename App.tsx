import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { OrdersScreen } from './src/screens/OrdersScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <OrdersScreen />
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
