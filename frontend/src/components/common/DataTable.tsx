import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { MoreHorizontalIcon } from "lucide-react"
import { useEffect, useState } from "react"

type Column<T> = {
  key: keyof T
  label: string
  render?: (row: T) => React.ReactNode
}

type DataTableProps<T> = {
  data: T[]
  columns: Column<T>[]
  storageKey: string
  onEdit?: (row: T) => void
  onView?: (row: T) => void
  onDelete?: (row: T) => void
  onCancle? :(row:T) => void
}

export default function DataTable<T extends { id: number | string }>({
  data,
  columns,
  storageKey,
  onEdit,
  onView,
  onDelete,
  onCancle,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const [selectedColumns, setSelectedColumns] = useState<(keyof T)[]>(() => {
    const saved = localStorage.getItem(storageKey)
    return saved
      ? JSON.parse(saved)
      : columns.slice(0, 3).map((c) => c.key)
  })

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(selectedColumns))
  }, [selectedColumns, storageKey])

  const filteredData = data.filter((row) =>
    JSON.stringify(row).toLowerCase().includes(search.toLowerCase())
  )

  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentItems = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  return (
    <>
      {/* SEARCH + COLUMN SELECT */}
      
      <div className="mb-4 flex justify-between gap-4">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setCurrentPage(1)
          }}
          className="max-w-sm"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Select Columns</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {columns.map((col) => (
              <DropdownMenuItem
                key={String(col.key)}
                onSelect={(e) => e.preventDefault()}
              >
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={selectedColumns.includes(col.key)}
                  onChange={() =>
                    setSelectedColumns((prev) =>
                      prev.includes(col.key)
                        ? prev.filter((c) => c !== col.key)
                        : [...prev, col.key]
                    )
                  }
                />
                {col.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* TABLE */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">#</TableHead>
            {columns.map(
              (col) =>
                selectedColumns.includes(col.key) && (
                  <TableHead key={String(col.key)}>
                    {col.label}
                  </TableHead>
                )
            )}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {currentItems.map((row, index) => (
            <TableRow key={row.id}>
              <TableCell className="text-center">
                {startIndex + index + 1}
              </TableCell>

              {columns.map(
                (col) =>
                  selectedColumns.includes(col.key) && (
                    <TableCell key={String(col.key)}>
                      {col.render
                        ? col.render(row)
                        : String(row[col.key])}
                    </TableCell>
                  )
              )}

              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontalIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onView && (
                      <DropdownMenuItem onClick={() => onView(row)}>
                        Report
                      </DropdownMenuItem>
                    )}
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(row)}>
                        Edit
                      </DropdownMenuItem>
                    )}
                    
                     {onCancle && (
                      <DropdownMenuItem onClick={() => onCancle(row)}>
                        Cancle
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => onDelete(row)}
                      >
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}

          {currentItems.length === 0 && (
            <TableRow>
              <TableCell colSpan={columns.length + 2} className="text-center py-6">
                No data found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() =>
                  currentPage > 1 && setCurrentPage(currentPage - 1)
                }
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  isActive={currentPage === i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  currentPage < totalPages &&
                  setCurrentPage(currentPage + 1)
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </>
  )
}
