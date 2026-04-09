'use client';

import { useEffect, useState } from 'react';
import './homepage.css';
import Link from "next/link";

export default function EventList(props: any) {
    const locale = props.locale || 'nl';
    const [now, setNow] = useState<Date | null>(null);

    useEffect(() => {
        setNow(new Date());
        // Update "now" every minute to ensure we have the client's "now"
        const interval = setInterval(() => {
            setNow(new Date());
        }, 60000); 
        return () => clearInterval(interval);
    }, []);

    // Filter events based on client's "now"
    // We show events from "today" onwards
    const filterToday = now || new Date(); // Use server-ish date for initial render
    const today = new Date(filterToday);
    today.setHours(0, 0, 0, 0);

    const futureEvents = props.data.eventConnection.edges
        .filter((event: any) => {
            if (!event || !event.node || !event.node.date) return false;
            const date = new Date(event.node.date);
            return date >= today;
        })
        // Ensure they are sorted by date
        .sort((a: any, b: any) => new Date(a.node.date).getTime() - new Date(b.node.date).getTime());

    // Hide entire section if no future events
    if (futureEvents.length === 0) {
        return null;
    }

    return (
        <div className="eventbox">
            <h1>{locale === 'nl' ? 'Aankomende Evenementen:' : 'Upcoming Special Events:'}</h1>
            <div className="eventbox-list" suppressHydrationWarning>
                {futureEvents.map((event: any) => (
                    <EventSnippet key={event.node.id} event={event} />
                ))}
            </div>
        </div>
    );
}


function EventSnippet({ event }: { event: any }) {
    const date = new Date(event.node.date);
    return (
        <Link href={`/event/${event.node._sys.filename}`} className="event-snippet">
            <div className="event-daybox">
                <span>{date.toLocaleString('default', {timeZone: 'Europe/Brussels', weekday: 'long'})}</span>
                <h1>{date.toLocaleString('default', {timeZone: 'Europe/Brussels', day: 'numeric'})}</h1>
                <small>{date.toLocaleString('default', {timeZone: 'Europe/Brussels', month: 'long'})}</small>
                <small>{date.getFullYear()}</small>
            </div>
            <h2>{event.node.title}</h2>
        </Link>
    )
}
