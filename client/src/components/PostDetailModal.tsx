import { Post } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Clock, CheckCircle2, Mail, Phone, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";

interface PostDetailModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkFound?: (post: Post) => void;
  onMarkReturned?: (post: Post) => void;
}

export function PostDetailModal({ post, isOpen, onClose, onMarkFound, onMarkReturned }: PostDetailModalProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
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

  if (!post) return null;

  const isLost = post.type === "lost";
  const typeColor = isLost ? "bg-primary text-primary-foreground" : "bg-chart-2 text-white";
  const hasImages = post.imageUrls && post.imageUrls.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Badge className={typeColor}>
              {isLost ? "Lost" : "Found"}
            </Badge>
            {post.isResolved && (
              <Badge className="bg-chart-4 text-white flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {isLost ? "Found" : "Returned to Owner"}
              </Badge>
            )}
          </div>
          <DialogTitle className="text-lg font-semibold mt-2">
            {post.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {hasImages && (
            <div className="relative w-full bg-muted rounded-lg overflow-hidden">
              <div ref={emblaRef} className="overflow-hidden">
                <div className="flex">
                  {post.imageUrls!.map((imageUrl, index) => (
                    <div key={index} className="flex-[0_0_100%] min-w-0">
                      <img
                        src={imageUrl}
                        alt={`${post.title} - Image ${index + 1}`}
                        className="w-full h-auto max-h-[70vh] object-contain"
                        loading="lazy"
                        decoding="async"
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
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full shadow-lg z-10 opacity-90 hover:opacity-100"
                    onClick={scrollPrev}
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full shadow-lg z-10 opacity-90 hover:opacity-100"
                    onClick={scrollNext}
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-md">
                    {post.imageUrls!.length} photos
                  </div>
                </>
              )}
            </div>
          )}

          {post.description && (
            <div className="space-y-2">
              <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wide">
                Description
              </h4>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {post.description}
              </p>
            </div>
          )}

          {/* Contact Information Section */}
          <div className="space-y-3 p-4 rounded-lg border bg-muted/20">
            <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contact Information
            </h4>
            {post.contactEmail || post.contactPhone ? (
              <>
                {post.contactEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${post.contactEmail}`} className="text-sm text-primary hover:underline">
                      {post.contactEmail}
                    </a>
                  </div>
                )}
                {post.contactPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${post.contactPhone}`} className="text-sm text-primary hover:underline">
                      {post.contactPhone}
                    </a>
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                No contact information provided for this post. This is an older post created before contact details were required.
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t">
            <Clock className="h-3 w-3" />
            <span>
              Posted {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
          </div>

          {isLost && !post.isResolved && onMarkFound && (
            <div className="pt-4 border-t">
              <Button
                onClick={() => onMarkFound(post)}
                className="w-full"
                variant="outline"
              >
                Mark as Found
              </Button>
            </div>
          )}

          {!isLost && !post.isResolved && onMarkReturned && (
            <div className="pt-4 border-t">
              <Button
                onClick={() => onMarkReturned(post)}
                className="w-full"
                variant="outline"
              >
                Mark as Returned to Owner
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
