"use client";

import {
    Carousel,
    type CarouselApi,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "~/@/components/ui/carousel";
import { useEffect, useState } from "react";
import { technologies } from "~/data/tlink";

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
                        {technologies.map((card, i) => (
                            <CarouselItem key={card.name} className="basis-1/5">
                                <div
                                    style={{
                                        backgroundColor:
                                            i === current
                                                ? "#3d547e67"
                                                : "#0000002c",
                                    }}
                                    className="rounded-xl p-4 backdrop-blur"
                                    onClick={() => api?.scrollTo(i)}
                                    onKeyDown={() => api?.scrollTo(i)}
                                >
                                    {card.icon === "temp"
                                        ? card.name
                                        : card.icon()}
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
                        {technologies[current]?.name}
                    </span>
                </h3>
                <div>
                    {(() => {
                        const t = technologies[current]?.description;
                        if (typeof t === "function") {
                            return t();
                        }
                        return t;
                    })()}
                </div>
            </div>
        </div>
    );
}
