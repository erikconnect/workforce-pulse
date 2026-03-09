# 🚀 Quickstart - Testando as Melhorias

## ⚡ 5 Passos para Ver as Mudanças

### 1️⃣ **Inicie o Backend**
```bash
cd backend
npm install  # se não tiver
npm run dev
# Output esperado: Server running on http://localhost:5000
```

### 2️⃣ **Inicie o Frontend**
```bash
# Em outro terminal
npm install  # se não tiver
npm run dev
# Output esperado: ▲ Next.js 16.0 on http://localhost:3000
```

### 3️⃣ **Acesse a Página**
```
http://localhost:3000/sectors
```

### 4️⃣ **Teste as Mudanças**

#### 🎨 Teste 1: Responsividade
- Abra DevTools (F12)
- Mude para mobile (375px)
  - Cards em coluna única ✓
  - Filtros empilhados ✓
  - Badges não quebram ✓
- Mude para tablet (768px)
  - Grid 2 colunas ✓
  - Filtros em linha ✓
- Mude para desktop (1280px)
  - Grid 3-4 colunas ✓
  - Layout two-column ✓

#### 💬 Teste 2: Tooltips
- Passe mouse sob:
  - Score do Pulse ➜ Tooltip aparece
  - Badge de Status ➜ Descrição
  - Número de Open Roles ➜ Explicação
  - WoW Change ➜ Contexto
  - Training ➜ "Training programs available"
  - Readiness % ➜ "% of skills with training"

#### ✨ Teste 3: Hover Effects
- Passe mouse em um card de setor
  - Levanta suavemente (translate-y)
  - Shadow aparece
  - Texto fica highlighted
- Passe mouse em badges
  - Cor muda
  - Border fica mais visível

#### 🎯 Teste 4: Animações
- Abra a página pela primeira vez
  - Cards entram com slideInUp
  - Execução delays escalonados (50ms)
- Executive Signals
  - Ícone Sparkles pulsando
  - Cards com hover transition suave

#### 🔄 Teste 5: Comparação
- Clique em "Compare Sectors"
- Selecione 2 setores
  - Comparison panel aparece
  - Tooltips nos cards
  - Gráfico é responsivo

---

## 📊 O Que Você Vai Ver

### Top Section: Sector Intelligence
```
┌─────────────────────────────────────────┐
│ 📊 Sector Intelligence                  │
│ Sectors                                 │
│ Monitor workforce health...             │
│                                         │
│ 127K workforce │ 1,245 open roles      │
│ 2 critical     │ 45K exposed workers   │
│                                         │
│ ┌─ Highest-demand jobs ──────────┐    │
│ │ Manufacturing Manager   5 open │    │
│ │ Software Developer (Remote) 12 │    │
│ └────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

### Right Section: Executive Signals
```
┌──────────────────────┐
│ ✨ Executive Signals │
│                      │
│ 📊 Sector Points: 45 │
│ "45 actions"        │
│                      │
│ 💡 Quick Win        │
│ "Compare: +12 pts"  │
│                      │
│ Sector Radar        │
│ • Demand: 65%      │
│ • Growth: 45%      │
│ • Criticality: 78% │
│                      │
│ ⚠️ Highest pressure │
│ Manufacturing       │
│ "145 open roles"   │
└──────────────────────┘
```

### Bottom: Sector Cards Grid
```
┌─────────────┬─────────────┬─────────────┐
│ 🏭 Manufac. │ 👨‍💼 Retail    │ 🏥 Healthcare │
│ Score: 75   │ Score: 52   │ Score: 88   │
│ Critical    │ Watch       │ Stable      │
│ 145 open    │ 89 open     │ 42 open     │
│ 12.5K work  │ 8.3K work   │ 6.1K work   │
│ +12% WoW    │ -3% WoW     │ +5% WoW     │
└─────────────┴─────────────┴─────────────┘
```

---

## 🔍 Como Verificar os Dados Reais

### No Console do Browser (DevTools)
```javascript
// Verificar dados em React Query
// Abra DevTools > Console

