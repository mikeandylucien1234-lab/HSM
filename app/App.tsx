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
import { ProgrammeScreen } from './src/screens/ProgrammeScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { AccountScreen } from './src/screens/AccountScreen';
import { AdminApp } from './src/screens/AdminApp';
import { BottomNav } from './src/components/BottomNav';
import { Drawer } from './src/components/Drawer';

function Router() {
  const [tab, setTab] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);

  // L'admin est une application à part entière (sa propre nav basse).
  if (tab === 'admin') {
    return <AdminApp onExit={() => setTab('home')} />;
  }

  return (
    <View style={styles.root}>
      <View style={styles.content}>
        {tab === 'home' && <HomeScreen onOpenMenu={() => setMenuOpen(true)} onNavigate={setTab} />}
        {tab === 'live' && <LiveScreen />}
        {tab === 'programme' && <ProgrammeScreen />}
        {tab === 'search' && <SearchScreen />}
        {tab === 'profil' && <AccountScreen />}
      </View>
      <BottomNav active={tab} onSelect={setTab} />
      <Drawer
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={(key) => {
          if (key === 'admin') setTab('admin');
          else if (key === 'evenements') setTab('programme');
          else if (key === 'playlists') setTab('profil');
        }}
      />
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
