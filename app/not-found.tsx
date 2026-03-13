import Link from "next/link";
import Image from "next/image";
import DiscordIcon from "../public/images/discord-icon.svg";

export default function Custom404()
{
    return (<div>
            <br/>
            <h1>Woopsies</h1>
            <h3>404</h3>
            <br/>
            <center>It look like the page you&apos;re trying to find isn&apos;t available right now.</center>
            <br/><br/>
            If you feel like there should be something there, please send us a message on <Link href="https://discord.com/invite/TjDUu2Gkag" className="discord-link">
                <Image
                    src={DiscordIcon}
                    alt="Discord"
                    width={20}
                    height={20}
                />
                Discord
            </Link> or send us an e-mail at <Link href="mailto:tarragonvzw@gmail.com">TarragonVZW@gmail.com</Link>
            </div>)
}
