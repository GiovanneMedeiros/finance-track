export function AppShell({ sidebar, header, children }) {
  return (
    <div className="min-h-screen bg-white/40 px-4 py-4 text-slate-950 transition-colors duration-300 dark:bg-transparent dark:text-white lg:px-5 lg:py-5">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1480px] flex-col gap-4 lg:min-h-[calc(100vh-2.5rem)] lg:flex-row lg:gap-5">
        {sidebar}

        <div className="flex min-w-0 flex-1 flex-col gap-4 lg:gap-5">
          {header}
          <main className="flex-1 transition-colors duration-300">{children}</main>
        </div>
      </div>
    </div>
  )
}