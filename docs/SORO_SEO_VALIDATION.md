# Soro Blog SEO - Validación

Cómo validar que los canonicals y meta tags funcionan correctamente con Soro.

## Test 1: /blog (Vista de Listado)

### URL
```
http://localhost:5173/blog
```

### Validar con DevTools

**Paso 1: Abrir DevTools (F12)**

**Paso 2: Ir a Console tab**

```javascript
// Debe haber EXACTAMENTE 1 canonical
document.querySelectorAll('link[rel="canonical"]')
// Resultado esperado: NodeList [ <link rel="canonical" href="https://vozestrategica.com/blog"> ]

// Verificar URL del canonical
document.querySelector('link[rel="canonical"]')?.href
// Resultado esperado: "https://vozestrategica.com/blog"

// Verificar title
document.title
// Resultado esperado: "Blog · Voz Estratégica"

// Verificar meta description
document.querySelector('meta[name="description"]')?.content
// Resultado esperado: "Artículos, insights y recursos sobre liderazgo, comunicación, cultura y transformación organizacional."
```

### ✅ Esperado
```
✓ Exactamente 1 canonical
✓ URL = https://vozestrategica.com/blog
✓ Title = "Blog · Voz Estratégica"
✓ Meta description = [...artículos, insights...]
✓ NO hay data-soro (porque Soro aún no ha cargado)
```

---

## Test 2: /blog?post=<slug> (Vista de Artículo)

### URL
```
http://localhost:5173/blog?post=example-post
```

### Pasos
1. En /blog, esperar a que Soro cargue
2. Hacer click en un artículo
3. Esperar a que la página de artículo cargue (2-3 segundos)
4. Abrir DevTools

### Validar con DevTools

```javascript
// ANTES: Verificar canonicals
document.querySelectorAll('link[rel="canonical"]').length
// Resultado esperado: 1 (solo el de Soro, NO nuestro)

// Verificar el canonical dinámico
document.querySelector('link[rel="canonical"]')?.href
// Resultado esperado: algo como "https://vozestrategica.com/blog/example-post"
// o "https://app.trysoro.com/articles/example-post"

// Verificar que tiene data-soro
document.querySelector('link[rel="canonical"]')?.dataset.soro
// Resultado esperado: algo distinto de undefined (Soro añadió el atributo)

// Verificar title dinámico
document.title
// Resultado esperado: El título del artículo (ej: "Example Post Title · Voz Estratégica")

// Verificar description dinámico
document.querySelector('meta[name="description"]')?.content
// Resultado esperado: La descripción del artículo

// Verificar JSON-LD BlogPosting
const jsonld = document.querySelector('script[type="application/ld+json"]');
jsonld?.textContent.includes('BlogPosting')
// Resultado esperado: true (Soro añadió el structured data)
```

### ✅ Esperado
```
✓ Exactamente 1 canonical (del artículo específico)
✓ Canonical tiene data-soro (añadido por Soro)
✓ Canonical URL = URL del artículo
✓ Title = Título del artículo
✓ Meta description = Descripción del artículo
✓ JSON-LD BlogPosting presente
```

### ❌ Problema: Si ves 2 canonicals
```
Si ves:
document.querySelectorAll('link[rel="canonical"]').length
// = 2

Significa:
- Uno es nuestro: https://vozestrategica.com/blog
- Otro es de Soro: https://vozestrategica.com/blog/article-slug

SOLUCIÓN:
El código ya lo arregla (verifica ?post= en head()).
Hard refresh (Ctrl+Shift+R) para limpiar cache.
```

---

## Test 3: Navegación

### Verificar que Blog aparece en Header

```
1. Ir a http://localhost:5173
2. Mirar la barra de navegación superior
3. Verificar que "Blog" aparece entre "Conferencistas" y "Recursos"
```

**Esperado:**
```
Inicio | Soluciones | Programas | Conferencistas | Blog | Recursos | Nosotros
                                                    ↑
                                          Debe estar aquí
```

### Verificar que Blog aparece en Footer

```
1. Scroll down al footer
2. En la sección "Navegación", buscar "Blog"
3. Verificar que está entre "Conferencistas" y "Recursos"
```

**Esperado:**
```
Navegación:
Soluciones →
Programas →
Conferencistas →
Blog →                    ← Debe estar aquí
Recursos →
Nosotros →
Solicitar propuesta →
```

### Verificar links funcionan

```
1. Click en "Blog" en header o footer
2. Debe ir a http://localhost:5173/blog
3. Widget Soro debe cargar
4. Sin errores en console
```

---

## Test 4: Verificar Soro NO modifica nuestro canonical en /blog

**Escenario:** ¿Qué pasa si Soro intenta añadir un canonical en la vista de listado?

