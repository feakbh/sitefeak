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

## Como Atualizar o Mural de Avisos

Abra o arquivo `pages/mural.html` e adicione um novo bloco **antes** dos avisos existentes, dentro da `<div class="mural-grid">`:

### Aviso só com texto:
```html
<div class="mural-card fade-in">
  <div class="mural-card-body">
    <p class="mural-date">16 de Março de 2026</p>
    <h3>Título do Aviso</h3>
    <p>Texto do aviso aqui.</p>
  </div>
</div>
```

### Aviso com imagem:
```html
<div class="mural-card fade-in">
  <img src="../images/nome-da-imagem.jpg" alt="Descrição">
  <div class="mural-card-body">
    <p class="mural-date">16 de Março de 2026</p>
    <h3>Título do Aviso</h3>
    <p>Texto do aviso aqui.</p>
  </div>
</div>
```

**Dica:** Imagens com proporção 16:10 (ex: 800x500px) ficam melhores nos cards.

### Para subir uma imagem do mural:
1. Salve a imagem na pasta `images/`
2. Faça commit e push no GitHub
3. O Cloudflare Pages atualiza automaticamente

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
