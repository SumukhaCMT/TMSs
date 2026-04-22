

// import DataTable from "@/components/common/DataTable"
// import type { Deities } from "@/types/Deities"
// import AppBreadcrumb from "@/components/common/AppBreadcrumb"
// import { useNavigate } from "react-router-dom"
// import { useEffect, useState } from "react"
// import axios from "axios"
// import api from "@/axios/axios";

// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogFooter,
// } from "@/components/ui/alert-dialog"

// import { secureStorage } from "@/utils/secureStorage"



// export default function DeitiesTable() {

//   const navigate = useNavigate()

//   const [data, setData] = useState<Deities[]>([])
//   const [loading, setLoading] = useState(true)

//   const [deleteOpen, setDeleteOpen] = useState(false)

//   const [selectedRow, setSelectedRow] = useState<Deities | null>(null)



//   useEffect(() => {

//     fetchDeities()

//   }, [])



//   const fetchDeities = async () => {

//     try {

//       const token = secureStorage.getItem("token")

//       const response = await axios.get(
//         "http://localhost:5000/api/v1/temple/deities",
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       )

//       setData(response.data.data)

//     }

//     catch (error) {

//       console.error(error)

//     }

//     finally {

//       setLoading(false)

//     }

//   }



//   //  OPEN DIALOG

//   const handleDeleteClick = (row: Deities) => {

//     setSelectedRow(row)

//     setDeleteOpen(true)

//   }



//   //  CONFIRM DELETE

//   const confirmDelete = async () => {

//     if (!selectedRow) return

//     try {

//       const token = secureStorage.getItem("token")

//       await axios.delete(
//         `http://localhost:5000/api/v1/temple/deities/${selectedRow.id}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       )

//       setDeleteOpen(false)

//       fetchDeities()

//     }

//     catch (error) {

//       console.error(error)

//     }

//   }



//   return (

//     <>

//       <AppBreadcrumb
//         items={[
//           { label: "Dashboard", to: "/dashboard" },
//           { label: "Deities List" },
//           { label: "Add Deities", to: "/deities/add" },
//         ]}
//       />


//       <DataTable<Deities>

//         data={data}

//         loading={loading}

//         storageKey="deity_columns"

//         columns={[

//           { key: "name", label: "Deity Name" },

//           { key: "code", label: "Code" },

//           { key: "description", label: "Description" },

//           {
//             key: "status",
//             label: "Status",
//             render: (d) => (
//               <span
//                 className={`rounded px-2 py-1 text-xs ${
//                   d.status === "active"
//                     ? "bg-green-100 text-green-700"
//                     : "bg-red-100 text-red-700"
//                 }`}
//               >
//                 {d.status}
//               </span>
//             ),
//           },

//         ]}


//         onEdit={(row) => navigate(`/deities/${row.id}/edit`)}

//         onDelete={handleDeleteClick}

//       />



//       {/*  DELETE DIALOG */}


//       <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>

//         <AlertDialogContent>

//           <AlertDialogHeader>

//             <AlertDialogTitle>

//               Are you sure you want to delete this deity?

//             </AlertDialogTitle>

//           </AlertDialogHeader>



//           <AlertDialogFooter>

//             <AlertDialogCancel>

//               Cancel

//             </AlertDialogCancel>



//             <AlertDialogAction

//               onClick={confirmDelete}

//               className="bg-red-600 hover:bg-red-700"

//             >

//               Delete

//             </AlertDialogAction>


//           </AlertDialogFooter>


//         </AlertDialogContent>


//       </AlertDialog>



//     </>

//   )

// }





















import DataTable from "@/components/common/DataTable"
import type { Deities } from "@/types/Deities"
import AppBreadcrumb from "@/components/common/AppBreadcrumb"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchDeities, deleteDeity } from "@/features/deities/deitiesThunk"

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

export default function DeitiesTable() {

  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  // ✅ get data from redux
  const { deities, loading } = useAppSelector((state) => state.deities)

  const [open, setOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<Deities | null>(null)

  useEffect(() => {
    dispatch(fetchDeities())
  }, [dispatch])

  // OPEN DELETE DIALOG
  const handleDeleteClick = (row: Deities) => {
    setSelectedRow(row)
    setOpen(true)
  }

  // CONFIRM DELETE
  const confirmDelete = async () => {
    if (!selectedRow) return

    try {
      await dispatch(deleteDeity(selectedRow.id)).unwrap()
      toast.success("Deity deleted successfully")
      setOpen(false)
    } catch (error) {
      toast.error("Failed to delete deity")
    }
  }

  return (
    <>
      <AppBreadcrumb
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Deities List" },
          { label: "Add Deities", to: "/deities/add" },
        ]}
      />

      <DataTable<Deities>
        data={deities}
        loading={loading}
        storageKey="deity_columns"
        columns={[
          { key: "name", label: "Deity Name" },
          { key: "code", label: "Code" },
          { key: "description", label: "Description" },
          {
            key: "status",
            label: "Status",
            render: (d) => (
              <span
                className={`rounded px-2 py-1 text-xs ${
                  d.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {d.status}
              </span>
            ),
          },
        ]}
        onEdit={(row) => navigate(`/deities/${row.id}/edit`)}
        onDelete={handleDeleteClick}
      />

      {/* DELETE DIALOG */}

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