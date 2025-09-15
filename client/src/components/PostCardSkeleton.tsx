import { Card, CardContent } from "@/components/ui/card";

export function PostCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="relative w-full aspect-video bg-muted animate-pulse" />
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse w-full" />
            <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="h-4 bg-muted rounded animate-pulse w-24" />
            <div className="h-8 bg-muted rounded animate-pulse w-28" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
