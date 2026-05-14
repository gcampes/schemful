import { Composition } from "remotion";
import { DemoVideo, TOTAL_FRAMES } from "./DemoVideo";
import { VIDEO_WIDTH, VIDEO_HEIGHT, FPS } from "./constants";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DemoVideo"
        component={DemoVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
      />
    </>
  );
};
