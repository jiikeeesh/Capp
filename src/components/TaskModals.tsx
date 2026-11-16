import React, { useState, useMemo } from 'react';
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
  ActivityIndicator,
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
  const { colors, currentUser, users, onlineUsers, addCommentToTask } = useCdash();

  const [commentText, setCommentText] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const onlineIds = useMemo(() => new Set(onlineUsers.map((o) => o.id)), [onlineUsers]);

  const notesList: string[] = useMemo(() => {
    if (!task || !task.notes) return [];
    if (Array.isArray(task.notes)) return task.notes;
    if (typeof task.notes === 'string' && task.notes.trim()) {
      try {
        const parsed = JSON.parse(task.notes);
        return Array.isArray(parsed) ? parsed : [task.notes];
      } catch {
        return [task.notes];
      }
    }
    return [];
  }, [task]);

  if (!task) return null;

  const assignees = users.filter((u) => task.assigneeIds.includes(u.id));
  const creator = users.find((u) => u.id === task.assignedById);
  const isRequested = task.status === 'requested';
  const canManage = currentUser.role !== 'user';
  const assignerName = task.assignedByName || creator?.fullName || 'Moderator';
  const assignerRole = task.assignedByRole || creator?.role || 'moderator';

  const handlePostComment = async () => {
    if (!commentText.trim()) return;
    setIsPosting(true);
    await addCommentToTask(task.id, commentText.trim());
    setCommentText('');
    setIsPosting(false);
  };

  const handleApproveRequest = async () => {
    setIsPosting(true);
    await addCommentToTask(task.id, 'Task request approved and scheduled by moderator', 'pending');
    setIsPosting(false);
    onClose();
  };

  const handleDeclineRequest = async () => {
    setIsPosting(true);
    await addCommentToTask(task.id, 'Task request declined by moderator', 'done');
    setIsPosting(false);
    onClose();
  };

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

              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
                {/* Task Request Action Banner for Moderators / Admins */}
                {isRequested && canManage && (
                  <View style={[styles.requestBannerAdmin, { backgroundColor: 'rgba(139, 92, 246, 0.08)', borderColor: 'rgba(139, 92, 246, 0.3)' }]}>
                    <View style={styles.requestBannerHeader}>
                      <Ionicons name="mail-unread" size={18} color="#8b5cf6" />
                      <Text style={[styles.requestBannerTitle, { color: colors.textPrimary }]}>Task Request from User</Text>
                    </View>
                    <Text style={[styles.requestBannerBody, { color: colors.textSecondary }]}>
                      This task was requested by <Text style={{ fontWeight: '700' }}>{assignees.map(a => a.fullName).join(', ') || 'user'}</Text>. You can approve and schedule it into team deliverables, or decline if not feasible.
                    </Text>
                    <View style={styles.requestBannerBtns}>
                      <TouchableOpacity
                        style={[styles.approveBtn, { backgroundColor: colors.brand }]}
                        onPress={handleApproveRequest}
                        disabled={isPosting}
                      >
                        <Ionicons name="checkmark" size={15} color="#ffffff" />
                        <Text style={styles.approveBtnText}>Approve Task</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.declineBtn, { borderColor: colors.error, backgroundColor: colors.errorLight }]}
                        onPress={handleDeclineRequest}
                        disabled={isPosting}
                      >
                        <Ionicons name="close" size={15} color={colors.error} />
                        <Text style={[styles.declineBtnText, { color: colors.error }]}>Decline</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Task Request Info Banner for Regular Users */}
                {isRequested && !canManage && (
                  <View style={[styles.requestBannerUser, { backgroundColor: 'rgba(139, 92, 246, 0.08)', borderColor: 'rgba(139, 92, 246, 0.25)' }]}>
                    <Ionicons name="hourglass-outline" size={20} color="#8b5cf6" />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.requestUserTitle, { color: colors.textPrimary }]}>Awaiting Moderator Review</Text>
                      <Text style={[styles.requestUserBody, { color: colors.textSecondary }]}>
                        Your task request was submitted to <Text style={{ fontWeight: '700' }}>{assignerName}</Text> and is waiting for approval.
                      </Text>
                    </View>
                  </View>
                )}

                {/* Status & Priority Row */}
                <View style={styles.metaRow}>
                  <View style={[styles.pill, { backgroundColor: colors.bgSurfaceSub }]}>
                    <Text style={[styles.pillLabel, { color: colors.textMuted }]}>Status:</Text>
                    <Text style={[styles.pillValue, { color: isRequested ? '#8b5cf6' : colors.brand }]}>
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

                {/* Due Date */}
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

                <View style={styles.section}>
                  <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>ASSIGNED BY / MODERATOR</Text>
                  <Text style={[styles.sectionContent, { color: colors.textPrimary }]}>
                    {assignerName} ({assignerRole})
                  </Text>
                </View>

                {/* Assignees */}
                <View style={styles.section}>
                  <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>ASSIGNEES</Text>
                  <View style={styles.assigneesWrap}>
                    {assignees.map((a) => {
                      const isOnline = onlineIds.has(a.id);
                      return (
                        <View
                          key={a.id}
                          style={[
                            styles.assigneeBadge,
                            {
                              backgroundColor: colors.bgSurfaceSub,
                              borderColor: isOnline ? colors.success : colors.borderColor,
                              borderWidth: isOnline ? 1 : 0,
                            },
                          ]}
                        >
                          <Ionicons
                            name="person-circle-outline"
                            size={16}
                            color={isOnline ? colors.success : colors.brand}
                          />
                          <Text style={[styles.assigneeText, { color: colors.textPrimary }]}>
                            {a.fullName}
                          </Text>
                          {isOnline && (
                            <View
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: colors.success,
                                marginLeft: 4,
                              }}
                            />
                          )}
                        </View>
                      );
                    })}
                  </View>
                </View>

                {/* Description */}
                {task.description ? (
                  <View style={styles.section}>
                    <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>DESCRIPTION</Text>
                    <Text style={[styles.descText, { color: colors.textSecondary }]}>{task.description}</Text>
                  </View>
                ) : null}

                {/* Comments & Notes Section */}
                <View style={[styles.section, { marginTop: 8 }]}>
                  <View style={styles.commentHeaderRow}>
                    <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>
                      COMMENTS & NOTES ({notesList.length})
                    </Text>
                  </View>

                  {notesList.length === 0 ? (
                    <View style={[styles.emptyCommentsBox, { backgroundColor: colors.bgSurfaceSub, borderColor: colors.borderColor }]}>
                      <Ionicons name="chatbubbles-outline" size={20} color={colors.textMuted} />
                      <Text style={[styles.emptyCommentsText, { color: colors.textMuted }]}>
                        No comments or progress notes yet.
                      </Text>
                    </View>
                  ) : (
                    <View style={{ gap: 8, marginTop: 4 }}>
                      {notesList.map((item, idx) => {
                        const match = item.match(/^\[(.*?)\s*-\s*(.*?)\]\s*(.*)$/);
                        const dateStr = match ? match[1] : '';
                        const author = match ? match[2] : 'Note';
                        const body = match ? match[3] : item;

                        return (
                          <View
                            key={idx}
                            style={[
                              styles.commentCard,
                              { backgroundColor: colors.bgSurfaceSub, borderColor: colors.borderColor },
                            ]}
                          >
                            <View style={styles.commentTop}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <View style={[styles.commentAvatar, { backgroundColor: colors.brandLight }]}>
                                  <Text style={[styles.commentAvatarText, { color: colors.brand }]}>
                                    {author.slice(0, 1).toUpperCase()}
                                  </Text>
                                </View>
                                <Text style={[styles.commentAuthor, { color: colors.textPrimary }]}>
                                  {author}
                                </Text>
                              </View>
                              {dateStr ? (
                                <Text style={[styles.commentDate, { color: colors.textMuted }]}>
                                  {dateStr}
                                </Text>
                              ) : null}
                            </View>
                            <Text style={[styles.commentBody, { color: colors.textSecondary }]}>
                              {body}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  )}

                  {/* Comment Input Box */}
                  <View style={[styles.commentInputRow, { backgroundColor: colors.bgSurfaceSub, borderColor: colors.borderColor }]}>
                    <TextInput
                      style={[styles.commentInput, { color: colors.textPrimary }]}
                      placeholder="Add a comment or update note..."
                      placeholderTextColor={colors.textMuted}
                      value={commentText}
                      onChangeText={setCommentText}
                      multiline
                    />
                    <TouchableOpacity
                      style={[
                        styles.postBtn,
                        {
                          backgroundColor: commentText.trim() ? colors.brand : 'transparent',
                          borderColor: commentText.trim() ? colors.brand : colors.borderColor,
                          borderWidth: commentText.trim() ? 0 : 1,
                        },
                      ]}
                      onPress={handlePostComment}
                      disabled={!commentText.trim() || isPosting}
                    >
                      {isPosting ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <Ionicons
                          name="send"
                          size={15}
                          color={commentText.trim() ? '#ffffff' : colors.textMuted}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
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

export interface TaskFormModalProps {
  visible: boolean;
  taskToEdit?: Task | null;
  isRequest?: boolean;
  initialDate?: string;
  onClose: () => void;
}

const TaskFormDialog: React.FC<{
  taskToEdit?: Task | null;
  isRequest?: boolean;
  initialDate?: string;
  onClose: () => void;
}> = ({ taskToEdit, isRequest, initialDate, onClose }) => {
  const { colors, currentUser, users, onlineUsers, addTask, updateTask } = useCdash();

  const isUser = currentUser.role === 'user';
  const isRequestMode = isRequest || (isUser && !taskToEdit);
  const moderators = users.filter((u) => u.role === 'moderator' || u.role === 'admin');
  const defaultModId =
    taskToEdit?.assignedById ||
    (currentUser.createdBy && moderators.some((m) => m.id === currentUser.createdBy)
      ? currentUser.createdBy
      : moderators[0]?.id || currentUser.id);

  const [selectedModerator, setSelectedModerator] = useState<string>(defaultModId);
  const onlineIds = useMemo(() => new Set(onlineUsers.map((o) => o.id)), [onlineUsers]);

  const [title, setTitle] = useState(taskToEdit ? taskToEdit.title : '');
  const [description, setDescription] = useState(taskToEdit ? taskToEdit.description : '');
  const [initialNote, setInitialNote] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(taskToEdit ? taskToEdit.priority : 'medium');
  const [status, setStatus] = useState<TaskStatus>(
    isRequestMode ? 'requested' : taskToEdit ? taskToEdit.status : 'pending'
  );
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(
    isRequestMode ? [currentUser.id] : taskToEdit ? taskToEdit.assigneeIds : [currentUser.id]
  );
  const [dueDate, setDueDate] = useState(() =>
    taskToEdit ? taskToEdit.dueDate : initialDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );

  // Assignable: Admins can assign anyone. Moderators can assign their own users and themselves.
  const assignableUsers = useMemo(() => {
    if (currentUser.role === 'admin') return users;
    if (currentUser.role === 'moderator') {
      return users.filter(
        (u) => u.id === currentUser.id || (u.role === 'user' && u.createdBy?.includes(currentUser.id))
      );
    }
    return [currentUser];
  }, [users, currentUser]);

  const toggleAssignee = (id: string) => {
    if (isRequestMode) return;
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
      const notesArray = isRequestMode
        ? [`[Task Requested on ${new Date().toLocaleDateString()}] ${initialNote.trim() || description.trim() || 'Task request submitted for moderator review.'}`]
        : initialNote.trim()
        ? [`[${new Date().toLocaleDateString()} - ${currentUser.fullName}] ${initialNote.trim()}`]
        : [];

      const targetAssignedById = isRequestMode ? selectedModerator : currentUser.id;
      const targetAssigneeIds = isRequestMode
        ? [currentUser.id]
        : selectedAssignees.length > 0
        ? selectedAssignees
        : [currentUser.id];

      const assignedMod = moderators.find((m) => m.id === targetAssignedById);

      addTask({
        title: title.trim(),
        description: description.trim(),
        assignedById: targetAssignedById,
        assignedByName: assignedMod?.fullName || currentUser.fullName,
        assignedByRole: assignedMod?.role || currentUser.role,
        priority,
        status: isRequestMode ? 'requested' : status,
        assigneeIds: targetAssigneeIds,
        dueDate,
        notes: notesArray,
        isRequest: isRequestMode,
      });
    }
    onClose();
  };

  return (
    <Modal visible={true} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={[styles.dialog, { backgroundColor: colors.bgSurface, borderColor: colors.borderColor }]}>
              <View style={styles.dialogHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.dialogTitle, { color: colors.textPrimary }]}>
                    {taskToEdit
                      ? 'Edit Task'
                      : isRequestMode
                      ? 'Request Task from Moderator'
                      : 'Assign New Task'}
                  </Text>
                  {isRequestMode && (
                    <Text style={{ fontSize: 11.5, color: colors.textMuted, marginTop: 2 }}>
                      Submit a task proposal for your moderator to review, schedule, and assign.
                    </Text>
                  )}
                </View>
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
                  placeholder={isRequestMode ? "e.g. Conduct client report review" : "e.g. Upgrade API Endpoints"}
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
                  placeholder="Provide task scope, goals, or requirements..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                />

                {/* Initial Comment / Note */}
                {!taskToEdit && (
                  <>
                    <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
                      {isRequestMode ? 'Proposal Note (Optional)' : 'Initial Comment / Note (Optional)'}
                    </Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          backgroundColor: colors.bgSurfaceSub,
                          borderColor: colors.borderColor,
                          color: colors.textPrimary,
                          height: 50,
                        },
                      ]}
                      value={initialNote}
                      onChangeText={setInitialNote}
                      placeholder={isRequestMode ? "Why is this task needed?" : "Add an initial update or instruction..."}
                      placeholderTextColor={colors.textMuted}
                      multiline
                    />
                  </>
                )}

                {/* Priority */}
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

                {/* Status (if editing and can manage) */}
                {taskToEdit && !isRequestMode && (
                  <>
                    <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Status</Text>
                    <View style={styles.pillGroup}>
                      {(['pending', 'in-progress', 'review', 'done', 'requested'] as TaskStatus[]).map((s) => {
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

                {/* If Regular User Requesting: Moderator Selection */}
                {isRequestMode ? (
                  <>
                    <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
                      Select Moderator to Request From *
                    </Text>
                    <View style={{ gap: 6, marginTop: 4 }}>
                      {moderators.length === 0 ? (
                        <Text style={{ fontSize: 12, color: colors.textMuted }}>No moderators available</Text>
                      ) : (
                        moderators.map((m) => {
                          const isSelected = selectedModerator === m.id;
                          const isCreator = currentUser.createdBy === m.id;
                          return (
                            <TouchableOpacity
                              key={m.id}
                              style={[
                                styles.assigneeRow,
                                {
                                  backgroundColor: isSelected ? colors.brandLight : colors.bgSurfaceSub,
                                  borderColor: isSelected ? colors.brand : colors.borderColor,
                                  borderWidth: isSelected ? 1.5 : 1,
                                },
                              ]}
                              onPress={() => setSelectedModerator(m.id)}
                            >
                              <Ionicons
                                name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                                size={18}
                                color={isSelected ? colors.brand : colors.textSecondary}
                              />
                              <Text style={[styles.assigneeRowText, { color: colors.textPrimary, flex: 1 }]}>
                                {m.fullName} ({m.role}) {isCreator ? '— (Assigned Moderator)' : ''}
                              </Text>
                            </TouchableOpacity>
                          );
                        })
                      )}
                    </View>
                    <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>
                      This request will be delivered to the selected moderator for review and calendar scheduling.
                    </Text>
                  </>
                ) : (
                  <>
                    {/* Assignees Selection for Admin/Moderator */}
                    <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Assign Team Members</Text>
                    <View style={styles.assigneeList}>
                      {assignableUsers.map((u) => {
                        const isSelected = selectedAssignees.includes(u.id);
                        const isOnline = onlineIds.has(u.id);
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
                            <Text style={[styles.assigneeRowText, { color: colors.textPrimary, flex: 1 }]}>
                              {u.fullName} ({u.role})
                            </Text>
                            {isOnline && (
                              <View style={[styles.onlineTag, { backgroundColor: colors.successLight }]}>
                                <View style={[styles.onlineDotMini, { backgroundColor: colors.success }]} />
                                <Text style={[styles.onlineTagText, { color: colors.success }]}>Online</Text>
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </>
                )}
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
                  <Text style={styles.btnPrimaryText}>
                    {isRequestMode ? 'Submit Task Request' : 'Save Task'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export const TaskFormModal: React.FC<TaskFormModalProps> = ({ visible, taskToEdit, isRequest, initialDate, onClose }) => {
  if (!visible) return null;
  return (
    <TaskFormDialog
      key={taskToEdit ? taskToEdit.id : (initialDate || 'new')}
      taskToEdit={taskToEdit}
      isRequest={isRequest}
      initialDate={initialDate}
      onClose={onClose}
    />
  );
};

interface StatusModalProps {
  task: Task | null;
  onClose: () => void;
}

const StatusDialog: React.FC<{ task: Task; onClose: () => void }> = ({ task, onClose }) => {
  const { colors, currentUser, addCommentToTask } = useCdash();

  const isUser = currentUser.role === 'user';
  const isRequested = task.status === 'requested';
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>(task.status);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statuses: { id: TaskStatus; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
    { id: 'pending', label: 'Pending', icon: 'time-outline', color: colors.warning },
    { id: 'in-progress', label: 'In Progress', icon: 'sync-outline', color: colors.info },
    { id: 'review', label: 'In Review', icon: 'eye-outline', color: '#8b5cf6' },
    { id: 'done', label: 'Completed', icon: 'checkmark-circle-outline', color: colors.success },
  ];

  if (task.status === 'requested') {
    statuses.unshift({
      id: 'requested',
      label: 'Requested',
      icon: 'mail-unread-outline',
      color: '#8b5cf6',
    });
  }

  const handleSaveProgress = async () => {
    setIsSubmitting(true);
    await addCommentToTask(task.id, commentText, isUser && isRequested ? 'requested' : selectedStatus);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal visible={!!task} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={[styles.dialog, { backgroundColor: colors.bgSurface, borderColor: colors.borderColor }]}>
              <View style={styles.dialogHeader}>
                <Text style={[styles.dialogTitle, { color: colors.textPrimary }]}>Update Progress & Status</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
                  <Ionicons name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.taskSubheading, { color: colors.textSecondary }]}>
                {task.title}
              </Text>

              {/* Status Selector Options */}
              <View style={{ gap: 8, marginVertical: 8 }}>
                {statuses.map((s) => {
                  const isCurrent = selectedStatus === s.id;
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
                      onPress={() => setSelectedStatus(s.id)}
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

              {/* Add Comment / Progress Note */}
              <Text style={[styles.inputLabel, { color: colors.textPrimary, marginTop: 6 }]}>
                Add a Progress Note / Comment
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.bgSurfaceSub,
                    borderColor: colors.borderColor,
                    color: colors.textPrimary,
                    height: 60,
                    textAlignVertical: 'top',
                    marginBottom: 14,
                  },
                ]}
                placeholder="Share your progress update, obstacle, or note..."
                placeholderTextColor={colors.textMuted}
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />

              <View style={[styles.dialogFooter, { borderTopColor: colors.borderColor, marginTop: 4, paddingTop: 10 }]}>
                <TouchableOpacity
                  style={[styles.btnOutline, { borderColor: colors.borderColor }]}
                  onPress={onClose}
                  disabled={isSubmitting}
                >
                  <Text style={[styles.btnOutlineText, { color: colors.textPrimary }]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btnPrimary, { backgroundColor: colors.brand, opacity: isSubmitting ? 0.7 : 1 }]}
                  onPress={handleSaveProgress}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.btnPrimaryText}>Save & Post</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export const StatusModal: React.FC<StatusModalProps> = ({ task, onClose }) => {
  if (!task) return null;
  return <StatusDialog key={task.id} task={task} onClose={onClose} />;
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
  requestBannerAdmin: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    gap: 8,
  },
  requestBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  requestBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  requestBannerBody: {
    fontSize: 12,
    lineHeight: 16,
  },
  requestBannerBtns: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  approveBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  declineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  declineBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  requestBannerUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  requestUserTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  requestUserBody: {
    fontSize: 11.5,
    lineHeight: 16,
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
  commentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  emptyCommentsBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
    marginVertical: 4,
  },
  emptyCommentsText: {
    fontSize: 12,
  },
  commentCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
  },
  commentTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarText: {
    fontSize: 10,
    fontWeight: '700',
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: '600',
  },
  commentDate: {
    fontSize: 10,
  },
  commentBody: {
    fontSize: 12.5,
    lineHeight: 17,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 10,
    gap: 8,
  },
  commentInput: {
    flex: 1,
    fontSize: 12.5,
    maxHeight: 70,
    paddingVertical: 4,
  },
  postBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
  onlineTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  onlineDotMini: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  onlineTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
