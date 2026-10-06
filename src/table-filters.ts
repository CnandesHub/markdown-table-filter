import { setIcon } from 'obsidian';

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

const filterStateStores = new Map<string, Map<number, FilterState>>();
const tableRefreshes = new WeakMap<HTMLTableElement, () => void>();
const openTableMenus = new WeakMap<HTMLTableElement, () => void>();
const storeInstances = new Map<string, Set<HTMLTableElement>>();
const menuDocuments = new WeakSet<Document>();
let tableEditing = false;

const notifyStore = (key: string, except?: HTMLTableElement): void => {
  const set = storeInstances.get(key);
  if (!set) return;
  set.forEach((t) => {
    if (!t.isConnected) {
      set.delete(t);
      return;
    }
    if (t !== except) tableRefreshes.get(t)?.();
  });
};

export const setTableEditing = (editing: boolean): void => {
  tableEditing = editing;
};

const isDecorated = (table: HTMLTableElement): boolean => {
  const cells = table.tHead?.rows[0]?.cells;
  if (!cells || cells.length === 0) return false;
  return Array.from(cells).every((c) =>
    c.querySelector('.markdown-table-filter-container'),
  );
};

const teardownTable = (table: HTMLTableElement): void => {
  menuOwners.forEach((owner, menu) => {
    if (owner === table) {
      menu.remove();
      menuOwners.delete(menu);
    }
  });
  table
    .querySelectorAll('.markdown-table-filter-container')
    .forEach((el) => el.remove());
  tableRefreshes.delete(table);
};

/**
 * Adds cosmetic, rendered-view filters to tables that have a header row.
 * Changes are limited to the rendered table DOM and never update Markdown.
 */
const menuOwners = new Map<HTMLDivElement, HTMLTableElement>();

const registerOutsideMenuHandler = (doc: Document): void => {
  if (menuDocuments.has(doc)) {
    return;
  }
  menuDocuments.add(doc);
  doc.addEventListener(
    'pointerdown',
    (event) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      menuOwners.forEach((owner, menu) => {
        if (
          !menu.hidden &&
          !owner.contains(target) &&
          !menu.contains(target)
        ) {
          openTableMenus.get(owner)?.();
        }
      });
    },
    true,
  );
};

export const addTableFilters = (
  container: HTMLElement,
  scope: string,
): void => {
  registerOutsideMenuHandler(container.ownerDocument);
  // menuOwners.forEach((owner, menu) => {
  //   if (!owner.isConnected) {
  //     menu.remove();
  //     menuOwners.delete(menu);
  //   }
  // });
  Array.from(container.querySelectorAll('table')).forEach((table) => {
    const headerKey = getTableHeadersKey(table);
    const exactKey = `${scope}::${headerKey}`;
    let tableKey = exactKey;
    let tableStates = filterStateStores.get(exactKey);

    if (!tableStates) {
      const compatibleKeys = Array.from(filterStateStores.keys()).filter((key) =>
        key.endsWith(`::${headerKey}`),
      );
      if (compatibleKeys.length === 1) {
        tableKey = compatibleKeys[0];
        tableStates = filterStateStores.get(tableKey);
      }
    }

    if (!tableStates) {
      tableStates = new Map();
      filterStateStores.set(tableKey, tableStates);
    }
    if (tableRefreshes.has(table)) {
      if (isDecorated(table)) {
        tableRefreshes.get(table)?.();
        return;
      }
      teardownTable(table); // header re-renderizado: recria os botões
    }
    addFiltersToTable(table, tableStates, tableKey);
  });
};

export const refreshTableFilters = (container: HTMLElement): void => {
  container.querySelectorAll('table').forEach((table) => {
    tableRefreshes.get(table)?.();
  });
};

export const clearTableFilterVisuals = (container: HTMLElement): void => {
  container
    .querySelectorAll('table tbody tr')
    .forEach((row) => {
      if (!(row instanceof HTMLTableRowElement)) {
        return;
      }
      row.removeAttribute('data-markdown-table-filter-hidden');
      row.removeAttribute('aria-hidden');
      row.removeAttribute('hidden');
      row.classList.remove('markdown-table-filtered-row');
      row.style.display = '';
    });
};

const getTableHeadersKey = (table: HTMLTableElement): string =>
  Array.from(table.tHead?.rows[0]?.cells ?? [])
    .map((cell) => getCellText(cell))
    .join('|');

