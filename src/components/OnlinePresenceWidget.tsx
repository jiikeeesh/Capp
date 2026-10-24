import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCdash } from '../context/CdashContext';
import { UserPresenceStatus, PresenceUser, Role } from '../types/cdash';
import { STATUS_OPTIONS } from '../data/cdashInitialData';

export const OnlinePresenceWidget: React.FC = () => {
  const {
    onlineUsers,
    offlineUsers,
    totalOnline,
    currentUser,
    colors,
    userStatus,
    setUserStatus,
    refreshData,
    isRefreshing,
  } = useCdash();

  const [isOfflineExpanded, setIsOfflineExpanded] = useState(false);

  // If currentUser is regular user, web hides it, but in mobile we can either hide or show self
  const isAdmin = currentUser.role === 'admin';
  const isMod = currentUser.role === 'moderator';

  const getStatusConfig = (status?: UserPresenceStatus, isOnline?: boolean) => {
    if (!isOnline || status === 'offline') {
      return {
        label: 'Offline',
        color: '#94a3b8',
        bg: 'rgba(148, 163, 184, 0.12)',
        borderColor: '#cbd5e1',
      };
    }

    switch (status) {
      case 'active':
        return {
          label: 'Active',
          color: '#10b981',
          bg: 'rgba(16, 185, 129, 0.12)',
          borderColor: '#10b981',
        };
      case 'away':
        return {
          label: 'Away',
          color: '#f59e0b',
          bg: 'rgba(245, 158, 11, 0.12)',
          borderColor: '#f59e0b',
        };
      case 'busy':
        return {
          label: 'Busy',
          color: '#ef4444',
          bg: 'rgba(239, 68, 68, 0.12)',
          borderColor: '#ef4444',
        };
      case 'dnd':
        return {
          label: 'DND',
          color: '#dc2626',
          bg: 'rgba(220, 38, 38, 0.12)',
          borderColor: '#dc2626',
        };
      case 'ooo':
        return {
          label: 'Out of Office',
          color: '#8b5cf6',
          bg: 'rgba(139, 92, 246, 0.12)',
          borderColor: '#8b5cf6',
        };
      default:
        return {
          label: 'Active',
          color: '#10b981',
          bg: 'rgba(16, 185, 129, 0.12)',
          borderColor: '#10b981',
        };
    }
  };

  const getRoleStyle = (role: Role | string) => {
    switch (role) {
      case 'admin':
        return {
          bg: 'rgba(239, 68, 68, 0.12)',
          text: '#ef4444',
          border: 'rgba(239, 68, 68, 0.3)',
        };
      case 'moderator':
        return {
          bg: 'rgba(139, 92, 246, 0.12)',
          text: '#8b5cf6',
          border: 'rgba(139, 92, 246, 0.3)',
        };
      case 'user':
      default:
        return {
          bg: 'rgba(59, 130, 246, 0.12)',
          text: '#3b82f6',
          border: 'rgba(59, 130, 246, 0.3)',
        };
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const effectiveTotalOnline =
    totalOnline > 0 ? totalOnline : onlineUsers.length;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.bgSurface,
          borderColor: colors.borderColor,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleCol}>
          <View style={styles.headerTitleRow}>
            <View style={[styles.iconBox, { backgroundColor: colors.successLight }]}>
              <Ionicons name="people" size={17} color={colors.success} />
            </View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Team Presence</Text>
          </View>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {isAdmin
              ? 'Real-time visibility into who is currently active in the workspace'
              : isMod
              ? `Showing online activity for members (${onlineUsers.length} active)`
              : 'Your workspace team activity'}
          </Text>
        </View>

        <View style={styles.headerActions}>
          {/* Active Now Pill */}
          <View style={[styles.pulseBadge, { backgroundColor: colors.successLight }]}>
            <View style={[styles.pulseDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.pulseText, { color: colors.success }]}>
              {effectiveTotalOnline} Active
            </Text>
          </View>

          {/* Quick Refresh Button */}
          <TouchableOpacity
            style={[styles.refreshIconBtn, { backgroundColor: colors.bgSurfaceSub, borderColor: colors.borderColor }]}
            onPress={refreshData}
            activeOpacity={0.7}
            disabled={isRefreshing}
          >
            <Ionicons
              name="refresh"
              size={14}
              color={isRefreshing ? colors.brand : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Status Bar for Current User */}
      <View style={[styles.myStatusContainer, { backgroundColor: colors.bgSurfaceSub, borderColor: colors.borderColor }]}>
        <Text style={[styles.myStatusLabel, { color: colors.textMuted }]}>My Status:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statusChipRow}
        >
          {STATUS_OPTIONS.map((opt) => {
            const isSelected = userStatus === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.statusChip,
                  {
                    backgroundColor: isSelected ? colors.bgSurface : 'transparent',
                    borderColor: isSelected ? opt.color : colors.borderColor,
                    borderWidth: isSelected ? 1.5 : 1,
                  },
                ]}
                onPress={() => setUserStatus(opt.id)}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 11 }}>{opt.emoji}</Text>
                <Text
                  style={[
                    styles.statusChipText,
                    {
                      color: isSelected ? colors.textPrimary : colors.textMuted,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {opt.badge}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Online Users List */}
      <View style={styles.membersSection}>
        {onlineUsers.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.bgSurfaceSub }]}>
            <Ionicons name="moon-outline" size={26} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              {isAdmin
                ? 'No team members are currently online'
                : 'None of your assigned users are currently active'}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
              When members log in or open the workspace, their live status will appear here in real time.
            </Text>
          </View>
        ) : (
          <View style={styles.onlineCardsList}>
            {onlineUsers.map((user: PresenceUser) => {
              const initials = getInitials(user.fullName);
              const statusCfg = getStatusConfig(user.status, user.isOnline);
              const roleCfg = getRoleStyle(user.role);
              const isMe = user.id === currentUser.id;

              return (
                <View
                  key={user.id}
                  style={[
                    styles.userCard,
                    {
                      backgroundColor: colors.bgSurface,
                      borderColor: statusCfg.borderColor,
                    },
                  ]}
                >
                  {/* Avatar with Status indicator */}
                  <View style={styles.avatarWrap}>
                    <View
                      style={[
                        styles.avatar,
                        {
                          backgroundColor: isMe ? colors.brand : colors.bgSurfaceSub,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.avatarText,
                          { color: isMe ? '#ffffff' : colors.textPrimary },
                        ]}
                      >
                        {initials}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusDotCorner,
                        {
                          backgroundColor: statusCfg.color,
                          borderColor: colors.bgSurface,
                        },
                      ]}
                    />
                  </View>

                  {/* User info */}
                  <View style={styles.userInfoCol}>
                    <View style={styles.nameRow}>
                      <Text
                        style={[styles.fullNameText, { color: colors.textPrimary }]}
                        numberOfLines={1}
                      >
                        {user.fullName}
                      </Text>
                      {isMe && (
                        <View style={[styles.youBadge, { backgroundColor: colors.brandLight }]}>
                          <Text style={[styles.youBadgeText, { color: colors.brand }]}>You</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.metaText, { color: colors.textMuted }]} numberOfLines={1}>
                      @{user.username} • {user.department || 'General'}
                    </Text>
                  </View>

                  {/* Role & Status badges */}
                  <View style={styles.badgeCol}>
                    <View
                      style={[
                        styles.roleBadge,
                        {
                          backgroundColor: roleCfg.bg,
                          borderColor: roleCfg.border,
                        },
                      ]}
                    >
                      <Text style={[styles.roleBadgeText, { color: roleCfg.text }]}>
                        {user.role.toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.statusIndicatorRow}>
                      <View
                        style={[styles.miniStatusDot, { backgroundColor: statusCfg.color }]}
                      />
                      <Text style={[styles.statusLabelText, { color: colors.textSecondary }]}>
                        {statusCfg.label}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Offline Members Accordion */}
        {offlineUsers.length > 0 && (
          <View style={styles.offlineSection}>
            <TouchableOpacity
              style={[
                styles.offlineToggle,
                {
                  backgroundColor: colors.bgSurfaceSub,
                  borderColor: colors.borderColor,
                },
              ]}
              onPress={() => setIsOfflineExpanded((prev) => !prev)}
              activeOpacity={0.8}
            >
              <View style={styles.offlineToggleLeft}>
                <Ionicons
                  name={isOfflineExpanded ? 'chevron-down' : 'chevron-forward'}
                  size={15}
                  color={colors.textMuted}
                />
                <Text style={[styles.offlineToggleText, { color: colors.textSecondary }]}>
                  Offline Members ({offlineUsers.length})
                </Text>
              </View>
              <Text style={[styles.offlineToggleHint, { color: colors.textMuted }]}>
                {isOfflineExpanded ? 'Tap to collapse' : 'Tap to view'}
              </Text>
            </TouchableOpacity>

            {isOfflineExpanded && (
              <View style={styles.offlineList}>
                {offlineUsers.map((user: PresenceUser) => {
                  const initials = getInitials(user.fullName);
                  return (
                    <View
                      key={user.id}
                      style={[
                        styles.offlineUserCard,
                        {
                          backgroundColor: colors.bgSurfaceSub,
                          borderColor: colors.borderColor,
                        },
                      ]}
                    >
                      <View style={styles.offlineAvatar}>
                        <Text style={[styles.offlineAvatarText, { color: colors.textMuted }]}>
                          {initials}
                        </Text>
                        <View
                          style={[
                            styles.offlineDot,
                            {
                              backgroundColor: '#94a3b8',
                              borderColor: colors.bgSurfaceSub,
                            },
                          ]}
                        />
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text
                          style={[styles.offlineName, { color: colors.textSecondary }]}
                          numberOfLines={1}
                        >
                          {user.fullName}
                        </Text>
                        <Text
                          style={[styles.offlineMeta, { color: colors.textMuted }]}
                          numberOfLines={1}
                        >
                          @{user.username} • {user.department || user.role}
                        </Text>
                      </View>
                      <Text style={[styles.offlineTag, { color: colors.textMuted }]}>Offline</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 12,
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  pulseText: {
    fontSize: 11,
    fontWeight: '700',
  },
  refreshIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  myStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
    gap: 8,
  },
  myStatusLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statusChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusChipText: {
    fontSize: 11,
  },
  membersSection: {
    gap: 10,
  },
  emptyBox: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
  emptyDesc: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  onlineCardsList: {
    gap: 10,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 12,
  },
  avatarWrap: {
    position: 'relative',
    flexShrink: 0,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusDotCorner: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  userInfoCol: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  fullNameText: {
    fontSize: 14,
    fontWeight: '700',
    flexShrink: 1,
  },
  youBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  youBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  metaText: {
    fontSize: 11,
  },
  badgeCol: {
    alignItems: 'flex-end',
    gap: 4,
    flexShrink: 0,
  },
  roleBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  statusIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabelText: {
    fontSize: 10,
    fontWeight: '600',
  },
  offlineSection: {
    marginTop: 6,
  },
  offlineToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  offlineToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  offlineToggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  offlineToggleHint: {
    fontSize: 10,
  },
  offlineList: {
    gap: 8,
    marginTop: 8,
  },
  offlineUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
    opacity: 0.85,
  },
  offlineAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#94a3b8',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  offlineAvatarText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  offlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 1.5,
  },
  offlineName: {
    fontSize: 13,
    fontWeight: '600',
  },
  offlineMeta: {
    fontSize: 10,
    marginTop: 1,
  },
  offlineTag: {
    fontSize: 10,
    fontWeight: '600',
  },
});
