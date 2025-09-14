import { Button } from "@/components/ui/button";

type FilterType = "all" | "lost" | "found";

interface FilterTabsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts?: {
    all: number;
    lost: number;
    found: number;
  };
}

export function FilterTabs({ activeFilter, onFilterChange, counts }: FilterTabsProps) {
  const tabs: { value: FilterType; label: string }[] = [
    { value: "all", label: "All Posts" },
    { value: "lost", label: "Lost" },
    { value: "found", label: "Found" },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {tabs.map((tab) => {
        const isActive = activeFilter === tab.value;
        const count = counts?.[tab.value];
        
        return (
          <Button
            key={tab.value}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(tab.value)}
            data-testid={`button-filter-${tab.value}`}
            className={isActive ? "" : "hover-elevate"}
          >
            {tab.label}
            {count !== undefined && (
              <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${isActive ? "bg-primary-foreground/20" : "bg-muted"}`}>
                {count}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}
