import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TeacherManagement from "./pages/admin/TeacherManagement";
import CourseManagement from "./pages/admin/CourseManagement";
import RoutineManagement from "./pages/teacher/RoutineManagement";
import BookingManagement from "./pages/teacher/BookingManagement";
import BookSession from "./pages/student/BookSession";
import MyBookings from "./pages/student/MyBookings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Admin Routes */}
            <Route path="/dashboard/teachers" element={<TeacherManagement />} />
            <Route path="/dashboard/courses" element={<CourseManagement />} />
            
            {/* Teacher Routes */}
            <Route path="/dashboard/routine" element={<RoutineManagement />} />
            <Route path="/dashboard/bookings" element={<BookingManagement />} />
            
            {/* Student Routes */}
            <Route path="/dashboard/book" element={<BookSession />} />
            <Route path="/dashboard/my-bookings" element={<MyBookings />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
