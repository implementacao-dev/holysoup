# Ajustes HolySoup — Sidecart Shopify Bundles

**Data:** 21/05/2026

**Referência (estado anterior):** `holysoup_bkp_19052026/snippets/side-cart-item.liquid`

---

## Resumo dos ajustes realizados

- Implementado toggle **Mostrar X itens / Ocultar itens** no sidecart (padrão Yampi), **somente** para linhas de carrinho com componentes (`item.item_components`).
- `X` = soma das quantidades dos componentes do kit (`component.quantity`), ex.: 4+4+4+4 → **"Mostrar 16 itens"**.
- Kits/produtos normais (sem `item_components`) permanecem com o layout original.
- Lista de componentes expande/recolhe com animação **`max-height`** (0 → 480px, 0,5s), sem `x-show` / `display: none` na lista.
- Lista aberta com scroll interno quando passa de 480px; scrollbar oculta (scroll funcional).
- Exibição por componente: quantidade, nome (fallback seguro) e imagem 40px quando disponível.
- Labels do toggle com classe `bundle-components-toggle__label` e `min-width: 120px` + `display: inline-block` para evitar “pulo” ao alternar “Mostrar X itens” / “Ocultar itens”.
- **Nenhum outro arquivo do tema foi alterado** (`side-cart.liquid` apenas validado no fluxo de refresh).

## Fora do escopo (não entregue / desfeito)

- Página de carrinho completa, ERP, admin Bundles.
- Estilo Yampi (`holder-bundles`, `display: flex/none` inline).
- Gradiente/sombra no rodapé da lista (`::after` + detecção de overflow) — **desfeito**.

---

## Arquivo alterado

| Arquivo | Alterado? |
|---------|-----------|
| `snippets/side-cart-item.liquid` | Sim |
| `snippets/side-cart.liquid` | Não |

---

## 1) Detecção de item Bundle (Liquid)

### Arquivo
`snippets/side-cart-item.liquid`

### Antes
```liquid
  assign loading = 'lazy'
  endif
%}
```

*(Não existia flag `is_bundle_item`.)*

### Depois
```liquid
  assign loading = 'lazy'
  endif

  assign is_bundle_item = false
  assign bundle_items_count = 0
  if item.item_components != blank and item.item_components.size > 0
    assign is_bundle_item = true
    for component in item.item_components
      assign component_qty = component.quantity | default: 1
      assign bundle_items_count = bundle_items_count | plus: component_qty
    endfor
  endif
%}
```

**Regras:**
- `is_bundle_item == true` apenas quando `item.item_components` existe e tem tamanho > 0.
- `bundle_items_count` = soma de `component.quantity` (não multiplica por `item.quantity` da linha no carrinho — igual Yampi).

---

## 2) Alpine: estado do toggle

### Arquivo
`snippets/side-cart-item.liquid`

### Antes
```javascript
{
  quantity: {{ item.quantity | default: 1 }},
  handleChangeQuantity(quantity) {
```

### Depois
```javascript
{
  quantity: {{ item.quantity | default: 1 }},
  isBundleOpen: false,
  handleChangeQuantity(quantity) {
```

**Comportamento:** inicia **fechado**; alterna no clique do botão.

---

## 3) Classe condicional no item (layout bundle)

### Arquivo
`snippets/side-cart-item.liquid`

### Antes
```html
  class="side-cart-item-product"
```

### Depois
```html
  class="side-cart-item-product{% if is_bundle_item %} side-cart-item-product--bundle{% endif %}"
```

---

## 4) Markup: toggle + lista de componentes (novo bloco)

### Arquivo
`snippets/side-cart-item.liquid`

### Antes
```liquid
      </div>
    </div>
  </div>
  <div class="item-product-quantity">
```

*(Após preço do produto, ia direto para o bloco de quantidade — sem toggle nem lista.)*

### Depois
```liquid
      </div>

      {% if is_bundle_item %}
        <button
          type="button"
          class="bundle-components-toggle"
          @click="isBundleOpen = !isBundleOpen"
          :aria-expanded="isBundleOpen ? 'true' : 'false'"
          aria-controls="bundle-components-{{ key }}"
        >
          <span
            class="bundle-components-toggle__label"
            :class="{ 'bundle-components-toggle__label--hidden': isBundleOpen }"
          >
            Mostrar {{ bundle_items_count }}
            {%- if bundle_items_count == 1 %} item{% else %} itens{% endif -%}
          </span>
          <span
            class="bundle-components-toggle__label"
            :class="{ 'bundle-components-toggle__label--hidden': !isBundleOpen }"
          >Ocultar itens</span>
          <svg class="bundle-components-chevron" :class="{ 'is-open': isBundleOpen }" viewBox="0 0 10 6" aria-hidden="true">
            <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <div
          id="bundle-components-{{ key }}"
          class="bundle-components-wrapper"
          :class="{ 'bundle-components-wrapper--open': isBundleOpen }"
        >
          <div class="bundle-components-list">
            {% for component in item.item_components %}
              {% liquid
                assign component_title = component.product.title | default: component.title | default: 'Item do kit'
                assign component_image = component.image
                if component_image == blank and component.product != blank
                  assign component_image = component.product.featured_image
                endif
                assign component_qty = component.quantity | default: 1
              %}
              <div class="bundle-component-row">
                <div class="bundle-component-thumb">
                  {% if component_image != blank %}
                    {{ component_image | image_url: width: 80 | image_tag: loading: 'lazy', alt: component_title }}
                  {% endif %}
                </div>
                <div class="bundle-component-text">
                  {{ component_qty }}x {{ component_title }}
                </div>
              </div>
            {% endfor %}
          </div>
        </div>
      {% endif %}
    </div>
  </div>
  <div class="item-product-quantity">
```

