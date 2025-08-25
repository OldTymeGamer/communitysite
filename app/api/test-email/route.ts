import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function GET(request: NextRequest) {
  try {
    // Create transporter with current settings
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: parseInt(process.env.SMTP_PORT || '587') === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    })

    // Test the connection
    await transporter.verify()

    return NextResponse.json({
      success: true,
      message: 'SMTP connection successful!',
      config: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        from: process.env.SMTP_FROM
      }
    })

  } catch (error: any) {
    console.error('SMTP Test Error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      config: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        from: process.env.SMTP_FROM
      }
    }, { status: 500 })
  }
}