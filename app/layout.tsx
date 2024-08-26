import Link from "next/link";
import React from "react";
import EventList from "./event-list";
import { client } from "../tina/__generated__/client";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pages = await client.queries.eventConnection();


  return (
    <html lang="en">
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
        { /*<EventList {...pages} />  */}
      </body>
    </html>
  );
}



