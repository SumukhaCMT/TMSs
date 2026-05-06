






import { useState, useEffect } from "react";
// import axios from "axios";
import api from "@/axios/axios"
import { useNavigate } from "react-router-dom";

import FormBuilder from "@/components/common/FormBuilder";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

import { secureStorage } from "@/utils/secureStorage";
import { validateSevaBookingForm } from "@/utils/validateSevaBooking";


import {
  calendarTypeOptions,

} from "@/utils/hinduCalendarOptions";

export default function AddSevaBooking() {
  const navigate = useNavigate();
  const token = secureStorage.getItem("token");
  const today = new Date().toISOString().split("T")[0]; //  FIXED
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

  const [open, setOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [errors, setErrors] = useState<any>({});

  const [sevas, setSevas] = useState<any[]>([]);
  const [deities, setDeities] = useState<any[]>([]);
  const [devotees, setDevotees] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [date, setDate] = useState("")
  const [data, setData] = useState({})

  // Fetch dropdown data
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [sevaRes, deityRes, devoteeRes, paymentRes] = await Promise.all([
          api.get("/v1/temple/sevas", { headers }),
          api.get("/v1/temple/deities", { headers }),
          api.get("/v1/temple/devotees", { headers }),
          api.get("/v1/temple/payment-methods", { headers }),
        ]);

        setSevas(sevaRes.data.data);
        setDeities(deityRes.data.data);
        setDevotees(devoteeRes.data.data);
        setPaymentMethods(paymentRes.data.data);
      } catch (err: any) {
        setDialogMessage("Failed to fetch dropdown data");
        setOpen(true);
      }
    };
    fetchAll();
  }, [token]);

  // Handle form submit
  const handleSubmit = async (formData: any) => {
    const validationErrors = validateSevaBookingForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors); // <-- show inline errors
      return;
    }

    try {
      const user = secureStorage.getItem("user");
      const selectedSeva = sevas.find(s => s.id === Number(formData.seva_id));

      const quantity = Number(formData.quantity || 1);
      const sevaAmount = Number(formData.seva_amount);

      const data = {
        seva_id: Number(formData.seva_id),
        seva_name: selectedSeva?.seva_name || "Default Seva Name",
        seva_amount: sevaAmount,
        quantity,
        total_amount: sevaAmount * quantity,
        scheduled_date: formData.scheduled_date,
        created_by_user_id: user?.id || 1,
        organization_id: user?.organization_id || 1,
        temple_id: user?.temple_id || 1,
        scheduled_time: formData.scheduled_time || null,
        calendar_type: formData.calendar_type || "gregorian",
        is_recurring: formData.is_recurring || "no",
        recurring_interval: formData.recurring_interval || null,
        recurring_count: formData.recurring_count || null,
        recurring_occurrences_done: 0,
        hindu_tithi: formData.hindu_tithi || null,
        hindu_paksha: formData.hindu_paksha || null,
        hindu_month: formData.hindu_month || null,
        hindu_samvat: formData.hindu_samvat || null,
        hindu_shaka_year: formData.hindu_shaka_year || null,
        hindu_nakshatra: formData.hindu_nakshatra || null,
        devotee_id: Number(formData.devotee_id) || null,
        devotee_name: formData.devotee_name || null,
        devotee_phone: formData.devotee_phone || null,
        devotee_email: formData.devotee_email || null,
        devotee_gotra: formData.devotee_gotra || null,
        devotee_rashi: formData.devotee_rashi || null,
        devotee_nakshatra: formData.devotee_nakshatra || null,
        devotee_dob: formData.devotee_dob || null,
        devotee_gender: formData.devotee_gender || null,
        deity_id: Number(formData.deity_id) || null,
        payment_method_id: Number(formData.payment_method_id) || null,
        payment_method_snapshot: formData.payment_method_snapshot || null,
        paid_amount: Number(formData.paid_amount || 0),
        payment_status: formData.payment_status || "pending",
        receipt_number: formData.receipt_number || null,
        status: formData.status || "booked",
        remark: formData.remark || null,
        internal_note: formData.internal_note || null,
      };

      await api.post("/v1/temple/seva-bookings", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // console.log(data)
      setDialogMessage("Booking created successfully");
      setOpen(true);
      setErrors({}); // clear errors on success
    } catch (err: any) {
      setDialogMessage(err.response?.data?.message || "Failed to create booking");
      setOpen(true);
    }
  };

  const handleDialogClose = () => {
    setOpen(false);
    if (dialogMessage === "Booking created successfully") {
      navigate("/seva-booking");
    }
  };

  // const handleDate = async (e: any, formState: any, setFormState: any) => {

  //   const value = e.target.value

  //   if (!value) return

  //   try {

  //     const res = await fetch(`https://tms-backend-x26c.onrender.com/panchanga?date=${value}`)
  //     const json = await res.json()

  //     // console.log("Panchanga:", json)

  //     setFormState({
  //       ...formState,
  //       scheduled_date: value,
  //       hindu_tithi: json.tithi || "",
  //       hindu_nakshatra: json.nakshatra || "",
  //       devotee_rashi: json.rashi || "",
  //       hindu_month: json.masa || "",
  //       hindu_samvat: json.samvatsara || "",
  //       hindu_paksha: json.paksha || "",
  //       hindu_shaka_year: json.hindu_shaka_year || "",

  //     })

  //   } catch (err) {
  //     console.error("Panchanga error", err)
  //   }

  // }
  const handleDate = async (e: any, formState: any, setFormState: any) => {
    const value = e.target.value;
    if (!value) return;

    try {
      const user = secureStorage.getItem("user");

      const lat = user?.temple?.lat;
      const lng = user?.temple?.lng;

      if (!lat || !lng) {
        console.warn("Temple location missing");
        return;
      }

      const res = await fetch(
        `https://tms-backend-x26c.onrender.com/api/v1/panchanga?date=${value}&lat=${lat}&lng=${lng}`
      );

      const json = await res.json();

      setFormState((prev: any) => ({
        ...prev,
        scheduled_date: value,
        hindu_tithi: json.tithi || "",
        hindu_nakshatra: json.nakshatra || "",
        devotee_rashi: json.rashi || "",
        hindu_month: json.masa || "",
        hindu_samvat: json.samvatsara || "",
        hindu_paksha: json.paksha || "",
        hindu_shaka_year: json.hindu_shaka_year || "",


        // ✅ NEW
        leap_year: json.leap_year || false,
        adhika_masa: json.adhika_masa || false,
      }));

    } catch (err) {
      console.error("Panchanga error", err);
    }
  };

  return (
    <>
      <AppBreadcrumb
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Seva Booking", to: "/seva-booking" },
          { label: "Add Booking" },
        ]}
      />

      <FormBuilder
        title="Add Seva Booking"
        submitLabel="Save"
        errors={errors} // <-- pass errors for inline display
        onSubmit={handleSubmit}
        defaultValues={{
          scheduled_date: today,   //  auto select today
          scheduled_time: currentTime, //  auto current time
          quantity: 1,
          calendar_type: "hindu",
          is_recurring: "no",
          payment_status: "pending",
          status: "booked",
        }}
        fields={[
          {
            name: "devotee_search",
            label: "Search Devotee",
            type: "search",
            placeholder: "Search by name or phone",
            required: true,

            onSearch: async (value: string) => {
              const res = await api.get(
                `/v1/temple/devotees/search?q=${value}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              return res.data.data;
            },

            onSelect: (item: any, formState: any, setFormState: any) => {
              setFormState({
                ...formState,
                devotee_id: item.id,
                devotee_name: item.name || "",
                devotee_email: item.email || "",
                devotee_phone: item.phone || "",
                devotee_gotra: item.gotra || "",
                devotee_rashi: item.rashi || "",
                devotee_nakshatra: item.nakshatra || "",
                devotee_dob: item.dob || "",
                devotee_gender: item.gender || "",
              });
            },
          },
          {
            name: "seva_search",
            label: "Search Seva",
            type: "search",
            placeholder: "Search Seva",
            required: true,

            onSearch: async (value: string) => {
              const res = await api.get(
                `/v1/temple/sevas/search?q=${value}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );

              return res.data.data.map((item: any) => ({
                ...item,
                name: `${item.seva_name} - ₹${item.amount}`, //  change to name
              }));
            },

            onSelect: (item: any, formState: any, setFormState: any) => {
              setFormState({
                ...formState,
                seva_id: item.id,
                seva_name: item.seva_name,
                seva_amount: item.amount,
                quantity: 1,
              });
            },
          },





          { name: "seva_name", label: "Seva Name", type: "text" },


          // { name: "deity_id", label: "Deity", type: "select", required: true, options: deities.map(d => ({ label: d.name, value: d.id })) },
          {
            name: "deity_name",
            label: "Deity",
            type: "search-select",
            placeholder: "Search or select deity",
            required: true,
            options: deities.map(d => ({
              label: d.name,
              value: d.id
            })),
            // onSelect: (item, formState, setFormState) => {
            //   setFormState({
            //     ...formState,
            //     deity_id: item.value,
            //     deity_name: item.label
            //   })
            // }
            onSelect: (item, formState, setFormState) => {
              setFormState(prev => ({
                ...prev,
                deity_id: item.value,
                deity_name: item.label
              }))
            }
          },

          {
            name: "scheduled_date", label: "Date", type: "date",
            min: new Date().toISOString().split("T")[0], // blocks past
            onChange: handleDate
          },
          { name: "scheduled_time", label: "Time", type: "time" },
          { name: "seva_amount", label: "Amount", type: "number", required: true, placeholder: "Enter the amount for the seva. This can be auto-filled when a seva is selected from the search field above." },

          // { name: "payment_method_id", label: "Payment Method", type: "select", required: true, options: paymentMethods.map(p => ({ label: p.payment_method, value: p.id })) },
          {
            name: "payment_method_name",
            label: "Payment Method",
            type: "search-select",
            placeholder: "Search or select payment method",
            required: true,

            options: paymentMethods.map(p => ({
              label: p.payment_method,
              value: p.id
            })),

            onSelect: (item, formState, setFormState) => {
              setFormState(prev => ({
                ...prev,
                payment_method_id: item.value,
                payment_method_name: item.label
              }))
            }
          },


          { name: "devotee_email", label: "Devotee Email", type: "email", placeholder: "Enter devotee's email address" },
          { name: "devotee_phone", label: "Devotee Phone", type: "text", placeholder: "Enter devotee's phone number" },
          {
            name: "devotee_dob", label: "Date of Birth", type: "date",
            max: new Date().toISOString().split("T")[0]
          },
          { name: "devotee_gender", label: "Gender", placeholder: "Select the gender", type: "search-select", options: [{ label: "Male", value: "male" }, { label: "Female", value: "female" }] },

          { name: "devotee_gotra", label: "Gotra", type: "text", placeholder: "Enter devotee's gotra" },
          { name: "devotee_rashi", label: "Rashi", type: "text", placeholder: "Enter devotee's rashi" },
          { name: "devotee_nakshatra", label: "Nakshatra", type: "text", placeholder: "Enter devotee's nakshatra" },





          { name: "quantity", label: "Quantity", type: "number", defaultValue: 1, placeholder: "Enter the quantity for the seva. This can be auto-filled with a default value of 1 when a seva is selected from the search field above." },



          { name: "remark", label: "Remark", type: "textarea", colSpan: 4, placeholder: "Any special instructions or notes related to the seva booking can be added here. This will be visible to both the temple staff and the devotee." },
          { name: "internal_note", label: "Internal Note", type: "textarea", colSpan: 4, placeholder: "Notes for internal use only. This will not be visible to the devotee but can help temple staff with additional information about the booking." },



          {
            name: "calendar_type",
            label: "Calendar Type",
            type: "search-select",
            options: calendarTypeOptions,
          },

          // 🔁 Recurring
          {
            name: "is_recurring",
            label: "Recurring?",
            type: "search-select",
            placeholder: "Is this a recurring seva booking?",
            options: [
              { label: "Yes", value: "yes" },
              { label: "No", value: "no" }
            ],
          },

          {
            name: "recurring_interval",
            label: "Recurring Interval",
            type: "search-select",
            placeholder: "Select the recurring interval",
            options: [
              { label: "Daily", value: "daily" },
              { label: "Weekly", value: "weekly" },
              { label: "Monthly", value: "monthly" },
              { label: "Yearly", value: "yearly" }
            ],
            showWhen: (formState: any) => formState.is_recurring === "yes"
          },

          {
            name: "recurring_count",
            label: "Recurring Count",
            placeholder: "Enter how many times this should recur",
            type: "number",
            showWhen: (formState: any) => formState.is_recurring === "yes"
          },

          // 🕉 Hindu Fields


          { name: "hindu_paksha", label: "Hindu Paksha", type: "text", placeholder: "Enter the Hindu tithi for the scheduled date, if applicable" },

          { name: "hindu_tithi", label: "Hindu Tithi", type: "text", placeholder: "Enter the Hindu tithi for the scheduled date, if applicable" },


          { name: "hindu_month", label: "Hindu Month", type: "text", placeholder: "Enter the Hindu month for the scheduled date, if applicable" },


          { name: "hindu_samvat", label: "Hindu Samvatsara", type: "text", placeholder: "Enter the Hindu samvat year for the scheduled date, if applicable" },

          {
            name: "hindu_shaka_year",
            label: "Hindu Shaka Year",
            type: "number",
            placeholder: "Auto disply the year",
            showWhen: (formState: any) => formState.calendar_type === "hindu"
          },


          { name: "hindu_nakshatra", label: "Hindu Nakshatra", type: "text", placeholder: "Enter the Hindu nakshatra for the scheduled date, if applicable" },
          ,

          {
            name: "leap_year",
            label: "Leap Year",
            type: "checkbox",
            disabled: true,
            showWhen: (formState: any) => formState.calendar_type === "hindu"
          },
          {
            name: "adhika_masa",
            label: "Adhika Masa",
            type: "checkbox",
            disabled: true,
            showWhen: (formState: any) => formState.calendar_type === "hindu"
          }
        ]}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMessage}</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleDialogClose}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}



