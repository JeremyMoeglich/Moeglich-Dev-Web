"use client";

import { sortBy } from "lodash-es";
import { type NextPage } from "next";
import { useEffect, useState } from "react";
import { v4 } from "uuid";
import { create } from "zustand";
import { useChannel } from "~/code/funcs/pusher_client";
import { api } from "~/utils/api";
import { persist } from "zustand/middleware";
import { panic } from "functional-utilities";

const superSecretKey = "waffel.123";

const useKeyStore = create<{
    key: string | undefined;
    setKey: (new_key: string | undefined) => void;
}>()(
    persist(
        (set) => ({
            key: undefined,
            setKey: (new_key) => set(() => ({ key: new_key })),
        }),
        {
            name: "leaderboard_waffle_login_key",
        },
    ),
);

const useStore = <T, F>(
    store: (callback: (state: T) => unknown) => unknown,
    callback: (state: T) => F,
) => {
    const result = store(callback) as F;
    const [data, setData] = useState<F>();

    useEffect(() => {
        setData(result);
    }, [result]);

    return data;
};

const Leaderboard: NextPage = () => {
    const leaderboard = api.leaderboard_waffle.get.useQuery();
    const channel = useChannel("leaderboard_waffle");
    const { key, setKey } = useStore(useKeyStore, (s) => s) ?? {
        key: undefined,
        setKey: () => {},
    };

    useEffect(() => {
        if (!channel) return;

        channel.bind("refetch", async () => {
            await leaderboard.refetch();
        });

        return () => {
            channel.unbind("refetch");
        };
    }, [channel, leaderboard]);

    const [leaderboardState, setLeaderboardState] = useState(
        leaderboard.data ?? [],
    );

    useEffect(() => {
        setLeaderboardState(leaderboard.data ?? leaderboardState ?? []);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [leaderboard.data]);

    const update_score_mutation =
        api.leaderboard_waffle.update_score.useMutation();
    const create_entry_mutation = api.leaderboard_waffle.create.useMutation();
    const change_name_mutation =
        api.leaderboard_waffle.change_name.useMutation();

    function update_score(id: string, score_offset: number) {
        setLeaderboardState((prev) =>
            prev.map((entry) =>
                entry.id === id
                    ? {
                          ...entry,
                          score: entry.score + score_offset,
                      }
                    : entry,
            ),
        );
        update_score_mutation.mutate({
            id: id,
            new_score:
                score_offset +
                (leaderboardState.find((v) => v.id === id) ?? panic()).score,
        });
    }

    function logged_in(): boolean {
        return key === superSecretKey;
    }

    function create_entry(id: string, name: string) {
        setLeaderboardState((prev) => [
            ...prev,
            {
                id: id,
                name: name,
                score: 0,
            },
        ]);
        create_entry_mutation.mutate({
            id: id,
            name: name,
            score: 0,
        });
    }

    function change_name(id: string, name: string) {
        setLeaderboardState((prev) =>
            prev.map((entry) =>
                entry.id === id
                    ? {
                          ...entry,
                          name: name,
                      }
                    : entry,
            ),
        );
        change_name_mutation.mutate({
            id: id,
            name: name,
        });
    }

    return (
        <div className="flex h-full flex-row max-[900px]:flex-wrap">
            <div className="flex h-full w-[900px] flex-col gap-8 bg-slate-900 p-8 ">
                {sortBy(leaderboardState, (v) => -v.score).map((user, i) => (
                    <div
                        key={user.id}
                        className="flex w-full p-1 text-3xl font-medium"
                    >
                        <div
                            className="flex w-full items-center gap-4"
                            onClick={() => {
                                if (!logged_in()) return;

                                const name = prompt("Name?", user.name);
                                if (name) {
                                    change_name(user.id, name);
                                }
                            }}
                        >
                            <div
                                style={{
                                    fontWeight: i < 3 ? "1000" : "normal",
                                }}
                                className="pl-4 text-white"
                            >
                                #{i + 1}
                            </div>
                            <div className="w-24 rounded-xl border-[1px] border-black bg-green-800 p-2 text-center text-white">
                                {user.score}
                            </div>
                            <div className=" mx-auto w-full rounded-xl bg-blue-500 p-2 text-center text-white shadow-lg">
                                {user.name}
                            </div>
                        </div>
                        {logged_in() && (
                            <div className="ml-4 flex rounded">
                                <button
                                    onClick={() => {
                                        update_score(user.id, 1);
                                    }}
                                    className="bg-green-500 p-2 px-4"
                                >
                                    +
                                </button>
                                <button
                                    onClick={() => {
                                        update_score(user.id, -1);
                                    }}
                                    className="bg-red-500 p-2 px-4"
                                >
                                    -
                                </button>
                            </div>
                        )}
                    </div>
                ))}
                {logged_in() && (
                    <button
                        className="text-2xl"
                        onClick={() => {
                            const name = prompt("Name?");
                            if (name) {
                                create_entry(v4(), name);
                            }
                        }}
                    >
                        Add Entry
                    </button>
                )}
            </div>
            <div className="flex h-full w-full flex-col items-center justify-center bg-slate-800">
                <h1 className="text-center text-[150px] font-bold text-white ">
                    Waffel <br />
                    Leaderboard
                </h1>
                <button
                    className="rounded bg-slate-900 p-2 text-gray-500"
                    onClick={() => {
                        if (logged_in()) {
                            setKey(undefined);
                        } else {
                            const key = prompt("Key?");
                            if (key == superSecretKey) {
                                setKey(key);
                            } else {
                                alert("That's the wrong password!");
                            }
                        }
                    }}
                >
                    {logged_in() ? "Logout" : "Login"}
                </button>
            </div>
        </div>
    );
};

export default Leaderboard;
