export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  profilePicture?: string;
  bio?: string;
  isAvailable: boolean;
  skills: string[];
  experience: number;
  labourType: string;
  rating?: number;
  totalReviews?: number;
  latitude?: number;
  longitude?: number;
}

export interface Labour extends User {
  distance?: number;
}

export type LabourType = 
  | 'daily'
  | 'monthly'
  | 'partTime'
  | 'fullTime'
  | 'contract'
  | 'freelance';

export type Skill = 
  | 'farming'
  | 'carWashing'
  | 'carDriving'
  | 'makeup'
  | 'painting'
  | 'plumbing'
  | 'electrical'
  | 'carpentry'
  | 'cooking'
  | 'cleaning'
  | 'gardening'
  | 'construction'
  | 'welding'
  | 'tailoring'
  | 'beautician'
  | 'other';

export interface FilterOptions {
  skills: string[];
  experienceRange: {
    min: number;
    max: number;
  };
  labourTypes: string[];
  city?: string;
  distance: number;
  availableOnly: boolean;
  minRating: number;
  sortBy?: 'rating' | 'experience' | 'distance';
}

export interface AppSettings {
  language: string;
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading';

export interface OnboardingStatus {
  hasSeenWelcome: boolean;
  hasCompletedProfile: boolean;
}

