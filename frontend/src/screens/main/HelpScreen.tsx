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
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const HelpScreen = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [issueTitle, setIssueTitle] = React.useState('');
  const [issueDescription, setIssueDescription] = React.useState('');

  const handleEmailUs = () => {
    Linking.openURL('mailto:support@rozgar360.com');
  };

  const handleCallUs = () => {
    Linking.openURL('tel:+919876543210');
  };

  const handleSubmit = () => {
    // Handle issue submission
    setIssueTitle('');
    setIssueDescription('');
  };

  const faqs = [
    {
      question: 'How do I register on Rozgar360?',
      answer: 'You can register using your phone number. We\'ll send you an OTP to verify.',
    },
    {
      question: 'How do I search for labours?',
      answer: 'Go to the Search tab and enter the skill or location you\'re looking for.',
    },
    {
      question: 'How do I toggle my availability?',
      answer: 'On the Home screen, use the availability switch to mark yourself as available or not available for work.',
    },
  ];

  return (
    <Container>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('help.title')}</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('help.contactUs')}</Text>
          <View style={styles.contactButtons}>
            <Button
              title={t('help.email')}
              onPress={handleEmailUs}
              variant="primary"
              size="medium"
              style={styles.contactButton}
            />
            <Button
              title={t('help.phone')}
              onPress={handleCallUs}
              variant="outline"
              size="medium"
              style={styles.contactButton}
            />
          </View>
          <Text style={styles.contactInfo}>📧 support@rozgar360.com</Text>
          <Text style={styles.contactInfo}>📞 +91 98765 43210</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('help.reportIssue')}</Text>
          <Input
            label={t('help.issueTitle')}
            value={issueTitle}
            onChangeText={setIssueTitle}
            placeholder="Brief title"
          />
          <Input
            label={t('help.issueDescription')}
            value={issueDescription}
            onChangeText={setIssueDescription}
            placeholder={t('help.issueDescription')}
            multiline
            numberOfLines={4}
          />
          <Button
            title={t('help.submit')}
            onPress={handleSubmit}
            variant="primary"
            size="large"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('help.faqTitle')}</Text>
          {faqs.map((faq, index) => (
            <View key={index} style={styles.faqItem}>
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            </View>
          ))}
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
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.base,
  },
  contactButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.base,
  },
  contactButton: {
    flex: 0.48,
  },
  contactInfo: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  faqItem: {
    marginBottom: theme.spacing.lg,
  },
  faqQuestion: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  faqAnswer: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },
});

