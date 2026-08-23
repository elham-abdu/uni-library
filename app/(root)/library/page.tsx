import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getBooks } from "@/lib/actions/book";
import LibraryClient from "@/components/LibraryClient";

interface SearchParams {
  search?: string;
  genre?: string;
  availableOnly?: string;
  sort?: string;
  page?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function Library({ searchParams }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const limit = 12;
  const offset = (page - 1) * limit;

  const sortBy = params.sort as "newest" | "oldest" | "highestRated" | "available" || "newest";

  const result = await getBooks({
    limit,
    offset,
    search: params.search || "",
    genre: params.genre || "",
    availableOnly: params.availableOnly === "true",
    sortBy,
  });

  const books = result.success ? result.data : [];
  const genres = result.success ? result.genres : [];
  const total = result.success ? result.total : 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <LibraryClient
      books={books}
      genres={genres}
      totalPages={totalPages}
      currentPage={page}
      searchParams={{
        search: params.search || "",
        genre: params.genre || "",
        availableOnly: params.availableOnly === "true",
        sort: params.sort || "newest",
      }}
    />
  );
}