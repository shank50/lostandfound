import { Post } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";

interface PostCardProps {
  post: Post;
  onMarkFound?: (post: Post) => void;
  onClick?: (post: Post) => void;
}

export function PostCard({ post, onMarkFound, onClick }: PostCardProps) {
  const isLost = post.type === "lost";
  const typeColor = isLost ? "bg-primary text-primary-foreground" : "bg-chart-2 text-white";
  const hasImages = post.imageUrls && post.imageUrls.length > 0;
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const handleClick = () => {
    if (onClick) {
      onClick(post);
    }
  };

  return (
    <Card 
      className="overflow-hidden hover-elevate transition-all duration-200 relative group cursor-pointer"
      data-testid={`card-post-${post.id}`}
      onClick={handleClick}
    >
      {post.isResolved && (
        <div className="absolute top-0 right-0 z-10 bg-chart-4 text-white px-4 py-1 rounded-bl-lg shadow-lg flex items-center gap-1">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-sm font-semibold">
            {isLost ? "Found" : "Returned to Owner"}
          </span>
        </div>
      )}
      
      {hasImages && (
        <div className="relative w-full bg-muted overflow-hidden">
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex">
              {post.imageUrls!.map((imageUrl, index) => (
                <div key={index} className="flex-[0_0_100%] min-w-0">
                  <img
                    src={imageUrl}
                    alt={`${post.title} - Image ${index + 1}`}
                    className="w-full h-auto max-h-64 object-cover"
                    loading="lazy"
                    decoding="async"
                    data-testid={`img-post-${post.id}-${index}`}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {post.imageUrls!.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full opacity-90 md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-lg z-10"
                onClick={scrollPrev}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full opacity-90 md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-lg z-10"
                onClick={scrollNext}
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 text-white px-2.5 py-1 rounded-full text-xs font-medium">
                {post.imageUrls!.length} photos
              </div>
            </>
          )}

          <div className={`absolute top-3 left-3 ${typeColor} px-3 py-1 rounded-md text-sm font-semibold shadow-md`}>
            {isLost ? "Lost" : "Found"}
          </div>
        </div>
      )}
      
      <CardContent className="p-4">
        {!hasImages && (
          <div className="mb-3">
            <Badge className={typeColor} data-testid={`badge-type-${post.id}`}>
              {isLost ? "Lost" : "Found"}
            </Badge>
          </div>
        )}
        
        <h3 
          className="text-base font-semibold line-clamp-2 tracking-tight"
          data-testid={`text-title-${post.id}`}
        >
          {post.title}
        </h3>

        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span data-testid={`text-time-${post.id}`}>
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
