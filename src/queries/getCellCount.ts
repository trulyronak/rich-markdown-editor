import { EditorState } from "prosemirror-state";
import { findChildrenByType } from "prosemirror-utils";

export default function getCellCount (state: EditorState) {
  const $head = state.selection.$head;
  let thCount = 0
  let tdCount = 0
  for (let d = $head.depth; d > 0; d--) {
    const node = $head.node(d);
    if (["tr"].includes(node.type.name)) {
      tdCount = findChildrenByType(node, state.schema.nodes.td).length
      thCount = findChildrenByType(node, state.schema.nodes.th).length
    }
  }
  return {
    total: thCount + tdCount,
    th: thCount,
    td: tdCount,
  }
}