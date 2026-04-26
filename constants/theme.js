// constants/theme.js
// PanditConnect — Clean White + Ochre palette
// Modern spiritual aesthetic: clean whites, warm ochre accents,
// saffron highlights, deep brown text. Feels trustworthy + devotional.

export const COLORS = {
  // ── Backgrounds ───────────────────────────────
  bg: "#FFFBF5",           // warm white — main background
  bgCard: "#FFFFFF",       // pure white cards
  bgElevated: "#FFF5E6",   // warm cream — elevated surfaces
  bgOchre: "#F5E6C8",      // ochre tint — section highlights

  // ── Ochre / Primary accent ────────────────────
  ochre: "#C17F24",        // primary ochre — CTAs, active states
  ochreLight: "#E8A835",   // lighter ochre — highlights
  ochreDim: "#D4A55A",     // dimmed ochre — secondary
  ochrePale: "#FDF0D5",    // very pale ochre — subtle backgrounds

  // ── Saffron / Secondary accent ────────────────
  saffron: "#E8650A",      // saffron orange — badges, tags
  saffronDim: "#F5A06A",   // lighter saffron
  saffronPale: "#FEF0E6",  // pale saffron bg

  // ── Text ──────────────────────────────────────
  textPrimary: "#1A1208",  // very dark brown — headings
  textSecondary: "#5C4A2A", // medium brown — body text
  textDim: "#9C8A6A",      // dim brown — placeholders, captions
  textLight: "#C4B49A",    // light — disabled states

  // ── Status ────────────────────────────────────
  success: "#2D7D46",      // green — verified, completed
  successBg: "#EBF5EE",
  warning: "#C17F24",      // ochre — pending
  warningBg: "#FDF0D5",
  error: "#C0392B",        // red — errors, cancelled
  errorBg: "#FCECEA",
  info: "#1A5F8A",         // blue — information
  infoBg: "#E8F2FA",

  // ── Booking Status colors ─────────────────────
  statusPending: "#C17F24",
  statusAccepted: "#1A5F8A",
  statusInProgress: "#7B3FA0",
  statusCompleted: "#2D7D46",
  statusCancelled: "#C0392B",

  // ── UI ────────────────────────────────────────
  border: "#EAD9B8",       // warm border
  borderLight: "#F5ECD8",  // lighter border
  divider: "#F0E4CC",
  overlay: "rgba(26,18,8,0.55)",
  modalBg: "rgba(26,18,8,0.6)",

  // ── Rating stars ──────────────────────────────
  star: "#E8A835",
  starEmpty: "#EAD9B8",

  isDarkMode: false,
};

export const FONTS = {
  heading: "Cinzel_600SemiBold",
  headingBold: "Cinzel_700Bold",
  body: "Nunito_400Regular",
  bodyMedium: "Nunito_600SemiBold",
  bodyBold: "Nunito_700Bold",
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 6,
  md: 12,
  lg: 18,
  xl: 24,
  xxl: 32,
  full: 999,
};

export const SHADOWS = {
  sm: {
    shadowColor: "#1A1208",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  md: {
    shadowColor: "#1A1208",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor: "#1A1208",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  ochre: {
    shadowColor: "#C17F24",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
};

// Booking status display config
export const STATUS_CONFIG = {
  pending_pandit: {
    label: "Awaiting Confirmation",
    color: "#C17F24",
    bg: "#FDF0D5",
    emoji: "⏳",
  },
  accepted: {
    label: "Confirmed",
    color: "#1A5F8A",
    bg: "#E8F2FA",
    emoji: "✅",
  },
  in_progress: {
    label: "In Progress",
    color: "#7B3FA0",
    bg: "#F3EAF9",
    emoji: "🪔",
  },
  completed: {
    label: "Completed",
    color: "#2D7D46",
    bg: "#EBF5EE",
    emoji: "🙏",
  },
  cancelled_user: {
    label: "Cancelled",
    color: "#C0392B",
    bg: "#FCECEA",
    emoji: "✕",
  },
  cancelled_pandit: {
    label: "Declined",
    color: "#C0392B",
    bg: "#FCECEA",
    emoji: "✕",
  },
  expired: {
    label: "Expired",
    color: "#9C8A6A",
    bg: "#F5ECD8",
    emoji: "⌛",
  },
};

// Sampradaya display config
export const SAMPRADAYA_CONFIG = {
  Shaiva: { emoji: "🔱", color: "#7B3FA0" },
  Vaishnava: { emoji: "🪷", color: "#1A5F8A" },
  Shakta: { emoji: "🌺", color: "#C0392B" },
  Smartha: { emoji: "🕉️", color: "#2D7D46" },
  Other: { emoji: "🪔", color: "#C17F24" },
};
