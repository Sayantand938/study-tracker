import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { Menu, X, Clock, History, LayoutDashboard, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
    { to: "/", label: "Timer", icon: Clock },
    { to: "/history", label: "History", icon: History },
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/settings", label: "Settings", icon: Settings },
];

export function Layout() {
    const [drawerOpen, setDrawerOpen] = useState(false);

    const toggleDrawer = () => setDrawerOpen(!drawerOpen);
    const closeDrawer = () => setDrawerOpen(false);

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            {/* Header – now without bottom border */}
            <header className="sticky top-0 z-40 flex h-14 items-center bg-background/95 px-4 backdrop-blur-sm">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleDrawer}
                    aria-label="Toggle menu"
                >
                    {drawerOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
                {/* Title removed */}
            </header>

            {/* Overlay */}
            {drawerOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
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
                        className="ml-auto"
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
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "hover:bg-muted text-foreground/70 hover:text-foreground"
                                )
                            }
                            onClick={closeDrawer}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-4">
                <Outlet />
            </main>
        </div>
    );
}