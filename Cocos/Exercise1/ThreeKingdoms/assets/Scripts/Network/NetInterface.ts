export enum NetState{
    Disconnected,
    Connecting,
    Connected,
    Reconnecting   
}

export interface NetData{
    cmdId: number;        // 命令id
    msgId: number;        // 消息编号
    data: Uint8Array
}

export type NetHandler = (data: any) => void;

/** 协议包头长度：4字节长度+4字节命令ID+4字节消息ID */
export const HEADER_SIZE = 12; // 4 bytes len + 4 bytes cmdId + 4 bytes msgId