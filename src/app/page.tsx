import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white scroll-smooth">
      {/* NAVBAR */}
      <header className="border-b border-slate-800 bg-slate-950/90">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight"
          >
            Test <span className="text-blue-500">Platform</span>
          </Link>

          <div className="flex items-center gap-6">
  <a
    href="#features"
    className="hidden md:block text-sm text-slate-300 hover:text-white transition"
  >
    Features
  </a>

  <a
    href="#analytics"
    className="hidden md:block text-sm text-slate-300 hover:text-white transition"
  >
    Analytics
  </a>

  <a
    href="#students"
    className="hidden md:block text-sm text-slate-300 hover:text-white transition"
  >
    Students
  </a>

  <a
    href="#get-started"
    className="hidden md:block text-sm text-slate-300 hover:text-white transition"
  >
    Get Started
  </a>

  <Link
    href="/login"
    className="rounded-xl bg-blue-600 px-5 py-2.5 font-semibold hover:bg-blue-700 transition"
  >
    Login
  </Link>
</div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-300 mb-8">
              🎯 Smart Testing & Performance Analytics
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
              Turn Tests Into
              <span className="text-blue-500"> Student Insights.</span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg md:text-xl leading-8 text-slate-400">
              Create and conduct tests, manage students and batches,
              and understand exactly where students are struggling —
              from individual questions to topics and subjects.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/login"
                className="rounded-2xl bg-blue-600 px-8 py-4 text-center text-lg font-bold hover:bg-blue-700 transition"
              >
                🏫 Institute Login
              </Link>

              <Link
                href="/student/login"
                className="rounded-2xl border border-slate-700 bg-slate-900 px-8 py-4 text-center text-lg font-bold hover:bg-slate-800 transition"
              >
                👨‍🎓 Student Login
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        <div className="absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
      </section>

      {/* INSTITUTE FEATURES */}
      <section
  id="features"
  className="scroll-mt-24 border-y border-slate-800 bg-slate-900/40"
>
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-2xl mb-12">
            <p className="text-blue-400 font-semibold mb-3">
              FOR INSTITUTES
            </p>

            <h2 className="text-3xl md:text-4xl font-bold">
              Everything needed to run smarter assessments.
            </h2>

            <p className="mt-4 text-slate-400">
              From question creation to post-test analysis, keep the
              complete assessment workflow in one place.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon="📝"
              title="Create Tests"
              description="Build tests and organize questions into sections, subjects and topics."
            />

            <FeatureCard
              icon="📥"
              title="Import Questions"
              description="Import questions through Excel or use AI-powered PDF extraction."
            />

            <FeatureCard
              icon="👥"
              title="Manage Students"
              description="Organize students into batches and assign tests to the right learners."
            />

            <FeatureCard
              icon="📊"
              title="Performance Analytics"
              description="Understand accuracy, timing, skipped questions, topics and student risk."
            />
          </div>
        </div>
      </section>

      {/* ANALYTICS */}
      <section
  id="analytics"
  className="scroll-mt-24 max-w-7xl mx-auto px-6 py-24"
