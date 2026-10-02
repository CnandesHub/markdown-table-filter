# Advanced Tables Help

The Advanced Tables plugin for Obsidian adds a lot of new features to editing
Markdown tables within Obsidian, while maintaining full compatibility
with Markdown.

As commonly ask questions arise they will be added below:

## Using Formulas in Markdown Tables

Formulas are written on the line immediately following the table. For more
information on the formula syntax please take a look at [this
document](https://github.com/tgrosinger/md-advanced-tables/blob/main/docs/formulas.md)
which contains detailed explanation and helpful examples.

<https://github.com/tgrosinger/md-advanced-tables/blob/main/docs/formulas.md>

Evaluating formulas is done using the formulas button in the toolbar.

![evaluate formulas button](https://raw.githubusercontent.com/tgrosinger/advanced-tables-obsidian/main/resources/screenshots/evaluate-formulas-button.png)

## Sorting Rows

When using the sort option in the toolbar, the sort will be performed based
on the column the cursor is currently in.

## Filtering rendered tables

Tables with headers have a filter dropdown in each header when viewed in
Reading view. Selecting a value hides rows that do not match the selected
value. Filters can be combined across columns; the available values in each
other filter update to match the remaining visible rows. The filter menu
includes a partial-match search, value checkboxes, and a `Clear filter` button.
For example, a search for `available` matches both `available` and
`not available`. When a column has no active filter, its values start
unchecked; select the values to keep, or use `Select all` / `Unselect all`,
and choose `Apply filter`.

Filtering is cosmetic: it only changes the rendered view and never changes the
Markdown table.

Filters are also available in Live Preview. After editing cells or adding,
removing, or changing rows and columns, the visible rows and filter options are
updated automatically. Filtered rows remain part of the Markdown table.

## Additional Questions

If you have additional questions which are not covered here, please [create
an issue](https://github.com/tgrosinger/advanced-tables-obsidian/issues/new/choose),
or reach out to me directly on the Obsidian discord. My username is
tgrosinger.
