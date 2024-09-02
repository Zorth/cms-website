import Link from "next/link";

export default function Custom404()
{
    return (<div>
            <br/>
            <h1>Woopsies</h1>
            <h3>404</h3>
            <br/>
            <center>It look like the page you're trying to find isn't available right now.</center>
            <br/><br/>
            If you feel like there should be something there, please send us a message on <Link href="https://discord.com/invite/TjDUu2Gkag">Discord</Link> or send us an e-mail at <Link href="mailto:tarragonvzw@gmail.com">TarragonVZW@gmail.com</Link>
            </div>)
}
