import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { MainDrawerParamList } from './types';
import { theme } from '../theme';
import { useAuthStore } from '../stores/authStore';
import { useUserStore } from '../stores/userStore';

// Main screens
import { HomeStackNavigator } from '../navigation/HomeStackNavigator';
import { SearchScreen } from '../screens/main/SearchScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { SettingsScreen } from '../screens/main/SettingsScreen';
import { HelpScreen } from '../screens/main/HelpScreen';
import { AboutScreen } from '../screens/main/AboutScreen';

const Drawer = createDrawerNavigator<MainDrawerParamList>();

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { t } = useTranslation();
  const logout = useAuthStore((state) => state.logout);
  const clearUser = useUserStore((state) => state.clearUser);
  const currentUser = useUserStore((state) => state.currentUser);

  const handleLogout = () => {
    Alert.alert(
      t('common.logout'),
      t('messages.logoutConfirm'),
      [
        {
          text: t('common.no'),
          style: 'cancel',
        },
        {
          text: t('common.yes'),
          onPress: () => {
            logout();
            clearUser();
          },
        },
      ]
    );
  };

  const menuItems = [
    { name: 'HomeTab', label: t('menu.home'), icon: '🏠' },
    { name: 'Search', label: t('menu.search'), icon: '🔍' },
    { name: 'Profile', label: t('menu.profile'), icon: '👤' },
    { name: 'Settings', label: t('menu.settings'), icon: '⚙️' },
    { name: 'Help', label: t('menu.help'), icon: '❓' },
    { name: 'About', label: t('menu.about'), icon: 'ℹ️' },
  ];

  return (
    <SafeAreaView style={styles.drawerContainer}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          {currentUser && (
            <>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {currentUser.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.userName}>{currentUser.name}</Text>
              <Text style={styles.userPhone}>{currentUser.phone}</Text>
            </>
          )}
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.name}
              style={styles.menuItem}
              onPress={() => props.navigation.navigate(item.name as any)}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </DrawerContentScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>{t('menu.logout')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export const MainDrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: {
          width: 280,
        },
      }}>
      <Drawer.Screen name="HomeTab" component={HomeStackNavigator} />
      <Drawer.Screen name="Search" component={SearchScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="Help" component={HelpScreen} />
      <Drawer.Screen name="About" component={AboutScreen} />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarText: {
    fontSize: theme.typography.fontSize.xxxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textLight,
  },
  userName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  userPhone: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  menuSection: {
    paddingVertical: theme.spacing.base,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  menuIcon: {
    fontSize: theme.typography.fontSize.xl,
    marginRight: theme.spacing.md,
  },
  menuLabel: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    padding: theme.spacing.base,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  logoutIcon: {
    fontSize: theme.typography.fontSize.xl,
    marginRight: theme.spacing.md,
  },
  logoutText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.error,
    fontWeight: theme.typography.fontWeight.medium,
  },
});

