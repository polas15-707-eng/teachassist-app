import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-booking-reminder function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current time and time 90 minutes from now
    const now = new Date();
    const reminderTime = new Date(now.getTime() + 90 * 60 * 1000);
    
    const today = now.toISOString().split('T')[0];
    const currentTimeStr = now.toTimeString().slice(0, 5);
    const reminderTimeStr = reminderTime.toTimeString().slice(0, 5);

    console.log(`Checking for bookings between ${currentTimeStr} and ${reminderTimeStr} on ${today}`);

    // Find approved bookings that are within 90 minutes
    const { data: upcomingBookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        booking_date,
        booking_time,
        description,
        student_id,
        teacher_id,
        course_id
      `)
      .eq('status', 'Approved')
      .eq('booking_date', today)
      .gte('booking_time', currentTimeStr)
      .lte('booking_time', reminderTimeStr);

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
      throw bookingsError;
    }

    console.log(`Found ${upcomingBookings?.length || 0} upcoming bookings`);

    const emailResults = [];

    for (const booking of upcomingBookings || []) {
      // Get student profile
      const { data: studentProfile } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', booking.student_id)
        .single();

      // Get teacher profile
      const { data: teacher } = await supabase
        .from('teachers')
        .select('user_id')
        .eq('id', booking.teacher_id)
        .single();

      let teacherName = 'Your Teacher';
      if (teacher) {
        const { data: teacherProfile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', teacher.user_id)
          .single();
        if (teacherProfile) {
          teacherName = teacherProfile.name;
        }
      }

      // Get course name
      const { data: course } = await supabase
        .from('courses')
        .select('course_name')
        .eq('id', booking.course_id)
        .single();

      if (studentProfile?.email) {
        console.log(`Sending reminder to ${studentProfile.email} for booking at ${booking.booking_time}`);

        const emailResponse = await resend.emails.send({
          from: "EduBook <onboarding@resend.dev>",
          to: [studentProfile.email],
          subject: "⏰ Reminder: Your Session Starts in 90 Minutes!",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #8B5CF6;">Session Reminder</h1>
              <p style="font-size: 16px; color: #374151;">
                Hi ${studentProfile.name},
              </p>
              <p style="font-size: 16px; color: #374151;">
                This is a friendly reminder that your session is starting soon!
              </p>
              <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 8px 0;"><strong>Course:</strong> ${course?.course_name || 'N/A'}</p>
                <p style="margin: 8px 0;"><strong>Teacher:</strong> ${teacherName}</p>
                <p style="margin: 8px 0;"><strong>Date:</strong> ${booking.booking_date}</p>
                <p style="margin: 8px 0;"><strong>Time:</strong> ${booking.booking_time}</p>
              </div>
              <p style="font-size: 16px; color: #374151;">
                Please make sure you're ready and available for your session.
              </p>
              <div style="margin-top: 24px;">
                <a href="${Deno.env.get("SITE_URL") || "https://nzgijrsgwhxdfktvmyvf.lovableproject.com"}/dashboard/my-bookings" 
                   style="background-color: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                  View My Bookings
                </a>
              </div>
              <p style="margin-top: 32px; font-size: 14px; color: #6B7280;">
                Best regards,<br>The EduBook Team
              </p>
            </div>
          `,
        });

        emailResults.push({
          bookingId: booking.id,
          studentEmail: studentProfile.email,
          status: 'sent',
          response: emailResponse
        });
      }
    }

    console.log(`Sent ${emailResults.length} reminder emails`);

    return new Response(JSON.stringify({ 
      success: true, 
      remindersSent: emailResults.length,
      results: emailResults 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-booking-reminder:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