const addFiltersToTable = (
  table: HTMLTableElement,
  states: Map<number, FilterState>,   // agora é O estado compartilhado
  tableKey: string,
): void => {
  const headerRow = table.tHead?.rows[0];
  const body = table.tBodies[0];

  if (!headerRow || !body || headerRow.cells.length === 0) {
    return;
  }

  const controls = new Map<number, FilterControl>();
  const getBody = (): HTMLTableSectionElement | undefined => table.tBodies[0];
  const getRows = (): HTMLTableRowElement[] =>
    Array.from(getBody()?.rows ?? []);
  
  const runFilters = (b: HTMLTableSectionElement): void =>
    applyFilters(b, states);

  Array.from(headerRow.cells).forEach((header, columnIndex) => {
    if (header.querySelector('.markdown-table-filter-container')) {
      return;
    }

    const doc = table.ownerDocument;
    const headerName = getCellText(header) || `column ${columnIndex + 1}`;
    const existing = states.get(columnIndex);
    const state: FilterState = existing ?? { selectedValues: null, search: '' };
    if (!existing) states.set(columnIndex, state);
    let pendingValues = new Set<string>();

    const filterContainer = doc.createElement('span');
    filterContainer.className = 'markdown-table-filter-container';
    filterContainer.contentEditable = 'false';
    filterContainer.setAttribute('data-cm-ignore', 'true'); // inofensivo se não usado
    
    const filterButton = doc.createElement('button');
    filterButton.type = 'button';
    filterButton.className =
      'markdown-table-filter-button clickable-icon';
    filterButton.setAttribute('aria-label', `Filter ${headerName}`);
    filterButton.setAttribute('aria-expanded', 'false');
    setIcon(filterButton, 'filter');

    const menu = doc.createElement('div');
    menu.className = 'markdown-table-filter-menu menu';
    menu.hidden = true;
    // doc.body.appendChild(menu);
    // menuOwners.set(menu, table);
    menu.addEventListener('click', (event) => event.stopPropagation());

    const search = doc.createElement('input');
    search.type = 'search';
    search.className = 'markdown-table-filter-search search-input';
    search.placeholder = 'Search values';
    search.setAttribute('aria-label', `Search ${headerName} values`);
    search.value = state.search;

    const selectionActions = doc.createElement('div');
    selectionActions.className = 'markdown-table-filter-selection-actions';
    const selectAll = doc.createElement('button');
    selectAll.type = 'button';
    selectAll.className = 'markdown-table-filter-action';
    selectAll.textContent = 'Select all';
    const unselectAll = doc.createElement('button');
    unselectAll.type = 'button';
    unselectAll.className = 'markdown-table-filter-action';
    unselectAll.textContent = 'Unselect all';
    selectionActions.append(selectAll, unselectAll);

    const valuesList = doc.createElement('div');
    valuesList.className = 'markdown-table-filter-values';

    const updateActiveState = (): void => {
      const active =
        state.search.length > 0 ||
        state.selectedValues !== null;
      filterContainer.classList.toggle('markdown-table-filter-active', active);
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
          label.className = 'markdown-table-filter-value';
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
    apply.className = 'markdown-table-filter-apply mod-cta';
    apply.textContent = 'Apply filter';
    apply.addEventListener('click', () => {
      setTableEditing(false);
      state.selectedValues =
        pendingValues.size === 0 ? null : new Set(pendingValues);
      notifyStore(tableKey, table);
      const currentBody = getBody();
      if (currentBody) {
        runFilters(currentBody);
      }
      window.setTimeout(() => {
        const delayedBody = getBody();
        if (delayedBody) {
          runFilters(delayedBody);
        }
      }, 0);
      window.setTimeout(() => {
        const delayedBody = getBody();
        if (delayedBody) {
          runFilters(delayedBody);
        }
      }, 100);
      refreshControls(controls);
      controls.get(columnIndex)?.close();
    });

    const clear = doc.createElement('button');
    clear.type = 'button';
    clear.className = 'markdown-table-filter-clear';
    clear.textContent = 'Clear filter';
    clear.addEventListener('click', () => {
    setTableEditing(false);
    state.selectedValues = null;
    pendingValues.clear();
    state.search = '';
    search.value = '';
    notifyStore(tableKey, table);   // <-- moved after the resets
    const currentBody = getBody();
    if (currentBody) {
      runFilters(currentBody);
    }
    refreshControls(controls);
  });


  search.addEventListener('input', () => {
    setTableEditing(false);
    state.search = search.value;
    notifyStore(tableKey, table);   // <-- NEW
    const currentBody = getBody();
    if (currentBody) {
      runFilters(currentBody);
    }
    updateValues();
    updateActiveState();
  });

    menu.append(search, selectionActions, valuesList, apply, clear);
    filterContainer.appendChild(filterButton);
    header.appendChild(filterContainer);

const toggleMenu = (): void => {
  const isOpen = !menu.hidden;
  if (isOpen) {
    controls.get(columnIndex)?.close();
    return;
  }
  setTableEditing(false);
  openTableMenus.get(table)?.();
  controls.forEach((control, controlColumnIndex) => {
    if (controlColumnIndex !== columnIndex) {
      control.close();
    }
  });
  openTableMenus.set(table, () => {
    controls.get(columnIndex)?.close();
  });
    if (!menu.isConnected) {
    doc.body.appendChild(menu);        // NOVO
  }
  menuOwners.set(menu, table); 
  const buttonRect = filterButton.getBoundingClientRect();
  menu.style.top = `${buttonRect.bottom + 4}px`;
  menu.style.left = `${Math.max(8, buttonRect.right - 224)}px`;
  menu.hidden = false;
  filterButton.setAttribute('aria-expanded', 'true');
};

// Impede que o editor trate eventos do botão (foco, seleção, re-render)
['pointerdown', 'mouseup', 'dblclick', 'touchstart'].forEach((type) =>
  filterContainer.addEventListener(type, (e) => e.stopPropagation()),
);

// Abre no mousedown: não depende do click chegar ao mesmo elemento
filterButton.addEventListener('mousedown', (event) => {
  event.preventDefault();    // não tira o foco da célula
  event.stopPropagation();   // CodeMirror/Obsidian não veem o clique
  toggleMenu();
});

// click só para ativação por teclado (Enter/Espaço têm detail === 0)
filterButton.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  if (event.detail === 0) {
    toggleMenu();
  }
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
        menu.remove();                       // NOVO
        menuOwners.delete(menu);
        filterButton.setAttribute('aria-expanded', 'false');
      },
      update: () => {
        pendingValues =
          state.selectedValues === null
            ? new Set<string>()
            : new Set(state.selectedValues);
        search.value = state.search;
        updateValues();
        updateActiveState();
      },
    });
  });

  runFilters(body);
  tableRefreshes.set(table, () => {
    const currentBody = table.tBodies[0];
    if (currentBody) {
      runFilters(currentBody);
    }
    refreshControls(controls);
  });
  let set = storeInstances.get(tableKey);
  if (!set) {
    set = new Set();
    storeInstances.set(tableKey, set);
  }
  set.add(table);
  refreshControls(controls);
};

