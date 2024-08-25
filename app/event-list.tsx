import Link from "next/link";

export default function EventList(props) {
  return (
    <>
      <div>
        {props.data.eventConnection.edges.map((event) => (
          <div key={event.node.id}>
            <Link href={`/event/${event.node._sys.filename}`}>
              {event.node.title}
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}
