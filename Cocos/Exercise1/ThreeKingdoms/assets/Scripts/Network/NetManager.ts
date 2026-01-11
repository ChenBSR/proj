import { EventMgr } from "../Core/EventMgr";
import { Logger } from "../Core/Logger";
import { Singleton } from "../Core/Singleton";
import { NetDispatcher } from "./NetDispatcher";
import { NetNode } from "./NetNode";
import { NetPacket } from "./NetPacket";

// 假设这是你生成的 Protobuf 映射类
// import { proto } from './proto/all_pb'; 

/** 业务直接调用的接口.它集成了 Protobuf 解析,心跳和 Request 模式 */
export class NetManager extends Singleton{
    private static readonly Tag = 'NetManager';

    private _node: NetNode = new NetNode();

    /** 存储等待响应的Promise */
    private _requests: Map<number, {resolve: Function, reject: Function, timer: number}> = new Map();
    private _lastHeartbeatTime: number = 0;

    private readonly HEARBEAT_INTERVAL = 5000; // 5秒心跳

    constructor(){
        super();
        EventMgr.getInstance().on('connected', this.onConnected, this._node);
        EventMgr.getInstance().on('data', this.onRawData, this._node);
    }

    public connect(url: string){
        this._node.connect(url);
    }

    /**
     * 发送请求并等待响应
     * @param cmdId 命令ID
     * @param msgId 消息ID
     * @param resMsgId 期待返回的消息ID
     * @param pbObj Protobuf对象
     * @param timeout 超时时间
     */
    public async request<T>(cmdId: number, msgId: number, resMsgId: number, pbObj: any, timeout = 7000): Promise<T>{
        return new Promise((resolve, reject) => {
            if(this.send(cmdId, msgId, pbObj)){
                const timer = window.setTimeout(() => {
                    this._requests.delete(resMsgId);
                    reject(`Request ${msgId} timeout waiting for ${resMsgId}`);
                }, timeout);

                this._requests.set(resMsgId, {resolve, reject, timer});
            }else{
                reject('Network disconnected');
            }
        });
    }

    public send(cmdId: number, msgId: number, pbObj: any): boolean{
        // 将pb对象转换为Uint8Array
        const uint8 = pbObj.constructor.encode(pbObj).finish();
        const buffer = NetPacket.pack(cmdId, msgId, uint8);
        return this._node.send(buffer);
    }

    private onConnected() {
        this.startHeartbeat();
    }

    private onRawData(buffer: ArrayBuffer) {
        const { cmdId, msgId, data } = NetPacket.unpack(buffer);
        
        // 1. 查找对应的解析类 (这里需要你的协议字典映射)
        const ProtoClass = this.getProtoClassById(msgId);
        if (!ProtoClass) return;

        const message = ProtoClass.decode(data);

        // 2. 检查是否有等待中的 Request
        if (this._requests.has(msgId)) {
            const req = this._requests.get(msgId)!;
            clearTimeout(req.timer);
            req.resolve(message);
            this._requests.delete(msgId);
        }

        // 3. 全局分发
        NetDispatcher.getInstance().dispatch(cmdId, msgId, message);
    }

    private getProtoClassById(msgId: number): any {
        // 实际开发中，这里应根据 msgId 返回对应的 Protobuf Class
        // return proto.msg_map[msgId];
        return null; 
    }

    private startHeartbeat() {
        setInterval(() => {
            // this.send(MsgId.CS_HEARTBEAT, {});
        }, this.HEARBEAT_INTERVAL);
    }
    
}

/**
 * 初始化：
 * NetManager.instance.connect("ws://192.168.1.100:8080");
 * 
 * 发送并等待结果：
 * async function login() {
    let req = proto.C2S_Login.create({ user: "abc", pass: "123" });
    try {
        let res = await NetManager.instance.request<proto.S2C_Login>(
            MsgID.C2S_Login, 
            MsgID.S2C_Login, 
            req
        );
        console.log("登录成功，角色名:", res.nickname);
    } catch(e) {
        console.error("登录失败:", e);
    }
}
* 监听全局同步消息：
* NetDispatcher.instance.on(MsgID.S2C_EntityMove, (data: proto.S2C_EntityMove) => {
    const player = getPlayerById(data.uid);
    player.getComponent(NetworkEntity).syncPos(data.x, data.y);
});
 */