# Teste de filtros em multiplas tabelas

Este arquivo foi criado para testar os filtros no Reading View e no Live Preview.

## Instrucoes de teste

1. Abra esta nota no Reading View.
2. Abra filtros em tabelas diferentes.
3. Aplique filtros em duas ou mais colunas.
4. Abra um menu e clique fora sem aplicar.
5. Teste tabelas proximas de texto, listas e do final da pagina.

Texto antes da primeira tabela. O menu deve aparecer acima deste conteudo quando necessario.

## Tabela 1 - Projetos

| ID | Projeto | Status | Categoria | Regiao | Prioridade | Data | Responsavel | Observacoes |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Atlas | Open | Hardware | North | High | 2026-01-05 | Ana Silva | Requires approval |
| 2 | Boreal | Closed | Software | South | Low | 2026-01-12 | Bruno Costa | Replaced old license |
| 3 | Ceres | Pending | Services | East | Medium | 2026-01-19 | Carla Mendes | Waiting for a response |
| 4 | Delta | Open | Training | West | Low | 2026-01-26 | Diego Alves | New employee group |
| 5 | Eclipse | Cancelled | Hardware | Central | High | 2026-02-02 | Elisa Martins | Duplicate request |
| 6 | Farol | Open | Software | North | Medium | 2026-02-09 | Fabio Rocha | License available |
| 7 | Gaia | Pending | Services | South | Low | 2026-02-16 | Gabriela Lima | Contact unavailable |
| 8 | Horizonte | Closed | Training | East | Medium | 2026-02-23 | Hugo Nunes | Documentation available |
| 9 | Iris | Open | Hardware | West | High | 2026-03-02 | Isabela Souza | Requires manager review |
| 10 | Jatoba | Pending | Software | Central | Low | 2026-03-09 | Joao Oliveira | Trial account |
| 11 | Kairi | Open | Services | North | Medium | 2026-03-16 | Karen Alves | Waiting for customer |
| 12 | Lumen | Closed | Training | South | Low | 2026-03-23 | Lucas Mendes | Class postponed |
| 13 | Mirante | Open | Hardware | East | High | 2026-03-30 | Mariana Gomes | Spare parts available |
| 14 | Nimbus | Pending | Software | West | Medium | 2026-04-06 | Nicolas Costa | Not available this week |
| 15 | Orion | Closed | Services | Central | Low | 2026-04-13 | Olivia Santos | Auto-renewed |

Texto entre tabelas. Use este trecho para verificar se o menu fica acima de paragrafos e listas.

- Item de lista um
- Item de lista dois
- Item de lista com texto suficientemente longo para ocupar mais espaco visual na pagina

## Tabela 2 - Inventario

| Codigo | Produto | Tipo | Disponibilidade | Estoque | Local | Ultima atualizacao |
| :--- | :--- | :--- | :--- | ---: | :--- | :--- |
| A-001 | Notebook Pro | Hardware | Available | 18 | North | 2026-04-01 |
| A-002 | Monitor 27 | Hardware | Not available | 0 | South | 2026-04-02 |
| A-003 | Teclado Compacto | Hardware | Unavailable | 0 | East | 2026-04-03 |
| A-004 | Mouse Sem Fio | Hardware | Available | 42 | West | 2026-04-04 |
| A-005 | Dock USB-C | Hardware | Pending restock | 7 | Central | 2026-04-05 |
| A-006 | Licenca Editor | Software | Available | 125 | North | 2026-04-06 |
| A-007 | Licenca Design | Software | Not available | 0 | South | 2026-04-07 |
| A-008 | Licenca Analytics | Software | Available soon | 3 | East | 2026-04-08 |
| A-009 | Curso Inicial | Training | Available | 24 | West | 2026-04-09 |
| A-010 | Curso Avancado | Training | Not available | 0 | Central | 2026-04-10 |
| A-011 | Suporte Standard | Services | Available | 63 | North | 2026-04-11 |
| A-012 | Suporte Premium | Services | Unavailable | 0 | South | 2026-04-12 |

> Este bloco de citacao fica entre a segunda e a terceira tabela.

## Tabela 3 - Chamados

| Chamado | Data | Equipe | Severidade | Estado | SLA | Descricao |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- |
| 1001 | 2026-05-01 | Platform | Critical | Open | 2h | API unavailable for multiple users |
| 1002 | 2026-05-02 | Security | High | Investigating | 4h | Suspicious login notification |
| 1003 | 2026-05-03 | Support | Medium | Pending | 1d | User cannot access dashboard |
| 1004 | 2026-05-04 | Platform | Low | Closed | 3d | Minor visual alignment issue |
| 1005 | 2026-05-05 | Data | High | Open | 4h | Report export is incomplete |
| 1006 | 2026-05-06 | Support | Medium | Closed | 1d | Password reset delayed |
| 1007 | 2026-05-07 | Security | Critical | Investigating | 2h | Access policy not available |
| 1008 | 2026-05-08 | Platform | Low | Pending | 3d | Cache cleanup requested |
| 1009 | 2026-05-09 | Data | Medium | Open | 1d | Duplicate records in monthly view |
| 1010 | 2026-05-10 | Support | Low | Closed | 3d | Documentation update requested |

Texto longo depois da terceira tabela para testar menus no meio de outros conteudos. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Este texto nao deve interferir na abertura, posicionamento ou fechamento do menu.

## Tabela 4 - Valores e datas

| Registro | Data de inicio | Data de fim | Grupo | Quantidade | Valor | Observacao |
| ---: | :--- | :--- | :--- | ---: | ---: | :--- |
| 1 | 2026-06-01 | 2026-06-03 | A | 2 | 1250.50 | Confirmado |
| 2 | 2026-06-04 | 2026-06-10 | B | 15 | 89.99 | Revisar contrato |
| 3 | 2026-06-11 | 2026-06-14 | A | 4 | 430.00 | Aguardando resposta |
| 4 | 2026-06-15 | 2026-06-20 | C | 8 | 760.25 | Pagamento parcial |
| 5 | 2026-06-21 | 2026-06-30 | B | 21 | 2750.45 | Aprovacao pendente |
| 6 | 2026-07-01 | 2026-07-05 | A | 3 | 49.90 | Sem observacoes |
| 7 | 2026-07-06 | 2026-07-15 | C | 11 | 995.95 | Registro importado |
| 8 | 2026-07-16 | 2026-07-22 | B | 6 | 305.45 | Reconciliacao necessaria |

---

## Tabela 5 - Proxima ao final

| ID | Nome | Categoria | Status | Regiao | Nota |
| ---: | :--- | :--- | :--- | :--- | :--- |
| 1 | Alice | Alpha | Active | North | Texto curto |
| 2 | Bernardo | Beta | Inactive | South | Texto medio para testar largura |
| 3 | Cecilia | Gamma | Active | East | Texto longo para testar o posicionamento do menu perto do final da janela |
| 4 | Daniel | Alpha | Pending | West | Registro final de teste |
| 5 | Elena | Beta | Active | Central | Outra opcao para filtros combinados |

Clique no filtro da ultima tabela com a janela posicionada no final do documento. O menu deve abrir para cima quando nao houver espaco abaixo do cabecalho.
