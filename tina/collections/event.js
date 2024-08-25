/**
    * @type {import('tinacms').Collection}
    */
    export default {
        label: "Event",
        name: "event",
        path: "content/event",
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
                type: "string",
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
