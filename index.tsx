import { Image } from 'expo-image';
import { Platform, Pressable, StyleSheet } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link, type Href } from 'expo-router';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>

      <Link href="/category-selection" asChild>
        <Pressable
          accessibilityRole="link"
          style={({ pressed }) => [styles.categoryCard, pressed && styles.cardPressed]}>
          <ThemedText type="subtitle">Category Selection</ThemedText>
          <ThemedText>Pick the topics you care about and personalize your feed.</ThemedText>
          <ThemedText type="link">Open selection page</ThemedText>
        </Pressable>
      </Link>

      <Link href="/smart-form" asChild>
        <Pressable
          accessibilityRole="link"
          style={({ pressed }) => [styles.formCard, pressed && styles.cardPressed]}>
          <ThemedText type="subtitle">Smart Form</ThemedText>
          <ThemedText>Try dynamic validation and conditional inputs in a modern intake form.</ThemedText>
          <ThemedText type="link">Open smart form</ThemedText>
        </Pressable>
      </Link>

      <Link href={'/phone-verification' as Href} asChild>
        <Pressable
          accessibilityRole="link"
          style={({ pressed }) => [styles.phoneCard, pressed && styles.cardPressed]}>
          <ThemedText type="subtitle">Phone Verification</ThemedText>
          <ThemedText>Sign in with SMS OTP using Firebase Authentication.</ThemedText>
          <ThemedText type="link">Open phone verification</ThemedText>
        </Pressable>
      </Link>

      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">Step 2: Explore</ThemedText>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
            <Link.MenuAction
              title="Share"
              icon="square.and.arrow.up"
              onPress={() => alert('Share pressed')}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Delete"
                icon="trash"
                destructive
                onPress={() => alert('Delete pressed')}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  categoryCard: {
    gap: 8,
    marginBottom: 12,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#0a7ea433',
  },
  formCard: {
    gap: 8,
    marginBottom: 12,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#0077b633',
  },
  phoneCard: {
    gap: 8,
    marginBottom: 12,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#0a845033',
  },
  cardPressed: {
    opacity: 0.75,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
