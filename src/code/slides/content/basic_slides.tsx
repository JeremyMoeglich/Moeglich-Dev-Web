import Image from "next/image";
import type { StageGen } from "../stage";
import { type ColorPreset, FancyText } from "~/code/funcs/fancy_text";
import { defaults } from "../defaults";

export const TitleSlide: StageGen<{
    title: string;
    subtitle?: string;
    animateId: string;
    titleFontSize?: string;
    titleColor?: ColorPreset;
    subtitleFontSize?: string;
    subtitleColor?: ColorPreset;
}> = (props) => ({
    id: props.title,
    stage_duration: 1,
    Component: () => (
        <div className="flex h-full flex-col justify-center">
            <div>
                <FancyText
                    text={props.title}
                    animateId={props.animateId}
                    fontSize={
                        props.titleFontSize ? props.titleFontSize : "10rem"
                    }
                    color={props.titleColor ? props.titleColor : "redGradient"}
                />
            </div>
            {props.subtitle && (
                <div>
                    <FancyText
                        text={props.subtitle}
                        animateId={props.animateId}
                        fontSize={
                            props.subtitleFontSize
                                ? props.subtitleFontSize
                                : "2rem"
                        }
                        color={
                            props.subtitleColor
                                ? props.subtitleColor
                                : "blueGradient"
                        }
                    />
                </div>
            )}
        </div>
    ),
});

export const AspectSlide: StageGen<{
    title: string | string[];
    aspects: string[];
    isTitleLarge?: boolean;
    animateId: string;
    titleFontSize?: string;
    titleColor?: ColorPreset;
}> = (props) => ({
    id: typeof props.title === "string" ? props.title : props.title.join("_"),
    stage_duration: 1,
    Component: () => (
        <div className="h-full">
            {defaults.title(props.title)}
            <ul className="flex h-full flex-col justify-center gap-8 p-16 pb-40 text-4xl text-white">
                {props.aspects.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </div>
    ),
});

export const ImageSlide: StageGen<{
    title: string;
    imageURL: string;
    imageAlt?: string;
    isTitleLarge?: boolean;
}> = (props) => ({
    id: props.title,
    stage_duration: 1,
    Component: () => (
        <div>
            <h1 className={props.isTitleLarge ? "text-4xl" : "text-2xl"}>
                {props.title}
            </h1>
            <Image src={props.imageURL} alt={props.imageAlt || "Slide image"} />
        </div>
    ),
});

export const BulletPointSlide: StageGen<{
    title: string;
    points: string[];
    isTitleLarge?: boolean;
}> = (props) => ({
    id: props.title,
    stage_duration: 1,
    Component: () => (
        <div>
            <h1 className={props.isTitleLarge ? "text-4xl" : "text-2xl"}>
                {props.title}
            </h1>
            <ul>
                {props.points.map((point, index) => (
                    <li key={point + index}>{point}</li>
                ))}
            </ul>
        </div>
    ),
});
