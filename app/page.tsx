"use client";
import './homepage.css';
import Link from "next/link";
import { useEffect, useState } from "react";
import { client } from "../tina/__generated__/client";
import EventList from "./event-list";
import SponsorList from './sponsor-list';

import { TinaMarkdown } from "tinacms/dist/rich-text";
import { PageConnectionEdges } from '../tina/__generated__/types';
import DragonList from './dragon-list';

export default function Home() {
    const [events, setEvents] = useState({ eventConnection: { edges: [] } });
    const [sponsors, setSponsors] = useState({ sponsorConnection: { edges: [] } });
    const [pages, setPages] = useState({ pageConnection: { edges: [] } });
    const [dragons, setDragons] = useState({ dragonConnection: { edges: [] } });

    useEffect(() => {
        async function fetchData() {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            // Fetch and filter events within the date range
            const eventsResult = await client.queries.eventConnection({
                sort: "date",
                filter: {
                    date: {
                        after: yesterday.toISOString()
                    }
                }
            });

            setEvents(eventsResult.data);

            const sponsorsResult = await client.queries.sponsorConnection();
            setSponsors(sponsorsResult.data);

            const pagesResult = await client.queries.pageConnection({ filter: { enabled: { eq: true } } });
            setPages(pagesResult.data);

            const dragonsResult = await client.queries.dragonConnection();
            setDragons(dragonsResult.data);
        }

        fetchData();
    }, []);

    return (
        <div className="container">
            <div className="infobox">
                <h1>What is Tarragon?</h1>
                <p>We organize events for new & experienced tabletop geeks. Whether you’re a board game veteran or want to get into D&D, we’ve got something for you!<br /><br />
                    We meet <b>every Wednesday</b> from 19:00 to 22:00 @ <Link href='https://maps.app.goo.gl/FVc87bcAtS4VVuip8'>Het Textielhuis</Link> (Rijselsestraat 19, 8500 Kortrijk)</p>
            </div>
            <div className="eventbox">
                <h1>Upcoming Events:</h1>
                <EventList data={events} />
            </div>
            <Featurettes data={pages} />
            <div className="koboldbox">
                <h1>Kobold Deals</h1>
                <SponsorList data={sponsors} />
            </div>
            <div className="dragonbox">
                <h1>Dragons</h1>
                <DragonList data={dragons} />
            </div>
            <div className="contactbox">
                <h1>Contact</h1>
                <small>Tarragon v.z.w.  
                    Sint-Jansstraat 21,  
                    8500 Kortrijk  
                    BE 0799.673.542  
                    RPR  
                    tarragonvzw@gmail.com  
                    www.tarragon.be<br/>
                    Copyright 2024 Tarragon VZW, All rights reserved<br/><br/>
                    <Link href="/ToS">Membership ToS</Link>
                </small>
            </div>
        </div>
    );
}

function Featurettes(props) {
    if (!props.data.pageConnection || props.data.pageConnection.edges.length === 0) {
        return <></>;
    }
    return (
        props.data.pageConnection.edges
            .map((page: PageConnectionEdges) => (
                <Link href={`/${page.node?._sys.filename}`} key={page.node?.id} className="page-snippet">
                    <div>
                        <TinaMarkdown content={page.node?.snippet} />
                    </div>
                </Link>
            )));
}
