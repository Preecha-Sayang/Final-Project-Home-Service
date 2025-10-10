import { useState } from "react";
import PriceRange, { Range } from "@/components/input/inputPriceRange/price_range";

export default function ExamplePriceRange() {
    const [budget, setBudget] = useState<Range>({ min: 0, max: 2000 });

    return (
        <>
            <div className="w-[1200px] font-medium text-[var(--gray-700)]"></div>
            <div className="flex justify-center items-center">
                <div className="w-[360px]">
                    <PriceRange
                        label="Price Range"
                        min={0}
                        max={2000}
                        step={1}
                        value={budget}
                        onChange={setBudget}
                        onCommit={setBudget}
                    />
                </div>
            </div>
        </>

    );
}
