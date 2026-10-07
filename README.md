# Markdown Table Filter

An Obsidian plugin that enables filtering rows in Markdown tables while keeping the tables fully editable.

This plugin adds cosmetic filters to rendered Markdown tables without changing the underlying note.

## Features

- **Filter table rows** using a search field or value selection.
- **Keep tables editable**: filtered tables remain editable in Live Preview.
- **Case-insensitive search** by default.
- Works with standard Markdown tables in Reading View and Live Preview.

## Installation

### From Obsidian Community Plugins (recommended, once published)

1. Open Obsidian → Settings → Community plugins.
2. Click “Browse” and search for “Markdown Table Filter”.
3. Click “Install”, then “Enable”.

### Manual installation

1. Download `main.js`, `manifest.json` and `styles.css`.
2. Put them in `<your-vault>/.obsidian/plugins/markdown-table-filter/`.
3. In Obsidian: **Settings → Community plugins**, reload, and enable **Markdown Table Filter**.

## Usage

1. Open a note containing a Markdown table.
2. Click the filter icon in a table header.
3. Search or select values, then click **Apply filter**. Rows that do not match are hidden visually.
4. Edit the table as usual;



To clear a column filter, open its menu and click **Clear filter**. Clicking outside the menu closes it without applying pending selections.

## Credits

This plugin is heavily inspired by and built on top of:

- [Advanced Tables for Obsidian](https://github.com/tgrosinger/advanced-tables-obsidian) by [tgrosinger](https://github.com/tgrosinger).

Thanks to the original author for the excellent foundation.

## Notes 

This plugin has not been extensively tested and may contain bugs or stability issues that could lead to data loss. Please make sure to back up your data before using it.