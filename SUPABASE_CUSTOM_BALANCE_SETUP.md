# Setup Supabase - Custom Balance

Para que o saldo customizado seja salvo no Supabase (e não no local storage), execute este comando no SQL Editor do Supabase:

```sql
ALTER TABLE profiles
ADD COLUMN custom_balance DECIMAL(12, 2) DEFAULT NULL;
```

Após executar isso, o saldo que você editar será persistido no Supabase e sincronizado entre dispositivos.
