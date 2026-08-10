import { Home, Search, History, BarChart2, MoreHorizontal } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: Home, label: "Home", to: "/" },
  { icon: BarChart2, label: "Rates", to: "/egg-rate-today" },
  { icon: Search, label: "Search", to: "/search" },
  { icon: History, label: "History", to: "/egg-rate-history" },
  { icon: MoreHorizontal, label: "More", to: "/about" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 backdrop-blur-md md:hidden">
      <div className="flex h-16 items-center justify-around pb-safe">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1 text-[10px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
