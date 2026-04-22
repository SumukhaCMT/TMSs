
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type Field = {
  name: string;
  label: string;
  type?: "text" | "email" | "number" | "select" | "textarea" | "image" | "date" | "time" | "search" | "hidden";
  placeholder?: string;
  colSpan?: number;
  value?: string;
  options?: { label: string; value: string }[];
  required?: boolean;
  onSearch?: (value: string) => Promise<any[]>;
  onSelect?: (item: any, formState: any, setFormState: (data: any) => void) => void;
};

type FormBuilderProps = {
  title: string;
  fields: Field[];
  submitLabel?: string;
  defaultValues?: Record<string, any>;
  errors?: Record<string, string>;
  onSubmit: (data: Record<string, any>) => void;
};

export default function FormBuilder({
  title,
  fields,
  submitLabel = "Submit",
  defaultValues = {},
  errors = {},
  onSubmit,
}: FormBuilderProps) {
  const [formState, setFormState] = useState(defaultValues);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [activeSearchField, setActiveSearchField] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files, type } = e.target as any;
    setFormState({ ...formState, [name]: type === "file" ? files[0] : value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormState({ ...formState, [name]: value });
  };

  const handleSearchSelect = (field: Field, item: any) => {
    if (field.onSelect) {
      field.onSelect(item, formState, setFormState);
    }

    // Update search input display
    const displayValue = item.name || item.seva_name || "";
    setFormState((prev) => ({ ...prev, [field.name]: displayValue }));

    setSearchResults([]);
    setActiveSearchField(null);
  };

  const handleReset = () => {
    setFormState(defaultValues);
    setSearchResults([]);
    setActiveSearchField(null);
  };

  return (
    <div className="max-w-3xl rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold">{title}</h2>

      <form
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(formState);
        }}
      >
        {fields.map((field) => (
          <div key={field.name} className={`space-y-2 ${field.colSpan === 2 ? "md:col-span-2" : ""}`}>
            <Label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>

            {/* Basic input types */}
            {(!field.type || ["text", "email", "number"].includes(field.type)) && (
              <Input
                name={field.name}
                type={field.type || "text"}
                placeholder={field.placeholder}
                value={formState[field.name] || ""}
                onChange={handleChange}
              />
            )}

            {field.type === "textarea" && (
              <Textarea name={field.name} placeholder={field.placeholder} value={formState[field.name] || ""} onChange={handleChange} />
            )}

            {field.type === "date" && <Input type="date" name={field.name} value={formState[field.name] || ""} onChange={handleChange} />}
            {field.type === "time" && <Input type="time" name={field.name} value={formState[field.name] || ""} onChange={handleChange} />}
            {field.type === "image" && <Input type="file" name={field.name} onChange={handleChange} />}

            {/* Select */}
            {field.type === "select" && (
              <Select value={formState[field.name] || ""} onValueChange={(value) => handleSelectChange(field.name, value)}>
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

            {/* Search */}
            {field.type === "search" && (
              <div className="relative">
                <Input
                  name={field.name}
                  placeholder={field.placeholder || "Search..."}
                  value={formState[field.name] || ""}
                  onChange={async (e) => {
                    const value = e.target.value;
                    setFormState({ ...formState, [field.name]: value });
                    setActiveSearchField(field.name);

                    if (field.onSearch && value.length >= 2) {
                      const results = await field.onSearch(value);
                      setSearchResults(results || []);
                    } else {
                      setSearchResults([]);
                    }
                  }}
                />
                {activeSearchField === field.name && searchResults.length > 0 && (
                  <div className="absolute z-50 w-full bg-white border rounded shadow mt-1 max-h-48 overflow-auto">
                    {searchResults.map((item: any) => (
                      <div key={item.id} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleSearchSelect(field, item)}>
                        {item.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Errors */}
            {errors[field.name] && <p className="text-red-500 text-sm">{errors[field.name]}</p>}
          </div>
        ))}

        <div className="flex justify-end md:col-span-2 gap-2">
          <Button type="submit">{submitLabel}</Button>
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
}