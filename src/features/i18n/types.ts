export type SupportedLanguage = 'en' | 'mr' | 'hi' | 'gu';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  sublabel: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', sublabel: 'Default' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', sublabel: 'राजभाषा महाराष्ट्र' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', sublabel: 'राष्ट्रभाषा' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳', sublabel: 'પ્રાદેશિક' },
];

export interface TranslationDictionary {
  brand: {
    name: string;
    tagline: string;
    verifiedBadge: string;
  };
  nav: {
    home: string;
    explore: string;
    forts: string;
    about: string;
    providerPortal: string;
    adminConsole: string;
    sAdminPortal: string;
    touristDashboard: string;
    savedPlaces: string;
    signIn: string;
    signUp: string;
    signOut: string;
    settings: string;
    switchRole: string;
    selectLanguage: string;
  };
  hero: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    searchPlaceholder: string;
    searchButton: string;
    exploreMap: string;
    activeFilters: string;
  };
  categories: {
    all: string;
    hotels: string;
    restaurants: string;
    shops: string;
    attractions: string;
    forts: string;
    hotelsDesc: string;
    restaurantsDesc: string;
    shopsDesc: string;
    attractionsDesc: string;
    fortsDesc: string;
    hotelsCount: string;
    restaurantsCount: string;
    shopsCount: string;
    attractionsCount: string;
    fortsCount: string;
  };
  featured: {
    badge: string;
    title: string;
    subtitle: string;
    viewAll: string;
    verifiedOnly: string;
  };
  fortsBanner: {
    badge: string;
    title: string;
    desc: string;
    button: string;
  };
  cta: {
    badge: string;
    title: string;
    desc: string;
    providerButton: string;
    learnMore: string;
  };
  footer: {
    description: string;
    dataHonesty: string;
    discover: string;
    portals: string;
    preferences: string;
    heritageHotels: string;
    iraniCafes: string;
    historicBazaars: string;
    artDeco: string;
    marathaForts: string;
    touristSaved: string;
    providerDashboard: string;
    providerRegister: string;
    adminConsole: string;
    themeSettings: string;
    aboutLens: string;
    contactTeam: string;
    sampleNotice: string;
    rights: string;
  };
  common: {
    loading: string;
    search: string;
    filter: string;
    close: string;
    save: string;
    cancel: string;
    reviews: string;
    rating: string;
    viewDetails: string;
  };
  explore: {
    directoryBadge: string;
    title: string;
    subtitle: string;
    viewGrid: string;
    viewSplit: string;
    viewMap: string;
    allPlaces: string;
    museumsLandmarks: string;
    maharashtraForts: string;
    heritageHotels: string;
    iconicFood: string;
    historicBazaars: string;
    onlyMuseums: string;
    searchPlaceholder: string;
    sortHighestRated: string;
    sortMostReviews: string;
    sortName: string;
    allRegions: string;
    resetFilters: string;
    showingPlaces: string;
    museumsFilterActive: string;
    categoryLabel: string;
    noResults: string;
    noResultsDesc: string;
    mapHint: string;
  };
  listingCard: {
    sampleBadge: string;
    verifiedBadge: string;
    viewDetails: string;
  };
  fortsPage: {
    badge: string;
    title: string;
    subtitle: string;
    elevation: string;
    keyMilestone: string;
    trekDifficulty: string;
    built: string;
    architectureTitle: string;
    chronicle: string;
    routeTitle: string;
    trekGuide: string;
    mapTitle: string;
  };
  listingDetail: {
    backToExplore: string;
    verifiedPlace: string;
    share: string;
    save: string;
    saved: string;
    visitingHours: string;
    locationAddress: string;
    reviewsTitle: string;
    writeReview: string;
    ratingLabel: string;
    submitReview: string;
    noReviews: string;
    shareCopied: string;
  };
  aboutPage: {
    badge: string;
    title: string;
    subtitle: string;
    missionTitle: string;
    missionDesc: string;
    contactTitle: string;
    contactDesc: string;
  };
}
