<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=180&color=0:0F2A40,55:2C5282,100:8B1E2D&text=Portf%C3%B3lio&fontColor=F1E6C8&fontSize=52&fontAlignY=40&desc=Camilla%20Paschoal%20%C2%B7%20Design%20de%20Social%20Media&descSize=17&descAlignY=62&animation=fadeIn" alt="Portfólio · Camilla Paschoal · Design de Social Media" width="100%">
</p>

<p align="center">
  <a href="https://ccpaschoal.github.io/"><img src="https://img.shields.io/badge/Ver%20o%20site-ccpaschoal.github.io-8B1E2D?style=for-the-badge&logo=githubpages&logoColor=F1E6C8" alt="Ver o site"></a>
  <img src="https://img.shields.io/badge/HTML-0F2A40?style=for-the-badge&logo=html5&logoColor=F1E6C8" alt="HTML">
  <img src="https://img.shields.io/badge/CSS-2C5282?style=for-the-badge&logo=css&logoColor=F1E6C8" alt="CSS">
  <img src="https://img.shields.io/badge/JavaScript-1A3A52?style=for-the-badge&logo=javascript&logoColor=F1E6C8" alt="JavaScript">
</p>

Meu portfólio de **design de social media**: carrosséis, posts e identidade visual para redes sociais. O site foi feito em HTML, CSS e JavaScript, sem frameworks, e é publicado pelo GitHub Pages.

## ✨ Destaques

- Telas em tela cheia com transição vertical, sem rolagem tradicional
- Carrosséis de trabalhos reais que você arrasta para o lado
- Títulos animados letra por letra
- Modo claro e escuro
- Tipografia em **Montserrat**
- Responsivo para celular, tablet e computador

## 🎨 Paleta

| Cor | Hex |
| --- | --- |
| Azul-marinho | `#0F2A40` |
| Azul | `#2C5282` |
| Azul-céu | `#6BA3D8` |
| Vinho | `#8B1E2D` |
| Areia | `#F1E6C8` |
| Dourado | `#D9B65C` |

## 📁 Estrutura

```
├── index.html          # conteúdo do site
├── styles/style.css    # estilos, cores e animações
├── scripts/app.js      # carrosséis, transições e modo escuro
├── robots.txt          # orientação de rastreamento
├── sitemap.xml         # URL canônica para buscadores
├── .env.example        # explica por que não há variáveis necessárias hoje
└── assets/             # foto, ícones e imagens dos carrosséis
```

## 💻 Ver no computador

Abra o `index.html` no navegador, ou rode um servidor local:

```bash
python -m http.server 8000 --bind 127.0.0.1
# acesse http://localhost:8000
```

O servidor acima é apenas para desenvolvimento local. Ele serve a pasta inteira,
inclusive `.git` e eventuais arquivos `.env`: não compartilhe essa porta nem exponha
esse servidor à internet. O `.gitignore` protege o versionamento, não o acesso HTTP.

## Configurações e segurança

Não há instalação, build, framework, dependência de produção, API autenticada ou
variável de ambiente obrigatória. Não é necessário criar `.env`. O `.env.example`
contém somente instruções, sem credenciais ou variáveis sem uso.

- Conteúdo, contatos e URLs públicos: `index.html`.
- Design tokens e temas: `styles/style.css`, em `:root` e `[data-theme='dark']`.
- Comportamento e configurações de interação: `scripts/app.js`.
- Armazenamento no navegador: somente a preferência pública `tema`.
- Arquivos `.env` e variantes são ignorados; a exceção versionada é `.env.example`.

Nunca coloque credenciais em HTML, CSS, JavaScript, assets, URLs, mensagens de erro
ou valores substituídos no build. Uma variável de ambiente copiada para o JavaScript
continua pública. Se uma integração futura exigir segredo, faça a operação no
servidor e conceda somente as permissões necessárias. Não armazene tokens privados
no `localStorage`. Caso uma credencial vaze, removê-la do código não basta:
é necessário avaliar revogação/rotação no serviço, com autorização do responsável.

A CSP em `index.html` permite recursos locais e o hash do script inicial de tema.
Se alterar esse script inline, recalcule seu hash; alterações em `scripts/app.js`
não exigem outro hash. Atualize os parâmetros `?v=` do CSS e JS ao mudar esses arquivos.

## Testes e manutenção

Os testes de navegador existentes ficam fora deste repositório, em
`Desktop/6 - TESTES E2E`, e usam Playwright, axe e o Edge instalado. Nessa pasta:

```powershell
npx.cmd --no-install playwright test estaticos.spec.js portfolio.spec.js --grep "Portfólio"
```

A configuração compartilhada inicia também os outros projetos. Os arquivos de
teste do portfólio cobrem carregamento/CSP, navegação, lightbox, foco, pausa,
movimento reduzido, retomada do celular decorativo e WCAG automatizada.
Os testes axe complementam a verificação manual com teclado, zoom e leitor de tela;
não certificam conformidade WCAG completa. Não há ESLint/Prettier configurados.
Para verificar a sintaxe do JavaScript sem instalar dependências:

```powershell
node --check scripts/app.js
```

Os números sem JavaScript devem acompanhar as regras de `initCounters`: projetos
são os carrosséis principais mais os quatro sites; slides excluem as versões
panorâmicas duplicadas. Novos projetos exigem atualizar também os números estáticos.

## Hospedagem e eventual Netlify

A publicação atual continua sendo GitHub Pages. `robots.txt`, `sitemap.xml`,
canonical e metadados apontam para `https://ccpaschoal.github.io/`. Uma migração de
domínio exige revisar esses endereços juntos; as seções com `#` não são páginas separadas.

Não há configuração Netlify ativa nem variável a cadastrar no painel hoje.
Se optar por migrar, revise o domínio canônico e publique somente `index.html`,
`styles/`, `scripts/`, `assets/`, `robots.txt` e `sitemap.xml` em uma pasta dedicada.
Não publique a raiz de uma cópia local que contenha `.git`, `.env`, backups ou logs.
O site não precisa de comando de build para funcionar nem de redirecionamento
genérico para `index.html`: páginas inexistentes devem continuar retornando 404.

Somente se uma integração real precisar de credenciais, cadastre-as no painel,
com escopo Functions quando disponível, e leia-as exclusivamente no servidor.
Não adicione segredos a `netlify.toml` nem a arquivos públicos. Documentação:
[variáveis em Functions](https://docs.netlify.com/build/functions/environment-variables/).
Avalie `X-Content-Type-Options`, `Referrer-Policy` e CSP via headers na migração;
defina proteção contra iframe somente após decidir se o portfólio poderá ser incorporado.
Não é necessário migrar a hospedagem para aplicar as correções locais.

## 💌 Contato

[WhatsApp](https://wa.me/5521982566564) · [Email](mailto:camillacpaschoal@gmail.com) · [Instagram](https://instagram.com/camillapaschoal) · [LinkedIn](https://www.linkedin.com/in/camillapaschoal/)

<sub>© 2026 Camilla Paschoal. Todos os direitos reservados.</sub>
