import clsx from 'clsx'

export function Card({ className, children, strong = false }) {
  return (
    <section className={clsx(strong ? 'panel-strong' : 'panel', className)}>
      {children}
    </section>
  )
}