import clsx from 'clsx'

export function DataTable({ columns, data, rowKey, className }) {
  return (
    <div className={clsx('overflow-hidden rounded-3xl border border-slate-900/10 bg-slate-950/[0.03] dark:border-white/10 dark:bg-white/[0.04]', className)}>
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-slate-900/5 text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:bg-white/5 dark:text-slate-400">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 font-semibold">{column.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={rowKey(item)} className="border-t border-slate-900/10 transition hover:bg-slate-900/[0.04] dark:border-white/10 dark:hover:bg-white/[0.04]">
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 align-top text-[14px] text-slate-950 dark:text-white">
                  {column.render ? column.render(item) : item[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
