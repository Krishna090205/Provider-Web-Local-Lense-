import { z } from 'zod';

export const themePreferenceSchema = z.enum(['light', 'dark', 'system']);
export type ThemePreference = z.infer<typeof themePreferenceSchema>;

export const resolvedThemeSchema = z.enum(['light', 'dark']);
export type ResolvedTheme = z.infer<typeof resolvedThemeSchema>;
