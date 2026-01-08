import { Asset, assetManager, AssetManager, instantiate, Node, Prefab, SpriteFrame, Texture2D } from "cc";
import { Singleton } from "./Singleton";
import { Logger } from "./Logger";

export interface ILoadConfig{
    bundle?: string; // Bundle名，默认为"resources"
    onProgress?:(finish: number, total: number) => void;
}

/**
 * 主要解决以下问题：
 * 1.异步变同步（Promise化）：避免回调地狱
 * 2.引用计数管理：自动处理 addRef 和 decRef，防止内存泄漏
 * 3.预制体实例化封装：加载后直接返回节点
 * 4.远程资源加载：支持图片，音频等 URL 加载
 * 5.场景/生命周期绑定：随界面关闭自动释放资源
 */
export class ResMgr extends Singleton{
    private static Tag: string = "ResMgr";

    /** 获取或加载 Bundle */
    public async getBundle(bundleName: string): Promise<AssetManager.Bundle>{
        return new Promise((resolve, reject) => {
            const bundle = assetManager.getBundle(bundleName);
            if(bundle){
                resolve(bundle);
            }else{
                assetManager.loadBundle(bundleName, (err, bundle) => {
                    if(err) reject(err);
                    else resolve(bundle);
                })
            }
        });
    }

    /** 通用的加载资源 */
    public async load<T extends Asset>(path: string, type: new (...args: any[]) => T, config?: any): Promise<T>{
        const bundleName = config?.bundle || 'resources';
        const bundle = await this.getBundle(bundleName);

        return new Promise((resolve, reject) => {
            // 先尝试从缓存获取
            const asset = bundle.get(path, type) as T;
            if(asset){
                asset.addRef(); // 增加引用计数
                resolve(asset);
                return;
            }

            // 远程或本地加载
            bundle.load(path, type, config?.onProgress || null, (err, res) => {
                if(err){
                    Logger.e(ResMgr.Tag, `加载资源失败：${path}，error：${err}`);
                    reject(err);
                }else{
                    res.addRef(); // 增加引用计数
                    resolve(res);
                }
            });
        });
    }

    /** 加载 Prefab 并实例化成 Node */
    public async instantiate(path: string, config?: ILoadConfig): Promise<Node>{
        try{
            const prefab = await this.load(path, Prefab, config);
            const node = instantiate(prefab);
            // 技巧：在 node 上挂载一个标识，方便回收时找到资源
            (node as any)._originAsset = prefab;
            return node;
        }catch(e){
            throw e;
        }
    }

    /** 加载远程图片 */
    public async loadRemotefImage(url: string): Promise<SpriteFrame>{
        return new Promise((resolve, reject) => {
            assetManager.loadRemote<Texture2D>(url, (err, texture) => {
                if(err) reject(err);
                else{
                    const sf = new SpriteFrame();
                    sf.texture = texture;
                    sf.addRef(); // 增加引用计数
                    resolve(sf);
                }
            });
        });
    }

    /** 释放资源 */
    public release(asset: Asset|string, type?: typeof Asset, bundleName: string = 'resources'){
        if(typeof asset === 'string'){
            const bundle = assetManager.getBundle(bundleName);
            const res = bundle?.get(asset, type);
            if(res) res.decRef();
        }else{
            asset.decRef();
        }
    }

    /** 销毁节点并自动释放其对应的 Prefab 引用 */
    public destroyNode(node: Node){
        if(node && (node as any)._originAsset){
            this.release((node as any)._originAsset);
        }
        node?.destroy();
    }
}