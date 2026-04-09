import './global.css';
import Link from "next/link";
import React from "react";
import localFont from 'next/font/local';
import Image from 'next/image';
import { Metadata } from 'next';

import TarragonTiny from "../public/images/Tarragon_Tiny.svg";
import TarragonTitle from "../public/images/Tarragon_Title.svg";
import DiscordIcon from "../public/images/discord-icon.svg";
import client from '../tina/__generated__/client';
import HeaderPages from './headerpages';
import ConvexClientProvider from './ConvexClientProvider';
import { Globe } from 'lucide-react';

// Import local Fonts
const Rockwell = localFont({
    src: [
        {
            path: './fonts/Rockwell.woff2',
            weight: '700',
            style: 'normal',
        },
    ],
    variable: '--font-rockwell',
})

const ORunde = localFont({
    src: [
        {
            path: './fonts/OpenRunde-Regular.woff2',
            weight: '400',
            style: 'normal',
        },
        {
            path: './fonts/OpenRunde-Medium.woff2',
            weight: '500',
            style: 'normal',
        },
        {
            path: './fonts/OpenRunde-Semibold.woff2',
            weight: '600',
            style: 'normal',
        },
        {
            path: './fonts/OpenRunde-Bold.woff2',
            weight: '700',
            style: 'normal',
        },
    ],
    variable: '--font-orunde',
})

export const metadata: Metadata = {
    title: {
        default: 'Tarragon | TTRPG & Geek Community Kortrijk',
        template: '%s | Tarragon'
    },
    description: 'Tarragon is een VZW in Kortrijk voor fans van Dungeons & Dragons, boardgames en geek cultuur. Sluit je aan bij onze wekelijkse speelavonden!',
    keywords: ['D&D Kortrijk', 'Dungeons and Dragons Belgium', 'TTRPG Kortrijk', 'Boardgames Kortrijk', 'Geek community', 'Roleplaying games'],
    openGraph: {
        title: 'Tarragon | TTRPG & Geek Community Kortrijk',
        description: 'De gezelligste community voor rollenspellen en boardgames in Kortrijk.',
        url: 'https://tarragon.be',
        siteName: 'Tarragon',
        locale: 'nl_BE',
        type: 'website',
    },
    robots: {
        index: true,
        follow: true,
    }
};

export default async function RootLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    const locale = params.locale || 'nl';

    const pages = await client.queries.pageConnection({ 
        filter: { 
            enabled: { eq: true },
            language: { eq: locale }
        } 
    });

    return (
        <html lang={locale} className={`${Rockwell.variable} ${ORunde.variable}`}>
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "NGO",
                            "name": "Tarragon",
                            "url": "https://tarragon.be",
                            "logo": "https://tarragon.be/images/Tarragon_Full.svg",
                            "description": "VZW in Kortrijk voor Tabletop RPGs en geek cultuur.",
                            "address": {
                                "@type": "PostalAddress",
                                "addressLocality": "Kortrijk",
                                "addressRegion": "West-Vlaanderen",
                                "addressCountry": "BE"
                            },
                            "sameAs": [
                                "https://discord.com/invite/TjDUu2Gkag"
                            ]
                        })
                    }}
                />
            </head>
            <body>
                <header>
                    <Link href={`/${locale}`} className="header-logo">
                        <Image
                            src={TarragonTiny}
                            alt="Tarragon Logo"
                            className="header-img"
                        />
                        <Image
                            src={TarragonTitle}
                            alt="Tarragon Title"
                            className="header-title"
                        />
                    </Link>
                    <HeaderPages data={pages.data} locale={locale} />
                    <div className="header-right">
                        <Link href={locale === 'nl' ? '/en' : '/nl'} className="lang-toggle">
                            <Globe size={20} />
                            <span>{locale === 'nl' ? 'EN' : 'NL'}</span>
                        </Link>
                        <Link href="https://discord.com/invite/TjDUu2Gkag" className="discord-link">
                            <Image
                                src={DiscordIcon}
                                alt="Discord"
                                width={32}
                                height={32}
                                className="header-nav-icon"
                            />
                        </Link>
                    </div>
                </header>
                <div className="padder"></div>
                <main className="main-wrapper">
                    <ConvexClientProvider>
                        {children}
                    </ConvexClientProvider>
                </main>
            </body>
        </html>
    );
}
