import { Trade, UserProfile, ArtisanProfile, Job, Review, Message, Conversation, Report, AppNotification } from '../types';

export const SEED_TRADES: Trade[] = [
  {
    id: 'trade_carpenter',
    name: 'Carpenter',
    slug: 'carpenter',
    iconName: 'Hammer',
    description: 'Custom cabinetry, hardwood furniture, door framing, and roofing woodwork.',
    isActive: true,
    averageRateHour: 6500,
    popularServices: ['Cabinetry & Wardrobe', 'Door & Lock Realignment', 'Furniture Restoration', 'Kitchen Fitting']
  },
  {
    id: 'trade_plumber',
    name: 'Plumber',
    slug: 'plumber',
    iconName: 'Wrench',
    description: 'Precision pipe fitting, borehole maintenance, water heater, and sanitary ware.',
    isActive: true,
    averageRateHour: 7000,
    popularServices: ['Pipe Leak Repair', 'Water Pump / Borehole', 'Toilet & Basin Setup', 'Drainage Unclogging']
  },
  {
    id: 'trade_electrician',
    name: 'Electrician',
    slug: 'electrician',
    iconName: 'Zap',
    description: 'Certified domestic wiring, inverter solar installations, and distribution panels.',
    isActive: true,
    averageRateHour: 8000,
    popularServices: ['Solar / Inverter Setup', 'Conduit Wiring', 'Distribution Board Repair', 'Lighting Installation']
  },
  {
    id: 'trade_mason',
    name: 'Mason',
    slug: 'mason',
    iconName: 'Building2',
    description: 'Structural bricklaying, foundation blockwork, wall plastering, and screeding.',
    isActive: true,
    averageRateHour: 6000,
    popularServices: ['Wall Plastering', 'Block Laying', 'Concrete Floor Casting', 'Foundation Work']
  },
  {
    id: 'trade_painter',
    name: 'Painter',
    slug: 'painter',
    iconName: 'Paintbrush',
    description: 'Interior & exterior luxury finishes, wall screeding, stucco, and damp treatment.',
    isActive: true,
    averageRateHour: 5500,
    popularServices: ['Wall Screeding', 'Interior Emulsion', 'Exterior Weather-shield', 'Stucco & Textured Finish']
  },
  {
    id: 'trade_welder',
    name: 'Welder',
    slug: 'welder',
    iconName: 'Flame',
    description: 'Iron security gates, burglar proofs, structural steel fabrication, and car ports.',
    isActive: true,
    averageRateHour: 7500,
    popularServices: ['Burglary Proofs', 'Compound Gates', 'Steel Handrails', 'Car Port Canopy']
  },
  {
    id: 'trade_tiler',
    name: 'Tiler',
    slug: 'tiler',
    iconName: 'Grid3X3',
    description: 'Granite, porcelain floor tiling, bathroom tiles, terrazzo, and marble laying.',
    isActive: true,
    averageRateHour: 6500,
    popularServices: ['Porcelain Floor Tiling', 'Bathroom Wall Tiles', 'Tile Regrouting', 'Marble Polishing']
  },
  {
    id: 'trade_roofer',
    name: 'Roofer',
    slug: 'roofer',
    iconName: 'Home',
    description: 'Stone-coated tiles, aluminum roofing, wooden trusses, and gutter waterproofing.',
    isActive: true,
    averageRateHour: 8500,
    popularServices: ['Roof Leak Repair', 'Aluminum Sheeting', 'Stone-Coated Re-roofing', 'Gutter Sealing']
  },
  {
    id: 'trade_pop_installer',
    name: 'POP Installer',
    slug: 'pop-installer',
    iconName: 'Layers',
    description: 'Suspended false ceiling, POP cornices, recessed lighting coves, and acoustic boards.',
    isActive: true,
    averageRateHour: 7000,
    popularServices: ['Suspended Ceiling Design', 'Cornice Molding', 'Hidden LED Troffers', 'POP Wall Murals']
  },
  {
    id: 'trade_furniture_maker',
    name: 'Furniture Maker',
    slug: 'furniture-maker',
    iconName: 'Armchair',
    description: 'Bespoke hardwood dining sets, executive desks, luxury sofas, and upholstery.',
    isActive: true,
    averageRateHour: 7500,
    popularServices: ['Hardwood Dining Sets', 'Sofa Upholstery', 'Custom Bed Frames', 'Conference Tables']
  },
  {
    id: 'trade_mechanic',
    name: 'Mechanic',
    slug: 'mechanic',
    iconName: 'Car',
    description: 'Computerised vehicle diagnostics, engine tuning, brake overhaul, and suspension.',
    isActive: true,
    averageRateHour: 9000,
    popularServices: ['OBD-II Computer Scan', 'Brake Pad Replacement', 'Engine Servicing', 'Suspension Repair']
  },
  {
    id: 'trade_generator_tech',
    name: 'Generator Technician',
    slug: 'generator-technician',
    iconName: 'Cpu',
    description: 'Industrial diesel & domestic petrol generator servicing (Perkins, Mikano, Firman).',
    isActive: true,
    averageRateHour: 8000,
    popularServices: ['Diesel Gen Overhaul', 'Carburetor / Injector Servicing', 'Oil & Filter Routine', 'ATS Panel Setup']
  },
  {
    id: 'trade_ac_tech',
    name: 'AC Technician',
    slug: 'ac-technician',
    iconName: 'Wind',
    description: 'Inverter split AC installation, copper piping, gas recharge, and compressor repair.',
    isActive: true,
    averageRateHour: 7500,
    popularServices: ['R410A / R22 Gas Refill', 'AC Deep Chemical Wash', 'New Unit Installation', 'Compressor Replacement']
  },
  {
    id: 'trade_cleaner',
    name: 'Cleaner',
    slug: 'cleaner',
    iconName: 'Wrench',
    description: 'Post-construction deep cleaning, upholstery steam washing, and fumigation.',
    isActive: true,
    averageRateHour: 5000,
    popularServices: ['Post-Construction Clean', 'Deep House Steam Wash', 'Fumigation & Pest Control', 'Rug Washing']
  },
  {
    id: 'trade_landscaper',
    name: 'Landscaper',
    slug: 'landscaper',
    iconName: 'Trees',
    description: 'Interlocking concrete pavers, lawn turfing, perimeter drainage, and horticulture.',
    isActive: true,
    averageRateHour: 6000,
    popularServices: ['Interlocking Paving', 'Lawn Turfing & Trim', 'Garden Design', 'Kerb Stone Laying']
  }
];

