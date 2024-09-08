"use client"
import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

export default function DragonList(props) {
    const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay()]);

    return (
        <div className="dragon-list" ref={emblaRef}>
            <div className="dragon-list-container">
                {props.data.dragonConnection.edges
                    .map((dragon) => (DragonSnippet(dragon)))
                }
                <div className="dragon-snippet-container"><div className="dragon-snippet" style={{ background: 'var(--primary_dark)' }}>
                    <h1>Want to become a dragon?</h1>
                    <p>Click here!</p>
                </div></div>
            </div>
        </div>
    )
}

function DragonSnippet(dragon) {
    return (
        <div id={dragon.node.id} className="dragon-snippet-container">
            <div className="dragon-snippet">{dragon.node.name}
            </div>
        </div>
    )
}

