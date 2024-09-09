import Image from 'next/image';
import './homepage.css';
import Link from "next/link";
import { TinaMarkdown } from 'tinacms/dist/rich-text';

export default function SponsorList(props) {

    return (
        <>
            <div className="sponsor-list">
                <Link href={'/404/'} key="Signup" className="sponsor-snippet red-hover" style={{background: 'var(--primary_dark)'}}>
                <h1>Become a Kobold!</h1>
                <p>Click here to go to become a Tarragon member to get access to membership deals and discounts on events!</p>
                </Link>
                {props.data.sponsorConnection.edges
                    .map((sponsor) => (SponsorSnippet(sponsor)))
                }
            </div>
        </>
    );
}


function SponsorSnippet(sponsor) {
    return (
        <Link href={sponsor.node.link} key={sponsor.node.id} className="sponsor-snippet">
            { sponsor.node.image ? <Image
                src={sponsor.node.image}
                alt={sponsor.node.name}
                width={500}
                height={500}
                className="sponsor-image" /> : ""}
            <TinaMarkdown content={sponsor.node.snippet} />
        </Link>
    )
}
