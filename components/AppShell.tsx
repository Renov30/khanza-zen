"use client";

import React, { useState, useEffect } from "react";
import { SettingProvider } from "@/components/SettingContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaKey,
  FaUserTie,
  FaInfoCircle,
  FaDesktop,
  FaBook,
  FaHome,
  FaIdCard,
  FaAmbulance,
  FaFlask,
  FaRadiation,
  FaPills,
  FaBed,
  FaWheelchair,
  FaSignInAlt,
  FaTimes,
  FaLaptopMedical,
  FaCubes,
  FaSync,
  FaCog,
  FaReact,
  FaUser,
  FaLock,
  FaThLarge,
  FaBell,
  FaQuestionCircle,
  FaCommentDots,
} from "react-icons/fa";
import { loginAction, logoutAction } from "@/lib/actions/auth";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0 });
  const pathname = usePathname();
  const router = useRouter();

  // Auth States
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check session on mount
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();
        if (data.isLoggedIn) {
          setIsLoggedIn(true);
          setUsername(data.user.nama || data.user.id);
        } else {
          setIsLoginModalOpen(true);
        }
      } catch (err) {
        setIsLoginModalOpen(true);
      }
    };

    checkSession();

    // Listen for logout from other tabs
    const authChannel = new BroadcastChannel("auth_sync");
    authChannel.onmessage = (event) => {
      if (event.data === "logout") {
        setIsLoggedIn(false);
        setIsLoginModalOpen(true);
        if (pathname !== "/") {
          router.push("/");
        }
      }
    };

    const handleClick = () => {
      setContextMenu((prev) => ({ ...prev, show: false }));
      setIsAccountMenuOpen(false);
    };
    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
      authChannel.close();
    };
  }, [pathname, router]);

  const handleLogout = async () => {
    await logoutAction();
    
    // Notify other tabs
    const authChannel = new BroadcastChannel("auth_sync");
    authChannel.postMessage("logout");
    authChannel.close();

    setIsLoggedIn(false);
    setIsAccountMenuOpen(false);
    setIsLoginModalOpen(true);
    
    if (pathname !== "/") {
      router.push("/");
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const x =
      e.pageX + 220 > window.innerWidth ? window.innerWidth - 230 : e.pageX;
    const y =
      e.pageY + 200 > window.innerHeight ? window.innerHeight - 210 : e.pageY;
    setContextMenu({ show: true, x, y });
  };

  if (!mounted) return null;

  return (
    <div
      className="flex flex-col h-screen w-full overflow-hidden bg-slate-50 font-sans relative"
      onContextMenu={handleContextMenu}
    >
      {/* Primary Top Bar (Gradien Hijau Tua) */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="bg-gradient-to-r from-brand-700 via-brand-600 to-brand-800 text-white flex overflow-x-auto whitespace-nowrap px-2 py-0.5 lg:py-1 shadow-md z-30 border-b border-brand-500/50 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex items-center gap-1 w-max">
          <TopMenuItem
            icon={<FaKey className="text-yellow-400" />}
            label="Program"
          />
          <TopMenuItem
            icon={<FaInfoCircle className="text-orange-400" />}
            label="Informasi"
          />
          <TopMenuItem
            icon={<FaDesktop className="text-green-300" />}
            label="Antrian"
          />
          <TopMenuItem
            icon={<FaBell className="text-pink-300" />}
            label="Notifikasi"
          />
          <TopMenuItem
            icon={<FaQuestionCircle className="text-sky-300" />}
            label="Helpdesk"
          />
          <TopMenuItem
            icon={<FaCommentDots className="text-teal-300" />}
            label="Tanya AI"
          />
          <TopMenuItem
            icon={<FaBook className="text-blue-200" />}
            label="Tentang Program"
          />
        </div>
      </motion.nav>

      {/* Secondary Toolbar (Gaya Glassmorphic Terang) */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="bg-white/80 backdrop-blur-md border-b border-brand-100 flex items-center px-4 shadow-sm z-20 relative"
      >
        {/* Container Menu Geser */}
        <div className="flex-1 flex items-center gap-1 overflow-x-auto py-1 lg:py-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <Link href="/daftar-menu">
            <SecondaryMenuItem
              icon={
                <FaThLarge className="text-slate-500 hover:transition-colors" />
              }
              label="Menu"
              active={pathname === "/daftar-menu"}
            />
          </Link>
          <div className="w-px h-8 lg:h-10 bg-brand-100 mx-2 self-center shrink-0"></div>
          <Link href="/">
            <SecondaryMenuItem
              icon={
                <FaHome className="text-slate-500 hover:transition-colors" />
              }
              label="Home"
              active={pathname === "/"}
            />
          </Link>
          <Link href="/registrasi">
            <SecondaryMenuItem
              icon={
                <FaIdCard className="text-slate-500 hover:transition-colors" />
              }
              label="Registrasi"
              active={pathname === "/registrasi"}
            />
          </Link>
          <SecondaryMenuItem
            icon={
              <FaAmbulance className="text-slate-500 hover:transition-colors" />
            }
            label="IGD/UGD"
          />
          <SecondaryMenuItem
            icon={
              <FaFlask className="text-slate-500 hover:transition-colors" />
            }
            label="Laborat"
          />
          <SecondaryMenuItem
            icon={
              <FaRadiation className="text-slate-500 hover:transition-colors" />
            }
            label="Radiologi"
          />
          <SecondaryMenuItem
            icon={
              <FaPills className="text-slate-500 hover:transition-colors" />
            }
            label="Farmasi"
          />
          <Link href="/rawat-inap">
            <SecondaryMenuItem
              icon={
                <FaBed className="text-slate-500 hover:transition-colors" />
              }
              label="Rawat Inap"
              active={pathname === "/rawat-inap"}
            />
          </Link>
          <SecondaryMenuItem
            icon={
              <FaWheelchair className="text-slate-500 hover:transition-colors" />
            }
            label="Rawat Jalan"
          />
        </div>

        {/* Container Profil User Tetap (Tanpa Clipping Overflow) */}
        <div className="flex items-center pl-4 bg-white/20">
          {!isLoggedIn ? (
            <SecondaryMenuItem
              icon={
                <FaSignInAlt className="text-slate-500 group-hover:text-brand-600 transition-colors" />
              }
              label="Log In"
              onClick={() => setIsLoginModalOpen(true)}
            />
          ) : (
            <div className="relative">
              <div
                className="flex items-center gap-3 px-3 py-1.5 cursor-pointer hover:bg-brand-100/40 rounded-xl transition-all duration-150 border border-transparent hover:border-brand-200/50 hover:shadow-sm group/account"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAccountMenuOpen(!isAccountMenuOpen);
                }}
              >
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-[14px] font-bold text-slate-600 max-w-[150px] truncate group-hover/account:text-brand-700 transition-colors duration-150">
                    {username || "User"}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-100 to-white flex items-center justify-center border border-brand-200 shadow-sm transition-all duration-150 group-hover/account:scale-105 group-hover/account:shadow-md group-hover/account:border-brand-300">
                  <FaUser className="text-brand-600 text-xl drop-shadow-sm" />
                </div>
              </div>

              <AnimatePresence>
                {isAccountMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-brand-100 py-2 z-[100] overflow-hidden"
                  >
                    <div className="px-4 py-2 border-b border-slate-50 mb-1 sm:hidden">
                      <span className="text-xs font-bold text-slate-700 block truncate">
                        {username}
                      </span>
                      <span className="text-[10px] text-emerald-500">
                        Online
                      </span>
                    </div>
                    <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700 flex items-center gap-3 transition-colors font-medium">
                      <FaCog className="text-slate-400" />
                      <span>Settings</span>
                    </button>
                    <div className="h-px bg-slate-100 my-1 mx-2"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors font-bold"
                    >
                      <FaSignInAlt className="text-red-400 rotate-180" />
                      <span>Log Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.nav>

      {/* Area Konten Utama */}
      <main className="flex-1 relative w-full h-full overflow-hidden bg-brand-50/30">
        <div className="absolute inset-0 w-full h-full">
          <SettingProvider>{children}</SettingProvider>
        </div>
      </main>

      {/* Menu Konteks */}
      <AnimatePresence>
        {contextMenu.show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 bg-white/95 backdrop-blur-xl border border-brand-100 shadow-2xl rounded-xl py-2 min-w-[220px] flex flex-col text-sm font-medium overflow-hidden"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <div className="px-4 py-1.5 mb-1 border-b border-brand-50/50 flex items-center gap-2 bg-brand-50/30">
              <FaLaptopMedical className="text-brand-600 text-lg" />
              <span className="text-[10px] font-extrabold text-brand-700 uppercase tracking-widest">
                Tindakan Cepat
              </span>
            </div>
            <ContextMenuItem
              icon={<FaReact className="text-sky-500" />}
              label="Tentang Aplikasi"
            />
            <ContextMenuItem
              icon={<FaCog className="text-slate-500" />}
              label="Pengaturan"
            />
            <div className="w-full h-px bg-slate-100 my-1"></div>
            <ContextMenuItem
              icon={<FaSync className="text-brand-500" />}
              label="Muat Ulang (Refresh)"
              onClick={() => window.location.reload()}
            />
            {!isLoggedIn ? (
              <ContextMenuItem
                icon={<FaSignInAlt className="text-blue-500" />}
                label="Buka Halaman Login"
                onClick={() => setIsLoginModalOpen(true)}
              />
            ) : (
              <ContextMenuItem
                icon={<FaKey className="text-yellow-600" />}
                label="Log Out"
                onClick={handleLogout}
              />
            )}
            <div className="w-full h-px bg-slate-100 my-1"></div>
            <ContextMenuItem
              icon={<FaTimes className="text-red-500" />}
              label="Tutup Menu"
              isRed
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Login */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
              className="bg-white w-[380px] flex flex-col rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/50"
            >
              {/* Header Login */}
              <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                  <FaLock className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg leading-tight">
                    LOGIN
                  </h3>
                  <p className="text-white/70 text-[10px] font-medium tracking-wider">
                    SILAHKAN MASUK UNTUK MELANJUTKAN
                  </p>
                </div>
              </div>

              {/* Area Form */}
              <form
                action={async (formData) => {
                  setLoginError("");
                  setIsLoading(true);
                  const result = await loginAction(formData);
                  setIsLoading(false);

                  if (result.success && result.user) {
                    setIsLoggedIn(true);
                    setUsername(result.user.nama || username);
                    setIsLoginModalOpen(false);
                    setPassword("");
                  } else {
                    setLoginError(result.message || "Login failed");
                  }
                }}
              >
                <div className="bg-[#cbdceb] px-6 py-6 flex flex-col gap-5 border-y border-slate-300 shadow-inner">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-700 w-24">
                      Username :
                    </label>
                    <input
                      name="username"
                      type="text"
                      className="flex-1 bg-gradient-to-b from-slate-50 to-slate-200 border border-slate-400 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-inner text-slate-700 font-medium"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoFocus
                      required
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-700 w-24">
                      Password :
                    </label>
                    <input
                      name="password"
                      type="password"
                      className="flex-1 bg-gradient-to-b from-slate-50 to-slate-200 border border-slate-400 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-inner text-slate-700 font-medium"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  {loginError && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[10px] text-red-600 font-bold text-center bg-red-50 py-1 rounded border border-red-200"
                    >
                      {loginError}
                    </motion.p>
                  )}
                </div>

                <div className="bg-white px-6 py-4 flex items-center justify-center">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center gap-3 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-full py-2.5 px-6 transition-all shadow-md text-sm font-bold active:scale-95 disabled:opacity-50"
                  >
                    <FaLock
                      className={`text-white/80 text-base ${isLoading ? "animate-pulse" : ""}`}
                    />
                    {isLoading ? "Memproses..." : "Masuk"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Subcomponents

function TopMenuItem({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <motion.button
      whileHover={{ backgroundColor: "rgba(255,255,255,0.15)" }}
      transition={{ duration: 0.1 }}
      className="flex items-center gap-1 lg:gap-2 px-3 py-0.5 lg:py-1 rounded-lg text-[10px] lg:text-xs font-medium transition-colors duration-150 hover:shadow-sm"
    >
      <span className="text-sm lg:text-base drop-shadow-md">{icon}</span>
      <span className="drop-shadow-sm">{label}</span>
    </motion.button>
  );
}

function SecondaryMenuItem({
  icon,
  label,
  isRed,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  isRed?: boolean;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{
        backgroundColor: isRed
          ? "rgba(254,226,226,0.5)"
          : "rgba(209,250,229,0.3)",
      }}
      transition={{ duration: 0.1 }}
      className={`group flex flex-col items-center justify-center gap-1 min-w-[70px] lg:min-w-[76px] p-1 lg:p-2 rounded-xl transition-all duration-150 border ${active ? "border-brand-200 bg-brand-50/60 shadow-sm" : "border-transparent"} hover:border-brand-100 hover:shadow-sm relative overflow-hidden`}
    >
      <span
        className={`text-xl lg:text-2xl drop-shadow-sm z-10 ${active && !isRed ? "text-brand-600" : ""}`}
      >
        {icon}
      </span>
      <span
        className={`text-[10px] lg:text-[11px] font-bold z-10 ${isRed ? "text-red-600" : active ? "text-brand-700" : "text-slate-600 group-hover:text-brand-700"}`}
      >
        {label}
      </span>
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-0"></div>
    </motion.button>
  );
}

function ContextMenuItem({
  icon,
  label,
  onClick,
  isRed,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  isRed?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${isRed ? "hover:bg-red-50 hover:text-red-600" : "hover:bg-brand-50 hover:text-brand-700"} text-slate-700`}
    >
      <span className="text-base w-5 text-center flex justify-center drop-shadow-sm">
        {icon}
      </span>
      <span className="font-semibold">{label}</span>
    </button>
  );
}
