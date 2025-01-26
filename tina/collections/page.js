export default {
    label: "Page Content",
    name: "page",
    path: "content/page",
    format: "mdx",
    fields: [
        {
            name: "body",
            label: "Main Content",
            type: "rich-text",
            isBody: true,
        },
        {
            name: "enabled",
            label: "Enabled",
            type: "boolean",
        },
        {
            name: "snippet",
            label: "Snippet",
            type: "rich-text",
        },
        {
            name: "icon",
            label: "Icon",
            type: "image",
        }
    ],
    ui: {
        router: ({ document }) => {
            if (document._sys.filename === "home") {
                return `/`;
            }
            return `/${document._sys.filename}`;
        },
    },
};
