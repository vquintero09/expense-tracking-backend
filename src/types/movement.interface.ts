export type MovementType = "income" | "expense";

// Entidades internas (filas tal cual en DB)
export interface IMovementRow {
  id: string;
  movement_type: MovementType;
  amount: number;
  category_id: string;
  account_id: string;
  date: string;
  description: string;
}

// Payloads de creación (lo que envía el frontend)
export interface ICreateMovement {
  movement_type: MovementType;
  amount: number;
  category_id: string;
  account_id: string;
  date: string;
  description: string;
}

// Respuestas publicas (lo que se devuelve al frontend)
export interface IMovementCategory {
  id: string;
  name: string;
}

export interface IMovementAccount {
  id: string;
  name: string;
}

export interface IMovementResponse {
  id: string;
  movement_type: MovementType;
  description: string;
  amount: number;
  date: string;
  category: IMovementCategory;
  account: IMovementAccount;
}
