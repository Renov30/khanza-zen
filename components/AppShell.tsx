"use client";

import React, { useState, useEffect, useCallback } from "react";
import { SettingProvider, useSetting } from "@/components/SettingContext";
import { ThemeProvider, useTheme } from "@/components/ThemeProvider";
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
  FaMoon,
  FaSun,
  FaChevronDown,
  FaSearch,
  FaBars,
  FaRobot,
} from "react-icons/fa";
import { loginAction, logoutAction } from "@/lib/actions/auth";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SettingProvider>
        <AppShellContent>{children}</AppShellContent>
      </SettingProvider>
    </ThemeProvider>
  );
}

function AppShellContent({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { instansi, logoUrl, layoutMode, toggleLayoutMode } = useSetting();
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
      className={`flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-900 dark:text-slate-100 font-sans relative ${
        layoutMode === "classic" ? "flex-col" : "flex-row"
      }`}
      onContextMenu={handleContextMenu}
    >
      {layoutMode === "classic" ? (
        <>
          {/* Toolbar */}
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="bg-gradient-to-r from-brand-700 via-brand-600 to-brand-800 dark:bg-slate-800/80 dark:[background-image:none] dark:backdrop-blur-md text-white dark:text-slate-200 flex overflow-x-auto whitespace-nowrap px-2 py-0.5 lg:py-1 shadow-md z-30 border-b border-brand-500/50 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="flex items-center gap-1 w-max">
              <ToolbarMenuItem
                icon={<FaKey className="text-yellow-400" />}
                label="Program"
              />
              <ToolbarMenuItem
                icon={<FaInfoCircle className="text-orange-400" />}
                label="Informasi"
              />
              <ToolbarMenuItem
                icon={<FaDesktop className="text-green-300" />}
                label="Antrian"
              />
              <ToolbarMenuItem
                icon={<FaBell className="text-pink-300" />}
                label="Notifikasi"
              />
              <ToolbarMenuItem
                icon={<FaQuestionCircle className="text-sky-300" />}
                label="Bantuan"
              />
              <ToolbarMenuItem
                icon={<FaCommentDots className="text-teal-300" />}
                label="Tanya AI"
              />
              <ToolbarMenuItem
                icon={<FaBook className="text-blue-200" />}
                label="Tentang"
              />
            </div>
          </motion.nav>

          {/* Shortcutbar */}
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-brand-100 dark:border-slate-700 flex items-center px-2 md:px-4 shadow-sm z-20 relative"
          >
            {/* Container Menu Geser */}
            <div className="flex-1 flex items-center gap-0.5 md:gap-1 overflow-x-auto py-0.5 md:py-1 lg:py-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <Link href="/daftar-menu">
                <ShortcutMenuItem
                  icon={
                    <FaThLarge className="text-slate-500 hover:transition-colors" />
                  }
                  label="Menu"
                  active={pathname === "/daftar-menu"}
                />
              </Link>
              <div className="w-px h-6 md:h-8 lg:h-10 bg-brand-100 mx-1 md:mx-2 self-center shrink-0"></div>
              <Link href="/">
                <ShortcutMenuItem
                  icon={
                    <FaHome className="text-slate-500 hover:transition-colors" />
                  }
                  label="Home"
                  active={pathname === "/"}
                />
              </Link>
              <Link href="/registrasi">
                <ShortcutMenuItem
                  icon={
                    <FaIdCard className="text-slate-500 hover:transition-colors" />
                  }
                  label="Registrasi"
                  active={pathname === "/registrasi"}
                />
              </Link>
              <ShortcutMenuItem
                icon={
                  <FaAmbulance className="text-slate-500 hover:transition-colors" />
                }
                label="IGD/UGD"
              />
              <ShortcutMenuItem
                icon={
                  <FaFlask className="text-slate-500 hover:transition-colors" />
                }
                label="Laborat"
              />
              <ShortcutMenuItem
                icon={
                  <FaRadiation className="text-slate-500 hover:transition-colors" />
                }
                label="Radiologi"
              />
              <ShortcutMenuItem
                icon={
                  <FaPills className="text-slate-500 hover:transition-colors" />
                }
                label="Farmasi"
              />
              <Link href="/rawat-inap">
                <ShortcutMenuItem
                  icon={
                    <FaBed className="text-slate-500 hover:transition-colors" />
                  }
                  label="Rawat Inap"
                  active={pathname === "/rawat-inap"}
                />
              </Link>
              <ShortcutMenuItem
                icon={
                  <FaWheelchair className="text-slate-500 hover:transition-colors" />
                }
                label="Rawat Jalan"
              />
            </div>

            {/* Container Profil User Tetap (Tanpa Clipping Overflow) */}
            <div className="flex items-center pl-4">
              {!isLoggedIn ? (
                <ShortcutMenuItem
                  icon={
                    <FaSignInAlt className="text-slate-500 group-hover:text-brand-600 transition-colors" />
                  }
                  label="Log In"
                  onClick={() => setIsLoginModalOpen(true)}
                />
              ) : (
                <ProfileMenu
                  username={username}
                  isOpen={isAccountMenuOpen}
                  onToggle={setIsAccountMenuOpen}
                  onLogout={handleLogout}
                />
              )}
            </div>
          </motion.nav>

          {/* Area Konten Utama */}
          <main className="flex-1 relative w-full h-full overflow-hidden bg-brand-50/30 dark:bg-slate-900">
            <div className="absolute inset-0 w-full h-full">{children}</div>
          </main>
        </>
      ) : (
        <>
          {/* Zen Left Sidebar */}
          <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700/80 flex flex-col justify-between h-full z-30 shrink-0 shadow-[4px_0_12px_-5px_rgba(0,0,0,0.03)] transition-all duration-300">
            {/* Logo Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-700/50">
              <Link href="/" className="flex items-center gap-3">
                <img
                  src={logoUrl}
                  alt="Logo RS"
                  className="h-10 w-10 rounded-full object-cover border border-slate-100 dark:border-slate-600 shadow-sm shrink-0 bg-white"
                />
                <div className="flex flex-col min-w-0">
                  <span className="font-extrabold text-teal-600 dark:text-teal-400 text-sm tracking-tight leading-tight uppercase">
                    SIMRS-ZEN
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
                    {instansi?.namaInstansi || "RS SIMRS KHANZA"}
                  </span>
                </div>
              </Link>
            </div>

            {/* Sidebar Navigation */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {/* Group 1: PENDAFTARAN & PASIEN */}
              <div className="space-y-1">
                <span className="px-3 text-[10px] font-extrabold tracking-wider text-slate-400 dark:text-slate-500 uppercase block mb-1">
                  Pendaftaran & Pasien
                </span>
                <SidebarLink href="/" icon={<FaHome />} label="Beranda" active={pathname === "/"} />
                <SidebarLink href="/registrasi" icon={<FaIdCard />} label="Registrasi" active={pathname === "/registrasi"} />
                <SidebarLink href="#" icon={<FaAmbulance />} label="IGD/UGD" />
                <SidebarLink href="/rawat-inap" icon={<FaBed />} label="Rawat Inap" active={pathname === "/rawat-inap"} />
                <SidebarLink href="#" icon={<FaWheelchair />} label="Rawat Jalan" />
              </div>

              {/* Group 2: LAYANAN MEDIS */}
              <div className="space-y-1">
                <span className="px-3 text-[10px] font-extrabold tracking-wider text-slate-400 dark:text-slate-500 uppercase block mb-1">
                  Layanan Medis
                </span>
                <SidebarLink href="#" icon={<FaFlask />} label="Laboratorium" />
                <SidebarLink href="#" icon={<FaRadiation />} label="Radiologi" />
                <SidebarLink href="#" icon={<FaPills />} label="Farmasi" />
                <SidebarLink href="#" icon={<FaLaptopMedical />} label="Rawat Intensif" />
              </div>

              {/* Group 3: LAINNYA */}
              <div className="space-y-1">
                <span className="px-3 text-[10px] font-extrabold tracking-wider text-slate-400 dark:text-slate-500 uppercase block mb-1">
                  Lainnya
                </span>
                <SidebarLink href="#" icon={<FaDesktop />} label="Antrian" />
                <SidebarLink href="#" icon={<FaInfoCircle />} label="Informasi" />
                <SidebarLink href="#" icon={<FaBell />} label="Notifikasi" />
                <SidebarLink href="/daftar-menu" icon={<FaThLarge />} label="Laporan" active={pathname === "/daftar-menu"} />
                <SidebarLink href="/setting" icon={<FaCog />} label="Pengaturan" active={pathname === "/setting"} />
              </div>
            </div>

            {/* Sidebar Footer Card */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/20">
              <div className="bg-[#e6f4f1] dark:bg-slate-700/30 p-3 rounded-2xl flex items-center gap-3 border border-teal-100/50 dark:border-slate-700/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-teal-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform" />
                <img
                  src="/img/medical_robot.png"
                  alt="Assistant Robot"
                  className="h-10 w-10 shrink-0 object-contain drop-shadow-md"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-teal-800 dark:text-teal-400 leading-tight">
                    SIMRS-ZEN
                  </span>
                  <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400 leading-normal truncate">
                    Sistem Informasi Manajemen
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* Zen Right Area */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Topbar */}
            <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between px-6 z-20 shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              {/* Topbar Left */}
              <div className="flex items-center gap-4">
                <button className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
                  <FaBars className="text-base" />
                </button>
                <h1 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 tracking-tight capitalize">
                  {getPageTitle(pathname)}
                </h1>
              </div>

              {/* Topbar Middle (Search Mock) */}
              <div className="hidden md:flex items-center relative w-96 max-w-md">
                <FaSearch className="absolute left-3 text-slate-400 dark:text-slate-500 text-xs" />
                <input
                  type="text"
                  placeholder="Cari menu atau data..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full pl-9 pr-14 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium placeholder-slate-400 dark:placeholder-slate-500 text-slate-700 dark:text-slate-200"
                />
                <span className="absolute right-3 bg-slate-200/80 dark:bg-slate-700 text-[9px] font-bold text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-300/40 dark:border-slate-600/40">
                  Ctrl + K
                </span>
              </div>

              {/* Topbar Right */}
              <div className="flex items-center gap-4">
                {/* Notification Button */}
                <button className="relative text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700">
                  <FaBell className="text-base" />
                  <span className="absolute top-1 right-1 bg-red-500 text-[8px] font-black text-white w-4 h-4 rounded-full flex items-center justify-center border border-white dark:border-slate-800">
                    3
                  </span>
                </button>

                {/* Profile Dropdown */}
                {!isLoggedIn ? (
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="flex items-center gap-2 bg-teal-50 hover:bg-teal-100 dark:bg-slate-700 dark:hover:bg-slate-600 text-teal-800 dark:text-slate-200 px-3 py-1.5 rounded-full text-xs font-bold transition-all border border-teal-100/50 dark:border-slate-600 shadow-sm"
                  >
                    <FaSignInAlt />
                    Masuk
                  </button>
                ) : (
                  <ProfileMenuZen
                    username={username}
                    isOpen={isAccountMenuOpen}
                    onToggle={setIsAccountMenuOpen}
                    onLogout={handleLogout}
                    layoutMode={layoutMode}
                    onToggleLayout={toggleLayoutMode}
                  />
                )}
              </div>
            </header>

            {/* Area Konten Utama */}
            <main className="flex-1 relative w-full h-full overflow-hidden bg-slate-50/10 dark:bg-slate-900/10 shadow-inner">
              <div className="absolute inset-0 w-full h-full">{children}</div>
            </main>
          </div>
        </>
      )}

      {/* Menu Konteks */}
      <AnimatePresence>
        {contextMenu.show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-brand-100 dark:border-slate-700 shadow-2xl rounded-xl py-2 min-w-[220px] flex flex-col text-sm font-medium overflow-hidden"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <div className="px-4 py-1.5 mb-1 border-b border-brand-50/50 dark:border-slate-700 flex items-center gap-2 bg-brand-50/30 dark:bg-slate-800">
              <FaLaptopMedical className="text-brand-600 dark:text-teal-400 text-lg" />
              <span className="text-[10px] font-extrabold text-brand-700 dark:text-brand-300 uppercase tracking-widest">
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
            <div className="w-full h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
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
            <div className="w-full h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
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
              className="bg-white dark:bg-slate-800 w-[380px] flex flex-col rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/50 dark:border-slate-700"
            >
              {/* Header Login */}
              <div className="bg-gradient-to-r from-brand-600 to-brand-700 dark:from-slate-700 dark:to-slate-800 px-6 py-4 flex items-center gap-3">
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
                <div className="bg-[#cbdceb] dark:bg-slate-700 px-6 py-6 flex flex-col gap-5 border-y border-slate-300 dark:border-slate-600 shadow-inner">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 w-24">
                      Username :
                    </label>
                    <input
                      name="username"
                      type="text"
                      className="flex-1 bg-gradient-to-b from-slate-50 to-slate-200 dark:from-slate-600 dark:to-slate-700 border border-slate-400 dark:border-slate-500 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-inner text-slate-700 dark:text-slate-200 font-medium"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoFocus
                      required
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 w-24">
                      Password :
                    </label>
                    <input
                      name="password"
                      type="password"
                      className="flex-1 bg-gradient-to-b from-slate-50 to-slate-200 dark:from-slate-600 dark:to-slate-700 border border-slate-400 dark:border-slate-500 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-inner text-slate-700 dark:text-slate-200 font-medium"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  {loginError && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[10px] text-red-600 font-bold text-center bg-red-50 dark:bg-red-900/50 py-1 rounded border border-red-200 dark:border-red-800"
                    >
                      {loginError}
                    </motion.p>
                  )}
                </div>

                <div className="bg-white dark:bg-slate-800 px-6 py-4 flex items-center justify-center">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center gap-3 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 dark:from-slate-700 dark:to-slate-600 text-white rounded-full py-2.5 px-6 transition-all shadow-md text-sm font-bold active:scale-95 disabled:opacity-50"
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

function ToolbarMenuItem({
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
      className="flex items-center gap-1 px-2 md:px-2 py-0.5 lg:py-1 rounded-lg text-[10px] lg:text-xs font-medium transition-colors duration-150 hover:shadow-sm"
    >
      <span className="text-sm md:text-xs">{icon}</span>
      <span className="hidden md:inline">{label}</span>
    </motion.button>
  );
}

function ShortcutMenuItem({
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
    <button
      onClick={onClick}
      className={`group flex flex-col items-center justify-center gap-0.5 md:gap-1 min-w-[44px] md:min-w-[70px] lg:min-w-[76px] p-1 md:p-2 rounded-xl transition-all duration-150 border ${active ? "border-brand-200 bg-brand-50/60 shadow-sm dark:bg-slate-800 dark:border-white/15" : "border-transparent"} hover:border-brand-100 hover:bg-brand-50/60 dark:hover:border-white/15 dark:hover:bg-slate-700 hover:shadow-sm`}
    >
      <span
        className={`text-lg md:text-xl lg:text-2xl drop-shadow-sm ${active && !isRed ? "text-brand-600" : "dark:text-slate-300"}`}
      >
        {icon}
      </span>
      <span
        className={`text-[10px] lg:text-xs font-bold hidden md:block ${isRed ? "text-red-600" : active ? "text-brand-700 dark:text-brand-400" : "text-slate-600 dark:text-slate-400 group-hover:text-brand-700 dark:group-hover:text-brand-400"}`}
      >
        {label}
      </span>
    </button>
  );
}

function ProfileMenu({
  username,
  isOpen,
  onToggle,
  onLogout,
}: {
  username: string;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  onLogout: () => void;
}) {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const router = useRouter();

  return (
    <div className="relative">
      <div
        className="flex items-center gap-3 px-3 py-1.5 cursor-pointer hover:bg-brand-100/40 dark:hover:bg-slate-700 rounded-xl transition-all duration-150 border border-transparent hover:border-brand-200/50 dark:hover:border-white/10 hover:shadow-sm group/account"
        onClick={(e) => {
          e.stopPropagation();
          onToggle(!isOpen);
        }}
      >
        <div className="flex flex-col items-end hidden md:flex">
          <span className="text-[14px] font-bold text-slate-600 dark:text-slate-200 max-w-[150px] truncate group-hover/account:text-brand-700 dark:group-hover/account:text-brand-400 transition-colors duration-150">
            {username || "User"}
          </span>
        </div>
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-brand-100 to-white dark:from-slate-700 dark:to-slate-800 flex items-center justify-center border border-brand-200 dark:border-slate-600 shadow-sm transition-all duration-150 group-hover/account:scale-105 group-hover/account:shadow-md group-hover/account:border-brand-300 dark:group-hover/account:border-slate-500">
          <FaUser className="text-brand-600 dark:text-slate-300 text-base md:text-xl drop-shadow-sm" />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-brand-100 dark:border-slate-700 py-2 z-[100] overflow-hidden"
          >
            <div className="px-4 py-2 border-b border-slate-50 dark:border-slate-700 mb-1 sm:hidden">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-100 block truncate">
                {username}
              </span>
              <span className="text-[10px] text-emerald-500">Online</span>
            </div>
            <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-slate-700 hover:text-brand-700 dark:hover:text-brand-400 flex items-center gap-3 transition-colors font-medium">
              <FaUser className="text-slate-400 dark:text-slate-300" />
              <span>Profile</span>
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-slate-700 hover:text-brand-700 dark:hover:text-brand-400 flex items-center gap-3 transition-colors font-medium">
              <FaBell className="text-slate-400 dark:text-slate-300" />
              <span>Notifications</span>
            </button>
            <button
              onClick={() => {
                router.push("/setting");
                onToggle(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-slate-700 hover:text-brand-700 dark:hover:text-brand-400 flex items-center gap-3 transition-colors font-medium"
            >
              <FaCog className="text-slate-400 dark:text-slate-300" />
              <span>Settings</span>
            </button>
            <button
              onClick={toggleDarkMode}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-slate-700 hover:text-brand-700 dark:hover:text-brand-400 flex items-center gap-3 transition-colors font-medium"
            >
              {isDarkMode ? (
                <FaMoon className="text-indigo-400" />
              ) : (
                <FaSun className="text-amber-400" />
              )}
              <span className="flex-1">Dark Mode</span>
              <div
                className={`w-9 h-5 rounded-full transition-colors relative ${
                  isDarkMode ? "bg-brand-600" : "bg-slate-300"
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-transform ${
                    isDarkMode ? "translate-x-[18px]" : "translate-x-[2px]"
                  }`}
                />
              </div>
            </button>
            <div className="h-px bg-slate-100 dark:bg-slate-700 my-1 mx-2"></div>
            <button
              onClick={onLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors font-bold"
            >
              <FaSignInAlt className="text-red-400 rotate-180" />
              <span>Log Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
      className={`w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${isRed ? "hover:bg-red-50 dark:hover:bg-red-900/50 hover:text-red-600" : "hover:bg-brand-50 dark:hover:bg-slate-700 hover:text-brand-700 dark:hover:text-brand-400"} text-slate-700 dark:text-slate-200`}
    >
      <span className="text-base w-5 text-center flex justify-center drop-shadow-sm">
        {icon}
      </span>
      <span className="font-semibold">{label}</span>
    </button>
  );
}

// ==========================================
// ZEN LAYOUT SUBCOMPONENTS
// ==========================================

function getPageTitle(pathname: string) {
  if (pathname === "/") return "Beranda";
  if (pathname === "/registrasi") return "Registrasi";
  if (pathname === "/rawat-inap") return "Rawat Inap";
  if (pathname === "/setting") return "Pengaturan";
  if (pathname === "/daftar-menu") return "Daftar Menu";
  return "Beranda";
}

function SidebarLink({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  const content = (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
        active
          ? "bg-teal-50 border-teal-100 text-teal-700 dark:bg-teal-950/40 dark:border-teal-900/60 dark:text-teal-400"
          : "border-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-800 dark:hover:text-slate-100"
      }`}
    >
      <span className={`text-base ${active ? "text-teal-600 dark:text-teal-400" : "text-slate-400"}`}>
        {icon}
      </span>
      <span>{label}</span>
    </div>
  );

  if (href === "#") {
    return <div className="cursor-not-allowed opacity-80">{content}</div>;
  }

  return <Link href={href}>{content}</Link>;
}

function ProfileMenuZen({
  username,
  isOpen,
  onToggle,
  onLogout,
  layoutMode,
  onToggleLayout,
}: {
  username: string;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  onLogout: () => void;
  layoutMode: "classic" | "zen";
  onToggleLayout: () => void;
}) {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const router = useRouter();

  // Get initials from username
  const initials = username
    ? username.split(" ").map(n => n[0]).join("").substring(0, 3).toUpperCase()
    : "SPV";

  return (
    <div className="relative">
      <div
        className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-600"
        onClick={(e) => {
          e.stopPropagation();
          onToggle(!isOpen);
        }}
      >
        <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-[9px] font-black shadow-sm border border-teal-500/20 uppercase">
          {initials}
        </div>
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 hidden sm:inline max-w-[100px] truncate">
          {username || "Supervisor"}
        </span>
        <FaChevronDown className="text-[10px] text-slate-400 hidden sm:inline shrink-0" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 py-2.5 z-[100] overflow-hidden"
          >
            <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 mb-1 flex flex-col">
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate block">
                {username}
              </span>
              <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Online
              </span>
            </div>

            <button className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-teal-600 dark:hover:text-teal-400 flex items-center gap-3 transition-colors font-bold">
              <FaUser className="text-slate-400" />
              <span>Profile</span>
            </button>

            <button
              onClick={() => {
                router.push("/setting");
                onToggle(false);
              }}
              className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-teal-600 dark:hover:text-teal-400 flex items-center gap-3 transition-colors font-bold"
            >
              <FaCog className="text-slate-400" />
              <span>Settings</span>
            </button>

            {/* Layout Toggle Option */}
            <button
              onClick={() => {
                onToggleLayout();
                onToggle(false);
              }}
              className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-teal-600 dark:hover:text-teal-400 flex items-center gap-3 transition-colors font-bold"
            >
              <FaDesktop className="text-teal-500" />
              <span>Tampilan Klasik</span>
            </button>

            <button
              onClick={toggleDarkMode}
              className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-teal-600 dark:hover:text-teal-400 flex items-center gap-3 transition-colors font-bold"
            >
              {isDarkMode ? <FaMoon className="text-indigo-400" /> : <FaSun className="text-amber-400" />}
              <span className="flex-1">Dark Mode</span>
              <div className={`w-8 h-4.5 rounded-full transition-colors relative ${isDarkMode ? "bg-teal-600" : "bg-slate-300"}`}>
                <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[2px] transition-transform ${isDarkMode ? "translate-x-[14px]" : "translate-x-[2px]"}`} />
              </div>
            </button>

            <div className="h-px bg-slate-100 dark:bg-slate-700 my-1 mx-2"></div>
            <button
              onClick={onLogout}
              className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-3 transition-colors font-extrabold"
            >
              <FaSignInAlt className="text-red-400 rotate-180" />
              <span>Log Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


