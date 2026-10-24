import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCdash } from '../context/CdashContext';

export const CdashBottomNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    requests,
    colors,
    isProfileOpen,
    setIsProfileOpen,
  } = useCdash();

  const isUserOnly = currentUser.role === 'user';
  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  const initials = currentUser.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bgSurface,
          borderTopColor: colors.borderColor,
        },
      ]}
    >
      {/* Home / Dashboard */}
      <TouchableOpacity
        style={styles.tab}
        activeOpacity={0.7}
        onPress={() => setActiveTab('dashboard')}
      >
        <Ionicons
          name={activeTab === 'dashboard' ? 'home' : 'home-outline'}
          size={24}
          color={activeTab === 'dashboard' ? colors.brand : colors.textMuted}
        />
      </TouchableOpacity>

      {/* Tasks */}
      <TouchableOpacity
        style={styles.tab}
        activeOpacity={0.7}
        onPress={() => setActiveTab('tasks')}
      >
        <Ionicons
          name={activeTab === 'tasks' ? 'checkbox' : 'checkbox-outline'}
          size={24}
          color={activeTab === 'tasks' ? colors.brand : colors.textMuted}
        />
      </TouchableOpacity>

      {/* Users (Admin & Moderator) */}
      {!isUserOnly && (
        <TouchableOpacity
          style={styles.tab}
          activeOpacity={0.7}
          onPress={() => setActiveTab('users')}
        >
          <Ionicons
            name={activeTab === 'users' ? 'people' : 'people-outline'}
            size={24}
            color={activeTab === 'users' ? colors.brand : colors.textMuted}
          />
        </TouchableOpacity>
      )}

      {/* Account Requests (Admin & Moderator) */}
      {!isUserOnly && (
        <TouchableOpacity
          style={[styles.tab, styles.relativeTab]}
          activeOpacity={0.7}
          onPress={() => setActiveTab('requests')}
        >
          <Ionicons
            name={activeTab === 'requests' ? 'mail-open' : 'mail-outline'}
            size={24}
            color={activeTab === 'requests' ? colors.brand : colors.textMuted}
          />
          {pendingCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.error }]}>
              <Text style={styles.badgeText}>{pendingCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      {/* Profile Avatar Tab */}
      <TouchableOpacity
        style={styles.tab}
        activeOpacity={0.7}
        onPress={() => setIsProfileOpen(!isProfileOpen)}
      >
        <View
          style={[
            styles.avatarRing,
            {
              borderColor: isProfileOpen ? colors.brand : 'transparent',
            },
          ]}
        >
          <View style={[styles.avatarInner, { backgroundColor: colors.brand }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  tab: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  relativeTab: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: '25%',
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
  avatarRing: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 1,
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
});
