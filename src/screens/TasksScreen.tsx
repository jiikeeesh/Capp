import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCdash } from '../context/CdashContext';
import { MobileTaskCard } from '../components/MobileTaskCard';
import { TaskDetailModal, TaskFormModal, StatusModal } from '../components/TaskModals';
import { Task } from '../types/cdash';

export const TasksScreen: React.FC = () => {
  const { currentUser, tasks, colors, deleteTask } = useCdash();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Modals
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [statusTask, setStatusTask] = useState<Task | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  const isAdmin = currentUser.role === 'admin';
  const isMod = currentUser.role === 'moderator';
  const canAssign = isAdmin || isMod;

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Role filtering: regular users only see their assigned tasks
      if (currentUser.role === 'user' && !task.assigneeIds.includes(currentUser.id)) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all' && task.status !== statusFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return false;
      }

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          task.title.toLowerCase().includes(q) ||
          task.description.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [tasks, currentUser, statusFilter, priorityFilter, search]);

  const handleDelete = (task: Task) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteTask(task.id) },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
      {/* Screen Header */}
      <View style={[styles.screenHeader, { backgroundColor: colors.bgSurface, borderBottomColor: colors.borderColor }]}>
        <View>
          <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>Tasks</Text>
          <Text style={[styles.screenSubtitle, { color: colors.textMuted }]}>
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} found
          </Text>
        </View>

        {canAssign && (
          <TouchableOpacity
            style={[styles.assignBtn, { backgroundColor: colors.brand }]}
            onPress={() => setIsNewTaskOpen(true)}
          >
            <Ionicons name="add" size={16} color="#ffffff" />
            <Text style={styles.assignBtnText}>Assign Task</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={[styles.searchBox, { backgroundColor: colors.bgSurface, borderColor: colors.borderColor }]}>
          <Ionicons name="search-outline" size={16} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search tasks by title or details..."
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

        {/* Status Filter Horizontal Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipRow}
        >
          {['all', 'pending', 'in-progress', 'review', 'done'].map((st) => {
            const isSelected = statusFilter === st;
            return (
              <TouchableOpacity
                key={st}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? colors.brand : colors.bgSurface,
                    borderColor: isSelected ? colors.brand : colors.borderColor,
                  },
                ]}
                onPress={() => setStatusFilter(st)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: isSelected ? '#ffffff' : colors.textPrimary },
                  ]}
                >
                  {st === 'all' ? 'All Status' : st.replace('-', ' ').toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Priority Filter Horizontal Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.filterChipRow, { marginTop: 6, marginBottom: 14 }]}
        >
          {['all', 'critical', 'high', 'medium', 'low'].map((pr) => {
            const isSelected = priorityFilter === pr;
            return (
              <TouchableOpacity
                key={pr}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? colors.brand : colors.bgSurface,
                    borderColor: isSelected ? colors.brand : colors.borderColor,
                  },
                ]}
                onPress={() => setPriorityFilter(pr)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: isSelected ? '#ffffff' : colors.textPrimary },
                  ]}
                >
                  {pr === 'all' ? 'All Priority' : pr.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.bgSurface, borderColor: colors.borderColor }]}>
            <Ionicons name="checkbox-outline" size={38} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No tasks found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              {canAssign ? 'Click "Assign Task" to create one.' : 'No tasks assigned to you yet.'}
            </Text>
          </View>
        ) : (
          filteredTasks.map((task) => (
            <MobileTaskCard
              key={task.id}
              task={task}
              onViewDetails={setSelectedTask}
              onUpdateStatus={setStatusTask}
              onEdit={setEditTask}
              onDelete={handleDelete}
              showActions={true}
            />
          ))
        )}
      </ScrollView>

      {/* Modals */}
      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdateStatus={setStatusTask}
      />

      <StatusModal task={statusTask} onClose={() => setStatusTask(null)} />

      <TaskFormModal
        visible={isNewTaskOpen || !!editTask}
        taskToEdit={editTask}
        onClose={() => {
          setIsNewTaskOpen(false);
          setEditTask(null);
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
  assignBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  assignBtnText: {
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
  },
});
