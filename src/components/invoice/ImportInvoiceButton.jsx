import { FileUp } from 'lucide-react'

import { Button } from '@/components/ui/Button'

export function ImportInvoiceButton({ onClick }) {
  return (
    <Button variant="secondary" onClick={onClick}>
      <FileUp size={16} />
      Importar fatura
    </Button>
  )
}