>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-purple-400 font-semibold mb-3">
              ACTIONABLE ANALYTICS
            </p>

            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Don&apos;t just know the score.
              <span className="text-blue-500">
                {" "}
                Know why.
              </span>
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-400">
              Go beyond marks and percentages. Identify difficult
              questions, weak topics, time-management problems and
              students who need additional attention.
            </p>

            <div className="mt-8 space-y-5">
              <Insight
                icon="🔥"
                title="Question Intelligence"
                text="Find difficult, slow and frequently skipped questions."
              />

              <Insight
                icon="📚"
                title="Topic & Subject Analysis"
                text="See exactly where students need more practice."
              />

              <Insight
                icon="🚨"
                title="Student Risk"
                text="Identify students who need attention before performance gets worse."
              />
            </div>
          </div>

          {/* ANALYTICS PREVIEW */}
          <div className="rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-slate-400">
                  Institute Analytics
                </p>

                <h3 className="text-xl font-bold mt-1">
                  Performance Overview
                </h3>
              </div>

              <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
                Analytics Preview
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <StatCard
                label="Tests Conducted"
                value="24"
              />

              <StatCard
                label="Student Attempts"
                value="1,248"
              />

              <StatCard
                label="Average Accuracy"
                value="72.4%"
              />

              <StatCard
                label="Questions Analyzed"
                value="8,640"
              />
            </div>

            <div className="mt-4 rounded-2xl bg-slate-800 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">
                    Most Challenging Topic
                  </p>

                  <p className="mt-2 font-semibold">
                    Cell Biology
                  </p>
                </div>

                <span className="text-red-400 font-bold">
                  58%
                </span>
              </div>

              <div className="mt-4 h-2 rounded-full bg-slate-700 overflow-hidden">
                <div className="h-full w-[58%] bg-red-500 rounded-full" />
              </div>

              <div className="mt-3 flex justify-between text-xs text-slate-500">
                <span>Accuracy</span>
                <span>Needs attention</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STUDENT EXPERIENCE */}
      <section
  id="students"
  className="scroll-mt-24 bg-slate-900/50 border-y border-slate-800"
>
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-2xl mb-12">
            <p className="text-blue-400 font-semibold mb-3">
              FOR STUDENTS
            </p>

            <h2 className="text-3xl md:text-4xl font-bold">
              A simple testing experience.
            </h2>

            <p className="mt-4 text-slate-400">
              Students focus on taking the test while the platform
              captures the performance data institutes need.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <StudentFeature
              icon="📋"
              title="Take Assigned Tests"
              text="Students see the tests assigned to them and complete assessments online."
            />

            <StudentFeature
              icon="📈"
              title="View Results"
              text="Get immediate results with score, accuracy, correct, wrong and skipped answers."
            />

            <StudentFeature
              icon="🎯"
              title="Track Performance"
              text="Use performance data to understand strengths and areas that need improvement."
            />
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section
  id="get-started"
  className="scroll-mt-24 max-w-5xl mx-auto px-6 py-24 text-center"
>
        <h2 className="text-4xl md:text-5xl font-bold">
          Ready to run your next test?
        </h2>

        <p className="mt-5 text-lg text-slate-400">
          Create assessments, assign them to students, and turn
          results into actionable insights.
        </p>

        <Link
          href="/login"
          className="inline-block mt-8 rounded-2xl bg-blue-600 px-10 py-4 text-lg font-bold hover:bg-blue-700 transition"
        >
          Get Started
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} TestPlatform
          </p>

          <p className="text-slate-600 text-sm">
            Smarter assessments. Better insights.
          </p>
        </div>
      </footer>
    </main>
  );
}

/* --------------------------------------------------
   FEATURE CARD
-------------------------------------------------- */

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 hover:border-slate-700 transition">
      <div className="text-3xl mb-5">
        {icon}
      </div>

      <h3 className="text-xl font-bold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-slate-400">
        {description}
      </p>
    </div>
  );
}

/* --------------------------------------------------
   INSIGHT
-------------------------------------------------- */

function Insight({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="text-2xl">
        {icon}
      </div>

      <div>
        <h3 className="font-bold">
          {title}
        </h3>

        <p className="mt-1 text-sm text-slate-400">
          {text}
        </p>
      </div>
    </div>
  );
}

/* --------------------------------------------------
   STAT CARD
-------------------------------------------------- */

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-800 p-5">
      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>
    </div>
  );
}

/* --------------------------------------------------
   STUDENT FEATURE
-------------------------------------------------- */

function StudentFeature({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-7">
      <div className="text-3xl">
        {icon}
      </div>

      <h3 className="mt-5 text-xl font-bold">
        {title}
      </h3>

      <p className="mt-3 text-slate-400 leading-7">
        {text}
      </p>
    </div>
  );
}