**Estrutura:**
- Botão toggle (texto + chevron).
- Wrapper `.bundle-components-wrapper` (altura animada).
- Filho `.bundle-components-list` (itens do kit).

**Textos do toggle (Yampi):**
- Fechado: `Mostrar {{ bundle_items_count }} item` ou `Mostrar {{ bundle_items_count }} itens`.
- Aberto: `Ocultar itens` (sem número).

**Anti-pulo no botão:** ambos os `<span>` usam `class="bundle-components-toggle__label"`; o estado visível alterna via `bundle-components-toggle__label--hidden` (equivalente a `display: none` só no rótulo, não na lista).

**Fallbacks:** título `component.product.title` → `component.title` → `'Item do kit'`; imagem `component.image` → `component.product.featured_image`.

---

## 5) CSS: layout do item + estilos do bundle

### Arquivo
`snippets/side-cart-item.liquid` (`{% style %}`)

### Antes
```css
  .side-cart-item-product {
    display: flex;
    justify-content: space-between;
  }
```

*(Sem regras `.bundle-*` nem `.side-cart-item-product--bundle`.)*

### Depois
```css
  .side-cart-item-product {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .side-cart-item-product--bundle {
    align-items: flex-start;
  }

  .side-cart-item-product--bundle .item-product-info {
    align-items: flex-start;
  }

  .bundle-components-toggle { /* botão Mostrar/Ocultar */ }

  .bundle-components-toggle__label {
    display: inline-block;
    min-width: 120px;
  }

  .bundle-components-toggle__label--hidden { display: none; }

  .bundle-components-chevron {
    transition: transform 0.5s ease-in-out;
  }
  .bundle-components-chevron.is-open {
    transform: rotate(180deg);
  }

  .bundle-components-wrapper {
    width: 100%;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.5s ease-in-out;
  }

  .bundle-components-wrapper--open {
    max-height: 480px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .bundle-components-wrapper--open::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }

  .bundle-components-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px 0 10px 4px;
    width: 100%;
  }

  .bundle-component-row {
    display: grid;
    grid-template-columns: 40px 1fr;
    gap: 8px;
  }

  .bundle-component-thumb img {
    width: 40px;
    max-height: 40px;
    object-fit: contain;
  }

  .bundle-component-text {
    font-size: 12px;
    color: #6b7280;
  }
```

**Animação:** `max-height` 0 ↔ 480px em 0,5s (sem `display: none` na lista).

**Scroll:** só no wrapper aberto; barra invisível, scroll por toque/roda do mouse mantido.

**Toggle (largura estável):** `min-width: 120px` cobre textos como “Mostrar 16 itens”; ajustar para `130px` se kits com contagem maior ainda “pularem”.

---

## 6) O que não mudou (garantia de não regressão)

| Área | Status |
|------|--------|
| Cálculo de preço (`final_price`, compare-at) | Inalterado |
| Quantidade (`handleChangeQuantity`, `$store.cart.updateItem`) | Inalterado |
| Checkout / Yampi / `side-cart.liquid` | Inalterado |
| Itens sem `item_components` | Markup e CSS de bundle não renderizam |

---

## Compatibilidade com refresh do sidecart

O `side-cart.liquid` continua re-renderizando itens via `fetch('/?view=cart')` e `{% render 'side-cart-item' %}`. Cada item novo recebe `isBundleOpen: false` no `x-data` — toggle volta fechado após add/update/remove.

---

## Resultado funcional esperado

| Cenário | Esperado |
|---------|----------|
| Produto normal | Sem toggle; layout como antes |
| Kit legado (sem `item_components`) | Sem toggle |
| Bundle Shopify Bundles | Toggle “Mostrar X itens” (X = soma dos componentes), fechado por padrão; ao abrir, “Ocultar itens” + lista (qtd + nome + imagem) |
| Muitos componentes | Scroll dentro de 480px, sem barra visível |
| Mobile | Toggle clicável; animação e scroll utilizáveis |

---

## Rollback

Reverter apenas `snippets/side-cart-item.liquid`:

- Backup do live antes do deploy (recomendado), ou
- `holysoup_bkp_19052026/snippets/side-cart-item.liquid`

```bash
shopify theme push --store holysoup.myshopify.com --theme 140142674100 --only snippets/side-cart-item.liquid --path <pasta_do_backup>
```

---

## Teste local

```bash
shopify theme dev --store holysoup.myshopify.com
```

Preview: `https://holysoup.myshopify.com/?preview_theme_id=<id_do_tema_dev>`

**Pré-requisito admin:** bundle publicado no app Shopify Bundles com `item_components` no carrinho.
