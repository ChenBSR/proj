/**
 * 在现代开发中，推荐遵循 “最小权力原则”：
首选 const：默认情况下，所有的变量都应该声明为 const。
次选 let：只有当你明确知道这个变量需要被重新赋值（比如计数器、循环变量）时，才使用 let。
弃用 var：在现代项目中，永远不要再使用 var。
 */
import { Singleton } from "./Singleton";

/** 全局事件总线 */
export class EventMgr extends Singleton{
    private _handlers: Map<string, Array<{cb: Function, target: any, once: boolean}>> = new Map();

    /** 监听事件 */
    on(eventName: string, callback: Function, target?: any, once = false){
        if(!this._handlers.has(eventName)){
            this._handlers.set(eventName, []);
        }
        this._handlers.get(eventName).push({cb: callback, target: target, once: once});
    }

    /** 发送事件 */
    emit(eventName: string, ...args: any[]){
        const list = this._handlers.get(eventName);
        if(!list) return;

        for(let i = list.length - 1; i >= 0; i--){
            const handler = list[i];
            handler.cb.apply(handler.target, args);
            if(handler.once) list.splice(i, 1);
        }
    }

    /** 移除监听（必须在 onDestroy 中调用，防止内存泄漏） */
    off(eventName: string, callback: Function, target?: any){
        const list = this._handlers.get(eventName);
        if(!list) return;
        this._handlers.set(eventName, list.filter(h => h.cb !== callback || h.target !== target));
    }
}