/* eslint-disable @typescript-eslint/no-explicit-any */
export const getSidebar = (items: any, phan_quyen: any) => {
    const phanQuyen = JSON.parse(phan_quyen);

    const isKeyValid = (key: string): boolean => {
        return ["dashboard", "lich-su-import"].includes(key);
    };

    const checkRole = items.map((item: any) => {
        if (item.children) {
            const checkChildren = item.children.filter((child: any) => {
                return phanQuyen.some(
                    (role: any) =>
                        role.actions.showMenu && role.name === child.key
                );
            });
            return { ...item, children: checkChildren };
        } else {
            if (!isKeyValid(item.key)) {
                const data = phanQuyen.filter(
                    (role: any) =>
                        role.actions.showMenu && role.name === item.key
                );
                return data.length > 0 ? item : null;
            } else {
                return item;
            }
        }
    });

    return checkRole.filter((item: any) =>
        item?.children ? item.children.length > 0 : item !== null
    );
};
