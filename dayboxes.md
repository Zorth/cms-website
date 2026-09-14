# Dayboxes Documentation

This document describes how **Dayboxes** work, how they are structured, and how their visual styling and status indicators are formatted across the **Guild of The Void** session interface.

---

## 1. Overview & Locations

Dayboxes represent single calendar days and are used in two primary views within the sessions view ([`components/sessions/Sessions.tsx`](file:///home/zorth/Projects/void-guild/components/sessions/Sessions.tsx)):

1. **5-Day Overview (`FiveDayOverview`)**: A horizontal row showing upcoming days (3 on mobile, 5 on desktop) above the main session list.
2. **Monthly Calendar Grid (`Calendar`)**: A 7-column grid (Mon–Sun) showing all days of the selected month.

---

## 2. Component Structure & Data Flow

Each Daybox calculates its state by cross-referencing:
- **Sessions on that day**: Sessions scheduled for the specific date.
- **User Ownership / Signups**: Whether the current user is hosting (GM) or signed up with one of their characters.
- **Player Availability**: Community members who marked themselves as available on that date.

---

## 3. Formatting & Visual Styling Rules

### **A. Border & Background Color States**

| Status | CSS Class / Styling | Visual Appearance | Trigger Condition |
| :--- | :--- | :--- | :--- |
| **Default** | `.day-box`, `border-border/60` | Subtle dark/muted border and semi-transparent background | Normal day with no active user involvement |
| **Joined Session** | `.day-box-joined` | Purple glowing border (`#D8B4FE`) + purple tinted background | User has a character signed up for a session on this day |
| **Owner / GM Session** | `.day-box-owner` | Gold metallic gradient border (`#BF953F` to `#FCF6BA`) | User is the session host/GM on this day |
| **Optimal Session Day** | `ring-2 ring-green-500/30` | Subtle green border ring + light green background tint | $\ge 4$ players available AND $\ge 1$ GM available (no active session yet) |
| **Available (Not Signed Up)** | `ring-2 ring-blue-500/40` | Subtle blue border ring + light blue background tint | User marked available on this day, a session is scheduled, but user hasn't joined |
| **Past Date** | `opacity-50 grayscale` | Dimmed out, non-clickable, disabled cursor | Date is prior to today |

---

## 4. Header & Content Formatting

### **A. Header Section (`.day-box-header`)**
- **Day Name / Number**: Displays the weekday (e.g. `Mon`, `Tue`) and numeric day of the month (e.g. `14`).
- **"Today" Label**: In `FiveDayOverview`, the first column displays a `TODAY` uppercase label above the header.
- **Pill Indicators (Dots)**:
  - **Green Dot (`bg-green-500`)**: Tooltip *"Optimal for a session!"* (GM + 3+ players ready).
  - **Blue Dot (`bg-blue-500`)**: Tooltip *"Available but not signed up!"*.

### **B. Content Section (`.day-box-content`)**
- **In `FiveDayOverview`**:
  - Displays clickable session cards scheduled for that day.
  - Showcases system logo (`/PFVoid.svg` or `/DnDVoid.svg`), quest name, and color-coded level badges (`getLevelBadgeStyle`).
- **In Monthly `Calendar`**:
  - Displays availability counts: e.g. `1 GM`, `3 PL`.
  - Text highlights in purple (`text-purple-400`) if the logged-in user is one of the available members.

---

## 5. Interaction & Dialog Triggers

- Clicking any active Daybox in the Monthly Calendar opens the **Availability Dialog** (`AvailabilityDialog`).
- The dialog allows players to toggle their availability status for that specific date (GM vs Player mode).
- Toggling availability uses **Optimistic UI updates** so the Daybox ring color and availability numbers reflect changes immediately before the Convex mutation finishes.
