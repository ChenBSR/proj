import { HEADER_SIZE, NetData } from "./NetInterface";

/** 处理 ArrayBuffer 与消息对象的转换 */
export class NetPacket{

    /** 封装：把cmdId，msgId和protobuf数据封装成ArrayBuffer [Length(4字节) | CmdID(4字节) | MsgID(4字节) | Payload(N字节)] */
    public static pack(cmdId: number, msgId: number, payload: Uint8Array): ArrayBuffer{
        const totalLen = HEADER_SIZE + payload.byteLength;
        const buffer = new ArrayBuffer(totalLen);
        const view = new DataView(buffer);

        view.setUint32(0, totalLen, true); // 总长度，小端序
        view.setUint32(4, cmdId, true);
        view.setUint32(8, msgId, true);

        const uint8Array = new Uint8Array(buffer);
        uint8Array.set(payload, HEADER_SIZE);

        return buffer;
    }

    /** 解包：从ArrayBuffer中提取cmdId，msgId和data */
    public static unpack(buffer: ArrayBuffer): NetData{
        const view = new DataView(buffer);
        const cmdId = view.getUint32(4, true);
        const msgId = view.getUint32(8, true);
        const data = new Uint8Array(buffer, HEADER_SIZE);
        return {cmdId, msgId, data};
    }
}