import { auth } from "@/auth";
import { getBooks } from "@/lib/actions/book";
import { sampleBooks } from "@/constants";
import BookList from "@/components/BookList";
import BookOverview from "@/components/BookOverview";

const Home = async () => {
  const session = await auth();

  // 1. Fetch books from DB
  const result = await getBooks(10);

  // Debug log in terminal to see exact DB result
  console.log("DB Get Books Result:", result);

  // 2. Fallback to sampleBooks if DB array is empty or errored
  const dbBooks = result?.success && result?.data?.length > 0 ? result.data : [];
  const books = dbBooks.length > 0 ? dbBooks : sampleBooks;

  const latestBook = books[0];

  return (
    <>
      {latestBook && (
        <BookOverview {...latestBook} userId={session?.user?.id || ""} />
      )}

      <BookList
        title="Latest Books"
        books={books.slice(1)}
        containerClassName="mt-10"
      />
    </>
  );
};

export default Home;