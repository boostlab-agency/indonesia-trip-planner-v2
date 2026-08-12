import {
  Home,
  Map,
  Image as ImageIcon,
  BedDouble,
  Plane,
  Compass,
  Wallet,
  Link2,
  MapPin,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const ALL_NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/route", label: "Route", icon: Map },
  { href: "/album", label: "Reisalbum", icon: ImageIcon },
  { href: "/accommodations", label: "Accommodaties", icon: BedDouble },
  { href: "/transport", label: "Vervoer", icon: Plane },
  { href: "/activities", label: "Activiteiten", icon: Compass },
  { href: "/budget", label: "Budget", icon: Wallet },
  { href: "/links", label: "Links", icon: Link2 },
  { href: "/destinations", label: "Bestemmingen", icon: MapPin },
];

export const PRIMARY_MOBILE_HREFS = ["/", "/route", "/budget", "/album"];
