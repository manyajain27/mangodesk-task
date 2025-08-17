import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Summary from '@/models/Summary';
import { sendSummaryEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { summaryId, emails, summary } = await request.json();

    if (!summaryId || !emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: 'Summary ID and email addresses are required' },
        { status: 400 }
      );
    }

    if (!summary) {
      return NextResponse.json(
        { error: 'Summary content is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emails.filter(email => !emailRegex.test(email));
    
    if (invalidEmails.length > 0) {
      return NextResponse.json(
        { error: `Invalid email addresses: ${invalidEmails.join(', ')}` },
        { status: 400 }
      );
    }

    await dbConnect();

    const summaryDoc = await Summary.findById(summaryId);
    if (!summaryDoc) {
      return NextResponse.json(
        { error: 'Summary not found' },
        { status: 404 }
      );
    }

    summaryDoc.editedSummary = summary;
    summaryDoc.emailsSent = [...(summaryDoc.emailsSent || []), ...emails];
    await summaryDoc.save();

    await sendSummaryEmail(emails, summary);

    return NextResponse.json({
      success: true,
      message: 'Summary shared successfully',
    });
  } catch (error) {
    console.error('Error sharing summary:', error);
    return NextResponse.json(
      { error: 'Failed to share summary' },
      { status: 500 }
    );
  }
}