import { AppMode } from "../globals";

export interface AppState {
  readonly selectedPads: number[];
  readonly shift: boolean;
  readonly alt: boolean;
  readonly mode: AppMode;

}