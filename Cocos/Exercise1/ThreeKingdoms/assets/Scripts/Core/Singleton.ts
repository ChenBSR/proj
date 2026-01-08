/**
 * this: new () => T (显式 this 类型声明):
在 JS/TS 中，静态方法里的 this 指向的是类本身（构造函数）。
这里的语法是在告诉 TypeScript：“当我调用这个方法时，this 必须是一个构造函数（可以通过 new 调用），并且它返回的对象类型是 T。”
为什么要这么写？ 这样当你写 class MyService extends Singleton 并调用 MyService.getInstance() 时，TS 能自动推导出 T 是 MyService，从而让返回值具有正确的类型，而不是模糊的 Singleton 类型。
 */

/** 全局单例基类 */
export class Singleton{
    protected static _instances = new Map<any, any>();

    public static getInstance<T extends Singleton>(this: new() => T): T{
        const ct = this as any; // this 是构造函数
        if(!Singleton._instances.has(ct)){
            Singleton._instances.set(ct, new ct());
        }
        return Singleton._instances.get(ct);
    }
}
