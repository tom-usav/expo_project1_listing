import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const CATEGORIES = [
  'Business',
  'Nhà Cửa',
  'Science',
  'Health',
  'Design',
  'Sports',
  'Travel',
  'Food',
  'Finance',
  'Education',
  'Gaming',
  'Art',
] as const;

export default function CategorySelectionScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(['Business']);

  const palette = useMemo(
    () =>
      colorScheme === 'dark'
        ? {
            surface: '#101312',
            border: '#3a4542',
            borderSelected: '#65d3b5',
            chip: '#1a2220',
            chipSelected: '#204d44',
            button: '#65d3b5',
            buttonText: '#0b1714',
            muted: '#a6bbb4',
          }
        : {
            surface: '#f8faf8',
            border: '#d4e0dc',
            borderSelected: '#0f7f66',
            chip: '#ebf2ef',
            chipSelected: '#cde8df',
            button: '#0f7f66',
            buttonText: '#f7fffc',
            muted: '#4e5d58',
          },
    [colorScheme]
  );

  const toggleCategory = (category: string) => {
    setSelected((prev) =>
      prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category]
    );
  };

  const canContinue = selected.length > 0;

  const handleContinue = () => {
    if (!canContinue) {
      return;
    }

    const preferredCategory = selected.includes('Business') ? 'Business' : selected[0];

    router.push({
      pathname: '/dynamic-inputs',
      params: {
        category: preferredCategory,
      },
    });
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.bgOrb, styles.bgOrbTop]} />
      <View style={[styles.bgOrb, styles.bgOrbBottom]} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.headerCard, { borderColor: palette.border, backgroundColor: palette.surface }]}>
          <ThemedText style={styles.overline}>Business</ThemedText>
          <ThemedText type="title" style={styles.title}>
            Choose Business Categories
          </ThemedText>
          <ThemedText style={[styles.description, { color: palette.muted }]}>
            Select the business topics you want to prioritize for recommendations and follow-up screens.
          </ThemedText>
          <ThemedText type="defaultSemiBold">
            {selected.length} {selected.length === 1 ? 'category' : 'categories'} selected
          </ThemedText>
        </View>

        <View style={styles.grid}>
          {CATEGORIES.map((category) => {
            const isSelected = selected.includes(category);

            return (
              <Pressable
                key={category}
                onPress={() => toggleCategory(category)}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    borderColor: isSelected ? palette.borderSelected : palette.border,
                    backgroundColor: isSelected ? palette.chipSelected : palette.chip,
                    opacity: pressed ? 0.82 : 1,
                  },
                ]}>
                <ThemedText
                  type="defaultSemiBold"
                  style={{
                    fontFamily: Fonts.rounded,
                    letterSpacing: 0.2,
                  }}>
                  {category}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={handleContinue}
          disabled={!canContinue}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: canContinue ? palette.button : palette.border,
              opacity: pressed ? 0.88 : 1,
            },
          ]}>
          <ThemedText style={[styles.buttonText, { color: canContinue ? palette.buttonText : palette.muted }]}>Continue</ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
    gap: 18,
  },
  bgOrb: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 999,
    opacity: 0.08,
    backgroundColor: '#0f7f66',
  },
  bgOrbTop: {
    right: -60,
    top: -20,
  },
  bgOrbBottom: {
    left: -40,
    bottom: 140,
  },
  headerCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
  overline: {
    fontSize: 13,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontFamily: Fonts.mono,
    opacity: 0.82,
  },
  title: {
    fontFamily: Fonts.rounded,
    lineHeight: 38,
  },
  description: {
    lineHeight: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  button: {
    marginTop: 10,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Fonts.sans,
  },
});
