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
