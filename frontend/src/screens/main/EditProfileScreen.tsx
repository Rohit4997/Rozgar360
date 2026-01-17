import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Container } from '../../components/ui/Container';
import { useUserStore } from '../../stores/userStore';
import { fetchCurrentLocation } from '../../utils/location';

const DEFAULT_SKILLS = [
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
  const { currentUser, updateProfile } = useUserStore();
  
  const [name, setName] = React.useState(currentUser?.name || '');
  const [email, setEmail] = React.useState(currentUser?.email || '');
  const [address, setAddress] = React.useState(currentUser?.address || '');
  const [city, setCity] = React.useState(currentUser?.city || '');
  const [state, setState] = React.useState(currentUser?.state || '');
  const [pincode, setPincode] = React.useState(currentUser?.pincode || '');
  const [bio, setBio] = React.useState(currentUser?.bio || '');
  const [isAvailable, setIsAvailable] = React.useState(currentUser?.isAvailable || false);
  const [selectedSkills, setSelectedSkills] = React.useState<string[]>(currentUser?.skills || []);
  const [skillInput, setSkillInput] = React.useState('');
  const [experience, setExperience] = React.useState(currentUser?.experience.toString() || '');
  const [selectedLabourType, setSelectedLabourType] = React.useState(currentUser?.labourType || '');
  const [locationAddress, setLocationAddress] = React.useState(
    currentUser?.address || ''
  );
  const [latitude, setLatitude] = React.useState<number | undefined>(currentUser?.latitude);
  const [longitude, setLongitude] = React.useState<number | undefined>(currentUser?.longitude);
  const [locationLoading, setLocationLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
    if (errors.skills) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.skills;
        return newErrors;
      });
    }
  };

  const addSkill = () => {
    const trimmedSkill = skillInput.trim();
    if (trimmedSkill && !selectedSkills.includes(trimmedSkill)) {
      setSelectedSkills([...selectedSkills, trimmedSkill]);
      setSkillInput('');
      if (errors.skills) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.skills;
          return newErrors;
        });
      }
    }
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skill));
  };

  const handleSkillInputSubmit = () => {
    addSkill();
  };

  const handleFetchLocation = async () => {
    setLocationLoading(true);
    try {
      const locationData = await fetchCurrentLocation();
      setLocationAddress(locationData.address);
      setLatitude(locationData.latitude);
      setLongitude(locationData.longitude);
      
      // Try to extract city, state, pincode from address if they're empty
      if (!city || !state || !pincode) {
        const addressParts = locationData.address.split(',');
        if (addressParts.length >= 3) {
          if (!city) setCity(addressParts[addressParts.length - 3]?.trim() || '');
          if (!state) setState(addressParts[addressParts.length - 2]?.trim() || '');
          // Try to extract pincode (usually last part or second last)
          const pincodeMatch = locationData.address.match(/\b\d{6}\b/);
          if (pincodeMatch && !pincode) {
            setPincode(pincodeMatch[0]);
          }
        }
      }
    } catch (error: any) {
      Alert.alert(
        t('common.error') || 'Error',
        error.message || t('profileSetup.locationFetchFailed') || 'Failed to fetch location',
        [{ text: t('common.ok') || 'OK' }]
      );
    } finally {
      setLocationLoading(false);
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

  const handleSave = async () => {
    if (validate()) {
      const result = await updateProfile({
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
        latitude,
        longitude,
      });

      if (result.success) {
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
      } else {
        Alert.alert(
          t('common.error'),
          result.error || t('messages.profileUpdateFailed')
        );
      }
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

          {/* Current Location Field */}
          <View style={styles.locationContainer}>
            <Text style={styles.label}>{t('profileSetup.currentLocation')}</Text>
            <View style={styles.locationInputContainer}>
              <TextInput
                style={styles.locationInput}
                placeholder={t('profileSetup.locationPlaceholder') || 'Click Fetch to get current location'}
                placeholderTextColor={theme.colors.placeholder}
                value={locationAddress}
                editable={false}
              />
              <TouchableOpacity
                style={[styles.fetchButton, locationLoading && styles.fetchButtonDisabled]}
                onPress={handleFetchLocation}
                disabled={locationLoading}>
                {locationLoading ? (
                  <ActivityIndicator size="small" color={theme.colors.textLight} />
                ) : (
                  <Text style={styles.fetchButtonText}>{t('profileSetup.fetchLocation') || 'Fetch'}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

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
          
          {/* Default Skills */}
          <View style={styles.defaultSkillsContainer}>
            {DEFAULT_SKILLS.map((skill) => (
              <TouchableOpacity
                key={skill}
                style={[
                  styles.defaultSkillChip,
                  selectedSkills.includes(skill) && styles.defaultSkillChipSelected,
                ]}
                onPress={() => toggleSkill(skill)}>
                <Text
                  style={[
                    styles.defaultSkillText,
                    selectedSkills.includes(skill) && styles.defaultSkillTextSelected,
                  ]}>
                  {t(`skills.${skill}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Manual Skill Input */}
          <View style={styles.skillInputContainer}>
            <TextInput
              style={styles.skillInput}
              placeholder={t('profileSetup.enterSkill')}
              placeholderTextColor={theme.colors.placeholder}
              value={skillInput}
              onChangeText={setSkillInput}
              onSubmitEditing={handleSkillInputSubmit}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={styles.addSkillButton}
              onPress={addSkill}
              disabled={!skillInput.trim()}>
              <Text style={[
                styles.addSkillButtonText,
                !skillInput.trim() && styles.addSkillButtonTextDisabled
              ]}>
                {t('common.add')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Selected Skills Display */}
          {selectedSkills.length > 0 && (
            <View style={styles.selectedSkillsContainer}>
              <Text style={styles.selectedSkillsLabel}>{t('profileSetup.selectSkills')}:</Text>
              <View style={styles.skillsContainer}>
                {selectedSkills.map((skill, index) => (
                  <TouchableOpacity
                    key={`${skill}-${index}`}
                    style={styles.selectedSkillChip}
                    onPress={() => removeSkill(skill)}>
                    <Text style={styles.selectedSkillText}>
                      {DEFAULT_SKILLS.includes(skill) ? t(`skills.${skill}`) : skill}
                    </Text>
                    <Text style={styles.removeSkillIcon}> ×</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
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
  defaultSkillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  },
  defaultSkillChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  defaultSkillChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  defaultSkillText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  defaultSkillTextSelected: {
    color: theme.colors.textLight,
    fontWeight: theme.typography.fontWeight.medium,
  },
  skillInputContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  skillInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.background,
  },
  addSkillButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
    marginLeft: theme.spacing.sm,
  },
  addSkillButtonText: {
    color: theme.colors.textLight,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
  },
  addSkillButtonTextDisabled: {
    opacity: 0.5,
  },
  selectedSkillsContainer: {
    marginBottom: theme.spacing.base,
  },
  selectedSkillsLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectedSkillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  selectedSkillText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textLight,
    fontWeight: theme.typography.fontWeight.medium,
  },
  removeSkillIcon: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textLight,
    marginLeft: theme.spacing.xs,
    fontWeight: theme.typography.fontWeight.bold,
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
  locationContainer: {
    marginBottom: theme.spacing.base,
  },
  locationInputContainer: {
    flexDirection: 'row',
    marginTop: theme.spacing.xs,
  },
  locationInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.backgroundGray || theme.colors.background,
  },
  fetchButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
    minWidth: 80,
  },
  fetchButtonDisabled: {
    opacity: 0.6,
  },
  fetchButtonText: {
    color: theme.colors.textLight,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
  },
});
