import { create } from 'zustand';
import { Labour, FilterOptions } from '../types';
import { getLabours, getLaboursById, getLaboursNearby } from '../api';
import { LabourResp } from '../api/types';
import { calculateDistance } from '../utils/distance';

// Helper to convert API LabourResp to app Labour type
const mapLabourRespToLabour = (labourResp: LabourResp): Labour => ({
  id: labourResp.id,
  name: labourResp.name,
  email: labourResp.email || '',
  phone: labourResp.phone,
  address: labourResp.address,
  city: labourResp.city,
  state: labourResp.state,
  pincode: labourResp.pincode,
  profilePicture: labourResp.profilePictureUrl || undefined,
  bio: labourResp.bio || undefined,
  isAvailable: labourResp.isAvailable,
  skills: labourResp.skills,
  experience: labourResp.experienceYears,
  labourType: labourResp.labourType as any,
  rating: labourResp.rating,
  totalReviews: labourResp.totalReviews,
  latitude: labourResp.latitude || undefined,
  longitude: labourResp.longitude || undefined,
  distance: labourResp.distance,
});

interface LabourState {
  labours: Labour[];
  filteredLabours: Labour[];
  filters: FilterOptions;
  searchQuery: string;
  loading: boolean;
  error: string | null;
  userLocation: { latitude: number; longitude: number } | null;
  
  // Actions
  setLabours: (labours: Labour[]) => void;
  setUserLocation: (latitude: number, longitude: number) => void;
  fetchLabours: (filters?: Partial<FilterOptions>) => Promise<void>;
  searchLabours: (filters: Partial<FilterOptions>) => Promise<void>;
  getLabourById: (id: string) => Promise<Labour | null>;
  getNearbyLabours: (latitude: number, longitude: number, radius?: number) => Promise<void>;
  setFilters: (filters: Partial<FilterOptions>) => void;
  setSearchQuery: (query: string) => void;
  applyFilters: () => void;
  resetFilters: () => void;
  clearFilters: () => void;
  hasActiveFilters: () => boolean;
}

const defaultFilters: FilterOptions = {
  skills: [],
  experienceRange: { min: 0, max: 50 },
  labourTypes: [],
  city: undefined,
  distance: 50,
  availableOnly: false,
  minRating: 0,
  sortBy: 'rating',
};

// Hardcoded labour data
const HARDCODED_LABOURS: Labour[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    phone: '9876543210',
    address: 'Sector 12, Main Road',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pincode: '452001',
    bio: 'Experienced farmer with 10 years of expertise in crop cultivation and farming equipment.',
    isAvailable: true,
    skills: ['farming', 'gardening'],
    experience: 10,
    labourType: 'daily',
    rating: 4.5,
    totalReviews: 25,
    latitude: 22.7196,
    longitude: 75.8577,
  },
  {
    id: '2',
    name: 'Suresh Patel',
    email: 'suresh@example.com',
    phone: '8765432109',
    address: 'Vijay Nagar, Phase 2',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pincode: '452010',
    bio: 'Professional car washing and detailing expert. Quality service guaranteed.',
    isAvailable: true,
    skills: ['carWashing', 'carDriving'],
    experience: 5,
    labourType: 'partTime',
    rating: 4.2,
    totalReviews: 18,
    latitude: 22.7532,
    longitude: 75.8937,
  },
  {
    id: '3',
    name: 'Amit Singh',
    email: 'amit@example.com',
    phone: '7654321098',
    address: 'MG Road, Near City Mall',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pincode: '452001',
    bio: 'Licensed driver with 8 years of experience. Safe and reliable.',
    isAvailable: true,
    skills: ['carDriving'],
    experience: 8,
    labourType: 'fullTime',
    rating: 4.8,
    totalReviews: 42,
    latitude: 22.7279,
    longitude: 75.8573,
  },
  {
    id: '4',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '9988776655',
    address: 'Sapna Sangeeta Road',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pincode: '452001',
    bio: 'Professional makeup artist specializing in bridal and party makeup.',
    isAvailable: false,
    skills: ['makeup', 'beautician'],
    experience: 6,
    labourType: 'freelance',
    rating: 4.9,
    totalReviews: 56,
    latitude: 22.7240,
    longitude: 75.8694,
  },
  {
    id: '5',
    name: 'Ramesh Verma',
    email: 'ramesh@example.com',
    phone: '8877665544',
    address: 'Palasia Square',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pincode: '452001',
    bio: 'Skilled painter with experience in interior and exterior painting.',
    isAvailable: true,
    skills: ['painting'],
    experience: 12,
    labourType: 'contract',
    rating: 4.3,
    totalReviews: 31,
    latitude: 22.7206,
    longitude: 75.8719,
  },
  {
    id: '6',
    name: 'Mohan Lal',
    email: 'mohan@example.com',
    phone: '7766554433',
    address: 'Rau, Industrial Area',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pincode: '453331',
    bio: 'Expert plumber for residential and commercial properties.',
    isAvailable: true,
    skills: ['plumbing'],
    experience: 15,
    labourType: 'daily',
    rating: 4.6,
    totalReviews: 38,
    latitude: 22.6493,
    longitude: 75.8142,
  },
  {
    id: '7',
    name: 'Santosh Kumar',
    email: 'santosh@example.com',
    phone: '9955443322',
    address: 'Bhanwarkuan',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pincode: '452014',
    bio: 'Certified electrician with expertise in home and office electrical work.',
    isAvailable: true,
    skills: ['electrical'],
    experience: 9,
    labourType: 'monthly',
    rating: 4.4,
    totalReviews: 27,
    latitude: 22.6843,
    longitude: 75.8728,
  },
  {
    id: '8',
    name: 'Vikas Yadav',
    email: 'vikas@example.com',
    phone: '8844332211',
    address: 'Aerodrome Road',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pincode: '452005',
    bio: 'Professional carpenter specializing in custom furniture and woodwork.',
    isAvailable: true,
    skills: ['carpentry'],
    experience: 7,
    labourType: 'contract',
    rating: 4.7,
    totalReviews: 33,
    latitude: 22.7477,
    longitude: 75.9040,
  },
  {
    id: '9',
    name: 'Geeta Devi',
    email: 'geeta@example.com',
    phone: '7733221100',
    address: 'Tilak Nagar',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pincode: '452018',
    bio: 'Experienced cook specializing in traditional Indian cuisine.',
    isAvailable: false,
    skills: ['cooking'],
    experience: 11,
    labourType: 'monthly',
    rating: 4.8,
    totalReviews: 45,
    latitude: 22.6885,
    longitude: 75.8576,
  },
  {
    id: '10',
    name: 'Sunita Bai',
    email: 'sunita@example.com',
    phone: '9966554477',
    address: 'Juni Indore',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pincode: '452002',
    bio: 'Professional house cleaning services with attention to detail.',
    isAvailable: true,
    skills: ['cleaning'],
    experience: 4,
    labourType: 'partTime',
    rating: 4.1,
    totalReviews: 22,
    latitude: 22.7151,
    longitude: 75.8653,
  },
];

