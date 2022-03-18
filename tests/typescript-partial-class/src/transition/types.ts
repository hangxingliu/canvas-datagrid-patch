export type InternalCell = {
  col: number;
  row: number;
  // noop
};

export interface GridClassInterface {
  new(): GridInterface;
}
export interface GridInterface {
  cells: InternalCell[];
  getCells: () => InternalCell[];
  undo: () => boolean;
}
