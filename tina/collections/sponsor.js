/**
    * @type {import('tinacms').Collection}
    */
    export default {
        label: "Sponsor",
        name: "sponsor",
        path: "content/sponsor",
        format: "mdx",
        fields: [
            {
                type: "string",
                label: "Name",
                name: "name",
            },
            {
                type: "string",
                label: "Link",
                name: "link",
            },
            {
                type: "rich-text",
                label: "Snippet",
                name: "snippet",
            },
            {
                type: "rich-text",
                label: "Sponsor Description",
                name: "body",
                isBody: true,
            },
            {
                type: "image",
                label: "Image",
                name: "image",
            },
            {
                name: "language",
                label: "Language",
                type: "string",
                options: [
                    { label: "Dutch", value: "nl" },
                    { label: "English", value: "en" },
                ],
            },
        ],
        ui: {
            router: ({ document }) => {
                return `/sponsor/${document._sys.filename}`;
            },
        },
    };
