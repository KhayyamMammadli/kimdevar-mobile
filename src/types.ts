export type Role = "buyer" | "seller" | "admin";
export type User = {
  id: string;
  name: string;
  role: Role;
  phone: string;
  district: string;
};
export type RequestItem = {
  id: string;
  buyer_id: string;
  title: string;
  brand: string;
  model: string;
  part: string;
  budget: number;
  district: string;
  urgency: string;
  quality: string;
  note: string;
  status: string;
  created_at: string;
  image_id?: string | null;
  offer_count?: number;
};
export type Offer = {
  id: string;
  request_id: string;
  store_id: string;
  price: number;
  quality: string;
  condition: string;
  stock: string;
  installation: number;
  delivery: boolean;
  warranty: number;
  note: string;
  expires_at: string;
  created_at: string;
  status: string;
  store_name?: string;
  title?: string;
};
export type Store = {
  id: string;
  owner_id: string;
  name: string;
  district: string;
  address: string;
  phone: string;
  categories: string[];
  verified: boolean;
  hours: string;
};
export type Conversation = {
  id: string;
  request_id: string;
  buyer_id: string;
  store_id: string;
  store_name?: string;
  buyer_name?: string;
  request_title?: string;
  last_message?: string;
};
export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  created_at: string;
};
export type Notice = {
  id: string;
  title: string;
  body: string;
  target_id: string;
  kind: string;
  read: boolean;
  created_at: string;
};
export type Draft = Omit<
  RequestItem,
  "id" | "buyer_id" | "status" | "created_at" | "offer_count"
>;
