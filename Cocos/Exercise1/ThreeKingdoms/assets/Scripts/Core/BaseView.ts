import { _decorator, Component, Node } from 'cc';
import { ResKeeper } from './ResKeeper';
import { EventMgr } from './EventMgr';
const { ccclass, property } = _decorator;

@ccclass('BaseView')
export class BaseView extends Component {
    protected _resKeeper: ResKeeper = new ResKeeper();

    /** 封装事件注册，实现自动注销 */
    protected addEvent(name: string, cb: Function){
        EventMgr.getInstance().on(name, cb, this);
    }

    protected onDestroy(): void {
        // 1.自动移除所有以此对象为 target 的事件
        // 需要在 EventMgr 中扩展按 target 批量移除的功能

        // 2.自动释放本页面加载的所有资源
        this._resKeeper.releaseAll();
    }
}

