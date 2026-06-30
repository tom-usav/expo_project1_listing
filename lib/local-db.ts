import AsyncStorage from '@react-native-async-storage/async-storage';

const DYNAMIC_INPUTS_PREFIX = 'dynamic-inputs:';
const BUSINESS_INPUTS_PREFIX = 'business-inputs:';

export type DynamicInputsRecord = {
  category: string;
  values: Record<string, string | boolean>;
  latitude?: string;
  longitude?: string;
  imageUris: string[];
  contact?: {
    phone?: string;
    email?: string;
  };
  ipAddressLocation?: string;
  status?: 'pending';
  updatedAt: string;
};

export type BusinessInputsRecord = DynamicInputsRecord;

export async function dbGet(key: string): Promise<string | null> {
  return AsyncStorage.getItem(key);
}

export async function dbSet(key: string, value: string): Promise<void> {
  await AsyncStorage.setItem(key, value);
}

export async function dbRemove(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

export async function dbGetJson<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function dbSetJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function initDynamicInputsTable(): Promise<void> {
  // AsyncStorage has no table schema, so this is intentionally a no-op.
}

export async function loadDynamicInputsRecord(category: string): Promise<DynamicInputsRecord | null> {
  return dbGetJson<DynamicInputsRecord>(`${DYNAMIC_INPUTS_PREFIX}${category}`);
}

export async function saveDynamicInputsRecord(record: DynamicInputsRecord): Promise<void> {
  await dbSetJson(`${DYNAMIC_INPUTS_PREFIX}${record.category}`, record);
}

export async function clearDynamicInputsRecord(category: string): Promise<void> {
  await dbRemove(`${DYNAMIC_INPUTS_PREFIX}${category}`);
}

export async function initBusinessInputsTable(): Promise<void> {
  // AsyncStorage has no table schema, so this is intentionally a no-op.
}

export async function loadBusinessInputsRecord(category: string): Promise<BusinessInputsRecord | null> {
  return dbGetJson<BusinessInputsRecord>(`${BUSINESS_INPUTS_PREFIX}${category}`);
}

export async function saveBusinessInputsRecord(record: BusinessInputsRecord): Promise<void> {
  await dbSetJson(`${BUSINESS_INPUTS_PREFIX}${record.category}`, record);
}

export async function clearBusinessInputsRecord(category: string): Promise<void> {
  await dbRemove(`${BUSINESS_INPUTS_PREFIX}${category}`);
}

const localDb = {
  get: dbGet,
  set: dbSet,
  remove: dbRemove,
  getJson: dbGetJson,
  setJson: dbSetJson,
  initDynamicInputsTable,
  loadDynamicInputsRecord,
  saveDynamicInputsRecord,
  clearDynamicInputsRecord,
  initBusinessInputsTable,
  loadBusinessInputsRecord,
  saveBusinessInputsRecord,
  clearBusinessInputsRecord,
};

export default localDb;
