"use client";
import { API_BASE_URL } from "@/lib/api";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Image from "next/image";
import {
  User,
  Settings,
  LogOut,
  FileText,
  Home,
  Briefcase,
  AlertCircle,
  ChevronDown,
  Menu,
  X,
  ClipboardList,
  BarChart3,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import companyLogo from "../../assets/companyLogo2.png";

// ─── Nav link used on desktop ─────────────────────────────────────────────────
function NavLink({ icon: Icon, label, href, onClick }) {
  const content = (
    <div className="group flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-900 font-semibold text-[0.95rem] hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 relative cursor-pointer">
      {Icon && <Icon className="w-4 h-4 text-gray-700 group-hover:text-blue-600 transition-colors duration-200" />}
      {label}
      {/* animated underline */}
      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 bg-blue-600 rounded-full group-hover:w-4/5 transition-all duration-300" />
    </div>
  );

  if (href) {
    return <Link href={href} onClick={onClick}>{content}</Link>;
  }

  return (
    <button onClick={onClick} className="outline-none">
      {content}
    </button>
  );
}

// ─── Mobile drawer item ───────────────────────────────────────────────────────
function DrawerItem({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-5 py-3 text-gray-700 font-medium text-[0.95rem] hover:bg-blue-50 hover:text-blue-700 transition-all duration-150 rounded-lg"
    >
      {Icon && <Icon className="w-5 h-5 text-gray-400" />}
      {label}
    </button>
  );
}

export default function Header() {
  const [theme, setTheme] = useState("light");
  const router = useRouter();
  const [salesperson, setSalesperson] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileReportsOpen, setMobileReportsOpen] = useState(false);
  const drawerRef = useRef(null);

  useEffect(() => {
    const salespersonDetails = localStorage.getItem("userDetails");
    if (salespersonDetails) {
      setSalesperson(JSON.parse(salespersonDetails));
    }
  }, []);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.toggle("dark", storedTheme === "dark");
    } else {
      setTheme("light");
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
    }
  }, []);

  // Close drawer on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setDrawerOpen(false);
      }
    };
    if (drawerOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [drawerOpen]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  const isAdmin = salesperson.role === "admin";
  const isSalesperson = salesperson.role === "salesperson";

  const handleRouter = () => {
    setDrawerOpen(false);
    if (salesperson.role === "admin") router.push("/admin");
    else if (salesperson.role === "production") router.push("/production");
    else if (salesperson.role === "salesperson") router.push("/");
    else router.push("/login");
  };

  const handleReportNavigation = (reportType, subType = null) => {
    setDrawerOpen(false);
    const basePath = "mes/report";
    router.push(subType ? `${basePath}/${reportType}/${subType}` : `${basePath}/${reportType}`);
  };

  const navigate = (path) => {
    setDrawerOpen(false);
    router.push(path);
  };

  const handleOnClickLogout = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get(`${API_BASE_URL}/common/logoutUser`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.status === 200) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userDetails");
        router.push("/login");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const packingSubItems = [
    { label: "FG", key: "fgEntry" },
    { label: "Wip B-Grade", key: "wipBgradeEntry" },
    { label: "Wip Rejection", key: "wipRejectionEntry" },
    { label: "FG Rejection", key: "fgRejectionEntry" },
  ];

  return (
    <>
      <header className="bg-white dark:bg-gray-950 sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Image
              src={companyLogo}
              alt="Company Logo"
              width={120}
              height={40}
              className="dark:invert cursor-pointer"
              style={{ height: "auto" }}
              priority
              onClick={handleRouter}
            />
          </div>

          {/* ── Desktop Nav ── */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink icon={Home} label="Home" onClick={handleRouter} />
            <NavLink icon={Briefcase} label="Order" href="/OrderDetails" />

            {/* Reports: salesperson sees only Stock link, others get full dropdown */}
            {isSalesperson ? (
              <NavLink icon={FileText} label="Stock" onClick={() => handleReportNavigation("mCodeStockReport")} />
            ) : (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="group flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-900 font-semibold text-[0.95rem] hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 relative outline-none">
                      <FileText className="w-4 h-4 text-gray-700 group-hover:text-blue-600 transition-colors duration-200" />
                      Reports
                      <ChevronDown className="w-3.5 h-3.5 text-gray-600 group-hover:text-blue-600 transition-all duration-200 group-data-[state=open]:rotate-180" />
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 bg-blue-600 rounded-full group-hover:w-4/5 transition-all duration-300" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 shadow-xl border border-gray-100 rounded-xl p-1" align="center" sideOffset={8}>
                    <DropdownMenuItem
                      className="rounded-lg cursor-pointer text-sm font-medium"
                      onClick={() => handleReportNavigation("production")}
                    >
                      Production Report
                    </DropdownMenuItem>

                    {/* {isAdmin && (
                      <DropdownMenuItem
                        className="rounded-lg cursor-pointer text-sm font-semibold text-blue-600 flex items-center gap-1.5"
                        onClick={() => { setDrawerOpen(false); router.push("/admin/production-analytics"); }}
                      >
                        <BarChart3 className="w-4 h-4" /> Production Analytics
                      </DropdownMenuItem>
                    )} */}

                    <DropdownMenuItem
                      className="rounded-lg cursor-pointer text-sm font-medium"
                      onClick={() => handleReportNavigation("breakdown")}
                    >
                      Breakdown
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="rounded-lg cursor-pointer text-sm font-medium">
                        Packing
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="shadow-xl border border-gray-100 rounded-xl p-1">
                        {packingSubItems.map((item) => (
                          <DropdownMenuItem
                            key={item.key}
                            className="rounded-lg cursor-pointer text-sm"
                            onClick={() => handleReportNavigation(item.key)}
                          >
                            {item.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    <DropdownMenuItem
                      className="rounded-lg cursor-pointer text-sm font-medium"
                      onClick={() => handleReportNavigation("mCodeStockReport")}
                    >
                      Stock
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="rounded-lg cursor-pointer text-sm font-medium"
                      onClick={() => handleReportNavigation("dispatchOut")}
                    >
                      Dispatch
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <NavLink icon={ClipboardList} label="Purchase Order" href="/purchaseOrder" />
              </>
            )}

            <NavLink icon={AlertCircle} label="Issues" href="/IssueTracker" />
          </nav>

          {/* ── Right side: theme + avatar + hamburger ── */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full text-base hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Toggle theme"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </Button>

            {/* Avatar dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-950 transition-all hover:ring-blue-600 focus:outline-none">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={salesperson.avatarUrl || "https://www.flaticon.com/free-icon/person_15491621"}
                      alt={salesperson.name}
                    />
                    <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-xs">
                      {salesperson.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 shadow-xl border border-gray-100 rounded-xl" align="end" forceMount>
                <DropdownMenuLabel className="font-normal px-3 py-2">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-semibold text-gray-800">{salesperson.name}</p>
                    <p className="text-xs text-muted-foreground">Job ID: {salesperson.jobId}</p>
                    {!isAdmin && (
                      <p className="text-xs text-muted-foreground">Area: {salesperson.area}</p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg text-sm"
                  onClick={() => router.push("/changePassword")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Change Password
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem
                    className="cursor-pointer rounded-lg text-sm"
                    onClick={() => router.push("/changePasswordByAdmin")}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Admin Change Password
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg text-sm text-red-600 focus:text-red-600 focus:bg-red-50"
                  onClick={handleOnClickLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Hamburger — mobile only */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setDrawerOpen(!drawerOpen)}
              aria-label="Toggle menu"
            >
              {drawerOpen
                ? <X className="w-5 h-5 text-gray-700 dark:text-white" />
                : <Menu className="w-5 h-5 text-gray-700 dark:text-white" />
              }
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      {/* Backdrop */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        className={`md:hidden fixed top-0 left-0 z-50 h-full w-[72vw] max-w-[300px] bg-white dark:bg-gray-950 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-gray-100 dark:border-gray-800">
          <Image
            src={companyLogo}
            alt="Logo"
            width={100}
            height={32}
            className="dark:invert"
            style={{ height: "auto" }}
          />
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-white" />
          </button>
        </div>

        {/* User info pill */}
        <div className="mx-4 mt-4 mb-2 flex items-center gap-3 bg-blue-50 dark:bg-blue-950 rounded-xl px-4 py-3">
          <Avatar className="h-9 w-9 ring-2 ring-blue-400">
            <AvatarImage src={"https://www.flaticon.com/free-icon/person_15491621" || "https://github.com/shadcn.png"} />
            <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-xs">
              {salesperson.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-white">{salesperson.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{salesperson.role}</p>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-1 px-3 py-2 flex-1 overflow-y-auto">
          <DrawerItem icon={Home} label="Home" onClick={handleRouter} />
          <DrawerItem icon={Briefcase} label="Order" onClick={() => navigate("/OrderDetails")} />

          {/* Reports: salesperson sees only Stock link, others get full accordion */}
          {isSalesperson ? (
            <DrawerItem icon={FileText} label="Stock" onClick={() => handleReportNavigation("mCodeStockReport")} />
          ) : (
            <div>
              <button
                onClick={() => setMobileReportsOpen(!mobileReportsOpen)}
                className="w-full flex items-center gap-3 px-5 py-3 text-gray-700 dark:text-gray-300 font-medium text-[0.95rem] hover:bg-blue-50 hover:text-blue-700 transition-all duration-150 rounded-lg"
              >
                <FileText className="w-5 h-5 text-gray-400" />
                <span className="flex-1 text-left">Reports</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${mobileReportsOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Accordion content */}
              <div className={`overflow-hidden transition-all duration-300 ${mobileReportsOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="pl-4 flex flex-col gap-1 pt-1 pb-2">
                  <button
                    onClick={() => handleReportNavigation("production")}
                    className="w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    Production Report
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => navigate("/admin/production-analytics")}
                      className="w-full text-left px-4 py-2 text-sm text-blue-600 font-semibold hover:bg-blue-50 rounded-lg transition-all"
                    >
                      Production Analytics
                    </button>
                  )}

                  {/* Packing sub-group */}
                  <p className="px-4 pt-1 text-[0.7rem] font-semibold text-gray-400 uppercase tracking-widest">Packing</p>
                  {packingSubItems.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => handleReportNavigation(item.key)}
                      className="w-full text-left px-6 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      {item.label}
                    </button>
                  ))}

                  <button
                    onClick={() => handleReportNavigation("mCodeStockReport")}
                    className="w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    Stock
                  </button>
                  <button
                    onClick={() => handleReportNavigation("dispatchOut")}
                    className="w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    Dispatch
                  </button>
                  <button
                    onClick={() => handleReportNavigation("breakdown")}
                    className="w-full text-left px-4 py-2 text-sm text-orange-600 font-medium hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-all"
                  >
                    Breakdown
                  </button>
                </div>
              </div>
              <DrawerItem icon={ClipboardList} label="Purchase Order" onClick={() => navigate("/purchaseOrder")} />
            </div>
          )}

          <DrawerItem icon={AlertCircle} label="Issues" onClick={() => navigate("/IssueTracker")} />
        </nav>

        {/* Drawer footer */}
        <div className="border-t border-gray-100 dark:border-gray-800 px-3 py-3 flex flex-col gap-1">
          <button
            onClick={() => { setDrawerOpen(false); router.push("/changePassword"); }}
            className="w-full flex items-center gap-3 px-5 py-3 text-gray-700 dark:text-gray-300 font-medium text-[0.95rem] hover:bg-gray-50 hover:text-gray-900 transition-all duration-150 rounded-lg"
          >
            <Settings className="w-5 h-5 text-gray-400" />
            Change Password
          </button>
          <button
            onClick={() => { setDrawerOpen(false); handleOnClickLogout(); }}
            className="w-full flex items-center gap-3 px-5 py-3 text-red-500 font-medium text-[0.95rem] hover:bg-red-50 transition-all duration-150 rounded-lg"
          >
            <LogOut className="w-5 h-5" />
            Log out
          </button>
        </div>
      </div>
    </>
  );
}