export default {
    label: "Page Content",
    name: "page",
    path: "content/page",
    format: "mdx",
    fields: [
        {
            name: "title",
            label: "Title",
            type: "string",
            isTitle: true,
            required: true,
        },
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
        },
        {
            name: "iconName",
            label: "Lucide Icon Name",
            type: "string",
            options: [
                { label: "Dices", value: "Dices" },
                { label: "Sparkles", value: "Sparkles" },
                { label: "Calendar", value: "Calendar" },
                { label: "Map", value: "Map" },
                { label: "Users", value: "Users" },
                { label: "Book", value: "Book" },
                { label: "Sword", value: "Sword" },
                { label: "Gamepad", value: "Gamepad" },
            ],
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
        {
            name: "translation",
            label: "Translation Page",
            type: "reference",
            collections: ["page"],
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
