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

  // Fetch upcoming sessions from internal API proxy (to avoid CORS)
  useEffect(() => {
    let isCancelled = false;
    async function fetchGuildSessions() {
      try {
        const res = await fetch('/api/guild/sessions');
        if (!res.ok) return;
        const data = await res.json();
        if (!isCancelled && Array.isArray(data)) {
          // Filter only sessions that have an explicit scheduled date and are not planning
          const scheduled = data.filter((s: GuildSession) => typeof s.date === 'number' && !s.planning);
          setGuildSessions(scheduled);
        }
      } catch (err) {
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
          <div className="title-left">
            <CalendarIcon size={22} className="eventbox-title-icon" />
            <h1>{locale === 'nl' ? 'Aankomende Evenementen' : 'Upcoming Events'}</h1>
          </div>
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
                    const sessionTitle = session.questName
                      ? session.questName
                      : session.system 
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
            const dayNum = evDate.toLocaleDateString('default', {
              timeZone: 'Europe/Brussels',
              day: 'numeric',
            });
            const monthShort = evDate.toLocaleDateString(locale === 'nl' ? 'nl-BE' : 'en-US', {
              timeZone: 'Europe/Brussels',
              month: 'short',
            });
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
                  {/* Date Capsule (Placed cleanly on Left) */}
                  <div className="compact-date-capsule">
                    <span className="compact-date-weekday">{weekday}</span>
                    <span className="compact-date-day">{dayNum}</span>
                    <span className="compact-date-month">{monthShort}</span>
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
                        {event.location || 'Het Textielhuis, Kortrijk'}
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
                {/* Date Capsule (Placed cleanly on Left) */}
                <div className="compact-date-capsule guild-date-capsule">
                  <span className="compact-date-weekday">{weekday}</span>
                  <span className="compact-date-day">{dayNum}</span>
                  <span className="compact-date-month">{monthShort}</span>
                </div>

                {/* Event Details */}
                <div className="compact-event-info">
                  <div className="compact-title-row">
                    <div className="guild-title-container">
                      <div className="guild-inline-logo">
                        <Image
                          src={VoidLogo}
                          alt="Void Guild"
                          width={14}
                          height={14}
                          style={{ objectFit: 'contain' }}
                        />
                      </div>
                      <h2 className="compact-event-title">
                        {session.questName || `${systemLabel} Session ${session.level ? `(Lvl ${session.level})` : ''}`}
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
    </div>
  );
}