export const SEED_USERS: UserProfile[] = [
  {
    id: 'user_customer_amina',
    userId: 'auth_usr_amina',
    role: 'customer',
    fullName: 'Amina Bello',
    phone: '+234 803 456 7890',
    email: 'amina.bello@lagoslaw.ng',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    state: 'Lagos',
    city: 'Eti-Osa',
    area: 'Victoria Island',
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-09-20T12:00:00Z'
  },
  {
    id: 'user_artisan_chinedu',
    userId: 'auth_art_chinedu',
    role: 'artisan',
    fullName: 'Chinedu Okafor',
    phone: '+234 802 334 9912',
    email: 'chinedu.woodworks@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    state: 'Lagos',
    city: 'Eti-Osa',
    area: 'Lekki Phase 1',
    createdAt: '2025-04-12T10:00:00Z',
    updatedAt: '2026-09-21T14:30:00Z'
  },
  {
    id: 'user_artisan_babatunde',
    userId: 'auth_art_babatunde',
    role: 'artisan',
    fullName: 'Babatunde Adeleke',
    phone: '+234 807 554 1209',
    email: 'babatunde.energy@powergrid.ng',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    state: 'Lagos',
    city: 'Eti-Osa',
    area: 'Oniru',
    createdAt: '2025-02-18T09:00:00Z',
    updatedAt: '2026-09-20T11:00:00Z'
  },
  {
    id: 'user_artisan_emeka',
    userId: 'auth_art_emeka',
    role: 'artisan',
    fullName: 'Emeka Nwosu',
    phone: '+234 814 889 0041',
    email: 'emeka.plumbing@lagoswater.com',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    state: 'Lagos',
    city: 'Lagos Island',
    area: 'Victoria Island',
    createdAt: '2025-06-25T11:00:00Z',
    updatedAt: '2026-09-19T16:00:00Z'
  },
  {
    id: 'user_artisan_musa',
    userId: 'auth_art_musa',
    role: 'artisan',
    fullName: 'Musa Ibrahim',
    phone: '+234 809 112 3490',
    email: 'musa.tilings@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
    state: 'Lagos',
    city: 'Lagos Island',
    area: 'Victoria Island',
    createdAt: '2025-08-14T09:00:00Z',
    updatedAt: '2026-09-21T10:00:00Z'
  },
  {
    id: 'user_artisan_segun',
    userId: 'auth_art_segun',
    role: 'artisan',
    fullName: 'Segun Alabi',
    phone: '+234 803 778 2211',
    email: 'segun.finishes@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80',
    state: 'Lagos',
    city: 'Lagos Island',
    area: 'Marina / Onikan',
    createdAt: '2025-09-01T14:00:00Z',
    updatedAt: '2026-09-18T10:00:00Z'
  },
  {
    id: 'user_admin_super',
    userId: 'auth_adm_001',
    role: 'admin',
    fullName: 'Kofo Martins',
    phone: '+234 800 426 3962',
    email: 'admin@calloga.ng',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    state: 'Lagos',
    city: 'Eti-Osa',
    area: 'Ikoyi',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-09-22T00:00:00Z'
  }
];

