import {
  Calendar,
  ClipboardList,
  Eye,
  FileText,
  List,
  PlusCircle,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  description?: string;
  icon: LucideIcon;
}

export interface NavSection {
  id: string;
  label: string;
  protected: boolean;
  mobileIcon: LucideIcon;
  mobileHref: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    id: "contratos",
    label: "Contratos",
    protected: true,
    mobileIcon: FileText,
    mobileHref: "/contratos",
    items: [
      {
        href: "/contratos/cadastrar",
        label: "Cadastrar Contrato",
        description: "Novo contrato",
        icon: PlusCircle,
      },
      {
        href: "/contratos",
        label: "Contratos",
        description: "Ver e editar contratos",
        icon: FileText,
      },
    ],
  },
  {
    id: "ordens",
    label: "Ordens de Serviço",
    protected: true,
    mobileIcon: ClipboardList,
    mobileHref: "/ordens",
    items: [
      {
        href: "/ordens/cadastrar",
        label: "Cadastrar OS",
        description: "Nova ordem de serviço",
        icon: PlusCircle,
      },
      {
        href: "/ordens",
        label: "Ordens de Serviço",
        description: "Listagem e logística",
        icon: ClipboardList,
      },
    ],
  },
  {
    id: "visualizar",
    label: "Visualizar",
    protected: false,
    mobileIcon: Eye,
    mobileHref: "/calendario",
    items: [
      {
        href: "/calendario",
        label: "Calendário",
        description: "Visão mensal dos eventos",
        icon: Calendar,
      },
      {
        href: "/lista-servicos",
        label: "Lista de Serviços",
        description: "Semana logística",
        icon: List,
      },
    ],
  },
];

export const PROTECTED_PATH_PREFIXES = ["/contratos", "/ordens", "/cadastrar"];

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function isActiveNavItem(pathname: string, href: string): boolean {
  if (href === "/contratos" || href === "/ordens") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getSectionForPath(pathname: string): NavSection | undefined {
  return NAV_SECTIONS.find((section) =>
    section.items.some((item) => isActiveNavItem(pathname, item.href))
  );
}
