import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCdash } from '../context/CdashContext';

export const LoginScreen: React.FC = () => {
  const { colors, currentUser, login, logout, isAuthenticated, setIsAuthenticated } = useCdash();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [firstLoginRequired, setFirstLoginRequired] = useState(false);

  const handleSignIn = async () => {
    setError('');
    setFirstLoginRequired(false);
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    const result = await login(username.trim(), password);
    setLoading(false);

    if (!result.success) {
      if (result.isFirstLogin) {
        setFirstLoginRequired(true);
      } else {
        setError(result.error || 'Login failed. Please check credentials.');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bgPage }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Decorative Orbs */}
      <View style={[styles.orb, styles.orb1, { backgroundColor: colors.brand }]} />
      <View style={[styles.orb, styles.orb2, { backgroundColor: colors.brandDark }]} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: colors.bgSurface, borderColor: colors.borderColor }]}>
          {/* Brand Logo & Title */}
          <View style={styles.brandRow}>
            <View style={[styles.logoBox, { backgroundColor: colors.brand }]}>
              <Ionicons name="desktop-outline" size={24} color="#ffffff" />
            </View>
            <View>
              <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>CompanyDash</Text>
              <Text style={[styles.brandSubtitle, { color: colors.textMuted }]}>
                Work Management Platform
              </Text>
            </View>
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>Welcome back</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Sign in to your account to continue
          </Text>

          {/* Active Session Notification (if already logged in) */}
          {isAuthenticated && currentUser && (
            <View style={[styles.activeSessionCard, { backgroundColor: colors.bgSurfaceSub, borderColor: colors.borderColor }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.activeSessionLabel, { color: colors.textMuted }]}>
                  ACTIVE SESSION
                </Text>
                <Text style={[styles.activeSessionUser, { color: colors.textPrimary }]}>
                  {currentUser.fullName}{' '}
                  <Text style={{ fontWeight: '400', color: colors.textMuted }}>
                    @{currentUser.username}
                  </Text>
                </Text>
              </View>
              <View style={styles.sessionActions}>
                <TouchableOpacity
                  style={[styles.sessionBtn, { backgroundColor: colors.brand }]}
                  onPress={() => setIsAuthenticated(true)}
                >
                  <Text style={styles.sessionBtnText}>Go to App →</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sessionBtnLogout, { backgroundColor: colors.errorLight }]}
                  onPress={logout}
                >
                  <Text style={[styles.sessionBtnLogoutText, { color: colors.error }]}>Sign Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            {/* Username */}
            <Text style={[styles.label, { color: colors.textPrimary }]}>Username</Text>
            <View style={[styles.inputBox, { backgroundColor: colors.bgSurfaceSub, borderColor: colors.borderColor }]}>
              <Ionicons name="person-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="Enter your username"
                placeholderTextColor={colors.textMuted}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password */}
            <Text style={[styles.label, { color: colors.textPrimary }]}>Password</Text>
            <View style={[styles.inputBox, { backgroundColor: colors.bgSurfaceSub, borderColor: colors.borderColor }]}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="Enter your password"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            {/* First Login Setup Required on Web Banner */}
            {firstLoginRequired ? (
              <View
                style={[
                  styles.firstLoginBox,
                  {
                    backgroundColor: colors.warningLight,
                    borderColor: colors.warning,
                  },
                ]}
              >
                <View style={styles.firstLoginHeader}>
                  <Ionicons name="globe-outline" size={20} color={colors.warning} />
                  <Text style={[styles.firstLoginTitle, { color: colors.warning }]}>
                    Web Password Setup Required
                  </Text>
                </View>
                <Text style={[styles.firstLoginBody, { color: colors.textPrimary }]}>
                  This is your first login. To protect your account, initial login and password creation must be performed on the Web Portal.
                </Text>
                <Text style={[styles.firstLoginSubtext, { color: colors.textMuted }]}>
                  Password changes are only supported on the Web version. Once your new password is set on web, return here to sign in.
                </Text>

                <TouchableOpacity
                  style={[styles.openWebBtn, { backgroundColor: colors.brand }]}
                  onPress={() =>
                    Linking.openURL(
                      'https://cdash-kc83nmhot-jikesh2000t-4970s-projects.vercel.app/login'
                    )
                  }
                  activeOpacity={0.8}
                >
                  <Ionicons name="open-outline" size={16} color="#ffffff" />
                  <Text style={styles.openWebBtnText}>Open Web to Set Password →</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Error Message */}
            {error ? (
              <View style={[styles.errorBox, { backgroundColor: colors.errorLight }]}>
                <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              </View>
            ) : null}

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: colors.brand, opacity: loading ? 0.7 : 1 },
              ]}
              onPress={handleSignIn}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <View style={styles.submitBtnContent}>
                  <Ionicons name="log-in-outline" size={18} color="#ffffff" />
                  <Text style={styles.submitBtnText}>Sign In</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Web Portal Link Note */}
            <TouchableOpacity
              style={styles.webHintRow}
              onPress={() =>
                Linking.openURL(
                  'https://cdash-kc83nmhot-jikesh2000t-4970s-projects.vercel.app/login'
                )
              }
              activeOpacity={0.7}
            >
              <Ionicons name="information-circle-outline" size={14} color={colors.textMuted} />
              <Text style={[styles.webHintText, { color: colors.textMuted }]}>
                New user? Initial login & password change is web-only.{' '}
                <Text style={{ color: colors.brand, fontWeight: '700' }}>Open Web</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  orb: {
    position: 'absolute',
    borderRadius: 150,
    opacity: 0.12,
  },
  orb1: {
    width: 260,
    height: 260,
    top: -50,
    left: -50,
  },
  orb2: {
    width: 220,
    height: 220,
    bottom: -40,
    right: -40,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  brandSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 20,
  },
  activeSessionCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  activeSessionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  activeSessionUser: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  sessionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  sessionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sessionBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  sessionBtnLogout: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sessionBtnLogoutText: {
    fontSize: 12,
    fontWeight: '600',
  },
  form: {
    gap: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  eyeBtn: {
    padding: 6,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    padding: 10,
  },
  errorText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  submitBtn: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  submitBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  demoSection: {
    marginTop: 22,
    paddingTop: 18,
    borderTopWidth: 1,
  },
  demoTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 10,
    textAlign: 'center',
  },
  demoChips: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  demoChip: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  demoRole: {
    fontSize: 10,
    fontWeight: '700',
  },
  demoUser: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  firstLoginBox: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    gap: 8,
    marginBottom: 6,
  },
  firstLoginHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  firstLoginTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  firstLoginBody: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
  firstLoginSubtext: {
    fontSize: 11,
    lineHeight: 16,
  },
  openWebBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  openWebBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  webHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    paddingHorizontal: 8,
  },
  webHintText: {
    fontSize: 11,
    textAlign: 'center',
  },
});
