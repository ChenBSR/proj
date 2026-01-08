import { _decorator, Component, instantiate, Node, NodePool, Prefab } from 'cc';
import { Singleton } from './Singleton';
const { ccclass, property } = _decorator;

/** 全局通用对象缓存池 */
@ccclass('PoolMgr')
export class PoolMgr extends Singleton {
    private _pools: Map<string, NodePool> = new Map();

    /** 获取对象 */
    getNode(prefab: Prefab): Node{
        const name = prefab.name;
        if(!this._pools.has(name)){
            this._pools.set(name, new NodePool());
        }
        const pool = this._pools.get(name);
        return pool.size() > 0 ? pool.get() : instantiate(prefab);
    }

    /** 回收对象 */
    putNode(node: Node){
        const name = node.name;
        if(this._pools.has(name)){
            this._pools.get(name).put(node);
        }else{
            node.destroy(); // 没有对应的池子则直接销毁
        }
    }

    /** 清空所有缓存（切换大场景时调用） */
    clearAll(){
        this._pools.forEach(p => p.clear());
        this._pools.clear();
    }
}

