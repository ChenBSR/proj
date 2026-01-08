export enum LogLevel {
    DEBUG,
    INFO,
    WARN,
    ERROR,
    NONE
}

/** 全局日志系统 */
export class Logger{
    public static level: LogLevel = LogLevel.DEBUG;

    private static format(tag: string, msg: string){
        const now = new Date();
        return `[${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}][${tag}] ${msg}`
    }

    public static d(tag: string, msg: string){
        if(this.level <= LogLevel.DEBUG) console.log(this.format(tag, msg));
    }

    public static e(tag: string, msg: string){
        if(this.level <= LogLevel.ERROR) console.error(this.format(tag, msg));
    }
}