import { useState } from "react";
import PriceRange, { Range } from "@/components/input/inputPriceRange/price_range";
import CodeButton from "../code/codeButton";

export default function ExamplePriceRange() {
    const [budget, setBudget] = useState<Range>({ min: 0, max: 2000 });

    const codePrice = `
import PriceRange, { Range } from "@/components/input/inputPriceRange/price_range";

const [budget, setBudget] = useState<Range>({ min: 0, max: 2000 });

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
`;

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
                <div>
                    <CodeButton title="Input State" code={codePrice} />
                </div>
            </div>
        </>

    );
}
