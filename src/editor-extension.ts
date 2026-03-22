import { RangeSetBuilder, type Extension } from '@codemirror/state';
import {
  Decoration,
  type DecorationSet,
  EditorView,
  ViewPlugin,
  type ViewUpdate,
} from '@codemirror/view';

import { forEachCapitalizedWordRange } from './matcher';

interface TextRange {
  from: number;
  to: number;
}

const IGNORE_SPELLCHECK_MARK = Decoration.mark({
  tagName: 'span',
  attributes: {
    spellcheck: 'false',
  },
});

function getExpandedVisibleRanges(view: EditorView): TextRange[] {
  const doc = view.state.doc;
  const ranges: TextRange[] = [];

  for (const visible of view.visibleRanges) {
    const boundedFrom = Math.min(Math.max(visible.from, 0), doc.length);
    const boundedTo = Math.min(Math.max(visible.to, boundedFrom), doc.length);

    const from = doc.lineAt(boundedFrom).from;
    const to = doc.lineAt(boundedTo).to;

    const previous = ranges.length > 0 ? ranges[ranges.length - 1] : undefined;

    if (previous && from <= previous.to + 1) {
      previous.to = Math.max(previous.to, to);
      continue;
    }

    ranges.push({ from, to });
  }

  return ranges;
}

function buildDecorations(
  view: EditorView,
): DecorationSet {
  const doc = view.state.doc;

  if (doc.length === 0) {
    return Decoration.none;
  }

  const builder = new RangeSetBuilder<Decoration>();
  const scanRanges = getExpandedVisibleRanges(view);

  for (const range of scanRanges) {
    const text = doc.sliceString(range.from, range.to);

    forEachCapitalizedWordRange(text, (from, to) => {
      builder.add(range.from + from, range.from + to, IGNORE_SPELLCHECK_MARK);
    });
  }

  return builder.finish();
}

class CapitalizedWordSpellcheckViewPlugin {
  public decorations: DecorationSet;

  public constructor(view: EditorView) {
    this.decorations = buildDecorations(view);
  }

  public update(update: ViewUpdate): void {
    if (update.docChanged || update.viewportChanged) {
      this.decorations = buildDecorations(update.view);
    }
  }
}

export function createCapitalizedWordSpellcheckExtension(): Extension {
  return ViewPlugin.fromClass(
    CapitalizedWordSpellcheckViewPlugin,
    {
      decorations: (plugin) => plugin.decorations,
    },
  );
}
