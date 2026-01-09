import { Layers, Node, Widget } from "cc";
import { BaseView } from "../Core/BaseView";
import { ResMgr } from "../Core/ResMgr";
import { Singleton } from "../Core/Singleton";
import { UI_CONFIG } from "../Game/UI/UI_CONFIG";

export interface UIConfig{
    bundleName: string;     // 资源所在包名
    path: string;       // Prefab路径
    layer: UILayer;     // 所属层级
    isCache: boolean;
}

export enum UILayer{
    Bg = 'Bg',         // 背景层
    Main = 'Main',      // 主界面层(HUD)
    Normal = 'Main',    // 普通一级界面(背包,商店等)
    PopUp = 'Main',     // 弹窗层(二级确认框,奖励获得等)
    Notify = 'Main',    // 提示层(Toast,跑马灯等)
    Guide = 'Main',     // 引导层
    Top = 'Main'        //置顶层
}

export class UIMgr extends Singleton{
    private _uiStack: string[] = []; // UI 压栈，用于处理返回键

    /** 存储已打开的界面实例 */
    private _activeViews: Map<string, BaseView> = new Map();

    /** 存储层级根节点 */
    private _layerNodes: Map<UILayer, Node> = new Map();

    /** 正在加载中的界面(防止重复点击触发多次加载) */
    private _loadingViews: Set<string> = new Set();

    private LayerList = [
        UILayer.Bg,
        UILayer.Main,
        UILayer.Normal,
        UILayer.PopUp,
        UILayer.Notify,
        UILayer.Guide,
        UILayer.Top
    ];

    /** 初始化管理器,设置根节点 */
    public init(uiRoot: Node){
        const layers = this.LayerList;
        layers.forEach(layerName => {
            let node = new Node(layerName);
            node.layer = Layers.Enum.UI_2D;
            let widget = node.addComponent(Widget);
            // 铺满屏幕
            widget.isAlignTop = widget.isAlignBottom = widget.isAlignLeft = widget.isAlignRight = true;
            widget.top = widget.bottom = widget.left = widget.right = 0;

            node.parent = uiRoot;
            this._layerNodes.set(layerName as UILayer, node);
        });
    }

    /**
     * 打开页面
     * @param config 
     * @param data 
     */
    public async open(config: UIConfig, data?: any): Promise<BaseView | null>{
        const {path, bundleName, layer} = config;

        // 1.检查是否已经打开
        if(this._activeViews.has(path)){
            const view = this._activeViews.get(path);
            view.node.setSiblingIndex(view.node.parent!.children.length - 1); // 置顶
            return view;
        }

        // 2.检查是否正在加载中
        if(this._loadingViews.has(path)) return null;
        this._loadingViews.add(path);

        // 3.加载Bundle
        const bundle = await ResMgr.getInstance().getBundle(bundleName);
    }
}