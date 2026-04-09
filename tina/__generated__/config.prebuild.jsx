// tina/config.js
import { defineConfig } from "tinacms";

// tina/collections/page.js
var page_default = {
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
      required: true
    },
    {
      name: "body",
      label: "Main Content",
      type: "rich-text",
      isBody: true
    },
    {
      name: "enabled",
      label: "Enabled",
      type: "boolean"
    },
    {
      name: "weight",
      label: "Order Weight",
      type: "number",
      description: "Lower numbers appear first."
    },
    {
      name: "snippet",
      label: "Snippet",
      type: "rich-text"
    },
    {
      name: "icon",
      label: "Icon",
      type: "image"
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
        { label: "Gamepad", value: "Gamepad" }
      ]
    },
    {
      name: "language",
      label: "Language",
      type: "string",
      options: [
        { label: "Dutch", value: "nl" },
        { label: "English", value: "en" }
      ]
    },
    {
      name: "translation",
      label: "Translation Page",
      type: "reference",
      collections: ["page"]
    }
  ],
  ui: {
    router: ({ document }) => {
      if (document._sys.filename === "home") {
        return `/`;
      }
      return `/${document._sys.filename}`;
    }
  }
};

// tina/collections/event.js
var event_default = {
  label: "Event",
  name: "event",
  path: "content/event",
  format: "mdx",
  fields: [
    {
      type: "string",
      label: "Title",
      name: "title"
    },
    {
      type: "datetime",
      label: "Date",
      name: "date",
      required: true
    },
    {
      type: "rich-text",
      label: "Event Description",
      name: "body",
      isBody: true
    },
    {
      type: "string",
      label: "Sign-up URL",
      name: "signupUrl"
    },
    {
      type: "object",
      label: "Groups",
      name: "groups",
      list: true,
      ui: {
        itemProps: (item) => {
          return { label: item?.name };
        }
      },
      fields: [
        {
          type: "string",
          label: "Name",
          name: "name",
          required: true
        },
        {
          type: "string",
          label: "Description",
          name: "description"
        },
        {
          type: "number",
          label: "Max Slots",
          name: "maxSlots",
          required: true
        }
      ]
    }
  ],
  ui: {
    router: ({ document }) => {
      return `/event/${document._sys.filename}`;
    }
  }
};

// tina/collections/dragon.js
var dragon_default = {
  label: "Dragon",
  name: "dragon",
  path: "content/dragon",
  format: "mdx",
  fields: [
    {
      type: "string",
      label: "Name",
      name: "name"
    },
    {
      type: "string",
      label: "Title",
      name: "title"
    },
    {
      type: "rich-text",
      label: "Dragon Description",
      name: "body",
      isBody: true
    },
    {
      type: "image",
      label: "Image",
      name: "image"
    }
  ]
  // ui: {
  //     router: ({ document }) => {
  //         return `/dragon/${document._sys.filename}`;
  //     },
  // },
};

// tina/collections/sponsor.js
var sponsor_default = {
  label: "Sponsor",
  name: "sponsor",
  path: "content/sponsor",
  format: "mdx",
  fields: [
    {
      type: "string",
      label: "Name",
      name: "name"
    },
    {
      type: "string",
      label: "Link",
      name: "link"
    },
    {
      type: "rich-text",
      label: "Snippet",
      name: "snippet"
    },
    {
      type: "rich-text",
      label: "Sponsor Description",
      name: "body",
      isBody: true
    },
    {
      type: "image",
      label: "Image",
      name: "image"
    }
  ],
  ui: {
    router: ({ document }) => {
      return `/sponsor/${document._sys.filename}`;
    }
  }
};

// tina/config.js
var config = defineConfig({
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  branch: process.env.NEXT_PUBLIC_TINA_BRANCH || // custom branch env override
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF || // Vercel branch env
  process.env.HEAD,
  // Netlify branch env
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
      static: false
    }
  },
  build: {
    publicFolder: "public",
    // The public asset folder for your framework
    outputFolder: "admin"
    // within the public folder
  },
  schema: {
    collections: [page_default, event_default, dragon_default, sponsor_default]
  },
  search: {
    tina: {
      indexerToken: "c336d6a3b8ca5a68a460132ee55e30c5ca75b6f4",
      stopwordLanguages: ["eng"]
    },
    indexBatchSize: 100,
    maxSearchIndexFieldLength: 100
  }
});
var config_default = config;
export {
  config,
  config_default as default
};
