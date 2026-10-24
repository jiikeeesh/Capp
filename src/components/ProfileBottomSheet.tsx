import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCdash } from '../context/CdashContext';
import { STATUS_OPTIONS, PRESET_COLORS } from '../data/cdashInitialData';
import { Role } from '../types/cdash';

export const ProfileBottomSheet: React.FC = () => {
  const {
    isProfileOpen,
    setIsProfileOpen,
    currentUser,
    setCurrentUserRole,
    colors,
    themeMode,
    toggleThemeMode,
    themeColor,
    setThemeColor,
    userStatus,
    setUserStatus,
    logout,
  } = useCdash();

  if (!isProfileOpen) return null;

  const initials = currentUser.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const roleBadgeStyle = (role: Role) => {
    switch (role) {
      case 'admin':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' };
      case 'moderator':
        return { bg: 'rgba(139, 92, 246, 0.15)', text: '#8b5cf6' };
      case 'user':
      default:
        return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6' };
    }
  };

  const badgeTheme = roleBadgeStyle(currentUser.role);

  return (
    <Modal
      visible={isProfileOpen}
      transparent
      animationType="fade"
      onRequestClose={() => setIsProfileOpen(false)}
    >
      <TouchableWithoutFeedback onPress={() => setIsProfileOpen(false)}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View
              style={[
                styles.sheet,
                {
                  backgroundColor: colors.bgSurface,
                  borderColor: colors.borderColor,
                },
              ]}
            >
              {/* Sheet handle */}
              <View style={[styles.handle, { backgroundColor: colors.borderColor }]} />

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                  <View style={[styles.avatarLarge, { backgroundColor: colors.brand }]}>
                    <Text style={styles.avatarLargeText}>{initials}</Text>
                  </View>
                  <View style={styles.profileInfo}>
                    <Text style={[styles.profileName, { color: colors.textPrimary }]}>
                      {currentUser.fullName}
                    </Text>
                    <Text style={[styles.profileUsername, { color: colors.textMuted }]}>
                      @{currentUser.username}
                    </Text>
                    <View style={[styles.roleBadge, { backgroundColor: badgeTheme.bg }]}>
                      <Text style={[styles.roleBadgeText, { color: badgeTheme.text }]}>
                        {currentUser.role.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Switch Role Quick Bar (Tester friendly) */}
                <View style={[styles.sectionCard, { backgroundColor: colors.bgSurfaceSub, borderColor: colors.borderColor }]}>
                  <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
                    SWITCH ROLE (FOR PREVIEW)
                  </Text>
                  <View style={styles.roleBtnGroup}>
                    {(['admin', 'moderator', 'user'] as Role[]).map((r) => {
                      const isActive = currentUser.role === r;
                      return (
                        <TouchableOpacity
                          key={r}
                          style={[
                            styles.roleBtn,
                            {
                              backgroundColor: isActive ? colors.brand : colors.bgSurface,
                              borderColor: isActive ? colors.brand : colors.borderColor,
                            },
                          ]}
                          onPress={() => setCurrentUserRole(r)}
                        >
                          <Text
                            style={[
                              styles.roleBtnText,
                              { color: isActive ? '#ffffff' : colors.textPrimary },
                            ]}
                          >
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* User Details */}
                <View style={[styles.sectionCard, { backgroundColor: colors.bgSurfaceSub, borderColor: colors.borderColor }]}>
                  <View style={styles.detailRow}>
                    <View style={[styles.iconBox, { backgroundColor: colors.bgSurface }]}>
                      <Ionicons name="mail-outline" size={16} color={colors.textSecondary} />
                    </View>
                    <Text style={[styles.detailText, { color: colors.textPrimary }]} numberOfLines={1}>
                      {currentUser.email}
                    </Text>
                  </View>

                  {currentUser.department && (
                    <View style={styles.detailRow}>
                      <View style={[styles.iconBox, { backgroundColor: colors.bgSurface }]}>
                        <Ionicons name="business-outline" size={16} color={colors.textSecondary} />
                      </View>
                      <Text style={[styles.detailText, { color: colors.textPrimary }]}>
                        {currentUser.department}
                      </Text>
                    </View>
                  )}

                  <View style={styles.detailRow}>
                    <View style={[styles.iconBox, { backgroundColor: colors.bgSurface }]}>
                      <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                    </View>
                    <Text style={[styles.detailText, { color: colors.textPrimary }]}>
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Active Workspace
                    </Text>
                  </View>
                </View>

                {/* User Presence Status Selector */}
                <View style={[styles.sectionCard, { backgroundColor: colors.bgSurfaceSub, borderColor: colors.borderColor }]}>
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                    Presence Status
                  </Text>
                  <View style={styles.statusList}>
                    {STATUS_OPTIONS.map((item) => {
                      const isSelected = userStatus === item.id;
                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={[
                            styles.statusItem,
                            {
                              backgroundColor: isSelected ? colors.bgSurface : 'transparent',
                              borderColor: isSelected ? colors.brand : 'transparent',
                              borderWidth: isSelected ? 1 : 0,
                            },
                          ]}
                          onPress={() => setUserStatus(item.id)}
                        >
                          <Text style={{ fontSize: 16 }}>{item.emoji}</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.statusItemLabel, { color: colors.textPrimary }]}>
                              {item.label}
                            </Text>
                            <Text style={[styles.statusItemDesc, { color: colors.textMuted }]}>
                              {item.desc}
                            </Text>
                          </View>
                          {isSelected && (
                            <Ionicons name="checkmark-circle" size={18} color={colors.brand} />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Theme & Color */}
                <View style={[styles.sectionCard, { backgroundColor: colors.bgSurfaceSub, borderColor: colors.borderColor }]}>
                  <View style={styles.themeRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons name="color-palette-outline" size={18} color={colors.brand} />
                      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                        Theme & Color
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.modePill,
                        {
                          backgroundColor: colors.bgSurface,
                          borderColor: colors.borderColor,
                        },
                      ]}
                      onPress={toggleThemeMode}
                    >
                      <Ionicons
                        name={themeMode === 'light' ? 'sunny' : 'moon'}
                        size={14}
                        color={themeMode === 'light' ? '#f59e0b' : colors.brand}
                      />
                      <Text style={[styles.modePillText, { color: colors.textPrimary }]}>
                        {themeMode === 'light' ? 'Light' : 'Dark'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.sectionSubtitle, { color: colors.textMuted, marginTop: 12 }]}>
                    WORKSPACE PALETTE
                  </Text>
                  <View style={styles.colorSwatches}>
                    {PRESET_COLORS.map((preset) => {
                      const isSelected = themeColor === preset.id;
                      return (
                        <TouchableOpacity
                          key={preset.id}
                          style={[
                            styles.swatch,
                            {
                              backgroundColor: preset.primary,
                              borderColor: isSelected ? '#ffffff' : 'rgba(0,0,0,0.1)',
                              borderWidth: isSelected ? 3 : 1,
                            },
                          ]}
                          onPress={() => setThemeColor(preset.id)}
                        >
                          {isSelected && <Ionicons name="checkmark" size={14} color="#ffffff" />}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Sign Out Button matching cdash */}
                <TouchableOpacity
                  style={[styles.signOutBtn, { backgroundColor: colors.errorLight, borderColor: 'rgba(239, 68, 68, 0.3)' }]}
                  onPress={logout}
                >
                  <Ionicons name="log-out-outline" size={16} color={colors.error} />
                  <Text style={[styles.signOutBtnText, { color: colors.error }]}>Sign Out</Text>
                </TouchableOpacity>

                {/* Close Button */}
                <TouchableOpacity
                  style={[styles.closeBtn, { backgroundColor: colors.bgSurfaceSub, borderColor: colors.borderColor }]}
                  onPress={() => setIsProfileOpen(false)}
                >
                  <Text style={[styles.closeBtnText, { color: colors.textPrimary }]}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    maxHeight: '85%',
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLargeText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
  },
  profileUsername: {
    fontSize: 13,
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sectionCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  roleBtnGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  roleBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  statusList: {
    marginTop: 8,
    gap: 6,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 8,
    borderRadius: 10,
  },
  statusItemLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusItemDesc: {
    fontSize: 11,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
  },
  modePillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  colorSwatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 6,
    marginBottom: 8,
  },
  signOutBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  closeBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
