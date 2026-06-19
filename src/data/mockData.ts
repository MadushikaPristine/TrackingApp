import {GeoPoint, Rep, Route, Shop} from '../types';

/**
 * Generates GPS breadcrumb points along a path between two coordinates.
 * `steps` controls how many intermediate points to insert.
 * `jitter` adds a tiny road-curve variance (degrees) so the trail isn't
 * a perfectly straight line between shops.
 */
function interpolate(
  from: GeoPoint,
  to: GeoPoint,
  steps: number,
  jitter = 0.0003,
): GeoPoint[] {
  const points: GeoPoint[] = [];
  for (let i = 1; i <= steps; i++) {
    const t = i / (steps + 1);
    // Deterministic pseudo-random jitter based on position in sequence
    const jLat = (Math.sin(i * 127.1 + from.latitude * 1000) * 0.5) * jitter;
    const jLng = (Math.sin(i * 311.7 + from.longitude * 1000) * 0.5) * jitter;
    points.push({
      latitude: from.latitude + (to.latitude - from.latitude) * t + jLat,
      longitude: from.longitude + (to.longitude - from.longitude) * t + jLng,
    });
  }
  return points;
}

/** Builds a full GPS trail through an ordered list of visited shop coordinates. */
function buildTrail(stops: GeoPoint[], stepsPerSegment = 8): GeoPoint[] {
  if (stops.length === 0) {return [];}
  const trail: GeoPoint[] = [stops[0]];
  for (let i = 1; i < stops.length; i++) {
    trail.push(...interpolate(stops[i - 1], stops[i], stepsPerSegment));
    trail.push(stops[i]);
  }
  return trail;
}

export const MOCK_REPS: Rep[] = [
  {
    id: 'rep1',
    name: 'Kamal Perera',
    avatar: 'KP',
    phone: '+94 77 123 4567',
    zone: 'Colombo 3 - Fort',
    currentLat: 6.9347,
    currentLng: 79.8428,
    totalShops: 7,
    visitedShops: 4,
    isActive: true,
  },
  {
    id: 'rep2',
    name: 'Niluka Fernando',
    avatar: 'NF',
    phone: '+94 71 234 5678',
    zone: 'Colombo 5 - Havelock',
    currentLat: 6.8934,
    currentLng: 79.8612,
    totalShops: 6,
    visitedShops: 6,
    isActive: false,
  },
  {
    id: 'rep3',
    name: 'Suresh Bandara',
    avatar: 'SB',
    phone: '+94 76 345 6789',
    zone: 'Colombo 7 - Cinnamon Gardens',
    currentLat: 6.9102,
    currentLng: 79.8737,
    totalShops: 8,
    visitedShops: 3,
    isActive: true,
  },
  {
    id: 'rep4',
    name: 'Priya Wickramasinghe',
    avatar: 'PW',
    phone: '+94 78 456 7890',
    zone: 'Colombo 4 - Bambalapitiya',
    currentLat: 6.8798,
    currentLng: 79.8556,
    totalShops: 6,
    visitedShops: 1,
    isActive: true,
  },
];

