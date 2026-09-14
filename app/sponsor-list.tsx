import Image from 'next/image';
import './homepage.css';
import Link from "next/link";
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import KoboldSignupCard from './KoboldSignupCard';

export default function SponsorList(props) {
    const locale = props.locale || 'nl';

    return (
        <>
            <div className="sponsor-list">
                <KoboldSignupCard locale={locale} />
                {props.data.sponsorConnection.edges
                    .map((sponsor) => (SponsorSnippet(sponsor)))
                }
            </div>
        </>
    );
}


function SponsorSnippet(sponsor) {
    return (
        <Link href={sponsor.node.link} key={sponsor.node.id} className="sponsor-snippet red-hover">
            { sponsor.node.image ? <Image
                src={`${sponsor.node.image}`}
                alt={sponsor.node.name}
                width={500}
                height={500}
                className="sponsor-image" /> : ""}
            <TinaMarkdown content={sponsor.node.snippet} />
        </Link>
    )
}
