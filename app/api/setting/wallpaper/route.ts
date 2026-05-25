import { NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getDbConnection();
    const [rows]: any = await pool.execute(
      "select wallpaper, aktifkan from setting limit 1"
    );

    if (rows.length > 0 && rows[0].wallpaper && rows[0].aktifkan === 'Yes') {
      const buf: Buffer = rows[0].wallpaper;
      return new NextResponse(new Uint8Array(buf), {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=31536000, immutable',
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
