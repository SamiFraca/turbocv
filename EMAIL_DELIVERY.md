Email Delivery — How To Implement
There are two main approaches. Here's the practical one for your stack:

Recommended: Resend (easiest with Next.js)
1. Install
bash
pnpm add resend
2. Get API key
Sign up at resend.com, verify your domain (or use their test domain for dev), and get an API key. Add to .env.local:

RESEND_API_KEY=re_xxxxxxxxxxxxx
3. Create the API route
Create src/app/api/send-cv/route.ts:

typescript
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
 
const resend = new Resend(process.env.RESEND_API_KEY);
 
export async function POST(req: NextRequest) {
  const { email, pdfBase64, fileName } = await req.json();
 
  if (!email || !pdfBase64) {
    return NextResponse.json({ error: "Missing email or PDF" }, { status: 400 });
  }
 
  try {
    await resend.emails.send({
      from: "TurboCV <noreply@yourdomain.com>",
      to: email,
      subject: "Your optimized CV is ready",
      html: `
        <h2>Your TurboCV is attached</h2>
        <p>Thanks for using TurboCV! Your ATS-optimized CV is attached as a PDF.</p>
        <p>Good luck with your application!</p>
      `,
      attachments: [
        {
          filename: fileName || "optimized-cv.pdf",
          content: pdfBase64, // base64 string
        },
      ],
    });
 
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
4. Add to the frontend
After PDF download, offer an "Email me a copy" button. Call the API with the user's email + the pdfBase64 already returned by your optimize API.

5. When to trigger it
Two good options:

After payment — ask for email during checkout (Stripe already collects it), then auto-send
Optional button — add "Send to email" in the result view, show an email input
Key considerations
Free tier: Resend gives 3,000 emails/month free — more than enough to start
Domain verification: Required for production (prevents spam filtering). Use noreply@turbocv.com or similar
Alternative: If you prefer, Nodemailer + Gmail SMTP works too but is harder to scale and has daily limits (500/day)
Stripe integration: After payment, you can get the customer email from the Stripe webhook and auto-send the PDF