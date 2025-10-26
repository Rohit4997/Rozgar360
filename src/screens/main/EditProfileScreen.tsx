import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Container } from '../../components/ui/Container';
import { useUserStore } from '../../stores/userStore';

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

export const EditProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { currentUser, updateUser } = useUserStore();
  
  const [name, setName] = React.useState(currentUser?.name || '');
  const [email, setEmail] = React.useState(currentUser?.email || '');
  const [address, setAddress] = React.useState(currentUser?.address || '');
  const [city, setCity] = React.useState(currentUser?.city || '');
  const [state, setState] = React.useState(currentUser?.state || '');
  const [pincode, setPincode] = React.useState(currentUser?.pincode || '');
  const [bio, setBio] = React.useState(currentUser?.bio || '');
  const [isAvailable, setIsAvailable] = React.useState(currentUser?.isAvailable || false);
  const [selectedSkills, setSelectedSkills] = React.useState<string[]>(currentUser?.skills || []);
  const [experience, setExperience] = React.useState(currentUser?.experience.toString() || '');
  const [selectedLabourType, setSelectedLabourType] = React.useState(currentUser?.labourType || '');
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

  const handleSave = () => {
    if (validate()) {
      updateUser({
        name,
        email,
        address,
        city,
        state,
        pincode,
        bio,
        isAvailable,
        skills: selectedSkills,
        experience: parseInt(experience, 10),
        labourType: selectedLabourType,
      });

      Alert.alert(
        t('common.success'),
        t('messages.profileUpdated'),
        [
          {
            text: t('common.ok'),
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  };

  return (
    <Container>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('profile.editProfile')}</Text>
          <View style={styles.placeholder} />
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

          <View style={styles.buttonRow}>
            <Button
              title={t('common.cancel')}
              onPress={() => navigation.goBack()}
              variant="outline"
              size="large"
              style={styles.button}
            />
            <Button
              title={t('common.save')}
              onPress={handleSave}
              variant="primary"
              size="large"
              style={styles.button}
            />
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  button: {
    flex: 1,
  },
});
