import { create } from 'zustand';
import { Labour, FilterOptions } from '../types';

interface LabourState {
  labours: Labour[];
  filteredLabours: Labour[];
  filters: FilterOptions;
  searchQuery: string;
  
  // Actions
  setLabours: (labours: Labour[]) => void;
  setFilters: (filters: Partial<FilterOptions>) => void;
  setSearchQuery: (query: string) => void;
  applyFilters: () => void;
  resetFilters: () => void;
  getLabourById: (id: string) => Labour | undefined;
}

const defaultFilters: FilterOptions = {
  skills: [],
  experienceRange: { min: 0, max: 50 },
  labourTypes: [],
  distance: 50,
  availableOnly: false,
  minRating: 0,
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
  labours: HARDCODED_LABOURS,
  filteredLabours: HARDCODED_LABOURS,
  filters: defaultFilters,
  searchQuery: '',

  setLabours: (labours) => set({ labours, filteredLabours: labours }),
  
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters },
  })),
  
  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().applyFilters();
  },
  
  applyFilters: () => {
    const { labours, filters, searchQuery } = get();
    
    let filtered = [...labours];
    
    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (labour) =>
          labour.name.toLowerCase().includes(query) ||
          labour.skills.some((skill) => skill.toLowerCase().includes(query)) ||
          labour.city.toLowerCase().includes(query)
      );
    }
    
    // Skills filter
    if (filters.skills.length > 0) {
      filtered = filtered.filter((labour) =>
        filters.skills.some((skill) => labour.skills.includes(skill))
      );
    }
    
    // Experience filter
    filtered = filtered.filter(
      (labour) =>
        labour.experience >= filters.experienceRange.min &&
        labour.experience <= filters.experienceRange.max
    );
    
    // Labour type filter
    if (filters.labourTypes.length > 0) {
      filtered = filtered.filter((labour) =>
        filters.labourTypes.includes(labour.labourType)
      );
    }
    
    // Available only filter
    if (filters.availableOnly) {
      filtered = filtered.filter((labour) => labour.isAvailable);
    }
    
    // Rating filter
    if (filters.minRating > 0) {
      filtered = filtered.filter(
        (labour) => (labour.rating || 0) >= filters.minRating
      );
    }
    
    set({ filteredLabours: filtered });
  },
  
  resetFilters: () => {
    set({ filters: defaultFilters, searchQuery: '' });
    get().applyFilters();
  },
  
  getLabourById: (id) => {
    return get().labours.find((labour) => labour.id === id);
  },
}));

