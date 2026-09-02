"use client";

import { NextStudio } from "next-sanity/studio";
import { createFanPhotoStudioConfig } from "./studio.config";

export default function StudioClient({ projectId, dataset }) {
  return <NextStudio config={createFanPhotoStudioConfig(projectId, dataset)} />;
}
