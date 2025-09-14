import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Post, MarkFoundRequest, MarkReturnedRequest } from "@shared/schema";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { FilterTabs } from "@/components/FilterTabs";
import { PostCard } from "@/components/PostCard";
import { PostCardSkeleton } from "@/components/PostCardSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { MarkFoundModal } from "@/components/MarkFoundModal";
import { PostDetailModal } from "@/components/PostDetailModal";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

type FilterType = "all" | "lost" | "found";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [detailPost, setDetailPost] = useState<Post | null>(null);
  const { toast } = useToast();

  const { data: posts = [], isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  const markFoundMutation = useMutation({
    mutationFn: async (data: MarkFoundRequest) => {
      return await apiRequest("POST", "/api/mark-found", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setSelectedPost(null);
      toast({
        title: "Success!",
        description: "The item has been marked as found.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Incorrect secret password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const markReturnedMutation = useMutation({
    mutationFn: async (data: MarkReturnedRequest) => {
      return await apiRequest("POST", "/api/mark-returned", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setSelectedPost(null);
      toast({
        title: "Success!",
        description: "The item has been marked as returned.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Incorrect secret password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredPosts = useMemo(() => {
    let filtered = posts;

    if (activeFilter !== "all") {
      filtered = filtered.filter((post) => post.type === activeFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.description?.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [posts, activeFilter, searchQuery]);

  const counts = useMemo(() => ({
    all: posts.length,
    lost: posts.filter((p) => p.type === "lost").length,
    found: posts.filter((p) => p.type === "found").length,
  }), [posts]);

  const handleMarkFound = (post: Post) => {
    setSelectedPost(post);
  };

  const handleConfirmMarkFound = (secret: string) => {
    if (selectedPost) {
      markFoundMutation.mutate({ id: selectedPost.id, secret });
    }
  };

  const handleCardClick = (post: Post) => {
    setDetailPost(post);
  };

  const handleMarkReturned = (post: Post) => {
    setSelectedPost(post);
  };

  const handleConfirmMarkReturned = (secret: string) => {
    if (selectedPost) {
      markReturnedMutation.mutate({ id: selectedPost.id, secret });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-8">
        <div className="mb-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">
              Find What's Lost, Return What's Found
            </h2>
            <p className="text-muted-foreground">
              A community platform to reunite people with their belongings
            </p>
          </div>
          
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
          />
          
          <div className="flex justify-center">
            <FilterTabs
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              counts={counts}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <EmptyState
            type={searchQuery.trim() ? "no-results" : "no-posts"}
            searchQuery={searchQuery}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="grid-posts">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onMarkFound={handleMarkFound}
                onClick={handleCardClick}
              />
            ))}
          </div>
        )}
      </main>

      <MarkFoundModal
        post={selectedPost}
        open={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        onConfirm={(secret) => {
          if (selectedPost?.type === "lost") handleConfirmMarkFound(secret);
          else handleConfirmMarkReturned(secret);
        }}
        isPending={markFoundMutation.isPending || markReturnedMutation.isPending}
        action={selectedPost?.type === "lost" ? "found" : "returned"}
      />

      <PostDetailModal
        post={detailPost}
        isOpen={!!detailPost}
        onClose={() => setDetailPost(null)}
        onMarkFound={handleMarkFound}
        onMarkReturned={handleMarkReturned}
      />
    </div>
  );
}
