"use client";

import React, { useState, useEffect } from "react";
import { SettingProvider, useSetting } from "@/components/SettingContext";
import { ThemeProvider, useTheme } from "@/components/ThemeProvider";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaKey,
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
  useSetting();
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
      className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-900 dark:text-slate-100 font-sans relative flex-col"
      onContextMenu={handleContextMenu}
    >
      {/* Toolbar */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="bg-gradient-to-r from-brand-700 via-brand-600 to-brand-800 dark:bg-slate-800/80 dark:[background-image:none] dark:backdrop-blur-md text-white dark:text-slate-200 flex overflow-x-auto whitespace-nowrap px-2 py-0.5 lg:py-1 shadow-md z-30 border-b border-brand-500/50 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex items-center justify-center gap-1 w-full">
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
            icon={<FaCommentDots className="text-brand-300" />}
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
        className="bg-white/90 dark:bg-slate-800/70 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/50 flex items-center px-2 md:px-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] z-20 relative"
      >
        {/* Menu di kiri */}
        <div className="flex items-center gap-0.5 md:gap-1 shrink-0">
          <Link href="/daftar-menu">
            <ShortcutMenuItem
              icon={
                <FaThLarge className="text-slate-400 group-hover:text-brand-600 transition-colors" />
              }
              label="Menu"
              active={pathname === "/daftar-menu"}
            />
          </Link>
          <div className="w-px h-6 md:h-8 lg:h-10 bg-slate-200 dark:bg-slate-700 mx-1 md:mx-2 shrink-0"></div>
        </div>

        {/* Shortcut di tengah */}
        <div className="flex-1 flex items-center justify-center gap-0.5 md:gap-1 overflow-x-auto py-0.5 md:py-1 lg:py-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <Link href="/">
            <ShortcutMenuItem
              icon={
                <FaHome className="text-slate-400 group-hover:text-brand-600 transition-colors" />
              }
              label="Home"
              active={pathname === "/"}
            />
          </Link>
          <Link href="/registrasi">
            <ShortcutMenuItem
              icon={
                <FaIdCard className="text-slate-400 group-hover:text-brand-600 transition-colors" />
              }
              label="Registrasi"
              active={pathname === "/registrasi"}
            />
          </Link>
          <ShortcutMenuItem
            icon={
              <FaAmbulance className="text-slate-400 group-hover:text-brand-600 transition-colors" />
            }
            label="IGD/UGD"
          />
          <ShortcutMenuItem
            icon={
              <FaFlask className="text-slate-400 group-hover:text-brand-600 transition-colors" />
            }
            label="Laborat"
          />
          <ShortcutMenuItem
            icon={
              <FaRadiation className="text-slate-400 group-hover:text-brand-600 transition-colors" />
            }
            label="Radiologi"
          />
          <ShortcutMenuItem
            icon={
              <FaPills className="text-slate-400 group-hover:text-brand-600 transition-colors" />
            }
            label="Farmasi"
          />
          <Link href="/rawat-inap">
            <ShortcutMenuItem
              icon={
                <FaBed className="text-slate-400 group-hover:text-brand-600 transition-colors" />
              }
              label="Rawat Inap"
              active={pathname === "/rawat-inap"}
            />
          </Link>
          <ShortcutMenuItem
            icon={
              <FaWheelchair className="text-slate-400 group-hover:text-brand-600 transition-colors" />
            }
            label="Rawat Jalan"
          />
        </div>

        {/* Container Profil User Tetap */}
        <div className="flex items-center pl-4 border-l border-slate-200/70 dark:border-slate-700/50 ml-2 shrink-0">
          {!isLoggedIn ? (
            <ShortcutMenuItem
              icon={
                <FaSignInAlt className="text-slate-400 group-hover:text-brand-600 transition-colors" />
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
      <main className="flex-1 relative w-full h-full overflow-hidden bg-gradient-to-br from-slate-50/80 to-white dark:from-slate-900 dark:to-slate-900/95">
        <div className="absolute inset-0 w-full h-full">{children}</div>
      </main>

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
              <FaLaptopMedical className="text-brand-600 dark:text-brand-400 text-lg" />
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
      className={`group flex items-center gap-1 md:gap-1.5 px-1.5 md:px-2.5 py-1 md:py-1.5 rounded-lg transition-all duration-200 border ${
        active
          ? "border-brand-200 bg-brand-50/80 shadow-sm dark:border-brand-800 dark:bg-brand-950/30"
          : "border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 hover:shadow-sm"
      }`}
    >
      <span
        className={`text-sm md:text-base transition-transform duration-200 group-hover:scale-110 ${
          active && !isRed ? "text-brand-600 dark:text-brand-400" : "text-slate-400 dark:text-slate-500"
        }`}
      >
        {icon}
      </span>
      <span
        className={`text-[10px] md:text-xs font-semibold whitespace-nowrap transition-colors duration-200 ${
          isRed ? "text-red-600" : active ? "text-brand-700 dark:text-brand-400" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
        }`}
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
        className="flex items-center gap-2.5 px-2.5 py-1.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/80 rounded-2xl transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-sm group/account active:scale-[0.97]"
        onClick={(e) => {
          e.stopPropagation();
          onToggle(!isOpen);
        }}
      >
        <div className="flex flex-col items-end hidden sm:flex">
          <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 max-w-[140px] truncate group-hover/account:text-brand-600 dark:group-hover/account:text-brand-400 transition-colors duration-150">
            {username || "User"}
          </span>
          <span className="text-[9px] font-medium text-emerald-500 -mt-0.5">Online</span>
        </div>
        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 dark:from-brand-600 dark:to-brand-800 flex items-center justify-center border-2 border-white/80 dark:border-slate-600 shadow-md transition-all duration-200 group-hover/account:scale-110 group-hover/account:shadow-lg">
          <FaUser className="text-white text-sm md:text-base drop-shadow-sm" />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/70 dark:border-slate-700/60 py-1.5 z-[100] overflow-hidden backdrop-blur-xl"
          >
            <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700/50 mb-1">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block truncate">
                {username}
              </span>
              <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                Online
              </span>
            </div>
            <button className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-3 transition-all font-semibold rounded-lg">
              <FaUser className="text-slate-400 dark:text-slate-500 text-sm" />
              <span>Profile</span>
            </button>
            <button className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-3 transition-all font-semibold rounded-lg">
              <FaBell className="text-slate-400 dark:text-slate-500 text-sm" />
              <span>Notifications</span>
            </button>
            <button
              onClick={() => {
                router.push("/setting");
                onToggle(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-3 transition-all font-semibold rounded-lg"
            >
              <FaCog className="text-slate-400 dark:text-slate-500 text-sm" />
              <span>Settings</span>
            </button>
            <div className="h-px bg-slate-100 dark:bg-slate-700/50 my-1 mx-3"></div>
            <button
              onClick={toggleDarkMode}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-3 transition-all font-semibold rounded-lg"
            >
              {isDarkMode ? (
                <FaMoon className="text-indigo-400 text-sm" />
              ) : (
                <FaSun className="text-amber-400 text-sm" />
              )}
              <span className="flex-1">Dark Mode</span>
              <div
                className={`w-9 h-5 rounded-full transition-colors relative ${
                  isDarkMode ? "bg-brand-600" : "bg-slate-300"
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] shadow-sm transition-transform ${
                    isDarkMode ? "translate-x-[18px]" : "translate-x-[2px]"
                  }`}
                />
              </div>
            </button>
            <div className="h-px bg-slate-100 dark:bg-slate-700/50 my-1 mx-3"></div>
            <button
              onClick={onLogout}
              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-3 transition-all font-bold rounded-lg"
            >
              <FaSignInAlt className="text-red-400 rotate-180 text-sm" />
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




