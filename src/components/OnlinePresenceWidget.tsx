import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCdash } from '../context/CdashContext';
import { UserPresenceStatus } from '../types/cdash';
import { STATUS_OPTIONS } from '../data/cdashInitialData';

export const OnlinePresenceWidget: React.FC = () => {
  const { users, currentUser, colors } = useCdash();

  // In cdash, only admin & moderator see this or users see team presence
  const onlineUsers = users.filter((u) => u.presenceStatus !== 'offline');

  const getStatusColor = (status?: UserPresenceStatus) => {
    const opt = STATUS_OPTIONS.find((s) => s.id === status);
    return opt ? opt.color : '#94a3b8';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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
      {/* Widget Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={[styles.iconBox, { backgroundColor: colors.successLight }]}>
            <Ionicons name="people" size={16} color={colors.success} />
          </View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Team Presence</Text>
        </View>
        <View style={[styles.countBadge, { backgroundColor: colors.successLight }]}>
          <View style={[styles.pulseDot, { backgroundColor: colors.success }]} />
          <Text style={[styles.countText, { color: colors.success }]}>
            {onlineUsers.length} Online
          </Text>
        </View>
      </View>

      {/* Horizontal Avatar List */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.avatarList}
      >
        {users.map((user) => {
          const initials = getInitials(user.fullName);
          const statusColor = getStatusColor(user.presenceStatus);
          const isMe = user.id === currentUser.id;

          return (
            <View key={user.id} style={styles.userItem}>
              <View style={styles.avatarWrapper}>
                <View style={[styles.avatar, { backgroundColor: isMe ? colors.brand : colors.bgSurfaceSub }]}>
                  <Text
                    style={[
                      styles.avatarText,
                      { color: isMe ? '#ffffff' : colors.textPrimary },
                    ]}
                  >
                    {initials}
                  </Text>
                </View>
                {/* Status Dot Indicator */}
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: statusColor,
                      borderColor: colors.bgSurface,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.userName,
                  { color: isMe ? colors.brand : colors.textPrimary },
                ]}
                numberOfLines={1}
              >
                {user.fullName.split(' ')[0]}
                {isMe ? ' (You)' : ''}
              </Text>
              <Text style={[styles.userDept, { color: colors.textMuted }]} numberOfLines={1}>
                {user.department || user.role}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
  },
  avatarList: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 4,
  },
  userItem: {
    alignItems: 'center',
    width: 64,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 6,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    borderWidth: 2,
  },
  userName: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
  },
  userDept: {
    fontSize: 9,
    textAlign: 'center',
    width: '100%',
    marginTop: 1,
  },
});
