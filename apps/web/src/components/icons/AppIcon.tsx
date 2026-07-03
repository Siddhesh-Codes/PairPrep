import {
  ArrowRight,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  ClipboardCheck,
  Clock3,
  Code2,
  ExternalLink,
  Handshake,
  Inbox,
  type LucideIcon,
  type LucideProps,
  Menu,
  MessageCircle,
  Network,
  PencilLine,
  PlugZap,
  Search,
  Server,
  Sparkles,
  Star,
  Target,
  Trophy,
  User,
  UsersRound,
} from 'lucide-react';

export type AppIconName =
  | 'arrowRight'
  | 'availability'
  | 'bell'
  | 'calendar'
  | 'check'
  | 'clipboard'
  | 'clock'
  | 'coding'
  | 'dashboard'
  | 'discover'
  | 'external'
  | 'handshake'
  | 'inbox'
  | 'matches'
  | 'menu'
  | 'message'
  | 'network'
  | 'pencil'
  | 'plug'
  | 'profile'
  | 'server'
  | 'sessions'
  | 'sparkles'
  | 'star'
  | 'target'
  | 'trophy'
  | 'users';

const icons: Record<AppIconName, LucideIcon> = {
  arrowRight: ArrowRight,
  availability: CalendarDays,
  bell: Bell,
  calendar: CalendarDays,
  check: Check,
  clipboard: ClipboardCheck,
  clock: Clock3,
  coding: Code2,
  dashboard: BarChart3,
  discover: Search,
  external: ExternalLink,
  handshake: Handshake,
  inbox: Inbox,
  matches: Handshake,
  menu: Menu,
  message: MessageCircle,
  network: Network,
  pencil: PencilLine,
  plug: PlugZap,
  profile: User,
  server: Server,
  sessions: Target,
  sparkles: Sparkles,
  star: Star,
  target: Target,
  trophy: Trophy,
  users: UsersRound,
};

export function AppIcon({
  name,
  size = 20,
  strokeWidth = 1.9,
  ...props
}: LucideProps & { name: AppIconName }) {
  const Icon = icons[name];
  return <Icon aria-hidden="true" focusable="false" size={size} strokeWidth={strokeWidth} {...props} />;
}

export function interviewTypeIcon(iconName?: string, slug?: string): AppIconName {
  const value = `${iconName ?? ''} ${slug ?? ''}`.toLowerCase();

  if (value.includes('code') || value.includes('coding') || value.includes('dsa')) {
    return 'coding';
  }
  if (value.includes('server') || value.includes('backend')) {
    return 'server';
  }
  if (value.includes('architecture') || value.includes('system')) {
    return 'network';
  }
  if (value.includes('chat') || value.includes('behavior')) {
    return 'message';
  }

  return 'clipboard';
}

export function interviewTypeLabel(iconName?: string, slug?: string): string {
  const value = `${iconName ?? ''} ${slug ?? ''}`.toLowerCase();

  if (value.includes('code') || value.includes('coding') || value.includes('dsa')) {
    return 'Coding';
  }
  if (value.includes('server') || value.includes('backend')) {
    return 'Server';
  }
  if (value.includes('architecture') || value.includes('system')) {
    return 'Architecture';
  }
  if (value.includes('chat') || value.includes('behavior')) {
    return 'Behavioral';
  }

  return 'Practice';
}
