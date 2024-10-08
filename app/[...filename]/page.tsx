import PagePage from "./client-page";
import client from "../../tina/__generated__/client";

export async function generateStaticParams() {
    const pages = await client.queries.pageConnection();
    const paths = pages.data?.pageConnection?.edges?.map((edge) => ({
        filename: edge?.node?._sys.breadcrumbs,
    }));

    return paths || [];
}


export default async function Page({
    params,
}: {
    params: { filename: string[] };
}) {

    const data = await client.queries.page({
        relativePath: `${params.filename}.mdx`,
    });

    if (data.data.page.enabled) {
        return (
            <PagePage {...data}></PagePage>
        );
    }
    else {
        return <>Woopsies, this page is not on right now...</>
    }
}
