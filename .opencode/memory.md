# Memória do Projeto — servico-facil

## [2026-07-09 00:12] - Configuração de Memória Automática

**Assunto:** Configuramos o sistema de memória automática para o opencode salvar resumos das conversas por projeto.

**Decisões:**
- Memória separada por projeto, cada um com seu próprio `.opencode/memory.md`
- Configuração global em `~\.config\opencode\` com regra compartilhada
- A regra mantém as últimas 10 conversas no arquivo de memória

**Próximos passos:**
- Reiniciar o opencode para carregar a nova configuração global
- Aproveitar o sistema nas próximas conversas em qualquer projeto

**Arquivos modificados:**
- `~\.config\opencode\opencode.json` (criado)
- `~\.config\opencode\rules\memory.md` (criado)
- `servico-facil\.opencode\memory.md` (criado)
---
