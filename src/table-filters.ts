interface FilterState {
  selectedValues: Set<string> | null;
  search: string;
}

interface FilterControl {
  container: HTMLSpanElement;
  menu: HTMLDivElement;
  close: () => void;
  update: () => void;
}

const tableRefreshes = new WeakMap<HTMLTableElement, () => void>();

/**
 * Adds cosmetic, rendered-view filters to tables that have a header row.
 * Changes are limited to the rendered table DOM and never update Markdown.
 */
export const addTableFilters = (container: HTMLElement): void => {
  container.querySelectorAll('table').forEach((table) => {
    addFiltersToTable(table);
  });
};

export const refreshTableFilters = (container: HTMLElement): void => {
  container.querySelectorAll('table').forEach((table) => {
    tableRefreshes.get(table)?.();
  });
};

const addFiltersToTable = (table: HTMLTableElement): void => {
  const headerRow = table.tHead?.rows[0];
  const body = table.tBodies[0];

  if (!headerRow || !body || headerRow.cells.length === 0) {
    return;
  }

  const states = new Map<number, FilterState>();
  const controls = new Map<number, FilterControl>();
  const getRows = (): HTMLTableRowElement[] => Array.from(body.rows);

  Array.from(headerRow.cells).forEach((header, columnIndex) => {
    if (header.querySelector('.advanced-tables-filter-container')) {
      return;
    }

    const doc = table.ownerDocument;
    const headerName = getCellText(header) || `column ${columnIndex + 1}`;
    const state: FilterState = { selectedValues: null, search: '' };
    states.set(columnIndex, state);
    let pendingValues = new Set<string>();

    const filterContainer = doc.createElement('span');
    filterContainer.className = 'advanced-tables-filter-container';

    const filterButton = doc.createElement('button');
    filterButton.type = 'button';
    filterButton.className = 'advanced-tables-filter-button';
    filterButton.setAttribute('aria-label', `Filter ${headerName}`);
    filterButton.setAttribute('aria-expanded', 'false');
    filterButton.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M3 5h18l-7 8v5l-4 2v-7L3 5z"></path>' +
      '</svg>';

    const menu = doc.createElement('div');
    menu.className = 'advanced-tables-filter-menu';
    menu.hidden = true;
    doc.body.appendChild(menu);
    menu.addEventListener('click', (event) => event.stopPropagation());

    const search = doc.createElement('input');
    search.type = 'search';
    search.className = 'advanced-tables-filter-search';
    search.placeholder = 'Search values';
    search.setAttribute('aria-label', `Search ${headerName} values`);

    const selectionActions = doc.createElement('div');
    selectionActions.className = 'advanced-tables-filter-selection-actions';
    const selectAll = doc.createElement('button');
    selectAll.type = 'button';
    selectAll.className = 'advanced-tables-filter-action';
    selectAll.textContent = 'Select all';
    const unselectAll = doc.createElement('button');
    unselectAll.type = 'button';
    unselectAll.className = 'advanced-tables-filter-action';
    unselectAll.textContent = 'Unselect all';
    selectionActions.append(selectAll, unselectAll);

    const valuesList = doc.createElement('div');
    valuesList.className = 'advanced-tables-filter-values';

    const updateActiveState = (): void => {
      const active =
        state.search.length > 0 ||
        (state.selectedValues !== null &&
          state.selectedValues.size !== getAvailableValues(
          getRows(),
            states,
            columnIndex,
          ).length);
      filterContainer.classList.toggle('advanced-tables-filter-active', active);
    };

    const updateValues = (): void => {
      valuesList.replaceChildren();
      const values = getAvailableValues(getRows(), states, columnIndex);
      const query = state.search.toLocaleLowerCase();
      const visibleValues = values.filter((value) =>
        value.toLocaleLowerCase().includes(query),
      );

      visibleValues.forEach((value) => {
          const label = doc.createElement('label');
          label.className = 'advanced-tables-filter-value';
          const checkbox = doc.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.checked = pendingValues.has(value);
          checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
              pendingValues.add(value);
            } else {
              pendingValues.delete(value);
            }
          });
          label.append(checkbox, doc.createTextNode(value || '(Blanks)'));
          valuesList.appendChild(label);
      });
    };

    selectAll.addEventListener('click', () => {
      const values = getAvailableValues(getRows(), states, columnIndex);
      const query = state.search.toLocaleLowerCase();
      values
        .filter((value) => value.toLocaleLowerCase().includes(query))
        .forEach((value) => pendingValues.add(value));
      updateValues();
    });

    unselectAll.addEventListener('click', () => {
      const values = getAvailableValues(getRows(), states, columnIndex);
      const query = state.search.toLocaleLowerCase();
      values
        .filter((value) => value.toLocaleLowerCase().includes(query))
        .forEach((value) => pendingValues.delete(value));
      updateValues();
    });

    const apply = doc.createElement('button');
    apply.type = 'button';
    apply.className = 'advanced-tables-filter-apply';
    apply.textContent = 'Apply filter';
    apply.addEventListener('click', () => {
      state.selectedValues =
        pendingValues.size === 0 ? null : new Set(pendingValues);
      applyFilters(body, states);
      window.setTimeout(() => applyFilters(body, states), 0);
      window.setTimeout(() => applyFilters(body, states), 100);
      refreshControls(controls);
      menu.hidden = true;
      filterButton.setAttribute('aria-expanded', 'false');
    });

    const clear = doc.createElement('button');
    clear.type = 'button';
    clear.className = 'advanced-tables-filter-clear';
    clear.textContent = 'Clear filter';
    clear.addEventListener('click', () => {
      state.selectedValues = null;
      pendingValues.clear();
      state.search = '';
      search.value = '';
      applyFilters(body, states);
      refreshControls(controls);
    });

    search.addEventListener('input', () => {
      state.search = search.value;
      applyFilters(body, states);
      updateValues();
      updateActiveState();
    });

    menu.append(search, selectionActions, valuesList, apply, clear);
    filterContainer.appendChild(filterButton);
    header.appendChild(filterContainer);

    filterButton.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = !menu.hidden;
      if (isOpen) {
        controls.get(columnIndex)?.close();
        return;
      }
      if (!isOpen) {
        controls.forEach((control, controlColumnIndex) => {
          if (controlColumnIndex !== columnIndex) {
            control.close();
          }
        });
      }
      if (!isOpen) {
        const buttonRect = filterButton.getBoundingClientRect();
        menu.style.top = `${buttonRect.bottom + 4}px`;
        menu.style.left = `${Math.max(8, buttonRect.right - 224)}px`;
      }
      menu.hidden = isOpen;
      filterButton.setAttribute('aria-expanded', String(!isOpen));
    });

    controls.set(columnIndex, {
      container: filterContainer,
      menu,
      close: () => {
        pendingValues =
          state.selectedValues === null
            ? new Set<string>()
            : new Set(state.selectedValues);
        menu.hidden = true;
        filterButton.setAttribute('aria-expanded', 'false');
      },
      update: () => {
        pendingValues =
          state.selectedValues === null
            ? new Set<string>()
            : new Set(state.selectedValues);
        updateValues();
        updateActiveState();
      },
    });
  });

  tableRefreshes.set(table, () => {
    applyFilters(body, states);
    refreshControls(controls);
  });
  refreshControls(controls);
};

