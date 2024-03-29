import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { create_pusher_server } from "~/server/pusher_server";

const pusher = create_pusher_server();
async function request_refetch() {
    await pusher.trigger("leaderboard_waffle", "refetch", {});
}

export const leaderboardWaffleRouter = createTRPCRouter({
    get: publicProcedure.query(async ({ ctx }) => {
        return await ctx.db.leaderboardWaffle_Entry.findMany();
    }),
    update_score: publicProcedure
        .input(
            z.object({
                id: z.string(),
                new_score: z.number(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const new_score = await ctx.db.leaderboardWaffle_Entry.update({
                where: { id: input.id },
                data: {
                    score: input.new_score,
                    LeaderboardWaffle_Change: {
                        create: {
                            score: input.new_score,
                        },
                    },
                },
            });
            await request_refetch();
            return new_score;
        }),
    create: publicProcedure
        .input(
            z.object({
                id: z.string(),
                score: z.number(),
                name: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const new_entry = await ctx.db.$transaction(async (transaction) => {
                const current =
                    await transaction.leaderboardWaffle_Entry.findUnique({
                        where: { id: input.id },
                    });
                if (current !== null) {
                    throw new Error("Entry already exists");
                }
                return await transaction.leaderboardWaffle_Entry.create({
                    data: {
                        id: input.id,
                        score: input.score,
                        name: input.name,
                    },
                });
            });
            await request_refetch();
            return new_entry;
        }),
    change_name: publicProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const new_name = await ctx.db.$transaction(async (transaction) => {
                const current =
                    await transaction.leaderboardWaffle_Entry.findUnique({
                        where: { id: input.id },
                    });
                if (current === null) {
                    throw new Error("No such entry");
                }
                return (
                    await transaction.leaderboardWaffle_Entry.update({
                        where: { id: input.id },
                        data: {
                            name: input.name,
                        },
                    })
                ).name;
            });
            await request_refetch();
            return new_name;
        }),
});
