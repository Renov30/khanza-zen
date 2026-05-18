"use server";

import { db } from "@/lib/db";
import { cookies } from "next/headers";

/**
 * Aksi login mengikuti logika enkripsi Khanza:
 * - Key username: 'nur'
 * - Key password: 'windi'
 */
export async function loginAction(formData: FormData) {
  const id_user = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!id_user || !password) {
    return { success: false, message: "Username and password are required" };
  }

  try {
    let userData = null;

    // 1. Cek di tabel 'user' (Petugas/Staff)
    const [rows]: any = await db.execute(
      `SELECT * FROM user WHERE id_user = AES_ENCRYPT(?, 'nur') AND password = AES_ENCRYPT(?, 'windi')`,
      [id_user, password]
    );

    if (rows.length > 0) {
      userData = {
        id: id_user,
        nama: rows[0].nama || id_user,
        role: 'user'
      };
    } else {
      // 2. Fallback cek di tabel 'admin'
      const [adminRows]: any = await db.execute(
        `SELECT * FROM admin WHERE usere = AES_ENCRYPT(?, 'nur') AND passworde = AES_ENCRYPT(?, 'windi')`,
        [id_user, password]
      );

      if (adminRows.length > 0) {
        userData = {
          id: id_user,
          nama: id_user,
          role: 'admin'
        };
      }
    }

    if (userData) {
      const cookieStore = await cookies();
      cookieStore.set("user_session", JSON.stringify(userData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 // 24 jam
      });

      return {
        success: true,
        user: userData
      };
    }

    return { success: false, message: "ID User atau Password salah" };
  } catch (error: any) {
    console.error("Login error:", error);
    return { success: false, message: "Kesalahan koneksi database" };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("user_session");
  return { success: true };
}
