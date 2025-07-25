import { generateUploadButton } from "@uploadthing/react";
// If you have a type for your file router, import it here:
// import type { OurFileRouter } from "../../app/api/uploadthing/core";

// For now, use any as the type if the type is not available
export const UploadButton = generateUploadButton<any>(); 