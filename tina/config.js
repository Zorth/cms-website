import { defineConfig } from "tinacms";
import page from "./collections/page";
import event from "./collections/event";
import dragon from "./collections/dragon";
import sponsor from "./collections/sponsor";

export const config = defineConfig({
    clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
    branch:
        process.env.NEXT_PUBLIC_TINA_BRANCH || // custom branch env override
        process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF || // Vercel branch env
        process.env.HEAD, // Netlify branch env
    token: process.env.TINA_TOKEN,
    media: {
        // If you wanted cloudinary do this
        // loadCustomStore: async () => {
        //   const pack = await import("next-tinacms-cloudinary");
        //   return pack.TinaCloudCloudinaryMediaStore;
        // },
        // this is the config for the tina cloud media store
        tina: {
            publicFolder: "public",
            mediaRoot: "uploads",
            static: false,
        },
    },
    build: {
        publicFolder: "public", // The public asset folder for your framework
        outputFolder: "admin", // within the public folder
    },
    schema: {
        collections: [page, event, dragon, sponsor],
    },
    search: {
        tina: {
            indexerToken: 'c336d6a3b8ca5a68a460132ee55e30c5ca75b6f4',
            stopwordLanguages: ['eng', 'nld'],
        },
        indexBatchSize: 100,
        maxSearchIndexFieldLength: 100,
    },
});

export default config;
