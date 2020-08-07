import { INode, ConnectionType } from "../Types";
import { saveAs } from "file-saver";

type AttribMap = Record<string, string>;

function attribsToString(attribs: AttribMap) {
    const entries = Object.entries(attribs);
    if (entries.length === 0) {
        return "";
    }
    return "[" + entries.map((e) => `${e[0]}=${e[1]}`).join(";") + "]";
}

export function saveAsDotFile(nodes: INode[]) {
    let content = "digraph {\r\n";

    // List out all nodes
    for (const node of nodes) {
        const attribs: Record<string, string> = {};

        content += `${node.id} ${attribsToString(attribs)};\r\n`;
    }

    // List out all connections
    for (const node of nodes) {
        const connections = node.getConnections();
        for (const c of connections) {
            if (c.fromNode.id === node.id) {
                const attribs: Record<string, string> = {};
                if (c.connectionType === ConnectionType.Undirected) {
                    attribs["dir"] = "none";
                }
                content += `${c.fromNode.id} -> ${c.toNode.id} ${attribsToString(attribs)};\r\n`;
            }
        }
    }

    content += "}\r\n";

    const contentBlob = new Blob([content], { type: "text/plain" });
    saveAs(contentBlob, "graph.gv");
}
