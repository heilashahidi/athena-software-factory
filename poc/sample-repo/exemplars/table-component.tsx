// CANONICAL EXEMPLAR — list view shape for payments-dashboard.
import { DataTable } from "../../components/DataTable";
import { useInvoices, PERMISSION } from "./hooks";

const columns = [
  { key: "label", header: "Label" },
  { key: "amountCents", header: "Amount" },
];

export function InvoiceList({ can }) {
  if (!can(PERMISSION)) return null;
  const { rows } = useInvoices();
  return <DataTable columns={columns} rows={rows} sortable filterable />;
}
