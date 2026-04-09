import '../homepage.css';
import Link from "next/link";
import Image from 'next/image';
import React from 'react';
import { client } from "../../tina/__generated__/client";
import EventList from "../event-list";
import SponsorList from '../sponsor-list';

import { TinaMarkdown } from "tinacms/dist/rich-text";
import DragonList from '../dragon-list';
import DiscordIcon from '../../public/images/discord-icon.svg';

import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Home({ params }: { params: { locale: string } }) {
    const locale = params.locale || 'nl';

    const yest = new Date();
    yest.setDate(yest.getDate() - 1);

    const event_fetch = await client.queries.eventConnection({ 
        sort: "date", 
        filter: { 
            date: { after: yest.toISOString() },
            language: { eq: locale }
        } as any,
        first: 100 
    });
    const sponsors = await client.queries.sponsorConnection({
        filter: { language: { eq: locale } } as any
    });
    const pages = await client.queries.pageConnection({ 
        filter: { 
            enabled: { eq: true },
            language: { eq: locale }
        } as any,
        sort: "weight"
    });
    const dragons = await client.queries.dragonConnection();

    return (
        <div className="container">
            <div className="infobox">
                <h1>{locale === 'nl' ? 'Welkom aan Tafel!' : 'Welcome to the Table!'}</h1>
                <p>
                    {locale === 'nl' 
                        ? 'Wij organiseren wekelijkse evenementen voor tabletop geeks in Kortrijk. Of je nu een bordspelveteraan bent of nog nooit een 20-zijdige dobbelsteen hebt aangeraakt, je vindt altijd een plekje aan onze tafel.'
                        : 'We organize weekly events for tabletop geeks in Kortrijk. Whether you’re a board game veteran or have never touched a 20-sided die, you’ll find a seat at our table.'
                    }
                    <br /><br />
                    {locale === 'nl' ? 'We komen elke woensdag samen' : 'We meet every Wednesday'} van 19:00 tot 22:00 @ <Link href='https://maps.app.goo.gl/FVc87bcAtS4VVuip8' className="location-link">Het Textielhuis (Rijselsestraat 19)</Link>.
                </p>
                <div className="welcome-badges">
                    <span className="badge">{locale === 'nl' ? 'Beginners Welkom' : 'Beginners Welcome'}</span>
                    <span className="badge">English & Dutch</span>
                    <span className="badge">{locale === 'nl' ? 'Gratis Toegang' : 'Free Entry'}</span>
                </div>
            </div>
            <EventList {...event_fetch} />
            <Featurettes data={pages.data} locale={locale} />
            <div className="quick-links">
                <Link href="https://discord.com/invite/TjDUu2Gkag" className="quick-link-item">
                    <span className="quick-link-icon" style={{ display: 'flex', alignItems: 'center' }}>
                        <Image 
                            src={DiscordIcon}
                            alt="Discord"
                            width={24}
                            height={24}
                        />
                    </span>
                    <span>Join our Discord</span>
                </Link>
                <Link href="https://guild.tarragon.be" className="quick-link-item">
                    <span className="quick-link-icon">⚔️</span>
                    <span>Guild Planning Tool</span>
                </Link>
                <Link href="https://void.tarragon.be" className="quick-link-item">
                    <span className="quick-link-icon">📜</span>
                    <span>Void Wiki</span>
                </Link>
            </div>
            <div className="koboldbox">
                <h1>Kobold Deals</h1>
                <SponsorList {...sponsors} />
            </div>
            <div className="dragonbox">
                <h1>Dragons</h1>
                <DragonList {...dragons} />
            </div>
            <div className="contactbox">
                <h1>Contact</h1>
                <small>Tarragon v.z.w.  
                    Sint-Jansstraat 21,  
                    8500 Kortrijk  
                    BE 0799.673.542  
                    RPR  
                    contact@tarragon.be  
                    www.tarragon.be<br/>
                    Copyright 2024 Tarragon VZW, All rights reserved<br/><br/>
                    <Link href={`/${locale}/ToS`}>Membership ToS</Link>
                </small>
            </div>
        </div>
    )
}

function Featurettes({ data, locale }: { data: any, locale: string }) {
    if (data.pageConnection.edges.length == 0) {
        return <></>;
    }
    return (
        <div className="featurettes-container">
            {data.pageConnection.edges
                .map((page: any) => {
                    const node = page.node;
                    const IconComponent = node?.iconName ? (LucideIcons as any)[node.iconName] as LucideIcon : null;
                    
                    return (
                        <Link href={`/${locale}/${node?._sys.filename}`} key={node?.id} className="page-snippet">
                            {node?.icon ? (
                                <div className="page-snippet-icon-wrapper">
                                    <Image 
                                        src={node.icon} 
                                        alt={node?.title || ""} 
                                        width={80} 
                                        height={80} 
                                        className="page-snippet-icon"
                                    />
                                </div>
                            ) : IconComponent ? (
                                <div className="page-snippet-icon-wrapper">
                                    <IconComponent 
                                        size={64} 
                                        className="page-snippet-icon" 
                                        color="var(--secondary)" 
                                    />
                                </div>
                            ) : null}
                            <div className="page-snippet-content">
                                <TinaMarkdown content={node?.snippet} />
                                <span className="page-snippet-more">
                                    {locale === 'nl' ? 'Ontdek meer →' : 'Explore more →'}
                                </span>
                            </div>
                        </Link>
                    );
                })}
        </div>
    );
}
