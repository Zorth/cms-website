import Link from "next/link";
import { client } from "../tina/__generated__/client";
import { tinaField } from "tinacms/dist/react";
import EventList from "./event-list";
import { TinaMarkdown } from "tinacms/dist/rich-text";


export default async function Home() {
  const pages = await client.queries.eventConnection();

  // this should be moved into a client page in order to make editable, what do we want editable?
  const fetch = await client.queries.page({
    relativePath: `home.mdx`,
  });
  const data = fetch.data;

    return (
            <div>
            <div data-tina-field={tinaField(data.page, "body")}>
            <TinaMarkdown content={data.page.body} />
            </div>
            <h1>What is Tarragon?</h1>
            <p>We organize events for new & experienced tabletop geeks. Whether you’re a board game veteran or want to get into D&D, we’ve got something for you!<br /><br />
            We meet <b>every Wednesday</b> from 19:00 to 22:00 @ <Link href='https://Craftypotions.com/'>Crafty Potions</Link> (Sint-Janstraat 21, Kortrijk)</p>
            <h1>Upcoming Events:</h1>
            <EventList {...pages} /> 
            <h1>Kobold Deals</h1>
            <h1>Dragons</h1>
            <h1>Contact</h1>
            </div>
    )
}

