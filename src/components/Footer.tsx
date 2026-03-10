export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-12 border-t border-border px-4 pb-8 pt-6 text-muted-foreground">
      <div className="page-wrap flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <p className="m-0 text-sm">
          &copy; {year} রমজান আমল ট্র্যাকার. রমজান ২১–৩০, ১৪৪৭ হিজরি
        </p>
        <p className="m-0 text-xs">শেষ দশ রাতের আমল ট্র্যাক করুন</p>
      </div>
    </footer>
  )
}