export const useLabourStore = create<LabourState>((set, get) => ({
  labours: [],
  filteredLabours: [],
  filters: defaultFilters,
  searchQuery: '',
  loading: false,
  error: null,
  userLocation: null,

  setLabours: (labours) => set({ labours, filteredLabours: labours }),
  
  setUserLocation: (latitude: number, longitude: number) => set({ userLocation: { latitude, longitude } }),
  
  fetchLabours: async (filters?: Partial<FilterOptions>) => {
    try {
      set({ loading: true, error: null });
      
      const currentFilters = { ...get().filters, ...filters };
      const params: any = {
        availableOnly: currentFilters.availableOnly,
        page: 1,
        limit: 50,
      };
      
      if (currentFilters.city) {
        params.city = currentFilters.city;
      }
      if (currentFilters.skills.length > 0) {
        params.skills = currentFilters.skills;
      }
      if (currentFilters.experienceRange.min > 0) {
        params.minExperience = currentFilters.experienceRange.min;
      }
      if (currentFilters.experienceRange.max < 50) {
        params.maxExperience = currentFilters.experienceRange.max;
      }
      if (currentFilters.labourTypes.length > 0) {
        params.labourType = currentFilters.labourTypes[0]; // API expects single value
      }
      if (currentFilters.minRating > 0) {
        params.minRating = currentFilters.minRating;
      }
      if (currentFilters.sortBy) {
        params.sortBy = currentFilters.sortBy;
      }
      
      const response = await getLabours(params);
      
      if (response.success) {
        const labours = response.labours.map(mapLabourRespToLabour);
        set({ labours, filteredLabours: labours, loading: false });
      } else {
        set({ loading: false, error: 'Failed to fetch labours' });
      }
    } catch (error: any) {
      set({ loading: false, error: error.message || 'Failed to fetch labours' });
    }
  },
  
  searchLabours: async (filters: Partial<FilterOptions>) => {
    try {
      set({ loading: true, error: null });
      get().setFilters(filters);
      
      // Use fetchLabours which handles distance filtering
      await get().fetchLabours(filters);
    } catch (error: any) {
      set({ loading: false, error: error.message || 'Failed to search labours' });
    }
  },
  
  getLabourById: async (id: string) => {
    try {
      const response = await getLaboursById({ id });
      
      if (response.success && response.labour) {
        return mapLabourRespToLabour(response.labour);
      }
      
      return null;
    } catch (error: any) {
      console.error('Error fetching labour:', error);
      return null;
    }
  },
  
  getNearbyLabours: async (latitude: number, longitude: number, radius: number = 10) => {
    try {
      set({ loading: true, error: null });
      const response = await getLaboursNearby({ latitude, longitude, radius, limit: 20 });
      
      if (response.success) {
        const labours = response.labours.map(mapLabourRespToLabour);
        set({ labours, filteredLabours: labours, loading: false });
      } else {
        set({ loading: false, error: 'Failed to fetch nearby labours' });
      }
    } catch (error: any) {
      set({ loading: false, error: error.message || 'Failed to fetch nearby labours' });
    }
  },
  
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters },
  })),
  
  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().applyFilters();
  },
  
  applyFilters: () => {
    const { filteredLabours, filters, searchQuery } = get();
    
    let filtered = [...filteredLabours];
    
    // Search query filter (client-side for already fetched data)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (labour) =>
          labour.name.toLowerCase().includes(query) ||
          labour.skills.some((skill) => skill.toLowerCase().includes(query)) ||
          labour.city.toLowerCase().includes(query)
      );
    }
    
    set({ filteredLabours: filtered });
  },
  
  resetFilters: () => {
    set({ filters: defaultFilters, searchQuery: '' });
    get().fetchLabours();
  },
  
  clearFilters: () => {
    set({ filters: defaultFilters });
  },
  
  hasActiveFilters: () => {
    const filters = get().filters;
    return (
      filters.skills.length > 0 ||
      filters.experienceRange.min > 0 ||
      filters.experienceRange.max < 50 ||
      filters.labourTypes.length > 0 ||
      filters.city !== undefined ||
      filters.distance < 50 ||
      filters.availableOnly ||
      filters.minRating > 0 ||
      filters.sortBy !== 'rating'
    );
  },
}));

