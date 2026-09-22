import Svg, { Path } from "react-native-svg";

/** The Minto ring, same geometry as the website logo. */
export function MintoMark({ size = 20, color = "#141414" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no">
      <Path
        fill={color}
        fillRule="evenodd"
        d="M12 1.5a10.5 10.5 0 1 0 0 21 10.5 10.5 0 0 0 0-21Zm1.2 5.1a5.1 5.1 0 1 0 0 10.2 5.1 5.1 0 0 0 0-10.2Z"
      />
    </Svg>
  );
}
