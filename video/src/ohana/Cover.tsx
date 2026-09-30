import React from "react";
import { AbsoluteFill } from "remotion";
import { Grain } from "./common";
import { CANVAS_H, CANVAS_W, END_CARD } from "./script";
import { FONT_EN, FONT_ZH, HOME, RED, ensureFonts } from "./theme";

ensureFonts();

/**
 * 封面：片尾最后一幕（圆满的圈、片名、献词）铺满竖屏，不留上下黑边。
 * 元素、配色、字体与片尾 SEndCircle 定格时一致，尺寸按竖屏放大。
 */
const C = { x: CANVAS_W / 2, y: 820, r: 340 };

export const OhanaCover: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse 85% 60% at 50% 43%, #FFF9EE 0%, ${HOME.paper} 62%, #EBDFC8 100%)` }}>
    <svg viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`} width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute" }}>
      <circle cx={C.x} cy={C.y} r={C.r} fill="none" stroke="#F4C98A" strokeWidth={26} opacity={0.3} style={{ filter: "blur(12px)" }} />
      <circle cx={C.x} cy={C.y} r={C.r} fill="none" stroke="#C9A06A" strokeWidth={3.5} />
      <circle cx={C.x} cy={C.y - C.r} r={24} fill={RED} opacity={0.08} />
      <circle cx={C.x} cy={C.y - C.r} r={12} fill={RED} />
    </svg>
    <div style={{ position: "absolute", left: 0, right: 0, top: C.y - 108, textAlign: "center" }}>
      <div style={{ fontFamily: FONT_ZH, fontWeight: 600, fontSize: 86, letterSpacing: "0.2em", marginRight: "-0.2em", color: HOME.ink }}>{END_CARD.title}</div>
      <div style={{ fontFamily: FONT_EN, fontStyle: "italic", fontSize: 38, color: HOME.inkSoft, marginTop: 20 }}>{END_CARD.titleEn}</div>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: C.y + C.r + 150, textAlign: "center", fontFamily: FONT_ZH, color: HOME.inkSoft }}>
      <div style={{ fontSize: 40, letterSpacing: "0.3em", marginRight: "-0.3em" }}>{END_CARD.dedication}</div>
      <div style={{ fontSize: 24, letterSpacing: "0.3em", marginRight: "-0.3em", marginTop: 34, opacity: 0.75 }}>{END_CARD.credit}</div>
    </div>
    <Grain opacity={0.05} />
  </AbsoluteFill>
);
