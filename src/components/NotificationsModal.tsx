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
import { AppNotification } from '../types/cdash';

export const NotificationsModal: React.FC = () => {
  const {
    isNotifOpen,
    setIsNotifOpen,
    notifications,
    markAsRead,
    markAllAsRead,
    unreadCount,
    colors,
    setActiveTab,
  } = useCdash();

  if (!isNotifOpen) return null;

  const getIconForType = (type: AppNotification['type']) => {
    switch (type) {
      case 'task_assigned':
        return { name: 'checkbox' as const, bg: colors.brandLight, color: colors.brand };
      case 'task_updated':
        return { name: 'sync' as const, bg: colors.infoLight, color: colors.info };
      case 'request_pending':
        return { name: 'person-add' as const, bg: colors.warningLight, color: colors.warning };
      case 'request_resolved':
        return { name: 'checkmark-circle' as const, bg: colors.successLight, color: colors.success };
      default:
        return { name: 'information-circle' as const, bg: colors.bgSurfaceSub, color: colors.textSecondary };
    }
  };

  const handleNotificationPress = (notif: AppNotification) => {
    markAsRead(notif.id);
    if (notif.linkTab) {
      setActiveTab(notif.linkTab);
      setIsNotifOpen(false);
    }
  };

  return (
    <Modal
      visible={isNotifOpen}
      transparent
      animationType="fade"
      onRequestClose={() => setIsNotifOpen(false)}
    >
      <TouchableWithoutFeedback onPress={() => setIsNotifOpen(false)}>
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
              {/* Header */}
              <View style={[styles.header, { borderBottomColor: colors.borderColor }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={[styles.title, { color: colors.textPrimary }]}>Notifications</Text>
                  {unreadCount > 0 && (
                    <View style={[styles.unreadBadge, { backgroundColor: colors.error }]}>
                      <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                    </View>
                  )}
                </View>

                {unreadCount > 0 && (
                  <TouchableOpacity onPress={markAllAsRead} style={styles.markAllBtn}>
                    <Text style={[styles.markAllText, { color: colors.brand }]}>
                      Mark all as read
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Notification List */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {notifications.length === 0 ? (
                  <View style={styles.emptyWrap}>
                    <Ionicons name="notifications-off-outline" size={36} color={colors.textMuted} />
                    <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                      No notifications yet
                    </Text>
                    <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                      We will notify you about task updates and account activity.
                    </Text>
                  </View>
                ) : (
                  notifications.map((notif) => {
                    const iconConfig = getIconForType(notif.type);
                    return (
                      <TouchableOpacity
                        key={notif.id}
                        style={[
                          styles.notifItem,
                          {
                            backgroundColor: notif.isRead ? 'transparent' : colors.bgSurfaceSub,
                            borderColor: colors.borderColor,
                          },
                        ]}
                        activeOpacity={0.7}
                        onPress={() => handleNotificationPress(notif)}
                      >
                        <View style={[styles.iconWrap, { backgroundColor: iconConfig.bg }]}>
                          <Ionicons name={iconConfig.name} size={18} color={iconConfig.color} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={styles.notifTitleRow}>
                            <Text
                              style={[
                                styles.notifTitle,
                                {
                                  color: colors.textPrimary,
                                  fontWeight: notif.isRead ? '600' : '700',
                                },
                              ]}
                            >
                              {notif.title}
                            </Text>
                            {!notif.isRead && (
                              <View style={[styles.dot, { backgroundColor: colors.brand }]} />
                            )}
                          </View>
                          <Text style={[styles.notifMsg, { color: colors.textSecondary }]}>
                            {notif.message}
                          </Text>
                          <Text style={[styles.notifTime, { color: colors.textMuted }]}>
                            {new Date(notif.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>

              {/* Close Button */}
              <TouchableOpacity
                style={[
                  styles.closeBtn,
                  {
                    backgroundColor: colors.bgSurfaceSub,
                    borderColor: colors.borderColor,
                  },
                ]}
                onPress={() => setIsNotifOpen(false)}
              >
                <Text style={[styles.closeBtnText, { color: colors.textPrimary }]}>Close</Text>
              </TouchableOpacity>
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
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  unreadBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  markAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    gap: 10,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  notifTitle: {
    fontSize: 13,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  notifMsg: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
  notifTime: {
    fontSize: 10,
  },
  closeBtn: {
    marginHorizontal: 16,
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
