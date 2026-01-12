// src/scene.ts
import { _decorator, director } from 'cc';

export const methods = {
    /** 获取选中节点的所有标记子节点信息 */
    getSelectionNodes() {
        // 1. 获取选中的 UUID
        const uuids = Editor.Selection.getSelected('node');
        if (!uuids || uuids.length === 0) {
            return null;
        }
        const targetUuid = uuids[0];

        // 2. 终极兼容方案：从当前运行的 director 场景递归查找
        // 无论是在 Prefab 模式还是普通场景模式，编辑器都会把节点挂在当前 Scene 下
        const currentScene = director.getScene();
        if (!currentScene) {
            console.error("【UI生成器】无法获取当前场景根节点");
            return null;
        }

        // 定义递归查找函数
        const findNodeByUuid = (root: any, uuid: string): any => {
            if (root.uuid === uuid) return root;
            const children = root.children;
            for (let i = 0; i < children.length; i++) {
                const result = findNodeByUuid(children[i], uuid);
                if (result) return result;
            }
            return null;
        };

        // 执行查找
        let rootNode = findNodeByUuid(currentScene, targetUuid);

        // 如果找不到，尝试 3.8.x 特有的 cce 获取方式（作为备选）
        if (!rootNode) {
            // @ts-ignore
            if (typeof cce !== 'undefined' && cce.Node && cce.Node.get) {
                // @ts-ignore
                rootNode = cce.Node.get(targetUuid);
            }
        }

        if (!rootNode) {
            console.error("【UI生成器】找不到 UUID 对应的节点: " + targetUuid);
            return null;
        }

        const nodeInfos: any[] = [];
        const prefixMap = {
            '_btn': 'Button',
            '_lbl': 'Label',
            '_spr': 'Sprite',
            '_node': 'Node',
            '_eb': 'EditBox'
        };

        // 3. 递归遍历选中的根节点，查找标记子节点
        const walk = (node: any) => {
            if (!node || !node.children) return;
            
            node.children.forEach((child: any) => {
                let isMatch = false;
                for (const prefix in prefixMap) {
                    if (child.name.startsWith(prefix)) {
                        nodeInfos.push({
                            name: child.name,
                            // @ts-ignore
                            type: prefixMap[prefix],
                            path: getNodePath(rootNode, child)
                        });
                        isMatch = true;
                        break;
                    }
                }
                // 递归继续查找子节点
                walk(child);
            });
        };

        walk(rootNode);
        return { className: rootNode.name, nodes: nodeInfos };
    }
};

/** 计算节点相对于根节点的路径 */
function getNodePath(root: any, target: any): string {
    if (root === target) return "";
    let path = target.name;
    let curr = target.parent;
    while (curr && curr !== root) {
        path = curr.name + "/" + path;
        curr = curr.parent;
    }
    return path;
}