const saveFilterState = (
  savedStates: Map<number, FilterState>,
  columnIndex: number,
  state: FilterState,
): void => {
  savedStates.set(columnIndex, {
    selectedValues: state.selectedValues
      ? new Set(state.selectedValues)
      : null,
    search: state.search,
  });
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

const getCellText = (cell: HTMLTableCellElement | undefined): string => {
  if (!cell) {
    return '';
  }
  const clone = cell.cloneNode(true);
  if (!(clone instanceof HTMLTableCellElement)) {
    return '';
  }
  clone
    .querySelectorAll(
      '.markdown-table-filter-container, .markdown-table-filter-menu',
    )
    .forEach((element) => element.remove());
  const value = (clone.innerText || clone.textContent || '').trim();
  if (value.length % 2 === 0) {
    const half = value.length / 2;
    if (value.slice(0, half) === value.slice(half)) {
      return value.slice(0, half);
    }
  }
  return value;
};

const applyFilters = (
  body: HTMLTableSectionElement,
  states: Map<number, FilterState>,
): void => {
  if (tableEditing) {
    return;
  }
  Array.from(body.rows).forEach((row) => {
    const visible = Array.from(states.entries()).every(
      ([columnIndex, state]) =>
        matchesState(state, getCellText(row.cells[columnIndex])),
    );
    row.style.display = visible ? '' : 'none';
    row.hidden = !visible;
    row.classList.toggle('markdown-table-filtered-row', !visible);
    row.setAttribute('aria-hidden', String(!visible));
    if (visible) {
      row.removeAttribute('data-markdown-table-filter-hidden');
    } else {
      row.setAttribute('data-markdown-table-filter-hidden', 'true');
    }
  });
};

const matchesState = (state: FilterState, value: string): boolean =>
  (state.selectedValues === null || state.selectedValues.has(value)) &&
  (state.search.length === 0 ||
    value.toLocaleLowerCase().includes(state.search.toLocaleLowerCase()));
