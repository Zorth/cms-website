import './global.css';
import Link from "next/link";
import React from "react";
import localFont from 'next/font/local';
import Image from 'next/image';

import TarragonTiny from "../public/images/Tarragon_Tiny.svg";
import TarragonTitle from "../public/images/Tarragon_Title.svg";
import client from '../tina/__generated__/client';
import HeaderPages from './headerpages';

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


export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    const pages = await client.queries.pageConnection({ filter: { enabled: { eq: true } } });

    return (
        <html lang="en" className={`${Rockwell.variable} ${ORunde.variable}`}>
            <head>
                <title>Tarragon</title>
            </head>
            <body>
                <header>
                    <Link href="/" className="header-logo">
                        <Image
                            src={TarragonTiny}
                            alt="Tarragon Logo"
                            className="header-img"
                        />
                        <Image
                            src={TarragonTitle}
                            alt="Tarragon Text"
                            className="TarragonTitle"
                        />
                    </Link>
                    <HeaderPages {...pages} />
                    <Link href="https://discord.com/invite/TjDUu2Gkag" className="discord-link">
                        <h2>Discord</h2>
                    </Link>
                </header>
                <div className="padder"></div>
                <main className="main-wrapper">
                    {children}
                </main>
            </body>
        </html>
    );
}
