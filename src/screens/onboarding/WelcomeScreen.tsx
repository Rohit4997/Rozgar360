import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../../theme';
import { Button } from '../../components/ui/Button';
import { Container } from '../../components/ui/Container';
import { useAppStore } from '../../stores/appStore';
import { RootStackParamList } from '../../navigation/types';

const { width } = Dimensions.get('window');

const slides = [
  {
    key: 'slide1',
    title: 'welcome.slide1Title',
    description: 'welcome.slide1Description',
    icon: '🔍',
  },
  {
    key: 'slide2',
    title: 'welcome.slide2Title',
    description: 'welcome.slide2Description',
    icon: '💼',
  },
  {
    key: 'slide3',
    title: 'welcome.slide3Title',
    description: 'welcome.slide3Description',
    icon: '🤝',
  },
];

export const WelcomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
  const setHasSeenWelcome = useAppStore((state) => state.setHasSeenWelcome);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const scrollViewRef = React.useRef<ScrollView>(null);

  const handleGetStarted = () => {
    setHasSeenWelcome(true);
    navigation.replace('Login');
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  return (
    <Container>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.appName}>{t('common.appName')}</Text>
          <Button
            title={t('common.skip')}
            onPress={handleSkip}
            variant="outline"
            size="small"
            style={styles.skipButton}
          />
        </View>

        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          style={styles.scrollView}>
          {slides.map((slide) => (
            <View key={slide.key} style={styles.slide}>
              <Text style={styles.icon}>{slide.icon}</Text>
              <Text style={styles.title}>{t(slide.title)}</Text>
              <Text style={styles.description}>{t(slide.description)}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.activeDot,
              ]}
            />
          ))}
        </View>

        <View style={styles.footer}>
          <Button
            title={
              currentIndex === slides.length - 1
                ? t('welcome.getStarted')
                : t('common.next')
            }
            onPress={handleNext}
            variant="primary"
            size="large"
          />
        </View>
      </View>
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
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.base,
  },
  appName: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  skipButton: {
    paddingHorizontal: theme.spacing.base,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  icon: {
    fontSize: 80,
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.base,
  },
  description: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.md,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.xs,
  },
  activeDot: {
    width: 24,
    backgroundColor: theme.colors.primary,
  },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
});

