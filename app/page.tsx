import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { FileUpload } from "@/components/file-upload"
import { OutputGenerator } from "@/components/output-generator"
import { TournamentGrouping } from "@/components/tournament-grouping"
import { StatsOverview } from "@/components/stats-overview"
import { WorkflowSteps } from "@/components/workflow-steps"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">ESports Team Analyzer</h1>
          <p className="text-xl text-purple-200 max-w-3xl mx-auto mb-8">
            Upload team data, generate groups, and manage your esports tournaments with ease. Perfect for tournament
            organizers and esports communities.
          </p>
          <StatsOverview />
        </div>

        <WorkflowSteps />

        <div id="upload" className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Upload Team Data</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Start by uploading your CSV or TXT files containing team information. Our system will automatically parse
              and organize your data.
            </p>
          </div>
          <FileUpload />
        </div>

        <div id="grouping" className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Tournament Grouping</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Organize your teams into balanced groups for tournament brackets. Choose the number of groups and
              distribution method.
            </p>
          </div>
          <TournamentGrouping />
        </div>

        <div id="generate" className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Generate Output Blocks</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Create formatted team lists, email collections, and tabular mappings ready for tournament organization and
              communication.
            </p>
          </div>
          <OutputGenerator />
        </div>
      </main>

      <Footer />
    </div>
  )
}