export const SEED_ARTISANS: ArtisanProfile[] = [
  {
    id: 'art_chinedu_okafor',
    userId: 'auth_art_chinedu',
    tradeId: 'trade_carpenter',
    headlineTitle: 'Master Furniture Maker & Architectural Carpenter',
    bio: 'Specialized in bespoke hardwood dining sets, kitchen cabinetry, door installations, and structural woodwork repairs. Trained at Yaba College of Technology with 8 years crafting durable furniture for Lagos homes.',
    experienceYears: 8,
    location: {
      lat: 6.4474,
      lng: 3.4842,
      address: 'Plot 14, Admiralty Way, Lekki Phase 1',
      state: 'Lagos',
      city: 'Eti-Osa',
      area: 'Lekki Phase 1'
    },
    serviceRadiusKm: 25,
    availabilityStatus: 'available_today',
    verificationStatus: 'verified',
    verificationProvider: 'didit',
    verificationSessionId: 'didit_ses_live_chinedu_7721',
    verificationCompletedAt: '2025-04-15T14:22:00Z',
    ratingAverage: 4.9,
    reviewCount: 128,
    completedJobs: 142,
    hourlyRate: 6500,
    baseFee: 15000,
    responseTimeMinutes: 15,
    education: 'YABATECH Alum',
    equipmentHighlight: 'Equipped with portable German precision power tools',
    badges: ['identity_verified', 'phone_verified', 'trusted_master', 'top_rated'],
    user: SEED_USERS[1],
    trade: SEED_TRADES[0],
    services: [
      {
        id: 'srv_c1',
        artisanId: 'art_chinedu_okafor',
        serviceName: 'Cabinetry & Wardrobe',
        description: 'Custom fitouts, marine board lamination, soft-close hinges and drawer slides.',
        startingPrice: 85000,
        pricingType: 'starting_from',
        createdAt: '2025-04-15T00:00:00Z'
      },
      {
        id: 'srv_c2',
        artisanId: 'art_chinedu_okafor',
        serviceName: 'Door & Frame Realignment',
        description: 'Jamming doors, locksets, brass mortise handles and hinge replacement.',
        startingPrice: 18000,
        pricingType: 'fixed',
        createdAt: '2025-04-15T00:00:00Z'
      },
      {
        id: 'srv_c3',
        artisanId: 'art_chinedu_okafor',
        serviceName: 'Furniture Restoration',
        description: 'Deep sanding, staining, lacquer finish, and joint reinforcement for antique hardwood.',
        startingPrice: 25000,
        pricingType: 'starting_from',
        createdAt: '2025-04-15T00:00:00Z'
      },
      {
        id: 'srv_c4',
        artisanId: 'art_chinedu_okafor',
        serviceName: 'On-site Inspection',
        description: 'Physical dimension taking, wood grain assessment. 100% credited towards final project.',
        startingPrice: 10000,
        pricingType: 'inspection_fee',
        createdAt: '2025-04-15T00:00:00Z'
      }
    ],
    portfolio: [
      {
        id: 'port_c1',
        artisanId: 'art_chinedu_okafor',
        imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
        title: 'Solid Teak Island',
        description: 'Handcrafted teak central kitchen island with wine rack and quartz top border.',
        category: 'Kitchen Cabinetry',
        locationTag: 'Ikoyi',
        timeAgo: '3 days ago',
        createdAt: '2026-09-18T00:00:00Z'
      },
      {
        id: 'port_c2',
        artisanId: 'art_chinedu_okafor',
        imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
        title: 'Acoustic Paneling',
        description: 'Fluted white oak vertical slat wall installation with concealed LED ambient lighting.',
        category: 'Wall Finishes',
        locationTag: 'Lekki Phase 1',
        timeAgo: '2 weeks ago',
        createdAt: '2026-09-08T00:00:00Z'
      },
      {
        id: 'port_c3',
        artisanId: 'art_chinedu_okafor',
        imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=80',
        title: 'Mahogany Dining',
        description: '10-seater hand-planed mahogany dining table with live-edge finish and mortise joinery.',
        category: 'Custom Furniture',
        locationTag: 'Victoria Island',
        timeAgo: '1 month ago',
        createdAt: '2026-08-20T00:00:00Z'
      },
      {
        id: 'port_c4',
        artisanId: 'art_chinedu_okafor',
        imageUrl: 'https://images.unsplash.com/photo-1558997519-83ea9252def8?auto=format&fit=crop&w=600&q=80',
        title: 'Walk-in Closet Fitout',
        description: 'Full height wardrobe units, velvet jewelry pull-outs, and backlit glass display.',
        category: 'Wardrobes',
        locationTag: 'Oniru',
        timeAgo: '2 months ago',
        createdAt: '2026-07-15T00:00:00Z'
      }
    ],
    createdAt: '2025-04-12T10:00:00Z',
    updatedAt: '2026-09-22T02:00:00Z'
  },
  {
    id: 'art_babatunde_adeleke',
    userId: 'auth_art_babatunde',
    tradeId: 'trade_electrician',
    headlineTitle: 'Certified Solar & Industrial Electrician',
    bio: 'NEMSA certified power engineer with over 10 years experience in residential lithium inverter systems, 3-phase commercial distribution boards, and surge protection. Fast diagnosis and zero shortcuts.',
    experienceYears: 10,
    location: {
      lat: 6.4352,
      lng: 3.4412,
      address: 'Palace Road, Oniru, Victoria Island extension',
      state: 'Lagos',
      city: 'Eti-Osa',
      area: 'Oniru'
    },
    serviceRadiusKm: 30,
    availabilityStatus: 'available_now',
    verificationStatus: 'verified',
    verificationProvider: 'didit',
    verificationSessionId: 'didit_ses_live_babatunde_3321',
    verificationCompletedAt: '2025-02-20T10:15:00Z',
    ratingAverage: 5.0,
    reviewCount: 198,
    completedJobs: 214,
    hourlyRate: 8000,
    baseFee: 12000,
    responseTimeMinutes: 10,
    education: 'University of Lagos / NEMSA Certified',
    equipmentHighlight: 'Industrial thermal imaging camera & digital fluke multimeter',
    badges: ['identity_verified', 'phone_verified', 'trusted_master', 'top_rated'],
    user: SEED_USERS[2],
    trade: SEED_TRADES[2],
    services: [
      {
        id: 'srv_b1',
        artisanId: 'art_babatunde_adeleke',
        serviceName: 'Solar & Inverter Setup',
        description: 'Complete 5kVA - 15kVA solar inverter sizing, lithium battery bank connection, and load balancing.',
        startingPrice: 120000,
        pricingType: 'starting_from',
        createdAt: '2025-02-20T00:00:00Z'
      },
      {
        id: 'srv_b2',
        artisanId: 'art_babatunde_adeleke',
        serviceName: 'Electrical Fault Tracing',
        description: 'High voltage leakage, frequent tripping breakers, short circuits, and earthing installation.',
        startingPrice: 20000,
        pricingType: 'fixed',
        createdAt: '2025-02-20T00:00:00Z'
      }
    ],
    portfolio: [
      {
        id: 'port_b1',
        artisanId: 'art_babatunde_adeleke',
        imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80',
        title: '10kVA Hybrid Solar Inverter',
        description: 'Dual Felicity lithium battery wall-mount setup with automatic generator switchgear in Ikoyi.',
        category: 'Solar Energy',
        locationTag: 'Ikoyi',
        timeAgo: '1 week ago',
        createdAt: '2026-09-14T00:00:00Z'
      }
    ],
    createdAt: '2025-02-18T09:00:00Z',
    updatedAt: '2026-09-21T18:00:00Z'
  },
  {
    id: 'art_emeka_nwosu',
    userId: 'auth_art_emeka',
    tradeId: 'trade_plumber',
    headlineTitle: 'Precision Pipe & Borehole Plumber',
    bio: 'Specialist in PPR fusion hot/cold water piping, high-pressure submersible pumps, water treatment plants, and bathroom luxury fixtures. Clean, leak-free installations backed by written guarantee.',
    experienceYears: 7,
    location: {
      lat: 6.4281,
      lng: 3.4219,
      address: 'Adeola Odeku Street, Victoria Island',
      state: 'Lagos',
      city: 'Lagos Island',
      area: 'Victoria Island'
    },
    serviceRadiusKm: 20,
    availabilityStatus: 'tomorrow',
    verificationStatus: 'verified',
    verificationProvider: 'didit',
    verificationSessionId: 'didit_ses_live_emeka_9901',
    verificationCompletedAt: '2025-06-27T16:40:00Z',
    ratingAverage: 4.85,
    reviewCount: 88,
    completedJobs: 94,
    hourlyRate: 7000,
    baseFee: 10000,
    responseTimeMinutes: 20,
    education: 'Federal Technical College, Yaba',
    equipmentHighlight: 'PPR thermo-fusion welding gear & pipe camera locator',
    badges: ['identity_verified', 'phone_verified', 'top_rated'],
    user: SEED_USERS[3],
    trade: SEED_TRADES[1],
    services: [
      {
        id: 'srv_e1',
        artisanId: 'art_emeka_nwosu',
        serviceName: 'Borehole Pump Replacement',
        description: 'Pulling existing submersible pump, electrical cable splicing, safety rope, and test run.',
        startingPrice: 45000,
        pricingType: 'starting_from',
        createdAt: '2025-06-28T00:00:00Z'
      },
      {
        id: 'srv_e2',
        artisanId: 'art_emeka_nwosu',
        serviceName: 'Concealed Pipe Leak Fix',
        description: 'Detecting slab moisture, non-destructive tile access, fusion sleeve joint, and pressure testing.',
        startingPrice: 25000,
        pricingType: 'fixed',
        createdAt: '2025-06-28T00:00:00Z'
      }
    ],
    portfolio: [
      {
        id: 'port_e1',
        artisanId: 'art_emeka_nwosu',
        imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
        title: 'Modern Grohe Shower Installation',
        description: 'Thermostatic concealed mixer with body jets and pressure pump calibration in Victoria Island.',
        category: 'Plumbing',
        locationTag: 'Victoria Island',
        timeAgo: '4 days ago',
        createdAt: '2026-09-17T00:00:00Z'
      }
    ],
    createdAt: '2025-06-25T11:00:00Z',
    updatedAt: '2026-09-21T09:00:00Z'
  },
  {
    id: 'art_musa_ibrahim',
    userId: 'auth_art_musa',
    tradeId: 'trade_tiler',
    headlineTitle: 'Master Italian & Spanish Porcelain Tiler',
    bio: '12 years precision floor and wall tiling for luxury duplexes and commercial spaces across Lagos Island and Abuja. Zero hollow sounds, laser-level alignment, and diamond cut miter joints.',
    experienceYears: 12,
    location: {
      lat: 6.4312,
      lng: 3.4350,
      address: 'Ozumba Mbadiwe Avenue, Victoria Island',
      state: 'Lagos',
      city: 'Lagos Island',
      area: 'Victoria Island'
    },
    serviceRadiusKm: 25,
    availabilityStatus: 'available_today',
    verificationStatus: 'verified',
    verificationProvider: 'didit',
    verificationCompletedAt: '2025-08-20T12:00:00Z',
    ratingAverage: 4.9,
    reviewCount: 132,
    completedJobs: 140,
    hourlyRate: 6500,
    baseFee: 15000,
    responseTimeMinutes: 15,
    education: 'Apprenticeship Master Guild, Kano & Lagos',
    equipmentHighlight: 'Ruby laser tile cutter & vibrating suction leveling cups',
    badges: ['identity_verified', 'phone_verified', 'trusted_master'],
    user: SEED_USERS[4],
    trade: SEED_TRADES[6],
    services: [
      {
        id: 'srv_m1',
        artisanId: 'art_musa_ibrahim',
        serviceName: '60x120 Porcelain Floor Tiling',
        description: 'Surface leveling, polymer-modified adhesive, 2mm spacers, and epoxy grout sealing.',
        startingPrice: 3500,
        pricingType: 'hourly',
        createdAt: '2025-08-20T00:00:00Z'
      }
    ],
    portfolio: [
      {
        id: 'port_m1',
        artisanId: 'art_musa_ibrahim',
        imageUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=600&q=80',
        title: 'Calacatta Gold Porcelain Salon',
        description: 'Bookmatched 120x60 Italian glazed tiles with continuous veining in Ikoyi penthouse.',
        category: 'Tiling',
        locationTag: 'Ikoyi',
        timeAgo: '1 week ago',
        createdAt: '2026-09-15T00:00:00Z'
      }
    ],
    createdAt: '2025-08-14T09:00:00Z',
    updatedAt: '2026-09-21T11:00:00Z'
  },
  {
    id: 'art_segun_alabi',
    userId: 'auth_art_segun',
    tradeId: 'trade_painter',
    headlineTitle: 'Luxury Architectural Painter & Screeder',
    bio: 'Professional wall screeding using POP putty, anti-fungal damp proofing, and spray finishes. Clean lines, zero paint drip on floors, and flawless matte and satin coats.',
    experienceYears: 6,
    location: {
      lat: 6.4501,
      lng: 3.3985,
      address: 'Broad Street, Marina, Lagos Island',
      state: 'Lagos',
      city: 'Lagos Island',
      area: 'Marina / Onikan'
    },
    serviceRadiusKm: 20,
    availabilityStatus: 'available_today',
    verificationStatus: 'verified',
    verificationProvider: 'didit',
    verificationCompletedAt: '2025-09-05T10:00:00Z',
    ratingAverage: 4.7,
    reviewCount: 78,
    completedJobs: 82,
    hourlyRate: 5500,
    baseFee: 12000,
    responseTimeMinutes: 25,
    education: 'Dulux Academy Lagos Certified',
    equipmentHighlight: 'Airless Wagner spray system & mechanical wall sander with vacuum',
    badges: ['identity_verified', 'phone_verified'],
    user: SEED_USERS[5],
    trade: SEED_TRADES[4],
    services: [
      {
        id: 'srv_s1',
        artisanId: 'art_segun_alabi',
        serviceName: 'Full Room Screeding & Repaint',
        description: 'Double coat POP wall screeding, sanding with vacuum, undercoat, and two premium satin coats.',
        startingPrice: 65000,
        pricingType: 'starting_from',
        createdAt: '2025-09-05T00:00:00Z'
      }
    ],
    portfolio: [
      {
        id: 'port_s1',
        artisanId: 'art_segun_alabi',
        imageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80',
        title: 'Sage Green Minimalist Living Room',
        description: 'Smooth screeded accent wall with washable silk finish in Onikan apartment.',
        category: 'Painting',
        locationTag: 'Onikan',
        timeAgo: '2 weeks ago',
        createdAt: '2026-09-06T00:00:00Z'
      }
    ],
    createdAt: '2025-09-01T14:00:00Z',
    updatedAt: '2026-09-20T17:00:00Z'
  }
];

