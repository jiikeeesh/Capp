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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCdash } from '../context/CdashContext';
import { UserModal } from '../components/UserModal';
import { User, Role } from '../types/cdash';
import { STATUS_OPTIONS } from '../data/cdashInitialData';

export const UsersScreen: React.FC = () => {
  const { currentUser, users, colors, deleteUser, refreshData, isRefreshing } = useCdash();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [editUser, setEditUser] = useState<User | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const isAdmin = currentUser.role === 'admin';

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
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
  }, [users, roleFilter, search]);

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

  const getStatusColor = (status?: string) => {
    const opt = STATUS_OPTIONS.find((s) => s.id === status);
    return opt ? opt.color : '#94a3b8';
  };

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

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
      {/* Header */}
      <View style={[styles.screenHeader, { backgroundColor: colors.bgSurface, borderBottomColor: colors.borderColor }]}>
        <View>
          <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>Users & Team</Text>
          <Text style={[styles.screenSubtitle, { color: colors.textMuted }]}>
            {filteredUsers.length} member{filteredUsers.length !== 1 ? 's' : ''} in workspace
          </Text>
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

        {/* Role Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipRow}
        >
          {['all', 'admin', 'moderator', 'user'].map((r) => {
            const isSelected = roleFilter === r;
            return (
              <TouchableOpacity
                key={r}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? colors.brand : colors.bgSurface,
                    borderColor: isSelected ? colors.brand : colors.borderColor,
                  },
                ]}
                onPress={() => setRoleFilter(r)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: isSelected ? '#ffffff' : colors.textPrimary },
                  ]}
                >
                  {r === 'all' ? 'All Roles' : r.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* User Cards List */}
        {filteredUsers.map((user) => {
          const initials = user.fullName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
          const badge = roleBadgeStyle(user.role);
          const statusColor = getStatusColor(user.presenceStatus);
          const isMe = user.id === currentUser.id;

          return (
            <View
              key={user.id}
              style={[
                styles.userCard,
                { backgroundColor: colors.bgSurface, borderColor: colors.borderColor },
              ]}
            >
              <View style={styles.userCardTop}>
                {/* Avatar with Presence Dot */}
                <View style={styles.avatarWrapper}>
                  <View style={[styles.avatar, { backgroundColor: colors.brand }]}>
                    <Text style={styles.avatarText}>{initials}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: statusColor, borderColor: colors.bgSurface },
                    ]}
                  />
                </View>

                {/* Details */}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={styles.nameRow}>
                    <Text
                      style={[styles.fullName, { color: colors.textPrimary }]}
                      numberOfLines={1}
                    >
                      {user.fullName} {isMe ? '(You)' : ''}
                    </Text>
                    <View style={[styles.roleBadge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.roleBadgeText, { color: badge.text }]}>
                        {user.role.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.username, { color: colors.textMuted }]}>
                    @{user.username}
                  </Text>
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
        })}
      </ScrollView>

      {/* User Form Modal */}
      <UserModal
        visible={isAddUserOpen || !!editUser}
        userToEdit={editUser}
        onClose={() => {
          setIsAddUserOpen(false);
          setEditUser(null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  screenSubtitle: {
    fontSize: 11,
    marginTop: 2,
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
    fontSize: 12,
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  filterChipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  userCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  userCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
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
    gap: 8,
  },
  fullName: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  roleBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  username: {
    fontSize: 12,
    marginTop: 2,
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
