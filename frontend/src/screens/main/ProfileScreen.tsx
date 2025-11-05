import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';
import { Container } from '../../components/ui/Container';
import { Button } from '../../components/ui/Button';
import { useUserStore } from '../../stores/userStore';

export const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const currentUser = useUserStore((state) => state.currentUser);

  if (!currentUser) {
    return (
      <Container>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No user data found</Text>
        </View>
      </Container>
    );
  }

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
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
          <Text style={styles.headerTitle}>{t('profile.title')}</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.profileSection}>
          {currentUser.profilePicture ? (
            <Image
              source={{ uri: currentUser.profilePicture }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {currentUser.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <Text style={styles.name}>{currentUser.name}</Text>
          
          <View style={styles.availabilityBadge}>
            <Text
              style={[
                styles.availabilityText,
                currentUser.isAvailable && styles.availableText,
              ]}>
              {currentUser.isAvailable ? t('home.available') : t('home.notAvailable')}
            </Text>
          </View>

          <Button
            title={t('profile.editProfile')}
            onPress={handleEditProfile}
            variant="outline"
            size="medium"
            style={styles.editButton}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.personalInfo')}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{currentUser.name}</Text>
          </View>
          {currentUser.email && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{currentUser.email}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.value}>{currentUser.phone}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.location')}</Text>
          <Text style={styles.infoText}>{currentUser.address}</Text>
          <Text style={styles.infoText}>
            {currentUser.city}, {currentUser.state} - {currentUser.pincode}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.workInfo')}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>{t('profile.experience')}</Text>
            <Text style={styles.value}>
              {currentUser.experience} {t('labourDetails.years')}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Type</Text>
            <Text style={styles.value}>
              {t(`labourTypes.${currentUser.labourType}`)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.skills')}</Text>
          <View style={styles.skillsContainer}>
            {currentUser.skills.map((skill) => (
              <View key={skill} style={styles.skillBadge}>
                <Text style={styles.skillText}>{t(`skills.${skill}`)}</Text>
              </View>
            ))}
          </View>
        </View>

        {currentUser.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bio</Text>
            <Text style={styles.bioText}>{currentUser.bio}</Text>
          </View>
        )}
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
  profileSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: theme.spacing.base,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.base,
  },
  avatarText: {
    fontSize: theme.typography.fontSize.xxxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textLight,
  },
  name: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  availabilityBadge: {
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.xs,
    borderRadius: 16,
    backgroundColor: theme.colors.backgroundGray,
    marginBottom: theme.spacing.base,
  },
  availabilityText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  availableText: {
    color: theme.colors.success,
  },
  editButton: {
    paddingHorizontal: theme.spacing.xl,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.base,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
  },
  value: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
  },
  infoText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillBadge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 16,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  skillText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  bioText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textSecondary,
  },
});

