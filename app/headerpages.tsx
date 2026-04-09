import Image from 'next/image';
import Link from "next/link";
import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export default function HeaderPages(props: any) {
    const locale = props.locale || 'nl';
    return (
        <nav className="header-nav">
            {props.data.pageConnection.edges.map((page: any) => {
                const IconComponent = page.node?.iconName ? (LucideIcons as any)[page.node.iconName] as LucideIcon : null;

                return (
                    <Link 
                        key={page.node?.id} 
                        href={`/${locale}/${page.node?._sys.filename}`}
                        className="header-nav-link"
                        title={page.node?.title || ""}
                    >
                        {page.node?.icon ? (
                            <Image
                                src={page.node.icon}
                                alt={page.node.title || ""}
                                width={40}
                                height={40}
                                className="header-nav-icon"
                            />
                        ) : IconComponent ? (
                            <IconComponent 
                                size={32} 
                                className="header-nav-icon" 
                                color="var(--secondary)" 
                            />
                        ) : (
                            <span>{page.node?.title}</span>
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
