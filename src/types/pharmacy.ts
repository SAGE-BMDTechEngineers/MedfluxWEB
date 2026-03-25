export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  delivery_available?: boolean;
  operating_hours?: string;
  is_verified?: boolean;
  distance?: string;
}

export interface Medicine {
  id: string;
  name: string;
  price: number;
  category?: string;
}

export interface PharmacyMedicine {
  pharmacy: Pharmacy;
  medicine: Medicine;
  in_stock: boolean;
  quantity_available?: number;
  last_updated?: string;
}