const refreshControls = (controls: Map<number, FilterControl>): void => {
  controls.forEach((control) => control.update());
};

const getAvailableValues = (
  rows: HTMLTableRowElement[],
  states: Map<number, FilterState>,
  columnIndex: number,
): string[] => {
  const values = new Set<string>();

  rows.forEach((row) => {
    const matchesOtherFilters = Array.from(states.entries()).every(
      ([filterColumnIndex, state]) =>
        filterColumnIndex === columnIndex ||
        matchesState(state, getCellText(row.cells[filterColumnIndex])),
    );
    if (matchesOtherFilters) {
      values.add(getCellText(row.cells[columnIndex]));
    }
  });

  return Array.from(values).sort((left, right) =>
    left.localeCompare(right, undefined, { numeric: true }),
  );
};

const getCellText = (cell: HTMLTableCellElement | undefined): string =>
  cell?.textContent?.trim() ?? '';

const applyFilters = (
  body: HTMLTableSectionElement,
  states: Map<number, FilterState>,
): void => {
  Array.from(body.rows).forEach((row) => {
    const visible = Array.from(states.entries()).every(
      ([columnIndex, state]) =>
        matchesState(state, getCellText(row.cells[columnIndex])),
    );
    row.style.display = visible ? '' : 'none';
    row.hidden = !visible;
    row.classList.toggle('advanced-tables-filtered-row', !visible);
    row.setAttribute('aria-hidden', String(!visible));
    if (visible) {
      row.removeAttribute('data-advanced-tables-hidden');
    } else {
      row.setAttribute('data-advanced-tables-hidden', 'true');
    }
  });
};

const matchesState = (state: FilterState, value: string): boolean =>
  (state.selectedValues === null || state.selectedValues.has(value)) &&
  (state.search.length === 0 ||
    value.toLocaleLowerCase().includes(state.search.toLocaleLowerCase()));
