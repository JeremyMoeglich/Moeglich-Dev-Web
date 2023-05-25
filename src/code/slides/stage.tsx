export type Stage = {
    id: string;
    stage_duration: number; // how many slides are in this stage
    Component: (substage_index: number) => JSX.Element;
};

export type StageGen<T> = (props: T) => Stage;
