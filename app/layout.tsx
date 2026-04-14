import './global.css';
import React from "react";
import localFont from 'next/font/local';
import { Metadata } from 'next';

import client from '../tina/__generated__/client';
import Header from './Header';
import ConvexClientProvider from './ConvexClientProvider';

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
        default: 'Tarragon | TTRPG, Boardgames & Geek Community Kortrijk',
        template: '%s | Tarragon'
    },
    description: 'Tarragon is een VZW in Kortrijk voor fans van Dungeons & Dragons, bordspellen (boardgames), LARP, minipainting en geek cultuur. Sluit je aan bij onze wekelijkse speelavonden!',
    keywords: [
        'Boardgames Kortrijk', 'Bordspellen Kortrijk', 'TTRPG Kortrijk', 'Kortrijk Tabletop', 
        'D&D Kortrijk', 'Dungeons and Dragons Belgium', 'LARP Kortrijk', 'Minipainting Kortrijk',
        'Geek community Kortrijk', 'Gezelschapspellen Kortrijk', 'Roleplaying games Belgium'
    ],
    openGraph: {
        title: 'Tarragon | TTRPG & Geek Community Kortrijk',
        description: 'De gezelligste community voor rollenspellen, bordspellen en geek cultuur in Kortrijk.',
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
}: {
    children: React.ReactNode;
}) {
    // Fetch ALL enabled pages so the client-side Header can filter them by locale
    const pages = await client.queries.pageConnection({ 
        filter: { 
            enabled: { eq: true }
        } 
    });

    return (
        <html className={`${Rockwell.variable} ${ORunde.variable}`}>
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "SocialGroup",
                            "name": "Tarragon",
                            "url": "https://tarragon.be",
                            "logo": "https://tarragon.be/images/Tarragon_Full.svg",
                            "description": "VZW in Kortrijk voor Tabletop RPGs, bordspellen, LARP en geek cultuur. Wekelijkse evenementen in Het Textielhuis.",
                            "address": {
                                "@type": "PostalAddress",
                                "streetAddress": "Rijselsestraat 19",
                                "addressLocality": "Kortrijk",
                                "postalCode": "8500",
                                "addressRegion": "West-Vlaanderen",
                                "addressCountry": "BE"
                            },
                            "location": {
                                "@type": "Place",
                                "name": "Het Textielhuis",
                                "url": "https://www.bolwerk.be/projecten/het-textielhuis",
                                "address": {
                                    "@type": "PostalAddress",
                                    "streetAddress": "Rijselsestraat 19",
                                    "addressLocality": "Kortrijk",
                                    "postalCode": "8500",
                                    "addressCountry": "BE"
                                }
                            },
                            "foundingDate": "2023",
                            "knowsAbout": ["Dungeons & Dragons", "Board games", "Tabletop RPGs", "LARP", "Miniature Painting"],
                            "sameAs": [
                                "https://discord.com/invite/TjDUu2Gkag",
                                "https://www.facebook.com/TarragonVZW",
                                "https://www.instagram.com/tarragonvzw"
                            ]
                        })
                    }}
                />
            </head>
            <body>
                <Header pagesData={pages.data} />
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
