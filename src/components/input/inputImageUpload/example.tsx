import { useState } from "react";
import ImageUpload from "@/components/input/inputImageUpload/image_upload";
import CodeButton from "../code/codeButton";

export default function ExampleImageUpload() {
    const [file, setFile] = useState<File | null>(null);

    const codeImage = `
import ImageUpload from "@/components/input/inputImageUpload/image_upload";

const [file, setFile] = useState<File | null>(null);

<div className="w-[360px]">
    <ImageUpload
        label="Image Upload"
        value={file}
        onChange={setFile}
    />
</div>
`;

    return (
        <>
            <div className="w-[1200px] font-medium text-[var(--gray-700)]"></div>
            <div className="flex justify-center items-center">
                <div className="w-[360px]">
                    <ImageUpload
                        label="Image Upload"
                        value={file}
                        onChange={setFile}
                    />
                </div>
                <div>
                    <CodeButton title="Input State" code={codeImage} />
                </div>
            </div>
        </>

    );
}
