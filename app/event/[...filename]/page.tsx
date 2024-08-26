import Event from "./client-page";
import client from "../../../tina/__generated__/client";

export async function generateStaticParams() {
  const pages = await client.queries.eventConnection();
  const paths = pages.data?.eventConnection?.edges?.map((edge) => ({
    filename: edge?.node?._sys.breadcrumbs,
  }));

  return paths || [];
}


export default async function PostPage({
  params,
}: {
  params: { filename: string[] };
}) {

  const data = await client.queries.event({
    relativePath: `${params.filename}.md`,
  });

  return (
    <Event {...data}></Event>
  );
}
