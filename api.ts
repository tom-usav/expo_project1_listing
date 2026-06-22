import Constants from 'expo-constants';
import { Platform } from 'react-native';

export type SyncDynamicInputsPayload = {
  category: string;
  values: Record<string, string | boolean>;
  imageUris: string[];
  contact?: {
    phone?: string;
    email?: string;
  };
  status?: 'pending';
  updatedAt: string;
  createdAt?: string;
  ipAddressLocation?: string;
};

const envApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
const configApiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl;
/* const defaultApiBaseUrl = Platform.OS === 'android' ? 'http://192.168.68.58:3000' : 'http://35.169.142.71:3000';
*/

const defaultApiBaseUrl = Platform.select({
  android: 'http://192.168.68.58:3000',
  ios: 'http://192.168.68.58:3000',
});

const API_BASE_URL = envApiBaseUrl || configApiBaseUrl || defaultApiBaseUrl;

export async function syncDynamicInputsToServer(payload: SyncDynamicInputsPayload) {

  try {
    const payloadWithCreatedAt = {
      ...payload,
      createdAt: payload.createdAt || new Date().toISOString(),
    };

    const response = await fetch(`${API_BASE_URL}/api/dynamic-inputs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payloadWithCreatedAt),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Server sync failed: ${response.status} ${text}`);
    }

    return response.json() as Promise<{
      message: string;
      id: number;
    }>;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Server sync failed: ${error.message}. TEST Please verify the API server is running and reachable at ${API_BASE_URL}`,
      );
    }

    throw new Error(
      `Server sync failed: Unknown network error. Please verify the API server at ${API_BASE_URL}`,
    );
  }
}

export async function checkApiServerHealth(): Promise<'online' | 'offline' | 'unreachable'> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
    });

    if (response.ok) {
      return 'online';
    }

    return 'unreachable';
  } catch (error) {
    if (error instanceof Error && error.message === 'Network request failed') {
      return 'offline';
    }
    return 'unreachable';
  }
}