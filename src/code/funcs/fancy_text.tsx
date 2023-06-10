import styled, { keyframes } from "styled-components";
import { CrossText } from "~/utils/cross_text";
import { splitString } from "./code_block/word_split";

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

interface TextProps {
    fontSize: string;
    color: ColorPreset;
    animationdelay: number;
}

const Text = styled.div<TextProps>`
    position: relative;
    font-size: ${(props) => props.fontSize};
    font-weight: 900;
    color: transparent;
    background: ${(props) => colorPresets[props.color]};
    background-size: 300% 300%;
    background-attachment: fixed;
    animation: ${gradient} 15s ease-in-out infinite;
    animation-delay: ${(props) => props.animationdelay}s;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
`;

export const FancyText = ({
    text,
    animateId,
    fontSize,
    color,
}: {
    text: string | string[];
    animateId: string;
    fontSize: string;
    color: ColorPreset;
}) => {
    const animationDuration = 15;
    const currentTime = window.performance.now() / 1000;
    const animationDelay =
        animationDuration - (currentTime % animationDuration);

    return (
        <div className="text-center">
            <CrossText
                tokens={typeof text === "string" ? splitString(text) : text}
                animateId={animateId}
                token_wrap={(token) => (
                    <Text
                        fontSize={fontSize}
                        color={color}
                        animationdelay={animationDelay} // <-- Pass it here
                    >
                        {token}
                    </Text>
                )}
            />
        </div>
    );
};
