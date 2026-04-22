
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList, 
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Input } from "@/components/ui/input"
import { MoreHorizontalIcon } from "lucide-react"
import { useOrganizations } from "@/hooks/useOrganizations"

const ALL_COLUMNS = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "country", label: "Country" },
  { key: "created_at", label: "Created At" },
]

export default function OrganizationsTable() {
  const { organizations, loading, error, refetch } = useOrganizations()
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState("")

  const [selectedColumns, setSelectedColumns] = useState<string[]>(() => {
    const saved = localStorage.getItem("org_columns")
    return saved ? JSON.parse(saved) : ["name", "email"]
  })

  useEffect(() => {
    localStorage.setItem("org_columns", JSON.stringify(selectedColumns))
  }, [selectedColumns])

  const filteredOrganizations = organizations.filter((org: any) =>
    [org.name, org.email, org.phone]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredOrganizations.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentItems = filteredOrganizations.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this organization?")) return

    await fetch(`http://localhost:5000/api/v1/organizations/register/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    refetch?.()
  }

  if (loading) return <p>Loading organizations...</p>
  if (error) return <p className="text-red-500">{error}</p>

  return (
    <>
      <div className="mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Organizations</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="mb-4 flex items-center justify-between gap-4">
        <Input
          placeholder="Search organization..."
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
            {ALL_COLUMNS.map((col) => (
              <DropdownMenuItem key={col.key} onSelect={(e) => e.preventDefault()}>
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Sl No</TableHead>
            {selectedColumns.map((col) => (
              <TableHead key={col}>{col}</TableHead>
            ))}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {currentItems.map((org: any, index: number) => (
            <TableRow key={org.id}>
              <TableCell className="text-center">
                {startIndex + index + 1}
              </TableCell>

              {selectedColumns.includes("name") && <TableCell>{org.name}</TableCell>}
              {selectedColumns.includes("email") && <TableCell>{org.email}</TableCell>}
              {selectedColumns.includes("phone") && <TableCell>{org.phone}</TableCell>}
              {selectedColumns.includes("country") && <TableCell>{org.country}</TableCell>}
              {selectedColumns.includes("created_at") && (
                <TableCell>
                  {new Date(org.created_at).toLocaleDateString()}
                </TableCell>
              )}

              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontalIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => navigate(`/organizations/${org.id}/edit`)}
                    >
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate(`/organizations/${org.id}`)}
                    >
                      View
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDelete(org.id)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
