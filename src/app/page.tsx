import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FeatureCard } from "@/components/FeatureCard";
import { Button } from "@/components/ui/button";
import { FileUploadSection } from "@/components/upload/FileUploadSection";
import { ClientOnly } from "@/components/ClientOnly";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-[980px] text-center">
              <h1 className="text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1]">
                Transform Your Resume for ATS Success
              </h1>
              <p className="mx-auto mt-6 max-w-[750px] text-lg text-muted-foreground sm:text-xl">
                Instantly convert any resume into an ATS-friendly format. 
                <strong className="text-foreground"> Your data never leaves your browser.</strong>
              </p>
              <div className="mt-6 mx-auto max-w-[600px]">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                  <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>100% Private • No Registration • Instant Processing</span>
                </div>
              </div>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6">
                  Upload Your Resume
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6">
                  Learn How It Works
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* File Upload Section */}
        <ClientOnly fallback={
          <section className="w-full px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="mx-auto max-w-7xl">
              <div className="mx-auto max-w-4xl">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl mb-4">
                    Get Started - Upload Your Resume
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Transform your resume in seconds. Your document stays private and secure in your browser.
                  </p>
                </div>
                <div className="text-center py-16">
                  <div className="animate-pulse">Loading upload interface...</div>
                </div>
              </div>
            </div>
          </section>
        }>
          <FileUploadSection />
        </ClientOnly>

        {/* Problem/Solution Section */}
        <section className="w-full px-4 sm:px-6 lg:px-8 py-16 bg-muted/30">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-[980px]">
              <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl mb-8 text-center">
                Why Your Resume Gets Rejected
              </h2>
              <div className="grid gap-8 md:grid-cols-2 items-center">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-destructive">The Problem</h3>
                    <p className="text-muted-foreground">
                      Over <strong>98% of Fortune 500 companies</strong> use Applicant Tracking Systems (ATS) 
                      to screen resumes. These systems can&apos;t read creative layouts, custom fonts, or complex formatting.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="w-2 h-2 bg-destructive rounded-full"></span>
                        <span>75% of resumes never reach human eyes</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="w-2 h-2 bg-destructive rounded-full"></span>
                        <span>Multi-column layouts confuse ATS parsers</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="w-2 h-2 bg-destructive rounded-full"></span>
                        <span>Graphics and tables cause parsing errors</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-primary">The Solution</h3>
                    <p className="text-muted-foreground">
                      ClarityCV instantly transforms your resume into a clean, single-column format 
                      that ATS systems can read perfectly. No more missed opportunities.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                        <span>Single-column layout for perfect parsing</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                        <span>Standard fonts and formatting</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                        <span>ATS-friendly section headers</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-12 text-center">
                <div className="inline-flex items-center gap-4 bg-primary/10 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">Sara</div>
                    <div className="text-sm text-muted-foreground">Marketing Manager</div>
                  </div>
                  <div className="text-left max-w-md text-sm text-muted-foreground">
                    &quot;I had a beautiful creative resume but rarely heard back from applications. 
                    ClarityCV helped me create an ATS-friendly version and I started getting interviews!&quot;
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full px-4 sm:px-6 lg:px-8 py-16">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-[980px]">
              <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl mb-8 text-center">
                Why Choose ClarityCV?
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <FeatureCard
                  title="100% Private"
                  description="Your resume data never leaves your browser. No uploads to servers, no data storage, no tracking."
                  icon={
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                    </svg>
                  }
                />
                <FeatureCard
                  title="Instant Processing"
                  description="Upload your resume and get an ATS-optimized version in seconds. No waiting, no queues."
                  icon={
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18z"/>
                    </svg>
                  }
                />
                <FeatureCard
                  title="Multiple Formats"
                  description="Download your optimized resume in both .docx and .txt formats for maximum compatibility."
                  icon={
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                    </svg>
                  }
                />
                <FeatureCard
                  title="ATS Optimized"
                  description="Follows industry best practices for ATS compatibility: single-column, standard fonts, clean formatting."
                  icon={
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  }
                />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full px-4 sm:px-6 lg:px-8 py-16 bg-muted/20">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-[980px]">
              <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl mb-8 text-center">
                How It Works
              </h2>
              <div className="grid gap-8 md:grid-cols-3">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">1</span>
                  </div>
                  <h3 className="text-xl font-semibold">Upload</h3>
                  <p className="text-muted-foreground text-sm">
                    Drag and drop your resume (.pdf or .docx) or click to browse. 
                    Your file stays in your browser - never uploaded to servers.
                  </p>
                </div>
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">2</span>
                  </div>
                  <h3 className="text-xl font-semibold">Process</h3>
                  <p className="text-muted-foreground text-sm">
                    Our ATS optimization engine converts your resume to a clean, single-column format 
                    while preserving all your important information.
                  </p>
                </div>
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">3</span>
                  </div>
                  <h3 className="text-xl font-semibold">Download</h3>
                  <p className="text-muted-foreground text-sm">
                    Review your optimized resume in our editor, make any tweaks, 
                    then download in .docx or .txt format. Ready for applications!
                  </p>
                </div>
              </div>
              <div className="mt-12 text-center">
                <Button size="lg" className="text-lg px-8 py-6">
                  Start Converting Your Resume
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Status Section */}
        <section className="w-full px-4 sm:px-6 lg:px-8 py-16">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-[980px] text-center">
              <h2 className="text-2xl font-bold mb-6">Development Status</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  ClarityCV is currently in active development. The foundation is complete with 
                  modern UI components and responsive design.
                </p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                  <div className="space-y-2">
                    <div className="text-green-500 font-medium">✅ Completed</div>
                    <div className="text-muted-foreground">
                      • Next.js Foundation<br/>
                      • UI Components<br/>
                      • Theme System<br/>
                      • Responsive Design
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-blue-500 font-medium">🔄 In Progress</div>
                    <div className="text-muted-foreground">
                      • Landing Page<br/>
                      • Branding Update<br/>
                      • User Experience<br/>
                      • Content Optimization
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-orange-500 font-medium">⏳ Coming Next</div>
                    <div className="text-muted-foreground">
                      • File Upload System<br/>
                      • PDF/DOCX Parsing<br/>
                      • ATS Optimization<br/>
                      • Resume Editor
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-purple-500 font-medium">🎯 Future</div>
                    <div className="text-muted-foreground">
                      • Document Export<br/>
                      • Advanced Features<br/>
                      • Testing & QA<br/>
                      • Production Launch
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}