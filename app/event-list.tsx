import './homepage.css';
import Link from "next/link";

export default function EventList(props) {

    return (
        <>
            <div className="eventbox-list">
                {props.data.eventConnection.edges
                    .slice(0,3).map((event) => (EventSnippet(event)))
                }
            </div>
        </>
    );
}


function EventSnippet(event) {
    const date = new Date(event.node.date);
    return (
        <Link href={`/event/${event.node._sys.filename}`} key={event.node.id} className="event-snippet">
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
