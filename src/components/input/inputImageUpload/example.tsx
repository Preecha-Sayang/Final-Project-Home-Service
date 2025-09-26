import { useState } from "react";
import ImageUpload from "@/components/input/inputImageUpload/image_upload";
import CodeButton from "../code/codeButton";

export default function ExampleImageUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string>("");

    // const currentService = { service_id: 12 };

    const codeUpload = `
import ImageUpload from "@/components/input/inputImageUpload/image_upload";

const [file, setFile] = useState<File | null>(null);
const [imageUrl, setImageUrl] = useState<string>("");

// const currentService = { service_id: 12 }; //ใช้ param

<div className="w-[360px]">
    <ImageUpload
        label="รูปบริการ"
        value={file}
        onChange={setFile}
        onUploaded={(url) => setImageUrl(url)}
    // serviceId={currentService.service_id}  // มี id ค่อยส่ง
    />
</div>
`;

    return (
        <>
            <div className="flex gap-6 items-start">
                <div className="w-[360px]">
                    <ImageUpload
                        label="รูปบริการ"
                        value={file}
                        onChange={setFile}
                        onUploaded={(url) => setImageUrl(url)}
                    // serviceId={currentService.service_id}  // มี id ค่อยส่ง
                    />
                </div>

                <div className="text-sm">
                    URL ที่จะบันทึก: <span className="break-all">{imageUrl || "-"}</span>
                </div>

                <div>
                    <CodeButton title="Input State" code={codeUpload} />
                </div>
            </div>
        </>
    );
}