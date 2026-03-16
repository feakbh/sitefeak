# FEAKBH — Site da Fraternidade Espírita Allan Kardec

Site estático hospedado via **GitHub + Cloudflare Pages**.

---

## Estrutura do Projeto

```
feakbh-site/
├── index.html              ← Página principal
├── css/
│   └── style.css           ← Estilos globais
├── js/
│   └── main.js             ← JavaScript (menu mobile, animações)
├── pages/
│   ├── atividades.html     ← Todas as atividades da casa
│   ├── cascata-de-luz.html ← 16 artigos da série Cascata de Luz
│   ├── downloads.html      ← Obras de Kardec, Revistas, Apostilas
│   ├── mural.html          ← Quadro de avisos e notícias
│   └── contato.html        ← Endereço, mapa e redes sociais
├── images/                 ← Imagens do site e do mural
├── downloads/              ← PDFs hospedados localmente (futuro)
└── README.md               ← Este arquivo
```

---

## Como Atualizar o Mural de Avisos (Carrossel na Home)

O mural aparece como carrossel na página inicial (`index.html`), logo após o hero.
Para adicionar um novo aviso, abra `index.html` e cole um bloco **como primeiro item** dentro de `<div class="mural-track" id="muralTrack">`:

### Modelo COM imagem:
```html
<div class="mural-slide">
  <img class="mural-slide-img" src="images/minha-foto.jpg" alt="Descrição da imagem">
  <div class="mural-slide-body">
    <span class="mural-slide-tag destaque">Destaque</span>
    <h3>Título do Aviso</h3>
    <p>Texto do aviso aqui. Pode ter várias linhas.</p>
    <a href="https://link-opcional.com" class="mural-slide-link">Saiba mais →</a>
    <div class="mural-slide-date">16 de Março de 2026</div>
  </div>
</div>
```

### Modelo SEM imagem (com emoji e cor):
```html
<div class="mural-slide">
  <div class="mural-slide-color">🔔</div>
  <div class="mural-slide-body">
    <span class="mural-slide-tag aviso">Aviso</span>
    <h3>Título do Aviso</h3>
    <p>Texto aqui.</p>
    <div class="mural-slide-date">Março 2026</div>
  </div>
</div>
```

### Tags disponíveis:
| Classe | Cor | Uso |
|---|---|---|
| `destaque` | Dourada | Notícias importantes |
| `aviso` | Verde | Avisos gerais |
| `campanha` | Azul escuro | Campanhas e ações |
| `evento` | Vermelha | Eventos e datas |

### Para cor de fundo personalizada (sem imagem):
```html
<div class="mural-slide-color" style="background:linear-gradient(135deg,#COR1,#COR2)">📢</div>
```

### Dicas:
- Imagens: proporção 16:9 (ex: 800x450px) ficam perfeitas
- Salve imagens na pasta `images/`
- O carrossel funciona com drag/swipe no celular
- Avisos mais novos devem ficar PRIMEIRO na lista

---

## Como Adicionar PDFs para Download

### Opção A — Manter links do site atual (atual)
Os downloads apontam para `https://feakbh.com/Download/...`. Funciona enquanto o servidor antigo estiver ativo.

### Opção B — Hospedar PDFs localmente (recomendado)
1. Salve os PDFs na pasta `downloads/`
2. Atualize os links nos HTMLs de `https://feakbh.com/Download/arquivo.pdf` para `../downloads/arquivo.pdf` (ou `/downloads/arquivo.pdf` se estiver no index)
3. Commit + push

---

## Deploy (Cloudflare Pages)

O site já está configurado para deploy automático:
- Cada `git push` no branch principal dispara um novo deploy
- Não precisa de build command (é HTML estático)
- SSL/HTTPS é automático
- O domínio `feakbh.com` deve estar apontado para o Cloudflare Pages

---

## Referência Rápida de Edição

| O que quer fazer | Arquivo para editar |
|---|---|
| Mudar texto da página inicial | `index.html` |
| Adicionar aviso no mural | `pages/mural.html` |
| Adicionar novo livro/PDF | `pages/downloads.html` |
| Adicionar artigo na Cascata | `pages/cascata-de-luz.html` |
| Mudar cores ou fontes | `css/style.css` (variáveis no topo) |
| Atualizar endereço/contato | `pages/contato.html` |

---

**Paz e Luz!** ✨
