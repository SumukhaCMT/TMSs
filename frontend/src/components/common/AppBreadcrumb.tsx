import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb"
import { Link } from "react-router-dom"

type Crumb = {
  label: string
  to?: string
}

type AppBreadcrumbProps = {
  items: Crumb[]
}

export default function AppBreadcrumb({ items }: AppBreadcrumbProps) {
  return (
    <div className="mb-4">
      <Breadcrumb>
        <BreadcrumbList>
          {items.map((item, index) => (
            <span key={index} className="flex items-center">
              <BreadcrumbItem>
                {item.to ? (
                  <BreadcrumbLink asChild>
                    <Link to={item.to}>{item.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>

              {index < items.length - 1 && (
                <BreadcrumbSeparator />
              )}
            </span>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}
