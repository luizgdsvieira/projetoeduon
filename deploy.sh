# Script para fazer deploy da API no Render
# Execute este script após fazer commit das mudanças

echo "🚀 Fazendo deploy da API EDUON para o Render..."

# 1. Verificar se há mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Há mudanças não commitadas. Fazendo commit..."
    git add .
    git commit -m "feat: adicionar rota raiz e melhorar CORS para produção"
fi

# 2. Fazer push para o repositório
echo "📤 Fazendo push para o repositório..."
git push origin main

echo "✅ Deploy iniciado! Aguarde alguns minutos para a API atualizar no Render."
echo "🔗 URL da API: https://projetoeduon.onrender.com"
echo "🧪 Teste a API: https://projetoeduon.onrender.com/health"
