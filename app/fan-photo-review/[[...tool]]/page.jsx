import { getFanPhotoConfiguration } from "../../../lib/fan-photos";
import StudioClient from "../StudioClient";

export default function FanPhotoReviewStudio() {
  const configuration = getFanPhotoConfiguration();

  if (!configuration.configured) {
    return (
      <div className="interior-page">
        <section className="interior-hero">
          <p className="eyebrow">Private review</p>
          <h1>Fan photo review is locked</h1>
          <p className="interior-lead">
            {configuration.reason} No submissions can be accepted or reviewed until the
            separate private dataset and matching server settings are configured.
          </p>
        </section>
      </div>
    );
  }

  return (
    <StudioClient projectId={configuration.projectId} dataset={configuration.dataset} />
  );
}
