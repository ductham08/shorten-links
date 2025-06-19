import { DataTable } from "@/components/data-table"
import data from "@/data/data.json"

export default function Page() {
  return (
    <DataTable data={data} />
  )
} 