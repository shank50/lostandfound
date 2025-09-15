import { Search, PackageX, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface EmptyStateProps {
  type: "no-posts" | "no-results";
  searchQuery?: string;
}

export function EmptyState({ type, searchQuery }: EmptyStateProps) {
  if (type === "no-results") {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Search className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No results found</h3>
        <p className="text-sm text-muted-foreground max-w-md mb-6">
          No posts match "{searchQuery}". Try different keywords or browse all posts.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        <PackageX className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        Be the first to help the community! Create a post to report a lost or found item.
      </p>
      <Link href="/create">
        <Button size="default" data-testid="button-create-first">
          <Plus className="h-4 w-4 mr-2" />
          Create First Post
        </Button>
      </Link>
    </div>
  );
}
