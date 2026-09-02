import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import fanPhotoSubmission from "../../sanity/schemaTypes/fanPhotoSubmission";

export function createFanPhotoStudioConfig(projectId: string, dataset: string) {
  if (!/^[a-z0-9-]+$/.test(projectId) || !/^[a-z0-9_-]+$/.test(dataset)) {
    throw new Error("Invalid private fan-photo Studio configuration");
  }

  return defineConfig({
    name: "fan-photo-review",
    title: "Briella Steiner — Fan Photo Review",
    projectId,
    dataset,
    basePath: "/fan-photo-review",
    plugins: [structureTool()],
    schema: { types: [fanPhotoSubmission] },
  });
}
