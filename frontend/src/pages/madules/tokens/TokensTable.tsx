import AppBreadcrumb from "@/components/common/AppBreadcrumb"
import DataTable from "@/components/common/DataTable"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchTokens, deleteToken } from "@/features/tokens/tokensThunks"

import { toast } from "sonner"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"

export default function TokensTable() {

    const dispatch = useAppDispatch()
  const navigate = useNavigate()
   const { tokens } = useAppSelector((state) => state.tokens)
     const [open, setOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<any>(null)

   useEffect(() => {
      dispatch(fetchTokens())
    }, [dispatch])
  
 const handleDeleteClick = (row: any) => {
    setSelectedRow(row)
    setOpen(true)
  }
 const confirmDelete = async () => {

    if (!selectedRow) return

    try {

      await dispatch(deleteToken(selectedRow.id)).unwrap()

      toast.success("Tokens deleted successfully")

      setOpen(false)

    } catch (error: any) {

      toast.error(error?.message || "Failed to delete Seva")

    }
  }

  return (
   <>
   <AppBreadcrumb
           items={[
             { label: "Dashboard", to: "/dashboard" },
              { label: "Tokens Issue", to: "/tokens/list" },
             { label: "Tokens List" },
            //  { label: "Create Tokens", to: "/tokens/add" },
           ]}
         />

<DataTable
        title="Tokens"
        data={tokens}
        addLabel="Add Tokens"
        onAdd={() => navigate("/tokens/add")}
        onView={(row) => navigate(`/tokens/${row.id}/print`)}
        onEdit={(row) => {
          if (!row?.id) return
          navigate(`/tokens/${row.id}/edit`)
        }}
        onDelete={handleDeleteClick}
        columns={[
          { key: "token_name", label: "Token Name" },
          { key: "token_code", label: "Token Code" },
          { key: "display_order", label: "Display Order" },
          { key: "status", label: "Status" },
        
         
        ]}
      />
            <Dialog open={open} onOpenChange={setOpen}>

        <DialogContent >

          <DialogHeader>
            <DialogTitle>Delete Record</DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter >

            <DialogClose asChild>
              <Button variant="outline">
                Cancel
              </Button>
            </DialogClose>

            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Confirm Delete
            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>
   </>
  )
}

