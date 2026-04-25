import { NextRequest, NextResponse } from 'next/server';
import { GenerateRecommendationAction, ApproveRecommendationAction, RejectRecommendationAction } from '@/lib/actions/recommendation-actions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, childId, recommendationId, approvedAmount } = body;

    if (action === 'generate') {
      const rec = await GenerateRecommendationAction(childId);
      return NextResponse.json(rec);
    }

    if (action === 'approve') {
      const result = await ApproveRecommendationAction(recommendationId, approvedAmount);
      return NextResponse.json(result);
    }

    if (action === 'reject') {
      const result = await RejectRecommendationAction(recommendationId);
      return NextResponse.json(result);
    }


    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