const rep1Shops: Shop[] = [
  {
    id: 's1_1',
    name: 'Lanka Supermart',
    address: '45 Chatham St, Colombo 01',
    lat: 6.9344,
    lng: 79.8424,
    visitStatus: 'visited',
    visitTime: '08:30 AM',
    orderAmount: 45000,
    notes: 'Regular weekly order. Manager Pradeep was available.',
    contactName: 'Pradeep Silva',
    contactPhone: '+94 11 234 5678',
    sequence: 1,
  },
  {
    id: 's1_2',
    name: 'Metro Cash & Carry',
    address: '12 York St, Colombo 01',
    lat: 6.9318,
    lng: 79.8445,
    visitStatus: 'visited',
    visitTime: '09:15 AM',
    orderAmount: 128000,
    notes: 'Bulk order placed. Delivery scheduled for Thursday.',
    contactName: 'Ranjith Kumar',
    contactPhone: '+94 11 345 6789',
    sequence: 2,
  },
  {
    id: 's1_3',
    name: 'Cargills Food City',
    address: '78 Union Pl, Colombo 02',
    lat: 6.9271,
    lng: 79.8512,
    visitStatus: 'visited',
    visitTime: '10:05 AM',
    orderAmount: 67500,
    notes: 'New product range accepted. Will order next week.',
    contactName: 'Chaminda Wijeratne',
    contactPhone: '+94 11 456 7890',
    sequence: 3,
  },
  {
    id: 's1_4',
    name: 'Keells Super',
    address: '23 Galle Rd, Colombo 03',
    lat: 6.9198,
    lng: 79.8534,
    visitStatus: 'visited',
    visitTime: '11:20 AM',
    orderAmount: 89200,
    notes: 'Promotional display arranged.',
    contactName: 'Shantha De Silva',
    contactPhone: '+94 11 567 8901',
    sequence: 4,
  },
  {
    id: 's1_5',
    name: 'Arpico Supercentre',
    address: '56 R A De Mel Mawatha, Colombo 03',
    lat: 6.9145,
    lng: 79.8556,
    visitStatus: 'unvisited',
    sequence: 5,
  },
  {
    id: 's1_6',
    name: 'Laugfs Supermarket',
    address: '34 Duplication Rd, Colombo 03',
    lat: 6.9089,
    lng: 79.8578,
    visitStatus: 'unvisited',
    sequence: 6,
  },
  {
    id: 's1_7',
    name: 'Softlogic Glomark',
    address: '90 Galle Rd, Colombo 04',
    lat: 6.9012,
    lng: 79.8601,
    visitStatus: 'unvisited',
    sequence: 7,
  },
];

const rep2Shops: Shop[] = [
  {
    id: 's2_1',
    name: 'Havelock City Mall',
    address: '360 Havelock Rd, Colombo 05',
    lat: 6.8967,
    lng: 79.8623,
    visitStatus: 'visited',
    visitTime: '08:00 AM',
    orderAmount: 210000,
    notes: 'All shelves restocked. Manager very satisfied.',
    contactName: 'Anura Dissanayake',
    contactPhone: '+94 11 678 9012',
    sequence: 1,
  },
  {
    id: 's2_2',
    name: 'Majestic City',
    address: '10 Station Rd, Colombo 04',
    lat: 6.8912,
    lng: 79.8598,
    visitStatus: 'visited',
    visitTime: '09:30 AM',
    orderAmount: 156000,
    notes: 'New seasonal order confirmed.',
    contactName: 'Dilrukshi Jayawardena',
    contactPhone: '+94 11 789 0123',
    sequence: 2,
  },
  {
    id: 's2_3',
    name: 'Liberty Plaza',
    address: 'R A De Mel Mawatha, Colombo 03',
    lat: 6.9034,
    lng: 79.8567,
    visitStatus: 'visited',
    visitTime: '10:45 AM',
    orderAmount: 98500,
    notes: 'Promotional materials delivered.',
    contactName: 'Tharaka Seneviratne',
    contactPhone: '+94 11 890 1234',
    sequence: 3,
  },
  {
    id: 's2_4',
    name: 'Crescat Boulevard',
    address: '89 Galle Rd, Colombo 03',
    lat: 6.9078,
    lng: 79.8534,
    visitStatus: 'visited',
    visitTime: '11:30 AM',
    orderAmount: 175000,
    notes: 'Premium shelf space negotiated.',
    contactName: 'Sachini Ratnayake',
    contactPhone: '+94 11 901 2345',
    sequence: 4,
  },
  {
    id: 's2_5',
    name: 'One Galle Face Mall',
    address: '1A Galle Face Green, Colombo 02',
    lat: 6.9212,
    lng: 79.8478,
    visitStatus: 'visited',
    visitTime: '13:00 PM',
    orderAmount: 320000,
    notes: 'Largest single order this month.',
    contactName: 'Lahiru Mendis',
    contactPhone: '+94 11 012 3456',
    sequence: 5,
  },
  {
    id: 's2_6',
    name: 'Colombo City Centre',
    address: 'Muhandiram Ernest De Silva Mawatha, Colombo 02',
    lat: 6.9234,
    lng: 79.8501,
    visitStatus: 'visited',
    visitTime: '14:30 PM',
    orderAmount: 145000,
    notes: 'Quarterly review completed.',
    contactName: 'Pavithra Gunasekara',
    contactPhone: '+94 11 123 4567',
    sequence: 6,
  },
];

