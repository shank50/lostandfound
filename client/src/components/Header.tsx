import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Package, Plus } from "lucide-react";

export function Header() {
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" data-testid="link-home">
            <div className="flex items-center gap-2 hover-elevate rounded-md px-3 py-2 -ml-3 cursor-pointer">
              <Package className="h-5 w-5 text-primary" />
              <h1 className="text-base md:text-lg font-bold tracking-tight">Lost & Found</h1>
            </div>
          </Link>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {location !== "/create" && (
              <Link href="/create" data-testid="link-create">
                <Button size="default" data-testid="button-create-post">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Post
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
