import './homepage.css';
import Link from "next/link";

export default function EventList(props) {
    return (
        <>
            <div className="eventbox-list">
                {props.data.eventConnection.edges
                    .map((event) => (
                        <Link href={`/event/${event.node._sys.filename}`} key={event.node.id} className="event-snippet">
                                {event.node._sys.filename}
                        </Link>
                    ))}
            </div>
        </>
    );
}
