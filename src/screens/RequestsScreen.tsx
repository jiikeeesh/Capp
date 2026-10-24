import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCdash } from '../context/CdashContext';
import { NewRequestModal, RejectModal } from '../components/RequestModals';
import { AccountRequest, RequestStatus, Role } from '../types/cdash';

export const RequestsScreen: React.FC = () => {
  const { currentUser, requests, users, colors, approveRequest, rejectRequest } = useCdash();

  const [activeStatus, setActiveStatus] = useState<RequestStatus>('pending');
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [rejectingReq, setRejectingReq] = useState<AccountRequest | null>(null);

  const isAdmin = currentUser.role === 'admin';
  const isMod = currentUser.role === 'moderator';

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => r.status === activeStatus);
  }, [requests, activeStatus]);

  const handleApprove = (req: AccountRequest) => {
    Alert.alert(
      'Approve Account Request',
      `Approve account for ${req.fullName} (${req.email}) with role "${req.requestedRole}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Approve & Provision', onPress: () => approveRequest(req.id) },
      ]
    );
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

  const getRequesterName = (reqId: string) => {
    const u = users.find((user) => user.id === reqId);
    return u ? u.fullName : 'System';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
      {/* Header */}
      <View style={[styles.screenHeader, { backgroundColor: colors.bgSurface, borderBottomColor: colors.borderColor }]}>
        <View>
          <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>Account Requests</Text>
          <Text style={[styles.screenSubtitle, { color: colors.textMuted }]}>
            Review and provision accounts
          </Text>
        </View>

        {isMod && (
          <TouchableOpacity
            style={[styles.requestBtn, { backgroundColor: colors.brand }]}
            onPress={() => setIsNewRequestOpen(true)}
          >
            <Ionicons name="add" size={16} color="#ffffff" />
            <Text style={styles.requestBtnText}>Request Account</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Tabs */}
        <View style={[styles.tabBar, { backgroundColor: colors.bgSurface, borderColor: colors.borderColor }]}>
          {(['pending', 'approved', 'rejected'] as RequestStatus[]).map((st) => {
            const count = requests.filter((r) => r.status === st).length;
            const isSelected = activeStatus === st;
            return (
              <TouchableOpacity
                key={st}
                style={[
                  styles.tabItem,
                  {
                    backgroundColor: isSelected ? colors.brand : 'transparent',
                  },
                ]}
                onPress={() => setActiveStatus(st)}
              >
                <Text
                  style={[
                    styles.tabItemText,
                    { color: isSelected ? '#ffffff' : colors.textPrimary },
                  ]}
                >
                  {st.charAt(0).toUpperCase() + st.slice(1)} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.bgSurface, borderColor: colors.borderColor }]}>
            <Ionicons name="mail-outline" size={38} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              No {activeStatus} requests
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              {activeStatus === 'pending'
                ? 'All account creation requests have been resolved.'
                : `There are currently no ${activeStatus} requests.`}
            </Text>
          </View>
        ) : (
          filteredRequests.map((req) => {
            const badge = roleBadgeStyle(req.requestedRole);
            const requester = getRequesterName(req.requestedById);

            return (
              <View
                key={req.id}
                style={[
                  styles.reqCard,
                  { backgroundColor: colors.bgSurface, borderColor: colors.borderColor },
                ]}
              >
                {/* Header */}
                <View style={styles.reqCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.reqFullName, { color: colors.textPrimary }]}>
                      {req.fullName}
                    </Text>
                    <Text style={[styles.reqEmail, { color: colors.textSecondary }]}>
                      {req.email}
                    </Text>
                  </View>
                  <View style={[styles.roleBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.roleBadgeText, { color: badge.text }]}>
                      {req.requestedRole.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Department if present */}
                {req.department ? (
                  <View style={styles.deptRow}>
                    <Ionicons name="business-outline" size={13} color={colors.textMuted} />
                    <Text style={[styles.deptText, { color: colors.textSecondary }]}>
                      {req.department}
                    </Text>
                  </View>
                ) : null}

                {/* Reason Box */}
                <View style={[styles.reasonBox, { backgroundColor: colors.bgSurfaceSub }]}>
                  <Text style={[styles.reasonLabel, { color: colors.textMuted }]}>JUSTIFICATION</Text>
                  <Text style={[styles.reasonText, { color: colors.textPrimary }]}>{req.reason}</Text>
                </View>

                {/* Rejection reason if rejected */}
                {req.rejectionReason && (
                  <View style={[styles.rejectionBox, { backgroundColor: colors.errorLight }]}>
                    <Text style={[styles.rejectionLabel, { color: colors.error }]}>REJECTION REASON</Text>
                    <Text style={[styles.rejectionText, { color: colors.error }]}>
                      {req.rejectionReason}
                    </Text>
                  </View>
                )}

                {/* Footer metadata */}
                <View style={styles.footerRow}>
                  <Text style={[styles.footerText, { color: colors.textMuted }]}>
                    Requested by {requester} •{' '}
                    {new Date(req.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>

                {/* Admin Actions for Pending Requests */}
                {isAdmin && req.status === 'pending' && (
                  <View style={[styles.actionRow, { borderTopColor: colors.borderColor }]}>
                    <TouchableOpacity
                      style={[styles.rejectBtn, { backgroundColor: colors.errorLight }]}
                      onPress={() => setRejectingReq(req)}
                    >
                      <Ionicons name="close-circle-outline" size={16} color={colors.error} />
                      <Text style={[styles.rejectBtnText, { color: colors.error }]}>Reject</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.approveBtn, { backgroundColor: colors.success }]}
                      onPress={() => handleApprove(req)}
                    >
                      <Ionicons name="checkmark-circle-outline" size={16} color="#ffffff" />
                      <Text style={styles.approveBtnText}>Approve & Create</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Modals */}
      <NewRequestModal
        visible={isNewRequestOpen}
        onClose={() => setIsNewRequestOpen(false)}
      />

      <RejectModal
        request={rejectingReq}
        onClose={() => setRejectingReq(null)}
        onConfirm={(reason) => {
          if (rejectingReq) {
            rejectRequest(rejectingReq.id, reason);
          }
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
  requestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  requestBtnText: {
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
  tabBar: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  reqCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  reqCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  reqFullName: {
    fontSize: 15,
    fontWeight: '700',
  },
  reqEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  deptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  deptText: {
    fontSize: 12,
  },
  reasonBox: {
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  reasonLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 12,
    lineHeight: 16,
  },
  rejectionBox: {
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },
  rejectionLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  rejectionText: {
    fontSize: 12,
    lineHeight: 16,
  },
  footerRow: {
    marginTop: 10,
  },
  footerText: {
    fontSize: 11,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  rejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  rejectBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  approveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  approveBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});
