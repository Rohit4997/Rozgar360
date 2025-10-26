import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../../theme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Container } from '../../components/ui/Container';
import { useAuthStore } from '../../stores/authStore';
import { useAppStore } from '../../stores/appStore';
import { RootStackParamList } from '../../navigation/types';

export const LoginScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t, i18n } = useTranslation();
  const setPhoneNumber = useAuthStore((state) => state.setPhoneNumber);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const [phone, setPhone] = React.useState('');
  const [phoneError, setPhoneError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
    updateSettings({ language: newLang });
  };

  const validatePhone = (phoneNumber: string) => {
    if (!phoneNumber) {
      return t('validation.required');
    }
    if (phoneNumber.length !== 10 || !/^\d+$/.test(phoneNumber)) {
      return t('validation.invalidPhone');
    }
    return '';
  };

  const handleSendOTP = () => {
    const error = validatePhone(phone);
    setPhoneError(error);

    if (!error) {
      setLoading(true);
      setPhoneNumber(phone);
      
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        navigation.navigate('OTP');
      }, 1000);
    }
  };

  return (
    <Container>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <View style={styles.headerContainer}>
              <TouchableOpacity
                style={styles.languageButton}
                onPress={toggleLanguage}>
                <Text style={styles.languageIcon}>🌐</Text>
                <Text style={styles.languageText}>
                  {i18n.language === 'en' ? 'हिंदी' : 'English'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.header}>
              <Text style={styles.appName}>{t('common.appName')}</Text>
              <Text style={styles.icon}>💼</Text>
            </View>

            <View style={styles.form}>
              <Text style={styles.title}>{t('auth.loginTitle')}</Text>
              <Text style={styles.subtitle}>
                {t('auth.enterPhoneNumber')}
              </Text>

              <Input
                label={t('auth.phoneNumber')}
                placeholder="9876543210"
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  setPhoneError('');
                }}
                error={phoneError}
              />

              <Text style={styles.hint}>
                💡 Use: 9876543210, 8765432109, or 7654321098
              </Text>

              <Button
                title={t('auth.sendOtp')}
                onPress={handleSendOTP}
                variant="primary"
                size="large"
                loading={loading}
                style={styles.button}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  headerContainer: {
    alignItems: 'flex-end',
    paddingTop: theme.spacing.base,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    borderRadius: 8,
    backgroundColor: theme.colors.backgroundGray,
  },
  languageIcon: {
    fontSize: theme.typography.fontSize.base,
    marginRight: theme.spacing.xs,
  },
  languageText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  header: {
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  appName: {
    fontSize: theme.typography.fontSize.xxxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  icon: {
    fontSize: 60,
  },
  form: {
    flex: 1,
    paddingTop: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  hint: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    fontStyle: 'italic',
  },
  button: {
    marginTop: theme.spacing.md,
  },
});

