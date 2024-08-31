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
    <html lang="en" className={Rockwell.className}>
      <body
        style={{
          margin: "3rem",
        }}
      >
        <header>
          <Link href="/">Home</Link>
          {" | "}
          <Link href="/posts">Posts</Link>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}


