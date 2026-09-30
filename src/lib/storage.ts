import {
  UserProfile,
  ArtisanProfile,
  Trade,
  Job,
  Review,
  Message,
  Conversation,
  Report,
  AppNotification,
  UserRole,
  VerificationRecord,
  VerificationStatus,
  JobStatus
} from '../types';
import {
  SEED_TRADES,
  SEED_USERS,
  SEED_ARTISANS,
  SEED_JOBS,
  SEED_REVIEWS,
  SEED_MESSAGES,
  SEED_CONVERSATIONS,
  SEED_REPORTS,
  SEED_NOTIFICATIONS
} from '../data/seedData';
import { calculateDistanceKm, DEFAULT_CUSTOMER_LOCATION } from '../services/locationService';

const STORAGE_KEYS = {
  CURRENT_USER_ID: 'calloga_current_user_id',
  USERS: 'calloga_users_v2',
  ARTISANS: 'calloga_artisans_v2',
  TRADES: 'calloga_trades_v2',
  JOBS: 'calloga_jobs_v2',
  REVIEWS: 'calloga_reviews_v2',
  MESSAGES: 'calloga_messages_v2',
  CONVERSATIONS: 'calloga_conversations_v2',
  REPORTS: 'calloga_reports_v2',
  NOTIFICATIONS: 'calloga_notifications_v2',
  ONBOARDING_SEEN: 'calloga_splash_onboarding_seen',
  CUSTOMER_COORDINATES: 'calloga_customer_coords_v2'
};

