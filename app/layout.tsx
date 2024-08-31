import './global.css';
import Link from "next/link";
import React from "react";
import localFont from 'next/font/local';

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
      <body
        style={{
          margin: "3rem",
        }}
      >
        <header>
          <Link href="/">Home</Link>
          {" | "}
          <Link href="/posts">Posts</Link>
          <h1>H1</h1>
          <h2>H2</h2>
          <h3>H3</h3>
          <h4>H4</h4>
          <b>B</b><br/>
          <i>I</i><br/>
          <a>A</a><br/>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}


