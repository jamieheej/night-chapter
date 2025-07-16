import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { SPACING } from '../../styles/theme';
import { deleteAccount } from '../../utils/accountUtils';

export default function Account() {
  const { theme } = useTheme();
  const { user, signOut, upgradeToPremium } = useAuth();
  const router = useRouter();

  const handleDeleteAccount = async () => {
    // Show confirmation dialog
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This will permanently delete all your data from both this device and the cloud.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              Alert.alert(
                'Account Deleted',
                'Your account and all associated data have been permanently deleted.',
                [{ text: 'OK', onPress: () => {
                  console.log("OnPress OK");
                  // router.replace('/');
                } }]
              );
            } catch (error) {
              if (error instanceof Error && error.message.includes('reauthenticate')) {
                Alert.alert(
                  'Authentication Required',
                  'For security reasons, please sign out and sign in again before deleting your account.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Sign Out',
                      onPress: async () => {
                        await signOut();
                        console.log("OnPress SignOut");
//                        router.replace('/(auth)/SignIn');
                      },
                    },
                  ]
                );
              } else {
                Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete account');
              }
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleBack = () => {
    router.back();
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Your local data will remain on this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(screens)/auth/SignIn');
          },
        },
      ]
    );
  };

  // TBD: Disable premium for now
  // const handleUpgradeToPremium = () => {
  //   Alert.alert(
  //     'Upgrade to Premium',
  //     'Unlock cloud sync, advanced analytics, and more features for $6.99',
  //     [
  //       { text: 'Cancel', style: 'cancel' },
  //       {
  //         text: 'Upgrade',
  //         onPress: async () => {
  //           await upgradeToPremium();
  //           Alert.alert('Success!', 'Welcome to NightChapter Premium!');
  //         },
  //       },
  //     ]
  //   );
  // };

  if (!user) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.dark }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: theme.colors.text.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Account</Text>
      </View>

      <View style={styles.content}>
        <View style={[styles.profileCard, { backgroundColor: theme.colors.background.card }]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.name, { color: theme.colors.text.primary }]}>
            {user.name}
          </Text>
          <Text style={[styles.email, { color: theme.colors.text.secondary }]}>
            {user.email}
          </Text>
          {user.isPremium && (
            <View style={[styles.premiumBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          )}
        </View>

        {/* TBD: Disable premium for now */}
        {/* {!user.isPremium && (
          <TouchableOpacity
            style={[styles.upgradeButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleUpgradeToPremium}
          >
            <Text style={styles.upgradeButtonText}>
              Upgrade to Premium - $6.99
            </Text>
            <Text style={styles.upgradeSubtext}>
              Cloud sync • Advanced analytics • Priority support
            </Text>
          </TouchableOpacity>
        )} */}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Account Actions
          </Text>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.background.card }]}
            onPress={handleDeleteAccount}
          >
            <Text style={[styles.actionButtonText, { color: theme.colors.text.primary }]}>
              Delete Account
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleSignOut}
          >
            <Text style={[styles.actionButtonText, styles.dangerText]}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    marginRight: SPACING.md,
  },
  backButtonText: {
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  profileCard: {
    borderRadius: 16,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  email: {
    fontSize: 16,
    marginBottom: SPACING.md,
  },
  premiumBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  premiumText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  upgradeButton: {
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  upgradeSubtext: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING.lg,
  },
  actionButton: {
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  dangerButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  dangerText: {
    color: '#FF3B30',
  },
}); 