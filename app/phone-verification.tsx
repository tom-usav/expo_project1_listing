import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

// import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import {
  PhoneAuthProvider,
  User,
  onAuthStateChanged,
  signInWithCredential,
  signInWithPhoneNumber,
} from 'firebase/auth';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { auth, firebaseApp, isFirebaseConfigured } from '@/lib/firebase';

const E164_REGEX = /^\+\d{8,15}$/;

export default function PhoneVerificationScreen() {
  // const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModal>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputOffsets = useRef<Record<'phone' | 'code', number>>({ phone: 0, code: 0 });

  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);

  const handleInputFocus = (inputKey: 'phone' | 'code') => {
    const y = Math.max(inputOffsets.current[inputKey] - 40, 0);
    scrollViewRef.current?.scrollTo({ x: 0, y, animated: true });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return unsubscribe;
  }, []);

  const handleSendCode = async () => {
    if (!isFirebaseConfigured) {
      Alert.alert('Firebase not configured', 'Please add EXPO_PUBLIC_FIREBASE_* values first.');
      return;
    }

    if (!E164_REGEX.test(phoneNumber.trim())) {
      Alert.alert('Invalid phone number', 'Use E.164 format, for example +15551234567.');
      return;
    }



    try {
      setIsSendingCode(true);
      const confirmation = await signInWithPhoneNumber(
        auth,
        phoneNumber.trim(),
        // recaptchaVerifier.current
      );
      setVerificationId(confirmation.verificationId);
      Alert.alert('Code sent', 'Check your SMS for the verification code.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to send code.';
      Alert.alert('SMS verification failed', message);
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationId) {
      Alert.alert('Missing verification', 'Send a code first.');
      return;
    }

    if (!verificationCode.trim()) {
      Alert.alert('Missing code', 'Enter the SMS verification code.');
      return;
    }

    try {
      setIsVerifyingCode(true);
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode.trim());
      await signInWithCredential(auth, credential);
      setVerificationCode('');
      Alert.alert('Success', 'Phone number verified and user signed in.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to verify code.';
      Alert.alert('Verification failed', message);
    } finally {
      setIsVerifyingCode(false);
    }
  };

  return (
    <ThemedView style={styles.screen}>



      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 72 : 0}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <ThemedText type="title">Phone Verification</ThemedText>
          <ThemedText style={styles.subtitle}>
            Enter your phone number, request a one-time code, then verify it.
          </ThemedText>

          <View style={styles.card}>
            <ThemedText type="defaultSemiBold">Phone number (E.164)</ThemedText>
            <TextInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              onLayout={(event) => {
                inputOffsets.current.phone = event.nativeEvent.layout.y;
              }}
              onFocus={() => handleInputFocus('phone')}
              placeholder="+15551234567"
              keyboardType="number-pad"
              autoCapitalize="none"
              style={styles.input}
            />

            <Pressable
              onPress={handleSendCode}
              disabled={isSendingCode}
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
              <ThemedText style={styles.buttonText}>
                {isSendingCode ? 'Sending...' : 'Send Verification Code'}
              </ThemedText>
            </Pressable>

            <ThemedText type="defaultSemiBold">Verification code</ThemedText>
            <TextInput
              value={verificationCode}
              onChangeText={setVerificationCode}
              onLayout={(event) => {
                inputOffsets.current.code = event.nativeEvent.layout.y;
              }}
              onFocus={() => handleInputFocus('code')}
              placeholder="123456"
              keyboardType="number-pad"
              style={styles.input}
            />

            <Pressable
              onPress={handleVerifyCode}
              disabled={isVerifyingCode || !verificationId}
              style={({ pressed }) => [
                styles.button,
                styles.verifyButton,
                (!verificationId || isVerifyingCode) && styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}>
              <ThemedText style={styles.buttonText}>
                {isVerifyingCode ? 'Verifying...' : 'Verify Code'}
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.statusBlock}>
            <ThemedText type="defaultSemiBold">Auth status</ThemedText>
            <ThemedText>
              {currentUser ? `Signed in as: ${currentUser.phoneNumber ?? currentUser.uid}` : 'Not signed in'}
            </ThemedText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 14,
  },
  subtitle: {
    opacity: 0.8,
  },
  card: {
    borderWidth: 1,
    borderColor: '#0a7ea433',
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#b7bcc4',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 2,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#0a7ea4',
    alignItems: 'center',
  },
  verifyButton: {
    backgroundColor: '#0a8450',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  statusBlock: {
    gap: 6,
  },
});
