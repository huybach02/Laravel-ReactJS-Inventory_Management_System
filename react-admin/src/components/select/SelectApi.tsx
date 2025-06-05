/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Select, type SelectProps } from "antd";
import type { DefaultOptionType } from "antd/es/select";
import type { CSSProperties } from "react";
import { getDataSelect } from "../../services/getData.api";

export interface SelectApiProps extends Omit<SelectProps, "onChange"> {
    filter?: any; //createFilterQuery(0, 'ly_do.loai', 'equal', 'THU')
    path: string;
    reload?: boolean;
    style: CSSProperties;
    onChange?: (
        value: any,
        option: DefaultOptionType | DefaultOptionType[] | undefined
    ) => void;
}

const SelectApi = ({
    mode,
    path,
    filter,
    placeholder,
    disabled,
    reload,
    value,
    style,
    onChange,
}: SelectApiProps) => {
    const [options, setOptions] = useState<{ value: string; label: string }[]>([
        { value: "", label: "" },
    ]);

    useEffect(() => {
        async function getData() {
            const data = await getDataSelect(path, filter);
            const optionsSelect = data.map((item: any) => {
                return {
                    ...item,
                    value: item.id || item.value,
                    label: item.name || item.label,
                };
            });
            if (data.length === 0) {
                return;
            }
            setOptions(optionsSelect);
        }
        getData();
    }, [filter, path, reload]);

    const handleChange = (val: any, opt: any) => {
        if (onChange) {
            onChange(val, opt);
        }
    };

    return (
        <Select
            options={options}
            placeholder={placeholder}
            mode={mode}
            showSearch
            allowClear
            size="small"
            onChange={handleChange}
            value={value}
            disabled={disabled}
            style={style}
        />
    );
};

export default SelectApi;
