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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../../theme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Container } from '../../components/ui/Container';
import { useUserStore } from '../../stores/userStore';
import { useAuthStore } from '../../stores/authStore';
import { RootStackParamList } from '../../navigation/types';

const SKILLS = [
  'farming',
  'carWashing',
  'carDriving',
  'makeup',
  'painting',
  'plumbing',
  'electrical',
  'carpentry',
  'cooking',
  'cleaning',
  'gardening',
  'construction',
  'welding',
  'tailoring',
  'beautician',
];

const LABOUR_TYPES = [
  'daily',
  'monthly',
  'partTime',
  'fullTime',
  'contract',
  'freelance',
];

export const ProfileSetupScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
  const { completeProfile } = useUserStore();
  const phoneNumber = useAuthStore((state) => state.phoneNumber);
  const [loading, setLoading] = React.useState(false);
  
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [city, setCity] = React.useState('');
  const [state, setState] = React.useState('');
  const [pincode, setPincode] = React.useState('');
  const [bio, setBio] = React.useState('');
  const [isAvailable, setIsAvailable] = React.useState(false);
  const [selectedSkills, setSelectedSkills] = React.useState<string[]>([]);
  const [experience, setExperience] = React.useState('');
  const [selectedLabourType, setSelectedLabourType] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = t('validation.required');
    if (!address.trim()) newErrors.address = t('validation.required');
    if (!city.trim()) newErrors.city = t('validation.required');
    if (!state.trim()) newErrors.state = t('validation.required');
    if (!pincode.trim()) newErrors.pincode = t('validation.required');
    if (selectedSkills.length === 0) newErrors.skills = t('validation.required');
    if (!experience.trim()) newErrors.experience = t('validation.required');
    if (!selectedLabourType) newErrors.labourType = t('validation.required');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      setLoading(true);
      
      try {
        const result = await completeProfile({
          name,
          email: email || undefined,
          address,
          city,
          state,
          pincode,
          bio: bio || undefined,
          isAvailable,
          skills: selectedSkills,
          experienceYears: parseInt(experience, 10),
          labourType: selectedLabourType as any,
        });

        if (result.success) {
          navigation.replace('Main');
        } else {
          // Show error - you can add Alert here if needed
          console.error('Profile setup failed:', result.error);
        }
      } catch (error: any) {
        console.error('Profile setup error:', error);
        // Show error - you can add Alert here if needed
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Container>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>{t('profileSetup.title')}</Text>
          <Text style={styles.subtitle}>{t('profileSetup.subtitle')}</Text>
        </View>

        <View style={styles.form}>
          <Input
            label={t('profileSetup.name')}
            placeholder={t('profileSetup.enterName')}
            value={name}
            onChangeText={setName}
            error={errors.name}
          />

          <Input
            label={t('profileSetup.emailAddress')}
            placeholder={t('profileSetup.enterEmail')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label={t('profileSetup.address')}
            placeholder={t('profileSetup.enterAddress')}
            value={address}
            onChangeText={setAddress}
            error={errors.address}
            multiline
          />

          <View style={styles.row}>
            <Input
              label={t('profileSetup.city')}
              placeholder={t('profileSetup.enterCity')}
              value={city}
              onChangeText={setCity}
              error={errors.city}
              containerStyle={styles.halfInput}
            />

            <Input
              label={t('profileSetup.pincode')}
              placeholder={t('profileSetup.enterPincode')}
              value={pincode}
              onChangeText={setPincode}
              keyboardType="number-pad"
              maxLength={6}
              error={errors.pincode}
              containerStyle={styles.halfInput}
            />
          </View>

          <Input
            label={t('profileSetup.state')}
            placeholder={t('profileSetup.enterState')}
            value={state}
            onChangeText={setState}
            error={errors.state}
          />

          <Input
            label={t('profileSetup.bio')}
            placeholder={t('profileSetup.enterBio')}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
          />

          <View style={styles.switchContainer}>
            <Text style={styles.label}>{t('profileSetup.availableForWork')}</Text>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.background}
            />
          </View>

          <Text style={styles.sectionTitle}>{t('profileSetup.skillsTitle')}</Text>
          <View style={styles.skillsContainer}>
            {SKILLS.map((skill) => (
              <TouchableOpacity
                key={skill}
                style={[
                  styles.skillChip,
                  selectedSkills.includes(skill) && styles.skillChipSelected,
                ]}
                onPress={() => toggleSkill(skill)}>
                <Text
                  style={[
                    styles.skillText,
                    selectedSkills.includes(skill) && styles.skillTextSelected,
                  ]}>
                  {t(`skills.${skill}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.skills && <Text style={styles.error}>{errors.skills}</Text>}

          <Input
            label={t('profileSetup.experience')}
            placeholder={t('profileSetup.enterExperience')}
            value={experience}
            onChangeText={setExperience}
            keyboardType="number-pad"
            error={errors.experience}
          />

          <Text style={styles.sectionTitle}>{t('profileSetup.labourType')}</Text>
          <View style={styles.labourTypesContainer}>
            {LABOUR_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.labourTypeChip,
                  selectedLabourType === type && styles.labourTypeChipSelected,
                ]}
                onPress={() => setSelectedLabourType(type)}>
                <Text
                  style={[
                    styles.labourTypeText,
                    selectedLabourType === type && styles.labourTypeTextSelected,
                  ]}>
                  {t(`labourTypes.${type}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.labourType && <Text style={styles.error}>{errors.labourType}</Text>}

          <Button
            title={t('common.submit')}
            onPress={handleSubmit}
            variant="primary"
            size="large"
            style={styles.submitButton}
            loading={loading}
          />
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
    padding: theme.spacing.lg,
    alignItems: 'center',
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
  },
  form: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 0.48,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  label: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.base,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.base,
  },
  skillChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  skillChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  skillText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  skillTextSelected: {
    color: theme.colors.textLight,
    fontWeight: theme.typography.fontWeight.medium,
  },
  labourTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.base,
  },
  labourTypeChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  labourTypeChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  labourTypeText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  labourTypeTextSelected: {
    color: theme.colors.textLight,
    fontWeight: theme.typography.fontWeight.medium,
  },
  error: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error,
    marginTop: -theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  submitButton: {
    marginTop: theme.spacing.lg,
  },
});

