import BookList from "@/components/BookList";
import BookOverview from "@/components/BookOverview";
import { Button } from "@/components/ui/button";
import { Book } from "lucide-react";

const Home = () => {
  return (
    <>
      <BookOverview />
      <BookList />
    </>
  );
};

export default Home;