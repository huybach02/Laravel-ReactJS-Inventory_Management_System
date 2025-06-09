import fs from "fs";
import path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { paramCase, pascalCase, camelCase, snakeCase } from "change-case";

const argv = yargs(hideBin(process.argv)).argv;
const actionName = argv._[0];
const dirName = argv._[1];
let moduleName = argv._[2];

if (!actionName) {
    console.log(
        "Chưa sử dụng đúng cú pháp > node cli.js add <dir-name> <module-name>"
    );
    process.exit(1);
}

if (!dirName) {
    console.log(
        `Chưa sử dụng đúng cú pháp > node cli.js ${actionName} <dir-name> <module-name>`
    );
    process.exit(1);
}

// if (!moduleName) {
//   console.log(`Chua dung cu phap > node cli.js ${actionName} ${dirName} <module-name>`);
//   return false;
// }

function genNames(rawName = "") {
    const pascalCaseName = pascalCase(rawName);
    const camelCaseName = camelCase(rawName);
    const paramCaseName = paramCase(rawName);
    const sentenceCaseName = snakeCase(rawName);

    return {
        pascalCaseName,
        paramCaseName,
        camelCaseName,
        sentenceCaseName,
    };
}

function addUrlConstant(moduleName) {
    const { paramCaseName, pascalCaseName, camelCaseName, sentenceCaseName } =
        genNames(moduleName);
    const constantPath = "./src/configs/api-route-config.ts";

    try {
        let constantContent = fs.readFileSync(constantPath).toString();
        const urlConstantsRegex = /export const URL_CONSTANTS = {([^}]*)};\s*/s;
        const urlConstantsMatch = constantContent.match(urlConstantsRegex);

        if (urlConstantsMatch) {
            const urlConstantsContent = urlConstantsMatch[1];
            const newUrlConstant = `    ${sentenceCaseName.toUpperCase()}: "/admin/${paramCaseName}",`;

            // Kiểm tra xem URL đã tồn tại chưa
            if (!urlConstantsContent.includes(sentenceCaseName.toUpperCase())) {
                // Thêm URL mới vào cuối danh sách URL_CONSTANTS với định dạng đúng
                const newUrlConstantsContent =
                    urlConstantsContent + "\n" + newUrlConstant;
                constantContent = constantContent.replace(
                    urlConstantsRegex,
                    `export const URL_CONSTANTS = {${newUrlConstantsContent}\n};\n`
                );

                fs.writeFileSync(constantPath, constantContent);
                console.log(
                    `-> Đã thêm URL_CONSTANTS.${sentenceCaseName.toUpperCase()} vào ${constantPath}`
                );
            } else {
                console.log(
                    `-> URL_CONSTANTS.${sentenceCaseName.toUpperCase()} đã tồn tại trong ${constantPath}`
                );
            }
        } else {
            console.error(
                "Không tìm thấy URL_CONSTANTS trong file api-route-config.ts"
            );
        }
    } catch (error) {
        console.error("@addUrlConstant > " + error.stack);
    }
}

function addApiRouteConfig(moduleName) {
    const { paramCaseName, pascalCaseName, camelCaseName, sentenceCaseName } =
        genNames(moduleName);
    const apiRouteConfigPath = "./src/configs/api-route-config.ts";

    try {
        let apiRouteContent = fs.readFileSync(apiRouteConfigPath).toString();
        const apiRouteRegex = /export const API_ROUTE_CONFIG = {([^}]*)};\s*/s;
        const apiRouteMatch = apiRouteContent.match(apiRouteRegex);

        if (apiRouteMatch) {
            const apiRouteContentMatch = apiRouteMatch[1];
            const newApiRoute = `    ${sentenceCaseName.toUpperCase()}: "/${paramCaseName}",`;

            // Kiểm tra xem API route đã tồn tại chưa
            if (
                !apiRouteContentMatch.includes(sentenceCaseName.toUpperCase())
            ) {
                // Thêm API route mới vào cuối danh sách với định dạng đúng
                const newApiRouteContent =
                    apiRouteContentMatch + "\n" + newApiRoute;
                apiRouteContent = apiRouteContent.replace(
                    apiRouteRegex,
                    `export const API_ROUTE_CONFIG = {${newApiRouteContent}\n};\n`
                );

                fs.writeFileSync(apiRouteConfigPath, apiRouteContent);
                console.log(
                    `-> Đã thêm API_ROUTE_CONFIG.${sentenceCaseName.toUpperCase()} vào ${apiRouteConfigPath}`
                );
            } else {
                console.log(
                    `-> API_ROUTE_CONFIG.${sentenceCaseName.toUpperCase()} đã tồn tại trong ${apiRouteConfigPath}`
                );
            }
        } else {
            console.error(
                "Không tìm thấy API_ROUTE_CONFIG trong file api-route-config.ts"
            );
        }
    } catch (error) {
        console.error("@addApiRouteConfig > " + error.stack);
    }
}

