import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Labour } from '../../types';
import { theme } from '../../theme';
import { Card } from '../ui/Card';
import { useLocationStore } from '../../stores/locationStore';
import { calculateDistance, formatDistance } from '../../utils/distance';

interface LabourCardProps {
  labour: Labour;
  onPress: () => void;
}

export const LabourCard = ({ labour, onPress }: LabourCardProps) => {
  const { t } = useTranslation();
  const { latitude: currentLat, longitude: currentLon } = useLocationStore();

  // Calculate distance if both locations are available
  const distance = React.useMemo(() => {
    if (
      currentLat &&
      currentLon &&
      labour.latitude &&
      labour.longitude
    ) {
      const dist = calculateDistance(
        currentLat,
        currentLon,
        labour.latitude,
        labour.longitude
      );
      return formatDistance(dist);
    }
    return null;
  }, [currentLat, currentLon, labour.latitude, labour.longitude]);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {labour.profilePicture ? (
              <Image
                source={{ uri: labour.profilePicture }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {labour.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{labour.name}</Text>
              {labour.isAvailable && (
                <View style={styles.availableBadge}>
                  <Text style={styles.availableText}>
                    {t('home.available')}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.locationRow}>
              <Text style={styles.location}>
                {labour.city}, {labour.state}
              </Text>
              {distance && (
                <Text style={styles.distance}>📍 {distance} {t('home.away') || 'away'}</Text>
              )}
            </View>
            
            {labour.rating && (
              <View style={styles.ratingRow}>
                <Text style={styles.rating}>⭐ {labour.rating.toFixed(1)}</Text>
                <Text style={styles.reviews}>
                  ({labour.totalReviews} {t('labourDetails.reviews')})
                </Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.skillsContainer}>
          {labour.skills.slice(0, 3).map((skill) => {
            // Try to translate skill, fallback to skill name if translation not found
            const translated = t(`skills.${skill}`);
            const skillLabel = translated === `skills.${skill}` ? skill : translated;
            return (
              <View key={skill} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skillLabel}</Text>
              </View>
            );
          })}
          {labour.skills.length > 3 && (
            <View style={styles.skillBadge}>
              <Text style={styles.skillText}>+{labour.skills.length - 3}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.experience}>
            {labour.experience} {t('labourDetails.years')} {t('profileSetup.experience')}
          </Text>
          <Text style={styles.type}>
            {t(`labourTypes.${labour.labourType}`)}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  avatarContainer: {
    marginRight: theme.spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textLight,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  name: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  availableBadge: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: 4,
  },
  availableText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textLight,
    fontWeight: theme.typography.fontWeight.medium,
  },
  locationRow: {
    marginBottom: theme.spacing.xs,
  },
  location: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  distance: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
    marginTop: theme.spacing.xs / 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
    marginRight: theme.spacing.xs,
  },
  reviews: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  },
  skillBadge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: 16,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  skillText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.md,
  },
  experience: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  type: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
});

