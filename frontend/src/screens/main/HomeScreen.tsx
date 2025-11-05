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
import { useUserStore } from '../../stores/userStore';
import { useLabourStore } from '../../stores/labourStore';
import { MainDrawerParamList, HomeStackParamList } from '../../navigation/types';

type HomeScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'Home'>,
  DrawerNavigationProp<MainDrawerParamList>
>;

export const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { t } = useTranslation();
  const { currentUser, toggleAvailability } = useUserStore();
  const { filteredLabours, searchQuery, setSearchQuery } = useLabourStore();

  const handleLabourPress = (labourId: string) => {
    navigation.navigate('LabourDetails', { labourId });
  };

  const handleFilterPress = () => {
    // Navigate to filter screen (can be implemented as modal or separate screen)
  };

  const renderHeader = () => (
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
            onValueChange={toggleAvailability}
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

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('home.allLabours')}</Text>
        <TouchableOpacity onPress={handleFilterPress}>
          <Text style={styles.filterButton}>⚙️ {t('home.filters')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{t('home.noLabours')}</Text>
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
  filterButton: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
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

