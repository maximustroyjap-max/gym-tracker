import "./index.css";
import { Composition } from "remotion";
import { SplashScreen } from "./SplashScreen";
import { TabBarPreview } from "./TabBarPreview";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SplashScreen"
        component={SplashScreen}
        durationInFrames={240}
        fps={60}
        width={1080}
        height={1920}
      />
      <Composition
        id="TabBarPreview"
        component={TabBarPreview}
        durationInFrames={450}
        fps={60}
        width={1080}
        height={400}
      />
    </>
  );
};
