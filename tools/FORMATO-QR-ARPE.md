# Especificación del QR del ticket — ARPE Gas (para incluir en el sistema de tickets)

La app de recompensas **ARPE Gas** lee el código QR impreso en el ticket para
registrar la carga y acreditar puntos. Para poder otorgar **1 punto por litro**, el
QR debe incluir el dato de **litros cargados**.

## Formato requerido (v2)

El QR debe contener un **texto plano** con los campos separados por barra vertical
`|`, empezando y terminando con `|`:

```
|permiso|empresa|fecha|hora|litros|subtotal|iva|total|firma|
```

### Campos (en este orden exacto)

| # | Campo    | Descripción                                   | Ejemplo                         |
|---|----------|-----------------------------------------------|---------------------------------|
| 1 | permiso  | Permiso / identificador de la estación        | `P00778`                        |
| 2 | empresa  | Razón social                                  | `CORPORATIVO ARPE, S.A. DE C.V.`|
| 3 | fecha    | Fecha de la carga (dd/mm/aaaa)                | `04/06/2025`                    |
| 4 | hora     | Hora de la carga (HH:MM)                       | `10:32`                         |
| 5 | **litros** | **Litros cargados, con 3 decimales (NUEVO)** | `6.330`                       |
| 6 | subtotal | Subtotal en pesos                             | `129.81`                        |
| 7 | iva      | IVA en pesos                                   | `20.19`                         |
| 8 | total    | Total en pesos                                 | `150.00`                        |
| 9 | firma    | Firma/hash único del ticket (anti-duplicado)   | `tT7IecYK+CAJW4PXULHRHzNz4Rl3QncFL1rT2/2lFiQ=` |

### Ejemplo completo

```
|P00778|CORPORATIVO ARPE, S.A. DE C.V.|04/06/2025|10:32|6.330|129.81|20.19|150.00|tT7IecYK+CAJW4PXULHRHzNz4Rl3QncFL1rT2/2lFiQ=|
```

## Qué cambia respecto al QR actual

El QR actual tiene **8 campos** (sin litros):

```
|permiso|empresa|fecha|hora|subtotal|iva|total|firma|
```

**El único cambio necesario es insertar el campo `litros` inmediatamente después de
`hora` (posición 5), antes de `subtotal`.** El resto queda igual.

## Reglas importantes

- **litros**: número decimal con punto (no coma). Idealmente 3 decimales, tal como
  aparece en el ticket impreso (ej. `6.330 LTR`). Debe ser el litraje real de la carga.
- **firma**: debe ser **única por ticket**. La app usa este valor para impedir que un
  mismo ticket se registre dos veces. Puede ser el hash que ya generan hoy.
- El texto va **tal cual** dentro del QR (sin URL, sin JSON). Barras `|` al inicio y al
  final.
- Codificación recomendada del QR: nivel de corrección **M**, texto UTF-8.

## Cómo pedirlo (texto sugerido para el proveedor del punto de venta)

> "Necesitamos agregar al contenido del código QR del ticket el campo de **litros
> cargados**, insertándolo justo después de la hora y antes del subtotal, quedando el
> orden: permiso, empresa, fecha, hora, **litros**, subtotal, IVA, total, firma; todos
> separados por `|`. El valor de litros debe ir con punto decimal (ej. `6.330`),
> reflejando el litraje real de la carga."

## Probar sin esperar a ARPE

Usa `qr-generator.html` (en esta misma carpeta) para crear QRs de prueba con litros y
firma única, y escanéalos desde la app.
