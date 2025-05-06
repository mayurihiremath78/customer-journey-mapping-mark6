// export interface Product {
//   id: string;
//   name: string;
//   brand: string;
//   imageUrl: string;
//   price: number;
//   averageRating: number;
//   type: string;
// }

// export interface User {
//   email: string;
//   password?: string;
//   loginTime?: Date;
//   id?: string;
//   name?: string;
//   role?: string;
// }

// // Add other types used by your mock data
// export interface Journey {
//   id: string;
//   userId: string;
//   productId: string;
//   createdAt: string;
//   stages: JourneyStage[];
//   overallSatisfaction: number;
//   review: string;
// }

// export interface JourneyStage {
//   stageName: string;
//   completed: boolean;
//   data: any;
// }

// export interface ChartData {
//   name: string;
//   value: number;
//   fill: string;
// }

export interface Product {
  id: string;
  name: string;
  brand: string;
  imageUrl: string;
  price: number;
  averageRating: number;
  type: string;
  description?: string;
}

export interface User {
  email: string;
  password?: string;
  loginTime?: Date;
  id?: string;
  name?: string;
  role?: string;
  image?: string;
}

// Journey interface with all needed fields for reviews
export interface Journey {
  id: number;
  userId: number;
  productId: string | number;
  createdAt?: string;
  date?: string; // For compatibility with existing code
  stages?: JourneyStage[];
  overallSatisfaction?: number;
  rating?: number;
  review?: string;
  customerName?: string;
  email?: string;
  userImage?: string;
  wouldRecommend?: boolean;
  
  // Feature importance flags
  keyFeature_SoundQuality?: boolean;
  keyFeature_NoiseCancellation?: boolean;
  keyFeature_BatteryLife?: boolean;
  keyFeature_Comfort?: boolean;
  keyFeature_Price?: boolean;
  keyFeature_Brand?: boolean;
  keyFeature_Design?: boolean;
  
  // Stage completion flags
  awarenessCompleted?: boolean;
  considerationCompleted?: boolean;
  purchaseCompleted?: boolean;
  postPurchaseCompleted?: boolean;
  supportCompleted?: boolean;
}

export interface JourneyStage {
  stageName: string;
  completed: boolean;
  data: any;
}

export interface ChartData {
  name: string;
  value: number;
  fill: string;
}