import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';
import { Container } from '../../components/ui/Container';
import { ADDRESS, APP_NAME, APP_VERSION, INFO_EMAIL } from '../../utils/constants';

export const AboutScreen = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  const handleContactUs = () => {
    Linking.openURL(`mailto:${INFO_EMAIL}`);
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
          <Text style={styles.headerTitle}>{t('about.title')}</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>💼</Text>
            <Text style={styles.appName}>{APP_NAME}</Text>
            <Text style={styles.version}>
              {t('about.version')} {APP_VERSION}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Us</Text>
            <Text style={styles.description}>{t('about.description')}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('about.mission')}</Text>
            <Text style={styles.description}>{t('about.missionText')}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('about.contactUs')}</Text>
            <TouchableOpacity onPress={handleContactUs}>
              <Text style={styles.link}>📧 {INFO_EMAIL}</Text>
            </TouchableOpacity>
            <Text style={styles.description}>📍 {ADDRESS}</Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2026 {APP_NAME}. All rights reserved.
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
    paddingHorizontal: theme.spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxxl,
  },
  logo: {
    fontSize: 80,
    marginBottom: theme.spacing.base,
  },
  appName: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  version: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
    marginBottom: theme.spacing.sm,
  },
  link: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  footerText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});

