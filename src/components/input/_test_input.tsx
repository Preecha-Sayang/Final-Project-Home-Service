import ExampleInputState from "./inputField/example";
import ExampleInputDropdown from "./inputDropdown/example";
import ExampleDatePicker from "./inputDatePicker/example";
import ExampleTimePicker from "./inputTimePicker/example";
import ExamplePriceRange from "./inputPriceRange/example";
import ExampleImageUpload from "./inputImageUpload/example";

export default function TestInput() {

    return (
        <div className="flex flex-col justify-center items-center max-w-[1200px] gap-6 p-6">
            {/* * Ctrl + (คลิกที่ Example ที่ต้องการ เพื่อดูโค้ดและนำไปใช้งาน) */}
            <ExampleInputState />
            <ExampleInputDropdown />
            <ExampleDatePicker />
            <ExampleTimePicker />
            <ExamplePriceRange />
            <ExampleImageUpload />
        </div>
    )
}
