import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Calendar, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeTeachers: 0,
    pendingTeachers: 0,
    totalCourses: 0,
    totalBookings: 0,
    approvedBookings: 0,
    pendingBookings: 0,
    rejectedBookings: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [students, teachers, courses, bookings] = await Promise.all([
        supabase.from("user_roles").select("id", { count: "exact" }).eq("role", "student"),
        supabase.from("teachers").select("*"),
        supabase.from("courses").select("id", { count: "exact" }),
        supabase.from("bookings").select("*"),
      ]);

      const activeTeachers = teachers.data?.filter(t => t.account_status === "Active").length || 0;
      const pendingTeachers = teachers.data?.filter(t => t.account_status === "Pending").length || 0;
      const approvedBookings = bookings.data?.filter(b => b.status === "Approved").length || 0;
      const pendingBookings = bookings.data?.filter(b => b.status === "Pending").length || 0;
      const rejectedBookings = bookings.data?.filter(b => b.status === "Rejected").length || 0;

      setStats({
        totalStudents: students.count || 0,
        activeTeachers,
        pendingTeachers,
        totalCourses: courses.count || 0,
        totalBookings: bookings.data?.length || 0,
        approvedBookings,
        pendingBookings,
        rejectedBookings,
      });
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Active Teachers",
      value: stats.activeTeachers,
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Pending Approvals",
      value: stats.pendingTeachers,
      icon: Calendar,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Total Courses",
      value: stats.totalCourses,
      icon: BookOpen,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Monitor and manage the counselling portal</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Booking Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Bookings</span>
              <span className="text-2xl font-bold text-foreground">{stats.totalBookings}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Approved Bookings</span>
              <span className="text-2xl font-bold text-success">{stats.approvedBookings}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pending Bookings</span>
              <span className="text-2xl font-bold text-warning">{stats.pendingBookings}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Rejected Bookings</span>
              <span className="text-2xl font-bold text-destructive">{stats.rejectedBookings}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
