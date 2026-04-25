import { NextRequest, NextResponse } from 'next/server';
import { SubmitExtraAllowanceRequest, ApproveExtraAllowanceRequestAction, RejectExtraAllowanceRequestAction } from '@/lib/actions/request-actions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'submit') {
      const result = await SubmitExtraAllowanceRequest(body.amount, body.reason, body.childNote || '');
      return NextResponse.json(result);
    }

    if (action === 'approve') {
      const result = await ApproveExtraAllowanceRequestAction(body.requestId, body.approvedAmount, body.parentMessage);
      return NextResponse.json(result);
    }

    if (action === 'reject') {
      const result = await RejectExtraAllowanceRequestAction(body.requestId, body.parentMessage);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

