import { getCells } from "./cells";
import { editCell } from "./edit";

const bindThis = <T extends (...args: unknown[]) => unknown>(thiz: unknown, func: T): T => func.bind(thiz);

export class MainClass {
  cells = [];

  // methods:
  getCells = bindThis(this, getCells);
  editCell = bindThis(this, editCell);
}
