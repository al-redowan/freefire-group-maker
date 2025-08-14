import { Upload, FileSearch, Users, Download } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function WorkflowSteps() {
  const steps = [
    {
      icon: Upload,
      title: "Upload Files",
      description: "Upload CSV or TXT files containing team names, emails, and usernames",
      color: "text-blue-400",
    },
    {
      icon: FileSearch,
      title: "Parse & Validate",
      description: "Automatic parsing with smart column detection and data deduplication",
      color: "text-green-400",
    },
    {
      icon: Users,
      title: "Generate Groups",
      description: "Create formatted team lists, email lists, and tabular mappings",
      color: "text-purple-400",
    },
    {
      icon: Download,
      title: "Export Results",
      description: "Download formatted outputs or manage data through admin panel",
      color: "text-orange-400",
    },
  ]

  return (
    <div className="mb-16">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">How It Works</h2>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Simple 4-step process to transform your team data into organized tournament groups
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, index) => (
          <Card key={index} className="bg-slate-800/30 border-purple-500/20 relative">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <step.icon className={`w-6 h-6 ${step.color}`} />
              </div>
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {index + 1}
              </div>
              <CardTitle className="text-white text-lg">{step.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-300 text-center text-sm">{step.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
