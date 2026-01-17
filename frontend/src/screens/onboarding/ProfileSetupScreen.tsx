import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  ActivityIndicator,
  Alert,
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
import { fetchCurrentLocation, checkLocationPermission, requestLocationPermission } from '../../utils/location';
import { APP_NAME } from '../../utils/constants';

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
  const [skillInput, setSkillInput] = React.useState('');
  const [experience, setExperience] = React.useState('');
  const [selectedLabourType, setSelectedLabourType] = React.useState('');
  const [locationAddress, setLocationAddress] = React.useState('');
  const [latitude, setLatitude] = React.useState<number | undefined>(undefined);
  const [longitude, setLongitude] = React.useState<number | undefined>(undefined);
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
    // Check permission first
    const hasPermission = await checkLocationPermission();
    
    if (!hasPermission) {
      // Show permission modal before requesting
      Alert.alert(
        'Location Permission',
        `${APP_NAME} needs access to your location to fetch your current address. Would you like to enable location access?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              setLocationLoading(false);
            },
          },
          {
            text: 'Enable',
            onPress: async () => {
              setLocationLoading(true);
              const granted = await requestLocationPermission();
              if (granted) {
                // Permission granted, now fetch location
                await fetchLocationData();
              } else {
                setLocationLoading(false);
              }
            },
          },
        ]
      );
      return;
    }
    
    // Permission already granted, fetch location
    await fetchLocationData();
  };

  const fetchLocationData = async () => {
    setLocationLoading(true);
    try {
      const locationData = await fetchCurrentLocation();
      setLocationAddress(locationData.address);
      setLatitude(locationData.latitude);
      setLongitude(locationData.longitude);
      
      // Try to extract city, state, pincode from address if they're empty
      // This is a simple extraction - you might want to improve this
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

  const isFormValid = () => {
    return (
      name.trim() !== '' &&
      address.trim() !== '' &&
      city.trim() !== '' &&
      state.trim() !== '' &&
      pincode.trim() !== '' &&
      selectedSkills.length > 0 &&
      experience.trim() !== '' &&
      selectedLabourType !== ''
    );
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
          latitude,
          longitude,
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
            required
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
            required
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
              required
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
              required
            />
          </View>

          <Input
            label={t('profileSetup.state')}
            placeholder={t('profileSetup.enterState')}
            value={state}
            onChangeText={setState}
            error={errors.state}
            required
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

          <Text style={styles.sectionTitle}>
            {t('profileSetup.skillsTitle')}
            <Text style={styles.required}> *</Text>
          </Text>
          
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
            required
          />

          <Text style={styles.sectionTitle}>
            {t('profileSetup.labourType')}
            <Text style={styles.required}> *</Text>
          </Text>
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
            disabled={!isFormValid() || loading}
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
  submitButton: {
    marginTop: theme.spacing.lg,
  },
  required: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.base,
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

