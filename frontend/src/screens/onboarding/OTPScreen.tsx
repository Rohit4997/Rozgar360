import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../../theme';
import { Button } from '../../components/ui/Button';
import { Container } from '../../components/ui/Container';
import { useAuthStore } from '../../stores/authStore';
import { RootStackParamList } from '../../navigation/types';

export const OTPScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
  const { phoneNumber, verifyOTP, sendOTP } = useAuthStore();
  const [otp, setOtp] = React.useState(['', '', '', '']);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const inputRefs = React.useRef<TextInput[]>([]);

  const handleOtpChange = (value: string, index: number) => {
    if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setError('');

      // Auto focus next input
      if (value && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpValue = otp.join('');
    
    if (otpValue.length !== 4) {
      setError(t('validation.required'));
      return;
    }

    setLoading(true);
    const result = await verifyOTP(phoneNumber, otpValue);
    setLoading(false);

    if (result.success) {
      if (result.isNewUser) {
        navigation.replace('ProfileSetup');
      } else {
        navigation.replace('Main');
      }
    } else {
      setError(result.error || t('auth.invalidOtp'));
      setOtp(['', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResendOTP = async () => {
    setOtp(['', '', '', '']);
    setError('');
    setLoading(true);
    
    try {
      const result = await sendOTP(phoneNumber);
      
      if (result.success) {
        inputRefs.current[0]?.focus();
      } else {
        setError(result.error || 'Failed to resend OTP');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
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
            <View style={styles.header}>
              <Text style={styles.icon}>🔐</Text>
              <Text style={styles.title}>{t('auth.otpTitle')}</Text>
              <Text style={styles.subtitle}>
                {t('auth.otpSubtitle')} {phoneNumber}
              </Text>
            </View>

            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    if (ref) inputRefs.current[index] = ref;
                  }}
                  style={[styles.otpInput, error && styles.otpInputError]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            {/* <Text style={styles.hint}>💡 Use OTP: 1234</Text> */}

            <Button
              title={t('auth.verifyOtp')}
              onPress={handleVerifyOTP}
              variant="primary"
              size="large"
              loading={loading}
              style={styles.button}
            />

            <TouchableOpacity
              onPress={handleResendOTP}
              style={styles.resendContainer}>
              <Text style={styles.resendText}>
                {t('auth.didntReceiveOtp')}{' '}
                <Text style={styles.resendLink}>{t('auth.resendOtp')}</Text>
              </Text>
            </TouchableOpacity>
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
    paddingTop: theme.spacing.xxxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxxl,
  },
  icon: {
    fontSize: 60,
    marginBottom: theme.spacing.lg,
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
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.base,
  },
  otpInput: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: 12,
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
    color: theme.colors.textPrimary,
  },
  otpInputError: {
    borderColor: theme.colors.error,
  },
  error: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  hint: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    fontStyle: 'italic',
  },
  button: {
    marginBottom: theme.spacing.lg,
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
  },
  resendLink: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});

