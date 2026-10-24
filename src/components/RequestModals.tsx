import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCdash } from '../context/CdashContext';
import { AccountRequest, Role } from '../types/cdash';

interface NewRequestModalProps {
  visible: boolean;
  onClose: () => void;
}

export const NewRequestModal: React.FC<NewRequestModalProps> = ({ visible, onClose }) => {
  const { colors, currentUser, addRequest } = useCdash();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [requestedRole, setRequestedRole] = useState<Role>('user');
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (!fullName.trim() || !email.trim() || !reason.trim()) return;

    addRequest({
      requestedById: currentUser.id,
      requestedRole,
      fullName: fullName.trim(),
      email: email.trim(),
      department: department.trim(),
      reason: reason.trim(),
    });

    onClose();
    setFullName('');
    setEmail('');
    setDepartment('');
    setReason('');
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={[styles.dialog, { backgroundColor: colors.bgSurface, borderColor: colors.borderColor }]}>
              <View style={styles.dialogHeader}>
                <Text style={[styles.dialogTitle, { color: colors.textPrimary }]}>Request New Account</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
                  <Ionicons name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
                <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Applicant Full Name *</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.bgSurfaceSub, borderColor: colors.borderColor, color: colors.textPrimary }]}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="e.g. Sophia Chen"
                  placeholderTextColor={colors.textMuted}
                />

                <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Applicant Email *</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.bgSurfaceSub, borderColor: colors.borderColor, color: colors.textPrimary }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="sophia@company.com"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Department</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.bgSurfaceSub, borderColor: colors.borderColor, color: colors.textPrimary }]}
                  value={department}
                  onChangeText={setDepartment}
                  placeholder="e.g. Engineering, Sales"
                  placeholderTextColor={colors.textMuted}
                />

                <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Requested Role</Text>
                <View style={styles.pillGroup}>
                  {(['user', 'moderator'] as Role[]).map((r) => {
                    const isSelected = requestedRole === r;
                    return (
                      <TouchableOpacity
                        key={r}
                        style={[
                          styles.selectPill,
                          {
                            backgroundColor: isSelected ? colors.brand : colors.bgSurfaceSub,
                            borderColor: isSelected ? colors.brand : colors.borderColor,
                          },
                        ]}
                        onPress={() => setRequestedRole(r)}
                      >
                        <Text style={[styles.selectPillText, { color: isSelected ? '#ffffff' : colors.textPrimary }]}>
                          {r.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Business Justification / Reason *</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea, { backgroundColor: colors.bgSurfaceSub, borderColor: colors.borderColor, color: colors.textPrimary }]}
                  value={reason}
                  onChangeText={setReason}
                  placeholder="Why is this account required and what permissions are needed?"
                  placeholderTextColor={colors.textMuted}
                  multiline
                />
              </ScrollView>

              <View style={[styles.dialogFooter, { borderTopColor: colors.borderColor }]}>
                <TouchableOpacity style={[styles.btnOutline, { borderColor: colors.borderColor }]} onPress={onClose}>
                  <Text style={[styles.btnOutlineText, { color: colors.textPrimary }]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: colors.brand }]} onPress={handleSubmit}>
                  <Text style={styles.btnPrimaryText}>Submit Request</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

interface RejectModalProps {
  request: AccountRequest | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const REJECT_PRESETS = [
  'Incomplete applicant details or invalid company email address',
  'Position or department headcount quota has been reached',
  'Requires direct authorization from department head before provisioning',
  'Duplicate request — account already exists or in progress',
  'Account role or permission level requested is not authorized',
];

export const RejectModal: React.FC<RejectModalProps> = ({ request, onClose, onConfirm }) => {
  const { colors } = useCdash();
  const [reason, setReason] = useState('');

  if (!request) return null;

  return (
    <Modal visible={!!request} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={[styles.dialog, { backgroundColor: colors.bgSurface, borderColor: colors.borderColor }]}>
              <View style={styles.dialogHeader}>
                <Text style={[styles.dialogTitle, { color: colors.error }]}>Reject Account Request</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
                  <Ionicons name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 12 }}>
                Provide a reason for rejecting the request for {request.fullName}:
              </Text>

              {/* Presets */}
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>PRESET REASONS</Text>
              <ScrollView style={{ maxHeight: 120, marginBottom: 10 }}>
                {REJECT_PRESETS.map((preset, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.presetItem, { backgroundColor: colors.bgSurfaceSub }]}
                    onPress={() => setReason(preset)}
                  >
                    <Text style={[styles.presetText, { color: colors.textPrimary }]} numberOfLines={2}>
                      • {preset}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TextInput
                style={[styles.textInput, styles.textArea, { backgroundColor: colors.bgSurfaceSub, borderColor: colors.borderColor, color: colors.textPrimary }]}
                value={reason}
                onChangeText={setReason}
                placeholder="Enter rejection rationale..."
                placeholderTextColor={colors.textMuted}
                multiline
              />

              <View style={[styles.dialogFooter, { borderTopColor: colors.borderColor }]}>
                <TouchableOpacity style={[styles.btnOutline, { borderColor: colors.borderColor }]} onPress={onClose}>
                  <Text style={[styles.btnOutlineText, { color: colors.textPrimary }]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btnPrimary, { backgroundColor: colors.error }]}
                  onPress={() => {
                    if (reason.trim()) {
                      onConfirm(reason.trim());
                      onClose();
                    }
                  }}
                >
                  <Text style={styles.btnPrimaryText}>Confirm Rejection</Text>
                </TouchableOpacity>
              </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dialogTitle: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  closeIcon: {
    padding: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 4,
  },
  textInput: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  pillGroup: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  selectPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  selectPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  presetItem: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  presetText: {
    fontSize: 11,
    lineHeight: 15,
  },
  dialogFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  btnOutline: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutlineText: {
    fontSize: 13,
    fontWeight: '600',
  },
  btnPrimary: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
});
