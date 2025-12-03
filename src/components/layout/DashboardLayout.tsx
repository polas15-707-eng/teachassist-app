import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Calendar, 
  CheckSquare, 
  LogOut,
  GraduationCap,
  BookMarked,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Teacher } from "@/types";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  const getMenuItems = () => {
    if (!currentUser) return [];

    switch (currentUser.role) {
      case "admin":
        return [
          { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
          { icon: Users, label: "Teacher Management", path: "/dashboard/teachers" },
          { icon: BookOpen, label: "Course Management", path: "/dashboard/courses" },
        ];
      case "teacher":
        if (currentUser.teacher?.account_status === "Pending") {
          return [
            { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
          ];
        }
        return [
          { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
          { icon: Calendar, label: "My Routine", path: "/dashboard/routine" },
          { icon: CheckSquare, label: "Booking Management", path: "/dashboard/bookings" },
        ];
      case "student":
        return [
          { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
          { icon: BookMarked, label: "Book Session", path: "/dashboard/book" },
          { icon: Bell, label: "My Bookings", path: "/dashboard/my-bookings" },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();
  const currentPath = window.location.pathname;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-sidebar border-b border-sidebar-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sidebar-primary rounded-full flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">Counselling Portal</h1>
              <p className="text-xs text-sidebar-foreground/70">
                {currentUser?.role.charAt(0).toUpperCase() + currentUser?.role.slice(1)} Portal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-sidebar-foreground">{currentUser?.profile.name}</p>
              <p className="text-xs text-sidebar-foreground/70">{currentUser?.profile.email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-sidebar border-r border-sidebar-border hidden md:block">
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent",
                    isActive && "bg-sidebar-accent font-semibold"
                  )}
                  onClick={() => navigate(item.path)}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="container mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
