export type UserRole = 'customer' | 'artisan' | 'admin';

export interface UserProfile {
  id: string;
  userId: string;
  role: UserRole;
  fullName: string;
  phone: string;
  email: string;
  avatarUrl: string;
  state: string;
  city: string;
  area: string;
  isSuspended?: boolean;
  password?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Trade {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  description: string;
  isActive: boolean;
  averageRateHour?: number;
  popularServices?: string[];
  createdAt?: string;
}

export interface ArtisanService {
  id: string;
  artisanId: string;
  serviceName: string;
  description: string;
  startingPrice: number;
  pricingType: 'fixed' | 'starting_from' | 'inspection_fee' | 'hourly';
  createdAt: string;
}

export interface ArtisanPortfolio {
  id: string;
  artisanId: string;
  imageUrl: string;
  title: string;
  description: string;
  category: string;
  locationTag: string;
  timeAgo: string;
  createdAt: string;
}

export type AvailabilityStatus = 'available_today' | 'available_now' | 'tomorrow' | 'busy' | 'offline';
export type VerificationStatus = 'not_started' | 'pending' | 'verified' | 'failed' | 'manual_review';

export interface GeoLocation {
  lat: number;
  lng: number;
  address: string;
  state: string;
  city: string;
  area: string;
}

export interface ArtisanProfile {
  id: string;
  userId: string;
  tradeId: string;
  headlineTitle: string;
  bio: string;
  experienceYears: number;
  location: GeoLocation;
  serviceRadiusKm: number;
  availabilityStatus: AvailabilityStatus;
  verificationStatus: VerificationStatus;
  verificationProvider: 'didit' | 'dev_mock' | 'manual';
  verificationSessionId?: string;
  verificationCompletedAt?: string;
  ratingAverage: number;
  reviewCount: number;
  completedJobs: number;
  hourlyRate: number;
  baseFee: number;
  responseTimeMinutes: number;
  education?: string;
  equipmentHighlight?: string;
  badges: ('identity_verified' | 'phone_verified' | 'trusted_master' | 'top_rated')[];
  user: UserProfile;
  trade: Trade;
  services: ArtisanService[];
  portfolio: ArtisanPortfolio[];
  distanceKm?: number;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationRecord {
  id: string;
  artisanId: string;
  provider: 'didit' | 'dev_mock';
  sessionId: string;
  status: VerificationStatus;
  identityVerified: boolean;
  selfieVerified: boolean;
  livenessVerified: boolean;
  ninMasked?: string;
  bvnMasked?: string;
  livenessScore?: number;
  providerReference?: string;
  failureReason?: string;
  documentType?: 'national_id' | 'voters_card' | 'drivers_license' | 'international_passport';
  createdAt: string;
  updatedAt: string;
}

export type JobStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export type EscrowStatus = 'unfunded' | 'held_in_escrow' | 'released' | 'refunded';

export interface JobMilestone {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  timestamp?: string;
  status: 'completed' | 'current' | 'pending';
}

export interface Job {
  id: string;
  jobCode: string;
  customerId: string;
  artisanId: string;
  tradeId: string;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  escrowAmount: number;
  escrowStatus: EscrowStatus;
  releaseOtp?: string;
  location: {
    address: string;
    area: string;
    state: string;
    lat: number;
    lng: number;
  };
  scheduledDate: string;
  preferredTimeWindow?: string;
  status: JobStatus;
  images: string[];
  workCompletedPhotos?: string[];
  customer: UserProfile;
  artisan: ArtisanProfile;
  trade: Trade;
  milestones: JobMilestone[];
  currentEtaMinutes?: number;
  artisanCurrentLocation?: {
    lat: number;
    lng: number;
    locationName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  jobId: string;
  customerId: string;
  artisanId: string;
  rating: number;
  comment: string;
  customerName: string;
  customerArea: string;
  customerAvatar?: string;
  jobTitle: string;
  tags?: string[];
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: UserRole;
  message: string;
  attachmentUrl?: string;
  readAt?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  customerId: string;
  artisanId: string;
  jobId?: string;
  lastMessage: string;
  lastMessageTime: string;
  customer: UserProfile;
  artisan: ArtisanProfile;
  unreadCountCustomer: number;
  unreadCountArtisan: number;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId: string;
  jobId?: string;
  reason: 'inappropriate_behaviour' | 'fraud' | 'harassment' | 'unsafe_conduct' | 'fake_profile' | 'payment_issue' | 'other';
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  reporter: UserProfile;
  reportedUser: UserProfile;
  adminNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: 'job_request' | 'job_accepted' | 'job_declined' | 'job_status' | 'message' | 'verification' | 'review' | 'escrow';
  title: string;
  message: string;
  data?: Record<string, any>;
  readAt?: string;
  createdAt: string;
}