export const SEED_REVIEWS: Review[] = [
  {
    id: 'rev_1',
    jobId: 'job_past_1',
    customerId: 'user_customer_femi',
    artisanId: 'art_chinedu_okafor',
    rating: 5,
    comment: 'Chinedu came within 40 minutes of booking. His attention to detail on our kitchen cabinets was world-class. Very respectful and tidy.',
    customerName: 'Dr. Femi O.',
    customerArea: 'Lekki Phase 1',
    jobTitle: 'Kitchen Cabinet Realignment & Soft-Close',
    tags: ['Punctual', 'Clean Finish', 'Respectful', 'Fair Pricing'],
    createdAt: '2026-09-18T16:20:00Z'
  },
  {
    id: 'rev_2',
    jobId: 'job_past_2',
    customerId: 'user_customer_adaobi',
    artisanId: 'art_chinedu_okafor',
    rating: 5,
    comment: 'Reliable artisans are hard to find in Lagos. Chinedu is a rare gem. Clean cuts, fair pricing, and finished on the promised day.',
    customerName: 'Adaobi K.',
    customerArea: 'Victoria Island',
    jobTitle: 'Solid Teak Dining Table Sanding & Polish',
    tags: ['Punctual', 'Expert Craftsmanship', 'No Excuses'],
    createdAt: '2026-09-05T11:15:00Z'
  },
  {
    id: 'rev_3',
    jobId: 'job_past_3',
    customerId: 'user_customer_amina',
    artisanId: 'art_babatunde_adeleke',
    rating: 5,
    comment: 'Babatunde resolved a dangerous earth leakage issue that two previous electricians failed to detect. His thermal camera spotted the burnt terminal instantly.',
    customerName: 'Amina Bello',
    customerArea: 'Victoria Island',
    jobTitle: 'Distribution Panel Surge & Earth Leakage',
    tags: ['Certified Pro', 'Thermal Scan', 'Fast Response'],
    createdAt: '2026-08-28T14:45:00Z'
  }
];

