import { FancyText } from "../funcs/fancy_text";

export const defaults = {
    title: (text: string) => (
        <FancyText
            text={text}
            animateId="title"
            fontSize="3em"
            color="blueGradient"
        />
    ),
};
