import { stages } from "./content/index";
import { type Stage } from "./stage";
import { range } from "functional-utilities";

interface Slide {
    id: string;
    Component: () => JSX.Element;
}

function stage_to_slides(stage: Stage): Slide[] {
    return range(0, stage.stage_duration).map((i) => {
        const slide_id = `${stage.id}_${i}`;
        return { id: slide_id, Component: () => stage.Component(i) };
    });
}

export function get_slides(): Slide[] {
    return stages.flatMap(stage_to_slides);
}
