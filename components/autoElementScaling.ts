import { useWindowDimensions } from "react-native";

export function useScale() {
  const { width } = useWindowDimensions();
  const baseWidth = 375;

  const safeNumber = (n: number, fallback = 0) =>
  Number.isFinite(n) ? n : fallback;

  const scaleElement = (size: number) => (width / baseWidth) * size;
  //vvv in case UI freezes for users (must rearrange the size for every ui, 
  //vvv everything will look flat otherwise)
  //const scaleElement = (size: number) => safeNumber(width / baseWidth, 1);

  return { scaleElement, width };
}
