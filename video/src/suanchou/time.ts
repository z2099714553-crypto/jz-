import { useCurrentFrame, useVideoConfig } from "remotion";
import { ANIM_FPS } from "./script";

/**
 * 以 30 帧为单位的动画时间（可以是小数）。
 * 各场景的帧号都按 30fps 写，输出 60fps 时这里返回 0, 0.5, 1, 1.5 …，
 * 时间点不变，运动多一倍的中间帧。
 */
export const useTick = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (frame * ANIM_FPS) / fps;
};
