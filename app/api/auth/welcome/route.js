// app/api/auth/welcome/route.js
// Handles sending a welcome email, potentially after email verification or auto-signup.

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// Initialize Supabase client with the SERVICE ROLE KEY
// Ensure these are set in your .env.local
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Basic HTML Email Template Function
function getWelcomeEmailHtml(name, email, tempPassword, siteUrl) {
  const loginUrl = `${siteUrl}/login`;
  const currentYear = new Date().getFullYear();
  // It's better to load complex HTML from a file or use a templating engine.
  // For security, avoid directly embedding user-generated content without sanitization if applicable.
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Daniel Da'Galow!</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eeeeee; }
        .logo { max-width: 150px; margin-bottom: 10px; } /* Add your logo URL */
        h1 { color: #002147; } /* oxfordBlue */
        .content { padding: 20px 0; }
        .credentials { background-color: #f9f9f9; border: 1px solid #dddddd; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .credentials p { margin: 5px 0; }
        .password { font-weight: bold; color: #D9534F; } /* Make password stand out, but consider security implications */
        .cta-button { display: inline-block; background-color: #BFA200; color: #000000 !important; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee; font-size: 0.9em; color: #777; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${siteUrl}/assets/logos/DaGalow%20Logo.svg" alt="Daniel Da'Galow Logo" class="logo">
          <h1>Welcome to Daniel Da'Galow!</h1>
        </div>
        <div class="content">
          <p>Hello ${name || 'there'},</p>
          <p>Thank you for joining us! Your account is now active and ready to use.</p>
          ${tempPassword ? `
          <div class="credentials">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> <span class="password">${tempPassword}</span></p>
          </div>
          <p>For security reasons, we strongly recommend changing this temporary password after your first login.</p>
          ` : '<p>You can now log in using the credentials you created.</p>'}
          <p style="text-align: center;">
            <a href="${loginUrl}" class="cta-button">Login to Your Account</a>
          </p>
          <p>If you have any questions or need assistance, feel free to reply to this email or contact our support team.</p>
          <p>Best regards,<br>The Daniel Da'Galow Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${currentYear} Daniel Da'Galow. All rights reserved.</p>
          <p>This email was sent to ${email}. If you did not sign up for this account, please disregard this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}


export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    // 1. Fetch user's full_name from 'profiles' table
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('email', email)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116: No rows found, not necessarily an error if temp_credentials exist
      console.error("Supabase error fetching profile:", profileError);
      // We can still proceed if temp_credentials exist, name will be a fallback
    }
    const name = profileData?.full_name || email.split('@')[0]; // Use name or derive from email

    // 2. Fetch temporary password from 'temp_credentials' table (if this flow is used)
    // This part is based on your 'handle-verification.js'
    // Consider if this table and logic are still relevant in your Next.js auth flow.
    let tempPassword = null;
    try {
        const { data: credData, error: credError } = await supabaseAdmin
        .from('temp_credentials') // Make sure this table exists and RLS is appropriate
        .select('temp_password')
        .eq('email', email)
        .order('created_at', { ascending: false }) // Get the latest one
        .limit(1)
        .single();

        if (credError && credError.code !== 'PGRST116') {
            console.warn("Supabase error fetching temp_credentials:", credError.message);
            // Don't fail the whole process for this, just won't include temp password
        }
        if (credData) {
            tempPassword = credData.temp_password;
            // Optionally: Delete the temporary credential after fetching it
            // await supabaseAdmin.from('temp_credentials').delete().eq('email', email);
        }
    } catch (e) {
        console.warn("Could not fetch or process temp_credentials:", e.message);
    }


    // 3. Configure Nodemailer transporter
    // IMPORTANT: Set these environment variables in .env.local
    // SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD
    // SMTP_FROM_EMAIL (e.g., "Daniel Da'Galow <noreply@danieldagalow.com>")
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD || !process.env.SMTP_FROM_EMAIL) {
        console.error("SMTP environment variables not set.");
        return NextResponse.json({ error: "Email service not configured." }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: parseInt(process.env.SMTP_PORT, 10) === 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const emailHtml = getWelcomeEmailHtml(name, email, tempPassword, siteUrl);

    // 4. Send the email
    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to: email,
      subject: `Welcome to Daniel Da'Galow!`,
      html: emailHtml,
      text: `Hello ${name},\n\nWelcome to Daniel Da'Galow! Your account is now active.\n${tempPassword ? `\nEmail: ${email}\nTemporary Password: ${tempPassword}\nPlease change this password after your first login.\n` : ''}\nLogin here: ${siteUrl}/login\n\nBest regards,\nThe Daniel Da'Galow Team`
    });

    console.log(`Welcome email sent to ${email}`);
    return NextResponse.json({ message: "Welcome email sent successfully." });

  } catch (err) {
    console.error("Error in welcome email API route:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error. Could not send welcome email." }, { status: 500 });
  }
}
