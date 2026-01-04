## comandos 
npm run dev
npx drizzle-kit studio

## Setup do projeto:

-[x] Inicialização do projeto Next.js
-[x] Configuração de ferrramentas (ESlint, Prettier, Tailwind)
-[x] Configuração do Drizzle e banco de dados
-[x] Configuração do shadcn/ui

## Autenticação  e Configurações do Estabelecimento

-[x] Tela de login e criação de conta 
-[x] Login com e-mail e senha
-[x] login com o google
-[x] Fundamentos do Next.js (Rotas, Páginas, Layouts)
-[x] Criação de clinica

### Configuração do Google OAuth

Para configurar o login com Google, você precisa:

1. **Criar um projeto no Google Cloud Console**:
   - Acesse https://console.cloud.google.com/
   - Crie um novo projeto ou selecione um existente
   - Ative a API "Google+ API" ou "Google Identity"

2. **Criar credenciais OAuth 2.0**:
   - Vá em "APIs & Services" > "Credentials"
   - Clique em "Create Credentials" > "OAuth client ID"
   - Selecione "Web application"
   - Adicione as URLs de redirecionamento autorizadas:
     - Para desenvolvimento: `http://localhost:3000/api/auth/callback/google`
     - Para produção: `https://seu-dominio.com/api/auth/callback/google`

3. **Configurar variáveis de ambiente**:
   - Adicione no arquivo `.env.local`:
     ```
     GOOGLE_CLIENT_ID=seu-client-id-aqui
     GOOGLE_CLIENT_SECRET=seu-client-secret-aqui
     BETTER_AUTH_URL=http://localhost:3000  # Para desenvolvimento
     # BETTER_AUTH_URL=https://seu-dominio.com  # Para produção
     ```

4. **Importante**: Certifique-se de que a URL de redirecionamento no Google Cloud Console corresponda exatamente à URL configurada no `BETTER_AUTH_URL` + `/api/auth/callback/google`

## Gerenciamento de Profissionais e Disponibilidade

-[x] Sidebar e Route Groups
-[x] Página de médicos
-[x] Proteger página de médicos (autenticação)
-[x] Criação de médicos & NextSafeAction
-[x] Listagem de médicos
-[x] Atualização de médicos
-[x] Deleção de médicos

## Gerenciamento de Pacientes e Agendamentos
-[] Criação de pacientes
-[] Edição de pacientes
-[] Listagem de pacientes
-[] Deleção de pacientes
-[] Criação de agendamentos
-[] Listagem de agendamentos
-[] Deleção de agendamentos