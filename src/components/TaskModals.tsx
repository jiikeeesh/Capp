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
import { Task, TaskStatus, TaskPriority } from '../types/cdash';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onUpdateStatus: (task: Task) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose, onUpdateStatus }) => {
  const { colors, users } = useCdash();

  if (!task) return null;

  const assignees = users.filter((u) => task.assigneeIds.includes(u.id));
  const creator = users.find((u) => u.id === task.assignedById);

  return (
    <Modal visible={!!task} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={[styles.dialog, { backgroundColor: colors.bgSurface, borderColor: colors.borderColor }]}>
              <View style={styles.dialogHeader}>
                <Text style={[styles.dialogTitle, { color: colors.textPrimary }]} numberOfLines={2}>
                  {task.title}
                </Text>
                <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
                  <Ionicons name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
                {/* Status & Priority Row */}
                <View style={styles.metaRow}>
                  <View style={[styles.pill, { backgroundColor: colors.bgSurfaceSub }]}>
                    <Text style={[styles.pillLabel, { color: colors.textMuted }]}>Status:</Text>
                    <Text style={[styles.pillValue, { color: colors.brand }]}>
                      {task.status.replace('-', ' ').toUpperCase()}
                    </Text>
                  </View>

                  <View style={[styles.pill, { backgroundColor: colors.bgSurfaceSub }]}>
                    <Text style={[styles.pillLabel, { color: colors.textMuted }]}>Priority:</Text>
                    <Text style={[styles.pillValue, { color: colors.warning }]}>
                      {task.priority.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Due Date & Creator */}
                <View style={styles.section}>
                  <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>DUE DATE</Text>
                  <Text style={[styles.sectionContent, { color: colors.textPrimary }]}>
                    {new Date(task.dueDate).toLocaleDateString([], {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                </View>

                {creator && (
                  <View style={styles.section}>
                    <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>ASSIGNED BY</Text>
                    <Text style={[styles.sectionContent, { color: colors.textPrimary }]}>
                      {creator.fullName} ({creator.role})
                    </Text>
                  </View>
                )}

                {/* Assignees */}
                <View style={styles.section}>
                  <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>ASSIGNEES</Text>
                  <View style={styles.assigneesWrap}>
                    {assignees.map((a) => (
                      <View key={a.id} style={[styles.assigneeBadge, { backgroundColor: colors.bgSurfaceSub }]}>
                        <Ionicons name="person-circle-outline" size={16} color={colors.brand} />
                        <Text style={[styles.assigneeText, { color: colors.textPrimary }]}>{a.fullName}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Description */}
                {task.description ? (
                  <View style={styles.section}>
                    <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>DESCRIPTION</Text>
                    <Text style={[styles.descText, { color: colors.textSecondary }]}>{task.description}</Text>
                  </View>
                ) : null}
              </ScrollView>

              {/* Footer Actions */}
              <View style={[styles.dialogFooter, { borderTopColor: colors.borderColor }]}>
                <TouchableOpacity
                  style={[styles.btnOutline, { borderColor: colors.borderColor }]}
                  onPress={onClose}
                >
                  <Text style={[styles.btnOutlineText, { color: colors.textPrimary }]}>Close</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btnPrimary, { backgroundColor: colors.brand }]}
                  onPress={() => {
                    onClose();
                    onUpdateStatus(task);
                  }}
                >
                  <Text style={styles.btnPrimaryText}>Update Status</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

interface TaskFormModalProps {
  visible: boolean;
  taskToEdit: Task | null;
  onClose: () => void;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({ visible, taskToEdit, onClose }) => {
  const { colors, currentUser, users, addTask, updateTask } = useCdash();

  const [title, setTitle] = useState(taskToEdit ? taskToEdit.title : '');
  const [description, setDescription] = useState(taskToEdit ? taskToEdit.description : '');
  const [priority, setPriority] = useState<TaskPriority>(taskToEdit ? taskToEdit.priority : 'medium');
  const [status, setStatus] = useState<TaskStatus>(taskToEdit ? taskToEdit.status : 'pending');
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(
    taskToEdit ? taskToEdit.assigneeIds : [currentUser.id]
  );
  const [dueDate, setDueDate] = useState(() =>
    taskToEdit ? taskToEdit.dueDate : new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );

  const toggleAssignee = (id: string) => {
    setSelectedAssignees((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    if (!title.trim()) return;

    if (taskToEdit) {
      updateTask(taskToEdit.id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        assigneeIds: selectedAssignees,
        dueDate,
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim(),
        assignedById: currentUser.id,
        priority,
        status,
        assigneeIds: selectedAssignees.length > 0 ? selectedAssignees : [currentUser.id],
        dueDate,
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
                  {taskToEdit ? 'Edit Task' : 'Assign New Task'}
                </Text>
                <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
                  <Ionicons name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
                {/* Title */}
                <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Task Title *</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: colors.bgSurfaceSub,
                      borderColor: colors.borderColor,
                      color: colors.textPrimary,
                    },
                  ]}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g. Upgrade API Endpoints"
                  placeholderTextColor={colors.textMuted}
                />

                {/* Description */}
                <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Description</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    styles.textArea,
                    {
                      backgroundColor: colors.bgSurfaceSub,
                      borderColor: colors.borderColor,
                      color: colors.textPrimary,
                    },
                  ]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Task details and deliverables..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                />

                {/* Priority Selection */}
                <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Priority</Text>
                <View style={styles.pillGroup}>
                  {(['low', 'medium', 'high', 'critical'] as TaskPriority[]).map((p) => {
                    const isSelected = priority === p;
                    return (
                      <TouchableOpacity
                        key={p}
                        style={[
                          styles.selectPill,
                          {
                            backgroundColor: isSelected ? colors.brand : colors.bgSurfaceSub,
                            borderColor: isSelected ? colors.brand : colors.borderColor,
                          },
                        ]}
                        onPress={() => setPriority(p)}
                      >
                        <Text
                          style={[
                            styles.selectPillText,
                            { color: isSelected ? '#ffffff' : colors.textPrimary },
                          ]}
                        >
                          {p.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Status Selection (If editing) */}
                {taskToEdit && (
                  <>
                    <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Status</Text>
                    <View style={styles.pillGroup}>
                      {(['pending', 'in-progress', 'review', 'done'] as TaskStatus[]).map((s) => {
                        const isSelected = status === s;
                        return (
                          <TouchableOpacity
                            key={s}
                            style={[
                              styles.selectPill,
                              {
                                backgroundColor: isSelected ? colors.brand : colors.bgSurfaceSub,
                                borderColor: isSelected ? colors.brand : colors.borderColor,
                              },
                            ]}
                            onPress={() => setStatus(s)}
                          >
                            <Text
                              style={[
                                styles.selectPillText,
                                { color: isSelected ? '#ffffff' : colors.textPrimary },
                              ]}
                            >
                              {s.replace('-', ' ').toUpperCase()}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </>
                )}

                {/* Due Date */}
                <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Due Date (YYYY-MM-DD)</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: colors.bgSurfaceSub,
                      borderColor: colors.borderColor,
                      color: colors.textPrimary,
                    },
                  ]}
                  value={dueDate}
                  onChangeText={setDueDate}
                  placeholder="2026-11-01"
                  placeholderTextColor={colors.textMuted}
                />

                {/* Assignees Selection */}
                <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Assign Team Members</Text>
                <View style={styles.assigneeList}>
                  {users.map((u) => {
                    const isSelected = selectedAssignees.includes(u.id);
                    return (
                      <TouchableOpacity
                        key={u.id}
                        style={[
                          styles.assigneeRow,
                          {
                            backgroundColor: isSelected ? colors.brandLight : colors.bgSurfaceSub,
                            borderColor: isSelected ? colors.brand : colors.borderColor,
                          },
                        ]}
                        onPress={() => toggleAssignee(u.id)}
                      >
                        <Ionicons
                          name={isSelected ? 'checkbox' : 'square-outline'}
                          size={18}
                          color={isSelected ? colors.brand : colors.textSecondary}
                        />
                        <Text style={[styles.assigneeRowText, { color: colors.textPrimary }]}>
                          {u.fullName} ({u.role})
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
                  <Text style={styles.btnPrimaryText}>Save Task</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

interface StatusModalProps {
  task: Task | null;
  onClose: () => void;
}

export const StatusModal: React.FC<StatusModalProps> = ({ task, onClose }) => {
  const { colors, updateTaskStatus } = useCdash();

  if (!task) return null;

  const statuses: { id: TaskStatus; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
    { id: 'pending', label: 'Pending', icon: 'time-outline', color: colors.warning },
    { id: 'in-progress', label: 'In Progress', icon: 'sync-outline', color: colors.info },
    { id: 'review', label: 'In Review', icon: 'eye-outline', color: '#8b5cf6' },
    { id: 'done', label: 'Completed', icon: 'checkmark-circle-outline', color: colors.success },
  ];

  return (
    <Modal visible={!!task} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={[styles.dialog, { backgroundColor: colors.bgSurface, borderColor: colors.borderColor }]}>
              <View style={styles.dialogHeader}>
                <Text style={[styles.dialogTitle, { color: colors.textPrimary }]}>Update Task Status</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
                  <Ionicons name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.taskSubheading, { color: colors.textSecondary }]}>
                {task.title}
              </Text>

              <View style={{ gap: 8, marginVertical: 12 }}>
                {statuses.map((s) => {
                  const isCurrent = task.status === s.id;
                  return (
                    <TouchableOpacity
                      key={s.id}
                      style={[
                        styles.statusOptionRow,
                        {
                          backgroundColor: isCurrent ? colors.bgSurfaceSub : 'transparent',
                          borderColor: isCurrent ? s.color : colors.borderColor,
                          borderWidth: isCurrent ? 2 : 1,
                        },
                      ]}
                      onPress={() => {
                        updateTaskStatus(task.id, s.id);
                        onClose();
                      }}
                    >
                      <Ionicons name={s.icon} size={20} color={s.color} />
                      <Text style={[styles.statusOptionText, { color: colors.textPrimary }]}>
                        {s.label}
                      </Text>
                      {isCurrent && <Ionicons name="checkmark" size={18} color={s.color} />}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={[styles.btnOutline, { borderColor: colors.borderColor, width: '100%' }]}
                onPress={onClose}
              >
                <Text style={[styles.btnOutlineText, { color: colors.textPrimary }]}>Cancel</Text>
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
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  pillLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  pillValue: {
    fontSize: 11,
    fontWeight: '700',
  },
  section: {
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  sectionContent: {
    fontSize: 13,
    fontWeight: '500',
  },
  assigneesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  assigneeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  assigneeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  descText: {
    fontSize: 13,
    lineHeight: 18,
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
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  selectPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  selectPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  assigneeList: {
    gap: 6,
    marginTop: 4,
  },
  assigneeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  assigneeRowText: {
    fontSize: 12,
    fontWeight: '500',
  },
  taskSubheading: {
    fontSize: 13,
    marginBottom: 8,
  },
  statusOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});
