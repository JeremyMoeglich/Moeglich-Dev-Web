export function Footer() {
    return (
        <div className="flex bg-slate-900 bg-opacity-60 backdrop-blur-md py-9 px-4 text-white z-10">
            <div>
                <div>
                    <div>moeglich.dev - Jeremy Möglich - 2024</div>
                </div>
                <div>
                    Source: {" "}
                    <a
                        href="https://github.com/JeremyMoeglich/Moeglich-Dev-Web"
                        className="underline text-blue-600"
                        target="_blank"
                        rel="noreferrer noopener"
                    >
                        GitHub
                    </a>
                </div>
            </div>
        </div>
    );
}
