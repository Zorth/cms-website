import { client } from "../tina/__generated__/client";
import EventList from "./event-list";

export default async function Home() {
  const pages = await client.queries.eventConnection();


    return (
            <div>
            <EventList {...pages} /> 
            </div>
    )
}

