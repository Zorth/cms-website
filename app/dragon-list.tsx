"use client"
import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Link from 'next/link';
import Image from 'next/image';
import TarragonLogo from '../public/images/Tarragon_Full.svg';

export default function DragonList(props) {
    const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay()]);

    return (
        <>
            <div className="dragon-list" ref={emblaRef}>
                <div className="dragon-list-container">
                    {props.data.dragonConnection.edges
                        .map((dragon) => (DragonSnippet(dragon)))
                    }
                </div>
            </div>
            <Link href={"/404"} className="dragon-snippet red-hover" style={{ background: 'var(--primary_dark)' }}>
                <h1>Want to become a dragon?</h1>
                <p>Click here!</p>
            </Link>
        </>
    )
}

function DragonSnippet(dragon) {
    return (
        <div id={dragon.node.id} className="dragon-snippet-container">
            <div className="dragon-snippet">
                {dragon.node.image ? <Image
                    src={dragon.node.image}
                    alt={dragon.node.name}
                    width={1000}
                    height={1000}
                    className="dragon-image"
                /> : <Image
                    src={TarragonLogo}
                    alt={dragon.node.name}
                    width={500}
                    height={500}
                    className="dragon-image"
                />}
                <h1>{dragon.node.name}</h1>
                <h2>{dragon.node.title}</h2>
            </div>
        </div>
    )
}

