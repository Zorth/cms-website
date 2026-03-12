import Image from 'next/image';
import Link from "next/link";

export default function HeaderPages(props) {
    return (
        <nav className="header-nav">
            {props.data.pageConnection.edges.map((page) => (
                <Link 
                    key={page.node?.id} 
                    href={`/${page.node?._sys.filename}`}
                    className="header-nav-link"
                    title={page.node?.title || ""}
                >
                    {page.node?.icon ? (
                        <Image
                            src={page.node.icon}
                            alt={page.node.title || ""}
                            width={40}
                            height={40}
                            className="header-nav-icon"
                        />
                    ) : (
                        <span>{page.node?.title}</span>
                    )}
                </Link>
            ))}
        </nav>
    );
}
