import "./index.css";
import { Composition, Folder } from "remotion";
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from "./suanchou/script";
import { SuanChou } from "./suanchou/SuanChou";
import { SuanChouVertical } from "./suanchou/Vertical";
import { HelloWorld } from "./HelloWorld";
import { Logo } from "./HelloWorld/Logo";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
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