// Encontre a query "sectors"
window.__NEXT_DATA__.props.pageProps.dehydratedState.queries[0]

// Output esperado:
{
  queryKey: ["sectors"],
  queryFn: ...,
  state: {
    data: [
      {
        id: "manufacturing",
        name: "Manufacturing",
        pulseScore: 75,
        status: "critical",
        openRolesCount: 145,
        ...
      },
      ...
    ]
  }
}
```

### No Network Tab
```
GET http://localhost:5000/api/v1/sectors

Status: 200 OK
Response:
{
  "success": true,
  "data": [
    {
      "id": "manufacturing",
      "kpis": [
        { "label": "WoW Change", "value": "12%", "delta": 12 }
      ],
      "sparklineData": [50, 55, 60, 65, 68, 72, 75]
    }
  ]
}
```

---

## 🎯 Checklist de Validação

### Responsividade ✓
- [ ] Mobile (375px): Cards empilhados verticalmente
- [ ] Tablet (768px): 2 colunas
- [ ] Desktop (1024px): Layout two-column
- [ ] Large (1280px+): 3-4 colunas

### Interatividade ✓
- [ ] Tooltips aparecem no hover
- [ ] Cards levantam no hover
- [ ] Sombras aparecem
- [ ] Cores mudam em hover

### Dados ✓
- [ ] Setores carregam
- [ ] Scores aparecem (0-100)
- [ ] Status badges corretos (Critical/Watch/Stable)
- [ ] WoW Change % aparece
- [ ] Open roles conta correta

### Animações ✓
- [ ] Cards entram com slide suave
- [ ] Sparkles pulsando
- [ ] Transições suaves (300ms)
- [ ] Sem saltos ou glitches

### Compare Mode ✓
- [ ] Botão "Compare Sectors" funciona
- [ ] Posso selecionar 2 setores
- [ ] Chart de comparação aparece
- [ ] Tooltips nos cards

---

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| Página branca | Backend rodando? Verificar console |
| Dados não carregam | `NEXT_PUBLIC_API_URL` configurado? |
| Tooltips não aparecem | Verificar `src/components/ui/tooltip.tsx` |
| Mobile layout ruim | Limpar cache (Ctrl+Shift+Delete) |
| Estilos cortados | Tailwind CSS compilou? npm run build |
| Socket error 5000 | Backend não rodando na porta 5000 |

---

## 📱 Simuladores de Dispositivos

### iPhone 12 (390px)
```
DevTools > Shift+Cmd+M > Apple iPhone 12
```

### iPad (768px)
```
DevTools > iPad Pro (1024px) > redimensione para 768px
```

### Desktop Focado (1920px)
```
DevTools > Desktop > 1920x1080
```

---

## 🎬 Demonstração Rápida (2 minutos)

1. Abra http://localhost:3000/sectors (desktop)
2. Veja os 8 setores em grid 3 colunas
3. Passe mouse em qualquer score - tooltip aparece
4. Clique "Compare Sectors"
5. Selecione Manufacturing e Healthcare
6. Veja comparison side-by-side
7. Redimensione para mobile (375px)
8. Veja cards em coluna única
9. Role para cima - veja Executive Signals com emoji
10. Pronto! ✓

---

## 💡 Dicas

**Para ver dados mockados (sem backend):**
```bash
# Editar .env.local
NEXT_PUBLIC_USE_STUBS=true
```

**Para forçar reload de dados:**
```javascript
// No console:
localStorage.clear()
location.reload()
```

**Para debug de React Query:**
```bash
npm install @tanstack/react-query-devtools
# Aparecerá floating button no canto da página
```

---

## 🚨 Esperado em Produção

Quando deploiado (Vercel):
- Responsividade funciona em todos os devices
- Tooltips funcionam no touch (mobile)
- Dados carregam da API remota
- Cache otimizado para performance
- Analytics rastreiam usage

---

**Divirta-se testando! 🎉**
