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

//Params interface
export interface IAccountMovementsParams {
  id: string;
  page: number;
  limit: number;
  from?: string;
  to?: string;
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

export interface ITotalBalance {
  total_accounts_balance: number;
}

export interface IAccountMovementsResponse {
  data: IMovementItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface IMovementItem {
  id: string;
  movement_type: "income" | "expense";
  description: string;
  amount: number;
  date: string;
  category: {
    id: string;
    name: string;
  };
}
