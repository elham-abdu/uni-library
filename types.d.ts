export interface Book {
  id: string | number;
  title: string;
  author?: string;
  genre: string;
  rating?: number;
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