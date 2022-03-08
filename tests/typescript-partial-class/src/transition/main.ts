import { GridInterface } from "./types";

const modules = [
  function defaults(self: GridInterface) {
    self.cells = [];
  },
  function cells(self: GridInterface) {
    self.getCells = () => self.cells;
  },
  function editor(self: GridInterface) {
    self.undo = () => false;
  }
]

export const Grid = class Grid {
  constructor() {
    for (let i = 0; i < modules.length; i++)
      modules[i](this as any);
  }
} as any;
