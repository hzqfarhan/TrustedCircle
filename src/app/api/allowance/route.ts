import { NextRequest, NextResponse } from 'next/server';
import { generateRecommendationAction, approveRecommendationAction, rejectRecommendationAction } from '@/lib/actions/recommendation-actions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, childId, recommendationId, approvedAmount } = body;

    if (action === 'generate') {
      const rec = await generateRecommendationAction(childId);
      return NextResponse.json(rec);
    }

    if (action === 'approve') {
      const result = await approveRecommendationAction(recommendationId, approvedAmount);
      return NextResponse.json(result);
    }

    if (action === 'reject') {
      const result = await rejectRecommendationAction(recommendationId);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
