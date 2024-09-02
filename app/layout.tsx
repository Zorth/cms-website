import './global.css';
import Link from "next/link";
import React from "react";
import localFont from 'next/font/local';
import Image from 'next/image';

import TarragonTiny from "../public/images/Tarragon_Tiny.svg";
import TarragonTitle from "../public/images/Tarragon_Title.svg";
import CDLogo from "../public/images/CD_Logo.svg";

// Import local Fonts
const Rockwell = localFont({src: './fonts/Rockwell.woff2' })
const ORunde = localFont({src: './fonts/OpenRunde-Bold.woff2' })


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {


  return (
    <html lang="en" className={ORunde.className}>
      <head>
        <title>Tarragon</title>
      </head>
      <body >
        <header>
          <Link href="/"><div style={{'display':'flex', 'alignItems':'center'}}>
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
          <Link href="/#Events"><h1>Events</h1></Link>
          <Link href="/CD"><Image src={CDLogo} alt="Crossing Dimensions Logo"/></Link>
          <Link href="https://discord.com/invite/TjDUu2Gkag"><h1>Discord</h1></Link>
        </header>
        <main style={{ margin: "3rem", }} >
        <div className="padder" />
        {children}</main>
      </body>
    </html>
  );
}


