'use client';

import { useEffect, useState } from 'react';
import './homepage.css';
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function EventList(props: { locale?: string }) {
    const locale = props.locale || 'nl';
    const [nowIso, setNowIso] = useState<string>(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d.toISOString();
    });

    useEffect(() => {
        const updateNow = () => {
            const d = new Date();
            d.setHours(0, 0, 0, 0);
            setNowIso(d.toISOString());
        };
        updateNow();
        const interval = setInterval(updateNow, 60000);
        return () => clearInterval(interval);
    }, []);

    const futureEvents = useQuery(api.events.getUpcomingEvents, { fromDate: nowIso });

    // Hide entire section if loading or no future events
    if (!futureEvents || futureEvents.length === 0) {
        return null;
    }


    return (
        <div className="eventbox">
            <h1>{locale === 'nl' ? 'Aankomende Evenementen:' : 'Upcoming Special Events:'}</h1>
            <div className="eventbox-list" suppressHydrationWarning>
                {futureEvents.map((event) => (
                    <EventSnippet key={event._id} event={event} />
                ))}
            </div>
        </div>
    );
}

function EventSnippet({ event }: { event: any }) {
    const date = new Date(event.date);
    return (
        <Link href={`/event/${event.slug}`} className="event-snippet">
            <div className="event-daybox">
                <span>{date.toLocaleString('default', {timeZone: 'Europe/Brussels', weekday: 'long'})}</span>
                <h1>{date.toLocaleString('default', {timeZone: 'Europe/Brussels', day: 'numeric'})}</h1>
                <small>{date.toLocaleString('default', {timeZone: 'Europe/Brussels', month: 'long'})}</small>
                <small>{date.getFullYear()}</small>
            </div>
            <h2>{event.title}</h2>
        </Link>
    );
}
