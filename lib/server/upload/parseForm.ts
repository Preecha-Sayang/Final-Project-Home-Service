import formidable, { Fields, Files } from "formidable";
import type { NextApiRequest } from "next";

export const formConfig = { api: { bodyParser: false as const } };

export function parseForm(req: NextApiRequest): Promise<{ fields: Fields; files: Files }> {
    const form = formidable({ multiples: false });
    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })));
    });
}