function addAppRouter(moduleName) {
    const { paramCaseName, pascalCaseName, camelCaseName, sentenceCaseName } =
        genNames(moduleName);
    const appRouterPath = "./src/configs/app-router.tsx";

    try {
        let appRouterContent = fs.readFileSync(appRouterPath).toString();

        // Kiểm tra xem đã import component chưa
        const importRegex = new RegExp(`import ${pascalCaseName} from`);
        if (!appRouterContent.match(importRegex)) {
            // Tìm dòng import cuối cùng
            const lastImportIndex = appRouterContent.lastIndexOf("import ");
            const lastImportEndIndex = appRouterContent.indexOf(
                "\n",
                lastImportIndex
            );
            const importStatement = `import ${pascalCaseName} from "../pages/${paramCaseName}/${pascalCaseName}";\n`;

            // Thêm import mới sau import cuối cùng
            appRouterContent =
                appRouterContent.substring(0, lastImportEndIndex + 1) +
                importStatement +
                appRouterContent.substring(lastImportEndIndex + 1);
        }

        // Tìm vị trí thêm route mới (trước dấu "];" cuối cùng của createBrowserRouter)
        const lastRouteIndex = appRouterContent.lastIndexOf("],");

        // Cấu trúc route mới
        const newRoute = `
            {
                path: "${paramCaseName}",
                element: <MainLayout />,
                children: [{ index: true, element: <${pascalCaseName} /> }],
            },\n        `;

        // Kiểm tra xem route đã tồn tại chưa
        if (!appRouterContent.includes(`path: "${paramCaseName}"`)) {
            // Thêm route mới
            appRouterContent =
                appRouterContent.substring(0, lastRouteIndex) +
                newRoute +
                appRouterContent.substring(lastRouteIndex);

            fs.writeFileSync(appRouterPath, appRouterContent);
            console.log(
                `-> Đã thêm route cho ${pascalCaseName} vào ${appRouterPath}`
            );
        } else {
            console.log(
                `-> Route cho ${pascalCaseName} đã tồn tại trong ${appRouterPath}`
            );
        }
    } catch (error) {
        console.error("@addAppRouter > " + error.stack);
    }
}

function addSidebarConfig(moduleName) {
    const { paramCaseName, pascalCaseName, camelCaseName, sentenceCaseName } =
        genNames(moduleName);
    const sidebarConfigPath = "./src/configs/sidebar-config.ts";

    try {
        let sidebarContent = fs.readFileSync(sidebarConfigPath).toString();

        // Tìm vị trí thêm mục menu mới (trước dấu "];" cuối cùng của mảng sidebar)
        const lastItemIndex = sidebarContent.lastIndexOf("},");
        const endOfArrayIndex = sidebarContent.indexOf("];", lastItemIndex);

        // Cấu trúc mục menu mới
        const newMenuItem = `
        {
            key: "${paramCaseName}",
            label: "${pascalCaseName}",
            icon: React.createElement(Menu, { style: iconStyle }),
            onClick: () => navigate(URL_CONSTANTS.${sentenceCaseName.toUpperCase()}),
        },`;

        // Kiểm tra xem menu đã tồn tại chưa
        if (!sidebarContent.includes(`key: "${paramCaseName}"`)) {
            // Thêm mục menu mới
            sidebarContent =
                sidebarContent.substring(0, endOfArrayIndex) +
                newMenuItem +
                sidebarContent.substring(endOfArrayIndex);

            fs.writeFileSync(sidebarConfigPath, sidebarContent);
            console.log(
                `-> Đã thêm menu cho ${pascalCaseName} vào ${sidebarConfigPath}`
            );
        } else {
            console.log(
                `-> Menu cho ${pascalCaseName} đã tồn tại trong ${sidebarConfigPath}`
            );
        }
    } catch (error) {
        console.error("@addSidebarConfig > " + error.stack);
    }
}

function addNewModule() {
    const { paramCaseName, pascalCaseName, camelCaseName, sentenceCaseName } =
        genNames(moduleName ? moduleName : dirName);
    const {
        paramCaseName: baseModulePascalName,
        paramCaseName: baseModuleParamName,
    } = genNames(dirName);
    const moduleFolder = moduleName
        ? `./src/pages/${baseModulePascalName}/${pascalCaseName}`
        : `./src/pages/${baseModulePascalName}`;

    fs.mkdirSync(moduleFolder, { recursive: true });
    fs.readdirSync("./templates").forEach((filename) => {
        const oldPath = path.join("./templates", filename);
        const newName = filename
            .replace(".template", ".tsx")
            .replace("ComponentName", pascalCaseName);
        const newPath = path.join(moduleFolder, newName);
        if (fs.existsSync(newPath)) {
            return false;
        }

        try {
            fs.copyFileSync(oldPath, newPath);
            // Update noi dung file
            let fileContent = "";
            fileContent = fs.readFileSync(newPath).toString();
            fileContent = fileContent.replace(
                /\[component-name\]/g,
                paramCaseName
            );
            fileContent = fileContent.replace(
                /\[ComponentName\]/g,
                pascalCaseName
            );
            fileContent = fileContent.replace(
                /\[componentName\]/g,
                camelCaseName
            );
            fileContent = fileContent.replace(
                /\[component_name\]/g,
                sentenceCaseName
            );
            fileContent = fileContent.replace(
                /\[COMPONENT_NAME\]/g,
                sentenceCaseName.toUpperCase()
            );
            fileContent = fileContent.replace(
                /\[API_ROUTE\]/g,
                sentenceCaseName.toUpperCase()
            );
            fs.writeFileSync(newPath, fileContent);
        } catch (error) {
            console.error("@addNewModule > " + error.stack);
        }

        console.log(`-> Đã tạo ${newPath}`);
    });

    // Thêm URL vào constant.ts
    addUrlConstant(moduleName ? moduleName : dirName);

    // Thêm API route vào api-route-config.ts
    addApiRouteConfig(moduleName ? moduleName : dirName);

    // Thêm route vào app-router.tsx
    addAppRouter(moduleName ? moduleName : dirName);

    // Thêm menu vào sidebar-config.ts
    addSidebarConfig(moduleName ? moduleName : dirName);
}

if (actionName.toUpperCase() === "ADD") {
    addNewModule();
} else {
    console.log("Action không chính xác => add");
}
