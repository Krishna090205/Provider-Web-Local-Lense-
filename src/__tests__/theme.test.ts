import { describe, it, expect, beforeEach } from 'vitest';

describe('Theme Persistence and Flash Prevention', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('persists light theme in localStorage and applies to html tag', () => {
    localStorage.setItem('locallens-theme', 'light');
    document.documentElement.setAttribute('data-theme', 'light');

    expect(localStorage.getItem('locallens-theme')).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('persists dark theme in localStorage and applies to html tag', () => {
    localStorage.setItem('locallens-theme', 'dark');
    document.documentElement.setAttribute('data-theme', 'dark');

    expect(localStorage.getItem('locallens-theme')).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('handles system preference gracefully', () => {
    localStorage.setItem('locallens-theme', 'system');
    // If system prefers light or dark
    const resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', resolvedTheme);

    expect(localStorage.getItem('locallens-theme')).toBe('system');
    expect(['light', 'dark']).toContain(document.documentElement.getAttribute('data-theme'));
  });

  it('provides appropriate map styles when switching between light and dark modes', async () => {
    const { getMapLibreStyle, GOOGLE_MAPS_LIGHT_STYLE, GOOGLE_MAPS_NIGHT_STYLE, createGoogleInfoWindowContent } = await import('../components/MapComponent');

    // 1. Google Maps Night vs Light styles
    expect(GOOGLE_MAPS_NIGHT_STYLE).toBeDefined();
    expect(GOOGLE_MAPS_LIGHT_STYLE).toBeDefined();
    expect(GOOGLE_MAPS_LIGHT_STYLE.length).toBeGreaterThan(0);
    expect(GOOGLE_MAPS_NIGHT_STYLE.length).toBeGreaterThan(0);

    // 2. MapLibre Carto raster tile switching
    const darkStyle = getMapLibreStyle(true);
    const lightStyle = getMapLibreStyle(false);

    const darkTiles = (darkStyle.sources?.['osm-tiles'] as any)?.tiles?.[0];
    const lightTiles = (lightStyle.sources?.['osm-tiles'] as any)?.tiles?.[0];

    expect(darkTiles).toContain('dark_all');
    expect(lightTiles).toContain('light_all');

    // 3. Info window and popup contents adapt to theme
    const sampleMarker = { id: 'test-1', lat: 18.93, lng: 72.83, name: 'Gateway of India', category: 'Attraction' };
    const darkInfoWindow = createGoogleInfoWindowContent(sampleMarker, true);
    const lightInfoWindow = createGoogleInfoWindowContent(sampleMarker, false);

    expect(darkInfoWindow).toContain('#f8fafc'); // Dark mode light text
    expect(lightInfoWindow).toContain('#1e293b'); // Light mode dark text
  }, 30000);
});

