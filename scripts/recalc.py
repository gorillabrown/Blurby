#!/usr/bin/env python3
"""Force-recalculate all formula cells in an Excel workbook."""
import argparse
import openpyxl


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("path", help="Path to .xlsx file")
    parser.add_argument("--dry-run", action="store_true",
                        help="Report formula cells without saving")
    args = parser.parse_args()

    wb = openpyxl.load_workbook(args.path)
    if wb.calculation is not None:
        wb.calculation.calcMode = "auto"

    total = 0
    for ws in wb.worksheets:
        for row in ws.iter_rows():
            for cell in row:
                if isinstance(cell.value, str) and cell.value.startswith("="):
                    total += 1
                    if args.dry_run:
                        print(f"  {ws.title}!{cell.coordinate}: {cell.value}")

    print(f"Found {total} formula cell(s) across {len(wb.worksheets)} sheet(s).")

    if not args.dry_run:
        wb.save(args.path)
        print(f"Saved: {args.path}")
    else:
        print("Dry run — no changes written.")


if __name__ == "__main__":
    main()
