export type ProjectStatus = 'PLANNED' | 'ONGOING' | 'COMPLETED';

export type TransactionType = 'STOCK_IN' | 'STOCK_OUT';

export interface Project {
  id: string;
  name: string;
  code: string;
  clientName: string;
  location: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: ProjectStatus;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDetail extends Project {
  boqValue: number;
  boqItemCount: number;
  latestProgressPercentage: number | null;
  latestProgressDate: string | null;
  progressRecordCount: number;
}

export interface CreateProjectInput {
  name: string;
  code: string;
  clientName: string;
  location: string;
  startDate: string;
  endDate: string;
  budget: number;
  status?: ProjectStatus;
}

export interface UpdateProjectInput {
  name?: string;
  code?: string;
  clientName?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  status?: ProjectStatus;
}

export interface BoqItem {
  id: string;
  projectId: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface BoqSummary {
  projectId: string;
  itemCount: number;
  totalValue: number;
  /** Alias kept for existing UI call sites; same value as totalValue. */
  totalBoqValue?: number;
}

export interface BoqList {
  data: BoqItem[];
  items?: BoqItem[];
  summary: BoqSummary;
}

export interface CreateBoqItemInput {
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
}

export interface UpdateBoqItemInput {
  description?: string;
  unit?: string;
  quantity?: number;
  unitPrice?: number;
}

export interface Material {
  id: string;
  name: string;
  code: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialWithStockFlag extends Material {
  isLowStock: boolean;
}

export interface CreateMaterialInput {
  name: string;
  code: string;
  unit: string;
  minimumStock?: number;
}

export interface UpdateMaterialInput {
  name?: string;
  code?: string;
  unit?: string;
  minimumStock?: number;
}

export interface InventoryTransaction {
  id: string;
  materialId: string;
  projectId?: string | null;
  type: TransactionType;
  quantity: number;
  date: string;
  reference: string;
  notes?: string | null;
  createdAt: string;
  material: {
    id: string;
    name: string;
    code: string;
    unit: string;
  };
  project?: {
    id: string;
    name: string;
    code: string;
  } | null;
}

export interface StockInInput {
  materialId: string;
  projectId?: string;
  quantity: number;
  date: string;
  reference: string;
  notes?: string;
}

export interface StockOutInput {
  materialId: string;
  projectId: string;
  quantity: number;
  date: string;
  reference: string;
  notes?: string;
}

export interface StockMovementResult {
  transaction: InventoryTransaction;
  material: MaterialWithStockFlag;
  warning: string | null;
}

export interface ProgressRecord {
  id: string;
  projectId: string;
  date: string;
  description: string;
  percentage: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  project: {
    id: string;
    code: string;
    name: string;
  };
}

export interface CreateProgressInput {
  projectId: string;
  date: string;
  description: string;
  percentage: number;
  notes?: string;
}

export interface UpdateProgressInput {
  date?: string;
  description?: string;
  percentage?: number;
  notes?: string;
}

export interface DashboardSummary {
  projects: {
    total: number;
    planned: number;
    ongoing: number;
    completed: number;
  };
  inventory: {
    totalMaterials: number;
    lowStockCount: number;
  };
  projectPerformance: Array<{
    id: string;
    name: string;
    code: string;
    clientName: string;
    location: string;
    startDate: string;
    endDate: string;
    budget: number;
    boqValue: number;
    latestProgress: number | null;
    status: ProjectStatus;
  }>;
  recentTransactions: Array<{
    id: string;
    materialCode: string;
    materialName: string;
    unit: string;
    projectCode: string | null;
    projectName: string | null;
    type: TransactionType;
    quantity: number;
    date: string;
    reference: string;
  }>;
  recentProgress: Array<{
    id: string;
    projectId: string;
    projectCode: string;
    projectName: string;
    date: string;
    description: string;
    percentage: number;
    notes: string | null;
  }>;
  materialStockSummary: Array<{
    id: string;
    code: string;
    name: string;
    unit: string;
    currentStock: number;
    minimumStock: number;
    isLowStock: boolean;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    pageCount?: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}
