import { Layout } from "./Layout";

export function NotFoundPage() {
    return (
        <Layout>
            <div className="flex flex-col justify-center grow">
                <div className="flex flex-col items-center bg-red-400 py-4 bg-opacity-25 backdrop-blur-sm drop-shadow-md">
                    <div className="text-violet-400 text-9xl drop-shadow-lg">
                        404
                    </div>
                    <div className="text-red-400 text-4xl drop-shadow-md">
                        Not Found
                    </div>
                </div>
            </div>
        </Layout>
    );
}
