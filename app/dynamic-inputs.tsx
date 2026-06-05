import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
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
import { checkApiServerHealth, syncDynamicInputsToServer } from '@/lib/api';
import {
  clearDynamicInputsRecord,
  initDynamicInputsTable,
  loadDynamicInputsRecord,
  saveDynamicInputsRecord,
} from '@/lib/local-db';

type FieldType = 'text' | 'number' | 'select' | 'toggle';

type FieldConfig = {
  key: string;
  label: string;
  placeholder?: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
};

const CATEGORY_FORMS: Record<string, { title: string; description: string; fields: FieldConfig[] }> = {
  'Nhà Cửa': {
    title: 'Dynamic Inputs - Nha Cua',
    description: 'Cau hinh nhu cau nha o voi bo truong du lieu linh hoat theo danh muc da chon.',
    fields: [
      {
        key: 'propertyType',
        label: 'Loai nha',
        type: 'select',
        required: true,
        options: ['Can ho', 'Nha pho', 'Biet thu', 'Dat nen'],
      },
      {
        key: 'location',
        label: 'Vi tri',
        type: 'text',
        required: true,
        placeholder: 'VD: Quan 1, TP. Ho Chi Minh',
      },
      {
        key: 'area',
        label: 'Dien tich (m2)',
        type: 'number',
        required: true,
        placeholder: 'VD: 85',
      },
      {
        key: 'bedrooms',
        label: 'So phong ngu',
        type: 'number',
        required: true,
        placeholder: 'VD: 3',
      },
      {
        key: 'budget',
        label: 'Ngan sach (VND)',
        type: 'number',
        required: true,
        placeholder: 'VD: 2500000000',
      },
      {
        key: 'furnishing',
        label: 'Noi that',
        type: 'select',
        options: ['Ban giao tho', 'Co ban', 'Day du'],
      },
      {
        key: 'needParking',
        label: 'Can cho do xe',
        type: 'toggle',
      },
      
      {
        key: 'note',
        label: 'Ghi chu them',
        type: 'text',
        placeholder: 'Uu tien gan truong hoc, benh vien...',
      },
    ],
  },
};

const FALLBACK_FORM = {
  title: 'Dynamic Inputs',
  description: 'Nhap thong tin theo danh muc duoc chon.',
  fields: [
    {
      key: 'title',
      label: 'Tieu de',
      type: 'text' as const,
      required: true,
      placeholder: 'Nhap tieu de',
    },
    {
      key: 'description',
      label: 'Mo ta',
      type: 'text' as const,
      placeholder: 'Them thong tin chi tiet',
    },
  ],
};

