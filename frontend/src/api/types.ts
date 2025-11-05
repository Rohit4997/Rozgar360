/**
 * API Request and Response Types
 */

// ==================== AUTH ====================

export interface SendOTPReq {
  phone: string;
}

export interface SendOTPResp {
  success: boolean;
  message: string;
  expiresIn: number;
}

export interface VerifyOTPReq {
  phone: string;
  otp: string;
}

export interface VerifyOTPResp {
  success: boolean;
  isNewUser: boolean;
  accessToken: string;
  refreshToken: string;
  user: UserResp | null;
}

export interface RefreshTokenReq {
  refreshToken: string;
}

export interface RefreshTokenResp {
  success: boolean;
  accessToken: string;
  refreshToken: string;
}

export interface LogoutReq {
  refreshToken: string;
}

export interface LogoutResp {
  success: boolean;
  message: string;
}

// ==================== USER ====================

export interface UserResp {
  id: string;
  phone: string;
  email: string | null;
  name: string;
  profilePictureUrl: string | null;
  bio: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  isAvailable: boolean;
  skills: string[];
  experienceYears: number;
  labourType: string;
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompleteProfileReq {
  name: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  bio?: string;
  isAvailable: boolean;
  skills: string[];
  experienceYears: number;
  labourType: 'daily' | 'monthly' | 'partTime' | 'fullTime' | 'contract' | 'freelance';
  latitude?: number;
  longitude?: number;
}

export interface CompleteProfileResp {
  success: boolean;
  message: string;
  user: UserResp;
}

export interface GetProfileResp {
  success: boolean;
  user: UserResp;
}

export interface UpdateProfileReq {
  name?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  bio?: string;
  isAvailable?: boolean;
  skills?: string[];
  experienceYears?: number;
  labourType?: 'daily' | 'monthly' | 'partTime' | 'fullTime' | 'contract' | 'freelance';
  latitude?: number;
  longitude?: number;
}

export interface UpdateProfileResp {
  success: boolean;
  message: string;
  user: UserResp;
}

export interface ToggleAvailabilityReq {
  isAvailable: boolean;
}

export interface ToggleAvailabilityResp {
  success: boolean;
  message: string;
  id: string;
  isAvailable: boolean;
}

// ==================== LABOUR ====================

export interface LabourResp {
  id: string;
  phone: string;
  email: string | null;
  name: string;
  profilePictureUrl: string | null;
  bio: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  isAvailable: boolean;
  skills: string[];
  experienceYears: number;
  labourType: string;
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  distance?: number;
}

export interface SearchLaboursParams {
  search?: string;
  city?: string;
  skills?: string[];
  minExperience?: number;
  maxExperience?: number;
  labourType?: string;
  availableOnly?: boolean;
  minRating?: number;
  page?: number;
  limit?: number;
  sortBy?: 'rating' | 'experience' | 'distance';
}

export interface SearchLaboursResp {
  success: boolean;
  labours: LabourResp[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetLabourDetailsResp {
  success: boolean;
  labour: LabourResp;
}

export interface GetNearbyLaboursParams {
  latitude: number;
  longitude: number;
  radius?: number;
  limit?: number;
}

export interface GetNearbyLaboursResp {
  success: boolean;
  labours: LabourResp[];
}

// ==================== REVIEWS ====================

export interface ReviewResp {
  id: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: {
    id: string;
    name: string;
    profilePictureUrl: string | null;
  };
}

export interface AddReviewReq {
  labourId: string;
  rating: number;
  comment?: string;
}

export interface AddReviewResp {
  success: boolean;
  message: string;
  review: ReviewResp;
}

export interface GetReviewsParams {
  userId: string;
  page?: number;
  limit?: number;
}

export interface GetReviewsResp {
  success: boolean;
  reviews: ReviewResp[];
  averageRating: number;
  totalReviews: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DeleteReviewResp {
  success: boolean;
  message: string;
}

// ==================== CONTACTS ====================

export interface ContactResp {
  id: string;
  fromUserId: string;
  toUserId: string;
  type: 'call' | 'message';
  createdAt: string;
  fromUser: {
    id: string;
    name: string;
    phone: string;
    profilePictureUrl: string | null;
  };
  toUser: {
    id: string;
    name: string;
    phone: string;
    profilePictureUrl: string | null;
  };
}

export interface TrackContactReq {
  labourId: string;
  contactType: 'call' | 'message';
}

export interface TrackContactResp {
  success: boolean;
  message: string;
  contact: ContactResp;
}

export interface GetContactHistoryParams {
  type?: 'sent' | 'received';
  page?: number;
  limit?: number;
}

export interface GetContactHistoryResp {
  success: boolean;
  contacts: ContactResp[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

