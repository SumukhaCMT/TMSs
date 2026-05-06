import { Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/pages/auth/useAuth"

import PublicRoute from "@/routes/PublicRoute"
import ProtectedRoute from "@/routes/ProtectedRoute"

import DashboardLayout from "@/components/layout/DashboardLayout"
import Dashboard from "@/pages/Dashboard"
import Profile from "@/pages/auth/Profile"
import ChangePassword from "@/pages/auth/ChangePassword"
import Login from "@/pages/auth/Login"
import ForgotPassword from "@/pages/auth/ForgotPassword"
import ResetPassword from "@/pages/auth/ResetPassword"
import OrganizationForm from "@/pages/auth/Register"
import HundiTable from "@/pages/madules/hundi/HundiTable";
import AddHundi from "@/pages/madules/hundi/AddHundi";
import Organizations from "@/pages/Organizations"
import OrganizationsTable from "@/pages/madules/organization/OrganizationsTable"
import AddTrustees from "@/pages/madules/organization/AddTrustees"
import Trustees from "@/pages/madules/organization/Trustees"
import  EditTrustee from "@/pages/madules/organization/EditTrustee"
import OrganizationView from "@/pages/madules/organization/OrganizationView"
import OrganizationEdit from "@/pages/madules/organization/EditOrganization"
import Temples from "@/pages/Temples"
import TemplesTable from "@/pages/madules/temple/TemplesTable"
import EditTemples from "./pages/madules/temple/EditTemples"
import Donation from "@/pages/Donation"
import DonationTable from "@/pages/madules/donation/DonationTable"
import AddDonation from "@/pages/madules/donation/AddDonation"
import EditDonation from "@/pages/madules/donation/EditDonation"
import Deities from "@/pages/Deities"
import DeitiesTable from "@/pages/madules/deities/DeitiesTable"
import AddDeities from "@/pages/madules/deities/AddDeities"
import EditDeities from "./pages/madules/deities/EditDeity"
import EditHundi from "./pages/madules/hundi/EditHundi"
import Devotees from "./pages/Devotees"
import  DevoteesTable  from "./pages/madules/devotees/DevoteesTable"
import AddDevotee from "./pages/madules/devotees/AddDevotee"
import EditDevotee from "./pages/madules/devotees/EditDevotee"
import HundiFinalize from "./pages/madules/hundi/HundiFinalize";

import  SevasTable  from "./pages/madules/sevas/SevasTable"
import AddSeva from "./pages/madules/sevas/AddSeva"
import EditSeva from "./pages/madules/sevas/EditSeva"
import Sevas from "./pages/Sevas"

import Tokens from "./pages/Tokens"
import TokensTable from "@/pages/madules/tokens/TokensTable"
import EditTokens from "./pages/madules/tokens/EditTokens"
import AddTokens from "./pages/madules/tokens/AddTokens"
import PrintTokens from "./pages/madules/tokens/PrintTokens"

import SevaBooking from "./pages/SevaBooking"
import SevaBookingTable from "./pages/madules/sevabooking/SevaBookingTable"
import AddSevaBooking from "./pages/madules/sevabooking/AddSevaBooking"
import EditSevaBooking from "./pages/madules/sevabooking/EditSevaBooking"
import PrintSevabooking from "./pages/madules/sevabooking/PrintSevabooking"

import PaymentMethod from "./pages/PaymentMethod"
import PaymentMethodTable from "./pages/madules/paymentsmethod/PaymentMethodTable"
import AddPaymentMethod from "./pages/madules/paymentsmethod/AddPaymentMethod"
import EditPaymentMethod from "./pages/madules/paymentsmethod/EditPaymentMethod"
import ListTokens from "./pages/madules/tokens/ListTokens"


export default function App() {
  return (
    <AuthProvider>
      <Toaster />
      <Routes>
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
       
        <Route element={<PublicRoute />}>
           <Route path="/login" element={<Login />} />
           <Route path="/register" element={<OrganizationForm />} />
           <Route path="/" element={<Navigate to="/login" replace />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
          
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/change-password" element={<ChangePassword />} />
           
          <Route path="/temples" element={<Temples />} />
            <Route path="/temples" element={<TemplesTable />} />



            <Route element={<ProtectedRoute requiredPermission="manage_temples" minLevel={1} />}>
               <Route path="/temples" element={<Temples />}>
                 <Route index element={<TemplesTable />} />
                 <Route path="/temples/:id/edit" element={<EditTemples />} />
                
                   
              </Route>
            </Route>
            <Route element={<ProtectedRoute requiredPermission="manage_donations" minLevel={1} />}>
              <Route path="/donations" element={<Donation />}>
                <Route index element={<DonationTable />} />
                <Route element={<ProtectedRoute requiredPermission="manage_donations" minLevel={2} />}>
                  <Route path="add" element={<AddDonation />} />
                </Route>
                   <Route element={<ProtectedRoute requiredPermission="manage_donations" minLevel={3} />}>
                  <Route path=":id/edit" element={<EditDonation />} />
                </Route>
              </Route>
            </Route>

            <Route element={<ProtectedRoute requiredPermission="manage_deities" minLevel={1} />}>
              <Route path="deities" element={<Deities />}>
                <Route index element={<DeitiesTable />} />
                <Route element={<ProtectedRoute requiredPermission="manage_deities" minLevel={2} />}>
                  <Route path="add" element={<AddDeities />} />
                </Route>
                
                 <Route element={<ProtectedRoute requiredPermission="manage_deities" minLevel={3} />}>
                  <Route path=":id/edit" element={<EditDeities />} />
                </Route>
              </Route>
            </Route>



            <Route element={<ProtectedRoute requiredPermission="manage_sevas" minLevel={1} />}>
              <Route path="sevas" element={<Sevas />}>
                {/* 1. VIEW LIST: Requires Level 1 */}
                <Route index element={<SevasTable />} />

                {/* 2. MANAGE SEVAS: Requires Level 2 (Add) */}
                <Route element={<ProtectedRoute requiredPermission="manage_sevas" minLevel={2} />}>
                  <Route path="add" element={<AddSeva />} />

                  {/* 3. EDIT SEVAS: Specifically Requires Level 3 
                      Nesting it here prevents path ambiguity for the 'add' route */}
                  <Route element={<ProtectedRoute requiredPermission="manage_sevas" minLevel={3} />}>
                    <Route path=":id/edit" element={<EditSeva />} />
                  </Route>
                </Route>
              </Route>
            </Route>

           <Route element={<ProtectedRoute requiredPermission="manage_tokens" minLevel={1} />}>
              <Route path="tokens" element={<Tokens />}>
                {/* 1. VIEW LIST: Requires Level 1 */}
                <Route index element={<TokensTable />} />

                {/* 2. MANAGE SEVAS: Requires Level 2 (Add) */}
                <Route element={<ProtectedRoute requiredPermission="manage_tokens" minLevel={2} />}>
                  <Route path="add" element={<AddTokens />} />

                 
                  <Route element={<ProtectedRoute requiredPermission="manage_tokens" minLevel={3} />}>
                    <Route path=":id/edit" element={<EditTokens />} />
                  </Route>
                   <Route element={<ProtectedRoute requiredPermission="manage_tokens" minLevel={3} />}>
                    <Route path=":id/print" element={<PrintTokens />} />
                  </Route>

                  <Route element={<ProtectedRoute requiredPermission="manage_tokens" minLevel={3} />}>
                    <Route path="list" element={<ListTokens />} />
                  </Route>
                </Route>
              </Route>
            </Route>




           <Route element={<ProtectedRoute requiredPermission="manage_devotees" minLevel={1} />}>
              <Route path="devotees" element={<Devotees />}>
                <Route index element={<DevoteesTable />} />
                <Route element={<ProtectedRoute requiredPermission="manage_devotees" minLevel={2} />}>
                  <Route path="add" element={<AddDevotee />} />
                </Route>
                
                 <Route element={<ProtectedRoute requiredPermission="manage_devotees" minLevel={3} />}>
                  <Route path=":id/edit" element={<EditDevotee />} />
                </Route>
              </Route>
            </Route>

               <Route element={<ProtectedRoute requiredPermission="manage_sevabooking" minLevel={1} />}>
              <Route path="seva-booking" element={<SevaBooking />}>
                <Route index element={<SevaBookingTable />} />
                <Route element={<ProtectedRoute requiredPermission="manage_sevabooking" minLevel={2} />}>
                  <Route path="add" element={<AddSevaBooking />} />
                </Route>
                
                 <Route element={<ProtectedRoute requiredPermission="manage_sevabooking" minLevel={3} />}>
                  <Route path=":id/edit" element={<EditSevaBooking />} />
                </Route>
                <Route element={<ProtectedRoute requiredPermission="manage_sevabooking" minLevel={3} />}>
                  <Route path=":id/print" element={<PrintSevabooking  />} />
                </Route>
              </Route>
               </Route>

            <Route element={<ProtectedRoute requiredPermission="manage_payment_methods" minLevel={1} />}>
              <Route path="payment-methods" element={<PaymentMethod />}>
                <Route index element={<PaymentMethodTable />} />
                <Route element={<ProtectedRoute requiredPermission="manage_payment_methods" minLevel={2} />}>
                  <Route path="add" element={<AddPaymentMethod />} />
                </Route>
                
                 <Route element={<ProtectedRoute requiredPermission="manage_payment_methods" minLevel={3} />}>
                  <Route path=":id/edit" element={<EditPaymentMethod />} />
                </Route>
              </Route>
            </Route>



            <Route element={<ProtectedRoute requiredPermission="hundi_module" minLevel={1} />}>
              <Route path="hundi">
                <Route index element={<HundiTable />} />
                
                <Route element={<ProtectedRoute requiredPermission="hundi_module" minLevel={2} />}>
                  <Route path="add" element={<AddHundi />} />
                  <Route element={<ProtectedRoute requiredPermission="hundi_module" minLevel={3} />}></Route>
                  <Route path=":id/edit" element={<EditHundi />} />
                </Route>
                <Route path=":id/finalize" element={<HundiFinalize />} />
              
                <Route path=":id" element={<div>View Hundi Detail Component</div>} />
              </Route>
            </Route>
            <Route element={<ProtectedRoute requiredPermission="manage_organizations" minLevel={1} />}>
              <Route path="/organizations" element={<Organizations />}>
                <Route index element={<OrganizationsTable />} />
                <Route path=":id" element={<OrganizationView />} />
             
                
                <Route element={<ProtectedRoute requiredPermission="manage_organizations" minLevel={2} />}>
                  <Route path="addtrustees" element={<AddTrustees />} />
                   <Route path="trustees" element={<Trustees />} />
               <Route path="trustees/:id/edit" element={<EditTrustee />} />
                 
                </Route>
                  <Route element={<ProtectedRoute requiredPermission="manage_organizations" minLevel={3} />}>
                    <Route path=":id/edit" element={<OrganizationEdit />} />
                  </Route>
              </Route>
            </Route>
          
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}