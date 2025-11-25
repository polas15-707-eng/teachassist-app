import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Calendar, CheckCircle } from "lucide-react";
import { teachersData, studentsData, coursesData, bookingsData } from "@/data/mockData";

const AdminDashboard = () => {
  const activeTeachers = teachersData.filter(t => t.accountStatus === "Active").length;
  const pendingTeachers = teachersData.filter(t => t.accountStatus === "Pending").length;
  const totalBookings = bookingsData.length;
  const approvedBookings = bookingsData.filter(b => b.status === "Approved").length;

  const stats = [
    {
      title: "Total Students",
      value: studentsData.length,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Active Teachers",
      value: activeTeachers,
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Pending Approvals",
      value: pendingTeachers,
      icon: Calendar,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Total Courses",
      value: coursesData.length,
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
        {stats.map((stat) => {
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
              <span className="text-2xl font-bold text-foreground">{totalBookings}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Approved Bookings</span>
              <span className="text-2xl font-bold text-success">{approvedBookings}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pending Bookings</span>
              <span className="text-2xl font-bold text-warning">
                {bookingsData.filter(b => b.status === "Pending").length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Rejected Bookings</span>
              <span className="text-2xl font-bold text-destructive">
                {bookingsData.filter(b => b.status === "Rejected").length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