export default function DynamicInputsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const params = useLocalSearchParams<{ category?: string | string[] }>();
  const selectedCategory = Array.isArray(params.category)
    ? params.category[0] ?? 'Nhà Cửa'
    : params.category ?? 'Nhà Cửa';

  const config = CATEGORY_FORMS[selectedCategory] ?? FALLBACK_FORM;
  const palette = useMemo(
    () =>
      colorScheme === 'dark'
        ? {
            surface: '#101315',
            border: '#2f3a3f',
            borderStrong: '#0fbf92',
            chip: '#172321',
            chipActive: '#1f4d43',
            inputBg: '#13191b',
            textMuted: '#9db0a9',
            button: '#0fbf92',
            buttonText: '#081611',
            danger: '#ff9c9c',
            success: '#8be0ab',
          }
        : {
            surface: '#f5faf8',
            border: '#cdded8',
            borderStrong: '#0f7f66',
            chip: '#e7f2ee',
            chipActive: '#cce7de',
            inputBg: '#ffffff',
            textMuted: '#4f625c',
            button: '#0f7f66',
            buttonText: '#f7fffc',
            danger: '#bc3838',
            success: '#228c53',
          },
    [colorScheme]
  );

  const createInitialValues = useMemo(() => {
    const base: Record<string, string | boolean> = {};
    config.fields.forEach((field) => {
      if (field.type === 'toggle') {
        base[field.key] = false;
      } else {
        base[field.key] = '';
      }
    });
    return () => ({ ...base });
  }, [config.fields]);

  const [values, setValues] = useState<Record<string, string | boolean>>(() => createInitialValues());
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phoneVerificationCode, setPhoneVerificationCode] = useState<string | null>(null);
  const [emailVerificationCode, setEmailVerificationCode] = useState<string | null>(null);
  const [phoneVerificationInput, setPhoneVerificationInput] = useState('');
  const [emailVerificationInput, setEmailVerificationInput] = useState('');
  const [pendingSave, setPendingSave] = useState<{
    values: Record<string, string | boolean>;
    imageUris: string[];
    phone: string;
    email: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline' | 'unreachable'>('checking');

  useEffect(() => {
    const loadSavedData = async () => {
      try {
        await initDynamicInputsTable();
        const record = await loadDynamicInputsRecord(selectedCategory);
        if (!record) {
          setValues(createInitialValues());
          setImageUris([]);
          setSavedAt(null);
          return;
        }

        setValues({ ...createInitialValues(), ...(record.values ?? {}) });
        setImageUris(Array.isArray(record.imageUris) ? record.imageUris : []);
        setSavedAt(typeof record.updatedAt === 'string' ? record.updatedAt : null);
      } catch {
        Alert.alert('Load failed', 'Unable to load saved data for this category.');
      }
    };

    loadSavedData();
  }, [createInitialValues, selectedCategory]);

  useEffect(() => {
    let isMounted = true;

    const refreshApiStatus = async () => {
      const status = await checkApiServerHealth();
      if (!isMounted) {
        return;
      }
      setApiStatus(status);
    };

    refreshApiStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateValue = (key: string, value: string | boolean) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSubmitted(false);
  };

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow photo library access to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 10,
      quality: 0.8,
    });

    if (result.canceled) {
      return;
    }

    const pickedUris = result.assets.map((asset) => asset.uri);
    setImageUris((prev) => {
      const merged = Array.from(new Set([...prev, ...pickedUris]));
      return merged.slice(0, 10);
    });
    setSubmitted(false);
  };

  const removeImage = (uri: string) => {
    setImageUris((prev) => prev.filter((item) => item !== uri));
    setSubmitted(false);
  };

  const errors = useMemo(() => {
    const next: Record<string, string> = {};

    config.fields.forEach((field) => {
      if (!field.required) {
        return;
      }

      const raw = values[field.key];
      const val = typeof raw === 'string' ? raw.trim() : raw;

      if (field.type === 'toggle') {
        return;
      }

      if (!val) {
        next[field.key] = 'Truong nay la bat buoc.';
        return;
      }

      if (field.type === 'number' && typeof val === 'string' && Number.isNaN(Number(val))) {
        next[field.key] = 'Gia tri so khong hop le.';
      }
    });

    if (selectedCategory === 'Nhà Cửa' && imageUris.length === 0) {
      next.images = 'Vui long tai len it nhat 1 hinh anh.';
    }

    return next;
  }, [config.fields, imageUris.length, selectedCategory, values]);

  const requiredCount =
    config.fields.filter((field) => field.required && field.type !== 'toggle').length +
    (selectedCategory === 'Nhà Cửa' ? 1 : 0);
  const completedRequired = config.fields.filter((field) => {
    if (!field.required || field.type === 'toggle') {
      return false;
    }

    const current = values[field.key];
    return typeof current === 'string' ? current.trim().length > 0 : Boolean(current);
  }).length;

  const completionBase = completedRequired + (selectedCategory === 'Nhà Cửa' && imageUris.length > 0 ? 1 : 0);
  const completion = requiredCount === 0 ? 100 : Math.round((completionBase / requiredCount) * 100);
  const isValid = Object.keys(errors).length === 0;

  const clearVerificationState = () => {
    setPhoneVerificationCode(null);
    setEmailVerificationCode(null);
    setPhoneVerificationInput('');
    setEmailVerificationInput('');
    setPendingSave(null);
    setIsVerifying(false);
  };

  const isPhoneValid = (phone: string) => /^\+?[0-9]{9,15}$/.test(phone.trim());
  const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const submit = async () => {
    setSubmitted(true);

    if (!isValid) {
      return;
    }

    if (!isPhoneValid(contactPhone)) {
      Alert.alert('Invalid phone', 'Please enter a valid phone number (9-15 digits, optional +).');
      return;
    }

    if (!isEmailValid(contactEmail)) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }

    const phoneCode = String(Math.floor(100000 + Math.random() * 900000));
    const emailCode = String(Math.floor(100000 + Math.random() * 900000));

    setPhoneVerificationCode(phoneCode);
    setEmailVerificationCode(emailCode);
    setPhoneVerificationInput('');
    setEmailVerificationInput('');
    setPendingSave({
      values: { ...values },
      imageUris: [...imageUris],
      phone: contactPhone.trim(),
      email: contactEmail.trim(),
    });

    Alert.alert(
      'Verification required',
      `Phone code: ${phoneCode}\nEmail code: ${emailCode}\nEnter both codes below to save.`
    );
  };

  const verifyAndSave = async () => {
    console.log('Verify and save pressed');

    if (!phoneVerificationCode || !emailVerificationCode || !pendingSave) {
      Alert.alert('Verification missing', 'Submit the form first to generate verification codes.');
      return;
    }

    if (phoneVerificationInput.trim() !== phoneVerificationCode) {
      Alert.alert('Invalid phone code', 'Phone verification code is incorrect.');
      return;
    }

    if (emailVerificationInput.trim() !== emailVerificationCode) {
      Alert.alert('Invalid email code', 'Email verification code is incorrect.');
      return;
    }

        try {
          const now = new Date().toISOString();

          const recordToSave = {
            category: selectedCategory,
            values: pendingSave.values,
            imageUris: pendingSave.imageUris,
            contact: {
              phone: pendingSave.phone,
              email: pendingSave.email,
            },
            status: 'pending' as const,
            updatedAt: now,
          };

          await initDynamicInputsTable();
          await saveDynamicInputsRecord(recordToSave);

          try {
            await syncDynamicInputsToServer(recordToSave);
            Alert.alert('Saved', 'Your data has been saved locally and synced to server.');
          } catch (syncError) {
            const message = syncError instanceof Error ? syncError.message : 'Unknown sync error';
            console.error('Server sync failed:', syncError);
            Alert.alert(
              'Saved locally',
              `Your data was saved locally, but server sync failed. ${message}`,
            );
          }

          setSavedAt(now);
          clearVerificationState();

          Alert.alert('Saved', 'Your Nhà Cửa data has been saved locally and synced to MySQL.');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          console.error('Save or sync failed:', error);
          Alert.alert('Save failed', message);
        } finally {
          setIsVerifying(false);
        }
  };

  const clearSavedData = async () => {
    if (isClearing) {
      return;
    }

    setIsClearing(true);

    try {
      await initDynamicInputsTable();
      await clearDynamicInputsRecord(selectedCategory);
      setValues(createInitialValues());
      setImageUris([]);
      setSavedAt(null);
      setSubmitted(false);
      clearVerificationState();
      Alert.alert('Cleared', 'Saved data has been removed for this category.');
    } catch {
      Alert.alert('Clear failed', 'Unable to clear saved data. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  const confirmClearSavedData = () => {
    Alert.alert('Clear saved data?', 'This will remove all saved inputs for the current category.', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: clearSavedData,
      },
    ]);
  };

  const formattedSavedAt = savedAt ? new Date(savedAt).toLocaleString() : null;

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={[styles.heroCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <ThemedText style={[styles.categoryTag, { color: palette.textMuted }]}>Category: {selectedCategory}</ThemedText>
            <ThemedText type="title" style={styles.title}>
              {config.title}
            </ThemedText>
          
          <ThemedText style={[styles.description, { color: palette.textMuted }]}>{config.description}</ThemedText>
          <ThemedText
            style={{
              color:
                apiStatus === 'online'
                  ? palette.success
                  : apiStatus === 'checking'
                  ? palette.textMuted
                  : palette.danger,
            }}>
            {apiStatus === 'checking'
              ? 'Checking API server status...'
              : apiStatus === 'online'
              ? 'API server reachable'
              : apiStatus === 'offline'
              ? 'No network connection or API server unreachable'
              : 'API server unreachable'}
          </ThemedText>
          <ThemedText type="defaultSemiBold">Completion: {completion}%</ThemedText>
          {formattedSavedAt ? (
            <ThemedText style={{ color: palette.textMuted }}>Saved at: {formattedSavedAt}</ThemedText>
          ) : null}
        </View>

        {config.fields.map((field) => {
          const value = values[field.key];
          const error = errors[field.key];

          if (field.type === 'toggle') {
            return (
              <View
                key={field.key}
                style={[styles.switchCard, { borderColor: palette.border, backgroundColor: palette.surface }]}>
                <View style={styles.flex}>
                  <ThemedText type="defaultSemiBold">{field.label}</ThemedText>
                </View>
                <Switch
                  value={Boolean(value)}
                  onValueChange={(next) => updateValue(field.key, next)}
                  trackColor={{ false: '#9ca3af', true: palette.borderStrong }}
                />
              </View>
            );
          }

          if (field.type === 'select') {
            return (
              <View key={field.key} style={styles.block}>
                <ThemedText type="defaultSemiBold">
                  {field.label}
                  {field.required ? ' *' : ''}
                </ThemedText>
                <View style={styles.rowWrap}>
                  {(field.options ?? []).map((option) => {
                    const active = value === option;
                    return (
                      <Pressable
                        key={option}
                        onPress={() => updateValue(field.key, option)}
                        style={({ pressed }) => [
                          styles.optionChip,
                          {
                            borderColor: active ? palette.borderStrong : palette.border,
                            backgroundColor: active ? palette.chipActive : palette.chip,
                            opacity: pressed ? 0.85 : 1,
                          },
                        ]}>
                        <ThemedText type="defaultSemiBold">{option}</ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
                {error ? <ThemedText style={{ color: palette.danger }}>{error}</ThemedText> : null}
              </View>
            );
          }

          return (
            <View key={field.key} style={styles.block}>
              <ThemedText type="defaultSemiBold">
                {field.label}
                {field.required ? ' *' : ''}
              </ThemedText>
              <TextInput
                value={String(value)}
                onChangeText={(next) => updateValue(field.key, next)}
                placeholder={field.placeholder}
                placeholderTextColor={palette.textMuted}
                keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                style={[
                  styles.input,
                  {
                    backgroundColor: palette.inputBg,
                    borderColor: error ? palette.danger : palette.border,
                  },
                ]}
              />
              {error ? <ThemedText style={{ color: palette.danger }}>{error}</ThemedText> : null}
            </View>
          );
        })}

        <View style={styles.block}>
          <ThemedText type="defaultSemiBold">Phone verification *</ThemedText>
          <TextInput
            value={contactPhone}
            onChangeText={setContactPhone}
            placeholder="VD: +84901234567"
            placeholderTextColor={palette.textMuted}
            keyboardType="phone-pad"
            style={[
              styles.input,
              {
                backgroundColor: palette.inputBg,
                borderColor: palette.border,
              },
            ]}
          />
        </View>

        <View style={styles.block}>
          <ThemedText type="defaultSemiBold">Email verification *</ThemedText>
          <TextInput
            value={contactEmail}
            onChangeText={setContactEmail}
            placeholder="VD: user@example.com"
            placeholderTextColor={palette.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            style={[
              styles.input,
              {
                backgroundColor: palette.inputBg,
                borderColor: palette.border,
              },
            ]}
          />
        </View>

        <View style={styles.block}>
          <ThemedText type="defaultSemiBold">
            Hinh anh bat dong san
            {selectedCategory === 'Nhà Cửa' ? ' *' : ''}
          </ThemedText>
          <ThemedText style={{ color: palette.textMuted }}>
            Ban co the chon nhieu anh cung luc (toi da 10 anh).
          </ThemedText>
          <Pressable
            onPress={pickImages}
            style={({ pressed }) => [
              styles.uploadButton,
              {
                borderColor: palette.borderStrong,
                backgroundColor: palette.chip,
                opacity: pressed ? 0.85 : 1,
              },
            ]}>
            <ThemedText type="defaultSemiBold">Chọn Nhiều Hình Ảnh</ThemedText>
          </Pressable>

          {imageUris.length > 0 ? (
            <View style={styles.imageGrid}>
              {imageUris.map((uri) => (
                <View key={uri} style={styles.imageItem}>
                  <Image source={{ uri }} style={styles.imagePreview} contentFit="cover" />
                  <Pressable
                    onPress={() => removeImage(uri)}
                    style={({ pressed }) => [
                      styles.removeBadge,
                      {
                        backgroundColor: palette.danger,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}>
                    <ThemedText style={styles.removeBadgeText}>X</ThemedText>
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}

          {errors.images ? <ThemedText style={{ color: palette.danger }}>{errors.images}</ThemedText> : null}
        </View>

        <Pressable
          onPress={submit}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: isValid ? palette.button : palette.border,
              opacity: pressed ? 0.88 : 1,
            },
          ]}>
          <ThemedText style={[styles.buttonText, { color: isValid ? palette.buttonText : palette.textMuted }]}>Lưu Dữ Liệu Động</ThemedText>
        </Pressable>

        {phoneVerificationCode && emailVerificationCode ? (
          <View style={[styles.verificationCard, { borderColor: palette.border, backgroundColor: palette.surface }]}>
            <ThemedText type="defaultSemiBold">Xac minh so dien thoai va email</ThemedText>
            <ThemedText style={{ color: palette.textMuted }}>
              Nhap day du ca 2 ma xac minh de luu du lieu.
            </ThemedText>

            <TextInput
              value={phoneVerificationInput}
              onChangeText={setPhoneVerificationInput}
              placeholder="Nhap ma xac minh dien thoai"
              placeholderTextColor={palette.textMuted}
              keyboardType="number-pad"
              maxLength={6}
              style={[
                styles.input,
                {
                  backgroundColor: palette.inputBg,
                  borderColor: palette.border,
                },
              ]}
            />

            <TextInput
              value={emailVerificationInput}
              onChangeText={setEmailVerificationInput}
              placeholder="Nhap ma xac minh email"
              placeholderTextColor={palette.textMuted}
              keyboardType="number-pad"
              maxLength={6}
              style={[
                styles.input,
                {
                  backgroundColor: palette.inputBg,
                  borderColor: palette.border,
                },
              ]}
            />

            <Pressable
               onPress={verifyAndSave}
              disabled={isVerifying}
              style={({ pressed }) => [
                styles.verifyButton,
                {
                  backgroundColor: palette.button,
                  opacity: isVerifying ? 0.65 : pressed ? 0.88 : 1,
                },
              ]}>
              <ThemedText style={[styles.buttonText, { color: palette.buttonText }]}>
                {isVerifying ? 'Dang xac minh...' : 'Xac Minh Va Luu'}
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={clearVerificationState}
              disabled={isVerifying}
              style={({ pressed }) => [
                styles.cancelVerifyButton,
                {
                  borderColor: palette.border,
                  backgroundColor: palette.surface,
                  opacity: isVerifying ? 0.65 : pressed ? 0.85 : 1,
                },
              ]}>
              <ThemedText style={{ color: palette.textMuted }}>Huy xac minh</ThemedText>
            </Pressable>
          </View>
        ) : null}

        <Pressable
          onPress={confirmClearSavedData}
          disabled={isClearing}
          style={({ pressed }) => [
            styles.clearButton,
            {
              borderColor: palette.border,
              backgroundColor: palette.surface,
              opacity: isClearing ? 0.65 : pressed ? 0.85 : 1,
            },
          ]}>
          <ThemedText style={{ color: palette.textMuted }}>{isClearing ? 'Clearing...' : 'Nhập Lại Dữ Liệu'}</ThemedText>
        </Pressable>

        {submitted ? (
          <ThemedText style={{ color: isValid ? palette.success : palette.danger }}>
            {isValid
              ? 'Thong tin da san sang cho buoc xu ly tiep theo.'
              : 'Vui long hoan thanh cac truong bat buoc.'}
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
    paddingBottom: 32,
    gap: 16,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 8,
  },
  categoryTag: {
    fontFamily: Fonts.mono,
    fontSize: 13,
    letterSpacing: 1,
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
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  uploadButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  imageItem: {
    position: 'relative',
  },
  imagePreview: {
    width: 96,
    height: 96,
    borderRadius: 10,
  },
  removeBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBadgeText: {
    color: '#ffffff',
    fontWeight: '700',
    lineHeight: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 16,
  },
  switchCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  button: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  clearButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  verificationCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  verifyButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelVerifyButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Fonts.sans,
  },
});
