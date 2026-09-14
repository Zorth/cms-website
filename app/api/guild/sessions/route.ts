import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await fetch('https://guild.tarragon.be/api/external/v1/sessions?past=false', {
      headers: {
        'Accept': 'application/json',
      },
      next: {
        revalidate: 60, // revalidate every 60 seconds
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Guild API returned ${res.status}: ${res.statusText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error proxying Guild sessions API:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch sessions from Guild API' },
      { status: 500 }
    );
  }
}
