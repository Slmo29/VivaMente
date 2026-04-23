// ─── Iconoir icon map — BrainTrainer ──────────────────────────────────────────
// Usa <AppIcon name="brain" size={32} color="#1891B1" /> nei componenti.

import {
  Brain,
  Trophy,
  Medal,
  Star,
  FireFlame,
  Calendar,
  Bell,
  Lock,
  WarningTriangle,
  CheckCircle,
  Phone,
  Mail,
  EditPencil,
  LightBulb,
  Link,
  Timer,
  Clock,
  User,
  ChatBubble,
  MessageText,
  StatsUpSquare,
  StatsReport,
  Gym,
  Sparks,
  ThumbsUp,
  Copy,
  Group,
  Heart,
  SunLight,
  Puzzle,
  Eye,
} from "iconoir-react";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IconComponent = React.ComponentType<any>;

export const ICON_MAP: Record<string, IconComponent> = {
  brain:    Brain,
  trophy:   Trophy,
  medal:    Medal,
  star:     Star,
  flame:    FireFlame,
  calendar: Calendar,
  bell:     Bell,
  lock:     Lock,
  warning:  WarningTriangle,
  check:    CheckCircle,
  phone:    Phone,
  mail:     Mail,
  edit:     EditPencil,
  bulb:     LightBulb,
  link:     Link,
  timer:    Timer,
  clock:    Clock,
  user:     User,
  chat:     ChatBubble,
  message:  MessageText,
  stats:    StatsReport,
  trending: StatsUpSquare,
  gym:      Gym,
  target:   Sparks,
  thumbsup: ThumbsUp,
  copy:     Copy,
  group:    Group,
  heart:    Heart,
  sun:      SunLight,
  puzzle:   Puzzle,
  eye:      Eye,
};

interface AppIconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export function AppIcon({
  name,
  size = 24,
  color = "#1891B1",
  strokeWidth = 1.5,
  className,
}: AppIconProps) {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return (
    <Icon
      width={size}
      height={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
    />
  );
}
