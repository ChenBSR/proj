import { join } from 'path'; // 必须导入 join
import { writeFileSync, existsSync, mkdirSync } from 'fs'; // 必须导入 fs 相关函数

// ... 其他代码保持不变

/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {
    /**
     * @en A method that can be triggered by message
     * @zh 通过 message 触发的方法
     */
    showLog() {
        console.log('Hello World');
    },

    async onGenerateCode() {
        // 1. 调用 scene.ts 获取数据
        const data = await Editor.Message.request('scene', 'execute-scene-script', {
            name: 'ui-code-generator',
            method: 'getSelectionNodes',
            args: []
        });

        if (!data) {
            console.error("请先在层级管理器中选中 UI 根节点 (Prefab 根节点)");
            return;
        }

        const { className, nodes } = data;
        const saveDir = join(Editor.Project.path, 'assets', 'scripts', 'ui');
        if (!existsSync(saveDir)) mkdirSync(saveDir, { recursive: true });

        // 2. 生成 View 基类 (UI_LoginView_Auto.ts) - 每次覆盖
        const autoGenCode = generateViewCode(className, nodes);
        const autoPath = join(saveDir, `${className}View_Auto.ts`);
        writeFileSync(autoPath, autoGenCode);

        // 3. 生成 Logic 类 (UI_LoginView.ts) - 仅当不存在时生成
        const logicPath = join(saveDir, `${className}View.ts`);
        if (!existsSync(logicPath)) {
            const logicCode = generateLogicCode(className);
            writeFileSync(logicPath, logicCode);
        }

        // 4. 刷新资源管理器
        await Editor.Message.send('asset-db', 'refresh-asset', 'db://assets/scripts/ui');
        console.log(`[UI Generator] ${className} 代码生成完毕！`);
    }
};

/** 生成 View 类字符串 (包含 property 绑定) */
function generateViewCode(className: string, nodes: any[]) {
    let props = "";
    nodes.forEach(n => {
        props += `    @property(${n.type})\n    public ${n.name}: ${n.type} | null = null;\n\n`;
    });

    return `import { _decorator, Component, Node, Button, Label, Sprite, EditBox } from 'cc';
const { ccclass, property } = _decorator;

/** 
 * 该类由插件自动生成，请勿手动修改。
 * 重新生成时，此文件会被覆盖。
 */
@ccclass('${className}View_Auto')
export class ${className}View_Auto extends Component {
${props}
}`;
}

/** 生成 Logic 类字符串 (继承自 View 类) */
function generateLogicCode(className: string) {
    return `import { _decorator } from 'cc';
import { ${className}View_Auto } from './${className}View_Auto';
const { ccclass } = _decorator;

@ccclass('${className}View')
export class ${className}View extends ${className}View_Auto {
    onLoad() {
        // 在此处编写业务逻辑
        // console.log(this._btnConfirm);
    }
}`;
}

/**
 * @en Method Triggered on Extension Startup
 * @zh 扩展启动时触发的方法
 */
export function load() {}

/**
 * @en Method triggered when uninstalling the extension
 * @zh 卸载扩展时触发的方法
 */
export function unload() {}
