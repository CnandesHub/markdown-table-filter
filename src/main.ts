import {
  addTableFilters,
  refreshTableFilters,
  setTableEditing,
} from './table-filters';
import { ViewPlugin } from '@codemirror/view';
import { editorInfoField, Plugin } from 'obsidian';

const FILTER_UI =
  '.markdown-table-filter-button, .markdown-table-filter-menu';

export default class MarkdownTableFilterPlugin extends Plugin {
  public onload(): void {
    this.registerMarkdownPostProcessor((element, context) => {
      addTableFilters(element, context.sourcePath);
    });

    this.registerEditorExtension(
      ViewPlugin.define((view) => {
        let refreshTimer: number | null = null;
        let leaveEditingTimer: number | null = null;

        const getScope = (): string =>
          view.state.field(editorInfoField, false)?.file?.path ?? '';

        const refresh = (): void => {
          if (refreshTimer !== null) {
            window.clearTimeout(refreshTimer);
          }
          refreshTimer = window.setTimeout(() => {
            refreshTimer = null;
            addTableFilters(view.dom, getScope());
            refreshTableFilters(view.dom);
          }, 0);
        };

        const onMouseDown = (event: MouseEvent): void => {
          if (leaveEditingTimer !== null) {
            window.clearTimeout(leaveEditingTimer);
            leaveEditingTimer = null;
          }
          const target = event.target;
          if (
            !(target instanceof HTMLElement) ||
            target.closest(FILTER_UI) ||
            !target.closest('td')
          ) {
            return;
          }
          setTableEditing(true);
        };

        const onFocusIn = (): void => {
          if (leaveEditingTimer !== null) {
            window.clearTimeout(leaveEditingTimer);
            leaveEditingTimer = null;
          }
          setTableEditing(true);
        };

        const onFocusOut = (): void => {
          if (leaveEditingTimer !== null) {
            window.clearTimeout(leaveEditingTimer);
          }
          leaveEditingTimer = window.setTimeout(() => {
            leaveEditingTimer = null;
            const active = document.activeElement;
            if (
              active instanceof HTMLElement &&
              view.dom.contains(active) &&
              active.closest('td')
            ) {
              return;
            }
            setTableEditing(false);
            refresh();
          }, 0);
        };

        view.dom.addEventListener('mousedown', onMouseDown, true);
        view.dom.addEventListener('focusin', onFocusIn, true);
        view.dom.addEventListener('focusout', onFocusOut, true);
        refresh();

        const observer = new MutationObserver(refresh);
        observer.observe(view.dom, { childList: true, subtree: true });

        return {
          destroy: () => {
            observer.disconnect();
            if (refreshTimer !== null) {
              window.clearTimeout(refreshTimer);
            }
            if (leaveEditingTimer !== null) {
              window.clearTimeout(leaveEditingTimer);
            }
            view.dom.removeEventListener('mousedown', onMouseDown, true);
            view.dom.removeEventListener('focusin', onFocusIn, true);
            view.dom.removeEventListener('focusout', onFocusOut, true);
            setTableEditing(false);
          },
        };
      }),
    );

    let previewObserverTimer: number | null = null;
    const previewObserver = new MutationObserver(() => {
      if (previewObserverTimer !== null) {
        window.clearTimeout(previewObserverTimer);
      }
      previewObserverTimer = window.setTimeout(() => {
        previewObserverTimer = null;
        document
          .querySelectorAll<HTMLElement>('.markdown-preview-view')
          .forEach((view) => {
            const needsFilters = Array.from(view.querySelectorAll('table')).some(
              (table) =>
                Array.from(table.tHead?.rows[0]?.cells ?? []).some(
                  (cell) =>
                    !cell.querySelector('.markdown-table-filter-container'),
                ),
            );
            if (needsFilters) {
              addTableFilters(view, '');
            }
          });
      }, 0);
    });
    previewObserver.observe(document.body, { childList: true, subtree: true });
    this.register(() => {
      previewObserver.disconnect();
      if (previewObserverTimer !== null) {
        window.clearTimeout(previewObserverTimer);
      }
      setTableEditing(false);
    });
  }
}
