import { MenuMarkers } from '../models/MenuMarkers';

export type MenuType = {
  position: { top: number; left: number };
  branchTarget: MenuMarkers | null;
  branchItem: d3.Selection<HTMLSpanElement, unknown, null, undefined> | null;
};
