import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingRejectedRequest {
  studentEmail: string;
  studentName: string;
  teacherName: string;
  courseName: string;
  bookingDate: string;
  bookingTime: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-booking-rejected-email function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      studentEmail, 
      studentName, 
      teacherName, 
      courseName, 
      bookingDate, 
      bookingTime 
    }: BookingRejectedRequest = await req.json();
    
    console.log(`Sending booking rejection email to student: ${studentEmail}`);

    const emailResponse = await resend.emails.send({
      from: "EduBook <onboarding@resend.dev>",
      to: [studentEmail],
      subject: "Booking Request Update",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #EF4444;">Booking Not Approved</h1>
          <p style="font-size: 16px; color: #374151;">
            Hi ${studentName},
          </p>
          <p style="font-size: 16px; color: #374151;">
            Unfortunately, your booking request could not be approved. Here were the details:
          </p>
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 8px 0;"><strong>Course:</strong> ${courseName}</p>
            <p style="margin: 8px 0;"><strong>Teacher:</strong> ${teacherName}</p>
            <p style="margin: 8px 0;"><strong>Date:</strong> ${bookingDate}</p>
            <p style="margin: 8px 0;"><strong>Time:</strong> ${bookingTime}</p>
          </div>
          <p style="font-size: 16px; color: #374151;">
            The teacher may not be available at the requested time. Please try booking a different slot.
          </p>
          <div style="margin-top: 24px;">
            <a href="${Deno.env.get("SITE_URL") || "https://nzgijrsgwhxdfktvmyvf.lovableproject.com"}/dashboard/book-session" 
               style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              Book Another Session
            </a>
          </div>
          <p style="margin-top: 32px; font-size: 14px; color: #6B7280;">
            Best regards,<br>The EduBook Team
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
    console.error("Error sending booking rejected email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
