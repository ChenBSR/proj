import { _decorator, Button, Component, Node, tween, UIOpacity, v3, View } from 'cc';
import { ResKeeper } from './ResKeeper';
import { EventMgr } from './EventMgr';
import { Logger } from './Logger';
const { ccclass, property } = _decorator;

export enum ViewState{
    None,
    Opening,
    Opened,
    Closing,
    Closed
}

@ccclass('BaseView')
export abstract class BaseView extends Component {
    private static Tag: string = 'BaseView';

    /** 界面名称(通常对应 Prefab 路径) */
    public viewName: string = "";

    /** 界面状态 */
    protected _state: ViewState = ViewState.None;

    /** 传递给界面的初始化数据 */
    protected _initialData: any = null;

    /** 自动销毁绑定的事件列表(用于全局消息) */
    private _eventList: {eventName: string, callback: Function, target: any}[] = [];

    protected _resKeeper: ResKeeper = new ResKeeper();

    // ------------- 生命周期 -------------

    /**
     * 
     * @param data 打开界面的入口(由 UI 管理器调用)
     */
    public init(data?: any): void{
        this._initialData = data;
        this._state = ViewState.Opening;
    }

    onLoad() {
        this.registerUIEvents();
    }

    start() {
        this.showAnimation().then(() => {
            this._state = ViewState.Opened;
            this.onOpen();
        });
    }

    /** 界面打开后的回调,子类重写 */
    protected onOpen(): void{}

    /** 界面关闭前的回调,子类重写 */
    protected onClose(): void{}


    // ------------- UI 动画 -------------

    /** 默认打开动画(缩放/淡入) */
    protected async showAnimation(): Promise<void>{
        return new Promise((resolve) => {
            // cocos 3.x版本opacity被移到了UIOpacity组件上
            let uiOpacity = this.node.getComponent(UIOpacity);
            if(!uiOpacity) uiOpacity = this.node.addComponent(UIOpacity);
            this.node.setScale(v3(0.5, 0.5, 0.5));
            uiOpacity.opacity = 0;
            tween(this.node).to(0.2, {scale: v3(1, 1, 1)}, {easing: 'backOut'})
                .start();
            tween(uiOpacity).to(0.2, {opacity: 255})
                .call(() => resolve())
                .start();
        });
    }

    protected async hideAnimation(): Promise<void>{
        return new Promise((resolve) => {
            let uiOpacity = this.node.getComponent(UIOpacity);
            if(uiOpacity){
                tween(uiOpacity).to(0.15, {opacity: 0})
                    .start();
            } 
            tween(this.node).to(0.15, {scale: v3(0.8, 0.8, 0.8)}, {easing: 'fade'})
                .call(() => resolve())
                .start();
            
        });
    }



    // ------------- 关闭逻辑 -------------

    /** 关闭界面 */
    public async close(): Promise<void>{
        if(this._state === ViewState.Closing || this._state === ViewState.Closed) return;
        this._state = ViewState.Closing;

        this.onClose();
        this.unregisterAllEvents(); // 自动注销事件

        await this.hideAnimation();

        this._state = ViewState.Closed;
        this.node.destroy(); // 销毁节点

        // TODO: 管理器释放Prefab资源
    }



    // ------------- 事件管理(防泄漏) -------------

    /** 注册全局消息监听,界面销毁时会自动移除 */
    protected addGlobalEvent(eventName: string, callback: Function, target: any): void{
        EventMgr.getInstance().on(eventName, callback, target);
        this._eventList.push({eventName, callback, target});
    }

    /**
     * 需要提前约定好,约定大于配置
     * 自动绑定按钮事件
     * 遍历节点,自动查找名为"btn_xxx"的节点并绑定点击回调
     */
    protected registerUIEvents(): void{
        this._findAllButtons(this.node);
    }

    private _findAllButtons(root: Node){
        for(let child of root.children){
            if(child.name.startsWith('btn_')){
                const btn = child.getComponent(Button);
                if(btn){
                    child.on(Button.EventType.CLICK, () => {
                        this.onButtonClicked(child.name, child);
                    }, this);
                }
            }
            this._findAllButtons(child);
        }
    }

    protected onButtonClicked(btnName: string, node: Node): void{
        // 由子类覆盖具体的逻辑
        Logger.d(BaseView.Tag, `Clicked:${btnName}`);
    }

    private unregisterAllEvents(): void{
        this._eventList.forEach(event => {
            EventMgr.getInstance().off(event.eventName, event.callback, event.target);
        });
        this._eventList = [];
    }


    // ------------- 工具方法 -------------
    /** 快速查找子节点 */
    protected getChildNode(path: string): Node | null{
        // TODO: 成熟的项目会生成 UUID 映射表
        // 使用引擎的查找方法 或者 递归查找
        return this.node.getChildByPath(path);
    }


    /**
     * 进一步优化建议
     * 1.UI 层级管理: 在BaseVIew中增加layer属性(如:Background, Normal, PopUp, Top),由UIMgr将其挂载到不同的根节点上.
     * 2.遮罩管理:在BaseView属性中增加isNeedMask,打开界面时UIMgr自动在底层生成一个半透明的遮罩,点击遮罩自动调用close().
     * 3.防连点控制:在onButtonClicked中加入全局计时器,防止用户由于网络延迟或手速过快,在0.5秒内连续点击同一个按钮多次,触发重复逻辑.
     */



    // /** 封装事件注册，实现自动注销 */
    // protected addEvent(name: string, cb: Function){
    //     EventMgr.getInstance().on(name, cb, this);
    // }

    // protected onDestroy(): void {
    //     // 1.自动移除所有以此对象为 target 的事件
    //     // 需要在 EventMgr 中扩展按 target 批量移除的功能

    //     // 2.自动释放本页面加载的所有资源
    //     this._resKeeper.releaseAll();
    // }
}

