import React from "react";
import { Composition } from "remotion";
import { Reel01AlRida } from "./Reel01AlRida";
import { Reel02AlIstikhara } from "./Reel02AlIstikhara";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Reel01AlRida"
        component={Reel01AlRida}
        durationInFrames={2490}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Reel02AlIstikhara"
        component={Reel02AlIstikhara}
        durationInFrames={2481}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