export const SEED_JOBS: Job[] = [
  {
    id: 'job_active_dining',
    jobCode: 'HN-84920',
    customerId: 'user_customer_amina',
    artisanId: 'art_chinedu_okafor',
    tradeId: 'trade_carpenter',
    title: 'Custom Mahogany Dining Table Repair',
    description: 'Repair structural wobble on 8-seater solid mahogany dining table, deep sand surface scratches caused during house move, and apply protective heat-resistant satin lacquer.',
    budgetMin: 50000,
    budgetMax: 80000,
    escrowAmount: 35000,
    escrowStatus: 'held_in_escrow',
    releaseOtp: '8492',
    location: {
      address: 'Admiralty Way, Lekki Phase 1, Lagos',
      area: 'Lekki Phase 1',
      state: 'Lagos',
      lat: 6.4474,
      lng: 3.4842
    },
    scheduledDate: 'September 25',
    preferredTimeWindow: 'Morning (09:00 AM - 12:00 PM)',
    status: 'in_progress',
    images: [
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=80'
    ],
    workCompletedPhotos: [],
    customer: SEED_USERS[0],
    artisan: SEED_ARTISANS[0],
    trade: SEED_TRADES[0],
    currentEtaMinutes: 18,
    artisanCurrentLocation: {
      lat: 6.4410,
      lng: 3.4680,
      locationName: 'Lekki-Epe Tollgate'
    },
    milestones: [
      {
        id: 'ms_1',
        stepNumber: 1,
        title: 'Request Sent & Deposit Funded',
        description: '₦35,000 held safely in callOga Escrow',
        timestamp: '09:15 AM',
        status: 'completed'
      },
      {
        id: 'ms_2',
        stepNumber: 2,
        title: 'Artisan Accepted',
        description: 'Chinedu confirmed tools and availability',
        timestamp: '09:22 AM',
        status: 'completed'
      },
      {
        id: 'ms_3',
        stepNumber: 3,
        title: 'Artisan On the Way',
        description: 'Moving on Lekki-Epe expressway • Estimated in 18 min with wood filler, varnishes & joinery tools',
        timestamp: '10:05 AM',
        status: 'current'
      },
      {
        id: 'ms_4',
        stepNumber: 4,
        title: 'Work Started & Inspection',
        description: 'Physical assessment, wood moisture check & lacquer prep',
        status: 'pending'
      },
      {
        id: 'ms_5',
        stepNumber: 5,
        title: 'Work Completed & Review Photos',
        description: 'Artisan uploads before/after verification shots',
        status: 'pending'
      },
      {
        id: 'ms_6',
        stepNumber: 6,
        title: 'Release Payment & Review Artisan',
        description: 'Funds only released when you are 100% satisfied via digital OTP release',
        status: 'pending'
      }
    ],
    createdAt: '2026-09-22T08:15:00Z',
    updatedAt: '2026-09-22T10:05:00Z'
  },
  {
    id: 'job_pending_inverter',
    jobCode: 'HN-84921',
    customerId: 'user_customer_amina',
    artisanId: 'art_babatunde_adeleke',
    tradeId: 'trade_electrician',
    title: 'Inverter Battery Health Audit & Solar Panel Cleaning',
    description: 'Quarterly maintenance for 5kVA solar setup. Check electrolyte levels or lithium BMS state of charge and clean 8 rooftop solar panels in Victoria Island.',
    budgetMin: 30000,
    budgetMax: 45000,
    escrowAmount: 30000,
    escrowStatus: 'held_in_escrow',
    releaseOtp: '3941',
    location: {
      address: 'Adeola Hopewell, Victoria Island, Lagos',
      area: 'Victoria Island',
      state: 'Lagos',
      lat: 6.4290,
      lng: 3.4250
    },
    scheduledDate: 'September 28',
    preferredTimeWindow: 'Afternoon (02:00 PM)',
    status: 'scheduled',
    images: [],
    customer: SEED_USERS[0],
    artisan: SEED_ARTISANS[1],
    trade: SEED_TRADES[2],
    milestones: [
      {
        id: 'ms_i1',
        stepNumber: 1,
        title: 'Request Sent & Deposit Funded',
        description: '₦30,000 held safely in callOga Escrow',
        timestamp: 'Yesterday',
        status: 'completed'
      },
      {
        id: 'ms_i2',
        stepNumber: 2,
        title: 'Artisan Accepted & Scheduled',
        description: 'Babatunde locked scheduled date for Sept 28',
        timestamp: 'Yesterday',
        status: 'completed'
      },
      {
        id: 'ms_i3',
        stepNumber: 3,
        title: 'Work Date Scheduled',
        description: 'Arrival scheduled for Sept 28 at 2:00 PM',
        status: 'current'
      }
    ],
    createdAt: '2026-09-21T11:00:00Z',
    updatedAt: '2026-09-21T12:00:00Z'
  }
];

