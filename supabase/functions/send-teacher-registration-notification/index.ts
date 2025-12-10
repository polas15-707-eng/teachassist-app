import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TeacherRegistrationRequest {
  teacherName: string;
  teacherEmail: string;
  adminEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-teacher-registration-notification function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { teacherName, teacherEmail, adminEmail }: TeacherRegistrationRequest = await req.json();
    
    console.log(`Sending teacher registration notification to admin: ${adminEmail}`);

    const emailResponse = await resend.emails.send({
      from: "EduBook <onboarding@resend.dev>",
      to: [adminEmail],
      subject: "New Teacher Registration - Approval Required",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #F59E0B;">New Teacher Registration</h1>
          <p style="font-size: 16px; color: #374151;">
            A new teacher has registered and is awaiting your approval.
          </p>
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 8px 0;"><strong>Name:</strong> ${teacherName}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> ${teacherEmail}</p>
          </div>
          <p style="font-size: 16px; color: #374151;">
            Please review and approve or reject this registration.
          </p>
          <div style="margin-top: 24px;">
            <a href="${Deno.env.get("SITE_URL") || "https://nzgijrsgwhxdfktvmyvf.lovableproject.com"}/dashboard/teacher-management" 
               style="background-color: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              Review Registration
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
    console.error("Error sending teacher registration notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
