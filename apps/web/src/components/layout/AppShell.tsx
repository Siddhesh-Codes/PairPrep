"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AppIcon, type AppIconName } from "@/components/icons/AppIcon";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useAuthStore } from "@/lib/auth-store";
import { api } from "@/lib/api";
import styles from "./AppShell.module.css";

const NAV_ITEMS: Array<{ href: string; label: string; icon: AppIconName }> = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/discover", label: "Discover", icon: "discover" },
  { href: "/matches", label: "Matches", icon: "matches" },
  { href: "/sessions", label: "Sessions", icon: "sessions" },
  { href: "/profile", label: "Profile", icon: "profile" },
];

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  referenceId: string | null;
  referenceType: string | null;
  read: boolean;
  createdAt: string;
}

export function AppShell({ children, title }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get<{ content: Notification[] }>('/api/v1/notifications?size=10');
      if (res && Array.isArray(res.content)) {
        setNotifications(res.content);
        const unread = res.content.filter(n => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const toggleDropdown = () => {
    if (!dropdownOpen) {
      fetchNotifications();
    }
    setDropdownOpen(!dropdownOpen);
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/api/v1/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.put(`/api/v1/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const [now, setNow] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
  }, []);

  const timeAgo = (dateStr: string) => {
    if (now === 0) return 'just now';
    const diff = now - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await api.get<{ count: number }>('/api/v1/notifications/unread-count');
        if (res && typeof res.count === 'number') {
          setUnreadCount(res.count);
        }
      } catch {
        // Silently ignore — API server may not be running during dev
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30_000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const getInitials = (name?: string) =>
    (name || "PairPrep")
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className={`${styles.shell} ${styles.centeredShell}`}>
        <div className={styles.loader}>
          <span>{isLoading ? "Loading PairPrep" : "Redirecting to login"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.shell} fb`}>
      <aside
        className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}
      >
        <Link
          href="/dashboard"
          className={styles.sidebarLogo}
          aria-label="PairPrep dashboard"
          onClick={() => setSidebarOpen(false)}
        >
          <img 
            src="/PairPrep.png" 
            className="w-8 h-8 rounded-xl bg-[#111] p-1 object-contain mr-2" 
            alt="PairPrep Logo" 
          />
          <span className="fd font-bold text-2xl tracking-tight" style={{ color: 'var(--text-primary)' }}>PairPrep</span>
        </Link>

        <nav className={styles.sidebarNav} aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
                onClick={() => setSidebarOpen(false)}
                aria-current={active ? "page" : undefined}
              >
                <span className={styles.navIcon}>
                  <AppIcon name={item.icon} size={19} />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.sidebarHint}>
            <span className={styles.hintLabel}>Practice loop</span>
            <span className={styles.hintText}>
              Match, schedule, review, improve.
            </span>
          </div>
          <div className={styles.userBlock}>
            <span className={styles.userAvatar}>
              {getInitials(user?.displayName)}
            </span>
            <span className={styles.userMeta}>
              <span className={styles.userName}>{user?.displayName}</span>
              <span className={styles.userEmail}>{user?.email}</span>
            </span>
          </div>
          <button
            className={styles.signOutButton}
            onClick={handleLogout}
            type="button"
          >
            Sign out
          </button>
        </div>
      </aside>

      <button
        type="button"
        className={`${styles.overlay} ${sidebarOpen ? styles.overlayVisible : ""}`}
        onClick={() => setSidebarOpen(false)}
        aria-label="Close navigation"
      />

      <main className={styles.main}>
        <header className={styles.header}>
          <button
            className={styles.menuButton}
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label="Toggle menu"
            type="button"
          >
            <AppIcon name="menu" size={22} />
          </button>
          <div className={styles.headerCopy}>
            <span className={styles.headerLabel}>Practice workspace</span>
            <h1 className={`${styles.headerTitle} fd`}>{title || "Dashboard"}</h1>
          </div>
          <div className={styles.headerActions}>
            {isAuthenticated && (
              <div className={styles.dropdownContainer} ref={dropdownRef}>
                <button
                  type="button"
                  className={styles.notificationBell}
                  onClick={toggleDropdown}
                  aria-label="Notifications"
                >
                  <AppIcon name="bell" size={20} />
                  {unreadCount > 0 && (
                    <span className={styles.badge}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {dropdownOpen && (
                  <div className={styles.notificationDropdown}>
                    <div className={styles.dropdownHeader}>
                      <span className={styles.dropdownTitle}>Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          className={styles.markAllReadBtn}
                          onClick={handleMarkAllRead}
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className={styles.dropdownList}>
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`${styles.dropdownItem} ${!n.read ? styles.dropdownItemUnread : ""}`}
                            onClick={() => !n.read && handleMarkRead(n.id)}
                          >
                            <div className={`${styles.itemDot} ${n.read ? styles.itemDotRead : ""}`} />
                            <div className={styles.dropdownItemContent}>
                              <div className={styles.dropdownItemTitle}>{n.title}</div>
                              <div className={styles.dropdownItemBody}>{n.body}</div>
                              <div className={styles.dropdownItemTime}>{timeAgo(n.createdAt)}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className={styles.dropdownEmpty}>
                          <AppIcon name="bell" size={24} className={styles.emptyBellIcon} />
                          <div className={styles.emptyTitle}>All caught up</div>
                          <div className={styles.emptyDesc}>No new notifications.</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            <ThemeToggle />
          </div>
        </header>

        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
