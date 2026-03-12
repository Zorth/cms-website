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
                        <svg 
                            width="32" 
                            height="32" 
                            viewBox="0 -28.5 256 256" 
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M216.856 16.597A108.502 108.502 0 0 0 151.047 0l-2.99 6.301c-24.11-3.386-48.404-3.386-72.514 0l-3.151-6.301a108.502 108.502 0 0 0-65.81 16.597C-23.75 75.834-3.57 132.85 18.375 168.125a110.15 110.15 0 0 0 66.293 31.875l12.91-16.136a72.51 72.51 0 0 1-41.29-25.806l12.1-5.645a110.15 110.15 0 0 0 11.29 4.839 108.502 108.502 0 0 0 20.968 5.645 108.502 108.502 0 0 0 30.645 3.226 108.502 108.502 0 0 0 30.645-3.226 108.502 108.502 0 0 0 20.968-5.645 108.502 108.502 0 0 0 11.29-4.839l12.1 5.645a72.51 72.51 0 0 1-41.29 25.806l12.91 16.136a110.15 110.15 0 0 0 66.293-31.875c21.945-35.275 42.125-92.291-1.481-151.528ZM85.548 116.129c-12.903 0-24.193-11.29-24.193-25.806 0-14.517 11.29-25.807 24.193-25.807 12.904 0 24.194 11.29 24.194 25.807 0 14.516-11.29 25.806-24.194 25.806Zm84.678 0c-12.904 0-24.194-11.29-24.194-25.806 0-14.517 11.29-25.807 24.194-25.807 12.903 0 24.193 11.29 24.193 25.807 0 14.516-11.29 25.806-24.193 25.806Z"/>
                        </svg>
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
