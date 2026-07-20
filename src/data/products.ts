import { Product } from '../types';

export const productsList: Product[] = [
  {
    id: 'shalom-classic',
    name: 'Shalom Classic Countertop Purifier',
    price: 12500,
    description: 'Compact design with 7-stage filtration, delivering natural minerals and optimal pH 8.5 - 9.5 alkaline water directly to your glass.',
    imageURL: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=600',
    pH: '8.5 - 9.5 pH',
    capacity: '15 Liters/Hour'
  },
  {
    id: 'shalom-under-sink',
    name: 'Shalom Emerald Under-Sink System',
    price: 24900,
    description: 'Concealed high-flow five-stage reverse osmosis & remineralizer. Restores the essential minerals of Earth\'s sea into supercharged alkaline hydration.',
    imageURL: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&q=80&w=600',
    pH: '9.0 - 9.8 pH',
    capacity: '25 Liters/Hour'
  },
  {
    id: 'shalom-oceanus',
    name: 'Shalom Oceanus Whole House Purifier',
    price: 68000,
    description: 'Heavy duty, professional whole-house filtration that sanitizes, softens, and alkalizes all water entering your residence.',
    imageURL: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=600',
    pH: '8.0 - 9.0 pH',
    capacity: '120 Liters/Hour'
  },
  {
    id: 'shalom-pitcher',
    name: 'Shalom Violet pH Boost Portable Pitcher',
    price: 3800,
    description: 'Elegant shatterproof green tea & violet accent pitcher with rapid-infusion replacement filter for clean alkaline hydration anywhere.',
    imageURL: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&q=80&w=600',
    pH: '8.5 - 9.2 pH',
    capacity: '2.5 Liters Total'
  }
];
