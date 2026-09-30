import "./index.css";
import { Composition, Folder, Still } from "remotion";
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from "./suanchou/script";
import { SuanChou } from "./suanchou/SuanChou";
import { SuanChouVertical } from "./suanchou/Vertical";
import { OhanaCover } from "./ohana/Cover";
import { OhanaFull, chapterComponent } from "./ohana/Film";
import * as Ohana from "./ohana/script";

// 《零极限 · 家》每章一个 Composition，外加整片
const OHANA_CHAPTER_IDS: Record<string, string> = {
  ch1: "Ohana-1-Sea",
  ch2: "Ohana-2-FourPhrases",
  ch3: "Ohana-3-8000km",
  ch4: "Ohana-4-Home",
  ch5: "Ohana-5-Niannian",
};
const OHANA_CHAPTERS = Ohana.CHAPTERS.map((ch) => ({ ch, component: chapterComponent(ch.id) }));
import { HelloWorld } from "./HelloWorld";
import { Logo } from "./HelloWorld/Logo";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="零极限-家">
        {OHANA_CHAPTERS.map(({ ch, component }) => (
          <Composition
            key={ch.id}
            id={OHANA_CHAPTER_IDS[ch.id]}
            component={component}
            durationInFrames={(ch.to - ch.from) * Ohana.FPS}
            fps={Ohana.FPS}
            width={Ohana.CANVAS_W}
            height={Ohana.CANVAS_H}
            defaultProps={{ music: true }}
          />
        ))}
        <Composition
          id="Ohana-Full"
          component={OhanaFull}
          durationInFrames={Ohana.TOTAL_FRAMES}
          fps={Ohana.FPS}
          width={Ohana.CANVAS_W}
          height={Ohana.CANVAS_H}
          defaultProps={{ music: true }}
        />
        {/* 封面：片尾最后一幕铺满竖屏 */}
        <Still id="Ohana-Cover" component={OhanaCover} width={Ohana.CANVAS_W} height={Ohana.CANVAS_H} />
      </Folder>

      <Folder name="一根算筹">
        {/* 横版 1920×1080，主版本 */}
        <Composition
          id="SuanChou"
          component={SuanChou}
          durationInFrames={TOTAL_FRAMES}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
          defaultProps={{ music: true }}
        />
        {/* 竖版 1080×1920，横向画面居中，适合直接发抖音 */}
        <Composition
          id="SuanChouVertical"
          component={SuanChouVertical}
          durationInFrames={TOTAL_FRAMES}
          fps={FPS}
          width={1080}
          height={1920}
          defaultProps={{ music: true }}
        />
      </Folder>

      <Composition
        // You can take the "id" to render a video:
        // npx remotion render HelloWorld
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
          logoColor1: "#91EAE4",
          logoColor2: "#86A8E7",
        }}
      />

      {/* Mount any React component to make it show up in the sidebar and work on it individually! */}
      <Composition
        id="OnlyLogo"
        component={Logo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          logoColor1: "#91dAE2",
          logoColor2: "#86A8E7",
        }}
      />
    </>
  );
};
