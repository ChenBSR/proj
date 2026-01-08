import { _decorator, Asset, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

/** 全局资源引用计数管理 */
@ccclass('ResKeeper')
export class ResKeeper extends Component {
    private _heldAssets: Set<Asset> = new Set();

    /** 绑定资源到当前逻辑对象，随逻辑对象销毁而释放 */
    keep(asset: Asset){
        if(asset && !this._heldAssets.has(asset)){
            asset.addRef();
            this._heldAssets.add(asset);
        }
    }

    /** 手动释放当前对象持有的所有资源 */
    releaseAll(){
        this._heldAssets.forEach(asset => {
            asset.decRef();
        });
        this._heldAssets.clear();
    }
}

