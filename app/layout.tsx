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
const Rockwell = localFont({ src: './fonts/Rockwell.woff2' })
const ORunde = localFont({ src: './fonts/OpenRunde-Bold.woff2' })


export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    const pages = await client.queries.pageConnection({ filter: { enabled: { eq: true } } });

    return (
        <html lang="en" className={ORunde.className}>
            <head>
                <title>Tarragon</title>
            </head>
            <body >
                <header>
                    <Link href="/"><div style={{ 'display': 'flex', 'alignItems': 'center' }}>
                        <Image
                            src={TarragonTiny}
                            alt="Tarragon Logo"
                        />
                        <Image
                            src={TarragonTitle}
                            alt="Tarragon Text"
                            className="TarragonTitle"
                        />
                    </div></Link>
                    {/* <Link href="/#Events"><h1>Events</h1></Link> */}
                    <HeaderPages  {...pages} />
                    <Link href="https://discord.com/invite/TjDUu2Gkag"><h2>Discord</h2></Link>
                </header>
                <main style={{ margin: "3rem", }} >
                    <div className="padder" />
                    {children}</main>
            </body>
        </html>
    );
}


