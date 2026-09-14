'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Calendar as CalendarIcon, Clock, ChevronRight, Users, Sparkles } from 'lucide-react';

interface EventListProps {
  locale?: string;
}

export default function EventList({ locale = 'nl' }: EventListProps) {
  // Brussels time calculations
  const [nowDate, setNowDate] = useState<Date>(() => new Date());

  useEffect(() => {
    const updateNow = () => setNowDate(new Date());
    const interval = setInterval(updateNow, 60000);
    return () => clearInterval(interval);
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

  // Map events to date keys (YYYY-MM-DD in Europe/Brussels)
  const eventsByDate = useMemo(() => {
    const map = new Map<string, any[]>();
    if (!futureEvents) return map;

    for (const ev of futureEvents) {
      const d = new Date(ev.date);
      // Format as YYYY-MM-DD in Brussels timezone
      const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Brussels',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(d); // produces "YYYY-MM-DD"
      
      const list = map.get(parts) || [];
      list.push(ev);
      map.set(parts, list);
    }
    return map;
  }, [futureEvents]);

  // If loading or no events in 6 months
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

  if (futureEvents.length === 0) {
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
            const hasEvent = dayEvents.length > 0;
            const firstEvent = dayEvents[0];

            return (
              <div
                key={day.dateKey}
                className={`daybox-card ${day.isToday ? 'is-today' : ''} ${
                  hasEvent ? 'daybox-highlighted' : 'daybox-default'
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
                  {hasEvent ? (
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
                  ) : (
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

      {/* Compact List of All Upcoming Events in Next 6 Months */}
      <div className="compact-events-section">
        <div className="compact-events-header">
          <span>{locale === 'nl' ? 'Evenementenkalender' : 'Schedule'}</span>
          <span className="count-badge">{futureEvents.length}</span>
        </div>

        <div className="compact-events-list">
          {futureEvents.map((event) => {
            const evDate = new Date(event.date);
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
            const timeStr = evDate.toLocaleTimeString(locale === 'nl' ? 'nl-BE' : 'en-US', {
              timeZone: 'Europe/Brussels',
              hour: '2-digit',
              minute: '2-digit',
            });

            const groups = event.groups || [];
            const hasGroups = groups.length > 0;
            const totalSlots = hasGroups
              ? groups.reduce((acc: number, g: any) => acc + (g.maxSlots || 0), 0)
              : 0;

            return (
              <Link
                key={event._id}
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
                      <span>{timeStr !== '00:00' && timeStr !== '01:00' ? timeStr : '19:00'}</span>
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

        /* Compact Events Section */
        .compact-events-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
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
          gap: 0.65rem;
        }

        .compact-event-row {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          background: rgba(0, 0, 0, 0.22);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 0.85rem;
          padding: 0.85rem 1.15rem;
          text-decoration: none !important;
          transition: all 0.2s ease;
        }

        .compact-event-row:hover {
          background: rgba(151, 183, 142, 0.08);
          border-color: rgba(151, 183, 142, 0.35);
          transform: translateX(4px);
        }

        /* Date Capsule */
        .compact-date-capsule {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-width: 65px;
          padding: 0.4rem 0.6rem;
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(151, 183, 142, 0.2);
          border-radius: 0.6rem;
          line-height: 1.1;
        }

        .compact-date-weekday {
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--secondary);
          letter-spacing: 0.05em;
        }

        .compact-date-day {
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--light);
          margin: 0.15rem 0;
        }

        .compact-date-year {
          font-size: 0.65rem;
          color: rgba(255, 255, 255, 0.4);
        }

        /* Info */
        .compact-event-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          min-width: 0;
        }

        .compact-title-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.6rem;
        }

        .compact-event-title {
          font-size: 1.1rem;
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
          gap: 0.3rem;
          font-size: 0.72rem;
          color: var(--secondary);
          background: rgba(151, 183, 142, 0.1);
          border: 1px solid rgba(151, 183, 142, 0.25);
          padding: 0.15rem 0.5rem;
          border-radius: 1rem;
          font-weight: 600;
        }

        .compact-event-meta {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          font-size: 0.8rem;
          color: #94a3b8;
        }

        .compact-meta-time {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          color: var(--secondary);
          font-weight: 600;
        }

        .compact-meta-location {
          color: rgba(255, 255, 255, 0.5);
        }

        .compact-event-arrow {
          color: rgba(255, 255, 255, 0.3);
          transition: transform 0.2s ease, color 0.2s ease;
          flex-shrink: 0;
        }

        .compact-event-row:hover .compact-event-arrow {
          color: var(--secondary);
          transform: translateX(3px);
        }

        @media (max-width: 600px) {
          .compact-event-row {
            gap: 0.85rem;
            padding: 0.75rem 0.85rem;
          }

          .compact-date-capsule {
            min-width: 54px;
            padding: 0.35rem 0.45rem;
          }

          .compact-event-title {
            font-size: 0.95rem;
          }

          .compact-event-meta {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}
