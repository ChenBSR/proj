/**
 * Core 模块的集成（Facade 模式）
 * 为了让调用更方便，通常在 Core 目录下创建一个 Game.ts，作为所有核心模块的入口（外观模式）。
 */
import { EventMgr } from "./EventMgr";
import { Logger } from "./Logger";
import { PoolMgr } from "./PoolMgr";

export class Game{
    public static get Event(){
        return EventMgr.getInstance();
    }

    public static get Pool(){
        return PoolMgr.getInstance();
    }

    // public static get UI(){

    // }

    public static get Log(){
        return Logger;
    }
}
/**
 * 使用示例：
 * Game.Event.emit("LEVEL_START");
 * Game.Log.d("Logic", "Level Started");
 */