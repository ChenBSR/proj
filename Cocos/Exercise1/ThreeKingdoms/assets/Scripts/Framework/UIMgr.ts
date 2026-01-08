import { BaseView } from "../Core/BaseView";
import { Singleton } from "../Core/Singleton";

export class UIMgr extends Singleton{
    private _uiStack: string[] = []; // UI 压栈，用于处理返回键
    private _activeViews: Map<string, BaseView> = new Map();

    /** 打开页面 */
    public async open(uiName: string, data?: any){
        // 1.获取配置（通常从静态表获取）
        const config = UI_CONFIG[uiName];

        // 2.加载并实例化
        const node = await 
    }
}