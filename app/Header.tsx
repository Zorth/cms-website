"use client";

import Link from "next/link";
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';
import HeaderPages from './headerpages';

import TarragonTiny from "../public/images/Tarragon_Tiny.svg";
import TarragonTitle from "../public/images/Tarragon_Title.svg";
import DiscordIcon from "../public/images/discord-icon.svg";

export default function Header({ pagesData }: { pagesData: any }) {
    const pathname = usePathname();
    
    // Detect locale from pathname (e.g., /nl/page -> nl, /en/page -> en)
    const segments = pathname.split('/');
    const locale = (segments[1] === 'en' || segments[1] === 'nl') ? segments[1] : 'nl';
    
    // Determine the target for the toggle
    const targetLocale = locale === 'nl' ? 'en' : 'nl';
    
    // Create the target path for the toggle
    // If we are on a page like /nl/about, we want to go to /en/about
    // If we are on /event/xyz, we just go to /en (or /nl) because events don't have locales
    let toggleHref = `/${targetLocale}`;
    if (segments[1] === 'en' || segments[1] === 'nl') {
        const remainingPath = segments.slice(2).join('/');
        toggleHref = `/${targetLocale}${remainingPath ? '/' + remainingPath : ''}`;
    }

    return (
        <header>
            <Link href={`/${locale}`} className="header-logo">
                <Image
                    src={TarragonTiny}
                    alt="Tarragon Logo"
                    className="header-img"
                    width={35}
                    height={35}
                />
                <Image
                    src={TarragonTitle}
                    alt="Tarragon Title"
                    className="header-title"
                    width={150}
                    height={30}
                />
            </Link>
            <HeaderPages data={pagesData} locale={locale} />
            <div className="header-right">
                <Link href={toggleHref} className="lang-toggle">
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
    );
}
