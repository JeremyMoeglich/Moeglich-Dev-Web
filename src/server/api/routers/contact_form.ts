import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { JSDOM } from "jsdom";
import createDOMPurify from "dompurify";

import { panic } from "functional-utilities";

import axios from "axios";
import qs from "qs";
import { dedent } from "~/utils/dedent";

async function sendEmail(
    subject: string,
    text: string,
): Promise<
    | {
          data: object;
      }
    | {
          error: string;
      }
> {
    const domainName = "sandbox5969774ee4b34c79a30d8b562477be4a.mailgun.org";
    const url = `https://api.mailgun.net/v3/${domainName}/messages`;

    const auth = {
        username: "api",
        password:
            process.env.MAILGUN_API_KEY ?? panic("MAILGUN_API_KEY not set"),
    };

    const formData = {
        from: `Website Response <mailgun@${domainName}>`,
        to: "jeremy.moeglich@gmail.com",
        subject,
        text,
    };

    try {
        const response = await axios.post(url, qs.stringify(formData), {
            auth: auth,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        // Assuming the response is JSON and directly usable
        return { data: response.data };
    } catch (error) {
        let errorMessage: string;
        if (axios.isAxiosError(error) && error.response) {
            // Assuming error.response.data is in a parsable JSON format
            errorMessage = JSON.stringify(error.response.data);
        } else {
            errorMessage = "An unknown error occurred";
        }
        return { error: errorMessage };
    }
}

const dom_window = new JSDOM().window;
const DOMPurify = createDOMPurify(dom_window);

export const contactFormRouter = createTRPCRouter({
    submit_form: publicProcedure
        .input(
            z.object({
                name_or_company: z.string(),
                email_or_tel: z.string(),
                subject: z.string().optional(),
                message: z.string(),
            }),
        )
        .mutation(async ({ input }) => {
            const clean_name_or_company = DOMPurify.sanitize(
                input.name_or_company,
            );
            const clean_email_or_tel = DOMPurify.sanitize(input.email_or_tel);
            const clean_subject = input.subject
                ? DOMPurify.sanitize(input.subject)
                : "Contact Form Submission";
            const clean_content = DOMPurify.sanitize(input.message);

            const response = await sendEmail(
                clean_subject,
                dedent`
                    Name or Company: ${clean_name_or_company}
                    Email or Tel: ${clean_email_or_tel}

                    ${clean_content}
                `,
            );

            if ("error" in response) {
                console.error(response.error);
                return {
                    success: false,
                };
            }
            return {
                success: true,
            };
        }),
});
