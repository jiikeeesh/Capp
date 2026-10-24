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
import { User, Role } from '../types/cdash';

interface UserModalProps {
  visible: boolean;
  userToEdit: User | null;
  onClose: () => void;
}

export const UserModal: React.FC<UserModalProps> = ({ visible, userToEdit, onClose }) => {
  const { colors, currentUser, addUser, updateUser } = useCdash();

  const [fullName, setFullName] = useState(userToEdit ? userToEdit.fullName : '');
  const [username, setUsername] = useState(userToEdit ? userToEdit.username : '');
  const [email, setEmail] = useState(userToEdit ? userToEdit.email : '');
  const [department, setDepartment] = useState(userToEdit ? userToEdit.department : '');
  const [phone, setPhone] = useState(userToEdit ? userToEdit.phone || '' : '');
  const [role, setRole] = useState<Role>(userToEdit ? userToEdit.role : 'user');

  const handleSave = () => {
    if (!fullName.trim() || !username.trim() || !email.trim()) return;

    if (userToEdit) {
      updateUser(userToEdit.id, {
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        department: department.trim(),
        phone: phone.trim(),
        role,
      });
    } else {
      addUser({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        department: department.trim(),
        phone: phone.trim(),
        role,
        createdBy: currentUser.id,
      });
    }
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={[styles.dialog, { backgroundColor: colors.bgSurface, borderColor: colors.borderColor }]}>
              <View style={styles.dialogHeader}>
                <Text style={[styles.dialogTitle, { color: colors.textPrimary }]}>
                  {userToEdit ? 'Edit User' : 'Add New User'}
                </Text>
                <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
                  <Ionicons name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
                {/* Full Name */}
                <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Full Name *</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: colors.bgSurfaceSub,
                      borderColor: colors.borderColor,
                      color: colors.textPrimary,
                    },
                  ]}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="e.g. Elena Rostova"
                  placeholderTextColor={colors.textMuted}
                />

                {/* Username */}
                <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Username *</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: colors.bgSurfaceSub,
                      borderColor: colors.borderColor,
                      color: colors.textPrimary,
                    },
                  ]}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="e.g. elena_r"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                />

                {/* Email */}
                <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Email Address *</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: colors.bgSurfaceSub,
                      borderColor: colors.borderColor,
                      color: colors.textPrimary,
                    },
                  ]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="elena@company.com"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                {/* Department */}
                <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Department</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: colors.bgSurfaceSub,
                      borderColor: colors.borderColor,
                      color: colors.textPrimary,
                    },
                  ]}
                  value={department}
                  onChangeText={setDepartment}
                  placeholder="e.g. Engineering, Design, Operations"
                  placeholderTextColor={colors.textMuted}
                />

                {/* Phone */}
                <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Phone</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: colors.bgSurfaceSub,
                      borderColor: colors.borderColor,
                      color: colors.textPrimary,
                    },
                  ]}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+1 555 0192"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                />

                {/* Role selection */}
                <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Account Role</Text>
                <View style={styles.pillGroup}>
                  {(['user', 'moderator', 'admin'] as Role[]).map((r) => {
                    const isSelected = role === r;
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
                        onPress={() => setRole(r)}
                      >
                        <Text
                          style={[
                            styles.selectPillText,
                            { color: isSelected ? '#ffffff' : colors.textPrimary },
                          ]}
                        >
                          {r.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              <View style={[styles.dialogFooter, { borderTopColor: colors.borderColor }]}>
                <TouchableOpacity
                  style={[styles.btnOutline, { borderColor: colors.borderColor }]}
                  onPress={onClose}
                >
                  <Text style={[styles.btnOutlineText, { color: colors.textPrimary }]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btnPrimary, { backgroundColor: colors.brand }]}
                  onPress={handleSave}
                >
                  <Text style={styles.btnPrimaryText}>Save User</Text>
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
