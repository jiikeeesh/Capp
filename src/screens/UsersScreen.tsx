import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCdash } from '../context/CdashContext';
import { UserModal } from '../components/UserModal';
import { User, Role, UserPresenceStatus, PresenceUser } from '../types/cdash';

export const UsersScreen: React.FC = () => {
  const {
    currentUser,
    users,
    onlineUsers,
    totalOnline,
    userStatus,
    colors,
    deleteUser,
    refreshData,
    isRefreshing,
  } = useCdash();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [editUser, setEditUser] = useState<User | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const isAdmin = currentUser.role === 'admin';

  // Map of online user ids to presence data
  const onlineMap = useMemo(() => {
    const map = new Map<string, PresenceUser>();
    for (const u of onlineUsers) {
      map.set(u.id, u);
    }
    return map;
  }, [onlineUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter === 'online') {
        const isOnline = onlineMap.has(u.id) || (u.id === currentUser.id);
        if (!isOnline) return false;
      } else if (roleFilter !== 'all' && u.role !== roleFilter) {
        return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          u.fullName.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.department && u.department.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [users, roleFilter, search, onlineMap, currentUser.id]);

  const handleDelete = (user: User) => {
    if (user.id === currentUser.id) {
      Alert.alert('Cannot Delete', 'You cannot delete your own account.');
      return;
    }

    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${user.fullName} (@${user.username})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteUser(user.id) },
      ]
    );
  };

  const getStatusConfig = (
    isOnline: boolean,
    status?: UserPresenceStatus,
    isFirstLogin?: boolean
  ) => {
    if (!isOnline) {
      if (isFirstLogin) {
        return {
          label: 'Setup',
          color: colors.warning,
          bg: colors.warningLight,
          borderColor: colors.warning,
          dotColor: colors.warning,
        };
      }
      return {
        label: 'Offline',
        color: '#94a3b8',
        bg: 'rgba(148, 163, 184, 0.1)',
        borderColor: colors.borderColor,
        dotColor: '#94a3b8',
      };
    }

    switch (status) {
      case 'active':
        return {
          label: 'Active',
          color: '#10b981',
          bg: 'rgba(16, 185, 129, 0.12)',
          borderColor: '#10b981',
          dotColor: '#10b981',
        };
      case 'away':
        return {
          label: 'Away',
          color: '#f59e0b',
          bg: 'rgba(245, 158, 11, 0.12)',
          borderColor: '#f59e0b',
          dotColor: '#f59e0b',
        };
      case 'busy':
        return {
          label: 'Busy',
          color: '#ef4444',
          bg: 'rgba(239, 68, 68, 0.12)',
          borderColor: '#ef4444',
          dotColor: '#ef4444',
        };
      case 'dnd':
        return {
          label: 'DND',
          color: '#dc2626',
          bg: 'rgba(220, 38, 38, 0.12)',
          borderColor: '#dc2626',
          dotColor: '#dc2626',
        };
      case 'ooo':
        return {
          label: 'Out of Office',
          color: '#8b5cf6',
          bg: 'rgba(139, 92, 246, 0.12)',
          borderColor: '#8b5cf6',
          dotColor: '#8b5cf6',
        };
      default:
        return {
          label: 'Active',
          color: '#10b981',
          bg: 'rgba(16, 185, 129, 0.12)',
          borderColor: '#10b981',
          dotColor: '#10b981',
        };
    }
  };

  const roleBadgeStyle = (role: Role) => {
    switch (role) {
      case 'admin':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' };
      case 'moderator':
        return { bg: 'rgba(139, 92, 246, 0.15)', text: '#8b5cf6', border: 'rgba(139, 92, 246, 0.3)' };
      case 'user':
      default:
        return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' };
    }
  };

  const effectiveOnlineCount = totalOnline > 0 ? totalOnline : onlineUsers.length;

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
      {/* Header */}
      <View style={[styles.screenHeader, { backgroundColor: colors.bgSurface, borderBottomColor: colors.borderColor }]}>
        <View>
          <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>Users & Team</Text>
          <View style={styles.headerSubtitleRow}>
            <View style={[styles.pulseDotSmall, { backgroundColor: colors.success }]} />
            <Text style={[styles.screenSubtitle, { color: colors.textMuted }]}>
              {effectiveOnlineCount} online • {filteredUsers.length} member{filteredUsers.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {isAdmin && (
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.brand }]}
            onPress={() => setIsAddUserOpen(true)}
          >
            <Ionicons name="person-add" size={15} color="#ffffff" />
            <Text style={styles.addBtnText}>Add User</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshData}
            tintColor={colors.brand}
            colors={[colors.brand]}
          />
        }
      >
        {/* Search */}
        <View style={[styles.searchBox, { backgroundColor: colors.bgSurface, borderColor: colors.borderColor }]}>
          <Ionicons name="search-outline" size={16} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search by name, email, or department..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Role & Status Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipRow}
        >
          {[
            { id: 'all', label: 'All Members' },
            { id: 'online', label: `🟢 Online (${effectiveOnlineCount})` },
            { id: 'admin', label: 'Admins' },
            { id: 'moderator', label: 'Moderators' },
            { id: 'user', label: 'Users' },
          ].map((item) => {
            const isSelected = roleFilter === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? colors.brand : colors.bgSurface,
                    borderColor: isSelected ? colors.brand : colors.borderColor,
                  },
                ]}
                onPress={() => setRoleFilter(item.id)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: isSelected ? '#ffffff' : colors.textPrimary },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* User Cards List */}
        {filteredUsers.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.bgSurface, borderColor: colors.borderColor }]}>
            <Ionicons name="people-outline" size={32} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No team members found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              {roleFilter === 'online'
                ? 'No team members are currently online.'
                : 'Try adjusting your search or filters.'}
            </Text>
          </View>
        ) : (
          filteredUsers.map((user) => {
            const initials = user.fullName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);
            const badge = roleBadgeStyle(user.role);
            const isMe = user.id === currentUser.id;

            // Live presence detection
            const isOnline = onlineMap.has(user.id) || isMe;
            const presence = onlineMap.get(user.id);
            const userStatusType: UserPresenceStatus =
              presence?.status || (isMe ? userStatus : 'active');
            const statusCfg = getStatusConfig(isOnline, userStatusType, user.isFirstLogin);

            return (
              <View
                key={user.id}
                style={[
                  styles.userCard,
                  {
                    backgroundColor: colors.bgSurface,
                    borderColor: isOnline ? statusCfg.borderColor : colors.borderColor,
                    borderWidth: isOnline ? 1.5 : 1,
                  },
                ]}
              >
                <View style={styles.userCardTop}>
                  {/* Avatar with Live Presence Dot */}
                  <View style={styles.avatarWrapper}>
                    <View
                      style={[
                        styles.avatar,
                        {
                          backgroundColor: isMe ? colors.brand : colors.bgSurfaceSub,
                          opacity: isOnline ? 1 : 0.75,
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
                        styles.statusDot,
                        {
                          backgroundColor: statusCfg.dotColor,
                          borderColor: colors.bgSurface,
                        },
                      ]}
                    />
                  </View>

                  {/* Name and Username */}
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={styles.nameRow}>
                      <Text
                        style={[styles.fullName, { color: colors.textPrimary }]}
                        numberOfLines={1}
                      >
                        {user.fullName} {isMe ? '(You)' : ''}
                      </Text>

                      {/* Live Status Chip Badge */}
                      <View
                        style={[
                          styles.statusChipBadge,
                          {
                            backgroundColor: statusCfg.bg,
                            borderColor: statusCfg.borderColor,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.statusChipDot,
                            { backgroundColor: statusCfg.dotColor },
                          ]}
                        />
                        <Text
                          style={[
                            styles.statusChipText,
                            { color: statusCfg.color },
                          ]}
                        >
                          {statusCfg.label}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.metaRow}>
                      <Text style={[styles.username, { color: colors.textMuted }]}>
                        @{user.username}
                      </Text>
                      <View
                        style={[
                          styles.roleBadge,
                          { backgroundColor: badge.bg, borderColor: badge.border },
                        ]}
                      >
                        <Text style={[styles.roleBadgeText, { color: badge.text }]}>
                          {user.role.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Sub details */}
                <View style={styles.cardDetails}>
                  <View style={styles.cardDetailRow}>
                    <Ionicons name="mail-outline" size={13} color={colors.textMuted} />
                    <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                      {user.email}
                    </Text>
                  </View>
                  {user.department ? (
                    <View style={styles.cardDetailRow}>
                      <Ionicons name="business-outline" size={13} color={colors.textMuted} />
                      <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                        {user.department}
                      </Text>
                    </View>
                  ) : null}
                  {user.phone ? (
                    <View style={styles.cardDetailRow}>
                      <Ionicons name="call-outline" size={13} color={colors.textMuted} />
                      <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                        {user.phone}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Action Buttons (Admin) */}
                {isAdmin && (
                  <View style={[styles.cardActions, { borderTopColor: colors.borderColor }]}>
                    <TouchableOpacity
                      style={[styles.cardActionBtn, { backgroundColor: colors.bgSurfaceSub }]}
                      onPress={() => setEditUser(user)}
                    >
                      <Ionicons name="pencil-outline" size={14} color={colors.brand} />
                      <Text style={[styles.cardActionText, { color: colors.brand }]}>Edit</Text>
                    </TouchableOpacity>

                    {!isMe && (
                      <TouchableOpacity
                        style={[styles.cardActionBtn, { backgroundColor: colors.errorLight }]}
                        onPress={() => handleDelete(user)}
                      >
                        <Ionicons name="trash-outline" size={14} color={colors.error} />
                        <Text style={[styles.cardActionText, { color: colors.error }]}>Delete</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Edit / Add User Modal */}
      {(isAddUserOpen || editUser) && (
        <UserModal
          visible={isAddUserOpen || !!editUser}
          userToEdit={editUser}
          onClose={() => {
            setIsAddUserOpen(false);
            setEditUser(null);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  pulseDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  screenSubtitle: {
    fontSize: 12,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  filterChipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyCard: {
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  userCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
      },
      android: {
        elevation: 1.5,
      },
    }),
  },
  userCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrapper: {
    position: 'relative',
    flexShrink: 0,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
  },
  statusDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  fullName: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  statusChipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusChipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 5,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  username: {
    fontSize: 12,
  },
  cardDetails: {
    marginTop: 10,
    gap: 4,
  },
  cardDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  cardActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  cardActionText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
