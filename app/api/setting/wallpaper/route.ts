import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isPreview = searchParams.get('preview') === '1';

    const pool = await getDbConnection();
    const [rows]: any = await pool.execute(
      "select wallpaper, aktifkan from setting limit 1"
    );

    const show = rows.length > 0 && rows[0].wallpaper && (isPreview || rows[0].aktifkan === 'Yes');

    if (show) {
      const buf: Buffer = rows[0].wallpaper;
      const hasVersion = searchParams.has('v') || searchParams.has('t');
      return new NextResponse(new Uint8Array(buf), {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': hasVersion
            ? 'no-cache, no-store, must-revalidate'
            : 'public, max-age=31536000, immutable',
        },
      });
    }

    return NextResponse.json({ message: 'Wallpaper tidak aktif atau tidak ditemukan' }, { status: 404 });
  } catch (error: any) {
    console.error('Error fetching wallpaper:', error);
    return NextResponse.json(
      { message: 'Gagal mengambil wallpaper', error: error.message },
      { status: 500 }
    );
  }
}
