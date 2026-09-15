import React from "react";
import {
  Text,
  TextProps,
  useWindowDimensions,
} from "react-native";

type Props = TextProps & {
  baseSize: number;
};

export const AutoScalingText: React.FC<Props> = ({
  baseSize,
  style,
  children,
  ...rest
}) => {
  const { width, fontScale } = useWindowDimensions();

  const isTablet = width >= 768;

  // Power curve scaling (better tablet growth)
  const scale = Math.pow(width / 375, 0.85);

  // Keep slight phone boost if desired
  const phoneBoost = isTablet ? 1 : 1.08;

  const responsiveFontSize =
    baseSize * scale * Math.min(fontScale, 1.3);

  return (
    <Text
      {...rest}
      allowFontScaling
      style={[
        { fontSize: responsiveFontSize },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

export default AutoScalingText;
