import { NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getDbConnection();
    const [rows]: any = await pool.execute(
      "select logo from setting limit 1"
    );

    if (rows.length > 0 && rows[0].logo) {
      const logoBuffer: Buffer = rows[0].logo;
      return new NextResponse(new Uint8Array(logoBuffer), {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    return NextResponse.json({ message: 'Logo tidak ditemukan' }, { status: 404 });
  } catch (error: any) {
    console.error('Error fetching logo:', error);
    return NextResponse.json(
      { message: 'Gagal mengambil logo', error: error.message },
      { status: 500 }
    );
  }
}
