import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCdash } from '../context/CdashContext';

export const CdashHeader: React.FC = () => {
  const {
    colors,
    themeMode,
    toggleThemeMode,
    unreadCount,
    setIsNotifOpen,
    setActiveTab,
    refreshData,
    isRefreshing,
  } = useCdash();

  return (
    <View style={[styles.container, { backgroundColor: colors.bgSurface, borderBottomColor: colors.borderColor }]}>
      {/* Brand logo & title */}
      <TouchableOpacity
        style={styles.brand}
        activeOpacity={0.8}
        onPress={() => setActiveTab('dashboard')}
      >
        <View style={[styles.logoIconWrap, { backgroundColor: colors.brand }]}>
          <Ionicons name="desktop-outline" size={16} color="#ffffff" />
        </View>
        <Text style={[styles.brandText, { color: colors.textPrimary }]}>CompanyDash</Text>
      </TouchableOpacity>

      {/* Right actions */}
      <View style={styles.actions}>
        {/* Live Refresh Button */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.bgSurfaceSub, borderColor: colors.borderColor }]}
          activeOpacity={0.7}
          onPress={refreshData}
          disabled={isRefreshing}
          accessibilityLabel="Refresh Workspace"
        >
          {isRefreshing ? (
            <ActivityIndicator size="small" color={colors.brand} />
          ) : (
            <Ionicons name="refresh-outline" size={17} color={colors.textPrimary} />
          )}
        </TouchableOpacity>

        {/* Notification Bell */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.bgSurfaceSub, borderColor: colors.borderColor }]}
          activeOpacity={0.7}
          onPress={() => setIsNotifOpen(true)}
          accessibilityLabel="Notifications"
        >
          <Ionicons name="notifications-outline" size={18} color={colors.textPrimary} />
          {unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.error }]}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Quick Dark/Light Mode switch */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.bgSurfaceSub, borderColor: colors.borderColor }]}
          activeOpacity={0.7}
          onPress={toggleThemeMode}
          accessibilityLabel="Toggle Theme Mode"
        >
          <Ionicons
            name={themeMode === 'light' ? 'moon-outline' : 'sunny-outline'}
            size={18}
            color={themeMode === 'light' ? colors.textPrimary : '#f59e0b'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 54,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
});
