import { FileText, CheckCircle, AlertCircle, Briefcase, GraduationCap, Award, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ResumeAnalysisProps {
  analysis: {
    profileSummary: string
    keySkills: string[]
    experienceHighlights: string[]
    education: string[]
    strengths: string[]
    areasForImprovement: string[]
    suggestedCareerPaths: string[]
    recommendedSkills: string[]
    recommendedCertifications: string[]
  }
  fileName: string
}

export default function ResumeAnalysis({ analysis, fileName }: ResumeAnalysisProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 p-4 border rounded-lg bg-muted">
        <FileText className="w-5 h-5 text-primary" />
        <span className="font-medium">{fileName}</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{analysis.profileSummary}</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            <CardTitle>Key Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis.keySkills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            <CardTitle>Experience Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="pl-6 space-y-2 list-disc">
              {analysis.experienceHighlights.map((highlight, index) => (
                <li key={index}>{highlight}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary" />
          <CardTitle>Education</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="pl-6 space-y-2 list-disc">
            {analysis.education.map((edu, index) => (
              <li key={index}>{edu}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <CardTitle>Strengths</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="pl-6 space-y-2 list-disc">
              {analysis.strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <CardTitle>Areas for Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="pl-6 space-y-2 list-disc">
              {analysis.areasForImprovement.map((area, index) => (
                <li key={index}>{area}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Career Guidance</CardTitle>
          <CardDescription>
            Based on your resume, here are some recommendations for your career development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-lg font-medium">Suggested Career Paths</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {analysis.suggestedCareerPaths.map((path, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                    <ArrowUpRight className="w-4 h-4 text-primary" />
                    <span>{path}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-medium">Recommended Skills to Develop</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.recommendedSkills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="px-3 py-1">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-medium">Recommended Certifications</h3>
              <ul className="pl-6 space-y-2 list-disc">
                {analysis.recommendedCertifications.map((cert, index) => (
                  <li key={index}>{cert}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

