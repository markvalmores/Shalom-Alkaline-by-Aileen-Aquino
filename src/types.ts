export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  coverURL?: string;
  bio?: string;
  followingCount: number;
  followersCount: number;
  isAdmin: boolean;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  content: string;
  imageURL?: string;
  fileType?: string;
  upvotes: string[]; // List of user IDs who upvoted
  downvotes: string[]; // List of user IDs who downvoted
  createdAt: any;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: any;
}

export interface Chat {
  id: string;
  name?: string;
  participants: string[];
  lastMessage?: string;
  updatedAt: any;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  imageURL?: string;
  fileType?: string;
  createdAt: any;
}

export interface Follow {
  followerId: string;
  followingId: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageURL: string;
  pH: string;
  capacity: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  displayName: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    imageURL: string;
  }[];
  totalAmount: number;
  gcashReference: string;
  shippingAddress: string;
  shippingCity: string;
  shippingZip: string;
  shippingPhone: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: any;
}
