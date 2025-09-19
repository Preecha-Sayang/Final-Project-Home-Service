import { useState } from "react";
import PriceRangeRadix, { Range } from "./price_range";

export default function Example() {
    const [budget, setBudget] = useState<Range>({ min: 700, max: 900 });

    return (
        <PriceRangeRadix
            label="Price Range"
            min={0}
            max={2000}
            step={1}
            value={budget}
            onCommit={setBudget}
        />
    );
}