export const SEED_MESSAGES: Message[] = [
  {
    id: 'msg_1',
    conversationId: 'conv_amina_chinedu',
    senderId: 'user_customer_amina',
    senderRole: 'customer',
    message: 'Good morning Chinedu! Are you still able to come with the heat-resistant varnish for the table today?',
    createdAt: '2026-09-22T09:30:00Z',
    readAt: '2026-09-22T09:32:00Z'
  },
  {
    id: 'msg_2',
    conversationId: 'conv_amina_chinedu',
    senderId: 'user_artisan_chinedu',
    senderRole: 'artisan',
    message: 'Good morning Madam Amina. Yes, absolutely! I have the polyurethane satin coat and German sandpaper in the van. Just passed the tollgate now.',
    createdAt: '2026-09-22T09:33:00Z',
    readAt: '2026-09-22T09:34:00Z'
  },
  {
    id: 'msg_3',
    conversationId: 'conv_amina_chinedu',
    senderId: 'user_customer_amina',
    senderRole: 'customer',
    message: 'Great, the security guard has been informed. You can drive straight to Block B parking.',
    createdAt: '2026-09-22T09:36:00Z',
    readAt: '2026-09-22T09:37:00Z'
  },
  {
    id: 'msg_4',
    conversationId: 'conv_amina_chinedu',
    senderId: 'user_artisan_chinedu',
    senderRole: 'artisan',
    message: 'Perfect, see you in about 15 minutes!',
    createdAt: '2026-09-22T09:40:00Z'
  }
];

