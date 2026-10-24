import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useCdash } from '../context/CdashContext';
import { OnlinePresenceWidget } from '../components/OnlinePresenceWidget';
import { MobileTaskCard } from '../components/MobileTaskCard';
import { TaskDetailModal, TaskFormModal, StatusModal } from '../components/TaskModals';
import { UserModal } from '../components/UserModal';
import { NewRequestModal } from '../components/RequestModals';
import { Task } from '../types/cdash';

export const DashboardScreen: React.FC = () => {
  const { currentUser, tasks, users, requests, colors, setActiveTab } = useCdash();

  // Modals state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [statusTask, setStatusTask] = useState<Task | null>(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  const isUserOnly = currentUser.role === 'user';
  const myTasks = isUserOnly
    ? tasks.filter((t) => t.assigneeIds.includes(currentUser.id))
    : tasks;

  const doneTasks = myTasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = myTasks.filter((t) => t.status === 'in-progress').length;
  const reviewTasks = myTasks.filter((t) => t.status === 'review').length;
  const criticalTasks = myTasks.filter(
    (t) => t.priority === 'critical' && t.status !== 'done'
  ).length;

  const pendingRequestsCount = requests.filter((r) => r.status === 'pending').length;

  const recentTasks = [...myTasks]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const roleEmoji =
    currentUser.role === 'admin' ? '👑' : currentUser.role === 'moderator' ? '🛡️' : '💼';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bgPage }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Welcome Banner matching cdash */}
      <LinearGradient
        colors={colors.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.welcomeBanner}
      >
        <View style={styles.bannerCircle1} />
        <View style={styles.bannerCircle2} />

        <View style={styles.bannerTextWrap}>
          <Text style={styles.greetingTitle}>
            Good {getGreeting()}, {currentUser.fullName.split(' ')[0]}! 👋
          </Text>
          <Text style={styles.greetingSubtitle}>
            {currentUser.role === 'admin' && 'You have full access to manage the platform.'}
            {currentUser.role === 'moderator' && 'You can assign tasks and manage the workflow.'}
            {currentUser.role === 'user' &&
              `You have ${myTasks.filter((t) => t.status !== 'done').length} active task(s).`}
          </Text>
        </View>

        <Text style={styles.roleEmojiText}>{roleEmoji}</Text>
      </LinearGradient>

      {/* Stats Grid matching cdash */}
      <View style={styles.statsGrid}>
        {/* Total Users (Admin & Moderator) */}
        {!isUserOnly && (
          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.bgSurface, borderColor: colors.borderColor },
            ]}
          >
            <View style={[styles.statIconBox, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
              <Ionicons name="people-outline" size={18} color="#6366f1" />
            </View>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {users.filter((u) => u.role === 'user').length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Users</Text>
            <Text style={[styles.statChange, { color: '#6366f1' }]}>
              {users.filter((u) => u.role === 'moderator').length} moderator(s)
            </Text>
          </View>
        )}

        {/* Total Tasks / My Tasks */}
        <View
          style={[
            styles.statCard,
            { backgroundColor: colors.bgSurface, borderColor: colors.borderColor },
          ]}
        >
          <View style={[styles.statIconBox, { backgroundColor: colors.successLight }]}>
            <Ionicons name="checkbox-outline" size={18} color={colors.success} />
          </View>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>{myTasks.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>
            {isUserOnly ? 'My Tasks' : 'Total Tasks'}
          </Text>
          <Text style={[styles.statChange, { color: colors.success }]}>
            {doneTasks} completed
          </Text>
        </View>

        {/* In Progress */}
        <View
          style={[
            styles.statCard,
            { backgroundColor: colors.bgSurface, borderColor: colors.borderColor },
          ]}
        >
          <View style={[styles.statIconBox, { backgroundColor: colors.infoLight }]}>
            <Ionicons name="time-outline" size={18} color={colors.info} />
          </View>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>
            {inProgressTasks}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>In Progress</Text>
          <Text style={[styles.statChange, { color: colors.info }]}>
            {reviewTasks} in review
          </Text>
        </View>

        {/* Critical Tasks (If > 0) */}
        {criticalTasks > 0 && (
          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.bgSurface, borderColor: colors.borderColor },
            ]}
          >
            <View style={[styles.statIconBox, { backgroundColor: colors.errorLight }]}>
              <Ionicons name="alert-circle-outline" size={18} color={colors.error} />
            </View>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {criticalTasks}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Critical Tasks</Text>
            <Text style={[styles.statChange, { color: colors.error }]}>Needs attention</Text>
          </View>
        )}

        {/* Pending Requests (If > 0, Admin & Mod) */}
        {!isUserOnly && pendingRequestsCount > 0 && (
          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.bgSurface, borderColor: colors.borderColor },
            ]}
          >
            <View style={[styles.statIconBox, { backgroundColor: colors.warningLight }]}>
              <Ionicons name="mail-unread-outline" size={18} color={colors.warning} />
            </View>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {pendingRequestsCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Pending Requests</Text>
            <Text style={[styles.statChange, { color: colors.warning }]}>
              Account creation
            </Text>
          </View>
        )}
      </View>

      {/* Online Team Presence Widget */}
      <OnlinePresenceWidget />

      {/* Quick Actions (Admin & Moderator) */}
      {!isUserOnly && (
        <View
          style={[
            styles.card,
            { backgroundColor: colors.bgSurface, borderColor: colors.borderColor },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Quick Actions</Text>
          <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
            Common workspace operations
          </Text>

          <View style={styles.quickActionsList}>
            <TouchableOpacity
              style={[styles.quickActionBtn, { backgroundColor: colors.brand }]}
              onPress={() => setIsTaskFormOpen(true)}
            >
              <Ionicons name="add-circle-outline" size={18} color="#ffffff" />
              <Text style={styles.quickActionTextPrimary}>Assign New Task</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickActionBtnOutline,
                { borderColor: colors.borderColor, backgroundColor: colors.bgSurfaceSub },
              ]}
              onPress={() => {
                if (currentUser.role === 'admin') {
                  setIsUserFormOpen(true);
                } else {
                  setActiveTab('users');
                }
              }}
            >
              <Ionicons name="person-add-outline" size={18} color={colors.textPrimary} />
              <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>
                {currentUser.role === 'admin' ? 'Create Account' : 'View Users'}
              </Text>
            </TouchableOpacity>

            {currentUser.role === 'moderator' && (
              <TouchableOpacity
                style={[
                  styles.quickActionBtnOutline,
                  { borderColor: colors.borderColor, backgroundColor: colors.bgSurfaceSub },
                ]}
                onPress={() => setIsRequestFormOpen(true)}
              >
                <Ionicons name="mail-outline" size={18} color={colors.textPrimary} />
                <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>
                  Request New Account
                </Text>
              </TouchableOpacity>
            )}

            {currentUser.role === 'admin' && pendingRequestsCount > 0 && (
              <TouchableOpacity
                style={[
                  styles.quickActionBtnOutline,
                  { borderColor: colors.warning, backgroundColor: colors.warningLight },
                ]}
                onPress={() => setActiveTab('requests')}
              >
                <Ionicons name="alert-circle-outline" size={18} color={colors.warning} />
                <Text style={[styles.quickActionText, { color: colors.warning }]}>
                  Review {pendingRequestsCount} Pending Request
                  {pendingRequestsCount > 1 ? 's' : ''}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Recent Tasks Card */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.bgSurface, borderColor: colors.borderColor },
        ]}
      >
        <View style={styles.recentTasksHeader}>
          <View>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Recent Tasks</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
              Latest activity
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.viewAllBtn,
              { borderColor: colors.borderColor, backgroundColor: colors.bgSurfaceSub },
            ]}
            onPress={() => setActiveTab('tasks')}
          >
            <Text style={[styles.viewAllText, { color: colors.brand }]}>View all</Text>
          </TouchableOpacity>
        </View>

        {recentTasks.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="checkbox-outline" size={36} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No tasks yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              {!isUserOnly ? 'Create a task to get started.' : 'No tasks assigned to you.'}
            </Text>
          </View>
        ) : (
          recentTasks.map((task) => (
            <MobileTaskCard
              key={task.id}
              task={task}
              onViewDetails={setSelectedTask}
              onUpdateStatus={setStatusTask}
              showActions={false}
            />
          ))
        )}
      </View>

      {/* Task Modals */}
      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdateStatus={setStatusTask}
      />

      <StatusModal task={statusTask} onClose={() => setStatusTask(null)} />

      <TaskFormModal
        visible={isTaskFormOpen}
        taskToEdit={null}
        onClose={() => setIsTaskFormOpen(false)}
      />

      <UserModal
        visible={isUserFormOpen}
        userToEdit={null}
        onClose={() => setIsUserFormOpen(false)}
      />

      <NewRequestModal
        visible={isRequestFormOpen}
        onClose={() => setIsRequestFormOpen(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  welcomeBanner: {
    borderRadius: 18,
    padding: 22,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  bannerCircle1: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  bannerCircle2: {
    position: 'absolute',
    right: 40,
    bottom: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  bannerTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  greetingTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  greetingSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    lineHeight: 18,
  },
  roleEmojiText: {
    fontSize: 36,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  statIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  statChange: {
    fontSize: 11,
    fontWeight: '600',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    marginBottom: 12,
  },
  quickActionsList: {
    gap: 10,
    marginTop: 4,
  },
  quickActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  quickActionTextPrimary: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  quickActionBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  recentTasksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  viewAllBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 12,
  },
});
