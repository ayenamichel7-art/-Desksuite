// ─── Types principaux synchronisés avec les DTOs Laravel ───────────────

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  telegram_chat_id: number | null;
  timezone: string;
  current_tenant_id: string | null;
  current_tenant?: Tenant;
  tenants?: Tenant[];
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  brand_name: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  config: Record<string, unknown>;
  created_at: string;
  pivot?: { role: string };
}

export interface Folder {
  id: string;
  tenant_id: string;
  parent_id: string | null;
  name: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface FileItem {
  id: string;
  name: string;
  mime_type: string | null;
  size_bytes: number | null;
  formatted_size: string | null;
  folder_id: string | null;
  version_count: number;
  is_trashed: boolean;
  presigned_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  type: 'doc' | 'sheet' | 'slide';
  name: string;
  content: Record<string, unknown> | unknown[] | null;
  last_modified_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Form {
  id: string;
  title: string;
  schema: FormField[];
  is_active: boolean;
  responses_count?: number;
  created_at: string;
}

export interface FormField {
  label: string;
  type: 'text' | 'number' | 'email' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'file';
  required?: boolean;
  options?: string[];
}

export interface FormResponse {
  id: string;
  form_id: string;
  data: Record<string, unknown>;
  submitted_at: string;
}

export interface DriveContents {
  folders: Folder[];
  files: FileItem[];
  current_folder: Folder | null;
}

export interface AuthResponse {
  user: User;
  token: string;
  tenant?: Tenant;
}

// Navigation
export interface NavItem {
  label: string;
  path: string;
  icon: string;
  color?: string;
}
