import { EventQuery } from '../tina/__generated__/types';
import './homepage.css';
import Link from "next/link";

export default function EventList(props) {
    return (
        <>
            <div>
                {props.data.eventConnection.edges.sort(
                    function(a: EventQuery, b: EventQuery){
                        return new Date(b.event.date) - new Date(a.event.date);
                    }
                ).map((event) => (
                    <div key={event.node.id}>
                        <Link href={`/event/${event.node._sys.filename}`}>
                            {event.node._sys.filename}
                        </Link>
                    </div>
                ))}
            </div>
        </>
    );
}
