

import { useState,useEffect  } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useNavigate } from "react-router-dom"
import {
     UploadCloud, 
    Calculator, Calendar as CalendarIcon,  Image as ImageIcon, ChevronDown,X
} from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type Field = {
  name: string
  label: string
  type?: "text" | "email" | "number" | "select" | "textarea" | "image" | "date" | "time" | "search" | "hidden" | "max" | "min" | "url" | "search-select" |"checkbox"
  placeholder?: string
  colSpan?: number
  options?: { label: string; value: string }[]
  required?: boolean
  readOnly?: boolean
  disabled?: boolean
  url?: string
  alt?: string
  onSearch?: (value: string) => Promise<any[]>
  onSelect?: (item: any, formState: any, setFormState: any) => void
  showWhen?: (formState: any) => boolean;
  onChange?: (value: any, formState: any, setFormState: any) => void
}

type FormBuilderProps = {
  title: string
  fields: Field[]
  submitLabel?: string
  backLabel?: string
   backPath?: string ,
  defaultValues?: Record<string, any>
  errors?: Record<string, string>
  onSubmit: (data: Record<string, any>) => void
}

export default function FormBuilder({
  title,
  fields,
  submitLabel = "Submit",
  backLabel = "Back",
    backPath,
  defaultValues = {},
  errors = {},
  onSubmit,
}: FormBuilderProps) {

  const [formState, setFormState] = useState(defaultValues)
  // const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchResults, setSearchResults] = useState<Record<string, any[]>>({})
  const [activeSearchField, setActiveSearchField] = useState<string | null>(null)
const navigate = useNavigate()
  // INPUT CHANGE
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, files, type } = e.target as any

    if (type === "file") {
      setFormState({
        ...formState,
        [name]: files[0],
      })
    } else {
      setFormState({
        ...formState,
        [name]: value,
      })
    }
  }

  // SELECT CHANGE
  const handleSelectChange = (name: string, value: string) => {
    setFormState({
      ...formState,
      [name]: value,
    })
  }
