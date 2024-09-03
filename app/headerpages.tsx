import Image from 'next/image';
import './homepage.css';
import Link from "next/link";

export default function HeaderPages(props) {
    return (
        <>
            <div>
                {props.data.pageConnection.edges
                .map((page) => (
                    <div key={page.node.id}>
                        <Link href={`/${page.node._sys.filename}`}>
                            <Image
                            src = {page.node.icon}
                            alt = {page.node.title}
                            width= {1}
                            height= {1}
                            className="header-image"
                            />
                        </Link> 
                    </div>
                ))}
            </div>
        </>
    );
}
