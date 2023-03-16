import type { Transaction, TransactionSpec } from '@codemirror/state';
import { EditorSelection, EditorState } from '@codemirror/state';

export function singleLineExt() {
  return EditorState.transactionFilter.of(
    (tr: Transaction): TransactionSpec | TransactionSpec[] => {
      if (!tr.isUserEvent('input')) return tr;

      const trs: TransactionSpec[] = [];
      tr.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
        let insert = '';
        let newlinesRemoved = 0;
        for (const line of inserted) {
          const newLine = line.replace('\n', '');
          newlinesRemoved += line.length - newLine.length;
          insert += newLine;
        }

        // Update cursor position based on how many newlines were removed
        const cursor = EditorSelection.cursor(toB - newlinesRemoved);
        const selection = EditorSelection.create([cursor], 0);

        const changes = [{ from: fromB, to: toA, insert }];
        trs.push({ ...tr, selection, changes });
      });
      return trs;
    },
  );
}