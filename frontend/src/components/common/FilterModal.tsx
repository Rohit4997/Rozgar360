import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '../../theme';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { FilterOptions, Skill, LabourType } from '../../types';
import { useLabourStore } from '../../stores/labourStore';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: () => void;
}

const DEFAULT_SKILLS: Skill[] = [
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

const LABOUR_TYPES: { value: LabourType; label: string }[] = [
  { value: 'daily', label: 'Daily Wage' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'partTime', label: 'Part Time' },
  { value: 'fullTime', label: 'Full Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
];

const SORT_OPTIONS: { value: 'rating' | 'experience' | 'distance'; label: string }[] = [
  { value: 'rating', label: 'Rating' },
  { value: 'experience', label: 'Experience' },
  { value: 'distance', label: 'Distance' },
];

export const FilterModal: React.FC<FilterModalProps> = ({ visible, onClose, onApply }) => {
  const { t } = useTranslation();
  const { filters, setFilters, clearFilters } = useLabourStore();
  const [localFilters, setLocalFilters] = React.useState<FilterOptions>(filters);

  // Sync local filters with store when modal opens
  React.useEffect(() => {
    if (visible) {
      setLocalFilters(filters);
    }
  }, [visible, filters]);

  const handleSkillToggle = (skill: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleLabourTypeToggle = (type: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      labourTypes: prev.labourTypes.includes(type)
        ? prev.labourTypes.filter((t) => t !== type)
        : [...prev.labourTypes, type],
    }));
  };

  const handleApply = () => {
    setFilters(localFilters);
    onApply();
    onClose();
  };

  const handleReset = () => {
    const defaultFilters: FilterOptions = {
      skills: [],
      experienceRange: { min: 0, max: 50 },
      labourTypes: [],
      city: undefined,
      distance: 50,
      availableOnly: false,
      minRating: 0,
      sortBy: 'rating',
    };
    setLocalFilters(defaultFilters);
    clearFilters();
  };

  const handleClear = () => {
    handleReset();
    handleApply();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('filters.title')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.content} 
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}>
            {/* City Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('filters.location')}</Text>
              <Input
                placeholder="Enter city name"
                value={localFilters.city || ''}
                onChangeText={(text) =>
                  setLocalFilters((prev) => ({ ...prev, city: text || undefined }))
                }
              />
            </View>

            {/* Distance Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('filters.distance')}</Text>
              <Text style={styles.sectionSubtitle}>
                Show labours within {localFilters.distance} km
              </Text>
              <View style={styles.distanceOptions}>
                {[10, 25, 50, 75, 100].map((distance) => (
                  <TouchableOpacity
                    key={distance}
                    onPress={() =>
                      setLocalFilters((prev) => ({ ...prev, distance }))
                    }
                    style={[
                      styles.distanceOption,
                      localFilters.distance === distance && styles.distanceOptionSelected,
                    ]}>
                    <Text
                      style={[
                        styles.distanceOptionText,
                        localFilters.distance === distance && styles.distanceOptionTextSelected,
                      ]}>
                      {distance} km
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Skills Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('filters.skills')}</Text>
              <View style={styles.chipsContainer}>
                {DEFAULT_SKILLS.map((skill) => (
                  <TouchableOpacity
                    key={skill}
                    onPress={() => handleSkillToggle(skill)}
                    style={[
                      styles.chip,
                      localFilters.skills.includes(skill) && styles.chipSelected,
                    ]}>
                    <Text
                      style={[
                        styles.chipText,
                        localFilters.skills.includes(skill) && styles.chipTextSelected,
                      ]}>
                      {skill}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Experience Range */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('filters.experienceRange')}</Text>
              <View style={styles.rangeContainer}>
                <View style={styles.rangeInput}>
                  <Text style={styles.rangeLabel}>Min</Text>
                  <TextInput
                    style={styles.rangeTextInput}
                    value={localFilters.experienceRange.min.toString()}
                    onChangeText={(text) => {
                      const value = parseInt(text) || 0;
                      setLocalFilters((prev) => ({
                        ...prev,
                        experienceRange: { ...prev.experienceRange, min: Math.max(0, value) },
                      }));
                    }}
                    keyboardType="number-pad"
                  />
                </View>
                <Text style={styles.rangeSeparator}>-</Text>
                <View style={styles.rangeInput}>
                  <Text style={styles.rangeLabel}>Max</Text>
                  <TextInput
                    style={styles.rangeTextInput}
                    value={localFilters.experienceRange.max.toString()}
                    onChangeText={(text) => {
                      const value = parseInt(text) || 50;
                      setLocalFilters((prev) => ({
                        ...prev,
                        experienceRange: { ...prev.experienceRange, max: Math.min(50, value) },
                      }));
                    }}
                    keyboardType="number-pad"
                  />
                </View>
                <Text style={styles.rangeUnit}>{t('filters.years')}</Text>
              </View>
            </View>

            {/* Labour Type */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('filters.labourType')}</Text>
              <View style={styles.chipsContainer}>
                {LABOUR_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    onPress={() => handleLabourTypeToggle(type.value)}
                    style={[
                      styles.chip,
                      localFilters.labourTypes.includes(type.value) && styles.chipSelected,
                    ]}>
                    <Text
                      style={[
                        styles.chipText,
                        localFilters.labourTypes.includes(type.value) && styles.chipTextSelected,
                      ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Availability */}
            <View style={styles.section}>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>{t('filters.availability')}</Text>
                <Switch
                  value={localFilters.availableOnly}
                  onValueChange={(value) =>
                    setLocalFilters((prev) => ({ ...prev, availableOnly: value }))
                  }
                  trackColor={{
                    false: theme.colors.border,
                    true: theme.colors.primary,
                  }}
                  thumbColor={theme.colors.background}
                />
              </View>
              <Text style={styles.switchHint}>{t('filters.availableNow')}</Text>
            </View>

            {/* Minimum Rating */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('filters.rating')} ({localFilters.minRating.toFixed(1)} {t('filters.andAbove')})
              </Text>
              <View style={styles.ratingContainer}>
                {[0, 1, 2, 3, 4, 5].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    onPress={() =>
                      setLocalFilters((prev) => ({ ...prev, minRating: rating }))
                    }
                    style={[
                      styles.ratingButton,
                      localFilters.minRating === rating && styles.ratingButtonSelected,
                    ]}>
                    <Text
                      style={[
                        styles.ratingButtonText,
                        localFilters.minRating === rating && styles.ratingButtonTextSelected,
                      ]}>
                      {rating}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sort By */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sort By</Text>
              <View style={styles.chipsContainer}>
                {SORT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() =>
                      setLocalFilters((prev) => ({ ...prev, sortBy: option.value }))
                    }
                    style={[
                      styles.chip,
                      localFilters.sortBy === option.value && styles.chipSelected,
                    ]}>
                    <Text
                      style={[
                        styles.chipText,
                        localFilters.sortBy === option.value && styles.chipTextSelected,
                      ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title={t('common.clear')}
              onPress={handleClear}
              variant="outline"
              size="medium"
              style={styles.footerButton}
            />
            <Button
              title={t('common.apply')}
              onPress={handleApply}
              variant="primary"
              size="medium"
              style={styles.footerButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    height: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  closeIcon: {
    fontSize: theme.typography.fontSize.xxl,
    color: theme.colors.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  contentContainer: {
    paddingVertical: theme.spacing.base,
    paddingBottom: theme.spacing.xl,
  },
  section: {
    marginVertical: theme.spacing.base,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  sectionSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  distanceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.xs,
  },
  distanceOption: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: 12,
    backgroundColor: theme.colors.backgroundGray,
    borderWidth: 1,
    borderColor: theme.colors.border,
    margin: theme.spacing.xs,
    minWidth: 80,
    alignItems: 'center',
  },
  distanceOptionSelected: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  distanceOptionText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  distanceOptionTextSelected: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  sliderTrack: {
    flex: 1,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    marginHorizontal: theme.spacing.sm,
    position: 'relative',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  sliderLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  quickSelectButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 16,
    marginTop: theme.spacing.xs,
  },
  quickSelectText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.xs,
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 16,
    backgroundColor: theme.colors.backgroundGray,
    borderWidth: 1,
    borderColor: theme.colors.border,
    margin: theme.spacing.xs,
  },
  chipSelected: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textPrimary,
  },
  chipTextSelected: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  rangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rangeInput: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  rangeLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  rangeTextInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: theme.spacing.sm,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.background,
  },
  rangeSeparator: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.lg,
    marginHorizontal: theme.spacing.sm,
  },
  rangeUnit: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.lg,
    marginLeft: theme.spacing.sm,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  switchLabel: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  switchHint: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginHorizontal: -theme.spacing.xs,
  },
  ratingButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: 8,
    backgroundColor: theme.colors.backgroundGray,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    margin: theme.spacing.xs,
  },
  ratingButtonSelected: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  ratingButtonText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
  },
  ratingButtonTextSelected: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.base,
    paddingBottom: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  footerButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
});

