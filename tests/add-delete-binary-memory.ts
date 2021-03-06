import shuffle = require("shuffle-array");
import * as test from "tape";
import {INode, NodeManagerBinaryMemory, Tree} from "../src";

function validateRulesFollowed(t: test.Test, baseMessage: string, nodesManager: NodeManagerBinaryMemory, expectedNumberOfNodes: number): void {
    const root = nodesManager.getRoot();
    if (root === null) {
        t.equal(expectedNumberOfNodes, 0, `${baseMessage}: Expected number of nodes is correct`);
        return;
    }

    t.ok(!root.getIsRed(), `${baseMessage}: Root is black`);
    t.equal(expectedNumberOfNodes, getNumberOfNotNullNodes(root), `${baseMessage}: Expected number of nodes is correct`);
    t.ok(checkOrder(root), `${baseMessage}: Order of nodes is correct`);
    t.ok(checkHeight(root), `${baseMessage}: Height of sub-trees is correct`);
}

function checkOrder(node: INode<Uint8Array, Uint8Array>): boolean {
    const left = node.getLeft();
    const right = node.getRight();
    if (!node.getIsRed()) {
        return (
            (
                !left ||
                checkOrder(left)
            ) &&
            (
                !right ||
                checkOrder(right)
            )
        );
    }
    return (
        (
            !left ||
            (
                !left.getIsRed() &&
                checkOrder(left)
            )
        ) &&
        (
            !right ||
            (
                !right.getIsRed() &&
                checkOrder(right)
            )
        )
    );
}

function checkHeight(node: INode<Uint8Array, Uint8Array>): boolean {
    return getHeight(node) !== false;
}

function getHeight(node: INode<Uint8Array, Uint8Array> | null): number | false {
    if (!node) {
        return 1;
    }
    const leftHeight = getHeight(node.getLeft());
    const rightHeight = getHeight(node.getRight());
    if (leftHeight !== rightHeight || leftHeight === false) {
        return false;
    }
    return (node.getIsRed() ? 0 : 1) + leftHeight;
}

function getNumberOfNotNullNodes(node: INode<Uint8Array, Uint8Array> | null): number {
    if (node === null) {
        return 0;
    }

    return 1 + getNumberOfNotNullNodes(node.getLeft()) + getNumberOfNotNullNodes(node.getRight());
}

test('Basic test', (t) => {
    const keys: Uint8Array[] = [];
    for (let i = 0; i < 8; ++i) {
        for (let j = 0; j < 255; ++j) {
            keys.push(Uint8Array.of(i, j));
        }
    }

    const nodeManager = NodeManagerBinaryMemory.create(keys.length, 2, 0);
    const tree = new Tree(nodeManager);
    let expectedNumberOfNodes = 0;
    for (const key of keys) {
        ++expectedNumberOfNodes;
        tree.addNode(key, new Uint8Array(0));
        validateRulesFollowed(t, `Inserting key [${key.join(', ')}]`, nodeManager, expectedNumberOfNodes);
    }
    shuffle(keys);

    for (const key of keys) {
        --expectedNumberOfNodes;
        tree.removeNode(key);
        validateRulesFollowed(t, `Deleting key [${key.join(', ')}]`, nodeManager, expectedNumberOfNodes);
    }

    t.end();
});
