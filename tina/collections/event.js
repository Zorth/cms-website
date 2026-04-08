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
                required: true,
            },
            {
                type: "rich-text",
                label: "Event Description",
                name: "body",
                isBody: true,
            },
            {
                type: "string",
                label: "Sign-up URL",
                name: "signupUrl",
            },
            {
                type: "object",
                label: "Groups",
                name: "groups",
                list: true,
                fields: [
                    {
                        type: "string",
                        label: "Name",
                        name: "name",
                        required: true,
                    },
                    {
                        type: "number",
                        label: "Max Slots",
                        name: "maxSlots",
                        required: true,
                    },
                ],
            },
        ],
        ui: {
            router: ({ document }) => {
                return `/event/${document._sys.filename}`;
            },
        },
    };
