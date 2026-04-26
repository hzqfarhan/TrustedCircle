import { NextRequest, NextResponse } from 'next/server';
import { proxyToGateway } from '@/lib/api-gateway-proxy';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'submit') {
      const gwBody = JSON.stringify({
        childId: body.childId || 'cp_aiman',
        parentId: body.parentId || 'demo_parent',
        amount: body.amount,
        reason: body.reason || body.childNote || '',
        category: body.category || 'other',
      });
      const res = await proxyToGateway('/allowance/request', {
        method: 'POST',
        body: gwBody,
      });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

    // approve / reject still go through actions layer (no gateway endpoint yet)
    const { ApproveExtraAllowanceRequestAction, RejectExtraAllowanceRequestAction } =
      await import('@/lib/actions/request-actions');

    if (action === 'approve') {
      const result = await ApproveExtraAllowanceRequestAction(
        body.requestId,
        body.approvedAmount,
        body.parentMessage
      );
      return NextResponse.json(result);
    }

    if (action === 'reject') {
      const result = await RejectExtraAllowanceRequestAction(
        body.requestId,
        body.parentMessage
      );
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }
}