const rep3Shops: Shop[] = [
  {
    id: 's3_1',
    name: 'Vijitha Yapa Bookshop',
    address: '402 Galle Rd, Colombo 06',
    lat: 6.8823,
    lng: 79.8645,
    visitStatus: 'visited',
    visitTime: '08:15 AM',
    orderAmount: 34500,
    notes: 'Stationery supplies restocked.',
    contactName: 'Nimal Jayasuriya',
    contactPhone: '+94 11 234 5679',
    sequence: 1,
  },
  {
    id: 's3_2',
    name: 'Barefoot Gallery',
    address: '704 Galle Rd, Colombo 03',
    lat: 6.9089,
    lng: 79.8601,
    visitStatus: 'visited',
    visitTime: '09:45 AM',
    orderAmount: 67800,
    notes: 'Specialty items ordered for gallery shop.',
    contactName: 'Amara Perera',
    contactPhone: '+94 11 345 6790',
    sequence: 2,
  },
  {
    id: 's3_3',
    name: 'Fashion Bug',
    address: '25 Dharmapala Mawatha, Colombo 07',
    lat: 6.9112,
    lng: 79.8712,
    visitStatus: 'visited',
    visitTime: '11:00 AM',
    orderAmount: 89000,
    notes: 'New season collection presented.',
    contactName: 'Kasun Wickramaratne',
    contactPhone: '+94 11 456 7891',
    sequence: 3,
  },
  {
    id: 's3_4',
    name: 'Spa Ceylon',
    address: '37 Dharmapala Mawatha, Colombo 07',
    lat: 6.9134,
    lng: 79.8734,
    visitStatus: 'skipped',
    notes: 'Manager unavailable. Will revisit tomorrow.',
    sequence: 4,
  },
  {
    id: 's3_5',
    name: 'Paradise Road Gallery',
    address: '213 Dharmapala Mawatha, Colombo 07',
    lat: 6.9156,
    lng: 79.8756,
    visitStatus: 'unvisited',
    sequence: 5,
  },
  {
    id: 's3_6',
    name: 'Colombo Tea Traders',
    address: '150 Bauddhaloka Mawatha, Colombo 07',
    lat: 6.9178,
    lng: 79.8778,
    visitStatus: 'unvisited',
    sequence: 6,
  },
  {
    id: 's3_7',
    name: 'Lanka Tiles Showroom',
    address: '64 Bauddhaloka Mawatha, Colombo 07',
    lat: 6.9201,
    lng: 79.8756,
    visitStatus: 'unvisited',
    sequence: 7,
  },
  {
    id: 's3_8',
    name: 'Odel Department Store',
    address: '5 Alexandra Pl, Colombo 07',
    lat: 6.9145,
    lng: 79.8689,
    visitStatus: 'unvisited',
    sequence: 8,
  },
];

