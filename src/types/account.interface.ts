// Entidad interna (fila tal cual en DB)
export interface IAccountRow {
  id: string;
  name: string;
  initial_balance: number;
  bg_color: string;
  created_at: string;
  updated_at: string;
}

// Payload de creación
export interface ICreateAccount {
  name: string;
  initial_balance: number;
  bg_color: string;
}
// Payload de actualización
export interface IUpdateAccount {
  name?: string;
  bg_color?: string;
}

// Respuestas publicas
export interface IAccountResponse {
  id: string;
  name: string;
  initial_balance: number;
  current_balance: number; // calculado
  bg_color: string;
  created_at: string;
  updated_at: string;
}
