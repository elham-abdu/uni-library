import BookList from "@/components/BookList";
import BookOverview from "@/components/BookOverview";
import { sampleBooks } from "@/constants";

export default function Home() {
  return (
    <>
      <BookOverview {...sampleBooks[0]} />

      <BookList
        title="Latest Books"
        books={sampleBooks} // 👈 Pass all books (without .slice(1))
        containerClassName="mt-28"
      />
    </>
  );
}