import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';
import { Container } from '../../components/ui/Container';
import { useAppStore } from '../../stores/appStore';

export const SettingsScreen = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { settings, updateSettings } = useAppStore();

  const renderSettingItem = (
    title: string,
    value?: boolean,
    onValueChange?: (value: boolean) => void,
    onPress?: () => void
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress && !onValueChange}>
      <Text style={styles.settingTitle}>{title}</Text>
      {onValueChange !== undefined && value !== undefined ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{
            false: theme.colors.border,
            true: theme.colors.primary,
          }}
          thumbColor={theme.colors.background}
        />
      ) : (
        <Text style={styles.arrow}>›</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <Container>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('settings.title')}</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.general')}</Text>
          {renderSettingItem(
            t('settings.language'),
            undefined,
            undefined,
            () => {}
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.notifications')}</Text>
          {renderSettingItem(
            t('settings.pushNotifications'),
            settings.pushNotifications,
            (value) => updateSettings({ pushNotifications: value })
          )}
          {renderSettingItem(
            t('settings.emailNotifications'),
            settings.emailNotifications,
            (value) => updateSettings({ emailNotifications: value })
          )}
          {renderSettingItem(
            t('settings.smsNotifications'),
            settings.smsNotifications,
            (value) => updateSettings({ smsNotifications: value })
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.privacy')}</Text>
          {renderSettingItem(
            t('settings.termsAndConditions'),
            undefined,
            undefined,
            () => {}
          )}
          {renderSettingItem(
            t('settings.privacyPolicy'),
            undefined,
            undefined,
            () => {}
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
          {renderSettingItem(t('settings.rateApp'), undefined, undefined, () => {})}
          {renderSettingItem(t('settings.shareApp'), undefined, undefined, () => {})}
          <View style={styles.settingItem}>
            <Text style={styles.settingTitle}>{t('settings.version')}</Text>
            <Text style={styles.versionText}>1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.textPrimary,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  section: {
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.base,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingTitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
  },
  arrow: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.textSecondary,
  },
  versionText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
  },
});

