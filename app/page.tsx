import { redirect } from "next/navigation";

type UserType = "searcher" | "provider";

const userType: UserType = "searcher";

export default function Home() {
  if (userType === "searcher") {
    redirect("/listings");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-2">
        <h1>WIP</h1>
        <p className="text-sm text-muted-foreground">Housing provider view coming soon.</p>
      </div>
    </main>
  );
}
