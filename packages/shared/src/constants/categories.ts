import type { ListingType } from '../types';

// ─── Listing Types ─────────────────────────────────────────────────────────────

export const LISTING_TYPES: readonly ListingType[] = [
  'service',
  'goods',
  'rental',
  'experience',
  'fundraising',
  'transportation',
  'digital_services',
  'gated_content',
] as const;

export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  service: 'Service',
  goods: 'Goods',
  rental: 'Rental',
  experience: 'Experience',
  fundraising: 'Fundraising',
  transportation: 'Transportation',
  digital_services: 'Digital Services',
  gated_content: 'Gated Content',
};

// ─── Categories & Subcategories ────────────────────────────────────────────────

export interface CategoryDefinition {
  label: string;
  value: string;
  subcategories: { label: string; value: string }[];
}

export const SERVICE_CATEGORIES: CategoryDefinition[] = [
  {
    label: 'Plumbing',
    value: 'plumbing',
    subcategories: [
      { label: 'Leak Repair', value: 'leak_repair' },
      { label: 'Drain Cleaning', value: 'drain_cleaning' },
      { label: 'Water Heater', value: 'water_heater' },
      { label: 'Pipe Installation', value: 'pipe_installation' },
    ],
  },
  {
    label: 'Electrical',
    value: 'electrical',
    subcategories: [
      { label: 'Wiring', value: 'wiring' },
      { label: 'Lighting', value: 'lighting' },
      { label: 'Panel Upgrade', value: 'panel_upgrade' },
      { label: 'Outlet Installation', value: 'outlet_installation' },
    ],
  },
  {
    label: 'Handyman',
    value: 'handyman',
    subcategories: [
      { label: 'Repairs', value: 'repairs' },
      { label: 'Assembly', value: 'assembly' },
      { label: 'Mounting', value: 'mounting' },
    ],
  },
  {
    label: 'Cleaning',
    value: 'cleaning',
    subcategories: [
      { label: 'Regular Cleaning', value: 'regular_cleaning' },
      { label: 'Deep Cleaning', value: 'deep_cleaning' },
      { label: 'Move-in/out', value: 'move_in_out' },
      { label: 'Office Cleaning', value: 'office_cleaning' },
    ],
  },
  {
    label: 'Carpentry',
    value: 'carpentry',
    subcategories: [
      { label: 'Custom Furniture', value: 'custom_furniture' },
      { label: 'Cabinet Making', value: 'cabinet_making' },
      { label: 'Door Installation', value: 'door_installation' },
    ],
  },
  {
    label: 'HVAC',
    value: 'hvac',
    subcategories: [
      { label: 'AC Installation', value: 'ac_installation' },
      { label: 'Heating Repair', value: 'heating_repair' },
      { label: 'Ventilation', value: 'ventilation' },
    ],
  },
  {
    label: 'Painting',
    value: 'painting',
    subcategories: [
      { label: 'Interior', value: 'interior' },
      { label: 'Exterior', value: 'exterior' },
      { label: 'Commercial', value: 'commercial' },
    ],
  },
  {
    label: 'Landscaping',
    value: 'landscaping',
    subcategories: [
      { label: 'Lawn Care', value: 'lawn_care' },
      { label: 'Garden Design', value: 'garden_design' },
      { label: 'Tree Service', value: 'tree_service' },
    ],
  },
  {
    label: 'Tutoring',
    value: 'tutoring',
    subcategories: [
      { label: 'Math', value: 'math' },
      { label: 'Science', value: 'science' },
      { label: 'Languages', value: 'languages' },
      { label: 'Music', value: 'music' },
    ],
  },
  {
    label: 'Beauty',
    value: 'beauty',
    subcategories: [
      { label: 'Hair', value: 'hair' },
      { label: 'Nails', value: 'nails' },
      { label: 'Makeup', value: 'makeup' },
      { label: 'Skincare', value: 'skincare' },
    ],
  },
  {
    label: 'Fitness',
    value: 'fitness',
    subcategories: [
      { label: 'Personal Training', value: 'personal_training' },
      { label: 'Yoga', value: 'yoga' },
      { label: 'Group Classes', value: 'group_classes' },
    ],
  },
  {
    label: 'Pet Care',
    value: 'pet_care',
    subcategories: [
      { label: 'Dog Walking', value: 'dog_walking' },
      { label: 'Pet Sitting', value: 'pet_sitting' },
      { label: 'Grooming', value: 'grooming' },
    ],
  },
  {
    label: 'Photography',
    value: 'photography',
    subcategories: [
      { label: 'Portrait', value: 'portrait' },
      { label: 'Event', value: 'event' },
      { label: 'Product', value: 'product' },
      { label: 'Real Estate', value: 'real_estate' },
    ],
  },
  {
    label: 'Web Development',
    value: 'web_development',
    subcategories: [
      { label: 'Frontend', value: 'frontend' },
      { label: 'Backend', value: 'backend' },
      { label: 'Full Stack', value: 'full_stack' },
      { label: 'WordPress', value: 'wordpress' },
    ],
  },
  {
    label: 'Design',
    value: 'design',
    subcategories: [
      { label: 'Graphic Design', value: 'graphic_design' },
      { label: 'UI/UX', value: 'ui_ux' },
      { label: 'Logo Design', value: 'logo_design' },
      { label: 'Branding', value: 'branding' },
    ],
  },
  {
    label: 'Writing',
    value: 'writing',
    subcategories: [
      { label: 'Content Writing', value: 'content_writing' },
      { label: 'Copywriting', value: 'copywriting' },
      { label: 'Technical Writing', value: 'technical_writing' },
      { label: 'Translation', value: 'translation' },
    ],
  },
  {
    label: 'Social Media',
    value: 'social_media',
    subcategories: [
      { label: 'Management', value: 'management' },
      { label: 'Content Creation', value: 'content_creation' },
      { label: 'Advertising', value: 'advertising' },
    ],
  },
  {
    label: 'Consulting',
    value: 'consulting',
    subcategories: [
      { label: 'Business', value: 'business' },
      { label: 'Marketing', value: 'marketing' },
      { label: 'Financial', value: 'financial' },
      { label: 'Legal', value: 'legal' },
    ],
  },
];

