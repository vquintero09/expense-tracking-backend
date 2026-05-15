// Entidades internas (filas tal cual en DB)
export interface IExpenseRow {
  id: string;
  amount: number;
  category_id: string;
  account_id: string;
  date: string;
  description: string;
}

// Payloads de creación (lo que envía el frontend)
export interface ICreateExpense {
  amount: number;
  category_id: string;
  account_id: string;
  date: string;
  description: string;
}

// Respuestas publicas (lo que se devuelve al frontend)
export interface ICategoryResponse {
  id: string;
  name: string;
}

export interface IAccountResponse {
  id: string;
  name: string;
}

export interface IExpenseResponse {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: ICategoryResponse;
  account: IAccountResponse;
}
