"use client";
import { useState } from "react";
import PriceRange, { Range } from "./price_range";

export default function Example() {
    const [budget, setBudget] = useState<Range>({ min: 0, max: 2000 });
    return <PriceRange label="Price Range" min={0} max={2000} value={budget} onChange={setBudget} />;
}
