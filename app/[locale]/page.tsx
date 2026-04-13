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
        },
        first: 100 
    });
    const sponsors = await client.queries.sponsorConnection();
    const pagesResponse = await client.queries.pageConnection({ 
        filter: { 
            enabled: { eq: true }
        }
    });

    // Filter by language and sort by weight in JS
    const filteredPages = {
        ...pagesResponse,
        data: {
            ...pagesResponse.data,
            pageConnection: {
                ...pagesResponse.data.pageConnection,
                edges: pagesResponse.data.pageConnection.edges
                    ?.filter((edge: any) => (edge?.node?.language === locale) || (!edge?.node?.language && locale === 'nl'))
                    ?.sort((a: any, b: any) => (a.node.weight || 100) - (b.node.weight || 100))
            }
        }
    };

    const dragons = await client.queries.dragonConnection();

    return (
        <div className="container">
            <div className="infobox">
                <h1>{locale === 'nl' ? 'Welkom aan Tafel!' : 'Welcome to the Table!'}</h1>
                <p>
                    {locale === 'nl' 
                        ? 'Tarragon is dé ontmoetingsplaats voor tabletop geeks in Kortrijk. Of je nu komt voor wekelijkse Dungeons & Dragons sessies, strategische bordspellen (boardgames), minipainting workshops of LARP—er is altijd een plekje aan onze tafel.'
                        : 'Tarragon is the premier meeting place for tabletop geeks in Kortrijk. Whether you’re joining us for weekly Dungeons & Dragons sessions, strategic board games, minipainting workshops, or LARP—there’s always a seat at our table.'
                    }
                    <br /><br />
                    {locale === 'nl' ? 'Elke woensdagavond' : 'Every Wednesday evening'} van 19:00 tot 22:00 @ <Link href='https://maps.app.goo.gl/FVc87bcAtS4VVuip8' className="location-link">Het Textielhuis (Rijselsestraat 19, 8500 Kortrijk)</Link>.
                </p>
                <div className="welcome-badges">
                    <span className="badge">{locale === 'nl' ? 'Bordspellen & TTRPG' : 'Boardgames & TTRPG'}</span>
                    <span className="badge">Minipainting & LARP</span>
                    <span className="badge">Kortrijk Geek Community</span>
                </div>
                <Link href={`/${locale}/${locale === 'nl' ? 'Doneren' : 'Donate'}`} className="donate-button">
                    {locale === 'nl' ? 'Steun Tarragon VZW' : 'Support Tarragon VZW'}
                </Link>
            </div>
            <EventList {...event_fetch} locale={locale} />
            <Featurettes data={filteredPages.data} locale={locale} />
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
                <SponsorList {...sponsors} locale={locale} />
            </div>
            <div className="dragonbox">
                <h1>Dragons</h1>
                <DragonList {...dragons} locale={locale} />
            </div>
            <div className="contactbox">
                <h1>Contact</h1>
                <div className="social-footer">
                    <Link href="https://www.facebook.com/TarragonVZW">Facebook</Link>
                    <Link href="https://www.instagram.com/tarragonvzw">Instagram</Link>
                    <Link href="https://discord.com/invite/TjDUu2Gkag">Discord</Link>
                </div>
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
