import { EditorState } from "prosemirror-state";
import { TrashIcon, InsertAboveIcon, InsertBelowIcon, HighlightIcon } from "outline-icons";
import { MenuItem } from "../types";
import baseDictionary from "../dictionary";
import isNodeActive from "../queries/isNodeActive";

export default function tableRowMenuItems(
  state: EditorState,
  index: number,
  dictionary: typeof baseDictionary
): MenuItem[] {
  const { schema } = state;
  return [
    {
      name: "addRowAfter",
      tooltip: dictionary.addRowBefore,
      icon: InsertAboveIcon,
      attrs: { index: index - 1 },
      active: () => false,
      visible: index !== 0,
    },
    {
      name: "addRowAfter",
      tooltip: dictionary.addRowAfter,
      icon: InsertBelowIcon,
      attrs: { index },
      active: () => false,
    },
    {
      name: "setRowAttr",
      tooltip: dictionary.mark,
      icon: HighlightIcon,
      attrs: { index, bg: '#ccc' },
      active: isNodeActive(schema.nodes.tr, {
        colspan: 1,
        rowspan: 1,
        bg: "blue",
      }),
    },
    {
      name: "separator",
    },
    {
      name: "deleteRow",
      tooltip: dictionary.deleteRow,
      icon: TrashIcon,
      active: () => false,
    },
  ];
}
