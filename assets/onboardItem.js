import { useScale } from "@/components/autoElementScaling";
import AutoScalingText from "@/components/autoScalingText";
import { Image, View } from "react-native";
import Styling from "../app/MainStyling";

const OnboardingItem = ({ item, width }) => {
    const { scaleElement } = useScale();

  return (
    <View style={[Styling.centerThis, {width}]}>
      <Image
        source={item.image}
        style={{
            width: width,
            resizeMode: "contain",
            flex: 0.7,
            justifyContent: "center",
        }}
      />
      <View style={{ flex: 0.3 }}>
        <AutoScalingText baseSize={13}
          style={{
            fontWeight: "300",
            textAlign: "center",
            padding: "5%"
          }}
        >
          {item.description}
        </AutoScalingText>
      </View>
    </View>
  );
};

export default OnboardingItem;
