export const RawText: React.FC<{
    text: string;
}> = ({ text }) => {
    return (
        <div>
            <pre>
                <code>{text}</code>
            </pre>
        </div>
    );
};
