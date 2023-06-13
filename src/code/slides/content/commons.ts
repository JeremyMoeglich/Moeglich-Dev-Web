export function shape_interface(active: {
    is_inside: boolean;
    variant: "interface" | "class" | "abstract_class";
    color: boolean;
}) {
    let build = "";
    if (active.variant === "interface") {
        build += "interface";
    } else if (active.variant === "class") {
        build += "class";
    } else {
        build += "abstract class";
    }

    build += " Shape {\n";

    if (active.color) {
        build += "    color: Color;\n";
    }

    if (active.is_inside) {
        if (active.variant === "interface") {
            build += "    contains_point(): boolean;\n";
        } else if (active.variant === "class") {
            build += "    contains_point(): boolean {\n";
            build += "        // implement the method here\n";
            build += "        throw new Error('Method not implemented.');\n"; // Throw error if method is not implemented
            build += "    }\n";
        } else {
            build += "    abstract contains_point(): boolean;\n";
        }
    }

    build += "}";

    return build;
}
