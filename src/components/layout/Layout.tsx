import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Menu, X, Clock, History, LayoutDashboard, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
    { to: "/", label: "Timer", icon: Clock },
    { to: "/history", label: "History", icon: History },
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/settings", label: "Settings", icon: Settings },
];

// Map routes to header titles
const routeTitles: Record<string, string> = {
    "/": "Timer",
    "/history": "History",
    "/dashboard": "Dashboard",
    "/settings": "Settings",
};

export function Layout() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const location = useLocation();
    const currentTitle = routeTitles[location.pathname] || "Study Tracker";

    const toggleDrawer = () => setDrawerOpen(!drawerOpen);
    const closeDrawer = () => setDrawerOpen(false);

    return (
        <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
            {/* Sticky header with centered title */}
            <header className="sticky top-0 z-40 grid h-14 shrink-0 grid-cols-3 items-center border-b border-border bg-background/95 px-2 backdrop-blur-sm sm:px-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 justify-self-start flex-shrink-0 sm:h-8 sm:w-8"
                    onClick={toggleDrawer}
                    aria-label="Toggle menu"
                >
                    {drawerOpen ? (
                        <X className="h-6 w-6 sm:h-5 sm:w-5" />
                    ) : (
                        <Menu className="h-6 w-6 sm:h-5 sm:w-5" />
                    )}
                </Button>
                <span className="whitespace-nowrap text-center text-base font-medium sm:text-lg">
                    {currentTitle}
                </span>
                <div /> {/* empty spacer for symmetry */}
            </header>

            {/* Overlay */}
            {drawerOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                    onClick={closeDrawer}
                />
            )}

            {/* Drawer */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-50 h-full w-64 bg-background border-r border-border transform transition-transform duration-300 ease-in-out",
                    drawerOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-14 items-center border-b border-border px-4">
                    <span className="text-lg font-medium">Study Tracker</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto h-9 w-9"
                        onClick={closeDrawer}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                <nav className="flex flex-col gap-1 p-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-base sm:text-sm transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "hover:bg-muted text-foreground/70 hover:text-foreground"
                                )
                            }
                            onClick={closeDrawer}
                        >
                            <item.icon className="h-5 w-5 sm:h-4 sm:w-4" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-auto p-4">
                <Outlet />
            </main>
        </div>
    );
}