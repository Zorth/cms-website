/**
    * @type {import('tinacms').Collection}
    */
    export default {
        label: "Dragon",
        name: "dragon",
        path: "content/dragon",
        format: "mdx",
        fields: [
            {
                type: "string",
                label: "Name",
                name: "name",
            },
            {
                type: "string",
                label: "Title",
                name: "title",
            },
            {
                type: "rich-text",
                label: "Dragon Description",
                name: "body",
                isBody: true,
            },
            {
                type: "image",
                label: "Image",
                name: "image",
            },
        ],
        // ui: {
        //     router: ({ document }) => {
        //         return `/dragon/${document._sys.filename}`;
        //     },
        // },
    };
