export interface Book {
  id: string | number;
  title: string;
  author?: string;
  genre: string;
  rating?: number | string;
  totalCopies?: number;
  availableCopies?: number;
  description?: string;
  coverColor: string;
  color?: string;
  cover?: string;
  coverUrl?: string;
  videoUrl?: string;
  summary?: string;
  createdAt?: Date | null;
  isLoanedBook?: boolean;
}

export interface AuthCredentials {
  fullname: string;
  email: string;
  universityId: number;
  password: string;
  universityCard: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface BookParams {
  title: string;
  author: string;
  genre: string;
  rating: number;
  coverUrl: string;
  coverColor: string;
  description: string;
  totalCopies: number;
  videoUrl: string;
  summary: string;
}
declare module 'lucide-react' {
  export const Search: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const Filter: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const X: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const Loader2: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const BookOpen: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const User: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const LogOut: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const Home: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const Library: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const Calendar: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const Star: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}
export interface User {
  id: string;
  fullName: string;
  email: string;
  universityId: string;
  password: string;
  universityCard: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  role: "USER" | "ADMIN";
  lastActivityDate: string | null;
  createdAt: Date | null;
  // ✅ New fields - make them optional or with default values
  phone: string | null;
  bio: string | null;
  emailNotifications: boolean;
  borrowConfirmationEmails: boolean;
  returnConfirmationEmails: boolean;
  dueReminderEmails: boolean;
  promotionalEmails: boolean;
  language: string | null;
  theme: string | null; // ✅ Allow null
}