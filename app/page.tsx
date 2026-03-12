import './homepage.css';
import Link from "next/link";
import Image from 'next/image';
import { client } from "../tina/__generated__/client";
import EventList from "./event-list";
import SponsorList from './sponsor-list';

import { TinaMarkdown } from "tinacms/dist/rich-text";
import { PageConnectionEdges } from '../tina/__generated__/types';
import DragonList from './dragon-list';

export default async function Home() {



    const yest = new Date();
    yest.setDate(yest.getDate() - 1);

    const events = await client.queries.eventConnection({ sort: "date", filter: { date: { after: yest.toString() } } });
    const sponsors = await client.queries.sponsorConnection();
    const pages = await client.queries.pageConnection({ filter: { enabled: { eq: true } } });
    const dragons = await client.queries.dragonConnection();

    // this should be moved into a client page in order to make editable, what do we want editable?
    // const fetch = await client.queries.page({
    //     relativePath: `home.mdx`,
    // });
    // const data = fetch.data;

    return (
        <div className="container">
            <div className="infobox">
                <h1>Welcome to the Table!</h1>
                <p>
                    We organize weekly events for tabletop geeks in <b>Kortrijk</b>. Whether you’re a board game veteran or have never touched a 20-sided die, you’ll find a seat at our table. 
                    <br /><br />
                    We meet <b>every Wednesday</b> from 19:00 to 22:00 @ <Link href='https://maps.app.goo.gl/FVc87bcAtS4VVuip8' className="location-link">Het Textielhuis (Rijselsestraat 19)</Link>.
                </p>
                <div className="welcome-badges">
                    <span className="badge">Beginners Welcome</span>
                    <span className="badge">English & Dutch</span>
                    <span className="badge">Free Entry</span>
                </div>
            </div>
            <div className="eventbox">
                <h1>Upcoming Events:</h1>
                <EventList {...events} />
            </div>
            <Featurettes {...pages} />
            <div className="koboldbox">
                <h1>Kobold Deals</h1>
                <SponsorList {...sponsors} />
            </div>
            <div className="dragonbox">
                <h1>Dragons</h1>
                <DragonList {...dragons} />
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
    )
}


function Featurettes(props) {
    if (props.data.pageConnection.edges.length == 0) {
        return <></>;
    }
    return (
        <div className="featurettes-container">
            {props.data.pageConnection.edges
                .map((page: PageConnectionEdges) => (
                    <Link href={`/${page.node?._sys.filename}`} key={page.node?.id} className="page-snippet">
                        {page.node?.icon && (
                            <div className="page-snippet-icon-wrapper">
                                <Image 
                                    src={page.node.icon} 
                                    alt={page.node.title} 
                                    width={80} 
                                    height={80} 
                                    className="page-snippet-icon"
                                />
                            </div>
                        )}
                        <div className="page-snippet-content">
                            <TinaMarkdown content={page.node?.snippet} />
                            <span className="page-snippet-more">Explore more →</span>
                        </div>
                    </Link>
                ))}
        </div>
    );
}

