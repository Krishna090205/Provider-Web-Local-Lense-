import { Listing, Review } from './types';

export const INITIAL_LISTINGS: Listing[] = [
  {
    id: 'a1b2c3d4-0001-4000-8000-000000000001',
    category: 'hotels',
    name: '[Sample] The Taj Mahal Palace',
    description: 'Legendary 1903 heritage luxury hotel facing the Gateway of India and the Arabian Sea. Renowned for regal Indo-Saracenic architectural opulence, curated antique art, and world-class hospitality.',
    address: 'Apollo Bandar, Colaba, Mumbai, Maharashtra 400001',
    area: 'Colaba',
    lat: 18.9217,
    lng: 72.8332,
    hours: {
      "Monday": "Open 24 Hours",
      "Tuesday": "Open 24 Hours",
      "Wednesday": "Open 24 Hours",
      "Thursday": "Open 24 Hours",
      "Friday": "Open 24 Hours",
      "Saturday": "Open 24 Hours",
      "Sunday": "Open 24 Hours"
    },
    phone: '+91 22 6665 3366',
    website: 'https://www.tajhotels.com',
    price_level: '₹₹₹₹',
    status: 'approved',
    featured: true,
    rating: 4.9,
    review_count: 1420,
    created_at: '2026-01-10T08:00:00Z',
    photos: [
      {
        id: 'p1',
        listing_id: 'a1b2c3d4-0001-4000-8000-000000000001',
        url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80',
        caption: 'The Taj Mahal Palace front facade at sunset',
        is_cover: true,
        display_order: 1
      },
      {
        id: 'p2',
        listing_id: 'a1b2c3d4-0001-4000-8000-000000000001',
        url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        caption: 'Regal poolside courtyard and architecture',
        is_cover: false,
        display_order: 2
      }
    ]
  },
  {
    id: 'a1b2c3d4-0002-4000-8000-000000000002',
    category: 'restaurants',
    name: '[Sample] Britannia & Co. Restaurant',
    description: 'Iconic Parsi-Irani heritage cafe founded in 1923 by Rashid Kohinoor in the historic Ballard Estate. Celebrated for its signature Berry Pulao, Sali Boti, caramel custard, and timeless vintage atmosphere.',
    address: 'Wakefield House, 11 Sprott Rd, Ballard Estate, Fort, Mumbai, Maharashtra 400001',
    area: 'Fort',
    lat: 18.9348,
    lng: 72.8394,
    hours: {
      "Monday": "11:30 AM - 4:00 PM",
      "Tuesday": "11:30 AM - 4:00 PM",
      "Wednesday": "11:30 AM - 4:00 PM",
      "Thursday": "11:30 AM - 4:00 PM",
      "Friday": "11:30 AM - 4:00 PM",
      "Saturday": "11:30 AM - 4:00 PM",
      "Sunday": "Closed"
    },
    phone: '+91 22 2261 5264',
    website: null,
    price_level: '₹₹',
    status: 'approved',
    featured: true,
    rating: 4.6,
    review_count: 890,
    created_at: '2026-01-12T09:00:00Z',
    photos: [
      {
        id: 'p3',
        listing_id: 'a1b2c3d4-0002-4000-8000-000000000002',
        url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
        caption: 'Colonial-era dining room and vintage bentwood chairs',
        is_cover: true,
        display_order: 1
      }
    ]
  },
  {
    id: 'a1b2c3d4-0003-4000-8000-000000000003',
    category: 'shops',
    name: '[Sample] Crawford Market (Mahatma Jyotirao Phule Mandai)',
    description: 'Historic 1869 Gothic-Norman covered market featuring intricate stone bas-reliefs sculpted by Lockwood Kipling. Sells fresh exotic spices, dry fruits, Alphonso mangoes, pet supplies, and vintage curios.',
    address: 'Dhobi Talao, Chhatrapati Shivaji Terminus Area, Fort, Mumbai, Maharashtra 400001',
    area: 'Fort / CST',
    lat: 18.9472,
    lng: 72.8347,
    hours: {
      "Monday": "10:00 AM - 8:00 PM",
      "Tuesday": "10:00 AM - 8:00 PM",
      "Wednesday": "10:00 AM - 8:00 PM",
      "Thursday": "10:00 AM - 8:00 PM",
      "Friday": "10:00 AM - 8:00 PM",
      "Saturday": "10:00 AM - 8:00 PM",
      "Sunday": "Closed"
    },
    phone: '+91 22 2342 6670',
    website: null,
    price_level: '₹',
    status: 'approved',
    featured: true,
    rating: 4.4,
    review_count: 640,
    created_at: '2026-01-15T10:00:00Z',
    photos: [
      {
        id: 'p4',
        listing_id: 'a1b2c3d4-0003-4000-8000-000000000003',
        url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
        caption: 'Historic market hall stalls and bustling lanes',
        is_cover: true,
        display_order: 1
      }
    ]
  },
  {
    id: 'a1b2c3d4-0004-4000-8000-000000000004',
    category: 'attractions',
    name: '[Sample] Gateway of India & Marine Drive Promenade',
    description: 'Majestic 26-meter Indo-Saracenic basalt arch built in 1924 overlooking Mumbai Harbour, followed by the sweeping 3.6-kilometer arc of Marine Drive, famously dubbed the Queen\'s Necklace.',
    address: 'Apollo Bandar, Colaba, Mumbai, Maharashtra 400001',
    area: 'Colaba / Marine Drive',
    lat: 18.9220,
    lng: 72.8347,
    hours: {
      "Monday": "Open 24 Hours",
      "Tuesday": "Open 24 Hours",
      "Wednesday": "Open 24 Hours",
      "Thursday": "Open 24 Hours",
      "Friday": "Open 24 Hours",
      "Saturday": "Open 24 Hours",
      "Sunday": "Open 24 Hours"
    },
    phone: null,
    website: 'https://mumbaicivic.gov.in',
    price_level: 'Free',
    status: 'approved',
    featured: true,
    rating: 4.8,
    review_count: 3250,
    created_at: '2026-01-18T11:00:00Z',
    photos: [
      {
        id: 'p5',
        listing_id: 'a1b2c3d4-0004-4000-8000-000000000004',
        url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
        caption: 'Gateway of India waterfront at dusk with evening sea breeze',
        is_cover: true,
        display_order: 1
      }
    ]
  },
  {
    id: 'a1b2c3d4-0011-4000-8000-000000000011',
    category: 'attractions',
    name: '[Sample] CSMVS Museum (Chhatrapati Shivaji Maharaj Vastu Sangrahalaya)',
    description: 'Premier heritage museum of art, world archaeology, and Indian history founded in 1909. Housed in a landmark Grade I Indo-Saracenic palace surrounded by lush botanical gardens in the Kala Ghoda Arts Precinct.',
    address: '159-161, Mahatma Gandhi Road, Kala Ghoda, Fort, Mumbai, Maharashtra 400023',
    area: 'Kala Ghoda / Fort',
    lat: 18.9269,
    lng: 72.8327,
    hours: {
      "Monday": "10:15 AM - 6:00 PM",
      "Tuesday": "10:15 AM - 6:00 PM",
      "Wednesday": "10:15 AM - 6:00 PM",
      "Thursday": "10:15 AM - 6:00 PM",
      "Friday": "10:15 AM - 6:00 PM",
      "Saturday": "10:15 AM - 6:00 PM",
      "Sunday": "10:15 AM - 6:00 PM"
    },
    phone: '+91 22 2284 4484',
    website: 'https://csmvs.gov.in',
    price_level: '₹150 Entry',
    status: 'approved',
    featured: true,
    rating: 4.8,
    review_count: 2150,
    created_at: '2026-02-10T10:00:00Z',
    photos: [
      {
        id: 'p12',
        listing_id: 'a1b2c3d4-0011-4000-8000-000000000011',
        url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
        caption: 'CSMVS Museum Indo-Saracenic grand pavilion and dome',
        is_cover: true,
        display_order: 1
      }
    ]
  },
  {
    id: 'a1b2c3d4-0005-4000-8000-000000000005',
    category: 'forts',
    name: '[Sample] Castella de Aguada (Bandra Fort)',
    description: '1640 Portuguese sea fortress strategically positioned at Land\'s End in Bandra. Overlooks Mahim Bay and offers legendary sunset vistas across the Arabian Sea and the modern Bandra-Worli Sea Link.',
    address: 'Byramji Jeejeebhoy Road, Bandstand Promenade, Bandra West, Mumbai, Maharashtra 400050',
    area: 'Bandra West',
    lat: 19.0435,
    lng: 72.8182,
    hours: {
      "Monday": "6:00 AM - 6:30 PM",
      "Tuesday": "6:00 AM - 6:30 PM",
      "Wednesday": "6:00 AM - 6:30 PM",
      "Thursday": "6:00 AM - 6:30 PM",
      "Friday": "6:00 AM - 6:30 PM",
      "Saturday": "6:00 AM - 6:30 PM",
      "Sunday": "6:00 AM - 6:30 PM"
    },
    phone: null,
    website: null,
    price_level: 'Free',
    status: 'approved',
    featured: true,
    rating: 4.7,
    review_count: 1820,
    created_at: '2026-01-20T12:00:00Z',
    photos: [
      {
        id: 'p6',
        listing_id: 'a1b2c3d4-0005-4000-8000-000000000005',
        url: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80',
        caption: 'Ancient stone ramparts meeting the Arabian Sea at Land\'s End',
        is_cover: true,
        display_order: 1
      }
    ]
  },
  {
    id: 'a1b2c3d4-0006-4000-8000-000000000006',
    category: 'forts',
    name: '[Sample] Raigad Fort (Chhatrapati Shivaji Maharaj Capital)',
    description: 'Imperial mountain fortress perched atop the Sahyadri ranges at 820m elevation. Chosen by Chhatrapati Shivaji Maharaj as the sovereign capital of the Maratha Empire, where he was coronated in 1674.',
    address: 'Raigad District, Mahad, Maharashtra 402305 (Accessible via NH66 from Mumbai)',
    area: 'Raigad / Konkan Belt',
    lat: 18.2356,
    lng: 73.4419,
    hours: {
      "Monday": "8:00 AM - 6:00 PM",
      "Tuesday": "8:00 AM - 6:00 PM",
      "Wednesday": "8:00 AM - 6:00 PM",
      "Thursday": "8:00 AM - 6:00 PM",
      "Friday": "8:00 AM - 6:00 PM",
      "Saturday": "8:00 AM - 6:00 PM",
      "Sunday": "8:00 AM - 6:00 PM"
    },
    phone: '+91 2145 222 123',
    website: 'https://maharashtratourism.gov.in',
    price_level: '₹50 Entry',
    status: 'approved',
    featured: true,
    rating: 4.9,
    review_count: 4200,
    created_at: '2026-01-22T08:00:00Z',
    photos: [
      {
        id: 'p7',
        listing_id: 'a1b2c3d4-0006-4000-8000-000000000006',
        url: 'https://images.unsplash.com/photo-1626014303757-658c2901374b?auto=format&fit=crop&w=1200&q=80',
        caption: 'Maha Darwaja and cliff ramparts of Raigad',
        is_cover: true,
        display_order: 1
      }
    ]
  },
  {
    id: 'a1b2c3d4-0007-4000-8000-000000000007',
    category: 'forts',
    name: '[Sample] Sinhagad Fort (The Lion\'s Fort)',
    description: 'Iconic hill fortress perched 1,312 meters above sea level in the Bhuleshwar range with over 2,000 years of documented history. World famous for Subedar Tanaji Malusare\'s daring 1670 night escalade.',
    address: 'Sinhagad Ghat Rd, Thoptewadi, Maharashtra 411025',
    area: 'Sahyadri Range',
    lat: 18.3663,
    lng: 73.7558,
    hours: {
      "Monday": "5:00 AM - 7:00 PM",
      "Tuesday": "5:00 AM - 7:00 PM",
      "Wednesday": "5:00 AM - 7:00 PM",
      "Thursday": "5:00 AM - 7:00 PM",
      "Friday": "5:00 AM - 7:00 PM",
      "Saturday": "5:00 AM - 7:00 PM",
      "Sunday": "5:00 AM - 7:00 PM"
    },
    phone: null,
    website: 'https://maharashtratourism.gov.in',
    price_level: '₹50 Entry',
    status: 'approved',
    featured: true,
    rating: 4.8,
    review_count: 3100,
    created_at: '2026-01-25T08:00:00Z',
    photos: [
      {
        id: 'p8',
        listing_id: 'a1b2c3d4-0007-4000-8000-000000000007',
        url: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1200&q=80',
        caption: 'Kalyan Darwaja and misty Sahyadri cliff battlements',
        is_cover: true,
        display_order: 1
      }
    ]
  },
  {
    id: 'a1b2c3d4-0008-4000-8000-000000000008',
    category: 'forts',
    name: '[Sample] Bassein Fort (Vasai Fort)',
    description: 'Vast 1536 Portuguese fortified city along the Ulhas estuary. Features remnants of grand stone churches, watchtowers, water cisterns, and palm groves surrounded by the sea.',
    address: 'Killa Road, Vasai West, Vasai, Maharashtra 401201',
    area: 'Vasai / Palghar',
    lat: 19.3304,
    lng: 72.8153,
    hours: {
      "Monday": "6:00 AM - 6:00 PM",
      "Tuesday": "6:00 AM - 6:00 PM",
      "Wednesday": "6:00 AM - 6:00 PM",
      "Thursday": "6:00 AM - 6:00 PM",
      "Friday": "6:00 AM - 6:00 PM",
      "Saturday": "6:00 AM - 6:00 PM",
      "Sunday": "6:00 AM - 6:00 PM"
    },
    phone: null,
    website: null,
    price_level: 'Free',
    status: 'approved',
    featured: false,
    rating: 4.6,
    review_count: 950,
    created_at: '2026-01-28T09:00:00Z',
    photos: [
      {
        id: 'p9',
        listing_id: 'a1b2c3d4-0008-4000-8000-000000000008',
        url: 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?auto=format&fit=crop&w=1200&q=80',
        caption: 'Portuguese archways and stone fortress walls',
        is_cover: true,
        display_order: 1
      }
    ]
  },
  {
    id: 'a1b2c3d4-0009-4000-8000-000000000009',
    category: 'restaurants',
    name: '[Sample] Sardar Refreshments',
    description: 'Legendary Mumbai street food destination founded in 1966. Famous for its thick, spicy mashed vegetable bhaji crowned with an entire slab of Amul butter served with pillowy toasted pav.',
    address: '166-A, 166-B, Tardeo Rd, Junction, Tardeo, Mumbai, Maharashtra 400034',
    area: 'Tardeo',
    lat: 18.9698,
    lng: 72.8166,
    hours: {
      "Monday": "12:00 PM - 11:30 PM",
      "Tuesday": "12:00 PM - 11:30 PM",
      "Wednesday": "12:00 PM - 11:30 PM",
      "Thursday": "12:00 PM - 11:30 PM",
      "Friday": "12:00 PM - 11:30 PM",
      "Saturday": "12:00 PM - 11:30 PM",
      "Sunday": "12:00 PM - 11:30 PM"
    },
    phone: '+91 22 2353 2414',
    website: null,
    price_level: '₹',
    status: 'approved',
    featured: false,
    rating: 4.5,
    review_count: 1560,
    created_at: '2026-02-01T10:00:00Z',
    photos: [
      {
        id: 'p10',
        listing_id: 'a1b2c3d4-0009-4000-8000-000000000009',
        url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80',
        caption: 'Signature Mumbai Pav Bhaji served sizzling hot with lime and onions',
        is_cover: true,
        display_order: 1
      }
    ]
  },
  {
    id: 'a1b2c3d4-0010-4000-8000-000000000010',
    category: 'hotels',
    name: '[Sample] Abode Bombay Boutique Hotel',
    description: 'First luxury heritage boutique hotel in Colaba, Mumbai. Thoughtfully restored with antique encaustic floor tiles, custom 20th-century teak furniture, and intimate personalized city excursions.',
    address: 'First Floor, Lansdowne House, M.B. Marg, Apollo Bandar, Colaba, Mumbai 400001',
    area: 'Colaba',
    lat: 18.9234,
    lng: 72.8322,
    hours: {
      "Monday": "Open 24 Hours",
      "Tuesday": "Open 24 Hours",
      "Wednesday": "Open 24 Hours",
      "Thursday": "Open 24 Hours",
      "Friday": "Open 24 Hours",
      "Saturday": "Open 24 Hours",
      "Sunday": "Open 24 Hours"
    },
    phone: '+91 80802 34066',
    website: 'https://abodebombay.com',
    price_level: '₹₹₹',
    status: 'approved',
    featured: false,
    rating: 4.8,
    review_count: 410,
    created_at: '2026-02-05T11:00:00Z',
    photos: [
      {
        id: 'p11',
        listing_id: 'a1b2c3d4-0010-4000-8000-000000000010',
        url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
        caption: 'Bohemian heritage suite with vintage tile aesthetics',
        is_cover: true,
        display_order: 1
      }
    ]
  },
  {
    id: 'a1b2c3d4-0012-4000-8000-000000000012',
    category: 'attractions',
    name: '[Sample] Dr. Bhau Daji Lad Museum',
    description: 'Mumbai\'s oldest public museum established in 1872 as the Victoria & Albert Museum of Bombay. Showcases city cultural heritage, 19th-century fine arts, dioramas, and silver filigree in a breathtaking High Victorian Renaissance interior.',
    address: '91 A, Rani Baug, Veer Mata Jijabai Bhonsle Udyan, Dr Baba Saheb Ambedkar Rd, Byculla East, Mumbai 400027',
    area: 'Byculla',
    lat: 18.9786,
    lng: 72.8354,
    hours: {
      "Monday": "10:00 AM - 5:30 PM",
      "Tuesday": "10:00 AM - 5:30 PM",
      "Wednesday": "Closed",
      "Thursday": "10:00 AM - 5:30 PM",
      "Friday": "10:00 AM - 5:30 PM",
      "Saturday": "10:00 AM - 5:30 PM",
      "Sunday": "10:00 AM - 5:30 PM"
    },
    phone: '+91 22 2373 1234',
    website: 'https://www.bdlmuseum.org',
    price_level: '₹10 Entry',
    status: 'approved',
    featured: true,
    rating: 4.8,
    review_count: 1650,
    created_at: '2026-02-12T10:00:00Z',
    photos: [
      {
        id: 'p13',
        listing_id: 'a1b2c3d4-0012-4000-8000-000000000012',
        url: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=80',
        caption: 'Victorian gilded arches and Palladian hall of Dr. Bhau Daji Lad Museum',
        is_cover: true,
        display_order: 1
      }
    ]
  },
  {
    id: 'a1b2c3d4-0013-4000-8000-000000000013',
    category: 'attractions',
    name: '[Sample] National Gallery of Modern Art (NGMA Mumbai)',
    description: 'Premier national repository of modern art housed in the 1911 Sir Cowasji Jehangir Public Hall near Regal Circle. Features rotating exhibitions of Raja Ravi Varma, Amrita Sher-Gil, M.F. Husain, and contemporary sculptures.',
    address: 'Sir Cowasji Jehangir Public Hall, Mahatma Gandhi Road, Mantralaya, Fort, Mumbai 400032',
    area: 'Fort / Kala Ghoda',
    lat: 18.9272,
    lng: 72.8315,
    hours: {
      "Monday": "Closed",
      "Tuesday": "11:00 AM - 6:00 PM",
      "Wednesday": "11:00 AM - 6:00 PM",
      "Thursday": "11:00 AM - 6:00 PM",
      "Friday": "11:00 AM - 6:00 PM",
      "Saturday": "11:00 AM - 6:00 PM",
      "Sunday": "11:00 AM - 6:00 PM"
    },
    phone: '+91 22 2288 1969',
    website: 'https://ngmaindia.gov.in',
    price_level: '₹20 Entry',
    status: 'approved',
    featured: false,
    rating: 4.7,
    review_count: 1120,
    created_at: '2026-02-15T11:00:00Z',
    photos: [
      {
        id: 'p14',
        listing_id: 'a1b2c3d4-0013-4000-8000-000000000013',
        url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
        caption: 'Exhibition hall showing modern paintings and sculpture curation',
        is_cover: true,
        display_order: 1
      }
    ]
  },
  {
    id: 'a1b2c3d4-0014-4000-8000-000000000014',
    category: 'attractions',
    name: '[Sample] Elephanta Caves (UNESCO World Heritage Site)',
    description: 'Spectacular 5th to 8th-century rock-cut cave temples on Gharapuri Island in Mumbai Harbour. Famous worldwide for the monumental 6-meter Trimurti Sadashiva sculpture, rock-cut courtyards, and ancient stone carvings.',
    address: 'Gharapuri Island, Raigad District (Ferry from Gateway of India Jetty), Maharashtra 400094',
    area: 'Mumbai Harbour / Island',
    lat: 18.9633,
    lng: 72.9315,
    hours: {
      "Monday": "Closed",
      "Tuesday": "9:00 AM - 5:30 PM",
      "Wednesday": "9:00 AM - 5:30 PM",
      "Thursday": "9:00 AM - 5:30 PM",
      "Friday": "9:00 AM - 5:30 PM",
      "Saturday": "9:00 AM - 5:30 PM",
      "Sunday": "9:00 AM - 5:30 PM"
    },
    phone: null,
    website: 'https://whc.unesco.org/en/list/244',
    price_level: '₹40 Entry',
    status: 'approved',
    featured: true,
    rating: 4.8,
    review_count: 3890,
    created_at: '2026-02-18T10:00:00Z',
    photos: [
      {
        id: 'p15',
        listing_id: 'a1b2c3d4-0014-4000-8000-000000000014',
        url: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80',
        caption: 'Colossal Trimurti monolithic rock relief carved into island basalt',
        is_cover: true,
        display_order: 1
      }
    ]
  },
  {
    id: 'a1b2c3d4-0015-4000-8000-000000000015',
    category: 'restaurants',
    name: '[Sample] Leopold Cafe & Bar',
    description: 'Legendary multi-cuisine cafe and watering hole established in 1871 on Colaba Causeway. Immortalized in Gregory David Roberts\' bestselling epic Shantaram, famed for draft beers, hearty appetizers, and historic atmosphere.',
    address: 'Opposite Colaba Police Station, Shahid Bhagat Singh Rd, Colaba Causeway, Mumbai 400001',
    area: 'Colaba',
    lat: 18.9229,
    lng: 72.8319,
    hours: {
      "Monday": "7:30 AM - 12:00 AM",
      "Tuesday": "7:30 AM - 12:00 AM",
      "Wednesday": "7:30 AM - 12:00 AM",
      "Thursday": "7:30 AM - 12:00 AM",
      "Friday": "7:30 AM - 12:00 AM",
      "Saturday": "7:30 AM - 12:00 AM",
      "Sunday": "7:30 AM - 12:00 AM"
    },
    phone: '+91 22 2282 4801',
    website: 'https://leopoldcafe.com',
    price_level: '₹₹',
    status: 'approved',
    featured: true,
    rating: 4.6,
    review_count: 2840,
    created_at: '2026-02-20T12:00:00Z',
    photos: [
      {
        id: 'p16',
        listing_id: 'a1b2c3d4-0015-4000-8000-000000000015',
        url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
        caption: 'Bustling vintage dining room and cafe tables on Colaba Causeway',
        is_cover: true,
        display_order: 1
      }
    ]
  },
  {
    id: 'a1b2c3d4-0016-4000-8000-000000000016',
    category: 'shops',
    name: '[Sample] Colaba Causeway Heritage Flea Market',
    description: 'Celebrated cultural open-air shopping promenade stretching across South Mumbai. Renowned for vintage brassware, antique clocks, semi-precious jewelry, embroidered shawls, books, and handcrafted artifacts.',
    address: 'Shahid Bhagat Singh Road, Colaba, Mumbai, Maharashtra 400001',
    area: 'Colaba',
    lat: 18.9214,
    lng: 72.8312,
    hours: {
      "Monday": "11:00 AM - 9:30 PM",
      "Tuesday": "11:00 AM - 9:30 PM",
      "Wednesday": "11:00 AM - 9:30 PM",
      "Thursday": "11:00 AM - 9:30 PM",
      "Friday": "11:00 AM - 9:30 PM",
      "Saturday": "11:00 AM - 9:30 PM",
      "Sunday": "11:00 AM - 9:30 PM"
    },
    phone: null,
    website: null,
    price_level: '₹',
    status: 'approved',
    featured: false,
    rating: 4.5,
    review_count: 1490,
    created_at: '2026-02-22T10:00:00Z',
    photos: [
      {
        id: 'p17',
        listing_id: 'a1b2c3d4-0016-4000-8000-000000000016',
        url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
        caption: 'Vibrant street stalls with antique lamps, brass curios, and jewelry',
        is_cover: true,
        display_order: 1
      }
    ]
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'r1',
    listing_id: 'a1b2c3d4-0001-4000-8000-000000000001',
    user_id: 'u-user1',
    user_name: 'Aditya Kulkarni',
    rating: 5,
    comment: 'An unmatchable landmark of Indian hospitality. Sitting in the Sea Lounge enjoying high tea while watching the sun dip into Mumbai Harbour is unforgettable.',
    created_at: '2026-02-14T14:30:00Z'
  },
  {
    id: 'r2',
    listing_id: 'a1b2c3d4-0002-4000-8000-000000000002',
    user_id: 'u-user2',
    user_name: 'Priya Mehta',
    rating: 5,
    comment: 'The Berry Pulao and Sali Boti are out of this world! Make sure to arrive early before 1:00 PM as seats fill up instantly.',
    created_at: '2026-02-18T12:15:00Z'
  },
  {
    id: 'r3',
    listing_id: 'a1b2c3d4-0006-4000-8000-000000000006',
    user_id: 'u-user3',
    user_name: 'Digvijay Patil',
    rating: 5,
    comment: 'Stepping through the Maha Darwaja gives you pure goosebumps. The sheer engineering of Chhatrapati Shivaji Maharaj\'s capital on this peak is awe-inspiring.',
    created_at: '2026-03-01T09:40:00Z'
  }
];

