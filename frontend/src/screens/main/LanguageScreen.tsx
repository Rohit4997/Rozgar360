import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';
import { Container } from '../../components/ui/Container';
import { useAppStore } from '../../stores/appStore';

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
];

export const LanguageScreen = () => {
  const navigation = useNavigation<any>();
  const { t, i18n } = useTranslation();
  const updateSettings = useAppStore((state) => state.updateSettings);
  const currentLanguage = i18n.language;

  const handleLanguageSelect = async (languageCode: string) => {
    await i18n.changeLanguage(languageCode);
    updateSettings({ language: languageCode });
    navigation.goBack();
  };

  return (
    <Container>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('language.title')}</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <Text style={styles.subtitle}>{t('language.subtitle')}</Text>

          <View style={styles.languageList}>
            {LANGUAGES.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageItem,
                  currentLanguage === language.code && styles.languageItemActive,
                ]}
                onPress={() => handleLanguageSelect(language.code)}>
                <View style={styles.languageInfo}>
                  <Text style={styles.languageName}>{language.name}</Text>
                  <Text style={styles.languageNativeName}>
                    {language.nativeName}
                  </Text>
                </View>
                {currentLanguage === language.code && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.currentLanguageContainer}>
            <Text style={styles.currentLanguageLabel}>
              {t('language.currentLanguage')}:
            </Text>
            <Text style={styles.currentLanguageValue}>
              {LANGUAGES.find((l) => l.code === currentLanguage)?.nativeName}
            </Text>
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
  content: {
    padding: theme.spacing.lg,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  languageList: {
    marginBottom: theme.spacing.xl,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: 12,
    marginBottom: theme.spacing.md,
  },
  languageItemActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  languageNativeName: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
  },
  checkmark: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  currentLanguageContainer: {
    padding: theme.spacing.base,
    backgroundColor: theme.colors.backgroundGray,
    borderRadius: 8,
    alignItems: 'center',
  },
  currentLanguageLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  currentLanguageValue: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary,
  },
});

