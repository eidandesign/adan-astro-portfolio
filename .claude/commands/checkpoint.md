---
description: Build + commit + push a main (Vercel auto-despliega)
argument-hint: "[mensaje de commit opcional]"
---

# /checkpoint

Build, commit y push de los cambios actuales a producción (Vercel auto-despliega desde `main`).

Si hay muchos cambios acumulados y no se corrió `/review` en esta sesión, sugerirlo antes de continuar (pero no bloquear si el usuario quiere seguir).

## Pasos

1. Correr `npm run build` para verificar que no hay errores. Si el build falla, detenerse y reportar los errores — NO commitear.
2. Correr `git status` y `git diff` para revisar qué cambió. Confirmar que no se cuela nada ajeno al trabajo de la sesión.
3. Mensaje de commit: si el usuario pasó uno como argumento ($ARGUMENTS), usarlo; si no, redactar uno conciso (1–2 oraciones) que describa qué cambió y por qué.
4. Stagear los archivos siendo explícito — evitar `git add -A` si hay archivos untracked que no deberían ir.
5. Commitear con el mensaje.
6. Push a `origin main`.
7. Confirmar que el push funcionó (hash + link al repo) y recordar que Vercel va a auto-desplegar en ~1 minuto.

## Reglas

- Nunca saltarse el build.
- Nunca hacer force-push.
- Nunca usar `--no-verify`.
- Si hay archivos untracked que parecen sensibles (`.env`, credenciales, `.claude/` con datos privados), avisar al usuario y excluirlos.
- Terminar el mensaje de commit con la línea `Co-Authored-By` del modelo Claude activo.