const rep4Shops: Shop[] = [
  {
    id: 's4_1',
    name: 'Bambalapitiya Supermart',
    address: '250 Galle Rd, Colombo 04',
    lat: 6.8812,
    lng: 79.8567,
    visitStatus: 'visited',
    visitTime: '08:45 AM',
    orderAmount: 52000,
    notes: 'New territory. First visit went well.',
    contactName: 'Roshan Wijeratne',
    contactPhone: '+94 11 567 8902',
    sequence: 1,
  },
  {
    id: 's4_2',
    name: 'Wellawatte Mini Mart',
    address: '120 Galle Rd, Colombo 06',
    lat: 6.8756,
    lng: 79.8601,
    visitStatus: 'unvisited',
    sequence: 2,
  },
  {
    id: 's4_3',
    name: 'Dehiwala Junction Store',
    address: '45 Galle Rd, Dehiwala',
    lat: 6.8678,
    lng: 79.8623,
    visitStatus: 'unvisited',
    sequence: 3,
  },
  {
    id: 's4_4',
    name: 'Mount Lavinia Fresh Mart',
    address: '12 Hotel Rd, Mount Lavinia',
    lat: 6.8523,
    lng: 79.8656,
    visitStatus: 'unvisited',
    sequence: 4,
  },
  {
    id: 's4_5',
    name: 'Ratmalana Traders',
    address: '67 Galle Rd, Ratmalana',
    lat: 6.8445,
    lng: 79.8689,
    visitStatus: 'unvisited',
    sequence: 5,
  },
  {
    id: 's4_6',
    name: 'Moratuwa City Mart',
    address: '89 Galle Rd, Moratuwa',
    lat: 6.8312,
    lng: 79.8712,
    visitStatus: 'unvisited',
    sequence: 6,
  },
];

export const MOCK_ROUTES: Route[] = [
  {
    id: 'route1',
    repId: 'rep1',
    date: new Date().toISOString().split('T')[0],
    shops: rep1Shops,
    polylineCoords: rep1Shops.map(s => ({latitude: s.lat, longitude: s.lng})),
    // GPS trail through the 4 visited shops (recorded by rep's mobile app)
    locationHistory: buildTrail(
      rep1Shops
        .filter(s => s.visitStatus === 'visited')
        .map(s => ({latitude: s.lat, longitude: s.lng})),
    ),
    startTime: '08:00 AM',
    estimatedEndTime: '05:00 PM',
  },
  {
    id: 'route2',
    repId: 'rep2',
    date: new Date().toISOString().split('T')[0],
    shops: rep2Shops,
    polylineCoords: rep2Shops.map(s => ({latitude: s.lat, longitude: s.lng})),
    // All 6 shops visited — complete trail
    locationHistory: buildTrail(
      rep2Shops.map(s => ({latitude: s.lat, longitude: s.lng})),
    ),
    startTime: '08:00 AM',
    estimatedEndTime: '04:00 PM',
  },
  {
    id: 'route3',
    repId: 'rep3',
    date: new Date().toISOString().split('T')[0],
    shops: rep3Shops,
    polylineCoords: rep3Shops.map(s => ({latitude: s.lat, longitude: s.lng})),
    // Trail through the 3 visited shops (shop 4 was skipped, rest unvisited)
    locationHistory: buildTrail(
      rep3Shops
        .filter(s => s.visitStatus === 'visited')
        .map(s => ({latitude: s.lat, longitude: s.lng})),
    ),
    startTime: '08:00 AM',
    estimatedEndTime: '06:00 PM',
  },
  {
    id: 'route4',
    repId: 'rep4',
    date: new Date().toISOString().split('T')[0],
    shops: rep4Shops,
    polylineCoords: rep4Shops.map(s => ({latitude: s.lat, longitude: s.lng})),
    // Only 1 visited shop so far — trail is just the starting point
    locationHistory: buildTrail(
      rep4Shops
        .filter(s => s.visitStatus === 'visited')
        .map(s => ({latitude: s.lat, longitude: s.lng})),
    ),
    startTime: '09:00 AM',
    estimatedEndTime: '06:00 PM',
  },
];
