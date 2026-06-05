import { useMemo, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    TextInput,
    View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ContactMode = 'email' | 'phone';

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  topic: string;
  contactMode: ContactMode;
  urgent: boolean;
};

const TOPICS = ['Bug report', 'Feature request', 'Billing', 'Partnership', 'General'] as const;

export default function SmartFormScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormState>({
    fullName: '',
    email: '',
    phone: '',
    topic: '',
    contactMode: 'email',
    urgent: false,
  });

  const palette = useMemo(
    () =>
      colorScheme === 'dark'
        ? {
            surface: '#101315',
            border: '#2f3a3f',
            borderStrong: '#5ec6ff',
            chip: '#152025',
            chipActive: '#1a3c52',
            inputBg: '#131a1d',
            textMuted: '#9fb0b8',
            button: '#5ec6ff',
            buttonText: '#07131a',
            danger: '#ff8f8f',
            success: '#89e2a7',
          }
        : {
            surface: '#f6fafc',
            border: '#cad8e0',
            borderStrong: '#0077b6',
            chip: '#e8f0f5',
            chipActive: '#cde8f7',
            inputBg: '#ffffff',
            textMuted: '#526672',
            button: '#0077b6',
            buttonText: '#f7fdff',
            danger: '#b63232',
            success: '#1f8a4c',
          },
    [colorScheme]
  );

  const errors = useMemo(() => {
    const next: Partial<Record<keyof FormState, string>> = {};

    if (form.fullName.trim().length < 3) {
      next.fullName = 'Please enter at least 3 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.contactMode === 'email' && !emailRegex.test(form.email.trim())) {
      next.email = 'Enter a valid email address.';
    }

    const phoneDigits = form.phone.replace(/\D/g, '');
    if (form.contactMode === 'phone' && phoneDigits.length < 10) {
      next.phone = 'Phone number must contain at least 10 digits.';
    }

    if (!form.topic) {
      next.topic = 'Please choose a topic.';
    }

    return next;
  }, [form]);

  const completion = useMemo(() => {
    const checks = [
      form.fullName.trim().length >= 3,
      form.topic.length > 0,
      form.contactMode === 'email'
        ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
        : form.phone.replace(/\D/g, '').length >= 10,
    ];

    const done = checks.filter(Boolean).length;
    return Math.round((done / checks.length) * 100);
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSubmitted(false);
  };

  const submit = () => {
    setSubmitted(true);
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.headerCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <ThemedText style={[styles.kicker, { color: palette.textMuted }]}>Smart Form</ThemedText>
            <ThemedText type="title" style={styles.title}>
              Contact Intake
            </ThemedText>
            <ThemedText style={[styles.description, { color: palette.textMuted }]}>
              Dynamic validation changes based on your contact preference and selected topic.
            </ThemedText>
            <ThemedText type="defaultSemiBold">Completion: {completion}%</ThemedText>
          </View>

          <View style={styles.block}>
            <ThemedText type="defaultSemiBold">Full name</ThemedText>
            <TextInput
              value={form.fullName}
              onChangeText={(value) => setField('fullName', value)}
              placeholder="Enter your full name"
              placeholderTextColor={palette.textMuted}
              style={[
                styles.input,
                {
                  backgroundColor: palette.inputBg,
                  borderColor: errors.fullName ? palette.danger : palette.border,
                },
              ]}
            />
            {errors.fullName ? <ThemedText style={{ color: palette.danger }}>{errors.fullName}</ThemedText> : null}
          </View>

          <View style={styles.block}>
            <ThemedText type="defaultSemiBold">Topic</ThemedText>
            <View style={styles.rowWrap}>
              {TOPICS.map((topic) => {
                const active = form.topic === topic;
                return (
                  <Pressable
                    key={topic}
                    onPress={() => setField('topic', topic)}
                    style={({ pressed }) => [
                      styles.chip,
                      {
                        borderColor: active ? palette.borderStrong : palette.border,
                        backgroundColor: active ? palette.chipActive : palette.chip,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}>
                    <ThemedText type="defaultSemiBold" style={styles.chipText}>
                      {topic}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
            {errors.topic ? <ThemedText style={{ color: palette.danger }}>{errors.topic}</ThemedText> : null}
          </View>

          <View style={styles.block}>
            <ThemedText type="defaultSemiBold">Preferred contact</ThemedText>
            <View style={styles.rowWrap}>
              {(['email', 'phone'] as const).map((mode) => {
                const active = form.contactMode === mode;
                return (
                  <Pressable
                    key={mode}
                    onPress={() => setField('contactMode', mode)}
                    style={({ pressed }) => [
                      styles.choice,
                      {
                        borderColor: active ? palette.borderStrong : palette.border,
                        backgroundColor: active ? palette.chipActive : palette.inputBg,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}>
                    <ThemedText type="defaultSemiBold">{mode.toUpperCase()}</ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {form.contactMode === 'email' ? (
            <View style={styles.block}>
              <ThemedText type="defaultSemiBold">Email</ThemedText>
              <TextInput
                value={form.email}
                onChangeText={(value) => setField('email', value)}
                placeholder="name@example.com"
                placeholderTextColor={palette.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[
                  styles.input,
                  {
                    backgroundColor: palette.inputBg,
                    borderColor: errors.email ? palette.danger : palette.border,
                  },
                ]}
              />
              {errors.email ? <ThemedText style={{ color: palette.danger }}>{errors.email}</ThemedText> : null}
            </View>
          ) : (
            <View style={styles.block}>
              <ThemedText type="defaultSemiBold">Phone</ThemedText>
              <TextInput
                value={form.phone}
                onChangeText={(value) => setField('phone', value)}
                placeholder="(000) 000-0000"
                placeholderTextColor={palette.textMuted}
                keyboardType="phone-pad"
                style={[
                  styles.input,
                  {
                    backgroundColor: palette.inputBg,
                    borderColor: errors.phone ? palette.danger : palette.border,
                  },
                ]}
              />
              {errors.phone ? <ThemedText style={{ color: palette.danger }}>{errors.phone}</ThemedText> : null}
            </View>
          )}

          <View style={[styles.switchRow, { borderColor: palette.border, backgroundColor: palette.surface }]}>
            <View style={styles.flex}>
              <ThemedText type="defaultSemiBold">Mark as urgent</ThemedText>
              <ThemedText style={{ color: palette.textMuted }}>Adds priority handling by support.</ThemedText>
            </View>
            <Switch
              value={form.urgent}
              onValueChange={(value) => setField('urgent', value)}
              trackColor={{ false: '#94a3b8', true: palette.borderStrong }}
            />
          </View>

          <Pressable
            onPress={submit}
            style={({ pressed }) => [
              styles.submit,
              {
                backgroundColor: isValid ? palette.button : palette.border,
                opacity: pressed ? 0.87 : 1,
              },
            ]}>
            <ThemedText style={[styles.submitText, { color: isValid ? palette.buttonText : palette.textMuted }]}>
              Submit Smart Form
            </ThemedText>
          </Pressable>

          {submitted ? (
            <ThemedText style={{ color: isValid ? palette.success : palette.danger }}>
              {isValid
                ? 'Form submitted successfully. Your request is ready for processing.'
                : 'Please fix validation errors before submitting.'}
            </ThemedText>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
    gap: 16,
  },
  headerCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 8,
  },
  kicker: {
    fontSize: 13,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontFamily: Fonts.mono,
  },
  title: {
    fontFamily: Fonts.rounded,
  },
  description: {
    lineHeight: 22,
  },
  block: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 16,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipText: {
    fontFamily: Fonts.sans,
  },
  choice: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  switchRow: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  submit: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Fonts.sans,
  },
});
