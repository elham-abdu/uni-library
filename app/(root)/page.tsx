import BookList from "@/components/BookList";
import BookOverview from "@/components/BookOverview";
import { getBooks } from "@/lib/actions/book";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  // Pass options object matching GetBooksOptions signature
  const result = await getBooks({ limit: 10 });
  const latestBooks = result.success ? result.data : [];

  return (
    <>
      {latestBooks.length > 0 && (
        <BookOverview
          {...latestBooks[0]}
          userId={session?.user?.id || ""}
        />
      )}

      <BookList
        title="Latest Books"
        books={latestBooks.slice(1)}
        containerClassName="mt-28"
      />
    </>
  );
}