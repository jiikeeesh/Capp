import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { CdashProvider, useCdash } from './src/context/CdashContext';
import { CdashHeader } from './src/components/CdashHeader';
import { CdashBottomNav } from './src/components/CdashBottomNav';
import { ProfileBottomSheet } from './src/components/ProfileBottomSheet';
import { NotificationsModal } from './src/components/NotificationsModal';
import { LoginScreen } from './src/screens/LoginScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { TasksScreen } from './src/screens/TasksScreen';
import { UsersScreen } from './src/screens/UsersScreen';
import { RequestsScreen } from './src/screens/RequestsScreen';

const MainApp: React.FC = () => {
  const { activeTab, colors, themeMode, isAuthenticated } = useCdash();

  // If not authenticated, render Login Screen matching cdash login
  if (!isAuthenticated) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.bgPage }]}
        edges={['top', 'left', 'right', 'bottom']}
      >
        <StatusBar style={themeMode === 'light' ? 'dark' : 'light'} />
        <LoginScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.bgSurface }]}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <StatusBar style={themeMode === 'light' ? 'dark' : 'light'} />

      {/* Instagram-Style Mobile Topbar */}
      <CdashHeader />

      {/* Main Page Body */}
      <View style={[styles.mainBody, { backgroundColor: colors.bgPage }]}>
        {activeTab === 'dashboard' && <DashboardScreen />}
        {activeTab === 'tasks' && <TasksScreen />}
        {activeTab === 'users' && <UsersScreen />}
        {activeTab === 'requests' && <RequestsScreen />}
      </View>

      {/* Instagram-Style Bottom Navigation Bar */}
      <CdashBottomNav />

      {/* Instagram-Style Profile Bottom Sheet (Drawer) */}
      <ProfileBottomSheet />

      {/* Notification Center Modal */}
      <NotificationsModal />
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <CdashProvider>
        <MainApp />
      </CdashProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  mainBody: {
    flex: 1,
  },
});
