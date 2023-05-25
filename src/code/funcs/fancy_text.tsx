import styled, { keyframes } from "styled-components";
import { CrossText } from "~/utils/cross_text";

const gradient = keyframes`
  0% {background-position: 0% 50%;}
  50% {background-position: 100% 50%;}
  100% {background-position: 0% 50%;}
`;

export type ColorPreset =
    | "redGradient"
    | "blueGradient"
    | "greenGradient"
    | "purpleGradient"
    | "orangeGradient"
    | "yellowGradient"
    | "cyanGradient"
    | "greyGradient"
    | "rainbowGradient"
    | "sunsetGradient"
    | "coolGradient"
    | "warmGradient";

const colorPresets: Record<ColorPreset, string> = {
    redGradient: "radial-gradient(circle, #FF7F7F, #FF0000, #8B0000)",
    blueGradient: "radial-gradient(circle, #ADD8E6, #0000FF, #00008B)",
    greenGradient: "radial-gradient(circle, #90EE90, #008000, #006400)",
    purpleGradient: "radial-gradient(circle, #D8BFD8, #800080, #4B0082)",
    orangeGradient: "radial-gradient(circle, #FFA500, #FF8C00, #FF4500)",
    yellowGradient: "radial-gradient(circle, #FFFFE0, #FFFF00, #FFD700)",
    cyanGradient: "radial-gradient(circle, #E0FFFF, #00FFFF, #20B2AA)",
    greyGradient: "radial-gradient(circle, #D3D3D3, #A9A9A9, #696969)",
    rainbowGradient:
        "radial-gradient(circle, red, orange, yellow, green, blue, indigo, violet)",
    sunsetGradient:
        "radial-gradient(circle, #FFD700, #FF8C00, #FF4500, #8B0000)",
    coolGradient: "radial-gradient(circle, #ADD8E6, #00FFFF, #0000FF, #4B0082)",
    warmGradient: "radial-gradient(circle, #FFFFE0, #FFA500, #FF0000, #8B0000)",
};

const FancyTextNode = ({
    children,
    fontSize,
    color,
}: {
    children: React.ReactNode;
    fontSize: string;
    color: ColorPreset;
}) => {
    const Text = styled.h1`
        position: relative;
        font-size: ${fontSize};
        font-weight: 900;
        color: transparent;
        background: ${colorPresets[color]};
        background-size: 300% 300%;
        animation: ${gradient} 15s ease-in-out infinite;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        z-index: 2;
        text-align: center;
    `;

    return <Text>{children}</Text>;
};

export const FancyText = ({
    text,
    animateId,
    fontSize,
    color,
}: {
    text: string;
    animateId: string;
    fontSize: string;
    color: ColorPreset;
}) => {
    return (
        <FancyTextNode fontSize={fontSize} color={color}>
            <CrossText text={text} animateId={animateId} style={{}} />
        </FancyTextNode>
    );
};
