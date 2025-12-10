import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NewBookingRequest {
  teacherEmail: string;
  teacherName: string;
  studentName: string;
  courseName: string;
  bookingDate: string;
  bookingTime: string;
  description: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-new-booking-notification function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      teacherEmail, 
      teacherName, 
      studentName, 
      courseName, 
      bookingDate, 
      bookingTime,
      description 
    }: NewBookingRequest = await req.json();
    
    console.log(`Sending new booking notification to teacher: ${teacherEmail}`);

    const emailResponse = await resend.emails.send({
      from: "EduBook <onboarding@resend.dev>",
      to: [teacherEmail],
      subject: "New Booking Request - Action Required",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3B82F6;">New Booking Request</h1>
          <p style="font-size: 16px; color: #374151;">
            Hi ${teacherName},
          </p>
          <p style="font-size: 16px; color: #374151;">
            You have received a new booking request from a student.
          </p>
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 8px 0;"><strong>Student:</strong> ${studentName}</p>
            <p style="margin: 8px 0;"><strong>Course:</strong> ${courseName}</p>
            <p style="margin: 8px 0;"><strong>Date:</strong> ${bookingDate}</p>
            <p style="margin: 8px 0;"><strong>Time:</strong> ${bookingTime}</p>
            <p style="margin: 8px 0;"><strong>Description:</strong> ${description}</p>
          </div>
          <p style="font-size: 16px; color: #374151;">
            Please review and approve or reject this booking request.
          </p>
          <div style="margin-top: 24px;">
            <a href="${Deno.env.get("SITE_URL") || "https://nzgijrsgwhxdfktvmyvf.lovableproject.com"}/dashboard/booking-management" 
               style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              Review Booking
            </a>
          </div>
          <p style="margin-top: 32px; font-size: 14px; color: #6B7280;">
            Best regards,<br>The EduBook System
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending new booking notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
