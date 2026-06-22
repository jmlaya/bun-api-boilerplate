// src/lib/deep-merge.ts

type PlainObject = Record<PropertyKey, unknown>;

const BLOCKED_KEYS = new Set<PropertyKey>(['__proto__', 'constructor', 'prototype']);

function isPlainObject(value: unknown): value is PlainObject {
  if (value === null || typeof value !== 'object') return false;

  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function cloneValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item)) as T;
  }

  if (isPlainObject(value)) {
    const result: PlainObject = Object.create(Object.getPrototypeOf(value));

    for (const key of Reflect.ownKeys(value)) {
      if (typeof key === 'string' && BLOCKED_KEYS.has(key)) continue;

      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor?.enumerable) continue;

      result[key] = cloneValue(value[key]);
    }

    return result as T;
  }

  if (typeof value === 'function') {
    return value;
  }

  try {
    return structuredClone(value);
  } catch {
    return value;
  }
}

export function deepMerge<T extends PlainObject, U extends PlainObject>(target: T, source: U): T & U {
  const output = cloneValue(target) as PlainObject;

  for (const key of Reflect.ownKeys(source)) {
    if (typeof key === 'string' && BLOCKED_KEYS.has(key)) continue;

    const descriptor = Object.getOwnPropertyDescriptor(source, key);
    if (!descriptor?.enumerable) continue;

    const sourceValue = source[key];
    const targetValue = output[key];

    if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
      output[key] = deepMerge(targetValue, sourceValue);
    } else {
      output[key] = cloneValue(sourceValue);
    }
  }

  return output as T & U;
}
