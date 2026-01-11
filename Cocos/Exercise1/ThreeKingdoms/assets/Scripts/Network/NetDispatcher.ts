import { Logger } from "../Core/Logger";
import { Singleton } from "../Core/Singleton";
import { NetHandler } from "./NetInterface";

/** 解耦网络层与业务逻辑 */
export class NetDispatcher extends Singleton{
    private static readonly Tag: string = 'NetDispatcher';
    private _handlers: Map<string, NetHandler[]> = new Map();

    /** 注册监听 */
    public on(cmdId: number, msgId: number, handler: NetHandler){
        const ids = `${cmdId}-${msgId}`;
        let list = this._handlers.get(ids) || [];
        list.push(handler);
        this._handlers.set(ids, list);
    }

    /** 分发消息 */
    public dispatch(cmdId: number, msgId: number, data: any){
        const ids = `${cmdId}-${msgId}`;
        const list = this._handlers.get(ids);
         if(list){
            list.forEach(h => h(data));
         }else{
            Logger.w(NetDispatcher.Tag, `No handler for msg: ${ids}`);
         }
    }

    /** 移除监听 */
    public off(cmdId: number, msgId: number, handler: NetHandler){
        const ids = `${cmdId}-${msgId}`;
        let list = this._handlers.get(ids);
        if(list) this._handlers.set(ids, list.filter(h => h !== handler));
    }
}