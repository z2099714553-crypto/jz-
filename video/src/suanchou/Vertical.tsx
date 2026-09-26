import React from "react";
import { AbsoluteFill } from "remotion";
import { HEIGHT, WIDTH } from "./script";
import { SuanChou, SuanChouProps } from "./SuanChou";

/** 竖屏版：1080×1920 黑底，中间放横向画面，和抖音上横屏视频的观感一致 */
export const SuanChouVertical: React.FC<SuanChouProps> = (props) => {
  const scale = 1080 / WIDTH;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: (1920 - HEIGHT * scale) / 2,
          width: WIDTH,
          height: HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "0 0",
          overflow: "hidden",
        }}
      >
        <SuanChou {...props} />
      </div>
    </AbsoluteFill>
  );
};
