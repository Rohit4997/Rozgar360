import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../../theme';
import { Container } from '../../components/ui/Container';
import { Button } from '../../components/ui/Button';
import { useLabourStore } from '../../stores/labourStore';
import { HomeStackParamList } from '../../navigation/types';
import { useLocationStore } from '../../stores/locationStore';
import { calculateDistance, formatDistance } from '../../utils/distance';

type LabourDetailsScreenNavigationProp = NativeStackNavigationProp<
  HomeStackParamList,
  'LabourDetails'
>;
type LabourDetailsScreenRouteProp = RouteProp<HomeStackParamList, 'LabourDetails'>;

export const LabourDetailsScreen = () => {
  const navigation = useNavigation<LabourDetailsScreenNavigationProp>();
  const route = useRoute<LabourDetailsScreenRouteProp>();
  const { t } = useTranslation();
  const { labourId } = route.params;
  const getLabourById = useLabourStore((state) => state.getLabourById);
  const { latitude: currentLat, longitude: currentLon } = useLocationStore();
  const [labour, setLabour] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  // Calculate distance if both locations are available
  const distance = React.useMemo(() => {
    if (
      currentLat &&
      currentLon &&
      labour?.latitude &&
      labour?.longitude
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
  }, [currentLat, currentLon, labour?.latitude, labour?.longitude]);

  React.useEffect(() => {
    const fetchLabour = async () => {
      try {
        const result = await getLabourById(labourId);
        setLabour(result);
      } catch (error) {
        console.error('Error fetching labour:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLabour();
  }, [labourId, getLabourById]);

  if (loading) {
    return (
      <Container>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Loading...</Text>
        </View>
      </Container>
    );
  }

  if (!labour) {
    return (
      <Container>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Labour not found</Text>
        </View>
      </Container>
    );
  }

  const handleCall = () => {
    Linking.openURL(`tel:${labour.phone}`);
  };

  const handleMessage = () => {
    Linking.openURL(`sms:${labour.phone}`);
  };

  const handleNavigate = () => {
    if (!labour.latitude || !labour.longitude) {
      Alert.alert(
        t('common.error') || 'Error',
        t('labourDetails.locationNotAvailable') || 'Location not available for this labourer'
      );
      return;
    }

    const { latitude, longitude } = labour;
    
    // Try Google Maps navigation (turn-by-turn)
    // Format: google.navigation:q=latitude,longitude
    const googleNavUrl = `google.navigation:q=${latitude},${longitude}`;
    
    // Fallback to geo URI if Google Maps not available
    const geoUrl = `geo:${latitude},${longitude}?q=${latitude},${longitude}`;
    
    // Web fallback
    const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

    // Try Google Maps navigation first
    Linking.canOpenURL(googleNavUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(googleNavUrl);
        } else {
          // Try geo URI
          return Linking.canOpenURL(geoUrl).then((geoSupported) => {
            if (geoSupported) {
              return Linking.openURL(geoUrl);
            } else {
              // Fallback to web
              return Linking.openURL(webUrl);
            }
          });
        }
      })
      .catch((err) => {
        console.error('Error opening maps:', err);
        // Fallback to web
        Linking.openURL(webUrl).catch((webErr) => {
          console.error('Error opening web maps:', webErr);
          Alert.alert(
            t('common.error') || 'Error',
            t('labourDetails.mapOpenFailed') || 'Failed to open maps. Please try again.'
          );
        });
      });
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
        </View>

        <View style={styles.profileSection}>
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

          <Text style={styles.name}>{labour.name}</Text>
          
          <View style={styles.availabilityBadge}>
            <Text
              style={[
                styles.availabilityText,
                labour.isAvailable && styles.availableText,
              ]}>
              {labour.isAvailable ? t('home.available') : t('home.notAvailable')}
            </Text>
          </View>

          {labour.rating ? (
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>⭐ {labour.rating.toFixed(1)}</Text>
              <Text style={styles.reviews}>
                ({(labour.totalReviews || 0)} {t('labourDetails.reviews')})
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('labourDetails.contact')}</Text>
          <View style={styles.contactRow}>
            <Button
              title={t('labourDetails.call')}
              onPress={handleCall}
              variant="primary"
              size="medium"
              style={styles.contactButton}
            />
            <Button
              title={t('labourDetails.message')}
              onPress={handleMessage}
              variant="outline"
              size="medium"
              style={styles.contactButton}
            />
          </View>
          <Text style={styles.infoText}>📞 {labour.phone}</Text>
          {labour.email ? <Text style={styles.infoText}>✉️ {labour.email}</Text> : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('labourDetails.location')}</Text>
          <Text style={styles.infoText}>📍 {labour.address}</Text>
          <Text style={styles.infoText}>
            {labour.city}, {labour.state} - {labour.pincode}
          </Text>
          {distance ? (
            <Text style={styles.distanceText}>
              📍 {distance} {t('home.away') || 'away'}
            </Text>
          ) : null}
          {labour.latitude && labour.longitude ? (
            <Button
              title={t('labourDetails.navigate') || '🗺️ Navigate'}
              onPress={handleNavigate}
              variant="primary"
              size="medium"
              style={styles.navigateButton}
            />
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('labourDetails.skills')}</Text>
          <View style={styles.skillsContainer}>
            {labour.skills.map((skill: string) => {
              // Try to translate skill, fallback to skill name if translation not found
              const translated = t(`skills.${skill}`);
              const skillLabel = translated === `skills.${skill}` ? skill : translated;
              return (
                <View key={skill} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{skillLabel}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('labourDetails.experience')}</Text>
          <Text style={styles.infoText}>
            {labour.experience} {t('labourDetails.years')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type</Text>
          <Text style={styles.infoText}>
            {t(`labourTypes.${labour.labourType}`)}
          </Text>
        </View>

        {labour.bio ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('labourDetails.about')}</Text>
            <Text style={styles.bioText}>{labour.bio}</Text>
          </View>
        ) : null}
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: theme.spacing.base,
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
  profileSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: theme.spacing.base,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.base,
  },
  avatarText: {
    fontSize: theme.typography.fontSize.huge,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textLight,
  },
  name: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  availabilityBadge: {
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.xs,
    borderRadius: 16,
    backgroundColor: theme.colors.backgroundGray,
    marginBottom: theme.spacing.md,
  },
  availabilityText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  availableText: {
    color: theme.colors.success,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginRight: theme.spacing.xs,
  },
  reviews: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
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
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  contactButton: {
    flex: 0.48,
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
  distanceText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
    marginTop: theme.spacing.xs,
  },
  navigateButton: {
    marginTop: theme.spacing.md,
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

