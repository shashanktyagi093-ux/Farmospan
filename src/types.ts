export interface CropListing {
  id: string;
  farmerName: string;
  farmerContact: string;
  cropName: string;
  category: 'Grains' | 'Vegetables' | 'Fruits' | 'Spices';
  variety: string;
  quantity: number;
  unit: 'kg' | 'Quintal' | 'Ton';
  pricePerUnit: number;
  location: string;
  state: string;
  harvestDate: string;
  description: string;
  descriptionHindi?: string;
  image: string;
  verified: boolean;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  mandiPriceEstimate?: number;
  approvalFactor?: number;
  // AI Trust and Reliability Intelligence
  deliveryReliability?: number;       // e.g. 98%
  qualityConsistency?: number;        // e.g. 96%
  buyerSatisfaction?: number;         // e.g. 4.9 / 5.0
  overallTrustScore?: number;         // e.g. 97%
  fulfillmentHistory?: {
    completedTrades: number;
    disputedTrades: number;
    averageLeadTimeDays: number;
    shipmentLog: {
      id: string;
      date: string;
      quantity: string;
      status: 'fulfilled' | 'delayed' | 'pending';
      cropName: string;
      buyerName: string;
    }[];
  };
}

export interface BuyerBid {
  id: string;
  listingId: string;
  buyerName: string;
  buyerContact: string;
  priceOffered: number;
  quantity: number;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  createdAt: string;
}

export interface DirectMessage {
  id: string;
  listingId: string;
  senderId: string;
  senderRole: 'farmer' | 'buyer';
  senderName: string;
  message: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  phone: string;
  name: string;
  role: 'farmer' | 'buyer';
  location: string;
  state: string;
  // Farmer Specific Details
  farmName?: string;
  farmSizeAcres?: number;
  primaryCrops?: string;
  organicCertified?: boolean;
  // Buyer Specific Details
  businessName?: string;
  gstNumber?: string;
  businessType?: 'Wholesaler' | 'Retailer' | 'Restaurant' | 'Exporter' | 'Individual' | string;
  preferredProduce?: string;
  createdAt: string;
}

export interface MarketPriceTrend {
  cropName: string;
  avgPrice: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  minPrice: number;
  maxPrice: number;
  lastUpdated: string;
}
