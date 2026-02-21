import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to Shadcn UI</CardTitle>
          <CardDescription>
            This card demonstrates shadcn/ui components with Tailwind CSS.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            If you can see this styled card and button, shadcn/ui is working properly!
          </p>
          <Button className="w-full">Click Me</Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default App