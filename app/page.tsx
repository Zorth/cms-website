import './homepage.css';
import Link from "next/link";
import { client } from "../tina/__generated__/client";
import EventList from "./event-list";

import { tinaField } from "tinacms/dist/react";
import { TinaMarkdown } from "tinacms/dist/rich-text";

export default async function Home() {
    const events = await client.queries.eventConnection({sort: "date"});

    // this should be moved into a client page in order to make editable, what do we want editable?
    // const fetch = await client.queries.page({
    //     relativePath: `home.mdx`,
    // });
    // const data = fetch.data;

    return (
        <div className="container">
            <div className="infobox">
                <h1>What is Tarragon?</h1>
                <p>We organize events for new & experienced tabletop geeks. Whether you’re a board game veteran or want to get into D&D, we’ve got something for you!<br /><br />
                    We meet <b>every Wednesday</b> from 19:00 to 22:00 @ <Link href='https://Craftypotions.com/'>Crafty Potions</Link> (Sint-Janstraat 21, Kortrijk)</p>
            </div>
            <div className="eventbox">
                <h1>Upcoming Events:</h1>
                <EventList {...events} />
            </div>
            <div className="koboldbox">
                <h1>Kobold Deals</h1>
            </div>
            <div className="dragonbox">
                <h1>Dragons</h1>
            </div>
            <div className="contactbox">
                <h1>Contact</h1>
            </div>
        </div>
    )
}

