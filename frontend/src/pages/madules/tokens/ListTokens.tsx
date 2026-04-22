import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchTokens } from "@/features/tokens/tokensThunks"
import { useNavigate } from "react-router-dom"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ListToken() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { tokens } = useAppSelector((state) => state.tokens)

  useEffect(() => {
    dispatch(fetchTokens())
   
  }, [dispatch])

  return (
    <div className="space-y-6">

      {/* GRID CARDS */}
      <div className="grid gap-1 md:grid-cols-3 lg:grid-cols-8">
        {tokens?.map((token: any) => (
          <Card key={token.id} className="hover:shadow-lg transition">

            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">
                {token.token_name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Total Issued: {token.quantity || 0}
              </p>
              <p className="text-sm text-muted-foreground">
                Code: {token.token_code}
              </p>
               <p className="text-sm text-muted-foreground">
                deity name: {token.deity_name}
              </p>
               <p className="text-sm text-muted-foreground">
                Seva name: {token.seva_name}
              </p>
              <p className="text-sm text-muted-foreground">
                Seva Amount: {token.seva_amount}
              </p>
            </CardHeader>

            <CardContent className="space-y-2 text-sm">
              {/* <p><strong>Display Order:</strong> {token.display_order}</p> */}
              {/* <p>
                <strong>Status:</strong>{" "}
                <span
                  className={
                    token.status === "active"
                      ? "text-green-600"
                      : "text-red-500"
                  }
                >
                  {token.status}
                </span>
              </p> */}

              {/* ACTIONS */}
              <div className="flex gap-2 pt-3">
                <Button
                  size="sm"
                  onClick={() => navigate(`/tokens/${token.id}/print`)}
                >
                  Print
                </Button>

                {/* <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/tokens/${token.id}/edit`)}
                >
                  Edit
                </Button> */}
              </div>
            </CardContent>

          </Card>
        ))}
      </div>

    </div>
  )
}