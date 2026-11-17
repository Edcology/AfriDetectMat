export type ActionState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; message: string };

export const idleState: ActionState = { status: "idle" };
