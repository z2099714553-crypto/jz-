import React from "react";
import { AbsoluteFill } from "remotion";
import { Scrim, Vignette } from "../common";
import { Cue } from "../script";
import { FONT_ZH, HOME, SEA } from "../theme";

/** 还没做的场景：按明暗铺底色，标出场号与分镜，字幕照常出现，方便先看整片节奏 */
const SHOTS: Record<string, string> = {
  s07: "老照片质感，一位老人的剪影",
  s08: "一叠病历，一盏台灯",
  s09: "一本书合上，飞过海面",
  s10: "纯白底，四句话依次出现",
  s11: "细线从檀香山划过太平洋，落到中国东海岸",
  s12: "左右分屏：左边夕阳，右边正午",
  s13: "北仑港的吊机与海面，镜头推向海浪",
  s14: "夏威夷海岸，一个人的背影",
  s15: "图1 妈妈淡入，发丝衣角随风，湖面涟漪",
  s16: "妈妈双手合在胸前，四句话化成光点绕着她",
  s17: "图2 爸爸大笑搭着我的肩，树影晃动",
  s18: "爸爸的手在我肩上轻轻拍两下",
  s19: "图1、图2 并排，中间一条海平线",
  s20: "四句话再次出现，每句后接一个词",
  s21: "画面变空，只剩一个圆，缩成「0」",
  s22: "「0」停住不动",
  s23: "图3 窗台上的念念，眨眼，耳朵抖动，窗外灯光",
  s24: "图4 沙发上的念念看镜头，尾巴摆动",
  s25: "图5 念念在茶几上伸成一条，肚子起伏",
  s26: "妈妈、爸爸、我、念念依次滑入同一画面",
  s27: "四个形象站定，背景从夏威夷的海过渡到北仑的海",
  s28: "四句话最后一次出现，说给家人",
  s29: "念念特写，眨眼",
  end: "米白底，「0」变成圆满的圈",
};

export const Placeholder: React.FC<{ cue: Cue }> = ({ cue }) => {
  const dark = cue.tone === "dark";
  return (
    <AbsoluteFill
      style={{
        background: dark
          ? `radial-gradient(ellipse 80% 70% at 50% 42%, ${SEA.sea} 0%, ${SEA.night} 70%, ${SEA.abyss} 100%)`
          : `radial-gradient(ellipse 80% 70% at 50% 42%, #FBF6EC 0%, ${HOME.paper} 60%, ${HOME.sand} 100%)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 300,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONT_ZH,
          color: dark ? "rgba(238,244,244,0.35)" : "rgba(43,38,34,0.32)",
        }}
      >
        <div style={{ fontSize: 30, letterSpacing: "0.3em" }}>{cue.id === "end" ? "片尾" : `第 ${cue.id.slice(1)} 场`} · 待制作</div>
        <div style={{ fontSize: 26, marginTop: 18 }}>{SHOTS[cue.id] ?? ""}</div>
      </div>
      <Vignette strength={dark ? 0.55 : 0.18} />
      <Scrim tone={cue.tone} />
    </AbsoluteFill>
  );
};
