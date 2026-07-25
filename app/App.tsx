import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { colors } from './src/theme';
import { AuthProvider } from './src/lib/auth';
import { HomeScreen } from './src/screens/HomeScreen';
import { LiveScreen } from './src/screens/LiveScreen';
import { ShowsScreen } from './src/screens/ShowsScreen';
import { ChartsScreen } from './src/screens/ChartsScreen';
import { AccountScreen } from './src/screens/AccountScreen';
import { BottomNav } from './src/components/BottomNav';

function Router() {
  const [tab, setTab] = useState('home');
  return (
    <View style={styles.root}>
      <View style={styles.content}>
        {tab === 'home' && <HomeScreen />}
        {tab === 'live' && <LiveScreen />}
        {tab === 'shows' && <ShowsScreen />}
        {tab === 'charts' && <ChartsScreen />}
        {tab === 'account' && <AccountScreen />}
      </View>
      <BottomNav active={tab} onSelect={setTab} />
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  if (!fontsLoaded) return <View style={styles.root} />;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AuthProvider>
        <Router />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1 },
});
