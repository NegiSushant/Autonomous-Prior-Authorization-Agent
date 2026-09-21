import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
type SortKey =
  | "id"
  | "name"
  | "type"
  | "email"
  | "phone"
  | "users"
  | "patients"
  | "status"
  | "createdBy"
  | "role"
  | "organization"
  | "insurance"
  | "procedure"
  | "diagnosis"
  | "notes"
  | "meds"
  | "imaging"
  | "domain"
  | "organizationName"
  | "domainName"
  | "numOfLicenceRequired"
  | "createdAt";
;

export type SortDirection = "asc" | "desc";

export function SortIcon({
  column,
  sortKey,
  sortDirection,
}: {
  column: SortKey;
  sortKey: SortKey;
  sortDirection: SortDirection;
}) {
  if (sortKey !== column) {
    return <ArrowUpDown size={14} className="opacity-40" />;
  }
  return sortDirection === "asc" ? (
    <ArrowUp size={14} className="text-blue-500 dark:text-blue-400" />
  ) : (
    <ArrowDown size={14} className="text-blue-500 dark:text-blue-400" />
  );
}