export const GOODS_CATEGORIES: CategoryDefinition[] = [
  { label: 'Electronics', value: 'electronics', subcategories: [{ label: 'Phones', value: 'phones' }, { label: 'Laptops', value: 'laptops' }, { label: 'Cameras', value: 'cameras' }, { label: 'Audio', value: 'audio' }] },
  { label: 'Clothing', value: 'clothing', subcategories: [{ label: 'Men', value: 'men' }, { label: 'Women', value: 'women' }, { label: 'Kids', value: 'kids' }, { label: 'Shoes', value: 'shoes' }] },
  { label: 'Furniture', value: 'furniture', subcategories: [{ label: 'Living Room', value: 'living_room' }, { label: 'Bedroom', value: 'bedroom' }, { label: 'Office', value: 'office' }, { label: 'Outdoor', value: 'outdoor' }] },
  { label: 'Books', value: 'books', subcategories: [{ label: 'Fiction', value: 'fiction' }, { label: 'Non-Fiction', value: 'non_fiction' }, { label: 'Academic', value: 'academic' }] },
  { label: 'Sports', value: 'sports', subcategories: [{ label: 'Equipment', value: 'equipment' }, { label: 'Clothing', value: 'clothing' }, { label: 'Accessories', value: 'accessories' }] },
];

export const RENTAL_CATEGORIES: CategoryDefinition[] = [
  { label: 'Cars', value: 'cars', subcategories: [{ label: 'Sedan', value: 'sedan' }, { label: 'SUV', value: 'suv' }, { label: 'Van', value: 'van' }, { label: 'Luxury', value: 'luxury' }] },
  { label: 'Homes', value: 'homes', subcategories: [{ label: 'Apartment', value: 'apartment' }, { label: 'House', value: 'house' }, { label: 'Studio', value: 'studio' }] },
  { label: 'Tools', value: 'tools', subcategories: [{ label: 'Power Tools', value: 'power_tools' }, { label: 'Hand Tools', value: 'hand_tools' }, { label: 'Garden Tools', value: 'garden_tools' }] },
  { label: 'Camera & Gear', value: 'camera_gear', subcategories: [{ label: 'Cameras', value: 'cameras' }, { label: 'Lenses', value: 'lenses' }, { label: 'Lighting', value: 'lighting' }] },
  { label: 'Event Spaces', value: 'event_spaces', subcategories: [{ label: 'Venues', value: 'venues' }, { label: 'Studios', value: 'studios' }, { label: 'Outdoor', value: 'outdoor' }] },
];

export const EXPERIENCE_CATEGORIES: CategoryDefinition[] = [
  { label: 'Tours', value: 'tours', subcategories: [{ label: 'Walking', value: 'walking' }, { label: 'Driving', value: 'driving' }, { label: 'Boat', value: 'boat' }] },
  { label: 'Workshops', value: 'workshops', subcategories: [{ label: 'Art', value: 'art' }, { label: 'Cooking', value: 'cooking' }, { label: 'Crafts', value: 'crafts' }] },
  { label: 'Classes', value: 'classes', subcategories: [{ label: 'Dance', value: 'dance' }, { label: 'Music', value: 'music' }, { label: 'Sports', value: 'sports' }] },
  { label: 'Adventure', value: 'adventure', subcategories: [{ label: 'Hiking', value: 'hiking' }, { label: 'Climbing', value: 'climbing' }, { label: 'Water Sports', value: 'water_sports' }] },
];

export const CATEGORIES_BY_TYPE: Record<ListingType, CategoryDefinition[]> = {
  service: SERVICE_CATEGORIES,
  goods: GOODS_CATEGORIES,
  rental: RENTAL_CATEGORIES,
  experience: EXPERIENCE_CATEGORIES,
  fundraising: [
    { label: 'Charity', value: 'charity', subcategories: [] },
    { label: 'Personal', value: 'personal', subcategories: [] },
    { label: 'Business', value: 'business', subcategories: [] },
    { label: 'Medical', value: 'medical', subcategories: [] },
    { label: 'Education', value: 'education', subcategories: [] },
  ],
  transportation: [
    { label: 'Delivery', value: 'delivery', subcategories: [{ label: 'Food', value: 'food' }, { label: 'Grocery', value: 'grocery' }, { label: 'Package', value: 'package' }, { label: 'Medicine', value: 'medicine' }] },
    { label: 'Taxi', value: 'taxi', subcategories: [{ label: 'Standard', value: 'standard' }, { label: 'Luxury', value: 'luxury' }] },
    { label: 'Rideshare', value: 'rideshare', subcategories: [] },
    { label: 'Moving', value: 'moving', subcategories: [] },
  ],
  digital_services: [
    { label: 'Templates', value: 'templates', subcategories: [] },
    { label: 'Guides', value: 'guides', subcategories: [] },
    { label: 'Courses', value: 'courses', subcategories: [] },
    { label: 'eBooks', value: 'ebooks', subcategories: [] },
  ],
  gated_content: [
    { label: 'Blog', value: 'blog', subcategories: [] },
    { label: 'Newsletter', value: 'newsletter', subcategories: [] },
    { label: 'Video Series', value: 'video_series', subcategories: [] },
    { label: 'Podcast', value: 'podcast', subcategories: [] },
    { label: 'Community', value: 'community', subcategories: [] },
  ],
};
