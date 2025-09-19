import { useState } from "react";
import ImageUpload from "./image_upload";

export default function Example() {
    const [file, setFile] = useState<File | null>(null);
    return <ImageUpload label="Image Upload" value={file} onChange={setFile} />;
}
