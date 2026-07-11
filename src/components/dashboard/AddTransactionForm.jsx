import { useEffect, useState } from 'react'

import { CATEGORIES } from '@/constants/categories'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const categoryOptions = CATEGORIES.map((category) => ({
  value: category,
  label: category,
}))

const typeOptions = [
  { value: 'income', label: 'Receita' },
  { value: 'expense', label: 'Despesa' },
]

const getInitialValues = () => ({
  title: '',
  amount: '',
  type: 'income',
  category: CATEGORIES[0],
  date: new Date().toISOString().slice(0, 10),
})

export function AddTransactionForm({ onSubmit, onCancel, initialValues }) {
  const [values, setValues] = useState(() => ({
    ...getInitialValues(),
    ...initialValues,
    amount: initialValues?.amount != null ? String(initialValues.amount) : '',
  }))
  const [errors, setErrors] = useState({})

  const updateField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  useEffect(() => {
    if (!initialValues) {
      setValues(getInitialValues())
      return
    }

    setValues({
      ...getInitialValues(),
      ...initialValues,
      amount: initialValues.amount != null ? String(initialValues.amount) : '',
    })
  }, [initialValues])

  const handleSubmit = (event) => {
    event.preventDefault()

    const nextErrors = {}

    if (!values.title.trim()) {
      nextErrors.title = 'Informe uma descricao.'
    }

    if (!values.amount || Number(values.amount) <= 0) {
      nextErrors.amount = 'Digite um valor maior que zero.'
    }

    if (!values.date) {
      nextErrors.date = 'Selecione a data da transacao.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    onSubmit({
      ...values,
      title: values.title.trim(),
      amount: Number(values.amount),
    })

    setValues(getInitialValues())
    setErrors({})
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Input
        label="Descricao"
        placeholder="Ex.: Salario, Aluguel, Uber"
        value={values.title}
        error={errors.title}
        onChange={(event) => updateField('title', event.target.value)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Valor"
          type="number"
          min="0"
          step="0.01"
          placeholder="0,00"
          value={values.amount}
          error={errors.amount}
          onChange={(event) => updateField('amount', event.target.value)}
        />
        <Input
          label="Tipo"
          as="select"
          value={values.type}
          options={typeOptions}
          onChange={(event) => updateField('type', event.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Categoria"
          as="select"
          value={values.category}
          options={categoryOptions}
          onChange={(event) => updateField('category', event.target.value)}
        />
        <Input
          label="Data"
          type="date"
          value={values.date}
          error={errors.date}
          onChange={(event) => updateField('date', event.target.value)}
        />
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Salvar transacao</Button>
      </div>
    </form>
  )
}