import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RejectionEmailRequest {
  teacherEmail: string;
  teacherName: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-teacher-rejection-email function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { teacherEmail, teacherName }: RejectionEmailRequest = await req.json();
    
    console.log(`Sending rejection email to teacher: ${teacherEmail}`);

    const emailResponse = await resend.emails.send({
      from: "EduBook <onboarding@resend.dev>",
      to: [teacherEmail],
      subject: "Teacher Application Status Update",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #EF4444;">Application Not Approved</h1>
          <p style="font-size: 16px; color: #374151;">
            Dear ${teacherName},
          </p>
          <p style="font-size: 16px; color: #374151;">
            We regret to inform you that your teacher application has not been approved at this time.
          </p>
          <p style="font-size: 16px; color: #374151;">
            If you believe this was a mistake or would like more information, please contact our support team.
          </p>
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
    console.error("Error sending teacher rejection email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