export const SEED_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_amina_chinedu',
    customerId: 'user_customer_amina',
    artisanId: 'art_chinedu_okafor',
    jobId: 'job_active_dining',
    lastMessage: 'Perfect, see you in about 15 minutes!',
    lastMessageTime: '10:05 AM',
    customer: SEED_USERS[0],
    artisan: SEED_ARTISANS[0],
    unreadCountCustomer: 0,
    unreadCountArtisan: 0,
    createdAt: '2026-09-22T09:15:00Z',
    updatedAt: '2026-09-22T10:05:00Z'
  },
  {
    id: 'conv_amina_babatunde',
    customerId: 'user_customer_amina',
    artisanId: 'art_babatunde_adeleke',
    jobId: 'job_pending_inverter',
    lastMessage: 'Looking forward to the solar audit on Saturday.',
    lastMessageTime: 'Yesterday',
    customer: SEED_USERS[0],
    artisan: SEED_ARTISANS[1],
    unreadCountCustomer: 0,
    unreadCountArtisan: 0,
    createdAt: '2026-09-21T11:00:00Z',
    updatedAt: '2026-09-21T12:05:00Z'
  }
];

export const SEED_REPORTS: Report[] = [
  {
    id: 'rep_1',
    reporterId: 'user_customer_amina',
    reportedUserId: 'auth_usr_unverified_bogus',
    reason: 'fake_profile',
    description: 'User claimed to have an office at Saka Tinubu but could not produce a valid trade certificate or workshop location.',
    status: 'investigating',
    reporter: SEED_USERS[0],
    reportedUser: {
      id: 'usr_suspicious_1',
      userId: 'auth_usr_unverified_bogus',
      role: 'artisan',
      fullName: 'Sunday Ojo',
      phone: '+234 809 999 0000',
      email: 'sunday.fake@yahoo.com',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      state: 'Lagos',
      city: 'Lagos Island',
      area: 'Victoria Island',
      isSuspended: false,
      createdAt: '2026-09-10T00:00:00Z',
      updatedAt: '2026-09-10T00:00:00Z'
    },
    adminNotes: 'Didit biometric check was flagged for stolen identity attempt. Recommended for permanent suspension.',
    createdAt: '2026-09-19T10:00:00Z'
  }
];

export const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    userId: 'user_customer_amina',
    type: 'job_status',
    title: 'Artisan On the Way',
    message: 'Chinedu Okafor is en route to Admiralty Way (~18 min away).',
    data: { jobId: 'job_active_dining' },
    readAt: undefined,
    createdAt: '2026-09-22T10:05:00Z'
  },
  {
    id: 'notif_2',
    userId: 'user_customer_amina',
    type: 'escrow',
    title: 'Escrow Secured',
    message: '₦35,000 has been securely locked in callOga SafePay Escrow.',
    data: { jobId: 'job_active_dining' },
    readAt: '2026-09-22T09:16:00Z',
    createdAt: '2026-09-22T09:15:00Z'
  }
];