export const HISTORICAL_FORTS_DATA = [
  {
    id: 'a1b2c3d4-0006-4000-8000-000000000006',
    name: 'Raigad Fort',
    marathiName: 'किल्ले रायगड',
    title: 'The Sovereign Capital of the Maratha Empire',
    elevation: '820 meters (2,690 ft)',
    ruler: 'Chhatrapati Shivaji Maharaj',
    coronationYear: '1674 CE',
    architecture: 'Maratha Hill Fortress & Citadel',
    history: 'Raigad (originally Rairi) was rebuilt and fortified by master architect Hiroji Indulkar under the direct vision of Chhatrapati Shivaji Maharaj. In 1674, Shivaji Maharaj was coronated here as Chhatrapati. The fortress served as the strategic and political nerve center of the Maratha realm, featuring the royal palace, queens chambers, the Raj Bhavan, market avenue, and the formidable Takmak Tok execution cliff.',
    trekInfo: 'Approx 1,737 stone steps or an operational aerial ropeway (10 mins). Medium grade climb.',
    bestSeason: 'October to March (lush green post-monsoon or pleasant winter breezes).',
    coords: [18.2356, 73.4419] as [number, number],
    photo: 'https://images.unsplash.com/photo-1626014303757-658c2901374b?auto=format&fit=crop&w=1200&q=80',
    distanceFromMumbai: '160 km via NH66 (approx 3.5 hrs)'
  },
  {
    id: 'a1b2c3d4-0007-4000-8000-000000000007',
    name: 'Sinhagad Fort',
    marathiName: 'किल्ले सिंहगड',
    title: 'The Lion\'s Fort of the Sahyadri',
    elevation: '1,312 meters (4,304 ft)',
    ruler: 'Maratha Empire / Subedar Tanaji Malusare',
    coronationYear: '1670 Battle',
    architecture: 'High Sahyadri Cliff Bastion',
    history: 'Perched strategically on an isolated cliff of the Bhuleshwar range, Sinhagad has stood for over two millennia. In 1670, Maratha warrior Tanaji Malusare led a covert assault scaling the sheer vertical western cliff face at night to recapture the citadel from the Mughals. Chhatrapati Shivaji Maharaj famously grieved: "Gad aala, pan Sinha gela" (We won the fort, but lost the Lion).',
    trekInfo: 'Scenic 1-hour trek from Atkarwadi base or motorable ghat road right up to the Pune Gate.',
    bestSeason: 'July to February (monsoon waterfalls and winter morning fog are legendary).',
    coords: [18.3663, 73.7558] as [number, number],
    photo: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1200&q=80',
    distanceFromMumbai: '180 km via Mumbai-Pune Expressway'
  },
  {
    id: 'a1b2c3d4-0005-4000-8000-000000000005',
    name: 'Castella de Aguada (Bandra Fort)',
    marathiName: 'वांद्रे किल्ला',
    title: 'The Portuguese Coastal Watchtower',
    elevation: 'Sea Level (Coastal Rocky Promontory)',
    ruler: 'Portuguese Empire / Maratha Peshwas / British East India Co.',
    coronationYear: '1640 CE',
    architecture: 'Portuguese Marine Rampart & Battery',
    history: 'Constructed by the Portuguese in 1640 as a watchtower overlooking the northern mouth of Mahim Bay and the Arabian Sea shipping passage. Equipped with natural freshwater springs, which gave it its Portuguese name (Castella de Aguada = Fort of the Waterpoint). In 1739, Chimaji Appa captured it during the Maratha conquest of Salsette Island.',
    trekInfo: 'Directly walkable via Bandstand Promenade in Bandra West; zero trekking required.',
    bestSeason: 'Year-round, particularly 5:00 PM - 7:00 PM for sunset over the Arabian Sea.',
    coords: [19.0435, 72.8182] as [number, number],
    photo: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80',
    distanceFromMumbai: 'Within Mumbai city (Bandra West)'
  },
  {
    id: 'a1b2c3d4-0008-4000-8000-000000000008',
    name: 'Bassein Fort (Vasai Fort)',
    marathiName: 'वसईचा किल्ला',
    title: 'Fortaleza de São Sebastião de Baçaim',
    elevation: 'Coastal Estuary Level',
    ruler: 'Sultanate of Gujarat / Portuguese Empire / Peshwa Chimaji Appa',
    coronationYear: '1536 CE (Built) / 1739 CE (Liberated)',
    architecture: 'Indo-Portuguese Citadel, Bastions & Churches',
    history: 'A massive 110-acre fortified headquarters of Portuguese northern province in India. Built with 10 imposing bastions, deep stone gates, and monumental Jesuit/Franciscan cathedrals. In 1739, following a grueling 3-month siege, Peshwa Baji Rao I\'s brother Chimaji Appa decisively took the fort, marking one of the greatest military triumphs of the Marathas.',
    trekInfo: 'Flat historical walk among stone ruins; easy accessibility from Vasai railway station.',
    bestSeason: 'October through March.',
    coords: [19.3304, 72.8153] as [number, number],
    photo: 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?auto=format&fit=crop&w=1200&q=80',
    distanceFromMumbai: '50 km north of Mumbai (Vasai)'
  }
];
