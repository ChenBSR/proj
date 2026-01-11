import { EventTarget } from "cc";
import { Logger } from "../Core/Logger";
import { NetState } from "./NetInterface";

/** 套接字 封装 WebSocket，处理重连逻辑和基础事件*/
export class NetNode extends EventTarget{
    private static readonly Tag = 'NetNode';
    private _socket: WebSocket | null = null;
    private _state: NetState = NetState.Disconnected;
    private _url: string = '';
    private _retryCount: number = 0;
    private readonly MAX_RETRY = 5;

    public connect(url: string){
        this._url = url;
        this._state = NetState.Connecting;
        Logger.d(NetNode.Tag, `Connecting to ${url}`);

        this._socket = new WebSocket(url);
        this._socket.binaryType = 'arraybuffer'; // 指定为二进制模式

        this._socket.onopen = this.onOpen.bind(this);
        this._socket.onmessage = this.onMessage.bind(this);
        this._socket.onerror = this.onError.bind(this);
        this._socket.onclose = this.onClose.bind(this);
    }

    private onOpen(){
        this._state = NetState.Connected;
        this._retryCount = 0;
        this.emit('connected');
    }

    private onMessage(event: MessageEvent){
        if(event.data instanceof ArrayBuffer) this.emit('data', event.data);
    }

    private onError(err: any){
        Logger.e(NetNode.Tag, `Socket Error:${err}`);
    }

    private onClose(){
        this._state = NetState.Disconnected;
        this.emit('disconnected');
        this.tryReconnect();
    }

    private tryReconnect(){
        if(this._retryCount < this.MAX_RETRY){
            this._retryCount++;
            const delay = Math.pow(2, this._retryCount) * 100; // 2s, 4s, 8s ...
            Logger.w(NetNode.Tag, `Reconnecting in ${delay}ms (Attempt ${this._retryCount})`);
            setTimeout(() => this.connect(this._url), delay);
        }
    }

    public send(buffer: ArrayBuffer): boolean{
        if(this._socket && this._state === NetState.Connected){
            this._socket.send(buffer);
            return true;
        }
        return false;
    }

    public close(){
        if(this._socket){
            this._socket.onclose = null;
            this._socket.close();
            this._state = NetState.Disconnected;
        }
    }
}