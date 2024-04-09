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
        <div className="gap-8 mt-8 bg-purple-800 bg-opacity-40 p-4 text-white backdrop-blur-sm">
            <h2 className="text-4xl font-bold">Technologies</h2>
            <div className="flex justify-center">
                <Carousel
                    setApi={setApi}
                    opts={{
                        loop: true,
                        skipSnaps: true,
                    }}
                    className="w-full max-w-[800px] mx-10"
                >
                    <CarouselContent>
                        {technologies.map((card, i) => (
                            <CarouselItem
                                key={card.name}
                                className="basis-1/2 sm:basis-1/4 md:basis-1/5"
                            >
                                <div
                                    style={{
                                        backgroundColor:
                                            i === current
                                                ? "#467adb67"
                                                : "#0000002c",
                                    }}
                                    className="flex rounded-xl p-2 backdrop-blur aspect-square items-center justify-center"
                                    onClick={() => api?.scrollTo(i)}
                                    onKeyDown={() => api?.scrollTo(i)}
                                >
                                    <div className="flex w-full h-full relative flex-col justify-between items-center">
                                        <div className="w-full h-full">
                                            {card.icon()}
                                        </div>
                                        <div className="flex text-center justify-center items-center p-2 bg-black font-bold drop-shadow-md shadow-black backdrop-blur-sm bg-opacity-55">
                                            {card.name}
                                        </div>
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="text-black w-10 h-10 hover:bg-blue-300" />
                    <CarouselNext className="text-black w-10 h-10 hover:bg-blue-300" />
                </Carousel>
            </div>
            <div className="mt-4">
                <h3 className="text-3xl">
                    Meine Erfahrungen mit{" "}
                    <span className="font-bold text-green-400">
                        {technologies[current]?.name}
                    </span>
                </h3>
                <div className="">
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
