import FormBuilder from "@/components/common/FormBuilder"
import AppBreadcrumb from "@/components/common/AppBreadcrumb"
import axios from "axios"
import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import LocationSearch from "@/components/common/LocationSearch"
import imageCompression from "browser-image-compression"
import { toast } from "sonner"
import { secureStorage } from "@/utils/secureStorage"
import api, { IMAGE_URLS } from "@/axios/axios";
export default function EditSeva() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [error, setError] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  //  const IMAGE_URL = "http://localhost:5000/public/temple/"; 

  // ✅ NEW: location state
  const [location, setLocation] = useState({
    lat: 0,
    lng: 0,
  })

  useEffect(() => {
    if (id) {
      fetchTemples()
    }
  }, [id])

  const fetchTemples = async () => {
    try {
      const token = secureStorage.getItem("token")

      const res = await axios.get(
        `http://localhost:5000/api/v1/temple/temples/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setData(res.data.data)

      // ✅ set existing location
      setLocation({
        lat: res.data.data.lat || 0,
        lng: res.data.data.lng || 0,
      })

    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to load temple"
      )
    } finally {
      setLoading(false)
    }
  }

  //  UPDATE
  

const handleSubmit = async (formData: any) => {
  setErrors({})
  setError("")

  try {
    const token = secureStorage.getItem("token")

    const payload = new FormData()

    // =====================================
    //  append all fields EXCEPT img, lat, lng
    // =====================================
    Object.keys(formData).forEach((key) => {
      if (
        key !== "img_name" &&
        key !== "lat" &&
        key !== "lng" &&
        formData[key] !== undefined &&
        formData[key] !== null
      ) {
        payload.append(key, formData[key])
      }
    })

    // =====================================
    //  FIX: append lat/lng PROPERLY
    // =====================================
    payload.append("lat", location.lat.toString())
    payload.append("lng", location.lng.toString())

    // =====================================
    //  image handling
    // =====================================
    if (formData.img_name instanceof File) {
      const compressedFile = await imageCompression(
        formData.img_name,
        {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: "image/webp",
        }
      )

      const webpFile = new File(
        [compressedFile],
        formData.img_name.name.replace(/\.[^/.]+$/, ".webp"),
        { type: "image/webp" }
      )

      payload.append("img_name", webpFile)
    }

    // =====================================
    //  DON'T set Content-Type manually
    // =====================================
    await axios.put(
      `http://localhost:5000/api/v1/temple/temples/${id}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    toast.success("Temple Updated Successfully")

    setTimeout(() => {
      navigate("/temples")
    }, 1000)

  } catch (err: any) {
    toast.error(err.response?.data?.message || "Update failed")
  }
}

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-gray-500">Loading Temple...</p>
      </div>
    )
  }

  if (error) {
    return <p className="text-red-500">{error}</p>
  }

  return (
    <>
      <AppBreadcrumb
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Temples", to: "/temples" },
          { label: "Edit Temple" },
        ]}
      />

      {/*  LOCATION SEARCH (OUTSIDE FORM) */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">
          Search Location
        </label>

        <LocationSearch
          onSelect={(loc: any) => {
            setLocation({
              lat: loc.lat,
              lng: loc.lng,
            })
          }}
        />

        {/* ✅ Show selected lat/lng */}
        <p className="text-sm text-gray-500 mt-1">
          Lat: {location.lat} | Lng: {location.lng}
        </p>

        {/* ✅ Map preview */}
        {location.lat && location.lng && (
          <iframe
            className="mt-2 rounded"
            width="100%"
            height="250"
            loading="lazy"
            src={`https://maps.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed`}
          />
        )}
      </div>

      {/*  FORM BUILDER */}
      <FormBuilder
        title="Edit Temple"
        submitLabel="Update"
        defaultValues={data || {}}
        onSubmit={handleSubmit}
        errors={errors}
        fields={[
           {
            name: "img_name",
            label: "Image",
            type: "image",
        
            url: data.img_name ? IMAGE_URLS.temple + data.img_name : null, alt: data.name || "Temple Image" 
           
          },
          {
            name: "name",
            label: "Temple Name",
            required: true,
            placeholder: "Enter temple name",
          },
          {
            name: "address_line1",
            label: "Address",
            type: "text",
            placeholder: "Enter Address",
          },
           
        ]}
      />
    </>
  )
}