useEffect(() => {
  const handleClickOutside = () => {
    setActiveSearchField(null)
  }

  document.addEventListener("click", handleClickOutside)

  return () => {
    document.removeEventListener("click", handleClickOutside)
  }
}, [])
  return (
    <div className="w-full rounded-2xl border bg-white p-8 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold">{title}</h2>

      <form
        className="grid grid-cols-1 gap-6 md:grid-cols-4"
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit(formState)
        }}
      >

        {fields.map((field) => (
          <div
            // key={field.name}
            // className={`space-y-2 ${field.colSpan === 2 ? "md:col-span-2" : ""}`}
            key={field.name}
            className={`space-y-2 ${field.colSpan === 4
                ? "md:col-span-4"
                : field.colSpan === 3
                  ? "md:col-span-3"
                  : field.colSpan === 2
                    ? "md:col-span-2"
                    : "md:col-span-1"
              }`}
          >

            <Label>
              {field.label}
              {field.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>

            {/* TEXT / EMAIL / NUMBER */}
            {(!field.type || ["text", "email", "number"].includes(field.type)) && (
              <Input
                name={field.name}
                type={field.type || "text"}
                placeholder={field.placeholder}
                value={formState[field.name] || ""}
                readOnly={field.readOnly}
                disabled={field.disabled}
                onChange={handleChange}
                className="
                h-10
                rounded-lg
                border-gray-300
                focus:border-primary
                focus:ring-2
                focus:ring-primary/20
                transition-all
                duration-200
              "
              />
            )}

            {/* TEXTAREA */}
            {field.type === "textarea" && (
              <Textarea
                name={field.name}
                placeholder={field.placeholder}
                value={formState[field.name] || ""}
                onChange={handleChange}
                className="
                rounded-lg
                border-gray-300
                focus:border-primary
                focus:ring-2
                focus:ring-primary/20
                transition-all
                duration-200
                w-full

                
                
                "
              />
            )}

            {/* DATE */}
            {field.type === "date" && (
              <Input
                type="date"
                name={field.name}
                value={formState[field.name] || ""}
                // onChange={handleChange}

                onChange={(e) => {
                  handleChange(e)

                  // 🔥 call custom onChange
                  if (field.onChange) {
                    field.onChange(e, formState, setFormState)
                  }
                }}
              />
            )}

            {/* TIME */}
            {field.type === "time" && (
              <Input
                type="time"
                name={field.name}
                value={formState[field.name] || ""}
                onChange={handleChange}


              />
            )}

            {/* SELECT */}
            {field.type === "select" && (
              <Select
                value={formState[field.name] || ""}
                onValueChange={(value) =>
                  handleSelectChange(field.name, value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={field.placeholder || "Select"} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {field.type === "search-select" && (
              <div
                className="relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* INPUT */}
                <Input
                  value={formState[field.name] || ""}
                  placeholder={field.placeholder}
                  className="pr-10 cursor-pointer
                  h-10
                rounded-lg
                border-gray-300
                focus:border-primary
                focus:ring-2
                focus:ring-primary/20
                transition-all
                duration-200
                  
                  "
                  onChange={(e) => {
                    const value = e.target.value

                    setFormState({ ...formState, [field.name]: value })
                    setActiveSearchField(field.name)

                    const filtered = field.options?.filter(opt =>
                      opt.label.toLowerCase().includes(value.toLowerCase())
                    ) || []

                    setSearchResults(prev => ({
                      ...prev,
                      [field.name]: filtered
                    }))
                  }}
                  onClick={() => {
                    setActiveSearchField(field.name)

                    setSearchResults(prev => ({
                      ...prev,
                      [field.name]: field.options || []
                    }))
                  }}
                
              
                />
                {/* ❌ CLEAR BUTTON */}
                    {formState[field.name] && (
                      <X
                        className="absolute right-8 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 cursor-pointer"
                        onClick={() => {
                          setFormState({
                            ...formState,
                            [field.name]: "",
                            [`${field.name}_id`]: null
                          })

                          setSearchResults(prev => ({
                            ...prev,
                            [field.name]: []
                          }))

                          setActiveSearchField(null)
                        }}
                      />
                    )}
                {/* 🔽 DROPDOWN ICON */}
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none"
                />

                {/* DROPDOWN */}
                {activeSearchField === field.name &&
                  searchResults[field.name]?.length > 0 && (
                    <div className="absolute z-50 bg-white border w-full mt-1 max-h-40 overflow-auto rounded-md shadow">
                      {searchResults[field.name].map((item: any) => (
                        <div
                          key={item.value}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setFormState({
                              ...formState,
                              [field.name]: item.label
                            })

                            setActiveSearchField(null)

                            if (field.onSelect) {
                              field.onSelect(item, formState, setFormState)
                            }
                          }}
                        >
                          {item.label}
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            )}
            {/* {field.type === "image" && (

              <Input

                type="file"

                name={field.name}

                onChange={handleChange}

              />

            )} */}
            {field.type === "image" && (
               <>

               
              {/* //   {field.url && (
              //     <div className="w-60 h-30 border rounded-lg overflow-hidden">
              //       <img
              //         src={field.url}
              //         alt={field.alt || "Preview"}
              //         className="w-full h-full object-cover"
              //       />
              //     </div>
              //   )} */}

{/*                
                <Input
                  type="file"
                  name={field.name}
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return

                    // preview new image instantly
                    const previewUrl = URL.createObjectURL(file)

                    handleChange({
                      target: {
                        name: field.name,
                        value: file
                      }
                    } as any)

                    
                    field.url = previewUrl
                  }}
                /> */}
              </>

            )}


{/* new image input with preview and delete option */}
{field.type === "image" && (
  <div className="space-y-3">

    
    {field.url && (
      <div className="relative w-full h-40 group">
        <img
          src={field.url}
          alt={field.alt || "Preview"}
          className="w-full h-full object-cover rounded-md"
        />

        
      </div>

    )} 
   
      <Label className="cursor-pointer flex flex-col items-center justify-center w-full h-12 border-2 border-dashed rounded-lg hover:bg-muted transition">
        <UploadCloud className="h-8 w-8 text-muted-foreground" />
        <span className="text-xs mt-2">Click to Upload</span>

        <Input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const previewUrl = URL.createObjectURL(file);

            // update form state
            handleChange({
              target: {
                name: field.name,
                value: file,
              }
            } as any);

            // update preview
            field.url = previewUrl;
          }}
        />
      </Label>
   
  </div>
)}


            {/* SEARCH FIELD */}
            {field.type === "search" && (
              <div className="relative">
                <Input
                  name={field.name}
                  placeholder={field.placeholder || "Search..."}
                  value={formState[field.name] || ""}
                  onChange={async (e) => {
                    const value = e.target.value
                    setFormState({ ...formState, [field.name]: value })
                    setActiveSearchField(field.name)

                    if (field.onSearch && value.length >= 2) {
                      const results = await field.onSearch(value)
                      setSearchResults(results || [])
                    } else {
                      setSearchResults([])
                    }
                  }}
                />

                {activeSearchField === field.name &&
                  searchResults.length > 0 && (
                    <div className="absolute z-50 w-full bg-white border rounded shadow mt-1 max-h-48 overflow-auto">
                      {searchResults.map((item: any) => (
                        <div
                          key={item.id}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setFormState({
                              ...formState,
                              [field.name]: item.name,
                              devotee_id: item.id,
                            })

                            setSearchResults([])
                            setActiveSearchField(null)

                            if (field.onSelect) {
                              field.onSelect(item, formState, setFormState)
                            }
                          }}
                        >
                          {item.name} - {item.phone}
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            )}
{/* CHECKBOX */}
{field.type === "checkbox" && (
  <div className="flex items-center gap-2">
    <input
      type="checkbox"
      name={field.name}
      checked={formState[field.name] || false}
      disabled={field.disabled}
      onChange={(e) => {
        setFormState({
          ...formState,
          [field.name]: e.target.checked,
        });
      }}
      className="h-4 w-4"
    />
    <span className="text-sm">{field.label}</span>
  </div>
)}
            {/* ERROR */}
            {errors[field.name] && (
              <p className="text-red-500 text-sm">
                {errors[field.name]}
              </p>
            )}
          </div>
        ))}

        <div className="flex justify-end md:col-span-2 gap-2">
          <Button type="submit">{submitLabel}</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setFormState(defaultValues)}
          >
            Reset
          </Button>
         <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (backPath) {
              navigate(backPath)
            } else {
              navigate(-1) // fallback
            }
          }}
        >
          {backLabel}
        </Button>
        </div>

      </form>
    </div>
  )
}




















