import { VenueDetails } from '@/types';

export const VENUE_DETAILS: Record<string, VenueDetails> = {
  'Watford Central': {
    name: 'Watford Central Leisure Centre',
    address: 'Hempstead Rd, Watford WD18 0DE',
    mapsUrl: 'https://maps.app.goo.gl/m76MvaP2S3iw3d2N6',
    parkingUrl: 'https://maps.app.goo.gl/U857rtydT9Aaktmf9',
    parkingAddress: 'Parking entrance via Hempstead Road'
  },
  'Fuller Health Life Centre': {
    name: 'Fuller Health Life Centre', 
    address: '47 Vicarage Rd, Watford WD18 0DD',
    mapsUrl: 'https://maps.app.goo.gl/cMYofnZsEFEk9Nhx8',
    parkingUrl: 'https://maps.app.goo.gl/A1p4FuQZwPqqEFdx6',
    parkingAddress: '47 Vicarage Rd - Parking Entrance'
  }
};

export function getVenueDetails(location: string): VenueDetails | null {
  return VENUE_DETAILS[location] || null;
}