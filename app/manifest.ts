import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cosmic Chicken Rhapsody",
    short_name: "Cosmic Chicken",
    description: "",
    start_url: "/",
    display: "standalone",
    background_color: "#000",
    theme_color: "#000",
    icons: [
      {
        src: "/images/icons/icon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        src: "/images/icons/icon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/images/icons/icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
      },
      {
        src: "/images/icons/icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        src: "/images/icons/icon-120x120.png",
        sizes: "120x120",
        type: "image/png",
      },
      {
        src: "/images/icons/icon-128x128.png",
        sizes: "128x128",
        type: "image/png",
      },
      {
        src: "/images/icons/icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
      },
      {
        src: "/images/icons/icon-152x152.png",
        sizes: "152x152",
        type: "image/png",
      },
      {
        src: "/images/icons/icon-180x180.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/images/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/images/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
      },
      {
        src: "/images/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/images/icons/512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    // iconss: [
    //   {
    //     src: "/public/images/icons/icon-72.png",
    //     sizes: "72x72",
    //     type: "image/png",
    //     // purpose: "maskable",
    //   },
    //   {
    //     src: "/images/icons/icon9-6.png",
    //     sizes: "96x96",
    //     type: "image/png",
    //     // purpose: "any maskable",
    //   },
    //   {
    //     src: "/images/icons/icon-128.png",
    //     sizes: "128x128",
    //     type: "image/png",
    //     // purpose: "any maskable",
    //   },
    //   {
    //     src: "/images/icons/icon-144.png",
    //     sizes: "144x144",
    //     type: "image/png",
    //     // purpose: "any maskable",
    //   },
    //   {
    //     src: "/public/images/icons/icon-152.png",
    //     sizes: "152x152",
    //     type: "image/png",
    //     // purpose: "any maskable",
    //   },
    //   {
    //     src: "/images/icons/icon-192.png",
    //     sizes: "192x192",
    //     type: "image/png",
    //     // purpose: "any maskable",
    //   },
    //   {
    //     src: "/images/icons/icon-384.png",
    //     sizes: "384x384",
    //     type: "image/png",
    //     // purpose: "any maskable",
    //   },
    //   {
    //     src: "/images/icons/icon-512.png",
    //     sizes: "512x512",
    //     type: "image/png",
    //     // purpose: "any maskable",
    //   },
    // ],
  };
}
