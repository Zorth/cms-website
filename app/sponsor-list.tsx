import Image from 'next/image';
import './homepage.css';
import Link from "next/link";
import { TinaMarkdown } from 'tinacms/dist/rich-text';

export default function SponsorList(props) {

    return (
        <>
            <div className="sponsor-list">
                {props.data.sponsorConnection.edges
                    .slice(0,3).map((sponsor) => (SponsorSnippet(sponsor)))
                }
            </div>
        </>
    );
}


function SponsorSnippet(sponsor) {
    return (
        <Link href={`/sponsor/${sponsor.node._sys.filename}`} key={sponsor.node.id} className="sponsor-snippet">
            <Image
                src={sponsor.node.image}
                alt={sponsor.node.name}
                width={500}
                height={500}
                className="sponsor-image" />
            <TinaMarkdown content={sponsor.node.snippet} />
        </Link>
    )
}
