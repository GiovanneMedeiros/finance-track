# Setup Supabase - Tabela de Cartões (Step 2)

A tabela `cards` já foi criada. Agora execute apenas as políticas de segurança no **SQL Editor** do Supabase:

```sql
-- Habilitar Row Level Security
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Users can view their own cards"
  ON cards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cards"
  ON cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cards"
  ON cards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cards"
  ON cards FOR DELETE
  USING (auth.uid() = user_id);
```

Após executar isso, a tabela de cartões estará totalmente configurada!
