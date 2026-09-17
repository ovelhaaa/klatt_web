# Configuração do GitHub Pages

## Passo a Passo para Configurar o Deploy

### 1. Configurar o Repositório

1. Acesse seu repositório no GitHub
2. Vá para **Settings** (Configurações)
3. No menu lateral esquerdo, clique em **Pages**
4. Em **Source**, selecione **GitHub Actions**

### 2. Verificar o Workflow

O arquivo `.github/workflows/deploy.yml` já está configurado. Ele será executado automaticamente quando você fizer push para as branches `main` ou `master`.

### 3. Fazer Primeiro Deploy

```bash
# Certifique-se de estar na branch main ou master
git checkout main

# Commit e push
git add .
git commit -m "Configure GitHub Pages deployment"
git push origin main
```

### 4. Verificar o Deploy

1. Vá para a aba **Actions** no seu repositório
2. Você verá o workflow "Deploy to GitHub Pages" sendo executado
3. Aguarde a conclusão (geralmente 1-2 minutos)
4. Após o sucesso, o URL do seu site será exibido

### 5. Acessar o Site

Seu site estará disponível em:
```
https://<seu-usuario>.github.io/<nome-do-repositorio>/
```

## Configurações Avançadas

### Deploy Manual

Você pode executar o workflow manualmente:

1. Vá para **Actions** → **Deploy to GitHub Pages**
2. Clique em **Run workflow**
3. Selecione a branch e clique em **Run workflow**

### Domínio Personalizado

Para usar um domínio personalizado:

1. Em **Settings** → **Pages**
2. Em **Custom domain**, digite seu domínio
3. Configure o DNS do seu domínio para apontar para o GitHub Pages
4. Adicione um arquivo `CNAME` na raiz do repositório com seu domínio

### Proteção de Branch

Para garantir qualidade:

1. Vá para **Settings** → **Branches**
2. Adicione uma regra de proteção para `main`
3. Exija que os workflows passem antes do merge

## Solução de Problemas

### O site não carrega

- Verifique se o workflow foi executado com sucesso
- Confirme que o GitHub Pages está habilitado
- Aguarde alguns minutos após o deploy (pode haver cache)

### Assets não carregam (404)

- Verifique se o `base` no `vite.config.js` está configurado corretamente
- O workflow passa `GITHUB_PAGES=true` automaticamente
- Limpe o cache do navegador

### Workflow falha

- Verifique os logs em **Actions**
- Confirme que todas as dependências estão no `package.json`
- Teste localmente com `npm run build`

## Estrutura do Deploy

```
.github/
  workflows/
    deploy.yml          # Workflow de deploy
public/
  404.html              # Roteamento SPA para GitHub Pages
src/                    # Código fonte
dist/                   # Build de produção (gerado)
vite.config.js          # Configuração do Vite com base path dinâmico
```

## Variáveis de Ambiente

O workflow configura automaticamente:

- `GITHUB_PAGES=true`: Habilita configuração específica para GitHub Pages
- `GITHUB_REPOSITORY`: Usado para calcular o base path (ex: `usuario/repo`)

## Links Úteis

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
