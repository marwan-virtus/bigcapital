// packages/webapp/src/components/Dashboard/ThemePreferenceContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';
export type EffectiveTheme = 'light' | 'dark';

interface ThemePreferenceContextValue {
  preference: ThemePreference;
  effectiveTheme: EffectiveTheme;
  setPreference: (next: ThemePreference) => void;
}

const STORAGE_KEY = 'theme';

const Ctx = createContext<ThemePreferenceContextValue | null>(null);

function readPreference(): ThemePreference {
  const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
  if (raw === 'light' || raw === 'dark') return raw;
  return 'system';
}

function readSystemEffective(): EffectiveTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveEffective(pref: ThemePreference): EffectiveTheme {
  return pref === 'system' ? readSystemEffective() : pref;
}

function applyClass(effective: EffectiveTheme) {
  const html = document.documentElement;
  const body = document.body;
  if (effective === 'dark') {
    html.classList.add('bp4-dark');
    body.classList.add('bp4-dark');
  } else {
    html.classList.remove('bp4-dark');
    body.classList.remove('bp4-dark');
  }
}

export function ThemePreferenceProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(readPreference);
  const [systemEffective, setSystemEffective] = useState<EffectiveTheme>(readSystemEffective);

  const effectiveTheme: EffectiveTheme = preference === 'system' ? systemEffective : preference;

  // Listen to OS-level changes (only relevant when preference === 'system').
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystemEffective(mq.matches ? 'dark' : 'light');
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  // Cross-tab sync.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      setPreferenceState(readPreference());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Apply the class whenever the resolved theme changes.
  useEffect(() => {
    applyClass(effectiveTheme);
  }, [effectiveTheme]);

  const setPreference = (next: ThemePreference) => {
    if (next === 'system') window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, next);
    setPreferenceState(next);
  };

  const value = useMemo<ThemePreferenceContextValue>(
    () => ({ preference, effectiveTheme, setPreference }),
    [preference, effectiveTheme],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useThemePreference(): ThemePreferenceContextValue {
  const value = useContext(Ctx);
  if (!value) throw new Error('useThemePreference must be used inside ThemePreferenceProvider');
  return value;
}