class StorageService {
  private users: UserProfile[] = [];
  private artisans: ArtisanProfile[] = [];
  private trades: Trade[] = [];
  private jobs: Job[] = [];
  private reviews: Review[] = [];
  private messages: Message[] = [];
  private conversations: Conversation[] = [];
  private reports: Report[] = [];
  private notifications: AppNotification[] = [];
  private currentUserId: string | null = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    try {
      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      this.users = storedUsers ? JSON.parse(storedUsers) : [...SEED_USERS];

      const storedArtisans = localStorage.getItem(STORAGE_KEYS.ARTISANS);
      this.artisans = storedArtisans ? JSON.parse(storedArtisans) : [...SEED_ARTISANS];

      const storedTrades = localStorage.getItem(STORAGE_KEYS.TRADES);
      this.trades = storedTrades ? JSON.parse(storedTrades) : [...SEED_TRADES];

      const storedJobs = localStorage.getItem(STORAGE_KEYS.JOBS);
      this.jobs = storedJobs ? JSON.parse(storedJobs) : [...SEED_JOBS];

      const storedReviews = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      this.reviews = storedReviews ? JSON.parse(storedReviews) : [...SEED_REVIEWS];

      const storedMessages = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      this.messages = storedMessages ? JSON.parse(storedMessages) : [...SEED_MESSAGES];

      const storedConversations = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      this.conversations = storedConversations ? JSON.parse(storedConversations) : [...SEED_CONVERSATIONS];

      const storedReports = localStorage.getItem(STORAGE_KEYS.REPORTS);
      this.reports = storedReports ? JSON.parse(storedReports) : [...SEED_REPORTS];

      const storedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      this.notifications = storedNotifs ? JSON.parse(storedNotifs) : [...SEED_NOTIFICATIONS];

      const storedCurUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      this.currentUserId = (storedCurUser && this.users.some((u) => u.id === storedCurUser)) ? storedCurUser : null;

      this.persistAll();
    } catch {
      // Fallback in case of storage quota or parsing errors
      this.users = [...SEED_USERS];
      this.artisans = [...SEED_ARTISANS];
      this.trades = [...SEED_TRADES];
      this.jobs = [...SEED_JOBS];
      this.reviews = [...SEED_REVIEWS];
      this.messages = [...SEED_MESSAGES];
      this.conversations = [...SEED_CONVERSATIONS];
      this.reports = [...SEED_REPORTS];
      this.notifications = [...SEED_NOTIFICATIONS];
    }
  }

  private persistAll() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
      localStorage.setItem(STORAGE_KEYS.ARTISANS, JSON.stringify(this.artisans));
      localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(this.trades));
      localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(this.jobs));
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(this.reviews));
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(this.messages));
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(this.conversations));
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(this.reports));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));
      if (this.currentUserId) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, this.currentUserId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
      }
    } catch (e) {
      console.warn('Storage persistence notice:', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  // --- Auth & User State ---
  public getCurrentUser(): UserProfile | null {
    if (!this.currentUserId) return null;
    return this.users.find((u) => u.id === this.currentUserId) || null;
  }

  public setCurrentUser(userId: string | null) {
    this.currentUserId = userId;
    this.persistAll();
  }

  public login(
    queryOrCredentials: string | { emailOrPhone: string; password?: string },
    passwordArg?: string
  ): { success: boolean; user?: UserProfile; error?: string } {
    let rawQuery = '';
    let rawPassword = '';

    if (typeof queryOrCredentials === 'string') {
      rawQuery = queryOrCredentials;
      rawPassword = passwordArg || '';
    } else if (queryOrCredentials) {
      rawQuery = queryOrCredentials.emailOrPhone || '';
      rawPassword = queryOrCredentials.password || '';
    }

    const query = rawQuery.trim().toLowerCase();
    const password = rawPassword.trim();

    if (!query) {
      return { success: false, error: 'Please enter your email or phone number.' };
    }
    if (!password) {
      return { success: false, error: 'Please enter your account password.' };
    }

    const cleanPhone = query.replace(/[\s+-]/g, '');
    const user = this.users.find(
      (u) => u.email.toLowerCase() === query || u.phone.replace(/[\s+-]/g, '') === cleanPhone
    );

    if (!user) {
      return {
        success: false,
        error: 'No account found with this email or phone. Please verify your details or create a new account.'
      };
    }

    if (user.isSuspended) {
      return {
        success: false,
        error: 'This account has been temporarily suspended. Please contact callOga support.'
      };
    }

    // Verify password if user has password set
    if (user.password && user.password !== password) {
      return {
        success: false,
        error: 'Incorrect password. Please verify your password and try again.'
      };
    }

    // If existing seed user has no password yet, associate the supplied password
    if (!user.password) {
      user.password = password;
    }

    this.currentUserId = user.id;
    this.persistAll();
    return { success: true, user };
  }

  public loginWithOAuth(provider: 'google' | 'phone' | 'email', customEmail?: string): UserProfile {
    const targetEmail = customEmail?.trim().toLowerCase() || 'bioes2007@gmail.com';
    let user = this.users.find((u) => u.email.toLowerCase() === targetEmail);
    if (!user) {
      user = {
        id: `usr_${Date.now()}`,
        userId: `auth_g_${Date.now()}`,
        role: 'customer',
        fullName: targetEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        email: targetEmail,
        phone: '+234 803 123 4567',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        state: 'Lagos',
        city: 'Eti-Osa',
        area: 'Victoria Island',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.users.unshift(user);
    }
    this.currentUserId = user.id;
    this.persistAll();
    return user;
  }

  public logout() {
    this.currentUserId = null;
    this.persistAll();
  }

  public getUsers(): UserProfile[] {
    return [...this.users];
  }

  public switchRole(role: UserRole) {
    const cur = this.getCurrentUser();
    if (cur) {
      cur.role = role;
      this.persistAll();
    } else {
      if (role === 'customer') {
        this.currentUserId = 'user_customer_amina';
      } else if (role === 'artisan') {
        this.currentUserId = 'user_artisan_chinedu';
      } else if (role === 'admin') {
        this.currentUserId = 'user_admin_super';
      }
      this.persistAll();
    }
  }

  public registerUser(data: {
    fullName: string;
    email: string;
    phone: string;
    role: UserRole;
    password?: string;
    state?: string;
    area?: string;
  }): { success: boolean; user?: UserProfile; error?: string } {
    const fullName = data.fullName?.trim() || '';
    const email = data.email?.trim().toLowerCase() || '';
    const phone = data.phone?.trim() || '';
    const password = data.password?.trim() || '';

    // Validation: Full Name
    if (!fullName || fullName.length < 2) {
      return { success: false, error: 'Please enter your full name (minimum 2 characters).' };
    }

    // Validation: Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return { success: false, error: 'Please enter a valid email address (e.g. name@domain.com).' };
    }

    // Validation: Phone
    const cleanPhone = phone.replace(/[\s+-]/g, '');
    if (!phone || cleanPhone.length < 10) {
      return { success: false, error: 'Please enter a valid Nigerian phone number (at least 10 digits).' };
    }

    // Validation: Password
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    // Prevent duplicates
    const duplicateEmail = this.users.find((u) => u.email.toLowerCase() === email);
    if (duplicateEmail) {
      return {
        success: false,
        error: 'An account with this email address already exists. Please sign in instead.'
      };
    }

    const duplicatePhone = this.users.find((u) => u.phone.replace(/[\s+-]/g, '') === cleanPhone);
    if (duplicatePhone) {
      return {
        success: false,
        error: 'An account with this phone number already exists. Please sign in instead.'
      };
    }

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      userId: `auth_${Date.now()}`,
      role: data.role,
      fullName: fullName,
      email: email,
      phone: phone,
      password: password,
      avatarUrl: `https://images.unsplash.com/photo-${
        data.role === 'artisan' ? '1507003211169-0a1dd7228f2d' : '1534528741775-53994a69daeb'
      }?auto=format&fit=crop&w=300&q=80`,
      state: data.state || 'Lagos',
      city: 'Eti-Osa',
      area: data.area || 'Victoria Island',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // If registering as an artisan, ensure an initial artisan profile exists
    if (data.role === 'artisan') {
      const existingArtisan = this.artisans.find((a) => a.userId === newUser.userId);
      if (!existingArtisan) {
        const defaultTrade = this.trades[0] || {
          id: 'trade_carpenter',
          name: 'Carpenter',
          slug: 'carpenter',
          iconName: 'Hammer',
          description: 'Custom cabinetry, hardwood furniture, and woodwork.',
          isActive: true
        };
        const newArtisan: ArtisanProfile = {
          id: `art_${newUser.id}`,
          userId: newUser.userId,
          tradeId: defaultTrade.id,
          trade: defaultTrade,
          headlineTitle: 'Certified Artisan & Service Professional',
          bio: 'Providing dependable, verified craftsmanship with guaranteed quality across Nigeria.',
          experienceYears: 3,
          baseFee: 6000,
          serviceRadiusKm: 20,
          location: {
            lat: 6.4474,
            lng: 3.4842,
            address: `${newUser.area || 'Victoria Island'}, Lagos`,
            state: 'Lagos',
            city: 'Eti-Osa',
            area: newUser.area || 'Victoria Island'
          },
          availabilityStatus: 'available_today',
          verificationStatus: 'not_started',
          verificationProvider: 'dev_mock',
          ratingAverage: 5.0,
          reviewCount: 0,
          completedJobs: 0,
          hourlyRate: 6000,
          responseTimeMinutes: 15,
          badges: ['phone_verified'],
          user: newUser,
          portfolio: [],
          services: [
            {
              id: `srv_${Date.now()}`,
              artisanId: `art_${newUser.id}`,
              serviceName: 'General Inspection & Diagnostics',
              description: 'On-site technical inspection, fault assessment, and scope breakdown.',
              startingPrice: 5000,
              pricingType: 'inspection_fee',
              createdAt: new Date().toISOString()
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        this.artisans.unshift(newArtisan);
      }
    }

    this.users.unshift(newUser);
    this.currentUserId = newUser.id;
    this.persistAll();
    return { success: true, user: newUser };
  }

  // --- Location State ---
  public getSavedCustomerLocation(): { lat: number; lng: number; area: string } {
    if (typeof window === 'undefined') {
      return { lat: DEFAULT_CUSTOMER_LOCATION.lat, lng: DEFAULT_CUSTOMER_LOCATION.lng, area: DEFAULT_CUSTOMER_LOCATION.area };
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMER_COORDINATES);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return { lat: DEFAULT_CUSTOMER_LOCATION.lat, lng: DEFAULT_CUSTOMER_LOCATION.lng, area: DEFAULT_CUSTOMER_LOCATION.area };
  }

  public saveCustomerLocation(coords: { lat: number; lng: number; area: string }) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.CUSTOMER_COORDINATES, JSON.stringify(coords));
    this.notify();
  }

  // --- Artisans & Proximity Search ---
  public getArtisans(options?: {
    lat?: number;
    lng?: number;
    radiusKm?: number;
    tradeId?: string;
    verifiedOnly?: boolean;
    availableOnly?: boolean;
    minRating?: number;
    searchQuery?: string;
    sortBy?: 'nearest' | 'rating' | 'jobs';
  }): ArtisanProfile[] {
    const userLocation = options?.lat && options?.lng 
      ? { lat: options.lat, lng: options.lng }
      : this.getSavedCustomerLocation();

    let list = this.artisans.map((art) => {
      const distance = calculateDistanceKm(
        userLocation.lat,
        userLocation.lng,
        art.location.lat,
        art.location.lng
      );
      return {
        ...art,
        distanceKm: distance
      };
    });

    if (options?.tradeId && options.tradeId !== 'all') {
      list = list.filter((a) => a.tradeId === options.tradeId || a.trade.slug === options.tradeId);
    }

    if (options?.verifiedOnly) {
      list = list.filter((a) => a.verificationStatus === 'verified');
    }

    if (options?.availableOnly) {
      list = list.filter((a) => a.availabilityStatus === 'available_today' || a.availabilityStatus === 'available_now');
    }

    if (options?.minRating) {
      list = list.filter((a) => a.ratingAverage >= options.minRating!);
    }

    if (options?.radiusKm) {
      list = list.filter((a) => (a.distanceKm || 0) <= options.radiusKm!);
    }

    if (options?.searchQuery && options.searchQuery.trim()) {
      const q = options.searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.user.fullName.toLowerCase().includes(q) ||
          a.headlineTitle.toLowerCase().includes(q) ||
          a.trade.name.toLowerCase().includes(q) ||
          a.bio.toLowerCase().includes(q) ||
          a.location.area.toLowerCase().includes(q) ||
          a.services.some((s) => s.serviceName.toLowerCase().includes(q))
      );
    }

    const sort = options?.sortBy || 'nearest';
    if (sort === 'nearest') {
      list.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    } else if (sort === 'rating') {
      list.sort((a, b) => b.ratingAverage - a.ratingAverage);
    } else if (sort === 'jobs') {
      list.sort((a, b) => b.completedJobs - a.completedJobs);
    }

    return list;
  }

  public getArtisanById(id: string): ArtisanProfile | undefined {
    const list = this.getArtisans();
    return list.find((a) => a.id === id || a.userId === id);
  }

  public getTrades(): Trade[] {
    return this.trades;
  }

  // --- Artisan Onboarding & Updates ---
  public createArtisanProfile(profile: Partial<ArtisanProfile>): ArtisanProfile {
    const currentUser = this.getCurrentUser() || this.users[0];
    const trade = this.trades.find((t) => t.id === profile.tradeId) || this.trades[0];

    const newArtisan: ArtisanProfile = {
      id: `art_${Date.now()}`,
      userId: currentUser.id,
      tradeId: trade.id,
      headlineTitle: profile.headlineTitle || `${trade.name} Specialist`,
      bio: profile.bio || 'Skilled professional dedicated to top craftsmanship.',
      experienceYears: profile.experienceYears || 3,
      location: profile.location || {
        lat: 6.4474,
        lng: 3.4842,
        address: 'Lekki Phase 1',
        state: 'Lagos',
        city: 'Eti-Osa',
        area: 'Lekki Phase 1'
      },
      serviceRadiusKm: profile.serviceRadiusKm || 20,
      availabilityStatus: profile.availabilityStatus || 'available_today',
      verificationStatus: profile.verificationStatus || 'pending',
      verificationProvider: profile.verificationProvider || 'dev_mock',
      ratingAverage: 5.0,
      reviewCount: 0,
      completedJobs: 0,
      hourlyRate: profile.hourlyRate || 5000,
      baseFee: profile.baseFee || 10000,
      responseTimeMinutes: 20,
      badges: ['phone_verified'],
      user: currentUser,
      trade,
      services: profile.services || [],
      portfolio: profile.portfolio || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.artisans.unshift(newArtisan);
    // Update user role to artisan
    const userIdx = this.users.findIndex((u) => u.id === currentUser.id);
    if (userIdx >= 0) {
      this.users[userIdx].role = 'artisan';
    }
    this.persistAll();
    return newArtisan;
  }

  public updateArtisanVerification(artisanId: string, status: VerificationStatus, provider: 'didit' | 'dev_mock' = 'didit') {
    const artisan = this.artisans.find((a) => a.id === artisanId || a.userId === artisanId);
    if (artisan) {
      artisan.verificationStatus = status;
      artisan.verificationProvider = provider;
      if (status === 'verified') {
        artisan.verificationCompletedAt = new Date().toISOString();
        if (!artisan.badges.includes('identity_verified')) {
          artisan.badges.push('identity_verified');
        }
      }
      this.persistAll();
    }
  }

  // --- Jobs Management ---
  public getJobs(forUserRole?: UserRole): Job[] {
    const curUser = this.getCurrentUser();
    if (!forUserRole) return this.jobs;
    if (!curUser) return [];

    if (forUserRole === 'customer') {
      return this.jobs.filter((j) => j.customerId === curUser.id);
    } else if (forUserRole === 'artisan') {
      const art = this.artisans.find((a) => a.userId === curUser.id);
      return this.jobs.filter((j) => (art ? j.artisanId === art.id : false));
    }
    return this.jobs;
  }

  public getJobById(jobId: string): Job | undefined {
    return this.jobs.find((j) => j.id === jobId || j.jobCode === jobId);
  }

  public createJob(jobData: {
    artisanId: string;
    tradeId: string;
    title: string;
    description: string;
    budgetMin: number;
    budgetMax: number;
    scheduledDate: string;
    preferredTimeWindow?: string;
    address: string;
    area: string;
    images?: string[];
  }): Job {
    const curUser = this.getCurrentUser() || this.users[0];
    const artisan = this.getArtisanById(jobData.artisanId) || this.artisans[0];
    const trade = this.trades.find((t) => t.id === jobData.tradeId) || artisan.trade;

    const escrowDeposit = Math.round(jobData.budgetMin * 0.7);

    const newJob: Job = {
      id: `job_${Date.now()}`,
      jobCode: `HN-${Math.floor(10000 + Math.random() * 90000)}`,
      customerId: curUser.id,
      artisanId: artisan.id,
      tradeId: trade.id,
      title: jobData.title,
      description: jobData.description,
      budgetMin: jobData.budgetMin,
      budgetMax: jobData.budgetMax,
      escrowAmount: escrowDeposit,
      escrowStatus: 'held_in_escrow',
      releaseOtp: `${Math.floor(1000 + Math.random() * 9000)}`,
      location: {
        address: jobData.address,
        area: jobData.area,
        state: 'Lagos',
        lat: 6.4474,
        lng: 3.4842
      },
      scheduledDate: jobData.scheduledDate,
      preferredTimeWindow: jobData.preferredTimeWindow || 'Morning (09:00 AM - 12:00 PM)',
      status: 'pending',
      images: jobData.images || [],
      customer: curUser,
      artisan,
      trade,
      milestones: [
        {
          id: `ms_${Date.now()}_1`,
          stepNumber: 1,
          title: 'Request Sent & Deposit Funded',
          description: `₦${escrowDeposit.toLocaleString()} safely held in callOga Escrow`,
          timestamp: 'Just now',
          status: 'completed'
        },
        {
          id: `ms_${Date.now()}_2`,
          stepNumber: 2,
          title: 'Artisan Review',
          description: `${artisan.user.fullName} is reviewing your job parameters`,
          status: 'current'
        },
        {
          id: `ms_${Date.now()}_3`,
          stepNumber: 3,
          title: 'Scheduled & En Route',
          description: 'Artisan dispatched with required tools',
          status: 'pending'
        },
        {
          id: `ms_${Date.now()}_4`,
          stepNumber: 4,
          title: 'Work Started & Inspection',
          description: 'Physical assessment & execution',
          status: 'pending'
        },
        {
          id: `ms_${Date.now()}_5`,
          stepNumber: 5,
          title: 'Work Completed & Review Photos',
          description: 'Artisan uploads inspection shots for verification',
          status: 'pending'
        },
        {
          id: `ms_${Date.now()}_6`,
          stepNumber: 6,
          title: 'Release Payment & Review Artisan',
          description: 'Funds released via secure OTP after you inspect craftsmanship',
          status: 'pending'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.jobs.unshift(newJob);

    // Notify artisan
    this.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: artisan.user.id,
      type: 'job_request',
      title: 'New Job Request Received',
      message: `${curUser.fullName} requested ${trade.name} service: "${newJob.title}".`,
      data: { jobId: newJob.id },
      createdAt: new Date().toISOString()
    });

    this.persistAll();
    return newJob;
  }

  public updateJobStatus(jobId: string, newStatus: JobStatus) {
    const job = this.jobs.find((j) => j.id === jobId);
    if (!job) return;

    job.status = newStatus;
    job.updatedAt = new Date().toISOString();

    if (newStatus === 'accepted') {
      job.milestones[1].status = 'completed';
      job.milestones[1].timestamp = 'Just now';
      job.milestones[2].status = 'current';
    } else if (newStatus === 'in_progress') {
      job.milestones[2].status = 'completed';
      job.milestones[3].status = 'current';
      job.currentEtaMinutes = 15;
    } else if (newStatus === 'completed') {
      job.milestones.forEach((m) => (m.status = 'completed'));
      job.escrowStatus = 'released';
      // Increment artisan completed jobs
      const artisan = this.artisans.find((a) => a.id === job.artisanId);
      if (artisan) {
        artisan.completedJobs += 1;
      }
    }

    this.persistAll();
  }

  public getJobRequestsForArtisan(artisanId: string): Job[] {
    return this.jobs.filter((j) => j.artisanId === artisanId && (j.status === 'pending' || j.status === 'scheduled'));
  }

  public artisanRespondToJobRequest(jobId: string, action: 'accept' | 'decline') {
    this.updateJobStatus(jobId, action === 'accept' ? 'accepted' : 'cancelled');
  }

  // --- Reviews ---
  public getReviewsForArtisan(artisanId: string): Review[] {
    return this.reviews.filter((r) => r.artisanId === artisanId);
  }

  public addReview(data: {
    jobId: string;
    artisanId: string;
    rating: number;
    comment: string;
    tags?: string[];
  }): Review {
    const curUser = this.getCurrentUser() || this.users[0];
    const job = this.jobs.find((j) => j.id === data.jobId);
    if (!job) throw new Error('Job not found.');
    if (job.status !== 'completed') {
      throw new Error('Reviews are only permitted for completed jobs.');
    }
    const alreadyReviewed = this.reviews.some((r) => r.jobId === data.jobId);
    if (alreadyReviewed) {
      throw new Error('You have already submitted a review for this completed job.');
    }

    const newRev: Review = {
      id: `rev_${Date.now()}`,
      jobId: data.jobId,
      customerId: curUser.id,
      artisanId: data.artisanId,
      rating: data.rating,
      comment: data.comment,
      customerName: curUser.fullName,
      customerArea: curUser.area,
      customerAvatar: curUser.avatarUrl,
      jobTitle: job.title,
      tags: data.tags || ['Verified Completion'],
      createdAt: new Date().toISOString()
    };

    this.reviews.unshift(newRev);

    // Recalculate artisan average rating
    const artisanReviews = this.reviews.filter((r) => r.artisanId === data.artisanId);
    const sum = artisanReviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = Math.round((sum / artisanReviews.length) * 10) / 10;
    const artisan = this.artisans.find((a) => a.id === data.artisanId);
    if (artisan) {
      artisan.ratingAverage = avg;
      artisan.reviewCount = artisanReviews.length;
    }

    this.persistAll();
    return newRev;
  }

  // --- Realtime Messaging ---
  public getConversations(): Conversation[] {
    const curUser = this.getCurrentUser();
    if (!curUser) return [];
    if (curUser.role === 'customer') {
      return this.conversations.filter((c) => c.customerId === curUser.id);
    } else if (curUser.role === 'artisan') {
      const art = this.artisans.find((a) => a.userId === curUser.id);
      return this.conversations.filter((c) => (art ? c.artisanId === art.id : false));
    }
    return this.conversations;
  }

  public getMessages(conversationId: string): Message[] {
    return this.messages.filter((m) => m.conversationId === conversationId);
  }

  public sendMessage(conversationId: string, text: string, attachmentUrl?: string): Message {
    const curUser = this.getCurrentUser() || this.users[0];
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId: curUser.id,
      senderRole: curUser.role,
      message: text,
      attachmentUrl,
      createdAt: new Date().toISOString()
    };

    this.messages.push(newMsg);

    const conv = this.conversations.find((c) => c.id === conversationId);
    if (conv) {
      conv.lastMessage = text;
      conv.lastMessageTime = 'Just now';
      conv.updatedAt = new Date().toISOString();
    }

    this.persistAll();
    return newMsg;
  }

  public getOrCreateConversation(artisanId: string, jobId?: string): Conversation {
    const curUser = this.getCurrentUser() || this.users[0];
    let conv = this.conversations.find(
      (c) => c.customerId === curUser.id && c.artisanId === artisanId
    );

    if (!conv) {
      const artisan = this.getArtisanById(artisanId) || this.artisans[0];
      conv = {
        id: `conv_${curUser.id}_${artisan.id}`,
        customerId: curUser.id,
        artisanId: artisan.id,
        jobId,
        lastMessage: 'Conversation opened',
        lastMessageTime: 'Just now',
        customer: curUser,
        artisan,
        unreadCountCustomer: 0,
        unreadCountArtisan: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.conversations.unshift(conv);
      this.persistAll();
    }

    return conv;
  }

  // --- Reports & Moderation ---
  public getReports(): Report[] {
    return this.reports;
  }

  public createReport(data: {
    reportedUserId: string;
    jobId?: string;
    reason: Report['reason'];
    description: string;
  }): Report {
    const curUser = this.getCurrentUser() || this.users[0];
    const reportedUser = this.users.find((u) => u.id === data.reportedUserId) || {
      id: data.reportedUserId,
      userId: data.reportedUserId,
      role: 'artisan',
      fullName: 'Reported User',
      phone: '',
      email: '',
      avatarUrl: '',
      state: 'Lagos',
      city: '',
      area: '',
      createdAt: '',
      updatedAt: ''
    };

    const newRep: Report = {
      id: `rep_${Date.now()}`,
      reporterId: curUser.id,
      reportedUserId: data.reportedUserId,
      jobId: data.jobId,
      reason: data.reason,
      description: data.description,
      status: 'pending',
      reporter: curUser,
      reportedUser,
      createdAt: new Date().toISOString()
    };

    this.reports.unshift(newRep);
    this.persistAll();
    return newRep;
  }

  public updateReportStatus(reportId: string, status: Report['status'], adminNotes?: string) {
    const rep = this.reports.find((r) => r.id === reportId);
    if (rep) {
      rep.status = status;
      if (adminNotes) rep.adminNotes = adminNotes;
      if (status === 'resolved' || status === 'dismissed') {
        rep.resolvedAt = new Date().toISOString();
      }
      this.persistAll();
    }
  }

  // --- Admin Moderation ---
  public getAllUsers(): UserProfile[] {
    return this.users;
  }

  public toggleUserSuspension(userId: string) {
    const usr = this.users.find((u) => u.id === userId);
    if (usr) {
      usr.isSuspended = !usr.isSuspended;
      this.persistAll();
    }
  }

  public getAdminMetrics() {
    const totalUsers = this.users.length;
    const totalArtisans = this.artisans.length;
    const verifiedArtisans = this.artisans.filter((a) => a.verificationStatus === 'verified').length;
    const pendingVerification = this.artisans.filter((a) => a.verificationStatus === 'pending').length;
    const activeJobs = this.jobs.filter((j) => j.status === 'in_progress' || j.status === 'scheduled').length;
    const completedJobs = this.jobs.filter((j) => j.status === 'completed').length;
    const totalReports = this.reports.length;
    const totalEscrowHeld = this.jobs.reduce((sum, j) => sum + (j.escrowStatus === 'held_in_escrow' ? j.escrowAmount : 0), 0);

    return {
      totalUsers,
      totalArtisans,
      verifiedArtisans,
      pendingVerification,
      activeJobs,
      completedJobs,
      totalReports,
      totalEscrowHeld
    };
  }

  // --- Notifications ---
  public getNotifications(): AppNotification[] {
    const curUser = this.getCurrentUser();
    if (!curUser) return [];
    return this.notifications.filter((n) => n.userId === curUser.id);
  }

  public markNotificationAsRead(id: string) {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.readAt = new Date().toISOString();
      this.persistAll();
    }
  }

  public switchUserRole(role: UserRole) {
    this.switchRole(role);
  }

  public registerArtisan(params: {
    fullName: string;
    email?: string;
    phone: string;
    tradeId: string;
    headlineTitle: string;
    bio: string;
    experienceYears: number;
    baseFee: number;
    area: string;
    address?: string;
    serviceRadiusKm?: number;
  }): ArtisanProfile {
    const newUserId = `user-${Date.now()}`;
    const newUser: UserProfile = {
      id: newUserId,
      userId: newUserId,
      role: 'artisan',
      fullName: params.fullName,
      phone: params.phone,
      email: params.email || `${params.fullName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      avatarUrl: `https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80`,
      state: 'Lagos',
      city: 'Lagos',
      area: params.area,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.users.push(newUser);

    const trade = this.trades.find((t) => t.id === params.tradeId) || this.trades[0];
    const newArtisanId = `artisan-${Date.now()}`;
    const newArtisan: ArtisanProfile = {
      id: newArtisanId,
      userId: newUserId,
      tradeId: trade.id,
      headlineTitle: params.headlineTitle,
      bio: params.bio,
      experienceYears: params.experienceYears,
      baseFee: params.baseFee,
      hourlyRate: Math.round(params.baseFee * 1.5),
      ratingAverage: 5.0,
      reviewCount: 0,
      completedJobs: 0,
      responseTimeMinutes: 10,
      verificationStatus: 'verified',
      verificationProvider: 'didit',
      serviceRadiusKm: params.serviceRadiusKm || 25,
      badges: ['identity_verified', 'phone_verified', 'trusted_master'],
      availabilityStatus: 'available_today',
      location: {
        lat: 6.4281,
        lng: 3.4219,
        area: params.area,
        address: params.address || `${params.area}, Lagos, Nigeria`,
        city: 'Lagos',
        state: 'Lagos'
      },
      user: newUser,
      trade: trade,
      portfolio: [],
      services: [
        {
          id: `srv-${Date.now()}-1`,
          artisanId: newArtisanId,
          serviceName: 'Initial Diagnostic Inspection & Assessment',
          description: 'Comprehensive physical diagnosis and work scope breakdown.',
          startingPrice: params.baseFee,
          pricingType: 'inspection_fee',
          createdAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.artisans.unshift(newArtisan);
    this.switchRole('artisan');
    this.persistAll();
    return newArtisan;
  }

  // --- Splash / Onboarding Flag ---
  public hasSeenOnboarding(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING_SEEN) === 'true';
  }

  public setSeenOnboarding(seen: boolean = true) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_SEEN, seen ? 'true' : 'false');
  }
}

export const storage = new StorageService();
