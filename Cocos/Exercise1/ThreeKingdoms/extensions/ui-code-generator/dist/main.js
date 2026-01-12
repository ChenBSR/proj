"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.methods = void 0;
exports.load = load;
exports.unload = unload;
const path_1 = require("path"); // 必须导入 join
const fs_1 = require("fs"); // 必须导入 fs 相关函数
// ... 其他代码保持不变
/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
exports.methods = {
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
        const saveDir = (0, path_1.join)(Editor.Project.path, 'assets', 'scripts', 'ui');
        if (!(0, fs_1.existsSync)(saveDir))
            (0, fs_1.mkdirSync)(saveDir, { recursive: true });
        // 2. 生成 View 基类 (UI_LoginView_Auto.ts) - 每次覆盖
        const autoGenCode = generateViewCode(className, nodes);
        const autoPath = (0, path_1.join)(saveDir, `${className}View_Auto.ts`);
        (0, fs_1.writeFileSync)(autoPath, autoGenCode);
        // 3. 生成 Logic 类 (UI_LoginView.ts) - 仅当不存在时生成
        const logicPath = (0, path_1.join)(saveDir, `${className}View.ts`);
        if (!(0, fs_1.existsSync)(logicPath)) {
            const logicCode = generateLogicCode(className);
            (0, fs_1.writeFileSync)(logicPath, logicCode);
        }
        // 4. 刷新资源管理器
        await Editor.Message.send('asset-db', 'refresh-asset', 'db://assets/scripts/ui');
        console.log(`[UI Generator] ${className} 代码生成完毕！`);
    }
};
/** 生成 View 类字符串 (包含 property 绑定) */
function generateViewCode(className, nodes) {
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
function generateLogicCode(className) {
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
function load() { }
/**
 * @en Method triggered when uninstalling the extension
 * @zh 卸载扩展时触发的方法
 */
function unload() { }
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NvdXJjZS9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQTRGQSxvQkFBeUI7QUFNekIsd0JBQTJCO0FBbEczQiwrQkFBNEIsQ0FBQyxZQUFZO0FBQ3pDLDJCQUEwRCxDQUFDLGVBQWU7QUFFMUUsZUFBZTtBQUVmOzs7R0FHRztBQUNVLFFBQUEsT0FBTyxHQUE0QztJQUM1RDs7O09BR0c7SUFDSCxPQUFPO1FBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRUQsS0FBSyxDQUFDLGNBQWM7UUFDaEIsc0JBQXNCO1FBQ3RCLE1BQU0sSUFBSSxHQUFHLE1BQU0sTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLHNCQUFzQixFQUFFO1lBQ3ZFLElBQUksRUFBRSxtQkFBbUI7WUFDekIsTUFBTSxFQUFFLG1CQUFtQjtZQUMzQixJQUFJLEVBQUUsRUFBRTtTQUNYLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsaUNBQWlDLENBQUMsQ0FBQztZQUNqRCxPQUFPO1FBQ1gsQ0FBQztRQUVELE1BQU0sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2xDLE1BQU0sT0FBTyxHQUFHLElBQUEsV0FBSSxFQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDckUsSUFBSSxDQUFDLElBQUEsZUFBVSxFQUFDLE9BQU8sQ0FBQztZQUFFLElBQUEsY0FBUyxFQUFDLE9BQU8sRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBRWxFLDhDQUE4QztRQUM5QyxNQUFNLFdBQVcsR0FBRyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdkQsTUFBTSxRQUFRLEdBQUcsSUFBQSxXQUFJLEVBQUMsT0FBTyxFQUFFLEdBQUcsU0FBUyxjQUFjLENBQUMsQ0FBQztRQUMzRCxJQUFBLGtCQUFhLEVBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBRXJDLDZDQUE2QztRQUM3QyxNQUFNLFNBQVMsR0FBRyxJQUFBLFdBQUksRUFBQyxPQUFPLEVBQUUsR0FBRyxTQUFTLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZELElBQUksQ0FBQyxJQUFBLGVBQVUsRUFBQyxTQUFTLENBQUMsRUFBRSxDQUFDO1lBQ3pCLE1BQU0sU0FBUyxHQUFHLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQy9DLElBQUEsa0JBQWEsRUFBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDeEMsQ0FBQztRQUVELGFBQWE7UUFDYixNQUFNLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxlQUFlLEVBQUUsd0JBQXdCLENBQUMsQ0FBQztRQUNqRixPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixTQUFTLFVBQVUsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7Q0FDSixDQUFDO0FBRUYsb0NBQW9DO0FBQ3BDLFNBQVMsZ0JBQWdCLENBQUMsU0FBaUIsRUFBRSxLQUFZO0lBQ3JELElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUNmLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDZCxLQUFLLElBQUksaUJBQWlCLENBQUMsQ0FBQyxJQUFJLGlCQUFpQixDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxJQUFJLHFCQUFxQixDQUFDO0lBQzVGLENBQUMsQ0FBQyxDQUFDO0lBRUgsT0FBTzs7Ozs7OztZQU9DLFNBQVM7ZUFDTixTQUFTO0VBQ3RCLEtBQUs7RUFDTCxDQUFDO0FBQ0gsQ0FBQztBQUVELGlDQUFpQztBQUNqQyxTQUFTLGlCQUFpQixDQUFDLFNBQWlCO0lBQ3hDLE9BQU87V0FDQSxTQUFTLHVCQUF1QixTQUFTOzs7WUFHeEMsU0FBUztlQUNOLFNBQVMsZ0JBQWdCLFNBQVM7Ozs7O0VBSy9DLENBQUM7QUFDSCxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBZ0IsSUFBSSxLQUFJLENBQUM7QUFFekI7OztHQUdHO0FBQ0gsU0FBZ0IsTUFBTSxLQUFJLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBqb2luIH0gZnJvbSAncGF0aCc7IC8vIOW/hemhu+WvvOWFpSBqb2luXHJcbmltcG9ydCB7IHdyaXRlRmlsZVN5bmMsIGV4aXN0c1N5bmMsIG1rZGlyU3luYyB9IGZyb20gJ2ZzJzsgLy8g5b+F6aG75a+85YWlIGZzIOebuOWFs+WHveaVsFxyXG5cclxuLy8gLi4uIOWFtuS7luS7o+eggeS/neaMgeS4jeWPmFxyXG5cclxuLyoqXHJcbiAqIEBlbiBSZWdpc3RyYXRpb24gbWV0aG9kIGZvciB0aGUgbWFpbiBwcm9jZXNzIG9mIEV4dGVuc2lvblxyXG4gKiBAemgg5Li65omp5bGV55qE5Li76L+b56iL55qE5rOo5YaM5pa55rOVXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgbWV0aG9kczogeyBba2V5OiBzdHJpbmddOiAoLi4uYW55OiBhbnkpID0+IGFueSB9ID0ge1xyXG4gICAgLyoqXHJcbiAgICAgKiBAZW4gQSBtZXRob2QgdGhhdCBjYW4gYmUgdHJpZ2dlcmVkIGJ5IG1lc3NhZ2VcclxuICAgICAqIEB6aCDpgJrov4cgbWVzc2FnZSDop6blj5HnmoTmlrnms5VcclxuICAgICAqL1xyXG4gICAgc2hvd0xvZygpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnSGVsbG8gV29ybGQnKTtcclxuICAgIH0sXHJcblxyXG4gICAgYXN5bmMgb25HZW5lcmF0ZUNvZGUoKSB7XHJcbiAgICAgICAgLy8gMS4g6LCD55SoIHNjZW5lLnRzIOiOt+WPluaVsOaNrlxyXG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdleGVjdXRlLXNjZW5lLXNjcmlwdCcsIHtcclxuICAgICAgICAgICAgbmFtZTogJ3VpLWNvZGUtZ2VuZXJhdG9yJyxcclxuICAgICAgICAgICAgbWV0aG9kOiAnZ2V0U2VsZWN0aW9uTm9kZXMnLFxyXG4gICAgICAgICAgICBhcmdzOiBbXVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAoIWRhdGEpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIuivt+WFiOWcqOWxgue6p+euoeeQhuWZqOS4remAieS4rSBVSSDmoLnoioLngrkgKFByZWZhYiDmoLnoioLngrkpXCIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCB7IGNsYXNzTmFtZSwgbm9kZXMgfSA9IGRhdGE7XHJcbiAgICAgICAgY29uc3Qgc2F2ZURpciA9IGpvaW4oRWRpdG9yLlByb2plY3QucGF0aCwgJ2Fzc2V0cycsICdzY3JpcHRzJywgJ3VpJyk7XHJcbiAgICAgICAgaWYgKCFleGlzdHNTeW5jKHNhdmVEaXIpKSBta2RpclN5bmMoc2F2ZURpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XHJcblxyXG4gICAgICAgIC8vIDIuIOeUn+aIkCBWaWV3IOWfuuexuyAoVUlfTG9naW5WaWV3X0F1dG8udHMpIC0g5q+P5qyh6KaG55uWXHJcbiAgICAgICAgY29uc3QgYXV0b0dlbkNvZGUgPSBnZW5lcmF0ZVZpZXdDb2RlKGNsYXNzTmFtZSwgbm9kZXMpO1xyXG4gICAgICAgIGNvbnN0IGF1dG9QYXRoID0gam9pbihzYXZlRGlyLCBgJHtjbGFzc05hbWV9Vmlld19BdXRvLnRzYCk7XHJcbiAgICAgICAgd3JpdGVGaWxlU3luYyhhdXRvUGF0aCwgYXV0b0dlbkNvZGUpO1xyXG5cclxuICAgICAgICAvLyAzLiDnlJ/miJAgTG9naWMg57G7IChVSV9Mb2dpblZpZXcudHMpIC0g5LuF5b2T5LiN5a2Y5Zyo5pe255Sf5oiQXHJcbiAgICAgICAgY29uc3QgbG9naWNQYXRoID0gam9pbihzYXZlRGlyLCBgJHtjbGFzc05hbWV9Vmlldy50c2ApO1xyXG4gICAgICAgIGlmICghZXhpc3RzU3luYyhsb2dpY1BhdGgpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGxvZ2ljQ29kZSA9IGdlbmVyYXRlTG9naWNDb2RlKGNsYXNzTmFtZSk7XHJcbiAgICAgICAgICAgIHdyaXRlRmlsZVN5bmMobG9naWNQYXRoLCBsb2dpY0NvZGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gNC4g5Yi35paw6LWE5rqQ566h55CG5ZmoXHJcbiAgICAgICAgYXdhaXQgRWRpdG9yLk1lc3NhZ2Uuc2VuZCgnYXNzZXQtZGInLCAncmVmcmVzaC1hc3NldCcsICdkYjovL2Fzc2V0cy9zY3JpcHRzL3VpJyk7XHJcbiAgICAgICAgY29uc29sZS5sb2coYFtVSSBHZW5lcmF0b3JdICR7Y2xhc3NOYW1lfSDku6PnoIHnlJ/miJDlrozmr5XvvIFgKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKiDnlJ/miJAgVmlldyDnsbvlrZfnrKbkuLIgKOWMheWQqyBwcm9wZXJ0eSDnu5HlrpopICovXHJcbmZ1bmN0aW9uIGdlbmVyYXRlVmlld0NvZGUoY2xhc3NOYW1lOiBzdHJpbmcsIG5vZGVzOiBhbnlbXSkge1xyXG4gICAgbGV0IHByb3BzID0gXCJcIjtcclxuICAgIG5vZGVzLmZvckVhY2gobiA9PiB7XHJcbiAgICAgICAgcHJvcHMgKz0gYCAgICBAcHJvcGVydHkoJHtuLnR5cGV9KVxcbiAgICBwdWJsaWMgJHtuLm5hbWV9OiAke24udHlwZX0gfCBudWxsID0gbnVsbDtcXG5cXG5gO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIGBpbXBvcnQgeyBfZGVjb3JhdG9yLCBDb21wb25lbnQsIE5vZGUsIEJ1dHRvbiwgTGFiZWwsIFNwcml0ZSwgRWRpdEJveCB9IGZyb20gJ2NjJztcclxuY29uc3QgeyBjY2NsYXNzLCBwcm9wZXJ0eSB9ID0gX2RlY29yYXRvcjtcclxuXHJcbi8qKiBcclxuICog6K+l57G755Sx5o+S5Lu26Ieq5Yqo55Sf5oiQ77yM6K+35Yu/5omL5Yqo5L+u5pS544CCXHJcbiAqIOmHjeaWsOeUn+aIkOaXtu+8jOatpOaWh+S7tuS8muiiq+imhuebluOAglxyXG4gKi9cclxuQGNjY2xhc3MoJyR7Y2xhc3NOYW1lfVZpZXdfQXV0bycpXHJcbmV4cG9ydCBjbGFzcyAke2NsYXNzTmFtZX1WaWV3X0F1dG8gZXh0ZW5kcyBDb21wb25lbnQge1xyXG4ke3Byb3BzfVxyXG59YDtcclxufVxyXG5cclxuLyoqIOeUn+aIkCBMb2dpYyDnsbvlrZfnrKbkuLIgKOe7p+aJv+iHqiBWaWV3IOexuykgKi9cclxuZnVuY3Rpb24gZ2VuZXJhdGVMb2dpY0NvZGUoY2xhc3NOYW1lOiBzdHJpbmcpIHtcclxuICAgIHJldHVybiBgaW1wb3J0IHsgX2RlY29yYXRvciB9IGZyb20gJ2NjJztcclxuaW1wb3J0IHsgJHtjbGFzc05hbWV9Vmlld19BdXRvIH0gZnJvbSAnLi8ke2NsYXNzTmFtZX1WaWV3X0F1dG8nO1xyXG5jb25zdCB7IGNjY2xhc3MgfSA9IF9kZWNvcmF0b3I7XHJcblxyXG5AY2NjbGFzcygnJHtjbGFzc05hbWV9VmlldycpXHJcbmV4cG9ydCBjbGFzcyAke2NsYXNzTmFtZX1WaWV3IGV4dGVuZHMgJHtjbGFzc05hbWV9Vmlld19BdXRvIHtcclxuICAgIG9uTG9hZCgpIHtcclxuICAgICAgICAvLyDlnKjmraTlpITnvJblhpnkuJrliqHpgLvovpFcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLl9idG5Db25maXJtKTtcclxuICAgIH1cclxufWA7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBAZW4gTWV0aG9kIFRyaWdnZXJlZCBvbiBFeHRlbnNpb24gU3RhcnR1cFxyXG4gKiBAemgg5omp5bGV5ZCv5Yqo5pe26Kem5Y+R55qE5pa55rOVXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbG9hZCgpIHt9XHJcblxyXG4vKipcclxuICogQGVuIE1ldGhvZCB0cmlnZ2VyZWQgd2hlbiB1bmluc3RhbGxpbmcgdGhlIGV4dGVuc2lvblxyXG4gKiBAemgg5Y246L295omp5bGV5pe26Kem5Y+R55qE5pa55rOVXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdW5sb2FkKCkge31cclxuIl19