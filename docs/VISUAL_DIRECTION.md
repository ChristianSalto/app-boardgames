# Dirección visual — Fundación

## Concepto

La atmósfera del prototipo se define como **club contemporáneo de juegos de mesa**: un lugar cercano y cuidado donde personas reales pueden encontrarse alrededor de una afición compartida. Debe transmitir confianza, comunidad, calidad, seriedad y personalidad sin convertirse en una interfaz temática.

**Mesa Abierta continúa siendo un nombre provisional.** Esta fundación no constituye una identidad corporativa definitiva ni un sistema de diseño completo.

## Personalidad

- Cálida y acogedora, no infantil.
- Editorial y contemporánea, no corporativa fría.
- Relacionada con el hobby mediante geometría abstracta, no mediante iconos literales.
- Sobria y fiable, sin perder carácter.

## Paleta

La paleta se centraliza en 01-settings mediante tokens semánticos:

- **Fondo profundo:** verde bosque #12372d.
- **Fondo de contenido:** crema mineral #eee8dc.
- **Superficies:** hueso #fff9ef, beige secundario #e9e2d6 y elevado #fffcf6.
- **Texto:** verde tinta #192b25, secundario #53615b y texto sobre oscuro #fff8ec.
- **Marca:** verde #245c49, verde profundo #153c31 y verde suave #d7e6dc.
- **Acento:** terracota #c45f3c; la mostaza #d6a541 queda reservada para énfasis puntuales.
- **Estados:** una familia contenida para éxito, aviso, error e información, siempre acompañada de texto o iconografía comprensible.

Los nombres anteriores del prototipo se mantienen como alias temporales para evitar un refactor de componentes durante esta iteración.

## Tipografía

- **UI y cuerpo:** Aptos, Segoe UI Variable Text, Segoe UI y alternativas seguras del sistema.
- **Display y títulos:** Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia y serif genérica.
- La serif aporta una voz editorial en hero y encabezados; la sans mantiene claridad en controles, metadata y contenido.
- La escala se limita a xs, sm, cuerpo, destacado y tres niveles de encabezado. Se conservan interlineados amplios en lectura y compactos en títulos.

No se descargan fuentes ni se depende de servicios externos.

## Superficies

El contenido se apoya en crema mineral con una textura geométrica tenue. Las superficies secundarias separan estados y agrupaciones; las superficies elevadas se reservan para cards, formularios y paneles principales. El contraste procede de la combinación de tono, borde y una sombra suave, no de acumular cajas blancas idénticas.

## Radios, bordes y sombras

- **Radios:** pequeño 0.65rem, medio 1rem y grande 1.5rem.
- **Borde base:** 1px con un tono piedra cálido; existe una variante más marcada para controles.
- **Sombras:** tres niveles como máximo: baja para selección, media para cards y alta para contenedores destacados.

Los radios buscan una sensación amable y cuidada sin convertir todos los elementos en píldoras.

## Lenguaje gráfico

La base admite líneas diagonales, puntos, círculos y planos inspirados de forma abstracta en tableros, mesas y cartas. El patrón general se percibe como textura y queda detrás del contenido. No se incorporan todavía ilustraciones, iconos temáticos grandes ni decoración específica de juegos.

## Relación con la referencia

Se recoge la atmósfera aprobada —verde bosque y oliva, crema cálido, acento terracota, superficies amplias, jerarquía editorial y textura sutil— sin copiar una composición, componente o marca concreta. La reinterpretación prioriza la claridad de una comunidad para quedar y jugar.

## Qué evitar

- estética infantil, fantasy, medieval, casino o gamer RGB;
- dados, meeples u otros símbolos repetidos como decoración dominante;
- sombras duras y capas excesivas;
- demasiados colores de estado;
- texto con poco contraste sobre fondos cálidos u oscuros;
- radios extremos que resten seriedad.

## Accesibilidad

La fundación mantiene el objetivo WCAG 2.2 AA. Texto principal, secundario y sobre fondos oscuros utilizan combinaciones de alto contraste; los estados no dependen solo del color. El foco combina contorno azul y halo claro para conservar visibilidad tanto en superficies crema como verdes. Los controles mantienen bordes perceptibles y tipografía de sistema legible.

## Navegación y orientación

- En desktop, la marca provisional abre Explorar y cede protagonismo al contenido. La navegación agrupa Explorar, Mis partidas y Perfil como enlaces ligeros; Crear partida queda separado mediante un divisor y se trata como CTA compacto.
- El destino activo combina peso tipográfico y un indicador de forma, no solo un cambio de color. Hover y foco conservan targets cómodos sin convertir cada enlace en un botón independiente.
- En mobile se mantienen los cuatro destinos inferiores aprobados. Crear recibe un énfasis moderado dentro de la misma retícula, sin convertirse en botón flotante. La cabecera superior no permanece fija para evitar duplicar navegación persistente.
- Los detalles y perfiles ajenos utilizan breadcrumbs semánticos de dos o tres niveles. Los niveles anteriores son enlaces y el último identifica la página actual sin enlazarse.
- «Prototipo» permanece como etiqueta discreta; Mesa Abierta continúa siendo un nombre provisional y no un branding definitivo.

## Filtros y formularios

- Inputs, selects, textarea y triggers visuales comparten altura, padding, borde, radio y estados de interacción. Los controles nativos de fecha y hora se conservan por su accesibilidad y adecuación móvil.
- Los filtros mantienen únicamente juego, fecha y zona. Juego es búsqueda textual con limpieza directa; fecha usa botones con `aria-pressed`, check visible y wrapping natural en móvil.
- Zona/distrito utiliza un selector visual reutilizable con patrón combobox/listbox, navegación por flechas, selección con Enter, apertura con Space y cierre con Escape o pérdida de interacción.
- Crear partida agrupa los campos en una columna móvil y una retícula simple de dos columnas en desktop. Madrid se presenta como contexto fijo, no como input deshabilitado.
- Lugar permanece separado de zona y descripción y solicita un nombre reconocible, no una dirección postal. El aforo explica explícitamente que quien organiza ocupa una plaza.
- Los errores aparecen junto al campo, se asocian mediante `aria-describedby` y añaden texto e indicador gráfico para no depender solo del color.

## Decisiones provisionales

- El nombre, la marca gráfica y la identidad corporativa definitivos.
- El uso exacto de verde oliva frente al verde principal.
- La proporción final entre serif editorial y sans en cada componente.
- La intensidad del patrón tras probarlo en dispositivos y condiciones de luz reales.
- Qué detalles gráficos propios del hobby aportan reconocimiento sin convertirse en ornamentación.
- La asignación final de tokens a cada componente, que se realizará en iteraciones específicas sin alterar esta fundación.
