/**
    * @type {import('tinacms').Collection}
    */
    export default {
        label: "Event",
        name: "event",
        path: "content/event",
        format: "mdx",
        fields: [
            {
                type: "string",
                label: "Title",
                name: "title",
            },
            {
                type: "datetime",
                label: "Date",
                name: "date",
            },
            {
                type: "rich-text",
                label: "Event Description",
                name: "body",
                isBody: true,
            },
        ],
        ui: {
            router: ({ document }) => {
                return `/event/${document._sys.filename}`;
            },
        },
    };
