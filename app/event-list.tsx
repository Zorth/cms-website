'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Calendar as CalendarIcon, Clock, ChevronRight, Users, Sparkles, ExternalLink } from 'lucide-react';
import VoidLogo from '../public/images/Void_Logo_WhiteTransparent.png';

interface EventListProps {
  locale?: string;
}

interface GuildSession {
  _id: string;
  date?: number;
  system?: 'PF' | 'DnD' | string;
  level?: number;
  questId?: string;
  questName?: string | null;
  maxPlayers?: number;
  characters?: string[];
  location?: string;
  locked?: boolean;
  planning?: boolean;
}

type UnifiedItem = 
  | { kind: 'convex'; data: any; sortDate: Date }
  | { kind: 'guild'; data: GuildSession; sortDate: Date };

export default function EventList({ locale = 'nl' }: EventListProps) {
  // Brussels time calculations
  const [nowDate, setNowDate] = useState<Date>(() => new Date());
  const [guildSessions, setGuildSessions] = useState<GuildSession[]>([]);

  useEffect(() => {
    const updateNow = () => setNowDate(new Date());
    const interval = setInterval(updateNow, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch upcoming sessions from Guild API
  useEffect(() => {
    let isCancelled = false;
    async function fetchGuildSessions() {
      try {
        const res = await fetch('https://guild.tarragon.be/api/external/v1/sessions?past=false');
        if (!res.ok) return;
        const data = await res.json();
        if (!isCancelled && Array.isArray(data)) {
          // Filter only sessions that have an explicit scheduled date
          const scheduled = data.filter((s: GuildSession) => typeof s.date === 'number' && !s.planning);
          setGuildSessions(scheduled);
        }
      } catch (err) {
        // Silently fail if external API is unreachable
        console.error('Failed to load Guild sessions:', err);
      }
    }
    fetchGuildSessions();
    const interval = setInterval(fetchGuildSessions, 120000); // refresh every 2 mins
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Compute fromDate (start of today) and sixMonthsLater ISO strings
  const { fromIso, sixMonthsIso, daysList } = useMemo(() => {
    const startOfToday = new Date(nowDate);
    startOfToday.setHours(0, 0, 0, 0);

    const sixMonthsLater = new Date(startOfToday);
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

    interface DayItem {
      date: Date;
      dateKey: string;
      isToday: boolean;
      weekdayShort: string;
      dayNumber: string;
      monthShort: string;
    }
    const days: DayItem[] = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(startOfToday);
      d.setDate(startOfToday.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      days.push({
        date: d,
        dateKey,
        isToday: i === 0,
        weekdayShort: d.toLocaleDateString(locale === 'nl' ? 'nl-BE' : 'en-US', {
          timeZone: 'Europe/Brussels',
          weekday: 'short',
        }),
        dayNumber: d.toLocaleDateString('default', {
          timeZone: 'Europe/Brussels',
          day: 'numeric',
        }),
        monthShort: d.toLocaleDateString(locale === 'nl' ? 'nl-BE' : 'en-US', {
          timeZone: 'Europe/Brussels',
          month: 'short',
        }),
      });
    }

    return {
      fromIso: startOfToday.toISOString(),
      sixMonthsIso: sixMonthsLater.toISOString(),
      daysList: days,
    };
  }, [nowDate, locale]);

  // Query events in the 6 month window
  const futureEvents = useQuery(api.events.getUpcomingEvents, {
    fromDate: fromIso,
    toDate: sixMonthsIso,
    limit: 100,
  });

  // Map Convex events to date keys (YYYY-MM-DD in Europe/Brussels)
  const eventsByDate = useMemo(() => {
    const map = new Map<string, any[]>();
    if (!futureEvents) return map;

    for (const ev of futureEvents) {
      const d = new Date(ev.date);
      const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Brussels',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(d);
      
      const list = map.get(parts) || [];
      list.push(ev);
      map.set(parts, list);
    }
    return map;
  }, [futureEvents]);

  // Map Guild sessions to date keys (YYYY-MM-DD in Europe/Brussels)
  const guildSessionsByDate = useMemo(() => {
    const map = new Map<string, GuildSession[]>();
    for (const session of guildSessions) {
      if (!session.date) continue;
      const d = new Date(session.date);
      const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Brussels',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(d);
      
      const list = map.get(parts) || [];
      list.push(session);
      map.set(parts, list);
    }
    return map;
  }, [guildSessions]);

  // Combined list sorted chronologically
  const unifiedEventsList = useMemo(() => {
    const items: UnifiedItem[] = [];

    if (futureEvents) {
      for (const ev of futureEvents) {
        items.push({ kind: 'convex', data: ev, sortDate: new Date(ev.date) });
      }
    }

    const startOfToday = new Date(nowDate);
    startOfToday.setHours(0, 0, 0, 0);
    const sixMonthsLater = new Date(startOfToday);
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

    for (const s of guildSessions) {
      if (!s.date) continue;
      const sDate = new Date(s.date);
      if (sDate >= startOfToday && sDate <= sixMonthsLater) {
        items.push({ kind: 'guild', data: s, sortDate: sDate });
      }
    }

    items.sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime());
    return items;
  }, [futureEvents, guildSessions, nowDate]);

  // If loading
  if (futureEvents === undefined) {
    return (
      <div className="eventbox">
        <div className="eventbox-header-title">
          <CalendarIcon size={20} className="eventbox-title-icon" />
          <h1>{locale === 'nl' ? 'Aankomende Evenementen' : 'Upcoming Events'}</h1>
        </div>
        <div className="eventbox-loading">
          <span>{locale === 'nl' ? 'Evenementen laden...' : 'Loading events...'}</span>
        </div>
      </div>
    );
  }

  if (futureEvents.length === 0 && guildSessions.length === 0) {
    return null;
  }

  return (
    <div className="eventbox">
      {/* Title */}
      <div className="eventbox-header-title">
        <div className="title-left">
          <CalendarIcon size={22} className="eventbox-title-icon" />
          <h1>{locale === 'nl' ? 'Aankomende Evenementen' : 'Upcoming Events'}</h1>
        </div>
        <span className="eventbox-window-tag">
          {locale === 'nl' ? 'Komende 6 maanden' : 'Next 6 months'}
        </span>
      </div>

      {/* 6-Day Overview Dayboxes */}
      <div className="six-day-overview">
        <div className="six-day-label">
          <span>{locale === 'nl' ? 'Deze Week' : 'Next 6 Days'}</span>
        </div>
        <div className="dayboxes-grid">
          {daysList.map((day) => {
            const dayEvents = eventsByDate.get(day.dateKey) || [];
            const daySessions = guildSessionsByDate.get(day.dateKey) || [];
            const hasConvexEvent = dayEvents.length > 0;
            const hasGuildSession = daySessions.length > 0;
            const hasAnyActivity = hasConvexEvent || hasGuildSession;
            const firstEvent = dayEvents[0];

            return (
              <div
                key={day.dateKey}
                className={`daybox-card ${day.isToday ? 'is-today' : ''} ${
                  hasConvexEvent
                    ? 'daybox-highlighted'
                    : hasGuildSession
                    ? 'daybox-guild-highlighted'
                    : 'daybox-default'
                }`}
              >
                {/* Header with day name and date */}
                <div className="daybox-header">
                  {day.isToday && <span className="today-badge">TODAY</span>}
                  <div className="daybox-date-row">
                    <span className="daybox-weekday">{day.weekdayShort}</span>
                    <span className="daybox-number">{day.dayNumber}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="daybox-content">
                  {hasConvexEvent && (
                    <Link
                      href={`/event/${firstEvent.slug}`}
                      className="daybox-event-link"
                      title={firstEvent.title}
                    >
                      <div className="daybox-event-badge">
                        <Sparkles size={11} className="badge-sparkle" />
                        <span className="daybox-event-name">{firstEvent.title}</span>
                      </div>
                      {dayEvents.length > 1 && (
                        <span className="daybox-more-count">
                          +{dayEvents.length - 1} more
                        </span>
                      )}
                    </Link>
                  )}

                  {/* Guild Sessions Badges */}
                  {daySessions.map((session) => {
                    const sessionTitle = session.system 
                      ? `${session.system} ${session.level ? `(Lvl ${session.level})` : 'Session'}`
                      : 'Void Session';

                    return (
                      <a
                        key={session._id}
                        href={`https://guild.tarragon.be/sessions/${session._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="daybox-guild-badge"
                        title={`Guild Session: ${sessionTitle} - Click to open on Guild of The Void`}
                      >
                        <Image
                          src={VoidLogo}
                          alt="Void Guild"
                          width={14}
                          height={14}
                          className="daybox-void-logo"
                        />
                        <span className="daybox-guild-name">{sessionTitle}</span>
                      </a>
                    );
                  })}

                  {!hasAnyActivity && (
                    <div className="daybox-empty">
                      <span>—</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Compact List of All Upcoming Events & Guild Sessions in Next 6 Months */}
      <div className="compact-events-section">
        <div className="compact-events-header">
          <span>{locale === 'nl' ? 'Evenementenkalender' : 'Schedule'}</span>
          <span className="count-badge">{unifiedEventsList.length}</span>
        </div>

        <div className="compact-events-list">
          {unifiedEventsList.map((item) => {
            const evDate = item.sortDate;
            const weekday = evDate.toLocaleDateString(locale === 'nl' ? 'nl-BE' : 'en-US', {
              timeZone: 'Europe/Brussels',
              weekday: 'short',
            });
            const dayMonth = evDate.toLocaleDateString(locale === 'nl' ? 'nl-BE' : 'en-US', {
              timeZone: 'Europe/Brussels',
              day: 'numeric',
              month: 'short',
            });
            const year = evDate.getFullYear();
            const timeStr = evDate.toLocaleTimeString('en-GB', {
              timeZone: 'Europe/Brussels',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            });

            if (item.kind === 'convex') {
              const event = item.data;
              const groups = event.groups || [];
              const hasGroups = groups.length > 0;
              const totalSlots = hasGroups
                ? groups.reduce((acc: number, g: any) => acc + (g.maxSlots || 0), 0)
                : 0;

              return (
                <Link
                  key={`convex-${event._id}`}
                  href={`/event/${event.slug}`}
                  className="compact-event-row"
                >
                  {/* Date Capsule */}
                  <div className="compact-date-capsule">
                    <span className="compact-date-weekday">{weekday}</span>
                    <span className="compact-date-day">{dayMonth}</span>
                    <span className="compact-date-year">{year}</span>
                  </div>

                  {/* Event Details */}
                  <div className="compact-event-info">
                    <div className="compact-title-row">
                      <h2 className="compact-event-title">{event.title}</h2>
                      {hasGroups && (
                        <span className="compact-slots-badge">
                          <Users size={12} />
                          <span>
                            {groups.length} {locale === 'nl' ? 'tafels' : 'tables'} ({totalSlots} {locale === 'nl' ? 'plekken' : 'slots'})
                          </span>
                        </span>
                      )}
                    </div>

                    <div className="compact-event-meta">
                      <span className="compact-meta-time">
                        <Clock size={13} />
                        <span>{timeStr}</span>
                      </span>
                      <span className="compact-meta-location">
                        Het Textielhuis, Kortrijk
                      </span>
                    </div>
                  </div>

                  {/* Arrow Icon */}
                  <div className="compact-event-arrow">
                    <ChevronRight size={18} />
                  </div>
                </Link>
              );
            }

            // Guild of The Void session row
            const session = item.data;
            const systemLabel = session.system === 'PF' ? 'Pathfinder 2e' : session.system === 'DnD' ? 'D&D 5e' : (session.system || 'TTRPG');
            const playersCount = session.characters ? session.characters.length : 0;
            const maxPlayers = session.maxPlayers || 6;

            return (
              <a
                key={`guild-${session._id}`}
                href={`https://guild.tarragon.be/sessions/${session._id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="compact-event-row compact-guild-row"
              >
                {/* Date Capsule */}
                <div className="compact-date-capsule guild-date-capsule">
                  <span className="compact-date-weekday">{weekday}</span>
                  <span className="compact-date-day">{dayMonth}</span>
                  <span className="compact-date-year">{year}</span>
                </div>

                {/* Event Details */}
                <div className="compact-event-info">
                  <div className="compact-title-row">
                    <div className="guild-title-container">
                      <div className="guild-inline-logo">
                        <Image
                          src={VoidLogo}
                          alt="Void Guild"
                          width={18}
                          height={18}
                          style={{ objectFit: 'contain' }}
                        />
                      </div>
                      <h2 className="compact-event-title">
                        {systemLabel} Session {session.level ? `(Level ${session.level})` : ''}
                      </h2>
                    </div>
                    <span className="compact-guild-tag">
                      Guild of The Void
                    </span>
                    <span className="compact-slots-badge guild-slots-badge">
                      <Users size={12} />
                      <span>
                        {playersCount} / {maxPlayers} {locale === 'nl' ? 'spelers' : 'players'}
                      </span>
                    </span>
                  </div>

                  <div className="compact-event-meta">
                    <span className="compact-meta-time">
                      <Clock size={13} />
                      <span>{timeStr}</span>
                    </span>
                    <span className="compact-meta-location">
                      {session.location?.startsWith('http') ? 'Het Textielhuis, Kortrijk' : (session.location || 'Het Textielhuis, Kortrijk')}
                    </span>
                  </div>
                </div>

                {/* External Link Icon */}
                <div className="compact-event-arrow guild-arrow">
                  <ExternalLink size={16} />
                </div>
              </a>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .eventbox {
          grid-column: span 12;
          background: var(--dark);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 1.25rem;
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
          box-shadow: var(--shadow-lg);
          width: 100%;
        }

        .eventbox-header-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 1rem;
        }

        .title-left {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .eventbox-title-icon {
          color: var(--secondary);
        }

        .eventbox-header-title h1 {
          font-size: 1.6rem;
          margin: 0;
          color: var(--light);
          font-family: var(--font-rockwell), serif;
        }

        .eventbox-window-tag {
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--secondary);
          background: rgba(151, 183, 142, 0.12);
          border: 1px solid rgba(151, 183, 142, 0.25);
          padding: 0.3rem 0.75rem;
          border-radius: 2rem;
        }

        .eventbox-loading {
          padding: 2rem;
          text-align: center;
          color: var(--secondary);
          font-size: 0.95rem;
        }

        /* Six Day Overview */
        .six-day-overview {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .six-day-label {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: rgba(242, 211, 180, 0.6);
        }

        .dayboxes-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 0.6rem;
        }

        @media (max-width: 768px) {
          .dayboxes-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 480px) {
          .dayboxes-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .daybox-card {
          background: rgba(0, 0, 0, 0.25);
          border-radius: 0.75rem;
          padding: 0.75rem 0.65rem;
          display: flex;
          flex-direction: column;
          min-height: 95px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.2s ease;
          position: relative;
        }

        .daybox-default {
          opacity: 0.85;
        }

        .daybox-card.is-today {
          border-color: rgba(151, 183, 142, 0.4);
          background: rgba(151, 183, 142, 0.05);
        }

        /* Highlighted Daybox when there is an event */
        .daybox-highlighted {
          border: 1.5px solid var(--secondary) !important;
          background: rgba(151, 183, 142, 0.15) !important;
          box-shadow: 0 0 14px rgba(151, 183, 142, 0.18);
          opacity: 1;
        }

        .daybox-highlighted:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 18px rgba(151, 183, 142, 0.28);
        }

        /* Highlighted Daybox when there is a Guild session */
        .daybox-guild-highlighted {
          border: 1.5px solid #a855f7 !important;
          background: rgba(168, 85, 247, 0.12) !important;
          box-shadow: 0 0 14px rgba(168, 85, 247, 0.18);
          opacity: 1;
        }

        .daybox-guild-highlighted:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 18px rgba(168, 85, 247, 0.28);
        }

        .daybox-header {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          margin-bottom: 0.4rem;
        }

        .today-badge {
          font-size: 0.62rem;
          font-weight: 800;
          color: var(--secondary);
          letter-spacing: 0.06em;
          line-height: 1;
        }

        .daybox-date-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
        }

        .daybox-weekday {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
          color: rgba(242, 211, 180, 0.7);
        }

        .daybox-number {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--light);
          line-height: 1;
        }

        .daybox-content {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .daybox-empty {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.15);
          text-align: center;
        }

        .daybox-event-link {
          text-decoration: none;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .daybox-event-badge {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: var(--secondary);
          color: #1a221d;
          border-radius: 0.4rem;
          padding: 0.2rem 0.4rem;
          font-weight: 700;
          font-size: 0.68rem;
          line-height: 1.2;
          overflow: hidden;
        }

        .badge-sparkle {
          flex-shrink: 0;
        }

        .daybox-event-name {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .daybox-more-count {
          font-size: 0.62rem;
          color: var(--secondary);
          font-weight: 600;
          text-align: right;
        }

        /* Guild badge inside Daybox */
        .daybox-guild-badge {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(168, 85, 247, 0.2);
          border: 1px solid rgba(168, 85, 247, 0.45);
          color: #f3e8ff;
          border-radius: 0.4rem;
          padding: 0.2rem 0.4rem;
          font-weight: 700;
          font-size: 0.68rem;
          line-height: 1.2;
          text-decoration: none !important;
          transition: all 0.15s ease;
          overflow: hidden;
        }

        .daybox-guild-badge:hover {
          background: rgba(168, 85, 247, 0.35);
          border-color: #c084fc;
          transform: scale(1.02);
        }

        .daybox-void-logo {
          flex-shrink: 0;
          object-fit: contain;
          filter: drop-shadow(0 0 4px rgba(168, 85, 247, 0.6));
        }

        .daybox-guild-name {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Compact Events Section */
        .compact-events-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          width: 100%;
        }

        .compact-events-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: rgba(242, 211, 180, 0.6);
        }

        .count-badge {
          background: rgba(255, 255, 255, 0.1);
          color: var(--light);
          font-size: 0.7rem;
          padding: 0.1rem 0.45rem;
          border-radius: 1rem;
        }

        .compact-events-list {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          width: 100%;
        }

        .compact-event-row {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          gap: 1.15rem;
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 0.75rem;
          padding: 0.65rem 1rem;
          text-decoration: none !important;
          transition: all 0.2s ease;
          width: 100%;
          box-sizing: border-box;
        }

        .compact-event-row:hover {
          background: rgba(151, 183, 142, 0.09);
          border-color: rgba(151, 183, 142, 0.35);
          transform: translateX(3px);
        }

        /* Clean Date Capsule (Left of Title) */
        .compact-date-capsule {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          width: 54px;
          min-width: 54px;
          max-width: 54px;
          height: 54px;
          padding: 0.25rem;
          background: rgba(0, 0, 0, 0.45);
          border: 1.5px solid rgba(151, 183, 142, 0.3);
          border-radius: 0.55rem;
          line-height: 1;
          flex-shrink: 0;
          box-sizing: border-box;
        }

        .compact-date-weekday {
          font-size: 0.62rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--secondary);
          letter-spacing: 0.05em;
          margin-bottom: 0.15rem;
        }

        .compact-date-day {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--light);
          line-height: 1;
          margin: 0;
        }

        .compact-date-year {
          font-size: 0.6rem;
          color: rgba(255, 255, 255, 0.45);
          margin-top: 0.15rem;
        }

        /* Info */
        .compact-event-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          min-width: 0;
        }

        .compact-title-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .compact-event-title {
          font-size: 1.05rem;
          margin: 0;
          color: var(--light);
          font-weight: 700;
          font-family: var(--font-rockwell), serif;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .compact-slots-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.7rem;
          color: var(--secondary);
          background: rgba(151, 183, 142, 0.1);
          border: 1px solid rgba(151, 183, 142, 0.25);
          padding: 0.1rem 0.45rem;
          border-radius: 1rem;
          font-weight: 600;
        }

        .compact-event-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.8rem;
          color: #94a3b8;
        }

        .compact-meta-time {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          color: var(--secondary);
          font-weight: 600;
          font-feature-settings: "tnum";
        }

        .compact-meta-location {
          color: rgba(255, 255, 255, 0.5);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .compact-event-arrow {
          color: rgba(255, 255, 255, 0.3);
          transition: transform 0.2s ease, color 0.2s ease;
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }

        .compact-event-row:hover .compact-event-arrow {
          color: var(--secondary);
          transform: translateX(3px);
        }

        /* Guild Row Styles */
        .compact-guild-row {
          border-color: rgba(168, 85, 247, 0.2);
          background: rgba(168, 85, 247, 0.05);
        }

        .compact-guild-row:hover {
          background: rgba(168, 85, 247, 0.12);
          border-color: rgba(168, 85, 247, 0.45);
        }

        .guild-date-capsule {
          border-color: rgba(168, 85, 247, 0.4);
        }

        .guild-date-capsule .compact-date-weekday {
          color: #c084fc;
        }

        .guild-title-container {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          min-width: 0;
        }

        .guild-inline-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: rgba(168, 85, 247, 0.2);
          border: 1px solid rgba(168, 85, 247, 0.4);
          border-radius: 0.35rem;
          padding: 0.12rem;
        }

        .compact-guild-tag {
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #c084fc;
          background: rgba(168, 85, 247, 0.12);
          border: 1px solid rgba(168, 85, 247, 0.3);
          padding: 0.1rem 0.45rem;
          border-radius: 1rem;
        }

        .guild-slots-badge {
          color: #e9d5ff;
          background: rgba(168, 85, 247, 0.1);
          border-color: rgba(168, 85, 247, 0.25);
        }

        .compact-guild-row:hover .guild-arrow {
          color: #c084fc;
          transform: translate(2px, -2px);
        }

        @media (max-width: 600px) {
          .compact-event-row {
            gap: 0.75rem;
            padding: 0.6rem 0.75rem;
          }

          .compact-date-capsule {
            width: 48px;
            min-width: 48px;
            max-width: 48px;
            height: 48px;
            padding: 0.2rem;
          }

          .compact-date-day {
            font-size: 0.95rem;
          }

          .compact-date-weekday {
            font-size: 0.58rem;
          }

          .compact-date-year {
            font-size: 0.55rem;
          }

          .compact-event-title {
            font-size: 0.95rem;
          }

          .compact-event-meta {
            font-size: 0.75rem;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
