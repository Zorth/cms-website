import Image from 'next/image';
import './homepage.css';
import Link from "next/link";
import { TinaMarkdown } from 'tinacms/dist/rich-text';

export default function SponsorList(props) {

    return (
        <>
            <div className="sponsor-list">
                <Link href={'https://forms.gle/YU3Mrm93vrmni6Vq9'} key="Signup" className="sponsor-snippet red-hover" style={{background: 'var(--primary_dark)'}}>
                <h2>Become a Kobold!</h2>
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
