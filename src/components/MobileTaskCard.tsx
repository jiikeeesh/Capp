import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCdash } from '../context/CdashContext';
import { Task, TaskStatus, TaskPriority } from '../types/cdash';

interface MobileTaskCardProps {
  task: Task;
  onViewDetails?: (task: Task) => void;
  onUpdateStatus?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  showActions?: boolean;
}

export const MobileTaskCard: React.FC<MobileTaskCardProps> = ({
  task,
  onViewDetails,
  onUpdateStatus,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  const { colors, currentUser } = useCdash();

  const isAdmin = currentUser.role === 'admin';
  const isMod = currentUser.role === 'moderator';
  const canManage = isAdmin || isMod;

  // Status Chip config
  const getStatusChip = (status: TaskStatus) => {
    switch (status) {
      case 'pending':
        return {
          icon: 'time-outline' as const,
          label: 'Pending',
          bg: colors.warningLight,
          color: colors.warning,
        };
      case 'in-progress':
        return {
          icon: 'sync-outline' as const,
          label: 'In Progress',
          bg: colors.infoLight,
          color: colors.info,
        };
      case 'review':
        return {
          icon: 'eye-outline' as const,
          label: 'In Review',
          bg: 'rgba(139, 92, 246, 0.15)',
          color: '#8b5cf6',
        };
      case 'done':
        return {
          icon: 'checkmark-circle-outline' as const,
          label: 'Completed',
          bg: colors.successLight,
          color: colors.success,
        };
    }
  };

  // Priority Chip config
  const getPriorityChip = (priority: TaskPriority) => {
    switch (priority) {
      case 'critical':
        return {
          icon: 'flash-outline' as const,
          label: 'Critical',
          bg: colors.errorLight,
          color: colors.error,
        };
      case 'high':
        return {
          icon: 'arrow-up-outline' as const,
          label: 'High',
          bg: colors.warningLight,
          color: colors.warning,
        };
      case 'medium':
        return {
          icon: 'radio-button-on-outline' as const,
          label: 'Medium',
          bg: colors.infoLight,
          color: colors.info,
        };
      case 'low':
        return {
          icon: 'arrow-down-outline' as const,
          label: 'Low',
          bg: colors.chipBg,
          color: colors.textMuted,
        };
    }
  };

  const statusConfig = getStatusChip(task.status);
  const priorityConfig = getPriorityChip(task.priority);

  // Formatted date
  const dueDateStr = new Date(task.dueDate).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });

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
      {/* Header: Title + Status Chip */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
          {task.title}
        </Text>
        <View style={[styles.chip, { backgroundColor: statusConfig.bg }]}>
          <Ionicons name={statusConfig.icon} size={12} color={statusConfig.color} />
          <Text style={[styles.chipText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {/* Description preview if present */}
      {task.description ? (
        <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
          {task.description}
        </Text>
      ) : null}

      {/* Details as Icon Chips */}
      <View style={styles.detailsBar}>
        {/* Priority Chip */}
        <View style={[styles.chip, { backgroundColor: priorityConfig.bg }]}>
          <Ionicons name={priorityConfig.icon} size={12} color={priorityConfig.color} />
          <Text style={[styles.chipText, { color: priorityConfig.color }]}>
            {priorityConfig.label}
          </Text>
        </View>

        {/* Due Date Chip */}
        <View style={[styles.chip, { backgroundColor: colors.chipBg }]}>
          <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
          <Text style={[styles.chipText, { color: colors.textSecondary }]}>{dueDateStr}</Text>
        </View>

        {/* Assignee Count Chip */}
        {task.assigneeIds && task.assigneeIds.length > 0 && (
          <View style={[styles.chip, { backgroundColor: colors.chipBg }]}>
            <Ionicons name="person-outline" size={12} color={colors.textSecondary} />
            <Text style={[styles.chipText, { color: colors.textSecondary }]}>
              {task.assigneeIds.length}
            </Text>
          </View>
        )}
      </View>

      {/* Mobile Action Buttons Bar */}
      {showActions && (
        <View style={[styles.actionsBar, { borderTopColor: colors.borderColor }]}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.bgSurfaceSub }]}
            onPress={() => onViewDetails && onViewDetails(task)}
            accessibilityLabel="View details"
          >
            <Ionicons name="eye-outline" size={15} color={colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.bgSurfaceSub }]}
            onPress={() => onUpdateStatus && onUpdateStatus(task)}
            accessibilityLabel="Update status"
          >
            <Ionicons name="checkbox-outline" size={15} color={colors.info} />
          </TouchableOpacity>

          {canManage && onEdit && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.bgSurfaceSub }]}
              onPress={() => onEdit(task)}
              accessibilityLabel="Edit task"
            >
              <Ionicons name="pencil-outline" size={15} color={colors.brand} />
            </TouchableOpacity>
          )}

          {(isAdmin || task.assignedById === currentUser.id) && onDelete && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.errorLight }]}
              onPress={() => onDelete(task)}
              accessibilityLabel="Delete task"
            >
              <Ionicons name="trash-outline" size={15} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    lineHeight: 19,
  },
  description: {
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 17,
  },
  detailsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
