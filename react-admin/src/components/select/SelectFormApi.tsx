/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { Form, Select, type SelectProps } from "antd";
import { useState } from "react";
import type { ReactNode } from "react";
import { getDataSelect } from "../../services/getData.api";
import type { Rule } from "antd/es/form";

interface SelectFormApiProps
    extends Omit<SelectProps, "path" | "filter" | "reload"> {
    name?: string;
    label?: ReactNode;
    rules?: Rule[];
    initialValue?: any;
    path: string;
    filter?: any;
    reload?: boolean | any;
}

const SelectFormApi = ({
    mode,
    name,
    label,
    rules,
    initialValue,
    path,
    filter,
    placeholder,
    onChange,
    size = "middle",
    disabled,
    reload,
    value,
    ...restProps
}: SelectFormApiProps) => {
    const [options, setOptions] = useState<{ value: string; label: string }[]>([
        { value: "", label: "" },
    ]);

    useEffect(() => {
        async function getData() {
            // Không gọi API nếu path rỗng hoặc undefined
            if (!path || path.trim() === "") {
                setOptions([]);
                return;
            }

            try {
                const data = await getDataSelect(path, filter);

                // Kiểm tra data có phải là array và có data không
                if (!data || !Array.isArray(data)) {
                    setOptions([]);
                    return;
                }

                const optionsSelect = data.map((item: any) => {
                    return {
                        ...item,
                        value: item.id || item.value,
                        label: item.name || item.label,
                    };
                });

                if (data.length === 0) {
                    setOptions([]);
                    return;
                }

                setOptions(optionsSelect);
            } catch (error) {
                console.error("Error loading select options:", error);
                setOptions([]);
            }
        }
        getData();
    }, [filter, path, reload]);

    return (
        <Form.Item
            name={name}
            label={label}
            rules={rules}
            initialValue={initialValue}
        >
            <Select
                options={options}
                placeholder={placeholder}
                mode={mode}
                onChange={onChange}
                showSearch
                allowClear
                size={size}
                disabled={disabled}
                value={value}
                {...restProps}
            />
        </Form.Item>
    );
};

export default SelectFormApi;
