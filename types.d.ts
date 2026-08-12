interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  rating: number;
  totalCopies: number;
  availableCopies: number;
  coverColor: string;
  description?: string;
  cover: string;
  videoUrl: string;
  summary: string;
  createdAt: Date | null;
}