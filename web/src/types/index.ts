export type UserRole = "PRESTADOR" | "CLIENTE";

export interface User {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  role: UserRole;
  avatarUrl?: string;
  descricao?: string;
  createdAt: string;
}

export interface Service {
  id: string;
  titulo: string;
  descricao: string;
  preco: number;
  categoria: string;
  fotos: string[];
  disponivel: boolean;
  createdAt: string;
  prestador: {
    id: string;
    nome: string;
    avatarUrl?: string;
  };
  _count: {
    reviews: number;
  };
}

export interface Review {
  id: string;
  nota: number;
  comentario?: string;
  fotos: string[];
  createdAt: string;
  cliente: {
    id: string;
    nome: string;
    avatarUrl?: string;
  };
}

export interface Contract {
  id: string;
  status: "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDO" | "CANCELADO";
  mensagem?: string;
  createdAt: string;
  servico: {
    id: string;
    titulo: string;
    preco: number;
  };
  cliente: {
    id: string;
    nome: string;
    avatarUrl?: string;
  };
}
