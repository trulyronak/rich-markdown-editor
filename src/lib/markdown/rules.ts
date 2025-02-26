import markdownit from "markdown-it";
import markPlugin from "./mark";
import checkboxPlugin from "./checkboxes";
import embedsPlugin from "./embeds";
import breakPlugin from "./breaks";
import tablesPlugin from "./tables";
import noticesPlugin from "./notices";
import underlinesPlugin from "./underlines";
import multimdTablePlugin from "markdown-it-multimd-table";
import colorPlugin from 'markdown-it-color';

export default function rules({ embeds, rules = {} }) {
  return markdownit("default", {
    breaks: false,
    html: false,
    linkify: false,
    ...rules,
  })
    .use(embedsPlugin(embeds))
    .use(breakPlugin)
    .use(checkboxPlugin)
    .use(markPlugin({ delim: "==", mark: "highlight" }))
    .use(markPlugin({ delim: "!!", mark: "placeholder" }))
    .use(underlinesPlugin)
    .use(multimdTablePlugin, {
      rowspan: true
    })
    .use(tablesPlugin)
    .use(colorPlugin)
    .use(noticesPlugin);
}
