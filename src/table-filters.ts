const ALL_VALUE = 'all';

type FilterValue = string | null;

/**
 * Adds cosmetic, rendered-view filters to tables that have a header row.
 *
 * The table DOM is owned by Obsidian's renderer, so changing row visibility
 * here does not change the Markdown document or the editor state.
 */
export const addTableFilters = (container: HTMLElement): void => {
  container.querySelectorAll('table').forEach((table) => {
    addFiltersToTable(table);
  });
};

const addFiltersToTable = (table: HTMLTableElement): void => {
  const headerRow = table.tHead?.rows[0];
  const body = table.tBodies[0];

  if (!headerRow || !body || headerRow.cells.length === 0) {
    return;
  }

  const filters = new Map<number, FilterValue>();
  const headers = Array.from(headerRow.cells);
  const filterControls = new Map<
    number,
    { filter: HTMLSelectElement; container: HTMLSpanElement }
  >();

  headers.forEach((header, columnIndex) => {
    if (header.querySelector('.advanced-tables-filter')) {
      return;
    }

    const doc = table.ownerDocument;
    const filterContainer = doc.createElement('span');
    filterContainer.className = 'advanced-tables-filter-container';

    const filterIcon = doc.createElement('span');
    filterIcon.className = 'advanced-tables-filter-icon';
    filterIcon.setAttribute('aria-hidden', 'true');
    filterIcon.innerHTML =
      '<svg viewBox="0 0 24 24">' +
      '<path d="M3 5h18l-7 8v5l-4 2v-7L3 5z"></path>' +
      '</svg>';

    const filter = doc.createElement('select');
    filter.className = 'advanced-tables-filter';
    filter.setAttribute(
      'aria-label',
      `Filter ${getCellText(header) || `column ${columnIndex + 1}`}`,
    );
    filter.title = 'Filter rows';

    filter.addEventListener('change', () => {
      const values = getAvailableColumnValues(
        body,
        filters,
        columnIndex,
      );
      const selectedIndex = Number.parseInt(filter.value, 10);
      filters.set(
        columnIndex,
        filter.value === ALL_VALUE ? null : values[selectedIndex],
      );
      filterContainer.classList.toggle(
        'advanced-tables-filter-active',
        filter.value !== ALL_VALUE,
      );
      applyFilters(body, filters);
      refreshFilterOptions(body, filters, filterControls);
    });

    filterContainer.append(filterIcon, filter);
    header.appendChild(filterContainer);
    filterControls.set(columnIndex, { filter, container: filterContainer });
  });

  refreshFilterOptions(body, filters, filterControls);
};

const getAvailableColumnValues = (
  body: HTMLTableSectionElement,
  filters: Map<number, FilterValue>,
  columnIndex: number,
): string[] => {
  const values = new Set<string>();

  Array.from(body.rows).forEach((row) => {
    const matchesOtherFilters = Array.from(filters.entries()).every(
      ([filterColumnIndex, value]) =>
        filterColumnIndex === columnIndex ||
        value === null ||
        getCellText(row.cells[filterColumnIndex]) === value,
    );
    const cell = row.cells[columnIndex];
    if (cell && matchesOtherFilters) {
      values.add(getCellText(cell));
    }
  });

  return Array.from(values).sort((left, right) =>
    left.localeCompare(right, undefined, { numeric: true }),
  );
};

const refreshFilterOptions = (
  body: HTMLTableSectionElement,
  filters: Map<number, FilterValue>,
  controls: Map<
    number,
    { filter: HTMLSelectElement; container: HTMLSpanElement }
  >,
): void => {
  controls.forEach(({ filter, container }, columnIndex) => {
    const selectedValue = filters.get(columnIndex);
    const values = getAvailableColumnValues(body, filters, columnIndex);
    filter.replaceChildren();

    const allOption = filter.ownerDocument.createElement('option');
    allOption.value = ALL_VALUE;
    allOption.textContent = 'All';
    filter.appendChild(allOption);

    values.forEach((value, valueIndex) => {
      const option = filter.ownerDocument.createElement('option');
      option.value = String(valueIndex);
      option.textContent = value || '(Blanks)';
      filter.appendChild(option);
    });

    if (selectedValue !== null && selectedValue !== undefined) {
      const selectedIndex = values.indexOf(selectedValue);
      if (selectedIndex >= 0) {
        filter.value = String(selectedIndex);
      }
    }

    container.classList.toggle(
      'advanced-tables-filter-active',
      selectedValue !== null && selectedValue !== undefined,
    );
  });
};

const getCellText = (cell: HTMLTableCellElement | undefined): string =>
  cell?.textContent?.trim() ?? '';

const applyFilters = (
  body: HTMLTableSectionElement,
  filters: Map<number, FilterValue>,
): void => {
  Array.from(body.rows).forEach((row) => {
    const visible = Array.from(filters.entries()).every(
      ([columnIndex, value]) =>
        value === null ||
        getCellText(row.cells[columnIndex]) === value,
    );
    row.style.display = visible ? '' : 'none';
  });
};
