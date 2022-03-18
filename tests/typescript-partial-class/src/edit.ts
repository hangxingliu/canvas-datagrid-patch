import type { MainClass } from "./main";

export function editCell(this: MainClass, value: string) {
  const cells = this.getCells();
  cells.push(value);
}
