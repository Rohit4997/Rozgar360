import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Switch,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { theme } from '../../theme';
import { Container } from '../../components/ui/Container';
import { LabourCard } from '../../components/common/LabourCard';
import { FilterModal } from '../../components/common/FilterModal';
import { useUserStore } from '../../stores/userStore';
import { useLabourStore } from '../../stores/labourStore';
import { useLocationStore } from '../../stores/locationStore';
import { MainDrawerParamList, HomeStackParamList } from '../../navigation/types';
import { useUpdateCurrentLocation } from '../../hooks/useUpdateCurrentLocation';

type HomeScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'Home'>,
  DrawerNavigationProp<MainDrawerParamList>
>;

export const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { t } = useTranslation();
  const { currentUser, toggleAvailability, fetchProfile } = useUserStore();
  const { filteredLabours, searchQuery, setSearchQuery, fetchLabours, searchLabours, loading, hasActiveFilters, setUserLocation } = useLabourStore();
  const { latitude, longitude } = useLocationStore();
  const searchInputRef = React.useRef<TextInput>(null);
  const [filterModalVisible, setFilterModalVisible] = React.useState(false);
  
  // Update current location once per session
  useUpdateCurrentLocation();
  
  // Sync location to labour store
  React.useEffect(() => {
    if (latitude && longitude) {
      setUserLocation(latitude, longitude);
    }
  }, [latitude, longitude, setUserLocation]);

  // Fetch profile and labours on mount
  React.useEffect(() => {
    fetchProfile();
    fetchLabours({ availableOnly: true });
  }, [fetchProfile, fetchLabours]);

  // Search labours when search query changes
  React.useEffect(() => {
    if (searchQuery.trim()) {
      // Debounce search
      const timeoutId = setTimeout(() => {
        searchLabours({});
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      // If search is cleared, fetch all labours
      fetchLabours({ availableOnly: true });
    }
  }, [searchQuery, searchLabours, fetchLabours]);

  const handleToggleAvailability = React.useCallback(async (value: boolean) => {
    await toggleAvailability(value);
  }, [toggleAvailability]);

  const handleLabourPress = React.useCallback((labourId: string) => {
    navigation.navigate('LabourDetails', { labourId });
  }, [navigation]);

  const handleFilterPress = React.useCallback(() => {
    setFilterModalVisible(true);
  }, []);

  const handleApplyFilters = React.useCallback(() => {
    // Apply filters and fetch labours
    fetchLabours();
  }, [fetchLabours]);

  const renderHeader = React.useCallback(() => (
    <View style={styles.listHeader}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('home.allLabours')}</Text>
        <TouchableOpacity onPress={handleFilterPress} style={styles.filterButtonContainer}>
          <Text style={[styles.filterButton, hasActiveFilters() && styles.filterButtonActive]}>
            {hasActiveFilters() ? '🔧' : '⚙️'} {t('home.filters')}
          </Text>
          {hasActiveFilters() && <View style={styles.filterBadge} />}
        </TouchableOpacity>
      </View>
    </View>
  ), [t, handleFilterPress]);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      {loading ? (
        <Text style={styles.emptyText}>Loading...</Text>
      ) : (
        <Text style={styles.emptyText}>{t('home.noLabours')}</Text>
      )}
    </View>
  );

  return (
    <Container>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Text style={styles.appName}>{t('common.appName')}</Text>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.header}>
          <View style={styles.availabilityCard}>
            <View style={styles.availabilityContent}>
              <View>
                <Text style={styles.availabilityTitle}>
                  {t('home.availability')}
                </Text>
                <Text style={styles.availabilityStatus}>
                  {currentUser?.isAvailable
                    ? t('home.available')
                    : t('home.notAvailable')}
                </Text>
              </View>
              <Switch
                value={currentUser?.isAvailable || false}
                onValueChange={handleToggleAvailability}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.success,
                }}
                thumbColor={theme.colors.background}
              />
            </View>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder={t('home.searchLabour')}
              placeholderTextColor={theme.colors.placeholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.searchIcon}>
              <Text style={styles.searchIconText}>🔍</Text>
            </TouchableOpacity>
          </View>

        </View>

        <FlatList
          data={filteredLabours.filter((l) => l.id !== currentUser?.id)}
          renderItem={({ item }) => (
            <LabourCard
              labour={item}
              onPress={() => handleLabourPress(item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
        />

        <FilterModal
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          onApply={handleApplyFilters}
        />
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  appName: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  menuIcon: {
    fontSize: theme.typography.fontSize.xxl,
    color: theme.colors.textPrimary,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  header: {
    marginVertical: theme.spacing.base,
    paddingHorizontal: theme.spacing.lg,
  },
  listHeader: {
    marginTop: theme.spacing.base,
  },
  availabilityCard: {
    backgroundColor: theme.colors.backgroundGray,
    borderRadius: 12,
    padding: theme.spacing.base,
    marginBottom: theme.spacing.lg,
  },
  availabilityContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availabilityTitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  availabilityStatus: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.backgroundGray,
    borderRadius: 24,
    paddingHorizontal: theme.spacing.base,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
  },
  searchIcon: {
    padding: theme.spacing.sm,
  },
  searchIconText: {
    fontSize: theme.typography.fontSize.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  filterButtonContainer: {
    position: 'relative',
  },
  filterButton: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  filterButtonActive: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxxl,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
  },
});

