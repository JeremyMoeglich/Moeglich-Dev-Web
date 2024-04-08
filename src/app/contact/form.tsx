import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/trpc/react";
import { Input } from "~/@/components/ui/input";
import { Textarea } from "~/@/components/ui/textarea";

// Define the form schema using Zod
const formSchema = z.object({
    name_or_company: z.string().min(1),
    email_or_tel: z.string().min(1),
    subject: z.string(),
    message: z.string().min(1),
});

// TypeScript: Type for the form input based on the schema
type FormInput = z.infer<typeof formSchema>;

const FormComponent = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormInput>({
        resolver: zodResolver(formSchema),
    });
    const submit_form_mutation = api.contact_form.submit_form.useMutation();
    const [submissionStatus, setSubmissionStatus] = useState<{
        success?: boolean;
        message?: string;
    }>({});

    const onSubmit: SubmitHandler<FormInput> = async (data) => {        
        try {
            if (isSubmitting) return;
            const result = await submit_form_mutation.mutateAsync(data);
            setSubmissionStatus({
                success: result.success,
                message: result.success
                    ? "Formular erfolgreich eingereicht!"
                    : "Server hat einen Fehler zurückgegeben. Bitte versuchen Sie es erneut.",
            });
        } catch (error) {
            setSubmissionStatus({
                success: false,
                message:
                    "Konnte das Formular nicht an den Server senden. Bitte versuchen Sie es erneut.",
            });
        }
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
                <label className="block mb-2">Betreff (Optional)</label>
                <Input className="border p-2 w-full" {...register("subject")} />
                {errors.subject && (
                    <p className="text-red-500">{errors.subject.message}</p>
                )}
            </div>

            <div>
                <label className="block mb-2">Name oder Firma*</label>
                <Input
                    className="border p-2 w-full"
                    {...register("name_or_company")}
                />
                {errors.name_or_company && (
                    <p className="text-red-500">
                        {errors.name_or_company.message}
                    </p>
                )}
            </div>

            <div>
                <label className="block mb-2">E-Mail oder Telefon*</label>
                <Input
                    className="border p-2 w-full"
                    {...register("email_or_tel")}
                />
                {errors.email_or_tel && (
                    <p className="text-red-500">
                        {errors.email_or_tel.message}
                    </p>
                )}
            </div>

            <div>
                <label className="block mb-2">Nachricht*</label>
                <Textarea
                    className="border p-2 w-full"
                    {...register("message")}
                />
                {errors.message && (
                    <p className="text-red-500">{errors.message.message}</p>
                )}
            </div>

            <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                disabled={isSubmitting}
            >
                {isSubmitting ? "Wird gesendet..." : "Absenden"}
            </button>

            {submissionStatus.success !== undefined && (
                <p
                    className={
                        submissionStatus.success
                            ? "text-green-500"
                            : "text-red-500"
                    }
                >
                    {submissionStatus.message}
                </p>
            )}
        </form>
    );
};


export default FormComponent;
