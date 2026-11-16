import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCdash } from '../context/CdashContext';
import { MobileTaskCard } from '../components/MobileTaskCard';
import { TaskDetailModal, TaskFormModal, StatusModal } from '../components/TaskModals';
import { Task, TaskPriority, TaskStatus } from '../types/cdash';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function priorityDotColor(p: TaskPriority): string {
  switch (p) {
    case 'critical':
      return '#ef4444';
    case 'high':
      return '#f97316';
    case 'medium':
      return '#eab308';
    case 'low':
      return '#22c55e';
    default:
      return '#94a3b8';
  }
}

export const CalendarScreen: React.FC = () => {
  const { currentUser, tasks, colors, deleteTask, refreshData, isRefreshing } = useCdash();

  const isAdmin = currentUser.role === 'admin';
  const isMod = currentUser.role === 'moderator';
  const canAssign = isAdmin || isMod;

  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => toDateStr(today), [today]);

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');

  // Modals state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [statusTask, setStatusTask] = useState<Task | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);

  // Filter tasks visible to this user
  const userVisibleTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (currentUser.role === 'user') {
        return t.assigneeIds.includes(currentUser.id) || t.assignedById === currentUser.id;
      }
      return true;
    });
  }, [tasks, currentUser]);

  // Tasks mapped by date string (YYYY-MM-DD)
  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    userVisibleTasks.forEach((t) => {
      const dStr = t.dueDate ? t.dueDate.slice(0, 10) : '';
      if (dStr) {
        const list = map.get(dStr) || [];
        list.push(t);
        map.set(dStr, list);
      }
    });
    return map;
  }, [userVisibleTasks]);

  // 42-day Month Grid (always 6 rows, starting on Monday)
  const monthDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startOffset = (firstDay.getDay() + 6) % 7; // Monday = 0
    const days: { date: Date; dateStr: string; isCurrentMonth: boolean; isToday: boolean }[] = [];

    for (let i = 0; i < 42; i++) {
      const d = new Date(currentYear, currentMonth, 1 - startOffset + i);
      const dStr = toDateStr(d);
      days.push({
        date: d,
        dateStr: dStr,
        isCurrentMonth: d.getMonth() === currentMonth,
        isToday: dStr === todayStr,
      });
    }
    return days;
  }, [currentYear, currentMonth, todayStr]);

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDateStr(todayStr);
  };

  const monthName = new Date(currentYear, currentMonth, 1).toLocaleDateString([], {
    month: 'long',
    year: 'numeric',
  });

  // Selected date's tasks
  const selectedDateTasks = useMemo(() => {
    const list = tasksByDate.get(selectedDateStr) || [];
    if (statusFilter === 'all') return list;
    return list.filter((t) => t.status === statusFilter);
  }, [tasksByDate, selectedDateStr, statusFilter]);

  // Month counts for quick summary
  const monthTasksCount = useMemo(() => {
    let total = 0;
    let pending = 0;
    let inProgress = 0;
    let review = 0;
    let done = 0;
    let requested = 0;

    userVisibleTasks.forEach((t) => {
      const dStr = t.dueDate ? t.dueDate.slice(0, 10) : '';
      if (!dStr) return;
      const tDate = new Date(dStr);
      if (tDate.getFullYear() === currentYear && tDate.getMonth() === currentMonth) {
        total++;
        if (t.status === 'pending') pending++;
        else if (t.status === 'in-progress') inProgress++;
        else if (t.status === 'review') review++;
        else if (t.status === 'done') done++;
        else if (t.status === 'requested') requested++;
      }
    });

    return { total, pending, inProgress, review, done, requested };
  }, [userVisibleTasks, currentYear, currentMonth]);

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

  // Formatted date label for selected date header
  const selectedDateFormatted = useMemo(() => {
    const parts = selectedDateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
    }
    return selectedDateStr;
  }, [selectedDateStr]);

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
      {/* Screen Header */}
      <View style={[styles.screenHeader, { backgroundColor: colors.bgSurface, borderBottomColor: colors.borderColor }]}>
        <View>
          <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>Calendar</Text>
          <Text style={[styles.screenSubtitle, { color: colors.textMuted }]}>
            {monthTasksCount.total} task{monthTasksCount.total !== 1 ? 's' : ''} in {new Date(currentYear, currentMonth, 1).toLocaleDateString([], { month: 'short', year: 'numeric' })}
          </Text>
        </View>

        <View style={styles.headerRightActions}>
          {/* View mode toggle */}
          <View style={[styles.viewModeToggle, { backgroundColor: colors.bgSurfaceSub, borderColor: colors.borderColor }]}>
            <TouchableOpacity
              style={[
                styles.viewModeBtn,
                viewMode === 'month' && { backgroundColor: colors.brand },
              ]}
              onPress={() => setViewMode('month')}
            >
              <Ionicons
                name="calendar"
                size={14}
                color={viewMode === 'month' ? '#ffffff' : colors.textMuted}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.viewModeBtn,
                viewMode === 'agenda' && { backgroundColor: colors.brand },
              ]}
              onPress={() => setViewMode('agenda')}
            >
              <Ionicons
                name="list"
                size={14}
                color={viewMode === 'agenda' ? '#ffffff' : colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          {/* Action Button: Assign Task for Admin/Mod, Request Task for regular users */}
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.brand }]}
            onPress={() => setIsTaskFormOpen(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={16} color="#ffffff" />
            <Text style={styles.actionBtnText}>
              {canAssign ? 'Add Task' : 'Request'}
            </Text>
          </TouchableOpacity>
        </View>
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
        {/* Month Navigation Card */}
        <View style={[styles.navCard, { backgroundColor: colors.bgSurface, borderColor: colors.borderColor }]}>
          <View style={styles.monthTitleRow}>
            <Text style={[styles.monthTitle, { color: colors.textPrimary }]}>{monthName}</Text>
            {selectedDateStr !== todayStr && (
              <TouchableOpacity
                style={[styles.todayBtn, { backgroundColor: colors.brandLight, borderColor: colors.brand }]}
                onPress={goToToday}
              >
                <Text style={[styles.todayBtnText, { color: colors.brand }]}>Today</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.navArrows}>
            <TouchableOpacity
              style={[styles.arrowBtn, { backgroundColor: colors.bgSurfaceSub, borderColor: colors.borderColor }]}
              onPress={prevMonth}
              accessibilityLabel="Previous month"
            >
              <Ionicons name="chevron-back" size={18} color={colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.arrowBtn, { backgroundColor: colors.bgSurfaceSub, borderColor: colors.borderColor }]}
              onPress={nextMonth}
              accessibilityLabel="Next month"
            >
              <Ionicons name="chevron-forward" size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Monthly Status Metric Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.metricsRow}
        >
          <TouchableOpacity
            style={[
              styles.metricChip,
              {
                backgroundColor: statusFilter === 'all' ? colors.brand : colors.bgSurface,
                borderColor: statusFilter === 'all' ? colors.brand : colors.borderColor,
              },
            ]}
            onPress={() => setStatusFilter('all')}
          >
            <Text style={[styles.metricChipText, { color: statusFilter === 'all' ? '#ffffff' : colors.textPrimary }]}>
              All ({monthTasksCount.total})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.metricChip,
              {
                backgroundColor: statusFilter === 'pending' ? colors.brand : colors.bgSurface,
                borderColor: statusFilter === 'pending' ? colors.brand : colors.borderColor,
              },
            ]}
            onPress={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
          >
            <View style={[styles.metricDot, { backgroundColor: colors.warning }]} />
            <Text style={[styles.metricChipText, { color: statusFilter === 'pending' ? '#ffffff' : colors.textPrimary }]}>
              Pending ({monthTasksCount.pending})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.metricChip,
              {
                backgroundColor: statusFilter === 'in-progress' ? colors.brand : colors.bgSurface,
                borderColor: statusFilter === 'in-progress' ? colors.brand : colors.borderColor,
              },
            ]}
            onPress={() => setStatusFilter(statusFilter === 'in-progress' ? 'all' : 'in-progress')}
          >
            <View style={[styles.metricDot, { backgroundColor: colors.info }]} />
            <Text style={[styles.metricChipText, { color: statusFilter === 'in-progress' ? '#ffffff' : colors.textPrimary }]}>
              In Progress ({monthTasksCount.inProgress})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.metricChip,
              {
                backgroundColor: statusFilter === 'review' ? colors.brand : colors.bgSurface,
                borderColor: statusFilter === 'review' ? colors.brand : colors.borderColor,
              },
            ]}
            onPress={() => setStatusFilter(statusFilter === 'review' ? 'all' : 'review')}
          >
            <View style={[styles.metricDot, { backgroundColor: '#8b5cf6' }]} />
            <Text style={[styles.metricChipText, { color: statusFilter === 'review' ? '#ffffff' : colors.textPrimary }]}>
              Review ({monthTasksCount.review})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.metricChip,
              {
                backgroundColor: statusFilter === 'requested' ? '#8b5cf6' : colors.bgSurface,
                borderColor: statusFilter === 'requested' ? '#8b5cf6' : colors.borderColor,
              },
            ]}
            onPress={() => setStatusFilter(statusFilter === 'requested' ? 'all' : 'requested')}
          >
            <View style={[styles.metricDot, { backgroundColor: '#8b5cf6' }]} />
            <Text style={[styles.metricChipText, { color: statusFilter === 'requested' ? '#ffffff' : colors.textPrimary }]}>
              Requested ({monthTasksCount.requested})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.metricChip,
              {
                backgroundColor: statusFilter === 'done' ? colors.success : colors.bgSurface,
                borderColor: statusFilter === 'done' ? colors.success : colors.borderColor,
              },
            ]}
            onPress={() => setStatusFilter(statusFilter === 'done' ? 'all' : 'done')}
          >
            <View style={[styles.metricDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.metricChipText, { color: statusFilter === 'done' ? '#ffffff' : colors.textPrimary }]}>
              Done ({monthTasksCount.done})
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Month View Grid */}
        {viewMode === 'month' && (
          <View style={[styles.calendarCard, { backgroundColor: colors.bgSurface, borderColor: colors.borderColor }]}>
            {/* Weekday Row */}
            <View style={styles.weekdayRow}>
              {WEEKDAYS.map((wd) => (
                <Text key={wd} style={[styles.weekdayText, { color: colors.textMuted }]}>
                  {wd}
                </Text>
              ))}
            </View>

            {/* Days Grid */}
            <View style={styles.grid}>
              {monthDays.map((item, idx) => {
                const dayTasks = tasksByDate.get(item.dateStr) || [];
                const isSelected = item.dateStr === selectedDateStr;
                const hasTasks = dayTasks.length > 0;
                const requestedCount = dayTasks.filter((t) => t.status === 'requested').length;

                return (
                  <TouchableOpacity
                    key={`${item.dateStr}-${idx}`}
                    style={[
                      styles.dayCell,
                      isSelected && [styles.selectedDayCell, { backgroundColor: colors.brand }],
                      item.isToday && !isSelected && [styles.todayCell, { borderColor: colors.brand }],
                    ]}
                    onPress={() => setSelectedDateStr(item.dateStr)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dayNumber,
                        {
                          color: isSelected
                            ? '#ffffff'
                            : item.isCurrentMonth
                            ? colors.textPrimary
                            : colors.textMuted + '60',
                          fontWeight: isSelected || item.isToday ? '800' : '500',
                        },
                      ]}
                    >
                      {item.date.getDate()}
                    </Text>

                    {/* Task Indicators */}
                    {hasTasks && (
                      <View style={styles.dotsWrap}>
                        {dayTasks.slice(0, 3).map((t, tIdx) => (
                          <View
                            key={t.id || tIdx}
                            style={[
                              styles.taskDot,
                              {
                                backgroundColor: isSelected
                                  ? '#ffffff'
                                  : t.status === 'requested'
                                  ? '#8b5cf6'
                                  : priorityDotColor(t.priority),
                              },
                            ]}
                          />
                        ))}
                        {dayTasks.length > 3 && (
                          <Text
                            style={[
                              styles.moreCountText,
                              { color: isSelected ? '#ffffff' : colors.textMuted },
                            ]}
                          >
                            +
                          </Text>
                        )}
                      </View>
                    )}

                    {/* Purple corner dot if contains requested task */}
                    {requestedCount > 0 && !isSelected && (
                      <View style={[styles.requestMarker, { backgroundColor: '#8b5cf6' }]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Agenda Section: Tasks for Selected Date */}
        <View style={styles.agendaSection}>
          <View style={styles.agendaHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.agendaHeading, { color: colors.textPrimary }]}>
                {selectedDateStr === todayStr ? 'Today • ' : ''}
                {selectedDateFormatted}
              </Text>
              <Text style={[styles.agendaSubheading, { color: colors.textMuted }]}>
                {selectedDateTasks.length} task{selectedDateTasks.length !== 1 ? 's' : ''} scheduled
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.addForDateBtn, { backgroundColor: colors.bgSurfaceSub, borderColor: colors.borderColor }]}
              onPress={() => setIsTaskFormOpen(true)}
            >
              <Ionicons name="add" size={14} color={colors.brand} />
              <Text style={[styles.addForDateBtnText, { color: colors.brand }]}>
                {canAssign ? 'Add' : 'Request'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tasks List */}
          {selectedDateTasks.length === 0 ? (
            <View style={[styles.emptyDayCard, { backgroundColor: colors.bgSurface, borderColor: colors.borderColor }]}>
              <Ionicons name="calendar-clear-outline" size={32} color={colors.textMuted} />
              <Text style={[styles.emptyDayTitle, { color: colors.textPrimary }]}>
                No tasks due on this date
              </Text>
              <Text style={[styles.emptyDaySubtitle, { color: colors.textMuted }]}>
                {canAssign
                  ? 'Tap below to schedule a task for this day.'
                  : 'Tap below to request a task from your moderator for this day.'}
              </Text>

              <TouchableOpacity
                style={[styles.emptyActionBtn, { backgroundColor: colors.brand }]}
                onPress={() => setIsTaskFormOpen(true)}
              >
                <Ionicons name="add" size={15} color="#ffffff" />
                <Text style={styles.emptyActionBtnText}>
                  {canAssign ? 'Schedule Task' : 'Request Task'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            selectedDateTasks.map((task) => (
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
        </View>
      </ScrollView>

      {/* Modals */}
      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdateStatus={setStatusTask}
      />

      <StatusModal task={statusTask} onClose={() => setStatusTask(null)} />

      <TaskFormModal
        visible={isTaskFormOpen || !!editTask}
        taskToEdit={editTask}
        isRequest={!canAssign && isTaskFormOpen}
        initialDate={selectedDateStr}
        onClose={() => {
          setIsTaskFormOpen(false);
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewModeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    padding: 2,
  },
  viewModeBtn: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 6,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 8,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 36,
  },
  navCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  todayBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  todayBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  navArrows: {
    flexDirection: 'row',
    gap: 6,
  },
  arrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  metricChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  metricDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  metricChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  calendarCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
  },
  weekdayText: {
    fontSize: 11,
    fontWeight: '700',
    width: '14.28%',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    position: 'relative',
    marginVertical: 1,
  },
  selectedDayCell: {
    borderRadius: 10,
  },
  todayCell: {
    borderWidth: 1.5,
  },
  dayNumber: {
    fontSize: 13,
  },
  dotsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
    height: 6,
  },
  taskDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  moreCountText: {
    fontSize: 8,
    fontWeight: '800',
    lineHeight: 8,
  },
  requestMarker: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  agendaSection: {
    marginTop: 4,
  },
  agendaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  agendaHeading: {
    fontSize: 15,
    fontWeight: '700',
  },
  agendaSubheading: {
    fontSize: 11.5,
    marginTop: 2,
  },
  addForDateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  addForDateBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  emptyDayCard: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptyDayTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  emptyDaySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyActionBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});
