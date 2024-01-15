"use client";

import {
    Carousel,
    CarouselApi,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "~/@/components/ui/carousel";
import * as Icons from "./icons";
import { useEffect, useState } from "react";

const cards: {
    title: string;
    description: string;
    icon: () => JSX.Element;
}[] = [
    {
        icon: () => <Icons.ReactIcon />,
        title: "React",
        description: "todo",
    },
    {
        icon: () => <Icons.TailwindIcon />,
        title: "Tailwind",
        description: "todo",
    },
    {
        icon: () => <Icons.NextJsIcon />,
        title: "Next",
        description: "todo",
    },
    {
        icon: () => <Icons.QwikIcon />,
        title: "Qwik",
        description: "todo",
    },
    {
        icon: () => <Icons.PythonIcon />,
        title: "Python",
        description: "todo",
    },
    {
        icon: () => <Icons.NodeJsIcon />,
        title: "Node",
        description: "todo",
    },
    {
        icon: () => <Icons.PytorchIcon />,
        title: "Pytorch",
        description: "todo",
    },
];

export function Technologies() {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    useEffect(() => {
        if (!api) return;

        setCurrent(api.selectedScrollSnap());

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap());
        });
    }, [api]);
    return (
        <div className="mt-8 bg-white bg-opacity-10 p-8 text-white">
            <h2 className="text-5xl font-bold">Technologies</h2>
            <div className="flex justify-center">
                <Carousel
                    setApi={setApi}
                    opts={{
                        loop: true,
                        skipSnaps: true,
                    }}
                    className="w-full max-w-[800px]"
                >
                    <CarouselContent>
                        {cards.map((card, i) => (
                            <CarouselItem key={i} className="basis-1/5">
                                <div
                                    style={{
                                        backgroundColor:
                                            i == current
                                                ? "#3d547e67"
                                                : "#0000002c",
                                    }}
                                    className="rounded-xl p-4 backdrop-blur"
                                    onClick={() => api?.scrollTo(i)}
                                >
                                    {card.icon()}
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="text-gray-400" />
                    <CarouselNext className="text-gray-400" />
                </Carousel>
            </div>
            <div>
                <h3 className="text-3xl">
                    My Experience with{" "}
                    <span className="font-bold text-green-400">
                        {cards[current]?.title}
                    </span>
                </h3>
                <p>{cards[current]?.description}</p>
            </div>
        </div>
    );
}
