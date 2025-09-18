import RadioButton from "@/components/radio/radio_botton";
import Checkbox from "@/components/radio/check_box";
import SelectBox from "@/components/radio/select_box";
import { SelectFilter } from "@/components/radio/select_filter";
import { RadioButtonWithInput } from "@/components/radio/radio_input";
import React, {useState} from "react";



export default function Home() {
    const [demoChecked, setDemoChecked] = useState(false);
    const [radio1value, setRadio1Value] = useState("1");
    const [radioWithInputValue, setRadioWithInputValue] = useState("1");
    const [selectBoxValue, setSelectBoxValue] = useState("1");

    return (
        <div className="min-h-screen flex justify-center items-center">
            <div className="flex flex-col items-start space-y-8 p-8">
                <Checkbox
                    id="demo-checkbox"
                    label="normal checbox"
                    checked={demoChecked}
                    onChange={setDemoChecked}
                />
                <Checkbox id="demo-checkbox2" label="disabled checkbox" disabled={true} />
                <RadioButton
                    id="radio1"
                    name="mygroup"
                    value="1"
                    label="radio option 1"
                    onChange={setRadio1Value}
                    checked={radio1value === "1"}
                />
                <RadioButton
                    id="radio2"
                    name="mygroup"
                    value="2"
                    label="radio option 2"
                    onChange={setRadio1Value}
                    checked={radio1value === "2"}
                />

                <RadioButtonWithInput
                    id="rwi1"
                    name="rwigroup"
                    value="1"
                    label="radio with input 1"
                    checked={radioWithInputValue === "1"}
                    onChange={setRadioWithInputValue}
                />
                <RadioButtonWithInput
                    id="rwi2"
                    name="rwigroup"
                    value="2"
                    label="radio with input 2"
                    checked={radioWithInputValue === "2"}
                    onChange={setRadioWithInputValue}
                    postfix="%"
                />
                <div className="flex justify-center">
                    <SelectBox
                        id="select-box1"
                        label="select box 1"
                        value="1"
                        selected={selectBoxValue === "1"}
                        onChange={setSelectBoxValue}
                        disabled={false}

                    />
                    <SelectBox
                        id="select-box3"
                        label="disabled box"
                        value="3"
                        selected={selectBoxValue === "3"}
                        onChange={setSelectBoxValue}
                        disabled={true}
                    />
                </div>
                <SelectFilter />
            </div>
        </div>
    );
}
