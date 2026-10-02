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

  headers.forEach((header, columnIndex) => {
    if (header.querySelector('.advanced-tables-filter')) {
      return;
    }

    const values = getColumnValues(body, columnIndex);

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

    const allOption = doc.createElement('option');
    allOption.value = ALL_VALUE;
    allOption.textContent = 'All';
    filter.appendChild(allOption);

    values.forEach((value, valueIndex) => {
      const option = doc.createElement('option');
      option.value = String(valueIndex);
      option.textContent = value || '(Blanks)';
      filter.appendChild(option);
    });

    filter.addEventListener('change', () => {
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
    });

    filterContainer.append(filterIcon, filter);
    header.appendChild(filterContainer);
  });
};

const getColumnValues = (
  body: HTMLTableSectionElement,
  columnIndex: number,
): string[] => {
  const values = new Set<string>();

  Array.from(body.rows).forEach((row) => {
    const cell = row.cells[columnIndex];
    if (cell) {
      values.add(getCellText(cell));
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
