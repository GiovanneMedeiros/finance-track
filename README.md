# FinanceTrack

Base de um sistema de controle financeiro pessoal com React + Vite, Tailwind CSS e dashboard dark mode com persistencia local.

## Stack

- React 19
- Vite 8
- Tailwind CSS 4
- Recharts
- localStorage para persistencia

## Scripts

- `npm run dev`: ambiente local
- `npm run build`: build de producao
- `npm run preview`: preview do build
- `npm run lint`: lint do projeto

## Estrutura

```text
src/
	app/
	components/
		dashboard/
		layout/
		ui/
	constants/
	data/
	hooks/
	pages/
	services/
	utils/
```

## Funcionalidades iniciais

- Dashboard com saldo atual, receitas e despesas
- Cadastro e remocao de transacoes
- Persistencia automatica em localStorage
- Filtro por categoria
- Grafico de receitas vs despesas
- Layout responsivo com sidebar, header e conteudo principal

## Como rodar

```bash
npm install
npm run dev
```