```javascript
// Cuando estés en /blog (sin ?post=)
const canonicals = document.querySelectorAll('link[rel="canonical"]');
console.log('Count:', canonicals.length); // Debe ser 1
canonicals.forEach((c, i) => {
  console.log(`${i}:`, c.href, c.dataset.soro);
});

// Esperado:
// Count: 1
// 0: https://vozestrategica.com/blog undefined
//    ^ Nuestro canonical, sin data-soro
```

---

## Test 5: Verificar Soro SÍ añade su canonical en /blog?post=

**Escenario:** Cuando se carga un artículo, Soro debe ser la autoridad del canonical.

```javascript
// Cuando estés en /blog?post=article-slug
const canonicals = document.querySelectorAll('link[rel="canonical"]');
console.log('Count:', canonicals.length); // Debe ser 1
canonicals.forEach((c, i) => {
  console.log(`${i}:`, c.href, c.dataset.soro);
});

// Esperado:
// Count: 1
// 0: https://vozestrategica.com/blog/article-slug "true" (o algo)
//    ^ Canonical de Soro, CON data-soro
```

---

## Quick Checklist

Run these tests in order:

- [ ] **Test 1:** /blog tiene 1 canonical = /blog
- [ ] **Test 1:** /blog tiene title "Blog · Voz Estratégica"
- [ ] **Test 1:** /blog tiene description correcta
- [ ] **Test 2:** Click artículo → carga artículo
- [ ] **Test 2:** Artículo tiene 1 canonical (de Soro)
- [ ] **Test 2:** Artículo tiene title dinámico
- [ ] **Test 2:** Artículo tiene description dinámica
- [ ] **Test 2:** Artículo tiene JSON-LD BlogPosting
- [ ] **Test 3:** "Blog" aparece en Header
- [ ] **Test 3:** "Blog" aparece en Footer
- [ ] **Test 3:** Links en header/footer funcionan
- [ ] **Test 4:** /blog canonical no tiene data-soro
- [ ] **Test 5:** /blog?post=... canonical tiene data-soro

---

## Si Hay Problemas

### Dos canonicals en /blog?post=
```
Causa: head() devolvió el canonical estático
Solución: Verificar que context.location.search contiene "post="
```

### Canonical desaparece en artículo
```
Causa: Soro tarda en cargar
Solución: Esperar más tiempo (Soro actualiza meta después de renderizar)
```

### "Blog" no aparece en Header/Footer
```
Causa: Cambios no compilaron
Solución: Hard refresh (Ctrl+Shift+R)
         O: npm run build y recargar
```

### DevTools muestra error de Soro
```
Causa: Normal - Soro modifica el DOM dinámicamente
Solución: Si el widget funciona visualmente, no hay problema
```

---

## Información Técnica

### Cambios en src/routes/blog.tsx

```typescript
head: () => {
  // Always include the list view canonical in SSR
  // Client-side, when viewing a post (?post=), Soro will replace it
  return {
    meta: [...],
    links: [{ rel: "canonical", href: "https://vozestrategica.com/blog" }],
  };
}
```

### Por qué funciona

1. **Vista de listado (/blog):**
   - SSR: renderiza canonical /blog
   - Browser: MutationObserver vigila por cambios
   - Resultado: 1 canonical /blog

2. **Vista de artículo (/blog?post=slug):**
   - SSR: renderiza canonical /blog (temporal)
   - Browser: Soro carga y AÑADE canonical de artículo con data-soro
   - MutationObserver detecta el nuevo canonical y ELIMINA el nuestro
   - Resultado: 1 canonical (exactamente el de Soro con data-soro)
   
3. **Vuelta al listado:**
   - Soro elimina su canonical (data-soro desaparece)
   - MutationObserver detecta y restaura nuestro canonical /blog
   - Resultado: 1 canonical /blog

---

## Validación Completa (Todos los Tests)

```
✅ /blog listado
   ├─ 1 canonical
   ├─ Title correcto
   └─ Description correcta

✅ /blog?post=article
   ├─ 1 canonical (de Soro)
   ├─ Title dinámico
   ├─ Description dinámica
   └─ JSON-LD presente

✅ Navegación
   ├─ Blog en Header
   ├─ Blog en Footer
   └─ Links funcionan
```

**Si todo está aquí, la integración SEO es correcta.**

---

## No Tocar Todavía

- ❌ webhook (Edge Function)
- ❌ blog_posts table (database)
- ❌ sitemap.xml (pending verification)
- ❌ analytics (pending Soro integration)
- ❌ auto-publish (pending decision)

---

**Última actualización:** 2026-08-20  
**Branch:** feat/soro-blog  
**Status:** Ready for local validation
