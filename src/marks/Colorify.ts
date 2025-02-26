import { EditorState } from "prosemirror-state";
import Mark from "./Mark";

function markApplies(doc, ranges, type) {
  for (let i = 0; i < ranges.length; i++) {
    let {$from, $to} = ranges[i]
    let can = $from.depth == 0 ? doc.type.allowsMarkType(type) : false
    doc.nodesBetween($from.pos, $to.pos, node => {
      if (can) return false
      can = node.inlineContent && node.type.allowsMarkType(type)
    })
    if (can) return true
  }
  return false
}

function colorAround(state, pos) {
  const $pos = state.doc.resolve(pos);

  const { parent, parentOffset } = $pos;
  const start = parent.childAfter(parentOffset);
  if (!start.node) return null;

  const link = start.node.marks.find((mark) => mark.type === state.schema.marks.color);
  if (!link) return null;

  let startIndex = $pos.index();
  let startPos = $pos.start() + start.offset;
  let endIndex = startIndex + 1;
  let endPos = startPos + start.node.nodeSize;
  while (startIndex > 0 && link.isInSet(parent.child(startIndex - 1).marks)) {
    startIndex -= 1;
    startPos -= parent.child(startIndex).nodeSize;
  }
  while (endIndex < parent.childCount && link.isInSet(parent.child(endIndex).marks)) {
    endPos += parent.child(endIndex).nodeSize;
    endIndex += 1;
  }
  const mark = state.doc.nodeAt(startPos).marks.find(mark => mark.type === state.schema.marks.color)
  return { from: startPos, to: endPos, mark };
}

export function switchMark(markType, attrs) {
  return function(state, dispatch) {
    let {empty, $cursor, ranges} = state.selection
    if ((empty && !$cursor) || !markApplies(state.doc, ranges, markType)) return false
    if (dispatch) {
      if ($cursor) {
        if (markType.isInSet(state.storedMarks || $cursor.marks()))
          dispatch(state.tr.removeStoredMark(markType))
        else
          dispatch(state.tr.addStoredMark(markType.create(attrs)))
      } else {
        let has = false, tr = state.tr
        for (let i = 0; !has && i < ranges.length; i++) {
          let {$from, $to} = ranges[i]
          has = state.doc.rangeHasMark($from.pos, $to.pos, markType)
        }
        for (let i = 0; i < ranges.length; i++) {
          let {$from, $to} = ranges[i]
          if (has) {
            tr.removeMark($from.pos, $to.pos, markType)
            let from = $from.pos, to = $to.pos, start = $from.nodeAfter, end = $to.nodeBefore
            let spaceStart = start && start.isText ? /^\s*/.exec(start.text)[0].length : 0
            let spaceEnd = end && end.isText ? /\s*$/.exec(end.text)[0].length : 0
            if (from + spaceStart < to) { from += spaceStart; to -= spaceEnd }
            const activeMark = colorAround(state, $from.pos)
            const isEqual = activeMark && activeMark.from === $from.pos && activeMark.to === $to.pos && activeMark.mark.attrs.bg === attrs.bg
            if (!isEqual) {
              tr.addMark(from, to, markType.create(attrs))
            }
          } else {
            let from = $from.pos, to = $to.pos, start = $from.nodeAfter, end = $to.nodeBefore
            let spaceStart = start && start.isText ? /^\s*/.exec(start.text)[0].length : 0
            let spaceEnd = end && end.isText ? /\s*$/.exec(end.text)[0].length : 0
            if (from + spaceStart < to) { from += spaceStart; to -= spaceEnd }
            tr.addMark(from, to, markType.create(attrs))
          }
        }
        dispatch(tr.scrollIntoView())
      }
    }
    return true
  }
}


export default class Colorify extends Mark {
  get name() {
    return "color";
  }

  get schema() {
    return {
      attrs: {
        bg: {
          default: ''
        }
      },
      inline: true,
      content: "inline+",
      marks: "",
      group: "inline",
      selectable: true,
      parseDOM: [
        {
          tag: "span.colorify",
        },
      ],
      toDOM: node => {
        return [
          "span",
          {
            class: `colorify ${node.attrs.bg}`,
          },
          0
        ];
      },
    };
  }

  toMarkdown(state, node) {
    state.write(`{${node.attrs.bg}}(`);
    state.renderContent(node);
    state.write(`)`)
  }

  commands({ type }) {
    return attrs => (state: EditorState, dispatch) => {
      return switchMark(type, attrs)(state, dispatch)
    };
  }

  parseMarkdown() {
    return {
      mark: "color",
      getAttrs: tok => {
        const bg = tok.attrs[0][1].split(" ")[1]
        return {
          bg: bg.split("--")[1]
        }
      },
    };
  }
}
